// MOCK of the Supabase services the server talks to (NOT real Supabase): enough PostgREST + GoTrue to exercise the
// server functions over HTTP. Tokens are HS256 JWTs signed with SECRET; `factors`/`aal` claims drive the MFA rules.
import crypto from "node:crypto";
import http from "node:http";

export const SECRET = "e2e-test-secret";
export const b64 = (o) => Buffer.from(JSON.stringify(o)).toString("base64url");
export function mint(claims, secret = SECRET) {
  const head = b64({ alg: "HS256", typ: "JWT" });
  const body = b64({ exp: Math.floor(Date.now() / 1000) + 3600, role: "authenticated", ...claims });
  return `${head}.${body}.${crypto.createHmac("sha256", secret).update(`${head}.${body}`).digest("base64url")}`;
}

const DEFAULTS = {
  site_projects: () => ({ status: "Livré", scope: [], featured: false }),
  team_members: () => ({ group_name: "Études" }),
  media_assets: () => ({ kind: "image" }),
  contact_requests: () => ({ status: "nouveau" }),
  site_content: () => ({ value: "" }),
  profiles: () => ({ role: "user" }),
};

export function startFakeSupabase(port) {
  const db = Object.fromEntries(Object.keys(DEFAULTS).map((t) => [t, []]));
  const calls = { invite: [], rest: [] };
  const users = new Map(); // id -> {id,email,factors}

  const json = (res, status, body, headers = {}) => {
    res.writeHead(status, { "content-type": "application/json", ...headers });
    res.end(body === undefined ? "" : JSON.stringify(body));
  };
  const matches = (row, params) => {
    for (const [key, value] of params) {
      if (["select", "order", "on_conflict", "limit", "offset"].includes(key)) continue;
      const [op, ...rest] = value.split(".");
      const expected = rest.join(".");
      if (op === "eq" && String(row[key]) !== expected) return false;
      if (op === "neq" && String(row[key]) === expected) return false;
    }
    return true;
  };

  const server = http.createServer(async (req, res) => {
    const url = new URL(req.url, "http://x");
    let raw = "";
    for await (const chunk of req) raw += chunk;

    // ---- GoTrue
    if (url.pathname === "/auth/v1/user" && req.method === "GET") {
      const token = (req.headers.authorization ?? "").replace(/^Bearer /i, "");
      const [h, p, s] = token.split(".");
      const ok = s && crypto.createHmac("sha256", SECRET).update(`${h}.${p}`).digest("base64url") === s;
      if (!ok) return json(res, 401, { code: 401, error_code: "bad_jwt", msg: "invalid JWT" });
      const claims = JSON.parse(Buffer.from(p, "base64url").toString());
      if (claims.exp < Date.now() / 1000) return json(res, 401, { code: 401, error_code: "bad_jwt", msg: "expired" });
      return json(res, 200, { id: claims.sub, email: claims.email, created_at: "2026-01-01T00:00:00Z", user_metadata: claims.user_metadata ?? {}, factors: claims.factors ?? [] });
    }
    if (url.pathname === "/auth/v1/invite" && req.method === "POST") {
      const body = JSON.parse(raw || "{}");
      calls.invite.push(body);
      if (body.email === "exists@example.com") return json(res, 422, { code: 422, error_code: "email_exists", msg: "A user with this email address has already been registered" });
      const user = { id: crypto.randomUUID(), email: body.email, created_at: "2026-01-01T00:00:00Z" };
      db.profiles.push({ id: user.id, email: user.email, role: "user", full_name: null });
      return json(res, 200, user);
    }

    // ---- PostgREST
    const m = url.pathname.match(/^\/rest\/v1\/(\w+)$/);
    if (!m || !db[m[1]]) return json(res, 404, { code: "PGRST205", message: "not found" });
    const table = m[1];
    calls.rest.push(`${req.method} ${table}${url.search}`);
    const wantsObject = (req.headers.accept ?? "").includes("vnd.pgrst.object");
    const prefer = req.headers.prefer ?? "";
    const rows = db[table];
    const project = (row) => {
      const select = url.searchParams.get("select");
      if (!select || select === "*") return row;
      return Object.fromEntries(select.split(",").map((c) => [c.trim(), row[c.trim()]]));
    };
    const reply = (list, status = 200) => {
      if (wantsObject) return list.length === 1 ? json(res, status, list[0]) : json(res, 406, { code: "PGRST116", message: "JSON object requested, multiple (or no) rows returned" });
      return json(res, status, list);
    };

    if (req.method === "GET" || req.method === "HEAD") {
      let list = rows.filter((row) => matches(row, url.searchParams));
      const order = url.searchParams.get("order");
      if (order) {
        const [col, dir] = order.split(".");
        list = [...list].sort((a, b) => (String(a[col]) < String(b[col]) ? -1 : 1) * (dir === "desc" ? -1 : 1));
      }
      if (req.method === "HEAD") return (res.writeHead(200, { "content-range": `*/${list.length}` }), res.end());
      return reply(list.map(project));
    }
    if (req.method === "POST") {
      const body = JSON.parse(raw || "[]");
      const incoming = Array.isArray(body) ? body : [body];
      const onConflict = url.searchParams.get("on_conflict");
      const out = incoming.map((item) => {
        const existing = onConflict ? rows.find((r) => r[onConflict] === item[onConflict]) : null;
        if (existing) return Object.assign(existing, item);
        const row = { id: crypto.randomUUID(), created_at: new Date().toISOString(), updated_at: new Date().toISOString(), ...DEFAULTS[table](), ...item };
        rows.push(row);
        return row;
      });
      return prefer.includes("return=representation") ? reply(out.map(project), 201) : (res.writeHead(201), res.end());
    }
    if (req.method === "PATCH") {
      const list = rows.filter((row) => matches(row, url.searchParams));
      list.forEach((row) => Object.assign(row, JSON.parse(raw || "{}"), { updated_at: new Date().toISOString() }));
      return prefer.includes("return=representation") ? reply(list.map(project)) : (res.writeHead(204), res.end());
    }
    if (req.method === "DELETE") {
      for (const row of rows.filter((r) => matches(r, url.searchParams))) rows.splice(rows.indexOf(row), 1);
      return (res.writeHead(204), res.end());
    }
    return json(res, 405, {});
  });

  return new Promise((resolve) => server.listen(port, "127.0.0.1", () => resolve({ db, calls, users, close: () => server.close() })));
}

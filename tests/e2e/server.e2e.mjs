// End-to-end over HTTP against the PRODUCTION BUILD (.output) with MOCKED Supabase services (tests/e2e/fake-supabase.mjs).
// Run `npm run build` first. This does not touch a real Supabase project.
import { spawn } from "node:child_process";
import { readFileSync, readdirSync } from "node:fs";
import { fromCrossJSON, toJSON } from "seroval";
import { mint, startFakeSupabase } from "./fake-supabase.mjs";

const FAKE = 54325;
const APP = 4195;
const fake = await startFakeSupabase(FAKE);
const ADMIN = "00000000-0000-4000-8000-0000000000a1";
const USER = "00000000-0000-4000-8000-0000000000b2";
const MFA = "00000000-0000-4000-8000-0000000000c3";
fake.db.profiles.push(
  { id: ADMIN, email: "admin@x.io", role: "admin", full_name: "Admin" },
  { id: USER, email: "user@x.io", role: "user", full_name: "User" },
  { id: MFA, email: "mfa@x.io", role: "admin", full_name: "Mfa Admin" },
);
const tokens = {
  admin: mint({ sub: ADMIN, email: "admin@x.io", aal: "aal1" }),
  user: mint({ sub: USER, email: "user@x.io" }),
  mfaAal1: mint({ sub: MFA, email: "mfa@x.io", aal: "aal1", factors: [{ status: "verified" }] }),
  mfaAal2: mint({ sub: MFA, email: "mfa@x.io", aal: "aal2", factors: [{ status: "verified" }] }),
  forged: mint({ sub: ADMIN, email: "admin@x.io" }, "wrong-secret"),
  expired: mint({ sub: ADMIN, email: "admin@x.io", exp: 1 }),
};

// server-function ids come from the build itself
const ids = {};
const dir = new URL("../../.output/server/_ssr/", import.meta.url);
for (const file of readdirSync(dir).filter((f) => f.endsWith(".mjs"))) {
  for (const m of readFileSync(new URL(file, dir), "utf8").matchAll(/id:\s*"([a-f0-9]{64})",\s*name:\s*"(\w+)"/g)) ids[m[2]] = m[1];
}

const server = spawn("node", [".output/server/index.mjs"], {
  env: { ...process.env, PORT: String(APP), SUPABASE_URL: `http://127.0.0.1:${FAKE}`, SUPABASE_SERVICE_ROLE_KEY: "svc-key" },
  stdio: "ignore",
});
for (let i = 0; i < 40; i++) {
  if (await fetch(`http://127.0.0.1:${APP}/robots.txt`).then((r) => r.ok, () => false)) break;
  await new Promise((r) => setTimeout(r, 500));
}

async function call(name, data, token, method = "POST") {
  const headers = { "x-tsr-serverFn": "true", accept: "application/json" };
  if (token) headers.authorization = `Bearer ${token}`;
  let url = `http://127.0.0.1:${APP}/_serverFn/${ids[name]}`;
  const payload = toJSON({ data, context: {} });
  const init = { method, headers };
  if (method === "POST") (headers["content-type"] = "application/json"), (init.body = JSON.stringify(payload));
  else if (data !== undefined) url += `?payload=${encodeURIComponent(JSON.stringify(payload))}`;
  const res = await fetch(url, init);
  const text = await res.text();
  let body;
  let error;
  try {
    const decoded = fromCrossJSON(JSON.parse(text), { refs: new Map() });
    body = decoded?.result;
    error = decoded?.error;
  } catch {
    body = text;
  }
  return { status: res.status, body, error };
}

let pass = 0, fail = 0;
const check = (label, ok, extra = "") => (ok ? pass++ : fail++, console.log(`${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `  <-- ${extra}`}`));
const KEY = /key:\s*"([^"]+)"/.exec(readFileSync(new URL("../../src/content/registry.js", import.meta.url), "utf8"))[1]; // a real, editable content key
const project = { title: "Projet E2E", slug: "projet-e2e", year: 2025, category: "Industrie", location: "Fès", status: "En cours", image: "https://x/y.jpg", summary: "s", description: "d", scope: ["CVC"], featured: true, display_order: 3 };

check("all 17 server functions found in the build", Object.keys(ids).length >= 17, Object.keys(ids).join(","));

// ---- authentication / authorization on every admin function
const adminCalls = [
  ["saveSiteContent", { updates: [{ key: KEY, value: "x" }] }],
  ["saveProject", project], ["deleteProject", { id: USER }],
  ["saveTeamMember", { name: "Nom", role: "Role", group: "Direction" }], ["deleteTeamMember", { id: USER }],
  ["createMedia", { kind: "image", url: "https://x/y.jpg" }], ["deleteMedia", { id: USER }],
  ["inviteUser", { email: "new@x.io", role: "admin" }],
  ["setContactRequestStatus", { id: USER, status: "traite" }], ["deleteContactRequest", { id: USER }],
];
for (const [name, data] of adminCalls) {
  const anon = await call(name, data);
  check(`${name}: anonymous -> 401`, anon.status === 401, anon.status);
  for (const [who, tok] of [["forged token", tokens.forged], ["expired token", tokens.expired], ["admin with MFA but aal1", tokens.mfaAal1]]) {
    const r = await call(name, data, tok);
    check(`${name}: ${who} -> 401`, r.status === 401, r.status);
  }
  const nonAdmin = await call(name, data, tokens.user);
  check(`${name}: signed-in non-admin -> 403`, nonAdmin.status === 403, nonAdmin.status);
}
for (const name of ["listMedia", "getAdminOverview", "listContactRequests"]) {
  check(`${name}: anonymous -> 401`, (await call(name, undefined, undefined, "GET")).status === 401);
  check(`${name}: non-admin -> 403`, (await call(name, undefined, tokens.user, "GET")).status === 403);
}
check("no row was written by any rejected call", fake.db.site_projects.length + fake.db.team_members.length + fake.db.media_assets.length === 0 && fake.calls.invite.length === 0);

// ---- admin CRUD
const A = tokens.admin;
let r = await call("saveProject", project, A);
check("admin: create project", r.status === 200 && r.body?.ok && r.body.id, JSON.stringify(r));
const pid = r.body?.id;
r = await call("saveProject", { ...project, id: pid, title: "Projet E2E modifié" }, A);
check("admin: update project", r.status === 200 && fake.db.site_projects[0].title === "Projet E2E modifié", JSON.stringify(r));
r = await call("saveProject", { ...project, id: "00000000-0000-4000-8000-00000000dead" }, A);
check("admin: update of unknown project -> 404", r.status === 404, r.status);
r = await call("saveProject", { ...project, slug: "Pas Valide" }, A);
check("admin: invalid slug rejected by validation", r.status === 400 && !fake.db.site_projects.some((p) => p.slug === "Pas Valide"), r.status);
r = await call("getProjects", undefined, undefined, "GET");
check("public: list projects", r.status === 200 && r.body?.[0]?.title === "Projet E2E modifié" && r.body[0].created_date, JSON.stringify(r).slice(0, 200));
r = await call("saveTeamMember", { name: "Nom Prénom", role: "Directeur", group: "Direction", display_order: 1 }, A);
const tid = r.body?.id;
check("admin: create team member (group -> group_name)", r.status === 200 && fake.db.team_members[0].group_name === "Direction");
r = await call("getTeam", undefined, undefined, "GET");
check("public: team exposes `group`", r.body?.[0]?.group === "Direction" && !("group_name" in r.body[0]));
r = await call("saveSiteContent", { updates: [{ key: KEY, value: "Nouveau titre" }, { key: "not.in.registry", value: "x" }] }, A);
check("admin: save content (registry keys only)", r.status === 200 && r.body.saved === 1 && fake.db.site_content.length === 1, JSON.stringify(r));
r = await call("saveSiteContent", { updates: [{ key: KEY, value: "Titre 2" }] }, A);
check("admin: content upsert keeps one row", fake.db.site_content.length === 1 && fake.db.site_content[0].value === "Titre 2");
r = await call("getSiteContent", undefined, undefined, "GET");
check("public: read content", r.body?.[KEY] === "Titre 2", JSON.stringify(r));
r = await call("createMedia", { kind: "image", url: "https://x.supabase.co/storage/v1/object/public/media/uploads/a.jpg", title: "A" }, A);
const mid = r.body?.id;
check("admin: create media", r.status === 200 && mid);
r = await call("listMedia", undefined, A, "GET");
check("admin: list media (created_date alias)", r.status === 200 && r.body?.[0]?.created_date, JSON.stringify(r).slice(0, 200));
r = await call("submitQuoteRequest", { full_name: "Visiteur", email: "v@x.io", phone: "0600000000", service: "Piscines", message: "Bonjour, un devis svp." });
check("public: contact form stores a request (status nouveau)", r.status === 200 && fake.db.contact_requests[0]?.status === "nouveau" && r.body.reference, JSON.stringify(r));
r = await call("submitQuoteRequest", { full_name: "V", email: "not-an-email", phone: "1", service: "Autre", message: "x" });
check("public: invalid contact form rejected (400, nothing stored)", r.status === 400 && fake.db.contact_requests.length === 1, r.status);
r = await call("listContactRequests", undefined, A, "GET");
const reqId = r.body?.[0]?.id;
check("admin: list contact requests (newest first, created_date alias)", r.status === 200 && r.body.length === 1 && r.body[0].full_name === "Visiteur" && r.body[0].created_date, JSON.stringify(r).slice(0, 200));
r = await call("setContactRequestStatus", { id: reqId, status: "traite" }, A);
check("admin: mark a request as handled", r.status === 200 && fake.db.contact_requests[0].status === "traite", r.status);
r = await call("setContactRequestStatus", { id: reqId, status: "bogus" }, A);
check("admin: invalid status rejected (400)", r.status === 400, r.status);
r = await call("setContactRequestStatus", { id: "00000000-0000-4000-8000-00000000dead", status: "traite" }, A);
check("admin: status of unknown request -> 404", r.status === 404, r.status);
r = await call("setContactRequestStatus", { id: reqId, status: "nouveau" }, A);
check("admin: reopen a request", r.status === 200 && fake.db.contact_requests[0].status === "nouveau");
r = await call("getAdminOverview", undefined, A, "GET");
check("admin: overview counts", r.status === 200 && r.body.projects === 1 && r.body.media === 1 && r.body.requests === 1 && r.body.openRequests === 1, JSON.stringify(r));
r = await call("saveProject", project, tokens.mfaAal2);
check("admin with MFA + aal2 session is accepted", r.status === 200, r.status);

// ---- invite
r = await call("inviteUser", { email: "New@X.io", role: "admin" }, A);
const invited = fake.db.profiles.find((p) => p.email === "new@x.io");
check("admin: invite -> e-mail normalised, profile promoted to admin server-side", r.status === 200 && invited?.role === "admin" && fake.calls.invite.at(-1).email === "new@x.io", JSON.stringify(r));
r = await call("inviteUser", { email: "u2@x.io", role: "user" }, A);
check("admin: invite as plain user stays user", fake.db.profiles.find((p) => p.email === "u2@x.io")?.role === "user");
r = await call("inviteUser", { email: "exists@example.com", role: "user" }, A);
check("invite of an existing address -> 409", r.status === 409, r.status);
r = await call("inviteUser", { email: "bad", role: "root" }, A);
check("invite: invalid input rejected (400)", r.status === 400, r.status);

// ---- deletes
check("admin: delete project", (await call("deleteProject", { id: pid }, A)).status === 200 && fake.db.site_projects.length === 1 - 1 + 1 - 1 + (fake.db.site_projects.length > 0 && fake.db.site_projects[0].id !== pid ? 1 : 0));
check("admin: delete team member", (await call("deleteTeamMember", { id: tid }, A)).status === 200 && fake.db.team_members.length === 0);
check("admin: delete contact request", (await call("deleteContactRequest", { id: reqId }, A)).status === 200 && fake.db.contact_requests.length === 0);
check("admin: delete media", (await call("deleteMedia", { id: mid }, A)).status === 200 && fake.db.media_assets.length === 0);
check("db errors never reach the client", !JSON.stringify((await call("deleteProject", { id: "not-a-uuid" }, A)).body).includes("relation"));

server.kill();
fake.close();
console.log(`\n${pass} passed, ${fail} failed (services MOCKED)`);
process.exit(fail ? 1 : 0);

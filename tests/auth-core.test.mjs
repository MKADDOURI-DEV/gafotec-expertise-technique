import assert from "node:assert/strict";
import test from "node:test";
import { HttpError, assertAdmin, bearerToken, jwtClaims, resolveUser } from "../src/lib/auth-core.js";

const b64 = (o) => Buffer.from(JSON.stringify(o)).toString("base64url");
const jwt = (claims = {}) => `${b64({ alg: "HS256" })}.${b64({ sub: "u1", ...claims })}.sig`;

// Fake service-role client: auth.getUser + from("profiles").select().eq().maybeSingle()
function fakeDb({ user, authError, profile, profileError } = {}) {
  return {
    auth: { getUser: async () => ({ data: { user: authError ? null : user }, error: authError ?? null }) },
    from: (table) => {
      assert.equal(table, "profiles");
      const q = { select: () => q, eq: () => q, maybeSingle: async () => ({ data: profile ?? null, error: profileError ?? null }) };
      return q;
    },
  };
}
const authUser = (extra = {}) => ({ id: "u1", email: "a@b.co", created_at: "2026-01-01", factors: [], ...extra });

test("bearerToken accepts only Bearer + JWT shape", () => {
  const t = jwt();
  assert.equal(bearerToken(`Bearer ${t}`), t);
  assert.equal(bearerToken(`bearer ${t}`), t);
  for (const bad of [null, "", "Bearer", "Bearer abc", `Basic ${t}`, `Bearer ${t} extra`]) assert.equal(bearerToken(bad), null);
});

test("jwtClaims decodes, and never throws on garbage", () => {
  assert.equal(jwtClaims(jwt({ aal: "aal2" })).aal, "aal2");
  assert.deepEqual(jwtClaims("garbage"), {});
});

test("resolveUser: anonymous / rejected tokens are signed out (null), not errors", async () => {
  assert.equal(await resolveUser(null, fakeDb()), null);
  for (const authError of [{ status: 401 }, { status: 403 }, { code: "bad_jwt" }, { name: "AuthSessionMissingError" }]) {
    assert.equal(await resolveUser(jwt(), fakeDb({ authError })), null, JSON.stringify(authError));
  }
  assert.equal(await resolveUser(jwt(), fakeDb({ user: null })), null);
});

test("resolveUser: outages propagate instead of looking like 'signed out'", async () => {
  await assert.rejects(resolveUser(jwt(), fakeDb({ authError: Object.assign(new Error("down"), { status: 503 }) })));
  await assert.rejects(resolveUser(jwt(), fakeDb({ user: authUser(), profileError: new Error("db down") })));
});

test("resolveUser: role comes from profiles only; anything but 'admin' is a plain user", async () => {
  const admin = await resolveUser(jwt(), fakeDb({ user: authUser(), profile: { role: "admin", full_name: "A", created_at: "2026-02-02" } }));
  assert.deepEqual([admin.id, admin.role, admin.full_name, admin.created_date], ["u1", "admin", "A", "2026-02-02"]);
  assert.equal((await resolveUser(jwt(), fakeDb({ user: authUser(), profile: { role: "user" } }))).role, "user");
  assert.equal((await resolveUser(jwt(), fakeDb({ user: authUser(), profile: null }))).role, "user");
  assert.equal((await resolveUser(jwt(), fakeDb({ user: authUser(), profile: { role: "superadmin" } }))).role, "user");
  // a role claimed in user_metadata is ignored
  const meta = authUser({ user_metadata: { role: "admin" } });
  assert.equal((await resolveUser(jwt(), fakeDb({ user: meta, profile: { role: "user" } }))).role, "user");
});

test("resolveUser: a verified MFA factor requires an aal2 session", async () => {
  const withFactor = authUser({ factors: [{ status: "verified" }] });
  const profile = { role: "admin" };
  assert.equal(await resolveUser(jwt({ aal: "aal1" }), fakeDb({ user: withFactor, profile })), null);
  assert.equal(await resolveUser(jwt(), fakeDb({ user: withFactor, profile })), null);
  assert.equal((await resolveUser(jwt({ aal: "aal2" }), fakeDb({ user: withFactor, profile }))).role, "admin");
  // an unverified (abandoned) enrolment does not lock the account
  assert.ok(await resolveUser(jwt({ aal: "aal1" }), fakeDb({ user: authUser({ factors: [{ status: "unverified" }] }), profile })));
});

test("assertAdmin: 403 for everyone but admins", () => {
  assertAdmin({ role: "admin" });
  for (const user of [{ role: "user" }, {}, null, undefined, { role: "ADMIN" }]) {
    assert.throws(() => assertAdmin(user), (e) => e instanceof HttpError && e.status === 403 && e.code === "FORBIDDEN");
  }
});

// Static guard: every server function that touches non-public data must run requireUser, then assertAdmin,
// BEFORE the service-role client is created. Public functions are listed explicitly.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const PUBLIC = new Set(["getSiteContent", "getProjects", "getTeam", "submitQuoteRequest", "getServerInfo"]);

function serverFns(path) {
  const source = readFileSync(new URL(`../src/${path}`, import.meta.url), "utf8");
  const parts = source.split(/^export const /m).slice(1);
  return parts.filter((part) => part.includes("createServerFn")).map((part) => ({ name: part.split(" ")[0], body: part, path }));
}
const all = ["lib/content-fns.js", "lib/server-fns.js", "lib/user-fns.js"].flatMap(serverFns);

test("found the server functions", () => assert.ok(all.length >= 14, `only ${all.length} found`));

for (const fn of all) {
  if (PUBLIC.has(fn.name)) {
    test(`${fn.name} is public by design and never exposes a write to anonymous callers beyond the quote form`, () => {
      const writes = /\.(insert|update|upsert|delete)\(/.test(fn.body) || /write(?!Quote)[A-Z]\w*\(/.test(fn.body);
      assert.equal(writes, false);
    });
    continue;
  }
  test(`${fn.name}: requireUser -> assertAdmin -> service role`, () => {
    assert.match(fn.body, /\.middleware\(\[requireUser\]\)/);
    const admin = fn.body.indexOf("assertAdmin(context.user)");
    const db = fn.body.indexOf("getAdminDb()");
    assert.ok(admin > -1, "assertAdmin missing");
    assert.ok(db > admin, "service-role client must be created after assertAdmin");
  });
}

test("every function in the gated files is classified (no silently public function)", () => {
  for (const fn of all) assert.ok(PUBLIC.has(fn.name) || fn.body.includes("requireUser"), `${fn.name} is neither public nor gated`);
});

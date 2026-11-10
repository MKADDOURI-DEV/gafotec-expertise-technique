import assert from "node:assert/strict";
import test from "node:test";
import { readContent, readMedia, readProjects, readTeam, toError, writeContent, writeProject, writeTeamMember } from "../src/lib/data-api.js";

// Minimal fake of the supabase-js query builder: records calls, resolves from `reply(table, calls)`.
function fakeDb(reply) {
  const calls = [];
  return {
    calls,
    from(table) {
      const log = { table, ops: [] };
      calls.push(log);
      const q = new Proxy(
        {},
        {
          get: (_, op) => {
            if (op === "then") return (resolve, reject) => Promise.resolve(reply(table, log.ops)).then(resolve, reject);
            return (...args) => (log.ops.push([op, ...args]), q);
          },
        },
      );
      return q;
    },
  };
}

test("projects: sorted by display_order then year, missing order last, scope always an array", async () => {
  const rows = [
    { id: "a", year: 2020, display_order: null, scope: null, created_at: "c1", updated_at: "u1" },
    { id: "b", year: 2022, display_order: 2, scope: ["x"] },
    { id: "c", year: 2019, display_order: 2, scope: [] },
    { id: "d", year: 2021, display_order: 1, scope: [] },
  ];
  const out = await readProjects(fakeDb(() => ({ data: rows })));
  assert.deepEqual(out.map((p) => p.id), ["d", "c", "b", "a"]);
  assert.deepEqual(out.at(-1).scope, []);
  assert.equal(out.at(-1).created_date, "c1"); // UI compatibility alias
});

test("team: group_name is exposed as `group`", async () => {
  const out = await readTeam(fakeDb(() => ({ data: [{ id: "1", name: "n", group_name: "Direction", display_order: 1 }] })));
  assert.equal(out[0].group, "Direction");
  assert.equal("group_name" in out[0], false);
});

test("team write maps group -> group_name; update of a missing row is a 404", async () => {
  const db = fakeDb((t, ops) => (ops.some(([o]) => o === "update") ? { data: [] } : { data: { id: "new" } }));
  assert.equal(await writeTeamMember(db, { name: "n", role: "r", group: "Études" }), "new");
  assert.deepEqual(db.calls[0].ops.find(([o]) => o === "insert")[1], { name: "n", role: "r", group_name: "Études" });
  await assert.rejects(writeTeamMember(db, { id: "x", name: "n", role: "r", group: "Études" }), (e) => e.status === 404);
});

test("project write: update when id is given, insert otherwise; unique violation -> 409 with a French message", async () => {
  const db = fakeDb((t, ops) => (ops.some(([o]) => o === "update") ? { data: [{ id: "p1" }] } : { data: { id: "p2" } }));
  assert.equal(await writeProject(db, { id: "p1", title: "t" }), "p1");
  assert.equal(await writeProject(db, { title: "t" }), "p2");
  const dup = fakeDb(() => ({ error: { code: "23505", message: 'duplicate key "site_projects_slug_key"' } }));
  await assert.rejects(writeProject(dup, { title: "t" }), (e) => e.status === 409 && e.message === "Cet identifiant existe déjà.");
});

test("db errors never leak SQL details to the client", () => {
  const e = toError({ code: "XX000", message: 'relation "secret_table" exploded' });
  assert.equal(e.message, "Erreur serveur");
  assert.equal(e.status, 500);
});

test("content: only registry keys are written, duplicates collapse (last wins), one upsert on `key`", async () => {
  const db = fakeDb(() => ({ data: null }));
  const saved = await writeContent(
    db,
    [{ key: "a", value: "1" }, { key: "evil", value: "x" }, { key: "a", value: "2" }, { key: "b", value: "3" }],
    ["a", "b"],
  );
  assert.equal(saved, 2);
  const [op, rows, options] = db.calls[0].ops[0];
  assert.equal(op, "upsert");
  assert.deepEqual(rows, [{ key: "a", value: "2" }, { key: "b", value: "3" }]);
  assert.deepEqual(options, { onConflict: "key" });
  const none = fakeDb(() => ({ data: null }));
  assert.equal(await writeContent(none, [{ key: "evil", value: "x" }], ["a"]), 0);
  assert.equal(none.calls.length, 0);
});

test("content read + media read (newest first, created_date alias)", async () => {
  assert.deepEqual(await readContent(fakeDb(() => ({ data: [{ key: "k", value: null }, { key: "", value: "x" }] }))), { k: "" });
  const db = fakeDb(() => ({ data: [{ id: "m", created_at: "t" }] }));
  const media = await readMedia(db);
  assert.equal(media[0].created_date, "t");
  assert.deepEqual(db.calls[0].ops.find(([o]) => o === "order").slice(1), ["created_at", { ascending: false }]);
});

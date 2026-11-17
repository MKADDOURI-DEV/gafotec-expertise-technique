import assert from "node:assert/strict";
import test from "node:test";
import { readExpertises, reorderExpertises, writeExpertise } from "../src/lib/data-api.js";
import { linesToList, listToLines, moveItem, normalizeExpertises, slugify } from "../src/lib/expertises.js";

function fakeDb(reply) {
  const calls = [];
  return {
    calls,
    from(table) {
      const log = { table, ops: [] };
      calls.push(log);
      const q = new Proxy({}, {
        get: (_, op) => {
          if (op === "then") return (resolve, reject) => Promise.resolve(reply(table, log.ops)).then(resolve, reject);
          return (...args) => (log.ops.push([op, ...args]), q);
        },
      });
      return q;
    },
  };
}

test("slugify: accents, ampersand, spaces", () => {
  assert.equal(slugify("Climatisation & Ventilation"), "climatisation-et-ventilation");
  assert.equal(slugify("  Énergie solaire — PV  "), "energie-solaire-pv");
});

test("normalize: ordered by display_order, number follows the order, lists cleaned", () => {
  const out = normalizeExpertises([
    { id: "b", title: "B", display_order: 1, interventions: ["x", "", 3], expertise: null },
    { id: "a", title: "A", display_order: 0 },
  ]);
  assert.deepEqual(out.map((e) => [e.id, e.number]), [["a", "01"], ["b", "02"]]);
  assert.deepEqual(out[1].interventions, ["x"]);
  assert.deepEqual(out[1].expertise, []);
  assert.equal(out[0].short, "A");
});

test("textarea <-> list round trip ignores blank lines", () => {
  assert.deepEqual(linesToList("a\n\n  b  \r\nc\n"), ["a", "b", "c"]);
  assert.equal(listToLines(["a", "b"]), "a\nb");
});

test("moveItem reorders and ignores out-of-range moves", () => {
  assert.deepEqual(moveItem(["a", "b", "c"], 2, 0), ["c", "a", "b"]);
  const same = ["a", "b"];
  assert.equal(moveItem(same, 0, -1), same);
});

test("readExpertises: missing table (42P01 / PGRST205) -> null so the site keeps its built-in list", async () => {
  assert.equal(await readExpertises(fakeDb(() => ({ data: null, error: { code: "42P01", message: "x" } }))), null);
  assert.equal(await readExpertises(fakeDb(() => ({ data: null, error: { code: "PGRST205", message: "x" } }))), null);
  await assert.rejects(readExpertises(fakeDb(() => ({ data: null, error: { code: "XX000", message: "boom" } }))));
});

test("readExpertises: an EMPTY table is not 'missing' (deleting everything must not resurrect the old list)", async () => {
  assert.deepEqual(await readExpertises(fakeDb(() => ({ data: [] }))), []);
});

test("writeExpertise: a new expertise goes last; an edit keeps its order", async () => {
  const db = fakeDb((table, ops) => {
    if (ops.some(([op]) => op === "limit")) return { data: [{ display_order: 6 }] };
    if (ops.some(([op]) => op === "single")) return { data: { id: "new" } };
    return { data: [{ id: "x" }] };
  });
  assert.equal(await writeExpertise(db, { title: "T", slug: "t" }), "new");
  const insert = db.calls.flatMap((c) => c.ops).find(([op]) => op === "insert");
  assert.equal(insert[1].display_order, 7);
  assert.equal(await writeExpertise(fakeDb(() => ({ data: [{ id: "x" }] })), { id: "x", title: "T" }), "x");
});

test("reorderExpertises writes display_order = position for every id", async () => {
  const db = fakeDb(() => ({ data: [] }));
  await reorderExpertises(db, ["c", "a", "b"]);
  const orders = db.calls.map((c) => c.ops.find(([op]) => op === "update")[1].display_order);
  assert.deepEqual(orders, [0, 1, 2]);
});

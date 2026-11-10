import assert from "node:assert/strict";
import test from "node:test";
import { toSql } from "../scripts/lib/sql.mjs";

test("escaping: quotes, arrays, null, booleans, numbers", () => {
  const [sql] = toSql("site_projects", "slug", [{ slug: "l-eau", title: "L'usine \"X\"", scope: ["a'b", "c"], featured: true, year: 2024, summary: null }]);
  assert.match(sql, /^insert into public\.site_projects \("slug", "title", "scope", "featured", "year", "summary"\) values \('l-eau', 'L''usine "X"', ARRAY\['a''b', 'c'\]::text\[\], true, 2024, NULL\) on conflict \("slug"\) do update set /);
  assert.ok(sql.includes('"title" = EXCLUDED."title"') && !sql.includes('"slug" = EXCLUDED'));
});

test("no natural key: guarded insert, idempotent signature", () => {
  const [sql] = toSql("team_members", null, [{ name: "A", role: "B", group_name: "Direction" }]);
  assert.match(sql, /where not exists \(select 1 from public\.team_members where "name" = 'A' and "role" = 'B'\);$/);
});

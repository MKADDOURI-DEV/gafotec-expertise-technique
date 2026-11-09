import assert from "node:assert/strict";
import test from "node:test";
import { list, parseCsv, prepare } from "../scripts/lib/base44-import.mjs";

test("CSV: quotes, commas, newlines and BOM", () => {
  const rows = parseCsv('\uFEFFkey,value\r\na,"x, ""y"""\r\nb,"line1\nline2"\r\n');
  assert.deepEqual(rows, [{ key: "a", value: 'x, "y"' }, { key: "b", value: "line1\nline2" }]);
});

test("scope accepts arrays, JSON strings and ; separated text", () => {
  assert.deepEqual(list(["a", " b "]), ["a", "b"]);
  assert.deepEqual(list('["a","b"]'), ["a", "b"]);
  assert.deepEqual(list("a; b | c"), ["a", "b", "c"]);
  assert.deepEqual(list(""), []);
});

test("projects: mapped, defaults applied, bad rows reported, duplicate slugs skipped (first wins)", () => {
  const r = prepare("SiteProject", [
    { title: "Usine", slug: "usine", year: "2024", category: "Industrie", scope: '["CVC"]', featured: "true", created_date: "2025-03-01T10:00:00Z" },
    { title: "Usine bis", slug: "usine" },
    { title: "X", slug: "ok-slug" },
    { title: "Bad", slug: "Bad Slug" },
    { title: "Cat", slug: "cat", category: "Inconnue" },
  ]);
  assert.equal(r.rows.length, 1);
  assert.deepEqual([r.rows[0].year, r.rows[0].status, r.rows[0].featured, r.rows[0].scope, r.rows[0].created_at], [2024, "Livré", true, ["CVC"], "2025-03-01T10:00:00.000Z"]);
  assert.equal(r.issues.length, 4);
});

test("team: `group` becomes group_name, unknown group rejected", () => {
  const r = prepare("TeamMember", [{ name: "A B", role: "Dir", group: "Direction", display_order: "2" }, { name: "C", role: "D", group: "Inconnu" }, { name: "", role: "x" }]);
  assert.deepEqual(r.rows, [{ name: "A B", role: "Dir", group_name: "Direction", display_order: 2 }]);
  assert.equal(r.issues.length, 2);
});

test("contact requests: enum enforced, status normalised", () => {
  const ok = { full_name: "V", email: "v@x.io", phone: "06", service: "Piscines", message: "m", status: "traite" };
  const r = prepare("ContactRequest", [ok, { ...ok, service: "Autre chose" }, { ...ok, message: "" }]);
  assert.equal(r.rows.length, 1);
  assert.equal(r.rows[0].status, "traite");
  assert.equal(r.issues.length, 2);
});

test("content and media: required fields, duplicate keys/urls collapse", () => {
  assert.equal(prepare("SiteContent", [{ key: "a", value: "1" }, { key: "a", value: "2" }, { value: "x" }]).rows.length, 1);
  const media = prepare("MediaAsset", [{ url: "https://x/a.jpg", kind: "video" }, { url: "https://x/a.jpg" }, {}]);
  assert.deepEqual([media.rows.length, media.rows[0].kind, media.issues.length], [1, "video", 2]);
});

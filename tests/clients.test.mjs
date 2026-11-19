import assert from "node:assert/strict";
import test from "node:test";
import { isAllowedLogoUrl, isHttpUrl, isHttpsUrl, initialsOf, normalizeClient, normalizeWebsite, sectorsOf, sortClients, toPublicClient } from "../src/lib/clients.js";
import { MAX_LOGO_BYTES, validateLogoFile } from "../src/lib/media-validation.js";
import { readFileSync } from "node:fs";

const row = { id: "1", name: "Client A", sector: "Hôtellerie", description: "d", website: "https://a.test", logo_url: "https://x/a.png", logo_path: "clients/a.png", display_order: 2, published: true, created_at: "2026-01-01" };

test("normalizeClient keeps only known fields and safe defaults", () => {
  assert.deepEqual(normalizeClient({ id: "9", name: "X Y" }), { id: "9", name: "X Y", sector: "", description: "", website: "", logo_url: "", logo_path: "", display_order: 0, published: false });
  assert.equal(normalizeClient({ ...row, published: "true" }).published, false, "only a real boolean true publishes");
  assert.equal(normalizeClient(row).created_at, undefined);
});

test("public projection never exposes the storage path or the published flag", () => {
  const pub = toPublicClient(normalizeClient(row));
  assert.deepEqual(Object.keys(pub).sort(), ["description", "id", "logo_url", "name", "sector", "website"]);
});

test("sortClients: by display order, then by name", () => {
  const sorted = sortClients([{ name: "Zed", display_order: 1 }, { name: "Alpha", display_order: 1 }, { name: "Mid", display_order: 0 }]);
  assert.deepEqual(sorted.map((c) => c.name), ["Mid", "Alpha", "Zed"]);
});

test("sectorsOf: unique, non-empty, sorted", () => {
  assert.deepEqual(sectorsOf([{ sector: "Industrie" }, { sector: "" }, { sector: "Hôtellerie" }, { sector: "Industrie" }]), ["Hôtellerie", "Industrie"]);
});

test("website: normalised to https, only http(s) accepted", () => {
  assert.equal(normalizeWebsite("  gafotec.com "), "https://gafotec.com");
  assert.equal(normalizeWebsite(""), "");
  assert.equal(normalizeWebsite("http://a.test"), "http://a.test");
  assert.equal(isHttpUrl(normalizeWebsite("javascript:alert(1)")), false);
  assert.equal(isHttpUrl("ftp://a.test"), false);
  assert.equal(isHttpsUrl("http://a.test"), false);
  assert.equal(isHttpsUrl("https://a.test/logo.png"), true);
});

test("initialsOf", () => {
  assert.equal(initialsOf("hôtel les palmiers"), "HL");
  assert.equal(initialsOf(""), "");
});

test("logo upload: PNG/JPG/WebP up to 2 MB, SVG and others refused", () => {
  assert.equal(MAX_LOGO_BYTES, 2 * 1024 * 1024);
  assert.equal(validateLogoFile({ name: "logo.png", type: "image/png", size: 1000 }), null);
  assert.equal(validateLogoFile({ name: "logo.JPEG", type: "image/jpeg", size: 1000 }), null);
  assert.equal(validateLogoFile({ name: "logo.webp", type: "image/webp", size: 1000 }), null);
  assert.match(validateLogoFile({ name: "logo.svg", type: "image/svg+xml", size: 1000 }), /PNG, JPG ou WebP/);
  assert.match(validateLogoFile({ name: "logo.png", type: "image/jpeg", size: 1000 }), /PNG, JPG ou WebP/, "extension must match the type");
  assert.match(validateLogoFile({ name: "logo.png", type: "image/png", size: MAX_LOGO_BYTES + 1 }), /trop lourd/);
  assert.match(validateLogoFile({ name: "logo.png", type: "image/png", size: 0 }), /vide/);
  assert.match(validateLogoFile(null), /Aucun fichier/);
});

test("content registry (read as text: it uses the @/ alias): home video keys + clients texts exist, `values.*` keys untouched", () => {
  const registry = readFileSync(new URL("../src/content/registry.js", import.meta.url), "utf8");
  for (const key of ["home.hero.video_url", "home.hero.video_path", "home.hero.video_name", "home.hero.video_size", "home.hero.video_duration"]) {
    assert.match(registry, new RegExp(`"${key.replace(/\./g, "\\.")}": ""`), `${key}: allowed key, empty by default (no fictitious video)`);
  }
  for (const key of ["values.video_url", "values.video_path", "values.pdf_url", "values.pdf_path", "values.pdf_name", "values.title", "values.intro", "values.button_label"]) {
    assert.ok(registry.includes(`"${key}"`), `${key} must still exist so the existing files and texts are preserved`);
  }
  for (const key of ["clients.hero.title", "clients.list.title", "clients.empty.title", "clients.empty.text"]) assert.ok(registry.includes(`key: "${key}"`), key);
});

test("SQL migration site_clients: RLS on, no policy, service_role only, no seed, no destructive statement", () => {
  const sql = readFileSync(new URL("../supabase/pending/20261117_site_clients.sql", import.meta.url), "utf8");
  assert.match(sql, /create table if not exists public\.site_clients/);
  assert.match(sql, /alter table public\.site_clients enable row level security/);
  assert.match(sql, /revoke all on table public\.site_clients from public, anon, authenticated, service_role/);
  assert.match(sql, /grant select, insert, update, delete on table public\.site_clients to service_role/);
  assert.ok(!/create policy/i.test(sql), "no policy: deny-all for API roles, like the other content tables");
  assert.ok(!/insert into public\.site_clients/i.test(sql), "no invented client is seeded");
  assert.ok(!/drop table|truncate|delete from|drop column/i.test(sql.replace(/--.*$/gm, "")), "non destructive");
  assert.match(sql, /^begin;$/m);
  assert.match(sql, /^commit;$/m);
  assert.match(sql, /NOT APPLIED/);
});

test("presentation files keep their Supabase references: the public section reads the same `values.*` keys", () => {
  const source = readFileSync(new URL("../src/components/site/OurValues.jsx", import.meta.url), "utf8");
  for (const key of ["values.video_url", "values.pdf_url", "values.pdf_name", "values.button_label"]) assert.ok(source.includes(key), key);
  assert.match(source, /if \(!videoUrl && !pdfUrl\) return null/, "never an empty section");
  const team = readFileSync(new URL("../src/routes/_site/notre-equipe.jsx", import.meta.url), "utf8");
  assert.ok(!team.includes("OurValues"), "removed from « Notre équipe »");
  const clients = readFileSync(new URL("../src/routes/_site/nos-clients.jsx", import.meta.url), "utf8");
  assert.ok(clients.includes("OurValues"), "attached to « Nos clients »");
});

test("logo URL: only a public object of OUR Supabase project, under media/clients/, matching logo_path", () => {
  const base = "https://proj.supabase.co";
  const ok = "https://proj.supabase.co/storage/v1/object/public/media/clients/u-a.png";
  assert.equal(isAllowedLogoUrl("", base, ""), true);
  assert.equal(isAllowedLogoUrl("", base, "clients/u-a.png"), false, "path without url");
  assert.equal(isAllowedLogoUrl(ok, base, "clients/u-a.png"), true);
  assert.equal(isAllowedLogoUrl(ok, base, ""), false, "url without path");
  assert.equal(isAllowedLogoUrl(ok, base, "clients/other.png"), false, "path mismatch");
  assert.equal(isAllowedLogoUrl("https://evil.test/storage/v1/object/public/media/clients/u-a.png", base, "clients/u-a.png"), false, "foreign host");
  assert.equal(isAllowedLogoUrl("https://proj.supabase.co.evil.test/storage/v1/object/public/media/clients/u-a.png", base, "clients/u-a.png"), false, "look-alike host");
  assert.equal(isAllowedLogoUrl("https://proj.supabase.co/storage/v1/object/public/media/legacy/u-a.png", base, "legacy/u-a.png"), false, "other folder");
  assert.equal(isAllowedLogoUrl(`${ok}?x=1`, base, "clients/u-a.png"), false, "query");
  assert.equal(isAllowedLogoUrl("http://proj.supabase.co/storage/v1/object/public/media/clients/u-a.png", base, "clients/u-a.png"), false, "other scheme");
  assert.equal(isAllowedLogoUrl("javascript:alert(1)", base, "clients/u-a.png"), false);
});

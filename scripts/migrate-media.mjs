// Copies every image/video hosted on Base44's CDN into the Supabase `media` bucket and repoints the references.
// Nothing is deleted on Base44. Run it from a machine that can reach both Base44's CDN and Supabase.
//   node scripts/migrate-media.mjs            dry run: lists the URLs found, checks they download
//   node scripts/migrate-media.mjs --apply    uploads, rewrites src/**/*.{js,jsx} and the database rows
// Needs for --apply: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.
import { createHash } from "node:crypto";
import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { extname, join } from "node:path";
import { createClient } from "@supabase/supabase-js";

const apply = process.argv.includes("--apply");
const HOST = /https?:\/\/(?:media\.base44\.com|[\w.-]*base44\.app|[\w.-]*base44\.com)\/[^\s"'`)\\<>]+/g;
const ALLOWED = { "image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp", "image/gif": ".gif", "video/mp4": ".mp4", "video/webm": ".webm" };

function* sourceFiles(dir) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) yield* sourceFiles(path);
    else if (/\.(jsx?|css|html)$/.test(name)) yield path;
  }
}

const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (apply && (!url || !key)) (console.error("SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY missing"), process.exit(2));
const db = url && key ? createClient(url, key, { auth: { persistSession: false } }) : null;

const found = new Map(); // url -> where

for (const file of sourceFiles("src")) {
  const content = readFileSync(file, "utf8");

  for (const m of content.matchAll(HOST)) {
    const pathname = new URL(m[0]).pathname;
    const filename = pathname.split("/").pop();

    if (/\.[a-z0-9]{2,5}$/i.test(filename)) {
      found.set(m[0], file);
    }
  }

  const bases = new Map();

  const basePattern =
    /\b(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*["'](https?:\/\/(?:media\.base44\.com|[\w.-]*base44\.app|[\w.-]*base44\.com)\/[^"']+)["']/g;

  for (const m of content.matchAll(basePattern)) {
    bases.set(m[1], m[2].replace(/\/+$/, ""));
  }

  const templatePattern = /\$\{([A-Za-z_$][\w$]*)\}\/([^`]+)`/g;

  for (const m of content.matchAll(templatePattern)) {
    const base = bases.get(m[1]);
    if (!base) continue;

    const filename = m[2].trim();
    if (!/\.[a-z0-9]{2,5}$/i.test(filename)) continue;

    found.set(`${base}/${filename}`, file);
  }
}
const columns = [["site_projects", "image"], ["media_assets", "url"], ["site_content", "value"]];
if (db) {
  for (const [table, column] of columns) {
    const { data, error } = await db.from(table).select(`id, ${column}`);
    if (error) (console.error(`${table}: ${error.message}`), process.exit(1));
    for (const row of data) for (const m of String(row[column] ?? "").matchAll(HOST)) found.set(m[0], `${table}.${column}`);
  }
}
console.log(`${found.size} Base44 media URL(s) found`);

const mapping = {};
const report = { apply, urls: [] };
for (const [source, where] of found) {
  const entry = { source, where };
  try {
    const res = await fetch(source);
    const type = (res.headers.get("content-type") ?? "").split(";")[0].trim();
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    if (!ALLOWED[type]) throw new Error(`unsupported type ${type}`);
    const bytes = Buffer.from(await res.arrayBuffer());
    const hash = createHash("sha1").update(bytes).digest("hex").slice(0, 12);
    const base = decodeURIComponent(new URL(source).pathname.split("/").pop() ?? "file").replace(/[^\w.-]+/g, "-").slice(-60);
    const path = `legacy/${hash}-${extname(base) ? base : base + ALLOWED[type]}`;
    entry.bytes = bytes.length; entry.type = type; entry.path = path;
    if (apply) {
      const { error } = await db.storage.from("media").upload(path, bytes, { contentType: type, upsert: true, cacheControl: "31536000" });
      if (error) throw new Error(error.message);
      mapping[source] = db.storage.from("media").getPublicUrl(path).data.publicUrl;
      entry.target = mapping[source];
    }
    entry.ok = true;
  } catch (error) {
    entry.ok = false; entry.error = error.message;
  }
  report.urls.push(entry);
  console.log(`${entry.ok ? "OK  " : "FAIL"} ${source}${entry.ok ? "" : `  (${entry.error})`}`);
}

if (apply) {
  const failed = report.urls.filter((u) => !u.ok);
  if (failed.length) (console.error(`${failed.length} file(s) failed: nothing was rewritten.`), writeFileSync("media-migration-report.json", JSON.stringify(report, null, 2)), process.exit(1));
  const swap = (s) => Object.entries(mapping).reduce((acc, [from, to]) => {
    const filename = new URL(from).pathname.split("/").pop();
    return acc.split(from).join(to).split("${MEDIA}/" + filename).join(to);
  }, s);
  for (const file of sourceFiles("src")) {
    const before = readFileSync(file, "utf8"), after = swap(before);
    if (after !== before) writeFileSync(file, after);
  }
  for (const [table, column] of columns) {
    const { data } = await db.from(table).select(`id, ${column}`);
    for (const row of data) {
      const next = swap(String(row[column] ?? ""));
      if (next !== (row[column] ?? "")) await db.from(table).update({ [column]: next }).eq("id", row.id);
    }
  }
  console.log("references rewritten. Review `git diff`, then commit.");
}
writeFileSync("media-migration-report.json", JSON.stringify(report, null, 2));
console.log("report written to media-migration-report.json");

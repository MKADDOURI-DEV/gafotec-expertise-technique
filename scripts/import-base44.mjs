// Imports a Base44 export (JSON or CSV per entity) into Supabase. READ-ONLY on Base44 (it only reads your files).
//   node scripts/import-base44.mjs <export-dir>            dry run: validation + report, writes nothing
//   node scripts/import-base44.mjs <export-dir> --apply    inserts into Supabase (idempotent)
//   node scripts/import-base44.mjs <export-dir> --sql      writes import.sql (idempotent, one transaction) to run in the SQL editor
// Needs for --apply: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in the environment (never commit them).
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { createClient } from "@supabase/supabase-js";
import { TARGETS, parseCsv, prepare } from "./lib/base44-import.mjs";
import { toSql } from "./lib/sql.mjs";

const [dir, ...flags] = process.argv.slice(2);
const apply = flags.includes("--apply");
if (!dir) (console.error("usage: node scripts/import-base44.mjs <export-dir> [--apply]"), process.exit(2));

function load(entity) {
  for (const name of [`${entity}.json`, `${entity}.csv`, `${entity.toLowerCase()}.json`, `${entity.toLowerCase()}.csv`]) {
    const path = join(dir, name);
    if (!existsSync(path)) continue;
    const content = readFileSync(path, "utf8");
    if (name.endsWith(".csv")) return parseCsv(content);
    const json = JSON.parse(content);
    return Array.isArray(json) ? json : (json.data ?? json.items ?? json.records ?? []);
  }
  return null;
}

const report = { mode: apply ? "apply" : "dry-run", entities: {}, issues: [] };
const prepared = {};
for (const entity of Object.keys(TARGETS)) {
  const records = load(entity);
  if (!records) { report.entities[entity] = "no export file found"; continue; }
  const result = prepare(entity, records);
  prepared[entity] = result;
  report.entities[entity] = { received: result.received, valid: result.rows.length, skipped: result.issues.length, target: result.table };
  report.issues.push(...result.issues);
}
console.table(report.entities);
for (const issue of report.issues.slice(0, 30)) console.log(`  ! ${issue.entity}[${issue.index}]: ${issue.problem}`);

if (flags.includes("--sql")) {
  const statements = Object.values(prepared).flatMap(({ table, naturalKey, rows }) => toSql(table, naturalKey, rows));
  writeFileSync("import.sql", `begin;\n${statements.join("\n")}\ncommit;\n`);
  console.log(`import.sql written (${statements.length} statements)`);
}

if (apply) {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) (console.error("SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY missing"), process.exit(2));
  const db = createClient(url, key, { auth: { persistSession: false } });
  for (const [entity, { table, naturalKey, rows }] of Object.entries(prepared)) {
    if (!rows.length) continue;
    if (naturalKey) {
      const { error } = await db.from(table).upsert(rows, { onConflict: naturalKey });
      if (error) (console.error(`${entity}: ${error.message}`), process.exit(1));
    } else {
      // No natural key: skip rows already present, so a second run adds nothing.
      const { data: existing, error } = await db.from(table).select("*");
      if (error) (console.error(`${entity}: ${error.message}`), process.exit(1));
      const sig = (r) => JSON.stringify([r.name ?? r.email, r.role ?? r.message, r.created_at?.slice(0, 19)]);
      const have = new Set(existing.map(sig));
      const fresh = rows.filter((r) => !have.has(sig(r)));
      if (fresh.length) {
        const { error: insertError } = await db.from(table).insert(fresh);
        if (insertError) (console.error(`${entity}: ${insertError.message}`), process.exit(1));
      }
      report.entities[entity].inserted = fresh.length;
    }
    // Verification: row count in Supabase must cover what was valid.
    const { count } = await db.from(table).select("id", { count: "exact", head: true });
    report.entities[entity].supabaseRowsNow = count;
    if (count < rows.length) (console.error(`${entity}: only ${count} rows after import, expected >= ${rows.length}`), process.exit(1));
  }
  console.log("imported. Counts now in Supabase:");
  console.table(Object.fromEntries(Object.entries(report.entities).map(([k, v]) => [k, v.supabaseRowsNow ?? "-"])));
}
writeFileSync("migration-report.json", JSON.stringify(report, null, 2));
console.log("report written to migration-report.json");

// Turns validated rows into idempotent SQL (used by `import-base44.mjs --sql`, so the import can run from the SQL editor).
const quote = (value) => {
  if (value === null || value === undefined) return "NULL";
  if (typeof value === "boolean" || typeof value === "number") return String(value);
  return `'${String(value).replace(/'/g, "''")}'`;
};
const literal = (value) => (Array.isArray(value) ? `ARRAY[${value.map(quote).join(", ")}]::text[]` : quote(value));

// Natural key: upsert. No natural key: insert only when no row has the same signature (so a second run adds nothing).
const SIGNATURES = { team_members: ["name", "role"], contact_requests: ["email", "message", "created_at"] };

export function toSql(table, naturalKey, rows) {
  const out = [];
  for (const row of rows) {
    const columns = Object.keys(row);
    const names = columns.map((c) => `"${c}"`).join(", ");
    const values = columns.map((c) => literal(row[c])).join(", ");
    if (naturalKey) {
      const updates = columns.filter((c) => c !== naturalKey).map((c) => `"${c}" = EXCLUDED."${c}"`).join(", ");
      out.push(`insert into public.${table} (${names}) values (${values}) on conflict ("${naturalKey}") do ${updates ? `update set ${updates}` : "nothing"};`);
    } else {
      const signature = (SIGNATURES[table] ?? columns).filter((c) => c in row).map((c) => `"${c}" = ${literal(row[c])}`).join(" and ");
      out.push(`insert into public.${table} (${names}) select ${values} where not exists (select 1 from public.${table} where ${signature});`);
    }
  }
  return out;
}

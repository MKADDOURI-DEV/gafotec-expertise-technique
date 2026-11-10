// Pure mapping/validation of a Base44 export -> Supabase rows (no network, unit-tested in tests/import.test.mjs).

export const PROJECT_CATEGORIES = ["Industrie", "Hôtellerie", "Enseignement", "Tourisme", "Résidentiel"];
export const TEAM_GROUPS = ["Direction", "Études", "Chantier", "Support"];
export const SERVICES = [
  "Climatisation & Ventilation", "Plomberie sanitaire", "Chauffage central", "Protection contre l’incendie",
  "Désenfumage", "Piscines", "Énergie solaire photovoltaïque", "Autre / Plusieurs métiers",
];

/** RFC 4180 CSV -> array of objects keyed by the header row. */
export function parseCsv(text) {
  const rows = [];
  let row = [], field = "", quoted = false;
  const src = text.replace(/^\uFEFF/, "");
  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (quoted) {
      if (c === '"' && src[i + 1] === '"') (field += '"'), i++;
      else if (c === '"') quoted = false;
      else field += c;
    } else if (c === '"') quoted = true;
    else if (c === ",") (row.push(field), (field = ""));
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && src[i + 1] === "\n") i++;
      row.push(field); field = "";
      if (row.some((v) => v !== "")) rows.push(row);
      row = [];
    } else field += c;
  }
  if (field !== "" || row.length) (row.push(field), row.some((v) => v !== "") && rows.push(row));
  const [header = [], ...body] = rows;
  return body.map((r) => Object.fromEntries(header.map((h, i) => [h.trim(), r[i] ?? ""])));
}

const text = (v) => (v === null || v === undefined ? "" : String(v).trim());
const optional = (v) => (text(v) === "" ? null : text(v));
const int = (v) => (text(v) === "" || Number.isNaN(Number(v)) ? null : Math.round(Number(v)));
const bool = (v) => v === true || /^(true|1|yes|oui)$/i.test(text(v));
const date = (v) => (text(v) && !Number.isNaN(Date.parse(v)) ? new Date(v).toISOString() : undefined);
export function list(v) {
  if (Array.isArray(v)) return v.map(text).filter(Boolean);
  const s = text(v);
  if (!s) return [];
  try { const parsed = JSON.parse(s); if (Array.isArray(parsed)) return parsed.map(text).filter(Boolean); } catch { /* not JSON */ }
  return s.split(/\s*[;|]\s*|\n/).map(text).filter(Boolean);
}
const stamps = (r) => ({ ...(date(r.created_date) && { created_at: date(r.created_date) }), ...(date(r.updated_date) && { updated_at: date(r.updated_date) }) });

// Each mapper returns { row } or { error }.
export const mappers = {
  SiteContent: (r) => (text(r.key) ? { row: { key: text(r.key), value: text(r.value), ...stamps(r) } } : { error: "missing key" }),
  SiteProject: (r) => {
    if (text(r.title).length < 2) return { error: "missing title" };
    if (!/^[a-z0-9-]+$/.test(text(r.slug))) return { error: `invalid slug "${text(r.slug)}"` };
    const category = optional(r.category);
    if (category && !PROJECT_CATEGORIES.includes(category)) return { error: `unknown category "${category}"` };
    const status = optional(r.status) ?? "Livré";
    if (!["Livré", "En cours"].includes(status)) return { error: `unknown status "${status}"` };
    return { row: { title: text(r.title), slug: text(r.slug), year: int(r.year), category, location: optional(r.location), status, image: optional(r.image), summary: optional(r.summary), description: optional(r.description), scope: list(r.scope), featured: bool(r.featured), display_order: int(r.display_order), ...stamps(r) } };
  },
  TeamMember: (r) => {
    if (!text(r.name) || !text(r.role)) return { error: "missing name or role" };
    const group = text(r.group) || "Études";
    if (!TEAM_GROUPS.includes(group)) return { error: `unknown group "${group}"` };
    return { row: { name: text(r.name), role: text(r.role), group_name: group, display_order: int(r.display_order), ...stamps(r) } };
  },
  MediaAsset: (r) => (text(r.url) ? { row: { title: optional(r.title), kind: text(r.kind) === "video" ? "video" : "image", url: text(r.url), alt: optional(r.alt), ...(date(r.created_date) && { created_at: date(r.created_date) }) } } : { error: "missing url" }),
  ContactRequest: (r) => {
    if (!text(r.full_name) || !text(r.email) || !text(r.phone) || !text(r.message)) return { error: "missing required field" };
    if (!SERVICES.includes(text(r.service))) return { error: `unknown service "${text(r.service)}"` };
    return { row: { full_name: text(r.full_name), company: optional(r.company), email: text(r.email), phone: text(r.phone), service: text(r.service), message: text(r.message), status: text(r.status) === "traite" ? "traite" : "nouveau", ...stamps(r) } };
  },
};

export const TARGETS = { SiteContent: ["site_content", "key"], SiteProject: ["site_projects", "slug"], TeamMember: ["team_members", null], MediaAsset: ["media_assets", "url"], ContactRequest: ["contact_requests", null] };

/** Maps one entity's records; reports invalid rows and duplicate natural keys (first wins). */
export function prepare(entity, records) {
  const [table, naturalKey] = TARGETS[entity];
  const rows = [], issues = [], seen = new Set();
  records.forEach((record, index) => {
    const result = mappers[entity](record);
    if (result.error) return issues.push({ entity, index, problem: result.error });
    if (naturalKey) {
      const value = result.row[naturalKey];
      if (seen.has(value)) return issues.push({ entity, index, problem: `duplicate ${naturalKey} "${value}" (skipped)` });
      seen.add(value);
    }
    rows.push(result.row);
  });
  return { table, naturalKey, rows, issues, received: records.length };
}

// Pure helpers for « Nos expertises » (shared by the server functions, the public pages and the tests).

export const MISSING_TABLE_CODES = new Set(["42P01", "PGRST205"]);

export function slugify(text) {
  return String(text ?? "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " et ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

const list = (value) => (Array.isArray(value) ? value.filter((item) => typeof item === "string" && item.trim()) : []);

/** DB row (or static service) → the shape the pages use. `number` ("01", "02"…) always follows the display order. */
export function normalizeExpertises(rows) {
  return [...rows]
    .sort((a, b) => (a.display_order ?? 999) - (b.display_order ?? 999) || String(a.created_at ?? "").localeCompare(String(b.created_at ?? "")))
    .map((row, index) => ({
      ...row,
      number: String(index + 1).padStart(2, "0"),
      short: row.short || row.title,
      excerpt: row.excerpt ?? "",
      description: row.description ?? "",
      image: row.image ?? "",
      interventions: list(row.interventions),
      expertise: list(row.expertise),
    }));
}

/** Text → array of non-empty lines (one item per line) and back, for the admin textareas. */
export const linesToList = (text) =>
  String(text ?? "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
export const listToLines = (items) => (Array.isArray(items) ? items.join("\n") : "");

/** Moves item `from` to position `to` (returns a new array). */
export function moveItem(array, from, to) {
  if (from === to || from < 0 || to < 0 || from >= array.length || to >= array.length) return array;
  const copy = [...array];
  const [item] = copy.splice(from, 1);
  copy.splice(to, 0, item);
  return copy;
}

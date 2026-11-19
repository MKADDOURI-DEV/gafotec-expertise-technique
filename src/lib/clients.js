// Pure helpers for « Nos clients » (no browser / server API: also used by the node unit tests).

export const CLIENT_LIMITS = { name: 120, sector: 80, description: 400, website: 300 };

/** Suggestions only (free text is accepted). No client name is ever suggested or shipped. */
export const SECTOR_SUGGESTIONS = ["Hôtellerie", "Industrie", "Enseignement", "Tourisme", "Résidentiel", "Santé", "Administration"];

export const isHttpUrl = (value) => {
  try {
    const url = new URL(String(value));
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
};

export const isHttpsUrl = (value) => {
  try {
    return new URL(String(value)).protocol === "https:";
  } catch {
    return false;
  }
};

/**
 * A client logo URL is accepted only when it is a PUBLIC object of OUR Supabase project, inside the `clients/` folder of the
 * `media` bucket: same origin as the configured project URL, exact path `/storage/v1/object/public/media/<logo_path>`,
 * no credentials, query or fragment. An empty URL (no logo) is allowed.
 */
export function isAllowedLogoUrl(value, supabaseUrl, logoPath = "") {
  if (value === "") return logoPath === "";
  try {
    const url = new URL(String(value));
    const base = new URL(String(supabaseUrl));
    if (url.origin !== base.origin || url.username || url.password || url.search || url.hash) return false;
    const prefix = "/storage/v1/object/public/media/";
    if (!url.pathname.startsWith(`${prefix}clients/`)) return false;
    return logoPath !== "" && url.pathname === `${prefix}${logoPath}`;
  } catch {
    return false;
  }
}

/** "gafotec.com" -> "https://gafotec.com"; "" stays ""; anything that is not http(s) is returned untouched (then refused). */
export function normalizeWebsite(input) {
  const value = String(input ?? "").trim();
  if (!value) return "";
  if (/^[a-z][a-z0-9+.-]*:/i.test(value)) return value;
  return `https://${value.replace(/^\/+/, "")}`;
}

export const normalizeClient = (row) => ({
  id: row.id,
  name: row.name ?? "",
  sector: row.sector ?? "",
  description: row.description ?? "",
  website: row.website ?? "",
  logo_url: row.logo_url ?? "",
  logo_path: row.logo_path ?? "",
  display_order: Number.isFinite(Number(row.display_order)) ? Number(row.display_order) : 0,
  published: row.published === true,
});

export const sortClients = (rows) =>
  [...rows].sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0) || String(a.name).localeCompare(String(b.name), "fr"));

/** What the public site receives: no storage path, no internal flag. */
export const toPublicClient = ({ id, name, sector, description, website, logo_url }) => ({ id, name, sector, description, website, logo_url });

export const sectorsOf = (clients) =>
  [...new Set(clients.map((client) => client.sector).filter(Boolean))].sort((a, b) => a.localeCompare(b, "fr"));

export const initialsOf = (name) =>
  String(name ?? "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

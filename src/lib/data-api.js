// All database access for the site and the admin dashboard. Every function takes a service-role client (`db`),
// so it only ever runs on the server, after requireUser + assertAdmin where the data is not public.
import { notFound } from "./auth-core.js";

const MESSAGES = {
  "23505": "Cet identifiant existe déjà.",
  "22P02": "Identifiant invalide.",
  "23514": "Valeur non autorisée.",
  "23502": "Champ obligatoire manquant.",
};

export function toError(error) {
  console.error("[db]", error.code, error.message);
  const failure = new Error(MESSAGES[error.code] ?? "Erreur serveur");
  failure.status = error.code === "23505" ? 409 : MESSAGES[error.code] ? 400 : 500;
  failure.code = error.code;
  return failure;
}

async function run(query) {
  const { data, error, count } = await query;
  if (error) throw toError(error);
  return { data, count };
}

// Row -> the shape the UI already uses (created_date, `group`).
export const toProject = (row) => ({
  ...row,
  scope: Array.isArray(row.scope) ? row.scope : [],
  created_date: row.created_at,
  updated_date: row.updated_at,
});
export const toTeamMember = ({ group_name, ...row }) => ({ ...row, group: group_name, created_date: row.created_at });
export const toMedia = (row) => ({ ...row, created_date: row.created_at });

export const sortProjects = (rows) =>
  [...rows].sort((a, b) => (a.display_order ?? 999) - (b.display_order ?? 999) || (a.year ?? 0) - (b.year ?? 0));
export const sortTeam = (rows) => [...rows].sort((a, b) => (a.display_order ?? 999) - (b.display_order ?? 999));

export async function readContent(db) {
  const { data } = await run(db.from("site_content").select("key, value"));
  return Object.fromEntries(data.filter((row) => row.key).map((row) => [row.key, row.value ?? ""]));
}

export async function writeContent(db, updates, allowedKeys) {
  const byKey = new Map();
  for (const update of updates) if (allowedKeys.includes(update.key)) byKey.set(update.key, { key: update.key, value: update.value });
  const rows = [...byKey.values()];
  if (rows.length) await run(db.from("site_content").upsert(rows, { onConflict: "key" }));
  return rows.length;
}

export async function readProjects(db) {
  const { data } = await run(db.from("site_projects").select("*"));
  return sortProjects(data.map(toProject));
}

export async function readProjectSlugs(db) {
  const { data } = await run(db.from("site_projects").select("slug"));
  return data.map((row) => row.slug).filter(Boolean);
}

export async function writeProject(db, { id, ...values }) {
  if (id) {
    const { data } = await run(db.from("site_projects").update(values).eq("id", id).select("id"));
    if (!data.length) throw notFound();
    return data[0].id;
  }
  const { data } = await run(db.from("site_projects").insert(values).select("id").single());
  return data.id;
}

export async function deleteRow(db, table, id) {
  await run(db.from(table).delete().eq("id", id));
}

export async function readTeam(db) {
  const { data } = await run(db.from("team_members").select("*"));
  return sortTeam(data.map(toTeamMember));
}

export async function writeTeamMember(db, { id, group, ...values }) {
  const row = { ...values, group_name: group };
  if (id) {
    const { data } = await run(db.from("team_members").update(row).eq("id", id).select("id"));
    if (!data.length) throw notFound();
    return data[0].id;
  }
  const { data } = await run(db.from("team_members").insert(row).select("id").single());
  return data.id;
}

export async function readMedia(db) {
  const { data } = await run(db.from("media_assets").select("*").order("created_at", { ascending: false }));
  return data.map(toMedia);
}

export async function writeMedia(db, values) {
  const { data } = await run(db.from("media_assets").insert(values).select("id").single());
  return data.id;
}

export const toRequest = (row) => ({ ...row, created_date: row.created_at });

export async function readRequests(db) {
  const { data } = await run(db.from("contact_requests").select("*").order("created_at", { ascending: false }));
  return data.map(toRequest);
}

export async function writeRequestStatus(db, id, status) {
  const { data } = await run(db.from("contact_requests").update({ status }).eq("id", id).select("id"));
  if (!data.length) throw notFound();
}

export async function readOverview(db) {
  const count = async (query) => (await run(query)).count ?? 0;
  const head = { count: "exact", head: true };
  const [projects, media, content, requests, openRequests] = await Promise.all([
    count(db.from("site_projects").select("id", head)),
    count(db.from("media_assets").select("id", head)),
    count(db.from("site_content").select("id", head)),
    count(db.from("contact_requests").select("id", head)),
    count(db.from("contact_requests").select("id", head).neq("status", "traite")),
  ]);
  return { projects, media, content, requests, openRequests };
}

export async function writeQuote(db, values) {
  const { data } = await run(db.from("contact_requests").insert({ ...values, status: "nouveau" }).select("id").single());
  return data.id;
}

// End-to-end over HTTP against the PRODUCTION BUILD (.output) with MOCKED Supabase services (tests/e2e/fake-supabase.mjs).
// Run `npm run build` first. This does not touch a real Supabase project.
import { spawn } from "node:child_process";
import { readFileSync, readdirSync } from "node:fs";
import { fromCrossJSON, toJSON } from "seroval";
import { mint, startFakeSupabase } from "./fake-supabase.mjs";

const FAKE = 54325;
const APP = 4195;
const fake = await startFakeSupabase(FAKE);
const ADMIN = "00000000-0000-4000-8000-0000000000a1";
const USER = "00000000-0000-4000-8000-0000000000b2";
const MFA = "00000000-0000-4000-8000-0000000000c3";
fake.db.profiles.push(
  { id: ADMIN, email: "admin@x.io", role: "admin", full_name: "Admin" },
  { id: USER, email: "user@x.io", role: "user", full_name: "User" },
  { id: MFA, email: "mfa@x.io", role: "admin", full_name: "Mfa Admin" },
);
const tokens = {
  admin: mint({ sub: ADMIN, email: "admin@x.io", aal: "aal1" }),
  user: mint({ sub: USER, email: "user@x.io" }),
  mfaAal1: mint({ sub: MFA, email: "mfa@x.io", aal: "aal1", factors: [{ status: "verified" }] }),
  mfaAal2: mint({ sub: MFA, email: "mfa@x.io", aal: "aal2", factors: [{ status: "verified" }] }),
  forged: mint({ sub: ADMIN, email: "admin@x.io" }, "wrong-secret"),
  expired: mint({ sub: ADMIN, email: "admin@x.io", exp: 1 }),
};

// server-function ids come from the build itself
const ids = {};
const dir = new URL("../../.output/server/_ssr/", import.meta.url);
for (const file of readdirSync(dir).filter((f) => f.endsWith(".mjs"))) {
  for (const m of readFileSync(new URL(file, dir), "utf8").matchAll(/id:\s*"([a-f0-9]{64})",\s*name:\s*"(\w+)"/g)) ids[m[2]] = m[1];
}

const server = spawn("node", [".output/server/index.mjs"], {
  env: { ...process.env, PORT: String(APP), SUPABASE_URL: `http://127.0.0.1:${FAKE}`, SUPABASE_SERVICE_ROLE_KEY: "svc-key" },
  stdio: "ignore",
});
for (let i = 0; i < 40; i++) {
  if (await fetch(`http://127.0.0.1:${APP}/robots.txt`).then((r) => r.ok, () => false)) break;
  await new Promise((r) => setTimeout(r, 500));
}

async function call(name, data, token, method = "POST") {
  const headers = { "x-tsr-serverFn": "true", accept: "application/json" };
  if (token) headers.authorization = `Bearer ${token}`;
  let url = `http://127.0.0.1:${APP}/_serverFn/${ids[name]}`;
  const payload = toJSON({ data, context: {} });
  const init = { method, headers };
  if (method === "POST") (headers["content-type"] = "application/json"), (init.body = JSON.stringify(payload));
  else if (data !== undefined) url += `?payload=${encodeURIComponent(JSON.stringify(payload))}`;
  const res = await fetch(url, init);
  const text = await res.text();
  let body;
  let error;
  try {
    const decoded = fromCrossJSON(JSON.parse(text), { refs: new Map() });
    body = decoded?.result;
    error = decoded?.error;
  } catch {
    body = text;
  }
  return { status: res.status, body, error };
}

let pass = 0, fail = 0;
const check = (label, ok, extra = "") => (ok ? pass++ : fail++, console.log(`${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `  <-- ${extra}`}`));
const KEY = /key:\s*"([^"]+)"/.exec(readFileSync(new URL("../../src/content/registry.js", import.meta.url), "utf8"))[1]; // a real, editable content key
const project = { title: "Projet E2E", slug: "projet-e2e", year: 2025, category: "Industrie", location: "Fès", status: "En cours", image: "https://x/y.jpg", summary: "s", description: "d", scope: ["CVC"], featured: true, display_order: 3 };

check("all 25 server functions found in the build", Object.keys(ids).length >= 25, Object.keys(ids).join(","));

// ---- authentication / authorization on every admin function
const adminCalls = [
  ["saveSiteContent", { updates: [{ key: KEY, value: "x" }] }],
  ["saveProject", project], ["deleteProject", { id: USER }],
  ["saveTeamMember", { name: "Nom", role: "Role", group: "Direction" }], ["deleteTeamMember", { id: USER }],
  ["createMedia", { kind: "image", url: "https://x/y.jpg" }], ["deleteMedia", { id: USER }],
  ["saveClient", { name: "Client test" }], ["deleteClient", { id: USER }],
  ["saveExpertise", { title: "Expertise test" }], ["deleteExpertise", { id: USER }], ["reorderExpertiseList", { ids: [USER] }],
  ["inviteUser", { email: "new@x.io", role: "admin" }],
  ["setContactRequestStatus", { id: USER, status: "traite" }], ["deleteContactRequest", { id: USER }],
];
for (const [name, data] of adminCalls) {
  const anon = await call(name, data);
  check(`${name}: anonymous -> 401`, anon.status === 401, anon.status);
  for (const [who, tok] of [["forged token", tokens.forged], ["expired token", tokens.expired], ["admin with MFA but aal1", tokens.mfaAal1]]) {
    const r = await call(name, data, tok);
    check(`${name}: ${who} -> 401`, r.status === 401, r.status);
  }
  const nonAdmin = await call(name, data, tokens.user);
  check(`${name}: signed-in non-admin -> 403`, nonAdmin.status === 403, nonAdmin.status);
}
for (const name of ["listMedia", "getAdminOverview", "listContactRequests", "listClients"]) {
  check(`${name}: anonymous -> 401`, (await call(name, undefined, undefined, "GET")).status === 401);
  check(`${name}: non-admin -> 403`, (await call(name, undefined, tokens.user, "GET")).status === 403);
}
check("no row was written by any rejected call", fake.db.site_projects.length + fake.db.team_members.length + fake.db.media_assets.length === 0 && fake.calls.invite.length === 0);

// ---- admin CRUD
const A = tokens.admin;
let r = await call("saveProject", project, A);
check("admin: create project", r.status === 200 && r.body?.ok && r.body.id, JSON.stringify(r));
const pid = r.body?.id;
r = await call("saveProject", { ...project, id: pid, title: "Projet E2E modifié" }, A);
check("admin: update project", r.status === 200 && fake.db.site_projects[0].title === "Projet E2E modifié", JSON.stringify(r));
r = await call("saveProject", { ...project, id: "00000000-0000-4000-8000-00000000dead" }, A);
check("admin: update of unknown project -> 404", r.status === 404, r.status);
r = await call("saveProject", { ...project, slug: "Pas Valide" }, A);
check("admin: invalid slug rejected by validation", r.status === 400 && !fake.db.site_projects.some((p) => p.slug === "Pas Valide"), r.status);
r = await call("getProjects", undefined, undefined, "GET");
check("public: list projects", r.status === 200 && r.body?.[0]?.title === "Projet E2E modifié" && r.body[0].created_date, JSON.stringify(r).slice(0, 200));
r = await call("saveTeamMember", { name: "Nom Prénom", role: "Directeur", group: "Direction", display_order: 1 }, A);
const tid = r.body?.id;
check("admin: create team member (group -> group_name)", r.status === 200 && fake.db.team_members[0].group_name === "Direction");
r = await call("getTeam", undefined, undefined, "GET");
check("public: team exposes `group`", r.body?.[0]?.group === "Direction" && !("group_name" in r.body[0]));
r = await call("saveSiteContent", { updates: [{ key: KEY, value: "Nouveau titre" }, { key: "not.in.registry", value: "x" }] }, A);
check("admin: save content (registry keys only)", r.status === 200 && r.body.saved === 1 && fake.db.site_content.length === 1, JSON.stringify(r));
r = await call("saveSiteContent", { updates: [{ key: KEY, value: "Titre 2" }] }, A);
check("admin: content upsert keeps one row", fake.db.site_content.length === 1 && fake.db.site_content[0].value === "Titre 2");
r = await call("getSiteContent", undefined, undefined, "GET");
check("public: read content", r.body?.[KEY] === "Titre 2", JSON.stringify(r));
r = await call("createMedia", { kind: "image", url: "https://x.supabase.co/storage/v1/object/public/media/uploads/a.jpg", title: "A" }, A);
const mid = r.body?.id;
check("admin: create media", r.status === 200 && mid);
r = await call("listMedia", undefined, A, "GET");
check("admin: list media (created_date alias)", r.status === 200 && r.body?.[0]?.created_date, JSON.stringify(r).slice(0, 200));
r = await call("submitQuoteRequest", { full_name: "Visiteur", email: "v@x.io", phone: "0600000000", service: "Piscines", message: "Bonjour, un devis svp." });
check("public: contact form stores a request (status nouveau)", r.status === 200 && fake.db.contact_requests[0]?.status === "nouveau" && r.body.reference, JSON.stringify(r));
r = await call("submitQuoteRequest", { full_name: "V", email: "not-an-email", phone: "1", service: "Autre", message: "x" });
check("public: invalid contact form rejected (400, nothing stored)", r.status === 400 && fake.db.contact_requests.length === 1, r.status);
r = await call("listContactRequests", undefined, A, "GET");
const reqId = r.body?.[0]?.id;
check("admin: list contact requests (newest first, created_date alias)", r.status === 200 && r.body.length === 1 && r.body[0].full_name === "Visiteur" && r.body[0].created_date, JSON.stringify(r).slice(0, 200));
r = await call("setContactRequestStatus", { id: reqId, status: "traite" }, A);
check("admin: mark a request as handled", r.status === 200 && fake.db.contact_requests[0].status === "traite", r.status);
r = await call("setContactRequestStatus", { id: reqId, status: "bogus" }, A);
check("admin: invalid status rejected (400)", r.status === 400, r.status);
r = await call("setContactRequestStatus", { id: "00000000-0000-4000-8000-00000000dead", status: "traite" }, A);
check("admin: status of unknown request -> 404", r.status === 404, r.status);
r = await call("setContactRequestStatus", { id: reqId, status: "nouveau" }, A);
check("admin: reopen a request", r.status === 200 && fake.db.contact_requests[0].status === "nouveau");
r = await call("getAdminOverview", undefined, A, "GET");
check("admin: overview counts", r.status === 200 && r.body.projects === 1 && r.body.media === 1 && r.body.requests === 1 && r.body.openRequests === 1, JSON.stringify(r));
r = await call("saveProject", project, tokens.mfaAal2);
check("admin with MFA + aal2 session is accepted", r.status === 200, r.status);

// ---- invite
r = await call("inviteUser", { email: "New@X.io", role: "admin" }, A);
const invited = fake.db.profiles.find((p) => p.email === "new@x.io");
check("admin: invite -> e-mail normalised, profile promoted to admin server-side", r.status === 200 && invited?.role === "admin" && fake.calls.invite.at(-1).email === "new@x.io", JSON.stringify(r));
r = await call("inviteUser", { email: "u2@x.io", role: "user" }, A);
check("admin: invite as plain user stays user", fake.db.profiles.find((p) => p.email === "u2@x.io")?.role === "user");
r = await call("inviteUser", { email: "exists@example.com", role: "user" }, A);
check("invite of an existing address -> 409", r.status === 409, r.status);
r = await call("inviteUser", { email: "bad", role: "root" }, A);
check("invite: invalid input rejected (400)", r.status === 400, r.status);

// ---- deletes
check("admin: delete project", (await call("deleteProject", { id: pid }, A)).status === 200 && fake.db.site_projects.length === 1 - 1 + 1 - 1 + (fake.db.site_projects.length > 0 && fake.db.site_projects[0].id !== pid ? 1 : 0));
check("admin: delete team member", (await call("deleteTeamMember", { id: tid }, A)).status === 200 && fake.db.team_members.length === 0);
check("admin: delete contact request", (await call("deleteContactRequest", { id: reqId }, A)).status === 200 && fake.db.contact_requests.length === 0);
check("admin: delete media", (await call("deleteMedia", { id: mid }, A)).status === 200 && fake.db.media_assets.length === 0);
check("db errors never reach the client", !JSON.stringify((await call("deleteProject", { id: "not-a-uuid" }, A)).body).includes("relation"));


// ---- NEW: expertises, logo, « Our Values » (all against the production build)
const page = async (path) => (await fetch(`http://127.0.0.1:${APP}${path}`)).text();
r = await call("getExpertises", undefined, undefined, "GET");
check("public: expertises fall back to the built-in list while the table does not exist", r.status === 200 && r.body?.source === "static" && r.body.items.length === 7 && r.body.items[0].number === "01", JSON.stringify(r).slice(0, 200));
r = await call("saveExpertise", { title: "Test" }, A);
check("admin: expertise edit refused with a clear 409 until the SQL is applied", r.status === 409, r.status);
let html = await page("/nos-expertises");
check("page: /nos-expertises still renders the built-in expertises", html.includes("Climatisation"), html.length);

fake.db.site_expertises = []; // = the SQL was applied
const base = { short: "", excerpt: "", description: "d", interventions: ["a", "b"], expertise: ["x"], image: "https://x.supabase.co/a.jpg" };
r = await call("saveExpertise", { ...base, title: "Climatisation & Ventilation", short: "CVC" }, A);
const eA = r.body?.id;
check("admin: create expertise (slug generated from the title, placed first)", r.status === 200 && fake.db.site_expertises[0]?.slug === "climatisation-et-ventilation" && fake.db.site_expertises[0].display_order === 0, JSON.stringify(r));
r = await call("saveExpertise", { ...base, title: "Piscines" }, A);
const eB = r.body?.id;
check("admin: new expertise goes last", r.status === 200 && fake.db.site_expertises[1]?.display_order === 1, JSON.stringify(r));
r = await call("getExpertises", undefined, undefined, "GET");
check("public: expertises now come from the database, numbered in order", r.body?.source === "db" && r.body.items.map((e) => e.number).join() === "01,02" && r.body.items[0].title === "Climatisation & Ventilation", JSON.stringify(r).slice(0, 220));
r = await call("reorderExpertiseList", { ids: [eB, eA] }, A);
r = await call("getExpertises", undefined, undefined, "GET");
check("admin: reorder changes the public display order", r.body?.items[0]?.title === "Piscines" && r.body.items[0].number === "01", JSON.stringify(r).slice(0, 220));
r = await call("saveExpertise", { ...base, id: eA, title: "Climatisation & Ventilation — Maroc", image: "https://x.supabase.co/new-cvc.jpg" }, A);
check("admin: edit title + image, slug unchanged", r.status === 200 && fake.db.site_expertises.find((e) => e.id === eA).slug === "climatisation-et-ventilation", JSON.stringify(r));
html = await page("/nos-expertises");
check("page: edited title and replaced image appear on the public page, persistently", html.includes("Climatisation &amp; Ventilation — Maroc") && html.includes("new-cvc.jpg"), html.length);
r = await call("submitQuoteRequest", { full_name: "Visiteur", email: "v@x.io", phone: "0600000000", service: "Climatisation & Ventilation — Maroc", message: "Bonjour, un devis svp pour le site." });
check("quote form accepts a renamed expertise", r.status === 200, JSON.stringify(r));
r = await call("submitQuoteRequest", { full_name: "Visiteur", email: "v@x.io", phone: "0600000000", service: "Service inventé", message: "Bonjour, un devis svp pour le site." });
check("quote form refuses a service that is not an expertise (400)", r.status === 400, r.status);
fake.db.contact_requests.length = 0;
check("admin: delete expertise", (await call("deleteExpertise", { id: eB }, A)).status === 200 && fake.db.site_expertises.length === 1);
check("admin: delete the last one -> empty list, NOT the built-in one", (await call("deleteExpertise", { id: eA }, A)).status === 200 && (await call("getExpertises", undefined, undefined, "GET")).body?.items.length === 0);

// ---- Presentation files (ex « Our Values ») now live on « Nos clients », not on « Notre équipe »
html = await page("/notre-equipe");
check("team page: the presentation section was removed", !html.includes("Our Values") && !html.includes("Télécharger la présentation") && !html.includes("<video") && html.includes("Comment nous travaillons"), html.length);
html = await page("/nos-clients");
check("clients page: while nothing is imported there is NO player, NO PDF button and no empty « Our Values » block", !html.includes("<video") && !html.includes("Télécharger la présentation") && !html.includes("Our Values"), html.length);
r = await call("saveSiteContent", { updates: [
  { key: "values.video_url", value: "https://x.supabase.co/storage/v1/object/public/media/values/video/v.mp4" },
  { key: "values.pdf_url", value: "https://x.supabase.co/storage/v1/object/public/media/values/pdf/p.pdf" },
  { key: "values.pdf_name", value: "presentation.pdf" },
  { key: "values.button_label", value: "Télécharger la présentation de GAFOTEC" },
] }, A);
check("admin: managed presentation keys (values.*) are still accepted", r.status === 200 && r.body.saved === 4, JSON.stringify(r));
html = await page("/nos-clients");
check("clients page: player + download button appear once files exist", html.includes("<video") && html.includes("v.mp4") && html.includes("download=presentation.pdf") && html.includes("Télécharger la présentation de GAFOTEC") && html.includes("Our Values"), html.length);
html = await page("/notre-equipe");
check("team page: still no presentation section even when the files exist", !html.includes("<video") && !html.includes("download=presentation.pdf"));
await call("saveSiteContent", { updates: ["values.video_url", "values.pdf_url"].map((key) => ({ key, value: "" })) }, A);
html = await page("/nos-clients");
check("clients page: deleting the files removes the player, the button and the section", !html.includes("<video") && !html.includes("download=presentation.pdf") && !html.includes("Our Values"));
await call("saveSiteContent", { updates: ["values.pdf_name"].map((key) => ({ key, value: "" })) }, A);

// ---- Home page background video
html = await page("/");
check("home: no video block while none is imported (static image only)", !html.includes("gh-media--video") && !html.includes("<video"), html.length);
r = await call("saveSiteContent", { updates: [
  { key: "home.hero.video_url", value: "https://x.supabase.co/storage/v1/object/public/media/home/hero/bg.mp4" },
  { key: "home.hero.video_path", value: "home/hero/bg.mp4" },
  { key: "home.hero.video_name", value: "bg.mp4" },
  { key: "home.hero.video_size", value: "1234" },
  { key: "home.hero.video_duration", value: "12" },
] }, A);
check("admin: home hero video keys are accepted", r.status === 200 && r.body.saved === 5, JSON.stringify(r));
html = await page("/");
check("home: hero switches to video mode (overlay class) but the <video> is only mounted in the browser (SSR keeps the image: poster/fallback)", html.includes("gh-media--video") && !html.includes("<video"), html.length);
check("home: hero text and both buttons are still rendered above the video", html.includes("Découvrir nos expertises") && html.includes("Demander un devis"));
await call("saveSiteContent", { updates: ["home.hero.video_url", "home.hero.video_path", "home.hero.video_name", "home.hero.video_size", "home.hero.video_duration"].map((key) => ({ key, value: "" })) }, A);
html = await page("/");
check("home: removing the video restores the plain image hero", !html.includes("gh-media--video"));
check("navigation: « Nos clients » link is in the header and the sitemap", html.includes("/nos-clients") && (await (await fetch(`http://127.0.0.1:${APP}/sitemap.xml`)).text()).includes("/nos-clients"));

// ---- Clients
r = await call("getClients", undefined, undefined, "GET");
check("public: clients -> empty + available:false while the SQL is not applied", r.status === 200 && r.body?.available === false && r.body.items.length === 0, JSON.stringify(r));
html = await page("/nos-clients");
check("page: /nos-clients shows the clean empty state (no crash, no invented client)", html.includes("La liste de nos clients arrive bientôt") && html.includes("Nous contacter"), html.length);
r = await call("listClients", undefined, A, "GET");
check("admin: list clients -> available:false until the SQL is applied", r.status === 200 && r.body?.available === false, JSON.stringify(r));
r = await call("saveClient", { name: "Client Alpha" }, A);
check("admin: client edit refused with a clear 409 until the SQL is applied", r.status === 409, r.status);

fake.db.site_clients = []; // = the SQL was applied
const LOGO = `http://127.0.0.1:${FAKE}/storage/v1/object/public/media/clients/uuid-alpha.png`; // same origin as SUPABASE_URL of the server
r = await call("saveClient", { name: "Client Alpha", sector: "Hôtellerie", description: "Un client de test.", website: "https://alpha.test", logo_url: LOGO, logo_path: "clients/uuid-alpha.png" }, A);
const cA = r.body?.id;
check("admin: create client (hidden by default, order assigned last)", r.status === 200 && cA && fake.db.site_clients[0].published === false && fake.db.site_clients[0].display_order === 0, JSON.stringify(r));
r = await call("getClients", undefined, undefined, "GET");
check("public: a hidden client is NOT returned", r.status === 200 && r.body.available === true && r.body.items.length === 0, JSON.stringify(r));
html = await page("/nos-clients");
check("page: a hidden client is NOT displayed", !html.includes("Client Alpha") && html.includes("La liste de nos clients arrive bientôt"));
r = await call("saveClient", { id: cA, name: "Client Alpha", sector: "Hôtellerie", description: "Un client de test.", website: "https://alpha.test", logo_url: LOGO, logo_path: "clients/uuid-alpha.png", published: true }, A);
check("admin: publish client", r.status === 200 && fake.db.site_clients[0].published === true, JSON.stringify(r));
r = await call("saveClient", { name: "Client Bravo", sector: "Industrie", published: true }, A);
const cB = r.body?.id;
check("admin: second client goes last", r.status === 200 && fake.db.site_clients[1].display_order === 1, JSON.stringify(r));
r = await call("getClients", undefined, undefined, "GET");
check("public: published clients in display order, WITHOUT storage path nor published flag", r.body.items.map((c) => c.name).join() === "Client Alpha,Client Bravo" && r.body.items.every((c) => !("logo_path" in c) && !("published" in c)), JSON.stringify(r).slice(0, 300));
html = await page("/nos-clients");
check("page: published clients are displayed with logo, sector and website (sector filter shown for 2 sectors)", html.includes("Client Alpha") && html.includes("uuid-alpha.png") && html.includes("alpha.test") && html.includes("Client Bravo") && html.includes("Filtrer par secteur") && !html.includes("La liste de nos clients arrive bientôt"), html.length);
r = await call("saveClient", { id: cB, name: "Client Bravo", sector: "Industrie", published: true, display_order: 0 }, A);
r = await call("saveClient", { id: cA, name: "Client Alpha", sector: "Hôtellerie", published: true, display_order: 5, logo_url: LOGO, logo_path: "clients/uuid-alpha.png" }, A);
r = await call("getClients", undefined, undefined, "GET");
check("admin: changing the display order changes the public order", r.body.items.map((c) => c.name).join() === "Client Bravo,Client Alpha", JSON.stringify(r).slice(0, 200));
r = await call("saveClient", { id: cA, name: "Client Alpha", published: false, logo_url: "", logo_path: "" }, A);
check("admin: hide client + remove its logo", r.status === 200 && fake.db.site_clients.find((c) => c.id === cA).logo_url === "" && (await call("getClients", undefined, undefined, "GET")).body.items.length === 1);
for (const [label, bad] of [["javascript: website", { website: "javascript:alert(1)" }], ["ftp website", { website: "ftp://x.test" }], ["logo from another host", { logo_url: "https://evil.test/storage/v1/object/public/media/clients/l.png", logo_path: "clients/l.png" }], ["logo url without path", { logo_url: LOGO }], ["logo url / path mismatch", { logo_url: LOGO, logo_path: "clients/other.png" }], ["logo path outside clients/", { logo_path: "../secrets/key.png" }], ["one-letter name", { name: "A" }], ["order out of range", { display_order: 100000 }]]) {
  const before = JSON.stringify(fake.db.site_clients);
  r = await call("saveClient", { name: "Client Test", ...bad }, A);
  check(`admin: invalid client refused (${label}) -> 400, nothing written`, r.status === 400 && JSON.stringify(fake.db.site_clients) === before, r.status);
}
r = await call("saveClient", { id: "00000000-0000-4000-8000-00000000dead", name: "Fantôme" }, A);
check("admin: update of an unknown client -> 404", r.status === 404, r.status);
r = await call("listClients", undefined, A, "GET");
check("admin: list clients returns hidden ones too, with the logo path", r.status === 200 && r.body.items.length === 2 && r.body.items.some((c) => c.published === false), JSON.stringify(r).slice(0, 250));
check("admin: delete client", (await call("deleteClient", { id: cA }, A)).status === 200 && fake.db.site_clients.length === 1);
check("admin: delete the last client -> back to the clean empty state", (await call("deleteClient", { id: cB }, A)).status === 200 && (await page("/nos-clients")).includes("La liste de nos clients arrive bientôt"));

r = await call("saveSiteContent", { updates: [{ key: "logo.url", value: "https://x.supabase.co/storage/v1/object/public/media/logo/new-logo.png" }, { key: "logo.height", value: "60" }, { key: "logo.width", value: "" }] }, A);
check("admin: logo keys are accepted", r.status === 200 && r.body.saved === 3, JSON.stringify(r));
for (const path of ["/", "/nos-expertises", "/notre-equipe", "/contact"]) {
  html = await page(path);
  check(`logo: new file and 60px height applied on ${path}`, html.includes("new-logo.png") && html.includes("height:60px"), path);
}

server.kill();
fake.close();
console.log(`\n${pass} passed, ${fail} failed (services MOCKED)`);
process.exit(fail ? 1 : 0);

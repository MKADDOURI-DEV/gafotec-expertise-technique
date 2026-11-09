// Verifies a REAL Supabase project end to end with throwaway data (everything it creates is deleted at the end):
// table CRUD through the service role, RLS for anon / signed-in non-admin / admin, and the Storage API
// (upload, duplicate, upsert, move, list, public URL, delete, MIME + permission rejections).
//   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... VITE_SUPABASE_PUBLISHABLE_KEY=... npm run verify:supabase
import { randomBytes } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const publishable = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_PUBLISHABLE_KEY;
if (!url || !serviceKey || !publishable) (console.error("Set SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY and VITE_SUPABASE_PUBLISHABLE_KEY."), process.exit(2));

const opts = { auth: { persistSession: false, autoRefreshToken: false } };
const service = createClient(url, serviceKey, opts);
const tag = `zz-verify-${randomBytes(4).toString("hex")}`;
const PNG = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==", "base64");

let pass = 0, fail = 0;
const check = (label, ok, detail = "") => (ok ? pass++ : fail++, console.log(`${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `  <-- ${detail}`}`));
const denied = (res) => !!res.error || (Array.isArray(res.data) && res.data.length === 0);

const created = { users: [], objects: [] };
async function makeUser(label, role) {
  const email = `${tag}-${label}@example.com`;
  const password = randomBytes(18).toString("base64url");
  const { data, error } = await service.auth.admin.createUser({ email, password, email_confirm: true });
  if (error) throw new Error(`createUser ${label}: ${error.message}`);
  created.users.push(data.user.id);
  for (let i = 0; i < 10; i++) {
    const { data: profile } = await service.from("profiles").select("id").eq("id", data.user.id).maybeSingle();
    if (profile) break;
    await new Promise((r) => setTimeout(r, 300));
  }
  if (role === "admin") await service.from("profiles").update({ role: "admin" }).eq("id", data.user.id);
  const client = createClient(url, publishable, opts);
  const { error: signInError } = await client.auth.signInWithPassword({ email, password });
  if (signInError) throw new Error(`sign in ${label}: ${signInError.message}`);
  return { id: data.user.id, client };
}

try {
  const anon = createClient(url, publishable, opts);
  const admin = await makeUser("admin", "admin");
  const user = await makeUser("user", "user");

  // ---- profiles / role protection
  let r = await admin.client.from("profiles").select("role").eq("id", admin.id).maybeSingle();
  check("admin reads own profile, role=admin", r.data?.role === "admin", JSON.stringify(r));
  r = await user.client.from("profiles").select("role").eq("id", user.id).maybeSingle();
  check("user reads own profile, role=user", r.data?.role === "user", JSON.stringify(r));
  r = await user.client.from("profiles").select("id").eq("id", admin.id);
  check("user cannot read another profile", denied(r), JSON.stringify(r));
  r = await user.client.from("profiles").update({ role: "admin" }).eq("id", user.id).select();
  check("user cannot promote themselves", denied(r), JSON.stringify(r));
  const after = await service.from("profiles").select("role").eq("id", user.id).single();
  check("role unchanged after the attempt", after.data?.role === "user");
  r = await admin.client.from("profiles").update({ role: "user" }).eq("id", admin.id).select();
  check("even an admin cannot change roles through the API", denied(r));

  // ---- anon / non-admin have no table access (all writes go through the server)
  for (const table of ["site_projects", "team_members", "site_content", "media_assets", "contact_requests"]) {
    check(`anon cannot read ${table}`, denied(await anon.from(table).select("id")));
    check(`signed-in non-admin cannot read ${table}`, denied(await user.client.from(table).select("id")));
  }
  check("anon cannot insert a contact request", !!(await anon.from("contact_requests").insert({ full_name: tag, email: "a@b.co", phone: "0600000000", service: "Piscines", message: "x" })).error);

  // ---- service-role CRUD (what the server functions do)
  const project = { title: `${tag} projet`, slug: tag, year: 2025, category: "Industrie", status: "En cours", scope: ["CVC"], featured: true, display_order: 1 };
  r = await service.from("site_projects").insert(project).select("id").single();
  check("service: insert project", !r.error && r.data?.id, r.error?.message);
  const pid = r.data?.id;
  r = await service.from("site_projects").insert(project).select("id").single();
  check("service: duplicate slug rejected (23505)", r.error?.code === "23505", JSON.stringify(r.error));
  r = await service.from("site_projects").insert({ ...project, slug: `${tag}-2`, category: "Nope" }).select("id").single();
  check("service: invalid category rejected by CHECK", !!r.error, JSON.stringify(r));
  r = await service.from("site_projects").update({ title: `${tag} modifié` }).eq("id", pid).select("id,title,updated_at");
  check("service: update project", r.data?.[0]?.title === `${tag} modifié`, JSON.stringify(r));
  r = await service.from("team_members").insert({ name: tag, role: "Test", group_name: "Direction" }).select("id").single();
  check("service: insert team member", !r.error, r.error?.message);
  const tid = r.data?.id;
  r = await service.from("site_content").upsert([{ key: `${tag}.a`, value: "1" }], { onConflict: "key" });
  r = await service.from("site_content").upsert([{ key: `${tag}.a`, value: "2" }], { onConflict: "key" });
  const content = await service.from("site_content").select("value").eq("key", `${tag}.a`);
  check("service: content upsert keeps one row", content.data?.length === 1 && content.data[0].value === "2");
  r = await service.from("media_assets").insert({ url: `https://example.com/${tag}.jpg`, kind: "image" }).select("id").single();
  check("service: insert media asset", !r.error, r.error?.message);
  const mid = r.data?.id;
  r = await service.from("contact_requests").insert({ full_name: tag, email: "a@b.co", phone: "0600000000", service: "Piscines", message: "test" }).select("id,status").single();
  check("service: insert contact request (status nouveau)", r.data?.status === "nouveau", JSON.stringify(r));
  const cid = r.data?.id;
  r = await service.from("contact_requests").insert({ full_name: tag, email: "a@b.co", phone: "1", service: "Pas un service", message: "x" });
  check("service: invalid service rejected by CHECK", !!r.error);
  check("service: count query (head)", ((await service.from("site_projects").select("id", { count: "exact", head: true })).count ?? 0) >= 1);

  // ---- Storage API
  const bucket = (client) => client.storage.from("media");
  const path = `verify/${tag}/a.png`;
  r = await bucket(anon).upload(path, PNG, { contentType: "image/png" });
  check("storage: anon upload rejected", !!r.error, JSON.stringify(r));
  r = await bucket(user.client).upload(path, PNG, { contentType: "image/png" });
  check("storage: signed-in non-admin upload rejected", !!r.error, JSON.stringify(r));
  r = await bucket(admin.client).upload(path, PNG, { contentType: "image/png" });
  check("storage: admin upload", !r.error, r.error?.message);
  created.objects.push(path);
  r = await bucket(admin.client).upload(path, PNG, { contentType: "image/png" });
  check("storage: same path without upsert is refused", !!r.error, JSON.stringify(r));
  r = await bucket(admin.client).upload(path, PNG, { contentType: "image/png", upsert: true });
  check("storage: admin upsert", !r.error, r.error?.message);
  r = await bucket(admin.client).list(`verify/${tag}`);
  check("storage: admin list", r.data?.some((o) => o.name === "a.png"), JSON.stringify(r));
  r = await bucket(user.client).list(`verify/${tag}`);
  check("storage: non-admin list is empty", !r.error && r.data?.length === 0, JSON.stringify(r));
  const pub = bucket(anon).getPublicUrl(path).data.publicUrl;
  let res = await fetch(pub);
  check("storage: public URL serves the image without auth", res.ok && (res.headers.get("content-type") ?? "").startsWith("image/png"), `${res.status}`);
  const moved = `verify/${tag}/b.png`;
  r = await bucket(user.client).move(path, `verify/${tag}/stolen.png`);
  check("storage: non-admin move rejected", !!r.error, JSON.stringify(r));
  r = await bucket(admin.client).move(path, moved);
  check("storage: admin move/rename", !r.error, r.error?.message);
  created.objects.push(moved);
  res = await fetch(bucket(anon).getPublicUrl(moved).data.publicUrl);
  check("storage: renamed file is reachable", res.ok, `${res.status}`);
  r = await bucket(admin.client).upload(`verify/${tag}/x.svg`, Buffer.from("<svg xmlns='http://www.w3.org/2000/svg'/>"), { contentType: "image/svg+xml" });
  check("storage: SVG upload rejected by MIME allow-list", !!r.error, JSON.stringify(r));
  r = await bucket(user.client).remove([moved]);
  res = await fetch(bucket(anon).getPublicUrl(moved).data.publicUrl);
  check("storage: non-admin delete does not remove the file", res.ok, `${res.status}`);
  r = await bucket(admin.client).remove([moved]);
  check("storage: admin delete", !r.error && r.data?.length === 1, JSON.stringify(r));
  res = await fetch(bucket(anon).getPublicUrl(moved).data.publicUrl);
  check("storage: deleted file is gone", !res.ok, `${res.status}`);

  // ---- cleanup of the rows created above
  for (const [table, id] of [["site_projects", pid], ["team_members", tid], ["media_assets", mid], ["contact_requests", cid]]) if (id) await service.from(table).delete().eq("id", id);
} catch (error) {
  fail++;
  console.error("ABORTED:", error.message);
} finally {
  if (created.objects.length) await service.storage.from("media").remove(created.objects);
  await service.from("site_content").delete().like("key", `${tag}%`);
  await service.from("site_projects").delete().like("slug", `${tag}%`);
  for (const id of created.users) await service.auth.admin.deleteUser(id);
  console.log(`\n${pass} passed, ${fail} failed (REAL Supabase: ${new URL(url).host})`);
  process.exit(fail ? 1 : 0);
}

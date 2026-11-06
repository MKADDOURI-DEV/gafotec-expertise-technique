import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireUser } from "@/lib/auth-middleware";
import { contentKeys } from "@/content/registry";

const PROJECT_CATEGORIES = ["Industrie", "Hôtellerie", "Enseignement", "Tourisme", "Résidentiel"];

function forbid() {
  throw Object.assign(new Error("Accès réservé aux administrateurs"), { status: 403 });
}

function assertAdmin(context) {
  if (context.user?.role !== "admin") forbid();
}

/* ------------------------------------------------------------------ content */

/** Public: the overrides the owner saved, as a { key: value } map. */
export const getSiteContent = createServerFn({ method: "GET" }).handler(async ({ context }) => {
  const rows = await context.getBase44().asServiceRole.entities.SiteContent.filter({});
  return Object.fromEntries(rows.filter((row) => row.key).map((row) => [row.key, row.value ?? ""]));
});

export const saveSiteContent = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(
    z.object({
      updates: z
        .array(z.object({ key: z.string().max(120), value: z.string().max(8000) }))
        .min(1)
        .max(100),
    }),
  )
  .handler(async ({ data, context }) => {
    assertAdmin(context);
    const db = context.getBase44().asServiceRole;
    const existing = new Map(
      (await db.entities.SiteContent.filter({})).map((row) => [row.key, row]),
    );

    const creates = [];
    const updates = [];
    for (const update of data.updates) {
      if (!contentKeys.includes(update.key)) continue;
      const current = existing.get(update.key);
      if (current) updates.push({ id: current.id, value: update.value });
      else creates.push({ key: update.key, value: update.value });
    }

    if (creates.length) await db.entities.SiteContent.bulkCreate(creates);
    if (updates.length) await db.entities.SiteContent.bulkUpdate(updates);
    return { ok: true, saved: creates.length + updates.length };
  });

/* ----------------------------------------------------------------- projects */

const sortProjects = (rows) =>
  [...rows].sort(
    (a, b) => (a.display_order ?? 999) - (b.display_order ?? 999) || (a.year ?? 0) - (b.year ?? 0),
  );

/** Public: every reference, already ordered for the site. */
export const getProjects = createServerFn({ method: "GET" }).handler(async ({ context }) => {
  const rows = await context.getBase44().asServiceRole.entities.SiteProject.filter({});
  return sortProjects(rows.map((row) => ({ ...row, scope: Array.isArray(row.scope) ? row.scope : [] })));
});

const projectSchema = z.object({
  title: z.string().trim().min(2).max(160),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(160)
    .regex(/^[a-z0-9-]+$/, "Identifiant d’URL invalide (minuscules, chiffres et tirets)"),
  year: z.coerce.number().int().min(1990).max(2100),
  category: z.enum(PROJECT_CATEGORIES),
  location: z.string().trim().max(120),
  status: z.enum(["Livré", "En cours"]),
  image: z.string().trim().max(700),
  summary: z.string().trim().max(800),
  description: z.string().trim().max(5000),
  scope: z.array(z.string().trim().min(1).max(220)).max(20),
  featured: z.boolean().optional().default(false),
  display_order: z.coerce.number().int().min(0).max(999).optional(),
});

export const saveProject = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(projectSchema.extend({ id: z.string().optional() }))
  .handler(async ({ data, context }) => {
    assertAdmin(context);
    const db = context.getBase44().asServiceRole;
    const { id, ...values } = data;
    const record = id
      ? await db.entities.SiteProject.update(id, values)
      : await db.entities.SiteProject.create(values);
    return { ok: true, id: record.id };
  });

export const deleteProject = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(z.object({ id: z.string() }))
  .handler(async ({ data, context }) => {
    assertAdmin(context);
    await context.getBase44().asServiceRole.entities.SiteProject.delete(data.id);
    return { ok: true };
  });

/* --------------------------------------------------------------------- team */

const TEAM_GROUPS = ["Direction", "Études", "Chantier", "Support"];

/** Public: the team as displayed on « Notre équipe », already ordered. */
export const getTeam = createServerFn({ method: "GET" }).handler(async ({ context }) => {
  const rows = await context.getBase44().asServiceRole.entities.TeamMember.filter({});
  return [...rows].sort((a, b) => (a.display_order ?? 999) - (b.display_order ?? 999));
});

export const saveTeamMember = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(
    z.object({
      id: z.string().optional(),
      name: z.string().trim().min(2).max(120),
      role: z.string().trim().min(2).max(160),
      group: z.enum(TEAM_GROUPS),
      display_order: z.coerce.number().int().min(0).max(999).optional(),
    }),
  )
  .handler(async ({ data, context }) => {
    assertAdmin(context);
    const db = context.getBase44().asServiceRole;
    const { id, ...values } = data;
    const record = id
      ? await db.entities.TeamMember.update(id, values)
      : await db.entities.TeamMember.create(values);
    return { ok: true, id: record.id };
  });

export const deleteTeamMember = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(z.object({ id: z.string() }))
  .handler(async ({ data, context }) => {
    assertAdmin(context);
    await context.getBase44().asServiceRole.entities.TeamMember.delete(data.id);
    return { ok: true };
  });

/* -------------------------------------------------------------------- media */

export const listMedia = createServerFn({ method: "GET" })
  .middleware([requireUser])
  .handler(async ({ context }) => {
    assertAdmin(context);
    const rows = await context.getBase44().asServiceRole.entities.MediaAsset.filter({});
    return [...rows].sort((a, b) => String(b.created_date).localeCompare(String(a.created_date)));
  });

export const createMedia = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(
    z.object({
      title: z.string().trim().max(200).optional().default(""),
      kind: z.enum(["image", "video"]),
      url: z.string().trim().min(4).max(900),
      alt: z.string().trim().max(300).optional().default(""),
    }),
  )
  .handler(async ({ data, context }) => {
    assertAdmin(context);
    const record = await context.getBase44().asServiceRole.entities.MediaAsset.create(data);
    return { ok: true, id: record.id };
  });

export const deleteMedia = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(z.object({ id: z.string() }))
  .handler(async ({ data, context }) => {
    assertAdmin(context);
    await context.getBase44().asServiceRole.entities.MediaAsset.delete(data.id);
    return { ok: true };
  });

/* ------------------------------------------------------------------ summary */

export const getAdminOverview = createServerFn({ method: "GET" })
  .middleware([requireUser])
  .handler(async ({ context }) => {
    assertAdmin(context);
    const db = context.getBase44().asServiceRole;
    const [projects, media, content, requests] = await Promise.all([
      db.entities.SiteProject.filter({}),
      db.entities.MediaAsset.filter({}),
      db.entities.SiteContent.filter({}),
      db.entities.ContactRequest.filter({}),
    ]);
    const open = requests.filter((item) => item.status !== "traite").length;
    return {
      projects: projects.length,
      media: media.length,
      content: content.length,
      requests: requests.length,
      openRequests: open,
    };
  });
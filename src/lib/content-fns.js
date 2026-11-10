import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { assertAdmin } from "@/lib/auth-core";
import { requireUser } from "@/lib/auth-middleware";
import { contentKeys } from "@/content/registry";
import {
  deleteRow,
  readContent,
  readMedia,
  readOverview,
  readProjects,
  readRequests,
  readTeam,
  writeContent,
  writeMedia,
  writeProject,
  writeRequestStatus,
  writeTeamMember,
} from "@/lib/data-api";
import { getAdminDb } from "@/lib/supabase-admin";

// Public reads (the site itself) use no sign-in. Every other function: requireUser (401) then assertAdmin (403),
// both BEFORE the service-role client is created.

const PROJECT_CATEGORIES = ["Industrie", "Hôtellerie", "Enseignement", "Tourisme", "Résidentiel"];
const TEAM_GROUPS = ["Direction", "Études", "Chantier", "Support"];
const id = z.string().uuid();

// ---- Editable site text ----------------------------------------------------------------------------------------

export const getSiteContent = createServerFn({ method: "GET" }).handler(async () => readContent(await getAdminDb()));

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
    assertAdmin(context.user);
    const saved = await writeContent(await getAdminDb(), data.updates, contentKeys);
    return { ok: true, saved };
  });

// ---- Projects --------------------------------------------------------------------------------------------------

export const getProjects = createServerFn({ method: "GET" }).handler(async () => readProjects(await getAdminDb()));

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
  .validator(projectSchema.extend({ id: id.optional() }))
  .handler(async ({ data, context }) => {
    assertAdmin(context.user);
    return { ok: true, id: await writeProject(await getAdminDb(), data) };
  });

export const deleteProject = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(z.object({ id }))
  .handler(async ({ data, context }) => {
    assertAdmin(context.user);
    await deleteRow(await getAdminDb(), "site_projects", data.id);
    return { ok: true };
  });

// ---- Team ------------------------------------------------------------------------------------------------------

export const getTeam = createServerFn({ method: "GET" }).handler(async () => readTeam(await getAdminDb()));

export const saveTeamMember = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(
    z.object({
      id: id.optional(),
      name: z.string().trim().min(2).max(120),
      role: z.string().trim().min(2).max(160),
      group: z.enum(TEAM_GROUPS),
      display_order: z.coerce.number().int().min(0).max(999).optional(),
    }),
  )
  .handler(async ({ data, context }) => {
    assertAdmin(context.user);
    return { ok: true, id: await writeTeamMember(await getAdminDb(), data) };
  });

export const deleteTeamMember = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(z.object({ id }))
  .handler(async ({ data, context }) => {
    assertAdmin(context.user);
    await deleteRow(await getAdminDb(), "team_members", data.id);
    return { ok: true };
  });

// ---- Media library ---------------------------------------------------------------------------------------------

export const listMedia = createServerFn({ method: "GET" })
  .middleware([requireUser])
  .handler(async ({ context }) => {
    assertAdmin(context.user);
    return readMedia(await getAdminDb());
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
    assertAdmin(context.user);
    return { ok: true, id: await writeMedia(await getAdminDb(), data) };
  });

export const deleteMedia = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(z.object({ id }))
  .handler(async ({ data, context }) => {
    assertAdmin(context.user);
    await deleteRow(await getAdminDb(), "media_assets", data.id);
    return { ok: true };
  });

// ---- Quote requests (the contact form) -------------------------------------------------------------------------

export const listContactRequests = createServerFn({ method: "GET" })
  .middleware([requireUser])
  .handler(async ({ context }) => {
    assertAdmin(context.user);
    return readRequests(await getAdminDb());
  });

export const setContactRequestStatus = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(z.object({ id, status: z.enum(["nouveau", "traite"]) }))
  .handler(async ({ data, context }) => {
    assertAdmin(context.user);
    await writeRequestStatus(await getAdminDb(), data.id, data.status);
    return { ok: true };
  });

export const deleteContactRequest = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(z.object({ id }))
  .handler(async ({ data, context }) => {
    assertAdmin(context.user);
    await deleteRow(await getAdminDb(), "contact_requests", data.id);
    return { ok: true };
  });

// ---- Dashboard overview ----------------------------------------------------------------------------------------

export const getAdminOverview = createServerFn({ method: "GET" })
  .middleware([requireUser])
  .handler(async ({ context }) => {
    assertAdmin(context.user);
    return readOverview(await getAdminDb());
  });

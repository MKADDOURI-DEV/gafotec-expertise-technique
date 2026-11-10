import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";
import { HttpError, assertAdmin } from "@/lib/auth-core";
import { requireUser } from "@/lib/auth-middleware";
import { getAdminDb } from "@/lib/supabase-admin";

/**
 * Invites a person by e-mail (used by the "change e-mail address" card). Admin only: requireUser (401), then
 * assertAdmin (403), and only then the service role. The role is set here, server-side; there is no other way
 * to obtain the admin role (profiles is not writable from the API).
 */
export const inviteUser = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(
    z.object({
      email: z.string().trim().toLowerCase().email().max(180),
      role: z.enum(["admin", "user"]).default("user"),
    }),
  )
  .handler(async ({ data, context }) => {
    assertAdmin(context.user);
    const db = await getAdminDb();
    const redirectTo = `${new URL(getRequest().url).origin}/reset-password`;

    const { data: invited, error } = await db.auth.admin.inviteUserByEmail(data.email, { redirectTo });
    if (error || !invited?.user) {
      console.error("[invite]", error?.code, error?.message);
      const exists = error?.status === 422 || /already/i.test(error?.message ?? "");
      throw new HttpError(exists ? 409 : 502, exists ? "Cette adresse est déjà enregistrée." : "Envoi impossible.");
    }

    if (data.role === "admin") {
      const { error: roleError } = await db.from("profiles").update({ role: "admin" }).eq("id", invited.user.id);
      if (roleError) {
        console.error("[invite] role", roleError.code, roleError.message);
        throw new HttpError(500, "Invitation envoyée, mais le rôle n’a pas pu être appliqué.");
      }
    }
    return { ok: true };
  });

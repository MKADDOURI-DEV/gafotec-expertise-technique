import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { writeQuote } from "@/lib/data-api";
import { getAdminDb } from "@/lib/supabase-admin";

export const getServerInfo = createServerFn({ method: "GET" }).handler(async () => ({
  renderedAt: new Date().toISOString(),
}));

const quoteSchema = z.object({
  full_name: z.string().trim().min(2, "Nom trop court").max(120),
  company: z.string().trim().max(160).optional().default(""),
  email: z.string().trim().toLowerCase().email("Adresse e-mail invalide").max(180),
  phone: z.string().trim().min(6, "Téléphone invalide").max(40),
  service: z.enum([
    "Climatisation & Ventilation",
    "Plomberie sanitaire",
    "Chauffage central",
    "Protection contre l’incendie",
    "Désenfumage",
    "Piscines",
    "Énergie solaire photovoltaïque",
    "Autre / Plusieurs métiers",
  ]),
  message: z.string().trim().min(15, "Merci de détailler votre projet").max(4000),
});

/**
 * Public quotation request. Deliberately open (no sign-in): input is bounded by
 * the schema above and the record is written with the service role, so the
 * table itself stays readable by the company's admins only.
 */
export const submitQuoteRequest = createServerFn({ method: "POST" })
  .validator(quoteSchema)
  .handler(async ({ data }) => {
    const reference = await writeQuote(await getAdminDb(), {
      full_name: data.full_name,
      company: data.company ?? "",
      email: data.email,
      phone: data.phone,
      service: data.service,
      message: data.message,
    });

    return { ok: true, reference };
  });

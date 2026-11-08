// Server only. The service-role client is built per call from Cloudflare secrets and never leaves the Worker:
// it is only reached from server-function handlers, which the TanStack compiler strips from the browser bundle
// (checked by `npm run check:bundle`).
import { createClient } from "@supabase/supabase-js";

let workersEnv;

async function readEnv(name) {
  if (workersEnv === undefined) {
    try {
      const specifier = "cloudflare:workers"; // runtime-only module, not resolvable in Node or the browser build
      workersEnv = (await import(/* @vite-ignore */ specifier)).env ?? null;
    } catch {
      workersEnv = null;
    }
  }
  return workersEnv?.[name] ?? (typeof process !== "undefined" ? process.env?.[name] : undefined);
}

export async function getAdminDb() {
  const url = (await readEnv("SUPABASE_URL")) ?? import.meta.env?.VITE_SUPABASE_URL;
  const key = await readEnv("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) {
    throw Object.assign(new Error("Serveur non configuré"), { status: 500, code: "MISSING_SERVER_ENV" });
  }
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } });
}

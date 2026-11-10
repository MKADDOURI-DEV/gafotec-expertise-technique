// Server only. The service-role client is built per call from server environment variables and never leaves the
// server: it is only reached from server-function handlers, which the TanStack compiler strips from the browser
// bundle (checked by `npm run check:bundle`).
import { createClient } from "@supabase/supabase-js";

export function readServerEnv(env = process.env) {
  const url = env.SUPABASE_URL || env.VITE_SUPABASE_URL;
  const key = env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw Object.assign(new Error("Serveur non configuré"), { status: 500, code: "MISSING_SERVER_ENV" });
  }
  return { url, key };
}

export async function getAdminDb() {
  const { url, key } = readServerEnv();
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } });
}

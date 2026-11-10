// Browser client: public URL + publishable key only (both are meant to be public). Never put the service-role key here.
import { createClient } from "@supabase/supabase-js";

let client;

export function getSupabase() {
  if (client) return client;
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) throw new Error("Supabase n’est pas configuré (VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY).");
  client = createClient(url, key, {
    auth: { flowType: "pkce", persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
  });
  return client;
}

export async function getAccessToken() {
  const { data } = await getSupabase().auth.getSession();
  return data.session?.access_token ?? null;
}

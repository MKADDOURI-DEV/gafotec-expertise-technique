import { getSupabase } from "@/lib/supabase";

export const googleLoginEnabled = () => import.meta.env.VITE_ENABLE_GOOGLE_LOGIN === "true";

const MESSAGES = {
  invalid_credentials: "Invalid email or password",
  email_not_confirmed: "Please confirm your email address first",
  over_request_rate_limit: "Too many attempts. Please try again later.",
};

export const authMessage = (error, fallback) => MESSAGES[error?.code] ?? error?.message ?? fallback;

// Password sign-in. An account with a verified authenticator app still owes its second step (aal2).
export async function loginWithMfa(email, password) {
  const supabase = getSupabase();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error(authMessage(error, "Invalid email or password"));
  const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  return aal?.nextLevel === "aal2" && aal.currentLevel !== "aal2" ? { mfa_required: true } : { mfa_required: false };
}

// Second step: our own /mfa page (TOTP), then back to where the visitor was going.
export async function continueMfa(_result, returnTo) {
  window.location.assign(`/mfa?returnTo=${encodeURIComponent(returnTo || "/")}`);
}

// provider: "google". Needs the Google provider enabled in Supabase and VITE_ENABLE_GOOGLE_LOGIN=true.
export async function loginWithSocial(provider, returnTo) {
  const { error } = await getSupabase().auth.signInWithOAuth({
    provider,
    options: { redirectTo: new URL(returnTo || "/", window.location.origin).href },
  });
  if (error) throw new Error(authMessage(error, "Unable to sign in"));
}

export function loginWithGoogle(returnTo) {
  return loginWithSocial("google", returnTo);
}

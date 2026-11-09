// Second-factor flow on Supabase Auth: TOTP (authenticator app). Same exports as before so the MFA screens are unchanged;
// SMS and trusted-device management are not offered (Supabase would need a paid SMS provider).
import { getSupabase } from "@/lib/supabase";
import { loginWithSocial } from "@/lib/authMfa";

export class MfaError extends Error {
  constructor(message, status, retryAfter) {
    super(message);
    this.status = status;
    this.retryAfter = retryAfter;
  }
  get mustSignInAgain() {
    return this.status === 401;
  }
}

const toMfaError = (error) =>
  error instanceof MfaError
    ? error
    : new MfaError(
        error?.code === "mfa_verification_failed" ? "Invalid code" : (error?.message ?? "Something went wrong. Try again."),
        error?.status === 401 || error?.code === "session_not_found" ? 401 : (error?.status ?? 400),
      );

const unsupported = () => Promise.reject(new MfaError("This option is not available.", 400));
const formatSecret = (secret) => secret.replace(/\s+/g, "").replace(/(.{4})/g, "$1 ").trim();

// What the visitor still has to do, given the current session.
async function challengeFor(supabase) {
  const { data: factors, error } = await supabase.auth.mfa.listFactors();
  if (error) throw toMfaError(error);
  const verified = (factors?.totp ?? []).filter((factor) => factor.status === "verified");
  return verified.length
    ? { next_step: "verify", mfa_methods: ["totp"], factor_id: verified[0].id }
    : { next_step: "enroll", mfa_methods: [] };
}

export function mfaSession(challenge) {
  const supabase = getSupabase();
  let factorId = challenge.factor_id;

  const confirm = async (code) => {
    try {
      const { error } = await supabase.auth.mfa.challengeAndVerify({ factorId, code });
      if (error) throw error;
      const { data } = await supabase.auth.getSession();
      return { access_token: data.session?.access_token };
    } catch (error) {
      throw toMfaError(error);
    }
  };

  return {
    verify: (code) => confirm(code),
    sendSignInCode: async () => ({}),
    setupAuthenticator: async () => {
      try {
        // Drop abandoned, never-verified enrolments so they do not pile up.
        const { data: factors } = await supabase.auth.mfa.listFactors();
        for (const factor of factors?.all ?? []) {
          if (factor.status === "unverified") await supabase.auth.mfa.unenroll({ factorId: factor.id });
        }
        const { data, error } = await supabase.auth.mfa.enroll({ factorType: "totp", friendlyName: `GAFOTEC ${Date.now()}` });
        if (error) throw error;
        factorId = data.id;
        return { qr_code: data.totp.qr_code, secret_formatted: formatSecret(data.totp.secret) };
      } catch (error) {
        throw toMfaError(error);
      }
    },
    confirmAuthenticator: (code) => confirm(code),
    sendPhoneCode: unsupported,
    confirmPhone: unsupported,
    status: async () => ({}),
    sendProofCode: unsupported,
    removeMethod: unsupported,
    forgetDevices: unsupported,
  };
}

// "Manage" sign-in used by /mfa when nobody is signed in yet.
export async function signInToManageMfa(email, password) {
  const supabase = getSupabase();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw toMfaError(error);
  return challengeFor(supabase);
}

let resumed;
// On /mfa: continue the sign-in that is already under way, if any.
export function resumeMfa() {
  resumed ||= (async () => {
    const supabase = getSupabase();
    const { data } = await supabase.auth.getSession();
    if (!data.session) return null; // nobody signed in: show the sign-in form
    const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    if (aal?.currentLevel === "aal2") return { access_token: data.session.access_token }; // nothing left to do
    return challengeFor(supabase);
  })();
  return resumed;
}

// Sign-in options shown by the MFA screens.
export async function loadSignInOptions() {
  return {
    name: "GAFOTEC",
    auth_config: {
      enable_username_password: true,
      enable_google_login: import.meta.env.VITE_ENABLE_GOOGLE_LOGIN === "true",
      enable_sms_mfa: false,
      mfa_policy: "optional",
    },
  };
}

export function signInWithProvider(provider, returnTo) {
  return provider === "google" ? loginWithSocial("google", returnTo) : Promise.reject(new MfaError("Provider not available.", 400));
}

export function finishSignIn(_accessToken, returnTo) {
  window.location.href = returnTo;
}

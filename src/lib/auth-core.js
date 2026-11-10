// Framework-free auth logic (unit-tested). The TanStack middleware in auth-middleware.js is a thin wrapper.

export class HttpError extends Error {
  constructor(status, message, code) {
    super(message);
    this.name = "HttpError";
    this.status = status;
    this.code = code;
  }
}

export const unauthorized = () => new HttpError(401, "Unauthorized", "UNAUTHORIZED");
export const forbidden = () => new HttpError(403, "Accès réservé aux administrateurs", "FORBIDDEN");
export const notFound = () => new HttpError(404, "Introuvable", "NOT_FOUND");

/** The JWT from an `Authorization: Bearer <jwt>` header, or null. */
export function bearerToken(header) {
  const match = /^Bearer\s+([\w-]+\.[\w-]+\.[\w-]+)$/i.exec(header ?? "");
  return match ? match[1] : null;
}

/** Claims of a JWT, WITHOUT verifying it (verification is done by Supabase Auth in resolveUser). */
export function jwtClaims(token) {
  try {
    const payload = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(payload.padEnd(Math.ceil(payload.length / 4) * 4, "=")));
  } catch {
    return {};
  }
}

const REJECTION_CODES = new Set(["bad_jwt", "invalid_jwt", "user_not_found", "session_not_found", "session_expired"]);

// Only an auth rejection means "not signed in"; outages and 5xx propagate as themselves.
function isRejection(error) {
  if (error.name === "AuthSessionMissingError" || error.name === "AuthInvalidJwtError") return true;
  if (REJECTION_CODES.has(error.code)) return true;
  return [400, 401, 403, 404].includes(error.status);
}

/**
 * Resolves the caller from a Supabase access token, using a service-role client (`db`, server only).
 * - the token is verified by Supabase Auth (`auth.getUser`), never merely decoded;
 * - an account with a verified MFA factor needs an `aal2` session, otherwise it is treated as signed out;
 * - the role comes from `profiles` (only the service role can change it).
 */
export async function resolveUser(token, db) {
  if (!token) return null;
  const { data, error } = await db.auth.getUser(token);
  if (error) {
    if (isRejection(error)) return null;
    throw error;
  }
  const authUser = data?.user;
  if (!authUser) return null;

  const hasVerifiedFactor = (authUser.factors ?? []).some((factor) => factor.status === "verified");
  if (hasVerifiedFactor && jwtClaims(token).aal !== "aal2") return null;

  const { data: profile, error: profileError } = await db
    .from("profiles")
    .select("role, full_name, created_at")
    .eq("id", authUser.id)
    .maybeSingle();
  if (profileError) throw profileError;

  return {
    id: authUser.id,
    email: authUser.email,
    full_name: profile?.full_name ?? authUser.user_metadata?.full_name ?? null,
    role: profile?.role === "admin" ? "admin" : "user",
    created_date: profile?.created_at ?? authUser.created_at,
  };
}

export function assertAdmin(user) {
  if (user?.role !== "admin") throw forbidden();
}

/** TanStack wraps a failed validator into an Error whose message is the JSON list of issues. */
export function isValidationError(error) {
  if (Array.isArray(error?.issues)) return true;
  try {
    const parsed = JSON.parse(error?.message ?? "");
    return Array.isArray(parsed) && parsed.length > 0 && parsed.every((issue) => issue && typeof issue === "object" && "path" in issue && "message" in issue);
  } catch {
    return false;
  }
}

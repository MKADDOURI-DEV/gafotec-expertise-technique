import { createMiddleware } from "@tanstack/react-start";
import { getRequest, setResponseStatus } from "@tanstack/react-start/server";
import { bearerToken, isValidationError, resolveUser, unauthorized } from "@/lib/auth-core";
import { getAccessToken } from "@/lib/supabase";
import { getAdminDb } from "@/lib/supabase-admin";

// Applied to every server function by src/start.js: sends the visitor's Supabase access token with the call
// (anonymous visitors send nothing) and maps thrown errors to HTTP statuses.
export const authMiddleware = createMiddleware({ type: "function" })
  .client(async ({ next }) => {
    const token = typeof window === "undefined" ? null : await getAccessToken().catch(() => null);
    return next({ headers: token ? { Authorization: `Bearer ${token}` } : {} });
  })
  .server(async ({ next }) => {
    // The error itself still reaches the caller; this only gives the HTTP response its real status
    // (403 not an admin, 404, 409 duplicate, 400 invalid input) instead of 200.
    try {
      return await next();
    } catch (error) {
      const status = typeof error?.status === "number" ? error.status : isValidationError(error) ? 400 : null;
      if (status) setResponseStatus(status);
      throw error;
    }
  });

async function currentUser(request) {
  const token = bearerToken(request.headers.get("authorization"));
  return token ? resolveUser(token, await getAdminDb()) : null;
}

// Add to a server function that needs a signed-in caller: rejects anonymous callers (401) and sets `context.user`
//   createServerFn().middleware([requireUser]).handler(({ context }) => { assertAdmin(context.user); ... })
export const requireUser = createMiddleware({ type: "function" }).server(async ({ next }) => {
  const user = await currentUser(getRequest());
  if (!user) {
    setResponseStatus(401);
    throw unauthorized();
  }
  return next({ context: { user } });
});

// The same for a server route under src/routes/api/*.
export const requireUserRoute = createMiddleware({ type: "request" }).server(async ({ next, request }) => {
  const user = await currentUser(request);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  return next({ context: { user } });
});

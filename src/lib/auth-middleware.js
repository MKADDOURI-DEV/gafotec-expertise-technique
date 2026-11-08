import { createMiddleware } from "@tanstack/react-start";
import { getRequest, setResponseStatus } from "@tanstack/react-start/server";
import { bearerToken, resolveUser, unauthorized } from "@/lib/auth-core";
import { getAccessToken } from "@/lib/supabase";
import { getAdminDb } from "@/lib/supabase-admin";

// Applied to every server function by src/start.js: sends the visitor's Supabase access token with the call.
// Anonymous visitors send nothing.
export const authMiddleware = createMiddleware({ type: "function" }).client(async ({ next }) => {
  const token = typeof window === "undefined" ? null : await getAccessToken().catch(() => null);
  return next({ headers: token ? { Authorization: `Bearer ${token}` } : {} });
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

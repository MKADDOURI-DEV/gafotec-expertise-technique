import { queryOptions, useQuery, useQueryClient } from "@tanstack/react-query";
import { createContext, useContext, useMemo } from "react";
import { getSupabase } from "@/lib/supabase";
import { currentPath } from "@/lib/authReturnTo";

/**
 * The visitor, resolved once per page load and cached in the router's QueryClient:
 * the login gate (src/components/auth/AuthGate.jsx) reads it with
 * `context.queryClient.ensureQueryData(authQuery)`, components with `useAuth()`.
 * Resolves to `{ user, error }`: no session is `{ user: null, error: null }`; an account that still owes its second
 * factor is `{ user: null, error: { type: "mfa_required" } }`. A real outage rejects instead, so it is never cached
 * as "signed out" and the next read asks again.
 */
export const authQuery = queryOptions({
  queryKey: ["auth", "me"],
  queryFn: async () => {
    const supabase = getSupabase();
    const { data: sessionData } = await supabase.auth.getSession();
    const session = sessionData.session;
    if (!session) return { user: null, error: null };

    const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    if (aal?.nextLevel === "aal2" && aal.currentLevel !== "aal2") {
      return { user: null, error: { type: "mfa_required", message: "Second factor required" } };
    }

    // RLS lets a signed-in user read their own profile row only.
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("role, full_name, created_at")
      .eq("id", session.user.id)
      .maybeSingle();
    if (error) {
      if (error.code === "PGRST301" || /jwt/i.test(error.message ?? "")) return { user: null, error: null };
      throw error;
    }
    return {
      user: {
        id: session.user.id,
        email: session.user.email,
        full_name: profile?.full_name ?? session.user.user_metadata?.full_name ?? null,
        role: profile?.role === "admin" ? "admin" : "user",
        created_date: profile?.created_at ?? session.user.created_at,
      },
      error: null,
    };
  },
  staleTime: Infinity,
  retry: false,
});

const AuthContext = createContext(null);

/**
 * Client-side session state. The server renders every page anonymously and the
 * query only runs in the browser after hydration, so the first client render
 * matches the server markup. Gate user-specific UI on `isLoadingAuth`.
 */
export function AuthProvider({ children }) {
  const queryClient = useQueryClient();
  const { data, error, isPending } = useQuery(authQuery);

  const value = useMemo(
    () => ({
      user: data?.user ?? null,
      isAuthenticated: !!data?.user,
      isLoadingAuth: isPending,
      authError: data?.error ?? (error ? { type: "unknown", message: error.message ?? "Failed to load session" } : null),
      refresh: () => queryClient.fetchQuery({ ...authQuery, staleTime: 0 }),
      logout: async () => {
        queryClient.setQueryData(authQuery.queryKey, { user: null, error: null });
        await getSupabase().auth.signOut();
        window.location.assign("/");
      },
      // Full-page sign-in: /login with the current page as the way back.
      navigateToLogin: () => window.location.assign(`/login?returnTo=${encodeURIComponent(currentPath())}`),
    }),
    [data, error, isPending, queryClient],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}

import { createFileRoute, redirect } from "@tanstack/react-router";

// The « Our Values » presentation files moved to the « Nos clients » admin page. Old bookmarks keep working.
export const Route = createFileRoute("/_authed/admin/our-values")({
  beforeLoad: () => {
    throw redirect({ to: "/admin/clients" });
  },
});

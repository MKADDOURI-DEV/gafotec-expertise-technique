import { createFileRoute, Link, Outlet, useRouter } from "@tanstack/react-router";
import { ArrowUpRight, LogOut, ShieldAlert } from "lucide-react";
import Logo from "@/components/site/Logo";
import AdminNav from "@/components/admin/AdminNav";
import { useAuth } from "@/lib/AuthContext";

export const Route = createFileRoute("/_authed/admin")({ component: AdminLayout });

function AdminLayout() {
  const { user } = Route.useRouteContext();
  const router = useRouter();
  const { logout } = useAuth();

  if (user && user.role !== "admin") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface px-5">
        <div className="w-full max-w-md border border-border bg-background p-8">
          <ShieldAlert className="h-6 w-6 text-primary" strokeWidth={1.6} />
          <h1 className="mt-5 font-heading text-xl font-bold tracking-tight text-foreground">
            Accès réservé à l’administration
          </h1>
          <p className="mt-3 text-[13.5px] leading-relaxed text-muted-foreground">
            Votre compte est bien connecté, mais il n’a pas les droits d’administration de ce site.
            Connectez-vous avec le compte administrateur de GAFOTEC.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => logout()}
              className="inline-flex items-center gap-2 bg-primary px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.16em] text-primary-foreground"
            >
              <LogOut className="h-3.5 w-3.5" strokeWidth={1.75} />
              Changer de compte
            </button>
            <Link
              to="/"
              className="inline-flex items-center gap-2 border border-border px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.16em] text-foreground"
            >
              Retour au site
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-x-clip bg-surface">
      <header className="border-b border-border bg-background">
        <div className="container-page flex h-16 items-center justify-between gap-2 sm:gap-4">
          <div className="flex min-w-0 items-center gap-4">
            {/* The admin header ignores the public logo size setting so a large logo can never push the page sideways. */}
            <div className="min-w-0 [&_img]:!h-9 [&_img]:!w-auto [&_img]:max-w-full sm:[&_img]:!h-11">
              <Logo />
            </div>
            <span className="hidden font-mono text-[9.5px] uppercase tracking-[0.22em] text-muted-foreground md:inline">
              Administration
            </span>
          </div>
          <div className="flex shrink-0 items-center gap-1 sm:gap-3">
            <Link
              to="/"
              aria-label="Voir le site"
              className="inline-flex min-h-11 min-w-11 items-center justify-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-primary hover:text-brand-deep"
            >
              <span className="hidden sm:inline">Voir le site</span>
              <ArrowUpRight className="h-4 w-4 sm:h-3 sm:w-3" strokeWidth={1.75} />
            </Link>
            <button
              type="button"
              onClick={() => logout()}
              aria-label="Déconnexion"
              className="inline-flex min-h-11 min-w-11 items-center justify-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground hover:text-foreground"
            >
              <LogOut className="h-4 w-4 sm:h-3.5 sm:w-3.5" strokeWidth={1.75} />
              <span className="hidden sm:inline">Déconnexion</span>
            </button>
          </div>
        </div>
      </header>

      <div className="container-page grid grid-cols-[minmax(0,1fr)] gap-6 py-6 sm:gap-8 sm:py-8 lg:grid-cols-[210px_minmax(0,1fr)] lg:gap-12 lg:py-10">
        <AdminNav />
        <div className="min-w-0">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
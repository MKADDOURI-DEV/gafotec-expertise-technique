import { useEffect, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Building2, ChevronDown, Film, FolderKanban, Images, Inbox, KeyRound, LayoutDashboard, Shapes, Type, Users, Wrench } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { to: "/admin", label: "Aperçu", icon: LayoutDashboard },
  { to: "/admin/contenu", label: "Contenu du site", icon: Type },
  { to: "/admin/accueil", label: "Accueil : vidéo", icon: Film },
  { to: "/admin/logo", label: "Gestion du logo", icon: Shapes },
  { to: "/admin/expertises", label: "Gestion des expertises", icon: Wrench },
  { to: "/admin/clients", label: "Nos clients", icon: Building2 },
  { to: "/admin/realisations", label: "Réalisations", icon: FolderKanban },
  { to: "/admin/equipe", label: "Équipe", icon: Users },
  { to: "/admin/medias", label: "Médiathèque", icon: Images },
  { to: "/admin/demandes", label: "Demandes de devis", icon: Inbox },
  { to: "/admin/compte", label: "Mon compte", icon: KeyRound },
];

const isActive = (pathname, to) => (to === "/admin" ? pathname === "/admin" || pathname === "/admin/" : pathname === to || pathname.startsWith(`${to}/`));

/** Phones / tablets: one « Menu » button that opens a full-width vertical list (no horizontal scrolling). Desktop: sidebar. */
export default function AdminNav() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const [open, setOpen] = useState(false);
  const current = links.find((link) => isActive(pathname, link.to)) ?? links[0];
  const CurrentIcon = current.icon;

  useEffect(() => setOpen(false), [pathname]);

  return (
    <nav aria-label="Navigation administration" className="min-w-0 lg:sticky lg:top-8 lg:self-start">
      <button
        type="button"
        aria-expanded={open}
        aria-controls="admin-nav-list"
        onClick={() => setOpen((value) => !value)}
        className="flex min-h-12 w-full items-center justify-between gap-3 border border-border bg-background px-4 text-left text-[14px] font-medium text-foreground lg:hidden"
      >
        <span className="flex min-w-0 items-center gap-2.5">
          <CurrentIcon className="h-4 w-4 shrink-0 text-primary" strokeWidth={1.75} />
          <span className="truncate">{current.label}</span>
        </span>
        <span className="flex shrink-0 items-center gap-1.5 font-mono text-[9.5px] uppercase tracking-[0.16em] text-muted-foreground">
          Menu
          <ChevronDown className={cn("h-4 w-4 transition-transform", open && "rotate-180")} strokeWidth={1.75} />
        </span>
      </button>

      <ul
        id="admin-nav-list"
        className={cn(
          "mt-2 min-w-0 gap-1 border border-border bg-background p-1 lg:mt-0 lg:flex lg:flex-col lg:gap-0.5 lg:border-0 lg:bg-transparent lg:p-0",
          open ? "grid sm:grid-cols-2" : "hidden",
        )}
      >
        {links.map((link) => {
          const active = isActive(pathname, link.to);
          const Icon = link.icon;
          return (
            <li key={link.to} className="min-w-0">
              <Link
                to={link.to}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-h-12 items-center gap-2.5 px-3 py-2.5 text-[14px] transition-colors lg:min-h-0 lg:text-[13px]",
                  active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                )}
              >
                <Icon className="h-4 w-4 shrink-0" strokeWidth={1.75} />
                <span className="min-w-0 break-words">{link.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

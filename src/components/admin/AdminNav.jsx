import { Link, useRouterState } from "@tanstack/react-router";
import { FolderKanban, Images, Inbox, KeyRound, LayoutDashboard, Type, Users } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { to: "/admin", label: "Aperçu", icon: LayoutDashboard },
  { to: "/admin/contenu", label: "Contenu du site", icon: Type },
  { to: "/admin/realisations", label: "Réalisations", icon: FolderKanban },
  { to: "/admin/equipe", label: "Équipe", icon: Users },
  { to: "/admin/medias", label: "Médiathèque", icon: Images },
  { to: "/admin/demandes", label: "Demandes de devis", icon: Inbox },
  { to: "/admin/compte", label: "Mon compte", icon: KeyRound },
];

export default function AdminNav() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  return (
    <nav aria-label="Navigation administration" className="lg:sticky lg:top-8 lg:self-start">
      <ul className="-mx-1 flex gap-1 overflow-x-auto pb-2 lg:mx-0 lg:flex-col lg:gap-0.5 lg:pb-0">
        {links.map((link) => {
          const active = pathname === link.to;
          const Icon = link.icon;
          return (
            <li key={link.to} className="shrink-0 lg:shrink">
              <Link
                to={link.to}
                className={cn(
                  "flex items-center gap-2.5 whitespace-nowrap px-3 py-2.5 text-[13px] transition-colors",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                )}
              >
                <Icon className="h-4 w-4" strokeWidth={1.75} />
                {link.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
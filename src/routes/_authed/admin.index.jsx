import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, FolderKanban, Images, Inbox, Type } from "lucide-react";
import { getAdminOverview } from "@/lib/content-fns";

export const Route = createFileRoute("/_authed/admin/")({
  loader: () => getAdminOverview(),
  component: AdminHome,
});

export default function AdminHome() {
  const overview = Route.useLoaderData();

  const stats = [
    { label: "Réalisations", value: overview.projects, icon: FolderKanban },
    { label: "Médias", value: overview.media, icon: Images },
    { label: "Champs modifiés", value: overview.content, icon: Type },
    { label: "Demandes de devis", value: overview.requests, icon: Inbox },
  ];

  const actions = [
    {
      to: "/admin/contenu",
      title: "Modifier le contenu",
      text: "Titres, textes de présentation, coordonnées et images des pages.",
    },
    {
      to: "/admin/realisations",
      title: "Gérer les réalisations",
      text: "Ajouter un chantier, mettre à jour son périmètre ou son visuel.",
    },
    {
      to: "/admin/medias",
      title: "Téléverser des médias",
      text: "Images et vidéos du site, réutilisables dans tous les contenus.",
    },
    {
      to: "/admin/compte",
      title: "Mon compte",
      text: "Vos informations de connexion et la modification du mot de passe.",
    },
  ];

  return (
    <div>
      <p className="eyebrow">Administration</p>
      <h1 className="mt-4 font-heading text-[clamp(1.6rem,3vw,2.2rem)] font-bold leading-[1.1] tracking-[-0.025em] text-foreground">
        Gestion du site GAFOTEC
      </h1>
      <p className="mt-3 max-w-2xl text-[14px] leading-relaxed text-muted-foreground">
        Modifiez le contenu publié, gérez les réalisations et la médiathèque. Les changements sont
        visibles immédiatement sur le site public.
      </p>

      <div className="mt-8 grid gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-background p-5">
              <Icon className="h-4 w-4 text-primary" strokeWidth={1.6} />
              <p className="mt-4 font-heading text-3xl font-bold tracking-tight text-foreground">
                {stat.value}
              </p>
              <p className="mt-1 font-mono text-[9.5px] uppercase tracking-[0.16em] text-muted-foreground">
                {stat.label}
              </p>
            </div>
          );
        })}
      </div>

      {overview.openRequests > 0 && (
        <p className="mt-4 border-l-2 border-primary bg-accent/50 px-4 py-3 text-[13px] text-foreground">
          {overview.openRequests} demande{overview.openRequests > 1 ? "s" : ""} de devis en attente de
          traitement.
        </p>
      )}

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {actions.map((action) => (
          <Link
            key={action.to}
            to={action.to}
            className="group flex flex-col justify-between border border-border bg-background p-5 transition-colors hover:border-primary/50"
          >
            <div>
              <h2 className="font-heading text-[15px] font-semibold tracking-tight text-foreground">
                {action.title}
              </h2>
              <p className="mt-2 text-[12.5px] leading-relaxed text-muted-foreground">{action.text}</p>
            </div>
            <span className="mt-5 inline-flex items-center gap-1.5 font-mono text-[9.5px] uppercase tracking-[0.16em] text-primary">
              Ouvrir
              <ArrowUpRight className="h-3 w-3 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" strokeWidth={1.75} />
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
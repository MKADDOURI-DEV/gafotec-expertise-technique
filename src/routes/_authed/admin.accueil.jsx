import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import ManagedFileCard from "@/components/admin/ManagedFileCard";
import { getSiteContent } from "@/lib/content-fns";

export const Route = createFileRoute("/_authed/admin/accueil")({
  loader: () => getSiteContent(),
  component: HomeMediaAdmin,
});

const HERO_VIDEO_RECOMMENDED_BYTES = 10 * 1024 * 1024;

function HomeMediaAdmin() {
  const content = Route.useLoaderData();
  const router = useRouter();

  return (
    <div className="min-w-0">
      <p className="eyebrow">Page d’accueil</p>
      <h1 className="mt-4 font-heading text-[clamp(1.5rem,2.8vw,2rem)] font-bold leading-[1.1] tracking-[-0.025em] text-foreground">
        Médias de la page d’accueil
      </h1>
      <p className="mt-3 max-w-2xl text-[14px] leading-relaxed text-muted-foreground">
        La vidéo joue en boucle, sans son, derrière le texte du bandeau d’accueil. Tant qu’aucune vidéo n’est importée, le bandeau garde son image de fond actuelle. L’image sert aussi d’aperçu pendant le chargement de la vidéo.
      </p>

      <div className="mt-8 space-y-6">
        <ManagedFileCard
          kind="video"
          prefix="home.hero"
          folder="home/hero"
          title="Vidéo d’arrière-plan du bandeau d’accueil"
          emptyText="Aucune vidéo importée : le bandeau d’accueil affiche son image de fond."
          hint="Pour un chargement rapide sur téléphone, privilégiez une vidéo courte (10 à 20 secondes), en 1080p maximum, sans piste audio."
          recommendedBytes={HERO_VIDEO_RECOMMENDED_BYTES}
          content={content}
          onChanged={() => router.invalidate()}
        />

        <div className="border border-border bg-background p-4 text-[13px] leading-relaxed text-muted-foreground sm:p-5">
          <p>
            L’image de fond (aperçu et affichage de secours) se modifie dans{" "}
            <Link to="/admin/contenu" className="text-primary underline-offset-2 hover:underline">Contenu du site</Link>, groupe « Page d’accueil ».
          </p>
          <Link to="/" className="mt-3 inline-flex min-h-11 items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-primary hover:text-brand-deep sm:min-h-0">
            Voir la page d’accueil
            <ArrowUpRight className="h-3 w-3" strokeWidth={1.75} />
          </Link>
        </div>
      </div>
    </div>
  );
}

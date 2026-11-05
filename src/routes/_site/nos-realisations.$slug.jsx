import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import { Image } from "@/components/ui/image";
import Reveal from "@/components/site/Reveal";
import { getProjects } from "@/lib/content-fns";

export const Route = createFileRoute("/_site/nos-realisations/$slug")({
  loader: async ({ params }) => {
    const projects = await getProjects();
    const index = projects.findIndex((item) => item.slug === params.slug);
    if (index === -1) throw notFound();
    return {
      project: projects[index],
      next: projects[(index + 1) % projects.length] ?? projects[0],
    };
  },
  head: ({ loaderData }) => {
    const project = loaderData?.project;
    if (!project) return { meta: [{ title: "Réalisation introuvable — GAFOTEC" }] };
    return {
      meta: [
        { title: `${project.title} (${project.year}) — Réalisation GAFOTEC` },
        { name: "description", content: `${project.summary} Projet ${project.category.toLowerCase()} à ${project.location}.` },
        { property: "og:title", content: `${project.title} — Réalisation GAFOTEC` },
        { property: "og:description", content: project.summary },
        { property: "og:image", content: project.image },
      ],
      links: [{ rel: "canonical", href: `/nos-realisations/${project.slug}` }],
    };
  },
  component: ProjectPage,
});

function ProjectPage() {
  const { project, next } = Route.useLoaderData();

  const facts = [
    { label: "Année", value: project.year },
    { label: "Catégorie", value: project.category },
    { label: "Localisation", value: project.location },
    { label: "Statut", value: project.status ?? "Livré" },
  ];

  return (
    <>
      <section className="relative isolate overflow-hidden bg-brand-deep">
        <div className="absolute inset-0" aria-hidden="true">
          <Image src={project.image} alt={project.title} className="h-full w-full" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(4,20,44,0.72)_0%,rgba(4,20,44,0.5)_45%,rgba(4,20,44,0.92)_100%)]" />
        </div>
        <div className="container-page relative flex min-h-[clamp(360px,54vh,520px)] flex-col justify-end pb-12 pt-28 lg:pb-16">
          <Link
            to="/nos-realisations"
            className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-white/70 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.75} />
            Toutes les réalisations
          </Link>
          <div className="mt-6 flex flex-wrap items-center gap-3 font-mono text-[10px] uppercase tracking-[0.2em] text-white/70">
            <span className="border border-white/30 px-2.5 py-1">{project.year}</span>
            <span>{project.category}</span>
            <span className="h-px w-4 bg-white/40" />
            <span>{project.location}</span>
            {project.status && (
              <span className="bg-white px-2.5 py-1 text-brand-deep">{project.status}</span>
            )}
          </div>
          <h1 className="mt-5 max-w-3xl font-heading text-[clamp(1.9rem,4.4vw,3.3rem)] font-bold leading-[1.03] tracking-[-0.03em] text-white">
            {project.title}
          </h1>
        </div>
      </section>

      <section className="section">
        <div className="container-page grid gap-12 lg:grid-cols-12 lg:gap-16">
          <Reveal className="lg:col-span-7">
            <p className="eyebrow">Le projet</p>
            <p className="mt-5 text-[16px] leading-[1.8] text-foreground">{project.summary}</p>
            <p className="mt-5 text-[14.5px] leading-[1.8] text-muted-foreground">
              {project.description}
            </p>

            <h2 className="mt-12 font-heading text-xl font-bold tracking-tight text-foreground">
              Interventions techniques GAFOTEC
            </h2>
            <ul className="mt-5 grid gap-px bg-border sm:grid-cols-2">
              {project.scope.map((item) => (
                <li key={item} className="bg-background p-4 text-[13px] leading-snug text-foreground">
                  {item}
                </li>
              ))}
            </ul>

            <p className="mt-8 border-l-2 border-border pl-4 text-[11.5px] leading-relaxed text-muted-foreground">
              Illustration architecturale représentative de la typologie du projet. Les périmètres
              ci-dessus correspondent aux disciplines techniques du GAFOTEC ; les détails
              d’exécution sont communiqués sur demande dans le cadre d’une consultation.
            </p>
          </Reveal>

          <Reveal delay={100} className="lg:col-span-5">
            <div className="border border-border">
              <dl className="divide-y divide-border">
                {facts.map((fact) => (
                  <div key={fact.label} className="flex items-baseline justify-between gap-4 px-5 py-4">
                    <dt className="font-mono text-[9.5px] uppercase tracking-[0.18em] text-muted-foreground">
                      {fact.label}
                    </dt>
                    <dd className="text-right text-[13.5px] font-medium text-foreground">
                      {fact.value}
                    </dd>
                  </div>
                ))}
              </dl>
              <div className="border-t border-border bg-surface p-5">
                <p className="text-[13px] leading-relaxed text-muted-foreground">
                  Un projet similaire ? Nous vous accompagnons de l’étude à la mise en service.
                </p>
                <Link
                  to="/contact"
                  className="mt-4 inline-flex w-full items-center justify-center gap-2 bg-primary px-5 py-3 font-mono text-[10px] uppercase tracking-[0.16em] text-primary-foreground transition-colors hover:bg-brand-corporate"
                >
                  Demander un devis
                  <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.75} />
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="border-t border-border">
        <Link
          to="/nos-realisations/$slug"
          params={{ slug: next.slug }}
          className="group block"
        >
          <div className="container-page flex flex-col gap-6 py-12 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-mono text-[9.5px] uppercase tracking-[0.2em] text-muted-foreground">
                Réalisation suivante
              </p>
              <p className="mt-3 font-heading text-[clamp(1.2rem,2.4vw,1.75rem)] font-bold tracking-[-0.02em] text-foreground">
                {next.title}
              </p>
            </div>
            <span className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-primary">
              Voir le projet
              <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" strokeWidth={1.75} />
            </span>
          </div>
        </Link>
      </section>
    </>
  );
}
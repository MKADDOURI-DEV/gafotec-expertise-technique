import { Link } from "@tanstack/react-router";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Image } from "@/components/ui/image";
import Reveal from "@/components/site/Reveal";

const FALLBACK_SLUGS = ["hilton-casablanca-sidi-maarouf", "marina-tanger", "universite-euromed-fes"];

export default function FeaturedProjects({ projects = [] }) {
  const flagged = projects.filter((project) => project.featured);
  const list = (
    flagged.length > 0
      ? flagged
      : FALLBACK_SLUGS.map((slug) => projects.find((project) => project.slug === slug)).filter(Boolean)
  ).slice(0, 3);
  const ongoing = projects.find((project) => project.status === "En cours");

  return (
    <section className="section bg-background" aria-labelledby="realisations-title">
      <div className="container-page">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <Reveal className="max-w-2xl">
            <p className="eyebrow">02 — Nos réalisations</p>
            <h2
              id="realisations-title"
              className="mt-5 font-heading text-[clamp(1.75rem,3.4vw,2.75rem)] font-bold leading-[1.08] tracking-[-0.025em] text-foreground"
            >
              Des références livrées dans l’hôtellerie, l’enseignement et l’industrie.
            </h2>
          </Reveal>
          <Reveal delay={100}>
            <Link
              to="/nos-realisations"
              className="inline-flex items-center gap-2 bg-foreground px-5 py-3 font-mono text-[10.5px] uppercase tracking-[0.16em] text-background transition-colors hover:bg-primary"
            >
              Toutes nos réalisations
              <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.75} />
            </Link>
          </Reveal>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {list.map((project, i) => (
            <Reveal key={project.slug} delay={i * 90}>
              <Link
                to="/nos-realisations/$slug"
                params={{ slug: project.slug }}
                className="group block"
              >
                <div className="relative aspect-[3/4] overflow-hidden bg-surface">
                  <Image
                    src={project.image}
                    alt={project.title}
                    className="absolute inset-0 h-full w-full transition-transform duration-1000 ease-out group-hover:scale-[1.05]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[rgba(6,20,42,0.86)] via-[rgba(6,20,42,0.18)] to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                    <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-white/70">
                      <span>{project.year}</span>
                      <span className="h-px w-4 bg-white/40" />
                      <span>{project.category}</span>
                    </div>
                    <h3 className="mt-2 font-heading text-[17px] font-semibold leading-snug tracking-tight">
                      {project.title}
                    </h3>
                  </div>
                </div>
                <div className="flex items-start justify-between gap-4 border-b border-border py-4">
                  <p className="text-[13px] leading-relaxed text-muted-foreground">
                    {project.location}
                  </p>
                  <ArrowUpRight
                    className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary"
                    strokeWidth={1.75}
                  />
                </div>
              </Link>
            </Reveal>
          ))}
        </div>

        {ongoing && (
          <Reveal className="mt-10">
            <Link
              to="/nos-realisations/$slug"
              params={{ slug: ongoing.slug }}
              className="group flex flex-col items-start gap-4 border border-border p-6 transition-colors hover:border-primary/40 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-center gap-4">
                <span className="border border-primary/30 px-2.5 py-1 font-mono text-[9.5px] uppercase tracking-[0.18em] text-primary">
                  En cours
                </span>
                <p className="font-heading text-[15px] font-semibold tracking-tight text-foreground">
                  {ongoing.title}
                </p>
              </div>
              <span className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-primary">
                Voir le projet
                <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" strokeWidth={1.75} />
              </span>
            </Link>
          </Reveal>
        )}
      </div>
    </section>
  );
}
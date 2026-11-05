import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { Image } from "@/components/ui/image";
import Reveal from "@/components/site/Reveal";
import { images, services } from "@/data/site";

function ServiceCard({ service, index }) {
  return (
    <Reveal delay={(index % 3) * 80}>
      <Link
        to="/nos-expertises"
        hash={service.slug}
        className="group flex h-full flex-col border border-border bg-card transition-colors duration-300 hover:border-primary/40"
      >
        <div className="relative aspect-[4/3] overflow-hidden bg-surface">
          <Image
            src={service.image}
            alt={service.title}
            className="absolute inset-0 h-full w-full transition-transform duration-700 ease-out group-hover:scale-[1.045]"
          />
          <span className="absolute left-0 top-0 bg-white/95 px-2.5 py-1.5 font-mono text-[10px] tracking-[0.18em] text-primary">
            {service.number}
          </span>
        </div>
        <div className="flex flex-1 flex-col p-6">
          <div className="flex items-start justify-between gap-4">
            <h3 className="font-heading text-[17px] font-semibold leading-snug tracking-tight text-foreground">
              {service.title}
            </h3>
            <ArrowUpRight
              className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary"
              strokeWidth={1.75}
            />
          </div>
          <p className="mt-3 text-[13.5px] leading-relaxed text-muted-foreground">
            {service.excerpt}
          </p>
        </div>
      </Link>
    </Reveal>
  );
}

export default function ExpertiseGrid() {
  return (
    <section className="section bg-surface" aria-labelledby="expertises-title">
      <div className="container-page">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <Reveal className="max-w-2xl">
            <p className="eyebrow">01 — Nos expertises</p>
            <h2
              id="expertises-title"
              className="mt-5 font-heading text-[clamp(1.75rem,3.4vw,2.75rem)] font-bold leading-[1.08] tracking-[-0.025em] text-foreground"
            >
              Sept corps d’état techniques, une seule exigence : la maîtrise.
            </h2>
          </Reveal>
          <Reveal delay={120} className="lg:max-w-sm">
            <p className="text-[14.5px] leading-relaxed text-muted-foreground">
              Chaque métier est porté par des équipes formées et un bureau d’études capable de
              dimensionner, dessiner et justifier techniquement les installations.
            </p>
            <Link
              to="/nos-expertises"
              className="mt-5 inline-flex items-center gap-2 font-mono text-[10.5px] uppercase tracking-[0.18em] text-primary transition-colors hover:text-brand-deep"
            >
              Voir le détail des métiers
              <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.75} />
            </Link>
          </Reveal>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service, i) => (
            <ServiceCard key={service.slug} service={service} index={i} />
          ))}
          <Reveal delay={160} className="h-full">
            <Link
              to="/energies-photovoltaiques"
              className="group flex h-full flex-col justify-between bg-brand-deep p-6 text-white"
            >
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/60">
                  Transition énergétique
                </p>
                <h3 className="mt-4 font-heading text-xl font-semibold leading-snug tracking-tight">
                  Accélérer la transition énergétique de vos bâtiments.
                </h3>
              </div>
              <span className="mt-8 inline-flex items-center gap-2 font-mono text-[10.5px] uppercase tracking-[0.18em] text-white">
                Énergies photovoltaïques
                <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" strokeWidth={1.75} />
              </span>
              <div className="mt-6 border-t border-white/20 pt-4">
                <Image src={images.solaireToiture} alt="" className="h-20 w-full" />
              </div>
            </Link>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
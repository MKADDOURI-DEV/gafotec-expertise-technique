import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Check } from "lucide-react";
import { Image } from "@/components/ui/image";
import Reveal from "@/components/site/Reveal";
import { cn } from "@/lib/utils";

export default function ServiceSection({ service, reversed = false }) {
  return (
    <section
      id={service.slug}
      className="scroll-mt-24 border-t border-border py-16 lg:py-20"
      aria-labelledby={`${service.slug}-title`}
    >
      <div className="container-page">
        <div className="grid items-start gap-10 lg:grid-cols-12 lg:gap-14">
          <Reveal className={cn("lg:col-span-6", reversed ? "lg:order-2" : "")}>
            <div className="relative aspect-[5/4] overflow-hidden bg-surface">
              <Image src={service.image} alt={service.title} className="h-full w-full" />
              <span className="absolute left-0 top-0 bg-white/95 px-3 py-2 font-mono text-[10px] tracking-[0.2em] text-primary">
                {service.number}
              </span>
            </div>
          </Reveal>

          <Reveal delay={90} className={cn("lg:col-span-6", reversed ? "lg:order-1" : "")}>
            <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
              {service.short}
            </p>
            <h2
              id={`${service.slug}-title`}
              className="mt-3 font-heading text-[clamp(1.5rem,2.6vw,2.1rem)] font-bold leading-[1.12] tracking-[-0.025em] text-foreground"
            >
              {service.title}
            </h2>
            <p className="mt-4 text-[14.5px] leading-[1.75] text-muted-foreground">
              {service.description}
            </p>

            <div className="mt-8 grid gap-8 sm:grid-cols-2">
              <div>
                <h3 className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary">
                  Principales interventions
                </h3>
                <ul className="mt-4 space-y-2.5">
                  {service.interventions.map((item) => (
                    <li key={item} className="flex gap-2.5 text-[13px] leading-snug text-foreground">
                      <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-medium" strokeWidth={2} />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary">
                  Notre expertise
                </h3>
                <ul className="mt-4 space-y-3">
                  {service.expertise.map((item) => (
                    <li
                      key={item}
                      className="border-l border-border pl-3 text-[13px] leading-snug text-muted-foreground"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <Link
              to="/contact"
              search={{ service: service.title }}
              className="mt-8 inline-flex items-center gap-2 bg-primary px-5 py-3 font-mono text-[10px] uppercase tracking-[0.16em] text-primary-foreground transition-colors hover:bg-brand-corporate"
            >
              Contactez notre équipe
              <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.75} />
            </Link>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
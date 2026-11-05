import Reveal from "@/components/site/Reveal";
import { approach } from "@/data/site";

export default function Approach() {
  return (
    <section className="section bg-surface" aria-labelledby="approche-title">
      <div className="container-page">
        <Reveal className="max-w-2xl">
          <p className="eyebrow">03 — Notre approche</p>
          <h2
            id="approche-title"
            className="mt-5 font-heading text-[clamp(1.75rem,3.4vw,2.75rem)] font-bold leading-[1.08] tracking-[-0.025em] text-foreground"
          >
            Études, conception, exécution, maintenance.
          </h2>
          <p className="mt-4 text-[14.5px] leading-relaxed text-muted-foreground">
            Un projet technique se joue autant dans les plans que sur le chantier. Nous assurons la
            continuité entre les deux, de la première note de calcul jusqu’à l’entretien des
            installations.
          </p>
        </Reveal>

        <ol className="mt-12 grid gap-px overflow-hidden border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
          {approach.map((step, i) => (
            <Reveal as="li" key={step.step} delay={i * 80} className="bg-background p-6 lg:p-7">
              <span className="font-mono text-[10.5px] tracking-[0.2em] text-primary">
                {step.step}
              </span>
              <h3 className="mt-5 font-heading text-lg font-semibold tracking-tight text-foreground">
                {step.title}
              </h3>
              <p className="mt-3 text-[13px] leading-relaxed text-muted-foreground">{step.text}</p>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
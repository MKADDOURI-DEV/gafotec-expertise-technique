import Reveal from "@/components/site/Reveal";
import { values } from "@/data/site";

export default function Values() {
  return (
    <section className="section bg-background" aria-labelledby="valeurs-title">
      <div className="container-page">
        <Reveal className="max-w-2xl">
          <p className="eyebrow">04 — Nos valeurs</p>
          <h2
            id="valeurs-title"
            className="mt-5 font-heading text-[clamp(1.75rem,3.4vw,2.75rem)] font-bold leading-[1.08] tracking-[-0.025em] text-foreground"
          >
            Confiance, engagement, éthique.
          </h2>
        </Reveal>

        <div className="mt-12 grid gap-10 border-t border-border pt-10 md:grid-cols-3 md:gap-8">
          {values.map((value, i) => (
            <Reveal key={value.title} delay={i * 90}>
              <div className="flex items-baseline gap-3">
                <span className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground">
                  0{i + 1}
                </span>
                <h3 className="font-heading text-[22px] font-bold tracking-[-0.02em] text-primary">
                  {value.title}
                </h3>
              </div>
              <p className="mt-4 text-[13.5px] leading-[1.75] text-muted-foreground">{value.text}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
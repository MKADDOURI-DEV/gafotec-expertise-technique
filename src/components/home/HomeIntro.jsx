import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { Image } from "@/components/ui/image";
import Reveal from "@/components/site/Reveal";
import { useContent } from "@/components/content/ContentProvider";

export default function HomeIntro() {
  const { t } = useContent();
  const introImage = t("home.intro.image");

  return (
    <section className="section bg-background" aria-labelledby="intro-title">
      <div className="container-page">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <Reveal className="lg:col-span-5">
            <p className="eyebrow">{t("home.intro.eyebrow")}</p>
            <h2
              id="intro-title"
              className="mt-5 font-heading text-[clamp(1.75rem,3.4vw,2.75rem)] font-bold leading-[1.08] tracking-[-0.025em] text-foreground"
            >
              {t("home.intro.title")}
            </h2>
            <div className="mt-8 hidden aspect-[4/3] overflow-hidden bg-surface lg:block">
              <Image
                src={introImage}
                alt="Plans d’études techniques sur un bureau d’études"
                className="h-full w-full"
              />
            </div>
          </Reveal>

          <Reveal delay={120} className="lg:col-span-7 lg:pt-2">
            <p className="text-[16.5px] leading-[1.7] text-foreground">
              {t("home.intro.paragraph1")}
            </p>
            <p className="mt-5 text-[15px] leading-[1.75] text-muted-foreground">
              {t("home.intro.paragraph2")}
            </p>

            <dl className="mt-10 grid gap-6 border-t border-border pt-8 sm:grid-cols-3">
              {[
                { k: "2018", v: "Premières références livrées" },
                { k: "07", v: "Corps d’état techniques" },
                { k: "Fès", v: "Siège et bureau d’études" },
              ].map((item) => (
                <div key={item.k}>
                  <dt className="font-heading text-2xl font-bold tracking-tight text-primary">
                    {item.k}
                  </dt>
                  <dd className="mt-1.5 text-[12.5px] leading-snug text-muted-foreground">
                    {item.v}
                  </dd>
                </div>
              ))}
            </dl>

            <Link
              to="/a-propos"
              className="mt-9 inline-flex items-center gap-2 border-b border-primary/30 pb-1 font-mono text-[10.5px] uppercase tracking-[0.18em] text-primary transition-colors hover:border-primary hover:text-brand-deep"
            >
              En savoir plus sur GAFOTEC
              <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.75} />
            </Link>
          </Reveal>
        </div>

        <div className="mt-14 aspect-[16/7] overflow-hidden bg-surface lg:hidden">
          <Image
            src={introImage}
            alt="Plans d’études techniques sur un bureau d’études"
            className="h-full w-full"
          />
        </div>
      </div>
    </section>
  );
}
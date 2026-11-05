import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import PageHero from "@/components/site/PageHero";
import Reveal from "@/components/site/Reveal";
import Values from "@/components/home/Values";
import Approach from "@/components/home/Approach";
import ContactCTA from "@/components/home/ContactCTA";
import { Image } from "@/components/ui/image";
import { images, services } from "@/data/site";

export const Route = createFileRoute("/_site/a-propos")({
  head: () => ({
    meta: [
      { title: "À propos de GAFOTEC — Entreprise de corps d’état techniques au Maroc" },
      {
        name: "description",
        content:
          "GAFOTEC, entreprise marocaine de corps d’état techniques basée à Fès : savoir-faire CVC, plomberie, chauffage, protection incendie, désenfumage, piscines et photovoltaïque. Études, exécution et maintenance.",
      },
      { property: "og:title", content: "À propos de GAFOTEC — Corps d’État Techniques" },
      {
        property: "og:description",
        content: "Notre mission, notre expertise technique et notre engagement qualité.",
      },
      { property: "og:image", content: images.chantier },
      { property: "og:url", content: "/a-propos" },
    ],
    links: [{ rel: "canonical", href: "/a-propos" }],
  }),
  component: AboutPage,
});

const pillars = [
  {
    title: "Notre mission",
    text: "Concevoir et réaliser des installations techniques fiables, économes et durables, qui permettent aux bâtiments de fonctionner sans interruption et de traverser le temps.",
  },
  {
    title: "Notre engagement qualité",
    text: "Des études justes, des matériaux conformes, des essais documentés et une réception sans réserve. Chaque installation est vérifiée avant d’être livrée.",
  },
  {
    title: "Notre approche",
    text: "Un interlocuteur technique unique du premier échange à la maintenance, avec un bureau d’études, des chefs de projet et des équipes de chantier intégrés.",
  },
];

function AboutPage() {
  return (
    <>
      <PageHero contentKey="propos" />

      <section className="section">
        <div className="container-page grid gap-12 lg:grid-cols-12 lg:gap-16">
          <Reveal className="lg:col-span-6">
            <p className="eyebrow">Qui sommes-nous</p>
            <h2 className="mt-5 font-heading text-[clamp(1.7rem,3.2vw,2.6rem)] font-bold leading-[1.08] tracking-[-0.025em] text-foreground">
              Un partenaire technique pour les maîtres d’ouvrage exigeants.
            </h2>
            <div className="mt-6 space-y-5 text-[14.5px] leading-[1.8] text-muted-foreground">
              <p>
                GAFOTEC est une entreprise marocaine de corps d’état techniques installée à Fès. Elle
                accompagne les porteurs de projets dans la conception et la réalisation des
                installations qui équipent leurs bâtiments : climatisation et ventilation, plomberie
                sanitaire, chauffage central, protection contre l’incendie, désenfumage, piscines et
                énergie solaire photovoltaïque.
              </p>
              <p>
                Notre organisation réunit un bureau d’études, un service chiffrage et dessin, des
                chefs de projet et des équipes de chantier. Cette intégration nous permet de
                répondre de manière cohérente aux exigences des architectes, des bureaux de contrôle
                et des exploitants.
              </p>
              <p>
                Depuis nos premières références en 2018, nous avons livré des installations pour des
                laboratoires industriels, des hôtels, des établissements d’enseignement et des
                complexes touristiques.
              </p>
            </div>
          </Reveal>

          <Reveal delay={100} className="lg:col-span-6">
            <div className="aspect-[4/5] overflow-hidden bg-surface lg:aspect-[4/4.4]">
              <Image src={images.bureau} alt="Bureau d’études techniques GAFOTEC" className="h-full w-full" />
            </div>
          </Reveal>
        </div>
      </section>

      <section className="border-t border-border bg-surface py-16 lg:py-20">
        <div className="container-page grid gap-px bg-border md:grid-cols-3">
          {pillars.map((pillar, i) => (
            <Reveal key={pillar.title} delay={i * 80} className="bg-surface p-0">
              <div className="h-full bg-background p-7 lg:p-8">
                <h3 className="font-heading text-[17px] font-bold tracking-tight text-primary">
                  {pillar.title}
                </h3>
                <p className="mt-3 text-[13.5px] leading-[1.75] text-muted-foreground">
                  {pillar.text}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="container-page">
          <Reveal className="max-w-2xl">
            <p className="eyebrow">Savoir-faire</p>
            <h2 className="mt-5 font-heading text-[clamp(1.7rem,3.2vw,2.6rem)] font-bold leading-[1.08] tracking-[-0.025em] text-foreground">
              Sept métiers complémentaires, une même exigence de précision.
            </h2>
          </Reveal>
          <div className="mt-10 grid gap-px bg-border sm:grid-cols-2 lg:grid-cols-4">
            {services.map((service, i) => (
              <Reveal key={service.slug} delay={(i % 4) * 60}>
                <Link
                  to="/nos-expertises"
                  hash={service.slug}
                  className="group flex h-full flex-col justify-between bg-background p-5 transition-colors hover:bg-surface"
                >
                  <span className="font-mono text-[10px] tracking-[0.2em] text-primary">
                    {service.number}
                  </span>
                  <span className="mt-8 flex items-start justify-between gap-3">
                    <span className="font-heading text-[14.5px] font-semibold leading-snug tracking-tight text-foreground">
                      {service.title}
                    </span>
                    <ArrowUpRight
                      className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                      strokeWidth={1.75}
                    />
                  </span>
                </Link>
              </Reveal>
            ))}
            <div className="bg-brand-deep p-5">
              <p className="font-mono text-[9.5px] uppercase tracking-[0.2em] text-white/60">
                Études & chiffrage
              </p>
              <p className="mt-8 font-heading text-[14.5px] font-semibold leading-snug text-white">
                Un bureau d’études intégré au service de chaque projet.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Approach />
      <Values />
      <ContactCTA />
    </>
  );
}
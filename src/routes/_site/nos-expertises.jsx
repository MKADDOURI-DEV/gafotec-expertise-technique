import { createFileRoute } from "@tanstack/react-router";
import PageHero from "@/components/site/PageHero";
import Reveal from "@/components/site/Reveal";
import ServiceSection from "@/components/expertise/ServiceSection";
import ContactCTA from "@/components/home/ContactCTA";
import { images, services } from "@/data/site";

export const Route = createFileRoute("/_site/nos-expertises")({
  head: () => ({
    meta: [
      {
        title: "Nos expertises — CVC, plomberie, chauffage, incendie, désenfumage | GAFOTEC",
      },
      {
        name: "description",
        content:
          "Découvrez les métiers techniques de GAFOTEC au Maroc : climatisation et ventilation CVC, plomberie sanitaire, chauffage central, protection contre l’incendie, désenfumage, piscines et énergie solaire photovoltaïque.",
      },
      { property: "og:title", content: "Nos expertises techniques — GAFOTEC" },
      {
        property: "og:description",
        content:
          "Sept corps d’état techniques : études, conception, exécution et maintenance des installations du bâtiment.",
      },
      { property: "og:image", content: images.cvc },
      { property: "og:url", content: "/nos-expertises" },
    ],
    links: [{ rel: "canonical", href: "/nos-expertises" }],
  }),
  component: ExpertisePage,
});

function ExpertisePage() {
  return (
    <>
      <PageHero contentKey="expertises" />

      <div className="border-b border-border bg-background">
        <div className="container-page flex gap-1 overflow-x-auto py-4">
          {services.map((service) => (
            <a
              key={service.slug}
              href={`#${service.slug}`}
              className="shrink-0 border border-transparent px-3 py-2 font-mono text-[9.5px] uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:border-border hover:text-primary"
            >
              {service.short}
            </a>
          ))}
        </div>
      </div>

      <section className="section pb-6">
        <div className="container-page">
          <Reveal className="grid gap-8 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <p className="eyebrow">Notre organisation technique</p>
            </div>
            <div className="lg:col-span-7">
              <p className="text-[15px] leading-[1.8] text-foreground">
                Nos interventions couvrent l’ensemble du cycle d’un projet : relevés et études
                d’exécution, chiffrage, plans de coordination, approvisionnement, installation,
                essais, mise en service et entretien. Chaque lot est piloté par un responsable
                technique qui reste votre interlocuteur jusqu’à la réception.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      <div className="pb-16">
        {services.map((service, i) => (
          <ServiceSection key={service.slug} service={service} reversed={i % 2 === 1} />
        ))}
      </div>

      <ContactCTA />
    </>
  );
}
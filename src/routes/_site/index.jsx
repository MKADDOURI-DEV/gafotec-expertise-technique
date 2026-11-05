import { createFileRoute } from "@tanstack/react-router";
import Hero from "@/components/site/Hero";
import HomeIntro from "@/components/home/HomeIntro";
import ExpertiseGrid from "@/components/home/ExpertiseGrid";
import FeaturedProjects from "@/components/home/FeaturedProjects";
import Approach from "@/components/home/Approach";
import Values from "@/components/home/Values";
import ContactCTA from "@/components/home/ContactCTA";
import { company, images } from "@/data/site";

export const Route = createFileRoute("/_site/")({
  head: () => ({
    meta: [
      { title: "GAFOTEC — L’expertise technique au service de vos projets | Fès, Maroc" },
      {
        name: "description",
        content:
          "GAFOTEC réalise vos installations techniques au Maroc : climatisation et ventilation CVC, plomberie sanitaire, chauffage central, protection incendie, désenfumage, piscines et énergie solaire photovoltaïque. Devis sur demande.",
      },
      { property: "og:image", content: images.hero },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "LocalBusiness",
          name: "GAFOTEC — Corps d’État Techniques",
          description:
            "Entreprise marocaine de corps d’état techniques : CVC, plomberie, chauffage, protection incendie, désenfumage, piscines et photovoltaïque.",
          telephone: company.phones[0],
          email: company.email,
          url: "https://www.gafotec.com",
          address: {
            "@type": "PostalAddress",
            streetAddress: "2ème étage, appartement gauche, Dr Ouled Youssef Ouled Tayeb",
            addressLocality: "Fès",
            addressCountry: "MA",
          },
          areaServed: "Maroc",
          knowsAbout: [
            "Climatisation et ventilation CVC",
            "Plomberie sanitaire",
            "Chauffage central",
            "Protection contre l’incendie",
            "Désenfumage",
            "Piscines",
            "Énergie solaire photovoltaïque",
          ],
        }),
      },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  return (
    <>
      <Hero />
      <HomeIntro />
      <ExpertiseGrid />
      <FeaturedProjects />
      <Approach />
      <Values />
      <ContactCTA />
    </>
  );
}
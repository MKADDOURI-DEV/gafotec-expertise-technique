import { createFileRoute } from "@tanstack/react-router";
import PageHero from "@/components/site/PageHero";
import ClientsShowcase from "@/components/site/ClientsShowcase";
import OurValues from "@/components/site/OurValues";
import ContactCTA from "@/components/home/ContactCTA";
import { images } from "@/data/site";
import { getClients } from "@/lib/content-fns";

export const Route = createFileRoute("/_site/nos-clients")({
  head: () => ({
    meta: [
      { title: "Nos clients — GAFOTEC Corps d’État Techniques" },
      {
        name: "description",
        content: "Les entreprises, établissements et institutions qui font confiance à GAFOTEC pour leurs installations techniques : CVC, plomberie, chauffage, incendie, piscines et photovoltaïque.",
      },
      { property: "og:title", content: "Nos clients — GAFOTEC" },
      { property: "og:description", content: "Les entreprises et établissements qui nous font confiance." },
      { property: "og:image", content: images.chantier },
      { property: "og:url", content: "/nos-clients" },
    ],
    links: [{ rel: "canonical", href: "/nos-clients" }],
  }),
  loader: () => getClients(),
  component: ClientsPage,
});

function ClientsPage() {
  const { items } = Route.useLoaderData();

  return (
    <>
      <PageHero contentKey="clients" />
      <ClientsShowcase clients={items} />
      <OurValues />
      <ContactCTA />
    </>
  );
}

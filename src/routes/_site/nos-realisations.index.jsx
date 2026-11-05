import { createFileRoute } from "@tanstack/react-router";
import PageHero from "@/components/site/PageHero";
import Reveal from "@/components/site/Reveal";
import ProjectsExplorer from "@/components/realisations/ProjectsExplorer";
import ContactCTA from "@/components/home/ContactCTA";
import { images } from "@/data/site";

export const Route = createFileRoute("/_site/nos-realisations/")({
  head: () => ({
    meta: [
      { title: "Nos réalisations — Références techniques GAFOTEC au Maroc" },
      {
        name: "description",
        content:
          "Les références de GAFOTEC : Laboratoire Jorf Lasfar, Hilton Casablanca Sidi Maarouf, Marina Tanger, instituts et universités à Agadir, Tanger et Fès, et un projet hôtelier en cours.",
      },
      { property: "og:title", content: "Nos réalisations — GAFOTEC" },
      {
        property: "og:description",
        content:
          "Un portfolio de projets techniques livrés dans l’hôtellerie, l’enseignement, l’industrie et le tourisme.",
      },
      { property: "og:image", content: images.hilton },
      { property: "og:url", content: "/nos-realisations" },
    ],
    links: [{ rel: "canonical", href: "/nos-realisations" }],
  }),
  component: ProjectsPage,
});

function ProjectsPage() {
  return (
    <>
      <PageHero
        eyebrow="Nos réalisations"
        title="Des références qui parlent d’elles-mêmes."
        description="Laboratoires industriels, hôtels, instituts et universités : nos installations équipent des bâtiments exigeants, partout au Maroc."
        image={images.hilton}
      />

      <section className="section">
        <div className="container-page">
          <Reveal className="grid gap-8 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <p className="eyebrow">Portfolio</p>
              <h2 className="mt-5 font-heading text-[clamp(1.6rem,3vw,2.3rem)] font-bold leading-[1.1] tracking-[-0.025em] text-foreground">
                Filtrez nos projets par métier ou par année.
              </h2>
            </div>
            <div className="lg:col-span-7">
              <p className="text-[14.5px] leading-[1.8] text-muted-foreground">
                Chaque référence présente la nature du projet et le périmètre technique confié à
                GAFOTEC. Les visuels sont des illustrations architecturales représentatives des
                typologies de bâtiments concernés, utilisées lorsque les photographies de chantier ne
                sont pas disponibles.
              </p>
            </div>
          </Reveal>

          <div className="mt-10">
            <ProjectsExplorer />
          </div>
        </div>
      </section>

      <ContactCTA />
    </>
  );
}
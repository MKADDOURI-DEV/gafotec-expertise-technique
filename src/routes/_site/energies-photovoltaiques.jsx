import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import PageHero from "@/components/site/PageHero";
import Reveal from "@/components/site/Reveal";
import ContactCTA from "@/components/home/ContactCTA";
import { Image } from "@/components/ui/image";
import { images, services } from "@/data/site";

export const Route = createFileRoute("/_site/energies-photovoltaiques")({
  head: () => ({
    meta: [
      {
        title: "Énergie solaire photovoltaïque au Maroc — Étude, installation, maintenance | GAFOTEC",
      },
      {
        name: "description",
        content:
          "GAFOTEC accompagne vos projets photovoltaïques au Maroc : étude de faisabilité, dimensionnement, conception, installation des panneaux, onduleurs et stockage, mise en service et maintenance.",
      },
      { property: "og:title", content: "Énergies photovoltaïques — GAFOTEC" },
      {
        property: "og:description",
        content: "Accélérer la transition énergétique : études, conception, installation et suivi.",
      },
      { property: "og:image", content: images.solaireChamp },
      { property: "og:url", content: "/energies-photovoltaiques" },
    ],
    links: [{ rel: "canonical", href: "/energies-photovoltaiques" }],
  }),
  component: SolarPage,
});

const steps = [
  {
    n: "01",
    title: "Études de faisabilité",
    text: "Analyse de la consommation, du profil de charge et du gisement solaire du site, avec une première évaluation du potentiel.",
  },
  {
    n: "02",
    title: "Dimensionnement des installations",
    text: "Calcul de la puissance, choix de l’architecture (autoconsommation, injection) et bilan économique du projet.",
  },
  {
    n: "03",
    title: "Conception des systèmes photovoltaïques",
    text: "Plans d’implantation, structures, cheminement des câbles, protections électriques et coordination avec le bâtiment.",
  },
  {
    n: "04",
    title: "Installation des panneaux solaires",
    text: "Pose des modules et des structures sur toiture ou au sol, câblage, mises à la terre et raccordements.",
  },
  {
    n: "05",
    title: "Onduleurs et stockage d’énergie",
    text: "Mise en œuvre des onduleurs, des tableaux de protection et des solutions de stockage lorsque le site le justifie.",
  },
  {
    n: "06",
    title: "Mise en service et maintenance",
    text: "Essais, contrôles de sécurité, raccordement, mise en service et contrats de maintenance préventive.",
  },
  {
    n: "07",
    title: "Optimisation des performances",
    text: "Suivi de production, détection des dérives et réglages pour maintenir le rendement dans le temps.",
  },
];

const benefits = [
  { k: "Autoconsommation", v: "Produire et consommer sur site pour réduire la facture énergétique." },
  { k: "Durabilité", v: "Une production locale, silencieuse et sans combustion." },
  { k: "Maîtrise technique", v: "Un interlocuteur unique pour le génie civil, l’électricité et le bâtiment." },
];

function SolarPage() {
  const service = services.find((s) => s.slug === "photovoltaique");

  return (
    <>
      <PageHero
        eyebrow="Énergies photovoltaïques"
        title="Accélérer la transition énergétique."
        description="Études de faisabilité, dimensionnement, conception, installation et maintenance de vos centrales solaires photovoltaïques."
        image={images.solaireChamp}
      />

      <section className="section">
        <div className="container-page grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
          <Reveal className="lg:col-span-6">
            <p className="eyebrow">Notre approche solaire</p>
            <h2 className="mt-5 font-heading text-[clamp(1.7rem,3.2vw,2.6rem)] font-bold leading-[1.08] tracking-[-0.025em] text-foreground">
              Une installation solaire se conçoit comme un ouvrage technique.
            </h2>
            <div className="mt-6 space-y-5 text-[14.5px] leading-[1.8] text-muted-foreground">
              <p>
                Le photovoltaïque ne s’improvise pas : la production dépend de l’orientation, de
                l’ombrage, de la structure du bâtiment et du profil de consommation du site. Nos
                études partent de vos usages réels pour dimensionner une installation juste, ni
                surdimensionnée ni décevante.
              </p>
              <p>
                Parce que GAFOTEC intervient déjà sur les réseaux techniques des bâtiments, nous
                intégrons la centrale solaire dans l’ensemble de l’installation : cheminement,
                protections électriques, coordination avec la climatisation et l’exploitation du
                site.
              </p>
            </div>
            <Link
              to="/contact"
              search={{ service: service.title }}
              className="mt-8 inline-flex items-center gap-2 bg-primary px-5 py-3 font-mono text-[10px] uppercase tracking-[0.16em] text-primary-foreground transition-colors hover:bg-brand-corporate"
            >
              Étudier mon projet solaire
              <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.75} />
            </Link>
          </Reveal>

          <Reveal delay={100} className="lg:col-span-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 aspect-[16/10] overflow-hidden bg-surface">
                <Image src={images.solaireToiture} alt="Centrale photovoltaïque en toiture" className="h-full w-full" />
              </div>
              <div className="aspect-square overflow-hidden bg-surface">
                <Image src={images.onduleurs} alt="Onduleurs et stockage d’énergie" className="h-full w-full" />
              </div>
              <div className="aspect-square overflow-hidden bg-surface">
                <Image src={images.solaireChamp} alt="Champ solaire au sol" className="h-full w-full" />
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="border-y border-border bg-surface py-16 lg:py-20">
        <div className="container-page">
          <Reveal className="max-w-2xl">
            <p className="eyebrow">Notre prestation</p>
            <h2 className="mt-5 font-heading text-[clamp(1.6rem,3vw,2.3rem)] font-bold leading-[1.1] tracking-[-0.025em] text-foreground">
              De l’étude de faisabilité au suivi de production.
            </h2>
          </Reveal>
          <ol className="mt-10 grid gap-px bg-border sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, i) => (
              <Reveal as="li" key={step.n} delay={i * 60} className="bg-background p-6">
                <span className="font-mono text-[10px] tracking-[0.2em] text-primary">{step.n}</span>
                <h3 className="mt-4 font-heading text-[15px] font-semibold leading-snug tracking-tight text-foreground">
                  {step.title}
                </h3>
                <p className="mt-2.5 text-[12.5px] leading-relaxed text-muted-foreground">
                  {step.text}
                </p>
              </Reveal>
            ))}
            <div className="flex flex-col justify-between bg-brand-deep p-6 text-white">
              <p className="font-mono text-[9.5px] uppercase tracking-[0.2em] text-white/60">
                Et après
              </p>
              <p className="mt-4 font-heading text-[15px] font-semibold leading-snug">
                Un contrat de maintenance pour tenir la performance dans le temps.
              </p>
              <Link
                to="/contact"
                className="mt-5 inline-flex items-center gap-2 font-mono text-[9.5px] uppercase tracking-[0.16em] text-white"
              >
                Nous contacter
                <ArrowUpRight className="h-3 w-3" strokeWidth={1.75} />
              </Link>
            </div>
          </ol>
        </div>
      </section>

      <section className="section">
        <div className="container-page">
          <div className="grid gap-10 md:grid-cols-3">
            {benefits.map((item, i) => (
              <Reveal key={item.k} delay={i * 80}>
                <h3 className="border-t border-primary/30 pt-5 font-heading text-[17px] font-bold tracking-tight text-primary">
                  {item.k}
                </h3>
                <p className="mt-3 text-[13.5px] leading-[1.75] text-muted-foreground">{item.v}</p>
              </Reveal>
            ))}
          </div>
          <Reveal className="mt-14 aspect-[21/9] overflow-hidden bg-surface">
            <Image src={images.solaireChamp} alt="Installation photovoltaïque industrielle au Maroc" className="h-full w-full" />
          </Reveal>
        </div>
      </section>

      <ContactCTA />
    </>
  );
}
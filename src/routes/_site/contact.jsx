import { createFileRoute } from "@tanstack/react-router";
import { ArrowUpRight, Clock, Mail, MapPin, Phone } from "lucide-react";
import PageHero from "@/components/site/PageHero";
import Reveal from "@/components/site/Reveal";
import QuoteForm from "@/components/contact/QuoteForm";
import { company as companyInfo, serviceOptions, whatsappLink } from "@/data/site";
import { useCompany, useContent } from "@/components/content/ContentProvider";

export const Route = createFileRoute("/_site/contact")({
  validateSearch: (search) => ({
    service: typeof search.service === "string" ? search.service : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Contact & devis — GAFOTEC, Fès | CVC, plomberie, incendie, photovoltaïque" },
      {
        name: "description",
        content:
          "Contactez GAFOTEC à Fès : +212 662 287 996 / +212 635 819 936 — Ste.gafotec@gmail.com. Demande de devis pour vos installations CVC, plomberie, chauffage, incendie et photovoltaïque au Maroc.",
      },
      { property: "og:title", content: "Contacter GAFOTEC — Demande de devis" },
      {
        property: "og:description",
        content: "Parlons de votre projet technique : téléphone, e-mail, WhatsApp et formulaire de devis.",
      },
      { property: "og:image", content: images.chantier },
      { property: "og:url", content: "/contact" },
    ],
    links: [{ rel: "canonical", href: "/contact" }],
  }),
  component: ContactPage,
});

function ContactPage() {
  const { service } = Route.useSearch();
  const defaultService = serviceOptions.includes(service) ? service : "";
  const company = useCompany();
  const { t } = useContent();

  return (
    <>
      <PageHero contentKey="contact" />

      <section className="section">
        <div className="container-page grid gap-12 lg:grid-cols-12 lg:gap-16">
          <Reveal className="lg:col-span-5">
            <p className="eyebrow">Coordonnées</p>
            <h2 className="mt-5 font-heading text-[clamp(1.5rem,2.6vw,2rem)] font-bold leading-[1.12] tracking-[-0.025em] text-foreground">
              GAFOTEC — Corps d’État Techniques
            </h2>

            <dl className="mt-8 space-y-px overflow-hidden border border-border bg-border">
              <div className="flex gap-4 bg-background p-5">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" strokeWidth={1.6} />
                <div>
                  <dt className="font-mono text-[9.5px] uppercase tracking-[0.18em] text-muted-foreground">
                    Adresse
                  </dt>
                  <dd className="mt-2 text-[13.5px] leading-relaxed text-foreground">
                    {company.address}
                  </dd>
                  <dd>
                    <a
                      href={companyInfo.mapsLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-flex items-center gap-1.5 font-mono text-[9.5px] uppercase tracking-[0.16em] text-primary hover:text-brand-deep"
                    >
                      Itinéraire
                      <ArrowUpRight className="h-3 w-3" strokeWidth={1.75} />
                    </a>
                  </dd>
                </div>
              </div>

              <div className="flex gap-4 bg-background p-5">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-primary" strokeWidth={1.6} />
                <div>
                  <dt className="font-mono text-[9.5px] uppercase tracking-[0.18em] text-muted-foreground">
                    Téléphone
                  </dt>
                  {company.phones.map((phone, i) => (
                    <dd key={phone} className="mt-2">
                      <a
                        href={`tel:${company.phoneHrefs[i]}`}
                        className="text-[13.5px] text-foreground transition-colors hover:text-primary"
                      >
                        {phone}
                      </a>
                    </dd>
                  ))}
                </div>
              </div>

              <div className="flex gap-4 bg-background p-5">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-primary" strokeWidth={1.6} />
                <div>
                  <dt className="font-mono text-[9.5px] uppercase tracking-[0.18em] text-muted-foreground">
                    E-mail
                  </dt>
                  <dd className="mt-2">
                    <a
                      href={`mailto:${company.email}`}
                      className="break-all text-[13.5px] text-foreground transition-colors hover:text-primary"
                    >
                      {company.email}
                    </a>
                  </dd>
                </div>
              </div>

              <div className="flex gap-4 bg-background p-5">
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-primary" strokeWidth={1.6} />
                <div>
                  <dt className="font-mono text-[9.5px] uppercase tracking-[0.18em] text-muted-foreground">
                    Horaires
                  </dt>
                  <dd className="mt-2 text-[13.5px] leading-relaxed text-foreground">
                    {company.hours}
                    <span className="mt-1 block text-[12px] text-muted-foreground">
                      {company.hoursNote}
                    </span>
                  </dd>
                </div>
              </div>
            </dl>

            <a
              href={whatsappLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 flex items-center justify-between gap-3 border border-primary/25 bg-accent/50 p-5 transition-colors hover:border-primary/50"
            >
              <span>
                <span className="block font-heading text-[14px] font-semibold text-foreground">
                  Discuter sur WhatsApp
                </span>
                <span className="mt-1 block text-[12px] text-muted-foreground">
                  Envoyez-nous vos plans et photos directement.
                </span>
              </span>
              <ArrowUpRight className="h-4 w-4 shrink-0 text-primary" strokeWidth={1.75} />
            </a>
          </Reveal>

          <Reveal delay={100} className="lg:col-span-7">
            <div className="border border-border p-6 lg:p-8">
              <p className="eyebrow">Demande de devis</p>
              <h2 className="mt-4 font-heading text-[clamp(1.3rem,2.2vw,1.7rem)] font-bold leading-[1.15] tracking-[-0.02em] text-foreground">
                Décrivez votre projet, nous revenons vers vous.
              </h2>
              <p className="mt-3 max-w-lg text-[13.5px] leading-relaxed text-muted-foreground">
                Renseignez les informations essentielles : type de bâtiment, nature des
                installations et échéance souhaitée. Plus votre description est précise, plus notre
                réponse sera juste.
              </p>
              <div className="mt-8">
                <QuoteForm defaultService={defaultService} />
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="border-t border-border">
        <div className="container-page py-14">
          <div className="grid gap-6 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-4">
              <p className="eyebrow">Nous trouver</p>
              <h2 className="mt-4 font-heading text-[clamp(1.3rem,2.2vw,1.7rem)] font-bold leading-[1.15] tracking-[-0.02em] text-foreground">
                Fès — Ouled Youssef Ouled Tayeb
              </h2>
              <p className="mt-3 text-[13px] leading-relaxed text-muted-foreground">
                {company.address}
              </p>
            </div>
            <div className="lg:col-span-8">
              <div className="aspect-[16/9] w-full overflow-hidden border border-border bg-surface">
                <iframe
                  title="Localisation de GAFOTEC à Fès"
                  src={companyInfo.mapsEmbed}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="h-full w-full border-0"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
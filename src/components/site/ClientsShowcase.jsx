import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Building2 } from "lucide-react";
import Reveal from "@/components/site/Reveal";
import { useContent } from "@/components/content/ContentProvider";
import { initialsOf, sectorsOf } from "@/lib/clients";
import { cn } from "@/lib/utils";

function ClientLogo({ client }) {
  const [broken, setBroken] = useState(false);
  if (!client.logo_url || broken) {
    return (
      <span aria-hidden="true" className="font-heading text-3xl font-bold tracking-tight text-primary/35">
        {initialsOf(client.name)}
      </span>
    );
  }
  return (
    <img
      src={client.logo_url}
      alt={`Logo ${client.name}`}
      loading="lazy"
      decoding="async"
      onError={() => setBroken(true)}
      className="max-h-full max-w-full object-contain"
    />
  );
}

function ClientCard({ client }) {
  return (
    <article className="flex h-full min-w-0 flex-col border border-border bg-background transition-shadow duration-300 hover:shadow-[0_18px_40px_-26px_rgba(6,70,165,0.45)]">
      <div className="flex h-36 items-center justify-center border-b border-border bg-white p-6 sm:h-40">
        <ClientLogo client={client} />
      </div>
      <div className="flex flex-1 flex-col p-5">
        {client.sector ? <p className="font-mono text-[9.5px] uppercase tracking-[0.18em] text-primary">{client.sector}</p> : null}
        <h3 className="mt-2 break-words font-heading text-[15px] font-semibold leading-snug tracking-tight text-foreground">{client.name}</h3>
        {client.description ? <p className="mt-3 text-[13px] leading-[1.7] text-muted-foreground">{client.description}</p> : null}
        {client.website ? (
          <a
            href={client.website}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-auto inline-flex min-h-11 items-center gap-1.5 pt-4 font-mono text-[10px] uppercase tracking-[0.16em] text-primary hover:text-brand-deep"
            aria-label={`Visiter le site de ${client.name} (nouvel onglet)`}
          >
            Visiter le site
            <ArrowUpRight className="h-3 w-3" strokeWidth={1.75} />
          </a>
        ) : null}
      </div>
    </article>
  );
}

/** « Nos clients »: published clients only, with sector filter when several sectors exist, and a clean empty state. */
export default function ClientsShowcase({ clients }) {
  const { t } = useContent();
  const [sector, setSector] = useState("");
  const sectors = useMemo(() => sectorsOf(clients), [clients]);
  const visible = sector ? clients.filter((client) => client.sector === sector) : clients;

  if (clients.length === 0) {
    return (
      <section className="section" aria-labelledby="clients-empty-title">
        <div className="container-page">
          <Reveal className="mx-auto max-w-xl border border-dashed border-border bg-surface p-8 text-center sm:p-12">
            <Building2 className="mx-auto h-6 w-6 text-primary" strokeWidth={1.5} />
            <h2 id="clients-empty-title" className="mt-5 font-heading text-xl font-bold tracking-tight text-foreground">
              {t("clients.empty.title")}
            </h2>
            <p className="mt-3 text-[14px] leading-relaxed text-muted-foreground">{t("clients.empty.text")}</p>
            <Link
              to="/contact"
              className="mt-7 inline-flex min-h-12 items-center justify-center bg-primary px-6 font-mono text-[10.5px] uppercase tracking-[0.16em] text-primary-foreground transition-colors hover:bg-brand-deep"
            >
              Nous contacter
            </Link>
          </Reveal>
        </div>
      </section>
    );
  }

  return (
    <section className="section" aria-labelledby="clients-title">
      <div className="container-page">
        <Reveal className="mx-auto max-w-3xl text-center">
          <p className="eyebrow justify-center">GAFOTEC</p>
          <h2 id="clients-title" className="mt-5 font-heading text-[clamp(1.6rem,3vw,2.4rem)] font-bold leading-[1.1] tracking-[-0.02em] text-foreground">
            {t("clients.list.title")}
          </h2>
        </Reveal>

        {sectors.length > 1 ? (
          <div className="mt-8 flex flex-wrap justify-center gap-2" role="group" aria-label="Filtrer par secteur d’activité">
            {["", ...sectors].map((value) => (
              <button
                key={value || "all"}
                type="button"
                aria-pressed={sector === value}
                onClick={() => setSector(value)}
                className={cn(
                  "min-h-11 border px-4 font-mono text-[10px] uppercase tracking-[0.14em] transition-colors sm:min-h-9",
                  sector === value ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground",
                )}
              >
                {value || "Tous"}
              </button>
            ))}
          </div>
        ) : null}

        <ul className="mt-10 grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
          {visible.map((client, index) => (
            <li key={client.id} className="min-w-0">
              <Reveal delay={Math.min(index, 5) * 60} className="h-full">
                <ClientCard client={client} />
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

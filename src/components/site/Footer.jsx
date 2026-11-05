import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Mail, MapPin, Phone } from "lucide-react";
import Logo from "@/components/site/Logo";
import { company, navLinks, services, whatsappLink } from "@/data/site";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden bg-brand-deep text-white">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.16]"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,.5) 1px, transparent 1px)",
          backgroundSize: "72px 72px",
        }}
        aria-hidden="true"
      />

      <div className="container-page relative py-16 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Logo inverted />
            <p className="mt-6 max-w-xs text-sm leading-relaxed text-white/70">
              Entreprise marocaine de corps d’état techniques : CVC, plomberie, chauffage,
              protection incendie, désenfumage, piscines et énergie solaire photovoltaïque.
            </p>
            <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.22em] text-white/45">
              Fès · Maroc — 34.03°N / 5.00°O
            </p>
          </div>

          <nav aria-label="Plan du site" className="lg:col-span-2">
            <h2 className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/45">
              Navigation
            </h2>
            <ul className="mt-5 space-y-2.5">
              {navLinks.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-[13.5px] text-white/75 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="lg:col-span-3">
            <h2 className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/45">
              Nos expertises
            </h2>
            <ul className="mt-5 space-y-2.5">
              {services.map((service) => (
                <li key={service.slug}>
                  <Link
                    to="/nos-expertises"
                    hash={service.slug}
                    className="text-[13.5px] text-white/75 transition-colors hover:text-white"
                  >
                    {service.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-3">
            <h2 className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/45">
              Contact
            </h2>
            <ul className="mt-5 space-y-4 text-[13.5px]">
              <li className="flex gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-white/50" strokeWidth={1.5} />
                <span className="leading-relaxed text-white/75">{company.address}</span>
              </li>
              {company.phones.map((phone, i) => (
                <li key={phone} className="flex gap-3">
                  <Phone className="mt-0.5 h-4 w-4 shrink-0 text-white/50" strokeWidth={1.5} />
                  <a href={`tel:${company.phoneHrefs[i]}`} className="text-white/75 hover:text-white">
                    {phone}
                  </a>
                </li>
              ))}
              <li className="flex gap-3">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-white/50" strokeWidth={1.5} />
                <a href={`mailto:${company.email}`} className="text-white/75 hover:text-white">
                  {company.email}
                </a>
              </li>
            </ul>
            <a
              href={whatsappLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-2 border border-white/25 px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.18em] text-white transition-colors hover:bg-white hover:text-brand-deep"
            >
              Discuter sur WhatsApp
              <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.75} />
            </a>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-white/15 pt-6 text-[11px] text-white/50 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {company.legal}. Tous droits réservés.
          </p>
          <p className="font-mono uppercase tracking-[0.16em]">{company.website}</p>
        </div>
      </div>
    </footer>
  );
}
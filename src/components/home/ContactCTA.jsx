import { Link } from "@tanstack/react-router";
import { ArrowRight, ArrowUpRight, Mail, Phone } from "lucide-react";
import Reveal from "@/components/site/Reveal";
import { company, whatsappLink } from "@/data/site";

export default function ContactCTA() {
  return (
    <section className="relative overflow-hidden bg-brand-deep text-white" aria-labelledby="cta-title">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.14]"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,.45) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,.45) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
        aria-hidden="true"
      />
      <div className="container-page relative py-20 lg:py-24">
        <Reveal className="grid gap-10 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <p className="font-mono text-[10px] uppercase tracking-[0.26em] text-white/55">
              Contact
            </p>
            <h2
              id="cta-title"
              className="mt-5 font-heading text-[clamp(1.9rem,4.2vw,3.4rem)] font-bold leading-[1.02] tracking-[-0.03em]"
            >
              Un projet à concrétiser ?
              <br />
              Parlons-en.
            </h2>
            <p className="mt-5 max-w-lg text-[14.5px] leading-relaxed text-white/70">
              Décrivez-nous votre projet : nous revenons vers vous avec une réponse technique claire
              et un chiffrage détaillé.
            </p>
          </div>

          <div className="lg:col-span-5">
            <div className="flex flex-col gap-3">
              <Link
                to="/contact"
                className="inline-flex items-center justify-center gap-2 bg-white px-6 py-3.5 font-mono text-[10.5px] uppercase tracking-[0.16em] text-brand-deep transition-colors hover:bg-brand-light"
              >
                Demander un devis
                <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.75} />
              </Link>
              <div className="grid gap-3 sm:grid-cols-2">
                <a
                  href={`tel:${company.phoneHrefs[0]}`}
                  className="inline-flex items-center justify-center gap-2 border border-white/35 px-4 py-3.5 font-mono text-[10.5px] uppercase tracking-[0.14em] text-white transition-colors hover:bg-white/10"
                >
                  <Phone className="h-3.5 w-3.5" strokeWidth={1.75} /> Appeler
                </a>
                <a
                  href={whatsappLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 border border-white/35 px-4 py-3.5 font-mono text-[10.5px] uppercase tracking-[0.14em] text-white transition-colors hover:bg-white/10"
                >
                  WhatsApp
                  <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.75} />
                </a>
              </div>
              <a
                href={`mailto:${company.email}`}
                className="mt-1 inline-flex items-center gap-2 text-[13px] text-white/75 transition-colors hover:text-white"
              >
                <Mail className="h-3.5 w-3.5" strokeWidth={1.75} />
                {company.email}
              </a>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
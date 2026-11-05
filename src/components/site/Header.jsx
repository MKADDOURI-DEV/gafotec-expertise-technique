import { useEffect, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, Phone, X } from "lucide-react";
import Logo from "@/components/site/Logo";
import { useCompany } from "@/components/content/ContentProvider";
import { navLinks } from "@/data/site";
import { cn } from "@/lib/utils";

export default function Header() {
  const company = useCompany();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Every page opens on a dark hero, so the header starts transparent and turns
  // solid on scroll. Keeps the server and client first render identical.
  const overlay = !scrolled;

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-all duration-500",
          overlay
            ? "border-b border-white/10 bg-transparent"
            : "border-b border-border bg-white/92 backdrop-blur-md",
        )}
      >
        <div className="container-page flex h-[68px] items-center justify-between gap-6 lg:h-[80px]">
          <Logo inverted={overlay} />

          <nav aria-label="Navigation principale" className="hidden items-center gap-7 xl:flex">
            {navLinks.slice(1, 7).map((link) => {
              const active = pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={cn(
                    "relative py-1 font-mono text-[10.5px] uppercase tracking-[0.16em] transition-colors duration-300",
                    overlay
                      ? "text-white/80 hover:text-white"
                      : "text-muted-foreground hover:text-foreground",
                    active && (overlay ? "text-white" : "text-primary"),
                  )}
                >
                  {link.label}
                  <span
                    className={cn(
                      "absolute -bottom-0.5 left-0 h-px w-full origin-left scale-x-0 bg-current transition-transform duration-300",
                      active && "scale-x-100",
                    )}
                  />
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            <a
              href={`tel:${company.phoneHrefs[0]}`}
              className={cn(
                "hidden items-center gap-2 font-mono text-[11px] tracking-[0.08em] transition-colors md:flex",
                overlay ? "text-white/85 hover:text-white" : "text-foreground hover:text-primary",
              )}
            >
              <Phone className="h-3.5 w-3.5" strokeWidth={1.75} />
              {company.phones[0]}
            </a>
            <Link
              to="/contact"
              className={cn(
                "hidden items-center px-5 py-2.5 font-mono text-[10.5px] uppercase tracking-[0.16em] transition-colors duration-300 sm:inline-flex",
                overlay
                  ? "border border-white/70 text-white hover:bg-white hover:text-brand-deep"
                  : "bg-primary text-primary-foreground hover:bg-brand-corporate",
              )}
            >
              Demander un devis
            </Link>
            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-label="Ouvrir le menu"
              className={cn(
                "flex h-10 w-10 items-center justify-center transition-colors xl:hidden",
                overlay ? "text-white" : "text-foreground",
              )}
            >
              <Menu className="h-5 w-5" strokeWidth={1.75} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      <div
        className={cn(
          "fixed inset-0 z-[60] bg-brand-deep text-white transition-all duration-500 xl:hidden",
          open ? "visible opacity-100" : "invisible opacity-0",
        )}
        aria-hidden={!open}
      >
        <div className="container-page flex h-[68px] items-center justify-between lg:h-[80px]">
          <Logo inverted />
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Fermer le menu"
            className="flex h-10 w-10 items-center justify-center text-white"
          >
            <X className="h-5 w-5" strokeWidth={1.75} />
          </button>
        </div>
        <nav aria-label="Navigation mobile" className="container-page mt-6 flex flex-col">
          {navLinks.map((link, i) => (
            <Link
              key={link.to}
              to={link.to}
              className={cn(
                "flex items-baseline gap-4 border-b border-white/12 py-4 transition-colors",
                pathname === link.to ? "text-white" : "text-white/75 hover:text-white",
              )}
            >
              <span className="font-mono text-[10px] tracking-[0.2em] text-white/40">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="font-heading text-xl font-semibold tracking-tight">{link.label}</span>
            </Link>
          ))}
        </nav>
        <div className="container-page mt-8 space-y-3">
          <a
            href={`tel:${company.phoneHrefs[0]}`}
            className="flex items-center justify-center gap-2 border border-white/40 px-5 py-3.5 font-mono text-[11px] uppercase tracking-[0.18em] text-white"
          >
            <Phone className="h-3.5 w-3.5" strokeWidth={1.75} /> {company.phones[0]}
          </a>
          <Link
            to="/contact"
            className="flex items-center justify-center bg-white px-5 py-3.5 font-mono text-[11px] uppercase tracking-[0.18em] text-brand-deep"
          >
            Demander un devis
          </Link>
        </div>
      </div>
    </>
  );
}
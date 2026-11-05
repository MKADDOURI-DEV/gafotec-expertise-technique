import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

/**
 * GAFOTEC wordmark — a technical "G" mark in a hairline square,
 * paired with the corporate lockup.
 */
export default function Logo({ inverted = false, compact = false, className = "" }) {
  return (
    <Link
      to="/"
      aria-label="GAFOTEC — retour à l’accueil"
      className={cn("group inline-flex items-center gap-3", className)}
    >
      <span
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-[3px] border transition-colors duration-300",
          inverted
            ? "border-white/45 text-white group-hover:border-white/80"
            : "border-primary/25 text-primary group-hover:border-primary/60",
        )}
      >
        <svg viewBox="0 0 40 40" className="h-6 w-6" aria-hidden="true" fill="none">
          <path
            d="M27 14.2a9 9 0 1 0 .2 11.9v-5.4h-6"
            stroke="currentColor"
            strokeWidth="2.3"
            strokeLinecap="square"
          />
        </svg>
      </span>
      <span className="flex flex-col leading-none">
        <span
          className={cn(
            "font-heading text-[17px] font-extrabold uppercase leading-none tracking-[0.18em] transition-colors duration-300",
            inverted ? "text-white" : "text-foreground",
          )}
        >
          Gafotec
        </span>
        {!compact && (
          <span
            className={cn(
              "mt-[5px] font-mono text-[7.5px] uppercase leading-none tracking-[0.28em] transition-colors duration-300",
              inverted ? "text-white/65" : "text-muted-foreground",
            )}
          >
            Corps d’État Techniques
          </span>
        )}
      </span>
    </Link>
  );
}
import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { Image } from "@/components/ui/image";
import { projectCategories } from "@/data/site";
import { cn } from "@/lib/utils";

export default function ProjectsExplorer({ projects = [] }) {
  const [category, setCategory] = useState("Tous");
  const [year, setYear] = useState("Tous");

  const years = useMemo(
    () => Array.from(new Set(projects.map((p) => p.year))).sort((a, b) => a - b),
    [projects],
  );

  const filtered = projects.filter(
    (p) => (category === "Tous" || p.category === category) && (year === "Tous" || p.year === Number(year)),
  );

  return (
    <div>
      {/* filters */}
      <div className="space-y-5 border-y border-border py-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1 font-mono text-[9.5px] uppercase tracking-[0.2em] text-muted-foreground">
            Métier
          </span>
          {projectCategories.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setCategory(item)}
              aria-pressed={category === item}
              className={cn(
                "border px-3.5 py-2 font-mono text-[10px] uppercase tracking-[0.14em] transition-colors",
                category === item
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-muted-foreground hover:border-primary/40 hover:text-primary",
              )}
            >
              {item}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1 font-mono text-[9.5px] uppercase tracking-[0.2em] text-muted-foreground">
            Année
          </span>
          {["Tous", ...years].map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setYear(String(item))}
              aria-pressed={year === String(item)}
              className={cn(
                "border px-3 py-2 font-mono text-[10px] tracking-[0.1em] transition-colors",
                year === String(item)
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
        {filtered.length} référence{filtered.length > 1 ? "s" : ""}
        {category !== "Tous" && ` · ${category}`}
        {year !== "Tous" && ` · ${year}`}
      </p>

      {filtered.length === 0 ? (
        <div className="mt-10 border border-border p-10 text-center">
          <p className="text-[14px] text-muted-foreground">
            Aucune référence ne correspond à cette sélection.
          </p>
          <button
            type="button"
            onClick={() => {
              setCategory("Tous");
              setYear("Tous");
            }}
            className="mt-4 font-mono text-[10px] uppercase tracking-[0.16em] text-primary"
          >
            Réinitialiser les filtres
          </button>
        </div>
      ) : (
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((project) => (
            <Link
              key={project.slug}
              to="/nos-realisations/$slug"
              params={{ slug: project.slug }}
              className="group flex flex-col border border-border transition-colors duration-300 hover:border-primary/40"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-surface">
                <Image
                  src={project.image}
                  alt={project.title}
                  className="absolute inset-0 h-full w-full transition-transform duration-1000 ease-out group-hover:scale-[1.05]"
                />
                <span className="absolute left-0 top-0 bg-white/95 px-2.5 py-1.5 font-mono text-[10px] tracking-[0.16em] text-primary">
                  {project.year}
                </span>
                {project.status && (
                  <span className="absolute right-0 top-0 bg-brand-deep px-2.5 py-1.5 font-mono text-[9.5px] uppercase tracking-[0.14em] text-white">
                    {project.status}
                  </span>
                )}
              </div>
              <div className="flex flex-1 flex-col p-5">
                <p className="font-mono text-[9.5px] uppercase tracking-[0.2em] text-muted-foreground">
                  {project.category} · {project.location}
                </p>
                <h3 className="mt-2.5 font-heading text-[16px] font-semibold leading-snug tracking-tight text-foreground">
                  {project.title}
                </h3>
                <p className="mt-2.5 line-clamp-3 text-[12.5px] leading-relaxed text-muted-foreground">
                  {project.summary}
                </p>
                <span className="mt-auto inline-flex items-center gap-1.5 pt-5 font-mono text-[9.5px] uppercase tracking-[0.16em] text-primary">
                  Voir le projet
                  <ArrowUpRight
                    className="h-3 w-3 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                    strokeWidth={1.75}
                  />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
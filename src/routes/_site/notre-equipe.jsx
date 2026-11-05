import { createFileRoute } from "@tanstack/react-router";
import PageHero from "@/components/site/PageHero";
import Reveal from "@/components/site/Reveal";
import ContactCTA from "@/components/home/ContactCTA";
import { images, team } from "@/data/site";

export const Route = createFileRoute("/_site/notre-equipe")({
  head: () => ({
    meta: [
      { title: "Notre équipe & organisation — GAFOTEC Corps d’État Techniques" },
      {
        name: "description",
        content:
          "L’organisation de GAFOTEC : direction, bureau d’études techniques et chiffrage, conduite de projet, dessin technique, chantier, comptabilité et achats.",
      },
      { property: "og:title", content: "Notre équipe — GAFOTEC" },
      {
        property: "og:description",
        content: "Une organisation technique intégrée : études, chiffrage, chantier et support.",
      },
      { property: "og:image", content: images.euromed },
      { property: "og:url", content: "/notre-equipe" },
    ],
    links: [{ rel: "canonical", href: "/notre-equipe" }],
  }),
  component: TeamPage,
});

const groups = [
  { key: "Études", label: "Bureau d’études & chiffrage", note: "Études techniques, métrés, chiffrage et dessin d’exécution." },
  { key: "Chantier", label: "Conduite de chantier", note: "Organisation, suivi des équipes et qualité d’exécution." },
  { key: "Support", label: "Fonctions support", note: "Comptabilité, achats et logistique des approvisionnements." },
];

function initials(name) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("");
}

function TeamPage() {
  const manager = team.find((member) => member.group === "Direction");

  return (
    <>
      <PageHero contentKey="equipe" />

      <section className="section">
        <div className="container-page">
          <Reveal className="mx-auto max-w-md">
            <div className="border border-border bg-brand-deep p-7 text-center text-white">
              <p className="font-mono text-[9.5px] uppercase tracking-[0.22em] text-white/55">
                Direction
              </p>
              <p className="mt-4 font-heading text-xl font-bold tracking-tight">{manager.name}</p>
              <p className="mt-1.5 text-[12.5px] text-white/70">{manager.role}</p>
            </div>
            <div className="mx-auto h-10 w-px bg-border" />
          </Reveal>

          <div className="grid gap-6 md:grid-cols-3">
            {groups.map((group, gi) => {
              const members = team.filter((member) => member.group === group.key);
              return (
                <Reveal key={group.key} delay={gi * 90}>
                  <div className="flex h-full flex-col border border-border">
                    <div className="border-b border-border bg-surface px-5 py-4">
                      <p className="font-mono text-[9.5px] uppercase tracking-[0.18em] text-primary">
                        0{gi + 1} — {group.key}
                      </p>
                      <p className="mt-2 font-heading text-[14.5px] font-semibold tracking-tight text-foreground">
                        {group.label}
                      </p>
                    </div>
                    <ul className="flex flex-1 flex-col divide-y divide-border">
                      {members.map((member) => (
                        <li key={member.name} className="flex items-center gap-3.5 px-5 py-4">
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-primary/25 font-mono text-[10px] text-primary">
                            {initials(member.name)}
                          </span>
                          <span>
                            <span className="block font-heading text-[13px] font-semibold uppercase tracking-[0.04em] text-foreground">
                              {member.name}
                            </span>
                            <span className="mt-0.5 block text-[11.5px] leading-snug text-muted-foreground">
                              {member.role}
                            </span>
                          </span>
                        </li>
                      ))}
                    </ul>
                    <p className="border-t border-border px-5 py-4 text-[11.5px] leading-relaxed text-muted-foreground">
                      {group.note}
                    </p>
                  </div>
                </Reveal>
              );
            })}
          </div>

          <Reveal className="mt-12 grid gap-6 border-t border-border pt-10 lg:grid-cols-12">
            <p className="eyebrow lg:col-span-4">Comment nous travaillons</p>
            <div className="space-y-4 text-[14px] leading-[1.8] text-muted-foreground lg:col-span-8">
              <p>
                Les décisions techniques sont prises par ceux qui les exécutent : le bureau d’études
                et les chefs de chantier travaillent ensemble dès la phase de conception, ce qui
                limite les reprises et les mauvaises surprises en phase de réalisation.
              </p>
              <p>
                Sur le terrain, chaque chantier dispose d’un responsable qui coordonne les équipes,
                contrôle la conformité des installations et rend compte de l’avancement au maître
                d’ouvrage.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      <ContactCTA />
    </>
  );
}
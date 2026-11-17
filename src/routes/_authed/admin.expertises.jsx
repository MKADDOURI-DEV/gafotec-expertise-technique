import { useState } from "react";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { ArrowDown, ArrowUp, Loader2, Pencil, Plus, Trash2, Wrench } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import ExpertiseEditor from "@/components/admin/ExpertiseEditor";
import { deleteExpertise, getExpertises, reorderExpertiseList } from "@/lib/content-fns";
import { moveItem } from "@/lib/expertises";

export const Route = createFileRoute("/_authed/admin/expertises")({
  loader: () => getExpertises(),
  component: ExpertisesAdmin,
});

function ExpertisesAdmin() {
  const { source, items } = Route.useLoaderData();
  const router = useRouter();
  const remove = useServerFn(deleteExpertise);
  const reorder = useServerFn(reorderExpertiseList);

  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [confirming, setConfirming] = useState(null);
  const [busy, setBusy] = useState(false);
  const locked = source !== "db";

  const openEditor = (expertise) => {
    setEditing(expertise);
    setEditorOpen(true);
  };

  const handleDelete = async (expertise) => {
    setBusy(true);
    try {
      await remove({ data: { id: expertise.id } });
      await router.invalidate();
      setConfirming(null);
      toast.success("Expertise supprimée");
    } catch (error) {
      toast.error(error?.message ?? "Suppression impossible");
    } finally {
      setBusy(false);
    }
  };

  const move = async (index, delta) => {
    const next = moveItem(items, index, index + delta);
    if (next === items) return;
    setBusy(true);
    try {
      await reorder({ data: { ids: next.map((item) => item.id) } });
      await router.invalidate();
    } catch (error) {
      toast.error(error?.message ?? "Réorganisation impossible");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Contenu</p>
          <h1 className="mt-4 font-heading text-[clamp(1.5rem,2.8vw,2rem)] font-bold leading-[1.1] tracking-[-0.025em] text-foreground">
            Gestion des expertises
          </h1>
          <p className="mt-3 max-w-xl text-[14px] leading-relaxed text-muted-foreground">
            {items.length} expertise{items.length > 1 ? "s" : ""} affichée{items.length > 1 ? "s" : ""} sur « Nos expertises »,
            l’accueil et le pied de page. Utilisez les flèches pour changer l’ordre d’affichage.
          </p>
        </div>
        <Button type="button" disabled={locked} onClick={() => openEditor(null)}>
          <Plus className="mr-2 h-4 w-4" strokeWidth={1.75} />
          Ajouter une expertise
        </Button>
      </div>

      {locked ? (
        <div className="mt-6 border border-amber-500/40 bg-amber-50 p-4 text-[13px] leading-relaxed text-amber-900">
          La table des expertises n’existe pas encore sur Supabase : le site affiche pour l’instant la liste d’origine et la
          modification est désactivée. Une fois le SQL appliqué (voir la procédure), cette page devient active.
        </div>
      ) : null}

      <ul className="mt-8 divide-y divide-border border border-border bg-background">
        {items.map((expertise, index) => (
          <li key={expertise.id ?? expertise.slug} className="flex flex-wrap items-center gap-4 p-4">
            <div className="h-14 w-20 shrink-0 overflow-hidden border border-border bg-secondary">
              {expertise.image ? <img src={expertise.image} alt="" className="h-full w-full object-cover" /> : null}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-primary">{expertise.number}</p>
              <p className="truncate font-heading text-[14px] font-semibold text-foreground">{expertise.title}</p>
              <p className="mt-0.5 line-clamp-1 text-[12px] text-muted-foreground">{expertise.excerpt}</p>
            </div>
            <div className="flex items-center gap-1.5">
              <Button type="button" variant="ghost" size="sm" disabled={locked || busy || index === 0} onClick={() => move(index, -1)} aria-label={`Monter ${expertise.title}`}>
                <ArrowUp className="h-3.5 w-3.5" strokeWidth={1.75} />
              </Button>
              <Button type="button" variant="ghost" size="sm" disabled={locked || busy || index === items.length - 1} onClick={() => move(index, 1)} aria-label={`Descendre ${expertise.title}`}>
                <ArrowDown className="h-3.5 w-3.5" strokeWidth={1.75} />
              </Button>
              <Button type="button" variant="outline" size="sm" disabled={locked} onClick={() => openEditor(expertise)}>
                <Pencil className="mr-1.5 h-3.5 w-3.5" strokeWidth={1.75} />
                Modifier
              </Button>
              {confirming === expertise.id ? (
                <div className="flex items-center gap-1.5">
                  <Button type="button" variant="destructive" size="sm" disabled={busy} onClick={() => handleDelete(expertise)}>
                    {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Confirmer"}
                  </Button>
                  <Button type="button" variant="ghost" size="sm" onClick={() => setConfirming(null)}>
                    Annuler
                  </Button>
                </div>
              ) : (
                <Button type="button" variant="ghost" size="sm" disabled={locked} onClick={() => setConfirming(expertise.id)} aria-label={`Supprimer ${expertise.title}`}>
                  <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
                </Button>
              )}
            </div>
          </li>
        ))}
      </ul>

      {items.length === 0 && (
        <div className="mt-8 border border-border bg-background p-8 text-center">
          <Wrench className="mx-auto h-5 w-5 text-primary" strokeWidth={1.6} />
          <p className="mt-3 text-[13.5px] text-muted-foreground">Aucune expertise. Ajoutez la première pour alimenter la page « Nos expertises ».</p>
        </div>
      )}

      <ExpertiseEditor expertise={editing} open={editorOpen} onOpenChange={setEditorOpen} onSaved={() => router.invalidate()} />
    </div>
  );
}

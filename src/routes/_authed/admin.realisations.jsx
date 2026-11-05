import { useState } from "react";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Image } from "@/components/ui/image";
import { Button } from "@/components/ui/button";
import ProjectEditor from "@/components/admin/ProjectEditor";
import { deleteProject, getProjects } from "@/lib/content-fns";

export const Route = createFileRoute("/_authed/admin/realisations")({
  loader: () => getProjects(),
  component: ProjectsAdmin,
});

function ProjectsAdmin() {
  const projects = Route.useLoaderData();
  const router = useRouter();
  const remove = useServerFn(deleteProject);

  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [confirming, setConfirming] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const openNew = () => {
    setEditing(null);
    setEditorOpen(true);
  };

  const openEdit = (project) => {
    setEditing(project);
    setEditorOpen(true);
  };

  const handleDelete = async (project) => {
    setDeleting(true);
    try {
      await remove({ data: { id: project.id } });
      await router.invalidate();
      setConfirming(null);
      toast.success("Réalisation supprimée");
    } catch (error) {
      toast.error(error?.message ?? "Suppression impossible");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Réalisations</p>
          <h1 className="mt-4 font-heading text-[clamp(1.5rem,2.8vw,2rem)] font-bold leading-[1.1] tracking-[-0.025em] text-foreground">
            Portfolio de projets
          </h1>
          <p className="mt-3 max-w-xl text-[14px] leading-relaxed text-muted-foreground">
            {projects.length} référence{projects.length > 1 ? "s" : ""} publiée
            {projects.length > 1 ? "s" : ""}. Chaque fiche dispose de sa propre page sur le site.
          </p>
        </div>
        <Button type="button" onClick={openNew}>
          <Plus className="mr-2 h-4 w-4" strokeWidth={1.75} />
          Nouvelle réalisation
        </Button>
      </div>

      <ul className="mt-8 divide-y divide-border border border-border bg-background">
        {projects.map((project) => (
          <li key={project.id} className="flex flex-wrap items-center gap-4 p-4">
            <div className="h-16 w-24 shrink-0 overflow-hidden bg-secondary">
              {project.image ? (
                <Image src={project.image} alt="" className="h-full w-full" />
              ) : null}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-heading text-[14.5px] font-semibold text-foreground">
                {project.title}
              </p>
              <p className="mt-1 font-mono text-[9.5px] uppercase tracking-[0.14em] text-muted-foreground">
                {project.category} · {project.year} · {project.location || "—"} · {project.status}
                {project.featured ? " · À la une" : ""}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => openEdit(project)}>
                <Pencil className="mr-1.5 h-3.5 w-3.5" strokeWidth={1.75} />
                Modifier
              </Button>
              {confirming === project.id ? (
                <div className="flex items-center gap-1.5">
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    disabled={deleting}
                    onClick={() => handleDelete(project)}
                  >
                    {deleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Confirmer"}
                  </Button>
                  <Button type="button" variant="ghost" size="sm" onClick={() => setConfirming(null)}>
                    Annuler
                  </Button>
                </div>
              ) : (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setConfirming(project.id)}
                  aria-label={`Supprimer ${project.title}`}
                >
                  <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
                </Button>
              )}
            </div>
          </li>
        ))}
      </ul>

      {projects.length === 0 && (
        <p className="mt-8 border border-border bg-background p-8 text-center text-[13.5px] text-muted-foreground">
          Aucune réalisation pour le moment. Ajoutez votre premier projet pour alimenter le site.
        </p>
      )}

      <ProjectEditor
        project={editing}
        open={editorOpen}
        onOpenChange={setEditorOpen}
        onSaved={() => router.invalidate()}
      />
    </div>
  );
}
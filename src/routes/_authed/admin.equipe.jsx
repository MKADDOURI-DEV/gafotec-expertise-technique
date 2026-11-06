import { useState } from "react";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, Pencil, Plus, Trash2, Users } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import TeamMemberEditor, { TEAM_GROUPS } from "@/components/admin/TeamMemberEditor";
import { deleteTeamMember, getTeam } from "@/lib/content-fns";

export const Route = createFileRoute("/_authed/admin/equipe")({
  loader: () => getTeam(),
  component: TeamAdmin,
});

const groupLabel = (value) =>
  TEAM_GROUPS.find((group) => group.value === value)?.label ?? value;

function TeamAdmin() {
  const members = Route.useLoaderData();
  const router = useRouter();
  const remove = useServerFn(deleteTeamMember);

  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [confirming, setConfirming] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const openNew = () => {
    setEditing(null);
    setEditorOpen(true);
  };

  const openEdit = (member) => {
    setEditing(member);
    setEditorOpen(true);
  };

  const handleDelete = async (member) => {
    setDeleting(true);
    try {
      await remove({ data: { id: member.id } });
      await router.invalidate();
      setConfirming(null);
      toast.success("Collaborateur retiré");
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
          <p className="eyebrow">Équipe</p>
          <h1 className="mt-4 font-heading text-[clamp(1.5rem,2.8vw,2rem)] font-bold leading-[1.1] tracking-[-0.025em] text-foreground">
            Les collaborateurs
          </h1>
          <p className="mt-3 max-w-xl text-[14px] leading-relaxed text-muted-foreground">
            {members.length} collaborateur{members.length > 1 ? "s" : ""} affiché
            {members.length > 1 ? "s" : ""} sur la page « Notre équipe ».
          </p>
        </div>
        <Button type="button" onClick={openNew}>
          <Plus className="mr-2 h-4 w-4" strokeWidth={1.75} />
          Ajouter un collaborateur
        </Button>
      </div>

      <ul className="mt-8 divide-y divide-border border border-border bg-background">
        {members.map((member) => (
          <li key={member.id} className="flex flex-wrap items-center gap-4 p-4">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-primary/25 font-mono text-[10px] text-primary">
              {(member.name ?? "")
                .split(" ")
                .filter(Boolean)
                .slice(0, 2)
                .map((part) => part[0])
                .join("")}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate font-heading text-[13px] font-semibold uppercase tracking-[0.04em] text-foreground">
                {member.name}
              </p>
              <p className="mt-1 text-[12px] leading-snug text-muted-foreground">{member.role}</p>
              <p className="mt-1 font-mono text-[9.5px] uppercase tracking-[0.14em] text-primary">
                {groupLabel(member.group)}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => openEdit(member)}>
                <Pencil className="mr-1.5 h-3.5 w-3.5" strokeWidth={1.75} />
                Modifier
              </Button>
              {confirming === member.id ? (
                <div className="flex items-center gap-1.5">
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    disabled={deleting}
                    onClick={() => handleDelete(member)}
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
                  onClick={() => setConfirming(member.id)}
                  aria-label={`Retirer ${member.name}`}
                >
                  <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
                </Button>
              )}
            </div>
          </li>
        ))}
      </ul>

      {members.length === 0 && (
        <div className="mt-8 border border-border bg-background p-8 text-center">
          <Users className="mx-auto h-5 w-5 text-primary" strokeWidth={1.6} />
          <p className="mt-3 text-[13.5px] text-muted-foreground">
            Aucun collaborateur pour le moment. Ajoutez la première personne pour alimenter la page
            « Notre équipe ».
          </p>
        </div>
      )}

      <TeamMemberEditor
        member={editing}
        open={editorOpen}
        onOpenChange={setEditorOpen}
        onSaved={() => router.invalidate()}
      />
    </div>
  );
}
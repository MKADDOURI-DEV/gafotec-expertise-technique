import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { saveTeamMember } from "@/lib/content-fns";

export const TEAM_GROUPS = [
  { value: "Direction", label: "Direction" },
  { value: "Études", label: "Bureau d’études & chiffrage" },
  { value: "Chantier", label: "Conduite de chantier" },
  { value: "Support", label: "Fonctions support" },
];

const emptyMember = { name: "", role: "", group: "Études", display_order: 100 };

export default function TeamMemberEditor({ member, open, onOpenChange, onSaved }) {
  const save = useServerFn(saveTeamMember);
  const [form, setForm] = useState(emptyMember);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setForm(member ? { ...emptyMember, ...member } : emptyMember);
  }, [open, member]);

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const handleSubmit = async () => {
    setSaving(true);
    try {
      await save({
        data: {
          id: member?.id,
          name: form.name,
          role: form.role,
          group: form.group,
          display_order: form.display_order,
        },
      });
      onSaved();
      onOpenChange(false);
      toast.success("Collaborateur enregistré");
    } catch (error) {
      toast.error(error?.message ?? "Enregistrement impossible");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{member ? "Modifier le collaborateur" : "Nouveau collaborateur"}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-5">
          <div>
            <Label className="font-mono text-[9.5px] uppercase tracking-[0.16em] text-muted-foreground">
              Nom et prénom
            </Label>
            <Input
              className="mt-2"
              value={form.name}
              onChange={(event) => update("name", event.target.value)}
            />
          </div>

          <div>
            <Label className="font-mono text-[9.5px] uppercase tracking-[0.16em] text-muted-foreground">
              Fonction
            </Label>
            <Input
              className="mt-2"
              value={form.role}
              onChange={(event) => update("role", event.target.value)}
              placeholder="Ex. Chargé d’études techniques et chiffrage"
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <Label className="font-mono text-[9.5px] uppercase tracking-[0.16em] text-muted-foreground">
                Pôle
              </Label>
              <Select value={form.group} onValueChange={(value) => update("group", value)}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TEAM_GROUPS.map((group) => (
                    <SelectItem key={group.value} value={group.value}>
                      {group.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="font-mono text-[9.5px] uppercase tracking-[0.16em] text-muted-foreground">
                Ordre d’affichage
              </Label>
              <Input
                className="mt-2"
                type="number"
                value={form.display_order ?? 100}
                onChange={(event) => update("display_order", event.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} disabled={saving}>
            Annuler
          </Button>
          <Button type="button" onClick={handleSubmit} disabled={saving}>
            {saving && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
            Enregistrer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
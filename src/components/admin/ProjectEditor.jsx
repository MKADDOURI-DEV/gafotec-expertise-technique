import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import MediaField from "@/components/admin/MediaField";
import { projectCategories } from "@/data/site";
import { saveProject } from "@/lib/content-fns";

const CATEGORIES = projectCategories.filter((item) => item !== "Tous");

const slugify = (value) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const emptyProject = {
  title: "",
  slug: "",
  year: new Date().getFullYear(),
  category: "Industrie",
  location: "",
  status: "Livré",
  image: "",
  summary: "",
  description: "",
  scope: [],
  featured: false,
  display_order: 100,
};

export default function ProjectEditor({ project, open, onOpenChange, onSaved }) {
  const save = useServerFn(saveProject);
  const [form, setForm] = useState(emptyProject);
  const [scopeText, setScopeText] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (project) {
      setForm({ ...emptyProject, ...project });
      setScopeText((project.scope ?? []).join("\n"));
      setSlugTouched(true);
    } else {
      setForm(emptyProject);
      setScopeText("");
      setSlugTouched(false);
    }
  }, [open, project]);

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const handleTitle = (value) => {
    setForm((current) => ({
      ...current,
      title: value,
      slug: slugTouched ? current.slug : slugify(value),
    }));
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      await save({
        data: {
          id: project?.id,
          title: form.title,
          slug: form.slug,
          year: form.year,
          category: form.category,
          location: form.location,
          status: form.status,
          image: form.image,
          summary: form.summary,
          description: form.description,
          scope: scopeText
            .split("\n")
            .map((line) => line.trim())
            .filter(Boolean),
          featured: Boolean(form.featured),
          display_order: form.display_order,
        },
      });
      onSaved();
      onOpenChange(false);
      toast.success("Réalisation enregistrée");
    } catch (error) {
      toast.error(error?.message ?? "Enregistrement impossible");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{project ? "Modifier la réalisation" : "Nouvelle réalisation"}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label className="font-mono text-[9.5px] uppercase tracking-[0.16em] text-muted-foreground">
              Nom du projet
            </Label>
            <Input
              className="mt-2"
              value={form.title}
              onChange={(event) => handleTitle(event.target.value)}
            />
          </div>

          <div>
            <Label className="font-mono text-[9.5px] uppercase tracking-[0.16em] text-muted-foreground">
              Identifiant d’URL
            </Label>
            <Input
              className="mt-2 font-mono text-[12px]"
              value={form.slug}
              onChange={(event) => {
                setSlugTouched(true);
                update("slug", slugify(event.target.value));
              }}
            />
          </div>

          <div>
            <Label className="font-mono text-[9.5px] uppercase tracking-[0.16em] text-muted-foreground">
              Année
            </Label>
            <Input
              className="mt-2"
              type="number"
              value={form.year}
              onChange={(event) => update("year", event.target.value)}
            />
          </div>

          <div>
            <Label className="font-mono text-[9.5px] uppercase tracking-[0.16em] text-muted-foreground">
              Catégorie
            </Label>
            <Select value={form.category} onValueChange={(value) => update("category", value)}>
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="font-mono text-[9.5px] uppercase tracking-[0.16em] text-muted-foreground">
              Localisation
            </Label>
            <Input
              className="mt-2"
              value={form.location}
              onChange={(event) => update("location", event.target.value)}
            />
          </div>

          <div>
            <Label className="font-mono text-[9.5px] uppercase tracking-[0.16em] text-muted-foreground">
              Statut
            </Label>
            <Select value={form.status} onValueChange={(value) => update("status", value)}>
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Livré">Livré</SelectItem>
                <SelectItem value="En cours">En cours</SelectItem>
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

          <div className="sm:col-span-2">
            <Label className="font-mono text-[9.5px] uppercase tracking-[0.16em] text-muted-foreground">
              Visuel
            </Label>
            <div className="mt-2">
              <MediaField value={form.image} onChange={(value) => update("image", value)} />
            </div>
          </div>

          <div className="sm:col-span-2">
            <Label className="font-mono text-[9.5px] uppercase tracking-[0.16em] text-muted-foreground">
              Résumé (cartes du site)
            </Label>
            <Textarea
              className="mt-2"
              rows={3}
              value={form.summary}
              onChange={(event) => update("summary", event.target.value)}
            />
          </div>

          <div className="sm:col-span-2">
            <Label className="font-mono text-[9.5px] uppercase tracking-[0.16em] text-muted-foreground">
              Description
            </Label>
            <Textarea
              className="mt-2"
              rows={4}
              value={form.description}
              onChange={(event) => update("description", event.target.value)}
            />
          </div>

          <div className="sm:col-span-2">
            <Label className="font-mono text-[9.5px] uppercase tracking-[0.16em] text-muted-foreground">
              Interventions techniques — une par ligne
            </Label>
            <Textarea
              className="mt-2"
              rows={5}
              value={scopeText}
              onChange={(event) => setScopeText(event.target.value)}
            />
          </div>

          <div className="flex items-center justify-between gap-4 border border-border px-4 py-3 sm:col-span-2">
            <div>
              <p className="text-[13px] font-medium text-foreground">Mettre en avant sur l’accueil</p>
              <p className="mt-1 text-[11.5px] text-muted-foreground">
                Jusqu’à trois réalisations sont affichées dans la section « Nos réalisations ».
              </p>
            </div>
            <Switch
              checked={Boolean(form.featured)}
              onCheckedChange={(value) => update("featured", value)}
            />
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
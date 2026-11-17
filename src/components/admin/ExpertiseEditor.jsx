import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { ImageUp, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createMedia, saveExpertise } from "@/lib/content-fns";
import { linesToList, listToLines } from "@/lib/expertises";
import { uploadPublicFile } from "@/lib/storage";

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const empty = { title: "", short: "", excerpt: "", description: "", interventions: "", expertise: "", image: "" };

/** Edit or create one expertise. A new image is previewed locally and only uploaded when « Enregistrer » is pressed. */
export default function ExpertiseEditor({ expertise, open, onOpenChange, onSaved }) {
  const save = useServerFn(saveExpertise);
  const createMediaRow = useServerFn(createMedia);
  const [form, setForm] = useState(empty);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [saving, setSaving] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    setForm(
      expertise
        ? { ...empty, ...expertise, interventions: listToLines(expertise.interventions), expertise: listToLines(expertise.expertise) }
        : empty,
    );
    setFile(null);
    setPreview("");
  }, [open, expertise]);

  useEffect(() => () => preview && URL.revokeObjectURL(preview), [preview]);

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const pick = (selected) => {
    if (!selected) return;
    if (!IMAGE_TYPES.includes(selected.type)) return toast.error("Image JPEG, PNG ou WebP uniquement.");
    if (selected.size > 10 * 1024 * 1024) return toast.error("Image trop lourde (10 Mo maximum).");
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
  };

  const handleSubmit = async () => {
    if (form.title.trim().length < 2) return toast.error("Le titre est obligatoire.");
    setSaving(true);
    try {
      let image = form.image;
      if (file) {
        const { file_url } = await uploadPublicFile(file);
        image = file_url;
        await createMediaRow({ data: { title: file.name, kind: "image", url: file_url, alt: form.title } }).catch(() => {});
      }
      await save({
        data: {
          id: expertise?.id,
          title: form.title,
          short: form.short,
          excerpt: form.excerpt,
          description: form.description,
          interventions: linesToList(form.interventions),
          expertise: linesToList(form.expertise),
          image,
        },
      });
      toast.success(expertise ? "Expertise modifiée" : "Expertise ajoutée");
      onSaved?.();
      onOpenChange(false);
    } catch (error) {
      toast.error(error?.message ?? "Enregistrement impossible");
    } finally {
      setSaving(false);
    }
  };

  const shownImage = preview || form.image;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{expertise ? `Modifier — ${expertise.title}` : "Nouvelle expertise"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="exp-title">Titre</Label>
            <Input id="exp-title" value={form.title} onChange={(e) => update("title", e.target.value)} />
          </div>
          <div>
            <Label htmlFor="exp-short">Libellé court (onglet de la page)</Label>
            <Input id="exp-short" maxLength={40} value={form.short} onChange={(e) => update("short", e.target.value)} />
          </div>
          <div>
            <Label htmlFor="exp-excerpt">Résumé (page d’accueil)</Label>
            <Textarea id="exp-excerpt" rows={2} value={form.excerpt} onChange={(e) => update("excerpt", e.target.value)} />
          </div>
          <div>
            <Label htmlFor="exp-desc">Description</Label>
            <Textarea id="exp-desc" rows={5} value={form.description} onChange={(e) => update("description", e.target.value)} />
          </div>
          <div>
            <Label htmlFor="exp-int">Principales interventions (une par ligne)</Label>
            <Textarea id="exp-int" rows={5} value={form.interventions} onChange={(e) => update("interventions", e.target.value)} />
          </div>
          <div>
            <Label htmlFor="exp-know">Notre expertise (une ligne par point)</Label>
            <Textarea id="exp-know" rows={4} value={form.expertise} onChange={(e) => update("expertise", e.target.value)} />
          </div>

          <div>
            <Label>Image</Label>
            <div className="mt-2 flex flex-wrap items-start gap-4">
              <div className="aspect-[4/3] w-44 overflow-hidden border border-border bg-secondary">
                {shownImage ? <img src={shownImage} alt="Aperçu de l’image" className="h-full w-full object-cover" /> : null}
              </div>
              <div className="space-y-2">
                <Button type="button" variant="outline" size="sm" onClick={() => inputRef.current?.click()}>
                  <ImageUp className="mr-1.5 h-3.5 w-3.5" strokeWidth={1.75} />
                  {form.image || preview ? "Remplacer l’image" : "Importer une image"}
                </Button>
                {file ? (
                  <p className="text-[11.5px] text-muted-foreground">
                    Nouvelle image : {file.name}. Elle sera envoyée à l’enregistrement.
                  </p>
                ) : null}
                <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => { pick(e.target.files?.[0]); e.target.value = ""; }} />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
              Annuler
            </Button>
            <Button type="button" onClick={handleSubmit} disabled={saving}>
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Enregistrer
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

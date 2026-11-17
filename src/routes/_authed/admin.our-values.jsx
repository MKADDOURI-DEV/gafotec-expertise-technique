import { useState } from "react";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import ManagedFileCard from "@/components/admin/ManagedFileCard";
import { contentDefaults } from "@/content/registry";
import { getSiteContent, saveSiteContent } from "@/lib/content-fns";

export const Route = createFileRoute("/_authed/admin/our-values")({
  loader: () => getSiteContent(),
  component: ValuesAdmin,
});

const TEXT_KEYS = ["values.title", "values.intro", "values.button_label"];

function ValuesAdmin() {
  const content = Route.useLoaderData();
  const router = useRouter();
  const save = useServerFn(saveSiteContent);
  const initial = () => Object.fromEntries(TEXT_KEYS.map((key) => [key, content[key] ?? contentDefaults[key]]));
  const [draft, setDraft] = useState(initial);
  const [saving, setSaving] = useState(false);
  const dirty = TEXT_KEYS.some((key) => draft[key] !== (content[key] ?? contentDefaults[key]));

  const handleSave = async () => {
    setSaving(true);
    try {
      await save({ data: { updates: TEXT_KEYS.map((key) => ({ key, value: draft[key] ?? "" })) } });
      await router.invalidate();
      toast.success("Textes enregistrés");
    } catch (error) {
      toast.error(error?.message ?? "Enregistrement impossible");
    } finally {
      setSaving(false);
    }
  };

  const update = (key) => (event) => setDraft((current) => ({ ...current, [key]: event.target.value }));

  return (
    <div>
      <p className="eyebrow">Page « Notre équipe »</p>
      <h1 className="mt-4 font-heading text-[clamp(1.5rem,2.8vw,2rem)] font-bold leading-[1.1] tracking-[-0.025em] text-foreground">
        Gestion de la section Our Values
      </h1>
      <p className="mt-3 max-w-2xl text-[14px] leading-relaxed text-muted-foreground">
        Cette section s’affiche juste après la présentation de l’équipe. Le lecteur vidéo et le bouton de téléchargement
        n’apparaissent sur le site qu’une fois les fichiers importés.
      </p>

      <div className="mt-8 space-y-6">
        <section className="border border-border bg-background p-5">
          <h2 className="font-heading text-[14px] font-semibold text-foreground">Textes</h2>
          <div className="mt-4 grid gap-4">
            <div>
              <Label htmlFor="values-title">Titre de la section</Label>
              <Input id="values-title" value={draft["values.title"]} onChange={update("values.title")} />
            </div>
            <div>
              <Label htmlFor="values-intro">Texte de présentation</Label>
              <Textarea id="values-intro" rows={3} value={draft["values.intro"]} onChange={update("values.intro")} />
            </div>
            <div>
              <Label htmlFor="values-button">Texte du bouton de téléchargement</Label>
              <Input id="values-button" value={draft["values.button_label"]} onChange={update("values.button_label")} />
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <Button type="button" disabled={!dirty || saving} onClick={handleSave}>
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Enregistrer
            </Button>
            <Button type="button" variant="outline" disabled={!dirty || saving} onClick={() => setDraft(initial())}>
              Annuler
            </Button>
          </div>
        </section>

        <ManagedFileCard kind="video" content={content} onChanged={() => router.invalidate()} />
        <ManagedFileCard kind="pdf" content={content} onChanged={() => router.invalidate()} />
      </div>
    </div>
  );
}

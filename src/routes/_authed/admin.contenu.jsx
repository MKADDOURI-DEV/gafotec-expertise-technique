import { useState } from "react";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import MediaField from "@/components/admin/MediaField";
import { contentFields, contentGroups } from "@/content/registry";
import { getSiteContent, saveSiteContent } from "@/lib/content-fns";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authed/admin/contenu")({
  loader: () => getSiteContent(),
  component: ContentAdmin,
});

function ContentAdmin() {
  const overrides = Route.useLoaderData();
  const router = useRouter();
  const save = useServerFn(saveSiteContent);

  const [draft, setDraft] = useState(() => {
    const values = {};
    for (const field of contentFields) values[field.key] = overrides[field.key] ?? field.default;
    return values;
  });
  const [groupId, setGroupId] = useState(contentGroups[0].id);
  const [saving, setSaving] = useState(false);

  const group = contentGroups.find((item) => item.id === groupId);
  const dirty = contentFields.filter(
    (field) => (draft[field.key] ?? "") !== (overrides[field.key] ?? field.default),
  );

  const update = (key, value) => setDraft((current) => ({ ...current, [key]: value }));

  const reset = () => {
    const values = {};
    for (const field of contentFields) values[field.key] = overrides[field.key] ?? field.default;
    setDraft(values);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await save({
        data: { updates: dirty.map((field) => ({ key: field.key, value: draft[field.key] ?? "" })) },
      });
      await router.invalidate();
      toast.success("Contenu enregistré");
    } catch (error) {
      toast.error(error?.message ?? "Enregistrement impossible");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <p className="eyebrow">Contenu</p>
      <h1 className="mt-4 font-heading text-[clamp(1.5rem,2.8vw,2rem)] font-bold leading-[1.1] tracking-[-0.025em] text-foreground">
        Contenu du site
      </h1>
      <p className="mt-3 max-w-2xl text-[14px] leading-relaxed text-muted-foreground">
        Choisissez une page, modifiez les textes puis enregistrez. Les valeurs laissées telles quelles
        restent celles du site d’origine.
      </p>

      <div className="mt-8 grid gap-6 lg:grid-cols-[210px_minmax(0,1fr)]">
        <ul className="flex gap-1 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0">
          {contentGroups.map((item) => (
            <li key={item.id} className="shrink-0 lg:shrink">
              <button
                type="button"
                onClick={() => setGroupId(item.id)}
                className={cn(
                  "whitespace-nowrap px-3 py-2.5 text-left text-[12.5px] transition-colors lg:w-full",
                  item.id === groupId
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                )}
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>

        <div className="border border-border bg-background p-5 lg:p-7">
          {group.hint && (
            <p className="mb-6 border-l-2 border-border pl-3 text-[12px] leading-relaxed text-muted-foreground">
              {group.hint}
            </p>
          )}

          <div className="grid gap-5 sm:grid-cols-2">
            {group.fields.map((field) => (
              <div key={field.key} className={field.wide ? "sm:col-span-2" : ""}>
                <Label className="font-mono text-[9.5px] uppercase tracking-[0.16em] text-muted-foreground">
                  {field.label}
                </Label>
                <div className="mt-2">
                  {field.type === "image" ? (
                    <MediaField
                      value={draft[field.key]}
                      onChange={(value) => update(field.key, value)}
                    />
                  ) : field.type === "textarea" ? (
                    <Textarea
                      value={draft[field.key] ?? ""}
                      onChange={(event) => update(field.key, event.target.value)}
                      rows={field.wide ? 4 : 3}
                      className="text-[13.5px]"
                    />
                  ) : (
                    <Input
                      value={draft[field.key] ?? ""}
                      onChange={(event) => update(field.key, event.target.value)}
                      className="text-[13.5px]"
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {dirty.length > 0 && (
        <div className="sticky bottom-4 z-20 mt-6 flex flex-wrap items-center justify-between gap-3 border border-primary/30 bg-background px-4 py-3">
          <p className="font-mono text-[9.5px] uppercase tracking-[0.16em] text-muted-foreground">
            {dirty.length} modification{dirty.length > 1 ? "s" : ""} non enregistrée
            {dirty.length > 1 ? "s" : ""}
          </p>
          <div className="flex gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={reset} disabled={saving}>
              Annuler
            </Button>
            <Button type="button" size="sm" onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
              Enregistrer
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { ImagePlus, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { CLIENT_LIMITS, SECTOR_SUGGESTIONS, initialsOf, isHttpUrl, normalizeWebsite } from "@/lib/clients";
import { saveClient } from "@/lib/content-fns";
import { MAX_LOGO_BYTES, formatBytes, validateLogoFile } from "@/lib/media-validation";
import { removeStoredFile, uploadManagedFile, verifyPublicFile } from "@/lib/storage";

const emptyClient = { name: "", sector: "", description: "", website: "", logo_url: "", logo_path: "", display_order: "", published: false };

const labelClass = "font-mono text-[9.5px] uppercase tracking-[0.16em] text-muted-foreground";

/**
 * Add / edit one client. The logo is previewed (as it will appear on the site) BEFORE anything is uploaded or published.
 * Order of operations: upload new logo → verify → save the row → only then delete the previous logo file.
 * If the save fails, the logo that was just uploaded is removed again, so no orphan file stays in the storage.
 */
export default function ClientEditor({ client, open, onOpenChange, onSaved }) {
  const save = useServerFn(saveClient);
  const inputRef = useRef(null);
  const [form, setForm] = useState(emptyClient);
  const [pending, setPending] = useState(null); // { file, previewUrl }
  const [removeLogo, setRemoveLogo] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setForm(client ? { ...emptyClient, ...client, display_order: String(client.display_order ?? "") } : emptyClient);
    setPending(null);
    setRemoveLogo(false);
    setError("");
  }, [open, client]);

  useEffect(() => () => pending?.previewUrl && URL.revokeObjectURL(pending.previewUrl), [pending]);

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const chooseLogo = (file) => {
    if (!file) return;
    const problem = validateLogoFile(file);
    if (problem) {
      setError(problem);
      return;
    }
    setError("");
    setRemoveLogo(false);
    setPending({ file, previewUrl: URL.createObjectURL(file) });
  };

  const shownLogo = pending ? pending.previewUrl : removeLogo ? "" : form.logo_url;

  const handleSubmit = async (event) => {
    event.preventDefault();
    const name = form.name.trim();
    const website = normalizeWebsite(form.website);
    if (name.length < 2) return setError("Le nom du client est obligatoire (2 caractères minimum).");
    if (website && !isHttpUrl(website)) return setError("Adresse du site invalide : utilisez par exemple https://exemple.com");
    setError("");
    setSaving(true);
    let uploaded = null;
    try {
      let logo = { url: form.logo_url, path: form.logo_path };
      if (pending) {
        uploaded = await uploadManagedFile(pending.file, { folder: "clients" });
        await verifyPublicFile(uploaded.url, pending.file.size);
        logo = uploaded;
      } else if (removeLogo) {
        logo = { url: "", path: "" };
      }
      const order = String(form.display_order).trim();
      await save({
        data: {
          id: client?.id,
          name,
          sector: form.sector.trim(),
          description: form.description.trim(),
          website,
          logo_url: logo.url,
          logo_path: logo.path,
          display_order: order === "" ? undefined : Number(order),
          published: Boolean(form.published),
        },
      });
      if (client?.logo_path && client.logo_path !== logo.path) {
        await removeStoredFile(client.logo_path).catch(() => toast.message("L’ancien logo n’a pas pu être supprimé (il reste dans le stockage)."));
      }
      await onSaved();
      onOpenChange(false);
      toast.success(client ? "Client mis à jour" : "Client ajouté");
    } catch (e) {
      if (uploaded) await removeStoredFile(uploaded.path).catch(() => {});
      setError(e?.message ?? "Enregistrement impossible");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(next) => (saving ? null : onOpenChange(next))}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{client ? "Modifier le client" : "Nouveau client"}</DialogTitle>
          <DialogDescription className="text-[12.5px]">Le client n’apparaît sur le site que lorsque « Publié » est activé.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid min-w-0 gap-5" noValidate>
          <div>
            <Label htmlFor="client-name" className={labelClass}>Nom du client *</Label>
            <Input id="client-name" className="mt-2" value={form.name} maxLength={CLIENT_LIMITS.name} autoComplete="off" onChange={(e) => update("name", e.target.value)} />
          </div>

          <div>
            <Label className={labelClass}>Logo</Label>
            <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="flex h-28 w-full items-center justify-center border border-border bg-white p-3 sm:w-48">
                {shownLogo ? (
                  <img src={shownLogo} alt={`Logo ${form.name || "du client"}`} className="max-h-full max-w-full object-contain" />
                ) : (
                  <span className="font-heading text-2xl font-bold text-muted-foreground/50">{initialsOf(form.name) || "—"}</span>
                )}
              </div>
              <div className="flex flex-col gap-2 sm:flex-1">
                <Button type="button" variant="outline" className="w-full sm:w-auto" disabled={saving} onClick={() => inputRef.current?.click()}>
                  <ImagePlus className="mr-2 h-4 w-4" strokeWidth={1.75} />
                  {shownLogo ? "Remplacer le logo" : "Ajouter un logo"}
                </Button>
                {(form.logo_url || pending) && !removeLogo ? (
                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full sm:w-auto"
                    disabled={saving}
                    onClick={() => {
                      setPending(null);
                      setRemoveLogo(Boolean(form.logo_url));
                    }}
                  >
                    <Trash2 className="mr-2 h-4 w-4" strokeWidth={1.75} />
                    {pending ? "Annuler le nouveau logo" : "Retirer le logo"}
                  </Button>
                ) : null}
                <p className="text-[11.5px] leading-snug text-muted-foreground">PNG, JPG ou WebP, {formatBytes(MAX_LOGO_BYTES)} maximum. Fond transparent conseillé.</p>
              </div>
              <input
                ref={inputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={(e) => {
                  chooseLogo(e.target.files?.[0]);
                  e.target.value = "";
                }}
              />
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <Label htmlFor="client-sector" className={labelClass}>Secteur d’activité</Label>
              <Input id="client-sector" className="mt-2" list="client-sectors" value={form.sector} maxLength={CLIENT_LIMITS.sector} onChange={(e) => update("sector", e.target.value)} />
              <datalist id="client-sectors">
                {SECTOR_SUGGESTIONS.map((sector) => (
                  <option key={sector} value={sector} />
                ))}
              </datalist>
            </div>
            <div>
              <Label htmlFor="client-order" className={labelClass}>Ordre d’affichage</Label>
              <Input id="client-order" className="mt-2" type="number" inputMode="numeric" min={0} max={9999} placeholder="Automatique (à la fin)" value={form.display_order} onChange={(e) => update("display_order", e.target.value)} />
            </div>
          </div>

          <div>
            <Label htmlFor="client-website" className={labelClass}>Site web (facultatif)</Label>
            <Input id="client-website" className="mt-2" type="url" inputMode="url" autoCapitalize="none" placeholder="https://exemple.com" value={form.website} maxLength={CLIENT_LIMITS.website} onChange={(e) => update("website", e.target.value)} />
          </div>

          <div>
            <Label htmlFor="client-description" className={labelClass}>Description courte (facultative)</Label>
            <Textarea id="client-description" className="mt-2" rows={3} value={form.description} maxLength={CLIENT_LIMITS.description} onChange={(e) => update("description", e.target.value)} />
            <p className="mt-1 text-right text-[11px] text-muted-foreground">{form.description.length} / {CLIENT_LIMITS.description}</p>
          </div>

          <div className="flex items-center justify-between gap-4 border border-border p-3">
            <Label htmlFor="client-published" className="text-[13px] leading-snug text-foreground">
              {form.published ? "Publié : visible sur le site" : "Masqué : non visible sur le site"}
            </Label>
            <Switch id="client-published" checked={Boolean(form.published)} onCheckedChange={(checked) => update("published", checked)} />
          </div>

          {error ? (
            <p role="alert" className="border border-destructive/40 bg-destructive/5 p-3 text-[12.5px] leading-relaxed text-destructive">{error}</p>
          ) : null}

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" disabled={saving} onClick={() => onOpenChange(false)}>Annuler</Button>
            <Button type="submit" disabled={saving}>
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {saving ? "Enregistrement…" : "Enregistrer"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

import { useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { ImageUp, Loader2, RotateCcw, Wand2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { DEFAULT_LOGO_URL } from "@/components/site/Logo";
import { getSiteContent, saveSiteContent } from "@/lib/content-fns";
import { canvasToPngBlob, imageToCanvas, loadImage } from "@/lib/media-client";
import { DEFAULT_TRANSPARENCY, LOGO_LIMITS, logoStyle, parseLogoSize, removeWhiteBackground } from "@/lib/logo-utils";
import { uploadManagedFile, verifyPublicFile } from "@/lib/storage";

export const Route = createFileRoute("/_authed/admin/logo")({
  loader: () => getSiteContent(),
  component: LogoAdmin,
});

const ACCEPTED = ["image/png", "image/jpeg", "image/webp"];
const MAX_LOGO_BYTES = 10 * 1024 * 1024;
const checker =
  "bg-[linear-gradient(45deg,#e5e7eb_25%,transparent_25%,transparent_75%,#e5e7eb_75%),linear-gradient(45deg,#e5e7eb_25%,#fff_25%,#fff_75%,#e5e7eb_75%)] bg-[length:16px_16px] bg-[position:0_0,8px_8px]";

function LogoAdmin() {
  const content = Route.useLoaderData();
  const router = useRouter();
  const save = useServerFn(saveSiteContent);

  const savedUrl = content["logo.url"] || "";
  const [width, setWidth] = useState(content["logo.width"] || "");
  const [height, setHeight] = useState(content["logo.height"] || "");
  const [restoreOriginal, setRestoreOriginal] = useState(false);

  // A candidate logo not saved yet: { image, name, file } (file = the untouched original bytes the user chose).
  const [candidate, setCandidate] = useState(null);
  const [removeBg, setRemoveBg] = useState(true);
  const [low, setLow] = useState(DEFAULT_TRANSPARENCY.low);
  const [processedUrl, setProcessedUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [saving, setSaving] = useState(false);
  const canvasRef = useRef(null);
  const inputRef = useRef(null);

  const currentUrl = restoreOriginal ? DEFAULT_LOGO_URL : savedUrl || DEFAULT_LOGO_URL;

  // Re-process the pixels whenever the image / tolerance / switch change. The original image is never modified.
  useEffect(() => {
    if (!candidate) return setProcessedUrl("");
    try {
      const { canvas, ctx, imageData } = imageToCanvas(candidate.image);
      if (removeBg) {
        const out = removeWhiteBackground(imageData.data, { low, high: DEFAULT_TRANSPARENCY.high });
        ctx.putImageData(new ImageData(out, canvas.width, canvas.height), 0, 0);
      }
      canvasRef.current = canvas;
      setProcessedUrl(canvas.toDataURL("image/png"));
    } catch {
      setProcessedUrl("");
      toast.error("Ce navigateur ne peut pas traiter l’image. Importez le fichier depuis votre ordinateur.");
    }
  }, [candidate, removeBg, low]);

  const style = useMemo(() => logoStyle({ width, height }), [width, height]);
  const previewStyle = { ...(style ?? { height: "48px", width: "auto" }), maxWidth: "100%" };
  const previewSrc = candidate ? processedUrl || candidate.objectUrl : currentUrl;
  const sizeChanged = (width || "") !== (content["logo.width"] || "") || (height || "") !== (content["logo.height"] || "");
  const dirty = Boolean(candidate) || sizeChanged || restoreOriginal;

  const pickFile = async (file) => {
    if (!file) return;
    if (!ACCEPTED.includes(file.type)) return toast.error("Format non autorisé : importez un logo PNG (JPEG ou WebP acceptés).");
    if (file.size > MAX_LOGO_BYTES) return toast.error("Fichier trop lourd (10 Mo maximum).");
    setBusy(true);
    try {
      const objectUrl = URL.createObjectURL(file);
      const image = await loadImage(objectUrl);
      setCandidate({ image, name: file.name, file, objectUrl });
      setRemoveBg(file.type !== "image/png"); // a PNG is assumed to be transparent already
      setRestoreOriginal(false);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setBusy(false);
    }
  };

  const processCurrent = async () => {
    setBusy(true);
    try {
      const image = await loadImage(`${currentUrl}${currentUrl.includes("?") ? "&" : "?"}cb=${Date.now()}`);
      imageToCanvas(image); // throws if the browser blocks pixel access (CORS)
      setCandidate({ image, name: "gafotec-logo.png", file: null, objectUrl: currentUrl });
      setRemoveBg(true);
      setRestoreOriginal(false);
    } catch {
      toast.error("Impossible de traiter le logo actuel depuis le navigateur : importez le fichier depuis votre ordinateur.");
    } finally {
      setBusy(false);
    }
  };

  const cancel = () => {
    setCandidate(null);
    setRestoreOriginal(false);
    setWidth(content["logo.width"] || "");
    setHeight(content["logo.height"] || "");
  };

  const resetSizes = () => {
    setWidth("");
    setHeight("");
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updates = [
        { key: "logo.width", value: parseLogoSize(width) ? String(parseLogoSize(width)) : "" },
        { key: "logo.height", value: parseLogoSize(height) ? String(parseLogoSize(height)) : "" },
      ];
      if (candidate) {
        // Keep the user's own file when nothing is changed (PNG as-is = zero quality loss); otherwise export the processed PNG.
        const asIs = candidate.file && !removeBg && candidate.file.type === "image/png";
        const blob = asIs ? candidate.file : await canvasToPngBlob(canvasRef.current);
        const upload = new File([blob], `gafotec-logo-${Date.now()}.png`, { type: "image/png" });
        const { url } = await uploadManagedFile(upload, { folder: "logo" });
        await verifyPublicFile(url, upload.size); // the previous logo file stays in storage (original copy)
        updates.push({ key: "logo.url", value: url });
      } else if (restoreOriginal) {
        updates.push({ key: "logo.url", value: "" });
      }
      await save({ data: { updates } });
      await router.invalidate();
      setCandidate(null);
      setRestoreOriginal(false);
      toast.success("Logo enregistré : il est appliqué sur toutes les pages.");
    } catch (error) {
      toast.error(error?.message ?? "Enregistrement impossible");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <p className="eyebrow">Identité</p>
      <h1 className="mt-4 font-heading text-[clamp(1.5rem,2.8vw,2rem)] font-bold leading-[1.1] tracking-[-0.025em] text-foreground">
        Gestion du logo
      </h1>
      <p className="mt-3 max-w-2xl text-[14px] leading-relaxed text-muted-foreground">
        Importez un logo, prévisualisez-le, réglez sa taille d’affichage puis enregistrez. Le réglage de taille ne
        modifie jamais le fichier : seule la façon de l’afficher change.
      </p>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="border border-border bg-background p-5">
          <h2 className="font-heading text-[14px] font-semibold text-foreground">Aperçu</h2>
          <p className="mt-1 text-[12px] text-muted-foreground">
            {candidate ? `Nouveau logo : ${candidate.name} (non enregistré)` : "Logo actuellement publié"}
          </p>
          <div className="mt-4 space-y-3">
            <div className={`flex min-h-[110px] items-center justify-center overflow-auto border border-border p-4 ${checker}`}>
              {previewSrc ? <img src={previewSrc} alt="Aperçu du logo sur fond à damier" style={previewStyle} /> : <Loader2 className="h-5 w-5 animate-spin" />}
            </div>
            <div className="flex min-h-[110px] items-center justify-center overflow-auto border border-border bg-white p-4">
              {previewSrc ? <img src={previewSrc} alt="Aperçu du logo sur fond blanc" style={previewStyle} /> : null}
            </div>
          </div>
          <p className="mt-3 text-[11.5px] leading-relaxed text-muted-foreground">
            Le damier montre la transparence. Sur fond sombre (bandeau d’accueil, menu mobile, pied de page) le logo
            reste posé sur sa plaque blanche pour que le texte bleu demeure lisible.
          </p>
        </section>

        <section className="space-y-6 border border-border bg-background p-5">
          <div>
            <h2 className="font-heading text-[14px] font-semibold text-foreground">1. Fichier du logo</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button type="button" variant="outline" size="sm" disabled={busy} onClick={() => inputRef.current?.click()}>
                <ImageUp className="mr-1.5 h-3.5 w-3.5" strokeWidth={1.75} />
                Importer un logo PNG
              </Button>
              <Button type="button" variant="outline" size="sm" disabled={busy} onClick={processCurrent}>
                <Wand2 className="mr-1.5 h-3.5 w-3.5" strokeWidth={1.75} />
                Traiter le logo actuel
              </Button>
              {(savedUrl || candidate) && (
                <Button type="button" variant="ghost" size="sm" onClick={() => { setCandidate(null); setRestoreOriginal(true); }}>
                  Restaurer le logo d’origine
                </Button>
              )}
              <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={(e) => { pickFile(e.target.files?.[0]); e.target.value = ""; }} />
            </div>
          </div>

          {candidate && (
            <div className="space-y-3 border-t border-border pt-5">
              <div className="flex items-center justify-between gap-3">
                <Label htmlFor="remove-bg" className="text-[13px]">Supprimer le fond blanc</Label>
                <Switch id="remove-bg" checked={removeBg} onCheckedChange={setRemoveBg} />
              </div>
              {removeBg && (
                <div>
                  <Label htmlFor="tolerance" className="text-[12px] text-muted-foreground">
                    Tolérance (plus la valeur est basse, plus de blanc cassé est supprimé)
                  </Label>
                  <input id="tolerance" type="range" min={150} max={245} step={1} value={low} onChange={(e) => setLow(Number(e.target.value))} className="mt-2 w-full" />
                </div>
              )}
              <p className="text-[11.5px] text-muted-foreground">Votre fichier d’origine n’est pas modifié : seul l’export PNG est traité.</p>
            </div>
          )}

          <div className="border-t border-border pt-5">
            <h2 className="font-heading text-[14px] font-semibold text-foreground">2. Taille d’affichage</h2>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="logo-height" className="text-[12px]">Hauteur (px)</Label>
                <Input id="logo-height" inputMode="numeric" placeholder="auto (48)" value={height} onChange={(e) => setHeight(e.target.value.replace(/\D/g, ""))} />
              </div>
              <div>
                <Label htmlFor="logo-width" className="text-[12px]">Largeur (px)</Label>
                <Input id="logo-width" inputMode="numeric" placeholder="auto" value={width} onChange={(e) => setWidth(e.target.value.replace(/\D/g, ""))} />
              </div>
            </div>
            <input
              type="range"
              aria-label="Agrandir ou réduire le logo"
              min={LOGO_LIMITS.min}
              max={200}
              value={parseLogoSize(height) ?? 48}
              onChange={(e) => setHeight(e.target.value)}
              className="mt-4 w-full"
            />
            <p className="mt-1 text-[11.5px] text-muted-foreground">
              Entre {LOGO_LIMITS.min} et {LOGO_LIMITS.max} px. Laissez la largeur vide pour garder les proportions.
            </p>
            <Button type="button" variant="ghost" size="sm" className="mt-2" onClick={resetSizes}>
              <RotateCcw className="mr-1.5 h-3.5 w-3.5" strokeWidth={1.75} />
              Réinitialiser les dimensions
            </Button>
          </div>

          <div className="flex flex-wrap gap-2 border-t border-border pt-5">
            <Button type="button" disabled={!dirty || saving} onClick={handleSave}>
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Enregistrer
            </Button>
            <Button type="button" variant="outline" disabled={!dirty || saving} onClick={cancel}>
              Annuler
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}

import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { ExternalLink, FileText, Loader2, Trash2, Upload, Video, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { saveSiteContent } from "@/lib/content-fns";
import { readVideoDuration, sniffMp4File } from "@/lib/media-client";
import {
  MAX_PDF_BYTES,
  MAX_VIDEO_BYTES,
  MAX_VIDEO_SECONDS,
  RECOMMENDED_VIDEO_BYTES,
  formatBytes,
  formatDuration,
  validatePdfFile,
  validateVideoCodec,
  validateVideoDuration,
  validateVideoFile,
} from "@/lib/media-validation";
import { removeStoredFile, uploadManagedFile, verifyPublicFile } from "@/lib/storage";

const FIELDS = ["url", "path", "name", "size", "duration"];

/**
 * Import / preview / replace / delete one managed file (video or PDF) stored under `<prefix>.<kind>_*` in the site content.
 * Defaults = the presentation files (`values.*`, now shown on « Nos clients »); the home page video uses prefix « home.hero ».
 * Replacement is safe: new file uploaded → verified → saved in the database → only then is the old file deleted.
 */
export default function ManagedFileCard({
  kind,
  content,
  onChanged,
  prefix = "values",
  folder,
  title,
  emptyText,
  hint,
  recommendedBytes = RECOMMENDED_VIDEO_BYTES,
}) {
  const isVideo = kind === "video";
  const key = (field) => `${prefix}.${kind}_${field}`;
  const storageFolder = folder ?? `${prefix}/${kind}`;
  const current = {
    url: content[key("url")] || "",
    path: content[key("path")] || "",
    name: content[key("name")] || "",
    size: Number(content[key("size")]) || 0,
    duration: Number(content[key("duration")]) || 0,
  };
  const save = useServerFn(saveSiteContent);
  const inputRef = useRef(null);
  const abortRef = useRef(null);
  const [pending, setPending] = useState(null); // { file, previewUrl, duration }
  const [error, setError] = useState("");
  const [checking, setChecking] = useState(false);
  const [phase, setPhase] = useState("");
  const [progress, setProgress] = useState(0);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const working = Boolean(phase);

  useEffect(() => () => pending?.previewUrl && URL.revokeObjectURL(pending.previewUrl), [pending]);

  const choose = async (file) => {
    if (!file) return;
    setError("");
    setPending(null);
    setChecking(true);
    try {
      const problem = isVideo ? validateVideoFile(file) : validatePdfFile(file);
      if (problem) throw new Error(problem);
      let duration = 0;
      if (isVideo) {
        const codecProblem = validateVideoCodec(await sniffMp4File(file));
        if (codecProblem) throw new Error(codecProblem);
        duration = await readVideoDuration(file); // checked BEFORE anything is uploaded
        const durationProblem = validateVideoDuration(duration);
        if (durationProblem) throw new Error(durationProblem);
      }
      setPending({ file, previewUrl: URL.createObjectURL(file), duration });
    } catch (e) {
      setError(e.message);
    } finally {
      setChecking(false);
    }
  };

  const clearPending = () => {
    setPending(null);
    setError("");
  };

  const handleImport = async () => {
    if (!pending) return;
    const { file, duration } = pending;
    const controller = new AbortController();
    abortRef.current = controller;
    const previous = { path: current.path };
    try {
      setProgress(0);
      setPhase("Envoi du fichier…");
      const { path, url } = await uploadManagedFile(file, { folder: storageFolder, onProgress: setProgress, signal: controller.signal });
      setPhase("Vérification du fichier envoyé…");
      await verifyPublicFile(url, file.size);
      setPhase("Enregistrement…");
      await save({
        data: {
          updates: [
            { key: key("url"), value: url },
            { key: key("path"), value: path },
            { key: key("name"), value: file.name },
            { key: key("size"), value: String(file.size) },
            { key: key("duration"), value: isVideo ? String(Math.round(duration)) : "" },
          ],
        },
      });
      if (previous.path) {
        setPhase("Suppression de l’ancien fichier…");
        await removeStoredFile(previous.path).catch(() => toast.message("L’ancien fichier n’a pas pu être supprimé (il reste dans le stockage)."));
      }
      setPending(null);
      await onChanged();
      toast.success(isVideo ? "Vidéo importée avec succès" : "Document importé avec succès");
    } catch (e) {
      setError(controller.signal.aborted ? "Importation annulée." : e.message || "Importation impossible");
    } finally {
      setPhase("");
      abortRef.current = null;
    }
  };

  const handleDelete = async () => {
    try {
      setPhase("Suppression…");
      await save({ data: { updates: FIELDS.map((field) => ({ key: key(field), value: "" })) } });
      await removeStoredFile(current.path).catch(() => {});
      setConfirmingDelete(false);
      await onChanged();
      toast.success(isVideo ? "Vidéo supprimée" : "Document supprimé");
    } catch (e) {
      toast.error(e.message || "Suppression impossible");
    } finally {
      setPhase("");
    }
  };

  const Icon = isVideo ? Video : FileText;
  const limitText = isVideo
    ? `MP4 (H.264 + AAC), ${MAX_VIDEO_SECONDS / 60} min maximum, ${formatBytes(MAX_VIDEO_BYTES)} maximum (limite Supabase) — ${formatBytes(recommendedBytes)} recommandés.`
    : `PDF, ${formatBytes(MAX_PDF_BYTES)} maximum.`;

  return (
    <section className="min-w-0 border border-border bg-background p-4 sm:p-5">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 shrink-0 text-primary" strokeWidth={1.75} />
        <h2 className="font-heading text-[14px] font-semibold text-foreground">{title ?? (isVideo ? "Vidéo de présentation" : "Document PDF de présentation")}</h2>
      </div>
      <p className="mt-1 text-[12px] text-muted-foreground">{limitText}</p>
      {hint ? <p className="mt-1 text-[12px] text-muted-foreground">{hint}</p> : null}

      {current.url ? (
        <div className="mt-4 space-y-3">
          <div className="text-[12.5px] text-foreground">
            <p className="break-all font-medium">{current.name || "Fichier actuel"}</p>
            <p className="text-muted-foreground">
              {formatBytes(current.size)}
              {isVideo && current.duration ? ` · ${formatDuration(current.duration)}` : ""}
            </p>
          </div>
          {isVideo ? (
            <video className="aspect-video w-full bg-black" controls preload="metadata" src={current.url} />
          ) : (
            <iframe title="Aperçu du document" src={`${current.url}#view=FitH`} className="hidden h-80 w-full border border-border sm:block" />
          )}
          <a href={current.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-[12px] text-primary underline-offset-2 hover:underline">
            <ExternalLink className="h-3.5 w-3.5" /> Ouvrir l’aperçu dans un nouvel onglet
          </a>
        </div>
      ) : (
        <p className="mt-4 border border-dashed border-border p-4 text-[12.5px] text-muted-foreground">
          {emptyText ?? (isVideo ? "Aucune vidéo importée : le lecteur n’est pas affiché sur le site." : "Aucun document importé : le bouton de téléchargement n’est pas affiché sur le site.")}
        </p>
      )}

      {pending ? (
        <div className="mt-4 space-y-3 border border-primary/30 bg-primary/5 p-4">
          <p className="text-[12.5px] font-medium text-foreground">Nouveau fichier prêt à être importé</p>
          <p className="break-all text-[12px] text-muted-foreground">
            {pending.file.name} · {formatBytes(pending.file.size)}
            {isVideo ? ` · ${formatDuration(pending.duration)}` : ""}
          </p>
          {isVideo ? (
            <video className="aspect-video w-full bg-black" controls preload="metadata" src={pending.previewUrl} />
          ) : (
            <iframe title="Aperçu du nouveau document" src={`${pending.previewUrl}#view=FitH`} className="hidden h-80 w-full border border-border sm:block" />
          )}
          {working ? (
            <div className="space-y-2" role="status" aria-live="polite">
              <p className="text-[12px] text-muted-foreground">{phase} {phase.startsWith("Envoi") ? `${progress} %` : ""}</p>
              <Progress value={phase.startsWith("Envoi") ? progress : 100} />
              {phase.startsWith("Envoi") ? (
                <Button type="button" variant="ghost" size="sm" onClick={() => abortRef.current?.abort()}>
                  <X className="mr-1.5 h-3.5 w-3.5" /> Annuler l’envoi
                </Button>
              ) : null}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              <Button type="button" size="sm" onClick={handleImport}>
                <Upload className="mr-1.5 h-3.5 w-3.5" strokeWidth={1.75} />
                {current.url ? "Importer et remplacer" : "Importer"}
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={clearPending}>
                Annuler
              </Button>
            </div>
          )}
        </div>
      ) : null}

      {error ? (
        <p role="alert" className="mt-4 border border-destructive/40 bg-destructive/5 p-3 text-[12.5px] leading-relaxed text-destructive">
          {error}
        </p>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-2 [&>button]:max-sm:flex-1">
        <Button type="button" variant="outline" size="sm" disabled={checking || working} onClick={() => inputRef.current?.click()}>
          {checking ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Upload className="mr-1.5 h-3.5 w-3.5" strokeWidth={1.75} />}
          {checking ? "Vérification…" : current.url ? "Remplacer le fichier" : isVideo ? "Importer une vidéo" : "Importer un PDF"}
        </Button>
        {current.url && !confirmingDelete ? (
          <Button type="button" variant="ghost" size="sm" disabled={working} onClick={() => setConfirmingDelete(true)}>
            <Trash2 className="mr-1.5 h-3.5 w-3.5" strokeWidth={1.75} /> Supprimer
          </Button>
        ) : null}
        {confirmingDelete ? (
          <div className="flex flex-wrap items-center gap-1.5">
            <Button type="button" variant="destructive" size="sm" disabled={working} onClick={handleDelete}>
              {working ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Confirmer la suppression"}
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => setConfirmingDelete(false)}>
              Annuler
            </Button>
          </div>
        ) : null}
        <input
          ref={inputRef}
          type="file"
          accept={isVideo ? "video/mp4,.mp4" : "application/pdf,.pdf"}
          className="hidden"
          onChange={(e) => {
            choose(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
      </div>
    </section>
  );
}

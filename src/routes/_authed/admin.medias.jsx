import { useState } from "react";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Copy, Loader2, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { Image } from "@/components/ui/image";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import { createMedia, deleteMedia, listMedia } from "@/lib/content-fns";

export const Route = createFileRoute("/_authed/admin/medias")({
  loader: () => listMedia(),
  component: MediaAdmin,
});

function MediaAdmin() {
  const items = Route.useLoaderData();
  const router = useRouter();
  const create = useServerFn(createMedia);
  const remove = useServerFn(deleteMedia);

  const [uploading, setUploading] = useState(false);
  const [busyId, setBusyId] = useState(null);

  const handleFiles = async (files) => {
    const list = Array.from(files ?? []);
    if (list.length === 0) return;
    setUploading(true);
    try {
      for (const file of list) {
        const { file_url } = await base44.integrations.Core.UploadPublicFile({ file });
        await create({
          data: {
            title: file.name,
            kind: file.type.startsWith("video") ? "video" : "image",
            url: file_url,
            alt: file.name,
          },
        });
      }
      await router.invalidate();
      toast.success(`${list.length} fichier${list.length > 1 ? "s" : ""} ajouté${list.length > 1 ? "s" : ""}`);
    } catch (error) {
      toast.error(error?.message ?? "Envoi impossible");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (item) => {
    setBusyId(item.id);
    try {
      await remove({ data: { id: item.id } });
      await router.invalidate();
      toast.success("Média retiré de la médiathèque");
    } catch (error) {
      toast.error(error?.message ?? "Suppression impossible");
    } finally {
      setBusyId(null);
    }
  };

  const handleCopy = async (url) => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Lien copié");
    } catch (error) {
      toast.error("Copie impossible");
    }
  };

  return (
    <div>
      <p className="eyebrow">Médiathèque</p>
      <h1 className="mt-4 font-heading text-[clamp(1.5rem,2.8vw,2rem)] font-bold leading-[1.1] tracking-[-0.025em] text-foreground">
        Images & vidéos du site
      </h1>
      <p className="mt-3 max-w-2xl text-[14px] leading-relaxed text-muted-foreground">
        Téléversez vos photos de chantier et vos vidéos, puis utilisez-les dans le contenu des pages
        et les fiches réalisations.
      </p>

      <label className="mt-8 flex cursor-pointer flex-col items-center justify-center border border-dashed border-border bg-background px-6 py-10 text-center transition-colors hover:border-primary/50">
        {uploading ? (
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
        ) : (
          <Upload className="h-5 w-5 text-primary" strokeWidth={1.6} />
        )}
        <span className="mt-3 font-heading text-[14px] font-semibold text-foreground">
          {uploading ? "Envoi en cours…" : "Téléverser des images ou des vidéos"}
        </span>
        <span className="mt-1 text-[12px] text-muted-foreground">
          Formats courants (JPG, PNG, WebP, MP4). Sélection multiple possible.
        </span>
        <input
          type="file"
          accept="image/*,video/*"
          multiple
          className="hidden"
          disabled={uploading}
          onChange={(event) => handleFiles(event.target.files)}
        />
      </label>

      {items.length === 0 ? (
        <p className="mt-8 border border-border bg-background p-8 text-center text-[13.5px] text-muted-foreground">
          La médiathèque est vide. Ajoutez vos premiers visuels.
        </p>
      ) : (
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <li key={item.id} className="flex flex-col border border-border bg-background">
              <div className="aspect-[4/3] overflow-hidden bg-secondary">
                {item.kind === "video" ? (
                  <video src={item.url} className="h-full w-full object-cover" controls muted />
                ) : (
                  <Image src={item.url} alt={item.alt || ""} className="h-full w-full" />
                )}
              </div>
              <div className="flex flex-1 flex-col justify-between p-3">
                <div>
                  <p className="truncate text-[12.5px] font-medium text-foreground">
                    {item.title || "Sans titre"}
                  </p>
                  <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.14em] text-muted-foreground">
                    {item.kind === "video" ? "Vidéo" : "Image"}
                  </p>
                </div>
                <div className="mt-3 flex items-center gap-1">
                  <Button type="button" variant="ghost" size="sm" onClick={() => handleCopy(item.url)}>
                    <Copy className="mr-1.5 h-3.5 w-3.5" strokeWidth={1.75} />
                    Lien
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={busyId === item.id}
                    onClick={() => handleDelete(item)}
                  >
                    {busyId === item.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
                    )}
                  </Button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, Upload } from "lucide-react";
import { toast } from "sonner";
import { Image } from "@/components/ui/image";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { base44 } from "@/api/base44Client";
import { createMedia, listMedia } from "@/lib/content-fns";

/** Image picker for a content field: choose from the media library or upload a new file. */
export default function MediaField({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const list = useServerFn(listMedia);
  const create = useServerFn(createMedia);

  const refresh = async () => setItems(await list());

  const openPicker = async () => {
    setOpen(true);
    setLoading(true);
    try {
      await refresh();
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (files) => {
    const file = files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadPublicFile({ file });
      await create({
        data: {
          title: file.name,
          kind: file.type.startsWith("video") ? "video" : "image",
          url: file_url,
          alt: file.name,
        },
      });
      await refresh();
      onChange(file_url);
      setOpen(false);
      toast.success("Fichier envoyé et sélectionné");
    } catch (error) {
      toast.error("Envoi impossible pour ce fichier");
    } finally {
      setUploading(false);
    }
  };

  const images = items.filter((item) => item.kind !== "video");

  return (
    <div className="flex flex-wrap items-start gap-3">
      <div className="h-16 w-24 shrink-0 overflow-hidden border border-border bg-secondary">
        {value ? <Image src={value} alt="" className="h-full w-full" /> : null}
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" onClick={openPicker}>
            Choisir une image
          </Button>
          <label className="inline-flex cursor-pointer items-center gap-1.5 border border-dashed border-border px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground hover:border-primary/50 hover:text-primary">
            {uploading ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Upload className="h-3 w-3" strokeWidth={1.75} />
            )}
            Téléverser
            <input
              type="file"
              accept="image/*,video/*"
              className="hidden"
              onChange={(event) => handleUpload(event.target.files)}
            />
          </label>
        </div>
        <p className="text-[11px] text-muted-foreground">Envoi dans la médiathèque du site.</p>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Médiathèque</DialogTitle>
          </DialogHeader>
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            </div>
          ) : images.length === 0 ? (
            <p className="py-10 text-center text-[13px] text-muted-foreground">
              Aucune image pour le moment. Utilisez « Téléverser » pour en ajouter une.
            </p>
          ) : (
            <div className="grid max-h-[60vh] grid-cols-2 gap-3 overflow-y-auto sm:grid-cols-3">
              {images.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    onChange(item.url);
                    setOpen(false);
                  }}
                  className="group border border-border text-left transition-colors hover:border-primary"
                >
                  <div className="aspect-[4/3] overflow-hidden bg-secondary">
                    <Image src={item.url} alt={item.alt || ""} className="h-full w-full" />
                  </div>
                  <p className="truncate px-2 py-1.5 text-[11px] text-muted-foreground">
                    {item.title || "Sans nom"}
                  </p>
                </button>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
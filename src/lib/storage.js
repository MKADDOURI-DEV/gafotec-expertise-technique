import { getSupabase } from "@/lib/supabase";

const BUCKET = "media";
const MAX_FILE_SIZE = 50 * 1024 * 1024;

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "video/mp4",
  "video/webm",
]);

const safeName = (name) =>
  name.normalize("NFKD").replace(/[^\w.-]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "").toLowerCase().slice(-80) || "file";

/** Uploads to the public `media` bucket (storage policies only let admins write). */
export async function uploadPublicFile(file) {
  if (!file) throw new Error("Aucun fichier sélectionné.");

  if (!ALLOWED_TYPES.has(file.type)) {
    throw new Error("Type de fichier non autorisé.");
  }

  if (file.size <= 0 || file.size > MAX_FILE_SIZE) {
    throw new Error("Le fichier doit peser au maximum 50 MB.");
  }

  const supabase = getSupabase();
  const now = new Date();
  const month = String(now.getUTCMonth() + 1).padStart(2, "0");
  const path = `uploads/${now.getUTCFullYear()}/${month}/${crypto.randomUUID()}-${safeName(file.name)}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, {
      contentType: file.type,
      cacheControl: "31536000",
      upsert: false,
    });

  if (error) throw new Error(error.message || "Envoi impossible");

  return {
    file_url: supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl,
  };
}

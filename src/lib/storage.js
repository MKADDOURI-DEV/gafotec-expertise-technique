import { getSupabase } from "@/lib/supabase";

const BUCKET = "media";

const safeName = (name) =>
  name.normalize("NFKD").replace(/[^\w.-]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "").toLowerCase().slice(-80) || "file";

/** Uploads to the public `media` bucket (storage policies only let admins write). Same return shape as before. */
export async function uploadPublicFile(file) {
  const supabase = getSupabase();
  const now = new Date();
  const month = String(now.getUTCMonth() + 1).padStart(2, "0");
  const path = `uploads/${now.getUTCFullYear()}/${month}/${crypto.randomUUID()}-${safeName(file.name)}`;
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { contentType: file.type || undefined, cacheControl: "31536000", upsert: false });
  if (error) throw new Error(error.message || "Envoi impossible");
  return { file_url: supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl };
}

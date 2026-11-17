import * as tus from "tus-js-client";
import { getAccessToken, getSupabase } from "@/lib/supabase";
import { TUS_THRESHOLD_BYTES } from "@/lib/media-validation";

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


// ---- Managed files (logo, « Our Values » video + PDF) ------------------------------------------------------------

/** Direct storage host (recommended by Supabase for large uploads): https://<ref>.storage.supabase.co */
export function resumableEndpoint(projectUrl = import.meta.env.VITE_SUPABASE_URL) {
  const ref = new URL(projectUrl).hostname.split(".")[0];
  return `https://${ref}.storage.supabase.co/storage/v1/upload/resumable`;
}

function resumableUpload(file, path, { onProgress, signal } = {}) {
  return new Promise((resolve, reject) => {
    getAccessToken().then((token) => {
      if (!token) return reject(new Error("Session expirée : reconnectez-vous puis réessayez."));
      const upload = new tus.Upload(file, {
        endpoint: resumableEndpoint(),
        retryDelays: [0, 3000, 5000, 10000, 20000],
        headers: { authorization: `Bearer ${token}`, apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY, "x-upsert": "false" },
        uploadDataDuringCreation: true,
        removeFingerprintOnSuccess: true,
        chunkSize: TUS_THRESHOLD_BYTES, // Supabase requires 6 MB chunks
        metadata: { bucketName: BUCKET, objectName: path, contentType: file.type, cacheControl: "31536000" },
        onError: (error) => reject(new Error(error?.message?.includes("exceeded") ? "Fichier trop lourd pour Supabase." : "Envoi interrompu : vérifiez la connexion puis réessayez.")),
        onProgress: (sent, total) => onProgress?.(Math.round((sent / total) * 100)),
        onSuccess: () => resolve(),
      });
      signal?.addEventListener("abort", () => upload.abort(true), { once: true });
      upload.start();
    }, reject);
  });
}

/**
 * Uploads a file under `folder/` in the public `media` bucket. Files over 6 MB use the resumable (TUS) protocol,
 * straight from the browser to Supabase Storage (never through a server function). Returns { path, url }.
 */
export async function uploadManagedFile(file, { folder, onProgress, signal } = {}) {
  if (!file) throw new Error("Aucun fichier sélectionné.");
  const path = `${folder}/${crypto.randomUUID()}-${safeName(file.name)}`;
  const supabase = getSupabase();
  if (file.size > TUS_THRESHOLD_BYTES) {
    await resumableUpload(file, path, { onProgress, signal });
  } else {
    onProgress?.(0);
    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(path, file, { contentType: file.type, cacheControl: "31536000", upsert: false });
    if (error) throw new Error(friendlyStorageError(error));
    onProgress?.(100);
  }
  return { path, url: supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl };
}

export function friendlyStorageError(error) {
  const message = String(error?.message ?? error ?? "");
  if (/mime/i.test(message)) return "Type de fichier refusé par le stockage (le SQL d’autorisation PDF n’a peut-être pas encore été appliqué).";
  if (/exceed|too large|size/i.test(message)) return "Fichier trop lourd pour les limites actuelles de Supabase (50 Mo).";
  if (/row-level|policy|not authorized|unauthorized/i.test(message)) return "Accès refusé : seuls les administrateurs peuvent importer des fichiers.";
  return message || "Envoi impossible";
}

/** Confirms the freshly uploaded file is reachable and complete before the old one is touched. */
export async function verifyPublicFile(url, expectedSize) {
  const response = await fetch(url, { method: "HEAD", cache: "no-store" });
  if (!response.ok) throw new Error("Le nouveau fichier n’est pas accessible après l’envoi.");
  const length = Number(response.headers.get("content-length"));
  if (expectedSize && Number.isFinite(length) && length > 0 && length !== expectedSize) {
    throw new Error("Le fichier envoyé est incomplet (taille différente). Réessayez.");
  }
}

export async function removeStoredFile(path) {
  if (!path) return;
  const { error } = await getSupabase().storage.from(BUCKET).remove([path]);
  if (error) throw new Error(friendlyStorageError(error));
}

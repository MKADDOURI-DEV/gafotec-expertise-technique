// Pure validation for the files uploaded from « Our Values » (video + PDF). Limits mirror the real Supabase setup:
// Free plan = 50 MiB per file, and the `media` bucket's own file_size_limit is 52 428 800 bytes.

export const BUCKET_FILE_LIMIT_BYTES = 50 * 1024 * 1024;
export const MAX_VIDEO_BYTES = BUCKET_FILE_LIMIT_BYTES;
export const MAX_PDF_BYTES = BUCKET_FILE_LIMIT_BYTES;
export const MAX_VIDEO_SECONDS = 120;
export const RECOMMENDED_VIDEO_BYTES = 30 * 1024 * 1024;
/** Files above this size go through the resumable (TUS) upload; below, a standard upload is fine. */
export const TUS_THRESHOLD_BYTES = 6 * 1024 * 1024;

export function formatBytes(bytes) {
  const n = Number(bytes);
  if (!Number.isFinite(n) || n < 0) return "—";
  if (n < 1024) return `${n} o`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} Ko`;
  return `${(n / (1024 * 1024)).toFixed(1)} Mo`;
}

export function formatDuration(seconds) {
  const s = Math.round(Number(seconds));
  if (!Number.isFinite(s) || s < 0) return "—";
  return `${Math.floor(s / 60)} min ${String(s % 60).padStart(2, "0")} s`;
}

const hasExt = (name, ext) => String(name ?? "").toLowerCase().endsWith(ext);

export function validateVideoFile(file) {
  if (!file) return "Aucun fichier sélectionné.";
  if (!hasExt(file.name, ".mp4") || file.type !== "video/mp4") {
    return "Format non autorisé : la vidéo doit être un fichier MP4 (H.264 + AAC).";
  }
  if (!(file.size > 0)) return "Le fichier est vide.";
  if (file.size > MAX_VIDEO_BYTES) {
    return `Fichier trop lourd (${formatBytes(file.size)}). Le maximum autorisé par Supabase est ${formatBytes(MAX_VIDEO_BYTES)} : compressez la vidéo (20 à 30 Mo recommandés).`;
  }
  return null;
}

export function validateVideoDuration(seconds) {
  const s = Number(seconds);
  if (!Number.isFinite(s) || s <= 0) return "Vidéo illisible : impossible de lire sa durée. Le fichier semble invalide.";
  if (s > MAX_VIDEO_SECONDS) {
    return `Vidéo trop longue (${formatDuration(s)}). La durée maximale est de 2 minutes (120 secondes).`;
  }
  return null;
}

export function validatePdfFile(file) {
  if (!file) return "Aucun fichier sélectionné.";
  if (!hasExt(file.name, ".pdf") || file.type !== "application/pdf") return "Format non autorisé : le document doit être un fichier PDF.";
  if (!(file.size > 0)) return "Le fichier est vide.";
  if (file.size > MAX_PDF_BYTES) {
    return `Fichier trop lourd (${formatBytes(file.size)}). Le maximum autorisé est ${formatBytes(MAX_PDF_BYTES)}.`;
  }
  return null;
}

const has = (bytes, text) => {
  const needle = [...text].map((c) => c.charCodeAt(0));
  outer: for (let i = 0; i <= bytes.length - needle.length; i += 1) {
    for (let j = 0; j < needle.length; j += 1) if (bytes[i + j] !== needle[j]) continue outer;
    return true;
  }
  return false;
};

/**
 * Looks at raw bytes (head + tail of the file, where the MP4 boxes live) to tell H.264 from other codecs.
 * Returns { isMp4, h264, other } where `other` names a codec that is NOT H.264 (HEVC, AV1, VP9).
 */
export function sniffMp4(bytes) {
  const isMp4 = bytes.length >= 12 && has(bytes.subarray(0, 12), "ftyp");
  const h264 = has(bytes, "avc1") || has(bytes, "avc3");
  let other = null;
  if (has(bytes, "hvc1") || has(bytes, "hev1")) other = "H.265 (HEVC)";
  else if (has(bytes, "av01")) other = "AV1";
  else if (has(bytes, "vp09")) other = "VP9";
  return { isMp4, h264, other };
}

export function validateVideoCodec({ isMp4, h264, other }) {
  if (!isMp4) return "Le fichier n’est pas un vrai MP4 (en-tête invalide).";
  if (!h264 && other) return `Codec vidéo ${other} détecté : exportez la vidéo en H.264 (MP4) pour qu’elle se lise sur tous les navigateurs et téléphones.`;
  return null;
}

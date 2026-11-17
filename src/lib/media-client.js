// Browser-only helpers (they need File / Blob / <video> / <canvas>).
import { sniffMp4 } from "@/lib/media-validation";

const SNIFF_BYTES = 2 * 1024 * 1024;

/** Reads the video's duration from its metadata, without uploading or loading the whole file. */
export function readVideoDuration(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement("video");
    const done = (fn, value) => {
      URL.revokeObjectURL(url);
      video.removeAttribute("src");
      fn(value);
    };
    video.preload = "metadata";
    video.onloadedmetadata = () => done(resolve, video.duration);
    video.onerror = () => done(reject, new Error("Vidéo illisible : le fichier semble invalide ou son codec n’est pas pris en charge."));
    video.src = url;
  });
}

/** Looks at the first and last 2 MB only (MP4 boxes live there), so big files are never loaded into memory. */
export async function sniffMp4File(file) {
  const head = new Uint8Array(await file.slice(0, SNIFF_BYTES).arrayBuffer());
  if (file.size <= SNIFF_BYTES * 2) return sniffMp4(head.length === file.size ? head : new Uint8Array(await file.arrayBuffer()));
  const tail = new Uint8Array(await file.slice(file.size - SNIFF_BYTES).arrayBuffer());
  const both = sniffMp4(head);
  const end = sniffMp4(tail);
  return { isMp4: both.isMp4, h264: both.h264 || end.h264, other: both.other ?? end.other };
}

export function loadImage(source) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Image illisible."));
    image.src = source;
  });
}

/** Draws the image at its natural size and returns the canvas + its RGBA data (original pixels untouched). */
export function imageToCanvas(image) {
  const canvas = document.createElement("canvas");
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  ctx.drawImage(image, 0, 0);
  return { canvas, ctx, imageData: ctx.getImageData(0, 0, canvas.width, canvas.height) };
}

export const canvasToPngBlob = (canvas) =>
  new Promise((resolve, reject) => canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("Export PNG impossible."))), "image/png"));

import assert from "node:assert/strict";
import test from "node:test";
import {
  MAX_PDF_BYTES,
  MAX_VIDEO_BYTES,
  MAX_VIDEO_SECONDS,
  formatBytes,
  formatDuration,
  sniffMp4,
  validatePdfFile,
  validateVideoCodec,
  validateVideoDuration,
  validateVideoFile,
} from "../src/lib/media-validation.js";

const mp4 = (size = 1000) => ({ name: "presentation.mp4", type: "video/mp4", size });

test("real Supabase limits: 50 MiB per file (Free plan / bucket), 120 s max", () => {
  assert.equal(MAX_VIDEO_BYTES, 52428800);
  assert.equal(MAX_PDF_BYTES, 52428800);
  assert.equal(MAX_VIDEO_SECONDS, 120);
});

test("video file: accepts MP4, refuses other formats and oversize with a clear message", () => {
  assert.equal(validateVideoFile(mp4()), null);
  assert.match(validateVideoFile({ name: "a.mov", type: "video/quicktime", size: 10 }), /MP4/);
  assert.match(validateVideoFile({ name: "a.mp4", type: "video/webm", size: 10 }), /MP4/);
  assert.match(validateVideoFile(mp4(MAX_VIDEO_BYTES + 1)), /trop lourd/);
  assert.match(validateVideoFile(mp4(0)), /vide/);
});

test("video duration: 120 s accepted, 121 s refused before any upload, unreadable refused", () => {
  assert.equal(validateVideoDuration(120), null);
  assert.equal(validateVideoDuration(45.5), null);
  assert.match(validateVideoDuration(121), /2 minutes/);
  assert.match(validateVideoDuration(Number.NaN), /illisible/);
  assert.match(validateVideoDuration(0), /illisible/);
});

test("pdf file: only .pdf / application/pdf", () => {
  assert.equal(validatePdfFile({ name: "GAFOTEC.PDF", type: "application/pdf", size: 5000 }), null);
  assert.match(validatePdfFile({ name: "a.docx", type: "application/vnd.openxmlformats", size: 5 }), /PDF/);
  assert.match(validatePdfFile({ name: "a.pdf", type: "application/pdf", size: MAX_PDF_BYTES + 1 }), /trop lourd/);
});

const bytes = (...parts) => Uint8Array.from(parts.flatMap((p) => (typeof p === "string" ? [...p].map((c) => c.charCodeAt(0)) : p)));

test("codec sniffing: H.264 ok, HEVC / AV1 refused, non-MP4 refused", () => {
  const head = [0, 0, 0, 24, "ftypisom"];
  assert.equal(validateVideoCodec(sniffMp4(bytes(...head, "....avc1....mp4a"))), null);
  assert.match(validateVideoCodec(sniffMp4(bytes(...head, "....hvc1...."))), /H\.265/);
  assert.match(validateVideoCodec(sniffMp4(bytes(...head, "....av01...."))), /AV1/);
  assert.match(validateVideoCodec(sniffMp4(bytes("RIFFxxxxWEBPVP8 "))), /vrai MP4/);
});

test("formatting helpers", () => {
  assert.equal(formatBytes(31457280), "30.0 Mo");
  assert.equal(formatBytes(2048), "2 Ko");
  assert.equal(formatDuration(95), "1 min 35 s");
});

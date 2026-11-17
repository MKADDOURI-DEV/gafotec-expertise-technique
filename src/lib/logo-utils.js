// Pure helpers for the logo admin page (no DOM, so they can be unit-tested).

export const LOGO_LIMITS = { min: 16, max: 600 };
export const DEFAULT_TRANSPARENCY = { low: 215, high: 250 };

/**
 * White → transparent, on RGBA bytes. A pixel whose darkest channel is <= `low` is left untouched (opaque),
 * one >= `high` becomes fully transparent, and the soft edge in between gets a proportional alpha with its
 * colour un-matted from white, so anti-aliased contours keep their colour instead of showing a white halo.
 * Returns a NEW array; the input (and therefore the original image) is never modified.
 */
export function removeWhiteBackground(rgba, { low = DEFAULT_TRANSPARENCY.low, high = DEFAULT_TRANSPARENCY.high } = {}) {
  const lo = Math.max(0, Math.min(254, Number(low)));
  const hi = Math.max(lo + 1, Math.min(255, Number(high)));
  const out = new Uint8ClampedArray(rgba);
  for (let i = 0; i < out.length; i += 4) {
    const r = out[i];
    const g = out[i + 1];
    const b = out[i + 2];
    const darkest = Math.min(r, g, b);
    if (darkest <= lo) continue;
    if (darkest >= hi) {
      out[i + 3] = 0;
      continue;
    }
    const keep = (hi - darkest) / (hi - lo); // 1 → opaque, 0 → transparent
    out[i] = (r - 255 * (1 - keep)) / keep;
    out[i + 1] = (g - 255 * (1 - keep)) / keep;
    out[i + 2] = (b - 255 * (1 - keep)) / keep;
    out[i + 3] = Math.round(out[i + 3] * keep);
  }
  return out;
}

export function countTransparentPixels(rgba) {
  let n = 0;
  for (let i = 3; i < rgba.length; i += 4) if (rgba[i] < 255) n += 1;
  return n;
}

/** "48" → 48; "", "abc", out of range → null (= automatic size). */
export function parseLogoSize(value) {
  const n = Number.parseInt(String(value ?? "").trim(), 10);
  if (!Number.isFinite(n) || n < LOGO_LIMITS.min || n > LOGO_LIMITS.max) return null;
  return n;
}

/** Inline style for the <img>: only the display size changes, never the file. */
export function logoStyle({ width, height } = {}) {
  const w = parseLogoSize(width);
  const h = parseLogoSize(height);
  const style = { maxWidth: "100%", objectFit: "contain" };
  if (h) style.height = `${h}px`;
  if (w) style.width = `${w}px`;
  if (!h && !w) return null; // let the default responsive classes apply
  if (!w) style.width = "auto";
  if (!h) style.height = "auto";
  return style;
}

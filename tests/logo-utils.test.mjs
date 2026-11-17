import assert from "node:assert/strict";
import test from "node:test";
import { countTransparentPixels, logoStyle, parseLogoSize, removeWhiteBackground } from "../src/lib/logo-utils.js";

const px = (...rgba) => Uint8ClampedArray.from(rgba);

test("white pixels become transparent, dark brand pixels stay untouched and opaque", () => {
  const input = px(255, 255, 255, 255, 6, 70, 165, 255);
  const out = removeWhiteBackground(input);
  assert.equal(out[3], 0);
  assert.deepEqual([...out.slice(4, 8)], [6, 70, 165, 255]);
});

test("soft edge: partial alpha and colour un-matted from white (no white halo)", () => {
  const out = removeWhiteBackground(px(235, 240, 250, 255), { low: 215, high: 250 }); // darkest 235
  assert.ok(out[3] > 0 && out[3] < 255, `alpha ${out[3]}`);
  assert.ok(out[0] < 235, "red channel must be pushed away from white");
});

test("the input is never modified (original stays intact) and pale-blue stripes survive", () => {
  const input = px(255, 255, 255, 255, 170, 205, 235, 255);
  const copy = Uint8ClampedArray.from(input);
  const out = removeWhiteBackground(input);
  assert.deepEqual([...input], [...copy]);
  assert.equal(out[7], 255, "light-blue stripe must stay opaque");
  assert.equal(countTransparentPixels(out), 1);
});

test("parseLogoSize accepts 16..600 px only", () => {
  assert.equal(parseLogoSize("48"), 48);
  assert.equal(parseLogoSize(""), null);
  assert.equal(parseLogoSize("abc"), null);
  assert.equal(parseLogoSize("5"), null);
  assert.equal(parseLogoSize("9999"), null);
});

test("logoStyle: nothing set = default responsive classes; only the display size changes", () => {
  assert.equal(logoStyle({ width: "", height: "" }), null);
  assert.deepEqual(logoStyle({ height: "60" }), { maxWidth: "100%", objectFit: "contain", height: "60px", width: "auto" });
  assert.equal(logoStyle({ width: "200", height: "80" }).width, "200px");
});

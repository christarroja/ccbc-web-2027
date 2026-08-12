import assert from "node:assert/strict";
import { AA_NORMAL_TEXT, contrastRatio, expandHex, isHex } from "./contrast";

// Run with: npx payload run src/lib/contrast.check.ts

const round = (n: number) => Math.round(n * 100) / 100;

// The two fixed points of the scale
assert.equal(round(contrastRatio("#000000", "#ffffff")), 21);
assert.equal(round(contrastRatio("#ff0000", "#ff0000")), 1);

// Order must not matter — the field validates text-on-bg either way round
assert.equal(
  contrastRatio("#000000", "#ffffff"),
  contrastRatio("#ffffff", "#000000"),
);

assert.equal(round(contrastRatio("#fff", "#000")), 21);
assert.equal(expandHex("#FFF"), "#ffffff");
assert.equal(expandHex("#AaBbCc"), "#aabbcc");

assert.ok(contrastRatio("#767676", "#ffffff") >= AA_NORMAL_TEXT);
assert.ok(contrastRatio("#777777", "#ffffff") < AA_NORMAL_TEXT);

assert.ok(contrastRatio("#f4f1ea", "#1b2a4a") >= AA_NORMAL_TEXT);
assert.ok(contrastRatio("#3f5a8a", "#1b2a4a") < AA_NORMAL_TEXT);

assert.ok(isHex("#abc"));
assert.ok(isHex("#AABBCC"));
assert.ok(!isHex("#abcd"));
assert.ok(!isHex("abc123"));
assert.ok(!isHex("rebeccapurple"));
assert.ok(!isHex(undefined));

console.log("contrast.check.ts passed");

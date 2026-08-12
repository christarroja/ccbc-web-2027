/**
 * WCAG 2.1 contrast
 */

const HEX = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i;

export const AA_NORMAL_TEXT = 4.5;

export function isHex(value: unknown): value is string {
  return typeof value === "string" && HEX.test(value);
}

/** `#abc` and `#aabbcc` both mean the same colour; the picker emits the long form. */
export function expandHex(hex: string): string {
  if (hex.length !== 4) return hex.toLowerCase();
  const [, r, g, b] = hex;
  return `#${r}${r}${g}${g}${b}${b}`.toLowerCase();
}

function channelLuminance(byte: number): number {
  const c = byte / 255;
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

function relativeLuminance(hex: string): number {
  const full = expandHex(hex);
  const [r, g, b] = [1, 3, 5].map((i) =>
    channelLuminance(parseInt(full.slice(i, i + 2), 16)),
  );
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** 1 (identical) to 21 (black on white). Order of arguments does not matter. */
export function contrastRatio(a: string, b: string): number {
  const [la, lb] = [relativeLuminance(a), relativeLuminance(b)];
  const [lighter, darker] = la > lb ? [la, lb] : [lb, la];
  return (lighter + 0.05) / (darker + 0.05);
}

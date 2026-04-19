// site/components/pixel-canvas/palette.ts
import type { Palette } from "./types";

function rgbFromCssVar(varName: string, fallback: string): string {
  if (typeof window === "undefined") return fallback;
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue(varName)
    .trim();
  return raw || fallback;
}

// Mid-gray fallback when a CSS var is missing or unparseable.
const PARSE_FALLBACK_RGB = { r: 136, g: 136, b: 136 };

function parseRgb(s: string): { r: number; g: number; b: number } {
  const hexMatch = s.match(/^#([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
  if (hexMatch) {
    return {
      r: parseInt(hexMatch[1], 16),
      g: parseInt(hexMatch[2], 16),
      b: parseInt(hexMatch[3], 16),
    };
  }
  const rgbMatch = s.match(/rgba?\((\d+)[,\s]+(\d+)[,\s]+(\d+)/);
  if (rgbMatch) {
    return {
      r: parseInt(rgbMatch[1], 10),
      g: parseInt(rgbMatch[2], 10),
      b: parseInt(rgbMatch[3], 10),
    };
  }
  return PARSE_FALLBACK_RGB;
}

function normalize(s: string): string {
  const { r, g, b } = parseRgb(s);
  return `rgb(${r}, ${g}, ${b})`;
}

function blend(a: string, b: string, t: number): string {
  const ca = parseRgb(a);
  const cb = parseRgb(b);
  const r = Math.round(ca.r * (1 - t) + cb.r * t);
  const g = Math.round(ca.g * (1 - t) + cb.g * t);
  const bl = Math.round(ca.b * (1 - t) + cb.b * t);
  return `rgb(${r}, ${g}, ${bl})`;
}

export function readPalette(): Palette {
  const accent = normalize(rgbFromCssVar("--color-accent", "#B5651D"));
  const fgTertiary = normalize(
    rgbFromCssVar("--color-fg-tertiary", "rgba(17,17,17,0.35)")
  );
  const bg = normalize(rgbFromCssVar("--color-bg", "#ffffff"));
  const accentSoft = blend(accent, bg, 0.55);
  return { accent, accentSoft, fgTertiary, bg };
}

export function withAlpha(rgb: string, alpha: number): string {
  const { r, g, b } = parseRgb(rgb);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

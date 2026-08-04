/**
 * Canary "Polished Visuals" design tokens, transcribed for the web specimens.
 *
 * Source of truth: `docs/figma-migration/POLISHED-TOKENS.md` + the Figma file
 * "Canary Polished Visuals" (`OclYC5ytIQc9HAuJMRXUaz`), page 🎨 Polished Tokens.
 * Decisions baked in: Inter (Marco, 2026-08-02), primary #2858c4, neutrals with
 * a deliberate cool cast.
 *
 * These are PRODUCT tokens — the interface being demonstrated — and are
 * intentionally literal, not theme-following. The portfolio's own tokens style
 * the panel *around* the specimen; the artifact inside keeps its real colors in
 * light and dark alike. Same contract as `fnb-specimen-data.ts`'s `INK`.
 */

// ─── Color primitives ──────────────────────────────────────────────────────

export const neutral = {
  0: "#ffffff",
  50: "#f7f8fa",
  100: "#eef0f4",
  200: "#e2e5eb",
  300: "#cbd0da",
  400: "#9aa2b1",
  500: "#6b7484",
  600: "#4d5563",
  700: "#3a4150",
  800: "#262c38",
  900: "#131822",
} as const;

export const primary = {
  50: "#eef2fc",
  100: "#dbe3f8",
  200: "#b8c7f1",
  300: "#8fa6e6",
  400: "#6480d8",
  500: "#2858c4",
  600: "#2149a6",
  700: "#1b3c88",
  800: "#17316d",
  900: "#132750",
} as const;

export const success = {
  50: "#e8f6ef",
  100: "#b7e2cd",
  500: "#0f7a4a",
  600: "#0c6440",
  700: "#094f33",
} as const;

export const warning = {
  50: "#fdf3e2",
  100: "#f5dcae",
  500: "#9a6100",
  600: "#7d4f00",
  700: "#613d00",
} as const;

export const danger = {
  50: "#fdeaee",
  100: "#f6c2cd",
  500: "#c8203f",
  600: "#a81834",
  700: "#8a1329",
} as const;

// ─── Semantic aliases ──────────────────────────────────────────────────────

export const T = {
  bg: {
    canvas: neutral[0],
    subtle: neutral[50],
    muted: neutral[100],
    inverse: neutral[800],
    accent: primary[500],
    accentHover: primary[600],
    accentSubtle: primary[50],
    successSubtle: success[50],
    warningSubtle: warning[50],
    dangerSubtle: danger[50],
  },
  text: {
    primary: neutral[900],
    secondary: neutral[600],
    tertiary: neutral[500],
    disabled: neutral[400],
    inverse: neutral[0],
    accent: primary[500],
    success: success[500],
    warning: warning[500],
    danger: danger[500],
  },
  border: {
    subtle: neutral[100],
    default: neutral[200],
    strong: neutral[300],
    accent: primary[500],
  },
} as const;

// ─── Space / Radius ────────────────────────────────────────────────────────

export const SPACE = [2, 4, 6, 8, 12, 16, 20, 24, 32, 40, 48] as const;

export const RADIUS = {
  xs: 2,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
} as const;

// ─── Elevation ─────────────────────────────────────────────────────────────
// Two layers each, one light source, ink #131822.

export const ELEV = {
  sm: "0 1px 2px rgba(19, 24, 34, 0.06), 0 1px 3px rgba(19, 24, 34, 0.10)",
  md: "0 2px 4px rgba(19, 24, 34, 0.06), 0 4px 12px rgba(19, 24, 34, 0.08)",
  lg: "0 4px 8px rgba(19, 24, 34, 0.06), 0 12px 28px rgba(19, 24, 34, 0.10)",
  overlay:
    "0 8px 16px rgba(19, 24, 34, 0.08), 0 24px 56px rgba(19, 24, 34, 0.14)",
} as const;

// ─── Type ramp ─────────────────────────────────────────────────────────────
/**
 * 8 steps × weights. Line-height ratio tightens as size grows; tracking goes
 * negative on large text. Inter is loaded in `app/layout.tsx` and exposed as
 * `--font-inter`; the fallback chain keeps metrics close if it ever fails.
 */

export const INTER =
  "var(--font-inter), Inter, ui-sans-serif, system-ui, sans-serif";

type TypeStep = {
  fontFamily: string;
  fontSize: number;
  lineHeight: string;
  letterSpacing: string;
};

const step = (size: number, lh: number, trackPct: number): TypeStep => ({
  fontFamily: INTER,
  fontSize: size,
  lineHeight: `${lh}px`,
  letterSpacing: `${((trackPct / 100) * size).toFixed(3)}px`,
});

export const TYPE = {
  micro: step(11, 16, 4),
  caption: step(12, 18, 0.5),
  bodyS: step(13, 18, 0),
  body: step(14, 20, 0),
  bodyL: step(16, 24, -0.5),
  titleS: step(20, 28, -1),
  title: step(24, 32, -1.5),
  display: step(32, 40, -2),
} as const;

/** Weight map — the ramp only ships these three. */
export const W = { regular: 400, medium: 500, semibold: 600 } as const;

/**
 * Editorial grid vocabulary — single source of truth for named layout
 * presets and the column-spec grammar.
 *
 * Spec grammar: "START-END" (1-indexed, END inclusive, 12 columns) or
 * "full". Bands: base = phone (<768), md = tablet (768–1199),
 * lg = desktop (≥1200). Unspecified bands inherit downward
 * (lg falls back to md, md to base, base to full).
 *
 * Visual reference for all of this: docs/LAYOUT-REFERENCE.html
 */

export type ColSpec = {
  base?: string;
  md?: string;
  lg?: string;
};

export type PresetName =
  | "prose"
  | "prose-wide"
  | "intro-rail"
  | "media-right"
  | "media-left"
  | "media-full"
  | "duo"
  | "quote-offset";

/**
 * Parse a column spec into a CSS grid-column value.
 * "1-6" → "1 / 7" (end line is exclusive in CSS, so END+1).
 * "full" or anything invalid → "1 / -1".
 */
export function parseColSpec(spec: string): string {
  if (spec === "full") return "1 / -1";
  const m = /^(\d{1,2})-(\d{1,2})$/.exec(spec);
  if (!m) return "1 / -1";
  const start = parseInt(m[1], 10);
  const end = parseInt(m[2], 10);
  if (start < 1 || end > 12 || end < start) return "1 / -1";
  return `${start} / ${end + 1}`;
}

/**
 * Named compositions. Each entry is an ordered list of slots — the
 * Nth direct child of <Grid preset="..."> gets the Nth slot (children
 * beyond the list default to full width). Explicit props on a <Col>
 * always win over the preset slot.
 */
export const PRESETS: Record<PresetName, ColSpec[]> = {
  /** One comfortable text column (~65ch), optically centered — equal
   *  air both sides so text-only runs don't read left-hung. */
  prose: [{ md: "3-10", lg: "4-9" }],

  /** Wider centered text column for intros or dense sections. */
  "prose-wide": [{ md: "2-11", lg: "3-10" }],

  /** Main content + narrow metadata rail (Year / Role / Scope). */
  "intro-rail": [
    { md: "1-8", lg: "1-7" },
    { md: "1-8", lg: "9-12" },
  ],

  /** Text left, larger media right. */
  "media-right": [{ lg: "1-5" }, { lg: "6-12" }],

  /** Media left, text right. */
  "media-left": [{ lg: "1-7" }, { lg: "8-12" }],

  /** Media spans the full canvas. */
  "media-full": [{ lg: "full" }],

  /** Two equal media cells, side by side (holds on tablet). */
  duo: [
    { md: "1-6", lg: "1-6" },
    { md: "7-12", lg: "7-12" },
  ],

  /** Pull quote pushed off the left edge for emphasis. */
  "quote-offset": [{ md: "2-11", lg: "3-10" }],
};

/** The centered middle-6 content band ("4-9") — home page bio,
 *  testimonials, section labels, and playground cells all sit here so
 *  the page reads as one centered column (2026-07-20 centering pass).
 *  Only the full-bleed work marquee escapes it. */
export const CONTENT_BAND = "4-9";

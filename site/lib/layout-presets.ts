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

/** The centered middle-6 content band ("4-9") — home page bio,
 *  testimonials, section labels, playground cells, and (since the
 *  2026-07-20 case-study alignment) every case-study section sit here
 *  so pages read as one centered column. Only the home work marquee
 *  escapes it. */
export const CONTENT_BAND = "4-9";

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
 *
 * 2026-07-20 centering pass: every preset now resolves to the shared
 * CONTENT_BAND (middle 6 columns) so case studies match the homepage's
 * single centered column — multi-slot presets stack their slots as
 * successive rows (grid auto-flow). The preset NAMES survive as
 * semantic markers in the content files (what a section *is*, not
 * where it sits); resurrect the old compositions from git if a wider
 * layout ever comes back.
 */
const BAND: ColSpec = { lg: CONTENT_BAND };

export const PRESETS: Record<PresetName, ColSpec[]> = {
  prose: [BAND],
  "prose-wide": [BAND],
  "intro-rail": [BAND, BAND],
  "media-right": [BAND, BAND],
  "media-left": [BAND, BAND],
  "media-full": [BAND],
  duo: [BAND, BAND],
  "quote-offset": [BAND],
};

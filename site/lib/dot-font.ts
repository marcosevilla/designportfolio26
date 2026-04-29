// site/lib/dot-font.ts

/** All glyphs are row-major arrays of 0/1. 1 = lit dot. */
export type DotGlyph = readonly (readonly number[])[];

/** 3-cells-wide × 5-cells-tall uppercase + digits + punctuation. */
export const FONT_3x5: Record<string, DotGlyph> = {
  A: [[0,1,0],[1,0,1],[1,1,1],[1,0,1],[1,0,1]],
  B: [[1,1,0],[1,0,1],[1,1,0],[1,0,1],[1,1,0]],
  C: [[0,1,1],[1,0,0],[1,0,0],[1,0,0],[0,1,1]],
  D: [[1,1,0],[1,0,1],[1,0,1],[1,0,1],[1,1,0]],
  E: [[1,1,1],[1,0,0],[1,1,0],[1,0,0],[1,1,1]],
  F: [[1,1,1],[1,0,0],[1,1,0],[1,0,0],[1,0,0]],
  G: [[0,1,1],[1,0,0],[1,0,1],[1,0,1],[0,1,1]],
  H: [[1,0,1],[1,0,1],[1,1,1],[1,0,1],[1,0,1]],
  I: [[1,1,1],[0,1,0],[0,1,0],[0,1,0],[1,1,1]],
  J: [[0,0,1],[0,0,1],[0,0,1],[1,0,1],[0,1,0]],
  K: [[1,0,1],[1,1,0],[1,0,0],[1,1,0],[1,0,1]],
  L: [[1,0,0],[1,0,0],[1,0,0],[1,0,0],[1,1,1]],
  M: [[1,0,1],[1,1,1],[1,1,1],[1,0,1],[1,0,1]],
  N: [[1,0,1],[1,1,1],[1,1,1],[1,1,1],[1,0,1]],
  O: [[0,1,0],[1,0,1],[1,0,1],[1,0,1],[0,1,0]],
  P: [[1,1,0],[1,0,1],[1,1,0],[1,0,0],[1,0,0]],
  Q: [[0,1,0],[1,0,1],[1,0,1],[1,1,1],[0,1,1]],
  R: [[1,1,0],[1,0,1],[1,1,0],[1,0,1],[1,0,1]],
  S: [[0,1,1],[1,0,0],[0,1,0],[0,0,1],[1,1,0]],
  T: [[1,1,1],[0,1,0],[0,1,0],[0,1,0],[0,1,0]],
  U: [[1,0,1],[1,0,1],[1,0,1],[1,0,1],[0,1,0]],
  V: [[1,0,1],[1,0,1],[1,0,1],[0,1,0],[0,1,0]],
  W: [[1,0,1],[1,0,1],[1,1,1],[1,1,1],[1,0,1]],
  X: [[1,0,1],[1,0,1],[0,1,0],[1,0,1],[1,0,1]],
  Y: [[1,0,1],[1,0,1],[0,1,0],[0,1,0],[0,1,0]],
  Z: [[1,1,1],[0,0,1],[0,1,0],[1,0,0],[1,1,1]],
  "0": [[0,1,0],[1,0,1],[1,0,1],[1,0,1],[0,1,0]],
  "1": [[0,1,0],[1,1,0],[0,1,0],[0,1,0],[1,1,1]],
  "2": [[1,1,0],[0,0,1],[0,1,0],[1,0,0],[1,1,1]],
  "3": [[1,1,0],[0,0,1],[0,1,0],[0,0,1],[1,1,0]],
  "4": [[1,0,1],[1,0,1],[1,1,1],[0,0,1],[0,0,1]],
  "5": [[1,1,1],[1,0,0],[1,1,0],[0,0,1],[1,1,0]],
  "6": [[0,1,1],[1,0,0],[1,1,0],[1,0,1],[0,1,0]],
  "7": [[1,1,1],[0,0,1],[0,1,0],[0,1,0],[0,1,0]],
  "8": [[1,1,1],[1,0,1],[1,1,1],[1,0,1],[1,1,1]],
  "9": [[0,1,0],[1,0,1],[0,1,1],[0,0,1],[1,1,0]],
  " ": [[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0]],
  "-": [[0,0,0],[0,0,0],[1,1,1],[0,0,0],[0,0,0]],
  ":": [[0,0,0],[0,1,0],[0,0,0],[0,1,0],[0,0,0]],
  ".": [[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,1,0]],
  "…": [[0,0,0],[0,0,0],[0,0,0],[0,0,0],[1,1,1]],
};

const FALLBACK = FONT_3x5[" "];
const CHAR_H = 5;
const CHAR_ADVANCE = 4; // 3 cols + 1 col gap

/** 5×5 transport glyphs. */
export const GLYPH_5x5_TRANSPORT = {
  play: [
    [1,0,0,0,0],
    [1,1,0,0,0],
    [1,1,1,0,0],
    [1,1,0,0,0],
    [1,0,0,0,0],
  ],
  pause: [
    [0,1,0,1,0],
    [0,1,0,1,0],
    [0,1,0,1,0],
    [0,1,0,1,0],
    [0,1,0,1,0],
  ],
  prev: [
    [1,0,0,0,1],
    [1,0,0,1,1],
    [1,0,1,1,1],
    [1,0,0,1,1],
    [1,0,0,0,1],
  ],
  next: [
    [1,0,0,0,1],
    [1,1,0,0,1],
    [1,1,1,0,1],
    [1,1,0,0,1],
    [1,0,0,0,1],
  ],
} as const satisfies Record<string, DotGlyph>;

/** 5×5 scene icons — same id strings as `VisualizerScene`. */
export const GLYPH_5x5_SCENES: Record<
  "waveform" | "sparkles" | "chladni" | "feedback" | "lissajous",
  DotGlyph
> = {
  waveform: [[0,1,0,0,0],[0,1,0,0,1],[1,1,0,1,1],[1,1,1,1,1],[1,1,1,1,1]],
  sparkles: [[0,0,1,0,0],[0,0,1,0,0],[1,1,1,1,1],[0,0,1,0,0],[0,0,1,0,0]],
  chladni:  [[0,1,1,1,0],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[0,1,1,1,0]],
  feedback: [[1,1,1,1,1],[1,0,0,0,1],[1,0,1,0,1],[1,0,0,0,1],[1,1,1,1,1]],
  lissajous:[[1,0,0,0,1],[0,1,0,1,0],[0,0,1,0,0],[0,1,0,1,0],[1,0,0,0,1]],
};

/** Returns {cols, rows} the rendered string would occupy in the 3×5 font. */
export function measureText(str: string): { cols: number; rows: number } {
  const upper = str.toUpperCase();
  const cols = Math.max(0, upper.length * CHAR_ADVANCE - 1); // last char has no trailing gap
  return { cols, rows: upper.length === 0 ? 0 : CHAR_H };
}

/** Truncate `str` so its rendered width fits within `maxCols`, appending "…". */
export function truncateToCols(str: string, maxCols: number): string {
  // Below this threshold no truncated form fits — caller should not call us.
  if (maxCols < CHAR_ADVANCE) return "";

  const upper = str.toUpperCase();
  if (measureText(upper).cols <= maxCols) return upper;
  // Account for the ellipsis (1 char = 4 cells of advance, 3 cells visible).
  const ellipsisAdvance = CHAR_ADVANCE;
  let used = 0;
  let out = "";
  for (const ch of upper) {
    const next = used + CHAR_ADVANCE;
    if (next - 1 + ellipsisAdvance > maxCols) break;
    out += ch;
    used = next;
  }
  return out + "…";
}

/** Light up dots at (col + glyph.x, row + glyph.y) for every 1 in the glyph. */
export function drawGlyph(
  ctx: CanvasRenderingContext2D,
  glyph: DotGlyph,
  originCol: number,
  originRow: number,
  cell: number,
  color: string
): void {
  ctx.fillStyle = color;
  const radius = cell * 0.32;
  for (let r = 0; r < glyph.length; r++) {
    const row = glyph[r];
    for (let c = 0; c < row.length; c++) {
      if (!row[c]) continue;
      const x = (originCol + c + 0.5) * cell;
      const y = (originRow + r + 0.5) * cell;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

/** Draw `str` (uppercased) starting at (originCol, originRow) using FONT_3x5. */
export function drawText(
  ctx: CanvasRenderingContext2D,
  str: string,
  originCol: number,
  originRow: number,
  cell: number,
  color: string
): void {
  let col = originCol;
  for (const ch of str.toUpperCase()) {
    const glyph = FONT_3x5[ch] ?? FALLBACK;
    drawGlyph(ctx, glyph, col, originRow, cell, color);
    col += CHAR_ADVANCE;
  }
}

/** Format seconds as M:SS for display. Negative or NaN → "0:00". */
export function formatClock(secs: number): string {
  if (!Number.isFinite(secs) || secs < 0) return "0:00";
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

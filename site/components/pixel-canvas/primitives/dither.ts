// site/components/pixel-canvas/primitives/dither.ts
// Bayer 4×4 ordered-dither threshold matrix.
// Use: if (value > bayer(x, y)) drawColor(); else drawSoftColor();

const BAYER_4 = [
  [ 0,  8,  2, 10],
  [12,  4, 14,  6],
  [ 3, 11,  1,  9],
  [15,  7, 13,  5],
];

// Returns 0..1 threshold for pixel (x, y) — compare to normalized intensity.
export function bayer(x: number, y: number): number {
  const bx = ((x % 4) + 4) % 4;
  const by = ((y % 4) + 4) % 4;
  return BAYER_4[by][bx] / 16;
}

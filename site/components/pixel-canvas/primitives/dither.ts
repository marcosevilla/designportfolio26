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
// Inputs are floored so non-integer coords (e.g. float loop bounds) still index safely.
export function bayer(x: number, y: number): number {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const bx = ((ix % 4) + 4) % 4;
  const by = ((iy % 4) + 4) % 4;
  return BAYER_4[by][bx] / 16;
}

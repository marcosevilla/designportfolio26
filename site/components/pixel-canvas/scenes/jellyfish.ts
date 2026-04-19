// site/components/pixel-canvas/scenes/jellyfish.ts
import type { Scene, FrameCtx } from "../types";
import { rect } from "../primitives/raster";
import { bayer } from "../primitives/dither";
import { withAlpha } from "../palette";

export type JellyfishConfig = {
  ribs: number;
  bellRadius: number; // in logical px
  bellHeight: number; // vertical half-height of dome
  bellCenterY: number; // y coord of bell center (top of canvas ≈ 0)
};

export const DEFAULT_CONFIG: JellyfishConfig = {
  ribs: 10,
  bellRadius: 30,
  bellHeight: 22,
  bellCenterY: 32,
};

type State = {
  config: JellyfishConfig;
};

function drawBell(
  ctx: CanvasRenderingContext2D,
  state: State,
  frame: FrameCtx
): void {
  const { ribs, bellRadius, bellHeight, bellCenterY } = state.config;
  const cx = frame.width / 2;
  const cy = bellCenterY;
  const { accent, accentSoft, fgTertiary } = frame.palette;

  // For each pixel inside the dome, fill based on radial position and dither.
  for (let y = cy - bellHeight; y <= cy + 2; y++) {
    for (let x = cx - bellRadius; x <= cx + bellRadius; x++) {
      const dx = (x - cx) / bellRadius;
      const dy = (y - cy) / bellHeight;
      // Dome equation: top half of an ellipse (dy ≤ 0 is above center).
      // We want upper dome: dy ∈ [-1, 0.15]. Radial profile:
      //   perturbation from ribs: r_adj = 1 + 0.06 * cos(angle * ribs)
      const angle = Math.atan2(dy, dx);
      const perturb = 1 + 0.06 * Math.cos(angle * ribs);
      const r = Math.sqrt(dx * dx + dy * dy) / perturb;
      if (dy > 0.15) continue; // skip below the skirt line
      if (r > 1) continue;     // outside dome

      // Shading: r ∈ [0, 1] — center is lit, edges darker
      // Upper-left highlight boost
      const highlight = Math.max(0, -dx * 0.5 - dy * 0.5);
      const intensity = (1 - r) * 0.7 + highlight * 0.3;
      const threshold = bayer(x, y);

      if (intensity > threshold + 0.35) {
        rect(ctx, x, y, 1, 1, withAlpha(fgTertiary, 0.6)); // highlight
      } else if (r > 0.75) {
        rect(ctx, x, y, 1, 1, accent);                     // rim
      } else {
        rect(ctx, x, y, 1, 1, accentSoft);                 // interior
      }
    }
  }
}

export function createJellyfishScene(
  config: JellyfishConfig = DEFAULT_CONFIG
): Scene<State> {
  return {
    id: "jellyfish",
    init: () => ({ config: { ...config } }),
    draw: (ctx, state, frame) => {
      drawBell(ctx, state, frame);
    },
  };
}

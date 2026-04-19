import type { Scene, FrameCtx } from "../types";
import { rect } from "../primitives/raster";
import { bayer } from "../primitives/dither";
import { withAlpha } from "../palette";

export type JellyfishConfig = {
  ribs: number;
  bellRadius: number;
  bellHeight: number;
  bellCenterY: number;
  pulseFrequency: number;     // Hz
  pulseAmplitude: number;     // fraction of bellHeight to compress
  varianceIntervalAvg: number; // seconds (mean of exponential distribution)
  varianceMultiplier: number;  // amplitude scale for the big pulse
};

export const DEFAULT_CONFIG: JellyfishConfig = {
  ribs: 10,
  bellRadius: 30,
  bellHeight: 22,
  bellCenterY: 32,
  pulseFrequency: 0.6,
  pulseAmplitude: 0.12,
  varianceIntervalAvg: 7,
  varianceMultiplier: 1.7,
};

type PulseEvent = {
  startT: number;
  peakT: number;
  endT: number;
  multiplier: number;
};

type State = {
  config: JellyfishConfig;
  nextVarianceEventAt: number;
  activeEvent: PulseEvent | null;
};

function sampleExponential(mean: number): number {
  // Inverse CDF for exponential distribution (mean = 1/lambda).
  // Using Math.random is fine — deterministic seeding not required for this.
  return -Math.log(1 - Math.random()) * mean;
}

function pulseAt(t: number, state: State): number {
  const { pulseFrequency, pulseAmplitude, varianceIntervalAvg, varianceMultiplier } = state.config;

  // Schedule next Poisson event if none active and we've crossed the threshold
  if (state.activeEvent == null && t >= state.nextVarianceEventAt) {
    const dur = 1 / pulseFrequency; // one pulse period
    state.activeEvent = {
      startT: t,
      peakT: t + dur / 2,
      endT: t + dur,
      multiplier: varianceMultiplier,
    };
    state.nextVarianceEventAt = state.activeEvent.endT + sampleExponential(varianceIntervalAvg);
  }

  // Determine current multiplier envelope
  let multiplier = 1;
  if (state.activeEvent) {
    const e = state.activeEvent;
    if (t > e.endT) {
      state.activeEvent = null;
    } else {
      const phase = (t - e.startT) / (e.endT - e.startT); // 0..1
      const env = Math.sin(phase * Math.PI); // smooth ramp up/down
      multiplier = 1 + (e.multiplier - 1) * env;
    }
  }

  // Base pulse: 0 (rest) → 1 (fully contracted) using (1 - cos) / 2 for a smooth pulse
  const phase = t * pulseFrequency * 2 * Math.PI;
  const base = (1 - Math.cos(phase)) / 2; // 0..1
  return base * pulseAmplitude * multiplier;
}

function drawBell(
  ctx: CanvasRenderingContext2D,
  state: State,
  frame: FrameCtx,
  pulse: number
): void {
  const { ribs, bellRadius, bellHeight, bellCenterY } = state.config;
  const cx = frame.width / 2;
  const cy = bellCenterY;
  const effectiveHeight = bellHeight * (1 - pulse);
  const { accent, accentSoft, fgTertiary } = frame.palette;

  const yStart = Math.floor(cy - effectiveHeight);
  const yEnd = Math.ceil(cy + 2);
  for (let y = yStart; y <= yEnd; y++) {
    for (let x = cx - bellRadius; x <= cx + bellRadius; x++) {
      const dx = (x - cx) / bellRadius;
      const dy = (y - cy) / effectiveHeight;
      const angle = Math.atan2(dy, dx);
      const perturb = 1 + 0.06 * Math.cos(angle * ribs);
      const r = Math.sqrt(dx * dx + dy * dy) / perturb;
      if (dy > 0.15) continue;
      if (r > 1) continue;

      const highlight = Math.max(0, -dx * 0.5 - dy * 0.5);
      const intensity = (1 - r) * 0.7 + highlight * 0.3;
      const threshold = bayer(x, y);

      if (intensity > threshold + 0.35) {
        rect(ctx, x, y, 1, 1, withAlpha(fgTertiary, 0.6));
      } else if (r > 0.75) {
        rect(ctx, x, y, 1, 1, accent);
      } else {
        rect(ctx, x, y, 1, 1, accentSoft);
      }
    }
  }
}

export function createJellyfishScene(
  config: JellyfishConfig = DEFAULT_CONFIG
): Scene<State> {
  return {
    id: "jellyfish",
    init: () => ({
      config: { ...config },
      nextVarianceEventAt: sampleExponential(config.varianceIntervalAvg),
      activeEvent: null,
    }),
    draw: (ctx, state, frame) => {
      const pulse = pulseAt(frame.t, state);
      drawBell(ctx, state, frame, pulse);
    },
  };
}

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
  oralArmCount: number;
  oralArmLength: number;
  oralArmLag: number; // seconds — how much oral arm trails the bell pulse
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
  oralArmCount: 3,
  oralArmLength: 28,
  oralArmLag: 0.08,
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
  pulseHistory: Array<{ t: number; value: number }>; // for lag sampling
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

  // Bell extends from top of dome (dy = -1) down to a rounded underside (dy ≈ 0.55).
  // The radial perturbation naturally scallops the edges; the underside tapers in
  // toward the bell opening where oral arms and tentacles will emerge.
  const BELL_UNDERSIDE = 0.55;
  const yStart = Math.floor(cy - effectiveHeight);
  const yEnd = Math.ceil(cy + BELL_UNDERSIDE * effectiveHeight + 1);
  for (let y = yStart; y <= yEnd; y++) {
    for (let x = cx - bellRadius; x <= cx + bellRadius; x++) {
      const dx = (x - cx) / bellRadius;
      const dy = (y - cy) / effectiveHeight;
      const angle = Math.atan2(dy, dx);
      const perturb = 1 + 0.06 * Math.cos(angle * ribs);
      const r = Math.sqrt(dx * dx + dy * dy) / perturb;
      if (dy > BELL_UNDERSIDE) continue;
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

function drawOralArms(
  ctx: CanvasRenderingContext2D,
  state: State,
  frame: FrameCtx,
  pulse: number,
  lagPulse: number
): void {
  const { bellRadius, bellCenterY, oralArmCount, oralArmLength } = state.config;
  const cx = frame.width / 2;
  const { accent, accentSoft } = frame.palette;
  // Lag → the oral arms "hang" behind the bell — they contract and release slightly after.
  const armSquish = lagPulse * 0.3; // arms compress 30% of pulse
  const startY = bellCenterY + 2; // just below the bell skirt

  for (let i = 0; i < oralArmCount; i++) {
    const tArm = oralArmCount === 1 ? 0 : (i / (oralArmCount - 1)) * 2 - 1; // -1..1
    const rootX = cx + tArm * (bellRadius * 0.35);
    const armLen = oralArmLength * (1 - armSquish);
    const segmentCount = Math.round(armLen / 2);

    for (let seg = 0; seg < segmentCount; seg++) {
      const tSeg = seg / segmentCount; // 0..1 along arm
      // Frilly wiggle: each segment offsets by sin of seg + pulse-driven phase
      const wiggle = Math.sin(seg * 0.8 + frame.t * 2 + i) * (1 + tSeg * 1.5);
      const x = rootX + wiggle * 0.6;
      const y = startY + seg * 2;
      // Width taper from 2px at top to 1px at tip
      const width = tSeg < 0.5 ? 2 : 1;
      const color = tSeg < 0.3 ? accent : accentSoft;
      rect(ctx, x - Math.floor(width / 2), y, width, 1, color);
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
      pulseHistory: [],
    }),
    draw: (ctx, state, frame) => {
      const pulse = pulseAt(frame.t, state);
      // Track pulse history for lag
      state.pulseHistory.push({ t: frame.t, value: pulse });
      // Trim history older than ~1 second (60 frames at 60fps)
      while (state.pulseHistory.length > 60) state.pulseHistory.shift();
      // Lookup lagged pulse value from history
      const lagTarget = frame.t - state.config.oralArmLag;
      let lagPulse = pulse;
      for (let i = state.pulseHistory.length - 1; i >= 0; i--) {
        if (state.pulseHistory[i].t <= lagTarget) {
          lagPulse = state.pulseHistory[i].value;
          break;
        }
      }

      drawBell(ctx, state, frame, pulse);
      drawOralArms(ctx, state, frame, pulse, lagPulse);
    },
  };
}

// site/components/pixel-canvas/engine.ts
// Framework-agnostic RAF driver. Pure — can be driven by any mounting layer.

import type { FrameCtx, Palette, Scene } from "./types";

export type EngineConfig<TState> = {
  ctx: CanvasRenderingContext2D;
  scene: Scene<TState>;
  width: number;           // logical width
  height: number;          // logical height
  getPalette: () => Palette;
  getReducedMotion: () => boolean;
  getPaused: () => boolean; // true if should freeze (off-screen or document hidden)
};

export function startEngine<TState>(config: EngineConfig<TState>): () => void {
  const { ctx, scene, width, height, getPalette, getReducedMotion, getPaused } = config;
  const state = scene.init({ width, height, seed: 1 });
  let mountedTime = performance.now() / 1000;
  let lastFrame = mountedTime;
  let simT = 0; // seconds of simulated time (paused when off-screen, scaled when reduced-motion)
  let rafId = 0;

  const tick = () => {
    const now = performance.now() / 1000;
    const rawDt = Math.min(now - lastFrame, 1 / 30);
    lastFrame = now;

    if (getPaused()) {
      rafId = requestAnimationFrame(tick);
      return;
    }

    const reduced = getReducedMotion();
    const dt = reduced ? rawDt * 0.25 : rawDt;
    simT += dt;

    ctx.clearRect(0, 0, width, height);
    const frame: FrameCtx = {
      t: simT,
      dt,
      palette: getPalette(),
      reducedMotion: reduced,
      width,
      height,
    };
    scene.draw(ctx, state, frame);

    rafId = requestAnimationFrame(tick);
  };

  rafId = requestAnimationFrame(tick);
  return () => cancelAnimationFrame(rafId);
}

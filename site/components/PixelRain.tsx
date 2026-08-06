"use client";

import { useEffect, useRef } from "react";

/**
 * Falling-pixel LED glyph — the GlobalToolbar's music entry point, from
 * the Aug 2026 Figma `controls` frame (node 264:4255). The static Figma
 * arrangement is the seed; from there pixels step down the grid one row
 * per tick (discrete LED steps, no tweening) and new ones spawn at the
 * top. Nothing ever draws outside the 30×20 glyph bounds.
 *
 * Color comes from the canvas's computed `color` (currentColor), read
 * once per tick — so the parent button's rest/hover/playing ink applies
 * without re-rendering. Each cell also carries a SHADE (2026-08-05,
 * Marco's "less uniform" ask): light cells draw at half alpha, dark
 * cells double-draw so the ink's own alpha compounds (fg-secondary 0.6
 * → ~0.84 effective) — three tones of whatever the current ink is, no
 * color parsing, so it stays correct across themes and hover states.
 *
 * Rendering is snapped to INTEGER DEVICE PIXELS (same pass): the old
 * path scaled fractional CSS coords (x pitch ≈ 4.58px) through the DPR
 * transform, landing every cell on subpixel boundaries — that was the
 * blur. Now the backing store is device-resolution and each rect is
 * rounded, so cell edges are hard.
 *
 * Reduced motion: the seed pattern renders as a static image (ticks
 * still repaint for theme changes, cells don't move).
 */

const W = 30;
const H = 20;
const COLS = 7;
const ROWS = 5;
const CELL = 2.5;
const X_PITCH = (W - CELL) / (COLS - 1);
const Y_PITCH = (H - CELL) / (ROWS - 1);
const TICK_MS = 150;
// Spawn chance per column per tick. Each cell lives ROWS ticks, so the
// expected lit count is COLS × ROWS × p ≈ 16 — the Figma glyph's density.
const SPAWN_P = 0.45;

// Tonal shades, assigned per cell at spawn and kept as it falls.
type Shade = "light" | "base" | "dark";
const LIGHT_ALPHA = 0.5;

function randomShade(): Shade {
  const r = Math.random();
  return r < 0.25 ? "light" : r < 0.5 ? "dark" : "base";
}

type Cell = [col: number, row: number, shade: Shade];

// The Figma arrangement as [col, row] cells (the source group renders
// rotated 180°; this list is post-rotation, i.e. what the mock shows).
// Seed shades cycle deterministically so the reduced-motion static
// render is stable and still shows the tonal variety.
const SEED_SHADES: readonly Shade[] = ["base", "dark", "base", "light"];
const SEED: ReadonlyArray<readonly [number, number]> = [
  [0, 0], [0, 1], [0, 3], [0, 4],
  [1, 2], [1, 3], [1, 4],
  [2, 0], [2, 2], [2, 3],
  [3, 1], [3, 4],
  [4, 4],
  [5, 1], [5, 3],
  [6, 2],
];

export default function PixelRain({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 3);
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);

    let cells: Cell[] = SEED.map(([c, r], i) => [
      c,
      r,
      SEED_SHADES[i % SEED_SHADES.length],
    ]);

    // Device-pixel geometry, snapped once. Rounding the pitch-multiplied
    // positions (not the pitch itself) keeps the grid's overall span
    // exact while giving every cell hard integer edges.
    const cellPx = Math.max(1, Math.round(CELL * dpr));
    const xs = Array.from({ length: COLS }, (_, c) =>
      Math.round(c * X_PITCH * dpr),
    );
    const ys = Array.from({ length: ROWS }, (_, r) =>
      Math.round(r * Y_PITCH * dpr),
    );

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    // Last ink we painted with. Under reduced motion the cells never move,
    // so an unchanged ink means the whole repaint is a no-op — skip it.
    let lastInk: string | null = null;

    const draw = () => {
      const ink = getComputedStyle(canvas).color;
      if (reduceMotion && ink === lastInk) return;
      lastInk = ink;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = ink;
      for (const [c, r, shade] of cells) {
        ctx.globalAlpha = shade === "light" ? LIGHT_ALPHA : 1;
        ctx.fillRect(xs[c], ys[r], cellPx, cellPx);
        // Dark = draw twice: the ink's own alpha composites over itself
        // (0.6 → ~0.84), reading a step stronger than base. With an
        // opaque ink (accent hover/playing) it's a no-op, which is fine
        // — the light cells still carry the variety.
        if (shade === "dark") ctx.fillRect(xs[c], ys[r], cellPx, cellPx);
      }
      ctx.globalAlpha = 1;
    };

    const step = () => {
      // Everything falls one row; cells past the last row despawn.
      const next: Cell[] = [];
      for (const [c, r, shade] of cells) {
        if (r + 1 <= ROWS - 1) next.push([c, r + 1, shade]);
      }
      // Top row is empty after the shift — spawn fresh pixels into it.
      for (let c = 0; c < COLS; c++) {
        if (Math.random() < SPAWN_P) next.push([c, 0, randomShade()]);
      }
      cells = next;
    };

    draw();

    // ── Ticker gating (fixes audit F-29) ──────────────────────────────
    // The 150ms interval used to run forever, on every route, in every
    // tab — setInterval is throttled in background tabs but never
    // suspended, so the glyph kept polling getComputedStyle at ~6.7 Hz
    // behind a hidden tab and after the (in-flow) toolbar had scrolled
    // away. Now the interval only exists while the canvas is both on
    // screen and in a visible tab; it is torn down, not skipped, so a
    // hidden tab costs literally nothing.
    //
    // The tick stays the ink sampler rather than becoming purely
    // event-driven: the trigger button carries `transition: color 150ms`
    // (globals.css `.bio-toolbar-btn` / the toolbar's `transition-colors`),
    // so a one-shot read on hover/theme events would latch the colour
    // from *before* the transition. Polling at the animation cadence is
    // what keeps the hover ink correct, and it costs nothing once gated.
    let id = 0;
    const running = () => id !== 0;
    const start = () => {
      if (running()) return;
      draw();
      id = window.setInterval(() => {
        if (!reduceMotion) step();
        draw(); // repaint so theme/hover ink stays live
      }, TICK_MS);
    };
    const stop = () => {
      if (!running()) return;
      window.clearInterval(id);
      id = 0;
    };

    let onScreen = true;
    const sync = () => (onScreen && !document.hidden ? start() : stop());

    const io =
      typeof IntersectionObserver === "undefined"
        ? null
        : new IntersectionObserver(
            ([entry]) => {
              onScreen = entry.isIntersecting;
              sync();
            },
            { rootMargin: "100px" },
          );
    io?.observe(canvas);
    document.addEventListener("visibilitychange", sync);
    sync();

    return () => {
      stop();
      io?.disconnect();
      document.removeEventListener("visibilitychange", sync);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={className}
      style={{ width: W, height: H, display: "block" }}
    />
  );
}

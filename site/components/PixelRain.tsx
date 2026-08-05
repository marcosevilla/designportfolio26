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
 * without re-rendering. Reduced motion: the seed pattern renders as a
 * static image (ticks still repaint for theme changes, cells don't move).
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

// The Figma arrangement as [col, row] cells (the source group renders
// rotated 180°; this list is post-rotation, i.e. what the mock shows).
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

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.scale(dpr, dpr);

    let cells: Array<[number, number]> = SEED.map(([c, r]) => [c, r]);

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = getComputedStyle(canvas).color;
      for (const [c, r] of cells) {
        ctx.fillRect(c * X_PITCH, r * Y_PITCH, CELL, CELL);
      }
    };

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const step = () => {
      // Everything falls one row; cells past the last row despawn.
      const next: Array<[number, number]> = [];
      for (const [c, r] of cells) {
        if (r + 1 <= ROWS - 1) next.push([c, r + 1]);
      }
      // Top row is empty after the shift — spawn fresh pixels into it.
      for (let c = 0; c < COLS; c++) {
        if (Math.random() < SPAWN_P) next.push([c, 0]);
      }
      cells = next;
    };

    draw();
    const id = window.setInterval(() => {
      if (!reduceMotion) step();
      draw(); // repaint even when static so theme/hover ink stays live
    }, TICK_MS);
    return () => window.clearInterval(id);
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

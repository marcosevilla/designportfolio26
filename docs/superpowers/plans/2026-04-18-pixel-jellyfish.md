# Pixel Jellyfish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a colorful, theme-adaptive pixel-art jellyfish with organic motion to the homepage hero, built on a reusable `<PixelCanvas>` scene primitive for future pixel decorations.

**Architecture:** Canvas 2D rendering. Scene interface (`init` + `draw`) lets future scenes plug into a shared engine. Engine owns the RAF loop, theme subscription, IntersectionObserver pause, reduced-motion scaling. Primitives (noise, verlet chain, raster, dither) are pure and framework-agnostic. Jellyfish scene composes these into bell + oral arms + verlet-physics tentacles with three unrelated motion frequencies.

**Tech Stack:** Next.js 14 App Router, React 18, TypeScript, Canvas 2D, DialKit (existing dep, used in Teaser + CaseStudyList), Tailwind.

**Testing philosophy:** No automated tests (decision locked in spec). Visual verification via `/dev/pixel-lab` + manual theme/reduced-motion cycling. Each task has a `tsc --noEmit` checkpoint and a visual checkpoint where relevant.

**Reference docs:**
- Spec: `docs/superpowers/specs/2026-04-18-pixel-jellyfish-design.md` (read this first)
- Existing canvas pattern: `site/components/BackgroundTexture.tsx` (inline Perlin, CSS-var color reads — reuse patterns)
- Existing DialKit pattern: `site/components/Teaser.tsx` (useDialKit hook)
- Existing dev route pattern: `site/app/dev/type-lab/page.tsx`
- Existing reduced-motion hook: `site/hooks/usePrefersReducedMotion.ts`

**Working directory:** All commands run from `site/` unless stated. `npm run dev` must stay working after every task; if it breaks, stop and revert.

**Commit discipline:** One commit per task. Never skip the commit step.

---

## File Structure (locked during plan)

**New files:**
```
site/components/pixel-canvas/
├── PixelCanvas.tsx          React wrapper (mounts, RAF, theme, IO, reduced-motion)
├── engine.ts                Pure frame-loop driver
├── palette.ts               readPalette() + color utilities
├── types.ts                 Scene, SceneState, FrameCtx, Palette
└── primitives/
    ├── noise.ts             Simplex/Perlin 2D
    ├── verlet-chain.ts      Verlet rope (Jakobsen integration)
    ├── raster.ts            Pixel-grid rect/disc/line helpers
    └── dither.ts            Bayer 4×4 threshold shading
└── scenes/
    └── jellyfish.ts         Bell + oral arms + tentacles + motion

site/app/dev/pixel-lab/
└── page.tsx                 Dev route with DialKit sliders + side-by-side preview
```

**Modified files:**
- `site/components/Hero.tsx` — insert `<PixelCanvas>` block above name label row

**Untouched:** `BackgroundTexture.tsx`, `HomeLayout.tsx`, typography, theme system, case studies.

---

## Task 1: Types, palette, and library entrypoint

**Files:**
- Create: `site/components/pixel-canvas/types.ts`
- Create: `site/components/pixel-canvas/palette.ts`

- [ ] **Step 1: Write `types.ts`**

```ts
// site/components/pixel-canvas/types.ts

export type Palette = {
  accent: string;      // rgb() string from --color-accent
  accentSoft: string;  // rgb() blend of accent toward bg at 55%
  fgTertiary: string;  // rgb() from --color-fg-tertiary
  bg: string;          // rgb() from --color-bg
};

export type FrameCtx = {
  t: number;              // seconds since mount, paused when off-screen / reduced-motion scaled
  dt: number;             // seconds since last frame, clamped to ≤ 1/30
  palette: Palette;
  reducedMotion: boolean;
  width: number;          // logical canvas width (not CSS px)
  height: number;         // logical canvas height
};

export type Scene<TState = unknown> = {
  id: string;
  init(config: { width: number; height: number; seed?: number }): TState;
  draw(ctx: CanvasRenderingContext2D, state: TState, frame: FrameCtx): void;
};
```

- [ ] **Step 2: Write `palette.ts`**

```ts
// site/components/pixel-canvas/palette.ts
import type { Palette } from "./types";

function rgbFromCssVar(varName: string, fallback: string): string {
  if (typeof window === "undefined") return fallback;
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue(varName)
    .trim();
  return raw || fallback;
}

function parseRgb(s: string): { r: number; g: number; b: number } {
  const hexMatch = s.match(/^#([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
  if (hexMatch) {
    return {
      r: parseInt(hexMatch[1], 16),
      g: parseInt(hexMatch[2], 16),
      b: parseInt(hexMatch[3], 16),
    };
  }
  const rgbMatch = s.match(/rgba?\((\d+)[,\s]+(\d+)[,\s]+(\d+)/);
  if (rgbMatch) {
    return {
      r: parseInt(rgbMatch[1], 10),
      g: parseInt(rgbMatch[2], 10),
      b: parseInt(rgbMatch[3], 10),
    };
  }
  return { r: 136, g: 136, b: 136 };
}

function blend(a: string, b: string, t: number): string {
  const ca = parseRgb(a);
  const cb = parseRgb(b);
  const r = Math.round(ca.r * (1 - t) + cb.r * t);
  const g = Math.round(ca.g * (1 - t) + cb.g * t);
  const bl = Math.round(ca.b * (1 - t) + cb.b * t);
  return `rgb(${r}, ${g}, ${bl})`;
}

export function readPalette(): Palette {
  const accent = rgbFromCssVar("--color-accent", "#B5651D");
  const fgTertiary = rgbFromCssVar("--color-fg-tertiary", "rgba(17,17,17,0.35)");
  const bg = rgbFromCssVar("--color-bg", "#ffffff");
  const accentSoft = blend(accent, bg, 0.55);
  return { accent, accentSoft, fgTertiary, bg };
}

export function withAlpha(rgb: string, alpha: number): string {
  const { r, g, b } = parseRgb(rgb);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
```

- [ ] **Step 3: Verify tsc passes**

Run: `cd site && npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
cd "/Users/marcosevilla/Developer/portfolio 2026"
git add site/components/pixel-canvas/types.ts site/components/pixel-canvas/palette.ts
git commit -m "Add pixel-canvas types and palette reader"
```

---

## Task 2: Noise, raster, and dither primitives

**Files:**
- Create: `site/components/pixel-canvas/primitives/noise.ts`
- Create: `site/components/pixel-canvas/primitives/raster.ts`
- Create: `site/components/pixel-canvas/primitives/dither.ts`

- [ ] **Step 1: Write `noise.ts`**

```ts
// site/components/pixel-canvas/primitives/noise.ts
// 2D Perlin noise. Adapted from the inline version in BackgroundTexture.tsx.
// Pure function, seedable via createNoise2D().

const PERM = [151,160,137,91,90,15,131,13,201,95,96,53,194,233,7,225,140,36,103,30,69,142,8,99,37,240,21,10,23,190,6,148,247,120,234,75,0,26,197,62,94,252,219,203,117,35,11,32,57,177,33,88,237,149,56,87,174,20,125,136,171,168,68,175,74,165,71,134,139,48,27,166,77,146,158,231,83,111,229,122,60,211,133,230,220,105,92,41,55,46,245,40,244,102,143,54,65,25,63,161,1,216,80,73,209,76,132,187,208,89,18,169,200,196,135,130,116,188,159,86,164,100,109,198,173,186,3,64,52,217,226,250,124,123,5,202,38,147,118,126,255,82,85,212,207,206,59,227,47,16,58,17,182,189,28,42,223,183,170,213,119,248,152,2,44,154,163,70,221,153,101,155,167,43,172,9,129,22,39,253,19,98,108,110,79,113,224,232,178,185,112,104,218,246,97,228,251,34,242,193,238,210,144,12,191,179,162,241,81,51,145,235,249,14,239,107,49,192,214,31,181,199,106,157,184,84,204,176,115,121,50,45,127,4,150,254,138,236,205,93,222,114,67,29,24,72,243,141,128,195,78,66,215,61,156,180];

export function createNoise2D(seed = 0): (x: number, y: number) => number {
  // Seeded permutation via Fisher-Yates style shuffle of PERM
  const p = new Array(512);
  const base = [...PERM];
  if (seed !== 0) {
    // Deterministic shuffle from seed
    let s = seed >>> 0;
    for (let i = base.length - 1; i > 0; i--) {
      s = (s * 1664525 + 1013904223) >>> 0;
      const j = s % (i + 1);
      [base[i], base[j]] = [base[j], base[i]];
    }
  }
  for (let i = 0; i < 256; i++) p[256 + i] = p[i] = base[i];

  const fade = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);
  const lerp = (t: number, a: number, b: number) => a + t * (b - a);
  const grad = (hash: number, x: number, y: number) => {
    const h = hash & 3;
    const u = h < 2 ? x : y;
    const v = h < 2 ? y : x;
    return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
  };

  return (x: number, y: number) => {
    const X = Math.floor(x) & 255;
    const Y = Math.floor(y) & 255;
    x -= Math.floor(x);
    y -= Math.floor(y);
    const u = fade(x);
    const v = fade(y);
    const A = p[X] + Y;
    const B = p[X + 1] + Y;
    return lerp(
      v,
      lerp(u, grad(p[A], x, y), grad(p[B], x - 1, y)),
      lerp(u, grad(p[A + 1], x, y - 1), grad(p[B + 1], x - 1, y - 1))
    );
  };
}
```

- [ ] **Step 2: Write `raster.ts`**

```ts
// site/components/pixel-canvas/primitives/raster.ts
// Pixel-grid drawing helpers. All inputs rounded to integer pixels.

export function pixel(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  color: string
): void {
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(x), Math.round(y), 1, 1);
}

export function rect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  color: string
): void {
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
}

// Filled disc using midpoint circle, pixel-perfect.
export function disc(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  color: string
): void {
  ctx.fillStyle = color;
  const icx = Math.round(cx);
  const icy = Math.round(cy);
  const ir = Math.round(r);
  for (let dy = -ir; dy <= ir; dy++) {
    const span = Math.round(Math.sqrt(ir * ir - dy * dy));
    ctx.fillRect(icx - span, icy + dy, span * 2 + 1, 1);
  }
}

// Bresenham pixel line.
export function line(
  ctx: CanvasRenderingContext2D,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  color: string
): void {
  ctx.fillStyle = color;
  let ax = Math.round(x0);
  let ay = Math.round(y0);
  const bx = Math.round(x1);
  const by = Math.round(y1);
  const dx = Math.abs(bx - ax);
  const dy = -Math.abs(by - ay);
  const sx = ax < bx ? 1 : -1;
  const sy = ay < by ? 1 : -1;
  let err = dx + dy;
  while (true) {
    ctx.fillRect(ax, ay, 1, 1);
    if (ax === bx && ay === by) break;
    const e2 = 2 * err;
    if (e2 >= dy) { err += dy; ax += sx; }
    if (e2 <= dx) { err += dx; ay += sy; }
  }
}
```

- [ ] **Step 3: Write `dither.ts`**

```ts
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
```

- [ ] **Step 4: Verify tsc passes**

Run: `cd site && npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add site/components/pixel-canvas/primitives/
git commit -m "Add pixel-canvas primitives: noise, raster, dither"
```

---

## Task 3: Verlet chain primitive

**Files:**
- Create: `site/components/pixel-canvas/primitives/verlet-chain.ts`

- [ ] **Step 1: Write `verlet-chain.ts`**

```ts
// site/components/pixel-canvas/primitives/verlet-chain.ts
// Jakobsen-style verlet rope with pinned root node.

export type VerletNode = {
  x: number;
  y: number;
  px: number; // previous x
  py: number; // previous y
  pinned: boolean;
};

export type VerletChain = {
  nodes: VerletNode[];
  segmentLength: number;
  stiffness: number; // 0..1, 1 = fully rigid constraint (applied over multiple iterations)
};

export function createChain(
  rootX: number,
  rootY: number,
  count: number,
  segmentLength: number,
  stiffness = 0.94
): VerletChain {
  const nodes: VerletNode[] = [];
  for (let i = 0; i < count; i++) {
    nodes.push({
      x: rootX,
      y: rootY + i * segmentLength,
      px: rootX,
      py: rootY + i * segmentLength,
      pinned: i === 0,
    });
  }
  return { nodes, segmentLength, stiffness };
}

export function setRoot(chain: VerletChain, x: number, y: number): void {
  const root = chain.nodes[0];
  root.x = x;
  root.y = y;
  root.px = x;
  root.py = y;
}

// One verlet step: integrate velocity + apply per-node force.
// force: (index, node) => { fx, fy } — e.g. gravity + noise.
export function step(
  chain: VerletChain,
  dt: number,
  force: (i: number, node: VerletNode) => { fx: number; fy: number }
): void {
  // Clamp dt to avoid explosion on tab-switch catch-up
  const d = Math.min(dt, 1 / 30);
  const damping = 0.98;
  for (let i = 0; i < chain.nodes.length; i++) {
    const n = chain.nodes[i];
    if (n.pinned) continue;
    const { fx, fy } = force(i, n);
    const vx = (n.x - n.px) * damping + fx * d * d;
    const vy = (n.y - n.py) * damping + fy * d * d;
    n.px = n.x;
    n.py = n.y;
    n.x += vx;
    n.y += vy;
  }
}

// Constrain each pair to segmentLength. Run multiple iterations for stiffness.
export function constrain(chain: VerletChain, iterations = 4): void {
  for (let k = 0; k < iterations; k++) {
    for (let i = 0; i < chain.nodes.length - 1; i++) {
      const a = chain.nodes[i];
      const b = chain.nodes[i + 1];
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1e-6;
      const diff = (dist - chain.segmentLength) / dist;
      const pull = diff * chain.stiffness * 0.5;
      if (!a.pinned) {
        a.x += dx * pull;
        a.y += dy * pull;
      }
      if (!b.pinned) {
        b.x -= dx * pull;
        b.y -= dy * pull;
      }
    }
  }
}
```

- [ ] **Step 2: Verify tsc passes**

Run: `cd site && npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add site/components/pixel-canvas/primitives/verlet-chain.ts
git commit -m "Add verlet chain primitive"
```

---

## Task 4: Engine (RAF loop with reduced-motion + pause)

**Files:**
- Create: `site/components/pixel-canvas/engine.ts`

- [ ] **Step 1: Write `engine.ts`**

```ts
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
```

- [ ] **Step 2: Verify tsc passes**

Run: `cd site && npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add site/components/pixel-canvas/engine.ts
git commit -m "Add pixel-canvas engine (RAF loop)"
```

---

## Task 5: PixelCanvas React component

**Files:**
- Create: `site/components/pixel-canvas/PixelCanvas.tsx`

- [ ] **Step 1: Write `PixelCanvas.tsx`**

```tsx
// site/components/pixel-canvas/PixelCanvas.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { startEngine } from "./engine";
import { readPalette } from "./palette";
import type { Palette, Scene } from "./types";

type Props = {
  scene: Scene<any>;
  widthCssPx: number;
  heightCssPx: number;
  pixelScale?: number; // integer upscale; logical px = css / scale
  className?: string;
  style?: React.CSSProperties;
};

export default function PixelCanvas({
  scene,
  widthCssPx,
  heightCssPx,
  pixelScale = 2,
  className,
  style,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const paletteRef = useRef<Palette | null>(null);
  const reducedMotionRef = useRef(false);
  const pausedRef = useRef(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const logicalW = Math.round(widthCssPx / pixelScale);
    const logicalH = Math.round(heightCssPx / pixelScale);
    canvas.width = logicalW;
    canvas.height = logicalH;
    ctx.imageSmoothingEnabled = false;

    // Palette
    paletteRef.current = readPalette();
    const themeObserver = new MutationObserver(() => {
      paletteRef.current = readPalette();
    });
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "data-theme"],
    });

    // Reduced motion
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    reducedMotionRef.current = mql.matches;
    const onReducedChange = (e: MediaQueryListEvent) => {
      reducedMotionRef.current = e.matches;
    };
    mql.addEventListener("change", onReducedChange);

    // IntersectionObserver — pause when off-screen
    let intersecting = true;
    const io = new IntersectionObserver(
      ([entry]) => { intersecting = entry.isIntersecting; },
      { threshold: 0.1 }
    );
    io.observe(canvas);

    // Visibility API — pause on tab switch
    const onVisibility = () => {
      pausedRef.current = document.hidden || !intersecting;
    };
    document.addEventListener("visibilitychange", onVisibility);

    const stop = startEngine({
      ctx,
      scene,
      width: logicalW,
      height: logicalH,
      getPalette: () => paletteRef.current!,
      getReducedMotion: () => reducedMotionRef.current,
      getPaused: () => document.hidden || !intersecting,
    });

    return () => {
      stop();
      themeObserver.disconnect();
      mql.removeEventListener("change", onReducedChange);
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [mounted, scene, widthCssPx, heightCssPx, pixelScale]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={className}
      style={{
        width: widthCssPx,
        height: heightCssPx,
        imageRendering: "pixelated",
        pointerEvents: "none",
        ...style,
      }}
    />
  );
}
```

- [ ] **Step 2: Verify tsc passes**

Run: `cd site && npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add site/components/pixel-canvas/PixelCanvas.tsx
git commit -m "Add PixelCanvas React wrapper"
```

---

## Task 6: Jellyfish scene — bell shape (static)

Goal: get a visible, non-animated bell on screen so we can confirm the rendering pipeline end-to-end before layering motion.

**Files:**
- Create: `site/components/pixel-canvas/scenes/jellyfish.ts`

- [ ] **Step 1: Write the scene with bell only (no pulse yet)**

```ts
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
```

- [ ] **Step 2: Verify tsc passes**

Run: `cd site && npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add site/components/pixel-canvas/scenes/jellyfish.ts
git commit -m "Add jellyfish scene: static bell shape"
```

---

## Task 7: Bell pulse + variable energy (Poisson-sampled)

**Files:**
- Modify: `site/components/pixel-canvas/scenes/jellyfish.ts`

- [ ] **Step 1: Update scene to add pulse state and motion**

Replace the contents of `scenes/jellyfish.ts` with:

```ts
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

  for (let y = cy - effectiveHeight; y <= cy + 2; y++) {
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
```

- [ ] **Step 2: Verify tsc passes**

Run: `cd site && npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add site/components/pixel-canvas/scenes/jellyfish.ts
git commit -m "Add bell pulse with Poisson-sampled variable energy"
```

---

## Task 8: /dev/pixel-lab route (minimum viable — renders jellyfish)

Goal: get a dev page showing the jellyfish at both breakpoints so we can visually verify Tasks 1–7 before adding tentacles. No DialKit yet.

**Files:**
- Create: `site/app/dev/pixel-lab/page.tsx`

- [ ] **Step 1: Write the page**

```tsx
// site/app/dev/pixel-lab/page.tsx
"use client";

import PixelCanvas from "@/components/pixel-canvas/PixelCanvas";
import { createJellyfishScene } from "@/components/pixel-canvas/scenes/jellyfish";
import { useMemo } from "react";

export default function PixelLabPage() {
  const scene = useMemo(() => createJellyfishScene(), []);

  return (
    <div style={{ padding: 40, display: "flex", flexDirection: "column", gap: 32 }}>
      <h1 style={{ fontSize: 18, fontWeight: 500 }}>Pixel Lab — Jellyfish</h1>

      <div style={{ display: "flex", gap: 48, alignItems: "flex-start" }}>
        <div>
          <div style={{ fontSize: 11, opacity: 0.6, marginBottom: 8 }}>Desktop — 200×280 CSS (100×140 logical @ 2×)</div>
          <div style={{ border: "1px dashed var(--color-border)" }}>
            <PixelCanvas scene={scene} widthCssPx={200} heightCssPx={280} pixelScale={2} />
          </div>
        </div>
        <div>
          <div style={{ fontSize: 11, opacity: 0.6, marginBottom: 8 }}>Mobile — 140×196 CSS (70×98 logical @ 2×)</div>
          <div style={{ border: "1px dashed var(--color-border)" }}>
            <PixelCanvas scene={scene} widthCssPx={140} heightCssPx={196} pixelScale={2} />
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify tsc passes**

Run: `cd site && npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Verify visually**

Run `npm run dev` from `site/` if not already running. Open `http://localhost:3000/dev/pixel-lab`.

Expected:
- Two bells visible side-by-side (desktop + mobile)
- Each bell pulses in and out (~0.6 Hz)
- Radial ribs visible on the dome
- Dithered shading gives a pixel-shaded look
- Colors match current theme's `--color-accent`
- Cycle through themes in the theme palette — bell colors update

If the bell is invisible: check logical dimensions (logicalW/H), check palette returns non-empty strings, check canvas is sized in CSS.

- [ ] **Step 4: Commit**

```bash
git add site/app/dev/pixel-lab/page.tsx
git commit -m "Add /dev/pixel-lab route with jellyfish preview"
```

---

## Task 9: Oral arms (frilly strands under bell)

**Files:**
- Modify: `site/components/pixel-canvas/scenes/jellyfish.ts`

- [ ] **Step 1: Add oral arms to the scene**

In `scenes/jellyfish.ts`:

1. Extend `JellyfishConfig` with:
```ts
  oralArmCount: number;
  oralArmLength: number;
  oralArmLag: number; // seconds — how much oral arm trails the bell pulse
```

2. Extend `DEFAULT_CONFIG`:
```ts
  oralArmCount: 3,
  oralArmLength: 28,
  oralArmLag: 0.08,
```

3. Add `drawOralArms` function after `drawBell`:

```ts
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
    const tArm = (i / (oralArmCount - 1)) * 2 - 1; // -1..1 (center strands distributed)
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
```

4. Track lag-pulse in state:

```ts
type State = {
  config: JellyfishConfig;
  nextVarianceEventAt: number;
  activeEvent: PulseEvent | null;
  pulseHistory: Array<{ t: number; value: number }>; // for lag sampling
};
```

In `init`:
```ts
init: () => ({
  config: { ...config },
  nextVarianceEventAt: sampleExponential(config.varianceIntervalAvg),
  activeEvent: null,
  pulseHistory: [],
}),
```

In `draw`:
```ts
draw: (ctx, state, frame) => {
  const pulse = pulseAt(frame.t, state);
  // Track pulse history for lag
  state.pulseHistory.push({ t: frame.t, value: pulse });
  // Trim history older than 1 second
  while (state.pulseHistory.length > 60) state.pulseHistory.shift();
  // Lookup lagged pulse
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
```

- [ ] **Step 2: Verify tsc passes**

Run: `cd site && npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Visual check**

Reload `/dev/pixel-lab`. Expected: 3 short wiggling strands under each bell, contracting slightly after the bell pulse.

- [ ] **Step 4: Commit**

```bash
git add site/components/pixel-canvas/scenes/jellyfish.ts
git commit -m "Add jellyfish oral arms with lagged bell follow"
```

---

## Task 10: Trailing tentacles (verlet chains)

**Files:**
- Modify: `site/components/pixel-canvas/scenes/jellyfish.ts`

- [ ] **Step 1: Add tentacle state and rendering**

In `scenes/jellyfish.ts`:

1. Add imports:
```ts
import { createChain, setRoot, step, constrain, type VerletChain } from "../primitives/verlet-chain";
import { createNoise2D } from "../primitives/noise";
import { line } from "../primitives/raster";
```

2. Extend `JellyfishConfig`:
```ts
  tentacleCount: number;
  tentacleBaseLength: number;    // in logical px
  tentacleStiffness: number;     // 0..1
  tentacleGravity: number;
  tentacleNoiseScale: number;
  tentacleNoiseSpeed: number;
```

3. Extend `DEFAULT_CONFIG`:
```ts
  tentacleCount: 6,
  tentacleBaseLength: 90,
  tentacleStiffness: 0.94,
  tentacleGravity: 0.04,
  tentacleNoiseScale: 1.3,
  tentacleNoiseSpeed: 0.25,
```

4. Add to State:
```ts
type State = {
  config: JellyfishConfig;
  nextVarianceEventAt: number;
  activeEvent: PulseEvent | null;
  pulseHistory: Array<{ t: number; value: number }>;
  tentacles: Array<{ chain: VerletChain; lengthScale: number; opacity: number }>;
  noise: (x: number, y: number) => number;
};
```

5. Update `init`:
```ts
init: ({ seed = 1 }) => {
  const noise = createNoise2D(seed);
  const lengthScales = [1.0, 0.65, 1.1, 0.75, 0.95, 0.55];
  const tentacles: State["tentacles"] = [];
  // Distribute roots across bell skirt
  for (let i = 0; i < config.tentacleCount; i++) {
    const scale = lengthScales[i % lengthScales.length];
    const len = config.tentacleBaseLength * scale;
    const nodeCount = 10;
    const segLen = len / (nodeCount - 1);
    const chain = createChain(0, 0, nodeCount, segLen, config.tentacleStiffness);
    // 2 of 6 tentacles render "in back" at 60% opacity
    const opacity = (i === 1 || i === 4) ? 0.6 : 1.0;
    tentacles.push({ chain, lengthScale: scale, opacity });
  }
  return {
    config: { ...config },
    nextVarianceEventAt: sampleExponential(config.varianceIntervalAvg),
    activeEvent: null,
    pulseHistory: [],
    tentacles,
    noise,
  };
},
```

6. Add `updateTentacles` + `drawTentacles`:

```ts
function tentacleRootPosition(
  state: State,
  frame: FrameCtx,
  index: number,
  pulse: number
): { x: number; y: number } {
  const { bellRadius, bellCenterY, tentacleCount } = state.config;
  const cx = frame.width / 2;
  // Distribute across bottom arc: angle from -70° to +70° around bell skirt
  const tArc = index / Math.max(1, tentacleCount - 1); // 0..1
  const angle = -70 + tArc * 140; // degrees, -70..+70
  const rad = (angle * Math.PI) / 180;
  // Bell skirt offset (y lowers slightly during pulse to keep roots attached)
  const skirtY = bellCenterY + Math.cos(rad) * 2 + (1 - pulse) * 0; // y = cy + cos(angle)*small
  // Actually: roots live at the bell opening, which is at cy + ~bellHeight * 0.15 typically.
  // Simpler: place roots on an arc just below center.
  const rootX = cx + Math.sin(rad) * bellRadius * 0.85;
  const rootY = bellCenterY + Math.abs(Math.cos(rad)) * 2 + 4;
  return { x: rootX, y: rootY };
}

function updateTentacles(state: State, frame: FrameCtx, pulse: number): void {
  const { tentacleGravity, tentacleNoiseScale, tentacleNoiseSpeed } = state.config;
  for (let i = 0; i < state.tentacles.length; i++) {
    const { chain } = state.tentacles[i];
    const root = tentacleRootPosition(state, frame, i, pulse);
    // Pulse yank: root lifts slightly during contraction
    const yankY = root.y - pulse * 3;
    setRoot(chain, root.x, yankY);

    step(chain, frame.dt, (nodeIndex) => {
      // Gravity + lateral drift noise
      const noiseX = state.noise(
        frame.t * tentacleNoiseSpeed,
        (i * 1.3) + nodeIndex * 0.15
      );
      return {
        fx: noiseX * 0.08 * tentacleNoiseScale,
        fy: tentacleGravity,
      };
    });
    constrain(chain, 4);
  }
}

function drawTentacles(
  ctx: CanvasRenderingContext2D,
  state: State,
  frame: FrameCtx
): void {
  const { accent, accentSoft } = frame.palette;
  for (const { chain, opacity } of state.tentacles) {
    const color = opacity < 1 ? withAlpha(accentSoft, opacity) : accent;
    for (let i = 0; i < chain.nodes.length - 1; i++) {
      const a = chain.nodes[i];
      const b = chain.nodes[i + 1];
      // Shade darker near bell, lighter near tip
      const tSeg = i / (chain.nodes.length - 1); // 0..1
      const segColor = tSeg < 0.5
        ? (opacity < 1 ? withAlpha(accent, opacity) : accent)
        : color;
      line(ctx, a.x, a.y, b.x, b.y, segColor);
    }
  }
}
```

7. Wire into `draw`:

```ts
draw: (ctx, state, frame) => {
  const pulse = pulseAt(frame.t, state);
  state.pulseHistory.push({ t: frame.t, value: pulse });
  while (state.pulseHistory.length > 60) state.pulseHistory.shift();
  const lagTarget = frame.t - state.config.oralArmLag;
  let lagPulse = pulse;
  for (let i = state.pulseHistory.length - 1; i >= 0; i--) {
    if (state.pulseHistory[i].t <= lagTarget) {
      lagPulse = state.pulseHistory[i].value;
      break;
    }
  }

  updateTentacles(state, frame, pulse);

  // Draw order: back tentacles first (low opacity), bell, front tentacles, oral arms
  // Simplification: draw all tentacles before bell so bell overlaps their roots cleanly.
  drawTentacles(ctx, state, frame);
  drawBell(ctx, state, frame, pulse);
  drawOralArms(ctx, state, frame, pulse, lagPulse);
},
```

- [ ] **Step 2: Verify tsc passes**

Run: `cd site && npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Visual check**

Reload `/dev/pixel-lab`. Expected: 6 tentacles trailing from bell, varied lengths, drifting gently. Some fainter (depth). Should not look rigid or pendulum-like.

If tentacles are stiff: `tentacleStiffness` too high (try 0.88). If they explode: `tentacleGravity` too high. If they don't move: noise force too low.

- [ ] **Step 4: Commit**

```bash
git add site/components/pixel-canvas/scenes/jellyfish.ts
git commit -m "Add verlet-physics trailing tentacles"
```

---

## Task 11: Body bob (subtle hover)

**Files:**
- Modify: `site/components/pixel-canvas/scenes/jellyfish.ts`

- [ ] **Step 1: Apply body bob via context translate**

In `scenes/jellyfish.ts`:

1. Extend `JellyfishConfig`:
```ts
  bobAmplitude: number; // px
```

2. Extend `DEFAULT_CONFIG`:
```ts
  bobAmplitude: 4,
```

3. Wrap the entire `draw` body in a translate, using noise sampled at two independent coordinates:

```ts
draw: (ctx, state, frame) => {
  const pulse = pulseAt(frame.t, state);
  // ... existing lagPulse calc ...
  updateTentacles(state, frame, pulse);

  const bobX = state.noise(frame.t * 0.15, 0) * state.config.bobAmplitude;
  const bobY = state.noise(frame.t * 0.12, 99) * state.config.bobAmplitude * 0.75;

  ctx.save();
  ctx.translate(Math.round(bobX), Math.round(bobY));
  drawTentacles(ctx, state, frame);
  drawBell(ctx, state, frame, pulse);
  drawOralArms(ctx, state, frame, pulse, lagPulse);
  ctx.restore();
},
```

- [ ] **Step 2: Verify tsc passes**

Run: `cd site && npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Visual check**

Reload `/dev/pixel-lab`. Expected: whole jellyfish gently bobs x/y, never drifts more than 5–8px.

- [ ] **Step 4: Commit**

```bash
git add site/components/pixel-canvas/scenes/jellyfish.ts
git commit -m "Add subtle body bob to jellyfish"
```

---

## Task 12: DialKit tuning UI at /dev/pixel-lab

**Files:**
- Modify: `site/app/dev/pixel-lab/page.tsx`

- [ ] **Step 1: Replace the page with a DialKit-driven version**

```tsx
// site/app/dev/pixel-lab/page.tsx
"use client";

import { useDialKit } from "dialkit";
import { useMemo, useState } from "react";
import PixelCanvas from "@/components/pixel-canvas/PixelCanvas";
import { createJellyfishScene, DEFAULT_CONFIG } from "@/components/pixel-canvas/scenes/jellyfish";

export default function PixelLabPage() {
  const dials = useDialKit("Jellyfish", {
    pulseFrequency: [DEFAULT_CONFIG.pulseFrequency, 0.3, 1.2],
    pulseAmplitude: [DEFAULT_CONFIG.pulseAmplitude, 0.04, 0.2],
    varianceIntervalAvg: [DEFAULT_CONFIG.varianceIntervalAvg, 4, 12],
    varianceMultiplier: [DEFAULT_CONFIG.varianceMultiplier, 1.2, 2.5],
    tentacleCount: [DEFAULT_CONFIG.tentacleCount, 4, 8, 1],
    tentacleBaseLength: [DEFAULT_CONFIG.tentacleBaseLength, 60, 120],
    tentacleStiffness: [DEFAULT_CONFIG.tentacleStiffness, 0.85, 0.99],
    tentacleGravity: [DEFAULT_CONFIG.tentacleGravity, 0.02, 0.1],
    tentacleNoiseScale: [DEFAULT_CONFIG.tentacleNoiseScale, 0.5, 3.0],
    tentacleNoiseSpeed: [DEFAULT_CONFIG.tentacleNoiseSpeed, 0.1, 0.6],
    bobAmplitude: [DEFAULT_CONFIG.bobAmplitude, 0, 8],
    ribs: [DEFAULT_CONFIG.ribs, 6, 14, 1],
    pixelScale: [2, 1, 4, 1],
  });

  const scene = useMemo(() => {
    return createJellyfishScene({
      ...DEFAULT_CONFIG,
      pulseFrequency: dials.pulseFrequency,
      pulseAmplitude: dials.pulseAmplitude,
      varianceIntervalAvg: dials.varianceIntervalAvg,
      varianceMultiplier: dials.varianceMultiplier,
      tentacleCount: Math.round(dials.tentacleCount),
      tentacleBaseLength: dials.tentacleBaseLength,
      tentacleStiffness: dials.tentacleStiffness,
      tentacleGravity: dials.tentacleGravity,
      tentacleNoiseScale: dials.tentacleNoiseScale,
      tentacleNoiseSpeed: dials.tentacleNoiseSpeed,
      bobAmplitude: dials.bobAmplitude,
      ribs: Math.round(dials.ribs),
    });
    // Remount scene when any config changes. Re-creating scene is cheap.
  }, [
    dials.pulseFrequency, dials.pulseAmplitude,
    dials.varianceIntervalAvg, dials.varianceMultiplier,
    dials.tentacleCount, dials.tentacleBaseLength,
    dials.tentacleStiffness, dials.tentacleGravity,
    dials.tentacleNoiseScale, dials.tentacleNoiseSpeed,
    dials.bobAmplitude, dials.ribs,
  ]);

  const scale = Math.round(dials.pixelScale);

  const copyConfig = () => {
    const snippet = `{
  pulseFrequency: ${dials.pulseFrequency.toFixed(3)},
  pulseAmplitude: ${dials.pulseAmplitude.toFixed(3)},
  varianceIntervalAvg: ${dials.varianceIntervalAvg.toFixed(2)},
  varianceMultiplier: ${dials.varianceMultiplier.toFixed(2)},
  tentacleCount: ${Math.round(dials.tentacleCount)},
  tentacleBaseLength: ${dials.tentacleBaseLength.toFixed(1)},
  tentacleStiffness: ${dials.tentacleStiffness.toFixed(3)},
  tentacleGravity: ${dials.tentacleGravity.toFixed(3)},
  tentacleNoiseScale: ${dials.tentacleNoiseScale.toFixed(2)},
  tentacleNoiseSpeed: ${dials.tentacleNoiseSpeed.toFixed(2)},
  bobAmplitude: ${dials.bobAmplitude.toFixed(1)},
  ribs: ${Math.round(dials.ribs)},
}`;
    navigator.clipboard.writeText(snippet);
  };

  return (
    <div style={{ padding: 40, display: "flex", flexDirection: "column", gap: 32 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <h1 style={{ fontSize: 18, fontWeight: 500 }}>Pixel Lab — Jellyfish</h1>
        <button
          onClick={copyConfig}
          style={{ fontSize: 12, padding: "6px 10px", border: "1px solid var(--color-border)", background: "var(--color-surface-raised)" }}
        >
          Copy config
        </button>
      </div>

      <div style={{ display: "flex", gap: 48, alignItems: "flex-start" }}>
        <div>
          <div style={{ fontSize: 11, opacity: 0.6, marginBottom: 8 }}>Desktop — 200×280 CSS</div>
          <div style={{ border: "1px dashed var(--color-border)" }}>
            <PixelCanvas scene={scene} widthCssPx={200} heightCssPx={280} pixelScale={scale} />
          </div>
        </div>
        <div>
          <div style={{ fontSize: 11, opacity: 0.6, marginBottom: 8 }}>Mobile — 140×196 CSS</div>
          <div style={{ border: "1px dashed var(--color-border)" }}>
            <PixelCanvas scene={scene} widthCssPx={140} heightCssPx={196} pixelScale={scale} />
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify tsc passes**

Run: `cd site && npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Visual check**

Reload `/dev/pixel-lab`. Expected: DialKit panel appears, all sliders work live. "Copy config" button copies a TS snippet. Both previews (desktop + mobile) stay in sync.

Iterate the sliders until Marco smiles. Record the final values, paste into `DEFAULT_CONFIG` in `scenes/jellyfish.ts` (do this in Task 13 after tuning is done).

- [ ] **Step 4: Commit**

```bash
git add site/app/dev/pixel-lab/page.tsx
git commit -m "Add DialKit tuning UI to pixel-lab"
```

---

## Task 13: Lock tuned defaults + add preset buttons

Goal: after live tuning, bake the values Marco likes into `DEFAULT_CONFIG` so the scene has sensible defaults for production use. Also add preset buttons for Calm/Alert so future iteration is easier.

**Files:**
- Modify: `site/components/pixel-canvas/scenes/jellyfish.ts`
- Modify: `site/app/dev/pixel-lab/page.tsx`

- [ ] **Step 1: Marco tunes values at `/dev/pixel-lab`, clicks "Copy config," and pastes the snippet into `DEFAULT_CONFIG`**

Replace the `DEFAULT_CONFIG` object in `scenes/jellyfish.ts` with the tuned values.

- [ ] **Step 2: Add "Very calm" and "Alert" preset buttons**

In `page.tsx`, add two buttons that call `dials.set({...})` with preset values. Example:

```tsx
const applyPreset = (name: "calm" | "alert" | "default") => {
  const presets = {
    default: DEFAULT_CONFIG,
    calm:    { ...DEFAULT_CONFIG, pulseFrequency: 0.35, pulseAmplitude: 0.08, tentacleNoiseScale: 0.7 },
    alert:   { ...DEFAULT_CONFIG, pulseFrequency: 1.0, pulseAmplitude: 0.17, tentacleNoiseScale: 2.0 },
  };
  const p = presets[name];
  Object.keys(p).forEach((k) => {
    if (k in dials) (dials as any)[k] = (p as any)[k];
  });
};
```

(If DialKit's API doesn't expose a programmatic setter, skip this step — the "Copy config" button is sufficient. Verify by checking `node_modules/dialkit` for the exported API surface if unsure.)

- [ ] **Step 3: Verify tsc passes**

Run: `cd site && npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 4: Visual check**

Reload `/dev/pixel-lab`. Default values should match what Marco tuned. Preset buttons (if implemented) shift sliders.

- [ ] **Step 5: Commit**

```bash
git add site/components/pixel-canvas/scenes/jellyfish.ts site/app/dev/pixel-lab/page.tsx
git commit -m "Lock tuned jellyfish defaults and add presets"
```

---

## Task 14: Homepage hero integration

**Files:**
- Modify: `site/components/Hero.tsx`

- [ ] **Step 1: Read current Hero.tsx to find insertion point**

Run: `Read site/components/Hero.tsx` and locate the JSX block that renders the ✸ + "Marco Sevilla" name label row.

- [ ] **Step 2: Insert PixelCanvas above the name label row**

Add near the top of Hero's imports:
```tsx
import PixelCanvas from "./pixel-canvas/PixelCanvas";
import { createJellyfishScene } from "./pixel-canvas/scenes/jellyfish";
```

Inside the component body (above the return, or in a `useMemo` near other memoized values):
```tsx
const jellyfishScene = useMemo(() => createJellyfishScene(), []);
```

Find the JSX row that contains the name label (`HERO_NAME` / "Marco Sevilla"). Directly above that row, insert:

```tsx
<div
  className="mb-8"
  style={{
    // No horizontal centering — left-aligned per Q9-B asymmetric composition
  }}
>
  <div className="hidden lg:block">
    <PixelCanvas
      scene={jellyfishScene}
      widthCssPx={200}
      heightCssPx={280}
      pixelScale={2}
    />
  </div>
  <div className="lg:hidden">
    <PixelCanvas
      scene={jellyfishScene}
      widthCssPx={140}
      heightCssPx={196}
      pixelScale={2}
    />
  </div>
</div>
```

`mb-8` = 32px gap per spec.

- [ ] **Step 3: Verify tsc passes**

Run: `cd site && npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 4: Visual check — homepage**

Open `http://localhost:3000/`. Expected:
- Jellyfish sits top-left above "Marco Sevilla" label
- Heading streams in to the right/below jellyfish as normal
- No layout shifts during intro sequence
- Mobile (resize below 1024px): smaller jellyfish, same top-left position

- [ ] **Step 5: Commit**

```bash
git add site/components/Hero.tsx
git commit -m "Add pixel jellyfish to homepage hero"
```

---

## Task 15: Cross-cutting verification (themes, reduced motion, perf)

No code changes — this is a verification pass. If anything fails, branch to a new task to fix it.

- [ ] **Step 1: Theme cycle check**

In browser: click the palette icon (bottom sticky footer), cycle through all 12 themes (Light, Dark, Ocean, Forest, Wine, Slate, Ember, Lavender, Mint, Rose, Butter, Sky).

Expected: jellyfish colors update within one frame for each theme. No color flashes, no stale colors.

If broken: check `MutationObserver` in `PixelCanvas.tsx` — the theme toggle may set a different attribute than `class` / `data-theme`.

- [ ] **Step 2: Reduced motion check**

macOS: System Settings → Accessibility → Display → Reduce Motion → on.

Expected: jellyfish motion slows to ~1/4 speed (still moving, much slower). Toggle off — returns to full speed.

- [ ] **Step 3: Off-screen pause check**

Scroll past the hero. In Chrome DevTools → Performance tab, record 5 seconds. Scroll back up, record 5 seconds.

Expected: CPU usage drops to ~0% when scrolled past hero. Returns to active when back in view.

- [ ] **Step 4: Mobile viewport check**

Resize browser to <1024px or use DevTools device mode. Expected: jellyfish renders at 140×196, still top-left, heading below.

- [ ] **Step 5: Intro sequence check**

Clear `sessionStorage.removeItem("portfolio-intro-seen")` in console, reload.

Expected: jellyfish is already animating during the hero intro ✸ blinks + text streaming (Q12-A). No fade-in.

- [ ] **Step 6: Perf spot-check**

Chrome Performance tab, record 10 seconds on the homepage. Check frame time — target <5ms/frame for the canvas scene.

If >8ms/frame: check logical grid size, reduce tentacle node count, or reduce bell pixel-scan work.

- [ ] **Step 7: Push and deploy**

If all checks pass:

```bash
cd "/Users/marcosevilla/Developer/portfolio 2026"
git push origin main
```

Vercel auto-deploys from main. Check the Vercel dashboard for build success, then load the live URL.

---

## Self-Review

### Spec coverage

| Spec requirement | Covered by |
|---|---|
| Scene library with `init` + `draw` API | Task 1 (types) |
| Palette reader with theme subscription | Task 1 + Task 5 |
| Noise primitive | Task 2 |
| Verlet chain primitive | Task 3 |
| Dither shading | Task 2 (`dither.ts`) + Task 6 (used in bell) |
| Raster helpers | Task 2 |
| RAF engine with reduced-motion scaling | Task 4 |
| IntersectionObserver + Visibility pause | Task 5 |
| `image-rendering: pixelated` + `aria-hidden` + `pointer-events: none` | Task 5 |
| Bell shape + radial ribs + Bayer dither | Task 6 |
| Bell pulse + Poisson variable energy | Task 7 |
| Oral arms with lag follow | Task 9 |
| 6 tentacles with varied lengths + depth variance | Task 10 |
| Body bob | Task 11 |
| `/dev/pixel-lab` with DialKit sliders | Tasks 8 + 12 |
| Side-by-side desktop + mobile preview | Task 8 |
| Lock-values clipboard + presets | Tasks 12 + 13 |
| Hero integration (top-left asymmetric) | Task 14 |
| Responsive mobile scale | Task 14 |
| Theme cycling, reduced-motion, perf verification | Task 15 |

No gaps.

### Placeholder scan

- No "TBD," "TODO," or "implement later" in any task
- All code blocks are complete (not stubs)
- All commands include working directory and expected output

### Type consistency

- `Scene`, `SceneState`, `FrameCtx`, `Palette` types defined in Task 1 used consistently across Tasks 4, 5, 6+
- `VerletChain`, `VerletNode`, `createChain`, `setRoot`, `step`, `constrain` names match across Tasks 3, 10
- `JellyfishConfig` grows additively across Tasks 6, 7, 9, 10, 11 — no renames
- `createNoise2D` used in Task 10 (consumed from Task 2)

### Scope

Single feature, single plan. No decomposition needed.

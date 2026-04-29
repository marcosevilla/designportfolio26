# LED Matrix Audio Player Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the music-note toggle and player panel with controls rendered as lit dots inside the existing `LedMatrix` dot grid, revealed on hover (desktop) or tap (mobile).

**Architecture:** Hybrid — `LedMatrix.tsx` (sensitive WebGL2 shader) is not modified. A new sibling component `LedMatrixUI.tsx` mounts an absolutely-positioned 2D `<canvas>` over `LedMatrix` at the same dimensions. It draws transport controls, song info, scrubber, and the scene picker as discrete circles at the same 5 px grid as the shader. Reveal state is managed locally; audio state comes from `AudioPlayerContext`; visualizer scene state from `VisualizerSceneContext`.

**Tech Stack:** Next.js 14 (webpack mode), TypeScript, React 19, Tailwind, Framer Motion, native Canvas 2D, `ResizeObserver`. **No unit-test runner in the project** — each task uses `tsc --noEmit` + manual dev-server verification in lieu of automated tests.

---

## Spec reference

Source spec: `docs/superpowers/specs/2026-04-28-led-matrix-player-design.md`. Re-read it before starting any task; this plan assumes the spec is your ground truth for visual layout, dimensions, and interaction semantics.

## File structure (locked decisions)

| File | Status | Responsibility |
|------|--------|---------------|
| `site/lib/dot-font.ts` | **new** | Pure module: 3×5 bitmap font, 7×7 transport glyphs, 5×5 scene icons, drawing helpers (`drawText`, `drawGlyph`, `measureText`). Zero React, zero DOM. |
| `site/components/music/LedMatrixUI.tsx` | **new** | Overlay component. Owns the 2D canvas, reveal state, click-region routing, render pipeline. |
| `site/components/HomeLayout.tsx` | modify | Replace the `<motion.div>` player row above the grid with a `position: relative` wrapper holding `<LedMatrix />` + `<LedMatrixUI />`. |
| `site/components/Hero.tsx` | modify | Remove the inline music-note button from the bio paragraph. |
| `site/components/HeroActions.tsx` | modify | Remove the music-note `ActionIcon`. |
| `site/lib/AudioPlayerContext.tsx` | modify | Delete `panelOpen`, `togglePanel`, `closePanel` from the context type, state, and value. |
| `site/components/music/PlayerPanel.tsx` | **delete** | No consumer after Task 13. |
| `site/components/music/SeekBar.tsx` | **delete** | Only consumer was PlayerPanel. |
| `site/components/music/VisualizerSceneToggle.tsx` | **delete** | Replaced by the scene picker inside the overlay. |

## Test policy

The project has no test runner. After each task:
1. Run `npx tsc --noEmit` from `site/` — must exit 0.
2. Visit `localhost:3000` (start dev with `npm run dev` from `site/` if not already running) and visually verify the behavior listed under "Visual verification" in the task.
3. Commit only after both pass.

If you find yourself reaching for a unit test, write a self-contained verification function inside the file you're working on, exported as `__test_*` and called from a temporary `console.log` in dev — then delete it before commit. Don't introduce a test framework.

## Commit cadence

One commit per task. Use Conventional-Commits-style subject lines (`feat:`, `refactor:`, `chore:`). Co-author trailer is not required for these commits unless the user asks.

---

## Task 1: Create `lib/dot-font.ts` — bitmap font + glyphs + helpers

**Files:**
- Create: `site/lib/dot-font.ts`

- [ ] **Step 1: Create the file with the static data.**

```ts
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
  "8": [[0,1,0],[1,0,1],[0,1,0],[1,0,1],[0,1,0]],
  "9": [[0,1,0],[1,0,1],[0,1,1],[0,0,1],[1,1,0]],
  " ": [[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0]],
  "-": [[0,0,0],[0,0,0],[1,1,1],[0,0,0],[0,0,0]],
  ":": [[0,0,0],[0,1,0],[0,0,0],[0,1,0],[0,0,0]],
  ".": [[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,1,0]],
  "…": [[0,0,0],[0,0,0],[0,0,0],[0,0,0],[1,1,1]],
};

const FALLBACK = FONT_3x5[" "];
const CHAR_W = 3;
const CHAR_H = 5;
const CHAR_ADVANCE = 4; // 3 cols + 1 col gap

/** 7×7 transport glyphs. Larger so they read as primary controls. */
export const GLYPH_7x7 = {
  play: [
    [1,0,0,0,0,0,0],
    [1,1,0,0,0,0,0],
    [1,1,1,0,0,0,0],
    [1,1,1,1,0,0,0],
    [1,1,1,0,0,0,0],
    [1,1,0,0,0,0,0],
    [1,0,0,0,0,0,0],
  ],
  pause: [
    [1,1,0,1,1,0,0],
    [1,1,0,1,1,0,0],
    [1,1,0,1,1,0,0],
    [1,1,0,1,1,0,0],
    [1,1,0,1,1,0,0],
    [1,1,0,1,1,0,0],
    [1,1,0,1,1,0,0],
  ],
  prev: [
    [1,0,1,0,0,0,1],
    [1,0,1,1,0,1,1],
    [1,0,1,1,1,1,1],
    [1,0,1,1,1,1,1],
    [1,0,1,1,1,1,1],
    [1,0,1,1,0,1,1],
    [1,0,1,0,0,0,1],
  ],
  next: [
    [1,0,0,0,1,0,1],
    [1,1,0,1,1,0,1],
    [1,1,1,1,1,0,1],
    [1,1,1,1,1,0,1],
    [1,1,1,1,1,0,1],
    [1,1,0,1,1,0,1],
    [1,0,0,0,1,0,1],
  ],
} as const satisfies Record<string, DotGlyph>;

/** 5×5 scene icons — same id strings as `VisualizerScene`. */
export const GLYPH_5x5_SCENES: Record<
  "waveform" | "sparkles" | "chladni" | "feedback" | "lissajous",
  DotGlyph
> = {
  waveform: [[0,0,1,0,0],[0,1,0,1,0],[1,0,0,0,1],[0,1,0,1,0],[0,0,1,0,0]],
  sparkles: [[0,0,1,0,0],[0,0,1,0,0],[1,1,1,1,1],[0,0,1,0,0],[0,0,1,0,0]],
  chladni:  [[0,1,1,1,0],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[0,1,1,1,0]],
  feedback: [[0,0,1,0,0],[0,1,0,1,0],[1,0,0,0,1],[0,1,0,1,0],[0,0,1,0,0]],
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
  const radius = cell * 0.4;
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
```

- [ ] **Step 2: Verify it compiles.**

Run: `cd site && npx tsc --noEmit`
Expected: exit code 0, no errors.

- [ ] **Step 3: Commit.**

```bash
git add site/lib/dot-font.ts
git commit -m "feat: add dot-font module with bitmap glyphs + drawing helpers"
```

---

## Task 2: Create `LedMatrixUI.tsx` — overlay canvas skeleton

**Files:**
- Create: `site/components/music/LedMatrixUI.tsx`

Goal of this task: mount an empty 2D-canvas overlay sized to its parent. No drawing yet beyond a one-time fill so we can confirm the canvas appears at the right place.

- [ ] **Step 1: Create the skeleton file.**

```tsx
// site/components/music/LedMatrixUI.tsx
"use client";

import { useEffect, useLayoutEffect, useRef } from "react";

/** Must match SPACING in LedMatrix.tsx. */
const CELL = 5;

const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

export default function LedMatrixUI() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sizeRef = useRef({ cssW: 0, cssH: 0, cols: 0, rows: 0, dpr: 1 });

  useIsoLayoutEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const sync = () => {
      const rect = parent.getBoundingClientRect();
      const cssW = rect.width;
      const cssH = rect.height;
      const dpr = window.devicePixelRatio || 1;
      const cols = Math.max(1, Math.floor(cssW / CELL));
      const rows = Math.max(1, Math.floor(cssH / CELL));
      sizeRef.current = { cssW, cssH, cols, rows, dpr };

      canvas.style.width = `${cssW}px`;
      canvas.style.height = `${cssH}px`;
      canvas.width = Math.round(cssW * dpr);
      canvas.height = Math.round(cssH * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      // Clear — drawing is added in later tasks.
      ctx.clearRect(0, 0, cssW, cssH);
    };

    sync();
    const ro = new ResizeObserver(() => requestAnimationFrame(sync));
    ro.observe(parent);
    window.addEventListener("resize", sync);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", sync);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="absolute inset-0 pointer-events-none"
    />
  );
}
```

- [ ] **Step 2: Verify it compiles.**

Run: `cd site && npx tsc --noEmit`
Expected: exit code 0.

- [ ] **Step 3: Commit.**

```bash
git add site/components/music/LedMatrixUI.tsx
git commit -m "feat: add LedMatrixUI skeleton (overlay canvas, resize sync)"
```

---

## Task 3: Wire `LedMatrixUI` into `HomeLayout` (alongside the existing player row)

**Files:**
- Modify: `site/components/HomeLayout.tsx`

Goal: mount the new overlay over the LedMatrix shader so we can see the canvas takes the right physical position. Old player row stays — we'll remove it in Task 13 once the new overlay is feature-complete.

- [ ] **Step 1: Edit `HomeLayout.tsx`.**

Replace the existing `MatrixArea` function body with a `position: relative` wrapper that holds both `LedMatrix` and the new overlay. Keep the player row above as-is for now.

```tsx
// Add to imports at the top of HomeLayout.tsx
import LedMatrixUI from "./music/LedMatrixUI";
```

```tsx
// Replace MatrixArea() body. Keep the AnimatePresence/motion.div block above LedMatrix
// untouched; only the LedMatrix render line changes.
//
// Old:
//   <LedMatrix />
// New:
//   <div className="relative">
//     <LedMatrix />
//     <LedMatrixUI />
//   </div>
```

The complete updated `MatrixArea` (everything above the `<LedMatrix />` swap stays unchanged):

```tsx
function MatrixArea() {
  const { panelOpen } = useAudioPlayer();
  return (
    <div>
      <AnimatePresence initial={false}>
        {panelOpen && (
          <motion.div
            key="player-row"
            initial={{ height: 0, opacity: 0, y: -12, filter: "blur(10px)" }}
            animate={{
              height: "auto",
              opacity: 1,
              y: 0,
              filter: "blur(0px)",
              transition: {
                height: { duration: 0.45, ease: REVEAL_EASE },
                opacity: { duration: 0.4, ease: REVEAL_EASE, delay: 0.05 },
                y: { duration: 0.5, ease: REVEAL_EASE },
                filter: { duration: 0.45, ease: REVEAL_EASE, delay: 0.05 },
              },
            }}
            exit={{
              height: 0,
              opacity: 0,
              y: -12,
              filter: "blur(10px)",
              transition: {
                height: { duration: 0.35, ease: REVEAL_EASE, delay: 0.05 },
                opacity: { duration: 0.25, ease: REVEAL_EASE },
                y: { duration: 0.35, ease: REVEAL_EASE },
                filter: { duration: 0.3, ease: REVEAL_EASE },
              },
            }}
            style={{ overflow: "hidden", willChange: "filter, transform, opacity" }}
          >
            <div className="pb-4 flex items-end gap-4">
              <div className="flex-1 min-w-0">
                <PlayerPanel />
              </div>
              <VisualizerSceneToggle />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="relative">
        <LedMatrix />
        <LedMatrixUI />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify compile.**

Run: `cd site && npx tsc --noEmit`
Expected: exit 0.

- [ ] **Step 3: Visual verification.**

1. `cd site && npm run dev` (if not already running).
2. Open http://localhost:3000.
3. Inspect the dot-grid container in DevTools — confirm there is now a `<canvas>` directly after the LedMatrix canvas, both at the same `getBoundingClientRect()` width × height.
4. The overlay is empty so visually nothing should change yet.

- [ ] **Step 4: Commit.**

```bash
git add site/components/HomeLayout.tsx
git commit -m "feat: mount LedMatrixUI overlay alongside LedMatrix"
```

---

## Task 4: Idle revealed state — draw the centered play glyph on hover

**Files:**
- Modify: `site/components/music/LedMatrixUI.tsx`

Goal: when the user's cursor is over the parent and music is not playing, draw the 7×7 play glyph dead-center using `drawGlyph`.

- [ ] **Step 1: Subscribe to audio + scene context, add reveal state, wire pointer events.**

Replace the entire `LedMatrixUI.tsx` body with the version below. The new version adds:
- `useAudioPlayer` for `isPlaying` (other fields used in later tasks),
- a `revealed` ref + state for hover detection,
- pointer listeners attached to the parent (so clicks/hover hit even though the canvas is `pointer-events-none`),
- a `draw()` function that renders the current state.

```tsx
"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useAudioPlayer } from "@/lib/AudioPlayerContext";
import { GLYPH_7x7, drawGlyph } from "@/lib/dot-font";

const CELL = 5;
const ACCENT = "var(--color-accent)";

const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

function readCssVar(name: string, fallback: string): string {
  if (typeof window === "undefined") return fallback;
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v || fallback;
}

export default function LedMatrixUI() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const sizeRef = useRef({ cssW: 0, cssH: 0, cols: 0, rows: 0, dpr: 1 });
  const [revealed, setRevealed] = useState(false);

  const { isPlaying } = useAudioPlayer();

  // Locate the parent wrapper once (the <div className="relative"> created in HomeLayout).
  useIsoLayoutEffect(() => {
    wrapperRef.current = canvasRef.current?.parentElement as HTMLDivElement | null;
  }, []);

  // Resize sync — same as before, but extracted into its own effect so we can call
  // draw() after every sync as well as on state changes.
  useIsoLayoutEffect(() => {
    const canvas = canvasRef.current;
    const parent = wrapperRef.current;
    if (!canvas || !parent) return;

    const sync = () => {
      const rect = parent.getBoundingClientRect();
      const cssW = rect.width;
      const cssH = rect.height;
      const dpr = window.devicePixelRatio || 1;
      const cols = Math.max(1, Math.floor(cssW / CELL));
      const rows = Math.max(1, Math.floor(cssH / CELL));
      sizeRef.current = { cssW, cssH, cols, rows, dpr };
      canvas.style.width = `${cssW}px`;
      canvas.style.height = `${cssH}px`;
      canvas.width = Math.round(cssW * dpr);
      canvas.height = Math.round(cssH * dpr);
      const ctx = canvas.getContext("2d");
      if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      drawNow();
    };

    sync();
    const ro = new ResizeObserver(() => requestAnimationFrame(sync));
    ro.observe(parent);
    window.addEventListener("resize", sync);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", sync);
    };
    // drawNow is captured via closure; included via deps to satisfy lint.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [revealed, isPlaying]);

  // Hover detection on the parent.
  useEffect(() => {
    const parent = wrapperRef.current;
    if (!parent) return;
    const onEnter = () => setRevealed(true);
    const onLeave = () => setRevealed(false);
    parent.addEventListener("mouseenter", onEnter);
    parent.addEventListener("mouseleave", onLeave);
    return () => {
      parent.removeEventListener("mouseenter", onEnter);
      parent.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  // Single draw entry point — called from resize and from the state-change effect below.
  const drawNow = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const { cssW, cssH, cols, rows } = sizeRef.current;
    ctx.clearRect(0, 0, cssW, cssH);

    if (!revealed) return;

    const accent = readCssVar("--color-accent", "#B5651D");

    if (!isPlaying) {
      // 7×7 play glyph, centered.
      const originCol = Math.floor(cols / 2) - 3;
      const originRow = Math.floor(rows / 2) - 3;
      drawGlyph(ctx, GLYPH_7x7.play, originCol, originRow, CELL, accent);
    }
  };

  // Redraw whenever rendered state changes.
  useEffect(() => {
    drawNow();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [revealed, isPlaying]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="absolute inset-0 pointer-events-none"
    />
  );
}
```

- [ ] **Step 2: Verify compile.**

Run: `cd site && npx tsc --noEmit`
Expected: exit 0.

- [ ] **Step 3: Visual verification.**

1. Visit http://localhost:3000.
2. Hover over the dot grid — a copper play glyph (▶) appears dead center, composed of individual lit dots.
3. Move the cursor off the grid — the glyph disappears.

- [ ] **Step 4: Commit.**

```bash
git add site/components/music/LedMatrixUI.tsx
git commit -m "feat: render centered play glyph on hover (idle state)"
```

---

## Task 5: Wire play-glyph click → toggle playback

**Files:**
- Modify: `site/components/music/LedMatrixUI.tsx`

Goal: clicking the play-glyph region starts playback. Region-based hit testing (no per-dot tests).

- [ ] **Step 1: Add a click handler on the parent. Compute hit regions from current size.**

Add at the top of `LedMatrixUI` (after `useAudioPlayer`):

```tsx
const { isPlaying, togglePlay } = useAudioPlayer();
```

Add a new effect that attaches a `click` listener to the parent. (Keep this in its own effect so other handlers added later — prev/next/scene/seek — can live next to it without a giant function.) Use the wrapper's `getBoundingClientRect` to derive cell coords from the click x/y.

```tsx
useEffect(() => {
  const parent = wrapperRef.current;
  if (!parent) return;
  const onClick = (e: MouseEvent) => {
    if (!revealed) return;
    const rect = parent.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const { cols, rows } = sizeRef.current;
    const col = Math.floor(x / CELL);
    const row = Math.floor(y / CELL);
    // Center band: rows within ±5 of grid mid, cols within ±15 of grid mid.
    const midC = Math.floor(cols / 2);
    const midR = Math.floor(rows / 2);
    if (Math.abs(row - midR) <= 5 && Math.abs(col - midC) <= 15) {
      togglePlay();
    }
  };
  parent.addEventListener("click", onClick);
  return () => parent.removeEventListener("click", onClick);
}, [revealed, togglePlay]);
```

Also: change the canvas's `pointer-events-none` to allow the parent to receive the click. The canvas is `pointer-events-none` so events pass through — the parent (`<div className="relative">`) catches them. That already works as-is. **Confirm by inspecting that the parent's bubble path receives the click.**

- [ ] **Step 2: Verify compile.**

Run: `cd site && npx tsc --noEmit`
Expected: exit 0.

- [ ] **Step 3: Visual verification.**

1. Hover the grid — play glyph appears.
2. Click anywhere in the center region — audio starts. (Open browser DevTools → Network tab → confirm the `mp3` is requested.)
3. The play glyph disappears (because `isPlaying` is now true and we haven't built the playing-revealed state yet — that's Task 6).

- [ ] **Step 4: Commit.**

```bash
git add site/components/music/LedMatrixUI.tsx
git commit -m "feat: wire play-glyph click to togglePlay"
```

---

## Task 6: Render playing-revealed state — title + artist + transport + scene picker (no scrubber yet)

**Files:**
- Modify: `site/components/music/LedMatrixUI.tsx`

Goal: when revealed AND playing, draw title (top-left), artist (top-left, line 2), prev/pause/next centered, 5 scene icons top-right.

- [ ] **Step 1: Pull additional context fields and import the new helpers.**

Update imports:

```tsx
import { useAudioPlayer } from "@/lib/AudioPlayerContext";
import { useVisualizerScene } from "@/lib/VisualizerSceneContext";
import { SCENES } from "@/lib/visualizer-scenes";
import { GLYPH_7x7, GLYPH_5x5_SCENES, drawGlyph, drawText, truncateToCols } from "@/lib/dot-font";
```

Pull additional fields:

```tsx
const { isPlaying, togglePlay, currentTrack, next, prev } = useAudioPlayer();
const { activeScenes, setOnlyScene } = useVisualizerScene();
```

- [ ] **Step 2: Extend `drawNow()` to handle the playing-revealed branch.**

```tsx
const drawNow = () => {
  const canvas = canvasRef.current;
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const { cssW, cssH, cols, rows } = sizeRef.current;
  ctx.clearRect(0, 0, cssW, cssH);

  if (!revealed) return;

  const accent = readCssVar("--color-accent", "#B5651D");
  const dim = withAlpha(accent, 0.4); // helper defined below

  // ── Idle revealed: just the play glyph ──
  if (!isPlaying) {
    const originCol = Math.floor(cols / 2) - 3;
    const originRow = Math.floor(rows / 2) - 3;
    drawGlyph(ctx, GLYPH_7x7.play, originCol, originRow, CELL, accent);
    return;
  }

  // ── Playing revealed ──

  // Title (top-left)
  const titleCols = Math.max(0, cols - 36); // leave room for scene picker on the right
  const title = truncateToCols(currentTrack.title ?? "", Math.min(titleCols, 40));
  drawText(ctx, title, 2, 3, CELL, accent);

  // Artist (top-left, line 2)
  const artist = truncateToCols(currentTrack.artist ?? "", Math.min(titleCols, 40));
  drawText(ctx, artist, 2, 10, CELL, dim);

  // Scene picker (top-right) — 5 icons × 5 cells, 1-cell gap
  const SCENE_W = 5;
  const SCENE_GAP = 1;
  const ICONS_W = SCENES.length * SCENE_W + (SCENES.length - 1) * SCENE_GAP;
  const sceneOriginCol = cols - ICONS_W - 2;
  for (let i = 0; i < SCENES.length; i++) {
    const id = SCENES[i].id as keyof typeof GLYPH_5x5_SCENES;
    const isActive = activeScenes.has(id);
    drawGlyph(
      ctx,
      GLYPH_5x5_SCENES[id],
      sceneOriginCol + i * (SCENE_W + SCENE_GAP),
      3,
      CELL,
      isActive ? accent : dim
    );
  }

  // Center transport: prev / pause / next, 7×7 each, gap 4 cells, total 29 cells
  const transportW = 7 + 4 + 7 + 4 + 7;
  const transportOriginCol = Math.floor(cols / 2) - Math.floor(transportW / 2);
  const transportOriginRow = Math.floor(rows / 2) - 3;
  drawGlyph(ctx, GLYPH_7x7.prev,  transportOriginCol,            transportOriginRow, CELL, dim);
  drawGlyph(ctx, GLYPH_7x7.pause, transportOriginCol + 11,       transportOriginRow, CELL, accent);
  drawGlyph(ctx, GLYPH_7x7.next,  transportOriginCol + 22,       transportOriginRow, CELL, dim);
};
```

Add the `withAlpha` helper at module scope (below imports):

```tsx
function withAlpha(color: string, alpha: number): string {
  // Color is "var(--color-accent)" once — but we resolve it via getComputedStyle in drawNow
  // and then convert here. Color comes in as `#RRGGBB` or `rgb(...)`.
  if (color.startsWith("#") && (color.length === 7 || color.length === 4)) {
    const r = parseInt(color.length === 4 ? color[1] + color[1] : color.slice(1, 3), 16);
    const g = parseInt(color.length === 4 ? color[2] + color[2] : color.slice(3, 5), 16);
    const b = parseInt(color.length === 4 ? color[3] + color[3] : color.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${alpha})`;
  }
  // Already rgb(...) — replace closing paren with alpha.
  if (color.startsWith("rgb(")) return color.replace("rgb(", "rgba(").replace(")", `,${alpha})`);
  return color;
}
```

Also extend the `useEffect` that calls `drawNow` so it re-runs when track or scenes change:

```tsx
useEffect(() => {
  drawNow();
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [revealed, isPlaying, currentTrack.id, activeScenes]);
```

- [ ] **Step 3: Verify compile.**

Run: `cd site && npx tsc --noEmit`
Expected: exit 0.

- [ ] **Step 4: Visual verification.**

1. Reload page, hover grid → play glyph.
2. Click center to start playback. The page now plays audio (you can hear it / via the existing PlayerPanel above).
3. Hover the grid again. Top-left shows `TRACK TITLE` over `ARTIST NAME` rendered as dots. Center shows `⏮ ⏸ ⏭` glyphs. Top-right shows 5 scene icons, the active one in full accent.

- [ ] **Step 5: Commit.**

```bash
git add site/components/music/LedMatrixUI.tsx
git commit -m "feat: render title/artist/transport/scenes in playing-revealed state"
```

---

## Task 7: Render scrubber row + timecodes + 250 ms tick

**Files:**
- Modify: `site/components/music/LedMatrixUI.tsx`

Goal: bottom of grid shows `M:SS` left, dot progress bar middle, `M:SS` right. Progress redraws every 250 ms during playback.

- [ ] **Step 1: Pull `currentTime`, `duration` from context.**

```tsx
const { isPlaying, togglePlay, currentTrack, currentTime, duration, next, prev, seek } = useAudioPlayer();
```

(`seek` is consumed in Task 8.)

- [ ] **Step 2: Add a 250 ms ticker that bumps a state when playing.**

Inside the component:

```tsx
const [tick, setTick] = useState(0);
useEffect(() => {
  if (!isPlaying) return;
  const id = window.setInterval(() => setTick((t) => t + 1), 250);
  return () => window.clearInterval(id);
}, [isPlaying]);
```

Add `tick` to the redraw effect's deps:

```tsx
useEffect(() => {
  drawNow();
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [revealed, isPlaying, currentTrack.id, activeScenes, tick]);
```

- [ ] **Step 3: Add scrubber drawing inside the playing-revealed branch of `drawNow()`.**

Add at the bottom of the playing-revealed branch (just before its closing brace):

```tsx
// Scrubber: timecodes on row rows-5, dot bar on row rows-3
import { formatClock } from "@/lib/dot-font"; // (already imported in step 1 if not, add it now)

// Timecodes (left + right)
const left = formatClock(currentTime);
const right = formatClock(duration);
drawText(ctx, left, 2, rows - 5, CELL, accent);
const rightW = (right.length * 4 - 1); // CHAR_ADVANCE-based measure
drawText(ctx, right, cols - 2 - rightW, rows - 5, CELL, accent);

// Dot bar
const BAR_PAD_LEFT = 18;   // chars take ~12 cells, leave 4 cells gap
const BAR_PAD_RIGHT = 13;
const barStart = BAR_PAD_LEFT;
const barEnd = cols - BAR_PAD_RIGHT;
const fillRatio = duration > 0 ? Math.min(1, Math.max(0, currentTime / duration)) : 0;
const fillCols = Math.round((barEnd - barStart) * fillRatio);
for (let c = barStart; c <= barEnd; c++) {
  const lit = c <= barStart + fillCols;
  drawGlyph(ctx, [[1]], c, rows - 3, CELL, lit ? accent : dim);
}
```

(`formatClock` is exported from `dot-font.ts`. If TypeScript complains about importing it inside a function body, move the import to the top with the others.)

- [ ] **Step 4: Verify compile.**

Run: `cd site && npx tsc --noEmit`

- [ ] **Step 5: Visual verification.**

1. Start playback (hover, click center).
2. Hover during playback — bottom-left shows `0:0X`, bottom-right shows song duration.
3. The dot bar fills as the song advances. Progress increments every ~250 ms (visible step).

- [ ] **Step 6: Commit.**

```bash
git add site/components/music/LedMatrixUI.tsx
git commit -m "feat: render scrubber row with timecodes and 250ms tick"
```

---

## Task 8: Wire prev/next/scene/seek click regions

**Files:**
- Modify: `site/components/music/LedMatrixUI.tsx`

Goal: clicking inside the prev / next / each scene icon / scrubber row triggers the corresponding action.

- [ ] **Step 1: Replace the click handler from Task 5 with a region router.**

Replace the click `useEffect` body with:

```tsx
useEffect(() => {
  const parent = wrapperRef.current;
  if (!parent) return;
  const onClick = (e: MouseEvent) => {
    if (!revealed) return;
    const rect = parent.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const { cols, rows } = sizeRef.current;
    const col = Math.floor(x / CELL);
    const row = Math.floor(y / CELL);

    // Scrubber: bottom 12% of grid (covers timecodes + dot bar).
    if (row >= rows - 6) {
      const BAR_PAD_LEFT = 18;
      const BAR_PAD_RIGHT = 13;
      const barStart = BAR_PAD_LEFT;
      const barEnd = cols - BAR_PAD_RIGHT;
      if (col >= barStart && col <= barEnd && duration > 0) {
        const ratio = (col - barStart) / (barEnd - barStart);
        seek(ratio * duration);
        return;
      }
    }

    // Scene picker (top-right strip)
    const SCENE_W = 5;
    const SCENE_GAP = 1;
    const ICONS_W = SCENES.length * SCENE_W + (SCENES.length - 1) * SCENE_GAP;
    const sceneOriginCol = cols - ICONS_W - 2;
    if (row >= 1 && row <= 9 && col >= sceneOriginCol && col < sceneOriginCol + ICONS_W) {
      const i = Math.floor((col - sceneOriginCol) / (SCENE_W + SCENE_GAP));
      const id = SCENES[i]?.id;
      if (id) setOnlyScene(id);
      return;
    }

    // Transport: 3 cells tall around mid-row, segmented into prev/play/next.
    const midR = Math.floor(rows / 2);
    if (Math.abs(row - midR) <= 5) {
      const transportW = 7 + 4 + 7 + 4 + 7;
      const transportOriginCol = Math.floor(cols / 2) - Math.floor(transportW / 2);
      const local = col - transportOriginCol;
      if (local >= 0 && local < 7) prev();
      else if (local >= 11 && local < 18) togglePlay();
      else if (local >= 22 && local < 29) next();
      return;
    }
  };
  parent.addEventListener("click", onClick);
  return () => parent.removeEventListener("click", onClick);
}, [revealed, togglePlay, prev, next, seek, setOnlyScene, duration]);
```

- [ ] **Step 2: Verify compile.**

Run: `cd site && npx tsc --noEmit`

- [ ] **Step 3: Visual verification.**

1. Start playback.
2. Hover, click prev — track restarts or goes to previous (depends on track index).
3. Click next — advances to next track.
4. Click each scene icon — visualizer scene changes (verify by toggling, the wave/sparkle pattern in the LedMatrix shader changes).
5. Click on the dot progress bar — playback seeks to that position; timecode jumps.

- [ ] **Step 4: Commit.**

```bash
git add site/components/music/LedMatrixUI.tsx
git commit -m "feat: wire prev/next/scene/seek click regions in LedMatrixUI"
```

---

## Task 9: Mobile / touch — tap-to-toggle reveal

**Files:**
- Modify: `site/components/music/LedMatrixUI.tsx`

Goal: on touch devices, tap inside the grid toggles `revealed`; tap outside the grid hides; tap on a glyph fires its action (the existing click handler already handles this since `click` fires after `touchend`).

- [ ] **Step 1: Add pointer event handling that distinguishes touch from mouse.**

Replace the hover effect (Task 4 step 1) with two effects:

```tsx
// Hover (mouse only): mouseenter/leave on parent.
useEffect(() => {
  const parent = wrapperRef.current;
  if (!parent) return;
  const onEnter = (e: PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    setRevealed(true);
  };
  const onLeave = (e: PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    setRevealed(false);
  };
  parent.addEventListener("pointerenter", onEnter);
  parent.addEventListener("pointerleave", onLeave);
  return () => {
    parent.removeEventListener("pointerenter", onEnter);
    parent.removeEventListener("pointerleave", onLeave);
  };
}, []);

// Touch toggle: pointerup inside parent toggles; pointerdown outside parent hides.
useEffect(() => {
  const parent = wrapperRef.current;
  if (!parent) return;
  const onParentUp = (e: PointerEvent) => {
    if (e.pointerType === "mouse") return; // mouse handled by click handler
    setRevealed((r) => !r);
  };
  const onDocDown = (e: PointerEvent) => {
    if (e.pointerType === "mouse") return;
    if (parent.contains(e.target as Node)) return;
    setRevealed(false);
  };
  parent.addEventListener("pointerup", onParentUp);
  document.addEventListener("pointerdown", onDocDown);
  return () => {
    parent.removeEventListener("pointerup", onParentUp);
    document.removeEventListener("pointerdown", onDocDown);
  };
}, []);
```

- [ ] **Step 2: Expand glyph hit regions on touch.**

Inside the click handler, when the originating pointer was a touch, widen the transport / scene hit regions for fat-finger tolerance. Easiest approach: leave the regions as-is (they're already 7-cell-wide for transport, 5-cell for scenes — physically ~25–35 px on a phone). If user testing reveals miss-taps, expand each region by 2 cells on each side. Defer until manual testing finds an issue.

- [ ] **Step 3: Verify compile.**

Run: `cd site && npx tsc --noEmit`

- [ ] **Step 4: Visual verification (use a phone or DevTools device emulation).**

1. Open localhost:3000 in mobile view (Chrome DevTools → toggle device toolbar → iPhone).
2. Tap the dot grid — controls reveal.
3. Tap a glyph (play, scene icon, etc.) — action fires.
4. Tap outside the grid — controls hide.

- [ ] **Step 5: Commit.**

```bash
git add site/components/music/LedMatrixUI.tsx
git commit -m "feat: tap-to-toggle reveal on touch devices"
```

---

## Task 10: Reveal animation — opacity + blur on the canvas

**Files:**
- Modify: `site/components/music/LedMatrixUI.tsx`

Goal: when `revealed` flips, the canvas fades + un-blurs in (250 ms) and reverses out (200 ms). Same easing as elsewhere in the project: `[0.22, 1, 0.36, 1]`.

- [ ] **Step 1: Wrap the canvas in `motion.canvas`.**

Add the framer-motion import:

```tsx
import { motion } from "framer-motion";
```

Replace the `<canvas …>` JSX with:

```tsx
<motion.canvas
  ref={canvasRef}
  aria-hidden
  className="absolute inset-0 pointer-events-none"
  initial={false}
  animate={{
    opacity: revealed ? 1 : 0,
    filter: revealed ? "blur(0px)" : "blur(2px)",
  }}
  transition={{
    duration: revealed ? 0.25 : 0.2,
    ease: [0.22, 1, 0.36, 1],
  }}
/>
```

- [ ] **Step 2: Verify compile.**

Run: `cd site && npx tsc --noEmit`

- [ ] **Step 3: Visual verification.**

1. Hover the grid — controls fade in over ~250 ms with a slight blur lift.
2. Move the cursor away — controls fade out over ~200 ms with a blur dissolve.

- [ ] **Step 4: Commit.**

```bash
git add site/components/music/LedMatrixUI.tsx
git commit -m "feat: reveal/hide animation with opacity + blur"
```

---

## Task 11: Track-change crossfade + responsive layout fallback

**Files:**
- Modify: `site/components/music/LedMatrixUI.tsx`

Goal:
- On `currentTrack.id` change, fade the title+artist region out and back in over 200 ms.
- When `cols < 80`, drop the artist line. When `cols < 60`, also drop the scene picker. When `cols < 40`, also drop the title.

- [ ] **Step 1: Add a `textOpacity` state animated on track change.**

```tsx
const [textOpacity, setTextOpacity] = useState(1);
const lastTrackIdRef = useRef<string | undefined>(undefined);

useEffect(() => {
  const prevId = lastTrackIdRef.current;
  lastTrackIdRef.current = currentTrack.id;
  if (prevId === undefined || prevId === currentTrack.id) return;

  // Fade out, swap (text uses currentTrack at next paint), fade in.
  setTextOpacity(0);
  const fadeIn = window.setTimeout(() => setTextOpacity(1), 100);
  return () => window.clearTimeout(fadeIn);
}, [currentTrack.id]);
```

Add `textOpacity` to the redraw effect deps:

```tsx
}, [revealed, isPlaying, currentTrack.id, activeScenes, tick, textOpacity]);
```

- [ ] **Step 2: Use `textOpacity` when drawing title + artist.**

Inside the playing-revealed branch in `drawNow`, derive a per-call accent for text:

```tsx
const titleAccent = withAlpha(accent, textOpacity);
const artistAccent = withAlpha(accent, 0.4 * textOpacity);
drawText(ctx, title, 2, 3, CELL, titleAccent);
drawText(ctx, artist, 2, 10, CELL, artistAccent);
```

Add a CSS-style transition for the swap by using `requestAnimationFrame` to step `textOpacity` from 0 to 1 over 100 ms instead of an instant flip. Replace the timeout-based fade-in with:

```tsx
useEffect(() => {
  const prevId = lastTrackIdRef.current;
  lastTrackIdRef.current = currentTrack.id;
  if (prevId === undefined || prevId === currentTrack.id) return;
  setTextOpacity(0);
  let raf = 0;
  const start = performance.now();
  const step = (now: number) => {
    const t = Math.min(1, (now - start) / 200);
    // Fade out 0→100ms, fade in 100→200ms.
    const opacity = t < 0.5 ? 1 - t * 2 : (t - 0.5) * 2;
    setTextOpacity(opacity);
    if (t < 1) raf = requestAnimationFrame(step);
  };
  raf = requestAnimationFrame(step);
  return () => cancelAnimationFrame(raf);
}, [currentTrack.id]);
```

- [ ] **Step 3: Add responsive layout gates.**

In `drawNow()`'s playing-revealed branch, gate each region:

```tsx
const showTitle = cols >= 40;
const showArtist = cols >= 80;
const showScenes = cols >= 60;
```

Wrap the title draw call with `if (showTitle) { ... }`, the artist with `if (showArtist) { ... }`, the scene picker loop with `if (showScenes) { ... }`. Center transport and scrubber are always drawn.

- [ ] **Step 4: Verify compile.**

Run: `cd site && npx tsc --noEmit`

- [ ] **Step 5: Visual verification.**

1. Start playback. Click "next" — title and artist crossfade over 200 ms. The transport and scenes do not flicker.
2. Resize the browser window narrower (≤ ~400 px) — artist line drops first, then scene picker.

- [ ] **Step 6: Commit.**

```bash
git add site/components/music/LedMatrixUI.tsx
git commit -m "feat: track-change crossfade and responsive layout fallback"
```

---

## Task 12: Accessibility — keyboard, ARIA, live region, invisible buttons

**Files:**
- Modify: `site/components/music/LedMatrixUI.tsx`

Goal:
- Wrapper has `role="application"` and `aria-label="Music player"`, focusable (`tabindex=0`).
- Keyboard shortcuts when wrapper focused: Space=togglePlay, ←/→ = prev/next, [ / ] = previous/next scene, Home/End = seek to 0/duration.
- Screen reader live region announces track changes: `"Now playing: TITLE by ARTIST"`.
- Each clickable region has an invisible `<button>` overlay with the right ARIA label so keyboard + SR users can target them.

- [ ] **Step 1: Refactor the JSX to render the wrapper from inside `LedMatrixUI`.**

Currently the wrapper lives in `HomeLayout` (`<div className="relative">`). Move it into `LedMatrixUI` so a11y attributes are co-located. Update `HomeLayout` (Task 13 already removes the old player row, so we coordinate then) — but for this task, replace the JSX in `LedMatrixUI` with:

```tsx
return (
  <>
    {/* Live region — announces track changes */}
    <div
      role="status"
      aria-live="polite"
      className="sr-only"
    >
      {isPlaying ? `Now playing: ${currentTrack.title} by ${currentTrack.artist}` : ""}
    </div>

    {/* Invisible buttons for SR / keyboard. Positioned over each click region. */}
    {revealed && isPlaying && (
      <div className="absolute inset-0 pointer-events-none">
        <button
          type="button"
          aria-label="Previous track"
          onClick={() => prev()}
          className="absolute pointer-events-auto opacity-0"
          style={a11yButtonStyle("prev", sizeRef.current)}
        />
        <button
          type="button"
          aria-label={isPlaying ? "Pause" : "Play"}
          onClick={() => togglePlay()}
          className="absolute pointer-events-auto opacity-0"
          style={a11yButtonStyle("play", sizeRef.current)}
        />
        <button
          type="button"
          aria-label="Next track"
          onClick={() => next()}
          className="absolute pointer-events-auto opacity-0"
          style={a11yButtonStyle("next", sizeRef.current)}
        />
        {SCENES.map((s, i) => (
          <button
            key={s.id}
            type="button"
            aria-label={`Activate ${s.label} scene`}
            onClick={() => setOnlyScene(s.id)}
            className="absolute pointer-events-auto opacity-0"
            style={a11yButtonStyle("scene", sizeRef.current, i)}
          />
        ))}
      </div>
    )}

    <motion.canvas
      ref={canvasRef}
      aria-hidden
      className="absolute inset-0 pointer-events-none"
      initial={false}
      animate={{
        opacity: revealed ? 1 : 0,
        filter: revealed ? "blur(0px)" : "blur(2px)",
      }}
      transition={{ duration: revealed ? 0.25 : 0.2, ease: [0.22, 1, 0.36, 1] }}
    />
  </>
);
```

`a11yButtonStyle` computes pixel coordinates for each region, mirroring the geometry in `drawNow` and the click handler. Define at module scope:

```tsx
type Region = "prev" | "play" | "next" | "scene";

function a11yButtonStyle(
  region: Region,
  size: { cols: number; rows: number },
  sceneIndex = 0
): React.CSSProperties {
  const { cols, rows } = size;
  const SCENE_W = 5, SCENE_GAP = 1;
  const transportW = 7 + 4 + 7 + 4 + 7;
  const transportOriginCol = Math.floor(cols / 2) - Math.floor(transportW / 2);
  const transportOriginRow = Math.floor(rows / 2) - 3;
  const sceneIconsW = SCENES.length * SCENE_W + (SCENES.length - 1) * SCENE_GAP;
  const sceneOriginCol = cols - sceneIconsW - 2;

  const px = (col: number, row: number, w: number, h: number): React.CSSProperties => ({
    left: `${col * CELL}px`,
    top: `${row * CELL}px`,
    width: `${w * CELL}px`,
    height: `${h * CELL}px`,
  });

  switch (region) {
    case "prev":
      return px(transportOriginCol, transportOriginRow, 7, 7);
    case "play":
      return px(transportOriginCol + 11, transportOriginRow, 7, 7);
    case "next":
      return px(transportOriginCol + 22, transportOriginRow, 7, 7);
    case "scene":
      return px(
        sceneOriginCol + sceneIndex * (SCENE_W + SCENE_GAP),
        3,
        SCENE_W,
        SCENE_W
      );
  }
}
```

- [ ] **Step 2: Add keyboard shortcuts when the wrapper is focused.**

Add a wrapping element around the `LedMatrixUI` return that owns focus + keyboard:

Move the `<>` fragment into a `<div>` wrapper:

```tsx
return (
  <div
    ref={(el) => {
      if (el && !wrapperRef.current) wrapperRef.current = el;
    }}
    role="application"
    aria-label="Music player"
    tabIndex={0}
    className="absolute inset-0 outline-offset-2 focus-visible:outline-2 focus-visible:outline-(--color-accent)"
    onKeyDown={(e) => {
      switch (e.key) {
        case " ":
          e.preventDefault();
          togglePlay();
          break;
        case "ArrowLeft":
          e.preventDefault();
          prev();
          break;
        case "ArrowRight":
          e.preventDefault();
          next();
          break;
        case "[": {
          const ids = SCENES.map((s) => s.id);
          const cur = ids.indexOf(Array.from(activeScenes)[0] ?? ids[0]);
          setOnlyScene(ids[(cur - 1 + ids.length) % ids.length]);
          break;
        }
        case "]": {
          const ids = SCENES.map((s) => s.id);
          const cur = ids.indexOf(Array.from(activeScenes)[0] ?? ids[0]);
          setOnlyScene(ids[(cur + 1) % ids.length]);
          break;
        }
        case "Home":
          e.preventDefault();
          seek(0);
          break;
        case "End":
          e.preventDefault();
          seek(duration);
          break;
      }
    }}
  >
    {/* live region, invisible buttons, motion.canvas — as defined above */}
  </div>
);
```

Important: now that `LedMatrixUI` renders its own positioned wrapper, **HomeLayout no longer needs the `<div className="relative">` wrapper**. We will fix this in the next step (still inside Task 12 to avoid an intermediate broken state).

- [ ] **Step 3: Update `HomeLayout.tsx` to drop the wrapper.**

Change:

```tsx
<div className="relative">
  <LedMatrix />
  <LedMatrixUI />
</div>
```

to:

```tsx
<div className="relative">
  <LedMatrix />
  <LedMatrixUI />
</div>
```

(the wrapper still owns positioning since `LedMatrixUI` is now `absolute inset-0`; LedMatrix renders normally inside).

No actual change needed in HomeLayout for this task — the wrapper is still required because both children rely on it. The `wrapperRef` inside `LedMatrixUI` now points to its own self-rendered `<div role="application">` rather than the parent. **This means hover detection still needs to bubble to the parent OR we re-attach to the new self-rendered element.**

Resolve by binding `wrapperRef` to the inner `<div role="application">` (already done via the ref callback above) and removing the `useIsoLayoutEffect` that walked to `parentElement`. Update the existing layout effect:

```tsx
// Remove this hook entirely:
// useIsoLayoutEffect(() => {
//   wrapperRef.current = canvasRef.current?.parentElement as HTMLDivElement | null;
// }, []);
```

The ref-callback on the new wrapping `<div>` populates `wrapperRef` directly.

- [ ] **Step 4: Verify compile.**

Run: `cd site && npx tsc --noEmit`

- [ ] **Step 5: Visual verification.**

1. Tab through the page — focus eventually lands on the music player wrapper (visible focus ring).
2. Press Space → playback toggles. ←/→ → tracks change. [ / ] → scenes cycle. Home → seek to 0.
3. Open VoiceOver / NVDA — when a track changes, the SR announces "Now playing: TITLE by ARTIST".
4. Tab into the wrapper, then Tab again — focus moves to invisible "Previous track", "Play", "Next track", and 5 scene buttons.

- [ ] **Step 6: Commit.**

```bash
git add site/components/music/LedMatrixUI.tsx
git commit -m "feat: a11y — keyboard, ARIA, live region, invisible button overlays"
```

---

## Task 13: Remove the old player row from `HomeLayout`

**Files:**
- Modify: `site/components/HomeLayout.tsx`

Goal: now that the LedMatrixUI overlay is feature-complete, retire the legacy `<motion.div>` row above the grid that hosts `<PlayerPanel />` and `<VisualizerSceneToggle />`.

- [ ] **Step 1: Edit `HomeLayout.tsx`.**

Replace the entire `MatrixArea` function with:

```tsx
function MatrixArea() {
  return (
    <div>
      <div className="relative">
        <LedMatrix />
        <LedMatrixUI />
      </div>
    </div>
  );
}
```

Remove the now-unused imports at the top:

```tsx
// REMOVE:
import { motion, AnimatePresence } from "framer-motion";
import PlayerPanel from "./music/PlayerPanel";
import VisualizerSceneToggle from "./music/VisualizerSceneToggle";
import { useAudioPlayer } from "@/lib/AudioPlayerContext";
// REMOVE the REVEAL_EASE constant.
```

Keep:

```tsx
import Hero from "./Hero";
import HomeNav from "./HomeNav";
import LedMatrix from "./LedMatrix";
import LedMatrixUI from "./music/LedMatrixUI";
```

- [ ] **Step 2: Verify compile.**

Run: `cd site && npx tsc --noEmit`

- [ ] **Step 3: Visual verification.**

1. Reload localhost:3000.
2. The space above the dot grid no longer animates open when the music note button is clicked.
3. The dot-grid overlay still works exactly as before (hover, controls, click, scrubber).

- [ ] **Step 4: Commit.**

```bash
git add site/components/HomeLayout.tsx
git commit -m "refactor: remove legacy player row from HomeLayout"
```

---

## Task 14: Remove music-note buttons from `Hero.tsx` + `HeroActions.tsx`

**Files:**
- Modify: `site/components/Hero.tsx`
- Modify: `site/components/HeroActions.tsx`

Goal: revert the bio paragraph to plain text, drop the music-note `ActionIcon`.

- [ ] **Step 1: Edit `site/components/Hero.tsx`.**

Remove these imports:

```tsx
// REMOVE:
import { useAudioPlayer } from "@/lib/AudioPlayerContext";
import { MusicNoteIcon } from "./Icons";
```

Remove this line from the component body:

```tsx
const { panelOpen: musicPanelOpen, togglePanel: toggleMusicPanel } = useAudioPlayer();
```

Replace the inline-music-note paragraph with plain text:

```tsx
// Was:
//   <motion.p ...>
//     In my spare time I dabble in music photography
//     <button ...><MusicNoteIcon size={14} /></button>
//     .
//   </motion.p>
// Replace with:
<motion.p
  className="mt-4"
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.4, ease: "easeOut" }}
>
  In my spare time I dabble in music photography.
</motion.p>
```

- [ ] **Step 2: Edit `site/components/HeroActions.tsx`.**

Remove these imports / hooks:

```tsx
// REMOVE from imports:
import { MusicNoteIcon } from "./Icons";

// REMOVE inside the component:
const { panelOpen: musicPanelOpen, togglePanel: toggleMusicPanel } = useAudioPlayer();
import { useAudioPlayer } from "@/lib/AudioPlayerContext"; // (the import line)
```

Remove the `ActionIcon` block for the music button:

```tsx
// REMOVE entirely:
<ActionIcon
  label={musicPanelOpen ? "Close music player" : "Open music player"}
  onClick={toggleMusicPanel}
>
  <MusicNoteIcon size={14} style={{ opacity: musicPanelOpen ? 1 : 0.7 }} />
</ActionIcon>
```

- [ ] **Step 3: Verify compile.**

Run: `cd site && npx tsc --noEmit`

- [ ] **Step 4: Visual verification.**

1. Reload localhost:3000.
2. The action-icon row below "Marco Sevilla" no longer contains the music note (palette + smiley remain).
3. The bio paragraph reads "In my spare time I dabble in music photography." — no inline button.

- [ ] **Step 5: Commit.**

```bash
git add site/components/Hero.tsx site/components/HeroActions.tsx
git commit -m "refactor: remove redundant music-note buttons (grid is the entry point)"
```

---

## Task 15: Strip `panelOpen` / `togglePanel` / `closePanel` from `AudioPlayerContext`

**Files:**
- Modify: `site/lib/AudioPlayerContext.tsx`

Goal: those fields have no consumer after Tasks 13–14. Delete them from the interface, state, callbacks, and value objects.

- [ ] **Step 1: Edit `AudioPlayerContext.tsx`.**

Apply these deletions (file path: `site/lib/AudioPlayerContext.tsx`):

```ts
// In the interface (around line 24):
// REMOVE:
panelOpen: boolean;
// (line 34, 35):
togglePanel: () => void;
closePanel: () => void;

// In the provider body (around line 55):
// REMOVE:
const [panelOpen, setPanelOpen] = useState(false);

// (around lines 224-225):
const togglePanel = useCallback(() => setPanelOpen((o) => !o), []);
const closePanel = useCallback(() => setPanelOpen(false), []);

// In the two value objects exposed by the provider (around lines 260, 282):
// REMOVE these keys: panelOpen, togglePanel, closePanel.
```

- [ ] **Step 2: Verify compile.**

Run: `cd site && npx tsc --noEmit`

If any consumer still references the removed fields, the compiler will surface them — track them down and remove the reference. Expected: zero remaining consumers (Tasks 13 and 14 cleared them).

- [ ] **Step 3: Visual verification.**

1. Reload localhost:3000. App loads. Hover grid → controls reveal. Playback works.
2. Open DevTools console — no errors about `panelOpen`.

- [ ] **Step 4: Commit.**

```bash
git add site/lib/AudioPlayerContext.tsx
git commit -m "refactor: drop panel-visibility state from AudioPlayerContext"
```

---

## Task 16: Delete obsolete files

**Files:**
- Delete: `site/components/music/PlayerPanel.tsx`
- Delete: `site/components/music/SeekBar.tsx`
- Delete: `site/components/music/VisualizerSceneToggle.tsx`

- [ ] **Step 1: Confirm no consumers.**

```bash
cd "site"
grep -rn "PlayerPanel\|SeekBar\|VisualizerSceneToggle" --include="*.tsx" --include="*.ts" .
```

Expected: only matches inside the files themselves (their own `export default` lines). No imports from elsewhere.

- [ ] **Step 2: Delete.**

```bash
git rm site/components/music/PlayerPanel.tsx
git rm site/components/music/SeekBar.tsx
git rm site/components/music/VisualizerSceneToggle.tsx
```

- [ ] **Step 3: Verify compile.**

```bash
cd site && npx tsc --noEmit
```

Expected: exit 0.

- [ ] **Step 4: Commit.**

```bash
git commit -m "chore: delete legacy player components (PlayerPanel, SeekBar, VisualizerSceneToggle)"
```

---

## Task 17: Final QA pass

**Files:** none modified — verification only.

- [ ] **Step 1: Run a full `tsc --noEmit`.**

```bash
cd site && npx tsc --noEmit
```

Expected: exit 0.

- [ ] **Step 2: Walk through every state in the dev server.**

Open localhost:3000 and verify each of the following at lg+ viewport:
- Page load: dot grid renders ambient wave; nothing else over it.
- Hover (no music): play glyph appears centered; cursor leaves → glyph disappears.
- Click play glyph: audio starts; release; hover again → title + artist appear top-left, ⏮ ⏸ ⏭ glyphs centered, scene picker top-right, scrubber bottom.
- Click prev / next: title + artist crossfade; transport unaffected.
- Click each scene icon: visualizer pattern in the underlying shader changes accordingly.
- Click on the dot bar mid-progress: playback seeks; timecode jumps.
- Cursor leaves: controls fade out, visualizer keeps running.
- Pause: hover shows ⏮ ▶ ⏭ (pause toggles to play glyph); resume on click.
- Tab into the wrapper: focus ring visible. Press Space, ←, →, [ , ] , Home, End — all work.
- Track change: SR announces "Now playing: …" via the live region.

- [ ] **Step 3: Walk through the same states at mobile viewport (DevTools device emulator).**

- Tap the grid: controls reveal.
- Tap a glyph: action fires.
- Tap outside: controls hide.
- At narrow widths (<400 px), the artist line and scene picker are dropped per spec §6.

- [ ] **Step 4: Final commit (if any cosmetic fixes were needed).**

If everything passed without code changes, no commit is needed. Otherwise:

```bash
git add -p   # stage only the cosmetic fixes
git commit -m "fix: <whatever was tweaked during QA>"
```

---

## Self-review (writer's pass)

**Spec coverage**

| Spec section | Implementing task(s) |
|---|---|
| §3 States 1, 3 | Task 4 (no-op for state 1; visualizer untouched preserves state 3) |
| §3 State 2 (idle revealed) | Task 4 |
| §3 State 4 (playing revealed) | Tasks 6, 7 |
| §3 Transitions | Task 10 (reveal), Task 11 (track-change crossfade) |
| §4 Architecture | Task 2, Task 3 |
| §5 Files (new / modified / removed) | Tasks 1–2 (new), 3, 13–15 (modified), 16 (removed) |
| §6 Layout (cells) | Tasks 6, 7 |
| §6 Responsive fallback | Task 11 |
| §7 Bitmap font + glyph atlases | Task 1 |
| §8 Reveal trigger (desktop hover) | Tasks 4, 9 |
| §8 Reveal trigger (touch) | Task 9 |
| §8 Click regions | Tasks 5, 8 |
| §8 Track-change crossfade, scrubber tick | Tasks 7, 11 |
| §9 Accessibility | Task 12 |
| §10 Sizing & DPR | Task 2 |
| §11 Scene-state ownership | Resolved in plan preamble — `useVisualizerScene` already exists; consumed in Task 6. |
| §11 Mobile hit-target sizing | Task 9 (deferred-expand strategy noted in step 2). |
| §11 Track-change crossfade vs. fade-only | Task 11 implements fade-only with two-half opacity (out → in). |

**Placeholders:** none remain. Every step has concrete code or commands.

**Type consistency:** `drawText`, `drawGlyph`, `truncateToCols`, `formatClock`, `GLYPH_7x7`, `GLYPH_5x5_SCENES`, `FONT_3x5`, `DotGlyph` — all referenced consistently across Tasks 1, 4, 6, 7. `setOnlyScene`, `activeScenes` from `useVisualizerScene` — referenced consistently in Tasks 6, 8, 12. `togglePlay`, `prev`, `next`, `seek`, `currentTime`, `duration`, `currentTrack` from `useAudioPlayer` — referenced consistently.

**Risks called out in spec §12:** addressed in implementation (shared ResizeObserver in Task 2; bbox-scoped scrubber redraw is the only periodic cost in Task 7; invisible buttons stacked over click regions in Task 12; discovery deferred to V2 telemetry as noted).

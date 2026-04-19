# Jellyfish ASCII Variant Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a second jellyfish scene (`jellyfish-ascii`) that plays back a matted ASCII cutout of a real jellyfish video, with flicker / color-pulse / positional-drift layered on top via DialKit. Scoped to `/dev/pixel-lab`.

**Architecture:** Two parts. (1) Offline CLI (`scripts/video-to-ascii.mjs`) that turns an `.mp4` into a compact JSON of per-frame char grids using `ffmpeg` + `jimp` with a brightness-threshold matte. (2) New runtime scene (`jellyfish-ascii.ts`) that fetches the JSON, plays frames against `frame.t`, and renders each non-space cell as a single `fillText` in `--color-accent` with alpha ramped by char density. Drift layers are modulated from a shared `getConfig()` callback so a DialKit panel on the pixel-lab page controls live values.

**Tech Stack:** Node ESM + `jimp` (dev-only) + `ffmpeg` (Homebrew); Next.js 16 / React 18, Canvas 2D, `dialkit`, existing `pixel-canvas` foundation (`Scene`, `PixelCanvas`, `readPalette`, `createNoise2D`).

**Spec:** `docs/superpowers/specs/2026-04-19-jellyfish-ascii-variant-design.md`

**Conventions used in this plan:**
- All `npm` commands run from `site/` unless noted. The root repo has a `scripts/` dir at repo root (sibling of `site/`).
- This codebase has no test runner (`package.json` has no test script). "Verify" steps are script-output inspection and visual pixel-lab checks. There is no unit-test task — the spec explicitly calls for a light smoke test on the converter (done via a Node one-liner) and visual verification at runtime.
- Commit after every task (small, frequent commits).

---

## File Structure

| Path | Purpose | Task |
|---|---|---|
| `scripts/video-to-ascii.mjs` | Offline CLI: ffmpeg → jimp → JSON | 2 |
| `site/public/ascii/jellyfish-a.json` | Generated asset | 4 |
| `site/components/pixel-canvas/primitives/ascii.ts` | Font-metric measurement + cell-text drawing helper | 5 |
| `site/components/pixel-canvas/scenes/jellyfish-ascii.ts` | New scene — loader + draw loop + modulation layers | 6, 7, 8, 9, 10, 11 |
| `site/app/dev/pixel-lab/page.tsx` | Side-by-side canvases + DialKit panel | 12 |
| `package.json` (root) | Add `jimp` devDep + `ascii:convert` script | 1 |
| `source-videos/` (gitignored) | Input videos for the converter — not committed | 1, 4 |

Files explicitly **not** touched: `PixelCanvas.tsx`, `engine.ts`, `palette.ts`, `types.ts`, `primitives/{noise,verlet-chain,raster,dither}.ts`, `scenes/jellyfish.ts`.

---

## Task 1: Set up workspace (root package.json, gitignore, jimp)

**Files:**
- Modify: `package.json` (repo root)
- Modify: `.gitignore` (repo root)
- Create: `source-videos/.gitkeep`

- [ ] **Step 1: Check repo-root `package.json` exists**

Run from repo root (`/Users/marcosevilla/Developer/portfolio 2026`):
```bash
ls package.json 2>/dev/null && cat package.json | head -20 || echo "NO ROOT PACKAGE.JSON"
```

Expected: either a root `package.json` exists (use it) or no root `package.json` exists (create one). If root `package.json` exists, add `jimp` + script to it. If not, create a minimal one:

```json
{
  "name": "portfolio-2026-tools",
  "private": true,
  "type": "module",
  "scripts": {
    "ascii:convert": "node scripts/video-to-ascii.mjs"
  },
  "devDependencies": {
    "jimp": "^0.22.12"
  }
}
```

- [ ] **Step 2: Install jimp at repo root**

Run from repo root:
```bash
npm install --save-dev jimp@^0.22.12
```

Expected: creates root `node_modules/` and `package-lock.json`. No errors.

- [ ] **Step 3: Update root `.gitignore`**

Append (if not already present):
```
# Local video sources for offline ASCII conversion
source-videos/*
!source-videos/.gitkeep
# Offline converter temp frames
tmp/
# Root node_modules (in addition to site/node_modules)
/node_modules/
```

- [ ] **Step 4: Create placeholder for video sources**

```bash
mkdir -p source-videos
touch source-videos/.gitkeep
```

- [ ] **Step 5: Verify ffmpeg is on PATH**

```bash
which ffmpeg && ffmpeg -version | head -1
```

Expected: a path and a version line. If missing:
```bash
brew install ffmpeg
```

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json .gitignore source-videos/.gitkeep
git commit -m "Set up offline ASCII converter workspace"
```

---

## Task 2: Build the offline converter

**Files:**
- Create: `scripts/video-to-ascii.mjs`

- [ ] **Step 1: Create the script**

```javascript
// scripts/video-to-ascii.mjs
// Convert a video file into a matted ASCII JSON sequence.
// Usage:
//   node scripts/video-to-ascii.mjs \
//     --input=./source-videos/jellyfish.mp4 \
//     --out=./site/public/ascii/jellyfish-a.json \
//     --cols=80 --fps=24 --matte-threshold=32 --min-visible=40 --trim=0:3

import { execSync } from "node:child_process";
import { readdirSync, readFileSync, writeFileSync, mkdirSync, rmSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import Jimp from "jimp";

const DEFAULTS = {
  cols: 80,
  fps: 24,
  matteThreshold: 32,
  minVisible: 40,
  charset: " .:-=+*#%@",
  trim: "",
};

function parseArgs(argv) {
  const args = { ...DEFAULTS };
  for (const raw of argv.slice(2)) {
    const m = raw.match(/^--([^=]+)=(.*)$/);
    if (!m) continue;
    const key = m[1].replace(/-([a-z])/g, (_, c) => c.toUpperCase());
    const val = m[2];
    if (["cols", "fps", "matteThreshold", "minVisible"].includes(key)) {
      args[key] = Number(val);
    } else {
      args[key] = val;
    }
  }
  return args;
}

function printHelp() {
  console.log(`
video-to-ascii: offline ASCII sequence generator.

Required:
  --input=<path>       Path to source .mp4
  --out=<path>         Path to output .json

Optional (defaults):
  --cols=${DEFAULTS.cols}              Target grid width in chars
  --fps=${DEFAULTS.fps}               Frames per second
  --matte-threshold=${DEFAULTS.matteThreshold}   Luminance below which pixels are matte
  --min-visible=${DEFAULTS.minVisible}       Second threshold to suppress dim ghosting
  --charset="${DEFAULTS.charset}"  Density ramp
  --trim=START:END      Trim in seconds, e.g. 0:3

Dependencies: ffmpeg on PATH; jimp in node_modules.
`);
}

async function main() {
  const args = parseArgs(process.argv);

  if (!args.input || !args.out) {
    printHelp();
    process.exit(1);
  }

  if (!existsSync(args.input)) {
    console.error(`Input not found: ${args.input}`);
    process.exit(1);
  }

  const tmp = join(process.cwd(), "tmp", `ascii-${Date.now()}`);
  mkdirSync(tmp, { recursive: true });

  const trimFlags = args.trim
    ? (() => {
        const [start, end] = args.trim.split(":");
        return `-ss ${start} -to ${end}`;
      })()
    : "";

  const vf = `fps=${args.fps},scale=${args.cols}:-1`;
  const cmd = `ffmpeg -y ${trimFlags} -i "${args.input}" -vf "${vf}" "${tmp}/frame_%04d.png"`;
  console.log(`> ${cmd}`);
  execSync(cmd, { stdio: "inherit" });

  const files = readdirSync(tmp).filter((f) => f.endsWith(".png")).sort();
  if (files.length === 0) {
    console.error("ffmpeg produced no frames");
    process.exit(1);
  }

  // Probe first frame to find rows
  const probe = await Jimp.read(join(tmp, files[0]));
  const cols = probe.bitmap.width;
  const rows = probe.bitmap.height;

  const frames = [];
  for (const f of files) {
    const img = await Jimp.read(join(tmp, f));
    let out = "";
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const { r, g, b } = Jimp.intToRGBA(img.getPixelColor(x, y));
        const L = 0.299 * r + 0.587 * g + 0.114 * b;
        if (L < args.matteThreshold || L < args.minVisible) {
          out += " ";
        } else {
          const denom = Math.max(1, args.charset.length - 1);
          const t = Math.min(1, (L - args.minVisible) / (255 - args.minVisible));
          const idx = Math.max(1, Math.round(t * denom));
          out += args.charset[idx];
        }
      }
      if (y < rows - 1) out += "\n";
    }
    frames.push(out);
  }

  // Loop-seam diagnostic: mean abs diff between frame 0 and last frame.
  let diff = 0;
  const a = frames[0];
  const b = frames[frames.length - 1];
  const len = Math.min(a.length, b.length);
  for (let i = 0; i < len; i++) if (a[i] !== b[i]) diff++;
  const seamPct = ((diff / len) * 100).toFixed(1);
  console.log(`Loop-seam similarity: ${seamPct}% of cells differ between first and last frame.`);

  mkdirSync(dirname(args.out), { recursive: true });
  const json = {
    cols,
    rows,
    fps: args.fps,
    charset: args.charset,
    frames,
  };
  writeFileSync(args.out, JSON.stringify(json));
  const size = (readFileSync(args.out).length / 1024).toFixed(1);
  console.log(`Wrote ${args.out} (${size} KB, ${frames.length} frames, ${cols}×${rows}).`);

  rmSync(tmp, { recursive: true, force: true });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
```

- [ ] **Step 2: Smoke-test with `--help`**

```bash
node scripts/video-to-ascii.mjs
```

Expected: prints the help block and exits with code 1.

- [ ] **Step 3: Commit**

```bash
git add scripts/video-to-ascii.mjs
git commit -m "Add offline video-to-ascii converter script"
```

---

## Task 3: Offline-pipeline smoke test

**Files:** none created — this task just runs the script against a generated fixture to prove the pipeline works end-to-end before we feed it a real jellyfish video.

- [ ] **Step 1: Generate a synthetic test clip with ffmpeg**

From repo root:
```bash
mkdir -p source-videos
ffmpeg -y -f lavfi -i "testsrc=duration=1:size=160x90:rate=10" source-videos/test.mp4
```

Expected: a 1-second test video at `source-videos/test.mp4`.

- [ ] **Step 2: Run the converter**

```bash
node scripts/video-to-ascii.mjs \
  --input=source-videos/test.mp4 \
  --out=/tmp/ascii-smoke.json \
  --cols=40 --fps=10 --matte-threshold=0 --min-visible=0 --trim=0:1
```

Expected stdout contains:
- The ffmpeg command echoed
- `Loop-seam similarity: <n>% of cells differ...`
- `Wrote /tmp/ascii-smoke.json (<n> KB, 10 frames, 40×<rows>).`

- [ ] **Step 3: Inspect the output JSON**

```bash
node -e 'const d=require("/tmp/ascii-smoke.json"); console.log({cols:d.cols,rows:d.rows,fps:d.fps,frameCount:d.frames.length,firstFrameFirstRow:d.frames[0].split("\n")[0]})'
```

Expected: `cols: 40`, `fps: 10`, `frameCount: 10`, a row containing a mix of charset characters (testsrc is colorful so most cells will be non-matte).

- [ ] **Step 4: Clean up the test clip**

```bash
rm -f source-videos/test.mp4 /tmp/ascii-smoke.json
```

- [ ] **Step 5: Commit (no code changes — skip if tree is clean)**

```bash
git status
```

Expected: tree clean. No commit required.

---

## Task 4: Source the real jellyfish video and generate the asset

**Files:**
- Create: `site/public/ascii/jellyfish-a.json`

- [ ] **Step 1: Pause for human input**

The spec says "I'll find 2–3 Pexels candidates and Marco picks one." The executing agent should stop here and surface three Pexels moon-jelly / black-water candidates to Marco. Suggested search terms: `moon jellyfish black background`, `aurelia aurita black`, `jellyfish aquarium dark`. Good candidates: free Pexels videos ≥10s at ≥720p.

Paste the Pexels URLs into the session, get Marco's pick, download it to `source-videos/jellyfish.mp4`.

If the executing agent cannot fetch from Pexels, surface this as a blocker and ask Marco to drop a local file at `source-videos/jellyfish.mp4`.

- [ ] **Step 2: Run the converter against the real clip**

Initial pass (defaults):
```bash
node scripts/video-to-ascii.mjs \
  --input=source-videos/jellyfish.mp4 \
  --out=site/public/ascii/jellyfish-a.json \
  --cols=80 --fps=24 --matte-threshold=32 --min-visible=40 --trim=0:3
```

Expected: JSON written, size < 250 KB, seam similarity logged.

- [ ] **Step 3: Spot-check the output**

```bash
node -e '
const d = require("./site/public/ascii/jellyfish-a.json");
console.log("dims:", d.cols, "x", d.rows, "frames:", d.frames.length, "fps:", d.fps);
// Print a mid-sequence frame with matte space preserved, so we can visually confirm the jellyfish silhouette.
console.log(d.frames[Math.floor(d.frames.length / 2)]);
'
```

Expected: a clear jellyfish silhouette is visible in the terminal output, surrounded by blank space. If the silhouette has noisy "dots" floating in the matte, increase `--min-visible` (e.g. 50). If the jellyfish edges are eaten away, lower `--matte-threshold` (e.g. 24). Re-run until the silhouette looks clean.

- [ ] **Step 4: Commit the generated asset**

```bash
git add site/public/ascii/jellyfish-a.json
git commit -m "Add matted ASCII sequence for jellyfish variant 2"
```

---

## Task 5: Add the ascii drawing primitive

**Files:**
- Create: `site/components/pixel-canvas/primitives/ascii.ts`

- [ ] **Step 1: Write `ascii.ts`**

```ts
// site/components/pixel-canvas/primitives/ascii.ts
// Small helper for cell-aligned monospace text rendering in pixel-canvas scenes.
// Concerns: measuring char width once per font config (cross-OS monospace drift),
// and exposing a tight drawChar() that assumes a pre-set ctx.font/fillStyle.

export type CellMetrics = {
  cellWidthPx: number;    // measured advance width of the reference glyph
  baselineOffsetPx: number; // y-offset from cell top to text baseline
};

export function measureCell(
  ctx: CanvasRenderingContext2D,
  cellSizePx: number,
  fontWeight: number,
  fontFamily: string
): CellMetrics {
  ctx.font = `${fontWeight} ${cellSizePx}px ${fontFamily}`;
  const m = ctx.measureText("M");
  // measureText's width is the advance width; for a monospace it approximates cell width.
  // Fall back to 0.6 * cellSize if measureText returns 0 (rare, but safe).
  const cellWidthPx = m.width > 0 ? m.width : cellSizePx * 0.6;
  // Use the glyph's actual ascent if available, else a sensible default (~0.8 * size).
  const ascent =
    typeof m.actualBoundingBoxAscent === "number" && m.actualBoundingBoxAscent > 0
      ? m.actualBoundingBoxAscent
      : cellSizePx * 0.8;
  return { cellWidthPx, baselineOffsetPx: ascent };
}

export function drawChar(
  ctx: CanvasRenderingContext2D,
  char: string,
  col: number,
  row: number,
  metrics: CellMetrics,
  cellSizePx: number,
  driftX = 0,
  driftY = 0
): void {
  const x = col * metrics.cellWidthPx + driftX;
  const y = row * cellSizePx + metrics.baselineOffsetPx + driftY;
  ctx.fillText(char, x, y);
}
```

- [ ] **Step 2: Typecheck**

From `site/`:
```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add site/components/pixel-canvas/primitives/ascii.ts
git commit -m "Add cell-aligned ascii drawing primitive"
```

---

## Task 6: Scene skeleton — types, fetch, no-op draw

**Files:**
- Create: `site/components/pixel-canvas/scenes/jellyfish-ascii.ts`

- [ ] **Step 1: Write the scene skeleton**

```ts
// site/components/pixel-canvas/scenes/jellyfish-ascii.ts
import type { Scene, FrameCtx } from "../types";
import { createNoise2D } from "../primitives/noise";
import { measureCell, drawChar, type CellMetrics } from "../primitives/ascii";
import { withAlpha } from "../palette";

export type AsciiSequence = {
  cols: number;
  rows: number;
  fps: number;
  charset: string;
  frames: string[];
};

export type JellyfishAsciiConfig = {
  cellSize: number;
  fontFamily: string;
  fontWeight: number;
  flickerRate: number;
  flickerDepth: number;
  colorPulseAmplitude: number;
  colorPulseFrequency: number;
  driftAmplitude: number;
  driftFrequency: number;
  playbackRate: number;
};

export const DEFAULT_CONFIG: JellyfishAsciiConfig = {
  cellSize: 8,
  fontFamily: "ui-monospace, Menlo, monospace",
  fontWeight: 500,
  flickerRate: 0.04,
  flickerDepth: 1,
  colorPulseAmplitude: 0.25,
  colorPulseFrequency: 0.35,
  driftAmplitude: 6,
  driftFrequency: 0.18,
  playbackRate: 1,
};

type State = {
  sequence: AsciiSequence;
  getConfig: () => JellyfishAsciiConfig;
  noise: (x: number, y: number) => number;
  metrics: CellMetrics | null;
  lastFontKey: string;
};

export function createJellyfishAsciiScene(opts: {
  sequence: AsciiSequence;
  getConfig?: () => JellyfishAsciiConfig;
}): Scene<State> {
  const getConfig = opts.getConfig ?? (() => DEFAULT_CONFIG);
  return {
    id: "jellyfish-ascii",
    init() {
      return {
        sequence: opts.sequence,
        getConfig,
        noise: createNoise2D(1337),
        metrics: null,
        lastFontKey: "",
      };
    },
    draw(ctx: CanvasRenderingContext2D, state: State, _frame: FrameCtx) {
      // No-op in skeleton. Later tasks fill this in.
      void ctx;
      void state;
    },
  };
}
```

- [ ] **Step 2: Typecheck**

From `site/`:
```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add site/components/pixel-canvas/scenes/jellyfish-ascii.ts
git commit -m "Add jellyfish-ascii scene skeleton"
```

---

## Task 7: Implement base playback + brightness-ramped accent

**Files:**
- Modify: `site/components/pixel-canvas/scenes/jellyfish-ascii.ts`

- [ ] **Step 1: Replace the `draw` function**

Replace the existing `draw` no-op with this implementation:

```ts
    draw(ctx: CanvasRenderingContext2D, state: State, frame: FrameCtx) {
      const cfg = state.getConfig();
      const { sequence } = state;
      const { charset } = sequence;

      // (Re)measure cell metrics when font config changes.
      const fontKey = `${cfg.fontWeight}|${cfg.cellSize}|${cfg.fontFamily}`;
      if (fontKey !== state.lastFontKey || !state.metrics) {
        state.metrics = measureCell(ctx, cfg.cellSize, cfg.fontWeight, cfg.fontFamily);
        state.lastFontKey = fontKey;
      }
      ctx.font = `${cfg.fontWeight} ${cfg.cellSize}px ${cfg.fontFamily}`;
      ctx.textBaseline = "alphabetic";

      const rate = frame.reducedMotion ? 0.5 : cfg.playbackRate;
      const frameIndex =
        Math.floor(frame.t * sequence.fps * rate) % sequence.frames.length;
      const frameStr = sequence.frames[frameIndex];

      const rampMax = Math.max(1, charset.length - 1);

      let col = 0;
      let row = 0;
      for (let i = 0; i < frameStr.length; i++) {
        const ch = frameStr[i];
        if (ch === "\n") {
          row++;
          col = 0;
          continue;
        }
        if (ch !== " ") {
          const baseIdx = charset.indexOf(ch);
          const alpha = baseIdx / rampMax;
          ctx.fillStyle = withAlpha(frame.palette.accent, alpha);
          drawChar(ctx, ch, col, row, state.metrics!, cfg.cellSize);
        }
        col++;
      }
    },
```

- [ ] **Step 2: Typecheck**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add site/components/pixel-canvas/scenes/jellyfish-ascii.ts
git commit -m "Render ASCII frames with brightness-ramped accent"
```

---

## Task 8: Add flicker modulation

**Files:**
- Modify: `site/components/pixel-canvas/scenes/jellyfish-ascii.ts`

- [ ] **Step 1: Add a hash helper above `createJellyfishAsciiScene`**

Insert this helper *between* `DEFAULT_CONFIG` and `type State`:

```ts
// Cheap integer hash — same inputs produce same output within a frame
// (so flicker is stable per cell per frame, not seizure-like frame-local random).
function hash3(a: number, b: number, c: number): number {
  let h = (a | 0) * 374761393 + (b | 0) * 668265263 + (c | 0) * 2246822519;
  h = (h ^ (h >>> 13)) >>> 0;
  h = Math.imul(h, 1274126177) >>> 0;
  return (h ^ (h >>> 16)) >>> 0;
}

function hashUnit(a: number, b: number, c: number): number {
  return hash3(a, b, c) / 0xffffffff;
}
```

- [ ] **Step 2: Update the per-cell block in `draw` to apply flicker**

Replace the `if (ch !== " ") { ... }` block with:

```ts
        if (ch !== " ") {
          let idx = charset.indexOf(ch);
          if (cfg.flickerRate > 0 && hashUnit(col, row, frameIndex) < cfg.flickerRate) {
            // Signed step in [-flickerDepth, +flickerDepth]
            const signHash = hashUnit(col + 1, row, frameIndex ^ 0x9e37);
            const magHash = hashUnit(col, row + 1, frameIndex ^ 0x9e37);
            const step = Math.round((signHash * 2 - 1) * cfg.flickerDepth * magHash);
            idx = Math.min(rampMax, Math.max(1, idx + step));
          }
          const ch2 = charset[idx];
          const alpha = idx / rampMax;
          ctx.fillStyle = withAlpha(frame.palette.accent, alpha);
          drawChar(ctx, ch2, col, row, state.metrics!, cfg.cellSize);
        }
```

Note: `flickerRate` and `flickerDepth` drop to 0 when `frame.reducedMotion` is true (wired in Task 11). For now, reducedMotion only affects `rate`.

- [ ] **Step 3: Typecheck**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add site/components/pixel-canvas/scenes/jellyfish-ascii.ts
git commit -m "Add per-cell flicker modulation to ASCII jellyfish"
```

---

## Task 9: Add color pulse modulation

**Files:**
- Modify: `site/components/pixel-canvas/scenes/jellyfish-ascii.ts`

- [ ] **Step 1: Compute `alphaPulse` once per frame, before the cell loop**

Inside `draw`, **after** computing `frameIndex` and **before** the `for (let i = 0; i < frameStr.length; i++)` loop, insert:

```ts
      const pulsePhase = Math.sin(2 * Math.PI * cfg.colorPulseFrequency * frame.t);
      const alphaPulse = 1 - cfg.colorPulseAmplitude * (0.5 + 0.5 * pulsePhase);
```

- [ ] **Step 2: Multiply cell alpha by the pulse**

Inside the cell-draw block (the `if (ch !== " ") { ... }` section from Task 8), change:

```ts
          const alpha = idx / rampMax;
```

to:

```ts
          const alpha = alphaPulse * (idx / rampMax);
```

- [ ] **Step 3: Typecheck**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add site/components/pixel-canvas/scenes/jellyfish-ascii.ts
git commit -m "Add breathing color pulse to ASCII jellyfish"
```

---

## Task 10: Add positional drift

**Files:**
- Modify: `site/components/pixel-canvas/scenes/jellyfish-ascii.ts`

- [ ] **Step 1: Compute drift once per frame**

Immediately after the `alphaPulse` lines in `draw`, add:

```ts
      const driftX = cfg.driftAmplitude * state.noise(frame.t * cfg.driftFrequency, 0);
      const driftY = cfg.driftAmplitude * state.noise(0, frame.t * cfg.driftFrequency);
```

- [ ] **Step 2: Pass drift into `drawChar`**

Change:

```ts
          drawChar(ctx, ch2, col, row, state.metrics!, cfg.cellSize);
```

to:

```ts
          drawChar(ctx, ch2, col, row, state.metrics!, cfg.cellSize, driftX, driftY);
```

- [ ] **Step 3: Typecheck**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add site/components/pixel-canvas/scenes/jellyfish-ascii.ts
git commit -m "Add Perlin positional drift to ASCII jellyfish"
```

---

## Task 11: Wire reduced-motion into every layer

**Files:**
- Modify: `site/components/pixel-canvas/scenes/jellyfish-ascii.ts`

- [ ] **Step 1: Override config fields when reducedMotion is true**

At the top of `draw`, **after** `const cfg = state.getConfig();`, insert this override so the rest of the function reads a flattened config:

```ts
      const effective: JellyfishAsciiConfig = frame.reducedMotion
        ? {
            ...cfg,
            flickerRate: 0,
            flickerDepth: 0,
            colorPulseAmplitude: 0,
            driftAmplitude: 0,
            playbackRate: 0.5,
          }
        : cfg;
```

Then replace **every** remaining reference to `cfg.` inside `draw` (after this point) with `effective.`. Since `effective` spreads `cfg` as its base, font-related fields (`cellSize`, `fontWeight`, `fontFamily`) are identical on both — replacing uniformly is safe. Affected lines include:
- `const rate = frame.reducedMotion ? 0.5 : cfg.playbackRate;` → `const rate = effective.playbackRate;`
- `cfg.fontWeight | cfg.cellSize | cfg.fontFamily` (in `fontKey`) → `effective.fontWeight | effective.cellSize | effective.fontFamily`
- `measureCell(ctx, cfg.cellSize, cfg.fontWeight, cfg.fontFamily)` → `measureCell(ctx, effective.cellSize, effective.fontWeight, effective.fontFamily)`
- `ctx.font = \`${cfg.fontWeight} ${cfg.cellSize}px ${cfg.fontFamily}\`;` → `ctx.font = \`${effective.fontWeight} ${effective.cellSize}px ${effective.fontFamily}\`;`
- `cfg.colorPulseFrequency` → `effective.colorPulseFrequency`
- `cfg.colorPulseAmplitude` → `effective.colorPulseAmplitude`
- `cfg.driftAmplitude` → `effective.driftAmplitude`
- `cfg.driftFrequency` → `effective.driftFrequency`
- `cfg.flickerRate` → `effective.flickerRate`
- `cfg.flickerDepth` → `effective.flickerDepth`
- `state.metrics!, cfg.cellSize` in `drawChar` → `state.metrics!, effective.cellSize`

After the replacement, there should be zero `cfg.` references inside `draw` other than the initial `state.getConfig()` assignment.

- [ ] **Step 2: Typecheck**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add site/components/pixel-canvas/scenes/jellyfish-ascii.ts
git commit -m "Honor prefers-reduced-motion in ASCII jellyfish"
```

---

## Task 12: Update the pixel-lab page with DialKit panel

**Files:**
- Modify: `site/app/dev/pixel-lab/page.tsx`

- [ ] **Step 1: Rewrite the pixel-lab page**

```tsx
"use client";

import PixelCanvas from "@/components/pixel-canvas/PixelCanvas";
import { createJellyfishScene } from "@/components/pixel-canvas/scenes/jellyfish";
import {
  createJellyfishAsciiScene,
  DEFAULT_CONFIG as ASCII_DEFAULTS,
  type AsciiSequence,
  type JellyfishAsciiConfig,
} from "@/components/pixel-canvas/scenes/jellyfish-ascii";
import { useEffect, useMemo, useRef, useState } from "react";
import { useDialKit } from "dialkit";

export default function PixelLabPage() {
  const proceduralScene = useMemo(() => createJellyfishScene(), []);

  const dials = useDialKit("Jellyfish ASCII", {
    cellSize: [ASCII_DEFAULTS.cellSize, 6, 16],
    fontWeight: [ASCII_DEFAULTS.fontWeight, 400, 700],
    flickerRate: [ASCII_DEFAULTS.flickerRate, 0, 0.2],
    flickerDepth: [ASCII_DEFAULTS.flickerDepth, 0, 3],
    colorPulseAmplitude: [ASCII_DEFAULTS.colorPulseAmplitude, 0, 1],
    colorPulseFrequency: [ASCII_DEFAULTS.colorPulseFrequency, 0.05, 2],
    driftAmplitude: [ASCII_DEFAULTS.driftAmplitude, 0, 20],
    driftFrequency: [ASCII_DEFAULTS.driftFrequency, 0.01, 1],
    playbackRate: [ASCII_DEFAULTS.playbackRate, 0.25, 2],
  });

  // Ref the latest dial values so the scene's getConfig() always reads fresh values.
  const configRef = useRef<JellyfishAsciiConfig>(ASCII_DEFAULTS);
  configRef.current = {
    ...ASCII_DEFAULTS,
    cellSize: dials.cellSize,
    fontWeight: dials.fontWeight,
    flickerRate: dials.flickerRate,
    flickerDepth: dials.flickerDepth,
    colorPulseAmplitude: dials.colorPulseAmplitude,
    colorPulseFrequency: dials.colorPulseFrequency,
    driftAmplitude: dials.driftAmplitude,
    driftFrequency: dials.driftFrequency,
    playbackRate: dials.playbackRate,
  };

  const [sequence, setSequence] = useState<AsciiSequence | null>(null);
  useEffect(() => {
    let cancelled = false;
    fetch("/ascii/jellyfish-a.json")
      .then((r) => r.json())
      .then((data: AsciiSequence) => {
        if (!cancelled) setSequence(data);
      })
      .catch((e) => console.warn("Failed to load ASCII sequence:", e));
    return () => {
      cancelled = true;
    };
  }, []);

  const asciiScene = useMemo(() => {
    if (!sequence) return null;
    return createJellyfishAsciiScene({
      sequence,
      getConfig: () => configRef.current,
    });
  }, [sequence]);

  return (
    <div style={{ padding: 40, display: "flex", flexDirection: "column", gap: 32 }}>
      <h1 style={{ fontSize: 18, fontWeight: 500 }}>Pixel Lab — Jellyfish</h1>

      <div style={{ display: "flex", gap: 48, alignItems: "flex-start", flexWrap: "wrap" }}>
        <div>
          <div style={{ fontSize: 11, opacity: 0.6, marginBottom: 8 }}>
            Procedural — 200×280 CSS (100×140 logical @ 2×)
          </div>
          <div style={{ border: "1px dashed var(--color-border)" }}>
            <PixelCanvas scene={proceduralScene} widthCssPx={200} heightCssPx={280} pixelScale={2} />
          </div>
        </div>
        <div>
          <div style={{ fontSize: 11, opacity: 0.6, marginBottom: 8 }}>
            ASCII cutout — 320×240 CSS (no upscale)
          </div>
          <div style={{ border: "1px dashed var(--color-border)", minWidth: 320, minHeight: 240 }}>
            {asciiScene ? (
              <PixelCanvas scene={asciiScene} widthCssPx={320} heightCssPx={240} pixelScale={1} />
            ) : (
              <div style={{ padding: 12, fontSize: 11, opacity: 0.5 }}>Loading sequence…</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
```

Notes for the engineer:
- `pixelScale={1}` for the ASCII canvas: the matted frame is already at its target resolution, and we want sub-pixel antialiased text. Running at `pixelScale=2` would blur the characters.
- The `widthCssPx` / `heightCssPx` values (320×240) are a starting point; once the sequence lands and tuning begins, they can be adjusted so the grid fits tightly. Don't over-engineer this in code — use DialKit for `cellSize` and eyeball the fit.

- [ ] **Step 2: Typecheck**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Start the dev server**

From `site/`:
```bash
npm run dev
```

Expected: server starts on `localhost:3000`, no console errors about missing modules.

- [ ] **Step 4: Manually verify the page loads**

Open `http://localhost:3000/dev/pixel-lab`. Expected:
- Left canvas: existing procedural jellyfish animating as before.
- Right canvas: ASCII cutout rendering with the default copper accent. Should show a jellyfish silhouette made of density-ramp characters.
- DialKit panel visible with a "Jellyfish ASCII" section.

- [ ] **Step 5: Commit**

```bash
git add site/app/dev/pixel-lab/page.tsx
git commit -m "Add ASCII jellyfish to pixel-lab with DialKit panel"
```

---

## Task 13: Visual verification checklist

**Files:** none — pure QA.

- [ ] **Step 1: Light theme**

Load `http://localhost:3000/dev/pixel-lab` in default (light) theme. Expected: ASCII jellyfish in copper accent visible against white background, all three modulation layers active (move DialKit sliders to feel each one).

- [ ] **Step 2: Dark theme**

Toggle theme via the Theme Palette (sticky footer icon). Expected: accent remains copper but brighter; still legible on dark background.

- [ ] **Step 3: Colored theme**

Pick `ocean` or `wine` in Theme Palette. Expected: ASCII jellyfish recolors to the theme accent without reload.

- [ ] **Step 4: Reduced motion**

On macOS: System Settings → Accessibility → Display → enable "Reduce motion". Reload the page. Expected: frame playback at half-speed; no flicker; no positional drift; no color pulse (flat accent).

- [ ] **Step 5: Off-screen pause**

Scroll the ASCII canvas off-screen (resize window or add padding) while watching CPU. Expected: RAF pauses (inherited `PixelCanvas` behavior — no code under test here).

- [ ] **Step 6: Loop seam**

Let it run for ≥1 full loop (check converter output for frame count ÷ fps = loop seconds). Expected: no visible jump at the seam. If jump is visible, re-run the converter with a tighter `--trim` window and re-commit the asset.

- [ ] **Step 7: Log any issues**

If anything is off, either adjust DialKit defaults (bake them into `DEFAULT_CONFIG` and commit) or file as a follow-up in `docs/superpowers/specs/2026-04-19-jellyfish-ascii-variant-design.md` under "Open follow-ups". Do not expand scope — loop crossfade, multi-video support, and homepage placement are explicitly non-goals.

- [ ] **Step 8: Final commit (if defaults changed)**

```bash
git status
git add -p
git commit -m "Tune ASCII jellyfish defaults after visual QA"
```

If no changes, skip the commit.

---

## Rollback

If anything goes wrong, every task commits independently — revert the specific commit(s):

```bash
git log --oneline -20
git revert <sha>
```

The variant 1 scene, PixelCanvas wrapper, and all primitives are untouched, so reverting this feature can never break variant 1.

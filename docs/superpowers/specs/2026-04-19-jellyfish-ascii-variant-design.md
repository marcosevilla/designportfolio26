# Jellyfish ASCII Variant — Design Spec

**Date:** 2026-04-19
**Author:** Marco Sevilla (with Claude)
**Status:** Draft — awaiting review

---

## Overview

A second jellyfish variant for the `pixel-canvas` scene library. Unlike variant 1 (procedural pixel-art), this variant is an **ASCII cutout** matted from a real jellyfish video — the source footage's ocean background is removed at conversion time, leaving only the jellyfish rendered as characters. Procedural layers (flicker, color pulse, positional drift) run on top at runtime so it doesn't feel like a canned loop.

**Primary objective:** realistic, textural, "made of letters" aesthetic reminiscent of [ascii-motion.app](https://ascii-motion.app/) — while reusing as much of the existing `pixel-canvas` foundation as possible.

**Placement:** `/dev/pixel-lab` only. No homepage or case-study integration in this spec.

## Decisions locked in during brainstorming

| # | Decision |
|---|---|
| Approach | Hybrid: pre-rendered matted ASCII frames + procedural drift layered on top |
| Source | Pexels black-water moon jelly clip (I source it; Marco picks from 2–3 candidates) |
| Matte | Simple brightness threshold (no AI background removal needed) |
| Charset | Classic density ramp `" .:-=+*#%@"` |
| Drift layers | Flicker + color pulse + positional drift — all three, DialKit-tunable |
| Color | Brightness-ramped `--color-accent`: char index → alpha |
| Scope | `/dev/pixel-lab` only for now, side-by-side with variant 1 |

## Architecture

Two parts: **offline pipeline** (runs once per source video, produces a static JSON asset) and **runtime scene** (slots into the existing `Scene<TState>` contract and plays the asset back with procedural layers).

### File layout

```
scripts/
└── video-to-ascii.mjs              NEW — offline CLI: ffmpeg → jimp → JSON

site/
├── public/ascii/
│   └── jellyfish-a.json            NEW — generated static asset
├── components/pixel-canvas/
│   ├── primitives/
│   │   └── ascii.ts                NEW — font-metric measurement + cell-text drawing helper
│   └── scenes/
│       └── jellyfish-ascii.ts      NEW — second jellyfish scene
└── app/dev/pixel-lab/page.tsx      MODIFIED — add second PixelCanvas + DialKit panel

package.json                        MODIFIED — add `jimp` devDep + `ascii:convert` script
```

**Files NOT touched (explicitly preserved):**
- `site/components/pixel-canvas/PixelCanvas.tsx`
- `site/components/pixel-canvas/engine.ts`
- `site/components/pixel-canvas/palette.ts`
- `site/components/pixel-canvas/types.ts`
- `site/components/pixel-canvas/primitives/{noise,verlet-chain,raster,dither}.ts`
- `site/components/pixel-canvas/scenes/jellyfish.ts` (variant 1)

### Reused foundation

- `Scene<TState>` contract — variant 2 implements the same interface.
- `PixelCanvas.tsx` — RAF, theme subscription, reduced-motion, IntersectionObserver pausing, pixel upscale. Zero changes.
- `readPalette()` / `withAlpha()` — accent + theme-aware color.
- `createNoise2D()` — drives positional drift (shared with variant 1).

## Offline pipeline

### Command

```bash
node scripts/video-to-ascii.mjs \
  --input=./source-videos/jellyfish.mp4 \
  --out=site/public/ascii/jellyfish-a.json \
  --cols=80 --fps=24 --matte-threshold=32 --min-visible=40 --trim=0:3
```

Also aliased as `npm run ascii:convert -- <args>` via `package.json`.

### Steps

1. `ffmpeg -i <input> -ss <trim-start> -to <trim-end> -vf "fps=<fps>,scale=<cols>:-1" tmp/frame_%04d.png` — extract + downscale. Height auto-derives from aspect ratio (typically lands in the 45–60 row range for HD jellyfish clips).
2. For each PNG, via `jimp`:
   - Compute per-pixel luminance: `L = 0.299r + 0.587g + 0.114b`.
   - If `L < matte-threshold` → emit space (matte).
   - Else if `L < min-visible` → also emit space (avoids dim water ghosting in as `.`).
   - Else → map `L` onto `charset` via linear quantization to pick a char.
3. Join rows with `\n`, push into `frames[]`.
4. Emit JSON with metadata.
5. On exit, print loop-seam similarity (mean absolute difference between frame 0 and frame N) to stdout so we know whether the loop will be visually clean.

### Data format

```json
{
  "cols": 80,
  "rows": 54,
  "fps": 24,
  "charset": " .:-=+*#%@",
  "frames": [
    "                    \n       .:-=-:.      \n     .:-=+*+=-:.    \n   ...etc...\n",
    "..."
  ]
}
```

- Space = matte, don't draw.
- Non-space = char index in `charset`.
- One string per frame, newline-separated within the string. Small, human-readable, trivial to parse.
- Expected size: ~50–150 KB gzipped for a 3-second 24fps 80×54 loop.

### Dependencies

- **`jimp`** — added as a devDependency. Zero native deps; pure JS image decoding.
- **`ffmpeg`** — expected to be on `PATH`. Documented in the script's `--help` output; install via `brew install ffmpeg` on macOS. `ffmpeg-static` (~30MB dev dep) is explicitly rejected — the one-time manual install is a better tradeoff for a dev-only pipeline.

### Tuning knobs (CLI flags, re-runnable)

| Flag | Purpose |
|---|---|
| `--cols` | Grid width (detail vs legibility) |
| `--fps` | Target frame rate (fewer frames = smaller JSON) |
| `--matte-threshold` | Luminance cutoff for the ocean matte |
| `--min-visible` | Second cutoff to avoid dim-edge ghosting |
| `--charset` | Override the density ramp |
| `--trim` | `start:end` in seconds — pick the cleanest loop from a longer source |

## Runtime scene

### Config & state

```ts
type JellyfishAsciiConfig = {
  cellSize: number;             // px per char cell — drives apparent size
  fontFamily: string;           // "ui-monospace, Menlo, monospace"
  fontWeight: number;
  flickerRate: number;          // 0..1 — fraction of cells trembling per frame
  flickerDepth: number;         // max ± steps on the density ramp
  colorPulseAmplitude: number;  // 0..1 — alpha modulation range
  colorPulseFrequency: number;  // Hz
  driftAmplitude: number;       // px — peak xy translation of whole cutout
  driftFrequency: number;       // Hz — drift cycles per second
  playbackRate: number;         // 1 = real-time; reduced-motion halves it
};

type AsciiSequence = {
  cols: number;
  rows: number;
  fps: number;
  charset: string;
  frames: string[];
};

type State = {
  data: AsciiSequence | null;   // null until fetch resolves
  config: JellyfishAsciiConfig;
  noise: Noise2D;
};
```

### Defaults (starting point; DialKit-tunable)

```ts
const DEFAULT_CONFIG: JellyfishAsciiConfig = {
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
```

### Init

- Kicks off `fetch('/ascii/jellyfish-a.json')`, stores `data` on state when it resolves.
- Scene renders nothing until data lands. Canvas host pages can optionally `<link rel="preload" as="fetch" href="/ascii/jellyfish-a.json" />` to avoid visible loading gap — not required.

### Draw loop

Per frame:

1. If `state.data == null` — return (blank canvas).
2. `rate = frame.reducedMotion ? 0.5 : config.playbackRate`.
3. `frameIndex = Math.floor(frame.t * data.fps * rate) % data.frames.length`.
4. Compute global modulation:
   - `alphaPulse = 1 - amp * (0.5 + 0.5 * sin(2π * freq * t))` — breathing color pulse.
   - `drift.x = driftAmp * noise2d(t * driftFreq, 0)`.
   - `drift.y = driftAmp * noise2d(0, t * driftFreq)`.
5. `ctx.font = \`${weight} ${cellSize}px ${fontFamily}\`` — set once per frame. Column pixel-width is sourced from `ascii.ts` (measured once at init via `ctx.measureText('M').width`), so cell alignment survives cross-OS monospace differences.
6. Walk the frame string by row/col. For each non-space cell:
   - `baseIdx = charset.indexOf(cell)`.
   - Flicker: if `hash(col, row, frameIndex) < flickerRate`, offset `baseIdx` by `±hashStep(col, row, frameIndex, flickerDepth)` — cheap deterministic per-cell hash so shimmer is stable *within* a frame (prevents seizure-like jitter) but varies frame-to-frame.
   - `char = charset[clamp(baseIdx + flicker, 1, charset.length - 1)]`.
   - `x = col * cellSize + drift.x`.
   - `y = row * cellSize + drift.y + cellSize` (baseline offset).
   - `alpha = alphaPulse * (baseIdx / (charset.length - 1))` — **brightness-ramped accent**: dimmer chars draw at lower alpha.
   - `ctx.fillStyle = withAlpha(palette.accent, alpha)`.
   - `ctx.fillText(char, x, y)`.

### Reduced motion

- `playbackRate` → 0.5.
- `flickerRate` → 0 (no shimmer).
- `driftAmplitude` → 0 (no translation).
- `colorPulseAmplitude` → 0 (flat accent).
- Result: real video plays at half-speed as a static cutout in accent color. Complies with `prefers-reduced-motion` while still showing the variant.

### Loading / error handling

- Fetch failure: scene stays blank. `console.warn` once. No retry loop (dev-only surface).
- Empty `frames[]`: same.
- Both boundaries are fine to fail silently here because `/dev/pixel-lab` is dev-only.

## Pixel-lab integration

`/dev/pixel-lab/page.tsx` is updated to render two `PixelCanvas` instances side-by-side:

- **Left (existing):** "Procedural" — variant 1, current DialKit panel unchanged.
- **Right (new):** "ASCII cutout" — variant 2, new DialKit panel labeled **"Jellyfish ASCII"**.

Layout: stacked on mobile, side-by-side at `md+`. Each panel is independent — tuning one doesn't affect the other.

DialKit slider groups for variant 2:

| Group | Sliders |
|---|---|
| Rendering | `cellSize` (6–16), `fontWeight` (400–700) |
| Flicker | `flickerRate` (0–0.2), `flickerDepth` (0–3 int) |
| Color pulse | `colorPulseAmplitude` (0–1), `colorPulseFrequency` (0.05–2 Hz) |
| Drift | `driftAmplitude` (0–20 px), `driftFrequency` (0.01–1 Hz) |
| Playback | `playbackRate` (0.25–2) |

## Testing & verification

- **Offline converter:** light smoke test — run on a known tiny clip, assert output JSON has expected `cols`/`rows`/`fps`/non-empty `frames[]`.
- **Runtime scene:** visual only. Verification checklist in the plan.
- **Theme adaptivity:** manually verify against light, dark, and at least one colored theme (`ocean` or `wine`).
- **Reduced motion:** toggle OS-level setting; confirm all three procedural layers drop out and playback halves.
- **Off-screen pause:** confirm RAF stops (existing IO handling — inherited, not retested).

## Scope boundaries — explicit non-goals

- **No** homepage or case-study placement.
- **No** multiple source videos or scene parameterization for alternate sequences.
- **No** crossfade / loop-boundary smoothing (log as follow-up if the seam is visually jarring).
- **No** localStorage persistence of DialKit values (ephemeral is fine).
- **No** changes to variant 1 or any primitive other than the new `ascii.ts`.
- **No** unit tests on the runtime scene (visual tuning only).

## Risks & mitigations

| Risk | Mitigation |
|---|---|
| Matte threshold clips jellyfish edges (too aggressive) or lets ocean bleed through (too loose) | Dual-threshold system (`matte-threshold` + `min-visible`) plus re-runnable CLI. Iterate until the stdout preview reads clean. |
| Loop seam is visible | Converter prints seam-similarity metric; if bad, shorten `--trim` window to pick a cleaner loop or (follow-up) add runtime crossfade. |
| JSON asset bloats past ~200KB | Reduce `--fps` to 20 or 15 (jellyfish move slowly, imperceptible), or reduce `--cols` to 60. Both tunable without code changes. |
| `ffmpeg` not installed | Script exits with a clear brew install instruction in `--help`. |
| Font metrics differ across OS for the monospace stack | Use `ctx.measureText('M').width` at init for column alignment rather than assuming `cellSize * 0.6`. |

## Open follow-ups (post-ship, not this spec)

- Crossfade at loop boundary if the seam shows.
- Additional source clips (e.g. box jelly, sea nettle) swappable via a `src` prop.
- Promotion to homepage or a case-study hero once we've tuned the feel.

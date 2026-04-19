# Pixel Jellyfish — Design Spec

**Date:** 2026-04-18
**Author:** Marco Sevilla (with Claude)
**Status:** Draft — awaiting review

---

## Overview

A small, colorful, pixel-art motion illustration of a jellyfish that sits above the hero heading on the portfolio homepage. Lightweight, theme-adaptive, organic motion. Built on a reusable `<PixelCanvas>` primitive so future pixel decorations share the same foundation.

**Primary objective (Q13-D):** alive, memorable, and not showy.

## Approach

Canvas 2D with programmatic pixel rendering. Verlet physics for tentacles, Simplex noise for drift, sine-wave bell pulse with Poisson-sampled variance. Zero new dependencies (~2 KB custom). Theme colors read from CSS variables.

**Rejected alternatives** (see research summary in conversation history):
- Sprite sheets — not reproducible, visible loops, no theme support.
- SVG — can't do physics cleanly.
- Lottie / Rive — awkward pixel fidelity + theme overrides.
- WebGL shader — overkill at 200×280.
- Paper Metaballs fallback — viable but less reusable and less jellyfish-specific.

## Architecture

### File layout

```
site/components/pixel-canvas/
├── PixelCanvas.tsx          React wrapper: canvas, RAF, IntersectionObserver,
│                            theme subscription, reduced-motion handling
├── engine.ts                Frame loop + dt clock. Framework-agnostic.
├── palette.ts               readPalette() → { accent, accentSoft, fgTertiary } from CSS vars
├── primitives/
│   ├── verlet-chain.ts      Jakobsen-style verlet rope (nodes, constraints, step)
│   ├── noise.ts             Simplex noise (inline, ~100 LOC, zero deps)
│   ├── dither.ts            Bayer 4×4 threshold helper for shading
│   └── raster.ts            rect(), disc(), line() snapped to pixel grid
├── scenes/
│   └── jellyfish.ts         First scene implementation
└── types.ts                 Scene, Palette, FrameCtx types
```

### Scene API (reuse contract)

```ts
type Scene = {
  id: string;
  init(config: { width: number; height: number; seed?: number }): SceneState;
  draw(ctx: CanvasRenderingContext2D, state: SceneState, frame: FrameCtx): void;
};

type FrameCtx = {
  t: number;              // seconds since mount (paused when reduced-motion or offscreen)
  dt: number;             // seconds since last frame (clamped to ≤ 1/30)
  palette: Palette;       // current theme colors
  reducedMotion: boolean;
};

type Palette = {
  accent: string;       // --color-accent
  accentSoft: string;   // 55% opacity blend of accent toward bg
  fgTertiary: string;   // --color-fg-tertiary
};
```

### Usage

```tsx
<PixelCanvas
  scene={jellyfishScene}
  widthCssPx={200}
  heightCssPx={280}
  pixelScale={2}
  className="pointer-events-none"
/>
```

## Visual design

### Canvas

- **Desktop:** 200×280 CSS px, 100×140 logical px, `pixelScale={2}`
- **Mobile:** 140×196 CSS px, 70×98 logical px, `pixelScale={2}`
- `image-rendering: pixelated` on the canvas element
- Transparent background

### Bell (top 35% of canvas)

- Rounded umbrella silhouette via polar equation `r = base * (1 + 0.06 * cos(phi*10))`
- Radial ribs from the cosine harmonic (tunable count 6–14, default 10)
- Scalloped skirt edge (bottom rim undulates ±2px)
- **Shading via Bayer 4×4 dither:** interior = `accentSoft`, rim = `accent`, upper-left highlight 20% = `fgTertiary` at low opacity

### Oral arms (middle 25%)

- 3 short frilly strands clustered at bell center
- Chained rects with per-node width taper
- Elastic follow of bell pulse (lag ~80ms)
- Color: `accent` at 100%, a couple pixels of `accentSoft` for thickness variance

### Trailing tentacles (bottom 40%)

- **6 tentacles** with varied lengths: `[1.0, 0.65, 1.1, 0.75, 0.95, 0.55]` × base length
- Each tentacle: verlet chain of 10 nodes, rendered as 1-pixel-wide line
- Dithered shading along length (darker near bell, fading toward tip)
- **Depth variance:** 2 tentacles render at 60% opacity to read as "further back"
- Anchored at bell skirt rim (distributed across bottom arc, not center)

### Proportions (locked to reference photos)

| Section | % of canvas height |
|---|---|
| Bell | 35% |
| Oral arms | 25% |
| Trailing tentacles | 40% |

Bell-to-tentacle ratio ≈ 35:65.

### Color treatment (Q2-D)

Theme-derived palette pulled from CSS vars each theme change. Three colors: `accent`, `accentSoft` (computed blend), `fgTertiary`. Works across all 12 themes (light, dark, 10 colored) with zero per-theme code.

## Motion model

Three unrelated frequencies ensure the animation never visibly loops.

### 1. Bell pulse (deterministic sine + variable envelope)

- Base frequency 0.6 Hz, amplitude 12% vertical compression
- **Variable energy (Q5-D):** every 6–10 seconds (Poisson-sampled), amplitude scales to 1.7× for one contraction
- Poisson events, not periodic modulators — occasional stronger pulses feel natural, not rhythmic

### 2. Tentacle physics (verlet chain)

- Jakobsen integration, gravity 0.04 downward (weak, underwater)
- Lateral drift force = Simplex noise sampled at `(t * 0.25, tentacleIndex * 1.3)` × 0.08
- 4 constraint iterations per frame
- Bell-anchored: each pulse yanks tentacle roots, propagating a wave down the chains

### 3. Overall body bob (Q6-A)

- Canvas translation = `(noise(t*0.15) * 4px, noise(t*0.12 + 99) * 3px)`
- Subtle hover, never drifts more than 5–8px from center

### Reduced motion (Q7-C)

Uniform `dt * 0.25` when `prefers-reduced-motion: reduce`. Pulse, physics, and bob all slow to 1/4 speed together — stays coherent.

### Intro (Q12-A)

Scene starts drawing at mount. No separate intro sequence. First frame is alive.

## Composition & integration

### Homepage hero layout (Q9-B: top-left asymmetric)

Current hero:
```
[✸]  Marco Sevilla              ← name label
I bring clarity to enterprise…  ← heading
Currently at Canary…            ← bio
```

New hero:
```
[Jellyfish]

[✸]  Marco Sevilla
I bring clarity to enterprise
complexity through software
design…
```

Jellyfish sits in its own block above the name label, left-aligned (flush with ✸ indent). Heading retains existing left alignment — no wrap-around-image layout. Asymmetric editorial feel comes from the jellyfish being off-center in the ~500–640px hero column.

**Spacing:** 32px margin-bottom from jellyfish to the ✸ + name label row.

### Responsive (Q10-A)

| Breakpoint | Jellyfish size | Logical px | Position |
|---|---|---|---|
| `<lg` (1024px) | 140×196 CSS px | 70×98 | Top-left, flush with column padding |
| `≥lg` | 200×280 CSS px | 100×140 | Top-left, flush with hero column left edge |

CSS-driven via Tailwind `lg:` breakpoint. `<PixelCanvas>` accepts `widthCssPx` / `heightCssPx` props.

### Theme integration

`<PixelCanvas>` subscribes via `MutationObserver` on `document.documentElement`'s `class` attribute (theme toggle swaps `.dark` or `[data-theme="ocean"]` on `<html>`). On change, re-reads palette. Between changes, palette is cached — no per-frame `getComputedStyle` cost.

## Performance guards

- **IntersectionObserver:** RAF only runs when canvas ≥10% in viewport
- **Visibility API:** pauses on `document.hidden`
- **Frame budget:** 100×140 logical × 6 tentacles × 10 nodes → trivial (<5ms/frame target)
- **No React re-renders during animation:** scene state in `useRef`, canvas writes bypass React
- **`<PixelCanvas>` re-renders only when `scene`, `widthCssPx`, or `heightCssPx` change**

## Tuning route: `/dev/pixel-lab` (Q11-A)

Dev-only route mirroring `/dev/type-lab`. Canvas preview + DialKit slider panel.

### Sliders (persist to localStorage)

| Slider | Range | Default |
|---|---|---|
| Pulse frequency | 0.3–1.2 Hz | 0.6 |
| Pulse amplitude | 0.04–0.20 | 0.12 |
| Pulse variance interval | 4–12 s | 7 |
| Pulse variance multiplier | 1.2–2.5× | 1.7 |
| Tentacle count | 4–8 | 6 |
| Tentacle base length | 60–120 px | 90 |
| Tentacle stiffness | 0.85–0.99 | 0.94 |
| Gravity | 0.02–0.10 | 0.04 |
| Noise scale | 0.5–3.0 | 1.3 |
| Noise speed | 0.1–0.6 | 0.25 |
| Body bob amplitude | 0–8 px | 4 |
| Bell radial ribs | 6–14 | 10 |
| Dither intensity | 0–1 | 0.5 |
| Pixel scale | 1× / 2× / 3× / 4× | 2× |

### UI

- **Side-by-side preview:** desktop (200×280) + mobile (140×196), both tuned together
- **Lock values button:** copies TypeScript snippet of current config to clipboard
- **Presets:** "Reset to defaults," "Very calm," "Alert"

## Accessibility

- Uniform `dt * 0.25` time scaling when `prefers-reduced-motion: reduce`
- `aria-hidden="true"` on the canvas (decorative only)
- `pointer-events: none` — never in tab order
- Runtime `matchMedia` listener for reduced-motion changes

## Testing

- **Visual:** eyeball in `/dev/pixel-lab` across all 12 themes. Screenshot desktop + mobile.
- **Functional:** `tsc --noEmit` passes via PostToolUse hook. Dev server renders `/dev/pixel-lab` and `/` without errors.
- **Perf:** Chrome Performance tab confirms <5ms/frame, RAF pauses on scroll past hero.
- **Reduced motion:** toggle macOS System Settings → verify ~1/4 speed.
- **Theme switching:** cycle through all 12 themes via Theme Palette → verify colors update within one frame.
- **No automated tests** — visual craft; consistent with `BackgroundTexture.tsx` and `Teaser.tsx`.

## File touch list

| File | Change |
|---|---|
| `site/components/pixel-canvas/*` | New library (PixelCanvas, engine, palette, primitives, scenes, types) |
| `site/components/Hero.tsx` | Add `<PixelCanvas scene={jellyfishScene} …>` as new block above `<✸ Marco Sevilla>` row |
| `site/app/dev/pixel-lab/page.tsx` | New dev route with DialKit tuning panel |

**Not touched:** `BackgroundTexture.tsx`, `HomeLayout.tsx`, typography, theme system.

## Risks

| Risk | Likelihood | Mitigation |
|---|---|---|
| Verlet tentacles stiff/rubbery on first pass | High | `/dev/pixel-lab` live tuning — iterate in minutes |
| Pixel aesthetic blurs on HiDPI | Medium | `image-rendering: pixelated` + integer scale factors only |
| Theme switch flash | Low | MutationObserver fires sync; next RAF uses new palette |
| Bell pulse + tentacle physics decouple visually | Medium | Bell anchors tentacle roots; physics naturally couples |
| Hero layout regression | Medium | Insert as new block above existing rows — no streaming-heading or bio changes |
| Initial look needs iteration | Guaranteed | DialKit loop; ship only when smiling |

## Out of scope

- Other creatures (pixel plant, constellation, fish) — Scene API supports them, separate specs
- Interactivity (cursor follow, click responses) — deferred
- Full CI visual regression testing — overkill for a decoration
- Animation speed controls in hero UI — tuning ends at `/dev/pixel-lab`; production is locked values

## Success criteria (Q13-D)

- Alive: feels organic, not mechanical
- Memorable: a signature detail someone mentions
- Not showy: ambient, doesn't compete with hero text
- Reusable: next pixel decoration ships in hours, not days

## Open questions

None — all 14 brainstorm questions answered.

# Dither backdrops for all work-marquee cards

**Date:** 2026-07-20
**Status:** Approved by Marco ("go for it")

## Goal

Extend the F&B card's animated Bayer-dither wave (`FnbDitherFrame`, ported
from the Paper design) to the other five work-marquee study cards —
compendium, upsells, checkin, general-task, design-system — with per-card
variation so the strip doesn't read as uniform. Playground cards are out of
scope (their full-bleed videos would hide a backdrop anyway).

## Requirements

1. **Randomized animation timing** — each card's wave runs at its own speed
   and phase.
2. **Consistent color logic** — every card uses the same accent-tint
   derivation as the F&B card (30% `--color-accent` mixed toward
   `--color-bg`, resolved via the probe-element + canvas round-trip),
   tracking theme/dark-mode flips.
3. **Randomized pattern position** — the wave pattern lands in a different
   region per card.
4. **Deterministic** — variation is seeded by the study slug, so the
   composition is stable across visits and individual cards can be
   art-directed later.

## Design

### New component: `site/components/DitherBackdrop.tsx`

The single home for the dither treatment. Owns:

- `DITHER_TINT` constant + `useAccentColor()` (moved from FnbDitherFrame)
- `useReducedMotion()` (moved from FnbDitherFrame; speed 0 when reduced)
- Shared shader constants: shape `wave`, type `4x4`, size 2
- A small deterministic string-hash → PRNG (mulberry32-style) that maps a
  `seed` prop to per-card params

Props: `seed: string` (the study slug), optional `overrides` for future
art direction.

Seeded param ranges (centered on the F&B anchor values):

| Param     | Range        | F&B anchor |
|-----------|--------------|------------|
| `speed`   | 0.08 – 0.25  | 0.15       |
| `frame`   | 0 – 9999     | n/a        |
| `offsetX` | −0.6 – 0.6   | 0          |
| `offsetY` | −0.6 – 0.6   | 0          |
| `scale`   | 1.3 – 1.9    | 1.58       |

Rotation stays 0 — tilting the wave breaks the family resemblance.

The canvas renders oversized and centered (same bleed approach as the F&B
card) with `colorBack` transparent so the card's `STUDY_FRAME_BG` fill
shows through.

### Refactor: `FnbDitherFrame.tsx`

Drops its inline `<Dithering>` layer, tint constant, and both hooks;
composes `<DitherBackdrop seed="fb-ordering" />` under the phone mock.
F&B's params are pinned to the Paper-design originals (speed 0.15,
centered, scale 1.58) via the overrides path so the anchor card is
pixel-unchanged.

### Wiring: `CaseStudyList.tsx` → `StudyMediaFrame`

Render `<DitherBackdrop seed={study.slug} />` as the first layer for every
study card except `fb-ordering` (whose FnbDitherFrame already includes
it). Existing media — DeviceShell video, floating UI mocks, the
"Under construction" placeholder — renders on top unchanged.

## Performance

Six ~420×323 WebGL canvases with a cheap fragment shader; most are
offscreen in the scroll strip. Accepted as-is. If it ever dips, the
follow-up is an IntersectionObserver that zeroes `speed` offscreen — not
built now (YAGNI).

## Alternatives considered

- **Hand-tuned per-slug config table** — more control, but manual; seeded
  PRNG + optional overrides gives the same escape hatch.
- **Single full-strip shader canvas with card masks** — best perf, but
  kills per-card variation and adds real complexity.

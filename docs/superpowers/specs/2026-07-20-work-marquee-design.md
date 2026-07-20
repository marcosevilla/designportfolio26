# Work Marquee + Neutral Card Shade — Design

**Date:** 2026-07-20
**Status:** Shipped, then partially superseded same-day (Marco's calls):
the auto-scroll conveyor became a static user-scrollable strip (no
duplication/animation), study-card fill went 4% → 10% ink
(`STUDY_FRAME_BG`; playground frames keep 4%), and all non-marquee home
content moved to the centered middle-6 band (`CONTENT_BAND` in
lib/layout-presets.ts). The mechanics below describe the original
auto-marquee for the record.
**Reference:** neesh.cc landing gallery — CSS-only infinite marquee (`translateX(0 → −50%)`, ~70s linear infinite, duplicated track)

## Goal

Replace the "Select work" editorial grid on the homepage with a full-bleed,
auto-scrolling horizontal marquee of the case-study cards, seated directly
under the bio. Simultaneously retire the per-slug brand tints on card media
frames in favor of one neutral, theme-aware shade slightly darker than the
page background.

## Decisions (made with Marco)

1. **Scope:** Work cards only. "Just for fun" playground cards stay as the
   existing 2-up grid further down. Testimonials stay between the two.
2. **Motion:** Auto marquee, neesh.cc style. Pauses on hover. No drag.
3. **Card shade:** `color-mix(in srgb, var(--color-fg) 4%, var(--color-bg))`
   — applied uniformly to study frames, playground frames, and empty-state
   placeholders (replaces `CARD_TINTS`/`CARD_BG`/`PLACEHOLDER_BG`). Tune
   live in-browser after build.

## Mechanics

- **Track:** flex row containing the card set rendered twice (an even number
  of copies). CSS keyframes animate the track `translateX(0 → −50%)`;
  because the two halves are identical, the loop point is invisible.
- **Timing:** 70s linear infinite baseline (matches neesh.cc). If the copy
  count doubles (see wide-screen guard), duration doubles so px/s speed is
  constant.
- **Hover:** `animation-play-state: paused` on wrapper hover so cards are
  easy to read and click.
- **Reduced motion:** animation off; wrapper becomes `overflow-x: auto`
  (a plain scrollable row) and the duplicate copies are `display: none` so
  users don't scroll past repeats.
- **A11y:** duplicate copies are `aria-hidden` + `inert` — screen readers
  and keyboard focus see each card exactly once.
- **Wide-screen guard:** a seamless −50% loop requires the half-track to be
  at least viewport width. 7 cards × 420px + gaps ≈ 3.1k px, so on
  viewports wider than that the set count doubles (2 → 4 copies), measured
  once on mount + resize.

## Layout

- Page flow unchanged: bio → "Select work" label → **marquee** →
  testimonials → "Just for fun" grid.
- The marquee strip breaks out of the 1128px editorial canvas to span the
  full viewport (`width: 100vw; margin-left: calc(50% − 50vw)` breakout).
- Cells are uniform: **420px wide × 323px tall**, 24px gap,
  `max-width: 80vw` so a full card is always visible on mobile. The
  featured full-canvas F&B treatment is retired — all cards equal, same
  order as today.
- Cards keep all existing behavior: media rendering (video / shell /
  layers / image), 0.5px border, radius 4, cursor-label title reveal,
  `CursorGlowOverlay` rim glow, `LockGate` + lightbox for locked studies,
  `Link` routes for the rest.

## Code changes

- `site/components/CaseStudyList.tsx`: new `StudyMarquee` replaces the
  study `<Grid>` inside `ProjectGrid`; `featured` prop plumbing removed;
  `CARD_TINTS` / `CARD_TINT_AMOUNT` / `CARD_BG` / `PLACEHOLDER_BG` deleted
  in favor of a single `FRAME_BG` const.
- `site/app/globals.css`: `@keyframes work-marquee` + `.work-marquee` /
  `.work-marquee-track` rules (hover pause, reduced-motion block).
- `--color-card-bg` in globals.css: usage removed from CaseStudyList; the
  variable itself deleted if nothing else references it.

## Out of scope

- Playground cards joining the marquee (revisit if the strip feels thin).
- Drag interaction (would force a JS-driven position; declined).
- Card captions returning (cards stay pure-visual).

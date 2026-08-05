---
description: Top-bar chrome, theme palette popover, music player, and LED matrix visualizer
paths:
  - "site/components/GlobalToolbar.tsx"
  - "site/components/PixelRain.tsx"
  - "site/components/HeaderToolbar.tsx"
  - "site/components/SiteHeader.tsx"
  - "site/components/LedMatrix.tsx"
  - "site/components/LocalStatus.tsx"
  - "site/components/music/**"
  - "site/components/HamburgerMenu.tsx"
  - "site/components/NavOverlay.tsx"
  - "site/components/ConnectLinks.tsx"
  - "site/lib/AudioPlayerContext.tsx"
  - "site/lib/visualizer-scenes.ts"
---

# Toolbar / chrome

## GlobalToolbar (CURRENT system, shipped 2026-08-05; un-FIXED to an in-flow row later the same day on Marco's call)
`components/GlobalToolbar.tsx`, mounted once in `app/layout.tsx` (before `<main>`). An
IN-FLOW row at the top of every route — `position: static`, scrolls away with the page.
The fixed z-150 pointer-transparent era lasted one day; if it ever returns, MobileNav's
inset coupling returns with it (see Mobile case studies below). Geometry: `pt-12` canvas
(`max-w-(--grid-max) px-4 sm:px-8`) → `Grid`/`Col` on **`CONTENT_BAND`** (`md
CONTENT_BAND_MD`) → `h-9` flex row. On the CONTENT_BAND the pixel glyph is left-aligned
with the "Marco Sevilla" h1 and the right cluster is flush with the bio's right edge
(verified 382/382 left and 1058/1058 optical right at 1440; the right cluster wrapper
carries `-mr-2` to cancel the last 32px button's ~8px internal glyph inset).
⚠️ Known off-by-a-hair: in the 1024–1199 window `.case-canvas` shifts case-study content
right 200px for the TOC, but the toolbar (mounted outside it) doesn't follow.

- **Left — PixelRain music entry** (`components/PixelRain.tsx`): 30×20 canvas, 7×5 LED
  grid of 2.5px cells seeded with the exact Figma glyph arrangement; pixels step DOWN one
  row per 150ms tick (discrete, no tweening), spawn p=0.45/column/tick ≈ the mock's 16-cell
  density, never draw outside the glyph bounds. Ink = the canvas's computed `color`, read
  per tick — the parent button supplies rest (fg-secondary) / hover (accent) /
  playing-or-open (accent) without re-rendering. **Cells carry a per-spawn SHADE**
  (2026-08-05): light = globalAlpha 0.5, base, dark = double-draw (ink alpha composites
  0.6 → ~0.84) — three tones of currentColor, no color parsing. **Rendering snaps to
  integer DEVICE pixels** (no ctx.scale; positions pre-rounded per column/row) — the old
  fractional-CSS-coordinate path anti-aliased every cell edge and read blurry. Verified:
  exactly 4 alpha levels in the backing store, zero AA edge pixels. Reduced motion:
  static seed (deterministic shade cycle), ticks still repaint for theme changes. Clicking toggles the music player (starts playback on first
  open, same contract as the old dock FAB).
- **Right — HeaderToolbar** (unchanged component): light/dark toggle + palette popover.
  **LocalStatus (time/weather) was DROPPED from the chrome 2026-08-05** — the component
  file is kept but unmounted site-wide (SiteHeader, also unmounted, is its only reference).
- **Music player**: `music/MusicPlayerPanel.tsx` — the old dock's expanded card (LED
  visualizer + transport + scrubber), portaled to `document.body` at z-200, left-anchored
  under the trigger and clamped to the viewport. **`PANEL_WIDTH = 340` is exported from
  the panel and imported by GlobalToolbar's clamp** — change it in one place. The popover
  tracks scroll (capture listener) since the anchor is in-flow now. Sized up 2026-08-05
  for touch: 340 wide (+ `max-w-[calc(100vw-16px)]`), viz 148 tall, transport buttons
  `.bio-toolbar-btn--lg` (40px, globals.css), corner controls 28px with filled triangle
  carets (local `CaretIcon`). Type is on tokens: title `typescale.h3`, artist
  `typescale.label`, times `typescale.monoLabel` + `tabular-nums`. Open/close lifecycle
  (outside-pointerdown excluding the trigger + panel via `.music-player-panel`, Esc)
  lives in GlobalToolbar, not the panel. **`MusicMiniWidget.tsx` (bottom-right dock
  FAB + EmittingNotes) was DELETED** — recover from git if the dock ever returns. ChatFab
  still owns the bottom-right `.floating-dock`.
- **Mobile case studies**: the inset coupling is GONE (2026-08-05, same day it was
  added) — MobileNav's sticky bar is a plain `px-5` row again because nothing floats over
  it; the in-flow toolbar renders BELOW the sticky bar and scrolls away. Do not restore
  the `pl-[64px] pr-[92px]` insets unless the toolbar goes fixed again.
- The h1 rows in HomeLayout and Hero (About) are name-only now — the controls that rode
  there 2026-07-20 → 2026-08-05 moved into this bar.
- **48/48 header rhythm (Marco, 2026-08-05)**: HomeLayout's wrapper paddingTop is a flat
  `48px` — deliberately EQUAL to the name↔bio `gap-12` so toolbar → name → bio are
  equidistant (measured 48/48). The home Grid's old `mt-8` was folded into that 48 —
  re-adding it breaks the rhythm. The toolbar's own `pt-12` positions the bar; the 48px
  paddingTop is the bar→name gap. About's header keeps its own internal Hero spacing
  (not on this rhythm).
- **Icon ruling (2026-08-05, reverses 2026-06-04)**: control icons are FILLED — Moon
  solid, Sun's core disc solid (rays stroked), transport Play/Pause/Skip solid with rect
  bars, panel carets solid triangles. `PaintBrushIcon` is DELETED from Icons.tsx — the
  palette trigger is now a **13px** disc filled `var(--color-accent)` (+ hairline
  `--color-border`): the active theme's own color; mono aliases accent→fg so it always
  contrasts with the bg. 13 not 15: a solid disc reads optically heavier than the
  neighboring stroked moon at equal size.

## ⚠️ Historical below — components that no longer exist
The "Unified Toolbar" system below was shipped 2026-05-02, but **`HeroToolbar.tsx` and `MobileToolbar.tsx` are both gone from the tree** (verified 2026-08-04). `SiteHeader` was also unmounted site-wide on 2026-07-20 (component kept for salvage); its contents moved into HomeLayout's h1 row. Treat the section below as historical intent and verify against the live components before acting on it.

**Likely successors (2026-08-04, PARTIALLY verified — confirm before relying on):**
- `HeroToolbar.tsx` → **`components/HeaderToolbar.tsx`**. Carries `.bio-toolbar-btn` and the palette trigger, but NOT the `iconRow` or the left "swap zone" the section below describes — so it is not a straight rename.
- `MobileToolbar.tsx` → **`components/MobileNav.tsx`** (plus `NavOverlay.tsx`). No "floating carousel" found in it, though `chat/ChatBar.tsx:113` still has a comment claiming the chat pill lives there.
- `music/LedMatrixUI.tsx` and `music/PlayerChip.tsx` — no file, and **zero references anywhere in the tree**. Treat as deleted, not renamed.
- `SectionSnap` — same: no file, no references. Deleted.

Stale comments referencing the old names survive in `CaseStudyList.tsx`, `HamburgerMenu.tsx`, `HighlightableBio.tsx`, `PaletteSwatches.tsx`, and `chat/ChatBar.tsx`. They are comments only — no live imports.

## Unified Toolbar (shipped 2026-05-02) — HISTORICAL
Replaced the prior split chrome (HeroActions, sticky footer, separate palette button). Single fixed-top bar across the homepage.
- **Desktop:** `components/HeroToolbar.tsx` *(missing)* — left cluster (HamburgerMenu, palette popover, music expand, LED matrix scene toggles) + right cluster (`LocalStatus` time/weather).
- **Mobile:** `components/MobileToolbar.tsx` *(missing)* — same content, vertical layout.
- **Palette popover:** Triggers ThemePalette content; uses `ToolbarIconButton` chrome (hover/active tint via `color-mix(in srgb, var(--color-accent) ...)`, focus ring).
- **LED matrix:** `components/LedMatrix.tsx` (canvas) + `components/music/LedMatrixUI.tsx` *(missing)* — scene toggles were lifted out of the matrix so they're visible on mobile and against the toolbar bg.
- **No greeting cycle:** the earlier rotating-greeting variant in the right cluster was removed.
- **No StickyFooter:** deleted — palette/marquee/email/LinkedIn moved into this bar (or into `ConnectLinks`).

## Theme Palette Picker
- **Surface:** Popover from the toolbar's palette button (desktop) / bottom sheet (mobile)
- **Sections:** Color swatches only (10 colored themes + mono + light/dark) and font-size ±/reset action buttons. Font-pairing picker was removed April 2026.
- **Persistence keys:** `theme-mode`, `theme-family`, `colored-theme-name`, `font-size-offset`
- Token/theme detail lives in `.claude/rules/design-tokens.md`.

## Music player card
`components/music/MusicPlayerPanel.tsx` (+ `InsetScrubber.tsx`) — see GlobalToolbar above
for entry point + lifecycle. Scrubber always visible; LED corner controls (scene arrows,
collapse chevron) show on whole-card hover; `LedMatrix` `CORNER_RADIUS = 0` so dots reach
the corners.

⚠️ `PlayerChip` is referenced in older docs but does not exist. `MusicMiniWidget` (the
bottom-right dock era, 2026-05 → 2026-08-05) is deleted, not renamed.

Spec: `docs/superpowers/specs/2026-04-28-led-matrix-player-design.md`. LedMatrix honors reduced-motion (rAF/GL leak was fixed).

## Nav overlay
`NavOverlayProvider` is mounted but `<NavOverlay />` is rendered nowhere — the drawer nav does not currently exist despite older docs describing a left-edge checkerboard rail → slide drawer. Mount or delete.

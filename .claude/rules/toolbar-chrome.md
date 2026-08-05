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

## GlobalToolbar (CURRENT system, shipped 2026-08-05 per the Aug 2026 Figma `controls` frame, node 264:4254)
`components/GlobalToolbar.tsx`, mounted once in `app/layout.tsx`. Fixed top bar on EVERY
route, `z-[150]`, floating over all content. The `<header>` is `pointer-events-none`; only
the two clusters take clicks. Inner row = `h-14` on the page canvas
(`max-w-(--grid-max) px-4 sm:px-8`) so the clusters track the content edges.

- **Left — PixelRain music entry** (`components/PixelRain.tsx`): 30×20 canvas, 7×5 LED
  grid of 2.5px cells seeded with the exact Figma glyph arrangement; pixels step DOWN one
  row per 150ms tick (discrete, no tweening), spawn p=0.45/column/tick ≈ the mock's 16-cell
  density, never draw outside the glyph bounds. Ink = the canvas's computed `color`, read
  per tick — the parent button supplies rest (fg-secondary) / hover (accent) /
  playing-or-open (accent) without re-rendering. Reduced motion: static seed, ticks still
  repaint for theme changes. Clicking toggles the music player (starts playback on first
  open, same contract as the old dock FAB).
- **Right — HeaderToolbar** (unchanged component): light/dark toggle + palette popover.
  **LocalStatus (time/weather) was DROPPED from the chrome 2026-08-05** — the component
  file is kept but unmounted site-wide (SiteHeader, also unmounted, is its only reference).
- **Music player**: `music/MusicPlayerPanel.tsx` — the old dock's expanded card (LED
  visualizer + transport + scrubber), portaled to `document.body` at z-200, left-anchored
  under the trigger and clamped to the viewport (`PANEL_WIDTH = 300`). Open/close
  lifecycle (outside-pointerdown excluding the trigger + panel via `.music-player-panel`,
  Esc) lives in GlobalToolbar, not the panel. **`MusicMiniWidget.tsx` (bottom-right dock
  FAB + EmittingNotes) was DELETED** — recover from git if the dock ever returns. ChatFab
  still owns the bottom-right `.floating-dock`.
- **Mobile case studies**: MobileNav's sticky Back/hamburger bar is also `h-14` and insets
  its row (`pl-[64px] pr-[92px]`, `sm:` 80/108) so the toolbar clusters and Back/hamburger
  read as ONE 56px glass band — toolbar z-150 floats over MobileNav z-50. Change one
  layer's geometry and you must re-check the other.
- The h1 rows in HomeLayout and Hero (About) are name-only now — the controls that rode
  there 2026-07-20 → 2026-08-05 moved into this bar.

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

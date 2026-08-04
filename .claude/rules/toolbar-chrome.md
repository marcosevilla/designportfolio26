---
description: Top-bar chrome, theme palette popover, music dock, and LED matrix visualizer
paths:
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

## ⚠️ Read this first — the described components no longer exist
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

## Music dock
`components/music/MusicMiniWidget.tsx` (+ `InsetScrubber.tsx`). Notes emit from the collapsed FAB while playing; scrubber always visible (RevealRow deleted); LED corner controls show on whole-player hover; `LedMatrix` `CORNER_RADIUS = 0` so dots reach the corners. The dock and `ChatFab` share one fixed container in `app/layout.tsx` — `MusicMiniWidget` no longer self-positions.

⚠️ `PlayerChip` is referenced in older docs but does not exist.

Spec: `docs/superpowers/specs/2026-04-28-led-matrix-player-design.md`. LedMatrix honors reduced-motion (rAF/GL leak was fixed).

## Nav overlay
`NavOverlayProvider` is mounted but `<NavOverlay />` is rendered nowhere — the drawer nav does not currently exist despite older docs describing a left-edge checkerboard rail → slide drawer. Mount or delete.

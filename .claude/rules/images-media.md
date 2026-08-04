---
description: Image/video asset strategy, optimization pipeline, and export conventions
paths:
  - "site/public/images/**"
  - "site/public/videos/**"
  - "site/scripts/optimize-images.mjs"
  - "site/scripts/image-map.json"
  - "site/lib/gallery-content.ts"
  - "site/components/case-study/ImagePlaceholder.tsx"
  - "site/components/case-study/CaseStudyHeroImage.tsx"
---

# Images & media

## Layout
Images live in `site/public/images/[case-study]/`. Per-study folders: `checkin/`, `design-system/`, `fb-ordering/`, `general-task/`, plus `gallery/`, `inline-chips/`, `photography/`.

## Status (as of the last audit)
Check-in, Design System, and General Task are fully wired up (no placeholders). F&B has 10 remaining, Compendium 15, Upsells 17 — all need Figma exports.

`ImagePlaceholder` descriptions double as the Figma-export shot list — write them as shot briefs.

## Optimization
- Script: `site/scripts/optimize-images.mjs`. The 2026-07-18 pass converted 20 PNGs → WebP ≤1600w (~41MB saved).
- Export guide with Figma specs, aspect ratios, and naming: `docs/VISUAL-EXPORT-GUIDE.md`.

## Known media debt
- `fb-mobile.mp4` is still the 16MB original — re-export at lower bitrate (drop-in replace, no code change). It also renders as a white slab in dark mode.
- `guest-experience-dash.mp4` (~15MB) plays in a 323px card and needs a re-export.
- Case-study PNGs without lazy/width/height still exist in places.

## Export gotchas
- **Radius mismatch:** `public/images/gallery/upsells/upsells-mocks.webp` had white corner wedges because the Figma export masked the panel at ~18px radius while the photo inside has ~40px corners baked in. Fixed in the raster (sharp, dest-in SVG rounded-rect mask at r=40, inset 1px to swallow the old AA fringe). **The SOURCE mock in Figma (node 506-10090) still has the mismatched radii** — any re-export reintroduces the wedges unless the frame radius is bumped to 40 in Figma first.
- **Video recording spec:** compositions that change mid-loop clip under a fixed crop. Record screen-only, tight.
- Figma capture lessons (from the 2026-08-02 accuracy QA): fonts fall back silently, small SVGs drop, CSS truncation is not captured. Screenshot QA is mandatory — `setBoundVariableForPaint` silently drops paint opacity, and applying a text style wipes `textCase`. Both are invisible in return values.

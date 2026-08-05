---
description: The editorial 12-column grid system, band breakpoints, presets, and content width rules
paths:
  - "site/components/layout/Grid.tsx"
  - "site/lib/layout-presets.ts"
  - "site/components/case-study/CaseStudyShell.tsx"
  - "site/components/case-study/MetaRail.tsx"
  - "site/components/HomeLayout.tsx"
  - "site/app/work/**/*.tsx"
  - "site/app/globals.css"
  - "site/scripts/test-grid-spec.ts"
---

# Editorial 12-Column Grid (shipped 2026-07-14, replaces TwoCol)

**Visual reference + prompting vocabulary: `docs/LAYOUT-REFERENCE.html`** (open in a browser). All pages share one 12-col canvas; content is *placed* per band, not wrapped.

- **Canvas**: `--grid-max: 1440px`, `--grid-gap: 24px` (globals.css). 1440 = 64px page padding (px-8, border-box) + 12×92.67px cols + 11×24px gaps, sized so `CONTENT_BAND` ("4-9") = **exactly 676px** — the measured openai.com article body width (2026-08-05 pass; was 1128/~520px). Case-study + home canvases both center on it. Root `<main>` no longer caps width — each page owns its measure.
- **Bands**: phone <768 / tablet 768–1199 / desktop ≥1200 (custom media queries on `.col-ed`, NOT Tailwind's lg=1024 — desktop compositions only apply with real room). Unset bands inherit downward: `lg → md → base → full`.
- **Primitives**: `site/components/layout/Grid.tsx` — `<Grid preset?>` + `<Col base? md? lg?>`, spec grammar `"1-6"` (inclusive) / `"full"`. Parser + presets: `site/lib/layout-presets.ts` (tests: `npx tsx scripts/test-grid-spec.ts`).
- **Presets**: prose (4-9, centered), prose-wide (3-10, centered), intro-rail (1-7 + 9-12 MetaRail), media-right (1-5 + 6-12), media-left (1-7 + 8-12), media-full, duo (1-6 + 7-12, holds on tablet), quote-offset (3-10). Prose is centered by Marco's call 2026-07-14 — left-edge prose read as lopsided on text-heavy pages. Preset assigns specs to `<Col>` children in order; explicit props win.
- **MetaRail** (`components/case-study/MetaRail.tsx`): Year/Role/Scope rail on every case-study intro + used conceptually by the home contact rail. Horizontal on tablet, vertical column at lg.
- **Per-section grids**: each section wraps itself in `<Grid>`; identical tracks keep columns aligned page-wide. Portrait media never goes media-full — use a narrow explicit span (e.g. `lg="5-8"`).
- **Contact sheets**: `cd site && npm run sheet -- <route> [--unlock] [--name <slug>] [--dark]` → `.sheets/<slug>/sheet.html` tiling 390/768/1024/1440 full-page screenshots (requires dev server; playwright-core + installed Chrome; hides Agentation). Use after any layout change.

## Margin/positioning traps — do not regress
- **Never stack logical + physical margin utilities across variants.** `min-[1560px]:mx-auto` (margin-*inline*) silently lost to `lg:ml-[200px]` (margin-*left*) at ALL widths, pinning the "responsive" canvas permanently left — variant order does not make them cascade. For conditional centering, write ONE CSS class with `margin-left: max(Xpx, calc((100vw - var(--max)) / 2))` instead. This is exactly the TOC-clearing + re-centering math on `CaseStudyShell` above.
- **Percentage-based `bottom` on `position: fixed` is viewport-relative, not content-relative** — it doesn't work for elements meant to sit between content blocks. Render inline for content-flow positioning; reserve `fixed` for genuinely viewport-anchored elements.

## Band alignment (2026-07-20 fifth pass → 2026-07-26 fourth pass)

⚠️ **All grid PRESETS now resolve to `CONTENT_BAND`** (lib/layout-presets.ts, `BAND` const) — preset names survive as semantic markers only; multi-slot presets stack as rows. Old compositions are in git. The preset vocabulary above describes the *pre-alignment* system; placement is now single-band.

- `CONTENT_BAND = "4-9"` (676px at full 1440 canvas since 2026-08-05) — the centered middle-6 desktop band.
- `CONTENT_BAND_MD = "3-10"` — 8-col tablet band, deliberately one step wider than the 6-col lg band so the 1200 hand-off is a gentle step instead of a harsh jump. Every explicit `lg={CONTENT_BAND}` call site also passes `md={CONTENT_BAND_MD}` (3 Content files, CaseStudyList, HomeLayout, CaseStudyShell).
- **Media matches the text measure** (Marco 2026-08-05): static images/captions sit on `CONTENT_BAND` like prose. The ONE exception: interactive DemoStage specimens + ObjectFlowDiagram use `md="1-12" lg="3-10"` (≈909px) — they're 1177px desktop UIs and DemoStage's 0.7 inline-scale floor would clip/pan them at 676px.
- `.case-canvas` is centered like home; the 200px TOC offset survives ONLY in the 1024–1199 window.
- **InlineTOC tracks the canvas, not the viewport** (2026-08-05): `left: max(48px, calc((100vw - var(--grid-max)) / 2 + 140px))` puts its right edge ~112px from the text band (openai.com-style proximity); the 48px floor reproduces the old flush-left position in the 1024–1199 window.
- TwoCol-era pages (checkin/upsells/general-task/design-system) opt into the `band` prop on `CaseStudyShell` (wraps children in one band Col). **Editorial pages must NOT set it** — nested grids would double-narrow.

## Content Width System (Stripe-inspired) — HISTORICAL
⚠️ This predates both July redesigns. Treat as historical; the band system above is current.
- `max-w-content` (650px) — case study body text, /writing, /play
- `max-w-content-md` (800px) — dialog inner content, case study hero inner
- `max-w-content-lg` (1060px) — dialog sheet, case study hero outer
- Padding: `px-4 sm:px-8` (16px mobile, 32px tablet+)
- `layout.tsx` no longer constrains `<main>` — each page handles its own width
- ⚠️ The original text referenced `SectionSnap` for the homepage bio/cards `max-w-[640px]` — **`SectionSnap` no longer exists** (deleted; homepage is normal document flow now).

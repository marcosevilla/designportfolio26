# Typography Consolidation — Design Spec

**Date:** 2026-04-18
**Status:** Approved by Marco, ready to plan
**Goal:** Reduce font variation site-wide to make the portfolio scan faster for recruiters and feel more intentionally designed.

---

## Context

The portfolio currently renders two font families on every public surface — Geist Sans (body, subtitles, list row titles, bio prose, marquee) and Departure Mono (hero name, card titles, card year labels, list row meta, section h2 headings, nav, QuickStats values, NextProject titles). A third axis comes from the Theme Palette's font pairings (`Default` / `Formula` / `Serif`), which load additional families (PP Formula, GT Cinetype, Instrument Serif, Instrument Sans) and can put a returning visitor into a three-font world.

The mono/sans split was originally intended to give the site a "designerly" editorial register. In practice it reads as zig-zag — mono at 28px (hero name) competes with mono at 11px (tiny meta labels), card titles ask for weight 500 but Departure Mono only ships weight 400 (browser faux-bolds), and case study h2s in mono slow the read.

**Direction chosen:** commit fully to one family, no mono anywhere public. Hierarchy comes from size and weight alone. Personality comes from color, photography, and the work itself.

## Goals

- One font family (Geist Sans) on all public surfaces — homepage, case studies, nav, marquee, theme palette.
- Three weights total: 400 (body, labels), 500 (titles, UI), 600 (hero emphasis).
- Case study section headings shift from prominent mono h2s to small sentence-case tertiary labels — "Problem" reads as a category tag, not a competing heading.
- Hero reframes so the *positioning statement* is the h1 and the name becomes a small supporting label.
- Remove the Theme Palette's font-pairing picker and delete unused font files, removing ~200–400 KB from first-load payload.
- Preserve: color palette picker, dark/light toggle, font size ±/reset accessibility control, Dynamic Bio mode.

## Non-Goals

- Redesigning layout, spacing, color, or component structure. This is a typography pass only.
- Updating the dev-only Type Lab (`/dev/type-lab`) — it has its own hard-coded font picker, not user-facing.
- Migrating localStorage state for returning visitors who previously selected "Formula" or "Serif" in the palette. The old key (`font-pairing`) becomes inert; no migration required.

## The New Typescale

All 18px+ elements use `letter-spacing: -0.01em`. Everything smaller uses `0`.

### Homepage

| Element | Size | Weight | Color | Change from today |
|---|---|---|---|---|
| Hero name label | 14px | 400 | fg-tertiary | was 28px mono 700, title case "Marco Sevilla" above statement |
| Hero statement (h1) | 28–32px | 600 | fg | was body 20px 400 — now the primary h1 |
| Card title | 18px | 500 | fg | was mono 500 (faux-bold) → real 500 sans |
| Card subtitle | 14–15px | 400 | fg-secondary | unchanged |
| Card year (inside card) | 11px | 400 | fg-tertiary | was mono |
| List row year / meta / metric | 11px | 400 | fg-tertiary | was mono (typescale.label) |
| List row title | 16px | 500 | fg | unchanged |
| Sidebar nav link | 16px | 400 | fg-secondary | was mono (typescale.nav) |
| Mobile nav link | 14px | 400 | fg-secondary | was mono |
| Bio prose | 16px / 28 line-height | 400 | fg-secondary | unchanged |
| Marquee quotes | 14px | 400 | fg-secondary | unchanged |

### Case Studies

| Element | Size | Weight | Color | Change from today |
|---|---|---|---|---|
| Hero h1 | clamp(28px, 3vw, 32px) | 600 | white | was mono 400 — now sans 600, bigger |
| Hero subtitle | 14px / 22 line-height | 400 | white/80 | unchanged |
| Section h2 ("Problem", "Solution") | 12–13px | 500 | fg-tertiary | was 18px mono — now small sentence-case label above section content, no tracking |
| Section h3 | 18px | 500 | fg | unchanged |
| Section h4 | 16px | 500 | fg | unchanged |
| Body prose | 14px / 22 line-height | 400 | fg-secondary | unchanged |
| QuickStats value | 24px | 500 | fg | was 20px mono 400 — bigger, now carries the stat |
| QuickStats label | 11px | 400 | fg-tertiary | unchanged |
| PullQuote | clamp(18px, 2.5vw, 22px) | 400 | fg | was weight 300 — 400 reads as intentional rather than thin |
| NextProject title | 22px | 500 | fg | was 20px mono |
| Page titles (/work, /writing, /play) | 24px | 500 | fg | was 700 — softer, matches new system |

## Infrastructure Changes

### `site/app/globals.css`

- Delete all `@font-face` declarations for PP Editorial New, PP Formula, PP Formula SemiExtended, GT Cinetype, Departure Mono.
- Collapse font variables: replace `--font-display`, `--font-heading`, `--font-body`, `--font-mono` with a single `--font-sans: var(--font-geist-sans), system-ui, sans-serif`.
- Delete `--font-heading-style` and `--font-pairing-boost` (both existed only to support the alternate font pairings).
- `body` font-family references `var(--font-sans)`.

### `site/app/layout.tsx`

- Remove `GeistPixelSquare`, `Instrument_Serif`, `Instrument_Sans` imports and their font-variable wiring on `<html>`.
- Keep `GeistSans` as the single font.

### `site/public/fonts/`

- Delete all `.woff2` files: `PPEditorialNew-Regular.woff2`, `PPEditorialNew-Italic.woff2`, `PPEditorialNew-UltralightItalic.woff2`, `PP-Formula-ExtraBold.woff2`, `PP-Formula-SemiExtendedBold.woff2`, `GT-Cinetype-Light.woff2`, `GT-Cinetype-Regular.woff2`, `GT-Cinetype-Bold.woff2`, `DepartureMono-Regular.woff2`.
- Verify via Grep that nothing else references these files before deletion.

### `site/lib/typography.ts`

- Drop the `boost` parameter from `scaled` / `scaledClamp` (there's no longer a font-pairing boost to apply).
- Every entry that currently references `var(--font-mono)` or `var(--font-display)` or `var(--font-heading)` points to `var(--font-sans)`.
- Update sizes/weights/colors per the tables above. Specifically:
  - `display` — was 40px mono, becomes `scaledClamp("28px", "3vw", "32px")` sans weight 600 (consumed by `Hero.tsx` h1 and `DynamicBioText`).
  - `caseStudyHero` — was 24–28px mono 400, becomes `scaledClamp("28px", "3vw", "32px")` sans weight 600.
  - `h2` — was 18px mono 400, becomes the new `sectionLabel` style (see below); remove the old `h2` entry or repoint it.
  - `statValue` — was 20px mono, becomes 24px sans weight 500.
  - `nextProjectTitle` — was 20px mono, becomes 22px sans weight 500.
  - `pageTitle` — was 24px weight 700, becomes 24px weight 500.
  - `label` — was mono 11px, becomes sans 11px weight 400 (letter-spacing drops from 0.02em to 0).
  - `nav` / `navMobile` — same sizes (16px / 14px), weight 400, family swapped to sans.
  - `pullQuote` — weight 300 → 400. Size unchanged.
- **New entry:** `sectionLabel` — `{ fontFamily: "var(--font-sans)", fontSize: "12px", fontWeight: 500, color: "var(--color-fg-tertiary)", lineHeight: 1.4 }`. Used by `SectionHeading` level 2.
- Keep unchanged: `h3`, `h4`, `body`, `subtitle`.

### `site/components/ThemeToggle.tsx`

- Delete `fontPairings` array, `applyFontPairing`, `clearFontPairing`, the `"Serif"` sizeBoost logic.
- Remove `selectFont` + `fontPairingName` from `useThemeState`.
- Keep `coloredThemes`, `applyColoredTheme`, `clearColoredTheme`, font size ±/reset, mode toggling.

### `site/components/ThemePalette.tsx`

- Remove the 3-card "Aa" font picker block and its props (`fontPairingName`, `onSelectFont`).
- Palette content becomes: color swatches → font size buttons (−/reset/+) → Dynamic Bio toggle (desktop only).
- Vertically more compact — expect the panel to shrink ~60px. Adjust top offset if needed so it still anchors to the footer button correctly.

### `site/lib/bio-content.ts`

- Split `HEADING_LINES` into two separate constants:
  - `HERO_NAME = "Marco Sevilla"` (static, never streamed)
  - `HERO_STATEMENT = "I design software in San Francisco. Currently at Canary where I simplify operational workflows for the largest hotel brands in the world."`
- `HEADING_WORDS` and `HEADING_TEXT` (which were derived from `HEADING_LINES`) are now derived from `HERO_STATEMENT` only (name is not streamed).

### `site/components/Hero.tsx`

- Replace the `HEADING_LINES` → `StreamingHeadingLines` flow with:
  - Render `HERO_NAME` as a static 14px label in tertiary color, always visible (not gated on intro phase).
  - Render `HERO_STATEMENT` inside an h1 styled per the new typescale (28–32px weight 600). Stream word-by-word during the `subtitle` intro phase using the existing word-streaming animation (can reuse `StreamingHeadingLines` with a single-line array or replace with `StreamingParagraph`).
- 5-phase intro state machine (`star1` → `subtitle` → `star2` → `bio` → `done`) unchanged.
- Keep the sticky-top-bar mobile behavior — but the h1 sticks, not the name+h1 stack. Name label stays in flow below or is tucked into the top-bar's compact variant (decide during implementation — both work, the latter is more compact).

### Case Study Components

- `components/case-study/CaseStudyHero.tsx`: Remove the inline `fontFamily: "var(--font-mono)", fontWeight: 400` override on the h1. Let the updated `typescale.caseStudyHero` (now sans 600) carry it.
- `components/case-study/SectionHeading.tsx`: The level-2 branch swaps from rendering a large `<h2>` to rendering a small label using `typescale.sectionLabel` (12–13px, sentence case, tertiary color). h3/h4 branches unchanged. The rendered element stays an `<h2>` for semantics — only the styling changes.
- `components/CaseStudyCard.tsx`: Remove inline `fontFamily: "var(--font-mono)"` on title, year label. Title remains weight 500 (now real, not faux).
- `components/CaseStudyListRow.tsx`: Automatically updates via `typescale.label` swap.
- `components/Marquee.tsx`, `components/DesktopSidebar.tsx`, `components/MobileNav.tsx`, `components/StickyFooter.tsx`: Automatically update via `typescale` / `--font-sans` swap. No direct file edits needed beyond verification.

## Rollout Sequence

1. **Foundation pass** — globals.css, layout.tsx, typography.ts, bio-content.ts, ThemeToggle.tsx, ThemePalette.tsx. One commit. Run `npm run dev`, verify homepage renders in pure Geist, nothing broken. Screenshot for before/after comparison.
2. **Hero restructure** — Hero.tsx split into name label + streaming statement h1. One commit. Verify streaming intro still works on a fresh load (clear sessionStorage), and skipped-intro path works on revisit.
3. **Case study pilot** — Update `CaseStudyHero.tsx` and `SectionHeading.tsx`, verify on F&B Ordering only. Eye-test the new h2 label treatment. **Decision gate:** if the 12–13px sentence-case label feels too ambient, bump to 14px or add a subtle `border-top` above the label — record the adjustment and apply consistently.
4. **Case study rollout** — Once the pilot is approved, the change propagates automatically to the other six case studies via the shared `typescale` / `SectionHeading` / `CaseStudyHero` components. Spot-check each one.
5. **Font file cleanup** — Grep the codebase for any remaining references to `PPEditorialNew`, `PP-Formula`, `GT-Cinetype`, `DepartureMono`. Once clear, delete the `.woff2` files from `public/fonts/`.
6. **Measure** — Run Lighthouse or Chrome devtools network panel before and after to confirm bundle savings. Record the delta in a commit message or PR description.

## Risks and Mitigations

**Risk:** Case study h2s at 12–13px feel too understated, making sections blur into each other on long reads.
**Mitigation:** Pilot on F&B Ordering first (step 3 above). Adjust size/treatment before rolling out. Worst case, fall back to 14px weight 500 with a thin 1px border-top.

**Risk:** Removing the Theme Palette font cards removes a "designerly touch" that demonstrated craft to visitors.
**Mitigation:** Accepted tradeoff — the palette still has 12 color swatches and a live font-size control. Craft is preserved; the specific font-switching demo is not.

**Risk:** Streaming intro restructure breaks the 5-phase state machine or the sessionStorage skip.
**Mitigation:** Minimal change — the phases stay; only the content being streamed changes. Verify both fresh-load and return-visit paths manually.

**Risk:** Bundle size savings smaller than estimated if Next.js was already tree-shaking unused `@font-face` rules.
**Mitigation:** Measure in step 6. The infrastructure cleanup is valuable regardless of bundle delta — one family is simpler to reason about.

## Open Questions

None. All clarifying questions were resolved during brainstorming.

## Deferred

- **Type Lab (`/dev/type-lab`)** — dev-only typography composition tool still references old font options. Not in scope; update separately if/when needed.
- **Reduced motion** — current intro streaming already respects `prefers-reduced-motion`. No change needed; verify after Hero restructure.

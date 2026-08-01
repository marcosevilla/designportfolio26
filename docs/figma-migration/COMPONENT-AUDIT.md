# Component audit — CORRECTED 2026-08-01

⚠️ The original audit (now at `archive/COMPONENT-AUDIT-2026-08-01-original.md`) contained three stale specs that caused build errors. **Read these corrections first; the archived doc is otherwise still valid for component-level specs (marquee card, atoms, case-study blocks).**

## Corrections (supersede the archived doc)

1. **Case-study page images come from `public/images/<study>/`** — NOT `public/images/gallery/<study>/`. The gallery folder is homepage-card media only (e.g. gallery's fb-overview.png food composite ≠ the page hero fb-ordering-dashboard.webp). Verify actual usage by scraping the rendered page's `<img>` tags.
2. **All grid presets collapse to ONE centered content band** (since 2026-07-20; `BAND` const in lib/layout-presets.ts). "intro-rail" etc. survive as semantic markers only — multi-slot presets STACK AS ROWS on the band. Editorial intros render: h1 → paragraphs → MetaRail below, all in the centered ~552px column. There is NO two-column intro on any live page.
3. **InlineTOC items are Geist Mono 12/500 UPPERCASE 0.08em** (same style family as the Back link) — not 14px sans.
4. **TwoCol-era studies (upsells, checkin, general-task, design-system) render NO hero image** — every CaseStudyHeroImage call site passes only `description`, and the component returns null without `src`.

## QA rule (from this failure)
A captured baseline is not QA. Open the baseline PNG next to the Figma screenshot before marking anything passed. Fresh baselines live in `baselines/`; superseded ones move to `archive/`.

## Current state pointers
- Figma file: https://www.figma.com/design/O9tNG8DqYrpdJmrEGa7Io7 (node registry in PROGRESS.md)
- Worktree synced to main @ 391f1cf on 2026-08-01

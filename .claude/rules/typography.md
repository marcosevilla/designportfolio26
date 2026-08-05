---
description: Type scale, font stack, and typography tokens for the portfolio site
paths:
  - "site/lib/typography.ts"
  - "site/app/globals.css"
  - "site/components/case-study/SectionHeading.tsx"
  - "site/components/case-study/PullQuote.tsx"
  - "site/components/case-study/QuickStats.tsx"
  - "site/components/HomeLayout.tsx"
  - "site/components/type-tuner/**/*.tsx"
  - "site/app/dev/type-lab/**/*.tsx"
---

# Typography

Consolidated to single Geist Sans family in April 2026 (see `docs/superpowers/specs/2026-04-18-typography-consolidation-design.md`).

## Font Stack
Single family. Geist Sans loaded via `next/font/sans` in `layout.tsx`. No self-hosted `.woff2` files. Representational components (URL bar, arch diagrams, teaser) use `var(--font-mono-system)` = `ui-monospace, Menlo, Monaco, monospace`.

## Font CSS Variables
| Variable | Default |
|----------|---------|
| `--font-sans` | `var(--font-geist-sans), system-ui, sans-serif` |
| `--font-mono-system` | `ui-monospace, Menlo, Monaco, monospace` (representational only) |
| `--font-size-offset` | `0px` (user adjustable -4px to +4px via Theme Palette) |

## Typescale (defined in `site/lib/typography.ts`)
Three weights system-wide: 400 body/labels, 500 titles/UI, 600 reserved emphasis. All 18px+ elements use `letter-spacing: -0.01em`.

**2026-08-05 OpenAI-blog-scale pass** (Marco's call, measured live off openai.com/index articles): body 17/28, h2 30/1.32, case-study h1 clamp→48 at weight 500. `SectionHeading` now imports all metrics from `typescale` — no inline copies.

| Element | Weight | Size | Notes |
|---------|--------|------|-------|
| Hero statement (h1) — homepage | 600 | clamp(28-32px) | `typescale.display`, streams word-by-word during intro |
| Hero name label — homepage | 400 | 14px | Inline in Hero.tsx, tertiary color, always visible |
| Case study hero h1 | 500 | clamp(32px, 4vw, 48px) / 1.1 | `typescale.caseStudyHero` (= `display`) — OpenAI ref is 64/1.0/500; Marco chose the softer 48 cap |
| Case study hero subtitle | 400 | 16px / 26 line-height | `typescale.subtitle` — ⚠️ now SMALLER than 17px body; open question flagged 2026-08-05 |
| Section h2 (case study) | 500 | 30px / 1.32 | `typescale.h2` — real sentence-case heading (mono ALL-CAPS label era is in git history; `sectionLabel` token still exists for other surfaces) |
| Section h3 | 500 | 20px / 1.4 | `typescale.h3` |
| Section h4 | 500 | 18px / 1.4 | `typescale.h4` |
| Body / case study prose | 400 | 17px / **1.647** (=28px), −0.01em | `typescale.body` — body-content standard (2026-08-05), same spec inlined on the home bio (HomeLayout). The `body` **element** default in globals.css deliberately STAYS 14/1.6 — all UI chrome inherits it; do not bump it with these two. |
| QuickStats value | 500 | 24px | `typescale.statValue` |
| PullQuote | 400 | clamp(18-22px) | `typescale.pullQuote` |
| NextProject title | 500 | 22px | `typescale.nextProjectTitle` |
| Card title | 500 | 18px | Inline styles in CaseStudyCard.tsx |
| Card subtitle | 400 | 14-15px | Inline styles |
| List row title | 500 | 16px | Inline in CaseStudyListRow.tsx |
| List row meta / year / metric | 400 | 11px | `typescale.label`, tertiary |
| Nav (desktop) | 400 | 16px | `typescale.nav` |
| Nav (mobile) | 400 | 14px | `typescale.navMobile` |
| Page titles (/work, /writing) | 500 | 24px | `typescale.pageTitle` |
| Marquee | 400 | 14px | inline |

### ⚠️ Line-heights in `typescale` must be UNITLESS

`fontSize` in this scale is `calc(Npx + var(--font-size-offset))`, so it moves with the
Theme Palette font-size slider. A **px** line-height does not — the ratio silently
collapses as the user drags. `body` was pinned at `"28px"` and `subtitle` at `"26px"`
until 2026-08-05; at slider +4 that took body from 1.65 → **1.33** (cramped) and at −4 to
2.15 (airy). Both are now unitless (`BODY_LINE_HEIGHT = 1.647`, `subtitle` 1.625), which
holds the ratio at every setting. **Never reintroduce a px line-height in `typescale`.**

Anything that measures body text in pixels must derive from the exported
`BODY_LINE_HEIGHT`, not restate the number — `Testimonials`' line-clamp hard-coded `22.4`
from the pre-2026-08-05 14/22.4 era and was silently clipping at 4.8 lines instead of 6.
It now sizes its clamp in `em` (`COLLAPSED_LINES * BODY_LINE_HEIGHT`), which resolves
against the element's own scaled font-size.

The 2026-08-03 h3/h4 token-vs-component drift was RESOLVED 2026-08-05: `SectionHeading` renders `typescale.h3`/`typescale.h4` directly (20/18). Marquee card title keeps −0.01em at 14px (deliberate, `Heading / Card Title`).

⚠️ **Historical:** several 2026-07-20 passes flattened `typescale.display` / `caseStudyHero` to the home-h1 spec (16/24/600/-0.02em), then the 2026-07-26 pass restored the `scaledClamp(28px, 5vw, 32px)` clamp for **case-study H1s ONLY** — the homepage h1 keeps its inline 16px spec. Check the live component before trusting either row above.

## Theme Palette
Color swatches (10 colored themes + light/dark) and font-size ±/reset only. No font-pairing picker — removed April 2026.

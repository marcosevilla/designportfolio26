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

**CONSOLIDATED 2026-08-05 to 8 tokens** (Marco: "I don't want a dozen styles"). Absorbed:
`caseStudyHero` → `display` and `h4` → `h3` (both were byte-identical); `pageTitle` +
`statValue` + `nextProjectTitle` → **`title`**. Deleted dead (0 consumers): `sectionLabel`,
`nav`, `navMobile`. Before adding a token, check whether an existing one plus a
one-property override does the job.

The 8 tokens:

| Token | Weight | Size | Used by |
|-------|--------|------|---------|
| `display` | 500 | clamp(32px, 4vw, **40px**) / 1.1, −0.02em | Case-study H1s, LockGate placeholder hero. Ramp stepped down late 2026-08-05 (48→40 cap; mobile min 32 unchanged). Homepage h1 keeps its own inline 16px spec. |
| `h2` | 500 | **26px** / 1.32 | Case-study section headings (was 30 for a day; mono ALL-CAPS label era is in git history) |
| `title` | 500 | 24px / 1.2 | /writing page title, QuickStats values (+`tabular-nums` at the call site — stats gained slider scaling in the merge; NextProject title stepped 22 → 24). ⚠️ Only 2px below h2 now. |
| `h3` | 500 | **16px** / 1.4 | Subsections AND sub-subsections. Marco's spec: a WHISPER above body — one point bigger (16 vs 15), one weight step bolder (500 vs 400), nothing more. `SectionHeading` renders both `level={3}` and `level={4}` with this token (h4 *element* kept for the outline), told apart by margin only. Same px as `subtitle` (different weight/role). ⚠️ see below |
| `subtitle` | 400 | 16px / 1.625 | Case-study hero subtitle, NextProject description. Correctly larger than the 15px body (the old "subtitle < body" question is closed). |
| `body` | 400 | 15px / 1.647 (≈24.7px), −0.01em | Case-study prose site-wide. Was 17/28 from the OpenAI pass; Marco dropped it to 15px later that day. Same spec inlined on the home bio (HomeLayout) — change the two together. The `body` **element** default in globals.css deliberately STAYS 14/1.6 — all UI chrome inherits it. Body copy sits 1px above chrome. |
| `pullQuote` | 400 | clamp(18px, 2.5vw, 22px) / 1.4 | PullQuote |
| `label` | 400 | 11px | Year badges, card meta, list rows — deliberately NOT slider-scaled (fixed-geometry chrome, per the 2026-08-05 ruling) |
| `monoLabel` | 500 | 12px / 1.4, mono, uppercase, **−0.02em** | Mono-uppercase micro-label (9th token, added 2026-08-05 on Marco's ask). First consumer: StudyMetaRow eyebrow. Tracking is the tightened −0.02em, matching the marquee meta — NOT the legacy 0.08em still hardcoded at ~20 call sites (migration queued in TYPOGRAPHY-BACKLOG). Fixed size, not slider-scaled. |

Non-token type that's deliberate (inline, not drift): homepage hero statement (streams during intro), hero name label 14px, card title 18/subtitle 14-15 in CaseStudyCard, list row title 16, marquee 14 — all inline in their components.

### ⚠️ h3 and h4 LEVELS render identically

There is one sub-heading token (`h3`, 16px); `SectionHeading` renders both `level={3}` and
`level={4}` with it, told apart by margin only (h3 `mt-16 mb-6`, h4 `mb-3`). On a page
that nests h4 under h3 the two levels read as one.

**This is latent, not live.** The only pages using `level={4}` are `upsells` (10),
`knowledge-base` (10) and `compendium` (7) — and all three are in `LOCKED_SLUGS`, so they
render the LockGate placeholder rather than their headings. It becomes visible the moment
any of those three is unlocked. Options and the recommendation (differentiate h4 by weight
at the `SectionHeading` level, no new token needed) are in `docs/TYPOGRAPHY-BACKLOG.md`;
awaiting Marco's ruling.

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

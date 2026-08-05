---
description: Case study route/data reconciliation, content component pattern, hero gradients, and MDX frontmatter
paths:
  - "site/app/work/**/*.tsx"
  - "site/content/*.mdx"
  - "site/components/case-study/**/*.tsx"
  - "site/lib/locked-content.ts"
  - "site/lib/editor-types.ts"
  - "site/lib/chat/study-metadata.ts"
  - "case-studies/*.md"
---

# Case Studies

## Routes ↔ data reconciliation (2026-07-15)
The dynamic `app/work/[slug]/` route is long gone — every study is a dedicated route. Slug sets that must stay in sync when adding/removing a study: `lib/locked-content.ts` (LOCKED_SLUGS), `CaseStudyList.tsx` (STUDY_ROUTES + HIDDEN_SLUGS), `lib/chat/study-metadata.ts` (STUDY_SLUGS/METADATA), `lib/chat/case-study-content.ts` (FILENAME_BY_SLUG), `lib/editor-types.ts` (SLUG_TO_FILE), `lib/study-tags.ts`, `content/*.mdx`.

## Dedicated Routes (Custom React Components)
These have rich custom implementations with sidebar TOC (via SidebarTOCBridge + TOCObserver), expandable sections, stats:

1. **F&B Ordering** (`/work/fb-ordering`) - Canary, 2025
2. **Digital Compendium** (`/work/compendium`) - Canary, 2024
3. **Upsells Forms** (`/work/upsells`) - Canary Technologies, 2025
4. **Hotel Check-in** (`/work/checkin`) - Canary Technologies, 2024
5. **General Task** (`/work/general-task`) - General Task, 2022
6. **Design System** (`/work/design-system`) - General Task, 2022
7. **How I Work with AI** (`/work/ai-workflow`) - Personal, 2026

(`knowledge-base` also has a route.)

## Homepage Card Order
1. F&B Ordering (newest Canary work, 100% ownership)
2. Digital Compendium ($1M CARR, platform thinking)
3. Upsells Forms ($3.8M CARR, workflow design)
4. Hotel Check-in (enterprise scale)
5. General Task (2022, startup experience)
6. Design System (2022, foundational work)

⚠️ The CARR figures above are the *card-order rationale* as originally written. Live metrics were refreshed 2026-08-01 (Upsells → $6.94M CARR, Compendium → $1.51M, Check-in → "Wyndham's ~6,000-property portfolio"). `content/*.mdx`, `MARQUEE_DISPLAY`, `lib/chat/study-metadata.ts`, `case-studies/*.md`, and `lib/resume-content.ts` all carry these — change them together.

## Case Study Content Component Pattern
Each dedicated case study has:
- `page.tsx` - Metadata and wrapper (negative top margin for full-bleed hero)
- `[Name]Content.tsx` - Rich component: full-bleed gradient hero, then post-hero content in a two-column editorial layout

## Case-study hero gradient colors
Component is `site/components/case-study/CaseStudyHeroImage.tsx` (older docs call it `CaseStudyHero` — that name never existed as a file).
| Study | gradient[0] | gradient[1] |
|-------|-------------|-------------|
| F&B Ordering | `#EF5A3C` | `#ED4F2F` |
| Compendium | `#2563EB` | `#1D4ED8` |
| Upsells | `#0D9488` | `#0F766E` |
| Check-in | `#6366F1` | `#4F46E5` |
| General Task | `#334155` | `#1E293B` |
| Design System | `#8B5CF6` | `#7C3AED` |

⚠️ Dates from May 2026 — predates both July redesigns. Verify against the live component.

## MDX Frontmatter Metadata
This table is **load-bearing, not descriptive** — it mirrors what `content/*.mdx` frontmatter
actually contains and what `StudyMetaRow` (`components/case-study/StudyMetaRow.tsx`) renders on
every case-study page via `getStudyMeta()` (`lib/content.ts`). Reconciled 2026-08-05 as part of the
metadata-row rollout (`docs/superpowers/specs/2026-08-05-case-study-metadata-row-design.md`);
pinned by `scripts/test-study-meta.ts`. If you change a study's `company`/`role`/`year` in its MDX,
update this table in the same commit.

| Study | company | role | year | metric |
|-------|---------|------|------|--------|
| fb-ordering | Canary Technologies | Lead designer | 2025–26 | 0→1, 100% ownership |
| compendium | Canary | Product designer | 2024–2025 | $1.51M CARR · +230% YoY · 44% attach |
| upsells | Canary | Lead designer | 2025 | $6.94M CARR · +10% measured lift |
| checkin | Canary | Product designer | 2024 | ~6,000 Wyndham properties |
| knowledge-base | Canary | Product designer | 2024 · shipped 2026 | 2 AI products, one KB |
| general-task | General Task | Founding designer | 2022 | 0→1 product |
| design-system | General Task | Founding designer | 2022 | 0→1 system |
| ai-workflow | Personal | Designer + builder | 2025–2026 | ~50 prototypes · 8-PR ship |

Four reconciliation rulings landed here (Marco, 2026-08-05): fb-ordering and ai-workflow years use
the en-dash range; compendium's role drops "100% design ownership"; knowledge-base's role is
"Product designer" (not "Lead designer") and its year keeps the "shipped 2026" note.
Superseded for fb-ordering by Marco's metadata-row feedback later that day: year is the compact
"2025–26" (shown in the row's mono-uppercase eyebrow, not as a pill), role is "Lead designer",
company is "Canary Technologies" (the other Canary studies keep "Canary" — scope was fb-ordering
only). The same feedback removed the company mark/monogram from `StudyMetaRow` entirely, so
`lib/study-logos.ts` and `CanaryMark.tsx` were deleted.

## Written drafts
Written case study content lives in `case-studies/` (repo root). Each `.md` file is the narrative draft, and doubles as the chat system-prompt source via `lib/chat/case-study-content.ts`. Read the relevant one when working on a specific case study page.

Per-study critiques, drafts, and retrospectives live in Obsidian — see the Obsidian Vault Boundary section in `CLAUDE.md`. Read them for context; don't copy them into this repo.

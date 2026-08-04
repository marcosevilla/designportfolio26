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
The dynamic `app/work/[slug]/` route is long gone — every study is a dedicated route. Slug sets that must stay in sync when adding/removing a study: `lib/locked-content.ts` (LOCKED_SLUGS), `CaseStudyList.tsx` (STUDY_ROUTES + HIDDEN_SLUGS), `lib/chat/study-metadata.ts` (STUDY_SLUGS/METADATA), `lib/chat/case-study-content.ts` (FILENAME_BY_SLUG), `lib/editor-types.ts` (SLUG_TO_FILE), `content/*.mdx`.

**Known gap:** `knowledge-base` has a live route but no chat metadata entry.

## Dedicated Routes (Custom React Components)
These have rich custom implementations with sidebar TOC (via SidebarTOCBridge + TOCObserver), expandable sections, stats:

1. **F&B Ordering** (`/work/fb-ordering`) - Canary, 2025
2. **Digital Compendium** (`/work/compendium`) - Canary, 2024
3. **Upsells Forms** (`/work/upsells`) - Canary Technologies, 2025
4. **Hotel Check-in** (`/work/checkin`) - Canary Technologies, 2024
5. **General Task** (`/work/general-task`) - General Task, 2022
6. **Design System** (`/work/design-system`) - General Task, 2022
7. **How I Work with AI** (`/work/ai-workflow`) - Personal, 2026

(`knowledge-base` also has a route — see the gap note above.)

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
| Study | company | role | metric |
|-------|---------|------|--------|
| fb-ordering | Canary | Sole designer | 0→1, 100% ownership |
| compendium | Canary | Product designer | $1M+ CARR |
| upsells | Canary | Lead designer | $3.8M CARR |
| checkin | Canary | Product designer | 4,500+ hotels |
| general-task | General Task | Founding designer | 0→1 product |
| design-system | General Task | Founding designer | 0→1 system |
| ai-workflow | Personal | Designer + builder | Daily AI practice |

## Written drafts
Written case study content lives in `case-studies/` (repo root). Each `.md` file is the narrative draft, and doubles as the chat system-prompt source via `lib/chat/case-study-content.ts`. Read the relevant one when working on a specific case study page.

Per-study critiques, drafts, and retrospectives live in Obsidian — see the Obsidian Vault Boundary section in `CLAUDE.md`. Read them for context; don't copy them into this repo.

# Editorial 12-Column Grid System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the single-600px-column layout with a shared 12-column editorial grid (named presets, per-band authored placement) across the homepage and all four case studies, plus a contact-sheet script and a visual HTML reference doc for authoring vocabulary.

**Architecture:** One `Grid`/`Col` primitive pair backed by plain CSS in `globals.css` (CSS vars per band — no dynamic Tailwind classes). Named presets (`prose`, `intro-rail`, `media-right`, …) assign column specs to children in order. Each page section is its own `<Grid>` sharing identical tracks so columns align down the page. Three bands: **phone** (<768), **tablet** (768–1023), **desktop** (≥1024). Author the desktop composition; phone/tablet default to sensible collapse.

**Tech Stack:** Next.js 14 App Router, Tailwind v4 (CSS config), framer-motion, playwright-core (new devDep, `channel: "chrome"` — no browser download).

## Global Constraints

- Canvas: `--grid-max: 1128px`, `--grid-gap: 24px`, 12 equal tracks → 1 col unit = 72px at full width.
- Prose measure target: 6 cols (552px) at desktop; tablet prose = cols 1–9.
- Column spec grammar: `"START-END"` inclusive (e.g. `"1-6"` = grid-column 1 / 7), or `"full"`.
- Do not touch `BackgroundTexture.tsx`. Commit before each task. Verify dev server after structural changes.
- All npm commands run from `site/`.

---

### Task 1: Grid + Col primitives, presets, parser test

**Files:**
- Create: `site/components/layout/Grid.tsx`
- Create: `site/lib/layout-presets.ts`
- Modify: `site/app/globals.css` (append grid CSS)
- Test: `site/scripts/test-grid-spec.ts`

**Interfaces:**
- Produces: `<Grid preset?>` and `<Col lg? md? base? className?>`; `parseColSpec(spec: string): string` (`"1-6"` → `"1 / 7"`, `"full"` → `"1 / -1"`); `PRESETS: Record<string, ColSpec[]>` where `ColSpec = { lg?: string; md?: string; base?: string }`.

- [x] Steps: write `parseColSpec` test (tsx script, same pattern as `test-chat-parser.ts`), run to fail, implement primitives + CSS + presets, run to pass, `tsc --noEmit`, commit.

Preset vocabulary (desktop placements; md/base default to full unless noted):

| Preset | Children → cols (lg) | md |
|---|---|---|
| `prose` | text `1-6` | `1-9` |
| `prose-wide` | text `1-8` | `1-10` |
| `intro-rail` | main `1-7`, rail `9-12` | main `1-8`, rail `1-8` (stacks) |
| `media-right` | text `1-5`, media `6-12` | both full |
| `media-left` | media `1-7`, text `8-12` | both full |
| `media-full` | media `1-12` | full |
| `duo` | media `1-6`, media `7-12` | `1-6`/`7-12` (holds) |
| `quote-offset` | quote `3-10` | `2-11` |

CSS appended to `globals.css`:

```css
/* ── Editorial grid (12-col, per-band placement via CSS vars) ── */
.grid-ed {
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  gap: var(--grid-gap, 24px);
  width: 100%;
}
.col-ed { grid-column: 1 / -1; min-width: 0; }
@media (min-width: 768px) {
  .col-ed { grid-column: var(--col-md, 1 / -1); }
}
@media (min-width: 1024px) {
  .col-ed { grid-column: var(--col-lg, var(--col-md, 1 / -1)); }
}
```

`Grid.tsx` core: `Grid({ preset, className, children })` maps `React.Children` in order onto `PRESETS[preset]` (explicit Col props win); `Col` renders `<div className="col-ed" style={{ "--col-md": parsed, "--col-lg": parsed }}>`.

### Task 2: Contact-sheet script

**Files:**
- Create: `site/scripts/contact-sheet.mjs`
- Modify: `site/package.json` (devDep `playwright-core`, script `"sheet": "node scripts/contact-sheet.mjs"`)

**Interfaces:**
- Produces: `npm run sheet -- <path> [--name <slug>]` → screenshots `http://localhost:3000<path>` at 390 / 768 / 1024 / 1440 (fullPage) into `site/.sheets/<slug>/`, writes `sheet.html` tiling all four with width labels. Requires dev server running; script errors clearly if not.

- [x] Steps: `npm i -D playwright-core`, write script (launch `channel: "chrome"`, loop widths, `waitForLoadState('networkidle')` + 800ms settle for animations, screenshot, emit sheet.html), run against `/` to verify output, commit.

### Task 3: Case-study shell on the grid + F&B migration

**Files:**
- Modify: `site/components/case-study/CaseStudyShell.tsx` (600px wrapper → `max-w-[1128px]` canvas, keep px-4 sm:px-8 + top padding)
- Modify: `site/app/work/fb-ordering/FBOrderingContent.tsx` (sections → `<Grid preset>` + `<Col>`; delete the `w-[calc(100vw-2rem)]` breakout hack — gallery images become `media-full`/`duo`; title block becomes `intro-rail` with a new meta rail: Year / Role / Scope pulled from existing copy)
- Verify: `npm run sheet -- /work/fb-ordering`

- [x] Steps: shell change, verify dev server renders, migrate section-by-section (title → `intro-rail`, gallery video → `media-full`, dashboard images → `duo`, Problem/Solution → `prose`, expandables inner → `prose`), tsc, sheet at all 4 widths, review composition, commit.

### Task 4: Migrate compendium, knowledge-base, ai-workflow

**Files:**
- Modify: `site/app/work/compendium/CompendiumContent.tsx`, `site/app/work/knowledge-base/KnowledgeBaseContent.tsx`, `site/app/work/ai-workflow/AIWorkflowContent.tsx`

- [x] Steps: same section mapping per page (prose stays `prose`; any imagery → `media-right`/`media-full` judged per section), tsc + sheet per page, commit per page.

### Task 5: Homepage restructure

**Files:**
- Modify: `site/components/HomeLayout.tsx` — home column becomes grid canvas; h1 + tagline + bio → `intro-rail` main (`1-7`); SocialLinks + View resume + Ask-me-anything move into the rail (`9-12`, stacked, top-aligned with bio start); work section = full-width `<Grid>` child spanning `1-12`.
- Modify (if needed after sheet review): `site/components/CaseStudyList.tsx` container only — list items to `lg:grid-cols-2` if single column reads too sparse at 1128; fallback keep 1-col spanning `1-8`.

- [x] Steps: migrate, preserve all framer-motion gates (`heroReady`, blur-in) — move markup, not animation logic; tsc; sheet `/`; judge work-list density; commit.

### Task 6: Visual HTML reference doc

**Files:**
- Create: `docs/LAYOUT-REFERENCE.html` (self-contained, no external assets)

- [x] Steps: build with visual-explainer craft: (1) grid anatomy diagram (12 tracks, gap, canvas, col numbering), (2) band diagram (phone/tablet/desktop ranges + what snaps), (3) preset gallery — one mini-diagram per preset showing desktop/tablet/phone states with labeled columns, (4) vocabulary table: the exact phrases to use with Claude ("make Impact media-right", "put the quote at 3-10", "full-bleed the video"), (5) authoring cheatsheet (JSX shape). Open in browser to verify, commit.

### Task 7: Docs + ship

**Files:**
- Modify: `CLAUDE.md` (replace stale TwoCol Key Pattern with Editorial Grid section; update Current State; note stale structure list)
- Delete: `site/components/TwoCol.tsx` after zero remaining imports (grep)

- [x] Steps: grep TwoCol usages → migrate stragglers → delete, update CLAUDE.md, full `npm run build` to verify static export, commit.

## Self-Review

- Spec coverage: primitives ✓, presets ✓, contact sheet ✓, case studies (all 4) ✓, homepage ✓, reference doc ✓, cleanup ✓.
- No placeholders: preset table is exact; CSS shown; grammar defined.
- Type consistency: `ColSpec`/`parseColSpec`/`PRESETS` named identically across tasks.

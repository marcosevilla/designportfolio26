# Case Study Metadata Row — Design

**Date:** 2026-08-05
**Status:** Approved, ready for implementation plan
**Supersedes:** `MetaRail` (Year / Role / Scope vertical rail)

---

## Problem

Case study intros carry their metadata in a vertical `MetaRail` sitting in the right-hand column of the `intro-rail` grid preset. Three things are wrong with it:

1. **It only exists on four of eight studies.** `compendium`, `knowledge-base`, and `ai-workflow` have it; `fb-ordering` had it hidden on 2026-08-05; `checkin`, `upsells`, `general-task`, and `design-system` never had one.
2. **The right-hand column is dead layout.** Since the 2026-07-26 band-alignment pass, all grid presets resolve to `CONTENT_BAND` — `intro-rail`'s second slot stacks as a row rather than sitting beside the prose, so the rail's whole reason for existing is gone.
3. **The metadata is duplicated and has drifted.** Every study carries `company` / `role` / `year` in MDX frontmatter *and* four studies repeat it in a local `META` const. They disagree (see Data Reconciliation below).

## Solution

One horizontal metadata row on every case study, between the `<h1>` and the intro prose. Company identity on the left, content tags on the right. Team credits move out of a hover tooltip and into an Acknowledgements block at the page bottom.

---

## 1. Components

### `components/case-study/StudyMetaRow.tsx` (new)

```
Modernizing food & beverage ordering for hotels
────────────────────────────────────────────────────────────────
 ▣ Canary   2025–2026 · Sole designer     0→1  MOBILE  DESKTOP  CMS  WORKFLOW
────────────────────────────────────────────────────────────────
I designed a 0-1 food & beverage ordering platform...
```

**Props:** `{ slug, company, role, year }`. Tags are read from `lib/study-tags.ts` by slug inside the component — they are not passed in, so the page and the homepage filter cannot drift.

**Structure:** `flex items-center justify-between gap-4`, `border-y border-(--color-border)`, `py-3`. Sits on `CONTENT_BAND` / `CONTENT_BAND_MD` like the prose.

| Element | Spec |
|---|---|
| Logo avatar | 20×20, `rounded-[4px]`, `1px solid var(--color-border)`, `object-contain` |
| Company name | 14px / 500 / `var(--color-fg)` |
| Year | 14px / 400 / `var(--color-fg-tertiary)`, preceded by a 12px gap |
| Role | 14px / 400 / `var(--color-fg-tertiary)`, separated from year by ` · ` |
| Tag pills | `typescale.label` (11px/400), `px-2.5 py-0.5`, `bg: var(--color-surface-raised)`, `color: var(--color-fg-secondary)` — identical to the homepage filter pill at rest (`CaseStudyList.tsx:167-176`) |

**Tags are static.** No hover state, no click target in v1. Making them link to a tag-filtered homepage requires URL-driven filter state that `CaseStudyList` does not have — noted as a follow-on, explicitly out of scope.

**Responsive:** below 640px the row becomes `flex-col items-start gap-3` — left cluster over tags. Tags wrap (`flex-wrap gap-1.5`) at every width.

**Logos:** slug → SVG map inside the component. `public/images/inline-chips/canary.svg` exists and is currently unreferenced; it covers all five Canary studies. General Task has no mark. Fallback for any study without an SVG is a **monogram** — first letter of the company, 14px/500 `var(--color-fg-secondary)` centered in the same 20px `rounded-[4px]` box filled `var(--color-surface-raised)`. This covers `general-task`, `design-system` (General Task → "G") and `ai-workflow` (Personal → "P") with no blocker.

### `components/case-study/Acknowledgements.tsx` (new)

Renders above `NextProject` at the page bottom, on `CONTENT_BAND`. Returns `null` when a study has no credits.

- Heading: `ACKNOWLEDGEMENTS` — `text-[13px] uppercase tracking-widest text-(--color-fg-tertiary)`, matching `NextProject`'s "Next project" eyebrow directly below it
- Body: names as one prose line, `typescale.body`, `var(--color-fg-secondary)`

**Only `fb-ordering` has credit data today:** Nico Garnier (PM); Joanne Chevalier, Andrea Bradshaw, Luciano Guasco (engineering). The other seven studies render nothing until Marco supplies names.

### `components/case-study/MetaRail.tsx` (delete)

Removed once all eight studies are converted. It has no other consumers — the home contact rail only borrows the *concept*, not the component.

---

## 2. Data: MDX frontmatter becomes the single source of truth

`site/content/*.mdx` already carries `company`, `role`, and `year` for every study, and `lib/content.ts` already parses them. Each study's `page.tsx` is a server component: it calls `getCaseStudy(slug)` and passes `company` / `role` / `year` into its Content component as props.

The four local `META` consts are **deleted**. No new slug-keyed file is created — `.claude/rules/case-studies.md` already lists six files that must stay in sync, and this design does not add a seventh.

### Data reconciliation (Marco's rulings, 2026-08-05)

| Study | Field | Was (MDX) | Was (`META`) | **Ruling** |
|---|---|---|---|---|
| fb-ordering | year | `2025 - present` | `2025–2026` | **`2025–2026`** |
| compendium | year | `2024` | `2024–2025` | **`2024–2025`** |
| compendium | role | `Product designer` | `Product designer` + `100% design ownership` | **`Product designer`** — the ownership line is dropped |
| knowledge-base | year | `2024` | `2024 · shipped 2026` | **`2024 · shipped 2026`** |
| knowledge-base | role | `Lead designer` | `Product designer` | **`Product designer`** |
| ai-workflow | year | `2026` | `2025–2026` | **`2025–2026`** |

These values are written into MDX frontmatter as part of the work.

### Tag change

`lib/study-tags.ts`, `fb-ordering`: add `Desktop` (the staff dashboard earns it).

```
"fb-ordering": ["0→1", "Mobile", "Desktop", "CMS", "Workflow"]
```

This also changes homepage filter results — intended. The other seven studies' tags are untouched.

### Content dropped with `MetaRail`

Retiring the rail loses two things with no direct replacement. Both are accepted:

- **Scope values** on four studies (e.g. F&B's "Guest ordering / Menu CMS / Staff dashboard"). The tag set approximates this.
- **`ai-workflow`'s Stack field** ("Claude Code, Next.js, CanaryUI"). Nothing replaces it; the study's prose covers the stack.

---

## 3. Rollout across eight studies

Two structural families, both a single insertion point.

**Editorial family** — `fb-ordering`, `compendium`, `knowledge-base`, `ai-workflow`:
Drop `preset="intro-rail"` and its now-empty second `<Col>`; use a plain `<Grid>` + `<Col md={CONTENT_BAND_MD} lg={CONTENT_BAND}>`. Insert `<StudyMetaRow>` between the `<h1>` and the first intro `<p>`.

**TwoCol-era family** — `checkin`, `upsells`, `general-task`, `design-system`:
These use `<CaseStudyShell band>`, which already wraps children in one band `<Col>`. Insert `<StudyMetaRow>` into the existing title `<div>`, after the subtitle `<p>`. No `<Grid>` needed — nesting one would double-narrow (see `.claude/rules/editorial-grid.md`).

`fb-ordering` additionally has commented-out `MetaRail` scaffolding (`FBOrderingContent.tsx:9-16`, `37-47`, `56-68`) that gets deleted rather than restored.

---

## 4. Verification

- `npm run dev` still runs after each file (project safety rule)
- The PostToolUse `tsc --noEmit` hook must be clean
- `npm run sheet -- /work/fb-ordering --unlock` — contact sheet at 390 / 768 / 1024 / 1440 after the layout change, per `.claude/rules/editorial-grid.md`
- Visual check in both light and dark themes: the row's `border-y`, `surface-raised` pills, and monogram fallback all use theme-following vars and must be verified in both
- Homepage filter still returns the expected studies after the `fb-ordering` tag change

## 5. Out of scope

- Clickable tags / URL-driven homepage filter state
- Acknowledgements copy for the seven studies without credits
- A General Task logo SVG (monogram covers it until Marco supplies one)
- Any change to `QuickStats`, `CaseStudyHeroImage`, or the studies' body content

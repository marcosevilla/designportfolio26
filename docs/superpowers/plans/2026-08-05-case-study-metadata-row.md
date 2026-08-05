# Case Study Metadata Row Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the vertical `MetaRail` on every case study with one horizontal metadata row — company avatar + year + role on the left, content tags on the right — sitting between the `<h1>` and the intro prose, and move team credits to an Acknowledgements block at the page bottom.

**Architecture:** MDX frontmatter (`site/content/*.mdx`) becomes the single source of truth for `company` / `role` / `year`. Each study's `page.tsx` is already a server component: it calls a new `getStudyMeta(slug)` and passes the result into its client Content component, which hands it to `<StudyMetaRow>`. Tags are read inside `StudyMetaRow` from the existing `lib/study-tags.ts`, so the page and the homepage filter cannot drift. The four local `META` consts and `MetaRail.tsx` are deleted.

**Tech Stack:** Next.js 16 App Router, React 18, Tailwind v4 with CSS-variable tokens, `gray-matter` for frontmatter, `npx tsx` for the zero-dep assertion scripts this repo already uses in place of a test framework.

**Spec:** `docs/superpowers/specs/2026-08-05-case-study-metadata-row-design.md`

## Global Constraints

- **All commands run from `site/`**, never the repo root.
- **There is no test framework.** No vitest, no jest. Verification is: `npx tsx scripts/<name>.ts` assertion scripts (the existing pattern — see `scripts/test-grid-spec.ts`), `npx tsc --noEmit`, `npm run build`, and visual checks against the running dev server. Do not add a test framework.
- **The PostToolUse hook runs `tsc --noEmit` after every TS/TSX edit.** If it reports errors, fix them before continuing.
- **Verify the dev server still runs after every structural change** (`npm run dev` in `site/`). If it breaks, revert immediately — do not spiral.
- **Never nest a `<Grid>` inside `<CaseStudyShell band>`** — it double-narrows. See `.claude/rules/editorial-grid.md`.
- **Plain `<img>`, not `next/image`** — the established pattern in this repo (`CaseStudyList.tsx:708`, `ItemLibrarySpecimen.tsx:272`).
- **Tag pills must match the homepage filter pill at rest exactly:** `typescale.label`, `px-2.5 py-0.5`, `backgroundColor: var(--color-surface-raised)`, `color: var(--color-fg-secondary)` (`CaseStudyList.tsx:167-176`).
- **Every color must be a CSS variable**, never a literal — the site has an 11-theme system and both light and dark must be verified.
- **Commit after every task.**

### Deviations from the approved spec

Two implementation refinements. Both are visible to Marco in the final QA task; flag them if he objects.

1. **Monogram font-size is 11px, not the spec's 14px.** A 14px glyph inside a 20px box crowds its border. 11px/500 matches the tag-pill scale.
2. **The company→logo map lives in `lib/study-logos.ts`, not inside the component.** The spec put it in the component; extracting it keeps the resolver a pure function that the assertion script can import without pulling in React.

---

## Task 1: Data layer — reconcile frontmatter, add `getStudyMeta`, add the `Desktop` tag

Establishes the single source of truth. Everything downstream reads from here.

**Files:**
- Modify: `site/content/fb-ordering.mdx:8` (year)
- Modify: `site/content/compendium.mdx:8` (year)
- Modify: `site/content/knowledge-base.mdx:8,11` (year, role)
- Modify: `site/content/ai-workflow.mdx:8` (year)
- Modify: `site/lib/content.ts` (append `getStudyMeta`)
- Modify: `site/lib/study-tags.ts:2` (add `Desktop` to fb-ordering)
- Create: `site/scripts/test-study-meta.ts`

**Interfaces:**
- Consumes: `getCaseStudy(slug)` from `lib/content.ts`, `STUDY_TAGS` from `lib/study-tags.ts`
- Produces: `getStudyMeta(slug: string): StudyMeta` where `StudyMeta = { company: string; role: string; year: string }`. Throws if no MDX matches the slug. Tasks 4–6 call this from `page.tsx`.

- [ ] **Step 1: Write the failing assertion script**

Create `site/scripts/test-study-meta.ts`:

```ts
/**
 * Assertions for the case-study metadata row's data layer.
 * Run with: npx tsx scripts/test-study-meta.ts
 * Same zero-dep pattern as test-grid-spec.ts.
 */
import { getStudyMeta } from "../lib/content";
import { STUDY_TAGS } from "../lib/study-tags";

let failures = 0;

function assertEqual(actual: unknown, expected: unknown, label: string) {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a === e) {
    console.log(`  ✓ ${label}`);
  } else {
    failures++;
    console.error(`  ✗ ${label}\n      expected ${e}\n      got      ${a}`);
  }
}

console.log("getStudyMeta — reconciled values (Marco's rulings 2026-08-05)");
assertEqual(getStudyMeta("fb-ordering").year, "2025–2026", "fb-ordering year uses the en-dash range");
assertEqual(getStudyMeta("compendium").year, "2024–2025", "compendium year uses the en-dash range");
assertEqual(getStudyMeta("compendium").role, "Product designer", "compendium role drops '100% design ownership'");
assertEqual(getStudyMeta("knowledge-base").year, "2024 · shipped 2026", "knowledge-base year keeps the shipped note");
assertEqual(getStudyMeta("knowledge-base").role, "Product designer", "knowledge-base role is Product designer, not Lead designer");
assertEqual(getStudyMeta("ai-workflow").year, "2025–2026", "ai-workflow year uses the en-dash range");

console.log("getStudyMeta — every tagged study resolves");
for (const slug of Object.keys(STUDY_TAGS)) {
  const meta = getStudyMeta(slug);
  const ok = Boolean(meta.company && meta.role && meta.year);
  assertEqual(ok, true, `${slug} has company, role and year`);
}

console.log("getStudyMeta — unknown slug throws");
let threw = false;
try {
  getStudyMeta("no-such-study");
} catch {
  threw = true;
}
assertEqual(threw, true, "unknown slug throws rather than returning empty strings");

console.log("STUDY_TAGS — fb-ordering gains Desktop");
assertEqual(
  STUDY_TAGS["fb-ordering"],
  ["0→1", "Mobile", "Desktop", "CMS", "Workflow"],
  "fb-ordering tags include Desktop in order"
);

console.log(failures === 0 ? "\nAll passed." : `\n${failures} failure(s).`);
process.exit(failures === 0 ? 0 : 1);
```

- [ ] **Step 2: Run it to verify it fails**

```bash
cd site && npx tsx scripts/test-study-meta.ts
```

Expected: FAIL — `getStudyMeta` is not exported from `lib/content.ts`, so the import errors out before any assertion runs.

- [ ] **Step 3: Add `getStudyMeta` to `lib/content.ts`**

Append to `site/lib/content.ts`:

```ts
export type StudyMeta = {
  company: string;
  role: string;
  year: string;
};

/**
 * The case-study metadata row's data source. MDX frontmatter is the single
 * source of truth for company/role/year — do not duplicate these into a
 * slug-keyed const (see .claude/rules/case-studies.md on slug-set drift).
 * Throws rather than returning blanks so a renamed or missing MDX file
 * fails the build loudly instead of rendering an empty row.
 */
export function getStudyMeta(slug: string): StudyMeta {
  const study = getCaseStudy(slug);
  if (!study) {
    throw new Error(`getStudyMeta: no MDX file found for slug "${slug}"`);
  }
  return {
    company: study.company,
    role: study.role,
    year: study.year,
  };
}
```

- [ ] **Step 4: Apply the four frontmatter reconciliations**

`site/content/fb-ordering.mdx` — change `year: "2025 - present"` to:

```yaml
year: "2025–2026"
```

`site/content/compendium.mdx` — change `year: "2024"` to:

```yaml
year: "2024–2025"
```

`site/content/knowledge-base.mdx` — change `year: "2024"` and `role: "Lead designer"` to:

```yaml
year: "2024 · shipped 2026"
role: "Product designer"
```

`site/content/ai-workflow.mdx` — change `year: "2026"` to:

```yaml
year: "2025–2026"
```

The dashes are en-dashes (`–`, U+2013), not hyphens. The knowledge-base separator is a middle dot (`·`, U+00B7).

- [ ] **Step 5: Add the `Desktop` tag**

In `site/lib/study-tags.ts`, change line 2 to:

```ts
  "fb-ordering": ["0→1", "Mobile", "Desktop", "CMS", "Workflow"],
```

- [ ] **Step 6: Run the script to verify it passes**

```bash
cd site && npx tsx scripts/test-study-meta.ts
```

Expected: PASS, all assertions, exit 0.

- [ ] **Step 7: Confirm the homepage filter still behaves**

```bash
cd site && npx tsc --noEmit
```

Expected: no errors. The new `Desktop` tag on fb-ordering widens homepage filter results by design — `ALL_TAGS` already contains `Desktop` from four other studies, so no new pill appears.

- [ ] **Step 8: Commit**

```bash
git add site/content/*.mdx site/lib/content.ts site/lib/study-tags.ts site/scripts/test-study-meta.ts
git commit -m "feat: study metadata data layer — reconcile frontmatter, add getStudyMeta

MDX frontmatter becomes the single source of truth for company/role/year.
Applies Marco's four reconciliation rulings and adds Desktop to fb-ordering."
```

---

## Task 2: `StudyMetaRow` component

**Files:**
- Create: `site/lib/study-logos.ts`
- Create: `site/components/case-study/StudyMetaRow.tsx`
- Modify: `site/scripts/test-study-meta.ts` (append logo assertions)

**Interfaces:**
- Consumes: `STUDY_TAGS` from `lib/study-tags.ts`, `typescale` from `lib/typography.ts`, `StudyMeta` from `lib/content.ts`
- Produces:
  - `logoFor(company: string): string | null` from `lib/study-logos.ts`
  - `<StudyMetaRow slug={string} company={string} role={string} year={string} />` — default export. Tasks 4–6 mount it.

- [ ] **Step 1: Write the failing logo assertions**

Append to `site/scripts/test-study-meta.ts`, immediately before the final `console.log(failures === 0 ...)` line:

```ts
console.log("logoFor — company marks and monogram fallback");
assertEqual(logoFor("Canary"), "/images/inline-chips/canary.svg", "Canary resolves to its inline chip");
assertEqual(logoFor("General Task"), null, "General Task has no mark — falls back to a monogram");
assertEqual(logoFor("Personal"), null, "Personal has no mark — falls back to a monogram");
```

And add to the imports at the top of the file:

```ts
import { logoFor } from "../lib/study-logos";
```

- [ ] **Step 2: Run it to verify it fails**

```bash
cd site && npx tsx scripts/test-study-meta.ts
```

Expected: FAIL — `lib/study-logos` does not exist, so the import errors out.

- [ ] **Step 3: Create `lib/study-logos.ts`**

```ts
/**
 * Company → logo mark for the case-study metadata row.
 *
 * Only Canary has an SVG today (public/images/inline-chips/ also holds
 * vivino.svg and vyond.svg, both unreferenced). Companies absent from this
 * map render a monogram instead — that is the intended fallback, not a gap
 * to paper over with a placeholder image.
 */
const LOGOS: Record<string, string> = {
  Canary: "/images/inline-chips/canary.svg",
};

export function logoFor(company: string): string | null {
  return LOGOS[company] ?? null;
}
```

- [ ] **Step 4: Create `components/case-study/StudyMetaRow.tsx`**

```tsx
"use client";

import { STUDY_TAGS } from "@/lib/study-tags";
import { logoFor } from "@/lib/study-logos";
import { typescale } from "@/lib/typography";

/**
 * Horizontal metadata row for case-study intros — sits between the <h1>
 * and the intro prose. Replaces MetaRail (the vertical Year/Role/Scope
 * rail), which became dead layout once every grid preset collapsed to
 * CONTENT_BAND in the 2026-07-26 band-alignment pass.
 *
 * Tags are read from STUDY_TAGS by slug rather than passed in, so this row
 * and the homepage filter can never disagree about a study's tags.
 *
 * Tags are deliberately static — linking them to a tag-filtered homepage
 * needs URL-driven filter state that CaseStudyList does not have.
 */
export default function StudyMetaRow({
  slug,
  company,
  role,
  year,
}: {
  slug: string;
  company: string;
  role: string;
  year: string;
}) {
  const tags = STUDY_TAGS[slug] ?? [];
  const logo = logoFor(company);

  return (
    <div className="mt-6 flex flex-col items-start gap-3 border-y border-(--color-border) py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      {/* Left — company identity */}
      <div className="flex items-center gap-3">
        {logo ? (
          <img
            src={logo}
            alt=""
            aria-hidden="true"
            width={20}
            height={20}
            className="h-5 w-5 shrink-0 rounded-[4px] border border-(--color-border) object-contain"
          />
        ) : (
          <span
            aria-hidden="true"
            className="flex h-5 w-5 shrink-0 items-center justify-center rounded-[4px] border border-(--color-border) bg-(--color-surface-raised) text-(--color-fg-secondary)"
            style={{ fontSize: 11, fontWeight: 500, lineHeight: 1 }}
          >
            {company.charAt(0).toUpperCase()}
          </span>
        )}
        <span className="text-(--color-fg)" style={{ fontSize: 14, fontWeight: 500 }}>
          {company}
        </span>
        <span className="text-(--color-fg-tertiary)" style={{ fontSize: 14, fontWeight: 400 }}>
          {year} · {role}
        </span>
      </div>

      {/* Right — content tags. Same resting style as the homepage filter
          pills (CaseStudyList.tsx:167-176), minus the interaction. */}
      <div className="flex flex-wrap gap-1.5">
        {tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center px-2.5 py-0.5 text-(--color-fg-secondary)"
            style={{ ...typescale.label, backgroundColor: "var(--color-surface-raised)" }}
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Run the script to verify it passes**

```bash
cd site && npx tsx scripts/test-study-meta.ts
```

Expected: PASS, all assertions including the three new logo ones.

- [ ] **Step 6: Type-check**

```bash
cd site && npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 7: Commit**

```bash
git add site/lib/study-logos.ts site/components/case-study/StudyMetaRow.tsx site/scripts/test-study-meta.ts
git commit -m "feat: StudyMetaRow component + company logo resolver

Company avatar (monogram fallback) + year + role left, static tag pills
right, hairline border-y. Tags read from STUDY_TAGS by slug."
```

---

## Task 3: `Acknowledgements` component

Built before the mounts so Task 4 can land F&B's credits in the same pass.

**Files:**
- Create: `site/components/case-study/Acknowledgements.tsx`

**Interfaces:**
- Consumes: `typescale` from `lib/typography.ts`
- Produces: `<Acknowledgements names={string} />` — default export, returns `null` for empty/whitespace-only `names`. Task 4 mounts it.

- [ ] **Step 1: Create the component**

```tsx
"use client";

import { typescale } from "@/lib/typography";

/**
 * Team credits at the foot of a case study, above NextProject. These used
 * to hide inside MetaRail's Role hover tooltip; Marco moved them here
 * 2026-08-05 so collaborators are actually visible.
 *
 * Returns null when a study has no credits — only fb-ordering has names
 * today, and a bare heading over nothing looks broken.
 *
 * The eyebrow deliberately matches NextProject's "Next project" label
 * (13px uppercase tracking-widest tertiary) since they render adjacently.
 */
export default function Acknowledgements({ names }: { names: string }) {
  if (!names.trim()) return null;

  return (
    <div className="pt-24">
      <span className="mb-3 block text-[13px] uppercase tracking-widest text-(--color-fg-tertiary)">
        Acknowledgements
      </span>
      <p className="text-(--color-fg-secondary)" style={typescale.body}>
        {names}
      </p>
    </div>
  );
}
```

- [ ] **Step 2: Type-check**

```bash
cd site && npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add site/components/case-study/Acknowledgements.tsx
git commit -m "feat: Acknowledgements block for case-study team credits

Renders above NextProject; returns null when a study has no names."
```

---

## Task 4: Mount on F&B Ordering (flagship, editorial family)

The one study with credits, and the one whose `MetaRail` is currently commented out. Prove the whole pattern here before rolling out.

**Files:**
- Modify: `site/app/work/fb-ordering/page.tsx`
- Modify: `site/app/work/fb-ordering/FBOrderingContent.tsx:9-16, 37-47, 56-69, 340-348`

**Interfaces:**
- Consumes: `getStudyMeta` (Task 1), `StudyMetaRow` (Task 2), `Acknowledgements` (Task 3)
- Produces: `FBOrderingContent({ meta }: { meta: StudyMeta })` — the prop shape Tasks 5 and 6 copy for the other seven studies.

- [ ] **Step 1: Thread `meta` through `page.tsx`**

In `site/app/work/fb-ordering/page.tsx`, add the import:

```tsx
import { getStudyMeta } from "@/lib/content";
```

and change the component body's render of the content to pass `meta`:

```tsx
export default function FBOrderingPage() {
  const meta = getStudyMeta("fb-ordering");

  return (
    <LockGate
      mode="page"
      locked={isLocked("fb-ordering")}
      title="Mobile ordering for hotels"
      subtitle="Designing a 0→1 mobile ordering system for hotels"
      backHref="/#projects"
    >
      <div className="pb-20">
        <FBOrderingContent meta={meta} />
      </div>
    </LockGate>
  );
}
```

`page.tsx` is a server component, so the `fs` read in `getStudyMeta` is fine. `meta` is a plain object and serializes across the server→client boundary without a wrapper.

- [ ] **Step 2: Delete the commented-out `MetaRail` scaffolding**

In `site/app/work/fb-ordering/FBOrderingContent.tsx`, delete these three blocks outright — the row replaces them, so they are no longer "a two-line un-comment away":

- Lines 15–16 (the commented `MetaRail` import)
- Lines 37–47 (the commented `META` const)
- The `{/* <Col className="mt-8 lg:mt-2"> ... </Col> */}` block at lines 66–68

Leave the `OutletConfigSpecimen` comment at lines 9–10 alone — unrelated.

- [ ] **Step 3: Add the imports and the prop**

Add to the import block:

```tsx
import StudyMetaRow from "@/components/case-study/StudyMetaRow";
import Acknowledgements from "@/components/case-study/Acknowledgements";
import type { StudyMeta } from "@/lib/content";
```

and change the signature:

```tsx
export default function FBOrderingContent({ meta }: { meta: StudyMeta }) {
```

- [ ] **Step 4: Swap the intro grid and mount the row**

Replace the `<Grid preset="intro-rail">` block (what remains of lines 59–69 after Step 2) with:

```tsx
        <Grid>
          <Col md={CONTENT_BAND_MD} lg={CONTENT_BAND}>
            <h1 className="text-(--color-fg)" style={typescale.display}>Modernizing food &amp; beverage ordering for hotels</h1>
            <StudyMetaRow slug="fb-ordering" {...meta} />
            <p className="mt-6 text-(--color-fg-secondary)">I designed a 0-1 food &amp; beverage ordering platform specifically for hotels. This was the latest addition to Canary&apos;s suite of products aimed at increasing hotel efficiency and increasing their ancillary revenue. Through a scrappy and highly iterative approach, our team developed launched the MVP in about four months to several pilot customers and over $50k in committed ARR.</p>
            {/* Solution paragraphs folded into the intro (Marco 2026-07-26) */}
            <p className="mt-3 text-(--color-fg-secondary)">We built a mobile-first ordering experience for our guests that served as an extension to our existing guest experience platform. Guests can browse available menu items, add to their carts, and then send their orders to hotel staff easily. To manage inbound orders, we built a dashboard and notification system that enabled operators to easily notify their kitchen staff and complete fulfillment.</p>
          </Col>
        </Grid>
```

`preset="intro-rail"` is dropped because its second slot no longer exists; the explicit `md`/`lg` spans put the content on the same band the preset resolved to anyway. Do not remove the `CONTENT_BAND` / `CONTENT_BAND_MD` import — it is already used further down the file.

- [ ] **Step 5: Mount Acknowledgements above NextProject**

Immediately before the `<FadeIn>` wrapping `<NextProject ...>` (around line 342), add:

```tsx
        <FadeIn>
          <Grid>
            <Col md={CONTENT_BAND_MD} lg={CONTENT_BAND}>
              <Acknowledgements names="Built with Nico Garnier (PM) and engineers Joanne Chevalier, Andrea Bradshaw and Luciano Guasco." />
            </Col>
          </Grid>
        </FadeIn>
```

- [ ] **Step 6: Type-check and run**

```bash
cd site && npx tsc --noEmit
```

Expected: no errors.

```bash
cd site && npm run dev
```

Visit `http://localhost:3000/work/fb-ordering` (unlock if the LockGate prompts — default code `miyagi`). Confirm:
- The row sits between the title and the first paragraph, with hairlines above and below
- Left reads `▣ Canary  2025–2026 · Sole designer` with the Canary mark, not a `C` monogram
- Right shows five pills: `0→1  Mobile  Desktop  CMS  Workflow`
- Acknowledgements appears above "Next project" at the page foot
- No right-hand column ghost or stray empty grid row where the rail used to be

- [ ] **Step 7: Commit**

```bash
git add site/app/work/fb-ordering/
git commit -m "feat: metadata row + acknowledgements on F&B Ordering

Replaces the commented-out MetaRail scaffolding. intro-rail preset drops
to an explicit CONTENT_BAND column now its second slot is gone."
```

---

## Task 5: Mount on the remaining editorial studies

`compendium`, `knowledge-base`, `ai-workflow` — all three still render a live `MetaRail`.

**Files:**
- Modify: `site/app/work/compendium/page.tsx`, `site/app/work/compendium/CompendiumContent.tsx:17-21, 41-53`
- Modify: `site/app/work/knowledge-base/page.tsx`, `site/app/work/knowledge-base/KnowledgeBaseContent.tsx:15-19, 40-49`
- Modify: `site/app/work/ai-workflow/page.tsx`, `site/app/work/ai-workflow/AIWorkflowContent.tsx:12-16, 37-62`

**Interfaces:**
- Consumes: `getStudyMeta` (Task 1), `StudyMetaRow` (Task 2), the `{ meta }` prop shape established in Task 4
- Produces: nothing new

- [ ] **Step 1: Thread `meta` through all three `page.tsx` files**

Each is identical in shape to Task 4 Step 1. In each of `compendium/page.tsx`, `knowledge-base/page.tsx`, `ai-workflow/page.tsx`:

Add the import:

```tsx
import { getStudyMeta } from "@/lib/content";
```

Add as the first line of the page component body, with the matching slug (`"compendium"`, `"knowledge-base"`, `"ai-workflow"`):

```tsx
  const meta = getStudyMeta("compendium");
```

Pass it to the content component:

```tsx
        <CompendiumContent meta={meta} />
```

Note `ai-workflow/page.tsx` renders its content at line 18 without the `<div className="pb-20">` wrapper the others use — leave that structural difference alone, only add the prop.

- [ ] **Step 2: Update all three Content components**

In each of `CompendiumContent.tsx`, `KnowledgeBaseContent.tsx`, `AIWorkflowContent.tsx`:

Remove the `MetaRail` import line and add:

```tsx
import StudyMetaRow from "@/components/case-study/StudyMetaRow";
import type { StudyMeta } from "@/lib/content";
```

Delete the whole `const META = [...]` block. Change the signature — e.g. for Compendium:

```tsx
export default function CompendiumContent({ meta }: { meta: StudyMeta }) {
```

Add `CONTENT_BAND, CONTENT_BAND_MD` to the existing `@/lib/layout-presets` import if the file does not already import them.

- [ ] **Step 3: Swap Compendium's intro grid**

Replace `CompendiumContent.tsx` lines 41–53 with:

```tsx
        <Grid>
          <Col md={CONTENT_BAND_MD} lg={CONTENT_BAND}>
            <h1 className="text-(--color-fg)" style={typescale.display}>Digital Compendium</h1>
            <StudyMetaRow slug="compendium" {...meta} />
            {/* Same intro treatment as F&B: italic tertiary one-liner hook,
                then body paragraphs at secondary. */}
            <p className="mt-6 italic text-(--color-fg-tertiary)">Hotels print their guest guides. Guests never read them.</p>
            <p className="mt-3 text-(--color-fg-secondary)">I spent 18 months designing the digital replacement — now the hub 175,000 guests open every month, and a $1.51M product line growing 230% year over year for Canary.</p>
          </Col>
        </Grid>
```

- [ ] **Step 4: Swap Knowledge Base's intro grid**

Replace `KnowledgeBaseContent.tsx` lines 40–49 with:

```tsx
        <Grid>
          <Col md={CONTENT_BAND_MD} lg={CONTENT_BAND}>
            <h1 className="text-(--color-fg)" style={typescale.display}>AI Knowledge Base</h1>
            <StudyMetaRow slug="knowledge-base" {...meta} />
            <p className="mt-6 text-(--color-fg-secondary)" style={{ fontFamily: "var(--font-geist-sans), system-ui, sans-serif", fontStyle: "italic", fontWeight: 400, fontSize: 18, lineHeight: "26px", letterSpacing: "0.02em" }}>A ground-up redesign of the information architecture and UI for Canary&apos;s AI knowledge base — the system where hotels enter the property data that powers both the AI chatbot and voice assistant.</p>
          </Col>
        </Grid>
```

- [ ] **Step 5: Swap AI Workflow's intro grid**

Replace `AIWorkflowContent.tsx` lines 37–64 (the `{/* Title + Subtitle with metadata rail (intro-rail) */}` comment through the closing `</Grid>`) with:

```tsx
          {/* Title + Subtitle */}
          <Grid>
            <Col md={CONTENT_BAND_MD} lg={CONTENT_BAND}>
            <h1
              className="text-(--color-fg)"
              style={typescale.display}
            >
              Prototypes as the spec
            </h1>
            <StudyMetaRow slug="ai-workflow" {...meta} />
            <p
              className="mt-6 text-(--color-fg-secondary)"
              style={{
                fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
                fontStyle: "italic",
                fontWeight: 400,
                fontSize: 18,
                lineHeight: "26px",
                letterSpacing: "0.02em",
              }}
            >
              How working prototypes replaced Figma as the engineering
              handoff spec — and closed deals along the way.
            </p>
            </Col>
          </Grid>
```

The odd inner indentation on `<h1>` and `</Col>` is pre-existing in this file — preserve it rather than reflowing, so the diff stays reviewable.

**Note:** this drops `ai-workflow`'s `Stack` field ("Claude Code, Next.js, CanaryUI"). That loss is recorded and accepted in the spec — do not invent a replacement home for it.

- [ ] **Step 6: Type-check and verify all three**

```bash
cd site && npx tsc --noEmit
```

Expected: no errors — in particular, no "META is declared but never read".

```bash
cd site && npm run dev
```

Visit each of `/work/compendium`, `/work/knowledge-base`, `/work/ai-workflow`. Confirm on each: row present between title and intro; no leftover right-hand column; correct reconciled year and role from Task 1 (`2024–2025 · Product designer`, `2024 · shipped 2026 · Product designer`, `2025–2026 · Designer + builder`).

- [ ] **Step 7: Commit**

```bash
git add site/app/work/compendium/ site/app/work/knowledge-base/ site/app/work/ai-workflow/
git commit -m "feat: metadata row on the remaining editorial case studies

Retires MetaRail and the local META consts on compendium, knowledge-base
and ai-workflow. ai-workflow's Stack field is dropped per spec."
```

---

## Task 6: Mount on the TwoCol-era studies

`checkin`, `upsells`, `general-task`, `design-system` — none of these ever had a `MetaRail`, and all four use `<CaseStudyShell band>`.

**Files:**
- Modify: `site/app/work/checkin/page.tsx`, `site/app/work/checkin/CheckinContent.tsx:33-37`
- Modify: `site/app/work/upsells/page.tsx`, `site/app/work/upsells/UpsellsContent.tsx:36-40`
- Modify: `site/app/work/general-task/page.tsx`, `site/app/work/general-task/GeneralTaskContent.tsx:34-38`
- Modify: `site/app/work/design-system/page.tsx`, `site/app/work/design-system/DesignSystemContent.tsx:35-39`

**Interfaces:**
- Consumes: `getStudyMeta` (Task 1), `StudyMetaRow` (Task 2), the `{ meta }` prop shape from Task 4
- Produces: nothing new

- [ ] **Step 1: Thread `meta` through all four `page.tsx` files**

Identical to Task 5 Step 1, with slugs `"checkin"`, `"upsells"`, `"general-task"`, `"design-system"`. All four share the same `LockGate` + `<div className="pb-20">` shape as fb-ordering.

- [ ] **Step 2: Update all four Content components**

In each, add:

```tsx
import StudyMetaRow from "@/components/case-study/StudyMetaRow";
import type { StudyMeta } from "@/lib/content";
```

and change the signature — e.g.:

```tsx
export default function CheckinContent({ meta }: { meta: StudyMeta }) {
```

- [ ] **Step 3: Insert the row into each title block**

These studies wrap their title in a plain `<div>` inside `<CaseStudyShell band>`. **Do not add a `<Grid>`** — `band` already supplies the column, and nesting would double-narrow the page (`.claude/rules/editorial-grid.md`).

For each file, insert `<StudyMetaRow ... />` between the `<h1>` and the subtitle `<p>`, and change that `<p>`'s `mt-3` to `mt-6`. Checkin becomes:

```tsx
        {/* Title + Subtitle */}
        <div>
          <h1 className="tracking-tight text-(--color-fg)" style={typescale.display}>Modernizing Hotel Software</h1>
          <StudyMetaRow slug="checkin" {...meta} />
          <p className="mt-6 text-(--color-fg-secondary)" style={typescale.subtitle}>Designing digital check-in, compendium, and omni-channel communication solutions for the world&apos;s largest hotel chains.</p>
        </div>
```

`UpsellsContent.tsx` lines 36–40 become:

```tsx
        {/* Title + Subtitle */}
        <div>
          <h1 className="tracking-tight text-(--color-fg)" style={typescale.display}>Upsells Forms</h1>
          <StudyMetaRow slug="upsells" {...meta} />
          <p className="mt-6 text-(--color-fg-secondary)" style={typescale.subtitle}>A configurable form system that lets hotels collect custom guest information at the point of upsell purchase — turning simple add-ons into structured service requests.</p>
        </div>
```

`GeneralTaskContent.tsx` lines 34–38 become:

```tsx
        {/* Title + Subtitle */}
        <div>
          <h1 className="tracking-tight text-(--color-fg)" style={typescale.display}>Building Productivity Software for Engineers</h1>
          <StudyMetaRow slug="general-task" {...meta} />
          <p className="mt-6 text-(--color-fg-secondary)" style={typescale.subtitle}>Designing a web-based task management tool that gives software engineers a holistic view of their workload by integrating popular project management tools in one surface.</p>
        </div>
```

`DesignSystemContent.tsx` lines 35–39 become:

```tsx
        {/* Title + Subtitle */}
        <div>
          <h1 className="tracking-tight text-(--color-fg)" style={typescale.display}>Creating a Design System for a Productivity Startup</h1>
          <StudyMetaRow slug="design-system" {...meta} />
          <p className="mt-6 text-(--color-fg-secondary)" style={typescale.subtitle}>Championing and executing a design system and visual language overhaul by securing leadership approval, facilitating design sprints, and collaborating with developers for implementation.</p>
        </div>
```

- [ ] **Step 4: Type-check and verify all four**

```bash
cd site && npx tsc --noEmit
```

Expected: no errors.

```bash
cd site && npm run dev
```

Visit `/work/checkin`, `/work/upsells`, `/work/general-task`, `/work/design-system`. Confirm on each: the row spans the same width as the prose (not wider, not narrower — that would mean a nested grid slipped in); `general-task` and `design-system` show a `G` monogram rather than a broken image; years read `2024`, `2025`, `2022`, `2022`.

- [ ] **Step 5: Commit**

```bash
git add site/app/work/checkin/ site/app/work/upsells/ site/app/work/general-task/ site/app/work/design-system/
git commit -m "feat: metadata row on the four TwoCol-era case studies

Inserted into the existing title div — CaseStudyShell band already
supplies the column, so no nested Grid."
```

---

## Task 7: Delete `MetaRail` and run full verification

**Files:**
- Delete: `site/components/case-study/MetaRail.tsx`

**Interfaces:**
- Consumes: everything above
- Produces: nothing

- [ ] **Step 1: Confirm `MetaRail` has no remaining consumers**

```bash
cd site && grep -rn "MetaRail" --include="*.tsx" --include="*.ts" . 2>/dev/null | grep -v node_modules | grep -v ".next"
```

Expected: only `components/case-study/MetaRail.tsx` itself. If any `app/work/**` file still matches, that study was missed — go back and finish it before deleting.

- [ ] **Step 2: Delete the component**

```bash
git rm site/components/case-study/MetaRail.tsx
```

- [ ] **Step 3: Full verification sweep**

```bash
cd site && npx tsx scripts/test-study-meta.ts && npx tsc --noEmit && npm run build
```

Expected: assertions pass, no type errors, production build succeeds. The build is the real gate here — `getStudyMeta` throws on a missing slug, so a typo in any of the eight `page.tsx` calls fails the build rather than shipping a blank row.

- [ ] **Step 4: Contact sheets on both structural families**

With the dev server running:

```bash
cd site && npm run sheet -- /work/fb-ordering --unlock
cd site && npm run sheet -- /work/checkin --unlock
```

Open each `.sheets/<slug>/sheet.html` and check the row at 390 / 768 / 1024 / 1440. At 390 the row must be stacked (identity over tags) with no horizontal overflow; at 768+ it must be a single line with tags flush right.

- [ ] **Step 5: Dark-theme check**

In the browser, toggle to dark via the theme control and re-check `/work/fb-ordering` and `/work/general-task`. Confirm the `border-y` hairline, the tag pills' `surface-raised` fill, and the `G` monogram all remain legible — every one of these uses a theme-following variable, so a hardcoded color would show up here as the one element that does not flip.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "refactor: delete MetaRail — superseded by StudyMetaRow

All eight case studies now render the horizontal metadata row."
```

- [ ] **Step 7: Report the two spec deviations to Marco**

Surface both for a ruling before considering the work done:
1. Monogram is 11px, not the spec's 14px (14px crowds the 20px box)
2. The logo map lives in `lib/study-logos.ts` rather than inside the component, so the assertion script can import it without React

Also confirm with him whether he wants Acknowledgements copy for the other seven studies — all seven currently render nothing, by design.

---

## Post-implementation

Per `CLAUDE.md` session-end rules, add an entry to the **top** of `docs/CURRENT-STATE.md` covering: the metadata row rollout, MDX-as-source-of-truth for company/role/year, the four reconciliation rulings, the `Desktop` tag addition, the `MetaRail` deletion, and the acknowledgements gap on seven studies.

Update `.claude/rules/case-studies.md`: its "MDX Frontmatter Metadata" table now carries the reconciled values and is load-bearing rather than descriptive.

# Copy-Drift Reconciliation Report — 2026-08-09

Diff of the three content layers per study: **MDX frontmatter** (`site/content/*.mdx`, feeds
StudyMetaRow via `getStudyMeta()`) · **live page** (`site/app/work/<slug>/` page.tsx +
Content.tsx) · **narrative drafts** (`case-studies/*.md`, which also feed chat via
`site/lib/chat/study-metadata.ts`). Ruled differences per `.claude/rules/case-studies.md`
are excluded. **Report only — nothing was changed.** Tags: **[RULING NEEDED]** = Marco
decides; **[MECHANICAL]** = clear fix, say the word and it ships.

## The headline items

1. **[RULING NEEDED] "Sole designer" survives the Lead-designer ruling in 3 places
   (fb-ordering).** MDX `role` says `Lead designer` ([fb-ordering.mdx:11](site/content/fb-ordering.mdx))
   but the same file's `description` (:13) and body (:18) still say **"Sole designer"** /
   "sole designer end-to-end", and chat's [study-metadata.ts:36](site/lib/chat/study-metadata.ts)
   says `role: "Sole designer"` verbatim. → Does the narrative copy follow the row?
2. **[RULING NEEDED] upsells has the same pattern, previously uncatalogued.** MDX `role:
   "Lead designer"` ([upsells.mdx:11](site/content/upsells.mdx)) vs its own `description`:
   "**Sole designer** for Canary's Upsells platform…" (:13).
3. **[MECHANICAL] Chat says fb-ordering's company is "Canary"** — the ruling says
   fb-ordering alone is "Canary Technologies". [study-metadata.ts:35](site/lib/chat/study-metadata.ts)
   is the one outlier.
4. **[RULING NEEDED] Founding-designer conflicts (general-task + design-system).** MDX/chat
   say `Founding designer` for both; the drafts say "Product Designer"
   ([general-task.md:13](case-studies/general-task.md)) and "**Sr.** Product Designer"
   ([design-system.md:13](case-studies/design-system.md)). Different seniority story per layer.
5. **[RULING NEEDED] knowledge-base role conflict.** MDX/chat: `Product designer` (per your
   2026-08-05 ruling). Draft: "Lead Designer (IA and UI design)"
   ([knowledge-base-redesign.md:13](case-studies/knowledge-base-redesign.md)) — the draft
   predates the ruling.

## Title fragmentation (one study, up to 3 names)

| Study | MDX / chat | Page `<title>` + H1 | Draft |
|---|---|---|---|
| fb-ordering | "Mobile ordering for hotels" | "Modernizing food & beverage ordering for hotels" | "F&B MOBILE ORDERING" |
| compendium | "Hotel guest experience app" (chat: "Hotel guest hub") | "Digital Compendium" | "DIGITAL COMPENDIUM" |
| upsells | "Upsells" | "Upsells Forms" | "UPSELLS FORMS" |
| checkin | "Hotel Check-in" | title "Hotel Check-in" but **H1 "Modernizing Hotel Software"** | "HOTEL CHECK-IN" |
| general-task | "Unified hub for knowledge work" | "General Task" / H1 "Building Productivity Software…" | (H1 matches page) |
| design-system | "Building a visual language 0-1" | "Design System" / H1 "Creating a Design System…" | "General Task Design System" |

**[RULING NEEDED]** — likely intentional in places (marquee wants short names, pages want
descriptive ones), but chat answers questions using the MDX name while the visitor is
looking at a page with a different one. Worth one deliberate pass.

## Stats drift

- **fb-ordering [RULING NEEDED]:** draft Quick Stats (100% ownership · 30 iterations ·
  93/100 issues · 6.5 hrs/100 orders) appear nowhere on the live page, which instead
  narrates $50k committed / $25K+ potential ARR. Neither layer is a subset of the other.
- **compendium [MECHANICAL]:** chat metric drops the "44% attach" clause MDX has; the live
  page's 82% custom-section adoption stat isn't in MDX or chat.
- **knowledge-base [RULING NEEDED]:** live STATS (2,000+ properties · 90% response-rate
  target) appear nowhere in the draft; the draft's ticket-ID stats appear nowhere live.

## Mechanical cleanups (one batch, no judgment calls)

- **5 dead MDX `thumbnail:` paths** (nothing renders them since the marquee redesign, but
  they'd 404 if ever wired): compendium, upsells, knowledge-base heroes +
  `ai-workflow-thumb.jpg` + `fb-ordering-thumb.jpg`. Fix = point at real assets when the
  hero exports land, or delete the field.
- **Draft company names never reconciled:** compendium / upsells / checkin / knowledge-base
  drafts all say "Canary Technologies" where the ruled value is "Canary".
- **knowledge-base draft card year** says "2024", dropping the ruled "2024 · shipped 2026".
- **Rules-doc self-inconsistency:** `.claude/rules/case-studies.md` "Dedicated Routes"
  section still lists Upsells + Check-in as "Canary Technologies", contradicting its own
  reconciliation table below — likely where the drafts' stale names come from.

## Clean

- **ai-workflow** — all layers agree (only the dead thumbnail path).
- checkin/general-task/design-system stat *values* match between draft and page.

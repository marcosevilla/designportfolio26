# Typography Backlog

Queued follow-ups from the 2026-08-05 type-system audit. Findings are numbered as they
were reported in that session, so the numbering skips items already closed.

**Closed already (commit `ce9070c`, branch `fix/body-lineheight-unitless`):**
- ② px line-heights in `typescale.body` / `typescale.subtitle` → unitless.
- ⑧ Stale `LINE_HEIGHT_PX = 22.4` comment + constant in `Testimonials.tsx` (was clipping
  the 6-line clamp at 4.8 lines).

**Owned by another session, do not touch here:**
- ⑤ `StudyMetaRow.tsx` hard-codes `fontSize: 11` / `fontSize: 14` where `typescale.label`
  is already exactly 11px. Belongs to `feature/study-meta-row`.

---

## Scope of what's left

~76 hard-coded font-size declarations across ~35 production files (excluding dev labs,
`type-tuner`, `fb-showcase` product specimens, `Resume.tsx` and `LoadingOverlay.tsx` —
all legitimately exempt, see "Deliberate exemptions" below).

Production size histogram at audit time:

```
 2 × 10px    15 × 11px    18 × 12px    11 × 13px
12 × 14px    10 × 15px     4 × 16px     2 × 18px    1 × 32px    1 × 11.5px
```

**10px, 12px, 13px and 15px do not exist as tokens at all.** They are an undocumented
second scale living in chat, nav, modals, TOC, overlays and the music widget.

---

## ① `--font-size-offset` coverage is inconsistent

**Why it matters:** the Theme Palette font-size slider moves case-study prose and headings
but freezes nav, labels, stats, chat, TOC and modals. Dragging it desynchronizes the page.

Only 9 of 15 tokens are built with `scaled()`. Fixed-size tokens:

| Token | Size | Should scale? |
|---|---|---|
| `sectionLabel` | 14px | dead token — see ④ |
| `statValue` | 24px | yes |
| `label` | 11px | Marco's call — 11px is already at the floor, +4 → 15px may be fine |
| `nav` | 16px | yes |
| `navMobile` | 14px | yes |

It is also inconsistent *within a single file*: `CaseStudyList.tsx:746` uses
`calc(16px + var(--font-size-offset))` while `:757` and `:996` are bare `11px`.

**Approach:** decide the policy first (does chrome scale with the slider, or only
content?), then apply. This is the one item that needs a ruling before code.

## ③ Duplicated untokenized hero-subtitle spec

`AIWorkflowContent.tsx:52` and `KnowledgeBaseContent.tsx:44` both inline an identical
6-property object: italic, `fontSize: 18`, `lineHeight: "26px"`, `letterSpacing: "0.02em"`,
weight 400, explicit Geist family. It is a third subtitle spec and contradicts
`typescale.subtitle` (16/26, upright).

**Fix:** add `typescale.studySubtitleItalic`, import in both. Make the line-height unitless
(26/18 = 1.444) per the rule now in `.claude/rules/typography.md`.

## ④ `typescale.sectionLabel` is dead

Defined in `lib/typography.ts`, documented in `.claude/rules/typography.md`, **zero
consumers.** Either delete the token and its rule row, or find its intended surface.
It is the last remnant of the mono-uppercase h2 label era.

## ⑥ 15px de-emphasis paragraphs have no token

10 uses of `text-[15px] text-(--color-fg-tertiary)`, all the same pattern — the "→ I
redesigned…" takeaway lines under research findings:

- `app/work/upsells/UpsellsContent.tsx` — lines 188, 197, 206, 215, 224
- `app/work/knowledge-base/KnowledgeBaseContent.tsx` — lines 159, 168, 177, 186

Consistent intent, no token. **Fix:** add `typescale.bodySm` (15px, unitless leading,
scaled) and swap all 10.

## ⑦ Two hygiene gaps

- No `font-synthesis: none` anywhere. Geist is variable so synthesis is unlikely to bite,
  but Fraunces and Libre Baskerville load limited weights and *could* be faked.
- No `::selection` styling — a cheap brand touch, and worth pinning so the 11-theme system
  can't produce an illegible selection combination.

Both belong in `app/globals.css` next to the existing `-webkit-font-smoothing` block.

## Open questions for Marco (no code until ruled)

1. **`typescale.subtitle` is 16px, smaller than the 17px body.** Flagged 2026-08-05 and
   still open. Bump to ~20px, or is the hero subtitle deliberately quieter than prose?
2. **`display` and `caseStudyHero` are byte-identical.** Collapse to one token with an
   alias, or keep both as separate semantic slots?
3. **Does UI chrome scale with the font-size slider** (see ①), or is the slider a
   reading-content control only?

---

## Deliberate exemptions — do NOT "fix" these

- `components/fb-showcase/**` — product specimens. They intentionally use
  `canary-polished-tokens.ts` (Inter, Canary's ramp), not the site scale. That separation
  is the whole point; see `.claude/rules/specimens.md`.
- `app/dev/**`, `components/dev/**`, `components/type-tuner/**` — dev-only tools, all
  `notFound()` in prod.
- `components/Resume.tsx` — a self-contained document with its own 36/16/11 scale.
- `components/LoadingOverlay.tsx` — display type (`clamp(72px, 10vw, 112px)`) that exists
  only during the intro sequence.

## Where to do this work

A worktree is **already set up and left in place** for these items:

```
.claude/worktrees/type-lineheight/    branch: fix/body-lineheight-unitless (off main)
```

Run everything from `.claude/worktrees/type-lineheight/site/`, not the repo root.

Two things about it that aren't visible from `git status`:

- `site/node_modules` is a **symlink** back to the primary checkout, so `tsc` and `next`
  work without a second install. `.gitignore` has `node_modules/` with a trailing slash,
  which only matches directories — a symlink is NOT ignored by it. It is excluded via
  `.git/info/exclude` instead. Don't remove that line, and never `git add -A` here.
- Use a non-default port so it can run alongside the primary checkout:
  `NEXT_PORT=3010 EDITOR_PORT=3012 npm run dev`.

`typography.ts` is untouched on `feature/study-meta-row`, so this branch merges cleanly
once that lands.

## Suggested sequence

④ (delete dead token) → ③ and ⑥ (new tokens, mechanical swaps) → ⑦ (two CSS lines) → ①
last, since it is the largest sweep and needs the policy ruling first.

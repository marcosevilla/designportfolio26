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

| Token | Size | Consumers | Disposition |
|---|---|---|---|
| `sectionLabel` | 14px | **0** | delete — see ④ |
| `nav` | 16px | **0** | delete — see ④ |
| `navMobile` | 14px | **0** | delete — see ④ |
| `statValue` | 24px | 1 (`QuickStats`) | **scale** |
| `label` | 11px | 26 | **leave fixed** (see ruling) |

It is also inconsistent *within a single file*: `CaseStudyList.tsx:746` uses
`calc(16px + var(--font-size-offset))` while `:757` and `:996` are bare `11px`.

### RULING (Marco, 2026-08-05): the slider is a READING control, not a global zoom

The slider is the only text-size control on the site. Someone who drags it to +4 because
17px prose is too small currently still gets 10px chat text and 11px meta labels — the
smallest text we ship, and exactly what they needed help with. That is an accessibility
gap, not just an inconsistency. But scaling *everything* would push layouts that were
measured rather than flowed. So the line is drawn by container, not by "chrome vs content":

**SCALE — things people read, living in flexible containers:**

| Surface | Files | Sizes today |
|---|---|---|
| Sticky table of contents | `case-study/InlineTOC.tsx` (3 sites) | 12px |
| QuickStats numbers | `case-study/QuickStats.tsx` via `statValue` | 24px |
| Demo captions | `DemoStage.tsx:147,185` | 13px |
| Chat, entire surface | `chat/ChatPanel.tsx` (10/13/14/15), `ChatBar.tsx` (12), `ChatMessage.tsx` (14), `ChipPrompt.tsx` (12), `ChatMessageActions.tsx` (11), `CaseStudyCardUnfurl.tsx` (11/14) | 10–15px |
| Modals + overlays | `PasswordModal.tsx` (12/13/16), `LockGate.tsx` (11/12), `ChangelogOverlay.tsx` (11/13/14/16), `NavOverlay.tsx` (12), `HamburgerMenu.tsx` (12/32), `MobileNav.tsx` (12) | 11–32px |

**LEAVE FIXED — micro-labels pinned inside fixed-geometry chrome.** At +4 these push
layouts whose dimensions were measured, not flowed:

| Surface | Files | Why |
|---|---|---|
| Work marquee meta | `CaseStudyList.tsx:294,757,996` | card geometry pinned at 494×400 |
| List-row year / company / metric | `CaseStudyList.tsx` via `typescale.label` | baseline-aligned flex row |
| Music dock | `music/MusicMiniWidget.tsx` (11/11.5/13) | fixed dock geometry |
| Time / weather readout | `LocalStatus.tsx:153` (11) | fixed toolbar slot |
| Homepage name label + experience list | `Hero.tsx:28,47,59,86,412` | pinned h1-row layout |
| `HomeNav` links | `HomeNav.tsx:197,249` (12) | nav star is position-computed off `ROW_HEIGHT` |

`typescale.label` therefore stays fixed at 11px — all 26 of its consumers fall on the
fixed side of the line, or are `fb-showcase` product specimens (exempt entirely).

**Watch when implementing:** `HamburgerMenu.tsx:219` is 32px, not a micro-label — check
what it is before sweeping it in with the overlay group.

## ③ Duplicated untokenized hero-subtitle spec

`AIWorkflowContent.tsx:52` and `KnowledgeBaseContent.tsx:44` both inline an identical
6-property object: italic, `fontSize: 18`, `lineHeight: "26px"`, `letterSpacing: "0.02em"`,
weight 400, explicit Geist family. It is a third subtitle spec and contradicts
`typescale.subtitle` (16/26, upright).

**Fix:** add `typescale.studySubtitleItalic`, import in both. Make the line-height unitless
(26/18 = 1.444) per the rule now in `.claude/rules/typography.md`.

## ④ Three dead tokens

`sectionLabel` (14px), `nav` (16px) and `navMobile` (14px) all have **zero consumers** —
defined in `lib/typography.ts` and documented in `.claude/rules/typography.md`, rendering
nothing. Verified 2026-08-05:

```
typescale.nav          -> 0 consumers
typescale.navMobile    -> 0 consumers
typescale.sectionLabel -> 0 consumers
```

`sectionLabel` is the last remnant of the mono-uppercase h2 label era. `nav` / `navMobile`
were presumably orphaned when `SiteHeader` was unmounted site-wide (2026-07-20) — the live
nav links are `HomeNav.tsx`'s own inline 12px.

**Fix:** delete all three, and delete their rows from the rule table (the "Nav (desktop)"
and "Nav (mobile)" rows there currently describe tokens nothing uses, which is worse than
no documentation).

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

~~3. Does UI chrome scale with the font-size slider?~~ **RULED 2026-08-05** — see the
ruling under ①. Neither question above blocks any item in this backlog; both are
refinements to tokens that are already wired correctly.

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

Nothing is blocked — ① was the only item awaiting a ruling and it has one.

1. **④** — delete the three dead tokens + their rule rows. Smallest, zero risk, and it
   shrinks ①'s surface before you start it.
2. **③ + ⑥** — add `studySubtitleItalic` and `bodySm`, swap the 12 call sites. Mechanical.
3. **⑦** — `font-synthesis: none` and `::selection` in `globals.css`. Two additions.
4. **①** — the sweep. Largest, and best done last so the dead tokens are already gone.

**Verification for ①** (the ratio-holds check that caught the original bug): pin a node,
sample `getComputedStyle` across `--font-size-offset` values `-4px / 0 / +2px / +4px`, and
confirm the intended surfaces move while the fixed-geometry ones don't. Then eyeball the
marquee, music dock and toolbar at +4 for layout push.

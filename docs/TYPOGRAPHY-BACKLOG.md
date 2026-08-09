# Typography Backlog

Queued follow-ups from the 2026-08-05 type-system audit. Findings are numbered as they
were reported in that session, so the numbering skips items already closed.

**Closed already (branch `fix/body-lineheight-unitless`):**
- ② px line-heights in `typescale.body` / `typescale.subtitle` → unitless (`ce9070c`).
- ⑧ Stale `LINE_HEIGHT_PX = 22.4` comment + constant in `Testimonials.tsx` (was clipping
  the 6-line clamp at 4.8 lines) (`ce9070c`).
- ④ Dead tokens — CLOSED by the 2026-08-05 consolidation: the typescale is now **8 tokens**
  (was 15). `sectionLabel`/`nav`/`navMobile` deleted; `caseStudyHero`→`display`,
  `h4`→`h3`, `pageTitle`+`statValue`+`nextProjectTitle`→`title`. QuickStats gained slider
  scaling in the merge (the `statValue` row of the ① ruling — done); NextProject title
  stepped 22→24.

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

Token-level status after the 2026-08-05 consolidation: **7 of 8 tokens scale**; `label`
(11px, 26 consumers) is the only fixed one, per the ruling below. The dead tokens are
deleted and `QuickStats` scales via `title`. What remains of ① is the **hardcoded
inline sizes in components**, not the tokens.

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
| ~~QuickStats numbers~~ | ~~via `statValue`~~ **DONE** — scales via `title` since the consolidation | 24px |
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

Consistent intent, no token.

**⚠️ CHANGED 2026-08-05 — body dropped 17px → 15px, so these are now the SAME SIZE as body
copy.** They were one step down from 17px prose; they are now identical to it and carry no
size de-emphasis at all, only `--color-fg-tertiary`. The original "add a `bodySm` token at
15px" fix would now be a no-op alias for `body`.

**Revised fix — needs a design call, not a mechanical swap:**
- **(a)** Accept colour alone as the de-emphasis and delete the `text-[15px]` classes as
  redundant. Simplest, and arguably correct — these are asides, not a second reading size.
- **(b)** Add `typescale.bodySm` at **13px** and swap all 10, keeping a real size step.
  13px is already the most common chrome size in the codebase (11 uses), so it does not
  invent a new step.

Recommend **(a)**: at a 15px body, a 13px aside is small enough to strain, and the tertiary
colour already does the work.

## ⑦ Two hygiene gaps

- No `font-synthesis: none` anywhere. Geist is variable so synthesis is unlikely to bite,
  but Fraunces and Libre Baskerville load limited weights and *could* be faked.
- No `::selection` styling — a cheap brand touch, and worth pinning so the 11-theme system
  can't produce an illegible selection combination.

Both belong in `app/globals.css` next to the existing `-webkit-font-smoothing` block.

## ⑧ ~~Migrate mono-uppercase labels onto `typescale.monoLabel`~~ — CLOSED 2026-08-09

Swept in one pass: every production `letterSpacing: "0.08em"` mono-label site now spreads
`typescale.monoLabel` and re-states only its deliberate overrides (11px placeholder/badge
sizes, 10px chat badge, per-site colors and line-heights). Files: `Hero`, `CaseStudyList`
(PLACEHOLDER_LABEL + SectionLabelButton), `NavOverlay`, `ChangelogOverlay`,
`HamburgerMenu` (NAV_LABEL_STYLE), `MobileNav`, `HomeNav` (Return + nav links),
`PasswordModal` (MODAL_LABEL + the 16px input keeps its iOS-zoom size but takes the token
tracking), `LockGate` (GATE_LABEL + 11px badge), `ChatPanel` (Beta badge), `InlineTOC`
(TOC_LABEL). Visible change: site-wide mono-label tracking 0.08em → −0.02em, per Marco's
2026-08-05 ruling. fb-showcase / dev labs / type-tuner untouched (exempt).

## Open questions for Marco (no code until ruled)

1. **⚠️ `h3` and `h4` are now byte-identical** — both `18px / 500 / 1.4 / −0.01em` after
   the 2026-08-05 h3 20→18 change. `SectionHeading` separates them by margin only
   (h3 `mt-16 mb-6`, h4 `mb-3`), so nested h4s read as the same level as their parent h3.

   **Latent, not live:** the only `level={4}` consumers are `upsells` (10 uses),
   `knowledge-base` (10) and `compendium` (7), and all three are in `LOCKED_SLUGS` — they
   render the LockGate placeholder today. This surfaces the moment one is unlocked.

   Options: **(a)** drop h4 to 16px — restores a real step, but 16px against a 15px body
   is a very thin distinction; **(b)** keep both at 18px and differentiate h4 by weight
   (400 vs h3's 500) or by colour (`--color-fg-secondary`); **(c)** decide the studies only
   need three heading levels and convert the h4s to h3s.

   Recommend **(b) by weight** — it keeps the size rhythm Marco just tuned and gives a
   genuine visual difference without inventing a new size step.

2. ~~`display` and `caseStudyHero` are byte-identical~~ **CLOSED 2026-08-05** — merged
   into `display` in the consolidation.

3. ~~`typescale.subtitle` is smaller than body~~ **CLOSED 2026-08-05** — subtitle is 16px
   and body dropped to 15px, so the subtitle is now correctly larger than body copy.

~~Does UI chrome scale with the font-size slider?~~ **RULED 2026-08-05** — see the ruling
under ①.

Question 1 blocks nothing in this backlog but should be settled before any of
`upsells` / `knowledge-base` / `compendium` comes out of `LOCKED_SLUGS`.

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

Nothing is blocked. ④ is done (the consolidation); what's left:

1. **③ + ⑥** — the italic-subtitle twins, and the design call on the `text-[15px]`
   paragraphs. Note post-consolidation: prefer reusing a token + a one-property override
   over minting `studySubtitleItalic` — Marco explicitly wants FEWER tokens
   (e.g. `{...typescale.subtitle, fontStyle: "italic", fontSize: ...}` or just accept
   `subtitle` as-is for those two heroes).
2. **⑦** — `font-synthesis: none` and `::selection` in `globals.css`. Two additions.
3. **①** — the component-level sweep (chat, modals, TOC, demo captions). Largest.

**Verification for ①** (the ratio-holds check that caught the original bug): pin a node,
sample `getComputedStyle` across `--font-size-offset` values `-4px / 0 / +2px / +4px`, and
confirm the intended surfaces move while the fixed-geometry ones don't. Then eyeball the
marquee, music dock and toolbar at +4 for layout push.

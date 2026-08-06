# Opportunities — technical and UX/design

**Date:** 2026-08-05
**Nothing in this file was implemented.** It is the "what's worth doing next" output of the
multi-agent session. Changes that WERE made are in `2026-08-05-CHANGELOG.md`.

Full reasoning lives in the source audits — this file is the prioritized roadmap over them:
- `2026-08-05-technical-audit.md` — 68 findings, IDs F-01…F-68
- `2026-08-05-ux-design-audit.md` — UX critique (interface-craft / Josh Puckett method)
- `2026-08-05-design-token-audit.md` — token coverage

---

## THE SHORT VERSION

If you only do a few things, do these. They are ordered by impact-per-hour for the actual
goal: **a hiring manager forms an opinion in under a minute.**

| # | Do this | Why | Effort |
|---|---|---|---|
| 1 | Give the work carousel a visible scroll affordance | A mouse-only visitor may see **one** case study | S |
| 2 | Re-point F&B's "Next project" away from locked Compendium | The one complete reading path ends at a password wall | XS |
| 3 | Put the metric on the homepage card face | `$6.94M CARR` sits unused in frontmatter while cards show "CANARY TECHNOLOGIES • 2026" | S |
| 4 | Teach chat which studies are locked | Chat actively recommends and unfurls studies the reader can't open | S |
| 5 | Unlock `checkin`, `general-task`, `design-system` | Cheapest way to more than double the readable portfolio | XS |
| 6 | Default case-study sections to open on mobile | Every "Impact & Results" is collapsed on phones | XS |
| 7 | Fix three wrong years on the marquee | General Task shows 2024, is 2022 — factual error on a portfolio | XS |

---

## 1. UX AND DESIGN

### 1.1 The carousel needs a scroll affordance — and this is now the top item

**This one is mine to flag, because it borders the change I just made.** I removed
scroll-snap, so trackpad and touch scrolling are now smooth and correct. What I deliberately
did **not** do is add a way to *discover* that the strip scrolls at all:

- The scrollbar is hidden (`scrollbar-width: none`).
- There are no arrows, no dot indicators, no counter, no peek cue beyond the card edge.
- A **mouse wheel** produces a *vertical* delta, which scrolls the page, not the strip.

So the affordance gap predates my change and survives it: a visitor on a plain mouse can
reach exactly the cards already on screen. Trackpad and touch users are fine.

I did not build this because it is a **visual design decision on your homepage** — arrows,
a progress rail, an edge fade and a "1 / 8" counter are four very different answers and
you'll want to pick. Options, cheapest first:

1. **Show the scrollbar**, styled thin. One line. Ugly-ish, honest, zero design work.
2. **Edge fade + partial next card.** Already partly true; strengthen the peek so the strip
   visibly continues.
3. **Prev/next arrow buttons.** Most explicit, also fixes keyboard and mouse in one move.
   These would scroll by one card — note that is *snap-like stepping on demand*, which is
   fine; what you disliked was stepping being forced on a free gesture.
4. **Vertical-wheel → horizontal mapping.** Possible, but it means re-introducing a wheel
   handler, and a badly tuned one is exactly the jerkiness you asked me to remove. My
   recommendation: **do 3, not 4.**

⚠️ If you ever ask someone to "make the carousel snap again", point them at the comment
block on `.work-marquee` in `globals.css` first — it records the measured failure.

### 1.2 The reading path dead-ends at the password wall

**6 of 8 case studies are locked** (`compendium`, `knowledge-base`, `upsells`, `checkin`,
`general-task`, `design-system`); only `fb-ordering` and `ai-workflow` are open. Positions
2–7 in the carousel are six consecutive locked cards, and **every hard revenue number on
the site is behind the wall.**

Three compounding problems:

- **F&B's "Next project" link points at the locked Compendium**
  (`app/work/fb-ordering/FBOrderingContent.tsx:338`). Your single strongest, fully readable
  case study ends by walking the reader into a gate. Compendium already received this exact
  fix; F&B never did. **Re-point it at `ai-workflow`.** This is a one-line change and it is
  the highest-value edit on this whole list.
- **Chat recommends locked studies** (`lib/chat/system-prompt.ts:53-64, 73-85`). The system
  prompt never learns which slugs are locked, so the model happily writes
  `[Upsells](study:upsells)` and renders an unfurl card advertising `$6.94M CARR` — and the
  click hits the gate. Chat's *content* privacy is correctly guarded; its *linking* is not.
- **The gate copy never says what's behind the door.** "This case study is currently being
  polished" gives a stranger no reason to email you. Say what they'd get.

**Recommendation:** unlock `checkin`, `general-task` and `design-system`. The UX audit found
all three have zero placeholder boxes and already passed the 2026-08-01 QA sweep. That takes
the readable portfolio from 2 studies to 5 for roughly no work. `upsells` genuinely deserves
its lock — 17 live grey boxes including an 8-up gallery headed "The Work".

### 1.3 Information scent — the cards under-sell the work

- **The metric never renders.** `CaseStudyList.tsx` has `$6.94M CARR`,
  `$1.51M CARR · +230% YoY` and friends available and shows *company + year* instead. Putting
  the outcome on the card face is the cheapest credibility win available.
- **Three marquee years contradict the MDX.** General Task shows 2024 but is 2022. On a
  portfolio, a wrong date is a factual error a reviewer may notice.
- **Three cards ship a grey "Under construction" frame.** Better to show one real image than
  a placeholder that says the work isn't ready.
- **The playground is four anonymous videos** with no labels.

### 1.4 Mobile hides the evidence

`ExpandableSection` defaults to collapsed below `md` (`ExpandableSection.tsx:22`), so on a
phone every case study's "Impact & Results" — the part with the numbers — starts shut. If a
recruiter opens the site on a phone, the outcomes are the thing they should hit first, not
the thing they must go looking for. **Default to open below `md`.**

### 1.5 Smaller UX defects worth a pass

- **Locked-card clicks are a silent no-op** for `design-system` and `knowledge-base` — they
  have no gallery media, so the lightbox opens with nothing in it. A click that does nothing
  reads as a broken site.
- **`CustomCursor` kills `cursor: pointer` site-wide** via `!important` on `body *`. The
  single most universal "this is clickable" signal is gone everywhere.
- **About has no URL.** `?about=1` is stripped on arrival, so the About page — with the bio
  and testimonials — cannot be linked or shared. For a job search, that page needs a
  permalink.
- **The best sentence on the site is inside a hover tooltip** and never earns the fold.
- **The polished resume is unreachable** from the UI.
- **No case study has a hero image.** `CaseStudyHeroImage` is a no-op at all five call sites.
- **Theme toggle may not actually repaint** — a pre-existing unresolved item in
  `QA-FINDINGS.md`. Worth one manual click.

### 1.6 Cognitive load — the honest verdict

The brief's worry was that the playful chrome (theme picker, music player, chat, cursor
effects, font-size slider) undermines a senior-design impression. The audit's conclusion,
which I agree with: **the chrome is not the problem — the ambient motion is.** The controls
are small, quiet and clustered. What competes for attention is eight simultaneously animating
WebGL card backdrops. That is now ~75% cheaper computationally after this session's perf
work, but it is still visually busy. If you want the page calmer, slow the shaders — don't
remove the toys.

### 1.7 Bigger design bets (later)

1. **Replace the horizontal marquee with a vertical index.** Solves scroll affordance,
   information scent, lock signalling and section labelling in one move. The strongest
   structural idea in the UX audit.
2. **Design the gate as a persuasion surface** — metric, partial hero, one fully annotated
   decision, then the ask. Also lets you publish sooner, because "partial" becomes a design,
   not an apology.
3. **Make chat the front door for skimmers.** It already has the drafts, link grammar,
   unfurls and privacy guardrails. It could summarize what the wall hides.
4. **Earn the fold with one positioning line.**
5. **Fix the visual foundation** — `knowledge-base` and `ai-workflow` have zero visuals
   across ~2,400 words.

---

## 2. TECHNICAL

### 2.1 Near-term, cheap, no design input needed

| Item | What | Why now |
|---|---|---|
| **F-31/32/30** | ~45 MB of orphaned assets + two 15–17 MB ambient videos + a 1 MB three.js bundle for a route that 404s in prod | One asset session, no code risk. **See the caution below.** |
| **F-05 etc.** | The a11y cluster — 8 `aria-modal` surfaces each hand-rolling a different subset of {Escape, scroll lock, initial focus, trap, restore} | Write the helper once, apply eight times |
| **F-14** | 10 `exhaustive-deps` warnings, now visible for the first time | Triage, don't bulk-fix — several would change behaviour |
| **F-52, F-61, F-63** | Layout/stride mismatches inside specimens | Visible if you look closely |

⚠️ **I deliberately did not delete the ~45 MB of orphaned assets.** They are unreferenced, so
visitors never download them — this is deploy/repo hygiene, **not** a runtime performance
problem, which is how it was originally framed. And an "orphan" judgment that's wrong by one
file means a broken image in production. That trade is yours to make, not mine to make while
you're away. The candidate list is in the technical audit under F-31.

The two large ambient videos *are* user-facing, and the eager-download half of that is
already fixed this session (they now load on approach rather than up front). Re-encoding
them is a quality decision — it changes how they look.

### 2.2 Future technical projects

1. **A shared `useModal` / focus-trap primitive.** Closes most of the a11y cluster
   permanently and stops the next modal re-inheriting the gap.
2. **A `useVisible(ref)` hook wired into every animation loop.** `document.hidden` currently
   appears in exactly one file in the tree. This session gated the dither canvases,
   LedMatrix and PixelRain individually; a single hook would make "animations stop when you
   can't see them" a property of the codebase rather than a per-component decision. Adopt in
   `ObjectFlowDiagram` and `RoadmapEvolution` next — they still run unconditionally.
3. **Bundle-size regression signal in CI.** Turbopack dropped the per-route size table, so
   nothing would catch a 1 MB dependency landing on the homepage.
4. **A media pipeline** (`npm run media`): re-encode, convert to WebP/AVIF, report orphans.
   Would have prevented the asset accumulation above, and makes removing
   `images.unoptimized` a non-event.
5. **React 19 + Next 16 alignment.** Removing the three.js/drei stack eliminates the peer
   conflict forcing `legacy-peer-deps=true`, and `.npmrc` can go.
6. **Split `AudioPlayerContext` into transport + clock.** Partly addressed this session; the
   general pattern — a context whose value changes at animation frequency — is worth
   auditing for elsewhere.
7. **Decide on the four unmounted-but-not-salvage components** (`HomeNav`, `NavOverlay`,
   `SiteHeader`, `CyclingGreeting`). They sit in an ambiguous third state — neither live nor
   documented as salvage. `HomeNav` held the *correct* IntersectionObserver logic that
   `TOCObserver` was missing, which is how that bug survived: **the good code was the dead
   code.**
8. **Write down the two-copy `DemoStage` pattern** in `.claude/rules/`. It renders `children`
   twice, which silently breaks anything using a document-unique `id`, `name` or `layoutId`.

### 2.3 Design-system decisions I could not make for you

From the token audit — each needs a call, and I refused to invent values:

1. **`--shadow-soft-lg` is orphaned** (0 consumers). Retune and adopt, or delete. A token
   nothing uses reads as a system that doesn't exist.
2. **Undocumented type sizes 10/12/13/14/18/32px.** 12px is the most-hardcoded size on the
   site (21 sites) with no sans token; 14px ships with four different line-heights.
   Recommendation: mint **exactly one** token (12px sans) rather than three at once — three
   re-creates the "dozen styles" problem you pushed back on. Any 14px token must use a
   unitless line-height.
3. **Six competing mono-label tracking values** (`0.08em` ×28, plus `−0.02em`, `0.06em`,
   `0.04em`, `0.02em`, `tracking-widest`). TYPOGRAPHY-BACKLOG ⑧ already rules for `−0.02em`.
   This is a **visible** change, so it wants one reviewed sweep with a contact sheet — which
   is why it wasn't swept in this session. The four consts hoisted this session make it
   cheaper.
4. **Four different modal scrims** (0.35 / 0.45 / 0.72 / 0.78). Recommendation: **two**
   tokens, not one — a panel scrim and a media scrim are different jobs, and one value either
   washes out the lightbox or over-weights the dialog.
5. **The mono font-family string is repeated 37×.** ⚠️ Not a mechanical swap:
   `--font-mono-system` resolves to `ui-monospace, Menlo, Monaco, monospace` and **omits Geist
   Mono entirely**, so swapping to it would change the typeface. Mint a second var
   `--font-mono` carrying the exact current chrome string.
6. **No shadow or scrim token family exists** — 13 one-off shadow stacks. A three-rung
   elevation scale (soft / raised / float) would cover them. Do *not* dedupe the
   `DeviceShell` ↔ specimen shadow; `specimens.md` sanctions those copies.

**On spacing:** worth saying plainly, because it's good news. There is **no spacing token
layer at all** — no `tailwind.config.*`, no `--space-*` in `@theme` — and yet the codebase
follows Tailwind's 4px scale about 99% of the time, with only 3 genuine violations across the
whole tree. Combined with `CONTENT_BAND` and the 48px header rhythm, **spacing is already the
most systematic of the three axes.** It does not need a token layer; adding one would be
ceremony. Type is the weak axis, not spacing.

---

## 3. STALE DOCUMENTATION FOUND ALONG THE WAY

- `.claude/rules/homepage.md` documents a **"Card/List View Toggle"** — localStorage key
  `work-view-mode`, `CaseStudyListRow`, an AnimatePresence blur transition. **None of it
  exists.** `ViewToggleButton` is defined but never rendered and `GalleryIcon` is imported
  unused.
- `.claude/rules/homepage.md` says the marquee is a snap carousel. As of this session it is
  not; the rule needs updating.
- `site/lib/carousel-transition.ts` is dead code — exported, imported nowhere.
- The site-wide password gate is confirmed **off** (`lib/site-gate.ts:18`), which resolves the
  open question in `access-gating.md`.
- `perf-backlog #6` says six dither canvases. The real count is **eight** (the audit's ninth
  was the shader library's injected `<style>` tag).

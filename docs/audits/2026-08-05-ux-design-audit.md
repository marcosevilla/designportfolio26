# UX & Design Audit — 2026-08-05

**Method:** `interface-craft` → `design-critique` sub-skill (Josh Puckett methodology).
Code-only review — no browser was available. Claims needing a rendered check are marked
**[verify visually]**.

**Reviewer's frame:** a hiring manager for a senior IC / lead product design role. 60–90
seconds. Probably a laptop, possibly a phone from a LinkedIn DM.

**Prior art:** findings are tagged **NEW**, **KNOWN** (already in `docs/PORTFOLIO-AUDIT.md`
or `docs/QA-FINDINGS.md`), or **CHANGED** (the old finding is stale — the code moved under
it). A meaningful share of the Feb 2026 audit is now CHANGED; the site has moved a lot.

---

## TOP 5 — DO THESE NOW

Ranked by impact-per-effort. All five are small and contained. #6–#8 below are near-ties.

| # | Change | File | Effort |
|---|--------|------|--------|
| 1 | Point F&B's "Next project" at `ai-workflow`, not the locked `compendium` — the one readable case study currently ends by walking the reader into a password wall | `app/work/fb-ordering/FBOrderingContent.tsx:338` | **S** |
| 2 | Stop chat recommending locked studies. It links and unfurls rich cards for all 8 slugs; 6 of them dead-end at the gate | `lib/chat/system-prompt.ts:53-64, 73-85` | **S** |
| 3 | Default `ExpandableSection` to **open** below `md`. On a phone every study collapses 3–7 sections behind chevrons — including every "Impact & Results" | `components/case-study/ExpandableSection.tsx:22` | **S** |
| 4 | Put the metric on the homepage card face (`$6.94M CARR` etc. already exist in frontmatter and never render), and fix the 3 marquee years that contradict the MDX | `components/CaseStudyList.tsx:390-443, 530-574` | **S** |
| 5 | Give the work marquee a visible scroll affordance. 8 studies sit behind hidden horizontal scroll that a mouse wheel cannot move | `components/CaseStudyList.tsx:455-505`, `app/globals.css:1169-1195` | **M** |

**Near-ties, all defects rather than preferences:** a locked card's click is a **silent
no-op** for two studies (#6); `CustomCursor` kills `cursor: pointer` site-wide with
`!important` (#7); About has **no URL** so it can't be linked or shared (#8).

---

## Context

A personal portfolio for a product designer with ~4 years' experience, targeting senior IC
and lead roles. The emotional context is **low-patience, high-skepticism**: the reader
didn't choose to be here, has 40 other tabs, and is looking for permission to stop reading.
The site's job is to survive 10 seconds and then hand over one complete, credible piece of
work.

It's also deliberately a *demonstration artifact* — the interaction craft is part of the
argument. That's a legitimate strategy and it mostly works. Almost every failure below is a
case where the craft got ahead of the reading.

---

## First Impressions

This is a well-built site with a legibility problem, not a taste problem. The typography
system is disciplined (8 tokens, one family plus a display serif). The chrome is far more
restrained than its reputation — **four controls total**, not the dozen the brief assumed.
The accessibility floor is real: skip link, global focus-visible, 44px coarse-pointer hit
areas, a CSS `prefers-reduced-motion` catch-all that nukes every keyframe animation,
`AutoplayVideo` gated on both reduced-motion and an IntersectionObserver. Someone has
sweated this.

But the site answers "who is this person" much better than "what should I click." The
largest type on the homepage is a 32px serif **name**. There is no positioning line, no
headline, no claim — the best sentence Marco has written about himself is hidden inside a
hover tooltip. Eight case studies live in a full-bleed horizontal carousel with the
scrollbar deliberately hidden, no arrows, no counter, no page indicator — and **six of the
eight are locked.** Three cards render a grey "Under construction" frame, including
`ai-workflow`, one of only two readable studies. Four named recommendations — a Netflix
designer, a VP of Product — sit two non-obvious clicks deep on a surface with no URL.

The result: a reader who does exactly what the interface invites — scroll down — sees a
name, a bio, one case study card, and four unlabeled videos. The work is there. It is not
being shown.

---

## The locked-content wall

### Count

`site/lib/locked-content.ts:7-18` — **6 of 8 case studies are locked. 2 are open.**

| Locked (6) | Open (2) |
|---|---|
| `compendium` · `knowledge-base` · `upsells` | `fb-ordering` |
| `checkin` · `general-task` · `design-system` | `ai-workflow` |

By carousel order (`content/*.mdx` `order`): position 1 open, positions **2–7 are six
consecutive locked cards**, position 8 open. A visitor swiping right from the first card
hits six dead cards in a row.

`public/sitemap.xml` correctly lists only `/`, `/work/fb-ordering`, `/work/ai-workflow`.
The site-wide password wall (`lib/site-gate.ts:20`) is **OFF** — correct for sharing with
recruiters.

### What a recruiter actually experiences — NEW

There are **three** ways to hit the wall, and the two most likely are the worst.

**Path A — clicking a locked card on the homepage.**
`CaseStudyList.tsx:834` passes `onActivate={() => onPreview(study.slug)}`, overriding
LockGate's default `requestUnlock`. The click opens `MediaPreviewLightbox`
(`CaseStudyList.tsx:858`): a dark scrim and one image at up to 90vw × 85vh. **No title, no
caption, no indication it's gated, no email CTA, no "I have a code" affordance, no close
button** — only a scrim click or Escape. The reader learns nothing and is offered nothing.

Worse: `firstStudyMedia()` returns `null` when a study has no gallery entry, and
`lib/gallery-content.ts:159-160` has `"design-system": []`, `"ai-workflow": []`, and **no
`knowledge-base` key at all**. The lightbox renders `{slug && media && …}` — so clicking
the **Design System** or **AI Knowledge Base** card produces *zero* visible response.
A silent dead click on a designer's portfolio. That's a defect, not a preference.

Compounding it: the only lock affordance is `LockedFrameBadge` (`LockGate.tsx:132`), which
is `opacity-0 group-hover:opacity-100`. **Touch has no hover** — so a phone visitor gets no
lock indicator at all. The card looks like every other card, and tapping it either flashes
an unexplained image or does nothing.

**Path B — chat recommends a locked study. NEW, and the most damaging.**
`lib/chat/study-metadata.ts:8-17` exposes all 8 slugs to the model's link allowlist.
`lib/chat/system-prompt.ts:53-64` emits a `<case_study_public>` block for every slug and
`OUTPUT_RULES` (`:73-85`) lists all 8 as valid link targets. **The system prompt never
tells the model which studies are locked.**

Privacy is intact — `case-study-content.ts:47` returns `""` for locked slugs, so the model
only sees metadata (`chat.md` documents this guardrail). But *linking* is not gated. So the
model will happily write `[Upsells Forms](study:upsells)` and emit
`<artifact slug="upsells" />`, `CaseStudyCardUnfurl` renders a rich card advertising
`$6.94M CARR · +10% lift`, and the click lands on the gate.

That is a recruiter clicking a card the AI just recommended, with a revenue figure on it,
and hitting a password wall. The AI is actively generating dead ends. Fix: pass `isLocked()`
into `renderCaseStudies()` and either drop locked slugs from the allowlist or instruct the
model to route those to email instead.

**Path C — landing on `/work/compendium` directly.** This one is well built.
`LockedPagePlaceholder` (`LockGate.tsx:157-321`) shows the study title, subtitle, a lock
glyph, and three CTAs — Email, LinkedIn, "Got a code?" — with proper hover and focus
handling. This is the experience the other two paths should inherit.

### Is the value proposition strong enough to make someone email? — NEW

No. All three walls say the same 13 words:

> "This case study is currently being polished. Reach out directly if you'd like early access."

That's a status report, not an offer. It describes *Marco's* state, not what *they'd* get.
The Upsells wall could say "$6.94M CARR, +10% measured conversion lift, sole designer" — the
metric is sitting in `content/upsells.mdx:12` right now. Nobody emails a stranger for an
unlabeled box.

Second problem: **"Under construction" is the wrong frame for a job search.** It reads as
*unfinished*, inviting "this person doesn't ship." "Available on request" reads as
*deliberate* — same gate, opposite signal. The phrase appears three times meaning two
different things: the page placeholder (`LockGate.tsx:242`), the modal
(`PasswordModal.tsx:129`), and — confusingly — cards with no media at all
(`CaseStudyList.tsx:764`), where it means "no asset yet."

### Honest opinion on the ratio

6-of-8 is too many for an active search. The reachable surface is: one flagship product
study, one process essay, a bio, four testimonials, four unlabeled videos. A hiring manager
cannot triangulate range from that. And because the two most metric-dense studies (Upsells
$6.94M CARR; Compendium $1.51M / +230% YoY / 44% attach) are both locked, **every hard
revenue number on the site is behind the wall.**

`upsells` has a real reason to stay locked — **17 live gray placeholder boxes**, including
an 8-up gallery headed "The Work" containing zero work. But `checkin`, `general-task`, and
`design-system` have **zero placeholders** and passed a clean 5-width × 2-mode QA sweep on
2026-08-01 (`QA-FINDINGS.md`). Unlocking two of those three would roughly double the
readable portfolio for near-zero work — with two caveats worth pricing in (see rec #12).

---

## First 10 seconds / above the fold

### What's actually above the fold at 1440×900 — NEW

From `GlobalToolbar.tsx:66` (`pt-12`, `h-9`), `HomeLayout.tsx:206` (48px), `:249`
(`gap-12`), `:390` (`mt-[100px]`):

```
 48  toolbar top padding
 36  toolbar row  (music glyph · theme toggle · palette disc)
 48  gap
~38  h1 "Marco Sevilla"   ← Libre Baskerville 400, 32px, largest type on the page
 48  gap
~180 bio, 2 paragraphs at 15px/1.647
 32  gap
~25  "Learn more →"
100  section gap
────
~555px  first work card's title row
```

The fold shows the name, the bio, and roughly the top 340px of the first card's 400px media
frame. That's a workable fold. The problem is what it *says*.

### Findings

**No positioning claim above the fold — KNOWN, but the copy has changed.**
`PORTFOLIO-AUDIT.md §2.6` flagged "I design software in San Francisco." It now reads
"Product Designer based in San Francisco, California. Currently at Canary Technologies…"
(`HomeLayout.tsx:305`). Still location-first; still true of several thousand people.

The actual differentiator is in a **hover tooltip** (`HomeLayout.tsx:331-341`):
*"I've led design for several 0→1 products… a guest experience platform, a hotel CMS,
mobile food and beverage ordering, and the knowledge base that powers our AI-native
products."* That is the best sentence on the site and it is invisible to anyone who doesn't
hover a dotted link, and unreachable on touch. **[verify: confirm there's no tap path.]**

**The name is the largest element on the page, at 32px — NEW.**
`lib/typography.ts:42-49` pins `serifName` to 32px; nothing on the homepage is larger.
Visual weight should track semantic importance, and here the heaviest element carries the
least decision-relevant information — the reader's eye lands on a name they already knew
from the link they clicked. **Opinion, not defect** — quiet-name-plus-strong-work is a real
convention, and this came from the Aug 2026 Figma. But it only pays off if the work below is
immediately legible, and right now it isn't.

**The work section has no heading — NEW.**
`CaseStudyList.tsx:136-138` documents that "Select projects" was removed so the strip
"leads the section on its own." But the *playground* section below it keeps its
`<SectionLabel>Just for fun</SectionLabel>` (`:368`). The page reads: name → bio →
[unlabeled strip] → "JUST FOR FUN" → [videos]. **The labeled section is the side projects;
the client work is anonymous.** That's backwards for this audience, and it means the
`#projects` anchor — the target of every case study's Back link — lands on an unlabeled
region.

---

## Information scent — can you judge the work before clicking?

### The metric never renders on the homepage — NEW, highest cheap win

Every study's frontmatter carries a `metric`:

| Study | `metric` |
|---|---|
| fb-ordering | `0→1, 100% ownership` |
| compendium | `$1.51M CARR · +230% YoY · 44% attach` |
| upsells | `$6.94M CARR · +10% measured lift` |
| checkin | `~6,000 Wyndham properties` |
| general-task / design-system | `0→1 product` / `0→1 system` |
| knowledge-base | `2 AI products, one KB` |
| ai-workflow | `~50 prototypes · 8-PR ship` |

`MarqueeTitleRow` (`CaseStudyList.tsx:530-574`) renders `meta` at the card's top right.
`StudyCell:802` passes `` display ? `${display.org} • ${display.year}` : study.metric `` —
and since 7 of 8 studies have `MARQUEE_DISPLAY` entries, **`study.metric` is a dead fallback
only `knowledge-base` ever reaches.** The card face shows "CANARY TECHNOLOGIES • 2026" — the
two least differentiating facts available — and the revenue numbers never appear on the
homepage at all.

Descriptions carry some numbers, but `MarqueeDescription` only renders in the **focused**
state (`.mq-desc` is `grid-template-rows: 0fr; opacity: 0` at rest, `globals.css:1256-1268`),
so at most one is visible at a time — and the F&B and Check-in descriptions have no metric
in them either.

The data exists. It's one line in `MarqueeTitleRow`.

### Three marquee years contradict the MDX — NEW, factual defect

| Study | Marquee shows | MDX / `StudyMetaRow` shows |
|---|---|---|
| general-task | **2024** | **2022** |
| design-system | **2025** | **2022** |
| upsells | **2026** | **2025** |
| fb-ordering | 2026 | 2025–26 |
| compendium | 2025 | 2024–2025 |

General Task work is from 2022; the homepage dates it 2024 and the case study page dates it
2022. Beyond the credibility hit, the inflated dates make 2022 work compete with current
Canary work for recency. Better fix than patching the strings: delete `year` from
`MARQUEE_DISPLAY` and read `study.year`, so they can't drift again.

### `knowledge-base` has no marquee entry — NEW

`MARQUEE_DISPLAY` has 7 entries for 8 studies. `knowledge-base` falls through to
`study.title`, `study.metric`, and **no description** — so when that card reaches the focus
slot, the focused state expands to reveal nothing. One card behaves differently from the
other seven for no visible reason.

### Three cards ship a grey "Under construction" frame — CHANGED

`galleryContent` is empty or missing for `design-system`, `ai-workflow`, and
`knowledge-base`, so `StudyMediaFrame` falls to the `!hasMedia` branch
(`CaseStudyList.tsx:741-766`). **`ai-workflow` is one of only two readable studies and its
homepage ad is a placeholder.** `PORTFOLIO-AUDIT.md §2.1` counted 64 in-page placeholders;
that wall is now 95% cleared — but the *card* placeholders survived the cleanup.

### The marquee cannot be scrolled with a mouse — NEW, structural

`.work-marquee` is `overflow-x: auto` with `scrollbar-width: none` and
`::-webkit-scrollbar { display: none }` (`globals.css:1169-1195`). No arrows, no dots, no
counter, no edge fade. At 1440 the slot inset is 382px and cells are 520px, so ~1.9 cards
are visible — the second card's left edge is the only hint more exist.

Chrome, Firefox, and Safari do **not** translate a vertical mouse wheel into horizontal
scroll on an `overflow-x` container. A mouse user must know to hold Shift, or drag. So a
meaningful share of desktop hiring managers see exactly **one** case study and conclude
that's the portfolio. **[verify visually]** — but the CSS gives no reason to expect
otherwise.

Keyboard users are better served: cells are real `<Link>`s with a focus ring (`:822`), and
browsers scroll focused elements into view, so Tab traverses all 8. Mobile is best of all —
snap + `snap-stop: always` gives clean one-card swipes. **An odd inversion: the mouse user,
the most likely hiring-manager profile, gets the worst experience.**

*Supersedes `PORTFOLIO-AUDIT.md §2.2` ("work panel too narrow", 640px SectionSnap grid) —
that layout no longer exists. CHANGED.*

### The playground section is four anonymous videos — NEW

`PlaygroundCell` (`CaseStudyList.tsx:943-956`) renders **only** the media frame; captions
were removed and titles "surface through the cursor chat bubble." `CustomCursor` is
`(pointer: fine)` only and the bubble is `hidden lg:block` — so **on every phone and tablet
the playground is four unlabeled looping videos with zero context.** Even on desktop the
label requires hovering and waiting for a spring-following bubble.

---

## Case study reading experience

### The one complete reading path ends in a wall — NEW, top priority

| From | → To | Target locked? |
|---|---|---|
| **fb-ordering (open)** | **compendium** | **YES — dead end** |
| ai-workflow (open) | fb-ordering | no |
| compendium | fb-ordering | no |
| design-system | fb-ordering | no |
| knowledge-base | compendium | yes |
| upsells | checkin | yes |
| checkin | general-task | yes |
| general-task | design-system | yes |

The realistic journey is: homepage → F&B Ordering → read it all → click the one forward CTA
the page offers → **"Under construction."** The reader's reward for finishing the flagship
is a locked door.

`access-gating.md` explicitly warns about this ("Dead-end hazard: when locking a study,
check every `NextProject` that points at it"), and **Compendium's own `NextProject` was
already redirected away from Upsells for exactly this reason** —
`CompendiumContent.tsx:320-322` carries the comment "readers who finished the study were
hitting a wall." F&B never got the same fix. One line.

### Opening: outcome or process?

3 of 8 open on the **problem**, 3 on **company/process boilerplate**, 1 on narrative
outcome, 1 on a demo.

**Strong:**
- **ai-workflow** — h1 → meta row → subtitle → `QuickStats` → an Overview that opens
  *"In February 2026, the CEO asked for a demo for B&B Hôtels — a 400-hotel French chain.
  The sales call was in 24 hours."* (`:70-72`). Best opener on the site: stakes first.
- **compendium / knowledge-base / upsells** open on "The Problem" and land the outcome in
  the deck (compendium `:44`: *"now the hub 175,000 guests open every month, and a $1.51M
  product line growing 230% year over year"*).

**Weak — NEW:**
- **checkin** opens with *"Canary is on a mission to completely revamp hotel software…"*
  (`:54-56`). **That's the employer's mission statement, not Marco's work.** Section two is
  "My Role," also general. There is no problem statement anywhere in the study.
- **general-task** — *"At General Task, our goal was to develop tools that made software
  engineers more productive."* Company-first again.
- **design-system** — company mission, then "My Contributions" as **five emoji bullets**
  (📣 🔬 🗓️ 💻 🤝, `:86-104`). For a senior-IC target this reads as a portfolio template.
  `general-task` has emoji bullets too.
- **fb-ordering** — no heading at all after the intro; **~180 lines of interactive demos
  before the first narrative section** ("Context," `:230`). The demos are the best thing on
  the site, but a reader looking for the story has to scroll past four of them to find it.

The two structural families ("Overview → My Role → …" vs "Problem → Solution → Research →
Process → Impact → Reflection") are visibly two generations of writing. **KNOWN** as the
Tier 1 / Tier 2 gap (`PORTFOLIO-AUDIT.md §2.4`); the specific "opens on the employer's
mission" framing is NEW and is the most fixable part of it.

### No case study has a hero image — NEW

`CaseStudyHeroImage.tsx:13` returns `null` when `src` is missing, and **every call site
passes only `description`, never `src`** (checkin `:43`, compendium `:49`, design-system
`:45`, general-task `:44`, upsells `:46`). Five files render a dead `{/* Hero Image */}`
comment and nothing. Every study opens on type alone.

Combined with: **`knowledge-base` and `ai-workflow` have zero visuals across ~2,400 combined
words.** `knowledge-base` is the longest read on the site (328 lines, ~1,718 words, ~7.5
min) with not one image.

### Placeholder count — correcting my own earlier read

A raw grep overcounts. The live totals:

| Study | Live `ImagePlaceholder` |
|---|---|
| **upsells** | **17** — incl. an 8-up gallery at `:406-416` headed "The Work" |
| fb-ordering | **0** — its 3 are inside JSX comments, hidden 2026-07-15 |
| all others | 0 |

`ImagePlaceholder.tsx:14-24` renders a real visible box in production (`bg-surface-raised`,
border, centered 13px tertiary caption); only the red "No image" badge is edit-mode-only.
So `upsells` is a 7.5-minute read where **every visual is a gray box.** That alone justifies
keeping it locked.

Good news for the flagship: **F&B has zero live placeholders.** `PORTFOLIO-AUDIT.md §2.1`'s
64-placeholder dealbreaker is essentially resolved except for Upsells. **CHANGED.**

### Mobile hides the outcome evidence — NEW, high impact

`ExpandableSection.tsx:22` — `useState(false)`. **Below `md` (768px) every wrapped section
is collapsed by default** behind a chevron.

| Study | Sections collapsed on mobile |
|---|---|
| design-system | 7 |
| general-task | 6 |
| checkin / compendium / knowledge-base / upsells | 4 each |
| fb-ordering | 3 |
| ai-workflow | 0 |

On a phone, `checkin` shows Overview + My Role as prose and then **four closed accordions**.
Compendium / knowledge-base / upsells hide Research, Process, **Impact**, and Reflection.
The single piece of content most likely to close a hiring decision — "Impact & Results" — is
the content least likely to be opened on the device recruiters most often triage on.

Secondary cost: `ExpandableSection` renders `{children}` **twice** (`:31` desktop, `:64`
mobile) — a full duplicate DOM on every case study.

### Reading affordances — mixed

- **`ProgressBar`** on every study (`CaseStudyShell.tsx:28`), 2px accent, `role="progressbar"`
  with a live `aria-valuenow`. Good.
- **Desktop TOC** — `InlineTOC` fixed at `top-[18vh]`, animated star marker, observer with a
  900ms click lock. Good.
- **Mobile TOC** — exists via `MobileNav` → `HamburgerMenu` (same `tocItems`), and
  `globals.css:1035-1058` correctly closes the 1024–1099 gap. But it costs two taps and
  gives no "you are here" while scrolling.
- **No reading-time estimate anywhere.** Two studies are 7.5-minute reads with no signal.
  **KNOWN** — `PORTFOLIO-AUDIT.md §18` (P3). Worth promoting: it's a two-line change that
  reframes a long study as a considered one rather than a wall of text.
- **`NextProject` subtitle is hover-only** (`:37`, `gridTemplateRows 0fr → 1fr`) — on touch
  the reader only ever sees the title, so the forward CTA has no description on mobile.

### `StudyMetaRow` hides the role on desktop — NEW

`StudyMetaRow.tsx:145-173` collapses every pill after the first to a 6px sliver with
`color: transparent`, expanding only on `onMouseEnter` (`:129`). `pills` is
`[...STUDY_TAGS[slug], role]` (`:60`) — **the role is the last pill**, therefore always
buried at rest on a hover-capable device.

A desktop reader's first look at a case study header is: "CASE STUDY · CANARY TECHNOLOGIES ·
2025–26", one tag, four transparent slivers, "+4". *What was your role* — the first thing a
hiring manager checks — requires a hover.

It's also a keyboard gap: pills are plain `<span>`s with no `tabIndex` and no focus handler,
so a keyboard user on a desktop can never expand them. (Screen readers are fine — the text
is in the DOM and only "+N" is `aria-hidden`.)

### `QuickStats`

`fb-ordering` — the flagship, the most-linked, the only fully public product study — **has
no `QuickStats` at all.** Its numbers ($50k committed ARR, ~4 months, $25K+ APAC pipeline,
270-property Eurostars unblock) live only in prose. Six *locked* studies have stat blocks.
A 60-second skimmer has to read a 90-word paragraph to find "$50k committed ARR."

In `ai-workflow`, `QuickStats` is rendered **without a `<Grid>/<Col>` wrapper** (`:61-63`)
while `CaseStudyShell` is called without `band` — so it spans the full `.case-canvas`,
roughly **twice the measure of the prose above and below.** **[verify visually.]**

Weak stat values that dilute the row: design-system `"1" / "Unified source of truth"` and
`"6" / "Cross-functional team members"`; ai-workflow `"This site" / "Built the same way"`.

### `TwoCol` no longer makes two columns — NEW

`TwoCol.tsx:10` is `flex flex-col gap-6` and `.Left`/`.Right` are pass-through divs. So on
**desktop** every "text left / visual right" pairing in the TwoCol-era studies (upsells
`:95-105` and others) now renders as text-then-box, stacked. The editorial intent described
in `PORTFOLIO-PRIORITIES.md` ("prose left/image right pairings") is gone. **CHANGED** —
either intentional and the docs are stale, or a regression. Worth a ruling.

### `ViewportFade` dims the fold — KNOWN

`QA-FINDINGS.md` documents it: a `lg:block fixed bottom-0` 120px gradient terminating at
100% `--color-bg`, so text crossing the fold is *erased* rather than softened — worst on
`fb-ordering`, where it hits the h1. Awaiting Marco's ruling. I'd action it: a terminal stop
around 85% keeps the intent and stops hiding copy.

---

## Mobile (390px)

**All of this wants a contact-sheet check** — `cd site && npm run sheet -- <route>`.

**What renders:** the `GlobalToolbar` row (~114px of content in a 358px band — no overflow
risk even at 320px), the 32px serif name, the bio, the marquee, the playground, the footer.
**No nav at all** — `MobileNav.tsx:11` returns `null` when `tocItems === null`, which is the
homepage. About is reachable only via the inline "Learn more →". **Resume is below eight
case study cards.**

**Good at 390:** marquee snap behaviour, `QuickStats` collapsing to one column, `Grid`/`Col`
defaulting to full-width with `min-width: 0`, `StudyMetaRow`'s static wrapped row (better
than desktop), the F&B phone specimen (360pt shell fits at ~0.90 scale).

**Problems:**

1. **`ExpandableSection` collapse** — see above. The single biggest mobile issue.
2. **DemoStage staff specimens pan blind — NEW.** `OrderDashboardSpecimen`,
   `ItemLibrarySpecimen`, and `OutletDetailsSpecimen` are `APP_W = 1177`. `DemoStage.tsx:317-345`
   computes `fit = 358/1177 = 0.30` but floors at `MIN_INLINE_SCALE = 0.7` because
   `innerWidth < PAN_BELOW (1200)`. Rendered stage = **824px wide inside a 358px column** →
   `panning = true`, and the well carries `scrollbar-hide` (`:793`). Three demos on F&B each
   require horizontal dragging with **no scrollbar, no affordance, no hint** — and the
   content is `inert` + `pointer-events: none`, so nothing inside signals interactivity
   either. `ObjectFlowDiagram` has the same problem below ~820px (**KNOWN**, `QA-FINDINGS.md`).
3. **Locked cards give no lock signal** (hover-only badge) and tapping is unexplained or
   silent.
4. **Playground: 4 unlabeled videos**, no cursor labels on touch.
5. **The bio's Canary tooltip** carries the best positioning copy on the site with no
   obvious tap path. **[verify]**
6. `PlaygroundMediaFrame` portrait cells are `max-w-[420px] mx-auto h-[560px]`
   (`CaseStudyList.tsx:970`) — a fixed 560px height at 390px is ~1.4× the phone viewport for
   one decorative video. **[verify]**
7. **`StudyMetaRow` overflows on narrow *desktop* windows — NEW.** The collapse/overlay
   geometry is all `sm:`-prefixed (`:101, 121-127`). At `<640px` with `hover: hover`, the
   branch is `flex flex-nowrap` with no `sm:absolute` anchor, so hovering expands all pills
   on one unwrappable line — `checkin` has 7 pills, ≈590px in a 358px band.
8. Raw `<img>` (not `next/image`) in 4 studies — no overflow, but no responsive `sizes`.

Nothing here is a hard layout break. The mobile problems are *information* problems.

---

## Accessibility as UX

### Genuinely strong

- Skip-to-content mounted first in `<body>` (`layout.tsx:103`).
- Global `*:focus-visible` (`globals.css:47, 260`) plus rings on most chrome buttons.
- `@media (pointer: coarse)` grows toolbar hit areas to ~44px via `::after` with no visual
  change (`globals.css:487-499`).
- A `prefers-reduced-motion` catch-all zeroing `animation-duration`,
  `animation-iteration-count`, `transition-duration`, and `scroll-behavior` on
  `*, *::before, *::after` (`globals.css:767-776`), plus five targeted blocks.
- `DitherBackdrop`, `PixelRain`, `LedMatrix`, `AutoplayVideo`, `DemoStage`, `PhotoStack`,
  `Hero`, and `HomeLayout` all check reduced motion in JS.
- `BackgroundTexture` — the Feb audit's worst offender (§5.2) — is now disabled entirely.
  **CHANGED / resolved.**
- `PasswordModal` restores focus on close (`:26-35`), handles Escape, uses `role="alert"`,
  and sets the input to 16px to defeat iOS zoom.
- All chrome controls are real `<button>`s with `aria-label`s and correct
  `aria-expanded`/`aria-pressed`.

### The custom cursor removes clickability signalling site-wide — NEW

`CustomCursor.tsx:46-51` emits:

```css
@media (pointer: fine) {
  body, body *:not(input):not(textarea):not([contenteditable='true'])
  { cursor: url("data:image/svg+xml,…") 2 2, auto !important; }
}
```

`!important` on `body *` beats every semantic cursor in the codebase: `pointer` on links and
buttons, `grab` on the chat sheet grabber (`ChatBar.tsx:463`), `not-allowed` on the disabled
send button (`ChatPanel.tsx:438`), `text` on selectable prose. **Hover affordance for every
interactive element on the site is now conveyed by colour change alone.**

The pointer-hand is the most universal clickability signal on the web. Removing it on a site
whose central problem is "the reader doesn't know what to click" works directly against the
site's own goal — and compounds every scent issue above: unlabeled marquee cards, unlabeled
playground videos, an unlabeled chat FAB.

Three further costs: the arrow is `fill: var(--color-accent)` with a 1.5px bg stroke, so on
low-separation themes (butter light ≈4.2:1) the pointer itself is low-contrast, and over a
hero gradient or dither canvas it can vanish; it ignores OS cursor-size and
high-contrast-pointer settings; and a `MutationObserver` on `documentElement`
`{attributes: ["class","style"]}` (`:71-77`) rebuilds the whole `<style>` node on every theme
variable write — `applyColoredTheme` sets 10 properties in sequence, so 10 callbacks and 10
style recalcs per theme switch.

**The `!important` blanket is a defect** (it silently overrides intentional styling
elsewhere). Whether the arrow should appear over links at all is taste — on a portfolio read
by strangers under time pressure, I'd keep the hand.

### Contrast — KNOWN in kind, worse in specifics

`--color-fg-tertiary` is **0.35 alpha in all 22 theme variants** → `#ababab` on white =
**2.28:1**. That fails AA (4.5:1) *and* the 3:1 non-text minimum. It carries: the chat error
message, the chat placeholder, the "Copy" label, **all testimonial credentials** ("Design,
Netflix"), all resume meta, changelog meta, and the marquee's `COMPANY • YEAR`.

`--color-fg-secondary` is 0.6 light / 0.5 dark → 4.95:1 and 4.71:1 — passes AA, but by 0.45
and 0.21 respectively. This matters because `globals.css:202-204` makes **every `<p>` on the
site** render at `fg-secondary`.

**Three colored themes fail AA on accent/bg in light mode:** ember `#b85a1c` on `#f7eee3` =
**4.05:1**; butter `#8a7028` on `#f6f2e6` = **4.24:1**; sky `#2d7aa8` on `#edf4f8` =
**4.24:1**. The comment at `ThemeToggle.tsx:9-10` claims variants are "hand-tuned so fg/bg
and accent/bg contrast meets WCAG AA on both sides." That claim does not hold. Accent drives
inline links, `.filled-cta` fills, the cursor arrow, and the palette disc — and
`--color-on-accent: var(--color-bg)` inherits the same failing ratio for reversed-out text.
Dark variants generally pass.

*Sharper than `PORTFOLIO-AUDIT.md §5.1`, which estimated rather than computed.*

### Other a11y defects — NEW

- **No focus trap on any surface.** The mobile chat sheet (`ChatBar.tsx:451-453`) and the
  hamburger takeover (`HamburgerMenu.tsx:159-161`) both declare `role="dialog"
  aria-modal="true"` and neither constrains Tab — a keyboard user tabs straight out into the
  page behind. **KNOWN in part** (`PORTFOLIO-AUDIT.md §5.4` flagged ThemePalette); it's
  broader than that.
- **No focus restore on chat close** (`ChatBar.close()`, `:159-164`) — after Escape, focus is
  on `<body>`.
- **`InsetScrubber` is a WCAG 2.1.1 failure.** `InsetScrubber.tsx:42-73` is
  `role="slider" tabIndex={0}` with `aria-valuemin/max/now` and **only pointer handlers** —
  focusable, announced as a slider, operable only by mouse. Its `aria-valuenow` is raw
  seconds with no `aria-valuetext`, so it announces "247" not "4 minutes 7 seconds."
- **Six focus-visible sites replaced with colour-only indication** —
  `focus:outline-none` + `focus-visible:text-(--color-accent)`. Including
  **`Hero.tsx:414`, the About page's only exit button**, plus `Testimonials.tsx:127`
  (Read more) and `CaseStudyList.tsx:291`. The chat `<textarea>` (`ChatPanel.tsx:413, 423`)
  kills its outline and relies on a `color-mix(accent 22%, transparent)` border tint, well
  under 3:1.
- **10 chrome animations ignore `prefers-reduced-motion`** — there's no global
  `<MotionConfig reducedMotion="user">` in `app/layout.tsx`, so every Framer Motion
  animation outside the eight components that check manually runs regardless. Worst:
  `ChatPanel`'s `AnimatedGreeting` (`:27-144`) — a reduced-motion user opening chat gets a
  1.5s blinking cursor, then ~20 words appearing one at a time with randomised 55–195ms
  delays and a spring position-jitter per word. The greeting is unreadable for ~3 seconds.
  **A one-line fix** (`MotionConfig` in the layout) covers most of the ten.
- **`ChatFab` has no `aria-expanded`** despite toggling a dialog.
- `PhotoStack`'s trigger is a `<span tabIndex={0}>` with no role and no `onKeyDown`
  (`:112-119`). `HighlightableBio` is mouse-only (`onMouseUp`, `:59`).

### Theme toggle may not repaint — KNOWN, unresolved, now urgent

`QA-FINDINGS.md` (2026-08-05): `applyColoredTheme()` pins **resolved colors as inline styles
on `documentElement`**, which beat the `.dark` class cascade, so the toggle flips the class
without changing the paint. Two agents reproduced it under automation. If it reproduces for
a real visitor, one of the site's four global controls is broken on the live site — a bad
look on a portfolio whose theming system is a selling point. **Confirm by hand before
anything else on this list.**

---

## Cognitive load — is the playfulness helping?

### Honest inventory — the brief's premise is out of date

Persistent controls on the homepage:

| Control | Where |
|---|---|
| Music (PixelRain glyph) | `GlobalToolbar` left |
| Light/dark toggle | `HeaderToolbar` |
| Theme palette disc | `HeaderToolbar` |
| Chat FAB | fixed bottom-right, 44px |

**Four.** And that's it. `ChangelogButton` is commented out of the render
(`HeaderToolbar.tsx:229-230`). `HomeNav` and `NavOverlay` are not mounted anywhere.
`BackgroundTexture` is disabled. **The font-size slider does not exist** —
`increaseFontSize` / `decreaseFontSize` / `resetAll` are implemented
(`ThemeToggle.tsx:357-387`) and exposed on the context with **zero UI consumers**, so
`--font-size-offset` is permanently `0px` and all the `calc(15px + var(--font-size-offset))`
machinery threaded through `lib/typography.ts` is inert.

So the chrome is genuinely restrained and the Feb audit's crowding concern is resolved.
**CHANGED.** (But: the docs still describe a font-size control as a shipped accessibility
feature. It's an *unreachable* accessibility affordance — worse than an absent one, because
it stops anyone from noticing the gap.)

### The load isn't in the chrome — it's in the ambient motion

Running simultaneously on the homepage: **8 `DitherBackdrop` WebGL canvases** (one per card,
**no IntersectionObserver — they animate while scrolled off-screen**; perf-backlog #6 says
6, `homepage.md` says 9, the real count is 8), the `FnbDitherFrame`, up to 8 looping videos
(properly gated), the `PixelRain` tick, a 6.5s asterisk shine loop, a spring-following
cursor bubble, and per-card `CursorGlowOverlay` rim tracking.

That's a *perceptual* cost as much as a thermal one: nothing on the page is still, so nothing
on the page is emphatic. The marquee's focused-card reveal — the one motion carrying actual
information — competes with eight dither waves for attention.

### Verdict

**The playfulness is helping. It's being spent in the wrong places.** The craft is real and a
hiring manager will register it. The problem is allocation: the animation budget goes to
ambient decoration while the *informational* moments are under-designed — no scroll
affordance on the marquee, no lock signal on touch, a silent dead click, an unlabeled chat
FAB, an unlabeled work section.

The senior-role read isn't "too playful." It's *"did this person prioritize?"* A sharp
reviewer could currently conclude no: eight animated canvases for decoration, zero pixels
spent telling you there are seven more case studies to the right. Reallocating a fraction of
that motion budget toward wayfinding would make the playfulness read as **judgment** rather
than **enthusiasm** — which is exactly the senior signal.

---

## Chat

The chat is the site's strongest differentiator and its weakest-signposted feature.

**What's good:** four suggested prompts in the empty state ("Walk me through your most
impactful project" / "What's your design process?" / "How do you collaborate with
engineering?" / "What got you into design?"), one-click to fill *and* submit; a streaming
cursor; proper error handling for 429 / upstream failure / missing key / network throw, with
Upstash failing open; `sessionStorage` transcript; Escape to close; a desktop side panel
that pushes `<main>` rather than covering it; 16px mobile input to defeat iOS zoom;
`visualViewport` keyboard tracking. This is a well-engineered surface.

**Problems:**

1. **The entry point is an unlabeled circle.** `ChatFab` is a 44px bubble glyph whose only
   text is a hover tooltip (`ChatFab.tsx:72`) — invisible on touch and to a first-glance
   desktop scan. The overwhelming prior for a round bubble in the bottom-right corner is
   *customer support widget*. A **labelled pill already exists** in the codebase
   (`ChatBar.tsx:265-361`, reads "✳ ASK MARCO") and is explicitly discarded at `:365` with
   `void pill;`.
2. **Chat generates dead ends** — see the wall section, Path B. This is the highest-severity
   chat issue.
3. **The error line is nearly invisible and silent to AT** — 13px italic at `fg-tertiary`
   (~2.3:1), no `role="alert"`, no `aria-live`, positioned at the bottom of a scrolling
   transcript (`ChatPanel.tsx:366-377`).
4. **No indicator between submit and first token** — an empty assistant slot with a blinking
   asterisk, and nothing announced.
5. **`[label](resume)` routes to `/?about=1`** (`parseChatMarkup.tsx:44-48`), same as
   `about` — a chat "resume" link never reaches the actual PDF.
6. **The reduced-motion typewriter greeting** — 3 seconds before the greeting is readable.
7. `preventDefault` on wheel events outside the transcript (`ChatPanel.tsx:233-243`) also
   swallows trackpad scroll over the chat header.

The privacy guardrail also has a UX consequence worth naming: since 6 of 8 studies are
metadata-only in the system prompt, **chat can describe the locked work only in one-line
summaries.** Correct behaviour, but it means chat cannot compensate for the wall.

---

## About & testimonials

### About has no URL — NEW, high impact for a job search

There is **no `/about` route.** About is a client-state branch of the homepage:
`HomeLayout.tsx:110` `aboutMeOpen` → `:210-236` renders `<Hero>`'s About body
(`Hero.tsx:390-521`). The `?about=1` deep-link exists but `AboutParamWatcher` **erases it
from the URL** immediately (`HomeLayout.tsx:99`, `window.history.replaceState`).

Consequences: About **cannot be linked, bookmarked, shared with a hiring manager, or
indexed.** Back-button doesn't exit it. `<title>` and OG metadata stay on the homepage
values. Exit is a single "Return" button (`Hero.tsx:410-436`) whose focus indicator is
colour-only.

For a portfolio in an active job search, "here's my about page" is a link you send. Right
now there isn't one.

### The testimonials are excellent and buried

`lib/testimonials.ts` — **4 real, named, LinkedIn-linked people**, transcribed verbatim,
curated order:

| Author | Role line |
|---|---|
| Hans van de Bruggen | Design, **Netflix** · Design, LinkedIn |
| EJ Lee | Product, Canary · **Director of Product**, Bite |
| Quinn Duffy | Product, Canary · **VP of Product**, Alma |
| Kevin Doherty | Marketing, Alma · Marketing, August Health |

A Netflix designer writing *"I was in disbelief that it was his first Product Design role"*
and a VP of Product writing *"he doesn't wait for permission"* are exactly the third-party
signals that de-risk a senior hire. They are behind an inline "Learn more →" at the bottom
of a bio paragraph, on a surface with no URL.

Two craft notes: the "Read more" toggle has correct `aria-expanded` + `aria-controls` but a
colour-only focus state (`:127`); and the `org` line — **the credential that carries the
credibility** — is rendered at `fg-tertiary`, ~2.3:1, the least readable text on the card.

### Resume — the polished one is unreachable

`RESUME_URL` (`lib/resume-content.ts:16-17`) is a **Google Drive share link**, used by both
the About contact row and the homepage footer. Meanwhile a fully-built, print-optimised,
`forcedTheme="light"` resume page ships at **`/resume`** (`app/resume/page.tsx`,
`components/Resume.tsx:110-163`) and **nothing on the site links to it.**

Drive links can 404 for signed-out viewers or trigger a sign-in wall depending on sharing
state — a real risk for the primary recruiter CTA. (`/resume` also nests `<main>` inside the
layout's `<main>`.)

### Other About gaps — NEW

- **`ExperienceList`** (`Hero.tsx:22-72`, 4 CV entries) is defined and **never rendered** —
  the About page shows no work history at all. `components/WorkHistory.tsx` (121 lines,
  built off `RESUME_EXPERIENCE`) has **zero references anywhere**.
- **X/Twitter is unreachable.** `ConnectLinks.tsx` (X `@marcowitss`, LinkedIn, email, all
  properly `aria-label`'d) renders only inside the mobile hamburger takeover
  (`HamburgerMenu.tsx:248`), which only appears on case-study pages. Its other two consumers
  are unmounted components.

---

## Dead ends, orphans, dead code & console noise

| Finding | Location | Severity |
|---|---|---|
| **F&B "Next project" → locked Compendium** | `FBOrderingContent.tsx:338` | **High** |
| **Chat links + unfurls all 8 slugs; 6 are locked** | `lib/chat/system-prompt.ts:53-64, 73-85` | **High** |
| **Locked-card click is a silent no-op** (`design-system`, `knowledge-base`) | `CaseStudyList.tsx:265, 886` | **High** |
| **Locked-card lightbox has no copy or CTA** | `CaseStudyList.tsx:858-938` | **High** |
| **About has no URL** — `?about=1` erased on arrival | `HomeLayout.tsx:99` | **High** |
| **`/resume` polished and unlinked**; live CTA is a Drive link | `app/resume/page.tsx` vs `lib/resume-content.ts:16` | Medium |
| Lock badge is hover-only → invisible on touch | `LockGate.tsx:132` | Medium |
| `/writing` ships "Coming soon.", unlinked, absent from sitemap, but indexable | `app/writing/page.tsx:19` | Low — **KNOWN** (`§3.3`), now orphaned rather than in-nav |
| `app/play/` exists with **no `page.tsx`** → 404 on that URL | `app/play/` | Low |
| `#playground` anchor has no target element | `HomeNav.tsx` / `CaseStudyList.tsx:364-379` | Low |
| Five no-op `CaseStudyHeroImage` calls render an empty region | 5 `*Content.tsx` files | Low |
| TOC label ↔ heading drift ("Role"→"My Role", "Impact"→"Impact & Results", ×6) | multiple | Low |
| **`ChangelogOverlay` ships with no trigger** — full portal + the whole changelog payload, unopenable | `layout.tsx:143` vs `HeaderToolbar.tsx:229-230` | Low |
| **Font-size control implemented, zero UI consumers** | `ThemeToggle.tsx:357-387` | Low, but see §Cognitive load |
| `NavOverlay.tsx` (275 lines), `HomeNav.tsx`, `WorkHistory.tsx` (121), `ExperienceList`, `ChatBar`'s labelled `pill` (`void pill`), `ProjectDetails.tsx`, `.marquee-track` CSS, `.hero-toolbar-host` | various | Low |
| Dead code in `CaseStudyList`: `ViewToggleButton`, `SectionLinkButton`, `FilterIcon`, `GalleryIcon` unused; `filterOpen` can never become `true`; `HIDDEN_SLUGS` empty | `CaseStudyList.tsx:34, 279, 17, 1027` | Low — and `homepage.md` still documents a card/list toggle that no longer ships. **CHANGED** |
| **Console warnings ship to prod on routine paths** — `AudioPlayerContext.tsx:189` fires on every autoplay-blocked `play()`, and `GlobalToolbar.tsx:39` calls `play()` on first music-panel open; `LedMatrix.tsx:754` warns for every visitor without WebGL2 | see cells | Low, but a reviewer who opens DevTools sees them |

*Check `docs/DEAD-CODE-AUDIT.md` and `docs/SALVAGE-REVIEW.md` before deleting — some
unreferenced files are deliberately kept.*

---

## Recommendations — do now

**What / Why it matters to a hiring manager / Effort / Risk.**

### 1. Re-point F&B's Next Project to `ai-workflow`
**What:** `FBOrderingContent.tsx:338` → `href="/work/ai-workflow"` plus matching title and
subtitle.
**Why:** Finishing the only complete case study is currently punished with a locked door.
Highest-traffic path on the site, terminal state is a wall. The identical fix was already
applied to Compendium for the same reason.
**Effort:** S. **Risk:** None.

### 2. Teach chat which studies are locked
**What:** Pass `isLocked()` into `renderCaseStudies()` (`lib/chat/system-prompt.ts:53-64`)
and either drop locked slugs from the `OUTPUT_RULES` allowlist or add a rule: *these are
password-gated — mention them but route the reader to email, don't link or unfurl them.*
**Why:** The AI currently recommends a study, unfurls a rich card advertising $6.94M CARR,
and the click hits a password wall. A dead end the reader was *invited* into is much worse
than one they stumbled on.
**Effort:** S. **Risk:** Low — pure prompt change; verify with `npx tsx scripts/test-chat-parser.ts`.

### 3. Default `ExpandableSection` to open below `md`
**What:** `ExpandableSection.tsx:22` — initialise from a viewport check, or expand
unconditionally on mobile and keep the accordion desktop-only. Minimum viable: force
"Impact" and "Reflection" open.
**Why:** On a phone, `checkin` shows two prose sections then four closed accordions;
compendium / knowledge-base / upsells hide Research, Process, **Impact**, and Reflection.
The outcome evidence — the content that closes a hiring decision — is hidden on the device
recruiters triage on.
**Effort:** S. **Risk:** Low; pages get longer on mobile, which is the right trade.

### 4. Put the metric on the card face, and fix the years
**What:** In `MarqueeTitleRow`, render `study.metric` (it exists for all 8) in place of
`org • year` or as a second mono line. Delete `year` from `MARQUEE_DISPLAY` and read
`study.year` so they can't drift again.
**Why:** `$6.94M CARR` and `$1.51M CARR · +230% YoY` are the strongest claims Marco has and
they never render on the homepage. And a homepage date that contradicts the case study page
(General Task: 2024 vs 2022) costs credibility for free.
**Effort:** S. **Risk:** Low — watch title-row wrapping at 80vw mobile cells.

### 5. Give the marquee a visible scroll affordance
**What:** A position indicator (`2 / 8`), prev/next arrows, or a right-edge fade with a
deeper peek. Cheapest credible version: a mono counter plus two arrow buttons in a row above
the strip, next to a restored "Selected work" heading.
**Why:** Desktop mouse users currently see one case study. A portfolio that appears to
contain one project reads as a portfolio that contains one project.
**Effort:** M. **Risk:** Low — additive chrome, doesn't touch the snap mechanics.

### 6. Make the locked-card click explain itself, and never be silent
**What:** Either (a) drop the `onActivate` override at `CaseStudyList.tsx:834` so locked
cards open `PasswordModal` — which already has copy and three CTAs — or (b) keep the
lightbox and add a caption bar: title, `metric`, one line of context, Email + "Got a code?"
buttons. Either way, guard the no-media case so a click can never do nothing. And make the
lock badge visible at rest on touch.
**Why:** Six of eight cards are locked; this is the most common interaction on the homepage
and it currently returns an unexplained image or nothing at all.
**Effort:** S for (a), M for (b). **Risk:** Low. (a) loses the media teaser, which is a real
loss — the teaser is good, it just needs words attached. Prefer (b) if there's an hour.

### 7. Restore `cursor: pointer` on interactive elements
**What:** In `CustomCursor.buildCursorCss()`, exclude interactive elements from the
`!important` rule (`:not(a):not(button):not([role='button']):not(label):not(summary)`), or
emit a second rule giving them a pointer-variant SVG. Also gate the label bubble on
`prefers-reduced-motion` and debounce the `MutationObserver`.
**Why:** The site's core problem is that readers can't tell what's clickable, and this
deletes the one affordance every visitor already knows.
**Effort:** S. **Risk:** Low. Whether the arrow should ever appear over links is taste; the
`!important` blanket is a defect regardless.

### 8. Give About a real URL
**What:** Stop erasing `?about=1` (`HomeLayout.tsx:99`), or promote About to `/about` with
its own metadata. At minimum, keep the query param so the page is linkable.
**Why:** "Here's my about page" is a link you send a recruiter. There isn't one, it can't be
indexed, and the browser Back button doesn't exit it.
**Effort:** M (S for keeping the param; M for a real route). **Risk:** Low.

### 9. Rewrite the gate copy — say what's behind the door
**What:** Replace "Under construction / currently being polished" with per-study value copy
driven by the existing `metric` and `description` frontmatter — e.g. *"Upsells — $6.94M
CARR, +10% measured conversion lift, sole designer. Shared on request."* Retire "Under
construction" (three places, two meanings) in favour of "Available on request."
**Why:** Nobody emails a stranger for an unlabeled box, and "under construction" invites
"doesn't ship."
**Effort:** S–M. **Risk:** Low.

### 10. Add `QuickStats` to F&B Ordering, and fix the `ai-workflow` band
**What:** Three or four stats above the first specimen — `$50k` committed ARR, `4 months`
MVP→pilot, `100%` design ownership, `3 surfaces`. Separately, wrap `ai-workflow`'s
`QuickStats` in `<Grid><Col md={CONTENT_BAND_MD} lg={CONTENT_BAND}>` like every other block.
**Why:** The flagship is the only study without a scannable metric block while six *locked*
studies have one. And a stat row at ~2× the prose measure breaks the page's one visible grid
promise. **[verify the band issue visually first.]**
**Effort:** S. **Risk:** None.

### 11. Add a global `<MotionConfig reducedMotion="user">`
**What:** Wrap the tree in `app/layout.tsx`. Then fix the two worst offenders individually:
`AnimatedGreeting`'s typewriter (`ChatPanel.tsx:27-144`) and the chat error line's
`role="alert"` + contrast.
**Why:** One line covers most of the ten chrome animations that currently ignore the
setting. A reduced-motion user opening chat waits ~3 seconds for a readable greeting.
**Effort:** S. **Risk:** Low — check that the four F&B specimens' local `MotionConfig`s
still behave.

### 12. Unlock two clean studies
**What:** Remove `checkin` and `general-task` (or `design-system`) from `LOCKED_SLUGS` and
add them to `public/sitemap.xml`.
**Why:** Takes the readable portfolio from 2 to 4 and puts an enterprise-scale story and a
founding-designer 0→1 story in front of the reader. All three have zero placeholders and
passed the 2026-08-01 QA sweep.
**Two caveats to price in:** (a) `design-system`, `compendium`, `upsells`, and
`knowledge-base` use `SectionHeading level={4}`, which currently renders identically to
`level={3}` — `TYPOGRAPHY-BACKLOG.md` calls this latent *precisely because those pages are
locked.* Unlocking makes it visible. (b) `checkin`, `general-task`, and `design-system` are
the three studies that open on the employer's mission statement rather than the problem
(rec #13) — unlock them *after* that rewrite, not before.
**Effort:** S to unlock, M with the prerequisites. **Risk:** Medium — Marco's editorial call.

### 13. Rewrite three openings and kill the emoji bullets
**What:** `checkin`, `general-task`, and `design-system` open with the company's mission
statement. Replace with a problem statement or an outcome. Convert the emoji-bullet
contribution lists (`design-system:86-104`, `general-task` "Goals") into prose or a numbered
decisions list.
**Why:** "Canary is on a mission to…" tells a hiring manager nothing about Marco. Emoji
bullet lists read as a portfolio template, which is the opposite of the senior signal.
**Effort:** M (writing). **Risk:** Low. Prerequisite for #12.

### 14. Surface the role in `StudyMetaRow`, and add reading times
**What:** Move `role` to the first (always-visible) pill or exempt it from the collapse. Add
a "~5 min read" next to the eyebrow.
**Why:** "Lead designer" vs "Product designer" is the first thing checked and it's currently
a transparent 6px sliver on desktop. And a 7.5-minute read with no signal reads as a wall;
labelled, it reads as considered.
**Effort:** S each. **Risk:** Low.

### 15. Label the section, label the chat, label the playground
**What:** Restore a heading above the work strip (the "Just for fun" label below already
sets the pattern). Un-`void` the labelled chat pill (`ChatBar.tsx:365`) or give `ChatFab` a
text label — "Ask about my work". Restore captions on playground cells, at minimum for
touch.
**Why:** Client work is currently the anonymous section and side projects are the labeled
one. The chat is the best differentiator disguised as a support widget. And four unlabeled
videos read as filler.
**Effort:** S each. **Risk:** Low. The FAB→pill change costs bottom-right real estate —
check against the mobile sheet.

### 16. Add a scroll affordance to the panning demos
**What:** The three 1177px staff specimens pan inside a 358px column at 390px with
`scrollbar-hide` and no hint. Add an edge fade or a "drag to explore" cue, or drop the
`MIN_INLINE_SCALE` floor on phones so they fit instead of panning.
**Why:** Three of the flagship study's best assets are, on mobile, cropped rectangles with no
indication anything else exists. Same class of problem as `ObjectFlowDiagram` (**KNOWN**).
**Effort:** M. **Risk:** Low.

### 17. Confirm the theme toggle actually repaints
**What:** Click it once by hand on a normal page load in light mode.
**Why:** If `QA-FINDINGS.md`'s inline-style cascade bug reproduces for real visitors, one of
four global controls is broken.
**Effort:** S to verify; M to fix (`applyColoredTheme()` writing to a scoped rule instead of
inline root styles). **Risk:** Medium if fixed — touches the whole theme system.

### 18. Housekeeping
**What:** Fix contrast on `fg-tertiary` where it carries meaning (testimonial credentials,
chat errors, resume meta) — bump toward 0.5 or reserve tertiary for genuinely decorative
text. Re-tune ember / butter / sky light accents to clear 4.5:1, and correct the
now-inaccurate comment at `ThemeToggle.tsx:9-10`. Restore real focus rings on the six
colour-only sites, starting with About's exit button (`Hero.tsx:414`). Add a keyboard
handler and `aria-valuetext` to `InsetScrubber`. Add focus traps to the two `aria-modal`
surfaces. Decide on `/writing`, `app/play/`, `/resume`, `ChangelogOverlay`, and the
unreachable font-size control. Update `homepage.md`, which documents a card/list toggle that
no longer ships.
**Why:** None of these individually loses a job. Collectively they're the difference between
"careful" and "mostly careful," and the audience is people who notice.
**Effort:** M total. **Risk:** Low (check the salvage docs before deleting).

---

## Future opportunities — larger bets

### A. Replace the horizontal marquee with a vertical index
The carousel is beautiful and it's fighting the content. Eight items with rich metadata
(role, year, metric, one-line outcome) want a **scannable vertical list** — the pattern
Brian Lovin, Rauno, and staff.design converge on — where a reader takes in all eight titles
plus metrics at a glance and chooses. Keep the marquee as a *featured* strip of two or three
and put an indexed list beneath it. This solves scroll affordance, information scent,
locked-card signalling, and the unlabeled-section problem in one move, because a list row has
room for an "Available on request" tag inline.
**Effort:** L. **Risk:** Medium — it's the homepage's centrepiece.

### B. Design the gate as a product surface, not an obstacle
Six locked studies is a real constraint for the next few months. Instead of hiding them,
make the wall the most persuasive page on the site: title, role, metric, a blurred or partial
hero, a 3-sentence summary, and **one fully annotated decision** — then ask for the email.
That converts a bounce into either a read or a contact. It also lets Marco publish sooner:
"one decision, well told" is shippable in an hour per study; a complete case study is not.
**Effort:** M–L. **Risk:** Low, and it de-risks the entire content backlog.

### C. Make chat the front door for skimmers
Chat already has the drafts, a link grammar, card unfurls, rate limiting, and privacy
guardrails. A reader who won't read 2,000 words would happily ask "what's the strongest thing
you've shipped?" Promote it: a labelled entry point near the fold, three visible starter
prompts, answers that unfurl case study cards. Done right this turns the locked-content
problem into an advantage — chat can *summarize* what the wall hides, without leaking it.
And it demonstrates the AI-native positioning by doing it rather than claiming it.
**Effort:** L. **Risk:** Medium — the cost cap and rate limits are already in place; the real
risk is a bad answer in front of a hiring manager, so the system prompt needs hardening
(which #2 starts).

### D. Earn the fold: one line of positioning
The tooltip copy — *"I've led design for several 0→1 products… a guest experience platform, a
hotel CMS, mobile food and beverage ordering, and the knowledge base that powers our
AI-native products"* — is the best sentence on the site and it's behind a hover. Some version
belongs in the visible hierarchy, at a size that competes with the name. This is
`PORTFOLIO-AUDIT.md §2.6`'s recommendation, still unbanked, and it costs one paragraph of
copywriting.
**Effort:** M (design and writing, not code). **Risk:** Low.

### E. Restructure case studies around decisions, and show one rejected direction
Two related content bets from the Feb audit that are still the highest-value upgrade for a
senior read: convert the month-by-month Design Process sections into 3–5 pivotal decisions
(`§3.7`), and add one *rejected* direction per study — "we explored X, rejected it because
Y" (`§3.2`). Both get cheaper once the visual assets exist. Pair with (B): "the decision I
got wrong" is a great thing to put in *front* of the gate rather than behind it.
**Effort:** M–L. **Risk:** Low.

### F. Fix the visual foundation: hero images and the two text-only studies
No case study on the site has a hero image (`CaseStudyHeroImage` is a no-op at all five call
sites), `knowledge-base` and `ai-workflow` have zero visuals across ~2,400 words, and
`upsells` is 17 gray boxes. This is the last surviving piece of the Feb audit's "no visuals"
dealbreaker and it's now concentrated rather than diffuse — which makes it tractable. One
hero per study plus the Upsells exports would close it.
**Effort:** L (asset production). **Risk:** Low.

### G. Spend the motion budget on wayfinding
Add IntersectionObservers to the eight `DitherBackdrop` canvases (perf-backlog #6 — the note
says 6, `homepage.md` says 9, the real count is 8) and reinvest that budget in motion that
carries information: a scroll-position indicator on the marquee, a transition that shows a
locked card *becoming* a gate rather than flashing an image, a reading-progress cue that
means something. Same craft, aimed at the reader's decisions instead of the background.
**Effort:** M–L. **Risk:** Low.

### H. Move testimonials onto the homepage
Four named recommendations — Netflix, a VP of Product, two PMs — are the highest
trust-per-pixel content on the site and they're two clicks deep behind a URL-less surface. One
quote card between the work strip and the footer, with the rest on About, would put
third-party validation in front of every visitor.
**Effort:** S–M. **Risk:** Low. (Listed here rather than "do now" because it's a composition
decision, not a fix.)

---

## What could not be checked

No browser was available. These need a rendered pass — cheapest via
`cd site && npm run sheet -- <route> [--unlock] [--dark]`:

- The marquee's mouse-wheel behaviour, and whether the card peek is a sufficient affordance.
- `QuickStats` band overflow on `/work/ai-workflow`.
- Whether the bio's Canary tooltip is reachable on touch.
- Portrait playground cells at 390px (`h-[560px]`), and the three panning demos at 390px.
- `StudyMetaRow` pill overflow in a narrow *desktop* window (<640px with a mouse).
- Computed contrast per theme — the numbers above are calculated from the token values, not
  sampled from a render.
- **The theme toggle.** One manual click settles `QA-FINDINGS.md`'s open question and should
  happen before anything else.

---

## Provenance note

This audit was read-only; the only file written was this one. However, **eight source files
under `site/` show uncommitted modifications made during the audit window** (~20:45–20:47 on
2026-08-05) that did not come from this review:

`app/globals.css`, `components/CaseStudyList.tsx`, `components/HomeLayout.tsx`,
`components/LockGate.tsx`, `components/PasswordModal.tsx`,
`components/case-study/InlineTOC.tsx`, `components/case-study/ProjectDetails.tsx`,
`lib/gallery-content.ts`.

They read as behaviour-preserving DRY/perf refactors — hoisting repeated style objects into
shared constants (`GATE_LABEL`, `PLACEHOLDER_LABEL`, `GALLERY_CARD_SHADOW`) and converting
the marquee's scroll handler to a rAF-throttled one with a `ResizeObserver`-cached stride.
`npx tsc --noEmit` passes clean. They were left in place, unreviewed and uncommitted.

**None of them invalidate the findings above** — `MARQUEE_DISPLAY`, the `galleryContent`
keys, the lightbox's `{slug && media && …}` guard, and the marquee's missing scroll
affordance are all unchanged. Line numbers cited for `CaseStudyList.tsx` may be off by
~10–30; the symbol names are accurate.

---

*Audit produced 2026-08-05. No source files were modified by this review.*

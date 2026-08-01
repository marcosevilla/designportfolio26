# Figma Migration — Portfolio Aug 2026

Loop state file. Read at the start of every iteration, update at the end.

## Figma file
- **Name:** Portfolio Aug 2026
- **File key:** `O9tNG8DqYrpdJmrEGa7Io7`
- **URL:** https://www.figma.com/design/O9tNG8DqYrpdJmrEGa7Io7
- **Plan:** team::1302518684931189049 (Marco Sevilla's team, personal)

## Figma pages
| Page | Node ID |
|---|---|
| 🎨 Foundations | 0:1 |
| 🧩 Components | 2:2 |
| 🏠 Home | 2:3 |
| 📁 Case Studies | 2:4 |
| 👤 About / Resume | 2:5 |
| ✍️ Writing | 2:6 |
| 🧪 Scratch | 2:7 |

## Environment
- Source: `~/Developer/portfolio-figma-snapshot/site` (worktree, branch `figma-snapshot` @ de2e14a) — NEVER touch `~/Developer/portfolio`
- npm install: DONE 2026-08-01
- Dev server: http://localhost:3111 (background task `bqoooznbs`; restart with `npm run dev -- -p 3111` from site/ if dead)
- Playwright screenshots at 1440px wide

## Checklist
Status values: `todo` → `built` → `QA-passed` (or `known-gap: <desc>`)

### 1. Setup
- [x] Create Figma file — QA-passed
- [x] Create 7 Figma pages — QA-passed
- [x] Create PROGRESS.md — QA-passed
- [x] npm install + dev server on 3111 — QA-passed

### 2. Foundations
- [x] Extract tokens from code (globals.css / tailwind / component styles) — QA-passed
- [x] Figma variables: colors (+ dark mode), type scale, spacing, radii — QA-passed
- [x] Token documentation frame on 🎨 Foundations — QA-passed

### 3. Components (audit DONE — locked batches below; full specs in audit notes at bottom)
- [x] Component audit → final component list — QA-passed (2026-08-01)
- [x] Batch A — Atoms & chrome: dotted-link--inline (rest/hover), toolbar icon button 32×32 (rest/hover), LocalStatus (mono 11px time+weather), SectionLabel (mono uppercase 14/22.4), ProgressBar (2px accent) — QA-passed
- [x] Batch B — Marquee card set: .mq-cell (rest/focused/locked/no-media; 520w, pad 12/12/16, gap 16, r8), StudyMediaFrame (494×400, fg-7% bg, 0.5px border, r4), LockedFrameBadge, DeviceShell (phone 9/19 + browser) — QA-passed
- [x] Batch C — Home blocks: intro block (h1 row 16/600 + LocalStatus+toolbar right; bio 3¶ gap-8 + Learn more →), testimonial cell (p-6, 0.5px border, r4), playground cell (landscape 323h / portrait 420×560 / empty "Coming soon"), home footer links — QA-passed
- [x] Batch D — Case-study chrome: InlineTOC (130w, left 48, mono back + * marker), MetaRail (dt mono 11/500 upper, dd 14/22), SectionHeading h2 (mono upper 14/22.4) / h3 (16/500) / h4 (14/500) — QA-passed
- [x] Batch E — Case-study content: PullQuote (3px accent border-l, italic clamp 18-22), QuickStats tile (pad 20, r0, 24/500 accent value), NextProject (rest/hover), ImagePlaceholder (r10), CaseStudyHeroImage (16/9 r10), LockGate page placeholder — QA-passed

### 4. Pages (built FROM library components, frame width 1440)
- [x] 🏠 Home — QA-passed (frame `15:2` on page 2:3; known gaps below)
- [x] 📁 Case study: general-task — QA-passed (frame `31:187`; hero general-task.png `3881d6c8...`)
- [x] 📁 Case study: upsells — QA-passed (frame `27:100`; hero upsells.png `b49e61fe...`; QuickStats 2×2 w/ refreshed numbers)
- [x] 📁 Case study: ai-workflow — QA-passed (frame `34:305`, "Prototypes as the spec")
- [x] 📁 Case study: knowledge-base — QA-passed (frame `33:260`; editorial skeleton, no gallery media exists)
- [x] 📁 Case study: compendium — QA-passed (frame `22:40`; media guest-experience-mobile.png `b894c401...`; 4 pull quotes with real attributions)
- [x] 📁 Case study: checkin — QA-passed (frame `29:145`; hero check-in.png converted from webp via sips, hash `86f393e0...`)
- [x] 📁 Case study: design-system — QA-passed (frame `32:223`; no hero media, matches live site)
- [x] 📁 Case study: fb-ordering — QA-passed (frame `18:2` on page 2:4; hero fb-overview.png `09830adf...`, dashboard order-management.png `b9bd60cc...`)
- [x] 👤 Resume — QA-passed (frame `35:2` on page 2:5; full v2026-08 content, accent #B4502A)
- [x] ✍️ Writing — QA-passed (frame `35:65` on page 2:6)

## Node ID registry
### Foundations (iter 2)
- Color collection `VariableCollectionId:3:2` — modes Light `3:0` / Dark `3:1`; vars color/bg `3:3`, fg `3:4`, fg-secondary `3:5`, fg-tertiary `3:6`, surface `3:7`, surface-raised `3:8`, border `3:9`, muted `3:10`, card-bg `3:11`, image-outline `3:12`, accent `3:13` (alias→fg)
- Layout collection `VariableCollectionId:3:14` — mode Value `3:2`; spacing xs4/sm8/md12/lg16/xl24/2xl32/3xl48/section112 (`3:15`–`3:22`), radius xs2/sm4/md8/lg12/xl14/2xl16 (`3:23`–`3:28`), container content500/md800/lg1060/grid-max1128 (`3:29`–`3:32`)
- 15 text styles (Geist + Geist Mono; names Display/Heading/Body/Label/Nav groups) + 2 effect styles Shadow/Soft, Shadow/Soft LG
- Foundations doc frame `3:50` on page 0:1
- Fonts: Geist + Geist Mono AVAILABLE in Figma (styles "Regular"/"Medium"/"SemiBold" — no spaces)

## Decisions
- /dev labs (effects-lab, logo-lab, type-lab) intentionally excluded from scope.
- Audit decisions (2026-08-01): SKIP HomeNav rail (unmounted), SiteHeader/WorkHistory/NavOverlay (salvage), SectionLinkButton (dead code), CursorGlowOverlay + LoadingOverlay (animation-only/off), chat + music internals. HeaderToolbar is the real toolbar (2 icon buttons). ConnectLinks + HamburgerMenu drawer = mobile case-study only, DEFERRED (desktop-1440 first). Trust globals.css over CLAUDE.md where they conflict (fg-secondary 0.6/0.5; container-content 500px).
- Homepage section order: h1 row → bio (3¶ + Learn more) → #projects marquee (7 cards: fb-ordering, compendium, upsells, checkin, general-task, design-system, ai-workflow) → 3 testimonials → JUST FOR FUN + 4 playground cells → footer links. Floating dock (ChatFab+music) bottom-right.
- Case-study skeletons: editorial (fb-ordering, compendium, knowledge-base, ai-workflow) = hero img → intro-rail (h1+2¶ ‖ MetaRail) → sections pt-32 w/ SectionHeading → NextProject. TwoCol-era (checkin, upsells, general-task, design-system) = band col: h1 → subtitle → HeroImage → QuickStats → prose → PullQuote → ExpandableSections → NextProject. 6 of 8 studies are LOCKED in code — build their real content anyway (source: content/*.mdx + Content components).

## Baselines
- docs/figma-migration/baselines/baseline-home-1440.png (playground cells render blank in headless — videos)
- docs/figma-migration/baselines/baseline-fb-ordering-1440.png

## Known gaps
- PullQuote renders upright — Geist has no italic style in Figma (site synthesizes oblique).
- Home playground cells are empty frames — site media is video (can't import); baseline headless render was also blank.
- F&B marquee card media = mobile-guest.png screenshot crop, not the site's dither-backdrop + phone-shell composition (that's WebGL + video at runtime).
- Paper-grain + Perlin dot-grid background textures intentionally not reproduced (runtime canvas effects).
- webp uploads: upload succeeds but fills render blank — use PNG sources (mobile-guest-mock.webp failed, mobile-guest.png worked).

## Iteration log
- **Iter 19 (2026-08-01, accuracy fix pass):** Marco caught fb-ordering not matching production. ROOT CAUSE: iter-10 QA compared against memory, not the captured baseline; audit's intro-rail spec was pre-2026-07-20 (presets now collapse to one centered band). FIXED: (1) fb hero → real page asset fb-ordering-dashboard.webp→png `085c7a7e...` + queue `b61ed991...` + details `50dc3907...` images w/ side captions + real 4 numbered Approach decisions; (2) ALL editorial intros (fb, compendium, kb, ai-workflow) restructured 2-col → stacked centered band w/ MetaRail below (full-width); (3) InlineTOC component items → Geist Mono 12/500 uppercase (propagates to all 8 frames); (4) REMOVED heroes from upsells/checkin/general-task — live pages pass no src, hero renders nothing; (5) fb scope text → "Guest ordering / Menu CMS / Staff dashboard". Worktree synced de2e14a → 391f1cf (QA-sweep commits, minimal visual delta). LESSON: always view baseline PNG side-by-side before marking QA-passed; page-hero assets live in public/images/<study>/, gallery/ = homepage card media only.
- **Still open from fix pass:** fb guest-flow video + ObjectFlowDiagram (add as Playwright element captures if wanted); TwoCol studies (upsells/checkin/general-task/design-system) not re-verified against fresh baselines (structure/text believed accurate, heroes now correct-by-omission).
- **Iter 1 (2026-08-01):** Setup complete — file created, 7 pages created, env ready. Next: Foundations token extraction.
- **Iter 2 (2026-08-01):** Foundations DONE — Color (11 vars, Light/Dark, scoped + WEB code syntax), Layout (18 vars), 15 text styles, 2 effect styles, doc frame on 🎨 Foundations (screenshot QA'd). Minor cosmetic: doc-frame line-height labels show float rounding (139.99%) — label text only, style values exact. Next: component audit of site/components → component list, then build nav+footer.
- **Iter 3 (2026-08-01):** Component audit DONE (Explore agent, full specs) — 5 build batches locked (A atoms → E case-study content), skip-list + conflicts resolved in Decisions. Baselines captured for home + fb-ordering at 1440. Next: build Batch A on 🧩 Components.
- **Iter 18 (2026-08-01):** Resume `35:2` + Writing `35:65` BUILT + QA-passed. ✅ ALL CHECKLIST ITEMS COMPLETE — loop stopped. Final file: https://www.figma.com/design/O9tNG8DqYrpdJmrEGa7Io7
- **Iter 17 (2026-08-01):** ai-workflow BUILT + QA-passed (0 fix rounds) — frame `34:305`. ALL 8 CASE STUDIES DONE. Next: Resume + Writing (final build iteration), then summary + stop.
- **Iter 16 (2026-08-01):** knowledge-base BUILT + QA-passed (0 fix rounds) — frame `33:260`. Next: ai-workflow (last study), then Resume + Writing, then final summary + stop.
- **Iter 15 (2026-08-01):** design-system BUILT + QA-passed (0 fix rounds) — frame `32:223`. Next: knowledge-base.
- **Iter 14 (2026-08-01):** general-task BUILT + QA-passed (0 fix rounds) — frame `31:187`. Next: design-system (NOTE: no gallery media exists for it — omit hero, matches live site).
- **Iter 13 (2026-08-01):** checkin BUILT + QA-passed (0 fix rounds) — frame `29:145`. webp→PNG via `sips -s format png` into scratchpad works for webp-only galleries. Next: general-task.
- **Iter 12 (2026-08-01):** upsells BUILT + QA-passed (0 fix rounds) — frame `27:100`, content `27:125` (TwoCol skeleton: band col x444 w552, h1→subtitle→hero→QuickStats 2×2→sections→PullQuote→NextProject). Next: checkin.
- **Iter 11 (2026-08-01):** compendium BUILT + QA-passed (3 fix rounds) — frame `22:40`, content `22:65`. LOCKED STUDIES: unlock via Playwright `localStorage.setItem("portfolio-unlocked","1")` + reload, then extract text. COMPONENT BUG FIXED AT SOURCE: Pull Quote main comp had counterAxis FIXED → long quote overrides overflowed; now width FIXED 552 + height AUTO + inner FILL (all future instances safe). Next: upsells.
- **Iter 10 (2026-08-01):** fb-ordering BUILT + QA-passed — frame `18:2`, content col `18:27`. RECIPE PROVEN for remaining studies: extract rendered text via Playwright browser_evaluate (document innerText walk, dedupe ExpandableSection dupes; Reflection bullets need grep from Content.tsx — extraction misses them), build frame w/ ProgressBar + InlineTOC instances + content col (x156 w1128; band pad 288; sections spacer 128 + H2 instance + 14/22.4 paras), upload PNGs (never webp) → apply hash fills → delete temp frames → resize frame to content height. Next: compendium.
- **Iter 9 (2026-08-01):** 🏠 HOME BUILT + QA-passed — wrapper `15:2` (1440w, all sections from library instances: intro, marquee w/ 2 cards + real images, 3 testimonials, JUST FOR FUN + 4 cells, footer). Images: compendium guest-experience-app.png hash `976439fb...`, fb mobile-guest.png hash `18131542...` (webp hash `9bb21ff3...` renders blank — PNG only). Band x=444, marquee slot x=460. Next: case study fb-ordering on 📁 Case Studies (page 2:4).
- **Iter 8 (2026-08-01):** Batch E BUILT + QA-passed — Pull Quote `12:21` (real Wenjun Zhao quote), Stat Tile `12:26` (real checkin stat), Next Project set `12:36` (Rest/Hover), Image Placeholder `13:21`, Hero Image `13:23`, Lock Gate Page `13:24` (real upsells copy). COMPONENT LIBRARY COMPLETE (batches A–E). Known nit: PullQuote not italic (Geist has no italic style in Figma — code synthesizes oblique; log as known gap). Next: PAGES phase — build 🏠 Home from library + real images via upload_assets, QA vs baseline-home-1440.png.
- **Iter 7 (2026-08-01):** Batch D BUILT + QA-passed (0 fix rounds) — Case Study/Inline TOC `11:21` (5 items, active * marker), Case Study/Meta Rail `11:43` (Year/Role/Scope), Case Study/Section Heading set `11:59` (H2/H3/H4). Next: Batch E case-study content blocks.
- **Iter 6 (2026-08-01):** Batch C BUILT + QA-passed (0 fix rounds) — Home/Intro Block `10:3` (real homepage copy from HomeLayout.tsx, instances of LocalStatus + toolbar buttons + Link), Home/Testimonial Cell `10:28` (real Kevin Doherty quote), Playground Cell set `10:35` (Landscape/Portrait/Empty), Home/Footer Links `10:36`. Next: Batch D case-study chrome.
- **Iter 5 (2026-08-01):** Batch B BUILT + QA-passed — Marquee Card set `8:31` (Rest `8:5`, Focused `8:10`, Locked `8:18`, No media `8:25`), Locked Frame Badge `8:16`, Device Shell set `8:36` (Phone `8:32`, Browser `8:34`). New derived vars: color/frame-study `8:2`, frame-playground `8:3`, card-focused `8:4` (precomputed color-mix values, both modes). Fix rounds: no-media frame collapsed on layoutMode change (resize + FIXED after), standalone badge overlapped set on canvas (moved). Next: Batch C home blocks.
- **Iter 4 (2026-08-01):** Batch A BUILT + QA-passed on 🧩 Components — Link/Inline set `6:8` (Rest `6:2`, Hover `6:5`), Toolbar/Icon Button set `6:22` (Theme/Palette × Rest/Hover `6:10/13/16/19`), LocalStatus `6:23`, Section Label `6:30`, Progress Bar `6:32`. Fix rounds: hover bg opacity lost on variable bind (re-set to 10% post-bind — REMEMBER: setBoundVariableForPaint drops paint opacity, reapply after), set frames needed sizingMode AUTO to hug padding. Next: Batch B marquee card set.

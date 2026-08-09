---
description: Homepage nav, work grid/marquee, scroll behavior, load intro, and background visual effects
paths:
  - "site/components/HomeLayout.tsx"
  - "site/components/HomeNav.tsx"
  - "site/components/CaseStudyList.tsx"
  - "site/components/LoadingOverlay.tsx"
  - "site/components/BackgroundTexture.tsx"
  - "site/components/CursorGlowOverlay.tsx"
  - "site/components/DitherBackdrop.tsx"
  - "site/components/FnbDitherFrame.tsx"
  - "site/components/Hero.tsx"
  - "site/components/Testimonials.tsx"
  - "site/lib/playground-cards.ts"
  - "site/app/dev/effects-lab/**/*.tsx"
---

# Homepage

## Homepage Nav (HomeNav.tsx)
- **Scope:** Rendered inside HomeLayout.tsx, only visible on homepage at lg+
- **Items:** `HOME_NAV_ITEMS` = Home (`#home`), Work (`#projects`), Playground (`#playground`) — all in-page anchors, no global routes
- **Font:** 16px weight 500
- **Active state:** Geist `*` (18px, weight 500, translateY(15%) for optical centering) + text springs 18px right. Active section tracked via IntersectionObserver with a scroll-lock window after click navigation (`SCROLL_LOCK_MS = 900`).
- **Nav star:** spring stiffness 350, damping 28, y = activeIndex × ROW_HEIGHT
- **Hover:** Accent color + 8px right slide (spring 400/25)
- **Mobile (MobileNav.tsx):** Case-study-only top bar — single ← Back link driven by `SidebarContext.backHref`. Not used on homepage.
- **SiteHeader is unmounted site-wide** (2026-07-20) — component kept for salvage. The h1-row-controls era (2026-07-20 → 2026-08-05: LocalStatus + HeaderToolbar beside the name on home and About) is OVER — those controls live in the **GlobalToolbar** now (in-flow row above the name since later on 2026-08-05, no longer fixed) (see `.claude/rules/toolbar-chrome.md`), LocalStatus is unmounted entirely (time/weather dropped), and both h1 rows are name-only. This also RESOLVED the ≤390px "Marco Sevilla" two-line wrap (the controls were what squeezed the h1) — verified single-line at 390 on 2026-08-05.

## Homepage Scroll
- **Single continuous scroll** — SectionSnap deleted, replaced by normal document flow
- **Active section tracking:** IntersectionObserver in `HomeNav.useActiveSection()` watches `#home`, `#projects`, `#playground`. Click navigation locks the active section for `SCROLL_LOCK_MS` (900ms) so smooth-scroll doesn't fight the chosen target.
- **Mobile sticky heading:** `sticky top-14 z-40` with frosted glass bg, releases when parent section scrolls out
- **Spacing:** `mt-28` (112px) between sections
- **Scroll restoration across `key`-triggered page unmounts belongs in `useLayoutEffect`**, never `useEffect + requestAnimationFrame`. The rAF path runs after the first animation paint and visibly shifts layout mid-animation.

## Work marquee (FREE-scroll strip; snap removed 2026-08-05)
Redesigned per Marco's Paper mockup. Lives in `CaseStudyList.tsx` + `.work-marquee*` rules in globals.css.
- **⚠️ DO NOT REINTRODUCE `scroll-snap`.** The 2026-07-27 snap carousel (`x mandatory` + `snap-stop: always`) made trackpad gestures travel **net zero**: a continuous swipe arrives as many small deltas and mandatory snap re-targeted the nearest card on every fragment, so the strip wobbled and sprang back to 0. Measured before removal — a 600px gesture traced `110→137→127→184→163→130→183→48→0`; a single 120px wheel notch traced `0→118→80→23→0`. After removal both are monotonic with zero backsteps. Full reasoning is in the comment block on `.work-marquee` in globals.css and in `docs/audits/2026-08-05-carousel-plan.md`.
- **Free-scroll slot:** native momentum scrolling, `overscroll-behavior-x: contain` (**x-axis only** — `overflow-x: auto` computes `overflow-y` to `auto`, so an unqualified `contain` would also trap vertical page-scroll chaining on touch). Slot = content-band start via `--mq-inset`; `scroll-padding-inline` is KEPT because with snap gone it still governs focus/`scrollIntoView`. Scroll listener in `StudyMarquee` now only calls `syncEdges` (arrow enable/disable), coalesced to one read per frame; the uniform stride (cell + 24 gap) is still measured behind a `ResizeObserver` for the arrow step. (Before the 2026-08-06 hover redesign it also computed a `focusedIndex` to drive the focused card — that's gone with the focused state.)
- **Scroll affordance = prev/next arrow buttons** (2026-08-06, Marco's call; closes the gap the snap removal left). Two 32px `.bio-toolbar-btn`s above the strip, using `ArrowRightIcon` mirrored via `scaleX(-1)` for the left variant. **One card per press** — deliberate stepping ON DEMAND, which is not what snap did wrong (snap forced stepping onto every free gesture). Free scrolling is unchanged. Disabled at each end from REAL scroll position, never from a card index — the last card can't fully reach the slot, so an index-based check disables the button while the strip can still travel. Honours reduced-motion (`behavior: auto` vs `smooth`); `aria-controls` ties them to `#work-marquee-scroller`.
  - ⚠️ **Alignment, learned twice.** The row rides `Grid`/`Col` on `CONTENT_BAND` and must **NOT** be wrapped in `max-w-(--grid-max) px-4 sm:px-8`. GlobalToolbar needs that wrapper only because it mounts in `app/layout.tsx` outside any canvas; here the PARENT already IS the canvas — which is precisely why the strip breaks out of it with `width: 100vw`. On the raw canvas the arrows sat at x=1376 (~318px adrift); with the wrapper re-added they sit 16px inboard at every width. Correct is arrow right edge == GlobalToolbar right edge: measured **1066 / 836 / 382** at 1440 / 1024 / 390.
  - `.bio-toolbar-btn:disabled` was added to globals.css for this (the class had no disabled state). It must stay AFTER the `:hover` rule — equal specificity, so source order decides, and a disabled button otherwise still lights up on hover.
- **Hover-overlay card (2026-08-06 redesign — replaced the scroll-focused expand-below model).** The card IS the mock frame; there is no title row above and no description below any more. At REST it's just the mock (`.mq-frame` → `DitherBackdrop`/`FnbDitherFrame` + the `.mq-media` mock layer). On HOVER the title / mono "COMPANY • YEAR" / description rise inside the frame as the `.mq-info` overlay while `.mq-media` recedes (`scale(0.9)`, `transform-origin: 50% 28%`) — **the frame never changes size** (no more 550px track reserve, no page bounce). All CSS lives in the `.mq-cell` / `.mq-media` / `.mq-info` block in globals.css; `--mq-hover-dur` (360ms) + `--mq-ease` drive it.
  - **Only `.mq-media` recedes, never the dither** — the backdrop is a sibling rendered BEFORE `.mq-media`, so it stays full-bleed and the frame bg is never revealed at the edges. F&B's phone is wrapped in `.mq-media` inside `FnbDitherFrame` so it recedes with the same rule; the wrapper carries the transform because the phone already owns a `translateX(-50%)` that the scale would otherwise clobber.
  - **`.mq-info` is a NEAR-SOLID panel** (`color-mix(--color-bg 94%)`), not a translucent scrim, with a fixed-height `::before` fade riser blending its top edge into the mock. A soft scrim failed on mobile: info is persistent there and the description wraps to ~4 lines, pushing the title high where the mock bled through. Legibility over any mock at any panel height beats the airier scrim.
  - **Touch (`hover: none`):** the info can't be hover-revealed, so it's shown persistently and the mock stays full-size. Desktop reveal is gated on `@media (hover: hover)`.
  - `MARQUEE_DISPLAY` map = marquee-only display overrides (titles/org/year/descriptions; MDX untouched). Media fixed 520×400 at ≥768 (`.mq-frame` height pin, cell has no padding now), aspect 13/10 below.
- Auto-scroll was RETIRED 2026-07-20 (the 70s linear infinite version is in git).

## Card/List View Toggle — DELETED (2026-08-09)
The card/list toggle never shipped (no `viewMode` state, no `work-view-mode` key, no
`CaseStudyListRow` anywhere — verified 2026-08-05). The leftovers (`ViewToggleButton`
definition + unused `FilterIcon`/`GalleryIcon` imports in `CaseStudyList.tsx`) were deleted
2026-08-09 per this section's own "mount it or delete" instruction. The homepage renders the
marquee only. The old spec is in git history if the idea ever returns.

## Bento Cards (CaseStudyCard) — HISTORICAL
⚠️ Superseded by the marquee/frame system (`FRAME_BG` / `STUDY_FRAME_BG` color-mix). Kept for reference:
- **Hover scale:** `1.01x`, 350ms ease-out in / 400ms ease out (CSS, not Framer Motion)
- **Border glow:** Mouse-tracking radial gradient, 200px radius, 70% falloff, `var(--color-accent)`, CSS mask-composite
- **Inner glow:** 5% opacity radial accent gradient at cursor position
- **No parallax** — simple scroll, no framer-motion transforms
- **Edges:** Sharp (`rounded-none`), 20px padding (`p-5`)
- Current fills: `STUDY_FRAME_BG` = fg 7% mix (study cards); `FRAME_BG` = fg 4% mix (playground/empty frames).

## Load Intro (LoadingOverlay)
- **Sequence (OFF by default):** `*` cursor-blinks ×3 → types "Welcome" (95ms/char) → holds → backspaces → star morphs via layoutId `hero-star` into the wordmark star → bg fade. Once per session (`portfolio-loaded`).
- **Kill switch:** `SKIP_INTRO = true` at `LoadingOverlay.tsx:12` — flip to `false` to restore. Dev preview without flipping: `?loader=1`.
- **CRITICAL:** the overlay's fade/unmount is plain CSS. The old AnimatePresence/animate-opacity exit tween silently stalled (overlay stuck at opacity 1 over the page for first-time visitors, rAF healthy, React state correct). **Do not reintroduce framer-motion for the overlay lifecycle.**
- The older 5-phase streaming hero + CyclingGreeting typing header are deleted — recovery commits in `docs/SALVAGE-REVIEW.md`. `CyclingGreeting.tsx` still exists but is PARKED (unmounted).

## Visual Effects
- **Background dot grid — ⚠️ DISABLED (2026-08-03).** `components/BackgroundTexture.tsx` drew ~16,300 dots per frame at `gridSpacing: 9` (~146k canvas calls/frame at 1440×900), pegging a full CPU core on every visitor's machine, prod included. Disabled behind a `DISABLED = true` kill switch at the top of the file (the `SKIP_INTRO` idiom); the component returns `null`, so `canvasRef` stays null and the rAF effect bails before scheduling. `PARAMS` and the `/dev/effects-lab` copy are untouched — flip the const to restore.
  - Measured after: real Chrome renderer 88%→9%, headless harness 100%→4% of a core, **production 3%**.
  - ⚠️ **Measurement trap:** removing the canvas from the DOM does NOT stop it — `draw()` holds `canvasRef`, so it keeps rendering into a *detached* bitmap. Isolate these loops via `emulateMedia({ reducedMotion: "reduce" })` or by cancelling the rAF, not DOM surgery. An A/B done by DOM removal "proves" the wrong thing.
  - ⚠️ **Second measurement trap:** on a saturated main thread, other rAF loops absorb whatever slack you free. Measure **absolute CPU-time deltas** (CDP `Performance.getMetrics`), not busy-percentage — the percentage barely moves even when the fix works.
  - Params if restored: diamond dots, spacing 9, slow wave (speed 0.004), subtle cursor halo (radius 90, blend 0.35). DPR cap 1.5. Clear must be device-pixel via `setTransform` reset — in CSS units under the DPR transform it under-clears at browser zoom <100% and dots accumulate into bright right/bottom bands.
- **STILL OPEN:** the 9 always-on `DitherBackdrop` WebGL canvases keep the GPU process ~53% — no IntersectionObserver, they animate even when their marquee card is scrolled off-screen. That's perf-backlog **#6**, which says *6* canvases; the real count is **9**.
- **Paper grain**: `--grain-image` SVG tile in globals.css (`body::before`, multiply) — freq 0.8, strength 0.18.
- **Cards**: Cursor-tracking rim glow on work-grid media frames — `components/CursorGlowOverlay.tsx`, dropped as last child inside `StudyMediaFrame` in CaseStudyList.tsx. Listens on its parentElement, desktop-only. Radius 170, rim 0.55, inner 0.04, falloff 55%, hover scale 1.005. Playground cells intentionally have NO glow.
- **DitherBackdrop**: shared shader identity (wave/4x4/size 2), DITHER_TINT accent-mix + probe-resolver color logic, reduced-motion, slug-seeded variation (FNV-1a → mulberry32 → speed 0.08–0.25, frame phase, offsetX/Y ±0.6, scale 1.3–1.9; draw order is part of the contract). Per-card art direction = pass `overrides`.
- **Canvas loop integer guard:** a `for` loop started at a non-integer bound (e.g. `for (let y = cy - scaledHeight; ...)`) propagates floats through every iteration and silently breaks downstream lookup-table indexing — `BAYER_4[1.5]` is `undefined`, then `undefined[0]` throws *"Cannot read properties of undefined (reading '0')"*. Floor the loop start explicitly (`Math.floor(cy - scaledHeight)`) **and** have the consumer (dither lookup) floor its inputs defensively. Guard both boundaries in any canvas pixel-rendering code.
- **Tuning**: `/dev/effects-lab` — prop-driven copies + grain overrides with a slider panel; its `DEFAULT_*` consts mirror the applied values (keep in sync when retuning).
- **Sections**: Scroll-triggered fade animations via FadeIn component. **BOTH** `components/FadeIn.tsx` AND `components/case-study/FadeIn.tsx` exist — easy to miss one. Both pre-trigger via viewport margin `"0px 0px 480px 0px"`.
- **Progress**: Reading progress bar at top of case studies.

## Link styling
`.dotted-link--inline` (+ `.photo-stack-trigger`): rest = subtle dotted underline (fg-tertiary 1px layer), hover = 120ms background-color fade to the accent block. The earlier background-size block-swipe is gone. `p { color: var(--color-fg-secondary) }` is an element-rule in globals.css — utilities/inline styles still win; titles keep explicit `--color-fg`.

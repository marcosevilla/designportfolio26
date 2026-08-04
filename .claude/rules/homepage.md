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
- **SiteHeader is unmounted site-wide** (2026-07-20) — component kept for salvage. Time/weather (LocalStatus) + theme toggle + palette (HeaderToolbar) moved into HomeLayout's h1 row. **KNOWN GAP:** About mode (`aboutMeOpen`) renders Hero instead of the h1 row, so it has no theme/status controls.

## Homepage Scroll
- **Single continuous scroll** — SectionSnap deleted, replaced by normal document flow
- **Active section tracking:** IntersectionObserver in `HomeNav.useActiveSection()` watches `#home`, `#projects`, `#playground`. Click navigation locks the active section for `SCROLL_LOCK_MS` (900ms) so smooth-scroll doesn't fight the chosen target.
- **Mobile sticky heading:** `sticky top-14 z-40` with frosted glass bg, releases when parent section scrolls out
- **Spacing:** `mt-28` (112px) between sections

## Work marquee (snap carousel, 2026-07-27)
Redesigned per Marco's Paper mockup. Lives in `CaseStudyList.tsx` + `.work-marquee*` rules in globals.css.
- **Snap-scroll slot:** CSS scroll-snap carousel (`mandatory` + `snap-stop: always`); slot = content-band start via `--mq-inset`, shared by track `padding-inline` AND `scroll-padding-inline`. Scroll listener in `StudyMarquee` computes `focusedIndex` (uniform stride = cell + 24 gap).
- **Focused state:** slotted card fades in panel chrome (5% fg-mix fill, `--color-border` hairline, 8px radius) + expands description (`.mq-desc` grid-rows 0fr→1fr, 450ms `--mq-ease`). Geometry is IDENTICAL in both states (padding 12/12/16, gap 16) — only bg/border + vertical desc growth transform; media fixed 494×400 at ≥768 (`.mq-frame` height pin), aspect 13/10 below.
- **Card layout:** title row (title left + mono "COMPANY • YEAR" right) ABOVE media, description below, equal 16px row rhythm — the desc's gap lives INSIDE the collapsing row as `paddingTop` (flex gap would leave a dead gap at rest). `MARQUEE_DISPLAY` map = marquee-only display overrides (titles/org/year/descriptions; MDX untouched).
- Track `min-height: 550px` at ≥768 stops below-content bounce mid-transition.
- Auto-scroll was RETIRED 2026-07-20 (the 70s linear infinite version is in git).

## Card/List View Toggle (CaseStudyList)
- **Two views:** Card (default) and List, toggled via icon buttons on "Work" header row
- **Toggle buttons:** ViewToggleButton with instant hover color (accent on hover). Active = accent, inactive = fg-secondary.
- **Transition:** AnimatePresence mode="wait", blur 4px + opacity fade, 200ms easeInOut
- **Persistence:** localStorage key `work-view-mode`, SSR-safe (hydrated flag)
- **FadeIn:** Only on initial page load; after first toggle, `hasToggled` ref skips FadeIn
- **List view rows:** CaseStudyListRow — full-width link, flex items-baseline: year (48px, mono 11px) | title (heading 16px, weight 500, spring nudge 8px on hover) | company · role (mono 11px, hidden <sm) | metric (mono 11px, hidden <md)
- **Dividers:** 1px solid --color-border between rows + top border on container

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
  - ⚠️ **Measurement trap:** removing the canvas from the DOM does NOT stop it — `draw()` holds `canvasRef`, so it keeps rendering into a *detached* bitmap. Isolate these loops via `emulateMedia({ reducedMotion: "reduce" })`, not DOM surgery.
  - Params if restored: diamond dots, spacing 9, slow wave (speed 0.004), subtle cursor halo (radius 90, blend 0.35). DPR cap 1.5. Clear must be device-pixel via `setTransform` reset — in CSS units under the DPR transform it under-clears at browser zoom <100% and dots accumulate into bright right/bottom bands.
- **STILL OPEN:** the 9 always-on `DitherBackdrop` WebGL canvases keep the GPU process ~53% — no IntersectionObserver, they animate even when their marquee card is scrolled off-screen. That's perf-backlog **#6**, which says *6* canvases; the real count is **9**.
- **Paper grain**: `--grain-image` SVG tile in globals.css (`body::before`, multiply) — freq 0.8, strength 0.18.
- **Cards**: Cursor-tracking rim glow on work-grid media frames — `components/CursorGlowOverlay.tsx`, dropped as last child inside `StudyMediaFrame` in CaseStudyList.tsx. Listens on its parentElement, desktop-only. Radius 170, rim 0.55, inner 0.04, falloff 55%, hover scale 1.005. Playground cells intentionally have NO glow.
- **DitherBackdrop**: shared shader identity (wave/4x4/size 2), DITHER_TINT accent-mix + probe-resolver color logic, reduced-motion, slug-seeded variation (FNV-1a → mulberry32 → speed 0.08–0.25, frame phase, offsetX/Y ±0.6, scale 1.3–1.9; draw order is part of the contract). Per-card art direction = pass `overrides`.
- **Tuning**: `/dev/effects-lab` — prop-driven copies + grain overrides with a slider panel; its `DEFAULT_*` consts mirror the applied values (keep in sync when retuning).
- **Sections**: Scroll-triggered fade animations via FadeIn component. **BOTH** `components/FadeIn.tsx` AND `components/case-study/FadeIn.tsx` exist — easy to miss one. Both pre-trigger via viewport margin `"0px 0px 480px 0px"`.
- **Progress**: Reading progress bar at top of case studies.

## Link styling
`.dotted-link--inline` (+ `.photo-stack-trigger`): rest = subtle dotted underline (fg-tertiary 1px layer), hover = 120ms background-color fade to the accent block. The earlier background-size block-swipe is gone. `p { color: var(--color-fg-secondary) }` is an element-rule in globals.css — utilities/inline styles still win; titles keep explicit `--color-fg`.

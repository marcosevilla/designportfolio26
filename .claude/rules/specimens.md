---
description: DemoStage auto-demo wrapper, product specimens, device shells, and Canary polished tokens
paths:
  - "site/components/DemoStage.tsx"
  - "site/components/DeviceShell.tsx"
  - "site/components/fb-showcase/**"
  - "site/components/AutoplayVideo.tsx"
---

# Interactive specimens

Case-study specimens are self-contained React recreations of the real product, rendered inside a device or panel shell. They replace video/screenshot blocks.

## DemoStage (`components/DemoStage.tsx`, shipped 2026-08-04)
Reusable wrapper for any prototype specimen: auto-playing ghost-cursor demo (frosted-glass tap circle) driven by a `script` of steps against `data-demo="…"` attributes.

- **Dispatches REAL clicks** so the prototype's own state stays the single source of truth; loops via key-remount.
- Hover anywhere on the **stage** pauses + shows an "Interact with flow" pill → click hands over control (un-hover resumes). Reset button always restarts the auto demo. Pause/play button sits left of reset (auto mode only, hides the cursor while paused, cleared by reset).
- **Fullscreen** = body-portal copy scaled to viewport (cap 2×) with reset + X + Esc/scrim close. Open/close restarts the run (state can't cross the portal — accepted).
- `prefers-reduced-motion` ⇒ no auto-play, starts interactive.
- **Inline fit-scale floored at `MIN_INLINE_SCALE = 0.7`** — never smaller than desktop size, pans horizontally below that. The well is **block + `margin-inline: auto`**, NOT flex centering: flex `items-center` pushes overflow off BOTH edges and strands the left half unreachable.
- Cursor motion: WAAPI arc (perpendicular bow, random side) with split accelerate/settle easing + ±2px landing scatter. Travel 450–1100ms. Cursor fill 16% white, blur 1.5px.

### Hard-won gotchas — do not regress
1. Dispatched `el.click()` natively focuses controls (labels forward to their sr-only radios), which trips the keyboard-takeover focus handler → the script flags `scriptFocusRef` around click/focus.
2. All script focus uses `preventScroll` + scrollX/Y pinned around taps.
3. The stage sets `overflow-anchor: none` or Chrome scroll-anchoring jumps the page ±150–250px at drawer/loop remounts.
4. A CSS transition driven by a mount-time state flip silently never ran (it raced the `fsScale` layout effect) — fullscreen enter/exit are WAAPI, and the scale fit is in `useLayoutEffect`.
5. The portal stays mounted through a `closing` beat (`onClose` starts the exit, `onClosed` unmounts). The inline copy does NOT go `visibility: hidden`, and resets on UNfreeze instead of freeze, so the page the scrim blurs out still looks whole.
6. Element screenshots at dpr 0.9 (browser zoom 90%) clip fixed/tall elements — capture artifact, not a bug.
7. **DemoStage self-pauses off-screen via IntersectionObserver.** A "stalled" demo is usually correct behavior with a drifted scroll anchor (`intersectionRatio: 0`). Before debugging, measure the intersection ratio FIRST, and re-anchor scroll twice with a delay so late layout shifts don't strand it.

**Verification bar for specimen work:** tsc clean, 0 console errors, two full demo loops with `dY: 0` (no scroll-anchoring drift), dark mode, 390px (no page overflow, both pan edges reachable), fullscreen at true 1:1.

## Existing specimens
- `FnbCartSpecimen.tsx` + `fnb-specimen-data.ts` — guest mobile ordering. iPhone shell 300×630, 4px bezel, r32/26; interior renders at 390pt logical scaled by `SCREEN_SCALE` (resize via `SHELL_W/H` only); status bar follows screen color (screens tuck −1px under it — scale-transform seam fix). Safari bar shows `dining.canaryhq.com` (invented URL). Assets: `public/images/fb-ordering/specimen/` (14 webp, ~412KB).
- `OrderDashboardSpecimen.tsx` + `order-dashboard-data.ts` + `order-dashboard-icons.ts` — staff order management, 1177px wide.
- `ItemLibrarySpecimen.tsx` + `item-library-data.ts` — staff item-library CMS table (availability toggle, bulk-select, delete w/ confirm + toast), 1177px wide, izakaya data shared with the cart specimen.

**Pattern:** a specimen is a self-contained component that wraps *itself* in DemoStage. Mount the specimen, not DemoStage directly.

**Shared staff-side infra:** `admin-shell.tsx` (Sidebar/WindowChrome/Icon/PROPERTY/NAV_SECTIONS) + `mdi-icons.ts` (renamed from `order-dashboard-icons.ts`) are SHARED by both staff-side specimens (OrderDashboardSpecimen + ItemLibrarySpecimen). Visual contract: any change to either file requires re-verifying both specimens.

## Canary polished tokens
`components/fb-showcase/canary-polished-tokens.ts` — Inter ramp / `#2858c4` primary / cool neutrals / space + radius + elevation, transcribed from `docs/figma-migration/POLISHED-TOKENS.md`. **This is SHARED infra — import it, don't re-transcribe.**

Icon paths: fetch from Templarian/MaterialDesign-SVG. **Never hand-author MDI glyph paths.**

## DeviceShell
Phone/browser specimen shells for card media, one shadow spec. Corners are proportional (`15% / 7.1%` outer, `11.5% / 5.2%` screen — percentage-slash keeps corners circular under the 9/19 aspect).

**Rule:** canvas is live CSS, media is a contained artifact, nothing full-bleed. Render interactive device mocks at the device's **logical** width (390pt iPhone) inside a `transform: scale()` wrapper from the start — one scale constant, then resize the shell freely. Building at physical CSS pixels means re-tuning every size when the shell shrinks.

**Companion bug:** a scaled ancestor plus an unpositioned scroll container breaks `offsetTop` anchor math. Set `position: relative` on the scroll container.

## Video
`components/AutoplayVideo.tsx` — ambient video with IntersectionObserver offscreen-pause + reduced-motion gate (`rootMargin: "50% 0px 50% 0px"`). Lightbox playback stays user-initiated.

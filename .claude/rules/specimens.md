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

- **Dispatches REAL clicks** so the prototype's own state stays the single source of truth; loops via key-remount. They carry **`clientX/clientY: -1`**, NOT `el.click()` — see gotcha #8.
- **Panel: phone only (Marco 2026-08-05, second pass).** DemoStage itself renders no panel. The guest phone specimen gets one back — applied at the *call site* in `FBOrderingContent.tsx`, not in DemoStage: `rounded-[10px] border border-border px-4 py-12 sm:py-16` over `DEMO_PANEL_BG` (`color-mix(in srgb, var(--color-fg) 7%, var(--color-bg))`, the pre-chrome-out panel color). It also sits on `CONTENT_BAND` like prose, not the wide `3-10` demo band — a 360pt phone fits 676px with room to spare. The three 1177px staff specimens stay bandwide and panel-less.
- **No `boxShadow` on a staff specimen's outer shell.** `ELEV.lg` pooled around the `RADIUS.lg` corners and read as a dark backing plate behind the window. The 1px `neutral[200]` border carries the edge; interior elevation (side sheets, menus, toasts) is unaffected. Applies to all three staff shells — change them together.
- **Two surfaces, two jobs (Marco 2026-08-05):** the **inline** copy is DISPLAY ONLY — auto-plays, loops, no chrome, no panel background, no hover state, `pointer-events: none` + `inert` (keyboard can't tab into it). The **fullscreen** copy is MANUAL ONLY — no ghost cursor, no auto-play; the visitor drives the prototype. There is no takeover path in the page anymore; the old hover scrim + "Interact with flow" pill are gone.
- **Fullscreen chrome** is two text+icon buttons top-right: **Restart** (remounts the prototype clean) and **Close**. Pause/play is gone site-wide — nothing auto-plays in fullscreen to pause.
- **`<DemoGroup>` + `<TryDemoButton />`** (both exported from `DemoStage.tsx`) open fullscreen from outside the stage. DemoStage registers its `open` fn on a ref in `DemoLaunchContext`; the CTA calls it. This exists so the caption block can live in its own `<Col>` on the 676px text band while the stage keeps the wider `lg="3-10"` band — wrap ONE demo + its caption per `DemoGroup`.
- **Fullscreen** = body-portal copy scaled to viewport (cap 2×) with Esc/scrim/Close. Open/close restarts the run (state can't cross the portal — accepted). Fullscreen scale floors at `MIN_INLINE_SCALE` (0.7) instead of 1, so tall stages (e.g. specimen #4, 1018px) fit the viewport instead of clipping — but fullscreen does NOT pan, so at narrow viewports wide stages can bleed off both edges (parked gap, see specimen #4 entry in `docs/CURRENT-STATE.md`).
- `prefers-reduced-motion` ⇒ the inline copy never auto-plays (renders its prototype's initial state and holds); fullscreen is unaffected (it was never automatic).
- `type` steps accept an optional per-step `charMs` (default 120); typing is prefix-aware — if a field already holds a value that's a prefix of the target text, typing resumes after it instead of clearing and retyping from scratch.
- **Inline fit-scale floored at `MIN_INLINE_SCALE = 0.7`** — never smaller than desktop size, pans horizontally below that. The well is **block + `margin-inline: auto`**, NOT flex centering: flex `items-center` pushes overflow off BOTH edges and strands the left half unreachable.
- The well carries **`.scrollbar-hide`** (globals.css utility, shared with the mobile pill carousel) — the native track read as clutter under every demo. Chrome only; scrolling/panning is unaffected. `ObjectFlowDiagram.tsx`'s `overflow-x-auto` wrapper carries it too. ⚠️ Below ~820px the diagram now pans with **no visible affordance** — parked, see `docs/CURRENT-STATE.md`.
- Cursor motion: WAAPI arc (perpendicular bow, random side) with split accelerate/settle easing + ±2px landing scatter. Travel 450–1100ms. Cursor fill 16% white, blur 1.5px.

### Hard-won gotchas — do not regress
1. Dispatched `el.click()` natively focuses controls (labels forward to their sr-only radios). The keyboard-takeover handler that this used to trip is gone (no takeover), so `scriptFocusRef` went with it — but the scroll pin in #2 is still load-bearing.
2. All script focus uses `preventScroll` + scrollX/Y pinned around taps.
3. The stage sets `overflow-anchor: none` or Chrome scroll-anchoring jumps the page ±150–250px at drawer/loop remounts.
4. A CSS transition driven by a mount-time state flip silently never ran (it raced the `fsScale` layout effect) — fullscreen enter/exit are WAAPI, and the scale fit is in `useLayoutEffect`.
5. The portal stays mounted through a `closing` beat (`onClose` starts the exit, `onClosed` unmounts). The inline copy does NOT go `visibility: hidden`, and resets on UNfreeze instead of freeze, so the page the scrim blurs out still looks whole.
6. Element screenshots at dpr 0.9 (browser zoom 90%) clip fixed/tall elements — capture artifact, not a bug.
7. **DemoStage self-pauses off-screen via IntersectionObserver.** A "stalled" demo is usually correct behavior with a drifted scroll anchor (`intersectionRatio: 0`). Before debugging, measure the intersection ratio FIRST, and re-anchor scroll twice with a delay so late layout shifts don't strand it. ⚠️ `scrollIntoView()` often will NOT stick while another demo is visible — its tap scroll-pin (#2) yanks scroll back. Scroll with a real wheel event instead.
8. **Script taps dispatch `new MouseEvent("click", { clientX: -1, clientY: -1, bubbles, cancelable, view })`, never `el.click()`.** `el.click()` reports the click at 0,0, and any dev overlay that anchors UI to the click point believes it. Agentation's annotation layer has a capture-phase `document` click listener and checks `isTrusted` **nowhere in its bundle** (v3.0.2) — so every demo tap opened a ghost annotation at the top of the page. `-1,-1` makes its `deepElementFromPoint` return null and it bails. React `onClick` ignores coordinates, and `dispatchEvent` still runs native activation behavior, so label→input forwarding (#1) is unaffected. Fixed 2026-08-05.

**Verification bar for specimen work:** tsc clean, 0 console errors, two full demo loops with `dY: 0` (no scroll-anchoring drift), dark mode, 390px (no page overflow, both pan edges reachable), fullscreen at true 1:1.

## Existing specimens
- `FnbCartSpecimen.tsx` + `fnb-specimen-data.ts` — guest mobile ordering. iPhone shell 360×758, 4px bezel, r38/31 (scaled up from 300×630/r32/26 on 2026-08-05 — SHELL_H was picked so the derived `LOGICAL_H` stayed ~831 and the interior layout didn't shift); interior renders at 390pt logical scaled by `SCREEN_SCALE` (resize via `SHELL_W/H` only); status bar follows screen color (screens tuck −1px under it — scale-transform seam fix). Safari bar shows `dining.canaryhq.com` (invented URL). Assets: `public/images/fb-ordering/specimen/` (14 webp, ~412KB).
- `OrderDashboardSpecimen.tsx` + `order-dashboard-data.ts` + `order-dashboard-icons.ts` — staff order management, 1177px wide.
- `ItemLibrarySpecimen.tsx` + `item-library-data.ts` — staff item-library CMS table (availability toggle, bulk-select, delete w/ confirm + toast), 1177px wide, izakaya data shared with the cart specimen.
- `OutletDetailsSpecimen.tsx` + `outlet-details-data.ts` — staff outlet-details CMS editor with a live guest-phone preview mirroring every keystroke, 1177px wide, reuses the cart specimen's `info-hero.webp` for the "uploaded" photo state.

**Pattern:** a specimen is a self-contained component that wraps *itself* in DemoStage. Mount the specimen, not DemoStage directly.

**Shared staff-side infra:** `admin-shell.tsx` (Sidebar/WindowChrome/Icon/PROPERTY/NAV_SECTIONS) + `mdi-icons.ts` (renamed from `order-dashboard-icons.ts`) are SHARED by all three staff-side specimens (OrderDashboardSpecimen + ItemLibrarySpecimen + OutletDetailsSpecimen). Visual contract: any change to either file requires re-verifying all three specimens.

## Canary polished tokens
`components/fb-showcase/canary-polished-tokens.ts` — Inter ramp / `#2858c4` primary / cool neutrals / space + radius + elevation, transcribed from `docs/figma-migration/POLISHED-TOKENS.md`. **This is SHARED infra — import it, don't re-transcribe.**

Icon paths: fetch from Templarian/MaterialDesign-SVG. **Never hand-author MDI glyph paths.**

## DeviceShell
Phone/browser specimen shells for card media, one shadow spec. Corners are proportional (`15% / 7.1%` outer, `11.5% / 5.2%` screen — percentage-slash keeps corners circular under the 9/19 aspect).

**Rule:** canvas is live CSS, media is a contained artifact, nothing full-bleed. Render interactive device mocks at the device's **logical** width (390pt iPhone) inside a `transform: scale()` wrapper from the start — one scale constant, then resize the shell freely. Building at physical CSS pixels means re-tuning every size when the shell shrinks.

**Companion bug:** a scaled ancestor plus an unpositioned scroll container breaks `offsetTop` anchor math. Set `position: relative` on the scroll container.

## Video
`components/AutoplayVideo.tsx` — ambient video with IntersectionObserver offscreen-pause + reduced-motion gate (`rootMargin: "50% 0px 50% 0px"`). Lightbox playback stays user-initiated.

# Project-card carousel — smooth-scroll plan

**Date:** 2026-08-05
**Goal (Marco's words):** "make the project card carousel smooth scrolling on desktop and mobile.
remove the one-by-one jagged scrolling that snaps to the nearest card."
**Status:** investigation complete, no source edited. Everything below is a proposal.

---

## 1. Which scroller is "the project card carousel"

There is exactly **one** horizontally-scrolling card strip on the site. No ambiguity.

| Thing | Where | Is it the carousel? |
|---|---|---|
| **`StudyMarquee`** — the full-bleed work-card strip on the homepage `#projects` section | `site/components/CaseStudyList.tsx:455-505`, CSS at `site/app/globals.css:1160-1291` | **YES — this is the one.** |
| `PlaygroundCell` grid ("Just for fun") | `site/components/CaseStudyList.tsx:943-955`, rendered at `:361-373` | No — a vertical single-column `Grid`, no scroller. |
| `site/lib/carousel-transition.ts` (`useExpandAndNavigate`) | whole file | No — a click→expand→`router.push` timer. **Dead code**: exported but imported nowhere (`grep useExpandAndNavigate` → definition only). Not part of the fix. |
| `ObjectFlowDiagram` `overflow-x-auto` | `site/components/fb-showcase/ObjectFlowDiagram.tsx:583` | No — inside a case-study demo. |
| `DemoStage` pan well | `site/components/DemoStage.tsx:794` | No — `overflowX` only while panning a demo. |
| `Hero.tsx:340` "overflow-x: hidden … outgoing slides" | comment only | No. |
| `.scrollbar-hide` "mobile pill carousel" comment | `site/app/globals.css:672-681` | Stale comment; the filter-pill carousel it describes is gone. |

**Also gone / stale, so nothing to preserve there:**
- The **card/list view toggle** described in `.claude/rules/homepage.md` is **retired**. `ViewToggleButton`
  (`CaseStudyList.tsx:34-55`) is defined but never rendered; there is no `viewMode` state, no
  `work-view-mode` localStorage key, no `CaseStudyListRow` component, and `GalleryIcon` is imported
  (`:17`) but unused. **Nothing in this change touches the toggle, because the toggle no longer exists.**
  (The rules doc is out of date — worth a separate cleanup, not part of this.)
- `HomeNav.tsx:141-144` and `NavOverlay.tsx:104-108` both look for
  `button[aria-label^='Open project gallery']` to center the first card when "Work" is clicked. **That
  selector matches nothing today** — the marquee cards are `<Link aria-label="Open case study — …">`
  (`CaseStudyList.tsx:821`). Both nav handlers already fall through to the heading-alignment branch.
  Pre-existing, unrelated, unaffected by this change.

---

## 2. Current mechanism — complete

### 2.1 Snapping is **100% CSS**. There is no JS snapping anywhere.

```
site/app/globals.css:1172    scroll-snap-type: x mandatory;      ← on .work-marquee
site/app/globals.css:1207    scroll-snap-align: start;           ← on .work-marquee-cell
site/app/globals.css:1210    scroll-snap-stop: always;           ← on .work-marquee-cell
site/app/globals.css:1187    scroll-padding-inline: var(--mq-inset);
```

Verified live at `localhost:3000` (computed styles on `.work-marquee`):

```
snapType: "x mandatory"     scrollBehavior: "auto"     touchAction: "auto"
overscrollBehaviorX: "auto" overscrollBehaviorY: "auto"
scrollPaddingInlineStart: "382px"   cellSnapAlign: "start"   cellSnapStop: "always"
cellWidth: 520   cellCount: 8   scrollWidth: 5092   clientWidth: 1440 (@1440px viewport)
```

Stride = `520 + 24 = 544px`. Snap positions are `scrollLeft = i * 544`.

### 2.2 There is **no** wheel handler, no `preventDefault`, no vertical→horizontal remapping, no rAF loop, no momentum sim, no framer-motion drag

- `grep -rn "onWheel|addEventListener(\"wheel\")" site/{app,components,lib,hooks}` → **one hit, and it is
  not the carousel**: `site/components/chat/ChatPanel.tsx:236-242` (scroll isolation for the chat
  transcript, `{ passive: false }`). The marquee is untouched by it.
- No `dragConstraints` / `dragSnapToOrigin` / `<motion.div drag>` on the marquee — it is a plain `<div>`.
- No `requestAnimationFrame` easing, no lerp, no `scrollTo({behavior:'smooth'})` targeting the marquee.

**This is good news: the fix is CSS-only. There is no hijacking code to delete.**

### 2.3 Touch/mobile

Native overflow scrolling. `touch-action: auto` (never set), `overscroll-behavior: auto` (never set),
no `-webkit-overflow-scrolling`. Cells are `w-[520px] max-w-[80vw]` (`CaseStudyList.tsx:493`), so on
phones one card ≈ 80vw. `scroll-snap-stop: always` is what makes a fling advance **exactly one card and
refuse to go further** — the literal "one-by-one" complaint.

### 2.4 The only JS: an active-index reader

`site/components/CaseStudyList.tsx:462-475`

```tsx
const scrollerRef = useRef<HTMLDivElement | null>(null);
const [focusedIndex, setFocusedIndex] = useState(0);

const handleScroll = () => {
  const scroller = scrollerRef.current;
  const cell = scroller?.querySelector<HTMLElement>(".work-marquee-cell");
  if (!scroller || !cell) return;
  const stride = cell.offsetWidth + MARQUEE_GAP_PX;
  const idx = Math.round(scroller.scrollLeft / stride);
  setFocusedIndex(Math.max(0, Math.min(studies.length - 1, idx)));
};
```

Bound at `:480` (`onScroll={handleScroll}`), consumed at `:498` (`focused={i === focusedIndex}`) →
`StudyCell` (`:772`) → `className={"mq-cell" + (focused ? " mq-cell--focused" : "")}` (`:799`).

`.mq-cell--focused` (globals.css `:1247-1250`) fades in the panel fill/border, and
`.mq-cell--focused .mq-desc` (`:1266-1269`) expands the description via `grid-template-rows: 0fr → 1fr`
over `--mq-dur: 450ms`.

**Critically: this is `Math.round(scrollLeft / stride)` on a *continuous* value.** It does **not** depend
on snap. Delete snapping and it keeps working unchanged — the card nearest the slot lights up, just at
arbitrary scroll positions instead of only at multiples of 544. **No index math breaks.**

`MARQUEE_GAP_PX = 24` (`CaseStudyList.tsx:448`) must stay in sync with `gap: 24px` (globals.css `:1200`).

### 2.5 Arrows / dots / keyboard

There are **no** prev/next buttons, **no** dots, **no** keyboard handler, and **no** `tabIndex` on the
scroller. Keyboard access today is: Tab moves through the card `<Link>`s and the browser scrolls the
focused one into view. `scroll-padding-inline: 382px` participates in that focus-scroll, which is why a
tabbed-to card lands at the slot rather than jammed against the left edge — **keep that declaration.**

### 2.6 Autoplay

None. The auto-scroll conveyor was retired 2026-07-20 (globals.css `:1168`). Nothing competes with the
user's scroll.

### 2.7 Ambient globals worth knowing

- `html { scroll-behavior: smooth }` (globals.css `:169-171`) — **does not inherit**, marquee computes
  `scroll-behavior: auto`. Confirmed in the browser.
- `body { overflow-x: hidden }` (`:194`) — makes the `width:100vw; marginLeft:calc(50% - 50vw)`
  full-bleed breakout safe.
- Global reduced-motion block (`:766-776`) forces `transition-duration: 0.01ms` and
  `scroll-behavior: auto` on everything; plus a marquee-specific block at `:1287-1291` killing
  `.mq-cell` / `.mq-desc` transitions.

---

## 3. Measured proof of the bug (Playwright, real wheel events, 1440px viewport)

`scrollLeft` sampled every rAF. **Current build, mandatory snap ON:**

| Gesture | `scrollLeft` trace (ms, px) | Net travel |
|---|---|---|
| One 120px horizontal wheel | `0 → 118 → 80 → 23 → 0` and stays 0 | **0px.** Scrolled, then visibly yanked back. |
| One 600px horizontal wheel | `0 → 580 → 551 → 544` | 544px — 600px of intent forced onto the grid. |
| 10 × 60px @16ms (trackpad-like) | `110 → 137 → 127 → 184 → 163 → 130 → 183 → 48 → 0` | **0px.** Wobbles, fights itself, snaps home. |

That third row **is** the reported jaggedness: 600px of continuous trackpad intent produces net-zero
movement and a visible back-and-forth wobble, because mandatory snap re-targets on every gesture
fragment instead of letting deltas accumulate.

**Same probes with snap disabled** (injected `!important` override in the live page — no source edited):

| Gesture | trace | Net travel |
|---|---|---|
| 120px wheel | `0 → 120`, holds | 120px, exact |
| 600px wheel | `0 → 600`, holds | 600px, exact |
| 10 × 60px | `120 → 180 → 240 → 360 → 420 → 480 → 600` | 600px, monotone ramp |

Also confirmed with snap off: a **vertical** wheel over the marquee still scrolls the *page*
(`window.scrollY 358 → 658`) and leaves `scrollLeft` untouched. Removing snap does not create a
scroll-trap.

---

## 4. Options

### Option A — **RECOMMENDED**: delete the CSS snap, add `overscroll-behavior-x: contain`

Snapping here is pure CSS, so removing three declarations restores the browser's own scroll physics —
Chrome/Safari/Firefox wheel animation on desktop, real iOS/Android momentum + rubber-band on touch. **No
JS momentum simulation can match native touch scrolling** (it runs off the compositor, it handles
pointer-cancel, back-gesture arbitration, accessibility settings and variable refresh rates for free),
and every hand-rolled version regresses on mobile. Do not write one.

- **Effort:** ~5 lines of CSS + 1 optional JS tidy.
- **Risk:** very low. Fully reversible. Proven in-browser above.
- **Cost:** the "magnetic slot" affordance goes away — a card can rest half-off the left edge. That is
  precisely what Marco asked for.
- `overscroll-behavior-x: contain` stops a horizontal fling at either end from chaining to the document
  / triggering the browser back-swipe on trackpads and iOS. **Set the `-x` axis only** — `.work-marquee`
  is `overflow-x: auto`, which per spec computes `overflow-y` to `auto` too, so a bare
  `overscroll-behavior: contain` would also constrain the y-axis and can block vertical swipe chaining
  on touch. `-x` only.

### Option B — soften instead of remove: `scroll-snap-type: x proximity`, drop `snap-stop`

Keep a weak magnet: free flinging works, and only a gesture that already ends near a card gets nudged in.

- **Pro:** keeps the slot affordance; the focused card usually reads as deliberately parked.
- **Con:** `proximity`'s threshold is UA-defined and inconsistent (Safari is noticeably stickier than
  Chrome), so "smooth" is not guaranteed cross-browser. It still ends most gestures with a small
  unrequested correction — the exact sensation Marco called jagged. **It does not fully satisfy the ask.**
- Use only as a fallback if, after Option A ships, Marco misses the slot alignment.

### Option C — JS momentum / lerp carousel (rAF target + lerp, or Lenis/Embla)

**Rejected.** There is no hijacking wheel handler to fix, so this would *add* a hijack where none exists:
new `wheel` `preventDefault`, a rAF loop, a pointer-drag path, and a hand-rolled touch model — replacing
compositor-threaded native scrolling with main-thread scrolling on a page that already runs 9 always-on
WebGL `DitherBackdrop` canvases (`.claude/rules/homepage.md`, perf backlog #6). It would be slower and
worse on the exact device class it's meant to help. Do not do this.

---

## 5. Exact diffs (Option A)

### 5.1 `site/app/globals.css` — remove `scroll-snap-type` (line 1172)

**OLD (lines 1160-1172):**
```css
/* ── Work marquee ──────────────────────────────────────────────────────
   Full-bleed snap-scroll carousel of the homepage work cards
   (StudyMarquee in components/CaseStudyList.tsx). One "slot" sits at
   the content-band start (bio text's left edge — col 4 at lg, col 3 at
   md, page padding on phone): scroll-snap magnetically pulls the
   nearest card into it on release, one card per swipe (snap-stop), and
   the slotted card grows into the focused state below. The free
   overflow-x strip era ended 2026-07-27 (Paper mock, "project marquee"
   page); the auto-scroll conveyor before it, 2026-07-20. */
.work-marquee {
  overflow-x: auto;
  scrollbar-width: none;
  scroll-snap-type: x mandatory;
```

**NEW:**
```css
/* ── Work marquee ──────────────────────────────────────────────────────
   Full-bleed free-scrolling carousel of the homepage work cards
   (StudyMarquee in components/CaseStudyList.tsx). One "slot" sits at
   the content-band start (bio text's left edge — col 4 at lg, col 3 at
   md, page padding on phone); the card nearest that slot grows into the
   focused state below (JS reads scrollLeft, see StudyMarquee).
   SCROLL-SNAP REMOVED 2026-08-05: `x mandatory` + `snap-stop: always`
   made every gesture end in a correction — a 600px trackpad swipe
   delivered as ten 60px deltas netted 0px of travel and visibly
   wobbled, and a fling could never pass more than one card. Native
   momentum scrolling now owns the physics; do not reintroduce snap or a
   JS wheel handler (see docs/audits/2026-08-05-carousel-plan.md).
   The free overflow-x strip era ended 2026-07-27 and returned
   2026-08-05; the auto-scroll conveyor before it, 2026-07-20. */
.work-marquee {
  overflow-x: auto;
  scrollbar-width: none;
  /* Stop a horizontal fling at either end from chaining to the document
     or firing the browser's back-swipe. X-AXIS ONLY — overflow-x:auto
     computes overflow-y to auto as well, so a bare `contain` would also
     constrain vertical swipe chaining on touch. */
  overscroll-behavior-x: contain;
```

### 5.2 `site/app/globals.css` — keep `scroll-padding-inline` (line 1187), retitle its comment

`scroll-padding-inline` still does real work with snap gone: it governs focus-driven and
`scrollIntoView` scrolling, which is what keeps a keyboard-tabbed card landing on the slot instead of
flush against the viewport edge. **Keep the declaration; only the comment above it is now wrong.**

**OLD (lines 1173-1176):**
```css
  /* Slot offset — mirrors the canvas math in HomeLayout (max-w
     --grid-max, px-4 sm:px-8). Lives here (not on the track) so the
     track's padding-inline and the scroller's scroll-padding resolve
     from the same vars: snap position = the old rest position. */
```

**NEW:**
```css
  /* Slot offset — mirrors the canvas math in HomeLayout (max-w
     --grid-max, px-4 sm:px-8). Lives here (not on the track) so the
     track's padding-inline and the scroller's scroll-padding resolve
     from the same vars. With snap gone, scroll-padding-inline still
     governs focus/scrollIntoView scrolling: a keyboard-tabbed card
     lands on the slot instead of flush against the viewport edge. */
```

### 5.3 `site/app/globals.css` — delete the whole `.work-marquee-cell` base rule (lines 1206-1211)

**OLD:**
```css
.work-marquee-cell {
  scroll-snap-align: start;
  /* The "resistance": a swipe settles on the adjacent card instead of
     flinging past several. */
  scroll-snap-stop: always;
}

```

**NEW:** *(delete the rule and its trailing blank line entirely — it contains nothing but the two snap
declarations)*

> The `.work-marquee-cell` selector is still used at globals.css `:1275`
> (`.work-marquee-cell .mq-frame { height: 400px }`) and as a class in the TSX — leave both alone. Only
> the base rule above goes.

### 5.4 `site/components/CaseStudyList.tsx` — cache the stride instead of measuring every scroll frame

**Optional but strongly recommended, and it is the only JS change.** Today `handleScroll` does a
`querySelector` plus an `offsetWidth` read — a forced synchronous layout — on **every scroll event**.
Under mandatory snap, gestures were short and few, so this was cheap. Free scrolling produces long
gesture trains at 60-120Hz on a page that already pins the GPU with 9 `DitherBackdrop` canvases; a
layout flush per frame is exactly the kind of residual micro-stutter that would make the fix feel
half-done. Measure once, then do arithmetic.

**OLD (lines 448, 462-475):**
```tsx
// Must match the .work-marquee-track gap in globals.css.
const MARQUEE_GAP_PX = 24;
```
```tsx
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const [focusedIndex, setFocusedIndex] = useState(0);

  // Which card owns the slot — cells are uniform width, so the nearest
  // snap index falls straight out of scrollLeft / (cell + gap). Runs on
  // every scroll frame; React bails out when the index is unchanged.
  const handleScroll = () => {
    const scroller = scrollerRef.current;
    const cell = scroller?.querySelector<HTMLElement>(".work-marquee-cell");
    if (!scroller || !cell) return;
    const stride = cell.offsetWidth + MARQUEE_GAP_PX;
    const idx = Math.round(scroller.scrollLeft / stride);
    setFocusedIndex(Math.max(0, Math.min(studies.length - 1, idx)));
  };
```

**NEW:**
```tsx
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const strideRef = useRef(0);
  const [focusedIndex, setFocusedIndex] = useState(0);

  // Cell stride (width + gap) is uniform and only changes on resize, so
  // measure it once instead of forcing a layout read on every scroll
  // frame. Since scroll-snap was removed (2026-08-05) gestures run long
  // and continuous — a querySelector + offsetWidth per scroll event was
  // a per-frame layout flush on a page that already pins the GPU.
  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const measure = () => {
      const cell = scroller.querySelector<HTMLElement>(".work-marquee-cell");
      if (cell) strideRef.current = cell.offsetWidth + MARQUEE_GAP_PX;
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(scroller);
    return () => ro.disconnect();
  }, []);

  // Which card owns the slot. Free-scrolling now, so scrollLeft is
  // continuous rather than a multiple of the stride — Math.round still
  // yields the nearest card, it just crosses over mid-gesture instead
  // of only at rest. React bails out when the index is unchanged.
  const handleScroll = () => {
    const scroller = scrollerRef.current;
    const stride = strideRef.current;
    if (!scroller || stride <= 0) return;
    const idx = Math.round(scroller.scrollLeft / stride);
    setFocusedIndex(Math.max(0, Math.min(studies.length - 1, idx)));
  };
```

`useEffect` and `useRef` are already imported (`CaseStudyList.tsx:3`). `MARQUEE_GAP_PX` is unchanged.
No other file references `focusedIndex`.

### 5.5 Not doing

- **`-webkit-overflow-scrolling: touch`** — obsolete; momentum has been the default since iOS 13. Adding
  it creates a stacking context for no benefit. Skip.
- **`scroll-behavior: smooth` on `.work-marquee`** — would animate keyboard focus jumps. Nice-to-have,
  but it's a separate taste call and the global reduced-motion block already neutralizes it. Leave off
  for now.
- **`touch-action`** — leave at `auto`. Any narrowing here risks breaking vertical page scroll started on
  a card.
- **Docs** — after shipping, `.claude/rules/homepage.md` "Work marquee (snap carousel, 2026-07-27)" needs
  its snap bullets rewritten, and its stale "Card/List View Toggle" section flagged (see §1).

---

## 6. Input modes, addressed separately

**Desktop trackpad (the worst case today).** Two-finger horizontal deltas arrive as many small `wheel`
events. Mandatory snap re-targets each one, so they cancel — measured net travel for a 600px gesture:
**0px, with visible wobble** (§3). After the change the same gesture accumulates monotonically to 600px
and coasts out on the browser's own curve. This is the single biggest improvement.

**Desktop discrete mouse wheel.** A notch is a coarse ~100-120px delta. Post-change, each notch moves
~120px — about **22% of a 544px card**, so ~4-5 notches per card. Chrome/Firefox animate that delta over
~100-150ms, so it reads as a short glide, not a teleport. Two honest consequences: (a) it takes more
notches to cross the strip than the old one-notch-per-card, and (b) cards will commonly come to rest
half-in/half-out of the slot, which the snap was hiding. Both are inherent to "no snap" and are what was
asked for. **Note:** a *vertical* wheel over the marquee does **not** scroll it horizontally — verified
live, `window.scrollY` advances and `scrollLeft` stays put. Horizontal scrolling needs a horizontal
wheel or Shift+wheel. That is unchanged by this fix; if Marco wants vertical-wheel-to-horizontal
mapping, that is a **separate** feature request and it *would* require the kind of wheel hijack this
plan otherwise avoids — flag it, don't bundle it.

**Touch (iOS / Android).** `scroll-snap-stop: always` is the "one card per swipe, no matter how hard you
flick" rule; deleting it restores full native fling with real momentum and rubber-band. This is where
Option A most decisively beats any JS approach. `overscroll-behavior-x: contain` prevents a fling at
either end from triggering the iOS back-swipe or bouncing the document.

---

## 7. Must be preserved (checked, all safe)

| Concern | Status |
|---|---|
| **Active-index UI** (`.mq-cell--focused` panel + description reveal) | **Preserved.** `Math.round(scrollLeft / stride)` was never snap-dependent. It now crosses over at each card's midpoint mid-gesture instead of only at rest. |
| **Keyboard access** | Preserved. No keyboard handler exists; Tab through card `<Link>`s still works, and keeping `scroll-padding-inline` keeps focus scroll landing on the slot. |
| **Focus management** | Preserved. `focus-visible:ring-2 … ring-(--color-accent)` on the card link (`:822`) untouched. Nothing gains/loses `tabIndex`. |
| **Reduced motion** | Preserved. Global block (globals.css `:766-776`) + marquee block (`:1287-1291`) are unrelated to snap; scroll physics under reduced-motion is the OS/UA's call, which is correct. |
| **Card/list toggle** | N/A — already retired (§1). Nothing to break. |
| **Autoplay/marquee animation** | N/A — retired 2026-07-20. |
| **`MARQUEE_GAP_PX` ↔ `gap: 24px`** | Unchanged, still coupled, comment still accurate. |
| **Full-bleed breakout** (`100vw` + `calc(50% - 50vw)`) | Unchanged. |
| **`.work-marquee-track { min-height: 550px }`** (globals.css `:1281`) | Keep. It reserves the expanded-description height so content below doesn't bounce — *more* important now that focus flips more often. |

### Known pre-existing quirk, unchanged by this work
At 1440px, `scrollWidth 5092 − clientWidth 1440 = 3652` max scroll, but the last card's slot position
would need `scrollLeft = 3808`. **The 8th card can never reach the slot**, because the track's mirrored
right padding (`--mq-inset`, 382px) is smaller than `clientWidth − cellWidth` (920px). `Math.round(3652
/ 544) = 7`, so it still *focuses* at max scroll — it just sits left of the slot. This is true today
under snap and stays true after. Fixing it (right padding = `calc(100% - cell width)`) is a separate
call for Marco.

---

## 8. Verification checklist

Run `cd site && npm run dev`, open `http://localhost:3000/#projects`. Hide the dev toolbar first:
`document.querySelector('[data-agentation-root]')?.remove()`.

**1. Static proof the snap is gone.**
```js
const s = document.querySelector('.work-marquee');
getComputedStyle(s).scrollSnapType          // → "none"
getComputedStyle(s).overscrollBehaviorX     // → "contain"
getComputedStyle(s.querySelector('.work-marquee-cell')).scrollSnapAlign  // → "none"
getComputedStyle(s.querySelector('.work-marquee-cell')).scrollSnapStop   // → "normal"
getComputedStyle(s).scrollPaddingInlineStart // → "382px" (still set — intentional)
```

**2. Continuity trace — the load-bearing test.** Paste, then do one horizontal trackpad swipe:
```js
const s = document.querySelector('.work-marquee'); s.scrollLeft = 0;
const out = []; const t0 = performance.now();
(function tick(){ out.push([Math.round(performance.now()-t0), Math.round(s.scrollLeft)]);
  if (performance.now()-t0 < 2500) requestAnimationFrame(tick); else console.table(out); })();
```
**PASS:** monotone non-decreasing, decelerating, settling at an arbitrary value.
**FAIL (snap still live):** the tail ends on an exact multiple of 544 (0/544/1088/1632/…), or the value
rises then *falls back* — that reversal is the snap correction and is the exact signature captured in §3.

**3. Small-gesture test.** `s.scrollLeft = 0`, then one *small* horizontal flick (< 200px).
**PASS:** it stays where you left it. **FAIL:** it slides back to 0.

**4. Long fling.** Hard horizontal fling from `scrollLeft = 0`.
**PASS:** coasts past several cards. **FAIL:** stops after exactly one (`scroll-snap-stop` survived).

**5. Discrete wheel.** Shift+wheel one notch: expect ~120px (≈22% of a card), animated, no snap-back.

**6. Vertical wheel not trapped.** Hover the marquee, wheel down. `window.scrollY` must increase and
`s.scrollLeft` must not change.

**7. Focus state tracks continuously.** Scroll slowly and watch `.mq-cell--focused`:
```js
new MutationObserver(() => console.log(
  [...document.querySelectorAll('.mq-cell')].findIndex(e => e.classList.contains('mq-cell--focused')),
  Math.round(document.querySelector('.work-marquee').scrollLeft)
)).observe(document.querySelector('.work-marquee-track'), {subtree:true, attributes:true, attributeFilter:['class']});
```
Index must increment 0→1→2… crossing at ~`i*544 + 272`, never skip, never stick.

**8. Touch — real device, not emulation.** iOS Safari + Android Chrome on `0.0.0.0:3000`:
   - a light swipe moves a little and keeps momentum;
   - a hard fling crosses several cards;
   - a fling at either end does **not** trigger the browser back-gesture or bounce the page;
   - a **vertical** swipe starting on a card still scrolls the page normally.

**9. Keyboard.** Tab into the strip. Each focused card scrolls into view with its accent focus ring
visible and lands at/near the 382px slot, not clipped at the left edge. Shift+Tab back out works.

**10. Reduced motion.** DevTools → Rendering → *Emulate prefers-reduced-motion: reduce*. Panel/description
transitions become instant; scrolling still works and is still free.

**11. No regressions.** `.work-marquee-track` min-height still prevents bounce when the description
expands mid-scroll; clicking a card still routes to `/work/<slug>`; locked cards still open
`MediaPreviewLightbox`; page has no horizontal document scrollbar.

**12. Perf sanity.** DevTools Performance, record one long fling. With §5.4 applied, `handleScroll`
should show no "Recalculate Style / Layout" forced-reflow warnings. Compare against a recording made
before the change to confirm the layout flush per scroll event is gone.

---

## 9. Summary

Snapping is three CSS declarations and nothing else. Delete them, add `overscroll-behavior-x: contain`,
optionally cache the stride so the focus reader stops forcing a layout per scroll frame. No JS momentum,
no library, no wheel handler. Verified in-browser that the change turns a 600px trackpad gesture from
**0px net travel with wobble** into a clean 600px ramp.

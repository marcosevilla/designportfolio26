# Multi-agent maintenance session — change log

**Date:** 2026-08-05
**Baseline tag:** `pre-multiagent-audit` (commit `0b22c2d`)
**Revert everything:** `git reset --hard pre-multiagent-audit`

Every change below is listed with its own revert instruction so individual pieces can
be backed out without losing the rest.

Audit reports produced this session live alongside this file in `docs/audits/`:

| Report | Contents |
|--------|----------|
| `2026-08-05-technical-audit.md` | Technical + performance findings |
| `2026-08-05-design-token-audit.md` | Type/color/spacing token coverage |
| `2026-08-05-token-swaps-applied.md` | Which token swaps were executed |
| `2026-08-05-ux-design-audit.md` | UX findings + future design opportunities |
| `2026-08-05-carousel-plan.md` | Carousel diagnosis + implementation plan |

---

## 1. Work-marquee carousel — scroll-snap removed (smooth free scrolling)

**Ask:** "make the project card carousel smooth scrolling on desktop and mobile. remove
the one-by-one jagged scrolling that snaps to the nearest card."

### What was wrong

The carousel used CSS scroll-snap (`scroll-snap-type: x mandatory` plus
`scroll-snap-stop: always` on each cell). There was no JavaScript involved — no wheel
hijacking, no momentum simulation.

Mandatory snap re-targets the nearest card on *every* scroll delta. A trackpad gesture
arrives as many small deltas rather than one large one, so each fragment re-aimed at the
nearest card and the strip fought itself. Measured before the fix, at 1440px, sampling
`scrollLeft` every frame:

- Trackpad gesture (10 × 60px): `110 → 137 → 127 → 184 → 163 → 130 → 183 → 48 → 0`
  — **net zero travel with a visible wobble.**
- One 120px wheel notch: `0 → 118 → 80 → 23 → 0` — sprang back to the start.

### What changed

`site/app/globals.css`
- `.work-marquee`: deleted `scroll-snap-type: x mandatory`, added
  `overscroll-behavior-x: contain`.
  - X-axis only on purpose: `overflow-x: auto` computes `overflow-y` to `auto` too, so an
    unqualified `overscroll-behavior: contain` would also trap vertical swipe chaining and
    stop the page scrolling when a touch gesture starts on a card.
- `.work-marquee-cell`: the whole rule (`scroll-snap-align: start` +
  `scroll-snap-stop: always`) deleted. The class remains in the markup as the layout hook.
- `scroll-padding-inline: var(--mq-inset)` **kept** — with snap gone it still governs
  focus and `scrollIntoView`, which is what lands a keyboard-tabbed card on the slot.
- Header comment rewritten to record why snap must not be reintroduced.

`site/components/CaseStudyList.tsx` (`StudyMarquee`)
- The scroll handler previously ran `querySelector` + `offsetWidth` on **every scroll
  event**, forcing a synchronous layout each time. Snap kept gestures short so this was
  cheap; free scrolling emits long 60–120Hz event trains on a page that already runs nine
  always-on WebGL backdrops.
- Cell stride is now measured once and cached in a ref, refreshed by a `ResizeObserver`.
- Scroll events are coalesced to one read per frame via `requestAnimationFrame`, with the
  pending frame cancelled on unmount.

### Verified (measured in a real browser, not eyeballed)

At 1440×900, dispatching real wheel events over the marquee and sampling `scrollLeft`
per frame:

| Gesture | Result | Backsteps |
|---|---|---|
| Trackpad, 10 × 60px | `0 → 60 → 120 → … → 600`, holds at 600 | 0 |
| Single 120px wheel notch | `0 → 120`, holds | 0 |
| Fling, 6 × 200px | `0 → 1200` monotonic | 0 |

"Backsteps" counts any frame where the strip travelled backwards more than 1px — i.e. the
spring-back signature of the old behaviour. Zero in all three cases.

Also confirmed:
- Computed styles: `scroll-snap-type: none`, `scroll-snap-align: none`,
  `overscroll-behavior-x: contain`, `overscroll-behavior-y: auto` (vertical page-scroll
  chaining preserved).
- Focused-card tracking still works — at slot positions 0/544/1088/1632/2176 the
  highlighted card is index 0/1/2/3/4 respectively.
- At 390px: no page-level horizontal overflow (`scrollWidth` 390 = viewport 390),
  `touch-action: auto` so native touch scrolling applies, strip reaches its end.
- 0 console errors, 0 console warnings.
- `npx tsc --noEmit` clean.

### Behaviour change worth knowing

Keyboard-tabbing to a card no longer pixel-aligns it to the slot — the browser now scrolls
the minimum amount to bring it into view (measured 78px off the slot). The **correct card
still receives the focused/expanded state**, which is the functional requirement. This is a
consequence of removing snap and is judged acceptable; restoring exact alignment would need
JS `scrollIntoView` on focus.

### Revert

```
git checkout pre-multiagent-audit -- site/app/globals.css site/components/CaseStudyList.tsx
```
(reverts the token swaps in those two files as well — see section 2)

### Pre-existing quirk, unchanged

The 8th card can never quite reach the slot (max scroll 3652 vs. 3808 required) because
the track's mirrored right padding is smaller than `clientWidth − cellWidth`. This was true
under snap and is still true now. Not introduced or fixed here.

---

## 2. Design token binding

See `2026-08-05-token-swaps-applied.md` for the executed list and the values that still
need a design decision.

---

## 3. Technical and performance fixes

Finding IDs (F-nn) refer to `2026-08-05-technical-audit.md`, which has the full reasoning
and line references for each. 68 findings were catalogued; the ones acted on are below.

### 3a. Chat — F-01, the only P0

`components/chat/ChatBar.tsx`, `app/api/chat/route.ts`, `lib/chat/rate-limit.ts`

**One tap on the mobile scrim permanently broke chat for the session, across reloads.**
Submitting pushes an empty assistant placeholder turn before streaming. On abort, the catch
block returned on `AbortError` *before* the line that trims that placeholder — so the empty
turn stayed in state, got persisted to `sessionStorage` (surviving reload), and was included
in the message array on every later submit. The Anthropic API rejects empty content on a
non-final message with a 400, so the user saw "Lost connection — try asking again." forever.

Fixed by trimming before the early return, making the empty-assistant check
terminal-agnostic, filtering empty assistant turns out of `readStored` (so anyone already
carrying a poisoned session recovers), and rejecting empty content server-side.

**Proved, not assumed** — two independent ways: a harness that extracts the *actual shipped
source text* of the four changed functions and executes them (17/17 pass, and the same
assertions **fail** when run against `git show HEAD:`, confirming they are real regression
tests); and end-to-end in the running app with an abort-aware stubbed stream, confirming the
empty turn is present in sessionStorage mid-stream and gone after Escape.

Also fixed alongside it:
- **F-03** — Escape closed the panel via a different path than the X button and never
  aborted, leaving a billed Anthropic stream running with no consumer. All close paths now abort.
- **F-26** — the SSE reader was never cancelled on an early `break`.
- **F-08** — partially-streamed `<artifact>` markup rendered as literal text mid-stream.
- **F-20/21/22** — rate-limited requests still consumed the daily quota; an unbounded message
  array was validated before throttling; the route never required the last message to be a
  user turn.

### 3b. Chat focus restore — F-06

`components/ChatFab.tsx`

Closing the chat panel left keyboard focus on `<body>`, stranding keyboard users at the top
of the document. ChatBar stashes and restores `activeElement`, but that cannot work for the
FAB: the FAB is conditionally rendered, so opening the panel unmounts it and closing mounts a
*new* node — the stashed reference is detached and the `isConnected` guard correctly declines.

ChatFab now focuses itself when the panel closes (returning focus to the control that opened
a dialog is the expected behaviour anyway).

⚠️ **The obvious implementation is wrong, and this is worth not re-breaking.** Guarding on
`activeElement === document.body` fails: the panel plays a ~460ms exit animation and stays
mounted *with focus* the whole time, so at the moment the effect runs, focus is still on the
panel's textarea. Measured trace — FAB remounts at t≈763ms, focus stays on the textarea until
t≈1201ms, and only falls to `<body>` at t≈1228ms when the panel finally unmounts. The
condition is therefore "focus is inside the dying panel, **or** nowhere".

Verified: focus lands back on the FAB via both Escape and the X button; FAB position is
byte-identical (1380,840,44,44) before and after the wrapper element was added.

### 3c. TOC highlighting — F-04

`components/case-study/TOCObserver.tsx`

The observer wrote the active id for *every* intersecting entry in a batch, so the last entry
in an unordered array won, and a section leaving the band never cleared. The TOC marker landed
on the wrong item whenever two section boundaries crossed together — on every case study.

Now tracks a `Set` of intersecting sections and picks the bottom-most. The correct logic
already existed in `HomeNav.tsx` — but that component is unmounted, so the good code was the
dead code and the naive version was what shipped.

### 3d. Home ↔ About scroll reset — F-02

`components/HomeLayout.tsx`

`window.scrollTo({ top: 0, left: 0 })` with no `behavior` key defaults to `"auto"`, which per
spec means *use the element's computed `scroll-behavior`* — and `globals.css` sets
`html { scroll-behavior: smooth }`. So the "instant reset" animated, concurrently with the
0.45s page transition. Now `behavior: "instant"`.

### 3e. Ghost wordmark — F-56

`components/Hero.tsx`, `components/HomeLayout.tsx`

`<Hero>` is mounted at exactly one site, *inside* HomeLayout's own `aboutMeOpen ? (...)`
branch, and is passed `aboutMeOpen`. So Hero's internal `!aboutMeOpen` branch could only ever
be true during the 260ms in which About was already animating away — mounting a full-opacity
48px "Marco Sevilla" wordmark (the superseded 2026-07 treatment) inside a parent fading to
zero. Every "Return" press flashed a ghost name.

Removed, along with its now-dead cascade (`initial`/`animate`/`tx`), the `wordmarkEl` state,
the `useFitWordmark` call, and the unused `wordmarkRef` prop and its plumbing in HomeLayout.
This also stops `useFitWordmark` writing `--wordmark-fontsize` onto `<html>` with no cleanup
and no consumer.

`useFitWordmark` and `PlaygroundStar` are **deliberately left defined** — `PlaygroundStar`
owns `layoutId="hero-star"`, which `LoadingOverlay`'s morph pairs with if the intro is ever
re-enabled. Don't delete them without checking that path.

Verified: sampled the DOM every 40ms through the full transition — never two "Marco Sevilla"
headings simultaneously (39/39 samples), `--wordmark-fontsize` no longer set on `<html>`, home
h1 still Libre Baskerville 32px.

### 3f. Disabled component still costing every visitor — F-10

`components/BackgroundTexture.tsx`

The dot-grid canvas was switched off on 2026-08-03 *for performance* via `DISABLED = true`.
But the `return null` sits **after** the hooks, so two effects still ran on every homepage
visit: a non-passive global `mousemove` handler (firing on every pointer move) feeding a
cursor halo that is never drawn, and a `<html>` MutationObserver refreshing colors for a
canvas that does not exist. Both effects now check the kill switch, and the listeners are
passive.

### 3g. Lint had never run — F-13

`site/eslint.config.mjs` (new), `site/package.json`

The project had `eslint@9` and `eslint-config-next@16` in devDependencies but **no config file
anywhere**, and `npm run lint` called `next lint`, which Next 16 removed (the arg parser read
"lint" as a directory: *"no such directory: .../site/lint"*). So lint had never executed, and
the 11 inline `eslint-disable` comments in the tree were suppressing rules that were not
configured.

Added a flat config (`eslint-config-next@16` exports a real flat-config array, so no
`FlatCompat` shim is needed) and pointed the script at `eslint .`.

**Severities were graded rather than the code mass-edited.** The first run surfaced 67
findings, none of them runtime defects:
- 29 × `no-img-element` — **off**. `images.unoptimized: true` is set site-wide, so `next/image`
  buys only a wrapper, and the fixed-geometry product specimens explicitly don't want one.
- 20 × `set-state-in-effect`, 6 × `immutability`, 2 × `preserve-manual-memoization`,
  `exhaustive-deps` — **warn**. Almost all are the standard SSR-safe "read localStorage on
  mount and hydrate" pattern. Real backlog, not breakage.
- 3 × `no-unescaped-entities` — **off**. The site uses straight apostrophes universally: 462 of
  them, zero typographic. Exactly 3 trip the rule, purely because they sit in JSX text nodes
  rather than string literals. Fixing only those 3 would *create* inconsistency. Moving all 462
  to smart punctuation is a real typography improvement but it is a copy decision for Marco.
- `purity` and `refs` kept as **errors** — they can produce wrong output, not just slow output.

Result: **1 error remaining** (`chat/ChatPanel.tsx:125`, `Math.random()` during render — a
purity violation, low risk in practice since it only renders client-side while streaming;
flagged, not fixed) and 35 warnings.

Also fixed `app/dev/logo-lab/LogoScene.tsx` — a render-phase ref write, moved into an effect.

### 3h. Rendering performance — F-11, F-12, F-17, F-18, F-19, F-29, F-34, F-36

Full detail and per-fix measurements in `2026-08-05-perf-fixes.md`.

| Fix | Measured |
|---|---|
| **F-11** Off-screen WebGL dither canvases never viewport-gated | 2,408 → **598** shader frames / 5s (**−75%**) |
| **F-12** Per-instance accent probe + GPU readback | 8 probes / observers / synchronous `getImageData` readbacks → **1** |
| **F-17** LedMatrix rendered behind a 10px collapsed window | 241 → **0** GL draws / 4s collapsed; 240 on re-expand |
| **F-18** `currentTime` re-rendered the 1,563-line LedMatrix | 30 → **0** renders / 4s |
| **F-19** AudioContext / Web Audio nodes never disconnected | Code-level; not A/B-able |
| **F-29** PixelRain polled `getComputedStyle` at 6.7 Hz forever | 20 → **0** polls / 3s off-screen *and* tab-hidden |
| **F-34** `CursorGlowOverlay` forced sync layout per mousemove | −76 ms renderer task time; 120 → **0** `getBoundingClientRect` per 120 moves |
| **F-36** Reduced-motion sampled once, never re-read | Live OS flip now pauses videos + freezes all shaders |

**Notable decisions:**
- **`speed={0}`, not unmount.** Verified in the vendored library that `setCurrentSpeed(0)`
  cancels its rAF and nulls `rafId` as documented first-class state, keeps the last frame, and
  resets `lastRenderTime` on resume. Unmounting would flash a GL re-initialisation and churn
  the browser's WebGL context budget.
- **The canvas count is 8, not 9.** The audit's ninth `[data-paper-shader]` element is the
  library's injected `<style>` tag in `<head>`. `fb-ordering` gets `FnbDitherFrame` *instead
  of* a bare `DitherBackdrop`, so the marquee holds 8 live mounts. `perf-backlog #6` says six —
  also wrong.
- **PixelRain kept its poll** (gated rather than made event-driven) because the trigger button
  has a `transition: color 150ms`; a one-shot event read would latch the pre-transition ink and
  never catch up.
- Both of the audit's measurement traps were respected: every A/B instruments
  `ShaderMount.render` / `drawArrays` rather than removing canvases from the DOM (the draw
  closure holds the ref and keeps rendering into a *detached* bitmap), and all CPU figures are
  absolute CDP deltas, not busy-percentages.

### 3i. Keyboard-operable scrubber — F-07

`components/music/InsetScrubber.tsx`

The scrubber advertised `role="slider"` and took focus via `tabIndex={0}` but had **no
`onKeyDown` anywhere in the file** — a focusable dead end. Added Arrow ±5s, Shift+Arrow ±30s,
Home, End. Also added `aria-valuetext` so a screen reader announces `"2:17"` rather than the
raw float `137.42`; it reuses the exported `formatClock` rather than adding a third copy of
the same M:SS formatter.

### 3j. Purity fix in the chat greeting

`components/chat/ChatPanel.tsx`

`Math.random()` was called **during render** to jitter the typewriter cursor's landing. React
is free to discard or replay a render, so the animation's start value was not actually stable.
Replaced with a deterministic hash of the word index — same jagged look (verified: 8 distinct
values well spread across the ±2px range), but pure.

This was the last remaining lint **error**, so `npm run lint` now exits 0. Worth doing rather
than silencing: lint went from "never ran" to "runs", and leaving a failing error would break
any lint-gated CI added later.

### 3k. Documented a live Tailwind v4 trap

`site/app/globals.css`

Tailwind v4 tree-shakes `@theme` variables that nothing references, so an unused token is not
emitted and `var(--token)` resolves to an **empty string** at runtime — silently invalidating
the whole declaration, with no error. `--shadow-soft` now has three consumers so it is emitted;
**`--shadow-soft-lg` still has zero and resolves to `""`.** Left in place with a prominent
warning comment, because deleting it discards a recorded design intent and adopting it needs a
retune (its nearest real twin differs by 2px of blur) — that's Marco's call. The trap is now
documented at the definition site so the next person isn't caught by it.

---

## 5. QA RESULT

An independent QA agent — which made none of these changes — tested the full diff against the
`pre-multiagent-audit` baseline.

**Verdict: 10/10 PASS, zero confirmed regressions.**

| # | Item | Verdict | Key measured value |
|---|---|---|---|
| 1 | All routes | PASS | 11/11 → 200, **0** console errors/warnings/exceptions |
| 2 | Carousel | PASS | snap `none`, overscroll-x `contain` / -y `auto`; 3 gestures, **0 backsteps**; focus tracks 0→7 |
| 3 | Chat P0 | PASS | All 3 close paths: 1 empty assistant turn mid-stream → **0** after close |
| 4 | Performance | PASS | Dither 360→543→**0** draws/3s by scroll position; LedMatrix 240→**0**→240 |
| 5 | Token swaps | PASS | `--shadow-soft` resolves, no shadow empty; bio 15px / 24.705px / −0.15px |
| 6 | Ghost wordmark | PASS | 71 samples @40ms, **max 1** h1, 0 violations |
| 7 | TOC | PASS | Marker tracks 6 sections in order, exactly one active row |
| 8 | Themes | PASS | light / dark / mono / ember → **0** low-contrast pairs |
| 9 | Responsive | PASS | **0** horizontal overflow at 1440 / 1024 / 768 / 390 |
| 10 | Music | PASS | Arrow, Shift+Arrow, Home, End all work; `aria-valuetext: "0:01"` |

Commands: `tsc --noEmit` exit 0 · `npm run build` succeeds, 18 routes · `npm run lint` exit 0
(0 errors, 35 warnings) · chat parser 31/31.

**The worst-case failure mode was specifically hunted and cleared.** A viewport-gated shader
that leaves blank cards is worse than the perf problem it solves. QA measured cards 3–8 sitting
at 0 draws on cold load, then confirmed the library still renders one frame at `speed=0` on
uniform change (all six drew exactly 1 frame at +25ms). Across 251 frames of realistic
scrolling, exactly **1 frame** had a visible-but-undrawn canvas — 95px wide, ~16ms. Verified
visually with 9 screenshots in both themes.

### Stated honestly by QA, not glossed

- **F-22 could not be executed at runtime.** `ANTHROPIC_API_KEY` is empty in `.env.local`, so
  the route returns 503 before reaching the check. Correct by inspection, unverified live —
  **worth one smoke test on the Vercel preview.**
- **Chat was tested with `fetch` stubbed.** No real Anthropic requests were made and no spend
  was incurred.
- **Case-study `scrollWidth` overflow** of up to 279px exists but is clamped (`scrollX` stays
  0). Source is an invisible measuring div at `StudyMetaRow.tsx:133` in an untouched file —
  **pre-existing, not caused by this session.**

---

## 4. UX findings

See `2026-08-05-ux-design-audit.md`.

---

## Stale documentation found along the way

- `.claude/rules/homepage.md` still documents a **"Card/List View Toggle"** with
  localStorage key `work-view-mode`, `CaseStudyListRow`, and an AnimatePresence blur
  transition. None of that exists any more: `ViewToggleButton` is defined in
  `CaseStudyList.tsx` but never rendered, there is no `viewMode` state, and `GalleryIcon`
  is imported unused. The rules file needs correcting.
- `site/lib/carousel-transition.ts` is dead code — exported, imported nowhere.

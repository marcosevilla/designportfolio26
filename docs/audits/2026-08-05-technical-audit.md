# Technical & Performance Audit — 2026-08-05

Read-only audit of `site/`. Scope: build/typecheck health, real runtime defects in client
components (effect leaks, animation loops, layout thrash, hydration, a11y-as-defect),
asset weight, dependency hygiene.

**Method.** Every finding below was confirmed by reading the cited source. `file:line`
references are exact as of commit `0b22c2d`. Anything suspected but not provable from
source alone is quarantined in **Unverified suspicions** at the end — do not act on that
section without reproducing first.

**Do not re-flag:** `components/fb-showcase/OutletConfigSpecimen.tsx` (intentionally
commented out), and anything listed as deliberate salvage in `docs/DEAD-CODE-AUDIT.md` /
`docs/SALVAGE-REVIEW.md`.

**68 findings.**

| | Count | Character |
|---|---|---|
| **P0** | 1 | Chat bricks for the session after one scrim tap |
| **P1** | 13 | Real defects — a smooth-scroll regression, wrong TOC highlight, six focus-management gaps, two vestigial-code bugs |
| **P2** | 38 | Perf and robustness — always-on GPU work, layout thrash, uncoalesced scroll handlers, ~45 MB of avoidable deploy weight |
| **P3** | 16 | Hygiene, dead code, dependency cleanup |

Headline: the codebase is in good shape. `tsc` is clean, the build succeeds with zero
warnings, there are **no hydration-mismatch risks**, and the hardest components
(`LedMatrix`, `AutoplayVideo`) are carefully built. The recurring weaknesses are (a) modal
focus management, which is absent almost everywhere, (b) animation loops with no viewport
or visibility gate, and (c) the total absence of lint, which is why (a) and (b) accumulated
quietly.

---

## 0. Toolchain results

| Check | Result |
|---|---|
| `npx tsc --noEmit` | **Clean.** Zero errors. |
| `npm run build` | **Succeeds.** Compiled in ~2.0s, 18/18 static pages. Zero warnings emitted. |
| `npx next lint` / `npm run lint` | **BROKEN** — see F-13. |
| `react-hooks` rules (run manually with a temp config) | 10 `exhaustive-deps` warnings — see F-14. |

### Build route table

Next 16 + Turbopack **no longer prints per-route bundle sizes**. The build output is
routes only:

```
Route (app)
┌ ○ /                        ○ /work/ai-workflow
├ ○ /_not-found              ○ /work/checkin
├ ƒ /api/chat                ○ /work/compendium
├ ƒ /api/gate                ○ /work/design-system
├ ○ /dev/effects-lab         ○ /work/fb-ordering
├ ○ /dev/logo-lab            ○ /work/general-task
├ ○ /dev/type-lab            ○ /work/knowledge-base
├ ○ /icon.svg                ○ /work/upsells
├ ○ /resume                  ○ /writing
ƒ Proxy (Middleware)
```

Measured from `.next/static/chunks` instead — **2,782 KB of JS across 33 chunks**:

| Size | Chunk | Contents |
|---|---|---|
| **1,004 KB** | `4b9372e41a86ea19.js` | **three.js + drei** — dev-only route, see F-12 |
| 548 KB | `bb5116d645f99b67.js` | react-dom |
| 224 KB | `5d34c0b5fafcc796.js` | react-dom |
| 123 / 122 / 119 / 116 / 113 KB | five more | app + framer-motion + base-ui |
| 79 KB | CSS | one stylesheet |

The loss of the size table is itself worth noting: **there is currently no bundle-size
regression signal in CI or local builds.**

---

## P0 — broken, user-visible

### F-01 · One scrim tap permanently bricks the chat panel for the session
`components/chat/ChatBar.tsx:200`, `:251-256`, `:128`, `:50-56`; `app/api/chat/route.ts:29-40`, `:96`

`submit` pushes an empty assistant placeholder before streaming:

```ts
// ChatBar.tsx:200
const placeholder: ChatTurn = { role: "assistant", content: "" };
```

Two paths leave that `content: ""` turn in `turns` permanently:

1. **Abort.** `close()` (`:160`) fires from the X button, the mobile scrim tap (`:427`)
   and drag-dismiss (`:441`). The reader rejects and the catch bails *before* the trim:
   ```ts
   } catch (err) {
     if ((err as Error).name === "AbortError") return;   // :252 — returns first
     setErrorLine("Lost connection — try asking again.");
     setTurns((prev) =>                                   // :254 — never reached
       prev.length > 0 && prev[prev.length - 1].content === "" ? prev.slice(0, -1) : prev
     );
   ```
2. **Clean `done` with no text.** The guard at `:244` is
   `terminal === "error" || (terminal === null && assistant.length === 0)`. A
   `terminal === "done"` with `assistant === ""` (refusal, immediate `message_stop`)
   matches neither branch.

Why it's P0, in escalating order:

- `useEffect(() => writeStored(turns), [turns])` (`:128`) persists it to `sessionStorage`.
  `readStored`'s filter only checks `typeof t.content === "string"` (`:55`), so it
  **survives reload**.
- Every later submit posts `{ messages: [...turns, userTurn] }` (`:211`) — including the
  empty assistant turn. The route's `isValidMessages` accepts it (`route.ts:29-40` checks
  only role and max length), and `safeMessages` strips only a *leading* assistant
  (`route.ts:96`). The Anthropic API rejects empty content on a non-final message with a
  400 → the client renders **"Lost connection — try asking again." forever.**
- Cosmetically, a blank assistant bubble renders with an orphan Copy row
  (`ChatMessage.tsx:153`).

**Fix.** Trim in the abort path, and make the empty check terminal-agnostic:

```ts
} catch (err) {
  setTurns(prev => prev.at(-1)?.content === "" ? prev.slice(0, -1) : prev);
  if ((err as Error).name === "AbortError") return;
  setErrorLine("Lost connection — try asking again.");
}
// and replace the :244 branch condition's trim with an unconditional one:
if (assistant.length === 0) setTurns(prev => prev.slice(0, -1));
```

Belt and braces: require `content.length > 0` for assistant turns in `readStored`, and
reject empty content in `isValidMessages`.

---

## P1 — real defects, low visibility

### F-02 · The home ↔ About scroll reset animates instead of jumping
`components/HomeLayout.tsx:148-150`; `app/globals.css:170`

```ts
useLayoutEffect(() => {
  window.scrollTo({ top: 0, left: 0 });   // no `behavior` key
}, [aboutMeOpen]);
```

`html { scroll-behavior: smooth; }` is set at `globals.css:170`. Per spec, `scrollTo` with
no `behavior` defaults to `"auto"`, which means **use the element's computed
`scroll-behavior`** — so this is a smooth animated scroll, not the instant reset the
comment claims. It runs concurrently with the 0.45s page-transition slide/blur, which is
exactly the "visibly shifts layout mid-animation" failure `.claude/rules/homepage.md`
warns about. Only the reduced-motion branch (`globals.css:774`) behaves correctly today.

**Fix.** `window.scrollTo({ top: 0, left: 0, behavior: "instant" })`.

### F-03 · Escape closes chat without aborting the stream; the X button aborts
`lib/ChatOverlayContext.tsx:21-28` vs `components/chat/ChatBar.tsx:159-164`

```ts
// ChatOverlayContext.tsx:24 — bypasses close(), never touches abortRef
if (e.key === "Escape") setChatOpen(false);
```

Esc leaves the Anthropic stream running to completion with the panel gone — billed
tokens, no consumer. The X button calls `close()` which aborts. Same panel, two
behaviours.

**Fix.** Give ChatBar an effect that runs `close()` when `open` flips false, and let Esc
keep using the context.

### F-04 · `TOCObserver` picks an arbitrary section when two are in the band
`components/case-study/TOCObserver.tsx:10-19`

```ts
for (const entry of entries) {
  if (entry.isIntersecting) setActiveTocId(entry.target.id);
}
```

It writes the active id for *every* intersecting entry in the batch, so the last entry in
the (unordered) array wins, and it never clears an id when a section leaves. Symptom: the
TOC star lands on the wrong item when two section boundaries cross the `-20%/-70%` band
together — on every case study.

The correct implementation (intersecting `Set` + topmost pick) already exists in
`components/HomeNav.tsx:49-66` — but that component is unmounted, so the good code is the
dead code and the naive version is what ships.

**Fix.** Port the `HomeNav` logic into `TOCObserver`.

### F-05 · `aria-modal` dialogs with no focus trap, no focus restore, no scroll lock
`components/PasswordModal.tsx:85-88`; `components/HamburgerMenu.tsx:147-162`;
`components/HeaderToolbar.tsx:91-113`; `components/GlobalToolbar.tsx:152-162`;
`components/music/MusicPlayerPanel.tsx:209`

Only `PasswordModal` manages focus at all — it stashes and restores `activeElement`
(`:30-33`), which is more than anything else does. But:

- **`PasswordModal`** declares `aria-modal="true"` with no Tab trap (its own comment at
  `:22-24` names the problem and then only fixes *initial* focus) and no body scroll lock.
- **`HamburgerMenu`** mobile sheet: `role="dialog" aria-modal="true"`, Escape handled
  (`:84-91`), but focus never enters the sheet, never returns to the trigger, page behind
  is neither `inert` nor scroll-locked — on iOS the background scrolls under an opaque
  full-screen sheet.
- **Portaled popovers** (theme palette, music player) set `aria-expanded` on the trigger
  but are appended to the end of `<body>`, so tabbing forward from the trigger lands in
  page content, not the panel. No `aria-controls`, no focus move, and the close handler is
  `pointerdown`-only (`HeaderToolbar.tsx:210-216`) so focus-out never closes them. **The
  theme picker and music player are effectively keyboard-inoperable.**
- `MusicPlayerPanel.tsx:209` puts `aria-label="Music player"` on a plain `motion.div` with
  no `role` — `aria-label` on a generic element is not exposed, so the label is silently
  dropped.

`ChangelogOverlay.tsx:28-35` already implements the body-scroll lock correctly; copy it.

### F-06 · Focus is never restored when the chat panel closes
`components/chat/ChatPanel.tsx:220-222`; `components/ChatFab.tsx:35`

ChatPanel focuses the textarea on mount. On close, `ChatFab` was *unmounted while open*
(`{!chatOpen && ...}`), so the element that previously had focus no longer exists — focus
falls to `<body>` and a keyboard user is dumped at the top of the tab order. The mobile
sheet also declares `aria-modal="true"` (`ChatBar.tsx:452`) with no trap.

**Fix.** Stash `document.activeElement` on open, restore on close; keep the FAB mounted
(animate opacity/visibility) or refocus it by ref.

### F-07 · `InsetScrubber` is a keyboard-inoperable slider
`components/music/InsetScrubber.tsx:42-49`

```tsx
role="slider" aria-label="Seek" aria-valuemin={0} aria-valuemax={max || 0}
aria-valuenow={value} tabIndex={0}
```

There is **no `onKeyDown` anywhere in the file**. It advertises itself as a slider, takes
focus, and does nothing for Arrow/Home/End — a focusable dead end. `aria-valuenow` is also
a raw float (e.g. `137.42`), read aloud verbatim; no `aria-valuetext`.

**Fix.** Add Arrow ±5s / Shift+Arrow ±30s / Home / End calling `onChange` + `onCommit`, and
`aria-valuetext={formatTime(value)}`.

### F-08 · Partially-streamed `<artifact>` markup renders as literal text
`components/chat/parseChatMarkup.tsx:23`, `:68-74`; `components/chat/ChatMessage.tsx:132`

`ARTIFACT_REGEX` is anchored to `$` and requires the closing `/>`. Mid-stream,
`turn.content` ends in something like `\n<artifact slug="joi` — no match, so
`extractArtifact` returns the raw text and the half-typed tag prints into the transcript
until the last chunk lands. The comment at `ChatMessage.tsx:149-151` claims this is
handled; it only gates the *card*, not the text.

**Fix.** While `streaming`, strip a trailing partial marker:
`raw.replace(/\n\s*<artifact[^>]*$/, "")`.

### F-09 · Side effect inside a state updater — `play()` can fire twice per click
`components/GlobalToolbar.tsx:37-42`

```ts
setMusicOpen((open) => {
  if (!open && session !== "active") void play();   // impure
  return !open;
});
```

Updater functions must be pure. React invokes them twice under StrictMode (dev) and may
re-invoke on re-render.

**Fix.** `const next = !musicOpen; if (next && session !== "active") void play(); setMusicOpen(next);`

### F-52 · `RoadmapEvolution`'s spine dots and hover popover use a stride that doesn't match the layout
`components/fb-showcase/RoadmapEvolution.tsx:441-445`, `:576`, `:528-558`, `:54`

```ts
// :443-445 — the comment admits it's a guess
// We use a rough estimate — 52px per node (32px chip + 20px gap)
const y = i * 52 + 26;
```
```ts
top: NODES.indexOf(hoveredNode) * 52 + 14,   // :576 — same constant
```

The actual DOM row (`:528`) is `className="flex flex-col gap-1"` containing **two**
children — a phase-label `<span>` *and* the chip `<span>` (`:534-556`), both on
`typescale.label` (11px) — inside a `flex flex-col` with `gap: NODE.gap` (20px, `:54`).
Real stride ≈ label line + 4px `gap-1` + chip (11px line + 12px padding + 2px border) +
20px container gap ≈ **62-68px**, not 52. The estimate counted the chip and the gap and
forgot the label line entirely.

The error compounds down the list: by the last node the spine dot sits well above its
node, and the `lg:` hover popover points at empty space instead of the node under the
cursor. Both are always-on visuals on the F&B case study.

*Ranked P1, not P0: it is visible, but it's positional drift on a decorative spine plus a
mispointed tooltip — nothing is unusable.*

**Fix.** Stop guessing; measure. Put a `useRef<(HTMLDivElement|null)[]>` on the node
wrappers, read `offsetTop + offsetHeight/2` in a `useLayoutEffect` + `ResizeObserver` into
a `nodeYs` array, and index both the dots and the popover off that. Cheaper alternative
that deletes the problem: render each dot as an absolutely-positioned child *inside* its
node row (`left:-20px; top:50%`) and drop the SVG dot loop entirely.

### F-53 · `DemoStage` fullscreen is `aria-modal` with no focus management at all
`components/DemoStage.tsx:738-745`, `:647-654`, `:849-856`

Escape is handled and body scroll is locked — but there is **no initial focus, no focus
trap, and no focus restore**. The only `inert` in the file (`:281`) inerts the *inline*
copy's prototype, not the page behind the portal.

This matters more here than usual: per `.claude/rules/specimens.md` the fullscreen copy is
the **only** interactive surface ("fullscreen is MANUAL ONLY — the visitor drives the
prototype"). A keyboard user opens it from the "Try demo" pill, their focus stays on the
pill *behind* the scrim, and Tab walks them through the whole page underneath while
`aria-modal` tells assistive tech the background doesn't exist. On close, focus lands on
`<body>`.

```ts
useEffect(() => {
  if (variant !== "fullscreen") return;
  const restore = document.activeElement as HTMLElement | null;
  dialogRef.current?.focus();                    // + tabIndex={-1} on the dialog div
  const onTab = (e: KeyboardEvent) => {
    if (e.key !== "Tab" || !dialogRef.current) return;
    const f = dialogRef.current.querySelectorAll<HTMLElement>(
      'button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])');
    if (!f.length) return;
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  };
  document.addEventListener("keydown", onTab);
  return () => { document.removeEventListener("keydown", onTab); restore?.focus?.(); };
}, [variant]);
```

### F-54 · `MediaPreviewLightbox` — no scroll lock, no focus management, no accessible content
`components/CaseStudyList.tsx:884-899`, `:905-912`, `:921`

Three defects in one component:

- **Body scroll is never locked.** Escape (`:905-912`) and backdrop click close it, but the
  page scrolls freely behind a full-viewport `fixed` overlay. `DemoStage.tsx:849-856` does
  lock — same codebase, opposite behaviour.
- **No focus trap, initial focus, or restore**, and **no visible close button** — the only
  affordances are backdrop click and Escape.
- **The dialog's entire content is hidden from AT**: `:921` is
  `<img src={media.image} alt="" />`. `alt=""` marks the sole content of a dialog labelled
  "Media preview" as decorative, so a screen reader announces an empty dialog.

**Fix.** Add the `document.body.style.overflow` lock keyed on `slug`; give the `<img>` a
real alt (thread `study.title` in, or look it up from `MARQUEE_DISPLAY[slug]?.title`); add
a close button and the trap/restore from F-53.

### F-55 · `ObjectFlowDiagram` puts all its interaction inside a `role="img"`
`components/fb-showcase/ObjectFlowDiagram.tsx:582-587`, `:673-682`, `:144`, `:588`

```jsx
<div className="scrollbar-hide w-full overflow-x-auto"
  onClick={() => (pinned ? setPinned(null) : setReplay((r) => r + 1))}
  role="img"
  aria-label={VIEW_META[view].aria}
>
```

`role="img"` prunes every descendant from the accessibility tree — but the descendants are
interactive (`:673-682` wires `onMouseEnter` / `onMouseLeave` / `onClick` on each anchor
card `<g>`). The `aria-label` literally instructs users to *"Hover or tap a food item to
trace every route its order can take"* (`:144`) — an affordance unreachable by keyboard or
AT, since the card `<g>` elements have no `tabIndex`, no `role`, and no `onKeyDown`.

Compounding: the container is `overflow-x-auto` around a `min-w-[820px]` child (`:588`)
with no `tabIndex={0}`, so below ~820px a keyboard user cannot scroll the diagram at all
(WCAG 2.1.1). This is the "pans with no visible affordance" gap already parked in
`docs/CURRENT-STATE.md`, but the keyboard half of it is worse than the visual half. And
because `onClick` sits on the scroll container, a click-after-drag on touch restarts the
whole entrance sequence.

**Fix.** Drop `role="img"` (keep the label on the `<svg>` as `role="group" aria-label`),
give each anchor `<g>` `tabIndex={0}` + `role="button"` + `onFocus`/`onBlur` mirroring the
hover handlers + `onKeyDown` for Enter/Space, and put `tabIndex={0}` on the scroll
container. Move the replay/unpin click onto the SVG background rect.

### F-56 · `Hero`'s home branch is reachable only during the About→home exit, and flashes a ghost wordmark
`components/HomeLayout.tsx:210`, `:224`; `components/Hero.tsx:342-346`, `:367-383`, `:101-148`

`<Hero>` is mounted at exactly **one** site (`HomeLayout.tsx:224`), inside the
`aboutMeOpen ? (...)` branch — and it's passed `aboutMeOpen={aboutMeOpen}`. But `Hero`
contains its own `AnimatePresence` keyed on the same flag:

```jsx
// Hero.tsx:342-346
<AnimatePresence mode="popLayout" initial={false}>
  {!aboutMeOpen ? (
    <motion.div key="hero-home" initial={false} ...>
```

So `!aboutMeOpen` can only ever be true **while the About page is exiting** (260ms). During
that window the home wordmark `<motion.h1>` (`:367-383`) mounts with `initial={false}` —
i.e. at full opacity — inside a parent fading to 0. Every "Return" press flashes a ghost
"Marco Sevilla" wordmark mid-fade, at the 48px fallback until `useFitWordmark` measures.

Two consequences follow from the same root:
- `useFitWordmark` (`:101-148`) runs only during that 260ms window, and writes
  `--wordmark-fontsize` on `document.documentElement` (`:131`) with **no cleanup** — a
  global CSS var left set by an element that no longer exists.
- `--wordmark-fontsize` has **no consumer outside `Hero.tsx`**. The comment at `:129-130`
  ("other sections e.g. the projects h2 can match") is stale — `HomeLayout` owns the name
  h1 now via `serifName` (`HomeLayout.tsx:267`).

**Fix.** Delete the `!aboutMeOpen` branch from `Hero`'s internal `AnimatePresence`, and
with it `useFitWordmark`, the `HERO_NAME` import, and the `initial/animate/tx` cascade.
`Hero` is the About page now; the branch is vestigial and its only live effect is the
flash. This also moots F-63.

---

## P2 — performance & robustness

### F-10 · `BackgroundTexture` is disabled but still installs global listeners on every page
`components/BackgroundTexture.tsx:16`, `:148-158`, `:296-314`, `:318`; mounted at `components/HomeLayout.tsx:185`

`DISABLED = true` (`:16`) makes the component `return null` at `:318` — but that early
return is **after** the hooks. Two effects only guard on `mounted`:

```ts
// :296-314 — runs even though the component renders nothing
window.addEventListener("mousemove", handleMouseMove);   // :307 — NOT passive
document.addEventListener("mouseleave", handleMouseLeave);
```
```ts
// :148-158 — a MutationObserver on <html> refreshing colors for a canvas that doesn't exist
observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class","style"] });
```

So every visitor to the homepage pays a non-passive `mousemove` handler on every pointer
move, plus a theme-change observer, for a component that was switched off on 2026-08-03
precisely for performance reasons. (The rAF effect at `:263` *does* correctly bail, because
`canvasRef.current` is null.)

**Fix.** `if (DISABLED) return;` at the top of both effects — or, better, stop mounting the
component in `HomeLayout` at all while the kill switch is on.

### F-11 · Nine always-on WebGL dither canvases, never gated on viewport
`components/CaseStudyList.tsx:652`; `components/FnbDitherFrame.tsx:39`;
`components/DitherBackdrop.tsx:173-189`;
`node_modules/@paper-design/shaders/dist/shader-mount.js:78`

One `DitherBackdrop` per case study (8 MDX studies) plus the F&B frame = **9 WebGL
canvases**, all mounted at once in the work marquee. I confirmed in the vendored library
that `ShaderMount` **does** handle `visibilitychange` (pauses on tab hide, line 78) but
contains **no `IntersectionObserver`** — so all nine keep rendering while scrolled
off-screen.

This corroborates the open item in `.claude/rules/homepage.md` ("GPU process ~53%") and
confirms the count is 9, not the 6 recorded in perf-backlog #6.

**Fix.** Wrap `DitherBackdrop` in an IntersectionObserver gate that unmounts (or sets
`speed={0}`) when the card is outside the viewport.

### F-12 · Each of those 9 canvases also runs a DOM probe + GPU readback on every theme change
`components/DitherBackdrop.tsx:93-130`

`useAccentColor` is a *per-instance* hook. Each of the 9 instances:

- appends its own hidden probe `<div>` to `document.body` (`:99`),
- creates its own 1×1 canvas (`:106-108`),
- registers its own `MutationObserver` on `document.documentElement` (`:121-124`),
- and on every theme flip runs `getComputedStyle` + `fillRect` + **`ctx.getImageData`**
  (`:110-117`) — a synchronous GPU readback — then `setAccent`, re-rendering the shader.

So one theme toggle fans out to 9 probe reads and 9 pixel readbacks, plus 3 more
`<html>` observers elsewhere (`CustomCursor.tsx:72`, `BackgroundTexture.tsx:153`,
`LedMatrix.tsx:1537`) — 12 observers on one attribute.

**Fix.** Hoist `useAccentColor` into a context provider resolved once, and have all nine
canvases consume the same value.

### F-13 · `npm run lint` is broken and the project has **no ESLint config at all**
`site/package.json` (`"lint": "next lint"`)

```
$ npm run lint
> next lint
Invalid project directory provided, no such directory: /Users/.../site/lint
```

`next lint` was removed in Next 16; the arg parser now reads `lint` as a directory name.
Separately, there is **no `eslint.config.*` and no `.eslintrc*`** anywhere in `site/`,
despite `eslint@9` and `eslint-config-next@16` sitting in `devDependencies`. The project
therefore has **zero lint enforcement** — which is why no hook-dependency or `<img>`
warnings have ever surfaced.

Eleven inline `eslint-disable` comments exist in the tree, suppressing rules that are not
configured anywhere.

**Fix.** Add `site/eslint.config.mjs`:
```js
import { FlatCompat } from "@eslint/eslintrc";
const compat = new FlatCompat({ baseDirectory: import.meta.dirname });
export default [...compat.extends("next/core-web-vitals"), { ignores: [".next/**"] }];
```
and change the script to `"lint": "eslint ."`.

### F-14 · Ten `exhaustive-deps` warnings, currently invisible
Running `react-hooks` rules manually with a temporary config (and `--no-inline-config`, to
see through the suppressions) produces exactly ten:

| File:line | Missing |
|---|---|
| `components/DemoStage.tsx:604` | `cursorTo` |
| `components/HomeNav.tsx:119` | `starY` |
| `components/ThemeToggle.tsx:330` | `setTheme`, `theme` |
| `components/case-study/InlineTOC.tsx:41` | `starY` |
| `components/chat/ChatPanel.tsx:61` | `words` |
| `components/dev/EditableOverlay.tsx:153` | `beginEditing`, `finishEditing` |
| `components/fb-showcase/RoadmapEvolution.tsx:300` | ref-in-cleanup capture |
| `components/fb-showcase/RoadmapEvolution.tsx:303` | `scheduleNext` |
| `components/fb-showcase/RoadmapEvolution.tsx:329` | `resumeAnim` |
| `lib/InlineEditorContext.tsx:379` | `sourceFiles` |

Most are deliberate mount-once effects. Worth triaging once F-13 lands, not before.

### F-15 · Capture-phase, non-passive `scroll` listeners doing layout reads + `setState`
`components/GlobalToolbar.tsx:142-147`; `components/HeaderToolbar.tsx:81-86`;
`components/PhotoStack.tsx:99-108`

```ts
window.addEventListener("scroll", update, true);   // third arg is useCapture — no options object, so no `passive`
```

All three are gated on an `open` flag, so they are not always-on — but while a popover or
the photo stack is open, each scroll event runs `getBoundingClientRect()` + a `setState`
with a fresh object identity. The **capture** flag matters: capture-phase `scroll` on
`window` fires for *every* scrollable descendant, including the work-marquee snap carousel
and each case study's `overflow-x` demo well. Flicking the marquee with the theme popover
open runs the full read + re-render cycle per frame.

`PhotoStack` is the worst — it also calls `getComputedStyle(el)` and reads five properties
**per scroll event** (`:84-91`) for a font that never changes, then fires **two**
`setState` calls, re-rendering the 6-image `motion.img` fan.

**Fix.**
```ts
let raf = 0;
const onScroll = () => { if (!raf) raf = requestAnimationFrame(() => { raf = 0; update(); }); };
window.addEventListener("scroll", onScroll, { passive: true, capture: true });
```
For `PhotoStack`, hoist the `getComputedStyle` read out of the scroll path entirely — it's
already captured on `handleEnter` (`:94-97`).

### F-16 · `ProgressBar` read → write → read layout thrash on every case study
`components/case-study/ProgressBar.tsx:9-21`, `:30`

```ts
const docHeight = document.documentElement.scrollHeight - window.innerHeight;  // forces layout flush
...
barRef.current.style.width = `${progress}%`;                                    // invalidates it
barRef.current.setAttribute("aria-valuenow", ...);
```

`scrollHeight` forces a style+layout flush; the subsequent style write invalidates it, so
the next scroll event pays again. Uncoalesced, on every case-study page. (Credit where due:
the listener *is* `{ passive: true }`.)

Two secondary bugs in the same file: no `resize` listener, so `docHeight` is stale after a
viewport change until the next scroll; and `setAttribute("aria-valuenow", …)` mutates an
attribute React also declares at `:30`, so any re-render silently resets it to 0.

**Fix.** Cache `docHeight`, recompute on `resize`, rAF-coalesce the write. Or replace the
component entirely with `animation-timeline: scroll()` + `scaleX`, which is compositor-only.

### F-17 · `LedMatrix` keeps a full-size WebGL loop running behind a 10px window
`components/music/MusicPlayerPanel.tsx:191`, `:224-230`; `components/LedMatrix.tsx:1497`

```tsx
const vizHeight = vizOpen ? VIZ_HEIGHT : revealed ? PEEK_HOVER : PEEK_REST;  // 10px collapsed
...
<motion.div animate={{ height: vizHeight }} className="relative overflow-hidden shrink-0">
  <LedMatrix height={VIZ_HEIGHT} />       // always 148px, always mounted
```

`LedMatrix` self-reschedules unconditionally (`:1497`) with no visibility gate, so
collapsing the visualizer leaves the shader rendering 148px of pixels inside a 10px
`overflow-hidden` box. Its own teardown is clean (`:1542-1553`) — the problem is that
nothing triggers it.

To be fair to this file: `LedMatrix` is otherwise the best-engineered component in the
tree. All three particle arrays are hard-capped (`MAX_SPARKLES 96`, `MAX_RIPPLES 16`,
`MAX_IDLE_WAVES 4` at `:30-32`, enforced at `:1079`, `:1529`), GL programs, buffers and
sim pairs are all deleted on unmount, and reduced-motion renders exactly one frame and
never self-reschedules.

**Fix.** Gate on `vizOpen`.

### F-18 · `currentTime` in the audio context re-renders `LedMatrix` four times a second
`lib/AudioPlayerContext.tsx:84`, `:258-302`

`onTime` sets `currentTime` on every `timeupdate` (~4 Hz) and `currentTime` is in the
`useMemo` dep array, so the context value changes identity 4×/s during playback.
Consumers: `GlobalToolbar.tsx:34`, `MusicPlayerPanel.tsx:174`, and **`LedMatrix.tsx:711`**
— a 1,563-line component re-rendered four times a second while its own rAF loop is already
running.

**Fix.** Split transport state (`isPlaying`, `currentTrack`, actions) from clock state into
two contexts so only the scrubber subscribes to time.

### F-19 · `AudioContext` and Web Audio nodes are never closed or disconnected
`lib/AudioPlayerContext.tsx:143-171`, `:102-110`

`ensureAudioGraph` creates an `AudioContext`, a `MediaElementAudioSourceNode` and an
`AnalyserNode` into refs. The only cleanup in the file (`:102-110`) removes media
listeners and pauses — it never calls `ctx.close()` or `.disconnect()`. The provider is
app-level so this rarely bites in prod, but Fast Refresh in dev walks straight into
Chrome's ~6-contexts-per-document ceiling.

Same cleanup, `:109`: `el.src = ""` makes the browser resolve `""` against the document URL
and **issue a media request for the current page**. Use
`el.removeAttribute("src"); el.load();`.

### F-20 · Rate-limited chat requests still burn the daily quota
`lib/chat/rate-limit.ts` (`checkRateLimit`)

```ts
const [m, d] = await Promise.all([getMinuteLimit().limit(ip), getDailyLimit().limit(ip)]);
```

Both limiters are always consumed, even when the minute window has already tripped. A user
who fires 12 messages in a minute gets 4 × 429 *and* spends 12 of their 60 daily.

**Fix.** Check the minute window first; only consume the daily on success.

### F-21 · `/api/chat` validates an unbounded array before rate-limiting
`app/api/chat/route.ts:29-40`, `:76-91`

`isValidMessages` iterates the entire array (`:31`), and the trim to 30 happens at `:91` —
*after* full-body parse and validation, and after the Upstash round trip. There is no cap
on `messages.length` and no body-size guard, so one unauthenticated POST can carry
100k × 2,000-char messages and force a full parse + O(n) validation before any limit
applies.

**Fix.** `if (messages.length > 100) return 400` at the top; move the length check ahead of
the per-item loop.

### F-22 · Route never enforces that the last message is a user turn
`app/api/chat/route.ts:96`

```ts
const safeMessages = trimmed[0]?.role === "assistant" ? trimmed.slice(1) : trimmed;
```

Only the *leading* assistant turn is stripped. The client fully controls the transcript, so
a crafted request can end on an `assistant` turn — an assistant-prefill vector for steering
the reply past the system prompt, plus fabricated "assistant said X" history. Locked-study
content isn't in the prompt (per `.claude/rules/chat.md`), so blast radius is limited, but
the guard is one line: require `safeMessages.at(-1)?.role === "user"`.

### F-23 · `localStorage` access in the theme provider is unguarded
`components/ThemeToggle.tsx:302`, `:311`, `:315-316`, `:328`, `:338`, `:381-386`

In Safari private browsing or with site data blocked, `localStorage` access **throws**.
These calls sit in the provider's mount effect (`:294-330`), so the throw aborts the effect
— and `HeaderToolbar.tsx:24` does `if (!themeState.mounted) return null;`, meaning the
light/dark toggle **silently never renders** for those users.
`LoadingOverlay.tsx:94-109` already wraps `sessionStorage` in try/catch; this file doesn't.

**Fix.** A `safeStorage` helper with try/catch around get/set/remove.

### F-24 · Hydration pop in the toolbar on every route
`components/HeaderToolbar.tsx:23-25`; `components/GlobalToolbar.tsx:69`

`if (!themeState.mounted) return null;` — the server renders the right cluster with only
the palette disc; after hydration the moon/sun button appears and pushes the disc ~32px
right inside the `justify-between` row. Visible shift on every page load.

**Fix.** Render a fixed-size placeholder (`<span className="bio-toolbar-btn" aria-hidden />`)
instead of `null`, so the box is reserved.

### F-25 · Spring animation drives a `setState` on every frame
`components/case-study/InlineTOC.tsx:28-31`

```ts
useMotionValueEvent(starY, "change", (y) => {
  setPassingIndex(Math.round(y / ROW_HEIGHT));
});
```

The point of a motion value is to keep the star off React's render path; deriving
`passingIndex` puts it right back. Every frame of the spring travel re-renders the whole
TOC list and all its `motion.span` children to nudge one link 4px.

**Fix.** `setPassingIndex(prev => prev === idx ? prev : idx)` — React bails on identical
state, cutting ~28 renders per travel to ~2.

### F-26 · `parseSseStream` never cancels the body reader on early `break`
`components/chat/parseStream.ts:42-58`; consumed at `ChatBar.tsx:219-238`

The `for await … break` calls the generator's `.return()`, but there is no `try/finally`,
so `reader.cancel()` is never invoked and the response body is left locked and undrained.
In practice the server closes right after `done` (`route.ts:134`), so impact is small — but
any path where the server holds the connection open leaks a socket.

**Fix.** `try { … } finally { await reader.cancel().catch(() => {}); }`

### F-27 · Chat panel wheel handler kills ctrl+wheel zoom
`components/chat/ChatPanel.tsx:236-241`

Registered `{ passive: false }` — correct for the intent — but it `preventDefault()`s
`ctrl+wheel` / pinch-zoom over the header and composer (WCAG 1.4.4).

**Fix.** Early-return on `e.ctrlKey`.

### F-28 · Client uploads the full transcript on every request
`components/chat/ChatBar.tsx:211`, `:65`

`body: JSON.stringify({ messages: [...turns, userTurn] })` — `turns` is unbounded. The
server trims to 30 (`route.ts:91`) but only after receiving everything, and `writeStored`
silently swallows the `sessionStorage` quota error once the transcript outgrows ~5 MB, so
persistence dies with no signal.

**Fix.** Trim client-side to the same 30 before both the fetch and the write.

### F-29 · `PixelRain` polls `getComputedStyle` at 6.7 Hz forever, in every tab
`components/PixelRain.tsx:99`, `:112-134`; mounted at `components/GlobalToolbar.tsx:93`

```ts
const id = window.setInterval(() => {
  if (!reduceMotion) step();
  draw();                       // repaints even when static, "so theme/hover ink stays live"
}, TICK_MS);                    // 150ms
```

`draw()` calls `getComputedStyle(canvas)` every tick (`:99`). There is no `document.hidden`
gate, and `setInterval` is throttled but not suspended in background tabs. Under
reduced-motion the pixels correctly hold still, but the interval keeps running purely to
poll for theme changes.

The canvas is only 30×20, so the cost is small — but it's unbounded in time and runs on
every route.

**Fix.** Skip the body when `document.hidden`; replace the polling repaint with the
`MutationObserver` on `<html>` that three other components already use; under
reduced-motion, draw once and clear the interval.

### F-30 · `three.js` ships 1 MB of production JS for a route that 404s in production
`app/dev/logo-lab/page.tsx`; `app/dev/logo-lab/LogoScene.tsx:10-18`; `site/package.json`

`/dev/logo-lab` calls `notFound()` when `NODE_ENV === "production"` — but the page is still
**built and emitted**. `.next/static/chunks/4b9372e41a86ea19.js` is **1,004,149 bytes** and
contains THREE + drei. It's route-split so homepage visitors don't download it, but it
ships in every deploy and dominates build time and install size.

Compounding: `three`, `@react-three/fiber` and `@react-three/drei` are in **`dependencies`**,
not `devDependencies`, and they are imported from exactly one file
(`app/dev/logo-lab/LogoScene.tsx`) — the drei→React-19 peer conflict is what forced the
`legacy-peer-deps=true` in `.npmrc` in the first place.

**Fix.** Exclude `app/dev/**` from the production build (a `pageExtensions` split, or move
the labs behind an env-gated route group), and move the three stack to `devDependencies`.

### F-31 · ~32 MB of orphaned assets ship in every deploy
`site/public/` — confirmed by cross-referencing every basename against `app/`, `components/`, `lib/`, `content/`

| Size | Path | Status |
|---|---|---|
| 16.7 MB | `public/videos/fb-mobile.mp4` | referenced **only in comments** (`FBOrderingContent.tsx:56`, `FnbCartSpecimen.tsx:5`) — replaced by the live specimen |
| 3.0 MB | `public/images/gallery/compendium/guest-experience-mobile.png` | no reference |
| 2.9 MB | `public/images/gallery/fb-ordering/fb-overview.png` | no reference |
| 2.4 MB | `public/images/gallery/fb-ordering/food-prep-bg.png` | no reference |
| 2.4 MB | `public/images/gallery/fb-ordering/food-bg.png` | no reference (the *live* one is `food-bg-2.webp`) |
| 2.3 MB | `public/images/gallery/compendium/guest-experience-app.png` | no reference |
| 2.0 MB | `public/images/gallery/upsells/upsells.png` | no reference (live: `upsells-mocks.webp`) |
| 1.3 MB | `public/images/gallery/fb-ordering/order-management-mock.png` | no reference |
| 896 KB | `public/images/gallery/fb-ordering/mobile-guest.png` | no reference (live: `mobile-guest-mock.webp`) |
| 488 KB | `public/images/gallery/fb-ordering/order-management-detail.png` | no reference |
| 320 KB | `public/images/gallery/fb-ordering/order-management.png` | no reference |

`public/` is 149 MB total (79 MB audio, 44 MB video, 25 MB images).

**Note before deleting:** `case-studies/fb-mobile-ordering-v2.md:132` lists several of
these as "unused assets ready now" for a planned content pass. Archive rather than `rm`.

### F-32 · Two ambient videos are 15–17 MB each
`app/work/compendium/CompendiumContent.tsx:92`; `lib/playground-cards.ts:32`

| File | Size | Resolution | Bitrate | Duration | Where |
|---|---|---|---|---|---|
| `guest-experience-dash.mp4` | **15.6 MB** | 1716×1080 | 4.9 Mbps | 25s | Compendium case study, autoplaying ambient loop |
| `photography-portfolio.mp4` | **8.0 MB** | 1600×894 | 2.3 Mbps | 28s | homepage playground card |
| `fb-guest-ordering.mp4` | 2.8 MB | 860×1872 | 516 kbps | 43s | (reference — this one is sized right) |

`AutoplayVideo` is well built — IntersectionObserver offscreen-pause, reduced-motion gate,
`preload="metadata"` so nothing downloads until the frame nears the viewport
(`components/AutoplayVideo.tsx:18-43`). But once a 25-second loop starts, the visitor pulls
15.6 MB. `fb-guest-ordering.mp4` proves the target: ~500 kbps is enough for this material.

**Fix.** Re-encode both at ~800 kbps / 1280px wide. Expect 15.6 MB → ~2.5 MB and
8.0 MB → ~2.8 MB.

### F-33 · `images.unoptimized: true` — real but modest cost
`site/next.config.mjs`

The flag is a leftover from the static-export era (the site is a server deployment now, so
it could simply be removed). Assessed cost:

- `next/image` is imported in only **3 files** (`CaseStudyHeroImage.tsx`,
  `fb-showcase/BrowserMockup.tsx`, `fb-showcase/MobileShowcase.tsx`); everything else uses
  plain `<img>`, which the flag wouldn't affect anyway.
- The largest *referenced* image is 568 KB (`public/images/general-task/research.webp`);
  most live assets are already WebP and under 250 KB.

So the loss is real — no responsive `srcset`, no AVIF, no per-breakpoint resizing — but it
is worth far less than F-31 and F-32. **Do those first.** Flipping the flag is a
low-risk follow-up once Vercel image transforms are acceptable.

### F-34 · `CursorGlowOverlay` forces a synchronous layout on every mousemove
`components/CursorGlowOverlay.tsx:29-33`, `:45`

```ts
const move = (e: MouseEvent) => {
  const rect = parent.getBoundingClientRect();          // read
  parent.style.setProperty("--mouse-x", `${e.clientX - rect.left}px`);  // write
  parent.style.setProperty("--mouse-y", `${e.clientY - rect.top}px`);   // write
};
parent.addEventListener("mousemove", move);              // :45 — not passive
```

The style write invalidates layout, so the next event's `getBoundingClientRect()` forces a
recalc — read → write → read, per mousemove, on the hovered work-grid card.

**Fix.** Cache the rect on `mouseenter` (and on `resize`), rAF-coalesce the writes, and pass
`{ passive: true }`.

### F-35 · `ChangelogOverlay` is mounted and serialized on every route but unreachable
`app/layout.tsx:143`; `components/HeaderToolbar.tsx:229-230`; `components/ChangelogOverlay.tsx:18`

`<ChangelogOverlay groups={getChangelog()} />` runs on every route, so the parsed changelog
is serialized into the RSC payload of every page — but its only trigger is commented out at
`HeaderToolbar.tsx:229-230`, so nothing can open it. It also has **no Escape handler**,
despite its own docstring at `:18` promising "Esc to close".

**Fix.** Either restore the trigger and add the Escape handler, or unmount it.

### F-36 · `AutoplayVideo` samples reduced-motion once and never re-reads
`components/AutoplayVideo.tsx:21`

```ts
if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
```

No `change` listener, no dependency — toggling the OS setting has no effect until a full
remount. `hooks/usePrefersReducedMotion.ts` subscribes correctly; use it.

Related: four separate `matchMedia` subscriptions for overlapping breakpoints exist across
`HamburgerMenu.tsx:74-81`, `PhotoStack.tsx:71-78`, `StudyMetaRow.tsx:67-73`,
`NavOverlay.tsx:69-75` — worth consolidating.

### F-37 · No `error` listener on the audio element
`lib/AudioPlayerContext.tsx:96-100`

`timeupdate`, `loadedmetadata`, `play`, `pause`, `ended` are wired; `error` is not. A 404 or
decode failure leaves `isPlaying: false`, `duration: 0`, `currentTime: 0` and a silent
`console.warn` from `play()` (`:189`) — the UI shows a track that simply never starts, with
no signal.

### F-57 · `ObjectFlowDiagram` never stops once it has been seen
`components/fb-showcase/ObjectFlowDiagram.tsx:355`, `:430-449`, `:457-465`, `:640`

```ts
const isInView = useInView(ref, { once: true, margin: "-80px" });   // :355
```

`once: true` means that after the first sighting it runs **forever**: the route engine
reschedules itself indefinitely (`:430-449`), SMIL dots re-`beginElement()` every leg
(`:457-465`), and ~50 connector paths carry a perpetual CSS animation (`:640`). There is no
offscreen pause and no `document.hidden` gate — I confirmed by grep that
`visibilitychange` / `document.hidden` appear in **exactly one file** in the entire tree
(`BackgroundTexture.tsx:165`, itself disabled). This stacks on top of F-11.

**Fix.** `once: false` (the component already restarts cleanly via `replay`/`stage`), and
gate the route-engine effect on a visibility flag:
`if (stage < 4 || !connsVisible || hidden) return;`

### F-58 · `ObjectFlowDiagram` grows an unbounded timer array while a card is pinned
`components/fb-showcase/ObjectFlowDiagram.tsx:428-449`, `:454`, `:679`

```ts
const timers: ReturnType<typeof setTimeout>[] = [];
const runRoute = () => {
  timers.push(setTimeout(() => {
    idx++;
    if (!userAnchor && idx >= DEMO.routesPerItem) setDemoIdx((d) => d + 1);
    else runRoute();                    // recurses with no dep change
  }, TIMING.dotTravel * 3 + TIMING.routeHold));
```

In demo-tour mode `setDemoIdx` changes `engineAnchor`, a dep (`:454`), so the effect
re-runs and `timers` is rebuilt. But when the user **pins** a card (`:679`), `userAnchor`
is truthy and the `else runRoute()` path recurses forever inside a single effect instance,
pushing ~5 fired-and-forgotten timeout ids onto the same array every ~3.3s. Ten minutes
pinned ≈ 900 retained ids, never pruned until teardown.

**Fix.** Keep one live handle instead of an array — a
`useRef<ReturnType<typeof setTimeout>>()` cleared before each new schedule — or reset
`timers.length = 0` at the top of each `runRoute()`.

### F-59 · A resize restarts a mid-flight `DemoStage` script and stalls it ~4s
`components/DemoStage.tsx:257-258`, `:604`, `:640`, `:76`

`cursorSize` is derived from the live fit scale:
```ts
const scale = variant === "fullscreen" ? fsScale : fitScale;
const cursorSize = Math.round(CURSOR_SIZE * scale);
```
and it appears in both `playScript`'s deps (`:604`) and the runner's (`:640`). So any
resize that moves `fitScale` enough to change the *rounded* cursor size disposes the
running script and restarts it from step 0 — against a prototype that is **not** reset
(`resetKey` is unchanged). The script then targets an element that no longer exists in the
current screen, burns the full `TARGET_TIMEOUT` (`:76`, 4000ms) in `waitForTarget`, returns
`false`, and only then remounts. Net: a visible ~4-second dead stall on resize.

**Fix.** The cursor size doesn't need to invalidate the script. Read it from a ref inside
`cursorTo` / the runner instead of closing over it, and drop `cursorSize` from both dep
arrays. (This also resolves the `cursorTo` warning in F-14.)

### F-60 · Two ResizeObserver callbacks that write to the box they observe
`components/DemoStage.tsx:317-345`, `:338`, `:794`; `components/Hero.tsx:109-133`, `:144`

`DemoStage.compute()` reads layout (`getComputedStyle(el)`, `el.clientWidth`) and then
writes state that changes **the observed element's own** `overflow-x`:
```ts
setPanning(stageWidth * floored > inner + 0.5);
```
→ `:794` `style={{ overflowX: panning ? "auto" : "visible" }}` on `wellRef`, which is the
element `ro.observe(el)` watches (`:338`). An observation callback that resizes the
observed box is the canonical source of *"ResizeObserver loop completed with undelivered
notifications"*. `.scrollbar-hide` (`app/globals.css:676-682`) keeps the width delta at
zero, which is why it hasn't bitten — but the dependency is real and one scrollbar-behaviour
change from oscillating.

`Hero.tsx:109-133` has the same shape and is worse: `fit()` writes
`--wordmark-fontsize: 100px`, then reads `clientWidth`/`scrollWidth`, then writes the final
value — a forced synchronous reflow, run from inside `new ResizeObserver(fit)` (`:144`) on
an element whose height that write changes.

**Fix.** *DemoStage*: move `overflow-x` onto a wrapper that is not observed, or early-return
when the computed values are unchanged. *Hero*: short-circuit if `next` equals the last
written value (or delete it per F-56).

### F-61 · `SystemArchitecture`'s "Orders" branch doesn't line up under "Items"
`components/fb-showcase/SystemArchitecture.tsx:425`, `:446-464`, `:421`

The top row sizes cells unequally:
```jsx
<div key={id} className="flex items-center" style={{ flex: id === "outlets" ? "none" : 1 }}>
```
`outlets` is `flex: none` (content width); the other three are `flex: 1` and each *also*
contains an `HConnector` inside that flex cell. The branch row below (`:446-464`) then
assumes four equal columns (`flex: 1` × 4). Four equal quarters ≠ the top row's
`[auto][1][1][1]` tracks, so the `VConnector` + Orders node land left of Items.
Desktop-only (`hidden lg:block`, `:421`).

**Fix.** Put both rows on one `grid-template-columns: auto repeat(3, 1fr)` and place the
Orders cell in column 3 — or give `outlets` `flex: 1` like its siblings.

### F-62 · Disclosure buttons without `aria-expanded`, collapsed content still in the a11y tree
`components/fb-showcase/SystemArchitecture.tsx:59-62`, `:80-83`

```jsx
<button onClick={onToggle} className="w-full flex items-center justify-between py-2 ...">
```
No `aria-expanded`, no `aria-controls` — the rotating `+` is the only state signal, and it's
visual-only. The panel collapses via `gridTemplateRows: open ? "1fr" : "0fr"` +
`overflow-hidden`, which clips visually but leaves the content exposed to screen readers.

**Fix.** `aria-expanded={open}` + `aria-controls={panelId}` on the button; `id={panelId}` on
the panel plus `inert` toggled after the 300ms transition (`hidden` would kill the
animation).

### F-63 · `useFitWordmark` stops measuring the text once the column is wider than it
`components/Hero.tsx:118-125`, `:360-364`, `:313`

```ts
const rawW = el.clientWidth;
const naturalW = el.scrollWidth;
const containerW = maxContainerPx ? Math.min(rawW, maxContainerPx) : rawW;
const scale = (containerW / naturalW) * widthFraction;
```

`el` is the wrapper `<div style={{width:"100%"}}>` (`:360-364`), not the `<h1>`.
`scrollWidth` is floored at `clientWidth`, so it equals the natural text width **only while
the text overflows**. Once the column is wider than the 100px-reference wordmark,
`naturalW === rawW` and the formula degenerates to `min(rawW, 468)/rawW` — a function of
column width, defeating the `maxContainerPx = 468` cap passed at `:313`. The wordmark then
renders progressively *smaller* as the column widens.

**Fix.** Measure the `<h1>` itself, or give the wrapper `width: fit-content`. Moot if F-56
is taken.

### F-64 · Specimen form inputs have no accessible name
`components/fb-showcase/OutletDetailsSpecimen.tsx:84-108`, `:421-442`, `:484-503`

The `Field` primitive renders its label as a `<span>` with no `htmlFor`/`id` pair and no
`aria-label`:
```jsx
<span style={{ ...TYPE.body, ... }}>{label}</span>
...
<input type="text" value={value} data-demo={demo} onChange={...} />
```
Same for the description `<textarea>` and the phone `<input>`. In the fullscreen
(interactive) copy every field announces as an unlabelled edit box.

This is a straight inconsistency: `FnbCartSpecimen.tsx:865` gets it right on the equivalent
primitive (`aria-label={label}` on `UnderlineField`'s input).

**Fix.** Add `aria-label={label}` to all five — one line each.

### F-65 · Order rows are `role="button"` with `tabIndex={-1}`
`components/fb-showcase/OrderDashboardSpecimen.tsx:160-163`

```jsx
<motion.div role="button" tabIndex={-1} data-demo={`row-${order.id}`} onClick={onOpen}
```
`tabIndex={-1}` is right for the inline copy — but the inline copy is *already* unreachable
via `DemoStage`'s `inert` (`DemoStage.tsx:281`). In the **fullscreen** copy this is the
primary interaction ("open an order") and no keyboard user can reach a row; there's no
`onKeyDown` for Enter/Space either.

**Fix.** `tabIndex={0}` + `onKeyDown`. The inline `inert` already removes them from the tab
order there, so nothing regresses.

### F-66 · Nested specimen modals have no Escape or focus handling, and Escape hits the wrong layer
`components/fb-showcase/FnbCartSpecimen.tsx:373-395`;
`components/fb-showcase/ItemLibrarySpecimen.tsx:550-563`; `components/DemoStage.tsx:649-651`

- `SheetShell` renders `role="dialog" aria-modal="true"` for both the item drawer and the
  stepper sheet, with no Escape handler and no focus trap.
- The delete-confirm scrim isn't a dialog at all: no `role`, no `aria-modal`, no Escape, no
  click-to-dismiss on the scrim. Only the two buttons close it.

In the fullscreen copy, Escape is captured by `DemoStage.tsx:649-651` and tears down the
**whole stage** while an inner sheet is open — wrong nesting.

**Fix.** Give each inner sheet its own `keydown` Escape handler with `e.stopPropagation()`;
add `role="dialog" aria-modal="true"` to the delete-confirm plus an
`onClick={() => setPendingDelete(null)}` on its scrim.

---

## P3 — hygiene, latent, nice-to-have

### F-38 · Dependency hygiene
`site/package.json`

- **`process@^0.11.10`** — the npm browser polyfill. **Zero imports** anywhere in the tree
  (the 35 grep hits are all `process.env`, which is Node/Next built-in). Remove.
- **`three` / `@react-three/fiber` / `@react-three/drei` / `@types/three`** in
  `dependencies` for a dev-only route — see F-30.
- **`agentation`** is a `devDependency` but is **statically imported** in
  `app/layout.tsx:40`. It works today because Vercel installs devDependencies, and the
  `process.env.NODE_ENV === "development" &&` guard at `:145` constant-folds so the JSX is
  eliminated — but a production-only install would break the build. Move it to
  `dependencies` or make the import dynamic.
- **`shadcn@4.5.0`** is a CLI package in `dependencies`, pulled in solely for
  `@import "shadcn/tailwind.css"` (`app/globals.css:3`). Works, but it's a large CLI
  shipped as a runtime dep.
- **`clsx` + `tailwind-merge`** back `lib/utils.ts`'s `cn()`, which has only **2 call
  sites** in the whole tree. Keep or inline, but know the ratio.

### F-39 · Version pins worth knowing about
- **React 18.3.1 under Next 16.1.6.** `npm ls` reports `invalid: "^19" from
  @react-three/drei, ">=19 <19.3" from @react-three/fiber` — papered over by
  `legacy-peer-deps=true` in `.npmrc`. Documented and deliberate, but it is the single
  largest upgrade risk in the project. Resolving F-30 removes the drei/fiber half of it.
- `@anthropic-ai/sdk` 0.92 → 0.115 (23 minors behind).
- `next` 16.1.6 → 16.3.0, `framer-motion` 11.18.2 → 13.0.0 (two majors).

### F-40 · `MobileNav`'s border doesn't follow the theme
`components/MobileNav.tsx:18` — `border-b border-border`. `@theme inline` at
`app/globals.css:796` maps Tailwind's `border-border` → shadcn's `--border`
(`oklch(0.922 0 0)`), **not** the portfolio's `--color-border` that `applyColoredTheme`
writes inline on `<html>` (`ThemeToggle.tsx:217`). Under any of the 10 colored themes this
bar keeps a neutral shadcn gray while every other border shifts. Every other border in
these files correctly uses `var(--color-border)`.

### F-41 · Redundant/conflicting ARIA on the palette trigger
`components/HeaderToolbar.tsx:133-135`, `:186-187` — `aria-pressed={open}` **and**
`aria-expanded={open}` on the same button. `aria-pressed` types it as a toggle,
`aria-expanded` as a disclosure; screen readers announce both. Keep `aria-expanded`.

### F-42 · `LockGate` card mode creates a duplicate tab stop
`components/LockGate.tsx:114-119` — a full-bleed `absolute inset-0` button
("In progress — click to preview") is layered over the original card, whose own link
remains in the DOM and in the tab order. Keyboard users hit two focus stops per card, one
invisible. `LockedFrameBadge` (`:128-153`) is `opacity-0` but not `aria-hidden`, so its
label is announced unconditionally.

### F-43 · `history.replaceState` drops query + hash
`components/HomeLayout.tsx:99` —
`window.history.replaceState(null, "", window.location.pathname)` discards every other
search param and the fragment. `/?about=1&utm_source=x` or `/?about=1#projects` lose the
extras.

### F-44 · Latent duplicate React key
`components/case-study/StudyMetaRow.tsx:60`, `:135`, `:146` —
`const pills = [...(STUDY_TAGS[slug] ?? []), role];` keyed by `key={pill}`.
`general-task` / `design-system` carry the tag `"Founding Designer"` while their role is
`"Founding designer"` — one casing edit away from duplicate keys and a reconciliation
break. Use `key={`${i}-${pill}`}`.

### F-45 · `FadeIn` ignores reduced-motion
`components/FadeIn.tsx:13-22` — `initial={{ opacity: 0, y: 12 }}` with no reduced-motion
branch, and no `<MotionConfig reducedMotion>` anywhere in `app/layout.tsx`. Framer's
default is `reducedMotion: "never"`, so the translate plays regardless. Every other
animated component in the tree gates on `usePrefersReducedMotion`.

Note there are **two** `FadeIn` components (`components/FadeIn.tsx` and
`components/case-study/FadeIn.tsx`) — fix both.

### F-46 · Unlabeled `<nav>` landmarks
`components/case-study/InlineTOC.tsx:55`, `components/MobileNav.tsx:18` — both unlabeled and
both present at lg+.

### F-47 · Dead components carrying real defects — mount or delete
Verified rendered **nowhere**: `HomeNav.tsx`, `NavOverlay.tsx`, `SiteHeader.tsx`,
`CyclingGreeting.tsx`. (These are *not* in the salvage docs, so they are fair game.)

- **`NavOverlay.tsx`** — if mounted it would ship a `position: fixed`, full-height,
  `zIndex: 120` invisible 18px click-strip down the left edge of every page (`:124-162`)
  that swallows clicks on anything beneath it; no Escape handler; no focus trap; and
  `HEADER_H = 44` (`:17`) offsetting for a `SiteHeader` that no longer mounts.
- **`CyclingGreeting.tsx:88`, `:97`, `:192-194`** — a single shared `cancelledRef` across
  effect runs: cleanup sets `true`, the new effect immediately sets it back to `false`, and
  the old loop parked in `await sleep(...)` resumes. Two concurrent loops then both call
  `setDisplay`, producing garbled interleaved text. `LoadingOverlay.tsx:111` does the
  per-run `let cancelled` correctly.
- **`HomeNav.tsx:61-63`** — a `getBoundingClientRect()` pair inside a sort comparator:
  forced layout, O(n log n). Fix it if this logic is ported to `TOCObserver` (F-04).
- **`SiteHeader.tsx:20`, `:27`** — `const headerHidden = false;` and
  `const showWordmark = true;` make both `AnimatePresence` blocks unconditional dead
  branches.

### F-48 · Dead state and uncleaned timers in `LoadingOverlay`
`components/LoadingOverlay.tsx:36`, `:59`, `:62`, `:209` — `setStarHere` is never called, so
the `starHere &&` guard at `:209` is always true; `"backspacing"` in the phase union is
unreachable. `sleep()` timers are never cleared on unmount (the `cancelled` flag correctly
prevents post-unmount `setState`, but timers stay pending).

### F-49 · Unused refs threaded through props
`components/HomeLayout.tsx:121-122`, `:138-144` — `wordmarkElRef` / `aboutMeHeaderElRef` are
written by callback refs and never read (the file's own comment says "kept as no-ops"), yet
still passed through `Hero` as props.

### F-50 · Smaller chat/audio items
- `app/api/chat/route.ts:119-123` — the abort listener is never removed on the success
  path. `once: true` plus per-request signal lifetime means it's GC'd, but the closure pins
  `aStream` until then.
- `route.ts:83-88` — the 429 carries `retryAfterSec` in the body but no `Retry-After`
  header.
- `route.ts:126-132` — `stop_reason: "max_tokens"` (cap is 1024) and `"refusal"` are never
  surfaced; the reply just stops mid-sentence with a normal `done`.
- `lib/audio-analysis.ts:87`, `:219-231` — `onsetIntervals` is written nowhere and read
  nowhere; `:219-231` are three empty `if`/`else` blocks with only comments. Dead code in
  the per-frame hot path.
- `lib/audio-analysis.ts:218`, `:238`, `:262`, `:264` — `beatStrength` is set on the onset
  frame then immediately decremented by `BEAT_DECAY` in the same `process()` call, so the
  reported peak is always `min(1, flux) − 0.06`. Decay before the onset check, not after.
- `components/chat/ChatMessageActions.tsx:37` — `setTimeout` with no cleanup.
- `components/chat/parseStream.ts:66` — `data += line.slice(5).trim()` concatenates
  multi-line `data:` fields without the spec-mandated `\n` join. Fine against the current
  server (`route.ts:47` emits one line), fragile if that changes.
- `components/music/MusicPlayerPanel.tsx:336` — `requestAnimationFrame` never cancelled.
- `lib/ChatOverlayContext.tsx:31`, `ChangelogOverlayContext.tsx:31`,
  `NavOverlayContext.tsx:32` — provider `value` is a fresh object literal each render.
- `lib/NavOverlayContext.tsx` — mounted at `app/layout.tsx:100` but nothing renders
  `<NavOverlay />`, so `navOpen` can never be true. Dead provider.

### F-67 · `Hero` accepts two props it never uses — with a latent trap
`components/Hero.tsx:266`, `:267`, `:286`, `:288`, `:150-256`;
`components/HomeLayout.tsx:230-231`; `components/LoadingOverlay.tsx:11`, `:90`

`hideStarForLoader` and `onStarMorphComplete` are destructured and typed but referenced
nowhere in the body — the only consumer, `PlaygroundStar` (`:150-256`), is defined and
never rendered. `HomeLayout` passes both.

Harmless today: `SKIP_INTRO = true` (`LoadingOverlay.tsx:11`) fires `onDone` (`:90`) which
sets `heroReady` anyway. **Latent:** `layoutId="hero-star"` in `LoadingOverlay` now has no
partner element, so flipping `SKIP_INTRO` to `false` yields a star that fades out instead
of morphing into the wordmark — contradicting the sequence documented in
`.claude/rules/homepage.md`. Worth a note in that rule file either way.

### F-68 · Smaller specimen items
- `components/fb-showcase/OrderDashboardSpecimen.tsx:528` — `flashId` is never cleared,
  so it stays set for the component's life. Every later remount into `in-progress` (tab
  switch forces one via `AnimatePresence key={tab}` at `:705`) replays the accent wash on an
  order that wasn't just approved.
- `components/fb-showcase/ItemLibrarySpecimen.tsx:71` — the checkbox announces a slug:
  ``aria-label={`Select ${itemId.replace(/-/g, " ")}`}`` reads "Select wagyu burger" while
  `TrashButton` (`:169`) correctly uses `itemName`. `item.name` is in scope at the call site
  (`:252`).
- `components/CaseStudyList.tsx:468-475` — `StudyMarquee.handleScroll` does
  `scroller?.querySelector(".work-marquee-cell")` then reads `cell.offsetWidth` on **every**
  scroll event. No write, so no thrash, but cache the stride in a ref and recompute on
  resize.
- `components/fb-showcase/FnbCartSpecimen.tsx:331` — `name={prompt}` on the radios. While
  fullscreen is open the inline copy is still mounted (`DemoStage.tsx:862-884` renders
  `children` twice), so both trees emit `<input type="radio">` with the same `name` in one
  document — one radio group. They're controlled so React forces `checked` back, but it's a
  known glitch source. Scope the name with a per-instance id.
- `components/fb-showcase/RoadmapEvolution.tsx:9-33` vs `:426-437` — the header comment
  describes arrows drawing and forking at pivots; the SVG only renders a static dashed spine
  that is full-height the moment `stage >= 1`, despite the comment "draws progressively with
  stage". Doc drift, not a bug.
- `components/fb-showcase/SystemArchitecture.tsx:428` — `label={i === 0 ? undefined : …}`
  inside a `{i > 0 && …}` guard; `i === 0` is unreachable.

### F-51 · Sitemap omits two live routes
`public/sitemap.xml` lists `/`, `/work/fb-ordering`, `/work/ai-workflow`. It correctly
excludes all six `LOCKED_SLUGS`, but also omits `/writing` and `/resume`, which are live and
unlocked.

---

## Things that are right — don't "fix" these

Worth recording so a future pass doesn't churn them:

- **`LedMatrix.tsx`** — every GL program, buffer and sim pair deleted on unmount
  (`:1542-1553`); all three particle arrays hard-capped (`:30-32`, `:1079`, `:1529`);
  reduced-motion renders exactly one frame and never self-reschedules (`:1497-1511`, with a
  comment explaining why). The only gap is F-17.
- **`AutoplayVideo.tsx`** — IntersectionObserver offscreen-pause with a sensible
  `rootMargin`, reduced-motion gate, `preload="metadata"`, clean `io.disconnect()`. Only
  gap is F-36.
- **`AudioPlayerContext`** — `preload = "metadata"` (`:80`) means none of the 79 MB of MP3s
  is fetched until a track is selected.
- **No hydration-mismatch risks found.** Every `Math.random()` / `Date` call in the tree is
  inside an effect or a rAF loop, never in render. `localStorage` reads are all in mount
  effects behind a `mounted` flag.
- **`proxy.ts`** — `SITE_GATE_ENABLED = false` (`lib/site-gate.ts:18`), so the site-wide
  password wall is correctly **off**. Not a finding; recorded because
  `.claude/rules/access-gating.md` flagged its state as unresolved on 2026-08-04.
- **`public/sitemap.xml`** correctly excludes every locked slug.

---

## Unverified suspicions

Not confirmed from source alone — reproduce before acting.

1. **Deep links to `/#projects` may be clobbered by `HomeLayout`'s mount-time
   `scrollTo(0)`** (`HomeLayout.tsx:148-150`). "Back" on every case study points at
   `/#projects` (`MobileNav.tsx:24`, `HamburgerMenu.tsx:192`, `InlineTOC.tsx:71`). On
   client-side nav Next's `ScrollAndFocusHandler` probably wins; on a **hard load or
   refresh** of `/#projects` the browser's fragment scroll happens pre-hydration and this
   layout effect may then smooth-scroll back to the top (compounding F-02). Repro: load
   `/#projects` in a fresh tab. If confirmed, gate on `!window.location.hash`.
2. **`useLayoutEffect` during SSR warnings** — `GlobalToolbar.tsx:127`,
   `HeaderToolbar.tsx:67`, `HomeLayout.tsx:148`, `StudyMetaRow.tsx:75`, `ChatBar.tsx:151`
   all call `useLayoutEffect` unconditionally in server-rendered components. React normally
   logs "useLayoutEffect does nothing on the server". Not confirmed against a running dev
   server.
3. **`ChatBar.tsx:257-260`** — the `finally` unconditionally does `setPending(false)` and
   `abortRef.current = null`. If a new submit starts inside the microtask window between
   `abort()` and the rejection landing, the stale `finally` could null the new controller.
   No reproduction constructed; the panel unmounts on close, which probably makes the
   window unreachable.
4. **`lib/chat/rate-limit.ts` `getIp`** takes the first value of `x-forwarded-for`. On hosts
   that *append* rather than replace XFF this is client-spoofable. Vercel is generally
   understood to set XFF to the real client IP, so this is likely fine as deployed —
   `x-vercel-forwarded-for` would be unambiguous. Not tested against the live deployment.
5. **`AudioPlayerContext.tsx:85`** — `duration` isn't reset when `currentIndex` changes, so
   between the track swap (`:119`) and the next `loadedmetadata` the scrubber may show the
   previous track's total. Not observed in a browser.
6. **`Testimonials.tsx:59-72`** — `measure` writes state from inside a `ResizeObserver`
   callback. The `> 1` threshold should damp it, but a font-size slider drag could plausibly
   produce "ResizeObserver loop completed with undelivered notifications". Not confirmed.
7. **`StudyMetaRow.tsx:75-94`** — pill widths measured once, deps `[slug, role]`, no
   `resize` / `ResizeObserver`. Fixed `fontSize: 12` means the type slider shouldn't move
   them, but a viewport resize that rewraps the row would leave `widths` stale. Needs a
   browser.
8. **Perceptibility of the F-56 ghost wordmark.** The mount/exit sequencing is verified from
   source; whether the flash is actually *visible* over a 260ms parent fade needs one
   Return-button click with the transition slowed. The dead-branch and the
   `--wordmark-fontsize` leak are confirmed regardless.
9. **Whether F-60's ResizeObserver feedback ever fires the console loop warning.**
   `.scrollbar-hide` almost certainly keeps the width delta at zero on Chromium and WebKit,
   and Firefox's `scrollbar-width: none` should too. The dependency is real; the symptom may
   never surface.
10. **Exact drift magnitude in F-52.** The ~62-68px stride was derived from
    `typescale.label` (11px) + padding + gaps, not measured in a browser. The
    misalignment is certain; the per-node pixel error is an estimate.
11. **`ObjectFlowDiagram` SMIL `beginElement()` on stale refs.** `dotRefs.current[i]`
    (`:650`) is written by a callback ref indexed by position; React's null-then-set
    ordering should keep it correct when the dot count drops 2→1, but this was traced by
    reasoning, not observation.

---

## Suggested order of work

Nothing here is urgent enough to block anything. If you want a sequence:

1. **F-01** — the only true P0, and a ~6-line fix.
2. **F-13** (ESLint config) — cheap, and it's the reason several of these went unnoticed.
3. **F-31 + F-32 + F-30** — one asset/bundle session, ~45 MB off the deploy, no code risk.
4. **F-10, F-02, F-09, F-29** — small, isolated, each a handful of lines.
5. **F-11 + F-12** (the 9 dither canvases) — the largest real perf win, and the one already
   sitting in perf-backlog #6. Biggest change, so it wants its own session.
6. The a11y cluster (**F-05, F-06, F-07, F-53, F-54, F-55, F-64, F-65**) — mostly the same
   focus-trap/restore helper applied in eight places. Write the helper once.

---

## Future technical opportunities

Not findings — things worth doing later, when there's appetite. Each is a project, not a
fix.

1. **A shared `useModal` / focus-trap primitive.** Eight `aria-modal` surfaces
   (`PasswordModal`, `HamburgerMenu`, `DemoStage` fullscreen, `MediaPreviewLightbox`,
   the chat sheet, the two portaled popovers, the specimen sheets) each hand-roll a
   different subset of {Escape, scroll lock, initial focus, trap, restore}. One hook with
   all five, applied everywhere, closes most of the a11y cluster permanently and stops the
   next modal from re-inheriting the gap.

2. **A `useVisible(ref)` hook wired into every animation loop.** Right now
   `visibilitychange` / `document.hidden` appears in exactly one file in the tree, and only
   `AutoplayVideo` and `DemoStage` gate on IntersectionObserver. A single hook returning
   `inViewport && !documentHidden`, adopted by `DitherBackdrop`, `LedMatrix`,
   `ObjectFlowDiagram`, `RoadmapEvolution` and `PixelRain`, would make "animations stop when
   you can't see them" a property of the codebase instead of a per-component decision.

3. **Bundle-size regression signal in CI.** Turbopack dropped the per-route size table, so
   nothing would catch a 1 MB dependency landing on the homepage. A tiny script that sums
   `.next/static/chunks` per route and fails on a threshold delta would restore it.

4. **A media pipeline.** `public/` is 149 MB and everything in it is hand-placed. A
   `npm run media` step that re-encodes videos to a target bitrate, converts PNGs to WebP/
   AVIF, and reports orphans would have prevented F-31 and F-32 from ever accumulating —
   and would make removing `images.unoptimized` (F-33) a non-event.

5. **React 19 + Next 16 alignment.** Removing the three.js/drei stack (F-30) eliminates the
   peer conflict that forced `legacy-peer-deps=true`. With that gone, the React 18 → 19
   upgrade becomes a normal migration rather than a risky one, and `.npmrc` can be deleted.

6. **Split `AudioPlayerContext` into transport + clock.** F-18 is the immediate reason, but
   the general pattern — a context whose value changes at animation frequency — is worth
   auditing for anywhere else it appears as the app grows.

7. **Retire or revive the dead components.** `HomeNav`, `NavOverlay`, `SiteHeader`,
   `CyclingGreeting` are mounted nowhere and are *not* in the salvage docs, so they sit in an
   ambiguous third state. `HomeNav` in particular holds the correct IntersectionObserver
   logic that `TOCObserver` is missing (F-04). Decide per component: port the good part and
   delete, or mount it.

8. **A `.claude/rules/` note on the two-copy demo pattern.** `DemoStage` renders `children`
   twice (inline + fullscreen), which is the root of F-68's radio-group collision and would
   silently break any component using a document-unique id, `name`, or `layoutId`. Worth
   writing down before the next specimen hits it.

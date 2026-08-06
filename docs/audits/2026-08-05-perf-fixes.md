# Performance fixes — 2026-08-05

Fixes for audit findings **F-11, F-12, F-17, F-18, F-19, F-29, F-34, F-36** from
`docs/audits/2026-08-05-technical-audit.md`.

| Finding | Status | Headline number |
|---|---|---|
| F-11 · 8 always-on WebGL dither canvases | **FIXED** | 2,408 → 598 shader frames / 5 s (**−75.2 %**) |
| F-12 · per-instance DOM probe + GPU readback | **FIXED** | 8 probes/observers/readbacks → **1** |
| F-17 · `LedMatrix` renders behind a 10 px window | **FIXED** | 241 → **0** GL draws / 4 s when collapsed |
| F-18 · `currentTime` re-renders `LedMatrix` 4×/s | **FIXED** | 30 → **0** LedMatrix renders / 4 s |
| F-19 · `AudioContext` never closed | **FIXED** | code-level (see caveat) |
| F-29 · `PixelRain` polls at 6.7 Hz forever | **FIXED** | 20 → **0** polls / 3 s off-screen and tab-hidden |
| F-34 · synchronous layout per mousemove | **FIXED** | −76 ms renderer task time / 120 mousemoves |
| F-36 · reduced-motion sampled once | **FIXED** | live OS flip now pauses videos + shaders |

`npx tsc --noEmit` clean after every step. `npm run build` succeeds (18 routes).
**0 console errors** on `/` (light + dark) and `/work/compendium`.

Files touched — all inside the assigned scope:
`site/components/DitherBackdrop.tsx`, `site/components/PixelRain.tsx`,
`site/components/LedMatrix.tsx`, `site/components/CursorGlowOverlay.tsx`,
`site/components/AutoplayVideo.tsx`, `site/components/music/MusicPlayerPanel.tsx`,
`site/lib/AudioPlayerContext.tsx`.
Nothing in `HomeLayout.tsx`, `BackgroundTexture.tsx`, `Hero.tsx`, `CaseStudyList.tsx`,
`globals.css` or `components/chat/**` was edited. `FnbDitherFrame.tsx` needed no change —
it consumes `DitherBackdrop`, so it inherited the gate for free.

---

## Measurement notes (the two traps)

Both traps in the audit were respected.

1. **DOM removal proves nothing.** `ShaderMount.render` is a bound arrow function holding
   `this.gl`; removing the canvas leaves the rAF loop drawing into a detached bitmap. So
   every A/B here is done by **instrumenting the render function itself**
   (`ps.render = (t) => { count++; return orig(t) }`) or by patching
   `WebGL2RenderingContext.prototype.drawArrays` and attributing draws to `this.canvas` —
   never by removing nodes.
2. **Busy-percentage absorbs freed slack.** All CPU numbers below are **absolute deltas**
   from CDP `Performance.getMetrics` (`TaskDuration`, `RecalcStyleDuration`,
   `LayoutDuration`), not percentages.

A third caveat worth recording: for F-11 the renderer-process `TaskDuration` delta is small
(0.157 s → 0.166 s over 5 s) because a Paper shader draw is *six vertices* — the cost is
almost entirely **fragment shading in the GPU process**, which renderer metrics don't see.
The right unit for F-11 is therefore frames drawn and pixels shaded, both reported below.

---

## F-11 · Nine always-on WebGL dither canvases, never gated on viewport

`site/components/DitherBackdrop.tsx`

### Before

```tsx
export default function DitherBackdrop({ seed, overrides }) {
  const accent = useAccentColor();
  const reducedMotion = useReducedMotion();

  if (!accent) return null;
  const params = { ...seededDitherParams(seed), ...overrides };

  return (
    <Dithering
      speed={reducedMotion ? 0 : params.speed}
      /* … */
      style={{ position: "absolute", inset: -8, zIndex: 0 }}
    />
  );
}
```

Every mounted instance ran its own rAF at 60 fps for the whole session. The vendored
`ShaderMount` pauses on `visibilitychange` (`shader-mount.js:78`) but has no
`IntersectionObserver`.

### After

```tsx
const VIEWPORT_ROOT_MARGIN = "200px";

function useInViewport(ref: RefObject<HTMLElement | null>): boolean {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") { setInView(true); return; }  // fail open
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting),
                                        { rootMargin: VIEWPORT_ROOT_MARGIN });
    io.observe(el);
    return () => io.disconnect();
  }, [ref]);
  return inView;
}

// …in the component:
const speed = reducedMotion || !inViewport ? 0 : params.speed;

return (
  <div ref={hostRef} style={{ position: "absolute", inset: -8, zIndex: 0 }}>
    {accent && <Dithering speed={speed} /* … */ style={{ position: "absolute", inset: 0 }} />}
  </div>
);
```

### Why `speed={0}` and not unmount

Verified against the vendored library rather than assumed:

* `setSpeed(0)` → `setCurrentSpeed(0)` → `cancelAnimationFrame(this.rafId); this.rafId = null`
  (`node_modules/@paper-design/shaders/dist/shader-mount.js:335-349`). The loop stops
  **completely** — this is a supported first-class state, documented in the library's own
  comment: *"If set to 0, rAF will stop entirely so static shaders have no recurring
  performance costs."*
* `render()` does not clear on the paused path, so the canvas keeps its last frame — the
  art holds still instead of going blank.
* Resuming sets `lastRenderTime = performance.now()` before the first frame, so `dt` does
  not accumulate across the pause — **no time jump** when a card scrolls back in.
* Unmounting would `dispose()` the GL context and re-`initProgram` on scroll-back (a
  visible re-initialisation flash) and would churn the browser's per-document WebGL context
  budget.

### Structural note

The observer needs a node, and `Dithering` is `memo(function …)` — **not** `forwardRef` — on
React 18.3.1, so a ref cannot be attached to it. The geometry that used to live on the
shader's own div (`position:absolute; inset:-8; zIndex:0`) moved to a host `<div>` that owns
the ref; the shader div now sits at `inset: 0` inside it. Paint order is unchanged: the host
creates the same stacking context the shader div used to, and the canvas keeps its
`z-index:-1` inside the shader div's `isolation: isolate`.

### Measurements

Instrumented `ShaderMount.render`, homepage at 1440×900.

| Condition | Shader frames / 5 s | Note |
|---|---|---|
| **BEFORE** (all mounts forced back to their authored speed) | **2,408** (8 × 301) | every canvas at 60 fps |
| **AFTER** (gate on, marquee at `scrollLeft: 0`) | **598** (2 × 299) | only the 2 visible cards |

**−75.2 % of shader frames.** Per frame each canvas is 2036×1660 = 3.38 Mpx of fragment
shading, so the six parked canvases stop ≈ **1.2 Gpx/s** of GPU fragment work.

Renderer main thread over the same windows: `TaskDuration` 0.166 s → 0.157 s,
`ScriptDuration` 0.022 s → 0.019 s. Small, as expected — see the caveat above.

Gate follows both scroll axes:

| Situation | Frames / 2–3 s, per mount (index: frames) |
|---|---|
| Page top, marquee `scrollLeft: 0` | 0:180 1:180 2:0 3:0 4:0 5:0 6:0 7:0 |
| Marquee scrolled to `scrollLeft: 2200` | 0:0 1:0 2:0 **3:119 4:119 5:119** 6:0 7:0 |
| Page scrolled to `y: 3000` (marquee off-screen) | all **0** |

Correctness: each of the 8 mounts was scrolled into view in turn and every one resumed at
its own seeded speed (0.150, 0.136, 0.168, 0.142, 0.236, 0.172, 0.154, 0.150) — the seeded
variation contract is intact. Screenshots taken in both light and dark confirm the art
renders identically.

---

## F-12 · Per-instance DOM probe + GPU readback on every theme change

`site/components/DitherBackdrop.tsx`

### Before

`useAccentColor()` was a per-instance hook. Each of the mounted backdrops appended its own
hidden probe `<div>` to `document.body`, created its own 1×1 canvas, registered its own
`MutationObserver` on `<html>`, and on every `<html>` attribute mutation ran
`getComputedStyle` + `fillRect` + a synchronous `ctx.getImageData` GPU readback, then
`setAccent`.

### After

A module singleton with ref-counted subscription. One probe, one observer, one readback per
theme change, fanned out to every consumer. Resolution logic is byte-identical (same probe
style, same `getImageData` normalisation) — only the ownership changed.

```ts
const accentListeners = new Set<AccentListener>();
let accentValue: string | null = null;
let stopAccentResolver: (() => void) | null = null;

function startAccentResolver() {
  /* one probe div, one 1×1 canvas, one MutationObserver on <html> */
  const resolve = () => {
    const raw = getComputedStyle(probe).color;
    let next = raw;
    if (ctx) { ctx.fillStyle = raw; ctx.fillRect(0, 0, 1, 1);
               const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
               next = `#${[r, g, b].map(v => v.toString(16).padStart(2, "0")).join("")}`; }
    if (next === accentValue) return;          // <html> also mutates for font-size/scroll-lock
    accentValue = next;
    accentListeners.forEach(l => l(next));
  };
  /* … */
}

export function useAccentColor(): string | null {
  const [accent, setAccent] = useState<string | null>(null);
  useEffect(() => subscribeAccent(setAccent), []);
  return accent;
}
```

An extra guard beyond the finding: `<html>` mutates for reasons other than the palette
(font-size offset, scroll-lock inline styles). The `next === accentValue` short-circuit means
those mutations no longer wake eight shaders with a redundant `setUniforms` + `render`.

### Measurements

| | Before | After |
|---|---|---|
| Probe `<div>`s in `<body>` | 8 | **1** (measured live: `probes: 1`) |
| `MutationObserver`s on `<html>` from this file | 8 | **1** |
| `getImageData` readbacks per theme flip | 8 | **1** |

Resolved value verified identical across all 8 canvases and correct per theme:
dark `[78,78,78,255]` → light `[186,186,186,255]`, a single distinct value in the set both
times. Toggled with the real header control, 0 console errors.

---

## F-17 · `LedMatrix` keeps a full-size WebGL loop running behind a 10 px window

`site/components/LedMatrix.tsx`, `site/components/music/MusicPlayerPanel.tsx`

### Before

```tsx
// LedMatrix.tsx — self-rescheduled unconditionally
if (!reducedMotion) raf = requestAnimationFrame(draw);
…
raf = requestAnimationFrame(draw);
```

```tsx
// MusicPlayerPanel.tsx
const vizHeight = vizOpen ? VIZ_HEIGHT : revealed ? PEEK_HOVER : PEEK_REST;  // 10px collapsed
<motion.div animate={{ height: vizHeight }} className="relative overflow-hidden shrink-0">
  <LedMatrix height={VIZ_HEIGHT} />       // always 148px, always rendering
```

### After

```tsx
function LedMatrix({ height = DEFAULT_HEIGHT, active = true }) {
  const activeRef = useRef(active); activeRef.current = active;
  const resumeRef = useRef<(() => void) | null>(null);
  …
  //  inside draw():
  if (!reducedMotion && activeRef.current) raf = requestAnimationFrame(draw);
  else raf = 0;
  …
  resumeRef.current = () => { if (raf) cancelAnimationFrame(raf); raf = requestAnimationFrame(draw); };
  if (activeRef.current) raf = requestAnimationFrame(draw);
  …
  useEffect(() => { if (active && !reducedMotion) resumeRef.current?.(); }, [active, reducedMotion]);
}
```

```tsx
<LedMatrix height={VIZ_HEIGHT} active={vizOpen} />
```

`active` is deliberately **not** in the GL effect's dependency array. Putting it there would
tear down and rebuild the whole WebGL context on every collapse — replaying the boot fade,
dropping the ping-pong sim textures and every particle. Parking the loop keeps all of that
alive, so re-expanding is instant and picks up mid-animation.

Time handling was checked before committing to a park: `draw` ages every effect from the
absolute `now` it receives (`now - sp.t0`, `now - w.t0`, `(now - t0) / BOOT_FADE_MS`) with no
accumulated-`dt` integrator, so a pause behaves exactly like a hidden tab — expired sparkles
and ripples are culled on the first resumed frame and the idle-wave scheduler fires once
immediately. No visual jump, no state corruption.

### Measurements

Music player opened (playback started), `WebGL2RenderingContext.prototype.drawArrays` patched
and attributed to the LED canvas.

| Visualizer state | Box height | GL draws / 4 s | Audio |
|---|---|---|---|
| Open | 148 px | **241** | playing |
| **Collapsed** | 10 px | **0** | playing |
| Re-expanded | 148 px | **240** | playing |

Playback was uninterrupted across all three windows (`aria-label="Pause"` present
throughout), and the matrix resumed at full rate with no re-boot.

---

## F-18 · `currentTime` re-renders the 1,563-line `LedMatrix` four times a second

`site/lib/AudioPlayerContext.tsx`, `site/components/music/MusicPlayerPanel.tsx`,
`site/components/LedMatrix.tsx`

### Before

`currentTime` lived in the same `useMemo` as the transport, so the context value changed
identity on every `timeupdate` and every consumer re-rendered — `GlobalToolbar`,
`MusicPlayerPanel`, and `LedMatrix`.

### After

Two changes, both minimal:

```tsx
// lib/AudioPlayerContext.tsx — clock split out of the transport value
const ClockCtx = createContext<number>(0);

const value = useMemo<AudioPlayerState>(() => ({ /* no currentTime */ }),
  // `currentTime` is deliberately NOT here — see ClockCtx (audit F-18).
  [currentIndex, currentTrack, isPlaying, duration, session, overlayOpen, /* … */]);

return (
  <Ctx.Provider value={value}>
    <ClockCtx.Provider value={currentTime}>{children}</ClockCtx.Provider>
  </Ctx.Provider>
);

export function useAudioClock(): number { return useContext(ClockCtx); }
```

```tsx
// components/LedMatrix.tsx
export default memo(LedMatrix);
```

`children` is a stable element reference, so a clock tick re-renders only `ClockCtx`
consumers. `MusicPlayerPanel` is the single subscriber (`useAudioClock()`), and `memo` stops
its 7.5 Hz re-render from cascading into `LedMatrix`. `LedMatrix` still subscribes to
`useAudioPlayer()` directly, so a genuine track/transport change re-renders it as before —
`memo` only drops the parent-driven churn. `GlobalToolbar` (`{ session, isPlaying, play }`)
needed no change and now stops re-rendering during playback too.

### Measurements

Music playing, 4 s window, counters temporarily injected into both component bodies and
removed afterwards.

| | `MusicPlayerPanel` renders | `LedMatrix` renders |
|---|---|---|
| **BEFORE** (`memo` removed, A/B) | 30 | **30** |
| **AFTER** | 30 | **0** |

30 renders / 4 s ≈ 7.5 Hz — Chrome fires `timeupdate` a little faster than the 4 Hz the
audit assumed. Either way, a 1,563-line component that already runs its own rAF loop now
re-renders **zero** times during steady-state playback.

---

## F-19 · `AudioContext` and Web Audio nodes are never closed or disconnected

`site/lib/AudioPlayerContext.tsx`

### Before

```ts
return () => {
  /* … removeEventListener × 5 … */
  el.pause();
  el.src = "";              // resolves against the document URL → media request for this page
};                          // AudioContext / source / analyser: never closed, never disconnected
```

### After

```ts
return () => {
  /* … removeEventListener × 5 … */
  el.pause();
  el.removeAttribute("src");
  el.load();
  try {
    sourceRef.current?.disconnect();
    analyserRef.current?.disconnect();
    const ctx = audioCtxRef.current;
    if (ctx && ctx.state !== "closed") void ctx.close().catch(() => {});
  } catch { /* already torn down */ }
  sourceRef.current = null;
  analyserRef.current = null;
  audioCtxRef.current = null;
  freqDataRef.current = null;
  timeDataRef.current = null;
};
```

**Caveat, stated plainly:** this cleanup only runs when the provider unmounts, which in
practice means a Fast Refresh in dev or a full page teardown. It is therefore **not
A/B-measurable in a Playwright session** — the provider is app-level and never unmounts
during navigation. What was verified is that playback, the analyser feed and the visualizer
are unaffected by the change (GL draws respond to audio, transport works, 0 console errors).

---

## F-29 · `PixelRain` polls `getComputedStyle` at 6.7 Hz forever, in every tab

`site/components/PixelRain.tsx`

### Before

```ts
draw();
const id = window.setInterval(() => {
  if (!reduceMotion) step();
  draw();                       // getComputedStyle(canvas) every tick
}, TICK_MS);                    // 150 ms, forever, on every route, in every tab
return () => window.clearInterval(id);
```

### After

The interval is now **torn down**, not merely skipped, whenever the canvas is off-screen or
the tab is hidden:

```ts
let id = 0;
const start = () => { if (id) return; draw(); id = window.setInterval(() => {
  if (!reduceMotion) step();
  draw();
}, TICK_MS); };
const stop = () => { if (!id) return; window.clearInterval(id); id = 0; };

let onScreen = true;
const sync = () => (onScreen && !document.hidden ? start() : stop());

const io = typeof IntersectionObserver === "undefined" ? null
  : new IntersectionObserver(([entry]) => { onScreen = entry.isIntersecting; sync(); },
                             { rootMargin: "100px" });
io?.observe(canvas);
document.addEventListener("visibilitychange", sync);
sync();
```

Plus a reduced-motion short-circuit in `draw()` — under reduced motion the cells never move,
so an unchanged ink means the repaint is a no-op:

```ts
let lastInk: string | null = null;
const draw = () => {
  const ink = getComputedStyle(canvas).color;
  if (reduceMotion && ink === lastInk) return;
  lastInk = ink;
  /* … */
};
```

### What I deliberately did *not* do

The finding suggests replacing the polling repaint with a `MutationObserver` on `<html>`.
**That would visibly regress the hover ink.** The glyph draws in `currentColor`, and its
trigger button carries `transition: color 150ms ease` (`globals.css` `.bio-toolbar-btn`, and
the toolbar button's own `transition-colors duration-150`). A one-shot read fired on a
hover/theme *event* latches the colour from before the transition runs — the glyph would sit
at the old ink for 150 ms and then never catch up. Polling at the animation cadence is
precisely what keeps the hover ink correct, and once the interval only exists while the glyph
is visible, it costs nothing. This is the "at minimum" option the brief sanctioned, chosen on
purpose rather than by default.

### Measurements

`window.getComputedStyle` patched to count calls against the 30×20 glyph canvas.

| Condition | Polls / 3 s |
|---|---|
| Toolbar on screen, tab visible | 20 (6.7 Hz — unchanged, correct) |
| **Toolbar scrolled away** (`y: 3000`) | **0** |
| Scrolled back to top | 20 (resumes) |
| **Tab hidden** (`document.hidden` faked + `visibilitychange`) | **0** |
| Tab visible again | 20 (resumes) |

The toolbar is in-flow at the top of every route, so it scrolls away on essentially every
page view — this is not a theoretical win.

---

## F-34 · `CursorGlowOverlay` forces a synchronous layout on every mousemove

`site/components/CursorGlowOverlay.tsx`

### Before

```ts
const move = (e: MouseEvent) => {
  const rect = parent.getBoundingClientRect();                          // read
  parent.style.setProperty("--mouse-x", `${e.clientX - rect.left}px`);  // write
  parent.style.setProperty("--mouse-y", `${e.clientY - rect.top}px`);   // write
};
parent.addEventListener("mousemove", move);                             // not passive
```

### After

```ts
let rect: DOMRect | null = null;
let raf = 0, lastX = 0, lastY = 0;

const measure = () => { rect = parent.getBoundingClientRect(); };
const flush = () => {
  raf = 0;
  if (!rect) return;
  parent.style.setProperty("--mouse-x", `${lastX - rect.left}px`);
  parent.style.setProperty("--mouse-y", `${lastY - rect.top}px`);
};
const move = (e: MouseEvent) => {
  lastX = e.clientX; lastY = e.clientY;
  if (!raf) raf = requestAnimationFrame(flush);
};
const scrollOpts = { passive: true, capture: true } as const;
const enter = (e: MouseEvent) => {
  setIsHovered(true); measure(); lastX = e.clientX; lastY = e.clientY; flush();
  window.addEventListener("scroll", measure, scrollOpts);   // only while hovered
  /* … existing transform … */
};
const leave = () => { /* … */ window.removeEventListener("scroll", measure, scrollOpts);
                      if (raf) { cancelAnimationFrame(raf); raf = 0; } };

parent.addEventListener("mousemove", move, { passive: true });
window.addEventListener("resize", measure, { passive: true });
```

The scroll listener is attached on **enter** and removed on **leave** — one card is hovered
at a time, so this never becomes N global scroll listeners. Caching pre-transform is also
marginally *more* correct than the old code: the CSS gradient is painted in the element's own
coordinate space, so the layout rect is the right basis, not the `scale(1.005)`-inflated one.

### Measurements

120 synthetic mousemoves over a hovered 494×400 work card, CDP absolute deltas. The "before"
row re-attaches a handler with the exact pre-fix shape on the same element, so it measures
the *marginal* cost of the old pattern.

| | `getBoundingClientRect` calls | Forced layouts | Style-recalc time | Renderer `TaskDuration` |
|---|---|---|---|---|
| **AFTER** | **0** | 0 | 57.8 ms | 319.9 ms |
| **BEFORE** (old handler layered on) | 120 | 0 | 71.9 ms | 395.9 ms |

**−76 ms of renderer task time and −14 ms of style recalc per 120 mousemoves** (≈0.63 ms per
event), and 120 `getBoundingClientRect` calls eliminated. `LayoutCount` stayed 0 in both
runs: on this element the custom-property write invalidates *style*, not box layout, so the
thrash lands in `RecalcStyleDuration` rather than `LayoutDuration` — reported here as
measured rather than as the audit predicted.

---

## F-36 · `AutoplayVideo` samples reduced-motion once and never re-reads

`site/components/AutoplayVideo.tsx`

### Before

```tsx
useEffect(() => {
  const el = ref.current;
  if (!el) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;   // sampled once
  const io = new IntersectionObserver(/* … */, { threshold: 0.2, rootMargin: "50% 0px 50% 0px" });
  io.observe(el);
  return () => io.disconnect();
}, []);

return <video ref={ref} loop muted playsInline preload="metadata" {...props} />;
```

### After

```tsx
const prefersReducedMotion = usePrefersReducedMotion();   // hooks/usePrefersReducedMotion.ts
const managePreload = preload === undefined;

useEffect(() => {
  /* preload observer at PRELOAD_MARGIN, then: */
  if (prefersReducedMotion) { el.pause(); return () => preloadIo?.disconnect(); }
  /* play observer at PLAY_MARGIN */
}, [prefersReducedMotion, managePreload]);

return <video ref={ref} loop muted playsInline
              preload={managePreload ? "none" : preload} {...props} />;
```

### Preload deferral (the F-32 half of the brief)

Two bands instead of one:

```ts
const PLAY_MARGIN    = "50% 0px 50% 0px";    // unchanged — start playback half a viewport out
const PRELOAD_MARGIN = "150% 0px 150% 0px";  // promote none → metadata a viewport and a half out
```

The element now renders `preload="none"`, and a second `IntersectionObserver` promotes it to
`preload="metadata"` (+ `el.load()`) a viewport and a half out — *ahead* of the play band, so
the first frame is decoded before playback starts and nothing about the fast-scroller fix
regresses. The promotion is guarded (`if (el.paused && el.readyState === 0) el.load()`) so it
can never interrupt an in-flight fetch or playback if the play observer fires first on a deep
link. Preload management is skipped entirely when the caller passes an explicit `preload`.

Verified on the homepage: `custom-wrapped.mp4` (top: 2593 in a 900 px viewport, outside the
band) stayed at `preload="none"`, `readyState: 0`, **zero network requests** until scrolled
into range, then promoted to `metadata` and played normally. Videos inside the band
preloaded as before.

**Not done, on purpose:** the 15.6 MB `guest-experience-dash.mp4` and 8.0 MB
`photography-portfolio.mp4` were **not re-encoded** — the brief explicitly forbids touching
media files. F-32's real fix (~800 kbps / 1280 px wide, 15.6 MB → ~2.5 MB) is still open and
belongs to whoever owns the asset pipeline. What is fixed here is the *eager* part: a video
outside the preload band costs the visitor nothing at all.

### Measurements

Live `emulateMedia({ reducedMotion })` flips, no reload:

| | Videos playing | Dither shader speeds |
|---|---|---|
| `no-preference` (initial) | 2 of 5 | 0.150 / 0.136 + six parked |
| → `reduce` (live flip) | **0 of 5** | **all 8 → 0** |
| → `no-preference` (live flip back) | 2 of 5 | 0.150 / 0.136 + six parked |

Pre-fix, the `reduce` flip did nothing until a full remount.

---

## Verification summary

* `cd site && npx tsc --noEmit` — clean after every individual fix and at the end.
* `cd site && npm run build` — **succeeds**, 18 routes, no new warnings.
* Console errors: **0** on `/` in light, `/` in dark, and `/work/compendium`.
* All 8 dither backdrops scrolled into view one at a time, in both themes, each resuming at
  its own seeded speed; screenshots confirm the art is unchanged.
* Music player: opened, played, visualizer collapsed and re-expanded, scenes reachable —
  playback uninterrupted throughout.
* Temporary instrumentation (`TEMP-PERF-PROBE` render counters, `TEMP-AB-NOMEMO`) was added
  only for the A/B runs and removed; `grep` confirms nothing remains in the tree.

## Not done, and why

| | Reason |
|---|---|
| Re-encoding the two 15–17 MB ambient videos (F-32 proper) | Out of scope — the brief forbids re-encoding or deleting media. Only the eager-download half was addressed. |
| Replacing `PixelRain`'s poll with a pure `MutationObserver` | Would latch the pre-transition colour and visibly break the hover ink (150 ms `transition: color`). Gated the interval instead. |
| Consolidating the four overlapping `matchMedia` subscriptions (`HamburgerMenu`, `PhotoStack`, `StudyMetaRow`, `NavOverlay`) | Noted under F-36 as "related", but all four files are outside the assigned scope. |
| Unmounting off-screen `DitherBackdrop`s instead of pausing | Causes a GL re-init flash on scroll-back and churns the WebGL context budget. `speed={0}` fully stops the rAF, which is what matters. |
| The three other `<html>` `MutationObserver`s the audit counts (`CustomCursor`, `BackgroundTexture`, `LedMatrix`) | Only the `DitherBackdrop` fan-out (8 → 1) was in scope. `LedMatrix`'s is one observer for one component and is fine; the other two files are owned by other agents. |

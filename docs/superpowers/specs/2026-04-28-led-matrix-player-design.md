# LED Matrix Audio Player — Design Spec

**Date:** 2026-04-28
**Author:** Marco + Claude (brainstorm session)
**Status:** Draft — awaiting user approval before implementation plan

## 1. Overview

The homepage's LED dot grid (`LedMatrix`) becomes the entire audio player surface. All transport controls, song info, scrubber, and visualizer scene picker are rendered as lit dots on the grid itself — no surrounding chrome, no separate panel, no music-note toggle button.

The player is revealed by hovering the grid (desktop) or tapping it (mobile). When idle and not interacted with, the grid behaves exactly as today.

## 2. Goals & non-goals

**Goals**
- All audio UI lives inside the dot grid; visually composed of individual lit dots at the same 5px spacing as the existing shader.
- Hover/tap to reveal; otherwise the grid is decorative (idle wave) or audio-reactive (playing visualizer).
- Discovery moment: the play glyph is the only audio entry point on the homepage.

**Non-goals**
- Track list / queue UI.
- Volume control. (Use OS controls.)
- Lyrics / metadata beyond title + artist.
- Visualizer changes — keep the existing 5 scenes and the underlying GLSL pipeline intact.

## 3. States

| # | State | Trigger | Render |
|---|-------|---------|--------|
| 1 | Idle, no interaction | Page load, no music started, cursor away | Existing ambient wave (unchanged) |
| 2 | Idle, revealed | No music started, cursor over grid (desktop) / tapped grid (mobile) | Play glyph centered, dot-rendered |
| 3 | Playing, no interaction | Music playing, cursor away / no recent tap | Audio-reactive visualizer scene runs (current behavior preserved) |
| 4 | Playing, revealed | Music playing + cursor over grid / tapped grid | Title + artist top-left, prev/pause/next centered, scrubber + timecodes flush to bottom, scene picker top-right — all dot-rendered, overlaid on the running visualizer |

Transitions:
- State 1 ↔ 2 and 3 ↔ 4: 250ms fade-in / 200ms fade-out, opacity + 2px blur lift, eased `[0.22, 1, 0.36, 1]`
- Track change (within state 4): title + artist crossfade 200ms
- Scrubber: redraws every 250ms (4Hz) during playback

## 4. Architecture — hybrid (shader untouched + 2D canvas overlay)

`LedMatrix.tsx` (1,355 lines, marked sensitive in `CLAUDE.md`) is **not modified**. It continues to render the idle wave and the audio-reactive scenes via its WebGL2 shader.

A new component, `LedMatrixUI.tsx`, mounts an absolutely-positioned `<canvas>` *over* the LedMatrix canvas at the same dimensions. It uses the 2D canvas API (not WebGL) to draw individual filled circles at the same 5px grid that the shader uses. The two canvases are siblings under a shared positioned wrapper; resize is coordinated via `ResizeObserver` so they stay in lockstep across viewport and DPR changes.

The overlay canvas redraws only when its inputs change (track, currentTime tick, hover state, scene). The shader continues to redraw every frame as it does today. They do not share state and do not block each other.

```
<div class="grid-wrapper" (mouseenter/leave, click handler)>
  <LedMatrix />            ← existing shader canvas (idle wave + scenes)
  <LedMatrixUI />          ← new 2D canvas (UI dots)
</div>
```

## 5. Components & files

### New
- **`site/components/music/LedMatrixUI.tsx`** — overlay component. Owns the 2D canvas, hover/tap reveal state, click-region routing, and rendering. Subscribes to `useAudioPlayer()` for `isPlaying`, `currentTrack`, `currentTime`, `duration`, `togglePlay`, `next`, `prev`, `seek`. Reads + writes the active visualizer scene via whichever context manages it (TBD — see §11).
- **`site/lib/dot-font.ts`** — pure module:
  - `FONT_3x5: Record<string, number[][]>` — bitmap masks for `A-Z`, `0-9`, space, `-`, `:`, `.`, plus an ellipsis glyph for truncation.
  - `GLYPH_7x7: Record<"play"|"pause"|"prev"|"next", number[][]>` — transport glyphs.
  - `GLYPH_5x5: Record<SceneId, number[][]>` — the 5 scene icons.
  - Helpers: `drawText(ctx, str, originCol, originRow, cell, color)`, `drawGlyph(ctx, glyph, originCol, originRow, cell, color)`, `measureText(str): {cols, rows}`.

### Modified
- **`site/components/HomeLayout.tsx`** — drop the `motion.div` wrapping the player+visualizer toggle row above the grid. Wrap `LedMatrix` and `LedMatrixUI` in a single `position: relative` container so the overlay can position over it.
- **`site/components/HeroActions.tsx`** — remove the `MusicNoteIcon` ActionIcon entry.
- **`site/components/Hero.tsx`** — remove the inline music-note button from the bio paragraph (`"...I dabble in music photography 🎵."` → `"...I dabble in music photography."`). Drop the `useAudioPlayer` import + the `MusicNoteIcon` import that supported it.
- **`site/lib/AudioPlayerContext.tsx`** — delete `panelOpen`, `togglePanel`, `openPanel`, `closePanel` from the context type, state, and value object. They have no consumer after this change.

### Removed
- `site/components/music/PlayerPanel.tsx`
- `site/components/music/SeekBar.tsx`
- `site/components/music/VisualizerSceneToggle.tsx`

## 6. Layout (cells)

The grid is `cols × rows` cells where `cols = floor(width / 5)`, `rows = floor(height / 5)`. Reference dimensions (homepage at `lg+`, ~550px wide × ~175px tall = 110 × 35 cells).

### Top-left: title + artist
- Origin: `(col 2, row 3)`
- Title (line 1): 3×5 font, max ~10 characters, color `--color-accent`. Truncate with `…` glyph.
- Artist (line 2): 3×5 font, dimmer accent (40% opacity over `--color-accent`), max ~10 characters.
- Line spacing: 2 cells (5 + 2 = 7 cell pitch)

### Top-right: scene picker
- 5 icons × 5 cells wide × 5 cells tall, 1-cell gap → 29 cells total
- Anchored: `(col cols-32, row 3)`
- Active: full `--color-accent`. Inactive: dimmed accent (40% opacity).

### Center: transport
- 3 glyphs × 7×7 cells, 4-cell gap between glyphs → 29 cells total
- Centered vertically: `originRow = floor(rows/2) - 3`
- Centered horizontally: `originCol = floor(cols/2) - 14`
- Order left-to-right: prev, play-or-pause, next.
- Play/pause uses full accent. Prev/next render at 70% opacity until hovered.

### Bottom: scrubber row
- Two rows total: timecodes on `row rows-5`, dot progress bar on `row rows-3`.
- Left timecode: 3×5 font, format `M:SS`, origin `(col 2, row rows-5)`.
- Right timecode: 3×5 font, format `M:SS`, origin `(col cols-12, row rows-5)`.
- Progress dot row: 1 cell tall on `row rows-3`, spanning `col 18` to `col cols-13`. Lit dots up to `floor((currentTime/duration) × bar_cols)` use full accent; remainder uses dimmed accent.

### Responsive fallback
At narrower viewports the grid has fewer columns. Layout falls back in this order as `cols` decreases:
1. (cols < 80) Drop the artist line (keep title only).
2. (cols < 60) Drop the scene picker (5 icons removed; current scene still active under the hood).
3. (cols < 40) Drop the title text. Center transport + scrubber remain (these are non-negotiable).

## 7. Bitmap font & glyph atlases

### 3×5 font
Compact LED-style uppercase + digits + 4 punctuation marks. Each glyph is `number[5][3]` (5 rows, 3 cols). 1 = lit. Letter advance = 4 cells (3 + 1 spacing). All-uppercase rendering — no lowercase variants needed.

Coverage: `A-Z`, `0-9`, ` `, `-`, `:`, `.`, `…`. ~40 glyphs total. Hand-authored as a static const in `dot-font.ts`. Sample glyphs are in the proof-of-concept HTML preview.

### 7×7 transport glyphs
- `play` — right-pointing triangle anchored to left column
- `pause` — two 2-cell-wide vertical bars with a 1-cell gap
- `prev` — `play` mirrored + a 1-cell-wide bar on the left edge
- `next` — `play` + a 1-cell-wide bar on the right edge

### 5×5 scene icons
- `waveform` — sinewave dots
- `sparkle` — plus/cross
- `chladni` — outlined square
- `feedback` — concentric diamonds
- `lissajous` — X pattern

Hand-authored static consts. The exact dot patterns are draft and may be tuned during implementation; the proof-of-concept HTML shows them.

## 8. Interaction model

### Reveal trigger
- Desktop: `mouseenter` on grid wrapper → `revealed = true`. `mouseleave` → `revealed = false`.
- Touch: `pointerup` (touch type) inside grid wrapper → toggle `revealed` (use `pointerup` so a tap-and-drag scrub on the scrubber row doesn't fight the reveal toggle). A `pointerdown` outside the grid wrapper while `revealed` → `revealed = false`.

The `revealed` flag controls overlay opacity via Framer Motion (`opacity: revealed ? 1 : 0`, 250ms in, 200ms out, with a parallel `filter: blur(2px) → blur(0)` so the dot shapes "develop" rather than pop).

### Click regions (only when `revealed`)
The wrapper is divided into mutually exclusive hit regions, each with a `cursor: pointer` style and ARIA semantics:

| Region | Bounds (approx) | Action |
|--------|------|--------|
| Prev | center band, left third (cols `originCol..originCol+6`) | `prev()` |
| Play/pause | center band, middle third (cols `originCol+11..originCol+17`) | `togglePlay()` |
| Next | center band, right third (cols `originCol+22..originCol+28`) | `next()` |
| Scrubber | bottom 12% of grid | `seek(x → time)` on click; drag = scrub |
| Scene picker (×5) | top-right icon strip, each 5-cell-wide region | `setScene(id)` |
| Other | everywhere else | no-op (reveal stays) |

Click regions are computed in CSS pixels from the grid wrapper bounds (not per-dot), so hit testing is cheap and tolerant.

### Track change
When `currentTrack.id` changes, schedule a 200ms crossfade: write the new title/artist into a back buffer, then animate `oldOpacity → 0` and `newOpacity → 0 → 1` over 200ms. (In practice, this may collapse to a single canvas redraw with a fade variable, depending on perf — it's a polish tweak.)

### Scrubber tick
A `setInterval` at 250ms (during playback only) bumps a local "tick" state, triggering canvas redraw of the scrubber row. On pause/no-music, no tick. Outside the bar, the rest of the overlay (title, artist, glyphs, scenes) is redrawn only when its inputs change.

## 9. Accessibility

- The grid wrapper has `role="application"` and `aria-label="Music player"`, and is in the tab order.
- Keyboard, when wrapper is focused:
  - `Space` → `togglePlay()`
  - `←` → `prev()`, `→` → `next()`
  - `[` → previous scene, `]` → next scene
  - `Home` → seek to 0, `End` → seek to duration
- Focus ring: visible 2px accent outline on the wrapper when focused.
- A visually hidden `<div role="status" aria-live="polite">` reports track changes (`"Now playing: <title> by <artist>"`).
- A visually hidden `<button aria-label="Play/pause">` overlays the play/pause click region so screen readers and keyboard users have an actionable target. Same approach for prev / next / each scene icon — invisible buttons stacked over the dot art for SR.

## 10. Sizing & DPR

- Both canvases (LedMatrix's WebGL canvas and LedMatrixUI's 2D canvas) live under a shared `position: relative` wrapper. Both fill the wrapper at `width: 100%; height: 100%`. The wrapper has the same dimensions LedMatrix has today.
- The overlay's internal canvas resolution is `cssW * dpr × cssH * dpr`. Drawing uses `ctx.scale(dpr, dpr)`. Cell circles are drawn at `cell * 0.4` radius (matches the shader's `DOT_BLOOM = 3` / `SPACING = 5` ratio = 0.4 visually).
- A single `ResizeObserver` on the wrapper fires both canvases' resize handlers. Coalesced via `requestAnimationFrame`.

## 11. Open questions to resolve during implementation

- **Visualizer scene state ownership.** The current `VisualizerSceneToggle` reads/writes scene state somewhere — likely `AudioPlayerContext` or a sibling context. The plan must locate it and expose a hook (`useVisualizerScene`) before deleting `VisualizerSceneToggle.tsx`. If the state lives inside `VisualizerSceneToggle` itself (component-local), it must be lifted to a context first.
- **Track-change crossfade vs. fade-only.** Crossfade requires double-buffering canvas regions; a simple opacity fade (whole text region 1 → 0 → 1) is much simpler. Default to fade-only; revisit if it feels jarring.
- **Mobile click resolution.** On a phone screen (~120 cells wide × ~35 cells tall, scaled), the 5×5 scene icons are physically tiny (~25px square). Acceptable hit target on touch is 44pt. Plan: on touch the click region for each scene icon expands to 30 cells wide × the full top strip, even though the dot art is only 5 cells. Same for transport glyphs (each click region is wider than the visible glyph).

## 12. Risks

- **Resize race.** If LedMatrix and LedMatrixUI resize on different ticks the dots can disagree by a sub-pixel offset. Mitigation: shared `ResizeObserver` + same math (`floor(cssW / 5)` etc.).
- **2D canvas perf.** Drawing ~200 circles every 250ms at 2× DPR is well within budget (sub-1ms in spot checks), but a sloppy redraw loop could regress. Mitigation: redraw only when inputs change; the scrubber tick is the only periodic redraw, and it can be limited to the scrubber row's bbox via `clearRect`.
- **Focus handling on a non-DOM dot art.** The "buttons" are click regions, not `<button>` elements. Mitigation: stacked invisible `<button>`s for each region (see §9).
- **Discovery.** Removing the music-note button means the only entry to audio is hovering the grid. Some users may not realize the grid is interactive. Mitigation in V1: idle hover already shows a play glyph centered — that's the affordance. If telemetry/feedback shows poor discovery, revisit (e.g., add a one-time tooltip on first visit).

## 13. Out of scope

- Volume control.
- Track queue / playlist UI.
- Lyrics, album art.
- Persisting user's last scene choice across sessions (already handled by existing context, if it does so today).
- Server-side rendering of the dot grid.
- Touch-drag gestures beyond simple seek.

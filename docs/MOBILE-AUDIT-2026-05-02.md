# Mobile audit — 2026-05-02

Phase 1 punch list. Walk every route on your real phone (not DevTools). The
dev server binds to 0.0.0.0 so:

- **On local network**: `http://<your-mac-ip>:3000`
- **Remote**: run `cloudflared tunnel --url http://localhost:3000` and use the
  printed `*.trycloudflare.com` URL

Capture issues as bullets under the route they appeared on. Tag severity inline
with `[P0]` / `[P1]` / `[P2]` so we can sort later.

## Severity legend

- **P0 — broken.** Horizontal overflow, unreadable text (<14px body), untappable
  controls (<40×40), content covered by fixed toolbar/footer, modal doesn't fit
  viewport, keyboard covers the active input, layout collapses.
- **P1 — annoying.** Tight hit areas that still work, sticky header obstructing
  reading, awkward line-length, scroll jank, notch / safe-area issues, press
  feedback feels off, motion makes scroll dizzy.
- **P2 — polish.** Typography rhythm, image cropping, spacing felt off but not
  blocking.

## What to check on every route

1. Does the page *fit* — any horizontal scroll? Any element bleeding past the
   right edge?
2. Is body text readable without zooming (~16px minimum)?
3. Can you tap every interactive thing first try (≥40×40)?
4. Does the **unified toolbar** at the top obstruct content as you scroll?
5. Is anything covered by the **chat bar** at the bottom?
6. On notched iPhones — does anything sit behind the status bar or home
   indicator (safe-area)?
7. Open the chat — does the keyboard cover the input? Does the panel fit?
8. If you rotate to landscape — anything break?

## Routes

### Homepage

- `/` — Hero, work cards, Playground, bio, marquee, toolbar

Findings:

- **[P2] "Music photography" link underline is always visible.** Should be
  hover-only (or focus-visible). Underline at rest reads as cluttered against
  the bio prose.

### About me

- About me view (toolbar Phase 4 lifted bio text into a dedicated About me
  surface — not a separate route, but a distinct view)

Findings:

- **[P1] Resume text spacing.** Element separation feels cramped — items run
  into each other without enough vertical rhythm.
- **[P0] Return / back affordance is missing or inaccessible.** No clear way
  to exit the About me view on mobile.

### Case studies (full)

- `/work/fb-ordering` — F&B Ordering (richest custom page; lots of interactive
  components, BrowserMockup, MobileShowcase, RoadmapEvolution)

Findings:

-

- `/work/general-task` — General Task

Findings:

-

- `/work/design-system` — Design System

Findings:

-

- `/work/ai-workflow` — AI Workflow

Findings:

-

### Case studies (locked)

For locked studies, check: the lock placeholder, the back chevron position vs
the toolbar, the unlock modal sizing/keyboard behavior.

- `/work/checkin` — Hotel check-in (locked)

Findings:

-

- `/work/upsells` — Upsells (locked)

Findings:

-

- `/work/compendium` — Compendium (locked)

Findings:

-

### Playground

- `/play` — Playground index

Findings:

-

- `/play/six-degrees` — autoplay video, sections

Findings:

-

- `/play/pajamagrams` — autoplay video, sections

Findings:

-

- `/play/custom-wrapped` — autoplay video, sections

Findings:

-

## Cross-route interactions

Test each on at least one route:

- **Chat bar** — open, type, scroll messages, close. Keyboard behavior.
- **Theme palette** — open popover, switch theme, close.
- **Hamburger menu** (if present in toolbar) — open, navigate, close.
- **Marquee** — toggle on/off, watch the header push down.
- **PasswordModal** — open from any locked card or page, type, submit, escape.

Findings:

- **[P0] Unified toolbar buttons are untappable on mobile.** `ToolbarIconButton`
  is `w-7 h-7` = 28×28 (HeroToolbar.tsx:50); `PaletteButton` and the music slot
  toggle are `h-7` = 28px tall (HeroToolbar.tsx:111, :200). 16×16 palette
  swatches inside the popover (PaletteSwatches.tsx). All well below 40×40
  minimum. Apple HIG = 44pt; Material = 48dp.
  → **Fix direction: Option B with a floating pill** — keep desktop dense; below
  `lg` collapse toolbar to a hamburger trigger + a *floating* bottom action bar
  for primary actions. **Not flush** to the screen edge — Safari's URL bar
  (which collapses on scroll) and the iOS home indicator make flush bottom
  bars feel buggy and cheap. Pattern: rounded-pill / rounded-2xl, centered
  horizontally, ~16px margin from bottom edge plus `safe-area-inset-bottom`,
  backdrop-blur, soft shadow for elevation. Reference: iOS Notes, Linear
  mobile, Apple Music. Buttons inside meet 40×40.
- **[P1] Hamburger nav sidebar buttons are small on mobile.** When the
  hamburger menu opens its sidebar, the nav items (links) have insufficient
  tap targets. Below 40×40.
  → Bump nav-item line height + vertical padding to ≥44px on mobile;
  full-width hit areas across the sheet.
- **[P0] Chat panel is unusable on mobile.** Right-side panel layout doesn't
  fit a phone viewport; tapping the textarea triggers iOS auto-zoom (because
  textarea font-size is <16px); keyboard then occupies most of the screen and
  the top of the panel scrolls out of reach.
  → **Fix direction:** below `lg`, render chat as a full-screen bottom sheet
  (Claude-mobile pattern). Title pinned to top, messages scroll, composer
  pinned above keyboard via `safe-area-inset-bottom + visualViewport` listener.
  Bump textarea font to 16px to kill auto-zoom.
- **[P1] PasswordModal "Got a code?" divider + error message are too small to
  read on mobile.** Mono 11px / label-size error text doesn't meet readable-
  body threshold on phone screens.
  → Bump mobile sizes for the divider label and the inline error to ≥12-13px,
  and verify color contrast for the error state.
- **[P0] LED matrix viz-scene buttons inaccessible on mobile.** Buttons appear
  on hover only and are overlaid on the dot matrix; on phones (no hover) they
  can't be revealed at all, and on light mode they're invisible against the
  matrix background even when shown.
  → **Fix direction:** when music is playing, render the scene-toggle buttons
  *outside* the matrix as part of the player surface (always visible, no
  hover dependency). Solid contrast against toolbar bg, not against the dots.

## Performance / observational notes

Things to feel for, not measure:

- Does scroll feel smooth on the homepage? Any janky spot?
- Do the autoplay videos in Playground stutter?
- How long until the page *feels* usable from a cold tap?
- Any layout shift after fonts load?

Findings:

-

## After the walk

When the punch list is full, paste it back to me (or just say "go") and I'll
batch fixes by category — overflow & layout → hit areas → typography →
animation/perf — one commit per category, same shape as the polish pass.

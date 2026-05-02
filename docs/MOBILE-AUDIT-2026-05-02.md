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

-

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

-

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

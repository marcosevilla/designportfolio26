---
description: CSS variable color tokens, the 11-theme system, and the asterisk brand mark
paths:
  - "site/app/globals.css"
  - "site/components/ThemeToggle.tsx"
  - "site/components/PaletteSwatches.tsx"
  - "site/components/HeaderToolbar.tsx"
  - "site/app/dev/effects-lab/**/*.tsx"
---

# Design Tokens (CSS Variables)

## Colors — Light Mode (`:root`)
| Variable | Value |
|----------|-------|
| `--color-bg` | `#ffffff` |
| `--color-fg` | `#1a1a1a` |
| `--color-fg-secondary` | `rgba(17, 17, 17, 0.6)` |
| `--color-fg-tertiary` | `rgba(17, 17, 17, 0.35)` |
| `--color-surface` | `#fbfbfb` |
| `--color-surface-raised` | `#f5f4f9` |
| `--color-border` | `#e6e6e6` |
| `--color-muted` | `#f3f3f3` |
| `--color-accent` | `var(--color-fg)` (neutral — `mono` theme is default; colored themes override at runtime) |

## Colors — Dark Mode (`.dark`)
| Variable | Value |
|----------|-------|
| `--color-bg` | `#0a0a0a` |
| `--color-fg` | `#ededed` |
| `--color-fg-secondary` | `rgba(237, 237, 237, 0.5)` |
| `--color-fg-tertiary` | `rgba(237, 237, 237, 0.35)` |
| `--color-surface` | `#141414` |
| `--color-surface-raised` | `#1a1a1a` |
| `--color-border` | `#2a2a2a` |
| `--color-muted` | `#1e1e1e` |
| `--color-accent` | `var(--color-fg)` (neutral — `mono` theme is default; colored themes override at runtime) |

## Themes
**11 themes total.** Default is `mono` (pure neutral B&W — accent + glow aliased to `--color-fg`). 10 colored opt-ins: ocean, forest, wine, slate, ember (bold); lavender, mint, rose, butter, sky (soft). Each colored theme overrides all CSS variables at runtime via `applyColoredTheme()` in `ThemeToggle.tsx`. Mono swatch in the palette renders as a 50/50 black/white split circle so its "neutral" identity is legible against any bg. Persists via `theme-mode` + `theme-family` in localStorage.

Other persistence keys: `colored-theme-name`, `font-size-offset`.

`defaultTheme="light"` on the provider (kills the dark-OS first-paint flash).

## Brand mark (May 2026)
**`*` (Geist Sans, weight 500)** replaces the previous `✸` heavy 8-pointed star and the `✦` six-pointed marquee separator everywhere. Geist's `*` sits high in its em-box, so most surfaces apply `transform: translateY(15%)` to optically center it next to adjacent text. In-flight visual rebrand spec/plan: `docs/superpowers/specs/2026-05-03-visual-rebrand-bw-asterisk-design.md` + `docs/superpowers/plans/2026-05-03-visual-rebrand-bw-asterisk.md`. Surfaces:
- Hero rest star: 0.62em inner span, slot Y offset `0.08em`
- Hero loader (LoadingOverlay): 0.42em inner span (kept smaller — slot is 108-168px so absolute size is huge)
- HomeNav active marker: 18px, `translateY(15%)`, split outer/inner span so `y: starY` motion value doesn't fight the static centering transform
- ChatBar SparkGlyph: default 22px + `translateY(15%)`; "Ask Marco" pill uses size 22
- ChatMessage streaming cursor: 1.7em with `verticalAlign: middle`, `lineHeight: 0`
- MobileToolbar pill: 22px + `translateY(15%)` — ⚠️ `MobileToolbar.tsx` no longer exists; the likely successor is `components/MobileNav.tsx` (see `toolbar-chrome.md`), but the pill surface was not confirmed there. Verify before relying on it.
- InlineTOC marker, SeekBar thumb, Marquee separator: same pattern, smaller

`app/icon.svg` favicon is a 3-stroke asterisk, dark-aware.

## Product-vs-chrome typefaces
**Inter is loaded in `app/layout.tsx` as a PRODUCT typeface only** (`--font-inter`) — used inside Canary product specimens. Site chrome stays Geist. Product token values live in `site/components/fb-showcase/canary-polished-tokens.ts` (shared infra — import it, don't re-transcribe).

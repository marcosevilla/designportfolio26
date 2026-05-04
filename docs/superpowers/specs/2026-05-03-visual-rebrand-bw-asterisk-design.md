# Visual rebrand — B&W default + Geist asterisk

**Date:** 2026-05-03
**Status:** Approved (ready for implementation plan)

## Background

Outside feedback: the site reads as Claude-coded. Two contributors:

1. The `✸` heavy 8-pointed rectilinear star — used as the brand mark in the hero intro, nav active state, marquee, chat cursor, and several other places. It directly echoes Anthropic/Claude's mark.
2. The default warm copper accent (`#B5651D` light / `#D4915E` dark) on a near-white background reads as the same "warm minimal AI tool" palette as Claude's product.

This rebrand removes both. It does not touch the case studies, the colored themes (which are user-pickable opt-ins), or any layout / animation / interaction.

## Decisions

1. **Default color mode = pure neutral B&W.** Default light mode and default dark mode become fully achromatic. The `--color-accent` variable is unified with `--color-fg` so anywhere accent was used, it now reads as the foreground color.
2. **Brand mark = `*` (Geist Sans, weight 500).** Replaces every `✸` and `✦` in the codebase. Geist's asterisk is a rounded 6-point glyph that reads as natural typography rather than a logo.
3. **Existing 10 colored themes (ocean, forest, wine, slate, ember, lavender, mint, rose, butter, sky) remain available** as opt-ins via the Theme Palette. Each theme already overrides `--color-accent` with its own value, so colored themes are unaffected by the default-mode change.

## Out of scope

- Case study hero gradient colors — each study keeps its color identity.
- The 10 colored themes — shipped as-is.
- The Theme Palette UI itself — no structural changes.
- Logo / favicon / OG images / marketing assets.
- Any animation timing or interaction model — only the character and the accent variable change.

## Color system changes

File: `site/app/globals.css`

Two single-line edits:

| Mode | Selector | Before | After |
|------|----------|--------|-------|
| Light | `:root` line 61 | `--color-accent: #B5651D;` | `--color-accent: var(--color-fg);` |
| Dark | `.dark` line 119 | `--color-accent: #D4915E;` | `--color-accent: var(--color-fg);` |

Aliasing accent to `--color-fg` (rather than hardcoding `#1a1a1a` / `#ededed`) keeps the default-mode look in sync if `--color-fg` is ever tuned later. Colored-theme classes that override `--color-accent` keep their explicit hex values — they are unaffected.

### Implications

- **HomeNav active state.** The active marker (now `*`) and the active-link copper color converge to fg. Existing spring nudge unchanged.
- **Card hover glow** (`CaseStudyCard.tsx`, mouse-tracking radial gradient using `--color-accent`). Becomes a neutral fg-color glow on hover instead of a warm copper one. Reads as a "highlight" rather than a colored accent. Acceptable.
- **Focus rings** (`outline: 2px solid var(--color-accent)` in `globals.css`). Become fg-color outlines. Still high-contrast against bg, so a11y is preserved.
- **Inline links / hovers** that used `var(--color-accent)` now match body text color. They still register as interactive via underline / hover state — verify per usage during implementation.

## Symbol replacement

Replace `✸` with `*` (Geist Sans, weight 500) in 11 occurrences across 9 files:

| File | Lines | Context |
|------|-------|---------|
| `site/components/Hero.tsx` | 222, 243 | Intro star1 / star2 blink phases |
| `site/components/HomeNav.tsx` | 220 | Active nav marker |
| `site/components/LoadingOverlay.tsx` | 228 | Loading state mark |
| `site/components/MobileToolbar.tsx` | 153 | Mobile toolbar marker (already inline-styled `fontSize: 14`) |
| `site/components/chat/ChatBar.tsx` | 69 | Chat bar mark |
| `site/components/chat/ChatMessage.tsx` | 91 (comment), 135 | Streaming message cursor |
| `site/components/case-study/InlineTOC.tsx` | 93 | TOC marker |
| `site/components/music/SeekBar.tsx` | 115 (comment), 130 | Seek thumb |

Additionally, replace `✦` (six-pointed star) in:

| File | Lines | Context |
|------|-------|---------|
| `site/components/Marquee.tsx` | 53 (in `QuoteSet`) | Marquee quote separator |

### Styling

- Geist Sans is already loaded as `--font-sans` site-wide. No font import required.
- The new `*` inherits `var(--font-sans)` from its parent unless explicitly set.
- Apply `font-weight: 500` on the span/element rendering the asterisk so the glyph is the medium weight chosen during brainstorming. Existing usages have varied inline styles — implementation should add `fontWeight: 500` consistently at each replacement site.

### Animation behavior

All existing animations preserved:

- Hero `star1` (1800 ms blink before heading streams) and `star2` (1800 ms blink between heading and bio).
- HomeNav active spring nudge (stiffness 350, damping 28, y = activeIndex × 36).
- ChatMessage streaming cursor blink.
- SeekBar thumb behavior.
- Marquee scroll.

The element wrapping each character is untouched. Only the inner glyph changes.

## Theme Palette

No structural changes. The palette already supports light, dark, and 10 colored themes. The "no colored theme selected" state is currently the default — once `--color-accent` is unified with fg in `:root` / `.dark`, that state is the new B&W mode automatically.

Optional follow-up (not part of this spec): add a small subtitle to the palette explaining "Default is B&W. Pick a color theme below to add a tint." — defer to a later pass once this lands.

## Memory / docs updates

After landing:

- Update `CLAUDE.md` "Design Tokens (CSS Variables)" table — accent is now neutral by default in light and dark modes.
- Update `CLAUDE.md` "Visual Style Updates" section — note `*` (Geist 500) is the brand mark.
- Update auto-memory `MEMORY.md` similarly.

## Validation

Before merging:

1. Visual smoke test (manual, dev server):
   - Hero intro plays start to finish — both `*` blinks render and align with the rest of the heading.
   - HomeNav active state shows the `*` marker; nudge animation works.
   - Marquee scrolls and the `*` separator reads cleanly between quotes.
   - Chat cursor blinks during streaming.
   - SeekBar thumb renders and seeks correctly.
   - InlineTOC marker shows on case study pages.
2. Toggle through all 10 colored themes — each should still render its own accent color (no regression to neutral).
3. Toggle dark mode — should be pure neutral with no copper artifacts.
4. Run TypeScript check (post-edit hook handles this on every save).
5. Build with `npm run build` from `site/` — no errors.

## Risk

Low. The change is mechanical:

- 2 CSS variable edits.
- 12 character replacements across 9 files (11 × `✸` → `*`, 1 × `✦` → `*`).
- 2 comment updates (`ChatMessage.tsx` line 91, `SeekBar.tsx` line 115) for accuracy.

No layout, no animation timing, no logic changes. Worst case is a hover-glow regression that's easy to revert.

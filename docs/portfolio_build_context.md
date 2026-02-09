# Portfolio Build Context
## Decisions & Requirements from Planning Session

*Created: 2026-01-30*
*Last updated: 2026-02-06 (Compendium + Upsells migrated, homepage reordered, folder structure reorganized, retroactive case study markdown files created)*
*Purpose: Reference for any future Claude session working on Marco's portfolio build*

---

## What This Is

Marco is building a new product design portfolio site. This document captures all decisions made during planning and build conversations so any future session can pick up where we left off without re-asking questions.

---

## Tech Decisions

| Decision | Choice | Why |
|----------|--------|-----|
| Framework | Next.js 14 (App Router) | Best ecosystem for portfolio sites, static generation, Vercel-native |
| Content management | MDX files | Easy to add/remove pages (just add/delete a file), no CMS dependency, version controlled |
| Styling | Tailwind CSS | Fast iteration, great dark mode support, responsive utilities |
| Animations | Framer Motion | Subtle fades, hover reveals, nav interactions |
| Fonts | PP Editorial New, PP Formula SemiExtended, GT Cinetype, GT Cinetype Mono, Geist Sans, Instrument Serif, Instrument Sans | Custom font stack + Google/Vercel fonts, switchable via CSS vars |
| Hosting | Vercel | Free tier, built for Next.js, instant deploys |
| Domain | Custom domain (already purchased) | Will connect to Vercel |
| Package manager | pnpm (note: may need `npx` fallback if pnpm not in PATH) | — |

## Code Comfort Level

Marco is a designer with minimal coding experience but interested in React/JS and willing to learn. The build should:
- Keep component code readable and well-commented
- Use MDX content files as the primary editing surface (no need to touch component code to update content)
- Follow clear, conventional patterns

---

## Current Layout & Visual Direction

### Layout
- **Fixed left sidebar nav** (100px wide) on desktop, collapses to horizontal top bar on mobile (`md` breakpoint)
- **Stripe-inspired content width system** with three tiers:
  - `max-w-content` (650px) — body text pages (/writing, /play), post-hero case study content
  - `max-w-content-md` (900px) — bio panel, dialog inner content, case study hero inner
  - `max-w-content-lg` (1264px) — work panel, dialog sheet, /work index
- **`layout.tsx` provides only vertical padding** (`pt-24 md:pt-[18vh] pb-20`) — each page handles its own `max-width` and horizontal padding (`px-4 sm:px-8` = 16px mobile, 32px tablet+)
- Sidebar padding: `px-8 pb-8 pt-[22vh]` (matches main content vertical alignment on desktop)

### Sidebar Nav
- **Links:** Home `/`, Work `/work`, Writing `/writing`, Play `/play` — all real routes
- **Font:** 16px GT Cinetype, medium weight (500)
- **Active state:** Copper star indicator (✸) + copper text color. Star is absolutely positioned and animates vertically with a spring transition when the active route changes (stiffness: 350, damping: 28). Active text springs 18px right to make room for star.
- **Inactive state:** Muted gray text (`var(--color-fg-secondary)`), flush left aligned with icon buttons
- **Hover interaction:** All links hover to accent/copper color + text slides 8px right (spring: stiffness 400, damping 25)
- **Star behavior:** Single star element slides vertically between rows on route change (click), does NOT follow hover
- **Page load:** Staggered slide-in from left (opacity 0→1, x -12→0, 60ms delay between links)
- **Icon buttons below nav:** Email, LinkedIn, Theme Palette toggle, Marquee toggle — all use unified `SidebarIcon` component with identical treatment:
  - Default: secondary color, left-aligned flush with nav text
  - Hover: accent/copper color + 4px spring slide right
  - Spacing: `gap-4` (16px) between icons, `mt-8` from nav links
  - Theme Palette: color palette icon (circle with dots), click toggles the palette panel open/closed
  - Marquee toggle: smiley face icon, dims to 40% opacity when marquee is off
- **Mobile:** Horizontal top bar with same links, sticky, backdrop-blur, 14px font

### Colors

**Three theme modes:** Light, Dark, and 10 Colored palettes — selectable via Theme Palette picker (no more cycle toggle)

**Accent color:** Copper `#B5651D` (light mode), `#D4915E` (dark mode), per-theme accent (colored mode) — stored as `--color-accent` CSS variable

**Light mode (`:root`):**
- Background: `#ffffff`
- Foreground: `#1a1a1a` (near-black, updated from #31263b for darker body text)
- Secondary text: `rgba(17, 17, 17, 0.82)` (bumped from 0.65 for darker body paragraphs)
- Tertiary text: `rgba(17, 17, 17, 0.35)`
- Surface: `#fbfbfb`
- Surface raised: `#f5f4f9`
- Border: `#e6e6e6`
- Muted: `#f3f3f3`

**Dark mode (`.dark`):**
- Background: `#0a0a0a`
- Foreground: `#ededed`
- Secondary text: `rgba(237, 237, 237, 0.5)`
- Tertiary text: `rgba(237, 237, 237, 0.35)`
- Surface: `#141414`
- Surface raised: `#1a1a1a`
- Border: `#2a2a2a`
- Muted: `#1e1e1e`

**Colored mode (10 WCAG AA–compliant palettes):**
- 5 bold: ocean (blue), forest (green), wine (pink), slate (purple), ember (warm brown)
- 5 soft: lavender, mint, rose, butter, sky
- Each palette overrides all CSS variables (bg, fg, secondary, tertiary, surface, surfaceRaised, border, muted, accent)
- Applied via inline styles on `<html>` element — cleared when switching away
- User selects specific palette from the Theme Palette picker (no random selection)
- Persists across navigation via localStorage (`theme-mode`, `colored-theme-name`)
- Body has `transition: background-color 0.3s ease, color 0.3s ease` for smooth switching

**Theme Palette picker:** Replaces the old Light→Dark→Colored cycle toggle. See "Theme Palette" section below for details.

### Typography (Hex.tech-inspired font system)

**Font stack** (all self-hosted in `/public/fonts/`, `@font-face` in globals.css):

| Font | Weights | Files |
|------|---------|-------|
| PP Editorial New | 200 italic, 400, 400 italic | 3 woff2 files |
| PP Formula SemiExtended | 700 | 1 woff2 file |
| PP Formula | 800 | 1 woff2 file |
| GT Cinetype | 300, 400, 700 | 3 woff2 files |
| GT Cinetype Mono | 400 | 1 woff2 file |

**Font CSS Variables** (defined in `:root` of globals.css, switchable via font pairing selection):

| Variable | Default Value |
|----------|---------------|
| `--font-display` | `"PP Formula SemiExtended", sans-serif` |
| `--font-heading` | `"PP Formula SemiExtended", sans-serif` |
| `--font-body` | `"GT Cinetype", sans-serif` |
| `--font-mono` | `"GT Cinetype Mono", monospace` |
| `--font-heading-style` | `normal` |
| `--font-size-offset` | `0px` |
| `--font-pairing-boost` | `0px` |

**External fonts loaded in `app/layout.tsx` via `next/font`:**
- Geist Sans (`geist/font/sans`) → CSS var `--font-geist-sans`
- Instrument Serif (`next/font/google`) → CSS var `--font-instrument-serif`
- Instrument Sans (`next/font/google`) → CSS var `--font-instrument-sans`

**Font Pairings** (selectable via Theme Palette):

| Role | Default | Classic | Serif |
|------|---------|---------|-------|
| Display | PP Formula SemiExtended | Geist Sans | Instrument Serif |
| Heading | PP Formula SemiExtended | Geist Sans | Instrument Sans |
| Body | GT Cinetype | Geist Sans | Instrument Sans |
| Mono | GT Cinetype Mono | GT Cinetype Mono | GT Cinetype Mono |
| Size Boost | 0px | 0px | +2px |

**Font Size Scaling:** All font sizes use `calc(Npx + var(--font-size-offset) + var(--font-pairing-boost))`. User offset range: -4px to +4px (body: 12px–20px), 2px per step. Pairing boost adds extra size for fonts that render smaller (e.g. Instrument Serif +2px). Both variables defined in `:root` of globals.css.

**Application (with Default pairing):**

| Element | Font var | Weight | Size |
|---------|----------|--------|------|
| Hero H1 ("Hi, I'm Marco...") | `--font-display` | 700 | `clamp(28px, 4vw + 10px, 38px)` + offset + boost |
| Page headings (Work, Writing, Play) | `--font-heading` | 700 | 30px + offset + boost, letterSpacing -0.025em |
| Body text, bio, nav | `--font-body` | 400 | 16px + offset + boost, line-height 1.75 |
| Marquee quotes | `--font-body` | 300 | 14px + offset + boost |
| Card title (hero/regular) | `--font-heading` | 500 | 22px/18px + offset + boost |
| Card subtitle | `--font-body` | 400 | 15px/14px + offset + boost |
| Star indicators (✦) | `--font-body` | — | 9px |
- All component font-family references use CSS variables (no hardcoded font names in components)
- Body font set via `var(--font-body)` in globals.css on `body` element
- Hierarchy via font family + weight + opacity (not color)

### Link Style (Joseph Zhang–inspired)
- **Default:** Muted gray text, no underline, `padding: 2px`
- **Hover:** Copper background tint (`rgba(181, 101, 29, 0.1)`) + copper text color
- **Click (`:active`):** Solid 1.5px copper underline appears
- **Star indicator:** Small ✦ at 9px, accent color, superscript position, 1px left margin — appears after inline text links
- **Inline variant (`.dotted-link--inline`):** Default state is accent color (stands out in body text), hover shifts to foreground color
- Used on: "photographer" link in bio, "Canary Technologies" link in bio

### Marquee (LinkedIn Recommendations)
- **Position:** Fixed bottom of viewport, full viewport width, z-40
- **Background:** `var(--color-surface)` with `border-top: 1px solid var(--color-border)`
- **Content:** 6 pull quotes from LinkedIn recommendations (Kevin Doherty, Hans van de Bruggen, EJ Lee)
- **Font:** GT Cinetype Light, 14px, quote text in secondary color, attribution in foreground color
- **Separator:** ✦ star in accent color between quotes
- **Animation:** CSS `marquee-scroll` keyframe, 30s linear infinite, content duplicated for seamless loop
- **Show/hide:** Toggleable via smiley face icon in sidebar, slides in/out with Framer Motion spring (`AnimatePresence` + `y: "100%"`)
- **Persistence:** Visibility state stored in localStorage via `MarqueeContext` provider
- **Homepage only:** Rendered in `app/page.tsx`, not in layout
- **Respects `prefers-reduced-motion`**

### Interactions (Framer Motion)
- **Page load:** Hero intro sequence: blinking ✸ (1800ms) → heading streams word-by-word → ✸ (1800ms) → first bio paragraph streams word-by-word → inline "+" button fades in → "View my work" button fades in at bottom of bio panel. Other pages have fade-in animations.
- **Section snap:** Elastic rubber-band resistance on scroll at bio/work boundaries → snap transition on release past threshold. Apple iOS physics formula.
- **Scroll:** Sections fade in when entering viewport (FadeIn component)
- **Nav:** Star slides vertically on route change (spring), text slides right on hover (spring), staggered entrance on load
- **Sidebar icons:** Slide 4px right + accent color on hover (spring)
- **Theme palette:** Desktop: scale 0.85→1 from top-left origin (spring stiffness 500, damping 32). Mobile: slide up from bottom (spring stiffness 350, damping 32). Backdrop fades in 150ms.
- **Marquee:** Slides up/down with spring animation on toggle
- **Bento cards:** Scale 1.01x via CSS transition (asymmetric timing), mouse-tracking copper border glow (200px radius, CSS mask-composite), subtle inner glow, scroll-based parallax (±30px vertical shift)
- **Transitions:** `duration-200` as baseline
- All animations respect `prefers-reduced-motion`

### Background Texture
- **Canvas-based dot grid** with Perlin noise wave animation and cursor hover effects
- **Key files:** `components/BackgroundTexture.tsx`, `lib/texture-constants.ts`
- **Configuration:** `GRID_SPACING: 8`, `DOT_SIZE: 0.5`, `DOT_OPACITY: 0.03`, `HOVER_RADIUS: 200`
- **Wave effect:** Perlin noise creates diagonal wave movement (~10s cycle). Threshold cutoff at 0.45 creates distinct "affected" vs "empty" areas for better contrast. Affected dots grow up to 3x size (`DOT_SIZE * (1 + waveIntensity * 2.0)`).
- **Hover effect:** Dots near cursor get larger and blend 70% toward glow color (`--color-glow`), creating a colored tinge
- **Paper grain:** SVG filter overlay at 12% opacity for texture
- **CSS variables:** Uses `--color-glow` and `--color-fg-tertiary`

---

## Homepage Sections (top to bottom)

### 1. Sidebar Nav (fixed left)
- See "Sidebar Nav" section above

### 2. Two-Panel Section Snap (Bio → Work)

The homepage is split into two full-viewport panels managed by `SectionSnap.tsx`, bridged through `HomeLayout.tsx`.

**Architecture:**
- `page.tsx` renders `<HomeLayout work={...} marquee={...} />`
- `HomeLayout.tsx` manages `peekVisible` state, passes `onIntroReady` to Hero and `peekVisible` to SectionSnap
- `SectionSnap.tsx` renders Bio panel (Hero + "View my work" button) and Work panel (cards + marquee) as two full-viewport `position: absolute` panels inside a `position: fixed; inset: 0` overlay
- Panels transition with `translateY` (bio slides up, work slides up from below) with `0.4s cubic-bezier(0.22, 1, 0.36, 1)` + `0.3s` opacity fade
- SectionSnap container: `z-[31]` (above ViewportFade at `z-[32]` which is pointer-events-none)

**Elastic rubber-band scroll (Apple iOS formula):**
- Formula: `visual = (raw × d × c) / (d + c × raw)` — asymptotic curve, stronger resistance the more you scroll
- Bio→Work: `c=0.8, d=300, threshold=18px` — snaps immediately once threshold hit during scroll (no debounce wait)
- Work→Bio: `c=0.85, d=300, threshold=3px` (easier to go back)
- Handles both wheel events (desktop) and touch gestures (mobile)
- **Immediate snap:** Threshold check happens during wheel/touch events, not after debounce. Snap fires the instant visual offset crosses threshold — no lingering.
- Scroll-end debounce at 30ms only used as fallback for sub-threshold spring-back
- Spring-back on cancel: `cubic-bezier(0.25, 1, 0.5, 1)` over 0.15s
- 450ms transition lock prevents double-triggers
- **Scroll cooldown:** 150ms cooldown after internal panel scrolling stops before snap zone activates — prevents momentum overscroll from accidentally triggering snaps
- **Scrollable bio panel:** Bio panel has `overflowY: auto` when active, allowing scroll when content exceeds viewport (e.g. after expanding all 6 paragraphs). Snap to work only triggers when scrolled to bottom.
- Keyboard navigation: Arrow Down / Space / Enter on bio → work; Arrow Up at top of work → bio
- `aria-hidden` on inactive panel

**"View my work" button:**
- Pill at bottom of bio panel, fades in after intro sequence completes (`peekVisible` prop)
- Style: `color-mix(in srgb, var(--color-accent) 10%, transparent)` bg, accent text, 13px, rounded-20px
- Hover: 18% accent tint
- Clicking triggers `goToWork()` transition
- Subtle `gentle-float` CSS animation: 6px vertical bob over 3s, ease-in-out, infinite
- 64px spacer (`mb-16`) between bio content and button; `pb-24` below button for breathing room

**Layout details:**
- Both panels have `md:pl-[100px]` for sidebar offset
- Content constrained with `max-w-content px-5`
- Bio panel: `pt-24 md:pt-[18vh]`, `min-h-full` flex column
- Work panel: `pt-24 md:pt-[18vh] pb-20` (aligned with nav sidebar), internally scrollable when active

### 3. Hero (Interactive Bio)
- **H1:** "Hi, I'm Marco. I design software in San Francisco." — `var(--font-display)`, clamp(28px–38px). Streams in word-by-word on page load.
- **Intro sequence** (page load animation, 5 phases):
  1. `star1`: Blinking ✸ star appears below name (1800ms)
  2. `subtitle`: Heading streams in word-by-word (~40ms/word, 250ms fade per word)
  3. `star2`: Blinking ✸ reappears below heading (1800ms)
  4. `bio`: First paragraph streams in word-by-word
  5. `done`: First expand button fades in, calls `onIntroReady` to show "View my work" button
  - `prefers-reduced-motion` or `sessionStorage` intro-seen flag skips straight to `done` (everything renders instantly)
  - **sessionStorage skip:** First visit plays full intro, stores `portfolio-intro-seen` in sessionStorage. Same-session revisits skip to `done`. Checked in `useEffect` to avoid hydration mismatch.
- **Interactive verbosity system** with 6 levels, starts at level 1:
  - **Level 1 (default):** Canary Technologies paragraph — 7 years experience, systems thinking + visual craft, 0→1 products, design systems
  - **Level 2:** + Past companies (Vivino, Vyond, General Task — all linked)
  - **Level 3:** + Bay Area childhood / PC origin story
  - **Level 4:** + Design philosophy + emerging tech/creativity interest
  - **Level 5:** + Personal (photographer linked, web dev, concerts, singing, pickleball)
  - **Level 6:** + Contact (email marcogsevilla@gmail.com, LinkedIn linked)
- **Controls:** Inline "+" button at end of last visible paragraph:
  - Rendered as a 20px accent-colored `+` at the end of the paragraph text, inline with the last line
  - **Tooltip on hover:** Shows the next question text (e.g. "What else have you worked on?") in a portal rendered to `document.body` (avoids `overflow: hidden` clipping from height animation)
  - Tooltip appears below button with 300ms delay entrance, pill style with accent bg + white text
  - No "−" collapse button (removed)
  - Hidden at max level (level 6)
- **Expand animation:** Click "+" → blinking ✸ star on its own line below (1200ms loading) → new paragraph streams in word-by-word (~40ms/word) → new "+" button fades in
- **Word-by-word streaming engine:** `flattenToWords()` splits paragraph segments into word array preserving link metadata. Words reveal one at a time at 40ms intervals. Links render as complete `<a>` tags once all their words are visible. Each word fades in with `opacity: 0→1` over 250ms.
- **Punctuation-aware spacing:** `!/^[,.\-;:!?)]/.test(seg.text)` prevents spaces before punctuation after links
- **Question prompts** (contextual per level): "What else have you worked on?" / "How'd you get into design?" / "What drives your work?" / "What do you do outside of work?" / "How can I reach you?"
- **Accessibility:** `prefers-reduced-motion` skips all animation. `StreamingWords` component reusable.
- **Performance:** Word-by-word uses simple opacity animation (GPU composited). Words memoized via `useMemo`. All timeouts cleaned up on unmount via refs.
- Links use dotted-link--inline style, no ✦ star indicators (removed)

### 4. Case Study Bento Cards (Stripe-inspired)
- Flows directly after bio (no heading, no divider)
- **Grid layout:** First card full-width (hero), remaining cards in 2-column grid on desktop (`sm:grid-cols-2`), single column on mobile
- **Card style:** Frosted glass effect — `bg-[var(--color-surface-raised)]/40` (40% opacity) + `backdrop-blur-xl`, rounded-[14px], 3:2 aspect ratio
- **Shadow:** Soft two-layer shadow — `0 12px 40px rgba(0,0,0,0.03), 0 4px 16px rgba(0,0,0,0.02)` for subtle depth
- **Parallax:** Scroll-based parallax using Framer Motion `useScroll` + `useTransform` — cards shift 30px vertically as they scroll through viewport, creating depth
- **Text:** Title (`--font-heading` 500, 22px hero / 18px regular) top-left, subtitle (`--font-body`, 15px/14px) below title, all in foreground colors
- **Year badge:** Removed (was GT Cinetype Mono pill top-right, removed for cleaner look)
- **Default border:** 1px `var(--color-border)` at 50% opacity (very subtle)
- **Hover — scale:** CSS `transform: scale(1.01)`, 350ms ease-out on enter (`cubic-bezier(0.22, 1, 0.36, 1)`), 400ms ease on leave (`cubic-bezier(0.25, 0.1, 0.25, 1)`)
- **Hover — border glow:** Mouse-tracking radial gradient (200px tight radius, 70% falloff) of `var(--color-accent)` masked to 1px border edge. Only the border near the cursor lights up in copper; the rest stays default. Uses CSS mask-composite trick.
- **Hover — inner glow:** Subtle 5% opacity radial accent gradient inside the card at cursor position
- **Future:** Empty center area reserved for animated mockup graphics
- Cards link to `/work/[slug]`
- **Frontmatter:** Each MDX file has optional `gradient` field (not currently used visually but stored)

### 5. Viewport Fade
- **Position:** Fixed to bottom of viewport, full width, z-30 (below marquee z-40), `pointer-events-none`
- **Effect:** 120px tall `linear-gradient(transparent → var(--color-bg))` — content fades out smoothly before reaching the bottom
- **Marquee-aware:** Sits above the marquee when visible (bottom: 47px), flush to viewport bottom when hidden
- **Transition:** `bottom` animates 300ms ease to follow marquee show/hide
- **Rendered in:** `app/layout.tsx` (global, all pages)

### 6. Theme Palette Picker
- **Trigger:** Click the palette icon in sidebar (desktop) or top bar (mobile)
- **Desktop:** Fixed panel, 200px wide, anchored to bottom-right of palette button. `var(--color-surface-raised)` background, `1px var(--color-border)`, 14px border-radius. Animates in with Framer Motion spring scale from `transform-origin: top left` (scale 0.85→1, stiffness 500, damping 32).
- **Mobile:** Bottom sheet, full width, rounded top 14px, slides up with spring animation. Semi-transparent backdrop overlay.
- **Dismiss:** Click outside (transparent backdrop on desktop, dark overlay on mobile) or press Escape
- **Color section:** 6-column grid of 12 accent-colored circles (light, dark, + 10 colored themes). Active swatch has 2px accent ring via `box-shadow`.
- **Font section:** 3 square cards in a row showing "Aa" in each pairing's display font. Active card has 2px accent ring. No text labels.
- **Action buttons:** 3 square icon buttons in a row: `-` (decrease font size), `↻` (reset all to defaults: light theme, Default font, base size), `+` (increase font size). Disabled state at 35% opacity when at min/max bounds.
- **Persistence:** Color theme via `theme-mode` + `colored-theme-name`, font pairing via `font-pairing`, font size via `font-size-offset` — all in localStorage.

### 7. Marquee Banner
- Fixed to bottom of viewport, full-width
- Pull quotes from LinkedIn recommendations
- Toggleable via sidebar smiley icon

### 8. No footer in main content
- Email/LinkedIn/ThemeToggle/MarqueeToggle as icon buttons in sidebar
- Copyright line removed

---

## Dynamic Bio Feature

A 2D control grid (6×6) allowing visitors to adjust the bio between Casual↔Professional and Concise↔Verbose axes.

### Key Files

**State Management:**
- `lib/dynamic-bio-store.ts` — Global state with `useSyncExternalStore`, localStorage persistence. Exports `useBioMode`, `useGridPosition`, `useDynamicBio`.
- `lib/feature-flags.ts` — Feature toggle utilities (currently unused but available)

**Content:**
- `lib/bio-content.ts` — Contains:
  - Classic bio (`PARAGRAPHS`, `PROMPTS`, `HEADING_TEXT`)
  - 36 `BioVariant` entries with `heading` and `paragraphs` for each grid position
  - Helper functions: `getVariant()`, `getSurroundingVariants()`

**Components:**
- `components/dynamic-bio/DynamicBioGrid.tsx` — 6×6 draggable grid with axis lines and labels
- `components/dynamic-bio/DynamicBioText.tsx` — Bio display with streaming transitions
- `components/dynamic-bio/BioDiffStream.tsx` — Word diff animation (currently unused, replaced with simpler transition)
- `components/dynamic-bio/DynamicBioMinimizedHint.tsx` — Collapsed hint button (currently unused)
- `components/dynamic-bio/index.ts` — Exports

**Integration:**
- `components/Hero.tsx` — Dual-mode support (Classic vs Dynamic)
- `components/ThemePalette.tsx` — Contains Dynamic Bio toggle and embedded grid
- `components/Nav.tsx` — Passes bio state to ThemePalette

**Utilities:**
- `lib/bio-interpolation.ts` — Word diff algorithm (available but not actively used)
- `hooks/useMediaQuery.ts` — Desktop/mobile detection (`useIsDesktop()`, `useIsMobile()`)

### Grid System

- **Grid size:** 6×6 = 36 positions
- **X-axis (horizontal):** Casual (left, x=0) → Professional (right, x=5)
- **Y-axis (vertical):** Concise (top, y=0) → Verbose (bottom, y=5)
- **Interaction:** Draggable circle, snaps to grid dots on release
- **Visuals:** SVG axis lines through center, axis labels at edges
- **Constants:** `GRID_SIZE=6`, `DOT_SIZE=6`, `DOT_GAP=24`, `HANDLE_SIZE=20`

### Heading Variants (by x position)

| X Position | Heading Examples |
|------------|------------------|
| x=0 | "Hey! I'm Marco." |
| x=1 | "Hi, I'm Marco." / "Hi, I'm Marco. I design software." |
| x=2 | "I'm Marco Sevilla." / "I'm Marco Sevilla. I design software in San Francisco." |
| x=3 | "Hi, I'm Marco. I design software in San Francisco." |
| x=4 | "Marco Sevilla — Product Designer" / "Marco Sevilla — Product Designer in San Francisco" |
| x=5 | "Marco Sevilla, Senior Product Designer" / "Marco Sevilla, Senior Product Designer — San Francisco" |

### Transition Flow

1. User moves grid handle
2. Old content fades out quickly (100ms)
3. Blinking star (✸) displays for ~2.3 seconds (1s blink rate, matching intro)
4. Heading streams in word by word
5. Bio paragraphs stream in sequentially

**Phase state machine:** `"idle" | "loading" | "streaming-heading" | "streaming-bio"`

### localStorage Keys

- `bio-mode`: `"classic"` | `"dynamic"`
- `bio-grid-position`: JSON `{x: number, y: number}`

### Mobile Behavior

- Grid hidden on mobile (via `useIsMobile()` hook)
- Always shows Classic bio (progressive disclosure)
- Dynamic Bio toggle not shown in mobile ThemePalette

### Default Position

- `x=2, y=2` — Balanced center position

---

## Pages & Routes

| Route | Content | Status |
|-------|---------|--------|
| `/` | Hero + bio + case study list + marquee | Built |
| `/work/fb-ordering` | F&B Mobile Ordering case study | Built (full content, image placeholders) |
| `/work/compendium` | Digital Compendium case study | Built (full content, image placeholders) |
| `/work/upsells` | Upsells Forms case study | Built (full content, image placeholders) |
| `/work/checkin` | Hotel Check-in case study | Built (basic content, image placeholders) |
| `/work/general-task` | General Task case study | Built (full content, image placeholders) |
| `/work/design-system` | Design System case study | Built (full content, image placeholders) |
| `/work/[slug]` | Fallback for non-dedicated routes | Built (placeholder fallback, currently unused) |
| `/writing` | Title + "Coming soon." with FadeIn animation | Built (shell) |
| `/play` | Title + "Coming soon." with FadeIn animation | Built (shell) |

---

## Content System

### How case studies work
Each project is an `.mdx` file in the `content/` folder with frontmatter:

```mdx
---
title: "F&B Ordering Platform"
subtitle: "0→1 mobile ordering for hotels"
slug: "fb-ordering"
order: 1
thumbnail: "/images/fb-ordering-thumb.jpg"
published: true
year: "2025–26"
gradient: "linear-gradient(135deg, #f5af19 0%, #f12711 100%)"
---
```

- **Add a case study**: Create a new `.mdx` file, add frontmatter
- **Remove a case study**: Delete the file or set `published: false`
- **Reorder**: Change the `order` number
- No code changes needed

### Case Study Status (All 6 Built)
| Case Study | Type | Key Metrics | Image Placeholders |
|------------|------|-------------|-------------------|
| F&B Ordering | Hero piece | 100% ownership, 30 iterations in 4-day sprint | 18 |
| Digital Compendium | Platform story | $1M+ CARR, 82% adoption, 175K MAU | ~16 (inline + gallery) |
| Upsells Forms | Workflow design | $3.8M CARR, 80% approval rate | ~12 (inline + gallery) |
| Hotel Check-in | Enterprise scale | $3.5M ARR, 6,000 properties | 5 |
| General Task | Startup story | #2 Product Hunt, Y Combinator W23 | 8 |
| Design System | Foundational | 40% faster turnaround, 100+ components | 8 |

**Total image placeholders to replace:** ~67

See `portfolio_case_study_plan.md` for full framing guidance and `VISUAL-EXPORT-GUIDE.md` for export specs.

### Asset status
- Case study thumbnails/mockups: **not yet created** — referenced in frontmatter but 404 at runtime
- Will be added later

---

## Components Overview

| Component | File | Purpose |
|-----------|------|---------|
| Nav | `components/Nav.tsx` | Fixed sidebar (desktop) / top bar (mobile), animated star, hover interactions, unified SidebarIcon for all icon buttons |
| ThemeToggle | `components/ThemeToggle.tsx` | Theme/font state management. Exports `useThemeState` hook (select light/dark/colored, select font pairing, increase/decrease/reset font size), `PaletteIcon`, `coloredThemes`, `fontPairings`, apply/clear helpers. Legacy `useThemeCycle` kept for compat. |
| ThemePalette | `components/ThemePalette.tsx` | Palette panel UI: color swatches (accent-filled circles), font pairing cards ("Aa" previews), action buttons (-/reset/+), Dynamic Bio toggle with embedded grid. Desktop: fixed side panel with scale animation. Mobile: bottom sheet (no bio grid). |
| MarqueeContext | `components/MarqueeContext.tsx` | React context + provider for marquee visibility state, localStorage persistence |
| Marquee | `components/Marquee.tsx` | Fixed-bottom scrolling pull quotes banner, Framer Motion slide animation |
| Hero | `components/Hero.tsx` | Orchestrates intro state machine, expand logic, renders StreamingText + InlineExpandButton. Dual-mode support (Classic vs Dynamic). Accepts `onIntroReady` prop. SessionStorage intro skip. |
| StreamingText | `components/StreamingText.tsx` | `RenderParagraph` (static), `StreamingParagraph` (word-by-word with links), `StreamingWords` (plain word-by-word). Extracted from Hero. |
| InlineExpandButton | `components/InlineExpandButton.tsx` | Inline "+" button with portaled tooltip (createPortal to body). Mounted state guard for SSR. Extracted from Hero. |
| Bio content | `lib/bio-content.ts` | Types (`Segment`, `Paragraph`), `PARAGRAPHS` data, `PROMPTS`, `MAX_LEVEL`, `HEADING_TEXT`, `HEADING_WORDS`. Extracted from Hero. |
| usePrefersReducedMotion | `hooks/usePrefersReducedMotion.ts` | Reusable hook for `prefers-reduced-motion` media query. Extracted from Hero. |
| useMediaQuery | `hooks/useMediaQuery.ts` | Reusable hooks: `useMediaQuery(query)`, `useIsDesktop()`, `useIsMobile()` |
| DynamicBioGrid | `components/dynamic-bio/DynamicBioGrid.tsx` | 6×6 draggable grid with axis lines, snaps to dots on release |
| DynamicBioText | `components/dynamic-bio/DynamicBioText.tsx` | Bio display with loading star + streaming heading/paragraph transitions |
| dynamic-bio-store | `lib/dynamic-bio-store.ts` | Global state for bio mode + grid position. Exports `useBioMode`, `useGridPosition`, `useDynamicBio` |
| HomeLayout | `components/HomeLayout.tsx` | Client component bridging Hero's `onIntroReady` to SectionSnap's `peekVisible`. Passes work/marquee as children. |
| SectionSnap | `components/SectionSnap.tsx` | Two-panel snap layout (Bio max-w-content-md / Work max-w-content-lg) with elastic rubber-band scroll, immediate snap on threshold, scroll cooldown, keyboard nav, scrollable bio panel. |
| CaseStudyList | `components/CaseStudyList.tsx` | CSS grid (1st full-width, rest 2-col), staggered FadeIn, no heading |
| CaseStudyCard | `components/CaseStudyCard.tsx` | Bento card with frosted glass bg (40% opacity + backdrop-blur), scroll-based parallax (±30px), soft shadow, mouse-tracking via CSS custom properties (`--mouse-x`/`--mouse-y`), group-hover opacity. |
| ViewportFade | `components/ViewportFade.tsx` | Fixed bottom-of-viewport gradient fade, marquee-aware positioning, `z-[32]` |
| FadeIn | `components/FadeIn.tsx` | Reusable scroll-triggered fade-in animation wrapper |
| SectionSnapContext | `components/SectionSnapContext.tsx` | Global event bus for cross-tree panel switching (Nav ↔ SectionSnap). Exports `useActivePanel`, `requestGoToWork`, `requestGoToBio`, `setActivePanel`. |
| CaseStudyPage | `app/work/[slug]/CaseStudyPage.tsx` | Generic case study detail display (used for non-custom case studies) |
| CaseStudyHero | `components/case-study/CaseStudyHero.tsx` | Full-bleed gradient hero: split title (left) / subtitle (right), rounded-top mockup placeholder, unique gradient per study. Props: `title`, `subtitle`, `gradient: [string, string]`, `heroImageDescription?` |
| QuickStats | `components/case-study/QuickStats.tsx` | 4-stat grid with large accent numbers + labels |
| ImagePlaceholder | `components/case-study/ImagePlaceholder.tsx` | Labeled gray box with configurable aspect ratio |
| ExpandableSection | `components/case-study/ExpandableSection.tsx` | Collapsed on mobile (tap to expand), always visible on desktop. CSS grid animation. |
| StickyTOC | `components/case-study/StickyTOC.tsx` | Sticky sidebar TOC with IntersectionObserver active states (lg+ only) |
| NextProject | `components/case-study/NextProject.tsx` | Text link with hover-reveal subtitle |
| PullQuote | `components/case-study/PullQuote.tsx` | Accent left-border blockquote with attribution |
| ProgressBar | `components/case-study/ProgressBar.tsx` | 2px fixed reading progress bar at page top |
| InlineExpandButton | `components/InlineExpandButton.tsx` | Desktop: inline "+" with hover tooltip. Mobile: tappable pill with prompt text. |
| CaseStudyDialog | `components/CaseStudyDialog.tsx` | Modal overlay (z-51/52) with `next/dynamic` content loading, `max-w-content-lg` sheet, hash-based URL, AnimatePresence transitions |
| CaseStudyDialogContent | `components/CaseStudyDialogContent.tsx` | Dynamic content loader mapping slugs to content components via `next/dynamic` |
| ScrollContainerContext | `lib/ScrollContainerContext.tsx` | Provides scroll container ref for ProgressBar/StickyTOC to track scroll inside dialog |
| CaseStudyDialogContext | `lib/CaseStudyDialogContext.tsx` | Dialog open/close state, slug tracking, used by CaseStudyCard to open dialog |
| FBOrderingContent | `app/work/fb-ordering/FBOrderingContent.tsx` | Full F&B Ordering case study — gradient `#EF5A3C`, post-hero content in `max-w-content` wrapper |
| CompendiumContent | `app/work/compendium/CompendiumContent.tsx` | Full Compendium case study — gradient `#2563EB`, $1M CARR, 82% adoption |
| UpsellsContent | `app/work/upsells/UpsellsContent.tsx` | Full Upsells Forms case study — gradient `#0D9488`, $3.8M CARR |
| CheckinContent | `app/work/checkin/CheckinContent.tsx` | Hotel Check-in case study — gradient `#6366F1` (5 image placeholders) |
| GeneralTaskContent | `app/work/general-task/GeneralTaskContent.tsx` | General Task case study — gradient `#334155`, Y Combinator W23 |
| DesignSystemContent | `app/work/design-system/DesignSystemContent.tsx` | Design System case study — gradient `#8B5CF6`, 100+ components |

### Deleted components
- `About.tsx` — absorbed into Hero bio section
- `Footer.tsx` — links moved to sidebar Nav

---

## Performance & Accessibility Targets

### Performance
- Static generation (SSG) via `output: 'export'` in next.config.mjs
- Images unoptimized (static export limitation)
- Custom fonts self-hosted in `/public/fonts/` with `font-display: swap`
- **Lighthouse target: 95+** across all categories

### Accessibility
- Semantic HTML (`main`, `nav`)
- Skip-to-content link
- Focus-visible styles on all interactive elements
- WCAG AA color contrast in both themes
- `prefers-reduced-motion` disables all animations
- Alt text on all images
- Keyboard navigable throughout

### Responsive
- Mobile-first Tailwind breakpoints
- Sidebar collapses to top bar below `md` (768px)
- Hover interactions → inline content on mobile
- Fluid typography with `clamp()` for H1 and subtitle
- Mobile top padding: `pt-24` (96px) vs desktop `pt-[18vh]`

---

## Bio Copy (current)

**Heading (H1):** "Hi, I'm Marco. I design software in San Francisco."

**Paragraph 1 (Level 1):** "With seven years of experience across consumer and enterprise products, I currently work at the intersection of systems thinking and visual craft. At [Canary Technologies](https://www.canarytechnologies.com/), I design platforms that serve millions of hotel guests and staff globally — building everything from 0→1 products to scalable design systems across Marriott, Wyndham, Best Western, and IHG."

**Paragraph 2 (Level 2):** "Before Canary, I helped democratize wine discovery for millions of users at [Vivino](https://www.vivino.com/), made animated video production more accessible at [Vyond](https://www.vyond.com/), and built an all-in-one productivity tool for software engineers at [General Task](https://www.generaltask.com/)."

**Paragraph 3 (Level 3):** "Growing up in the Bay Area, I spent countless hours on PCs my dad custom-built — creating worlds in simulation games, experimenting with video editing and photo manipulation. Those digital playgrounds sparked my fascination with technology as a creative tool and set me on the path to software design."

**Paragraph 4 (Level 4):** "Ultimately, my goal is to build beautifully crafted products that give people a sense of ease and expand what's possible. I care deeply about the details — the micro-interactions, the typography, the moments that make software feel human. I'm drawn to emerging technologies and how they'll reshape human creativity — it's what keeps me experimenting and pushing my craft forward."

**Paragraph 5 (Level 5):** "Outside of product work, I'm a [photographer](https://www.marcosevilla.photo/), an occasional web developer, and someone who's always experimenting with new tools and ways of making things. When I'm not designing, you'll find me shooting concerts and street photography, singing, or on the pickleball court."

**Paragraph 6 (Level 6):** "I'm always open to connecting — whether it's about a role, a project, or just to talk shop. Reach me at [marcogsevilla@gmail.com](mailto:marcogsevilla@gmail.com) or find me on [LinkedIn](https://www.linkedin.com/in/marcogsevilla/)."

---

## Marquee Quotes (current)

1. "A rare, talented designer with an endless stamina for feedback and continuous improvement." — Kevin Doherty
2. "He showed up again and again to ensure things were not only done on time, but that they were done well." — Hans van de Bruggen
3. "You'd be lucky to have him on your team." — Hans van de Bruggen
4. "Rare ability to balance strategic business thinking with exceptional craft." — EJ Lee
5. "A gift for turning ambiguity into clarity." — EJ Lee
6. "Teams are better, happier, and more effective with Marco on them." — EJ Lee

---

## Attempted & Reverted

- **Chromatic aberration fade-in on hero H1** — Tried CSS `text-shadow` with RGB offset keyframe animation converging to center. Looked interesting but didn't match the portfolio's clean feel. Removed.
- **14px base font size** — Tried 14px body text, felt too small. Reverted to 16px.
- **Per-link unique hover colors** — Nav links originally had unique warm hover colors (copper, terracotta, amber, coral). Simplified to all use accent/copper on hover for consistency with icon buttons.
- **Gradient background bento cards** — First version of bento cards used vivid per-project gradient backgrounds with white text. Switched to surface-raised background with foreground-colored text + copper border glow for better readability and theme consistency.
- **Framer Motion spring on card scale** — Initially used `useSpring` for card hover scale. Replaced with pure CSS transitions to match Stripe's asymmetric timing (faster in, slower out) and reduce JS bundle size.
- **Two-tone split color swatches** — Initial palette version showed half bg / half accent for each swatch. Simplified to accent-color-only solid circles for cleaner look.
- **Text labels in palette** — Initial version had "Color" and "Font" section headers and pairing names below font cards. Removed all labels for a cleaner, icon-only interface.
- **300px palette panel** — First version was 300px wide with 20px padding. Scaled down to 2/3 size (200px, 14px padding) for a more compact feel.
- **Slide-in panel animation** — First version slid in from left (x: -24→0). Changed to scale-from-anchor animation (scale 0.85→1 with `transform-origin: top left`, anchored to button's bottom-right).
- **Random colored theme selection** — Original theme cycle randomly selected a colored palette. Replaced with direct selection via palette picker grid.
- **PP Editorial New as default display font** — Initially the hero "Marco Sevilla" used PP Editorial New Italic. Changed default display to PP Formula SemiExtended (bold upright). PP Editorial New moved to "Classic" font pairing.
- **Chat-style question pills** — Bio originally used right-aligned chat bubble pills (question + answer pattern) with "−" collapse button. Replaced with inline "+" button at end of paragraph text with hover tooltip showing the next question. Simpler, less chat-app-like.
- **Card pinning system** — Cards originally pinned to bottom of viewport when expanding bio (60px peek, 45% opacity). Evolved through several iterations (scroll-to-unpin, elastic resistance) before being completely replaced by the two-panel SectionSnap architecture.
- **Elastic scroll resistance values** — Iterated through multiple resistance levels: c=0.55 (too loose) → c=0.25 (better) → c=0.12 (final, stiff resistance matching Apple feel).
- **✦ star indicators on links** — All inline links had small ✦ stars after them. Removed for cleaner look.
- **LinkedIn URL** — Updated from `linkedin.com/in/marcosevilla` to `linkedin.com/in/marcogsevilla/`.

---

## Recent Changes (2026-02-07)

### Stripe-Inspired Width System
- Added Tailwind tokens: `content-md` (900px), `content-lg` (1264px) alongside existing `content` (650px)
- SectionSnap bio panel → `max-w-content-md`, work panel → `max-w-content-lg`
- CaseStudyDialog sheet → `max-w-content-lg`, inner content constraint removed for full-bleed hero
- Padding standardized: `px-4 sm:px-8` (16px mobile, 32px tablet+)
- `layout.tsx` decoupled: removed `max-w-content` + padding from `<main>`, pages handle own constraints
- `/writing`, `/play` → `max-w-content`, `/work` → `max-w-content-lg`

### CaseStudyHero Full Redesign
- Replaced typographic hero (back link, title, subtitle, metadata grid) with full-bleed gradient header
- Split layout: title left (~60%), subtitle right (~40%) on desktop; stacks on mobile
- Rounded-top mockup placeholder embedded at bottom of gradient block
- Unique gradient per case study (6 color pairs)
- Removed `meta` prop — metadata moved out of hero
- Removed "← Back to Work" link (dialog X button handles close)
- Full-width on BOTH dialog and standalone pages

### Content Component Updates (all 6)
- Removed `const META` arrays
- Hero now uses `gradient={[color1, color2]}` + `heroImageDescription="..."`
- Removed hero `<FadeIn><ImagePlaceholder>` (now embedded in hero component)
- Wrapped post-hero content in `<div className="max-w-content mx-auto px-4 sm:px-8">`
- Standalone `page.tsx` files use `-mt-24 md:-mt-[18vh]` to counteract layout padding

### Bug Fixes
- Fixed `getServerSnapshot` infinite loop in `dynamic-bio-store.ts` (cached SERVER_SNAPSHOT as module-level constant)
- Fixed dialog z-index: Nav (z-50) was visible over dialog overlay → bumped to z-[51] backdrop, z-[52] sheet

---

## Recent Changes (2026-02-06)

### Case Studies Migrated
- **Compendium** — Full rich content with $1M+ CARR stats, 82% adoption, 4 key design decisions, research/process/impact/reflection sections, 16 image placeholders
- **Upsells Forms** — Full rich content with $3.8M CARR stats, "Dream come true" quote, code prototype story, 12 image placeholders
- Both follow the same component pattern as F&B Ordering (CaseStudyHero, QuickStats, StickyTOC, ExpandableSection, etc.)

### Homepage Reordered
New card order optimized for job applications:
1. F&B Ordering → 2. Compendium → 3. Upsells → 4. Check-in → 5. General Task → 6. Design System

### DEDICATED_ROUTES Updated
All 6 case studies now have custom React pages:
```typescript
const DEDICATED_ROUTES = new Set(["fb-ordering", "compendium", "upsells", "checkin", "general-task", "design-system"]);
```

### Documentation Created
- `VISUAL-EXPORT-GUIDE.md` — Comprehensive export specs for 67 visuals with Figma node links, priority tiers
- `PORTFOLIO-PRIORITIES.md` — Tier 0-3 prioritization, one-week timeline, red flags checklist

### Folder Structure Reorganized
- Renamed `portfolio context docs/` → `docs/`
- Moved loose files to `docs/`
- Moved meta docs from `case-studies/` to `docs/`
- Created `archive/` with subfolders for old assets
- Renamed `portfolio archive (2023)` → `archive/2023-job-search`

### Bug Fixes
- Fixed TypeScript error in `BioDiffStream.tsx` (Set iteration)
- Added placeholder handling for empty `generateStaticParams()` in dynamic route

### Retroactive Case Study Markdown Files Created
Created markdown source files for the 3 case studies that were missing from `case-studies/`:
- `general-task.md` — Extracted from GeneralTaskContent.tsx (9.2 KB, 8 sections, 8 image placeholders)
- `design-system.md` — Extracted from DesignSystemContent.tsx (11.6 KB, 9 sections, 8 image placeholders)
- `hotel-checkin.md` — Extracted from CheckinContent.tsx (5.3 KB, 6 sections, 5 image placeholders)

These follow the same format as compendium.md (CARD VIEW, Hero Section, ASCII Quick Stats table, [TODO: Visual] markers).

Note: `hotel-checkin.md` is separate from `checkin-dashboard-2.md` — the former is the general Check-in overview, the latter is a deep-dive on Dashboard 2.0.

---

## Architecture Notes

- **Work nav is an anchor link, not a route:** "Work" in the sidebar links to `/#work`. On the homepage, clicking it dispatches a `section-snap:go-to-work` custom event (via `SectionSnapContext.tsx`) which SectionSnap listens for. From other pages, Next.js navigates to `/#work` and SectionSnap detects the hash on mount. The standalone `/work` index page was deleted — only `/work/[slug]` routes remain. `SectionSnapContext.tsx` uses a global store (`useSyncExternalStore`) to broadcast `activePanel` so Nav can highlight "Home" when on bio and "Work" when on the work panel or any `/work/[slug]` page.
- **Standalone Work page deleted:** `app/work/page.tsx` and `app/work/WorkContent.tsx` removed. These files may reappear after `npm install` (unclear why) — delete them if they do.
- **Writing/Play pages** use server components with `FadeIn` wrapper (already a client component) to keep `export const metadata` working.
- **ThemeToggle refactored** to export `useThemeState` hook with direct selection methods (selectLight, selectDark, selectColored, selectFont, increaseFontSize, decreaseFontSize, resetAll). Nav uses `useThemeState` + `PaletteIcon` for sidebar integration. Old `useThemeCycle` kept as legacy wrapper. `ThemePalette` is a separate component rendered by Nav in both desktop (side panel) and mobile (bottom sheet) variants.
- **Two-panel snap layout:** `SectionSnap.tsx` uses `position: fixed; inset: 0; z-[31]` to overlay the viewport. Both panels are `position: absolute; inset: 0`, transitioning via `translateY`. Bio panel uses `max-w-content-md` (900px), work panel uses `max-w-content-lg` (1264px). Both panels are internally scrollable (`overflowY: auto`) when active. Bio panel snap-to-work only triggers when scrolled to bottom. Elastic rubber-band uses Apple's formula with immediate snap on threshold (no debounce wait). 150ms cooldown after internal scrolling prevents accidental snaps from momentum.
- **Case study dialog overlay:** `CaseStudyDialog.tsx` renders a modal overlay (z-[51] backdrop, z-[52] sheet) with the case study content loaded via `next/dynamic`. Sheet is `max-w-content-lg` (1264px). Inner content has no constraint wrapper — the full-bleed CaseStudyHero handles its own width, and post-hero content is wrapped in `max-w-content` by each content component. `ScrollContainerContext` provides scroll tracking for ProgressBar/StickyTOC inside the dialog. URL updates via `history.pushState` (hash-based).
- **Layout decoupling:** `layout.tsx`'s `<main>` only provides `pt-24 md:pt-[18vh] pb-20` — no `max-width` or horizontal padding. Each page adds its own constraints: `/writing` and `/play` use `max-w-content`, `/work` uses `max-w-content-lg`, case study standalone pages use negative top margin (`-mt-24 md:-mt-[18vh]`) to allow the gradient hero to reach the top edge.
- **CaseStudyHero is full-bleed:** The hero gradient background spans the full width of the dialog sheet or page. The title/subtitle and mockup placeholder inside the hero are constrained to `max-w-content-md`. Post-hero content is wrapped by each content component in `max-w-content`. The `meta` prop was removed — metadata moved out of the hero.
- **HomeLayout bridges server and client:** `page.tsx` (server) passes pre-fetched case studies to `HomeLayout` (client) which manages the `peekVisible` state between Hero's intro completion and SectionSnap's button visibility.
- **Tooltip portaling:** The "+" expand buttons in Hero use `createPortal(tooltip, document.body)` because the parent `motion.div` has `overflow: hidden` for height animation. Tooltip position is calculated from `getBoundingClientRect()`.
- **Font system uses CSS variables** (`--font-display`, `--font-heading`, `--font-body`, `--font-mono`, `--font-heading-style`, `--font-size-offset`). All components reference vars instead of hardcoded font names. Font pairing selection and size scaling update these vars on `document.documentElement.style`.

---

## Known Issues & Planned Fixes

Identified during code critique (2026-02-01).

**Completed:**
1. ~~**Hero.tsx too large (~522 lines)**~~ — Split into `lib/bio-content.ts`, `hooks/usePrefersReducedMotion.ts`, `components/StreamingText.tsx`, `components/InlineExpandButton.tsx`. Hero now ~199 lines.
2. ~~**Mouse-tracking creates new inline styles every mousemove**~~ — CaseStudyCard now uses CSS custom properties (`--mouse-x`/`--mouse-y`) via `el.style.setProperty()`. Glow uses `var()` in CSS. Zero React re-renders on mousemove.
3. ~~**No sessionStorage for intro completion**~~ — Stores `portfolio-intro-seen` in sessionStorage. Checked in `useEffect` (not render) to avoid hydration mismatch.
4. ~~**No keyboard navigation for SectionSnap**~~ — Arrow Down/Space/Enter on bio → work. Arrow Up at top of work → bio. `aria-hidden` on inactive panel.
5. ~~**Dead `arrow` property in content data**~~ — Removed from types, data, and all rendering code.
6. ~~**Inline styles everywhere**~~ — SectionSnap outer wrapper, panels, button, bio layout converted to Tailwind. InlineExpandButton converted to Tailwind.
7. ~~**SectionSnap `willChange: transform` always on**~~ — Removed from elastic indicator. Added `will-change-transform` to panel divs (needed for GPU compositing during transitions).

8. ~~**"+" expand button invisible on mobile**~~ — Mobile now shows a tappable pill button with prompt text (e.g. "What else have you worked on? +"). Desktop keeps the inline "+" with hover tooltip.

**Remaining:**
9. **Streaming renderer O(n²)** — `StreamingParagraph` re-slices the flat word array on every render. Could memoize or use incremental reveal.

---

## Case Study Pages

### Architecture
- **Per-case-study React components + shared primitives** — each case study is a dedicated route (`app/work/[slug]/page.tsx`) with content hardcoded in a client component. Shared primitives in `components/case-study/`.
- **`[slug]` fallback** — `app/work/[slug]/page.tsx` still handles non-custom case studies with the basic CaseStudyPage renderer. Custom routes (e.g. `fb-ordering`) are excluded from `generateStaticParams` via a `DEDICATED_ROUTES` set.
- **Body text bumped to 18px** on case study pages (vs 16px site default) per playbook recommendation.

### Page Layout
```
[ProgressBar — 2px accent, fixed top, z-50]
[CaseStudyHero — FULL-BLEED gradient background]
  [Title (left, ~60%) + Subtitle (right, ~40%) — white text on gradient]
  [Rounded-top mockup placeholder — bg-color, 16:9 aspect ratio]
[max-w-content (650px) constrained content below:]
  [QuickStats — 4 large accent numbers]
  [TOC sidebar (lg+)] + [Main content column]
    [The Problem]
    [The Solution + Key Design Decisions + image placeholders]
    [Research & Discovery — expandable on mobile]
    [Design Process — expandable on mobile]
    [Impact & Results — expandable on mobile]
    [Reflection — expandable on mobile]
    [Visual Gallery — 2-col grid of placeholders]
    [Next Project → hover-reveal link]
```

### CaseStudyHero Gradient Colors
| Study | gradient[0] | gradient[1] |
|-------|-------------|-------------|
| F&B Ordering | `#EF5A3C` | `#ED4F2F` |
| Compendium | `#2563EB` | `#1D4ED8` |
| Upsells | `#0D9488` | `#0F766E` |
| Check-in | `#6366F1` | `#4F46E5` |
| General Task | `#334155` | `#1E293B` |
| Design System | `#8B5CF6` | `#7C3AED` |

### Built Case Studies
| Case Study | Route | Order | Status |
|------------|-------|-------|--------|
| F&B Mobile Ordering | `/work/fb-ordering` | 1 | Built (content complete, image placeholders) |
| Digital Compendium | `/work/compendium` | 2 | Built (content complete, image placeholders) — $1M+ CARR, 82% adoption |
| Upsells Forms | `/work/upsells` | 3 | Built (content complete, image placeholders) — $3.8M CARR, "Dream come true" quote |
| Hotel Check-in | `/work/checkin` | 4 | Built (basic content, image placeholders) |
| General Task | `/work/general-task` | 5 | Built (content complete, image placeholders) |
| Design System | `/work/design-system` | 6 | Built (content complete, image placeholders) |

### DEDICATED_ROUTES
All 6 case studies have custom React component pages (no MDX-based rendering):
```typescript
const DEDICATED_ROUTES = new Set(["fb-ordering", "compendium", "upsells", "checkin", "general-task", "design-system"]);
```

### Homepage Card Order (optimized for job applications)
1. **F&B Ordering** — Newest Canary work, 100% ownership, strong metrics
2. **Digital Compendium** — Platform thinking, $1M+ CARR, 18-month scope
3. **Upsells Forms** — Workflow design, $3.8M CARR, code prototype story
4. **Hotel Check-in** — Enterprise scale (Marriott, Best Western, IHG, Wyndham)
5. **General Task** — Startup experience (2022), Y Combinator validation
6. **Design System** — Foundational work (2022)

### Case Study Follow-up Tasks
**Completed:**
1. ~~Build Compendium case study page~~ — Rich content with $1M CARR stats, 82% adoption, 4 key decisions, Figma links
2. ~~Build Upsells Forms case study page~~ — Rich content with $3.8M CARR stats, "Dream come true" quote, code prototype story
3. ~~Build General Task case study page~~ — Full content with research, process, Y Combinator validation
4. ~~Build Design System case study page~~ — Full content with audit findings, component library
5. ~~Reorder homepage cards~~ — Optimized for job applications (Canary work first)
6. ~~Create VISUAL-EXPORT-GUIDE.md~~ — Comprehensive export specs for all 67 visuals with Figma node links

**Remaining (Priority Order):**
1. **Export P0 hero images** (7 total) — One hero per case study, non-negotiable before applying
2. **Export P1 key decision images** (26 total) — Support narrative, show thinking
3. Add full-bleed breakout images once assets exist
4. Consider before/after slider component for redesign case studies (Check-in)
5. Add embedded prototype video/GIF for F&B code prototype section
6. Add estimated reading time to hero metadata
7. Add breadcrumb navigation
8. Polish Check-in case study (weakest content)

---

## Related Files

### Folder Structure (reorganized 2026-02-06)
```
portfolio/
├── docs/                    # All documentation (this folder)
├── case-studies/            # Case study content files (6)
├── archive/                 # Historical/unused files
│   ├── 2023-job-search/     # Old portfolio assets
│   ├── company-logos/       # Unused logo files
│   ├── redundant-canary-docs/  # Superseded versions
│   └── misc/                # Old templates
└── site/                    # Next.js app
```

### Documentation (docs/)
- `portfolio_build_context.md` — This file (main reference)
- `portfolio_case_study_plan.md` — Prioritized project selection, narrative arcs, framing strategy
- `marco_canary_portfolio.md` — Merged Canary impact documentation (raw reference data)
- `designer-identity.md` — Designer positioning and identity
- `portfolio-inspiration-analysis.md` — Reference portfolio analysis
- `designer-portfolios.md` — Reference portfolios from Stripe, Vercel, Notion designers
- `TEXTURE_FEATURE_NOTES.md` — Background texture implementation notes

### Job Application Guides (docs/)
- `VISUAL-EXPORT-GUIDE.md` — Export specs for all 67 visuals, priority tiers (P0-P3), Figma node links
- `PORTFOLIO-PRIORITIES.md` — Tier 0-3 prioritization framework, one-week timeline, checklist
- `CASE-STUDY-PLAYBOOK.md` — Process guide for writing case studies + visual/UX best practices
- `CASE-STUDY-ASSESSMENT.md` — Evaluation of all 6 case studies against best practices

### Case Study Content (case-studies/)
**Canary Technologies:**
- `fb-mobile-ordering.md` — F&B case study content (migrated to React)
- `compendium.md` — Compendium case study content (migrated to React 2026-02-06)
- `upsells-forms.md` — Upsells Forms case study content (migrated to React 2026-02-06)
- `hotel-checkin.md` — Hotel Check-in overview (created retroactively 2026-02-06)
- `checkin-dashboard-2.md` — Check-in Dashboard 2.0 deep-dive
- `above-property-portal.md` — Above Property Portal case study content
- `knowledge-base-redesign.md` — Knowledge Base Redesign case study content

**General Task:**
- `general-task.md` — General Task case study content (created retroactively 2026-02-06)
- `design-system.md` — Design System case study content (created retroactively 2026-02-06)

### Archive (archive/)
- `2023-job-search/` — Old portfolio from 2023 job search (resumes, cover letters, visuals)
- `company-logos/` — Logo files (unused in current site)
- `redundant-canary-docs/` — Superseded portfolio versions (_brief, _comprehensive, _structured)
- `misc/` — Old templates (canary-work-summary.md, case-study-template.md)

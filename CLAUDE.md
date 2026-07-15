# Marco Sevilla Portfolio - Project Context

## Safety Rules
- Always commit working state before starting a new feature or risky change
- Commit between phases of multi-step features (not just before starting)
- Make small incremental changes and verify each one works before proceeding
- After any file edit, verify the dev server still runs (`npm run dev` in `site/`)
- After any structural change (new context, new component, new route), verify the dev server before continuing
- If the dev server breaks, revert immediately — do not spiral through 5+ fix attempts
- If 2 consecutive fix attempts fail on the same issue, stop and reassess the approach
- Never make large architectural changes (new contexts, event buses, animation libraries) without confirming the current approach is insufficient first

## Development Approach
- Propose your approach before implementing non-trivial features — outline 2-3 options with tradeoffs
- Prefer the simplest solution that works; do not over-engineer
- Never guess or fabricate values for visual properties (colors, fonts, animation parameters) — ask for exact values
- When debugging build failures, check for package corruption (especially framer-motion) before assuming code changes caused the problem

## Known Gotchas
- framer-motion packages have corrupted before — if you see weird build errors after no code changes, try `rm -rf node_modules && npm install` in `site/`
- The BackgroundTexture component is sensitive — changes to it have broken the entire dev server in the past. Tread carefully and commit before touching it
- All code lives in `site/` — run all npm commands from there, not the project root
- After making config changes (`.claude/settings.json`, hooks, MCP configs), inform the user if a session restart is needed for changes to take effect
- The PostToolUse hook runs `tsc --noEmit` after TS/TSX edits — if it reports errors, fix them before continuing
- If Figma MCP authentication fails, it's likely an account mismatch — don't spend more than 2 attempts debugging, ask the user

## Session Start
At the start of every session, before doing any work:
1. Read `docs/PORTFOLIO-PRIORITIES.md` — this is the current task priority list
2. Scan `site/app/` and `site/components/` to understand what's built
3. Based on what the user asks, read the relevant docs (see index below)

## Docs Index
Reference docs live in `docs/`. Read the relevant ones based on the task — don't read all of them every time.

| File | When to read |
|------|-------------|
| `PORTFOLIO-PRIORITIES.md` | Always — current priority tiers and next actions |
| `CASE-STUDY-ASSESSMENT.md` | Working on any case study — gaps and action items per study |
| `CASE-STUDY-PLAYBOOK.md` | Writing or restructuring case study content |
| `portfolio_case_study_plan.md` | Deciding which studies to prioritize or reorder |
| `VISUAL-EXPORT-GUIDE.md` | Adding images/visuals — has Figma specs, aspect ratios, naming |
| `portfolio_build_context.md` | Technical questions about layout, typography, color, components |
| `designer-identity.md` | Writing copy, bio, positioning, or "about" content |
| `marco_canary_portfolio.md` | Needs impact stats or ownership data for case studies |
| `portfolio-inspiration-analysis.md` | Making design direction decisions or comparing to references |
| `designer-portfolios.md` | Looking at reference portfolios for inspiration |
| `TEXTURE_FEATURE_NOTES.md` | Resuming background texture work — has blocking issues and recovery plan |
| `PORTFOLIO-RESEARCH.md` | Deep research on case study content, homepage strategy, and visual design best practices — sourced from 30+ design leaders and publications |
| `PORTFOLIO-AUDIT.md` | Full audit of the current site with prioritized recommendations (P0-P3) — covers content, visuals, accessibility, and performance |

## Case Studies (Markdown Drafts)
Written case study content lives in `case-studies/`. Each `.md` file contains the narrative draft for a case study. Read the relevant one when working on a specific case study page.

## Obsidian Vault Boundary
Case study critiques, project research, and career strategy context live in Obsidian — **do not duplicate here.**
- **Vault root:** `~/Obsidian/marcowits/`
- **Portfolio meta-docs:** `~/Obsidian/marcowits/portfolio/` — voice/style references, templates, per-study critiques, `bio.md` (symlinked to repo), `case-study-interview.md` (symlinked to repo)
- **Per-study critiques:** `~/Obsidian/marcowits/portfolio/case-study-critiques/` — reflective design critiques per case study
- **Per-project drafts + retrospectives:** `~/Obsidian/marcowits/work/canary/projects/[slug]/` — typically contains `case-study-draft.md` and `retrospective-2026-04-30.md`
- Read critiques, drafts, and retrospectives for context when refining case study content, but don't copy them into this project.

## Project Overview
A Next.js 14 portfolio site for a product designer, featuring case studies with rich interactive components.

## Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS with CSS variables for theming
- **Animations**: Framer Motion (parallax, scroll effects)
- **Content**: MDX files with gray-matter for frontmatter parsing
- **Deployment**: Static export (`output: export`)

## Project Structure

```
app/
├── page.tsx                    # Homepage (renders HomeLayout w/ work as RSC slot)
├── layout.tsx                  # Root layout — mounts PasswordModal, MarqueeProvider
├── template.tsx                # Page transitions (framer-motion fade-in on route change)
├── api/
│   └── chat/                   # Chat-bar server route (Node runtime)
├── work/
│   ├── [slug]/                 # Dynamic route for MDX-based case studies
│   ├── fb-ordering/            # Dedicated custom case study
│   ├── compendium/             # Dedicated custom case study
│   ├── upsells/                # Dedicated custom case study
│   ├── checkin/                # Dedicated custom case study
│   ├── general-task/           # Dedicated custom case study
│   ├── design-system/          # Dedicated custom case study
│   ├── ai-workflow/            # Dedicated "How I Work with AI" page
│   ├── page.tsx                # Work collection page
│   └── WorkContent.tsx
├── play/                       # Playground index + 3 subpages
│   ├── page.tsx                # Index — title + reused <Playground hideHeader />
│   ├── six-degrees/
│   ├── pajamagrams/
│   └── custom-wrapped/
├── writing/                    # Blog/writing section
└── dev/
    └── type-lab/               # Dev-only typography composition tool

components/
├── case-study/                 # Reusable case study components (TwoCol, CaseStudyHero,
│                               # CaseStudyShell, QuickStats, ExpandableSection, PullQuote,
│                               # NextProject, ProgressBar, ImagePlaceholder, FadeIn,
│                               # SectionHeading, SidebarTOCBridge, TOCObserver)
├── chat/                       # Chat bar UI (ChatBar, ChatPanel, ChatOverlay,
│                               # ChatMessage, ChatMessageActions, ChipPrompt,
│                               # CaseStudyCardUnfurl, parseChatMarkup, parseStream)
├── music/                      # Audio player surfaces (HomeMiniPlayer, PlayerChip,
│                               # SeekBar, LedMatrixUI — scene toggles)
├── fb-showcase/                # F&B interactive components (BrowserMockup, FBCardPreview,
│                               # MobileShowcase, RoadmapEvolution, SystemArchitecture,
│                               # DesignPrinciples)
├── type-tuner/                 # Dev typography composition tool (Type Lab)
├── dev/                        # Dev-only inline content editor (EditableOverlay,
│                               # FloatingToolbar, SectionReorder)
├── ui/                         # Primitives (button, slider, tooltip)
│
├── HomeLayout.tsx              # Homepage shell — Hero, HomeNav, HeroToolbar/MobileToolbar,
│                               # LedMatrix, work slot, Playground
├── Hero.tsx                    # Multi-phase intro animation with streaming text + chat bar
├── HomeNav.tsx                 # Homepage anchor nav (Home / Work / Playground), * marker
├── HeroToolbar.tsx             # Unified fixed-top toolbar (desktop) — palette popover,
│                               # music expand, LED matrix scenes, time/weather right cluster
├── MobileToolbar.tsx           # Mobile variant of the unified toolbar
├── HamburgerMenu.tsx           # Toolbar overflow menu
├── MobileNav.tsx               # Case-study-only top bar (single Back link via SidebarContext)
├── LedMatrix.tsx               # LED matrix audio visualizer (homepage)
├── BackgroundTexture.tsx       # Perlin noise dot wave (SENSITIVE - commit before editing)
├── LockGate.tsx                # WIP-courtesy gate — `card` (hover overlay) / `page` modes
├── PasswordModal.tsx           # Global unlock modal (mounted in layout.tsx)
├── PaletteSwatches.tsx         # Theme swatch row (used inside HeroToolbar palette popover)
├── ThemeToggle.tsx             # Theme state hook + applyColoredTheme runtime overrides
├── HighlightableBio.tsx        # Bio surface with highlightable phrases
├── HighlighterContext.tsx      # Highlight state provider
├── ConnectLinks.tsx            # Email / LinkedIn / Resume CTA cluster
├── Resume.tsx                  # Resume content surface
├── GalleryMode.tsx             # Gallery view component
├── PhotoStack.tsx              # Photo stack visual
├── LocalStatus.tsx             # Time / weather / location strip (toolbar right cluster)
├── LoadingOverlay.tsx          # Hero loader (Geist * inside large slot)
├── CaseStudyCard.tsx           # Homepage project cards (frosted glass, sharp edges)
├── CaseStudyList.tsx           # Card/list toggle, localStorage persistence
├── CaseStudyListRow.tsx        # List view row (year | title | company·role | metric)
├── CaseStudyCarousel.tsx       # Carousel view (in-flight, see feature/carousel-view)
├── Marquee.tsx                 # Scrolling quotes/testimonials
├── MarqueeContext.tsx          # Marquee visibility state
├── StreamingText.tsx           # Character-by-character text animation
├── Playground.tsx              # Playground roster + cards (homepage section + /play index)
├── TwoCol.tsx                  # Shared two-column editorial layout
├── Icons.tsx                   # Shared icon components
├── ViewportFade.tsx            # Footer gradient overlay
└── FadeIn.tsx                  # Scroll-triggered fade animation (global)

lib/
├── locked-content.ts           # Single source of truth for locked slugs (LOCKED_SLUGS Set)
├── PasswordGateContext.tsx     # Unlocked-state provider (env-hash + multi-tab sync)
├── SidebarContext.tsx          # Case-study sidebar state + backHref
├── playground-cards.ts         # Playground roster (homepage + /play index share this)
├── chat/                       # Chat data + prompt + rate-limit + study-metadata
├── AudioPlayerContext.tsx      # Audio player state
├── VisualizerSceneContext.tsx  # LED matrix scene selection
├── visualizer-scenes.ts        # Scene definitions for LED matrix
├── audio-analysis.ts           # FFT / audio analysis for visualizer
├── playlist.ts                 # Audio track list
├── carousel-transition.ts      # Carousel transition timing
├── bio-content.ts              # Bio paragraph content (used by HighlightableBio)
├── content.ts                  # Shared content helpers
├── gallery-content.ts          # Gallery items
├── resume-content.ts           # Resume data
├── editor-types.ts + InlineEditorContext.tsx  # Dev inline editor
├── dot-font.ts                 # Pixel font for LED matrix
├── springs.ts                  # Shared spring configs (SPRING_HEAVY, SPRING_SNAP)
├── study-tags.ts               # Tag filtering for case study list
├── typography.ts               # Typescale tokens
├── types.ts + utils.ts         # Shared types + helpers

content/                        # MDX case study metadata (fb-ordering, checkin, general-task,
                                # design-system, compendium, upsells)

public/images/                  # Per-case-study image folders (checkin/, general-task/,
                                # design-system/, fb-ordering/, compendium/, upsells/)
```

## Case Studies

### Dedicated Routes (Custom React Components)
These have rich custom implementations with sidebar TOC (via SidebarTOCBridge + TOCObserver), expandable sections, stats:

1. **F&B Ordering** (`/work/fb-ordering`) - Canary, 2025
2. **Digital Compendium** (`/work/compendium`) - Canary, 2024
3. **Upsells Forms** (`/work/upsells`) - Canary Technologies, 2025
4. **Hotel Check-in** (`/work/checkin`) - Canary Technologies, 2024
5. **General Task** (`/work/general-task`) - General Task, 2022
6. **Design System** (`/work/design-system`) - General Task, 2022
7. **How I Work with AI** (`/work/ai-workflow`) - Personal, 2026

### Homepage Card Order
1. F&B Ordering (newest Canary work, 100% ownership)
2. Digital Compendium ($1M CARR, platform thinking)
3. Upsells Forms ($3.8M CARR, workflow design)
4. Hotel Check-in (enterprise scale)
5. General Task (2022, startup experience)
6. Design System (2022, foundational work)

## Key Patterns

### DEDICATED_ROUTES
In `app/work/[slug]/page.tsx`, case studies with custom pages are excluded from static generation:
```typescript
const DEDICATED_ROUTES = new Set(["fb-ordering", "compendium", "upsells", "checkin", "general-task", "design-system", "ai-workflow"]);
```

### Case Study Content Component Pattern
Each dedicated case study has:
- `page.tsx` - Metadata and wrapper (negative top margin for full-bleed hero)
- `[Name]Content.tsx` - Rich component: full-bleed gradient hero, then post-hero content in a two-column editorial layout

### Editorial 12-Column Grid (shipped 2026-07-14, replaces TwoCol)
**Visual reference + prompting vocabulary: `docs/LAYOUT-REFERENCE.html`** (open in a browser). All pages share one 12-col canvas; content is *placed* per band, not wrapped.
- **Canvas**: `--grid-max: 1128px`, `--grid-gap: 24px` (globals.css). Case studies: `CaseStudyShell` clears the fixed InlineTOC at lg (`lg:ml-[200px]`), re-centers ≥1560px. Home: centered canvas in HomeLayout. Root `<main>` no longer caps width — each page owns its measure.
- **Bands**: phone <768 / tablet 768–1199 / desktop ≥1200 (custom media queries on `.col-ed`, NOT Tailwind's lg=1024 — desktop compositions only apply with real room). Unset bands inherit downward: `lg → md → base → full`.
- **Primitives**: `site/components/layout/Grid.tsx` — `<Grid preset?>` + `<Col base? md? lg?>`, spec grammar `"1-6"` (inclusive) / `"full"`. Parser + presets: `site/lib/layout-presets.ts` (tests: `npx tsx scripts/test-grid-spec.ts`).
- **Presets**: prose (4-9, centered), prose-wide (3-10, centered), intro-rail (1-7 + 9-12 MetaRail), media-right (1-5 + 6-12), media-left (1-7 + 8-12), media-full, duo (1-6 + 7-12, holds on tablet), quote-offset (3-10). Prose is centered by Marco's call 2026-07-14 — left-edge prose read as lopsided on text-heavy pages. Preset assigns specs to `<Col>` children in order; explicit props win.
- **MetaRail** (`components/case-study/MetaRail.tsx`): Year/Role/Scope rail on every case-study intro + used conceptually by the home contact rail. Horizontal on tablet, vertical column at lg.
- **Per-section grids**: each section wraps itself in `<Grid>`; identical tracks keep columns aligned page-wide. Portrait media never goes media-full — use a narrow explicit span (e.g. `lg="5-8"`).
- **Contact sheets**: `cd site && npm run sheet -- <route> [--unlock] [--name <slug>]` → `.sheets/<slug>/sheet.html` tiling 390/768/1024/1440 full-page screenshots (requires dev server; playwright-core + installed Chrome; hides Agentation). Use after any layout change.

### CaseStudyHero Gradient Colors
| Study | gradient[0] | gradient[1] |
|-------|-------------|-------------|
| F&B Ordering | `#EF5A3C` | `#ED4F2F` |
| Compendium | `#2563EB` | `#1D4ED8` |
| Upsells | `#0D9488` | `#0F766E` |
| Check-in | `#6366F1` | `#4F46E5` |
| General Task | `#334155` | `#1E293B` |
| Design System | `#8B5CF6` | `#7C3AED` |

### Content Width System (Stripe-inspired)
- `max-w-content` (650px) — case study body text, /writing, /play
- `max-w-content-md` (800px) — dialog inner content, case study hero inner
- `max-w-content-lg` (1060px) — dialog sheet, case study hero outer
- Homepage bio panel: hardcoded `max-w-[640px]` in SectionSnap
- Homepage work/cards panel: hardcoded `max-w-[640px]` in SectionSnap
- Padding: `px-4 sm:px-8` (16px mobile, 32px tablet+)
- `layout.tsx` no longer constrains `<main>` — each page handles its own width

### Visual Effects
- **Background**: Perlin noise animated dot grid with wave effect
- **Cards**: Frosted glass (backdrop-blur), mouse-tracking glow, sharp edges
- **Card/List toggle**: Blur in/out transition, localStorage persistence
- **Sections**: Scroll-triggered fade animations via FadeIn component
- **Progress**: Reading progress bar at top of case studies

### Locked Content Gating (shipped 2026-05-02)
WIP-courtesy gate on a subset of case studies + Playground subpages. Spec/plan: `docs/superpowers/specs/2026-05-02-locked-content-gating-design.md` + `docs/superpowers/plans/2026-05-02-locked-content-gating.md`.
- **Single source of truth:** `lib/locked-content.ts` (`LOCKED_SLUGS` Set). Removing a slug from this Set permanently unlocks that page.
- **Wrapper:** `components/LockGate.tsx` — `card` mode (hover overlay + click intercept on homepage cards, accepts `cardRadius`) and `page` mode (full-screen placeholder with staggered motion + email / LinkedIn / "I have a code" CTAs).
- **Provider:** `lib/PasswordGateContext.tsx` — env-hash check + multi-tab sync via storage events.
- **Modal:** `components/PasswordModal.tsx` — global, mounted in `app/layout.tsx`.
- **Env var:** `NEXT_PUBLIC_UNLOCK_CODE_HASH` in Vercel for a non-default code (default hash accepts `miyagi`). Generator: `npm run hash:code -- <code>`.

### Unified Toolbar (shipped 2026-05-02)
Replaces the prior split chrome (HeroActions, sticky footer, separate palette button). Single fixed-top bar across the homepage.
- **Desktop:** `components/HeroToolbar.tsx` — left cluster (HamburgerMenu, palette popover, music expand, LED matrix scene toggles) + right cluster (`LocalStatus` time/weather). Music player surfaces in `components/music/`.
- **Mobile:** `components/MobileToolbar.tsx` — same content, vertical layout.
- **Palette popover:** Triggers ThemePalette content; uses `ToolbarIconButton` chrome (hover/active tint via `color-mix(in srgb, var(--color-accent) ...)`, focus ring).
- **LED matrix:** `components/LedMatrix.tsx` (canvas) + `components/music/LedMatrixUI.tsx` (scene toggles, lifted out of the matrix so they're visible on mobile and against the toolbar bg).
- **No greeting cycle:** The earlier rotating-greeting variant in the right cluster was removed; right cluster now only carries time/weather/location.
- **No StickyFooter:** That component is deleted — palette/marquee/email/LinkedIn moved into this bar (or into ConnectLinks where appropriate).

## Design Tokens (CSS Variables)

### Colors — Light Mode (`:root`)
| Variable | Value |
|----------|-------|
| `--color-bg` | `#ffffff` |
| `--color-fg` | `#1a1a1a` |
| `--color-fg-secondary` | `rgba(17, 17, 17, 0.82)` |
| `--color-fg-tertiary` | `rgba(17, 17, 17, 0.35)` |
| `--color-surface` | `#fbfbfb` |
| `--color-surface-raised` | `#f5f4f9` |
| `--color-border` | `#e6e6e6` |
| `--color-muted` | `#f3f3f3` |
| `--color-accent` | `var(--color-fg)` (neutral — `mono` theme is default; colored themes override at runtime) |

### Colors — Dark Mode (`.dark`)
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

### Themes
**11 themes total.** Default is `mono` (pure neutral B&W — accent + glow aliased to `--color-fg`). 10 colored opt-ins: ocean, forest, wine, slate, ember (bold); lavender, mint, rose, butter, sky (soft). Each colored theme overrides all CSS variables at runtime via `applyColoredTheme()` in `ThemeToggle.tsx`. Mono swatch in the palette renders as a 50/50 black/white split circle so its "neutral" identity is legible against any bg. Persists via `theme-mode` + `theme-family` in localStorage.

### Brand mark (May 2026)
**`*` (Geist Sans, weight 500)** replaces the previous `✸` heavy 8-pointed star and the `✦` six-pointed marquee separator everywhere. Geist's `*` sits high in its em-box, so most surfaces apply `transform: translateY(15%)` to optically center it next to adjacent text. In-flight visual rebrand spec/plan: `docs/superpowers/specs/2026-05-03-visual-rebrand-bw-asterisk-design.md` + `docs/superpowers/plans/2026-05-03-visual-rebrand-bw-asterisk.md`. Surfaces:
- Hero rest star: 0.62em inner span, slot Y offset `0.08em`
- Hero loader (LoadingOverlay): 0.42em inner span (kept smaller — slot is 108-168px so absolute size is huge)
- HomeNav active marker: 18px, `translateY(15%)`, split outer/inner span so `y: starY` motion value doesn't fight the static centering transform
- ChatBar SparkGlyph: default 22px + `translateY(15%)`; "Ask Marco" pill uses size 22
- ChatMessage streaming cursor: 1.7em with `verticalAlign: middle`, `lineHeight: 0`
- MobileToolbar pill: 22px + `translateY(15%)`
- InlineTOC marker, SeekBar thumb, Marquee separator: same pattern, smaller

## Typography

Consolidated to single Geist Sans family in April 2026 (see `docs/superpowers/specs/2026-04-18-typography-consolidation-design.md`).

### Font Stack
Single family. Geist Sans loaded via `next/font/sans` in `layout.tsx`. No self-hosted `.woff2` files. Representational components (URL bar, arch diagrams, teaser) use `var(--font-mono-system)` = `ui-monospace, Menlo, Monaco, monospace`.

### Font CSS Variables
| Variable | Default |
|----------|---------|
| `--font-sans` | `var(--font-geist-sans), system-ui, sans-serif` |
| `--font-mono-system` | `ui-monospace, Menlo, Monaco, monospace` (representational only) |
| `--font-size-offset` | `0px` (user adjustable -4px to +4px via Theme Palette) |

### Typescale (defined in `site/lib/typography.ts`)
Three weights system-wide: 400 body/labels, 500 titles/UI, 600 hero emphasis. All 18px+ elements use `letter-spacing: -0.01em`.

| Element | Weight | Size | Notes |
|---------|--------|------|-------|
| Hero statement (h1) — homepage | 600 | clamp(28-32px) | `typescale.display`, streams word-by-word during intro |
| Hero name label — homepage | 400 | 14px | Inline in Hero.tsx, tertiary color, always visible |
| Case study hero h1 | 600 | clamp(28-32px) | `typescale.caseStudyHero` |
| Case study hero subtitle | 400 | 14px / 22 line-height | `typescale.subtitle` |
| Section h2 (case study) | 500 | 14px | `typescale.sectionLabel` — tertiary color, acts as small label above section content. NOT a large heading. |
| Section h3 | 500 | 18px | `typescale.h3` |
| Section h4 | 500 | 16px | `typescale.h4` |
| Body / case study prose | 400 | 14px / 22 line-height | `typescale.body` |
| QuickStats value | 500 | 24px | `typescale.statValue` |
| PullQuote | 400 | clamp(18-22px) | `typescale.pullQuote` |
| NextProject title | 500 | 22px | `typescale.nextProjectTitle` |
| Card title | 500 | 18px | Inline styles in CaseStudyCard.tsx |
| Card subtitle | 400 | 14-15px | Inline styles |
| List row title | 500 | 16px | Inline in CaseStudyListRow.tsx |
| List row meta / year / metric | 400 | 11px | `typescale.label`, tertiary |
| Nav (desktop) | 400 | 16px | `typescale.nav` |
| Nav (mobile) | 400 | 14px | `typescale.navMobile` |
| Page titles (/work, /writing) | 500 | 24px | `typescale.pageTitle` |
| Marquee | 400 | 14px | inline |

### Theme Palette
Color swatches (10 colored themes + light/dark) and font-size ±/reset only. No font-pairing picker — removed April 2026.

## Component & Interaction Specs

### Homepage Nav (HomeNav.tsx)
- **Scope:** Rendered inside HomeLayout.tsx, only visible on homepage at lg+
- **Items:** `HOME_NAV_ITEMS` = Home (`#home`), Work (`#projects`), Playground (`#playground`) — all in-page anchors, no global routes
- **Font:** 16px weight 500
- **Active state:** Geist `*` (18px, weight 500, translateY(15%) for optical centering) + text springs 18px right. Active section tracked via IntersectionObserver with a scroll-lock window after click navigation (`SCROLL_LOCK_MS = 900`).
- **Nav star:** spring stiffness 350, damping 28, y = activeIndex × ROW_HEIGHT
- **Hover:** Accent color + 8px right slide (spring 400/25)
- **Mobile (MobileNav.tsx):** Case-study-only top bar — single ← Back link driven by `SidebarContext.backHref`. Not used on homepage. Homepage mobile chrome lives in MobileToolbar.tsx.
- **No StickyFooter:** The fixed bottom bar was removed in the 2026-05-02 toolbar redesign — email/LinkedIn/palette/marquee moved into the unified top toolbar (see "Unified Toolbar" below).

### Bento Cards (CaseStudyCard)
- **Hover scale:** `1.01x`, 350ms ease-out in / 400ms ease out (CSS, not Framer Motion)
- **Border glow:** Mouse-tracking radial gradient, 200px radius, 70% falloff, `var(--color-accent)`, CSS mask-composite
- **Inner glow:** 5% opacity radial accent gradient at cursor position
- **No parallax** — simple scroll, no framer-motion transforms
- **Background:** `var(--color-surface-raised)` (opaque)
- **Edges:** Sharp (`rounded-none`), 20px padding (`p-5`)
- **Year labels:** 11px mono, `--color-fg-tertiary`, inside card above title (showYear prop)

### Card/List View Toggle (CaseStudyList)
- **Two views:** Card (default) and List, toggled via icon buttons on "Work" header row
- **Toggle buttons:** ViewToggleButton with instant hover color (accent on hover). Active = accent, inactive = fg-secondary.
- **Transition:** AnimatePresence mode="wait", blur 4px + opacity fade, 200ms easeInOut
- **Persistence:** localStorage key `work-view-mode`, SSR-safe (hydrated flag)
- **FadeIn:** Only on initial page load; after first toggle, `hasToggled` ref skips FadeIn
- **List view rows:** CaseStudyListRow — full-width link, flex items-baseline: year (48px, mono 11px) | title (heading 16px, weight 500, spring nudge 8px on hover) | company · role (mono 11px, hidden <sm) | metric (mono 11px, hidden <md)
- **Year grouping:** showYear prop controls visibility (first item per year group), currently forced to true for all rows
- **Dividers:** 1px solid --color-border between rows + top border on container

### MDX Frontmatter Metadata
| Study | company | role | metric |
|-------|---------|------|--------|
| fb-ordering | Canary | Sole designer | 0→1, 100% ownership |
| compendium | Canary | Product designer | $1M+ CARR |
| upsells | Canary | Lead designer | $3.8M CARR |
| checkin | Canary | Product designer | 4,500+ hotels |
| general-task | General Task | Founding designer | 0→1 product |
| design-system | General Task | Founding designer | 0→1 system |
| ai-workflow | Personal | Designer + builder | Daily AI practice |

### Homepage Scroll
- **Single continuous scroll** — SectionSnap deleted, replaced by normal document flow
- **Active section tracking:** IntersectionObserver in `HomeNav.useActiveSection()` watches `#home`, `#projects`, `#playground`. Click navigation locks the active section for `SCROLL_LOCK_MS` (900ms) so smooth-scroll doesn't fight the chosen target.
- **Mobile sticky heading:** `sticky top-14 z-40` with frosted glass bg, releases when parent section scrolls out
- **Spacing:** `mt-28` (112px) between sections

### Hero Intro Sequence
- **5 phases:** star1 (`*` blink 1800ms, Geist weight 500) → heading streams word-by-word → star2 (1800ms) → bio paragraph streams → done
- **Word streaming:** 40ms/word, 250ms opacity fade per word
- **6-level progressive disclosure:** Each "+" click shows next bio paragraph with loading star (1200ms) + stream
- **Question prompts:** "What else have you worked on?" / "How'd you get into design?" / "What drives your work?" / "What do you do outside of work?" / "How can I reach you?"
- **SessionStorage skip:** `portfolio-intro-seen` — same-session revisits skip to `done`

### Theme Palette Picker
- **Surface:** Popover from the unified toolbar's palette button (desktop) / bottom sheet (mobile)
- **Sections:** Color swatches only (10 colored themes + mono + light/dark) and font-size ±/reset action buttons. Font-pairing picker was removed April 2026.
- **Persistence keys:** `theme-mode`, `theme-family`, `colored-theme-name`, `font-size-offset`

### Background Texture (BackgroundTexture.tsx)
- **Config:** `GRID_SPACING: 8`, `DOT_SIZE: 0.5`, `DOT_OPACITY: 0.03`, `HOVER_RADIUS: 200`
- **Wave:** Perlin noise, ~10s cycle, threshold 0.45, affected dots grow up to 3x
- **Hover:** Dots near cursor blend 70% toward `--color-glow`
- **Overlay:** SVG paper grain filter at 12% opacity

## Dev Server
```bash
npm run dev      # Starts on localhost:3000 with 0.0.0.0 binding for mobile preview
```

## Image Strategy
Images are in `public/images/[case-study]/`. Check-in, Design System, and General Task are fully wired up (no placeholders). F&B has 10 remaining, Compendium 15, Upsells 17 — all need Figma exports.

## Chat bar

- Surface: `site/components/chat/`. Data + prompt + rate-limit: `site/lib/chat/`. Server: `site/app/api/chat/route.ts` (Node runtime).
- Single source of truth for studies in chat: `site/lib/chat/study-metadata.ts`. Adding a new case study to chat = add an entry here + (optionally) drop a markdown draft at `case-studies/<filename>.md` and map the slug → filename in `site/lib/chat/case-study-content.ts`.
- Inline link grammar in assistant replies (parser at `site/components/chat/parseChatMarkup.tsx`):
  - `[label](study:<slug>)`, `[label](about)`, `[label](resume)`, `[label](contact:email)`, `[label](contact:linkedin)`
  - Unknown slugs degrade to plain label text — safe by design.
- Trailing `<artifact slug="<slug>" />` marker → `CaseStudyCardUnfurl` (max one per reply).
- Env vars (Vercel + `.env.local`): `ANTHROPIC_API_KEY`, `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`.
- Spend safety: $25/mo cap in Anthropic console. Per-IP: 8/min, 60/day via Upstash. Plus `max_tokens: 1024` and 30-turn transcript cap.
- Pure-function tests: `site/scripts/test-chat-parser.ts`. Run with `npx tsx scripts/test-chat-parser.ts`.
- v1 limitation: the chat-bar pill is rendered only in the in-flow HeroToolbar (not the sticky portal variant) to avoid a framer-motion layoutId collision.

## Session End
Before ending any session:
1. Update the "Current State" section below with: what was accomplished, what's in progress, any known issues
2. Note exact file paths that were modified
3. If any features are partially complete, describe what's left

## Current State
_Updated by Claude at end of each session. Architectural facts get promoted into the relevant Key Patterns section above; this section is for the most recent session + genuinely in-flight work only._

- **Last worked on (2026-07-14, evening session):** Editorial 12-column grid system — full layout restructure on branch **`feat/editorial-grid`** (NOT yet merged to main or deployed). See "Editorial 12-Column Grid" in Key Patterns above and `docs/LAYOUT-REFERENCE.html` for the authoring vocabulary. Plan doc: `docs/superpowers/plans/2026-07-14-editorial-grid-system.md`.
- **Completed this session (2026-07-14 evening, branch feat/editorial-grid):**
  - Grid/Col primitives + 8 named presets + spec parser w/ tests; `.grid-ed`/`.col-ed` CSS in globals.css (bands 768/1200).
  - All 4 case studies migrated: intro-rail title blocks with MetaRail (Year/Role/Scope), prose sections, key-decision 2-col spreads (compendium 2×2, KB alternating ×5), F&B portrait video at `lg="5-8"`, dashboards full-canvas. TwoCol.tsx DELETED (all usages stripped).
  - Homepage: bio 1–7 + contact rail 9–12 (intro-rail), work grid featured-first (F&B full canvas) then 2-up; CaseStudyList's ProjectGrid places cells on the shared grid.
  - Root `layout.tsx`: `<main>` max-w-[960px] cap REMOVED — pages own their width.
  - Contact-sheet tooling: `npm run sheet -- <route> [--unlock]` (playwright-core, channel chrome).
  - `docs/LAYOUT-REFERENCE.html` — visual reference for the whole system (Marco's authoring doc).
- **Earlier same day (deployed to prod on main):**
  - Homepage bio rewritten + condensed to 3 paragraphs: "Currently at Canary… world's largest enterprises in hospitality" (that phrase is a shadcn/Base-UI tooltip trigger carrying the Marriott/Wyndham/IHG + 0→1 products detail), "In the past…", "I'm an AI-native designer… (of course) caffeine". Source is `content/bio.md` → `scripts/build-bio.mjs` → `lib/bio-content.ts`; HomeLayout has a hardcoded copy — edit both.
  - Inline link style unified (`.dotted-link--inline` + `Em` in HomeLayout): rest = subtle dotted underline (fg-tertiary 1px layer), hover = dashed accent underline draws in over it (two background layers, same position), Geist upright (fontStyle normal), weight 400, letter-spacing inherits body. Applies to bio, About, chat links.
  - Work grid (`CaseStudyList.tsx`): cards are chromeless (no bg/border/padding, flush with "Select work", `gap-16`), captions are title-only for studies (playground keeps descriptions), locked studies get a mono "COMING SOON" label beside the title. GalleryMode carousel DELETED — locked cards now open `MediaPreviewLightbox` (full-res first gallery media, dark backdrop, portal to body, Esc/backdrop-click closes); LockGate card mode has `onActivate` override, badge says "In progress — click to preview" (no lock icon). Routeless+unlocked studies are static cells.
  - F&B case study: ProjectDetails accordion removed from page (component lives on, restyled to 16px body + bordered Scope groups, still used by WorkHistory); Solution copy rewritten (two paragraphs + new first two bullets); all em dashes removed from content; guest-flow video full-width; Impact pull quote removed; `SectionHeading` (all levels) + `ExpandableSection` h2s now wear the homepage "Select work" style (Baskerville italic 400, h2 20px); `InlineTOC` links align flush with "Back" (16px indent = 12px star slot + 4px gap).
  - Music dock (`MusicMiniWidget.tsx`): notes emit from the collapsed FAB while playing, scrubber always visible (RevealRow deleted), LED corner controls show on whole-player hover, `LedMatrix` `CORNER_RADIUS = 0` so dots reach the corners.
  - SocialLinks: X/Twitter removed (LinkedIn + email remain).
  - `fb-ordering` removed from `LOCKED_SLUGS` — publicly viewable for recruiters.
  - **Chat fixed in prod:** the three Vercel env vars (`ANTHROPIC_API_KEY`, `UPSTASH_REDIS_REST_URL/TOKEN`) existed but decrypted empty → `TypeError: fetch failed` 500s. Marco re-entered values + redeployed; verified working end-to-end live. Local `.env.local` still lacks these keys, so chat 500s on localhost until added.
- **In flight:** None. `feat/editorial-grid` MERGED to main + deployed 2026-07-15 (merge `d0a24f2`), verified live on www.marcosevilla.com in-browser (grid hydrates on home; case-study canvas centers correctly at wide viewports). Note: apex marcosevilla.com 307s to www — curl checks must follow redirects; home renders inside a Suspense boundary (useSearchParams) so its markup never appears in static HTML, verify with a browser. The old May "CaseStudyHero gradient" and "Content Width System" sections above predate both July redesigns — treat as historical.
- **Known issues / quirks:**
  - `position: fixed` overlays nested under HomeLayout's framer-motion wrappers get trapped by the animated `filter` style (it becomes the containing block) — portal to `document.body` (see `MediaPreviewLightbox`). SiteHeader is `z-[130]`; overlays that must cover it need z ≥ 140.
  - Agentation toolbar (dev-only, bottom-right) intercepts clicks on the music dock in that corner during browser automation — hide `[data-agentation-root]` when testing.
  - `vercel` CLI is now linked to project `marcosevillaportfolio` (`.vercel/` gitignored). `vercel env pull` returns empty strings for the three chat secrets (sensitive) — that's expected, not a config bug.
  - Deprecated-but-present: `CaseStudyCard.tsx`, `CaseStudyListRow.tsx` (stale hrefs), `lib/carousel-transition.ts` (carousel worktree). Untracked: `docs/fb-gallery/`, `case-studies/fb-mobile-ordering-benji.md`.
- **Open loops:**
  - Hightouch referral blurb finalized in `~/Developer/job-hunt/hightouch-application.md` — Marco still needs to send it to Erika.
  - Remaining locked studies (compendium, knowledge-base, upsells, checkin, general-task, design-system) still need content passes before ungating.
  - Playground card descriptions could get the title-only treatment for consistency if desired (currently kept).

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
Case study critiques and career strategy context live in Obsidian — **do not duplicate here.**
- **Vault root:** `~/Obsidian/marcowits/`
- **Portfolio meta-docs:** `~/Obsidian/marcowits/work/general/portfolio/` — voice/style references, templates, bio (symlinked to repo), `CASE-STUDY-INTERVIEW.md` (symlinked to repo)
- **Per-study critiques:** `~/Obsidian/marcowits/work/canary/critiques/` — reflective design critiques per case study
- **Per-project drafts:** `~/Obsidian/marcowits/work/canary/projects/[slug]/case-study-draft.md`
- Read critiques and meta-docs for context when refining case study content, but don't copy them into this project.

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
├── page.tsx                    # Homepage (conditionally renders Teaser or full site)
├── work/
│   ├── [slug]/                 # Dynamic route for MDX-based case studies
│   │   ├── page.tsx
│   │   └── CaseStudyPage.tsx
│   ├── fb-ordering/            # Dedicated custom case study
│   ├── compendium/             # Dedicated custom case study
│   ├── upsells/                # Dedicated custom case study
│   ├── checkin/                # Dedicated custom case study
│   ├── general-task/           # Dedicated custom case study
│   ├── design-system/          # Dedicated custom case study
│   ├── ai-workflow/            # Dedicated "How I Work with AI" page
│   ├── page.tsx                # Work collection page
│   └── WorkContent.tsx
├── dev/
│   └── type-lab/              # Dev-only typography composition tool
│       └── page.tsx
├── play/                       # Play/experiments section
├── writing/                    # Blog/writing section
├── template.tsx                # Page transitions (framer-motion fade-in on route change)
└── layout.tsx

components/
├── case-study/                 # Reusable case study components
│   ├── CaseStudyHero.tsx
│   ├── QuickStats.tsx
│   ├── ExpandableSection.tsx
│   ├── ImagePlaceholder.tsx
│   ├── PullQuote.tsx
│   ├── NextProject.tsx
│   ├── ProgressBar.tsx
│   ├── FadeIn.tsx
│   ├── TwoCol.tsx              # Two-column editorial layout (TwoCol, TwoCol.Left, TwoCol.Right)
│   ├── SectionHeading.tsx      # Reusable H2 section heading with mono font + divider
│   ├── SidebarTOCBridge.tsx    # Pushes TOC items into SidebarContext for sidebar display
│   └── TOCObserver.tsx         # IntersectionObserver that tracks active TOC section
├── type-tuner/                 # Dev typography composition tool (Type Lab)
│   ├── TypeTuner.tsx           # Main component — canvas + panel layout
│   ├── TunerPanel.tsx          # Controls: font, size, weight, spacing, color, offset
│   ├── TunerCanvas.tsx         # Live preview with selectable/editable text layers
│   └── types.ts                # TypeLayer interface, font options, code generator
├── dev/                         # Dev-only inline content editor
│   ├── EditableOverlay.tsx      # DOM traversal, contentEditable, hover outlines
│   ├── FloatingToolbar.tsx      # Toggle, save/revert, Cmd+E/S, placeholder count
│   └── SectionReorder.tsx       # Section reorder panel with up/down buttons
├── dynamic-bio/                # Grid-based bio display mode
├── CaseStudyCard.tsx           # Homepage project cards (frosted glass, sharp edges)
├── CaseStudyList.tsx           # Card/list toggle, localStorage persistence, blur transition
├── CaseStudyListRow.tsx        # List view row (year | title | company·role | metric)
├── BackgroundTexture.tsx       # Perlin noise dot wave animation (SENSITIVE - commit before editing)
├── Hero.tsx                    # 5-phase intro animation with streaming text
├── DesktopSidebar.tsx          # Homepage-only sidebar (lg+), nav links with * (Geist 500) marker
├── MobileNav.tsx               # Sticky top bar (<lg only), nav links or ← Back
├── StickyFooter.tsx            # Fixed bottom bar — email, LinkedIn, palette, marquee (all pages)
├── HomeLayout.tsx              # BackgroundTexture + DesktopSidebar wrapper
├── Marquee.tsx                 # Scrolling quotes/testimonials
├── MarqueeContext.tsx          # Marquee visibility state
├── StreamingText.tsx           # Character-by-character text animation
├── ThemePalette.tsx            # Theme customization sidebar
├── ThemeToggle.tsx
├── TwoCol.tsx                  # Two-column editorial layout (shared: homepage + case studies)
├── Icons.tsx                   # Shared icon components (Grid, List, Filter, Close)
├── ViewportFade.tsx            # Footer gradient overlay
├── InlineExpandButton.tsx
├── Teaser.tsx                  # Coming-soon page with @paper-design/shaders-react Dithering + DialKit controls
├── FadeIn.tsx                  # Scroll-triggered fade animation (global)
└── fb-showcase/                # F&B interactive components
    ├── BrowserMockup.tsx       # Browser chrome frame (traffic lights + URL bar)
    ├── FBCardPreview.tsx       # Card hover: crossfade screenshots + mesh gradient + phone mock
    ├── MobileShowcase.tsx      # 4 overlapping phone mocks (landing, menu, detail, cart)
    ├── RoadmapEvolution.tsx    # Vertical animated timeline (16 nodes, SVG arrows, hover popovers)
    ├── SystemArchitecture.tsx  # System architecture diagram
    └── DesignPrinciples.tsx    # Design approach principles

lib/
├── springs.ts                  # Shared spring configs (SPRING_HEAVY, SPRING_SNAP)
├── study-tags.ts               # Tag filtering logic for case study list
└── typography.ts               # Typescale tokens

content/                        # MDX case study metadata
├── fb-ordering.mdx
├── checkin.mdx
├── general-task.mdx
├── design-system.mdx
├── compendium.mdx
└── upsells.mdx

public/images/
├── checkin/                    # Check-in case study images
├── general-task/               # General Task images
├── design-system/              # Design System images
└── fb-ordering/
    ├── fb-ordering-table.png   # Dashboard table view (default state)
    └── fb-ordering-dashboard.png # Dashboard with side sheet (hover state)
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

### Two-Column Editorial Layout (TwoCol)
All 6 case studies use a uniform two-column grid at lg+ breakpoint, inspired by makingsoftware.com:
- **Container**: `max-w-content mx-auto px-4 sm:px-8 lg:max-w-none lg:px-0` — below lg stays 500px centered, at lg+ expands to fill `<main>` (960px)
- **Grid**: `lg:grid lg:grid-cols-2 lg:gap-x-10` — per-section (not one top-level grid), columns align uniformly across page
- **Column width**: (912 - 40px gap) / 2 = 436px each
- **Prose sections**: `TwoCol > TwoCol.Left` — left column with right empty (breathing room)
- **Paired sections**: `TwoCol > TwoCol.Left + TwoCol.Right` — text left, image right (decision blocks)
- **Full-width elements**: No TwoCol wrapper — QuickStats, hero images, PullQuotes, galleries, NextProject
- **Mobile (<lg)**: Single column, unchanged from before
- **Component**: `site/components/case-study/TwoCol.tsx` — compound component with `TwoCol.Left` and `TwoCol.Right`

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
**`*` (Geist Sans, weight 500)** replaces the previous `✸` heavy 8-pointed star and the `✦` six-pointed marquee separator everywhere. Geist's `*` sits high in its em-box, so most surfaces apply `transform: translateY(15%)` to optically center it next to adjacent text. Surfaces:
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

### Nav Sidebar (DesktopSidebar.tsx — homepage only)
- **Scope:** Rendered inside HomeLayout.tsx, only visible on homepage at lg+
- **Nav mode:** Home, Work, Writing (disabled), Play (disabled) links
- **Font:** 16px weight 500 (nav links)
- **Active state:** Geist `*` (18px, weight 500, translateY(15%) for optical centering) + text springs 18px right
- **Nav star:** spring stiffness 350, damping 28, y = activeIndex × 36
- **Hover:** Accent color + 8px right slide (spring 400/25)
- **Mobile (MobileNav.tsx):** Horizontal top bar, sticky, backdrop-blur, 14px font, lg:hidden
- **StickyFooter.tsx:** Fixed bottom bar on all pages — Email, LinkedIn, Theme Palette, Marquee toggle icons, horizontally centered, frosted glass

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
- **Sidebar active state:** IntersectionObserver on `#work` section (threshold 0.05) calls `setActivePanel("work"/"bio")`
- **Mobile sticky heading:** `sticky top-14 z-40` with frosted glass bg, releases when parent section scrolls out
- **Spacing:** `mt-28` (112px) between bio section and work section

### Hero Intro Sequence
- **5 phases:** star1 (`*` blink 1800ms, Geist weight 500) → heading streams word-by-word → star2 (1800ms) → bio paragraph streams → done
- **Word streaming:** 40ms/word, 250ms opacity fade per word
- **6-level progressive disclosure:** Each "+" click shows next bio paragraph with loading star (1200ms) + stream
- **Question prompts:** "What else have you worked on?" / "How'd you get into design?" / "What drives your work?" / "What do you do outside of work?" / "How can I reach you?"
- **SessionStorage skip:** `portfolio-intro-seen` — same-session revisits skip to `done`

### Theme Palette Picker
- **Desktop:** 200px fixed panel, scale 0.85→1 from top-left (spring 500/32)
- **Mobile:** Full-width bottom sheet, slides up (spring 350/32)
- **Sections:** Color swatches (6-col grid of 12 circles), font cards (3 "Aa" squares), action buttons (-/reset/+)
- **Persistence keys:** `theme-mode`, `colored-theme-name`, `font-pairing`, `font-size-offset`

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
_Updated by Claude at end of each session_
- **Last worked on (2026-05-02):** Shipped the locked-content gating + the unified toolbar redesign to production. PRs #6, #8, #9 merged. Vercel deployed. Production now has: WIP-courtesy lock on case studies + Playground (env-hashed code, default `miyagi`), polished LockGate / PasswordModal motion + hitboxes, AND the 4-phase unified fixed-top toolbar (single bar, left cluster + right time/weather, palette popover, music expands from origin, LED matrix viz scenes, no greeting cycle).
- **Branch tangle resolved:** `feature/chat-side-panel` carried 4 toolbar phases (`e1da6e7`, `f877862`, `d41dd67`, `566e7a0`) that were branched before the lock work hit main, so a direct merge would have wiped the lock files. Cherry-picked the 4 phases onto a fresh branch off main as `feature/toolbar-redesign` → PR #9 → merged. Backup tag `backup/chat-side-panel-2026-05-02` anchors `566e7a0` (original Phase 4 tip) for recovery.
- **Locked content architecture:** `lib/locked-content.ts` is the single source of truth (9 slugs in `LOCKED_SLUGS` Set). `components/LockGate.tsx` is the wrapper (modes: `card` for hover overlay + click intercept with `cardRadius` prop, `page` for full-screen placeholder with staggered motion + email/LinkedIn/code CTAs). `lib/PasswordGateContext.tsx` is the unlocked-state provider (env-hash + multi-tab sync). `components/PasswordModal.tsx` is the global modal (mounted in `app/layout.tsx`) with active:scale press feedback + 40×40 close hitbox.
- **Vercel env var still required:** `NEXT_PUBLIC_UNLOCK_CODE_HASH` should be set in Vercel for a non-default unlock code. Without it, the default hash in code accepts `miyagi`.

- **Previous session: Playground case studies** — interview, write, ship subpages, build reusable interview methodology
- **Completed this session:**
  - **Playground card copy refreshed** in `Playground.tsx` — three new descriptions in voice (b) crafted/quietly self-assured + flashes of (a) playful/confident; new section subtitle ("Personal experiments and gifts. Software as a love language; AI as the way I get the ideas in my head out into the world."); cards now `<Link>` into subpages with title-color hover.
  - **Three Playground subpages** at `/play/{six-degrees,pajamagrams,custom-wrapped}` built on `CaseStudyShell` pattern (matching `ai-workflow` style — no gradient hero, autoplay video as visual anchor). Each: header + autoplay video + 4–5 sections in TwoCol.Left + ImagePlaceholders + NextProject cycling through the trio.
  - **`/play` is now a real index page** — replaced "Coming soon" with page title + subtitle + reused `<Playground hideHeader />`.
  - **Shared roster** extracted to `lib/playground-cards.ts` (single source of truth for homepage Playground component + `/play` index).
  - **`backHref` threaded through `CaseStudyShell`** — Playground subpages route mobile "Back" to `/play` instead of `/#projects`.
  - **6 source docs** under `case-studies/playground/` — `{slug}-outline.md` (raw context: stack, architecture, decisions, hard parts) + `{slug}.md` (polished short case study) for each project.
  - **`docs/CASE-STUDY-INTERVIEW.md`** — reusable interview methodology + 12 question banks (A–F universal battle-tested; G–K work/corporate proposed; L synthesis). Paste into future case study sessions to repeat the rhythm.
- **Methodology insight worth keeping:** parallel research (read repo + ask questions simultaneously) + one Q at a time + brief "Logged: X" reframes + propose voice options with recommendation + propose drafts before writing files. Documented in `CASE-STUDY-INTERVIEW.md`.
- **PR #4 merged** via rebase into `origin/main` (`cee72df`). Local main reset to match origin (history previously diverged because PR #3 chat-bar merge landed in parallel — content was identical, SHAs differed). Vercel deploy succeeded.
- **In progress:**
  - Per-study illustration/imagery to swap into the ImagePlaceholders on the new Playground subpages (Marco can author at own pace by editing each `[Name]Content.tsx`)
  - 42 ImagePlaceholders still remain in main work case studies (F&B 10, Compendium 15, Upsells 17)
  - Carousel view (`feature/carousel-view` worktree) still unmerged — separate workstream
- **Known issues:** none from this session.
- **Nav model clarification (CLAUDE.md was stale):** `DesktopSidebar.tsx` no longer exists — homepage uses `HomeNav.tsx` with anchor-only nav (Home / Work / Playground, all in-page anchors). No global route nav with "enable Play" toggle to flip; Playground is already discoverable via the `#playground` anchor. `MobileNav.tsx` only shows on case study subpages with a single "Back" link driven by `SidebarContext.backHref`.
- **Key files added/modified this session:**
  - `site/components/Playground.tsx` — refreshed copy, subtitle, clickable Link wrapper, accepts `hideHeader` prop, imports from shared roster
  - `site/components/case-study/CaseStudyShell.tsx` — added `backHref` prop pass-through
  - `site/lib/playground-cards.ts` — new (shared roster + helpers)
  - `site/app/play/page.tsx` — rewritten as real index
  - `site/app/play/{six-degrees,pajamagrams,custom-wrapped}/page.tsx` + `[Name]Content.tsx` — new (6 files)
  - `case-studies/playground/{six-degrees,pajamagrams,custom-wrapped}{-outline,}.md` — new (6 files)
  - `docs/CASE-STUDY-INTERVIEW.md` — new reusable interview method

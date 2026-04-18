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
- **Vault:** `~/Documents/marcowits/Canary/portfolio/critiques/` — per-study design critiques (reflective)
- Read critiques for context when refining case study content, but don't copy them into this project.

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
├── DesktopSidebar.tsx          # Homepage-only sidebar (lg+), nav links with ✸ star
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
| `--color-accent` | `#B5651D` (copper) |

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
| `--color-accent` | `#D4915E` (copper) |

### Colored Themes
10 WCAG AA–compliant palettes: ocean, forest, wine, slate, ember (bold); lavender, mint, rose, butter, sky (soft). Each overrides all CSS variables. Persists via `theme-mode` + `colored-theme-name` in localStorage.

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
- **Active state:** Copper ✸ star + text springs 18px right
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
- **5 phases:** star1 (✸ blink 1800ms) → heading streams word-by-word → star2 (1800ms) → bio paragraph streams → done
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

## Session End
Before ending any session:
1. Update the "Current State" section below with: what was accomplished, what's in progress, any known issues
2. Note exact file paths that were modified
3. If any features are partially complete, describe what's left

## Current State
_Updated by Claude at end of each session_
- **Last worked on:** "How I Work with AI" page + teaser mode off
- **Completed this session:**
  - Added dedicated "How I Work with AI" page at `/work/ai-workflow` — 5 sections: Overview, The Setup, MCP Integrations, Self-Improving System, Building Real Software, What I've Learned
  - Registered route in DEDICATED_ROUTES, added tags to study-tags.ts, created MDX frontmatter (order: 7)
  - Flipped `NEXT_PUBLIC_TEASER_MODE=false` in `.env.local` — full portfolio now live
  - Verified: tsc passes, page renders 200, homepage renders 200
- **In progress:**
  - 42 ImagePlaceholders remain (F&B 10, Compendium 15, Upsells 17) — all need Figma exports
  - Teaser page dial values not finalized (but teaser is now off)
- **Known issues:** `BackgroundTexture 2.tsx` reappears (iCloud sync). 4 commits unpushed to origin.
- **Files modified this session:**
  - `site/app/work/ai-workflow/page.tsx` — new: metadata wrapper
  - `site/app/work/ai-workflow/AIWorkflowContent.tsx` — new: full content component
  - `site/content/ai-workflow.mdx` — new: frontmatter for card/list rendering
  - `site/app/work/[slug]/page.tsx` — added "ai-workflow" to DEDICATED_ROUTES
  - `site/lib/study-tags.ts` — added ai-workflow tags
  - `site/.env.local` — flipped teaser mode to false

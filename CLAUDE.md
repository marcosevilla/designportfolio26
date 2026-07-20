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
| `DEAD-CODE-AUDIT.md` | Full unused/hidden-code inventory (2026-07-15) — phantom slugs, orphan routes, stale data |
| `SALVAGE-REVIEW.md` | What was kept for reuse after the dead-code deletion + recovery commits for everything deleted, incl. the intro/greeting animations |
| `PORTFOLIO-RESEARCH.md` | Deep research on case study content, homepage strategy, and visual design best practices — sourced from 30+ design leaders and publications |
| `PORTFOLIO-AUDIT.md` | Full audit of the current site with prioritized recommendations (P0-P3) — covers content, visuals, accessibility, and performance |
| `LOGO-LAB-HANDOFF.md` | Building the interactive 3D logo (`/dev/logo-lab`) — reverse-engineering findings from opensoftware.co + recipe + open decisions. Read before any 3D logo work. |

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
- **Framework**: Next.js 16 (App Router, Turbopack)
- **Styling**: Tailwind CSS with CSS variables for theming
- **Animations**: Framer Motion (parallax, scroll effects)
- **Content**: MDX files with gray-matter for frontmatter parsing
- **Deployment**: Vercel server deployment — NOT static export (the `/api/chat` route needs a server; do not add `output: export`, it would break chat). `images.unoptimized: true` in next.config.mjs is a leftover from the export era.

## Project Structure

```
app/
├── page.tsx                    # Homepage (renders HomeLayout w/ work as RSC slot)
├── layout.tsx                  # Root layout — providers, SiteHeader, ChatFab + music dock, PasswordModal
├── template.tsx                # Page transitions (framer-motion fade-in on route change)
├── api/
│   └── chat/                   # Chat-bar server route (Node runtime)
├── work/
│   ├── fb-ordering/            # Dedicated case study (editorial grid, public)
│   ├── compendium/             # Dedicated case study (editorial grid, locked)
│   ├── knowledge-base/         # Dedicated case study (editorial grid, locked)
│   ├── ai-workflow/            # "How I Work with AI" (public)
│   ├── upsells/                # RESTORED 2026-07-15 from May history (TwoCol era, locked)
│   ├── checkin/                # RESTORED 2026-07-15 (TwoCol era, locked)
│   ├── general-task/           # RESTORED 2026-07-15 (TwoCol era, locked)
│   ├── design-system/          # RESTORED 2026-07-15 (TwoCol era, locked)
│   └── page.tsx                # Redirect stub → /#projects
├── play/page.tsx               # Redirect stub → /#playground (subpages deleted May 4)
├── resume/                     # In-app resume w/ print CSS (orphan — links use Drive PDF)
├── writing/                    # "Coming soon" shell (linked from nothing)
└── dev/
    └── type-lab/               # Typography composition tool — NOT NODE_ENV-gated, ships in prod build

components/
├── case-study/                 # Reusable case study components (TwoCol, CaseStudyHero,
│                               # CaseStudyShell, QuickStats, ExpandableSection, PullQuote,
│                               # NextProject, ProgressBar, ImagePlaceholder, FadeIn,
│                               # SectionHeading, SidebarTOCBridge, TOCObserver)
├── chat/                       # Chat bar UI (ChatBar, ChatPanel, ChatFab, ChatMessage,
│                               # ChatMessageActions, ChipPrompt, CaseStudyCardUnfurl,
│                               # parseChatMarkup, parseStream)
├── music/                      # MusicMiniWidget (FAB dock) + InsetScrubber + PlayerChip
├── fb-showcase/                # ObjectFlowDiagram (live on F&B page) + kept-for-salvage:
│                               # RoadmapEvolution, SystemArchitecture, MobileShowcase,
│                               # BrowserMockup (see docs/SALVAGE-REVIEW.md)
├── layout/                     # Grid.tsx — editorial 12-col Grid/Col primitives
├── type-tuner/                 # Typography composition tool (/dev/type-lab — ships in prod!)
├── dev/                        # Dev-only inline content editor (EditableOverlay,
│                               # FloatingToolbar, SectionReorder) — NODE_ENV-gated
├── ui/                         # Primitives (tooltip — Base UI)
│
├── HomeLayout.tsx              # Homepage shell — editorial grid canvas; Hero renders
│                               # ONLY in About-me mode (intro streaming is About-only)
├── Hero.tsx                    # About-me surface (bio paragraphs, resume CTA)
├── SiteHeader.tsx + HeaderToolbar.tsx  # Global top chrome (wordmark, controls)
├── NavOverlay.tsx + HamburgerMenu.tsx  # Left-edge checkerboard rail → slide drawer nav
├── MobileNav.tsx               # Case-study-only top bar (Back link via SidebarContext)
├── LedMatrix.tsx               # LED matrix audio visualizer canvas
├── LockGate.tsx                # WIP-courtesy gate — `card` / `page` modes
├── PasswordModal.tsx           # Global unlock modal (mounted in layout.tsx)
├── PaletteSwatches.tsx / ThemeToggle.tsx  # Theme swatches + applyColoredTheme
├── HighlightableBio.tsx + HighlighterContext.tsx + PhotoStack.tsx  # About bio surfaces
├── ConnectLinks.tsx            # Email / LinkedIn / Resume CTA cluster
├── Resume.tsx                  # In-app resume (route /resume, print CSS)
├── LocalStatus.tsx             # Time / weather / location strip
├── LoadingOverlay.tsx          # Load intro: * blink → type "Welcome" → morph to wordmark.
│                               # OFF via SKIP_INTRO=true (line 12); preview w/ ?loader=1 in dev
├── CaseStudyList.tsx           # THE homepage work grid (StudyCell media frames, playground
│                               # cells, lightbox, parked CellCaption + tag filter)
├── WorkHistory.tsx + case-study/ProjectDetails.tsx  # Kept-for-salvage (unmounted, both work)
├── DeviceShell.tsx             # Phone/browser specimen shells for card media
├── StreamingText.tsx           # Character streaming (used by About bio)
├── TwoCol.tsx                  # RESTORED 2026-07-15 — layout dep of the 4 restored studies only;
│                               # new work uses the editorial grid
├── Icons.tsx / ViewportFade.tsx / FadeIn.tsx  # Shared utilities

lib/
├── locked-content.ts           # Single source of truth for locked slugs (LOCKED_SLUGS Set)
├── PasswordGateContext.tsx     # Unlocked-state provider (env-hash + multi-tab sync)
├── SidebarContext.tsx          # Case-study sidebar state + backHref
├── playground-cards.ts         # Playground roster (homepage cells)
├── chat/                       # Chat data + prompt + rate-limit + study-metadata
├── layout-presets.ts           # Editorial grid spec parser + presets
├── AudioPlayerContext.tsx / VisualizerSceneContext.tsx / visualizer-scenes.ts
├── audio-analysis.ts / playlist.ts
├── NavOverlayContext.tsx / ChatOverlayContext.tsx / ChangelogOverlayContext.tsx
├── carousel-transition.ts      # Kept-for-salvage: gradient-veil route transition
├── dot-font.ts                 # Kept-for-salvage: 3×5 bitmap pixel font + canvas helpers
├── bio-content.ts              # Bio paragraphs (generated from content/bio.md)
├── content.ts / gallery-content.ts / resume-content.ts / changelog.ts
├── editor-types.ts + InlineEditorContext.tsx  # Dev inline editor
├── springs.ts / study-tags.ts / typography.ts / types.ts / utils.ts

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

### Routes ↔ data reconciliation (2026-07-15)
The dynamic `app/work/[slug]/` route is long gone — every study is a dedicated route. Slug sets that must stay in sync when adding/removing a study: `lib/locked-content.ts` (LOCKED_SLUGS), `CaseStudyList.tsx` (STUDY_ROUTES + HIDDEN_SLUGS), `lib/chat/study-metadata.ts` (STUDY_SLUGS/METADATA), `lib/chat/case-study-content.ts` (FILENAME_BY_SLUG), `lib/editor-types.ts` (SLUG_TO_FILE), `content/*.mdx`. Known gap: `knowledge-base` has a live route but no chat metadata entry; chat study links resolve to `/#projects` (hardcoded in parseChatMarkup + CaseStudyCardUnfurl since May 4) even though routes exist again.

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

### Visual Effects (restored + retuned 2026-07-17 via /dev/effects-lab)
- **Background**: Perlin noise animated dot grid (`components/BackgroundTexture.tsx`, mounted in HomeLayout — homepage only). Restored from `e78665f` with retuned params; see the component's `PARAMS` const. Diamond dots, spacing 9, slow wave (speed 0.004), subtle cursor halo (radius 90, blend 0.35).
- **Paper grain**: `--grain-image` SVG tile in globals.css (`body::before`, multiply) — unchanged, matches lab defaults (freq 0.8, strength 0.18).
- **Cards**: Cursor-tracking rim glow on work-grid media frames — `components/CursorGlowOverlay.tsx`, dropped as last child inside `StudyMediaFrame` in CaseStudyList.tsx. Listens on its parentElement (no wiring on the frame), desktop-only. Radius 170, rim 0.55, inner 0.04, falloff 55%, hover scale 1.005.
- **Tuning**: `/dev/effects-lab` — prop-driven copies of both effects + grain overrides with a slider panel; its DEFAULT_* consts mirror the applied values (keep in sync when retuning).
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
| Body / case study prose | 400 | 14px / 22.4px line-height | `typescale.body` — SITE-WIDE body standard (2026-07-15): same 14/22.4 on the home bio (inline in HomeLayout) and the `body` element default (globals.css, unitless 1.6). Change all three together. |
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

### Load Intro (LoadingOverlay)
- **Current sequence (OFF by default):** `*` cursor-blinks ×3 → types "Welcome" (95ms/char) → holds → backspaces → star morphs via layoutId `hero-star` into the wordmark star → bg fade. Once per session (`portfolio-loaded`).
- **Kill switch:** `SKIP_INTRO = true` at `LoadingOverlay.tsx:12` — flip to `false` to restore. Dev preview without flipping: `?loader=1`.
- The older 5-phase streaming hero + CyclingGreeting typing header are deleted — recovery commits in `docs/SALVAGE-REVIEW.md`.

### Theme Palette Picker
- **Surface:** Popover from the unified toolbar's palette button (desktop) / bottom sheet (mobile)
- **Sections:** Color swatches only (10 colored themes + mono + light/dark) and font-size ±/reset action buttons. Font-pairing picker was removed April 2026.
- **Persistence keys:** `theme-mode`, `theme-family`, `colored-theme-name`, `font-size-offset`

### Background Texture (BackgroundTexture.tsx)
Restored 2026-07-17 (deleted 3d3a14c → recovered from e78665f, retuned in /dev/effects-lab). Params live in the component's `PARAMS` const — the values in "Visual Effects" above are canonical. Colors resolve at runtime: dots `--color-fg-tertiary`, cursor halo `--color-glow`.

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

- **Latest (2026-07-20, main):** Work marquee + neutral card shade (spec: `docs/superpowers/specs/2026-07-20-work-marquee-design.md`). "Select work" grid → full-bleed neesh.cc-style CSS marquee (`StudyMarquee` in CaseStudyList.tsx + `.work-marquee` rules in globals.css): uniform 420×323 cells (80vw clamp on mobile), 70s linear infinite to −50%, pause on hover, duplicates aria-hidden+inert, reduced-motion → static scrollable row with dupes hidden, set count doubles on ultrawide (>~3.1k px). Featured F&B full-canvas treatment retired. `CARD_TINTS`/`CARD_BG`/`PLACEHOLDER_BG` deleted → single `FRAME_BG = color-mix(fg 4%, bg)` on study + playground frames (the "Bento Cards" background note above is historical). `--color-card-bg` var kept — still used by ObjectFlowDiagram. Verified in-browser: light/dark/mobile, animation, a11y attrs, no x-overflow, tsc clean. Tuning knobs if wanted: `MARQUEE_BASE_DURATION_S`, cell width, `FRAME_BG` mix %.
- **Earlier (2026-07-19→20, committed 4d688f9):** Homepage typography/link redesign pass, driven live via Agentation feedback. NOT committed or deployed — commit before further work.
  - **Baskerville is gone site-wide:** every `var(--font-baskerville), Georgia, serif` → `var(--font-geist-sans), system-ui, sans-serif` (HomeLayout, CaseStudyList, SiteHeader, SectionHeading, PullQuote, ExpandableSection + the 4 case-study Content files). The `Libre_Baskerville` next/font load in `app/layout.tsx` is INTENTIONALLY still mounted for easy revert — remove it once Marco commits to Geist. Former italic-serif spots now synthesize oblique from Geist (no true italic); flagged, Marco hasn't objected yet.
  - **Home intro restructured (HomeLayout):** h1 "Marco Sevilla" is now 16px/24 weight 600, −0.02em (a body-scale label, not display type). The standalone italic tagline is DELETED — "Product Designer based in San Francisco, California." is now the opening sentence of the first bio paragraph. Bio blur-in delay 0.2 → 0.15. Bio container color → `--color-fg-secondary`. NOTE: About-page bio (`content/bio.md`) does NOT open with the role/location line — mirror there if wanted.
  - **SectionLabel (CaseStudyList, "Select work"/"Just for fun"):** Geist Mono, ALL-CAPS (textTransform), body size 14/22.4, weight 400, −0.02em, primary ink.
  - **Paragraphs read secondary site-wide:** new `p { color: var(--color-fg-secondary) }` element-rule in globals.css (utilities/inline styles still win); titles keep explicit `--color-fg`. Chat messages/tooltips/pull quotes dim too — Marco hasn't reviewed those surfaces yet.
  - **Link hover = block swipe (globals.css):** `.dotted-link--inline` dashed-underline hover replaced by a solid `--color-accent` block sweeping left→right (background-size 0%→100% full-height, 350ms) with text flipping to `--color-on-accent`; dotted rest underline kept; 3px padding offset by negative margin (no layout shift) + `box-decoration-break: clone`. `.photo-stack-trigger` matched (220ms). Plain `.dotted-link` class is dead CSS (zero TSX usages) — delete candidate. Offered crisper clip-path text reveal if the mid-swipe color fade bothers him.
- **Earlier (2026-07-19, main, DEPLOYED):** Two follow-ups, both live: (1) **Compendium text alignment to F&B** (94c6760) — intro subtitle now the F&B pattern (italic tertiary hook + secondary body; the 18px Baskerville italic para is gone), `<strong>` → font-medium spans site-scale-wise, Problem pt-24 → pt-32, mb-4 → mb-5. (2) **F&B guest mobile-flow video** (a86682d) — fb-mobile.mp4 full-canvas between intro and Solution, native 4:3 uncropped, AutoplayVideo; **fb-guest-flow.mp4 DELETED** (was unreferenced; recoverable from git). NOTE: fb-mobile.mp4 is still the 16MB original — re-export at lower bitrate when Marco gets to it (drop-in replace, no code change). Compendium hero slot still renders an empty placeholder (needs real export or removal).
- **Earlier (2026-07-18, main, DEPLOYED):** Perf + mobile batch (b9a59f5), pushed together with the whole local stack (compendium ungate f54c90f, sweep 4e81a4c, chat panel 304f393) on Marco's "commit and deploy". Images: 20 PNGs → WebP ≤1600w (~41MB saved, originals deleted from tree; 11 unreferenced gallery PNGs kept pending delete call; script at site/scripts/optimize-images.mjs). New `components/AutoplayVideo.tsx` = ambient video with IO offscreen-pause + reduced-motion gate (all 4 ambient sites; lightbox left user-initiated). /work + /play are now next.config redirects (stub pages deleted; backHrefs → /#projects). Touch targets: `.tap-target` utility + bigger .bio-toolbar-btn hit area, @media(pointer:coarse) only. Mobile audit at 390px was clean otherwise (no overflow, no tiny text; MetaRail info glyph already had ::before expansion). Still open from this batch: two dead videos in public/videos (fb-mobile, fb-guest-flow, ~27MB) + guest-experience-dash.mp4 re-export + NavOverlay mount-or-delete.
- **Earlier (2026-07-18, main):** Chat migrated from full-screen page → **right side panel** (commit 304f393). Desktop lg+: panel in the existing `.chat-panel-slot` (360px, bottom-right), slides in on the same 0.46s curve as the `[data-chat-open]` body push — content stays visible/interactive and narrows via grid band inheritance; SiteHeader stays visible; floating dock shifts left (`.floating-dock` rule). Mobile <lg: iOS bottom sheet — 32px top peek, rounded corners, grabber (drag-down dismiss via useDragControls, threshold 140px/600 velocity, snap-back below), scrim tap closes, keyboard via existing `--chat-vh`. MainBlurLayer DELETED. ChatPanel non-headless everywhere (its own .chat-surface + X). Verified in-browser both breakpoints + gestures; tsc/build clean. NOTE: the "v1 limitation" line under "Chat bar" above (pill only in in-flow toolbar) predates this — ChatFab is the trigger now.
- **Earlier (2026-07-18, main, since DEPLOYED):** Architecture/perf/runtime sweep (commit 4e81a4c). Three-agent audit, high-confidence fixes applied and build-verified:
  - **Chat content now ships to prod:** `outputFileTracingIncludes` glob was resolving against `site/` so zero case-study .md files were traced into `/api/chat` — prod chat ran metadata-only since launch. Fixed to `../case-studies/**/*.md` (17 files traced, verified in route.js.nft.json). Also: chat study links/unfurls route to `/work/<slug>` again (were `/#projects`), knowledge-base added to chat metadata + content map, route fails open on Upstash errors / 503s on missing API key / aborts the Anthropic stream on client disconnect.
  - **Homepage prerenders again:** `useSearchParams` isolated into `AboutParamWatcher` (null leaf + own Suspense) in HomeLayout; the page-level Suspense wrapper is gone. The "home markup never appears in static HTML" caveat elsewhere in this file is now obsolete.
  - **Both queued quick wins done:** `app/icon.svg` favicon (3-stroke asterisk, dark-aware) + all three /dev labs 404 in prod (`notFound()` behind NODE_ENV).
  - **SEO:** root-layout canonical (pointed every page at the homepage) removed; sitemap trimmed to home + fb-ordering + compendium + ai-workflow.
  - **Runtime fixes:** template.tsx overlay unmounts post-fade; BackgroundTexture DPR cap 1.5 + reduced-motion; LedMatrix reduced-motion rAF/GL leak; audio next/prev while paused stays paused; PasswordModal focus in/restore; `defaultTheme="light"` (kills dark-OS first-paint flash).
  - **Known issues NOT fixed (need Marco's calls / media work):** 15MB `guest-experience-dash.mp4` playing in a 323px card + 5 more autoplaying homepage videos with no posters/offscreen-pause; multi-MB case-study PNGs with no lazy/width/height (wants a scripted WebP pass); ~27MB dead videos in public/ (`fb-mobile.mp4`, `fb-guest-flow.mp4`) — deletion left to Marco; framer-motion LazyMotion migration; NavOverlayProvider mounted but `<NavOverlay />` rendered nowhere (drawer nav doesn't exist despite docs above); `/resume` + `/writing` orphaned; stale playground slugs in LOCKED_SLUGS.
- **Earlier same day (2026-07-18, main, since DEPLOYED):** Compendium content pass + ungate (commit f54c90f).
  - Executed the critique's priority list (`~/Obsidian/marcowits/portfolio/case-study-critiques/compendium-case-study-critique.md`): hero rewritten as a hook; research insights de-AI'd (arrow formula removed); Process collapsed 5 dated phases → 3 moments led by the Figma-prototype-closed-deals story (engineer quote kept anonymous — Marco can re-add Wenjun's name); Impact clustered with lead metrics and **partner-specific dollar figures removed by Marco's call** ($18M Wyndham, $200K Omni — kept "400+ sites" scale); COMO loss elevated to its own Reflection block ("The customer we lost"); guest-experience-dash.mp4 embedded in Solution (zoom-crop 1.32, same as homepage card). `compendium` removed from LOCKED_SLUGS.
  - Shipped publicly 2026-07-18 as part of the batch deploy (Marco's "commit and deploy").
  - **Open threads he owes answers on:** (1) rejected-direction anecdote for the Solution section — was a free-form editor/template approach actually explored before the structured builder? Add 2 sentences if real, skip if not. (2) Stats freshness — page labels stats "Dec '25" which is honest; he said "get back to me later."
  - **Quick wins queued:** favicon 404 on prod; NODE_ENV-gate the three /dev labs (now carrying a ~1MB three.js chunk). Next study for the ungate train after compendium: pick between upsells/checkin.
- **Earlier (2026-07-17, main):** Logo lab session (docs/LOGO-LAB-HANDOFF.md executed) — PARKED, resume later.
  - **`/dev/logo-lab`** built (app/dev/logo-lab/: page + LogoLab panel + LogoScene + params.ts + glyph.ts) — extruded + beveled mark, drei MeshTransmissionMaterial, Environment presets, ContactShadows, free-tumble drag with inertia (world-axis quaternion premultiply + exponential damping, ~30 lines, no physics engine). Panel is the effects-lab idiom + copy-settings JSON. Decisions: eventual home = homepage hero, free-tumble. Like other labs, NOT NODE_ENV-gated.
  - **Mark = Marco's ✦ ˖ sparkle composition** (SVG from Desktop, baked into glyph.ts; replaced the initial Geist `*`, which lives in git history at d2e014c). Three outlines — sparkle / plus / dot — each with **independent shape controls** (depth, bevels, size, rotation, XYZ offsets, on/off) merged into one mesh so the transmission material renders once. Geometry normalized to the old 34.4-unit glyph box so slider units stay comparable.
  - **New deps:** three 0.185 + @react-three/fiber v9 + @react-three/drei v10, installed with `--legacy-peer-deps`. GOTCHA: Next 16 App Router runs vendored React 19 internals regardless of package.json's react 18.3 pin — fiber v8 (React-18 reconciler) crashes with `ReactCurrentOwner` undefined; v9 is required. The 3D chunk stays route-scoped: LogoScene loads only via next/dynamic ssr:false inside LogoLab.
  - Verified in-browser: renders, drag-flick tumbles with inertia, tsc clean. Env preset HDRIs fetch from drei's CDN at runtime — self-host before any hero integration.
  - **Next when resumed:** Marco tunes in the lab → paste settings JSON → bake values → hero integration perf pass (self-host HDRI, lazy chunk). No settings JSON captured yet.
  - NOT committed: Marco's separate in-flight globals.css page-wash gradient (body background-image keyed off --color-accent) — left uncommitted, not part of this work.
- **Earlier (2026-07-17, main):** Restored effects session.
  - **`/dev/effects-lab`** built (app/dev/effects-lab/: page + EffectsLab panel + prop-driven BackgroundTexture + GlowCard) — slider playground for grain / dot grid / card rim glow with copy-settings JSON. Like type-lab, NOT NODE_ENV-gated — gate or delete before it matters.
  - **Applied Marco's tuned settings to the live site:** `components/BackgroundTexture.tsx` (new, tuned diamond-dot build, mounted in HomeLayout after LoadingOverlay) + `components/CursorGlowOverlay.tsx` (new, parent-listening rim-glow overlay, last child of StudyMediaFrame in CaseStudyList.tsx). Grain unchanged (tuned values matched production). Playground cells intentionally have NO glow (they're non-interactive) — extend by dropping `<CursorGlowOverlay />` into PlaygroundMediaFrame if wanted.
  - Lab DEFAULT_* consts mirror applied values; keep in sync when retuning. Verified in-browser: dot grid renders on home, rim glow + 1.005 scale on study frames, tsc clean.
- **Earlier (2026-07-15 evening, same branch):** Intro/animation session on top of the audit work.
  - **Load intro ON:** `SKIP_INTRO=false`. Sequence: `*` blinks ×3 → types the wand-kaomoji sparkle trail `(∩ᵔ ᵕ ᵔ )⊃━☆ﾟ…` (the trailing ✧ IS the loader star, not typed text) → holds → CSS fade to page. No backspace. All timings ÷1.5 (~4.5s total). Preview: `?loader=1` in dev.
  - **CRITICAL FIX in LoadingOverlay:** the overlay's fade/unmount is plain CSS now — the old AnimatePresence/animate-opacity exit tween silently stalled (overlay stuck at opacity 1 over the page for first-time visitors, rAF healthy, React state correct). Do not reintroduce framer for the overlay lifecycle. The layoutId `hero-star` morph was removed too (receiver lives in Hero, which never mounts on home — it was a no-op).
  - **CyclingGreeting:** revived from `e59ddb5`, briefly in the h1, then moved to the tagline, then PARKED (Marco: "maybe later") — component lives in `components/CyclingGreeting.tsx` (anchor-phrase cycle, Geist `*` cursor, `start` prop), cursor CSS still in globals.css. Tagline + h1 are static again.
  - **SiteHeader wordmark always visible** (scroll threshold removed).
  - **Testimonials:** "Kind words" section between Select work and Just for fun — 3 condensed quotes (one per person), three equal lg columns (1-4/5-8/9-12), data in `lib/testimonials.ts`.
  - **Marco's parallel WIP committed as checkpoint:** CustomCursor + `lib/cursor-label.ts`, fb-guest-ordering + photography-portfolio videos, upsells mock PNG, content passes on bio/knowledge-base/gallery/playground/ObjectFlowDiagram/MetaRail.
- **Earlier same day (2026-07-15, branch `feat/restore-studies-and-cleanup`, off `feat/object-flow-dual-view`):** Dead-code audit follow-up session.
  - **Restored** the four May-era case studies (`/work/upsells`, `/work/checkin`, `/work/general-task`, `/work/design-system`) from pre-`7bfb4ff` history + `TwoCol.tsx` as their layout dep. Home cards re-enabled (HIDDEN_SLUGS emptied, all four in STUDY_ROUTES); still in LOCKED_SLUGS — unlock once (default code) and cards click through. design-system has no gallery media → renders the "Under construction" frame.
  - **Deleted ~5,700 lines of dead code** (old toolbars, HomeMiniPlayer/SeekBar/LedMatrixUI, CaseStudyCard/Carousel/ListRow + carousel stubs, FBCardPreview, Marquee+MarqueeContext, ChatOverlay, Playground.tsx, InlineChip, MobileSectionNav, TextureDivider, ui/button+slider, useMediaQuery, lib/_archive) + 4 npm deps (lucide-react, next-mdx-remote, class-variance-authority, dialkit). Kept-for-salvage list + recovery commits: `docs/SALVAGE-REVIEW.md`.
  - **Pruned stale docs** (jellyfish ×4, carousel ×2, TEXTURE_FEATURE_NOTES) and reconciled this file's structure section.
  - **Open decisions for Marco:** re-enable load intro (`SKIP_INTRO=false`)? revive CyclingGreeting from `e59ddb5`? chat phantom-study links (see Routes ↔ data reconciliation above)? gate `/dev/type-lab`? surface `/writing` + in-app `/resume`?

- **Later same session (2026-07-15, same branch):** Homepage grid: "Just for fun" label above playground cards (shared SectionLabel); cards went PURE-VISUAL (CellCaption parked in CaseStudyList.tsx, copy still in study metadata + playground-cards.ts). **Specimen-system prototype** for theme-cohesive card media: `DeviceShell.tsx` (phone/browser shells, one shadow spec), gallery video schema gains `shell`/`zoom`, applied to fb-mobile (phone) + guest-experience-dash (browser, zoom crops baked navy); fb-ordering added to CARD_TINTS. Rule: canvas is live CSS, media is a contained artifact, nothing full-bleed. KNOWN LIMIT: fb-mobile.mp4 changes composition mid-loop so the crop clips some scenes — needs a tight screen-only re-export (spec for all future recordings). F&B page: fulfillment-table mock removed; ObjectFlowDiagram wrapped in hairline container stroke + padding (no fill — cards are surface-filled).
- **Also this session (2026-07-15, same branch):** (1) F&B lone-text sections (Problem/Solution/Research/Impact/Reflection) moved to `media-right` with ImagePlaceholders whose descriptions double as the Figma-export shot list. (2) Homepage feedback pass: featured work-grid cell media frame now 323/480/560 by band (video no longer cover-cropped); contact rail REMOVED — Resume/LinkedIn/Email are plain dotted-underline text links directly under the bio (Marco reversed an intermediate header placement, commit 9424b6f → a115e0b); Ask me anything is now `ChatFab`, a round FAB matching the music dock, both in a shared fixed container in `app/layout.tsx` (MusicMiniWidget no longer self-positions). `AskMeAnythingButton.tsx` + `SocialLinks.tsx` deleted.
- **Last worked on (2026-07-15):** F&B object-flow diagram **dual view** on branch **`feat/object-flow-dual-view`** (NOT merged) — segmented control toggles "System composition" (Items→Mods→Menus→Outlets) vs "Guest ordering flow" (Outlets→Menus→Items→Mods, direct menu→item edges). Cards glide between column orders, connectors crossfade, route engine + hover/pin anchor flips to the view's leftmost column. Per-view caption replaces the static figure caption in `FBOrderingContent.tsx`. Spec: `docs/superpowers/specs/2026-07-15-object-flow-dual-view-design.md`. Verified both views + pinning + round-trip in browser. **Caption copy is placeholder — Marco wants a pass.** Origin: external feedback on the diagram; "labels" from that feedback = per-view captions (confirmed). Also note: main has 2 unpushed diagram commits (b0f1ef2, 14d5758) predating this branch.
- **Earlier (2026-07-14, evening session):** Editorial 12-column grid system — full layout restructure on branch **`feat/editorial-grid`** (NOT yet merged to main or deployed). See "Editorial 12-Column Grid" in Key Patterns above and `docs/LAYOUT-REFERENCE.html` for the authoring vocabulary. Plan doc: `docs/superpowers/plans/2026-07-14-editorial-grid-system.md`.
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
  - Dead-code cleanup shipped 2026-07-15 (branch `feat/restore-studies-and-cleanup`): see `docs/DEAD-CODE-AUDIT.md` + `docs/SALVAGE-REVIEW.md`. Kept-for-salvage files are deliberately unreferenced — don't re-flag them as dead.
- **Open loops:**
  - Hightouch referral blurb finalized in `~/Developer/job-hunt/hightouch-application.md` — Marco still needs to send it to Erika.
  - Remaining locked studies (compendium, knowledge-base, upsells, checkin, general-task, design-system) still need content passes before ungating.
  - Playground card descriptions could get the title-only treatment for consistency if desired (currently kept).

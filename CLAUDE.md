# Marco Sevilla Portfolio — Project Context

> **This file is loaded in full at every session start — keep it under 200 lines.**
> Detail that only matters when touching specific files lives in `.claude/rules/*.md` (path-scoped,
> auto-loads on demand). Status and history live in `docs/`. See "Where things live" below.

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
- **All code lives in `site/`** — run all npm commands from there, not the project root
- framer-motion packages have corrupted before — if you see weird build errors after no code changes, try `rm -rf node_modules && npm install` in `site/`
- Deps installed locally with `--legacy-peer-deps` (e.g. the drei v10 + React 18 pin) break the FIRST Vercel deploy after they land — Vercel's clean `npm install` hits the peer conflict your local install skipped. Commit the flag via `.npmrc` in the app dir at install time, not deploy time
- The PostToolUse hook runs `tsc --noEmit` after TS/TSX edits — if it reports errors, fix them before continuing
- If Figma MCP authentication fails, it's likely an account mismatch — don't spend more than 2 attempts debugging, ask the user
- After config changes (`.claude/settings.json`, hooks, MCP configs), tell the user if a session restart is needed
- `position: fixed` overlays nested under HomeLayout's framer-motion wrappers get trapped by the animated `filter` style (it becomes the containing block) — portal to `document.body`. Overlays that must cover SiteHeader (`z-[130]`) need z ≥ 140. ⚠️ SiteHeader was unmounted site-wide 2026-07-20, so that z-floor may no longer bind — verify. Working example of the portal pattern: `MediaPreviewLightbox`, defined inline in `site/components/CaseStudyList.tsx` (~line 858), not its own file.
- The Agentation toolbar (dev-only, bottom-right) intercepts clicks during browser automation — hide `[data-agentation-root]` when testing
- `vercel` CLI is linked to project `marcosevillaportfolio` (`.vercel/` gitignored). `vercel env pull` returns empty strings for the three chat secrets (sensitive) — expected, not a config bug.
- Apex `marcosevilla.com` 307s to `www` — curl checks must follow redirects
- Kept-for-salvage files are deliberately unreferenced — don't re-flag them as dead (`docs/DEAD-CODE-AUDIT.md`, `docs/SALVAGE-REVIEW.md`)

## Project Overview
A Next.js portfolio site for a product designer, featuring case studies with rich interactive components.

## Tech Stack
- **Framework**: Next.js 16 (App Router, Turbopack)
- **Styling**: Tailwind CSS with CSS variables for theming
- **Animations**: Framer Motion (parallax, scroll effects)
- **Content**: MDX files with gray-matter for frontmatter parsing
- **Deployment**: Vercel server deployment — NOT static export (the `/api/chat` route needs a server; do not add `output: export`, it would break chat). `images.unoptimized: true` in next.config.mjs is a leftover from the export era.

## Dev Server
```bash
cd site && npm run dev      # localhost:3000, 0.0.0.0 binding for mobile preview
```

## Session Start
At the start of every session, before doing any work:
1. Read `docs/PORTFOLIO-PRIORITIES.md` — the current task priority list
2. Read the top entries of `docs/CURRENT-STATE.md` — what happened most recently and what's in flight
3. Based on what the user asks, read the relevant docs (see index below)

Relevant `.claude/rules/*.md` load automatically when you open a matching file — you don't need to read them up front.

## Session End
Before ending any session:
1. Add a new entry at the **top** of the list in `docs/CURRENT-STATE.md`: what was accomplished, what's in progress, any known issues, exact file paths modified
2. If any features are partially complete, describe what's left
3. If you learned a **durable architectural fact** (not status), put it in the matching `.claude/rules/*.md` instead — `CURRENT-STATE.md` is for history, rules are for how the system works

## Where things live

**Path-scoped rules** (`.claude/rules/` — auto-load when you touch matching files):

| Rule | Covers |
|------|--------|
| `typography.md` | Type scale, font stack, Geist, `typography.ts` |
| `design-tokens.md` | Color CSS variables, 11-theme system, `*` brand mark |
| `editorial-grid.md` | 12-col grid, bands, presets, `CONTENT_BAND`, contact sheets |
| `case-studies.md` | Route↔data sync, content component pattern, hero gradients, MDX metadata |
| `homepage.md` | HomeNav, work marquee, card/list toggle, load intro, background effects |
| `chat.md` | Chat bar architecture, link grammar, env vars, spend safety |
| `access-gating.md` | Per-study LockGate **and** the site-wide password wall |
| `specimens.md` | DemoStage, product specimens, DeviceShell, Canary polished tokens |
| `toolbar-chrome.md` | Header chrome, theme palette, music dock, LED matrix |
| `images-media.md` | Asset layout, optimization, export gotchas |
| `inline-editor.md` | Dev-only inline content editor + publish loop |

**Non-loaded docs** (read on demand):
- `docs/CURRENT-STATE.md` — session-by-session history and in-flight work
- `docs/PROJECT-STRUCTURE.md` — annotated directory map (snapshot; filesystem wins on conflict)

## Docs Index
Reference docs live in `docs/`. Read the relevant ones based on the task — don't read all of them every time.

| File | When to read |
|------|-------------|
| `PORTFOLIO-PRIORITIES.md` | Always — current priority tiers and next actions |
| `CURRENT-STATE.md` | Session history, what's in flight, open loops |
| `PROJECT-STRUCTURE.md` | Orienting in the tree |
| `CASE-STUDY-ASSESSMENT.md` | Working on any case study — gaps and action items per study |
| `CASE-STUDY-PLAYBOOK.md` | Writing or restructuring case study content |
| `portfolio_case_study_plan.md` | Deciding which studies to prioritize or reorder |
| `VISUAL-EXPORT-GUIDE.md` | Adding images/visuals — Figma specs, aspect ratios, naming |
| `portfolio_build_context.md` | Technical questions about layout, typography, color, components |
| `designer-identity.md` | Writing copy, bio, positioning, or "about" content |
| `marco_canary_portfolio.md` | Needs impact stats or ownership data for case studies |
| `portfolio-inspiration-analysis.md` | Making design direction decisions or comparing to references |
| `designer-portfolios.md` | Looking at reference portfolios for inspiration |
| `DEAD-CODE-AUDIT.md` | Full unused/hidden-code inventory (2026-07-15) |
| `SALVAGE-REVIEW.md` | What was kept for reuse after the dead-code deletion + recovery commits |
| `PORTFOLIO-RESEARCH.md` | Deep research on case study content, homepage strategy, visual design |
| `PORTFOLIO-AUDIT.md` | Full site audit with prioritized recommendations (P0-P3) |
| `QA-FINDINGS.md` | Open visual-QA findings awaiting Marco's ruling |
| `PERF-BACKLOG.md` | Performance backlog — **ON HOLD** by Marco's call, don't re-pitch at session start |
| `TYPOGRAPHY-BACKLOG.md` | Queued type-system cleanups from the 2026-08-05 audit + the deliberate exemptions |
| `LOGO-LAB-HANDOFF.md` | Building the interactive 3D logo (`/dev/logo-lab`) — read before any 3D logo work |
| `LAYOUT-REFERENCE.html` | Visual reference for the grid system (open in a browser) |
| `figma-migration/POLISHED-TOKENS.md` | Canary polished token system + restyle pipeline |

## Case Studies (Markdown Drafts)
Written case study content lives in `case-studies/`. Each `.md` file is the narrative draft for a case study, and doubles as chat's source. Read the relevant one when working on a specific study. Route/slug wiring: `.claude/rules/case-studies.md`.

## Obsidian Vault Boundary
Case study critiques, project research, and career strategy context live in Obsidian — **do not duplicate here.**
- **Vault root:** `~/Obsidian/marcowits/`
- **Portfolio meta-docs:** `~/Obsidian/marcowits/portfolio/` — voice/style references, templates, per-study critiques, `bio.md` (symlinked to repo), `case-study-interview.md` (symlinked to repo)
- **Per-study critiques:** `~/Obsidian/marcowits/portfolio/case-study-critiques/`
- **Per-project drafts + retrospectives:** `~/Obsidian/marcowits/work/canary/projects/[slug]/` — typically `case-study-draft.md` and `retrospective-2026-04-30.md`
- Read critiques, drafts, and retrospectives for context when refining case study content, but don't copy them into this project.

## Dev labs
`/dev/type-lab`, `/dev/effects-lab`, `/dev/logo-lab` — all three `notFound()` in prod behind a NODE_ENV check.

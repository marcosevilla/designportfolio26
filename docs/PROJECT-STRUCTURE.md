# Project Structure

> **Snapshot — NOT auto-loaded.** Moved out of `CLAUDE.md` on 2026-08-04. This is derivable by
> reading the repo, so treat it as an annotated orientation map rather than a source of truth.
> If it disagrees with the filesystem, the filesystem wins.
>
> Verified against the tree on 2026-08-04; see "Known drift" at the bottom.


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

## Known drift (found 2026-08-04)

These entries above no longer match the filesystem — left in place for history, corrected here:

- `components/case-study/` lists `TwoCol` and `CaseStudyHero`. Actual: `TwoCol.tsx` is
  **top-level**, and the component is `CaseStudyHeroImage.tsx`. The dir also contains
  `InlineTOC.tsx`, `MetaRail.tsx`, `ProjectDetails.tsx`, which are not listed.
- `components/chat/` lists `ChatFab` — it is **top-level** (`components/ChatFab.tsx`).
- `components/music/` lists `PlayerChip` — **no such file**.
- Top-level components present but unlisted: `AutoplayVideo`, `ChangelogOverlay`, `CustomCursor`,
  `DemoStage`, `FnbDitherFrame`, `Testimonials`, `HomeNav`.
- `app/work/` also contains `knowledge-base/` (has a live route; see the routes/data
  reconciliation note in `.claude/rules/case-studies.md`).

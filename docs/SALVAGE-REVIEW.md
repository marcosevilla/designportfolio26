# Salvage Review — archived iterations, kept parts, and where deleted things live

_2026-07-15. Companion to `DEAD-CODE-AUDIT.md`. The deletion pass (commit "Delete dead
code: old toolbar chrome...") removed ~5,700 lines; this doc records what was KEPT for
reuse, what each deleted iteration was, and the exact commits to recover anything._

---

## KEPT IN THE REPO (deliberate archive-in-place — currently unreferenced, don't re-delete)

| File | Why kept |
|---|---|
| `components/fb-showcase/RoadmapEvolution.tsx` | Self-playing product-evolution timeline (15 nodes, RESEARCH→PIVOT→FUTURE phases, hover-pauses + rationale popovers, reduced-motion fallback). **Data-driven — swap the NODES array and it tells any project's story.** Prime seed for the locked-study content passes. |
| `components/fb-showcase/SystemArchitecture.tsx` | Interactive IA/ERD diagram — swim-lane accordions + hover-to-focus entity relationships (unrelated nodes dim to 0.25, edges carry 1:n labels). Maps directly onto compendium/design-system object-model stories. |
| `components/fb-showcase/MobileShowcase.tsx` | Overlapping phone filmstrip with mono captions. Cheapest reusable "here's the mobile flow" strip — point SCREENS at any study's shots. |
| `components/WorkHistory.tsx` | Compact resume accordion fed by live `RESUME_EXPERIENCE` — mounts on /resume or About with zero data wiring. |
| `components/case-study/ProjectDetails.tsx` | Dotted-leader accordion (`LABEL ······ value`) — distinctive editorial pattern for scope/credits blocks. |
| `components/fb-showcase/BrowserMockup.tsx` | Clean generic macOS-Safari chrome frame (traffic lights + mono URL pill + shadow). Reach for it any time a study needs a browser frame. |
| `lib/carousel-transition.ts` | The expand-to-veil route transition: full-screen veil tinted to the destination study's hero gradient, `router.push` fires under it so the route swap is invisible. Reusable for ANY card→page navigation. |
| `lib/dot-font.ts` | Complete 3×5 bitmap pixel font (A–Z, 0–9, punctuation) + 5×5 transport glyphs + canvas draw/measure/clock helpers. Distinctive; reusable for LED/pixel headers or a now-playing ticker. |

Parked in live files (revival cost noted):
- **`CellCaption`** in `CaseStudyList.tsx` — card captions. Revive: wrap `cellInner` in `StudyCell`
  (~line 667) with `<CellCaption title={study.title} … />`. Data still in study metadata.
- **Tag filter** in `CaseStudyList.tsx` — whole machinery works (chips, disabled-state, clear-all,
  sr-live count). Only missing a trigger: add one button calling `setFilterOpen(v => !v)` with the
  already-imported `FilterIcon`.

## HIDDEN-BUT-WORKING SURFACES (untouched — decide later)

- **`/dev/type-lab`** — full typography composition tool (draggable text layers, per-layer controls,
  localStorage persistence, Copy Code). ⚠️ NOT NODE_ENV-gated: it ships in production builds.
  Preset references pre-Geist fonts (PP Formula etc.) so it renders in fallbacks. Gate it or keep as easter egg.
- **`/resume`** — full in-app resume with excellent print CSS (forces light tokens, letter size,
  hides all siblings, `break-inside: avoid` → clean Cmd-P PDF). Every visible link uses the Drive
  PDF instead; decide which is canonical.
- **`/writing`** — "Coming soon" shell, linked from nothing.

## THE INTRO + TYPING ANIMATIONS (for re-adding)

1. **Asterisk intro (site load)** — **STILL IN THE CODEBASE, just switched off.**
   `components/LoadingOverlay.tsx:12` → `const SKIP_INTRO = true`. Flip to `false` to restore.
   Sequence: `*` cursor-blinks ×3 → types "Welcome" (95ms/char) → holds 1.1s → backspaces →
   star morphs (layoutId `hero-star`) into the header wordmark star → bg fades. Once per session
   (sessionStorage `portfolio-loaded`). Preview in dev without flipping: `localhost:3000/?loader=1`.
2. **CyclingGreeting (typing sentences header)** — deleted; lives at commit `e59ddb5` (2026-04-29),
   retired `e49c827`. 245 lines: typed playful pre-phrases ("Hello, friend. Welcome to my portfolio.",
   "If you're a recruiter, scroll down to see my work :)", "Made with <3 and a few cans of Celsius…")
   then looped "Hello" in 10 languages with scramble-typing + delete-out.
   Recover: `git show e59ddb5:site/components/CyclingGreeting.tsx`.
3. **Other typing-era artifacts in history:**
   - 36-variant dynamic bio (6×6 grid: casual↔professional × concise↔verbose, streaming text,
     grid-position picker): `git show 3d3a14c^` — `components/dynamic-bio/`, `lib/dynamic-bio-store.ts`.
   - ScrambleText / ScrambleParagraph entrance (letters decode from a scramble pool, theme-aware
     color flashes): added `3d3a14c`, deleted `7462650`.
   - Original 5-phase streaming hero (star blink → statement streams word-by-word → bio streams,
     "+" progressive disclosure with question prompts): initial commit `32053c9`, killed `3d3a14c`.

## DELETED — RECOVERY MAP (all in git history)

| What | Recover from |
|---|---|
| HeroToolbar (cog → 40ms-stagger blur-in reveal; music slot width-spring 28→320px "emerges from play button") | `a4dd35b` |
| MobileToolbar (iOS-style frosted pill, scale-to-0.78-on-scroll, content-measured expanding music pill) | `23910db` |
| HomeMiniPlayer (layoutId hover pill glides between transport buttons; spinning vinyl SVG; title↔scrubber vertical swap on hover) | pre-delete HEAD² |
| SeekBar (pointer-capture scrubber, `flush` bottom-edge variant) | pre-delete HEAD² |
| LedMatrixUI (play glyph drawn as lit dots in the matrix, a11y overlay) | `dc62110` |
| CaseStudyCard (cursor-tracking 1px rim-glow via mask-composite:exclude + inner glow) | `7b962c1` |
| CaseStudyCarousel (coverflow: velocity-tilt ±3°, rubber-band drag, trackpad debounce, keyboard, sessionStorage index, reduced-motion scroll-snap fallback) | `e59ddb5`² |
| FBCardPreview (hover diorama: dashboard slides + cross-fades to order sheet while phone mock rises) | `3d3a14c`² |
| Marquee (height+blur reveal choreography) | pre-delete HEAD² |
| CyclingGreeting | `e59ddb5` |

² = also at the commit immediately before the deletion commit on this branch (`git log --diff-filter=D`).

## TESTIMONIAL QUOTES (lifted from Marquee before deletion — real colleague quotes)

- "A rare, talented designer with an endless stamina for feedback and continuous improvement." — Kevin Doherty
- "He showed up again and again to ensure things were not only done on time, but that they were done well." — Hans van de Bruggen
- "You'd be lucky to have him on your team." — Hans van de Bruggen
- "Rare ability to balance strategic business thinking with exceptional craft." — EJ Lee
- "A gift for turning ambiguity into clarity." — EJ Lee
- "Teams are better, happier, and more effective with Marco on them." — EJ Lee

# Carousel View — Design Spec

**Date:** 2026-04-26
**Status:** Approved (brainstorming complete, awaiting implementation plan)
**Author:** Marco Sevilla (with Claude)

## Summary

Add a third homepage view ("carousel") alongside the existing cards/list views. The carousel is a horizontal, drag-to-scroll, snap-based stack of case study cards inspired by [marcosevilla/aman-gift](https://github.com/marcosevilla/aman-gift)'s `MessageCarousel`. Tapping a card morphs it via a "scale up then cut" transition that hands off into the full case study route, with the card's gradient matching the destination case study hero so the route swap is visually invisible.

The carousel's purpose is **delight and personality** — a third aesthetic option that adds craft and tactility. It is functionally redundant with cards/list; the value is the experience.

## Decisions Locked

| Decision | Choice |
|---|---|
| Purpose | Delight / personality (not a faster scan, not a richer browse) |
| Card data | Same `studies` array as cards/list; filter applies uniformly |
| Orientation | Horizontal |
| Card click | Expand-and-navigate (the morph IS the route transition) |
| Icon | `CarouselIcon` — 3 vertical bars (heights 6/10/6), matches existing `Icons.tsx` style |
| Persistence | Extend `work-view-mode` localStorage to accept `"carousel"` |
| Card size | Desktop: 320×420 portrait. Mobile (<lg): 260×340. |
| Style at rest | Upright, neutral. Subtle drag-velocity-derived tilt (max ±3°). |
| Open transition | Phase 1: scale-up-then-cut with gradient hand-off. Stitched cross-route morph deferred to v2. |
| Cross-card nav (expanded) | N/A — expansion *is* navigation |
| In-carousel nav | Arrow keys cycle active card |
| Authoring | One file per study + slug→component registry |
| Typography | Standardized: year + title + company·role, white text, auto scrim |
| Position | Bottom-anchored typography block |
| Contrast | Auto vertical scrim (transparent → 55% black bottom-up) |
| Mobile | Show carousel; cards resize; same drag mechanics |
| Active card | Subtle: scale 1.0 vs neighbor 0.92, opacity 1.0 vs 0.7 |
| Reduced motion | Native CSS scroll snap; no morph; instant navigate |
| Width | Carousel breaks out of homepage 640px column to viewport edges |

## Architecture

```
site/
├── components/
│   ├── CaseStudyList.tsx                          # MODIFY — already has carousel toggle wired
│   ├── CaseStudyCarousel.tsx                      # REWRITE — drag mechanics, snap, active state, kbd nav
│   └── case-study/
│       └── carousel/
│           ├── CarouselCardShell.tsx              # NEW — shared chrome
│           ├── carousel-card-registry.ts          # NEW — slug → component map
│           ├── FBOrderingCarouselCard.tsx         # NEW
│           ├── CompendiumCarouselCard.tsx         # NEW
│           ├── UpsellsCarouselCard.tsx            # NEW
│           ├── CheckinCarouselCard.tsx            # NEW
│           ├── GeneralTaskCarouselCard.tsx        # NEW
│           ├── DesignSystemCarouselCard.tsx       # NEW
│           └── AIWorkflowCarouselCard.tsx         # NEW
├── lib/
│   └── carousel-transition.ts                     # NEW — expand-and-navigate hook
└── components/Icons.tsx                           # ALREADY DONE — CarouselIcon added
```

**Boundaries:**
- `CaseStudyCarousel.tsx` — only file that knows about Framer Motion drag mechanics, snap math, keyboard. Accepts `studies: CaseStudyMeta[]` (already filtered upstream).
- `CarouselCardShell.tsx` — owns visual chrome that stays consistent across all 7 cards: dimensions, border, scrim, typography overlay, focus ring, click wiring.
- Per-study card files — own only the background composition (free-form layout of imagery/illustrations/colors). Never reimplement chrome or motion.
- `carousel-card-registry.ts` — flat object `{ slug: Component }`. Carousel looks up `registry[study.slug]`; if missing, renders a fallback `<CarouselCardShell>` with no children (an empty surface-raised card with the standardized typography overlay). All 7 studies ship with a registered card from day one, so this fallback only fires for future studies that haven't had a card authored yet.
- `lib/carousel-transition.ts` — exposes `useExpandAndNavigate()` hook. Encapsulates the click → expand → navigate sequence so v2 can swap implementation without touching the carousel component.

## Carousel Shell Mechanics (`CaseStudyCarousel.tsx`)

Pattern ported from `aman-gift/components/MessageCarousel.tsx`. Direct file:line references in the analysis report from this brainstorming session.

**Constants:**
- `CARD_WIDTH_DESKTOP = 320`, `CARD_HEIGHT_DESKTOP = 420`
- `CARD_WIDTH_MOBILE = 260`, `CARD_HEIGHT_MOBILE = 340`
- `GAP = 24`
- `SPREAD = CARD_WIDTH + GAP` (344 desktop, 284 mobile)
- `SETTLE_SPRING = { type: "spring", stiffness: 180, damping: 18, mass: 1 }`
- `RUBBER_BAND_FACTOR = 0.15`
- `VELOCITY_PROJECTION_FACTOR = 0.3`

**Layout:**
- Track: `position: relative`, full viewport width via the existing case-study-hero breakout pattern (`marginLeft: calc(-50vw + 50%)`).
- Cards: `position: absolute, left: 50%, top: 50%`, then translated by per-card `x` motion value. Active card sits exactly at horizontal center.

**Drag pipeline (single `useMotionValue` named `offsetX`):**
- Each card's `x = useTransform(offsetX, v => v + index * SPREAD)`.
- `onPanStart`: capture `panStartOffset = offsetX.get()`. Cancel any in-flight settle animation via `animRef.current?.stop()`.
- `onPan`: `raw = panStartOffset + info.offset.x`. At edges (`raw > 0` or `raw < -(count - 1) * SPREAD`), multiply overshoot by `RUBBER_BAND_FACTOR`.
- `onPanEnd`:
  - `target = currentOffset + info.velocity.x * VELOCITY_PROJECTION_FACTOR`
  - Clamp to `[-(count - 1) * SPREAD, 0]`
  - Round to nearest snap index
  - `animRef.current = animate(offsetX, -snapIndex * SPREAD, SETTLE_SPRING)`
- Tap-vs-drag: `isDraggingRef = true` during pan, cleared via 50ms `setTimeout` after pan end. Card click handler early-returns if `isDraggingRef.current === true`.

**Per-card transforms:**
- `scale = useTransform(x, [-SPREAD * 2, -SPREAD, 0, SPREAD, SPREAD * 2], [0.85, 0.92, 1.0, 0.92, 0.85])`
- `opacity = useTransform(x, [-SPREAD * 2, -SPREAD, 0, SPREAD, SPREAD * 2], [0.4, 0.7, 1.0, 0.7, 0.4])`
- `rotate` — *uniform across all cards*, derived from `useVelocity(offsetX)`: `useTransform(velocity, [-1500, 0, 1500], [3, 0, -3])`. Naturally settles to 0° when drag releases.
- `zIndex` — imperative: `5 - distanceFromActive`, max 10 for active. Set via `style.zIndex` directly, not animated.
- Cull: `Math.abs(index - activeIndex) > 3 → return null`.

**Active index tracking:**
```ts
useMotionValueEvent(offsetX, "change", v => {
  const idx = Math.max(0, Math.min(count - 1, Math.round(-v / SPREAD)));
  if (idx !== activeIndex) setActiveIndex(idx);
});
```
State only updates on snap-boundary crossings, not every drag frame.

**Keyboard navigation:**
- Window listener active when `viewMode === "carousel"`.
- `ArrowLeft` → `settleTo(activeIndex - 1)`
- `ArrowRight` → `settleTo(activeIndex + 1)`
- `Enter` / `Space` on focused card → `triggerExpandAndNavigate(study.slug)`
- `Escape` → defocus

Where `settleTo(i)` clamps `i`, sets the spring target via `animate(offsetX, -clampedI * SPREAD, SETTLE_SPRING)`.

**Reduced motion fallback (`useReducedMotion() === true`):**
- Replace absolute-positioned drag track with `flex` row inside `overflow-x-auto` + CSS `scroll-snap-type: x mandatory` and `scroll-snap-align: center` on each card.
- All transforms (scale, opacity, rotate) become CSS-static or removed.
- Click triggers `router.push` immediately, no expand morph.
- Keyboard nav scrolls via `el.scrollTo({ left: index * SPREAD, behavior: "smooth" })`.

## Per-Card Authoring API

**`CarouselCardShell` props:**
```ts
interface CarouselCardShellProps {
  study: CaseStudyMeta;
  children: ReactNode;
  isActive: boolean;
  onClick: () => void;
}
```

**Shell render order (back to front):**
1. Outer frame — fixed dimensions per breakpoint, `overflow: hidden`, sharp edges (`border-radius: 0`), 1px border using `var(--color-border)`, `position: relative`. Native `<button>` element for accessibility.
2. Background slot — `<div className="absolute inset-0">{children}</div>`.
3. Auto scrim — `<div className="absolute inset-x-0 bottom-0 h-[55%]">` with `linear-gradient(to top, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.25) 50%, transparent 100%)`.
4. Typography block — `<div className="absolute bottom-0 left-0 right-0 p-5">`:
   - Year: 11px mono, `rgba(255,255,255,0.6)`
   - Title: 18px weight 500, `#fff`, `letter-spacing: -0.01em`, `line-height: 1.25`
   - Company · Role: 12px weight 400, `rgba(255,255,255,0.7)`
5. Focus ring (when `isActive`) — `box-shadow: 0 0 0 1px var(--color-accent) inset`. No animation.

**Per-study card pattern:**
```tsx
import CarouselCardShell from "./CarouselCardShell";
import type { CaseStudyMeta } from "@/lib/types";

interface Props {
  study: CaseStudyMeta;
  isActive: boolean;
  onClick: () => void;
}

export default function FBOrderingCarouselCard({ study, isActive, onClick }: Props) {
  return (
    <CarouselCardShell study={study} isActive={isActive} onClick={onClick}>
      <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, #EF5A3C, #ED4F2F)" }} />
      <img
        src="/images/fb-ordering/fb-ordering-table.png"
        alt=""
        className="absolute"
        style={{ top: "32px", right: "-40px", width: "280px", transform: "rotate(-8deg)" }}
      />
    </CarouselCardShell>
  );
}
```

**Initial state:** all 7 per-study files ship with just the gradient background (no images). User authors imagery one card at a time on their own pace.

**Registry:**
```ts
import FBOrderingCarouselCard from "./FBOrderingCarouselCard";
// ...
export const CAROUSEL_CARDS: Record<string, ComponentType<CardProps>> = {
  "fb-ordering": FBOrderingCarouselCard,
  "compendium": CompendiumCarouselCard,
  "upsells": UpsellsCarouselCard,
  "checkin": CheckinCarouselCard,
  "general-task": GeneralTaskCarouselCard,
  "design-system": DesignSystemCarouselCard,
  "ai-workflow": AIWorkflowCarouselCard,
};
```

Carousel renders `CAROUSEL_CARDS[study.slug] ?? FallbackCard` where `FallbackCard` = `<CarouselCardShell study={study}>` with no children (just the per-study gradient as bg via the shell's default).

## Open-Card Transition (Phase 1: scale-up-then-cut)

**Choreography (300ms from click to route push):**

| t | Event |
|---|---|
| 0ms | User clicks card |
| 0ms | `expandingSlug = study.slug`. Card's outer wrapper gets `position: fixed; inset: 0; z-index: 100` via Framer layout animation. |
| 0–280ms | Card morphs to fill viewport. Scrim + typography crossfade out (0–150ms). Other carousel cards blur+dim. |
| 280ms | Morph complete. Card now fills viewport showing only the case study's gradient. |
| 300ms | `router.push('/work/${slug}')` fires. |
| 300ms+ | Destination case study page mounts. `CaseStudyHero` renders the same gradient. Existing `template.tsx` fade handles the rest. |

**Why the seam is invisible:** the carousel card's gradient (`#EF5A3C → #ED4F2F` for F&B) is identical to the destination `CaseStudyHero`'s gradient. At handoff, both source and destination show the same color across the entire viewport.

**Implementation:**
```ts
// lib/carousel-transition.ts
export function useExpandAndNavigate() {
  const router = useRouter();
  const [expandingSlug, setExpandingSlug] = useState<string | null>(null);
  const reducedMotion = useReducedMotion();

  const trigger = useCallback((slug: string) => {
    if (expandingSlug) return;
    if (reducedMotion) {
      router.push(`/work/${slug}`);
      return;
    }
    setExpandingSlug(slug);
    setTimeout(() => router.push(`/work/${slug}`), 300);
  }, [expandingSlug, router, reducedMotion]);

  return { expandingSlug, trigger };
}
```

**Scrim + typography on expand:** animate to `opacity: 0` over 150ms. Expanded fullscreen state shows pure gradient.

**Other carousel cards during expand:** wrapping `<motion.div>` around the carousel track:
```tsx
<motion.div animate={{
  filter: expandingSlug ? "blur(6px)" : "blur(0px)",
  opacity: expandingSlug ? 0.4 : 1
}} transition={{ duration: 0.3 }}>
```

**SessionStorage persistence:**
- Key: `carousel-active-index`
- Written on every active-index change.
- Read on mount; seeds `activeIndex` and `offsetX = -savedIndex * SPREAD`. Falls back to `0` if missing or invalid.
- Cleared on filter change.

**Edge cases:**
- **Browser back after navigation:** `sessionStorage` restores active card.
- **Click during pan/snap:** `isDraggingRef` blocks (50ms grace).
- **Slow networks:** `expandingSlug` stays true through the navigation, so the gradient panel persists. Acceptable since case studies are static-exported.
- **Tab switch during expand:** `setTimeout` fires regardless; user returns to the case study page, not a stuck transition.

**v2 (out of scope):** Stitched cross-route transition where the morphing overlay lives in `layout.tsx` and persists across the route change. Replace the `setTimeout` + opacity fade with a proper layout-id-across-routes hand-off via `RouteTransitionContext`. Ship Phase 1 first; revisit if the carousel earns its place on the homepage.

## Mobile, Accessibility, Filter

**Mobile (<lg, <1024px):**
- Cards: 260×340. SPREAD: 284.
- Carousel toggle visible at all breakpoints.
- Drag works via touch (Framer's `onPan` is uniform across mouse/touch).
- Viewport-edge breakout works on mobile too (no 640px column to break out of, but cards still extend to screen edges).
- Keyboard arrows are no-ops on touch; drag is the navigation.

**Accessibility:**
- Container: `role="region"` + `aria-roledescription="carousel"` + `aria-label="Case studies carousel"`.
- Each card: native `<button>`. `aria-current="true"` on active card.
- Live region: `<div role="status" className="sr-only">{activeStudy.title}, card {activeIndex + 1} of {total}</div>` updates on snap.
- Focus ring doubles as active-card indicator (Section 3).
- Tab order: carousel toggle → carousel region → first focusable card. Tab exits to StickyFooter.
- `prefers-reduced-motion`: full fallback (Section 2).

**Filter integration:**
- Carousel renders `filteredStudies` (already filtered upstream by `CaseStudyList`).
- `CaseStudyList`'s existing `AnimatePresence` keys by `filterKey` — entire carousel remounts on filter change, naturally resetting active index to 0.
- Empty state can't occur (existing tag-validation prevents zero-result filter combos).
- Single-card result: rubber-band edges hold the lone card centered; drag and keyboard are no-ops.

## Out of Scope (Explicit)

- Stitched cross-route transition (v2).
- On-screen prev/next chevrons.
- Card-shuffle animation on filter change.
- Per-card text color toggle.
- Custom expand-target shapes (gradient is always the morph target).
- Pinch-zoom or trackpad-wheel horizontal scrolling.
- Test runner setup (no `vitest`/`jest`/`playwright` in repo currently).

## Verification

No automated test suite. Verification approach:

1. **Type check:** `npx tsc --noEmit` after each commit (already enforced via PostToolUse hook).
2. **Manual smoke checklist:**
   - [ ] Toggle to carousel view → 7 cards render, active is centered
   - [ ] Drag right → snaps to next card
   - [ ] Drag with high velocity → skips multiple cards (velocity projection)
   - [ ] Click active card → expand morph + navigate to case study page
   - [ ] Browser back → returns to carousel, same active card restored (sessionStorage)
   - [ ] Arrow keys cycle active card
   - [ ] Filter to "Canary" → carousel rebuilds with subset, active resets to 0
   - [ ] View toggle persists across page reload (localStorage)
   - [ ] Resize desktop → mobile width → cards resize, layout doesn't break
   - [ ] DevTools "emulate prefers-reduced-motion: reduce" → drag becomes native scroll, click navigates instantly
   - [ ] VoiceOver: tab into carousel, arrow keys announce study titles
3. **Lighthouse pass** on homepage to confirm no accessibility regression.

## Dependencies

No new packages. Uses framer-motion (already installed) and Next.js's built-in `useRouter`. The aman-gift reference uses framer-motion v12; this repo's version supports the same APIs (`useMotionValue`, `useMotionValueEvent`, `useTransform`, `useVelocity`, `useReducedMotion`, `animate`, layout animations).

## Open Risks

- **Framer layout animation across `position: fixed` boundary** — the morph from absolute-positioned card to fixed-positioned fullscreen panel may require an intermediate static state. Mitigation: prototype first; if it flickers, fall back to a manual width/height/transform animation rather than `layout` prop.
- **Velocity-projection on trackpad two-finger swipe** — trackpads can produce abnormally high velocities. Mitigation: clamp `info.velocity.x` to `[-3000, 3000]` before projection.
- **Mobile Safari overscroll** — viewport-edge breakout may interact with iOS Safari's bounce-scroll. Mitigation: `overscroll-behavior-x: contain` on the track container.

## Decisions Deferred to Implementation

- Exact gradient hand-off mechanism — `position: fixed` with Framer `layout`, vs. `motion.div` with explicit width/height animation. Decide while building Phase 1.
- Whether the per-study card files live in their existing case study route folders (`app/work/fb-ordering/FBOrderingCarouselCard.tsx`) or in the central `components/case-study/carousel/` folder. Spec assumes central; revisit if it complicates the registry.
- Where the gradient layer lives. Two options, equivalent in output:
  - **Per-study file owns it** (as shown in the FB Ordering example): each card file includes its own gradient `<div>` as the bottom layer. Pro: every per-study file is self-contained; the shell stays dumb. Con: 7 places to update if a gradient changes.
  - **Shell auto-renders it from `study.gradient`** (would require adding a `gradient` field to `CaseStudyMeta` / MDX frontmatter). Pro: gradient is data, not code; per-study files only add overlays. Con: requires a data-model change.
  Decide while building; spec is currently written assuming option 1 (per-study file owns the gradient layer) so the fallback for un-authored cards is "shell with no children → empty card with `var(--color-surface-raised)` bg." If we go with option 2, the fallback becomes the gradient automatically.

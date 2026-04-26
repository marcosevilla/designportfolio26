# Carousel View Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a third homepage view ("carousel") with drag-to-scroll, snap, subtle active state, keyboard navigation, and a "scale-up-then-cut" expand-and-navigate transition. Ships all 7 cards as gradient-only fallbacks; per-study illustrations get authored later.

**Architecture:** A single `CaseStudyCarousel` component owns motion mechanics (Framer Motion `useMotionValue` + drag pan handlers + velocity-projected snap). A `CarouselCardShell` owns chrome (sized frame, gradient background pulled from `study.gradient`, scrim, standardized typography overlay, click handler). One per-study file per case study composes free-form background imagery as children of the shell — registered by slug. A `useExpandAndNavigate` hook encapsulates the morph + `router.push` choreography. No automated tests in this repo; verification is `tsc --noEmit` + manual dev-server smoke checks.

**Tech Stack:** Next.js 14 App Router, React 18, framer-motion (already installed, supports `useMotionValue`/`useMotionValueEvent`/`useTransform`/`useVelocity`/`useReducedMotion`/`animate`), Tailwind CSS with CSS variables. No new packages.

**Spec:** `docs/superpowers/specs/2026-04-26-carousel-view-design.md`

**Reference implementation (read for patterns):** `marcosevilla/aman-gift` repo, `components/MessageCarousel.tsx`. Key file:line index in spec doc.

**Locked decisions (from spec):**
- Card size: 320×420 desktop, 260×340 mobile.
- SPREAD = card width + 24px gap. Desktop 344, mobile 284.
- Settle spring: `{ type: "spring", stiffness: 180, damping: 18, mass: 1 }`.
- Velocity projection factor: 0.3. Rubber-band: 0.15.
- Active card scale: 1.0 vs neighbor 0.92, opacity 1.0 vs 0.7.
- Tilt: derived from `useVelocity(offsetX)`, max ±3°, applied uniformly.
- Typography: white, bottom-anchored, year + title + company·role, with auto scrim.
- Gradient layer: shell auto-renders `study.gradient` (MDX frontmatter already has it).
- Phase 1 expand: 280ms morph + 20ms idle + `router.push` at 300ms.
- Reduced motion: native CSS scroll snap, instant navigate.
- Carousel breaks out to viewport edges via `marginLeft: calc(-50vw + 50%)`.

---

## File Structure

**New files:**
- `site/components/case-study/carousel/CarouselCardShell.tsx` — chrome, gradient layer, scrim, typography, click button
- `site/components/case-study/carousel/carousel-card-registry.ts` — slug → component map + shared `CarouselCardProps` type
- `site/components/case-study/carousel/FBOrderingCarouselCard.tsx`
- `site/components/case-study/carousel/CompendiumCarouselCard.tsx`
- `site/components/case-study/carousel/UpsellsCarouselCard.tsx`
- `site/components/case-study/carousel/CheckinCarouselCard.tsx`
- `site/components/case-study/carousel/GeneralTaskCarouselCard.tsx`
- `site/components/case-study/carousel/DesignSystemCarouselCard.tsx`
- `site/components/case-study/carousel/AIWorkflowCarouselCard.tsx`
- `site/lib/carousel-transition.ts` — `useExpandAndNavigate` hook

**Files to rewrite:**
- `site/components/CaseStudyCarousel.tsx` — currently a placeholder; rewrite to full implementation

**Files to modify minimally:**
- None outside the carousel surface. `CaseStudyList.tsx` already renders `<CaseStudyCarousel studies={filteredStudies} />` for `viewMode === "carousel"` — no changes.

**Verification commands (used throughout):**
- Type check: `cd "/Users/marcosevilla/Developer/portfolio 2026/site" && npx tsc --noEmit`
- Dev server: `cd "/Users/marcosevilla/Developer/portfolio 2026/site" && npm run dev` (already running on :3000 in most sessions; check first with `lsof -i :3000` before starting)

---

## Task 1: Define shared types and create empty registry

**Files:**
- Create: `site/components/case-study/carousel/carousel-card-registry.ts`

- [ ] **Step 1: Create the registry file with type definitions and an empty map**

```ts
import type { ComponentType } from "react";
import type { CaseStudyMeta } from "@/lib/types";

export interface CarouselCardProps {
  study: CaseStudyMeta;
  isActive: boolean;
  onClick: () => void;
}

/**
 * Maps case study slug → custom carousel card component.
 * Studies without a registered component fall back to <CarouselCardShell> with no children
 * (shell auto-renders the gradient from study.gradient).
 */
export const CAROUSEL_CARDS: Record<string, ComponentType<CarouselCardProps>> = {};
```

- [ ] **Step 2: Type-check**

Run: `cd "/Users/marcosevilla/Developer/portfolio 2026/site" && npx tsc --noEmit`
Expected: clean exit, no output.

- [ ] **Step 3: Commit**

```bash
cd "/Users/marcosevilla/Developer/portfolio 2026"
git add site/components/case-study/carousel/carousel-card-registry.ts
git commit -m "$(cat <<'EOF'
Add carousel card registry skeleton

Defines CarouselCardProps and an empty slug→component map. Per-study
cards register themselves in subsequent tasks.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 2: Build CarouselCardShell (chrome + typography, no motion)

**Files:**
- Create: `site/components/case-study/carousel/CarouselCardShell.tsx`

- [ ] **Step 1: Write the shell component**

```tsx
"use client";

import type { ReactNode } from "react";
import type { CaseStudyMeta } from "@/lib/types";

interface CarouselCardShellProps {
  study: CaseStudyMeta;
  children?: ReactNode;
  isActive: boolean;
  onClick: () => void;
  /** Optional override for the auto-rendered gradient layer */
  hideGradient?: boolean;
}

const FALLBACK_GRADIENT = "linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%)";

export default function CarouselCardShell({
  study,
  children,
  isActive,
  onClick,
  hideGradient = false,
}: CarouselCardShellProps) {
  const gradient = study.gradient ?? FALLBACK_GRADIENT;
  const company = study.company ?? "";
  const role = study.role ?? "";
  const meta = [company, role].filter(Boolean).join(" · ");

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Open ${study.title}`}
      aria-current={isActive ? "true" : undefined}
      className="relative block overflow-hidden text-left"
      style={{
        // Default desktop dimensions; mobile override comes from carousel container
        width: "var(--carousel-card-w, 320px)",
        height: "var(--carousel-card-h, 420px)",
        borderRadius: 0,
        border: "1px solid var(--color-border)",
        background: "var(--color-surface-raised)",
        boxShadow: isActive ? "inset 0 0 0 1px var(--color-accent)" : "none",
        cursor: "pointer",
      }}
    >
      {/* 1. Gradient background (bottom layer) */}
      {!hideGradient && (
        <div
          aria-hidden
          className="absolute inset-0"
          style={{ background: gradient }}
        />
      )}

      {/* 2. Custom background composition (per-study children) */}
      {children}

      {/* 3. Auto scrim (above bg, below typography) */}
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0"
        style={{
          height: "55%",
          background:
            "linear-gradient(to top, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.25) 50%, transparent 100%)",
        }}
      />

      {/* 4. Typography block (always on top) */}
      <div
        className="absolute bottom-0 left-0 right-0"
        style={{ padding: "20px" }}
      >
        <div
          style={{
            fontFamily: "ui-monospace, Menlo, Monaco, monospace",
            fontSize: "11px",
            color: "rgba(255,255,255,0.6)",
            marginBottom: "6px",
          }}
        >
          {study.year}
        </div>
        <div
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "18px",
            fontWeight: 500,
            color: "#fff",
            letterSpacing: "-0.01em",
            lineHeight: 1.25,
          }}
        >
          {study.title}
        </div>
        {meta && (
          <div
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "12px",
              fontWeight: 400,
              color: "rgba(255,255,255,0.7)",
              marginTop: "4px",
            }}
          >
            {meta}
          </div>
        )}
      </div>
    </button>
  );
}
```

- [ ] **Step 2: Type-check**

Run: `cd "/Users/marcosevilla/Developer/portfolio 2026/site" && npx tsc --noEmit`
Expected: clean exit.

- [ ] **Step 3: Commit**

```bash
cd "/Users/marcosevilla/Developer/portfolio 2026"
git add site/components/case-study/carousel/CarouselCardShell.tsx
git commit -m "$(cat <<'EOF'
Add CarouselCardShell with chrome and typography

Shell owns: 320×420 frame (sized via CSS vars so the carousel can swap
mobile sizing), 1px border, gradient bg from study.gradient, auto scrim,
bottom-anchored year + title + company·role typography overlay, and
focus ring driven by isActive.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 3: Replace placeholder CaseStudyCarousel with shell-based static layout

**Files:**
- Rewrite: `site/components/CaseStudyCarousel.tsx`

This task renders all 7 cards via the shell as a horizontal flex row — no drag, no snap, no animations yet. Goal: see the cards render correctly with gradients and typography before adding motion.

- [ ] **Step 1: Rewrite the placeholder**

```tsx
"use client";

import { CAROUSEL_CARDS, type CarouselCardProps } from "./case-study/carousel/carousel-card-registry";
import CarouselCardShell from "./case-study/carousel/CarouselCardShell";
import type { CaseStudyMeta } from "@/lib/types";

interface CaseStudyCarouselProps {
  studies: CaseStudyMeta[];
}

const CARD_W = 320;
const CARD_H = 420;
const GAP = 24;

export default function CaseStudyCarousel({ studies }: CaseStudyCarouselProps) {
  const handleCardClick = (slug: string) => {
    // wired up in Task 17 (useExpandAndNavigate)
    console.log("clicked", slug);
  };

  return (
    <div
      className="relative"
      style={{
        // Viewport-edge breakout — overrides the parent column width
        marginLeft: "calc(-50vw + 50%)",
        marginRight: "calc(-50vw + 50%)",
        // Set CSS vars consumed by CarouselCardShell
        ["--carousel-card-w" as string]: `${CARD_W}px`,
        ["--carousel-card-h" as string]: `${CARD_H}px`,
      }}
    >
      <div
        className="flex justify-center"
        style={{ gap: `${GAP}px`, padding: "32px 0" }}
      >
        {studies.map((study, i) => {
          const Custom = CAROUSEL_CARDS[study.slug];
          const cardProps: CarouselCardProps = {
            study,
            isActive: i === 0,
            onClick: () => handleCardClick(study.slug),
          };
          return Custom ? (
            <Custom key={study.slug} {...cardProps} />
          ) : (
            <CarouselCardShell key={study.slug} {...cardProps} />
          );
        })}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Type-check**

Run: `cd "/Users/marcosevilla/Developer/portfolio 2026/site" && npx tsc --noEmit`
Expected: clean exit.

- [ ] **Step 3: Visual smoke check**

Start dev server if not running: `cd "/Users/marcosevilla/Developer/portfolio 2026/site" && npm run dev`
Open `http://localhost:3000`. Click the carousel toggle (3 vertical bars icon, third in the row). Expected:
- 7 cards render in a horizontal row, each showing its case study gradient (F&B orange, Compendium blue, Upsells teal, Check-in indigo, General Task slate, Design System purple, AI Workflow likely uses one of the gradients defined in MDX)
- Each card shows: year (small mono, top of bottom block), title (bold), company · role (smaller, below title) — all white text
- Cards extend past the bio column to the viewport edges (no narrow 640px constraint)
- First card has a subtle accent-colored inset focus ring

If something's wrong, fix before moving on.

- [ ] **Step 4: Commit**

```bash
cd "/Users/marcosevilla/Developer/portfolio 2026"
git add site/components/CaseStudyCarousel.tsx
git commit -m "$(cat <<'EOF'
Render carousel as static horizontal row via shell + registry

Replaces placeholder. All 7 studies render through CarouselCardShell
(falling back when registry has no entry, which is currently every
study). Viewport-edge breakout in place. No motion yet.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 4: Create FBOrderingCarouselCard

**Files:**
- Create: `site/components/case-study/carousel/FBOrderingCarouselCard.tsx`
- Modify: `site/components/case-study/carousel/carousel-card-registry.ts`

- [ ] **Step 1: Create the per-study file (gradient-only, no overlay yet — author drops imagery later)**

```tsx
"use client";

import CarouselCardShell from "./CarouselCardShell";
import type { CarouselCardProps } from "./carousel-card-registry";

export default function FBOrderingCarouselCard(props: CarouselCardProps) {
  return (
    <CarouselCardShell {...props}>
      {/* Author space: drop screenshots, illustrations, color overlays here.
          Shell auto-renders the gradient (from study.gradient) below this. */}
    </CarouselCardShell>
  );
}
```

- [ ] **Step 2: Register in the registry**

Edit `site/components/case-study/carousel/carousel-card-registry.ts`. Add the import and entry:

```ts
import type { ComponentType } from "react";
import type { CaseStudyMeta } from "@/lib/types";
import FBOrderingCarouselCard from "./FBOrderingCarouselCard";

export interface CarouselCardProps {
  study: CaseStudyMeta;
  isActive: boolean;
  onClick: () => void;
}

export const CAROUSEL_CARDS: Record<string, ComponentType<CarouselCardProps>> = {
  "fb-ordering": FBOrderingCarouselCard,
};
```

- [ ] **Step 3: Type-check**

Run: `cd "/Users/marcosevilla/Developer/portfolio 2026/site" && npx tsc --noEmit`
Expected: clean exit.

- [ ] **Step 4: Commit**

```bash
cd "/Users/marcosevilla/Developer/portfolio 2026"
git add site/components/case-study/carousel/FBOrderingCarouselCard.tsx site/components/case-study/carousel/carousel-card-registry.ts
git commit -m "$(cat <<'EOF'
Register FB Ordering carousel card

Gradient-only baseline. Imagery to be authored later.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 5: Create remaining 6 per-study cards in one batch

**Files (all create):**
- `site/components/case-study/carousel/CompendiumCarouselCard.tsx`
- `site/components/case-study/carousel/UpsellsCarouselCard.tsx`
- `site/components/case-study/carousel/CheckinCarouselCard.tsx`
- `site/components/case-study/carousel/GeneralTaskCarouselCard.tsx`
- `site/components/case-study/carousel/DesignSystemCarouselCard.tsx`
- `site/components/case-study/carousel/AIWorkflowCarouselCard.tsx`

All 6 files have identical body — they're scaffolds for later authoring.

- [ ] **Step 1: Create each file**

For each file path above, write this body, replacing `<NAME>` with the export name (CamelCase from the slug):

```tsx
"use client";

import CarouselCardShell from "./CarouselCardShell";
import type { CarouselCardProps } from "./carousel-card-registry";

export default function <NAME>(props: CarouselCardProps) {
  return (
    <CarouselCardShell {...props}>
      {/* Author space */}
    </CarouselCardShell>
  );
}
```

Naming map:
- `CompendiumCarouselCard.tsx` → `CompendiumCarouselCard`
- `UpsellsCarouselCard.tsx` → `UpsellsCarouselCard`
- `CheckinCarouselCard.tsx` → `CheckinCarouselCard`
- `GeneralTaskCarouselCard.tsx` → `GeneralTaskCarouselCard`
- `DesignSystemCarouselCard.tsx` → `DesignSystemCarouselCard`
- `AIWorkflowCarouselCard.tsx` → `AIWorkflowCarouselCard`

- [ ] **Step 2: Update the registry to include all 7**

Edit `site/components/case-study/carousel/carousel-card-registry.ts`:

```ts
import type { ComponentType } from "react";
import type { CaseStudyMeta } from "@/lib/types";
import FBOrderingCarouselCard from "./FBOrderingCarouselCard";
import CompendiumCarouselCard from "./CompendiumCarouselCard";
import UpsellsCarouselCard from "./UpsellsCarouselCard";
import CheckinCarouselCard from "./CheckinCarouselCard";
import GeneralTaskCarouselCard from "./GeneralTaskCarouselCard";
import DesignSystemCarouselCard from "./DesignSystemCarouselCard";
import AIWorkflowCarouselCard from "./AIWorkflowCarouselCard";

export interface CarouselCardProps {
  study: CaseStudyMeta;
  isActive: boolean;
  onClick: () => void;
}

export const CAROUSEL_CARDS: Record<string, ComponentType<CarouselCardProps>> = {
  "fb-ordering": FBOrderingCarouselCard,
  "compendium": CompendiumCarouselCard,
  "upsells": UpsellsCarouselCard,
  "checkin": CheckinCarouselCard,
  "general-task": GeneralTaskCarouselCard,
  "design-system": DesignSystemCarouselCard,
  "ai-workflow": AIWorkflowCarouselCard,
};
```

- [ ] **Step 3: Type-check**

Run: `cd "/Users/marcosevilla/Developer/portfolio 2026/site" && npx tsc --noEmit`
Expected: clean exit.

- [ ] **Step 4: Commit**

```bash
cd "/Users/marcosevilla/Developer/portfolio 2026"
git add site/components/case-study/carousel/
git commit -m "$(cat <<'EOF'
Register remaining 6 carousel cards

All 7 case studies now route through their own per-study file with the
shell baseline. Per-study illustration/imagery overlays to be authored
incrementally.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 6: Add absolute-positioned track + per-card x motion values

This is the first motion-bearing rewrite of `CaseStudyCarousel.tsx`. Cards become `position: absolute, left: 50%, top: 50%`, translated by per-card `x` motion values derived from a single `offsetX`. Still no drag — we'll seed `offsetX = 0` so card 0 sits centered.

**Files:**
- Modify: `site/components/CaseStudyCarousel.tsx`

- [ ] **Step 1: Rewrite the carousel with motion track**

```tsx
"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useMotionValue, useTransform, useMotionValueEvent } from "framer-motion";
import { CAROUSEL_CARDS, type CarouselCardProps } from "./case-study/carousel/carousel-card-registry";
import CarouselCardShell from "./case-study/carousel/CarouselCardShell";
import type { CaseStudyMeta } from "@/lib/types";

interface CaseStudyCarouselProps {
  studies: CaseStudyMeta[];
}

const CARD_W = 320;
const CARD_H = 420;
const GAP = 24;
const SPREAD = CARD_W + GAP; // 344

export default function CaseStudyCarousel({ studies }: CaseStudyCarouselProps) {
  const offsetX = useMotionValue(0);
  const [activeIndex, setActiveIndex] = useState(0);

  useMotionValueEvent(offsetX, "change", (v) => {
    const idx = Math.max(0, Math.min(studies.length - 1, Math.round(-v / SPREAD)));
    if (idx !== activeIndex) setActiveIndex(idx);
  });

  const handleCardClick = (slug: string) => {
    console.log("clicked", slug); // wired in Task 17
  };

  return (
    <div
      className="relative"
      style={{
        marginLeft: "calc(-50vw + 50%)",
        marginRight: "calc(-50vw + 50%)",
        height: `${CARD_H + 64}px`,
        ["--carousel-card-w" as string]: `${CARD_W}px`,
        ["--carousel-card-h" as string]: `${CARD_H}px`,
      }}
    >
      <div className="absolute inset-0">
        {studies.map((study, i) => {
          const x = useTransform(offsetX, (v) => v + i * SPREAD);
          const Custom = CAROUSEL_CARDS[study.slug];
          const cardProps: CarouselCardProps = {
            study,
            isActive: i === activeIndex,
            onClick: () => handleCardClick(study.slug),
          };
          const Card = Custom ?? CarouselCardShell;

          return (
            <motion.div
              key={study.slug}
              className="absolute"
              style={{
                left: "50%",
                top: "50%",
                x,
                translateX: `-${CARD_W / 2}px`,
                translateY: `-${CARD_H / 2}px`,
              }}
            >
              <Card {...cardProps} />
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
```

**Note:** `useTransform` inside `.map` triggers a React hooks-rules warning if the array length changes. Studies length is stable (7) and only changes on filter, at which point the entire carousel remounts (existing `AnimatePresence` keys by `filterKey` in `CaseStudyList`). Safe in practice. If lint complains, suppress with `// eslint-disable-next-line react-hooks/rules-of-hooks` on the `useTransform` line.

- [ ] **Step 2: Type-check**

Run: `cd "/Users/marcosevilla/Developer/portfolio 2026/site" && npx tsc --noEmit`
Expected: clean exit.

- [ ] **Step 3: Visual smoke check**

Open `http://localhost:3000`, toggle to carousel. Expected:
- Card 0 (F&B) is centered horizontally
- Cards 1–6 fan out to the right, off-center
- Cards extend off the right edge of the viewport (only the first 2-3 visible)
- No interaction yet (clicking still console.logs)

- [ ] **Step 4: Commit**

```bash
cd "/Users/marcosevilla/Developer/portfolio 2026"
git add site/components/CaseStudyCarousel.tsx
git commit -m "$(cat <<'EOF'
Convert carousel track to absolute-positioned motion layout

Single offsetX motion value drives per-card x via useTransform. Active
index tracked via useMotionValueEvent. Card 0 sits centered; cards
1-6 trail off to the right. Drag mechanics in next task.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 7: Add drag handlers with snap-to-nearest

Adds `onPanStart`, `onPan`, `onPanEnd` with rubber-band edges and velocity-projected snap. After this task you should be able to drag the carousel.

**Files:**
- Modify: `site/components/CaseStudyCarousel.tsx`

- [ ] **Step 1: Add the drag handlers**

Replace the entire `CaseStudyCarousel` component with:

```tsx
"use client";

import { useRef, useState } from "react";
import { motion, useMotionValue, useTransform, useMotionValueEvent, animate, type PanInfo, type AnimationPlaybackControls } from "framer-motion";
import { CAROUSEL_CARDS, type CarouselCardProps } from "./case-study/carousel/carousel-card-registry";
import CarouselCardShell from "./case-study/carousel/CarouselCardShell";
import type { CaseStudyMeta } from "@/lib/types";

interface CaseStudyCarouselProps {
  studies: CaseStudyMeta[];
}

const CARD_W = 320;
const CARD_H = 420;
const GAP = 24;
const SPREAD = CARD_W + GAP;
const RUBBER_BAND = 0.15;
const VELOCITY_FACTOR = 0.3;
const SETTLE_SPRING = { type: "spring" as const, stiffness: 180, damping: 18, mass: 1 };

export default function CaseStudyCarousel({ studies }: CaseStudyCarouselProps) {
  const offsetX = useMotionValue(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const animRef = useRef<AnimationPlaybackControls | null>(null);
  const panStartOffsetRef = useRef(0);

  const minOffset = -(studies.length - 1) * SPREAD;
  const maxOffset = 0;

  useMotionValueEvent(offsetX, "change", (v) => {
    const idx = Math.max(0, Math.min(studies.length - 1, Math.round(-v / SPREAD)));
    if (idx !== activeIndex) setActiveIndex(idx);
  });

  const settleTo = (index: number) => {
    const clamped = Math.max(0, Math.min(studies.length - 1, index));
    animRef.current?.stop();
    animRef.current = animate(offsetX, -clamped * SPREAD, SETTLE_SPRING);
  };

  const onPanStart = () => {
    animRef.current?.stop();
    panStartOffsetRef.current = offsetX.get();
  };

  const onPan = (_e: PointerEvent, info: PanInfo) => {
    let raw = panStartOffsetRef.current + info.offset.x;
    if (raw > maxOffset) {
      const overshoot = raw - maxOffset;
      raw = maxOffset + overshoot * RUBBER_BAND;
    } else if (raw < minOffset) {
      const overshoot = raw - minOffset;
      raw = minOffset + overshoot * RUBBER_BAND;
    }
    offsetX.set(raw);
  };

  const onPanEnd = (_e: PointerEvent, info: PanInfo) => {
    const projected = offsetX.get() + info.velocity.x * VELOCITY_FACTOR;
    const clamped = Math.max(minOffset, Math.min(maxOffset, projected));
    const snapIndex = Math.round(-clamped / SPREAD);
    settleTo(snapIndex);
  };

  const handleCardClick = (slug: string) => {
    console.log("clicked", slug);
  };

  return (
    <div
      className="relative"
      style={{
        marginLeft: "calc(-50vw + 50%)",
        marginRight: "calc(-50vw + 50%)",
        height: `${CARD_H + 64}px`,
        ["--carousel-card-w" as string]: `${CARD_W}px`,
        ["--carousel-card-h" as string]: `${CARD_H}px`,
      }}
    >
      <motion.div
        className="absolute inset-0"
        style={{ touchAction: "pan-y" }}
        onPanStart={onPanStart}
        onPan={onPan}
        onPanEnd={onPanEnd}
      >
        {studies.map((study, i) => {
          const x = useTransform(offsetX, (v) => v + i * SPREAD);
          const Custom = CAROUSEL_CARDS[study.slug];
          const cardProps: CarouselCardProps = {
            study,
            isActive: i === activeIndex,
            onClick: () => handleCardClick(study.slug),
          };
          const Card = Custom ?? CarouselCardShell;

          return (
            <motion.div
              key={study.slug}
              className="absolute"
              style={{
                left: "50%",
                top: "50%",
                x,
                translateX: `-${CARD_W / 2}px`,
                translateY: `-${CARD_H / 2}px`,
              }}
            >
              <Card {...cardProps} />
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
```

**Notes:**
- `touchAction: "pan-y"` on the pan target lets vertical page scroll continue to work on touch devices.
- The pan handlers go on a wrapper div, not individual cards, so the whole track moves as one.

- [ ] **Step 2: Type-check**

Run: `cd "/Users/marcosevilla/Developer/portfolio 2026/site" && npx tsc --noEmit`
Expected: clean exit.

- [ ] **Step 3: Visual smoke check**

In the browser:
- Drag the carousel left → cards move left, snap to a nearest card on release
- Drag right past card 0 → rubber-band resistance, snaps back to 0
- Quick flick left → multiple cards skipped (velocity projection)
- Drag past card 6 → rubber-band resistance, snaps back to 6

- [ ] **Step 4: Commit**

```bash
cd "/Users/marcosevilla/Developer/portfolio 2026"
git add site/components/CaseStudyCarousel.tsx
git commit -m "$(cat <<'EOF'
Add drag-to-scroll with rubber-band edges and velocity-projected snap

Pan handlers translate the whole track via offsetX. Edge overshoot
multiplied by 0.15. Snap target = currentOffset + velocity * 0.3,
clamped, rounded. Settle spring 180/18/1 per spec.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 8: Add scale + opacity transforms for active state

Each card derives scale (1.0 active, 0.92 neighbors, 0.85 far) and opacity (1.0 / 0.7 / 0.4) from its own `x` motion value. The active card is whichever is closest to viewport center.

**Files:**
- Modify: `site/components/CaseStudyCarousel.tsx`

- [ ] **Step 1: Add scale + opacity transforms inside the map**

In the `studies.map((study, i) =>` block, replace the existing `useTransform(offsetX, (v) => v + i * SPREAD)` line and the returned `motion.div` with:

```tsx
const x = useTransform(offsetX, (v) => v + i * SPREAD);
const scale = useTransform(x, [-SPREAD * 2, -SPREAD, 0, SPREAD, SPREAD * 2], [0.85, 0.92, 1.0, 0.92, 0.85]);
const opacity = useTransform(x, [-SPREAD * 2, -SPREAD, 0, SPREAD, SPREAD * 2], [0.4, 0.7, 1.0, 0.7, 0.4]);
const Custom = CAROUSEL_CARDS[study.slug];
const cardProps: CarouselCardProps = {
  study,
  isActive: i === activeIndex,
  onClick: () => handleCardClick(study.slug),
};
const Card = Custom ?? CarouselCardShell;

return (
  <motion.div
    key={study.slug}
    className="absolute"
    style={{
      left: "50%",
      top: "50%",
      x,
      scale,
      opacity,
      translateX: `-${CARD_W / 2}px`,
      translateY: `-${CARD_H / 2}px`,
      zIndex: i === activeIndex ? 10 : 5 - Math.abs(i - activeIndex),
    }}
  >
    <Card {...cardProps} />
  </motion.div>
);
```

- [ ] **Step 2: Type-check**

Run: `cd "/Users/marcosevilla/Developer/portfolio 2026/site" && npx tsc --noEmit`
Expected: clean exit.

- [ ] **Step 3: Visual smoke check**

- Active (centered) card is full size, full opacity
- Adjacent cards are slightly smaller and faded
- Far cards are smaller still and more faded
- Active card sits above neighbors (z-index)
- As you drag, scale/opacity updates smoothly with the drag motion (not just on snap)

- [ ] **Step 4: Commit**

```bash
cd "/Users/marcosevilla/Developer/portfolio 2026"
git add site/components/CaseStudyCarousel.tsx
git commit -m "$(cat <<'EOF'
Add scale + opacity transforms for active card focal hierarchy

Active 1.0/1.0, neighbors 0.92/0.7, far 0.85/0.4. Driven from each
card's local x motion value so values update during drag, not just
on snap. zIndex layers active card above neighbors.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 9: Add drag-velocity-derived tilt

Tilt is uniform across all cards, derived from `useVelocity(offsetX)`. Naturally settles to 0° when the user releases the drag.

**Files:**
- Modify: `site/components/CaseStudyCarousel.tsx`

- [ ] **Step 1: Add velocity + clamp + tilt transform**

Add `useVelocity` to the framer-motion import:

```ts
import { motion, useMotionValue, useTransform, useMotionValueEvent, useVelocity, animate, type PanInfo, type AnimationPlaybackControls } from "framer-motion";
```

Inside the component body, after the `useMotionValue` line, add:

```ts
const velocity = useVelocity(offsetX);
const rotate = useTransform(velocity, [-1500, 0, 1500], [3, 0, -3], { clamp: true });
```

Then in the per-card `motion.div` style block, add `rotate` to the style object:

```tsx
style={{
  left: "50%",
  top: "50%",
  x,
  scale,
  opacity,
  rotate,
  translateX: `-${CARD_W / 2}px`,
  translateY: `-${CARD_H / 2}px`,
  zIndex: i === activeIndex ? 10 : 5 - Math.abs(i - activeIndex),
}}
```

- [ ] **Step 2: Type-check**

Run: `cd "/Users/marcosevilla/Developer/portfolio 2026/site" && npx tsc --noEmit`
Expected: clean exit.

- [ ] **Step 3: Visual smoke check**

- Drag quickly left or right → cards tilt slightly in the opposite direction (tilt-back-against-motion feel)
- Release drag → cards return to upright as velocity drops
- Slow, careful drags → barely any tilt
- Tilt is uniform: all cards rotate the same amount

- [ ] **Step 4: Commit**

```bash
cd "/Users/marcosevilla/Developer/portfolio 2026"
git add site/components/CaseStudyCarousel.tsx
git commit -m "$(cat <<'EOF'
Add subtle drag-velocity tilt to carousel cards

Uniform rotation derived from useVelocity(offsetX), clamped to ±3°.
Cards tilt against drag direction during motion, settle to 0° when
released. No tilt at rest.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 10: Add tap-vs-drag guard

Without this, mouse-down → small drift → mouse-up triggers both the pan and the click. Goal: clicks fire only when the user wasn't dragging.

**Files:**
- Modify: `site/components/CaseStudyCarousel.tsx`

- [ ] **Step 1: Add isDraggingRef and gate clicks**

Inside the component, add a ref:

```ts
const isDraggingRef = useRef(false);
```

Modify `onPanStart` to set the ref:

```ts
const onPanStart = () => {
  animRef.current?.stop();
  panStartOffsetRef.current = offsetX.get();
  isDraggingRef.current = true;
};
```

Modify `onPanEnd` to clear after a 50ms delay:

```ts
const onPanEnd = (_e: PointerEvent, info: PanInfo) => {
  const projected = offsetX.get() + info.velocity.x * VELOCITY_FACTOR;
  const clamped = Math.max(minOffset, Math.min(maxOffset, projected));
  const snapIndex = Math.round(-clamped / SPREAD);
  settleTo(snapIndex);
  setTimeout(() => { isDraggingRef.current = false; }, 50);
};
```

Modify `handleCardClick` to early-return if dragging:

```ts
const handleCardClick = (slug: string) => {
  if (isDraggingRef.current) return;
  console.log("clicked", slug);
};
```

- [ ] **Step 2: Type-check**

Run: `cd "/Users/marcosevilla/Developer/portfolio 2026/site" && npx tsc --noEmit`
Expected: clean exit.

- [ ] **Step 3: Visual smoke check**

- Click a card without dragging → console logs the slug
- Drag a card → no console log on release
- Drag a tiny amount (1-2 pixels), release → no console log (drag flag was set)

- [ ] **Step 4: Commit**

```bash
cd "/Users/marcosevilla/Developer/portfolio 2026"
git add site/components/CaseStudyCarousel.tsx
git commit -m "$(cat <<'EOF'
Add tap-vs-drag guard to prevent accidental clicks during pan

isDraggingRef set on panStart, cleared 50ms after panEnd. Card click
handler early-returns when ref is true. Mirrors aman-gift's pattern.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 11: Add sessionStorage persistence for active card

Restores the user's last-active card on remount (e.g., browser back from a case study page).

**Files:**
- Modify: `site/components/CaseStudyCarousel.tsx`

- [ ] **Step 1: Add useEffect for read on mount, write on change**

Add `useEffect` to React imports:

```ts
import { useRef, useState, useEffect } from "react";
```

Inside the component, after the existing state declarations, add:

```ts
const STORAGE_KEY = "carousel-active-index";

// Restore on mount
useEffect(() => {
  try {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (!saved) return;
    const idx = parseInt(saved, 10);
    if (!Number.isFinite(idx) || idx < 0 || idx >= studies.length) return;
    offsetX.set(-idx * SPREAD);
    setActiveIndex(idx);
  } catch {}
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);

// Persist on change
useEffect(() => {
  try {
    sessionStorage.setItem(STORAGE_KEY, String(activeIndex));
  } catch {}
}, [activeIndex]);
```

- [ ] **Step 2: Type-check**

Run: `cd "/Users/marcosevilla/Developer/portfolio 2026/site" && npx tsc --noEmit`
Expected: clean exit.

- [ ] **Step 3: Visual smoke check**

- Drag to card 3
- Refresh the page (`Cmd+R`)
- Toggle to carousel → card 3 is active (the carousel started at the saved position)
- Toggle to cards/list, then back to carousel → still card 3 (sessionStorage holds across view toggles within the same tab)

- [ ] **Step 4: Commit**

```bash
cd "/Users/marcosevilla/Developer/portfolio 2026"
git add site/components/CaseStudyCarousel.tsx
git commit -m "$(cat <<'EOF'
Persist active carousel index in sessionStorage

Restores on mount, writes on every active-index change. Out-of-range
saved values are ignored (filter changes can shrink the study list).

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 12: Add keyboard navigation (arrows, Enter, Space)

**Files:**
- Modify: `site/components/CaseStudyCarousel.tsx`

- [ ] **Step 1: Add window keydown listener**

Inside the component, after the persistence effects, add:

```ts
useEffect(() => {
  const handleKey = (e: KeyboardEvent) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      settleTo(activeIndex - 1);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      settleTo(activeIndex + 1);
    }
  };
  window.addEventListener("keydown", handleKey);
  return () => window.removeEventListener("keydown", handleKey);
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [activeIndex]);
```

The shell already uses `<button>` so Enter/Space on a focused card naturally fires `onClick`. No extra code needed for those.

**Note:** The listener is window-level. The carousel is only mounted when `viewMode === "carousel"` (CaseStudyList unmounts the other view branches), so arrow keys won't accidentally hijack the page when other views are active.

- [ ] **Step 2: Type-check**

Run: `cd "/Users/marcosevilla/Developer/portfolio 2026/site" && npx tsc --noEmit`
Expected: clean exit.

- [ ] **Step 3: Visual smoke check**

- Toggle to carousel
- Press ArrowRight → cards advance to next
- Press ArrowLeft → cards retreat
- Press ArrowLeft at index 0 → no movement (clamped)
- Press ArrowRight at last card → no movement (clamped)
- Tab through the page until a carousel card is focused (you'll see the focus ring)
- Press Enter or Space on a focused card → console logs the slug

- [ ] **Step 4: Commit**

```bash
cd "/Users/marcosevilla/Developer/portfolio 2026"
git add site/components/CaseStudyCarousel.tsx
git commit -m "$(cat <<'EOF'
Add keyboard navigation to carousel (arrow keys cycle active card)

ArrowLeft/Right call settleTo(±1). Enter/Space on focused cards work
natively via the shell's button element. preventDefault on arrows
stops page scroll.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 13: Add ARIA roles and screen reader live region

**Files:**
- Modify: `site/components/CaseStudyCarousel.tsx`

- [ ] **Step 1: Wrap the carousel in a region with ARIA + add live region**

In the outermost `<div>` of the component, add ARIA attributes:

```tsx
<div
  role="region"
  aria-roledescription="carousel"
  aria-label="Case studies carousel"
  className="relative"
  style={{
    marginLeft: "calc(-50vw + 50%)",
    marginRight: "calc(-50vw + 50%)",
    height: `${CARD_H + 64}px`,
    ["--carousel-card-w" as string]: `${CARD_W}px`,
    ["--carousel-card-h" as string]: `${CARD_H}px`,
  }}
>
```

Inside the same outer div but before the existing `<motion.div>`, add the live region:

```tsx
<div role="status" aria-live="polite" className="sr-only">
  {studies[activeIndex]?.title}, card {activeIndex + 1} of {studies.length}
</div>
```

- [ ] **Step 2: Type-check**

Run: `cd "/Users/marcosevilla/Developer/portfolio 2026/site" && npx tsc --noEmit`
Expected: clean exit.

- [ ] **Step 3: Verify with VoiceOver (optional but recommended)**

- Enable VoiceOver (`Cmd+F5`)
- Navigate to the carousel
- Press right arrow → VoiceOver should announce the new card's title and position
- Disable VoiceOver

- [ ] **Step 4: Commit**

```bash
cd "/Users/marcosevilla/Developer/portfolio 2026"
git add site/components/CaseStudyCarousel.tsx
git commit -m "$(cat <<'EOF'
Add ARIA roles and live region to carousel

role=region + aria-roledescription=carousel + aria-label on container.
Polite live region announces active card title and position on snap.
Each card already uses native button + aria-current via the shell.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 14: Add reduced-motion fallback (CSS scroll snap)

**Files:**
- Modify: `site/components/CaseStudyCarousel.tsx`

- [ ] **Step 1: Detect prefers-reduced-motion and branch the render**

Add `useReducedMotion` to imports:

```ts
import { motion, useMotionValue, useTransform, useMotionValueEvent, useVelocity, useReducedMotion, animate, type PanInfo, type AnimationPlaybackControls } from "framer-motion";
```

Inside the component, near the top, add:

```ts
const reducedMotion = useReducedMotion();
```

Add this branch above the existing `return (...)`:

```tsx
if (reducedMotion) {
  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label="Case studies carousel"
      className="relative"
      style={{
        marginLeft: "calc(-50vw + 50%)",
        marginRight: "calc(-50vw + 50%)",
        ["--carousel-card-w" as string]: `${CARD_W}px`,
        ["--carousel-card-h" as string]: `${CARD_H}px`,
      }}
    >
      <div role="status" aria-live="polite" className="sr-only">
        {studies[activeIndex]?.title}, card {activeIndex + 1} of {studies.length}
      </div>
      <div
        className="flex overflow-x-auto"
        style={{
          gap: `${GAP}px`,
          padding: "32px 16px",
          scrollSnapType: "x mandatory",
          overscrollBehaviorX: "contain",
        }}
      >
        {studies.map((study) => {
          const Custom = CAROUSEL_CARDS[study.slug];
          const Card = Custom ?? CarouselCardShell;
          const cardProps: CarouselCardProps = {
            study,
            isActive: false, // no active state in reduced mode
            onClick: () => handleCardClick(study.slug),
          };
          return (
            <div key={study.slug} style={{ scrollSnapAlign: "center", flex: "0 0 auto" }}>
              <Card {...cardProps} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Type-check**

Run: `cd "/Users/marcosevilla/Developer/portfolio 2026/site" && npx tsc --noEmit`
Expected: clean exit.

- [ ] **Step 3: Visual smoke check**

- Open DevTools → Rendering tab → "Emulate CSS media feature prefers-reduced-motion" → "reduce"
- Toggle to carousel
- Cards render in a horizontal scroll container with native CSS snap
- Drag scrolls naturally (no Framer drag, no spring)
- Click navigates instantly (still console.logs for now — wired in next phase)
- Disable the emulation; verify the regular drag behavior is back

- [ ] **Step 4: Commit**

```bash
cd "/Users/marcosevilla/Developer/portfolio 2026"
git add site/components/CaseStudyCarousel.tsx
git commit -m "$(cat <<'EOF'
Add prefers-reduced-motion fallback using native CSS scroll snap

When user prefers reduced motion: no Framer drag, no scale/opacity/tilt
transforms, no spring snap. Plain horizontal overflow scroll with
scroll-snap-type: x mandatory. ARIA + live region preserved.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 15: Add mobile sizing breakpoint (260×340 below lg)

**Files:**
- Modify: `site/components/CaseStudyCarousel.tsx`

- [ ] **Step 1: Detect viewport and swap dimensions**

Replace the constants near the top of the file with:

```ts
const CARD_W_DESKTOP = 320;
const CARD_H_DESKTOP = 420;
const CARD_W_MOBILE = 260;
const CARD_H_MOBILE = 340;
const GAP = 24;
```

Inside the component, before the constants are used in motion values, add a viewport detector:

```ts
const [isMobile, setIsMobile] = useState(false);

useEffect(() => {
  const mq = window.matchMedia("(max-width: 1023px)");
  const update = () => setIsMobile(mq.matches);
  update();
  mq.addEventListener("change", update);
  return () => mq.removeEventListener("change", update);
}, []);

const CARD_W = isMobile ? CARD_W_MOBILE : CARD_W_DESKTOP;
const CARD_H = isMobile ? CARD_H_MOBILE : CARD_H_DESKTOP;
const SPREAD = CARD_W + GAP;
```

The rest of the component continues to reference `CARD_W`, `CARD_H`, `SPREAD` so no other changes are needed — but verify the references are still in scope (some are inside `useTransform` callbacks; capture them in closure).

**Important:** because `SPREAD` is now derived from state, `useTransform(offsetX, (v) => v + i * SPREAD)` recreates on every viewport change. That's fine — the transform reruns when its source updates and the carousel rerenders on the breakpoint flip.

- [ ] **Step 2: Type-check**

Run: `cd "/Users/marcosevilla/Developer/portfolio 2026/site" && npx tsc --noEmit`
Expected: clean exit.

- [ ] **Step 3: Visual smoke check**

- Open `http://localhost:3000` in DevTools mobile mode (e.g. iPhone 14)
- Toggle to carousel
- Cards are 260×340 (smaller than desktop)
- Drag works on touch (hold and swipe)
- Resize back to desktop → cards grow to 320×420 without breaking layout

- [ ] **Step 4: Commit**

```bash
cd "/Users/marcosevilla/Developer/portfolio 2026"
git add site/components/CaseStudyCarousel.tsx
git commit -m "$(cat <<'EOF'
Add mobile sizing breakpoint for carousel cards

Cards are 260×340 below lg (1024px), 320×420 above. matchMedia listener
keeps it reactive to viewport changes. SPREAD derives from state so
all per-card transforms update on the breakpoint flip.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 16: Build useExpandAndNavigate hook

**Files:**
- Create: `site/lib/carousel-transition.ts`

- [ ] **Step 1: Create the hook**

```ts
"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { useReducedMotion } from "framer-motion";

/**
 * Manages the click → expand → navigate sequence for a carousel card.
 *
 * Phase 1 implementation: scale-up-then-cut.
 * - On trigger, sets expandingSlug → caller animates the card to fullscreen.
 * - 300ms later, calls router.push to the case study route.
 * - When user returns (browser back), expandingSlug naturally resets on remount.
 *
 * Reduced motion: skips the morph entirely, navigates immediately.
 */
export function useExpandAndNavigate() {
  const router = useRouter();
  const [expandingSlug, setExpandingSlug] = useState<string | null>(null);
  const reducedMotion = useReducedMotion();

  const trigger = useCallback(
    (slug: string) => {
      if (expandingSlug) return; // ignore during in-flight expand
      if (reducedMotion) {
        router.push(`/work/${slug}`);
        return;
      }
      setExpandingSlug(slug);
      setTimeout(() => {
        router.push(`/work/${slug}`);
      }, 300);
    },
    [expandingSlug, reducedMotion, router]
  );

  return { expandingSlug, trigger };
}
```

- [ ] **Step 2: Type-check**

Run: `cd "/Users/marcosevilla/Developer/portfolio 2026/site" && npx tsc --noEmit`
Expected: clean exit.

- [ ] **Step 3: Commit**

```bash
cd "/Users/marcosevilla/Developer/portfolio 2026"
git add site/lib/carousel-transition.ts
git commit -m "$(cat <<'EOF'
Add useExpandAndNavigate hook for carousel route transitions

Phase 1: scale-up-then-cut. Hook returns expandingSlug + trigger.
Carousel uses expandingSlug to apply the morph; setTimeout fires
router.push at t=300ms. Reduced motion skips the morph entirely.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 17: Wire trigger into the carousel and apply expand morph to active card

This is the visible payoff: clicking a card morphs it to fullscreen, then navigates.

**Files:**
- Modify: `site/components/CaseStudyCarousel.tsx`

- [ ] **Step 1: Replace the click handler and add per-card morph styling**

Add the import:

```ts
import { useExpandAndNavigate } from "@/lib/carousel-transition";
```

Inside the component, replace the `handleCardClick` definition and add the hook:

```ts
const { expandingSlug, trigger } = useExpandAndNavigate();

const handleCardClick = (slug: string) => {
  if (isDraggingRef.current) return;
  trigger(slug);
};
```

In the per-card render block (the `motion.div` wrapping each card), add a conditional fullscreen morph. Replace the existing `motion.div` return with:

```tsx
const isExpanding = expandingSlug === study.slug;

return (
  <motion.div
    key={study.slug}
    className="absolute"
    animate={
      isExpanding
        ? {
            x: 0,
            scale: 1,
            opacity: 1,
            rotate: 0,
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            translateX: "0%",
            translateY: "0%",
            zIndex: 100,
          }
        : undefined
    }
    transition={isExpanding ? { duration: 0.28, ease: [0.32, 0.72, 0, 1] } : undefined}
    style={
      isExpanding
        ? { position: "fixed" as const }
        : {
            left: "50%",
            top: "50%",
            x,
            scale,
            opacity,
            rotate,
            translateX: `-${CARD_W / 2}px`,
            translateY: `-${CARD_H / 2}px`,
            zIndex: i === activeIndex ? 10 : 5 - Math.abs(i - activeIndex),
          }
    }
  >
    <Card {...cardProps} />
  </motion.div>
);
```

- [ ] **Step 2: Type-check**

Run: `cd "/Users/marcosevilla/Developer/portfolio 2026/site" && npx tsc --noEmit`
Expected: clean exit.

- [ ] **Step 3: Visual smoke check**

- Click a card → it grows to fill the viewport over ~280ms, showing only the gradient (typography is still visible at this stage; we'll fade it in next task)
- At ~300ms, the case study page loads
- The case study hero's gradient matches the morph color → seam is mostly invisible
- Browser back → carousel returns with the same card active

- [ ] **Step 4: Commit**

```bash
cd "/Users/marcosevilla/Developer/portfolio 2026"
git add site/components/CaseStudyCarousel.tsx
git commit -m "$(cat <<'EOF'
Wire carousel card click to expand-and-navigate

Active card morphs from its carousel rect to fixed fullscreen via
explicit width/height animation (avoids Framer layout-prop edge cases
across position changes). 300ms later, router.push fires to the case
study route, where the matching gradient hero hides the seam.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 18: Crossfade scrim + typography during expand

When the card morphs to fullscreen, the typography and scrim should fade out so the expanded state is just the pure gradient (matching the destination hero).

**Files:**
- Modify: `site/components/case-study/carousel/CarouselCardShell.tsx`

- [ ] **Step 1: Accept an `isExpanding` prop and fade scrim + typography**

Update the shell's props:

```tsx
interface CarouselCardShellProps {
  study: CaseStudyMeta;
  children?: ReactNode;
  isActive: boolean;
  onClick: () => void;
  hideGradient?: boolean;
  isExpanding?: boolean;
}
```

Add `isExpanding = false` to the destructure:

```tsx
export default function CarouselCardShell({
  study,
  children,
  isActive,
  onClick,
  hideGradient = false,
  isExpanding = false,
}: CarouselCardShellProps) {
```

Wrap the scrim div in a transition style:

```tsx
<div
  aria-hidden
  className="absolute inset-x-0 bottom-0"
  style={{
    height: "55%",
    background:
      "linear-gradient(to top, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.25) 50%, transparent 100%)",
    opacity: isExpanding ? 0 : 1,
    transition: "opacity 150ms ease-out",
  }}
/>
```

Wrap the typography block similarly:

```tsx
<div
  className="absolute bottom-0 left-0 right-0"
  style={{
    padding: "20px",
    opacity: isExpanding ? 0 : 1,
    transition: "opacity 150ms ease-out",
  }}
>
  {/* ... existing year/title/meta children ... */}
</div>
```

- [ ] **Step 2: Update the registry props type to include `isExpanding`**

Edit `site/components/case-study/carousel/carousel-card-registry.ts`:

```ts
export interface CarouselCardProps {
  study: CaseStudyMeta;
  isActive: boolean;
  onClick: () => void;
  isExpanding?: boolean;
}
```

- [ ] **Step 3: Pass `isExpanding` from carousel to each card**

In `CaseStudyCarousel.tsx`, update the per-card props to include `isExpanding`:

```ts
const isExpanding = expandingSlug === study.slug;
const cardProps: CarouselCardProps = {
  study,
  isActive: i === activeIndex,
  onClick: () => handleCardClick(study.slug),
  isExpanding,
};
```

The shell uses it directly; per-study cards inherit via `{...props}` spread.

- [ ] **Step 4: Type-check**

Run: `cd "/Users/marcosevilla/Developer/portfolio 2026/site" && npx tsc --noEmit`
Expected: clean exit.

- [ ] **Step 5: Visual smoke check**

- Click a card → as it morphs to fullscreen, the year/title/company text and the scrim fade out by 150ms, leaving the pure gradient
- The route fires at 300ms — by then the card is fully gradient, matching the destination hero
- The seam is now invisible (or close to it)

- [ ] **Step 6: Commit**

```bash
cd "/Users/marcosevilla/Developer/portfolio 2026"
git add site/components/case-study/carousel/CarouselCardShell.tsx site/components/case-study/carousel/carousel-card-registry.ts site/components/CaseStudyCarousel.tsx
git commit -m "$(cat <<'EOF'
Fade out scrim and typography during expand morph

Shell accepts isExpanding prop; scrim and typography opacity-fade to 0
over 150ms when true. By t=300ms the card is pure gradient, matching
the destination case study hero so the route swap is invisible.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 19: Blur + dim other cards during expand

While the active card morphs, the rest of the carousel blurs and dims (aman-gift's pattern).

**Files:**
- Modify: `site/components/CaseStudyCarousel.tsx`

- [ ] **Step 1: Add a wrapping motion.div with filter animation**

Wrap the existing pan target `<motion.div>` in another `<motion.div>` that animates `filter` and `opacity` based on `expandingSlug`. The structure becomes:

```tsx
<motion.div
  animate={{
    filter: expandingSlug ? "blur(6px)" : "blur(0px)",
    opacity: expandingSlug ? 0.4 : 1,
  }}
  transition={{ duration: 0.3 }}
  className="absolute inset-0"
>
  <motion.div
    className="absolute inset-0"
    style={{ touchAction: "pan-y" }}
    onPanStart={onPanStart}
    onPan={onPan}
    onPanEnd={onPanEnd}
  >
    {/* existing studies.map(...) here */}
  </motion.div>
</motion.div>
```

**Important:** the morphing card itself should NOT be blurred. Because the morphing card is `position: fixed` (set in Task 17), it escapes the wrapper's transform and filter contexts. Verify this: when the card is fixed, it lives outside the blur wrapper's stacking context.

If the fixed card *is* getting blurred (filter inheritance through z-index 100), the fix is to render the expanding card via a portal. We'll address that in Task 20 if needed.

- [ ] **Step 2: Type-check**

Run: `cd "/Users/marcosevilla/Developer/portfolio 2026/site" && npx tsc --noEmit`
Expected: clean exit.

- [ ] **Step 3: Visual smoke check**

- Click a card → during expand, the *other* cards blur and fade
- The morphing card itself is sharp and full-opacity
- After the route fires, the new page is clean (no lingering blur)

If the morphing card is also blurred or dimmed, that's the portal issue — go to Task 20. Otherwise, skip Task 20 entirely.

- [ ] **Step 4: Commit**

```bash
cd "/Users/marcosevilla/Developer/portfolio 2026"
git add site/components/CaseStudyCarousel.tsx
git commit -m "$(cat <<'EOF'
Blur and dim other carousel cards during expand

Wrapping motion.div animates filter and opacity based on expandingSlug.
The morphing card escapes the blur via position: fixed (z-index 100).

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 20: (Conditional) Portal the expanding card to escape filter inheritance

Skip this task if Task 19's smoke check confirmed the morphing card is *not* affected by the parent's `filter: blur(...)`. Some browsers do apply filter to fixed-position children if they're inside the filtered ancestor's DOM subtree.

**Files:**
- Modify: `site/components/CaseStudyCarousel.tsx`

- [ ] **Step 1: Render the expanding card via createPortal to document.body**

Add the import:

```ts
import { createPortal } from "react-dom";
```

In the per-card map, when `isExpanding` is true, return a portal instead:

```tsx
if (isExpanding) {
  return createPortal(
    <motion.div
      key={study.slug}
      className="fixed"
      animate={{
        x: 0,
        scale: 1,
        opacity: 1,
        rotate: 0,
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        translateX: "0%",
        translateY: "0%",
        zIndex: 100,
      }}
      transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
      style={{ position: "fixed", top: 0, left: 0 }}
    >
      <Card {...cardProps} />
    </motion.div>,
    document.body
  );
}

// otherwise return the regular in-track motion.div as before
```

Note that `createPortal` requires a guarded mount (avoids SSR issues):

```ts
const [mounted, setMounted] = useState(false);
useEffect(() => setMounted(true), []);
```

Then guard the portal: `if (isExpanding && mounted) { ... }`. If `mounted` is false (SSR or first render), fall through to the regular render — the morph won't fire on initial render anyway because `expandingSlug` only sets after a click.

- [ ] **Step 2: Type-check**

Run: `cd "/Users/marcosevilla/Developer/portfolio 2026/site" && npx tsc --noEmit`
Expected: clean exit.

- [ ] **Step 3: Visual smoke check**

- Click a card → morphing card is sharp; other cards are blurred and dimmed
- Route fires correctly
- Browser back → returns to carousel cleanly

- [ ] **Step 4: Commit**

```bash
cd "/Users/marcosevilla/Developer/portfolio 2026"
git add site/components/CaseStudyCarousel.tsx
git commit -m "$(cat <<'EOF'
Portal expanding card to document.body

Escapes the filter-inheritance ancestor so the morphing card stays
sharp while siblings blur. Guarded by a mounted flag to avoid SSR
issues.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 21: Clamp velocity to prevent trackpad fling-too-far

Trackpads can produce extreme velocity values. Clamp before projection.

**Files:**
- Modify: `site/components/CaseStudyCarousel.tsx`

- [ ] **Step 1: Clamp info.velocity.x in onPanEnd**

Replace `onPanEnd`:

```ts
const onPanEnd = (_e: PointerEvent, info: PanInfo) => {
  const clampedVelocity = Math.max(-3000, Math.min(3000, info.velocity.x));
  const projected = offsetX.get() + clampedVelocity * VELOCITY_FACTOR;
  const clamped = Math.max(minOffset, Math.min(maxOffset, projected));
  const snapIndex = Math.round(-clamped / SPREAD);
  settleTo(snapIndex);
  setTimeout(() => { isDraggingRef.current = false; }, 50);
};
```

- [ ] **Step 2: Type-check**

Run: `cd "/Users/marcosevilla/Developer/portfolio 2026/site" && npx tsc --noEmit`
Expected: clean exit.

- [ ] **Step 3: Visual smoke check**

- Two-finger fling on trackpad → no longer overshoots wildly past the last card
- Mouse drag still feels normal

- [ ] **Step 4: Commit**

```bash
cd "/Users/marcosevilla/Developer/portfolio 2026"
git add site/components/CaseStudyCarousel.tsx
git commit -m "$(cat <<'EOF'
Clamp pan velocity to prevent trackpad over-fling

Trackpads can emit velocity > 5000px/s; clamp to ±3000 before applying
the 0.3 projection factor. Mouse drag is unaffected; trackpad now lands
predictably.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 22: Run full smoke checklist

This is the verification gate before declaring Phase 1 complete.

**Files:** none (manual verification)

- [ ] **Step 1: Run dev server**

```bash
cd "/Users/marcosevilla/Developer/portfolio 2026/site"
npm run dev
```

Wait for "Ready" output, then open `http://localhost:3000`.

- [ ] **Step 2: Run the smoke checklist from the spec**

Check off each item by hand:

- [ ] Toggle to carousel view → 7 cards render, active is centered
- [ ] Drag right → snaps to next card
- [ ] Drag with high velocity → skips multiple cards
- [ ] Click active card → expand morph + navigate to case study
- [ ] Browser back → returns to carousel, same active card restored (sessionStorage)
- [ ] Arrow keys cycle active card (carousel must have keyboard focus or page focus)
- [ ] Filter to "Canary" via filter dropdown → carousel rebuilds with subset, active resets to 0
- [ ] View toggle persists across page reload (localStorage)
- [ ] Resize desktop → mobile width → cards resize to 260×340, layout doesn't break
- [ ] DevTools → Rendering → "Emulate CSS media feature prefers-reduced-motion: reduce" → drag becomes native scroll, click navigates instantly
- [ ] VoiceOver: tab into carousel, arrow keys announce study titles

- [ ] **Step 3: Type-check the whole site**

```bash
cd "/Users/marcosevilla/Developer/portfolio 2026/site"
npx tsc --noEmit
```

Expected: clean exit.

- [ ] **Step 4: Lighthouse pass on the homepage**

Open Chrome DevTools → Lighthouse tab → run an audit on `http://localhost:3000`. Compare accessibility score to the pre-carousel baseline (if known). Should be ≥ 95.

- [ ] **Step 5: Stop dev server, no commit needed (verification only)**

If any checklist item fails, file a follow-up task and address before considering Phase 1 done.

---

## Task 23: Update CLAUDE.md "Current State" to reflect carousel ship

**Files:**
- Modify: `/Users/marcosevilla/Developer/portfolio 2026/CLAUDE.md`

- [ ] **Step 1: Update the Current State section**

Edit the section at the bottom of `CLAUDE.md` to reflect that the carousel feature shipped. Replace the existing "Current State" section content with:

```markdown
## Current State
_Updated by Claude at end of each session_
- **Last worked on:** Carousel view (Phase 1) — third homepage view alongside cards/list
- **Completed this session:**
  - New `CaseStudyCarousel.tsx` with drag-to-scroll, velocity-projected snap, rubber-band edges, subtle scale/opacity active state, drag-velocity-derived tilt
  - `CarouselCardShell.tsx` with chrome (320×420 desktop, 260×340 mobile), gradient bg from `study.gradient`, auto scrim, bottom-anchored typography (year + title + company·role, white text)
  - 7 per-study card files in `components/case-study/carousel/` registered via `carousel-card-registry.ts` — gradient-only baselines ready for per-study illustration overlays
  - `useExpandAndNavigate` hook in `lib/carousel-transition.ts` — Phase 1 "scale-up-then-cut" route transition
  - Reduced-motion fallback via native CSS scroll snap
  - Keyboard navigation (arrow keys), ARIA region + live region
  - sessionStorage persistence of active card index
- **In progress:**
  - Per-study illustration/imagery overlays for each carousel card (author at your own pace by editing the per-study files)
  - 42 ImagePlaceholders remain in case studies (F&B 10, Compendium 15, Upsells 17)
- **Known issues:** none from this session
- **Files modified this session:**
  - `site/components/CaseStudyCarousel.tsx` — full rewrite from placeholder
  - `site/components/case-study/carousel/CarouselCardShell.tsx` — new
  - `site/components/case-study/carousel/carousel-card-registry.ts` — new
  - `site/components/case-study/carousel/{FBOrdering,Compendium,Upsells,Checkin,GeneralTask,DesignSystem,AIWorkflow}CarouselCard.tsx` — new (7 files)
  - `site/lib/carousel-transition.ts` — new
- **Spec & plan:**
  - `docs/superpowers/specs/2026-04-26-carousel-view-design.md`
  - `docs/superpowers/plans/2026-04-26-carousel-view.md`
- **Deferred to v2:** Stitched cross-route transition (overlay lives in `layout.tsx`, persists across route change). See spec for design.
```

- [ ] **Step 2: Commit**

```bash
cd "/Users/marcosevilla/Developer/portfolio 2026"
git add CLAUDE.md
git commit -m "$(cat <<'EOF'
Update CLAUDE.md current state with carousel Phase 1 ship

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Out of Scope (deferred to v2 or follow-ups)

- **Stitched cross-route transition.** Replace the `setTimeout` + opacity fade in `useExpandAndNavigate` with a `RouteTransitionContext` whose overlay lives in `layout.tsx` and persists across route changes. See spec for design.
- **Per-study illustration overlays.** Each per-study file ships gradient-only. Author imagery later by editing the files (drop `<img>` / colored overlays / animated SVGs as children of `CarouselCardShell`).
- **On-screen prev/next chevrons.** Keyboard arrows cover desktop; drag covers touch. Add later if desired.
- **Card-shuffle animation on filter change.** Filter currently triggers a full remount via the existing `AnimatePresence filterKey`. Acceptable.
- **Custom expand-target shapes.** All cards expand to fullscreen rect. Future variation could morph to a different shape per study.
- **Pinch-zoom or trackpad-wheel horizontal scrolling.** Drag and keyboard cover the use cases.

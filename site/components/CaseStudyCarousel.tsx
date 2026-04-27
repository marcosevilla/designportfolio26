"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useMotionValue, useTransform, useMotionValueEvent, useVelocity, useReducedMotion, animate, type MotionValue, type PanInfo, type AnimationPlaybackControls } from "framer-motion";
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
// Critically damped (zeta = 1) so rapid wheel/keyboard ticks don't oscillate.
// damping = 2 * sqrt(stiffness * mass) = 2 * sqrt(180) ≈ 26.83 — round up to 28
// for a touch of overdamping, which kills overshoot at the cost of a hair of liveliness.
const SETTLE_SPRING = { type: "spring" as const, stiffness: 180, damping: 28, mass: 1 };
const STORAGE_KEY = "carousel-active-index";

// ─── Per-card component ────────────────────────────────────────────────────────
// Extracted so useTransform hooks are always called at the top level (not inside
// a .map loop), which prevents framer-motion from recreating derived MotionValues
// on parent re-renders and causing the drag-reset bug.

interface CarouselItemProps {
  study: CaseStudyMeta;
  index: number;
  activeIndex: number;
  offsetX: MotionValue<number>;
  rotate: MotionValue<number>;
  isActive: boolean;
  onCardClick: (slug: string) => void;
}

function CarouselItem({ study, index, activeIndex, offsetX, rotate, isActive, onCardClick }: CarouselItemProps) {
  // Stable transform function — wrap in useMemo so framer-motion doesn't see a new
  // function identity on every render and potentially reset its internal MotionValue state.
  const xTransformFn = useMemo(() => (v: number) => v + index * SPREAD, [index]);
  const x = useTransform(offsetX, xTransformFn);
  const scale = useTransform(x, [-SPREAD * 2, -SPREAD, 0, SPREAD, SPREAD * 2], [0.85, 0.92, 1.0, 0.92, 0.85]);
  const opacity = useTransform(x, [-SPREAD * 2, -SPREAD, 0, SPREAD, SPREAD * 2], [0.4, 0.7, 1.0, 0.7, 0.4]);

  const Custom = CAROUSEL_CARDS[study.slug];
  const Card = Custom ?? CarouselCardShell;
  const cardProps: CarouselCardProps = {
    study,
    isActive,
    onClick: () => onCardClick(study.slug),
  };

  return (
    // No left/top/translateX/translateY — the parent is flex-centered, so x=0 means
    // "horizontally centered in the track". Only motion-controlled values here, which
    // avoids the conflict where static translateX and the motion x both compile to
    // transform:translateX(...) and cause a visual jump on drag start.
    <motion.div
      className="absolute"
      style={{
        x,
        scale,
        opacity,
        rotate,
        zIndex: isActive ? 10 : 5 - Math.abs(index - activeIndex),
        // Keep the card centered on the flex anchor point
        marginLeft: `-${CARD_W / 2}px`,
        marginTop: `-${CARD_H / 2}px`,
      }}
    >
      <Card {...cardProps} />
    </motion.div>
  );
}

// ─── Main carousel ─────────────────────────────────────────────────────────────

export default function CaseStudyCarousel({ studies }: CaseStudyCarouselProps) {
  const reducedMotion = useReducedMotion();
  const offsetX = useMotionValue(0);
  const velocity = useVelocity(offsetX);
  const rotate = useTransform(velocity, [-1500, 0, 1500], [3, 0, -3], { clamp: true });
  const [activeIndex, setActiveIndex] = useState(0);
  // Keep a ref in sync with state so callbacks always read the latest value
  // without needing to be re-created on every render.
  const activeIndexRef = useRef(0);
  const animRef = useRef<AnimationPlaybackControls | null>(null);
  const panStartOffsetRef = useRef(0);
  const panOccurredRef = useRef(false);
  const trackRef = useRef<HTMLDivElement>(null);
  const lastWheelTimeRef = useRef(0);

  const minOffset = -(studies.length - 1) * SPREAD;
  const maxOffset = 0;

  useMotionValueEvent(offsetX, "change", (v) => {
    const idx = Math.max(0, Math.min(studies.length - 1, Math.round(-v / SPREAD)));
    if (idx !== activeIndexRef.current) {
      activeIndexRef.current = idx;
      setActiveIndex(idx);
    }
  });

  // Restore on mount
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (!saved) return;
      const idx = parseInt(saved, 10);
      if (!Number.isFinite(idx) || idx < 0 || idx >= studies.length) return;
      offsetX.set(-idx * SPREAD);
      activeIndexRef.current = idx;
      setActiveIndex(idx);
    } catch {}
    // Run once on mount only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist on change
  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, String(activeIndex));
    } catch {}
  }, [activeIndex]);

  const settleTo = (index: number) => {
    const clamped = Math.max(0, Math.min(studies.length - 1, index));
    animRef.current?.stop();
    animRef.current = animate(offsetX, -clamped * SPREAD, { ...SETTLE_SPRING, velocity: 0 });
  };

  // Capture start position on pointer-down rather than onPanStart, because
  // framer-motion's onPan can fire BEFORE onPanStart in some cases — and if
  // panStartOffsetRef is still stale, the first pan event sets offsetX to
  // (0 + info.offset.x), snapping the whole carousel to card 0.
  const onPointerDown = () => {
    animRef.current?.stop();
    panStartOffsetRef.current = offsetX.get();
    panOccurredRef.current = false;
  };

  const onPan = (_e: PointerEvent, info: PanInfo) => {
    panOccurredRef.current = true;
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
    setTimeout(() => { panOccurredRef.current = false; }, 50);
  };

  const handleCardClick = (slug: string) => {
    if (panOccurredRef.current) return;
    console.log("clicked", slug);
  };

  // ─── Trackpad horizontal scroll ──────────────────────────────────────────────
  // Attached via addEventListener with passive:false so e.preventDefault() works.
  // Discrete tick-based advancement (one card per 300ms debounce) matches the
  // snap UX and prevents overshooting on sustained swipes.
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    if (reducedMotion) return;

    const handler = (e: WheelEvent) => {
      // Only handle horizontal intent; let vertical pass through for page scroll.
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY) || Math.abs(e.deltaX) < 5) return;
      e.preventDefault();

      const now = performance.now();
      if (now - lastWheelTimeRef.current < 300) return;
      lastWheelTimeRef.current = now;

      const direction = e.deltaX > 0 ? 1 : -1;
      settleTo(activeIndexRef.current + direction);
    };

    el.addEventListener("wheel", handler, { passive: false });
    return () => el.removeEventListener("wheel", handler);
    // settleTo reads offsetX (stable MotionValue) and studies.length (stable).
    // activeIndexRef is always current — no need to list activeIndex here.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studies.length, reducedMotion]);

  // ─── Arrow key navigation ─────────────────────────────────────────────────────
  useEffect(() => {
    if (reducedMotion) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        settleTo(activeIndexRef.current - 1);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        settleTo(activeIndexRef.current + 1);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studies.length, reducedMotion]);

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
              isActive: false,
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

  return (
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
      <div role="status" aria-live="polite" className="sr-only">
        {studies[activeIndex]?.title}, card {activeIndex + 1} of {studies.length}
      </div>
      <motion.div
        ref={trackRef}
        className="relative flex items-center justify-center"
        style={{ width: "100%", height: `${CARD_H + 64}px`, touchAction: "pan-y" }}
        onPointerDown={onPointerDown}
        onPan={onPan}
        onPanEnd={onPanEnd}
      >
        {studies.map((study, i) => (
          <CarouselItem
            key={study.slug}
            study={study}
            index={i}
            activeIndex={activeIndex}
            offsetX={offsetX}
            rotate={rotate}
            isActive={i === activeIndex}
            onCardClick={handleCardClick}
          />
        ))}
      </motion.div>
    </div>
  );
}

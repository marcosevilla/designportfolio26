"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform, useMotionValueEvent, useVelocity, useReducedMotion, animate, type MotionValue, type PanInfo, type AnimationPlaybackControls } from "framer-motion";
import { CAROUSEL_CARDS, type CarouselCardProps } from "./case-study/carousel/carousel-card-registry";
import CarouselCardShell from "./case-study/carousel/CarouselCardShell";
import type { CaseStudyMeta } from "@/lib/types";
import { useExpandAndNavigate } from "@/lib/carousel-transition";

interface CaseStudyCarouselProps {
  studies: CaseStudyMeta[];
}

const CARD_W_DESKTOP = 320;
const CARD_H_DESKTOP = 420;
const CARD_W_MOBILE = 260;
const CARD_H_MOBILE = 340;
const GAP = 24;
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
  onCardClick: (slug: string, index: number) => void;
  spread: number;
  cardW: number;
  cardH: number;
  isExpanding: boolean;
}

function CarouselItem({ study, index, activeIndex, offsetX, rotate, isActive, onCardClick, spread, cardW, cardH, isExpanding }: CarouselItemProps) {
  // Stable transform function — wrap in useMemo so framer-motion doesn't see a new
  // function identity on every render and potentially reset its internal MotionValue state.
  const xTransformFn = useMemo(() => (v: number) => v + index * spread, [index, spread]);
  const x = useTransform(offsetX, xTransformFn);
  const scale = useTransform(x, [-spread * 2, -spread, 0, spread, spread * 2], [0.85, 0.92, 1.0, 0.92, 0.85]);
  const opacity = useTransform(x, [-spread * 2, -spread, 0, spread, spread * 2], [0.4, 0.7, 1.0, 0.7, 0.4]);

  const Custom = CAROUSEL_CARDS[study.slug];
  const Card = Custom ?? CarouselCardShell;
  const cardProps: CarouselCardProps = {
    study,
    isActive,
    onClick: () => onCardClick(study.slug, index),
    isExpanding,
  };

  return (
    // The card stays in its natural carousel position during expand. The route
    // hand-off is handled by a fullscreen gradient veil rendered by the parent;
    // animating the card's position would fight the layout system and jank.
    <motion.div
      className="absolute"
      style={{
        x,
        scale,
        opacity,
        rotate,
        zIndex: isActive ? 10 : 5 - Math.abs(index - activeIndex),
        marginLeft: `-${cardW / 2}px`,
        marginTop: `-${cardH / 2}px`,
      }}
    >
      <Card {...cardProps} />
    </motion.div>
  );
}

// ─── Main carousel ─────────────────────────────────────────────────────────────

export default function CaseStudyCarousel({ studies }: CaseStudyCarouselProps) {
  const reducedMotion = useReducedMotion();
  const { expandingSlug, trigger } = useExpandAndNavigate();

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
    const clampedVelocity = Math.max(-3000, Math.min(3000, info.velocity.x));
    const projected = offsetX.get() + clampedVelocity * VELOCITY_FACTOR;
    const clamped = Math.max(minOffset, Math.min(maxOffset, projected));
    const snapIndex = Math.round(-clamped / SPREAD);
    settleTo(snapIndex);
    setTimeout(() => { panOccurredRef.current = false; }, 50);
  };

  const handleCardClick = (slug: string, index: number) => {
    if (panOccurredRef.current) return;
    // Click on a side card → scroll to it (don't navigate).
    // Click on the active centered card → navigate to the case study.
    if (index === activeIndexRef.current) {
      trigger(slug);
    } else {
      settleTo(index);
    }
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

  // Find the gradient of the card that's expanding so the veil matches the
  // destination case study hero exactly — that's what makes the route swap invisible.
  const expandingStudy = expandingSlug ? studies.find((s) => s.slug === expandingSlug) : null;
  const expandingGradient = expandingStudy?.gradient ?? "linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%)";

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label="Case studies carousel"
      className="relative"
      style={{
        marginLeft: "calc(-50vw + 50%)",
        marginRight: "calc(-50vw + 50%)",
        // Vertical buffer: marginTop pushes the carousel below the Work header
        // and toggle row; the extra 64px on height gives the active card (scale 1.0)
        // visual breathing room above and below.
        marginTop: "32px",
        height: `${CARD_H + 128}px`,
        ["--carousel-card-w" as string]: `${CARD_W}px`,
        ["--carousel-card-h" as string]: `${CARD_H}px`,
      }}
    >
      <div role="status" aria-live="polite" className="sr-only">
        {studies[activeIndex]?.title}, card {activeIndex + 1} of {studies.length}
      </div>
      <motion.div
        animate={{
          filter: expandingSlug ? "blur(6px)" : "blur(0px)",
          opacity: expandingSlug ? 0.4 : 1,
        }}
        transition={{ duration: 0.3 }}
      >
        <motion.div
          ref={trackRef}
          className="relative flex items-center justify-center"
          style={{ width: "100%", height: `${CARD_H + 128}px`, touchAction: "pan-y" }}
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
              spread={SPREAD}
              cardW={CARD_W}
              cardH={CARD_H}
              isExpanding={expandingSlug === study.slug}
            />
          ))}
        </motion.div>
      </motion.div>

      {/* Fullscreen gradient veil — fades in to mask the route swap.
          Uses position:fixed so it escapes the carousel's layout context entirely.
          Color matches the destination case study hero, so when router.push fires
          and the veil is at full opacity, the underlying page swap is invisible. */}
      <AnimatePresence>
        {expandingSlug && (
          <motion.div
            key="carousel-expand-veil"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            style={{
              position: "fixed",
              inset: 0,
              background: expandingGradient,
              zIndex: 9999,
              pointerEvents: "none",
            }}
            aria-hidden
          />
        )}
      </AnimatePresence>
    </div>
  );
}

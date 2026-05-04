"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

const PHOTOS = [
  { src: "/images/photography/photo-1.jpg", w: 600, h: 900 },
  { src: "/images/photography/photo-2.jpg", w: 675, h: 900 },
  { src: "/images/photography/photo-3.jpg", w: 600, h: 900 },
  { src: "/images/photography/photo-4.jpg", w: 600, h: 900 },
  { src: "/images/photography/photo-5.jpg", w: 900, h: 600 },
  { src: "/images/photography/photo-6.jpg", w: 600, h: 900 },
];

// Fan layout (desktop) — rotations spread evenly; transform-origin (set
// in CSS) is below each card so rotation alone produces the hand-of-
// cards spread.
const ROTATIONS = [-32, -19, -6, 6, 19, 32];

// Desktop photo size — fan layout uses a uniform size so all cards
// share the same transform pivot.
const PHOTO_WIDTH = 200;
const PHOTO_HEIGHT = 280;

// Mobile grid layout — fan rotations don't fit on a phone (cards
// extend past viewport edges + read as cramped). On mobile we render a
// 3×2 grid of upright cards, sized to fit a typical phone viewport
// with margin to spare.
const MOBILE_PHOTO_WIDTH = 100;
const MOBILE_PHOTO_HEIGHT = 140;
const MOBILE_COLS = 3;
const MOBILE_GAP = 8;
const MOBILE_ROWS = Math.ceil(PHOTOS.length / MOBILE_COLS);
const MOBILE_GRID_WIDTH =
  MOBILE_COLS * MOBILE_PHOTO_WIDTH + (MOBILE_COLS - 1) * MOBILE_GAP;
const MOBILE_GRID_HEIGHT =
  MOBILE_ROWS * MOBILE_PHOTO_HEIGHT + (MOBILE_ROWS - 1) * MOBILE_GAP;

const STACK_OFFSET_TOP = 32;
const PHOTO_STAGGER = 0.4;
const BLUR_AMOUNT = 12;
const BLUR_DURATION = 0.55;
// Fast exit fade for the cloned label so it doesn't sit at full
// opacity for the entire ~0.6s wrapper exit (which previously read as
// duplicate text overlapping the original trigger after unhover).
const LABEL_EXIT_DURATION = 0.18;

type FontStyle = {
  fontSize: string;
  fontFamily: string;
  fontWeight: string;
  letterSpacing: string;
  lineHeight: string;
};

export function PhotoStack({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const [font, setFont] = useState<FontStyle | null>(null);
  // Mobile swaps the desktop fan for an upright grid (no rotations,
  // photos centered in the viewport), since the fan extends past
  // narrow viewport edges and the rotated cards crowd each other.
  const [isMobile, setIsMobile] = useState(false);
  const triggerRef = useRef<HTMLSpanElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(max-width: 1023px)");
    setIsMobile(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const capture = () => {
    const el = triggerRef.current;
    if (!el) return;
    setRect(el.getBoundingClientRect());
    const cs = getComputedStyle(el);
    setFont({
      fontSize: cs.fontSize,
      fontFamily: cs.fontFamily,
      fontWeight: cs.fontWeight,
      letterSpacing: cs.letterSpacing,
      lineHeight: cs.lineHeight,
    });
  };

  const handleEnter = () => {
    capture();
    setOpen(true);
  };

  useEffect(() => {
    if (!open) return;
    const update = () => capture();
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
    };
  }, [open]);

  return (
    <>
      <span
        ref={triggerRef}
        className="photo-stack-trigger"
        onMouseEnter={handleEnter}
        onMouseLeave={() => setOpen(false)}
        onFocus={handleEnter}
        onBlur={() => setOpen(false)}
        tabIndex={0}
        // On mobile the trigger stays visible — we don't render a
        // cloned label there (the photos float in their own zone of
        // the viewport, so there's no need to swap the trigger out).
        // Keeping the trigger in flow at full opacity also avoids the
        // stale-rect / address-bar-resize jumps the cloned label was
        // prone to on phones.
        style={{ opacity: open && !isMobile ? 0 : 1 }}
      >
        {children}
      </span>
      {mounted &&
        createPortal(
          <AnimatePresence>
            {open && rect && font && (
              <motion.div
                key="photo-stack-overlay"
                className="photo-stack-overlay"
                // Wrapper stays at full opacity. Children (backdrop, photos)
                // animate their own opacity so the visible blur fade follows
                // a single linear curve instead of parent × child compounding.
                // The exit transition gives AnimatePresence a window to let
                // children play their exit animations before unmount.
                initial={{ opacity: 1 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0.999 }}
                transition={{ duration: BLUR_DURATION + 0.05 }}
              >
                <motion.div
                  className="photo-stack-backdrop"
                  aria-hidden
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: BLUR_DURATION, ease: "linear" }}
                />
                {!isMobile && (
                  <motion.span
                    className="photo-stack-trigger photo-stack-label"
                    style={{
                      position: "fixed",
                      top: rect.top,
                      left: rect.left,
                      width: rect.width,
                      height: rect.height,
                      fontSize: font.fontSize,
                      fontFamily: font.fontFamily,
                      fontWeight: font.fontWeight,
                      letterSpacing: font.letterSpacing,
                      lineHeight: font.lineHeight,
                    }}
                    // Fade the cloned label out fast on exit so it
                    // doesn't sit at full opacity on top of the trigger
                    // (which flips back to opacity 1 immediately when
                    // open=false). Without this, the user briefly sees
                    // duplicate text overlapping during the wrapper's
                    // 0.6s exit window.
                    initial={{ opacity: 1 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: LABEL_EXIT_DURATION, ease: "linear" }}
                  >
                    {children}
                  </motion.span>
                )}
                <div
                  className="photo-stack"
                  style={
                    isMobile
                      ? {
                          // Mobile: upright grid centered horizontally
                          // in the viewport (not on the trigger word —
                          // its position is unstable on a narrow phone
                          // and the grid is wider than the trigger).
                          // Anchored ~88px from the top so it clears
                          // the sticky toolbar with a comfortable gap.
                          position: "fixed",
                          top: 88,
                          left: "50%",
                          transform: "translateX(-50%)",
                          width: MOBILE_GRID_WIDTH,
                          height: MOBILE_GRID_HEIGHT,
                          display: "grid",
                          gridTemplateColumns: `repeat(${MOBILE_COLS}, ${MOBILE_PHOTO_WIDTH}px)`,
                          gap: MOBILE_GAP,
                        }
                      : {
                          position: "fixed",
                          // Bottom edge anchored just above the link.
                          bottom:
                            typeof window !== "undefined"
                              ? window.innerHeight - rect.top + STACK_OFFSET_TOP
                              : 0,
                          left: rect.left + rect.width / 2,
                          width: PHOTO_WIDTH,
                          height: PHOTO_HEIGHT,
                          transform: "translateX(-50%)",
                        }
                  }
                  aria-label="Concert photographs by Marco Sevilla"
                  role="img"
                >
                  {PHOTOS.map((photo, i) => {
                    const photoW = isMobile ? MOBILE_PHOTO_WIDTH : PHOTO_WIDTH;
                    const photoH = isMobile ? MOBILE_PHOTO_HEIGHT : PHOTO_HEIGHT;
                    const initial = reduced
                      ? { opacity: 0 }
                      : isMobile
                        ? { opacity: 0, filter: "blur(16px)", scale: 0.92 }
                        : {
                            opacity: 0,
                            filter: "blur(24px)",
                            scale: 0.92,
                            rotate: 0,
                          };
                    const animate = reduced
                      ? { opacity: 1 }
                      : isMobile
                        ? { opacity: 1, filter: "blur(0px)", scale: 1 }
                        : {
                            opacity: 1,
                            filter: "blur(0px)",
                            scale: 1,
                            rotate: ROTATIONS[i],
                          };
                    return (
                      <motion.img
                        key={photo.src}
                        src={photo.src}
                        alt=""
                        width={photo.w}
                        height={photo.h}
                        draggable={false}
                        className="photo-stack__photo"
                        style={
                          isMobile
                            ? {
                                // In-flow grid cell — clear the desktop
                                // fan-pivot transform-origin and let the
                                // grid handle layout.
                                position: "static",
                                width: photoW,
                                height: photoH,
                                transformOrigin: "center center",
                              }
                            : {
                                width: photoW,
                                height: photoH,
                                // Reverse z-stack: first to animate ends on top.
                                zIndex: PHOTOS.length - i,
                              }
                        }
                        initial={initial}
                        animate={animate}
                        exit={{
                          opacity: 0,
                          filter: "blur(16px)",
                          scale: 0.96,
                          transition: { duration: 0.22 },
                        }}
                        transition={{
                          type: "spring",
                          stiffness: 140,
                          damping: 22,
                          // Mobile grid: simple left-to-right reveal
                          // with a tight stagger. Desktop fan: right-to-
                          // left so the leftmost card lands on top.
                          delay: reduced
                            ? 0
                            : isMobile
                              ? i * 0.06
                              : (PHOTOS.length - 1 - i) * PHOTO_STAGGER,
                        }}
                      />
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </>
  );
}

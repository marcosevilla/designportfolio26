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

// Fan layout — rotations spread evenly; transform-origin (set in CSS) is below
// each card so rotation alone produces the hand-of-cards spread.
const ROTATIONS = [-32, -19, -6, 6, 19, 32];

// All photos render at this fixed display size (object-fit: cover crops the
// natural aspect to a uniform card). Uniform size = shared transform pivot,
// which is what makes the fan layout work cleanly.
const PHOTO_WIDTH = 200;
const PHOTO_HEIGHT = 280;
const STACK_OFFSET_TOP = 32;
const PHOTO_STAGGER = 0.4;
const BLUR_AMOUNT = 12;
const BLUR_DURATION = 0.55;

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
  const triggerRef = useRef<HTMLSpanElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => setMounted(true), []);

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
        style={{ opacity: open ? 0 : 1 }}
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
                <span
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
                >
                  {children}
                </span>
                <div
                  className="photo-stack"
                  style={{
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
                  }}
                  aria-label="Concert photographs by Marco Sevilla"
                  role="img"
                >
                  {PHOTOS.map((photo, i) => {
                    const initial = reduced
                      ? { opacity: 0 }
                      : {
                          opacity: 0,
                          filter: "blur(24px)",
                          scale: 0.92,
                          rotate: 0,
                        };
                    const animate = reduced
                      ? { opacity: 1 }
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
                        style={{
                          width: PHOTO_WIDTH,
                          height: PHOTO_HEIGHT,
                          // Reverse z-stack: first to animate ends on top.
                          zIndex: PHOTOS.length - i,
                        }}
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
                          // Right-to-left: rightmost card (last index) appears first,
                          // leftmost (first index) appears last and lands on top.
                          delay: reduced
                            ? 0
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

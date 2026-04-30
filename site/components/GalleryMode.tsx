"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { CaseStudyMeta } from "@/lib/types";
import { galleryContent } from "@/lib/gallery-content";
import { CloseIcon, BackChevronIcon } from "./Icons";

interface GalleryLayers {
  bg: string;
  ui: string;
  uiWidth: string | null;
  uiHeight: string | null;
  parallax: "left" | "bottom";
  uiBorderRadius: string | null;
  uiShadow: string | null;
}

interface GallerySlot {
  study: CaseStudyMeta;
  /** Single-image source. Null for empty placeholder slides; ignored when
   *  `layers` is set. */
  image: string | null;
  fit: "contain" | "cover";
  objectPosition: string;
  /** When set, this slide renders a layered composition (background +
   *  parallaxed UI mock) instead of a single image. */
  layers: GalleryLayers | null;
}

// Flatten studies into one slide per image. Studies with zero configured
// images get a single placeholder slide so the carousel still has a slot
// for that project while images are being ingested.
function buildSlots(studies: CaseStudyMeta[]): GallerySlot[] {
  return studies.flatMap<GallerySlot>((study) => {
    const items = galleryContent[study.slug] ?? [];
    if (items.length === 0) {
      return [{ study, image: null, fit: "contain", objectPosition: "center", layers: null }];
    }
    return items.map((item) => {
      if (typeof item === "string") {
        return { study, image: item, fit: "contain", objectPosition: "center", layers: null };
      }
      if ("layers" in item) {
        const hasHeight = item.layers.uiHeight != null;
        return {
          study,
          image: null,
          fit: "cover",
          objectPosition: "center",
          layers: {
            bg: item.layers.bg,
            ui: item.layers.ui,
            // Default to width: "70%" only when neither dimension is set —
            // setting both would over-constrain the UI image.
            uiWidth: item.layers.uiWidth ?? (hasHeight ? null : "70%"),
            uiHeight: item.layers.uiHeight ?? null,
            parallax: item.layers.parallax ?? "bottom",
            uiBorderRadius: item.layers.uiBorderRadius ?? null,
            uiShadow: item.layers.uiShadow ?? null,
          },
        };
      }
      return {
        study,
        image: item.src,
        fit: item.fit ?? "contain",
        objectPosition: item.objectPosition ?? "center",
        layers: null,
      };
    });
  });
}

interface GalleryModeProps {
  open: boolean;
  onClose: () => void;
  studies: CaseStudyMeta[];
}

interface ArrowButtonProps {
  side: "left" | "right";
  onClick: () => void;
  label: string;
}

const ARROW_SHADOW =
  "0 12px 32px rgba(0, 0, 0, 0.22), 0 4px 8px rgba(0, 0, 0, 0.10)";
const ARROW_SHADOW_HOVER =
  "0 16px 40px rgba(0, 0, 0, 0.28), 0 6px 12px rgba(0, 0, 0, 0.14)";

function ArrowButton({ side, onClick, label }: ArrowButtonProps) {
  const [hover, setHover] = useState(false);
  const offsetSign = side === "left" ? -1 : 1;
  const positionClass = side === "left" ? "left-8" : "right-8";

  return (
    <div className={`fixed ${positionClass} top-1/2 -translate-y-1/2 z-10`}>
      <motion.button
        type="button"
        onClick={onClick}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        onFocus={() => setHover(true)}
        onBlur={() => setHover(false)}
        aria-label={label}
        initial={{ opacity: 0, x: 8 * offsetSign }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 8 * offsetSign }}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.96 }}
        transition={{ duration: 0.2 }}
        className="flex items-center justify-center w-11 h-11 rounded-full cursor-pointer"
        style={{
          backgroundColor: hover ? "var(--color-accent)" : "var(--color-fg-tertiary)",
          color: "var(--color-bg)",
          boxShadow: hover ? ARROW_SHADOW_HOVER : ARROW_SHADOW,
          transition: "background-color 180ms ease, box-shadow 220ms ease",
        }}
      >
        <span
          style={{
            display: "inline-flex",
            transform: side === "right" ? "scaleX(-1)" : undefined,
          }}
        >
          <BackChevronIcon size={18} />
        </span>
      </motion.button>
    </div>
  );
}

// Fullscreen horizontal-swipe gallery. One slide per image (with a single
// placeholder slide for any study that has no images yet). Snap scrolling
// via native CSS — no rAF or framer-motion drag yet.
export default function GalleryMode({ open, onClose, studies }: GalleryModeProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<(HTMLElement | null)[]>([]);
  const parallaxRefs = useRef<Map<number, HTMLElement>>(new Map());
  const [currentIndex, setCurrentIndex] = useState(0);

  const slots = buildSlots(studies);

  const goTo = useCallback((idx: number) => {
    if (idx < 0 || idx >= slots.length) return;
    const slide = slideRefs.current[idx];
    if (!slide) return;
    setCurrentIndex(idx);
    slide.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [slots.length]);

  // Reset to the first slide each time the gallery opens.
  useEffect(() => {
    if (!open) return;
    setCurrentIndex(0);
  }, [open]);

  // Keyboard: ←/→ navigate, Escape closes.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        goTo(currentIndex + 1);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        goTo(currentIndex - 1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose, goTo, currentIndex]);

  // Sync currentIndex from manual scrolls/swipes via IntersectionObserver
  // so the arrows + visibility state track the user's scroll position.
  useEffect(() => {
    if (!open || !trackRef.current) return;
    const root = trackRef.current;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible) return;
        const idx = Number((visible.target as HTMLElement).dataset.index);
        if (!Number.isNaN(idx)) setCurrentIndex(idx);
      },
      { root, threshold: [0.5, 0.75, 0.95] }
    );
    slideRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, [open, slots.length]);

  // Parallax: for any slot with a UI layer, the UI translates along its
  // slot's configured axis based on the slide's distance from the viewport
  // center. At rest (slide centered) the UI is dead-center; at one slide-
  // width away (either direction) the UI is fully off-frame in its
  // configured direction. Hide-distance is computed from real frame and UI
  // dimensions so the UI clears the frame edge precisely regardless of size.
  useEffect(() => {
    if (!open || !trackRef.current) return;
    const track = trackRef.current;
    let raf = 0;

    const update = () => {
      raf = 0;
      const vw = window.innerWidth;
      const center = vw / 2;
      slideRefs.current.forEach((slideEl, idx) => {
        const ui = parallaxRefs.current.get(idx);
        if (!ui || !slideEl) return;
        const frameEl = ui.parentElement;
        if (!frameEl) return;
        const slideRect = slideEl.getBoundingClientRect();
        const frameRect = frameEl.getBoundingClientRect();
        const slideCenter = slideRect.left + slideRect.width / 2;
        const distance = slideCenter - center;
        const progress = Math.min(1, Math.abs(distance) / slideRect.width);
        const direction = ui.dataset.parallax === "left" ? "left" : "bottom";
        if (direction === "left") {
          const tx = progress * ((frameRect.width + ui.offsetWidth) / 2);
          ui.style.transform = `translate(calc(-50% - ${tx}px), -50%)`;
        } else {
          const ty = progress * ((frameRect.height + ui.offsetHeight) / 2);
          ui.style.transform = `translate(-50%, calc(-50% + ${ty}px))`;
        }
      });
    };
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(update);
    };

    update();
    track.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      track.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [open, slots.length]);

  // Lock body scroll while open so the page doesn't scroll behind the overlay.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Hide the homepage primary nav while gallery mode owns the screen.
  useEffect(() => {
    if (!open) return;
    const nav = document.querySelector<HTMLElement>('nav[aria-label="Primary"]');
    if (!nav) return;
    const prev = nav.style.display;
    nav.style.display = "none";
    return () => {
      nav.style.display = prev;
    };
  }, [open]);

  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < slots.length - 1;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="gallery-mode"
          initial={{ opacity: 0, filter: "blur(20px)" }}
          animate={{ opacity: 1, filter: "blur(0px)" }}
          exit={{ opacity: 0, filter: "blur(20px)" }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[100]"
          style={{ background: "var(--color-bg)", willChange: "filter, opacity" }}
          role="dialog"
          aria-modal="true"
          aria-label="Project gallery"
        >
          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close gallery"
            className="fixed top-6 right-6 z-10 flex items-center justify-center w-10 h-10 rounded-full transition-colors"
            style={{
              backgroundColor: "var(--color-surface-raised)",
              color: "var(--color-fg-secondary)",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "var(--color-accent)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "var(--color-fg-secondary)"; }}
          >
            <CloseIcon size={14} />
          </button>

          {/* Floating prev/next arrows — only render when there's content
              in that direction so the affordance reflects bounds. Filled
              with the foreground color (auto-flips for theme) so they pop
              from the page; drop shadow lifts them off the background. */}
          <AnimatePresence>
            {hasPrev && (
              <ArrowButton
                key="gallery-prev"
                side="left"
                onClick={() => goTo(currentIndex - 1)}
                label="Previous project"
              />
            )}
            {hasNext && (
              <ArrowButton
                key="gallery-next"
                side="right"
                onClick={() => goTo(currentIndex + 1)}
                label="Next project"
              />
            )}
          </AnimatePresence>

          {/* Keyboard hint — bottom-center, signals ←/→ are wired up. */}
          <div
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 px-3 py-1.5 rounded-full pointer-events-none"
            style={{
              backgroundColor: "var(--color-surface-raised)",
              color: "var(--color-fg-tertiary)",
              fontFamily: "var(--font-geist-mono), ui-monospace, Menlo, monospace",
              fontSize: "11px",
              letterSpacing: "0.04em",
            }}
            aria-hidden
          >
            <kbd
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: 18,
                height: 18,
                borderRadius: 4,
                border: "1px solid var(--color-border)",
                fontFamily: "inherit",
                fontSize: "11px",
              }}
            >
              ←
            </kbd>
            <kbd
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: 18,
                height: 18,
                borderRadius: 4,
                border: "1px solid var(--color-border)",
                fontFamily: "inherit",
                fontSize: "11px",
              }}
            >
              →
            </kbd>
            <span>to navigate</span>
          </div>

          {/* Horizontal scroll-snap track. Padding-inline equal to half the
              viewport-minus-slide width so the first and last slides can
              actually center under scroll-snap-align: center. */}
          <div
            ref={trackRef}
            className="h-full w-full overflow-x-auto overflow-y-hidden flex items-center"
            style={{
              scrollSnapType: "x mandatory",
              scrollBehavior: "smooth",
              gap: "24px",
              paddingInline: "max(3vw, calc(50vw - 750px))",
            }}
          >
            {slots.map((slot, i) => (
              <section
                key={`${slot.study.slug}-${i}`}
                ref={(el) => { slideRefs.current[i] = el; }}
                data-index={i}
                className="shrink-0 h-full flex flex-col items-stretch justify-center gap-4"
                style={{
                  width: "min(94vw, 1500px)",
                  scrollSnapAlign: "center",
                }}
                aria-label={slot.study.title}
              >
                {/* Themed-shade frame. The image fills the frame edge-to-
                    edge — 16:10 compositions land flush; non-16:10 images
                    fit by height (or width) and let the themed backdrop
                    show through the leftover axis. Empty slot = "coming
                    soon" placeholder for that project. */}
                <div
                  className="w-full aspect-[16/10] rounded-2xl overflow-hidden"
                  style={{
                    position: "relative",
                    maxHeight: "78vh",
                    backgroundColor: "var(--color-surface-raised)",
                    border: "1px solid var(--color-border)",
                  }}
                >
                  {slot.layers && (
                    <>
                      <img
                        src={slot.layers.bg}
                        alt=""
                        aria-hidden
                        style={{
                          position: "absolute",
                          inset: 0,
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          display: "block",
                        }}
                      />
                      <img
                        ref={(el) => {
                          if (el) parallaxRefs.current.set(i, el);
                          else parallaxRefs.current.delete(i);
                        }}
                        src={slot.layers.ui}
                        alt={slot.study.title}
                        data-parallax={slot.layers.parallax}
                        style={{
                          position: "absolute",
                          left: "50%",
                          top: "50%",
                          width: slot.layers.uiWidth ?? "auto",
                          height: slot.layers.uiHeight ?? "auto",
                          display: "block",
                          borderRadius: slot.layers.uiBorderRadius ?? undefined,
                          boxShadow: slot.layers.uiShadow ?? undefined,
                          // Start fully hidden in the configured direction;
                          // the parallax effect overrides on scroll and
                          // on first paint.
                          transform:
                            slot.layers.parallax === "left"
                              ? "translate(calc(-50% - 100vw), -50%)"
                              : "translate(-50%, calc(-50% + 100vh))",
                          pointerEvents: "none",
                          willChange: "transform",
                        }}
                      />
                    </>
                  )}
                  {!slot.layers && slot.image && (
                    <img
                      src={slot.image}
                      alt={slot.study.title}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: slot.fit,
                        objectPosition: slot.objectPosition,
                        display: "block",
                      }}
                    />
                  )}
                </div>
                <div className="text-left">
                  <p
                    style={{
                      fontFamily: "var(--font-geist-mono), ui-monospace, Menlo, monospace",
                      fontSize: "11px",
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      color: "var(--color-fg-tertiary)",
                    }}
                  >
                    {slot.study.year}
                  </p>
                  <h2
                    style={{
                      fontFamily: "var(--font-geist-mono), ui-monospace, Menlo, monospace",
                      fontSize: "16px",
                      fontWeight: 500,
                      color: "var(--color-fg)",
                      marginTop: 4,
                    }}
                  >
                    {slot.study.title}
                  </h2>
                </div>
              </section>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

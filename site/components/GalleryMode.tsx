"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { CaseStudyMeta } from "@/lib/types";
import { CloseIcon, BackChevronIcon } from "./Icons";

interface GalleryModeProps {
  open: boolean;
  onClose: () => void;
  studies: CaseStudyMeta[];
}

// Scaffold: fullscreen horizontal-swipe gallery. Each study gets one slide
// using its hero gradient as a placeholder for the eventual large project
// imagery. Snap scrolling via native CSS — no rAF or framer-motion drag yet.
export default function GalleryMode({ open, onClose, studies }: GalleryModeProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<(HTMLElement | null)[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const goTo = useCallback((idx: number) => {
    if (idx < 0 || idx >= studies.length) return;
    const slide = slideRefs.current[idx];
    if (!slide) return;
    setCurrentIndex(idx);
    slide.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [studies.length]);

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
  }, [open, studies.length]);

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
  const hasNext = currentIndex < studies.length - 1;

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
              in that direction so the affordance reflects bounds. */}
          <AnimatePresence>
            {hasPrev && (
              <motion.button
                key="gallery-prev"
                type="button"
                onClick={() => goTo(currentIndex - 1)}
                aria-label="Previous project"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.2 }}
                className="fixed left-6 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center w-10 h-10 rounded-full transition-colors"
                style={{
                  backgroundColor: "var(--color-surface-raised)",
                  color: "var(--color-fg-secondary)",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = "var(--color-accent)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = "var(--color-fg-secondary)"; }}
              >
                <BackChevronIcon size={14} />
              </motion.button>
            )}
            {hasNext && (
              <motion.button
                key="gallery-next"
                type="button"
                onClick={() => goTo(currentIndex + 1)}
                aria-label="Next project"
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 8 }}
                transition={{ duration: 0.2 }}
                className="fixed right-6 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center w-10 h-10 rounded-full transition-colors"
                style={{
                  backgroundColor: "var(--color-surface-raised)",
                  color: "var(--color-fg-secondary)",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = "var(--color-accent)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = "var(--color-fg-secondary)"; }}
              >
                <span style={{ display: "inline-flex", transform: "scaleX(-1)" }}>
                  <BackChevronIcon size={14} />
                </span>
              </motion.button>
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
              paddingInline: "max(4vw, calc(50vw - 600px))",
            }}
          >
            {studies.map((study, i) => (
              <section
                key={study.slug}
                ref={(el) => { slideRefs.current[i] = el; }}
                data-index={i}
                className="shrink-0 h-full flex flex-col items-stretch justify-center gap-4"
                style={{
                  width: "min(92vw, 1200px)",
                  scrollSnapAlign: "center",
                }}
                aria-label={study.title}
              >
                {/* Placeholder container — variant shade of the themed bg.
                    Real large project imagery slots in here later. */}
                <div
                  className="w-full aspect-[16/10] rounded-2xl"
                  style={{
                    maxHeight: "64vh",
                    backgroundColor: "var(--color-surface-raised)",
                    border: "1px solid var(--color-border)",
                  }}
                />
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
                    {study.year}
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
                    {study.title}
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

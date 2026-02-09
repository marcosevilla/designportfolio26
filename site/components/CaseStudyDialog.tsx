"use client";

import { useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ScrollContainerProvider } from "@/lib/ScrollContainerContext";
import CaseStudyDialogContent from "./CaseStudyDialogContent";

interface CaseStudyDialogProps {
  slug: string | null;
  onClose: () => void;
}

export default function CaseStudyDialog({ slug, onClose }: CaseStudyDialogProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);

  // Body scroll lock + focus management
  useEffect(() => {
    if (slug) {
      previousFocus.current = document.activeElement as HTMLElement;
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";

      // Focus the close button after animation starts
      requestAnimationFrame(() => {
        closeButtonRef.current?.focus();
      });

      return () => {
        document.body.style.overflow = prev;
        // Return focus to the element that opened the dialog
        previousFocus.current?.focus();
      };
    }
  }, [slug]);

  // Escape key closes dialog
  useEffect(() => {
    if (!slug) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [slug, onClose]);

  // Focus trap
  const handleTabTrap = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key !== "Tab") return;

      const dialog = e.currentTarget;
      const focusable = dialog.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    },
    []
  );

  return (
    <AnimatePresence>
      {slug && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            className="fixed inset-0 z-[51] bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Sheet */}
          <motion.div
            key="sheet"
            className="fixed bottom-0 left-0 right-0 z-[52] flex justify-center"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-label={`Case study: ${slug}`}
              className="w-full max-w-content-lg h-[92vh] md:rounded-t-[20px] bg-[var(--color-bg)] overflow-hidden relative"
              onKeyDown={handleTabTrap}
            >
              {/* Close button */}
              <button
                ref={closeButtonRef}
                onClick={onClose}
                className="absolute top-4 right-4 z-10 w-9 h-9 flex items-center justify-center rounded-full transition-colors duration-150 hover:bg-[var(--color-surface-raised)]"
                style={{ color: "var(--color-fg-secondary)" }}
                aria-label="Close case study"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M4 4l8 8M12 4l-8 8" />
                </svg>
              </button>

              {/* Scrollable content */}
              <div
                ref={scrollRef}
                className="h-full overflow-y-auto"
              >
                <div className="pb-20">
                  <ScrollContainerProvider scrollRef={scrollRef}>
                    <CaseStudyDialogContent slug={slug} />
                  </ScrollContainerProvider>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

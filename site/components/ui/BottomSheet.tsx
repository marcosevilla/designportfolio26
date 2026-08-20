"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  AnimatePresence,
  motion,
  useDragControls,
  useReducedMotion,
} from "framer-motion";

/** Matches the chat sheet's mobile breakpoint (globals.css @max-1023px),
 *  plus wide touch-only devices (iPad Pro, iPad landscape ≥1024px CSS
 *  width) — anchored hover-style popovers with 16px targets are exactly
 *  what the sheet exists to replace there. */
export function useIsMobileViewport(): boolean {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(
      "(max-width: 1023px), ((hover: none) and (pointer: coarse))",
    );
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return isMobile;
}

/**
 * Generic mobile bottom sheet — the chat sheet's interaction model
 * (ChatBar.tsx) extracted for other surfaces: scrim tap / Esc / grabber
 * drag-down all dismiss, body scroll locks while open, safe-area padding
 * at the bottom edge. Solid bg like the chat sheet (frosted glass reads
 * unfinished on mobile modals — see globals.css .chat-panel-slot notes).
 *
 * Height fits content (unlike chat's full-viewport slot). Callers own
 * open state; render this unconditionally and toggle `open`.
 *
 * The `bottom-sheet` class marks the surface for outside-pointerdown
 * handlers (HeaderToolbar, GlobalToolbar) — taps inside a sheet must not
 * count as "outside" or the sheet closes before the tapped control fires.
 */
export default function BottomSheet({
  open,
  onClose,
  ariaLabel,
  children,
}: {
  open: boolean;
  onClose: () => void;
  ariaLabel: string;
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const dragControls = useDragControls();

  useEffect(() => setMounted(true), []);

  // Body scroll lock while open (the chat sheet does this via
  // [data-chat-open] CSS; sheets without a global data attribute lock
  // imperatively).
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!mounted) return null;

  const sheetMotion = prefersReducedMotion
    ? {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: 0.2 },
      }
    : {
        initial: { y: "100%" },
        animate: { y: 0 },
        // Exit is a quicker tween so dismissal feels immediate — same
        // split as the chat sheet (spring in, tween out).
        exit: {
          y: "100%",
          transition: {
            type: "tween" as const,
            duration: 0.28,
            ease: [0.4, 0, 1, 1] as const,
          },
        },
        // Same spring as the chat sheet so the two feel like one system.
        transition: { type: "spring" as const, stiffness: 420, damping: 42 },
      };

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          key="sheet-scrim"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[135]"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.35)" }}
          onClick={onClose}
          aria-hidden
        />
      )}
      {open && (
        <motion.div
          key="sheet"
          {...sheetMotion}
          drag={prefersReducedMotion ? false : "y"}
          dragListener={false}
          dragControls={dragControls}
          dragConstraints={{ top: 0 }}
          dragSnapToOrigin
          onDragEnd={(_, info) => {
            if (info.offset.y > 140 || info.velocity.y > 600) onClose();
          }}
          role="dialog"
          aria-modal="true"
          aria-label={ariaLabel}
          className="bottom-sheet fixed inset-x-0 bottom-0 z-[140] flex flex-col"
          style={{
            backgroundColor: "var(--color-bg)",
            borderRadius: "16px 16px 0 0",
            boxShadow: "0 -8px 32px rgba(0, 0, 0, 0.18)",
            paddingBottom: "max(env(safe-area-inset-bottom, 0px), 16px)",
            maxHeight: "85dvh",
          }}
        >
          {/* Grabber — the drag surface for dismissal. touch-none stops
              the browser claiming the gesture for scroll. */}
          <div
            className="flex justify-center pt-2 pb-3 touch-none shrink-0"
            style={{ cursor: "grab" }}
            onPointerDown={(e) => dragControls.start(e)}
          >
            <div
              aria-hidden
              style={{
                width: 36,
                height: 5,
                borderRadius: 999,
                background:
                  "color-mix(in srgb, var(--color-fg) 22%, transparent)",
              }}
            />
          </div>
          <div className="overflow-y-auto overscroll-contain">{children}</div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

"use client";

/**
 * CustomCursor — two Figma-flavored pointer features, desktop only
 * (pointer: fine):
 *
 * 1. A themed cursor arrow. The native cursor is replaced via a CSS
 *    `cursor: url(data:svg)` rule so it stays zero-latency; the SVG is
 *    regenerated whenever the theme changes so the fill always matches
 *    the active accent (mono theme = fg, colored themes = their hue)
 *    with a bg-colored outline for contrast on any surface.
 *
 * 2. A chat-bubble label emitting from the bottom-right of the cursor
 *    (Figma-comment style), spring-following the mouse. Content comes
 *    from lib/cursor-label.ts — work-grid cells set their study title
 *    on hover (the captions that came off the cards in the 2026-07-15
 *    pure-visual pass, back in cursor form).
 *
 * Text fields keep their native I-beam. Mounted once in app/layout.tsx
 * (outside HomeLayout's motion wrappers, so `fixed` is safe here).
 */

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
} from "framer-motion";
import { subscribeCursorLabel, setCursorLabel } from "@/lib/cursor-label";

// Figma-style paper-plane arrow: tip at (2,2), concave notch at the
// back. Hotspot in the cursor rule below must match the tip.
const ARROW_PATH = "M2 2 L20 11 L12 13 L10 21 Z";

function buildCursorCss(): string {
  const styles = getComputedStyle(document.documentElement);
  const accent = styles.getPropertyValue("--color-accent").trim() || "#1a1a1a";
  const bg = styles.getPropertyValue("--color-bg").trim() || "#ffffff";
  const svg =
    `<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'>` +
    `<path d='${ARROW_PATH}' fill='${accent}' stroke='${bg}' stroke-width='1.5' stroke-linejoin='round'/>` +
    `</svg>`;
  const uri = `url("data:image/svg+xml,${encodeURIComponent(svg)}") 2 2, auto`;
  return (
    `@media (pointer: fine) {` +
    ` body, body *:not(input):not(textarea):not([contenteditable='true'])` +
    ` { cursor: ${uri} !important; }` +
    ` }`
  );
}

export default function CustomCursor() {
  const [cursorCss, setCursorCss] = useState<string | null>(null);
  const [label, setLabel] = useState<string | null>(null);
  const pathname = usePathname();

  // Raw mouse position; the bubble trails it on springs (Figma-ish lag).
  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);
  const bubbleX = useSpring(mouseX, { stiffness: 550, damping: 40, mass: 0.6 });
  const bubbleY = useSpring(mouseY, { stiffness: 550, damping: 40, mass: 0.6 });

  // Themed cursor rule — rebuilt whenever the root's class (dark mode)
  // or inline style (applyColoredTheme variable overrides) changes.
  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    const rebuild = () => setCursorCss(buildCursorCss());
    rebuild();
    const observer = new MutationObserver(rebuild);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "style"],
    });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    const onMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, [mouseX, mouseY]);

  useEffect(() => subscribeCursorLabel(setLabel), []);

  // A hovered cell can navigate out from under the cursor — never let
  // a stale label survive a route change.
  useEffect(() => {
    setCursorLabel(null);
  }, [pathname]);

  return (
    <>
      {cursorCss && <style>{cursorCss}</style>}
      <motion.div
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[150] hidden lg:block"
        style={{ x: bubbleX, y: bubbleY }}
      >
        <AnimatePresence>
          {label && (
            <motion.div
              key={label}
              initial={{ opacity: 0, scale: 0.55, x: 12, y: 16 }}
              animate={{ opacity: 1, scale: 1, x: 20, y: 24 }}
              exit={{ opacity: 0, scale: 0.55, transition: { duration: 0.12 } }}
              transition={{ type: "spring", stiffness: 480, damping: 30 }}
              style={{
                transformOrigin: "top left",
                display: "inline-block",
                whiteSpace: "nowrap",
                backgroundColor: "var(--color-accent)",
                color: "var(--color-bg)",
                // Figma comment bubble: round pill, pinched where it
                // emits toward the cursor tip.
                borderRadius: "4px 16px 16px 16px",
                padding: "7px 14px",
                fontFamily: "var(--font-sans)",
                fontSize: 14,
                fontWeight: 500,
                letterSpacing: "-0.01em",
                lineHeight: "20px",
                boxShadow:
                  "0 2px 8px rgba(0, 0, 0, 0.16), 0 8px 24px rgba(0, 0, 0, 0.12)",
              }}
            >
              {label}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  );
}

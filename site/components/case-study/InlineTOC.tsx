"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, useMotionValue, useMotionValueEvent, animate } from "framer-motion";
import { useSidebar } from "@/lib/SidebarContext";
import { BackChevronIcon } from "../Icons";

const STAR_SPRING = { type: "spring" as const, stiffness: 300, damping: 34 };
const LINK_SPRING = { type: "spring" as const, stiffness: 400, damping: 25 };
const ROW_HEIGHT = 28;

// Smooth-scroll typically lands within ~600-800ms. Lock the IntersectionObserver
// for 900ms so it can't clobber the click target with intermediate sections it
// passes through during the scroll.
const SCROLL_LOCK_MS = 900;

export default function InlineTOC() {
  const { tocItems, activeTocId, setActiveTocIdAndLock, backHref } = useSidebar();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Star y is driven via a motion value (not the animate prop) so we can read
  // its instantaneous position each frame and indent whatever link the star is
  // currently passing over.
  const starY = useMotionValue(0);
  const [passingIndex, setPassingIndex] = useState<number | null>(null);

  useMotionValueEvent(starY, "change", (y) => {
    const idx = Math.round(y / ROW_HEIGHT);
    setPassingIndex(idx);
  });

  const activeIndex = tocItems ? tocItems.findIndex((item) => item.id === activeTocId) : -1;

  // Drive the star to the active position via spring whenever activeIndex changes.
  useEffect(() => {
    if (activeIndex < 0) return;
    const controls = animate(starY, activeIndex * ROW_HEIGHT, STAR_SPRING);
    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIndex]);

  if (!tocItems) return null;

  const handleClick = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    // Lock the observer for the duration of the smooth-scroll, so it can't
    // override the click target as intermediate sections cross the active band.
    setActiveTocIdAndLock(id, SCROLL_LOCK_MS);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <nav
      className="chat-cmp-hide hidden lg:block fixed top-[18vh]"
      style={{ width: "130px", left: "48px" }}
    >
      <Link
        href={backHref ?? "/#projects"}
        className="flex items-center gap-1 transition-colors hover:text-(--color-accent) mb-6"
        style={{
          color: "var(--color-fg-secondary)",
          fontFamily: "var(--font-geist-mono), ui-monospace, Menlo, monospace",
          fontSize: "12px",
          fontWeight: 500,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          lineHeight: "20px",
        }}
      >
        <BackChevronIcon size={12} />
        Back
      </Link>
      <ul
        className="flex flex-col gap-2 relative"
        onMouseLeave={() => setHoveredIndex(null)}
      >
        {activeIndex >= 0 && (
          <motion.span
            className="absolute left-0 pointer-events-none"
            style={{
              color: "var(--color-accent)",
              fontSize: "12px",
              lineHeight: "20px",
              fontWeight: 500,
              y: starY,
            }}
            initial={{ opacity: 0, scale: 0.25, filter: "blur(4px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            transition={{ type: "spring", duration: 0.3, bounce: 0 }}
            aria-hidden
          >
            *
          </motion.span>
        )}
        {tocItems.map((item, index) => {
          const active = item.id === activeTocId;
          const isHovered = hoveredIndex === index;
          // Indent any link the star is currently passing over, in addition to
          // the active one. Creates a brief "wave" of indents trailing the
          // star's spring travel.
          const isPassing = passingIndex === index && !active;
          const textColor = isHovered || active
            ? "var(--color-accent)"
            : "var(--color-fg-secondary)";

          return (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                onClick={(e) => handleClick(e, item.id)}
                className="block transition-colors"
                style={{
                  fontFamily: "var(--font-geist-mono), ui-monospace, Menlo, monospace",
                  fontSize: "12px",
                  fontWeight: 500,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  lineHeight: "20px",
                }}
                onMouseEnter={() => setHoveredIndex(index)}
              >
                <motion.span
                  className="inline-block"
                  animate={{ x: active || isPassing ? 18 : isHovered ? 8 : 0 }}
                  transition={LINK_SPRING}
                  style={{ color: textColor }}
                >
                  {item.label}
                </motion.span>
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useMotionValue, useMotionValueEvent, animate } from "framer-motion";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { HERO_NAME } from "@/lib/bio-content";

const BLUR_EASE = [0.22, 1, 0.36, 1] as const;

const STAR_SPRING = { type: "spring" as const, stiffness: 300, damping: 34 };
const LINK_SPRING = { type: "spring" as const, stiffness: 400, damping: 25 };
const ROW_HEIGHT = 28;

// In-page anchors only — every nav target lives on the homepage.
const NAV_ITEMS = [
  { id: "home", label: "Home" },
  { id: "work", label: "Work" },
  { id: "playground", label: "Playground" },
];

const SCROLL_LOCK_MS = 900;

function useActiveSection() {
  const [activeId, setActiveId] = useState<string>(NAV_ITEMS[0].id);
  const lockUntilRef = useRef(0);

  useEffect(() => {
    const sections = NAV_ITEMS
      .map((item) => document.getElementById(item.id))
      .filter((el): el is HTMLElement => el !== null);

    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (Date.now() < lockUntilRef.current) return;
        // Pick the topmost section currently intersecting the upper band.
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActiveId(visible[0].target.id);
      },
      { rootMargin: "-20% 0px -60% 0px", threshold: 0 }
    );

    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  const setAndLock = (id: string) => {
    setActiveId(id);
    lockUntilRef.current = Date.now() + SCROLL_LOCK_MS;
  };

  return { activeId, setAndLock };
}

export default function HomeNav() {
  const { activeId, setAndLock } = useActiveSection();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const reducedMotion = usePrefersReducedMotion();
  const blurInitial = reducedMotion ? false : { opacity: 0, filter: "blur(12px)" };
  const blurAnimate = { opacity: 1, filter: "blur(0px)" };
  const blurTransition = { duration: 0.9, ease: BLUR_EASE };

  const starY = useMotionValue(0);
  const [passingIndex, setPassingIndex] = useState<number | null>(null);

  useMotionValueEvent(starY, "change", (y) => {
    setPassingIndex(Math.round(y / ROW_HEIGHT));
  });

  const activeIndex = NAV_ITEMS.findIndex((item) => item.id === activeId);

  useEffect(() => {
    if (activeIndex < 0) return;
    const controls = animate(starY, activeIndex * ROW_HEIGHT, STAR_SPRING);
    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIndex]);

  const handleClick = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    setAndLock(id);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <nav
      className="hidden lg:flex flex-col fixed top-12 left-6 z-40"
      style={{ width: "203px" }}
      aria-label="Primary"
    >
      {/* Name */}
      <motion.h1
        style={{ fontFamily: "var(--font-geist-mono), ui-monospace, Menlo, monospace", fontSize: "16px", fontWeight: 500, letterSpacing: "-0.01em", lineHeight: 1.2 }}
        initial={blurInitial}
        animate={blurAnimate}
        transition={blurTransition}
      >
        {HERO_NAME}
      </motion.h1>

      {/* Nav links with moving star */}
      <ul
        className="mt-6 flex flex-col gap-2 relative"
        onMouseLeave={() => setHoveredIndex(null)}
      >
        {activeIndex >= 0 && (
          <motion.span
            className="absolute left-0 pointer-events-none"
            style={{
              color: "var(--color-accent)",
              fontSize: "12px",
              lineHeight: "20px",
              y: starY,
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.15 }}
            aria-hidden
          >
            ✸
          </motion.span>
        )}
        {NAV_ITEMS.map((item, index) => {
          const active = item.id === activeId;
          const isHovered = hoveredIndex === index;
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
                  fontFamily: "var(--font-sans)",
                  fontSize: "15px",
                  fontWeight: 400,
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

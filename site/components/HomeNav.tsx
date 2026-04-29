"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useMotionValue, useMotionValueEvent, animate } from "framer-motion";
import HeroActions from "./HeroActions";
import ScrambleText from "./ScrambleText";
import { HERO_NAME } from "@/lib/bio-content";
import { typescale } from "@/lib/typography";
import { ExternalArrowIcon } from "./Icons";

const EXTERNAL_LINKS = [
  { label: "Email", href: "mailto:hello@marcosevilla.com", external: false },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/marcogsevilla/", external: true },
];

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

export default function HomeNav({ skipScramble = false }: { skipScramble?: boolean }) {
  const { activeId, setAndLock } = useActiveSection();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

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
      className="hidden lg:flex flex-col fixed top-12 z-40"
      style={{ left: "max(24px, calc(50vw - 275px - 203px - 32px))", width: "203px" }}
      aria-label="Primary"
    >
      {/* Name */}
      <h1 style={{ ...typescale.body, fontWeight: 500 }}>
        <ScrambleText text={HERO_NAME} skip={skipScramble} />
      </h1>

      {/* Action icons row, right below the name */}
      <div className="mt-3">
        <HeroActions />
      </div>

      {/* Nav links with moving star */}
      <ul
        className="mt-8 flex flex-col gap-2 relative"
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
                style={{ fontSize: "13px", fontWeight: 400, lineHeight: "20px" }}
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

      {/* External links — visually distinct from the in-page anchors above */}
      <ul className="mt-8 pt-6 flex flex-col gap-2 border-t border-(--color-border)">
        {EXTERNAL_LINKS.map((link) => (
          <li key={link.label}>
            <a
              href={link.href}
              {...(link.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              className="group inline-flex items-center gap-1.5 transition-colors text-(--color-fg-secondary) hover:text-(--color-accent)"
              style={{ fontSize: "13px", fontWeight: 400, lineHeight: "20px" }}
            >
              {link.label}
              <ExternalArrowIcon
                size={11}
                className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useMotionValue, useMotionValueEvent, animate } from "framer-motion";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import ConnectLinks from "./ConnectLinks";

const BLUR_EASE = [0.22, 1, 0.36, 1] as const;

const STAR_SPRING = { type: "spring" as const, stiffness: 300, damping: 34 };
const LINK_SPRING = { type: "spring" as const, stiffness: 400, damping: 25 };
const ROW_HEIGHT = 28;

// In-page anchors only — every nav target lives on the homepage.
const NAV_ITEMS = [
  { id: "home", label: "Home" },
  { id: "projects", label: "Work" },
  // Playground temporarily hidden for recruiter share.
  // { id: "playground", label: "Playground" },
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

    // Track every section currently in the active band — entries only
    // contain changed sections, so we can't rely on the latest batch alone.
    const intersecting = new Set<HTMLElement>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const el = entry.target as HTMLElement;
          if (entry.isIntersecting) intersecting.add(el);
          else intersecting.delete(el);
        }
        if (Date.now() < lockUntilRef.current) return;
        // Pick the topmost intersecting section. The `home` wrapper contains
        // the others, so prefer the bottom-most (most specific) match — but
        // when scrolling back up past `projects`, only `home` remains.
        const visible = Array.from(intersecting).sort(
          (a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top
        );
        // Prefer the deepest section: last one whose top is at or above the band.
        const chosen = visible[visible.length - 1] ?? visible[0];
        if (chosen) setActiveId(chosen.id);
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

export default function HomeNav({
  aboutMeOpen = false,
  onAboutMeClose,
  navRef,
}: {
  aboutMeOpen?: boolean;
  onAboutMeClose?: () => void;
  navRef?: React.Ref<HTMLElement>;
} = {}) {
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

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    setAndLock(id);
    const section = document.getElementById(id);
    if (!section) return;
    // Align the clicked nav link's top with the section's primary heading
    // so the two columns share a baseline. Falls back to section start.
    const heading = section.querySelector("h1, h2") as HTMLElement | null;
    const link = e.currentTarget;
    if (heading && link) {
      const linkTop = link.getBoundingClientRect().top;
      const headingDocTop = heading.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top: headingDocTop - linkTop, behavior: "smooth" });
      return;
    }
    section.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <nav
      ref={navRef}
      className="hidden lg:flex flex-col fixed top-1/2 z-40"
      // Anchor the nav to the left edge of the centered 650px body column
      // (with a 32px gap) so it reads as a second column of the page rather
      // than a viewport-edge floater. 325 = half of column width, 32 = gap,
      // 203 = nav width. The default top:50% + translateY(-50%) is the
      // SSR fallback; HomeLayout pins `top` to the wordmark's measured
      // position once mounted (and clears the transform).
      style={{
        width: "203px",
        left: "calc(50% - 325px - 32px - 203px)",
        transform: "translateY(-50%)",
      }}
      aria-label="Primary"
    >
      {/* Return link — appears above the primary nav while the About me
          carousel page is open. Same typographic scale as nav items. */}
      <AnimatePresence initial={false}>
        {aboutMeOpen && (
          <motion.button
            key="nav-return"
            type="button"
            onClick={onAboutMeClose}
            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
            animate={{ opacity: 1, height: "auto", marginBottom: 8 }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            transition={{ duration: 0.32, ease: BLUR_EASE }}
            className="group inline-flex items-center gap-1.5 transition-colors cursor-pointer focus:outline-none hover:text-(--color-accent) focus-visible:text-(--color-accent) self-start"
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "15px",
              fontWeight: 600,
              // line-height 1 keeps the cap-top at the box-top so the
              // button visually top-aligns with the About-me h1, which
              // also uses line-height 1.
              lineHeight: 1,
              color: "var(--color-fg-secondary)",
              background: "none",
              border: 0,
              padding: 0,
            }}
            aria-label="Return to home"
          >
            <span
              aria-hidden
              className="inline-block transition-transform duration-200 ease-out group-hover:-translate-x-1"
            >
              ←
            </span>
            <span>Return</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Nav links with moving star — hidden while the About-me page owns
          the column; only the Return link should remain visible. */}
      <ul
        className={`flex flex-col gap-2 relative${aboutMeOpen ? " hidden" : ""}`}
        onMouseLeave={() => setHoveredIndex(null)}
        aria-hidden={aboutMeOpen || undefined}
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
                  fontWeight: 600,
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

      {/* Connect — moved here from the bio so contact lives alongside nav.
          Wrapper margin + ConnectLinks's own mt-6 yields ~40px from last
          nav link, matching the prior Experience block's spacing. Hidden
          while the About-me page owns the column. */}
      {!aboutMeOpen && (
        <motion.div
          className="mt-4"
          initial={blurInitial}
          animate={blurAnimate}
          transition={{ ...blurTransition, delay: 0.15 }}
        >
          <ConnectLinks />
        </motion.div>
      )}

    </nav>
  );
}

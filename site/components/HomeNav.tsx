"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useMotionValue, useMotionValueEvent, animate } from "framer-motion";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import ConnectLinks from "./ConnectLinks";
import { ArrowRightIcon } from "./Icons";

const BLUR_EASE = [0.22, 1, 0.36, 1] as const;

const STAR_SPRING = { type: "spring" as const, stiffness: 300, damping: 34 };
const LINK_SPRING = { type: "spring" as const, stiffness: 400, damping: 25 };
const ROW_HEIGHT = 28;

// In-page anchors only — every nav target lives on the homepage. Exported
// so HamburgerMenu (compressed-mode replacement when the chat panel pushes
// the layout below xl) can render the same set of links.
export const HOME_NAV_ITEMS = [
  { id: "home", label: "Home" },
  { id: "projects", label: "Work" },
  { id: "playground", label: "Playground" },
];
const NAV_ITEMS = HOME_NAV_ITEMS;

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
  ready = true,
}: {
  aboutMeOpen?: boolean;
  onAboutMeClose?: () => void;
  navRef?: React.Ref<HTMLElement>;
  /** Gates the nav's blur-in. Hooked to HomeLayout's `heroReady` so it
   *  joins the cascade triggered by the loader's star landing. */
  ready?: boolean;
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
    <motion.nav
      ref={navRef}
      className="chat-cmp-hide hidden lg:flex flex-col fixed top-1/2 z-40"
      // Pinned to the viewport's left edge with a 12px gutter. Prior version
      // anchored to the centered 650px column ('calc(50% - 325 - 32 - 203)'),
      // but that math doesn't account for the chat side panel pushing <body>
      // left when open — the nav stayed put while content moved, overlapping
      // the bio. Viewport-pinned avoids the overlap; the nav becomes a true
      // viewport-edge rail. Below xl-with-chat-open, .chat-cmp-hide hides it
      // and HamburgerMenu takes over.
      style={{
        width: "203px",
        left: "12px",
        transform: "translateY(-50%)",
      }}
      aria-label="Primary"
      initial={reducedMotion ? false : { opacity: 0, filter: "blur(12px)" }}
      animate={
        reducedMotion
          ? undefined
          : {
              opacity: ready ? 1 : 0,
              filter: ready ? "blur(0px)" : "blur(12px)",
            }
      }
      transition={{ duration: 0.9, ease: BLUR_EASE, delay: 0.08 }}
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
              fontFamily: "var(--font-geist-mono), ui-monospace, Menlo, monospace",
              fontSize: "12px",
              fontWeight: 500,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
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
              className="inline-flex items-center transition-transform duration-200 ease-out group-hover:-translate-x-1"
            >
              <span style={{ display: "inline-flex", transform: "scaleX(-1)" }}>
                <ArrowRightIcon size={14} />
              </span>
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
            className="absolute left-0 pointer-events-none flex items-center"
            style={{
              color: "var(--color-accent)",
              fontSize: "18px",
              height: "20px",
              lineHeight: 1,
              fontWeight: 500,
              y: starY,
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.15 }}
            aria-hidden
          >
            *
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
                  fontFamily: "var(--font-geist-mono), ui-monospace, Menlo, monospace",
                  fontSize: "12px",
                  fontWeight: 500,
                  lineHeight: "20px",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
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

    </motion.nav>
  );
}

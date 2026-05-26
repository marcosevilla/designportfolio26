"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import HeaderToolbar from "./HeaderToolbar";
import LocalStatus from "./LocalStatus";
import { HERO_NAME } from "@/lib/bio-content";
import { useAudioPlayer } from "@/lib/AudioPlayerContext";
import { useNavOverlay } from "@/lib/NavOverlayContext";
import { useChatOverlay } from "@/lib/ChatOverlayContext";

/** Hamburger / close glyph. Two stacked lines when closed, rotated
 *  cross when open — single SVG so the swap can animate cleanly. */
function HamburgerCloseIcon({ open, size = 16 }: { open: boolean; size?: number }) {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      animate={{ rotate: open ? 90 : 0 }}
      transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
      aria-hidden
    >
      <motion.line
        x1="2"
        y1="5"
        x2="14"
        y2="5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        animate={
          open
            ? { x1: 3, y1: 3, x2: 13, y2: 13 }
            : { x1: 2, y1: 5, x2: 14, y2: 5 }
        }
        transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
      />
      <motion.line
        x1="2"
        y1="11"
        x2="14"
        y2="11"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        animate={
          open
            ? { x1: 3, y1: 13, x2: 13, y2: 3 }
            : { x1: 2, y1: 11, x2: 14, y2: 11 }
        }
        transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
      />
    </motion.svg>
  );
}

/** Global site header. Full-width fixed bar at the top with an opaque
 *  page-bg fill so content scrolls cleanly behind it. The wordmark sits
 *  flush-left, the HeaderToolbar contents sit flush-right. A 1px bottom
 *  stroke appears once the user has scrolled past the header so the
 *  boundary against content is legible. Mounted in app/layout.tsx so it
 *  appears on every route. */
export default function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const { overlayOpen } = useAudioPlayer();
  const { navOpen, toggleNav } = useNavOverlay();
  const { chatOpen } = useChatOverlay();
  const headerHidden = overlayOpen || chatOpen;
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleWordmarkClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (pathname === "/") {
      e.preventDefault();
      // Tell HomeLayout to drop About mode (if open) and scroll to top.
      window.dispatchEvent(new CustomEvent("home:return"));
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    // Different route: let Next.js Link navigate to "/", which renders
    // the home page scrolled to the top by default.
  };

  return (
    <AnimatePresence>
      {!headerHidden && (
    <motion.header
      key="site-header"
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
      className="fixed top-0 left-0 right-0 z-[80]"
      style={{
        backgroundColor: "var(--color-bg)",
        borderBottom: "1px solid",
        borderBottomColor: scrolled
          ? "color-mix(in srgb, var(--color-border) 80%, transparent)"
          : "transparent",
        transition: "border-color 200ms ease-out",
      }}
    >
      {/* Header bar is laid out in three layers so the wordmark and
          LocalStatus can align with the centered 800px body content
          while the hamburger and toolbar stay flush to the viewport
          edges. */}
      <div className="relative h-14">
        {/* Hamburger — flush left of viewport. */}
        <button
          type="button"
          onClick={toggleNav}
          aria-label={navOpen ? "Close navigation" : "Open navigation"}
          aria-expanded={navOpen}
          className="absolute top-1/2 -translate-y-1/2 left-4 sm:left-6 inline-flex items-center justify-center w-8 h-8 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-(--color-accent) cursor-pointer text-(--color-fg) hover:text-(--color-accent)"
          style={{ borderRadius: 4 }}
        >
          <HamburgerCloseIcon open={navOpen} size={16} />
        </button>

        {/* Content-aligned row — same max-w and centering as the page
            body, so the wordmark sits at the body's left edge and
            LocalStatus at its right edge. */}
        <div className="h-full mx-auto max-w-[800px] px-4 flex items-center justify-between">
          <Link
            href="/"
            onClick={handleWordmarkClick}
            aria-label="Marco Sevilla — home"
            className="inline-flex items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-(--color-accent)"
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: 16,
              fontWeight: 500,
              letterSpacing: "-0.01em",
              lineHeight: 1,
              color: "var(--color-fg)",
              textDecoration: "none",
            }}
          >
            {HERO_NAME}
          </Link>
          <LocalStatus />
        </div>

        {/* Toolbar — flush right of viewport. */}
        <div className="absolute top-1/2 -translate-y-1/2 right-4 sm:right-6">
          <HeaderToolbar />
        </div>
      </div>
    </motion.header>
      )}
    </AnimatePresence>
  );
}

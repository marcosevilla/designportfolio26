"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import HeaderToolbar from "./HeaderToolbar";
import LocalStatus from "./LocalStatus";
import { HERO_NAME } from "@/lib/bio-content";
import { useNavOverlay } from "@/lib/NavOverlayContext";
import { useChatOverlay } from "@/lib/ChatOverlayContext";
import { useAudioPlayer } from "@/lib/AudioPlayerContext";

/** Sidebar / panel-open glyph: a rounded rectangle with a vertical
 *  divider near the left edge — reads as "open the left panel". The
 *  divider slides right and a chevron emerges when the panel is open,
 *  signalling the inverse action (collapse). */
function HamburgerCloseIcon({ open, size = 16 }: { open: boolean; size?: number }) {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden
    >
      {/* Frame */}
      <rect
        x="1.75"
        y="2.75"
        width="12.5"
        height="10.5"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.3"
      />
      {/* Sidebar fill — fades in once the panel is open so the glyph
          reads as "panel is showing" / click to close. */}
      <motion.rect
        x="2.4"
        y="3.4"
        width="3.2"
        height="9.2"
        rx="0.8"
        fill="currentColor"
        initial={false}
        animate={{ opacity: open ? 1 : 0 }}
        transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
      />
      {/* Divider stroke — always visible; demarcates the sidebar
          region from the content area. */}
      <line
        x1="5.6"
        y1="3.25"
        x2="5.6"
        y2="12.75"
        stroke="currentColor"
        strokeWidth="1.3"
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
  const { navOpen, toggleNav } = useNavOverlay();
  const { chatOpen } = useChatOverlay();
  const { overlayOpen: musicOverlayOpen, setOverlayOpen: setMusicOverlayOpen } =
    useAudioPlayer();
  // Music overlay deliberately keeps the header visible so the palette /
  // theme controls in HeaderToolbar stay reachable while the player is open.
  const headerHidden = chatOpen;
  const pathname = usePathname();

  // On the home page the wordmark is suppressed until the user has
  // scrolled past the bio (Marco's name + tagline + bio paragraphs are
  // already on screen, so the wordmark would duplicate the page heading).
  // Other routes show it immediately. The music overlay covers the bio,
  // so the wordmark is forced on while it's open.
  const [scrolledPast, setScrolledPast] = useState(pathname !== "/");
  useEffect(() => {
    if (pathname !== "/") {
      setScrolledPast(true);
      return;
    }
    const THRESHOLD = 280;
    const onScroll = () => setScrolledPast(window.scrollY > THRESHOLD);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [pathname]);
  const showWordmark = scrolledPast || musicOverlayOpen;

  // Drop shadow appears the moment any content scrolls under the bar, so
  // the header lifts off the page. Separate from `scrolledPast` (which is
  // a much larger threshold for the wordmark) and runs on every route.
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 2);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleWordmarkClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Always dismiss any overlay covering the page so "go home" is
    // visually honored regardless of what surface the user clicked from.
    if (musicOverlayOpen) setMusicOverlayOpen(false);

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
      className="fixed top-0 left-0 right-0 z-[130]"
      style={{
        backgroundColor: "var(--color-bg)",
        backgroundImage: "var(--grain-image)",
        backgroundSize: "200px 200px",
        backgroundBlendMode: "multiply",
        borderBottom:
          "0.5px solid color-mix(in srgb, var(--color-fg) 16%, transparent)",
        boxShadow: scrolled
          ? "0 3px 10px -7px color-mix(in srgb, var(--color-fg) 16%, transparent)"
          : "0 3px 10px -7px transparent",
        transition: "box-shadow 280ms cubic-bezier(0.22, 1, 0.36, 1)",
      }}
    >
      {/* Full-width bar — left cluster flush to the viewport's left
          edge, right cluster flush to its right edge, no body-content
          alignment constraint. */}
      <div className="relative h-11">
        <div className="h-full px-3 sm:px-4 flex items-center">
          {/* Left cluster — hamburger sits at the content's left edge;
              the wordmark appears to its right once the user has scrolled
              past the bio. */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleNav}
              aria-label={navOpen ? "Close navigation" : "Open navigation"}
              aria-expanded={navOpen}
              className="inline-flex items-center justify-center w-8 h-8 rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-(--color-accent) cursor-pointer text-(--color-fg-secondary) hover:text-(--color-accent) focus-visible:text-(--color-accent)"
            >
              <HamburgerCloseIcon open={navOpen} size={15} />
            </button>

            <AnimatePresence initial={false}>
              {showWordmark && (
                <motion.div
                  key="wordmark"
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                >
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
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right cluster — ml-auto keeps it flush-right against the
              content edge whether or not the wordmark is rendered. */}
          <div className="ml-auto flex items-center gap-3">
            <LocalStatus />
            <HeaderToolbar />
          </div>
        </div>
      </div>
    </motion.header>
      )}
    </AnimatePresence>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { HighlighterIcon, EraserIcon } from "./Icons";
import HeroActions from "./HeroActions";
import PaletteSwatches from "./PaletteSwatches";
import HomeMiniPlayer from "./music/HomeMiniPlayer";
import Marquee from "./Marquee";
import { useMarquee } from "./MarqueeContext";
import { useAudioPlayer } from "@/lib/AudioPlayerContext";
import { useHighlighter } from "./HighlighterContext";
import LocalStatus from "./LocalStatus";

const STICKY_SPRING = { type: "spring" as const, stiffness: 320, damping: 32 };

/**
 * Icon row + the dropdowns it controls. Lives at the very top of the hero
 * column so it lines up vertically with "Marco Sevilla" in the sidebar at
 * lg+ (both anchored to `lg:pt-12`). On mobile it sits between the sticky
 * name header and the LED matrix.
 *
 * On scroll-past, a duplicate of the icon row + its dropdowns slides down from
 * above and pins to the top of the viewport. State (paletteOpen / miniPlayer /
 * marquee) is shared so toggling from either surface is in sync. The dropdowns
 * are rendered in only one location at a time (whichever toolbar is "owner")
 * so they animate cleanly without duplication.
 */
export default function HeroToolbar() {
  const audio = useAudioPlayer();
  const marquee = useMarquee();
  const { active, setActive, highlight, setHighlight } = useHighlighter();
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [stickyActive, setStickyActive] = useState(false);
  const [mounted, setMounted] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);

  // Portal target — `document` only exists after hydration, so guard with a
  // mounted flag. The sticky bar must render at <body> level to escape Hero's
  // `motion.div` ancestors, which animate `filter` and become the containing
  // block for any `position: fixed` descendant.
  useEffect(() => setMounted(true), []);

  // Mutex: at most one toolbar dropdown can be open at a time.
  const togglePalette = () => {
    if (paletteOpen) {
      setPaletteOpen(false);
    } else {
      setPaletteOpen(true);
      audio.setMiniPlayerOpen(false);
      marquee.setVisible(false);
    }
  };
  const toggleMusic = () => {
    if (audio.miniPlayerOpen) {
      audio.setMiniPlayerOpen(false);
    } else {
      audio.setMiniPlayerOpen(true);
      setPaletteOpen(false);
      marquee.setVisible(false);
    }
  };
  const toggleQuotes = () => {
    if (marquee.visible) {
      marquee.setVisible(false);
    } else {
      marquee.setVisible(true);
      setPaletteOpen(false);
      audio.setMiniPlayerOpen(false);
    }
  };

  // Activate the floating sticky toolbar once the original has scrolled fully
  // out of view. IntersectionObserver fires on cross — no scroll listener tax.
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setStickyActive(!entry.isIntersecting),
      { threshold: 0, rootMargin: "0px 0px 0px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Click-outside: any pointerdown outside the in-flow wrapper AND the sticky
  // wrapper closes whichever dropdown is currently open. Mutex above guarantees
  // at most one is open, so resetting all three is safe and idempotent.
  useEffect(() => {
    const anyOpen = paletteOpen || audio.miniPlayerOpen || marquee.visible;
    if (!anyOpen) return;
    const handle = (e: PointerEvent) => {
      const target = e.target as Node;
      if (wrapperRef.current?.contains(target)) return;
      if (stickyRef.current?.contains(target)) return;
      setPaletteOpen(false);
      audio.setMiniPlayerOpen(false);
      marquee.setVisible(false);
    };
    document.addEventListener("pointerdown", handle);
    return () => document.removeEventListener("pointerdown", handle);
  }, [paletteOpen, audio.miniPlayerOpen, marquee.visible, audio, marquee]);

  const iconRow = (
    <div className="flex items-center gap-2">
      <LocalStatus />
      <div className="ml-auto flex items-center gap-1">
        <HeroActions
          paletteOpen={paletteOpen}
          miniPlayerOpen={audio.miniPlayerOpen}
          marqueeVisible={marquee.visible}
          onTogglePalette={togglePalette}
          onToggleMusic={toggleMusic}
          onToggleQuotes={toggleQuotes}
        />
        <button
          type="button"
          aria-label={active ? "Disable highlighter" : "Enable highlighter"}
          aria-pressed={active}
          onClick={() => setActive((a) => !a)}
          className={`bio-toolbar-btn${active ? " bio-toolbar-btn--active" : ""}`}
        >
          <HighlighterIcon size={16} />
        </button>
        {highlight && (
          <button
            type="button"
            aria-label="Clear highlight"
            onClick={() => setHighlight(null)}
            className="bio-toolbar-btn"
          >
            <EraserIcon size={16} />
          </button>
        )}
      </div>
    </div>
  );

  const dropdowns = (
    <>
      <PaletteSwatches open={paletteOpen} />
      <HomeMiniPlayer />
      <Marquee />
    </>
  );

  return (
    <>
      <div ref={wrapperRef}>
        <div ref={sentinelRef}>{iconRow}</div>
        {/* Dropdowns are owned by the in-flow toolbar unless the sticky one
            is active, so they animate from a single location at a time. */}
        {!stickyActive && dropdowns}
      </div>

      {mounted && createPortal(
        <AnimatePresence>
          {stickyActive && (
            <motion.div
              ref={stickyRef}
              key="hero-toolbar-sticky"
              className="fixed top-3 left-0 right-0 z-50 pointer-events-none"
              initial={{ y: -120, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -120, opacity: 0 }}
              transition={STICKY_SPRING}
            >
              {/* Mirror HomeLayout's body wrapper: max-w-[550px] mx-auto with
                  px-4 sm:px-8 padding so the sticky bar's outer box matches the
                  550px body column and its inner content edges line up with the
                  in-flow toolbar's icon row. */}
              <div
                className="max-w-[550px] mx-auto px-4 sm:px-8 pointer-events-auto"
                style={{ filter: "var(--bio-dropdown-shadow)" }}
              >
                <div
                  className="bio-dropdown-container"
                  style={{ padding: "10px 12px" }}
                >
                  {iconRow}
                </div>
                {dropdowns}
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}

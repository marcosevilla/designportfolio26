"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import HeroActions from "./HeroActions";
import { PaletteRow } from "./PaletteSwatches";
import { MiniPlayerRow, VisualsRow } from "./music/HomeMiniPlayer";
import { useAudioPlayer } from "@/lib/AudioPlayerContext";
import LocalStatus from "./LocalStatus";

const STICKY_SPRING = { type: "spring" as const, stiffness: 320, damping: 32 };
const SLOT_EASE = [0.22, 1, 0.36, 1] as const;
const SLOT_TRAVEL = 32; // px — full row height; old slides down out, new slides down in.
const IDLE_CYCLE_MS = 6000; // status ↔ now-playing alternation when music is on.

type SlotKind = "status" | "now-playing" | "palette" | "music" | "visuals";

function NowPlayingStatus({ title, artist }: { title: string; artist: string }) {
  return (
    <div
      className="min-w-0"
      style={{
        fontFamily: "var(--font-geist-mono), ui-monospace, Menlo, monospace",
        fontSize: "11px",
        lineHeight: "15px",
        color: "var(--color-fg)",
      }}
    >
      <p className="truncate">
        Now playing:{" "}
        <span style={{ fontWeight: 600 }}>{title}</span>
        {" / "}
        <span style={{ fontWeight: 400 }}>{artist}</span>
      </p>
    </div>
  );
}

/**
 * Single-row toolbar at the top of the hero column. Right side holds icon
 * buttons (palette / music / visuals); left side is a swap zone that shows
 * LocalStatus by default, replaced inline by the active dropdown's controls.
 *
 * The slide animation is owned here: when the active slot changes, the old
 * content slides down out of frame and the new content slides down into
 * frame. Mutex enforced — at most one dropdown active at a time.
 *
 * On scroll-past, a sticky portal-mounted twin pins to the top of the
 * viewport. Both surfaces share state, so they always show the same slot.
 */
export default function HeroToolbar() {
  const audio = useAudioPlayer();
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [visualsOpen, setVisualsOpen] = useState(false);
  const [idleSlot, setIdleSlot] = useState<"status" | "now-playing">("status");
  const [stickyActive, setStickyActive] = useState(false);
  const [mounted, setMounted] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);

  // Portal target — `document` only exists after hydration.
  useEffect(() => setMounted(true), []);

  const closeAll = () => {
    setPaletteOpen(false);
    audio.setMiniPlayerOpen(false);
    setVisualsOpen(false);
  };

  const togglePalette = () => {
    if (paletteOpen) {
      setPaletteOpen(false);
    } else {
      audio.setMiniPlayerOpen(false);
      setVisualsOpen(false);
      setPaletteOpen(true);
    }
  };
  const toggleMusic = () => {
    if (audio.miniPlayerOpen) {
      audio.setMiniPlayerOpen(false);
    } else {
      setPaletteOpen(false);
      setVisualsOpen(false);
      audio.setMiniPlayerOpen(true);
    }
  };
  const toggleVisuals = () => {
    if (visualsOpen) {
      setVisualsOpen(false);
    } else {
      setPaletteOpen(false);
      audio.setMiniPlayerOpen(false);
      setVisualsOpen(true);
    }
  };

  const idle = !paletteOpen && !audio.miniPlayerOpen && !visualsOpen;

  const activeSlot: SlotKind =
    paletteOpen ? "palette" :
    audio.miniPlayerOpen ? "music" :
    visualsOpen ? "visuals" :
    idleSlot;

  // Ambient cycling: when nothing is toggled and music is playing, alternate
  // the LocalStatus slot between weather/time and "Now playing: …". On any
  // dropdown open or pause, snap back to status so the next idle reveal
  // doesn't surprise with the wrong content.
  useEffect(() => {
    if (!idle || !audio.isPlaying) {
      setIdleSlot("status");
      return;
    }
    const id = setInterval(() => {
      setIdleSlot((prev) => (prev === "status" ? "now-playing" : "status"));
    }, IDLE_CYCLE_MS);
    return () => clearInterval(id);
  }, [idle, audio.isPlaying]);

  // Activate the floating sticky toolbar once the in-flow row is fully out.
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setStickyActive(!entry.isIntersecting),
      { threshold: 0, rootMargin: "0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Click-outside: any pointerdown outside both wrappers closes the active slot.
  useEffect(() => {
    if (activeSlot === "status") return;
    const handle = (e: PointerEvent) => {
      const target = e.target as Node;
      if (wrapperRef.current?.contains(target)) return;
      if (stickyRef.current?.contains(target)) return;
      closeAll();
    };
    document.addEventListener("pointerdown", handle);
    return () => document.removeEventListener("pointerdown", handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSlot]);

  const renderSlot = (slot: SlotKind) => {
    switch (slot) {
      case "palette":     return <PaletteRow />;
      case "music":       return <MiniPlayerRow />;
      case "visuals":     return <VisualsRow />;
      case "now-playing": return <NowPlayingStatus title={audio.currentTrack.title} artist={audio.currentTrack.artist} />;
      default:            return <LocalStatus />;
    }
  };

  const iconRow = (
    <div className="flex items-center gap-2">
      {/* Left swap zone — fixed 32px height, clips the off-frame content
          while the slide animation runs. AnimatePresence keys on activeSlot
          so old/new co-exist briefly during the transition. */}
      <div className="relative flex-1 min-w-0 h-8 overflow-hidden">
        <AnimatePresence initial={false}>
          <motion.div
            key={activeSlot}
            initial={{ y: -SLOT_TRAVEL, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: SLOT_TRAVEL, opacity: 0 }}
            transition={{ duration: 0.5, ease: SLOT_EASE }}
            className="absolute inset-0 flex items-center"
          >
            {renderSlot(activeSlot)}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        <HeroActions
          paletteOpen={paletteOpen}
          miniPlayerOpen={audio.miniPlayerOpen}
          visualsOpen={visualsOpen}
          onTogglePalette={togglePalette}
          onToggleMusic={toggleMusic}
          onToggleVisuals={toggleVisuals}
        />
      </div>
    </div>
  );

  return (
    <>
      <div ref={wrapperRef}>
        <div ref={sentinelRef}>{iconRow}</div>
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
              <div className="max-w-[600px] mx-auto px-4 sm:px-8 pointer-events-auto">
                <div className="hero-sticky-toolbar">
                  <div style={{ padding: "4px 4px" }}>{iconRow}</div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}

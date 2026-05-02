"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import HeroActions from "./HeroActions";
import ChatBar from "./chat/ChatBar";
import LedMatrix from "./LedMatrix";
import { PaletteRow } from "./PaletteSwatches";
import { MiniPlayerRow, VisualsRow } from "./music/HomeMiniPlayer";
import { useAudioPlayer } from "@/lib/AudioPlayerContext";
import { useStickyToolbarActive } from "@/lib/StickyToolbarContext";
import LocalStatus from "./LocalStatus";
import CyclingGreeting from "./CyclingGreeting";

const STICKY_SPRING = { type: "spring" as const, stiffness: 320, damping: 32 };
const SLOT_EASE = [0.22, 1, 0.36, 1] as const;
const SLOT_TRAVEL = 32; // px — full row height; old slides down out, new slides down in.
const IDLE_CYCLE_MS = 6000; // status ↔ now-playing alternation when music is on.
const STICKY_LED_HEIGHT = 100; // half-height variant embedded in the sticky bar.

type SlotKind = "status" | "now-playing" | "greeting" | "palette" | "music" | "visuals";
type IdleSlot = "status" | "now-playing" | "greeting";

function NowPlayingStatus({ title, artist }: { title: string; artist: string }) {
  return (
    <div
      className="min-w-0 flex items-center gap-1.5"
      style={{
        fontFamily: "var(--font-geist-mono), ui-monospace, Menlo, monospace",
        fontSize: "11px",
        lineHeight: "15px",
        fontWeight: 400,
        color: "var(--color-fg-secondary)",
      }}
    >
      <motion.span
        aria-hidden
        className="inline-flex shrink-0"
        style={{ color: "var(--color-accent)" }}
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
      >
        <SpinningDiscIcon size={16} />
      </motion.span>
      <p className="truncate">
        {title} <span aria-hidden>·</span> {artist}
      </p>
    </div>
  );
}

function SpinningDiscIcon({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" fill="none">
      {/* Filled disc body */}
      <circle cx="6" cy="6" r="5.6" fill="currentColor" />
      {/* Off-axis shimmer arc — makes rotation legible */}
      <path
        d="M2.6 3.7 A 5 5 0 0 1 8.6 1.7"
        stroke="white"
        strokeOpacity="0.7"
        strokeWidth="0.8"
        strokeLinecap="round"
        fill="none"
      />
      {/* Secondary smaller shimmer for extra glint */}
      <circle cx="3.5" cy="8.2" r="0.45" fill="white" fillOpacity="0.45" />
      {/* Inner label ring (lighter so it pops on the filled body) */}
      <circle cx="6" cy="6" r="2" fill="var(--color-bg)" />
      {/* Spindle hole */}
      <circle cx="6" cy="6" r="0.55" fill="currentColor" />
    </svg>
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
  // Greeting cycle hidden by default for recruiter share.
  const [greetingActive, setGreetingActive] = useState(false);
  const [idleSlot, setIdleSlot] = useState<IdleSlot>("status");
  const stickyActive = useStickyToolbarActive();
  const [mounted, setMounted] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
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

  // Ambient cycling:
  //   • Smiley ON  → slot is locked to "greeting" so the typewriter cycle
  //     plays uninterrupted.
  //   • Smiley OFF → rotate "status" ↔ "now-playing" (when music plays).
  //   • Any dropdown open → pre-seed the next idle slot for a clean reveal.
  useEffect(() => {
    if (!idle) {
      setIdleSlot(greetingActive ? "greeting" : "status");
      return;
    }
    if (greetingActive) {
      setIdleSlot("greeting");
      return;
    }
    setIdleSlot((prev) => (prev === "greeting" ? "status" : prev));
    const id = setInterval(() => {
      setIdleSlot((prev) => {
        const order: IdleSlot[] = audio.isPlaying
          ? ["status", "now-playing"]
          : ["status"];
        const i = order.indexOf(prev);
        return order[(i + 1) % order.length] ?? "status";
      });
    }, IDLE_CYCLE_MS);
    return () => clearInterval(id);
  }, [idle, audio.isPlaying, greetingActive]);

  // Auto-close the visuals slot when music stops — the eye icon disappears
  // alongside it, so leaving it open would orphan the embedded LED.
  useEffect(() => {
    if (!audio.isPlaying && visualsOpen) setVisualsOpen(false);
  }, [audio.isPlaying, visualsOpen]);

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
      case "greeting":    return <CyclingGreeting compact />;
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
          greetingActive={greetingActive}
          showVisuals={audio.isPlaying}
          onTogglePalette={togglePalette}
          onToggleMusic={toggleMusic}
          onToggleVisuals={toggleVisuals}
          onToggleGreeting={() => setGreetingActive((prev) => !prev)}
        />
      </div>
    </div>
  );

  return (
    <>
      {/* In-flow toolbar: icon row + chat pill side by side.
          ChatBar is rendered ONLY here (not inside iconRow) to avoid a
          layoutId collision — iconRow is also rendered in the sticky portal
          variant, and two simultaneous <ChatBar /> instances with the same
          layoutId="chat-surface" would trigger a framer-motion warning.
          v1 limitation: the chat pill does not appear in the sticky toolbar. */}
      <div ref={wrapperRef} className="flex items-center gap-1.5">
        {iconRow}
        <ChatBar />
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
              {/* Wider than the in-flow column (650 → 672px) so the chrome's
                  1px border + 10px inner padding offset cancels out, keeping
                  the icons in the row at the same x-coords as the in-flow
                  toolbar above the wordmark. */}
              <div className="max-w-[672px] mx-auto px-4 sm:px-8 pointer-events-auto">
                <div className="hero-sticky-toolbar">
                  <div style={{ padding: "4px 10px" }}>{iconRow}</div>
                  {/* Embedded half-height visualizer. Mounting is gated on
                      `visualsOpen` so the LedMatrix runs its diagonal intro
                      wave each time the eye icon is toggled — same entrance
                      as the home page's main visualizer. */}
                  <AnimatePresence initial={false}>
                    {visualsOpen && (
                      <motion.div
                        key="sticky-led"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: STICKY_LED_HEIGHT + 22, opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.32, ease: SLOT_EASE }}
                        style={{ overflow: "hidden" }}
                      >
                        <div style={{ padding: "12px 10px 10px" }}>
                          <LedMatrix height={STICKY_LED_HEIGHT} />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
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

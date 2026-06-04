"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAudioPlayer } from "@/lib/AudioPlayerContext";
import { useVisualizerScene } from "@/lib/VisualizerSceneContext";
import { SCENES } from "@/lib/visualizer-scenes";
import LedMatrix from "@/components/LedMatrix";
import InsetScrubber from "@/components/music/InsetScrubber";
import {
  PlayIcon,
  PauseIcon,
  SkipBackIcon,
  SkipForwardIcon,
} from "@/components/Icons";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const BLUR_EASE = [0.22, 1, 0.36, 1] as const;

/** Picture-in-picture-style glyph: a frame with a filled rectangle in
 *  the bottom-right corner, suggesting the music UI collapsing into the
 *  bottom-right mini widget. */
function MinimizeIcon({ size = 14, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      className={className}
      aria-hidden
    >
      <rect
        x="1.5"
        y="1.5"
        width="13"
        height="13"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <rect x="8" y="8" width="6" height="6" fill="currentColor" />
    </svg>
  );
}

function formatTime(sec: number): string {
  if (!isFinite(sec) || sec < 0) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function TransportButton({
  label,
  tooltip,
  onClick,
  children,
  emphasized = false,
}: {
  label: string;
  tooltip?: string;
  onClick: () => void;
  children: React.ReactNode;
  emphasized?: boolean;
}) {
  // Emphasized (play/pause) buttons keep the larger 56×56 footprint but
  // share the same hover treatment as the rest of the icon-button family:
  // accent text + 10% accent-tinted bg, 4px radius.
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <button
            type="button"
            onClick={onClick}
            aria-label={label}
            className="bio-toolbar-btn focus:outline-none focus-visible:ring-2 focus-visible:ring-(--color-accent)"
            style={
              emphasized ? { width: 56, height: 56 } : undefined
            }
          />
        }
      >
        {children}
      </TooltipTrigger>
      <TooltipContent>{tooltip ?? label}</TooltipContent>
    </Tooltip>
  );
}

/** Numbered visualizer toggles — replaces the icon-based SceneToggles for
 *  the overlay. Each scene is represented by its position (1-N); hovering
 *  surfaces the scene's label via the shared shadcn tooltip. Multiple
 *  scenes can be active simultaneously (the underlying context supports
 *  it), so the active state is a tinted fill rather than a radio. */
function NumberedSceneToggles() {
  const { activeScenes, toggleScene } = useVisualizerScene();

  return (
    <div className="flex items-center justify-center gap-1.5">
      {SCENES.map((s, idx) => {
        const active = activeScenes.has(s.id);
        return (
          <Tooltip key={s.id}>
            <TooltipTrigger
              render={
                <button
                  type="button"
                  onClick={() => toggleScene(s.id)}
                  aria-label={`Toggle ${s.label} scene`}
                  aria-pressed={active}
                  className={`bio-toolbar-btn${active ? " bio-toolbar-btn--active" : ""} focus:outline-none focus-visible:ring-2 focus-visible:ring-(--color-accent)`}
                />
              }
            >
              <span
                style={{
                  fontFamily:
                    "var(--font-geist-mono), ui-monospace, Menlo, monospace",
                  fontSize: 11,
                  fontWeight: 500,
                  lineHeight: 1,
                }}
              >
                {idx + 1}
              </span>
            </TooltipTrigger>
            <TooltipContent>{s.label}</TooltipContent>
          </Tooltip>
        );
      })}
    </div>
  );
}

/** Full-screen music overlay. Opens when overlayOpen flips true (toggled
 *  via the music button in HeaderToolbar). Renders centered LED matrix +
 *  scene toggles + scrubber + always-visible transport controls + track
 *  info. Page chrome (SiteHeader / MobileSectionNav) is hidden by their
 *  own components when overlayOpen is true. */
export default function MusicOverlay() {
  const {
    overlayOpen,
    isPlaying,
    currentTrack,
    currentTime,
    duration,
    togglePlay,
    next,
    prev,
    seek,
    setOverlayOpen,
  } = useAudioPlayer();

  const close = () => setOverlayOpen(false);

  // Esc closes the overlay.
  useEffect(() => {
    if (!overlayOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOverlayOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [overlayOpen, setOverlayOpen]);

  const [mounted, setMounted] = useState(false);
  const [scrubbing, setScrubbing] = useState(false);
  const [scrubValue, setScrubValue] = useState(0);
  const displayTime = scrubbing ? scrubValue : currentTime;

  // Direction of the most recent track skip, used to drive the
  // slide-in/out animation on the title+artist block. Updated by the
  // prev/next handlers below.
  const [skipDir, setSkipDir] = useState<"forward" | "backward">("forward");
  const handleNext = () => {
    setSkipDir("forward");
    next();
  };
  const handlePrev = () => {
    setSkipDir("backward");
    prev();
  };

  useEffect(() => setMounted(true), []);

  // Lock body scroll while overlay is open.
  useEffect(() => {
    if (!overlayOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [overlayOpen]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {overlayOpen && (
        <motion.div
          key="music-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.28, ease: BLUR_EASE }}
          className="fixed inset-0 z-[120] flex items-center justify-center px-4"
          // Solid page bg so content underneath isn't visible at all —
          // the overlay fully owns the viewport while open.
          style={{ backgroundColor: "var(--color-bg)" }}
          aria-modal="true"
          role="dialog"
          aria-label="Music player"
        >
          <TooltipProvider delay={100}>
          <motion.div
            initial={{ opacity: 0, y: 16, filter: "blur(12px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: 16, filter: "blur(12px)" }}
            transition={{ duration: 0.42, ease: BLUR_EASE }}
            className="w-full max-w-[550px] flex flex-col gap-2"
            onClick={(e) => e.stopPropagation()}
          >
            {/* LED matrix — width matches the player card column below
                (550px). Width fills the centered column. */}
            <div className="relative">
              <LedMatrix height={226} />
            </div>

            {/* Spotify-style player row. Left: track info. Center:
                transport controls + scrubber. Right: visualizer toggles
                + shrink-to-mini-widget button. Controls sit directly on
                the overlay background — no card chrome. */}
            <div className="mx-auto w-full max-w-[550px] flex flex-col gap-2">
              <div className="flex items-center gap-4">
              {/* Left — track title + artist, flush-left. Slides + blurs
                  between tracks: leaving track exits in the skip direction,
                  incoming track enters from the opposite side. */}
              <div className="relative flex flex-col min-w-0 shrink basis-0 grow overflow-hidden">
                <AnimatePresence mode="wait" initial={false} custom={skipDir}>
                  <motion.div
                    key={`${currentTrack.title}-${currentTrack.artist}`}
                    custom={skipDir}
                    variants={{
                      enter: (dir: "forward" | "backward") => ({
                        x: dir === "forward" ? 24 : -24,
                        opacity: 0,
                        filter: "blur(8px)",
                      }),
                      center: { x: 0, opacity: 1, filter: "blur(0px)" },
                      exit: (dir: "forward" | "backward") => ({
                        x: dir === "forward" ? -24 : 24,
                        opacity: 0,
                        filter: "blur(8px)",
                      }),
                    }}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                    className="flex flex-col min-w-0 gap-1"
                  >
                    <p
                      className="truncate"
                      style={{
                        fontFamily: "var(--font-sans)",
                        fontSize: 14,
                        fontWeight: 500,
                        color: "var(--color-fg)",
                        letterSpacing: "-0.01em",
                        lineHeight: 1.25,
                      }}
                    >
                      {currentTrack.title}
                    </p>
                    <p
                      className="truncate"
                      style={{
                        fontFamily: "var(--font-sans)",
                        fontSize: 12,
                        fontWeight: 400,
                        color: "var(--color-fg-tertiary)",
                        letterSpacing: "-0.005em",
                        lineHeight: 1.25,
                      }}
                    >
                      {currentTrack.artist}
                    </p>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Center — transport controls only. Scrubber lives at
                  the bottom of the card as the visible bottom border. */}
              <div className="flex items-center justify-center gap-1 shrink-0 grow-[2] basis-0 min-w-0">
                <TransportButton
                  label="Previous track"
                  tooltip="Previous"
                  onClick={handlePrev}
                >
                  <SkipBackIcon size={15} />
                </TransportButton>
                <TransportButton
                  label={isPlaying ? "Pause" : "Play"}
                  tooltip={isPlaying ? "Pause" : "Play"}
                  onClick={togglePlay}
                  emphasized
                >
                  {isPlaying ? <PauseIcon size={28} /> : <PlayIcon size={28} />}
                </TransportButton>
                <TransportButton
                  label="Next track"
                  tooltip="Next"
                  onClick={handleNext}
                >
                  <SkipForwardIcon size={15} />
                </TransportButton>
              </div>

              {/* Right — visualizer toggles + minimize. */}
              <div className="flex items-center gap-2 shrink-0 basis-0 grow justify-end">
                <NumberedSceneToggles />
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <button
                        type="button"
                        onClick={close}
                        aria-label="Shrink to mini player"
                        className="bio-toolbar-btn focus:outline-none focus-visible:ring-2 focus-visible:ring-(--color-accent)"
                      />
                    }
                  >
                    <MinimizeIcon size={14} />
                  </TooltipTrigger>
                  <TooltipContent>Minimize</TooltipContent>
                </Tooltip>
              </div>
              </div>

              {/* Bottom row — elapsed time, scrubber, total time. All
                  inset by the card's own padding. */}
              <div
                className="flex items-center gap-3"
                style={{
                  fontFamily:
                    "var(--font-geist-mono), ui-monospace, Menlo, monospace",
                  fontSize: 10,
                  fontWeight: 500,
                  color: "var(--color-fg-tertiary)",
                  letterSpacing: "0.04em",
                  lineHeight: 1,
                }}
              >
                <span className="tabular-nums shrink-0">
                  {formatTime(displayTime)}
                </span>
                <div className="flex-1 min-w-0">
                  <InsetScrubber
                    value={Math.min(displayTime, duration || displayTime)}
                    max={duration}
                    onChange={(t) => {
                      setScrubbing(true);
                      setScrubValue(t);
                      seek(t);
                    }}
                    onCommit={() => {
                      requestAnimationFrame(() => setScrubbing(false));
                    }}
                  />
                </div>
                <span className="tabular-nums shrink-0">
                  {formatTime(duration)}
                </span>
              </div>
            </div>
          </motion.div>
          </TooltipProvider>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

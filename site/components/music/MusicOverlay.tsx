"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAudioPlayer } from "@/lib/AudioPlayerContext";
import { useVisualizerScene } from "@/lib/VisualizerSceneContext";
import { SCENES } from "@/lib/visualizer-scenes";
import LedMatrix from "@/components/LedMatrix";
import SeekBar from "@/components/music/SeekBar";
import {
  PlayIcon,
  PauseIcon,
  SkipBackIcon,
  SkipForwardIcon,
  ArrowRightIcon,
} from "@/components/Icons";

const BLUR_EASE = [0.22, 1, 0.36, 1] as const;

function formatTime(sec: number): string {
  if (!isFinite(sec) || sec < 0) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function TransportButton({
  label,
  onClick,
  children,
  emphasized = false,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
  emphasized?: boolean;
}) {
  const size = emphasized ? 64 : 44;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="inline-flex items-center justify-center transition-colors focus:outline-none cursor-pointer"
      style={{
        width: size,
        height: size,
        color: "var(--color-fg)",
        background: "transparent",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.color = "var(--color-accent)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.color = "var(--color-fg)";
      }}
    >
      {children}
    </button>
  );
}

/** Numbered visualizer toggles — replaces the icon-based SceneToggles for
 *  the overlay. Each scene is represented by its position (1-N); hovering
 *  reveals the scene's label as an immediate tooltip directly above the
 *  button. Multiple scenes can be active simultaneously (the underlying
 *  context supports it), so the active state is a tinted fill rather than
 *  a radio. */
function NumberedSceneToggles() {
  const { activeScenes, toggleScene } = useVisualizerScene();
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  return (
    <div className="relative flex items-center justify-center gap-1.5">
      {SCENES.map((s, idx) => {
        const active = activeScenes.has(s.id);
        const hovered = hoveredIdx === idx;
        return (
          <div key={s.id} className="relative">
            <AnimatePresence>
              {hovered && (
                <motion.span
                  initial={{ opacity: 0, y: 2 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 2 }}
                  transition={{ duration: 0.14, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute left-1/2 -translate-x-1/2 -top-7 whitespace-nowrap pointer-events-none"
                  style={{
                    fontFamily:
                      "var(--font-geist-mono), ui-monospace, Menlo, monospace",
                    fontSize: 10,
                    fontWeight: 500,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    lineHeight: 1,
                    color: "var(--color-fg-secondary)",
                    padding: "4px 6px",
                    backgroundColor: "var(--color-bg)",
                    border: "1px solid var(--color-border)",
                  }}
                >
                  {s.label}
                </motion.span>
              )}
            </AnimatePresence>
            <button
              type="button"
              onClick={() => toggleScene(s.id)}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() =>
                setHoveredIdx((cur) => (cur === idx ? null : cur))
              }
              onFocus={() => setHoveredIdx(idx)}
              onBlur={() =>
                setHoveredIdx((cur) => (cur === idx ? null : cur))
              }
              aria-label={`Toggle ${s.label} scene`}
              aria-pressed={active}
              className="flex items-center justify-center w-7 h-7 transition-colors focus:outline-none cursor-pointer active:scale-[0.96] [transition-property:color,background-color,transform] duration-150 ease-out"
              style={{
                fontFamily:
                  "var(--font-geist-mono), ui-monospace, Menlo, monospace",
                fontSize: 11,
                fontWeight: 500,
                lineHeight: 1,
                color: active
                  ? "var(--color-accent)"
                  : "var(--color-fg-tertiary)",
                backgroundColor: active
                  ? "color-mix(in srgb, var(--color-accent) 12%, transparent)"
                  : "transparent",
              }}
            >
              {idx + 1}
            </button>
          </div>
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
          <motion.div
            initial={{ opacity: 0, y: 16, filter: "blur(12px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: 16, filter: "blur(12px)" }}
            transition={{ duration: 0.42, ease: BLUR_EASE }}
            className="w-full max-w-[900px] flex flex-col gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Return button — sits inside the music player column,
                flush-left at the top. Click closes the overlay; audio
                playback is unaffected. mb-6 gives breathing room before
                the visualizer below. */}
            <div className="flex mb-6">
              <button
                type="button"
                onClick={close}
                aria-label="Return to page"
                className="group inline-flex items-center gap-1.5 transition-colors cursor-pointer focus:outline-none hover:text-(--color-accent) focus-visible:text-(--color-accent)"
                style={{
                  fontFamily:
                    "var(--font-geist-mono), ui-monospace, Menlo, monospace",
                  fontSize: 12,
                  fontWeight: 500,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  lineHeight: 1,
                  color: "var(--color-fg-secondary)",
                  background: "none",
                  border: 0,
                  padding: 0,
                }}
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
              </button>
            </div>

            {/* LED matrix — height set proportionally to the column's
                900px max-width so the aspect ratio holds (~3:1, matching
                the pre-resize feel). Width fills the centered column. */}
            <div className="relative">
              <LedMatrix height={290} />
            </div>

            {/* Scrubber — spans the full matrix width. mt-6 adds extra
                breathing room between the visualizer and the timeline. */}
            <div className="flex flex-col gap-1.5 mt-6">
              <SeekBar
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
              <div
                className="flex items-center justify-between"
                style={{
                  fontFamily:
                    "var(--font-geist-mono), ui-monospace, Menlo, monospace",
                  fontSize: 11,
                  fontWeight: 500,
                  color: "var(--color-fg-tertiary)",
                  letterSpacing: "0.04em",
                }}
              >
                <span className="tabular-nums">{formatTime(displayTime)}</span>
                <span className="tabular-nums">{formatTime(duration)}</span>
              </div>
            </div>

            {/* Transport controls — always visible, centered. */}
            <div className="flex items-center justify-center gap-2 mt-2">
              <TransportButton label="Previous track" onClick={prev}>
                <SkipBackIcon size={18} />
              </TransportButton>
              <TransportButton
                label={isPlaying ? "Pause" : "Play"}
                onClick={togglePlay}
                emphasized
              >
                {isPlaying ? <PauseIcon size={36} /> : <PlayIcon size={36} />}
              </TransportButton>
              <TransportButton label="Next track" onClick={next}>
                <SkipForwardIcon size={18} />
              </TransportButton>
            </div>

            {/* Track info — quiet, beneath the controls. */}
            <div className="flex flex-col items-center text-center gap-1 mt-3">
              <p
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: 15,
                  fontWeight: 500,
                  color: "var(--color-fg)",
                  letterSpacing: "-0.01em",
                  lineHeight: 1.2,
                }}
              >
                {currentTrack.title}
              </p>
              <p
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: 13,
                  fontWeight: 400,
                  color: "var(--color-fg-tertiary)",
                  letterSpacing: "-0.005em",
                  lineHeight: 1.2,
                }}
              >
                {currentTrack.artist}
              </p>
            </div>

            {/* Visualizer scene toggles — numbered buttons with on-hover
                tooltips revealing each scene's label. Centered beneath
                the track info. */}
            <div className="flex justify-center mt-5">
              <NumberedSceneToggles />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

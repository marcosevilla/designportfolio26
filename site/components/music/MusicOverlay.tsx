"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAudioPlayer } from "@/lib/AudioPlayerContext";
import { useVisualizerScene } from "@/lib/VisualizerSceneContext";
import { SCENES } from "@/lib/visualizer-scenes";
import LedMatrix from "@/components/LedMatrix";
import {
  PlayIcon,
  PauseIcon,
  SkipBackIcon,
  SkipForwardIcon,
  ArrowRightIcon,
} from "@/components/Icons";

const BLUR_EASE = [0.22, 1, 0.36, 1] as const;

/** Custom timeline that doubles as the card's bottom border. The track
 *  is a thin strip flush against the card edge; the filled portion grows
 *  with playback. Times + scrubber thumb only appear on hover/drag so
 *  the resting state is just a moving line. */
function BorderScrubber({
  value,
  max,
  onChange,
  onCommit,
}: {
  value: number;
  max: number;
  onChange: (next: number) => void;
  onCommit?: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const [dragging, setDragging] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);

  const expanded = hovered || dragging;
  const pct = max > 0 ? Math.max(0, Math.min(100, (value / max) * 100)) : 0;

  const valueAtClientX = (clientX: number) => {
    const el = trackRef.current;
    if (!el || max <= 0) return 0;
    const rect = el.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    return ratio * max;
  };

  return (
    <div
      role="slider"
      aria-label="Seek"
      aria-valuemin={0}
      aria-valuemax={max || 0}
      aria-valuenow={value}
      tabIndex={0}
      className="relative w-full cursor-pointer select-none touch-none"
      // Generous tap padding above the visible strip so hovers and clicks
      // land easily; the strip itself sits at the very bottom.
      style={{ paddingTop: 16 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onPointerDown={(e) => {
        e.preventDefault();
        e.currentTarget.setPointerCapture(e.pointerId);
        setDragging(true);
        onChange(valueAtClientX(e.clientX));
      }}
      onPointerMove={(e) => {
        if (!dragging) return;
        onChange(valueAtClientX(e.clientX));
      }}
      onPointerUp={(e) => {
        if (!dragging) return;
        setDragging(false);
        e.currentTarget.releasePointerCapture(e.pointerId);
        onCommit?.();
      }}
      onPointerCancel={(e) => {
        if (!dragging) return;
        setDragging(false);
        e.currentTarget.releasePointerCapture(e.pointerId);
        onCommit?.();
      }}
    >
      {/* Time labels — only on hover/drag, floating above the strip. */}
      <AnimatePresence>
        {expanded && (
          <>
            <motion.span
              key="time-current"
              initial={{ opacity: 0, y: 2 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 2 }}
              transition={{ duration: 0.14, ease: BLUR_EASE }}
              className="absolute pointer-events-none tabular-nums"
              style={{
                bottom: 6,
                left: 8,
                fontFamily:
                  "var(--font-geist-mono), ui-monospace, Menlo, monospace",
                fontSize: 10,
                fontWeight: 500,
                color: "var(--color-fg-tertiary)",
                letterSpacing: "0.04em",
                lineHeight: 1,
              }}
            >
              {formatTime(value)}
            </motion.span>
            <motion.span
              key="time-total"
              initial={{ opacity: 0, y: 2 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 2 }}
              transition={{ duration: 0.14, ease: BLUR_EASE }}
              className="absolute pointer-events-none tabular-nums"
              style={{
                bottom: 6,
                right: 8,
                fontFamily:
                  "var(--font-geist-mono), ui-monospace, Menlo, monospace",
                fontSize: 10,
                fontWeight: 500,
                color: "var(--color-fg-tertiary)",
                letterSpacing: "0.04em",
                lineHeight: 1,
              }}
            >
              {formatTime(max)}
            </motion.span>
          </>
        )}
      </AnimatePresence>

      {/* Track — 1px at rest (reads as a hairline border), 2px on hover. */}
      <div
        ref={trackRef}
        className="relative w-full"
        style={{
          height: expanded ? 2 : 1,
          backgroundColor: "var(--color-border)",
          transition: "height 150ms ease-out",
        }}
      >
        {/* Filled portion — accent color. */}
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            height: "100%",
            width: `${pct}%`,
            backgroundColor: "var(--color-accent)",
          }}
        />
        {/* Thumb — invisible at rest, expands on hover/drag. */}
        <span
          aria-hidden
          style={{
            position: "absolute",
            left: `${pct}%`,
            top: "50%",
            width: expanded ? 12 : 0,
            height: expanded ? 12 : 0,
            transform: "translate(-50%, -50%)",
            opacity: expanded ? 1 : 0,
            backgroundColor: "var(--color-accent)",
            borderRadius: "50%",
            pointerEvents: "none",
            transition:
              "width 150ms ease-out, height 150ms ease-out, opacity 150ms ease-out",
          }}
        />
      </div>
    </div>
  );
}

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
  onClick,
  children,
  emphasized = false,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
  emphasized?: boolean;
}) {
  const size = emphasized ? 44 : 32;
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
          <motion.div
            initial={{ opacity: 0, y: 16, filter: "blur(12px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: 16, filter: "blur(12px)" }}
            transition={{ duration: 0.42, ease: BLUR_EASE }}
            className="w-full max-w-[700px] flex flex-col gap-4"
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
                700px max-width so the aspect ratio holds (~3:1). Width
                fills the centered column. */}
            <div className="relative">
              <LedMatrix height={226} />
            </div>

            {/* Spotify-style player row. Left: track info. Center:
                transport controls + scrubber. Right: visualizer toggles
                + shrink-to-mini-widget button. Wrapped in a tinted card
                with a soft border + drop shadow so it reads as a single
                grouped surface against the overlay background. */}
            <div
              className="mt-8 flex flex-col overflow-hidden"
              style={{
                backgroundColor: "var(--color-bg)",
                // No border-bottom — the BorderScrubber below acts as the
                // bottom edge, filling with accent as the song progresses.
                borderTop: "0.5px solid var(--color-border)",
                borderLeft: "0.5px solid var(--color-border)",
                borderRight: "0.5px solid var(--color-border)",
                borderRadius: 4,
                boxShadow: "0 6px 18px -8px rgba(0,0,0,0.10)",
              }}
            >
              <div className="flex items-center gap-4 px-3 py-1.5">
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
                <TransportButton label="Previous track" onClick={handlePrev}>
                  <SkipBackIcon size={15} />
                </TransportButton>
                <TransportButton
                  label={isPlaying ? "Pause" : "Play"}
                  onClick={togglePlay}
                  emphasized
                >
                  {isPlaying ? <PauseIcon size={22} /> : <PlayIcon size={22} />}
                </TransportButton>
                <TransportButton label="Next track" onClick={handleNext}>
                  <SkipForwardIcon size={15} />
                </TransportButton>
              </div>

              {/* Right — visualizer toggles + minimize. */}
              <div className="flex items-center gap-2 shrink-0 basis-0 grow justify-end">
                <NumberedSceneToggles />
                <button
                  type="button"
                  onClick={close}
                  aria-label="Shrink to mini player"
                  className="flex items-center justify-center w-7 h-7 transition-colors focus:outline-none cursor-pointer text-(--color-fg-tertiary) hover:text-(--color-accent)"
                >
                  <MinimizeIcon size={14} />
                </button>
              </div>
              </div>

              {/* Scrubber — flush against the card's bottom edge,
                  visually doubling as the bottom border. */}
              <BorderScrubber
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
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

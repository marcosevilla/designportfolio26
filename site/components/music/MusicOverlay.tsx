"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAudioPlayer } from "@/lib/AudioPlayerContext";
import LedMatrix from "@/components/LedMatrix";
import { SceneToggles } from "@/components/music/LedMatrixUI";
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
  const size = emphasized ? 56 : 44;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="inline-flex items-center justify-center transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-(--color-accent) cursor-pointer"
      style={{
        width: size,
        height: size,
        color: "var(--color-fg)",
        background: emphasized
          ? "color-mix(in srgb, var(--color-fg) 6%, transparent)"
          : "transparent",
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
          // Slightly tinted page background so the matrix reads cleanly
          // against whatever was scrolled to. Still transparent enough
          // that the page blur shows through subtly.
          style={{
            backgroundColor:
              "color-mix(in srgb, var(--color-bg) 88%, transparent)",
            backdropFilter: "blur(2px)",
            WebkitBackdropFilter: "blur(2px)",
          }}
          aria-modal="true"
          role="dialog"
          aria-label="Music player"
        >
          {/* Return button — fixed top-left, replaces the left-column
              nav while the overlay owns the screen. Click closes the
              overlay; audio playback is unaffected. */}
          <motion.button
            type="button"
            onClick={close}
            initial={{ opacity: 0, x: -4, filter: "blur(6px)" }}
            animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, x: -4, filter: "blur(6px)" }}
            transition={{ duration: 0.32, ease: BLUR_EASE }}
            aria-label="Return to page"
            className="group fixed top-5 left-4 sm:left-6 z-[130] inline-flex items-center gap-1.5 transition-colors cursor-pointer focus:outline-none hover:text-(--color-accent) focus-visible:text-(--color-accent)"
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
          </motion.button>

          <motion.div
            initial={{ opacity: 0, y: 16, filter: "blur(12px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: 16, filter: "blur(12px)" }}
            transition={{ duration: 0.42, ease: BLUR_EASE }}
            className="w-full max-w-[620px] flex flex-col gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Scene toggles — flush right, above the LED matrix. */}
            <div className="flex justify-end">
              <SceneToggles />
            </div>

            {/* LED matrix — sized via its default height (200px). Width
                fills the centered column. */}
            <div className="relative">
              <LedMatrix />
            </div>

            {/* Scrubber — spans the full matrix width. */}
            <div className="flex flex-col gap-1.5">
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
                {isPlaying ? <PauseIcon size={22} /> : <PlayIcon size={22} />}
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
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAudioPlayer } from "@/lib/AudioPlayerContext";
import {
  PlayIcon,
  PauseIcon,
  SkipBackIcon,
  SkipForwardIcon,
  CloseIcon,
} from "@/components/Icons";
import InsetScrubber from "./InsetScrubber";

/** Picture-in-picture-style glyph used to re-open the full overlay.
 *  Mirrors the MinimizeIcon used inside the overlay so the two
 *  affordances feel like a pair. */
function ExpandIcon({ size = 12, className }: { size?: number; className?: string }) {
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
      <rect x="2" y="2" width="6" height="6" fill="currentColor" />
    </svg>
  );
}

function formatTime(sec: number): string {
  if (!isFinite(sec) || sec < 0) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function MiniButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="bio-toolbar-btn focus:outline-none focus-visible:ring-2 focus-visible:ring-(--color-accent)"
    >
      {children}
    </button>
  );
}

/** Floating mini player. Bottom-right corner across all routes when the
 *  audio session is active and the MusicOverlay is closed. Visual
 *  language mirrors the large overlay's player card (same 4px radius,
 *  0.5px border, soft drop shadow, --color-bg fill) but compressed —
 *  smaller fonts, smaller controls, smaller scrubber. */
export default function MusicMiniWidget() {
  const {
    session,
    overlayOpen,
    isPlaying,
    currentTrack,
    currentTime,
    duration,
    togglePlay,
    next,
    prev,
    seek,
    closeSession,
    setOverlayOpen,
  } = useAudioPlayer();

  const [scrubbing, setScrubbing] = useState(false);
  const [scrubValue, setScrubValue] = useState(0);
  const displayTime = scrubbing ? scrubValue : currentTime;

  const visible = session === "active" && !overlayOpen;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="music-mini-widget"
          initial={{ opacity: 0, y: 12, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: 12, filter: "blur(8px)" }}
          transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
          className="fixed bottom-4 right-4 z-[60] w-[260px] flex flex-col px-3 py-3 gap-3"
          style={{
            backgroundColor: "var(--color-bg)",
            border: "0.5px solid var(--color-border)",
            borderRadius: 4,
            boxShadow: "0 6px 18px -8px rgba(0,0,0,0.10)",
          }}
          aria-label="Music player (mini)"
        >
          {/* Row 1 — track info on the left (truncated), expand + close
              actions pinned right. Track info gets the full available
              width now that transport has its own row below. */}
          <div className="flex items-center gap-2">
            <div className="flex flex-col min-w-0 flex-1">
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
                  lineHeight: 1.3,
                }}
              >
                {currentTrack.artist}
              </p>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <MiniButton
                label="Open full music player"
                onClick={() => setOverlayOpen(true)}
              >
                <ExpandIcon size={14} />
              </MiniButton>
              <MiniButton label="Close player" onClick={closeSession}>
                <CloseIcon size={12} />
              </MiniButton>
            </div>
          </div>

          {/* Row 2 — transport. Centered prev / play / next with 32×32
              tap targets, matching the rest of the site's icon-button
              family. */}
          <div className="flex items-center justify-center gap-2">
            <MiniButton label="Previous track" onClick={prev}>
              <SkipBackIcon size={14} />
            </MiniButton>
            <MiniButton
              label={isPlaying ? "Pause" : "Play"}
              onClick={togglePlay}
            >
              {isPlaying ? <PauseIcon size={16} /> : <PlayIcon size={16} />}
            </MiniButton>
            <MiniButton label="Next track" onClick={next}>
              <SkipForwardIcon size={14} />
            </MiniButton>
          </div>

          {/* Row 3 — elapsed | scrubber | total. */}
          <div
            className="flex items-center gap-2"
            style={{
              fontFamily:
                "var(--font-geist-mono), ui-monospace, Menlo, monospace",
              fontSize: 11,
              fontWeight: 500,
              color: "var(--color-fg-tertiary)",
              letterSpacing: "0.04em",
              lineHeight: 1,
            }}
          >
            <span className="tabular-nums shrink-0" style={{ minWidth: 30 }}>
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
                restingHeight={2}
                expandedHeight={3}
                thumbSize={10}
              />
            </div>
            <span
              className="tabular-nums shrink-0 text-right"
              style={{ minWidth: 30 }}
            >
              {formatTime(duration)}
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

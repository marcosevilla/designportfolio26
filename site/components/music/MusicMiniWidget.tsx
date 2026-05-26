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
  MusicNoteIcon,
} from "@/components/Icons";
import SeekBar from "./SeekBar";

const SHADOW =
  "0 1px 2px rgba(0,0,0,0.05), 0 18px 36px -12px rgba(0,0,0,0.28)";

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
      className="flex items-center justify-center w-7 h-7 text-(--color-fg-secondary) hover:text-(--color-accent) transition-colors cursor-pointer focus:outline-none"
    >
      {children}
    </button>
  );
}

/** Floating mini player. Bottom-right pill-rectangle (sharp edges,
 *  drop shadow) that appears on every page whenever the audio session
 *  is active and the MusicOverlay is closed. Clicking the artwork-side
 *  re-opens the overlay; the rest is direct controls + scrubber. */
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
          className="fixed bottom-4 right-4 z-[60] w-[300px]"
          style={{
            backgroundColor: "var(--color-bg)",
            border: "1px solid var(--color-border)",
            boxShadow: SHADOW,
            borderRadius: 0,
          }}
          aria-label="Music player (mini)"
        >
          <div className="flex items-center gap-2 px-3 py-2">
            {/* Click the music glyph to re-open the full overlay. */}
            <button
              type="button"
              onClick={() => setOverlayOpen(true)}
              aria-label="Open music player"
              className="flex items-center justify-center w-7 h-7 text-(--color-fg-secondary) hover:text-(--color-accent) transition-colors cursor-pointer focus:outline-none shrink-0"
            >
              <MusicNoteIcon size={14} />
            </button>

            <div className="min-w-0 flex-1">
              <p
                className="truncate"
                style={{
                  fontSize: 11,
                  fontWeight: 500,
                  color: "var(--color-fg)",
                  letterSpacing: "-0.005em",
                  lineHeight: 1.25,
                }}
              >
                {currentTrack.title}
              </p>
              <p
                className="truncate"
                style={{
                  fontSize: 10,
                  fontWeight: 400,
                  color: "var(--color-fg-tertiary)",
                  lineHeight: 1.25,
                }}
              >
                {currentTrack.artist}
              </p>
            </div>

            <div className="flex items-center gap-0.5 shrink-0">
              <MiniButton label="Previous track" onClick={prev}>
                <SkipBackIcon size={12} />
              </MiniButton>
              <MiniButton
                label={isPlaying ? "Pause" : "Play"}
                onClick={togglePlay}
              >
                {isPlaying ? <PauseIcon size={14} /> : <PlayIcon size={14} />}
              </MiniButton>
              <MiniButton label="Next track" onClick={next}>
                <SkipForwardIcon size={12} />
              </MiniButton>
            </div>

            <MiniButton label="Close player" onClick={closeSession}>
              <CloseIcon size={10} />
            </MiniButton>
          </div>

          {/* Thin scrubber strip at the bottom. */}
          <div className="px-3 pb-1.5">
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
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

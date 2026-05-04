"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAudioPlayer } from "@/lib/AudioPlayerContext";
import {
  PlayIcon,
  PauseIcon,
  SkipBackIcon,
  SkipForwardIcon,
} from "@/components/Icons";
import SeekBar from "./SeekBar";

const PLAYER_HOVER_SPRING = { type: "spring" as const, stiffness: 500, damping: 38 };

/** Small spinning vinyl disc — sits left of the title in the inline music
 *  slot as a "music is playing" cue. Was previously inside HeroToolbar's
 *  NowPlayingStatus before the swap-zone refactor; reintroduced here so
 *  the music slot has the same visual identity. */
function SpinningDiscIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" fill="none">
      <circle cx="6" cy="6" r="5.6" fill="currentColor" />
      <path
        d="M2.6 3.7 A 5 5 0 0 1 8.6 1.7"
        stroke="white"
        strokeOpacity="0.7"
        strokeWidth="0.8"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="3.5" cy="8.2" r="0.45" fill="white" fillOpacity="0.45" />
      <circle cx="6" cy="6" r="2" fill="var(--color-bg)" />
      <circle cx="6" cy="6" r="0.55" fill="currentColor" />
    </svg>
  );
}

const SWAP_EASE = [0.22, 1, 0.36, 1] as const;
const SWAP_TRAVEL = 24; // px — title exits up, scrubber enters from below

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

const TINT_HOVER = "color-mix(in srgb, var(--color-accent) 8%, transparent)";
const TINT_ACTIVE = "color-mix(in srgb, var(--color-accent) 14%, transparent)";

function PlayerIconButton({
  label,
  onClick,
  active = false,
  hovered,
  onHover,
  layoutId,
  size = 32,
  children,
}: {
  label: string;
  onClick: () => void;
  active?: boolean;
  hovered: boolean;
  onHover: () => void;
  layoutId: string;
  size?: number;
  children: React.ReactNode;
}) {
  // Default 32px matches the right-side HeroActions buttons (w-8 h-8).
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={onHover}
      onFocus={onHover}
      aria-label={label}
      aria-pressed={active}
      className="relative flex items-center justify-center rounded-full transition-colors cursor-pointer focus:outline-none shrink-0"
      style={{
        width: size,
        height: size,
        color: active || hovered ? "var(--color-accent)" : "var(--color-fg-secondary)",
      }}
    >
      {active && (
        <span
          aria-hidden
          className="absolute inset-0 rounded-full"
          style={{ backgroundColor: TINT_ACTIVE }}
        />
      )}
      {hovered && (
        <motion.span
          layoutId={layoutId}
          aria-hidden
          className="absolute inset-0 rounded-full"
          style={{ backgroundColor: TINT_HOVER }}
          transition={PLAYER_HOVER_SPRING}
        />
      )}
      <span className="relative">{children}</span>
    </button>
  );
}

/**
 * Inline-row mini player: transport buttons on the left, then a hover-aware
 * swap zone in the center that shows track title/artist by default and
 * swaps to a centered scrubber + timestamps when the row is hovered. Both
 * elements move upward through the row — title exits up, scrubber rises
 * from below into the centered position. Designed to slot into the
 * HeroToolbar's left swap zone (32px tall).
 */
export function MiniPlayerRow() {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    togglePlay,
    next,
    prev,
    seek,
  } = useAudioPlayer();

  const [scrubbing, setScrubbing] = useState(false);
  const [scrubValue, setScrubValue] = useState(0);
  const [transportHover, setTransportHover] = useState<number | null>(null);
  const [rowHover, setRowHover] = useState(false);
  const displayTime = scrubbing ? scrubValue : currentTime;
  // Stay on the scrubber view while the user is actively dragging, even if
  // the cursor briefly leaves the row mid-drag.
  const showScrubber = rowHover || scrubbing;

  // Mobile: condense the scrubber into a stacked layout (timestamps
  // sit above the bar, on the far left + far right) so the bar can
  // span the full available width inside the unified pill's swap zone
  // instead of competing with inline timestamp labels.
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(max-width: 1023px)");
    setIsMobile(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return (
    <div className="relative w-full h-full flex items-center gap-2">
      <div
        className="flex items-center shrink-0"
        onMouseLeave={() => setTransportHover(null)}
      >
        {/* Skip buttons sit a touch smaller than the play/pause to give the
            primary transport visual emphasis. */}
        <PlayerIconButton
          label="Previous track"
          onClick={prev}
          hovered={transportHover === 0}
          onHover={() => setTransportHover(0)}
          layoutId="player-row-transport-hover"
          size={26}
        >
          <SkipBackIcon size={13} />
        </PlayerIconButton>
        <PlayerIconButton
          label={isPlaying ? "Pause" : "Play"}
          onClick={togglePlay}
          hovered={transportHover === 1}
          onHover={() => setTransportHover(1)}
          layoutId="player-row-transport-hover"
          size={32}
        >
          {isPlaying ? <PauseIcon size={18} /> : <PlayIcon size={18} />}
        </PlayerIconButton>
        <PlayerIconButton
          label="Next track"
          onClick={next}
          hovered={transportHover === 2}
          onHover={() => setTransportHover(2)}
          layoutId="player-row-transport-hover"
          size={26}
        >
          <SkipForwardIcon size={13} />
        </PlayerIconButton>
      </div>

      {/* Hover-aware swap zone — title (default) ↔ scrubber+times (hover).
          Hover trigger is scoped to the title zone only, NOT the transport
          buttons, so skipping tracks keeps the title visible long enough to
          read. Both elements move upward through the row on swap: title
          exits up, scrubber rises from below to the centered position. */}
      <div
        className="relative flex-1 min-w-0 h-full overflow-hidden"
        onMouseEnter={() => setRowHover(true)}
        onMouseLeave={() => setRowHover(false)}
      >
        <AnimatePresence initial={false}>
          {showScrubber ? (
            <motion.div
              key="scrubber"
              initial={{ y: SWAP_TRAVEL, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: SWAP_TRAVEL, opacity: 0 }}
              transition={{ duration: 0.24, ease: SWAP_EASE }}
              // Mobile: stack — timestamps sit on a row above the bar
              // (justify-between for hard-left / hard-right placement),
              // and the bar fills the swap zone's full width below.
              // Desktop: inline — timestamps flank the bar horizontally.
              className={
                isMobile
                  ? "absolute inset-0 flex flex-col justify-center gap-0.5"
                  : "absolute inset-0 flex items-center gap-2"
              }
            >
              {isMobile ? (
                <>
                  <div
                    className="flex items-center justify-between"
                    style={{
                      fontFamily: "var(--font-geist-mono), ui-monospace, Menlo, monospace",
                      fontSize: "10px",
                      color: "var(--color-fg-tertiary)",
                      fontVariantNumeric: "tabular-nums",
                      lineHeight: 1,
                    }}
                  >
                    <span className="tabular-nums">{formatTime(displayTime)}</span>
                    <span className="tabular-nums">{formatTime(duration)}</span>
                  </div>
                  <SeekBar
                    variant="default"
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
                </>
              ) : (
                <>
                  <span
                    className="shrink-0 tabular-nums"
                    style={{
                      fontFamily: "var(--font-geist-mono), ui-monospace, Menlo, monospace",
                      fontSize: "11px",
                      color: "var(--color-fg-tertiary)",
                      fontVariantNumeric: "tabular-nums",
                      minWidth: "30px",
                    }}
                  >
                    {formatTime(displayTime)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <SeekBar
                      variant="default"
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
                  <span
                    className="shrink-0 tabular-nums text-right"
                    style={{
                      fontFamily: "var(--font-geist-mono), ui-monospace, Menlo, monospace",
                      fontSize: "11px",
                      color: "var(--color-fg-tertiary)",
                      fontVariantNumeric: "tabular-nums",
                      minWidth: "30px",
                    }}
                  >
                    {formatTime(duration)}
                  </span>
                </>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="title"
              initial={{ y: -SWAP_TRAVEL, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -SWAP_TRAVEL, opacity: 0 }}
              transition={{ duration: 0.24, ease: SWAP_EASE }}
              className="absolute inset-0 flex items-center gap-1.5"
            >
              <motion.span
                aria-hidden
                className="inline-flex shrink-0"
                style={{ color: "var(--color-accent)" }}
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
              >
                <SpinningDiscIcon size={14} />
              </motion.span>
              <p
                className="truncate"
                style={{
                  fontFamily: "var(--font-geist-mono), ui-monospace, Menlo, monospace",
                  fontSize: "11px",
                  letterSpacing: "-0.02em",
                  lineHeight: 1.3,
                  fontWeight: 400,
                  color: "var(--color-fg-secondary)",
                }}
              >
                {currentTrack.title} <span aria-hidden>·</span> {currentTrack.artist}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}


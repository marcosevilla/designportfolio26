"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAudioPlayer } from "@/lib/AudioPlayerContext";
import { useVisualizerScene } from "@/lib/VisualizerSceneContext";
import { SCENES, type VisualizerScene } from "@/lib/visualizer-scenes";
import {
  PlayIcon,
  PauseIcon,
  SkipBackIcon,
  SkipForwardIcon,
  WaveformSceneIcon,
  SparklesSceneIcon,
  ChladniSceneIcon,
  FeedbackSceneIcon,
  LissajousSceneIcon,
} from "@/components/Icons";
import SeekBar from "./SeekBar";

const SCENE_ICONS: Record<VisualizerScene, (props: { size?: number }) => React.ReactElement> = {
  waveform: WaveformSceneIcon,
  sparkles: SparklesSceneIcon,
  chladni: ChladniSceneIcon,
  feedback: FeedbackSceneIcon,
  lissajous: LissajousSceneIcon,
};

const PLAYER_HOVER_SPRING = { type: "spring" as const, stiffness: 500, damping: 38 };

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

  return (
    <div className="relative w-full h-full flex items-center gap-2">
      <div
        className="flex items-center shrink-0"
        onMouseLeave={() => setTransportHover(null)}
      >
        <PlayerIconButton
          label="Previous track"
          onClick={prev}
          hovered={transportHover === 0}
          onHover={() => setTransportHover(0)}
          layoutId="player-row-transport-hover"
        >
          <SkipBackIcon size={16} />
        </PlayerIconButton>
        <PlayerIconButton
          label={isPlaying ? "Pause" : "Play"}
          onClick={togglePlay}
          hovered={transportHover === 1}
          onHover={() => setTransportHover(1)}
          layoutId="player-row-transport-hover"
        >
          {isPlaying ? <PauseIcon size={16} /> : <PlayIcon size={16} />}
        </PlayerIconButton>
        <PlayerIconButton
          label="Next track"
          onClick={next}
          hovered={transportHover === 2}
          onHover={() => setTransportHover(2)}
          layoutId="player-row-transport-hover"
        >
          <SkipForwardIcon size={16} />
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
              className="absolute inset-0 flex items-center gap-2"
            >
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
            </motion.div>
          ) : (
            <motion.div
              key="title"
              initial={{ y: -SWAP_TRAVEL, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -SWAP_TRAVEL, opacity: 0 }}
              transition={{ duration: 0.24, ease: SWAP_EASE }}
              className="absolute inset-0 flex items-center"
            >
              <p
                className="truncate"
                style={{
                  fontFamily: "var(--font-geist-mono), ui-monospace, Menlo, monospace",
                  fontSize: "11px",
                  letterSpacing: "-0.02em",
                  lineHeight: 1.3,
                  color: "var(--color-fg)",
                }}
              >
                <span style={{ fontWeight: 600 }}>{currentTrack.title}</span>
                {" / "}
                <span style={{ color: "var(--color-fg-tertiary)", fontWeight: 400 }}>
                  {currentTrack.artist}
                </span>
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/**
 * Inline-row visualizer scene toggles. Five scenes, each toggles independently.
 * Slots into the HeroToolbar's left swap zone behind the new Visuals button.
 */
export function VisualsRow() {
  const { activeScenes, toggleScene } = useVisualizerScene();
  const [sceneHover, setSceneHover] = useState<number | null>(null);

  return (
    <div
      className="flex items-center gap-2 w-full h-full"
      onMouseLeave={() => setSceneHover(null)}
    >
      {SCENES.map((s, i) => {
        const active = activeScenes.has(s.id);
        const Icon = SCENE_ICONS[s.id];
        return (
          <PlayerIconButton
            key={s.id}
            label={`Toggle ${s.label} scene`}
            onClick={() => toggleScene(s.id)}
            active={active}
            hovered={sceneHover === i}
            onHover={() => setSceneHover(i)}
            layoutId="visuals-row-hover"
          >
            <Icon size={16} />
          </PlayerIconButton>
        );
      })}
    </div>
  );
}

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

const REVEAL_EASE = [0.22, 1, 0.36, 1] as const;

const PLAYER_HOVER_SPRING = { type: "spring" as const, stiffness: 500, damping: 38 };

// Tint scale shared across all icon-button rows. Three alphas give three
// visually distinct states (hover / active / active+hover stack).
const TINT_HOVER = "color-mix(in srgb, var(--color-accent) 8%, transparent)";
const TINT_ACTIVE = "color-mix(in srgb, var(--color-accent) 14%, transparent)";

function PlayerIconButton({
  label,
  onClick,
  active = false,
  hovered,
  onHover,
  layoutId,
  children,
}: {
  label: string;
  onClick: () => void;
  active?: boolean;
  hovered: boolean;
  onHover: () => void;
  /** Shared layoutId so framer-motion slides one pill across the group. */
  layoutId: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={onHover}
      onFocus={onHover}
      aria-label={label}
      aria-pressed={active}
      className="relative flex items-center justify-center w-8 h-8 rounded-full transition-colors cursor-pointer focus:outline-none"
      style={{
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

interface HomeMiniPlayerProps {
  /** When true, render content seamlessly inside a parent container — drop the
   *  pill chrome (border, bg, shadow, margins) so the player appears as a
   *  section of the floating toolbar rather than a separate floating panel. */
  bare?: boolean;
}

export default function HomeMiniPlayer({ bare = false }: HomeMiniPlayerProps = {}) {
  const {
    miniPlayerOpen,
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    togglePlay,
    next,
    prev,
    seek,
  } = useAudioPlayer();
  const { activeScenes, toggleScene } = useVisualizerScene();

  const [scrubbing, setScrubbing] = useState(false);
  const [scrubValue, setScrubValue] = useState(0);
  const displayTime = scrubbing ? scrubValue : currentTime;

  // Per-group hovered index — each group owns its own sliding pill so it
  // doesn't fly across the title gap between transport and visualizer.
  const [transportHover, setTransportHover] = useState<number | null>(null);
  const [sceneHover, setSceneHover] = useState<number | null>(null);

  const playerBody = (
    <>
      {/* Single row, Apple Music ordering:
                [Rewind] [Play/Pause] [Skip]  |  [Title + artist]  |  [Visualizer toggles]
                The scrubber sits flush against the bottom edge as a separate layer. */}
            <div className="flex items-center gap-3">
              {/* Transport */}
              <div
                className="flex items-center gap-1 shrink-0"
                onMouseLeave={() => setTransportHover(null)}
              >
                <PlayerIconButton
                  label="Previous track"
                  onClick={prev}
                  hovered={transportHover === 0}
                  onHover={() => setTransportHover(0)}
                  layoutId="player-transport-hover"
                >
                  <SkipBackIcon size={16} />
                </PlayerIconButton>
                <PlayerIconButton
                  label={isPlaying ? "Pause" : "Play"}
                  onClick={togglePlay}
                  hovered={transportHover === 1}
                  onHover={() => setTransportHover(1)}
                  layoutId="player-transport-hover"
                >
                  {isPlaying ? <PauseIcon size={18} /> : <PlayIcon size={18} />}
                </PlayerIconButton>
                <PlayerIconButton
                  label="Next track"
                  onClick={next}
                  hovered={transportHover === 2}
                  onHover={() => setTransportHover(2)}
                  layoutId="player-transport-hover"
                >
                  <SkipForwardIcon size={16} />
                </PlayerIconButton>
              </div>

              {/* Title + artist (single line) */}
              <div className="min-w-0 flex-1">
                <p
                  className="truncate"
                  style={{
                    fontSize: "12px",
                    fontWeight: 500,
                    color: "var(--color-fg)",
                    letterSpacing: "-0.005em",
                    lineHeight: 1.3,
                  }}
                >
                  <span>{currentTrack.title}</span>
                  <span style={{ color: "var(--color-fg-tertiary)", fontWeight: 400 }}>
                    {" — "}{currentTrack.artist}
                  </span>
                </p>
              </div>

              {/* Vertical divider — separates audio (transport + title) from
                  the visualizer scene toggles. */}
              <span
                aria-hidden
                className="shrink-0"
                style={{
                  width: 1,
                  height: 20,
                  backgroundColor: "var(--color-border)",
                }}
              />

              {/* Visualizer toggles (right) */}
              <div
                className="flex items-center gap-1 shrink-0"
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
                      layoutId="player-scene-hover"
                    >
                      <Icon size={16} />
                    </PlayerIconButton>
                  );
                })}
              </div>
            </div>

            {/* Scrubber — flush to the bottom edge, full container width.
                Hover thickens it and reveals the ✸ thumb. */}
            <div className="absolute left-0 right-0 bottom-0 px-0">
              <SeekBar
                variant="flush"
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
    </>
  );

  const animation = (
    <motion.div
      key="home-mini-player"
      initial={{ height: 0, opacity: 0, y: -8, filter: "blur(8px)" }}
      animate={{
        height: "auto",
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        transition: {
          height: { duration: 0.35, ease: REVEAL_EASE },
          opacity: { duration: 0.3, ease: REVEAL_EASE, delay: 0.05 },
          y: { duration: 0.35, ease: REVEAL_EASE },
          filter: { duration: 0.4, ease: REVEAL_EASE, delay: 0.05 },
        },
      }}
      exit={{
        height: 0,
        opacity: 0,
        y: -8,
        filter: "blur(8px)",
        transition: {
          height: { duration: 0.25, ease: REVEAL_EASE, delay: 0.08 },
          opacity: { duration: 0.2, ease: REVEAL_EASE },
          y: { duration: 0.25, ease: REVEAL_EASE },
          filter: { duration: 0.22, ease: REVEAL_EASE },
        },
      }}
      style={{ overflow: "hidden", willChange: "transform, opacity, filter" }}
      aria-label="Music player"
    >
      {bare ? (
        <>
          <div style={{ height: 1, background: "var(--color-border)" }} aria-hidden />
          <div
            className="relative overflow-hidden"
            style={{ padding: "8px 12px 14px" }}
          >
            {playerBody}
          </div>
        </>
      ) : (
        <div
          className="bio-dropdown-container relative mt-2 mb-4 overflow-hidden"
          style={{ padding: "8px 12px 14px" }}
        >
          {playerBody}
        </div>
      )}
    </motion.div>
  );

  return bare ? (
    <AnimatePresence initial={false}>{miniPlayerOpen && animation}</AnimatePresence>
  ) : (
    <div style={{ filter: "var(--bio-dropdown-shadow)" }}>
      <AnimatePresence initial={false}>{miniPlayerOpen && animation}</AnimatePresence>
    </div>
  );
}

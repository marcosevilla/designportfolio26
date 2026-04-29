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
} from "@/components/Icons";
import SeekBar from "./SeekBar";

const REVEAL_EASE = [0.22, 1, 0.36, 1] as const;

function ChipButton({
  label,
  onClick,
  active = false,
  children,
}: {
  label: string;
  onClick: () => void;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={active}
      className="flex items-center justify-center transition-colors cursor-pointer"
      style={{
        color: active ? "var(--color-accent)" : "var(--color-fg-secondary)",
      }}
      onMouseEnter={(e) => { e.currentTarget.style.color = "var(--color-accent)"; }}
      onMouseLeave={(e) => {
        e.currentTarget.style.color = active ? "var(--color-accent)" : "var(--color-fg-secondary)";
      }}
    >
      {children}
    </button>
  );
}

// Tiny 10px SVG icons for the 5 visualizer scenes — readable at sidebar size.
function SceneGlyph({ id, size = 10 }: { id: VisualizerScene; size?: number }) {
  const props = { width: size, height: size, viewBox: "0 0 10 10", fill: "none", stroke: "currentColor", strokeWidth: 1.2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  switch (id) {
    case "waveform":
      return <svg {...props}><path d="M1 5 Q2.5 1.5 4 5 T7 5 T9 5" /></svg>;
    case "sparkles":
      return <svg {...props}><path d="M5 1v8M1 5h8M2.5 2.5l5 5M7.5 2.5l-5 5" /></svg>;
    case "chladni":
      return <svg {...props}><rect x="1.5" y="1.5" width="7" height="7" /></svg>;
    case "feedback":
      return <svg {...props}><rect x="1.5" y="1.5" width="7" height="7" /><rect x="3.5" y="3.5" width="3" height="3" /></svg>;
    case "lissajous":
      return <svg {...props}><circle cx="5" cy="5" r="3.5" /><path d="M2 2 L8 8 M8 2 L2 8" /></svg>;
  }
}

export default function HomeMiniPlayer() {
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

  return (
    <AnimatePresence initial={false}>
      {miniPlayerOpen && (
        <motion.div
          key="home-mini-player"
          initial={{ height: 0, opacity: 0, y: -8 }}
          animate={{
            height: "auto",
            opacity: 1,
            y: 0,
            transition: {
              height: { duration: 0.35, ease: REVEAL_EASE },
              opacity: { duration: 0.3, ease: REVEAL_EASE, delay: 0.05 },
              y: { duration: 0.35, ease: REVEAL_EASE },
            },
          }}
          exit={{
            height: 0,
            opacity: 0,
            y: -8,
            transition: {
              height: { duration: 0.25, ease: REVEAL_EASE, delay: 0.05 },
              opacity: { duration: 0.2, ease: REVEAL_EASE },
              y: { duration: 0.25, ease: REVEAL_EASE },
            },
          }}
          style={{ overflow: "hidden", willChange: "transform, opacity" }}
          aria-label="Music player"
        >
          <div
            className="mt-3"
            style={{
              backgroundColor: "color-mix(in srgb, var(--color-bg) 85%, transparent)",
              border: "1px solid var(--color-border)",
              padding: "8px 10px 6px",
            }}
          >
            {/* Row 1: transport + title/artist */}
            <div className="flex items-center gap-2.5">
              <div className="flex items-center gap-2">
                <ChipButton label="Previous track" onClick={prev}>
                  <SkipBackIcon size={11} />
                </ChipButton>
                <ChipButton label={isPlaying ? "Pause" : "Play"} onClick={togglePlay}>
                  {isPlaying ? <PauseIcon size={13} /> : <PlayIcon size={13} />}
                </ChipButton>
                <ChipButton label="Next track" onClick={next}>
                  <SkipForwardIcon size={11} />
                </ChipButton>
              </div>
              <div className="min-w-0 flex-1">
                <p
                  className="truncate"
                  style={{
                    fontSize: "11px",
                    fontWeight: 500,
                    color: "var(--color-fg)",
                    letterSpacing: "-0.005em",
                  }}
                >
                  {currentTrack.title}
                </p>
                <p
                  className="truncate"
                  style={{
                    fontSize: "10px",
                    fontWeight: 400,
                    color: "var(--color-fg-tertiary)",
                  }}
                >
                  {currentTrack.artist}
                </p>
              </div>
            </div>

            {/* Row 2: scrubber */}
            <div className="mt-2">
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

            {/* Row 3: scene toggles (multi-select) */}
            <div className="mt-2 flex items-center gap-2">
              {SCENES.map((s) => {
                const active = activeScenes.has(s.id);
                return (
                  <ChipButton
                    key={s.id}
                    label={`Toggle ${s.label} scene`}
                    onClick={() => toggleScene(s.id)}
                    active={active}
                  >
                    <SceneGlyph id={s.id} size={10} />
                  </ChipButton>
                );
              })}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

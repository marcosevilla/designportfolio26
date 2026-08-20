"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useAudioClock, useAudioPlayer } from "@/lib/AudioPlayerContext";
import { useVisualizerScene } from "@/lib/VisualizerSceneContext";
import { SCENES } from "@/lib/visualizer-scenes";
import LedMatrix from "@/components/LedMatrix";
import {
  PlayIcon,
  PauseIcon,
  SkipBackIcon,
  SkipForwardIcon,
} from "@/components/Icons";
import { typescale } from "@/lib/typography";
import { useNoHover } from "@/lib/useNoHover";
import InsetScrubber from "./InsetScrubber";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const EASE = [0.22, 1, 0.36, 1] as const;

/** Card width — GlobalToolbar's popover clamp imports this so the two
 *  can't drift. The card itself also caps at calc(100vw - 16px) so it
 *  never overflows a phone viewport. */
export const PANEL_WIDTH = 340;

// Peek heights for the collapsed visualizer — the top edge of the LED
// screen stays visible so it can be clicked back open; hovering the
// player nudges it out a little further.
const PEEK_REST = 10;
const PEEK_HOVER = 20;
const VIZ_HEIGHT = 148;

function formatTime(sec: number): string {
  if (!isFinite(sec) || sec < 0) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/** Filled triangle caret — the corner controls' glyph (collapse chevron,
 *  scene prev/next). Filled per the 2026-08-05 icon ruling: control icons
 *  are solid, not stroked. */
function CaretIcon({
  dir,
  size = 13,
}: {
  dir: "up" | "left" | "right";
  size?: number;
}) {
  const rotate =
    dir === "up" ? undefined : dir === "left" ? "rotate(-90 8 8)" : "rotate(90 8 8)";
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="currentColor"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M8 4.5L13.5 11h-11z" transform={rotate} />
    </svg>
  );
}

function MiniButton({
  label,
  tooltip,
  onClick,
  children,
}: {
  label: string;
  tooltip?: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <button
            type="button"
            onClick={onClick}
            aria-label={label}
            className="bio-toolbar-btn bio-toolbar-btn--lg focus:outline-none focus-visible:ring-2 focus-visible:ring-(--color-accent)"
          />
        }
      >
        {children}
      </TooltipTrigger>
      <TooltipContent>{tooltip ?? label}</TooltipContent>
    </Tooltip>
  );
}

/** Small square control that floats over the LED screen — theme bg,
 *  hairline outline, soft drop shadow so it contrasts with the matrix. */
function VizCornerButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <button
            type="button"
            onClick={onClick}
            aria-label={label}
            // viz-corner-btn: (pointer: coarse) hit-area growth in
            // globals.css — 28px visual stays, effective target ≥44.
            className="viz-corner-btn relative flex items-center justify-center cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-(--color-accent)"
            style={{
              width: 28,
              height: 28,
              borderRadius: 4,
              backgroundColor: "var(--color-bg)",
              border: "0.5px solid var(--color-border)",
              boxShadow:
                "0 1px 2px rgba(0,0,0,0.10), 0 3px 8px -2px rgba(0,0,0,0.16)",
              color: "var(--color-fg-secondary)",
            }}
          />
        }
      >
        {children}
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}

/**
 * Music player card — LED visualizer on top, transport + track info +
 * scrubber below. Extracted from the retired bottom-right MusicMiniWidget
 * dock (2026-08-05, git-recoverable) when the music entry point moved to
 * the GlobalToolbar's pixel-rain button. Positioning comes from the
 * caller (GlobalToolbar portals it below the trigger); open / close
 * lifecycle (outside click, Esc) also lives in the caller.
 *
 * Sized up 2026-08-05 (300 → 340 wide, 40px transport buttons, filled
 * icons) for touch friendliness; type sits on the typescale tokens
 * (h3 title / label artist / monoLabel times).
 *
 * Hovering anywhere on the card reveals the screen's floating corner
 * controls — scene prev/next carets top-right, collapse caret top-left.
 * When collapsed, the screen's top edge stays "peeking" (a little taller
 * while hovering); clicking the peek expands it again.
 */
export default function MusicPlayerPanel({
  style,
}: {
  style?: React.CSSProperties;
}) {
  const {
    isPlaying,
    currentTrack,
    duration,
    togglePlay,
    next,
    prev,
    seek,
  } = useAudioPlayer();
  // Separate subscription (audit F-18) — this is the only thing in the
  // player that needs the ~4 Hz playhead.
  const currentTime = useAudioClock();
  const { scene, setOnlyScene } = useVisualizerScene();

  const [vizOpen, setVizOpen] = useState(true);
  const [hovered, setHovered] = useState(false);
  // Touch devices never fire mouseenter — the corner controls (collapse,
  // scene prev/next) would be unreachable. Show them persistently there.
  const noHover = useNoHover();
  const [scrubbing, setScrubbing] = useState(false);
  const [scrubValue, setScrubValue] = useState(0);
  const displayTime = scrubbing ? scrubValue : currentTime;
  // Keep the extra rows open mid-drag even if the pointer strays.
  const revealed = hovered || scrubbing;

  const cycleScene = (dir: 1 | -1) => {
    const idx = SCENES.findIndex((s) => s.id === scene);
    const nextIdx = (idx + dir + SCENES.length) % SCENES.length;
    setOnlyScene(SCENES[nextIdx].id);
  };

  const vizHeight = vizOpen ? VIZ_HEIGHT : revealed ? PEEK_HOVER : PEEK_REST;

  return (
    <motion.div
      initial={{ opacity: 0, y: -8, filter: "blur(8px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      exit={{ opacity: 0, y: -8, filter: "blur(8px)" }}
      transition={{ duration: 0.26, ease: EASE }}
      className="music-player-panel flex flex-col overflow-hidden max-w-[calc(100vw-16px)]"
      style={{
        width: PANEL_WIDTH,
        backgroundColor: "var(--color-bg)",
        border: "0.5px solid var(--color-border)",
        borderRadius: 4,
        boxShadow:
          "0 2px 6px -2px rgba(0,0,0,0.08), 0 12px 32px -10px rgba(0,0,0,0.16)",
        ...style,
      }}
      aria-label="Music player"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocusCapture={() => setHovered(true)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
          setHovered(false);
        }
      }}
    >
      <TooltipProvider delay={100}>
        {/* LED screen — full height when open; collapsed it keeps a
            clickable "peek" of its top edge that grows slightly on
            player hover. Corner controls float over the screen on
            hover: collapse caret top-left, scene carets top-right. */}
        <motion.div
          animate={{ height: vizHeight }}
          transition={{ duration: 0.3, ease: EASE }}
          className="relative overflow-hidden shrink-0"
          style={{ borderBottom: "0.5px solid var(--color-border)" }}
        >
          {/* `active={vizOpen}` fixes audit F-17: collapsed, this box is
              10px tall with overflow hidden, but the matrix kept rendering
              its full 148px of pixels behind it every frame. The canvas
              stays MOUNTED (its GL programs, sim textures and particle
              state survive) — only the rAF loop parks. */}
          <LedMatrix height={VIZ_HEIGHT} active={vizOpen} />

          {/* Collapsed: the whole peek strip is the expand control. */}
          {!vizOpen && (
            <button
              type="button"
              onClick={() => setVizOpen(true)}
              aria-label="Expand visualizer"
              title="Expand visualizer"
              className="absolute inset-0 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-(--color-accent)"
              style={{ background: "transparent" }}
            />
          )}

          {/* Open + player hovered anywhere (or any touch device):
              floating corner controls. */}
          {vizOpen && (hovered || noHover) && (
            <motion.div
              key="viz-controls"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.18, ease: EASE }}
              className="absolute inset-x-0 top-0 flex items-start justify-between p-1.5 pointer-events-none"
            >
              <div className="pointer-events-auto">
                <VizCornerButton
                  label="Hide visualizer"
                  onClick={() => setVizOpen(false)}
                >
                  <CaretIcon dir="up" />
                </VizCornerButton>
              </div>
              <div className="flex items-center gap-1 pointer-events-auto">
                <VizCornerButton
                  label="Previous scene"
                  onClick={() => cycleScene(-1)}
                >
                  <CaretIcon dir="left" />
                </VizCornerButton>
                <VizCornerButton
                  label="Next scene"
                  onClick={() => cycleScene(1)}
                >
                  <CaretIcon dir="right" />
                </VizCornerButton>
              </div>
            </motion.div>
          )}
        </motion.div>

        <div className="flex flex-col px-4 py-3.5">
          {/* Always visible — transport left, track info right. */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 shrink-0">
              <MiniButton label="Previous track" tooltip="Previous" onClick={prev}>
                <SkipBackIcon size={18} />
              </MiniButton>
              <MiniButton
                label={isPlaying ? "Pause" : "Play"}
                tooltip={isPlaying ? "Pause" : "Play"}
                onClick={() => void togglePlay()}
              >
                {isPlaying ? <PauseIcon size={20} /> : <PlayIcon size={20} />}
              </MiniButton>
              <MiniButton label="Next track" tooltip="Next" onClick={next}>
                <SkipForwardIcon size={18} />
              </MiniButton>
            </div>
            <div className="flex flex-col min-w-0 flex-1 items-end text-right">
              <p
                className="truncate w-full"
                style={{ ...typescale.h3, color: "var(--color-fg)" }}
              >
                {currentTrack.title}
              </p>
              <p
                className="truncate w-full"
                style={{ ...typescale.label, color: "var(--color-fg-tertiary)" }}
              >
                {currentTrack.artist}
              </p>
            </div>
          </div>

          {/* Scrubber — always visible. Elapsed | bar | total. */}
          <div>
            <div
              className="flex items-center gap-2 pt-2.5"
              style={{
                ...typescale.monoLabel,
                lineHeight: 1,
                color: "var(--color-fg-tertiary)",
              }}
            >
              <span className="tabular-nums shrink-0" style={{ minWidth: 34 }}>
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
                  restingHeight={3}
                  expandedHeight={4}
                  thumbSize={12}
                />
              </div>
              <span
                className="tabular-nums shrink-0 text-right"
                style={{ minWidth: 34 }}
              >
                {formatTime(duration)}
              </span>
            </div>
          </div>
        </div>
      </TooltipProvider>
    </motion.div>
  );
}

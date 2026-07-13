"use client";

import { useState } from "react";
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
  MusicNoteIcon,
  ChevronUpIcon,
  ChevronDownIcon,
} from "@/components/Icons";
import InsetScrubber from "./InsetScrubber";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const EASE = [0.22, 1, 0.36, 1] as const;

/** Picture-in-picture-style glyph: frame with a filled rect in the
 *  bottom-right corner — "collapse the player into the corner dock". */
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
      <rect x="1.5" y="1.5" width="13" height="13" stroke="currentColor" strokeWidth="1.4" />
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

function MiniButton({
  label,
  tooltip,
  onClick,
  active = false,
  small = false,
  children,
}: {
  label: string;
  tooltip?: string;
  onClick: () => void;
  active?: boolean;
  small?: boolean;
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
            aria-pressed={active || undefined}
            className={`bio-toolbar-btn${active ? " bio-toolbar-btn--active" : ""} focus:outline-none focus-visible:ring-2 focus-visible:ring-(--color-accent)`}
            style={small ? { width: 24, height: 24 } : undefined}
          />
        }
      >
        {children}
      </TooltipTrigger>
      <TooltipContent>{tooltip ?? label}</TooltipContent>
    </Tooltip>
  );
}

/** Numbered visualizer-scene toggles (migrated from the retired
 *  MusicOverlay) — compact 24px buttons; hover reveals the scene name. */
function SceneToggles() {
  const { activeScenes, toggleScene } = useVisualizerScene();
  return (
    <div className="flex items-center gap-1">
      {SCENES.map((s, idx) => (
        <MiniButton
          key={s.id}
          label={`Toggle ${s.label} scene`}
          tooltip={s.label}
          onClick={() => toggleScene(s.id)}
          active={activeScenes.has(s.id)}
          small
        >
          <span
            style={{
              fontFamily: "var(--font-geist-mono), ui-monospace, Menlo, monospace",
              fontSize: 11,
              fontWeight: 500,
              lineHeight: 1,
            }}
          >
            {idx + 1}
          </span>
        </MiniButton>
      ))}
    </div>
  );
}

/**
 * Music dock — the single entrypoint + surface for the audio player.
 * Fixed to the bottom-right corner on every route:
 *
 * - Collapsed: a floating round button with a soft drop shadow. Clicking
 *   it opens the mini player (and starts playback on first open).
 * - Expanded: the mini player card with the LED visualizer attached to
 *   its top. A chevron collapses/expands the visualizer; the PiP glyph
 *   minimizes the whole card back to the round button (playback keeps
 *   going). All transport + scene controls live here — the old
 *   full-screen MusicOverlay is retired.
 */
export default function MusicMiniWidget() {
  const {
    session,
    isPlaying,
    currentTrack,
    currentTime,
    duration,
    play,
    togglePlay,
    next,
    prev,
    seek,
  } = useAudioPlayer();

  const [expanded, setExpanded] = useState(false);
  const [vizOpen, setVizOpen] = useState(true);
  const [scrubbing, setScrubbing] = useState(false);
  const [scrubValue, setScrubValue] = useState(0);
  const displayTime = scrubbing ? scrubValue : currentTime;

  const openDock = () => {
    setExpanded(true);
    if (session !== "active") {
      void play();
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-[60] flex flex-col items-end">
      <AnimatePresence mode="wait" initial={false}>
        {!expanded ? (
          // ── Collapsed: floating entry button ──
          <motion.button
            key="dock-fab"
            type="button"
            onClick={openDock}
            aria-label="Open music player"
            initial={{ opacity: 0, scale: 0.85, filter: "blur(6px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 0.85, filter: "blur(6px)" }}
            transition={{ duration: 0.22, ease: EASE }}
            className="flex items-center justify-center cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-(--color-accent)"
            style={{
              width: 44,
              height: 44,
              borderRadius: "50%",
              backgroundColor: "var(--color-bg)",
              border: "0.5px solid var(--color-border)",
              boxShadow:
                "0 2px 6px -2px rgba(0,0,0,0.08), 0 8px 24px -8px rgba(0,0,0,0.14)",
              color: isPlaying
                ? "var(--color-accent)"
                : "var(--color-fg-secondary)",
            }}
          >
            <MusicNoteIcon size={17} />
          </motion.button>
        ) : (
          // ── Expanded: mini player with LED visualizer on top ──
          <motion.div
            key="dock-panel"
            initial={{ opacity: 0, y: 12, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: 12, filter: "blur(8px)" }}
            transition={{ duration: 0.26, ease: EASE }}
            className="w-[300px] flex flex-col overflow-hidden"
            style={{
              backgroundColor: "var(--color-bg)",
              border: "0.5px solid var(--color-border)",
              borderRadius: 4,
              boxShadow:
                "0 2px 6px -2px rgba(0,0,0,0.08), 0 12px 32px -10px rgba(0,0,0,0.16)",
            }}
            aria-label="Music player"
          >
            <TooltipProvider delay={100}>
              {/* Visualizer — attached to the top of the card, collapsible
                  via the chevron in the header row below. */}
              <AnimatePresence initial={false}>
                {vizOpen && (
                  <motion.div
                    key="viz"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 132, opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: EASE }}
                    className="overflow-hidden shrink-0"
                    style={{
                      borderBottom: "0.5px solid var(--color-border)",
                    }}
                  >
                    <LedMatrix height={132} />
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex flex-col gap-2 px-3 py-3">
                {/* Header — track info left; visualizer chevron + minimize
                    pinned right. */}
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
                      label={vizOpen ? "Hide visualizer" : "Show visualizer"}
                      tooltip={vizOpen ? "Hide visualizer" : "Show visualizer"}
                      onClick={() => setVizOpen((v) => !v)}
                    >
                      {vizOpen ? (
                        <ChevronUpIcon size={12} />
                      ) : (
                        <ChevronDownIcon size={12} />
                      )}
                    </MiniButton>
                    <MiniButton
                      label="Minimize player"
                      tooltip="Minimize"
                      onClick={() => setExpanded(false)}
                    >
                      <MinimizeIcon size={13} />
                    </MiniButton>
                  </div>
                </div>

                {/* Transport + scene toggles. */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <MiniButton label="Previous track" tooltip="Previous" onClick={prev}>
                      <SkipBackIcon size={14} />
                    </MiniButton>
                    <MiniButton
                      label={isPlaying ? "Pause" : "Play"}
                      tooltip={isPlaying ? "Pause" : "Play"}
                      onClick={() => void togglePlay()}
                    >
                      {isPlaying ? <PauseIcon size={16} /> : <PlayIcon size={16} />}
                    </MiniButton>
                    <MiniButton label="Next track" tooltip="Next" onClick={next}>
                      <SkipForwardIcon size={14} />
                    </MiniButton>
                  </div>
                  <SceneToggles />
                </div>

                {/* Scrubber — elapsed | bar | total. */}
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
              </div>
            </TooltipProvider>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

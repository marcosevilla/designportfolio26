"use client";

import { useState } from "react";
import { useAudioPlayer } from "@/lib/AudioPlayerContext";
import { formatTime } from "@/lib/format-time";
import {
  PlayIcon,
  PauseIcon,
  SkipBackIcon,
  SkipForwardIcon,
} from "@/components/Icons";
import SeekBar from "./SeekBar";

function TransportButton({
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
      className="flex items-center justify-center transition-colors text-(--color-fg-secondary) hover:text-(--color-accent) cursor-pointer"
    >
      {children}
    </button>
  );
}

export default function PlayerPanel() {
  const {
    isPlaying,
    currentTrack,
    currentTime,
    duration,
    togglePlay,
    next,
    prev,
    seek,
  } = useAudioPlayer();

  // While the user is actively dragging the scrubber, hold the displayed
  // value locally so it doesn't fight with timeupdate events from the audio
  // element. Commit to audio on every change (so visualizer follows live).
  const [scrubbing, setScrubbing] = useState(false);
  const [scrubValue, setScrubValue] = useState(0);
  const displayTime = scrubbing ? scrubValue : currentTime;

  return (
    <div aria-label="Music player">
      {/* Top row — full transport + song info */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <TransportButton label="Previous track" onClick={prev}>
            <SkipBackIcon size={14} />
          </TransportButton>
          <TransportButton
            label={isPlaying ? "Pause" : "Play"}
            onClick={togglePlay}
          >
            {isPlaying ? <PauseIcon size={16} /> : <PlayIcon size={16} />}
          </TransportButton>
          <TransportButton label="Next track" onClick={next}>
            <SkipForwardIcon size={14} />
          </TransportButton>
        </div>
        <div className="min-w-0 flex-1">
          <p
            className="truncate"
            style={{
              fontSize: "12px",
              fontWeight: 500,
              color: "var(--color-fg)",
              letterSpacing: "-0.005em",
            }}
          >
            {currentTrack.title}
          </p>
          <p
            className="truncate mt-0.5"
            style={{
              fontSize: "11px",
              fontWeight: 400,
              color: "var(--color-fg-tertiary)",
            }}
          >
            {currentTrack.artist}
          </p>
        </div>
      </div>

      {/* Bottom row — scrubbable progress bar */}
      <div className="mt-3 flex items-center gap-3">
        <span
          className="tabular-nums shrink-0"
          style={{ fontSize: "10px", color: "var(--color-fg-tertiary)" }}
        >
          {formatTime(displayTime)}
        </span>
        <div className="flex-1">
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
        <span
          className="tabular-nums shrink-0"
          style={{ fontSize: "10px", color: "var(--color-fg-tertiary)" }}
        >
          {formatTime(duration)}
        </span>
      </div>
    </div>
  );
}

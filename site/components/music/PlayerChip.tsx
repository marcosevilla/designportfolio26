"use client";

import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { useAudioPlayer } from "@/lib/AudioPlayerContext";
import {
  PlayIcon,
  PauseIcon,
  SkipBackIcon,
  SkipForwardIcon,
  CloseIcon,
} from "@/components/Icons";

function ChipButton({
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

export default function PlayerChip() {
  const pathname = usePathname();
  const { currentTrack, isPlaying, togglePlay, next, prev, closeSession, session } =
    useAudioPlayer();

  const onHome = pathname === "/";
  const visible = !onHome && session === "active";

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="player-chip"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="fixed bottom-4 right-4 z-50 w-[280px]"
          aria-label="Music player (mini)"
        >
          {/* Subtle frosted backdrop for legibility against arbitrary page content */}
          <div
            className="flex items-center gap-3 px-3 py-2 backdrop-blur-md"
            style={{
              backgroundColor: "color-mix(in srgb, var(--color-bg) 85%, transparent)",
              border: "1px solid var(--color-border)",
            }}
          >
            <div className="flex items-center gap-2.5">
              <ChipButton label="Previous track" onClick={prev}>
                <SkipBackIcon size={12} />
              </ChipButton>
              <ChipButton
                label={isPlaying ? "Pause" : "Play"}
                onClick={togglePlay}
              >
                {isPlaying ? <PauseIcon size={14} /> : <PlayIcon size={14} />}
              </ChipButton>
              <ChipButton label="Next track" onClick={next}>
                <SkipForwardIcon size={12} />
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
            <ChipButton label="Close player" onClick={closeSession}>
              <CloseIcon size={10} />
            </ChipButton>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence } from "framer-motion";
import HeaderToolbar from "./HeaderToolbar";
import PixelRain from "./PixelRain";
import MusicPlayerPanel from "./music/MusicPlayerPanel";
import { useAudioPlayer } from "@/lib/AudioPlayerContext";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const PANEL_WIDTH = 300; // MusicPlayerPanel's w-[300px]

/**
 * Global toolbar — fixed to the viewport top on EVERY route, floating
 * above all page content (Aug 2026 Figma `controls` frame, node
 * 264:4254). The bar itself is pointer-transparent; only the two
 * clusters take clicks:
 *
 * - Left: the PixelRain LED glyph — the music player's single entry
 *   point (migrated here from the retired bottom-right dock FAB).
 *   Clicking it opens the player card below the glyph and starts
 *   playback on first open.
 * - Right: light/dark toggle + theme palette (HeaderToolbar). Time /
 *   weather (LocalStatus) was dropped from the chrome per the same
 *   Figma pass.
 *
 * The inner row shares the page canvas (--grid-max + px-4 sm:px-8) so
 * the clusters align with the content edges at every width.
 */
export default function GlobalToolbar() {
  const [musicOpen, setMusicOpen] = useState(false);
  const { session, isPlaying, play } = useAudioPlayer();
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  const toggleMusic = () => {
    setMusicOpen((open) => {
      if (!open && session !== "active") void play();
      return !open;
    });
  };

  // Outside click / Esc closes the player. The trigger is excluded so
  // its own toggle doesn't fight the outside-close and reopen the panel.
  useEffect(() => {
    if (!musicOpen) return;
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node;
      if (triggerRef.current?.contains(target)) return;
      if ((target as Element | null)?.closest?.(".music-player-panel")) return;
      setMusicOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMusicOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [musicOpen]);

  return (
    <header className="fixed inset-x-0 top-0 z-[150] pointer-events-none">
      {/* h-14 matches MobileNav's case-study bar exactly, so on mobile
          case studies the two layers read as ONE 56px band (MobileNav
          insets its Back/hamburger around these clusters). */}
      <div className="mx-auto flex h-14 w-full max-w-(--grid-max) items-center justify-between gap-4 px-4 sm:px-8">
        <TooltipProvider delay={100}>
          <Tooltip>
            <TooltipTrigger
              render={
                <button
                  ref={triggerRef}
                  type="button"
                  onClick={toggleMusic}
                  aria-label={musicOpen ? "Close music player" : "Open music player"}
                  aria-expanded={musicOpen}
                  // -m-2/p-2 grows the hit area without moving the
                  // glyph off the canvas edge.
                  className="pointer-events-auto -m-2 p-2 cursor-pointer transition-colors duration-150 text-(--color-fg-secondary) hover:text-(--color-accent) focus:outline-none focus-visible:ring-2 focus-visible:ring-(--color-accent)"
                  style={
                    isPlaying || musicOpen
                      ? { color: "var(--color-accent)" }
                      : undefined
                  }
                />
              }
            >
              <PixelRain />
            </TooltipTrigger>
            <TooltipContent>Music</TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <div className="pointer-events-auto">
          <HeaderToolbar />
        </div>
      </div>
      <MusicPopover open={musicOpen} anchorRef={triggerRef} />
    </header>
  );
}

/** Portal so the header's pointer-events/fixed context never clips the
 *  card. Left-aligned to the trigger (top-left toolbar corner), clamped
 *  so the 300px card can't slide off narrow viewports. */
function MusicPopover({
  open,
  anchorRef,
}: {
  open: boolean;
  anchorRef: React.RefObject<HTMLButtonElement | null>;
}) {
  const [mounted, setMounted] = useState(false);
  const [pos, setPos] = useState<{ left: number; top: number } | null>(null);

  useEffect(() => setMounted(true), []);

  useLayoutEffect(() => {
    if (!open) return;
    const update = () => {
      const el = anchorRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      setPos({
        left: Math.max(
          8,
          Math.min(rect.left, window.innerWidth - PANEL_WIDTH - 8),
        ),
        top: rect.bottom + 10,
      });
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [open, anchorRef]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && pos && (
        <MusicPlayerPanel
          key="music-panel"
          style={{ position: "fixed", left: pos.left, top: pos.top, zIndex: 200 }}
        />
      )}
    </AnimatePresence>,
    document.body,
  );
}

"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence } from "framer-motion";
import Grid, { Col } from "@/components/layout/Grid";
import { CONTENT_BAND, CONTENT_BAND_MD } from "@/lib/layout-presets";
import HeaderToolbar from "./HeaderToolbar";
import PixelRain from "./PixelRain";
import MusicPlayerPanel, { PANEL_WIDTH } from "./music/MusicPlayerPanel";
import BottomSheet, { useIsMobileViewport } from "@/components/ui/BottomSheet";
import { useAudioPlayer } from "@/lib/AudioPlayerContext";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

/**
 * Global toolbar — an in-flow row at the top of every route (un-fixed
 * 2026-08-05 on Marco's call; the fixed z-150 era lasted one day). It sits
 * on the CONTENT_BAND columns — the same band the page content reads on —
 * so on the homepage the pixel glyph is left-aligned with "Marco Sevilla"
 * and the controls are right-aligned with the bio's edge. It scrolls away
 * with the page.
 *
 * - Left: the PixelRain LED glyph — the music player's single entry
 *   point. Clicking it opens the player card below the glyph and starts
 *   playback on first open.
 * - Right: light/dark toggle + theme swatch (HeaderToolbar).
 */
export default function GlobalToolbar() {
  const [musicOpen, setMusicOpen] = useState(false);
  const { session, isPlaying, play } = useAudioPlayer();
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const isMobile = useIsMobileViewport();

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
      // .bottom-sheet: on mobile the panel lives in a sheet whose grabber
      // and padding sit outside .music-player-panel — taps there must not
      // read as "outside" (the sheet owns its own scrim/drag dismissal).
      if (
        (target as Element | null)?.closest?.(
          ".music-player-panel, .bottom-sheet",
        )
      )
        return;
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
    <header className="w-full max-w-(--grid-max) mx-auto px-4 sm:px-8 pt-12">
      <Grid>
        <Col md={CONTENT_BAND_MD} lg={CONTENT_BAND}>
          <div className="flex h-9 items-center justify-between">
            <TooltipProvider delay={100}>
              <Tooltip>
                <TooltipTrigger
                  render={
                    <button
                      ref={triggerRef}
                      type="button"
                      onClick={toggleMusic}
                      aria-label={
                        musicOpen ? "Close music player" : "Open music player"
                      }
                      aria-expanded={musicOpen}
                      // -m-2/p-2 grows the hit area without moving the
                      // glyph off the band's left edge.
                      className="-m-2 p-2 cursor-pointer transition-colors duration-150 text-(--color-fg-secondary) hover:text-(--color-accent) focus:outline-none focus-visible:ring-2 focus-visible:ring-(--color-accent)"
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
            {/* -mr-2 pulls the last button's glyph (15px centered in the
                32px box → ~8px inset) optically flush with the band edge. */}
            <div className="-mr-2">
              <HeaderToolbar />
            </div>
          </div>
        </Col>
      </Grid>
      {isMobile ? (
        <BottomSheet
          open={musicOpen}
          onClose={() => setMusicOpen(false)}
          ariaLabel="Music player"
        >
          {/* The sheet supplies the surface chrome — strip the card's
              own border/shadow/width so it fills the sheet edge-to-edge
              (inline style wins over the max-w class). */}
          <MusicPlayerPanel
            style={{
              width: "100%",
              maxWidth: "100%",
              border: 0,
              borderRadius: 0,
              boxShadow: "none",
            }}
          />
        </BottomSheet>
      ) : (
        <MusicPopover open={musicOpen} anchorRef={triggerRef} />
      )}
    </header>
  );
}

/** Portal so no ancestor stacking/overflow context clips the card.
 *  Left-aligned to the trigger, clamped so the card can't slide off
 *  narrow viewports. Tracks scroll — the toolbar is in-flow now, so the
 *  anchor moves with the page. */
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
    window.addEventListener("scroll", update, true);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
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

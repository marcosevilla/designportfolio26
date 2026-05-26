"use client";

import { useAudioPlayer } from "@/lib/AudioPlayerContext";

/** Wraps the page's <main> content so it can blur out while the music
 *  overlay is open. Pure CSS via inline style — no animation library
 *  needed because we want the blur to track overlay state instantly,
 *  and the framer-motion overlay handles its own fade. */
export default function MainBlurLayer({ children }: { children: React.ReactNode }) {
  const { overlayOpen } = useAudioPlayer();
  return (
    <div
      style={{
        // Critical: only set `filter` when the overlay is open. ANY
        // non-`none` filter value (including blur(0px)) creates a
        // containing block for position:fixed descendants, which would
        // re-anchor the homepage's xl:fixed left nav to this wrapper and
        // break the "stays put while scrolling" behavior. Opacity carries
        // the smooth transition; filter snaps in/out, which is fine
        // because the visible delta happens behind the overlay's own
        // tinted fade-in.
        filter: overlayOpen ? "blur(12px)" : undefined,
        opacity: overlayOpen ? 0.5 : 1,
        pointerEvents: overlayOpen ? "none" : "auto",
        transition: "opacity 280ms cubic-bezier(0.22, 1, 0.36, 1)",
      }}
    >
      {children}
    </div>
  );
}

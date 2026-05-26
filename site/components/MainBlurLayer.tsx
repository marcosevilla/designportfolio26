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
        filter: overlayOpen ? "blur(12px)" : "blur(0px)",
        opacity: overlayOpen ? 0.5 : 1,
        // Disable interactions on the blurred-out content so clicks fall
        // through visually but get caught by the overlay's backdrop.
        pointerEvents: overlayOpen ? "none" : "auto",
        transition:
          "filter 280ms cubic-bezier(0.22, 1, 0.36, 1), opacity 280ms cubic-bezier(0.22, 1, 0.36, 1)",
      }}
    >
      {children}
    </div>
  );
}

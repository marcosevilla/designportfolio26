"use client";

import { useAudioPlayer } from "@/lib/AudioPlayerContext";
import { useChatOverlay } from "@/lib/ChatOverlayContext";

/** Wraps the page's <main> content so it can blur out while a full-screen
 *  overlay owns the screen (music player overlay, chat). The nav drawer
 *  intentionally does NOT blur the content — its own backdrop provides
 *  the dim + click-to-close. Only applies `filter` while an overlay is
 *  open — any non-`none` filter value creates a containing block for
 *  position:fixed descendants (same gotcha as transform), which would
 *  re-anchor the homepage's xl:fixed elements to this wrapper. Opacity
 *  carries the smooth transition. */
export default function MainBlurLayer({ children }: { children: React.ReactNode }) {
  const { overlayOpen } = useAudioPlayer();
  const { chatOpen } = useChatOverlay();
  const blurred = overlayOpen || chatOpen;
  return (
    <div
      style={{
        filter: blurred ? "blur(12px)" : undefined,
        opacity: blurred ? 0.5 : 1,
        pointerEvents: blurred ? "none" : "auto",
        transition: "opacity 280ms cubic-bezier(0.22, 1, 0.36, 1)",
      }}
    >
      {children}
    </div>
  );
}

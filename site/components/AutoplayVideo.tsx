"use client";

// Ambient autoplaying video that behaves: plays only while on screen
// (IntersectionObserver pauses it offscreen) and never autoplays for
// reduced-motion users. Drop-in replacement for the bare
// <video autoPlay loop muted playsInline> ambient media — same props
// surface, minus autoPlay (managed here). Because there's no autoPlay
// attribute, the browser never fetches media until we ask it to.

import { useEffect, useRef } from "react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

type Props = Omit<React.VideoHTMLAttributes<HTMLVideoElement>, "autoPlay">;

// Play band: starts playback ~half a viewport before the video scrolls
// in — poster-less videos were painting blank frames for fast scrollers.
// Offscreen-pause still kicks in past that band.
const PLAY_MARGIN = "50% 0px 50% 0px";
// Preload band: a viewport and a half out, so the first frame is decoded
// and ready *before* the play band is reached, but a video parked far
// down the page never costs the visitor a request. Two ambient clips in
// this project are 15–17 MB, so "not yet" is the right default.
const PRELOAD_MARGIN = "150% 0px 150% 0px";

export default function AutoplayVideo({ preload, ...props }: Props) {
  const ref = useRef<HTMLVideoElement>(null);
  // Fixes audit F-36: reduced-motion used to be sampled once inside the
  // mount effect with no `change` listener, so toggling the OS setting
  // did nothing until a full remount. The hook subscribes properly, and
  // it's a dependency here so the observers are rewired on every flip.
  const prefersReducedMotion = usePrefersReducedMotion();
  // Only manage preload when the caller hasn't pinned it.
  const managePreload = preload === undefined;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Lazy metadata (F-32 mitigation): the element renders with
    // `preload="none"`, so heavy ambient clips below the fold cost the
    // visitor nothing on page load. This promotes to "metadata" a
    // viewport and a half out — ahead of the play band, so the first
    // frame is ready by the time playback starts. Runs regardless of
    // reduced motion: the poster frame is content, not motion.
    let preloadIo: IntersectionObserver | null = null;
    if (managePreload && el.preload !== "metadata") {
      preloadIo = new IntersectionObserver(
        ([entry]) => {
          if (!entry.isIntersecting) return;
          el.preload = "metadata";
          // Never interrupt an in-flight fetch or playback — the play
          // observer below can legitimately fire first on a deep link.
          if (el.paused && el.readyState === 0) el.load();
          preloadIo?.disconnect();
          preloadIo = null;
        },
        { rootMargin: PRELOAD_MARGIN }
      );
      preloadIo.observe(el);
    }

    if (prefersReducedMotion) {
      el.pause();
      return () => preloadIo?.disconnect();
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.play().catch(() => {
            /* autoplay block — poster/first frame stays */
          });
        } else {
          el.pause();
        }
      },
      { threshold: 0.2, rootMargin: PLAY_MARGIN }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      preloadIo?.disconnect();
    };
  }, [prefersReducedMotion, managePreload]);

  return (
    <video
      ref={ref}
      loop
      muted
      playsInline
      preload={managePreload ? "none" : preload}
      {...props}
    />
  );
}

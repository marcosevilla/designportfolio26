"use client";

// Ambient autoplaying video that behaves: plays only while on screen
// (IntersectionObserver pauses it offscreen) and never autoplays for
// reduced-motion users. Drop-in replacement for the bare
// <video autoPlay loop muted playsInline> ambient media — same props
// surface, minus autoPlay (managed here). Because there's no autoPlay
// attribute, preload="metadata" actually holds until the frame scrolls
// into view instead of the browser fetching every video on page load.

import { useEffect, useRef } from "react";

type Props = Omit<React.VideoHTMLAttributes<HTMLVideoElement>, "autoPlay">;

export default function AutoplayVideo(props: Props) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

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
      // rootMargin starts playback ~half a viewport before the video
      // scrolls in — poster-less videos were painting blank frames for
      // fast scrollers. Offscreen-pause still kicks in past that band.
      { threshold: 0.2, rootMargin: "50% 0px 50% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <video ref={ref} loop muted playsInline preload="metadata" {...props} />
  );
}

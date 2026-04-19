// site/components/pixel-canvas/PixelCanvas.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { startEngine } from "./engine";
import { readPalette } from "./palette";
import type { Palette, Scene } from "./types";

type Props = {
  scene: Scene<any>;
  widthCssPx: number;
  heightCssPx: number;
  pixelScale?: number; // integer upscale; logical px = css / scale
  className?: string;
  style?: React.CSSProperties;
};

export default function PixelCanvas({
  scene,
  widthCssPx,
  heightCssPx,
  pixelScale = 2,
  className,
  style,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const paletteRef = useRef<Palette | null>(null);
  const reducedMotionRef = useRef(false);
  const pausedRef = useRef(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const logicalW = Math.round(widthCssPx / pixelScale);
    const logicalH = Math.round(heightCssPx / pixelScale);
    canvas.width = logicalW;
    canvas.height = logicalH;
    ctx.imageSmoothingEnabled = false;

    // Palette
    paletteRef.current = readPalette();
    const themeObserver = new MutationObserver(() => {
      paletteRef.current = readPalette();
    });
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "data-theme"],
    });

    // Reduced motion
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    reducedMotionRef.current = mql.matches;
    const onReducedChange = (e: MediaQueryListEvent) => {
      reducedMotionRef.current = e.matches;
    };
    mql.addEventListener("change", onReducedChange);

    // IntersectionObserver — pause when off-screen
    let intersecting = true;
    const io = new IntersectionObserver(
      ([entry]) => { intersecting = entry.isIntersecting; },
      { threshold: 0.1 }
    );
    io.observe(canvas);

    // Visibility API — pause on tab switch
    const onVisibility = () => {
      pausedRef.current = document.hidden || !intersecting;
    };
    document.addEventListener("visibilitychange", onVisibility);

    const stop = startEngine({
      ctx,
      scene,
      width: logicalW,
      height: logicalH,
      getPalette: () => paletteRef.current!,
      getReducedMotion: () => reducedMotionRef.current,
      getPaused: () => document.hidden || !intersecting,
    });

    return () => {
      stop();
      themeObserver.disconnect();
      mql.removeEventListener("change", onReducedChange);
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [mounted, scene, widthCssPx, heightCssPx, pixelScale]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={className}
      style={{
        width: widthCssPx,
        height: heightCssPx,
        imageRendering: "pixelated",
        pointerEvents: "none",
        ...style,
      }}
    />
  );
}

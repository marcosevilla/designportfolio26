"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useAudioPlayer } from "@/lib/AudioPlayerContext";
import { GLYPH_7x7, drawGlyph } from "@/lib/dot-font";

const CELL = 5;

const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

function readCssVar(name: string, fallback: string): string {
  if (typeof window === "undefined") return fallback;
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v || fallback;
}

export default function LedMatrixUI() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const sizeRef = useRef({ cssW: 0, cssH: 0, cols: 0, rows: 0, dpr: 1 });
  const [revealed, setRevealed] = useState(false);

  const { isPlaying } = useAudioPlayer();

  // Locate the parent wrapper once.
  useIsoLayoutEffect(() => {
    wrapperRef.current = canvasRef.current?.parentElement as HTMLDivElement | null;
  }, []);

  // Resize sync — also calls drawNow after every sync.
  useIsoLayoutEffect(() => {
    const canvas = canvasRef.current;
    const parent = wrapperRef.current;
    if (!canvas || !parent) return;

    const sync = () => {
      const rect = parent.getBoundingClientRect();
      const cssW = rect.width;
      const cssH = rect.height;
      const dpr = window.devicePixelRatio || 1;
      const cols = Math.max(1, Math.floor(cssW / CELL));
      const rows = Math.max(1, Math.floor(cssH / CELL));
      sizeRef.current = { cssW, cssH, cols, rows, dpr };
      canvas.style.width = `${cssW}px`;
      canvas.style.height = `${cssH}px`;
      canvas.width = Math.round(cssW * dpr);
      canvas.height = Math.round(cssH * dpr);
      const ctx = canvas.getContext("2d");
      if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      drawNow();
    };

    sync();
    const ro = new ResizeObserver(() => requestAnimationFrame(sync));
    ro.observe(parent);
    window.addEventListener("resize", sync);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", sync);
    };
    // drawNow captured via closure; deps cover its inputs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [revealed, isPlaying]);

  // Hover detection on the parent.
  useEffect(() => {
    const parent = wrapperRef.current;
    if (!parent) return;
    const onEnter = () => setRevealed(true);
    const onLeave = () => setRevealed(false);
    parent.addEventListener("mouseenter", onEnter);
    parent.addEventListener("mouseleave", onLeave);
    return () => {
      parent.removeEventListener("mouseenter", onEnter);
      parent.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  // Single draw entry point.
  const drawNow = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const { cssW, cssH, cols, rows } = sizeRef.current;
    ctx.clearRect(0, 0, cssW, cssH);

    if (!revealed) return;

    const accent = readCssVar("--color-accent", "#B5651D");

    if (!isPlaying) {
      // 7×7 play glyph centered.
      const originCol = Math.floor(cols / 2) - 3;
      const originRow = Math.floor(rows / 2) - 3;
      drawGlyph(ctx, GLYPH_7x7.play, originCol, originRow, CELL, accent);
    }
  };

  // Redraw on state change.
  useEffect(() => {
    drawNow();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [revealed, isPlaying]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="absolute inset-0 pointer-events-none"
    />
  );
}

"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useAudioPlayer } from "@/lib/AudioPlayerContext";
import { useVisualizerScene } from "@/lib/VisualizerSceneContext";
import { SCENES } from "@/lib/visualizer-scenes";
import { GLYPH_7x7, GLYPH_5x5_SCENES, drawGlyph, drawText, truncateToCols } from "@/lib/dot-font";

const CELL = 5;

const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

function readCssVar(name: string, fallback: string): string {
  if (typeof window === "undefined") return fallback;
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v || fallback;
}

function withAlpha(color: string, alpha: number): string {
  // Color is "#RRGGBB", "#RGB", or "rgb(...)" — convert to rgba.
  if (color.startsWith("#") && (color.length === 7 || color.length === 4)) {
    const r = parseInt(color.length === 4 ? color[1] + color[1] : color.slice(1, 3), 16);
    const g = parseInt(color.length === 4 ? color[2] + color[2] : color.slice(3, 5), 16);
    const b = parseInt(color.length === 4 ? color[3] + color[3] : color.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${alpha})`;
  }
  if (color.startsWith("rgb(")) return color.replace("rgb(", "rgba(").replace(")", `,${alpha})`);
  return color;
}

export default function LedMatrixUI() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const sizeRef = useRef({ cssW: 0, cssH: 0, cols: 0, rows: 0, dpr: 1 });
  const [revealed, setRevealed] = useState(false);

  const { isPlaying, togglePlay, currentTrack, next, prev } = useAudioPlayer();
  const { activeScenes, setOnlyScene } = useVisualizerScene();

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

  // Click handler for play glyph.
  useEffect(() => {
    const parent = wrapperRef.current;
    if (!parent) return;
    const onClick = (e: MouseEvent) => {
      if (!revealed) return;
      const rect = parent.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const { cols, rows } = sizeRef.current;
      const col = Math.floor(x / CELL);
      const row = Math.floor(y / CELL);
      // Center band: rows within ±5 of grid mid, cols within ±15 of grid mid.
      const midC = Math.floor(cols / 2);
      const midR = Math.floor(rows / 2);
      if (Math.abs(row - midR) <= 5 && Math.abs(col - midC) <= 15) {
        togglePlay();
      }
    };
    parent.addEventListener("click", onClick);
    return () => parent.removeEventListener("click", onClick);
  }, [revealed, togglePlay]);

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
    const dim = withAlpha(accent, 0.4);

    // ── Idle revealed: just the play glyph ──
    if (!isPlaying) {
      const originCol = Math.floor(cols / 2) - 3;
      const originRow = Math.floor(rows / 2) - 3;
      drawGlyph(ctx, GLYPH_7x7.play, originCol, originRow, CELL, accent);
      return;
    }

    // ── Playing revealed ──

    // Title (top-left)
    const titleCols = Math.max(0, cols - 36); // leave room for scene picker
    const title = truncateToCols(currentTrack.title ?? "", Math.min(titleCols, 40));
    drawText(ctx, title, 2, 3, CELL, accent);

    // Artist (top-left, line 2)
    const artist = truncateToCols(currentTrack.artist ?? "", Math.min(titleCols, 40));
    drawText(ctx, artist, 2, 10, CELL, dim);

    // Scene picker (top-right)
    const SCENE_W = 5;
    const SCENE_GAP = 1;
    const ICONS_W = SCENES.length * SCENE_W + (SCENES.length - 1) * SCENE_GAP;
    const sceneOriginCol = cols - ICONS_W - 2;
    for (let i = 0; i < SCENES.length; i++) {
      const id = SCENES[i].id as keyof typeof GLYPH_5x5_SCENES;
      const isActive = activeScenes.has(id);
      drawGlyph(
        ctx,
        GLYPH_5x5_SCENES[id],
        sceneOriginCol + i * (SCENE_W + SCENE_GAP),
        3,
        CELL,
        isActive ? accent : dim
      );
    }

    // Center transport: prev / pause / next, 7×7 each, gap 4 cells
    const transportW = 7 + 4 + 7 + 4 + 7;
    const transportOriginCol = Math.floor(cols / 2) - Math.floor(transportW / 2);
    const transportOriginRow = Math.floor(rows / 2) - 3;
    drawGlyph(ctx, GLYPH_7x7.prev,  transportOriginCol,      transportOriginRow, CELL, dim);
    drawGlyph(ctx, GLYPH_7x7.pause, transportOriginCol + 11, transportOriginRow, CELL, accent);
    drawGlyph(ctx, GLYPH_7x7.next,  transportOriginCol + 22, transportOriginRow, CELL, dim);
  };

  // Redraw on state change.
  useEffect(() => {
    drawNow();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [revealed, isPlaying, currentTrack.src, activeScenes]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="absolute inset-0 pointer-events-none"
    />
  );
}

"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useAudioPlayer } from "@/lib/AudioPlayerContext";
import { GLYPH_5x5_TRANSPORT, drawGlyph } from "@/lib/dot-font";

const CELL = 5;
const PLAY_ORIGIN_COL = 2;
const PLAY_ORIGIN_ROW = 2;
const PLAY_GLYPH_W = 5;
const PLAY_GLYPH_H = 5;

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

  const { isPlaying, togglePlay, currentTrack } = useAudioPlayer();

  // Resize sync.
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [revealed, isPlaying]);

  // Hover (mouse only).
  useEffect(() => {
    const parent = wrapperRef.current;
    if (!parent) return;
    const onEnter = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      setRevealed(true);
    };
    const onLeave = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      setRevealed(false);
    };
    parent.addEventListener("pointerenter", onEnter);
    parent.addEventListener("pointerleave", onLeave);
    return () => {
      parent.removeEventListener("pointerenter", onEnter);
      parent.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  // Touch tap-to-toggle (skip toggle if tap lands on the play-glyph region —
  // the click handler will fire the action).
  useEffect(() => {
    const parent = wrapperRef.current;
    if (!parent) return;
    const onParentUp = (e: PointerEvent) => {
      if (e.pointerType === "mouse") return;
      if (revealed) {
        const rect = parent.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const col = Math.floor(x / CELL);
        const row = Math.floor(y / CELL);
        if (
          col >= PLAY_ORIGIN_COL &&
          col < PLAY_ORIGIN_COL + PLAY_GLYPH_W &&
          row >= PLAY_ORIGIN_ROW &&
          row < PLAY_ORIGIN_ROW + PLAY_GLYPH_H
        ) {
          return; // click handler will toggle play
        }
      }
      setRevealed((r) => !r);
    };
    const onDocDown = (e: PointerEvent) => {
      if (e.pointerType === "mouse") return;
      if (parent.contains(e.target as Node)) return;
      setRevealed(false);
    };
    parent.addEventListener("pointerup", onParentUp);
    document.addEventListener("pointerdown", onDocDown);
    return () => {
      parent.removeEventListener("pointerup", onParentUp);
      document.removeEventListener("pointerdown", onDocDown);
    };
  }, [revealed]);

  // Click → togglePlay if click lands on the glyph region.
  useEffect(() => {
    const parent = wrapperRef.current;
    if (!parent) return;
    const onClick = (e: MouseEvent) => {
      if (!revealed) return;
      const rect = parent.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const col = Math.floor(x / CELL);
      const row = Math.floor(y / CELL);
      if (
        col >= PLAY_ORIGIN_COL &&
        col < PLAY_ORIGIN_COL + PLAY_GLYPH_W &&
        row >= PLAY_ORIGIN_ROW &&
        row < PLAY_ORIGIN_ROW + PLAY_GLYPH_H
      ) {
        togglePlay();
      }
    };
    parent.addEventListener("click", onClick);
    return () => parent.removeEventListener("click", onClick);
  }, [revealed, togglePlay]);

  const drawNow = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const { cssW, cssH } = sizeRef.current;
    ctx.clearRect(0, 0, cssW, cssH);
    if (!revealed) return;
    const accent = readCssVar("--color-accent", "#B5651D");
    const glyph = isPlaying ? GLYPH_5x5_TRANSPORT.pause : GLYPH_5x5_TRANSPORT.play;
    drawGlyph(ctx, glyph, PLAY_ORIGIN_COL, PLAY_ORIGIN_ROW, CELL, accent);
  };

  useEffect(() => {
    drawNow();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [revealed, isPlaying]);

  return (
    <div
      ref={(el) => { wrapperRef.current = el; }}
      role="application"
      aria-label="Music player"
      tabIndex={0}
      className="absolute inset-0 outline-offset-2 focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-(--color-accent)"
      onKeyDown={(e) => {
        if (e.key === " ") {
          e.preventDefault();
          togglePlay();
        }
      }}
    >
      {/* Live region — announces track changes */}
      <div role="status" aria-live="polite" className="sr-only">
        {isPlaying ? `Now playing: ${currentTrack.title} by ${currentTrack.artist}` : ""}
      </div>

      {/* Invisible a11y button overlaying the play/pause glyph */}
      {revealed && (
        <button
          type="button"
          aria-label={isPlaying ? "Pause" : "Play"}
          onClick={(e) => { e.stopPropagation(); togglePlay(); }}
          className="absolute pointer-events-auto opacity-0"
          style={{
            left: `${PLAY_ORIGIN_COL * CELL}px`,
            top: `${PLAY_ORIGIN_ROW * CELL}px`,
            width: `${PLAY_GLYPH_W * CELL}px`,
            height: `${PLAY_GLYPH_H * CELL}px`,
          }}
        />
      )}

      <motion.canvas
        ref={canvasRef}
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        initial={false}
        animate={{
          opacity: revealed ? 1 : 0,
          filter: revealed ? "blur(0px)" : "blur(2px)",
        }}
        transition={{ duration: revealed ? 0.25 : 0.2, ease: [0.22, 1, 0.36, 1] }}
      />
    </div>
  );
}

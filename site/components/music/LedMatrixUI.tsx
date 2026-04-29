"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useAudioPlayer } from "@/lib/AudioPlayerContext";
import { useVisualizerScene } from "@/lib/VisualizerSceneContext";
import { SCENES } from "@/lib/visualizer-scenes";
import { GLYPH_7x7, GLYPH_5x5_SCENES, drawGlyph, drawText, truncateToCols, formatClock } from "@/lib/dot-font";

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

type ClickRegion = "prev" | "play" | "next" | "scene";

function a11yButtonStyle(
  region: ClickRegion,
  size: { cols: number; rows: number },
  sceneIndex = 0
): React.CSSProperties {
  const { cols, rows } = size;
  const SCENE_W = 5;
  const SCENE_GAP = 1;
  const SCENES_LEN = 5;
  const transportW = 7 + 4 + 7 + 4 + 7;
  const transportOriginCol = Math.floor(cols / 2) - Math.floor(transportW / 2);
  const transportOriginRow = Math.floor(rows / 2) - 3;
  const sceneIconsW = SCENES_LEN * SCENE_W + (SCENES_LEN - 1) * SCENE_GAP;
  const sceneOriginCol = cols - sceneIconsW - 2;

  const px = (col: number, row: number, w: number, h: number): React.CSSProperties => ({
    left: `${col * CELL}px`,
    top: `${row * CELL}px`,
    width: `${w * CELL}px`,
    height: `${h * CELL}px`,
  });

  switch (region) {
    case "prev":
      return px(transportOriginCol, transportOriginRow, 7, 7);
    case "play":
      return px(transportOriginCol + 11, transportOriginRow, 7, 7);
    case "next":
      return px(transportOriginCol + 22, transportOriginRow, 7, 7);
    case "scene":
      return px(
        sceneOriginCol + sceneIndex * (SCENE_W + SCENE_GAP),
        3,
        SCENE_W,
        SCENE_W
      );
  }
}

export default function LedMatrixUI() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const sizeRef = useRef({ cssW: 0, cssH: 0, cols: 0, rows: 0, dpr: 1 });
  const [revealed, setRevealed] = useState(false);

  const { isPlaying, togglePlay, currentTrack, currentTime, duration, next, prev, seek } = useAudioPlayer();
  const { activeScenes, setOnlyScene } = useVisualizerScene();

  const [tick, setTick] = useState(0);
  const [textOpacity, setTextOpacity] = useState(1);
  const lastTrackKeyRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (!isPlaying) return;
    const id = window.setInterval(() => setTick((t) => t + 1), 250);
    return () => window.clearInterval(id);
  }, [isPlaying]);

  useEffect(() => {
    const prevKey = lastTrackKeyRef.current;
    lastTrackKeyRef.current = currentTrack.src;
    if (prevKey === undefined || prevKey === currentTrack.src) return;
    setTextOpacity(0);
    let raf = 0;
    const start = performance.now();
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / 200);
      // Fade out 0→100ms (opacity 1→0), fade in 100→200ms (opacity 0→1).
      const opacity = t < 0.5 ? 1 - t * 2 : (t - 0.5) * 2;
      setTextOpacity(opacity);
      if (t < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [currentTrack.src]);

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

  // Hover (mouse only)
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

  // Touch tap-to-toggle
  useEffect(() => {
    const parent = wrapperRef.current;
    if (!parent) return;
    const onParentUp = (e: PointerEvent) => {
      if (e.pointerType === "mouse") return;
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
  }, []);

  // Click handler — full region router: scrubber → scene → transport.
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

      // 1. Scrubber band (bottom 6 rows): seek
      if (row >= rows - 6) {
        const BAR_PAD_LEFT = 18;
        const BAR_PAD_RIGHT = 13;
        const barStart = BAR_PAD_LEFT;
        const barEnd = cols - BAR_PAD_RIGHT;
        if (col >= barStart && col <= barEnd && duration > 0) {
          const ratio = (col - barStart) / (barEnd - barStart);
          seek(ratio * duration);
          return;
        }
      }

      // 2. Scene picker (top-right strip)
      const SCENE_W = 5;
      const SCENE_GAP = 1;
      const ICONS_W = SCENES.length * SCENE_W + (SCENES.length - 1) * SCENE_GAP;
      const sceneOriginCol = cols - ICONS_W - 2;
      if (row >= 1 && row <= 9 && col >= sceneOriginCol && col < sceneOriginCol + ICONS_W) {
        const i = Math.floor((col - sceneOriginCol) / (SCENE_W + SCENE_GAP));
        const id = SCENES[i]?.id;
        if (id) setOnlyScene(id);
        return;
      }

      // 3. Transport (centered band)
      const midR = Math.floor(rows / 2);
      if (Math.abs(row - midR) <= 5) {
        const transportW = 7 + 4 + 7 + 4 + 7;
        const transportOriginCol = Math.floor(cols / 2) - Math.floor(transportW / 2);
        const local = col - transportOriginCol;
        if (local >= 0 && local < 7) prev();
        else if (local >= 11 && local < 18) togglePlay();
        else if (local >= 22 && local < 29) next();
        return;
      }
    };
    parent.addEventListener("click", onClick);
    return () => parent.removeEventListener("click", onClick);
  }, [revealed, togglePlay, prev, next, seek, setOnlyScene, duration]);

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

    // Responsive gates (spec §6).
    const showTitle = cols >= 40;
    const showArtist = cols >= 80;
    const showScenes = cols >= 60;

    // Crossfaded text accents
    const titleAccent = withAlpha(accent, textOpacity);
    const artistAccent = withAlpha(accent, 0.4 * textOpacity);

    // Title (top-left)
    if (showTitle) {
      const titleCols = Math.max(0, cols - 36); // leave room for scene picker
      const title = truncateToCols(currentTrack.title ?? "", Math.min(titleCols, 40));
      drawText(ctx, title, 2, 3, CELL, titleAccent);
    }

    // Artist (top-left, line 2)
    if (showArtist) {
      const titleCols = Math.max(0, cols - 36);
      const artist = truncateToCols(currentTrack.artist ?? "", Math.min(titleCols, 40));
      drawText(ctx, artist, 2, 10, CELL, artistAccent);
    }

    // Scene picker (top-right)
    if (showScenes) {
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
    }

    // Center transport: prev / pause / next, 7×7 each, gap 4 cells
    const transportW = 7 + 4 + 7 + 4 + 7;
    const transportOriginCol = Math.floor(cols / 2) - Math.floor(transportW / 2);
    const transportOriginRow = Math.floor(rows / 2) - 3;
    drawGlyph(ctx, GLYPH_7x7.prev,  transportOriginCol,      transportOriginRow, CELL, dim);
    drawGlyph(ctx, GLYPH_7x7.pause, transportOriginCol + 11, transportOriginRow, CELL, accent);
    drawGlyph(ctx, GLYPH_7x7.next,  transportOriginCol + 22, transportOriginRow, CELL, dim);

    // Scrubber: timecodes on row rows-5, dot bar on row rows-3
    const left = formatClock(currentTime);
    const right = formatClock(duration);
    drawText(ctx, left, 2, rows - 5, CELL, accent);

    // Right timecode width: each char advances 4 cells, last char no trailing gap.
    const rightW = right.length * 4 - 1;
    drawText(ctx, right, cols - 2 - rightW, rows - 5, CELL, accent);

    // Dot bar
    const BAR_PAD_LEFT = 18;
    const BAR_PAD_RIGHT = 13;
    const barStart = BAR_PAD_LEFT;
    const barEnd = cols - BAR_PAD_RIGHT;
    const fillRatio = duration > 0 ? Math.min(1, Math.max(0, currentTime / duration)) : 0;
    const fillCols = Math.round((barEnd - barStart) * fillRatio);
    for (let c = barStart; c <= barEnd; c++) {
      const lit = c <= barStart + fillCols;
      drawGlyph(ctx, [[1]], c, rows - 3, CELL, lit ? accent : dim);
    }
  };

  // Redraw on state change.
  useEffect(() => {
    drawNow();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [revealed, isPlaying, currentTrack.src, activeScenes, tick, textOpacity]);

  return (
    <div
      ref={(el) => { wrapperRef.current = el; }}
      role="application"
      aria-label="Music player"
      tabIndex={0}
      className="absolute inset-0 outline-offset-2 focus-visible:outline-2 focus-visible:outline-(--color-accent)"
      onKeyDown={(e) => {
        switch (e.key) {
          case " ":
            e.preventDefault();
            togglePlay();
            break;
          case "ArrowLeft":
            e.preventDefault();
            prev();
            break;
          case "ArrowRight":
            e.preventDefault();
            next();
            break;
          case "[": {
            const ids = SCENES.map((s) => s.id);
            const cur = ids.indexOf(Array.from(activeScenes)[0] ?? ids[0]);
            setOnlyScene(ids[(cur - 1 + ids.length) % ids.length]);
            break;
          }
          case "]": {
            const ids = SCENES.map((s) => s.id);
            const cur = ids.indexOf(Array.from(activeScenes)[0] ?? ids[0]);
            setOnlyScene(ids[(cur + 1) % ids.length]);
            break;
          }
          case "Home":
            e.preventDefault();
            seek(0);
            break;
          case "End":
            e.preventDefault();
            seek(duration);
            break;
        }
      }}
    >
      {/* Screen-reader-only live region for track changes */}
      <div role="status" aria-live="polite" className="sr-only">
        {isPlaying ? `Now playing: ${currentTrack.title} by ${currentTrack.artist}` : ""}
      </div>

      {/* Invisible buttons for SR / keyboard. Sized + positioned over each click region. */}
      {revealed && isPlaying && (
        <div className="absolute inset-0 pointer-events-none">
          <button
            type="button"
            aria-label="Previous track"
            onClick={(e) => { e.stopPropagation(); prev(); }}
            className="absolute pointer-events-auto opacity-0"
            style={a11yButtonStyle("prev", sizeRef.current)}
          />
          <button
            type="button"
            aria-label={isPlaying ? "Pause" : "Play"}
            onClick={(e) => { e.stopPropagation(); togglePlay(); }}
            className="absolute pointer-events-auto opacity-0"
            style={a11yButtonStyle("play", sizeRef.current)}
          />
          <button
            type="button"
            aria-label="Next track"
            onClick={(e) => { e.stopPropagation(); next(); }}
            className="absolute pointer-events-auto opacity-0"
            style={a11yButtonStyle("next", sizeRef.current)}
          />
          {SCENES.map((s, i) => (
            <button
              key={s.id}
              type="button"
              aria-label={`Activate ${s.label} scene`}
              onClick={(e) => { e.stopPropagation(); setOnlyScene(s.id); }}
              className="absolute pointer-events-auto opacity-0"
              style={a11yButtonStyle("scene", sizeRef.current, i)}
            />
          ))}
        </div>
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

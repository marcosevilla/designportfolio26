"use client";

import { useRef, useState } from "react";
// Same M:SS formatter the LED clock uses — reused rather than restated so
// the announced value and the displayed value can't drift.
import { formatClock } from "@/lib/dot-font";
import { useNoHover } from "@/lib/useNoHover";

/** Inset timeline scrubber. Thin resting track + thumb-on-hover; meant
 *  to sit between two static time labels in a single bottom row of a
 *  music player surface. Shared by the full-screen MusicOverlay and the
 *  MusicPlayerPanel (the toolbar music card). */
export default function InsetScrubber({
  value,
  max,
  onChange,
  onCommit,
  restingHeight = 1.5,
  expandedHeight = 3,
  thumbSize = 10,
}: {
  value: number;
  max: number;
  onChange: (next: number) => void;
  onCommit?: () => void;
  restingHeight?: number;
  expandedHeight?: number;
  thumbSize?: number;
}) {
  const [hovered, setHovered] = useState(false);
  const [dragging, setDragging] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);

  // No hover on touch devices means the thumb would be invisible at rest
  // and the affordance unreachable — keep the scrubber permanently in its
  // expanded state there.
  const noHover = useNoHover();
  const expanded = noHover || hovered || dragging;
  const pct = max > 0 ? Math.max(0, Math.min(100, (value / max) * 100)) : 0;

  const valueAtClientX = (clientX: number) => {
    const el = trackRef.current;
    if (!el || max <= 0) return 0;
    const rect = el.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    return ratio * max;
  };

  // Keyboard operation. This element advertises role="slider" and takes
  // focus via tabIndex, but had no key handling at all — a focusable dead
  // end for anyone not using a pointer. Arrow ±5s, Shift+Arrow ±30s,
  // Home/End to the ends; each seeks and commits like a pointer release.
  const seekTo = (next: number) => {
    if (max <= 0) return;
    onChange(Math.max(0, Math.min(max, next)));
    onCommit?.();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (max <= 0) return;
    const step = e.shiftKey ? 30 : 5;
    switch (e.key) {
      case "ArrowRight":
      case "ArrowUp":
        seekTo(value + step);
        break;
      case "ArrowLeft":
      case "ArrowDown":
        seekTo(value - step);
        break;
      case "Home":
        seekTo(0);
        break;
      case "End":
        seekTo(max);
        break;
      default:
        return;
    }
    // Only reached when a key was handled — otherwise the early `return`
    // above leaves Tab, Escape and friends alone.
    e.preventDefault();
  };

  return (
    <div
      role="slider"
      aria-label="Seek"
      aria-valuemin={0}
      aria-valuemax={max || 0}
      aria-valuenow={value}
      // Without this a screen reader announces the raw float ("137.42").
      aria-valuetext={formatClock(value)}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      // Touch: the ~19px hit strip (py-2) is too thin for the site's only
      // drag interaction — grow to ~28px+ without shifting the layout.
      className={`relative w-full cursor-pointer select-none touch-none ${
        noHover ? "py-3.5 -my-3.5" : "py-2 -my-2"
      }`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onPointerDown={(e) => {
        e.preventDefault();
        e.currentTarget.setPointerCapture(e.pointerId);
        setDragging(true);
        onChange(valueAtClientX(e.clientX));
      }}
      onPointerMove={(e) => {
        if (!dragging) return;
        onChange(valueAtClientX(e.clientX));
      }}
      onPointerUp={(e) => {
        if (!dragging) return;
        setDragging(false);
        e.currentTarget.releasePointerCapture(e.pointerId);
        onCommit?.();
      }}
      onPointerCancel={(e) => {
        if (!dragging) return;
        setDragging(false);
        e.currentTarget.releasePointerCapture(e.pointerId);
        onCommit?.();
      }}
    >
      <div
        ref={trackRef}
        className="relative w-full rounded-full"
        style={{
          height: expanded ? expandedHeight : restingHeight,
          backgroundColor: "var(--color-border)",
          transition: "height 150ms ease-out",
        }}
      >
        <div
          className="rounded-full"
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            height: "100%",
            width: `${pct}%`,
            backgroundColor: "var(--color-accent)",
          }}
        />
        <span
          aria-hidden
          style={{
            position: "absolute",
            left: `${pct}%`,
            top: "50%",
            width: expanded ? thumbSize : 0,
            height: expanded ? thumbSize : 0,
            transform: "translate(-50%, -50%)",
            opacity: expanded ? 1 : 0,
            backgroundColor: "var(--color-accent)",
            borderRadius: "50%",
            pointerEvents: "none",
            transition:
              "width 150ms ease-out, height 150ms ease-out, opacity 150ms ease-out",
          }}
        />
      </div>
    </div>
  );
}

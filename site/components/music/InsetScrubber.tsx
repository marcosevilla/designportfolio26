"use client";

import { useRef, useState } from "react";

/** Inset timeline scrubber. Thin resting track + thumb-on-hover; meant
 *  to sit between two static time labels in a single bottom row of a
 *  music player surface. Shared by the full-screen MusicOverlay and the
 *  bottom-right MusicMiniWidget. */
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

  const expanded = hovered || dragging;
  const pct = max > 0 ? Math.max(0, Math.min(100, (value / max) * 100)) : 0;

  const valueAtClientX = (clientX: number) => {
    const el = trackRef.current;
    if (!el || max <= 0) return 0;
    const rect = el.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    return ratio * max;
  };

  return (
    <div
      role="slider"
      aria-label="Seek"
      aria-valuemin={0}
      aria-valuemax={max || 0}
      aria-valuenow={value}
      tabIndex={0}
      className="relative w-full cursor-pointer select-none touch-none py-2 -my-2"
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

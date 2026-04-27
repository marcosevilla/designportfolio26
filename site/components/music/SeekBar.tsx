"use client";

import { useRef, useState } from "react";

interface SeekBarProps {
  /** Current value in seconds. */
  value: number;
  /** Max value (track duration) in seconds. Use 0 if unknown. */
  max: number;
  /** Fired continuously while dragging or on click. */
  onChange: (next: number) => void;
  /** Fired once on pointer release (commit). */
  onCommit?: () => void;
  /** Optional aria label. */
  ariaLabel?: string;
  className?: string;
}

/**
 * Custom seek bar for the music player. Replaces shadcn/Base-UI Slider here
 * because we need rock-solid drag + click-to-jump behavior with a visible
 * thumb at rest. Pointer Events handle both mouse and touch uniformly.
 */
export default function SeekBar({
  value,
  max,
  onChange,
  onCommit,
  ariaLabel = "Seek",
  className,
}: SeekBarProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);
  const [hovered, setHovered] = useState(false);

  const valueAtClientX = (clientX: number) => {
    const el = trackRef.current;
    if (!el || max <= 0) return 0;
    const rect = el.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    return ratio * max;
  };

  const handleDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    const target = e.currentTarget;
    target.setPointerCapture(e.pointerId);
    draggingRef.current = true;
    onChange(valueAtClientX(e.clientX));
  };

  const handleMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    onChange(valueAtClientX(e.clientX));
  };

  const handleUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    e.currentTarget.releasePointerCapture(e.pointerId);
    onCommit?.();
  };

  const pct = max > 0 ? Math.max(0, Math.min(100, (value / max) * 100)) : 0;
  const expanded = hovered || draggingRef.current;

  return (
    <div
      ref={trackRef}
      role="slider"
      aria-label={ariaLabel}
      aria-valuemin={0}
      aria-valuemax={max || 0}
      aria-valuenow={value}
      tabIndex={0}
      className={`relative w-full select-none touch-none cursor-pointer py-2 -my-2 ${className ?? ""}`}
      onPointerDown={handleDown}
      onPointerMove={handleMove}
      onPointerUp={handleUp}
      onPointerCancel={handleUp}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Track */}
      <div
        className="rounded-full transition-[height]"
        style={{
          height: expanded ? 4 : 2,
          backgroundColor: "var(--color-border)",
        }}
      >
        {/* Filled portion */}
        <div
          className="h-full rounded-full"
          style={{
            width: `${pct}%`,
            backgroundColor: "var(--color-accent)",
          }}
        />
      </div>
      {/* Thumb — uses the same ✸ blink-cursor character used elsewhere on
          the homepage (intro, loading state) for a consistent motif. */}
      <span
        aria-hidden="true"
        className="absolute pointer-events-none select-none transition-[opacity,font-size]"
        style={{
          left: `${pct}%`,
          top: "50%",
          fontSize: expanded ? 16 : 12,
          lineHeight: 1,
          transform: "translate(-50%, -50%)",
          opacity: expanded ? 1 : 0.7,
          color: "var(--color-accent)",
        }}
      >
        ✸
      </span>
    </div>
  );
}

"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { SPRING_SNAP } from "@/lib/springs";
import { GridPosition } from "@/lib/bio-content";

const GRID_SIZE = 6;
const DOT_SIZE = 6;
const DOT_GAP = 24;
const HANDLE_SIZE = 20;

// Total grid dimensions
const GRID_WIDTH = (GRID_SIZE - 1) * DOT_GAP + DOT_SIZE;
const GRID_HEIGHT = (GRID_SIZE - 1) * DOT_GAP + DOT_SIZE;

interface DynamicBioGridProps {
  position: GridPosition;
  onPositionChange: (position: GridPosition) => void;
  disabled?: boolean;
}

export function DynamicBioGrid({ position, onPositionChange, disabled }: DynamicBioGridProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragPosition, setDragPosition] = useState<{ x: number; y: number } | null>(null);

  // Convert grid position to pixel position
  const gridToPixel = useCallback((gridPos: GridPosition) => ({
    x: gridPos.x * DOT_GAP + DOT_SIZE / 2,
    y: gridPos.y * DOT_GAP + DOT_SIZE / 2,
  }), []);

  // Convert pixel position to grid position
  const pixelToGrid = useCallback((pixelX: number, pixelY: number): GridPosition => ({
    x: Math.max(0, Math.min(GRID_SIZE - 1, Math.round((pixelX - DOT_SIZE / 2) / DOT_GAP))),
    y: Math.max(0, Math.min(GRID_SIZE - 1, Math.round((pixelY - DOT_SIZE / 2) / DOT_GAP))),
  }), []);

  // Current display position (either dragging or snapped)
  const displayPosition = dragPosition ?? gridToPixel(position);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (disabled) return;
    e.preventDefault();
    e.stopPropagation();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setIsDragging(true);
  }, [disabled]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(DOT_SIZE / 2, Math.min(GRID_WIDTH - DOT_SIZE / 2, e.clientX - rect.left));
    const y = Math.max(DOT_SIZE / 2, Math.min(GRID_HEIGHT - DOT_SIZE / 2, e.clientY - rect.top));

    setDragPosition({ x, y });
  }, [isDragging]);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    if (!isDragging) return;
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    setIsDragging(false);

    if (dragPosition) {
      const newGridPos = pixelToGrid(dragPosition.x, dragPosition.y);
      onPositionChange(newGridPos);
    }
    setDragPosition(null);
  }, [isDragging, dragPosition, pixelToGrid, onPositionChange]);

  // Handle click on grid dots directly
  const handleDotClick = useCallback((x: number, y: number) => {
    if (disabled) return;
    onPositionChange({ x, y });
  }, [disabled, onPositionChange]);

  // Generate grid dots
  const dots = [];
  for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      const isSelected = !isDragging && position.x === x && position.y === y;
      dots.push(
        <button
          key={`${x}-${y}`}
          type="button"
          onClick={() => handleDotClick(x, y)}
          disabled={disabled}
          className={`
            absolute rounded-full transition-all duration-150
            ${isSelected ? "bg-[var(--color-accent)]" : "bg-[var(--color-fg-tertiary)]"}
            ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer hover:bg-[var(--color-fg-secondary)]"}
          `}
          style={{
            width: DOT_SIZE,
            height: DOT_SIZE,
            left: x * DOT_GAP,
            top: y * DOT_GAP,
          }}
          aria-label={`Select position ${x + 1}, ${y + 1}`}
        />
      );
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Y-axis label (top) */}
      <div className="flex items-center justify-center">
        <span className="text-[11px] text-[var(--color-fg-tertiary)] uppercase tracking-wider">
          Concise
        </span>
      </div>

      <div className="flex items-center gap-3">
        {/* X-axis label (left) */}
        <div className="flex items-center h-full">
          <span
            className="text-[11px] text-[var(--color-fg-tertiary)] uppercase tracking-wider"
            style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
          >
            Casual
          </span>
        </div>

        {/* Grid container */}
        <div
          ref={containerRef}
          className={`relative ${disabled ? "" : "cursor-crosshair"}`}
          style={{
            width: GRID_WIDTH,
            height: GRID_HEIGHT,
            touchAction: "none",
          }}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        >
          {/* Axis lines */}
          <svg
            className="absolute inset-0 pointer-events-none"
            width={GRID_WIDTH}
            height={GRID_HEIGHT}
          >
            {/* Horizontal axis line */}
            <line
              x1={0}
              y1={GRID_HEIGHT / 2}
              x2={GRID_WIDTH}
              y2={GRID_HEIGHT / 2}
              stroke="var(--color-border)"
              strokeWidth={1}
            />
            {/* Vertical axis line */}
            <line
              x1={GRID_WIDTH / 2}
              y1={0}
              x2={GRID_WIDTH / 2}
              y2={GRID_HEIGHT}
              stroke="var(--color-border)"
              strokeWidth={1}
            />
          </svg>

          {/* Grid dots */}
          {dots}

          {/* Draggable handle */}
          <motion.div
            className={`
              absolute rounded-full border-2
              ${isDragging ? "border-[var(--color-accent)]" : "border-[var(--color-fg-primary)]"}
              ${disabled ? "cursor-not-allowed opacity-50" : "cursor-grab active:cursor-grabbing"}
            `}
            style={{
              width: HANDLE_SIZE,
              height: HANDLE_SIZE,
              marginLeft: -HANDLE_SIZE / 2,
              marginTop: -HANDLE_SIZE / 2,
              backgroundColor: "var(--color-bg-primary)",
              boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
            }}
            animate={{
              x: displayPosition.x,
              y: displayPosition.y,
              scale: isDragging ? 1.1 : 1,
            }}
            transition={isDragging ? { duration: 0 } : SPRING_SNAP}
            onPointerDown={handlePointerDown}
          />
        </div>

        {/* X-axis label (right) */}
        <div className="flex items-center h-full">
          <span
            className="text-[11px] text-[var(--color-fg-tertiary)] uppercase tracking-wider"
            style={{ writingMode: "vertical-rl" }}
          >
            Professional
          </span>
        </div>
      </div>

      {/* Y-axis label (bottom) */}
      <div className="flex items-center justify-center">
        <span className="text-[11px] text-[var(--color-fg-tertiary)] uppercase tracking-wider">
          Verbose
        </span>
      </div>
    </div>
  );
}

export default DynamicBioGrid;

"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { MusicNoteIcon, PaletteIcon, SmileyIcon, VisualsIcon } from "./Icons";

const HOVER_SPRING = { type: "spring" as const, stiffness: 500, damping: 38 };

// Three alphas → three visually distinct states. Hover and active stack
// (active layer is always rendered while pressed; hover pill rides on top
// when the cursor is over the same button), so the combined fill is visibly
// stronger than either alone.
const TINT_HOVER = "color-mix(in srgb, var(--color-accent) 8%, transparent)";
const TINT_ACTIVE = "color-mix(in srgb, var(--color-accent) 14%, transparent)";

function ActionIcon({
  label,
  pressed,
  onClick,
  hovered,
  onHover,
  children,
}: {
  label: string;
  pressed?: boolean;
  onClick: () => void;
  hovered: boolean;
  onHover: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={onHover}
      onFocus={onHover}
      aria-label={label}
      aria-pressed={pressed}
      className="relative flex items-center justify-center w-8 h-8 rounded-full transition-colors text-(--color-fg-tertiary) hover:text-(--color-accent) focus-visible:text-(--color-accent) focus:outline-none aria-pressed:text-(--color-accent)"
    >
      {pressed && (
        <span
          aria-hidden
          className="absolute inset-0 rounded-full"
          style={{ backgroundColor: TINT_ACTIVE }}
        />
      )}
      {hovered && (
        <motion.span
          layoutId="hero-action-hover"
          aria-hidden
          className="absolute inset-0 rounded-full"
          style={{ backgroundColor: TINT_HOVER }}
          transition={HOVER_SPRING}
        />
      )}
      <span className="relative">{children}</span>
    </button>
  );
}

export default function HeroActions({
  paletteOpen,
  miniPlayerOpen,
  visualsOpen,
  greetingActive,
  onTogglePalette,
  onToggleMusic,
  onToggleVisuals,
  onToggleGreeting,
}: {
  paletteOpen: boolean;
  miniPlayerOpen: boolean;
  visualsOpen: boolean;
  greetingActive: boolean;
  onTogglePalette: () => void;
  onToggleMusic: () => void;
  onToggleVisuals: () => void;
  onToggleGreeting: () => void;
}) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <div
      className="flex items-center gap-1"
      onMouseLeave={() => setHoveredIndex(null)}
    >
      <ActionIcon
        label="Theme palette"
        pressed={paletteOpen}
        onClick={onTogglePalette}
        hovered={hoveredIndex === 0}
        onHover={() => setHoveredIndex(0)}
      >
        <PaletteIcon size={16} />
      </ActionIcon>
      <ActionIcon
        label={miniPlayerOpen ? "Hide music player" : "Show music player"}
        pressed={miniPlayerOpen}
        onClick={onToggleMusic}
        hovered={hoveredIndex === 1}
        onHover={() => setHoveredIndex(1)}
      >
        <MusicNoteIcon size={16} />
      </ActionIcon>
      <ActionIcon
        label={visualsOpen ? "Hide visuals" : "Show visuals"}
        pressed={visualsOpen}
        onClick={onToggleVisuals}
        hovered={hoveredIndex === 2}
        onHover={() => setHoveredIndex(2)}
      >
        <VisualsIcon size={16} />
      </ActionIcon>
      {/* Smiley toggle (entrypoint to the cycling greeting) temporarily
          hidden for recruiter share. */}
      {false && (
        <ActionIcon
          label={greetingActive ? "Stop greeting cycle" : "Start greeting cycle"}
          pressed={greetingActive}
          onClick={onToggleGreeting}
          hovered={hoveredIndex === 3}
          onHover={() => setHoveredIndex(3)}
        >
          <SmileyIcon size={16} />
        </ActionIcon>
      )}
    </div>
  );
}

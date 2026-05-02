"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { MoonIcon, MusicNoteIcon, PaletteIcon, SmileyIcon, SunIcon, VisualsIcon } from "./Icons";
import { useThemeState } from "./ThemeToggle";

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

/**
 * Top-level light/dark mode toggle. Sits next to palette/music/visuals as
 * its own first-class button — separated from the palette swap zone so the
 * mode flip is one click instead of two. Renders nothing pre-hydration to
 * avoid an SSR/CSR mode mismatch.
 */
function ThemeModeAction({ hovered, onHover }: { hovered: boolean; onHover: () => void }) {
  const themeState = useThemeState();
  if (!themeState.mounted) {
    // Reserve the button's footprint so neighbouring icons don't shift on hydrate.
    return <span aria-hidden style={{ width: 32, height: 32, display: "inline-block" }} />;
  }
  const isLight = themeState.mode === "light";
  return (
    <ActionIcon
      label={isLight ? "Switch to dark mode" : "Switch to light mode"}
      onClick={() => (isLight ? themeState.selectDark() : themeState.selectLight())}
      hovered={hovered}
      onHover={onHover}
    >
      {isLight ? <MoonIcon size={16} /> : <SunIcon size={16} />}
    </ActionIcon>
  );
}

export default function HeroActions({
  paletteOpen,
  miniPlayerOpen,
  visualsOpen,
  greetingActive,
  showVisuals,
  onTogglePalette,
  onToggleMusic,
  onToggleVisuals,
  onToggleGreeting,
}: {
  paletteOpen: boolean;
  miniPlayerOpen: boolean;
  visualsOpen: boolean;
  greetingActive: boolean;
  /** Eye/visuals icon is gated on music playing — only relevant when the
   *  visualizer has audio to react to. */
  showVisuals: boolean;
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
      <ThemeModeAction
        hovered={hoveredIndex === 0}
        onHover={() => setHoveredIndex(0)}
      />
      <ActionIcon
        label="Theme palette"
        pressed={paletteOpen}
        onClick={onTogglePalette}
        hovered={hoveredIndex === 1}
        onHover={() => setHoveredIndex(1)}
      >
        <PaletteIcon size={16} />
      </ActionIcon>
      <ActionIcon
        label={miniPlayerOpen ? "Hide music player" : "Show music player"}
        pressed={miniPlayerOpen}
        onClick={onToggleMusic}
        hovered={hoveredIndex === 2}
        onHover={() => setHoveredIndex(2)}
      >
        <MusicNoteIcon size={16} />
      </ActionIcon>
      {showVisuals && (
        <ActionIcon
          label={visualsOpen ? "Hide visuals" : "Show visuals"}
          pressed={visualsOpen}
          onClick={onToggleVisuals}
          hovered={hoveredIndex === 3}
          onHover={() => setHoveredIndex(3)}
        >
          <VisualsIcon size={16} />
        </ActionIcon>
      )}
      {/* Smiley toggle (entrypoint to the cycling greeting) temporarily
          hidden for recruiter share. */}
      {false && (
        <ActionIcon
          label={greetingActive ? "Stop greeting cycle" : "Start greeting cycle"}
          pressed={greetingActive}
          onClick={onToggleGreeting}
          hovered={hoveredIndex === 4}
          onHover={() => setHoveredIndex(4)}
        >
          <SmileyIcon size={16} />
        </ActionIcon>
      )}
    </div>
  );
}

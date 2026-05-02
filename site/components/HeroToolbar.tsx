"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import HamburgerMenu from "./HamburgerMenu";
import { PaletteRow } from "./PaletteSwatches";
import { MiniPlayerRow } from "./music/HomeMiniPlayer";
import { useAudioPlayer } from "@/lib/AudioPlayerContext";
import LocalStatus from "./LocalStatus";
import {
  ChevronDownIcon,
  MoonIcon,
  MusicNoteIcon,
  PlayIcon,
  SunIcon,
  VisualsIcon,
} from "./Icons";
import { useThemeState } from "./ThemeToggle";

const POPOVER_EASE = [0.22, 1, 0.36, 1] as const;

const TINT_HOVER = "color-mix(in srgb, var(--color-accent) 8%, transparent)";
const TINT_ACTIVE = "color-mix(in srgb, var(--color-accent) 14%, transparent)";

/** Shared shell for the toolbar's icon buttons — same chrome treatment as the
 *  prior HeroActions cluster (hover tint, active tint, focus ring). Disabled
 *  variant lowers contrast and removes hover/click affordances. */
function ToolbarIconButton({
  label,
  pressed = false,
  onClick,
  disabled = false,
  children,
}: {
  label: string;
  pressed?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={disabled ? undefined : onClick}
      aria-label={label}
      aria-pressed={pressed}
      aria-disabled={disabled}
      disabled={disabled}
      className={[
        "relative flex items-center justify-center w-7 h-7 rounded-md transition-colors focus:outline-none",
        disabled
          ? "text-(--color-fg-tertiary) opacity-50 cursor-not-allowed"
          : "text-(--color-fg-secondary) hover:text-(--color-accent) focus-visible:text-(--color-accent) cursor-pointer",
      ].join(" ")}
    >
      {pressed && !disabled && (
        <span
          aria-hidden
          className="absolute inset-0 rounded-md"
          style={{ backgroundColor: TINT_ACTIVE }}
        />
      )}
      {!disabled && (
        <span
          aria-hidden
          className="absolute inset-0 rounded-md opacity-0 hover:opacity-100 transition-opacity"
          style={{ backgroundColor: TINT_HOVER }}
        />
      )}
      <span className="relative inline-flex items-center gap-1">{children}</span>
    </button>
  );
}

/** Light/dark mode toggle. Renders nothing pre-hydration to avoid SSR mismatch. */
function ThemeModeButton() {
  const themeState = useThemeState();
  if (!themeState.mounted) {
    // Reserve footprint so neighbour buttons don't shift on hydrate.
    return <span aria-hidden style={{ width: 28, height: 28, display: "inline-block" }} />;
  }
  const isLight = themeState.mode === "light";
  return (
    <ToolbarIconButton
      label={isLight ? "Switch to dark mode" : "Switch to light mode"}
      onClick={() => (isLight ? themeState.selectDark() : themeState.selectLight())}
    >
      {isLight ? <MoonIcon size={14} /> : <SunIcon size={14} />}
    </ToolbarIconButton>
  );
}

/** Palette button: icon + chevron. Click opens a popover with the 10
 *  colored-theme swatches, anchored beneath this button (left-aligned to
 *  the button's left edge). Active when popover is open. */
function PaletteButton({
  open,
  onToggle,
}: {
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="relative">
      <button
        type="button"
        onClick={onToggle}
        aria-label="Theme palette"
        aria-pressed={open}
        aria-expanded={open}
        className="relative flex items-center justify-center h-7 px-1.5 rounded-md transition-colors focus:outline-none text-(--color-fg-secondary) hover:text-(--color-accent) focus-visible:text-(--color-accent) cursor-pointer aria-pressed:text-(--color-accent)"
      >
        {open && (
          <span
            aria-hidden
            className="absolute inset-0 rounded-md"
            style={{ backgroundColor: TINT_ACTIVE }}
          />
        )}
        <span
          aria-hidden
          className="absolute inset-0 rounded-md opacity-0 hover:opacity-100 transition-opacity"
          style={{ backgroundColor: TINT_HOVER }}
        />
        <span className="relative inline-flex items-center gap-1">
          {/* Theme swatch — a solid disc filled with the active accent. Acts
              as the color preview AND the dropdown trigger glyph. Slightly
              smaller than the light/dark toggle so the chevron doesn't read
              as a second adjacent glyph. */}
          <span
            aria-hidden
            style={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              backgroundColor: "var(--color-accent)",
              display: "inline-block",
              boxShadow: "inset 0 0 0 1px color-mix(in srgb, var(--color-fg) 12%, transparent)",
            }}
          />
          <ChevronDownIcon size={9} />
        </span>
      </button>
      {/* Popover anchored to the button's left edge, hangs below with a
          small gap. Less rounded than .chat-surface's default 18px so it
          reads as menu chrome rather than a floating chat surface. */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="palette-popover"
            initial={{ opacity: 0, y: -4, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -4, filter: "blur(6px)" }}
            transition={{ duration: 0.22, ease: POPOVER_EASE }}
            className="chat-surface absolute z-[100]"
            style={{
              top: "calc(100% + 8px)",
              left: 0,
              padding: "6px",
              borderRadius: 10,
            }}
          >
            <PaletteRow />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** Visualizer button — DISABLED placeholder for now. Visible in the toolbar
 *  but does nothing. Scene controls live at the LED matrix's bottom-left
 *  (will land in Phase 3). */
function VisualizerButton() {
  return (
    <ToolbarIconButton label="Visualizer (coming soon)" disabled>
      <VisualsIcon size={14} />
    </ToolbarIconButton>
  );
}

// Width spring shapes the collapse/expand of the music slot. Lightly
// underdamped so the row settles with a touch of inertia at the end —
// matches the chat-CTA morph spring's character.
const MUSIC_WIDTH_SPRING = { type: "spring" as const, stiffness: 320, damping: 36 };

/** Music slot. Collapsed (not playing) = just the play button. Playing =
 *  inline-expanded MiniPlayerRow (transport + title-with-hover-scrubber).
 *  The transition between states is a width spring on the container plus
 *  a cross-fade between the two layers. The expanded layer enters from
 *  the play button's left-anchored origin (x:-16 → x:0 + blur fade) so
 *  the controls feel like they emerge from the play button rather than
 *  popping in. */
function MusicSlot() {
  const { isPlaying, togglePlay } = useAudioPlayer();
  return (
    <motion.div
      animate={{ width: isPlaying ? 320 : 28 }}
      transition={MUSIC_WIDTH_SPRING}
      style={{ height: 28, overflow: "hidden", position: "relative" }}
    >
      {/* Collapsed play button — fades out when expanded takes over. */}
      <motion.div
        animate={{
          opacity: isPlaying ? 0 : 1,
          filter: isPlaying ? "blur(4px)" : "blur(0px)",
        }}
        transition={{ duration: 0.18, delay: isPlaying ? 0 : 0.18 }}
        style={{ pointerEvents: isPlaying ? "none" : "auto" }}
        className="absolute inset-0 flex items-center"
      >
        <ToolbarIconButton label="Play music" onClick={togglePlay}>
          <PlayIcon size={14} />
        </ToolbarIconButton>
      </motion.div>
      {/* Expanded transport row — slides in from x:-16 (≈ play button's
          left edge) so the controls read as emerging from the play
          button's position rather than popping in. */}
      <motion.div
        animate={{
          opacity: isPlaying ? 1 : 0,
          filter: isPlaying ? "blur(0px)" : "blur(8px)",
          x: isPlaying ? 0 : -16,
        }}
        transition={{ duration: 0.3, delay: isPlaying ? 0.1 : 0 }}
        style={{ pointerEvents: isPlaying ? "auto" : "none" }}
        className="absolute inset-0"
      >
        <MiniPlayerRow />
      </motion.div>
    </motion.div>
  );
}

/** Single-row system-chrome toolbar.
 *  Layout: [hamburger?] [theme] [palette+⌄] [visualizer (disabled)] [music] ...... [time/weather]
 *  - Hamburger surfaces in compressed mode via .chat-cmp-show CSS.
 *  - Palette opens a popover with 10 colored-theme swatches.
 *  - Visualizer is a placeholder (disabled); scene controls move to LED.
 *  - Music collapsed = play button only; expands inline when playing.
 *  - Time/weather pinned flush right.
 */
export default function HeroToolbar() {
  const [paletteOpen, setPaletteOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close the palette popover on Escape and pointer-down outside the toolbar
  // wrapper (the popover is rendered inside PaletteButton, which is itself
  // inside wrapperRef, so wrapperRef.contains() covers both the trigger and
  // the popover).
  useEffect(() => {
    if (!paletteOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPaletteOpen(false);
    };
    const onPointer = (e: PointerEvent) => {
      const target = e.target as Node;
      if (wrapperRef.current?.contains(target)) return;
      setPaletteOpen(false);
    };
    window.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [paletteOpen]);

  return (
    <div ref={wrapperRef} className="w-full flex items-center justify-between gap-2">
      {/* Left cluster */}
      <div className="flex items-center gap-1 min-w-0">
        <HamburgerMenu />
        <ThemeModeButton />
        <PaletteButton
          open={paletteOpen}
          onToggle={() => setPaletteOpen((v) => !v)}
        />
        <VisualizerButton />
        <MusicSlot />
      </div>

      {/* Right: time + weather, flush right, mono single line. */}
      <div className="shrink-0 flex items-center pl-2">
        <LocalStatus />
      </div>

    </div>
  );
}

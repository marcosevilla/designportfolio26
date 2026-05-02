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
  PaletteIcon,
  PlayIcon,
  SunIcon,
  VisualsIcon,
} from "./Icons";
import { useThemeState } from "./ThemeToggle";

const POPOVER_SPRING = { type: "spring" as const, stiffness: 380, damping: 32 };
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
 *  colored-theme swatches. Active when popover is open. */
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
          <PaletteIcon size={14} />
          <ChevronDownIcon size={9} />
        </span>
      </button>
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

/** Music slot. Collapsed (not playing) → just the play button. Playing →
 *  inline-expanded MiniPlayerRow with rewind / pause / skip / title-with-
 *  hover-scrubber. The expansion of the row itself (max-width on the
 *  scrubber, polished entrance) lands in Phase 3. */
function MusicSlot() {
  const { isPlaying, togglePlay } = useAudioPlayer();
  if (!isPlaying) {
    return (
      <ToolbarIconButton label="Play music" onClick={togglePlay}>
        <PlayIcon size={14} />
      </ToolbarIconButton>
    );
  }
  return (
    <div
      className="flex items-center"
      style={{
        // Sized so the inline expansion has room without dominating the bar.
        // Phase 3 polishes this with a max-width on the hover scrubber.
        minWidth: 200,
        height: 28,
      }}
    >
      <MiniPlayerRow />
    </div>
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
  const popoverRef = useRef<HTMLDivElement>(null);

  // Close the palette popover on Escape and pointer-down outside both the
  // popover and the toolbar wrapper (which contains the trigger button).
  useEffect(() => {
    if (!paletteOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPaletteOpen(false);
    };
    const onPointer = (e: PointerEvent) => {
      const target = e.target as Node;
      if (wrapperRef.current?.contains(target)) return;
      if (popoverRef.current?.contains(target)) return;
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

      {/* Palette popover — anchored to the palette button via the
          paletteAnchorRef. Hangs below the toolbar with a small gap. */}
      <AnimatePresence>
        {paletteOpen && (
          <motion.div
            ref={popoverRef}
            key="palette-popover"
            initial={{ opacity: 0, y: -4, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -4, filter: "blur(6px)" }}
            transition={{ ...POPOVER_SPRING, duration: 0.22, ease: POPOVER_EASE }}
            className="chat-surface absolute z-[100]"
            style={{
              // Position relative to the toolbar host: ~top of toolbar +
              // toolbar height + 8px gap, anchored under the palette button.
              top: 44,
              // Offset from the left cluster start (hamburger + theme width).
              // Hardcoded to roughly match the palette button's x — the
              // anchor ref isn't used for measurement here, just popover
              // dismissal scoping. Phase 3 can refine with a proper measure.
              left: 88,
              padding: "10px 12px",
            }}
          >
            <PaletteRow />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

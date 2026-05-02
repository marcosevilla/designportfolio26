"use client";

// Floating bottom pill — mobile counterpart to HeroToolbar.
//
// HeroToolbar is dense (28×28 buttons) and tuned for desktop precision
// pointing. On phones every button is below the 40×40 hit minimum and
// the row is invisible because the host bar is hidden via media query
// in globals.css.
//
// This component takes its place: a *floating* pill (NOT flush to the
// edge — Safari's URL bar collapses on scroll and the iOS home indicator
// makes flush bottom bars feel buggy/cheap) centered horizontally at
// bottom + safe-area-inset, with 40×40 hit targets, backdrop-blur, and
// soft shadow. Coexists with the bottom-right "Ask Marco" chat pill.
//
// Buttons (in order):
//   [☰]    Hamburger — opens the existing HamburgerMenu nav sheet
//   [☀/☾]  Theme toggle — light ⇄ dark
//   [●]    Palette — opens a popover above the pill with the colored-theme swatches
//   [▶/⏸]  Music — toggles play/pause; full player still in the sheet at lg+
//
// Sized so 4 buttons fit comfortably on a 360px viewport without crowding
// the chat pill on the right.

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import HamburgerMenu from "./HamburgerMenu";
import { PaletteRow } from "./PaletteSwatches";
import { useAudioPlayer } from "@/lib/AudioPlayerContext";
import { useThemeState } from "./ThemeToggle";
import { MoonIcon, PauseIcon, PlayIcon, SunIcon } from "./Icons";

const POPOVER_EASE = [0.22, 1, 0.36, 1] as const;
const TINT_HOVER = "color-mix(in srgb, var(--color-accent) 8%, transparent)";
const TINT_ACTIVE = "color-mix(in srgb, var(--color-accent) 14%, transparent)";

/** 40×40 icon button used inside the pill. Hover/press affordances mirror
 *  HeroToolbar's ToolbarIconButton so the family reads as one. */
function PillIconButton({
  label,
  pressed = false,
  onClick,
  children,
}: {
  label: string;
  pressed?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={pressed}
      className="relative flex items-center justify-center w-10 h-10 rounded-full text-(--color-fg-secondary) hover:text-(--color-accent) focus-visible:text-(--color-accent) focus:outline-none cursor-pointer active:scale-[0.96] transition-[color,transform] duration-150 ease-out"
    >
      {pressed && (
        <span
          aria-hidden
          className="absolute inset-0 rounded-full"
          style={{ backgroundColor: TINT_ACTIVE }}
        />
      )}
      <span
        aria-hidden
        className="absolute inset-0 rounded-full opacity-0 hover:opacity-100 transition-opacity"
        style={{ backgroundColor: TINT_HOVER }}
      />
      <span className="relative inline-flex">{children}</span>
    </button>
  );
}

function ThemePillButton() {
  const t = useThemeState();
  if (!t.mounted) {
    // Reserve footprint pre-hydration so neighbours don't shift.
    return <span aria-hidden className="w-10 h-10 inline-block" />;
  }
  const isLight = t.mode === "light";
  return (
    <PillIconButton
      label={isLight ? "Switch to dark mode" : "Switch to light mode"}
      onClick={() => (isLight ? t.selectDark() : t.selectLight())}
    >
      {isLight ? <MoonIcon size={16} /> : <SunIcon size={16} />}
    </PillIconButton>
  );
}

function PalettePillButton({ open, onToggle }: { open: boolean; onToggle: () => void }) {
  return (
    <PillIconButton
      label="Theme palette"
      pressed={open}
      onClick={onToggle}
    >
      <span
        aria-hidden
        style={{
          width: 14,
          height: 14,
          borderRadius: "50%",
          backgroundColor: "var(--color-accent)",
          display: "inline-block",
          boxShadow: "inset 0 0 0 1px color-mix(in srgb, var(--color-fg) 12%, transparent)",
        }}
      />
    </PillIconButton>
  );
}

function MusicPillButton() {
  const { isPlaying, togglePlay } = useAudioPlayer();
  return (
    <PillIconButton
      label={isPlaying ? "Pause music" : "Play music"}
      pressed={isPlaying}
      onClick={togglePlay}
    >
      {isPlaying ? <PauseIcon size={14} /> : <PlayIcon size={14} />}
    </PillIconButton>
  );
}

export default function MobileToolbar() {
  const [paletteOpen, setPaletteOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close palette on Escape + pointer-down outside the pill+popover bounds.
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
    <div
      ref={wrapperRef}
      // lg:hidden so this never shows on desktop — HeroToolbar takes over
      // at the top there. Pinned bottom-center, ~16px above the screen
      // edge plus safe-area-inset (clears the iOS home indicator).
      className="lg:hidden fixed left-1/2 z-40 -translate-x-1/2 pointer-events-auto"
      style={{ bottom: "calc(env(safe-area-inset-bottom, 0px) + 16px)" }}
    >
      {/* The pill itself. Frosted bg + soft shadow to read as floating. */}
      <div
        className="flex items-center gap-1 rounded-full px-2 py-1.5"
        style={{
          backgroundColor: "color-mix(in srgb, var(--color-surface) 65%, transparent)",
          backdropFilter: "blur(20px) saturate(180%)",
          WebkitBackdropFilter: "blur(20px) saturate(180%)",
          border: "1px solid color-mix(in srgb, var(--color-border) 60%, transparent)",
          boxShadow:
            "0 12px 32px rgba(0, 0, 0, 0.18), 0 2px 6px rgba(0, 0, 0, 0.12)",
        }}
      >
        {/* HamburgerMenu's trigger is gated by `.chat-cmp-show` (compressed
            mode CSS) so it only shows in narrow desktop ranges. We need it
            *always* visible on mobile, so apply a Tailwind override. */}
        {/* `!flex` overrides .chat-cmp-show's `display: none` (gated by
            compressed-mode media queries that don't include narrow mobile
            in the right way for our purposes). `!w-10 !h-10` overrides
            .bio-toolbar-btn's hardcoded 32×32 sizing baked into its
            stylesheet — beats it without re-architecting that class. */}
        <HamburgerMenu className="!flex !w-10 !h-10 items-center justify-center rounded-full text-(--color-fg-secondary) hover:text-(--color-accent) focus-visible:text-(--color-accent) focus:outline-none active:scale-[0.96] transition-[color,transform] duration-150 ease-out" />
        <ThemePillButton />
        <PalettePillButton open={paletteOpen} onToggle={() => setPaletteOpen((v) => !v)} />
        <MusicPillButton />
      </div>

      {/* Palette popover — anchored above the pill, centered horizontally
          on the palette button. Animates in from below. */}
      <AnimatePresence>
        {paletteOpen && (
          <motion.div
            key="mobile-palette-popover"
            initial={{ opacity: 0, y: 4, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: 4, filter: "blur(6px)" }}
            transition={{ duration: 0.22, ease: POPOVER_EASE }}
            className="chat-surface absolute left-1/2 -translate-x-1/2"
            style={{
              bottom: "calc(100% + 8px)",
              padding: "8px",
              borderRadius: 12,
            }}
          >
            <PaletteRow />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

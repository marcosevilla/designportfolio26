"use client";

// Floating bottom *carousel* — mobile counterpart to HeroToolbar.
//
// Inspired by Apple's product page floating utility bars (e.g. AirPods Pro 3
// page on iOS Safari): a row of distinct, equal-height pills that scroll
// horizontally if they overflow the viewport, with each pill being its own
// floating element. Replaces the prior single-pill cluster, which crowded
// against the chat CTA on small screens.
//
// Pills (left to right):
//   1. Hamburger      — opens the existing HamburgerMenu sheet
//   2. Chat           — dispatches `chat:open`; ChatBar listens and opens the panel
//   3. Theme group    — light/dark toggle + colored-palette popover trigger
//   4. Music          — collapsed: 48×48 play button. Expanded (when playing):
//                        inline transport row (mirrors desktop MusicSlot expand)
//
// Carousel container scrolls horizontally with native overflow. Default
// scroll position 0 → hamburger flush left. Below lg only; above lg the
// HeroToolbar at top-of-viewport handles all of this.

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import HamburgerMenu from "./HamburgerMenu";
import { PaletteRow } from "./PaletteSwatches";
import { MiniPlayerRow } from "./music/HomeMiniPlayer";
import { useAudioPlayer } from "@/lib/AudioPlayerContext";
import { useThemeState } from "./ThemeToggle";
import { ChevronDownIcon, MoonIcon, PlayIcon, SunIcon } from "./Icons";

const POPOVER_EASE = [0.22, 1, 0.36, 1] as const;
const TINT_HOVER = "color-mix(in srgb, var(--color-accent) 8%, transparent)";
const TINT_ACTIVE = "color-mix(in srgb, var(--color-accent) 14%, transparent)";

// Music expand/collapse spring — same character as the desktop MusicSlot
// (HeroToolbar.tsx) so the mobile expansion reads as the same motion family.
const MUSIC_WIDTH_SPRING = { type: "spring" as const, stiffness: 320, damping: 36 };

const PILL_HEIGHT = 48;
const PILL_SHADOW =
  "0 12px 32px rgba(0, 0, 0, 0.18), 0 2px 6px rgba(0, 0, 0, 0.12)";
const PILL_BG_FROSTED = "color-mix(in srgb, var(--color-surface) 65%, transparent)";
const PILL_BORDER = "1px solid color-mix(in srgb, var(--color-border) 60%, transparent)";

/** Shared shell for the frosted pills (everything except chat, which uses
 *  the accent CTA treatment to stay visually distinct as the primary
 *  conversational entry point — same role it has on desktop). */
function FrostedPill({
  children,
  className = "",
  style,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={`flex items-center shrink-0 rounded-full ${className}`}
      style={{
        height: PILL_HEIGHT,
        background: PILL_BG_FROSTED,
        backdropFilter: "blur(20px) saturate(180%)",
        WebkitBackdropFilter: "blur(20px) saturate(180%)",
        border: PILL_BORDER,
        boxShadow: PILL_SHADOW,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/** 40×40 icon button used inside frosted pills. */
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

// ── Pills ──

function HamburgerPill() {
  return (
    <FrostedPill className="px-1">
      {/* Override .chat-cmp-show display:none + .bio-toolbar-btn hardcoded
          32×32 sizing so the trigger is always visible at 40×40 here. */}
      <HamburgerMenu className="!flex !w-10 !h-10 items-center justify-center rounded-full text-(--color-fg-secondary) hover:text-(--color-accent) focus-visible:text-(--color-accent) focus:outline-none active:scale-[0.96] transition-[color,transform] duration-150 ease-out" />
    </FrostedPill>
  );
}

function ChatPill() {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new CustomEvent("chat:open"))}
      aria-label="Open chat — Ask Marco"
      className="shrink-0 inline-flex items-center gap-2 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-(--color-accent) active:scale-[0.96] transition-transform duration-150 ease-out"
      style={{
        height: PILL_HEIGHT,
        padding: "0 18px",
        borderRadius: 9999,
        background: "var(--color-accent)",
        color: "var(--color-on-accent)",
        border: 0,
        boxShadow: PILL_SHADOW,
      }}
    >
      <span aria-hidden style={{ fontSize: 16, lineHeight: 1 }}>✸</span>
      <span
        style={{
          fontFamily: "var(--font-geist-mono), ui-monospace, Menlo, monospace",
          fontSize: "14px",
          fontWeight: 500,
          letterSpacing: "-0.005em",
          lineHeight: 1,
        }}
      >
        Ask Marco
      </span>
    </button>
  );
}

function ThemeModeButton() {
  const t = useThemeState();
  if (!t.mounted) return <span aria-hidden className="w-10 h-10 inline-block" />;
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

/** Theme palette trigger inside the theme group pill. Renders the active
 *  swatch as a colored disc + chevron — clicking opens a popover above the
 *  pill with the colored-theme swatches at a mobile-appropriate size. */
function PalettePillButton({ open, onToggle }: { open: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label="Theme palette"
      aria-pressed={open}
      aria-expanded={open}
      className="relative flex items-center justify-center gap-1 px-2 h-10 rounded-full focus:outline-none cursor-pointer text-(--color-fg-secondary) hover:text-(--color-accent) focus-visible:text-(--color-accent) active:scale-[0.96] transition-[color,transform] duration-150 ease-out"
    >
      {open && (
        <span
          aria-hidden
          className="absolute inset-0 rounded-full"
          style={{ backgroundColor: TINT_ACTIVE }}
        />
      )}
      <span className="relative inline-flex items-center gap-1">
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
        <ChevronDownIcon size={10} />
      </span>
    </button>
  );
}

/** Theme group pill: light/dark toggle + palette popover trigger. State and
 *  popover render are lifted to MobileToolbar so the popover can position
 *  itself against the viewport (full-width above the pill row) instead of
 *  the palette button — the latter overflows the screen edge on phones. */
function ThemePill({
  paletteOpen,
  onTogglePalette,
}: {
  paletteOpen: boolean;
  onTogglePalette: () => void;
}) {
  return (
    <FrostedPill className="px-1">
      <ThemeModeButton />
      <PalettePillButton open={paletteOpen} onToggle={onTogglePalette} />
    </FrostedPill>
  );
}

/** Music pill: collapsed = 48×48 play button. Expanded (isPlaying) = inline
 *  transport row with width spring. Mirrors desktop MusicSlot's interaction.
 *  MiniPlayerRow's hover-revealed scrubber doesn't fire on touch — that's a
 *  desktop-only nicety; mobile shows the title and the transport buttons. */
function MusicPill() {
  const { isPlaying, togglePlay } = useAudioPlayer();
  return (
    <motion.div
      animate={{ width: isPlaying ? 280 : 48 }}
      transition={MUSIC_WIDTH_SPRING}
      className="shrink-0 rounded-full relative overflow-hidden"
      style={{
        height: PILL_HEIGHT,
        background: PILL_BG_FROSTED,
        backdropFilter: "blur(20px) saturate(180%)",
        WebkitBackdropFilter: "blur(20px) saturate(180%)",
        border: PILL_BORDER,
        boxShadow: PILL_SHADOW,
      }}
    >
      {/* Collapsed play button — fades out when expanded takes over. */}
      <motion.div
        animate={{
          opacity: isPlaying ? 0 : 1,
          filter: isPlaying ? "blur(4px)" : "blur(0px)",
        }}
        transition={{ duration: 0.18, delay: isPlaying ? 0 : 0.18 }}
        style={{ pointerEvents: isPlaying ? "none" : "auto" }}
        className="absolute inset-0 flex items-center justify-center"
      >
        <PillIconButton label="Play music" onClick={togglePlay}>
          <PlayIcon size={16} />
        </PillIconButton>
      </motion.div>
      {/* Expanded transport row — slides in from the play button's origin. */}
      <motion.div
        animate={{
          opacity: isPlaying ? 1 : 0,
          filter: isPlaying ? "blur(0px)" : "blur(8px)",
          x: isPlaying ? 0 : -16,
        }}
        transition={{ duration: 0.3, delay: isPlaying ? 0.1 : 0 }}
        style={{ pointerEvents: isPlaying ? "auto" : "none" }}
        className="absolute inset-0 px-2"
      >
        <MiniPlayerRow />
      </motion.div>
    </motion.div>
  );
}

// ── Carousel ──

export default function MobileToolbar() {
  const [paletteOpen, setPaletteOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Close palette on Escape + pointer-down outside the popover.
  useEffect(() => {
    if (!paletteOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPaletteOpen(false);
    };
    const onPointer = (e: PointerEvent) => {
      const target = e.target as Node;
      // The trigger is inside the carousel row, the popover floats above it
      // — both must count as "inside" so a tap on the trigger doesn't
      // immediately close what it opened.
      if (popoverRef.current?.contains(target)) return;
      // Find the palette trigger via aria-label so we don't have to thread
      // a second ref through ThemePill.
      const trigger = document.querySelector('[aria-label="Theme palette"]');
      if (trigger?.contains(target)) return;
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
      // lg:hidden — desktop uses the top-anchored HeroToolbar instead.
      // pointer-events-none on the wrapper so the page below is clickable
      // outside the pills; pointer-events-auto on the inner row + popover.
      className="lg:hidden fixed left-0 right-0 z-40 pointer-events-none"
      style={{ bottom: "calc(env(safe-area-inset-bottom, 0px) + 12px)" }}
    >
      {/* Palette popover — viewport-fixed, sits ABOVE the pill row with
          12px gutters from each edge. Anchored to the viewport (not the
          trigger button) because the trigger's screen-x position drifts
          as the carousel scrolls; popping the popover relative to it
          overflows the right edge on small phones. */}
      <AnimatePresence>
        {paletteOpen && (
          <motion.div
            ref={popoverRef}
            key="mobile-palette-popover"
            initial={{ opacity: 0, y: 8, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: 8, filter: "blur(6px)" }}
            transition={{ duration: 0.22, ease: POPOVER_EASE }}
            className="chat-surface pointer-events-auto fixed"
            style={{
              // safe-area-bottom + carousel bottom gap + pill row height +
              // 12px gap above the pill row
              bottom: `calc(env(safe-area-inset-bottom, 0px) + 12px + ${PILL_HEIGHT}px + 12px)`,
              left: 12,
              right: 12,
              padding: "12px",
              borderRadius: 16,
            }}
          >
            {/* Bigger swatches (28×28) on mobile so they're properly
                tappable; wrap into 2 rows so 12 colors fit on a phone. */}
            <PaletteRow swatchSize={28} wrap />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Horizontal scroll row. `scrollbar-hide` defined in globals.css.
          touch-pan-x makes the iOS swipe land on this layer, not the body. */}
      <div
        className="pointer-events-auto flex items-center gap-2 px-3 overflow-x-auto touch-pan-x scrollbar-hide"
        style={{ overflowY: "visible", paddingBottom: 4, paddingTop: 4 }}
      >
        <HamburgerPill />
        <ChatPill />
        <ThemePill paletteOpen={paletteOpen} onTogglePalette={() => setPaletteOpen((v) => !v)} />
        <MusicPill />
      </div>
    </div>
  );
}

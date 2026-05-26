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
  CloseIcon,
  MoonIcon,
  PauseIcon,
  PlayIcon,
  SettingsIcon,
  SunIcon,
} from "./Icons";
import { useThemeState } from "./ThemeToggle";

const POPOVER_EASE = [0.22, 1, 0.36, 1] as const;

const TINT_HOVER = "color-mix(in srgb, var(--color-accent) 8%, transparent)";
const TINT_ACTIVE = "color-mix(in srgb, var(--color-accent) 14%, transparent)";

/** Shared icon-button shell — hover tint, active tint, focus ring. */
function ToolbarIconButton({
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
      className="relative flex items-center justify-center w-8 h-8 rounded-full transition-colors focus:outline-none text-(--color-fg-secondary) hover:text-(--color-accent) focus-visible:text-(--color-accent) cursor-pointer"
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
      <span className="relative inline-flex items-center gap-1">{children}</span>
    </button>
  );
}

/** Light/dark toggle. Renders an invisible slot pre-hydration. */
function ThemeModeButton() {
  const themeState = useThemeState();
  if (!themeState.mounted) {
    return <span aria-hidden style={{ width: 32, height: 32, display: "inline-block" }} />;
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

/** Palette button: opens a popover ABOVE the pill with theme swatches. */
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
        className="relative flex items-center justify-center h-8 px-2 rounded-full transition-colors focus:outline-none text-(--color-fg-secondary) hover:text-(--color-accent) focus-visible:text-(--color-accent) cursor-pointer"
      >
        {open && (
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
        <span className="relative inline-flex items-center gap-1">
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
      <AnimatePresence>
        {open && (
          <motion.div
            key="palette-popover"
            initial={{ opacity: 0, y: 4, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: 4, filter: "blur(6px)" }}
            transition={{ duration: 0.22, ease: POPOVER_EASE }}
            className="chat-surface absolute z-[120]"
            style={{
              bottom: "calc(100% + 10px)",
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

/** Music control. Collapsed = play/pause. Click chevron (or while playing the
 *  button itself) reveals the full MiniPlayerRow in a popover above. */
function MusicButton({
  open,
  onToggle,
}: {
  open: boolean;
  onToggle: () => void;
}) {
  const { isPlaying, togglePlay } = useAudioPlayer();
  return (
    <div className="relative">
      <button
        type="button"
        onClick={onToggle}
        aria-label={open ? "Hide player" : "Show player"}
        aria-pressed={open}
        aria-expanded={open}
        className="relative flex items-center justify-center h-8 px-2 rounded-full transition-colors focus:outline-none text-(--color-fg-secondary) hover:text-(--color-accent) focus-visible:text-(--color-accent) cursor-pointer"
      >
        {(open || isPlaying) && (
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
        <span
          className="relative inline-flex items-center gap-1"
          onClick={(e) => {
            // Tapping the play icon directly toggles playback without
            // opening the popover. Clicking the chevron opens.
            e.stopPropagation();
            togglePlay();
          }}
        >
          {isPlaying ? <PauseIcon size={14} /> : <PlayIcon size={14} />}
        </span>
        <span
          aria-hidden
          className="relative ml-0.5"
          onClick={(e) => {
            e.stopPropagation();
            onToggle();
          }}
        >
          <ChevronDownIcon size={9} />
        </span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            key="music-popover"
            initial={{ opacity: 0, y: 4, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: 4, filter: "blur(6px)" }}
            transition={{ duration: 0.22, ease: POPOVER_EASE }}
            className="chat-surface absolute z-[120]"
            style={{
              bottom: "calc(100% + 10px)",
              left: 0,
              padding: "10px 12px",
              borderRadius: 14,
              minWidth: 320,
            }}
          >
            <MiniPlayerRow />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** Ask Marco — Geist `*` glyph + label. Dispatches the existing chat:open
 *  CustomEvent that ChatBar listens for. */
function AskMarcoButton() {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new CustomEvent("chat:open"))}
      aria-label="Open chat — Ask Marco"
      className="relative flex items-center gap-1.5 h-8 px-2.5 rounded-full transition-colors focus:outline-none text-(--color-fg-secondary) hover:text-(--color-accent) focus-visible:text-(--color-accent) cursor-pointer"
    >
      <span
        aria-hidden
        className="absolute inset-0 rounded-full opacity-0 hover:opacity-100 transition-opacity"
        style={{ backgroundColor: TINT_HOVER }}
      />
      <span
        aria-hidden
        style={{
          fontSize: 18,
          lineHeight: 1,
          fontWeight: 500,
          color: "var(--color-accent)",
          transform: "translateY(15%)",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        *
      </span>
      <span
        className="relative"
        style={{
          fontFamily: "var(--font-sans)",
          fontSize: 13,
          fontWeight: 500,
          letterSpacing: "-0.005em",
        }}
      >
        Ask
      </span>
    </button>
  );
}

/** Bottom-sticky pill. Collapsed default: cog + time/weather. Click cog to
 *  expand controls leftward (hamburger, theme, palette, music, Ask Marco).
 *  Popovers anchor upward. Pill's right edge tracks the page's content
 *  container so it aligns with the project cards' right edge. */
export default function BottomToolbar() {
  const [expanded, setExpanded] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [musicOpen, setMusicOpen] = useState(false);
  const pillRef = useRef<HTMLDivElement>(null);

  // Close everything (popovers + expansion) on outside click / Escape.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setPaletteOpen(false);
        setMusicOpen(false);
        setExpanded(false);
      }
    };
    const onPointer = (e: PointerEvent) => {
      const target = e.target as Node;
      if (pillRef.current?.contains(target)) return;
      setPaletteOpen(false);
      setMusicOpen(false);
      // Don't auto-collapse — let the user explicitly close via the X.
      // Collapsing on outside click would hide controls every time the
      // user clicks anywhere on the page, which fights muscle memory.
    };
    window.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, []);

  return (
    /* Fixed positioning wrapper — same max-width + padding as the home
       page container (max-w-[1400px] + px-4 sm:px-8) so the pill's right
       edge sits at the same x as the rightmost project card. */
    <div
      className="fixed bottom-4 sm:bottom-6 left-0 right-0 z-[80] px-4 sm:px-8 pointer-events-none"
      aria-hidden={false}
    >
      <div className="max-w-[1400px] mx-auto flex justify-end">
        <div
          ref={pillRef}
          className="pointer-events-auto flex items-center gap-1 pl-1.5 pr-2 py-1.5 rounded-full"
          style={{
            backgroundColor: "var(--color-surface-raised)",
            border: "1px solid color-mix(in srgb, var(--color-border) 70%, transparent)",
            boxShadow:
              "0 1px 2px rgba(0,0,0,0.04), 0 8px 24px -8px rgba(0,0,0,0.18)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
          }}
        >
          {/* Expanded controls cluster — width animates from 0 → auto.
              Renders BEFORE the cog so growth pushes the pill's left
              edge outward while the right edge stays anchored. */}
          <AnimatePresence initial={false}>
            {expanded && (
              <motion.div
                key="controls"
                className="flex items-center gap-0.5 min-w-0 overflow-hidden"
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: "auto", opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.32, ease: POPOVER_EASE }}
              >
                {[
                  <HamburgerMenu key="hamburger" />,
                  <ThemeModeButton key="theme" />,
                  <PaletteButton
                    key="palette"
                    open={paletteOpen}
                    onToggle={() => {
                      setPaletteOpen((v) => !v);
                      setMusicOpen(false);
                    }}
                  />,
                  <MusicButton
                    key="music"
                    open={musicOpen}
                    onToggle={() => {
                      setMusicOpen((v) => !v);
                      setPaletteOpen(false);
                    }}
                  />,
                  <AskMarcoButton key="ask" />,
                ].map((child, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, filter: "blur(6px)", y: 2 }}
                    animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                    exit={{ opacity: 0, filter: "blur(6px)", y: 2 }}
                    transition={{
                      duration: 0.28,
                      ease: POPOVER_EASE,
                      delay: 0.05 + i * 0.04,
                    }}
                  >
                    {child}
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Cog / close — always present. Toggles the expanded cluster. */}
          <ToolbarIconButton
            label={expanded ? "Hide controls" : "Show controls"}
            pressed={expanded}
            onClick={() => {
              setExpanded((v) => !v);
              // Close any open popovers when collapsing.
              if (expanded) {
                setPaletteOpen(false);
                setMusicOpen(false);
              }
            }}
          >
            {expanded ? <CloseIcon size={12} /> : <SettingsIcon size={15} />}
          </ToolbarIconButton>

          {/* Divider between control zone and time/weather. */}
          <span
            aria-hidden
            className="mx-1 self-stretch"
            style={{
              width: 1,
              backgroundColor: "color-mix(in srgb, var(--color-border) 70%, transparent)",
            }}
          />

          {/* Time + weather — always visible on the right. */}
          <div className="shrink-0 flex items-center pr-1">
            <LocalStatus />
          </div>
        </div>
      </div>
    </div>
  );
}

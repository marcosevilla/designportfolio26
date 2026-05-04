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
import { createPortal } from "react-dom";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion";
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

const PILL_HEIGHT = 42;
// Lightened from 0.18/0.12 + 32px blur — the original spread was casting
// 4 overlapping shadows downward, which combined into a visible darker
// band beneath the carousel. This softer shadow still elevates each pill
// individually without pooling.
const PILL_SHADOW =
  "0 4px 14px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.06)";
// Chat pill (accent CTA) shadow runs a touch heavier so it reads as
// elevated against the copper bg. Same character, more weight.
const CHAT_PILL_SHADOW =
  "0 6px 18px rgba(0, 0, 0, 0.18), 0 1px 4px rgba(0, 0, 0, 0.12)";
const PILL_BG_FROSTED = "color-mix(in srgb, var(--color-surface) 70%, transparent)";
// saturate dropped 180→130; 180% was bumping the cream/copper page bg
// noticeably orange where the pills sat, which read as a halo.
const PILL_BACKDROP = "blur(18px) saturate(130%)";
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
        backdropFilter: PILL_BACKDROP,
        WebkitBackdropFilter: PILL_BACKDROP,
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
// (Buttons here are "naked" — no individual glass chrome. The whole
// toolbar is wrapped in ONE unified frosted pill in MobileToolbar
// below, so the buttons all sit on a single shared glass surface.)

function HamburgerInline() {
  return (
    /* Override .chat-cmp-show display:none + .bio-toolbar-btn hardcoded
       32×32 sizing so the trigger is always visible at 40×40 inside
       the unified pill. */
    <HamburgerMenu className="shrink-0 !flex !w-10 !h-10 items-center justify-center rounded-full text-(--color-fg-secondary) hover:text-(--color-accent) focus-visible:text-(--color-accent) focus:outline-none active:scale-[0.96] transition-[color,transform] duration-150 ease-out" />
  );
}

/** Ask Marco — accent-text button on the shared glass (no separate
 *  accent fill, since the visual unification of the toolbar is more
 *  important than CTA emphasis on this surface). The asterisk +
 *  uppercase mono label still mark it as the primary action by type
 *  treatment alone. */
function AskMarcoInline() {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new CustomEvent("chat:open"))}
      aria-label="Open chat — Ask Marco"
      className="shrink-0 inline-flex items-center gap-2 px-3 h-10 rounded-full cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-(--color-accent) active:scale-[0.96] transition-[background-color,transform] duration-150 ease-out hover:bg-(--color-muted)"
      style={{
        background: "transparent",
        color: "var(--color-accent)",
        border: 0,
      }}
    >
      <span
        aria-hidden
        style={{
          fontSize: 22,
          lineHeight: 1,
          fontWeight: 500,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          transform: "translateY(15%)",
        }}
      >
        *
      </span>
      <span
        style={{
          fontFamily: "var(--font-geist-mono), ui-monospace, Menlo, monospace",
          fontSize: "12px",
          fontWeight: 500,
          textTransform: "uppercase",
          letterSpacing: "0.06em",
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
      {isLight ? <MoonIcon size={20} /> : <SunIcon size={20} />}
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
      className="relative flex items-center justify-center gap-1.5 px-3 h-10 rounded-full focus:outline-none cursor-pointer text-(--color-fg-secondary) hover:text-(--color-accent) focus-visible:text-(--color-accent) active:scale-[0.96] transition-[color,transform] duration-150 ease-out"
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
            width: 16,
            height: 16,
            borderRadius: "50%",
            backgroundColor: "var(--color-accent)",
            display: "inline-block",
            boxShadow: "inset 0 0 0 1px color-mix(in srgb, var(--color-fg) 12%, transparent)",
          }}
        />
        <ChevronDownIcon size={12} />
      </span>
    </button>
  );
}

/** Theme group pill: light/dark toggle + palette popover trigger. State and
 *  popover render are lifted to MobileToolbar so the popover can position
 *  itself against the viewport (full-width above the pill row) instead of
 *  the palette button — the latter overflows the screen edge on phones. */
function ThemeInline({
  paletteOpen,
  onTogglePalette,
}: {
  paletteOpen: boolean;
  onTogglePalette: () => void;
}) {
  return (
    /* Two naked buttons inside the unified pill — no own chrome. */
    <>
      <ThemeModeButton />
      <PalettePillButton open={paletteOpen} onToggle={onTogglePalette} />
    </>
  );
}

/** Music pill: collapsed = 48×48 play button. Expanded (isPlaying) = inline
 *  transport row with width spring. Mirrors desktop MusicSlot's interaction.
 *  MiniPlayerRow's hover-revealed scrubber doesn't fire on touch — that's a
 *  desktop-only nicety; mobile shows the title and the transport buttons. */
// Fixed-width chrome inside the expanded music section: transport
// buttons (26 + 32 + 26 = 84) + gap-2 to swap zone (8) + spinning
// disc (14) + gap-1.5 to title (6) + a small breathing buffer (8).
// (No px-2 anymore — the music section sits flush on the shared
// toolbar glass instead of inside its own padded chrome.) Add the
// measured title width to this to get the pill's auto-fit width.
const PILL_FIXED_WIDTH = 84 + 8 + 14 + 6 + 8;

function MusicInline() {
  const { isPlaying, togglePlay, currentTrack } = useAudioPlayer();
  const titleMeasureRef = useRef<HTMLSpanElement>(null);
  const [pillWidth, setPillWidth] = useState(280);

  // The expanded music section's width is content-aware — measure the
  // current title's natural width using a hidden span styled
  // identically to the visible title in MiniPlayerRow, then size the
  // section to fit. Re-runs when the track changes so longer titles
  // get a wider section.
  useEffect(() => {
    const el = titleMeasureRef.current;
    if (!el) return;
    const update = () => {
      setPillWidth(PILL_FIXED_WIDTH + el.offsetWidth);
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [currentTrack?.title, currentTrack?.artist]);

  return (
    <motion.div
      animate={{ width: isPlaying ? pillWidth : 40 }}
      transition={MUSIC_WIDTH_SPRING}
      // Naked: no own bg / border / shadow — sits on the shared glass
      // of the unified toolbar pill. Keeps `relative overflow-hidden`
      // because the inner play / transport states use absolute
      // positioning inside this box.
      className="shrink-0 rounded-full relative overflow-hidden"
      style={{ height: 40 }}
    >
      {/* Hidden width measurer for the current title's natural width.
          Mirrors the font styles of the visible title <p> in
          MiniPlayerRow so the measurement matches what gets rendered. */}
      <span
        ref={titleMeasureRef}
        aria-hidden
        style={{
          position: "absolute",
          visibility: "hidden",
          whiteSpace: "nowrap",
          fontFamily: "var(--font-geist-mono), ui-monospace, Menlo, monospace",
          fontSize: "11px",
          letterSpacing: "-0.02em",
          fontWeight: 400,
          top: 0,
          left: 0,
          pointerEvents: "none",
        }}
      >
        {currentTrack ? `${currentTrack.title} · ${currentTrack.artist}` : ""}
      </span>
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
          <PlayIcon size={20} />
        </PillIconButton>
      </motion.div>
      {/* Expanded transport row — slides in from the play button's
          origin. No internal px padding now: the music section sits on
          the shared toolbar glass, so adding 8px on each side of
          MiniPlayerRow stacked on top of the toolbar's gap-1 made the
          gap from the theme buttons to the transport buttons read as
          ~12px while every other gap was 4px. Without it, the toolbar
          gap rhythm runs cleanly across the whole row. */}
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

// ── Carousel ──

export default function MobileToolbar() {
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  // Compact-on-scroll-down state: instead of hiding the bar, scale the
  // pill row down to a smaller "compact" version while scrolling down,
  // and expand back when the user scrolls up or hits the top. The bar
  // is always visible — just smaller when out of focus.
  const [compact, setCompact] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();

  useEffect(() => setMounted(true), []);

  // Compact threshold 80px so a tiny intentional flick at the top
  // doesn't shrink the controls before there's anything to read.
  useMotionValueEvent(scrollY, "change", (latest) => {
    const prev = scrollY.getPrevious() ?? 0;
    const delta = latest - prev;
    if (delta > 4 && latest > 80) {
      setCompact(true);
      // Close the palette while the bar shrinks so the popover doesn't
      // float disconnected from a smaller anchor.
      setPaletteOpen(false);
    } else if (delta < -4 || latest < 40) {
      setCompact(false);
    }
  });

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

  // Compact scale — uniform shrink so all pills (including the
  // text-bearing ChatPill) collapse together as one row. 0.78 keeps
  // the pills readable + tap-target-sized while reading clearly as
  // "out of focus chrome".
  const COMPACT_SCALE = 0.78;

  return (
    <motion.div
      // lg:hidden — desktop uses the same top-anchored slot via
      // HeroToolbar. pointer-events-none on the wrapper so the page
      // below is tappable outside the pills; pointer-events-auto on
      // the inner row + popover.
      className="lg:hidden fixed left-0 right-0 z-40 pointer-events-none"
      // Anchored to the top of the viewport (+ safe-area-inset-top for
      // notched devices). Was bottom-anchored — moved up so the toolbar
      // reads as a proper sticky chrome strip instead of a floating
      // bottom dock that competed with the chat pill.
      style={{ top: "calc(env(safe-area-inset-top, 0px) + 4px)" }}
    >
      {/* Palette popover — portaled to <body> so it sits in its own
          stacking context above any parent transforms/backdrop-filters
          that might have been clipping it inside the carousel wrapper.
          Viewport-fixed, sits BELOW the pill row with 12px gutters from
          each edge. */}
      {mounted &&
        createPortal(
          <AnimatePresence>
            {paletteOpen && (
              <motion.div
                ref={popoverRef}
                key="mobile-palette-popover"
                initial={{ opacity: 0, y: -8, filter: "blur(6px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -8, filter: "blur(6px)" }}
                transition={{ duration: 0.22, ease: POPOVER_EASE }}
                className="chat-surface fixed z-[120]"
                style={{
                  // safe-area-top + toolbar top gap + pill row height +
                  // 12px gap below the pill row
                  top: `calc(env(safe-area-inset-top, 0px) + 4px + ${PILL_HEIGHT}px + 12px)`,
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
          </AnimatePresence>,
          document.body,
        )}

      {/* Unified toolbar pill — ONE wide frosted surface holding all
          the controls. The left side (hamburger / theme / music) lives
          inside a horizontally-scrollable strip so the music section's
          expanded width can overflow the viewport without breaking
          layout; "Ask Marco" sits OUTSIDE that scroll region, pinned
          to the right edge of the same pill, so it stays visible
          regardless of how far the user has scrolled the left strip. */}
      <div
        className="pointer-events-auto px-3"
        style={{ paddingTop: 4, paddingBottom: 4 }}
      >
        <motion.div
          // w-full anchors the pill to its parent's (viewport-px-3)
          // width so the inner flex math (flex-1 min-w-0 on the scroll
          // strip) actually shrinks the strip to fit; without it the
          // pill grew to its natural content width and pushed the
          // expanded music section past the viewport, where the
          // scrubber bar visually crossed under the Ask Marco button.
          // overflow-hidden ensures nothing inside escapes the rounded
          // shape — the inner scroll strip handles its own horizontal
          // scrolling while this clip stops any descendant from
          // visually leaking past the pill chrome.
          className="rounded-full flex items-center w-full overflow-hidden"
          style={{
            height: PILL_HEIGHT,
            background: PILL_BG_FROSTED,
            backdropFilter: PILL_BACKDROP,
            WebkitBackdropFilter: PILL_BACKDROP,
            border: PILL_BORDER,
            boxShadow: PILL_SHADOW,
            transformOrigin: "top center",
          }}
          animate={{ scale: compact ? COMPACT_SCALE : 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 38 }}
        >
          {/* Scrollable left strip. min-w-0 lets flex actually shrink
              this section so its overflow can scroll instead of pushing
              the right-pinned Ask Marco off-screen. touch-pan-x makes
              iOS swipes land here, not on the body; scrollbar-hide is
              defined in globals.css. */}
          <div className="flex items-center gap-1 flex-1 min-w-0 overflow-x-auto touch-pan-x scrollbar-hide pl-1">
            <HamburgerInline />
            <ThemeInline
              paletteOpen={paletteOpen}
              onTogglePalette={() => setPaletteOpen((v) => !v)}
            />
            <MusicInline />
          </div>
          {/* Right-pinned Ask Marco — outside the scroll region so it
              never disappears when the music section expands past the
              available width. */}
          <AskMarcoInline />
        </motion.div>
      </div>
    </motion.div>
  );
}

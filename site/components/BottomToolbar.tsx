"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { PaletteRow } from "./PaletteSwatches";
import { MiniPlayerRow } from "./music/HomeMiniPlayer";
import { useAudioPlayer } from "@/lib/AudioPlayerContext";
import LocalStatus from "./LocalStatus";
import { MoonIcon, MusicNoteIcon, SettingsIcon, SunIcon } from "./Icons";
import { useThemeState } from "./ThemeToggle";

const POPOVER_EASE = [0.22, 1, 0.36, 1] as const;

const TINT_HOVER = "color-mix(in srgb, var(--color-accent) 8%, transparent)";
const TINT_ACTIVE = "color-mix(in srgb, var(--color-accent) 14%, transparent)";

/** Shared drop shadow for both pills. Defined once so the two surfaces
 *  are guaranteed to match. */
const PILL_SHADOW =
  "0 1px 2px rgba(0,0,0,0.04), 0 8px 24px -8px rgba(0,0,0,0.18)";

/** Light/dark mode segment — rendered inside the palette popover as a
 *  two-button segmented control so the user can pick a mode and a color
 *  family from the same surface. */
function ThemeModeSegment() {
  const themeState = useThemeState();
  if (!themeState.mounted) return null;
  const isLight = themeState.mode === "light";
  const baseClasses =
    "relative inline-flex items-center justify-center gap-1 h-7 px-2.5 rounded-full transition-colors focus:outline-none cursor-pointer";
  return (
    <div className="flex items-center gap-1 px-1">
      <button
        type="button"
        onClick={() => themeState.selectLight()}
        aria-pressed={isLight}
        aria-label="Switch to light mode"
        className={baseClasses}
        style={{
          backgroundColor: isLight ? TINT_ACTIVE : "transparent",
          color: isLight ? "var(--color-accent)" : "var(--color-fg-secondary)",
          fontFamily: "var(--font-sans)",
          fontSize: 12,
          fontWeight: 500,
        }}
      >
        <SunIcon size={12} />
        <span>Light</span>
      </button>
      <button
        type="button"
        onClick={() => themeState.selectDark()}
        aria-pressed={!isLight}
        aria-label="Switch to dark mode"
        className={baseClasses}
        style={{
          backgroundColor: !isLight ? TINT_ACTIVE : "transparent",
          color: !isLight ? "var(--color-accent)" : "var(--color-fg-secondary)",
          fontFamily: "var(--font-sans)",
          fontSize: 12,
          fontWeight: 500,
        }}
      >
        <MoonIcon size={12} />
        <span>Dark</span>
      </button>
    </div>
  );
}

/** Popover rendered via portal so the surrounding overflow:hidden (used
 *  for the cluster's width animation) doesn't clip it. Positioned with
 *  absolute coords computed from the trigger element's bounding rect.
 *  Re-measures on resize + scroll for resilience. */
function PortalPopover({
  open,
  anchorRef,
  children,
  minWidth,
}: {
  open: boolean;
  anchorRef: React.RefObject<HTMLElement | null>;
  children: React.ReactNode;
  minWidth?: number;
}) {
  const [mounted, setMounted] = useState(false);
  const [pos, setPos] = useState<{ left: number; bottom: number } | null>(null);

  useEffect(() => setMounted(true), []);

  useLayoutEffect(() => {
    if (!open) return;
    const update = () => {
      const el = anchorRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      setPos({
        left: rect.left,
        // Bottom anchor in viewport coords — distance from viewport bottom
        // to the top of the trigger, plus a 10px gap.
        bottom: window.innerHeight - rect.top + 10,
      });
    };
    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [open, anchorRef]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && pos && (
        <motion.div
          initial={{ opacity: 0, y: 4, filter: "blur(6px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: 4, filter: "blur(6px)" }}
          transition={{ duration: 0.22, ease: POPOVER_EASE }}
          className="chat-surface fixed z-[200]"
          style={{
            left: pos.left,
            bottom: pos.bottom,
            padding: "6px",
            borderRadius: 12,
            minWidth,
          }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

/** Palette button — popover holds light/dark segment + color swatches.
 *  No chevron; the icon alone signals "open theme controls". */
function PaletteButton({
  open,
  onToggle,
}: {
  open: boolean;
  onToggle: () => void;
}) {
  const triggerRef = useRef<HTMLButtonElement>(null);
  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={onToggle}
        aria-label="Theme"
        aria-pressed={open}
        aria-expanded={open}
        className="relative flex items-center justify-center w-8 h-8 rounded-full transition-colors focus:outline-none text-(--color-fg-secondary) hover:text-(--color-accent) focus-visible:text-(--color-accent) cursor-pointer"
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
        <span className="relative inline-flex">
          <SettingsIcon size={15} />
        </span>
      </button>
      <PortalPopover open={open} anchorRef={triggerRef}>
        <div className="flex flex-col gap-2">
          <ThemeModeSegment />
          <div
            aria-hidden
            style={{
              height: 1,
              backgroundColor: "color-mix(in srgb, var(--color-border) 70%, transparent)",
            }}
          />
          <PaletteRow />
        </div>
      </PortalPopover>
    </>
  );
}

/** Music button — single icon toggle. Popover hosts the full player
 *  (track, transport, scrubber). No inline play/pause; everything
 *  happens inside the popover. */
function MusicButton({
  open,
  onToggle,
}: {
  open: boolean;
  onToggle: () => void;
}) {
  const { isPlaying } = useAudioPlayer();
  const triggerRef = useRef<HTMLButtonElement>(null);
  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={onToggle}
        aria-label={open ? "Hide player" : "Show player"}
        aria-pressed={open}
        aria-expanded={open}
        className="relative flex items-center justify-center w-8 h-8 rounded-full transition-colors focus:outline-none text-(--color-fg-secondary) hover:text-(--color-accent) focus-visible:text-(--color-accent) cursor-pointer"
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
        <span className="relative inline-flex">
          <MusicNoteIcon size={15} />
        </span>
      </button>
      <PortalPopover open={open} anchorRef={triggerRef} minWidth={320}>
        <div style={{ padding: "6px 10px" }}>
          <MiniPlayerRow />
        </div>
      </PortalPopover>
    </>
  );
}

/** Standalone chat-trigger pill — sits next to the controls pill as a
 *  visually distinct sibling. Accent-filled to match the prior chat-cta.
 *  Fades out when the chat panel is open (observed via the data-chat-open
 *  attribute that ChatBar sets on <html>). Dispatches chat:open to ask
 *  ChatBar to open the panel. */
function ChatTriggerPill() {
  const [chatOpen, setChatOpen] = useState(false);

  // Mirror ChatBar's <html data-chat-open> attribute so we can fade out
  // while the panel is mounted. Using MutationObserver keeps us decoupled
  // from ChatBar's internal state — no prop drilling or shared context.
  useEffect(() => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    const sync = () => setChatOpen(root.getAttribute("data-chat-open") === "true");
    sync();
    const mo = new MutationObserver(sync);
    mo.observe(root, { attributes: true, attributeFilter: ["data-chat-open"] });
    return () => mo.disconnect();
  }, []);

  return (
    <motion.button
      type="button"
      onClick={() => window.dispatchEvent(new CustomEvent("chat:open"))}
      animate={{ opacity: chatOpen ? 0 : 1, scale: chatOpen ? 0.92 : 1 }}
      transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
      aria-label="Open chat"
      className="pointer-events-auto inline-flex items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-(--color-accent)"
      style={{
        height: 46,
        padding: "0 20px",
        cursor: chatOpen ? "default" : "pointer",
        background: "var(--color-accent)",
        color: "var(--color-on-accent)",
        border: 0,
        borderRadius: 0,
        boxShadow: PILL_SHADOW,
        overflow: "hidden",
        pointerEvents: chatOpen ? "none" : "auto",
        transformOrigin: "bottom right",
      }}
    >
      <span
        style={{
          fontFamily: "var(--font-geist-mono), ui-monospace, Menlo, monospace",
          fontSize: 12,
          fontWeight: 500,
          color: "var(--color-on-accent)",
          lineHeight: 1,
          textTransform: "uppercase",
          letterSpacing: "0.06em",
        }}
      >
        Chat
      </span>
    </motion.button>
  );
}

/** Tracks the right edge (in viewport coords) of the `#projects` section
 *  so the pill's right-edge can be aligned with the rightmost project
 *  card. Falls back to a safe 32px offset before #projects mounts. */
function useProjectsRightOffset() {
  const [rightOffset, setRightOffset] = useState<number>(32);
  useEffect(() => {
    const update = () => {
      const el = document.getElementById("projects");
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const next = Math.max(8, window.innerWidth - rect.right);
      setRightOffset(next);
    };
    update();
    const el = document.getElementById("projects");
    let ro: ResizeObserver | null = null;
    if (el && typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(update);
      ro.observe(el);
    }
    window.addEventListener("resize", update);
    return () => {
      ro?.disconnect();
      window.removeEventListener("resize", update);
    };
  }, []);
  return rightOffset;
}

/** Bottom-sticky toolbar. Two sibling pills sharing the same chrome and
 *  drop shadow: a controls pill on the left and a chat-trigger pill on
 *  the right. Both anchored to #projects's right edge. */
export default function BottomToolbar() {
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [musicOpen, setMusicOpen] = useState(false);
  const pillRef = useRef<HTMLDivElement>(null);
  const rightOffset = useProjectsRightOffset();

  // Escape + outside click close popovers.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setPaletteOpen(false);
        setMusicOpen(false);
      }
    };
    const onPointer = (e: PointerEvent) => {
      const target = e.target as Node;
      if (pillRef.current?.contains(target)) return;
      const inPopover = (target as Element | null)?.closest?.(".chat-surface");
      if (inPopover) return;
      setPaletteOpen(false);
      setMusicOpen(false);
    };
    window.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, []);

  return (
    <div
      className="fixed bottom-4 sm:bottom-6 z-[80] pointer-events-none"
      style={{ right: rightOffset, left: 16 }}
      aria-hidden={false}
    >
      <div className="flex justify-end items-center gap-2">
        <div
          ref={pillRef}
          className="pointer-events-auto flex items-center gap-1 px-2 py-1.5 rounded-none"
          style={{
            // Lighter, still themed — mix of bg (neutral white/dark) with a
            // touch of surface-raised tint so colored themes still register
            // without saturating the toolbar.
            backgroundColor:
              "color-mix(in srgb, var(--color-bg) 80%, var(--color-surface-raised))",
            border: "1px solid color-mix(in srgb, var(--color-border) 60%, transparent)",
            boxShadow: PILL_SHADOW,
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
          }}
        >
          <PaletteButton
            open={paletteOpen}
            onToggle={() => {
              setPaletteOpen((v) => !v);
              setMusicOpen(false);
            }}
          />
          <MusicButton
            open={musicOpen}
            onToggle={() => {
              setMusicOpen((v) => !v);
              setPaletteOpen(false);
            }}
          />

          <span
            aria-hidden
            className="mx-1 self-stretch"
            style={{
              width: 1,
              backgroundColor: "color-mix(in srgb, var(--color-border) 70%, transparent)",
            }}
          />

          <div className="shrink-0 flex items-center pr-1">
            <LocalStatus />
          </div>
        </div>

        {/* Sibling chat-trigger pill — visually distinct, same height +
            drop shadow as the toolbar pill. Flush-right; toolbar pill
            sits to its left via the parent's gap-2. */}
        <ChatTriggerPill />
      </div>
    </div>
  );
}

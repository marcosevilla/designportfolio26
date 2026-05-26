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

const PILL_SHADOW =
  "0 1px 2px rgba(0,0,0,0.04), 0 8px 24px -8px rgba(0,0,0,0.18)";

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

/** Popover rendered via portal so the toolbar's overflow doesn't clip it.
 *  Opens *below* the trigger (top-anchored toolbar). Right-aligned to the
 *  trigger's right edge so the popover doesn't slide off-screen at the
 *  viewport's right edge. */
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
  const [pos, setPos] = useState<{ right: number; top: number } | null>(null);

  useEffect(() => setMounted(true), []);

  useLayoutEffect(() => {
    if (!open) return;
    const update = () => {
      const el = anchorRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      setPos({
        // Right-align to the trigger's right edge in viewport coords.
        right: window.innerWidth - rect.right,
        // Drop below the trigger with a 10px gap.
        top: rect.bottom + 10,
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
          initial={{ opacity: 0, y: -4, filter: "blur(6px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -4, filter: "blur(6px)" }}
          transition={{ duration: 0.22, ease: POPOVER_EASE }}
          className="chat-surface fixed z-[200]"
          style={{
            right: pos.right,
            top: pos.top,
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

/** Chat-trigger pill — sits to the right of the controls pill in the
 *  top-right header cluster. Dispatches chat:open which ChatBar listens
 *  to (mounted globally in app/layout.tsx). */
function ChatTriggerPill() {
  const [chatOpen, setChatOpen] = useState(false);

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
        height: 38,
        padding: "0 16px",
        cursor: chatOpen ? "default" : "pointer",
        background: "var(--color-accent)",
        color: "var(--color-on-accent)",
        border: 0,
        borderRadius: 0,
        boxShadow: PILL_SHADOW,
        overflow: "hidden",
        pointerEvents: chatOpen ? "none" : "auto",
        transformOrigin: "top right",
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

/** Header toolbar — fixed top-right cluster. Two sibling pills (controls +
 *  chat trigger) sharing chrome + drop shadow. Always anchored to the
 *  viewport's right edge; not tied to any section. */
export default function HeaderToolbar() {
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [musicOpen, setMusicOpen] = useState(false);
  const pillRef = useRef<HTMLDivElement>(null);

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
      className="hidden lg:block fixed top-4 right-4 sm:right-6 z-[80] pointer-events-none"
      aria-hidden={false}
    >
      <div className="flex justify-end items-center gap-2">
        <div
          ref={pillRef}
          className="pointer-events-auto flex items-center gap-1 px-2 py-1.5 rounded-none"
          style={{
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

        <ChatTriggerPill />
      </div>
    </div>
  );
}

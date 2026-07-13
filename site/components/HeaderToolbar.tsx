"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { PaletteRow } from "./PaletteSwatches";
import { useChangelogOverlay } from "@/lib/ChangelogOverlayContext";
import { ChangelogIcon, MoonIcon, PaintBrushIcon, SunIcon } from "./Icons";
import { useThemeState } from "./ThemeToggle";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const POPOVER_EASE = [0.22, 1, 0.36, 1] as const;

/** Light/dark toggle — a single icon button in the toolbar (between the
 *  music and settings buttons). Shows the mode you'll switch TO: a moon
 *  while light, a sun while dark. */
function ThemeToggleButton() {
  const themeState = useThemeState();
  if (!themeState.mounted) return null;
  const isLight = themeState.mode === "light";
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <button
            type="button"
            onClick={() =>
              isLight ? themeState.selectDark() : themeState.selectLight()
            }
            aria-label={isLight ? "Switch to dark mode" : "Switch to light mode"}
            className="bio-toolbar-btn focus:outline-none focus-visible:ring-2 focus-visible:ring-(--color-accent)"
          />
        }
      >
        {isLight ? <MoonIcon size={15} /> : <SunIcon size={15} />}
      </TooltipTrigger>
      <TooltipContent>{isLight ? "Dark mode" : "Light mode"}</TooltipContent>
    </Tooltip>
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
            borderRadius: 0,
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
      <Tooltip>
        <TooltipTrigger
          render={
            <button
              ref={triggerRef}
              type="button"
              onClick={onToggle}
              aria-label="Settings"
              aria-pressed={open}
              aria-expanded={open}
              className={`bio-toolbar-btn${open ? " bio-toolbar-btn--active" : ""} focus:outline-none focus-visible:ring-2 focus-visible:ring-(--color-accent)`}
            />
          }
        >
          <PaintBrushIcon size={15} />
        </TooltipTrigger>
        <TooltipContent>Settings</TooltipContent>
      </Tooltip>
      <PortalPopover open={open} anchorRef={triggerRef}>
        <PaletteRow />
      </PortalPopover>
    </>
  );
}

/** Tiny notes that shed off the main glyph while audio plays. Each one
 *  drifts up-and-outward, rotates a touch, and fades — staggered so the
 *  button reads as gently "singing" rather than the static bg tint we
 *  used before. Purely decorative; hidden from a11y + reduced-motion. */
/* Music entrypoint removed from the header — the player now lives in
   the bottom-right music dock (components/music/MusicMiniWidget.tsx). */

/** "What's new" button — opens the global ChangelogOverlay (the
 *  month-grouped milestone log parsed from docs/CHANGELOG.md). */
function ChangelogButton() {
  const { changelogOpen, toggleChangelog } = useChangelogOverlay();
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <button
            type="button"
            onClick={toggleChangelog}
            aria-label="What's new"
            aria-pressed={changelogOpen}
            className={`bio-toolbar-btn${changelogOpen ? " bio-toolbar-btn--active" : ""} focus:outline-none focus-visible:ring-2 focus-visible:ring-(--color-accent)`}
          />
        }
      >
        <ChangelogIcon size={15} />
      </TooltipTrigger>
      <TooltipContent>What&rsquo;s new</TooltipContent>
    </Tooltip>
  );
}

/** Header toolbar — fixed top-right cluster. Two sibling pills (controls +
 *  chat trigger) sharing chrome + drop shadow. Always anchored to the
 *  viewport's right edge; not tied to any section. */
export default function HeaderToolbar() {
  const [paletteOpen, setPaletteOpen] = useState(false);
  const pillRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPaletteOpen(false);
    };
    const onPointer = (e: PointerEvent) => {
      const target = e.target as Node;
      if (pillRef.current?.contains(target)) return;
      const inPopover = (target as Element | null)?.closest?.(".chat-surface");
      if (inPopover) return;
      setPaletteOpen(false);
    };
    window.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, []);

  return (
    <TooltipProvider delay={100}>
      <div className="flex items-center gap-2">
        <div ref={pillRef} className="flex items-center gap-1">
          {/* ChangelogButton hidden for now — re-add here when the
              changelog is ready to surface again. */}
          <ThemeToggleButton />
          <PaletteButton
            open={paletteOpen}
            onToggle={() => setPaletteOpen((v) => !v)}
          />
        </div>
      </div>
    </TooltipProvider>
  );
}

"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SPRING_HEAVY } from "@/lib/springs";
import { MinusIcon, ResetIcon, PlusIcon } from "./Icons";
import {
  coloredThemes,
  fontPairings,
  type ThemeMode,
} from "./ThemeToggle";
import { DynamicBioGrid } from "./dynamic-bio";
import type { GridPosition } from "@/lib/bio-content";

type BioMode = "classic" | "dynamic";

interface ThemePaletteProps {
  open: boolean;
  onClose: () => void;
  mode: ThemeMode;
  coloredThemeName: string | null;
  fontPairingName: string;
  fontSizeOffset: number;
  bioMode?: BioMode;
  gridPosition?: GridPosition;
  onBioModeToggle?: () => void;
  onGridPositionChange?: (position: GridPosition) => void;
  onSelectLight: () => void;
  onSelectDark: () => void;
  onSelectColored: (name: string) => void;
  onSelectFont: (name: string) => void;
  onIncreaseFontSize: () => void;
  onDecreaseFontSize: () => void;
  onResetAll: () => void;
  isMobile?: boolean;
  anchorPos?: { top: number; left: number } | null;
}

const builtInSwatches = [
  { id: "light", accent: "#B5651D" },
  { id: "dark", accent: "#D4915E" },
];

export default function ThemePalette({
  open,
  onClose,
  mode,
  coloredThemeName,
  fontPairingName,
  fontSizeOffset,
  bioMode,
  gridPosition,
  onBioModeToggle,
  onGridPositionChange,
  onSelectLight,
  onSelectDark,
  onSelectColored,
  onSelectFont,
  onIncreaseFontSize,
  onDecreaseFontSize,
  onResetAll,
  isMobile,
  anchorPos,
}: ThemePaletteProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  const isActiveColor = (id: string) => {
    if (id === "light") return mode === "light";
    if (id === "dark") return mode === "dark";
    return mode === "colored" && coloredThemeName === id;
  };

  const handleColorClick = (id: string) => {
    if (id === "light") onSelectLight();
    else if (id === "dark") onSelectDark();
    else onSelectColored(id);
  };

  const desktopMotion = {
    initial: { scale: 0.85, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0.85, opacity: 0 },
    transition: SPRING_HEAVY,
  };

  const mobileMotion = {
    initial: { y: "100%" },
    animate: { y: 0 },
    exit: { y: "100%" },
    transition: { type: "spring" as const, stiffness: 350, damping: 32 },
  };

  const m = isMobile;
  const gap = m ? "8px" : "5px";

  const actionBtnStyle: React.CSSProperties = {
    backgroundColor: "var(--color-bg)",
    border: "1px solid var(--color-border)",
    cursor: "pointer",
    color: "var(--color-fg-secondary)",
    transition: "box-shadow 200ms ease, color 200ms ease",
  };

  const paletteContent = (
    <>
      {/* Mobile drag handle */}
      {m && (
        <div className="flex justify-center mb-3">
          <div
            className="rounded-full"
            style={{
              width: "36px",
              height: "4px",
              backgroundColor: "var(--color-fg-tertiary)",
            }}
          />
        </div>
      )}

      {/* Color swatches */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(6, 1fr)",
          gap,
        }}
      >
        {builtInSwatches.map((s) => (
          <button
            key={s.id}
            onClick={() => handleColorClick(s.id)}
            aria-label={`${s.id} theme`}
            className="rounded-full aspect-square"
            style={{
              width: "100%",
              backgroundColor: s.accent,
              boxShadow: isActiveColor(s.id)
                ? "0 0 0 2px var(--color-accent)"
                : "0 0 0 1px var(--color-border)",
              transition: "box-shadow 200ms ease",
              cursor: "pointer",
            }}
          />
        ))}
        {coloredThemes.map((t) => (
          <button
            key={t.name}
            onClick={() => handleColorClick(t.name)}
            aria-label={`${t.name} theme`}
            className="rounded-full aspect-square"
            style={{
              width: "100%",
              backgroundColor: t.accent,
              boxShadow: isActiveColor(t.name)
                ? "0 0 0 2px var(--color-accent)"
                : "0 0 0 1px var(--color-border)",
              transition: "box-shadow 200ms ease",
              cursor: "pointer",
            }}
          />
        ))}
      </div>

      {/* Font pairing cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap,
          marginTop: m ? "12px" : "8px",
        }}
      >
        {fontPairings.map((p) => (
          <button
            key={p.name}
            onClick={() => onSelectFont(p.name)}
            aria-label={`${p.name} font pairing`}
            className="flex items-center justify-center rounded-none aspect-square"
            style={{
              backgroundColor: "var(--color-bg)",
              border: "1px solid var(--color-border)",
              boxShadow:
                fontPairingName === p.name
                  ? "0 0 0 2px var(--color-accent)"
                  : "none",
              transition: "box-shadow 200ms ease",
              cursor: "pointer",
            }}
          >
            <span
              style={{
                fontFamily: p.display,
                fontSize: m ? "22px" : "15px",
                fontWeight: 700,
                fontStyle: (p as any).headingStyle || "normal",
                color: "var(--color-fg)",
                lineHeight: 1,
              }}
            >
              Aa
            </span>
          </button>
        ))}
      </div>

      {/* Action buttons: - / reset / + */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap,
          marginTop: m ? "12px" : "8px",
        }}
      >
        <button
          onClick={onDecreaseFontSize}
          aria-label="Decrease font size"
          disabled={fontSizeOffset <= -4}
          className="flex items-center justify-center rounded-none aspect-square"
          style={{
            ...actionBtnStyle,
            opacity: fontSizeOffset <= -4 ? 0.35 : 1,
          }}
        >
          <MinusIcon size={m ? 18 : 14} />
        </button>
        <button
          onClick={onResetAll}
          aria-label="Reset to defaults"
          className="flex items-center justify-center rounded-none aspect-square"
          style={actionBtnStyle}
        >
          <ResetIcon size={m ? 18 : 14} />
        </button>
        <button
          onClick={onIncreaseFontSize}
          aria-label="Increase font size"
          disabled={fontSizeOffset >= 4}
          className="flex items-center justify-center rounded-none aspect-square"
          style={{
            ...actionBtnStyle,
            opacity: fontSizeOffset >= 4 ? 0.35 : 1,
          }}
        >
          <PlusIcon size={m ? 18 : 14} />
        </button>
      </div>

      {/* Dynamic Bio section (desktop only) */}
      {!m && bioMode && onBioModeToggle && (
        <div style={{ marginTop: "8px" }}>
          {/* Toggle header */}
          <button
            onClick={onBioModeToggle}
            aria-label={`Switch to ${bioMode === "classic" ? "dynamic" : "classic"} bio mode`}
            className="flex items-center justify-between w-full rounded-none px-3 py-2"
            style={actionBtnStyle}
          >
            <span className="text-[11px] uppercase tracking-wide">
              Dynamic Bio
            </span>
            <div
              className="relative rounded-full transition-colors duration-200"
              style={{
                width: "32px",
                height: "18px",
                backgroundColor: bioMode === "dynamic" ? "var(--color-accent)" : "var(--color-border)",
              }}
            >
              <div
                className="absolute top-[2px] rounded-full transition-transform duration-200"
                style={{
                  width: "14px",
                  height: "14px",
                  backgroundColor: "var(--color-bg)",
                  transform: bioMode === "dynamic" ? "translateX(16px)" : "translateX(2px)",
                }}
              />
            </div>
          </button>

          {/* Grid (shown when dynamic mode is enabled) */}
          <AnimatePresence>
            {bioMode === "dynamic" && gridPosition && onGridPositionChange && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                style={{ overflow: "hidden" }}
              >
                <div className="pt-3 flex justify-center">
                  <DynamicBioGrid
                    position={gridPosition}
                    onPositionChange={onGridPositionChange}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </>
  );

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-[60]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onClose}
            style={{
              backgroundColor: m ? "rgba(0,0,0,0.3)" : "transparent",
            }}
          />

          {m ? (
            /* Mobile: bottom sheet */
            <motion.div
              ref={panelRef}
              className="fixed bottom-0 left-0 right-0 z-[61] rounded-t-[14px]"
              style={{
                backgroundColor: "var(--color-surface-raised)",
                border: "1px solid var(--color-border)",
                padding: "20px",
              }}
              {...mobileMotion}
            >
              {paletteContent}
            </motion.div>
          ) : (
            /* Desktop: positioned wrapper + animated panel */
            <div
              className="fixed z-[61]"
              style={{
                top: anchorPos?.top ?? "50%",
                left: anchorPos?.left ?? "108px",
                transform: "translateY(-100%)",
              }}
            >
              <motion.div
                ref={panelRef}
                className="backdrop-blur-xl"
                style={{
                  background: "color-mix(in srgb, var(--color-surface-raised) 40%, transparent)",
                  border: "1px solid var(--color-border)",
                  width: "200px",
                  padding: "14px",
                  transformOrigin: "bottom left",
                }}
                {...desktopMotion}
              >
                {paletteContent}
              </motion.div>
            </div>
          )}
        </>
      )}
    </AnimatePresence>
  );
}

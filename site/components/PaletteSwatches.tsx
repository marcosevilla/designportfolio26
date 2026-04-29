"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useThemeState, coloredThemes } from "./ThemeToggle";
import { MoonIcon, SunIcon } from "./Icons";

const REVEAL_EASE = [0.22, 1, 0.36, 1] as const;

// Hue in degrees [0, 360) for chromatic colors, -1 for achromatic — used to
// sort the swatch row in rainbow order regardless of the source array shape.
function hexHue(hex: string): number {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16) / 255;
  const g = parseInt(h.slice(2, 4), 16) / 255;
  const b = parseInt(h.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  if (max === min) return -1;
  const d = max - min;
  let hue: number;
  if (max === r) hue = (g - b) / d + (g < b ? 6 : 0);
  else if (max === g) hue = (b - r) / d + 2;
  else hue = (r - g) / d + 4;
  return hue * 60;
}

export default function PaletteSwatches({ open }: { open: boolean }) {
  const themeState = useThemeState();

  if (!themeState.mounted) return null;

  // The light/dark mode toggle now lives in the icon row, so the palette
  // dropdown is hue-only. Active state reflects the current family; clicking
  // the active swatch clears it back to neutral.
  const isActiveColor = (id: string) => themeState.themeFamily === id;
  const handleColorClick = (id: string) => themeState.selectColored(id);

  // Swatches use a stable signature color (dark-mode accent — most vibrant)
  // so the dot identity and the sort order don't shift when the user toggles
  // between light and dark mode.
  const swatches = coloredThemes
    .map((t) => ({
      id: t.name,
      accent: t.dark.accent,
      label: `${t.name} theme`,
    }))
    .sort((a, b) => hexHue(a.accent) - hexHue(b.accent));

  return (
    <div style={{ filter: "var(--bio-dropdown-shadow)" }}>
    <AnimatePresence initial={false}>
      {open && (
        <motion.div
          key="palette-swatches"
          initial={{ height: 0, opacity: 0, y: -8, filter: "blur(8px)" }}
          animate={{
            height: "auto",
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            transition: {
              height: { duration: 0.3, ease: REVEAL_EASE },
              opacity: { duration: 0.3, ease: REVEAL_EASE, delay: 0.05 },
              y: { duration: 0.3, ease: REVEAL_EASE },
              filter: { duration: 0.35, ease: REVEAL_EASE, delay: 0.05 },
            },
          }}
          exit={{
            height: 0,
            opacity: 0,
            y: -8,
            filter: "blur(8px)",
            transition: {
              height: { duration: 0.25, ease: REVEAL_EASE, delay: 0.08 },
              opacity: { duration: 0.18, ease: REVEAL_EASE },
              y: { duration: 0.25, ease: REVEAL_EASE },
              filter: { duration: 0.2, ease: REVEAL_EASE },
            },
          }}
          style={{ overflow: "hidden", willChange: "transform, opacity, filter" }}
        >
          <div className="mt-2 mb-4 flex justify-end">
            <div
              className="bio-dropdown-container inline-flex flex-wrap items-center gap-2"
              style={{ padding: "10px 12px" }}
            >
            {/* Light/dark mode toggle — flush left of the color swatches with
                a vertical hairline divider for visual separation. */}
            <button
              type="button"
              onClick={() =>
                themeState.mode === "light" ? themeState.selectDark() : themeState.selectLight()
              }
              aria-label={themeState.mode === "light" ? "Switch to dark mode" : "Switch to light mode"}
              className="flex items-center justify-center rounded-full transition-colors cursor-pointer"
              style={{
                width: 20,
                height: 20,
                color: "var(--color-fg-secondary)",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = "var(--color-accent)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = "var(--color-fg-secondary)"; }}
            >
              {themeState.mode === "light" ? <MoonIcon size={14} /> : <SunIcon size={14} />}
            </button>
            <span
              aria-hidden
              style={{
                display: "inline-block",
                width: 1,
                height: 16,
                backgroundColor: "var(--color-border)",
              }}
            />
            {swatches.map((s) => {
              const active = isActiveColor(s.id);
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => handleColorClick(s.id)}
                  aria-label={s.label}
                  aria-pressed={active}
                  className="rounded-full inline-block cursor-pointer"
                  style={{
                    width: "16px",
                    height: "16px",
                    backgroundColor: s.accent,
                    boxShadow: active
                      ? "0 0 0 2px var(--color-bg), 0 0 0 3.5px var(--color-accent)"
                      : "0 0 0 1px var(--color-border)",
                    transition: "box-shadow 200ms ease, transform 150ms ease",
                  }}
                />
              );
            })}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
    </div>
  );
}

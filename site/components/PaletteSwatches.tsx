"use client";

import { useThemeState, coloredThemes } from "./ThemeToggle";
import { MoonIcon, SunIcon } from "./Icons";

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

/**
 * Inline-row palette controls: light/dark toggle + 12 colored-theme swatches.
 * Renders content only (no wrapper, no animation) — meant to be slotted into
 * the HeroToolbar's left swap zone where the parent owns the slide animation.
 */
export function PaletteRow() {
  const themeState = useThemeState();

  if (!themeState.mounted) return null;

  const isActiveColor = (id: string) => themeState.themeFamily === id;
  const handleColorClick = (id: string) => themeState.selectColored(id);

  // Stable signature color (dark-mode accent) so swatch identity & sort order
  // don't shift when toggling between light/dark.
  const swatches = coloredThemes
    .map((t) => ({
      id: t.name,
      accent: t.dark.accent,
      label: `${t.name} theme`,
    }))
    .sort((a, b) => hexHue(a.accent) - hexHue(b.accent));

  return (
    <div className="flex items-center gap-2 whitespace-nowrap">
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
            className="rounded-full inline-block cursor-pointer shrink-0"
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
  );
}

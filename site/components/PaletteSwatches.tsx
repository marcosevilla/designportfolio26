"use client";

import { useThemeState, coloredThemes } from "./ThemeToggle";

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
 * Inline-row palette controls: 12 colored-theme swatches. The light/dark
 * toggle lives as its own top-level button on the toolbar's right cluster.
 * Renders content only (no wrapper, no animation) — meant to be slotted into
 * the HeroToolbar's left swap zone where the parent owns the slide animation.
 */
export function PaletteRow({
  swatchSize = 16,
  wrap = false,
}: { swatchSize?: number; wrap?: boolean } = {}) {
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
    // 4px horizontal inset gives the active swatch's outer ring (3.5px
    // box-shadow) room to render — without it the swap zone's
    // overflow:hidden clips the leftmost selection state. `wrap` lets the
    // mobile popover lay out in 2 rows so 12 large swatches fit in a
    // phone-width container without horizontal scroll.
    <div className={`flex items-center gap-2 ${wrap ? "flex-wrap" : "whitespace-nowrap"} px-1`}>
      {swatches.map((s) => {
        const active = isActiveColor(s.id);
        // Mono is a special swatch — render as a black/white split so the
        // "neutral / both modes" identity is legible against any background.
        const isMono = s.id === "mono";
        return (
          <button
            key={s.id}
            type="button"
            onClick={() => handleColorClick(s.id)}
            aria-label={s.label}
            aria-pressed={active}
            className="rounded-full inline-block cursor-pointer shrink-0"
            style={{
              width: `${swatchSize}px`,
              height: `${swatchSize}px`,
              backgroundColor: isMono ? undefined : s.accent,
              backgroundImage: isMono
                ? "linear-gradient(135deg, #1a1a1a 0%, #1a1a1a 50%, #ededed 50%, #ededed 100%)"
                : undefined,
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

"use client";

/**
 * DeviceShell — the "specimen" wrapper for card media. The card canvas
 * is always live CSS (theme tokens); media renders INSIDE one of these
 * shells so a video or screenshot never paints its own full-bleed
 * background over the themed canvas.
 *
 * One shadow + border language across variants (same 3-stop ambient
 * lift as the check-in/compendium layered composites) so every card in
 * the grid reads as the same family of floating artifacts.
 */

const SHELL_SHADOW =
  "0 1px 2px rgba(0, 0, 0, 0.05), 0 12px 28px rgba(0, 0, 0, 0.08), 0 32px 56px rgba(0, 0, 0, 0.06)";

export default function DeviceShell({
  variant,
  style,
  children,
}: {
  variant: "phone" | "browser";
  /** Size the shell from the outside (height for phone, width for
   *  browser) — the inner screen fills whatever this resolves to. */
  style?: React.CSSProperties;
  children: React.ReactNode;
}) {
  if (variant === "phone") {
    return (
      <div
        style={{
          aspectRatio: "9 / 19",
          // Corner radius scales with the rendered size so the shell
          // reads as the same phone at any scale (a fixed 28px was ~21%
          // of width at card size — cartoonishly round). Real iPhone
          // body radius ≈ 15% of device width; percentage corners are
          // elliptical, so the vertical radius is scaled by the 9/19
          // aspect (15 × 9/19 ≈ 7.1) to keep them circular.
          borderRadius: "15% / 7.1%",
          padding: 6,
          backgroundColor: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          boxShadow: SHELL_SHADOW,
          ...style,
        }}
      >
        <div
          className="relative h-full w-full overflow-hidden"
          // Screen corners run concentric inside the 6px bezel: ~11.5%
          // of the screen's width (vertical scaled by its aspect).
          style={{
            borderRadius: "11.5% / 5.2%",
            backgroundColor: "var(--color-muted)",
          }}
        >
          {children}
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex flex-col overflow-hidden"
      style={{
        borderRadius: 8,
        backgroundColor: "var(--color-surface)",
        border: "1px solid var(--color-border)",
        boxShadow: SHELL_SHADOW,
        ...style,
      }}
    >
      {/* Chrome bar (traffic lights) removed 2026-07-15 — the shell is
          just a clean bordered window now. */}
      <div
        className="relative flex-1 overflow-hidden"
        style={{ backgroundColor: "var(--color-muted)" }}
      >
        {children}
      </div>
    </div>
  );
}

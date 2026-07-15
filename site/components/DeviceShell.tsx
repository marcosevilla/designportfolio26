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
          borderRadius: 28,
          padding: 6,
          backgroundColor: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          boxShadow: SHELL_SHADOW,
          ...style,
        }}
      >
        <div
          className="relative h-full w-full overflow-hidden"
          style={{ borderRadius: 22, backgroundColor: "var(--color-muted)" }}
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
      {/* Browser chrome — traffic lights only, no URL, so the shell
          stays quiet next to the artifact. */}
      <div
        className="flex items-center gap-1.5 px-3"
        style={{
          height: 24,
          backgroundColor: "var(--color-surface-raised)",
          borderBottom: "1px solid var(--color-border)",
          flexShrink: 0,
        }}
      >
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            aria-hidden
            style={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              backgroundColor: "var(--color-border)",
            }}
          />
        ))}
      </div>
      <div
        className="relative flex-1 overflow-hidden"
        style={{ backgroundColor: "var(--color-muted)" }}
      >
        {children}
      </div>
    </div>
  );
}

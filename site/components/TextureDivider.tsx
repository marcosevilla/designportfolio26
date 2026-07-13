/**
 * Textured checkerboard divider — the thin grey grid strip used between
 * the page title/subhead and the bio, below the contact row, and as a
 * recurring section-break motif across the site. Same monochrome
 * checker as the old NavOverlay rail / project-grid header bar
 * (6px tile, 3px offset, fg at 10%).
 */
const CHECKER = "color-mix(in srgb, var(--color-fg) 10%, transparent)";

export default function TextureDivider({ height = 8 }: { height?: number }) {
  return (
    <div
      aria-hidden
      className="w-full shrink-0"
      style={{
        height,
        backgroundColor: "var(--color-bg)",
        backgroundImage: `linear-gradient(45deg, ${CHECKER} 25%, transparent 25%, transparent 75%, ${CHECKER} 75%), linear-gradient(45deg, ${CHECKER} 25%, transparent 25%, transparent 75%, ${CHECKER} 75%)`,
        backgroundSize: "6px 6px",
        backgroundPosition: "0 0, 3px 3px",
      }}
    />
  );
}

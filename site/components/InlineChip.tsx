"use client";

/**
 * Inline brand chip embedded in body copy — first use is the bio paragraph
 * on the homepage, where company names get replaced with a logo + label
 * pill so the text reads more dynamically.
 *
 * The chip is themed: body sits on neutral surface tokens so it reads in
 * every palette + light/dark, while the logo well carries the brand
 * accent. The glyph is rendered as a CSS mask so it always paints in
 * `glyphColor` (default white) — that decouples the SVG's native fill
 * from the well bg and guarantees readable contrast.
 */
export type InlineChipProps = {
  /** Visible label, typically the company name. */
  label: string;
  /** Public path to a single-color SVG glyph (e.g. simple-icons style). */
  logoSrc: string;
  /** Background fill of the logo well. Use the brand accent color. */
  accent: string;
  /** Color applied to the glyph via mask. Default white. */
  glyphColor?: string;
};

export default function InlineChip({
  label,
  logoSrc,
  accent,
  glyphColor = "#ffffff",
}: InlineChipProps) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        verticalAlign: "-0.25em",
        paddingLeft: 3,
        paddingRight: 6,
        paddingTop: 2,
        paddingBottom: 2,
        borderRadius: 3,
        backgroundColor: "var(--color-muted)",
        border: "0.5px solid var(--color-border)",
        whiteSpace: "nowrap",
        fontFamily:
          "var(--font-geist-mono), ui-monospace, Menlo, Monaco, monospace",
        fontSize: 12,
        fontWeight: 500,
        lineHeight: 1,
        letterSpacing: "-0.01em",
        color: "var(--color-fg)",
      }}
    >
      <span
        aria-hidden="true"
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: 16,
          height: 16,
          borderRadius: 2,
          backgroundColor: accent,
          flexShrink: 0,
        }}
      >
        <span
          style={{
            display: "block",
            width: 10,
            height: 10,
            backgroundColor: glyphColor,
            WebkitMask: `url(${logoSrc}) center/contain no-repeat`,
            mask: `url(${logoSrc}) center/contain no-repeat`,
          }}
        />
      </span>
      <span>{label}</span>
    </span>
  );
}

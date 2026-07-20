interface SectionHeadingProps {
  id?: string;
  level?: 2 | 3 | 4;
  children: React.ReactNode;
}

// Matches the homepage section labels ("Just for fun" in
// CaseStudyList's SectionLabel): Geist Mono, ALL-CAPS, body size,
// primary ink (2026-07-20 homepage alignment — the italic-serif era
// styles live in git history).
const MONO_LABEL: React.CSSProperties = {
  fontFamily: "var(--font-geist-mono), ui-monospace, Menlo, monospace",
  fontWeight: 400,
  fontSize: "calc(14px + var(--font-size-offset))",
  lineHeight: "22.4px",
  textTransform: "uppercase",
  letterSpacing: "-0.02em",
};

/**
 * Standardized case study heading with optional scroll anchor.
 *
 * h2: main section heading (homepage mono label) + anchor div for TOC
 * h3: subsection heading (16px sans 500, mt-16 mb-6)
 * h4: sub-subsection heading (14px sans 500, mb-3)
 */
export default function SectionHeading({ id, level = 2, children }: SectionHeadingProps) {
  if (level === 2) {
    return (
      <>
        {id && <div id={id} className="scroll-mt-24" />}
        <h2 className="mt-12 mb-3 text-(--color-fg)" style={MONO_LABEL}>
          {children}
        </h2>
      </>
    );
  }

  if (level === 3) {
    return (
      <h3
        className="text-(--color-fg) mt-16 mb-6"
        style={{
          fontFamily: "var(--font-sans)",
          fontWeight: 500,
          fontSize: "calc(16px + var(--font-size-offset))",
          lineHeight: 1.4,
          letterSpacing: "-0.01em",
        }}
      >
        {children}
      </h3>
    );
  }

  return (
    <h4
      className="text-(--color-fg) mb-3"
      style={{
        fontFamily: "var(--font-sans)",
        fontWeight: 500,
        fontSize: "calc(14px + var(--font-size-offset))",
        lineHeight: 1.4,
        letterSpacing: "-0.01em",
      }}
    >
      {children}
    </h4>
  );
}

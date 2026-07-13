interface SectionHeadingProps {
  id?: string;
  level?: 2 | 3 | 4;
  children: React.ReactNode;
}

const BASKERVILLE = "var(--font-baskerville), Georgia, serif";

/**
 * Standardized case study heading with optional scroll anchor.
 * Libre Baskerville per the 2026-07 redesign — bold serif section
 * headers, italic serif subheaders; body copy stays Geist.
 *
 * h2: main section heading + anchor div for TOC linking
 * h3: subsection heading (mt-16 mb-6)
 * h4: sub-subsection heading (mb-3)
 */
export default function SectionHeading({ id, level = 2, children }: SectionHeadingProps) {
  if (level === 2) {
    return (
      <>
        {id && <div id={id} className="scroll-mt-24" />}
        <h2
          className="mt-12 mb-3 text-(--color-fg)"
          style={{
            fontFamily: BASKERVILLE,
            fontWeight: 700,
            fontSize: 24,
            lineHeight: 1.3,
            letterSpacing: "0.01em",
          }}
        >
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
          fontFamily: BASKERVILLE,
          fontStyle: "italic",
          fontWeight: 400,
          fontSize: 19,
          lineHeight: 1.4,
          letterSpacing: "0.01em",
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
        fontFamily: BASKERVILLE,
        fontStyle: "italic",
        fontWeight: 400,
        fontSize: 16,
        lineHeight: 1.4,
        letterSpacing: "0.01em",
      }}
    >
      {children}
    </h4>
  );
}

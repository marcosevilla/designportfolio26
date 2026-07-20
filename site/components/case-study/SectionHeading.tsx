interface SectionHeadingProps {
  id?: string;
  level?: 2 | 3 | 4;
  children: React.ReactNode;
}

const BASKERVILLE = "var(--font-geist-sans), system-ui, sans-serif";

/**
 * Standardized case study heading with optional scroll anchor.
 * All levels wear the homepage section-label style ("Select work"
 * in ProjectGrid): Libre Baskerville italic, weight 400 — h3/h4
 * step the size down. Body copy stays Geist.
 *
 * h2: main section heading + anchor div for TOC linking (20px)
 * h3: subsection heading (19px, mt-16 mb-6)
 * h4: sub-subsection heading (16px, mb-3)
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
            fontStyle: "italic",
            fontWeight: 400,
            fontSize: 20,
            lineHeight: 1.4,
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
      }}
    >
      {children}
    </h4>
  );
}

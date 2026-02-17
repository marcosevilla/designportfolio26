import { typescale } from "@/lib/typography";

interface SectionHeadingProps {
  id?: string;
  level?: 2 | 3 | 4;
  children: React.ReactNode;
}

/**
 * Standardized case study heading with optional scroll anchor.
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
        <h2 className="text-[var(--color-fg)] mb-3 tracking-tight" style={typescale.h2}>
          {children}
        </h2>
      </>
    );
  }

  if (level === 3) {
    return (
      <h3 className="font-medium text-[var(--color-fg)] mt-16 mb-6 tracking-tight" style={typescale.h3}>
        {children}
      </h3>
    );
  }

  return (
    <h4 className="font-medium text-[var(--color-fg)] mb-3 tracking-tight" style={typescale.h4}>
      {children}
    </h4>
  );
}

import { typescale } from "@/lib/typography";

interface SectionHeadingProps {
  id?: string;
  level?: 2 | 3 | 4;
  children: React.ReactNode;
}

/**
 * Standardized case study heading with optional scroll anchor.
 *
 * h2: main section heading (30px sans 500, OpenAI blog scale
 *     2026-08-05 — the mono ALL-CAPS label era lives in git history)
 *     + anchor div for TOC
 * h3: subsection heading (20px sans 500, mt-16 mb-6)
 * h4: sub-subsection heading (18px sans 500, mb-3)
 *
 * All metrics come from typescale (lib/typography.ts) — don't inline
 * copies here, that's how the 2026-08-03 h3/h4 drift happened.
 */
export default function SectionHeading({ id, level = 2, children }: SectionHeadingProps) {
  if (level === 2) {
    return (
      <>
        {id && <div id={id} className="scroll-mt-24" />}
        <h2 className="mt-12 mb-3 text-(--color-fg)" style={typescale.h2}>
          {children}
        </h2>
      </>
    );
  }

  if (level === 3) {
    return (
      <h3 className="text-(--color-fg) mt-16 mb-6" style={typescale.h3}>
        {children}
      </h3>
    );
  }

  return (
    <h4 className="text-(--color-fg) mb-3" style={typescale.h4}>
      {children}
    </h4>
  );
}

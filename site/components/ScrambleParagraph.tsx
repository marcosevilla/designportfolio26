"use client";

import { Fragment } from "react";
import type { Paragraph } from "@/lib/bio-content";
import ScrambleText from "./ScrambleText";

interface ScrambleParagraphProps {
  para: Paragraph;
  skip?: boolean;
  staggerMs?: number;
  cycles?: number;
  cycleMs?: number;
  repeatDelayMs?: number;
  onComplete?: () => void;
}

export default function ScrambleParagraph({
  para,
  skip = false,
  staggerMs = 70,
  cycles = 3,
  cycleMs = 30,
  repeatDelayMs = 40,
  onComplete,
}: ScrambleParagraphProps) {
  let cumulativeChars = 0;
  const lastIdx = para.length - 1;

  return (
    <>
      {para.map((seg, i) => {
        const needsSpace = i > 0 && !/^[,.\-;:!?)]/.test(seg.text);

        let spaceNode: React.ReactNode = null;
        if (needsSpace) {
          const spaceDelay = cumulativeChars * staggerMs;
          cumulativeChars += 1;
          spaceNode = (
            <ScrambleText
              text=" "
              skip={skip}
              delayMs={spaceDelay}
              staggerMs={staggerMs}
              cycles={cycles}
              cycleMs={cycleMs}
              repeatDelayMs={repeatDelayMs}
            />
          );
        }

        const textDelay = cumulativeChars * staggerMs;
        cumulativeChars += seg.text.length;
        const isLast = i === lastIdx;

        const textNode = (
          <ScrambleText
            text={seg.text}
            skip={skip}
            delayMs={textDelay}
            staggerMs={staggerMs}
            cycles={cycles}
            cycleMs={cycleMs}
            repeatDelayMs={repeatDelayMs}
            onComplete={isLast ? onComplete : undefined}
          />
        );

        return (
          <Fragment key={i}>
            {spaceNode}
            {seg.href ? (
              <a
                href={seg.href}
                target="_blank"
                rel="noopener noreferrer"
                className="dotted-link dotted-link--inline"
              >
                {textNode}
              </a>
            ) : (
              textNode
            )}
          </Fragment>
        );
      })}
    </>
  );
}

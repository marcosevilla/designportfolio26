"use client";

import type { Paragraph } from "@/lib/bio-content";
import { PhotoStack } from "@/components/PhotoStack";

export function RenderParagraph({ para }: { para: Paragraph }) {
  return (
    <>
      {para.map((seg, segIdx) => {
        const needsSpace = segIdx > 0 && !/^[,.\-;:!?)]/.test(seg.text);
        if (seg.href === "photo-stack") {
          return (
            <span key={segIdx}>
              {needsSpace ? " " : ""}
              <PhotoStack>{seg.text}</PhotoStack>
            </span>
          );
        }
        if (seg.href) {
          return (
            <span key={segIdx}>
              {needsSpace ? " " : ""}
              <a href={seg.href} target="_blank" rel="noopener noreferrer" className="dotted-link dotted-link--inline">
                {seg.text}
              </a>
            </span>
          );
        }
        return <span key={segIdx}>{needsSpace ? " " : ""}{seg.text}</span>;
      })}
    </>
  );
}

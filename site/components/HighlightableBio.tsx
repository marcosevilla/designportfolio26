"use client";

import { useRef } from "react";
import type { Paragraph } from "@/lib/bio-content";
import { RenderParagraph } from "./StreamingText";
import { PhotoStack } from "./PhotoStack";
import { useHighlighter, type HighlightRange } from "./HighlighterContext";

/**
 * Compute the character offset of a (node, offset) point relative to `root`.
 * Uses a temporary Range so we don't have to walk the DOM ourselves — robust
 * for both text-node and element-node selection endpoints.
 */
function offsetWithin(root: Node, node: Node, offset: number): number {
  const range = document.createRange();
  range.setStart(root, 0);
  range.setEnd(node, offset);
  const length = range.toString().length;
  range.detach?.();
  return length;
}

export function HighlightableBio({ paragraphs }: { paragraphs: Paragraph[] }) {
  // The toolbar (highlighter on/off, eraser, palette, etc.) lives in
  // HeroToolbar above the LED matrix. We share state via HighlighterContext.
  const { active, highlight, setHighlight } = useHighlighter();
  const paraRefs = useRef<Array<HTMLParagraphElement | null>>([]);

  const handleMouseUp = () => {
    if (!active) return;
    const sel = typeof window !== "undefined" ? window.getSelection() : null;
    if (!sel || sel.isCollapsed || sel.rangeCount === 0) return;
    const range = sel.getRangeAt(0);
    const text = sel.toString();
    if (!text.trim()) return;

    const paraIdx = paraRefs.current.findIndex(
      (p) =>
        p &&
        p.contains(range.startContainer) &&
        p.contains(range.endContainer),
    );
    if (paraIdx === -1) return;
    const para = paraRefs.current[paraIdx];
    if (!para) return;

    const start = offsetWithin(para, range.startContainer, range.startOffset);
    const end = offsetWithin(para, range.endContainer, range.endOffset);
    if (end <= start) return;

    setHighlight({ paraIdx, start, end, text });
    sel.removeAllRanges();
  };

  return (
    <div className={active ? "bio-highlight-mode" : undefined}>
      <div className="bio-text" onMouseUp={handleMouseUp}>
        {paragraphs.map((para, i) => (
          <p
            key={i}
            ref={(el) => {
              paraRefs.current[i] = el;
            }}
            className={i === 0 ? "" : "mt-6"}
          >
            {highlight && highlight.paraIdx === i ? (
              <RenderParagraphWithHighlight para={para} highlight={highlight} />
            ) : (
              <RenderParagraph para={para} />
            )}
          </p>
        ))}
      </div>
    </div>
  );
}

/**
 * Re-renders a paragraph with a highlight range applied. Walks segments and
 * tracks character offsets so we can split any segment that intersects the
 * highlight range and wrap the intersecting portion in a <mark>. Preserves
 * link / photo-stack styling for highlights that fall inside those segments.
 */
function RenderParagraphWithHighlight({
  para,
  highlight,
}: {
  para: Paragraph;
  highlight: HighlightRange;
}) {
  let cursor = 0;
  return (
    <>
      {para.map((seg, segIdx) => {
        const needsSpace = segIdx > 0 && !/^[,.\-;:!?)]/.test(seg.text);
        const spaceLen = needsSpace ? 1 : 0;
        const segStart = cursor + spaceLen;
        const segEnd = segStart + seg.text.length;
        cursor = segEnd;

        const iStart = Math.max(highlight.start, segStart);
        const iEnd = Math.min(highlight.end, segEnd);
        const has = iEnd > iStart;
        const before = has ? seg.text.slice(0, iStart - segStart) : seg.text;
        const middle = has ? seg.text.slice(iStart - segStart, iEnd - segStart) : "";
        const after = has ? seg.text.slice(iEnd - segStart) : "";

        const inner = (
          <>
            {before}
            {middle && <mark className="bio-highlight">{middle}</mark>}
            {after}
          </>
        );

        if (seg.href === "photo-stack") {
          return (
            <span key={segIdx}>
              {needsSpace ? " " : ""}
              <PhotoStack>{inner}</PhotoStack>
            </span>
          );
        }
        if (seg.href) {
          return (
            <span key={segIdx}>
              {needsSpace ? " " : ""}
              <a
                href={seg.href}
                target="_blank"
                rel="noopener noreferrer"
                className="dotted-link dotted-link--inline"
              >
                {inner}
              </a>
            </span>
          );
        }
        return (
          <span key={segIdx}>
            {needsSpace ? " " : ""}
            {inner}
          </span>
        );
      })}
    </>
  );
}

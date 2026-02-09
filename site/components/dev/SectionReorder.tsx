"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useInlineEditor } from "@/lib/InlineEditorContext";
import { EDITOR_SERVER_URL } from "@/lib/editor-types";

interface SectionItem {
  id: string;
  title: string;
}

/** Extract FadeIn section blocks from source by line range */
interface Block {
  id: string;
  start: number;
  end: number;
}

function extractSectionBlocks(source: string): Block[] {
  const lines = source.split("\n");
  const blocks: Block[] = [];

  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes("<FadeIn") && lines[i].includes('as="section"')) {
      const start = i;
      let depth = 0;
      let end = i;

      for (let j = i; j < lines.length; j++) {
        const opens = (lines[j].match(/<FadeIn/g) || []).length;
        const closes = (lines[j].match(/<\/FadeIn>/g) || []).length;
        depth += opens - closes;
        if (depth === 0) {
          end = j;
          break;
        }
      }

      // Find section id from first few lines
      let blockId = "";
      for (let j = start; j <= Math.min(start + 5, end); j++) {
        const m = lines[j].match(/id="([^"]+)"/);
        if (m) {
          blockId = m[1];
          break;
        }
      }

      blocks.push({ id: blockId, start, end });
      i = end;
    }
  }

  return blocks;
}

/** Swap two FadeIn section blocks in source (including preceding comment lines) */
function swapSectionBlocks(source: string, idA: string, idB: string): string {
  const lines = source.split("\n");
  const blocks = extractSectionBlocks(source);

  const blockA = blocks.find((b) => b.id === idA);
  const blockB = blocks.find((b) => b.id === idB);
  if (!blockA || !blockB) return source;

  // Include preceding comment line if present
  const aStart =
    blockA.start > 0 && lines[blockA.start - 1].trim().startsWith("{/*")
      ? blockA.start - 1
      : blockA.start;
  const bStart =
    blockB.start > 0 && lines[blockB.start - 1].trim().startsWith("{/*")
      ? blockB.start - 1
      : blockB.start;

  // Determine which is first/second in the file
  const [first, second] =
    aStart < bStart
      ? [
          { start: aStart, end: blockA.end },
          { start: bStart, end: blockB.end },
        ]
      : [
          { start: bStart, end: blockB.end },
          { start: aStart, end: blockA.end },
        ];

  const firstLines = lines.slice(first.start, first.end + 1);
  const middleLines = lines.slice(first.end + 1, second.start);
  const secondLines = lines.slice(second.start, second.end + 1);

  const result = [
    ...lines.slice(0, first.start),
    ...secondLines,
    ...middleLines,
    ...firstLines,
    ...lines.slice(second.end + 1),
  ];

  return result.join("\n");
}

/** Swap two entries in the TOC_ITEMS array */
function swapTocItems(source: string, idA: string, idB: string): string {
  const tocRegex = /const TOC_ITEMS = \[([\s\S]*?)\];/;
  const match = source.match(tocRegex);
  if (!match) return source;

  const tocContent = match[1];
  const entries = [
    ...tocContent.matchAll(
      /\{\s*id:\s*"([^"]+)",\s*label:\s*"([^"]+)"\s*\}/g
    ),
  ];

  const indexA = entries.findIndex((e) => e[1] === idA);
  const indexB = entries.findIndex((e) => e[1] === idB);
  if (indexA === -1 || indexB === -1) return source;

  const aEntry = entries[indexA][0];
  const bEntry = entries[indexB][0];

  let newTocContent = tocContent;
  newTocContent = newTocContent.replace(aEntry, "___SWAP_PLACEHOLDER___");
  newTocContent = newTocContent.replace(bEntry, aEntry);
  newTocContent = newTocContent.replace("___SWAP_PLACEHOLDER___", bEntry);

  return source.replace(tocRegex, `const TOC_ITEMS = [${newTocContent}];`);
}

export default function SectionReorder() {
  const { editMode, filePath } = useInlineEditor();
  const [sections, setSections] = useState<SectionItem[]>([]);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // Read sections from DOM when edit mode activates
  useEffect(() => {
    if (!editMode) {
      setSections([]);
      setOpen(false);
      return;
    }

    // Small delay to let DOM render
    const timer = setTimeout(() => {
      const items: SectionItem[] = [];
      const anchors = document.querySelectorAll(
        "article div.scroll-mt-24[id]"
      );
      anchors.forEach((anchor) => {
        const id = anchor.getAttribute("id");
        if (!id) return;
        const h2 = anchor.nextElementSibling;
        if (h2?.tagName === "H2") {
          items.push({ id, title: h2.textContent || id });
        }
      });
      setSections(items);
    }, 100);

    return () => clearTimeout(timer);
  }, [editMode]);

  const moveSection = useCallback(
    async (index: number, direction: -1 | 1) => {
      const newIndex = index + direction;
      if (newIndex < 0 || newIndex >= sections.length || !filePath || saving)
        return;

      setSaving(true);
      try {
        const res = await fetch(
          `${EDITOR_SERVER_URL}/read?file=${encodeURIComponent(filePath)}`
        );
        if (!res.ok) throw new Error("Failed to read");
        let source = await res.text();

        const idA = sections[index].id;
        const idB = sections[newIndex].id;

        source = swapSectionBlocks(source, idA, idB);
        source = swapTocItems(source, idA, idB);

        const writeRes = await fetch(`${EDITOR_SERVER_URL}/write`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ file: filePath, content: source }),
        });
        if (!writeRes.ok) throw new Error("Failed to write");

        // Update local state
        const newSections = [...sections];
        [newSections[index], newSections[newIndex]] = [
          newSections[newIndex],
          newSections[index],
        ];
        setSections(newSections);
      } catch (err) {
        console.error("Section reorder failed:", err);
      } finally {
        setSaving(false);
      }
    },
    [sections, filePath, saving]
  );

  if (!editMode || sections.length === 0) return null;

  return (
    <div className="fixed bottom-[72px] right-6 z-[200]">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 500, damping: 32 }}
            className="mb-2 w-64 backdrop-blur-xl border border-[var(--color-border)] overflow-hidden"
            style={{ background: "var(--color-surface-raised)" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-[var(--color-border)]">
              <span
                className="text-[11px] font-mono uppercase tracking-wider"
                style={{ color: "var(--color-fg-tertiary)" }}
              >
                Sections
              </span>
              <button
                onClick={() => setOpen(false)}
                className="w-5 h-5 flex items-center justify-center hover:text-[var(--color-accent)]"
                style={{ color: "var(--color-fg-tertiary)" }}
              >
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Section list */}
            <div className="py-1">
              {sections.map((section, i) => (
                <div
                  key={section.id}
                  className="flex items-center gap-1 px-3 py-1.5 group"
                >
                  <span
                    className="flex-1 text-[12px] truncate"
                    style={{ color: "var(--color-fg-secondary)" }}
                  >
                    {section.title}
                  </span>
                  <div className="flex items-center gap-0.5 shrink-0">
                    <button
                      onClick={() => moveSection(i, -1)}
                      disabled={i === 0 || saving}
                      className="w-5 h-5 flex items-center justify-center transition-colors hover:text-[var(--color-accent)] disabled:opacity-20"
                      style={{ color: "var(--color-fg-tertiary)" }}
                      title="Move up"
                    >
                      <svg
                        width="10"
                        height="10"
                        viewBox="0 0 16 16"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M4 10l4-4 4 4" />
                      </svg>
                    </button>
                    <button
                      onClick={() => moveSection(i, 1)}
                      disabled={i === sections.length - 1 || saving}
                      className="w-5 h-5 flex items-center justify-center transition-colors hover:text-[var(--color-accent)] disabled:opacity-20"
                      style={{ color: "var(--color-fg-tertiary)" }}
                      title="Move down"
                    >
                      <svg
                        width="10"
                        height="10"
                        viewBox="0 0 16 16"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M4 6l4 4 4-4" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {saving && (
              <div className="px-3 py-1.5 text-[10px] font-mono text-[var(--color-accent)] border-t border-[var(--color-border)]">
                Saving...
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle button */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 text-[11px] font-mono backdrop-blur-xl border border-[var(--color-border)] transition-colors hover:border-[var(--color-accent)]"
        style={{
          background: "var(--color-surface-raised)",
          color: open ? "var(--color-accent)" : "var(--color-fg-secondary)",
        }}
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path d="M2 4h12M2 8h12M2 12h12" />
        </svg>
        Sections
      </button>
    </div>
  );
}

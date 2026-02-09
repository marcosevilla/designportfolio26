"use client";

import { useInlineEditor } from "@/lib/InlineEditorContext";

export default function ImagePlaceholder({
  description,
  aspectRatio = "16/9",
}: {
  description: string;
  aspectRatio?: string;
}) {
  const { editMode } = useInlineEditor();

  return (
    <div
      className="relative w-full rounded-[10px] bg-[var(--color-surface-raised)] border border-[var(--color-border)] flex items-center justify-center px-6"
      style={{ aspectRatio }}
      data-image-placeholder
    >
      <p className="text-[13px] text-[var(--color-fg-tertiary)] text-center leading-relaxed">
        {description}
      </p>
      {editMode && (
        <div className="absolute top-2 right-2 flex items-center gap-1.5 px-2 py-1 bg-red-500/90 backdrop-blur-sm text-white text-[10px] font-mono font-medium tracking-wide uppercase">
          <svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="8" cy="8" r="7" />
            <line x1="8" y1="5" x2="8" y2="8.5" />
            <circle cx="8" cy="11" r="0.5" fill="currentColor" />
          </svg>
          No image
        </div>
      )}
    </div>
  );
}

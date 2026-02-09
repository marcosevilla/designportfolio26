"use client";

export default function ImagePlaceholder({
  description,
  aspectRatio = "16/9",
}: {
  description: string;
  aspectRatio?: string;
}) {
  return (
    <div
      className="w-full rounded-[10px] bg-[var(--color-surface-raised)] border border-[var(--color-border)] flex items-center justify-center px-6"
      style={{ aspectRatio }}
    >
      <p className="text-[13px] text-[var(--color-fg-tertiary)] text-center leading-relaxed">
        {description}
      </p>
    </div>
  );
}

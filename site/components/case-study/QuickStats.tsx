"use client";

interface Stat {
  value: string;
  label: string;
}

export default function QuickStats({ items }: { items: Stat[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 my-12">
      {items.map((item, i) => (
        <div
          key={i}
          className="flex items-baseline gap-3 rounded-none bg-[var(--color-surface-raised)]/40 backdrop-blur-xl border border-[var(--color-border)]"
          style={{ padding: "20px" }}
        >
          <span
            data-editable-stat-value={i}
            className="text-[var(--color-accent)] tracking-tight shrink-0"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "20px",
              fontWeight: 700,
              lineHeight: 1.1,
            }}
          >
            {item.value}
          </span>
          <span data-editable-stat-label={i} className="text-[14px] text-[var(--color-fg-secondary)] leading-snug">
            {item.label}
          </span>
        </div>
      ))}
    </div>
  );
}

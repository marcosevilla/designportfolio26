/**
 * Narrow metadata rail for case-study intros — the right-hand slot of
 * the `intro-rail` preset. Small mono labels over plain values,
 * Ziffer-style (Year / Role / Scope).
 */
export type MetaRailItem = {
  label: string;
  values: string[];
};

export default function MetaRail({ items }: { items: MetaRailItem[] }) {
  return (
    <dl className="flex flex-col gap-6 md:flex-row md:gap-12 lg:flex-col lg:gap-6">
      {items.map((item) => (
        <div key={item.label}>
          <dt
            className="text-(--color-fg-tertiary) mb-1.5"
            style={{
              fontFamily: "var(--font-geist-mono), ui-monospace, Menlo, monospace",
              fontSize: 11,
              fontWeight: 500,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              lineHeight: "16px",
            }}
          >
            {item.label}
          </dt>
          {item.values.map((v) => (
            <dd key={v} className="text-(--color-fg-secondary) leading-[22px]">
              {v}
            </dd>
          ))}
        </div>
      ))}
    </dl>
  );
}

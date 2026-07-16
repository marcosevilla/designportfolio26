"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

/**
 * Narrow metadata rail for case-study intros — the right-hand slot of
 * the `intro-rail` preset. Small mono labels over plain values,
 * Ziffer-style (Year / Role / Scope).
 */
export type MetaRailItem = {
  label: string;
  values: string[];
  /** Optional hover note — renders a small info icon after the first
   *  value (e.g. team credits behind a "Sole designer" role). */
  info?: string;
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
          {item.values.map((v, i) => (
            <dd key={v} className="text-(--color-fg-secondary) leading-[22px]">
              {v}
              {i === 0 && item.info && (
                <TooltipProvider delay={100}>
                  <Tooltip>
                    <TooltipTrigger
                      aria-label={`More about ${item.label.toLowerCase()}`}
                      // ::before extends the 14px glyph to a ~42px hit
                      // area (tap-friendly for the mobile tooltip) — the
                      // neighboring rail text isn't interactive, so the
                      // overlap is safe.
                      className="ml-1.5 inline-flex translate-y-[2px] cursor-default text-(--color-fg-tertiary) transition-colors hover:text-(--color-fg-secondary) relative before:absolute before:-inset-3.5 before:content-['']"
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <circle cx="12" cy="12" r="10" />
                        <path d="M12 16v-4" />
                        <path d="M12 8h.01" />
                      </svg>
                    </TooltipTrigger>
                    <TooltipContent side="top">{item.info}</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </dd>
          ))}
        </div>
      ))}
    </dl>
  );
}

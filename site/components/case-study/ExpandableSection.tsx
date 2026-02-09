"use client";

import { useState } from "react";
import { typescale } from "@/lib/typography";

export default function ExpandableSection({
  title,
  id,
  children,
}: {
  title: string;
  id: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <section id={id} className="scroll-mt-24">
      {/* Desktop: always visible, no toggle */}
      <div className="hidden md:block">
        <h2
          className="text-[var(--color-fg)] mb-8 tracking-tight"
          style={typescale.h2}
        >
          {title}
        </h2>
        {children}
      </div>

      {/* Mobile: collapsible */}
      <div className="md:hidden">
        <button
          onClick={() => setOpen((o) => !o)}
          className="w-full flex items-center justify-between mb-4 text-left"
          aria-expanded={open}
          aria-controls={`${id}-content`}
        >
          <h2
            className="text-[var(--color-fg)] tracking-tight"
            style={typescale.h2}
          >
            {title}
          </h2>
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-[var(--color-fg-tertiary)] transition-transform duration-300 shrink-0 ml-4"
            style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
        <div
          id={`${id}-content`}
          className="grid transition-[grid-template-rows] duration-300 ease-out"
          style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
        >
          <div className="overflow-hidden">
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}

"use client";

import { useState } from "react";
import { typescale } from "@/lib/typography";

// Matches SectionHeading's h2 (30px sans heading since the 2026-08-05
// OpenAI-scale pass — the mono ALL-CAPS label era is in git history).
const H2_STYLE: React.CSSProperties = {
  ...typescale.h2,
  color: "var(--color-fg)",
};

export default function ExpandableSection({
  title,
  id,
  children,
}: {
  title: string;
  id: string;
  children: React.ReactNode;
}) {
  // Defaults OPEN (2026-08-05, was false). Every case-study section — including
  // "Impact & Results", the one carrying the metrics — started collapsed on
  // phones, so a recruiter opening the site on mobile had to go hunting for the
  // outcomes rather than landing on them. The disclosure still works; only the
  // initial state changed, so anyone who wants to skim can still collapse.
  // Desktop is unaffected (that branch has no toggle at all).
  const [open, setOpen] = useState(true);

  return (
    <section id={id} className="scroll-mt-24">
      {/* Desktop: always visible, no toggle */}
      <div className="hidden md:block">
        <h2 className="mt-12 mb-3" style={H2_STYLE}>
          {title}
        </h2>
        {children}
      </div>

      {/* Mobile: collapsible */}
      <div className="md:hidden">
        <button
          onClick={() => setOpen((o) => !o)}
          className="w-full flex items-center justify-between mb-4 text-left py-3 -my-1"
          aria-expanded={open}
          aria-controls={`${id}-content`}
        >
          <h2 style={H2_STYLE}>{title}</h2>
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-(--color-fg-tertiary) transition-transform duration-300 shrink-0 ml-4"
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

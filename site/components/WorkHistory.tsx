"use client";

import { useState } from "react";
import { RESUME_EXPERIENCE } from "@/lib/resume-content";

/**
 * Compact work-history accordion for the homepage, sitting to the right of
 * the bio. Same single-open interaction as the case-study ProjectDetails
 * list (one row open at a time, +/− marker, dotted leader between the
 * company and its years), restyled into a bordered card per the Paper
 * reference. Rows are derived from RESUME_EXPERIENCE so this stays in sync
 * with the resume/chat single source of truth. Themed with CSS vars so it
 * reads in dark mode + every palette.
 */

type Row = { company: string; years: string; description: string };

// "Sept 2023 – Present" → "2023 – Now"; "Mar 2022 – Apr 2023" → "2022 – 2023".
function shortYears(period: string): string {
  const years = period.match(/\d{4}/g) ?? [];
  const start = years[0] ?? "";
  const end = /present/i.test(period) ? "Now" : years[1] ?? "";
  return end && end !== start ? `${start} – ${end}` : start;
}

const ROWS: Row[] = RESUME_EXPERIENCE.map((job) => ({
  // Trim the legal suffix so the compact row reads cleanly.
  company: job.company.replace(/ Technologies$/, ""),
  years: shortYears(job.period),
  description: `${job.title} — ${job.bullets[0]
    .replace(/<!--.*?-->/g, "")
    .trim()}`,
}));

const MONO = "var(--font-geist-mono), ui-monospace, Menlo, monospace";
const SANS = "var(--font-geist-sans), system-ui, sans-serif";

export default function WorkHistory() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  return (
    <div
      style={{
        backgroundColor: "var(--color-bg)",
        border: "0.5px solid var(--color-border)",
      }}
    >
      {ROWS.map((row, i) => {
        const isOpen = openIdx === i;
        return (
          <div
            key={i}
            style={{
              borderBottom:
                i < ROWS.length - 1
                  ? "0.5px solid var(--color-border)"
                  : undefined,
            }}
          >
            <button
              type="button"
              onClick={() => setOpenIdx(isOpen ? null : i)}
              aria-expanded={isOpen}
              className="w-full flex items-baseline gap-2 text-left cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-(--color-accent)"
              style={{ padding: "4px 8px" }}
            >
              <span
                className="shrink-0 uppercase whitespace-nowrap"
                style={{
                  fontFamily: MONO,
                  fontWeight: 500,
                  fontSize: 11,
                  lineHeight: "26px",
                  color: "var(--color-fg)",
                }}
              >
                <span className="inline-block w-[9px]">
                  {isOpen ? "−" : "+"}
                </span>{" "}
                {row.company}
              </span>
              <span
                aria-hidden
                className="flex-1 overflow-hidden whitespace-nowrap"
                style={{
                  fontFamily: SANS,
                  fontSize: 11,
                  lineHeight: 1,
                  color: "var(--color-fg-tertiary)",
                  transform: "translateY(-1px)",
                }}
              >
                {"·".repeat(200)}
              </span>
              <span
                className="shrink-0 whitespace-nowrap"
                style={{
                  fontFamily: MONO,
                  fontSize: 11,
                  lineHeight: "26px",
                  color: "var(--color-fg)",
                }}
              >
                {row.years}
              </span>
            </button>
            <div
              className="overflow-hidden transition-all duration-300 ease-in-out"
              style={{
                maxHeight: isOpen ? 400 : 0,
                opacity: isOpen ? 1 : 0,
              }}
            >
              <p
                style={{
                  fontFamily: SANS,
                  fontSize: 10,
                  lineHeight: 1.8,
                  color: "var(--color-fg-secondary)",
                  padding: "0 8px 8px",
                }}
              >
                {row.description}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

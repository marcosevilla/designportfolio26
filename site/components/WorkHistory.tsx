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
// Match the homepage bio body copy (14px + the user's font-size offset).
const SIZE = "calc(14px + var(--font-size-offset))";

export default function WorkHistory() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  return (
    <div>
      {ROWS.map((row, i) => {
        const isOpen = openIdx === i;
        return (
          <div key={i}>
            <button
              type="button"
              onClick={() => setOpenIdx(isOpen ? null : i)}
              aria-expanded={isOpen}
              className="w-full flex items-baseline gap-2 text-left cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-(--color-accent)"
              style={{ padding: "4px 0" }}
            >
              {/* Left to right: +/− marker, date range (mono), company
                  name (sans). No dotted leader. The date column has a fixed
                  ch width so company names line up across rows. */}
              <span
                aria-hidden
                className="shrink-0 text-center"
                style={{
                  fontFamily: MONO,
                  fontSize: SIZE,
                  lineHeight: "22px",
                  color: "var(--color-fg)",
                  minWidth: "1.5ch",
                }}
              >
                {isOpen ? "−" : "+"}
              </span>
              <span
                className="shrink-0 whitespace-nowrap"
                style={{
                  fontFamily: MONO,
                  fontSize: SIZE,
                  lineHeight: "22px",
                  color: "var(--color-fg)",
                  minWidth: "12ch",
                }}
              >
                {row.years}
              </span>
              <span
                className="whitespace-nowrap"
                style={{
                  fontFamily: SANS,
                  fontWeight: 500,
                  fontSize: SIZE,
                  lineHeight: "22px",
                  color: "var(--color-fg)",
                }}
              >
                {row.company}
              </span>
            </button>
            <div
              className="overflow-hidden transition-all duration-300 ease-in-out"
              style={{
                maxHeight: isOpen ? 600 : 0,
                opacity: isOpen ? 1 : 0,
              }}
            >
              <p
                style={{
                  fontFamily: SANS,
                  fontSize: SIZE,
                  lineHeight: "22px",
                  color: "var(--color-fg-secondary)",
                  padding: "0 0 8px",
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

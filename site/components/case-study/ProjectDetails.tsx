"use client";

import { useState } from "react";
import { typescale } from "@/lib/typography";

interface DetailGroup {
  heading: string;
  items: string[];
}

interface DetailRow {
  label: string;
  value: string;
  content: string;
  groups?: DetailGroup[];
}

export default function ProjectDetails({ rows }: { rows: DetailRow[] }) {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  const indent = "calc(7px + 0.5rem)";

  return (
    <div>
      {rows.map((row, i) => {
        const isOpen = openIdx === i;
        return (
          <div key={i}>
            <button
              onClick={() => setOpenIdx(isOpen ? null : i)}
              className="w-full flex items-baseline gap-2 py-1.5 text-left cursor-pointer"
              style={{
                ...typescale.label,
                color: "var(--color-accent)",
              }}
            >
              <span className="shrink-0 w-[7px] text-center">{isOpen ? "−" : "+"}</span>
              <span className="uppercase shrink-0">{row.label}</span>
              <span
                className="flex-1 overflow-hidden whitespace-nowrap leading-none translate-y-[-1px]"
                style={{ color: "var(--color-fg-tertiary)" }}
              >
                {"·".repeat(200)}
              </span>
              <span className="shrink-0">{row.value}</span>
            </button>
            <div
              className="overflow-hidden transition-all duration-300 ease-in-out"
              style={{
                maxHeight: isOpen ? "600px" : "0",
                opacity: isOpen ? 1 : 0,
              }}
            >
              {row.groups ? (
                <div className="pb-3" style={{ ...typescale.label, marginLeft: indent, lineHeight: 2 }}>
                  {row.groups.map((group, g) => (
                    <p key={g} className={`text-[var(--color-fg-secondary)]${g > 0 ? " mt-1" : ""}`}>
                      <span className="text-[var(--color-fg)]" style={{ fontWeight: 700 }}>{group.heading}:</span>
                      {" "}{group.items.join(", ")}
                    </p>
                  ))}
                </div>
              ) : row.content.includes(" · ") ? (
                <ul
                  className="pb-3 text-[var(--color-fg-secondary)] list-none"
                  style={{ ...typescale.label, marginLeft: indent, lineHeight: 2 }}
                >
                  {row.content.split(" · ").map((item, j) => {
                    const parts = item.split(" — ");
                    return (
                      <li key={j}>
                        {parts.length > 1 ? (
                          <>{parts[0]} — {parts.slice(1).join(" — ")}</>
                        ) : item}
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p
                  className="pb-3 text-[var(--color-fg-secondary)]"
                  style={{ ...typescale.label, marginLeft: indent, lineHeight: 1.8 }}
                >
                  {row.content}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

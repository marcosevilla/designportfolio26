"use client";

import Link from "next/link";
import { useState } from "react";
import { typescale } from "@/lib/typography";

export default function NextProject({
  title,
  subtitle,
  href,
}: {
  title: string;
  subtitle: string;
  href: string;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <div className="pt-24 pb-12 mt-8">
      <Link
        href={href}
        className="inline-block group"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <span className="text-[13px] uppercase tracking-[0.1em] text-[var(--color-fg-tertiary)] mb-3 block">
          Next project
        </span>
        <span
          className="tracking-tight text-[var(--color-accent)] transition-colors duration-200 group-hover:text-[var(--color-fg)] block"
          style={typescale.nextProjectTitle}
        >
          {title} &rarr;
        </span>
        <div
          className="grid transition-[grid-template-rows] duration-300 ease-out"
          style={{ gridTemplateRows: hovered ? "1fr" : "0fr" }}
        >
          <div className="overflow-hidden">
            <span className="block mt-2 text-[var(--color-fg-secondary)]" style={typescale.subtitle}>
              {subtitle}
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
}

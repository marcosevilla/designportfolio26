"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import type { CaseStudyMeta } from "@/lib/types";
import { typescale } from "@/lib/typography";
import { SPRING_SNAP } from "@/lib/springs";

interface CaseStudyListRowProps {
  study: CaseStudyMeta;
  showYear: boolean;
}

export default function CaseStudyListRow({ study, showYear }: CaseStudyListRowProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <Link
      href={`/work/${study.slug}`}
      className="group block"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        className="flex items-baseline gap-4 py-3"
        style={{ borderBottom: "1px solid var(--color-border)" }}
      >
        {/* Year column — shows only for first item in group */}
        <span
          className="shrink-0 w-[48px]"
          style={{ ...typescale.label, color: "var(--color-fg-tertiary)" }}
        >
          {showYear ? study.year : ""}
        </span>

        {/* Title — spring nudge on hover */}
        <motion.span
          className="shrink-0"
          style={{
            fontFamily: "var(--font-heading)",
            fontWeight: 500,
            fontSize: "calc(16px + var(--font-size-offset) + var(--font-pairing-boost))",
            color: hovered ? "var(--color-accent)" : "var(--color-fg)",
          }}
          animate={{ x: hovered ? 8 : 0 }}
          transition={SPRING_SNAP}
        >
          {study.title}
        </motion.span>

        {/* Spacer */}
        <span className="flex-1" />

        {/* Company · Role */}
        {study.company && (
          <span
            className="hidden sm:inline shrink-0"
            style={{ ...typescale.label, color: "var(--color-fg-tertiary)" }}
          >
            {study.company}{study.role ? ` · ${study.role}` : ""}
          </span>
        )}

        {/* Metric */}
        {study.metric && (
          <span
            className="hidden md:inline shrink-0 text-right"
            style={{ ...typescale.label, color: "var(--color-fg-secondary)", minWidth: "100px" }}
          >
            {study.metric}
          </span>
        )}
      </div>
    </Link>
  );
}

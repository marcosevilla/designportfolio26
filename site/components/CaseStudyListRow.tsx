"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import type { CaseStudyMeta } from "@/lib/types";
import { SPRING_SNAP } from "@/lib/springs";

interface CaseStudyListRowProps {
  study: CaseStudyMeta;
}

export default function CaseStudyListRow({ study }: CaseStudyListRowProps) {
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
        {/* Title — spring nudge on hover */}
        <motion.span
          className="shrink-0"
          style={{
            fontWeight: 500,
            fontSize: "calc(14px + var(--font-size-offset))",
            color: hovered ? "var(--color-accent)" : "var(--color-fg)",
          }}
          animate={{ x: hovered ? 8 : 0 }}
          transition={SPRING_SNAP}
        >
          {study.title}
        </motion.span>
      </div>
    </Link>
  );
}

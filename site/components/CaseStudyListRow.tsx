"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import type { CaseStudyMeta } from "@/lib/types";
import { SPRING_SNAP } from "@/lib/springs";
import { usePasswordGate } from "@/lib/PasswordGateContext";
import { LockIcon } from "./Icons";

interface CaseStudyListRowProps {
  study: CaseStudyMeta;
}

export default function CaseStudyListRow({ study }: CaseStudyListRowProps) {
  const [hovered, setHovered] = useState(false);
  const { unlocked, hydrated, requestUnlock } = usePasswordGate();

  // Avoid SSR/hydration flicker — assume locked until hydrated.
  const isLocked = !hydrated || !unlocked;

  const titleNode = (
    <motion.span
      style={{
        fontFamily: "var(--font-geist-mono), ui-monospace, Menlo, monospace",
        fontWeight: 500,
        fontSize: "calc(14px + var(--font-size-offset))",
        color: hovered ? "var(--color-accent)" : "var(--color-fg)",
      }}
      animate={{ x: hovered ? 8 : 0 }}
      transition={SPRING_SNAP}
    >
      {study.title}
    </motion.span>
  );

  const trailing = isLocked ? (
    <span
      className="inline-flex items-center gap-1.5"
      style={{
        fontFamily: "var(--font-geist-mono), ui-monospace, Menlo, monospace",
        fontSize: "11px",
        fontWeight: 500,
        textTransform: "uppercase",
        letterSpacing: "0.06em",
        color: hovered ? "var(--color-accent)" : "var(--color-fg-tertiary)",
      }}
    >
      <LockIcon size={11} />
      Coming soon
    </span>
  ) : null;

  const rowInner = (
    <div
      className="flex items-baseline justify-between gap-4 py-3"
      style={{ borderBottom: "1px dashed var(--color-border)" }}
    >
      {titleNode}
      {trailing}
    </div>
  );

  if (isLocked) {
    return (
      <button
        type="button"
        onClick={requestUnlock}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onFocus={() => setHovered(true)}
        onBlur={() => setHovered(false)}
        className="group block w-full text-left"
        aria-label={`${study.title} — locked, enter password to view`}
      >
        {rowInner}
      </button>
    );
  }

  return (
    <Link
      href={`/work/${study.slug}`}
      className="group block"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {rowInner}
    </Link>
  );
}

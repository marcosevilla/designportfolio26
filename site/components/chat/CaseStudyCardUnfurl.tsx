"use client";

// Card unfurl rendered below an assistant message when the model emits a
// trailing <artifact slug="..." /> marker. One per message max.
// Click → in-page navigation to /work/<slug>.

import Link from "next/link";
import { motion } from "framer-motion";
import { STUDY_METADATA, type StudySlug } from "@/lib/chat/study-metadata";

export default function CaseStudyCardUnfurl({ slug }: { slug: StudySlug }) {
  const m = STUDY_METADATA[slug];
  const gradient = `linear-gradient(135deg, ${m.gradient[0]}, ${m.gradient[1]})`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="mt-3"
    >
      <Link
        href={`/work/${slug}`}
        className="group flex items-stretch overflow-hidden rounded-xl active:scale-[0.96] transition-transform duration-150 ease-out"
        style={{
          border: "1px solid color-mix(in srgb, var(--color-border) 60%, transparent)",
          backgroundColor: "var(--color-surface)",
        }}
      >
        <div
          aria-hidden
          className="shrink-0"
          style={{ width: "72px", background: gradient }}
        />
        <div className="flex flex-col justify-center px-4 py-3 min-w-0">
          <p
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "14px",
              fontWeight: 500,
              color: "var(--color-fg)",
              lineHeight: 1.3,
            }}
            className="truncate"
          >
            {m.title}
          </p>
          <p
            style={{
              fontFamily: "var(--font-geist-mono), ui-monospace, Menlo, monospace",
              fontSize: "11px",
              color: "var(--color-fg-tertiary)",
              marginTop: 2,
            }}
            className="truncate"
          >
            {m.year} · {m.company} · {m.metric}
          </p>
        </div>
      </Link>
    </motion.div>
  );
}

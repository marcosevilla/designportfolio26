"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import type { CaseStudy } from "@/lib/types";
import { typescale } from "@/lib/typography";

interface Props {
  study: CaseStudy;
}

export default function CaseStudyPage({ study }: Props) {
  return (
    <article className="px-5 py-20">
      <div className="max-w-content mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <Link
            href="/#work"
            className="text-sm text-[var(--color-fg-secondary)] hover:text-[var(--color-fg)] transition-colors mb-8 inline-block"
          >
            &larr; Back
          </Link>

          <h1 className="tracking-tight mt-4" style={typescale.pageTitle}>
            {study.title}
          </h1>
          <p className="mt-3 text-lg text-[var(--color-fg-secondary)]">
            {study.subtitle}
          </p>

          {study.thumbnail && (
            <div className="mt-10">
              <img
                src={study.thumbnail}
                alt={`${study.title} hero image`}
                className="w-full rounded-[10px] bg-[var(--color-surface-raised)] border border-[var(--color-border)]"
              />
            </div>
          )}

          {study.content && (
            <div className="mt-12 prose prose-neutral dark:prose-invert max-w-none text-[var(--color-fg-secondary)] leading-[28px] space-y-6">
              {study.content.split("\n\n").map((paragraph, i) => {
                if (!paragraph.trim()) return null;
                if (paragraph.startsWith("## ")) {
                  return (
                    <h2 key={i} className="text-[var(--color-fg)] mt-10 mb-4 tracking-tight" style={typescale.h2}>
                      {paragraph.replace("## ", "")}
                    </h2>
                  );
                }
                if (paragraph.startsWith("### ")) {
                  return (
                    <h3 key={i} className="text-[var(--color-fg)] mt-8 mb-3 tracking-tight" style={typescale.h3}>
                      {paragraph.replace("### ", "")}
                    </h3>
                  );
                }
                return <p key={i}>{paragraph}</p>;
              })}
            </div>
          )}
        </motion.div>
      </div>
    </article>
  );
}

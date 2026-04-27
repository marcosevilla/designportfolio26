"use client";

import type { CaseStudyMeta } from "@/lib/types";
import { typescale } from "@/lib/typography";

interface CaseStudyCarouselProps {
  studies: CaseStudyMeta[];
}

export default function CaseStudyCarousel({ studies }: CaseStudyCarouselProps) {
  return (
    <div
      className="relative overflow-hidden"
      style={{
        border: "1px dashed var(--color-border)",
        padding: "48px 16px",
      }}
    >
      <div
        className="flex gap-4 overflow-x-auto pb-4"
        style={{ scrollSnapType: "x mandatory" }}
      >
        {studies.map((study) => (
          <div
            key={study.slug}
            className="shrink-0 flex flex-col justify-end"
            style={{
              width: "280px",
              height: "360px",
              backgroundColor: "var(--color-surface-raised)",
              padding: "20px",
              scrollSnapAlign: "start",
            }}
          >
            <div style={{ ...typescale.label, color: "var(--color-fg-tertiary)" }}>
              {study.year}
            </div>
            <div style={{ ...typescale.h4, color: "var(--color-fg)", marginTop: "4px" }}>
              {study.title}
            </div>
          </div>
        ))}
      </div>
      <div
        className="absolute top-2 left-2"
        style={{ ...typescale.label, color: "var(--color-fg-tertiary)" }}
      >
        carousel placeholder · drag-to-scroll + open-card pending
      </div>
    </div>
  );
}

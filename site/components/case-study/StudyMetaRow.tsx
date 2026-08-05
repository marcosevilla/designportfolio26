"use client";

import { STUDY_TAGS } from "@/lib/study-tags";
import { logoFor } from "@/lib/study-logos";
import { typescale } from "@/lib/typography";

/**
 * Horizontal metadata row for case-study intros — sits between the <h1>
 * and the intro prose. Replaces MetaRail (the vertical Year/Role/Scope
 * rail), which became dead layout once every grid preset collapsed to
 * CONTENT_BAND in the 2026-07-26 band-alignment pass.
 *
 * Tags are read from STUDY_TAGS by slug rather than passed in, so this row
 * and the homepage filter can never disagree about a study's tags.
 *
 * Tags are deliberately static — linking them to a tag-filtered homepage
 * needs URL-driven filter state that CaseStudyList does not have.
 */
export default function StudyMetaRow({
  slug,
  company,
  role,
  year,
}: {
  slug: string;
  company: string;
  role: string;
  year: string;
}) {
  const tags = STUDY_TAGS[slug] ?? [];
  const logo = logoFor(company);

  return (
    <div className="mt-6 flex flex-col items-start gap-3 border-y border-(--color-border) py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      {/* Left — company identity */}
      <div className="flex items-center gap-3">
        {logo ? (
          <img
            src={logo}
            alt=""
            aria-hidden="true"
            width={20}
            height={20}
            className="h-5 w-5 shrink-0 rounded-[4px] border border-(--color-border) object-contain"
          />
        ) : (
          <span
            aria-hidden="true"
            className="flex h-5 w-5 shrink-0 items-center justify-center rounded-[4px] border border-(--color-border) bg-(--color-surface-raised) text-(--color-fg-secondary)"
            style={{ fontSize: 11, fontWeight: 500, lineHeight: 1 }}
          >
            {company.charAt(0).toUpperCase()}
          </span>
        )}
        <span className="text-(--color-fg)" style={{ fontSize: 14, fontWeight: 500 }}>
          {company}
        </span>
        <span className="text-(--color-fg-tertiary)" style={{ fontSize: 14, fontWeight: 400 }}>
          {year} · {role}
        </span>
      </div>

      {/* Right — content tags. Same resting style as the homepage filter
          pills (CaseStudyList.tsx:167-176), minus the interaction. */}
      <div className="flex flex-wrap gap-1.5">
        {tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center px-2.5 py-0.5 text-(--color-fg-secondary)"
            style={{ ...typescale.label, backgroundColor: "var(--color-surface-raised)" }}
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}

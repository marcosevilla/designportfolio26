"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { STUDY_TAGS } from "@/lib/study-tags";

/**
 * Horizontal metadata row for case-study intros — sits between the <h1>
 * and the intro prose. Replaces MetaRail (the vertical Year/Role/Scope
 * rail), which became dead layout once every grid preset collapsed to
 * CONTENT_BAND in the 2026-07-26 band-alignment pass.
 *
 * Left: company name. Right: pill tags — the study's content tags from
 * STUDY_TAGS, then year and role (Marco's 2026-08-05 feedback folded
 * year/role into the tag group and dropped the company mark/monogram).
 *
 * On hover-capable devices the pills rest in a condensed stack: the first
 * pill fully exposed, each later pill tucked underneath with only a
 * PEEK-wide sliver of its left cap showing, plus a "+N" count. Hovering
 * the group expands it to the full wrapped row. Touch devices (and the
 * pre-hydration render) always show the expanded row — the collapse only
 * exists where hover can undo it.
 *
 * Tags are read from STUDY_TAGS by slug rather than passed in, so this row
 * and the homepage filter can never disagree about a study's tags.
 *
 * Tags are deliberately static — linking them to a tag-filtered homepage
 * needs URL-driven filter state that CaseStudyList does not have.
 */

const PEEK = 14; // px of each buried pill visible in the collapsed stack
const GAP = 6; // px between pills when expanded

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
  const pills = [...(STUDY_TAGS[slug] ?? []), year, role];

  const listRef = useRef<HTMLDivElement | null>(null);
  const [collapsedMargins, setCollapsedMargins] = useState<number[] | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [canHover, setCanHover] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const update = () => setCanHover(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useLayoutEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const measure = () => {
      const widths = Array.from(
        list.querySelectorAll<HTMLElement>("[data-pill]")
      ).map((el) => el.offsetWidth);
      if (widths.length === 0) return;
      // Each pill's collapsed margin tucks it under the stack so far, leaving
      // a PEEK sliver past the stack's right edge — clamped so a wide pill
      // deep in the stack can never poke out past the stack's left edge.
      const margins = [0];
      let prevRight = widths[0]; // right edge of the previous pill
      let stackRight = widths[0]; // right edge of the whole stack
      for (let i = 1; i < widths.length; i++) {
        const margin = Math.max(stackRight + PEEK - widths[i] - prevRight, -prevRight);
        margins.push(margin);
        prevRight = prevRight + margin + widths[i];
        stackRight = Math.max(stackRight, prevRight);
      }
      setCollapsedMargins(margins);
    };
    measure();
    let cancelled = false;
    document.fonts?.ready.then(() => {
      if (!cancelled) measure();
    });
    return () => {
      cancelled = true;
    };
  }, [slug, year, role]);

  const collapsed = canHover && !expanded && collapsedMargins !== null;
  const pillTransition = "margin-left 0.3s cubic-bezier(0.2, 0, 0, 1)";

  return (
    <div className="mt-6 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      {/* Left — company identity */}
      <span className="shrink-0 text-(--color-fg)" style={{ fontSize: 14, fontWeight: 500 }}>
        {company}
      </span>

      {/* Right — pill stack: content tags, then year and role */}
      <div
        ref={listRef}
        className="flex flex-wrap items-center"
        style={{ rowGap: GAP }}
        onMouseEnter={() => setExpanded(true)}
        onMouseLeave={() => setExpanded(false)}
      >
        {pills.map((pill, i) => (
          <span
            key={pill}
            data-pill
            className="relative inline-flex items-center whitespace-nowrap rounded-full bg-(--color-surface-raised) px-3 py-1 text-(--color-fg)"
            style={{
              fontSize: 13,
              fontWeight: 500,
              lineHeight: 1.4,
              zIndex: pills.length - i,
              marginLeft: collapsed ? (collapsedMargins?.[i] ?? 0) : i === 0 ? 0 : GAP,
              // Page-colored ring separates overlapping pills in the stack;
              // invisible against the page once expanded.
              boxShadow: "0 0 0 2px var(--color-bg)",
              transition: pillTransition,
            }}
          >
            {pill}
          </span>
        ))}
        {pills.length > 1 && (
          <span
            aria-hidden="true"
            className="inline-flex items-center overflow-hidden whitespace-nowrap text-(--color-fg-secondary)"
            style={{
              fontSize: 13,
              fontWeight: 500,
              lineHeight: 1.4,
              maxWidth: collapsed ? 48 : 0,
              opacity: collapsed ? 1 : 0,
              marginLeft: collapsed ? GAP + 2 : 0,
              transition:
                "max-width 0.3s cubic-bezier(0.2, 0, 0, 1), opacity 0.3s cubic-bezier(0.2, 0, 0, 1), margin-left 0.3s cubic-bezier(0.2, 0, 0, 1)",
            }}
          >
            +{pills.length - 1}
          </span>
        )}
      </div>
    </div>
  );
}

"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { STUDY_TAGS } from "@/lib/study-tags";

/**
 * Horizontal metadata row for case-study intros — sits between the <h1>
 * and the intro prose. Replaces MetaRail (the vertical Year/Role/Scope
 * rail), which became dead layout once every grid preset collapsed to
 * CONTENT_BAND in the 2026-07-26 band-alignment pass.
 *
 * Left: mono-uppercase eyebrow — "CASE STUDY · {company} · {year}" (same
 * label convention as the list-view rows / BACK link). Right: pill tags —
 * the study's content tags from STUDY_TAGS, then the role (Marco's
 * 2026-08-05 feedback: year lives in the eyebrow, not the pills).
 *
 * On hover-capable devices the pills rest condensed: the first pill fully
 * exposed, each later pill clipped to a PEEK-wide sliver of its left cap
 * (max-width + overflow hidden — clipping gives uniform slivers where a
 * negative-margin overlap can't, since pills are wider than the condensed
 * stack), plus a "+N" count. Hovering the group expands to the full
 * wrapped row; expanded max-widths target the measured pill widths so the
 * transition has no dead time. Touch devices (and the pre-hydration
 * render) always show the expanded row — the condense only exists where
 * hover can undo it.
 *
 * Tags are read from STUDY_TAGS by slug rather than passed in, so this row
 * and the homepage filter can never disagree about a study's tags.
 *
 * Tags are deliberately static — linking them to a tag-filtered homepage
 * needs URL-driven filter state that CaseStudyList does not have.
 */

const PEEK = 6; // px sliver of each buried pill visible in the condensed stack
const GAP = 6; // px between pills when expanded
const STACK_GAP = 2; // px between slivers when condensed

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
  const pills = [...(STUDY_TAGS[slug] ?? []), role];

  const listRef = useRef<HTMLDivElement | null>(null);
  const [widths, setWidths] = useState<number[] | null>(null);
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
      // Ghost copies, never clipped — the real pills can't be measured
      // once collapsed (their offsetWidth is the sliver, not the pill).
      const measured = Array.from(
        list.querySelectorAll<HTMLElement>("[data-pill-ghost]")
      ).map((el) => el.offsetWidth);
      if (measured.length > 0) setWidths(measured);
    };
    measure();
    let cancelled = false;
    document.fonts?.ready.then(() => {
      if (!cancelled) measure();
    });
    return () => {
      cancelled = true;
    };
  }, [slug, role]);

  const collapsed = canHover && !expanded && widths !== null;
  const pillTransition =
    "max-width 0.3s cubic-bezier(0.2, 0, 0, 1), margin-left 0.3s cubic-bezier(0.2, 0, 0, 1), padding-left 0.3s cubic-bezier(0.2, 0, 0, 1), padding-right 0.3s cubic-bezier(0.2, 0, 0, 1), color 0.3s cubic-bezier(0.2, 0, 0, 1)";

  return (
    <div className="mt-6 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      {/* Left — mono-uppercase eyebrow, same label style as list rows */}
      <span
        className="shrink-0 whitespace-nowrap text-(--color-fg-secondary)"
        style={{
          fontFamily: "var(--font-geist-mono), ui-monospace, Menlo, monospace",
          fontSize: 12,
          fontWeight: 500,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          lineHeight: 1.4,
        }}
      >
        Case study <span className="text-(--color-fg-tertiary)">·</span> {company}{" "}
        <span className="text-(--color-fg-tertiary)">·</span> {year}
      </span>

      {/* Right — pill stack: content tags, then role */}
      <div
        ref={listRef}
        className="relative flex flex-wrap items-center"
        style={{ rowGap: GAP }}
        onMouseEnter={() => setExpanded(true)}
        onMouseLeave={() => setExpanded(false)}
      >
        {/* Invisible measurement copies of the pills (see measure()) */}
        <div aria-hidden="true" className="pointer-events-none invisible absolute left-0 top-0 flex items-center whitespace-nowrap">
          {pills.map((pill) => (
            <span
              key={pill}
              data-pill-ghost
              className="inline-flex items-center whitespace-nowrap px-2 py-0.5"
              style={{ fontSize: 12, fontWeight: 500, lineHeight: 1.4 }}
            >
              {pill}
            </span>
          ))}
        </div>
        {pills.map((pill, i) => (
          <span
            key={pill}
            data-pill
            className="inline-flex items-center overflow-hidden whitespace-nowrap rounded-full bg-(--color-surface-raised) py-0.5 text-(--color-fg)"
            style={{
              fontSize: 12,
              fontWeight: 500,
              lineHeight: 1.4,
              // Buried pills clip to a PEEK-wide sliver of their left cap;
              // padding condenses with them, since border-box width can't
              // go below the padding sum. Expanded pills cap at their own
              // measured width so the transition has no dead time.
              maxWidth: collapsed && i > 0 ? PEEK : (widths?.[i] ?? undefined),
              paddingLeft: collapsed && i > 0 ? PEEK / 2 : 8,
              paddingRight: collapsed && i > 0 ? PEEK / 2 : 8,
              // A buried pill's first letter would otherwise peek through
              // the sliver's padding as a stray glyph fragment.
              color: collapsed && i > 0 ? "transparent" : "var(--color-fg)",
              marginLeft: i === 0 ? 0 : collapsed ? STACK_GAP : GAP,
              // Page-colored hairline keeps slivers separated mid-transition.
              boxShadow: "0 0 0 1px var(--color-bg)",
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
              fontSize: 12,
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

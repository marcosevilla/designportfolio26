"use client";

import { useState, useEffect, useRef, useCallback, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import AutoplayVideo from "@/components/AutoplayVideo";
import type { CaseStudyMeta } from "@/lib/types";
import {
  PLAYGROUND_CARDS,
  isWide,
  type PlaygroundCard,
} from "@/lib/playground-cards";
import { ALL_TAGS, getMatchingSlugs } from "@/lib/study-tags";
import { typescale } from "@/lib/typography";
import { SPRING_HEAVY } from "@/lib/springs";
import { FilterIcon, CloseIcon, GalleryIcon, LockIcon, ArrowRightIcon } from "./Icons";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import Grid, { Col } from "@/components/layout/Grid";
import { CONTENT_BAND, CONTENT_BAND_MD } from "@/lib/layout-presets";
import { galleryContent } from "@/lib/gallery-content";
import { setCursorLabel } from "@/lib/cursor-label";
import LockGate, { LockedFrameBadge } from "./LockGate";
import DeviceShell from "./DeviceShell";
import CursorGlowOverlay from "./CursorGlowOverlay";
import FnbDitherFrame from "./FnbDitherFrame";
import DitherBackdrop from "./DitherBackdrop";
import { isLocked } from "@/lib/locked-content";

/** Mono uppercase placeholder label for media-less frames ("Under
 *  construction" on study cards, "Coming soon" on playground cells).
 *  Was inlined verbatim at both sites. Values unchanged.
 *  ⚠️ tracking is the LEGACY 0.08em; typescale.monoLabel is -0.02em.
 *  Migrating is TYPOGRAPHY-BACKLOG ⑧ — a deliberate visible change. */
const PLACEHOLDER_LABEL: CSSProperties = {
  fontFamily: "var(--font-geist-mono), ui-monospace, Menlo, monospace",
  fontSize: "11px",
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  color: "var(--color-fg-tertiary)",
};

// ── View toggle button ──

// Same pill chrome as the buttons in HeroToolbar (.bio-toolbar-btn) so this
// row reads as the same family as the palette / music / marquee icons up top.
function ViewToggleButton({
  active,
  onClick,
  label,
  children,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={active}
      className={`bio-toolbar-btn${active ? " bio-toolbar-btn--active" : ""}`}
    >
      {children}
    </button>
  );
}

// ── Component ──

interface CaseStudyListProps {
  studies: CaseStudyMeta[];
}

export default function CaseStudyList({ studies: allStudies }: CaseStudyListProps) {
  // Drop hidden slugs (HIDDEN_SLUGS above) before any downstream logic
  // sees the list, so tag filters / counts / locked-state / gallery
  // navigation all naturally exclude them with no further changes.
  const studies = allStudies.filter((s) => !HIDDEN_SLUGS.has(s.slug));

  // ── Filter state ──
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [filterOpen, setFilterOpen] = useState(false);
  const filterAreaRef = useRef<HTMLDivElement>(null);

  // Locked-card media preview (lightbox) — slug of the study being
  // previewed, or null when closed.
  const [previewSlug, setPreviewSlug] = useState<string | null>(null);

  // Compute filtered studies
  const matchingSlugs = getMatchingSlugs(activeFilters);
  const filteredStudies = activeFilters.length === 0
    ? studies
    : studies.filter((s) => matchingSlugs.has(s.slug));

  // Compute disabled tags (would yield 0 results if added)
  const disabledTags = new Set(
    ALL_TAGS.filter((tag) => {
      if (activeFilters.includes(tag)) return false;
      const candidate = [...activeFilters, tag];
      const matches = getMatchingSlugs(candidate);
      return !studies.some((s) => matches.has(s.slug));
    })
  );

  const toggleFilter = useCallback((tag: string) => {
    setActiveFilters((prev) => {
      if (prev.includes(tag)) {
        return prev.filter((t) => t !== tag);
      }
      const candidate = [...prev, tag];
      const matches = getMatchingSlugs(candidate);
      const hasResults = studies.some((s) => matches.has(s.slug));
      if (!hasResults) return prev;
      return candidate;
    });
  }, [studies]);

  const clearFilters = useCallback(() => {
    setActiveFilters([]);
  }, []);

  // Close dropdown on Escape
  useEffect(() => {
    if (!filterOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setFilterOpen(false);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [filterOpen]);

  // Close dropdown on click outside
  useEffect(() => {
    if (!filterOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (filterAreaRef.current && !filterAreaRef.current.contains(e.target as Node)) {
        setFilterOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [filterOpen]);

  return (
    <section className="relative z-10">
      {/* The "Select projects" heading now lives inside the grid's
          checkered header bar (see ProjectGrid below) rather than as a
          standalone header above the grid. */}
      {/* Filter dropdown — kept for the (currently disabled) filter toggle
          above; the "Work" heading was removed so the projects section
          anchors directly to the first card. */}
      <div ref={filterAreaRef}>
        <AnimatePresence>
          {filterOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="overflow-hidden"
              id="filter-dropdown"
              role="group"
              aria-label="Filter by tag"
            >
              <div className="flex flex-wrap gap-1.5 pt-3 pb-1">
                {ALL_TAGS.map((tag) => {
                  const isActive = activeFilters.includes(tag);
                  const isDisabled = disabledTags.has(tag);
                  return (
                    <button
                      key={tag}
                      onClick={() => toggleFilter(tag)}
                      role="checkbox"
                      aria-checked={isActive}
                      aria-disabled={isDisabled}
                      className={`inline-flex items-center px-2.5 py-0.5 transition-colors duration-150 ${
                        isDisabled ? "opacity-30 cursor-not-allowed pointer-events-none" : "cursor-pointer"
                      }`}
                      style={{
                        ...typescale.label,
                        color: isActive ? "var(--color-bg)" : "var(--color-fg-secondary)",
                        backgroundColor: isActive ? "var(--color-accent)" : "var(--color-surface-raised)",
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive && !isDisabled) {
                          e.currentTarget.style.backgroundColor = "var(--color-accent)";
                          e.currentTarget.style.color = "var(--color-bg)";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive && !isDisabled) {
                          e.currentTarget.style.backgroundColor = "var(--color-surface-raised)";
                          e.currentTarget.style.color = "var(--color-fg-secondary)";
                        }
                      }}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>

      {/* Active filters bar */}
      <AnimatePresence>
        {activeFilters.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="flex flex-wrap items-center gap-1.5 mb-4">
              {activeFilters.map((tag) => (
                <motion.span
                  key={tag}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={SPRING_HEAVY}
                  className="inline-flex items-center gap-1 pl-2.5 pr-1.5 py-0.5"
                  style={{
                    ...typescale.label,
                    color: "var(--color-bg)",
                    backgroundColor: "var(--color-accent)",
                  }}
                >
                  {tag}
                  <button
                    onClick={() => toggleFilter(tag)}
                    className="flex items-center justify-center w-4 h-4"
                    aria-label={`Remove ${tag} filter`}
                    style={{ color: "var(--color-bg)" }}
                  >
                    <CloseIcon />
                  </button>
                </motion.span>
              ))}
              {activeFilters.length >= 2 && (
                <button
                  onClick={clearFilters}
                  className="transition-colors duration-150 ml-1"
                  style={{
                    ...typescale.label,
                    color: "var(--color-fg-tertiary)",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = "var(--color-accent)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = "var(--color-fg-tertiary)"; }}
                >
                  Clear all
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Screen reader live region */}
      {activeFilters.length > 0 && (
        <span role="status" className="sr-only">
          {filteredStudies.length} project{filteredStudies.length !== 1 ? "s" : ""} shown
        </span>
      )}

      {/* Project grid — case studies + playground items in one column.
          Locked studies wear the LockGate hover treatment and open a
          full-resolution media preview on click; studies with a
          dedicated route link out, the rest are static media cells. */}
      <ProjectGrid studies={filteredStudies} onPreview={setPreviewSlug} />

      <MediaPreviewLightbox slug={previewSlug} onClose={() => setPreviewSlug(null)} />
    </section>
  );
}

// ── Section link button ──

// Matches the "Learn more" button on the home bio: 14px sans 500, underlined
// label + animated arrow, accent on hover. Renders an `<a>` when `href` is
// provided, `<button>` otherwise. With `icon="lock"` the trailing arrow is
// replaced with a lock glyph and the resting color shifts to secondary so
// the link reads as locked/coming-soon.
function SectionLinkButton({
  href,
  onClick,
  icon = "arrow",
  children,
}: {
  href?: string;
  onClick?: () => void;
  icon?: "arrow" | "lock";
  children: React.ReactNode;
}) {
  const className =
    "group inline-flex items-center gap-1.5 transition-colors cursor-pointer focus:outline-none hover:text-(--color-accent) focus-visible:text-(--color-accent)";
  const style: React.CSSProperties = {
    fontFamily: "var(--font-geist-mono), ui-monospace, Menlo, monospace",
    fontSize: "12px",
    fontWeight: 500,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    lineHeight: 1.4,
    color: icon === "lock" ? "var(--color-fg-tertiary)" : "var(--color-fg)",
    background: "none",
    border: 0,
    padding: 0,
  };
  const inner = (
    <>
      <span>{children}</span>
      {icon === "lock" ? (
        <span aria-hidden className="inline-flex items-center">
          <LockIcon size={12} />
        </span>
      ) : (
        <span
          aria-hidden
          className="inline-block transition-transform duration-200 ease-out group-hover:translate-x-1"
        >
          →
        </span>
      )}
    </>
  );
  if (href) {
    return (
      <Link href={href} className={className} style={style}>
        {inner}
      </Link>
    );
  }
  return (
    <button type="button" onClick={onClick} className={className} style={style}>
      {inner}
    </button>
  );
}

// ── Project sections (work marquee + playground grid) ──

function ProjectGrid({
  studies,
  onPreview,
}: {
  studies: CaseStudyMeta[];
  onPreview: (slug: string) => void;
}) {
  if (studies.length === 0 && PLAYGROUND_CARDS.length === 0) return null;

  return (
    <div className="flex flex-col gap-16">
      {/* Work cards run as a full-bleed auto-scrolling marquee with no
          section label — the strip leads the section on its own
          (2026-07-20, spec: docs/superpowers/specs/
          2026-07-20-work-marquee-design.md). Cells stay chromeless —
          the media frames carry the only framing. */}
      {studies.length > 0 && (
        <StudyMarquee studies={studies} onPreview={onPreview} />
      )}

      {/* Testimonials moved to the About surface, under the bio
          (2026-08-03) — see components/Testimonials.tsx. */}

      {/* Playground / experiments get their own label so the page reads
          as two sections: client work above, sidequests below. Label +
          cells stack single-column on the centered middle-6 band
          (2026-07-20 centering pass). */}
      {PLAYGROUND_CARDS.length > 0 && (
        <>
          <Grid>
            <Col md={CONTENT_BAND_MD} lg={CONTENT_BAND}>
              <SectionLabel>Just for fun</SectionLabel>
            </Col>
          </Grid>
          <Grid className="gap-y-16">
            {PLAYGROUND_CARDS.map((card) => (
              <Col key={`play-${card.slug}`} md={CONTENT_BAND_MD} lg={CONTENT_BAND}>
                <PlaygroundCell card={card} />
              </Col>
            ))}
          </Grid>
        </>
      )}
    </div>
  );
}

// ── Work marquee ──

// Marquee-only display copy (Paper mockup, "project marquee" page,
// 2026-07-27) — presentation overrides, the MDX frontmatter and case
// study pages keep their own titles. `description` is the focused-state
// reveal: what Marco did, what he produced, and the product's value.
// ⚠️ `year` MUST reconcile with the study's `content/*.mdx` frontmatter, which
// is the source of truth (see .claude/rules/case-studies.md). The ONE sanctioned
// difference is compaction: an MDX range renders here as its END year, because
// the card meta line is a single tight "ORG • YEAR" string.
//   fb-ordering  2025–26        → 2026   ✓ compaction
//   ai-workflow  2025–2026      → 2026   ✓ compaction
//   compendium   2024–2025      → 2025   ✓ compaction
// Anything else is drift. Corrected 2026-08-05: general-task showed 2024 and
// design-system 2025 (both are 2022 — wrong by 2–3 years), and upsells showed
// 2026 (is 2025). A wrong date on a portfolio is a factual error, and the first
// two are now visible since those studies were unlocked in the same change.
const MARQUEE_DISPLAY: Record<
  string,
  { title: string; org: string; year: string; description: string }
> = {
  "fb-ordering": {
    title: "Food & Beverage Ordering Platform",
    org: "Canary Technologies",
    year: "2026",
    description:
      "Designed 0-1 food & beverage platform for hotels end-to-end – mobile ordering experience for guests, content management system, and staff order management.",
  },
  compendium: {
    title: "Guest Experience Hub & CMS",
    org: "Canary Technologies",
    year: "2025",
    description:
      "Designed a hotel CMS platform from scratch – structured content builder for staff, guest-facing mobile hub, and the foundation now driving $1.51M CARR at +230% YoY.",
  },
  upsells: {
    title: "Hotel Upsells",
    org: "Canary Technologies",
    year: "2025",
    description:
      "Redesigned hotel upselling as a configurable form system – flexible offer builder, guest purchase flow, and staff fulfillment workflows driving $6.94M CARR with a measured +10% conversion lift.",
  },
  checkin: {
    title: "Expedited Guest Check-in",
    org: "Canary Technologies",
    year: "2024",
    description:
      "Modernized digital check-in for the world's largest hotel chains – guest identity verification, payment capture, and front-desk tooling across Wyndham's ~6,000-property portfolio.",
  },
  "general-task": {
    title: "Task Management for Knowledge Workers",
    org: "General Task",
    year: "2022",
    description:
      "Founding designer for a 0-1 productivity tool – unified tasks, calendar, and engineering workflows in one hub for knowledge workers.",
  },
  "design-system": {
    title: "Building a Design System & Visual Language",
    org: "General Task",
    year: "2022",
    description:
      "Built General Task's visual language from zero – design tokens, a component library, and interaction patterns powering every product surface.",
  },
  // Added 2026-08-05. This slug was missing from the map entirely, so its card
  // rendered a BLANK meta line where "ORG • YEAR" belongs — the fallback is
  // `study.metric`, and the card read as broken rather than as minimal.
  // Copy is taken from content/knowledge-base.mdx (title/description verbatim,
  // org from `company`), not invented. Year compacts "2024 · shipped 2026" to
  // its ship year per the convention above.
  "knowledge-base": {
    title: "AI Knowledge Base",
    org: "Canary Technologies",
    year: "2026",
    description:
      "Redesigned the IA and UI of the knowledge base powering Canary's AI products — turning a flat list of freeform statements into a structured, categorized system hotels actually fill out.",
  },
  "ai-workflow": {
    title: "Prototypes as the Spec",
    org: "Personal",
    year: "2026",
    description:
      "How working prototypes replaced Figma as the engineering handoff spec – ~50 shipped on one hub, an 8-PR production slice built from a prototype, and a CEO-requested demo delivered in 24 hours.",
  },
};

// Must match the .work-marquee-track gap in globals.css.
const MARQUEE_GAP_PX = 24;

// Ties the prev/next buttons to the strip they scroll, via aria-controls.
const MARQUEE_SCROLLER_ID = "work-marquee-scroller";

// Full-bleed horizontal strip of the work cards. FREE-scroll carousel
// (scroll-snap removed 2026-08-05 — it made trackpad gestures travel
// net-zero; the full reasoning is on .work-marquee in globals.css).
// Each card reveals its title/meta/description on hover WITHIN the frame
// (2026-08-06, replacing the scroll-focused expand-below model); scroll
// position now only drives the prev/next arrows.
function StudyMarquee({
  studies,
  onPreview,
}: {
  studies: CaseStudyMeta[];
  onPreview: (slug: string) => void;
}) {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  // Cell stride (width + gap), cached. Cells are uniform, so this only
  // changes on resize — see the ResizeObserver below. Drives the
  // one-card-per-press arrow step; hover reveal is pure CSS.
  const strideRef = useRef(0);
  // Coalesces scroll events into one read per frame.
  const rafRef = useRef<number | null>(null);
  // Arrow-button enablement. Derived from real scroll position rather than
  // a card index, which matters because of a known geometry quirk: the
  // last card can't fully reach the slot (the track's mirrored right padding
  // is smaller than clientWidth − cellWidth), so an index-based "at end"
  // would disable the button while the strip could still travel.
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);
  const reducedMotion = usePrefersReducedMotion();

  // Measure once per layout change rather than per scroll event. Free
  // scrolling emits long 60–120Hz event trains, and the old
  // querySelector + offsetWidth pair forced a synchronous layout on
  // every one of them — on a page that already runs nine WebGL
  // backdrops. Snap hid the cost by keeping gestures short.
  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const measure = () => {
      const cell = scroller.querySelector<HTMLElement>(".work-marquee-cell");
      if (cell) strideRef.current = cell.offsetWidth + MARQUEE_GAP_PX;
      // A resize changes maxScroll, so the end state can flip without any
      // scroll event firing (e.g. widening the window at the far right).
      syncEdges(scroller);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(scroller);
    return () => ro.disconnect();
  }, []);

  // 1px of slack: scrollLeft is fractional at non-integer zoom and after a
  // smooth scroll, so an exact === comparison leaves the button enabled at
  // a hard edge (or disabled a pixel early).
  const syncEdges = (scroller: HTMLDivElement) => {
    const max = scroller.scrollWidth - scroller.clientWidth;
    setAtStart(scroller.scrollLeft <= 1);
    setAtEnd(scroller.scrollLeft >= max - 1);
  };

  // Keep the arrow buttons' enabled/disabled state in sync with the real
  // scroll position, coalesced to one read per frame.
  const handleScroll = () => {
    if (rafRef.current !== null) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      const scroller = scrollerRef.current;
      if (!scroller) return;
      syncEdges(scroller);
    });
  };

  // One card per press. This is deliberate stepping ON DEMAND, which is not
  // what scroll-snap did wrong — snap forced stepping onto every free
  // gesture. Pressing a button is an explicit request for "the next one".
  const step = (direction: 1 | -1) => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const stride = strideRef.current || scroller.clientWidth * 0.8;
    scroller.scrollBy({
      left: stride * direction,
      behavior: reducedMotion ? "auto" : "smooth",
    });
  };

  useEffect(
    () => () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    },
    [],
  );

  return (
    <>
      {/* Scroll affordance (2026-08-05). The strip hides its scrollbar and a
          vertical mouse wheel scrolls the PAGE, not the strip — so before
          this, a visitor on a plain mouse could reach only the cards already
          on screen. Trackpad and touch users were always fine.

          Sits above the strip rather than floating over the cards: the strip
          is full-bleed and its media frames carry live WebGL art, which
          overlay buttons would fight.

          ⚠️ Alignment: this rides Grid/Col on CONTENT_BAND — the same band
          the h1, the bio and the GlobalToolbar use. Measured at 1440 the band
          is 382..1058, and the first card's left edge is also 382, so the
          arrows land on the page's existing vertical spine.

          Do NOT wrap this in `max-w-(--grid-max) px-4 sm:px-8`. GlobalToolbar
          needs that because it mounts in app/layout.tsx outside any canvas;
          here the PARENT already is the canvas — which is exactly why the
          strip below has to break out of it with width:100vw. Adding it again
          double-pads, and the arrows land 16px inboard at every width
          (measured 1050/815/366 against the toolbar's 1066/836/382). */}
        <Grid>
          <Col md={CONTENT_BAND_MD} lg={CONTENT_BAND}>
        <div className="flex justify-end">
          {/* -mr-2 lives on a WRAPPER inside the flex row, not on the row
              itself — that is exactly how GlobalToolbar's right cluster does
              it, and the two must agree or the arrows won't line up with the
              theme/music controls directly above them. */}
          <div className="flex gap-1 -mr-2">
          <button
            type="button"
            onClick={() => step(-1)}
            disabled={atStart}
            aria-label="Show previous projects"
            aria-controls={MARQUEE_SCROLLER_ID}
            className="bio-toolbar-btn"
          >
            {/* One icon, mirrored — ArrowRightIcon's own docblock specifies
                scaleX(-1) on the wrapper for the left-facing variant. */}
            <span style={{ display: "inline-flex", transform: "scaleX(-1)" }}>
              <ArrowRightIcon size={16} />
            </span>
          </button>
          <button
            type="button"
            onClick={() => step(1)}
            disabled={atEnd}
            aria-label="Show next projects"
            aria-controls={MARQUEE_SCROLLER_ID}
            className="bio-toolbar-btn"
          >
            <ArrowRightIcon size={16} />
          </button>
          </div>
        </div>
          </Col>
        </Grid>

    <div
      id={MARQUEE_SCROLLER_ID}
      ref={scrollerRef}
      onScroll={handleScroll}
      className="work-marquee"
      style={{
        // Full-bleed breakout from the 1128px editorial canvas (body
        // has overflow-x hidden, so 100vw can't cause a page scroll).
        width: "100vw",
        marginLeft: "calc(50% - 50vw)",
      }}
    >
      <div className="work-marquee-track">
        {studies.map((study) => (
          <div
            key={study.slug}
            className="work-marquee-cell w-[520px] max-w-[80vw] shrink-0"
          >
            <StudyCell study={study} onPreview={onPreview} />
          </div>
        ))}
      </div>
    </div>
    </>
  );
}

// Section label — Geist Mono at body size, primary ink
// ("Select work", "Just for fun").
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h2
      style={{
        fontFamily: "var(--font-geist-mono), ui-monospace, Menlo, monospace",
        fontWeight: 400,
        fontSize: "calc(14px + var(--font-size-offset))",
        lineHeight: "22.4px",
        textTransform: "uppercase",
        letterSpacing: "-0.02em",
        color: "var(--color-fg)",
      }}
    >
      {children}
    </h2>
  );
}

// Card info overlay (2026-08-06 redesign). Title + mono "COMPANY • YEAR"
// on one baseline row, description below — the same hierarchy that used
// to sit above/below the frame, now revealed WITHIN it on hover over a
// scrim (see the .mq-info / .mq-media rules in globals.css). Persistent
// on touch, where there is no hover to trigger it.
function MarqueeInfo({
  title,
  meta,
  description,
}: {
  title: string;
  /** Mono right-edge label — "Company • Year". */
  meta?: string;
  description?: string;
}) {
  return (
    <div className="mq-info">
      {/* flex-wrap: on narrow (80vw) mobile cells the nowrap meta label
          drops to its own line instead of crushing the title. */}
      <div className="flex flex-wrap items-baseline justify-between gap-x-2.5 gap-y-0.5">
        <h3
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "calc(14px + var(--font-size-offset))",
            fontWeight: 500,
            letterSpacing: "-0.01em",
            lineHeight: "22px",
            color: "var(--color-fg)",
          }}
        >
          {title}
        </h3>
        {meta && (
          <span
            style={{
              whiteSpace: "nowrap",
              fontFamily:
                "var(--font-geist-mono), ui-monospace, Menlo, monospace",
              fontSize: "calc(12px + var(--font-size-offset))",
              fontWeight: 400,
              textTransform: "uppercase",
              letterSpacing: "-0.02em",
              lineHeight: "22px",
              color: "color-mix(in srgb, var(--color-fg) 62%, var(--color-bg))",
            }}
          >
            {meta}
          </span>
        )}
      </div>
      {description && (
        <p
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "calc(14px + var(--font-size-offset))",
            fontWeight: 400,
            lineHeight: "20px",
            color: "var(--color-fg-secondary)",
          }}
        >
          {description}
        </p>
      )}
    </div>
  );
}

// Media frame — renders the first galleryContent entry for the study
// inside the fixed 323px frame: product video (autoplay loop), layered
// UI composite (centered, drop-shadow), or plain image. Studies without
// media fall back to the grey "Under construction" placeholder.
function StudyMediaFrame({
  study,
  locked,
  info,
}: {
  study: CaseStudyMeta;
  locked: boolean;
  /** Title/meta/description revealed within the frame on hover. */
  info?: { title: string; meta?: string; description?: string };
}) {
  const items = galleryContent[study.slug] ?? [];
  const item = items[0] ?? null;
  const layers = item && typeof item === "object" && "layers" in item ? item.layers : null;
  const video = item && typeof item === "object" && "video" in item ? item : null;
  const image =
    typeof item === "string"
      ? item
      : item && typeof item === "object" && "src" in item
        ? item.src
        : null;
  const fit =
    item && typeof item === "object" && "src" in item ? (item.fit ?? "contain") : "contain";
  const objectPosition =
    item && typeof item === "object" && "src" in item ? (item.objectPosition ?? "center") : "center";
  const hasMedia = Boolean(video || layers || image);

  return (
    <div
      // 13:10 aspect so the 80vw mobile cells scale down proportionally
      // instead of going tall-and-narrow. At ≥768px .mq-frame pins the
      // height to 400px flat (globals.css) — identical media dimensions
      // on every card in both marquee states.
      className="mq-frame w-full overflow-hidden relative aspect-[13/10]"
      style={{
        backgroundColor: STUDY_FRAME_BG,
        border: "0.5px solid var(--color-border)",
        borderRadius: 4,
      }}
    >
      {/* Every study card gets the animated accent-dither backdrop,
          seeded by slug so the wave's tempo/phase/position varies card
          to card (spec: docs/superpowers/specs/
          2026-07-20-dither-card-backdrops-design.md). F&B composes its
          own inside FnbDitherFrame (pinned to the original Paper
          params) along with the phone mock. */}
      {study.slug === "fb-ordering" ? (
        <FnbDitherFrame />
      ) : (
        <DitherBackdrop seed={study.slug} />
      )}
      {/* On-top media, wrapped so the shared hover rule recedes just this
          layer while the dither behind it stays put. F&B renders none of
          these — its mock is the phone inside FnbDitherFrame. */}
      {study.slug !== "fb-ordering" && (
        <div className="mq-media">
      {video &&
        study.slug !== "fb-ordering" &&
        (video.shell ? (
          // Specimen system (prototype): the video renders as a contained
          // artifact inside a DeviceShell on the themed canvas, never
          // full-bleed — so the theme owns the backdrop, not the
          // recording's baked-in background.
          <div className="absolute inset-0 flex items-center justify-center">
            <DeviceShell
              variant={video.shell}
              style={
                video.shell === "phone"
                  ? { height: "86%" }
                  : { width: "78%", aspectRatio: "16 / 10" }
              }
            >
              <AutoplayVideo
                src={video.video}
                poster={video.poster}
                style={{
                  // 1px overshoot: the shell screen's height is usually
                  // fractional (86% of the band height), and the video's
                  // rounded-down 100% leaves a hairline of the muted
                  // screen bg visible at the bottom edge.
                  position: "absolute",
                  inset: -0.5,
                  width: "calc(100% + 1px)",
                  height: "calc(100% + 1px)",
                  objectFit: "cover",
                  display: "block",
                  transform: video.zoom ? `scale(${video.zoom})` : undefined,
                }}
              />
            </DeviceShell>
          </div>
        ) : (
          <AutoplayVideo
            src={video.video}
            poster={video.poster}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }}
          />
        ))}
      {/* Layered composites: only the UI mock renders (layers.bg stays
          skipped, same as before). uiWidth/uiHeight become max-bounds so
          the mock scales into the shorter 323px frame without clipping;
          drop-shadow traces the PNG's alpha shape. */}
      {layers && (
        <img
          src={layers.ui}
          alt=""
          aria-hidden
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
            maxWidth: layers.uiWidth ?? "92%",
            maxHeight: layers.uiHeight ?? "88%",
            width: "auto",
            height: "auto",
            borderRadius: layers.uiBorderRadius ?? undefined,
            filter: layers.uiShadow ?? undefined,
            display: "block",
            pointerEvents: "none",
          }}
        />
      )}
      {!layers && image && (
        <img
          src={image}
          alt=""
          style={{
            width: "100%",
            height: "100%",
            objectFit: fit,
            objectPosition,
            display: "block",
          }}
        />
      )}
      {!hasMedia && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
          <span
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "calc(16px + var(--font-size-offset))",
              fontWeight: 500,
              letterSpacing: "-0.01em",
              color: "var(--color-fg-secondary)",
            }}
          >
            {study.title}
          </span>
          <span style={{ ...PLACEHOLDER_LABEL }}>
            Under construction
          </span>
        </div>
      )}
        </div>
      )}
      {info && (
        <MarqueeInfo
          title={info.title}
          meta={info.meta}
          description={info.description}
        />
      )}
      <LockedFrameBadge locked={locked} />
      <CursorGlowOverlay />
    </div>
  );
}

function StudyCell({
  study,
  onPreview,
}: {
  study: CaseStudyMeta;
  onPreview: (slug: string) => void;
}) {
  const locked = isLocked(study.slug);
  const href = STUDY_ROUTES[study.slug];
  const display = MARQUEE_DISPLAY[study.slug];
  const displayTitle = display?.title ?? study.title;

  // A locked card offers a media teaser (the preview lightbox) only when
  // the study actually has gallery media. With no media the lightbox
  // renders nothing, so the click was a silent no-op — instead let
  // LockGate fall back to its `requestUnlock` default and open the gate
  // modal, which is the honest action for a locked, media-less study.
  const hasPreview = firstStudyMedia(study.slug) !== null;

  // The card IS the mock frame. Title / COMPANY • YEAR / description live
  // inside it as the .mq-info overlay, revealed on hover while the mock
  // recedes — the card never changes size (2026-08-06 redesign). LockGate's
  // hover overlay + click gate still carry the locked state.
  const cellInner = (
    <div className="mq-cell">
      <StudyMediaFrame
        study={study}
        locked={locked}
        info={{
          title: displayTitle,
          meta: display ? `${display.org} • ${display.year}` : study.metric,
          description: display?.description,
        }}
      />
    </div>
  );

  // Studies with a dedicated route link out; the rest are static media
  // cells (the fullscreen gallery carousel was removed 2026-07-14).
  // Cursor chat-bubble label DISABLED on project cards 2026-07-27
  // (Marco — the always-visible title row above the media made it
  // redundant); playground cells still use it.
  const cell = href ? (
    <Link
      href={href}
      aria-label={`Open case study — ${displayTitle}`}
      className="flex flex-col h-full w-full text-left cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-(--color-accent)"
    >
      {cellInner}
    </Link>
  ) : (
    <div className="flex flex-col h-full w-full text-left">{cellInner}</div>
  );

  return (
    <LockGate
      mode="card"
      locked={locked}
      onActivate={hasPreview ? () => onPreview(study.slug) : undefined}
    >
      {cell}
    </LockGate>
  );
}

// First gallery entry for a study, reduced to a single previewable
// medium: product video, layered-composite UI mock, or plain image.
function firstStudyMedia(
  slug: string
): { video?: { src: string; poster?: string }; image?: string } | null {
  const item = (galleryContent[slug] ?? [])[0] ?? null;
  if (!item) return null;
  if (typeof item === "string") return { image: item };
  if ("video" in item) return { video: { src: item.video, poster: item.poster } };
  if ("layers" in item) return { image: item.layers.ui };
  if ("src" in item) return { image: item.src };
  return null;
}

// Full-resolution media preview for locked (in-progress) studies —
// darkened backdrop, media centered at up to 90vw × 85vh. Clicking the
// backdrop or pressing Esc closes; clicking the media does not.
function MediaPreviewLightbox({
  slug,
  onClose,
}: {
  slug: string | null;
  onClose: () => void;
}) {
  const media = slug ? firstStudyMedia(slug) : null;

  // Portal target — the grid lives inside a framer-motion wrapper whose
  // `filter` style becomes the containing block for position:fixed, so
  // the overlay must escape to <body> to actually cover the viewport.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!slug) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [slug, onClose]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {slug && media && (
        <motion.div
          key="media-preview"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="fixed inset-0 z-[140] flex items-center justify-center p-6 cursor-zoom-out"
          style={{ background: "rgba(0, 0, 0, 0.72)" }}
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label="Media preview"
        >
          <motion.div
            initial={{ scale: 0.96 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.96 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            {media.video ? (
              <video
                src={media.video.src}
                poster={media.video.poster}
                autoPlay
                loop
                muted
                playsInline
                className="block rounded-md"
                style={{ maxWidth: "90vw", maxHeight: "85vh" }}
              />
            ) : (
              <img
                src={media.image}
                alt=""
                className="block rounded-md"
                style={{
                  maxWidth: "90vw",
                  maxHeight: "85vh",
                  width: "auto",
                  height: "auto",
                }}
              />
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}

// Playground cells share the same chrome and caption typography as
// case study cells. Non-interactive since the dedicated /play subpages
// were removed.
function PlaygroundCell({ card }: { card: PlaygroundCard }) {
  // Pure-visual cell — caption removed 2026-07-15 (title/description
  // still live on the card data in lib/playground-cards.ts). Titles
  // surface through the cursor chat bubble, same as the study cells.
  return (
    <div
      className="flex flex-col h-full w-full"
      onMouseEnter={() => setCursorLabel(card.title)}
      onMouseLeave={() => setCursorLabel(null)}
    >
      <PlaygroundMediaFrame card={card} />
    </div>
  );
}

// Playground media — autoplay loop of the card's demo video. Landscape
// cards keep the fixed 323px frame; portrait captures (Pajamagrams,
// Custom Wrapped) share a taller frame so the phone videos read
// properly instead of a cover-cropped sliver. Portrait frames are
// width-capped: at full band width the fixed-height frame goes
// near-square and object-cover crops the top of the capture out of
// view (Pajamagrams lost its title through the whole 900–1199 window).
// "Coming soon" placeholder when no video yet.
function PlaygroundMediaFrame({ card }: { card: PlaygroundCard }) {
  return (
    <div
      className={`w-full overflow-hidden relative ${
        isWide(card) ? "h-[323px]" : "max-w-[420px] mx-auto h-[560px] lg:h-[640px]"
      }`}
      style={{
        backgroundColor: FRAME_BG,
        border: "0.5px solid var(--color-border)",
        borderRadius: 4,
      }}
    >
      {card.video ? (
        <AutoplayVideo
          src={card.video}
          poster={card.poster}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
          }}
        />
      ) : (
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ ...PLACEHOLDER_LABEL }}
        >
          Coming soon
        </div>
      )}
    </div>
  );
}

// Media-frame fills — theme-aware by construction: mixing ink over the
// bg tracks light/dark and all colored-theme overrides through the
// fg/bg vars. Replaces the per-slug brand tints (CARD_TINTS) and the 9%
// placeholder grey (2026-07-20 pass). Lifestyle/photographic
// `layers.bg` images are intentionally not rendered; the `layers.ui`
// overlay, standalone UI screenshots, and product videos render on top
// of this fill.
//
// Carousel study cards read as distinctly raised panels (7% ink —
// clearly lighter than the page in dark mode, a clear grey in light);
// playground frames keep the quieter 4% wash.
const STUDY_FRAME_BG =
  "color-mix(in srgb, var(--color-fg) 7%, var(--color-bg))";
const FRAME_BG = "color-mix(in srgb, var(--color-fg) 4%, var(--color-bg))";

// Slugs hidden from the homepage gallery (in-flight content / not
// ready to show). Removing a slug from this set re-enables the card
// without touching anywhere else.
const HIDDEN_SLUGS = new Set<string>([]);

// Slugs that route to a dedicated case study page. Cards in this map
// render as <Link>; every other card is a static, non-interactive
// media cell (the fullscreen gallery carousel was removed 2026-07-14).
const STUDY_ROUTES: Record<string, string> = {
  "fb-ordering": "/work/fb-ordering",
  compendium: "/work/compendium",
  "ai-workflow": "/work/ai-workflow",
  "knowledge-base": "/work/knowledge-base",
  upsells: "/work/upsells",
  checkin: "/work/checkin",
  "general-task": "/work/general-task",
  "design-system": "/work/design-system",
};



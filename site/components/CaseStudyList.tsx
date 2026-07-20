"use client";

import { useState, useEffect, useRef, useCallback } from "react";
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
import { FilterIcon, CloseIcon, GalleryIcon, LockIcon } from "./Icons";
import Grid, { Col } from "@/components/layout/Grid";
import { galleryContent } from "@/lib/gallery-content";
import { setCursorLabel } from "@/lib/cursor-label";
import { TESTIMONIALS } from "@/lib/testimonials";
import LockGate, { LockedFrameBadge } from "./LockGate";
import DeviceShell from "./DeviceShell";
import CursorGlowOverlay from "./CursorGlowOverlay";
import { isLocked } from "@/lib/locked-content";


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
      {studies.length > 0 && (
        <>
          <SectionLabel>Select work</SectionLabel>
          {/* Work cards run as a full-bleed auto-scrolling marquee
              (2026-07-20, spec: docs/superpowers/specs/
              2026-07-20-work-marquee-design.md). Cells stay chromeless —
              the media frames carry the only framing. */}
          <StudyMarquee studies={studies} onPreview={onPreview} />
        </>
      )}

      {/* Testimonials — colleague quotes as full paragraphs, seated
          between the work marquee and the playground section (2026-07-15,
          copy lifted from the retired Marquee). */}
      <Testimonials />

      {/* Playground / experiments get their own label so the page reads
          as two sections: client work above, sidequests below. */}
      {PLAYGROUND_CARDS.length > 0 && (
        <>
          <SectionLabel>Just for fun</SectionLabel>
          <Grid className="gap-y-16">
            {PLAYGROUND_CARDS.map((card, i) => (
              <Col key={`play-${card.slug}`} lg={i % 2 === 0 ? "1-6" : "7-12"}>
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

// neesh.cc-style infinite conveyor: the card set renders an even number
// of times inside a flex track that animates translateX(0 → -50%) on a
// linear loop (CSS in globals.css, ".work-marquee"). Identical halves
// make the loop point invisible. Hovering anywhere on the strip pauses
// it; under prefers-reduced-motion it degrades to a plain scrollable
// row with the duplicate sets display:none'd.
//
// Only the first set is real to assistive tech and the tab order — the
// duplicates are aria-hidden + inert. (`inert` isn't in @types/react 18
// but the vendored React 19 runtime supports it, hence the cast.)
//
// A seamless -50% loop needs each half-track to be at least viewport
// width; on ultrawide screens the set count doubles (2 → 4), and the
// duration scales with it so the px/s speed stays constant.
const MARQUEE_BASE_DURATION_S = 70;
const DUPE_PROPS = { "aria-hidden": true, inert: true } as object;

function StudyMarquee({
  studies,
  onPreview,
}: {
  studies: CaseStudyMeta[];
  onPreview: (slug: string) => void;
}) {
  const [setCount, setSetCount] = useState(2);
  const firstSetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const measure = () => {
      const setWidth = firstSetRef.current?.offsetWidth ?? 0;
      setSetCount(setWidth > 0 && setWidth < window.innerWidth ? 4 : 2);
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [studies.length]);

  return (
    <div
      className="work-marquee"
      style={{
        // Full-bleed breakout from the 1128px editorial canvas (body
        // has overflow-x hidden, so 100vw can't cause a page scroll).
        width: "100vw",
        marginLeft: "calc(50% - 50vw)",
        ["--marquee-duration" as string]: `${
          MARQUEE_BASE_DURATION_S * (setCount / 2)
        }s`,
      }}
    >
      <div className="work-marquee-track">
        {Array.from({ length: setCount }, (_, setIndex) => {
          const isDupe = setIndex > 0;
          return (
            <div
              key={setIndex}
              ref={setIndex === 0 ? firstSetRef : undefined}
              className="flex gap-6 pr-6"
              data-marquee-dupe={isDupe ? "" : undefined}
              {...(isDupe ? DUPE_PROPS : undefined)}
            >
              {studies.map((study) => (
                <div
                  key={study.slug}
                  className="w-[420px] max-w-[80vw] shrink-0"
                >
                  <StudyCell study={study} onPreview={onPreview} />
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Testimonials — one quote per colleague, set three-up across the full
// editorial canvas (cols 1-4 / 5-8 / 9-12 at desktop; stacks on
// smaller bands like the study cells above). No section label — the
// bordered cells read as their own organized band (Marco 2026-07-15).
function Testimonials() {
  const lgSpecs = ["1-4", "5-8", "9-12"] as const;
  return (
    <Grid className="gap-y-6">
      {TESTIMONIALS.map((t, i) => (
        <Col key={t.author} lg={lgSpecs[i % lgSpecs.length]}>
          <div
            className="h-full p-6"
            style={{
              border: "0.5px solid var(--color-border)",
              borderRadius: 4,
            }}
          >
            <p style={{ ...typescale.body, color: "var(--color-fg-secondary)" }}>
              “{t.text}”
              <span
                style={{
                  display: "block",
                  marginTop: 8,
                  color: "var(--color-fg-tertiary)",
                }}
              >
                —{" "}
                {t.href ? (
                  <a
                    href={t.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="dotted-link--inline"
                  >
                    {t.author}
                  </a>
                ) : (
                  t.author
                )}
                {t.org && ` (${t.org})`}
              </span>
            </p>
          </div>
        </Col>
      ))}
    </Grid>
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

// Shared title + description block — same typography across case
// studies and playground items so the grid reads as one consistent
// composition.
// PARKED 2026-07-15: cards went pure-visual, so nothing renders this
// right now. Kept intact (with the note slot for locked studies) so
// captions can come back with one line per cell.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function CellCaption({
  title,
  description,
  note,
}: {
  title: string;
  description?: string;
  /** Small mono status label rendered to the right of the title
   *  (e.g. "Coming soon" on locked studies). */
  note?: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <h3
        className="flex items-baseline gap-2.5"
        style={{
          fontFamily: "var(--font-sans)",
          fontSize: "calc(16px + var(--font-size-offset))",
          fontWeight: 500,
          letterSpacing: "-0.01em",
          lineHeight: "22px",
          color: "var(--color-fg)",
        }}
      >
        {title}
        {note && (
          <span
            style={{
              fontFamily:
                "var(--font-geist-mono), ui-monospace, Menlo, monospace",
              fontSize: 10,
              fontWeight: 500,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: "var(--color-fg-tertiary)",
            }}
          >
            {note}
          </span>
        )}
      </h3>
      {description && (
        <p
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "calc(14px + var(--font-size-offset))",
            fontWeight: 400,
            letterSpacing: "-0.01em",
            lineHeight: "22px",
            color: "var(--color-fg-secondary)",
            textWrap: "balance",
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
}: {
  study: CaseStudyMeta;
  locked: boolean;
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
      className="w-full overflow-hidden relative h-[323px]"
      style={{
        backgroundColor: FRAME_BG,
        border: "0.5px solid var(--color-border)",
        borderRadius: 4,
      }}
    >
      {video &&
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
          <span
            style={{
              fontFamily: "var(--font-geist-mono), ui-monospace, Menlo, monospace",
              fontSize: "11px",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: "var(--color-fg-tertiary)",
            }}
          >
            Under construction
          </span>
        </div>
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

  // Pure-visual cells (2026-07-15 pass): no caption — the media frame
  // is the whole card. Titles/descriptions are parked in CellCaption
  // below and the study metadata if we want them back. The link's
  // aria-label still carries the study title for screen readers, and
  // the lock affordances live on the frame (LockedFrameBadge + LockGate
  // hover badge).
  const cellInner = <StudyMediaFrame study={study} locked={locked} />;

  // Studies with a dedicated route link out; the rest are static media
  // cells (the fullscreen gallery carousel was removed 2026-07-14).
  // Cursor chat-bubble reveal (2026-07-15): the pure-visual cells give
  // their title back through the cursor label instead of a caption.
  const labelHandlers = {
    onMouseEnter: () => setCursorLabel(study.title),
    onMouseLeave: () => setCursorLabel(null),
  };

  const cell = href ? (
    <Link
      href={href}
      aria-label={`Open case study — ${study.title}`}
      className="flex flex-col h-full w-full text-left cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-(--color-accent)"
      {...labelHandlers}
    >
      {cellInner}
    </Link>
  ) : (
    <div className="flex flex-col h-full w-full text-left" {...labelHandlers}>
      {cellInner}
    </div>
  );

  return (
    <LockGate
      mode="card"
      locked={locked}
      onActivate={() => onPreview(study.slug)}
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
// properly instead of a cover-cropped sliver. "Coming soon" placeholder
// when no video yet.
function PlaygroundMediaFrame({ card }: { card: PlaygroundCard }) {
  return (
    <div
      className={`w-full overflow-hidden relative ${
        isWide(card) ? "h-[323px]" : "h-[560px] lg:h-[640px]"
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
          style={{
            fontFamily: "var(--font-geist-mono), ui-monospace, Menlo, monospace",
            fontSize: "11px",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            color: "var(--color-fg-tertiary)",
          }}
        >
          Coming soon
        </div>
      )}
    </div>
  );
}

// Uniform media-frame fill — a hair darker than the page background,
// theme-aware by construction: mixing 4% ink over the bg tracks
// light/dark and all colored-theme overrides through the fg/bg vars.
// Replaces the per-slug brand tints (CARD_TINTS) and the 9% placeholder
// grey (2026-07-20 pass). Lifestyle/photographic `layers.bg` images are
// intentionally not rendered; the `layers.ui` overlay, standalone UI
// screenshots, and product videos render on top of this fill.
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



"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import type { CaseStudyMeta } from "@/lib/types";
import {
  PLAYGROUND_CARDS,
  type PlaygroundCard,
} from "@/lib/playground-cards";
import { ALL_TAGS, getMatchingSlugs } from "@/lib/study-tags";
import { typescale } from "@/lib/typography";
import { SPRING_HEAVY } from "@/lib/springs";
import { FilterIcon, CloseIcon, GalleryIcon, LockIcon } from "./Icons";
import GalleryMode from "./GalleryMode";
import { galleryContent } from "@/lib/gallery-content";
import LockGate, { LockedFrameBadge } from "./LockGate";
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

  // ── Gallery mode ──
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryStartSlug, setGalleryStartSlug] = useState<string | null>(null);

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

      {/* Linear-style project grid — case studies + playground items in
          one bordered 2-column grid. Locked studies still wear the
          LockGate hover treatment and route clicks to the unlock modal;
          unlocked study clicks open the fullscreen gallery. Playground
          cells are media-only and non-interactive (no /play subpages
          anymore). */}
      <ProjectGrid
        studies={filteredStudies}
        onOpen={(slug) => {
          setGalleryStartSlug(slug);
          setGalleryOpen(true);
        }}
      />

      <GalleryMode
        open={galleryOpen}
        onClose={() => setGalleryOpen(false)}
        studies={filteredStudies}
        initialStudySlug={galleryStartSlug}
      />
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

// ── Project grid (Linear-style bordered cells) ──

// Unified grid that renders case studies and playground items together
// in a 2-column bordered layout inspired by linear.app's product
// section. Each cell has a small mono "FIG. 1.x" label at the top, a
// centered media area, and (for case studies) a title + description
// block at the bottom. Playground cells skip the caption to read as
// media-only thumbnails. Hairline borders between cells; the outer
// container carries a rounded border + overflow clip so the grid reads
// as a single framed object.
type GridItem =
  | { type: "study"; key: string; study: CaseStudyMeta }
  | { type: "playground"; key: string; card: PlaygroundCard };

function ProjectGrid({
  studies,
  onOpen,
}: {
  studies: CaseStudyMeta[];
  onOpen: (slug: string) => void;
}) {
  const items: GridItem[] = [
    ...studies.map<GridItem>((s) => ({
      type: "study",
      key: s.slug,
      study: s,
    })),
    ...PLAYGROUND_CARDS.map<GridItem>((c) => ({
      type: "playground",
      key: `play-${c.slug}`,
      card: c,
    })),
  ];

  if (items.length === 0) return null;

  return (
    <div className="flex flex-col gap-12">
      {/* Section label — Libre Baskerville italic, the redesign's serif
          accent for section titles. */}
      <h2
        style={{
          fontFamily: "var(--font-baskerville), Georgia, serif",
          fontStyle: "italic",
          fontWeight: 400,
          fontSize: 20,
          lineHeight: 1.4,
          color: "var(--color-fg)",
        }}
      >
        Select work
      </h2>
      {items.map((item) => {
        // Card chrome per the 2026-07 redesign: thick light frame
        // (theme-aware #d1d1d1 equivalent), near-square corners, paper
        // grain multiplied over the card fill.
        const cellStyle: React.CSSProperties = {
          backgroundColor: "var(--color-card-bg)",
          backgroundImage: "var(--grain-image)",
          backgroundSize: "200px 200px",
          backgroundBlendMode: "multiply",
          border: "5px solid color-mix(in srgb, var(--color-fg) 18%, var(--color-bg))",
          borderRadius: 1,
        };

        if (item.type === "study") {
          return (
            <StudyCell
              key={item.key}
              study={item.study}
              cellStyle={cellStyle}
              onOpen={() => onOpen(item.study.slug)}
            />
          );
        }
        return (
          <PlaygroundCell
            key={item.key}
            card={item.card}
            cellStyle={cellStyle}
          />
        );
      })}
    </div>
  );
}

// Shared title + description block — same typography across case
// studies and playground items so the grid reads as one consistent
// composition.
function CellCaption({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="flex flex-col gap-3">
      <h3
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

  // Brand tint behind composites/contained images; neutral grey for the
  // empty placeholder state.
  const tint = CARD_TINTS[study.slug];
  const mediaBg = tint
    ? `color-mix(in srgb, ${tint} ${CARD_TINT_AMOUNT}%, ${CARD_BG})`
    : CARD_BG;

  return (
    <div
      className="w-full overflow-hidden relative h-[323px]"
      style={{
        backgroundColor: hasMedia ? mediaBg : PLACEHOLDER_BG,
        border: "0.5px solid var(--color-border)",
        borderRadius: 4,
      }}
    >
      {video && (
        <video
          src={video.video}
          poster={video.poster}
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
          }}
        />
      )}
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
          Under construction
        </div>
      )}
      <LockedFrameBadge locked={locked} />
    </div>
  );
}

function StudyCell({
  study,
  cellStyle,
  onOpen,
}: {
  study: CaseStudyMeta;
  cellStyle: React.CSSProperties;
  onOpen: () => void;
}) {
  const locked = isLocked(study.slug);
  const href = STUDY_ROUTES[study.slug];

  const sharedClassName =
    "flex flex-col h-full w-full p-6 gap-6 text-left cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-(--color-accent)";

  // Caption above the media frame per the 2026-07 redesign.
  const cellInner = (
    <>
      <CellCaption title={study.title} description={study.description} />
      <StudyMediaFrame study={study} locked={locked} />
    </>
  );

  const button = href ? (
    <Link
      href={href}
      aria-label={`Open case study — ${study.title}`}
      className={sharedClassName}
      style={cellStyle}
    >
      {cellInner}
    </Link>
  ) : (
    <button
      type="button"
      onClick={onOpen}
      aria-label={`Open project gallery — ${study.title}`}
      className={sharedClassName}
      style={cellStyle}
    >
      {cellInner}
    </button>
  );

  return (
    <LockGate mode="card" locked={locked}>
      {button}
    </LockGate>
  );
}

// Playground cells share the same chrome and caption typography as
// case study cells. Non-interactive since the dedicated /play subpages
// were removed.
function PlaygroundCell({
  card,
  cellStyle,
}: {
  card: PlaygroundCard;
  cellStyle: React.CSSProperties;
}) {
  return (
    <div
      className="flex flex-col h-full w-full p-6 gap-6"
      style={cellStyle}
    >
      <CellCaption title={card.title} description={card.description} />
      <PlaygroundMediaFrame card={card} />
    </div>
  );
}

// Playground media — autoplay loop of the card's demo video inside the
// same fixed 323px frame; "Coming soon" placeholder when no video yet.
function PlaygroundMediaFrame({ card }: { card: PlaygroundCard }) {
  return (
    <div
      className="w-full overflow-hidden relative h-[323px]"
      style={{
        backgroundColor: PLACEHOLDER_BG,
        border: "0.5px solid var(--color-border)",
        borderRadius: 4,
      }}
    >
      {card.video ? (
        <video
          src={card.video}
          poster={card.poster}
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
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

// Card surface fill — theme-aware via --color-card-bg defined in
// globals.css (#fafafa light, #141414 dark). Lifestyle/photographic
// `layers.bg` images are intentionally not rendered (see below); the
// `layers.ui` overlay, standalone UI screenshots, and product videos
// still render on top of this fill.
const CARD_BG = "var(--color-card-bg)";

// TEMPORARY: uniform grey fill rendered inside every cell's media
// frame while the per-slug imagery is re-cropped to the new 1:1
// frame. Composites to ~#d5d5d5 in light / ~#333 in dark, distinct
// from the near-white card surface so each cell reads as a deliberate
// placeholder.
const PLACEHOLDER_BG =
  "color-mix(in srgb, var(--color-fg) 9%, var(--color-bg))";

// Slugs hidden from the homepage gallery (in-flight content / not
// ready to show). Removing a slug from this set re-enables the card
// without touching anywhere else.
const HIDDEN_SLUGS = new Set<string>(["upsells", "design-system"]);

// Slugs that route to a dedicated case study page instead of opening
// the homepage gallery overlay. Cards in this map render as <Link>;
// every other card falls back to the gallery-open button behavior.
const STUDY_ROUTES: Record<string, string> = {
  "fb-ordering": "/work/fb-ordering",
  compendium: "/work/compendium",
  "ai-workflow": "/work/ai-workflow",
  "knowledge-base": "/work/knowledge-base",
};

// Per-card accent tint, blended at low opacity over CARD_BG so each
// card reads as branded without overwhelming the imagery. The Canary
// trio is intentionally three distinct hue families (blue / teal /
// amber) so the cards read as differentiated at a glance — at 10%
// opacity the original compendium-blue + checkin-indigo blended into
// near-identical pale blues, so checkin was shifted to a warm amber.
// Slugs missing from this map (fb-ordering — has a video that would
// clash with a tinted bg; ai-workflow — no hero gradient defined) fall
// back to the neutral CARD_BG.
const CARD_TINTS: Record<string, string> = {
  compendium: "#2563EB", // blue
  upsells: "#0D9488", // teal
  checkin: "#D97706", // amber (was #6366F1 indigo — too close to compendium)
  "general-task": "#334155", // slate
  "design-system": "#8B5CF6", // violet
};
// Tint strength — 10% accent over the base card bg. Light enough to
// read as a wash, not a saturated panel.
const CARD_TINT_AMOUNT = 10;


"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import type { CaseStudyMeta } from "@/lib/types";
import { ALL_TAGS, getMatchingSlugs } from "@/lib/study-tags";
import { typescale } from "@/lib/typography";
import { SPRING_HEAVY } from "@/lib/springs";
import { FilterIcon, CloseIcon, GalleryIcon, LockIcon } from "./Icons";
import GalleryMode from "./GalleryMode";
import { galleryContent } from "@/lib/gallery-content";


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

export default function CaseStudyList({ studies }: CaseStudyListProps) {
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

  // Studies whose first gallery slot has a layered UI mock — anything
  // without a foreground UI is hidden from the gallery view (empty arrays
  // and backdrop-only photos).
  const galleryReadyStudies = filteredStudies.filter((s) => {
    const items = galleryContent[s.slug] ?? [];
    const first = items[0];
    return first != null && typeof first === "object" && "layers" in first;
  });

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
      {/* Header */}
      <div className="mb-16" ref={filterAreaRef}>
        <div className="flex items-center justify-between gap-4">
          <h2
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "calc(var(--wordmark-fontsize, 48px) * 0.7)",
              fontWeight: 600,
              lineHeight: 1.05,
              letterSpacing: "-0.025em",
              color: "var(--color-fg)",
              whiteSpace: "nowrap",
            }}
          >
            Work
          </h2>
          {/* Filter / Gallery icon toggles temporarily hidden for recruiter
              share. */}
          {false && (
            <div className="flex items-center gap-1">
              <ViewToggleButton
                active={activeFilters.length > 0 || filterOpen}
                onClick={() => setFilterOpen((o) => !o)}
                label="Filter projects"
              >
                <FilterIcon size={16} />
              </ViewToggleButton>
              <ViewToggleButton
                active={galleryOpen}
                onClick={() => setGalleryOpen(true)}
                label="Open gallery mode"
              >
                <GalleryIcon size={16} />
              </ViewToggleButton>
            </div>
          )}

          {/* Section entrypoints — flush right of the "Work" title. Open
              the gallery overlay or route to the full case studies page. */}
          <div className="flex items-center gap-6">
            <SectionLinkButton
              onClick={() => {
                setGalleryStartSlug(null);
                setGalleryOpen(true);
              }}
            >
              Gallery
            </SectionLinkButton>
            <SectionLinkButton href="/work" icon="lock">Case studies</SectionLinkButton>
          </div>
        </div>

        {/* Filter dropdown */}
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

      {/* Gallery card list — one card per study. Clicking any card opens
          the gallery overlay starting at that project. Studies without a
          UI mock in their first gallery slot are hidden. */}
      <GalleryCardList
        studies={galleryReadyStudies}
        onOpen={(slug) => {
          setGalleryStartSlug(slug);
          setGalleryOpen(true);
        }}
      />

      <GalleryMode
        open={galleryOpen}
        onClose={() => setGalleryOpen(false)}
        studies={galleryReadyStudies}
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
    fontFamily: "var(--font-sans)",
    fontSize: "14px",
    fontWeight: 500,
    lineHeight: 1.4,
    color: icon === "lock" ? "var(--color-fg-tertiary)" : "var(--color-fg)",
    background: "none",
    border: 0,
    padding: 0,
  };
  const inner = (
    <>
      <span className="underline underline-offset-4 decoration-1">{children}</span>
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

// ── Gallery card list ──

// Renders one card per study with the same template. Cards for studies
// without gallery content show an empty placeholder frame. Click any card
// to open the fullscreen gallery starting at that project.
function GalleryCardList({
  studies,
  onOpen,
}: {
  studies: CaseStudyMeta[];
  onOpen: (slug: string) => void;
}) {
  if (studies.length === 0) return null;
  return (
    <div className="mt-8 flex flex-col gap-20">
      {studies.map((study) => (
        <GalleryCard key={study.slug} study={study} onOpen={() => onOpen(study.slug)} />
      ))}
    </div>
  );
}

function GalleryCard({
  study,
  onOpen,
}: {
  study: CaseStudyMeta;
  onOpen: () => void;
}) {
  const items = galleryContent[study.slug] ?? [];
  const item = items[0] ?? null;
  const layers = item && typeof item === "object" && "layers" in item ? item.layers : null;
  const image =
    typeof item === "string"
      ? item
      : item && typeof item === "object" && "src" in item
        ? item.src
        : null;
  const fit = item && typeof item === "object" && "src" in item ? (item.fit ?? "contain") : "contain";
  const objectPosition = item && typeof item === "object" && "src" in item ? (item.objectPosition ?? "center") : "center";

  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={`Open project gallery — ${study.title}`}
      className="block w-full cursor-pointer text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-(--color-accent) rounded-2xl transition-transform duration-200 ease-out hover:scale-[1.01]"
    >
      {/* Header: title left, year flush right */}
      <div className="flex items-baseline justify-between gap-4 mb-3">
        <span
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "16px",
            fontWeight: 500,
            color: "var(--color-fg)",
            letterSpacing: "-0.01em",
          }}
        >
          {study.title}
        </span>
        <span
          style={{
            fontFamily: "var(--font-geist-mono), ui-monospace, Menlo, monospace",
            fontSize: "11px",
            color: "var(--color-fg-tertiary)",
            whiteSpace: "nowrap",
          }}
        >
          {study.year}
        </span>
      </div>
      {/* Image frame */}
      <div
        className="w-full rounded-2xl overflow-hidden relative aspect-[16/10]"
        style={{
          backgroundColor: "var(--color-surface-raised)",
          border: "1px solid var(--color-border)",
        }}
      >
        {layers && (
          <>
            <img
              src={layers.bg}
              alt=""
              aria-hidden
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            />
            <img
              src={layers.ui}
              alt=""
              aria-hidden
              style={{
                position: "absolute",
                left: "50%",
                top: "50%",
                transform: "translate(-50%, -50%)",
                width: layers.uiWidth ?? "auto",
                height: layers.uiHeight ?? "auto",
                borderRadius: layers.uiBorderRadius ?? undefined,
                boxShadow: layers.uiShadow ?? undefined,
                display: "block",
                pointerEvents: "none",
              }}
            />
          </>
        )}
        {!layers && image && (
          <img
            src={image}
            alt=""
            style={{ width: "100%", height: "100%", objectFit: fit, objectPosition, display: "block" }}
          />
        )}
        {!layers && !image && (
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
      </div>
      {study.description && (
        <p
          className="mt-4"
          style={{
            ...typescale.body,
            color: "var(--color-fg-secondary)",
            maxWidth: "640px",
          }}
        >
          {study.description}
        </p>
      )}
    </button>
  );
}

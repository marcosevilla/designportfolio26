"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CaseStudyListRow from "./CaseStudyListRow";
import type { CaseStudyMeta } from "@/lib/types";
import { ALL_TAGS, getMatchingSlugs } from "@/lib/study-tags";
import { typescale } from "@/lib/typography";
import { SPRING_HEAVY } from "@/lib/springs";
import { FilterIcon, CloseIcon, GalleryIcon } from "./Icons";
import GalleryMode from "./GalleryMode";


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

  const filterKey = activeFilters.slice().sort().join(",");

  return (
    <section className="relative z-10">
      {/* Header */}
      <div className="mb-4" ref={filterAreaRef}>
        <div className="flex items-center justify-between gap-4">
          <h2
            style={{
              fontFamily: "var(--font-geist-mono), ui-monospace, Menlo, monospace",
              fontSize: "16px",
              fontWeight: 500,
              letterSpacing: "-0.01em",
              color: "var(--color-fg)",
            }}
          >
            Selected projects
          </h2>
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

      {/* List view (only view available while site is gated) */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={`list-view-${filterKey}`}
          initial={{ opacity: 0, filter: "blur(4px)" }}
          animate={{ opacity: 1, filter: "blur(0px)" }}
          exit={{ opacity: 0, filter: "blur(4px)" }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
        >
          {filteredStudies.map((study) => (
            <CaseStudyListRow key={study.slug} study={study} />
          ))}
        </motion.div>
      </AnimatePresence>

      <GalleryMode
        open={galleryOpen}
        onClose={() => setGalleryOpen(false)}
        studies={filteredStudies}
      />
    </section>
  );
}

"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import FadeIn from "./FadeIn";
import CaseStudyCard from "./CaseStudyCard";
import CaseStudyListRow from "./CaseStudyListRow";
import CaseStudyCarousel from "./CaseStudyCarousel";
import type { CaseStudyMeta } from "@/lib/types";
import { ALL_TAGS, getMatchingSlugs } from "@/lib/study-tags";
import { typescale } from "@/lib/typography";
import { SPRING_HEAVY } from "@/lib/springs";
import { GridIcon, ListIcon, CarouselIcon, FilterIcon, CloseIcon } from "./Icons";

// ── View mode persistence ──

type ViewMode = "cards" | "list" | "carousel";
const STORAGE_KEY = "work-view-mode";

function useViewMode(): [ViewMode, (mode: ViewMode) => void, boolean] {
  const [mode, setMode] = useState<ViewMode>("cards");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === "list" || saved === "carousel") setMode(saved);
    } catch {}
    setHydrated(true);
  }, []);

  const setAndPersist = (newMode: ViewMode) => {
    setMode(newMode);
    try {
      localStorage.setItem(STORAGE_KEY, newMode);
    } catch {}
  };

  return [mode, setAndPersist, hydrated];
}


// ── View toggle button ──

// Sized + spaced like ActionIcon in HeroActions so the work-toggle row
// reads as the same family as the email / linkedin / palette / smiley icons
// next to the "Marco Sevilla" name at the top of the page.
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
      onClick={onClick}
      aria-label={label}
      className="flex items-center justify-center transition-colors hover:text-(--color-accent)"
      style={{
        color: active
          ? "var(--color-accent)"
          : "var(--color-fg-secondary)",
      }}
    >
      {children}
    </button>
  );
}

// ── Year grouping helper ──

function getShowYear(studies: CaseStudyMeta[]): boolean[] {
  const result: boolean[] = [];
  let lastYear = "";
  for (const study of studies) {
    result.push(study.year !== lastYear);
    lastYear = study.year;
  }
  return result;
}

// ── Component ──

interface CaseStudyListProps {
  studies: CaseStudyMeta[];
}

export default function CaseStudyList({ studies }: CaseStudyListProps) {
  const [viewMode, setViewMode, hydrated] = useViewMode();
  const hasToggled = useRef(false);
  const showYears = getShowYear(studies);

  // ── Filter state ──
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [filterOpen, setFilterOpen] = useState(false);
  const filterAreaRef = useRef<HTMLDivElement>(null);

  // Compute filtered studies
  const matchingSlugs = getMatchingSlugs(activeFilters);
  const filteredStudies = activeFilters.length === 0
    ? studies
    : studies.filter((s) => matchingSlugs.has(s.slug));
  const filteredShowYears = getShowYear(filteredStudies);

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
    hasToggled.current = true;
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
    hasToggled.current = true;
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

  const handleSetView = (mode: ViewMode) => {
    hasToggled.current = true;
    setViewMode(mode);
  };

  const filterKey = activeFilters.slice().sort().join(",");

  return (
    <section className="relative z-10">
      {/* Header */}
      <div className="mb-4" ref={filterAreaRef}>
        <div className="flex items-center justify-end">
          {hydrated && (
            <div className="flex items-center gap-3">
              <ViewToggleButton
                active={activeFilters.length > 0 || filterOpen}
                onClick={() => setFilterOpen((o) => !o)}
                label="Filter projects"
              >
                <FilterIcon size={14} />
              </ViewToggleButton>
              <div className="w-px h-4" style={{ backgroundColor: "var(--color-border)" }} />
              <ViewToggleButton
                active={viewMode === "cards"}
                onClick={() => handleSetView("cards")}
                label="Card view"
              >
                <GridIcon size={14} />
              </ViewToggleButton>
              <ViewToggleButton
                active={viewMode === "list"}
                onClick={() => handleSetView("list")}
                label="List view"
              >
                <ListIcon size={14} />
              </ViewToggleButton>
              <ViewToggleButton
                active={viewMode === "carousel"}
                onClick={() => handleSetView("carousel")}
                label="Carousel view"
              >
                <CarouselIcon size={14} />
              </ViewToggleButton>
            </div>
          )}
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

      {/* Content area with blur transition */}
      <AnimatePresence mode="wait" initial={false}>
        {viewMode === "cards" && (
          <motion.div
            key={`cards-view-${filterKey}`}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
            initial={{ opacity: 0, filter: "blur(4px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, filter: "blur(4px)" }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
          >
            {filteredStudies.map((study, i) => {
              const isFirst = i === 0;
              const colClass = isFirst ? "sm:col-span-2" : "";
              const size = isFirst ? "hero" : "large";
              return hasToggled.current ? (
                <div key={study.slug} className={colClass}>
                  <CaseStudyCard study={study} cardSize={size} showYear />
                </div>
              ) : (
                <FadeIn key={study.slug} delay={i * 0.08} className={colClass}>
                  <CaseStudyCard study={study} cardSize={size} showYear />
                </FadeIn>
              );
            })}
          </motion.div>
        )}
        {viewMode === "list" && (
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
        )}
        {viewMode === "carousel" && (
          <motion.div
            key={`carousel-view-${filterKey}`}
            initial={{ opacity: 0, filter: "blur(4px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, filter: "blur(4px)" }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
          >
            <CaseStudyCarousel studies={filteredStudies} />
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

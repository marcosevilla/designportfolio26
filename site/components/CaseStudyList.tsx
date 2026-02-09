"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import FadeIn from "./FadeIn";
import CaseStudyCard from "./CaseStudyCard";
import CaseStudyListRow from "./CaseStudyListRow";
import type { CaseStudyMeta } from "@/lib/types";

// ── View mode persistence ──

type ViewMode = "cards" | "list";
const STORAGE_KEY = "work-view-mode";

function useViewMode(): [ViewMode, (mode: ViewMode) => void, boolean] {
  const [mode, setMode] = useState<ViewMode>("cards");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === "list") setMode("list");
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

// ── Toggle icons ──

function GridIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="5" height="5" />
      <rect x="9" y="2" width="5" height="5" />
      <rect x="2" y="9" width="5" height="5" />
      <rect x="9" y="9" width="5" height="5" />
    </svg>
  );
}

function ListIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="2" y1="4" x2="14" y2="4" />
      <line x1="2" y1="8" x2="14" y2="8" />
      <line x1="2" y1="12" x2="14" y2="12" />
    </svg>
  );
}

// ── View toggle button (matches sidebar icon style) ──

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
  const [hovered, setHovered] = useState(false);

  return (
    <motion.button
      onClick={onClick}
      aria-label={label}
      className="flex items-center justify-start"
      style={{
        color: active
          ? "var(--color-accent)"
          : hovered
            ? "var(--color-accent)"
            : "var(--color-fg-secondary)",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      animate={{ x: hovered ? 4 : 0 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
    >
      {children}
    </motion.button>
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

  const handleSetView = (mode: ViewMode) => {
    hasToggled.current = true;
    setViewMode(mode);
  };

  return (
    <section id="work">
      {/* Header: "Work" label + view toggle */}
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <h2
            className="tracking-tight"
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "calc(16px + var(--font-size-offset) + var(--font-pairing-boost))",
              fontWeight: 500,
              color: "var(--color-fg-secondary)",
            }}
          >
            Work
          </h2>
          {hydrated && (
            <div className="flex items-center gap-3">
              <ViewToggleButton
                active={viewMode === "cards"}
                onClick={() => handleSetView("cards")}
                label="Card view"
              >
                <GridIcon />
              </ViewToggleButton>
              <ViewToggleButton
                active={viewMode === "list"}
                onClick={() => handleSetView("list")}
                label="List view"
              >
                <ListIcon />
              </ViewToggleButton>
            </div>
          )}
        </div>
        <hr
          className="border-0 border-t mt-3"
          style={{ borderColor: "var(--color-border)" }}
        />
      </div>

      {/* Content area with blur transition */}
      <AnimatePresence mode="wait" initial={false}>
        {viewMode === "cards" ? (
          <motion.div
            key="cards-view"
            className="grid grid-cols-1 sm:grid-cols-2 gap-2"
            initial={{ opacity: 0, filter: "blur(4px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, filter: "blur(4px)" }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
          >
            {studies.map((study, i) =>
              hasToggled.current ? (
                <div key={study.slug} className="sm:col-span-2">
                  <CaseStudyCard study={study} cardSize="hero" showYear />
                </div>
              ) : (
                <FadeIn key={study.slug} delay={i * 0.08} className="sm:col-span-2">
                  <CaseStudyCard study={study} cardSize="hero" showYear />
                </FadeIn>
              )
            )}
          </motion.div>
        ) : (
          <motion.div
            key="list-view"
            initial={{ opacity: 0, filter: "blur(4px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, filter: "blur(4px)" }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
          >
            {studies.map((study, i) => (
              <CaseStudyListRow key={study.slug} study={study} showYear={true} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

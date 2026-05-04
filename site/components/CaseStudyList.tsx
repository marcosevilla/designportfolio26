"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import type { CaseStudyMeta } from "@/lib/types";
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

      {/* Gallery card list — one card per study. Locked studies (per
          lib/locked-content) render with the LockGate hover treatment
          and route clicks to the unlock modal; unlocked clicks open the
          fullscreen gallery starting at that project. */}
      <GalleryCardList
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
    <div className="mt-8 flex flex-col gap-24">
      {studies.map((study) => {
        const locked = isLocked(study.slug);
        return (
          <LockGate key={study.slug} mode="card" locked={locked}>
            <GalleryCard study={study} onOpen={() => onOpen(study.slug)} locked={locked} />
          </LockGate>
        );
      })}
    </div>
  );
}

// Card surface fill — theme-aware via --color-card-bg defined in
// globals.css (#fafafa light, #141414 dark). Lifestyle/photographic
// `layers.bg` images are intentionally not rendered (see below); the
// `layers.ui` overlay, standalone UI screenshots, and product videos
// still render on top of this fill.
const CARD_BG = "var(--color-card-bg)";

// Slugs hidden from the homepage gallery (in-flight content / not
// ready to show). Removing a slug from this set re-enables the card
// without touching anywhere else.
const HIDDEN_SLUGS = new Set<string>(["upsells"]);

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

function GalleryCard({
  study,
  onOpen,
  locked = false,
}: {
  study: CaseStudyMeta;
  onOpen: () => void;
  locked?: boolean;
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
  const fit = item && typeof item === "object" && "src" in item ? (item.fit ?? "contain") : "contain";
  const objectPosition = item && typeof item === "object" && "src" in item ? (item.objectPosition ?? "center") : "center";
  const frameAspect = video?.aspect ?? "16 / 10";

  // Scroll-driven reveal. progress = 0 when the card's top edge is at the
  // viewport bottom; = 1 when the card's bottom edge has scrolled past the
  // viewport top. Center of the card sits at progress ≈ 0.5.
  //
  //   - imageScale: stays at 1 across the entry zone (progress 0 → 0.18)
  //     so a card that's only peeking at the bottom of the viewport on
  //     initial load doesn't already start scaling up. Climbs to peakScale
  //     by 0.5 (centered), holds peak across 0.5 → 0.6 to give the imagery
  //     a beat at full size, then settles back to 1 by 0.82.
  //   - textOpacity: hidden until the card is roughly 30% through its
  //     range, fully visible by 55%, then locked at 1 so the caption reads
  //     as "the card has arrived" instead of re-fading on scroll-past.
  //
  // peakScale is viewport-aware — a gentle 1.15× on desktop (subtle
  // breathing on scroll, not a wow-zoom), dialed back to 1.06× on narrow
  // viewports so the scaled image doesn't overflow past a phone screen.
  const cardRef = useRef<HTMLButtonElement>(null);
  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ["start end", "end start"],
  });
  const [isDesktop, setIsDesktop] = useState(true);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(min-width: 1024px)");
    setIsDesktop(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  const peakScale = isDesktop ? 1.15 : 1.06;

  // Resolve the card's bg to either a brand tint (if the slug is in
  // CARD_TINTS) or the neutral fallback. color-mix produces the same
  // computed hue against light and dark `--color-card-bg`, so the tint
  // adapts to the theme automatically.
  const tint = CARD_TINTS[study.slug];
  const cardBg = tint
    ? `color-mix(in srgb, ${tint} ${CARD_TINT_AMOUNT}%, ${CARD_BG})`
    : CARD_BG;
  const imageScale = useTransform(
    scrollYProgress,
    [0, 0.18, 0.5, 0.6, 0.82, 1],
    [1, 1, peakScale, peakScale, 1, 1]
  );
  const textOpacity = useTransform(scrollYProgress, [0.3, 0.55, 1], [0, 1, 1]);

  return (
    <button
      ref={cardRef}
      type="button"
      onClick={onOpen}
      aria-label={`Open project gallery — ${study.title}`}
      className="block w-full cursor-pointer text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-(--color-accent) rounded-lg"
    >
      {/* Card group — frame + caption scale together via imageScale,
          so the title/year row stays pinned to the bottom of the card
          and rides the same scroll-driven scale as the imagery.
          `will-change: transform` is intentionally NOT set: forcing the
          wrapper into its own permanent compositor layer caused the
          browser to rasterize the imagery once at 1× DPR and then
          bilinearly upscale on every scaled frame, which read as
          softness on the photos / video. Letting the browser manage
          layer promotion per-frame trades a tiny bit of scroll perf
          for noticeably crisper imagery during the scale animation. */}
      <motion.div
        style={{
          scale: imageScale,
        }}
      >
        {/* Image frame — no border, no drop shadow. The card sits flat
            on the page bg, with the per-slug accent tint (cardBg) doing
            the visual lifting instead of a chrome shadow. The composite
            INSIDE the frame still casts its own filter: drop-shadow via
            uiShadow (see gallery-content), which is the only shadow on
            these cards now. */}
        <div
          className="w-full rounded-lg overflow-hidden relative"
          style={{
            aspectRatio: frameAspect,
            backgroundColor: cardBg,
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
        {/* Hotel-imagery cards: intentionally skip the lifestyle photo
            (layers.bg) and render only the UI mockup overlay (layers.ui)
            on the solid card fill. The bg asset is still referenced in
            galleryContent so we can re-enable it later by un-commenting
            the bg <img> block.
            Shadow uses `filter: drop-shadow(...)` instead of box-shadow
            so it traces the composite's actual alpha shape — box-shadow
            traces the <img>'s rectangular box (including any transparent
            padding in the PNG), which read as a phantom fill rectangle
            around the composite. */}
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
              width: layers.uiWidth ?? "auto",
              height: layers.uiHeight ?? "auto",
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
        <LockedFrameBadge locked={locked} />
        {!layers && !image && !video && (
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
        {/* Caption row — sits flush below the image frame and lives
            INSIDE the scaling wrapper above, so the title + year ride
            the same imageScale transform as the imagery. Pinned to the
            bottom of the card, scales 1:1 with the frame. Opacity is
            driven independently by textOpacity so the row fades in as
            the card reaches the middle of the viewport. */}
        <motion.div
          className="mt-4 flex items-baseline justify-between gap-4"
          style={{ opacity: textOpacity }}
        >
          {/* Title styled to match the Playground card titles — Geist
              sans, 16px / 500, slight negative tracking. Matching the
              playground keeps the two homepage galleries reading as one
              type system. */}
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
        </motion.div>
      </motion.div>
      {/* Description rendering disabled per the caption-row redesign —
          the description copy still lives on `study.description` (sourced
          from the case-study MDX frontmatter / studies metadata) so we
          can re-introduce it later without rewriting any data. */}
    </button>
  );
}

"use client";

import { useRef, useState, useCallback } from "react";
import Link from "next/link";
import type { CaseStudyMeta } from "@/lib/types";
import FBCardPreview from "./fb-showcase/FBCardPreview";

export type CardSize = "hero" | "large" | "medium" | "standard" | "wide";

const ASPECT_RATIOS: Record<CardSize, string> = {
  hero: "16 / 9",
  large: "4 / 3",
  medium: "3 / 2",
  standard: "3 / 2",
  wide: "3 / 1",
};

const TITLE_SIZES: Record<CardSize, string> = {
  hero: "calc(18px + var(--font-size-offset))",
  large: "calc(18px + var(--font-size-offset))",
  medium: "calc(18px + var(--font-size-offset))",
  standard: "calc(18px + var(--font-size-offset))",
  wide: "calc(18px + var(--font-size-offset))",
};

const SUBTITLE_SIZES: Record<CardSize, string> = {
  hero: "calc(15px + var(--font-size-offset))",
  large: "calc(14px + var(--font-size-offset))",
  medium: "calc(14px + var(--font-size-offset))",
  standard: "calc(14px + var(--font-size-offset))",
  wide: "calc(14px + var(--font-size-offset))",
};

interface CaseStudyCardProps {
  study: CaseStudyMeta;
  cardSize?: CardSize;
  showYear?: boolean;
}

export default function CaseStudyCard({ study, cardSize = "standard", showYear = false }: CaseStudyCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty("--mouse-x", `${e.clientX - rect.left}px`);
    el.style.setProperty("--mouse-y", `${e.clientY - rect.top}px`);
  }, []);

  const handleMouseEnter = useCallback((e: React.MouseEvent) => {
    setIsHovered(true);
    cardRef.current?.classList.add("bento-card--hover");
    handleMouseMove(e);
  }, [handleMouseMove]);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    cardRef.current?.classList.remove("bento-card--hover");
  }, []);

  return (
    <div
      ref={cardRef}
      className="relative group bento-card"
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Link
        href={`/work/${study.slug}`}
        className="block w-full text-left relative overflow-hidden cursor-pointer rounded-none bg-[var(--color-surface-raised)] shadow-[0_12px_40px_rgba(0,0,0,0.03),0_4px_16px_rgba(0,0,0,0.02)]"
        style={{ aspectRatio: ASPECT_RATIOS[cardSize] }}
      >
        {/* Content */}
        <div className="relative z-10 flex flex-col h-full" style={{ padding: "20px" }}>
          <div>
            {showYear && (
              <span
                className="block mb-2"
                style={{
                  fontSize: "11px",
                  color: "var(--color-fg-tertiary)",
                }}
              >
                {study.year}
              </span>
            )}
            <h3
              className="leading-tight tracking-tight"
              style={{
                fontWeight: 500,
                fontSize: TITLE_SIZES[cardSize],
                color: "var(--color-fg)",
              }}
            >
              {study.title}
            </h3>
            <p
              className="mt-1.5"
              style={{
                fontSize: SUBTITLE_SIZES[cardSize],
                lineHeight: 1.5,
                color: "var(--color-fg-secondary)",
              }}
            >
              {study.subtitle}
            </p>
          </div>

          <div className="flex-1" />
        </div>

        {/* F&B dashboard screenshot */}
        {study.slug === "fb-ordering" && <FBCardPreview />}

        {/* Default border */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            border: "1px solid var(--color-border)",
            opacity: 0.5,
          }}
        />

        {/* Mouse-tracking accent border glow (desktop only) */}
        <div
          className="absolute inset-0 pointer-events-none hidden sm:block transition-opacity duration-200"
          style={{
            background: `radial-gradient(200px circle at var(--mouse-x, 0px) var(--mouse-y, 0px), var(--color-accent), transparent 70%)`,
            mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
            maskComposite: "exclude",
            WebkitMaskComposite: "xor" as any,
            padding: "1px",
            opacity: isHovered ? 1 : 0,
          }}
        />

        {/* Mouse-tracking inner glow (desktop only) */}
        <div
          className="absolute inset-0 pointer-events-none hidden sm:block transition-opacity duration-200"
          style={{
            background: `radial-gradient(200px circle at var(--mouse-x, 0px) var(--mouse-y, 0px), var(--color-accent), transparent 70%)`,
            opacity: isHovered ? 0.05 : 0,
          }}
        />
      </Link>
    </div>
  );
}

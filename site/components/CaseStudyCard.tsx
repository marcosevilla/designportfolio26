"use client";

import { useRef, useState, useCallback } from "react";
import Link from "next/link";
import type { CaseStudyMeta } from "@/lib/types";
import FBCardPreview from "./fb-showcase/FBCardPreview";

export type CardSize = "hero" | "large" | "medium" | "standard" | "wide";

export interface PreviewDialParams {
  dashX: number; dashY: number;
  dashHoverX: number; dashHoverY: number;
  dashTransitionMs: number; dashPadding: number;
  phoneLeft: number; phoneBottom: number; phoneWidth: number;
  phoneHoverY: number; phoneOpacity: number; phoneHoverOpacity: number;
  tintStrength: number; crossfadeMs: number;
}

export interface CardDialParams {
  default: { opacity: number; scale: number; borderRadius: number; padding: number };
  hover: { scale: number; opacity: number; transitionMs: number };
  shadow: { offsetY: number; blur: number; opacity: number };
  hoverShadow: { offsetY: number; blur: number; opacity: number };
  glow: { radius: number; borderOpacity: number; innerOpacity: number; falloff: number };
  gridOpacity: number;
  gridSize: number;
  borderOpacity: number;
  preview?: PreviewDialParams;
}

const DEFAULT_PARAMS: CardDialParams = {
  default: { opacity: 1, scale: 1, borderRadius: 0, padding: 20 },
  hover: { scale: 1.01, opacity: 1, transitionMs: 700 },
  shadow: { offsetY: 8, blur: 13, opacity: 0.01 },
  hoverShadow: { offsetY: 11, blur: 19, opacity: 0.08 },
  glow: { radius: 250, borderOpacity: 1, innerOpacity: 0.1, falloff: 70 },
  gridOpacity: 0.4,
  gridSize: 14,
  borderOpacity: 0.54,
};

const ASPECT_RATIOS: Record<CardSize, string> = {
  hero: "16 / 9",
  large: "4 / 3",
  medium: "3 / 2",
  standard: "3 / 2",
  wide: "3 / 1",
};

const TITLE_SIZES: Record<CardSize, string> = {
  hero: "calc(18px + var(--font-size-offset) + var(--font-pairing-boost))",
  large: "calc(18px + var(--font-size-offset) + var(--font-pairing-boost))",
  medium: "calc(18px + var(--font-size-offset) + var(--font-pairing-boost))",
  standard: "calc(18px + var(--font-size-offset) + var(--font-pairing-boost))",
  wide: "calc(18px + var(--font-size-offset) + var(--font-pairing-boost))",
};

const SUBTITLE_SIZES: Record<CardSize, string> = {
  hero: "calc(15px + var(--font-size-offset) + var(--font-pairing-boost))",
  large: "calc(14px + var(--font-size-offset) + var(--font-pairing-boost))",
  medium: "calc(14px + var(--font-size-offset) + var(--font-pairing-boost))",
  standard: "calc(14px + var(--font-size-offset) + var(--font-pairing-boost))",
  wide: "calc(14px + var(--font-size-offset) + var(--font-pairing-boost))",
};

interface CaseStudyCardProps {
  study: CaseStudyMeta;
  cardSize?: CardSize;
  showYear?: boolean;
  dialParams?: CardDialParams;
}

export default function CaseStudyCard({ study, cardSize = "standard", showYear = false, dialParams }: CaseStudyCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const p = dialParams ?? DEFAULT_PARAMS;

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty("--mouse-x", `${e.clientX - rect.left}px`);
    el.style.setProperty("--mouse-y", `${e.clientY - rect.top}px`);
  }, []);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
  }, []);

  // When using dials, drive everything inline; otherwise use CSS classes
  const useDials = !!dialParams;
  const currentScale = isHovered ? p.hover.scale : p.default.scale;
  const currentOpacity = isHovered ? p.hover.opacity : p.default.opacity;
  const currentShadow = isHovered
    ? `0 ${p.hoverShadow.offsetY}px ${p.hoverShadow.blur}px rgba(0,0,0,${p.hoverShadow.opacity})`
    : `0 ${p.shadow.offsetY}px ${p.shadow.blur}px rgba(0,0,0,${p.shadow.opacity})`;

  return (
    <div
      ref={cardRef}
      className={`relative group ${useDials ? "" : "bento-card"}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={(e) => {
        handleMouseEnter();
        if (!useDials) cardRef.current?.classList.add("bento-card--hover");
        handleMouseMove(e as unknown as React.MouseEvent);
      }}
      onMouseLeave={() => {
        handleMouseLeave();
        if (!useDials) cardRef.current?.classList.remove("bento-card--hover");
      }}
      style={useDials ? {
        transform: `scale(${currentScale})`,
        opacity: currentOpacity,
        transition: `transform ${p.hover.transitionMs}ms cubic-bezier(0.22, 1, 0.36, 1), opacity ${p.hover.transitionMs}ms ease, box-shadow ${p.hover.transitionMs}ms ease`,
        willChange: "transform",
      } : undefined}
    >
      <Link
        href={`/work/${study.slug}`}
        className={`block w-full text-left relative overflow-hidden cursor-pointer ${useDials ? "" : "rounded-none bg-[var(--color-surface-raised)] shadow-[0_12px_40px_rgba(0,0,0,0.03),0_4px_16px_rgba(0,0,0,0.02)]"}`}
        style={{
          aspectRatio: ASPECT_RATIOS[cardSize],
          ...(useDials ? {
            backgroundColor: "var(--color-surface-raised)",
            boxShadow: currentShadow,
            borderRadius: `${p.default.borderRadius}px`,
          } : {}),
        }}
      >
        {/* Dotted grid paper texture */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(var(--color-border) 1px, transparent 1px),
              linear-gradient(90deg, var(--color-border) 1px, transparent 1px)
            `,
            backgroundSize: useDials ? `${p.gridSize}px ${p.gridSize}px` : "16px 16px",
            opacity: useDials ? p.gridOpacity : 0.35,
            borderRadius: useDials ? `${p.default.borderRadius}px` : undefined,
          }}
        />

        {/* Content */}
        <div
          className="relative z-10 flex flex-col h-full"
          style={{ padding: useDials ? `${p.default.padding}px` : "20px" }}
        >
          <div>
              {showYear && (
                <span
                  className="block mb-2"
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "11px",
                    color: "var(--color-fg-tertiary)",
                    letterSpacing: "0.02em",
                  }}
                >
                  {study.year}
                </span>
              )}
              <h3
                className="leading-tight tracking-tight"
                style={{
                  fontFamily: "var(--font-mono)",
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
                  fontFamily: "var(--font-body)",
                  fontSize: SUBTITLE_SIZES[cardSize],
                  lineHeight: 1.5,
                  color: "var(--color-fg-secondary)",
                }}
              >
                {study.subtitle}
              </p>
          </div>

          {/* Future mockup slot */}
          <div className="flex-1" />
        </div>

        {/* F&B dashboard screenshot */}
        {study.slug === "fb-ordering" && <FBCardPreview previewDials={p.preview} />}

        {/* Default border — always visible */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            border: "1px solid var(--color-border)",
            opacity: useDials ? p.borderOpacity : 0.5,
            borderRadius: useDials ? `${p.default.borderRadius}px` : "0px",
          }}
        />

        {/* Mouse-tracking accent border glow (desktop only) */}
        <div
          className="absolute inset-0 pointer-events-none hidden sm:block transition-opacity duration-200"
          style={{
            background: `radial-gradient(${useDials ? p.glow.radius : 200}px circle at var(--mouse-x, 0px) var(--mouse-y, 0px), var(--color-accent), transparent ${useDials ? p.glow.falloff : 70}%)`,
            mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
            maskComposite: "exclude",
            WebkitMaskComposite: "xor" as any,
            padding: "1px",
            borderRadius: useDials ? `${p.default.borderRadius}px` : "0px",
            opacity: isHovered ? (useDials ? p.glow.borderOpacity : 1) : 0,
          }}
        />

        {/* Mouse-tracking inner glow (desktop only) */}
        <div
          className="absolute inset-0 pointer-events-none hidden sm:block transition-opacity duration-200"
          style={{
            background: `radial-gradient(${useDials ? p.glow.radius : 200}px circle at var(--mouse-x, 0px) var(--mouse-y, 0px), var(--color-accent), transparent ${useDials ? p.glow.falloff : 70}%)`,
            borderRadius: useDials ? `${p.default.borderRadius}px` : "0px",
            opacity: isHovered ? (useDials ? p.glow.innerOpacity : 0.05) : 0,
          }}
        />
      </Link>
    </div>
  );
}

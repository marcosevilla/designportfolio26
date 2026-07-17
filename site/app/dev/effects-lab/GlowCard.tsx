"use client";

// Restored from git 7b962c1 (CaseStudyCard.tsx, deleted in 30a84b3) for the
// /dev/effects-lab preview. The cursor-tracking rim-glow + inner glow are
// intact; the case-study data, Link, and FBCardPreview deps are stripped so
// the lab can render standalone sample cards with tunable glow params.

import { useRef, useState, useCallback } from "react";

export interface GlowParams {
  radius: number;
  rimOpacity: number;
  innerOpacity: number;
  falloff: number;
  hoverScale: number;
}

// Defaults mirror the values applied to the live site 2026-07-17
// (components/CursorGlowOverlay.tsx) — keep the two in sync.
export const DEFAULT_GLOW_PARAMS: GlowParams = {
  radius: 170,
  rimOpacity: 0.55,
  innerOpacity: 0.04,
  falloff: 55,
  hoverScale: 1.005,
};

interface GlowCardProps {
  title: string;
  subtitle: string;
  year?: string;
  params: GlowParams;
}

export default function GlowCard({ title, subtitle, year, params }: GlowCardProps) {
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
    handleMouseMove(e);
  }, [handleMouseMove]);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
  }, []);

  const glowGradient = `radial-gradient(${params.radius}px circle at var(--mouse-x, 0px) var(--mouse-y, 0px), var(--color-accent), transparent ${params.falloff}%)`;

  return (
    <div
      ref={cardRef}
      className="relative group"
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: isHovered ? `scale(${params.hoverScale})` : "scale(1)",
        transition: "transform 350ms ease-out",
      }}
    >
      <div
        className="block w-full text-left relative overflow-hidden cursor-pointer rounded-none bg-surface-raised shadow-[0_12px_40px_rgba(0,0,0,0.03),0_4px_16px_rgba(0,0,0,0.02)]"
        style={{ aspectRatio: "3 / 2" }}
      >
        {/* Content */}
        <div className="relative z-10 flex flex-col h-full" style={{ padding: "20px" }}>
          <div>
            {year && (
              <span
                className="block mb-2"
                style={{
                  fontSize: "11px",
                  color: "var(--color-fg-tertiary)",
                }}
              >
                {year}
              </span>
            )}
            <h3
              className="leading-tight tracking-tight"
              style={{
                fontWeight: 500,
                fontSize: "calc(18px + var(--font-size-offset))",
                color: "var(--color-fg)",
              }}
            >
              {title}
            </h3>
            <p
              className="mt-1.5"
              style={{
                fontSize: "calc(14px + var(--font-size-offset))",
                lineHeight: 1.5,
                color: "var(--color-fg-secondary)",
              }}
            >
              {subtitle}
            </p>
          </div>

          <div className="flex-1" />
        </div>

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
            background: glowGradient,
            mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
            maskComposite: "exclude",
            WebkitMaskComposite: "xor",
            padding: "1px",
            opacity: isHovered ? params.rimOpacity : 0,
          }}
        />

        {/* Mouse-tracking inner glow (desktop only) */}
        <div
          className="absolute inset-0 pointer-events-none hidden sm:block transition-opacity duration-200"
          style={{
            background: glowGradient,
            opacity: isHovered ? params.innerOpacity : 0,
          }}
        />
      </div>
    </div>
  );
}

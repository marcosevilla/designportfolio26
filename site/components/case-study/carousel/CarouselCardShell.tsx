"use client";

import type { ReactNode } from "react";
import type { CaseStudyMeta } from "@/lib/types";

interface CarouselCardShellProps {
  study: CaseStudyMeta;
  children?: ReactNode;
  isActive: boolean;
  onClick: () => void;
  /** Optional override for the auto-rendered gradient layer */
  hideGradient?: boolean;
  isExpanding?: boolean;
}

const FALLBACK_GRADIENT = "linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%)";

export default function CarouselCardShell({
  study,
  children,
  isActive,
  onClick,
  hideGradient = false,
  isExpanding = false,
}: CarouselCardShellProps) {
  const gradient = study.gradient ?? FALLBACK_GRADIENT;
  const company = study.company ?? "";
  const role = study.role ?? "";
  const meta = [company, role].filter(Boolean).join(" · ");

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Open ${study.title}`}
      aria-current={isActive ? "true" : undefined}
      className="relative block overflow-hidden text-left focus-visible:outline-solid focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-(--color-accent)"
      style={{
        // Default desktop dimensions; mobile override comes from carousel container
        width: "var(--carousel-card-w, 320px)",
        height: "var(--carousel-card-h, 420px)",
        borderRadius: 0,
        border: "1px solid var(--color-border)",
        background: "var(--color-surface-raised)",
        boxShadow: isActive ? "inset 0 0 0 1px var(--color-accent)" : "none",
        cursor: "pointer",
      }}
    >
      {/* 1. Gradient background (bottom layer) */}
      {!hideGradient && (
        <div
          aria-hidden
          className="absolute inset-0"
          style={{ background: gradient }}
        />
      )}

      {/* 2. Custom background composition (per-study children) */}
      {children}

      {/* 3. Auto scrim (above bg, below typography) */}
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0"
        style={{
          height: "55%",
          background:
            "linear-gradient(to top, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.25) 50%, transparent 100%)",
          opacity: isExpanding ? 0 : 1,
          transition: "opacity 150ms ease-out",
        }}
      />

      {/* 4. Typography block (always on top) */}
      <div
        className="absolute bottom-0 left-0 right-0"
        style={{
          padding: "20px",
          opacity: isExpanding ? 0 : 1,
          transition: "opacity 150ms ease-out",
        }}
      >
        <div
          style={{
            fontFamily: "ui-monospace, Menlo, Monaco, monospace",
            fontSize: "11px",
            color: "rgba(255,255,255,0.6)",
            marginBottom: "6px",
          }}
        >
          {study.year}
        </div>
        <div
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "18px",
            fontWeight: 500,
            color: "#fff",
            letterSpacing: "-0.01em",
            lineHeight: 1.25,
          }}
        >
          {study.title}
        </div>
        {meta && (
          <div
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "12px",
              fontWeight: 400,
              color: "rgba(255,255,255,0.7)",
              marginTop: "4px",
            }}
          >
            {meta}
          </div>
        )}
      </div>
    </button>
  );
}

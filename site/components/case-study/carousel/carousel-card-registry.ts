import type { ComponentType } from "react";
import type { CaseStudyMeta } from "@/lib/types";

export interface CarouselCardProps {
  study: CaseStudyMeta;
  isActive: boolean;
  onClick: () => void;
}

/**
 * Maps case study slug → custom carousel card component.
 * Studies without a registered component fall back to <CarouselCardShell> with no children
 * (shell auto-renders the gradient from study.gradient).
 */
export const CAROUSEL_CARDS: Record<string, ComponentType<CarouselCardProps>> = {};

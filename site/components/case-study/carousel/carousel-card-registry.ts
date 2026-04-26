import type { ComponentType } from "react";
import type { CaseStudyMeta } from "@/lib/types";
import FBOrderingCarouselCard from "./FBOrderingCarouselCard";

export interface CarouselCardProps {
  study: CaseStudyMeta;
  isActive: boolean;
  onClick: () => void;
}

export const CAROUSEL_CARDS: Record<string, ComponentType<CarouselCardProps>> = {
  "fb-ordering": FBOrderingCarouselCard,
};

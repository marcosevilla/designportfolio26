import type { ComponentType } from "react";
import type { CaseStudyMeta } from "@/lib/types";
import FBOrderingCarouselCard from "./FBOrderingCarouselCard";
import CompendiumCarouselCard from "./CompendiumCarouselCard";
import UpsellsCarouselCard from "./UpsellsCarouselCard";
import CheckinCarouselCard from "./CheckinCarouselCard";
import GeneralTaskCarouselCard from "./GeneralTaskCarouselCard";
import DesignSystemCarouselCard from "./DesignSystemCarouselCard";
import AIWorkflowCarouselCard from "./AIWorkflowCarouselCard";

export interface CarouselCardProps {
  study: CaseStudyMeta;
  isActive: boolean;
  onClick: () => void;
}

export const CAROUSEL_CARDS: Record<string, ComponentType<CarouselCardProps>> = {
  "fb-ordering": FBOrderingCarouselCard,
  "compendium": CompendiumCarouselCard,
  "upsells": UpsellsCarouselCard,
  "checkin": CheckinCarouselCard,
  "general-task": GeneralTaskCarouselCard,
  "design-system": DesignSystemCarouselCard,
  "ai-workflow": AIWorkflowCarouselCard,
};

"use client";

import { CAROUSEL_CARDS, type CarouselCardProps } from "./case-study/carousel/carousel-card-registry";
import CarouselCardShell from "./case-study/carousel/CarouselCardShell";
import type { CaseStudyMeta } from "@/lib/types";

interface CaseStudyCarouselProps {
  studies: CaseStudyMeta[];
}

const CARD_W = 320;
const CARD_H = 420;
const GAP = 24;

export default function CaseStudyCarousel({ studies }: CaseStudyCarouselProps) {
  const handleCardClick = (slug: string) => {
    // wired up in Task 17 (useExpandAndNavigate)
    console.log("clicked", slug);
  };

  return (
    <div
      className="relative"
      style={{
        // Viewport-edge breakout — overrides the parent column width
        marginLeft: "calc(-50vw + 50%)",
        marginRight: "calc(-50vw + 50%)",
        // Set CSS vars consumed by CarouselCardShell
        ["--carousel-card-w" as string]: `${CARD_W}px`,
        ["--carousel-card-h" as string]: `${CARD_H}px`,
      }}
    >
      <div
        className="flex justify-center"
        style={{ gap: `${GAP}px`, padding: "32px 0" }}
      >
        {studies.map((study, i) => {
          const Custom = CAROUSEL_CARDS[study.slug];
          const cardProps: CarouselCardProps = {
            study,
            isActive: i === 0,
            onClick: () => handleCardClick(study.slug),
          };
          return Custom ? (
            <Custom key={study.slug} {...cardProps} />
          ) : (
            <CarouselCardShell key={study.slug} {...cardProps} />
          );
        })}
      </div>
    </div>
  );
}

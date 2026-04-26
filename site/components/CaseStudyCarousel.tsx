"use client";

import { useState } from "react";
import { motion, useMotionValue, useTransform, useMotionValueEvent } from "framer-motion";
import { CAROUSEL_CARDS, type CarouselCardProps } from "./case-study/carousel/carousel-card-registry";
import CarouselCardShell from "./case-study/carousel/CarouselCardShell";
import type { CaseStudyMeta } from "@/lib/types";

interface CaseStudyCarouselProps {
  studies: CaseStudyMeta[];
}

const CARD_W = 320;
const CARD_H = 420;
const GAP = 24;
const SPREAD = CARD_W + GAP; // 344

export default function CaseStudyCarousel({ studies }: CaseStudyCarouselProps) {
  const offsetX = useMotionValue(0);
  const [activeIndex, setActiveIndex] = useState(0);

  useMotionValueEvent(offsetX, "change", (v) => {
    const idx = Math.max(0, Math.min(studies.length - 1, Math.round(-v / SPREAD)));
    if (idx !== activeIndex) setActiveIndex(idx);
  });

  const handleCardClick = (slug: string) => {
    console.log("clicked", slug); // wired in Task 17
  };

  return (
    <div
      className="relative"
      style={{
        marginLeft: "calc(-50vw + 50%)",
        marginRight: "calc(-50vw + 50%)",
        height: `${CARD_H + 64}px`,
        ["--carousel-card-w" as string]: `${CARD_W}px`,
        ["--carousel-card-h" as string]: `${CARD_H}px`,
      }}
    >
      <div className="absolute inset-0">
        {studies.map((study, i) => {
          // eslint-disable-next-line react-hooks/rules-of-hooks
          const x = useTransform(offsetX, (v) => v + i * SPREAD);
          const Custom = CAROUSEL_CARDS[study.slug];
          const cardProps: CarouselCardProps = {
            study,
            isActive: i === activeIndex,
            onClick: () => handleCardClick(study.slug),
          };
          const Card = Custom ?? CarouselCardShell;

          return (
            <motion.div
              key={study.slug}
              className="absolute"
              style={{
                left: "50%",
                top: "50%",
                x,
                translateX: `-${CARD_W / 2}px`,
                translateY: `-${CARD_H / 2}px`,
              }}
            >
              <Card {...cardProps} />
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

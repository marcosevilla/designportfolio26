"use client";

import { useRef, useState } from "react";
import { motion, useMotionValue, useTransform, useMotionValueEvent, animate, type PanInfo, type AnimationPlaybackControls } from "framer-motion";
import { CAROUSEL_CARDS, type CarouselCardProps } from "./case-study/carousel/carousel-card-registry";
import CarouselCardShell from "./case-study/carousel/CarouselCardShell";
import type { CaseStudyMeta } from "@/lib/types";

interface CaseStudyCarouselProps {
  studies: CaseStudyMeta[];
}

const CARD_W = 320;
const CARD_H = 420;
const GAP = 24;
const SPREAD = CARD_W + GAP;
const RUBBER_BAND = 0.15;
const VELOCITY_FACTOR = 0.3;
const SETTLE_SPRING = { type: "spring" as const, stiffness: 180, damping: 18, mass: 1 };

export default function CaseStudyCarousel({ studies }: CaseStudyCarouselProps) {
  const offsetX = useMotionValue(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const animRef = useRef<AnimationPlaybackControls | null>(null);
  const panStartOffsetRef = useRef(0);

  const minOffset = -(studies.length - 1) * SPREAD;
  const maxOffset = 0;

  useMotionValueEvent(offsetX, "change", (v) => {
    const idx = Math.max(0, Math.min(studies.length - 1, Math.round(-v / SPREAD)));
    if (idx !== activeIndex) setActiveIndex(idx);
  });

  const settleTo = (index: number) => {
    const clamped = Math.max(0, Math.min(studies.length - 1, index));
    animRef.current?.stop();
    animRef.current = animate(offsetX, -clamped * SPREAD, SETTLE_SPRING);
  };

  const onPanStart = () => {
    animRef.current?.stop();
    panStartOffsetRef.current = offsetX.get();
  };

  const onPan = (_e: PointerEvent, info: PanInfo) => {
    let raw = panStartOffsetRef.current + info.offset.x;
    if (raw > maxOffset) {
      const overshoot = raw - maxOffset;
      raw = maxOffset + overshoot * RUBBER_BAND;
    } else if (raw < minOffset) {
      const overshoot = raw - minOffset;
      raw = minOffset + overshoot * RUBBER_BAND;
    }
    offsetX.set(raw);
  };

  const onPanEnd = (_e: PointerEvent, info: PanInfo) => {
    const projected = offsetX.get() + info.velocity.x * VELOCITY_FACTOR;
    const clamped = Math.max(minOffset, Math.min(maxOffset, projected));
    const snapIndex = Math.round(-clamped / SPREAD);
    settleTo(snapIndex);
  };

  const handleCardClick = (slug: string) => {
    console.log("clicked", slug);
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
      <motion.div
        className="absolute inset-0"
        style={{ touchAction: "pan-y" }}
        onPanStart={onPanStart}
        onPan={onPan}
        onPanEnd={onPanEnd}
      >
        {studies.map((study, i) => {
          // eslint-disable-next-line react-hooks/rules-of-hooks
          const x = useTransform(offsetX, (v) => v + i * SPREAD);
          // eslint-disable-next-line react-hooks/rules-of-hooks
          const scale = useTransform(x, [-SPREAD * 2, -SPREAD, 0, SPREAD, SPREAD * 2], [0.85, 0.92, 1.0, 0.92, 0.85]);
          // eslint-disable-next-line react-hooks/rules-of-hooks
          const opacity = useTransform(x, [-SPREAD * 2, -SPREAD, 0, SPREAD, SPREAD * 2], [0.4, 0.7, 1.0, 0.7, 0.4]);
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
                scale,
                opacity,
                translateX: `-${CARD_W / 2}px`,
                translateY: `-${CARD_H / 2}px`,
                zIndex: i === activeIndex ? 10 : 5 - Math.abs(i - activeIndex),
              }}
            >
              <Card {...cardProps} />
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}

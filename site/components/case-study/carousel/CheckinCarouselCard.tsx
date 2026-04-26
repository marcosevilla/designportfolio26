"use client";

import CarouselCardShell from "./CarouselCardShell";
import type { CarouselCardProps } from "./carousel-card-registry";

export default function CheckinCarouselCard(props: CarouselCardProps) {
  return (
    <CarouselCardShell {...props}>
      {/* Author space: drop screenshots, illustrations, color overlays here.
          Shell auto-renders the gradient (from study.gradient) below this. */}
    </CarouselCardShell>
  );
}

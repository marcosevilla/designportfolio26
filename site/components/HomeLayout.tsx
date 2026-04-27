"use client";

import Hero from "./Hero";
import LedMatrix from "./LedMatrix";
import PlayerPanel from "./music/PlayerPanel";
import VisualizerSceneToggle from "./music/VisualizerSceneToggle";

export default function HomeLayout({
  work,
  marquee,
}: {
  work: React.ReactNode;
  marquee: React.ReactNode;
}) {
  // Matrix area = the LED matrix with the floating player panel + scene
  // toggle row above it. Passed into Hero as a slot so Hero renders:
  //   sticky header → matrix area → bio → work
  // This keeps the name + actions pinned at the very top of the viewport.
  const matrixArea = (
    <div className="relative">
      <div className="absolute left-0 right-0 bottom-full flex items-end gap-4 pb-3">
        <div className="flex-1 min-w-0">
          <PlayerPanel />
        </div>
        <VisualizerSceneToggle />
      </div>
      <LedMatrix />
    </div>
  );

  return (
    <div>
      <div className="max-w-[550px] mx-auto px-4 sm:px-8">
        <Hero matrix={matrixArea}>
          <section className="mt-12" id="work">
            {work}
          </section>
        </Hero>
      </div>
      {marquee}
    </div>
  );
}

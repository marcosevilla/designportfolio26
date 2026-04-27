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
  return (
    <div className="pt-24 lg:pt-[18vh]">
      <div className="max-w-[550px] mx-auto px-4 sm:px-8">
        <div className="relative">
          {/* Floating panel — sits just above the matrix without displacing it */}
          <div className="absolute left-0 right-0 bottom-full">
            <PlayerPanel />
          </div>
          <LedMatrix />
        </div>
        <div className="mt-3 mb-8">
          <VisualizerSceneToggle />
        </div>
        <Hero>
          <section className="mt-12" id="work">
            {work}
          </section>
        </Hero>
      </div>
      {marquee}
    </div>
  );
}

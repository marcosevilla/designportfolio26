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
          {/* Floating row above the matrix — player panel on the left, scene
              toggle on the right. Both share the same baseline so when the
              panel opens its controls sit inline with the toggle. */}
          <div className="absolute left-0 right-0 bottom-full flex items-end gap-4 pb-3">
            <div className="flex-1 min-w-0">
              <PlayerPanel />
            </div>
            <VisualizerSceneToggle />
          </div>
          <LedMatrix />
        </div>
        <div className="mb-8" />
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

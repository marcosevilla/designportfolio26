"use client";

import { motion, AnimatePresence } from "framer-motion";
import Hero from "./Hero";
import HomeNav from "./HomeNav";
import LedMatrix from "./LedMatrix";
import LedMatrixUI from "./music/LedMatrixUI";
import PlayerPanel from "./music/PlayerPanel";
import VisualizerSceneToggle from "./music/VisualizerSceneToggle";
import { useAudioPlayer } from "@/lib/AudioPlayerContext";

// Custom out-expo curve — a slow tail makes the slide feel like it's
// settling into place rather than snapping. Pairs well with the blur
// fade so the controls "develop" in the same beat as they slide.
const REVEAL_EASE = [0.22, 1, 0.36, 1] as const;

function MatrixArea() {
  const { panelOpen } = useAudioPlayer();
  return (
    <div>
      <AnimatePresence initial={false}>
        {panelOpen && (
          <motion.div
            key="player-row"
            initial={{ height: 0, opacity: 0, y: -12, filter: "blur(10px)" }}
            animate={{
              height: "auto",
              opacity: 1,
              y: 0,
              filter: "blur(0px)",
              transition: {
                height: { duration: 0.45, ease: REVEAL_EASE },
                opacity: { duration: 0.4, ease: REVEAL_EASE, delay: 0.05 },
                y: { duration: 0.5, ease: REVEAL_EASE },
                filter: { duration: 0.45, ease: REVEAL_EASE, delay: 0.05 },
              },
            }}
            exit={{
              height: 0,
              opacity: 0,
              y: -12,
              filter: "blur(10px)",
              transition: {
                height: { duration: 0.35, ease: REVEAL_EASE, delay: 0.05 },
                opacity: { duration: 0.25, ease: REVEAL_EASE },
                y: { duration: 0.35, ease: REVEAL_EASE },
                filter: { duration: 0.3, ease: REVEAL_EASE },
              },
            }}
            style={{ overflow: "hidden", willChange: "filter, transform, opacity" }}
          >
            <div className="pb-4 flex items-end gap-4">
              <div className="flex-1 min-w-0">
                <PlayerPanel />
              </div>
              <VisualizerSceneToggle />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="relative">
        <LedMatrix />
        <LedMatrixUI />
      </div>
    </div>
  );
}

export default function HomeLayout({
  work,
  marquee,
}: {
  work: React.ReactNode;
  marquee: React.ReactNode;
}) {

  return (
    <div id="home">
      <HomeNav />
      <div className="max-w-[550px] mx-auto px-4 sm:px-8 lg:pt-12">
        <Hero matrix={<MatrixArea />}>
          <section className="mt-12" id="work">
            {work}
          </section>
          <section className="mt-28" id="playground">
            {/* Placeholder for now — anchor target for the Playground nav item. */}
          </section>
        </Hero>
      </div>
      {marquee}
    </div>
  );
}

"use client";

import { motion } from "framer-motion";
import { PARAGRAPHS, HERO_NAME } from "@/lib/bio-content";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { typescale } from "@/lib/typography";
import { HighlightableBio } from "./HighlightableBio";
import { HighlighterProvider } from "./HighlighterContext";
import HeroToolbar from "./HeroToolbar";
import ConnectLinks from "./ConnectLinks";
import CyclingGreeting from "./CyclingGreeting";

const BLUR_EASE = [0.22, 1, 0.36, 1] as const;

export default function Hero({
  matrix,
  children,
}: {
  /** Optional render slot for the LED matrix area, placed between the
   *  sticky header and the bio so it sits *under* the pinned header. */
  matrix?: React.ReactNode;
  children?: React.ReactNode;
}) {
  const reducedMotion = usePrefersReducedMotion();
  const initial = reducedMotion ? false : { opacity: 0, filter: "blur(12px)" };
  const animate = { opacity: 1, filter: "blur(0px)" };
  const transition = { duration: 0.9, ease: BLUR_EASE };

  return (
    <>
      {/* Heading — sticky top bar on mobile only; lg+ uses HomeNav sidebar. */}
      <div className="lg:hidden sticky top-0 z-40 -mx-4 px-4 sm:-mx-8 sm:px-8 py-3 bg-(--color-bg)/90 backdrop-blur-xs">
        <motion.h1
          style={{ ...typescale.body, fontFamily: "var(--font-fraunces), serif", fontStyle: "italic", fontWeight: 500 }}
          initial={initial}
          animate={animate}
          transition={transition}
        >
          {HERO_NAME}
        </motion.h1>
      </div>

      <HighlighterProvider>
        {/* Toolbar — sits at the top of the hero column so the icon row
            aligns vertically with "Marco Sevilla" in the sidebar at lg+. */}
        <motion.div
          initial={initial}
          animate={animate}
          transition={transition}
        >
          <HeroToolbar />
        </motion.div>

        {/* LED matrix slot */}
        {matrix && (
          <motion.div
            className="mt-4"
            initial={initial}
            animate={animate}
            transition={transition}
          >
            {matrix}
          </motion.div>
        )}

        {/* Bio — all paragraphs visible at once */}
        <motion.div
          className="mt-16 text-(--color-fg-secondary) leading-[28px]"
          style={{ fontSize: "calc(14px + var(--font-size-offset))" }}
          initial={initial}
          animate={animate}
          transition={transition}
        >
          <CyclingGreeting />
          <HighlightableBio paragraphs={PARAGRAPHS} />
          <ConnectLinks />
        </motion.div>
      </HighlighterProvider>

      {children}
    </>
  );
}

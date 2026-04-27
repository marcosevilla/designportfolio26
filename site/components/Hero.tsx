"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useState, useEffect, useLayoutEffect, useRef, useCallback } from "react";
import { PARAGRAPHS, HERO_NAME } from "@/lib/bio-content";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { typescale } from "@/lib/typography";
import { RenderParagraph } from "./StreamingText";
import ScrambleText from "./ScrambleText";
import ScrambleParagraph from "./ScrambleParagraph";
import HeroActions from "./HeroActions";

const INTRO_LOADING_DELAY = 1800;

const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

type IntroPhase = "star" | "bio" | "done";

export default function Hero({ children }: { children?: React.ReactNode }) {
  const reducedMotion = usePrefersReducedMotion();
  const [introPhase, setIntroPhase] = useState<IntroPhase>("star");
  const introTimerRef = useRef<ReturnType<typeof setTimeout>>();

  const introDone = introPhase === "done";

  useIsomorphicLayoutEffect(() => {
    if (reducedMotion) {
      setIntroPhase("done");
    }
  }, [reducedMotion]);

  useEffect(() => {
    if (introPhase === "star") {
      introTimerRef.current = setTimeout(() => setIntroPhase("bio"), INTRO_LOADING_DELAY);
    }
    return () => {
      if (introTimerRef.current) clearTimeout(introTimerRef.current);
    };
  }, [introPhase]);

  const onBioIntroComplete = useCallback(() => {
    setIntroPhase("done");
  }, []);

  return (
    <>
      {/* Heading — static, body-sized, scrambles in on first visit */}
      <div className="sticky top-0 z-40 -mx-4 px-4 sm:-mx-8 sm:px-8 py-3 bg-[var(--color-bg)]/90 backdrop-blur-sm lg:relative lg:top-auto lg:z-auto lg:mx-0 lg:px-0 lg:py-0 lg:bg-transparent lg:backdrop-blur-none">
        <div className="flex items-center justify-between gap-6">
          <h1 style={{ ...typescale.body, fontWeight: 500 }}>
            <ScrambleText text={HERO_NAME} skip={introDone} />
          </h1>
          <div className="flex-shrink-0">
            <HeroActions />
          </div>
        </div>
      </div>

      {/* Intro loading star — blinks before bio scrambles in */}
      {introPhase === "star" && (
        <div className="mt-4">
          <span className="text-[var(--color-accent)] text-[16px] animate-[blink-cursor_1s_step-end_infinite]">
            ✸
          </span>
        </div>
      )}

      {/* Bio — short paragraph + link to /about */}
      {(introPhase === "bio" || introDone) && (
        <motion.div
          className="mt-8 text-[var(--color-fg-secondary)] leading-[28px]"
          style={{ fontSize: "calc(14px + var(--font-size-offset))" }}
          initial={false}
          animate={{ opacity: 1 }}
        >
          <p>
            {introPhase === "bio" ? (
              <ScrambleParagraph
                para={PARAGRAPHS[0]}
                onComplete={onBioIntroComplete}
                skip={reducedMotion}
                staggerMs={17}
                cycleMs={15}
                repeatDelayMs={20}
              />
            ) : (
              <RenderParagraph para={PARAGRAPHS[0]} />
            )}
          </p>
          {introDone && (
            <motion.p
              className="mt-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              <Link href="/about" className="dotted-link dotted-link--inline">
                More about me <span className="dotted-link-arrow">→</span>
              </Link>
            </motion.p>
          )}
        </motion.div>
      )}

      {children}
    </>
  );
}

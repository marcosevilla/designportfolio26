"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useLayoutEffect, useRef, useCallback } from "react";
import { PARAGRAPHS, PROMPTS, MAX_LEVEL, HERO_NAME } from "@/lib/bio-content";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { typescale } from "@/lib/typography";
import { RenderParagraph } from "./StreamingText";
import InlineExpandButton from "./InlineExpandButton";
import ScrambleText from "./ScrambleText";
import ScrambleParagraph from "./ScrambleParagraph";

const LOADING_DELAY = 1200;
const INTRO_LOADING_DELAY = 1800;

const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

type IntroPhase = "star" | "bio" | "done";

export default function Hero({ children }: { children?: React.ReactNode }) {
  const reducedMotion = usePrefersReducedMotion();
  const [introPhase, setIntroPhase] = useState<IntroPhase>("star");
  const [level, setLevel] = useState(1);
  const [animatingIdx, setAnimatingIdx] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const loadTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const introTimerRef = useRef<ReturnType<typeof setTimeout>>();

  const introDone = introPhase === "done";

  // Skip intro only when the user prefers reduced motion
  useIsomorphicLayoutEffect(() => {
    if (reducedMotion) {
      setIntroPhase("done");
    }
  }, [reducedMotion]);

  // Star blink → bio scramble
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

  const busy = animatingIdx !== null || loading;

  useEffect(() => {
    return () => {
      if (loadTimerRef.current) clearTimeout(loadTimerRef.current);
    };
  }, []);

  const expand = useCallback(() => {
    if (busy || level >= MAX_LEVEL) return;
    const newLevel = level + 1;

    if (reducedMotion) {
      setLevel(newLevel);
      return;
    }

    setLoading(true);
    loadTimerRef.current = setTimeout(() => {
      setLoading(false);
      setAnimatingIdx(newLevel - 1);
      setLevel(newLevel);
    }, LOADING_DELAY);
  }, [busy, level, reducedMotion]);

  const onStreamComplete = useCallback(() => {
    setAnimatingIdx(null);
  }, []);

  const visibleParaIndices = Array.from({ length: level }, (_, i) => i);

  return (
    <>
      {/* Heading — static, body-sized, scrambles in on first visit */}
      <div className="sticky top-14 z-40 -mx-4 px-4 sm:-mx-8 sm:px-8 py-3 bg-[var(--color-bg)]/90 backdrop-blur-sm lg:relative lg:top-auto lg:z-auto lg:mx-0 lg:px-0 lg:py-0 lg:bg-transparent lg:backdrop-blur-none">
        <h1 style={{ ...typescale.body, fontWeight: 400 }}>
          <ScrambleText text={HERO_NAME} skip={introDone} />
        </h1>
      </div>

      {/* Intro loading star — blinks before bio scrambles in */}
      {introPhase === "star" && (
        <div className="mt-4">
          <span className="text-[var(--color-accent)] text-[16px] animate-[blink-cursor_1s_step-end_infinite]">
            ✸
          </span>
        </div>
      )}

      {/* Bio section — visible once intro reaches bio phase */}
      {(introPhase === "bio" || introDone) && (
        <motion.div
          className="mt-8 text-[var(--color-fg-secondary)] leading-[28px]"
          style={{ fontSize: "calc(14px + var(--font-size-offset))" }}
          initial={false}
          animate={{ opacity: 1 }}
        >
          <AnimatePresence mode="sync">
            {visibleParaIndices.map((pIdx) => {
              const isLastVisible = pIdx === level - 1;
              const isStreaming = animatingIdx === pIdx;
              const isIntroStreaming = pIdx === 0 && introPhase === "bio";
              const showExpandButton = introDone && isLastVisible && !loading && animatingIdx === null && level < MAX_LEVEL;

              return (
                <motion.div
                  key={pIdx}
                  initial={pIdx === 0 ? false : { opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{
                    opacity: { duration: 0.3 },
                    height: { duration: 0.4, ease: "easeInOut" },
                  }}
                  style={{ overflow: "hidden" }}
                >
                  <p style={{ marginTop: pIdx === 0 ? 0 : "1.25rem" }}>
                    {isIntroStreaming ? (
                      <ScrambleParagraph para={PARAGRAPHS[0]} onComplete={onBioIntroComplete} skip={reducedMotion} />
                    ) : isStreaming ? (
                      <ScrambleParagraph para={PARAGRAPHS[pIdx]} onComplete={onStreamComplete} skip={reducedMotion} />
                    ) : (
                      <RenderParagraph para={PARAGRAPHS[pIdx]} />
                    )}
                    {showExpandButton && (
                      <InlineExpandButton
                        prompt={PROMPTS[level - 1]}
                        onClick={expand}
                        disabled={busy}
                      />
                    )}
                  </p>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* Loading star — on its own line where next paragraph will appear */}
          {loading && (
            <div className="mt-4">
              <span className="text-[var(--color-accent)] text-[16px] animate-[blink-cursor_1s_step-end_infinite]">
                ✸
              </span>
            </div>
          )}
        </motion.div>
      )}

      {/* Slot for content below bio (work section) */}
      {children}
    </>
  );
}

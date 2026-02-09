"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef, useCallback } from "react";
import { PARAGRAPHS, PROMPTS, MAX_LEVEL, HEADING_WORDS, HEADING_TEXT } from "@/lib/bio-content";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { typescale } from "@/lib/typography";
import { useIsMobile } from "@/hooks/useMediaQuery";
import { useDynamicBio } from "@/lib/dynamic-bio-store";
import { RenderParagraph, StreamingParagraph, StreamingWords } from "./StreamingText";
import InlineExpandButton from "./InlineExpandButton";
import { DynamicBioText } from "./dynamic-bio";

const LOADING_DELAY = 1200;
const INTRO_LOADING_DELAY = 1800;
const INTRO_STORAGE_KEY = "portfolio-intro-seen";

type IntroPhase = "star1" | "subtitle" | "star2" | "bio" | "done";

function hasSeenIntro(): boolean {
  try {
    return sessionStorage.getItem(INTRO_STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

function markIntroSeen() {
  try {
    sessionStorage.setItem(INTRO_STORAGE_KEY, "1");
  } catch {
    // ignore
  }
}

export default function Hero() {
  const reducedMotion = usePrefersReducedMotion();
  const isMobile = useIsMobile();
  const dynamicBio = useDynamicBio();
  const [introPhase, setIntroPhase] = useState<IntroPhase>("star1");
  const [level, setLevel] = useState(1);
  const [animatingIdx, setAnimatingIdx] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const loadTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const introTimerRef = useRef<ReturnType<typeof setTimeout>>();

  const introDone = introPhase === "done";

  // Show dynamic mode only on desktop and when enabled
  const showDynamicBio = dynamicBio.isDynamic && !isMobile && introDone;

  // Check sessionStorage + reduced motion on mount (client only)
  useEffect(() => {
    if (reducedMotion || hasSeenIntro()) {
      setIntroPhase("done");
    }
  }, [reducedMotion]);

  // Intro state machine
  useEffect(() => {
    if (introPhase === "star1") {
      introTimerRef.current = setTimeout(() => setIntroPhase("subtitle"), INTRO_LOADING_DELAY);
    } else if (introPhase === "star2") {
      introTimerRef.current = setTimeout(() => setIntroPhase("bio"), INTRO_LOADING_DELAY);
    }
    return () => {
      if (introTimerRef.current) clearTimeout(introTimerRef.current);
    };
  }, [introPhase]);

  // Mark intro as seen once it completes
  useEffect(() => {
    if (introDone) {
      markIntroSeen();
    }
  }, [introDone]);

  const onHeadingComplete = useCallback(() => {
    setIntroPhase("star2");
  }, []);

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
    <section className="flex items-start gap-3">
      {/* Star indicator — aligned with first line of heading, matches year label indent */}
      <span
        className="shrink-0 hidden lg:block text-[var(--color-accent)]"
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "20px",
          lineHeight: "36px",
          width: "26px",
          textAlign: "center",
        }}
      >
        ✸
      </span>

      <div className="flex-1 min-w-0">
        {/* Heading — streams in during intro, static after (hidden in dynamic bio mode) */}
        {!showDynamicBio && (
          <div className="sticky top-14 z-40 -mx-4 px-4 sm:-mx-8 sm:px-8 py-3 bg-[var(--color-bg)]/90 backdrop-blur-sm lg:relative lg:top-auto lg:z-auto lg:mx-0 lg:px-0 lg:py-0 lg:bg-transparent lg:backdrop-blur-none">
            <h1
              className="tracking-tight"
              style={typescale.display}
            >
              {introPhase === "subtitle" ? (
                <StreamingWords words={HEADING_WORDS} onComplete={onHeadingComplete} reducedMotion={reducedMotion} />
              ) : introPhase === "star1" ? null : (
                <>Hi, I{"\u2019"}m Marco. I bring clarity to enterprise complexity. <span style={{ fontFamily: "var(--font-geist-pixel-square)", fontWeight: 700 }}>Visual craft</span> is how I get there, paired with rigorous problem-framing and systems thinking that scales.</>
              )}
            </h1>
          </div>
        )}

        {/* Intro loading star */}
        {(introPhase === "star1" || introPhase === "star2") && (
          <div className={introPhase === "star1" ? "mt-4" : "mt-8"}>
            <span className="text-[var(--color-accent)] text-[16px] animate-[blink-cursor_1s_step-end_infinite]">
              ✸
            </span>
          </div>
        )}

        {/* Bio section — visible once intro reaches bio phase */}
        {(introPhase === "bio" || introDone) && (
          <motion.div
            className={showDynamicBio ? "" : "mt-8 text-[var(--color-fg-secondary)] leading-[28px]"}
            initial={false}
            animate={{ opacity: 1 }}
          >
            {showDynamicBio ? (
              /* Dynamic Bio Mode — includes heading + text controlled by grid in palette */
              <DynamicBioText position={dynamicBio.gridPosition} />
            ) : (
              /* Classic Bio Mode — progressive disclosure */
              <>
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
                            <StreamingParagraph para={PARAGRAPHS[0]} onComplete={onBioIntroComplete} reducedMotion={reducedMotion} />
                          ) : isStreaming ? (
                            <StreamingParagraph para={PARAGRAPHS[pIdx]} onComplete={onStreamComplete} reducedMotion={reducedMotion} />
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

              </>
            )}
          </motion.div>
        )}
      </div>
    </section>
  );
}

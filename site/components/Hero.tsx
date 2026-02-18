"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { PARAGRAPHS, PROMPTS, MAX_LEVEL, HEADING_LINES } from "@/lib/bio-content";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { typescale } from "@/lib/typography";
import { useIsMobile } from "@/hooks/useMediaQuery";
import { useDynamicBio } from "@/lib/dynamic-bio-store";
import { RenderParagraph, StreamingParagraph } from "./StreamingText";
import InlineExpandButton from "./InlineExpandButton";
import { DynamicBioText } from "./dynamic-bio";
import TwoCol from "./TwoCol";

type HeadingLine = { text: string; weight: number; font?: string; size?: string; lineHeight?: number };

function StreamingHeadingLines({
  lines,
  stream,
  onComplete,
  reducedMotion,
}: {
  lines: HeadingLine[];
  stream: boolean;
  onComplete: () => void;
  reducedMotion: boolean;
}) {
  // Build a flat list of words, each tagged with its line index
  const wordsWithLine = useMemo(() => {
    const result: { word: string; lineIdx: number }[] = [];
    lines.forEach((line, lineIdx) => {
      line.text.split(" ").forEach((word) => {
        result.push({ word, lineIdx });
      });
    });
    return result;
  }, [lines]);

  const total = wordsWithLine.length;
  const [visibleCount, setVisibleCount] = useState(
    !stream || reducedMotion ? total : 0
  );
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (!stream || reducedMotion) {
      if (stream) onComplete();
      return;
    }
    let i = 0;
    const reveal = () => {
      i++;
      setVisibleCount(i);
      if (i < total) {
        timerRef.current = setTimeout(reveal, 40);
      } else {
        timerRef.current = setTimeout(onComplete, 300);
      }
    };
    timerRef.current = setTimeout(reveal, 40);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [stream, total, onComplete, reducedMotion]);

  // Group visible words back into lines
  const visible = wordsWithLine.slice(0, visibleCount);

  return (
    <>
      {lines.map((line, lineIdx) => {
        const lineWords = visible.filter((w) => w.lineIdx === lineIdx);
        if (lineWords.length === 0 && stream) return null;
        return (
          <span
            key={lineIdx}
            style={{
              fontWeight: line.weight,
              fontFamily: line.font,
              fontSize: line.size,
              lineHeight: line.lineHeight,
              display: "block",
              marginBottom: lineIdx < lines.length - 1 ? "0.75em" : undefined,
            }}
          >
            {stream
              ? lineWords.map((w, i) => (
                  <motion.span
                    key={i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.25 }}
                    style={{ display: "inline" }}
                  >
                    {i > 0 ? " " : ""}
                    {w.word}
                  </motion.span>
                ))
              : line.text}
          </span>
        );
      })}
    </>
  );
}

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

export default function Hero({ children }: { children?: React.ReactNode }) {
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
    <>
        {/* Heading — streams in during intro, static after; swapped for DynamicBioText in dynamic mode */}
        {showDynamicBio ? (
          <TwoCol>
            <TwoCol.Left>
              <DynamicBioText position={dynamicBio.gridPosition} />
            </TwoCol.Left>
          </TwoCol>
        ) : (
          <TwoCol>
            <TwoCol.Left>
              <div className="sticky top-14 z-40 -mx-4 px-4 sm:-mx-8 sm:px-8 py-3 bg-[var(--color-bg)]/90 backdrop-blur-sm lg:relative lg:top-auto lg:z-auto lg:mx-0 lg:px-0 lg:py-0 lg:bg-transparent lg:backdrop-blur-none">
                <h1
                  className="tracking-tight"
                  style={{
                    ...typescale.display,
                  }}
                >
                  {introPhase === "star1" ? null : (
                    <StreamingHeadingLines
                      lines={HEADING_LINES}
                      stream={introPhase === "subtitle"}
                      onComplete={onHeadingComplete}
                      reducedMotion={reducedMotion}
                    />
                  )}
                </h1>
              </div>
            </TwoCol.Left>
          </TwoCol>
        )}

        {/* Intro loading star */}
        {(introPhase === "star1" || introPhase === "star2") && (
          <TwoCol>
            <TwoCol.Left>
              <div className={introPhase === "star1" ? "mt-4" : "mt-8"}>
                <span className="text-[var(--color-accent)] text-[16px] animate-[blink-cursor_1s_step-end_infinite]">
                  ✸
                </span>
              </div>
            </TwoCol.Left>
          </TwoCol>
        )}

        {/* Slot for content between heading and bio (e.g. work section) */}
        {children}

        {/* Bio section — visible once intro reaches bio phase, hidden in dynamic mode */}
        {(introPhase === "bio" || introDone) && !showDynamicBio && (
          <TwoCol>
            <TwoCol.Left>
              <motion.div
                className="mt-28 text-[var(--color-fg-secondary)] leading-[28px]"
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
              </motion.div>
            </TwoCol.Left>
          </TwoCol>
        )}
    </>
  );
}

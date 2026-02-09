"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GridPosition, getVariant } from "@/lib/bio-content";
import { RenderParagraph, StreamingParagraph, StreamingWords } from "@/components/StreamingText";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { typescale } from "@/lib/typography";

const LOADING_DELAY = 2300; // ms to show the loading star (~2-3 blinks)

interface DynamicBioTextProps {
  position: GridPosition;
  className?: string;
}

type Phase = "idle" | "loading" | "streaming-heading" | "streaming-bio";

export function DynamicBioText({ position, className }: DynamicBioTextProps) {
  const reducedMotion = usePrefersReducedMotion();
  const [displayedPosition, setDisplayedPosition] = useState<GridPosition>(position);
  const [phase, setPhase] = useState<Phase>("idle");
  const [streamingParaIdx, setStreamingParaIdx] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();
  const pendingPositionRef = useRef<GridPosition | null>(null);

  // Get variant for current position
  const variant = getVariant(displayedPosition.x, displayedPosition.y);
  const heading = variant?.heading ?? "";
  const headingWords = heading.split(" ");
  const paragraphs = variant?.paragraphs ?? [];

  // Handle position changes
  useEffect(() => {
    if (position.x === displayedPosition.x && position.y === displayedPosition.y) {
      return;
    }

    // If reduced motion, just swap immediately
    if (reducedMotion) {
      setDisplayedPosition(position);
      return;
    }

    // Store pending position and start loading
    pendingPositionRef.current = position;
    setPhase("loading");

    // Clear any existing timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    // After delay, start streaming the heading
    timerRef.current = setTimeout(() => {
      if (pendingPositionRef.current) {
        setDisplayedPosition(pendingPositionRef.current);
        pendingPositionRef.current = null;
      }
      setStreamingParaIdx(0);
      setPhase("streaming-heading");
    }, LOADING_DELAY);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [position, displayedPosition, reducedMotion]);

  // Handle heading stream completion
  const handleHeadingStreamComplete = useCallback(() => {
    setPhase("streaming-bio");
  }, []);

  // Handle streaming completion for each paragraph
  const handleParaStreamComplete = useCallback(() => {
    if (streamingParaIdx < paragraphs.length - 1) {
      setStreamingParaIdx((idx) => idx + 1);
    } else {
      setPhase("idle");
    }
  }, [streamingParaIdx, paragraphs.length]);

  const isStreaming = phase === "streaming-heading" || phase === "streaming-bio";

  return (
    <div className={className}>
      <AnimatePresence mode="wait">
        {phase === "loading" ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1 }}
          >
            <span className="text-[var(--color-accent)] text-[16px] animate-[blink-cursor_1s_step-end_infinite]">
              ✸
            </span>
          </motion.div>
        ) : (
          <motion.div
            key={`${displayedPosition.x}-${displayedPosition.y}`}
            initial={reducedMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1 }}
          >
            {/* Heading */}
            <h1
              className="tracking-tight"
              style={typescale.display}
            >
              {phase === "streaming-heading" ? (
                <StreamingWords
                  words={headingWords}
                  onComplete={handleHeadingStreamComplete}
                  reducedMotion={reducedMotion}
                />
              ) : (
                heading.replace("I'm", "I\u2019m")
              )}
            </h1>

            {/* Bio paragraphs */}
            {(phase === "streaming-bio" || phase === "idle") && (
              <div className="mt-8 text-[var(--color-fg-secondary)] leading-[28px]">
                {paragraphs.map((para, idx) => (
                  <p key={idx} style={{ marginTop: idx === 0 ? 0 : "1.25rem" }}>
                    {phase === "streaming-bio" && idx === streamingParaIdx ? (
                      <StreamingParagraph
                        para={para}
                        onComplete={handleParaStreamComplete}
                        reducedMotion={reducedMotion}
                      />
                    ) : phase === "streaming-bio" && idx > streamingParaIdx ? (
                      null
                    ) : (
                      <RenderParagraph para={para} />
                    )}
                  </p>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default DynamicBioText;

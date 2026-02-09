"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Paragraph } from "@/lib/bio-content";
import {
  flattenParagraphs,
  diffWords,
  computeAnimationPhases,
  DiffResult,
  WordToken,
} from "@/lib/bio-interpolation";

const REMOVE_DELAY = 8; // ms between removing each word
const ADD_DELAY = 12; // ms between adding each word

interface BioDiffStreamProps {
  fromParagraphs: Paragraph[];
  toParagraphs: Paragraph[];
  onComplete?: () => void;
  reducedMotion?: boolean;
}

type AnimationPhase = "idle" | "removing" | "adding" | "done";

export function BioDiffStream({
  fromParagraphs,
  toParagraphs,
  onComplete,
  reducedMotion,
}: BioDiffStreamProps) {
  const [phase, setPhase] = useState<AnimationPhase>("idle");
  const [removedIndices, setRemovedIndices] = useState<Set<number>>(new Set());
  const [addedIndices, setAddedIndices] = useState<Set<number>>(new Set());
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  // Compute diff
  const { diff, removes, adds } = useMemo(() => {
    const from = flattenParagraphs(fromParagraphs);
    const to = flattenParagraphs(toParagraphs);
    const d = diffWords(from, to);
    const phases = computeAnimationPhases(d);
    return { diff: d, removes: phases.removes, adds: phases.adds };
  }, [fromParagraphs, toParagraphs]);

  // Start animation
  useEffect(() => {
    if (reducedMotion) {
      // Skip to end state immediately
      setRemovedIndices(new Set(removes));
      setAddedIndices(new Set(adds));
      setPhase("done");
      onComplete?.();
      return;
    }

    if (removes.length === 0 && adds.length === 0) {
      setPhase("done");
      onComplete?.();
      return;
    }

    setPhase("removing");
    setRemovedIndices(new Set());
    setAddedIndices(new Set());

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [diff, removes, adds, reducedMotion, onComplete]);

  // Handle remove phase
  useEffect(() => {
    if (phase !== "removing") return;

    if (removedIndices.size >= removes.length) {
      setPhase("adding");
      return;
    }

    const nextIdx = removes[removedIndices.size];
    timerRef.current = setTimeout(() => {
      setRemovedIndices((prev) => new Set([...Array.from(prev), nextIdx]));
    }, REMOVE_DELAY);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [phase, removedIndices.size, removes]);

  // Handle add phase
  useEffect(() => {
    if (phase !== "adding") return;

    if (addedIndices.size >= adds.length) {
      setPhase("done");
      timerRef.current = setTimeout(() => {
        onComplete?.();
      }, 50);
      return;
    }

    const nextIdx = adds[addedIndices.size];
    timerRef.current = setTimeout(() => {
      setAddedIndices((prev) => new Set([...Array.from(prev), nextIdx]));
    }, ADD_DELAY);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [phase, addedIndices.size, adds, onComplete]);

  // Render diff items
  const renderWord = useCallback(
    (item: DiffResult, idx: number) => {
      const isRemove = item.type === "remove";
      const isAdd = item.type === "add";
      const isKeep = item.type === "keep";

      // Skip removed items once they're animated out
      if (isRemove && removedIndices.has(idx)) {
        return null;
      }

      // Only show added items once they're animated in
      if (isAdd && !addedIndices.has(idx)) {
        return null;
      }

      // Handle paragraph breaks
      if (item.word === "\n\n") {
        return <br key={idx} />;
      }

      const needsSpace = idx > 0 && !/^[,.\-;:!?)]/.test(item.word);
      const wordContent = (
        <>
          {needsSpace ? " " : ""}
          {item.word}
        </>
      );

      // Link handling
      if (item.href) {
        const link = (
          <a
            href={item.href}
            target="_blank"
            rel="noopener noreferrer"
            className="dotted-link dotted-link--inline"
          >
            {wordContent}
          </a>
        );

        if (isRemove) {
          return (
            <motion.span
              key={idx}
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.08 }}
              style={{ display: "inline" }}
            >
              {link}
            </motion.span>
          );
        }

        if (isAdd) {
          return (
            <motion.span
              key={idx}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.1 }}
              style={{ display: "inline" }}
            >
              {link}
            </motion.span>
          );
        }

        return <span key={idx}>{link}</span>;
      }

      // Plain word handling
      if (isRemove) {
        return (
          <motion.span
            key={idx}
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.08 }}
            style={{ display: "inline" }}
          >
            {wordContent}
          </motion.span>
        );
      }

      if (isAdd) {
        return (
          <motion.span
            key={idx}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.1 }}
            style={{ display: "inline" }}
          >
            {wordContent}
          </motion.span>
        );
      }

      return (
        <span key={idx} style={{ display: "inline" }}>
          {wordContent}
        </span>
      );
    },
    [removedIndices, addedIndices]
  );

  return (
    <AnimatePresence mode="sync">
      {diff.map((item, idx) => renderWord(item, idx))}
    </AnimatePresence>
  );
}

export default BioDiffStream;

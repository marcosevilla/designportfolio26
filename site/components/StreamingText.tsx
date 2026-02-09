"use client";

import { motion } from "framer-motion";
import { useState, useEffect, useRef, useMemo } from "react";
import type { Paragraph } from "@/lib/bio-content";

// ── Static paragraph renderer ─────────────────────────────────

export function RenderParagraph({ para }: { para: Paragraph }) {
  return (
    <>
      {para.map((seg, segIdx) => {
        const needsSpace = segIdx > 0 && !/^[,.\-;:!?)]/.test(seg.text);
        if (seg.href) {
          return (
            <span key={segIdx}>
              {needsSpace ? " " : ""}
              <a href={seg.href} target="_blank" rel="noopener noreferrer" className="dotted-link dotted-link--inline">
                {seg.text}
              </a>
            </span>
          );
        }
        return <span key={segIdx}>{needsSpace ? " " : ""}{seg.text}</span>;
      })}
    </>
  );
}

// ── Word-by-word streaming (plain words) ──────────────────────

export function StreamingWords({
  words,
  onComplete,
  reducedMotion,
}: {
  words: string[];
  onComplete: () => void;
  reducedMotion: boolean;
}) {
  const [visibleCount, setVisibleCount] = useState(reducedMotion ? words.length : 0);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (reducedMotion) {
      onComplete();
      return;
    }
    let i = 0;
    const reveal = () => {
      i++;
      setVisibleCount(i);
      if (i < words.length) {
        timerRef.current = setTimeout(reveal, 40);
      } else {
        timerRef.current = setTimeout(onComplete, 300);
      }
    };
    timerRef.current = setTimeout(reveal, 40);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [words.length, onComplete, reducedMotion]);

  return (
    <>
      {words.slice(0, visibleCount).map((word, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.25 }}
          style={{ display: "inline" }}
        >
          {i > 0 ? " " : ""}{word}
        </motion.span>
      ))}
    </>
  );
}

// ── Word-by-word streaming (paragraph with links) ─────────────

function flattenToWords(para: Paragraph): { word: string; href?: string }[] {
  const words: { word: string; href?: string }[] = [];
  para.forEach((seg) => {
    const segWords = seg.text.split(/\s+/).filter(Boolean);
    segWords.forEach((w) => {
      words.push({ word: w, href: seg.href });
    });
  });
  return words;
}

export function StreamingParagraph({
  para,
  onComplete,
  reducedMotion,
}: {
  para: Paragraph;
  onComplete: () => void;
  reducedMotion: boolean;
}) {
  const words = useMemo(() => flattenToWords(para), [para]);
  const [visibleCount, setVisibleCount] = useState(reducedMotion ? words.length : 0);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (reducedMotion) {
      onComplete();
      return;
    }
    let i = 0;
    const reveal = () => {
      i++;
      setVisibleCount(i);
      if (i < words.length) {
        timerRef.current = setTimeout(reveal, 40);
      } else {
        timerRef.current = setTimeout(onComplete, 300);
      }
    };
    timerRef.current = setTimeout(reveal, 40);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [words.length, onComplete, reducedMotion]);

  // Build rendered output from visible words, grouping consecutive link words
  const rendered: React.ReactNode[] = [];
  let linkBuffer: string[] = [];
  let currentHref: string | undefined;

  const flushLink = () => {
    if (linkBuffer.length > 0 && currentHref) {
      rendered.push(
        <span key={`link-${rendered.length}`}>
          {rendered.length > 0 && !/^[,.\-;:!?)]/.test(linkBuffer[0]) ? " " : ""}
          <a href={currentHref} target="_blank" rel="noopener noreferrer" className="dotted-link dotted-link--inline">
            {linkBuffer.join(" ")}
          </a>
        </span>
      );
      linkBuffer = [];
      currentHref = undefined;
    }
  };

  for (let i = 0; i < visibleCount && i < words.length; i++) {
    const w = words[i];
    if (w.href) {
      if (currentHref && currentHref === w.href) {
        linkBuffer.push(w.word);
      } else {
        flushLink();
        currentHref = w.href;
        linkBuffer = [w.word];
      }
    } else {
      flushLink();
      rendered.push(
        <motion.span
          key={`w-${i}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.25 }}
          style={{ display: "inline" }}
        >
          {rendered.length > 0 && !/^[,.\-;:!?)]/.test(w.word) ? " " : ""}{w.word}
        </motion.span>
      );
    }
  }
  flushLink();

  return <>{rendered}</>;
}

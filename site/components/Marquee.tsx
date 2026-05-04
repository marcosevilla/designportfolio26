"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useMarquee } from "./MarqueeContext";

const REVEAL_EASE = [0.22, 1, 0.36, 1] as const;

const quotes = [
  {
    text: "A rare, talented designer with an endless stamina for feedback and continuous improvement.",
    author: "Kevin Doherty",
  },
  {
    text: "He showed up again and again to ensure things were not only done on time, but that they were done well.",
    author: "Hans van de Bruggen",
  },
  {
    text: "You'd be lucky to have him on your team.",
    author: "Hans van de Bruggen",
  },
  {
    text: "Rare ability to balance strategic business thinking with exceptional craft.",
    author: "EJ Lee",
  },
  {
    text: "A gift for turning ambiguity into clarity.",
    author: "EJ Lee",
  },
  {
    text: "Teams are better, happier, and more effective with Marco on them.",
    author: "EJ Lee",
  },
];

function QuoteSet() {
  return (
    <>
      {quotes.map((q, i) => (
        <span key={i} className="inline-flex items-center shrink-0">
          <span style={{ color: "var(--color-fg-secondary)" }}>
            &ldquo;{q.text}&rdquo;
          </span>
          <span
            className="ml-2"
            style={{ color: "var(--color-fg)" }}
          >
            &mdash; {q.author}
          </span>
          <span
            className="mx-6"
            style={{ color: "var(--color-accent)", fontSize: "14px", fontWeight: 500 }}
            aria-hidden
          >
            *
          </span>
        </span>
      ))}
    </>
  );
}

interface MarqueeProps {
  /** When true, render the scrolling track seamlessly inside a parent
   *  container — drop the pill chrome (border, bg, shadow, margins) so the
   *  marquee reads as a section of the floating toolbar. */
  bare?: boolean;
}

export default function Marquee({ bare = false }: MarqueeProps = {}) {
  const { visible } = useMarquee();

  const track = (
    <div
      className="flex items-center whitespace-nowrap py-2.5 marquee-track"
      style={{
        fontSize: "calc(13px + var(--font-size-offset))",
        fontWeight: 400,
        lineHeight: 1.4,
      }}
    >
      <div className="inline-flex shrink-0">
        <QuoteSet />
      </div>
      <div className="inline-flex shrink-0" aria-hidden>
        <QuoteSet />
      </div>
    </div>
  );

  const animation = (
    <motion.div
      key="marquee"
      className="overflow-hidden"
      role="marquee"
      aria-label="Testimonials from colleagues"
      initial={{ height: 0, opacity: 0, y: -8, filter: "blur(8px)" }}
      animate={{
        height: "auto",
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        transition: {
          height: { duration: 0.35, ease: REVEAL_EASE },
          opacity: { duration: 0.3, ease: REVEAL_EASE, delay: 0.05 },
          y: { duration: 0.35, ease: REVEAL_EASE },
          filter: { duration: 0.4, ease: REVEAL_EASE, delay: 0.05 },
        },
      }}
      exit={{
        height: 0,
        opacity: 0,
        y: -8,
        filter: "blur(8px)",
        transition: {
          height: { duration: 0.25, ease: REVEAL_EASE, delay: 0.08 },
          opacity: { duration: 0.2, ease: REVEAL_EASE },
          y: { duration: 0.25, ease: REVEAL_EASE },
          filter: { duration: 0.22, ease: REVEAL_EASE },
        },
      }}
      style={{ willChange: "transform, opacity, filter" }}
    >
      {bare ? (
        <>
          <div style={{ height: 1, background: "var(--color-border)" }} aria-hidden />
          <div className="overflow-hidden">{track}</div>
        </>
      ) : (
        <div className="bio-dropdown-container mt-2 mb-4 overflow-hidden">{track}</div>
      )}
    </motion.div>
  );

  return bare ? (
    <AnimatePresence initial={false}>{visible && animation}</AnimatePresence>
  ) : (
    <div style={{ filter: "var(--bio-dropdown-shadow)" }}>
      <AnimatePresence initial={false}>{visible && animation}</AnimatePresence>
    </div>
  );
}

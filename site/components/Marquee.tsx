"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useMarquee } from "./MarqueeContext";

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
            style={{ color: "var(--color-accent)", fontSize: "14px" }}
            aria-hidden
          >
            ✦
          </span>
        </span>
      ))}
    </>
  );
}

export default function Marquee() {
  const { visible } = useMarquee();

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="marquee"
          className="fixed top-0 left-0 w-screen z-50 overflow-hidden"
          style={{
            backgroundColor: "var(--color-surface)",
            borderBottom: "1px solid var(--color-border)",
          }}
          initial={{ y: "-100%" }}
          animate={{ y: 0 }}
          exit={{ y: "-100%" }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <div
            className="flex items-center whitespace-nowrap py-4 marquee-track"
            style={{ fontSize: "calc(14px + var(--font-size-offset) + var(--font-pairing-boost))", fontFamily: "var(--font-body)", fontWeight: 400 }}
          >
            <div className="inline-flex shrink-0">
              <QuoteSet />
            </div>
            <div className="inline-flex shrink-0" aria-hidden>
              <QuoteSet />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

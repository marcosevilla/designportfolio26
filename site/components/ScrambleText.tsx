"use client";

import { useEffect, useLayoutEffect, useState } from "react";

const SCRAMBLE_POOL = "abcdefghijklmnopqrstuvwxyz!@#$%^&*-_+=;:<>,";

// Two theme-aware colors flashed during scramble. Both adapt to the active
// palette: the accent is the user's chosen highlight, and fg-tertiary is a
// muted neutral that pairs cleanly with every theme.
const DEFAULT_COLORS = [
  "var(--color-accent)",
  "var(--color-fg-tertiary)",
];

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

interface ScrambleTextProps {
  text: string;
  /** Skip the animation and render text statically */
  skip?: boolean;
  /** Delay before the first character begins (ms) */
  delayMs?: number;
  /** Delay between each character starting (ms) */
  staggerMs?: number;
  /** Number of random-character cycles before settling */
  cycles?: number;
  /** Duration of each random-character display (ms) */
  cycleMs?: number;
  /** Delay between cycles (ms) */
  repeatDelayMs?: number;
  /** Color pool used during scramble cycles. Settled chars inherit parent color. */
  colors?: string[];
  /** Fired when the last character settles on its final value */
  onComplete?: () => void;
}

export default function ScrambleText({
  text,
  skip = false,
  delayMs = 0,
  staggerMs = 70,
  cycles = 3,
  cycleMs = 30,
  repeatDelayMs = 40,
  colors = DEFAULT_COLORS,
  onComplete,
}: ScrambleTextProps) {
  const [chars, setChars] = useState<string[]>(() => text.split(""));
  const [visible, setVisible] = useState<boolean[]>(() =>
    text.split("").map(() => true)
  );
  const [charColors, setCharColors] = useState<(string | null)[]>(() =>
    text.split("").map(() => null)
  );

  useIsomorphicLayoutEffect(() => {
    const target = text.split("");

    if (skip) {
      setChars(target);
      setVisible(target.map(() => true));
      setCharColors(target.map(() => null));
      onComplete?.();
      return;
    }

    setVisible(target.map(() => false));
    setChars(target);
    setCharColors(target.map(() => null));

    const timers: ReturnType<typeof setTimeout>[] = [];
    let lastSettleTime = 0;

    target.forEach((finalChar, i) => {
      const start = delayMs + i * staggerMs;
      const isSpace = finalChar === " ";

      timers.push(
        setTimeout(() => {
          setVisible((prev) => {
            const next = [...prev];
            next[i] = true;
            return next;
          });
        }, start)
      );

      if (isSpace) {
        lastSettleTime = Math.max(lastSettleTime, start);
        return;
      }

      for (let c = 0; c < cycles; c++) {
        const t = start + c * (cycleMs + repeatDelayMs);
        timers.push(
          setTimeout(() => {
            const randomChar =
              SCRAMBLE_POOL[Math.floor(Math.random() * SCRAMBLE_POOL.length)];
            const randomColor =
              colors[Math.floor(Math.random() * colors.length)];
            setChars((prev) => {
              const next = [...prev];
              next[i] = randomChar;
              return next;
            });
            setCharColors((prev) => {
              const next = [...prev];
              next[i] = randomColor;
              return next;
            });
          }, t)
        );
      }

      const settleTime = start + cycles * (cycleMs + repeatDelayMs);
      lastSettleTime = Math.max(lastSettleTime, settleTime);
      timers.push(
        setTimeout(() => {
          setChars((prev) => {
            const next = [...prev];
            next[i] = finalChar;
            return next;
          });
          setCharColors((prev) => {
            const next = [...prev];
            next[i] = null;
            return next;
          });
        }, settleTime)
      );
    });

    if (onComplete) {
      timers.push(setTimeout(onComplete, lastSettleTime + 20));
    }

    return () => timers.forEach(clearTimeout);
  }, [text, skip, delayMs, staggerMs, cycles, cycleMs, repeatDelayMs, colors, onComplete]);

  return (
    <span aria-label={text}>
      {chars.map((c, i) => (
        <span
          key={i}
          aria-hidden="true"
          style={{
            opacity: visible[i] ? 1 : 0,
            color: charColors[i] ?? undefined,
            display: "inline-block",
            whiteSpace: "pre",
          }}
        >
          {c}
        </span>
      ))}
    </span>
  );
}

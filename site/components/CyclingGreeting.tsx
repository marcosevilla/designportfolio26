"use client";

import { useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

/**
 * Animated greeting that:
 *   1. Runs through a one-time queue of conversational pre-phrases at body-text
 *      scale (some with a mid-phrase pause that resumes typing where it left
 *      off — e.g. "Hello, friend. [5s] Welcome to my portfolio.").
 *   2. Transitions to header scale and cycles through 10 translations of "Hello"
 *      with a per-character scramble settle, looping forever.
 *
 * The 8-point ✸ cursor sits at the end of the current text and tracks left/
 * right as letters are added or removed. The h2 height is locked so the bio
 * paragraphs below never reflow during any phase of the animation.
 */

type Phrase = {
  /** One or more segments. Segments are typed in order; between each segment
   *  the cursor pauses (`segmentPauseMs`) before resuming where it left off. */
  segments: string[];
  segmentPauseMs?: number;
};

const PRE_PHRASES: Phrase[] = [
  { segments: ["Hello, friend.", " Welcome to my portfolio."], segmentPauseMs: 5000 },
  { segments: ["Made with <3 and a few cans of Celsius in SF"] },
  { segments: [":P"] },
  { segments: ["Hope you're having a wonderful day~"] },
];

// Translations cycled forever after the pre-phrases finish.
const GREETINGS = [
  "Hello",     // English
  "Hola",      // Spanish
  "Bonjour",   // French
  "Ciao",      // Italian
  "Hallo",     // German
  "Olá",       // Portuguese
  "Привет",    // Russian
  "你好",       // Chinese (Simplified)
  "こんにちは",   // Japanese
  "नमस्ते",     // Hindi
];

// Scramble alphabet — Latin upper + symbols so the random chars read as
// "garbled" against any target script.
const SCRAMBLE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%&*+=?";
function randomChar() {
  return SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
}

// ─── Timing constants ────────────────────────────────────────────────────────
const INITIAL_BLINK_MS = 2200;     // first-load: cursor blinks alone before typing
const PLAIN_TYPE_MS = 32;          // per-char delay for pre-phrase typing (no scramble)
const TYPE_SCRAMBLE_TICKS = 5;     // random char flickers per locked-in letter (translations)
const TYPE_TICK_MS = 32;           // scramble flicker rate (translations)
const HOLD_MS = 4200;              // dwell on each translation
const DELETE_MS = 70;              // backspace cadence
const POST_DELETE_PAUSE_MS = 1800; // breath between languages / phrases
const DEFAULT_SEGMENT_PAUSE_MS = 5000; // mid-phrase pause when split into segments

// Reading-time formula for pre-phrases — proportional to character count, with
// floor and ceiling so very short or very long phrases still feel right.
const READ_MS_PER_CHAR = 65;
const MIN_READ_MS = 2400;
const MAX_READ_MS = 5500;
const computeReadMs = (chars: number) =>
  Math.min(MAX_READ_MS, Math.max(MIN_READ_MS, chars * READ_MS_PER_CHAR));

// ─── Visual constants ────────────────────────────────────────────────────────
// Sized so the longest pre-phrase (~55 chars) fits on one line within the
// 436px content area (500px column − 32px padding × 2 at sm+). Translations
// stay at the larger header scale.
const PRE_FONT_SIZE = "16px";
const TRANSLATION_FONT_SIZE = "22px";

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

export default function CyclingGreeting({ compact = false }: { compact?: boolean }) {
  const [display, setDisplay] = useState("");
  const [fontSize, setFontSize] = useState(compact ? "13px" : PRE_FONT_SIZE);
  const reducedMotion = usePrefersReducedMotion();

  const cancelledRef = useRef(false);

  useEffect(() => {
    if (reducedMotion) {
      if (!compact) setFontSize(TRANSLATION_FONT_SIZE);
      setDisplay("Hello");
      return;
    }

    cancelledRef.current = false;

    // Plain typewriter — no scramble, used for the pre-phrases so longer
    // sentences read naturally instead of feeling laggy.
    const typePlain = async (start: string, addition: string) => {
      const chars = Array.from(addition);
      let built = start;
      for (const ch of chars) {
        built += ch;
        if (cancelledRef.current) return built;
        setDisplay(built);
        await sleep(PLAIN_TYPE_MS);
      }
      return built;
    };

    // Scramble-settle typing — used for the translation cycle to give each
    // language change a "decoding" feel.
    const typeWithScramble = async (word: string) => {
      const chars = Array.from(word);
      let built = "";
      for (const ch of chars) {
        for (let s = 0; s < TYPE_SCRAMBLE_TICKS; s++) {
          if (cancelledRef.current) return;
          setDisplay(built + randomChar());
          await sleep(TYPE_TICK_MS);
        }
        built += ch;
        if (cancelledRef.current) return;
        setDisplay(built);
      }
    };

    const deleteOut = async (text: string) => {
      const chars = Array.from(text);
      for (let i = chars.length - 1; i >= 0; i--) {
        if (cancelledRef.current) return;
        setDisplay(chars.slice(0, i).join(""));
        await sleep(DELETE_MS);
      }
    };

    const cycle = async () => {
      // First load: cursor blinks alone for a beat before anything types.
      await sleep(INITIAL_BLINK_MS);
      if (cancelledRef.current) return;

      // Outer loop: pre-phrases → translations → pre-phrases → … forever.
      while (!cancelledRef.current) {
        // ─── Pre-phrases ───────────────────────────────────────────────────
        if (!compact) setFontSize(PRE_FONT_SIZE);
        for (const phrase of PRE_PHRASES) {
          let built = "";
          for (let i = 0; i < phrase.segments.length; i++) {
            if (i > 0) {
              // Mid-phrase pause — cursor sits and blinks before resuming.
              await sleep(phrase.segmentPauseMs ?? DEFAULT_SEGMENT_PAUSE_MS);
              if (cancelledRef.current) return;
            }
            built = await typePlain(built, phrase.segments[i]);
            if (cancelledRef.current) return;
          }

          await sleep(computeReadMs(built.length));
          if (cancelledRef.current) return;

          await deleteOut(built);
          if (cancelledRef.current) return;

          await sleep(POST_DELETE_PAUSE_MS);
          if (cancelledRef.current) return;
        }

        // ─── Translations (10 languages, one full pass) ────────────────────
        if (!compact) setFontSize(TRANSLATION_FONT_SIZE);
        for (let idx = 0; idx < GREETINGS.length; idx++) {
          await typeWithScramble(GREETINGS[idx]);
          if (cancelledRef.current) return;

          await sleep(HOLD_MS);
          if (cancelledRef.current) return;

          await deleteOut(GREETINGS[idx]);
          if (cancelledRef.current) return;

          await sleep(POST_DELETE_PAUSE_MS);
          if (cancelledRef.current) return;
        }
        // Loop back to pre-phrases.
      }
    };

    cycle();

    return () => {
      cancelledRef.current = true;
    };
  }, [reducedMotion, compact]);

  return (
    <h2
      style={{
        // Block-level flex so the row sits in its own block box (no inline
        // line-height strut). Fixed pixel height locks the row regardless of
        // which script / size is currently in the buffer.
        display: "flex",
        alignItems: "center",
        width: "fit-content",
        maxWidth: "100%",
        fontFamily: "var(--font-geist-mono), ui-monospace, Menlo, monospace",
        fontSize,
        fontWeight: compact ? 400 : 500,
        letterSpacing: compact ? "-0.01em" : "0.01em",
        marginBottom: compact ? 0 : "14px",
        lineHeight: 1,
        height: compact ? "100%" : 36,
        color: compact ? "var(--color-fg-secondary)" : undefined,
        overflow: "hidden",
        whiteSpace: "nowrap",
      }}
      aria-label="Hello"
    >
      <span className="shimmer-text" style={{ lineHeight: 1 }}>{display}</span>
      <span
        aria-hidden
        className="cycling-greeting-cursor"
        style={{
          color: "var(--color-accent)",
          marginLeft: display ? "0.25em" : 0,
          fontSize: compact ? "16px" : "1em",
          lineHeight: 1,
        }}
      >
        ✸
      </span>
    </h2>
  );
}

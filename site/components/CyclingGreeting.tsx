"use client";

import { useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

/**
 * Cycling tagline (revived 2026-07-15 from e59ddb5; moved from the h1 to
 * the tagline slot same day — the h1 stays a static "Marco Sevilla").
 *
 * Cycle: the tagline types in and dwells (anchor state) → deletes → queue
 * of conversational pre-phrases (some with a mid-phrase pause that resumes
 * typing where it left off) → "hello" in 10 languages with a per-character
 * scramble settle → back to the tagline, forever.
 *
 * Every phrase renders at the SAME size/style — the component inherits the
 * parent tagline's Libre Baskerville italic 18px. The Geist `*` cursor sits
 * at the end of the current text and blinks via .cycling-greeting-cursor.
 * The row height is locked so the bio below never reflows.
 */

type Phrase = {
  /** Segments are typed in order; between each the cursor pauses
   *  (`segmentPauseMs`) before resuming where it left off. */
  segments: string[];
  segmentPauseMs?: number;
};

const ANCHOR = "Product Designer based in San Francisco, California";

const PRE_PHRASES: Phrase[] = [
  { segments: ["Hello, friend.", " Welcome to my portfolio."], segmentPauseMs: 5000 },
  { segments: ["Hope you like it!"] },
  { segments: [":P"] },
  { segments: ["Made with <3 and a few cans of Celsius in San Francisco"] },
  { segments: ["Say vibe-code 10x fast", " hahaha"], segmentPauseMs: 5000 },
  { segments: ["If you're a fellow designer, let's chat!"] },
  { segments: ["If you're a recruiter, scroll down to see my work :)"] },
  { segments: ["If you're a friend who's stalking me, heyyyy (text me)"] },
  { segments: ["If you made it this far...", " thanks for being here!"], segmentPauseMs: 5000 },
  { segments: ["Hope you're having a wonderful day~"] },
  { segments: ['For funsies, here is "hello" in 10 different languages'] },
];

// Translations cycled after the pre-phrases finish.
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
const PLAIN_TYPE_MS = 32;          // per-char delay for plain typing
const TYPE_SCRAMBLE_TICKS = 5;     // random char flickers per locked-in letter
const TYPE_TICK_MS = 32;           // scramble flicker rate (translations)
const ANCHOR_HOLD_MS = 9000;       // dwell on the tagline before the cycle starts
const HOLD_MS = 4200;              // dwell on each translation
const DELETE_MS = 70;              // backspace cadence
const POST_DELETE_PAUSE_MS = 1800; // breath between phrases / languages
const DEFAULT_SEGMENT_PAUSE_MS = 5000;

// Reading-time formula for pre-phrases — proportional to character count.
const READ_MS_PER_CHAR = 65;
const MIN_READ_MS = 2400;
const MAX_READ_MS = 5500;
const computeReadMs = (chars: number) =>
  Math.min(MAX_READ_MS, Math.max(MIN_READ_MS, chars * READ_MS_PER_CHAR));

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

export default function CyclingGreeting({ start = true }: { start?: boolean }) {
  const [display, setDisplay] = useState("");
  const reducedMotion = usePrefersReducedMotion();

  const cancelledRef = useRef(false);

  useEffect(() => {
    if (reducedMotion) {
      setDisplay(ANCHOR);
      return;
    }
    if (!start) return;

    cancelledRef.current = false;

    // Plain typewriter — no scramble; used for the name and pre-phrases.
    const typePlain = async (startText: string, addition: string) => {
      const chars = Array.from(addition);
      let built = startText;
      for (const ch of chars) {
        built += ch;
        if (cancelledRef.current) return built;
        setDisplay(built);
        await sleep(PLAIN_TYPE_MS);
      }
      return built;
    };

    // Scramble-settle typing — the translation cycle's "decoding" feel.
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
      // Outer loop: tagline → pre-phrases → translations → tagline → … forever.
      while (!cancelledRef.current) {
        // ─── The tagline (anchor state) ────────────────────────────────────
        await typePlain("", ANCHOR);
        if (cancelledRef.current) return;
        await sleep(ANCHOR_HOLD_MS);
        if (cancelledRef.current) return;
        await deleteOut(ANCHOR);
        if (cancelledRef.current) return;
        await sleep(POST_DELETE_PAUSE_MS);
        if (cancelledRef.current) return;

        // ─── Pre-phrases ───────────────────────────────────────────────────
        for (const phrase of PRE_PHRASES) {
          let built = "";
          for (let i = 0; i < phrase.segments.length; i++) {
            if (i > 0) {
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
        // Loop back to the tagline.
      }
    };

    cycle();

    return () => {
      cancelledRef.current = true;
    };
  }, [reducedMotion, start]);

  return (
    <span
      aria-hidden
      style={{
        // Block-level flex so the row sits in its own block box. Fixed pixel
        // height (tagline's 26px line-height) locks the row regardless of
        // which script is showing, so the bio below never reflows. Font
        // family/size/style are inherited from the parent tagline — every
        // phrase renders in Libre Baskerville italic 18px.
        display: "flex",
        alignItems: "center",
        width: "fit-content",
        maxWidth: "100%",
        height: 26,
        overflow: "hidden",
        whiteSpace: "nowrap",
      }}
    >
      <span>{display}</span>
      <span
        className="cycling-greeting-cursor"
        style={{
          color: "var(--color-accent)",
          marginLeft: display ? "0.18em" : 0,
          // Geist * sits high in its em-box — nudge down to optically center
          // against the text baseline (site-wide brand-mark pattern).
          transform: "translateY(15%)",
          fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
          fontWeight: 500,
          fontStyle: "normal",
        }}
      >
        *
      </span>
    </span>
  );
}

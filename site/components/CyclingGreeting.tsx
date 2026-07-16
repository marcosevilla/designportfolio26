"use client";

import { useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

/**
 * Cycling name header (revived 2026-07-15 from e59ddb5, restyled for the
 * Baskerville h1 slot in HomeLayout).
 *
 * Cycle: "Marco Sevilla" types in and dwells (name is the anchor state) →
 * deletes → one-time queue of conversational pre-phrases at a smaller scale
 * (some with a mid-phrase pause that resumes typing where it left off) →
 * "hello" in 10 languages with a per-character scramble settle → back to the
 * name, forever.
 *
 * The Geist `*` cursor sits at the end of the current text and blinks via
 * .cycling-greeting-cursor. The row height is locked so the tagline and bio
 * below never reflow during any phase.
 */

type Phrase = {
  /** Segments are typed in order; between each the cursor pauses
   *  (`segmentPauseMs`) before resuming where it left off. */
  segments: string[];
  segmentPauseMs?: number;
};

const NAME = "Marco Sevilla";

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
const NAME_HOLD_MS = 9000;         // dwell on the name before the cycle starts
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

// ─── Visual constants ────────────────────────────────────────────────────────
// Name + short greetings hold the full h1 scale; long pre-phrases drop to a
// smaller size so they fit the bio column (cols 1–7) on one line.
const NAME_FONT_SIZE = "32px";
const PRE_FONT_SIZE = "18px";

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

export default function CyclingGreeting({ start = true }: { start?: boolean }) {
  const [display, setDisplay] = useState("");
  const [fontSize, setFontSize] = useState(NAME_FONT_SIZE);
  const reducedMotion = usePrefersReducedMotion();

  const cancelledRef = useRef(false);

  useEffect(() => {
    if (reducedMotion) {
      setFontSize(NAME_FONT_SIZE);
      setDisplay(NAME);
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
      // Outer loop: name → pre-phrases → translations → name → … forever.
      while (!cancelledRef.current) {
        // ─── The name (anchor state) ───────────────────────────────────────
        setFontSize(NAME_FONT_SIZE);
        await typePlain("", NAME);
        if (cancelledRef.current) return;
        await sleep(NAME_HOLD_MS);
        if (cancelledRef.current) return;
        await deleteOut(NAME);
        if (cancelledRef.current) return;
        await sleep(POST_DELETE_PAUSE_MS);
        if (cancelledRef.current) return;

        // ─── Pre-phrases ───────────────────────────────────────────────────
        setFontSize(PRE_FONT_SIZE);
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
        setFontSize(NAME_FONT_SIZE);
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
        // Loop back to the name.
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
        // height locks the row regardless of which script / size is showing,
        // so the tagline + bio below never reflow.
        display: "flex",
        alignItems: "center",
        width: "fit-content",
        maxWidth: "100%",
        fontSize,
        lineHeight: 1.2,
        height: 40,
        overflow: "hidden",
        whiteSpace: "nowrap",
      }}
    >
      <span style={{ lineHeight: 1.2 }}>{display}</span>
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

"use client";

// Open-state internals of the chat surface.
// Top: header strip (sparkle glyph, "Ask me anything" mono label, X).
// Middle: transcript (chips empty-state when no messages yet).
// Bottom: input row (Spotlight-feel — leading icon, large input, Enter to send).
//
// This component does NOT own the morph wrapper or sessionStorage — that's
// ChatBar's job. ChatPanel is purely presentational + input wiring.

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import ChatMessage, { type ChatTurn } from "./ChatMessage";
import ChipPrompt from "./ChipPrompt";

const GREETING_TEXT =
  "Hi, I'm Marco. Ask me about my work, my process, or anything else you're curious about.";

// Empty-state intro — the brand asterisk acts as a typewriter cursor.
// Phase 1 ("blink"): the cursor blinks alone for ~1.5s.
// Phase 2 ("stream"): words appear one at a time with jagged cadence
// (random 30–90ms per word); the cursor trails the latest word, jumping
// to its new position each time with a quick scale-pop so the movement
// reads as mechanical / typewriter-like, not smooth. After the last word
// lands, the cursor disappears.
// Replays on every fresh panel mount (AnimatePresence handles unmount).
function AnimatedGreeting() {
  const [phase, setPhase] = useState<"blink" | "stream" | "done">("blink");
  const [wordIdx, setWordIdx] = useState(0);
  const words = GREETING_TEXT.split(" ");

  useEffect(() => {
    if (phase !== "blink") return;
    const t = window.setTimeout(() => setPhase("stream"), 1500);
    return () => window.clearTimeout(t);
  }, [phase]);

  useEffect(() => {
    if (phase !== "stream") return;
    if (wordIdx >= words.length) {
      // Brief pause on the last word so the cursor reads as "done typing"
      // before disappearing.
      const t = window.setTimeout(() => setPhase("done"), 320);
      return () => window.clearTimeout(t);
    }
    // Naturalistic cadence:
    //   - Base: 55–115ms per word (random spread).
    //   - +60–100ms after a comma — momentary breath.
    //   - +180–260ms after a period — full sentence break.
    //   - 10% chance of a small "stutter" pause anywhere, so the rhythm
    //     doesn't feel like a metronome.
    const lastChar = wordIdx > 0 ? words[wordIdx - 1].slice(-1) : "";
    let delay = 55 + Math.random() * 60;
    if (lastChar === ",") delay += 60 + Math.random() * 40;
    if (lastChar === "." || lastChar === "!" || lastChar === "?") {
      delay += 180 + Math.random() * 80;
    }
    if (Math.random() < 0.1) delay += 70 + Math.random() * 50;
    const t = window.setTimeout(() => setWordIdx((i) => i + 1), delay);
    return () => window.clearTimeout(t);
  }, [phase, wordIdx, words.length]);

  const visibleWords = phase === "blink" ? 0 : wordIdx;
  const showCursor = phase !== "done";

  return (
    <p
      style={{
        fontFamily: "var(--font-sans)",
        fontSize: "14px",
        // Bumped from 22 so the larger trailing asterisk doesn't blow out
        // the line height when it lands on a fresh line.
        lineHeight: "26px",
        color: "var(--color-fg-secondary)",
      }}
    >
      {words.slice(0, visibleWords).map((w, i) => (
        // Words appear instantly — no per-word fade. The cursor's
        // jagged scale-pop on each remount is what carries the typing
        // motion; fading the words too made the animation feel mushy.
        <span key={i}>
          {i > 0 ? " " : ""}
          {w}
        </span>
      ))}
      {showCursor && (
        <motion.span
          aria-hidden
          // key bumps each word land → triggers the jitter initial→animate,
          // which gives the cursor its jagged typewriter-jump feel as it
          // advances. Size stays constant (no scale change) so it doesn't
          // visually pulse with each word — just position-jitters.
          key={`cursor-${visibleWords}`}
          style={{
            color: "var(--color-accent)",
            fontWeight: 500,
            // Bigger than body type so the cursor reads as a glyph, not
            // punctuation. line-height:0 + verticalAlign sit it on the
            // text's optical middle of every wrapped line.
            fontSize: "30px",
            lineHeight: 0,
            display: "inline-block",
            marginLeft: visibleWords > 0 ? "0.25em" : 0,
            // Negative em offset on verticalAlign drops the asterisk's
            // anchor below the parent text's baseline, then translateY
            // nudges the high-sitting Geist glyph down to the body
            // text's optical center. Pure translateY at 15% wasn't
            // enough at this font-size; combined here, the * sits
            // alongside the words instead of reading as superscript.
            verticalAlign: "-0.18em",
            transform: "translateY(0.18em)",
          }}
          initial={
            // First mount during blink: just appear. After that (stream
            // phase remounts on every word), nudge in with a small x
            // jitter so the landing reads as a jagged typewriter step.
            visibleWords === 0
              ? { opacity: 1, x: 0 }
              : {
                  opacity: 0.55,
                  // ±2px random horizontal jitter
                  x: Math.random() * 4 - 2,
                }
          }
          animate={
            phase === "blink"
              ? { opacity: [1, 0.15, 1] }
              : { opacity: 1, x: 0 }
          }
          transition={
            phase === "blink"
              ? { duration: 0.7, repeat: Infinity, ease: "easeInOut" }
              : { type: "spring", stiffness: 800, damping: 18, mass: 0.4 }
          }
        >
          *
        </motion.span>
      )}
    </p>
  );
}

// Contents emit from the panel's origin: opacity 0 + slight blur on enter,
// so when the layoutId morph from the pill begins, the panel chrome (rect
// + border + shadow) is the only thing visible at first — header, transcript
// bubbles, X button, input row all blur-fade in together as the morph
// settles. Small delay on enter lets the rect establish before contents
// arrive. Exit is handled by the wrapper's opacity fade in ChatBar.tsx.
const CONTENT_TRANSITION = {
  duration: 0.28,
  delay: 0.06,
  ease: [0.22, 1, 0.36, 1] as const,
};

const MAX_INPUT_CHARS = 1000;

const DEFAULT_CHIPS = [
  "Walk me through your most impactful project",
  "What's your design process?",
  "How do you collaborate with engineering?",
  "What got you into design?",
];

function CloseIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
      <path d="M4 4l8 8M12 4l-8 8" />
    </svg>
  );
}

function SendIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 8l10-5-3.5 11L8 9 3 8z" />
    </svg>
  );
}

export default function ChatPanel({
  turns,
  pending,
  errorLine,
  onSubmit,
  onClose,
}: {
  turns: ChatTurn[];
  /** True while a streaming response is in flight; disables submit. */
  pending: boolean;
  /** Optional inline assistant-style line (rate-limit / network error). */
  errorLine: string | null;
  onSubmit: (text: string) => void;
  onClose: () => void;
}) {
  const [value, setValue] = useState("");
  const surfaceRef = useRef<HTMLDivElement>(null);
  const transcriptRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll transcript to bottom on new content unless the user has
  // scrolled up themselves.
  useEffect(() => {
    const el = transcriptRef.current;
    if (!el) return;
    const distanceFromBottom = el.scrollHeight - (el.scrollTop + el.clientHeight);
    if (distanceFromBottom < 120) {
      el.scrollTop = el.scrollHeight;
    }
  }, [turns, pending]);

  // Focus input on mount so visitors can start typing immediately.
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Scroll isolation. `overscroll-contain` on the transcript already
  // prevents chaining once the transcript hits its scroll limits, but
  // wheel events that land on the panel's *non-scrollable* areas
  // (header, input field) still chain to the page body. On the desktop
  // side panel that means hovering the cursor over the X button and
  // scrolling moves the page underneath. This handler swallows wheel
  // events that don't originate inside the transcript so the body stays
  // put. React's onWheel runs as a passive listener and can't
  // preventDefault, so this is attached natively.
  useEffect(() => {
    const surface = surfaceRef.current;
    if (!surface) return;
    const onWheel = (e: WheelEvent) => {
      const transcript = transcriptRef.current;
      if (transcript && transcript.contains(e.target as Node)) return;
      e.preventDefault();
    };
    surface.addEventListener("wheel", onWheel, { passive: false });
    return () => surface.removeEventListener("wheel", onWheel);
  }, []);

  const send = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || pending) return;
    onSubmit(trimmed.slice(0, MAX_INPUT_CHARS));
    setValue("");
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send(value);
    }
  };

  const isEmpty = turns.length === 0;
  const canSend = value.trim().length > 0 && !pending;

  return (
    <motion.div
      ref={surfaceRef}
      onClick={(e) => e.stopPropagation()}
      className="chat-surface relative flex flex-col h-full w-full"
      initial={{ opacity: 0, filter: "blur(8px)" }}
      animate={{ opacity: 1, filter: "blur(0px)" }}
      transition={{
        opacity: CONTENT_TRANSITION,
        filter: CONTENT_TRANSITION,
      }}
    >
      {/* Header strip — "Chat" label flush-left, close button right-aligned,
          1px bottom divider so the transcript scrolls *under* this band
          instead of intersecting the X button. paddingTop carries the iOS
          notch clearance on the mobile sheet. */}
      <div
        className="shrink-0 flex items-center justify-between pl-4 pr-2"
        style={{
          paddingTop: "max(env(safe-area-inset-top, 0px), 4px)",
          paddingBottom: 4,
          borderBottom: "1px solid color-mix(in srgb, var(--color-border) 30%, transparent)",
        }}
      >
        <span className="inline-flex items-center gap-2">
          <span
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "15px",
              fontWeight: 500,
              color: "var(--color-fg)",
              lineHeight: 1,
            }}
          >
            Chat
          </span>
          <span
            style={{
              fontFamily: "var(--font-geist-mono), ui-monospace, Menlo, monospace",
              fontSize: "10px",
              fontWeight: 500,
              color: "var(--color-fg-tertiary)",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              lineHeight: 1,
            }}
          >
            Beta feature
          </span>
        </span>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close chat"
          className="rounded-full w-9 h-9 inline-flex items-center justify-center active:scale-[0.96] transition-[background-color,color,transform] duration-150 ease-out hover:bg-(--color-muted) focus:outline-none focus-visible:ring-1 focus-visible:ring-(--color-accent)"
          style={{ color: "var(--color-fg-secondary)", cursor: "pointer" }}
        >
          <CloseIcon size={12} />
        </button>
      </div>

      {/* Transcript / empty state — overscroll-contain stops the wheel
          (or touch) from chaining to the page body once the transcript
          hits its top or bottom scroll limit. */}
      <div ref={transcriptRef} className="flex-1 overflow-y-auto overscroll-contain px-4 py-4">
        {isEmpty ? (
          // h-full + mt-auto on the chips group pushes the suggested
          // prompts to the bottom of the panel (just above the input row),
          // so the greeting reads at the top and the chips are right where
          // the user's thumb already is.
          <div className="flex flex-col h-full">
            <AnimatedGreeting />
            <div className="mt-auto flex flex-wrap gap-2">
              {DEFAULT_CHIPS.map((label) => (
                <ChipPrompt
                  key={label}
                  label={label}
                  onSelect={(text) => {
                    send(text);
                  }}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            {turns.map((turn, i) => {
              // Stream cursor lives on the last assistant turn while a
              // response is in flight — replaces the standalone "…" line so
              // the typing signal sits exactly where the text is appearing.
              const isStreaming =
                pending && i === turns.length - 1 && turn.role === "assistant";
              return (
                <ChatMessage
                  key={i}
                  turn={turn}
                  onClose={onClose}
                  streaming={isStreaming}
                />
              );
            })}
            {errorLine && (
              <div
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "13px",
                  color: "var(--color-fg-tertiary)",
                  fontStyle: "italic",
                }}
              >
                {errorLine}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Input row — gutter wrapper provides 8px breathing room on every
          side (and safe-area-inset-bottom on the mobile sheet so the inner
          field clears the iOS home indicator). The inner container is the
          actual input field: inset look, 1px stroke at 40% border opacity,
          8px corners, no shadow, bg a touch lighter than the panel chrome. */}
      <div
        className="shrink-0"
        style={{
          padding: 8,
          paddingBottom: "max(env(safe-area-inset-bottom, 0px), 8px)",
        }}
      >
        <div
          // Visual styling (border, bg, focus-within ring, subtle drop
          // shadow) lives in globals.css under .chat-input-field so the
          // focus state can override border-color without !important
          // shenanigans.
          // pl-3 / pr-2 = button sits a touch closer to the right edge
          // than the textarea does to the left edge, since the button is
          // a discrete glyph that benefits from being visually anchored.
          className="chat-input-field flex items-center gap-2 pl-3 pr-2"
        >
          <textarea
            ref={inputRef}
            value={value}
            onChange={(e) => setValue(e.target.value.slice(0, MAX_INPUT_CHARS))}
            onKeyDown={onKeyDown}
            placeholder="Ask me anything…"
            rows={1}
            // 16px on the mobile sheet (prevents iOS Safari's auto-zoom on
            // focus), 14px on desktop (Marco's spec).
            className="flex-1 resize-none bg-transparent border-0 outline-none focus:outline-none focus:ring-0 placeholder:text-(--color-fg-tertiary) text-[16px] lg:text-[14px]"
            style={{
              fontFamily: "var(--font-sans)",
              lineHeight: "22px",
              color: "var(--color-fg)",
              padding: "10px 0",
              maxHeight: "120px",
              // Hard-override the browser focus outline. Tailwind's
              // `outline-none` utility was being beaten by the UA stylesheet
              // on this platform, so we kill it inline (highest specificity).
              outline: "none",
              boxShadow: "none",
              WebkitTapHighlightColor: "transparent",
            }}
          />
          {/* Always rendered (used to be conditional on `value.trim().length > 0`)
              so the send affordance is visible from the moment the panel opens —
              disabled state communicates "type to send" without making the button
              appear and disappear as the user types and clears. */}
          <button
            type="button"
            onClick={() => send(value)}
            disabled={!canSend}
            aria-label="Send message"
            className="shrink-0 rounded-full w-9 h-9 inline-flex items-center justify-center enabled:active:scale-[0.96] transition-[background-color,color,transform,opacity] duration-150 ease-out hover:bg-(--color-muted) disabled:opacity-40 focus:outline-none focus-visible:ring-1 focus-visible:ring-(--color-accent)"
            style={{ color: "var(--color-accent)", cursor: canSend ? "pointer" : "not-allowed" }}
          >
            <SendIcon size={18} />
          </button>
        </div>
      </div>

    </motion.div>
  );
}

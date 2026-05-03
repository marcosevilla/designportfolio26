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

      {/* Transcript / empty state */}
      <div ref={transcriptRef} className="flex-1 overflow-y-auto px-4 py-4">
        {isEmpty ? (
          // h-full + mt-auto on the chips group pushes the suggested
          // prompts to the bottom of the panel (just above the input row),
          // so the greeting reads at the top and the chips are right where
          // the user's thumb already is.
          <div className="flex flex-col h-full">
            <p
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "14px",
                lineHeight: "22px",
                color: "var(--color-fg-secondary)",
              }}
            >
              Hi, I'm Marco. Ask me about my work, my process, or anything else you're curious about.
            </p>
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
          className="flex items-center gap-2 px-3"
          style={{
            border: "1px solid color-mix(in srgb, var(--color-border) 40%, transparent)",
            borderRadius: 8,
            // 70% bg + 30% surface — slightly lighter than the chat-surface
            // chrome, so the input reads as a related-but-distinct surface
            // sitting *inside* the panel.
            backgroundColor: "color-mix(in srgb, var(--color-bg) 70%, var(--color-surface) 30%)",
          }}
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

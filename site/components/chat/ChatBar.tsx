"use client";

// Top-level chat surface. Owns:
//   - open/closed state
//   - transcript (sessionStorage-backed)
//   - in-flight streaming
//   - submit logic against /api/chat
//   - the morph between toolbar pill (closed) and panel (open)
//
// Mounted once globally in app/layout.tsx. The pill is a fixed
// bottom-right floating primary CTA. When opened, the pill morphs into
// the centered chat panel via shared layoutId="chat-surface".

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import ChatPanel from "./ChatPanel";
import ChatOverlay from "./ChatOverlay";
import { parseSseStream } from "./parseStream";
import type { ChatTurn } from "./ChatMessage";

const STORAGE_KEY = "chat-transcript";
const MORPH_SPRING = { type: "spring" as const, stiffness: 320, damping: 32 };

function readStored(): ChatTurn[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (t): t is ChatTurn =>
        typeof t === "object" &&
        t !== null &&
        (t.role === "user" || t.role === "assistant") &&
        typeof t.content === "string"
    );
  } catch {
    return [];
  }
}

function writeStored(turns: ChatTurn[]) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(turns));
  } catch {
    /* quota / private mode — ignore */
  }
}

function SparkGlyph({ size = 13, color = "var(--color-accent)" }: { size?: number; color?: string }) {
  return (
    <span aria-hidden style={{ fontSize: size, lineHeight: 1, color }}>
      ✸
    </span>
  );
}

// Sweep timing matches the wordmark star (Hero.tsx PlaygroundStar) so the two
// shimmer animations feel like part of the same family. 6.5s loop with the
// streak alive only between 80%–94% of the cycle (long quiet → fast pass).
const SHIMMER_KEYFRAMES = {
  opacity: [0, 0, 1, 1, 0],
  backgroundPositionX: ["150%", "150%", "150%", "-150%", "-150%"],
};
const SHIMMER_TRANSITION = {
  duration: 6.5,
  times: [0, 0.78, 0.8, 0.92, 0.94],
  repeat: Infinity,
  ease: "linear" as const,
};

export default function ChatBar() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [turns, setTurns] = useState<ChatTurn[]>([]);
  const [pending, setPending] = useState(false);
  const [errorLine, setErrorLine] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => setMounted(true), []);
  useEffect(() => setTurns(readStored()), []);
  useEffect(() => writeStored(turns), [turns]);

  const close = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setOpen(false);
    setPending(false);
  }, []);

  // ESC closes.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close]);

  const submit = useCallback(
    async (text: string) => {
      setErrorLine(null);
      setPending(true);

      const userTurn: ChatTurn = { role: "user", content: text };
      const placeholder: ChatTurn = { role: "assistant", content: "" };
      const next = [...turns, userTurn, placeholder];
      setTurns(next);

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: [...turns, userTurn] }),
          signal: controller.signal,
        });

        let assistant = "";
        let terminal: "done" | "error" | "rate_limit" | null = null;
        let rateRetry = 30;

        for await (const ev of parseSseStream(res)) {
          if (ev.kind === "delta") {
            assistant += ev.text;
            setTurns((prev) => {
              const copy = prev.slice();
              copy[copy.length - 1] = { role: "assistant", content: assistant };
              return copy;
            });
          } else if (ev.kind === "done") {
            terminal = "done";
            break;
          } else if (ev.kind === "error") {
            terminal = "error";
            break;
          } else if (ev.kind === "rate_limit") {
            terminal = "rate_limit";
            rateRetry = ev.retryAfterSec;
            break;
          }
        }

        if (terminal === "rate_limit") {
          // Drop the empty assistant placeholder, surface a polite line.
          setTurns((prev) => prev.slice(0, -1));
          setErrorLine(`Slow down a sec — try again in ~${rateRetry}s.`);
        } else if (terminal === "error" || (terminal === null && assistant.length === 0)) {
          setErrorLine("Lost connection — try asking again.");
          if (assistant.length === 0) {
            // Drop the empty assistant placeholder if nothing streamed.
            setTurns((prev) => prev.slice(0, -1));
          }
        }
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        setErrorLine("Lost connection — try asking again.");
        setTurns((prev) =>
          prev.length > 0 && prev[prev.length - 1].content === "" ? prev.slice(0, -1) : prev
        );
      } finally {
        setPending(false);
        abortRef.current = null;
      }
    },
    [turns]
  );

  const pill = (
    <motion.button
      type="button"
      onClick={() => setOpen(true)}
      layoutId="chat-surface"
      transition={MORPH_SPRING}
      aria-label="Open chat — Ask me anything"
      className="chat-cta fixed bottom-6 right-6 z-50 inline-flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-(--color-accent)"
      style={{
        height: 44,
        padding: "0 18px",
        cursor: "pointer",
        background: "var(--color-accent)",
        color: "var(--color-on-accent)",
        border: 0,
        borderRadius: 22,
        boxShadow:
          "0 12px 32px rgba(0, 0, 0, 0.18), 0 2px 6px rgba(0, 0, 0, 0.12)",
        overflow: "hidden",
        position: "fixed",
      }}
    >
      <SparkGlyph size={13} color="var(--color-on-accent)" />
      <span
        style={{
          fontFamily: "var(--font-sans)",
          fontSize: "14px",
          fontWeight: 500,
          color: "var(--color-on-accent)",
          lineHeight: 1,
          letterSpacing: "-0.005em",
        }}
      >
        Ask me anything
      </span>
      {/* Shimmer overlay — soft white sweep across the button surface on
          the same cadence as the wordmark star. Hidden under reduced-motion
          via the @media query in globals.css (.chat-cta::before). */}
      <motion.span
        aria-hidden
        className="chat-cta__shimmer"
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          borderRadius: "inherit",
          backgroundImage:
            "linear-gradient(110deg, transparent 38%, color-mix(in srgb, var(--color-on-accent) 45%, transparent) 50%, transparent 62%)",
          backgroundSize: "300% 100%",
          backgroundRepeat: "no-repeat",
          mixBlendMode: "screen",
          willChange: "background-position, opacity",
        }}
        animate={SHIMMER_KEYFRAMES}
        transition={SHIMMER_TRANSITION}
      />
    </motion.button>
  );

  return (
    <>
      {/* Pill is always rendered in the global layout when closed. When open,
          the morph target is the panel rendered via portal — the pill itself
          is unmounted so the layoutId animation has a single destination. */}
      {!open && pill}

      {mounted &&
        createPortal(
          <AnimatePresence>
            {open && (
              <>
                <ChatOverlay onClose={close} />
                <div
                  className="fixed inset-0 z-[160] flex items-center justify-center pointer-events-none p-4"
                >
                  <motion.div
                    key="chat-panel-wrap"
                    layoutId="chat-surface"
                    transition={MORPH_SPRING}
                    className="pointer-events-auto"
                  >
                    <ChatPanel
                      turns={turns}
                      pending={pending}
                      errorLine={errorLine}
                      onSubmit={submit}
                      onClose={close}
                    />
                  </motion.div>
                </div>
              </>
            )}
          </AnimatePresence>,
          document.body
        )}
    </>
  );
}

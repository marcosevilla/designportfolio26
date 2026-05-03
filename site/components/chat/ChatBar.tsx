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
// a right-aligned side panel via shared layoutId="chat-surface".
//
// At lg+ the panel is persistent and pushes <main> left (body reflow via
// `[data-chat-open="true"]` attr + CSS transition in globals.css). At <lg
// the panel is a right-side drawer that overlays content via ChatOverlay.

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import ChatPanel from "./ChatPanel";
import ChatOverlay from "./ChatOverlay";
import { parseSseStream } from "./parseStream";
import type { ChatTurn } from "./ChatMessage";

const STORAGE_KEY = "chat-transcript";
// Damping ratio ≈ 0.85 (damping / (2·√stiffness)). Reads as a soft physical
// settle without any visible overshoot — there's still a feel of inertia
// near the target, just no bounce-back. Lower damping read as cartoony.
const MORPH_SPRING = { type: "spring" as const, stiffness: 380, damping: 33 };

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
  // Below lg, the chat pill lives inside MobileToolbar's floating carousel
  // and the panel becomes a full-screen sheet. We need this in JS (not just
  // CSS) so the layoutId morph isn't paired against a display:none source —
  // that produces a 0×0 origin → tiny→fullscreen warp on open.
  const [isMobile, setIsMobile] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  // True once the user has opened the panel at least once. Drives whether
  // the pill's contents fade-blur in on mount: skip on first page load (the
  // pill should be visible immediately), play on every subsequent close so
  // the close morph reads as polished.
  const hasOpenedRef = useRef(false);

  useEffect(() => setMounted(true), []);
  useEffect(() => setTurns(readStored()), []);
  useEffect(() => writeStored(turns), [turns]);

  // Track mobile vs desktop. Below lg the pill is hidden + layoutId stripped
  // off the panel so it animates in normally instead of morphing from a
  // measureless source.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(max-width: 1023px)");
    setIsMobile(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  // Publish open state to <html> so the global CSS rule in globals.css can
  // push <main> at lg+ when the persistent side panel is open. Using a data
  // attribute (instead of a context) avoids threading a provider through the
  // entire app — and CSS handles the transition timing.
  //
  // Runs synchronously after render but BEFORE the browser paints, so the
  // body-push CSS transition kicks off on the same frame as the layoutId
  // morph. With a regular useEffect (post-paint), the panel started growing
  // a frame before <main> began sliding, which read as desynced.
  useLayoutEffect(() => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    if (open) root.setAttribute("data-chat-open", "true");
    else root.removeAttribute("data-chat-open");
    return () => root.removeAttribute("data-chat-open");
  }, [open]);

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

  // External open trigger — used by MobileToolbar's chat pill (which is a
  // sibling component, not a child, and shouldn't share state via prop
  // drilling). A window CustomEvent keeps the API trivially small without
  // pulling in a context provider just for one boolean.
  useEffect(() => {
    const onOpen = () => {
      hasOpenedRef.current = true;
      setOpen(true);
    };
    window.addEventListener("chat:open", onOpen);
    return () => window.removeEventListener("chat:open", onOpen);
  }, []);

  // Keyboard avoidance on mobile. iOS Safari does NOT shrink innerHeight or
  // 100dvh when the virtual keyboard appears — but visualViewport.height does
  // track it. Mirror that height into a `--chat-vh` CSS variable so the
  // full-screen mobile sheet (sized via this variable in globals.css) shrinks
  // to leave the composer visible above the keyboard. Cleared on close so
  // pages outside chat aren't affected.
  useEffect(() => {
    if (!open) return;
    if (typeof window === "undefined" || !window.visualViewport) return;
    const vv = window.visualViewport;
    const update = () => {
      document.documentElement.style.setProperty("--chat-vh", `${vv.height}px`);
    };
    update();
    vv.addEventListener("resize", update);
    vv.addEventListener("scroll", update);
    return () => {
      vv.removeEventListener("resize", update);
      vv.removeEventListener("scroll", update);
      document.documentElement.style.removeProperty("--chat-vh");
    };
  }, [open]);

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
      onClick={() => {
        hasOpenedRef.current = true;
        setOpen(true);
      }}
      layoutId="chat-surface"
      transition={MORPH_SPRING}
      aria-label="Open chat — Ask Marco"
      className="chat-cta fixed bottom-3 right-3 z-50 inline-flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-(--color-accent)"
      style={{
        height: 40,
        padding: "0 14px",
        cursor: "pointer",
        background: "var(--color-accent)",
        color: "var(--color-on-accent)",
        border: 0,
        /* Fully rounded — pill shape matches the floating bottom-toolbar
           pills' shape language on mobile and reads as a softer, more
           approachable affordance than the prior 10px round-rect. */
        borderRadius: 9999,
        boxShadow:
          "0 12px 32px rgba(0, 0, 0, 0.18), 0 2px 6px rgba(0, 0, 0, 0.12)",
        overflow: "hidden",
        position: "fixed",
      }}
    >
      {/* Pill contents — wrapped so we can fade-blur them in *after* the
          layoutId morph has finished collapsing the rect from panel size
          back to pill size. Without this wrapper, the children render at
          full opacity throughout the morph and read as stretched type
          while the parent's transform still scales them. On first page
          load (hasOpenedRef false) we skip the initial animation so the
          pill appears instantly. */}
      <motion.span
        className="inline-flex items-center gap-2"
        initial={hasOpenedRef.current ? { opacity: 0, filter: "blur(6px)" } : false}
        animate={{ opacity: 1, filter: "blur(0px)" }}
        transition={{ duration: 0.22, delay: 0.34, ease: [0.22, 1, 0.36, 1] }}
      >
        <SparkGlyph size={14} color="var(--color-on-accent)" />
        <span
          style={{
            fontFamily: "var(--font-geist-mono), ui-monospace, Menlo, monospace",
            fontSize: "12px",
            fontWeight: 500,
            color: "var(--color-on-accent)",
            lineHeight: 1,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
          }}
        >
          Ask Marco
        </span>
      </motion.span>
      {/* Shimmer overlay — soft white sweep across the button surface on
          the same cadence as the wordmark star. Hidden under reduced-motion
          via the @media query in globals.css (.chat-cta__shimmer). */}
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
      {/* Desktop only — below lg the chat trigger lives inside the
          MobileToolbar carousel as one of its pills (it dispatches the
          'chat:open' event listened above). Conditional render (not a
          display:none) so framer-motion's layoutId pairing isn't fed a
          0×0 source rect on mobile. */}
      {!open && !isMobile && pill}

      {mounted &&
        createPortal(
          <AnimatePresence>
            {open && (
              <>
                {/* Backdrop — only shown <lg (the drawer variant). globals.css
                    hides .chat-overlay at lg+ since the persistent side panel
                    leaves the page interactive. */}
                <ChatOverlay onClose={close} />
                {/* Panel slot — geometry handled in globals.css under
                    `.chat-panel-slot` so we can swap layouts at the lg
                    breakpoint cleanly:
                      - <lg: full-screen sheet sized to visualViewport
                        (via --chat-vh) so the keyboard doesn't cover the
                        composer.
                      - lg+: 360px-wide side panel, top:52 clears the
                        toolbar, 12px gutters bottom/right.
                    The morph pill→panel/sheet is handled by framer-motion
                    interpolating layoutId rects. */}
                <div
                  className="chat-panel-slot fixed z-[160] pointer-events-none flex flex-col"
                >
                  <motion.div
                    key="chat-panel-wrap"
                    // Below lg the source pill isn't rendered, so leaving
                    // layoutId here would make framer-motion try to morph
                    // from nothing → fullscreen warp. Strip it on mobile so
                    // the panel just renders with its own enter animation.
                    layoutId={isMobile ? undefined : "chat-surface"}
                    /* Desktop: layoutId morph from the pill handles the
                       open animation; this opacity fade just keeps chrome
                       and contents in sync on close. Mobile: no morph
                       source, so slide up from the bottom with a soft fade. */
                    initial={isMobile ? { opacity: 0, y: 24 } : { opacity: 1 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={isMobile ? { opacity: 0, y: 24 } : { opacity: 0 }}
                    transition={{
                      layout: MORPH_SPRING,
                      default: isMobile
                        ? { duration: 0.32, ease: [0.22, 1, 0.36, 1] as const }
                        : MORPH_SPRING,
                      opacity: { duration: 0.18, ease: [0.22, 1, 0.36, 1] },
                    }}
                    className="pointer-events-auto h-full w-full"
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

"use client";

// Top-level chat surface. Owns:
//   - open/closed state
//   - transcript (sessionStorage-backed)
//   - in-flight streaming
//   - submit logic against /api/chat
//   - the morph between toolbar pill (closed) and panel (open)
//
// Mounted once globally in app/layout.tsx; ChatFab (floating dock) is the
// trigger.
//
// At lg+ the panel is a persistent right-side panel that pushes <main>
// left (body reflow via `[data-chat-open="true"]` attr + CSS transition
// in globals.css — the page stays visible and interactive beside it). At
// <lg the panel is a full-screen sheet (.chat-panel-slot mobile rules).

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  motion,
  AnimatePresence,
  useReducedMotion,
  useDragControls,
} from "framer-motion";
import ChatPanel from "./ChatPanel";
import { parseSseStream } from "./parseStream";
import type { ChatTurn } from "./ChatMessage";
import { useChatOverlay } from "@/lib/ChatOverlayContext";

const STORAGE_KEY = "chat-transcript";
// Open morph (pill → panel). Slightly over-critically damped (ratio ≈
// 1.03), settling time ~0.4s. Calm enough that the panel feels deliberate
// when it appears.
const MORPH_SPRING = { type: "spring" as const, stiffness: 340, damping: 38 };
// Close morph (panel → pill). Stiffer + still critically damped — settles
// in ~0.18s. Used as the *pill's* transition because shared layout uses
// the entering element's transition, and pill is the one entering on
// close. The fast close keeps the user from waiting on the morph to play
// out before the page is interactive again.
const CLOSE_SPRING = { type: "spring" as const, stiffness: 620, damping: 50 };

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

function SparkGlyph({ size = 22, color = "var(--color-accent)" }: { size?: number; color?: string }) {
  return (
    <span
      aria-hidden
      style={{
        fontSize: size,
        lineHeight: 1,
        color,
        fontWeight: 500,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        // Geist's * sits high in its em-box; translateY pushes the visible
        // mark down so its optical center matches adjacent text.
        transform: "translateY(15%)",
      }}
    >
      *
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
  const { chatOpen: open, setChatOpen } = useChatOverlay();
  const [mounted, setMounted] = useState(false);
  const [turns, setTurns] = useState<ChatTurn[]>([]);
  const [pending, setPending] = useState(false);
  const [errorLine, setErrorLine] = useState<string | null>(null);
  // Below lg, the chat pill lives inside MobileToolbar's floating carousel
  // and the panel becomes a full-screen sheet. We need this in JS (not just
  // CSS) so the layoutId morph isn't paired against a display:none source —
  // that produces a 0×0 origin → tiny→fullscreen warp on open.
  const [isMobile, setIsMobile] = useState(false);
  const prefersReducedMotion = useReducedMotion();
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
    setChatOpen(false);
    setPending(false);
  }, [setChatOpen]);

  // Track first open for any local animation gating.
  useEffect(() => {
    if (open) hasOpenedRef.current = true;
  }, [open]);

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
        setChatOpen(true);
      }}
      // Pill fades + scales out when the panel opens. Previously this used
      // shared layoutId="chat-surface" with the panel wrapper to morph
      // between the two, but with pill + panel both anchored bottom-right,
      // framer-motion's auto-interpolated border-radius produced a lens
      // halo mid-morph. A simple opacity + scale crossfade (paired with the
      // panel's own scale-from-bottom-right open below) keeps the
      // pill→panel transition tight without that artifact.
      animate={{
        opacity: open ? 0 : 1,
        scale: open ? 0.85 : 1,
      }}
      transition={open ? { duration: 0.16, ease: [0.4, 0, 0.6, 1] } : CLOSE_SPRING}
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
        // Block clicks while the panel owns the surface, so the
        // collapsing pill underneath can't be triggered accidentally.
        pointerEvents: open ? "none" : "auto",
        transformOrigin: "bottom right",
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
        // Delay 0.16 + duration 0.18 lines the contents up to land just
        // as the close morph (CLOSE_SPRING, ~0.18s) settles into pill
        // size. Was 0.26+0.22 — too slow now that the morph itself is
        // ~0.18s instead of ~0.4s.
        transition={{ duration: 0.18, delay: 0.16, ease: [0.22, 1, 0.36, 1] }}
      >
        <SparkGlyph size={22} color="var(--color-on-accent)" />
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

  // Suppress the unused `pill` warning — kept above as a reference for
  // restoring the standalone CTA if HeaderToolbar is ever removed.
  void pill;

  // Desktop panel slides in from the right edge on the same duration/easing
  // as the body-push CSS transition (globals.css) so the panel and <main>
  // move as one gesture. Reduced motion: opacity only.
  const desktopMotion = prefersReducedMotion
    ? {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: 0.2, ease: [0.22, 1, 0.36, 1] as const },
      }
    : {
        // 112% ≈ panel width + gutter — fully off-screen incl. shadow.
        initial: { x: "112%", opacity: 0.6 },
        animate: { x: 0, opacity: 1 },
        exit: { x: "112%", opacity: 0.6 },
        transition: { duration: 0.46, ease: [0.22, 1, 0.36, 1] as const },
      };

  // Mobile bottom sheet: iOS-style slide-up with a spring settle. Exit is a
  // quicker tween so dismissal feels immediate.
  const sheetMotion = prefersReducedMotion
    ? {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: 0.2, ease: [0.22, 1, 0.36, 1] as const },
      }
    : {
        initial: { y: "100%" },
        animate: { y: 0 },
        exit: {
          y: "100%",
          transition: {
            type: "tween" as const,
            duration: 0.28,
            ease: [0.4, 0, 1, 1] as const,
          },
        },
        transition: { type: "spring" as const, stiffness: 420, damping: 42 },
      };

  // Drag-to-dismiss on the sheet grabber. dragListener is off on the sheet
  // itself so transcript scrolling never fights the gesture — only the
  // grabber strip starts a drag (dragControls.start in its onPointerDown).
  const dragControls = useDragControls();

  return (
    <>
      {mounted &&
        createPortal(
          <AnimatePresence>
            {open && isMobile && (
              <motion.div
                key="chat-scrim"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
                className="fixed inset-0 z-[135]"
                style={{ backgroundColor: "rgba(0, 0, 0, 0.35)" }}
                onClick={close}
                aria-hidden
              />
            )}
            {open && isMobile && (
              <motion.div
                key="chat-sheet"
                {...sheetMotion}
                drag={prefersReducedMotion ? false : "y"}
                dragListener={false}
                dragControls={dragControls}
                dragConstraints={{ top: 0 }}
                dragSnapToOrigin
                onDragEnd={(_, info) => {
                  if (info.offset.y > 140 || info.velocity.y > 600) close();
                }}
                // Slot geometry (globals.css .chat-panel-slot) tracks
                // --chat-vh, so the frame — and the bottom-anchored sheet
                // inside it — shrinks with the iOS keyboard and the
                // composer stays visible. The transparent frame is
                // pointer-events-none so taps in the top peek strip land
                // on the scrim and close the sheet. z ≥ 140 covers the
                // SiteHeader (z-130).
                className="chat-panel-slot fixed z-[140] pointer-events-none flex flex-col"
                role="dialog"
                aria-modal="true"
                aria-label="Chat with Marco"
              >
                <div
                  className="pointer-events-auto relative flex flex-col mt-auto w-full"
                  style={{ height: "calc(100% - 32px)" }}
                >
                  {/* Grabber — the drag surface for dismissal. touch-none
                      stops the browser claiming the gesture for scroll. */}
                  <div
                    className="absolute top-0 inset-x-0 z-10 flex justify-center pt-2 pb-3 touch-none"
                    style={{ cursor: "grab" }}
                    onPointerDown={(e) => dragControls.start(e)}
                  >
                    <div
                      aria-hidden
                      style={{
                        width: 36,
                        height: 5,
                        borderRadius: 999,
                        background:
                          "color-mix(in srgb, var(--color-fg) 22%, transparent)",
                      }}
                    />
                  </div>
                  <ChatPanel
                    turns={turns}
                    pending={pending}
                    errorLine={errorLine}
                    onSubmit={submit}
                    onClose={close}
                  />
                </div>
              </motion.div>
            )}
            {open && !isMobile && (
              <motion.div
                key="chat-panel"
                {...desktopMotion}
                // Slot geometry lives in globals.css: 360px bottom-right
                // panel at lg+, where the [data-chat-open] body push makes
                // room beside it. Sits beside content, under the header.
                className="chat-panel-slot fixed z-[110] flex flex-col"
                role="dialog"
                aria-label="Chat with Marco"
              >
                <ChatPanel
                  turns={turns}
                  pending={pending}
                  errorLine={errorLine}
                  onSubmit={submit}
                  onClose={close}
                />
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </>
  );
}

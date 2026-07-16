"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useChatOverlay } from "@/lib/ChatOverlayContext";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const EASE = [0.22, 1, 0.36, 1] as const;

function ChatBubbleIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M2.5 3.5h11v7H6.5L3.5 13V10.5h-1z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Floating chat-overlay trigger — round button docked beside the music
 *  FAB in the bottom-right corner, sharing its exact chrome (44px circle,
 *  theme bg, hairline border, soft drop shadow, blur entrance). Hidden
 *  while the chat overlay is open. */
export default function ChatFab() {
  const { chatOpen, setChatOpen } = useChatOverlay();
  return (
    <AnimatePresence initial={false}>
      {!chatOpen && (
        <TooltipProvider delay={100}>
          <Tooltip>
            <TooltipTrigger
              render={
                <motion.button
                  key="chat-fab"
                  type="button"
                  onClick={() => setChatOpen(true)}
                  aria-label="Open chat — ask me anything"
                  initial={{ opacity: 0, scale: 0.85, filter: "blur(6px)" }}
                  animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                  exit={{ opacity: 0, scale: 0.85, filter: "blur(6px)" }}
                  whileTap={{
                    scale: 0.96,
                    // Snappier than the 0.22s enter/exit tween — at that
                    // speed a quick click releases before the press is
                    // perceptible.
                    transition: { duration: 0.1, ease: EASE },
                  }}
                  transition={{ duration: 0.22, ease: EASE }}
                  className="relative flex items-center justify-center cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-(--color-accent)"
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: "50%",
                    backgroundColor: "var(--color-bg)",
                    border: "0.5px solid var(--color-border)",
                    boxShadow:
                      "0 2px 6px -2px rgba(0,0,0,0.08), 0 8px 24px -8px rgba(0,0,0,0.14)",
                    color: "var(--color-fg-secondary)",
                  }}
                />
              }
            >
              <ChatBubbleIcon size={16} />
            </TooltipTrigger>
            <TooltipContent>Ask me anything</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </AnimatePresence>
  );
}

"use client";

import { useChatOverlay } from "@/lib/ChatOverlayContext";

function ChatBubbleIcon({ size = 14 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden
    >
      <path
        d="M2.5 3.5h11v7H6.5L3.5 13V10.5h-1z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Inline chat-overlay trigger. Outlined CTA — light border stroke,
 *  secondary text + icon, no fill. Sits in the body content between
 *  the bio and the projects section. */
export default function AskMeAnythingButton() {
  const { setChatOpen } = useChatOverlay();
  return (
    <button
      type="button"
      onClick={() => setChatOpen(true)}
      aria-label="Open chat — ask me anything"
      className="outlined-cta inline-flex items-center gap-2 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-(--color-accent) cursor-pointer"
      style={{
        height: 32,
        padding: "0 8px",
        background: "transparent",
        color: "var(--color-fg-secondary)",
        border: "0.5px solid var(--color-border)",
        borderRadius: 4,
      }}
    >
      <ChatBubbleIcon size={14} />
      <span
        style={{
          fontFamily: "var(--font-geist-mono), ui-monospace, Menlo, monospace",
          fontSize: 11,
          fontWeight: 500,
          lineHeight: 1,
          textTransform: "uppercase",
          letterSpacing: "0.04em",
          whiteSpace: "nowrap",
        }}
      >
        Ask me anything
      </span>
    </button>
  );
}

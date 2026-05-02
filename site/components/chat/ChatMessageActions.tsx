"use client";

// Tiny action row under each assistant message. v1 has only Copy.
// Strips markdown wrappers + the artifact marker so recruiters paste clean
// prose into Slack/email/Notion.

import { useState } from "react";
import { plainTextFromMarkup } from "./parseChatMarkup";

const FEEDBACK_MS = 1200;

function CopyIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="4" width="9" height="10" rx="1.5" />
      <path d="M3 11V3a1 1 0 0 1 1-1h7" />
    </svg>
  );
}

function CheckIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 8.5 6.5 12 13 5" />
    </svg>
  );
}

export default function ChatMessageActions({ raw }: { raw: string }) {
  const [copied, setCopied] = useState(false);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(plainTextFromMarkup(raw));
      setCopied(true);
      setTimeout(() => setCopied(false), FEEDBACK_MS);
    } catch {
      // Clipboard write can fail (permissions, insecure context). Silently
      // ignore — there's no good UX recovery for "copy failed."
    }
  };

  return (
    <div className="mt-2 flex items-center gap-2">
      <button
        type="button"
        onClick={onCopy}
        aria-label={copied ? "Copied" : "Copy message"}
        className="relative inline-flex items-center gap-1 transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-(--color-accent) rounded before:absolute before:inset-0 before:-m-3 before:content-['']"
        style={{
          fontFamily: "var(--font-geist-mono), ui-monospace, Menlo, monospace",
          fontSize: "11px",
          color: copied ? "var(--color-accent)" : "var(--color-fg-tertiary)",
          padding: "2px 4px",
          cursor: "pointer",
        }}
      >
        {copied ? <CheckIcon /> : <CopyIcon />}
        <span>{copied ? "Copied" : "Copy"}</span>
      </button>
    </div>
  );
}

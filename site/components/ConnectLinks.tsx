"use client";

import { useState, useCallback } from "react";

const EMAIL = "marcogsevilla@gmail.com";

export default function ConnectLinks() {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(EMAIL);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard write rejected (e.g., insecure context). Fail silently.
    }
  }, []);

  return (
    <p className="mt-6">
      <span>Let&apos;s connect: </span>
      <a
        href="https://twitter.com/marcowitss"
        target="_blank"
        rel="noopener noreferrer"
        className="dotted-link dotted-link--inline"
      >
        @marcowitss
      </a>
      <span>, </span>
      <a
        href="https://www.linkedin.com/in/marcogsevilla/"
        target="_blank"
        rel="noopener noreferrer"
        className="dotted-link dotted-link--inline"
      >
        LinkedIn
      </a>
      <span>, </span>
      <span className="group/email relative inline-flex items-center gap-1.5 align-baseline">
        <a
          href={`mailto:${EMAIL}`}
          className="dotted-link dotted-link--inline"
        >
          Email
        </a>
        <button
          type="button"
          onClick={handleCopy}
          aria-label={copied ? "Copied" : `Copy ${EMAIL} to clipboard`}
          className="opacity-0 group-hover/email:opacity-100 group-focus-within/email:opacity-100 focus-visible:opacity-100 transition-opacity duration-150 cursor-pointer"
          style={{
            fontSize: "11px",
            fontFamily: "var(--font-mono-system)",
            color: "var(--color-fg-tertiary)",
            border: "1px solid var(--color-border)",
            borderRadius: "9999px",
            padding: "1px 8px",
            lineHeight: 1.4,
            backgroundColor: "var(--color-bg)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "var(--color-accent)";
            e.currentTarget.style.borderColor = "var(--color-accent)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "var(--color-fg-tertiary)";
            e.currentTarget.style.borderColor = "var(--color-border)";
          }}
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </span>
    </p>
  );
}

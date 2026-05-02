"use client";

// Renders a single chat turn.
// User: right-aligned accent-tinted bubble.
// Assistant: left-aligned plain prose (no bubble) so it reads like Marco
// talking, not a chat-app dialog. Inline links + optional case-study unfurl
// + copy button below.

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { parseChatMarkup, extractArtifact } from "./parseChatMarkup";
import CaseStudyCardUnfurl from "./CaseStudyCardUnfurl";
import ChatMessageActions from "./ChatMessageActions";
import { isStudySlug } from "@/lib/chat/study-metadata";

const FADE_IN = {
  initial: { opacity: 0, y: 4 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] as const },
};

function InAppLink({ label, onClose }: { label: string; onClose: () => void }) {
  // The "about" / "resume" link routes back to home with About-me state.
  // We use a Next link with a query string the home page reads on mount.
  // (HomeLayout already centralizes aboutMeOpen state — see follow-up note.)
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={() => {
        onClose();
        router.push("/?about=1");
      }}
      className="dotted-link dotted-link--inline"
      style={{ border: 0, padding: 0, cursor: "pointer", font: "inherit", backgroundColor: "transparent" }}
    >
      {label}
    </button>
  );
}

function RenderSegments({ raw, onClose }: { raw: string; onClose: () => void }) {
  const segments = parseChatMarkup(raw);
  return (
    <>
      {segments.map((seg, i) => {
        if (seg.kind === "text") return <span key={i}>{seg.text}</span>;
        if (seg.kind === "bold") {
          return <strong key={i} style={{ fontWeight: 600 }}>{seg.text}</strong>;
        }
        if (seg.kind === "italic") {
          return <em key={i}>{seg.text}</em>;
        }
        if (seg.inApp) {
          return <InAppLink key={i} label={seg.label} onClose={onClose} />;
        }
        if (seg.external) {
          return (
            <a
              key={i}
              href={seg.href}
              target={seg.href.startsWith("mailto:") ? undefined : "_blank"}
              rel="noopener noreferrer"
              className="dotted-link dotted-link--inline"
            >
              {seg.label}
            </a>
          );
        }
        return (
          <Link key={i} href={seg.href} className="dotted-link dotted-link--inline">
            {seg.label}
          </Link>
        );
      })}
    </>
  );
}

export type ChatTurn = { role: "user" | "assistant"; content: string };

export default function ChatMessage({
  turn,
  onClose,
  streaming = false,
}: {
  turn: ChatTurn;
  onClose: () => void;
  /** True only for the assistant turn currently receiving stream chunks.
   *  Renders a trailing ✸ cursor at the end of the text, blinking via the
   *  .chat-typing-cursor CSS class. Hides the copy/feedback actions until
   *  the stream completes. */
  streaming?: boolean;
}) {
  if (turn.role === "user") {
    return (
      <motion.div {...FADE_IN} className="flex justify-end">
        <div
          className="max-w-[80%] rounded-2xl px-3 py-2"
          style={{
            backgroundColor: "color-mix(in srgb, var(--color-accent) 14%, transparent)",
            color: "var(--color-fg)",
            fontFamily: "var(--font-sans)",
            fontSize: "16px",
            lineHeight: "26px",
            whiteSpace: "pre-wrap",
          }}
        >
          {turn.content}
        </div>
      </motion.div>
    );
  }

  const { slug } = extractArtifact(turn.content);

  return (
    <motion.div {...FADE_IN}>
      <div
        style={{
          fontFamily: "var(--font-sans)",
          fontSize: "16px",
          lineHeight: "26px",
          color: "var(--color-fg)",
          whiteSpace: "pre-wrap",
        }}
      >
        <RenderSegments raw={turn.content} onClose={onClose} />
        {streaming && (
          <span aria-hidden className="chat-typing-cursor" style={{ fontSize: "0.85em" }}>
            ✸
          </span>
        )}
      </div>
      {/* Hold artifact + actions until the stream finishes so partially-
          parsed content (e.g. a half-typed `<artifact slug=…`) doesn't
          flicker an unfurl card mid-response. */}
      {!streaming && slug && isStudySlug(slug) && <CaseStudyCardUnfurl slug={slug} />}
      {!streaming && <ChatMessageActions raw={turn.content} />}
    </motion.div>
  );
}

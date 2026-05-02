"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { usePasswordGate } from "@/lib/PasswordGateContext";
import { LockIcon, BackChevronIcon, EmailIcon, LinkedInIcon } from "./Icons";
import { typescale } from "@/lib/typography";

const EMAIL = "marcogsevilla@gmail.com";
const LINKEDIN_URL = "https://www.linkedin.com/in/marcogsevilla/";

type CardModeProps = {
  mode: "card";
  locked: boolean;
  children: React.ReactNode;
};

type PageModeProps = {
  mode: "page";
  locked: boolean;
  /** Page title shown on the locked placeholder (case study or Playground card title). */
  title: string;
  /** Subtitle / one-liner shown below the title. */
  subtitle?: string;
  /** Where the return arrow links. e.g. "/work" for case studies, "/play" for Playground. */
  backHref: string;
  children: React.ReactNode;
};

type LockGateProps = CardModeProps | PageModeProps;

export default function LockGate(props: LockGateProps) {
  const { unlocked, hydrated, requestUnlock } = usePasswordGate();

  // Always passthrough when not locked or already unlocked.
  if (!props.locked || unlocked) return <>{props.children}</>;

  if (props.mode === "card") {
    return <LockedCardWrapper onClick={requestUnlock}>{props.children}</LockedCardWrapper>;
  }

  // Page mode — render placeholder once hydrated. Pre-hydration we
  // render nothing to avoid leaking content from the SSR pass.
  if (!hydrated) return null;
  return (
    <LockedPagePlaceholder
      title={props.title}
      subtitle={props.subtitle}
      backHref={props.backHref}
      onUnlockClick={requestUnlock}
    />
  );
}

// ── Card mode ──

// Wraps the existing card markup in a relative container and overlays a
// click-trapping button on hover. The original card still renders its
// resting state at full opacity so the page reads the same when no
// pointer is over the card. On hover, the overlay's backdrop-blur + dim
// covers the card and reveals the lock icon + micro-copy.
function LockedCardWrapper({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <div className="relative group">
      {/* Original card — unmodified. The overlay sits above it and
          intercepts pointer events when locked, so the underlying
          card's hover effects (bento glow, scale) never fire. */}
      <div className="relative">{children}</div>

      <button
        type="button"
        onClick={onClick}
        aria-label="Locked — click to view unlock options"
        className="absolute inset-0 flex flex-col items-center justify-center gap-2 cursor-pointer opacity-0 group-hover:opacity-100 focus-visible:opacity-100 outline-none transition-opacity duration-200 ease-out"
        style={{
          background: "color-mix(in oklab, var(--color-bg) 50%, transparent)",
          backdropFilter: "blur(2px)",
          WebkitBackdropFilter: "blur(2px)",
        }}
      >
        <LockIcon size={24} style={{ color: "var(--color-fg-secondary)" }} />
        <span
          style={{
            fontFamily: "var(--font-geist-mono), ui-monospace, Menlo, monospace",
            fontSize: "11px",
            fontWeight: 500,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            color: "var(--color-fg-tertiary)",
          }}
        >
          In progress — click for details
        </span>
      </button>
    </div>
  );
}

// ── Page mode ──

function LockedPagePlaceholder({
  title,
  subtitle,
  backHref,
  onUnlockClick,
}: {
  title: string;
  subtitle?: string;
  backHref: string;
  onUnlockClick: () => void;
}) {
  return (
    <div className="relative">
      {/* Viewport-pinned return arrow at top-left, sits above page
          content but below the unlock modal (z-[100]). */}
      <Link
        href={backHref}
        className="fixed top-6 left-6 z-50 inline-flex items-center gap-1.5 transition-colors"
        style={{
          ...typescale.body,
          color: "var(--color-fg-secondary)",
        }}
        onMouseEnter={(e) => { e.currentTarget.style.color = "var(--color-fg)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.color = "var(--color-fg-secondary)"; }}
        onFocus={(e) => { e.currentTarget.style.color = "var(--color-fg)"; }}
        onBlur={(e) => { e.currentTarget.style.color = "var(--color-fg-secondary)"; }}
      >
        <BackChevronIcon size={14} />
        Back
      </Link>

      <motion.div
        className="min-h-[60vh] flex flex-col items-center justify-center text-center px-6 py-24"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <h1
          style={{
            ...typescale.caseStudyHero,
            color: "var(--color-fg)",
            marginBottom: 8,
            maxWidth: 720,
          }}
        >
          {title}
        </h1>
        {subtitle && (
          <p
            style={{
              ...typescale.subtitle,
              color: "var(--color-fg-secondary)",
              maxWidth: 560,
              marginBottom: 32,
            }}
          >
            {subtitle}
          </p>
        )}

        <div
          className="flex items-center justify-center mb-4"
          style={{
            width: 44,
            height: 44,
            background: "var(--color-muted)",
            color: "var(--color-fg-secondary)",
          }}
        >
          <LockIcon size={20} />
        </div>

        <h2
          style={{ ...typescale.h3, color: "var(--color-fg)", marginBottom: 6 }}
        >
          Wax on. Wax off.
        </h2>
        <p
          style={{
            ...typescale.body,
            color: "var(--color-fg-secondary)",
            maxWidth: 420,
            marginBottom: 24,
          }}
        >
          This case study is currently being polished. Reach out directly if you'd like early access.
        </p>

        <div className="flex items-center gap-2">
          <a
            href={`mailto:${EMAIL}`}
            className="inline-flex items-center gap-2 px-4 py-2.5 transition-colors"
            style={{
              ...typescale.body,
              fontWeight: 500,
              color: "var(--color-fg)",
              background: "var(--color-bg)",
              border: "1px solid var(--color-border)",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "var(--color-accent)"; e.currentTarget.style.borderColor = "var(--color-accent)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "var(--color-fg)"; e.currentTarget.style.borderColor = "var(--color-border)"; }}
            onFocus={(e) => { e.currentTarget.style.color = "var(--color-accent)"; e.currentTarget.style.borderColor = "var(--color-accent)"; }}
            onBlur={(e) => { e.currentTarget.style.color = "var(--color-fg)"; e.currentTarget.style.borderColor = "var(--color-border)"; }}
          >
            <EmailIcon size={14} />
            Email
          </a>
          <a
            href={LINKEDIN_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 transition-colors"
            style={{
              ...typescale.body,
              fontWeight: 500,
              color: "var(--color-fg)",
              background: "var(--color-bg)",
              border: "1px solid var(--color-border)",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "var(--color-accent)"; e.currentTarget.style.borderColor = "var(--color-accent)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "var(--color-fg)"; e.currentTarget.style.borderColor = "var(--color-border)"; }}
            onFocus={(e) => { e.currentTarget.style.color = "var(--color-accent)"; e.currentTarget.style.borderColor = "var(--color-accent)"; }}
            onBlur={(e) => { e.currentTarget.style.color = "var(--color-fg)"; e.currentTarget.style.borderColor = "var(--color-border)"; }}
          >
            <LinkedInIcon size={14} />
            LinkedIn
          </a>
          <button
            type="button"
            onClick={onUnlockClick}
            className="inline-flex items-center gap-2 px-4 py-2.5 transition-opacity"
            style={{
              ...typescale.body,
              fontWeight: 500,
              color: "var(--color-bg)",
              background: "var(--color-fg)",
            }}
          >
            Got a code?
          </button>
        </div>
      </motion.div>
    </div>
  );
}

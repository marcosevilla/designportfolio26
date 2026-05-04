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
  /**
   * Tailwind radius class for the overlay. Must match the underlying card so the
   * dim/blur layer doesn't show slivers of the card at the corners. Defaults to
   * `rounded-2xl` (Playground cards). Pass `rounded-none` for sharp work cards.
   */
  cardRadius?: string;
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
    return (
      <LockedCardWrapper onClick={requestUnlock} cardRadius={props.cardRadius ?? "rounded-2xl"}>
        {props.children}
      </LockedCardWrapper>
    );
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
// transparent click-trap covering the entire card so clicks anywhere
// route to the unlock modal. The visible blur + lock label is rendered
// separately by `LockedFrameBadge` (placed inside the card's image/video
// frame by the consuming component) so only the media area dims — title
// and description stay legible.
function LockedCardWrapper({
  children,
  onClick,
  cardRadius,
}: {
  children: React.ReactNode;
  onClick: () => void;
  cardRadius: string;
}) {
  return (
    <div className="relative group">
      {/* Original card — unmodified. The transparent button below sits
          above it and intercepts pointer events when locked, so the
          underlying card's hover effects (bento glow, scale) never fire
          and clicks anywhere route to the unlock modal. */}
      <div className="relative">{children}</div>

      <button
        type="button"
        onClick={onClick}
        aria-label="Locked — click to view unlock options"
        className={`absolute inset-0 cursor-pointer ${cardRadius} outline-none focus-visible:ring-2 focus-visible:ring-(--color-accent)`}
      />
    </div>
  );
}

// Visible lock affordance — placed inside a card's image/video frame so
// only the media dims on hover. The parent must apply `group` to the
// outer card link/button (already done by both GalleryCard and
// PlaygroundCardItem) so the hover state propagates through.
export function LockedFrameBadge({ locked }: { locked: boolean }) {
  if (!locked) return null;
  return (
    <div
      className="absolute inset-0 flex flex-col items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ease-out pointer-events-none"
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
        className="fixed top-3 left-3 z-50 inline-flex items-center gap-1.5 px-3 py-2 -m-1 transition-colors"
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

      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-6 py-24">
        <motion.h1
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          style={{
            ...typescale.caseStudyHero,
            color: "var(--color-fg)",
            marginBottom: 8,
            maxWidth: 720,
            textWrap: "balance",
          }}
        >
          {title}
        </motion.h1>
        {subtitle && (
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut", delay: 0.1 }}
            style={{
              ...typescale.subtitle,
              color: "var(--color-fg-secondary)",
              maxWidth: 560,
              marginBottom: 32,
              textWrap: "pretty",
            }}
          >
            {subtitle}
          </motion.p>
        )}

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut", delay: 0.2 }}
          className="flex flex-col items-center"
        >
          <div
            className="flex items-center justify-center mb-4 rounded-2xl"
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
            style={{ ...typescale.h3, color: "var(--color-fg)", marginBottom: 6, textWrap: "balance" }}
          >
            Under construction
          </h2>
          <p
            style={{
              ...typescale.body,
              color: "var(--color-fg-secondary)",
              maxWidth: 420,
              marginBottom: 24,
              textWrap: "pretty",
            }}
          >
            This case study is currently being polished. Reach out directly if you'd like early access.
          </p>

          <div className="flex items-center gap-2">
            <a
              href={`mailto:${EMAIL}`}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl active:scale-[0.96] transition-[color,border-color,transform] duration-150 ease-out"
              style={{
                fontFamily: "var(--font-geist-mono), ui-monospace, Menlo, monospace",
                fontSize: "12px",
                fontWeight: 500,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
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
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl active:scale-[0.96] transition-[color,border-color,transform] duration-150 ease-out"
              style={{
                fontFamily: "var(--font-geist-mono), ui-monospace, Menlo, monospace",
                fontSize: "12px",
                fontWeight: 500,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
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
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl active:scale-[0.96] transition-transform duration-150 ease-out"
              style={{
                fontFamily: "var(--font-geist-mono), ui-monospace, Menlo, monospace",
                fontSize: "12px",
                fontWeight: 500,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: "var(--color-bg)",
                background: "var(--color-fg)",
              }}
            >
              Got a code?
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { usePasswordGate } from "@/lib/PasswordGateContext";
import { LockIcon, CloseIcon, EmailIcon, LinkedInIcon } from "./Icons";
import { typescale } from "@/lib/typography";

const EMAIL = "marcogsevilla@gmail.com";
const LINKEDIN_URL = "https://www.linkedin.com/in/marcogsevilla/";

export default function PasswordModal() {
  const { isModalOpen, closeModal, attemptUnlock } = usePasswordGate();
  const [value, setValue] = useState("");
  const [error, setError] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Reset state on open. Don't autofocus the input — primary CTAs are
  // email/LinkedIn, so initial focus stays on the close button (a11y
  // default for the dialog).
  useEffect(() => {
    if (isModalOpen) {
      setValue("");
      setError(false);
      setSubmitting(false);
    }
  }, [isModalOpen]);

  useEffect(() => {
    if (!isModalOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isModalOpen, closeModal]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    // try/finally guarantees we reset the submitting flag even if
    // crypto.subtle.digest rejects (e.g., non-secure context). Otherwise
    // the button would stick on "…" until the modal closes.
    let ok = false;
    try {
      ok = await attemptUnlock(value);
    } finally {
      setSubmitting(false);
    }
    if (!ok) {
      setError(true);
      inputRef.current?.focus();
      inputRef.current?.select();
    }
    // On success, the provider closes the modal — no extra UI here.
  };

  return (
    <AnimatePresence>
      {isModalOpen && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
        >
          <button
            aria-label="Close dialog"
            tabIndex={-1}
            onClick={closeModal}
            className="absolute inset-0"
            style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(8px)" }}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="password-modal-title"
            className="relative w-full max-w-[420px] rounded-2xl"
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
            style={{
              background: "var(--color-surface-raised)",
              border: "1px solid var(--color-border)",
              padding: "32px",
            }}
          >
            <button
              onClick={closeModal}
              aria-label="Close"
              className="absolute top-2 right-2 flex items-center justify-center w-10 h-10 rounded-full active:scale-[0.96] transition-[color,transform] duration-150 ease-out"
              style={{ color: "var(--color-fg-tertiary)" }}
              onMouseEnter={(e) => { e.currentTarget.style.color = "var(--color-fg)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = "var(--color-fg-tertiary)"; }}
            >
              <CloseIcon size={12} />
            </button>

            <div
              className="flex items-center justify-center mb-4 rounded-xl"
              style={{
                width: 36,
                height: 36,
                background: "var(--color-muted)",
                color: "var(--color-fg-secondary)",
              }}
            >
              <LockIcon size={16} />
            </div>

            <h2
              id="password-modal-title"
              style={{ ...typescale.h3, color: "var(--color-fg)", marginBottom: 4, textWrap: "balance" }}
            >
              Wax on. Wax off.
            </h2>
            <p
              style={{
                ...typescale.body,
                color: "var(--color-fg-secondary)",
                marginBottom: 24,
                textWrap: "pretty",
              }}
            >
              This case study is currently being polished. Reach out directly if you'd like early access.
            </p>

            {/* Primary CTAs — email + LinkedIn. */}
            <div className="grid grid-cols-2 gap-2">
              <a
                href={`mailto:${EMAIL}`}
                className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl active:scale-[0.96] transition-[color,border-color,transform] duration-150 ease-out"
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
              >
                <EmailIcon size={14} />
                Email
              </a>
              <a
                href={LINKEDIN_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl active:scale-[0.96] transition-[color,border-color,transform] duration-150 ease-out"
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
              >
                <LinkedInIcon size={14} />
                LinkedIn
              </a>
            </div>

            {/* "Got a code?" divider */}
            <div className="flex items-center gap-3 my-6">
              <span className="flex-1" style={{ height: 1, background: "var(--color-border)" }} />
              <span
                style={{
                  fontFamily: "var(--font-geist-mono), ui-monospace, Menlo, monospace",
                  fontSize: "11px",
                  color: "var(--color-fg-tertiary)",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                }}
              >
                Got a code?
              </span>
              <span className="flex-1" style={{ height: 1, background: "var(--color-border)" }} />
            </div>

            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                ref={inputRef}
                type="password"
                value={value}
                onChange={(e) => {
                  setValue(e.target.value);
                  if (error) setError(false);
                }}
                placeholder="Enter code"
                aria-label="Unlock code"
                aria-invalid={error || undefined}
                autoComplete="off"
                spellCheck={false}
                className="flex-1 px-3 py-2 rounded-xl outline-none"
                style={{
                  fontFamily: "var(--font-geist-mono), ui-monospace, Menlo, monospace",
                  fontSize: "12px",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  color: "var(--color-fg)",
                  background: "var(--color-bg)",
                  border: `1px solid ${error ? "var(--color-accent)" : "var(--color-border)"}`,
                }}
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl enabled:active:scale-[0.96] transition-[opacity,transform] duration-150 ease-out"
                style={{
                  fontFamily: "var(--font-geist-mono), ui-monospace, Menlo, monospace",
                  fontSize: "12px",
                  fontWeight: 500,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  color: "var(--color-bg)",
                  background: "var(--color-fg)",
                  cursor: value.length === 0 || submitting ? "not-allowed" : "pointer",
                  opacity: value.length === 0 || submitting ? 0.5 : 1,
                  minWidth: 64,
                }}
                disabled={value.length === 0 || submitting}
              >
                {submitting ? "…" : "Go"}
              </button>
            </form>
            {error && (
              <p
                role="alert"
                style={{
                  ...typescale.label,
                  color: "var(--color-accent)",
                  marginTop: 8,
                }}
              >
                Wrong code. Reach out and I'll send you one.
              </p>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

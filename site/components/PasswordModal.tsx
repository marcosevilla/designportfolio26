"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { usePasswordGate } from "@/lib/PasswordGateContext";
import { LockIcon, CloseIcon } from "./Icons";
import { typescale } from "@/lib/typography";

export default function PasswordModal() {
  const { isModalOpen, closeModal, attemptUnlock } = usePasswordGate();
  const [value, setValue] = useState("");
  const [error, setError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isModalOpen) {
      setValue("");
      setError(false);
      const id = window.setTimeout(() => inputRef.current?.focus(), 60);
      return () => window.clearTimeout(id);
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const ok = attemptUnlock(value);
    if (!ok) {
      setError(true);
      inputRef.current?.focus();
      inputRef.current?.select();
    }
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
            aria-label="Close"
            onClick={closeModal}
            className="absolute inset-0"
            style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(8px)" }}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="password-modal-title"
            className="relative w-full max-w-[400px]"
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
            style={{
              background: "var(--color-surface-raised)",
              border: "1px solid var(--color-border)",
              padding: "28px",
            }}
          >
            <button
              onClick={closeModal}
              aria-label="Close password prompt"
              className="absolute top-3 right-3 flex items-center justify-center w-7 h-7 transition-colors"
              style={{ color: "var(--color-fg-tertiary)" }}
              onMouseEnter={(e) => { e.currentTarget.style.color = "var(--color-fg)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = "var(--color-fg-tertiary)"; }}
            >
              <CloseIcon size={12} />
            </button>

            <div
              className="flex items-center justify-center mb-4"
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
              style={{ ...typescale.h3, color: "var(--color-fg)", marginBottom: 4 }}
            >
              Work in progress
            </h2>
            <p
              style={{
                ...typescale.body,
                color: "var(--color-fg-secondary)",
                marginBottom: 20,
              }}
            >
              These case studies aren't quite ready for the world yet. Drop in the password to take a peek.
            </p>

            <form onSubmit={handleSubmit}>
              <input
                ref={inputRef}
                type="password"
                value={value}
                onChange={(e) => {
                  setValue(e.target.value);
                  if (error) setError(false);
                }}
                placeholder="Password"
                aria-label="Password"
                aria-invalid={error || undefined}
                autoComplete="off"
                spellCheck={false}
                className="w-full px-3 py-2 outline-none"
                style={{
                  ...typescale.body,
                  color: "var(--color-fg)",
                  background: "var(--color-bg)",
                  border: `1px solid ${error ? "var(--color-accent)" : "var(--color-border)"}`,
                }}
              />
              {error && (
                <p
                  role="alert"
                  style={{
                    ...typescale.label,
                    color: "var(--color-accent)",
                    marginTop: 8,
                  }}
                >
                  Not quite — try again.
                </p>
              )}
              <button
                type="submit"
                className="w-full mt-4 px-4 py-2 transition-opacity"
                style={{
                  ...typescale.body,
                  fontWeight: 500,
                  color: "var(--color-bg)",
                  background: "var(--color-fg)",
                  cursor: value.length === 0 ? "not-allowed" : "pointer",
                  opacity: value.length === 0 ? 0.5 : 1,
                }}
                disabled={value.length === 0}
              >
                Unlock
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

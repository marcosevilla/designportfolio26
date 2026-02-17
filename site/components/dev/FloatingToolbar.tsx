"use client";

import { useInlineEditor } from "@/lib/InlineEditorContext";
import { motion, AnimatePresence } from "framer-motion";
import { SPRING_HEAVY } from "@/lib/springs";
import { CloseIcon, EditPencilIcon } from "../Icons";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function FloatingToolbar() {
  const pathname = usePathname();
  const {
    editMode,
    toggleEditMode,
    isDirty,
    saving,
    lastError,
    save,
    revert,
    pendingEdits,
  } = useInlineEditor();

  const [placeholderCount, setPlaceholderCount] = useState(0);

  // Only show on case study pages
  const isCaseStudy = pathname.startsWith("/work/");

  // Count image placeholders when edit mode is toggled
  useEffect(() => {
    if (!editMode) { setPlaceholderCount(0); return; }
    const count = document.querySelectorAll("[data-image-placeholder]").length;
    setPlaceholderCount(count);
  }, [editMode]);

  // Keyboard shortcuts
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (!isCaseStudy) return;

      // Cmd+E to toggle edit mode
      if ((e.metaKey || e.ctrlKey) && e.key === "e") {
        e.preventDefault();
        toggleEditMode();
      }

      // Cmd+S to save (only in edit mode)
      if ((e.metaKey || e.ctrlKey) && e.key === "s" && editMode) {
        e.preventDefault();
        save();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isCaseStudy, editMode, toggleEditMode, save]);

  if (!isCaseStudy) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[200]">
      <AnimatePresence mode="wait">
        {editMode ? (
          <motion.div
            key="toolbar"
            initial={{ opacity: 0, scale: 0.9, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 8 }}
            transition={SPRING_HEAVY}
            className="flex items-center gap-2 px-4 py-2.5 backdrop-blur-xl border border-[var(--color-border)]"
            style={{ background: "var(--color-surface-raised)" }}
          >
            {/* Placeholder audit count */}
            {placeholderCount > 0 && (
              <span className="text-[10px] font-mono text-red-500 mr-1" title={`${placeholderCount} image placeholder${placeholderCount !== 1 ? "s" : ""} need real images`}>
                {placeholderCount} img
              </span>
            )}

            {/* Divider when both counts show */}
            {placeholderCount > 0 && isDirty && (
              <span className="w-px h-3 bg-[var(--color-border)]" />
            )}

            {/* Edit count */}
            {isDirty && (
              <span className="text-[11px] font-mono text-[var(--color-accent)] mr-1">
                {pendingEdits.size} edit{pendingEdits.size !== 1 ? "s" : ""}
              </span>
            )}

            {/* Save button */}
            <button
              onClick={save}
              disabled={!isDirty || saving}
              className="px-3 py-1 text-[12px] font-medium transition-colors disabled:opacity-30"
              style={{
                color: isDirty ? "var(--color-bg)" : "var(--color-fg-secondary)",
                background: isDirty ? "var(--color-accent)" : "transparent",
              }}
            >
              {saving ? "Saving..." : "Save"}
            </button>

            {/* Revert button */}
            <button
              onClick={revert}
              disabled={!isDirty}
              className="px-3 py-1 text-[12px] transition-colors disabled:opacity-30"
              style={{ color: "var(--color-fg-secondary)" }}
            >
              Revert
            </button>

            {/* Close edit mode */}
            <button
              onClick={toggleEditMode}
              className="ml-1 w-7 h-7 flex items-center justify-center transition-colors hover:text-[var(--color-accent)]"
              style={{ color: "var(--color-fg-secondary)" }}
              aria-label="Exit edit mode"
            >
              <CloseIcon size={14} />
            </button>

            {/* Error indicator */}
            {lastError && (
              <span className="text-[11px] text-red-500 ml-1" title={lastError}>
                Error
              </span>
            )}
          </motion.div>
        ) : (
          <motion.button
            key="toggle"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={SPRING_HEAVY}
            onClick={toggleEditMode}
            className="w-11 h-11 flex items-center justify-center backdrop-blur-xl border border-[var(--color-border)] transition-colors hover:border-[var(--color-accent)]"
            style={{ background: "var(--color-surface-raised)" }}
            aria-label="Toggle edit mode (Cmd+E)"
            title="Toggle edit mode (Cmd+E)"
          >
            <EditPencilIcon style={{ stroke: "var(--color-fg-secondary)" }} />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}

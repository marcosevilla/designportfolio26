"use client";

import { useInlineEditor } from "@/lib/InlineEditorContext";
import { EDITOR_SERVER_URL } from "@/lib/editor-types";
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
    unpublished,
    publishState,
    publish,
    serverOnline,
    serverBranch,
  } = useInlineEditor();

  const [placeholderCount, setPlaceholderCount] = useState(0);

  const offline = serverOnline === false;
  // Publishing from a non-main branch commits somewhere that won't deploy — say so
  // rather than letting "Commit & push" imply the change is going live.
  const offMain = Boolean(serverBranch) && serverBranch !== "main";

  // Case studies + the homepage (intro paragraphs, About bio)
  const isCaseStudy = pathname.startsWith("/work/");
  const isEditablePage = isCaseStudy || pathname === "/";

  // Count image placeholders when edit mode is toggled
  useEffect(() => {
    if (!editMode) { setPlaceholderCount(0); return; }
    const count = document.querySelectorAll("[data-image-placeholder]").length;
    setPlaceholderCount(count);
  }, [editMode]);

  // Keyboard shortcuts
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (!isEditablePage) return;

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
  }, [isEditablePage, editMode, toggleEditMode, save]);

  if (!isEditablePage) return null;

  return (
    <div className="fixed bottom-6 left-6 z-200">
      <AnimatePresence mode="wait">
        {editMode ? (
          <motion.div
            key="toolbar"
            initial={{ opacity: 0, scale: 0.9, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 8 }}
            transition={SPRING_HEAVY}
            className="flex items-center gap-2 px-4 py-2.5 backdrop-blur-xl border border-border"
            style={{ background: "var(--color-surface-raised)" }}
          >
            {/* Editor server down — edits would have nowhere to save to. Say it up front. */}
            {offline && (
              <span
                className="text-[11px] font-mono text-amber-500 mr-1"
                title={`No editor server on ${EDITOR_SERVER_URL}. Restart with "npm run dev" — it starts both.`}
              >
                editor offline
              </span>
            )}

            {/* Working branch, when it isn't main — publishing from here won't deploy. */}
            {!offline && offMain && (
              <span
                className="text-[11px] font-mono text-amber-500 mr-1"
                title={`Editing on branch "${serverBranch}" — publishing here will not deploy the live site`}
              >
                {serverBranch}
              </span>
            )}

            {/* Placeholder audit count */}
            {placeholderCount > 0 && (
              <span className="text-[10px] font-mono text-red-500 mr-1" title={`${placeholderCount} image placeholder${placeholderCount !== 1 ? "s" : ""} need real images`}>
                {placeholderCount} img
              </span>
            )}

            {/* Divider when both counts show */}
            {placeholderCount > 0 && isDirty && (
              <span className="w-px h-3 bg-border" />
            )}

            {/* Edit count */}
            {isDirty && (
              <span className="text-[11px] font-mono text-(--color-accent) mr-1">
                {pendingEdits.size} edit{pendingEdits.size !== 1 ? "s" : ""}
              </span>
            )}

            {/* Save button */}
            <button
              onClick={save}
              disabled={!isDirty || saving || offline}
              className="px-3 py-1 text-[12px] font-medium transition-colors disabled:opacity-30"
              style={{
                color: isDirty ? "var(--color-bg)" : "var(--color-fg-secondary)",
                background: isDirty ? "var(--color-accent)" : "transparent",
              }}
            >
              {saving ? "Saving..." : "Save"}
            </button>

            {/* Commit + push, Vercel deploys. Always rendered so it's never a surprise
                element — disabled (with a reason) when there's nothing to ship. */}
            <button
              onClick={publish}
              disabled={
                offline || isDirty || saving || !unpublished || publishState === "publishing"
              }
              className="px-3 py-1 text-[12px] font-medium border transition-colors disabled:opacity-30"
              style={{
                color: publishState === "published" ? "var(--color-fg-secondary)" : "var(--color-accent)",
                borderColor: "var(--color-accent)",
              }}
              title={
                offline
                  ? "Editor server offline"
                  : isDirty
                    ? "Save your edits first (Cmd+S)"
                    : !unpublished
                      ? "Nothing to publish — save an edit first"
                      : offMain
                        ? `Commits + pushes branch "${serverBranch}" — this will NOT deploy the live site`
                        : "Commit + push — live in ~1 min"
              }
            >
              {publishState === "publishing"
                ? "Pushing..."
                : publishState === "published"
                  ? offMain ? `Pushed to ${serverBranch}` : "Live in ~1 min"
                  : "Commit & push"}
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
              className="ml-1 w-7 h-7 flex items-center justify-center transition-colors hover:text-(--color-accent)"
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
            className="w-11 h-11 flex items-center justify-center backdrop-blur-xl border transition-colors hover:border-(--color-accent)"
            style={{
              background: "var(--color-surface-raised)",
              // Amber before you click in, so a dead server is visible without
              // discovering it the hard way at save time.
              borderColor: offline ? "var(--color-amber-500, #f59e0b)" : "var(--color-border)",
            }}
            aria-label="Toggle edit mode (Cmd+E)"
            title={
              offline
                ? `Editor server offline (${EDITOR_SERVER_URL}) — run "npm run dev" to start both`
                : "Toggle edit mode (Cmd+E)"
            }
          >
            <EditPencilIcon
              style={{ stroke: offline ? "#f59e0b" : "var(--color-fg-secondary)" }}
            />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}

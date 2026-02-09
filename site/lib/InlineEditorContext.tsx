"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import { SLUG_TO_FILE, EDITOR_SERVER_URL, type EditEntry } from "./editor-types";

interface InlineEditorContextValue {
  editMode: boolean;
  toggleEditMode: () => void;
  slug: string | null;
  filePath: string | null;
  pendingEdits: Map<string, EditEntry>;
  addEdit: (path: string, oldText: string, newText: string) => void;
  removeEdit: (path: string) => void;
  isDirty: boolean;
  saving: boolean;
  lastError: string | null;
  save: () => Promise<void>;
  revert: () => void;
}

const InlineEditorContext = createContext<InlineEditorContextValue>({
  editMode: false,
  toggleEditMode: () => {},
  slug: null,
  filePath: null,
  pendingEdits: new Map(),
  addEdit: () => {},
  removeEdit: () => {},
  isDirty: false,
  saving: false,
  lastError: null,
  save: async () => {},
  revert: () => {},
});

/** Normalize JSX entities to Unicode for matching */
function normalizeEntities(jsx: string): string {
  return jsx
    .replace(/&apos;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&ldquo;/g, "\u201C")
    .replace(/&rdquo;/g, "\u201D")
    .replace(/&amp;/g, "&")
    .replace(/&rarr;/g, "\u2192")
    .replace(/&mdash;/g, "\u2014")
    .replace(/&nbsp;/g, "\u00A0")
    .replace(/&larr;/g, "\u2190");
}

/** Convert Unicode back to JSX entities */
function denormalizeEntities(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/'/g, "&apos;")
    .replace(/\u201C/g, "&ldquo;")
    .replace(/\u201D/g, "&rdquo;")
    .replace(/\u2192/g, "&rarr;")
    .replace(/\u2014/g, "&mdash;")
    .replace(/\u00A0/g, "&nbsp;")
    .replace(/\u2190/g, "&larr;");
}

export function InlineEditorProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [editMode, setEditMode] = useState(false);
  const [pendingEdits, setPendingEdits] = useState<Map<string, EditEntry>>(new Map());
  const [saving, setSaving] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);

  // Extract slug from pathname: /work/fb-ordering → fb-ordering
  const slug = pathname.startsWith("/work/")
    ? pathname.split("/")[2] || null
    : null;
  const filePath = slug ? SLUG_TO_FILE[slug] ?? null : null;

  const toggleEditMode = useCallback(() => {
    setEditMode((m) => !m);
    if (editMode) {
      // Exiting edit mode — clear pending edits
      setPendingEdits(new Map());
    }
  }, [editMode]);

  const addEdit = useCallback((path: string, oldText: string, newText: string) => {
    if (oldText === newText) return;
    setPendingEdits((prev) => {
      const next = new Map(prev);
      next.set(path, { path, oldText, newText });
      return next;
    });
  }, []);

  const removeEdit = useCallback((path: string) => {
    setPendingEdits((prev) => {
      const next = new Map(prev);
      next.delete(path);
      return next;
    });
  }, []);

  const revert = useCallback(() => {
    setPendingEdits(new Map());
  }, []);

  const save = useCallback(async () => {
    if (!filePath || pendingEdits.size === 0) return;

    setSaving(true);
    setLastError(null);

    try {
      // Read current source
      const res = await fetch(
        `${EDITOR_SERVER_URL}/read?file=${encodeURIComponent(filePath)}`
      );
      if (!res.ok) throw new Error(`Failed to read file: ${res.statusText}`);
      let source = await res.text();

      // Categorize edits by type
      const bodyEdits: EditEntry[] = [];
      const statsEdits: EditEntry[] = [];
      const heroEdits: EditEntry[] = [];

      for (const edit of pendingEdits.values()) {
        if (edit.path.startsWith("stats:")) {
          statsEdits.push(edit);
        } else if (edit.path.startsWith("hero.")) {
          heroEdits.push(edit);
        } else {
          bodyEdits.push(edit);
        }
      }

      // Apply stats edits — find STATS array entries by index
      for (const edit of statsEdits) {
        const match = edit.path.match(/^stats:(\d+)\.(value|label)$/);
        if (!match) continue;
        const statIndex = parseInt(match[1]);
        const field = match[2]; // "value" or "label"

        // Find all { value: "...", label: "..." } entries in the source
        const statsRegex = /\{\s*value:\s*"([^"]*)",\s*label:\s*"([^"]*)"\s*\}/g;
        let currentIndex = 0;
        source = source.replace(statsRegex, (fullMatch, val, lab) => {
          if (currentIndex === statIndex) {
            currentIndex++;
            const newVal = field === "value" ? edit.newText : val;
            const newLab = field === "label" ? edit.newText : lab;
            return `{ value: "${newVal}", label: "${newLab}" }`;
          }
          currentIndex++;
          return fullMatch;
        });
      }

      // Apply hero edits — find title="..." and subtitle="..." props
      for (const edit of heroEdits) {
        if (edit.path === "hero.title") {
          source = source.replace(
            /(<CaseStudyHero[\s\S]*?title=")([^"]*?)(")/,
            `$1${edit.newText}$3`
          );
        } else if (edit.path === "hero.subtitle") {
          source = source.replace(
            /(<CaseStudyHero[\s\S]*?subtitle=")([^"]*?)(")/,
            `$1${edit.newText}$3`
          );
        }
      }

      // Apply body text edits — line-by-line entity-normalized replacement
      for (const edit of bodyEdits) {
        const oldNormalized = edit.oldText;
        let found = false;

        const lines = source.split("\n");
        for (let i = 0; i < lines.length; i++) {
          const normalized = normalizeEntities(lines[i]);
          if (normalized.includes(oldNormalized)) {
            const normalizedLine = normalizeEntities(lines[i]);
            const newNormalizedLine = normalizedLine.replace(oldNormalized, edit.newText);
            lines[i] = denormalizeEntities(newNormalizedLine);
            found = true;
            break;
          }
        }

        if (!found) {
          console.warn(`Could not find text to replace: "${edit.oldText.substring(0, 50)}..."`);
        }

        source = lines.join("\n");
      }

      // Write back
      const writeRes = await fetch(`${EDITOR_SERVER_URL}/write`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ file: filePath, content: source }),
      });

      if (!writeRes.ok) throw new Error(`Failed to write file: ${writeRes.statusText}`);

      // Clear edits on success
      setPendingEdits(new Map());
    } catch (err) {
      setLastError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }, [filePath, pendingEdits]);

  return (
    <InlineEditorContext.Provider
      value={{
        editMode,
        toggleEditMode,
        slug,
        filePath,
        pendingEdits,
        addEdit,
        removeEdit,
        isDirty: pendingEdits.size > 0,
        saving,
        lastError,
        save,
        revert,
      }}
    >
      {children}
    </InlineEditorContext.Provider>
  );
}

export function useInlineEditor() {
  return useContext(InlineEditorContext);
}

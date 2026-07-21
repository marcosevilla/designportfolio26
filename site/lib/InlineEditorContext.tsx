"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import {
  SLUG_TO_FILE,
  EDITOR_SERVER_URL,
  HOME_SOURCE_FILES,
  flexSourcePattern,
  type EditEntry,
  type PublishState,
} from "./editor-types";

interface InlineEditorContextValue {
  editMode: boolean;
  toggleEditMode: () => void;
  slug: string | null;
  filePath: string | null;
  pendingEdits: Map<string, EditEntry>;
  addEdit: (path: string, oldText: string, newText: string, file?: string) => void;
  removeEdit: (path: string) => void;
  isDirty: boolean;
  saving: boolean;
  lastError: string | null;
  save: () => Promise<void>;
  revert: () => void;
  /** Saved-to-disk edits (or local commits) not yet pushed to production */
  unpublished: boolean;
  publishState: PublishState;
  publish: () => Promise<void>;
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
  unpublished: false,
  publishState: "idle",
  publish: async () => {},
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
  const [unpublished, setUnpublished] = useState(false);
  const [publishState, setPublishState] = useState<PublishState>("idle");
  const publishedResetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Extract slug from pathname: /work/fb-ordering → fb-ordering
  const slug = pathname.startsWith("/work/")
    ? pathname.split("/")[2] || null
    : null;
  const filePath = slug ? SLUG_TO_FILE[slug] ?? null : null;

  // Every source file this page can edit: case studies have one mapped file,
  // the homepage has the intro (HomeLayout) + About bio (bio.md).
  const sourceFiles = filePath
    ? [filePath]
    : pathname === "/"
      ? HOME_SOURCE_FILES
      : [];
  const sourceFilesKey = sourceFiles.join(",");

  // On landing on an editable page, check for edits saved earlier but never
  // published. Fails silently — the editor server may simply not be running.
  useEffect(() => {
    if (!sourceFilesKey) return;
    let cancelled = false;
    fetch(`${EDITOR_SERVER_URL}/status?files=${encodeURIComponent(sourceFilesKey)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((status) => {
        if (!cancelled && status) {
          setUnpublished(status.dirty || status.ahead > 0);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [sourceFilesKey]);

  const toggleEditMode = useCallback(() => {
    setEditMode((m) => !m);
    if (editMode) {
      // Exiting edit mode — clear pending edits
      setPendingEdits(new Map());
    }
  }, [editMode]);

  const addEdit = useCallback((path: string, oldText: string, newText: string, file?: string) => {
    if (oldText === newText) return;
    setPendingEdits((prev) => {
      const next = new Map(prev);
      next.set(path, { path, oldText, newText, file });
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
    if (pendingEdits.size === 0) return;

    setSaving(true);
    setLastError(null);

    try {
      // Text-run edits carry their own source file; the rest are case-study
      // edits applied to this page's mapped file.
      const textEditsByFile = new Map<string, EditEntry[]>();
      const caseStudyEdits: EditEntry[] = [];
      for (const edit of pendingEdits.values()) {
        if (edit.file) {
          const list = textEditsByFile.get(edit.file) ?? [];
          list.push(edit);
          textEditsByFile.set(edit.file, list);
        } else {
          caseStudyEdits.push(edit);
        }
      }

      // Text-run edits: whitespace/entity-tolerant search & replace per file
      for (const [file, edits] of textEditsByFile) {
        const res = await fetch(
          `${EDITOR_SERVER_URL}/read?file=${encodeURIComponent(file)}`
        );
        if (!res.ok) throw new Error(`Failed to read ${file}: ${res.statusText}`);
        let source = await res.text();
        const isMarkdown = file.endsWith(".md");

        for (const edit of edits) {
          const pattern = flexSourcePattern(edit.oldText);
          if (!pattern.test(source)) {
            console.warn(`Could not find text in ${file}: "${edit.oldText.substring(0, 50)}..."`);
            continue;
          }
          const replacement = isMarkdown
            ? edit.newText.trim()
            : denormalizeEntities(edit.newText.trim());
          source = source.replace(pattern, () => replacement);
        }

        const writeRes = await fetch(`${EDITOR_SERVER_URL}/write`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ file, content: source }),
        });
        if (!writeRes.ok) throw new Error(`Failed to write ${file}: ${writeRes.statusText}`);
      }

      if (caseStudyEdits.length > 0) {
        if (!filePath) throw new Error("No source file mapped for this page");

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

      for (const edit of caseStudyEdits) {
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
      }

      // Clear edits on success
      setPendingEdits(new Map());
      setUnpublished(true);
      setPublishState("idle");
    } catch (err) {
      setLastError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }, [filePath, pendingEdits]);

  const publish = useCallback(async () => {
    if (sourceFiles.length === 0) return;

    setPublishState("publishing");
    setLastError(null);
    if (publishedResetTimer.current) clearTimeout(publishedResetTimer.current);

    try {
      const res = await fetch(`${EDITOR_SERVER_URL}/publish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          files: sourceFiles,
          message: `Content: edit ${slug ?? "home"}`,
        }),
      });
      if (!res.ok) {
        throw new Error((await res.text()) || `Publish failed: ${res.statusText}`);
      }
      setUnpublished(false);
      setPublishState("published");
      publishedResetTimer.current = setTimeout(() => setPublishState("idle"), 5000);
    } catch (err) {
      setPublishState("error");
      setLastError(err instanceof Error ? err.message : "Publish failed");
    }
  }, [sourceFilesKey, slug]); // eslint-disable-line react-hooks/exhaustive-deps

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
        unpublished,
        publishState,
        publish,
      }}
    >
      {children}
    </InlineEditorContext.Provider>
  );
}

export function useInlineEditor() {
  return useContext(InlineEditorContext);
}

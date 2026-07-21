export type PublishState = "idle" | "publishing" | "published" | "error";

export interface EditEntry {
  /** Identifier for the edit location, e.g. "section:problem.p:0" */
  path: string;
  /** Original text as rendered in the DOM (Unicode) */
  oldText: string;
  /** New text after editing (Unicode) */
  newText: string;
  /**
   * Source file for text-run edits (from data-editable-source). Absent for
   * case-study edits, which resolve via SLUG_TO_FILE.
   */
  file?: string;
}

/** Files the homepage's editable surfaces write to (intro + About bio). */
export const HOME_SOURCE_FILES = [
  "components/HomeLayout.tsx",
  "content/bio.md",
];

const RE_SPECIALS = /[.*+?^${}()|[\]\\]/g;
const escapeRe = (s: string) => s.replace(RE_SPECIALS, "\\$&");

// Characters that may appear as HTML entities in JSX source
const ENTITY_ALTS: Record<string, string[]> = {
  "'": ["'", "&apos;", "&#39;"],
  "’": ["’", "&rsquo;"],
  "“": ["“", "&ldquo;"],
  "”": ["”", "&rdquo;"],
  "&": ["&amp;", "&"],
  "→": ["→", "&rarr;"],
  "—": ["—", "&mdash;"],
  " ": [" ", "&nbsp;"],
  "←": ["←", "&larr;"],
};

/**
 * Build a regex matching rendered text against its source: whitespace runs
 * match newlines/indentation and JSX `{" "}` joins; entity-encodable chars
 * match either form. Used by text-run edits (home intro, About bio).
 */
export function flexSourcePattern(text: string): RegExp {
  const chars = [...text.trim()];
  let out = "";
  let i = 0;
  while (i < chars.length) {
    if (/\s/.test(chars[i])) {
      while (i < chars.length && /\s/.test(chars[i])) i++;
      out += '(?:\\s|\\{" "\\})+';
      continue;
    }
    const alts = ENTITY_ALTS[chars[i]];
    out += alts ? `(?:${alts.map(escapeRe).join("|")})` : escapeRe(chars[i]);
    i++;
  }
  return new RegExp(out);
}

export const SLUG_TO_FILE: Record<string, string> = {
  "fb-ordering": "app/work/fb-ordering/FBOrderingContent.tsx",
  "compendium": "app/work/compendium/CompendiumContent.tsx",
  "upsells": "app/work/upsells/UpsellsContent.tsx",
  "checkin": "app/work/checkin/CheckinContent.tsx",
  "general-task": "app/work/general-task/GeneralTaskContent.tsx",
  "design-system": "app/work/design-system/DesignSystemContent.tsx",
  "knowledge-base": "app/work/knowledge-base/KnowledgeBaseContent.tsx",
  "ai-workflow": "app/work/ai-workflow/AIWorkflowContent.tsx",
};

export const EDITOR_SERVER_URL = "http://localhost:3002";

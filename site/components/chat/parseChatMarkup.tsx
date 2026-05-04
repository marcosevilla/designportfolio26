// Pure functions for turning streamed assistant markdown into structured
// segments, plus helpers for the artifact marker and the copy-to-plaintext
// transform.
//
// Inline link grammar (intentionally tiny — one regex, one pass):
//
//   [label](study:<slug>)        → in-app link to /work/<slug>
//   [label](about)               → opens About-me view on home
//   [label](resume)              → same as `about`
//   [label](contact:email)       → mailto:marcogsevilla@gmail.com
//   [label](contact:linkedin)    → linkedin URL (new tab)
//
// Anything that doesn't match the allowlist falls back to plain label text —
// safe degradation against hallucinated slugs.

import { isStudySlug } from "@/lib/chat/study-metadata";

const EMAIL = "marcogsevilla@gmail.com";
const LINKEDIN_URL = "https://www.linkedin.com/in/marcogsevilla/";

const LINK_REGEX = /\[([^\]]+)\]\(([^)]+)\)/g;
// Trailing artifact marker on its own line, optionally followed by trailing whitespace.
const ARTIFACT_REGEX = /\n\s*<artifact\s+slug="([^"]+)"\s*\/>\s*$/;

export type ChatSegment =
  | { kind: "text"; text: string }
  | { kind: "bold"; text: string }
  | { kind: "italic"; text: string }
  | {
      kind: "link";
      label: string;
      href: string;
      external: boolean; // true → target=_blank
      inApp: boolean;    // true → about/resume route hand-off
    };

type ResolvedTarget =
  | { kind: "external"; href: string }
  | { kind: "internal"; href: string }
  | { kind: "in-app"; href: string }
  | null;

function resolveTarget(target: string): ResolvedTarget {
  if (target === "about" || target === "resume") {
    // Routing target is the home page with About-me state. The actual
    // navigation hand-off is the link consumer's responsibility; we just
    // mark inApp so the renderer can intercept the click.
    return { kind: "in-app", href: "/?about=1" };
  }
  if (target === "contact:email") {
    return { kind: "external", href: `mailto:${EMAIL}` };
  }
  if (target === "contact:linkedin") {
    return { kind: "external", href: LINKEDIN_URL };
  }
  if (target.startsWith("study:")) {
    const slug = target.slice("study:".length);
    if (isStudySlug(slug)) {
      // Dedicated /work/<slug> routes are gone for now — chat
      // case-study links land on the projects section of the
      // homepage instead.
      return { kind: "internal", href: "/#projects" };
    }
    return null;
  }
  return null;
}

/** Returns text without the trailing `<artifact slug="..." />` marker, plus
 *  the slug if it was present and valid. Unknown slugs leave text untouched. */
export function extractArtifact(raw: string): { text: string; slug: string | null } {
  const m = raw.match(ARTIFACT_REGEX);
  if (!m) return { text: raw, slug: null };
  const slug = m[1];
  if (!isStudySlug(slug)) return { text: raw, slug: null };
  return { text: raw.slice(0, m.index).trimEnd(), slug };
}

/** Flatten markdown links to their label text and drop any artifact marker.
 *  Used by the copy button so recruiters paste clean prose. */
export function plainTextFromMarkup(raw: string): string {
  const { text } = extractArtifact(raw);
  return text
    .replace(LINK_REGEX, (_, label) => label)
    .replace(/\*\*([^*]+)\*\*|\*([^*]+)\*/g, (_, bold, italic) => bold ?? italic ?? "");
}

const EMPHASIS_REGEX = /\*\*([^*]+)\*\*|\*([^*]+)\*/g;

/** Walk text segments and split them into text/bold/italic runs. */
function expandEmphasis(segments: ChatSegment[]): ChatSegment[] {
  const result: ChatSegment[] = [];
  for (const seg of segments) {
    if (seg.kind !== "text") {
      result.push(seg);
      continue;
    }
    EMPHASIS_REGEX.lastIndex = 0;
    let cursor = 0;
    let m: RegExpExecArray | null;
    while ((m = EMPHASIS_REGEX.exec(seg.text)) !== null) {
      if (m.index > cursor) {
        result.push({ kind: "text", text: seg.text.slice(cursor, m.index) });
      }
      if (m[1] !== undefined) {
        result.push({ kind: "bold", text: m[1] });
      } else if (m[2] !== undefined) {
        result.push({ kind: "italic", text: m[2] });
      }
      cursor = EMPHASIS_REGEX.lastIndex;
    }
    if (cursor < seg.text.length) {
      result.push({ kind: "text", text: seg.text.slice(cursor) });
    }
  }
  return result;
}

/** Parses one assistant message into structured segments for rendering.
 *  Caller renders text segments as plain text, link segments as anchors. */
export function parseChatMarkup(raw: string): ChatSegment[] {
  const { text } = extractArtifact(raw);
  const segments: ChatSegment[] = [];
  let cursor = 0;
  // Reset regex state between calls.
  LINK_REGEX.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = LINK_REGEX.exec(text)) !== null) {
    if (match.index > cursor) {
      segments.push({ kind: "text", text: text.slice(cursor, match.index) });
    }
    const label = match[1];
    const target = match[2];
    const resolved = resolveTarget(target);
    if (resolved === null) {
      // Hallucinated / unknown slug — degrade to plain label text as its own
      // segment so callers can distinguish it from surrounding prose.
      segments.push({ kind: "text", text: label });
    } else {
      segments.push({
        kind: "link",
        label,
        href: resolved.href,
        external: resolved.kind === "external",
        inApp: resolved.kind === "in-app",
      });
    }
    cursor = LINK_REGEX.lastIndex;
  }
  if (cursor < text.length) {
    const tail = text.slice(cursor);
    const last = segments[segments.length - 1];
    if (last && last.kind === "text") {
      last.text += tail;
    } else {
      segments.push({ kind: "text", text: tail });
    }
  }
  return expandEmphasis(segments);
}

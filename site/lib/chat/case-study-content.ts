// Reads case-study markdown drafts at module load and exports them by slug.
// Server-only (uses fs). Imported by lib/chat/system-prompt.ts.

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { STUDY_SLUGS, type StudySlug } from "./study-metadata";

// case-studies/ lives at the repo root, not under site/.
// process.cwd() in a Vercel Node function is the project root (which for
// this monorepo is `site/`). Resolve up one level.
const CASE_STUDIES_DIR = join(process.cwd(), "..", "case-studies");

// Page slug → markdown filename (without extension). Filenames diverge from
// slugs because the markdown drafts predate the page-slug naming.
const FILENAME_BY_SLUG: Record<StudySlug, string | null> = {
  "fb-ordering": "fb-mobile-ordering",
  compendium: "compendium",
  upsells: "upsells-forms",
  checkin: "hotel-checkin",
  "general-task": "general-task",
  "design-system": "design-system",
  "ai-workflow": null, // no markdown draft yet — metadata block only
};

function readStudy(slug: StudySlug): string {
  const filename = FILENAME_BY_SLUG[slug];
  if (!filename) return "";
  try {
    return readFileSync(join(CASE_STUDIES_DIR, `${filename}.md`), "utf-8");
  } catch {
    // Missing markdown is non-fatal — the model still has the metadata block
    // for that study. Log so we notice in Vercel logs but don't crash.
    console.warn(`[chat] case-study markdown missing: ${filename}.md`);
    return "";
  }
}

export const CASE_STUDY_CONTENT: Record<StudySlug, string> = Object.fromEntries(
  STUDY_SLUGS.map((slug) => [slug, readStudy(slug)])
) as Record<StudySlug, string>;

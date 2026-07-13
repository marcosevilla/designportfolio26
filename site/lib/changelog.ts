import fs from "fs";
import path from "path";

export type ChangelogEntry = {
  title: string;
  body: string;
};

export type ChangelogGroup = {
  /** Month label, e.g. "June 2026". */
  month: string;
  entries: ChangelogEntry[];
};

// The changelog markdown is the single source of truth — it lives at the
// repo root (../docs/CHANGELOG.md relative to the Next app in site/) so it
// doubles as a human-readable doc. Read + parsed at build time (the site is
// a static export), then handed to the client overlay as a prop.
const CHANGELOG_PATH = path.join(process.cwd(), "..", "docs", "CHANGELOG.md");

// Matches a bullet whose entry opens with a bold title:
//   - **Work-history widget** — added a work-history surface…
//   - **Ask Marco — AI chat bar.** Shipped a full conversational surface…
// Group 1 is the bold title; group 2 is everything after it (the body),
// with any leading em-dash separator consumed.
const ENTRY_RE = /^-\s+\*\*(.+?)\*\*\s*(?:—\s*)?(.*)$/;

/** Parse the changelog markdown into month-grouped entries. Only `## Month`
 *  sections and their `- **Title** body` bullets are surfaced; the H1, the
 *  intro blurb, horizontal rules, and the footer line are ignored. */
export function parseChangelog(markdown: string): ChangelogGroup[] {
  const groups: ChangelogGroup[] = [];
  let current: ChangelogGroup | null = null;

  for (const raw of markdown.split("\n")) {
    const line = raw.trimEnd();

    // `## Month Year` opens a new group. `#`/`###` and the italic footer
    // are not month headings, so they're skipped.
    const heading = line.match(/^##\s+(?!#)(.+)$/);
    if (heading) {
      current = { month: heading[1].trim(), entries: [] };
      groups.push(current);
      continue;
    }

    if (!current) continue;

    const entry = line.match(ENTRY_RE);
    if (entry) {
      const title = entry[1].replace(/\.$/, "").trim();
      const body = entry[2].trim();
      current.entries.push({ title, body });
    }
  }

  // Drop any month that ended up with no parseable entries.
  return groups.filter((g) => g.entries.length > 0);
}

/** Read + parse the changelog. Returns [] if the file is missing so a
 *  build never fails on a misplaced doc — the overlay simply renders empty. */
export function getChangelog(): ChangelogGroup[] {
  try {
    const md = fs.readFileSync(CHANGELOG_PATH, "utf-8");
    return parseChangelog(md);
  } catch {
    return [];
  }
}

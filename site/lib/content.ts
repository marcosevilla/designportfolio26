import fs from "fs";
import path from "path";
import matter from "gray-matter";
import type { CaseStudy, CaseStudyMeta } from "./types";

const contentDir = path.join(process.cwd(), "content");

export function getCaseStudies(): CaseStudyMeta[] {
  const files = fs.readdirSync(contentDir).filter((f) => f.endsWith(".mdx"));

  const studies = files.map((filename) => {
    const filePath = path.join(contentDir, filename);
    const fileContent = fs.readFileSync(filePath, "utf-8");
    const { data } = matter(fileContent);

    return {
      title: data.title ?? "",
      subtitle: data.subtitle ?? "",
      slug: data.slug ?? filename.replace(".mdx", ""),
      order: data.order ?? 99,
      thumbnail: data.thumbnail ?? "",
      published: data.published !== false,
      year: data.year ?? "",
      gradient: data.gradient ?? "",
      company: data.company ?? "",
      role: data.role ?? "",
      metric: data.metric ?? "",
      description: data.description ?? "",
    } satisfies CaseStudyMeta;
  });

  return studies
    .filter((s) => s.published)
    .sort((a, b) => a.order - b.order);
}

export function getCaseStudy(slug: string): CaseStudy | null {
  const files = fs.readdirSync(contentDir).filter((f) => f.endsWith(".mdx"));

  for (const filename of files) {
    const filePath = path.join(contentDir, filename);
    const fileContent = fs.readFileSync(filePath, "utf-8");
    const { data, content } = matter(fileContent);

    const fileSlug = data.slug ?? filename.replace(".mdx", "");
    if (fileSlug === slug) {
      return {
        title: data.title ?? "",
        subtitle: data.subtitle ?? "",
        slug: fileSlug,
        order: data.order ?? 99,
        thumbnail: data.thumbnail ?? "",
        published: data.published !== false,
        year: data.year ?? "",
        gradient: data.gradient ?? "",
        company: data.company ?? "",
        role: data.role ?? "",
        metric: data.metric ?? "",
        description: data.description ?? "",
        content,
      };
    }
  }

  return null;
}

export function getAllSlugs(): string[] {
  return getCaseStudies().map((s) => s.slug);
}

export type StudyMeta = {
  company: string;
  role: string;
  year: string;
};

/**
 * The case-study metadata row's data source. MDX frontmatter is the single
 * source of truth for company/role/year — do not duplicate these into a
 * slug-keyed const (see .claude/rules/case-studies.md on slug-set drift).
 * Throws rather than returning blanks so a renamed or missing MDX file
 * fails the build loudly instead of rendering an empty row.
 */
export function getStudyMeta(slug: string): StudyMeta {
  const study = getCaseStudy(slug);
  if (!study) {
    throw new Error(`getStudyMeta: no MDX file found for slug "${slug}"`);
  }
  return {
    company: study.company ?? "",
    role: study.role ?? "",
    year: study.year,
  };
}

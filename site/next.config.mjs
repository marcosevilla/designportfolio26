import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = dirname(__dirname);

/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingRoot: projectRoot,
  outputFileTracingIncludes: {
    // Glob resolves against the Next project dir (site/), not
    // outputFileTracingRoot — the drafts live one level up.
    "/api/chat": ["../case-studies/**/*.md"],
  },
  images: {
    unoptimized: true,
  },
  // The inline-editor toolbar owns the bottom-left corner (Marco 2026-07-26);
  // Next's dev indicator would sit right under it there.
  devIndicators: {
    position: "bottom-right",
  },
  // /work and /play index pages were removed May 2026 — the homepage owns
  // both surfaces. Server-side redirects replace the old blank client-side
  // stub pages (instant, crawler-friendly, no JS needed).
  async redirects() {
    return [
      { source: "/work", destination: "/#projects", permanent: false },
      { source: "/play", destination: "/#playground", permanent: false },
      // Slug rename 2026-08-10 (Marco: one canonical name per study).
      // Permanent so any pre-rename links keep working.
      { source: "/work/fb-ordering", destination: "/work/canary-food-and-beverage-ordering", permanent: true },
      { source: "/work/compendium", destination: "/work/canary-guest-hub", permanent: true },
      { source: "/work/upsells", destination: "/work/canary-guest-upsells", permanent: true },
      { source: "/work/checkin", destination: "/work/canary-mobile-check-in", permanent: true },
      { source: "/work/design-system", destination: "/work/general-task-design-system", permanent: true },
    ];
  },
};

export default nextConfig;

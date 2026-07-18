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
  // /work and /play index pages were removed May 2026 — the homepage owns
  // both surfaces. Server-side redirects replace the old blank client-side
  // stub pages (instant, crawler-friendly, no JS needed).
  async redirects() {
    return [
      { source: "/work", destination: "/#projects", permanent: false },
      { source: "/play", destination: "/#playground", permanent: false },
    ];
  },
};

export default nextConfig;

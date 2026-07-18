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
};

export default nextConfig;

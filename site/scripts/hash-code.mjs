#!/usr/bin/env node
/**
 * Generates the SHA-256 hex digest of an unlock code. Paste the output
 * into `.env.local` as NEXT_PUBLIC_UNLOCK_CODE_HASH and into Vercel
 * environment variables for production.
 *
 * Usage: npm run hash:code -- <code>
 */
import { createHash } from "node:crypto";

const code = process.argv[2];
if (!code) {
  console.error("Usage: npm run hash:code -- <code>");
  process.exit(1);
}

const hash = createHash("sha256").update(code).digest("hex");
console.log(hash);

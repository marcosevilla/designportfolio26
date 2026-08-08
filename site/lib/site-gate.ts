/**
 * Site-wide maintenance gate (added 2026-07-29 while Marco updates content).
 * The whole production site sits behind a password wall enforced
 * server-side in `proxy.ts`; `app/api/gate/route.ts` checks the password
 * and sets the unlock cookie.
 *
 * To REOPEN the site: flip SITE_GATE_ENABLED to false and deploy.
 * To change the password: replace SITE_GATE_HASH with
 *   `node -e "console.log(require('node:crypto').createHash('sha256').update('<new password>').digest('hex'))"`
 *
 * This is a curtain, not a vault — the password is a plain word and the
 * hash lives in the repo. It keeps visitors and crawlers out during
 * content work; it is not meant to protect secrets.
 *
 * Unrelated to the per-case-study LockGate/PasswordModal system
 * (lib/locked-content.ts), which keeps its own unlock code.
 */
export const SITE_GATE_ENABLED = true;

export const SITE_GATE_COOKIE = "site-gate";

// sha256 of the gate password. Doubles as the cookie value once unlocked.
export const SITE_GATE_HASH =
  "5c55626b20f18a6e157f90d2b395dbeef87ed028c92577bd71b424c8fb2a4c3e";

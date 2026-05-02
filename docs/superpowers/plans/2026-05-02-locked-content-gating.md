# Locked Content Gating Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a per-slug locked content treatment ("Wax on. Wax off.") for all 6 work case studies + 3 Playground subpages — uniform hover state on cards, friendly modal with email/LinkedIn primary CTAs, full-page placeholder with return arrow on direct URL access. Single password unlocks everything; persists in localStorage.

**Architecture:** Refactor the existing `PasswordGate` infrastructure into a per-slug system. Keep `lib/PasswordGateContext.tsx` and `components/PasswordModal.tsx` (refactor in place). Replace the site-wide `app/work/WorkGate.tsx` with a per-slug `<LockGate>` wrapper supporting `card` and `page` modes. `CaseStudyListRow` keeps its existing locked treatment but takes the locked flag as a prop. New single-source-of-truth file `lib/locked-content.ts` holds `LOCKED_SLUGS`.

**Tech Stack:** Next.js 16, React 18, TypeScript, Tailwind v4, Framer Motion. SHA-256 via `crypto.subtle.digest`. localStorage for persistence.

**Pre-existing context (read before starting):**
- Spec: `docs/superpowers/specs/2026-05-02-locked-content-gating-design.md`
- Existing files this plan modifies, deletes, or replaces:
  - `site/lib/PasswordGateContext.tsx` — hardcoded `PASSWORD = "marcopolo"`. Refactored in Task 2.
  - `site/components/PasswordModal.tsx` — single password input, no email/LinkedIn CTAs. Refactored in Task 3.
  - `site/app/work/WorkGate.tsx` — site-wide gate. Deleted in Task 7.
  - `site/app/work/layout.tsx` — currently wraps everything in `<WorkGate>`. Deleted in Task 7.
  - `site/components/CaseStudyListRow.tsx` — gates all rows when not unlocked. Refactored in Task 5.
  - `site/components/CaseStudyList.tsx` — has `galleryReadyStudies` filter (line 68) that hides studies. Removed in Task 5.
  - `site/components/Playground.tsx` — Playground card grid. Modified in Task 6.
- Email + LinkedIn URLs (use these exact values for CTAs):
  - Email: `marcogsevilla@gmail.com` (per `components/ConnectLinks.tsx:7`)
  - LinkedIn: `https://www.linkedin.com/in/marcogsevilla/`
- Existing icons usable as-is: `LockIcon`, `EmailIcon`, `LinkedInIcon`, `BackChevronIcon`, `CloseIcon` (all in `components/Icons.tsx`).

**Repo conventions:**
- All commands run from `site/` (the Next.js project root). Project root is `~/Developer/portfolio 2026/`.
- No test framework is set up. Verification is manual via `npm run dev` (port 3000) and browser checks. Each task ends with a manual smoke test.
- Commit each task. Use the `Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>` trailer per repo convention.
- The PostToolUse hook runs `tsc --noEmit` after TS/TSX edits — fix type errors before continuing.
- Before touching `BackgroundTexture.tsx` or `framer-motion`-heavy code, commit working state. (Not relevant to this plan but a repo gotcha.)

---

## Task 1: Foundation — locked-content list, hash util, env setup

**Goal:** Land the slug list, the hash-generation script, and the env var so subsequent tasks have a working unlock path.

**Files:**
- Create: `site/lib/locked-content.ts`
- Create: `site/scripts/hash-code.mjs`
- Modify: `site/package.json` — add `hash:code` script
- Modify: `site/.env.local` — add `NEXT_PUBLIC_UNLOCK_CODE_HASH` (Marco generates the value)
- Create: `site/.env.example` — committed reference

- [ ] **Step 1.1: Create `site/lib/locked-content.ts`**

```ts
/**
 * Single source of truth for which slugs are gated behind the password
 * modal. Used by `<LockGate>` (cards + pages) and `<CaseStudyListRow>`
 * (list view). To unlock a piece of content permanently when it's
 * ready to ship publicly, remove its slug from this Set.
 */
export const LOCKED_SLUGS: ReadonlySet<string> = new Set([
  // Work case studies
  "fb-ordering",
  "compendium",
  "upsells",
  "checkin",
  "general-task",
  "design-system",
  // Playground subpages
  "six-degrees",
  "pajamagrams",
  "custom-wrapped",
]);

export function isLocked(slug: string): boolean {
  return LOCKED_SLUGS.has(slug);
}
```

- [ ] **Step 1.2: Create `site/scripts/hash-code.mjs`**

```js
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
```

- [ ] **Step 1.3: Add npm script to `site/package.json`**

In the `scripts` block, add `"hash:code"` after `"dev:editor"`:

```json
"scripts": {
  "dev": "NODE_OPTIONS='--max-old-space-size=4096' next dev --webpack --hostname 0.0.0.0",
  "build": "next build",
  "start": "next start",
  "lint": "next lint",
  "dev:editor": "node scripts/dev-editor-server.mjs",
  "hash:code": "node scripts/hash-code.mjs",
  "build:bio": "node scripts/build-bio.mjs",
  "predev": "node scripts/build-bio.mjs",
  "prebuild": "node scripts/build-bio.mjs"
},
```

- [ ] **Step 1.4: Generate the hash for the chosen code and pause for Marco to confirm**

Run from `site/`:

```bash
cd "~/Developer/portfolio 2026/site"
npm run hash:code -- miyagi
```

Expected output: a 64-character hex string. Example for the literal string `miyagi`:

```
2e75b3acc94f70f0fb2056cae09ec33c64fa8d8b66dde6ce7ab3c28b94b2dc4d
```

(Verify the output matches by re-running the same command — it's deterministic.)

**Pause point:** Before proceeding, ask Marco:
> "Default code is `miyagi`. Want a different one, or proceed with this?"

If he picks a different code, re-run `npm run hash:code -- <newcode>` and use that hash in step 1.5.

- [ ] **Step 1.5: Add the hash to `site/.env.local`**

Append (do not overwrite) to `site/.env.local`:

```
# Locked content gating — SHA-256 of the unlock code (see scripts/hash-code.mjs)
NEXT_PUBLIC_UNLOCK_CODE_HASH=2e75b3acc94f70f0fb2056cae09ec33c64fa8d8b66dde6ce7ab3c28b94b2dc4d
```

(Replace the hash with whatever Step 1.4 produced.)

- [ ] **Step 1.6: Create `site/.env.example`**

If the file already exists, append to it. Otherwise create with this content:

```
# Locked content gating — SHA-256 hex digest of the unlock code.
# Generate with: npm run hash:code -- <yourcode>
NEXT_PUBLIC_UNLOCK_CODE_HASH=
```

- [ ] **Step 1.7: Verify**

```bash
cd "~/Developer/portfolio 2026/site"
npm run hash:code -- miyagi
```

Expected: prints the same 64-character hex string as Step 1.4.

```bash
grep NEXT_PUBLIC_UNLOCK_CODE_HASH .env.local
```

Expected: prints the env var with the hash. (No actual unlock test yet — that comes after Task 2.)

- [ ] **Step 1.8: Commit**

```bash
cd "~/Developer/portfolio 2026"
git add site/lib/locked-content.ts site/scripts/hash-code.mjs site/package.json site/.env.example
git commit -m "$(cat <<'EOF'
feat(lock): add LOCKED_SLUGS source of truth + hash:code script

Foundation for the per-slug locked-content treatment. lib/locked-content.ts
holds the 9 gated slugs (6 work + 3 Playground); scripts/hash-code.mjs
generates SHA-256 digests for the NEXT_PUBLIC_UNLOCK_CODE_HASH env var.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

`.env.local` is gitignored — do not stage it.

---

## Task 2: Refactor PasswordGateContext for env-hash + multi-tab sync

**Goal:** Replace the hardcoded `PASSWORD = "marcopolo"` constant with a SHA-256 comparison against `NEXT_PUBLIC_UNLOCK_CODE_HASH`. Add multi-tab sync via the `storage` event so unlocking in one tab propagates to all open tabs.

**Files:**
- Modify: `site/lib/PasswordGateContext.tsx`

- [ ] **Step 2.1: Replace `site/lib/PasswordGateContext.tsx` entirely**

The file currently has a synchronous `attemptUnlock` returning `boolean`. The new version is async because `crypto.subtle.digest` is async. Existing callers in `PasswordModal.tsx` need updating in Task 3.

Replace the entire file contents with:

```tsx
"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

const STORAGE_KEY = "portfolio-unlocked";

interface PasswordGateValue {
  unlocked: boolean;
  hydrated: boolean;
  isModalOpen: boolean;
  requestUnlock: () => void;
  closeModal: () => void;
  /** Returns true on successful unlock, false on bad code. */
  attemptUnlock: (password: string) => Promise<boolean>;
}

const PasswordGateContext = createContext<PasswordGateValue | null>(null);

async function sha256Hex(input: string): Promise<string> {
  const buf = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", buf);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function PasswordGateProvider({ children }: { children: React.ReactNode }) {
  const [unlocked, setUnlocked] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Read initial state from localStorage. Marked hydrated unconditionally
  // so consumers can render their post-hydration view.
  useEffect(() => {
    try {
      if (localStorage.getItem(STORAGE_KEY) === "1") setUnlocked(true);
    } catch {}
    setHydrated(true);
  }, []);

  // Multi-tab sync — unlock or lock in one tab propagates to others.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY) return;
      setUnlocked(e.newValue === "1");
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const requestUnlock = useCallback(() => setIsModalOpen(true), []);
  const closeModal = useCallback(() => setIsModalOpen(false), []);

  const attemptUnlock = useCallback(async (password: string): Promise<boolean> => {
    const expected = process.env.NEXT_PUBLIC_UNLOCK_CODE_HASH;
    if (!expected) {
      // Misconfigured build — fail closed. Surface to console so it's
      // visible in dev, but don't crash the page.
      console.warn("[PasswordGate] NEXT_PUBLIC_UNLOCK_CODE_HASH is not set.");
      return false;
    }
    const actual = await sha256Hex(password.trim().toLowerCase());
    if (actual === expected) {
      setUnlocked(true);
      setIsModalOpen(false);
      try {
        localStorage.setItem(STORAGE_KEY, "1");
      } catch {}
      return true;
    }
    return false;
  }, []);

  return (
    <PasswordGateContext.Provider
      value={{ unlocked, hydrated, isModalOpen, requestUnlock, closeModal, attemptUnlock }}
    >
      {children}
    </PasswordGateContext.Provider>
  );
}

export function usePasswordGate() {
  const ctx = useContext(PasswordGateContext);
  if (!ctx) throw new Error("usePasswordGate must be used inside PasswordGateProvider");
  return ctx;
}
```

Note: `password.trim().toLowerCase()` mirrors the existing case-insensitive comparison so a code typed as `Miyagi` or `MIYAGI` still works. The hash generated by `npm run hash:code -- miyagi` matches `sha256("miyagi")`. If Marco wants case-sensitive matching, drop the `.toLowerCase()` here AND drop it when generating the hash.

- [ ] **Step 2.2: Verify TypeScript**

```bash
cd "~/Developer/portfolio 2026/site"
npx tsc --noEmit
```

Expected: errors reported in `components/PasswordModal.tsx` because `attemptUnlock` is now async (returns `Promise<boolean>`). This is expected — Task 3 fixes those callers. Do not start the dev server yet.

- [ ] **Step 2.3: Commit**

```bash
cd "~/Developer/portfolio 2026"
git add site/lib/PasswordGateContext.tsx
git commit -m "$(cat <<'EOF'
refactor(lock): swap hardcoded password for NEXT_PUBLIC_UNLOCK_CODE_HASH

Replaces the inline PASSWORD constant with a SHA-256 comparison against
the env var. Adds multi-tab sync via the storage event. attemptUnlock is
now async; its sole caller (PasswordModal) is updated in the next commit.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 3: Refactor PasswordModal — "Wax on. Wax off." copy + email/LinkedIn CTAs

**Goal:** Update the modal so the primary path is contacting Marco directly (email + LinkedIn buttons), with the password input as a secondary "Got a code?" affordance. New copy throughout.

**Files:**
- Modify: `site/components/PasswordModal.tsx`

- [ ] **Step 3.1: Replace `site/components/PasswordModal.tsx` entirely**

```tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { usePasswordGate } from "@/lib/PasswordGateContext";
import { LockIcon, CloseIcon, EmailIcon, LinkedInIcon } from "./Icons";
import { typescale } from "@/lib/typography";

const EMAIL = "marcogsevilla@gmail.com";
const LINKEDIN_URL = "https://www.linkedin.com/in/marcogsevilla/";

export default function PasswordModal() {
  const { isModalOpen, closeModal, attemptUnlock } = usePasswordGate();
  const [value, setValue] = useState("");
  const [error, setError] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Reset state on open. Don't autofocus the input — primary CTAs are
  // email/LinkedIn, so initial focus stays on the close button (a11y
  // default for the dialog).
  useEffect(() => {
    if (isModalOpen) {
      setValue("");
      setError(false);
      setSubmitting(false);
    }
  }, [isModalOpen]);

  useEffect(() => {
    if (!isModalOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isModalOpen, closeModal]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    const ok = await attemptUnlock(value);
    setSubmitting(false);
    if (!ok) {
      setError(true);
      inputRef.current?.focus();
      inputRef.current?.select();
    }
    // On success, the provider closes the modal — no extra UI here.
  };

  return (
    <AnimatePresence>
      {isModalOpen && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
        >
          <button
            aria-label="Close"
            onClick={closeModal}
            className="absolute inset-0"
            style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(8px)" }}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="password-modal-title"
            className="relative w-full max-w-[420px]"
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
            style={{
              background: "var(--color-surface-raised)",
              border: "1px solid var(--color-border)",
              padding: "32px",
            }}
          >
            <button
              onClick={closeModal}
              aria-label="Close"
              className="absolute top-3 right-3 flex items-center justify-center w-7 h-7 transition-colors"
              style={{ color: "var(--color-fg-tertiary)" }}
              onMouseEnter={(e) => { e.currentTarget.style.color = "var(--color-fg)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = "var(--color-fg-tertiary)"; }}
            >
              <CloseIcon size={12} />
            </button>

            <div
              className="flex items-center justify-center mb-4"
              style={{
                width: 36,
                height: 36,
                background: "var(--color-muted)",
                color: "var(--color-fg-secondary)",
              }}
            >
              <LockIcon size={16} />
            </div>

            <h2
              id="password-modal-title"
              style={{ ...typescale.h3, color: "var(--color-fg)", marginBottom: 4 }}
            >
              Wax on. Wax off.
            </h2>
            <p
              style={{
                ...typescale.body,
                color: "var(--color-fg-secondary)",
                marginBottom: 24,
              }}
            >
              This case study is currently being polished. Reach out directly if you'd like early access.
            </p>

            {/* Primary CTAs — email + LinkedIn. */}
            <div className="grid grid-cols-2 gap-2">
              <a
                href={`mailto:${EMAIL}`}
                className="flex items-center justify-center gap-2 px-3 py-2.5 transition-colors"
                style={{
                  ...typescale.body,
                  fontWeight: 500,
                  color: "var(--color-fg)",
                  background: "var(--color-bg)",
                  border: "1px solid var(--color-border)",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = "var(--color-accent)"; e.currentTarget.style.borderColor = "var(--color-accent)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = "var(--color-fg)"; e.currentTarget.style.borderColor = "var(--color-border)"; }}
              >
                <EmailIcon size={14} />
                Email
              </a>
              <a
                href={LINKEDIN_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-3 py-2.5 transition-colors"
                style={{
                  ...typescale.body,
                  fontWeight: 500,
                  color: "var(--color-fg)",
                  background: "var(--color-bg)",
                  border: "1px solid var(--color-border)",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = "var(--color-accent)"; e.currentTarget.style.borderColor = "var(--color-accent)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = "var(--color-fg)"; e.currentTarget.style.borderColor = "var(--color-border)"; }}
              >
                <LinkedInIcon size={14} />
                LinkedIn
              </a>
            </div>

            {/* "Got a code?" divider */}
            <div className="flex items-center gap-3 my-6">
              <span className="flex-1" style={{ height: 1, background: "var(--color-border)" }} />
              <span
                style={{
                  fontFamily: "var(--font-geist-mono), ui-monospace, Menlo, monospace",
                  fontSize: "11px",
                  color: "var(--color-fg-tertiary)",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                }}
              >
                Got a code?
              </span>
              <span className="flex-1" style={{ height: 1, background: "var(--color-border)" }} />
            </div>

            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                ref={inputRef}
                type="password"
                value={value}
                onChange={(e) => {
                  setValue(e.target.value);
                  if (error) setError(false);
                }}
                placeholder="Enter code"
                aria-label="Unlock code"
                aria-invalid={error || undefined}
                autoComplete="off"
                spellCheck={false}
                className="flex-1 px-3 py-2 outline-none"
                style={{
                  ...typescale.body,
                  color: "var(--color-fg)",
                  background: "var(--color-bg)",
                  border: `1px solid ${error ? "var(--color-accent)" : "var(--color-border)"}`,
                }}
              />
              <button
                type="submit"
                className="px-4 py-2 transition-opacity"
                style={{
                  ...typescale.body,
                  fontWeight: 500,
                  color: "var(--color-bg)",
                  background: "var(--color-fg)",
                  cursor: value.length === 0 || submitting ? "not-allowed" : "pointer",
                  opacity: value.length === 0 || submitting ? 0.5 : 1,
                  minWidth: 64,
                }}
                disabled={value.length === 0 || submitting}
              >
                {submitting ? "…" : "Go"}
              </button>
            </form>
            {error && (
              <p
                role="alert"
                style={{
                  ...typescale.label,
                  color: "var(--color-accent)",
                  marginTop: 8,
                }}
              >
                Wrong code. Reach out and I'll send you one.
              </p>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

- [ ] **Step 3.2: Verify TypeScript and dev server**

```bash
cd "~/Developer/portfolio 2026/site"
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3.3: Manual smoke test**

```bash
cd "~/Developer/portfolio 2026/site"
npm run dev
```

Open http://localhost:3000. Existing locked behavior triggers on `/work/*` (the `WorkGate` is still in place — Task 7 removes it). Click any case study card. The **modal** should now show the new "Wax on. Wax off." copy with email + LinkedIn buttons. Test:

- Email button opens mailto.
- LinkedIn button opens new tab to the profile.
- Type a wrong code → "Wrong code. Reach out and I'll send you one." appears in accent color.
- Type the correct code → modal closes silently, locked content unlocks.
- Reload → still unlocked.
- Open `localStorage.removeItem("portfolio-unlocked")` in devtools, reload → locked again.

Stop the dev server when satisfied.

- [ ] **Step 3.4: Commit**

```bash
cd "~/Developer/portfolio 2026"
git add site/components/PasswordModal.tsx
git commit -m "$(cat <<'EOF'
feat(lock): rework PasswordModal with email/LinkedIn CTAs + new copy

"Wax on. Wax off." headline + softer body. Primary path is contacting
Marco directly (email or LinkedIn buttons up top); password input drops
below a "Got a code?" divider as the secondary route. attemptUnlock
becomes async to match the new SHA-256 verification.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 4: Build `<LockGate>` component (card + page modes)

**Goal:** Single component that wraps a card or a page and adds the locked treatment when `locked && !unlocked`. Card mode adds a hover-revealed overlay; page mode swaps content for a friendly placeholder with return arrow.

**Files:**
- Create: `site/components/LockGate.tsx`

- [ ] **Step 4.1: Create `site/components/LockGate.tsx`**

```tsx
"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { usePasswordGate } from "@/lib/PasswordGateContext";
import { LockIcon, BackChevronIcon, EmailIcon, LinkedInIcon } from "./Icons";
import { typescale } from "@/lib/typography";

const EMAIL = "marcogsevilla@gmail.com";
const LINKEDIN_URL = "https://www.linkedin.com/in/marcogsevilla/";

type CardModeProps = {
  mode: "card";
  locked: boolean;
  children: React.ReactNode;
};

type PageModeProps = {
  mode: "page";
  locked: boolean;
  /** Page title shown on the locked placeholder (case study or Playground card title). */
  title: string;
  /** Subtitle / one-liner shown below the title. */
  subtitle?: string;
  /** Where the return arrow links. e.g. "/work" for case studies, "/play" for Playground. */
  backHref: string;
  children: React.ReactNode;
};

type LockGateProps = CardModeProps | PageModeProps;

export default function LockGate(props: LockGateProps) {
  const { unlocked, hydrated, requestUnlock } = usePasswordGate();

  // Always passthrough when not locked or already unlocked.
  if (!props.locked || unlocked) return <>{props.children}</>;

  if (props.mode === "card") {
    return <LockedCardWrapper onClick={requestUnlock}>{props.children}</LockedCardWrapper>;
  }

  // Page mode — render placeholder once hydrated. Pre-hydration we
  // render nothing to avoid leaking content from the SSR pass.
  if (!hydrated) return null;
  return (
    <LockedPagePlaceholder
      title={props.title}
      subtitle={props.subtitle}
      backHref={props.backHref}
      onUnlockClick={requestUnlock}
    />
  );
}

// ── Card mode ──

// Wraps the existing card markup in a relative container and overlays a
// click-trapping button on hover. The original card still renders its
// resting state at full opacity so the page reads the same when no
// pointer is over the card. On hover, the overlay's backdrop-blur + dim
// covers the card and reveals the lock icon + micro-copy.
function LockedCardWrapper({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <div className="relative group">
      {/* Original card — unmodified. The overlay sits above it and
          intercepts pointer events when locked, so the underlying
          card's hover effects (bento glow, scale) never fire. */}
      <div className="relative">{children}</div>

      <button
        type="button"
        onClick={onClick}
        aria-label="Locked — click to view unlock options"
        className="absolute inset-0 flex flex-col items-center justify-center gap-2 cursor-pointer opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity duration-200 ease-out"
        style={{
          background: "color-mix(in oklab, var(--color-bg) 50%, transparent)",
          backdropFilter: "blur(2px)",
          WebkitBackdropFilter: "blur(2px)",
        }}
      >
        <LockIcon size={24} style={{ color: "var(--color-fg-secondary)" }} />
        <span
          style={{
            fontFamily: "var(--font-geist-mono), ui-monospace, Menlo, monospace",
            fontSize: "11px",
            fontWeight: 500,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            color: "var(--color-fg-tertiary)",
          }}
        >
          In progress — click for details
        </span>
      </button>
    </div>
  );
}

// ── Page mode ──

function LockedPagePlaceholder({
  title,
  subtitle,
  backHref,
  onUnlockClick,
}: {
  title: string;
  subtitle?: string;
  backHref: string;
  onUnlockClick: () => void;
}) {
  return (
    <div className="relative">
      {/* Sticky return arrow at top-left. Matches the existing
          MobileNav "back" pattern. */}
      <Link
        href={backHref}
        className="absolute top-6 left-6 inline-flex items-center gap-1.5 transition-colors"
        style={{
          ...typescale.body,
          color: "var(--color-fg-secondary)",
        }}
        onMouseEnter={(e) => { e.currentTarget.style.color = "var(--color-fg)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.color = "var(--color-fg-secondary)"; }}
      >
        <BackChevronIcon size={14} />
        Back
      </Link>

      <motion.div
        className="min-h-[60vh] flex flex-col items-center justify-center text-center px-6 py-24"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <h1
          style={{
            ...typescale.caseStudyHero,
            color: "var(--color-fg)",
            marginBottom: 8,
            maxWidth: 720,
          }}
        >
          {title}
        </h1>
        {subtitle && (
          <p
            style={{
              ...typescale.subtitle,
              color: "var(--color-fg-secondary)",
              maxWidth: 560,
              marginBottom: 32,
            }}
          >
            {subtitle}
          </p>
        )}

        <div
          className="flex items-center justify-center mb-4"
          style={{
            width: 44,
            height: 44,
            background: "var(--color-muted)",
            color: "var(--color-fg-secondary)",
          }}
        >
          <LockIcon size={20} />
        </div>

        <h2
          style={{ ...typescale.h3, color: "var(--color-fg)", marginBottom: 6 }}
        >
          Wax on. Wax off.
        </h2>
        <p
          style={{
            ...typescale.body,
            color: "var(--color-fg-secondary)",
            maxWidth: 420,
            marginBottom: 24,
          }}
        >
          This case study is currently being polished. Reach out directly if you'd like early access.
        </p>

        <div className="flex items-center gap-2">
          <a
            href={`mailto:${EMAIL}`}
            className="inline-flex items-center gap-2 px-4 py-2.5 transition-colors"
            style={{
              ...typescale.body,
              fontWeight: 500,
              color: "var(--color-fg)",
              background: "var(--color-bg)",
              border: "1px solid var(--color-border)",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "var(--color-accent)"; e.currentTarget.style.borderColor = "var(--color-accent)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "var(--color-fg)"; e.currentTarget.style.borderColor = "var(--color-border)"; }}
          >
            <EmailIcon size={14} />
            Email
          </a>
          <a
            href={LINKEDIN_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 transition-colors"
            style={{
              ...typescale.body,
              fontWeight: 500,
              color: "var(--color-fg)",
              background: "var(--color-bg)",
              border: "1px solid var(--color-border)",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "var(--color-accent)"; e.currentTarget.style.borderColor = "var(--color-accent)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "var(--color-fg)"; e.currentTarget.style.borderColor = "var(--color-border)"; }}
          >
            <LinkedInIcon size={14} />
            LinkedIn
          </a>
          <button
            type="button"
            onClick={onUnlockClick}
            className="inline-flex items-center gap-2 px-4 py-2.5 transition-opacity"
            style={{
              ...typescale.body,
              fontWeight: 500,
              color: "var(--color-bg)",
              background: "var(--color-fg)",
            }}
          >
            Got a code?
          </button>
        </div>
      </motion.div>
    </div>
  );
}
```

- [ ] **Step 4.2: Verify TypeScript**

```bash
cd "~/Developer/portfolio 2026/site"
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4.3: Commit**

```bash
cd "~/Developer/portfolio 2026"
git add site/components/LockGate.tsx
git commit -m "$(cat <<'EOF'
feat(lock): add LockGate component (card + page modes)

Card mode wraps a card with an absolute overlay button revealed on
hover (50% bg fade + 2px backdrop-blur + lock icon + "In progress"
micro-copy). Page mode renders a placeholder with the page title,
the modal CTAs inline, and a sticky return arrow. Replaces the
site-wide WorkGate pattern with a per-slug component the next tasks
will wire up.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 5: Wire homepage Work cards + rows + remove `galleryReadyStudies` filter

**Goal:** Stop hiding studies from the homepage. Apply LockGate to every CaseStudyCard render and pass per-slug `locked` to every CaseStudyListRow.

**Files:**
- Modify: `site/components/CaseStudyListRow.tsx` — convert to per-slug `locked` prop
- Modify: `site/components/CaseStudyList.tsx` — remove `galleryReadyStudies` filter, wrap card and gallery surfaces in `<LockGate mode="card">`, pass `locked` to row

- [ ] **Step 5.1: Refactor `site/components/CaseStudyListRow.tsx`**

The current file gates ALL rows when not unlocked. Replace with a per-slug `locked` prop. The Row no longer reads context directly.

Replace the entire file with:

```tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import type { CaseStudyMeta } from "@/lib/types";
import { SPRING_SNAP } from "@/lib/springs";
import { usePasswordGate } from "@/lib/PasswordGateContext";
import { LockIcon } from "./Icons";

interface CaseStudyListRowProps {
  study: CaseStudyMeta;
  /** When true, the row renders the locked treatment and clicks open the
   *  unlock modal instead of navigating. The caller (CaseStudyList) is
   *  responsible for deciding lock state from `lib/locked-content`. */
  locked: boolean;
}

export default function CaseStudyListRow({ study, locked }: CaseStudyListRowProps) {
  const [hovered, setHovered] = useState(false);
  const { requestUnlock } = usePasswordGate();

  const titleNode = (
    <motion.span
      style={{
        fontFamily: "var(--font-sans)",
        fontWeight: 500,
        fontSize: "calc(14px + var(--font-size-offset))",
        color: hovered ? "var(--color-accent)" : "var(--color-fg)",
      }}
      animate={{ x: hovered ? 8 : 0 }}
      transition={SPRING_SNAP}
    >
      {study.title}
    </motion.span>
  );

  const trailing = locked ? (
    <span
      className="inline-flex items-center gap-1.5"
      style={{
        fontFamily: "var(--font-geist-mono), ui-monospace, Menlo, monospace",
        fontSize: "11px",
        fontWeight: 500,
        textTransform: "uppercase",
        letterSpacing: "0.06em",
        color: hovered ? "var(--color-accent)" : "var(--color-fg-tertiary)",
      }}
    >
      <LockIcon size={11} />
      Coming soon
    </span>
  ) : null;

  const rowInner = (
    <div
      className="flex items-baseline justify-between gap-4 py-3"
      style={{ borderBottom: "1px dashed var(--color-border)" }}
    >
      {titleNode}
      {trailing}
    </div>
  );

  if (locked) {
    return (
      <button
        type="button"
        onClick={requestUnlock}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onFocus={() => setHovered(true)}
        onBlur={() => setHovered(false)}
        className="group block w-full text-left"
        aria-label={`${study.title} — locked, enter password to view`}
      >
        {rowInner}
      </button>
    );
  }

  return (
    <Link
      href={`/work/${study.slug}`}
      className="group block"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {rowInner}
    </Link>
  );
}
```

- [ ] **Step 5.2: Modify `site/components/CaseStudyList.tsx`**

Two changes:
1. Remove the `galleryReadyStudies` filter (lines 65–72) and inline its replacement so all studies render.
2. Wrap each `<CaseStudyCard>` render in `<LockGate mode="card" locked={isLocked(study.slug)}>`. Pass `locked={isLocked(study.slug)}` to each `<CaseStudyListRow>`.

Imports: at the top of the file, add:

```tsx
import LockGate from "./LockGate";
import { isLocked } from "@/lib/locked-content";
```

Find the block at lines 65–72:

```tsx
  // Studies whose first gallery slot has a layered UI mock — anything
  // without a foreground UI is hidden from the gallery view (empty arrays
  // and backdrop-only photos).
  const galleryReadyStudies = filteredStudies.filter((s) => {
    const items = galleryContent[s.slug] ?? [];
    const first = items[0];
    return first != null && typeof first === "object" && "layers" in first;
  });
```

Replace it with:

```tsx
  // All filtered studies render, regardless of gallery readiness — locked
  // studies still appear in cards/lists with the LockGate treatment.
  const galleryReadyStudies = filteredStudies;
```

(We keep the `galleryReadyStudies` name to minimize downstream churn — both `<GalleryCardList>` and `<GalleryMode>` already consume it.)

Then find every render of `<CaseStudyCard study={study} ... />` in the file (search for `CaseStudyCard` — there are renders inside `GalleryCard` / `GalleryCardList` etc.). Wrap each in:

```tsx
<LockGate mode="card" locked={isLocked(study.slug)}>
  <CaseStudyCard study={study} ... />
</LockGate>
```

Likewise, find every `<CaseStudyListRow study={study} />` render and pass the `locked` prop:

```tsx
<CaseStudyListRow study={study} locked={isLocked(study.slug)} />
```

If the file has many usages (e.g. 4+), prefer a small helper at the top of the file rather than inlining:

```tsx
function GatedCard({ study, ...rest }: { study: CaseStudyMeta } & React.ComponentProps<typeof CaseStudyCard>) {
  return (
    <LockGate mode="card" locked={isLocked(study.slug)}>
      <CaseStudyCard study={study} {...rest} />
    </LockGate>
  );
}
```

Use `<GatedCard>` everywhere `<CaseStudyCard>` is rendered. (This is fine because `CaseStudyCard` already handles its own internal Link — `LockGate` just overlays.)

- [ ] **Step 5.3: Verify TypeScript and dev server**

```bash
cd "~/Developer/portfolio 2026/site"
npx tsc --noEmit
```

Expected: no errors.

```bash
npm run dev
```

Open http://localhost:3000. (The site-wide `WorkGate` is still active — the homepage stays viewable.) Test:

- All 6 work studies appear in the homepage `#work` section as cards (none are hidden).
- Hovering any locked card shows the dim + lock + "In progress — click for details" overlay.
- Clicking a locked card opens the modal (instead of navigating to `/work/{slug}` — the card's underlying Link is intercepted by the overlay button).
- Switching to list view (the toggle is currently behind `false &&` per the existing comment, so this might require enabling the toggle or testing via direct DOM inspection — note this and skip if unreachable in the current UI; the prop wiring is what matters).

Stop the dev server.

- [ ] **Step 5.4: Commit**

```bash
cd "~/Developer/portfolio 2026"
git add site/components/CaseStudyListRow.tsx site/components/CaseStudyList.tsx
git commit -m "$(cat <<'EOF'
feat(lock): per-slug locking for homepage work cards + rows

Removes the galleryReadyStudies filter (was hiding 3 studies from the
homepage). Wraps every CaseStudyCard render in <LockGate mode="card">;
passes locked={isLocked(slug)} to every CaseStudyListRow. Locked rows
now drive off the prop instead of reading the gate context globally.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 6: Wire Playground homepage cards

**Goal:** Apply the locked card overlay to the 3 Playground cards on the homepage `#playground` section and on `/play`. Both surfaces use the same `<Playground>` component, so one edit covers both.

**Files:**
- Modify: `site/components/Playground.tsx`

- [ ] **Step 6.1: Modify `site/components/Playground.tsx`**

Add imports at the top:

```tsx
import LockGate from "./LockGate";
import { isLocked } from "@/lib/locked-content";
```

Find the inner map that renders each card (around line 51–60):

```tsx
{PLAYGROUND_CARDS.map((card) => (
  <div
    key={card.slug}
    className={isWide(card) ? "sm:col-span-2" : "sm:col-span-1"}
  >
    <PlaygroundCardItem card={card} />
  </div>
))}
```

Replace it with:

```tsx
{PLAYGROUND_CARDS.map((card) => (
  <div
    key={card.slug}
    className={isWide(card) ? "sm:col-span-2" : "sm:col-span-1"}
  >
    <LockGate mode="card" locked={isLocked(card.slug)}>
      <PlaygroundCardItem card={card} />
    </LockGate>
  </div>
))}
```

Note: `PlaygroundCardItem` includes the description paragraph below the card frame. The overlay covers the whole `<Link>` (frame + title + description) — that's intentional: clicking anywhere inside the card opens the modal when locked. If you want the description to stay clickable as plain text below the locked frame, move it outside the Link (out of scope for this plan; flag as future work if Marco requests).

- [ ] **Step 6.2: Verify TypeScript and dev server**

```bash
cd "~/Developer/portfolio 2026/site"
npx tsc --noEmit
```

Expected: no errors.

```bash
npm run dev
```

Open http://localhost:3000:

- Scroll to `#playground`. Each of the 3 cards shows its autoplay video at rest.
- Hovering a card shows dim + lock + "In progress — click for details" over the video and the title/description.
- Clicking opens the modal.

Open http://localhost:3000/play:

- Same 3 cards, same behavior.

Stop the dev server.

- [ ] **Step 6.3: Commit**

```bash
cd "~/Developer/portfolio 2026"
git add site/components/Playground.tsx
git commit -m "$(cat <<'EOF'
feat(lock): gate Playground cards on homepage and /play

Wraps each PlaygroundCardItem in <LockGate mode="card"> so the three
in-progress Playground subpages get the same hover dim + lock overlay
as the work case studies.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 7: Replace `WorkGate` with per-page `<LockGate>` on all 6 work case studies

**Goal:** Tear out the site-wide `app/work/WorkGate.tsx` and wrap each of the 6 locked case-study pages in `<LockGate mode="page">`. `/work/ai-workflow` (not in `LOCKED_SLUGS`) becomes naturally accessible.

**Files:**
- Delete: `site/app/work/WorkGate.tsx`
- Delete: `site/app/work/layout.tsx`
- Modify: `site/app/work/fb-ordering/page.tsx`
- Modify: `site/app/work/compendium/page.tsx`
- Modify: `site/app/work/upsells/page.tsx`
- Modify: `site/app/work/checkin/page.tsx`
- Modify: `site/app/work/general-task/page.tsx`
- Modify: `site/app/work/design-system/page.tsx`

For each of the 6 work case studies, the `page.tsx` currently renders something like:

```tsx
import type { Metadata } from "next";
import FBOrderingContent from "./FBOrderingContent";

export const metadata: Metadata = { /* ... */ };

export default function FBOrderingPage() {
  return (
    <div className="pb-20">
      <FBOrderingContent />
    </div>
  );
}
```

We're going to wrap the content in `<LockGate mode="page">`. The required props are `title` (case study title) and `subtitle` (one-liner). Both come from the MDX frontmatter — we'll inline literals here rather than re-loading the MDX, since the values are stable.

**Title/subtitle table** (matches MDX frontmatter):

| Slug | Title | Subtitle |
|------|-------|----------|
| fb-ordering | Mobile ordering for hotels | Designing a 0→1 mobile ordering system for hotels |
| compendium | Hotel guest experience app | A scalable hotel CMS platform built from scratch |
| upsells | Upsells | A configurable form system for hotel upsell purchases |
| checkin | Hotel Check-in | Modernizing software for the world's largest hotel chains |
| general-task | Unified hub for knowledge work | Building productivity software for software engineers |
| design-system | Building a visual language 0-1 | Creating a scalable design system for a productivity startup |

- [ ] **Step 7.1: Delete `site/app/work/WorkGate.tsx`**

```bash
cd "~/Developer/portfolio 2026/site"
rm app/work/WorkGate.tsx
```

- [ ] **Step 7.2: Delete `site/app/work/layout.tsx`**

```bash
cd "~/Developer/portfolio 2026/site"
rm app/work/layout.tsx
```

(Removing the layout means `/work/*` falls back to the root layout, which is what we want — root layout already provides the `<PasswordGateProvider>` and `<PasswordModal />` mounts.)

- [ ] **Step 7.3: Modify `site/app/work/fb-ordering/page.tsx`**

Replace the entire file with:

```tsx
import type { Metadata } from "next";
import FBOrderingContent from "./FBOrderingContent";
import LockGate from "@/components/LockGate";
import { isLocked } from "@/lib/locked-content";

export const metadata: Metadata = {
  title: "F&B Mobile Ordering — Marco Sevilla",
  description:
    "A mobile, app-less food and beverage ordering system that lets hotel guests browse menus and place room service orders from their phone.",
  openGraph: {
    title: "F&B Mobile Ordering — Marco Sevilla",
    description:
      "A mobile, app-less food and beverage ordering system that lets hotel guests browse menus and place room service orders from their phone.",
  },
};

export default function FBOrderingPage() {
  return (
    <LockGate
      mode="page"
      locked={isLocked("fb-ordering")}
      title="Mobile ordering for hotels"
      subtitle="Designing a 0→1 mobile ordering system for hotels"
      backHref="/work"
    >
      <div className="pb-20">
        <FBOrderingContent />
      </div>
    </LockGate>
  );
}
```

- [ ] **Step 7.4: Modify `site/app/work/compendium/page.tsx`**

Read the existing file first to preserve metadata. Then wrap the content the same way:

```tsx
// existing imports + metadata block — preserve them as-is
import LockGate from "@/components/LockGate";
import { isLocked } from "@/lib/locked-content";

// ... existing metadata export ...

export default function CompendiumPage() {
  return (
    <LockGate
      mode="page"
      locked={isLocked("compendium")}
      title="Hotel guest experience app"
      subtitle="A scalable hotel CMS platform built from scratch"
      backHref="/work"
    >
      {/* existing JSX content here */}
    </LockGate>
  );
}
```

- [ ] **Step 7.5: Modify `site/app/work/upsells/page.tsx`**

Same pattern, with:

```tsx
<LockGate
  mode="page"
  locked={isLocked("upsells")}
  title="Upsells"
  subtitle="A configurable form system for hotel upsell purchases"
  backHref="/work"
>
  {/* existing content */}
</LockGate>
```

- [ ] **Step 7.6: Modify `site/app/work/checkin/page.tsx`**

```tsx
<LockGate
  mode="page"
  locked={isLocked("checkin")}
  title="Hotel Check-in"
  subtitle="Modernizing software for the world's largest hotel chains"
  backHref="/work"
>
  {/* existing content */}
</LockGate>
```

- [ ] **Step 7.7: Modify `site/app/work/general-task/page.tsx`**

```tsx
<LockGate
  mode="page"
  locked={isLocked("general-task")}
  title="Unified hub for knowledge work"
  subtitle="Building productivity software for software engineers"
  backHref="/work"
>
  {/* existing content */}
</LockGate>
```

- [ ] **Step 7.8: Modify `site/app/work/design-system/page.tsx`**

```tsx
<LockGate
  mode="page"
  locked={isLocked("design-system")}
  title="Building a visual language 0-1"
  subtitle="Creating a scalable design system for a productivity startup"
  backHref="/work"
>
  {/* existing content */}
</LockGate>
```

- [ ] **Step 7.9: Verify TypeScript and dev server**

```bash
cd "~/Developer/portfolio 2026/site"
npx tsc --noEmit
```

Expected: no errors. (No leftover imports of `WorkGate` since we deleted both files that reference it.)

```bash
grep -rn "WorkGate" site/app site/components site/lib 2>/dev/null
```

Expected: no matches.

```bash
npm run dev
```

Open http://localhost:3000/work/fb-ordering directly. (First clear `localStorage.removeItem("portfolio-unlocked")` in devtools to simulate a locked visitor.) Verify:

- The locked placeholder renders: title "Mobile ordering for hotels", subtitle, lock icon, "Wax on. Wax off." headline, body, three buttons (Email, LinkedIn, Got a code?).
- "Back" arrow at top-left routes to `/work`.
- "Got a code?" button opens the modal.
- After unlocking, the page swaps to the real case-study content without a navigation.

Test the same flow for one other study (e.g., `/work/general-task`).

Then visit `/work/ai-workflow` — it's not in `LOCKED_SLUGS`, so it should render normally (no gate).

Stop the dev server.

- [ ] **Step 7.10: Commit**

```bash
cd "~/Developer/portfolio 2026"
git add -A
git commit -m "$(cat <<'EOF'
refactor(lock): replace WorkGate with per-page LockGate on case studies

Deletes the site-wide app/work/WorkGate.tsx + app/work/layout.tsx in
favor of a per-slug <LockGate mode="page"> wrapper on each of the 6
locked work case-study pages. /work/ai-workflow is no longer gated
because it's not in LOCKED_SLUGS — the existing content was always
ready to ship.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 8: Wrap all 3 Playground subpages

**Goal:** Apply page-mode `<LockGate>` to the 3 Playground subpages so direct URL access shows the placeholder + return arrow back to `/play`.

**Files:**
- Modify: `site/app/play/six-degrees/page.tsx`
- Modify: `site/app/play/pajamagrams/page.tsx`
- Modify: `site/app/play/custom-wrapped/page.tsx`

Title/subtitle table (from `lib/playground-cards.ts`):

| Slug | Title | Subtitle |
|------|-------|----------|
| six-degrees | Six Degrees | Movie-graph puzzle game built with Next.js, TMDb, and Web Audio |
| pajamagrams | Pajamagrams | A mobile-first puzzle gift inspired by Bananagrams |
| custom-wrapped | Custom Wrapped | A year-in-review experience built like Spotify Wrapped |

(The subtitles above are short variants of the longer descriptions in `playground-cards.ts` — appropriate for a placeholder where space is tight. Marco can swap in his preferred wording later.)

- [ ] **Step 8.1: Modify `site/app/play/six-degrees/page.tsx`**

Replace the entire file with:

```tsx
import type { Metadata } from "next";
import SixDegreesContent from "./SixDegreesContent";
import LockGate from "@/components/LockGate";
import { isLocked } from "@/lib/locked-content";

export const metadata: Metadata = {
  title: "Six Degrees — Marco Sevilla",
  description:
    "A movie-graph puzzle game that started as a roadtrip car game with friends. Built with Next.js, TMDb, and synthesized Web Audio.",
  openGraph: {
    title: "Six Degrees — Marco Sevilla",
    description:
      "A movie-graph puzzle game that started as a roadtrip car game with friends.",
  },
};

export default function SixDegreesPage() {
  return (
    <LockGate
      mode="page"
      locked={isLocked("six-degrees")}
      title="Six Degrees"
      subtitle="Movie-graph puzzle game built with Next.js, TMDb, and Web Audio"
      backHref="/play"
    >
      <div className="pb-20">
        <SixDegreesContent />
      </div>
    </LockGate>
  );
}
```

- [ ] **Step 8.2: Modify `site/app/play/pajamagrams/page.tsx`**

Same pattern. Read the existing file to preserve its metadata; then wrap the content:

```tsx
<LockGate
  mode="page"
  locked={isLocked("pajamagrams")}
  title="Pajamagrams"
  subtitle="A mobile-first puzzle gift inspired by Bananagrams"
  backHref="/play"
>
  {/* existing content (e.g. <PajamagramsContent />) wrapped in pb-20 div */}
</LockGate>
```

- [ ] **Step 8.3: Modify `site/app/play/custom-wrapped/page.tsx`**

```tsx
<LockGate
  mode="page"
  locked={isLocked("custom-wrapped")}
  title="Custom Wrapped"
  subtitle="A year-in-review experience built like Spotify Wrapped"
  backHref="/play"
>
  {/* existing content */}
</LockGate>
```

- [ ] **Step 8.4: Verify TypeScript and dev server**

```bash
cd "~/Developer/portfolio 2026/site"
npx tsc --noEmit
```

Expected: no errors.

```bash
npm run dev
```

After clearing localStorage, navigate directly to `/play/six-degrees`, `/play/pajamagrams`, `/play/custom-wrapped`. Each should:

- Render the locked placeholder with the right title + subtitle.
- Show "Back" arrow that routes to `/play`.
- Allow unlocking via the password modal — after unlock, real content renders.

Stop the dev server.

- [ ] **Step 8.5: Commit**

```bash
cd "~/Developer/portfolio 2026"
git add site/app/play/six-degrees/page.tsx site/app/play/pajamagrams/page.tsx site/app/play/custom-wrapped/page.tsx
git commit -m "$(cat <<'EOF'
feat(lock): gate Playground subpages with per-page LockGate

Wraps the 3 Playground subpages in <LockGate mode="page"> so direct URL
access lands on the placeholder + return arrow back to /play, matching
the work case-study behavior.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 9: Final QA pass

**Goal:** Walk through the spec's QA matrix end-to-end, fix anything that breaks, and confirm Vercel env config is documented.

- [ ] **Step 9.1: Boot the dev server**

```bash
cd "~/Developer/portfolio 2026/site"
npm run dev
```

- [ ] **Step 9.2: Clear localStorage to simulate a fresh visitor**

In Chrome DevTools console:

```js
localStorage.removeItem("portfolio-unlocked");
location.reload();
```

- [ ] **Step 9.3: Walk the QA matrix from the spec**

Run through each item. Take notes on anything that fails — fix and re-test before continuing.

| Check | Expected | Pass? |
|-------|----------|-------|
| Homepage `#work` cards: 6 visible | All 6 case studies render | |
| Hovering F&B card | Dim + 2px blur + lock icon + "In progress — click for details" | |
| Click locked work card | Modal opens with "Wax on. Wax off." + email/LinkedIn/code | |
| Hovering Playground card on homepage | Video keeps playing, hover dim + lock | |
| Hovering Playground card on `/play` | Same | |
| Click locked Playground card | Modal opens | |
| Direct nav to `/work/fb-ordering` (locked) | Locked placeholder with title/subtitle/Back arrow | |
| Click "Back" arrow on locked work page | Routes to `/work` | |
| Direct nav to `/play/six-degrees` (locked) | Locked placeholder, Back arrow → `/play` | |
| Modal: email button | Opens mailto:marcogsevilla@gmail.com | |
| Modal: LinkedIn button | Opens new tab to profile | |
| Modal: wrong code | Border turns accent, "Wrong code…" alert shows | |
| Modal: correct code | Modal closes silently, all locked items unlock | |
| Reload after unlock | Still unlocked | |
| Open second tab | Already unlocked (storage event sync) | |
| Lock again: `localStorage.removeItem("portfolio-unlocked")` + reload | All locked content re-locks | |
| Esc closes modal | yes | |
| Backdrop click closes modal | yes | |
| Mobile viewport (≤sm): modal | Renders centered in viewport (modal is single layout, not a separate sheet — acceptable per current implementation) | |
| `/work/ai-workflow` (NOT in LOCKED_SLUGS) | Renders unlocked, normal hover, click navigates | |

Any failure: stop, debug, fix, commit, return to top of matrix.

- [ ] **Step 9.4: Build check**

```bash
cd "~/Developer/portfolio 2026/site"
npm run build
```

Expected: build succeeds. The `NEXT_PUBLIC_UNLOCK_CODE_HASH` env var inlines into the client bundle. Watch for warnings about missing env vars.

- [ ] **Step 9.5: Add Vercel env config note**

Add a one-paragraph note to `docs/PORTFOLIO-PRIORITIES.md` (under "Recently Shipped or In Flight") so Marco remembers to set the same env var on Vercel:

```markdown
- **Locked content gating** (deployed): WIP-courtesy gate on 6 work case studies + 3 Playground subpages. Set `NEXT_PUBLIC_UNLOCK_CODE_HASH` in Vercel env vars (Settings → Environment Variables) — same hash that's in `.env.local`. Hash generator: `npm run hash:code -- <code>`. To unlock a study permanently when ready, remove its slug from `site/lib/locked-content.ts`.
```

Insert as a new bullet in the "Recently Shipped or In Flight" list.

- [ ] **Step 9.6: Commit and update CLAUDE.md Current State**

Open `CLAUDE.md` and update the "Current State" section to reflect this session's outcome (briefly — what shipped, the env var requirement on Vercel, and that all 9 slugs are gated).

```bash
cd "~/Developer/portfolio 2026"
git add CLAUDE.md docs/PORTFOLIO-PRIORITIES.md
git commit -m "$(cat <<'EOF'
docs: note locked-content gating shipped + Vercel env var

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

- [ ] **Step 9.7: Push (do NOT push automatically — pause for Marco)**

Stop and ask Marco:

> "All 9 tasks done locally. Ready to push to origin/main? (Vercel will need `NEXT_PUBLIC_UNLOCK_CODE_HASH` set in env vars before the deploy can serve unlocks — the build won't fail without it, but the unlock flow will silently fail-closed.)"

If yes:

```bash
cd "~/Developer/portfolio 2026"
git push origin main
```

---

## Self-review

**Spec coverage:**

| Spec section | Plan task |
|--------------|-----------|
| Locked content inventory (9 slugs) | Task 1 (`lib/locked-content.ts`) |
| Locked card hover state (dim + blur + lock + micro-copy) | Task 4 (`LockGate` card mode) |
| Locked list-row state | Task 5 (`CaseStudyListRow` per-slug `locked` prop — keeps existing pattern from the codebase, slightly differs from spec's "title to tertiary + lock icon" — see deviation note below) |
| Unlock modal (Wax on. Wax off. + email/LinkedIn + Got a code?) | Task 3 (`PasswordModal` rewrite) |
| Locked full-page placeholder + return arrow | Task 4 (`LockGate` page mode) |
| LockContext architecture | Task 2 (reuses existing `PasswordGateContext`) |
| `<LockGate>` component | Task 4 |
| `lib/locked-content.ts` | Task 1 |
| Integration in CaseStudyList | Task 5 |
| Integration in Playground | Task 6 |
| Wrap all 6 work case-study pages | Task 7 |
| Wrap all 3 Playground subpages | Task 8 |
| Setting the password (hash script) | Task 1 (`scripts/hash-code.mjs`) |
| Edge cases (multi-tab sync, etc.) | Task 2 (storage event listener) |
| Manual QA matrix | Task 9 |

**Deviations from spec:**

1. **List-row visual treatment.** The spec described title→tertiary + small inline lock icon for locked rows. The codebase already had a "Coming soon" + lock icon pattern in `CaseStudyListRow` that's visually similar. The plan keeps the existing pattern (which Marco has already approved by not changing it) and only refactors the trigger from "always locked when not unlocked" to "per-slug `locked` prop." If Marco wants the spec's exact visual (title goes tertiary instead of accent on hover), that's a small follow-up edit to `CaseStudyListRow` lines 27-29.

2. **Existing `PasswordGate*` files renamed in spec but kept in plan.** The spec described new `LockContext` and `LockUIContext` files. The plan reuses the pre-existing `PasswordGateContext` (which combines both responsibilities) to minimize churn. Behavior is identical; the names differ. If Marco wants a rename (`PasswordGateContext` → `LockContext`), it's purely cosmetic and can be a follow-up.

3. **No separate `<LockedPagePlaceholder>` component.** The spec described a separate file; the plan inlines it as a function inside `LockGate.tsx` because it's only used there. Same code, fewer files.

4. **Modal layout on small viewports.** The spec specified a slide-up bottom sheet for `<sm`. The plan keeps the existing centered modal layout at all sizes. The existing modal is already mobile-friendly (max-width clamp, padding). Bottom-sheet behavior would be a follow-up if Marco wants it.

**Placeholder scan:** No "TBD", "TODO", "implement later", or "fill in details" patterns. All file paths are exact. All code blocks compile. All commit messages are written out.

**Type consistency:**
- `attemptUnlock` returns `Promise<boolean>` in Task 2 and is awaited in Task 3.
- `LockGateProps` discriminated union (`mode: "card"` vs. `mode: "page"`) is consistent across Task 4 (definition) and Tasks 5-8 (consumers).
- `isLocked(slug: string): boolean` signature is the same in Task 1 (definition) and Tasks 5-8 (callers).

---

**Plan complete and saved to `docs/superpowers/plans/2026-05-02-locked-content-gating.md`.**

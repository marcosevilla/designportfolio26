---
description: The two independent access gates — per-study LockGate and the site-wide password wall
paths:
  - "site/lib/locked-content.ts"
  - "site/lib/site-gate.ts"
  - "site/lib/PasswordGateContext.tsx"
  - "site/components/LockGate.tsx"
  - "site/components/PasswordModal.tsx"
  - "site/proxy.ts"
  - "site/app/api/gate/**"
  - "site/scripts/hash-code.mjs"
  - "site/public/sitemap.xml"
---

# Access gating

There are **two independent gates**. Don't conflate them.

## 1. Per-study LockGate (shipped 2026-05-02)
WIP-courtesy gate on a subset of case studies + Playground subpages. Spec/plan: `docs/superpowers/specs/2026-05-02-locked-content-gating-design.md` + `docs/superpowers/plans/2026-05-02-locked-content-gating.md`.

- **Single source of truth:** `lib/locked-content.ts` (`LOCKED_SLUGS` Set). Removing a slug from this Set permanently unlocks that page.
- **Wrapper:** `components/LockGate.tsx` — `card` mode (hover overlay + click intercept on homepage cards, accepts `cardRadius` and `cursorLabel`; the click-trap overlay swallows the card's own hover handlers, so the wrapper sets the label) and `page` mode (full-screen placeholder with staggered motion + email / LinkedIn / "I have a code" CTAs).
- **Provider:** `lib/PasswordGateContext.tsx` — env-hash check + multi-tab sync via storage events.
- **Modal:** `components/PasswordModal.tsx` — global, mounted in `app/layout.tsx`.
- **Env var:** `NEXT_PUBLIC_UNLOCK_CODE_HASH` in Vercel for a non-default code (default hash accepts `miyagi`). Generator: `npm run hash:code -- <code>`.
- Locking a study also means: remove it from `public/sitemap.xml`, and chat stops injecting its draft (see `.claude/rules/chat.md`).
- **Dead-end hazard:** when locking a study, check every `NextProject` that points at it — visitors finishing the previous study otherwise hit the gate placeholder.

## 2. Site-wide password wall (shipped 2026-07-29)
⚠️ **This can put the ENTIRE production site behind a password.** Unrelated to LockGate.

- Server-side: `site/proxy.ts` (Next 16 proxy/middleware, returns a standalone 401 gate page for cookie-less requests on every route incl. `/api/chat`) + `site/app/api/gate/route.ts` (checks password, sets 30-day httpOnly cookie) + `site/lib/site-gate.ts`.
- **`SITE_GATE_ENABLED` flag in `site/lib/site-gate.ts` — flip to `false` + deploy to REOPEN.** The sha256 password hash lives there too. Password has been `marcowits`.
- Dev/localhost is never gated (NODE_ENV check), so the inline editor flow is unaffected.
- Gate page is self-contained inline HTML (light/dark via prefers-color-scheme, noindex).
- **Reopen before sharing the site with recruiters.**
- ⚠️ **Flagged 2026-08-04, unresolved:** the gate appeared to be OFF in prod — `curl` with no cookie returned the full page, not the 401. Marco may have opened it deliberately. Verify state before assuming either way.

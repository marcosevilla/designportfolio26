---
description: Chat bar architecture, link grammar, env vars, spend safety, and the panel surface
paths:
  - "site/components/chat/**"
  - "site/lib/chat/**"
  - "site/app/api/chat/**"
  - "site/components/ChatFab.tsx"
  - "site/scripts/test-chat-parser.ts"
  - "site/lib/ChatOverlayContext.tsx"
---

# Chat bar

- Surface: `site/components/chat/`. Data + prompt + rate-limit: `site/lib/chat/`. Server: `site/app/api/chat/route.ts` (Node runtime).
- Single source of truth for studies in chat: `site/lib/chat/study-metadata.ts`. Adding a new case study to chat = add an entry here + (optionally) drop a markdown draft at `case-studies/<filename>.md` and map the slug → filename in `site/lib/chat/case-study-content.ts`.
- Inline link grammar in assistant replies (parser at `site/components/chat/parseChatMarkup.tsx`):
  - `[label](study:<slug>)`, `[label](about)`, `[label](resume)`, `[label](contact:email)`, `[label](contact:linkedin)`
  - Unknown slugs degrade to plain label text — safe by design.
- Trailing `<artifact slug="<slug>" />` marker → `CaseStudyCardUnfurl` (max one per reply).
- Env vars (Vercel + `.env.local`): `ANTHROPIC_API_KEY`, `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`.
- Spend safety: $25/mo cap in Anthropic console. Per-IP: 8/min, 60/day via Upstash. Plus `max_tokens: 1024` and 30-turn transcript cap.
- Pure-function tests: `site/scripts/test-chat-parser.ts`. Run with `npx tsx scripts/test-chat-parser.ts`.

## Locked-study privacy
`lib/chat/case-study-content.ts` returns `""` via `isLocked()` for any locked slug — locked studies are metadata-only in the system prompt. Before this, chat would recite locked drafts to anyone, bypassing the gate. **Don't regress this.** Spec: `docs/superpowers/specs/2026-05-06-chat-bar-privacy-guardrails-design.md`.

## Prod content tracing
`outputFileTracingIncludes` must be `../case-studies/**/*.md` — it previously resolved against `site/` so zero case-study `.md` files were traced into `/api/chat`, and prod chat ran metadata-only since launch. Verify in `route.js.nft.json` after any next.config change.

## Panel surface (2026-07-18)
Chat is a **right side panel**, not a full-screen page.
- Desktop lg+: panel in the `.chat-panel-slot` (360px, bottom-right), slides in on the same 0.46s curve as the `[data-chat-open]` body push — content stays visible/interactive and narrows via grid band inheritance; floating dock shifts left (`.floating-dock` rule).
- Mobile <lg: iOS bottom sheet — 32px top peek, rounded corners, grabber (drag-down dismiss via `useDragControls`, threshold 140px / 600 velocity, snap-back below), scrim tap closes, keyboard via `--chat-vh`.
- `MainBlurLayer` is DELETED. `ChatPanel` is non-headless everywhere (its own `.chat-surface` + X).
- **`ChatFab` is the trigger** (round FAB matching the music dock, in a shared fixed container in `app/layout.tsx`). An older note about the pill rendering only in the in-flow toolbar predates this and no longer applies.

## Route resilience
Fails open on Upstash errors; 503s on missing API key; aborts the Anthropic stream on client disconnect. Chat study links/unfurls route to `/work/<slug>`.

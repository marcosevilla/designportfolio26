# Chat Bar — Design Spec

**Status:** Approved
**Date:** 2026-05-01
**Branch / worktree:** `feature/chat-bar` at `.worktrees/chat-bar/`

## Overview

A focused-mode "ask me anything" chat experience embedded in the home page. Visitors (primarily recruiters) can ask questions about Marco's work, process, and background. The AI speaks in first person as Marco, draws from his bio + resume + case study drafts, and surfaces existing site artifacts (case study pages, About me, contact channels) as inline links and occasional card unfurls — pushing depth back to the canonical pages instead of re-narrating them.

The trigger lives in `HeroToolbar` as a primary-CTA. Click → the toolbar pill morphs (via `framer-motion` shared layout) into a Spotlight-flavored panel that lands at ~70vh, with a fixed-inset backdrop overlay blurring the page beneath. Close via an X on the panel; transcript is preserved in `sessionStorage` for the duration of the session and clears on reload.

## Goals

- Recruiter-facing: lower activation energy for "tell me about your work" questions; surface case studies organically.
- On-brand: match the existing toolbar / hero design language, not a third-party widget.
- Cheap and bounded: per-IP rate limiting + monthly Anthropic spend cap; worst-case ceiling is bounded.
- Single repo, single deploy: no separate function project, no separate domain.

## Non-goals (v1)

- Persistent conversations across devices/sessions (no auth).
- Embeddings / RAG (markdown fits comfortably in the system prompt).
- Tool-use APIs from Anthropic (inline markers handle artifact references in v1).
- Multi-language support.
- Voice input.
- Admin / eval / analytics surfaces for question logs.
- Treating mobile differently from desktop (same morph, narrower column).

## User flow

1. Visitor lands on home page. The HeroToolbar shows the standard icons plus a new rightmost primary-CTA — a sparkle (`✸`) plus an "Ask" label, visually weighted as the primary action.
2. Visitor clicks. The toolbar pill animates downward and morphs into a panel surface that lands at ~70vh in the viewport, ~640px wide on desktop / column-width on mobile.
3. Simultaneously a fixed-inset overlay fades in (`var(--color-bg)` at ~60% alpha + `backdrop-filter: blur(8px)`); the page content underneath is no longer the focus.
4. The panel's empty state shows: a short welcome line, four suggested-prompt chips, and an input row at the bottom. Header strip up top with title and X.
5. Visitor either types a question or clicks a chip (chip click fills + submits in one gesture).
6. Submission posts to `/api/chat` with the full transcript. Server streams Claude Sonnet 4.6 output back as SSE.
7. As tokens arrive, the assistant message renders inline. Inline `[label](study:fb-ordering)` markers parse into dotted-links to `/work/<slug>`; `[label](contact:email)` etc. render as the appropriate channel link; trailing `<artifact slug="..." />` markers extract into a single case-study card unfurl rendered below the message.
8. Each assistant message gets a small "Copy" icon button below it. Click copies the plain-text version (markdown wrappers flattened to label text, artifact marker stripped). Icon flips to a check for ~1.2s.
9. Chips disappear once the first message has been sent; the empty welcome line is replaced by the running transcript.
10. X closes the chat: panel morphs back into the toolbar pill, overlay fades out. Transcript is held in `sessionStorage` so re-opening within the session restores it. Reload clears it.

### Escalation lanes

The system prompt teaches the model three escalation behaviors:

- **Off-topic / inappropriate:** decline politely, redirect to portfolio topics, no contact link surfaced.
- **Better answered by Marco directly** (availability, comp, scheduling, hiring-process specifics, references): one-line acknowledgment + inline `[email me](contact:email)` and/or `[DM on LinkedIn](contact:linkedin)`.
- **Career-history-deep:** one-sentence summary + `[About me](about)` and/or `[LinkedIn](contact:linkedin)` for the full timeline.

## Architecture

### Surface and isolation

The chat lives entirely under `site/components/chat/` (UI) and `site/lib/chat/` (data + prompt assembly + rate limit). The only edits to existing files are:

- `next.config.mjs` — drop `output: 'export'`.
- `HeroToolbar.tsx` — add the rightmost CTA slot and mount `<ChatBar />`.
- `HeroActions.tsx` and/or `Icons.tsx` — new icon if used.
- `globals.css` — add `.chat-surface` utility for the Spotlight-flavored treatment.
- `package.json` — three deps.
- `CLAUDE.md` — chat-bar section.

Everything else is additive.

### Trigger placement

The CTA renders inside `HeroToolbar` at the rightmost position, after `HeroActions`. It mirrors into the sticky-portal variant of the toolbar so it remains reachable after scroll. Only one `<ChatBar />` instance mounts at a time — the in-flow toolbar owns it on first paint, and we accept "only one can be open at a time" as a constraint (simpler than coordinating two morph subjects via context). If both toolbars need a CTA visually, the sticky variant renders a non-interactive ghost button that opens the in-flow chat by scrolling to top + clicking through context. v1 ships with a single CTA in the in-flow toolbar; the sticky-toolbar mirror is a later polish.

### Morph

The closed-state pill and open-state panel share `layoutId="chat-surface"`. Framer-motion interpolates size and position between them. Spring config `{ type: "spring", stiffness: 320, damping: 32 }` (matches existing `STICKY_SPRING` in `lib/springs.ts` so the motion vocabulary stays coherent).

Internal panel content (header, transcript, chips, input) cascades in with a 60ms stagger after the morph settles, using framer-motion's standard `initial / animate` with `delay`.

### Visual treatment (Spotlight-flavored)

Both states share a single `.chat-surface` class with these rules:

```
background-color: color-mix(in srgb, var(--color-surface) 30%, transparent);
backdrop-filter: blur(40px) saturate(180%);
-webkit-backdrop-filter: blur(40px) saturate(180%);
border: 1px solid color-mix(in srgb, var(--color-border) 60%, transparent);
border-radius: 18px;
box-shadow:
  0 24px 60px rgba(0, 0, 0, 0.18),
  0 2px 8px rgba(0, 0, 0, 0.08);
```

The dark-mode variant adjusts shadow alpha and uses `--color-surface-raised` as the base.

### Open-state internals (top to bottom)

1. **Header strip** (~36px tall): leading `✸` glyph in accent, title text "Ask me anything" in mono (echoes the toolbar's mono labels), X button at right. The X uses the same hover treatment as `ActionIcon` in `HeroActions`.
2. **Transcript area**:
   - Empty state: short welcome line ("Hi — I'm Marco. Ask me about my work, my process, or anything else.") + four `ChipPrompt`s in a wrapping flex row.
   - Active state: chips disappear; messages stack. User messages right-aligned, accent-tinted bubble, `var(--color-fg)` text. Assistant messages left-aligned, plain text — no bubble — to read as Marco talking rather than a chat-app dialog. Inline dotted-links and occasional case-study card unfurl below the message. Copy button below each assistant message.
   - Auto-scrolls to the bottom on new content unless the user has scrolled up.
   - Capped height: ~60vh on desktop, scrolls internally beyond.
3. **Input row** (Spotlight-feel): leading send/arrow icon, large input (~18px / 22px line-height), no border on the input itself (panel chrome is enough). Enter to send; Shift+Enter for newline. Submit button is hidden by default and only shows when the input has content (Spotlight does not show one — but a small button helps mobile users).

### Empty-state chips

The four default chip prompts:

1. "Walk me through your most impactful project"
2. "What's your design process?"
3. "How do you collaborate with engineering?"
4. "What got you into design?"

Clicking a chip fills the input AND submits in the same gesture (no two-step "click then send" friction).

### Inline link & artifact parsing

Streamed assistant text is parsed by a pure function `parseChatMarkup(text: string): ReactNode[]` that runs as text arrives. It handles:

- `[label](study:<slug>)` → `<a href="/work/<slug>" class="dotted-link dotted-link--inline">label</a>` if `<slug>` is in the allowlist; otherwise renders `label` as plain text.
- `[label](contact:email)` → `<a href="mailto:marcogsevilla@gmail.com" class="dotted-link dotted-link--inline">label</a>`.
- `[label](contact:linkedin)` → `<a href="https://www.linkedin.com/in/marcogsevilla/" target="_blank" rel="noopener noreferrer" class="dotted-link dotted-link--inline">label</a>`.
- `[label](about)` and `[label](resume)` → in-app navigation that lands on the home route with `aboutMeOpen=true` (the About me page hosts the inline resume).
- A trailing `<artifact slug="<slug>" />` marker on its own line is extracted and removed from the text. If `<slug>` is in the allowlist, a single `CaseStudyCardUnfurl` renders below the message; otherwise the marker is silently dropped. At most one unfurl per message.

Allowlist (single source of truth in `lib/chat/study-metadata.ts`):
`fb-ordering | compendium | upsells | checkin | general-task | design-system | ai-workflow`
Plus the special slugs `about`, `resume`, `contact:email`, `contact:linkedin`.

### Backend

`app/api/chat/route.ts` runs as a Node serverless function (`export const runtime = "nodejs"`). Node was chosen over Edge so the system-prompt assembly can use `fs.readFileSync` to load case-study markdown at module-import time without bundling tricks. Cold starts are infrequent for portfolio traffic and Node-runtime functions on Vercel still support streaming responses.

#### Request

```ts
POST /api/chat
Content-Type: application/json

{
  messages: Array<{ role: "user" | "assistant"; content: string }>
}
```

The client sends the full transcript on every turn (system prompt is server-side; never trusted from client).

#### Server logic

1. Validate body shape; reject malformed (`400`).
2. Read IP from `x-forwarded-for` header (Vercel sets this); take the first comma-separated value. Fall back to a constant key if missing so the limit can't be bypassed.
3. Hit Upstash rate-limiter (per-IP). Two windows: `8 / minute` and `60 / day`. If either exceeds, return `429 { reason: "rate_limit", retryAfterSec: <number> }`.
4. Trim transcript to the most recent 30 turns (oldest user/assistant pairs dropped). Hard-reject any single message > 2000 chars (`400`).
5. Get the system prompt via `getSystemPrompt()` (built once at module load, cached).
6. Call `anthropic.messages.stream({ model: "claude-sonnet-4-6", max_tokens: 1024, system, messages })`.
7. Pipe Anthropic's stream into the SSE response. No buffering; tokens flow as Anthropic emits them.
8. Log `{ ip-prefix, message-count, input-tokens, output-tokens, latency, status }` via `console.log` on completion. No message contents.

#### Response

`text/event-stream` (SSE). Each chunk is an Anthropic streaming delta. Connection closes on `message_stop` or on error event `{ error: "upstream" }`.

#### System prompt assembly

Built once at module load (cached for the life of the function instance) by `lib/chat/system-prompt.ts`. Order:

1. **Identity & voice**: short instruction. First-person as Marco, concise, warm, specific. No corporate jargon.
2. **Bio**: `PARAGRAPHS` from `lib/bio-content.ts` joined with separators.
3. **Resume**: structured render of `RESUME_EXPERIENCE`, `RESUME_EDUCATION`, `RESUME_ACHIEVEMENTS` from `lib/resume-content.ts`.
4. **Case studies**: per-slug, the metadata block (`title, company, role, year, metric`) + the full markdown draft from `case-studies/<slug>.md`. Read once at module load via `fs.readFileSync` from the route file's directory (Node runtime).
5. **Output format rules**: explicit list teaching the model the inline-link syntax, the artifact marker, the slug allowlist, and the escalation lanes.
6. **Refusal & escalation rules**: never invent contact info, prefer escalation over guessing, decline off-topic, redirect career-history-deep.

The system prompt is ~3-4k tokens. Anthropic prompt caching applies automatically to the static `system` block, so each request after the first pays roughly 10% of the system-prompt cost.

**Module-load caching:** the system prompt is assembled exactly once per function instance (top-level module evaluation) and re-used across all requests handled by that instance. Anthropic prompt caching takes care of efficiency across instances.

### Rate limiting

`lib/chat/rate-limit.ts` exports a singleton `Ratelimit` from `@upstash/ratelimit`:

```ts
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();
export const minuteLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(8, "1 m"),
  prefix: "chat:m",
});
export const dailyLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(60, "1 d"),
  prefix: "chat:d",
});

export function getIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  return xff?.split(",")[0]?.trim() || "unknown";
}
```

Both limits run in parallel via `Promise.all`; either tripping is a 429.

### Spend safety net (defense in depth)

1. **Anthropic console hard cap: $25/mo.** Final backstop; cannot be exceeded regardless of any other failure.
2. **Upstash per-IP rate limits.** Bounds individual abusers.
3. **`max_tokens: 1024` per request.** Caps assistant output length.
4. **Transcript trim at 30 turns.** Caps input token count per request.
5. **Hard reject on single message > 2000 chars.** Closes the obvious abuse vector of stuffing a giant payload.

Combined worst-case: bounded by the $25 cap. No accidental thousand-dollar bill is reachable.

## Error handling

| Scenario | Server returns | Client renders |
| --- | --- | --- |
| Rate limit hit | `429 { reason: "rate_limit", retryAfterSec }` | Inline assistant-style line: *"Slow down a sec — give me ~30 seconds and ask again."* No auto-retry. |
| Anthropic 5xx / network mid-stream | Stream terminates; final SSE event `{ error: "upstream" }` | Partial assistant message stays. Muted line below: *"Lost connection — try asking again."* + small Retry pill that resends the last user message. |
| Anthropic auth/401 (key missing/invalid) | `500 { reason: "config" }` | Generic *"Chat is unavailable right now."* — silently logs to Vercel. |
| Spend cap reached | Upstream 401/429 | Same treatment as 5xx. |
| Hallucinated slug in markup | (handled client-side) | Markdown wrapper stripped, label rendered plain. |
| User submits empty/whitespace | Client guard | Send disabled; Enter is a no-op. |
| Message > 1000 chars | Client truncates with tooltip | Server hard-rejects > 2000 as belt-and-suspenders. |
| Total transcript > 30 turns | Client trims oldest pairs before sending | Transparent. |

### Privacy disclosure

A small one-line disclosure under the input on first open: *"Powered by Claude. Conversations aren't stored."* (Both true — sessionStorage clears on reload; server doesn't persist message contents.)

## Files

### Create

| File | Purpose |
|---|---|
| `site/components/chat/ChatBar.tsx` | Morphing CTA-pill ↔ panel surface. Owns `open`, `messages`, streaming state, input value. Reads/writes `sessionStorage` under key `chat-transcript`. |
| `site/components/chat/ChatPanel.tsx` | Open-state internals: header + transcript + input. Renders `ChatMessage` and `ChipPrompt`. |
| `site/components/chat/ChatMessage.tsx` | Renders one user/assistant message; calls `parseChatMarkup`; mounts the `CaseStudyCardUnfurl` if an artifact marker was present; renders `<ChatMessageActions />` below assistant messages. |
| `site/components/chat/ChatMessageActions.tsx` | Copy-button row under assistant messages. Strips markdown wrappers and the artifact marker to plain text, writes to clipboard, swaps icon to a check for ~1.2s. |
| `site/components/chat/CaseStudyCardUnfurl.tsx` | Card block: gradient bg from study metadata, title, company · role, metric. Click → navigate to `/work/<slug>`. |
| `site/components/chat/ChipPrompt.tsx` | Empty-state suggested-prompt chip. Click fills + submits. |
| `site/components/chat/parseChatMarkup.tsx` | Pure function: streamed assistant text → ReactNode[]. Handles inline link markers and trailing artifact extraction with allowlists. |
| `site/components/chat/ChatOverlay.tsx` | Fixed-inset backdrop overlay with blur + bg fade. Click-anywhere-to-close. |
| `site/lib/chat/system-prompt.ts` | Builds and caches the system prompt at module load. Exports `getSystemPrompt(): string`. |
| `site/lib/chat/study-metadata.ts` | Per-study metadata used by both server (system prompt) and client (card unfurl + allowlist). Single source of truth. |
| `site/lib/chat/case-study-content.ts` | Reads `case-studies/<slug>.md` once via `fs.readFileSync` and exports a `Record<slug, string>`. Module-load only; called from `system-prompt.ts`. |
| `site/lib/chat/rate-limit.ts` | Upstash ratelimit singletons + `getIp(req)` helper. |
| `site/lib/chat/anthropic-client.ts` | Singleton `Anthropic` client constructed from env. |
| `site/lib/chat/parse-stream.ts` | Client-side SSE parser; emits text deltas to the rendering layer. |
| `site/app/api/chat/route.ts` | Edge-runtime POST handler. |
| `site/.env.local.example` | Documents `ANTHROPIC_API_KEY`, `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`. |

### Modify

| File | Change |
|---|---|
| `site/next.config.mjs` | Remove `output: 'export'`. Keep `images.unoptimized: true`. Drop `outputFileTracingRoot` if unused. |
| `site/components/HeroToolbar.tsx` | Add rightmost primary-CTA slot rendering `<ChatBar />`. In-flow toolbar only for v1 (sticky-toolbar mirror is later polish). |
| `site/components/HeroActions.tsx` | Untouched unless we want the CTA to live inside HeroActions instead of adjacent. Default: adjacent (preserves HeroActions's "secondary icons" identity). |
| `site/components/Icons.tsx` | Add `SparkIcon` if we use a custom glyph; otherwise inline `✸` (matches existing toolbar/wordmark). |
| `site/app/globals.css` | Add `.chat-surface`, `.chat-message-user`, `.chat-message-assistant`, `.chat-chip` utility classes — theme-aware via existing CSS vars. |
| `site/package.json` | Add deps: `@anthropic-ai/sdk`, `@upstash/ratelimit`, `@upstash/redis`. |
| `site/CLAUDE.md` | Append a "Chat bar" section: data flow, where slugs live, how to extend (new study = update `study-metadata.ts` + add markdown). |
| `docs/PORTFOLIO-PRIORITIES.md` | Add a Chat-bar entry. |

## Testing & verification

This project has no automated test harness, so verification is manual. The PostToolUse hook already runs `tsc --noEmit` on TS edits, which catches the most common regressions.

### Pre-merge checklist

1. `tsc --noEmit` clean.
2. `npm run dev` boots without errors.
3. **First-time visit, click Ask:** toolbar morphs into panel; chips visible; welcome line visible.
4. **Click a chip:** message submits; assistant streams a reply; chips disappear; input is empty and focused.
5. **Ask a question that maps to a case study:** verify dotted-link inline navigation works; verify exactly one card unfurl renders below the reply.
6. **Ask about availability/comp:** verify escalation includes `[email me]` link to `mailto:marcogsevilla@gmail.com`.
7. **Ask for full career history:** verify response includes `[About me]` link that opens the About-me page in-app.
8. **Ask something off-topic** ("what do you think of Trump"): verify polite decline + redirect to portfolio topics; no contact link.
9. **Hallucinated slug test:** mock the API to return `[Foo](study:foo-bar)`; verify renders as plain "Foo" text, no broken link.
10. **Rate limit:** send 9 messages in 60 seconds via dev tools; verify the 9th gets the polite slow-down line.
11. **Network kill mid-stream:** disable network during a streaming response; verify the partial message persists with a Retry pill.
12. **Reload mid-conversation:** transcript clears (sessionStorage gone after the page lifecycle ends).
13. **Close + re-open within session:** transcript restored.
14. **Copy button:** click below an assistant message; clipboard contains plain-text version with no markdown wrappers and no artifact marker; icon flips to check for ~1.2s.
15. **Mobile (390px):** morph still works; panel sits at lower-third; input is reachable above the keyboard.
16. **Reduced motion:** morph degrades gracefully (no spring; instant size change).
17. **Production build (`npm run build`):** static parts still pre-render; `/api/chat` packages as a function.

### Smoke test post-deploy

- Hit production `/api/chat` from a browser tab on the live URL with a known question. Verify SSE stream and total round-trip < 3s for the first token.
- Confirm `ANTHROPIC_API_KEY`, `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` are set in Vercel project settings (production environment).
- Confirm Anthropic console shows the $25/mo cap is active.

## Open questions

None at design-approval time. Implementation may surface details (e.g., exact mobile keyboard behavior, exact spring values for the cascade) that the spec leaves to the implementer's judgment.

## Build sequence (for the implementation plan)

A rough order, refined in `writing-plans`:

1. Drop `output: 'export'`; verify `npm run build` produces a hybrid output and `npm run dev` still works.
2. Create `lib/chat/study-metadata.ts` and `case-study-content.ts`; verify imports cleanly.
3. Create `lib/chat/system-prompt.ts`; smoke-test it returns a non-empty string with all expected sections.
4. Create `lib/chat/rate-limit.ts` + `anthropic-client.ts`.
5. Create `app/api/chat/route.ts`; verify locally with `curl -N http://localhost:3000/api/chat -X POST ...` that it streams.
6. Create `parseChatMarkup.tsx`; unit-test mentally with a few representative strings.
7. Create the panel components: `ChatPanel`, `ChatMessage`, `CaseStudyCardUnfurl`, `ChipPrompt`, `ChatOverlay`.
8. Create `ChatBar.tsx` with the morph; wire into `HeroToolbar`.
9. Polish: copy button, sessionStorage, escalation prompt tuning.
10. Manual QA against the checklist above.
11. Commit, push, deploy. Verify env vars and spend cap on Vercel + Anthropic.

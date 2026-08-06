# Chat defect fixes — 2026-08-05

Fixes for F-01, F-03, F-06, F-08, F-20, F-21, F-22, F-26 from
`docs/audits/2026-08-05-technical-audit.md`.

**Scope:** `site/components/chat/**`, `site/lib/ChatOverlayContext.tsx`,
`site/app/api/chat/route.ts`, `site/lib/chat/**`.

**F-07 was NOT fixed — it lives in `site/components/music/InsetScrubber.tsx`, outside
this scope.** See the note at the bottom.

| Finding | Status |
|---|---|
| F-01 · Empty assistant turn bricks chat | FIXED (proved end-to-end) |
| F-03 · Esc closes without aborting the stream | FIXED (proved in browser) |
| F-26 · `parseSseStream` never cancels the reader | FIXED |
| F-06 · Focus never restored on close | PARTIAL — blocked by out-of-scope `ChatFab` |
| F-08 · Partial `<artifact>` renders as literal text | FIXED |
| F-07 · `InsetScrubber` keyboard-inoperable | SKIPPED — out of scope |
| F-20 · Rate-limited requests burn daily quota | FIXED |
| F-21 · Unbounded array validated before rate-limit | FIXED |
| F-22 · Last message not required to be a user turn | FIXED |

Verification totals: `npx tsc --noEmit` clean, `npm run build` succeeds,
existing `scripts/test-chat-parser.ts` 31/31 pass, new F-01 harness 17/17 pass
(and fails 3/3 on the pre-fix code — see below).

---

## F-01 · One scrim tap permanently bricks the chat panel (P0)

Four changes across two files.

### 1. `components/chat/ChatBar.tsx:255` — abort path trims before the early return

The catch returned on `AbortError` *before* reaching the trim, so closing the panel
mid-stream left a `content: ""` assistant turn forever.

```ts
// BEFORE
} catch (err) {
  if ((err as Error).name === "AbortError") return;   // returns first
  setErrorLine("Lost connection — try asking again.");
  setTurns((prev) =>                                   // never reached on abort
    prev.length > 0 && prev[prev.length - 1].content === "" ? prev.slice(0, -1) : prev
  );

// AFTER
} catch (err) {
  // Trim BEFORE the AbortError early-return. Closing the panel mid-
  // stream (X, scrim tap, drag-dismiss, Esc) rejects the reader, and
  // returning first left the empty placeholder behind permanently.
  setTurns((prev) =>
    prev.length > 0 &&
    prev[prev.length - 1].role === "assistant" &&
    prev[prev.length - 1].content === ""
      ? prev.slice(0, -1)
      : prev
  );
  if ((err as Error).name === "AbortError") return;
  setErrorLine("Lost connection — try asking again.");
```

A `role === "assistant"` check was added to the predicate so an empty *user* turn can
never be eaten by mistake.

### 2. `components/chat/ChatBar.tsx:284` — empty-assistant check is terminal-agnostic

`terminal === "done"` with no text (refusal / immediate `message_stop`) matched neither
branch and kept the placeholder.

```ts
// BEFORE
} else if (terminal === "error" || (terminal === null && assistant.length === 0)) {
  setErrorLine("Lost connection — try asking again.");
  if (assistant.length === 0) {
    setTurns((prev) => prev.slice(0, -1));
  }
}

// AFTER
} else {
  // Terminal-agnostic: if nothing streamed, the placeholder must go
  // whatever the terminal event was. [...]
  if (assistant.length === 0) {
    setTurns((prev) => prev.slice(0, -1));
  }
  if (terminal === "error" || assistant.length === 0) {
    setErrorLine("Lost connection — try asking again.");
  }
}
```

Behaviour delta is confined to `done` + empty: it now trims and shows the existing
"Lost connection" line instead of rendering a blank bubble with an orphan Copy row.
No copy was changed. The `rate_limit` branch is untouched.

### 3. `components/chat/ChatBar.tsx:55` — `readStored` rejects empty assistant turns

Recovers users who already have a poisoned transcript in sessionStorage.

```ts
typeof t.content === "string" &&
// Drop empty assistant turns. [...] the Anthropic API 400s on empty
// content in a non-final message, so chat showed "Lost connection"
// forever. [...] this also cleans up any already stored from before
// that fix.
(t.role === "user" || t.content.length > 0)
```

### 4. `app/api/chat/route.ts:44` — `isValidMessages` rejects empty content

```ts
// Anthropic 400s on an empty-content message that isn't the final turn. [...]
if (content.length === 0) return false;
```

### How F-01 was verified — proved, not reasoned

Two independent proofs. **Both executed the real shipped code; neither is a hand-copy
of the logic.**

**(a) Source-extraction harness.** A script slices the actual text of `readStored`, the
`catch` block, the terminal branch, and `isValidMessages` out of the two source files at
run time, compiles it with esbuild, and executes it against stubs. 17/17 pass:

```
PASS  readStored drops a pre-existing empty assistant turn
PASS  readStored keeps legitimate turns intact
PASS  readStored still preserves an empty user turn
PASS  abort no longer leaves a content:'' assistant turn
PASS  abort stays silent (no error line for a user-initiated close)
PASS  abort keeps a partially streamed assistant turn
PASS  network failure trims the placeholder and still shows the error line
PASS  clean `done` with no text drops the empty placeholder
PASS  successful reply is untouched
PASS  error terminal with no text trims
PASS  error terminal after partial text keeps the text
PASS  stream ended with no terminal event and no text trims
PASS  rate_limit trims and shows the polite line
PASS  route rejects a transcript carrying an empty assistant turn
PASS  route accepts a clean transcript
PASS  route rejects an oversized array before the per-item loop
PASS  abort -> reload -> resubmit produces a payload the route accepts
```

**Control run** — the same harness pointed at `git show HEAD:` versions of both files
fails exactly the three F-01 assertions, so these are real regression tests, not
tautologies:

```
FAIL  readStored drops a pre-existing empty assistant turn
      — got [...,"assistant:"]
FAIL  abort no longer leaves a content:'' assistant turn
      — turns=[{"role":"user",...},{"role":"assistant","content":""}]
FAIL  clean `done` with no text drops the empty placeholder
      — turns=[{"role":"user","content":"q"},{"role":"assistant","content":""}]
```

**(b) End-to-end in the running app** (Playwright against `npm run dev`). `window.fetch`
was stubbed with an abort-aware hanging SSE stream, a message submitted, then Escape
pressed. Real component, real state, real sessionStorage:

```
storedMidStream:        [ ...user, {"role":"assistant","content":""} ]   <- placeholder present
F03_abortedByEscape:    true
F01_storedAfterEscape:  [ ...user ]                                      <- placeholder GONE
F01_noErrorLineOnUserAbort: true
panelClosed:            true
```

An earlier run additionally caught a Fast-Refresh full reload mid-test, and the
transcript came back from sessionStorage already cleaned — incidental live proof of
the `readStored` guard surviving a reload.

---

## F-03 · Escape closes chat without aborting the stream

`components/chat/ChatBar.tsx:178` — new effect. `ChatOverlayContext` was left alone, as
the finding directs.

```ts
// Every close path must abort the in-flight stream, not just the ones that
// call close() directly. Escape closes via ChatOverlayContext's own
// keydown handler, which only flips chatOpen [...]
const prevOpenRef = useRef(open);
useEffect(() => {
  if (prevOpenRef.current && !open) close();
  prevOpenRef.current = open;
}, [open, close]);
```

No double-abort and no loop: the ref limits this to the true→false edge (so it cannot
fire on mount); when the X button already ran `close()`, `abortRef.current` is null by
the time this runs so `?.abort()` is a no-op; and `setChatOpen(false)` while already
false is a React bail-out.

**Verified** in the browser: `F03_abortedByEscape: true` (above) — the captured
`AbortSignal` is aborted after Escape. Also confirmed the panel closes, the
`data-chat-open` attribute is removed, the page stays responsive, and the console
carries **no "Maximum update depth exceeded"**.

---

## F-26 · `parseSseStream` never cancels the body reader

`components/chat/parseStream.ts:46` — wrapped the read loop in `try { … } finally`.

```ts
} finally {
  // The consumer `break`s out of its for-await on the first terminal
  // event, which calls this generator's .return(). Without this the body
  // reader is never cancelled and the response is left locked and
  // undrained — a leaked socket [...]
  await reader.cancel().catch(() => {});
}
```

The three early `return`s (429 / `!ok` / no body) sit above `getReader()` and are
outside the `try`, so they are unaffected. Verified indirectly by the browser run: the
stream is consumed, aborted, and closed with no unhandled rejection in the console.

---

## F-06 · Focus never restored when the chat panel closes — PARTIAL

`components/chat/ChatBar.tsx:193` — two effects: a `focusin` tracker attached only while
closed, and a restore on close guarded by `isConnected`.

```ts
// The pre-open focus is tracked with a focusin listener that is only
// attached while CLOSED, rather than read from document.activeElement when
// `open` flips true. React runs child effects before parent effects, so by
// the time an effect here saw the transition, ChatPanel had already moved
// focus into its textarea — we'd stash the textarea and restore nothing.
```

That ordering trap is real and was caught during implementation: a naive
`document.activeElement` read on the open transition captures ChatPanel's textarea,
because child effects commit first. Browser check confirmed the panel focuses
`TEXTAREA` on open.

**Why PARTIAL.** `ChatFab` renders `{!chatOpen && …}` (`components/ChatFab.tsx:35`), so
the trigger **unmounts while the panel is open and remounts as a different DOM node**.
The stashed node is therefore detached on close and the `isConnected` guard correctly
declines to focus it. Measured:

```
fabStillMounted (while open):  false
after Escape → fabBackAndFocused: { remounted: true, focused: false }
activeTag: "BODY"
```

The stash/restore machinery is correct and will work for any trigger that stays
mounted. Completing this needs `components/ChatFab.tsx` to keep the button mounted
(animating opacity/visibility instead of unmounting), or to expose a ref for refocus —
**that file is outside this task's scope and was not edited.**

---

## F-08 · Partially-streamed `<artifact>` markup renders as literal text

`components/chat/parseChatMarkup.tsx:76` — new exported helper:

```ts
// A trailing artifact marker that hasn't finished streaming yet — the tag has
// opened but its closing `/>` hasn't arrived. `[^>]*` can't match a completed
// marker, so this only ever strips a partial one.
const PARTIAL_ARTIFACT_REGEX = /\n\s*<artifact[^>]*$/;

export function stripPartialArtifact(raw: string): string {
  return raw.replace(PARTIAL_ARTIFACT_REGEX, "");
}
```

`components/chat/ChatMessage.tsx:120` — applied only while streaming:

```ts
const body = streaming ? stripPartialArtifact(turn.content) : turn.content;
…
<RenderSegments raw={body} onClose={onClose} />
```

`extractArtifact(turn.content)` still runs on the untouched raw text, so the completed
marker and the unfurl card are unaffected.

**Verified:**

```
PASS  "Here you go.\n<artifact slug=\"joi"      -> "Here you go."
PASS  "Here you go.\n<artifact sl"              -> "Here you go."
PASS  "Here you go.\n<artifact slug=\"joi-app\" /" -> "Here you go."
PASS  "Here you go."                            -> "Here you go."
PASS  "Use <artifact> inline mid sentence"      -> unchanged
complete marker unchanged by strip: true
```

Existing parser suite still 31/31.

---

## F-20 · Rate-limited requests still burn the daily quota

`lib/chat/rate-limit.ts:57` — `Promise.all` → sequential.

```ts
// BEFORE
const [m, d] = await Promise.all([
  getMinuteLimit().limit(ip),
  getDailyLimit().limit(ip),
]);

// AFTER — Sequential, not Promise.all: [...] 12 messages in a minute cost
// 4 × 429 *and* 12 of the day's quota. Only spend a daily token once the
// minute window has passed. Costs one extra round trip on the success path.
const m = await getMinuteLimit().limit(ip);
if (!m.success) { … }
const d = await getDailyLimit().limit(ip);
```

Both windows and both limits are unchanged (8/min, 60/day); only the daily *consumption*
on a minute-window rejection is removed. The stale header comment "Two windows in
parallel" was corrected to "checked in order". Cost: one extra Upstash round trip on the
success path. Not exercised at runtime (needs live Upstash credentials); the change is
a control-flow reordering with the same success-path result.

---

## F-21 · Unbounded array validated before rate-limiting

`app/api/chat/route.ts:27,37` — length cap checked *before* the per-item loop.

```ts
// Hard cap on array length, checked before the per-item loop. Without it a
// single unauthenticated POST could carry 100k messages and force an O(n)
// validation pass (and an Upstash round trip) before any limit applied.
// Anything above MAX_TURNS would be trimmed away anyway.
const MAX_MESSAGES = 100;

function isValidMessages(value: unknown): value is Message[] {
  if (!Array.isArray(value)) return false;
  if (value.length > MAX_MESSAGES) return false;
  for (const m of value) { … }
```

Returns the existing `bad_shape` 400 path. 100 is comfortably above the `MAX_TURNS = 30`
trim, so no legitimate client is affected. **Verified:** a 101-element array is rejected
(harness assertion above).

---

## F-22 · Route never enforces that the last message is a user turn

`app/api/chat/route.ts:109` — added after the existing leading-assistant strip.

```ts
// The transcript is fully client-controlled, so a crafted request could end
// on an assistant turn — an assistant-prefill vector for steering the reply
// past the system prompt, plus fabricated "assistant said X" history. The
// real client always posts [...turns, userTurn], so this never fires on the
// success path.
if (safeMessages[safeMessages.length - 1]?.role !== "user") {
  return Response.json({ reason: "bad_shape" }, { status: 400 });
}
```

Also closes the case where `safeMessages` is empty after the leading-assistant strip,
which previously reached Anthropic with an empty `messages` array. Spend-cap semantics
untouched.

---

## F-07 · `InsetScrubber` — SKIPPED, out of scope

The finding targets `site/components/music/InsetScrubber.tsx:42-49`, which is **not**
inside `site/components/chat/**`, `site/lib/ChatOverlayContext.tsx`,
`site/app/api/chat/route.ts`, or `site/lib/chat/**`. Per the task's scope rule the file
was left untouched.

Still outstanding there: no `onKeyDown` (Arrow ±5s / Shift+Arrow ±30s / Home / End
calling `onChange` + `onCommit`), and `aria-valuenow` is a raw float with no
`aria-valuetext={formatTime(value)}`.

---

## Verification commands

```
cd site && npx tsc --noEmit                      # clean (exit 0)
cd site && npm run build                         # succeeds, 18 routes
cd site && npx tsx scripts/test-chat-parser.ts   # 31 passed, 0 failed
```

### Note on the concurrent agent

A second agent was editing the tree throughout this task. Toward the end their in-flight
`AudioPlayerContext` refactor left one type error in the shared tree:

```
components/music/MusicPlayerPanel.tsx(168,5): error TS2339:
  Property 'currentTime' does not exist on type 'AudioPlayerState'.
```

That file is theirs and untouched here. Filtering tsc to this task's scope gives
**no errors**:

```
npx tsc --noEmit | grep -E "components/chat|lib/chat|api/chat|ChatOverlayContext"
→ NO ERRORS in my scope
```

To get an unambiguous green build for the final code, a throwaway detached worktree was
created at `HEAD` with **only this task's diff** applied (their uncommitted work
excluded). Result:

```
npx tsc --noEmit   → exit 0
npm run build      → exit 0, "✓ Compiled successfully"
```

The worktree was removed afterwards (`git worktree prune` — tree clean).

Browser checks ran against `npm run dev` on localhost:3000 with Playwright. Console
errors seen in that session (`PixelRain.tsx` duplicate `reduceMotion`, `HomeLayout`
`typescale is not defined`) likewise come from the other agent's concurrent edits — no
chat file appears in any of them.

A `npm run dev` server started for these checks was **left running** on port 3000 rather
than killed, since the other agent appeared to be compiling against it.

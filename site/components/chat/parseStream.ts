// Parses an SSE stream from /api/chat. Emits text deltas and a terminal
// event ("done" | "error" | "rate_limit"). Caller decides how to render.
//
// SSE format from the server:
//   event: delta
//   data: {"text":"..."}
//
//   event: done
//   data: {}
//
//   event: error
//   data: {"reason":"upstream"}

export type StreamEvent =
  | { kind: "delta"; text: string }
  | { kind: "done" }
  | { kind: "error"; reason: string }
  | { kind: "rate_limit"; retryAfterSec: number };

export async function* parseSseStream(
  response: Response
): AsyncGenerator<StreamEvent> {
  if (response.status === 429) {
    let body: { retryAfterSec?: number } = {};
    try {
      body = await response.json();
    } catch {
      /* noop */
    }
    yield { kind: "rate_limit", retryAfterSec: body.retryAfterSec ?? 30 };
    return;
  }
  if (!response.ok) {
    yield { kind: "error", reason: `http_${response.status}` };
    return;
  }
  if (!response.body) {
    yield { kind: "error", reason: "no_body" };
    return;
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    // SSE messages are separated by \n\n.
    let sep: number;
    while ((sep = buffer.indexOf("\n\n")) !== -1) {
      const raw = buffer.slice(0, sep);
      buffer = buffer.slice(sep + 2);
      const ev = parseSseChunk(raw);
      if (ev) yield ev;
    }
  }
}

function parseSseChunk(raw: string): StreamEvent | null {
  let event = "message";
  let data = "";
  for (const line of raw.split("\n")) {
    if (line.startsWith("event:")) event = line.slice(6).trim();
    else if (line.startsWith("data:")) data += line.slice(5).trim();
  }
  if (!data) return null;
  try {
    const parsed = JSON.parse(data) as Record<string, unknown>;
    if (event === "delta" && typeof parsed.text === "string") {
      return { kind: "delta", text: parsed.text };
    }
    if (event === "done") return { kind: "done" };
    if (event === "error") {
      return { kind: "error", reason: typeof parsed.reason === "string" ? parsed.reason : "unknown" };
    }
  } catch {
    /* fall through */
  }
  return null;
}

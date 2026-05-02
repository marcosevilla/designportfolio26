// POST /api/chat — streams Claude Sonnet 4.6 replies as SSE.
//
// Request:  { messages: Array<{ role: "user" | "assistant"; content: string }> }
// Response: text/event-stream; each chunk an Anthropic streaming event.
//
// Pipeline: validate → rate-limit → trim transcript → stream from Anthropic
// → re-emit as SSE → final SSE event on error.
//
// Spend safety net is layered:
//   1. Anthropic console hard cap ($25/mo) — final backstop
//   2. Upstash per-IP limits — 8/min, 60/day
//   3. max_tokens: 1024 per request
//   4. Transcript trim: most recent 30 turns
//   5. Hard reject any message > 2000 chars

import { NextRequest } from "next/server";
import { getAnthropic, CHAT_MODEL, MAX_OUTPUT_TOKENS } from "@/lib/chat/anthropic-client";
import { getCachedSystemPrompt } from "@/lib/chat/system-prompt";
import { checkRateLimit, getIp } from "@/lib/chat/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_MESSAGE_CHARS = 2000;
const MAX_TURNS = 30;

type Message = { role: "user" | "assistant"; content: string };

function isValidMessages(value: unknown): value is Message[] {
  if (!Array.isArray(value)) return false;
  for (const m of value) {
    if (typeof m !== "object" || m === null) return false;
    const role = (m as { role?: unknown }).role;
    const content = (m as { content?: unknown }).content;
    if (role !== "user" && role !== "assistant") return false;
    if (typeof content !== "string") return false;
    if (content.length > MAX_MESSAGE_CHARS) return false;
  }
  return true;
}

function trimToRecent<T>(arr: T[], n: number): T[] {
  return arr.length <= n ? arr : arr.slice(arr.length - n);
}

function sseEncode(event: string, data: unknown): string {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}

export async function POST(req: NextRequest) {
  // 1. Validate body
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ reason: "bad_json" }, { status: 400 });
  }
  const messages = (body as { messages?: unknown })?.messages;
  if (!isValidMessages(messages)) {
    return Response.json({ reason: "bad_shape" }, { status: 400 });
  }
  if (messages.length === 0) {
    return Response.json({ reason: "empty" }, { status: 400 });
  }

  // 2. Rate limit
  const ip = getIp(req);
  const rl = await checkRateLimit(ip);
  if (!rl.ok) {
    return Response.json(
      { reason: "rate_limit", retryAfterSec: rl.retryAfterSec },
      { status: 429 }
    );
  }

  // 3. Trim
  const trimmed = trimToRecent(messages, MAX_TURNS);

  // Anthropic requires the first message to be a user turn. The trim above
  // can land on an assistant turn if the conversation is exactly 31+ long
  // and the cut boundary is odd. Drop the leading assistant if present.
  const safeMessages = trimmed[0]?.role === "assistant" ? trimmed.slice(1) : trimmed;

  // 4. Stream from Anthropic
  const anthropic = getAnthropic();
  const startedAt = Date.now();

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      let aStream: Awaited<ReturnType<typeof anthropic.messages.stream>> | null = null;
      try {
        aStream = await anthropic.messages.stream({
          model: CHAT_MODEL,
          max_tokens: MAX_OUTPUT_TOKENS,
          system: getCachedSystemPrompt(),
          messages: safeMessages,
        });

        for await (const event of aStream) {
          if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
            controller.enqueue(encoder.encode(sseEncode("delta", { text: event.delta.text })));
          } else if (event.type === "message_stop") {
            controller.enqueue(encoder.encode(sseEncode("done", {})));
          }
        }

        controller.close();
      } catch (err) {
        console.error("[chat] upstream error", err);
        try {
          controller.enqueue(encoder.encode(sseEncode("error", { reason: "upstream" })));
        } catch {
          /* controller may already be closed; ignore */
        }
        try {
          controller.close();
        } catch {
          /* already closed */
        }
        return;
      }

      // Usage logging happens after the stream is closed so a logging
      // failure (e.g. finalMessage throwing) cannot produce a duplicate
      // terminal SSE event for the client.
      try {
        const final = await aStream.finalMessage();
        const usage = final.usage;
        console.log("[chat]", JSON.stringify({
          ip: ip.slice(0, 8) + "…",
          turns: safeMessages.length,
          inputTokens: usage.input_tokens,
          outputTokens: usage.output_tokens,
          latencyMs: Date.now() - startedAt,
          status: 200,
        }));
      } catch (err) {
        console.error("[chat] usage log failed", err);
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive",
    },
  });
}

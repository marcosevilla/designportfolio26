import "server-only";

// Singleton Anthropic SDK client. Constructed once per function instance.
// Server-only.

import Anthropic from "@anthropic-ai/sdk";

let client: Anthropic | null = null;

export function getAnthropic(): Anthropic {
  if (!client) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error("ANTHROPIC_API_KEY is not set");
    }
    client = new Anthropic({ apiKey });
  }
  return client;
}

export const CHAT_MODEL = "claude-sonnet-4-6";
export const MAX_OUTPUT_TOKENS = 1024;

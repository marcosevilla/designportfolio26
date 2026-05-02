// Per-IP rate limiting via Upstash Redis. Two windows in parallel:
//   - 8 messages per minute (catches spam loops)
//   - 60 messages per day  (catches a determined abuser)
// Either window tripping returns a 429.
//
// IP source: x-forwarded-for header (first comma-separated value). Falls back
// to "unknown" if missing — using a constant key keeps the limit applied even
// if header parsing fails, rather than silently bypassing.

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

let _redis: Redis | null = null;
function getRedis(): Redis {
  if (!_redis) _redis = Redis.fromEnv();
  return _redis;
}

let _minuteLimit: Ratelimit | null = null;
export function getMinuteLimit(): Ratelimit {
  if (!_minuteLimit) {
    _minuteLimit = new Ratelimit({
      redis: getRedis(),
      limiter: Ratelimit.slidingWindow(8, "1 m"),
      prefix: "chat:m",
      analytics: false,
    });
  }
  return _minuteLimit;
}

let _dailyLimit: Ratelimit | null = null;
export function getDailyLimit(): Ratelimit {
  if (!_dailyLimit) {
    _dailyLimit = new Ratelimit({
      redis: getRedis(),
      limiter: Ratelimit.slidingWindow(60, "1 d"),
      prefix: "chat:d",
      analytics: false,
    });
  }
  return _dailyLimit;
}

export function getIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  return xff?.split(",")[0]?.trim() || "unknown";
}

export type RateLimitResult =
  | { ok: true }
  | { ok: false; retryAfterSec: number };

export async function checkRateLimit(ip: string): Promise<RateLimitResult> {
  const [m, d] = await Promise.all([
    getMinuteLimit().limit(ip),
    getDailyLimit().limit(ip),
  ]);
  if (!m.success) {
    const retryAfterSec = Math.max(1, Math.ceil((m.reset - Date.now()) / 1000));
    return { ok: false, retryAfterSec };
  }
  if (!d.success) {
    const retryAfterSec = Math.max(1, Math.ceil((d.reset - Date.now()) / 1000));
    return { ok: false, retryAfterSec };
  }
  return { ok: true };
}

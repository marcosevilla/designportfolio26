import { NextResponse, type NextRequest } from "next/server";
import { createHash, timingSafeEqual } from "node:crypto";
import { SITE_GATE_COOKIE, SITE_GATE_HASH } from "@/lib/site-gate";

// Unlock endpoint for the site-wide gate (see proxy.ts / lib/site-gate.ts).
// Correct password → sets the unlock cookie and returns to where the
// visitor was headed. Wrong password → back to the gate with an error flag.

export const runtime = "nodejs";

function safePath(from: unknown): string {
  if (typeof from !== "string" || !from.startsWith("/") || from.startsWith("//")) {
    return "/";
  }
  return from;
}

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const password = form.get("password");
  const from = safePath(form.get("from"));

  const submitted = createHash("sha256")
    .update(typeof password === "string" ? password : "")
    .digest();
  const expected = Buffer.from(SITE_GATE_HASH, "hex");
  const ok = timingSafeEqual(submitted, expected);

  const target = new URL(from, request.nextUrl.origin);
  if (!ok) {
    target.searchParams.set("gate-error", "1");
    return NextResponse.redirect(target, 303);
  }

  target.searchParams.delete("gate-error");
  const res = NextResponse.redirect(target, 303);
  res.cookies.set(SITE_GATE_COOKIE, SITE_GATE_HASH, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return res;
}

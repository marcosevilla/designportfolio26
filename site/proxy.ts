import { NextResponse, type NextRequest } from "next/server";
import {
  SITE_GATE_ENABLED,
  SITE_GATE_COOKIE,
  SITE_GATE_HASH,
} from "@/lib/site-gate";

// Serve the password wall for every request that doesn't carry the unlock
// cookie. Production only — local dev (and the inline editor) stays open.
// See lib/site-gate.ts for the on/off switch and password hash.

function gateHtml(from: string, showError: boolean): string {
  const fromAttr = from.replace(/"/g, "&quot;");
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="robots" content="noindex" />
<title>Marco Sevilla</title>
<style>
  :root { color-scheme: light dark; }
  * { box-sizing: border-box; margin: 0; }
  body {
    min-height: 100dvh; display: grid; place-items: center;
    font-family: system-ui, -apple-system, sans-serif;
    background: #fff; color: #1a1a1a;
    font-size: 14px; line-height: 1.6; letter-spacing: -0.01em;
  }
  main { width: min(320px, calc(100vw - 48px)); display: grid; gap: 20px; }
  .star { font-size: 28px; font-weight: 500; }
  p { color: rgba(17, 17, 17, 0.82); }
  form { display: grid; gap: 8px; }
  input, button {
    font: inherit; letter-spacing: inherit; width: 100%;
    padding: 10px 12px; border-radius: 0;
  }
  input {
    border: 1px solid #e6e6e6; background: transparent; color: inherit;
  }
  input:focus { outline: 1px solid #1a1a1a; outline-offset: -1px; }
  button {
    border: none; background: #1a1a1a; color: #fff; cursor: pointer;
    font-weight: 500;
  }
  .err { color: #d1244f; }
  @media (prefers-color-scheme: dark) {
    body { background: #0a0a0a; color: #ededed; }
    p { color: rgba(237, 237, 237, 0.5); }
    input { border-color: #2a2a2a; }
    input:focus { outline-color: #ededed; }
    button { background: #ededed; color: #0a0a0a; }
  }
</style>
</head>
<body>
<main>
  <div class="star">*</div>
  <div>
    <p><strong style="color: inherit">This site is briefly under construction.</strong></p>
    <p>Enter the password to continue, or check back soon.</p>
  </div>
  <form method="POST" action="/api/gate">
    <input type="hidden" name="from" value="${fromAttr}" />
    <input type="password" name="password" placeholder="Password" autofocus required autocomplete="current-password" />
    <button type="submit">Enter</button>
    ${showError ? '<p class="err">That’s not it — try again.</p>' : ""}
  </form>
</main>
</body>
</html>`;
}

export default function proxy(request: NextRequest) {
  if (!SITE_GATE_ENABLED || process.env.NODE_ENV === "development") {
    return NextResponse.next();
  }
  if (request.cookies.get(SITE_GATE_COOKIE)?.value === SITE_GATE_HASH) {
    return NextResponse.next();
  }
  const { pathname, search, searchParams } = request.nextUrl;
  return new NextResponse(
    gateHtml(pathname + search, searchParams.has("gate-error")),
    {
      status: 401,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store",
        "X-Robots-Tag": "noindex",
      },
    }
  );
}

export const config = {
  // Everything except Next internals, the unlock endpoint, and the favicon.
  matcher: ["/((?!_next/|api/gate|icon\\.svg).*)"],
};

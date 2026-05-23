// Resume PDF generator.
//
// Renders /resume from a running dev server (or any URL) and prints it to a
// PDF using Chrome headless via the DevTools Protocol. CDP is used instead of
// the plain `--print-to-pdf` flag because that flag does not honor a forced
// `prefers-color-scheme`, so the printed page comes out in dark mode tokens
// against a white background — washed-out and unreadable.
//
// Usage (from site/):
//   1. npm run dev   # dev server on :3000
//   2. node scripts/print-resume.mjs
//
//   Optional args:
//     node scripts/print-resume.mjs <url> <output-path>
//
// Prereqs: Google Chrome installed at the macOS default path.
// Node 22+ for built-in WebSocket.

import { execSync, spawn } from "node:child_process";
import { writeFileSync } from "node:fs";

const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const URL = process.argv[2] || "http://localhost:3000/resume";
const OUT =
  process.argv[3] ||
  `${process.env.HOME}/Desktop/Marco-Sevilla-Senior-Product-Designer.pdf`;
const PORT = 9223;
const PROFILE = "/tmp/chrome-pdf-profile";

execSync(`rm -rf ${PROFILE} 2>/dev/null || true`);

const chrome = spawn(CHROME, [
  "--headless=new",
  "--disable-gpu",
  `--remote-debugging-port=${PORT}`,
  "--no-first-run",
  `--user-data-dir=${PROFILE}`,
  "about:blank",
]);

await new Promise((r) => setTimeout(r, 2500));

const tabs = JSON.parse(
  execSync(`curl -s http://localhost:${PORT}/json`).toString(),
);
const pageTab = tabs.find((t) => t.type === "page") || tabs[0];
const ws = new WebSocket(pageTab.webSocketDebuggerUrl);

let nextId = 1;
const pending = new Map();
const send = (method, params = {}) =>
  new Promise((resolve) => {
    const id = nextId++;
    pending.set(id, resolve);
    ws.send(JSON.stringify({ id, method, params }));
  });

await new Promise((r) => ws.addEventListener("open", r, { once: true }));
ws.addEventListener("message", (ev) => {
  const m = JSON.parse(ev.data);
  if (m.id && pending.has(m.id)) {
    pending.get(m.id)(m);
    pending.delete(m.id);
  }
});

await send("Page.enable");
await send("Emulation.setEmulatedMedia", {
  media: "",
  features: [{ name: "prefers-color-scheme", value: "light" }],
});
await send("Page.navigate", { url: URL });
await new Promise((r) => setTimeout(r, 3500));

const pdf = await send("Page.printToPDF", {
  printBackground: true,
  paperWidth: 8.5,
  paperHeight: 11,
  marginTop: 0.5,
  marginBottom: 0.5,
  marginLeft: 0.5,
  marginRight: 0.5,
});

if (!pdf.result) {
  console.error("printToPDF failed:", JSON.stringify(pdf.error || pdf));
  process.exit(1);
}

writeFileSync(OUT, Buffer.from(pdf.result.data, "base64"));
console.log(`Wrote ${OUT}`);

ws.close();
chrome.kill();

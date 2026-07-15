/**
 * Contact sheet — screenshot a route at every grid band and tile the
 * results into one reviewable HTML page.
 *
 *   npm run sheet -- /work/fb-ordering
 *   npm run sheet -- / --name home
 *   npm run sheet -- /work/compendium --unlock   (see through LockGate)
 *
 * Output: .sheets/<slug>/{w390,w768,w1024,w1440}.png + sheet.html
 * Requires the dev server running on localhost:3000 and Google Chrome
 * installed (playwright-core channel:"chrome" — no browser download).
 */
import { chromium } from "playwright-core";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const WIDTHS = [
  { w: 390, label: "phone · 390" },
  { w: 768, label: "tablet · 768" },
  { w: 1024, label: "desktop · 1024" },
  { w: 1440, label: "desktop · 1440" },
];
const BASE = process.env.SHEET_BASE_URL || "http://localhost:3000";

const args = process.argv.slice(2).filter((a) => a !== "--");
const route = args.find((a) => a.startsWith("/"));
if (!route) {
  console.error("Usage: npm run sheet -- <route> [--name <slug>]");
  process.exit(1);
}
const nameIdx = args.indexOf("--name");
const slug =
  nameIdx !== -1
    ? args[nameIdx + 1]
    : route === "/"
      ? "home"
      : route.replace(/^\/|\/$/g, "").replace(/\//g, "-");

const outDir = join(process.cwd(), ".sheets", slug);
mkdirSync(outDir, { recursive: true });

// Fail fast with a clear message if the dev server isn't up.
try {
  await fetch(BASE, { signal: AbortSignal.timeout(3000) });
} catch {
  console.error(`Dev server not reachable at ${BASE} — run \`npm run dev\` first.`);
  process.exit(1);
}

const browser = await chromium.launch({ channel: "chrome", headless: true });
const shots = [];
for (const { w, label } of WIDTHS) {
  const page = await browser.newPage({ viewport: { width: w, height: 900 } });
  if (args.includes("--unlock")) {
    // Pre-seed the LockGate unlock flag (lib/PasswordGateContext.tsx).
    await page.addInitScript(() => localStorage.setItem("portfolio-unlocked", "1"));
  }
  await page.goto(BASE + route, { waitUntil: "networkidle" });
  // The dev-only Agentation toolbar photobombs screenshots (known quirk).
  await page.addStyleTag({ content: "[data-agentation-root] { display: none !important; }" });
  // Let entrance animations, blur-ins, and lazy media settle.
  await page.waitForTimeout(1200);
  // Force intersection-observer FadeIns visible by scrolling through the
  // page slowly enough for each section's entrance to fire, then give the
  // last animations time to finish before the full-page capture.
  await page.evaluate(async () => {
    const step = Math.round(window.innerHeight * 0.7);
    for (let y = 0; y < document.body.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 150));
    }
    window.scrollTo(0, 0);
    await new Promise((r) => setTimeout(r, 1500));
  });
  const file = `w${w}.png`;
  await page.screenshot({ path: join(outDir, file), fullPage: true });
  shots.push({ file, label, w });
  await page.close();
  console.log(`  ✓ ${label}`);
}
await browser.close();

const html = `<!doctype html>
<meta charset="utf-8">
<title>sheet · ${slug}</title>
<style>
  body { margin: 0; background: #17171a; color: #eee; font: 13px/1.4 ui-monospace, Menlo, monospace; }
  header { padding: 16px 20px; position: sticky; top: 0; background: #17171acc; backdrop-filter: blur(8px); }
  .row { display: flex; align-items: flex-start; gap: 20px; padding: 0 20px 40px; overflow-x: auto; }
  figure { margin: 0; flex-shrink: 0; }
  figcaption { padding: 8px 2px; color: #999; position: sticky; top: 48px; background: #17171a; }
  img { display: block; border: 1px solid #333; border-radius: 4px; }
</style>
<header>${slug} — ${new Date().toISOString().slice(0, 16).replace("T", " ")}</header>
<div class="row">
${shots
  .map(
    (s) =>
      `  <figure><figcaption>${s.label}</figcaption><img src="${s.file}" width="${Math.min(s.w, 560)}" loading="lazy"></figure>`
  )
  .join("\n")}
</div>
`;
writeFileSync(join(outDir, "sheet.html"), html);
console.log(`\nSheet: ${join(outDir, "sheet.html")}`);

# Extraction Playbook — 🎬 Case Study Visuals (parallel agents)

Proven pipeline for extracting 1:1 frames from the prototype hub into Figma. Every agent follows this EXACTLY.

## Targets
- **Figma file:** `O9tNG8DqYrpdJmrEGa7Io7` ("Portfolio Aug 2026"), page **🎬 Case Study Visuals** (`50:2`).
- **Sections:** F&B Ordering `50:3` · Compendium `50:4` · Upsells `50:5` · AI Workflow `87:2` · Digital Tipping `87:3`.
- **Hub dev server:** `http://localhost:3001` (already running, repo at f60b34c — do NOT restart it, do NOT edit the repo).
- **Deep links:** `?page=<name>` (+`&tab=` on menu-management / tipping-admin; `&demo=1` on bb-hotels-tip). Landing inventory: `~/Developer/.playwright-mcp/landing-grid-inventory.json`.
- **MARCO DIRECTIVE:** Unified Cart (`?page=unified-cart`, DSN-1828) is the canonical cart UI for ALL mobile purchasing flows.

## Hard rules
- **Do NOT use the mcp__playwright__* tools** — the MCP browser is single-instance and owned by the main session. Run your OWN headless Chrome via Bash + node (template below).
- Figma tools: load via `ToolSearch "select:mcp__figma-official__generate_figma_design,mcp__figma-official__use_figma,mcp__figma-official__get_screenshot"`. Pace calls (~0.5s; rate limit bites ~30 REST calls — space captures out).
- Write progress ONLY to your own file: `docs/figma-migration/visuals-progress/<your-area>.md` (statuses pending/built/verified, Figma node IDs, deviations). Never edit the master progress file or another agent's file.
- Prototype repo READ-ONLY. No portfolio site code. Extraction only.
- After 2 failed fix attempts on one diff → log as deviation, move on. If a Figma tool fails twice → log + stop and report.

## Per-screen pipeline
1. **Get a captureId:** call `mcp__figma-official__generate_figma_design` with `fileKey` + `nodeId: <your section id>`. Each ID is single-use, one page each.
2. **Capture (Bash + node headless Chrome):** run the template below — it navigates, settles, hides dev chrome, fixes dead images, saves the baseline PNG, injects Figma's capture.js, submits with your captureId.
3. **Poll:** call `generate_figma_design` again with `fileKey` + `captureId` every ~5s until it returns a node URL (`node-id=XX-2` → wrapper node `XX:2`).
4. **Extract & place (use_figma):** wrapper chain is `Body > AppRouter > …`. Take the deepest node spanning ≥90% of wrapper width (NEVER blindly the first child — admin pages have a 180px sidebar as first child). Resize height to content maxBottom, `section.appendChild`, set x/y (lay screens left-to-right, 100px gaps; pick a fresh y-row for each flow so you never overlap existing frames — check `section.children` positions first), rename `"<Study> / <Flow> / NN <Screen>"`, then `wrapper.remove()`.
5. **VERIFY (mandatory, every screen):** `get_screenshot` the placed frame (enableBase64Response: true) AND `Read` the baseline PNG — view both images, compare layout/typography/colors/text/assets. Fix diffs (frames are fixed-layout; absolute-position nudges are fine). Known recurring artifact: centered header titles land right-aligned — fix via `heading.layoutPositioning = "ABSOLUTE"` + center x.
6. Update your progress file after each screen.

## Headless capture template (Bash)
Write this to your scratchpad as `capture.mjs` once, then invoke per screen:
```js
// node capture.mjs '<url>' '<baselinePath>' '<captureId>' '<clickSelector-optional>' '<viewportW>x<viewportH>'
import pw from '/Users/marcosevilla/Developer/portfolio/site/node_modules/playwright-core/index.mjs';
const [url, baseline, captureId, clickSel, vp] = process.argv.slice(2);
const [w, h] = (vp || '1440x900').split('x').map(Number);
const browser = await pw.chromium.launch({ channel: 'chrome', headless: true });
const page = await browser.newPage({ viewport: { width: w, height: h } });
await page.goto(url); await page.waitForTimeout(2500);
if (clickSel && clickSel !== '-') { await page.locator(clickSel).first().click(); await page.waitForTimeout(1800); }
await page.evaluate(() => {
  document.querySelectorAll('nextjs-portal, [id*="agentation" i], [class*="agentation" i], [class*="toolbarContainer"], [class*="styles-module__toolbar"]').forEach(el => el.style.setProperty('display','none','important'));
  document.querySelectorAll('button').forEach(b => { const t=(b.getAttribute('aria-label')||b.getAttribute('title')||b.textContent||'').trim(); if(/Color tokens|Component Inspector|Open Next\.js|issues|Dev Tools/i.test(t)) b.style.setProperty('display','none','important'); });
  document.querySelectorAll('div,button,a').forEach(el => { const r=el.getBoundingClientRect(); if(r.width===0||r.width>320||r.height>100||r.top>200) return; const t=(el.textContent||'').trim().replace(/\s+/g,' '); if((/^(← ?)?Back to Menu$/.test(t)||/^Demo Time/.test(t)||/Close Confirmation/.test(t)||/View in Order Management/.test(t)||/Back to Compendium Builder/.test(t))&&t.length<45) el.style.setProperty('display','none','important'); });
});
await page.evaluate(async () => { // dead-Unsplash substitution (menu screens)
  const subs={Croissant:'photo-1509440159596-0249088772ff',Waffle:'photo-1568051243858-533a607809a5',Quiche:'photo-1476718406336-bb5a9690ee2a'};
  const loads=[]; for(const [alt,id] of Object.entries(subs)) document.querySelectorAll(`img[alt="${alt}"]`).forEach(img=>{ if(img.complete&&img.naturalWidth>0) return; img.src=`https://images.unsplash.com/${id}?w=800&h=600&fit=crop&crop=center&auto=format&q=80`; loads.push(new Promise(res=>{img.onload=res;img.onerror=res;setTimeout(res,5000);})); });
  await Promise.all(loads);
});
await page.waitForTimeout(600);
await page.screenshot({ path: baseline });
const resp = await page.request.get('https://mcp.figma.com/mcp/html-to-design/capture.js');
await page.evaluate(s => { const el=document.createElement('script'); el.textContent=s; document.head.appendChild(el); }, await resp.text());
await page.waitForTimeout(500);
page.evaluate(id => window.figma.captureForDesign({ captureId:id, endpoint:`https://mcp.figma.com/mcp/capture/${id}/submit?bindVariables=true`, selector:'body' }), captureId).catch(()=>{});
await page.waitForTimeout(10000);
await browser.close();
console.log('done');
```
For multi-step state (add to cart → submit etc.), copy the template and script the clicks inline instead of clickSel. Baselines: `~/Developer/.playwright-mcp/baselines/<flow>/NN-name.png`. Viewports: mobile/guest 430x932, admin/desktop 1440x900.

## Known gotchas
- webp uploads render blank in Figma — PNG only (captures handle images automatically; only relevant for manual uploads).
- Frames land at native CSS units (478 wide for 430 viewport — app has ~0.9 zoom); baselines are viewport-scaled. Same content, slight scale diff when comparing — fine.
- Captures produce real layers + partial auto-layout, fixed positioning elsewhere — acceptable; log "fixed layout" once per flow, don't try to retrofit auto-layout everywhere.
- Prototype home-FAB and demo pills are excluded by design (hide list above).
- Multiple states of one page = one captureId EACH (single-use).

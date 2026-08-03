# 🎬 Case Study Visuals — Extraction Progress

Loop memory for the bulk 1:1 extraction of prototype flows → Figma file "Portfolio Aug 2026"
(https://www.figma.com/design/O9tNG8DqYrpdJmrEGa7Io7), page **🎬 Case Study Visuals** (`50:2`).
Re-read this file at the start of every iteration; resume from the first non-verified item.

## 2026-08-02 follow-up — sweep + accuracy QA + backup audit (3 parallel agents)
**Page now holds 72 frames** (64 original + 8 from the sweep). All three passes complete:
- **Missing-visuals sweep** (`visuals-progress/sweep-missing.md`): all 65 router pages + tab/state variants diffed against the extracted set → ~25 uncaptured found, 8 portfolio-relevant extracted & verified 1:1: Compendium Jul 28 Builder w/ Service Requests settings `193:6` + HotSOS flat list `196:9` · Upsells Manage Items V3 DSN-1707 `203:5` · AI Workflow Canary Copilot lobby `206:4` (⚠️ permission unsecured — Figma-staged only, NOT for the site yet) + B&B Confirmation `210:7` · Tipping Disbursement `199:6` + Tip Settings `202:6` + HRIS Mappings `208:6`. Ranked backlog of deliberately-skipped screens in the sweep file (AI menu parser modal staged, one command away). Section 87:3 widened 7000→9500.
- **⚠️ Frame 94:5 mislabeled:** the "Builder / 01 Dashboard" capture (`?page=compendium`) is the **Apr 1 editor**, not the Jul 28 redesign — the Jul 28 landing card targets `?page=hotsos-compendium-builder`, now captured as `193:6`. Marco to rule: rename 94:5, or delete in favor of 193:6.
- **Accuracy QA** (`ACCURACY-QA.md`): all 64 original frames compared side-by-side vs baselines — **55 accurate, 9 fixed in place, 0 recaptures needed**. Fixes: Orders V2 sidebar utensils icon ×3, Statler wordmark font fallback (Georgia→Lora Bold Italic), Language select position (168:6), Order Food button centering (101:6), "$" price prefix ×2 (108:6, 112:6), kudos truncation collision (116:5). Systemic capture lessons (fonts fall back silently, small inline SVGs drop, CSS truncation not captured) logged in that file.
- **Backup audit** (`FIGMA-BACKUP-AUDIT.md` + Figma page **📁 Backup File Index** `192:8`): ~285 files in `~/Desktop/canary figma` mapped to case studies w/ pull priority. Check-in richest (~35 files); F&B's main file lives in the *compendium/* folder; no coverage for 2022 General Task / Design System.

## Summary — ✅ EXTRACTION COMPLETE 2026-08-01
**64 frames** across 5 sections on 🎬 Case Study Visuals (`50:2`), every one side-by-side verified vs a live baseline (agents) + 4 coordinator spot-checks passed:
- **F&B Ordering (50:3): 26** — guest ordering flow ×6, Orders V2 ×3, Unified Cart DSN-1828 ×8 (canonical cart per Marco), menu management ×6, setup/POS ×3
- **Compendium (50:4): 11** — Jul 28 builder ×5, guest hub, HotSOS/HubOS service requests ×5
- **Upsells (50:5): 15** — STAY-4300 2026-chrome admin ×6 (incl. DSN-1869 editor), segmentation ×3, front desk ×2, guest mobile ×4
- **AI Workflow (87:2): 5** — hub landing (fold + full 51-card grid), B&B Hôtels ×3
- **Digital Tipping (87:3): 7** — 2026-chrome admin ×3 (incl. Staff Wallets P0), wallet/cash-out ×2, tip relay ×2

**Route corrections discovered** (briefs were stale): Upsells 2026 admin = `?page=upsells-admin-redesign` (`&upsells-tab=`) · Tipping 2026 admin = `?page=tipping-admin-redesign` (`?tipping-tab=`) · HotSOS ticketing = `?page=hotsos-integration-settings` (integrations-settings = POS) · HotSOS flat list = `?page=hotsos-service-requests` (not captured).

**Needs Marco's eyes** (full logs in `visuals-progress/*.md` + Known deviations below): substituted stock photos (dead Unsplash IDs) on menu food + maintenance category; Croissant image dead at source (app placeholder shown, faithful); legacy Flow A "03 Review cart" (70:5) superseded by Unified Cart — delete while polishing if wanted; "$" prefix missing in 2 Price inputs; F&B Setup + Manage Items frames are viewport-height (below-fold content not in frame); AI menu parser (inside Create-menu modal) not captured — say the word for an extra frame; frames are FIXED layout with partial auto-layout (capture limitation, not retrofitted); F&B/Upsells sections were widened to fit content, AI/Tipping sections shifted down.
**Cleanup done:** stray stale-era wrapper 61:2 deleted; capture-era baselines all under `~/Developer/.playwright-mcp/baselines/`.

## Infrastructure
- **⚠️ SOURCE CORRECTED 2026-08-01:** the hub at `~/Developer/msevilla-canary-prototypes-1` sat 31 commits stale (Jul 23) — now `git pull`ed to **f60b34c** (final Jul 29 state: Tailwind v4, DSN-1869 editor rebuild, Tipping Admin 2026 chrome, dark Linear-style landing). Matches the backup mirror in `~/Work Laptop Backup/Projects consolidation/msevilla-canary-prototypes` exactly. All extraction MUST come from the updated Developer copy. First Flow A pass (4 frames) was captured from stale code → deleted from Figma + baselines wiped; Flow A restarts from scratch.
- **Prototype hub dev server:** fresh `npm run dev -- -p 3001` running post-pull (old Jul 15 server killed; deps reinstalled for Tailwind v4). Port 3000 is the portfolio site's own dev server.
- **Deep links:** `http://localhost:3001/?page=<name>`; `&tab=` supported for `menu-management` (menus | item-library | settings) and `tipping-admin`/`tipping-tip-relay`. `&demo=1` exists for bb-hotels-tip.
- **Not deep-linkable** (need in-app clicks from a linkable entry): order-summary, order-loading, order-confirmation, email-preview, denial-email-preview, edit-section, edit-item, menu-preview, service-request-sub-option, service-request-describe, service-request-confirmation, upsells (some sub-states).
- **Figma:** page `50:2`; sections — F&B Ordering `50:3`, Compendium `50:4`, Upsells `50:5`. No variable binding (Canary design language, raw values). PNG-only asset uploads.
- **Baselines folder:** `/private/tmp/claude-501/-Users-marcosevilla-Developer/77d45ae3-09e1-4ff0-8754-37acd5257228/scratchpad/baselines/<flow>/` (screenshots + computed-style JSON per screen).
- **Viewports:** guest/mobile flows 430px wide; admin/desktop 1440px.

## Flow inventory (rebuilt 2026-08-01 from the NEW landing grid — 51 prototypes / 6 areas; full scrape at ~/Developer/.playwright-mcp/landing-grid-inventory.json)

### F&B Ordering (section 50:3)
- [x] **A. Guest mobile ordering** (430px) — **COMPLETE, all 6 frames verified side-by-side:**
  - [x] 01 Menu browse — `65:5` (header title re-centered, same fix as 02)
  - [x] 02 Item details — `68:5`
  - [x] 03 Review cart — `70:5`
  - [x] 04 Order confirmation — `72:5`
  - [x] 05 Order timing — ASAP `74:5`
  - [x] 05b Order timing — Later `76:5` (date chips + 30-min slot grid, disabled CTA state)
  - NOTE: capture wrapper chain is Body > AppRouter > child = screen; frames land 478-wide (native CSS units; baseline PNGs are 430 due to app zoom). Captures DO include auto-layout on many containers. Prototype home-FAB excluded by design.
- [x] **B. Orders V2 lifecycle** (1440→1600 native) — **COMPLETE, 3 frames verified:**
  - [x] 01 New orders — `80:6` (urgency chips, scheduled-merged rows)
  - [x] 02 In progress — `82:6` (pink escalation rows)
  - [x] 03 Past orders — `84:6` (Approved/Denied status pills)
  - GOTCHA fixed: admin pages have sidebar+content as AppRouter children — extractor must take the ≥90%-width node, NOT the first child (first attempt pulled the 180px sidebar alone and lost the capture; re-captured). Deny modal skipped (3 tabs cover the lifecycle story).
- **⚠️ MARCO DIRECTIVE (2026-08-01 mid-loop):** for F&B guest experience and ALL mobile purchasing flows, use the **Unified Cart prototype** (`?page=unified-cart`, DSN-1828 — one cart grammar across Check-in/Compendium/F&B) as the canonical cart UI. Flow A's legacy "03 Review cart" (`70:5`) is SUPERSEDED — kept for reference, Marco may delete while polishing. Unified Cart captured NEXT (before Compendium), and Flow N's mobile carts should favor unified-cart variants.
- [x] **B2. Unified Cart (DSN-1828)** — ✅ agent complete, 8 frames verified (132:8, 137:8, 138:8, 139:8, 140:8, 142:8 stepper sheet, 145:8, 148:8) — Check-in/Compendium/F&B contexts, staged via scripted clicks; 430-native (page opts out of app zoom)
- [x] **C. Menu management** — ✅ 6 frames (159:6–161:6, 163:6–165:6); AI parser in Create-menu modal NOT captured (optional extra)
- [x] **D. Setup + POS** — ✅ 3 frames (168:6, 169:6, 170:6 Simphony config); `?page=integrations-settings` confirmed = POS gateway
- Details: `visuals-progress/fnb.md`
- [ ] **C. Menu management** (1440) — `?page=menu-management&tab=menus|item-library|settings` (incl. AI menu parser if visible), `?page=edit-menu`, `?page=menu-availability`, `?page=edit-modifier-set`. — **pending**
- [ ] **D. F&B setup + POS** (1440) — F&B Ordering Setup Compendium V2 (`?page=fb-ordering-subpage`, confirm) + Oracle Simphony POS config (locate route in-iteration). — **pending**

### Compendium (section 50:4) — ✅ AGENT COMPLETE, 11 frames verified + 2 coordinator spot-checks passed (94:5, 149:9)
- [x] **E. Builder (Jul 28)** — 94:5, 96:5, 101:6 (textarea value restored by hand), 106:6, 110:5
- [x] **F. Guest Hub** — 114:8 (full content height)
- [x] **G. Service requests** — 119:6 (⚠️ HotSOS ticketing is at `?page=hotsos-integration-settings`, NOT integrations-settings), wizard V2: 125:9, 129:9, 149:9, 154:9 (sub-options step unreachable in data — 4-step flow; Jul 28 flat list is separate `?page=hotsos-service-requests`, NOT captured)
- Details: `visuals-progress/compendium.md`

### AI Workflow (section 87:2) — ✅ AGENT COMPLETE, 5 frames verified
- [x] **H. Hub landing** — 156:5 (above fold) + 157:2 (full 7233px grid, all 51 cards)
- [x] **I. B&B Hôtels Tip** — 98:7 (French QR welcome), 104:7 (tip amount after 5★), 109:7 (card payment, Soumettre)
- [x] **J. Segment rules** — covered by Upsells frame 127:6 (shared)

### Digital Tipping (section 87:3) — ✅ AGENT COMPLETE, 7 frames verified
- [x] **O. Admin 2026 Chrome** — ⚠️ real route `?page=tipping-admin-redesign` + `?tipping-tab=` (brief's tipping-admin = old Feb version, no Staff Wallets). Frames: 116:5 (Tips), 120:5 (Staff), 123:5 (Staff Wallets P0)
- [x] **P. Wallet + Cash Out + Tip Relay** — 128:6 (wallet home, full scroll), 131:5 (cash out prep), 136:5 (disbursement), 152:2 (allocate-tip modal — NOTE: modals are wrapper-level siblings; extract the whole wrapper, not the ≥90% child)
- Details: `visuals-progress/ai-tipping.md`

### Upsells (section 50:5) — ✅ AGENT COMPLETE, 15 frames verified (spot-check pending)
- [x] **K. Admin redesign STAY-4300** — ⚠️ real route is `?page=upsells-admin-redesign` (`&upsells-tab=new|past|manage`); `?page=upsells` = OLD UI (kept available as "before" frames if wanted). Frames: 99:6, 103:6, 105:6, 108:6 (DSN-1869 editor, embedded — old standalone edit pages superseded/skipped), 112:6, 115:6
- [x] **L. Segmentation** — 121:6 (3379px approaches doc), 124:6, 127:6 (segment rules — SHARED with ai-workflow study)
- [x] **M. Front desk** — 133:6 (Opera check-in), 135:5 (FD tool)
- [x] **N. Guest mobile (supporting; Unified Cart canonical)** — 141:6, 146:7, 155:5, 158:5
- ⚠️ Section resized to 9500x7500 for the tall doc frame; AI Workflow + Digital Tipping sections shifted down +4500 (contents intact). "$" prefix dropped in Price inputs on 108:6/112:6. Details: `visuals-progress/upsells.md`

### Digital Tipping (NEW section when reached — no case study on site yet; #4 SKU, seeds a future one)
- [ ] **O. Tipping Admin 2026 Chrome (Jul 29, his final ship)** — `?page=tipping-admin` (+`&tab=` incl. Staff Wallets P0, disbursement modal). — **pending**
- [ ] **P. Staff Wallet + Cash Out** (430) — `?page=staff-wallet`, `?page=cash-out-prep` (the $1.4M story), `?page=tipping-tip-relay`. — **pending**

STOP after P unless everything is verified with budget to spare. (Design System experiments — CanaryBanner, CanaryCounter, Typography proposal — deliberately parked; revisit only on Marco's ask.)

## Per-screen status

### Flow A — F&B Guest mobile ordering (RESET 2026-08-01 — redo from pulled f60b34c code)
Baselines: `~/Developer/.playwright-mcp/baselines/flow-a/` (430px viewport; PNG + per-screen `-styles.json`)
- [ ] 01 Guest hub (`?page=guest-hub`, scrolls — capture full) — **pending**
- [ ] 02 Menu browse (`?page=mobile-menu-ordering`, substitute dead Unsplash images first) — **pending**
- [ ] 03 Item details (click Frittata h4 → bottom sheet) — **pending**
- [ ] 04 Review cart (add items → View cart; hide Back to Menu/Demo Time pills) — **pending**
- [ ] 05 Order confirmation (Submit order → wait 3s; hide Close Confirmation/View in Order Management pills) — **pending**
- [ ] 06 Order timing (`?page=order-timing`, ASAP + Later states) — **pending**

Proven pipeline (reuse): per screen → new generate_figma_design captureId (nodeId 50:3) → browser_run_code_unsafe: navigate/state + hide chrome + inject mcp.figma.com capture.js + captureForDesign → poll → use_figma cleanup (extract Body>AppRouter>child screen frame, resize to content height, appendChild to section 50:3, rename "F&B / Guest ordering / NN Name", remove wrapper). Captures produce real editable layers + image fills but FIXED layout (no auto-layout) — logged as deviation for Marco.

## Known deviations
- **3 dead Unsplash images substituted in-DOM at capture time** (prototype data has deleted Unsplash IDs; repo read-only): Croissant → photo-1509440159596 (bread rolls), Waffle → photo-1568051243858 (scone-like), Quiche → photo-1476718406336 (soup bowl). Not literal matches — Marco may want to re-art-direct these photos in Figma.
- Order confirmation hero carousel shows a gym/boxing stock photo — that IS what the prototype renders (1:1 kept).

## Capture recipe (reuse every screen)
1. Navigate → wait ~1.5s for entrance animations.
2. Hide dev/demo chrome: `nextjs-portal`, `[id*=agentation]`, `[class*=agentation]`, `[class*=toolbarContainer]`, `[class*=styles-module__toolbar]`, buttons matching /Color tokens|Component Inspector|Open Next.js|issues|Dev Tools/, and small (<320×100, top<200) pills matching /Back to Menu|Demo Time|Close Confirmation|View in Order Management|Back to Compendium Builder/. Match LEAF elements only — hiding parents blanks the whole page (happened once).
3. Screenshot `scale: css` → `.playwright-mcp/baselines/<flow>/NN-name.png`; add `-full.png` when the page scrolls.
4. Styles: getComputedStyle dump JSON alongside. ⚠️ The app applies ~0.9 page zoom (html reports 478px wide at 430 viewport) — treat SCREENSHOT pixels as canonical geometry; scale style-JSON rects by 430/478.
5. Playwright can only write under `~/Developer` — baselines live in `~/Developer/.playwright-mcp/baselines/`.

## ⚡ PARALLELIZED 2026-08-01 (Marco's call — "too slow")
Four background agents now own the remaining areas, each running the proven per-screen pipeline from `EXTRACTION-PLAYBOOK.md` with its own headless Chrome + own progress file under `visuals-progress/`:
- **fnb.md** — Unified Cart (TOP priority, Marco's directive) + menu management + F&B setup/POS → section 50:3
- **compendium.md** — Builder redesign + Guest Hub + service requests/HubOS → section 50:4
- **upsells.md** — STAY-4300 admin + segmentation + front desk + guest mobile carts → section 50:5
- **ai-tipping.md** — Hub landing + B&B Hôtels → section 87:2 (AI Workflow); Tipping Admin 2026 + wallet/cash-out + tip relay → section 87:3 (Digital Tipping)
Main session = coordinator: merges agent progress here, spot-checks verified frames, handles blockers. Flows A + B above were completed serially before the split.

## Iteration log
- **Iter 1 (setup):** Dev server found already running on :3001. Figma page 50:2 + sections created (F&B 50:3, Compendium 50:4, Upsells 50:5). Inventory written.
- **Iter 2 (Flow A baselines):** All 6 guest-ordering screens captured clean (7 PNGs + 6 style JSONs) after dev-chrome hiding + dead-image substitution. **INVALIDATED — stale source.**
- **Iter 4 (inventory rebuild, loop resumed on Marco's go):** Landing grid scraped (51 cards → JSON), flow inventory rewritten A–P: guest-hub reassigned to Compendium per landing taxonomy; NEW ai-workflow media set (hub landing / B&B Hôtels / segment rules) and NEW Digital Tipping section added per Marco's "anything else?" ask. Next: Flow A recapture from current code.
- **Iter 3 (build, interrupted):** Captured + placed 4 Flow A frames via generate_figma_design pipeline — then Marco flagged the source repo was outdated. **SOURCE CORRECTION:** -1 repo pulled 91e06f4→f60b34c (31 commits), deps reinstalled (Tailwind v4), old Jul 15 dev server killed, fresh server on 3001, 4 stale frames deleted from Figma, baselines wiped. References fixed in SPECIMEN-CONCEPT-PROMPT.md + memory (portfolio-figma-migration, developer-directories) + lessons.md. Obsidian checked — no fixes needed (its references were historically accurate). Loop PAUSED for Marco's go; resume = redo Flow A from current code with the proven pipeline above.

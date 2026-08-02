# F&B Ordering remainder — extraction progress (fnb-agent)

Section: `50:3` (F&B Ordering), file O9tNG8DqYrpdJmrEGa7Io7. **ALL 17 FRAMES VERIFIED — DONE.**

**Layout deviation (structural):** Instructed y-rows at y=3100+ were impossible — the section is 3000 tall and the Compendium section (50:4) starts 400px below on the page, so extending height would collide with another agent's area. Instead the section was **widened 7000 → 18000** and new flows placed in fresh x-columns (x ≥ 7700) inside the existing y-rows. Existing frames untouched. Note: stray page-level frame 61:2 ("Food & Beverage Ordering", page x=7040) now sits inside the section's visual bounds — it belongs to the page, was not touched, and renders above the section background.

Section layout after this run (section-relative):
- y=150 row: existing guest flow (x 100–3228) · Unified Cart x=7700–11840 (430w, step 530) · Setup+POS x=12500–17340 (1440w, step 1700)
- y=1900 row: existing Orders V2 (x 100–5100) · Menu management x=7700–17640 (1440w, step 1700)

## Unified Cart (DSN-1828) — `?page=unified-cart` — TOP PRIORITY ✅
3 context flows via `&flow=checkin|compendium|fnb` (floating flow-switcher pill = prototype chrome, hidden in captures). F&B flow staged through browse → variant drawer → stepper disambiguation sheet (the landed menu-stepper deletion grammar) → review → info. Frames are 430×932 native (this page opts out of the app-frame 0.9 zoom, unlike the older 478-wide guest-flow frames — same content, no quality difference).

| NN | Frame | Status | Node ID | Notes |
|----|-------|--------|---------|-------|
| 01 | Check-in — Add-ons | verified | 132:8 | Room upgrades + Add-ons tabs, Skip CTA |
| 02 | Check-in — Review & submit | verified | 137:8 | Junior Suite + Late Checkout 3PM in cart |
| 03 | Compendium — Guest hub | verified | 138:8 | The Statler hub, Arriving early? + Add-ons |
| 04 | F&B — Menu browse | verified | 139:8 | In-room dining, Lunch menu |
| 05 | F&B — Item detail drawer | verified | 140:8 | Wagyu Burger, side select + special request |
| 06 | F&B — Menu stepper sheet | verified | 142:8 | Variant disambiguation (Truffle fries / Green salad lines) |
| 07 | F&B — Review cart | verified | 145:8 | 3 items incl. variant line, fees + totals |
| 08 | F&B — Your information | verified | 148:8 | Guest info form, disabled Submit order |

## Menu management (1440×900, y=1900) ✅
| NN | Frame | Status | Node ID | Notes |
|----|-------|--------|---------|-------|
| 01 | Menus | verified | 159:6 | |
| 02 | Item library | verified | 160:6 | Croissant row shows the app's own missing-image placeholder (source Unsplash URL dead; identical on live page — faithful capture) |
| 03 | Settings | verified | 161:6 | Delivery time + fees/taxes |
| 04 | Edit menu | verified | 163:6 | Breakfast menu + live phone preview; Croissant thumb blank in preview (same dead source image) |
| 05 | Menu availability | verified | 164:6 | V1–V5 variant-switcher pill (prototype chrome) hidden in capture |
| 06 | Edit modifier set | verified | 165:6 | Protein set + selection rules; page has no sidebar by design |

**AI menu parser:** not visible on any deep-linked tab (it lives inside the Create menu flow modal) — not captured. Flag for Marco if he wants it as an extra staged frame.

## F&B setup + POS (1440×900, y=150 row, x=12500+) ✅
| NN | Frame | Status | Node ID | Notes |
|----|-------|--------|---------|-------|
| 01 | F&B Ordering Setup (Compendium V2) | verified | 168:6 | `?page=fb-ordering-subpage` — translations/menus/delivery/POS settings + guest preview. Page scrolls below fold (taxes & fees section not in frame — viewport-height capture, consistent with the other admin rows) |
| 02 | Integrations — POS tab | verified | 169:6 | `?page=integrations-settings` opens on POS tab, NOT CONNECTED state (this page IS the POS gateway, not HotSOS ticketing) |
| 03 | Oracle Simphony POS config | verified | 170:6 | Staged: clicked "Configure POS integration" → Step 1: POS credentials, Oracle Simphony vendor, API/Auth URL, Client ID, Org Short Name, Username/Password |

## Deviations needing Marco's eyes
1. Section widened to 18000 + flows in x-columns instead of the briefed y=3100 rows (vertical space was owned by the Compendium section). Stray frame 61:2 overlaps section bounds visually.
2. Croissant item image is dead at the source (menu-management item library + edit-menu preview) — captures faithfully mirror the live prototype; fix would require replacing the image in the app (repo is read-only).
3. AI menu parser not captured (modal inside Create-menu flow, no deep link).
4. F&B Ordering Setup frame is viewport-height; below-fold content (taxes & fees inline edit) not represented.
5. Captures are fixed-layout (partial auto-layout from Figma capture) — expected per playbook, logged once for all three flows.

Baselines: ~/Developer/.playwright-mcp/baselines/fnb-agent/ (uc-01..08, mm-01..06, setup-01..03)

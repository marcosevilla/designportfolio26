# Accuracy QA — 🎬 Case Study Visuals (Session 2, 2026-08-02)

Pixel-accuracy verification of all 64 extracted frames vs live-prototype baselines
(`~/Developer/.playwright-mcp/baselines/`). Repo unchanged since capture (f60b34c) — baselines are ground truth.

Verdicts: ✅ accurate · 🔧 fixed in Figma · ⚠️ needs recapture (structural) · 📎 known deviation (pre-logged, unchanged)

Expected non-issues (per playbook, NOT flagged): native-CSS-unit scale diff (478 vs 430), fixed-layout capture structure, hidden dev chrome, substituted dead Unsplash photos.

## Verdict table

| # | Frame | Node | Verdict | Notes |
|---|-------|------|---------|-------|
| 1 | F&B / Guest ordering / 01 Menu browse | 65:5 | ✅ | Items, prices, badges, centered header all match; photo subs = pre-logged 📎 |
| 2 | F&B / Guest ordering / 02 Item details | 68:5 | ✅ | Sheet, scrim, stepper, CTA match |
| 3 | F&B / Guest ordering / 03 Review cart | 70:5 | ✅ | (superseded by Unified Cart per Marco — content accurate) |
| 4 | F&B / Guest ordering / 04 Order confirmation | 72:5 | ✅ | Gym hero = faithful 📎 |
| 5 | F&B / Guest ordering / 05 Order timing ASAP | 74:5 | ✅ | |
| 6 | F&B / Guest ordering / 05b Order timing Later | 76:5 | ✅ | Date chips, slot grid, disabled CTA match |
| 7 | F&B / Orders V2 / 01 New orders | 80:6 | 🔧 | Missing utensils icon in active "F&B Ordering" sidebar pill — added Material restaurant vector (192:2), color matched to text #375492. Verified. |
| 8 | F&B / Orders V2 / 02 In progress | 82:6 | 🔧 | Same missing sidebar icon — added (192:4). All rows/chips/buttons match. |
| 9 | F&B / Orders V2 / 03 Past orders | 84:6 | 🔧 | Same missing sidebar icon — added (192:6). Status pills + calendar glyph match. |
| 10 | F&B / Unified Cart / 01 Check-in Add-ons | 132:8 | ✅ | Pixel-identical |
| 11 | F&B / Unified Cart / 02 Check-in Review | 137:8 | ✅ | |
| 12 | F&B / Unified Cart / 03 Compendium hub | 138:8 | 🔧 | "The Statler" wordmark carried missing font Georgia "Semi Bold Italic" (unavailable in Figma) → rendered as light fallback. Set to Lora Bold Italic (closest Georgia-alike); now matches baseline weight. Node 138:12. |
| 13 | F&B / Unified Cart / 04 F&B Menu browse | 139:8 | ✅ | |
| 14 | F&B / Unified Cart / 05 Item detail drawer | 140:8 | ✅ | |
| 15 | F&B / Unified Cart / 06 Menu stepper sheet | 142:8 | ✅ | |
| 16 | F&B / Unified Cart / 07 Review cart | 145:8 | ✅ | Fees, totals, variant line match |
| 17 | F&B / Unified Cart / 08 Your information | 148:8 | ✅ | |
| 18 | F&B / Menu mgmt / 01 Menus | 159:6 | ✅ | Sidebar icons all intact here |
| 19 | F&B / Menu mgmt / 02 Item library | 160:6 | ✅ | Croissant placeholder tile faithful 📎 |
| 20 | F&B / Menu mgmt / 03 Settings | 161:6 | ✅ | |
| 21 | F&B / Menu mgmt / 04 Edit menu | 163:6 | ✅ | Croissant preview thumb blank (dead source image) 📎 |
| 22 | F&B / Menu mgmt / 05 Menu availability | 164:6 | ✅ | |
| 23 | F&B / Menu mgmt / 06 Edit modifier set | 165:6 | ✅ | Pixel-identical |
| 24 | F&B / Setup / 01 F&B Ordering Setup | 168:6 | 🔧 | "English · Default" select had drifted ~250px right of baseline — re-anchored left under "Language" label (node 168:184, absolute-positioned x=0). Verified. |
| 25 | F&B / Setup / 02 Integrations POS tab | 169:6 | ✅ | |
| 26 | F&B / Setup / 03 Oracle Simphony config | 170:6 | ✅ | Baseline shows transient browser focus ring on POS Vendor select; Figma has rest state — kept (cleaner artifact, not a content diff) |
| 27 | Compendium / Builder / 01 Dashboard | 94:5 | ✅ | Preview scroll-settle ~15px pre-logged 📎 |
| 28 | Compendium / Builder / 02 Edit Section | 96:5 | ✅ | Pixel-identical |
| 29 | Compendium / Builder / 03 Edit Item | 101:6 | 🔧 | Visible "Order Food" preview button label was left-aligned (baseline: centered, chevron right). Fixed: label wrapper 101:392 set to FILL, chevron 101:395 pinned absolute right. NOTE: frame contains a below-fold duplicate of the page (capture noise at y≈1300); accidental edits there were reverted. |
| 30 | Compendium / Builder / 04 Business Hours | 106:6 | ✅ | |
| 31 | Compendium / Builder / 05 Messaging Channels | 110:5 | ✅ | Modal + preview match |
| 32 | Compendium / Guest Hub / 01 | 114:8 | ✅ | Full-height content matches incl. script logo |
| 33 | Compendium / Service req / 01 Integration Settings | 119:6 | ✅ | HotSOS card + ticket types table match |
| 34 | Compendium / Service req / 02 Request Type | 125:9 | ✅ | Electrician photo = logged substitution 📎 |
| 35 | Compendium / Service req / 03 Details Housekeeping | 129:9 | ✅ | |
| 36 | Compendium / Service req / 04 Review Towels | 149:9 | ✅ | |
| 37 | Compendium / Service req / 05 Confirmation | 154:9 | ✅ | |
| 38 | Upsells / Admin / 01 New Requests | 99:6 | ✅ | Pixel-identical |
| 39 | Upsells / Admin / 02 Past Requests | 103:6 | ✅ | |
| 40 | Upsells / Admin / 03 Manage Items | 105:6 | ✅ | |
| 41 | Upsells / Admin / 04 Edit Item DSN-1869 | 108:6 | 🔧 | Pre-logged missing "$" prefix in Price input FIXED — added $ text node (207:2) at 16px inset, matches baseline |
| 42 | Upsells / Admin / 05 Edit EYS Item | 112:6 | 🔧 | Same "$" prefix FIXED (207:3) |
| 43 | Upsells / Admin / 06 Settings | 115:6 | ✅ | Full-height frame; visible viewport matches |
| 44 | Upsells / Segmentation / 01 Overview doc | 121:6 | ✅ | Top viewport matches baseline; full 3379px doc coherent |
| 45 | Upsells / Segmentation / 02 Edit | 124:6 | ✅ | Annotations pill excluded by design 📎 |
| 46 | Upsells / Segmentation / 03 Segment Rules | 127:6 | ✅ | States switcher excluded 📎 |
| 47 | Upsells / Front desk / 01 Opera Check-in | 133:6 | ✅ | |
| 48 | Upsells / Front desk / 02 FD Tool | 135:5 | ✅ | Bespoke/Guest-aligned switcher excluded 📎 |
| 49 | Upsells / Guest mobile / 01 Add-ons Cart | 141:6 | ✅ | Pixel-identical |
| 50 | Upsells / Guest mobile / 02 Compendium Add-ons | 146:7 | ✅ | Bottom carousel ~16px h-scroll settle diff (baseline caught mid-scroll; Figma = rest state, kept) |
| 51 | Upsells / Guest mobile / 03 Extend Your Stay | 155:5 | ✅ | Dev segmented control excluded 📎 |
| 52 | Upsells / Guest mobile / 04 EYS Confirmed | 158:5 | ✅ | |
| 53 | AI Workflow / Landing above fold | 156:5 | ✅ | Dark Linear-style hero + cards match |
| 54 | AI Workflow / Landing full grid | 157:2 | ✅ | All 51 cards + footer verified (bottom crop vs bottom baseline) |
| 55 | AI Workflow / B&B / 01 Welcome | 98:7 | ✅ | |
| 56 | AI Workflow / B&B / 02 Tip | 104:7 | ✅ | |
| 57 | AI Workflow / B&B / 03 Card Payment | 109:7 | ✅ | Pixel-identical |
| 58 | Tipping / Admin / 01 Tips | 116:5 | 🔧 | PENDING row kudos text rendered full-length, colliding with the status badge (browser truncates with ellipsis). Fixed: node 116:299 characters set to the browser truncation "…got downst…". |
| 59 | Tipping / Admin / 02 Staff | 120:5 | ✅ | Pixel-identical |
| 60 | Tipping / Admin / 03 Staff Wallets | 123:5 | ✅ | Pixel-identical |
| 61 | Tipping / Wallet / 01 Staff Wallet | 128:6 | ✅ | Full 1661px height; top matches baseline |
| 62 | Tipping / Wallet / 02 Cash Out Prep | 131:5 | ✅ | V1/V2/V3 dev switcher removed by design 📎 |
| 63 | Tipping / Relay / 01 Disbursement | 136:5 | ✅ | HotSOS demo toggle removed by design 📎 |
| 64 | Tipping / Relay / 02 Allocate Modal | 152:2 | ✅ | Modal + scrim intact; footer row ~24px height diff vs baseline (negligible) |

## Totals

- **✅ Accurate:** 55
- **🔧 Fixed this pass:** 9 — sidebar utensils icon ×3 (80:6, 82:6, 84:6), Statler wordmark font (138:8), Language select position (168:6), Order Food button centering (101:6), "$" price prefix ×2 (108:6, 112:6), kudos truncation (116:5)
- **⚠️ Needs recapture:** 0
- **📎 Pre-logged deviations left as-is:** substituted stock photos (dead Unsplash), Croissant dead-at-source image, viewport-height admin frames, fixed-layout capture structure, hidden dev chrome, gym-photo confirmation hero (faithful)

## Recapture list

None — no structural misses found. Every frame's layout, content, and typography matched or was fixed in place.

## Notable quality findings (for Marco)

1. **Figma-unavailable fonts silently fall back.** The Statler wordmark carried Georgia "Semi Bold Italic" — a font/style Figma doesn't have — and rendered as a thin default serif. Re-set to Lora Bold Italic (closest Georgia-alike). Any future capture using system serifs (Georgia, Times) will need the same treatment; check other script/serif brand marks when composing specimens.
2. **Captures drop small inline SVG icons occasionally.** All three Orders V2 frames lost the utensils icon in the active sidebar pill (menu-management frames kept theirs). Rebuilt as a Material "restaurant" vector color-matched to the pill text.
3. **CSS text truncation is not captured.** Ellipsized strings arrive full-length and can collide with neighbors (Tips table kudos vs PENDING badge). Worth a spot-check on any future table captures.
4. **101:6 (Compendium Edit Item) contains a full below-fold duplicate of the page** at y≈1300 inside the frame (capture noise, invisible in normal crops). Harmless but confusing when editing — beware duplicate text matches when scripting changes.
5. Baseline-only artifacts (browser focus ring on the POS Vendor select, carousel scroll-settle offsets, dev pills) were deliberately NOT replicated — the Figma frames hold the cleaner rest state.


# Upsells — extraction progress

Section: `50:5` on page 🎬 Case Study Visuals (`50:2`), file `O9tNG8DqYrpdJmrEGa7Io7`.
Baselines: `~/Developer/.playwright-mcp/baselines/upsells-agent/`

**PLAN CHANGE (mid-session, Marco's directive):** the brief's `?page=upsells` renders the OLDER UpsellsManageItemsV3 UI. The newest admin UI is `?page=upsells-admin-redesign` (src/features/upsells/admin-redesign/ — STAY-4300 2026 chrome, New/Past request queues as cards, DSN-1869 continuous-scroll editor embedded via the Edit row action, deep links `&upsells-tab=new|past|manage`). Flow 1 uses that page; the old `?page=upsells-edit-item` / `?page=upsells-edit-eys-item` standalone editors are superseded by the redesign's in-page editor (add-on row Edit / "Extend your stay" row Edit). Two frames captured from the old UI were deleted (were 89:8, 92:8).

| # | Frame | Source | Viewport | Status | Node ID | Deviations |
|---|-------|--------|----------|--------|---------|------------|
| 01 | Upsells / Admin redesign / 01 New Requests | `?page=upsells-admin-redesign&upsells-tab=new` | 1440x900 | verified | 99:6 | — |
| 02 | Upsells / Admin redesign / 02 Past Requests | `?page=upsells-admin-redesign&upsells-tab=past` | 1440x900 | verified | 103:6 | — |
| 03 | Upsells / Admin redesign / 03 Manage Items | `?page=upsells-admin-redesign&upsells-tab=manage` | 1440x900 | verified | 105:6 | Add-ons section below the 900px fold (viewport-height frame by design) |
| 04 | Upsells / Admin redesign / 04 Edit Item (DSN-1869) | manage tab + Edit on "Early Check-in" | 1440x900 | verified | 108:6 | Minor: "$" prefix inside Price input lost in capture |
| 05 | Upsells / Admin redesign / 05 Edit EYS Item | manage tab + Edit on "Extend your stay" | 1440x900 | verified | 112:6 | Minor: "$" prefix inside Price input lost in capture |
| 06 | Upsells / Admin redesign / 06 Settings | `?page=upsells-settings` | 1440x900 | verified | 115:6 | Frame extended to full content height 1307 (below-fold PMS Integration + Notification Alert included) |
| 07 | Upsells / Segmentation / 01 Overview | `?page=upsells-segmentation` | 1440x900 | verified | 121:6 | Full-height doc page (3379px, DSN-1750 approaches doc). First attempt lost the header — extraction rule fixed (stop descending at multiple full-width children) |
| 08 | Upsells / Segmentation / 02 Edit | `?page=upsells-segmentation-edit` | 1440x900 | verified | 124:6 | Prototype "3 annotations" pill excluded (dev chrome) |
| 09 | Upsells / Segmentation / 03 Segment Rules (DSN-1750 v2) | `?page=upsells-segment-rules` | 1440x900 | verified | 127:6 | ALSO used by ai-workflow study. Frame is 1504x964 (capture kept shadow margin); prototype "States" preview switcher excluded |
| 10 | Upsells / Front desk / 01 Opera Check-in (DSN-1802) | `?page=opera-checkin` | 1440x900 | verified | 133:6 | Full content height 971 |
| 11 | Upsells / Front desk / 02 FD Upsells Tool | `?page=fd-upsells` | 1440x900 | verified | 135:5 | Prototype "Bespoke staff UI / Guest-aligned" switcher pill excluded (dev chrome) |
| 12 | Upsells / Guest mobile / 01 Add-ons Cart (DSN-1754) | `?page=mobile-upsells-cart` | 430x932 | verified | 141:6 | Supporting frame — Unified Cart (other agent) is canonical |
| 13 | Upsells / Guest mobile / 02 Compendium Add-ons parity | `?page=mobile-compendium-addons` | 430x932 | verified | 146:7 | Supporting frame |
| 14 | Upsells / Guest mobile / 03 Extend Your Stay | `?page=mobile-extend-your-stay` | 430x932 | verified | 155:5 | Sheet renders as 366-wide card on gray backdrop (kept whole composition); CanarySegmentedControl + "Back to prototypes" dev chrome removed. First attempt grabbed the placeholder bg layer — fixed |
| 15 | Upsells / Guest mobile / 04 Extend Your Stay Confirmed | `?page=mobile-extend-your-stay-confirmed` | 430x932 | verified | 158:5 | Same sheet-on-backdrop composition as 14; dev segmented control removed |

## Status: COMPLETE — 15/15 verified

Layout in section 50:5 (resized to 9500x7500):
- Row 1 (y=150): Admin redesign 01–06, x stride 1540 from x=100
- Row 2 (y=1610): Segmentation 07–09
- Row 3 (y=5140): Front desk 10–11
- Row 4 (y=6260): Guest mobile 12–15, x stride 530 from x=100

**Canvas change other agents/Marco should know:** Upsells section was resized 7000x3000 → 9500x7500 to fit the 3379px-tall DSN-1750 doc frame; sections `87:2` (AI Workflow) and `87:3` (Digital Tipping) were shifted down +4500 (y=14700 / y=18100) to preserve the 400px gap. Their children moved with them — no content touched.

## Notes
- Segment Rules frame is shared with the ai-workflow case study — noted per Marco's brief.
- Unified Cart (`?page=unified-cart`) is captured by another agent; mobile frames here are supporting variants.
- Old-UI pages NOT captured (superseded, available if Marco wants them): `?page=upsells` (ManageItemsV3/V4 w/ variant switcher), `?page=upsells-edit-item`, `?page=upsells-edit-eys-item` standalone editors.

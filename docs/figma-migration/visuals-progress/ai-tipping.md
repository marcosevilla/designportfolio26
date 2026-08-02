# AI Workflow + Digital Tipping — extraction progress

Agent: ai-tipping. Sections: AI Workflow `87:2`, Digital Tipping `87:3`. File `O9tNG8DqYrpdJmrEGa7Io7`.

## Route findings
- "Tipping Admin 2026 Chrome" = `?page=tipping-admin-redesign` (NOT `tipping-admin`, which is the older Feb page without Staff Wallets). Its tab deep-link param is `?tipping-tab=` (`?tab=` is claimed by the older page). Tab ids: tips (default), disbursement, tippable-staff, staff-wallets, qr-codes, reports, settings, resource-center.
- Tip Relay V2 (`?page=tipping-tip-relay`) opens on Disbursement; merged Allocate-tip flow lives inline ("Allocate" buttons → AllocateTipModalV2).
- B&B flow steps: welcome (star gate) → tip → card-payment → confirmation. Buttons appear after rating ≥4.

## AI Workflow (section 87:2)

| Screen | Status | Node | Notes |
|---|---|---|---|
| Hub landing grid / 01 Landing (Above the Fold) | verified | `156:5` | 1440x900 clipped, pixel-match |
| Hub landing grid / 02 Landing (Full Grid) | verified | `157:2` | 1440x7233, all 51 cards + footer; bottom verified vs scrolled-live baseline |
| B&B / 01 Welcome | verified | `98:7` | 430x932, pixel-match vs baseline |
| B&B / 02 Tip | verified | `104:7` | "Merci pour votre avis !" tip-amount step, pixel-match |
| B&B / 03 Card Payment | verified | `109:7` | 5 € summary + card form, pixel-match |

## Digital Tipping (section 87:3)

| Screen | Status | Node | Notes |
|---|---|---|---|
| Admin 2026 / 01 Tips | verified | `116:5` | ?page=tipping-admin-redesign, pixel-match |
| Admin 2026 / 02 Staff | verified | `120:5` | &tipping-tab=tippable-staff, pixel-match (HRIS chips, remind banner) |
| Admin 2026 / 03 Staff Wallets | verified | `123:5` | &tipping-tab=staff-wallets (P0), pixel-match (stat cards + wallet table) |
| Staff Wallet / 01 Wallet | verified | `128:6` | full content height 430x1661 (earnings + activity + footer), top matches baseline |
| Staff Wallet / 02 Cash Out Prep | verified | `131:5` | V3 Marshall variant; floating V1/V2/V3 dev switcher REMOVED from frame (was half-clipped in baseline) |
| Tip Relay / 01 Disbursement | verified | `136:5` | By-department table + history; floating With/No-HotSOS demo toggle removed in Figma |
| Tip Relay / 02 Allocate Modal | verified | `152:2` | "By tip" list + Allocate Tip modal (merged flow, Tip 1 of 5); HotSOS toggle hidden pre-capture. First attempt lost the modal (portal was sibling of page container) — fixed by keeping whole wrapper; deleted bad frame 144:5 |

## Deviations
- **Task brief said `?page=tipping-admin` + `&tab=`** — the actual 2026-chrome page is `?page=tipping-admin-redesign` with `?tipping-tab=` deep links (`?tab=` belongs to the older Feb admin page, which has no Staff Wallets tab). Captured the redesign page per intent.
- **Cash Out Prep (`131:5`)**: floating V1/V2/V3 variant dev-switcher removed from the Figma frame (it was half-clipped at the top of the live viewport). Content = V3 "Marshall" variant, the active default.
- **Tip Relay frames**: floating "With HotSOS / No HotSOS" demo toggle removed (01, in Figma) / hidden pre-capture (02) — same treatment as the playbook's demo-pill hide list.
- **Tip Relay 02 first attempt** placed without the modal (CanaryModal portal is a wrapper-level sibling, not inside the ≥90%-width container) — bad frame 144:2/144:5 deleted, re-captured keeping the whole wrapper. Lesson for other agents: for modal states, keep the wrapper (scrim + modal are siblings of the page container).
- **First landing captureId (4ccb5467…) stuck in "processing" ~40 min** server-side — abandoned; fresh capture completed in ~20s. Nothing placed from the stuck ID; if it ever materializes as a stray wrapper on page 50:2, delete it.
- Staff Wallet home frame is full scroll height (430x1661) rather than 932 viewport — intentional per playbook content-height rule.
- All frames are fixed-layout (capture artifact) — noted once per playbook.

## Status: DONE — 12/12 frames verified


# Compendium — extraction progress — COMPLETE (11 frames, all verified)

Section: `50:4` in O9tNG8DqYrpdJmrEGa7Io7 (🎬 Case Study Visuals). Section widened 7000 → 7800 to fit row 1.
Baselines: `~/Developer/.playwright-mcp/baselines/compendium-agent/`

## Flow 1 — Compendium Builder (Jul 28 redesign), 1440x900, row y=150

| # | Screen | URL | Status | Node ID | Notes |
|---|--------|-----|--------|---------|-------|
| 01 | Builder Dashboard | ?page=compendium | verified | 94:5 | 1:1; live guest preview scroll-settle offset ~15px, negligible |
| 02 | Edit Section | ?page=edit-compendium-section | verified | 96:5 | pixel match (right preview pane empty — matches app) |
| 03 | Edit Item | ?page=edit-compendium-item | verified | 101:6 | textarea value dropped by capture — description text restored manually (node 101:220) |
| 04 | Business Hours | ?page=compendium-item-hours | verified | 106:6 | 1:1; app's own rounded-xl container shadow renders past frame bounds |
| 05 | Messaging Channels | ?page=compendium-messaging-channels | verified | 110:5 | 1:1 incl. "Message us" modal in live preview |

## Flow 2 — Guest Hub, row y=1250

| # | Screen | URL | Status | Node ID | Notes |
|---|--------|-----|--------|---------|-------|
| 01 | Guest Hub | ?page=guest-hub | verified | 114:8 | 430x1464 phone expanded to full content height; "Back to Compendium Builder" pill hidden; 1:1 |

## Flow 3 — Service requests, row y=1250 (x 730+, right of Guest Hub)

| # | Screen | URL / state | Status | Node ID | Notes |
|---|--------|-------------|--------|---------|-------|
| 01 | Integration Settings — Ticketing | ?page=hotsos-integration-settings | verified | 119:6 | 1:1 (HotSOS connected card + service ticket types table) |
| 02 | Request Type | ?page=service-request-type | verified | 125:9 | wizard V2 (with images) is what the deep link renders |
| 03 | Details — Housekeeping | + click Housekeeping | verified | 129:9 | back button nudged y56→77 to match browser; hero crop marginally tighter (capture artifact) |
| 04 | Describe — Towels | + click Towels | verified | 149:9 | review step (room 1205 / John Smith), 1:1 |
| 05 | Confirmation | + Submit request | verified | 154:9 | back button nudged y56→77; 1:1 |

## Deviations / notes for Marco
- **Task URL correction:** the brief said `?page=integrations-settings` for the HotSOS Ticketing tab, but that page is the POS-only IntegrationsSettingsPage. The Ticketing tab (HotSOS connection + ticket types table) lives at `?page=hotsos-integration-settings` — captured that.
- **Wizard version:** `?page=service-request-type` deep-link renders the HubOS wizard **V2 (with images)** (router auto-selects the image variant on deep link). The Jul 28 HotSOS flat-list guest flow is a separate page (`?page=hotsos-service-requests`) and was NOT captured (not in scope per "capture whichever the current code renders").
- **Sub-options step unreachable:** no subtype in `src/data/serviceRequestTypes.ts` defines `subOptions`, so the `service-request-sub-option` page can never render with current data. Skipped (wizard is 4 steps: type → details → describe/review → confirmation).
- **Dead Unsplash image:** the maintenance category thumbnail (photo-1558618666-fcd25c85f82e) 404s; substituted photo-1621905251189-08b45d6a269e (electrician) in BOTH baseline and capture, per the playbook's dead-image protocol.
- **Layout change vs brief:** Service Requests row could not sit at y=2870 — the section is capped at 3000 tall (Upsells section sits directly below on the page, so the section can't grow). Flow 3 shares the y=1250 band, starting x=730 (right of Guest Hub). No overlaps.
- Dev-chrome hidden on all captures: DevTools launcher, wizard guest-status/variant control rail, "Go to Guest Hub" and "Back to Compendium Builder" pills.
- Captures are fixed-layout (partial auto-layout) — same as other flows.

# Sweep — missing screens (sweep agent, 2026-08-02)

Full hub roster (65 router cases + tab/variant states) diffed against the 64 extracted frames.

## Roster diff — missing & portfolio-relevant (ranked)

| # | Screen | Route / staging | Section | Priority | Status | Node | Notes |
|---|--------|-----------------|---------|----------|--------|------|-------|
| 1 | Compendium Builder (Jul 28 redesign) | `?page=hotsos-compendium-builder` (V2 In-builder default) | 50:4 | HIGH | verified | 193:6 | ⚠️ The Jul 28 landing card targets THIS page, not `?page=compendium` (which is the Apr 1 editor that got captured as "Builder Dashboard" 94:5). Service Requests settings entry + Copilot chip + live preview. V1/V2 dev switcher hidden. Placed x4720,y1250. Nit: sidebar footer Canary logo sits a few px lower (partially clipped) vs baseline. |
| 2 | HotSOS Service Requests — flat list | `?page=hotsos-service-requests` + click Service requests | 50:4 | HIGH | verified | 196:9 | 1:1 (search + flat grouped list, STEP 1 OF 2). Guest-status dev rail hidden; captured at 520x932, phone node extracted (430x932, viewport height — list scrolls below fold). Placed x6260,y1250. |
| 3 | Tipping Admin 2026 — Disbursement | `?page=tipping-admin-redesign&tipping-tab=disbursement` | 87:3 | HIGH | verified | 199:6 | Pixel match (dept balances + history w/ PROCESSING/PENDING/COMPLETED pills). Placed x4720,y150. NOTE: section 87:3 widened 7000 → 9500 for the two new admin frames. |
| 4 | Upsells Manage Items V3 — Live Availability & Dynamic Pricing (DSN-1707) | `?page=upsells` (default v3; card's `&variant=v2` falls back to v3) | 50:5 | HIGH | verified | 203:5 | Tagged "Case study" in hub; LA/DP Enabled chips + Availability column, DSN-1707 story only lives here. V3/V4 dev pill hidden at capture; CONFIGURE STATE pill removed in Figma post-place (CSS-uppercase beat the text hide — it IS still in the baseline PNG). Viewport-height frame (EYS section below fold). Placed x4720,y1610. |
| 5 | Tipping Admin 2026 — Tip Settings | `&tipping-tab=settings` | 87:3 | MED-HIGH | verified | 202:6 | Pixel match ("Managed by Canary" payments card, tip amounts, guest-experience toggles). Placed x6260,y150. |
| 6 | Canary Copilot | `?page=canary-copilot` | 87:2 | MED-HIGH | verified | 206:4 | Lobby dashboard (KPI sparklines, alerts, agent activity, message rail) — matches baseline. Nit: message-preview truncation differs slightly (fixed layout vs live ellipsis). Placed x3180,y150. ⚠️ FLAG: Marco dropped Copilot media from the SITE for permission reasons; Figma staging only — his call before publishing anywhere. |
| 7 | Tipping — Resolve Mappings (HRIS) | `?page=tipping-resolve-mappings` | 87:3 | MEDIUM | verified | 208:6 | Pixel match (Needs review 4 / Mapped 10, tippability triage rows). Frame 1472x932 (capture kept shadow margin). Placed x7800,y150. |
| 8 | B&B Hôtels — Confirmation step | `?page=bb-hotels-tip` staged (5★ → Laisser un pourboire → 5 € → Payer par carte → form fill → Soumettre) | 87:2 | MEDIUM | verified | 210:7 | Pixel match ("Merci pour votre générosité !" + B&B compendium tiles). Card form filled with demo data to enable Soumettre (fill() didn't trigger React validation — pressSequentially did). Wrench dev-FAB hidden. Placed x1690,y4000, completing the B&B row. |

## Backlog — found missing, NOT extracting (ranked)
1. AI menu parser (modal inside menu-management Create-menu flow) — already flagged optional last session; staged capture, say the word.
2. `fb-add-to-cart-variants` — Add-to-Cart Behavior demo; content ≈ duplicate of extracted menu-browse frame, variant story is interactive. Left demo-controls rail is dev chrome.
3. `fb-item-details-v2` — Compendium V2 In-room-dining admin item page (translations + live preview); entry point for captured Setup 168:6. Supporting.
4. `hotsos-compendium-builder` V1 · Integrations variant (read-only) — V2 default captured instead.
5. `wallet-settings` — staff wallet profile/language settings; supporting (translations story is mostly here + cash-out-prep already captured).
6. `my-reservation` — guest hub subpage, supporting.
7. `email-preview` / `denial-email-preview` — F&B order emails (reachable only via in-app clicks).
8. `order-management` (old Feb dashboard) — superseded by Orders V2 ×3.
9. `menu-preview`, `mobile-preview`, `order-summary`/`order-loading`, `edit-section`, `edit-item` — old-era/transient/preview shells; skip.
10. Old upsells editors (`upsells-edit-item`, `upsells-edit-eys-item`, `?page=upsells` v4 variant), old `tipping-admin` (Feb) — superseded, documented last session.
11. Tipping Admin 2026 remaining tabs: qr-codes, reports, resource-center — low marginal value.
12. Design System experiments (`banner-showcase`, `counter-showcase`, `activity-log-empty-state`) — parked per Marco.
13. `ui-refresh` + `typography-proposal` — external Vercel URLs, not hub pages (capturable from live URLs if ever wanted).
14. Dietary Information / High-Priority Notification / Suppl. Fees & Taxes landing cards — no dedicated routes (states/docs only).

## Extraction log — ✅ SWEEP COMPLETE 2026-08-02
**8/8 missing screens extracted + side-by-side verified** (each vs a live headless-Chrome baseline in `~/Developer/.playwright-mcp/baselines/sweep/`).

New frames by section:
- **Compendium 50:4** (+2): 193:6 Builder Jul 28 (x4720,y1250) · 196:9 HotSOS Flat List (x6260,y1250)
- **Upsells 50:5** (+1): 203:5 Manage Items V3 — LA/DP DSN-1707 (x4720,y1610)
- **AI Workflow 87:2** (+2): 206:4 Canary Copilot (x3180,y150) · 210:7 B&B Confirmation (x1690,y4000)
- **Digital Tipping 87:3** (+3): 199:6 Disbursement (x4720,y150) · 202:6 Tip Settings (x6260,y150) · 208:6 Resolve HRIS Mappings (x7800,y150)

Canvas changes: **section 87:3 widened 7000 → 9500** (nothing sits to its right; no children moved). No pre-existing frames touched anywhere.

Deviations for Marco:
1. **The "Builder Dashboard" frame 94:5 is NOT the Jul 28 builder** — it's the Apr 1 Compendium Editor (`?page=compendium`). The real Jul 28 card target is `hotsos-compendium-builder`, now captured as 193:6. Both are valid history; rename 94:5 if wanted.
2. **Canary Copilot (206:4) permission flag** — Marco previously dropped Copilot media from the site (internal UI, permission unsecured). It's staged in Figma only; his call before it goes anywhere public.
3. DSN-1707 frame: CONFIGURE STATE dev pill removed in Figma post-place (still visible in baseline PNG 05-upsells-ladp.png — expected mismatch, deliberate).
4. Minor render nits: 193:6 sidebar footer logo a few px lower; 206:4 message-rail text truncation differs slightly (fixed layout vs live ellipsis).
5. All frames fixed-layout w/ partial auto-layout (capture limitation, consistent with the other 64).

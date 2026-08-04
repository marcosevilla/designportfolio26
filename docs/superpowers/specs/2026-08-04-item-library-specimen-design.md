# Item Library specimen — design

**Date:** 2026-08-04
**Status:** Approved by Marco (loop, placement, row data); spec pending his review
**Specimen #3 of 6** in Marco's roadmap: Guest request flow ✅ → Order management ✅ → **Item library** → Item details → POS integration → Modifiers

## What it is

A self-contained interactive recreation of the F&B menu-management **Item Library** tab —
the staff-side CMS where hotels manage the reusable items that compose their menus. Third
DemoStage specimen, mounted on `/work/fb-ordering` directly below `OrderDashboardSpecimen`.

## Sources

- **Primary (geometry + style): Figma "Canary Polished Visuals" (`OclYC5ytIQc9HAuJMRXUaz`) frame `56:6548`** — the polished restyle of the Item Library screen (Inter, `#2858c4`, light sidebar). Marco's note: *"not a completely optimized design so it needs some updating"* — treat it as the base, with the deliberate deviations listed below (he approved the shape, not each item).
- Original capture: "Portfolio Aug 2026" (`O9tNG8DqYrpdJmrEGa7Io7`) frame `160:6` (old dark-sidebar style — reference only).
- Behavior: `~/Developer/msevilla-canary-prototypes-1` — `src/features/menu/MenuManagementPage.tsx` (item-library tab at 1193–1252, row component 189–298), `src/data/foodItems.ts`, `modals/DeleteItemModal.tsx`. Read-only; never pull or modify.

## Shell & chrome

- **1177px app frame + 36px window bar — identical outer geometry to `OrderDashboardSpecimen`** so the two stacked specimens read as one product. (Frame `56:6548` is 1440 wide; adapting to 1177 costs only side margin — its table is ~900px wide and fits the 961px content column.)
- **Sidebar is shared, not rebuilt:** frame `56:6548`'s sidebar is exactly specimen #2's (same "Days Inn & Suite… / 38653" property selector, same `NAV_SECTIONS`, `F&B Ordering` active, Settings at bottom). Extract `Sidebar` + `PROPERTY` + `NAV_SECTIONS` + their icons out of `OrderDashboardSpecimen.tsx` / `order-dashboard-data.ts` into a shared module both specimens import. No visual change to specimen #2.
- Content column, top to bottom: white top bar ("Statler New York ▾" selector + avatar chip), "Food and Beverage Ordering" page-title bar, **Menus / Item library / Settings** tab row (Item library active with underline; other tabs inert), "Item library" h2 + "Create new item" primary button, table.
- All styling from **`canary-polished-tokens.ts`** (shared infra — import, never re-transcribe). Icons: reuse existing MDI paths where they overlap; fetch any new glyphs (checkbox, image-placeholder, etc.) from Templarian/MaterialDesign-SVG — never hand-author paths.

## Table

Columns verbatim from the frame: checkbox · **Item** (40×40 thumb + name) · **POS Item Code** (em-dash when none) · **Menus** (up to 2 shown, then "+X more") · **Price** · **Availability** (toggle) + pencil + trash.

**Row data (Marco's call): the guest cart specimen's izakaya menu**, not frame `56:6548`'s Burrito/Brownie list — so the guest and staff F&B specimens depict one coherent restaurant, and the 40px thumbnails reuse the existing webps in `public/images/fb-ordering/specimen/` (zero new assets). ~7–8 rows to fit the shell; a subset carries POS codes in the frame's `MI-xxxxx` pattern, the rest show "—". Menus values adapted sensibly (Lunch, Dinner, Happy hour, Late night…). Exact rows chosen at implementation from what has usable thumbnails.

## Demo loop (~16s, key-remount to restart)

1. **Toggle:** cursor flips one item's availability off → switch animates, row dims → beat → flips it back on.
2. **Bulk-select reveal:** cursor checks two rows → floating red "Delete 2 items" pill slides in bottom-right → cursor unchecks both → pill slides out. Nothing is destroyed.
3. **Delete:** cursor taps trash on another item → confirmation modal (structure from the prototype's `DeleteItemModal`, restyled polished) → cursor confirms → modal closes, row collapses out, "Item deleted" toast → hold → loop remounts with the row restored.

Decision by cursor, consequence by system — same rhythm as specimen #2.

## Takeover (interactive) mode

- Fully functional: availability toggles, row checkboxes (bulk-delete pill actually deletes, with row-collapse animation), trash → modal → delete → toast.
- Inert but visually real: Menus/Settings tabs, pencil, "Create new item" — their destinations are future specimens (#4 Item details); revisit wiring a handoff when #4 ships.
- Reset restores the full table. Dark mode: page panel follows theme, product stays light (same as #2).

## Deliberate deviations from frame `56:6548` (log in code comments)

1. Row data swapped to the cart specimen's menu (Marco's call).
2. 1440 → 1177 shell + 36px window bar, matching specimen #2.
3. Per-row trash icons rest at `neutral[500]`, going red on hover — eight filled-red icons at rest is the heaviest thing on the frame and this is part of the "needs updating" license. (If Marco disagrees, a one-line color revert.)
4. Bulk-delete pill, confirmation modal, and toast aren't in the frame — behavior transcribed from the prototype, styled with polished tokens.
5. Tabs/pencil/create inert (see Takeover).

## Files

- `site/components/fb-showcase/ItemLibrarySpecimen.tsx` — self-contained; wraps **itself** in DemoStage (mount the specimen, not DemoStage).
- `site/components/fb-showcase/item-library-data.ts` — rows, tabs, script data.
- Shared extraction: sidebar + property + nav (+ shared icons) into e.g. `fb-showcase/admin-shell.tsx` / `admin-shell-data.ts`; `OrderDashboardSpecimen` updated to import them (no visual change).
- Mount: `site/app/work/fb-ordering/FBOrderingContent.tsx`, directly below `<OrderDashboardSpecimen />`.

## Verification bar (standard specimen checklist)

tsc clean · 0 console errors · two full demo loops with `dY: 0` (no scroll-anchor drift) · dark mode · 390px (no page overflow, both pan edges reachable) · fullscreen at true 1:1 · **specimen #2 pixel-unchanged after the sidebar extraction** (screenshot before/after).

## Out of scope

Search/filter/sort (don't exist in the prototype), the Menus and Settings tabs' content, Create-item flow, Edit Item page (specimen #4), modifier sets (specimen #6), any change to specimen #1/#2 beyond the invisible sidebar extraction.

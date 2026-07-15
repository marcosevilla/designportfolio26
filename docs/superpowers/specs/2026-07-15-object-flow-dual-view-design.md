# Object Flow Diagram: Dual View (System Composition / Guest Ordering Flow)

**Date:** 2026-07-15
**Component:** `site/components/fb-showcase/ObjectFlowDiagram.tsx` (+ embed in `FBOrderingContent.tsx`)
**Origin:** Feedback on the F&B case study diagram. The current diagram makes the
system claim ("author an item once, sell it everywhere"). Feedback item #1 asked
for the sequence re-ordered as the guest experiences it. Marco wants both,
switchable.

## Goal

One diagram, two readings of the same five-object model:

- **System composition** (current): `Items → Modifier groups → Menus → Ordering outlets` — how a hotel authors the catalog.
- **Guest ordering flow** (new): `Ordering outlets → Menus → Items → Modifier groups` — the order a guest meets the objects.

A segmented control above the diagram toggles views; a one-line editorial
caption under the control states each view's claim.

## Approach (approved: Approach A)

Single component, view-parameterized. The diagram is already fully data-driven
(`ITEM_MODS` / `ITEM_MENUS` / `MENU_OUTLETS`); each view derives its own column
order, edge set, and route legs from the same source data. No duplication of
the render or route engine.

### View config

`type ViewKey = "system" | "guest"`

| | system | guest |
|---|---|---|
| Column order (L→R) | items, mods, menus, outlets | outlets, menus, items, mods |
| Edge set | item→mod, mod→menu, menu→outlet | outlet→menu, menu→item, item→mod |
| Route legs | 1: item→mods (1–2 parallel dots) · 2: mods→menu · 3: menu→outlet | 1: outlet→menu · 2: menu→item · 3: item→mods (1–2 parallel dots) |
| Interactive column (hover/pin + idle demo tour) | Items | Outlets |

Note the guest edge set is **not** a plain reversal: guest view connects
`menu → item` directly (guest picks an item off a menu, then customizes), so
modifiers hang off the end of the chain. All three guest edge groups derive
from existing source data (`MENU_OUTLETS` reversed, `ITEM_MENUS` reversed,
`ITEM_MODS` as-is).

### Layout & morph

- Card `y` positions are column-scoped and identical in both views; only the
  column `x` changes. Cards and column headers are repositioned via group
  `transform: translate(x, y)` (refactor from per-element `x`/`y` attrs) so the
  switch **glides cards to their new columns** (~500ms ease).
- Connectors can't morph (different topology) — they **crossfade**: fade out
  200ms → view state swaps (cards glide) → fade in after cards settle (~350ms
  delay). Managed by a `connsVisible` flag + timeouts.
- Route engine resets on view change (effect already keyed on the engine
  anchor).

### Switch + captions

- HTML segmented control above the SVG (real `<button>`s, `aria-pressed`),
  mono 11px uppercase labels: `SYSTEM COMPOSITION` / `GUEST ORDERING FLOW`.
  Active = F&B accent (`#EF5A3C`).
- One-line caption under the control, swaps with view (no em dashes, house rule):
  - system: "How a hotel composes an order: author an item once, sell it everywhere."
  - guest: "The same five objects in the order a guest meets them: outlet, menu, item, customization."
- The existing static figure caption in `FBOrderingContent.tsx` (Club sandwich
  example) is removed; its job is absorbed by the per-view caption.
- `aria-label` on the diagram updates per view.

### Reduced motion

Unchanged contract: no dots/loops, first route lit, tiers apply. View switch is
an instant swap (no glide, no crossfade).

## Out of scope

- Connector/leg labels ("customized by", "appears on") — not what the lost
  "labels" referred to (confirmed: labels = per-view captions).
- Any copy pass beyond placeholder captions (Marco will edit).
- Mobile-specific layout changes (diagram keeps `min-w-[820px]` + scroll).

## Verification

- Both views animate entrance, demo tour, hover/pin, and route engine correctly.
- Switch mid-route doesn't strand accent state; engine restarts clean.
- Reduced motion shows static lit state in both views.
- `tsc --noEmit` clean; visual check on localhost + contact sheet if layout shifts.

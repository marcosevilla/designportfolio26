# Item Library Specimen Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build specimen #3 — an interactive, DemoStage-choreographed recreation of the F&B Item Library admin tab — mounted on `/work/fb-ordering` below `OrderDashboardSpecimen`.

**Architecture:** A self-contained React component (`ItemLibrarySpecimen`) that renders the polished admin shell (shared sidebar + window bar extracted from specimen #2), a table of menu items with working availability toggles / multi-select / delete-with-confirmation, and wraps itself in `DemoStage` with a ~16s scripted loop. All state lives in the specimen; DemoStage dispatches real clicks at `data-demo` targets.

**Tech Stack:** Next.js 16 (App Router), React inline styles with `canary-polished-tokens.ts`, framer-motion for row/modal/pill/toast animation, DemoStage wrapper, MDI icon paths.

**Spec:** `docs/superpowers/specs/2026-08-04-item-library-specimen-design.md`

## Global Constraints

- All npm/tsc commands run from `site/` — never the repo root.
- The PostToolUse hook runs `tsc --noEmit` after TS/TSX edits — fix errors before continuing.
- Product tokens come from `components/fb-showcase/canary-polished-tokens.ts` (`neutral`, `primary`, `danger`, `T`, `TYPE`, `W`, `RADIUS`, `ELEV`, `INTER`) — import, never re-transcribe. The product artifact keeps literal colors in dark mode; only the panel around it follows the theme.
- MDI icon paths must be fetched from `Templarian/MaterialDesign-SVG` (raw.githubusercontent.com), never hand-authored.
- Specimen pattern: the specimen component wraps **itself** in DemoStage; consumers mount `<ItemLibrarySpecimen />`, not DemoStage.
- Commit after every task (project safety rule).
- Verification screenshots of animated specimens: emulate `prefers-reduced-motion: reduce` — DemoStage then skips autoplay and renders a deterministic static state.
- Reference screenshots (already downloaded):
  - Polished source frame `56:6548`: `/private/tmp/claude-501/-Users-marcosevilla-Developer-portfolio/18f8f1a8-39aa-40be-84ba-860be7b9af49/scratchpad/item-library-polished-56-6548.png`
  - If missing, re-fetch: Figma file `OclYC5ytIQc9HAuJMRXUaz`, node `56:6548`, via `mcp__figma-official__get_screenshot`.
- Dev server: `cd site && npm run dev` → `http://localhost:3000/work/fb-ordering`. Localhost is never site-gated. If a per-study LockGate ever blocks the page, the unlock code is `miyagi`.

---

### Task 1: Extract the shared admin shell from specimen #2

Specimen #2 (`OrderDashboardSpecimen.tsx`) owns three things specimen #3 needs verbatim: the MDI icon registry, the `WindowChrome` bar, and the `Sidebar` (whose data — `PROPERTY`, `NAV_SECTIONS`, `ACTIVE_NAV` — matches frame `56:6548` exactly). Extract them without any visual change.

**Files:**
- Create: `site/components/fb-showcase/mdi-icons.ts` (renamed from `order-dashboard-icons.ts`, same content)
- Create: `site/components/fb-showcase/admin-shell.tsx`
- Modify: `site/components/fb-showcase/OrderDashboardSpecimen.tsx` (imports + delete moved components)
- Modify: `site/components/fb-showcase/order-dashboard-data.ts` (move `PROPERTY`, `NavItem`, `NAV_SECTIONS`, `ACTIVE_NAV` out)
- Delete: `site/components/fb-showcase/order-dashboard-icons.ts`

**Interfaces:**
- Consumes: existing `Sidebar`, `WindowChrome`, `Icon` in `OrderDashboardSpecimen.tsx`; `ICONS` in `order-dashboard-icons.ts`; `PROPERTY`/`NAV_SECTIONS`/`ACTIVE_NAV`/`NavItem` in `order-dashboard-data.ts`.
- Produces (later tasks rely on these exact names):
  - `mdi-icons.ts`: `export const ICONS = { … } as const;` (unchanged registry, new filename)
  - `admin-shell.tsx`: `export const NAV_W = 216;`, `export const PROPERTY = { name, short, id };`, `export function Icon({ path, size = 16, color = neutral[500] }): JSX element` (the 24×24-viewBox `fill` SVG helper moved from OrderDashboardSpecimen), `export function WindowChrome(): JSX element`, `export function Sidebar({ active = "F&B Ordering" }: { active?: string }): JSX element`

- [ ] **Step 1: Capture the before-baseline of specimen #2**

Start the dev server (`cd site && npm run dev`, leave running for the whole plan). With Playwright (`mcp__playwright__*`), set viewport 1440×900 and **emulate reduced motion** via `mcp__playwright__browser_run_code_unsafe` with `await page.emulateMedia({ reducedMotion: "reduce" })` — DemoStage then skips autoplay and renders deterministically. Navigate to `http://localhost:3000/work/fb-ordering`, scroll the OrderDashboard specimen into view, and take an element screenshot of its stage. Save as the "before" baseline in the session scratchpad (`order-dashboard-before.png`).

- [ ] **Step 2: Rename the icon registry**

`git mv site/components/fb-showcase/order-dashboard-icons.ts site/components/fb-showcase/mdi-icons.ts`. Update the header comment's first line to say it serves the fb-showcase admin specimens (plural). Update the import in `OrderDashboardSpecimen.tsx`:

```ts
import { ICONS } from "./mdi-icons";
```

(Confirm with `grep -rn "order-dashboard-icons" site/` → zero hits.)

- [ ] **Step 3: Create `admin-shell.tsx`**

Move — verbatim, no restyling — from `OrderDashboardSpecimen.tsx` / `order-dashboard-data.ts`:

```tsx
"use client";

/**
 * Shared admin shell for the fb-showcase staff-side specimens: the polished
 * window bar, sidebar, and MDI icon helper. Extracted verbatim from
 * OrderDashboardSpecimen (2026-08-04) when ItemLibrarySpecimen needed the
 * identical chrome — frame 56:6548's sidebar matches specimen #2's exactly.
 * Visual contract: NO style changes here without re-verifying BOTH specimens.
 */

import { neutral, RADIUS, TYPE, W } from "./canary-polished-tokens";
import { ICONS } from "./mdi-icons";

export const NAV_W = 216;

export const PROPERTY = {
  name: "Days Inn & Suites by Wyndham Wausau",
  short: "Days Inn & Suite…",
  id: "38653",
};

export type NavItem = { label: string; icon: string };

export const NAV_SECTIONS: NavItem[][] = [ /* moved verbatim */ ];

export function Icon({ path, size = 16, color = neutral[500] }: {
  path: string; size?: number; color?: string;
}) { /* moved verbatim from OrderDashboardSpecimen */ }

export function WindowChrome() { /* moved verbatim */ }

export function Sidebar({ active = "F&B Ordering" }: { active?: string }) {
  /* moved verbatim; replace the ACTIVE_NAV constant reference with the
     `active` prop (same default value, so #2 renders identically) */
}
```

In `OrderDashboardSpecimen.tsx`: delete the moved `Icon`, `WindowChrome`, `Sidebar` definitions and import them (plus `NAV_W`) from `./admin-shell`. In `order-dashboard-data.ts`: delete `PROPERTY`, `NavItem`, `NAV_SECTIONS`, `ACTIVE_NAV`; anything else in that file that referenced them now imports from `./admin-shell`. Keep `ICONS` imports pointing at `./mdi-icons`.

- [ ] **Step 4: Verify tsc + zero grep strays**

Run: `cd site && npx tsc --noEmit` → clean. `grep -rn "ACTIVE_NAV\|order-dashboard-icons" site/components/` → zero hits.

- [ ] **Step 5: Verify specimen #2 is pixel-unchanged**

Reload `http://localhost:3000/work/fb-ordering` (reduced motion still emulated), element-screenshot the OrderDashboard stage again (`order-dashboard-after.png`), and compare against the Step-1 baseline — open both and confirm no visible difference (layout, colors, sidebar). Also confirm 0 console errors on the page.

- [ ] **Step 6: Commit**

```bash
git add -A site/components/fb-showcase/
git commit -m "refactor: extract shared admin shell (sidebar, window bar, MDI icons) from OrderDashboardSpecimen"
```

---

### Task 2: Item Library data + new icon glyphs

**Files:**
- Create: `site/components/fb-showcase/item-library-data.ts`
- Modify: `site/components/fb-showcase/mdi-icons.ts` (add `pencil`, `trashCan`, `chevronDown`, `imageOff`)

**Interfaces:**
- Consumes: nothing new.
- Produces:
  - `mdi-icons.ts` gains keys `pencil`, `trashCan`, `chevronDown`, `imageOff` (24×24 MDI `d` strings).
  - `item-library-data.ts`:
    ```ts
    export type LibraryItem = {
      id: string;          // demo-target slug, e.g. "oysters"
      name: string;
      image: string;       // /images/fb-ordering/specimen/*.webp
      posCode: string | null;
      menus: string[];     // rendered as "A, B" or "A, B, + N more"
      price: number;       // dollars
    };
    export const LIBRARY_ITEMS: LibraryItem[];   // 8 rows
    export const LIBRARY_TABS: string[];         // ["Menus", "Item library", "Settings"]
    export function formatMenus(menus: string[]): string;
    ```

- [ ] **Step 1: Fetch the four new MDI paths**

Fetch each `d` from Templarian/MaterialDesign-SVG (branch `master`, folder `svg/`) — e.g.:

```bash
curl -s https://raw.githubusercontent.com/Templarian/MaterialDesign-SVG/master/svg/pencil.svg
curl -s https://raw.githubusercontent.com/Templarian/MaterialDesign-SVG/master/svg/trash-can-outline.svg
curl -s https://raw.githubusercontent.com/Templarian/MaterialDesign-SVG/master/svg/chevron-down.svg
curl -s https://raw.githubusercontent.com/Templarian/MaterialDesign-SVG/master/svg/image-off-outline.svg
```

Copy each `<path d="…">` verbatim into `mdi-icons.ts` as `pencil`, `trashCan`, `chevronDown`, `imageOff`. (`imageOff` is the fallback glyph if a thumbnail ever fails to load — the source frame's Croissant row shows this pattern.)

- [ ] **Step 2: Write `item-library-data.ts`**

```ts
/**
 * Data for the Item Library specimen (specimen #3).
 *
 * DELIBERATE DEVIATION from Figma frame 56:6548 (Marco's call, 2026-08-04):
 * rows are the guest cart specimen's izakaya menu — same restaurant as the
 * FnbCartSpecimen, reusing its committed webp thumbnails — not the frame's
 * Burrito/Brownie seed list. POS codes follow the frame's MI-xxxxx pattern;
 * most rows show "—" like the source data (only a handful carry codes).
 */

const IMG = "/images/fb-ordering/specimen";

export type LibraryItem = {
  id: string;
  name: string;
  image: string;
  posCode: string | null;
  menus: string[];
  price: number;
};

export const LIBRARY_ITEMS: LibraryItem[] = [
  { id: "yellowtail", name: "Yellowtail Sashimi Jalapeno", image: `${IMG}/yellowtail.webp`, posCode: "MI-10201", menus: ["Dinner", "Happy hour"], price: 36 },
  { id: "toro", name: "Bigeye and Bluefin Toro Tartare with Caviar", image: `${IMG}/toro-tartare.webp`, posCode: "MI-10304", menus: ["Dinner"], price: 44 },
  { id: "oysters", name: "Fresh Oysters (3pc)", image: `${IMG}/oysters.webp`, posCode: null, menus: ["Dinner", "Happy hour"], price: 19 },
  { id: "edamame", name: "Edamame with Yuzu Salt", image: `${IMG}/edamame.webp`, posCode: null, menus: ["Lunch", "Dinner", "Happy hour", "Late night"], price: 12 },
  { id: "tempura", name: "Rock Shrimp Tempura", image: `${IMG}/shrimp-tempura.webp`, posCode: "MI-10407", menus: ["Lunch", "Dinner"], price: 28 },
  { id: "black-cod", name: "Miso Marinated Black Cod", image: `${IMG}/black-cod.webp`, posCode: "MI-10502", menus: ["Dinner"], price: 52 },
  { id: "wagyu-burger", name: "Wagyu Burger with Truffle Fries", image: `${IMG}/wagyu-burger.webp`, posCode: null, menus: ["Lunch", "Dinner", "Late night"], price: 39 },
  { id: "sparkling", name: "Sparkling Water (750ml)", image: `${IMG}/sparkling-water.webp`, posCode: null, menus: ["Breakfast", "Lunch", "Dinner"], price: 9 },
];

export const LIBRARY_TABS = ["Menus", "Item library", "Settings"];

/** "Lunch, Dinner" · "Lunch, Dinner, + 2 more" — the frame shows max two names. */
export function formatMenus(menus: string[]): string {
  if (menus.length <= 2) return menus.join(", ");
  return `${menus[0]}, ${menus[1]}, + ${menus.length - 2} more`;
}
```

Prices are the **cart specimen's** (same restaurant story) — not `foodItems.ts`'s.

- [ ] **Step 3: Verify tsc**

Run: `cd site && npx tsc --noEmit` → clean.

- [ ] **Step 4: Commit**

```bash
git add site/components/fb-showcase/item-library-data.ts site/components/fb-showcase/mdi-icons.ts
git commit -m "feat: item library specimen data + shared MDI glyphs (pencil, trash, chevron, image-off)"
```

---

### Task 3: Static ItemLibrarySpecimen (shell + table, no interactions)

**Files:**
- Create: `site/components/fb-showcase/ItemLibrarySpecimen.tsx`
- Modify: `site/app/work/fb-ordering/FBOrderingContent.tsx` (temporary mount for visual dev — the permanent mount styling lands in Task 5)

**Interfaces:**
- Consumes: `Sidebar`, `WindowChrome`, `Icon`, `NAV_W`, `PROPERTY` from `./admin-shell`; `ICONS` from `./mdi-icons`; tokens from `./canary-polished-tokens`; `LIBRARY_ITEMS`, `LIBRARY_TABS`, `formatMenus`, `LibraryItem` from `./item-library-data`.
- Produces: `export default function ItemLibrarySpecimen()` (final export shape lands in Task 5; this task may export the inner `Library` directly for dev).

**Geometry (adapted from frame `56:6548` to the 1177 shell — deviation #2 in the spec):**

```ts
const APP_W = 1177;               // matches OrderDashboardSpecimen
const CHROME_H = 36;              // shared WindowChrome
const NAV_W = 216;                // from admin-shell
const CONTENT_W = APP_W - NAV_W;  // 961
const TOPBAR_H = 56;              // "Statler New York ▾" + avatar bar
const TITLE_H = 52;               // "Food and Beverage Ordering" (mirrors #2's HEADER_H)
const TABS_H = 56;                // tab row incl. underline
const TABLE_W = 900;              // centered in the 961 content column
const ROW_H = 72;                 // 40px thumb + 16px padding each side
const THUMB = 40;
/** checkbox · item · pos code · menus · price · availability */
const COLUMNS = "36px 1fr 128px 208px 96px 128px";
const APP_H = TOPBAR_H + TITLE_H + TABS_H + 64 /* heading row */ + 36 /* col headers */ + 8 * ROW_H + 20 /* bottom pad */; // 860
const SHELL_W = APP_W;
const SHELL_H = APP_H + CHROME_H; // 896
const EASE = [0.25, 0.46, 0.45, 0.94] as const;  // same easing family as #2
```

- [ ] **Step 1: Build the static component**

Structure (all inline styles from tokens, following `OrderDashboardSpecimen.tsx`'s idiom — section comments with `───` rules, primitives first):

```tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import {
  ELEV, neutral, primary, danger, RADIUS, TYPE, W,
} from "./canary-polished-tokens";
import { ICONS } from "./mdi-icons";
import { Icon, NAV_W, Sidebar, WindowChrome } from "./admin-shell";
import {
  formatMenus, LIBRARY_ITEMS, LIBRARY_TABS, type LibraryItem,
} from "./item-library-data";
```

Render tree for the static pass:

- Shell `div` — `width: SHELL_W, height: SHELL_H, borderRadius: RADIUS.lg, overflow: hidden, backgroundColor: neutral[0], border: 1px solid neutral[200], boxShadow: ELEV.lg, column flex` (copy of #2's shell) → `<WindowChrome />` → row flex (`flex: 1, minHeight: 0, position: relative, overflow: hidden`) → `<Sidebar />` + content column (`width: CONTENT_W`).
- **Top bar** (`height: TOPBAR_H, borderBottom: 1px solid neutral[100], paddingInline: 20, align center`): left — "Statler New York" (`TYPE.body`, `W.medium`, `neutral[900]`) + `<Icon path={ICONS.chevronDown} size={16} />`; right (`marginLeft: auto`) — 28px circle `div` (`backgroundColor: neutral[200], borderRadius: RADIUS.full`) + `chevronDown` icon.
- **Title bar** (`height: TITLE_H, borderBottom: 1px solid neutral[100], paddingInline: 20, align center`): `h2` "Food and Beverage Ordering" — `TYPE.bodyL`, `W.medium`, `neutral[900]`, `margin: 0` (identical spec to #2's header title).
- **Tab row** (centered `TABLE_W` column): for each of `LIBRARY_TABS`, a `button` (`TYPE.body`, active = "Item library": `color: primary[500]`, `fontWeight: W.medium`, 2px `primary[500]` bottom border; inactive: `neutral[600]`, transparent border, `cursor: default`). Inactive tabs get `data-inert` nothing — they simply have no onClick. Row has `borderBottom: 1px solid neutral[100]` spanning the table width, `gap: 24`.
- **Heading row** (`TABLE_W` wide, space-between, `paddingTop: 20`): `h3` "Item library" — `TYPE.titleS`, `W.semibold`, `neutral[900]`; primary button "Create new item" — `height: 36, paddingInline: 16, backgroundColor: primary[500], color: neutral[0], borderRadius: RADIUS.md, TYPE.body, W.medium`, no onClick (inert — destination is specimen #4).
- **Column headers** (CSS grid, `gridTemplateColumns: COLUMNS, height: 36, align center`): blank · ITEM · POS ITEM CODE · MENUS · PRICE · AVAILABILITY (right-aligned) — `TYPE.micro`, `W.medium`, `neutral[500]`, `textTransform: "uppercase"`.
- **Rows card** (`border: 1px solid neutral[200], borderRadius: RADIUS.md, overflow: hidden`): each row a grid on `COLUMNS`, `height: ROW_H`, `borderTop: 1px solid neutral[100]` (skip first), containing:
  - checkbox: 16×16 `div`, `border: 1.5px solid neutral[300], borderRadius: RADIUS.xs, backgroundColor: neutral[0]` (static for now)
  - item cell: `THUMB`×`THUMB` `next/image` (`borderRadius: RADIUS.md, objectFit: "cover"`) + name (`TYPE.body`, `W.medium`, `neutral[900]`), `gap: 12`
  - pos code: `TYPE.body`; code → `neutral[600]`, null → "—" in `neutral[400]`
  - menus: `formatMenus(item.menus)`, `TYPE.body`, `neutral[600]`
  - price: `$${price.toFixed(2)}`, `TYPE.body`, `neutral[900]`
  - availability cell (right-aligned flex, `gap: 12`): switch — 36×20 track (`borderRadius: RADIUS.full`, on: `primary[500]`, off: `neutral[300]`), 16px white knob (`translateX` 2→18, `transition: 160ms`); pencil `Icon` 18 `neutral[500]` (inert); trash `Icon` (`ICONS.trashCan`) 18 `neutral[500]` — **rest color is a deliberate deviation from the frame's red** (spec deviation #3).

Static state: `useState` only for `available: Record<string, boolean>` initialized all-true (toggle wiring lands in Task 4 but the switch renders from this state now).

- [ ] **Step 2: Temporary mount**

In `FBOrderingContent.tsx`, directly below `<OrderDashboardSpecimen />` (line ~94), temporarily add `<ItemLibrarySpecimen />` in the same wrapper pattern as its sibling (copy the sibling's surrounding block verbatim; final polish in Task 5).

- [ ] **Step 3: Verify tsc + visual against the frame**

`cd site && npx tsc --noEmit` → clean. In the browser (reduced motion emulated), screenshot the new specimen and eyeball against `item-library-polished-56-6548.png`: same chrome order (topbar / title / tabs / heading / table), same column set, active-tab underline, toggle color `#2858c4`, row rhythm ~72px. Confirm 0 console errors and that all 8 thumbnails load (no 404s in the network log).

- [ ] **Step 4: Commit**

```bash
git add site/components/fb-showcase/ItemLibrarySpecimen.tsx site/app/work/fb-ordering/FBOrderingContent.tsx
git commit -m "feat: static Item Library specimen (shell, tabs, table) on fb-ordering"
```

---

### Task 4: Interactions — toggle, multi-select + bulk pill, delete modal + toast

**Files:**
- Modify: `site/components/fb-showcase/ItemLibrarySpecimen.tsx`

**Interfaces:**
- Consumes: Task 3's component; `AnimatePresence`, `motion` from `framer-motion`.
- Produces: `data-demo` targets used by Task 5's script — `toggle-<id>`, `check-<id>`, `trash-<id>`, `modal-cancel`, `modal-confirm` (ids from `LIBRARY_ITEMS`, e.g. `toggle-oysters`, `check-edamame`, `trash-sparkling`).

- [ ] **Step 1: State + handlers**

Extend the react import to `import { useEffect, useRef, useState } from "react";` and add `import { AnimatePresence, motion } from "framer-motion";`.

```tsx
const [items, setItems] = useState<LibraryItem[]>(LIBRARY_ITEMS);
const [available, setAvailable] = useState<Record<string, boolean>>(
  () => Object.fromEntries(LIBRARY_ITEMS.map((i) => [i.id, true])),
);
const [selected, setSelected] = useState<Set<string>>(new Set());
const [pendingDelete, setPendingDelete] = useState<LibraryItem | null>(null);
const [toast, setToast] = useState<string | null>(null);
const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

const toggle = (id: string) =>
  setAvailable((prev) => ({ ...prev, [id]: !prev[id] }));

const toggleSelect = (id: string) =>
  setSelected((prev) => {
    const next = new Set(prev);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    return next;
  });

const showToast = (msg: string) => {
  setToast(msg);
  if (toastTimer.current) clearTimeout(toastTimer.current);
  toastTimer.current = setTimeout(() => setToast(null), 2400);
};

const confirmDelete = () => {
  if (!pendingDelete) return;
  const doomed = pendingDelete;
  setPendingDelete(null);
  setItems((prev) => prev.filter((i) => i.id !== doomed.id));
  setSelected((prev) => {
    const next = new Set(prev);
    next.delete(doomed.id);
    return next;
  });
  showToast("Item deleted");
};

const bulkDelete = () => {
  const n = selected.size;
  setItems((prev) => prev.filter((i) => !selected.has(i.id)));
  setSelected(new Set());
  showToast(`${n} item${n === 1 ? "" : "s"} deleted`);
};

useEffect(() => () => {
  if (toastTimer.current) clearTimeout(toastTimer.current);
}, []);
```

Buttons must be real `<button type="button">` elements (DemoStage dispatches real clicks): switch → `data-demo={`toggle-${item.id}`}`, checkbox → `data-demo={`check-${item.id}`}`, trash → `data-demo={`trash-${item.id}`}`. Checked checkbox renders `primary[500]` fill + white MDI check (reuse the `checkCircle`-style inline check path from #2's patterns or a plain CSS checkmark — keep it a styled div inside the button). Unavailable rows: name/menus/price cells drop to `opacity: 0.45` (`transition: opacity 200ms`); thumbnail gets `filter: grayscale(1)`; the switch itself stays full-opacity.

- [ ] **Step 2: Row exit animation**

Wrap the row list in `<AnimatePresence initial={false}>`; each row becomes `motion.div` with `layout`, `exit={{ height: 0, opacity: 0 }}`, `transition={{ duration: 0.38, ease: EASE }}`, `style={{ overflow: "hidden" }}` — the same collapse grammar as #2's approve beat.

- [ ] **Step 3: Bulk pill**

Floating within the shell's positioned row-flex container (`position: absolute, right: 24, bottom: 20`), rendered via `AnimatePresence` when `selected.size > 0`:

```tsx
<motion.button
  type="button"
  data-demo="bulk-delete"
  onClick={bulkDelete}
  initial={{ y: 16, opacity: 0 }}
  animate={{ y: 0, opacity: 1 }}
  exit={{ y: 16, opacity: 0 }}
  transition={{ duration: 0.28, ease: EASE }}
  style={{
    height: 40, paddingInline: 20, borderRadius: RADIUS.full,
    backgroundColor: danger[500], color: neutral[0],
    ...TYPE.body, fontWeight: W.medium, border: "none",
    boxShadow: ELEV.lg, cursor: "pointer",
  }}
>
  Delete {selected.size} item{selected.size === 1 ? "" : "s"}
</motion.button>
```

- [ ] **Step 4: Delete confirmation modal**

Rendered inside the shell (absolute overlay over the app area, NOT a body portal — the whole shell scales inside DemoStage): scrim `position: absolute, inset: 0, backgroundColor: "rgba(19,24,34,0.4)"` (fade in 200ms), card centered — `width: 400, backgroundColor: neutral[0], borderRadius: RADIUS.lg, boxShadow: ELEV.overlay, padding: 24`, `motion.div` `initial={{ scale: 0.95, opacity: 0 }}`. Content:
- Title "Delete item?" — `TYPE.bodyL`, `W.semibold`, `neutral[900]`
- Body — `TYPE.body`, `neutral[600]`, `marginTop: 8`: `Remove “{pendingDelete.name}” from your item library? It will also be removed from any menus that use it.`
- Button row (`marginTop: 20, gap: 8, justify flex-end`): Cancel — ghost (`border: 1px solid neutral[200]`, `neutral[700]` text, `data-demo="modal-cancel"`, onClick `() => setPendingDelete(null)`); Delete — solid `danger[500]`, white text, `data-demo="modal-confirm"`, onClick `confirmDelete`. Both `height: 36, paddingInline: 16, borderRadius: RADIUS.md`.

Structure mirrors the prototype's `DeleteItemModal` (confirm-before-destroy + toast), restyled with polished tokens (spec deviation #4).

- [ ] **Step 5: Toast**

`AnimatePresence` + `motion.div` at `position: absolute, bottom: 20, left: "50%", x: "-50%"`, `initial={{ y: 12, opacity: 0 }}` → pill: `backgroundColor: neutral[800], color: neutral[0], TYPE.body, paddingInline: 16, height: 36, borderRadius: RADIUS.md, boxShadow: ELEV.lg`, text from `toast` state.

- [ ] **Step 6: Verify interactions by hand**

tsc clean. In the browser in takeover mode (hover the stage → click "Interact with flow" — or reduced-motion emulation which starts interactive): toggle Oysters off (row dims, thumb grayscales) and back on; check two rows → pill appears with correct count → uncheck → pill leaves; trash Sparkling Water → modal → Cancel keeps it → trash again → Delete → row collapses, toast shows, no layout jump in the page (check `window.scrollY` stable). 0 console errors.

- [ ] **Step 7: Commit**

```bash
git add site/components/fb-showcase/ItemLibrarySpecimen.tsx
git commit -m "feat: item library interactions — availability toggle, multi-select bulk pill, delete modal + toast"
```

---

### Task 5: DemoStage choreography + final mount

**Files:**
- Modify: `site/components/fb-showcase/ItemLibrarySpecimen.tsx` (script + DemoStage wrap)
- Modify: `site/app/work/fb-ordering/FBOrderingContent.tsx` (finalize mount)

**Interfaces:**
- Consumes: `DemoStage`, `type DemoStep` from `@/components/DemoStage`; `MotionConfig` from `framer-motion`; Task 4's `data-demo` targets.
- Produces: `export default function ItemLibrarySpecimen()` — the only export consumers use.

- [ ] **Step 1: Script + wrap**

Mirror #2's tail structure exactly — inner app component (`Library`), script const, default export wrapping in `MotionConfig` + `DemoStage`:

```tsx
/**
 * ~16s loop (Marco's beats, 2026-08-04): availability off/on → bulk-select
 * reveal (no destruction) → single delete with confirm + toast. `after` pads
 * cover the switch transition (160ms), pill slide (280ms), modal enter
 * (200ms), row collapse (380ms) + toast (2.4s).
 */
const LIBRARY_DEMO_SCRIPT: DemoStep[] = [
  { type: "wait", ms: 600 },
  { type: "tap", target: "toggle-oysters", after: 1500 },  // off — row dims
  { type: "tap", target: "toggle-oysters", after: 1100 },  // back on
  { type: "tap", target: "check-edamame", after: 900 },    // pill slides in
  { type: "tap", target: "check-wagyu-burger", after: 1400 }, // "Delete 2 items"
  { type: "tap", target: "check-edamame", after: 700 },    // count drops to 1
  { type: "tap", target: "check-wagyu-burger", after: 1100 }, // pill slides out
  { type: "tap", target: "trash-sparkling", after: 1300 }, // modal in
  { type: "tap", target: "modal-confirm", after: 900 },    // collapse + toast
  { type: "wait", ms: 2600 },                              // toast reads, loop
];

export default function ItemLibrarySpecimen() {
  return (
    <MotionConfig reducedMotion="user">
      <DemoStage
        ariaLabel="Demonstration of the staff item-library management screen"
        script={LIBRARY_DEMO_SCRIPT}
        stageWidth={SHELL_W}
        stageHeight={SHELL_H}
        childRadius={RADIUS.lg}
      >
        <Library />
      </DemoStage>
    </MotionConfig>
  );
}
```

- [ ] **Step 2: Finalize the mount**

In `FBOrderingContent.tsx`, make the `<ItemLibrarySpecimen />` block match its `<OrderDashboardSpecimen />` sibling's exact wrapper (spacing, any caption/label the sibling has). If the sibling has a caption line, write this one as: "Item library — the staff-side catalog behind every menu." (Marco can rewrite in the inline editor.)

- [ ] **Step 3: Watch two full loops**

tsc clean. Reload without reduced-motion. Record `scrollY` before, watch two complete loops (~32s), confirm: every beat lands (toggle, pill in/out with counts 1→2→1→0, modal, collapse, toast), loop remount restores all 8 rows, `dY: 0` scroll drift, 0 console errors.

- [ ] **Step 4: Commit**

```bash
git add site/components/fb-showcase/ItemLibrarySpecimen.tsx site/app/work/fb-ordering/FBOrderingContent.tsx
git commit -m "feat: choreographed demo loop for Item Library specimen (specimen #3)"
```

---

### Task 6: Full verification bar + docs

**Files:**
- Modify: `docs/CURRENT-STATE.md` (new top entry)
- Modify: `.claude/rules/specimens.md` (add ItemLibrarySpecimen to "Existing specimens" + note admin-shell extraction)

- [ ] **Step 1: Run the standard specimen checklist** (from `.claude/rules/specimens.md`)

1. `cd site && npx tsc --noEmit` → clean.
2. Two full demo loops with `dY: 0` (re-verify after any fix).
3. Dark mode (seed theme keys or use the site toggle): page panel follows theme, specimen product stays light; sidebar/table colors literal.
4. 390px viewport: no page horizontal overflow; the stage pans and BOTH pan edges are reachable (left edge of sidebar, right edge of availability column).
5. Fullscreen: opens at true 1:1 or viewport-capped scale, demo restarts, Esc + scrim + X all close, body scroll locked while open.
6. 0 console errors across all of the above.
7. Specimen #2 directly above still runs its own loop cleanly (both specimens animate on one page — confirm no interference, and note DemoStage self-pauses off-screen via IntersectionObserver, so scroll each into view separately).

- [ ] **Step 2: Update docs**

`docs/CURRENT-STATE.md`: new top entry — specimen #3 shipped (files, loop beats, deviations incl. trash-at-rest color and the admin-shell extraction), specimen #4 queued (frame `57:8145`, outlet editor with live preview — NOT the prototype's EditItemPage). `.claude/rules/specimens.md`: add `ItemLibrarySpecimen.tsx` + `item-library-data.ts` to Existing specimens; note `admin-shell.tsx` + `mdi-icons.ts` are shared by both staff-side specimens (visual contract: change = re-verify both).

- [ ] **Step 3: Commit**

```bash
git add docs/CURRENT-STATE.md .claude/rules/specimens.md
git commit -m "docs: log Item Library specimen session; specimens rule updated for shared admin shell"
```

**Deploy is NOT part of this plan** — Marco reviews the specimen locally first (per his standing preference to eyeball before ship). Offer `/ship` when he approves.

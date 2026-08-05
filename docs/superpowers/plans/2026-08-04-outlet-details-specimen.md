# Outlet Details Specimen (#4) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the fourth DemoStage specimen — the F&B outlet-details editor ("The Lodge Restaurant") with a live guest-phone preview that mirrors edits in real time — and land the batched admin-shell chores from specimen #3's review.

**Architecture:** A self-contained `OutletDetailsSpecimen` component (form column + phone preview, all local state) that wraps itself in `DemoStage`, following the exact shape of `ItemLibrarySpecimen`. One small backwards-compatible change to `DemoStage.typeInto` enables append-style typing. Spec: `docs/superpowers/specs/2026-08-04-outlet-details-specimen-design.md`.

**Tech Stack:** Next.js 16 App Router, React 18, framer-motion, inline styles from `canary-polished-tokens.ts`. No test framework exists in this repo — verification is `tsc --noEmit` (runs automatically via PostToolUse hook after TS edits) + browser checks with playwright-core.

## Global Constraints

- All commands run from `site/` (`cd site`), never the repo root.
- Source frame: `57:8145` in Canary Polished Visuals (`OclYC5ytIQc9HAuJMRXUaz`). Copy is verbatim from the frame EXCEPT: preview email is `dining@thelodgeresort.com` (Marco's ruling — the frame's `dining@savannahsunset.com` is a leftover from another property).
- Import tokens from `./canary-polished-tokens` (`neutral`, `primary`, `RADIUS`, `TYPE`, `W`, `ELEV`); never re-transcribe values.
- MDI icon paths are fetched from `Templarian/MaterialDesign-SVG` on GitHub — NEVER hand-authored.
- Specimen constraints (from `.claude/rules/specimens.md`): all state local `useState`/`useRef` (loop is a key-remount); fixed pixel geometry matching `stageWidth`/`stageHeight`; no `position: fixed` inside the specimen; never call `.focus()` outside DemoStage's script-focus flag; script grammar is only `tap`/`type`/`wait`.
- `admin-shell.tsx` + `mdi-icons.ts` + `DemoStage.tsx` are SHARED — any edit requires re-verifying the specimens that consume them (Task 7).
- The PostToolUse hook runs `tsc --noEmit` after every TS/TSX edit — fix reported errors before continuing.
- Geometry constants (locked in this plan): `APP_W = 1177`, `NAV_W = 216` (import), `CONTENT_W = 961`, `HEADER_H = 64`, `FORM_W = 500`, `PHONE_W = 370`, `APP_H = 982`, `SHELL_H = APP_H + CHROME_H = 1018`.
- Commit after every task. Never commit unrelated dirty files.

---

### Task 1: DemoStage typing upgrade (prefix-aware + `charMs`)

**Files:**
- Modify: `site/components/DemoStage.tsx:39-42` (DemoStep type), `:433-452` (typeInto), `:499-505` (call site)

**Interfaces:**
- Produces: `DemoStep` type step gains optional `charMs?: number` (per-keystroke delay, default 120). `typeInto` starts typing after the element's current value when that value is a prefix of `text`; otherwise behavior is unchanged (types from scratch). Task 6's script relies on both.

- [ ] **Step 1: Extend the DemoStep type**

Replace line 41:

```ts
  | { type: "type"; target: string; text: string; charMs?: number; after?: number }
```

- [ ] **Step 2: Make typeInto prefix-aware with configurable speed**

Replace the `typeInto` function (lines 433–452) with:

```ts
  const typeInto = async (
    el: HTMLInputElement | HTMLTextAreaElement,
    text: string,
    charMs: number,
    cancelled: () => boolean,
  ) => {
    const proto =
      el instanceof HTMLTextAreaElement
        ? HTMLTextAreaElement.prototype
        : HTMLInputElement.prototype;
    const setValue = Object.getOwnPropertyDescriptor(proto, "value")!.set!;
    scriptFocusRef.current = true;
    el.focus({ preventScroll: true });
    scriptFocusRef.current = false;
    // Append mode: when the field already holds a prefix of the target text
    // (e.g. a pre-filled description the script extends), start after it
    // instead of retyping the whole value.
    const start = text.startsWith(el.value) ? el.value.length + 1 : 1;
    for (let i = start; i <= text.length; i++) {
      if (cancelled()) return;
      setValue.call(el, text.slice(0, i));
      el.dispatchEvent(new Event("input", { bubbles: true }));
      await sleep(charMs);
    }
  };
```

- [ ] **Step 3: Thread charMs through the call site**

In `playScript` (around line 500), replace the `typeInto` call:

```ts
        } else {
          await typeInto(
            el as HTMLInputElement | HTMLTextAreaElement,
            step.text,
            step.charMs ?? 120,
            cancelled,
          );
        }
```

- [ ] **Step 4: Verify tsc + cart typing regression**

The hook runs tsc on save; confirm no errors. Then with the dev server running (`cd site && npm run dev`), load `http://localhost:3000/work/fb-ordering`, watch the FIRST specimen (guest cart) through its loop and confirm the room-number step still types "412" into the empty field (empty string is a prefix of everything → `start = 1`, unchanged behavior).

- [ ] **Step 5: Commit**

```bash
git add site/components/DemoStage.tsx
git commit -m "feat: prefix-aware typing + per-step charMs in DemoStage"
```

---

### Task 2: Batched admin-shell chores from specimen #3's review

**Files:**
- Modify: `site/components/fb-showcase/admin-shell.tsx` (export CHROME_H, use it in WindowChrome)
- Modify: `site/components/fb-showcase/OrderDashboardSpecimen.tsx:42` (consume export)
- Modify: `site/components/fb-showcase/ItemLibrarySpecimen.tsx:35` (consume export), plus aria-labels, imageOff fallback, deviation comment

**Interfaces:**
- Produces: `export const CHROME_H = 36` from `admin-shell.tsx` — Task 4 imports it.

- [ ] **Step 1: Export CHROME_H from admin-shell and use it**

In `admin-shell.tsx`, below `export const NAV_W = 216;` add:

```ts
/** WindowChrome bar height — shared by every staff-side shell height calc. */
export const CHROME_H = 36;
```

In `WindowChrome`'s outer div style, replace `height: 36,` with `height: CHROME_H,`.

- [ ] **Step 2: Consume the export in both staff specimens**

In `OrderDashboardSpecimen.tsx`: delete line 42 (`const CHROME_H = 36; ...`) and add `CHROME_H` to the existing `./admin-shell` import. Keep the comment if it moves naturally onto the import.

In `ItemLibrarySpecimen.tsx`: delete line 35 (`const CHROME_H = 36; // shared WindowChrome`) and add `CHROME_H` to the existing `./admin-shell` import (line 10).

- [ ] **Step 3: Aria-labels on ItemLibrarySpecimen's icon-only controls**

In `ItemLibrarySpecimen.tsx`:
- `Checkbox` button: add `aria-label={\`Select ${itemId}\`}` — but the component only receives `itemId`; use it: `aria-label={\`Select ${itemId.replace(/-/g, " ")}\`}`.
- `AvailabilitySwitch` button: add `aria-label={\`Toggle availability for ${itemId.replace(/-/g, " ")}\`}`.
- The trash-icon delete button (search for `data-demo={\`trash-` in the row component): add `aria-label={\`Delete ${item.name}\`}` (the row scope has the full item).

- [ ] **Step 4: imageOff onError fallback + deviation comment**

In `ItemLibrarySpecimen.tsx`, find the row thumbnail `<img>` (40px, `THUMB`). Give it an error fallback: add local state to the row component (`const [imgFailed, setImgFailed] = useState(false);`) and render, when `imgFailed`, a 40×40 div (`backgroundColor: neutral[100]`, `borderRadius: RADIUS.sm`, flex-centered) containing `<Icon path={ICONS.imageOff} size={18} color={neutral[400]} />` instead of the img; on the img set `onError={() => setImgFailed(true)}`.

Extend the file's top deviation comment with:

```
 * 4. Thumbnails are plain <img>, not next/image — the site ships
 *    images.unoptimized anyway, and next/image's wrapper span fights the
 *    fixed 40px table-cell geometry. onError falls back to ICONS.imageOff.
```

- [ ] **Step 5: Verify both staff specimens render identically**

tsc via hook. In the browser at `/work/fb-ordering`, scroll through specimens #2 and #3: WindowChrome unchanged (36px bar), item-library rows show thumbnails (not fallbacks), toggles/checkboxes/trash all still demo correctly through one loop each.

- [ ] **Step 6: Commit**

```bash
git add site/components/fb-showcase/admin-shell.tsx site/components/fb-showcase/OrderDashboardSpecimen.tsx site/components/fb-showcase/ItemLibrarySpecimen.tsx
git commit -m "refactor: shared CHROME_H export, a11y labels, imageOff fallback (specimen #3 review batch)"
```

---

### Task 3: New MDI icons + outlet data file

**Files:**
- Modify: `site/components/fb-showcase/mdi-icons.ts` (add `imagePlus`, `chevronRight`)
- Create: `site/components/fb-showcase/outlet-details-data.ts`

**Interfaces:**
- Produces: `ICONS.imagePlus`, `ICONS.chevronRight`; from the data file: `OUTLET` (field seed values), `TYPED_SENTENCE`, `FULL_DESCRIPTION`, `PREVIEW` (static preview copy), `HERO_SRC`.

- [ ] **Step 1: Fetch the two new MDI paths (never hand-author)**

```bash
curl -s https://raw.githubusercontent.com/Templarian/MaterialDesign-SVG/master/svg/image-plus.svg
curl -s https://raw.githubusercontent.com/Templarian/MaterialDesign-SVG/master/svg/chevron-right.svg
```

Copy each `<path d="...">` value verbatim into `mdi-icons.ts` as `imagePlus:` and `chevronRight:`, keeping the file's existing key style and alphabetical-ish grouping. If a curl 404s, list candidates with the GitHub API (`https://api.github.com/repos/Templarian/MaterialDesign-SVG/contents/svg?per_page=100` is paginated — prefer guessing close names like `chevron-right.svg` first; both names above are canonical MDI and should exist).

- [ ] **Step 2: Write the data file**

Create `site/components/fb-showcase/outlet-details-data.ts`:

```ts
/**
 * Copy for the outlet-details specimen, transcribed verbatim from Figma
 * frame 57:8145 (Canary Polished Visuals) — except the preview email,
 * which the frame left as another property's address (Marco's ruling,
 * 2026-08-04: fix to match the Lodge).
 */

/** The sentence the demo types. Field starts without it; typing it lands the
 *  description at exactly the frame's 186/500. */
export const TYPED_SENTENCE =
  " Complimentary breakfast included with your stay.";

export const BASE_DESCRIPTION =
  "Farm-to-table dining in the heart of the lodge. Serving breakfast, lunch, and dinner with locally sourced ingredients and seasonal menus.";

export const FULL_DESCRIPTION = BASE_DESCRIPTION + TYPED_SENTENCE;

export const OUTLET = {
  title: "The Lodge Restaurant",
  type: "Restaurant",
  address: "Main Lodge, Ground Floor",
  website: "http://example.com",
  phone: "+1 (555) 234-5678",
};

export const PREVIEW = {
  cta: "Order Food",
  email: "dining@thelodgeresort.com",
  language: "English",
  legal: "Privacy Policy • Terms & Conditions",
  poweredBy: "Powered by Canary Technologies",
  noImage: "No image available",
};

export const DESCRIPTION_MAX = 500;

/** Reused cart-specimen asset (900×460) — the "uploaded" photo. */
export const HERO_SRC = "/images/fb-ordering/specimen/info-hero.webp";
```

(Character-count check, already verified: `BASE_DESCRIPTION.length === 137`, `FULL_DESCRIPTION.length === 186` — matches the frame's `186/500`. The frame's Website text NODE says "Main Lodge, Ground Floor" but that's stale layer data; the RENDER shows `http://example.com`, which wins.)

- [ ] **Step 3: Verify + commit**

tsc via hook (a quick `node -e "const {FULL_DESCRIPTION}=...;"` isn't possible on TS — instead trust the counts above, they were hand-verified against the frame).

```bash
git add site/components/fb-showcase/mdi-icons.ts site/components/fb-showcase/outlet-details-data.ts
git commit -m "feat: outlet-details specimen data + imagePlus/chevronRight MDI glyphs"
```

---

### Task 4: Static specimen — shell, top bar, form column

**Files:**
- Create: `site/components/fb-showcase/OutletDetailsSpecimen.tsx` (shell + form; preview and choreography come in Tasks 5–6)

**Interfaces:**
- Consumes: `CHROME_H`, `NAV_W`, `Sidebar`, `WindowChrome`, `Icon` from `./admin-shell`; `ICONS` from `./mdi-icons`; data from `./outlet-details-data`; tokens.
- Produces: internal component `Editor` (the app), state hooks `title/type/description/address/website/phone` as controlled inputs, a reusable `Field` sub-component, and `data-demo="field-description"` + `data-demo="publish"` targets. Exports default `OutletDetailsSpecimen` (DemoStage wrap arrives in Task 6 — for now export the bare `Editor` in a plain fixed-size div so it can be eyeballed).

- [ ] **Step 1: Scaffold the file with geometry constants and the Field primitive**

```tsx
"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion, MotionConfig } from "framer-motion";
import DemoStage, { type DemoStep } from "@/components/DemoStage";
import { ELEV, neutral, primary, RADIUS, TYPE, W } from "./canary-polished-tokens";
import { ICONS } from "./mdi-icons";
import { CHROME_H, Icon, NAV_W, Sidebar, WindowChrome } from "./admin-shell";
import {
  BASE_DESCRIPTION, DESCRIPTION_MAX, HERO_SRC, OUTLET, PREVIEW,
} from "./outlet-details-data";

/**
 * Canary's outlet-details editor — the F&B CMS screen where staff describe a
 * dining outlet, with a live guest-phone preview mirroring every edit.
 * Recreated from Figma frame `57:8145` (Canary Polished Visuals) at the
 * shared 1177px staff shell. Interactive: all six text fields are controlled
 * inputs mirrored into the preview (title, description, phone render there);
 * the photo dropzone toggles an "uploaded" hero; Publish fires a loading
 * beat + toast. Sidebar, breadcrumb, Translate, Add Hours stay inert.
 *
 * Deliberate deviations from the frame (Marco's rulings, 2026-08-04):
 * 1. Preview email is dining@thelodgeresort.com — the frame's
 *    dining@savannahsunset.com is a leftover from another property.
 * 2. Geometry adapted from the frame's 1476px canvas to the shared 1177px
 *    shell (form 582→500, preview region compressed; phone stays 370).
 * 3. The "uploaded" photo reuses the cart specimen's info-hero.webp —
 *    no photo exists in the frame ("No image available" is its point).
 * 4. Plain <img>, not next/image — images.unoptimized is on site-wide and
 *    the fixed-geometry shell doesn't want next/image's wrapper.
 * 5. The frame's phone-country flag (blue/white/red vertical bars) is kept
 *    verbatim even though it reads French against a +1 number.
 */

// ─── Geometry (adapted from frame 57:8145 to the 1177 shell) ──────────────

const APP_W = 1177; // matches the other staff specimens
const CONTENT_W = APP_W - NAV_W; // 961
const HEADER_H = 64; // frame: 73, compressed with the shell
const FORM_W = 500; // frame: 582 in a wider canvas
const FORM_X = 24;
const PHONE_W = 370; // frame-exact — keeps preview type at token sizes
const APP_H = 982; // header 64 + form stack 898 + 20 bottom pad
const SHELL_W = APP_W;
const SHELL_H = APP_H + CHROME_H; // 1018

const EASE = [0.25, 0.46, 0.45, 0.94] as const;
```

- [ ] **Step 2: Build the Field primitive**

One component renders five of the six rows (Description and Phone are special-cased):

```tsx
function Field({
  label, en, value, onChange, demo,
}: {
  label: string;
  en?: boolean;
  value: string;
  onChange: (v: string) => void;
  demo?: string;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <span style={{ ...TYPE.body, fontWeight: W.medium, color: neutral[800] }}>{label}</span>
        {en && <EnChip />}
      </div>
      <input
        type="text"
        value={value}
        data-demo={demo}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          height: 38,
          paddingInline: 13,
          borderRadius: RADIUS.md,
          border: `1px solid ${focused ? primary[500] : neutral[300]}`,
          outline: "none",
          backgroundColor: neutral[0],
          ...TYPE.body,
          color: neutral[900],
          width: "100%",
          boxSizing: "border-box",
        }}
      />
    </div>
  );
}

function EnChip() {
  return (
    <span
      style={{
        ...TYPE.micro,
        fontWeight: W.medium,
        color: neutral[600],
        backgroundColor: neutral[100],
        borderRadius: RADIUS.sm,
        padding: "2px 4px",
      }}
    >
      EN
    </span>
  );
}
```

- [ ] **Step 3: Build the Editor component — state + top bar + form column**

State (all local — the loop is a key-remount):

```tsx
function Editor() {
  const [title, setTitle] = useState(OUTLET.title);
  const [type, setType] = useState(OUTLET.type);
  const [description, setDescription] = useState(BASE_DESCRIPTION);
  const [address, setAddress] = useState(OUTLET.address);
  const [website, setWebsite] = useState(OUTLET.website);
  const [phone, setPhone] = useState(OUTLET.phone);
  const [photo, setPhoto] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [descFocused, setDescFocused] = useState(false);
  ...
```

Shell composition mirrors `ItemLibrarySpecimen.tsx:356-383` exactly: outer div (SHELL_W × SHELL_H, `RADIUS.lg`, overflow hidden, `neutral[0]` bg, `1px neutral[200]` border, `ELEV.lg` shadow, flex column) → `<WindowChrome />` → flex row (`flex: 1, minHeight: 0, position: "relative", overflow: "hidden"`) → `<Sidebar />` + content column (`width: CONTENT_W`).

Top bar (height HEADER_H, flexShrink 0, borderBottom `1px solid ${neutral[100]}`, paddingInline 24, flex, alignItems center):
- Left: `<span style={{...TYPE.body, color: neutral[500]}}>Home</span>` then 12px gap then `<span style={{...TYPE.body, fontWeight: W.medium, color: neutral[900]}}>{title}</span>` (breadcrumb tail mirrors the live title — free delight).
- Right (`marginLeft: "auto"`, flex, gap 12): "Translate" as a borderless text button (`TYPE.body`, `neutral[700]`, cursor default, inert) and the Publish button:

```tsx
<button
  type="button"
  data-demo="publish"
  onClick={publish}
  style={{
    height: 36,
    paddingInline: 16,
    borderRadius: RADIUS.md,
    border: "none",
    backgroundColor: primary[500],
    color: neutral[0],
    ...TYPE.body,
    fontWeight: W.medium,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: 8,
  }}
>
  {publishing && <Spinner />}
  {publishing ? "Publishing…" : "Publish"}
</button>
```

`Spinner` is a 12px framer-motion span: `<motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }} style={{ width: 12, height: 12, borderRadius: RADIUS.full, border: \`2px solid rgba(255,255,255,0.35)\`, borderTopColor: neutral[0], display: "inline-block" }} />`.

`publish` handler (used by Task 6's script; timer must live in a ref so remount cleans up):

```tsx
const publishTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
const publish = () => {
  if (publishing) return;
  setPublishing(true);
  publishTimer.current = setTimeout(() => {
    setPublishing(false);
    setToast("Changes published");
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2400);
  }, 700);
};
useEffect(
  () => () => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    if (publishTimer.current) clearTimeout(publishTimer.current);
  },
  [],
);
```

(Add `useEffect` to the react import.)

- [ ] **Step 4: The form column**

Below the top bar, a row container (`flex: 1, minHeight: 0, display: "flex"`). Left: the form column (`width: FORM_W, marginLeft: FORM_X, paddingTop: 24, display: "flex", flexDirection: "column", gap: 24`):

1. `<Field label="Title" en value={title} onChange={setTitle} />`
2. `<Field label="Type" en value={type} onChange={setType} />`
3. Description block — label row has the counter on the right:

```tsx
<div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
    <span style={{ ...TYPE.body, fontWeight: W.medium, color: neutral[800] }}>Description</span>
    <EnChip />
    <span style={{ ...TYPE.caption, color: neutral[500], marginLeft: "auto" }}>
      {description.length}/{DESCRIPTION_MAX}
    </span>
  </div>
  <textarea
    value={description}
    data-demo="field-description"
    maxLength={DESCRIPTION_MAX}
    onChange={(e) => setDescription(e.target.value)}
    onFocus={() => setDescFocused(true)}
    onBlur={() => setDescFocused(false)}
    style={{
      height: 118,
      padding: 13,
      borderRadius: RADIUS.md,
      border: `1px solid ${descFocused ? primary[500] : neutral[300]}`,
      outline: "none",
      resize: "none",
      backgroundColor: neutral[0],
      ...TYPE.body,
      color: neutral[900],
      width: "100%",
      boxSizing: "border-box",
      fontFamily: TYPE.body.fontFamily,
    }}
  />
</div>
```

4. `<Field label="Address" value={address} onChange={setAddress} />`
5. `<Field label="Website" value={website} onChange={setWebsite} />`
6. Phone block — label like Field's, then a 38px-high flex row: a country segment (width 81, border `1px solid ${neutral[300]}`, right border none, borderRadius `8px 0 0 8px`, flex centered, gap 6) containing the three-bar flag (three 5×12 divs: `#3b5bdb`, `#fff` with `1px neutral[200]` border, `#e03131` — frame-verbatim, see deviation 5), `+1` in `TYPE.body neutral[800]`, and `<Icon path={ICONS.chevronDown} size={12} color={neutral[500]} />`; then the phone `<input>` styled like Field's input but `borderRadius: "0 8px 8px 0"`, `flex: 1`, bound to `phone`/`setPhone`.
7. Manage Hours card (height 68, border `1px solid ${neutral[200]}`, `RADIUS.md`, padding "0 24px", flex, alignItems center): "Manage Hours" (`TYPE.body`, `W.semibold`, `neutral[900]`) + "Add Hours" (`marginLeft: "auto"`, `TYPE.body`, `W.medium`, `primary[500]`, cursor default, inert).
8. Photos card (border `1px solid ${neutral[200]}`, `RADIUS.md`, padding 24): heading "Photos" (`TYPE.body`, `W.semibold`, `neutral[900]`, marginBottom 12), then the dropzone — fixed height 158 so the uploaded state (Task 6) never shifts the shell:

```tsx
<button
  type="button"
  data-demo="dropzone"
  aria-label="Upload photos"
  onClick={() => setPhoto((p) => !p)}
  style={{
    height: 158,
    width: "100%",
    border: `1.5px dashed ${neutral[300]}`,
    borderRadius: RADIUS.md,
    backgroundColor: neutral[0],
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 0,
  }}
>
  {/* Task 6 swaps in the uploaded thumbnail when photo === true */}
  <Icon path={ICONS.imagePlus} size={32} color={neutral[400]} />
  <span style={{ ...TYPE.body, fontWeight: W.medium, color: neutral[700] }}>
    Click to upload photos
  </span>
  <span style={{ ...TYPE.caption, color: neutral[500] }}>PNG, JPG up to 5MB</span>
</button>
```

- [ ] **Step 5: Temporary export + eyeball**

For this task only, export default a plain wrapper (no DemoStage yet):

```tsx
export default function OutletDetailsSpecimen() {
  return <Editor />;
}
```

Mount it temporarily at the bottom of `FBOrderingContent.tsx` after `ItemLibrarySpecimen` (same `FadeIn`/`Grid`/`Col md="1-12" lg="2-11"` wrapper — see lines 105–111 for the pattern) and eyeball at `/work/fb-ordering` against the frame screenshot: field order/labels/EN chips/counter `137/500`, focus ring works when clicking a field, Publish shows spinner then nothing (toast arrives in Task 6 — the handler already sets state; toast UI isn't rendered yet, that's fine).

- [ ] **Step 6: Commit**

```bash
git add site/components/fb-showcase/OutletDetailsSpecimen.tsx site/app/work/fb-ordering/FBOrderingContent.tsx
git commit -m "feat: outlet-details specimen — shell, top bar, form column (static)"
```

---

### Task 5: Guest-phone preview with live mirroring

**Files:**
- Modify: `site/components/fb-showcase/OutletDetailsSpecimen.tsx`

**Interfaces:**
- Consumes: `title`, `description`, `phone`, `photo` state from `Editor`; `PREVIEW`, `HERO_SRC` from data; `ICONS.phone`, `ICONS.email`, `ICONS.chevronRight`, `ICONS.chevronDown`.
- Produces: `<PhonePreview title description phone photo />` rendered in the right region.

- [ ] **Step 1: Build PhonePreview**

Right region: after the form column, `<div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>` containing the phone card. Phone card: `width: PHONE_W, borderRadius: 24, overflow: "hidden", backgroundColor: neutral[0], boxShadow: ELEV.overlay, border: \`1px solid ${neutral[100]}\``.

```tsx
function PhonePreview({
  title, description, phone, photo,
}: {
  title: string;
  description: string;
  phone: string;
  photo: boolean;
}) {
  return (
    <div style={{ width: PHONE_W, borderRadius: 24, overflow: "hidden", backgroundColor: neutral[0], boxShadow: ELEV.overlay, border: `1px solid ${neutral[100]}` }}>
      {/* Hero — crossfades when a photo is "uploaded" (Task 6 wires photo) */}
      <div style={{ position: "relative", height: 180, backgroundColor: neutral[200] }}>
        <AnimatePresence>
          {photo ? (
            <motion.img
              key="hero"
              src={HERO_SRC}
              alt=""
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.45, ease: "easeOut" }}
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <motion.span
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", ...TYPE.body, color: neutral[500] }}
            >
              {PREVIEW.noImage}
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: 12 }}>
        <h3 style={{ ...TYPE.title, fontWeight: W.semibold, color: neutral[900], margin: 0 }}>
          {title}
        </h3>

        {/* Order Food CTA */}
        <div style={{ height: 40, borderRadius: RADIUS.md, backgroundColor: "#131822", color: neutral[0], display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
          <span style={{ ...TYPE.body, fontWeight: W.medium }}>{PREVIEW.cta}</span>
          <span style={{ position: "absolute", right: 12 }}>
            <Icon path={ICONS.chevronRight} size={16} color={neutral[0]} />
          </span>
        </div>

        <p style={{ ...TYPE.body, color: neutral[700], margin: 0, minHeight: 80 }}>{description}</p>

        {/* Contact rows */}
        <div style={{ border: `1px solid ${neutral[200]}`, borderRadius: RADIUS.md, overflow: "hidden" }}>
          {[
            { icon: ICONS.phone, text: phone },
            { icon: ICONS.email, text: PREVIEW.email },
          ].map((row, i) => (
            <div key={i} style={{ height: 45, display: "flex", alignItems: "center", paddingInline: 12, gap: 12, borderTop: i > 0 ? `1px solid ${neutral[200]}` : "none" }}>
              <Icon path={row.icon} size={16} color={neutral[600]} />
              <span style={{ ...TYPE.body, color: neutral[800] }}>{row.text}</span>
              <span style={{ marginLeft: "auto" }}>
                <Icon path={ICONS.chevronRight} size={16} color={neutral[400]} />
              </span>
            </div>
          ))}
        </div>

        {/* Language + legal footer */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, paddingBlock: 8 }}>
          <div style={{ height: 25, paddingInline: 9, border: `1px solid ${neutral[200]}`, borderRadius: RADIUS.sm, display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ ...TYPE.caption, color: neutral[700] }}>{PREVIEW.language}</span>
            <Icon path={ICONS.chevronDown} size={12} color={neutral[500]} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            <span style={{ ...TYPE.micro, color: neutral[500] }}>{PREVIEW.legal}</span>
            <span style={{ ...TYPE.micro, color: neutral[400], display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ width: 12, height: 8, borderRadius: RADIUS.full, backgroundColor: neutral[300], display: "inline-block" }} />
              {PREVIEW.poweredBy}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
```

Note the `minHeight: 80` on the description paragraph: the demo starts at 137 chars (4 lines) and grows to 186 (5 lines) — the min-height plus the phone card being vertically centered keeps the growth from feeling jumpy. If 5 lines overflows 80px that's fine — the card grows a line; total shell height does NOT change (the phone floats centered in a fixed-height region).

- [ ] **Step 2: Wire it into Editor's layout**

In the content row from Task 4, after the form column: `<PhonePreview title={title} description={description} phone={phone} photo={photo} />` inside the centering flex region.

- [ ] **Step 3: Verify live mirroring in the browser**

At `/work/fb-ordering`: type in Title → preview title AND breadcrumb update per keystroke; type in Description → preview paragraph + counter update; edit Phone → phone row updates; click the dropzone → hero crossfades to the photo (click again → back to gray). Address/Website/Type edits change nothing in the preview (correct — the guest page doesn't show them).

- [ ] **Step 4: Commit**

```bash
git add site/components/fb-showcase/OutletDetailsSpecimen.tsx
git commit -m "feat: outlet-details specimen — live guest-phone preview"
```

---

### Task 6: Uploaded-photo state, toast, demo script, DemoStage wrap, final mount

**Files:**
- Modify: `site/components/fb-showcase/OutletDetailsSpecimen.tsx`
- Modify: `site/app/work/fb-ordering/FBOrderingContent.tsx` (finalize the mount comment)

**Interfaces:**
- Consumes: `DemoStep` (with Task 1's `charMs`), `FULL_DESCRIPTION`, `TYPED_SENTENCE` timing.
- Produces: the shipped `OutletDetailsSpecimen` default export.

- [ ] **Step 1: Uploaded state inside the dropzone**

Replace the dropzone button's static children with an AnimatePresence swap on `photo` (container stays 158px — no layout shift):

```tsx
<AnimatePresence mode="wait" initial={false}>
  {photo ? (
    <motion.div
      key="uploaded"
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3, ease: EASE }}
      style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}
    >
      <img
        src={HERO_SRC}
        alt="The Lodge Restaurant dining room"
        style={{ width: 180, height: 92, objectFit: "cover", borderRadius: RADIUS.md }}
      />
      <span style={{ ...TYPE.caption, color: neutral[600] }}>the-lodge-restaurant.jpg</span>
    </motion.div>
  ) : (
    <motion.div
      key="empty"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}
    >
      {/* imagePlus icon + the two text lines from Task 4 */}
    </motion.div>
  )}
</AnimatePresence>
```

- [ ] **Step 2: Toast**

Copy `ItemLibrarySpecimen.tsx:601-628`'s toast block verbatim into the shell's `position: relative` row container (the AnimatePresence + motion.div anchored `bottom: 20, left: "50%"`). It renders `{toast}` — state already exists from Task 4.

- [ ] **Step 3: The choreography script + DemoStage wrap**

```tsx
// ─── Choreography ──────────────────────────────────────────────────────────

/**
 * ~15s loop: extend the description (preview mirrors keystroke-by-keystroke,
 * counter walks 137→186/500) → "upload" a photo (dropzone thumbnail + hero
 * crossfade) → Publish (700ms beat, toast). `after` pads cover the crossfade
 * (450ms), the publish beat (700ms), and toast dwell (2.4s).
 */
const OUTLET_DEMO_SCRIPT: DemoStep[] = [
  { type: "wait", ms: 800 },
  { type: "tap", target: "field-description", after: 350 },
  { type: "type", target: "field-description", text: FULL_DESCRIPTION, charMs: 70, after: 1500 },
  { type: "tap", target: "dropzone", after: 1900 },
  { type: "tap", target: "publish", after: 1200 },
  { type: "wait", ms: 2600 },
];

export default function OutletDetailsSpecimen() {
  return (
    <MotionConfig reducedMotion="user">
      <DemoStage
        ariaLabel="Demonstration of the staff outlet-details editor with live guest preview"
        script={OUTLET_DEMO_SCRIPT}
        stageWidth={SHELL_W}
        stageHeight={SHELL_H}
        childRadius={RADIUS.lg}
      >
        <Editor />
      </DemoStage>
    </MotionConfig>
  );
}
```

(The `tap` on `field-description` before the `type` step is deliberate — the cursor presses the field like a human would; `typeInto` then starts appending because BASE_DESCRIPTION is a prefix of FULL_DESCRIPTION.)

- [ ] **Step 4: Finalize the mount**

In `FBOrderingContent.tsx`, give the Task-4 temporary mount the standard comment block (match the style of lines 100–104):

```tsx
        {/* ── Staff outlet editor — where the guest-facing outlet page gets
            written, with a live phone preview (Marco 2026-08-04). Rebuilt
            from the polished Figma frames (Canary Polished Visuals, frame
            57:8145) and styled from canary-polished-tokens. Same DemoStage
            chrome as the three specimens above. */}
```

- [ ] **Step 5: Watch one full loop**

At `/work/fb-ordering`, watch specimen #4 end-to-end: cursor taps the description, the sentence types in at ~70ms/char while the preview paragraph and counter track it, dropzone tap swaps in the thumbnail AND crossfades the preview hero, Publish spins 700ms then the toast shows, loop remounts back to 137/500 + gray hero. Hover → "Interact with flow" pill → click → type in Title → preview mirrors. Un-hover resumes… actually after takeover, press the reset button to restart the auto demo.

- [ ] **Step 6: Commit**

```bash
git add site/components/fb-showcase/OutletDetailsSpecimen.tsx site/app/work/fb-ordering/FBOrderingContent.tsx
git commit -m "feat: outlet-details specimen — photo upload, publish toast, demo choreography"
```

---

### Task 7: Full verification pass (all four specimens) + docs

**Files:**
- Possibly modify: any file from Tasks 1–6 (fixes)
- Modify: `docs/CURRENT-STATE.md` (new top entry)

The standard specimen bar (`.claude/rules/specimens.md`) plus regression on the three earlier specimens, since DemoStage, admin-shell, and mdi-icons all changed. Use playwright-core scripts (pattern below) or the claude-in-chrome tools; remember the Agentation toolbar intercepts clicks — hide `[data-agentation-root]` first, and remember DemoStage self-pauses off-screen (measure intersection ratio before calling anything "stalled"; re-anchor scroll twice).

- [ ] **Step 1: tsc + console + scroll-drift check at 1440**

With the dev server running, run a playwright-core script from the scratchpad that: opens `/work/fb-ordering` at 1440×900, hides Agentation (`document.querySelector('[data-agentation-root]')?.style.setProperty('display','none')`), scrolls specimen #4 into view (twice, 500ms apart), records `window.scrollY` and console errors for TWO full loops (~35s), and asserts `dY: 0` and zero console errors. The typing step is the new scroll-anchoring risk — the textarea grows content; `overflow-anchor: none` on the stage should hold, verify it does.

- [ ] **Step 2: Regression sweep of specimens #1–#3**

Same page session: watch one full loop each of the cart (typing "412" still works — Task 1's regression), order dashboard, and item library (thumbnails render, toggles/bulk/delete/toast unchanged after the aria/CHROME_H/imageOff edits). Zero console errors throughout.

- [ ] **Step 3: Dark mode**

Toggle the site theme (theme button in the h1 row on home, or seed the theme localStorage key). The DemoStage panel follows the site theme; the product interior (sidebar, form, phone preview) stays literal light tokens; no invisible text. Screenshot both themes for the record.

- [ ] **Step 4: 390px viewport**

`document.documentElement.scrollWidth` ≤ 390 (no page overflow); the stage well pans — `scrollLeft` reaches both edges (left edge shows the sidebar, right edge shows the phone preview's right side).

- [ ] **Step 5: Fullscreen at true 1:1**

Open fullscreen on specimen #4: renders at native 1177×1018 or viewport-fit (whichever is smaller, `fsScale` floors at 1 — on a 900-tall viewport it will SCALE DOWN to fit height, that's expected for a 1018-tall stage: verify it fits and is fully visible), body scroll locks while open and clears on close; Esc, scrim click, and the X each close it; the demo restarts inside the portal.

- [ ] **Step 6: Fix anything that failed, re-run the failed check, commit fixes**

```bash
git add -A site/
git commit -m "fix: outlet-details specimen verification pass"
```

(Skip the commit if nothing needed fixing.)

- [ ] **Step 7: CURRENT-STATE entry**

Add the session entry at the TOP of `docs/CURRENT-STATE.md`: specimen #4 shipped (files, loop description, deviations 1–5 from the component comment, DemoStage typing change, the four chores landed, verification results, and NEXT: Compendium specimens per the standing plan). Commit:

```bash
git add docs/CURRENT-STATE.md
git commit -m "docs: outlet-details specimen (#4) session entry"
```

---

## Self-Review (done at write time)

- **Spec coverage:** files ✓ (Task 3–4), layout ✓ (Task 4–5), loop ✓ (Task 6), DemoStage change ✓ (Task 1), takeover scope ✓ (Tasks 4–5: controlled inputs; inert items listed), chores ✓ (Task 2), email deviation ✓ (data file), verification bar ✓ (Task 7).
- **Type consistency:** `CHROME_H` exported in Task 2, imported in Task 4 ✓; `charMs` defined Task 1, used Task 6 ✓; `data-demo` targets `field-description`/`dropzone`/`publish` defined Task 4, scripted Task 6 ✓; `photo` state defined Task 4, consumed Tasks 5–6 ✓.
- **Placeholder scan:** Task 6 Step 1 references "the two text lines from Task 4" inside a comment — acceptable, the exact JSX is fully written in Task 4 Step 4 item 8. No TBDs.

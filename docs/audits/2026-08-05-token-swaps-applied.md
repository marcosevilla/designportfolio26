# Token Swaps Applied — 2026-08-05

Execution record for DELIVERABLE 1 of `docs/audits/2026-08-05-design-token-audit.md`.

**Constraint: zero visual change.** Every swap below was verified to produce an
identical computed value. Nothing was "improved" while in a file; no new token
values were invented. All paths relative to `site/`.

**Result: 10 of 10 swaps applied. `npx tsc --noEmit` exits 0. Dev server boots
clean; `/` and `/work/checkin` both return 200.**

---

## Files touched (7)

| File | Swap(s) |
|------|---------|
| `components/HomeLayout.tsx` | SWAP-1 |
| `app/globals.css` | SWAP-2, SWAP-3, SWAP-4 |
| `lib/gallery-content.ts` | SWAP-5 |
| `components/case-study/ProjectDetails.tsx` | SWAP-6 |
| `components/case-study/InlineTOC.tsx` | SWAP-7 |
| `components/LockGate.tsx` | SWAP-8 |
| `components/PasswordModal.tsx` | SWAP-9 |
| `components/CaseStudyList.tsx` | SWAP-10 |

---

## SWAP-1 — `components/HomeLayout.tsx` — home bio → `typescale.body`

Import changed: `import { serifName } from "@/lib/typography"` →
`import { serifName, typescale } from "@/lib/typography"`.

The inline `fontSize` / `lineHeight` / `letterSpacing` trio was replaced with
`...typescale.body`. `fontFamily` (the long-form Geist string) and the following
`color:` line were both kept, per the audit's instruction — `typescale.body` sets
no family, and the long-form string is not byte-identical to what `var(--font-sans)`
resolves to.

| Property | OLD (inline) | NEW (`typescale.body`) | Match |
|----------|--------------|------------------------|-------|
| `fontSize` | `"calc(15px + var(--font-size-offset))"` | `scaled("15px")` → `"calc(15px + var(--font-size-offset))"` | ✅ identical string |
| `lineHeight` | `1.647` | `BODY_LINE_HEIGHT` = `1.647` | ✅ |
| `letterSpacing` | `"-0.01em"` | `"-0.01em"` | ✅ |

Spread position is after `fontFamily` and before `color`, and `typescale.body`
contains neither of those keys — so no key collision and no property-order change.

This also closes the `.claude/rules/typography.md` note that the home bio and
`typescale.body` "must be changed together" — they now can't drift.

---

## SWAP-2 / 3 / 4 — `app/globals.css` — literal soft shadow → `var(--shadow-soft)`

**Precondition verified first.** `@theme` line 21 declares:

```css
--shadow-soft: 0 1px 2px rgba(0, 0, 0, 0.04);
```

That is byte-identical to the literal at all three sites.

⚠️ **A real trap was found and cleared here.** Tailwind v4 tree-shakes unused
`@theme` variables — before this change `--shadow-soft` had 0 consumers and was
**not emitted into the compiled CSS at all**. Had it stayed unemitted,
`var(--shadow-soft)` would have resolved to nothing, the whole `box-shadow`
declaration would have been dropped as invalid, and three surfaces would have
silently lost their shadow.

Verified empirically by compiling `globals.css` through `@tailwindcss/postcss`
before and after:

- **Before:** `grep shadow-soft` on the compiled output → no match.
- **After:** Tailwind detects the in-CSS `var()` reference and emits
  `--shadow-soft: 0 1px 2px rgba(0, 0, 0, 0.04);` into `:root, :host` in
  `@layer theme`.
- **Full compiled diff** between the two builds is exactly 4 lines: the 3
  intended `box-shadow` first-layer swaps plus the newly emitted variable with
  the identical value. Nothing else moved.
- No runtime override exists — `--shadow-soft` appears nowhere in
  `components/`, `lib/`, or `app/` outside `globals.css`, so `applyColoredTheme()`
  cannot shadow it.

| Swap | Rule | OLD first shadow layer | NEW | Computed |
|------|------|------------------------|-----|----------|
| SWAP-2 | `.chat-input-field` | `0 1px 2px rgba(0, 0, 0, 0.04),` | `var(--shadow-soft),` | `0 1px 2px rgba(0, 0, 0, 0.04)` — identical |
| SWAP-3 | `.chat-input-field:focus-within` | same | same | identical |
| SWAP-4 | `.chat-surface` | same | same | identical |

`--shadow-soft` now has 3 consumers instead of 0. `--shadow-soft-lg` still has
none — see DEC-6 below.

---

## SWAP-5 — `lib/gallery-content.ts` — 4 identical drop-shadows → one const

Hoisted to module level (above `galleryContent`):

```ts
const GALLERY_CARD_SHADOW =
  "drop-shadow(0 1px 2px rgba(0, 0, 0, 0.04)) drop-shadow(0 8px 20px rgba(0, 0, 0, 0.05)) drop-shadow(0 20px 40px rgba(0, 0, 0, 0.04))";
```

All four `uiShadow:` sites now read `uiShadow: GALLERY_CARD_SHADOW,`
(fb-ordering, upsells, checkin, general-task).

**OLD → NEW:** the exact same 3-stop string at all four sites. The replacement
was done by exact-string match with an asserted count of 4, so byte-equality is
proven, not assumed. Verification: 1 definition + 4 references; 1 remaining
occurrence of the literal (the const definition itself).

---

## SWAP-6 — `components/case-study/ProjectDetails.tsx:60` — canonical var syntax

```diff
- <p key={g} className="py-2 text-[var(--color-fg-secondary)]">
+ <p key={g} className="py-2 text-(--color-fg-secondary)">
```

**OLD computed:** `.text-\[var\(--color-fg-secondary\)\] { color: var(--color-fg-secondary); }`
**NEW computed:** `.text-\(--color-fg-secondary\) { color: var(--color-fg-secondary); }`

Confirmed against the compiled CSS: same property, same value, same specificity
(one class), same `utilities` layer. The only compiled-output difference is that
the now-unreferenced `.text-[var(...)]` class is no longer generated. Zero
legacy `text-[var(--color-*)]` call sites remain in `components/`, `app/`, `lib/`.

---

## SWAP-7 — `components/case-study/InlineTOC.tsx` — `TOC_LABEL` (2 of 3 sites)

Added `type CSSProperties` to the existing React import and hoisted:

```ts
const TOC_LABEL: CSSProperties = {
  fontFamily: "var(--font-geist-mono), ui-monospace, Menlo, monospace",
  fontSize: "12px",
  fontWeight: 500,
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  lineHeight: "20px",
};
```

Spread at the **"Back" link** (spread sits after its `color:` line, which
`TOC_LABEL` does not define — no collision) and at the **TOC row `<a>`**.

**OLD → NEW at both sites:** the same six properties with the same six values.

**Deliberately skipped:** the `*` star-marker block. Per the audit, adding the
mono `fontFamily` / `textTransform` / `letterSpacing` to a lone asterisk glyph
changes its metrics — that would be a visual change. It keeps its inline
`fontSize` / `lineHeight` / `fontWeight` unchanged.

Net: 2 of 3 deduped, as specified.

---

## SWAP-8 — `components/LockGate.tsx` — `GATE_LABEL` (3 sites)

Added `import type { CSSProperties } from "react"` and hoisted:

```ts
const GATE_LABEL: CSSProperties = {
  fontFamily: "var(--font-geist-mono), ui-monospace, Menlo, monospace",
  fontSize: "12px",
  fontWeight: 500,
  textTransform: "uppercase",
  letterSpacing: "0.08em",
};
```

Byte-equality across the Email link, the LinkedIn link and the "Got a code?"
button was proven by exact-string replacement with an asserted count of 3.
At each site the spread sits first, exactly where the five properties were, with
`color` / `background` / `border` following unchanged — property order preserved.

**Left alone:** the 11px `LockedFrameBadge` eyebrow ("In progress — click to
preview"). Different size, different role.

---

## SWAP-9 — `components/PasswordModal.tsx` — `MODAL_LABEL` (3 sites)

Added `type CSSProperties` to the existing React import and hoisted the same
five-property spec as `MODAL_LABEL`. Applied to the Email link, the LinkedIn
link and the submit button — again by exact-string replacement with an asserted
count of 3, so byte-equality is proven.

**Left alone:**
- the 13px / `0.06em` "Got a code?" divider,
- the 16px input (its size is an **iOS Safari auto-zoom guard**, not a label spec).

---

## SWAP-10 — `components/CaseStudyList.tsx` — `PLACEHOLDER_LABEL` (2 sites)

⚠️ File was re-read fresh (it had been edited moments earlier by the
scroll-snap removal); audit line numbers had shifted. The two blocks were
located by content, not by line number.

Added `type CSSProperties` to the existing React import and hoisted:

```ts
const PLACEHOLDER_LABEL: CSSProperties = {
  fontFamily: "var(--font-geist-mono), ui-monospace, Menlo, monospace",
  fontSize: "11px",
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  color: "var(--color-fg-tertiary)",
};
```

Applied at **"Under construction"** (study card with no media) and
**"Coming soon"** (playground cell with no media). Both were byte-identical
five-property objects including `color`; both now read
`style={{ ...PLACEHOLDER_LABEL }}`. No other properties existed at either site,
so nothing was dropped or reordered.

---

## Verification

```
$ cd site && npx tsc --noEmit
EXIT=0     (no output)
```

| Const | Definition | Call sites | Leftover inline copies |
|-------|-----------|------------|------------------------|
| `GALLERY_CARD_SHADOW` | 1 | 4 | 0 |
| `TOC_LABEL` | 1 | 2 | 0 (star marker deliberately excluded) |
| `GATE_LABEL` | 1 | 3 | 0 (11px eyebrow is a different spec) |
| `MODAL_LABEL` | 1 | 3 | 0 (13px + 16px are different specs) |
| `PLACEHOLDER_LABEL` | 1 | 2 | 0 |

Additional checks:
- `0 1px 2px rgba(0, 0, 0, 0.04),` in `globals.css`: **0** remaining;
  `var(--shadow-soft),`: **3**.
- `text-[var(--color-*)]` across `components/`, `app/`, `lib/`: **0** remaining.
- Compiled-CSS diff before/after: **only** the 3 intended `box-shadow` lines,
  the newly emitted `--shadow-soft` (identical value), and the removal of the
  now-unused `.text-[var(--color-fg-secondary)]` utility class.
- Dev server boots clean; `/` → 200, `/work/checkin` → 200; no compile errors
  in the log. (The `[editor] failed to start on port 3002` warning is
  pre-existing and unrelated — another checkout holds that port.)

---

## Deliberately NOT done

**NM-1 — `CaseStudyList` placeholder title → `typescale.h3`.** Rejected as a
visual change, not a mechanical swap. The token sets `lineHeight: 1.4`; the call
site currently inherits `1.6` from `body`. That shrinks the line box by roughly
3.2px at 16px. Small, but not zero — and the brief was zero. Listed as a design
decision below.

Also untouched per scope: `components/fb-showcase/**`, `ThemeToggle.tsx`,
`lib/playlist.ts`, `Resume.tsx`, `LoadingOverlay.tsx`, `app/dev/**`,
`components/type-tuner/`, mask gradients, and the ~28 legacy `0.08em`
mono-label call sites (TYPOGRAPHY-BACKLOG ⑧).

---

# TOKEN GAPS THAT NEED MARCO'S DESIGN DECISION

**No action has been taken on anything in this section.** Each item has a
recommendation attached; none can be executed without a value ruling.

## 1. The orphaned `--shadow-soft-lg`

`--shadow-soft-lg: 0 4px 12px rgba(0, 0, 0, 0.06)` is declared in `@theme` and
consumed by **nothing**. Because Tailwind v4 tree-shakes unused theme variables,
it is not even emitted into the compiled CSS — it is a comment that looks like a
token. Its nearest real-world twin is `globals.css:442` (`0 4px 14px rgba(0,0,0,0.06)`),
which differs by 2px of blur.

**Recommendation: retune the token to `0 4px 14px rgba(0, 0, 0, 0.06)` and adopt
it at that one site.** That makes it real at the cost of a 2px blur change on one
surface. If you'd rather not touch any pixel, delete it — a token with zero
consumers is worse than no token, because it reads as a system that exists when
it doesn't.

## 2. Undocumented type sizes with no token: 10 / 12 / 13 / 14 / 18 / 32px

The typescale has 9 tokens; only 11px (`label`), 15px (`body`), 16px
(`h3`/`subtitle`), 24px (`title`), 26px (`h2`) and the `display` clamp exist.
A second, undeclared scale lives in chat, nav, modals, TOC and overlays:

| Size | Live sites | Has a token? |
|------|-----------|--------------|
| 10px | 1 (`ChatPanel`) | no — smallest text on the site |
| **12px** | **21** | no *sans* token (`monoLabel` is 12px but mono + uppercase + −0.02em, matching none of them) |
| 13px | 6 | no |
| 14px | 7 | no — and it appears with **four different line-heights**: `22.4px`, `22px`, `1.4`, inherited `1.6` |
| 18px | 2 | no (the duplicated italic hero subtitle) |
| 32px | 1 (`HamburgerMenu`) | no — a display size, not a micro-label |

**Recommendation: mint exactly one token — a 12px sans UI token.** It is the
most-hardcoded size on the site by a wide margin and would absorb `StudyMetaRow`
×3, `NavOverlay`, `MobileNav`, `ChipPrompt`, `ChatBar`, `HamburgerMenu`,
`HomeNav` ×2 and more. Hold 13px and 14px until 12px has landed and settled;
minting three chrome tokens at once re-creates the "dozen styles" problem you
consolidated away from in the first place. Leave 10px, 18px and 32px as
deliberate one-offs.

⚠️ If a 14px token is ever added, its line-height **must be unitless** — a px
line-height does not track `--font-size-offset` and the ratio collapses as the
Theme Palette slider moves. That bug has already bitten this codebase once.

## 3. Six competing mono-label tracking values

One visual role — the mono uppercase micro-label — is currently expressed six
ways:

| Value | Sites |
|-------|-------|
| `0.08em` | 28 (the legacy default) |
| `−0.02em` | `typescale.monoLabel` + 3 marquee sites |
| `0.06em` | 2 |
| `0.04em` | 2 |
| `0.02em` | 3 |
| `tracking-widest` | 2 |

`Hero.tsx` alone uses three different values. TYPOGRAPHY-BACKLOG ⑧ already
records your ruling that the answer is `−0.02em`.

**Recommendation: execute backlog ⑧ as one reviewed sweep, not piecemeal.** It
is a genuinely visible tracking change across nav, TOC, modals and badges, so it
wants a single before/after look (`npm run sheet`) rather than drifting in over
several sessions. The five consts hoisted today (`TOC_LABEL`, `GATE_LABEL`,
`MODAL_LABEL`, `PLACEHOLDER_LABEL`, plus `GALLERY_CARD_SHADOW`) make that sweep
meaningfully cheaper — four of the label sites are now one-line edits.

## 4. Four competing modal scrim colors

| File | Value |
|------|-------|
| `components/chat/ChatBar.tsx` | `rgba(0, 0, 0, 0.35)` |
| `components/PasswordModal.tsx` | `rgba(0,0,0,0.45)` |
| `components/CaseStudyList.tsx` (lightbox) | `rgba(0, 0, 0, 0.72)` |
| `components/DemoStage.tsx` (`SCRIM_TINT`) | `rgba(8,8,8,0.78)` |

Four overlays, four different blacks, four different alphas, no `--color-scrim`.

**Recommendation: two tokens, not one.** These are two different jobs — a *panel*
scrim behind a small dialog (chat bar 0.35, password modal 0.45) and a *media*
scrim behind a full-bleed image or demo (lightbox 0.72, DemoStage 0.78). One
value can't serve both without either washing out the lightbox or making the
password modal feel heavy. Suggest `--color-scrim: rgba(0, 0, 0, 0.45)` and
`--color-scrim-media: rgba(0, 0, 0, 0.75)`, then a 4-line swap. **You pick the
two numbers** — the ones above are the midpoints of what already ships, not a
design call.

## 5. The mono font-family string repeated ~37×

`"var(--font-geist-mono), ui-monospace, Menlo, monospace"` is retyped inline
**37 times** in site chrome. Meanwhile `--font-mono-system` exists in
`globals.css:82` and is used only by `fb-showcase` (9×), and
`typescale.monoLabel.fontFamily` is used once.

⚠️ **This is not a mechanical swap.** The values differ: `--font-mono-system`
resolves to `ui-monospace, Menlo, Monaco, monospace` — it includes `Monaco` and,
critically, **does not include `var(--font-geist-mono)` at all**. Swapping would
drop Geist Mono from site chrome entirely. That is a visible change on every
mono label on the site.

**Recommendation: don't reuse `--font-mono-system` — mint a second var.** Add
`--font-mono: var(--font-geist-mono), ui-monospace, Menlo, monospace` (the exact
current chrome string, so the swap is provably zero-change), leave
`--font-mono-system` alone as the representational/product stack, and migrate the
37 sites to the new var. Cheap, safe, and it makes the chrome-vs-product
distinction explicit instead of accidental.

## 6. Missing shadow and scrim token families

Beyond `--shadow-soft`, there is **no shadow token family at all** — 13 one-off
shadow stacks exist across `ChatFab`, `ChatBar`, `CustomCursor`,
`FnbDitherFrame`, `NavOverlay`, `MusicPlayerPanel` (×2), `DemoStage` (×2),
`DeviceShell`, plus 5 more inline stacks in `globals.css`. Same for scrims (see
#4). And the device/shell drop shadow is byte-identical across `DeviceShell.tsx`,
`fb-showcase/admin-shell.tsx` and `fb-showcase/FnbCartSpecimen.tsx` — but that
one is **partly sanctioned**: `specimens.md` explicitly says to keep the copies
in sync, and deduping it would cross the site-chrome ↔ specimen boundary.

**Recommendation: a three-rung elevation scale, no more.** Something like
`--shadow-soft` (contact, already real as of today), `--shadow-raised` (panels,
music player, chat surface) and `--shadow-float` (modals, lightbox, cursor). Most
of the 13 one-offs would collapse into those three, and the ones that genuinely
shouldn't — `DemoStage`'s dark chrome, which `specimens.md` sanctions as
deliberately self-contained — stay local consts. Do **not** touch the
`DeviceShell` ↔ specimen shadow; that boundary is intentional.

**Suggested order if you want to work through this list:** #5 (mint `--font-mono`,
zero-risk, kills the largest duplication) → #2 (the 12px sans token) → #3 (the
backlog ⑧ tracking sweep, the only genuinely visible one) → #4 → #6 → #1.

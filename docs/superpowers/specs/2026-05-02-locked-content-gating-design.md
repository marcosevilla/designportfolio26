# Locked Content Gating — Design Spec

**Date:** 2026-05-02
**Owner:** Marco Sevilla
**Status:** Approved

## Problem

The portfolio currently hides some unfinished case studies behind a `galleryReadyStudies` filter (`components/CaseStudyList.tsx:68`). That keeps the homepage looking polished but at the cost of discoverability — recruiters can't see the full breadth of work, and "hidden" gives no signal that more exists.

The Playground subpages (`/play/six-degrees`, `/play/pajamagrams`, `/play/custom-wrapped`) shipped recently with placeholder visuals; they're public but not ready to showcase.

We want a unified visual + interaction treatment for **content that's accessible but not yet ready for public viewing** — a "WIP courtesy" gate. Locked items appear in their full visual context so visitors know the work exists, but a soft barrier asks them to reach out for early access. A single password unlocks everything for the session and persists locally.

The tone is *"Wax on. Wax off."* — the work is being polished, not hidden in a vault.

## Goals

- Locked items remain discoverable and visually identifiable at rest (no permanent dimming).
- Hover signals "gated" via a uniform visual language, distinct from existing card hover effects.
- Click on a locked item opens a friendly unlock modal with primary CTAs to contact directly and a secondary password field.
- One password unlocks all gated content; persists per-device via localStorage.
- Direct URL access to a locked case study renders a friendly placeholder with the same modal trigger and a return path — no content leaks.
- Ship without API routes (works with the existing static-export deployment surface; only the chat bar uses an API route, and we don't want to entangle gating with it).

## Non-goals

- Real authentication or per-user access control.
- Per-content passwords or tiered access.
- Server-side gating. Casual DevTools bypass is acceptable — the password is shared socially, not protecting secrets.
- Analytics / tracking of unlock attempts.

## Locked content inventory

**Work case studies (all 6):**

| Slug | Route | Card surfaces |
|------|-------|---------------|
| `fb-ordering` | `/work/fb-ordering` | homepage `#work`, `/work` page |
| `compendium` | `/work/compendium` | same |
| `upsells` | `/work/upsells` | same |
| `checkin` | `/work/checkin` | same |
| `general-task` | `/work/general-task` | same |
| `design-system` | `/work/design-system` | same |

**Playground subpages (all 3):**

| Slug | Route | Card surfaces |
|------|-------|---------------|
| `six-degrees` | `/play/six-degrees` | homepage `#playground`, `/play` page |
| `pajamagrams` | `/play/pajamagrams` | same |
| `custom-wrapped` | `/play/custom-wrapped` | same |

**Not gated:** `/work/ai-workflow` (already complete), homepage bio/hero, marquee, theme palette, chat bar, anything else outside the inventory above.

The list lives at `site/lib/locked-content.ts` (new) as the single source of truth. `CaseStudyList`, `Playground`, `/play/page.tsx`, and the case-study route guards all read from this file.

## Visual specification

### Locked card hover state

At rest, a locked card is visually identical to an unlocked card — same thumbnail, same autoplay video (Playground), same metadata, same sharp edges. The locked state appears only on hover.

**On hover:**
- Card body fades to **50% opacity** + **2px backdrop-blur** over the card content (matches the existing frosted-glass language in `BackgroundTexture` and `CaseStudyCard`).
- The existing `bento-card--hover` glow + 1.01 scale do **not** fire on locked cards — they're replaced by the locked treatment.
- A centered overlay group fades in over 200ms ease-out:
  - `<LockIcon size={24} />` (existing icon at `components/Icons.tsx:85`), color `var(--color-fg-secondary)`.
  - One line of micro-copy 8px below the icon: *"In progress — click for details"*. Font: `var(--font-mono-system)`, 11px, `var(--color-fg-tertiary)`, `letter-spacing: 0.02em`, `text-transform: uppercase`.
- Cursor remains `pointer` so the click affordance is preserved.

**Timing:** 200ms ease-out in / 250ms ease-out out — matches existing card hover transitions.

**On click:** opens the global `<UnlockModal>`. No navigation occurs until unlocked.

### Locked list-row state (`CaseStudyListRow`)

The list view has no card surface to dim. Treatment for a locked row:
- Title color shifts to `var(--color-fg-tertiary)` on hover (instead of the standard accent springy nudge).
- Inline `<LockIcon size={11} />` in `var(--color-fg-tertiary)` appears 8px to the right of the title, fades in 200ms.
- The "company · role" + metric columns dim to 50% opacity.
- Click → unlock modal.

### Unlock modal (`<UnlockModal>`)

**Surface:** centered overlay, max-width 420px, frosted glass — `backdrop-filter: blur(24px)`, background `color-mix(in oklab, var(--color-surface-raised) 85%, transparent)`, 1px border `var(--color-border)`, sharp edges (`rounded-none` to match the rest of the system), 32px padding. On `<sm` it's a bottom-sheet: full width, slide up from bottom (spring 350/32, matches Theme Palette pattern).

**Backdrop:** `rgba(0,0,0,0.4)` + 8px blur on the page behind. Click outside or Esc closes.

**Contents (in order):**

1. Headline (`typescale.h3` weight 500, 18px): **"Wax on. Wax off."**
2. Body (`typescale.body`, 14px / 22 line-height, `var(--color-fg-secondary)`): *"This case study is currently being polished. Reach out directly if you'd like early access."*
3. 24px gap.
4. Primary CTA row — two buttons side by side, equal width:
   - **Email** — opens `mailto:msevilla@canarytechnologies.com` (uses the same email as `StickyFooter`). Existing email icon.
   - **LinkedIn** — opens LinkedIn URL in new tab. Existing LinkedIn icon.
   - Style: matches `SectionLinkButton` — surface-raised background, 1px border, 12px padding, accent on hover.
5. 24px gap.
6. Divider with inline label *"Got a code?"* — 1px line `var(--color-border)`, label centered, mono 11px tertiary.
7. Password input + submit, inline:
   - Input: `type="password"`, placeholder *"Enter code"*, full-width minus button, sharp edges, 1px border, 12px padding, focus border `var(--color-accent)`.
   - Submit button: 40px wide, accent fill, ✸ glyph or just *"Go"* in mono — pick during build, default to ✸.
   - Submit fires `useLock().unlock(value)`. On success: modal closes silently, locked state lifts everywhere, no toast/celebration. On failure: input shakes (200ms keyframe, ±4px), error label appears below in `var(--color-accent)` at 11px mono: *"Wrong code. Reach out and I'll send you one."*
   - Empty input: submit disabled.

**Focus management:** modal is a focus trap. Initial focus on the email button (primary path). Esc closes. Tab order: Email → LinkedIn → input → submit → close button.

### Locked full-page placeholder

Applies when someone navigates directly to `/work/{slug}` or `/play/{slug}` for a locked item.

**Layout:** centered column, `max-w-content-md` (800px), vertical center of viewport (60vh min-height), 32px padding.

**Contents:**
1. **Return arrow at top-left of viewport** — sticky, top-6 left-6 (matches existing `MobileNav` "← Back" pattern). Routes to `/work` for case-study slugs, `/play` for Playground slugs (driven by the existing `SidebarContext.backHref` machinery — see `CaseStudyShell.tsx`).
2. Page title (case study `title` from MDX frontmatter or Playground `lib/playground-cards.ts`) at `typescale.caseStudyHero` (clamp 28-32px, weight 600). Centered.
3. Subtitle from the same source at `typescale.subtitle` (14px / 22 line-height, `var(--color-fg-secondary)`). Centered.
4. 32px gap.
5. `<LockIcon size={32} />` centered, `var(--color-fg-tertiary)`.
6. 16px gap.
7. Headline + body + CTAs + password row — same as the modal contents above (items 1–7), inline rather than in a modal surface. No frosted glass background; just sits on the page.

**No autoplay video preview, no thumbnail.** The locked page is a plain placeholder; the visual richness is reserved for the cards.

### Unlocked transition

When `unlock()` returns true:
- `LockContext.isUnlocked` flips to `true` and writes to localStorage.
- All `<LockGate>` instances on the page swap to passthrough mode in the same render tick.
- Cards: locked overlay fades out (200ms), normal hover behavior resumes immediately.
- Locked full-page placeholder: fades out (200ms), real content fades in (200ms after, total ~400ms). If the user is already on a locked page when they unlock, content swaps in place — no navigation.

## Architecture

### `LockContext`

New file: `site/lib/LockContext.tsx`.

```ts
type LockState = {
  isUnlocked: boolean;
  hasHydrated: boolean;
  unlock: (code: string) => Promise<boolean>;
  lock: () => void; // dev/testing only
};
```

- Provider mounted in `app/layout.tsx`, wrapping `<body>` children.
- On mount, reads `localStorage.getItem("portfolio-unlocked")`. If `=== "1"`, sets `isUnlocked: true`. Sets `hasHydrated: true` regardless.
- `unlock(code)`:
  - Computes SHA-256 hex digest of `code` via `crypto.subtle.digest`.
  - Compares against `process.env.NEXT_PUBLIC_UNLOCK_CODE_HASH` (build-time inlined).
  - On match: writes `"1"` to localStorage, sets `isUnlocked: true`, returns `true`.
  - On mismatch: returns `false`.
- `lock()` clears localStorage and sets `isUnlocked: false`.

`useLock()` hook returns the context. Throws if used outside the provider.

### `useLockUI()` (modal control)

A second small context — `LockUIContext` — tracks modal open state separately so any `<LockGate>` can open the modal without prop drilling.

```ts
type LockUIState = {
  isModalOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
};
```

Mounted alongside `LockContext` in `app/layout.tsx`. The single `<UnlockModal />` instance lives in `layout.tsx` as a sibling of children, reads from `useLockUI()` for open state and `useLock()` for the unlock call.

Two contexts (rather than one) so the unlock state can stay stable across modal opens/closes without rerendering every locked card on each modal toggle.

### `<LockGate>`

New file: `site/components/LockGate.tsx`.

```tsx
type LockGateProps = {
  locked: boolean;
  mode: "card" | "list-row" | "page";
  slug: string;
  children: React.ReactNode;
  // page mode only:
  title?: string;
  subtitle?: string;
  backHref?: string; // "/work" | "/play"
};
```

Behavior by mode:

- **`mode="card"`:** Wraps a `CaseStudyCard` (or Playground card). When `locked && !isUnlocked`:
  - Renders the card's normal markup as children, but intercepts `onClick` (capturing phase) to open the modal instead of navigating.
  - Renders the locked hover overlay (lock icon + micro-copy + dim/blur layer) as a sibling, positioned absolutely over the card. The overlay listens for the parent's `:hover` via group/peer Tailwind pattern.
  - Disables the existing `bento-card--hover` class on the wrapped card while locked (passes a prop or uses a CSS class).
  - When `isUnlocked === true`: passthrough — children render with their original click handler and hover.
- **`mode="list-row"`:** Same interception logic; renders an inline lock icon and color shift instead of an overlay. Wraps a `CaseStudyListRow`.
- **`mode="page"`:** When `locked && !isUnlocked`: renders the full-page locked placeholder (title/subtitle/lock icon/CTAs/password) and ignores `children`. When unlocked: renders `children` (the real case-study content). Used inside `app/work/{slug}/page.tsx` and `app/play/{slug}/page.tsx`.

**SSR/hydration handling:**
- For `mode="card"` and `mode="list-row"`: SSR renders the unlocked appearance (no overlay). Lock state only adds an `onClick` interceptor and the hover overlay — both client-only behaviors, so there's no flash. Until hydration completes, clicking a locked card briefly navigates as if unlocked. We accept this — the gap is one render tick (sub-100ms typical) and the case-study page itself is also gated, so the user lands on the locked page placeholder. No content leak.
- For `mode="page"`: SSR renders the locked placeholder by default (assumes locked until proven otherwise). After hydration, if `isUnlocked` is `true`, swaps to children. This means an already-unlocked user sees the placeholder for one paint (~16ms) before content swaps in. Acceptable; if it becomes visible we'll switch to a `visibility: hidden` shell during the pre-hydration paint.

### `<UnlockModal>`

New file: `site/components/UnlockModal.tsx`.

- Renders nothing if `isModalOpen === false`.
- Uses Framer Motion's `<AnimatePresence>` for enter/exit. Mobile (≤sm): slide-up bottom sheet. Desktop: scale 0.95 → 1 + opacity 0 → 1, 200ms.
- Calls `useLock().unlock()` on submit. On true: 200ms delay, then `closeModal()`. On false: shake animation, error label.
- Click backdrop or Esc → `closeModal()`. Focus trap via `react-focus-lock` if already in deps; otherwise inline focus-trap logic (existing pattern in Theme Palette).

Mounted in `app/layout.tsx` as a sibling of `{children}`, inside the providers.

### `lib/locked-content.ts`

```ts
export const LOCKED_SLUGS: Set<string> = new Set([
  "fb-ordering",
  "compendium",
  "upsells",
  "checkin",
  "general-task",
  "design-system",
  "six-degrees",
  "pajamagrams",
  "custom-wrapped",
]);

export function isLocked(slug: string): boolean {
  return LOCKED_SLUGS.has(slug);
}
```

Single source of truth. To unlock a piece of content permanently (when it's ready), Marco removes its slug from this Set in one place.

### Integration points (existing files modified)

| File | Change |
|------|--------|
| `app/layout.tsx` | Wrap `{children}` in `<LockProvider><LockUIProvider>...</LockUIProvider></LockProvider>`. Mount `<UnlockModal />` as sibling. |
| `components/CaseStudyList.tsx` | **Remove the `galleryReadyStudies` filter at line 68** — pass all `filteredStudies` through. Wrap each `CaseStudyCard` and `CaseStudyListRow` in `<LockGate locked={isLocked(study.slug)} mode="card"\|"list-row" slug={study.slug}>`. |
| `components/Playground.tsx` | Wrap each card's `<Link>` in `<LockGate locked={isLocked(card.slug)} mode="card" slug={card.slug}>`. |
| `app/work/[slug]/page.tsx` | Wrap dynamic-route content in `<LockGate mode="page" ...>`. |
| `app/work/{6 dedicated routes}/page.tsx` | Each wraps its `Content` component in `<LockGate mode="page" locked={isLocked("...")} slug="..." title="..." subtitle="..." backHref="/work">`. |
| `app/play/{3 routes}/page.tsx` | Same pattern, `backHref="/play"`. |
| `.env.local` + `.env.example` | Add `NEXT_PUBLIC_UNLOCK_CODE_HASH=` (Marco generates one — see "Setting the password" below). |

### Setting the password

The build needs a SHA-256 hex digest of the chosen password.

```bash
echo -n "yourpassword" | shasum -a 256 | cut -d' ' -f1
```

Marco picks a code (something memorable, easy to share verbally — e.g., `"miyagi"`), runs the command, pastes the hash into `.env.local` as `NEXT_PUBLIC_UNLOCK_CODE_HASH`, and into Vercel's environment variables for the production build. Implementation includes a one-liner `npm run hash:code -- miyagi` script that prints the hash so Marco doesn't need to remember the shell command.

## Edge cases

- **localStorage unavailable** (Safari private browsing in some configs): unlock works in-memory for the session, doesn't persist. Acceptable.
- **Multiple tabs:** unlock in tab A doesn't propagate to tab B. We listen for `storage` events on `window` to sync. Cheap.
- **User clears localStorage:** they re-see locked state. Expected.
- **Wrong code 5+ times:** no rate limit. Casual nuisance only — there's no real secret to protect.
- **Modal opened without a locked card click** (e.g., if we add a manual "I have a code" entry point later): supported — `openModal()` is callable from anywhere.
- **Esc key while password input focused:** closes the modal. We don't intercept input-level Esc.
- **Unlock during page navigation** (locked page → unlocks → should the page rerender content?): yes — `<LockGate mode="page">` reads `isUnlocked` from context, so the swap is automatic on the same route.

## Testing

Unit / integration scope (no formal test framework currently set up for this repo — manual QA matrix below):

- [ ] Locked card on homepage `#work`: hover dims + lock + micro-copy. Click → modal.
- [ ] Locked card on `/work` page: same.
- [ ] Locked list row: title goes tertiary, lock icon appears, click → modal.
- [ ] Locked Playground card on homepage: video keeps playing at rest, hover dims + lock, click → modal.
- [ ] Locked Playground card on `/play`: same.
- [ ] Direct nav to `/work/fb-ordering` while locked: full-page placeholder with return arrow, lock icon, CTAs, password input.
- [ ] Direct nav to `/play/six-degrees` while locked: same.
- [ ] Modal: Email button opens mailto, LinkedIn opens new tab, password input accepts code.
- [ ] Wrong code: shake + error message.
- [ ] Correct code: modal closes silently, all locked cards visually unlock, locked page swaps to content if currently on one.
- [ ] Unlock persists across reload.
- [ ] Two tabs: unlock in tab A propagates to tab B via `storage` event.
- [ ] Esc closes modal. Backdrop click closes modal.
- [ ] Mobile (`<sm`): modal renders as bottom sheet.
- [ ] Modal focus trap: Tab cycles inside modal.
- [ ] Return arrow on locked page goes to `/work` (case studies) and `/play` (Playground).
- [ ] `lib/locked-content.ts`: removing a slug unlocks that single item without code changes elsewhere.

## Future work (out of scope)

- A "lock" toggle in the dev-only InlineEditor toolbar so Marco can preview locked/unlocked states without clearing localStorage.
- An "unlock all" URL parameter (`?unlock=miyagi`) for share links — would let recruiters skip the modal. Possible follow-up.
- A small unlock-success indicator (e.g., the ✸ star briefly accent-colored in the footer) — opt in if the silent unlock feels too quiet in practice.

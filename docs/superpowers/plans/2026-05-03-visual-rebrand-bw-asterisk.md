# Visual rebrand — B&W default + Geist asterisk Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove Claude-coded visual cues from the portfolio by neutralizing the default accent + glow colors and replacing the `✸` / `✦` glyphs with Geist Sans `*` (weight 500).

**Architecture:** Mechanical change. Three CSS variable edits in `globals.css` (`--color-accent` + `--color-glow` in both modes), 12 character replacements across 9 files (each gaining or preserving `fontWeight: 500`), 2 comment updates, manual visual smoke test, doc + auto-memory refresh. No layout, animation, or logic changes. The 10 colored themes are untouched (they each set their own `--color-accent` / `--color-glow` overrides).

**Tech Stack:** Next.js 14, Tailwind, Geist Sans (loaded site-wide via `--font-sans`), framer-motion (existing animations preserved).

**Spec:** `docs/superpowers/specs/2026-05-03-visual-rebrand-bw-asterisk-design.md`

---

### Task 0: Create feature branch

**Files:** none

- [ ] **Step 1: Verify clean working tree**

Run: `git status --short`
Expected: only `site/next-env.d.ts` and `site/tsconfig.tsbuildinfo` (auto-generated, safe to ignore).

- [ ] **Step 2: Create and switch to branch**

Run from repo root: `git checkout -b feature/visual-rebrand-bw-asterisk`
Expected: `Switched to a new branch 'feature/visual-rebrand-bw-asterisk'`

- [ ] **Step 3: Verify branch**

Run: `git branch --show-current`
Expected: `feature/visual-rebrand-bw-asterisk`

---

### Task 1: Neutralize accent + glow variables

**Files:**
- Modify: `site/app/globals.css:61-62` (light) and `site/app/globals.css:119-120` (dark)

- [ ] **Step 1: Edit light-mode `:root` block**

Use Edit on `site/app/globals.css`:

old_string:
```
  --color-accent: #B5651D;
  --color-glow: #B5651D;
```

new_string:
```
  --color-accent: var(--color-fg);
  --color-glow: var(--color-fg);
```

- [ ] **Step 2: Edit dark-mode `.dark` block**

Use Edit on `site/app/globals.css`:

old_string:
```
  --color-accent: #D4915E;
  --color-glow: #F5C28A;
```

new_string:
```
  --color-accent: var(--color-fg);
  --color-glow: var(--color-fg);
```

- [ ] **Step 3: Verify dev server still compiles**

Start (or check) dev server: `cd site && npm run dev`
Open `http://localhost:3000` in browser. Confirm: no compile errors in terminal, page renders without copper accents on hover/active states.

- [ ] **Step 4: Commit**

```bash
git add site/app/globals.css
git commit -m "$(cat <<'EOF'
chore(theme): neutralize default accent + glow

Default light/dark modes now use --color-fg for both --color-accent
and --color-glow, dropping the warm copper tint. Colored themes still
override these vars per palette so their look is unaffected.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 2: Replace `✸` in Hero.tsx (intro star + streak)

**Files:**
- Modify: `site/components/Hero.tsx:222` (wordmark star) and `site/components/Hero.tsx:243` (streak overlay)

Both spans currently render the bare character `✸` with no `fontWeight` style. Add `fontWeight: 500` to each `style` prop and swap the character.

- [ ] **Step 1: Replace the wordmark star**

Use Edit on `site/components/Hero.tsx`:

old_string:
```
          <motion.span
            layoutId="hero-star"
            style={{ display: "inline-block" }}
            transition={{ type: "spring", stiffness: 220, damping: 26 }}
            onLayoutAnimationComplete={handleLayoutAnimationComplete}
          >
            ✸
          </motion.span>
```

new_string:
```
          <motion.span
            layoutId="hero-star"
            style={{ display: "inline-block", fontWeight: 500 }}
            transition={{ type: "spring", stiffness: 220, damping: 26 }}
            onLayoutAnimationComplete={handleLayoutAnimationComplete}
          >
            *
          </motion.span>
```

- [ ] **Step 2: Replace the streak overlay**

Use Edit on `site/components/Hero.tsx`:

old_string:
```
              animate={streakKeyframes}
              transition={streakTransition}
            >
              ✸
            </motion.span>
```

new_string:
```
              animate={streakKeyframes}
              transition={streakTransition}
            >
              *
            </motion.span>
```

(The streak overlay shares the wordmark's container, so it inherits the new `fontWeight: 500`. No style change needed on this element.)

- [ ] **Step 3: Visual smoke check**

In browser: hard-refresh `http://localhost:3000`. Watch the intro animation play through:
- star1 blink → heading streams → star2 blink → bio streams.
- The blinking glyph should now be `*` rendering in Geist 500.
- Streak (light sweep) should still pass over the glyph.

If you've already seen the intro this session, clear sessionStorage to replay: in DevTools console run `sessionStorage.removeItem("portfolio-intro-seen")` and refresh.

- [ ] **Step 4: Commit**

```bash
git add site/components/Hero.tsx
git commit -m "$(cat <<'EOF'
feat(hero): swap ✸ → * (Geist 500) in intro star + streak

Both the wordmark star and the streak overlay render the new
brand glyph at weight 500. Animation timing untouched.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 3: Replace `✸` in HomeNav active marker

**Files:**
- Modify: `site/components/HomeNav.tsx:215-221`

- [ ] **Step 1: Replace active marker**

Use Edit on `site/components/HomeNav.tsx`:

old_string:
```
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.15 }}
            aria-hidden
          >
            ✸
          </motion.span>
```

new_string:
```
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.15 }}
            aria-hidden
            style={{ fontWeight: 500 }}
          >
            *
          </motion.span>
```

- [ ] **Step 2: Visual smoke check**

In browser: scroll the homepage to make the active section change between Home / Work / Playground. The active marker next to the section name should now be `*` at Geist 500. The spring nudge (y = activeIndex × 36) should still drive it.

- [ ] **Step 3: Commit**

```bash
git add site/components/HomeNav.tsx
git commit -m "$(cat <<'EOF'
feat(nav): swap ✸ → * in HomeNav active marker

Active section marker now uses Geist * at weight 500. Existing
spring nudge animation preserved.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 4: Replace `✸` in LoadingOverlay

**Files:**
- Modify: `site/components/LoadingOverlay.tsx:222-230`

- [ ] **Step 1: Replace loading-state mark**

Use Edit on `site/components/LoadingOverlay.tsx`:

old_string:
```
                    transition={{ layout: { duration: 0 } }}
                  >
                    ✸
                  </motion.span>
```

new_string:
```
                    transition={{ layout: { duration: 0 } }}
                    style={{ fontWeight: 500 }}
                  >
                    *
                  </motion.span>
```

- [ ] **Step 2: Visual smoke check**

LoadingOverlay shows during page transitions. Click any case study link from the homepage and back to trigger the overlay. The glyph in the overlay should be `*` at weight 500.

- [ ] **Step 3: Commit**

```bash
git add site/components/LoadingOverlay.tsx
git commit -m "$(cat <<'EOF'
feat(loading): swap ✸ → * in LoadingOverlay

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 5: Replace `✸` in MobileToolbar pill

**Files:**
- Modify: `site/components/MobileToolbar.tsx:153`

- [ ] **Step 1: Replace toolbar mark**

Use Edit on `site/components/MobileToolbar.tsx`:

old_string:
```
      <span aria-hidden style={{ fontSize: 14, lineHeight: 1 }}>✸</span>
```

new_string:
```
      <span aria-hidden style={{ fontSize: 14, lineHeight: 1, fontWeight: 500 }}>*</span>
```

- [ ] **Step 2: Visual smoke check**

Resize the browser below the `lg` (1024px) breakpoint or use mobile DevTools. The mobile chat pill should now show `*` (Geist 500) at 14px instead of ✸.

- [ ] **Step 3: Commit**

```bash
git add site/components/MobileToolbar.tsx
git commit -m "$(cat <<'EOF'
feat(mobile-toolbar): swap ✸ → * in chat pill

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 6: Replace `✸` in InlineTOC

**Files:**
- Modify: `site/components/case-study/InlineTOC.tsx:88-94`

- [ ] **Step 1: Replace TOC marker**

Use Edit on `site/components/case-study/InlineTOC.tsx`:

old_string:
```
            initial={{ opacity: 0, scale: 0.25, filter: "blur(4px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            transition={{ type: "spring", duration: 0.3, bounce: 0 }}
            aria-hidden
          >
            ✸
          </motion.span>
```

new_string:
```
            initial={{ opacity: 0, scale: 0.25, filter: "blur(4px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            transition={{ type: "spring", duration: 0.3, bounce: 0 }}
            aria-hidden
            style={{ fontWeight: 500 }}
          >
            *
          </motion.span>
```

- [ ] **Step 2: Visual smoke check**

Open any case study at `lg+` width (e.g. `/work/fb-ordering`). Scroll. The InlineTOC marker next to the active section should be `*` at weight 500. Scale-in animation (blur → sharp) still plays when section changes.

- [ ] **Step 3: Commit**

```bash
git add site/components/case-study/InlineTOC.tsx
git commit -m "$(cat <<'EOF'
feat(case-study): swap ✸ → * in InlineTOC marker

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 7: Replace `✸` in Chat surface (ChatBar + ChatMessage)

**Files:**
- Modify: `site/components/chat/ChatBar.tsx:67-72` (SparkGlyph)
- Modify: `site/components/chat/ChatMessage.tsx:91` (comment) and `site/components/chat/ChatMessage.tsx:135` (typing cursor)

- [ ] **Step 1: Replace SparkGlyph in ChatBar**

Use Edit on `site/components/chat/ChatBar.tsx`:

old_string:
```
function SparkGlyph({ size = 13, color = "var(--color-accent)" }: { size?: number; color?: string }) {
  return (
    <span aria-hidden style={{ fontSize: size, lineHeight: 1, color }}>
      ✸
    </span>
  );
}
```

new_string:
```
function SparkGlyph({ size = 13, color = "var(--color-accent)" }: { size?: number; color?: string }) {
  return (
    <span aria-hidden style={{ fontSize: size, lineHeight: 1, color, fontWeight: 500 }}>
      *
    </span>
  );
}
```

- [ ] **Step 2: Update ChatMessage comment + replace typing cursor**

Use Edit on `site/components/chat/ChatMessage.tsx` (comment update):

old_string:
```
  /** True only for the assistant turn currently receiving stream chunks.
   *  Renders a trailing ✸ cursor at the end of the text, blinking via the
```

new_string:
```
  /** True only for the assistant turn currently receiving stream chunks.
   *  Renders a trailing * cursor at the end of the text, blinking via the
```

Then use Edit on `site/components/chat/ChatMessage.tsx` (cursor replacement):

old_string:
```
          <span aria-hidden className="chat-typing-cursor" style={{ fontSize: "0.85em" }}>
            ✸
          </span>
```

new_string:
```
          <span aria-hidden className="chat-typing-cursor" style={{ fontSize: "0.85em", fontWeight: 500 }}>
            *
          </span>
```

- [ ] **Step 3: Visual smoke check**

Open the homepage with the chat bar visible. The pill's spark glyph should be `*` at weight 500. Send a message ("hi") and watch the assistant reply stream — the trailing typing cursor should be `*` blinking via the `.chat-typing-cursor` CSS class. Both should be in default fg color (no copper).

- [ ] **Step 4: Commit**

```bash
git add site/components/chat/ChatBar.tsx site/components/chat/ChatMessage.tsx
git commit -m "$(cat <<'EOF'
feat(chat): swap ✸ → * in SparkGlyph + typing cursor

Pill mark and assistant streaming cursor both render Geist * at
weight 500. Cursor blink CSS untouched.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 8: Replace `✸` in SeekBar thumb

**Files:**
- Modify: `site/components/music/SeekBar.tsx:115-116` (comment) and `site/components/music/SeekBar.tsx:127-130` (thumb)

- [ ] **Step 1: Update comment**

Use Edit on `site/components/music/SeekBar.tsx`:

old_string:
```
        {/* Thumb — uses the same ✸ blink-cursor character used elsewhere on
            the homepage (intro, loading state) for a consistent motif. */}
```

new_string:
```
        {/* Thumb — uses the same * blink-cursor character used elsewhere on
            the homepage (intro, loading state) for a consistent motif. */}
```

- [ ] **Step 2: Replace thumb glyph**

Use Edit on `site/components/music/SeekBar.tsx`:

old_string:
```
            opacity: showThumb ? 1 : 0,
            color: "var(--color-accent)",
          }}
        >
          ✸
        </span>
```

new_string:
```
            opacity: showThumb ? 1 : 0,
            color: "var(--color-accent)",
            fontWeight: 500,
          }}
        >
          *
        </span>
```

- [ ] **Step 3: Visual smoke check**

Open the music player (toolbar music button → expand). Hover over the SeekBar; the thumb that follows your cursor should be `*` at weight 500, in default fg color (was copper). Expanded thumb is fontSize 20, collapsed is 16 — both should render the new glyph.

- [ ] **Step 4: Commit**

```bash
git add site/components/music/SeekBar.tsx
git commit -m "$(cat <<'EOF'
feat(music): swap ✸ → * in SeekBar thumb

Thumb glyph and accompanying comment updated to the new brand mark.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 9: Replace `✦` in Marquee separator

**Files:**
- Modify: `site/components/Marquee.tsx:46-54`

- [ ] **Step 1: Replace separator**

Use Edit on `site/components/Marquee.tsx`:

old_string:
```
          <span
            className="mx-6"
            style={{ color: "var(--color-accent)", fontSize: "14px" }}
            aria-hidden
          >
            ✦
          </span>
```

new_string:
```
          <span
            className="mx-6"
            style={{ color: "var(--color-accent)", fontSize: "14px", fontWeight: 500 }}
            aria-hidden
          >
            *
          </span>
```

- [ ] **Step 2: Visual smoke check**

On the homepage, scroll to the testimonial Marquee strip. Separators between quotes should now be `*` at 14px weight 500 in default fg color (was copper `✦`).

- [ ] **Step 3: Commit**

```bash
git add site/components/Marquee.tsx
git commit -m "$(cat <<'EOF'
feat(marquee): swap ✦ → * in quote separator

Marquee separator now uses Geist * at weight 500 to match the
rest of the brand mark replacements.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 10: Visual smoke test — full pass

**Files:** none (verification only)

- [ ] **Step 1: Confirm dev server is clean**

In the dev server terminal, confirm no compile / lint warnings since the last refresh.

- [ ] **Step 2: Default light mode walkthrough**

- Hard-refresh `http://localhost:3000` (clear `sessionStorage` first if you want to replay the intro).
- Walk: hero intro → nav active changes as you scroll → marquee separators → chat pill spark → click into a case study (LoadingOverlay) → InlineTOC marker → music player + SeekBar thumb → mobile breakpoint MobileToolbar pill.
- All eight glyphs should be `*` at weight 500. None should be copper.

- [ ] **Step 3: Default dark mode walkthrough**

Toggle the theme palette to dark mode. Repeat the same walkthrough. Confirm pure neutral — no copper artifacts in the glow / accent / hover states.

- [ ] **Step 4: Verify all 10 colored themes still work**

Open the Theme Palette and click each colored swatch in turn (ocean, forest, wine, slate, ember, lavender, mint, rose, butter, sky). Each should render its OWN accent + glow color (the variable overrides in colored-theme classes are untouched). The brand glyph stays `*` in all themes.

- [ ] **Step 5: Build check**

```bash
cd site
npm run build
```

Expected: build succeeds with no errors.

- [ ] **Step 6: Commit (no code change — just confirm clean state)**

If anything regressed during verification, fix it now and commit before moving on. Otherwise no commit needed for this task — proceed to Task 11.

---

### Task 11: Update CLAUDE.md and auto-memory

**Files:**
- Modify: `CLAUDE.md` (Design Tokens table — accent rows in light + dark; Visual Style Updates section)
- Modify: `.claude/projects/-Users-marcosevilla-Developer-portfolio-2026/memory/MEMORY.md` (Architecture section)

- [ ] **Step 1: Update CLAUDE.md design tokens table**

Use Edit on `CLAUDE.md`:

old_string:
```
| `--color-accent` | `#B5651D` (copper) |
```

new_string:
```
| `--color-accent` | `var(--color-fg)` (neutral by default — colored themes override) |
```

Use Edit on `CLAUDE.md` (dark mode row):

old_string:
```
| `--color-accent` | `#D4915E` (copper) |
```

new_string:
```
| `--color-accent` | `var(--color-fg)` (neutral by default — colored themes override) |
```

- [ ] **Step 2: Add a brand-mark note to CLAUDE.md "Visual Style Updates" section**

Use Edit on `CLAUDE.md` to append at the end of the Visual Style Updates (Feb 2026) bullets:

old_string:
```
- H2 spacing: mb-3 (was mb-8)
```

new_string:
```
- H2 spacing: mb-3 (was mb-8)
- Brand mark (May 2026): `*` (Geist Sans, weight 500) replaces `✸` / `✦` everywhere (hero intro, HomeNav active, marquee, InlineTOC, MobileToolbar pill, ChatBar SparkGlyph, ChatMessage typing cursor, SeekBar thumb, LoadingOverlay). Default `--color-accent` and `--color-glow` aliased to `--color-fg` for pure-neutral default mode; colored themes still override per-palette.
```

- [ ] **Step 3: Append to MEMORY.md index**

Use Edit on `/Users/marcosevilla/.claude/projects/-Users-marcosevilla-Developer-portfolio-2026/memory/MEMORY.md`:

old_string:
```
- [Cherry-pick rebased branches onto fresh main](branch-divergence-cherry-pick.md) — when a feature branch diverges via rebase, close the PR and cherry-pick onto fresh main instead of merging
```

new_string:
```
- [Cherry-pick rebased branches onto fresh main](branch-divergence-cherry-pick.md) — when a feature branch diverges via rebase, close the PR and cherry-pick onto fresh main instead of merging
- [Brand mark + neutral default (May 2026)](brand-mark-neutral-default.md) — `*` (Geist 500) replaces ✸/✦; default accent/glow aliased to fg for pure neutral; colored themes unaffected
```

- [ ] **Step 4: Create the new memory entry**

Use Write on `/Users/marcosevilla/.claude/projects/-Users-marcosevilla-Developer-portfolio-2026/memory/brand-mark-neutral-default.md`:

```markdown
---
name: Brand mark + neutral default (May 2026)
description: After Claude-coded feedback, replaced ✸/✦ with Geist `*` weight 500 site-wide and neutralized default accent + glow to fg
type: project
---

Outside feedback flagged the site as Claude-coded due to (a) the `✸` heavy 8-pointed star and (b) warm copper accent. Resolved on 2026-05-03 in branch `feature/visual-rebrand-bw-asterisk`.

**Why:** Job-hunting context — site needs to read as Marco's, not as Claude's. The 10 colored themes preserve color expression as opt-in.

**How to apply:**
- New brand mark is `*` (Geist Sans, weight 500). Use it for any new spark / cursor / active-marker UI.
- Default `--color-accent` and `--color-glow` are aliased to `--color-fg` in `:root` and `.dark`. Don't reintroduce copper as the default.
- Colored themes (ocean / forest / wine / slate / ember / lavender / mint / rose / butter / sky) override `--color-accent` and `--color-glow` per palette — keep that pattern.
- If a future surface needs a "spark" mark, default to `*` weight 500. Don't reach for ✸ / ✦ / `★` — they read as Claude / generic / cliché respectively.
```

- [ ] **Step 5: Commit doc + memory updates**

```bash
git add CLAUDE.md
git commit -m "$(cat <<'EOF'
docs: reflect B&W default + Geist * brand mark in CLAUDE.md

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

(Memory files live outside the repo — Step 4's Write + Step 3's Edit do not need a git commit.)

---

### Task 12: Push branch + open PR

**Files:** none

- [ ] **Step 1: Push the branch**

```bash
git push -u origin feature/visual-rebrand-bw-asterisk
```

- [ ] **Step 2: Open PR**

```bash
gh pr create --title "Visual rebrand — B&W default + Geist * brand mark" --body "$(cat <<'EOF'
## Summary
- Neutralize default `--color-accent` and `--color-glow` (light + dark) so default mode reads as pure B&W. Colored themes unchanged.
- Replace `✸` (and one `✦`) with Geist Sans `*` at weight 500 across 9 components: Hero intro, HomeNav active marker, LoadingOverlay, MobileToolbar pill, InlineTOC, ChatBar SparkGlyph, ChatMessage typing cursor, SeekBar thumb, Marquee separator.
- Update CLAUDE.md design-token table + auto-memory.

## Why
Outside feedback flagged the site as Claude-coded due to the 8-pointed star + warm copper. This rebrand keeps the colored themes as opt-in but ships a neutral, typographic default.

## Test plan
- [ ] Hard-refresh and play hero intro — both blink phases render `*` cleanly
- [ ] Scroll homepage — HomeNav active marker is `*`; nudge animation works
- [ ] Marquee separators between quotes are `*` in fg color (was copper)
- [ ] Click into a case study — LoadingOverlay glyph is `*`; InlineTOC marker is `*`
- [ ] Open chat pill, send a message — SparkGlyph `*` and streaming cursor `*` both render at fg color
- [ ] Open music player and hover SeekBar — thumb is `*` at fg color
- [ ] Below `lg` breakpoint — MobileToolbar pill mark is `*`
- [ ] Toggle through all 10 colored themes — each retains its own accent / glow color
- [ ] Toggle dark mode — pure neutral, no copper artifacts
- [ ] `npm run build` succeeds

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

Expected: PR URL printed.

- [ ] **Step 3: Confirm with user before merging**

Wait for user to review the deployed Vercel preview and approve before merging.

# Opportunities Audit — 2026-08-15

Run after the 5 greenlit copy-drift cleanups landed (`ec8a5cb`). **Report only — nothing below
was changed.** Each item says what's wrong, what it costs, and what the fix is.

Items already tracked in the Todoist "Portfolio fixes" project are **not** repeated here except
where this audit changes their priority. New findings only.

---

## Tier A — Broken or factually wrong

### A1. Chat lost the Design System draft in the 08-10 rename ⚠️ CONFIRMED

`lib/chat/case-study-content.ts` maps two slugs to markdown files that **do not exist**:

| slug | maps to | actual file |
|---|---|---|
| `general-task-design-system` | `general-task-design-system.md` | `design-system.md` |
| `canary-guest-hub` | `canary-guest-hub.md` | `compendium.md` |

Proof — this prints on every `npm run build`:

```
[chat] case-study markdown missing: general-task-design-system.md
```

The rename renamed the *keys* and accidentally rewrote the *values* to match. Effect: the Design
System study — which is **unlocked and public** — runs metadata-only in chat. Ask the bot about it
and it has the title, company, role, year and one metric, and nothing else. Guest Hub has the same
break but is currently masked because `isLocked()` returns `""` before the file lookup ever runs;
it becomes live the moment that study unlocks.

**Fix:** two string values. `readStudy()` already swallows the miss with a `console.warn`, which is
why this survived five days — worth considering whether a missing file for an *unlocked* slug
should fail the build instead.

### A2. The site says you still work at Canary — in three places

You were terminated 2026-07-29. Three surfaces still say otherwise:

1. **`app/layout.tsx:60` + `:65`** — the site `description` and the OG description: *"Currently at
   Canary Technologies, designing platforms for Marriott, Wyndham, Best Western, and IHG."* This is
   the text Google shows under your name and the text that appears in every Slack/LinkedIn/iMessage
   link unfurl.
2. **`lib/chat/system-prompt.ts:65`** — the chat bot's identity line: *"You are a Product Designer
   based in San Francisco, currently at Canary Technologies. You are job-hunting…"* It will say this
   in first person, confidently, to a recruiter.
3. **`lib/resume-content.ts:30` + `:60`** — the summary opens *"Currently lead designer for two of
   Canary's top-4 revenue products"*, and the job entry reads `period: "Sept 2023 – Present"`.

Given you're actively interviewing and have "why I left" reps queued, a portfolio that asserts
current employment is the worst possible version of that conversation to walk into.

**Fix:** a tenure end date and a tense pass across the three files. The end date and how you want to
frame it are yours to decide — the rest is mechanical once you say the words.

### A3. Everything above is invisible anyway — the site-wide gate is still ON

`lib/site-gate.ts:18` — `SITE_GATE_ENABLED = true` since 2026-08-06. Cookie-less requests get a
401 gate page on **every** route. That means crawlers, link unfurls, and any recruiter you send a
URL to. Already tracked in Todoist; restating because A2 and C2 don't matter until it flips.

---

## Tier B — Credibility gaps a reviewer will see

### B1. Two of eight homepage cards render a grey "Under construction" box

`lib/gallery-content.ts` — `knowledge-base` has **no key at all**, `ai-workflow` has an **empty
array** (media pulled 2026-08-01 pending portfolio permission). Both fall through
`CaseStudyList.tsx:862`'s `!hasMedia` branch to the grey placeholder.

The design-system card that was flagged on 08-06 is fixed — it has real media now. These two are
what's left. On a page whose whole job is "look at my work," 25% of the grid says the work isn't
ready.

**Options:** source media for each · give them the layered-frame treatment design-system got ·
or drop them from the marquee until they have art.

### B2. Three case studies have thousands of words and zero images

| study | words | images | lock state |
|---|---|---|---|
| canary-guest-hub | ~2,511 | **0** | locked |
| knowledge-base | ~2,369 | **0** | locked |
| ai-workflow | ~1,079 | **0** | **unlocked** |

`ai-workflow` is the live one — a thousand words of unbroken prose on a public page. The two locked
ones are the reason they're locked, but they're also the two carrying $1.51M CARR and the AI story.

### B3. Guest Hub may no longer need its lock

It was re-locked 2026-07-27 as "pulled back to in-progress." As of today it has **zero
`ImagePlaceholder` calls** — the thing locks exist to hide. It's 2,511 words carrying $1.51M CARR ·
+230% YoY · 44% attach, and it's the #2 card on the homepage.

It still has no images at all (B2), so this isn't an automatic unlock — but the stated reason for
the lock is gone, and right now positions 2 and 3 of your carousel are both gated.

---

## Tier C — Reachability

### C1. Every URL in the sitemap is a redirect

`public/sitemap.xml` lists all 8 URLs on the apex `https://marcosevilla.com`. Per CLAUDE.md the
apex 307s to `www`. A sitemap of redirects is a soft SEO penalty and makes the file useless as a
canonical signal. Same for `metadataBase` and `openGraph.url` in `app/layout.tsx` (both apex).

**Fix:** pick one canonical host and use it in all three places. Worth confirming the redirect
direction with a `curl -I` first.

### C2. Four studies and the homepage still have no OG image

Have one: fb-ordering, check-in, general-task, design-system. Don't: **the homepage**, guest-hub,
guest-upsells, knowledge-base, ai-workflow.

The homepage is the one that matters most — it's the URL you'd actually paste into an application
or a DM, and it currently unfurls as a bare text card. A single designed 1200×630 site card fixes
it and is reusable as the fallback for the other four.

---

## Tier D — Code hygiene (low stakes, cheap)

### D1. `thumbnail:` is parsed and consumed by nothing

Today's cleanup deleted the 5 dead paths; the field itself is still dead. `lib/content.ts:21,52`
reads it into `StudyMeta`, `lib/types.ts:6,22` declares it, and **no component reads it**. The 3
surviving values (`checkin`, `general-task`, `design-system` heroes) are real files that nothing
renders.

**Fix:** delete the field from both types and both readers, or wire it as the marquee card fallback
(which would also solve B1 for `knowledge-base`, whose hero.png doesn't exist either).

### D2. Four legacy drafts in `case-studies/` are unmapped

`above-property-portal.md`, `checkin-dashboard-2.md`, `fb-mobile-ordering-v2.md`,
`fb-mobile-ordering-benji.md` are in no `FILENAME_BY_SLUG` entry — not fed to chat, not rendered
anywhere. Two of them still carry the un-reconciled "Canary Technologies" (deliberately left out of
today's batch, since fixing copy in a file nothing reads is busywork).

**Fix:** move to `case-studies/_archive/` so the live drafts are unambiguous, or delete.

### D3. Lint: 32 warnings, 0 errors — no action

Checked. Same graded non-defects from the 2026-08-05 config (hydration `setState`-in-effect,
self-referencing rAF callbacks). Nothing new landed. Noted so it isn't re-audited.

---

## Verified clean

- All 8 slug-sync sets agree post-rename: `LOCKED_SLUGS`, `STUDY_ROUTES`, `STUDY_METADATA`,
  `SLUG_TO_FILE`, `STUDY_TAGS`, `gallery-content`, `content/*.mdx`, sitemap. Only
  `FILENAME_BY_SLUG` (A1) broke.
- All 8 `NextProject` targets point at unlocked studies — no gate dead-ends.
- fb-ordering's 3 `ImagePlaceholder` calls are commented out (Marco, 2026-07-15), not rendering.
- `tsc` clean · `npm run build` succeeds, 18 routes · 22/22 study-meta assertions.

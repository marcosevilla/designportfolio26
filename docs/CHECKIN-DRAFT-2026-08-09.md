# Check-in Rewrite — Draft for Marco's Review (2026-08-09)

**Not shipped copy.** Draft + recommendation only; the live page is untouched.

## Recommendation first

Rebuild the page as a focused **"Check-in Dashboard 2.0"** case study with honest
contributor framing — your own critique's option A, and your retrospective's explicit
correction: *"I was a contributor, not the lead"* (Wenjun Zhao led; you owned visual
craft, motion, accessibility, and specific feature slices). Sources agree the current
page is the portfolio's weakest — company-overview voice, company-wide vanity stats,
no decisions, no reflection. The honest version is *stronger*, not weaker: shared
ownership at enterprise scale is exactly the "senior IC" story, and the assessment
already ranks Check-in's selling point as "enterprise pressure, shared ownership."

**The overclaim risk is live:** the current repo draft (`case-studies/checkin-dashboard-2.md`)
frames you as designing Dashboard 2.0's core patterns. The retrospective attributes the
dashboard IA, checklist component, and auto-check pattern to Wenjun. Anyone who checks
references hits that gap. This rewrite closes it.

---

## Draft copy

### Hero
**Title:** Check-in at enterprise scale
**Subtitle:** Craft, accessibility, and feature design on Canary's flagship check-in
product — as one of three designers shipping inside the Wyndham enterprise deal's timeline.

### Quick stats (see verification table before shipping)
- **~6,000** Wyndham properties on the platform
- **~$3.2M** Wyndham activation revenue, Q1 2026
- **~40** accessibility gaps found + closed in the keyboard audit
- **5** designers across the product's life — I owned the 2024 craft-and-polish era

### My role (the honest block — the page's spine)
> Check-in 2.0 was led by Wenjun Zhao; I joined an already-running team in late 2023 as
> the designer for visual craft, motion, and accessibility. I designed the Mobile Key
> flow, loading and empty states, the Wyndham Rewards loyalty integration, and the
> keyboard accessibility audit that became a company-wide baseline. I did not design the
> dashboard architecture — my job was making a fast-moving enterprise product feel
> considered, and leaving the next designer a system instead of a file pile.

### Key decision 1 — The keyboard audit (craft story, lead with this)
Shadowing front-desk staff at StayPineapple: "the mouse is too slow." Instead of another
visual exploration (VP feedback that shaped me: "BE GROUNDED IN THE DATA"), I audited
every dashboard interaction against keyboard patterns — ~40 gaps — and shipped the fixes
(DSN-233). The pattern was adopted by Compendium and the F&B admin dashboard. Frame:
*diagnosing the actual problem beats exploring three options.*

### Key decision 2 — Designing inside a live enterprise deal
Canary won Wyndham from the "99% yard line" against an incumbent; Check-in 2.0 shipped
inside that deal's timeline. Jan 2024 corporate review feedback had to become shipped
design in days. The Wyndham Rewards integration (DSN-118) mapped their loyalty tiers into
the reg-card flow — design work that directly touched deal economics. Frame: *speed with
judgment under enterprise constraints.*

### Key decision 3 — A failed direction, told straight
The Mobile Key vision explicitly rejected kiosks ("a huge distraction"). Eleven months
later the Wyndham rollout was kiosk-led — strategy reversed under sales pressure, and my
Mobile Key designs were built on the reversed premise. What I'd do differently: write the
strategy retro at the reversal, not after. *(This is the only "failed direction" story in
the whole portfolio — the assessment flags that gap on every study.)*

### Handoff (closer)
Before rotating to IHG work, I wrote the CI/CO/Compendium UX documentation (DSN-610) as
the handoff artifact. "I left the next designer a system, not a stack of inherited Figma
files."

### Quote (keep the existing one — it's real and specific)
Wenjun Zhao: "He helped define the new UI patterns for the Check-in 2.0 project, which
evolved into more extensible patterns that we can now apply across other Canary products."

---

## Stats verification table — resolve before shipping

| Stat | Status |
|---|---|
| ~6,000 Wyndham properties | Solid (multiple sources) |
| ~$3.2M Q1 2026 Wyndham revenue | Solid (internal Slack, Apr 2026) — check shareability |
| ~40 keyboard-audit gaps | Your own draft's number — confirm from the audit doc |
| ~12% reg-card lift, ~9% completion lift | ⚠️ Your retro flags these as **unanchored** — verify or cut |
| 100+ hotels on 2.0 / conversion funnel %s | ⚠️ Same flag — verify or cut |
| $3.5M ARR / +80% adoption (current live page) | Company-wide, not yours — cut per your critique |

## Open questions for you

1. Ship the rebuild, or option B (brief "My Work at Canary" overview) / C (cut the page)?
2. Can the $3.2M / ~6,000 figures be public, or do they need fuzzing ("multi-million")?
3. Keep the Compendium/messaging sections on this page, or let those products' own pages
   carry them and keep this page purely Dashboard 2.0?
4. The title-vs-H1 mismatch ("Hotel Check-in" vs "Modernizing Hotel Software") gets
   resolved by whatever title you pick here — see COPY-DRIFT-2026-08-09.md.

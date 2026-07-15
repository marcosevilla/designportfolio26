---
title: F&B Mobile Ordering — v2 working draft
status: working — Marco editing
created: 2026-07-14
seeded-from: live TSX (2026-07-14 condensed version)
fact-sources: retrospective-2026-04-30 (Obsidian), case-study-draft (honest draft, Obsidian), rewrite-state-2026-05-06 (Obsidian)
---

# F&B Mobile Ordering — v2 working draft

**How to use this file:** the plain text is the current live copy, section by section. Anything marked `✏️` is a slot for you to type — rough bullets are fine, shaping comes later. Delete anything you don't want. When you're happy, this replaces `fb-mobile-ordering.md` and gets ported to the live page (`FBOrderingContent.tsx`).

---

## Verified numbers — safe to use (source: retrospective 2026-04-30)

- **$23K committed CARR** within the first 5 weeks of customer launch ($10K in Feb alone)
- **56% win rate** at launch; **28 demos in the first 6 weeks**
- HOMA marketing testimonial: *"Improved order accuracy, reduced wait times, and made the overall process much more efficient."*
- **60 live coffee orders** at the ITB Berlin trade-show booth
- First LATAM win: **Hotel Unique São Paulo**. First POS-integrated customer: **The Blackwell Inn** (Oracle Simphony)
- All **three Q1 KR initiatives hit** by Mar 31, 2026
- Email-led pipeline — most meetings came from email vs. Canary's usual 9%
- Timeline: **MVP in ~4 months (Aug–Dec 2025); full arc Aug 2025 → Apr 2026** (modifiers, allergens, alt-locations, SMS/WhatsApp notifications, Simphony POS)

## Numbers on the live page to retire

- "50 pilot orders," "$25K+ in *potential* ARR," "two verbal commitments" — that's the Dec 2025 story; replace with the verified list above
- "I took it from concept to production in four months" — true for MVP only; the shipped product is 9 months of scope
- ⚠️ Do NOT reuse from old drafts without checking: "93/100 issues," "30 iterations in 4 days," "6.5 hrs saved per 100 orders," the object-model iteration story in the benji draft (fabricated — see rewrite-state doc)

---

## Hero / subtitle

**Current:** "I led the design of a mobile ordering system for hotels: guest ordering, a menu CMS, and a staff fulfillment dashboard. I took it from concept to production in four months."

Critique says: this is a product description, not a hook. Lead with stakes or outcome.

✏️ *Your rewrite:*

---

## The Problem

**Current (mostly fine — keep or lightly touch):**

Hotels lose F&B revenue when guests have to call the front desk to order room service: misheard orders, tied-up staff, and enough friction that many guests just open DoorDash instead. Meanwhile, Canary was losing deals in APAC markets where mobile ordering is table stakes.

Canary's Guest Hub was still a static content product. F&B ordering would make it transactional: a revenue engine, not just an info layer. The discipline was scope: no marketplaces, no kitchen software. Just get a guest's order to staff efficiently.

✏️ *Optional: open with a specific moment instead of a general statement (door-hanger breakfast story, or the July 31 panic origin — see arc bank below):*

---

## The Solution

**Current first two paragraphs (weakest prose on the page — "easily" twice):**

We built a mobile-first ordering experience for our guests that served as an extension to our existing guest experience platform. Guests can browse available menu items, add to their carts, and then send their orders to hotel staff easily.

To manage inbound orders, we built a dashboard and notification system that enabled operators to easily notify their kitchen staff and complete fulfillment. There were four major decisions that defined the design:

✏️ *Your rewrite:*

**Current four decisions (keep, trim, or reorder):**

1. **Built upon our existing infrastructure** — designed as an extension of the guest experience + upselling platforms to go to market fast
2. **Delivery type drives the experience** — in-room vs. poolside/lounge determines checkout, auth, and staff workflow
3. **Five system objects as the IA backbone** — Ordering Outlets, Menus, Items, Modifier Groups, Orders
4. **Works with or without a PMS** — reservation-linked when integrated, manual entry fallback for everyone else

✏️ *Notes on the decisions (e.g., the engineer's question that triggered #2 — "why do we need the user to log in here, but not over there?"):*

---

## Research & Discovery

**Current (single paragraph):**

Customer interviews with hotel F&B staff, competitive analysis, and usability testing on a fully interactive Next.js prototype I built, which went on to become the primary demo tool for sales calls and GTM enablement. The research drove three calls: no POS requirement (a POS dependency would have blocked 80%+ of potential customers), a staff dashboard sorted by time-elapsed urgency so orders never get missed during peak hours, and a no-download mobile web flow using patterns guests already know.

✏️ *Optional adds — the critique's biggest open gap is a rejected direction. POS-first vs. POS-optional is the obvious one (you even doubted the call in September and proposed a bespoke Simphony build; Nico said no; the OKR miss was the right trade):*

---

## Impact & Results

**Current (stale — replace):**

F&B Ordering hit GA in February 2026 with two verbal commitments from demos alone and 50 pilot orders validating demand before launch. The delivery-type model became the architectural pattern for all future ordering scenarios (spa, activities, table-side), and APAC enterprise interest is building, with $25K+ in potential ARR from interested properties.

**Suggested skeleton (verified numbers):**

Mobile Ordering launched in January 2026 and went GA in February. Within five weeks it had $23K in committed ARR, a 56% win rate, and 28 demos — plus Canary's first LATAM win (Hotel Unique São Paulo) and first POS-integrated customer (The Blackwell Inn). HOMA's team in Thailand put it best: "Improved order accuracy, reduced wait times, and made the overall process much more efficient." The delivery-type model became the architectural pattern for every future ordering scenario (spa, activities, pickup).

✏️ *Your version:*

---

## Reflection

**Current bullets (all solid — keep):**

- **Prototype in code, early.** Hotel staff testing realistic flows made research dramatically more effective, and the prototype became a genuine GTM asset.
- **Find the one variable.** The delivery-type insight collapsed dozens of edge cases into a single configurable model. Designing for two audiences means designing the system, not the screens.
- **I'd push harder on staff notifications in the MVP.** Post-launch feedback from HOMA showed hotels needed immediate alerts.

✏️ *Open decision from the rewrite-state doc: include the validation-gap arc? (20 scheduling tickets with no named customer → you emailed Liz Cannata at Savannah Sunset and ran the call yourself → "more usable insight than the previous twenty internal reviews combined.") It reframes the study from "I designed a product" to "I learned to drive discovery." Your call — write it here if yes:*

---

## Arc bank (from your honest draft — steal freely, all true)

1. **Panic origin.** July 31, 2025: leadership's "no designs without five customer conversations — what happened?" message. You DMed Nico for the F&B prototype, got a v0.dev link, had a first pass at the hotel-facing UI by that evening, and within 48 hours were arranging walk-ins at El Prado, Dream Inn, and La Bahia. The v0 frame is still in the Figma file.
2. **The engineer's question.** "Why do we need the user to log in here, but not over there?" → an hour staring at the IA → "all hotel ordering boils down to one question: where does the food go?" Six checkout scenarios collapsed into one decision.
3. **The doubt.** September 2025, late-night DM to Nico proposing a bespoke single-property Simphony build to save the OKR. He said no. You took the 40% OKR miss — and it was the right trade; POS-optional is what unlocked the no-PMS market in April.
4. **The validation gap.** March 2026: 20 active scheduling tickets, zero named customers. One 30-minute call with Liz Cannata beat twenty internal reviews.
5. **ITB Berlin.** 60 live coffee orders at the booth — the product running in public.

---

## Image / graphic slots

- [ ] Delivery-type branching diagram (the signature insight; scenario matrix in `cuddly-nibbling-parnas.md`)
- [ ] Prototype evolution strip: v0.dev → Figma → code prototype on Vercel
- [ ] Five-object IA diagram
- [ ] Verified / unverified / walk-in badge states on staff dashboard
- [ ] Unused assets ready now: `fb-browse-menu.png`, `fb-cart-review.png`, `fb-item-detail.png`, `fb-landing-page.png` (in `site/public/images/fb-ordering/`), `fb-mobile.mp4` (in `site/public/videos/`), 13 raw shots in `docs/fb-gallery/`
- [ ] Figma node links for remaining exports: see Visual Gallery section of `fb-mobile-ordering.md`

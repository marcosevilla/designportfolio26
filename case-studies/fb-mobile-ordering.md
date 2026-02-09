# F&B Mobile Ordering

---

## CARD VIEW

```
[TODO: Cover image — hero shot of guest ordering flow on mobile, 16:9]

F&B MOBILE ORDERING
End-to-end mobile ordering that drives hotel revenue

Canary Technologies • 2025 • Lead Designer

Interaction Design • Mobile • User Research
```

---

## CASE STUDY PAGE

### Hero Section

```
← Back to Work

# F&B Mobile Ordering

A mobile, app-less food and beverage ordering system that lets hotel guests browse menus and place room service orders from their phone.

---

Company          Canary Technologies
Timeline         5 months (Aug 2025 – Jan 2026)
Role             Lead Designer (100% design ownership)
Team             1 Designer, 3 Engineers (Joanne Chevalier, Andrea Bradshaw, Luciano Guasco), 1 PM (Nico Garnier)
```

---

### Quick Stats

```
┌─────────────────┬─────────────────┬─────────────────┬─────────────────┐
│  100%            │  30              │  93/100          │  6.5 hrs        │
│  Design          │  Iterations in   │  Issues shipped  │  Saved per 100  │
│  ownership       │  4-day sprint    │  (96% complete)  │  orders (est.)  │
└─────────────────┴─────────────────┴─────────────────┴─────────────────┘
```

---

### The Problem

Hotels lose significant F&B revenue when guests have to call the front desk to order room service — a process that ties up understaffed front desks, leads to misheard orders, and creates enough friction that many guests just open DoorDash instead. One hotel we spoke to described their breakfast system using door hangers — guests would forget to hang them, staff would miss pickups, and complaints piled up. Physical menus required sanitization, were expensive to print, and costly to update when items changed.

Canary's initiative was to increase average revenue per room per month from $5.10 to $10, and in-room dining was one of the biggest untapped levers. The competitive landscape was real — Toast offered mobile ordering at $7/month, and dedicated hospitality platforms like Iris had locked in relationships with major brands like Marriott. Iris reported 20–40% more ancillary revenue from mobile ordering, and individual properties showed dramatic results: W Barcelona saw a 60% increase in average check size, JW Marriott Phoenix 40%, and Mandarin Oriental Munich 20% YoY F&B revenue growth. Without a native ordering experience embedded in the guest journey, hotels were leaving money on the table and losing orders to third-party delivery apps.

---

### The Solution

I designed a mobile-first ordering flow embedded directly in Canary's Digital Compendium — from menu browsing to order confirmation — alongside a staff fulfillment dashboard for managing incoming orders in real time.

[TODO: Hero mockup — guest ordering flow showing menu → item detail → cart → confirmation]

#### Key Design Decisions

1. **Menu-first landing**
   Guests land directly on the restaurant's menu, not a hotel info page. I prioritized showing food immediately because research showed guests arrive with intent to order — removing friction between "I'm hungry" and "here's what's available" was the biggest conversion lever.
   [TODO: Visual — menu landing screen]

2. **Delivery type drives the entire experience**
   I identified that all hotel ordering workflows share a common variable: where the food goes. This became the central design insight — in-room vs. alternative location (pool, lounge) determines the checkout flow, authentication requirements, and staff fulfillment workflow. Hotels configure this per outlet, and the guest experience adapts automatically. This simplified what could have been dozens of edge cases into a clean, scalable model.
   [TODO: Visual — diagram showing delivery type → checkout flow branching]

3. **Five system objects as the IA backbone**
   The design is built on five interconnected objects: Service Locations (contextual entry points — in-room, poolside, lobby — that control which menus are available), Menus (curated item groups organized by meal period, assigned to one or more locations), Item Library (a centralized repository of reusable items with name, price, and modifiers — created once, used across multiple menus), Modifier Sets (grouped customization options — sides, additions, substitutions — that can be applied to multiple items), and Orders (guest requests with full lifecycle tracking from submission through fulfillment). This object model meant hotels manage items in one place and compose menus flexibly, and pricing can be overridden per menu without duplicating items.
   [TODO: Visual — system object relationship diagram]

4. **Reservation-linked ordering with graceful fallbacks**
   For PMS-integrated hotels, orders tie to guest reservations — contact details pre-fill, identity is verified, and staff see a trust badge. For non-PMS hotels or walk-in visitors (poolside), I designed a manual entry flow that still captures everything staff need to fulfill the order. This let us ship to a much wider range of hotels without waiting for POS integrations.
   [TODO: Visual — verified vs. unverified vs. walk-in badge states on staff dashboard]

5. **Built on Upsells infrastructure, designed for F&B**
   Rather than building from scratch, F&B ordering reuses Canary's existing Purchase Order system from Upsells. I designed the staff experience to feel native to F&B — color-coded priorities, time-elapsed sorting, dedicated notification settings — while engineering could ship faster by leveraging existing backend rails. This architectural decision also meant PMS folio posting worked out of the box.
   [TODO: Visual — staff order fulfillment dashboard]

---

### [+] Research & Discovery

#### What I Learned

**Research methods used:**
- Customer interviews with hotel F&B staff (The Pines Resort, COMO Hotels, Eurostar, Embassy Suites Times Square, Chateau Avalon, Malibu Beach Inn)
- Prototype usability testing with hotel staff (POS connection flow, menu management) and guests (ordering flow)
- Competitive analysis of hotel ordering solutions (Aigens, Duve, Toast Mobile, Lightspeed, Iris/Marriott)
- Design jams with engineering team to validate technical feasibility and data model decisions
- Live pilot feedback from HOMA Cherngtalay (Thailand) and Omni Hotels

**Key insights:**
1. Hotels' biggest pain is phone-based ordering during peak hours — one hotel (Chateau Avalon) described guests calling an understaffed front desk, staff taking orders manually, preparing food, delivering it, then manually charging the folio. They estimated the product would save them over $2,000/year just from eliminating physical menus and reducing errors. → I designed the staff dashboard to sort by time elapsed (oldest first) with visual urgency indicators so nothing gets missed.
2. Most hotels don't have POS integrations and won't for a while — requiring POS would block 80%+ of potential customers. When a sales rep asked "F&B ordering works for any hotel right? No integrations needed?" that validated the no-POS-required approach. → I designed the full ordering flow to work without any POS, using manual menu management and email/SMS notifications to staff.
3. Guests expect the speed and simplicity of consumer apps like DoorDash — anything that feels "hotel software" will kill adoption. A job candidate told our VP of Product that he experienced Canary's F&B ordering poolside at a COMO hotel in Thailand: "I didn't have to walk 100 meters to place an order — I could do everything from my phone and have food sent straight to my spot." → I designed the guest experience as a mobile-optimized web flow (no app download) with familiar patterns: tap to add, cart summary, one-tap submit.
4. Hotels need to test the ordering experience before going live with guests. → I designed a dedicated test mode so staff can walk through the full guest flow without it being visible to actual guests.
5. Menu availability timing matters — hotels serve different menus at different times of day, and competitors like the Stay app just dump all menus regardless of time. → I designed time-aware menu availability, taking direct inspiration from how Uber Eats handles this, with a menu selector dropdown that clearly indicates which menus are currently available for ordering.

**Research artifact:**
I built a fully interactive prototype (Next.js + React, deployed to Vercel) that evolved over several weeks — starting with order management screens (Nov 5), expanding to menu management (Nov 11), then a full functional demo with 50+ pre-loaded items and real cart persistence (Nov 17), then AI-powered menu parsing using Claude's API (Dec 2), and finally the modifier system (Dec 23). This wasn't a throwaway prototype — it became the primary demo tool for sales calls, GTM enablement, and stakeholder reviews. Marketing used it for sales slides, and the PM used it on live customer calls that led to our first verbal commitments.

---

### [+] Design Process

#### How I Got There

**Approach:** Ship the simplest version that solves the core problem, then expand based on real customer feedback.

[TODO: Visual — early Figma explorations, wireframes of ordering flow]

**Iterations:**
- **Research phase (Aug 2025):** Set up customer calls, wrote research scripts, and built code prototypes to validate requirements with hotel staff. Tested usability of both the staff setup experience (POS linking, menu management) and the guest ordering flow. Early design jams with engineering surfaced that food ordering is "a complex process with its own operational and integration challenges" — this shaped my decision to start simple and avoid POS dependencies.
- **MVP sprint (Sep 2025):** 30 iterations in a focused 4-day sprint to nail the core guest ordering flow — menu browsing, item selection, cart review, order submission, and confirmation with ETA.
- **Staff experience (Oct–Nov 2025):** Designed the hotel-facing dashboard — new orders, past orders, order detail panel, approve/deny workflows. Worked closely with engineering on the data model since F&B orders reuse the existing Upsells Purchase Order system. I proactively prioritized the remaining design tickets by business impact and shared a ranked backlog with the PM — supplemental fees first (quick revenue win), then modifier groups, then staff notifications.
- **Modifiers & polish (Nov–Dec 2025):** Designed the full modifier management system — add-ons, substitutions, and variations at the menu item level. Collaborated with Becca (Upsells PM) and Nico on nuanced decisions like whether to pre-select default modifiers (we studied how Square, Uber Eats, and DoorDash handle this and landed on no pre-selection). Also designed ETA display on confirmation, email notifications to guests on approve/deny, delivery fee configuration, test mode, and reservation status gating.
- **Expansion (Jan 2026):** Designed the flexible ordering model — alternative delivery locations (pool, rooftop), non-PMS hotel support, walk-in visitor ordering. This required rethinking checkout as 6 distinct scenarios based on delivery type × hotel type × auth state. I shared the spec with engineering leads first for technical feedback before presenting to the wider team, then posted a comprehensive design share to the #epd-in-stay channel covering all 6 scenarios, contact detail collection, Compendium configuration, and dashboard updates.

**Constraints I designed around:**
- **No POS integration at launch** — Most target hotels don't have cloud POS, so the MVP had to work without any POS connection
- **Built on existing Upsells rails** — Engineering needed to ship fast, so I designed within the constraints of the existing Purchase Order data model
- **Bundled with Compendium** — Mobile Ordering is sold as part of Digital Compendium, so the guest entry point had to live naturally within the Compendium ecosystem
- **No app download** — Everything had to work as a mobile web experience accessible via QR code or link

[TODO: Visual — before/after or evolution of the ordering flow across iterations]

---

### [+] Impact & Results

#### What Happened

**Business impact:**
- Customer launch: January 21, 2026 — GA launch: February 9, 2026
- Pricing established at $1.75/room/month bundled with Compendium, $1.00/room/month as add-on
- First verbal commitment: Malibu Beach Inn (Dec 2, 2025) after a product demo — their Director of Operations was ready to sign immediately
- Second verbal commitment: Embassy Suites Times Square (Dec 3, 2025) — placed on Compendium Lite with a three-month free pilot for Mobile Ordering
- Target market: 15–30% increase in F&B revenue from convenience and reduced ordering friction
- Estimated 6.5 hours saved per 100 orders (avg 4 minutes per phone order eliminated)
- GTM tiger team of 9 AEs assembled for launch push; customer launch email sent to 349+ accounts
- Revenue model built with 10% attach rate to Compendium as baseline — pipeline tracking via Omni dashboard
- Q1 2026 Initiative KRs: "Sign one customer on Mobile Ordering with a POS integration" and "Process and send 1 order straight to the POS with Mobile Ordering" — both Active, on track
- Part of the broader initiative: "Increase average Canary revenue per room per month from $5.10 to $10"
- 50 F&B orders processed during pilot phase, validating demand before GA
- [TODO: Post-launch metrics — actual order volume, revenue per hotel, adoption rate. Replace Quick Stats process metrics with business metrics when available.]

**User impact:**
- Hotel staff in HOMA Cherngtalay (Thailand pilot) provided constructive feedback on item remarks discoverability and notification workflows — validated the design was being actively used in a real hotel environment
- Chateau Avalon owner saw "significant value in the bundle, estimating over $2,000/year savings from eliminating physical menus and reducing errors" and planned to present to ownership the following week
- Crown Resorts (Australia) requested a dedicated demo, signaling enterprise interest in the APAC market
- Multiple APAC properties (Royal Garden Kowloon East, The Fullerton Ocean Park) expressing interest with combined potential ARR of $25K+
- Our PM noted the core differentiator: "Customers value a lot having mobile ordering as part of Canary because it enhances visibility for F&B as part of Compendium, makes it easier to engage with the customer via Messaging, and bundles products into one provider"
- [TODO: Guest satisfaction scores, NPS data if available]

**Product impact:**
- F&B Ordering became the foundation for a broader Mobile Ordering platform — next phases include POS integration (Oracle Simphony Q1 2026), order scheduling, modifiers/allergens, and an insights dashboard
- The delivery-type model I designed (in-room vs. alternative location) is now the architectural pattern for all future ordering scenarios — PM confirmed "Mobile ordering is a strong foundation we can build on to support additional activities" including spa and activity bookings
- My code prototype became a GTM asset — Marketing pulled images from it for sales slides, CS used it for training scripts, and it was referenced in enablement sessions
- Dedicated #mobile-food-ordering Slack channel created for cross-functional GTM coordination across Product, Sales, CS, and Marketing

**Expansion pipeline (post-MVP):**
- POS integration: Oracle Simphony (Q1 2026), Toast and Lightspeed to follow
- Alternative location ordering: poolside, rooftop, lobby (designed, in engineering)
- Modifiers and allergen support for menu items
- AI Messaging integration — guests can request menus and place orders via text
- F&B insights dashboard for hotel operators

---

### [+] Reflection

#### What I'd Do Differently

**Worked well:**
- Building a code prototype early (not just Figma) made customer research dramatically more effective — hotel staff could actually interact with realistic menus and ordering flows. The prototype evolved into a genuine GTM asset that Marketing, Sales, and CS all used independently.
- The "delivery type drives the experience" insight simplified the entire product architecture. Instead of designing for every hotel scenario individually, I found the single variable that determines the flow. This kind of simplifying insight is what I'm focused on bringing to more projects.
- Close collaboration with PM (Nico Garnier) on customer calls gave me direct exposure to buyer pain points — I wasn't designing from second-hand requirements. I also proactively prioritized design tickets by business impact rather than waiting for prioritization, which kept the team moving faster.
- Cross-functional design collaboration with Becca (Upsells PM) on the modifier system surfaced edge cases early — we studied how Square, Uber Eats, and DoorDash handle pre-selected modifiers before landing on our approach, and then agreed to port the modifier pattern back to Upsell forms for consistency.

**Would change:**
- I'd push harder to include the staff notification experience in the MVP. Post-launch feedback from HOMA showed hotels needed more immediate alerts — their F&B team had to keep checking for new messages because there was no dedicated sound alert, and they had to toggle between Messaging and F&B Ordering tabs constantly. SMS/WhatsApp notifications were on the radar but deprioritized for speed.
- The item remarks/special requests discoverability could have been stronger. HOMA's feedback was specific: "It is not clear from the main menu screen that guests need to tap into the item to leave a remark... we have the quantity selection at the front, it is intuitive we press '+' to add the item, but for remarks, it is stated nowhere." I should have caught this in prototype testing.
- The AI menu parsing experiment I built (using Claude's API to detect menu titles, sections, and items from uploaded files) was well-received but stayed as a prototype. I'd push to get it into the product roadmap earlier since manual menu setup is the biggest onboarding friction.

**What I learned:**
- Designing for two distinct audiences in one product (guests ordering + staff fulfilling) requires thinking about the system, not just the screens. The data model, notification flow, and configuration surface are all part of the design.
- Shipping without POS integration was the right call — it let us validate demand and get real customer feedback months earlier than waiting for integrations would have allowed. As our PM put it: "We can already post to the folio because F&B uses the same rails as Upsells — we've turned it off because most first customers don't want it, as they already charge via their POS."
- The prototype-to-product pipeline works. Building in code (not just Figma) created a shared artifact that aligned engineering, product, sales, and marketing around a tangible vision — and gave me direct influence over how the product was demoed and sold.

---

### Visual Gallery

```
## The Work

Figma source of truth: https://www.figma.com/design/sKLjczvpLbn9SPYLxlUbdD/Food---Beverage-Ordering

[TODO: Full-width mockup — guest menu browsing on mobile]
  Figma: https://www.figma.com/design/sKLjczvpLbn9SPYLxlUbdD/Food---Beverage-Ordering?node-id=245-14415 (IA/flow logic)
[TODO: Item detail with modifiers and special requests]
  Figma: https://www.figma.com/design/sKLjczvpLbn9SPYLxlUbdD/Food---Beverage-Ordering?node-id=3828-31134 (Modifiers)
[TODO: Cart review and order submission flow]
[TODO: Order confirmation with ETA]
[TODO: Staff fulfillment dashboard — new orders view]
  Figma: https://www.figma.com/design/sKLjczvpLbn9SPYLxlUbdD/Food---Beverage-Ordering?node-id=1773-30798 (Navigation tabs)
[TODO: Staff order detail panel with approve/deny]
[TODO: Hotel admin configuration — delivery type setup]
  Figma: https://www.figma.com/design/sKLjczvpLbn9SPYLxlUbdD/Food---Beverage-Ordering?node-id=5326-5092 (Alt locations & unauth orders)
[TODO: Supplemental fees and taxes configuration]
  Figma: https://www.figma.com/design/sKLjczvpLbn9SPYLxlUbdD/Food---Beverage-Ordering?node-id=3541-18343
[TODO: Contact collection & non-PMS ordering]
  Figma: https://www.figma.com/design/sKLjczvpLbn9SPYLxlUbdD/Food---Beverage-Ordering?node-id=5001-24677
[TODO: Prototype screenshot — code prototype on Vercel]
[TODO: Before/after — phone-based ordering vs. digital flow]
```

---

### Next Project →

**Compendium**
Building a scalable hotel CMS platform from scratch

---

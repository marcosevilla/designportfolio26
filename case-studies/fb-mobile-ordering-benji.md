---
title: F&B Mobile Ordering
date: 2026
voice: benji-pass
status: draft
---

# F&B Mobile Ordering

*Canary Technologies · 2026*

F&B Mobile Ordering is a hotel ordering system. Three surfaces: a guest mobile flow, a staff fulfillment dashboard, and a hotel-side CMS for menus and modifiers. Guests scan a link, browse the menu, and order to their room — or the pool, or the lobby. Staff fulfill from a dashboard tuned to the rhythm of room service. Operators manage the rest.

I designed it at Canary[^1] over four months. Hotels were losing F&B revenue every time a guest reached for DoorDash instead of the front desk phone. This was the answer.

[image: hero — guest ordering on mobile + staff dashboard composed]

## Why hotels

Hotels are slowly digitizing the parts of guest service that used to be analog — keys, check-in, requests. Food was the next obvious one. Phone-based ordering ties up understaffed front desks, leads to misheard orders, and frustrates guests enough that many just open DoorDash. One hotel we spoke to ran their breakfast service on door hangers. Guests forgot to hang them. Staff missed pickups. Complaints piled up.

The opportunity wasn't subtle. Hotels with mobile ordering reported 20–40% more F&B revenue. We watched deals slip to Iris and Toast every quarter because we didn't have an answer in market.

## Where the food goes

The hardest part of designing this wasn't the menu or the cart — those are solved problems. It was modeling the shape of a hotel order. Hotels serve room service. They also serve the pool, the lobby, the spa, the rooftop. Each location has a different fulfillment workflow, a different way to identify the guest, a different staff workflow. Every conversation I had with hotel ops surfaced another scenario.

I noticed that all of them shared one variable: where the food goes.[^2] That single distinction — in-room versus alternative location — determines the checkout flow, the auth requirements, and how staff fulfill. I built the rest of the product around it. Hotels configure the delivery type per outlet; the guest experience adapts automatically.

It collapsed what could have been dozens of edge cases into one clean model.

[image: delivery-type diagram — in-room vs. alternative location branching]

## The object model

Underneath the delivery-type abstraction, the IA is five objects: outlets, menus, items, modifier groups, and orders. Items live in one library. Menus compose them. Pricing can be overridden per menu without duplicating items. A modifier group defined once works on every item that needs it.

The first version had separate item libraries per outlet — too much duplication. The second tried to make modifiers shared globally — too rigid for hotels with varied F&B brands. The version that shipped lets a property like Royal Garden Kowloon manage one breakfast menu across two restaurants and a poolside bar, with shared items, per-menu pricing, and modifier groups that travel cleanly.

[image: system architecture]

## Without a POS

For PMS-integrated hotels, orders tie back to a reservation. Contact details pre-fill, identity is verified, and staff see a "verified guest" badge on the order. For non-PMS hotels and walk-in visitors at the pool, the same flow drops to manual entry but still captures everything staff need. Same product, three modes.

I designed this because requiring POS integration would have blocked most of our pipeline. Most hotels we spoke to didn't have a cloud POS, and weren't going to have one for a year or more. Waiting wasn't an option.[^3] Making auth optional let us ship to hotels we couldn't otherwise serve, and sell POS as an upgrade once they were on the product.

[image: verified vs. unverified vs. walk-in badge states]

## Built on Upsells rails

We didn't build the order pipeline from scratch. Canary's Upsells product already had a Purchase Order system that handled folio posting, staff approval, and notifications. Reusing it cut engineering scope by months and meant PMS folio posting worked on day one — we just turned it off, since most early customers preferred to charge through their POS.

The trade-off was that I had to design F&B inside the Upsells data model. That meant some F&B-native concepts (multi-item carts, modifier-aware pricing, partial fulfillment) had to be expressed in a system originally built for single-item upsells. It was uncomfortable. But it was the right call: we shipped a working product four months after kickoff, and the architecture stayed simple enough that adding spa bookings or activity reservations later is mostly an outlet config, not a rewrite.

[image: staff fulfillment dashboard]

## The prototype

I built a code prototype the second week.[^4] Not Figma — a real, deployable, clickable thing. By December it had 50+ pre-loaded items, a working cart, real modifiers, and an experimental AI menu parser that ingested PDF menus and returned structured items. Thirty iterations in the first four days alone.

The prototype wasn't a research artifact. It became the GTM tool. Marketing pulled images for sales decks. Customer success used it for training. Our PM ran it on live customer calls. A job candidate told our VP of Product that he'd used it poolside at a COMO hotel in Thailand: *"I didn't have to walk 100 meters to place an order — I could do everything from my phone."* Two of our first verbal commitments — Malibu Beach Inn and Embassy Suites Times Square — came directly off the back of demos with that prototype.

I'm convinced now this is the right way to design hotel software. Figma is a tool for thinking; a deployed prototype is a tool for selling, training, validating, and onboarding.

[image: prototype on Vercel]

## What shipped

Mobile Ordering launched in January 2026 and went GA in February. HOMA Cherngtalay in Thailand ran the live pilot and gave us our most useful feedback. By the time we shipped GA we'd processed 50 orders in pilot, had verbal commitments from two properties, and a tiger team of nine AEs pushing it across our book.

The estimate that mattered most to me came from Chateau Avalon: *"Significant value in the bundle. Over $2,000/year in savings from eliminating physical menus and reducing errors."* Not vanity — a small property running the math themselves.

We shipped 93 of the 100 issues we scoped. The seven we didn't were honest cuts: SMS notifications, the AI menu parser as a real feature, and a few admin polish items.

## What I'd change

The thing I caught too late was item remarks discoverability. The HOMA team flagged it after launch: guests didn't realize they could tap an item to leave a note, because the "+" button to add it was right there at the surface. Quantity selection was discoverable; remarks were not.[^5] Lesson: when there's a familiar pattern from DoorDash or Uber Eats, people will use it as the *only* pattern unless you make the second one impossible to miss.

I'd also push harder on staff notifications in the MVP. HOMA's F&B team was checking the dashboard manually for new orders because we hadn't shipped a sound alert. SMS and WhatsApp were on the list but pushed to v2 for speed. In hindsight, push notifications were the difference between a tool staff trusted and a tool they had to babysit.

The AI menu parser — Claude reading a PDF menu and returning structured items — was probably the most useful thing I built that didn't ship. Manual menu setup is the biggest onboarding friction. I should have made the case for it earlier.

The thing I didn't expect was that the hardest design work wasn't the screens. It was finding the one variable that ran the whole product. Once delivery-type clicked, every other decision got easier; before it, everything felt like exception handling. That's what I'm looking for in every project now.

## Acknowledgements

Nico Garnier (PM) taught me how to build something from scratch — how to find the right thing, ship the smallest version of it, and let real customers tell you what to do next. Andrea Bradshaw (Eng Lead) taught me how to build it the right way, with the data model, the boundaries, and the standards intact. Joanne, Austin, Adil, Grant, and Luciano made it real, with the kind of energy that makes a four-month build feel short.

---

[^1]: Canary builds software for 20,000+ hotels. F&B Ordering is bundled into our Compendium product at $1.75/room/month, or $1.00/room/month as an add-on.

[^2]: I'd been staring at flow diagrams for two weeks before this clicked. I was reorganizing my notes one evening and realized I'd been treating "hotel order" as the unit, when the actual unit was *where the food gets dropped off*. Reorganized the whole IA the next morning.

[^3]: A sales rep asked me directly: "F&B ordering works for any hotel right? No integrations needed?" Hearing that out loud was the moment I knew the no-POS path was right.

[^4]: Stack: Next.js, React, Tailwind, deployed to Vercel. The cart used localStorage, the menu was pre-seeded JSON, and the modifiers were a quick faux state machine. Total time on the first version: about four hours.

[^5]: HOMA's exact words: *"It is not clear from the main menu screen that guests need to tap into the item to leave a remark. We have the quantity selection at the front, it is intuitive we press '+' to add the item, but for remarks, it is stated nowhere."*

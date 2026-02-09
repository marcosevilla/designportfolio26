# Digital Compendium

---

## CARD VIEW

```
[TODO: Cover image — Compendium builder interface alongside guest mobile experience, 16:9]

DIGITAL COMPENDIUM
A scalable hotel CMS platform built from scratch

Canary Technologies • 2024–2025 • Lead Designer

Systems Thinking • CMS Design • Mobile
```

---

## CASE STUDY PAGE

### Hero Section

```
← Back to Work

# Digital Compendium

A digital guest hub that replaces printed hotel compendiums — a CMS vertical enough for hospitality but flexible enough to scale across thousands of properties.

---

Company          Canary Technologies
Timeline         18 months (May 2024 – present)
Role             Lead Designer (100% design ownership)
Team             1 Designer, 3–5 Engineers (Adil Shaikh, Austin Irvine, Tommy Slater, Andrea Bradshaw, Luciano Guasco), 1 PM (Nico Garnier)
```

---

### Quick Stats

```
┌─────────────────┬─────────────────┬─────────────────┬─────────────────┐
│  100%            │  $1M+           │  82%             │  175K           │
│  Design          │  Cumulative     │  Custom section  │  Monthly active │
│  ownership       │  CARR (Dec '25) │  adoption rate   │  guest users    │
│  (11/11 files)   │  (+141% YoY)    │  (+10pts/month)  │                 │
└─────────────────┴─────────────────┴─────────────────┴─────────────────┘
```

---

### The Problem

Hotels have relied on printed compendiums — booklets in guest rooms listing amenities, restaurant menus, Wi-Fi info, and local attractions — for decades. These are expensive to produce, impossible to update quickly, deteriorate with use, and require sanitization. Competitors like Duve, Hudini, and LoungeUp had already gone digital, and several offered features Canary didn't match: in-room dining, activity booking, and analytics.

Canary needed a digital compendium that did more than replicate a PDF. The product had to become the guest's home screen during their stay — a hub connecting reservation info, messaging, upsells, tipping, and eventually food ordering. Without it, Canary was selling point solutions while competitors sold a guest experience. The initiative target: increase average revenue per room per month from $5.10 to $10.

---

### The Solution

I designed the full Compendium platform end-to-end — a hotel-facing CMS builder for managing content, and a guest-facing mobile web experience for browsing it — and then extended it through six major phases over 18 months, from MVP through enterprise-wide release.

[TODO: Hero mockup — split view of CMS builder (left) and guest mobile experience (right)]

#### Key Design Decisions

1. **Builder-first architecture**
   I designed the CMS as a structured builder rather than a free-form editor. Hotels configure sections (restaurants, amenities, custom content) through a guided interface with real-time preview. This was deliberate — hotel staff aren't web designers, and a "builder" metaphor with clear sections and drag-to-reorder maps directly to how they think about their property's offerings. The PRD called for "setting the standard for content" since the patterns would be reused across registration cards, auth forms, and other editors.
   [TODO: Visual — CMS builder interface with section management]

2. **Custom sections as the extensibility layer**
   Rather than hard-coding every content type, I designed a custom sections system that lets hotels create their own categories with items, images, descriptions, and call-to-action buttons. This single pattern — adopted by 82% of active properties — solved everything from "spa services" to "local attractions" to "hotel policies" without requiring product-specific development for each use case. The architecture was intentionally extensible: custom carousels, groupings, and business hours all plugged into this same pattern.
   [TODO: Visual — custom section examples across different hotel types]

3. **Compendium as the guest journey endpoint**
   I positioned Compendium as where every guest touchpoint leads. Check-in completes? You land on Compendium. Arrival SMS? Links to Compendium. QR code in the lobby? Compendium. This wasn't just navigation — it was the product strategy. By making Compendium the hub, every other Canary product (messaging, upsells, tipping, food ordering) gets organic distribution. The guest experience adapts based on what the hotel has enabled, so a property using just Compendium sees an informational hub, while a full-suite hotel sees an integrated guest portal.
   [TODO: Visual — guest journey map showing Compendium as the central hub]

4. **Compendium Lite as a freemium growth lever**
   When we needed to drive cross-sell and deepen the Wyndham relationship, I designed Compendium Lite — a constrained version (2 sections, 4 items per section) that any Canary customer could activate for free. The design challenge was creating clear upgrade triggers without making the free version feel broken. I placed contextual "Request Upgrade" prompts at natural friction points — when a hotel tries to add a third section or fifth item — so the limitation feels like an invitation, not a wall. Success metrics: 10% engagement within 30 days, 5% conversion to paid within 60.
   [TODO: Visual — Compendium Lite showing section limits and upgrade prompt]

---

### [+] Research & Discovery

#### What I Learned

**Research methods used:**
- Full design QA audit of the guest experience in preparation for Best Western conference (Oct 2024) — documented all bugs and polish issues in a structured Notion doc, filed 6+ engineering tickets in Linear (DSN-548, DSN-577, DSN-598, DSN-595, DSN-600, DSN-594)
- Competitive analysis of digital compendium solutions (Duve, Hudini, LoungeUp, Tongo, HiJiffy, Guest.net, Way.co, hinfo, STAY) — mapped feature gaps across amenity display, concierge, in-room dining, activity booking, and analytics. STAY had reached 23M users globally, and prospects were comparing Canary to Duve side-by-side in sales calls.
- Design jams with engineering on data model decisions (Compendium vs. property_info app separation, restaurant/facility models, i18n approach)
- Live feedback from COMO property tours, Omni pilot hotels, Best Western rollout, Eurostars (270 properties, $2M total opportunity), and Wyndham
- COMO brand requirements workshops — I outlined COMO's UI requirements and design feedback (DSN-551) after discussing with Aman, including custom fonts, gradient treatments, and brand-specific styling
- Cross-functional collaboration with PM (Nico Garnier) on product direction, feature scoping, and GTM strategy

**Key insights:**
1. Hotels think about their property in categories (restaurants, amenities, policies, local attractions), not in pages or blocks. → I designed the builder around typed sections rather than a generic page editor, which mapped directly to how hotel staff mentally organize their property's information.
2. Content quality varies wildly between hotels — some have professional photography, others have phone photos. → I designed flexible image handling: bulk upload (removing the mandatory crop step), image galleries, and layouts that look good with both high- and low-quality imagery. The bulk upload design alone went through 19 iterations.
3. Enterprise chains (Best Western, Wyndham, COMO) have radically different needs from boutique hotels — brand consistency vs. creative freedom. → I designed the system to support both: brand-level defaults that individual properties can customize, plus branded QR code templates that maintain corporate identity.
4. Compendium was behind competitors on key features — Canary had no in-room dining, no activity booking, no analytics when we started. → I designed the architecture as a platform, not a product, so that F&B ordering, spa reservations, and activity bookings could be added as modules within the same guest experience. Food ordering was the first proof of this platform approach.
5. Staff at COMO properties were unaware of features like custom questions for upsells despite significant guest friction. Nico's customer interviews found "generally positive feedback from property staff, which was a bit surprising and contrasts with some of the feedback we've previously received from Mathieu [COMO's decision-maker]." → I identified that product education was as important as product design and pushed for better in-context guidance and onboarding flows.
6. Demo prospects consistently responded to the visual design — Catherine Donaldson reviewed 10 sales demos and reported "Lots of folks commented about how much they liked the DC: 'It's sleek, this is exactly what I'm looking for.'" A live customer described it as "like having your own digital concierge." → This validated the builder-first approach: even without advanced features, the polished guest experience was selling the product.

---

### [+] Design Process

#### How I Got There

**Approach:** Build the foundation right — a structured, extensible CMS that could evolve from informational hub to interactive guest platform — then layer on capabilities phase by phase.

[TODO: Visual — Figma file evolution showing phases of Compendium design]

**Phases:**
- **Early prototyping (Jan–Apr 2024):** Before the builder MVP, I built a CMS Compendium prototype in Figma with interactive previews — sticky mobile previews that scrolled with the builder, clickable navigation across Wi-Fi, service requests, restaurants, and room upgrades. I shared it directly with Aman for review in January 2024. Later, Wenjun noted "didn't we sell compendium over Figma prototypes?" — the prototypes were literally closing deals before the product existed.
- **Builder MVP (May–Aug 2024):** Designed the entire CMS builder from scratch — section management, restaurant/amenity editors, Wi-Fi and reservation info settings, property info, QR code generation, translation picker for multi-language support, photo management, and hours configuration. Worked closely with engineering on the data model (separate `compendium` and `property_info` apps, i18n JSON fields, role-based permissions). The engineering design doc I collaborated on defined 27 implementation tickets across backend endpoints, frontend routes, and stores.
- **Guest UI Phase 1 & 2 (Jul–Aug 2024):** Designed the guest-facing mobile web experience — the welcome screen, section navigation, restaurant and amenity detail views, reservation info display, messaging integration, and Wi-Fi info. The guest experience needed to feel like a consumer app, not hotel software, while remaining accessible via QR code or link with no app download required.
- **Phase 3 + Polish for Wide Release (Sep–Oct 2024):** Iterated on the guest experience based on real hotel feedback, then did a full design QA audit for the Best Western conference. I emailed the Best Western Compendium demo directly to Aman for review. I documented every UI issue in a structured Notion page, filed engineering bugs in Linear, and prioritized fixes by customer visibility. This QA pass was critical — Best Western was one of our first large-scale rollouts. I also addressed COMO's brand-specific UI requirements (DSN-551) after a workshop with Aman — custom fonts, gradients, and styling that pushed the design system's flexibility.
- **QR Templates + Manual Translation (Aug–Nov 2024):** Designed QR code template options and the manual language translation system for multi-language support. I recorded Loom walkthroughs of both features for the engineering hand-off — Aman had encouraged the design team to do more hand-offs via calls, and I used Looms to bridge the gap. Also designed business hours configuration for restaurants and amenities (time-aware display).
- **Wyndham captive portal prototype (Feb 2025):** I built a proof-of-concept prototype showing how Wyndham's wifi portal (Eleven Software) would redirect guests into Compendium. This became the foundation for the Wyndham Compendium Lite rollout that eventually scaled to 400+ sites.
- **Custom Sections (Nov 2024–Jun 2025):** I designed the custom sections system that became the product's most-adopted feature (82%). In November 2024, I shared a Loom walkthrough of the in-progress custom sections prototype directly to Aman, walking through the creation flow and raising design questions about section deletion logic and templates. Wenjun shared the Figma as a pre-read for engineering. I redesigned the save behavior for the builder — proposing that the Save button is never disabled (regardless of errors or unsaved state), and that validation errors keep the user on the page with a toast notification rather than silently discarding changes. Emilia Ho requested my custom sections designs for the product newsletter. I ran a custom sections bug bash in May 2025 before the rollout, and Adil shipped it to all hotels except Best Western in June — "about 20% of existing compendium-enabled hotels."
- **Custom Carousels & Groupings (Jan–Apr 2025):** Designed the custom carousels system — visual, swipeable sections on the guest experience that hotels could populate with curated content. Also designed groupings logic so hotels could organize sections hierarchically. Used Yelp Business as a design reference for how to present rich, categorized content in a mobile-friendly format.
- **Compendium Lite (Apr–Jun 2025):** Designed the freemium tier — constrained section/item limits (2 sections, 4 items per section), contextual upgrade prompts, "Request Upgrade" email flow to sales. 22 iterations to nail the balance between useful free product and clear paid value proposition. Before going on PTO in May, I shared the Compendium Lite spec and image reordering designs to #epd-in-stay to unblock engineering. Austin Irvine shipped the Lite tier changes in June, and by October, Ani Ghazarossian announced "Exciting news — yesterday, we took 10 sites live on Compendium Lite" for the Wyndham wifi rollout.
- **Bulk Image Upload (May–Jun 2025):** Redesigned the image upload flow to support multi-select uploads, removing the mandatory crop step (which was the biggest friction point in hotel onboarding). Designed post-upload crop-on-demand and gallery management. 19 iterations.
- **Wyndham Rollout + 2026 Vision (Oct 2025–Jan 2026):** Supported enterprise rollout to Wyndham via their Wi-Fi captive portal, designed translations improvements, and continued polish on the gallery component and property info pages. In November 2025, I put together a "North Star" FigJam brainstorm for Compendium's future direction and walked Nico and Becca through it — mapping where the product should go across ordering, spa bookings, activity reservations, and deeper guest personalization.

**Constraints I designed around:**
- **No native app** — Everything had to work as a mobile web experience accessible via QR code, SMS link, or Wi-Fi portal redirect
- **Multi-language from day one** — Hotels serve international guests, so the builder needed translation management built into every content field (i18n JSON with auto-translate support)
- **Varied technical sophistication** — Hotel staff range from tech-savvy to barely comfortable with email, so the builder had to be self-explanatory without onboarding
- **Platform foundation** — Every pattern I designed needed to be reusable — the content editor, image upload, hours configuration, and section architecture all had to transfer to future products

[TODO: Visual — before/after of printed compendium vs. digital Compendium on mobile]

---

### [+] Impact & Results

#### What Happened

**Business impact:**
- Cumulative CARR surpassed $1M by December 2025, driven by a $200K Omni Hotels deal — Nico announced it as "our 1 million month" with "a 25% increase in the pod's CARR in a single month"
- CARR booked: $81.5K in Q4 2025 alone (+400% YoY), driven by luxury and resort brands (Castle Resorts $9K, Signature Hotels $4K) and strong EMEA performance matching US ($15K each)
- ARR activated: $55.3K in Q4 2025 (+400% YoY), with 70% driven by Best Western rollout
- Zero gross churn — no Compendium customers churned in the tracked period
- Compendium Lite launched to drive cross-sell to existing customers (13 paid customers / $13K at risk — carefully managed) and deepen the Wyndham relationship
- F&B Mobile Ordering launched as the first interactive module on the Compendium platform, generating 3 verbal commitments in the first week

**User impact:**
- 175K monthly active guest users (with 2.5 min average session time, +7% MoM)
- Custom Sections adopted by 82% of active properties (+10 percentage points for two consecutive months)
- Custom CTAs adopted by 72% of active properties
- Average 8.7 items per property — hotels are actively building out their content
- Live customers described it as "like having your own digital concierge" and said "We love that you have added the ability to add sections... the customers love it"
- Demo prospects: Catherine Donaldson reviewed 10 sales demos and reported "Lots of folks commented about how much they liked the DC: 'It's sleek, this is exactly what I'm looking for'"
- Omni Hotels: "consistently strong" feedback from pilot properties; closed $200K Compendium deal, now exploring geofenced QR codes on room keys and loyalty integration
- COMO Hotels: positive sentiment from property staff during in-person tour, though Mathieu (decision-maker) felt Compendium was "behind the curve" compared to native app competitors — this ultimately led to COMO exploring Alliants in January 2026, a key competitive lesson
- Eurostars: high expectations (they use Stay as benchmark, 23M users globally), optimistic and engaged — requested rich text, allergens, and mobile ordering as pilot requirements
- Wyndham pilot site: Ani reported they were "very impressed with Compendium and how Canary continues to deliver outstanding products"
- Hotel Sorrento (APAC): specific feedback that compendium content wasn't visible above the fold — "It's not clear at a glance that this is the hotel compendium since none of the compendium content is above the fold"

**Product impact:**
- Compendium became the architectural platform for Canary's guest experience — F&B Ordering, upsells, messaging, and tipping all distribute through it
- The builder patterns I designed (section management, image upload, hours config, translation picker) became the standard for content editors across Canary's product suite — the PRD explicitly noted these should be "directly transferrable to other use cases like reg card editing, auth form design, etc."
- Design system contributions: gallery component, image upload patterns, and CMS patterns now used across multiple products
- Custom sections architecture proved so flexible that it replaced the need for product-specific section types — hotels use it for spa services, local attractions, hotel policies, transportation info, and more
- The platform approach was validated: PM confirmed "Food Ordering is the first step, with opportunities ahead in Spa Reservations, Activity Bookings, Housekeeping Requests, and additional high-intent workflows"

**Enterprise traction:**
- Aman's launch announcement (October 2024): "Huge congrats to the entire team for bringing a brand new SKU to market from scratch... This is now the second SKU launched by just this pod in 2024. Most companies are lucky to launch 2 SKUs across their entire company in a year."
- Best Western: largest rollout, drove 70% of Q4 ARR activations; one influential property displayed Compendium QR codes on all guest room TVs
- Wyndham: Compendium Lite via wifi captive portal, scaling to 400+ sites; $18M contract that includes Compendium alongside Voice. Q1 2026 Enterprise KR: "90% of Wyndham North America properties on GMS have 1+ guest using Compendium"
- COMO Hotels: multi-property deployment across Asia-Pacific
- Omni Hotels: pilot expansion with Mobile Ordering interest
- Eurostars: high-touch engagement, strong product feedback loop
- Castle Resorts, Signature Hotels: new CARR bookings in Q4

---

### [+] Reflection

#### What I'd Do Differently

**Worked well:**
- Designing the builder as a structured, section-based CMS rather than a free-form page editor was the right call. It maps to how hotel staff think and ensures content quality without requiring design skills. The 82% custom section adoption rate proves hotels understood and used the model.
- The platform architecture paid off. Designing Compendium as an extensible hub — rather than a standalone product — meant that when F&B Ordering launched 12 months later, it slotted naturally into the guest experience without redesigning the shell. That kind of upfront systems thinking saved months of rework.
- Full design QA before the Best Western conference caught issues that would have been visible to hundreds of properties. Taking ownership of quality — not just handing designs to engineering and moving on — was critical for a product launching at enterprise scale.
- Close collaboration with engineering on the data model (separate apps for compendium config vs. property info, i18n approach, permissions model) meant the frontend architecture matched the design architecture. Decisions made in that initial design doc carried through 18 months of development without needing to be revisited.

**Would change:**
- I'd invest more in analytics from the start. The OKR review noted we "did not prioritize adoption initiatives" and the product KPIs section was sparse. Having usage data earlier would have helped prioritize which features to build next — when Lia Parrella in EMEA CS asked "do we have analytics on Compendium? A property asked me if they could check how the compendium is being used," we didn't have a good answer. And when COMO ultimately explored moving to Alliants in January 2026 — citing a native app gap and features "behind the curve" — having stronger usage data could have helped us make a more compelling case to retain them.
- Aman's feedback on my performance review was direct: despite participating in 20+ customer calls, I wasn't yet the person who "knows users better than anyone else on the pod." For Compendium specifically, I should have owned the discovery — running independent conversations with hotel staff about how they set up and manage their compendium content, not just observing on PM-led calls.
- I should have pushed harder on "art of the possible" concepts. Aman noted I used to push the envelope more on forward-looking design concepts, and that had diminished. For a platform product like Compendium, having a 6–12 month vision mockup would have helped align the team and sell the roadmap internally.

**What I learned:**
- Platform design requires thinking in layers. The guest experience, CMS builder, data model, and API are all part of the design — not just the screens. Getting the architecture right early means features can be added without rearchitecting, which is exactly what happened with F&B Ordering, Custom Carousels, and Compendium Lite.
- Enterprise products need polish at a different standard. When Best Western is rolling out to hundreds of properties, every pixel matters because there's no opportunity to explain away rough edges in a demo. The QA pass I did before that conference was one of the highest-leverage things I did on the project.
- The freemium model (Compendium Lite) is a design problem, not just a business decision. Where you place constraints, how you communicate limits, and what triggers the upgrade conversation are all UX decisions that directly impact conversion. Designing Lite taught me that growth mechanics and product design are the same discipline.

---

### Visual Gallery

```
## The Work

Figma source of truth (Builder): https://www.figma.com/design/zahQHKtfTwAeILkJRHZsY5/Compendium-Builder
Figma source of truth (Guest Experience): https://www.figma.com/design/mLIliQeioucutXL7uLgAV8/Compendium---Guest-Experience
Figma (Compendium Lite): https://www.figma.com/design/hllZecIvb4qHx0T30sU8ch/Compendium-Lite
Figma (Bulk Image Upload): https://www.figma.com/design/XD9IkDnpgMjc3TP1phto3N/Compendium--Bulk-Image-Upload
Figma (North Star FigJam): https://www.figma.com/board/aDdSqJC7Xnwq1kwnWSS3Df/Compendium-North-Star
Figma (2026): https://www.figma.com/design/37kyu92xakO6aVQC4xsUhj/Compendium--2026-

[TODO: Full-width — CMS builder main page with section management]
  Figma: https://www.figma.com/design/zahQHKtfTwAeILkJRHZsY5/Compendium-Builder?node-id=5062-13786
[TODO: Restaurant/amenity editor with image gallery and hours]
[TODO: Guest mobile experience — welcome screen and section browsing]
  Figma: https://www.figma.com/design/mLIliQeioucutXL7uLgAV8/Compendium---Guest-Experience?node-id=1-2
[TODO: Custom sections — examples across different hotel types]
[TODO: Compendium Lite — section limit and upgrade prompt]
  Figma: https://www.figma.com/design/hllZecIvb4qHx0T30sU8ch/Compendium-Lite?node-id=265-8082 (START HERE entry)
  Figma: https://www.figma.com/design/hllZecIvb4qHx0T30sU8ch/Compendium-Lite?node-id=11-20347 (Design spec)
[TODO: QR code template selector]
[TODO: Bulk image upload flow]
  Figma: https://www.figma.com/design/XD9IkDnpgMjc3TP1phto3N/Compendium--Bulk-Image-Upload?node-id=170-7595 (Image reordering)
[TODO: Translation picker and multi-language content management]
[TODO: Guest experience on mobile — restaurant detail with photos]
[TODO: Before/after — printed compendium booklet vs. digital on phone]
[TODO: Builder prototype (clickable)]
  Figma: https://www.figma.com/proto/zahQHKtfTwAeILkJRHZsY5/Compendium-Builder?page-id=3564:11426&node-id=4778-49177
[TODO: Compendium "North Star" brainstorm]
  FigJam: https://www.figma.com/board/aDdSqJC7Xnwq1kwnWSS3Df/Compendium-North-Star?node-id=0-1
```

---

### Next Project →

**Upsells Forms**
Designing a flexible form system for hotel upsells

---

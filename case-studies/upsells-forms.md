# Upsells Forms

---

## CARD VIEW

```
[TODO: Cover image — split of form builder (hotel staff) and guest-facing form modal on mobile, 16:9]

UPSELLS FORMS
A flexible form system for hotel upsells

Canary Technologies • 2025 • Lead Designer

Workflow Design • Form Systems • Mobile
```

---

## CASE STUDY PAGE

### Hero Section

```
← Back to Work

# Upsells Forms

A configurable form system that lets hotels collect custom guest information at the point of upsell purchase — turning simple add-ons into structured service requests.

---

Company          Canary Technologies
Timeline         5 months (Apr – Sep 2025)
Role             Lead Designer (63% upsells ownership)
Team             1 Designer, 3 Engineers, 1 PM (Becca Aleynik), Tech Lead (Adil Shaikh)
```

---

### Quick Stats

```
┌─────────────────┬─────────────────┬─────────────────┬─────────────────┐
│  $3.8M           │  $2.2M          │  80%             │  8,325          │
│  Upsells CARR    │  Approved       │  Upsells         │  Hotels using   │
│  (+8.8% MoM)     │  upsell revenue │  approval rate   │  upsells        │
│                  │  (+9% MoM)      │                  │                 │
└─────────────────┴─────────────────┴─────────────────┴─────────────────┘
```

---

### The Problem

When a guest requests a snowmobile expedition, airport shuttle, or spa treatment through Canary's upsells, the hotel has to follow up manually — via messaging or phone — to collect the details needed to actually fulfill the request. Flight number? Preferred time? Number of guests? Dietary restrictions? All of this creates back-and-forth that delays confirmation, frustrates guests, and creates operational overhead for already-busy concierge teams.

One hotel we tested with, Hotel Jackson in Wyoming, manages 30+ different tour experiences. Their tours coordinator described the current workflow: "I see the guest is interested, I message them, I wait for a response — it could take 5 minutes or 5 days." Competitors like Duve had already built form-based data collection into their upsells, and CS teams were regularly fielding requests from properties that wanted to collect mandatory information like flight numbers or wine preferences at the time of purchase.

---

### The Solution

I designed a form system that plugs into Canary's existing upsells product — hotel staff configure custom questions per upsell, guests answer them at the point of request, and staff see responses alongside the order in their dashboard. Alongside Forms, I redesigned the entire upsell creation experience from a cramped modal into a full-page layout with live preview.

[TODO: Hero mockup — full-page upsell creation with form builder section + live mobile preview]

#### Key Design Decisions

1. **Full-page creation flow with live preview**
   The existing upsell creation modal couldn't accommodate forms — it was already cramped with basic fields. Rather than patching, I redesigned the entire creation experience as a full-page layout, emulating the pattern I'd established in Compendium Builder. The right side shows a live mobile preview that updates as staff configure the upsell, so they see exactly what guests will see. I built a v0 prototype on Vercel to validate the interaction before finalizing in Figma. This redesign set the stage for every future upsell feature (variants, categories, price modifiers) to have room to breathe.
   [TODO: Visual — full-page creation flow with live preview panel]

2. **Form fields as "Guest Information" within the upsell**
   I positioned forms as a natural extension of the upsell setup — a "Guest Information" section that appears when configuring an add-on. Hotels add up to 5 questions per upsell, each with a type (text, dropdown for MVP; checkbox, date, time, quantity planned), a label, and required/optional status. The key insight from user testing was renaming "Fields" to "Questions" — hotel staff don't think in database terms, they think "What do I need to ask the guest?" This framing made the feature immediately intuitive.
   [TODO: Visual — form builder section showing question configuration]

3. **Guest form appears at the point of request, not after**
   I designed the form to surface before the guest submits their upsell request — not as a follow-up. This was the core product insight: if you collect information at the moment of intent, you eliminate the entire manual follow-up workflow. The guest sees the form integrated into the upsell detail view, answers the questions, and submits everything together. Hotel Jackson's response when they saw this: "Dream come true."
   [TODO: Visual — guest mobile view showing upsell detail with form questions]

4. **Constraint-based UX with clear feedback**
   The form builder uses visual feedback to communicate limits: the "Add option" button disables when a dropdown reaches 15 options, deletion is blocked when only one option remains, and error indicators appear on language tabs when translations have validation issues. These micro-interactions came from observing hotel staff in testing — they needed immediate, visible feedback rather than error messages after the fact. The multi-language tab interface (English, Spanish, Italian, Japanese) uses error outline icons to surface which translations need attention, borrowing the validation pattern from Compendium's translation picker.
   [TODO: Visual — form builder showing constraint feedback states]

5. **Staff responses surfaced in context, not buried**
   Guest form responses needed to appear everywhere staff manage upsells — in the New Requests tab, Past Requests, and within the check-in flow's "Manage Upsells" section. I designed a side sheet pattern (CanarySideSheet) that shows the full order alongside form responses, so staff can review answers and approve/deny without navigating away. When the v2 guest experience raised concerns about form discoverability in the bottom sheet, I explored a full-page treatment to give the questions more visibility.
   [TODO: Visual — staff dashboard showing upsell request with form responses in side sheet]

---

### [+] Research & Discovery

#### What I Learned

**Research methods used:**
- Prototype usability testing with Hotel Jackson (Wyoming) — snowmobile/tour upsell use case with 30+ experiences
- User testing with Guldsmeden Hotels (Copenhagen) — boutique hotel testing form creation flow
- User testing with The Ozarker Lodge — resort experience upsells
- Prototype iteration based on feedback from Cortiina hotel
- Competitive analysis — Duve's form-based data collection, Oaky's upsell approach
- Design hand-off session with engineering (recorded, transcribed) — validated field types, localization approach, question limits
- Eng design review with Tommy Slater — schema decisions for form questions, reusability of dynamic forms pattern
- Design jams with Miguel (Senior Designer) and Wenjun (Staff Designer) on live preview component unification across Compendium, Upsells, and branding page

**Key insights:**
1. Hotels think in "questions," not "form fields." When Hotel Jackson saw the prototype, they immediately understood the concept but stumbled on terminology. Renaming "Fields" to "Questions" and making "Collect Guest Information" visually clearer removed all friction. → I redesigned the form builder section with question-oriented language throughout.
2. Upsell variants and variable pricing are tightly coupled with forms. Hotel Jackson manages half-day group, full-day group, half-day private, and full-day private versions of each tour — each with different prices. They described it as "overwhelming for guests seeing all excursion types." → This validated the Upsell Variants project (27 iterations) as a natural companion to Forms, and informed my later work on price modifiers for custom questions (e.g., "Choose your wine" → White ($12), Red ($15)).
3. Template creation was the top productivity request. Hotel Jackson has "a set of standard questions across multiple Upsell variants" and wanted to avoid redundant setup. → While templates weren't in MVP scope, this shaped how I designed the question reordering and duplication patterns to reduce repetitive work.
4. The existing upsell creation modal was a dead end. As Nico and I scoped the forms roadmap, we realized that "there's a certain amount of roadmap items that are going to add to the complexity" — forms, variants, categories, modifiers — and a modal couldn't hold it all. → I proposed the full-page redesign early, which engineering validated as feasible and which Tommy Slater shipped as a major milestone.
5. Nearly 95% of guests access the upsells page from mobile, yet only 42% scroll past the first screen. → This data (from Amplitude) shaped my approach to form placement — questions had to be discoverable without requiring scroll, which led to the integrated detail-page approach rather than a separate form step.

**Research artifact:**
I built a functional prototype on Vercel (v0-upsell-forms.vercel.app) that evolved through multiple rounds of user testing. It included the full-page creation flow, form builder with all question types (text, dropdown, date, time, quantity), live preview, and existing upsell configurations (availability by guest journey stage, arrival day, loyalty status). Hotel Jackson and Guldsmeden Hotels both tested with this prototype, and it was iterated based on their feedback before the design hand-off to engineering.

---

### [+] Design Process

#### How I Got There

**Approach:** Start with the user's workflow — what questions do they need answered? — then design backwards from there into the builder experience and guest UI.

[TODO: Visual — evolution from modal to full-page creation flow]

**Iterations:**
- **Research & prototyping (Apr–May 2025):** Built the v0 code prototype with all question types. Ran usability testing with Hotel Jackson, Guldsmeden, Cortiina, and The Ozarker Lodge. Iterated on prototype feedback — aligned UI to CanaryUI, added question type configurations (time increments, date range constraints, quantity min/max), and evolved the modal into a full-page experience emulating Compendium Builder. Shared design hand-off with engineering on May 23, reviewing both the form builder and the redesigned creation page.
- **Full-page creation + live preview (May–Jun 2025):** Designed the complete full-page upsell creation flow — form builder, live mobile preview with responsive layout, manual translation patterns (leveraging Compendium's pattern to handle language tab overflow), and validation error states for all upsell types (early check-in, late checkout, add-on, add-on with form). Shared the live preview work-in-progress to #epd-in-stay with a Loom walkthrough. Collaborated with Tommy Slater on eng design, discussing schema reuse with dynamic forms and page responsiveness.
- **MVP scope-down & launch (Jun–Jul 2025):** Nico and I scoped forms down to text-only input for MVP (no dropdown), simplifying the creation UI since users wouldn't need to choose a field type. Tommy shipped the full-page view as a major milestone on July 21. I ran a bug bash, filed design tickets for release-blocking issues, and worked with Andrea and Tommy on a final checklist of required changes.
- **Guest frontend + dashboard (Jul–Sep 2025):** Designed guest-facing form submission within the upsell detail view, form response display on the staff dashboard (New Requests, Past Requests, check-in Manage Upsells), discard confirmation when closing a partially-filled form, and the unified deny button pattern across table and side sheet. Re-integrated the dropdown field type after MVP. Adil Shaikh shipped the forms builder directly in the upsells dashboard on September 15 — Nico commented "This is huge! We've had a lot of requests in the past to collect more guest information."
- **Post-launch expansion (Sep–present):** Designed custom questions translations, price modifiers for dropdown questions (e.g., wine selection with variable pricing), and explored the full-page upsell details treatment for better form discoverability. Also designed the upsell card experimentation (testing layout to improve scroll-past-first-screen rate) and began the Variants project (27 iterations).

**Constraints I designed around:**
- **Existing Upsells infrastructure** — Forms had to integrate with the existing add-on model and Purchase Order system, not require a new backend architecture
- **Add-ons only (not room upgrades)** — MVP scope excluded Room Upgrades, Early Check-in, and Late Checkout since those don't typically need guest information collection
- **5 questions max per upsell** — Engineering and product aligned on a limit to prevent form fatigue and keep the guest experience fast
- **MVP: text only, then dropdown** — Scoped down from 6 field types to 1 for initial launch, then expanded to dropdown, with checkbox, date, time, and quantity in the backlog
- **Multi-language from launch** — EMEA hotels needed translations for custom questions immediately, which I designed leveraging Compendium's manual translation pattern

[TODO: Visual — before (cramped modal) vs. after (full-page with live preview)]

---

### [+] Impact & Results

#### What Happened

**Business impact:**
- Upsells CARR reached $3.8M in July 2025 (+8.8% MoM), with a year-end target of $4.6M
- Approved upsell revenue: $2.2M/month (+9% MoM)
- 80% upsell approval rate across 8,325 hotels
- Upsells Forms launched September 2025 — status: "Launched (Available to All Customers)"
- Target: 10% adoption of Upsell Forms for customers onboarded after release
- Internal beta with key accounts: Hotel Jackson, The Ozarker Lodge, Verdelago
- Marriott Upsells RFP leveraged forms designs — dedicated design reviews and presentation materials created for the enterprise sales opportunity
- Price modifiers for custom questions (e.g., dropdown with per-option pricing) designed and ready for eng, extending forms into a revenue-impacting feature
- [TODO: Post-launch adoption metrics — % of properties using forms, reduction in messaging follow-ups]

**User impact:**
- Hotel Jackson (30+ tour experiences): "Dream come true" — the prototype eliminated their entire manual information-gathering workflow for snowmobile tours, wildlife tours, and other experiences
- CS teams reported frequent requests for exactly this feature — properties wanted to collect flight numbers for airport shuttles, wine preferences for amenity packages, spa appointment times, and dietary restrictions
- Wyndham brands (HJ, BAY) exploring custom questions for new guest initiatives, validating enterprise demand
- IHG adopted forms for a welcome amenity selection use case — extending forms beyond concierge services into the enterprise guest journey
- A property using meal packages with custom questions surfaced a pricing gap: guests ordering for 2 people over 2 nights saw $134 instead of $268 — this directly led to the price modifiers feature I designed
- Guest form submission eliminated the "5 minutes to 5 days" follow-up cycle Hotel Jackson described

**Product impact:**
- The full-page creation flow became the new standard for all upsell management — room upgrades, add-ons, and future variants all use this pattern
- Forms architecture designed for extensibility: the question schema uses Canary's internal `schemaform` pattern (reused from registration cards), supporting branching questions, additional field types, and reuse across other Canary products. Technical specs: up to 5 fields per upsell, up to 15 options per dropdown, with feature-flagged rollout via GrowthBook.
- The live preview component sparked a cross-product design conversation: should we unify live preview across Compendium, Upsells, and the branding page? This systems-level thinking was noted positively in my performance review.
- Forms laid the groundwork for price modifiers (dropdown options with per-option pricing), which connects forms directly to revenue impact
- The modifier pattern I designed later fed back into F&B Ordering — Becca and I agreed to port the modifier approach to Upsell forms for consistency

---

### [+] Reflection

#### What I'd Do Differently

**Worked well:**
- Building a code prototype early (Vercel, not just Figma) made user testing with Hotel Jackson and Guldsmeden dramatically more effective. Hotel staff could interact with realistic question types, drag to reorder, and preview the guest experience — which surfaced insights about naming ("Questions" not "Fields"), template needs, and variant pricing that static mockups wouldn't have caught.
- Proposing the full-page redesign early instead of patching the modal was the right call. It required more upfront work but created room for every subsequent feature. As I described to the product team: "a great example is how we redesigned the Upsells page to be full page in order to accommodate for future additions to the UI. That requires PM + Designer to align on the longer term vision."
- Close collaboration with engineering throughout — from design hand-offs (recorded with transcripts shared to Notion) to working with Tommy on schema design to bug bashing with Andrea before launch. The eng design review wasn't a handoff-and-walk-away; it was an ongoing conversation about feasibility, reuse of dynamic forms patterns, and page responsiveness.
- Leveraging patterns from Compendium (translation picker, builder layout, image management) accelerated the Upsells redesign. Cross-product pattern reuse was a conscious design strategy, not coincidence.

**Would change:**
- I'd push for the dropdown field type in MVP rather than scoping down to text-only. The scope-down was pragmatic — it shipped faster — but the immediate post-launch feedback was about dropdown support, and hotels with structured options (wine selections, tour times) had to wait months. Getting dropdown in V1 would have made the launch more compelling.
- I should have anticipated the discoverability issue with form questions in the guest experience earlier. The bottom sheet treatment buried custom questions, and it took a follow-up ticket to explore the full-page treatment. Testing the guest flow more rigorously in prototype testing (not just the staff builder) would have caught this.
- The bug bash process before launch was reactive — I should have established a structured QA framework earlier in the cycle rather than doing a final sprint of triage. This is something I learned from the Compendium QA process and should have applied from the start.

**What I learned:**
- Form design is workflow design. The form itself is the easy part — the hard part is understanding where in the workflow information gets collected, where it surfaces, and what happens when it's missing. Designing forms for upsells meant designing the staff's entire request management workflow, not just input fields.
- Scoping down features (text-only MVP) and scoping up the container (full-page layout) is a powerful combination. You ship something small inside something that can grow, rather than something small that has to be rebuilt.
- User testing with real hotel operators — not just internal stakeholders — consistently produces the highest-signal feedback. Hotel Jackson's "Dream come true" reaction validated the concept, but their specific feedback about naming, templates, and variant pricing shaped the entire roadmap.

---

### Visual Gallery

```
## The Work

Figma source of truth: https://www.figma.com/design/jHv8wPznHxClRlVSYLRupm/Upsells--Creation-Page---Forms
Figma (Upsell Variants): https://www.figma.com/design/DPhuDWeQOIue8YBOrFuZFG/Upsell-Variants
Figma (Auto-approval): https://www.figma.com/design/Zeqkw40MF3UOizVCeLELsU/Upsell-Auto-approval
Figma (Design Source of Truth): https://www.figma.com/design/MdkJY7doDZLAffXOvzzujG/Upsells--Design-Source-of-Truth
Figma (Compendium Updates): https://www.figma.com/design/iGy5vjrQw3qwV9cN0X10yf/Upsells-(Compendium-Updates)

[TODO: Full-page upsell creation flow — add-on with form builder section]
  Figma: https://www.figma.com/design/jHv8wPznHxClRlVSYLRupm/Upsells--Creation-Page---Forms?node-id=38-5644
[TODO: Live mobile preview showing guest-facing upsell with form]
  Figma: https://www.figma.com/design/jHv8wPznHxClRlVSYLRupm/Upsells--Creation-Page---Forms?node-id=934-26896 (Live Preview)
[TODO: Form builder — question types (text, dropdown, date, time)]
  Figma: https://www.figma.com/design/jHv8wPznHxClRlVSYLRupm/Upsells--Creation-Page---Forms?node-id=38-5644
[TODO: Guest mobile experience — upsell detail with form questions]
[TODO: Staff dashboard — new request with form responses in side sheet]
  Figma: https://www.figma.com/design/jHv8wPznHxClRlVSYLRupm/Upsells--Creation-Page---Forms?node-id=2967-26428 (Deny button/side sheet)
[TODO: Approve/deny workflow with form response context]
[TODO: Manual translations for custom questions]
  Figma: https://www.figma.com/design/jHv8wPznHxClRlVSYLRupm/Upsells--Creation-Page---Forms?node-id=3024-25203
[TODO: Before/after — modal creation vs. full-page creation]
[TODO: Code prototype on Vercel (v0-upsell-forms.vercel.app)]
[TODO: Upsell Variants — variant configuration UI]
  Figma: https://www.figma.com/design/DPhuDWeQOIue8YBOrFuZFG/Upsell-Variants?node-id=91-13456
```

---

### Next Project →

**Check-in Dashboard 2.0**
Redesigning the hotel front desk's daily command center

---

# Check-in Dashboard 2.0 & IHG Guest Experience

---

## CARD VIEW

```
[TODO: Cover image — split of staff dashboard with Guest Gallery and guest mobile check-in flow on phone, 16:9]

CHECK-IN DASHBOARD 2.0
Redesigning the hotel front desk's daily command center

Canary Technologies • 2023–2025 • Designer

Dashboard Design • Enterprise • Keyboard UX
```

---

## CASE STUDY PAGE

### Hero Section

```
← Back to Work

# Check-in Dashboard 2.0 & IHG Guest Experience

A complete redesign of the hotel front desk check-in dashboard — from reservation management to guest verification — followed by a modernized guest-facing check-in flow built for IHG's enterprise pilot.

---

Company          Canary Technologies
Timeline         18 months (Oct 2023 – Apr 2025)
Role             Designer (21% dashboard ownership, contributed to IHG V2)
Team             2–3 Designers, 4–6 Engineers, 1 PM (Arihant Daga → Andy Monroe)
```

---

### Quick Stats

```
┌─────────────────┬─────────────────┬─────────────────┬─────────────────┐
│  100+            │  ~12%           │  80%+            │  24             │
│  Hotels rolled   │  Reg card       │  Hotels migrated │  Design         │
│  out on Dash 2.0 │  submission     │  to Guest UI V2  │  iterations on  │
│  (Q2 2025)       │  rate increase  │  (Q3 2025)       │  check-in UX    │
└─────────────────┴─────────────────┴─────────────────┴─────────────────┘
```

---

### The Problem

Hotel front desks are chaotic environments — staff manage dozens of arriving guests simultaneously, verify IDs, process payments, handle upsell requests, and assign rooms, all while maintaining a welcoming demeanor. Canary's original check-in dashboard presented this information as a flat list with limited structure, making it hard for agents to prioritize or pre-process guests before they arrived. Staff couldn't quickly distinguish between completed, partial, and pending submissions, and there was no visual way to recognize guests on arrival.

The urgency escalated in mid-2023 when Wyndham — one of the world's largest hotel franchises — entered enterprise deal negotiations with Canary for a GMS (Guest Management System) rollout covering Check-in, Check-out, and Upsells. Wyndham was "at the 99 yard line with another vendor," and Canary's leadership described the timeline as "highly accelerated." Winning this deal meant proving that the check-in product could operate at enterprise scale — thousands of properties, corporate-level oversight, brand-specific configurations. The existing dashboard wasn't built for that scrutiny.

On the guest side, the check-in flow was a legacy V1 experience — functional but inconsistent, with old UI components, non-responsive layouts, and registration cards that varied wildly between hotels. When IHG — one of the world's largest hotel chains — later signed on for a GXP (Guest Experience Platform) pilot, Canary needed a modernized guest check-in flow that could meet enterprise standards: branded, mobile-first, and scalable across hundreds of properties globally.

---

### The Solution

I contributed to the Check-in Dashboard 2.0 redesign early in my tenure at Canary — designing the empty states, checklist interactions, keyboard experience audit, and reservation movement patterns — and later designed visual updates to the guest-facing check-in flow for IHG's enterprise pilot, including the registration card and hotel policies screens.

[TODO: Hero mockup — dashboard with Guest Gallery on right showing verified guests with face photos, reservation list on left]

#### Key Design Decisions

1. **Checklist-driven verification workflow**
   The old dashboard treated check-in as a single action. I helped design the checklist pattern that breaks verification into discrete, trackable steps — confirm ID, confirm payment, review upsells, view registration card — so front desk agents always know where they are in the process and nothing gets missed. Hotels could see at a glance which guests were fully verified and ready for a seamless arrival. I designed the checklist sign-off interaction that Aman reviewed and approved.
   [TODO: Visual — verification modal showing checklist with ID, payment, upsells, and reg card steps]

2. **Guest Gallery for arrival recognition**
   I designed the pattern for moving checked-in reservations into a visual "Guest Gallery" on the right side of the dashboard — where verified guests appear with their face photo (extracted from their submitted ID), name, loyalty status, and room assignment. This is the feature that makes the check-in experience "magical" — when a guest walks in, the front desk agent can recognize them by face, greet them by name, and hand them a pre-cut key. I shared a Loom walkthrough of this interaction with the team.
   [TODO: Visual — Guest Gallery showing "Ready for Check-in" cards with guest photos and room assignments]

3. **Keyboard experience audit and fixes**
   I initiated and led a comprehensive keyboard audit of the Check-in 2.0 dashboard (DSN-233), documenting every focus state issue, tab navigation bug, escape key inconsistency, and missing arrow key navigation. The audit surfaced systemic problems: modals that couldn't be closed with Escape, dropdowns without arrow key navigation, missing focus states on checkboxes and credit card containers, and inconsistent behavior across components. This wasn't glamorous work, but it was foundational — a dashboard that front desk agents use all day needs to feel fluid under keyboard navigation.
   [TODO: Visual — keyboard audit documentation showing issues and proposed fixes]

4. **IHG V2: Modernized guest check-in screens**
   For the IHG pilot, I designed updated visual styles for the "Reservation info" and "Hotel policies" screens within the guest check-in flow (DSN-1257). The existing V1 screens used legacy components and inconsistent layouts. I proposed a clean registration card design aligned with IHG's brand standards and Canary's evolving design system. I also created design tickets for the intro screen updates that Miguel executed on, ensuring the full guest journey felt cohesive from landing page through completion.
   [TODO: Visual — before/after of guest check-in registration card (V1 legacy vs. V2 IHG branded)]

---

### [+] Research & Discovery

#### What I Learned

**Research methods used:**
- Keyboard audit of the full Check-in 2.0 dashboard — documented every keyboard interaction issue in a structured Notion page with screenshots, filed engineering bugs in Linear
- Customer research for keyboard shortcuts (DSN-271) — studied how front desk staff actually interact with the dashboard during peak hours
- Design review sessions with Aman (VP Product) — iterated on checklist sign-off patterns and empty state designs
- Cross-designer collaboration with Miguel (Senior) on IHG pilot visual updates, and with Wenjun (Staff) on kiosk QR code experience
- Observed IHG pilot feedback from InterContinental Sydney onboarding — training sessions surfaced real-world issues with registration cards, loyalty badge positioning, and guest flow edge cases
- Competitive analysis of check-in solutions — Duve was the primary benchmark (Aman called a full Duve demo "mandatory watching for everyone"), with SmartStay dominant in APAC, Civitfun strong in Spain/EMEA regulatory compliance, and B4 competing on payment processor integrations. Duve's strengths: 75% online check-in adoption, persistent mobile login, advanced segmentation (by rate code, room type, loyalty status), and a bidding feature for room upgrades. Canary's web-based approach (no app download) was a differentiator, but the dashboard needed to close gaps in automation, segmentation, and staff workflow efficiency.

**Key insights:**
1. Front desk agents rely heavily on keyboard navigation during peak check-in hours — they're switching between reservations, verifying IDs, and processing payments without lifting their hands from the keyboard. The audit revealed that our dashboard had functional keyboard commands but significant dysfunction in focus states, tab navigation, and escape behavior that made the experience clunky. → I documented every issue with screenshots and proposed fixes, establishing a baseline for keyboard UX across Canary's staff-facing products.
2. The "Guest Gallery" concept — showing verified guests with face photos for arrival recognition — is what transforms digital check-in from an administrative tool into a hospitality tool. Training materials emphasized this as the "magical" moment. → I designed the transition animation and card layout for moving reservations from the list into the gallery.
3. Enterprise chains like IHG and Wyndham have specific brand requirements that the V1 guest experience couldn't accommodate — custom loyalty badges, branded registration cards, specific policy language. → This validated the need for the V2 guest UI that could be configured per brand, and informed my registration card and hotel policies redesign for the IHG pilot.
4. Registration cards are wildly inconsistent across hotels — some use responsive layouts, some use legacy Canary UI, some have incompatible date input types. The V1→V2 migration required cleaning up each hotel's registration card individually before they could be switched. → The OKR review noted this was the main blocker to scaling the rollout: "there is a long tail of hotels to transition whose reg cards are all over the place."
5. The check-in conversion funnel showed clear drop-off: registration card 60% → upsells 92% → ID 72% → credit card 80%. → This data shaped prioritization — the registration card step was the biggest friction point, making the V2 redesign of that screen high-leverage.

---

### [+] Design Process

#### How I Got There

**Approach:** Start with the staff's daily reality — what do they need to see, verify, and act on? — then build the interface around that workflow rather than around data structures.

[TODO: Visual — evolution from V1 flat list to V2 structured dashboard with Guest Gallery]

**Phases:**
- **Dashboard 2.0 foundations (Oct 2023 – Apr 2024):** This was one of my first projects at Canary, led by Arihant Daga — and it was driven by the Wyndham enterprise deal. The project was a complete revamp of the check-in dashboard — new reservation list with collapsible sections (Completed, Partial, Pending, Checked-in, Other), a verification modal with step-by-step checklist, Guest Gallery for arrival recognition, and a new ID capture tool that extracted guest faces from submitted IDs. I designed the empty states, the checked-in reservation movement interaction, and the checklist sign-off experience. I also designed deposit-related screens and the Wyndham Direct/BNPL virtual card payment use case (DSN-117). In January 2024, Wyndham's corporate team reviewed Dashboard 2.0 and I directly synthesized their feedback — messaging shortcuts buried in the details view, verification checks not auto-completing, confusing "Other" category labels, date picker bugs — into actionable design changes. Aman directed me and Wenjun on specific responses to each point, and I delivered final designs within days. This was designing under enterprise pressure: real corporate stakeholders reviewing real builds on an accelerated timeline.
- **Keyboard experience audit (Mar – Apr 2024):** I initiated a comprehensive keyboard audit (DSN-233) — systematically testing every keyboard interaction on the dashboard, documenting issues in Notion with annotated screenshots, and filing engineering tickets. The audit covered focus states, tab/shift+tab navigation, enter/return behavior, escape handling, arrow key navigation, and data entry patterns. I identified that while all expected keyboard commands existed, there was significant dysfunction that made the experience feel clunky for power users.
- **Check-in V2 guest experience for IHG (Feb – May 2025):** When IHG's GXP pilot required a modernized guest check-in flow, Andy Monroe led the project with milestones for IHG Exec Team Demo, Pilot Must-hits, and Lab Setup. Miguel handled the bulk of the guest-facing screen redesigns (landing page, desktop/mobile layouts), while I designed the updated "Reservation info" and "Hotel policies" visual styles (DSN-1257) and created the intro screen update tickets (DSN-1126). The IHG pilot launched across US, UK, and Australia properties — starting with Atlanta Regent (ATLRC), then expanding to InterContinental Sydney, UK properties (Birmingham, Oxford, London), and the IHG Premium Conference.
- **V2 rollout and migration (Apr – Sep 2025):** The guest UI V2 rolled out in waves — first to friendly hotels, then 100+ hotels (completing the Q2 KR), then all Wyndham properties on September 2, then Best Western. Each wave required monitoring submission rates to ensure the redesign didn't decrease conversions. The results were positive: ~12% increase in reg card submission rate and ~9% increase in full check-in completion rate after migration.

**Constraints I designed around:**
- **Enterprise deal pressure** — Dashboard 2.0 was driven by the Wyndham enterprise deal, meaning designs were reviewed by corporate stakeholders on accelerated timelines, not just internal teams
- **Early tenure** — This was one of my first major projects at Canary, so I was simultaneously learning the product domain, team dynamics, and codebase while contributing to the redesign — under enterprise-level scrutiny
- **Registration card diversity** — Every hotel has a different registration card configuration (responsive vs. legacy, different field types, different date formats), which made the V2 migration a manual, hotel-by-hotel process
- **Enterprise brand requirements** — IHG required specific loyalty badge positioning, branded messaging templates, and custom registration card fields that the generic V1 UI couldn't support
- **Multiple designers** — The check-in space involved contributions from three designers (Marco, Miguel, Wenjun), requiring clear ownership boundaries and close collaboration

[TODO: Visual — before/after of check-in dashboard (V1 flat list vs. V2 structured layout with Guest Gallery)]

---

### [+] Impact & Results

#### What Happened

**Business impact:**
- Check-in Dashboard 2.0 shipped and rolled out to 100+ hotels in Q2 2025, completing the KR: "Successfully roll out check-in redesign to 100 hotels (including IHG pilots) without decreasing guest submission rate"
- Guest UI V2 migrated to 80%+ of all active check-in hotels by Q3 2025, including all Wyndham and Best Western properties — completing the migration KR at 100% achievement
- ~12% increase in registration card submission rate after V2 migration (47% → 53% of viewed reservations)
- ~9% increase in full check-in completion rate (32% → 35% of viewed reservations)
- The Wyndham enterprise deal — the original catalyst for Dashboard 2.0 — resulted in 4,570+ sites live on Connect and 691 on Connect Plus by October 2025, with all Wyndham properties migrated to the V2 guest experience on September 2, 2025
- IHG GXP pilot launched across 10+ properties in US, UK, and Australia — IHG's Global CEO Ellie Malouf personally engaged with progress reports
- The pilot drove IHG to explore expanded scope: mobile key integration, kiosk check-in, room-ready alerts, and mobile SDK integration (iOS and Android, in progress Jan 2026)
- [TODO: Check-in product revenue metrics — CARR, ARR, number of hotels using check-in product]

**User impact:**
- Front desk staff could pre-process guest information before arrival — verifying ID, payment, and upsells in advance — then recognize guests by face when they walked in, creating a "seamless and magical" check-in experience
- InterContinental Sydney's onboarding training surfaced specific feedback: Diamond Royal Ambassadors wanted their guaranteed 10am check-in visible in the ETA dropdown, and staff wanted easier handling of accompanying guest profiles
- The keyboard audit established a baseline for staff-facing keyboard UX — issues I documented were referenced in subsequent engineering work on focus states and component behavior
- IHG pilot properties in Atlanta saw positive initial results, leading to expansion to UK properties and the IHG Premium Conference (300 attendees, Kimpton Sylvan)
- CS teams noted the V2 guest experience was significantly easier to onboard new hotels onto compared to V1

**Product impact:**
- The Dashboard 2.0 patterns (Guest Gallery, verification checklist, reservation sections) became the foundation for all subsequent check-in product development
- The V2 guest UI became the default for all new hotels — any new check-in onboarding automatically uses the modernized flow
- IHG's expanded engagement drove multiple new product workstreams: mobile SDK integration (iOS/Android check-in UI flow, Jan 2026), kiosk QR code experience, room-ready alerts, and the IHG Guest Journey Visioning Workshop
- Registration card patterns I contributed to informed the broader "auth V2" work — streamlining signature fields and form layouts across the guest journey
- The check-in V2 architecture enabled the IHG pilot onboarding to be partially automated via scripts, reducing CS dependency

**Enterprise traction:**
- IHG: GXP pilot across US, UK, and Australia; expanded to IHG Premium Conference, Kimpton Sylvan Tech Committee activation, and mobile SDK
- Wyndham: All properties migrated to V2 guest experience (Sep 2, 2025)
- Best Western: Piloted and rolled out to V2 following Wyndham
- Marriott: Separate but related check-in V2 work via KAT (Kiosk at Terminal) program

---

### [+] Reflection

#### What I'd Do Differently

**Worked well:**
- The keyboard audit was one of the highest-signal, lowest-glamour pieces of work I did. Systematically documenting every interaction issue — with screenshots, reproduction steps, and proposed fixes — created a clear engineering backlog and established me as someone who cares about the details that staff encounter every day. It's the kind of work that's easy to skip but compounds in value.
- Contributing to the checklist and Guest Gallery patterns early in my tenure gave me deep understanding of the check-in product domain. When the IHG pilot needed design updates months later, I had the context to contribute registration card and policy screen designs quickly because I understood how the pieces fit together.
- Close collaboration across designers worked well on this project. Miguel led the IHG guest-facing screens while I handled specific components (reg card visual style, hotel policies), and we stayed coordinated through Figma comments and design review sessions. The ownership was clear, which prevented duplication.

**Would change:**
- I should have pushed to own a larger piece of the IHG V2 guest experience. Miguel handled the primary screen designs while I contributed specific screens — this was partly a function of timing and pod assignments, but I could have been more proactive about claiming scope, especially since I had deep context on the dashboard side.
- The keyboard audit was thorough but reactive — I did it as a standalone project rather than integrating keyboard UX checks into the regular design review process. If I'd established a keyboard QA checklist earlier, we could have caught issues as they were introduced rather than auditing after the fact.
- I didn't connect my dashboard contributions to business metrics as effectively as I should have. The ~12% reg card submission rate increase is compelling, but I wasn't tracking it or advocating for it in real time. Aman's feedback about making impact visible applies here — I should have been the person presenting these numbers to the team, not learning about them after the fact.

**What I learned:**
- The structured patterns I learned on the dashboard — section-based layouts, step-by-step checklists, configuration surfaces that mirror the end-user experience — directly informed how I later designed the Compendium builder. Both products share the same core challenge: giving hotel staff a structured way to manage complex, multi-step workflows. The dashboard taught me to think in terms of states and transitions, which carried through every product I touched after.
- Enterprise products are designed in layers. The dashboard, the guest flow, the registration card, the brand configuration, and the onboarding scripts are all part of one system — and a design change in one layer ripples through the others. The V1→V2 migration taught me that "designing a new guest UI" actually means "cleaning up thousands of hotel-specific configurations so the new UI renders correctly."
- First-impression projects shape your reputation — especially when they carry enterprise stakes. The dashboard work was one of my first visible contributions at Canary, and it happened under the pressure of the Wyndham deal. Synthesizing corporate feedback directly, delivering design updates on an accelerated timeline, and showing I could operate in an enterprise context established credibility early. The thoroughness of the keyboard audit reinforced that. Both carried forward into how PMs and engineers viewed my later work on Compendium and F&B.
- Shared ownership works when boundaries are clear. The three-designer model on check-in could have been messy, but it worked because each person had defined scope. That's a pattern I applied later when collaborating with Becca on the Upsells modifier system for F&B ordering.

---

### Visual Gallery

```
## The Work

Figma source of truth: https://www.figma.com/design/MwGKEmjFx3aoEc0ZKHCUp0/Check-In-Dashboard-2.0
Figma (Follow-ups): https://www.figma.com/design/JszU8od75EDNhJIpunvMLO/Check-in-2.0-Follow-ups

[TODO: Full-width — Check-in Dashboard 2.0 with reservation list and Guest Gallery]
  Figma: https://www.figma.com/design/MwGKEmjFx3aoEc0ZKHCUp0/Check-In-Dashboard-2.0?node-id=2417-68216 (Source of truth tab)
[TODO: Verification modal — checklist with ID confirmation, payment, upsells review]
[TODO: Guest Gallery — "Ready for Check-in" cards with face photos and room numbers]
[TODO: Empty state designs for dashboard sections]
  Figma: https://www.figma.com/design/JszU8od75EDNhJIpunvMLO/Check-in-2.0-Follow-ups?node-id=938-35282 (Empty states)
[TODO: Keyboard audit documentation — annotated screenshots of issues]
[TODO: IHG branded guest check-in flow — landing page and registration card]
[TODO: Before/after — V1 guest check-in vs. V2 modernized experience]
[TODO: IHG pilot properties — mobile check-in on guest phone]
[TODO: Registration card V2 — hotel policies screen for IHG]
[TODO: Multi-guest STB hotel-facing dashboard]
  Figma: https://www.figma.com/design/JszU8od75EDNhJIpunvMLO/Check-in-2.0-Follow-ups?node-id=2341-10174
[TODO: Email input field autocomplete design]
  Figma: https://www.figma.com/design/MwGKEmjFx3aoEc0ZKHCUp0/Check-In-Dashboard-2.0?node-id=5842-45578
```

---

### Next Project →

**F&B Mobile Ordering**
End-to-end mobile ordering that drives hotel revenue

---

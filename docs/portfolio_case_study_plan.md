# Portfolio Case Study Plan
## Prioritized Project Selection & Framing Strategy

*Created: 2026-01-30*
*Source context: Canary work history (234+ tickets, Sep 2023 - Jan 2026), profile, active projects, promotion criteria*

---

## Why These Projects, In This Order

Portfolio should demonstrate the three competencies Marco's manager Aman identified for Senior promotion:
1. **Product thinking** — Go beyond UI, contribute to strategy and business impact
2. **Design leadership** — Drive design direction independently, not just execute briefs
3. **Stakeholder communication** — Be visible with cross-functional partners, surface progress proactively

Each project below is selected to prove at least two of these, with the full set covering all three.

---

## Tier 1: Must-Include

### 1. F&B Ordering Platform (Hero Piece)
**What it proves:** Product thinking, design leadership

**Why it's the strongest piece:**
- 0-to-1 product with 100% design ownership — Marco is the sole designer
- Now in production and actively expanding (Flexible Ordering workstream, Jan 2026)
- Directly tied to a measurable business goal: *increase average Canary revenue per room from $5.10 to $10*
- The Flexible Ordering work shows real architectural thinking, not just screen design

**Key narrative arc:**
1. **Research & MVP** (Nov 2025): 30 design iterations in 4-day sprint. Designed end-to-end ordering from menu browsing to payment, order management for staff, menu management for admins
2. **Post-MVP iteration** (Dec 2025 - Jan 2026): Modifiers system (guest + staff + menu management), tax/supplement experience, ETA display, email notifications, testing without going live
3. **Flexible Ordering expansion** (Jan 2026): Extended beyond in-room dining to support non-PMS hotels, non-guest visitors, alternative delivery locations (pools, lounges)

**The insight to highlight:**
Marco identified that **delivery type** (in-room vs. alternative location) is the single variable that drives auth requirements, checkout flow, and staff fulfillment workflow. This became the architectural foundation — configured per Compendium outlet. He designed 6 guest checkout scenarios (A-1 through A-3 for in-room, B-1 through B-3 for alternative locations) covering PMS/non-PMS x signed-in/signed-out/visitor permutations.

**Key terminology decisions Marco drove:**
- "Delivery type" (admin config label)
- "Ordered by" (dashboard column, replacing "Guest Name")
- "Order without signing in" (guest-facing, avoiding "Continue as Guest" confusion)
- "Location example for guests" (admin placeholder config)

**Stakeholders:** PM Nico Garnier, Eng Lead Joanne Chevalier, Eng Design Luciano Guasco

**Figma:** [F&B Ordering](https://www.figma.com/design/sKLjczvpLbn9SPYLxlUbdD/Food---Beverage-Ordering?node-id=236-14630)

---

### 2. Upsells Forms System (Deep Dive Piece)
**What it proves:** Design leadership, stakeholder communication

**Why it's strong:**
- 63% ownership of a revenue-critical product (12/19 project files)
- Deep interaction design complexity: form builder, variants/modifiers, auto-approval, custom questions with translations, validation states, live preview
- Sustained work over ~6 months (mid-2025) showing iterative refinement, not just a sprint
- Marriott RFP designs show ability to adapt work for enterprise sales contexts

**Key narrative arc:**
1. **Upsell Forms redesign** (Jul-Sep 2025): Reworked add-on/upgrade creation modal, form builder, field type selection, validation error states, live preview designs
2. **Custom questions & translations** (Sep 2025): Internationalization layer for form fields
3. **Auto-approve add-ons** (Oct 2025): Designed automated approval workflows to reduce manual staff intervention
4. **Max quantity per guest** (Nov 2025): Constraint system for inventory management
5. **Enterprise adaptation**: Marriott RFP designs, Marriott guest experience demo, upsell cards experimentation

**Complexity to highlight:**
- Designing a flexible form system that serves both hotel admins (configuration) and guests (purchase experience)
- Handling edge cases: denied requests workflow (24 iterations), interaction improvements from bug bash, dropdown field re-integration
- Discovery work on variants/modifiers direction (DSN-1483) — research informing product direction

**Stakeholders:** PM Becca Aleynik (with Nico mentoring)

---

## Tier 2: Strong Supporting Pieces

### 3. Check-in 2.0 Dashboard Redesign (Craft Piece)
**What it proves:** Design leadership, stakeholder communication

**Why it matters:**
- Marco's earliest major project at Canary (Dec 2023) — shows growth arc over 2+ years
- Full redesign of a core operational tool used daily by hotel front desk staff
- Extended into enterprise adaptations for IHG (V2 styling, May 2025) and Wyndham (QR code booking, Feb-Mar 2025)
- The polish work (color, typography, spacing, border audits) demonstrates craft and attention to detail

**Key narrative arc:**
1. **Core redesign** (Dec 2023): New details view, animations/illustrations, core flows, mobile key flow, micro-interactions
2. **Polish & refinement** (Feb-Apr 2024): Systematic audits — colors, typography, spacing, borders. CanaryTable styling. Details view with upsells integration
3. **Enterprise scaling** (2025): IHG V2 visual style update, Wyndham QR code booking flow, OCR for guest IDs, keyboard shortcut research
4. **Design system contributions**: Skeletal loading states, text field visual updates, report dispute UX

**What to emphasize:** Before/after transformation. The systematic approach to polish (audit-driven, not ad hoc). How the redesign became the foundation for enterprise client customization.

**Key tickets:** DSN-79 (original redesign), DSN-313 (polish), DSN-675 (OCR), DSN-767/847 (Wyndham QR), DSN-1257 (IHG V2)

---

### 4. Compendium Guest Experience (Platform Piece — shorter format)
**What it proves:** Product thinking, design leadership

**Why it matters:**
- 100% of project files — full ownership of the guest-facing digital information portal
- Platform-level thinking: theming system, custom carousels, section building, desktop optimization
- Designed for configurability — hotels customize the experience for their brand (COMO, Best Western, Wyndham)
- Directly led into F&B integration (connects to hero piece)

**Key work:**
- Guest experience designs and theming (Dec 2024)
- Custom carousels and generic templates (Feb-Mar 2025)
- Compendium Lite offering (May 2025, 22 iterations)
- Custom sections and image bulk upload (May 2025)
- Section groupings: attractions, dining options, on-premise/nearby restaurants (Sep 2025)
- Compendium Polish for Wide Release (completed Oct 2024)
- Captive Portal to Compendium flow (Mar 2025)

**What to emphasize:** Designing a system, not just screens. The challenge of supporting diverse hotel brands while maintaining quality and consistency. Keep this shorter — it's strongest as context for the F&B story.

---

## Tier 3: Selective Inclusion

### 5. Digital Tipping — Admin Wallet Visibility
- Currently in progress (DSN-1622), target 2026-03-31
- Tied to business metric: *tip money held in Canary/Tremendous balances < 1.5 months net tip volume*
- Include only if completed before portfolio is needed, and only if you can show problem framing and design rationale
- Supporting work: customizable copy, disclaimer text, staff list QR filtering, disburse by hours worked

### 6. Enterprise Sales Enablement
- Not a standalone case study — weave into other pieces
- Marriott RFP (Upsells), Choice Hotels RFP, IHG prototypes, Wyndham QR code
- Board presentation slides, Q3 EPD slides, 2025 vision slides
- Shows stakeholder communication and business impact framing

### 7. Design System / CanaryUI Contributions
- Not a standalone case study — reference within other pieces
- CanarySideSheet, star rating accessibility, Statler branded library, CanaryCard variations
- Shows craft and systems thinking as supporting evidence

---

## Recommended Portfolio Structure

| Slot | Project | Format | Senior competency |
|------|---------|--------|-------------------|
| **Hero** | F&B Ordering (0→1 + Flexible Ordering) | Full case study | Product thinking + Design leadership |
| **Deep dive** | Upsells Forms System | Full case study | Design leadership + Stakeholder communication |
| **Craft** | Check-in 2.0 Redesign | Medium case study | Design leadership + Stakeholder communication |
| **Platform** | Compendium | Short case study or supporting piece | Product thinking + Design leadership |

---

## Framing Guidance

### What to lead with in every case study
- **The business problem and metric**, not the design task. "Hotels needed to increase revenue per room" not "I designed an ordering flow"
- **Decisions you drove**, not just screens you made. Terminology choices, architectural models, product direction
- **Cross-functional context** — who you worked with, what you influenced beyond design

### What to avoid
- Iteration counts as impact metrics (27 iterations doesn't mean much to a portfolio reviewer — focus on what changed and why)
- Figma file coverage percentages (these are internal productivity metrics, not portfolio-worthy)
- Generic business impact claims without specifics

### Language to use (maps to Aman's Senior criteria)
- "I identified that..." / "I proposed..." (product thinking)
- "I drove the decision to..." / "I defined..." (design leadership)
- "I surfaced this to..." / "I created documentation so that..." (stakeholder communication)

---

## Source Files (for future Claude sessions)

These files in the Obsidian vault contain the raw context:
- `/Documents/marcowits/Canary/context/history.md` — Complete ticket history (234+ tickets)
- `/Documents/marcowits/Canary/context/profile.md` — Role, strengths, promotion criteria
- `/Documents/marcowits/Canary/context/projects.md` — Active projects with codebase locations
- `/Documents/marcowits/Canary/context/projects/fb-flexible-ordering/fb-flexible-ordering-context.md` — F&B Flexible Ordering deep context
- `/Documents/marcowits/Canary/CLAUDE.md` — Full Canary productivity agent context

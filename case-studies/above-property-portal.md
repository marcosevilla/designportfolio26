# Above Property Portal

---

## CARD VIEW

```
[TODO: Cover image — Above Property dashboard showing portfolio analytics across multiple properties, 16:9]

ABOVE PROPERTY PORTAL
The first enterprise dashboard for multi-property hotel management

Canary Technologies • 2024 • Lead Designer

Enterprise Design • Information Architecture • Permissions Systems
```

---

## CASE STUDY PAGE

### Hero Section

```
← Back to Work

# Above Property Portal

An analytics and management dashboard that gives enterprise hotel groups portfolio-wide visibility — from user permissions to property performance — across hundreds of properties.

---

Company          Canary Technologies
Timeline         6 months (Dec 2023 – Jun 2024)
Role             Lead Designer (40% Above Property ownership)
Team             1 Designer, 4 Engineers (Gareth Lloyd, Montserrat Pladevall, Ryan Rogers, Ramiro Nieto), 1 PM (Brad Andrews), Project Lead (Connor Swords)
```

---

### Quick Stats

```
┌─────────────────┬─────────────────┬─────────────────┬─────────────────┐
│  100%            │  65 → 200+      │  3               │  DSN-130        │
│  Enterprise GMS  │  Portfolio users │  Major brands    │  Large design   │
│  adoption        │  (KR: 100%      │  (Wyndham, BW,   │  ticket —       │
│                  │  achieved)       │  IHG)            │  user mgmt      │
└─────────────────┴─────────────────┴─────────────────┴─────────────────┘
[TODO: Replace with stronger business metrics when available — CARR contribution, enterprise deal value, time saved for corporate admins]
```

---

### The Problem

Enterprise hotel groups — Wyndham with 4,570+ properties, Best Western, IHG — had no centralized way to manage their Canary deployment. Corporate administrators couldn't see which properties were using which features, couldn't manage user roles across their portfolio, and had to contact Canary's CS team for basic operations like creating new users or adjusting permissions. Engineering was regularly pulled in to script large-scale role changes for enterprise customers.

This wasn't just a usability problem — it was a sales blocker. Enterprise deals required demonstrating portfolio-level control, and without a corporate-facing portal, Canary was competing for $18M+ contracts (like Wyndham's GMS deal) without the enterprise tooling buyers expected. As the Notion KR doc put it: "The Above Property Dashboard is a key Canary differentiator and our primary corporate-facing portal. Best way to turn corporate users into power users and Canary champions."

---

### The Solution

I designed the user management and portfolio management experience for Canary's first enterprise dashboard — a portal where corporate administrators can manage users, roles, portfolios, and permissions across their entire property network.

[TODO: Hero mockup — Above Property dashboard showing portfolio view with user management panel]

#### Key Design Decisions

1. **Two-tier role architecture: Above Property vs. Managed**
   Enterprise hotel groups need fundamentally different role types — a revenue manager viewing aggregate analytics across 200 properties has different needs than a front desk associate at a single hotel. I designed a two-tier system: Above Property roles (portfolio-level, aggregate views, not visible at hotel level) and Managed roles (hotel-level, visible but not editable by property staff). This distinction was the core IA decision — it determined the entire permissions model, the navigation structure, and how corporate administrators think about access control. The PRD defined specific permission sets for each: view PMS integrations, portfolio management (add/assign hotels), role creation, and user allocation.
   [TODO: Visual — role architecture diagram showing Above Property vs. Managed role types]

2. **Portfolio as a flexible container, not a rigid hierarchy**
   Hotels can belong to multiple portfolios — "all Wyndham properties" and "all Canary properties in Texas" can overlap. I designed portfolios and sub-portfolios as flexible groupings rather than strict trees, which reflected how enterprise customers actually organize their properties. This was validated when Wyndham asked whether "hotels automatically get assigned to the portfolio when a new property is built" — the model needed to handle dynamic property sets, not static lists.
   [TODO: Visual — portfolio hierarchy showing overlapping property groupings]

3. **Progressive disclosure for complex permissions**
   The permissions surface is deep — portfolio analytics, sub-portfolio management, PMS integrations, payment gateway visibility, role creation, and user allocation all need distinct controls. Rather than exposing everything upfront, I designed the permission sets as contextual to role type, so administrators only see relevant permissions when creating or editing a role. This kept the interface manageable for the initial use case (Wyndham corporate onboarding) while supporting the full permission matrix the PRD required.
   [TODO: Visual — user management panel showing role creation with contextual permissions]

4. **"Above Property" naming to replace "Corporate"**
   The original designs used "Corporate Dashboard" and "Corporate Portal." During a product team discussion (Jan 2024), Aman Shahi flagged that "Above Property" better describes the product's function — it's the view above individual properties, not necessarily a corporate-only tool. I updated all designs to use this terminology: Above Property User, Above Property Portal, Above Property Analytics. This naming stuck and became the official product language across the company.
   [TODO: Visual — navigation showing Above Property Portal entry point]

---

### [+] Research & Discovery

#### What I Learned

**Research methods used:**
- PRD review and design exploration with Brad Andrews (PM) — user management and portfolio management requirements from enterprise customers
- Design review with Wenjun Zhao — feedback session that shaped P0 priorities (Jan 26, 2024)
- Figma walkthrough + Loom recording shared with Brad for async review (Feb 5, 2024)
- Engineering design review with Stephen Reddekopp — thorough Figma inspection surfaced edge cases in modal design and badge states (Jun 2024)
- Enterprise customer requirements from Wyndham, Best Western, and IHG onboarding processes
- Competitive context from enterprise GMS market — Canary needed portfolio-level tooling to compete for large contracts

**Key insights:**
1. Enterprise administrators think in portfolios, not individual properties. A Wyndham corporate user managing 4,570+ properties can't navigate one hotel at a time — they need aggregate views with drill-down capability. → I designed the portfolio as the primary navigation concept, with properties accessible within portfolio context.
2. Role management at scale requires both creation and allocation as separate operations. Creating a "Regional Manager" role template is different from assigning 15 people to that role across 200 properties. → I separated role definition (what permissions does this role have?) from role assignment (who has this role, at which properties?) in the user management flow.
3. Hotels transitioning from legacy rights models need a migration path. Many properties had ad-hoc permission setups built over time. → The design supported both granular per-property control and portfolio-wide role templates, so enterprise customers could standardize incrementally.
4. The initial modal format was too cramped for the "Managed" badge distinction. Stephen Reddekopp's thorough Figma review (Jun 2024) caught that the modal needed to clearly indicate which roles were managed from above vs. defined locally. → I amended the modal to include a visible "Managed" badge, making the role origin immediately clear to hotel-level admins.
5. Corporate administrators need self-service, not CS-mediated access. The PRD explicitly stated the goal was to "expose previously CS-only functionality to large customer employees" and "reduce the need for engineering resources to script large role shifts." → Every management action (create user, assign role, add property to portfolio) was designed to be fully self-service.

**Research artifact:**
I created a comprehensive Figma file (Above-Property-Portal: User-Management) that served as the source of truth design. It included the full user management flow, portfolio management views, role architecture, and permission sets. I attached a Loom walkthrough directly to the Figma file for async review with Brad, and the file was later referenced by engineering (Stephen Reddekopp, Gareth Lloyd) and design (Wenjun Zhao) during implementation phases throughout 2024.

---

### [+] Design Process

#### How I Got There

**Approach:** Start with the enterprise administrator's mental model — how do they think about their portfolio? — then design the management tools to match that structure rather than imposing Canary's internal data model.

[TODO: Visual — evolution from Corporate Dashboard to Above Property Portal]

**Iterations:**
- **Initial exploration (Dec 2023):** Brad Andrews created the original "Corporate Dashboard" Figma file (SYr4LPcAPPJKi2AGSQqvtS) with early concepts for portfolio-level views. I began design iterations on top of this foundation, exploring how user management and analytics would work at the corporate level.
- **User management design (Jan 2024):** Brad created DSN-130 for me — a large design ticket to show how user and portfolio management would look in the context of the corporate portal. I worked from the PRD (Notion) to design the full user management flow: role architecture (Above Property vs. Managed), permission sets, user creation and assignment, and portfolio management views. Wenjun provided design feedback (Jan 26) which I addressed before sharing with Brad.
- **Figma walkthrough + Loom (Jan 31 – Feb 5, 2024):** Shared the Above Property Portal User Management Figma link with Brad (Jan 31), then attached a Loom walkthrough to the Figma for async review (Feb 5). The Loom walked through the full user management flow and connected the design decisions back to the PRD requirements. Linear ticket COR-972 tracked the eng handoff.
- **Terminology shift (Jan 2024):** Aman Shahi proposed renaming "Corporate" to "Above Property" across all UI — "Above Property User, Above Property Portal, Above Property Analytics." I updated all designs to reflect this naming, which became the company standard.
- **Engineering review + iteration (Jun 2024):** Stephen Reddekopp did a thorough inspection of the Figma file, leaving detailed questions. I responded to his questions directly in Figma and amended the modal design to include a "Managed" badge per Brad's request — a detail that clarified role ownership for hotel-level admins.
- **Implementation + enterprise rollout (Q2–Q3 2024):** Engineering (Gareth Lloyd, Montserrat Pladevall, Ryan Rogers) built the portfolio management UI with a hidden rollout strategy — accessible only via direct link initially, tested on live Wyndham portfolio. Portfolio Management Phase 1 was code complete July 26, User Management Phase 2 code complete September 20. Bug bash by Montserrat Pladevall (Sep 4) validated the implementation before broader rollout.
- **Analytics + Marriott RFP (Jul–Sep 2025):** The portal expanded beyond my initial scope. I later contributed to Above Property analytics designs for the Marriott Upsells RFP (Jul 2025), including portfolio-level analytics dashboards and settings views. Wenjun built the full demo prototype for Marriott including the Above Property Dashboard.

**Constraints I designed around:**
- **Enterprise-first but platform-wide** — The design had to serve Wyndham's 4,570+ properties, Best Western's network, and IHG's pilot while remaining generalizable for future enterprise customers
- **Legacy role migration** — Many properties had existing ad-hoc permission setups that couldn't be wiped — the new system had to coexist with and gradually replace legacy rights
- **CS-to-self-service transition** — Corporate admins needed to do everything that previously required CS intervention, without CS losing visibility into portfolio configurations
- **Hidden rollout** — Engineering shipped to production behind a direct-link-only access pattern to test with Wyndham before making the dashboard generally discoverable

[TODO: Visual — before (CS-mediated enterprise management) vs. after (self-service Above Property Portal)]

---

### [+] Impact & Results

#### What Happened

**Business impact:**
- 100% of Enterprise GMS accounts (Wyndham, Best Western, IHG) now using the Above Property Dashboard — project KR achieved at 100%
- Portfolio user growth from 65 to 200+ external users (Q2 2025 KR, achieved at 100%) — described as requiring only "3% of available capacity," making it a high-ROI investment
- Above Property Dashboard established as "a key Canary differentiator and our primary corporate-facing portal" (Notion KR doc)
- Portfolio analytics tabs (GMS, Auths and Contracts, Tipping) migrated from legacy system into the Above Property Dashboard (Q4 2025)
- IHG uses a dedicated Above Property dashboard for weekly metric downloads — Dianna Kertz: "We have an Above Property dashboard built for IHG with all the key metrics we mutually track, I take weekly downloads from it"
- The portal supported the Wyndham $18M GMS contract — enterprise tooling was table stakes for a deal of this scale
- Feature release launched September 9, 2024 (Tier 3)
- Wyndham corporate pursuing SSO integration for Above Property users (Apr 2025) — "a huge opportunity for us to expand the set of Above Property users"

**User impact:**
- Corporate administrators can now create users, assign roles, manage portfolios, and view analytics without contacting Canary CS or requiring engineering scripts
- Connor Swords on Wyndham adoption: "The group at Wyndham was really excited about this — I asked them to send along any feedback as they start using both the property and above property views"
- Best Western corporate "fully in favor of letting properties control these" (Jan 2026) — validating the self-service design philosophy
- The portal enabled enterprise onboarding at scale: Wyndham US setup, Best Western loyalty auto-enrollment, IHG pilot homebase — all managed through Above Property
- Portfolio analytics migration eliminated dependency on legacy dashboard tooling

**Product impact:**
- The Above Property Portal became the foundation for every enterprise feature: analytics, configurations, reporting, user management, SSO — all built within the portal framework I helped establish
- V2 redesign spec (Nov 2025) plans 5 new tabs: Pulse (aggregate guest signals), Feedback (AI-generated narrative summaries), Cases (action center with SLA timers), Benchmarking (property performance vs. peer average), and Call Center
- The two-tier role architecture (Above Property vs. Managed) became the standard permissions model for enterprise customers across all Canary products
- Above Property designs were directly referenced in the Marriott Upsells RFP (Jul–Sep 2025) — dedicated analytics and settings views created for the enterprise sales opportunity
- Connor Swords led the enterprise adoption project to completion, expanding the portal well beyond the initial user management scope I designed

---

### [+] Reflection

#### What I'd Do Differently

**Worked well:**
- Designing from the PRD's specific permission sets (view PMS integrations, portfolio management, role creation) rather than abstracting too early gave the design concrete structure. Every UI element mapped to a real enterprise need.
- The Loom-on-Figma async review pattern with Brad was efficient — he could review the full flow on his own time, leave comments, and we iterated without scheduling a meeting. This pattern became part of my standard workflow for design handoffs.
- The "Above Property" naming shift happened at the right time — early enough that no shipped UI had to be renamed, but late enough that we'd explored the problem space under the more intuitive "Corporate" label first.
- The two-tier role architecture proved durable — it's still the foundation for enterprise permissions over a year later, and the V2 redesign builds on it rather than replacing it.

**Would change:**
- I'd push to include analytics views in my initial design scope, not just user and portfolio management. The analytics dashboard was a natural companion to the management tools, and designing them together would have created a more cohesive first release. Instead, analytics was layered in later through the Explo integration and then through the Marriott RFP work.
- The hidden rollout strategy (direct-link-only access) was a smart engineering decision, but I should have designed an explicit onboarding flow for corporate administrators discovering the portal for the first time. The setup process ended up being CS-guided, which partially undermined the self-service goal.
- I'd conduct direct usability testing with enterprise administrators earlier. The design was validated through PRD alignment and engineering review, but getting a Wyndham corporate admin to walk through the prototype would have caught interaction-level issues before implementation.

**What I learned:**
- Enterprise design is permissions design. The hardest part of the Above Property Portal wasn't the layouts or the analytics — it was modeling the relationship between users, roles, properties, and portfolios in a way that felt intuitive. Getting the IA right mattered more than getting the UI right.
- Designing the first version of a platform feature is uniquely high-leverage — the architecture you establish constrains or enables everything that follows. The two-tier role model, portfolio-as-flexible-container, and self-service-first philosophy all became durable patterns that subsequent teams built on without having to rethink fundamentals.
- Cross-product pattern recognition accelerated this work. The permission management patterns I designed here later informed how I thought about configuration surfaces in Compendium and Upsells — managing content across multiple properties is structurally similar to managing users across multiple properties.

---

### Visual Gallery

```
## The Work

Figma source of truth (User Management): https://www.figma.com/design/IKNHA6AMAO60UUyR65FZfA/Above-Property-Portal--User-Management
Figma (Property User Management): https://www.figma.com/design/D7rYZbiGSSacqDzCu7n3UM/Property-User-Management
Figma (Corporate Dashboard — original): https://www.figma.com/design/SYr4LPcAPPJKi2AGSQqvtS/Corporate-Dashboard
Figma (Marriott RFP — Above Property Analytics): https://www.figma.com/design/4cLQbRzLtriJLTY6I4n6v3/Marriott-Upsells-RFP---July-2025

[TODO: Above Property Portal — portfolio dashboard with property list and aggregate metrics]
  Figma: https://www.figma.com/design/IKNHA6AMAO60UUyR65FZfA/Above-Property-Portal--User-Management?node-id=2301-3566 (Main views)
[TODO: User management — creating a new Above Property role with permission sets]
[TODO: Portfolio management — portfolio hierarchy with sub-portfolios and property assignment]
  Figma: https://www.figma.com/design/D7rYZbiGSSacqDzCu7n3UM/Property-User-Management?node-id=27-17426 (Navigation/tabs)
[TODO: Role assignment — assigning managed roles across multiple properties]
[TODO: "Managed" badge on modal — distinguishing Above Property vs. property-defined roles]
  Figma: https://www.figma.com/design/IKNHA6AMAO60UUyR65FZfA/Above-Property-Portal--User-Management?node-id=2623-763 (Managed portfolios with badge)
[TODO: Analytics dashboard — portfolio-wide performance metrics (from Marriott RFP)]
  Figma: https://www.figma.com/design/4cLQbRzLtriJLTY6I4n6v3/Marriott-Upsells-RFP---July-2025?node-id=695-16458 (Above Property Analytics)
  Figma: https://www.figma.com/design/4cLQbRzLtriJLTY6I4n6v3/Marriott-Upsells-RFP---July-2025?node-id=695-16912 (Property Analytics)
[TODO: Before/after — Corporate Dashboard (original) vs. Above Property Portal]
  Figma (before): https://www.figma.com/design/SYr4LPcAPPJKi2AGSQqvtS/Corporate-Dashboard
  Figma (after): https://www.figma.com/design/IKNHA6AMAO60UUyR65FZfA/Above-Property-Portal--User-Management
[TODO: Dashboard prototype (clickable)]
  Figma: https://www.figma.com/proto/4cLQbRzLtriJLTY6I4n6v3/Marriott-Upsells-RFP---July-2025?page-id=710:19030&node-id=724-1089
```

---

### Next Project →

**Knowledge Base Redesign**
Restructuring the AI knowledge base that powers hotel chatbots and voice assistants

---

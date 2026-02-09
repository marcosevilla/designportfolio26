"use client";

import CaseStudyHero from "@/components/case-study/CaseStudyHero";
import QuickStats from "@/components/case-study/QuickStats";
import ImagePlaceholder from "@/components/case-study/ImagePlaceholder";
import ExpandableSection from "@/components/case-study/ExpandableSection";
import SidebarTOCBridge from "@/components/case-study/SidebarTOCBridge";
import TOCObserver from "@/components/case-study/TOCObserver";
import NextProject from "@/components/case-study/NextProject";
import PullQuote from "@/components/case-study/PullQuote";
import ProgressBar from "@/components/case-study/ProgressBar";
import FadeIn from "@/components/case-study/FadeIn";
import { typescale } from "@/lib/typography";

const STATS = [
  { value: "100%", label: "Design ownership" },
  { value: "30", label: "Iterations in 4-day sprint" },
  { value: "93/100", label: "Issues shipped (96% complete)" },
  { value: "6.5 hrs", label: "Saved per 100 orders (est.)" },
];

const TOC_ITEMS = [
  { id: "problem", label: "Problem" },
  { id: "solution", label: "Solution" },
  { id: "research", label: "Research" },
  { id: "process", label: "Process" },
  { id: "impact", label: "Impact" },
  { id: "reflection", label: "Reflection" },
  { id: "gallery", label: "Gallery" },
];

export default function FBOrderingContent() {
  return (
    <>
      <ProgressBar />
      <SidebarTOCBridge items={TOC_ITEMS} />
      <TOCObserver sectionIds={TOC_ITEMS.map(i => i.id)} />

      <article className="text-[var(--color-fg-secondary)]" style={typescale.body}>
        {/* Hero */}
        <CaseStudyHero
          title="F&B Mobile Ordering"
          subtitle="A mobile, app-less food and beverage ordering system that lets hotel guests browse menus and place room service orders from their phone."
          gradient={["#EF5A3C", "#ED4F2F"]}
          heroImageDescription="Hero shot — guest ordering flow on mobile"
        />

        <div className="max-w-content mx-auto">
        {/* Quick Stats */}
        <FadeIn>
          <QuickStats items={STATS} />
        </FadeIn>

        {/* Content */}
        <div className="mt-8">
          <div>
            {/* ── The Problem ── */}
            <FadeIn as="section" className="scroll-mt-24 pt-24" >
              <div id="problem" className="scroll-mt-24" />
              <h2
                className="text-[var(--color-fg)] mb-8 tracking-tight"
                style={typescale.h2}
              >
                The Problem
              </h2>
              <p className="mb-5">
                Hotels lose significant F&amp;B revenue when guests have to call the front desk to order room service — a process that ties up understaffed front desks, leads to misheard orders, and creates enough friction that many guests just open DoorDash instead. One hotel we spoke to described their breakfast system using door hangers — guests would forget to hang them, staff would miss pickups, and complaints piled up. Physical menus required sanitization, were expensive to print, and costly to update when items changed.
              </p>
              <p>
                Canary&#39;s initiative was to increase average revenue per room per month from $5.10 to $10, and in-room dining was one of the biggest untapped levers. The competitive landscape was real — Toast offered mobile ordering at $7/month, and dedicated hospitality platforms like Iris had locked in relationships with major brands like Marriott. Without a native ordering experience embedded in the guest journey, hotels were leaving money on the table and losing orders to third-party delivery apps.
              </p>
            </FadeIn>

            {/* ── The Solution ── */}
            <FadeIn as="section" className="scroll-mt-24 pt-32">
              <div id="solution" className="scroll-mt-24" />
              <h2
                className="text-[var(--color-fg)] mb-8 tracking-tight"
                style={typescale.h2}
              >
                The Solution
              </h2>
              <p className="mb-8">
                I designed a mobile-first ordering flow embedded directly in Canary&#39;s Digital Compendium — from menu browsing to order confirmation — alongside a staff fulfillment dashboard for managing incoming orders in real time.
              </p>

              <FadeIn>
                <ImagePlaceholder
                  description="Hero mockup — guest ordering flow showing menu → item detail → cart → confirmation"
                  aspectRatio="16/9"
                />
              </FadeIn>

              {/* Key decisions */}
              <h3
                className="font-medium text-[var(--color-fg)] mt-16 mb-6 tracking-tight"
                style={typescale.h3}
              >
                Key Design Decisions
              </h3>

              <div className="space-y-14">
                <FadeIn>
                  <h4 className="font-medium text-[var(--color-fg)] mb-3 tracking-tight" style={typescale.h4}>
                    1. Menu-first landing
                  </h4>
                  <p className="mb-5">
                    Guests land directly on the restaurant&#39;s menu, not a hotel info page. I prioritized showing food immediately because research showed guests arrive with intent to order — removing friction between &ldquo;I&#39;m hungry&rdquo; and &ldquo;here&#39;s what&#39;s available&rdquo; was the biggest conversion lever.
                  </p>
                  <ImagePlaceholder description="Menu landing screen" aspectRatio="3/2" />
                </FadeIn>

                <FadeIn>
                  <h4 className="font-medium text-[var(--color-fg)] mb-3 tracking-tight" style={typescale.h4}>
                    2. Delivery type drives the entire experience
                  </h4>
                  <p className="mb-5">
                    I identified that all hotel ordering workflows share a common variable: where the food goes. This became the central design insight — in-room vs. alternative location (pool, lounge) determines the checkout flow, authentication requirements, and staff fulfillment workflow. Hotels configure this per outlet, and the guest experience adapts automatically. This simplified what could have been dozens of edge cases into a clean, scalable model.
                  </p>
                  <ImagePlaceholder description="Diagram showing delivery type → checkout flow branching" aspectRatio="16/9" />
                </FadeIn>

                <FadeIn>
                  <h4 className="font-medium text-[var(--color-fg)] mb-3 tracking-tight" style={typescale.h4}>
                    3. Five system objects as the IA backbone
                  </h4>
                  <p className="mb-5">
                    The design is built on five interconnected objects: Service Locations, Menus, Item Library, Modifier Sets, and Orders. This object model meant hotels manage items in one place and compose menus flexibly — pricing can be overridden per menu without duplicating items.
                  </p>
                  <ImagePlaceholder description="System object relationship diagram" aspectRatio="16/9" />
                </FadeIn>

                <FadeIn>
                  <h4 className="font-medium text-[var(--color-fg)] mb-3 tracking-tight" style={typescale.h4}>
                    4. Reservation-linked ordering with graceful fallbacks
                  </h4>
                  <p className="mb-5">
                    For PMS-integrated hotels, orders tie to guest reservations — contact details pre-fill, identity is verified, and staff see a trust badge. For non-PMS hotels or walk-in visitors, I designed a manual entry flow that still captures everything staff need. This let us ship to a much wider range of hotels without waiting for POS integrations.
                  </p>
                  <ImagePlaceholder description="Verified vs. unverified vs. walk-in badge states on staff dashboard" aspectRatio="3/2" />
                </FadeIn>

                <FadeIn>
                  <h4 className="font-medium text-[var(--color-fg)] mb-3 tracking-tight" style={typescale.h4}>
                    5. Built on Upsells infrastructure, designed for F&amp;B
                  </h4>
                  <p className="mb-5">
                    Rather than building from scratch, F&amp;B ordering reuses Canary&#39;s existing Purchase Order system from Upsells. I designed the staff experience to feel native to F&amp;B — color-coded priorities, time-elapsed sorting, dedicated notification settings — while engineering could ship faster by leveraging existing backend rails.
                  </p>
                  <ImagePlaceholder description="Staff order fulfillment dashboard" aspectRatio="16/9" />
                </FadeIn>
              </div>
            </FadeIn>

            {/* ── Research & Discovery ── */}
            <FadeIn className="pt-32">
              <ExpandableSection title="Research & Discovery" id="research">
                <h3
                  className="font-medium text-[var(--color-fg)] mb-4 tracking-tight"
                  style={typescale.h3}
                >
                  Research methods
                </h3>
                <ul className="list-disc pl-5 space-y-2 mb-8">
                  <li>Customer interviews with hotel F&amp;B staff (The Pines Resort, COMO Hotels, Eurostar, Embassy Suites Times Square, Chateau Avalon, Malibu Beach Inn)</li>
                  <li>Prototype usability testing with hotel staff and guests</li>
                  <li>Competitive analysis (Aigens, Duve, Toast Mobile, Lightspeed, Iris/Marriott)</li>
                  <li>Design jams with engineering to validate technical feasibility</li>
                  <li>Live pilot feedback from HOMA Cherngtalay (Thailand) and Omni Hotels</li>
                </ul>

                <h3
                  className="font-medium text-[var(--color-fg)] mb-4 tracking-tight"
                  style={typescale.h3}
                >
                  Key insights
                </h3>
                <div className="space-y-6">
                  <div>
                    <p className="mb-2">
                      <strong className="text-[var(--color-fg)]">1. Phone-based ordering is the biggest pain during peak hours.</strong> Chateau Avalon described guests calling an understaffed front desk, staff taking orders manually, preparing food, delivering it, then manually charging the folio. They estimated savings of over $2,000/year just from eliminating physical menus and reducing errors.
                    </p>
                    <p className="text-[15px] text-[var(--color-fg-tertiary)]">
                      → Designed the staff dashboard to sort by time elapsed with visual urgency indicators so nothing gets missed.
                    </p>
                  </div>

                  <div>
                    <p className="mb-2">
                      <strong className="text-[var(--color-fg)]">2. Requiring POS would block 80%+ of potential customers.</strong> When a sales rep asked &ldquo;F&amp;B ordering works for any hotel right? No integrations needed?&rdquo; — that validated the no-POS-required approach.
                    </p>
                    <p className="text-[15px] text-[var(--color-fg-tertiary)]">
                      → Designed the full ordering flow to work without any POS, using manual menu management and email/SMS notifications to staff.
                    </p>
                  </div>

                  <div>
                    <p className="mb-2">
                      <strong className="text-[var(--color-fg)]">3. Guests expect consumer-app speed.</strong> A job candidate told our VP of Product that he experienced Canary&#39;s F&amp;B ordering poolside at a COMO hotel in Thailand: &ldquo;I didn&#39;t have to walk 100 meters to place an order — I could do everything from my phone.&rdquo;
                    </p>
                    <p className="text-[15px] text-[var(--color-fg-tertiary)]">
                      → Designed as mobile-optimized web flow (no app download) with familiar patterns: tap to add, cart summary, one-tap submit.
                    </p>
                  </div>

                  <div>
                    <p className="mb-2">
                      <strong className="text-[var(--color-fg)]">4. Hotels need test mode before going live.</strong>
                    </p>
                    <p className="text-[15px] text-[var(--color-fg-tertiary)]">
                      → Designed dedicated test mode so staff can walk through the full guest flow without it being visible to actual guests.
                    </p>
                  </div>

                  <div>
                    <p className="mb-2">
                      <strong className="text-[var(--color-fg)]">5. Menu availability timing matters.</strong> Competitors just dump all menus regardless of time.
                    </p>
                    <p className="text-[15px] text-[var(--color-fg-tertiary)]">
                      → Designed time-aware menu availability, inspired by Uber Eats, with a menu selector that clearly indicates which menus are currently available.
                    </p>
                  </div>
                </div>

                <h3
                  className="font-medium text-[var(--color-fg)] mt-10 mb-4 tracking-tight"
                  style={typescale.h3}
                >
                  The prototype
                </h3>
                <p className="mb-5">
                  I built a fully interactive prototype (Next.js + React, deployed to Vercel) that evolved over several weeks — starting with order management screens, expanding to menu management, then a full functional demo with 50+ pre-loaded items and real cart persistence, then AI-powered menu parsing using Claude&#39;s API, and finally the modifier system. This wasn&#39;t a throwaway prototype — it became the primary demo tool for sales calls, GTM enablement, and stakeholder reviews.
                </p>
                <ImagePlaceholder description="Code prototype on Vercel — functional demo with 50+ items" aspectRatio="16/9" />
              </ExpandableSection>
            </FadeIn>

            {/* ── Design Process ── */}
            <FadeIn className="pt-32">
              <ExpandableSection title="Design Process" id="process">
                <p className="mb-8">
                  <strong className="text-[var(--color-fg)]">Approach:</strong> Ship the simplest version that solves the core problem, then expand based on real customer feedback.
                </p>

                <ImagePlaceholder description="Early Figma explorations, wireframes of ordering flow" aspectRatio="16/9" />

                <div className="mt-10 space-y-8">
                  <div>
                    <h4 className="font-medium text-[var(--color-fg)] mb-2 tracking-tight" style={typescale.h4}>
                      Research phase (Aug 2025)
                    </h4>
                    <p>
                      Set up customer calls, wrote research scripts, and built code prototypes to validate requirements with hotel staff. Early design jams with engineering surfaced that food ordering is &ldquo;a complex process with its own operational and integration challenges&rdquo; — this shaped my decision to start simple and avoid POS dependencies.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-medium text-[var(--color-fg)] mb-2 tracking-tight" style={typescale.h4}>
                      MVP sprint (Sep 2025)
                    </h4>
                    <p>
                      30 iterations in a focused 4-day sprint to nail the core guest ordering flow — menu browsing, item selection, cart review, order submission, and confirmation with ETA.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-medium text-[var(--color-fg)] mb-2 tracking-tight" style={typescale.h4}>
                      Staff experience (Oct–Nov 2025)
                    </h4>
                    <p>
                      Designed the hotel-facing dashboard — new orders, past orders, order detail panel, approve/deny workflows. I proactively prioritized the remaining design tickets by business impact: supplemental fees first (quick revenue win), then modifier groups, then staff notifications.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-medium text-[var(--color-fg)] mb-2 tracking-tight" style={typescale.h4}>
                      Modifiers &amp; polish (Nov–Dec 2025)
                    </h4>
                    <p>
                      Designed the full modifier management system — add-ons, substitutions, and variations. Collaborated with Becca (Upsells PM) and Nico on nuanced decisions like whether to pre-select default modifiers (we studied Square, Uber Eats, and DoorDash and landed on no pre-selection).
                    </p>
                  </div>

                  <div>
                    <h4 className="font-medium text-[var(--color-fg)] mb-2 tracking-tight" style={typescale.h4}>
                      Expansion (Jan 2026)
                    </h4>
                    <p>
                      Designed the flexible ordering model — alternative delivery locations, non-PMS hotel support, walk-in visitor ordering. This required rethinking checkout as 6 distinct scenarios based on delivery type × hotel type × auth state. I shared a comprehensive design share to #epd-in-stay covering all scenarios.
                    </p>
                  </div>
                </div>

                <h3
                  className="font-medium text-[var(--color-fg)] mt-12 mb-4 tracking-tight"
                  style={typescale.h3}
                >
                  Constraints I designed around
                </h3>
                <ul className="list-disc pl-5 space-y-2">
                  <li><strong className="text-[var(--color-fg)]">No POS integration at launch</strong> — Most target hotels don&#39;t have cloud POS</li>
                  <li><strong className="text-[var(--color-fg)]">Built on existing Upsells rails</strong> — Engineering needed to ship fast</li>
                  <li><strong className="text-[var(--color-fg)]">Bundled with Compendium</strong> — Guest entry point had to live naturally within the Compendium ecosystem</li>
                  <li><strong className="text-[var(--color-fg)]">No app download</strong> — Everything as mobile web via QR code or link</li>
                </ul>

                <div className="mt-10">
                  <ImagePlaceholder description="Before/after — phone-based ordering vs. digital flow" aspectRatio="16/9" />
                </div>
              </ExpandableSection>
            </FadeIn>

            {/* ── Impact & Results ── */}
            <FadeIn className="pt-32">
              <ExpandableSection title="Impact & Results" id="impact">
                <h3
                  className="font-medium text-[var(--color-fg)] mb-4 tracking-tight"
                  style={typescale.h3}
                >
                  Business impact
                </h3>
                <ul className="list-disc pl-5 space-y-2 mb-8">
                  <li>Customer launch: January 21, 2026 — GA launch: February 9, 2026</li>
                  <li>Pricing: $1.75/room/month bundled with Compendium, $1.00/room/month as add-on</li>
                  <li>First verbal commitment: Malibu Beach Inn (Dec 2, 2025) — Director of Operations ready to sign immediately after product demo</li>
                  <li>Second verbal commitment: Embassy Suites Times Square (Dec 3, 2025)</li>
                  <li>Target: 15–30% increase in F&amp;B revenue from reduced ordering friction</li>
                  <li>GTM tiger team of 9 AEs assembled; customer launch email sent to 349+ accounts</li>
                  <li>50 F&amp;B orders processed during pilot phase, validating demand before GA</li>
                </ul>

                <FadeIn>
                  <PullQuote
                    quote="Significant value in the bundle, estimating over $2,000/year savings from eliminating physical menus and reducing errors."
                    attribution="Chateau Avalon ownership"
                  />
                </FadeIn>

                <h3
                  className="font-medium text-[var(--color-fg)] mt-10 mb-4 tracking-tight"
                  style={typescale.h3}
                >
                  User impact
                </h3>
                <ul className="list-disc pl-5 space-y-2 mb-8">
                  <li>HOMA Cherngtalay (Thailand pilot) actively used the product and provided constructive feedback — validating real hotel adoption</li>
                  <li>Crown Resorts (Australia) requested a dedicated demo, signaling enterprise interest in APAC</li>
                  <li>Multiple APAC properties expressing interest with combined potential ARR of $25K+</li>
                </ul>

                <FadeIn>
                  <PullQuote
                    quote="Customers value having mobile ordering as part of Canary because it enhances visibility for F&B as part of Compendium, makes it easier to engage via Messaging, and bundles products into one provider."
                    attribution="Nico Garnier, PM"
                  />
                </FadeIn>

                <h3
                  className="font-medium text-[var(--color-fg)] mt-10 mb-4 tracking-tight"
                  style={typescale.h3}
                >
                  Product impact
                </h3>
                <ul className="list-disc pl-5 space-y-2 mb-6">
                  <li>F&amp;B Ordering became the foundation for a broader Mobile Ordering platform — POS integration, order scheduling, and insights dashboard in pipeline</li>
                  <li>The delivery-type model is now the architectural pattern for all future ordering scenarios including spa and activity bookings</li>
                  <li>My code prototype became a GTM asset — Marketing pulled images for sales slides, CS used it for training</li>
                </ul>
              </ExpandableSection>
            </FadeIn>

            {/* ── Reflection ── */}
            <FadeIn className="pt-32">
              <ExpandableSection title="Reflection" id="reflection">
                <h3
                  className="font-medium text-[var(--color-fg)] mb-4 tracking-tight"
                  style={typescale.h3}
                >
                  Worked well
                </h3>
                <ul className="list-disc pl-5 space-y-2 mb-8">
                  <li>Building a code prototype early (not just Figma) made customer research dramatically more effective — hotel staff could interact with realistic menus and ordering flows. The prototype evolved into a genuine GTM asset.</li>
                  <li>The &ldquo;delivery type drives the experience&rdquo; insight simplified the entire product architecture — one variable that determines the flow instead of dozens of edge cases.</li>
                  <li>Close collaboration with PM (Nico Garnier) on customer calls gave me direct exposure to buyer pain points — I wasn&#39;t designing from second-hand requirements.</li>
                  <li>Cross-functional design collaboration with Becca (Upsells PM) on the modifier system surfaced edge cases early.</li>
                </ul>

                <h3
                  className="font-medium text-[var(--color-fg)] mb-4 tracking-tight"
                  style={typescale.h3}
                >
                  Would change
                </h3>
                <ul className="list-disc pl-5 space-y-2 mb-8">
                  <li>I&#39;d push harder to include staff notifications in the MVP. Post-launch feedback from HOMA showed hotels needed more immediate alerts — their F&amp;B team had to keep checking for new messages.</li>
                  <li>Item remarks discoverability could have been stronger. HOMA&#39;s feedback was specific: &ldquo;It is not clear from the main menu screen that guests need to tap into the item to leave a remark.&rdquo; I should have caught this in prototype testing.</li>
                  <li>The AI menu parsing experiment (Claude&#39;s API) was well-received but stayed as a prototype. I&#39;d push to get it into the roadmap earlier since manual menu setup is the biggest onboarding friction.</li>
                </ul>

                <h3
                  className="font-medium text-[var(--color-fg)] mb-4 tracking-tight"
                  style={typescale.h3}
                >
                  What I learned
                </h3>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Designing for two distinct audiences in one product (guests ordering + staff fulfilling) requires thinking about the system, not just the screens.</li>
                  <li>Shipping without POS integration was the right call — it let us validate demand months earlier than waiting for integrations.</li>
                  <li>The prototype-to-product pipeline works. Building in code created a shared artifact that aligned engineering, product, sales, and marketing around a tangible vision.</li>
                </ul>
              </ExpandableSection>
            </FadeIn>

            {/* ── Visual Gallery ── */}
            <FadeIn as="section" className="scroll-mt-24 pt-32">
              <div id="gallery" className="scroll-mt-24" />
              <h2
                className="text-[var(--color-fg)] mb-8 tracking-tight"
                style={typescale.h2}
              >
                The Work
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <FadeIn><ImagePlaceholder description="Guest menu browsing on mobile" aspectRatio="3/4" /></FadeIn>
                <FadeIn delay={0.1}><ImagePlaceholder description="Item detail with modifiers and special requests" aspectRatio="3/4" /></FadeIn>
                <FadeIn><ImagePlaceholder description="Cart review and order submission" aspectRatio="3/4" /></FadeIn>
                <FadeIn delay={0.1}><ImagePlaceholder description="Order confirmation with ETA" aspectRatio="3/4" /></FadeIn>
                <FadeIn><ImagePlaceholder description="Staff fulfillment dashboard — new orders" aspectRatio="16/9" /></FadeIn>
                <FadeIn delay={0.1}><ImagePlaceholder description="Staff order detail with approve/deny" aspectRatio="16/9" /></FadeIn>
                <FadeIn><ImagePlaceholder description="Hotel admin — delivery type setup" aspectRatio="16/9" /></FadeIn>
                <FadeIn delay={0.1}><ImagePlaceholder description="Supplemental fees and taxes configuration" aspectRatio="16/9" /></FadeIn>
              </div>
            </FadeIn>

            {/* ── Next Project ── */}
            <FadeIn>
              <NextProject
                title="Compendium"
                subtitle="Building a scalable hotel CMS platform from scratch"
                href="/work/compendium"
              />
            </FadeIn>
          </div>
        </div>
        </div>
      </article>
    </>
  );
}

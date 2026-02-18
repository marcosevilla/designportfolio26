"use client";

import { useState } from "react";
import QuickStats from "@/components/case-study/QuickStats";
import ImagePlaceholder from "@/components/case-study/ImagePlaceholder";
import ExpandableSection from "@/components/case-study/ExpandableSection";
import SidebarTOCBridge from "@/components/case-study/SidebarTOCBridge";
import TOCObserver from "@/components/case-study/TOCObserver";
import NextProject from "@/components/case-study/NextProject";
import PullQuote from "@/components/case-study/PullQuote";
import ProgressBar from "@/components/case-study/ProgressBar";
import InlineTOC from "@/components/case-study/InlineTOC";
import FadeIn from "@/components/case-study/FadeIn";
import SectionHeading from "@/components/case-study/SectionHeading";
import CaseStudyHeroImage from "@/components/case-study/CaseStudyHeroImage";
import ProjectDetails from "@/components/case-study/ProjectDetails";
import BrowserMockup from "@/components/fb-showcase/BrowserMockup";
import MobileShowcase from "@/components/fb-showcase/MobileShowcase";
import SystemArchitecture from "@/components/fb-showcase/SystemArchitecture";
import RoadmapEvolution from "@/components/fb-showcase/RoadmapEvolution";
import TwoCol from "@/components/TwoCol";
import { typescale } from "@/lib/typography";

const STATS = [
  { value: "100%", label: "Design ownership" },
  { value: "30", label: "Iterations in 4-day sprint" },
  { value: "93/100", label: "Issues shipped (96% complete)" },
  { value: "6.5 hrs", label: "Saved per 100 orders (est.)" },
];

const TOC_ITEMS = [
  { id: "gallery", label: "Gallery" },
  { id: "context", label: "Context" },
  { id: "problem", label: "Problem" },
  { id: "solution", label: "Solution" },
  { id: "research", label: "Research" },
  { id: "process", label: "Process" },
  { id: "impact", label: "Impact" },
  { id: "reflection", label: "Reflection" },
];

const PRINCIPLES = [
  {
    number: "01",
    title: "Cut scope aggressively",
    summary: "We weren\u2019t building DoorDash for hotels \u2014 we were solving a specific operational pain point.",
    detail: "The market was full of full-stack restaurant platforms and consumer ordering apps. Staying disciplined about what we wouldn\u2019t build (no multi-vendor marketplaces, no kitchen operations, no consumer-facing discovery) let us ship a focused product in four months. Every feature had to pass one test: does this help a hotel get a guest\u2019s food order to staff faster?\n\nOne example: we originally planned to build the Ordering Outlet as its own standalone page, but after further research we realized we could abstract it into the existing Compendium system \u2014 reducing product surface area and eliminating an entire layer of future UI maintenance.",
  },
  {
    number: "02",
    title: "Don\u2019t reinvent the wheel",
    summary: "We studied dozens of ordering platforms to internalize proven patterns, then adapted them for hotels.",
    detail: "Uber Eats, Toast, Square, DoorDash, Lightspeed \u2014 we dissected how each handles menus, modifiers, cart state, and checkout. Rather than designing from scratch, we adopted conventions guests already understand (tap to add, cart summary, one-tap submit) and layered in hotel-specific needs like room charge billing, delivery type selection, and reservation-linked identity.",
  },
  {
    number: "03",
    title: "Make it extensible",
    summary: "The first use case was in-room dining, but the architecture needed to support what comes next.",
    detail: "We designed the object model (ordering outlets, menus, items, modifier groups) to be context-agnostic. The same structure that powers room service can support poolside ordering, spa bookings, activity reservations, and restaurant table-side ordering \u2014 without a redesign. The delivery-type abstraction became the key: swap the fulfillment context, and the rest of the system adapts.",
  },
];

function DesignPrinciples() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-2">
      {PRINCIPLES.map((p, i) => {
        const isOpen = openIdx === i;
        return (
          <button
            key={i}
            onClick={() => setOpenIdx(isOpen ? null : i)}
            className="text-left rounded-lg border p-4 transition-all duration-200 cursor-pointer"
            style={{
              backgroundColor: isOpen
                ? "color-mix(in oklch, var(--color-accent) 4%, var(--color-bg))"
                : "var(--color-bg)",
              borderColor: isOpen
                ? "color-mix(in oklch, var(--color-accent) 25%, var(--color-border))"
                : "var(--color-border)",
            }}
          >
            <div className="flex items-baseline gap-2 mb-2">
              <span
                className="text-[var(--color-accent)]"
                style={{ ...typescale.label }}
              >
                {p.number}
              </span>
              <span
                className="text-[var(--color-fg)]"
                style={{ ...typescale.label, textTransform: "uppercase" }}
              >
                {p.title}
              </span>
            </div>
            <p
              className="text-[var(--color-fg-secondary)]"
              style={{ fontSize: "13px", lineHeight: 1.5 }}
            >
              {p.summary}
            </p>
            <div
              className="grid transition-[grid-template-rows] duration-300 ease-out"
              style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
            >
              <div className="overflow-hidden">
                {p.detail.split("\n\n").map((paragraph, j) => (
                  <p
                    key={j}
                    className={`${j === 0 ? "mt-3" : "mt-2"} text-[var(--color-fg-secondary)]`}
                    style={{ fontSize: "13px", lineHeight: 1.5 }}
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

export default function FBOrderingContent() {
  return (
    <>
      <ProgressBar />
      <SidebarTOCBridge items={TOC_ITEMS} />
      <TOCObserver sectionIds={TOC_ITEMS.map(i => i.id)} />

      <article className="text-[var(--color-fg-secondary)]" style={typescale.body}>
        <InlineTOC />
        <div className="max-w-content mx-auto px-4 sm:px-8 lg:max-w-none lg:px-0 pt-24 lg:pt-[18vh]">

        {/* Title + Subtitle + Project Details */}
        <div className="lg:grid lg:gap-x-20 lg:items-start" style={{ gridTemplateColumns: "2fr 1fr" }}>
          <div>
            <h1 className="tracking-tight text-[var(--color-fg)] whitespace-nowrap" style={typescale.display}>F&B Mobile Ordering</h1>
            <p className="mt-3 text-[var(--color-fg-secondary)]">I led the design of a mobile ordering system for hotels, expanding Canary&apos;s product suite into new revenue channels — spanning guest ordering, a menu CMS, and a staff fulfillment dashboard. The product went from concept to production in four months, shipping 93 of 100 scoped issues across three connected surfaces.</p>
          </div>
          <div className="mt-6 lg:mt-[52px] overflow-hidden">
            <ProjectDetails rows={[
              { label: "Company", value: "Canary Technologies", content: "Hotel software platform serving 20,000+ properties worldwide." },
              { label: "Timeline", value: "Oct 2024 – Feb 2025", content: "Designed and shipped in a 4-day sprint, iterated over 4 months." },
              { label: "Team", value: "In-stay pod (9)", content: "Marco Sevilla — Lead Designer · Nicolas Garnier — Product Lead · Becca Aleynik — Product Manager · Andrea Bradshaw — Eng Lead · Joanne Chevalier — SWE · Austin Irvine — SWE · Adil Shaikh — SWE · Grant Jenkins — SWE · Luciano Guasco — SWE" },
              { label: "Scope", value: "20+ shipped", content: "", groups: [
                { heading: "Guest Ordering", items: ["Menu browsing & item customization", "Cart & checkout with room charge", "Order status tracking", "Real-time order notifications"] },
                { heading: "Staff Dashboard", items: ["Order queue & fulfillment view", "Order detail side sheet with accept/deny", "Delivery type configuration (in-room, poolside, etc.)"] },
                { heading: "Menu CMS", items: ["Categories, items & modifier management", "Supplemental fees & tax rules", "Multi-property menu templating"] },
              ] },
            ]} />
          </div>
        </div>

        {/* Hero Image — browser mockup with dashboard screenshot */}
        <div className="mt-16">
          <BrowserMockup
            src="/images/fb-ordering/fb-ordering-dashboard.png"
            alt="F&B ordering dashboard — order detail side sheet open"
            url="app.canarytech.net/fb-orders"
            width={1344}
            height={787}
          />
        </div>

        {/* Quick Stats */}
        <FadeIn>
          <QuickStats items={STATS} />
        </FadeIn>

        {/* ── Visual Gallery ── */}
        <FadeIn as="section" className="scroll-mt-24 pt-16">
          <SectionHeading id="gallery">Design highlights</SectionHeading>
          {/* Mobile screens — overlapping phone frames */}
          <FadeIn className="mt-10">
            <MobileShowcase />
          </FadeIn>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-10">
            <FadeIn delay={0.1}><ImagePlaceholder description="Order confirmation with ETA" aspectRatio="3/4" /></FadeIn>
            <FadeIn><ImagePlaceholder description="Staff fulfillment dashboard — new orders" aspectRatio="16/9" /></FadeIn>
            <FadeIn delay={0.1}><ImagePlaceholder description="Staff order detail with approve/deny" aspectRatio="16/9" /></FadeIn>
            <FadeIn><ImagePlaceholder description="Hotel admin — delivery type setup" aspectRatio="16/9" /></FadeIn>
            <FadeIn delay={0.1}><ImagePlaceholder description="Supplemental fees and taxes configuration" aspectRatio="16/9" /></FadeIn>
          </div>
        </FadeIn>

        {/* ── Context ── */}
        <FadeIn as="section" className="scroll-mt-24 pt-24">
          <TwoCol>
            <TwoCol.Left>
              <SectionHeading id="context">From static content to revenue engine</SectionHeading>
              <p className="mb-5">
                Canary was expanding into APAC markets where mobile ordering was table stakes, not a differentiator. Without it, we couldn&#39;t compete. Closer to home, dedicated platforms like Iris and Toast were locking in contracts with major brands, and deals were slipping because we had no answer.
              </p>
              <p className="mb-5">
                The challenge: Canary&#39;s Guest Hub was still a static content product — hotel info, amenities, messaging, basic upsells. Functional, but not transactional. F&amp;B ordering would change that, turning Guest Hub from a content layer into a revenue-generating platform. Rather than building from scratch, we&#39;d extend the existing Upsells infrastructure: reuse the backend, design a new guest experience for food ordering, and add F&amp;B-specific capabilities like menus, modifiers, and time-based availability.
              </p>
              <p>
                The biggest risk was scope. The market was full of consumer ordering apps and full-stack restaurant platforms. We had to stay disciplined: no multi-vendor marketplaces, no consumer-facing discovery, no kitchen operations software. Solve the hotel&#39;s problem — getting guest orders to staff efficiently — and nothing more.
              </p>
            </TwoCol.Left>
          </TwoCol>
        </FadeIn>

        {/* ── The Problem ── */}
        <FadeIn as="section" className="scroll-mt-24 pt-32">
          <TwoCol>
            <TwoCol.Left>
              <SectionHeading id="problem">The Problem</SectionHeading>
              <p>
                Hotels lose significant F&amp;B revenue when guests have to call the front desk to order room service — a process that ties up understaffed front desks, leads to misheard orders, and creates enough friction that many guests just open DoorDash instead. One hotel we spoke to described their breakfast system using door hangers — guests would forget to hang them, staff would miss pickups, and complaints piled up. Physical menus required sanitization, were expensive to print, and costly to update when items changed.
              </p>
            </TwoCol.Left>
          </TwoCol>
        </FadeIn>

        {/* ── The Solution ── */}
        <FadeIn as="section" className="scroll-mt-24 pt-32">
          <TwoCol>
            <TwoCol.Left>
              <SectionHeading id="solution">The Solution</SectionHeading>
              <p className="mb-8">
                I designed a mobile-first ordering flow embedded directly in Canary&#39;s Digital Compendium — from menu browsing to order confirmation — alongside a staff fulfillment dashboard for managing incoming orders in real time.
              </p>
            </TwoCol.Left>
          </TwoCol>

          <FadeIn>
            <ImagePlaceholder
              description="Hero mockup — guest ordering flow showing menu → item detail → cart → confirmation"
              aspectRatio="16/9"
            />
          </FadeIn>

          <TwoCol className="mt-10">
            <TwoCol.Left>
              <SectionHeading>Design approach</SectionHeading>
            </TwoCol.Left>
          </TwoCol>

          <DesignPrinciples />

          {/* Roadmap evolution — between principles and decision blocks */}
          <FadeIn className="mt-16">
            <TwoCol>
              <TwoCol.Left>
                <SectionHeading level={4}>Shaping the roadmap</SectionHeading>
                <p>
                  We didn&apos;t build a linear roadmap and execute top-to-bottom. Research, design, and development ran in parallel &mdash; and the roadmap evolved as assumptions got tested. Features we initially planned got descoped when research revealed they weren&apos;t essential for launch. Others emerged from customer conversations we didn&apos;t expect. The final shipped scope looks nothing like the first draft.
                </p>
              </TwoCol.Left>
              <TwoCol.Right>
                <RoadmapEvolution />
              </TwoCol.Right>
            </TwoCol>
          </FadeIn>

          {/* Decision blocks — paired: text left, image right */}
          <div className="space-y-14 mt-6">
            <FadeIn>
              <TwoCol>
                <TwoCol.Left>
                  <SectionHeading level={4}>1. Menu-first landing</SectionHeading>
                  <p>
                    Guests land directly on the restaurant&#39;s menu, not a hotel info page. I prioritized showing food immediately because research showed guests arrive with intent to order — removing friction between &ldquo;I&#39;m hungry&rdquo; and &ldquo;here&#39;s what&#39;s available&rdquo; was the biggest conversion lever.
                  </p>
                </TwoCol.Left>
                <TwoCol.Right>
                  <ImagePlaceholder description="Menu landing screen" aspectRatio="3/2" />
                </TwoCol.Right>
              </TwoCol>
            </FadeIn>

            <FadeIn>
              <TwoCol>
                <TwoCol.Left>
                  <SectionHeading level={4}>2. Delivery type drives the entire experience</SectionHeading>
                  <p>
                    I identified that all hotel ordering workflows share a common variable: where the food goes. This became the central design insight — in-room vs. alternative location (pool, lounge) determines the checkout flow, authentication requirements, and staff fulfillment workflow. Hotels configure this per outlet, and the guest experience adapts automatically. This simplified what could have been dozens of edge cases into a clean, scalable model.
                  </p>
                </TwoCol.Left>
                <TwoCol.Right>
                  <ImagePlaceholder description="Diagram showing delivery type → checkout flow branching" aspectRatio="16/9" />
                </TwoCol.Right>
              </TwoCol>
            </FadeIn>

            <FadeIn>
              <TwoCol>
                <TwoCol.Left>
                  <SectionHeading level={4}>3. Five system objects as the IA backbone</SectionHeading>
                  <p>
                    The design is built on five interconnected objects: Ordering Outlets, Menus, Items, Modifier Groups, and Orders. This object model meant hotels manage items in one place and compose menus flexibly — pricing can be overridden per menu without duplicating items.
                  </p>
                </TwoCol.Left>
              </TwoCol>
              <div className="mt-8">
                <SystemArchitecture />
              </div>
            </FadeIn>

            <FadeIn>
              <TwoCol>
                <TwoCol.Left>
                  <SectionHeading level={4}>4. Reservation-linked ordering with graceful fallbacks</SectionHeading>
                  <p>
                    For PMS-integrated hotels, orders tie to guest reservations — contact details pre-fill, identity is verified, and staff see a trust badge. For non-PMS hotels or walk-in visitors, I designed a manual entry flow that still captures everything staff need. This let us ship to a much wider range of hotels without waiting for POS integrations.
                  </p>
                </TwoCol.Left>
                <TwoCol.Right>
                  <ImagePlaceholder description="Verified vs. unverified vs. walk-in badge states on staff dashboard" aspectRatio="3/2" />
                </TwoCol.Right>
              </TwoCol>
            </FadeIn>

            <FadeIn>
              <TwoCol>
                <TwoCol.Left>
                  <SectionHeading level={4}>5. Built on Upsells infrastructure, designed for F&amp;B</SectionHeading>
                  <p>
                    Rather than building from scratch, F&amp;B ordering reuses Canary&#39;s existing Purchase Order system from Upsells. I designed the staff experience to feel native to F&amp;B — color-coded priorities, time-elapsed sorting, dedicated notification settings — while engineering could ship faster by leveraging existing backend rails.
                  </p>
                </TwoCol.Left>
                <TwoCol.Right>
                  <ImagePlaceholder description="Staff order fulfillment dashboard" aspectRatio="16/9" />
                </TwoCol.Right>
              </TwoCol>
            </FadeIn>
          </div>
        </FadeIn>

        {/* ── Research & Discovery ── */}
        <FadeIn className="pt-32">
          <ExpandableSection title="Research & Discovery" id="research">
            <TwoCol>
              <TwoCol.Left>
                <SectionHeading level={3}>Research methods</SectionHeading>
                <ul className="list-disc pl-5 space-y-2 mb-8">
                  <li>Customer interviews with hotel F&amp;B staff (The Pines Resort, COMO Hotels, Eurostar, Embassy Suites Times Square, Chateau Avalon, Malibu Beach Inn)</li>
                  <li>Prototype usability testing with hotel staff and guests</li>
                  <li>Competitive analysis (Aigens, Duve, Toast Mobile, Lightspeed, Iris/Marriott)</li>
                  <li>Design jams with engineering to validate technical feasibility</li>
                  <li>Live pilot feedback from HOMA Cherngtalay (Thailand) and Omni Hotels</li>
                </ul>
              </TwoCol.Left>
            </TwoCol>

            <TwoCol>
              <TwoCol.Left>
                <SectionHeading level={3}>Key insights</SectionHeading>
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
              </TwoCol.Left>
            </TwoCol>

            <TwoCol className="mt-8">
              <TwoCol.Left>
                <SectionHeading level={3}>The prototype</SectionHeading>
                <p className="mb-5">
                  I built a fully interactive prototype (Next.js + React, deployed to Vercel) that evolved over several weeks — starting with order management screens, expanding to menu management, then a full functional demo with 50+ pre-loaded items and real cart persistence, then AI-powered menu parsing using Claude&#39;s API, and finally the modifier system. This wasn&#39;t a throwaway prototype — it became the primary demo tool for sales calls, GTM enablement, and stakeholder reviews.
                </p>
              </TwoCol.Left>
              <TwoCol.Right>
                <ImagePlaceholder description="Code prototype on Vercel — functional demo with 50+ items" aspectRatio="16/9" />
              </TwoCol.Right>
            </TwoCol>
          </ExpandableSection>
        </FadeIn>

        {/* ── Design Process ── */}
        <FadeIn className="pt-32">
          <ExpandableSection title="Design Process" id="process">
            <TwoCol>
              <TwoCol.Left>
                <p className="mb-8">
                  <strong className="text-[var(--color-fg)]">Approach:</strong> Ship the simplest version that solves the core problem, then expand based on real customer feedback.
                </p>
              </TwoCol.Left>
            </TwoCol>

            <ImagePlaceholder description="Early Figma explorations, wireframes of ordering flow" aspectRatio="16/9" />

            <TwoCol className="mt-10">
              <TwoCol.Left>
                <div className="space-y-8">
                  <div>
                    <SectionHeading level={4}>Research phase (Aug 2025)</SectionHeading>
                    <p>
                      Set up customer calls, wrote research scripts, and built code prototypes to validate requirements with hotel staff. Early design jams with engineering surfaced that food ordering is &ldquo;a complex process with its own operational and integration challenges&rdquo; — this shaped my decision to start simple and avoid POS dependencies.
                    </p>
                  </div>

                  <div>
                    <SectionHeading level={4}>MVP sprint (Sep 2025)</SectionHeading>
                    <p>
                      30 iterations in a focused 4-day sprint to nail the core guest ordering flow — menu browsing, item selection, cart review, order submission, and confirmation with ETA.
                    </p>
                  </div>

                  <div>
                    <SectionHeading level={4}>Staff experience (Oct–Nov 2025)</SectionHeading>
                    <p>
                      Designed the hotel-facing dashboard — new orders, past orders, order detail panel, approve/deny workflows. I proactively prioritized the remaining design tickets by business impact: supplemental fees first (quick revenue win), then modifier groups, then staff notifications.
                    </p>
                  </div>

                  <div>
                    <SectionHeading level={4}>Modifiers &amp; polish (Nov–Dec 2025)</SectionHeading>
                    <p>
                      Designed the full modifier management system — add-ons, substitutions, and variations. Collaborated with Becca (Upsells PM) and Nico on nuanced decisions like whether to pre-select default modifiers (we studied Square, Uber Eats, and DoorDash and landed on no pre-selection).
                    </p>
                  </div>

                  <div>
                    <SectionHeading level={4}>Expansion (Jan 2026)</SectionHeading>
                    <p>
                      Designed the flexible ordering model — alternative delivery locations, non-PMS hotel support, walk-in visitor ordering. This required rethinking checkout as 6 distinct scenarios based on delivery type × hotel type × auth state. I shared a comprehensive design share to #epd-in-stay covering all scenarios.
                    </p>
                  </div>
                </div>
              </TwoCol.Left>
            </TwoCol>

            <TwoCol className="mt-10">
              <TwoCol.Left>
                <SectionHeading level={3}>Constraints I designed around</SectionHeading>
                <ul className="list-disc pl-5 space-y-2">
                  <li><strong className="text-[var(--color-fg)]">No POS integration at launch</strong> — Most target hotels don&#39;t have cloud POS</li>
                  <li><strong className="text-[var(--color-fg)]">Built on existing Upsells rails</strong> — Engineering needed to ship fast</li>
                  <li><strong className="text-[var(--color-fg)]">Bundled with Compendium</strong> — Guest entry point had to live naturally within the Compendium ecosystem</li>
                  <li><strong className="text-[var(--color-fg)]">No app download</strong> — Everything as mobile web via QR code or link</li>
                </ul>
              </TwoCol.Left>
            </TwoCol>

            <div className="mt-10">
              <ImagePlaceholder description="Before/after — phone-based ordering vs. digital flow" aspectRatio="16/9" />
            </div>
          </ExpandableSection>
        </FadeIn>

        {/* ── Impact & Results ── */}
        <FadeIn className="pt-32">
          <ExpandableSection title="Impact & Results" id="impact">
            <TwoCol>
              <TwoCol.Left>
                <SectionHeading level={3}>Business impact</SectionHeading>
                <ul className="list-disc pl-5 space-y-2 mb-8">
                  <li>Customer launch: January 21, 2026 — GA launch: February 9, 2026</li>
                  <li>Pricing: $1.75/room/month bundled with Compendium, $1.00/room/month as add-on</li>
                  <li>First verbal commitment: Malibu Beach Inn (Dec 2, 2025) — Director of Operations ready to sign immediately after product demo</li>
                  <li>Second verbal commitment: Embassy Suites Times Square (Dec 3, 2025)</li>
                  <li>Target: 15–30% increase in F&amp;B revenue from reduced ordering friction</li>
                  <li>GTM tiger team of 9 AEs assembled; customer launch email sent to 349+ accounts</li>
                  <li>50 F&amp;B orders processed during pilot phase, validating demand before GA</li>
                </ul>
              </TwoCol.Left>
            </TwoCol>

            <FadeIn>
              <PullQuote
                quote="Significant value in the bundle, estimating over $2,000/year savings from eliminating physical menus and reducing errors."
                attribution="Chateau Avalon ownership"
              />
            </FadeIn>

            <TwoCol>
              <TwoCol.Left>
                <SectionHeading level={3}>User impact</SectionHeading>
                <ul className="list-disc pl-5 space-y-2 mb-8">
                  <li>HOMA Cherngtalay (Thailand pilot) actively used the product and provided constructive feedback — validating real hotel adoption</li>
                  <li>Crown Resorts (Australia) requested a dedicated demo, signaling enterprise interest in APAC</li>
                  <li>Multiple APAC properties expressing interest with combined potential ARR of $25K+</li>
                </ul>
              </TwoCol.Left>
            </TwoCol>

            <FadeIn>
              <PullQuote
                quote="Customers value having mobile ordering as part of Canary because it enhances visibility for F&B as part of Compendium, makes it easier to engage via Messaging, and bundles products into one provider."
                attribution="Nico Garnier, PM"
              />
            </FadeIn>

            <TwoCol>
              <TwoCol.Left>
                <SectionHeading level={3}>Product impact</SectionHeading>
                <ul className="list-disc pl-5 space-y-2 mb-6">
                  <li>F&amp;B Ordering became the foundation for a broader Mobile Ordering platform — POS integration, order scheduling, and insights dashboard in pipeline</li>
                  <li>The delivery-type model is now the architectural pattern for all future ordering scenarios including spa and activity bookings</li>
                  <li>My code prototype became a GTM asset — Marketing pulled images for sales slides, CS used it for training</li>
                </ul>
              </TwoCol.Left>
            </TwoCol>
          </ExpandableSection>
        </FadeIn>

        {/* ── Reflection ── */}
        <FadeIn className="pt-32">
          <ExpandableSection title="Reflection" id="reflection">
            <TwoCol>
              <TwoCol.Left>
                <SectionHeading level={3}>Worked well</SectionHeading>
                <ul className="list-disc pl-5 space-y-2 mb-8">
                  <li>Building a code prototype early (not just Figma) made customer research dramatically more effective — hotel staff could interact with realistic menus and ordering flows. The prototype evolved into a genuine GTM asset.</li>
                  <li>The &ldquo;delivery type drives the experience&rdquo; insight simplified the entire product architecture — one variable that determines the flow instead of dozens of edge cases.</li>
                  <li>Close collaboration with PM (Nico Garnier) on customer calls gave me direct exposure to buyer pain points — I wasn&#39;t designing from second-hand requirements.</li>
                  <li>Cross-functional design collaboration with Becca (Upsells PM) on the modifier system surfaced edge cases early.</li>
                </ul>

                <SectionHeading level={3}>Would change</SectionHeading>
                <ul className="list-disc pl-5 space-y-2 mb-8">
                  <li>I&#39;d push harder to include staff notifications in the MVP. Post-launch feedback from HOMA showed hotels needed more immediate alerts — their F&amp;B team had to keep checking for new messages.</li>
                  <li>Item remarks discoverability could have been stronger. HOMA&#39;s feedback was specific: &ldquo;It is not clear from the main menu screen that guests need to tap into the item to leave a remark.&rdquo; I should have caught this in prototype testing.</li>
                  <li>The AI menu parsing experiment (Claude&#39;s API) was well-received but stayed as a prototype. I&#39;d push to get it into the roadmap earlier since manual menu setup is the biggest onboarding friction.</li>
                </ul>

                <SectionHeading level={3}>What I learned</SectionHeading>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Designing for two distinct audiences in one product (guests ordering + staff fulfilling) requires thinking about the system, not just the screens.</li>
                  <li>Shipping without POS integration was the right call — it let us validate demand months earlier than waiting for integrations.</li>
                  <li>The prototype-to-product pipeline works. Building in code created a shared artifact that aligned engineering, product, sales, and marketing around a tangible vision.</li>
                </ul>
              </TwoCol.Left>
            </TwoCol>
          </ExpandableSection>
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
      </article>
    </>
  );
}

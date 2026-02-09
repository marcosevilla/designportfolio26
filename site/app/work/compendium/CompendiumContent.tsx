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
import InlineTOC from "@/components/case-study/InlineTOC";
import { typescale } from "@/lib/typography";

const STATS = [
  { value: "$1M+", label: "Cumulative CARR (Dec '25)" },
  { value: "82%", label: "Custom section adoption" },
  { value: "175K", label: "Monthly active guest users" },
  { value: "100%", label: "Design ownership" },
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

export default function CompendiumContent() {
  return (
    <>
      <ProgressBar />
      <SidebarTOCBridge items={TOC_ITEMS} />
      <TOCObserver sectionIds={TOC_ITEMS.map(i => i.id)} />

      <article className="text-[var(--color-fg-secondary)]" style={typescale.body}>
        {/* Hero */}
        <CaseStudyHero
          title="Digital Compendium"
          subtitle="A digital guest hub that replaces printed hotel compendiums — a CMS vertical enough for hospitality but flexible enough to scale across thousands of properties."
          gradient={["#2563EB", "#1D4ED8"]}
          heroImageDescription="Hero shot — Compendium builder interface alongside guest mobile experience"
        />

        <div className="lg:flex lg:gap-8 max-w-[960px] mx-auto px-4 sm:px-8 lg:px-6">
        <InlineTOC />
        <div className="flex-1 min-w-0">
        {/* Quick Stats */}
        <FadeIn>
          <QuickStats items={STATS} />
        </FadeIn>

        {/* Content */}
        <div className="mt-8">
          <div>
            {/* ── The Problem ── */}
            <FadeIn as="section" className="scroll-mt-24 pt-24">
              <div id="problem" className="scroll-mt-24" />
              <h2
                className="text-[var(--color-fg)] mb-3 tracking-tight"
                style={typescale.h2}
              >
                The Problem
              </h2>
              <p className="mb-5">
                Hotels have relied on printed compendiums — booklets in guest rooms listing amenities, restaurant menus, Wi-Fi info, and local attractions — for decades. These are expensive to produce, impossible to update quickly, deteriorate with use, and require sanitization. Competitors like Duve, Hudini, and LoungeUp had already gone digital, and several offered features Canary didn&apos;t match: in-room dining, activity booking, and analytics.
              </p>
              <p>
                Canary needed a digital compendium that did more than replicate a PDF. The product had to become the guest&apos;s home screen during their stay — a hub connecting reservation info, messaging, upsells, tipping, and eventually food ordering. Without it, Canary was selling point solutions while competitors sold a guest experience. The initiative target: increase average revenue per room per month from $5.10 to $10.
              </p>
            </FadeIn>

            {/* ── The Solution ── */}
            <FadeIn as="section" className="scroll-mt-24 pt-32">
              <div id="solution" className="scroll-mt-24" />
              <h2
                className="text-[var(--color-fg)] mb-3 tracking-tight"
                style={typescale.h2}
              >
                The Solution
              </h2>
              <p className="mb-8">
                I designed the full Compendium platform end-to-end — a hotel-facing CMS builder for managing content, and a guest-facing mobile web experience for browsing it — and then extended it through six major phases over 18 months, from MVP through enterprise-wide release.
              </p>

              <FadeIn>
                <ImagePlaceholder
                  description="Split view of CMS builder (left) and guest mobile experience (right)"
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
                    1. Builder-first architecture
                  </h4>
                  <p className="mb-5">
                    I designed the CMS as a structured builder rather than a free-form editor. Hotels configure sections (restaurants, amenities, custom content) through a guided interface with real-time preview. This was deliberate — hotel staff aren&apos;t web designers, and a &ldquo;builder&rdquo; metaphor with clear sections and drag-to-reorder maps directly to how they think about their property&apos;s offerings. The patterns would be reused across registration cards, auth forms, and other editors.
                  </p>
                  <ImagePlaceholder description="CMS builder interface with section management" aspectRatio="16/9" />
                </FadeIn>

                <FadeIn>
                  <h4 className="font-medium text-[var(--color-fg)] mb-3 tracking-tight" style={typescale.h4}>
                    2. Custom sections as the extensibility layer
                  </h4>
                  <p className="mb-5">
                    Rather than hard-coding every content type, I designed a custom sections system that lets hotels create their own categories with items, images, descriptions, and call-to-action buttons. This single pattern — adopted by 82% of active properties — solved everything from &ldquo;spa services&rdquo; to &ldquo;local attractions&rdquo; to &ldquo;hotel policies&rdquo; without requiring product-specific development for each use case.
                  </p>
                  <ImagePlaceholder description="Custom section examples across different hotel types" aspectRatio="16/9" />
                </FadeIn>

                <FadeIn>
                  <h4 className="font-medium text-[var(--color-fg)] mb-3 tracking-tight" style={typescale.h4}>
                    3. Compendium as the guest journey endpoint
                  </h4>
                  <p className="mb-5">
                    I positioned Compendium as where every guest touchpoint leads. Check-in completes? You land on Compendium. Arrival SMS? Links to Compendium. QR code in the lobby? Compendium. This wasn&apos;t just navigation — it was the product strategy. By making Compendium the hub, every other Canary product (messaging, upsells, tipping, food ordering) gets organic distribution.
                  </p>
                  <ImagePlaceholder description="Guest journey map showing Compendium as the central hub" aspectRatio="16/9" />
                </FadeIn>

                <FadeIn>
                  <h4 className="font-medium text-[var(--color-fg)] mb-3 tracking-tight" style={typescale.h4}>
                    4. Compendium Lite as a freemium growth lever
                  </h4>
                  <p className="mb-5">
                    When we needed to drive cross-sell and deepen the Wyndham relationship, I designed Compendium Lite — a constrained version (2 sections, 4 items per section) that any Canary customer could activate for free. The design challenge was creating clear upgrade triggers without making the free version feel broken. I placed contextual &ldquo;Request Upgrade&rdquo; prompts at natural friction points — when a hotel tries to add a third section or fifth item — so the limitation feels like an invitation, not a wall.
                  </p>
                  <ImagePlaceholder description="Compendium Lite showing section limits and upgrade prompt" aspectRatio="16/9" />
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
                  <li>Full design QA audit of the guest experience in preparation for Best Western conference — documented all bugs and filed 6+ engineering tickets</li>
                  <li>Competitive analysis of digital compendium solutions (Duve, Hudini, LoungeUp, STAY, HiJiffy) — mapped feature gaps across amenity display, concierge, in-room dining, and analytics</li>
                  <li>Design jams with engineering on data model decisions</li>
                  <li>Live feedback from COMO property tours, Omni pilot hotels, Best Western rollout, Eurostars (270 properties), and Wyndham</li>
                  <li>COMO brand requirements workshops — outlined UI requirements including custom fonts, gradient treatments, and brand-specific styling</li>
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
                      <strong className="text-[var(--color-fg)]">1. Hotels think in categories, not pages.</strong> They organize their property as restaurants, amenities, policies, local attractions — not as a generic page hierarchy.
                    </p>
                    <p className="text-[15px] text-[var(--color-fg-tertiary)]">
                      → I designed the builder around typed sections rather than a generic page editor.
                    </p>
                  </div>

                  <div>
                    <p className="mb-2">
                      <strong className="text-[var(--color-fg)]">2. Content quality varies wildly.</strong> Some hotels have professional photography, others have phone photos.
                    </p>
                    <p className="text-[15px] text-[var(--color-fg-tertiary)]">
                      → I designed flexible image handling: bulk upload, image galleries, and layouts that look good with both high- and low-quality imagery. The bulk upload design alone went through 19 iterations.
                    </p>
                  </div>

                  <div>
                    <p className="mb-2">
                      <strong className="text-[var(--color-fg)]">3. Enterprise chains have different needs than boutique hotels.</strong> Brand consistency vs. creative freedom.
                    </p>
                    <p className="text-[15px] text-[var(--color-fg-tertiary)]">
                      → I designed the system to support both: brand-level defaults that individual properties can customize, plus branded QR code templates that maintain corporate identity.
                    </p>
                  </div>

                  <div>
                    <p className="mb-2">
                      <strong className="text-[var(--color-fg)]">4. The visual design was selling the product.</strong> Demo prospects consistently commented on the polish.
                    </p>
                    <p className="text-[15px] text-[var(--color-fg-tertiary)]">
                      → This validated the builder-first approach: even without advanced features, the polished guest experience was closing deals.
                    </p>
                  </div>
                </div>

                <FadeIn className="mt-8">
                  <PullQuote
                    quote="Lots of folks commented about how much they liked the DC: 'It's sleek, this is exactly what I'm looking for.'"
                    attribution="Sales demo review (10 demos analyzed)"
                  />
                </FadeIn>
              </ExpandableSection>
            </FadeIn>

            {/* ── Design Process ── */}
            <FadeIn className="pt-32">
              <ExpandableSection title="Design Process" id="process">
                <p className="mb-8">
                  <strong className="text-[var(--color-fg)]">Approach:</strong> Build the foundation right — a structured, extensible CMS that could evolve from informational hub to interactive guest platform — then layer on capabilities phase by phase.
                </p>

                <ImagePlaceholder description="Figma file evolution showing phases of Compendium design" aspectRatio="16/9" />

                <div className="mt-10 space-y-8">
                  <div>
                    <h4 className="font-medium text-[var(--color-fg)] mb-2 tracking-tight" style={typescale.h4}>
                      Early prototyping (Jan–Apr 2024)
                    </h4>
                    <p>
                      Before the builder MVP, I built a CMS Compendium prototype in Figma with interactive previews — sticky mobile previews that scrolled with the builder, clickable navigation across Wi-Fi, service requests, restaurants, and room upgrades. The prototypes were literally closing deals before the product existed.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-medium text-[var(--color-fg)] mb-2 tracking-tight" style={typescale.h4}>
                      Builder MVP (May–Aug 2024)
                    </h4>
                    <p>
                      Designed the entire CMS builder from scratch — section management, restaurant/amenity editors, Wi-Fi and reservation info settings, property info, QR code generation, translation picker for multi-language support, photo management, and hours configuration. The engineering design doc I collaborated on defined 27 implementation tickets.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-medium text-[var(--color-fg)] mb-2 tracking-tight" style={typescale.h4}>
                      Guest UI Phase 1 & 2 (Jul–Aug 2024)
                    </h4>
                    <p>
                      Designed the guest-facing mobile web experience — the welcome screen, section navigation, restaurant and amenity detail views, reservation info display, messaging integration, and Wi-Fi info. The guest experience needed to feel like a consumer app, not hotel software.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-medium text-[var(--color-fg)] mb-2 tracking-tight" style={typescale.h4}>
                      Custom Sections (Nov 2024–Jun 2025)
                    </h4>
                    <p>
                      I designed the custom sections system that became the product&apos;s most-adopted feature (82%). Walked through the creation flow with stakeholders, raised design questions about section deletion logic and templates, and ran a bug bash before rollout.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-medium text-[var(--color-fg)] mb-2 tracking-tight" style={typescale.h4}>
                      Compendium Lite (Apr–Jun 2025)
                    </h4>
                    <p>
                      Designed the freemium tier — constrained section/item limits, contextual upgrade prompts, &ldquo;Request Upgrade&rdquo; email flow to sales. 22 iterations to nail the balance between useful free product and clear paid value proposition.
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
                  <li><strong className="text-[var(--color-fg)]">No native app</strong> — Everything as mobile web via QR code, SMS link, or Wi-Fi portal redirect</li>
                  <li><strong className="text-[var(--color-fg)]">Multi-language from day one</strong> — Translation management built into every content field</li>
                  <li><strong className="text-[var(--color-fg)]">Varied technical sophistication</strong> — Hotel staff range from tech-savvy to barely comfortable with email</li>
                  <li><strong className="text-[var(--color-fg)]">Platform foundation</strong> — Every pattern needed to be reusable across Canary&apos;s product suite</li>
                </ul>

                <div className="mt-10">
                  <ImagePlaceholder description="Before/after — printed compendium booklet vs. digital Compendium on phone" aspectRatio="16/9" />
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
                  <li>Cumulative CARR surpassed $1M by December 2025 — &ldquo;a 25% increase in the pod&apos;s CARR in a single month&rdquo;</li>
                  <li>CARR booked: $81.5K in Q4 2025 alone (+400% YoY)</li>
                  <li>ARR activated: $55.3K in Q4 2025 (+400% YoY), with 70% driven by Best Western rollout</li>
                  <li>Zero gross churn — no Compendium customers churned in the tracked period</li>
                  <li>F&B Mobile Ordering launched as the first interactive module on the Compendium platform</li>
                </ul>

                <FadeIn>
                  <PullQuote
                    quote="Huge congrats to the entire team for bringing a brand new SKU to market from scratch... This is now the second SKU launched by just this pod in 2024. Most companies are lucky to launch 2 SKUs across their entire company in a year."
                    attribution="Aman, CEO (launch announcement)"
                  />
                </FadeIn>

                <h3
                  className="font-medium text-[var(--color-fg)] mt-10 mb-4 tracking-tight"
                  style={typescale.h3}
                >
                  User impact
                </h3>
                <ul className="list-disc pl-5 space-y-2 mb-8">
                  <li>175K monthly active guest users with 2.5 min average session time</li>
                  <li>Custom Sections adopted by 82% of active properties (+10 percentage points for two consecutive months)</li>
                  <li>Custom CTAs adopted by 72% of active properties</li>
                  <li>Average 8.7 items per property — hotels are actively building out their content</li>
                </ul>

                <FadeIn>
                  <PullQuote
                    quote="We love that you have added the ability to add sections... the customers love it."
                    attribution="Hotel customer feedback"
                  />
                </FadeIn>

                <h3
                  className="font-medium text-[var(--color-fg)] mt-10 mb-4 tracking-tight"
                  style={typescale.h3}
                >
                  Enterprise traction
                </h3>
                <ul className="list-disc pl-5 space-y-2 mb-6">
                  <li><strong className="text-[var(--color-fg)]">Best Western:</strong> Largest rollout, drove 70% of Q4 ARR activations; one property displayed Compendium QR codes on all guest room TVs</li>
                  <li><strong className="text-[var(--color-fg)]">Wyndham:</strong> Compendium Lite via wifi captive portal, scaling to 400+ sites; $18M contract that includes Compendium</li>
                  <li><strong className="text-[var(--color-fg)]">COMO Hotels:</strong> Multi-property deployment across Asia-Pacific</li>
                  <li><strong className="text-[var(--color-fg)]">Omni Hotels:</strong> $200K Compendium deal closed, now exploring geofenced QR codes and loyalty integration</li>
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
                  <li>Designing the builder as a structured, section-based CMS rather than a free-form page editor was the right call. It maps to how hotel staff think and ensures content quality without requiring design skills.</li>
                  <li>The platform architecture paid off. Designing Compendium as an extensible hub meant that when F&B Ordering launched 12 months later, it slotted naturally into the guest experience without redesigning the shell.</li>
                  <li>Full design QA before the Best Western conference caught issues that would have been visible to hundreds of properties. Taking ownership of quality was critical for a product launching at enterprise scale.</li>
                  <li>Close collaboration with engineering on the data model meant the frontend architecture matched the design architecture. Decisions made in that initial design doc carried through 18 months of development.</li>
                </ul>

                <h3
                  className="font-medium text-[var(--color-fg)] mb-4 tracking-tight"
                  style={typescale.h3}
                >
                  Would change
                </h3>
                <ul className="list-disc pl-5 space-y-2 mb-8">
                  <li>I&apos;d invest more in analytics from the start. When a property asked if they could check how the compendium was being used, we didn&apos;t have a good answer.</li>
                  <li>I should have owned the discovery more independently — running conversations with hotel staff about how they set up and manage their compendium content, not just observing on PM-led calls.</li>
                  <li>I should have pushed harder on &ldquo;art of the possible&rdquo; concepts. For a platform product like Compendium, having a 6–12 month vision mockup would have helped align the team and sell the roadmap internally.</li>
                </ul>

                <h3
                  className="font-medium text-[var(--color-fg)] mb-4 tracking-tight"
                  style={typescale.h3}
                >
                  What I learned
                </h3>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Platform design requires thinking in layers. The guest experience, CMS builder, data model, and API are all part of the design — not just the screens.</li>
                  <li>Enterprise products need polish at a different standard. When Best Western is rolling out to hundreds of properties, every pixel matters.</li>
                  <li>The freemium model (Compendium Lite) is a design problem, not just a business decision. Where you place constraints, how you communicate limits, and what triggers the upgrade conversation are all UX decisions.</li>
                </ul>
              </ExpandableSection>
            </FadeIn>

            {/* ── Visual Gallery ── */}
            <FadeIn as="section" className="scroll-mt-24 pt-32">
              <div id="gallery" className="scroll-mt-24" />
              <h2
                className="text-[var(--color-fg)] mb-3 tracking-tight"
                style={typescale.h2}
              >
                The Work
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <FadeIn><ImagePlaceholder description="CMS builder main page with section management" aspectRatio="16/9" /></FadeIn>
                <FadeIn delay={0.1}><ImagePlaceholder description="Restaurant/amenity editor with image gallery" aspectRatio="16/9" /></FadeIn>
                <FadeIn><ImagePlaceholder description="Guest welcome screen on mobile" aspectRatio="3/4" /></FadeIn>
                <FadeIn delay={0.1}><ImagePlaceholder description="Guest section browsing on mobile" aspectRatio="3/4" /></FadeIn>
                <FadeIn><ImagePlaceholder description="QR code template selector" aspectRatio="16/9" /></FadeIn>
                <FadeIn delay={0.1}><ImagePlaceholder description="Bulk image upload flow" aspectRatio="16/9" /></FadeIn>
                <FadeIn><ImagePlaceholder description="Translation picker for multi-language content" aspectRatio="16/9" /></FadeIn>
                <FadeIn delay={0.1}><ImagePlaceholder description="Restaurant detail with photos on mobile" aspectRatio="3/4" /></FadeIn>
              </div>
            </FadeIn>

            {/* ── Next Project ── */}
            <FadeIn>
              <NextProject
                title="Upsells Forms"
                subtitle="A configurable form system for hotel upsell purchases"
                href="/work/upsells"
              />
            </FadeIn>
          </div>
        </div>
        </div>
        </div>
      </article>
    </>
  );
}

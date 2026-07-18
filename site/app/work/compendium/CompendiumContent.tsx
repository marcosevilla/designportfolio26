"use client";

import AutoplayVideo from "@/components/AutoplayVideo";
import QuickStats from "@/components/case-study/QuickStats";
import ExpandableSection from "@/components/case-study/ExpandableSection";
import NextProject from "@/components/case-study/NextProject";
import PullQuote from "@/components/case-study/PullQuote";
import FadeIn from "@/components/case-study/FadeIn";
import SectionHeading from "@/components/case-study/SectionHeading";
import CaseStudyHeroImage from "@/components/case-study/CaseStudyHeroImage";
import CaseStudyShell from "@/components/case-study/CaseStudyShell";
import MetaRail from "@/components/case-study/MetaRail";
import Grid, { Col } from "@/components/layout/Grid";
import { typescale } from "@/lib/typography";

const META = [
  { label: "Year", values: ["2024–2025"] },
  { label: "Role", values: ["Product designer", "100% design ownership"] },
  { label: "Scope", values: ["CMS builder", "Guest experience", "Compendium Lite"] },
];

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
];

export default function CompendiumContent() {
  return (
    <CaseStudyShell tocItems={TOC_ITEMS}>
        {/* Title + Subtitle with metadata rail (intro-rail) */}
        <Grid preset="intro-rail">
          <Col>
            <h1 className="text-(--color-fg)" style={{ ...typescale.display, fontFamily: "var(--font-baskerville), Georgia, serif", fontWeight: 700, letterSpacing: "0.02em" }}>Digital Compendium</h1>
            <p className="mt-3 text-(--color-fg-secondary)" style={{ fontFamily: "var(--font-baskerville), Georgia, serif", fontStyle: "italic", fontWeight: 400, fontSize: 18, lineHeight: "26px", letterSpacing: "0.02em" }}>Hotels print their guest guides. Guests never read them. I spent 18 months designing the digital replacement — now the hub 175,000 guests open every month, and a $1M+ product line for Canary.</p>
          </Col>
          <Col className="mt-8 lg:mt-2">
            <MetaRail items={META} />
          </Col>
        </Grid>

        {/* Hero Image */}
        <CaseStudyHeroImage description="Digital Compendium — guest hub overview" />

        {/* Quick Stats */}
        <FadeIn>
          <QuickStats items={STATS} />
        </FadeIn>

        {/* ── The Problem ── */}
        <FadeIn as="section" className="scroll-mt-24 pt-24">
          <Grid preset="prose">
            <Col>
              <SectionHeading id="problem">The Problem</SectionHeading>
              <p className="mb-5">
                Hotels have relied on printed compendiums — booklets in guest rooms listing amenities, restaurant menus, Wi-Fi info, and local attractions — for decades. These are expensive to produce, impossible to update quickly, deteriorate with use, and require sanitization. Competitors like Duve, Hudini, and LoungeUp had already gone digital, and several offered features Canary didn&apos;t match: in-room dining, activity booking, and analytics.
              </p>
              <p>
                Canary needed a digital compendium that did more than replicate a PDF. The product had to become the guest&apos;s home screen during their stay — a hub connecting reservation info, messaging, upsells, tipping, and eventually food ordering. Without it, Canary was selling point solutions while competitors sold a guest experience. The initiative target: increase average revenue per room per month from $5.10 to $10.
              </p>
            </Col>
          </Grid>
        </FadeIn>

        {/* ── The Solution ── */}
        <FadeIn as="section" className="scroll-mt-24 pt-32">
          <Grid preset="prose">
            <Col>
              <SectionHeading id="solution">The Solution</SectionHeading>
              <p className="mb-8">
                I designed the full Compendium platform end-to-end — a hotel-facing CMS builder for managing content, and a guest-facing mobile web experience for browsing it — then kept extending it for 18 months, from MVP through enterprise-wide release.
              </p>
            </Col>
          </Grid>

          {/* Guest dashboard video — the one real asset on the page. Same
              zoom-crop the homepage card uses so the recording's baked navy
              backdrop doesn't fight the color themes. */}
          <Grid preset="prose-wide" className="mt-4">
            <Col>
              <div
                className="w-full overflow-hidden rounded-[10px] border border-border bg-surface-raised"
                style={{ aspectRatio: "16 / 10" }}
              >
                <AutoplayVideo
                  src="/videos/guest-experience-dash.mp4"
                  className="block h-full w-full object-cover"
                  style={{ transform: "scale(1.32)" }}
                />
              </div>
              <p className="mt-3 text-[13px] text-(--color-fg-tertiary)">
                The guest experience — sections, dining, and property info configured by the hotel in the builder.
              </p>
            </Col>
          </Grid>

          {/* Key decisions */}
          <Grid preset="prose" className="mt-10">
            <Col>
              <SectionHeading level={3}>Key Design Decisions</SectionHeading>
            </Col>
          </Grid>

          {/* 2×2 at desktop — the four decisions read as a composed spread */}
          <Grid className="mt-6 gap-y-14">
            <Col lg="1-6">
            <FadeIn>
              <SectionHeading level={4}>1. Builder-first architecture</SectionHeading>
              <p className="mb-5">
                I designed the CMS as a structured builder rather than a free-form editor. Hotels configure sections (restaurants, amenities, custom content) through a guided interface with real-time preview. This was deliberate — hotel staff aren&apos;t web designers, and a &ldquo;builder&rdquo; metaphor with clear sections and drag-to-reorder maps directly to how they think about their property&apos;s offerings. The patterns would be reused across registration cards, auth forms, and other editors.
              </p>
            </FadeIn>
            </Col>

            <Col lg="7-12">
            <FadeIn>
              <SectionHeading level={4}>2. Custom sections as the extensibility layer</SectionHeading>
              <p className="mb-5">
                Rather than hard-coding every content type, I designed custom sections — hotels create their own categories with items, images, descriptions, and call-to-action buttons. One pattern now covers spa services, local attractions, transportation, house policies, whatever a property needs, with no product work per use case. It became the most-adopted feature in the product: 82% of active properties use it.
              </p>
            </FadeIn>
            </Col>

            <Col lg="1-6">
            <FadeIn>
              <SectionHeading level={4}>3. Compendium as the guest journey endpoint</SectionHeading>
              <p className="mb-5">
                Every guest touchpoint leads here. Check-in completes? You land on Compendium. Arrival SMS? Links to Compendium. QR code in the lobby? Compendium. That routing is the product strategy: with Compendium as the hub, every other Canary product — messaging, upsells, tipping, food ordering — gets organic distribution to guests who are already looking at their phone.
              </p>
            </FadeIn>
            </Col>

            <Col lg="7-12">
            <FadeIn>
              <SectionHeading level={4}>4. Compendium Lite as a freemium growth lever</SectionHeading>
              <p className="mb-5">
                When we needed to drive cross-sell and deepen the Wyndham relationship, I designed Compendium Lite — a free tier capped at 2 sections and 4 items each. The hard part: where do the limits live so the free product still feels useful? I put the &ldquo;Request Upgrade&rdquo; prompts at the exact moments a hotel outgrows the cap — trying to add a third section, a fifth item — because that&apos;s when they&apos;re already wanting more. Getting that balance right took 22 iterations.
              </p>
            </FadeIn>
            </Col>
          </Grid>
        </FadeIn>

        {/* ── Research & Discovery ── */}
        <FadeIn className="pt-32">
          <Grid preset="prose">
            <Col>
          <ExpandableSection title="Research & Discovery" id="research">
                <SectionHeading level={3}>Research methods</SectionHeading>
                <ul className="list-disc pl-5 space-y-2 mb-8">
                  <li>Full design QA audit of the guest experience in preparation for Best Western conference — documented all bugs and filed 6+ engineering tickets</li>
                  <li>Competitive analysis of digital compendium solutions (Duve, Hudini, LoungeUp, STAY, HiJiffy) — mapped feature gaps across amenity display, concierge, in-room dining, and analytics</li>
                  <li>Design jams with engineering on data model decisions</li>
                  <li>Live feedback from COMO property tours, Omni pilot hotels, Best Western rollout, Eurostars (270 properties), and Wyndham</li>
                  <li>COMO brand requirements workshops — outlined UI requirements including custom fonts, gradient treatments, and brand-specific styling</li>
                </ul>

                <SectionHeading level={3}>Key insights</SectionHeading>
                <div className="space-y-5">
                  <p>
                    <strong className="text-(--color-fg)">Hotels think in categories, not pages.</strong> Ask a front-desk manager about their property and you get restaurants, amenities, policies, local attractions — never &ldquo;pages.&rdquo; So the builder is organized around typed sections instead of a generic page editor. Staff recognized the model immediately.
                  </p>
                  <p>
                    <strong className="text-(--color-fg)">Content quality varies wildly between properties.</strong> Some hotels have professional photography; plenty have phone photos taken in bad hallway lighting. The image handling had to flatter both — bulk upload without a forced crop step, galleries, layouts that survive mediocre photos. The bulk upload flow alone took 19 rounds to get right.
                  </p>
                  <p>
                    <strong className="text-(--color-fg)">Chains and boutiques pull in opposite directions.</strong> Best Western wants brand consistency across hundreds of properties; a boutique wants its property to feel like nowhere else. Brand-level defaults that individual properties can override served both, along with branded QR templates for the chains.
                  </p>
                  <p>
                    <strong className="text-(--color-fg)">The polish itself was selling.</strong> Before we had feature parity with competitors, prospects were reacting to how the guest experience looked and felt in demos. Craft was doing sales work — which validated putting the design bar first.
                  </p>
                </div>

            <FadeIn className="mt-8">
              <PullQuote
                quote="It's sleek — this is exactly what I'm looking for."
                attribution="Prospect feedback, recurring across 10 sales demos"
              />
            </FadeIn>
          </ExpandableSection>
            </Col>
          </Grid>
        </FadeIn>

        {/* ── Design Process ── */}
        <FadeIn className="pt-32">
          <Grid preset="prose">
            <Col>
          <ExpandableSection title="Design Process" id="process">
                <div className="space-y-8">
                  <div>
                    <SectionHeading level={4}>The prototype sold the product</SectionHeading>
                    <p>
                      Before any of it was built, I made a Figma prototype of the whole idea — a CMS builder with a sticky mobile preview that scrolled alongside it, clickable through Wi-Fi, service requests, restaurants, and room upgrades. Sales started showing it to prospects. Deals closed on it. Months later an engineer asked, half-joking, whether we&apos;d sold Compendium entirely over Figma prototypes — and the honest answer was: at first, yes. That set the bar for the real thing.
                    </p>
                  </div>

                  <div>
                    <SectionHeading level={4}>Building it for real</SectionHeading>
                    <p>
                      The builder MVP was the whole CMS designed from scratch — section management, restaurant and amenity editors, photo management, hours, QR codes, and a translation picker, with the data model worked out alongside engineering (the design doc we wrote together broke down into 27 implementation tickets). The guest side had the opposite brief: feel like a consumer app, not hotel software. Then, weeks before Best Western would put the product in front of hundreds of properties, I ran a full QA audit of the guest experience myself — documented every rough edge and filed the bugs. Enterprise scale means nobody&apos;s there to explain away a misaligned label.
                    </p>
                  </div>

                  <div>
                    <SectionHeading level={4}>Extending the platform</SectionHeading>
                    <p>
                      The second year was proving the architecture. Custom sections shipped and became the most-used feature in the product. Carousels and groupings layered onto the same pattern without new plumbing. Compendium Lite turned the platform into a growth lever. And bulk image upload — unglamorous, 19 iterations — removed the single biggest friction point in hotel onboarding by killing the mandatory crop step. None of these required rearchitecting the shell, which was the point of the shell.
                    </p>
                  </div>
                </div>

                <SectionHeading level={3}>Constraints I designed around</SectionHeading>
                <ul className="list-disc pl-5 space-y-2">
                  <li><strong className="text-(--color-fg)">No native app</strong> — Everything as mobile web via QR code, SMS link, or Wi-Fi portal redirect</li>
                  <li><strong className="text-(--color-fg)">Multi-language from day one</strong> — Translation management built into every content field</li>
                  <li><strong className="text-(--color-fg)">Varied technical sophistication</strong> — Hotel staff range from tech-savvy to barely comfortable with email</li>
                  <li><strong className="text-(--color-fg)">Platform foundation</strong> — Every pattern needed to be reusable across Canary&apos;s product suite</li>
                </ul>
          </ExpandableSection>
            </Col>
          </Grid>
        </FadeIn>

        {/* ── Impact & Results ── */}
        <FadeIn className="pt-32">
          <Grid preset="prose">
            <Col>
          <ExpandableSection title="Impact & Results" id="impact">
                <SectionHeading level={3}>A new product line</SectionHeading>
                <p className="mb-4">
                  Compendium passed <strong className="text-(--color-fg)">$1M in cumulative CARR</strong> by December 2025 — a brand-new SKU designed from zero, with zero gross churn in the tracked period. And the platform bet paid out: F&amp;B Mobile Ordering launched as the first interactive module inside the same guest experience, no shell redesign required.
                </p>

            <FadeIn>
              <PullQuote
                quote="Huge congrats to the entire team for bringing a brand new SKU to market from scratch... This is now the second SKU launched by just this pod in 2024. Most companies are lucky to launch 2 SKUs across their entire company in a year."
                attribution="Aman, CEO (launch announcement)"
              />
            </FadeIn>

                <SectionHeading level={3}>Guests and hotels actually use it</SectionHeading>
                <p className="mb-4">
                  <strong className="text-(--color-fg)">175K guests</strong> open Compendium every month, averaging 2.5 minutes per session. On the hotel side, <strong className="text-(--color-fg)">82% of active properties</strong> have built custom sections and 72% use custom CTAs — averaging 8.7 items of their own content per property. Hotels aren&apos;t just enabling the product; they&apos;re building on it.
                </p>

            <FadeIn>
              <PullQuote
                quote="It's like having your own digital concierge."
                attribution="Live hotel customer"
              />
            </FadeIn>

                <SectionHeading level={3}>Enterprise traction</SectionHeading>
                <ul className="list-disc pl-5 space-y-2 mb-6">
                  <li><strong className="text-(--color-fg)">Best Western:</strong> The largest rollout, driving the majority of Q4 activations; one property put Compendium QR codes on every guest room TV</li>
                  <li><strong className="text-(--color-fg)">Wyndham:</strong> Compendium Lite delivered through their Wi-Fi captive portal, scaling to 400+ sites</li>
                  <li><strong className="text-(--color-fg)">COMO Hotels:</strong> Multi-property deployment across Asia-Pacific</li>
                  <li><strong className="text-(--color-fg)">Omni Hotels:</strong> Pilot expanded to a full deal, now exploring geofenced QR codes and loyalty integration</li>
                </ul>
          </ExpandableSection>
            </Col>
          </Grid>
        </FadeIn>

        {/* ── Reflection ── */}
        <FadeIn className="pt-32">
          <Grid preset="prose">
            <Col>
          <ExpandableSection title="Reflection" id="reflection">
                <SectionHeading level={3}>Worked well</SectionHeading>
                <ul className="list-disc pl-5 space-y-2 mb-8">
                  <li>Designing the builder as a structured, section-based CMS rather than a free-form page editor was the right call. It maps to how hotel staff think and ensures content quality without requiring design skills.</li>
                  <li>The platform architecture paid off. Designing Compendium as an extensible hub meant that when F&B Ordering launched 12 months later, it slotted naturally into the guest experience without redesigning the shell.</li>
                  <li>Full design QA before the Best Western conference caught issues that would have been visible to hundreds of properties. Taking ownership of quality was critical for a product launching at enterprise scale.</li>
                  <li>Close collaboration with engineering on the data model meant the frontend architecture matched the design architecture. Decisions made in that initial design doc carried through 18 months of development.</li>
                </ul>

                <SectionHeading level={3}>The customer we lost</SectionHeading>
                <p className="mb-8">
                  COMO deployed Compendium across their Asia-Pacific properties. I ran their brand workshops, designed around their custom fonts and gradients, and property staff genuinely liked the product. It didn&apos;t matter: their decision-maker saw a native-app gap against competitors, called us &ldquo;behind the curve,&rdquo; and in early 2026 COMO started evaluating a competitor. Two lessons I&apos;m keeping. Staff sentiment isn&apos;t buyer conviction — the people who liked it weren&apos;t the person deciding. And when the retention conversation came, we had no usage data to argue with, because analytics kept losing the prioritization fight. Polish doesn&apos;t beat a roadmap gap.
                </p>

                <SectionHeading level={3}>Would change</SectionHeading>
                <ul className="list-disc pl-5 space-y-2 mb-8">
                  <li>Analytics from day one — see above. A property once asked if they could check how their compendium was being used, and we didn&apos;t have a good answer for them either.</li>
                  <li>Owning discovery instead of observing it. I joined 20+ customer calls but they were PM-led; I should have been running my own conversations with the hotel staff who actually maintain this content.</li>
                  <li>Pushing further ahead of the roadmap. For a platform product, a 6–12 month vision mockup aligns a team faster than any spec — I made one eventually (the North Star brainstorm), but a year later than I should have.</li>
                </ul>

                <SectionHeading level={3}>What I learned</SectionHeading>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Platform design requires thinking in layers. The guest experience, CMS builder, data model, and API are all part of the design — not just the screens.</li>
                  <li>Enterprise products need polish at a different standard. When Best Western is rolling out to hundreds of properties, every pixel matters.</li>
                  <li>The freemium model (Compendium Lite) is a design problem, not just a business decision. Where you place constraints, how you communicate limits, and what triggers the upgrade conversation are all UX decisions.</li>
                </ul>
          </ExpandableSection>
            </Col>
          </Grid>
        </FadeIn>

        {/* Visual gallery removed with the placeholder cleanup — restore
            the section (+ its "gallery" TOC entry) once real images land. */}

        {/* ── Next Project ── */}
        <FadeIn>
          <NextProject
            title="Upsells Forms"
            subtitle="A configurable form system for hotel upsell purchases"
            href="/work/upsells"
          />
        </FadeIn>
    </CaseStudyShell>
  );
}

"use client";

import ExpandableSection from "@/components/case-study/ExpandableSection";
import ObjectFlowDiagram from "@/components/fb-showcase/ObjectFlowDiagram";
import FnbCartSpecimen from "@/components/fb-showcase/FnbCartSpecimen";
import OrderDashboardSpecimen from "@/components/fb-showcase/OrderDashboardSpecimen";
import ItemLibrarySpecimen from "@/components/fb-showcase/ItemLibrarySpecimen";
import FadeIn from "@/components/case-study/FadeIn";
import NextProject from "@/components/case-study/NextProject";
import SectionHeading from "@/components/case-study/SectionHeading";
import CaseStudyShell from "@/components/case-study/CaseStudyShell";
import MetaRail from "@/components/case-study/MetaRail";
import Grid, { Col } from "@/components/layout/Grid";
import { typescale } from "@/lib/typography";

const TOC_ITEMS = [
  { id: "context", label: "Context" },
  { id: "approach", label: "Approach" },
  { id: "research", label: "Research" },
  { id: "impact", label: "Impact" },
  { id: "reflection", label: "Reflection" },
];

// Mirrors ObjectFlowDiagram's panel fill (3% F&B accent over card-bg)
// so every dashboard visual on the page shares one surface color.
const FB_PANEL_BG = "color-mix(in srgb, #EF5A3C 3%, var(--color-card-bg))";

const META = [
  { label: "Year", values: ["2025–2026"] },
  {
    label: "Role",
    values: ["Sole designer"],
    info: "Built with Nico Garnier (PM) and engineers Joanne Chevalier, Andrea Bradshaw & Luciano Guasco",
  },
  { label: "Scope", values: ["Guest ordering", "Menu CMS", "Staff dashboard"] },
];

export default function FBOrderingContent() {
  return (
    <CaseStudyShell tocItems={TOC_ITEMS}>
        {/* Full-canvas staff-dashboard shot leads the page, above the
            title (Marco's 2026-07-15 feedback pass). */}
        <FadeIn>
          <Grid className="mb-20">
            {/* Two columns wider than the content band on each side —
                the dashboard shot breaks out of the text measure. */}
            <Col md="1-12" lg="2-11">
              {/* The export bakes its own rounded frame + shadow — no CSS
                  radius, outline, or shadow on top. */}
              <img
                src="/images/fb-ordering/fb-ordering-dashboard.webp"
                alt="Staff order dashboard with new-order queue and a scheduled order detail panel"
                className="w-full"
                width={1920}
                height={1247}
              />
            </Col>
          </Grid>
        </FadeIn>

        {/* Title + subtitle with metadata rail (intro-rail) */}
        <Grid preset="intro-rail">
          <Col>
            <h1 className="text-(--color-fg)" style={typescale.display}>Modernizing food &amp; beverage ordering for hotels</h1>
            <p className="mt-6 text-(--color-fg-secondary)">I designed a 0-1 food &amp; beverage ordering platform specifically for hotels. This was the latest addition to Canary&apos;s suite of products aimed at increasing hotel efficiency and increasing their ancillary revenue. Through a scrappy and highly iterative approach, our team developed launched the MVP in about four months to several pilot customers and over $50k in committed ARR.</p>
            {/* Solution paragraphs folded into the intro (Marco 2026-07-26) */}
            <p className="mt-3 text-(--color-fg-secondary)">We built a mobile-first ordering experience for our guests that served as an extension to our existing guest experience platform. Guests can browse available menu items, add to their carts, and then send their orders to hotel staff easily. To manage inbound orders, we built a dashboard and notification system that enabled operators to easily notify their kitchen staff and complete fulfillment.</p>
          </Col>
          <Col className="mt-8 lg:mt-2">
            <MetaRail items={META} />
          </Col>
        </Grid>

        {/* ── Guest ordering flow — interactive specimen (replaced the
            fb-mobile.mp4 ambient video, Marco 2026-08-03). Live recreation
            of the Unified Cart flow: menu browse → item drawer → review
            cart → your info. Panel bg is a theme-following shade of the
            page background. */}
        <FadeIn className="pt-32">
          <Grid>
            <Col md="1-12" lg="2-11">
              <FnbCartSpecimen />
            </Col>
          </Grid>
        </FadeIn>

        {/* ── Staff order queue — the other half of the same product
            (Marco 2026-08-04). Rebuilt from the polished Figma frames
            (Canary Polished Visuals, section 51:6068) and styled from
            canary-polished-tokens. Same DemoStage chrome as the cart
            above: pause/play, restart, fullscreen. */}
        <FadeIn className="pt-10">
          <Grid>
            <Col md="1-12" lg="2-11">
              <OrderDashboardSpecimen />
            </Col>
          </Grid>
        </FadeIn>

        {/* ── TEMPORARY mount for visual dev (Task 3, 2026-08-04) — static
            Item Library specimen (specimen #3). Structure is correct;
            final caption/polish lands in Task 5. ── */}
        <FadeIn className="pt-10">
          <Grid>
            <Col md="1-12" lg="2-11">
              <ItemLibrarySpecimen />
            </Col>
          </Grid>
        </FadeIn>

        {/* ── Staff dashboard crops — alternating media rows on the
            video's band (Marco 2026-07-26: was a 2-up grid). The
            exports float on transparency; the fill mirrors
            ObjectFlowDiagram's panel (3% F&B accent over card-bg) so
            the dashboard visuals read as one family. Caption copy is
            draft — Marco rewrites via the inline editor. */}
        <FadeIn className="pt-6">
          <Grid>
            <Col className="self-center" md="3-10" lg="2-5">
              <p className="text-(--color-fg-secondary)">The order queue sorts by time to delivery, not time received. Urgency badges surface anything at risk of slipping during a breakfast rush, so staff never have to triage by memory.</p>
            </Col>
            <Col className="mt-6 md:mt-6 lg:mt-0" md="1-12" lg="6-11">
              <div className="overflow-hidden rounded-[10px] border border-border" style={{ background: FB_PANEL_BG }}>
                <img
                  src="/images/fb-ordering/fb-order-queue.webp"
                  alt="New-orders queue sorted by expected delivery time with urgency badges"
                  className="w-full"
                  width={1200}
                  height={1200}
                />
              </div>
            </Col>
          </Grid>
        </FadeIn>
        <FadeIn className="pt-6">
          <Grid>
            <Col md="1-12" lg="2-7">
              <div className="overflow-hidden rounded-[10px] border border-border" style={{ background: FB_PANEL_BG }}>
                <img
                  src="/images/fb-ordering/fb-order-details.webp"
                  alt="Scheduled order detail panel with guest contact info and order items"
                  className="w-full"
                  width={1200}
                  height={1200}
                />
              </div>
            </Col>
            <Col className="mt-6 self-center md:mt-6 lg:mt-0" md="3-10" lg="8-11">
              <p className="text-(--color-fg-secondary)">Opening an order shows everything fulfillment needs in one panel: guest contact details, room or delivery location, items with modifiers, and scheduling for orders placed ahead.</p>
            </Col>
          </Grid>
        </FadeIn>

        {/* ── Context — the problem paragraphs, moved out of the intro
            below the video (Marco 2026-07-26) ── */}
        <FadeIn as="section" className="scroll-mt-24 pt-32">
          <Grid preset="media-right">
            <Col>
              <SectionHeading id="context">Context</SectionHeading>
              <p className="mb-5">Guests&#39; late-night munchies were increasingly going to DoorDash instead of the front desk, so we rebuilt room service to be modern, convenient, and visually enticing. One hotel we spoke to ran breakfast on door hangers. Guests forgot to hang them, staff missed pickups, and complaints piled up. At most properties the alternative was the front desk phone: misheard orders, tied-up staff, and enough friction that guests simply gave up. Meanwhile, Canary was losing deals in APAC markets where mobile ordering is table stakes.</p>
              <p className="mb-5">Canary&#39;s Guest Hub was still a static content product. F&amp;B ordering would make it transactional: a revenue engine, not just an info layer. The discipline was scope: no marketplaces, no kitchen software. Just get a guest&#39;s order to staff efficiently.</p>
            </Col>
          </Grid>
        </FadeIn>

        {/* ── Our approach ── */}
        <FadeIn as="section" className="scroll-mt-24 pt-32">
          <Grid preset="media-right">
            <Col>
              <SectionHeading id="approach">Our approach</SectionHeading>
              <p className="mb-5">
                There were four major decisions that defined the design:
              </p>
            </Col>
            <Col>
              <ol className="list-decimal pl-5 space-y-2">
                <li><span className="font-medium text-(--color-fg)">Built upon our existing infrastructure:</span> fast implementation was important in order to go-to-market quickly. We designed mobile ordering as an extension to our existing guest experience and upselling platforms using similar patterns, but tweaked to match food &amp; beverage use cases.</li>
                <li><span className="font-medium text-(--color-fg)">Delivery type drives the experience:</span> hotel customers wanted to go beyond in-room dining in order to expand channels for revenue. We had to design a flow that flexibly allowed for alternative locations such as orders delivered poolside, or to the hotel lounge.</li>
                <li><span className="font-medium text-(--color-fg)">Five system objects as the IA backbone:</span> Ordering Outlets, Menus, Items, Modifier Groups, Orders. Manage items once, compose menus flexibly.</li>
                <li><span className="font-medium text-(--color-fg)">Works with or without a PMS:</span> reservation-linked ordering when integrated, manual entry fallback for everyone else. No POS requirement meant shipping to the whole market.</li>
              </ol>
            </Col>
          </Grid>
        </FadeIn>

        {/* ── Object flow diagram ── */}
        <FadeIn className="pt-16">
          <Grid>
            <Col md="1-12" lg="2-11">
              <ObjectFlowDiagram />
            </Col>
          </Grid>
        </FadeIn>

        {/* ── Research & Discovery ── */}
        <FadeIn className="pt-32">
          <Grid preset="media-right">
            <Col>
              <ExpandableSection title="Research & Discovery" id="research">
                <p>
                  Customer interviews with hotel F&amp;B staff, competitive analysis, and usability testing on a fully interactive Next.js prototype I built, which went on to become the primary demo tool for sales calls and GTM enablement. The research drove three calls: no POS requirement (a POS dependency would have blocked 80%+ of potential customers), a staff dashboard sorted by time-elapsed urgency so orders never get missed during peak hours, and a no-download mobile web flow using patterns guests already know. Once early adopters went live, I ran the customer feedback calls myself — walking HOMA&apos;s Thailand properties through the product while demoing my own prototype.
                </p>
              </ExpandableSection>
            </Col>
            {/* Placeholder hidden for now (Marco 2026-07-15) — restore when
                the capture lands. Text keeps its 1-5 span via the preset.
              <Col className="mt-8 lg:mt-0">
                <ImagePlaceholder description="Interactive Next.js prototype used in usability tests and sales demos" aspectRatio="16/10" />
              </Col> */}
          </Grid>
        </FadeIn>

        {/* ── Impact & Results ── */}
        <FadeIn className="pt-32">
          <Grid preset="media-right">
            <Col>
              <ExpandableSection title="Impact & Results" id="impact">
                <p className="mb-5">
                  F&amp;B Ordering hit GA in February 2026 with two verbal commitments from demos alone and 50 pilot orders validating demand before launch. The delivery-type model became the architectural pattern for all future ordering scenarios (spa, activities, table-side), and APAC enterprise interest is building, with $25K+ in potential ARR from interested properties.
                </p>
                <p className="mb-8">
                  The platform also started clearing enterprise deals: my HubOS service-requests design solved Eurostars&apos; #1 deal-blocking feature request — internally the line was &ldquo;no HubOS integration = no deal&rdquo; for the 270-property chain. And at the December 2025 team retro, the note that stuck: &ldquo;Amazed at how we were able to hit our goal!&rdquo;
                </p>
              </ExpandableSection>
            </Col>
            {/* Placeholder hidden for now (Marco 2026-07-15).
              <Col className="mt-8 lg:mt-0">
                <ImagePlaceholder description="Launch metrics: pilot orders, verbal commitments, APAC pipeline" aspectRatio="16/10" />
              </Col> */}
          </Grid>
        </FadeIn>

        {/* ── Reflection ── */}
        <FadeIn className="pt-32">
          <Grid preset="media-right">
            <Col>
              <ExpandableSection title="Reflection" id="reflection">
                <ul className="list-disc pl-5 space-y-2">
                  <li><span className="font-medium text-(--color-fg)">Prototype in code, early.</span> Hotel staff testing realistic flows made research dramatically more effective, and the prototype became a genuine GTM asset.</li>
                  <li><span className="font-medium text-(--color-fg)">Find the one variable.</span> The delivery-type insight collapsed dozens of edge cases into a single configurable model. Designing for two audiences (guests ordering, staff fulfilling) means designing the system, not the screens.</li>
                  <li><span className="font-medium text-(--color-fg)">I&#39;d push harder on staff notifications in the MVP.</span> Post-launch feedback from HOMA showed hotels needed immediate alerts, as their team had to keep checking for new orders.</li>
                </ul>
              </ExpandableSection>
            </Col>
            {/* Placeholder hidden for now (Marco 2026-07-15).
              <Col className="mt-8 lg:mt-0">
                <ImagePlaceholder description="Staff notifications concept / HOMA post-launch feedback" aspectRatio="16/10" />
              </Col> */}
          </Grid>
        </FadeIn>

        {/* ── Next Project — restored 2026-07-26: the flagship study
            ended with no forward path (reflection bullets, then nothing) ── */}
        <FadeIn>
          <NextProject
            title="Digital Compendium"
            subtitle="Building a scalable hotel CMS platform from scratch"
            href="/work/compendium"
          />
        </FadeIn>
    </CaseStudyShell>
  );
}

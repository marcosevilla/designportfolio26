"use client";

import ExpandableSection from "@/components/case-study/ExpandableSection";
import ObjectFlowDiagram from "@/components/fb-showcase/ObjectFlowDiagram";
import FnbCartSpecimen from "@/components/fb-showcase/FnbCartSpecimen";
import OrderDashboardSpecimen from "@/components/fb-showcase/OrderDashboardSpecimen";
import ItemLibrarySpecimen from "@/components/fb-showcase/ItemLibrarySpecimen";
import OutletDetailsSpecimen from "@/components/fb-showcase/OutletDetailsSpecimen";
// Hidden 2026-08-05 — see the commented-out mount below.
// import OutletConfigSpecimen from "@/components/fb-showcase/OutletConfigSpecimen";
import { DemoGroup, TryDemoButton } from "@/components/DemoStage";
import FadeIn from "@/components/case-study/FadeIn";
import NextProject from "@/components/case-study/NextProject";
import SectionHeading from "@/components/case-study/SectionHeading";
import CaseStudyShell from "@/components/case-study/CaseStudyShell";
import MetaRail from "@/components/case-study/MetaRail";
import Grid, { Col } from "@/components/layout/Grid";
import { CONTENT_BAND, CONTENT_BAND_MD } from "@/lib/layout-presets";
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
            {/* On the content band like everything else — media matches
                the text measure (Marco's 2026-08-05 OpenAI-scale call;
                the break-out era is in git history). */}
            <Col md={CONTENT_BAND_MD} lg={CONTENT_BAND}>
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
        {/* Interactive demos keep a wider breakout band (Marco 2026-08-05:
            the ONE exception to media-matches-text — the staff specimens
            are 1177px desktop UIs and DemoStage floors inline scale at
            0.7, so the 676px text band would clip/pan them). "3-10" ≈
            909px at full canvas, matching their pre-pass width. */}
        {/* Each demo is a <DemoGroup>: the stage on the wide band, then a
            caption on the text band whose "Try demo" button opens that
            demo's hands-on fullscreen copy (Marco 2026-08-05 — the in-page
            copy is display-only now; no chrome, no panel, no hover state).
            ⚠️ Caption copy below is DRAFT — Marco rewrites via the inline
            editor. */}
        <DemoGroup>
          <FadeIn className="pt-32">
            <Grid>
              <Col md="1-12" lg="3-10">
                <FnbCartSpecimen />
              </Col>
            </Grid>
          </FadeIn>
          <FadeIn className="pt-6">
            <Grid>
              <Col md={CONTENT_BAND_MD} lg={CONTENT_BAND}>
                <h3 className="text-(--color-fg)" style={typescale.h3}>Ordering from the room</h3>
                <p className="mt-3">Guests scan a QR code and land in the outlet&apos;s menu — no app, no account. Browsing, modifiers, and the cart all live on one surface, so a guest can go from &ldquo;what&apos;s open&rdquo; to a submitted order in under a minute.</p>
                <TryDemoButton />
              </Col>
            </Grid>
          </FadeIn>
        </DemoGroup>

        {/* ── Staff order queue — the other half of the same product
            (Marco 2026-08-04). Rebuilt from the polished Figma frames
            (Canary Polished Visuals, section 51:6068) and styled from
            canary-polished-tokens. Same DemoStage chrome as the cart
            above: pause/play, restart, fullscreen. */}
        <DemoGroup>
          <FadeIn className="pt-16">
            <Grid>
              <Col md="1-12" lg="3-10">
                <OrderDashboardSpecimen />
              </Col>
            </Grid>
          </FadeIn>
          <FadeIn className="pt-6">
            <Grid>
              <Col md={CONTENT_BAND_MD} lg={CONTENT_BAND}>
                <h3 className="text-(--color-fg)" style={typescale.h3}>Working the order queue</h3>
                <p className="mt-3">Staff see every inbound order in one lane and move it through approve → prepare → deliver. The side sheet carries the full ticket, so nobody has to hold a guest&apos;s modifiers in their head while walking to the kitchen.</p>
                <TryDemoButton />
              </Col>
            </Grid>
          </FadeIn>
        </DemoGroup>

        {/* ── Staff item library — the menu-CMS half of the same product
            (Marco 2026-08-04). Rebuilt from the polished Figma frames
            (Canary Polished Visuals, frame 56:6548) and styled from
            canary-polished-tokens. Same DemoStage chrome as the two
            specimens above: pause/play, restart, fullscreen. */}
        <DemoGroup>
          <FadeIn className="pt-16">
            <Grid>
              <Col md="1-12" lg="3-10">
                <ItemLibrarySpecimen />
              </Col>
            </Grid>
          </FadeIn>
          <FadeIn className="pt-6">
            <Grid>
              <Col md={CONTENT_BAND_MD} lg={CONTENT_BAND}>
                <h3 className="text-(--color-fg)" style={typescale.h3}>Keeping the menu honest</h3>
                <p className="mt-3">The item library is where a property&apos;s menu actually lives. Availability is a single toggle — the fastest edit a kitchen makes during service — and destructive actions stay behind a confirm, because 86&apos;ing an item and deleting it are very different intents.</p>
                <TryDemoButton />
              </Col>
            </Grid>
          </FadeIn>
        </DemoGroup>

        {/* ── Staff outlet editor — where the guest-facing outlet page gets
            written, with a live phone preview (Marco 2026-08-04). Rebuilt
            from the polished Figma frames (Canary Polished Visuals, frame
            57:8145) and styled from canary-polished-tokens. Same DemoStage
            chrome as the three specimens above. */}
        <DemoGroup>
          <FadeIn className="pt-16">
            <Grid>
              <Col md="1-12" lg="3-10">
                <OutletDetailsSpecimen />
              </Col>
            </Grid>
          </FadeIn>
          <FadeIn className="pt-6">
            <Grid>
              <Col md={CONTENT_BAND_MD} lg={CONTENT_BAND}>
                <h3 className="text-(--color-fg)" style={typescale.h3}>Writing the outlet page</h3>
                <p className="mt-3">Every field an operator fills in renders live in the guest preview beside it. Hotel staff aren&apos;t content editors by trade, so the screen shows the consequence of each keystroke instead of asking them to imagine it.</p>
                <TryDemoButton />
              </Col>
            </Grid>
          </FadeIn>
        </DemoGroup>

        {/* ── Outlet configuration — the settings side of the same product:
            connect menus, pick the delivery type the whole model hangs on,
            and price out what the guest pays (Marco 2026-08-04). Rebuilt from
            the polished Figma frames (Canary Polished Visuals, frame 64:8703
            in section 64:9088). Same DemoStage chrome as the four above.

            HIDDEN 2026-08-05 (Marco): not polished enough to ship yet —
            revisit later. The component and its data file are intact; restore
            by un-commenting this block and its import above. */}
        {/* <FadeIn className="pt-10">
          <Grid>
            <Col md="1-12" lg="3-10">
              <OutletConfigSpecimen />
            </Col>
          </Grid>
        </FadeIn> */}

        {/* ── Staff dashboard crops — caption + shot stacked on the
            content band (2026-08-05 OpenAI-scale pass; the alternating
            side-by-side rows are in git history). The exports float on
            transparency; the fill mirrors ObjectFlowDiagram's panel
            (3% F&B accent over card-bg) so the dashboard visuals read
            as one family. Caption copy is draft — Marco rewrites via
            the inline editor. */}
        <FadeIn className="pt-6">
          <Grid>
            <Col md={CONTENT_BAND_MD} lg={CONTENT_BAND}>
              <p className="text-(--color-fg-secondary)">The order queue sorts by time to delivery, not time received. Urgency badges surface anything at risk of slipping during a breakfast rush, so staff never have to triage by memory.</p>
            </Col>
            <Col className="mt-6" md={CONTENT_BAND_MD} lg={CONTENT_BAND}>
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
            <Col md={CONTENT_BAND_MD} lg={CONTENT_BAND}>
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
            <Col className="mt-6" md={CONTENT_BAND_MD} lg={CONTENT_BAND}>
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
            {/* Wide like the demos — the diagram pans below ~820px. */}
            <Col md="1-12" lg="3-10">
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

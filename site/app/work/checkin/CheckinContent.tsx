"use client";

import QuickStats from "@/components/case-study/QuickStats";
import ImagePlaceholder from "@/components/case-study/ImagePlaceholder";
import ExpandableSection from "@/components/case-study/ExpandableSection";
import SidebarTOCBridge from "@/components/case-study/SidebarTOCBridge";
import TOCObserver from "@/components/case-study/TOCObserver";
import NextProject from "@/components/case-study/NextProject";
import ProgressBar from "@/components/case-study/ProgressBar";
import FadeIn from "@/components/case-study/FadeIn";
import InlineTOC from "@/components/case-study/InlineTOC";
import SectionHeading from "@/components/case-study/SectionHeading";
import TwoCol from "@/components/TwoCol";
import { typescale } from "@/lib/typography";

const STATS = [
  { value: "$3.5M", label: "Annual recurring revenue generated" },
  { value: "+80%", label: "Check-in adoption increase" },
  { value: "6,000", label: "Hotel properties worldwide" },
  { value: "3", label: "New product SKUs launched" },
];

const TOC_ITEMS = [
  { id: "overview", label: "Overview" },
  { id: "role", label: "Role" },
  { id: "checkin", label: "Check-in" },
  { id: "compendium", label: "Compendium" },
  { id: "messaging", label: "Messaging" },
  { id: "international", label: "International" },
];

export default function CheckinContent() {
  return (
    <>
      <ProgressBar />
      <SidebarTOCBridge items={TOC_ITEMS} />
      <TOCObserver sectionIds={TOC_ITEMS.map(i => i.id)} />

      <article className="text-[var(--color-fg-secondary)]" style={typescale.body}>
        <InlineTOC />
        <div className="max-w-content mx-auto px-4 sm:px-8 lg:max-w-none lg:px-0 pt-24 lg:pt-[18vh]">
        {/* Title + Subtitle */}
        <TwoCol>
          <TwoCol.Left>
            <h1 className="tracking-tight text-[var(--color-fg)]" style={typescale.display}>Modernizing Hotel Software</h1>
            <p className="mt-3 text-[var(--color-fg-secondary)]" style={typescale.subtitle}>Designing digital check-in, compendium, and omni-channel communication solutions for the world's largest hotel chains.</p>
          </TwoCol.Left>
        </TwoCol>

        {/* Quick Stats */}
        <FadeIn>
          <QuickStats items={STATS} />
        </FadeIn>

        {/* Overview */}
        <FadeIn as="section" className="scroll-mt-24 pt-24">
          <TwoCol>
            <TwoCol.Left>
              <SectionHeading id="overview">Overview</SectionHeading>
              <p className="mb-5">
                Canary is on a mission to completely revamp hotel software through a comprehensive set of tools optimized for hoteliers. Our products have streamlined staff operations, increased revenue, and enhanced guest experiences for hotel chains including Marriott, Best Western, IHG, and Wyndham.
              </p>
              <p>
                I design across Canary&apos;s full suite of products including Mobile Check-in, Checkout, Canary AI, Compendium, Authorizations, Digital Tipping, Upsells, and Guest Messaging.
              </p>
            </TwoCol.Left>
          </TwoCol>
        </FadeIn>

        {/* My Role */}
        <FadeIn as="section" className="scroll-mt-24 pt-32">
          <TwoCol>
            <TwoCol.Left>
              <SectionHeading id="role">My Role</SectionHeading>
              <p className="mb-5">
                As a Product Designer at Canary, I lead projects from concept to execution, partnering closely with PMs and engineering leads to define product requirements, and collaborating with go-to-market teams. My work spans facilitating iterative design sprints, conducting field research with hotels, and presenting design solutions to leadership and executive teams.
              </p>
              <p>
                Additionally, I help standardize design operations, evangelizing new processes, and enhancing design scalability with our design system, Canary UI, in partnership with engineering.
              </p>
            </TwoCol.Left>
          </TwoCol>
        </FadeIn>

        {/* Digital Check-in */}
        <FadeIn className="pt-32">
          <ExpandableSection title="Digital Check-in" id="checkin">
            <TwoCol>
              <TwoCol.Left>
                <p className="mb-5">
                  Designed a seamless self-service check-in solution that allows hotel guests to bypass the front desk. This product addresses guest frustration with wait times and operational inefficiencies, enabling guests to confirm reservations, upload identification, and make requests digitally, all while reducing staff workload.
                </p>
              </TwoCol.Left>
            </TwoCol>

            <FadeIn className="my-8">
              <ImagePlaceholder
                description="Hotel staff-facing dashboard design with guest ID photo for easy recognition"
                aspectRatio="16/9"
              />
            </FadeIn>

            <TwoCol>
              <TwoCol.Left>
                <p className="mb-5">
                  The staff dashboard was designed in alignment with hotel operational workflow. We wanted to translate the traditional analog process of comparing the guest payment card and ID card by placing those documents side-by-side in the digital interface.
                </p>
              </TwoCol.Left>
            </TwoCol>

            <FadeIn className="my-8">
              <ImagePlaceholder
                description="Guest check-in details with ID and payment card side-by-side comparison"
                aspectRatio="16/9"
              />
            </FadeIn>
          </ExpandableSection>
        </FadeIn>

        {/* Compendium */}
        <FadeIn className="pt-32">
          <ExpandableSection title="Compendium" id="compendium">
            <TwoCol>
              <TwoCol.Left>
                <p className="mb-5">
                  Developed a customizable, guest-facing digital directory for hotels to communicate key information, such as amenities, policies, and local recommendations. The product also included a &ldquo;logged-in&rdquo; version tailored to individual guest preferences and a public version for general hotel information.
                </p>
              </TwoCol.Left>
            </TwoCol>

            <FadeIn className="my-8">
              <ImagePlaceholder
                description="Mobile interface — digital directory with amenities, policies, and dining options"
                aspectRatio="9/16"
              />
            </FadeIn>

            <TwoCol>
              <TwoCol.Left>
                <p className="mb-5">
                  The mobile interface serves as a digital directory for hotels. Guests can easily access information about amenities, policies, dining options, and local recommendations. The design includes a personalized &ldquo;logged-in&rdquo; experience tied to the guest&apos;s reservation, offering tailored features like room-specific details or stay itineraries.
                </p>
              </TwoCol.Left>
            </TwoCol>

            <FadeIn className="my-8">
              <ImagePlaceholder
                description="Content management system (CMS) for hotel staff to customize their compendium"
                aspectRatio="16/9"
              />
            </FadeIn>

            <TwoCol>
              <TwoCol.Left>
                <p>
                  The CMS enables hotel staff to control and customize their compendium content and design. It includes tools for managing text, images, and layouts while enabling manual translations for multilingual support. Hotels can tailor the compendium to reflect their branding through customizable themes, colors, and fonts.
                </p>
              </TwoCol.Left>
            </TwoCol>
          </ExpandableSection>
        </FadeIn>

        {/* Omni-channel Messaging */}
        <FadeIn className="pt-32">
          <ExpandableSection title="Omni-channel Communication" id="messaging">
            <TwoCol>
              <TwoCol.Left>
                <p>
                  Improved how hotel front desk agents handle multiple communication channels (SMS, email, OTA sites). Designed a unified interface that allows staff to manage guest messages across platforms, reducing response times and ensuring consistent service.
                </p>
              </TwoCol.Left>
            </TwoCol>
          </ExpandableSection>
        </FadeIn>

        {/* International Expansion */}
        <FadeIn className="pt-32">
          <ExpandableSection title="International Expansion" id="international">
            <TwoCol>
              <TwoCol.Left>
                <p>
                  Contributed to internationalization efforts by helping design workflows that accommodate multilingual and regional variations. Focused on creating an MVP for manual translations while setting a foundation for future auto-translation capabilities.
                </p>
              </TwoCol.Left>
            </TwoCol>
          </ExpandableSection>
        </FadeIn>

        {/* Next Project */}
        <div className="mt-32 pt-16 border-t border-[var(--color-border)]">
          <NextProject
            title="General Task"
            subtitle="Building an all-in-one productivity tool for software engineers"
            href="/work/general-task"
          />
        </div>
        </div>
      </article>
    </>
  );
}

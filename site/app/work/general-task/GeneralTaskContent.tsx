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
  { value: "1,000+", label: "User signups at launch" },
  { value: "#2", label: "Product of the Week on Product Hunt" },
  { value: "80%", label: "30-day activated retention rate" },
  { value: "Y Combinator", label: "W23 acceptance" },
];

const TOC_ITEMS = [
  { id: "overview", label: "Overview" },
  { id: "role", label: "Role" },
  { id: "context", label: "Context" },
  { id: "goals", label: "Goals" },
  { id: "research", label: "Research" },
  { id: "design", label: "Design" },
  { id: "results", label: "Results" },
  { id: "lessons", label: "Lessons" },
];

export default function GeneralTaskContent() {
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
            <h1 className="tracking-tight text-[var(--color-fg)]" style={typescale.display}>Building Productivity Software for Engineers</h1>
            <p className="mt-3 text-[var(--color-fg-secondary)]" style={typescale.subtitle}>Designing a web-based task management tool that gives software engineers a holistic view of their workload by integrating popular project management tools in one surface.</p>
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
                At General Task, our goal was to develop tools that made software engineers more productive. After speaking with dozens of engineers, a pattern emerged: the modern development tech stack inundated engineers with constant context switching, decision paralysis, and uncertainty about what truly matters.
              </p>
              <p>
                We realized in the fast-paced world of startups, time and focus is often misdirected. We built a web-based productivity tool designed with our end-users in mind: software engineers. By integrating with popular project management tools in one surface and exposing users&apos; daily calendars, we gave users a holistic view of their workload while integrating other popular engineering tools into one place.
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
                I led the redesign of the product&apos;s new home page. This project was shaped by a mixture of activities that I helped facilitate including conducting user research, usability tests, rapid iteration, and many brainstorms with product management and engineering.
              </p>
              <p>
                I designed a modular system of &ldquo;folders&rdquo; that could be arranged according to user preference, with extensive sorting options within each folder.
              </p>
            </TwoCol.Left>
          </TwoCol>
        </FadeIn>

        {/* Context & Problem */}
        <FadeIn className="pt-32">
          <ExpandableSection title="Context & Problem" id="context">
            <TwoCol>
              <TwoCol.Left>
                <p className="mb-5">
                  While developing an initial prototype of our web-based task management tool, early feedback from users indicated that the homepage did not yet resonate with our target audience, software engineers, and lacked compelling advantages over existing productivity solutions in the market.
                </p>
                <p>
                  Additionally, there had been no formal user research conducted to guide our product&apos;s development. This lack of differentiation and user-centric design approach hampered our ability to effectively address the specific needs and preferences of software engineers, thereby limiting product appeal and usability.
                </p>
              </TwoCol.Left>
            </TwoCol>
          </ExpandableSection>
        </FadeIn>

        {/* Goals */}
        <FadeIn className="pt-32">
          <ExpandableSection title="Goals" id="goals">
            <TwoCol>
              <TwoCol.Left>
                <ul className="space-y-4 mb-5">
                  <li className="flex gap-3">
                    <span className="text-[var(--color-accent)] flex-shrink-0">🔍</span>
                    <span>Identify and address the productivity pain points of Software Engineers.</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-[var(--color-accent)] flex-shrink-0">💻</span>
                    <span>Tailor our product to meet the needs of Software Engineers.</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-[var(--color-accent)] flex-shrink-0">📐</span>
                    <span>Design a scalable productivity system that grows with our product.</span>
                  </li>
                </ul>
              </TwoCol.Left>
            </TwoCol>
          </ExpandableSection>
        </FadeIn>

        {/* User Research */}
        <FadeIn className="pt-32">
          <ExpandableSection title="User Research" id="research">
            <TwoCol>
              <TwoCol.Left>
                <p className="mb-5">
                  I led a cross-functional workshop to generate and gather ideas from the team, allowing everyone to be a contributor early in the design process. Additionally, I was able to gather the experiences of my engineering colleagues to inform product direction and align on technical feasibility.
                </p>
                <p className="mb-5">
                  We started conversations with 20+ IC Software Engineers, Engineering Managers, and founders. The essential question we wanted to answer: what gets in the way of one&apos;s ideal workday?
                </p>
                <p className="mb-8">
                  I worked with my founder to draft a research script, leaning into questions that were open-ended, evoked honesty and detail in order to get a comprehensive look into our interviewees&apos; work habits and pain points.
                </p>
              </TwoCol.Left>
            </TwoCol>

            <FadeIn className="my-8">
              <ImagePlaceholder
                description="User research synthesis and key insights"
                aspectRatio="16/9"
              />
            </FadeIn>

            <TwoCol>
              <TwoCol.Left>
                <SectionHeading level={3}>Research Highlights</SectionHeading>
                <ul className="space-y-6">
                  <li>
                    <p className="font-medium text-[var(--color-fg)] mb-1">Engineers are burdened by the quantity of their work tools.</p>
                    <p className="text-[var(--color-fg-secondary)]">Engineers need a way to effectively condense and streamline their workflows.</p>
                  </li>
                  <li>
                    <p className="font-medium text-[var(--color-fg)] mb-1">Engineers lack a singular source of truth for project status updates.</p>
                    <p className="text-[var(--color-fg-secondary)]">Engineers need a single source of truth for their work.</p>
                  </li>
                  <li>
                    <p className="font-medium text-[var(--color-fg)] mb-1">Engineers are struggling with prioritization.</p>
                    <p className="text-[var(--color-fg-secondary)]">Engineers need an effective way to prioritize their many tasks spanning several projects in order to quickly decide what to work on next.</p>
                  </li>
                  <li>
                    <p className="font-medium text-[var(--color-fg)] mb-1">Engineers had varying work styles.</p>
                    <p className="text-[var(--color-fg-secondary)]">Engineers need a task management system that is attuned to their unique preferences.</p>
                  </li>
                </ul>
              </TwoCol.Left>
            </TwoCol>
          </ExpandableSection>
        </FadeIn>

        {/* Design Process */}
        <FadeIn className="pt-32">
          <ExpandableSection title="Design Process" id="design">
            <TwoCol>
              <TwoCol.Left>
                <SectionHeading level={3}>Sketches</SectionHeading>
                <p className="mb-5">
                  I started off the iteration process by creating paper sketches, which helped me visualize and explore potential solutions. These were the early drafts which informed the structure of our MVP design.
                </p>
              </TwoCol.Left>
            </TwoCol>
            <FadeIn className="my-8">
              <ImagePlaceholder
                description="Early paper sketches exploring layout options"
                aspectRatio="16/9"
              />
            </FadeIn>

            <TwoCol>
              <TwoCol.Left>
                <SectionHeading level={3}>Wireframes: Folders</SectionHeading>
                <p className="mb-5">
                  Utilizing our existing folder system for developer efficiency, I introduced a new card component. Since users required a clear view of their tasks and their context, this modular container is adaptable to users&apos; viewing preferences and shows the associated folder. I crafted this card component with a straightforward design pattern, addressing edge scenarios like empty and overflow states.
                </p>
              </TwoCol.Left>
            </TwoCol>
            <FadeIn className="my-8">
              <ImagePlaceholder
                description="Wireframes showing folder card components and states"
                aspectRatio="16/9"
              />
            </FadeIn>

            <TwoCol>
              <TwoCol.Left>
                <SectionHeading level={3}>Wireframes: Home Page Layout</SectionHeading>
                <p className="mb-5">
                  I initially designed a dashboard grid layout displaying task folders. Clicking a task opened its details in a modal, which users found disruptive due to its lack of detail. I then experimented with a multi-column layout where task details were on a separate page, but feedback indicated it resembled a Kanban board, which wasn&apos;t our goal.
                </p>
                <p className="mb-5">
                  Ultimately, a two-column design was chosen, stacking folders vertically in one column with their details in the second. This encouraged a prioritized, streamlined approach to tasks, resonating best with user feedback.
                </p>
              </TwoCol.Left>
            </TwoCol>
            <FadeIn className="my-8">
              <ImagePlaceholder
                description="Wireframe evolution from grid to two-column layout"
                aspectRatio="16/9"
              />
            </FadeIn>

            <TwoCol>
              <TwoCol.Left>
                <SectionHeading level={3}>Visual Design</SectionHeading>
                <p className="mb-5">
                  After distilling the direction of our home page layout, I moved into a high fidelity stage, adding more visual and interaction details. I presented these designs at numerous critique sessions and distilled feedback from my team.
                </p>
              </TwoCol.Left>
            </TwoCol>
            <FadeIn className="my-8">
              <ImagePlaceholder
                description="High fidelity visual design explorations"
                aspectRatio="16/9"
              />
            </FadeIn>

            <TwoCol>
              <TwoCol.Left>
                <SectionHeading level={3}>Final Designs</SectionHeading>
                <p className="mb-5">
                  During handoff, I ensured implementation was smooth for our engineers by creating detailed documentation and working closely with them during the process. The features of the Home page were shipped iteratively, and ultimately led us to our product&apos;s public beta launch.
                </p>
              </TwoCol.Left>
            </TwoCol>
            <FadeIn className="my-8">
              <ImagePlaceholder
                description="Final design — General Task home page"
                aspectRatio="16/9"
              />
            </FadeIn>
            <FadeIn className="my-8">
              <ImagePlaceholder
                description="Final design — Task detail view"
                aspectRatio="16/9"
              />
            </FadeIn>
          </ExpandableSection>
        </FadeIn>

        {/* Key Results */}
        <FadeIn className="pt-32">
          <ExpandableSection title="Key Results" id="results">
            <TwoCol>
              <TwoCol.Left>
                <div className="space-y-8">
                  <div>
                    <SectionHeading level={3}>We reached our engagement goals</SectionHeading>
                    <p>
                      We saw a 1,000+ increase in user sign ups upon launch, and an 80% 30-day activated retention rate, with an increased session duration of 15%. Feedback from users indicated that the feature was intuitive and useful, helping them to more effectively prioritize and focus on their work, which validated our approach.
                    </p>
                  </div>
                  <div>
                    <SectionHeading level={3}>We were ranked a top product on Product Hunt</SectionHeading>
                    <p>
                      The Overview page was released as a part of a major feature set for our beta launch on Product Hunt, where we were ranked #2 Product of the Week. The launch was met with overwhelming positive reviews and feedback regarding our work.
                    </p>
                  </div>
                  <div>
                    <SectionHeading level={3}>We were accepted into Y Combinator (W23)</SectionHeading>
                    <p>
                      Although we ultimately declined Y Combinator&apos;s offer, building a product that industry experts believed in was huge validation for all our hard work.
                    </p>
                  </div>
                </div>
              </TwoCol.Left>
            </TwoCol>
          </ExpandableSection>
        </FadeIn>

        {/* Lessons */}
        <FadeIn className="pt-32">
          <ExpandableSection title="Lessons & Takeaways" id="lessons">
            <TwoCol>
              <TwoCol.Left>
                <div className="space-y-8">
                  <div>
                    <SectionHeading level={3}>Focus on Viability</SectionHeading>
                    <p>
                      Working at an early stage startup meant working with very limited resources and time. It&apos;s easy to get lost in all of the possibilities, but when time is limited, we needed to hone in on solutions that were most likely to yield impact and the most viable to implement. We built upon our prototype to yield development feasibility.
                    </p>
                  </div>
                  <div>
                    <SectionHeading level={3}>Usability Testing</SectionHeading>
                    <p>
                      Due to constraints, we lacked formal usability testing prior to shipping the Overview page. In the future I would&apos;ve liked to go through more tests with users in order to fully validate its effectiveness.
                    </p>
                  </div>
                  <div>
                    <SectionHeading level={3}>Establishing a Design Culture</SectionHeading>
                    <p>
                      Because this was one of my first major projects at General Task, I was simultaneously setting a precedent for the design culture at General Task. This meant refining our design process, engaging with developers to establish trust, educating colleagues, and setting up feedback, critique, and planning sessions.
                    </p>
                  </div>
                </div>
              </TwoCol.Left>
            </TwoCol>
          </ExpandableSection>
        </FadeIn>

        {/* Next Project */}
        <div className="mt-32 pt-16 border-t border-[var(--color-border)]">
          <NextProject
            title="General Task Design System"
            subtitle="Building a scalable design system for a productivity startup"
            href="/work/design-system"
          />
        </div>
        </div>
      </article>
    </>
  );
}

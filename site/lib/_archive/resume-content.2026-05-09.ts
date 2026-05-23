// Resume data — surfaced on the About-me carousel page in the hero. Edit
// here to update the copy in one place.

export type ResumeJob = {
  company: string;
  title: string;
  location: string;
  period: string;
  bullets: string[];
};

export const RESUME_EXPERIENCE: ResumeJob[] = [
  {
    company: "Canary Technologies",
    title: "Product Designer",
    location: "San Francisco",
    period: "Sept 2023 – Current",
    bullets: [
      "Sole designer for F&B Mobile Ordering, a 0→1 platform shipped end-to-end — order management dashboard, menu CMS, guest mobile ordering, and Canary's first POS integration. 12+ features in 6 months with one PM and a small eng team.",
      "Lead designer for Upsells ($3.8M CARR, 5,000+ hotels). Designed the form builder, mobile live preview, segmentation, and dynamic pricing — now the shared foundation powering F&B Mobile Ordering and Compendium.",
      "Led design and discovery for the Knowledge Base powering Canary's AI Messaging product — unified three overlapping content surfaces (Property Info, Knowledge Base, Digital Compendium) into one AI-ready data model. The same model now powers HubOS, Messaging Channels, and Canary's AI Voice Concierge.",
      "Designed Compendium (Hotel guest hub, $1M+ CARR) — Canary's first guest-facing platform layer, built on the unified content model above.",
      "Spearheaded the Check-in redesign, driving 80% adoption growth across 4,500+ hotels and 54M guest stays.",
      "<!-- chat:exclude -->Scaled the product design team from 4 to 14 during Series C; partnered with leadership to define design principles and review cadence.<!-- /chat:exclude -->",
    ],
  },
  {
    company: "General Task",
    title: "Founding Product Designer",
    location: "Redwood City",
    period: "March 2022 – April 2023",
    bullets: [
      "Led design for an all-in-one productivity tool tailored for Software Engineers, achieving the #2 top product spot on Product Hunt and acceptance into Y Combinator W23.",
      "Developed design team processes and the company's first scalable design system, accelerating product development and improving team collaboration.",
      "Facilitated design and user research sprints to deliver 10+ core product features, ensuring alignment with product strategy and user needs.",
      "Mentored our Design Intern, fostering skill development and contributing to team growth.",
    ],
  },
  {
    company: "Vivino",
    title: "Visual Designer",
    location: "San Francisco",
    period: "July 2021 – March 2022",
    bullets: [
      "Introduced a new iterative design process, enhancing in-app assets and marketing creative. Led design for both local and global marketing campaigns, with the 2021 holiday campaign driving the company's second-highest earnings day in company history.",
    ],
  },
  {
    company: "Vyond",
    title: "Lead Visual Designer",
    location: "San Mateo",
    period: "June 2019 – June 2021",
    bullets: [
      "Redesigned and maintained brand design systems, enhancing brand recognition and partner collaboration. Led UX design initiatives for the marketing team, optimizing web experiences alongside the company's top revenue-generating team. Collaborated across departments and led A/B tests for various digital content.",
    ],
  },
];

export const RESUME_EDUCATION = {
  school: "Cal Poly, San Luis Obispo",
  degree: "B.S. Graphic Communication, Web & Digital Media Concentration",
  coursework:
    "Human–Computer Interaction, Computing Basics, Web Design, Mobile App Design, Advanced Typography, Motion Design, Studio Photography",
};

export const RESUME_ACHIEVEMENTS: { label: string; description: string }[] = [
  {
    label: "HotelTechAwards",
    description:
      "Powered three of Canary's HotelTechAwards 2024 winners — Best Guest Experience Platform, Check-in, and Guest Messaging.",
  },
  {
    label: "Y Combinator",
    description: "Acceptance into Y Combinator W23 for General Task.",
  },
  {
    label: "Product Hunt",
    description: "#2 Product of the Week in Jan 2023 for General Task.",
  },
  {
    label: "ATD 2021",
    description: "Best Conference Booth Design Award for Vyond.",
  },
  {
    label: "Vyond",
    description: "Speaker of Visual Design Webinar with over 2,000 sign-ups.",
  },
  {
    label: "Cal Poly",
    description: "President's Diversity Awards Recipient.",
  },
];

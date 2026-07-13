// Resume data — single source of truth for three surfaces:
// 1. About-me hero carousel (Hero.tsx → renders the full Resume component)
// 2. Standalone Resume page / PDF export (Resume.tsx)
// 3. Chat system prompt (lib/chat/system-prompt.ts — pulls structured fields)
//
// To hide a bullet from the chat surface only (still visible on the resume),
// wrap it in <!-- chat:exclude --> ... <!-- /chat:exclude -->.
//
// Header tagline ("Senior Product Designer") is positioning — the level Marco
// is operating at and targeting. The Canary job title below is the formal
// employment title that HR will confirm on background checks. Keep them
// distinct on purpose.

export const RESUME_HEADER = {
  name: "Marco Sevilla",
  tagline: "Senior Product Designer",
  location: "San Francisco, CA",
  email: "marcogsevilla@gmail.com",
  phone: "(650) 766-5474",
  portfolio: "marcosevilla.com",
  linkedin: "linkedin.com/in/marcogsevilla",
};

export const RESUME_SUMMARY =
  "Product designer with 7 years across B2B SaaS, AI products, and 0→1, operating at senior scope. Founding designer at General Task (YC W23). At Canary, design ownership on AI products driving $4.8M+ CARR for Marriott, Wyndham, Best Western, and Omni. I prototype in code with Claude as a daily collaborator.";

export const RESUME_TOOLS = [
  "Figma",
  "Figma MCP",
  "React",
  "TypeScript",
  "HTML/CSS",
  "Claude Code",
  "Cursor",
  "v0",
  "Linear",
  "Vercel",
  "Notion",
];

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
    period: "Sept 2023 – Present",
    bullets: [
      "Led design end-to-end for Compendium, Canary's guest-experience platform — 11 of 11 design files across 18 months. Drove $1M+ cumulative CARR (+141% YoY) and 82% custom-section adoption across 175K monthly active guests at Best Western, Wyndham, Omni, and COMO.",
      "Designed the foundational architecture and IA for Canary's Knowledge Base — the data model now powering AI Messaging and AI Voice Concierge. Categorized schema (Policies, Amenities, Dining, Location, In-room) replaced free-form fields and scaled to 2,000+ properties including Wyndham's 4,570-site portfolio. One structural call held across two product surfaces and two years to implementation.",
      "Owned design for F&B Mobile Ordering, Canary's first 0→1 platform of 2025–26 — order management dashboard, menu CMS, guest-side mobile ordering, and Canary's first POS integration. Single architectural call (\"delivery type drives the entire experience\") governed checkout, auth, and staff-handoff flows. Launched to 56% sales win rate.",
      "Built the F&B prototype in Next.js (v0.dev → Vercel) and turned it into sales' primary demo surface. Cut the validation loop from internal review cycles to 30-minute customer sessions; first LATAM win (Hotel Unique São Paulo) closed off prototype feedback.",
      "<!-- chat:exclude -->Scaled the product design team from 4 to 14 during Series C; authored design principles and review cadence still in use 2 years later.<!-- /chat:exclude -->",
    ],
  },
  {
    company: "General Task",
    title: "Founding Product Designer",
    location: "Redwood City",
    period: "Mar 2022 – Apr 2023",
    bullets: [
      "Founding designer for an AI-native productivity tool for software engineers. Shipped to 1,000+ signups, #2 Product Hunt, 80% 30-day activated retention, and Y Combinator (W23) acceptance.",
      "Built the company's first design system and product information architecture (folder-based model). Grounded the IA in 20+ research conversations with ICs, EMs, and founders.",
    ],
  },
  {
    company: "Vivino",
    title: "Visual Designer",
    location: "San Francisco",
    period: "Jul 2021 – Mar 2022",
    bullets: [
      "Led design for global and local marketing campaigns; the 2021 holiday campaign drove Vivino's second-highest single-day revenue in company history.",
    ],
  },
  {
    company: "Vyond",
    title: "Lead Visual Designer",
    location: "San Mateo",
    period: "Jun 2019 – Jun 2021",
    bullets: [
      "Redesigned brand and marketing design systems and led UX work for the revenue-generating marketing surfaces. Ran A/B tests across digital channels and represented the company as design speaker (2,000+ webinar attendees).",
    ],
  },
];

export const RESUME_EDUCATION = {
  school: "Cal Poly, San Luis Obispo",
  degree: "B.S. Graphic Communication, Web & Digital Media Concentration",
  period: "2015 – 2019",
  coursework:
    "Human–Computer Interaction, Computing Basics, Web Design, Mobile App Design, Advanced Typography, Motion Design, Studio Photography",
};

export const RESUME_ACHIEVEMENTS: { label: string; description: string }[] = [
  {
    label: "HotelTechAwards 2024",
    description:
      "Best Guest Experience Platform, Check-in, and Guest Messaging (Canary).",
  },
  {
    label: "Y Combinator W23",
    description: "General Task acceptance.",
  },
  {
    label: "Product Hunt",
    description: "#2 Product of the Week, Jan 2023 (General Task).",
  },
  {
    label: "Cal Poly",
    description: "President's Diversity Awards Recipient.",
  },
];

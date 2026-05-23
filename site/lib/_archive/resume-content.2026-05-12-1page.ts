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
  "Senior product designer with 7 years across B2B SaaS, AI products, and 0→1. Founding designer at General Task (YC W23). At Canary, design ownership on AI products driving $4.8M+ CARR for Marriott, Wyndham, Best Western, and Omni. I prototype in code with Claude as a daily collaborator.";

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
      "Owned design for F&B Mobile Ordering 0→1 (Canary's first POS integration) — order management dashboard, menu CMS, guest-side mobile ordering. Prototyped in Next.js (v0.dev → Vercel), which became sales' primary demo and closed the first LATAM win (Hotel Unique São Paulo). Launched to 56% sales win rate.",
      "<!-- chat:exclude -->Scaled the product design team from 4 to 14 during Series C; authored design principles and review cadence still in use 2 years later.<!-- /chat:exclude -->",
    ],
  },
  {
    company: "General Task",
    title: "Founding Product Designer",
    location: "Redwood City",
    period: "Mar 2022 – Apr 2023",
    bullets: [
      "Founding designer for an AI-native productivity tool for software engineers — built the company's first design system and folder-based product IA grounded in 20+ research conversations with ICs, EMs, and founders. Shipped to 1,000+ signups, #2 Product Hunt, 80% 30-day retention, and Y Combinator (W23).",
    ],
  },
  {
    company: "Vivino",
    title: "Visual Designer",
    location: "San Francisco",
    period: "Jul 2021 – Mar 2022",
    bullets: [
      "Led global and local marketing campaigns; 2021 holiday campaign drove Vivino's second-highest single-day revenue in company history.",
    ],
  },
  {
    company: "Vyond",
    title: "Lead Visual Designer",
    location: "San Mateo",
    period: "Jun 2019 – Jun 2021",
    bullets: [
      "Brand and marketing design systems; UX for revenue-generating marketing surfaces; A/B testing across digital channels.",
    ],
  },
];

export const RESUME_EDUCATION = {
  school: "Cal Poly, San Luis Obispo",
  degree: "B.S. Graphic Communication, Web & Digital Media Concentration",
  period: "2015 – 2019",
  coursework: "",
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
];

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

// Canonical hosted resume — linked from the home contact row and the
// About page's "View resume" button.
export const RESUME_URL =
  "https://drive.google.com/file/d/1GE6AZ2iqz6VDMXElLTbSDfS5NghMXQKd/view?usp=sharing";

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
  "Product Designer with 7+ years across B2B SaaS, AI, and 0-to-1 products. Former founding designer (YC W23 acceptance) with a foundation in marketing design and meticulous visual craft. Currently lead designer for two of Canary's top-4 revenue products (~22% of Q2 2026 bookings), driving $8.4M+ cumulative CARR across brands like Marriott, Wyndham, and Hyatt.";

// Mirrors the PDF's grouped Tools line: AI / Code / Design.
export const RESUME_TOOLS = [
  "Claude Code",
  "Cursor",
  "v0",
  "React",
  "Next.js",
  "Tailwind",
  "HTML/CSS",
  "Figma",
  "Framer",
  "Storybook",
  "Paper",
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
      "Designed revamped architecture for Canary's AI Knowledge Base. That data model now powers AI Messaging and AI Voice Concierge. Categorized schema replaced free-form fields, scaling to 2,000+ properties including Wyndham's 4,570-site portfolio.",
      "Lead design for Upsells, Canary's #3 revenue product ($801K Q2 2026 bookings; $6.94M cumulative CARR, +87% YoY). Redesigned guest purchase flow (+10% conversion lift); live room-inventory design drove a 60% increase in upsell approval rates.",
      "Primary designer for Digital Tipping (#4 company SKU, $756K Q2 bookings; $1M+/month processing volume). Led the 2026 full-product redesign and field research targeting $1.4M in uncashed staff tips; design work unlocked a $100K ARR rollout across 20+ Pyramid hotels and reduced at-risk properties 40%.",
      "Led 0-to-1 design for Compendium, Canary's guest experience platform, driving $1.51M cumulative CARR (+230% YoY), growing GMS attach rate from single digits to 44%, and reaching 175k MAU through new Custom Sections feature.",
      "Led 0-to-1 design for Canary's F&B Mobile Ordering platform including the order management dashboard, menu CMS, guest-side mobile ordering, and POS integrations.",
      "Developed org's AI-prototyping practice: ~50 working prototypes, replacing Figma as the engineering handoff spec — including a production feature shipped as an 8-PR vertical slice from my prototype, and a CEO-requested 400-hotel-chain demo delivered in 24 hours. Developed Claude prototyping best practices and mentored PMs.",
      "Key contributor to Check-in 2.0 redesign, activating Wyndham's 6,000-property portfolio (+80% adoption); helped scale the product team 4→30 through Series B/C/D.",
    ],
  },
  {
    company: "General Task",
    title: "Founding Product Designer",
    location: "Redwood City",
    period: "Mar 2022 – Apr 2023",
    bullets: [
      "Founding designer for an integrated productivity tool for knowledge workers, owning end-to-end development for AI-native features and drove 80% 30-day activated retention rate through beta.",
      "Led launch design – website, visual brand, and onboarding – driving 1,000+ signups, #2 Product Hunt placement (Jan 2023), and Y Combinator (W23) acceptance.",
      "Authored company's first design system and folder-based product information architecture, grounded in 20+ user research conversations with founders, engineering managers, and IC engineers.",
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
      "Developed and maintained marketing brand guidelines and systems for consistency at scale, driving revenue across every revenue-generating channel. Optimized conversion of our digital channels through A/B experiments.",
    ],
  },
];

export const RESUME_EDUCATION = {
  school: "Cal Poly, San Luis Obispo",
  degree: "B.S. Graphic Communication, UI/UX Concentration",
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
];

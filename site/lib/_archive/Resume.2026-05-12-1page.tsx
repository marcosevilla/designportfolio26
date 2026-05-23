"use client";

import {
  RESUME_HEADER,
  RESUME_SUMMARY,
  RESUME_TOOLS,
  RESUME_EXPERIENCE,
  RESUME_EDUCATION,
  RESUME_ACHIEVEMENTS,
} from "@/lib/resume-content";

const NAME_COLOR = "#B4502A"; // rust-orange accent preserved from the prior PDF

const NAME_STYLE: React.CSSProperties = {
  fontFamily: "var(--font-sans)",
  fontSize: "36px",
  lineHeight: 1.1,
  fontWeight: 600,
  letterSpacing: "-0.01em",
  color: NAME_COLOR,
};

const TAGLINE_STYLE: React.CSSProperties = {
  fontFamily: "var(--font-sans)",
  fontSize: "16px",
  lineHeight: 1.4,
  color: "var(--color-fg-secondary)",
  marginTop: "6px",
};

const CONTACT_STYLE: React.CSSProperties = {
  fontFamily: "var(--font-geist-mono), ui-monospace, Menlo, monospace",
  fontSize: "11px",
  lineHeight: 1.5,
  color: "var(--color-fg-tertiary)",
  marginTop: "12px",
};

const SECTION_LABEL_STYLE: React.CSSProperties = {
  fontFamily: "var(--font-geist-mono), ui-monospace, Menlo, monospace",
  fontSize: "11px",
  fontWeight: 500,
  textTransform: "uppercase",
  letterSpacing: "0.06em",
  color: "var(--color-fg-tertiary)",
  marginBottom: "20px",
};

const COMPANY_STYLE: React.CSSProperties = {
  fontFamily: "var(--font-sans)",
  fontSize: "16px",
  lineHeight: 1.4,
  color: "var(--color-fg)",
  fontWeight: 500,
};

const TITLE_STYLE: React.CSSProperties = {
  fontFamily: "var(--font-sans)",
  fontSize: "16px",
  lineHeight: 1.4,
  color: "var(--color-fg-secondary)",
};

const META_STYLE: React.CSSProperties = {
  fontFamily: "var(--font-geist-mono), ui-monospace, Menlo, monospace",
  fontSize: "11px",
  lineHeight: 1.4,
  color: "var(--color-fg-tertiary)",
  whiteSpace: "nowrap",
};

const BULLET_STYLE: React.CSSProperties = {
  fontFamily: "var(--font-sans)",
  fontSize: "16px",
  lineHeight: "26px",
  color: "var(--color-fg-secondary)",
};

function Section({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-14">
      <p style={SECTION_LABEL_STYLE} data-resume-label>{label}</p>
      {children}
    </section>
  );
}

export default function Resume() {
  const contactLine = [
    RESUME_HEADER.location,
    RESUME_HEADER.email,
    RESUME_HEADER.phone,
    RESUME_HEADER.portfolio,
    RESUME_HEADER.linkedin,
  ].join(" · ");

  return (
    <div data-resume-root="true">
      {/* Print-only stylesheet: scopes the page to the resume container
          for clean Cmd+P → Save as PDF output. Uses direct color overrides
          (not CSS vars) so dark-mode tokens applied to html/:root don't
          bleed through into the printed output via inline `color: var(...)`
          styles on descendants. */}
      <style>{`
        /* Always render the resume with light-theme tokens — independent of
           system preference, next-themes state, or Chrome headless defaults.
           The resume is a printable artifact, not a themed app surface. */
        [data-resume-root] {
          --color-bg: #ffffff;
          --color-fg: #1a1a1a;
          --color-fg-secondary: rgba(17, 17, 17, 0.7);
          --color-fg-tertiary: rgba(17, 17, 17, 0.5);
          --color-accent: ${NAME_COLOR};
          color-scheme: light;
        }
        @media print {
          @page { size: letter; margin: 0.4in; }
          /* Compact print sizing — fits the resume to a single letter page
             while preserving the generous on-screen reading layout. */
          [data-resume-root] h1 { font-size: 26px !important; line-height: 1.1 !important; }
          [data-resume-root] section { margin-top: 12px !important; }
          [data-resume-root] section > p:first-child { margin-bottom: 6px !important; }
          [data-resume-root] ul[class*="gap-10"] { gap: 10px !important; }
          [data-resume-root] ul[class*="gap-3"],
          [data-resume-root] ul[class*="gap-2"] { gap: 3px !important; }
          [data-resume-root] p, [data-resume-root] li { font-size: 12px !important; line-height: 16px !important; }
          [data-resume-root] header p { font-size: 11.5px !important; }
          [data-resume-root] [data-resume-meta] { font-size: 9.5px !important; }
          [data-resume-root] [data-resume-label] { font-size: 9.5px !important; }
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          html, body {
            background: #ffffff !important;
            color: #111111 !important;
            color-scheme: light !important;
          }
          body > *:not(:has([data-resume-root])) {
            display: none !important;
          }
          [data-resume-root] {
            max-width: 720px !important;
            margin: 0 auto !important;
            padding: 0 !important;
          }
          [data-resume-root] section { break-inside: avoid; }
          [data-resume-root] li { break-inside: avoid; }
          [data-resume-root] section:last-child { margin-bottom: 0 !important; }
          [data-resume-root] > *:last-child { margin-bottom: 0 !important; padding-bottom: 0 !important; }
          /* Force readable contrast on all text inside the resume,
             overriding any inline color: var(--color-fg-*) rules. */
          [data-resume-root],
          [data-resume-root] p,
          [data-resume-root] span,
          [data-resume-root] li {
            color: #111111 !important;
          }
          [data-resume-root] [data-resume-meta],
          [data-resume-root] [data-resume-label],
          [data-resume-root] [data-resume-soft] {
            color: rgba(17, 17, 17, 0.6) !important;
          }
          [data-resume-root] [data-resume-name] {
            color: ${NAME_COLOR} !important;
          }
          [data-print-hide] { display: none !important; }
        }
      `}</style>

      {/* Header */}
      <header>
        <h1 style={NAME_STYLE} data-resume-name>{RESUME_HEADER.name}</h1>
        <p style={TAGLINE_STYLE} data-resume-soft>{RESUME_HEADER.tagline}</p>
        <p style={CONTACT_STYLE} data-resume-meta>{contactLine}</p>
      </header>

      {/* Summary */}
      <Section label="Summary">
        <p style={BULLET_STYLE}>{RESUME_SUMMARY}</p>
      </Section>

      {/* Experience */}
      <Section label="Experience">
        <ul className="flex flex-col gap-10">
          {RESUME_EXPERIENCE.map((job) => (
            <li key={`${job.company}-${job.period}`}>
              <div className="flex items-baseline justify-between gap-4">
                <p style={COMPANY_STYLE}>{job.company}</p>
                <p style={META_STYLE} data-resume-meta>{job.period}</p>
              </div>
              <p style={{ ...TITLE_STYLE, marginTop: 2 }} data-resume-soft>
                {job.title}
                <span aria-hidden style={{ color: "var(--color-fg-tertiary)" }}>
                  {" · "}
                </span>
                <span style={{ color: "var(--color-fg-tertiary)" }}>
                  {job.location}
                </span>
              </p>
              <ul className="mt-3 flex flex-col gap-2 list-disc pl-4 marker:text-(--color-fg-tertiary)">
                {job.bullets.map((bullet, i) => (
                  <li key={i} style={BULLET_STYLE}>
                    {bullet
                      .replace(/<!-- chat:exclude -->/g, "")
                      .replace(/<!-- \/chat:exclude -->/g, "")}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </Section>

      {/* Tools */}
      <Section label="Tools">
        <p style={BULLET_STYLE}>{RESUME_TOOLS.join(" · ")}</p>
      </Section>

      {/* Education */}
      <Section label="Education">
        <div className="flex items-baseline justify-between gap-4">
          <p style={COMPANY_STYLE}>{RESUME_EDUCATION.school}</p>
          {"period" in RESUME_EDUCATION && RESUME_EDUCATION.period ? (
            <p style={META_STYLE} data-resume-meta>{RESUME_EDUCATION.period}</p>
          ) : null}
        </div>
        <p style={{ ...TITLE_STYLE, marginTop: 2 }} data-resume-soft>
          {RESUME_EDUCATION.degree}
        </p>
        {RESUME_EDUCATION.coursework ? (
          <p style={{ ...BULLET_STYLE, marginTop: 8 }}>
            <span
              style={{ color: "var(--color-fg-tertiary)" }}
              data-resume-soft
            >
              Relevant coursework:{" "}
            </span>
            {RESUME_EDUCATION.coursework}
          </p>
        ) : null}
      </Section>

      {/* Recognition */}
      <Section label="Recognition">
        <ul className="flex flex-col gap-2 list-disc pl-4 marker:text-(--color-fg-tertiary)">
          {RESUME_ACHIEVEMENTS.map((item) => (
            <li key={item.label} style={BULLET_STYLE}>
              <span style={{ color: "var(--color-fg)", fontWeight: 500 }}>
                {item.label}
              </span>
              <span
                style={{ color: "var(--color-fg-tertiary)" }}
                data-resume-soft
              >
                {" — "}
              </span>
              <span>{item.description}</span>
            </li>
          ))}
        </ul>
      </Section>
    </div>
  );
}

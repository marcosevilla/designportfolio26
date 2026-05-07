"use client";

import {
  RESUME_EXPERIENCE,
  RESUME_EDUCATION,
  RESUME_ACHIEVEMENTS,
} from "@/lib/resume-content";

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
      <p style={SECTION_LABEL_STYLE}>{label}</p>
      {children}
    </section>
  );
}

export default function Resume() {
  return (
    <div>
      {/* Experience */}
      <Section label="Experience">
        <ul className="flex flex-col gap-10">
          {RESUME_EXPERIENCE.map((job) => (
            <li key={`${job.company}-${job.period}`}>
              <div className="flex items-baseline justify-between gap-4">
                <p style={COMPANY_STYLE}>{job.company}</p>
                <p style={META_STYLE}>{job.period}</p>
              </div>
              <p style={{ ...TITLE_STYLE, marginTop: 2 }}>
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

      {/* Education */}
      <Section label="Education">
        <div className="flex items-baseline justify-between gap-4">
          <p style={COMPANY_STYLE}>{RESUME_EDUCATION.school}</p>
        </div>
        <p style={{ ...TITLE_STYLE, marginTop: 2 }}>{RESUME_EDUCATION.degree}</p>
        <p style={{ ...BULLET_STYLE, marginTop: 8 }}>
          <span style={{ color: "var(--color-fg-tertiary)" }}>
            Relevant coursework:{" "}
          </span>
          {RESUME_EDUCATION.coursework}
        </p>
      </Section>

      {/* Achievements */}
      <Section label="Achievements">
        <ul className="flex flex-col gap-3">
          {RESUME_ACHIEVEMENTS.map((item) => (
            <li
              key={item.label}
              className="flex items-baseline gap-4"
              style={BULLET_STYLE}
            >
              <span style={{ ...COMPANY_STYLE, flex: "0 0 auto", minWidth: "120px" }}>
                {item.label}
              </span>
              <span>{item.description}</span>
            </li>
          ))}
        </ul>
      </Section>
    </div>
  );
}

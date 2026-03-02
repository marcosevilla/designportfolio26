"use client";

import { Dithering } from "@paper-design/shaders-react";
import { useDialKit } from "dialkit";

export default function Teaser() {
  const dials = useDialKit("Dither Teaser", {
    // Shader
    speed: [0.25, 0, 2],
    size: [4, 1, 16],
    scale: [1, 0.1, 4],
    shaderOpacity: [1, 0, 1],
    // Color — front (dither)
    colorHue: [30, 0, 360],
    colorSat: [75, 0, 100],
    colorLight: [42, 0, 100],
    // Color — back (dither second tone)
    backOpacity: [0, 0, 1],
    backHue: [30, 0, 360],
    backSat: [40, 0, 100],
    backLight: [70, 0, 100],
    // Color — background (canvas)
    bgHue: [30, 0, 360],
    bgSat: [30, 0, 100],
    bgLight: [95, 50, 100],
    // Typography
    nameSizePx: [48, 20, 80],
    taglineSizePx: [16, 10, 24],
    nameTracking: [-0.02, -0.06, 0.04],
    textOpacity: [1, 0, 1],
    // Layout
    verticalOffset: [-5, -30, 30],
    nameTaglineGap: [16, 0, 48],
    taglineIconsGap: [32, 8, 64],
    iconSize: [20, 12, 32],
    iconOpacity: [0.45, 0, 1],
  });

  const colorFront = `hsl(${dials.colorHue}, ${dials.colorSat}%, ${dials.colorLight}%)`;
  const colorBack = `hsla(${dials.backHue}, ${dials.backSat}%, ${dials.backLight}%, ${dials.backOpacity})`;
  const bgColor = `hsl(${dials.bgHue}, ${dials.bgSat}%, ${dials.bgLight}%)`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Full-screen dither background */}
      <Dithering
        speed={dials.speed}
        shape="warp"
        type="4x4"
        size={dials.size}
        scale={dials.scale}
        colorBack={colorBack}
        colorFront={colorFront}
        style={{
          backgroundColor: bgColor,
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          opacity: dials.shaderOpacity,
        }}
      />

      {/* Content overlay */}
      <div
        className="relative z-10 flex flex-col items-center text-center px-6"
        style={{ transform: `translateY(${dials.verticalOffset}%)` }}
      >
        <h1
          style={{
            fontFamily: "'Departure Mono', var(--font-mono), monospace",
            fontSize: `${dials.nameSizePx}px`,
            fontWeight: 400,
            color: `rgba(26, 26, 26, ${dials.textOpacity})`,
            letterSpacing: `${dials.nameTracking}em`,
            lineHeight: 1.1,
          }}
        >
          Marco Sevilla
        </h1>
        <p
          style={{
            fontFamily: "var(--font-body), system-ui, sans-serif",
            fontSize: `${dials.taglineSizePx}px`,
            color: `rgba(26, 26, 26, ${dials.textOpacity * 0.6})`,
            lineHeight: 1.5,
            marginTop: `${dials.nameTaglineGap}px`,
          }}
        >
          Product Designer &mdash; portfolio coming soon
        </p>

        {/* Links */}
        <div
          className="flex items-center"
          style={{ gap: `${dials.iconSize}px`, marginTop: `${dials.taglineIconsGap}px` }}
        >
          <a
            href="mailto:marco@marcosevilla.com"
            aria-label="Email"
            className="transition-colors duration-200"
            style={{ color: `rgba(17, 17, 17, ${dials.iconOpacity})` }}
            onMouseEnter={(e) => (e.currentTarget.style.color = colorFront)}
            onMouseLeave={(e) =>
              (e.currentTarget.style.color = `rgba(17, 17, 17, ${dials.iconOpacity})`)
            }
          >
            <svg
              width={dials.iconSize}
              height={dials.iconSize}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <path d="M22 7l-10 6L2 7" />
            </svg>
          </a>
          <a
            href="https://linkedin.com/in/marcosevilla"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn"
            className="transition-colors duration-200"
            style={{ color: `rgba(17, 17, 17, ${dials.iconOpacity})` }}
            onMouseEnter={(e) => (e.currentTarget.style.color = colorFront)}
            onMouseLeave={(e) =>
              (e.currentTarget.style.color = `rgba(17, 17, 17, ${dials.iconOpacity})`)
            }
          >
            <svg
              width={dials.iconSize}
              height={dials.iconSize}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-4 0v7h-4v-7a6 6 0 016-6z" />
              <rect x="2" y="9" width="4" height="12" />
              <circle cx="4" cy="4" r="2" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
}

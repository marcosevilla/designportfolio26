"use client";

import Image from "next/image";
import BrowserMockup from "./BrowserMockup";

export default function FBCardPreview() {
  const dashX = 30;
  const dashY = 26;
  const dashHoverX = 10;
  const dashHoverY = 30;
  const dashTransitionMs = 1280;
  const dashPadding = 37;
  const phoneLeft = 3;
  const phoneBottom = -32;
  const phoneWidth = 28;
  const phoneHoverY = -27;
  const phoneOpacity = 1;
  const phoneHoverOpacity = 1;
  const tintStrength = 0;
  const crossfadeMs = 330;

  return (
    <>
      {/* Solid accent background — visible on hover */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
        style={{ backgroundColor: `color-mix(in oklch, var(--color-accent) ${tintStrength}%, transparent)` }}
      />

      {/* Screenshot container */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="fb-preview-slider w-full h-full flex items-center justify-center"
          style={{
            transform: `translate(${dashX}%, ${dashY}%)`,
            transition: `transform ${dashTransitionMs}ms cubic-bezier(0.22, 1, 0.36, 1)`,
            padding: `0 ${dashPadding}px`,
          }}
        >
          <div className="w-full relative">
            {/* Default state: table only (no side sheet) */}
            <div
              className="group-hover:opacity-0 transition-opacity"
              style={{ transitionDuration: `${crossfadeMs}ms` }}
            >
              <BrowserMockup
                src="/images/fb-ordering/fb-ordering-table.png"
                alt="F&B ordering dashboard — table view"
                url="app.canarytech.net/fb-orders"
                width={1344}
                height={786}
              />
            </div>

            {/* Hover state: table + side sheet */}
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ transitionDuration: `${crossfadeMs}ms` }}
            >
              <BrowserMockup
                src="/images/fb-ordering/fb-ordering-dashboard.png"
                alt="F&B ordering dashboard — order detail side sheet open"
                url="app.canarytech.net/fb-orders"
                width={1344}
                height={787}
              />
            </div>
          </div>
        </div>

        {/* Mobile phone mock */}
        <div
          className="fb-phone-mock absolute"
          style={{
            left: `${phoneLeft}%`,
            bottom: `${phoneBottom}%`,
            width: `${phoneWidth}%`,
            transform: "translateY(0px)",
            transition: `transform ${dashTransitionMs}ms cubic-bezier(0.22, 1, 0.36, 1), opacity ${crossfadeMs}ms ease`,
            opacity: phoneOpacity,
            zIndex: 10,
          }}
        >
          <Image
            src="/images/fb-ordering/fb-browse-menu.png"
            alt="F&B mobile ordering — browse menu"
            width={924}
            height={1928}
            style={{ width: "100%", height: "auto", display: "block" }}
            quality={85}
          />
        </div>
      </div>

      {/* Hover transforms via CSS (Tailwind can't do inline transforms on group-hover) */}
      <style>{`
        .group:hover .fb-preview-slider {
          transform: translate(${dashHoverX}%, ${dashHoverY}%) !important;
        }
        .group:hover .fb-phone-mock {
          transform: translateY(${phoneHoverY}px) !important;
          opacity: ${phoneHoverOpacity} !important;
        }
      `}</style>
    </>
  );
}

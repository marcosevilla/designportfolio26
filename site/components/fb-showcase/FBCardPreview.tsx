"use client";

import Image from "next/image";
import BrowserMockup from "./BrowserMockup";

export default function FBCardPreview() {
  return (
    <>
      {/* Solid accent background — visible on hover */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
        style={{ backgroundColor: "color-mix(in oklch, var(--color-accent) 12%, transparent)" }}
      />

      {/* Screenshot container */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/*
          Default: pushed to bottom-right via translate(24%, 28%)
          Hover: slides to center via translate(2%, 8%) with longer, smoother duration
        */}
        <div
          className="fb-preview-slider w-full h-full flex items-center justify-center"
          style={{
            transform: "translate(20%, 24%)",
            transition: "transform 700ms cubic-bezier(0.22, 1, 0.36, 1)",
            padding: "0 20px",
          }}
        >
          {/* Use a group-hover override via a wrapper that reads group state */}
          <div className="w-full relative">
            {/* Default state: table only (no side sheet) */}
            <div className="group-hover:opacity-0 transition-opacity duration-500">
              <BrowserMockup
                src="/images/fb-ordering/fb-ordering-table.png"
                alt="F&B ordering dashboard — table view"
                url="app.canarytech.net/fb-orders"
                width={1344}
                height={786}
              />
            </div>

            {/* Hover state: table + side sheet */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
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

        {/* Mobile phone mock — positioned bottom-left, slides up on hover */}
        <div
          className="fb-phone-mock absolute"
          style={{
            left: "4%",
            bottom: "-15%",
            width: "18%",
            transform: "translateY(0px)",
            transition: "transform 700ms cubic-bezier(0.22, 1, 0.36, 1), opacity 500ms ease",
            opacity: 0.6,
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

      {/* Tailwind can't transition inline transforms via group-hover, so use a style tag */}
      <style>{`
        .group:hover .fb-preview-slider {
          transform: translate(6%, 14%) !important;
        }
        .group:hover .fb-phone-mock {
          transform: translateY(-35px) !important;
          opacity: 1 !important;
        }
      `}</style>
    </>
  );
}

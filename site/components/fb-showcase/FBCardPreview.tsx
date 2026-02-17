"use client";

import BrowserMockup from "./BrowserMockup";

export default function FBCardPreview() {
  return (
    <>
      {/* Mesh gradient background — visible on hover */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
        style={{
          background: `
            radial-gradient(ellipse 120% 100% at 10% 20%, color-mix(in oklch, var(--color-accent) 30%, transparent), transparent 70%),
            radial-gradient(ellipse 100% 120% at 90% 80%, color-mix(in oklch, var(--color-accent) 20%, #3D63DD 15%), transparent 65%),
            radial-gradient(ellipse 80% 80% at 50% 50%, color-mix(in oklch, var(--color-accent) 15%, #F16682 10%), transparent 70%)
          `,
          filter: "blur(60px) saturate(1.1)",
        }}
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
            transform: "translate(30%, 40%)",
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
      </div>

      {/* Tailwind can't transition inline transforms via group-hover, so use a hidden checkbox trick —
           instead, apply the hover transform via a style tag scoped to this component */}
      <style>{`
        .group:hover .fb-preview-slider {
          transform: translate(4%, 30%) !important;
        }
      `}</style>
    </>
  );
}

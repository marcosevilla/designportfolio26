"use client";

import Image from "next/image";

interface BrowserMockupProps {
  src: string;
  alt: string;
  url?: string;
  width: number;
  height: number;
}

export default function BrowserMockup({ src, alt, url, width, height }: BrowserMockupProps) {
  return (
    <div
      className="overflow-hidden"
      style={{
        backgroundColor: "var(--color-surface, #fff)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.08)",
      }}
    >
      {/* Title bar */}
      <div
        className="flex items-center gap-2 px-3 py-1.5"
        style={{
          backgroundColor: "var(--color-surface, #fff)",
          borderBottom: "1px solid var(--color-border, #e6e6e6)",
        }}
      >
        {/* Traffic lights */}
        <div className="flex gap-1.5 shrink-0">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: "#FF5F57" }} />
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: "#FEBC2E" }} />
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: "#28C840" }} />
        </div>

        {/* URL bar */}
        {url && (
          <div
            className="flex-1 flex items-center justify-center mx-8"
          >
            <div
              className="px-3 py-0.5 rounded-md text-center w-full max-w-[280px]"
              style={{
                backgroundColor: "var(--color-muted, #f3f3f3)",
                fontFamily: "var(--font-mono)",
                fontSize: "10px",
                color: "var(--color-fg-tertiary)",
                letterSpacing: "0.01em",
              }}
            >
              {url}
            </div>
          </div>
        )}
      </div>

      {/* Screenshot content */}
      <div className="relative" style={{ backgroundColor: "var(--color-surface, #fff)" }}>
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          style={{ display: "block", width: "100%", height: "auto", borderRadius: 0 }}
          quality={90}
        />
      </div>
    </div>
  );
}

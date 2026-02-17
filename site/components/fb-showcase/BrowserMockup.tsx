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
        className="flex items-center gap-2 px-3.5 py-2.5"
        style={{
          backgroundColor: "var(--color-surface, #fff)",
          borderBottom: "1px solid var(--color-border, #e6e6e6)",
        }}
      >
        {/* Traffic lights */}
        <div className="flex gap-1.5 shrink-0">
          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "#FF5F57" }} />
          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "#FEBC2E" }} />
          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "#28C840" }} />
        </div>

        {/* URL bar */}
        {url && (
          <div
            className="flex-1 flex items-center justify-center mx-8"
          >
            <div
              className="px-3 py-1 rounded-md text-center w-full max-w-[280px]"
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
      <div className="relative">
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          style={{ display: "block", width: "100%", height: "auto" }}
          quality={90}
        />
      </div>
    </div>
  );
}

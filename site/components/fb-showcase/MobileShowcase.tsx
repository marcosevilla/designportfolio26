"use client";

import Image from "next/image";
import { typescale } from "@/lib/typography";

interface MobileScreen {
  src: string;
  alt: string;
  label: string;
  width: number;
  height: number;
}

const SCREENS: MobileScreen[] = [
  {
    src: "/images/fb-ordering/fb-landing-page.png",
    alt: "Ordering outlet landing page — in-room dining",
    label: "Landing page",
    width: 924,
    height: 1928,
  },
  {
    src: "/images/fb-ordering/fb-browse-menu.png",
    alt: "Browse menu — breakfast items and categories",
    label: "Browse menu",
    width: 924,
    height: 1928,
  },
  {
    src: "/images/fb-ordering/fb-item-detail.png",
    alt: "Item detail — customization and modifiers",
    label: "Item detail",
    width: 924,
    height: 1928,
  },
  {
    src: "/images/fb-ordering/fb-cart-review.png",
    alt: "Cart review — order summary before submission",
    label: "Cart review",
    width: 924,
    height: 1928,
  },
];

/** Percentage of each phone's width that overlaps the previous one */
const OVERLAP_PCT = 12;

function PhoneFrame({ screen }: { screen: MobileScreen }) {
  return (
    <div className="flex flex-col items-start">
      <span
        className="mb-2 text-[var(--color-fg-tertiary)]"
        style={{ ...typescale.label, marginLeft: "3.5%" }}
      >
        {screen.label}
      </span>
      <Image
        src={screen.src}
        alt={screen.alt}
        width={screen.width}
        height={screen.height}
        style={{ width: "100%", height: "auto", display: "block" }}
        quality={90}
      />
    </div>
  );
}

export default function MobileShowcase() {
  // With 4 items and N-1 overlaps, effective width per item:
  // totalWidth = 4w - 3 * overlap => w = totalWidth / (4 - 3 * overlap/100)
  // As a percentage of container: each item = 100 / (N - (N-1) * overlap/100)
  const n = SCREENS.length;
  const itemWidth = 100 / (n - (n - 1) * (OVERLAP_PCT / 100));

  return (
    <div className="flex items-start">
      {SCREENS.map((screen, i) => (
        <div
          key={i}
          className="relative shrink-0"
          style={{
            width: `${itemWidth}%`,
            marginLeft: i > 0 ? `${-itemWidth * (OVERLAP_PCT / 100)}%` : undefined,
            zIndex: i,
          }}
        >
          <PhoneFrame screen={screen} />
        </div>
      ))}
    </div>
  );
}

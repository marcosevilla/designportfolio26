"use client";

import { DialRoot } from "dialkit";
import "dialkit/styles.css";

/**
 * Dev-only mount for DialKit's control panel.
 * Wrapped in a client component so it can be conditionally included from the
 * server layout (which would otherwise complain about importing a CSS file
 * from a non-client module in some Next.js setups).
 */
export default function DialKitMount() {
  return <DialRoot position="top-right" />;
}

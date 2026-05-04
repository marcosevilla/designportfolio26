"use client";

// The dedicated /play routes (the index here + each per-card
// subpage) were removed for now; the homepage's playground section
// is the single source of truth for these experiments. This page
// exists only so any inbound link to /play lands somewhere — it
// client-side redirects to the home page's playground section.

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function PlayRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/#playground");
  }, [router]);
  return (
    <noscript>
      <p style={{ padding: "2rem", fontFamily: "var(--font-sans)" }}>
        The Play page has moved. <Link href="/#playground">Return to home</Link>.
      </p>
    </noscript>
  );
}

"use client";

// The dedicated /work routes (the index here + each per-study
// subpage) were removed for now; the homepage is the single source
// of truth for project surfacing. This page exists only so any
// inbound link to /work lands somewhere — it client-side redirects
// to the home page's projects section.

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function WorkRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/#projects");
  }, [router]);
  return (
    <noscript>
      <p style={{ padding: "2rem", fontFamily: "var(--font-sans)" }}>
        The Work page has moved. <Link href="/#projects">Return to home</Link>.
      </p>
    </noscript>
  );
}

"use client";

import { ThemeProvider } from "next-themes";

// Force light theme on /resume so the printed PDF renders with
// light-mode tokens regardless of the visitor's system preference
// or any cached theme on marcosevilla.com.
export default function ResumeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider attribute="class" forcedTheme="light">
      {children}
    </ThemeProvider>
  );
}

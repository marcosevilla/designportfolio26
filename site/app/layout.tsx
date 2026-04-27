import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import { GeistSans } from "geist/font/sans";
import MobileNav from "@/components/MobileNav";
import { MarqueeProvider } from "@/components/MarqueeContext";
import { SidebarProvider } from "@/lib/SidebarContext";
import ViewportFade from "@/components/ViewportFade";
import StickyFooter from "@/components/StickyFooter";
import { InlineEditorProvider } from "@/lib/InlineEditorContext";
import FloatingToolbar from "@/components/dev/FloatingToolbar";
import EditableOverlay from "@/components/dev/EditableOverlay";
import SectionReorder from "@/components/dev/SectionReorder";
import DialKitMount from "@/components/dev/DialKitMount";
import { Agentation } from "agentation";
import "./globals.css";

export const metadata: Metadata = {
  title: "Marco Sevilla — Product Designer",
  description:
    "Product Designer crafting revenue-driving experiences in hospitality technology. Currently at Canary Technologies, designing platforms for Marriott, Wyndham, Best Western, and IHG.",
  metadataBase: new URL("https://marcosevilla.com"),
  openGraph: {
    title: "Marco Sevilla — Product Designer",
    description:
      "Product Designer crafting revenue-driving experiences in hospitality technology. Currently at Canary Technologies, designing platforms for Marriott, Wyndham, Best Western, and IHG.",
    url: "https://marcosevilla.com",
    siteName: "Marco Sevilla",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Marco Sevilla — Product Designer",
    description:
      "Product Designer crafting revenue-driving experiences in hospitality technology.",
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "https://marcosevilla.com",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={GeistSans.variable}>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <MarqueeProvider>
            <SidebarProvider>
              <a href="#main" className="skip-to-content">
                Skip to content
              </a>
              <MobileNav />
              <InlineEditorProvider>
                <main
                  id="main"
                  className="max-w-[960px] mx-auto pb-20 px-4 sm:px-8 lg:px-6"
                >
                  {children}
                </main>
                {process.env.NODE_ENV === "development" && (
                  <>
                    <EditableOverlay />
                    <SectionReorder />
                    <FloatingToolbar />
                  </>
                )}
              </InlineEditorProvider>
              <StickyFooter />
              <ViewportFade />
              {process.env.NODE_ENV === "development" && <Agentation />}
              {process.env.NODE_ENV === "development" && <DialKitMount />}
            </SidebarProvider>
          </MarqueeProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

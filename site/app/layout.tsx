import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import { GeistSans } from "geist/font/sans";
import { GeistPixelSquare } from "geist/font/pixel";
import { Instrument_Serif, Instrument_Sans } from "next/font/google";
import MobileNav from "@/components/MobileNav";
import { MarqueeProvider } from "@/components/MarqueeContext";
import { SidebarProvider } from "@/lib/SidebarContext";
import ViewportFade from "@/components/ViewportFade";
import StickyFooter from "@/components/StickyFooter";
import { InlineEditorProvider } from "@/lib/InlineEditorContext";
import FloatingToolbar from "@/components/dev/FloatingToolbar";
import EditableOverlay from "@/components/dev/EditableOverlay";
import SectionReorder from "@/components/dev/SectionReorder";
import { Agentation } from "agentation";
import "./globals.css";

export const metadata: Metadata = {
  title: "Marco Sevilla — Product Designer",
  description:
    "Product Designer crafting revenue-driving experiences in hospitality technology.",
  openGraph: {
    title: "Marco Sevilla — Product Designer",
    description:
      "Product Designer crafting revenue-driving experiences in hospitality technology.",
    type: "website",
  },
};

const instrumentSerif = Instrument_Serif({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-instrument-serif",
});

const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-instrument-sans",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={`${GeistSans.variable} ${GeistPixelSquare.variable} ${instrumentSerif.variable} ${instrumentSans.variable}`}>
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
                  className="max-w-[960px] mx-auto pt-24 lg:pt-[18vh] pb-20 px-4 sm:px-8 lg:px-6"
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
            </SidebarProvider>
          </MarqueeProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

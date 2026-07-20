import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Fraunces, Libre_Baskerville } from "next/font/google";

const fraunces = Fraunces({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-fraunces",
  display: "swap",
});

const libreBaskerville = Libre_Baskerville({
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
  variable: "--font-baskerville",
  display: "swap",
});
import MobileNav from "@/components/MobileNav";
import { SidebarProvider } from "@/lib/SidebarContext";
import ViewportFade from "@/components/ViewportFade";
import { InlineEditorProvider } from "@/lib/InlineEditorContext";
import FloatingToolbar from "@/components/dev/FloatingToolbar";
import EditableOverlay from "@/components/dev/EditableOverlay";
import SectionReorder from "@/components/dev/SectionReorder";
import { Agentation } from "agentation";
import { AudioPlayerProvider } from "@/lib/AudioPlayerContext";
import { VisualizerSceneProvider } from "@/lib/VisualizerSceneContext";
import { ThemeStateProvider } from "@/components/ThemeToggle";
import MusicMiniWidget from "@/components/music/MusicMiniWidget";
import ChatFab from "@/components/ChatFab";
import CustomCursor from "@/components/CustomCursor";
import { PasswordGateProvider } from "@/lib/PasswordGateContext";
import PasswordModal from "@/components/PasswordModal";
import ChatBar from "@/components/chat/ChatBar";
import { NavOverlayProvider } from "@/lib/NavOverlayContext";
import { ChatOverlayProvider } from "@/lib/ChatOverlayContext";
import ChangelogOverlay from "@/components/ChangelogOverlay";
import { ChangelogOverlayProvider } from "@/lib/ChangelogOverlayContext";
import { getChangelog } from "@/lib/changelog";
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
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={`${GeistSans.variable} ${GeistMono.variable} ${fraunces.variable} ${libreBaskerville.variable}`}>
      <body>
        {/* defaultTheme="light" (not "system"): ThemeStateProvider forces
            first visits to light anyway, so "system" only produced a dark
            paint that snapped to light on hydration for dark-OS visitors. */}
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <ThemeStateProvider>
          <AudioPlayerProvider>
          <VisualizerSceneProvider>
            <SidebarProvider>
              <PasswordGateProvider>
                <NavOverlayProvider>
                <ChatOverlayProvider>
                <ChangelogOverlayProvider>
                <a href="#main" className="skip-to-content">
                  Skip to content
                </a>
                <MobileNav />
                {/* SiteHeader unmounted 2026-07-20 — the fixed top bar is
                    gone site-wide; time/weather + theme controls moved
                    beside the homepage h1 (HomeLayout). Component kept
                    for salvage at components/SiteHeader.tsx. */}
                <InlineEditorProvider>
                  {/* No width cap here — each page owns its measure. Case
                      studies use the editorial grid canvas (CaseStudyShell),
                      home/writing set their own max-w. */}
                  <main
                    id="main"
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
                <ViewportFade />
                {/* Floating dock — chat FAB + music dock share the
                    bottom-right corner; items-end keeps the chat button
                    bottom-aligned when the music panel expands.
                    .floating-dock shifts it left of the chat side panel
                    at lg+ when chat is open (globals.css). */}
                <div className="floating-dock fixed bottom-4 right-4 z-[60] flex items-end gap-3">
                  <ChatFab />
                  <MusicMiniWidget />
                </div>
                <ChatBar />
                <CustomCursor />
                <ChangelogOverlay groups={getChangelog()} />
                <PasswordModal />
                {process.env.NODE_ENV === "development" && <Agentation />}
                </ChangelogOverlayProvider>
                </ChatOverlayProvider>
                </NavOverlayProvider>
              </PasswordGateProvider>
            </SidebarProvider>
          </VisualizerSceneProvider>
          </AudioPlayerProvider>
          </ThemeStateProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

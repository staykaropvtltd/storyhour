import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { AudioProvider } from "@/context/AudioContext";
import { LibraryCartProvider } from "@/context/LibraryCartContext";
import SmoothScrollProvider from "@/components/layout/SmoothScrollProvider";
import SearchModal from "@/components/SearchModal";
import CartDrawer from "@/components/CartDrawer";
import Toast from "@/components/Toast";
import AgentationProvider from "@/components/AgentationProvider";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: "StoryHour — The Magical Storytelling Platform for Kids & Families",
  description: "Discover Indian mythology, culture, and history through soulful audiobooks, live puppet storytelling, and screen-free calm bedtimes. In Hindi, English & Telugu.",
  openGraph: {
    title: "StoryHour — Stories That Live Beyond Time",
    description: "Bringing Indian mythology, culture, and history to life through soulful audiobooks and puppet storytelling.",
    url: "https://storyhour.co.uk",
    siteName: "StoryHour",
    images: [
      {
        url: "https://storyhour.co.uk/wp-content/uploads/2026/01/WhatsApp-Image-2026-01-19-at-17.28.53.jpeg",
        width: 1200,
        height: 630,
        alt: "StoryHour Epic Storytelling",
      },
    ],
    locale: "en_GB",
    type: "website",
  },
  icons: {
    icon: "https://storyhour.co.uk/wp-content/uploads/2026/01/tp-logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={plusJakarta.variable}>
      <body className={`${plusJakarta.className} bg-[#FAF8F3] text-[#0f0f0f] antialiased selection:bg-[#C9281D] selection:text-white min-h-screen flex flex-col overflow-x-hidden font-sans`}>
        <SmoothScrollProvider>
          <AudioProvider>
            <LibraryCartProvider>
              {children}
              <SearchModal />
              <CartDrawer />
              <Toast />
              <AgentationProvider />
            </LibraryCartProvider>
          </AudioProvider>
        </SmoothScrollProvider>
      </body>
    </html>
  );
}

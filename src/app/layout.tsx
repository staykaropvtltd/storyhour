import type { Metadata } from "next";
import "./globals.css";
import { AudioProvider } from "@/context/AudioContext";
import { LibraryCartProvider } from "@/context/LibraryCartContext";
import SearchModal from "@/components/SearchModal";
import CartDrawer from "@/components/CartDrawer";
import Toast from "@/components/Toast";
import { SmoothCursor } from "@/components/ui/smooth-cursor";

export const metadata: Metadata = {
  title: "StoryHour — Digital Storytelling Platform for Children, Families & Parents",
  description: "Discover, listen to, and explore Indian mythology, culture, history, audiobooks, skits, and puppet storytelling crafted across generations.",
  openGraph: {
    title: "StoryHour — Stories That Live Beyond Time",
    description: "Bringing Indian mythology, culture, and history to life through soulful audiobooks, skits, and puppet storytelling.",
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
    <html lang="en">
      <body className="bg-[#F7F4EE] text-[#120A45] antialiased selection:bg-story-blue selection:text-white min-h-screen flex flex-col font-sans overflow-x-hidden">
        <AudioProvider>
          <LibraryCartProvider>
            <SmoothCursor />
            {children}
            <SearchModal />
            <CartDrawer />
            <Toast />
          </LibraryCartProvider>
        </AudioProvider>
      </body>
    </html>
  );
}

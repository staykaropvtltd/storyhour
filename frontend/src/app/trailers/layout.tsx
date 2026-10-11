import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Trailers & Theatrical Productions | StoryHour",
  description:
    "Watch theatrical trailers, puppet demonstrations, and multimedia previews of StoryHour's Valmiki Ramayana, Hanuman, and cultural epics.",
  alternates: {
    canonical: "/trailers",
  },
  openGraph: {
    title: "Trailers & Theatrical Productions | StoryHour",
    description:
      "Watch theatrical trailers, puppet demonstrations, and multimedia previews of StoryHour's productions.",
    url: "https://storyhour.co.uk/trailers",
  },
};

export default function TrailersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

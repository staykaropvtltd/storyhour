import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Our Master Storytellers & Heritage | StoryHour",
  description:
    "Meet our ensemble of vocal performers, puppeteers, and cultural educators bringing ancient epics and mythological heritage to children and families across the UK and India.",
  alternates: {
    canonical: "/storytellers",
  },
  openGraph: {
    title: "About Our Master Storytellers & Heritage | StoryHour",
    description:
      "Meet our ensemble of vocal performers, puppeteers, and cultural educators bringing ancient epics to life.",
    url: "https://storyhour.co.uk/storytellers",
  },
};

export default function StorytellersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

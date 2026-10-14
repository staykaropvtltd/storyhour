import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | StoryHour",
  description:
    "Review StoryHour's terms of service, consumer rights, digital licensing terms, and educational guidelines.",
  alternates: {
    canonical: "/terms",
  },
};

export default function TermsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

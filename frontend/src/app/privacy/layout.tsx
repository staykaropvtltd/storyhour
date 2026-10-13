import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy & Child Safety | StoryHour",
  description:
    "Learn how StoryHour protects user privacy in compliance with UK GDPR and the ICO Age Appropriate Design Code.",
  alternates: {
    canonical: "/privacy",
  },
};

export default function PrivacyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

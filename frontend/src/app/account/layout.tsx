import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Reader Library & Account | StoryHour",
  description:
    "Manage your reader profile, view unlocked editions, listen to purchased audiobooks, and track digital receipts.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

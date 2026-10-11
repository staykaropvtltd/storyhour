import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Your Shopping Bag | StoryHour",
  description:
    "Review your selected StoryHour collector's editions and audiobooks before proceeding to secure checkout.",
  alternates: {
    canonical: "/cart",
  },
};

export default function CartLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

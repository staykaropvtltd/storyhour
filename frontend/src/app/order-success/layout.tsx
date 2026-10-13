import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Order Confirmation | StoryHour",
  description:
    "Thank you for your purchase. Your StoryHour collector's editions and audiobooks are unlocked in your digital library.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function OrderSuccessLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

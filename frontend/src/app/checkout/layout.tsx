import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Secure Digital Checkout | StoryHour",
  description:
    "Complete your StoryHour digital purchase with instant library unlocking and parental guidance compliance.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

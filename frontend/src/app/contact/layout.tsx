import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us & School Workshops | StoryHour",
  description:
    "Get in touch with the StoryHour faculty for inquiries, school workshop residencies, parent support, and cultural education programs.",
  alternates: {
    canonical: "/contact",
  },
  openGraph: {
    title: "Contact Us & School Workshops | StoryHour",
    description:
      "Get in touch with the StoryHour faculty for inquiries, school workshops, and parent support.",
    url: "https://storyhour.co.uk/contact",
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

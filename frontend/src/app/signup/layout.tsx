import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create a Reader Account | StoryHour",
  description:
    "Join StoryHour to unlock Indian mythological epics, fables, and screen-free audiobooks for your family.",
  alternates: {
    canonical: "/signup",
  },
};

export default function SignupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

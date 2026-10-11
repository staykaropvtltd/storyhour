import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In to Your Library | StoryHour",
  description:
    "Sign in to your StoryHour reader account to access your digital editions and offline audiobooks.",
  alternates: {
    canonical: "/login",
  },
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

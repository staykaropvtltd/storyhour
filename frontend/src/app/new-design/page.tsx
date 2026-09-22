import React from "react";
import PapumbaHeader from "@/components/new-design/PapumbaHeader";
import PapumbaHero from "@/components/new-design/PapumbaHero";
import PapumbaFooter from "@/components/new-design/PapumbaFooter";
import ScrollStorytellingSection from "@/components/new-design/ScrollStorytellingSection";

export const metadata = {
  title: "StoryHour — The Magic Storytelling World for Kids",
  description: "Experience authentic Indian storytelling, heroic epics, and calm bedtime audiobooks. Designed for families and children.",
};

export default function NewDesignPage() {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-white text-[#0f0f0f] antialiased selection:bg-[#C9281D] selection:text-white">
      {/* 1. Papumba-Inspired Header */}
      <PapumbaHeader />

      {/* 2. Main Content Stream */}
      <main className="flex-1 w-full">
        {/* 2.1 New Papumba-Inspired Hero */}
        <PapumbaHero />

        {/* 2.2 Full-Screen Scroll-Driven Storytelling Section */}
        <ScrollStorytellingSection />
      </main>

      {/* 3. Papumba-Inspired Footer */}
      <PapumbaFooter />
    </div>
  );
}

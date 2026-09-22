import React from "react";
import PapumbaHeader from "@/components/new-design/PapumbaHeader";
import PapumbaHero from "@/components/new-design/PapumbaHero";
import PapumbaFooter from "@/components/new-design/PapumbaFooter";
import ScrollStorytellingSection from "@/components/new-design/ScrollStorytellingSection";
import TheatreCurtainSection from "@/components/new-design/TheatreCurtainSection";
import WhyStoryHourSection from "@/components/new-design/WhyStoryHourSection";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-white text-[#0f0f0f] antialiased selection:bg-[#C9281D] selection:text-white">
      {/* 1. Papumba-Inspired Header (Logo | Center Pill Menu | Pill CTA) */}
      <PapumbaHeader />

      {/* 2. Main Content Stream */}
      <main className="flex-1 w-full">
        {/* 2.1 Papumba-Inspired Hero */}
        <PapumbaHero />

        {/* 2.2 Full-Screen Scroll-Driven Storytelling Section (400vh pinned stage with 4 Indian storytelling states) */}
        <ScrollStorytellingSection />

        {/* 2.3 Theatre Curtain Transition → StoryHour Book Collection */}
        <TheatreCurtainSection />

        {/* 2.4 Why StoryHourGlobal? Section (Stories Told with Heart & Heritage) */}
        <WhyStoryHourSection />
      </main>

      {/* 3. Papumba-Inspired Footer (Multi-Column Layout, Authentic StoryHour Content & Legal Links) */}
      <PapumbaFooter />
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import RollingList, { TrailerItem } from "@/components/ui/rolling-list";
import { MagneticText } from "@/components/ui/morphing-cursor";

const TRAILERS: TrailerItem[] = [
  {
    id: 1,
    title: "RAMAYANA",
    category: "SIGNATURE AUDIOBOOK",
    language: "ENGLISH",
    src: "https://storyhour.co.uk/wp-content/uploads/2026/01/WhatsApp-Image-2026-01-19-at-17.28.53.jpeg",
    alt: "Ramayana — An Ancient Indian Epic (English Audiobook)",
    description:
      "An immersive English narration of the Ramayana, designed to make the epic accessible to listeners of all ages.",
    videoUrl: "4up2VdHiO5I",
  },
  {
    id: 2,
    title: "RAMAYAN",
    category: "HINDI AUDIOBOOK",
    language: "HINDI",
    src: "https://storyhour.co.uk/wp-content/uploads/2026/01/WhatsApp-Image-2026-01-19-at-17.30.26.jpeg",
    alt: "Ramayan — प्राचीन भारतीय महाकाव्य",
    description:
      "Ramayan — प्राचीन भारतीय महाकाव्य. Hindi audio narration of the Ramayana through expressive voice and emotion.",
    videoUrl: "arzOYkbxwX8",
  },
  {
    id: 3,
    title: "RAMAYANAM",
    category: "TELUGU AUDIOBOOK",
    language: "TELUGU",
    src: "https://storyhour.co.uk/wp-content/uploads/2026/01/WhatsApp-Image-2026-01-19-at-17.28.56.jpeg",
    alt: "Ramayanam — An Ancient Indian Epic",
    description:
      "Ramayanam — An Ancient Indian Epic. The Telugu edition of the classical Ramayana audiobook.",
    videoUrl: "gR3TuESZXos",
  },
  {
    id: 4,
    title: "RAMAYANA PUPPET SHOW",
    category: "PUPPET THEATRE",
    language: "MULTILINGUAL",
    src: "https://storyhour.co.uk/wp-content/uploads/2026/01/Grand-Finale-5-scaled.jpg",
    alt: "Ramayana Puppet Show",
    description:
      "Flagship Ramayana puppet show created from the audiobook and performed across UK and European stages in English, Hindi, Gujarati, French, Spanish, German and Italian.",
    videoUrl: "1otr4iUMGbU",
  },
  {
    id: 5,
    title: "HANUMAN",
    category: "PUPPET STORY",
    language: "ENGLISH / BSL",
    src: "https://storyhour.co.uk/wp-content/uploads/2026/01/Hanuman-2-1024x683.jpg",
    alt: "Hanuman's Mighty Leap Across the Ocean",
    description:
      "Handcrafted string marionettes and British Sign Language bringing Hanuman's brave ocean crossing to life.",
    videoUrl: "vcZeX0jPYg4",
  },
  {
    id: 6,
    title: "INDIAN INDEPENDENCE",
    category: "AUDIOBOOK",
    language: "ENGLISH / HINDI / TELUGU",
    src: "https://storyhour.co.uk/wp-content/uploads/2026/01/Gandhi-Prayers-STudents-1024x683.jpg",
    alt: "A Brief History of Indian Independence — From the Mughals to the Mahatma",
    description:
      "Written by teenagers and produced as an audiobook across languages, exploring the path from the Mughals to the Mahatma.",
    videoUrl: undefined,
  },
];

export default function TrailersPage() {
  const [selectedTrailer, setSelectedTrailer] = useState<TrailerItem | null>(null);

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && selectedTrailer) {
        setSelectedTrailer(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedTrailer]);

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F3] text-[#0F0F0F] antialiased overflow-x-hidden selection:bg-[#C9281D] selection:text-white">
      {/* Existing StoryHour Navbar */}
      <SiteHeader activeLink="Trailer" />

      {/* ── Compact Sky Hero Banner (matching Home page sky) ── */}
      <section className="relative w-full bg-[#3b9dfb] pt-28 sm:pt-36 pb-16 sm:pb-20 px-4 sm:px-6 overflow-hidden select-none">
        {/* Background sky image matching Home hero */}
        <div className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-hidden">
          <Image
            src="/images/user-hero-bg.webp"
            alt=""
            fill
            className="object-cover object-top"
            sizes="100vw"
            aria-hidden="true"
          />
        </div>

        {/* Hero Title */}
        <div className="relative z-10 max-w-4xl mx-auto text-center flex flex-col items-center">
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight leading-[1.08] drop-shadow-sm">
            StoryHour Trailers
          </h1>
          <p className="mt-3 text-white/90 font-medium text-base sm:text-lg max-w-lg leading-relaxed">
            Step into the world of StoryHour through voices, performances, puppetry, and timeless stories.
          </p>
        </div>

        {/* Organic hill wave transition */}
        <div
          className="absolute -bottom-px left-0 right-0 z-10 pointer-events-none overflow-hidden leading-none select-none"
          style={{ marginBottom: "-1px" }}
        >
          <svg
            viewBox="0 0 1440 100"
            fill="none"
            preserveAspectRatio="none"
            className="w-full h-12 sm:h-16 md:h-20 block"
            aria-hidden="true"
          >
            <path
              d="M0,32 C360,68 720,8 1080,44 C1260,62 1380,48 1440,38 L1440,100 L0,100 Z"
              fill="#FAF8F3"
            />
          </svg>
        </div>
      </section>

      <main className="flex-1 flex flex-col justify-start">
        {/* ── 1. Compact Page Header ── */}
        <section className="pt-8 sm:pt-10 md:pt-12 pb-8 sm:pb-12 text-center max-w-[800px] mx-auto px-6">
          <span className="font-mono text-[11px] uppercase tracking-widest text-[#C9281D] font-semibold block mb-2">
            PREVIEW EXPERIENCE
          </span>
          <div className="mb-3">
            <MagneticText
              text="Stories come alive."
              hoverText="Stories unfold."
              className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-[66px] font-normal text-[#0F0F0F] tracking-tight leading-[1.05]"
            />
          </div>
          <p className="font-sans text-[15px] sm:text-[16px] text-[#5A5A5A] leading-relaxed max-w-[560px] mx-auto">
            Experience our rich multi-language audiobooks, ceremonial puppets, and dramatic voice performances.
          </p>
        </section>

        {/* ── 2. Editorial Rolling List ── */}
        <section className="max-w-[1240px] mx-auto px-6 sm:px-10 pb-20 sm:pb-28 w-full">
          <RollingList
            items={TRAILERS}
            onSelectTrailer={(trailer) => {
              if (trailer.videoUrl) {
                setSelectedTrailer(trailer);
              }
            }}
          />
        </section>
      </main>

      {/* ── 3. Video Modal for Trailer Playback ── */}
      {selectedTrailer && selectedTrailer.videoUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10 bg-black/80 backdrop-blur-md"
          role="dialog"
          aria-modal="true"
          aria-label={`${selectedTrailer.title} video player`}
          onClick={() => setSelectedTrailer(null)}
        >
          <div
            className="relative w-full max-w-4xl bg-black rounded-3xl overflow-hidden shadow-2xl border border-white/20 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-[#0F0F0F] border-b border-white/10 text-white">
              <div>
                <span className="font-mono text-[10px] uppercase tracking-wider text-[#C9281D] font-semibold block">
                  {selectedTrailer.category} · {selectedTrailer.language}
                </span>
                <h3 className="font-serif text-lg sm:text-xl font-normal text-white">
                  {selectedTrailer.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTrailer(null)}
                aria-label="Close video player"
                className="px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-sans text-[12px] flex items-center gap-1.5 transition-colors cursor-pointer border border-white/15"
              >
                <X className="w-4 h-4" />
                <span>Close</span>
              </button>
            </div>

            {/* Video Player Embed */}
            <div className="relative aspect-video w-full bg-black">
              <iframe
                src={`https://www.youtube.com/embed/${selectedTrailer.videoUrl}?autoplay=1&rel=0`}
                title={selectedTrailer.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="w-full h-full border-0"
              />
            </div>
          </div>
        </div>
      )}

      {/* ── Standard StoryHour Site Footer ── */}
      <SiteFooter />
    </div>
  );
}

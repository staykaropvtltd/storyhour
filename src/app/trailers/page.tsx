"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import SiteNav from "@/components/SiteNav";
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
    <div className="min-h-screen flex flex-col bg-[#FAF8F3] text-[#050505] antialiased overflow-x-hidden selection:bg-[#2410A4] selection:text-white">
      {/* Existing StoryHour Navbar */}
      <SiteNav theme="light" activeLink="Trailer" />

      <main className="flex-1 flex flex-col justify-start">
        {/* ── 1. Compact Page Header ── */}
        <section className="pt-10 sm:pt-14 md:pt-16 pb-8 sm:pb-12 text-center max-w-[800px] mx-auto px-6">
          <span className="font-mono text-[11px] uppercase tracking-widest text-[#2410A4] font-semibold block mb-2">
            TRAILERS
          </span>
          <h1 className="mb-3">
            <MagneticText
              text="Stories come alive."
              hoverText="Stories unfold."
              className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-[66px] font-normal text-[#050505] tracking-tight leading-[1.05]"
            />
          </h1>
          <p className="font-inter text-[15px] sm:text-[16px] text-[#696572] leading-relaxed max-w-[560px] mx-auto">
            Step into the world of StoryHour through voices, performances, puppetry, and timeless stories.
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
            <div className="flex items-center justify-between px-6 py-4 bg-[#0E0738] border-b border-white/10 text-white">
              <div>
                <span className="font-mono text-[10px] uppercase tracking-wider text-[#F6C445] font-semibold block">
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
                className="px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-inter text-[12px] flex items-center gap-1.5 transition-colors cursor-pointer border border-white/15"
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

      {/* ── 4. Existing StoryHour Footer ── */}
      <footer id="contact" className="bg-[#120A45] pt-16 pb-10 scroll-mt-14 mt-auto">
        <div className="max-w-[1320px] mx-auto px-6 sm:px-10">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-10 pb-14 border-b border-white/10">
            <div className="col-span-2 sm:col-span-1">
              <div className="relative h-7 w-28 mb-5 brightness-0 invert opacity-90">
                <Image
                  src="https://storyhour.co.uk/wp-content/uploads/2026/01/tp-logo.png"
                  alt="StoryHour"
                  fill
                  className="object-contain object-left"
                  sizes="120px"
                />
              </div>
              <p className="font-inter text-[13px] text-[#F7F4EE]/50 leading-[1.65] max-w-[200px]">
                Indian mythology and culture brought to life through soulful storytelling.
              </p>
              <div className="mt-5">
                <span className="font-mono text-[11px] text-[#F7F4EE]/35">London and Hyderabad</span>
              </div>
            </div>
            <div>
              <p className="font-inter text-[11px] font-medium text-[#F7F4EE]/35 mb-5">Explore</p>
              <ul className="space-y-3">
                {["Stories", "Storytellers", "Experiences", "Events", "Journal"].map((link) => (
                  <li key={link}>
                    <a
                      href={link === "Stories" ? "/stories" : link === "Storytellers" ? "/storytellers" : "#"}
                      className="font-inter text-[14px] text-[#F7F4EE]/65 hover:text-white transition-colors"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="font-inter text-[11px] font-medium text-[#F7F4EE]/35 mb-5">Shop</p>
              <ul className="space-y-3">
                {["All Audiobooks", "English Collection", "Hindi Collection", "Telugu Collection", "Shop"].map((link) => (
                  <li key={link}>
                    <a
                      href="/stories"
                      className="font-inter text-[14px] text-[#F7F4EE]/65 hover:text-white transition-colors"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="font-inter text-[11px] font-medium text-[#F7F4EE]/35 mb-5">Info</p>
              <ul className="space-y-3">
                {["About", "Contact", "Privacy", "Terms", "Refunds"].map((link) => (
                  <li key={link}>
                    <a
                      href={link === "Contact" ? "/contact" : link === "About" ? "/storytellers" : "#"}
                      className="font-inter text-[14px] text-[#F7F4EE]/65 hover:text-white transition-colors"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="pt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <p className="font-inter text-[13px] text-[#F7F4EE]/35">
              © 2026 StoryHour. All rights reserved.
            </p>
            <p className="font-inter text-[13px] text-[#F7F4EE]/35">Available worldwide</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

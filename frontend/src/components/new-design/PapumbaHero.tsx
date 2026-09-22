"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import { Headphones, Play, ArrowDown } from "lucide-react";
import { useAudio } from "@/context/AudioContext";
import { STORIES } from "@/data/storyhour-data";

import InteractiveKrishnaCharacter from "./InteractiveKrishnaCharacter";

export default function PapumbaHero() {
  const { playStory, isPlaying, togglePlay } = useAudio();
  const heroRef = useRef<HTMLDivElement>(null);

  const handleStartListening = () => {
    if (STORIES && STORIES.length > 0) {
      playStory(STORIES[0]);
      if (!isPlaying) togglePlay();
    }
  };

  const handleScrollDown = () => {
    const nextSection = document.getElementById("audiobooks") || document.getElementById("footer");
    if (nextSection) {
      nextSection.scrollIntoView({ behavior: "smooth" });
    } else if (heroRef.current) {
      window.scrollTo({
        top: heroRef.current.offsetHeight - 40,
        behavior: "smooth",
      });
    }
  };

  return (
    <section
      id="hero"
      ref={heroRef}
      className="relative w-full min-h-[100svh] flex flex-col justify-between items-center overflow-hidden pt-28 sm:pt-32 pb-4 select-none bg-[#3b9dfb]"
      aria-label="StoryHour Hero Section"
    >
      {/* 1. Enhanced High-Definition Background Image (User's Exact Image, 2880x1650, 100% Stable, No Parallax, No Rainbow) */}
      <div className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-hidden">
        <Image
          src="/images/user-hero-bg.webp"
          alt="StoryHour Children Storybook Landscape"
          fill
          priority
          className="object-cover object-bottom"
          sizes="100vw"
        />
      </div>

      {/* 2. Central Composition Zone (Untitled UI Component Hierarchy) */}
      <div className="relative z-20 flex flex-col items-center text-center max-w-[620px] md:max-w-[720px] lg:max-w-[800px] xl:max-w-[840px] px-4 mt-4 sm:mt-10 lg:mt-12">
        {/* Main Display Headline (Untitled UI Display Typography + Papumba Scale, 2 Clean Lines) */}
        <h1 className="text-[2.8rem] sm:text-[4rem] md:text-[5.2rem] lg:text-[6.2rem] xl:text-[7rem] font-extrabold text-white tracking-[-0.035em] leading-[0.96] drop-shadow-[0_2px_8px_rgba(0,0,0,0.18)] lowercase select-none">
          the magic storytelling
          <br />
          world for kids
        </h1>

        {/* Supporting Statement (Untitled UI Text lg/xl) */}
        <p className="text-white font-medium text-base sm:text-lg md:text-[1.25rem] mt-3.5 sm:mt-4 max-w-lg drop-shadow-[0_1px_4px_rgba(0,0,0,0.2)] lowercase leading-snug">
          trusted by families for calm, screen-free indian audiobooks &amp; epics
        </p>

        {/* Button Group (Untitled UI Button Group Component) */}
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mt-6 sm:mt-7">
          {/* Primary Button (Untitled UI Button - Primary White) */}
          <button
            onClick={handleStartListening}
            className="group inline-flex items-center justify-center gap-2.5 px-6 sm:px-7 py-3 rounded-full bg-white text-gray-900 hover:bg-gray-50 font-semibold text-sm sm:text-base shadow-sm border border-gray-200 transition-all hover:-translate-y-0.5 active:translate-y-0 cursor-pointer focus:outline-none focus:ring-4 focus:ring-white/40"
            aria-label="Start listening free"
          >
            <Headphones className="w-4 h-4 text-[#C9281D] group-hover:scale-110 transition-transform" />
            <span className="font-bold">{isPlaying ? "Playing Sample..." : "Start Listening Free"}</span>
          </button>

          {/* Secondary Button (Untitled UI Button - Secondary Dark) */}
          <a
            href="#audiobooks"
            className="inline-flex items-center justify-center gap-2 px-6 sm:px-7 py-3 rounded-full bg-gray-950/85 hover:bg-gray-950 backdrop-blur-sm text-white font-semibold text-sm sm:text-base shadow-sm border border-white/20 transition-all hover:-translate-y-0.5 active:translate-y-0 cursor-pointer focus:outline-none focus:ring-4 focus:ring-gray-900/30"
          >
            <Play className="w-4 h-4 fill-white text-white" />
            <span className="font-bold">Explore Audiobooks</span>
          </a>
        </div>
      </div>

      {/* 3. Handcrafted Interactive Moving Storybook Character (Elevated gracefully onto green hill slope, perfectly in frame) */}
      <div className="absolute right-2 sm:right-5 md:right-8 lg:right-12 xl:right-16 bottom-4 sm:bottom-6 md:bottom-8 lg:bottom-10 xl:bottom-12 z-20 pointer-events-auto">
        <InteractiveKrishnaCharacter
          isPlayingAudio={isPlaying}
          onPlaySample={handleStartListening}
          className="w-[120px] sm:w-[150px] md:w-[175px] lg:w-[195px] xl:w-[220px]"
        />
      </div>

      {/* 4. Organic Landscape Transition into Storytelling Section (Soft Rolling Curves & Atmospheric Mist) */}
      <div className="absolute bottom-0 left-0 right-0 z-10 pointer-events-none overflow-hidden leading-none select-none">
        {/* Atmospheric meadow mist gradient */}
        <div
          className="w-full h-16 sm:h-24 md:h-28"
          style={{
            background:
              "linear-gradient(to bottom, transparent 0%, rgba(250,248,243,0.15) 30%, rgba(250,248,243,0.65) 75%, #FAF8F3 100%)",
          }}
        />
        {/* Gentle organic rolling hill curves blending green hills into #FAF8F3 */}
        <div className="w-full -mt-10 sm:-mt-16 md:-mt-20">
          <svg
            viewBox="0 0 1440 100"
            fill="none"
            preserveAspectRatio="none"
            className="w-full h-12 sm:h-18 md:h-22 drop-shadow-[0_-4px_12px_rgba(20,50,15,0.06)]"
            aria-hidden="true"
          >
            {/* Soft translucent background crest */}
            <path
              d="M0,45 C320,15 540,68 820,32 C1100,-4 1280,48 1440,28 L1440,100 L0,100 Z"
              fill="#FAF8F3"
              fillOpacity="0.45"
            />
            {/* Primary foreground organic hill crest matching storytelling cream #FAF8F3 */}
            <path
              d="M0,58 C260,24 500,82 760,42 C1020,2 1240,62 1440,36 L1440,100 L0,100 Z"
              fill="#FAF8F3"
            />
          </svg>
        </div>
      </div>

      {/* 5. Centered Circular Scroll Indicator (Untitled UI Icon Button) */}
      <div className="relative z-30 flex flex-col items-center mt-auto pb-3 sm:pb-4">
        <button
          onClick={handleScrollDown}
          className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#0E1638] hover:bg-gradient-to-tr hover:from-[#DE3124] hover:to-[#C9281D] text-white flex items-center justify-center shadow-md hover:shadow-[0_4px_16px_rgba(201,40,29,0.38)] transition-all hover:scale-105 active:scale-95 animate-bounce-soft cursor-pointer focus:outline-none focus:ring-4 focus:ring-[#C9281D]/30"
          aria-label="Scroll to content below"
        >
          <ArrowDown className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.5]" />
        </button>
      </div>
    </section>
  );
}

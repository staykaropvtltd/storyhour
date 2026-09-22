"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUp } from "lucide-react";

export default function PapumbaFooter() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer id="footer" className="relative w-full overflow-hidden select-none antialiased">
      {/* 
        MAIN ILLUSTRATED STORYBOOK ENVIRONMENT STAGE
        Vibrant cerulean sky, bold multi-band rainbow, fluffy illustrated clouds,
        playful orange banner, StoryHour logo, white navigation columns with butterflies,
        and 4 ultra-high-resolution ceremonial dolls standing proudly on rolling green hills.
      */}
      <div className="relative w-full bg-gradient-to-b from-[#2d88f6] via-[#3e93f8] to-[#59a4fb] pt-6 sm:pt-8 pb-0 overflow-hidden text-white">
        {/* ========================================================================= */}
        {/* BACKGROUND ATMOSPHERE: Rich Rainbow Arc & Stylized Storybook Clouds       */}
        {/* ========================================================================= */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
          {/* Bold, Vibrant Storybook Rainbow Arc (Emerging behind characters on left) */}
          <div className="absolute -left-16 sm:-left-8 bottom-0 w-[420px] sm:w-[620px] md:w-[740px] h-[340px] sm:h-[480px] md:h-[560px] opacity-90 pointer-events-none">
            <svg viewBox="0 0 500 420" fill="none" className="w-full h-full">
              {/* Saturated, joyful children's storybook rainbow bands */}
              <path d="M -20 420 A 320 320 0 0 1 460 420" stroke="#FF5252" strokeWidth="24" strokeLinecap="round" strokeOpacity="0.85" />
              <path d="M 4 420 A 296 296 0 0 1 436 420" stroke="#FFA726" strokeWidth="24" strokeLinecap="round" strokeOpacity="0.9" />
              <path d="M 28 420 A 272 272 0 0 1 412 420" stroke="#FFEE58" strokeWidth="24" strokeLinecap="round" strokeOpacity="0.9" />
              <path d="M 52 420 A 248 248 0 0 1 388 420" stroke="#66BB6A" strokeWidth="24" strokeLinecap="round" strokeOpacity="0.88" />
              <path d="M 76 420 A 224 224 0 0 1 364 420" stroke="#29B6F6" strokeWidth="24" strokeLinecap="round" strokeOpacity="0.85" />
              <path d="M 100 420 A 200 200 0 0 1 340 420" stroke="#AB47BC" strokeWidth="24" strokeLinecap="round" strokeOpacity="0.8" />
            </svg>
          </div>

          {/* Stylized Storybook Cloud 1 (Top Left) */}
          <div className="absolute top-6 left-6 sm:left-14 opacity-80">
            <svg width="180" height="70" viewBox="0 0 180 70" fill="none" className="w-28 sm:w-44 h-auto">
              <path
                d="M 25 50 C 10 50 0 40 0 28 C 0 16 12 8 24 10 C 32 3 45 0 60 2 C 75 -2 95 4 105 15 C 118 10 135 14 140 25 C 155 24 168 34 165 46 C 165 52 155 58 145 58 L 25 58 Z"
                fill="white"
                fillOpacity="0.35"
              />
            </svg>
          </div>

          {/* Stylized Storybook Cloud 2 (Top Right) */}
          <div className="absolute top-8 right-8 sm:right-20 opacity-75">
            <svg width="220" height="85" viewBox="0 0 220 85" fill="none" className="w-36 sm:w-56 h-auto">
              <path
                d="M 30 65 C 12 65 0 52 0 36 C 0 20 16 10 32 13 C 42 4 60 0 80 3 C 100 -2 126 5 140 20 C 158 13 180 18 186 32 C 206 31 220 44 218 60 C 218 68 206 75 190 75 L 30 75 Z"
                fill="white"
                fillOpacity="0.30"
              />
            </svg>
          </div>

          {/* Stylized Storybook Cloud 3 (Mid Right) */}
          <div className="absolute top-28 right-4 sm:right-10 opacity-60">
            <svg width="140" height="55" viewBox="0 0 140 55" fill="none" className="w-24 sm:w-36 h-auto">
              <path
                d="M 20 40 C 8 40 0 32 0 22 C 0 12 10 6 20 8 C 26 2 38 0 50 2 C 64 -1 80 4 90 13 C 102 9 116 12 120 21 C 132 20 140 28 138 38 L 20 45 Z"
                fill="white"
                fillOpacity="0.25"
              />
            </svg>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* MAIN CONTENT CONTAINER                                                    */}
        {/* ========================================================================= */}
        <div className="relative max-w-[1360px] mx-auto px-6 sm:px-10 z-10 flex flex-col items-center">
          {/* 
            TOP CENTER PLAYFUL BANNER
            Warm golden-orange handcrafted pill banner with bold friendly white typography
          */}
          <div className="mb-4 sm:mb-6">
            <div className="inline-block transform -rotate-1 sm:-rotate-2 hover:rotate-0 transition-transform duration-300">
              <div className="bg-gradient-to-r from-[#DE3124] via-[#C9281D] to-[#B01E14] hover:from-[#EA3A2D] hover:to-[#C02318] text-white px-7 sm:px-11 py-3 sm:py-3.5 rounded-2xl sm:rounded-3xl shadow-[0_12px_28px_rgba(201,40,29,0.4)] border-2 border-white/25 transition-all">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white drop-shadow-sm">
                  Let&apos;s make storytime magical!
                </h2>
              </div>
            </div>
          </div>

          {/* 
            UPPER NAVIGATION & SOCIAL AREA
            Left: StoryHour Official Logo + "Follow us" + Line-art Social Icons
            Center/Right: 3 spacious columns of white navigation links with fluttering butterflies
          */}
          <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 pb-0 z-20">
            {/* Left Column: StoryHour Logo & Follow Us */}
            <div className="lg:col-span-4 flex flex-col items-start">
              {/* StoryHour Official Brand Logo Card */}
              <div className="mb-3 sm:mb-4">
                <Link href="/" className="inline-block transition-transform duration-200 hover:scale-105" aria-label="StoryHour Homepage">
                  <div className="relative h-11 w-40 sm:h-12 sm:w-44 bg-white/95 backdrop-blur-sm rounded-2xl px-3.5 py-1.5 flex items-center justify-center border-2 border-white/80 shadow-[0_4px_16px_rgba(0,0,0,0.08)]">
                    <Image
                      src="https://storyhour.co.uk/wp-content/uploads/2026/01/tp-logo.png"
                      alt="StoryHour"
                      fill
                      className="object-contain p-1"
                      sizes="180px"
                      priority
                    />
                  </div>
                </Link>
              </div>

              <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white mb-2 sm:mb-3 drop-shadow-sm">
                Follow us
              </h3>

              {/* Clean White Line-Art Social Icons */}
              <div className="flex items-center gap-3">
                {/* Instagram */}
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl border-2 border-white/85 hover:border-white hover:bg-white/20 text-white flex items-center justify-center transition-all duration-200 shadow-sm hover:scale-110 active:scale-95"
                  aria-label="Follow StoryHour on Instagram"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                  </svg>
                </a>

                {/* Spotify Audiobooks */}
                <a
                  href="https://spotify.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl border-2 border-white/85 hover:border-white hover:bg-white/20 text-white flex items-center justify-center transition-all duration-200 shadow-sm hover:scale-110 active:scale-95"
                  aria-label="Listen on Spotify"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.498 17.304c-.216.353-.674.464-1.027.248-2.812-1.718-6.35-2.107-10.518-1.155-.403.092-.806-.16-.898-.563-.092-.403.16-.806.563-.898 4.567-1.042 8.49-.602 11.632 1.341.353.216.464.674.248 1.027zm1.467-3.26c-.272.441-.849.58-1.29.308-3.22-1.979-8.13-2.552-11.94-1.396-.497.151-1.026-.135-1.177-.632-.151-.497.135-1.026.632-1.177 4.354-1.321 9.775-.683 13.467 1.587.441.272.58.849.308 1.31zm.134-3.396C15.24 8.358 8.91 8.148 5.188 9.278c-.604.183-1.246-.168-1.429-.772-.183-.604.168-1.246.772-1.429 4.275-1.298 11.27-1.054 15.688 1.57.544.323.722 1.028.399 1.572-.323.544-1.028.722-1.52.379z" />
                  </svg>
                </a>

                {/* YouTube Puppet Theatre */}
                <a
                  href="https://youtube.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl border-2 border-white/85 hover:border-white hover:bg-white/20 text-white flex items-center justify-center transition-all duration-200 shadow-sm hover:scale-110 active:scale-95"
                  aria-label="Watch Puppet Theatre on YouTube"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                </a>

                {/* LinkedIn / Community */}
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl border-2 border-white/85 hover:border-white hover:bg-white/20 text-white flex items-center justify-center transition-all duration-200 shadow-sm hover:scale-110 active:scale-95"
                  aria-label="StoryHour on LinkedIn"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Center & Right Columns: Navigation Columns */}
            <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-5 sm:gap-8">
              {/* Column 1: About & Epics */}
              <div>
                <ul className="space-y-2 sm:space-y-2.5 text-sm sm:text-[15px] font-semibold text-white/95">
                  <li>
                    <a href="#about" className="hover:text-white hover:translate-x-1 inline-block transition-transform">
                      About Us
                    </a>
                  </li>
                  <li>
                    <a href="#audiobooks" className="hover:text-white hover:translate-x-1 inline-block transition-transform">
                      Explore Stories
                    </a>
                  </li>
                  <li>
                    <a href="#storytellers" className="hover:text-white hover:translate-x-1 inline-block transition-transform">
                      Master Storytellers
                    </a>
                  </li>
                  <li>
                    <a href="#workshops" className="hover:text-white hover:translate-x-1 inline-block transition-transform">
                      School Workshops
                    </a>
                  </li>
                </ul>
              </div>

              {/* Column 2: Help & Community (with fluttering Red/Orange Butterfly) */}
              <div className="relative">
                {/* Playful Fluttering Red/Orange Butterfly */}
                <div className="absolute -top-7 -right-2 sm:-top-8 sm:right-6 pointer-events-none transform rotate-12 hover:scale-110 transition-transform">
                  <svg width="30" height="30" viewBox="0 0 36 36" fill="none">
                    <ellipse cx="12" cy="12" rx="9" ry="7" fill="#FF5252" transform="rotate(-25 12 12)" />
                    <ellipse cx="24" cy="12" rx="9" ry="7" fill="#FF5252" transform="rotate(25 24 12)" />
                    <ellipse cx="13" cy="22" rx="6" ry="5" fill="#DE3124" transform="rotate(12 13 22)" />
                    <ellipse cx="23" cy="22" rx="6" ry="5" fill="#DE3124" transform="rotate(-12 23 22)" />
                    <ellipse cx="18" cy="18" rx="2.5" ry="8" fill="#212121" />
                    <circle cx="18" cy="10" r="1.8" fill="#212121" />
                  </svg>
                </div>

                <ul className="space-y-2 sm:space-y-2.5 text-sm sm:text-[15px] font-semibold text-white/95">
                  <li>
                    <a href="#help" className="hover:text-white hover:translate-x-1 inline-block transition-transform">
                      Help Center
                    </a>
                  </li>
                  <li>
                    <a href="#faqs" className="hover:text-white hover:translate-x-1 inline-block transition-transform">
                      Parent FAQs
                    </a>
                  </li>
                  <li>
                    <a href="#sampler" className="hover:text-white hover:translate-x-1 inline-block transition-transform">
                      Free Sampler
                    </a>
                  </li>
                  <li>
                    <a href="#contact" className="hover:text-white hover:translate-x-1 inline-block transition-transform">
                      Contact Support
                    </a>
                  </li>
                </ul>
              </div>

              {/* Column 3: Legal & Theatre (with fluttering Bright Yellow Butterfly) */}
              <div className="relative col-span-2 sm:col-span-1">
                {/* Playful Fluttering Yellow Butterfly */}
                <div className="absolute -top-6 left-24 sm:left-20 pointer-events-none transform -rotate-12 hover:scale-110 transition-transform">
                  <svg width="28" height="28" viewBox="0 0 36 36" fill="none">
                    <ellipse cx="12" cy="12" rx="9" ry="7" fill="#FFD54F" transform="rotate(-25 12 12)" />
                    <ellipse cx="24" cy="12" rx="9" ry="7" fill="#FFD54F" transform="rotate(25 24 12)" />
                    <ellipse cx="13" cy="22" rx="6" ry="5" fill="#FFE082" transform="rotate(12 13 22)" />
                    <ellipse cx="23" cy="22" rx="6" ry="5" fill="#FFE082" transform="rotate(-12 23 22)" />
                    <ellipse cx="18" cy="18" rx="2.5" ry="8" fill="#212121" />
                    <circle cx="18" cy="10" r="1.8" fill="#212121" />
                  </svg>
                </div>

                <ul className="space-y-2 sm:space-y-2.5 text-sm sm:text-[15px] font-semibold text-white/95">
                  <li>
                    <a href="#puppet-theatre" className="hover:text-white hover:translate-x-1 inline-block transition-transform">
                      Puppet Theatre
                    </a>
                  </li>
                  <li>
                    <a href="#terms" className="hover:text-white hover:translate-x-1 inline-block transition-transform">
                      Terms of Use
                    </a>
                  </li>
                  <li>
                    <a href="#privacy" className="hover:text-white hover:translate-x-1 inline-block transition-transform">
                      Privacy Policy
                    </a>
                  </li>
                  <li>
                    <a href="#child-safety" className="hover:text-white hover:translate-x-1 inline-block transition-transform">
                      Child Safety &amp; COPPA
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* LOWER ILLUSTRATED HORIZON & 4 LARGE CEREMONIAL DOLLS                      */}
        {/* Expanded width with minimal side padding to let puppets span gracefully   */}
        {/* ========================================================================= */}
        <div className="relative w-full -mt-2 sm:-mt-6 md:-mt-10 pt-0 flex flex-col items-center z-10">
          {/* Layer 1: Distant Rolling Hill (Soft Emerald) */}
          <div className="absolute bottom-0 inset-x-0 h-48 sm:h-64 md:h-80 lg:h-[380px] pointer-events-none z-10">
            <div className="w-full h-full bg-[#48bb78] rounded-t-[100%_65px] sm:rounded-t-[100%_110px] opacity-80 transform -translate-y-3" />
          </div>

          {/* Layer 2: Midground Rolling Hill (Vibrant Meadow Green) */}
          <div className="absolute bottom-0 inset-x-0 h-36 sm:h-50 md:h-64 lg:h-[300px] pointer-events-none z-15">
            <div className="w-full h-full bg-[#38a169] rounded-t-[100%_75px] sm:rounded-t-[100%_120px] shadow-[inset_0_6px_16px_rgba(255,255,255,0.22)]" />
          </div>

          {/* 
            4 Ultra-High-Resolution Ceremonial Characters (Layer 3 - Z-20):
            Snug, warm troupe grouping with overlapping contours to completely eliminate empty space.
          */}
          <div className="relative w-full max-w-[1300px] mx-auto flex items-end justify-center -space-x-2 sm:-space-x-3 md:-space-x-5 lg:-space-x-7 xl:-space-x-8 pb-2 sm:pb-4 z-20 px-2">
            {/* Character 1: Hanuman Doll with Golden Mace */}
            <div className="relative z-20 w-[140px] sm:w-[200px] md:w-[255px] lg:w-[290px] xl:w-[320px] h-[280px] sm:h-[410px] md:h-[510px] lg:h-[585px] xl:h-[635px] shrink-0 transition-transform duration-300 hover:scale-105 hover:z-35">
              <Image
                src="/images/characters/character-hanuman.png"
                alt="Hanuman Ceremonial Doll with Golden Mace"
                fill
                sizes="(max-width: 640px) 140px, (max-width: 768px) 200px, (max-width: 1024px) 255px, (max-width: 1280px) 290px, 320px"
                className="object-contain object-bottom drop-shadow-[0_20px_32px_rgba(0,0,0,0.32)]"
                priority
              />
            </div>

            {/* Character 2: Royal Child Storyteller Doll */}
            <div className="relative z-22 w-[115px] sm:w-[160px] md:w-[205px] lg:w-[235px] xl:w-[255px] h-[280px] sm:h-[400px] md:h-[515px] lg:h-[580px] xl:h-[630px] shrink-0 transition-transform duration-300 hover:scale-105 hover:z-35">
              <Image
                src="/images/characters/character-royal-child.png"
                alt="Royal Child Ceremonial Doll"
                fill
                sizes="(max-width: 640px) 115px, (max-width: 768px) 160px, (max-width: 1024px) 205px, (max-width: 1280px) 235px, 255px"
                className="object-contain object-bottom drop-shadow-[0_20px_32px_rgba(0,0,0,0.3)]"
                priority
              />
            </div>

            {/* Character 3: Lord Krishna Doll (Centerpiece, elevated in foreground) */}
            <div className="relative z-25 w-[145px] sm:w-[205px] md:w-[260px] lg:w-[300px] xl:w-[325px] h-[315px] sm:h-[455px] md:h-[580px] lg:h-[665px] xl:h-[725px] shrink-0 transition-transform duration-300 hover:scale-105 hover:z-35">
              <Image
                src="/images/characters/character-krishna.png"
                alt="Lord Krishna Ceremonial Doll with Flute"
                fill
                sizes="(max-width: 640px) 145px, (max-width: 768px) 205px, (max-width: 1024px) 260px, (max-width: 1280px) 300px, 325px"
                className="object-contain object-bottom drop-shadow-[0_24px_40px_rgba(0,0,0,0.38)]"
                priority
              />
            </div>

            {/* Character 4: Ceremonial Queen / Mother Doll */}
            <div className="relative z-21 w-[105px] sm:w-[150px] md:w-[190px] lg:w-[220px] xl:w-[240px] h-[280px] sm:h-[405px] md:h-[515px] lg:h-[590px] xl:h-[645px] shrink-0 transition-transform duration-300 hover:scale-105 hover:z-35">
              <Image
                src="/images/characters/character-female.png"
                alt="Ceremonial Queen Doll in Silk Saree"
                fill
                sizes="(max-width: 640px) 105px, (max-width: 768px) 150px, (max-width: 1024px) 190px, (max-width: 1280px) 220px, 240px"
                className="object-contain object-bottom drop-shadow-[0_20px_32px_rgba(0,0,0,0.3)]"
                priority
              />
            </div>
          </div>

          {/* Layer 4: Foreground Lush Grass Crest with Wildflower Details (Layer 4 - Z-25) */}
          <div className="absolute bottom-0 inset-x-0 h-12 sm:h-18 md:h-22 lg:h-26 bg-[#23583c] rounded-t-[100%_45px] sm:rounded-t-[100%_65px] pointer-events-none z-25 opacity-98 flex items-start justify-around px-8 pt-2">
            {/* Subtle Storybook Wildflowers along the crest */}
            <div className="hidden sm:flex items-center gap-2 opacity-85">
              <span className="w-3 h-3 rounded-full bg-[#FFE082]" />
              <span className="w-2 h-2 rounded-full bg-white" />
            </div>
            <div className="hidden sm:flex items-center gap-1.5 opacity-75">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FF8A80]" />
            </div>
            <div className="hidden sm:flex items-center gap-2 opacity-85">
              <span className="w-3 h-3 rounded-full bg-white" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#FFE082]" />
            </div>
            <div className="hidden sm:flex items-center gap-1.5 opacity-80">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FF8A80]" />
            </div>
            <div className="hidden md:flex items-center gap-2 opacity-80">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FFE082]" />
              <span className="w-2.5 h-2.5 rounded-full bg-white" />
            </div>
          </div>

          {/* Scroll-To-Top Circular Black Button (Layer 5 - Z-30) */}
          <button
            onClick={scrollToTop}
            className="absolute right-4 sm:right-6 md:right-10 bottom-8 sm:bottom-12 md:bottom-14 z-30 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-black text-white flex items-center justify-center shadow-2xl hover:bg-neutral-800 hover:scale-110 active:scale-95 transition-all duration-200 cursor-pointer border-2 border-white/25"
            aria-label="Scroll to top of page"
          >
            <ArrowUp className="w-6 h-6 text-white stroke-[2.5]" />
          </button>
        </div>

        {/* ========================================================================= */}
        {/* UNIFIED INTEGRATED FOOTER BASE (Replaces the separate white bar)          */}
        {/* ========================================================================= */}
        <div className="w-full bg-[#183d29] py-3.5 px-6 sm:px-12 z-30 relative border-t border-emerald-800/40">
          <div className="max-w-[1360px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-semibold text-emerald-100/90">
            {/* Copyright */}
            <p className="tracking-wide">
              &copy; {new Date().getFullYear()} StoryHour Ltd. All rights reserved.
            </p>

            {/* Accepted Payment Methods */}
            <div className="flex items-center gap-2" aria-label="Accepted payment methods">
              <Image
                src="/images/payment-badges.png"
                alt="Accepted payment methods: Visa, PayPal, Maestro, MasterCard, Discover"
                width={249}
                height={27}
                className="h-6 sm:h-7 w-auto object-contain drop-shadow-sm"
                unoptimized
              />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

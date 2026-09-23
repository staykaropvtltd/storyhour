"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ArrowDown } from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import clsx from "clsx";
import {
  HandcraftedPeacockFeather,
  HandcraftedPalmManuscript,
  HandcraftedTerracottaDiya,
  HandcraftedBotanicalVine,
  ManuscriptCornerOrnament,
  HandcraftedTempleBell,
  HandcraftedMoonStar,
} from "./HandcraftedIllustrations";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface StoryState {
  id: string;
  number: string;
  badge: string;
  headline: string;
  subtext: string;
  characterImg: string;
  characterAlt: string;
  characterWidth: number;
  characterHeight: number;
  accentType: "krishna" | "audio" | "hanuman" | "bedtime";
}

const STORY_STATES: StoryState[] = [
  {
    id: "oral-tradition",
    number: "01",
    badge: "SACRED ORAL TRADITION",
    headline: "discover timeless indian stories",
    subtext: "Centuries of cultural wisdom from Ramayana, Mahabharata & Panchatantra.",
    characterImg: "/images/characters/character-krishna.png",
    characterAlt: "Handcrafted Lord Krishna Ceremonial Doll with Flute",
    characterWidth: 320,
    characterHeight: 440,
    accentType: "krishna",
  },
  {
    id: "multilingual-audio",
    number: "02",
    badge: "MULTILINGUAL IMMERSION",
    headline: "listen to stories in hindi, english & telugu",
    subtext: "Masterful vocal performances in mother-tongue languages children love.",
    characterImg: "/images/characters/character-royal-child.png",
    characterAlt: "Handcrafted Royal Child Storyteller Ceremonial Doll",
    characterWidth: 260,
    characterHeight: 460,
    accentType: "audio",
  },
  {
    id: "mythological-heroes",
    number: "03",
    badge: "LEGENDARY VALOR & WISDOM",
    headline: "meet legendary mythological heroes",
    subtext: "Inspiring tales of courage, friendship, and virtue passed down across generations.",
    characterImg: "/images/characters/character-hanuman.png",
    characterAlt: "Handcrafted Hanuman Ceremonial Doll with Golden Mace",
    characterWidth: 280,
    characterHeight: 450,
    accentType: "hanuman",
  },
  {
    id: "bedtime-rituals",
    number: "04",
    badge: "100% SCREEN-FREE AUDIO",
    headline: "transform screentime into calm bedtime rituals",
    subtext: "Soothing nighttime narration designed to help young minds drift off peacefully.",
    characterImg: "/images/characters/character-female.png",
    characterAlt: "Handcrafted Ceremonial Queen & Mother Doll",
    characterWidth: 250,
    characterHeight: 460,
    accentType: "bedtime",
  },
];

export default function ScrollStorytellingSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const activeIndexRef = useRef(0);

  // References for visual and text elements of each state
  const visualRefs = useRef<(HTMLDivElement | null)[]>([]);
  const textRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (!containerRef.current || !stageRef.current) return;

    // Check for prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    // Set initial states
    visualRefs.current.forEach((el, index) => {
      if (!el) return;
      if (index === 0) {
        gsap.set(el, { opacity: 1, y: 0, scale: 1, autoAlpha: 1 });
      } else {
        gsap.set(el, { opacity: 0, y: 36, scale: 0.95, autoAlpha: 0 });
      }
    });

    textRefs.current.forEach((el, index) => {
      if (!el) return;
      if (index === 0) {
        gsap.set(el, { opacity: 1, y: 0, autoAlpha: 1 });
      } else {
        gsap.set(el, { opacity: 0, y: 28, autoAlpha: 0 });
      }
    });

    if (prefersReducedMotion) {
      // Simplified scroll trigger for reduced motion
      const st = ScrollTrigger.create({
        trigger: containerRef.current,
        start: "top top",
        end: "bottom bottom",
        onUpdate: (self) => {
          const idx = Math.min(
            STORY_STATES.length - 1,
            Math.floor(self.progress * STORY_STATES.length)
          );
          if (idx !== activeIndexRef.current) {
            activeIndexRef.current = idx;
            setActiveIndex(idx);
            visualRefs.current.forEach((el, i) => {
              if (el) gsap.set(el, { opacity: i === idx ? 1 : 0, autoAlpha: i === idx ? 1 : 0 });
            });
            textRefs.current.forEach((el, i) => {
              if (el) gsap.set(el, { opacity: i === idx ? 1 : 0, autoAlpha: i === idx ? 1 : 0 });
            });
          }
        },
      });
      return () => st.kill();
    }

    // Build the master scrub timeline
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.8,
          onUpdate: (self) => {
            const p = self.progress;
            let nextIndex = 0;
            if (p < 0.25) nextIndex = 0;
            else if (p < 0.50) nextIndex = 1;
            else if (p < 0.75) nextIndex = 2;
            else nextIndex = 3;

            if (nextIndex !== activeIndexRef.current) {
              activeIndexRef.current = nextIndex;
              setActiveIndex(nextIndex);
            }
          },
        },
      });

      // State 1 -> State 2 Transition (around 25% of scroll)
      tl.addLabel("state0")
        .to(
          visualRefs.current[0],
          { opacity: 0, y: -36, scale: 0.94, autoAlpha: 0, duration: 0.8, ease: "power2.inOut" },
          "+=0.4"
        )
        .to(
          textRefs.current[0],
          { opacity: 0, y: -24, autoAlpha: 0, duration: 0.7, ease: "power2.inOut" },
          "<0.1"
        )
        .to(
          visualRefs.current[1],
          { opacity: 1, y: 0, scale: 1, autoAlpha: 1, duration: 0.8, ease: "power2.out" },
          "<0.2"
        )
        .to(
          textRefs.current[1],
          { opacity: 1, y: 0, autoAlpha: 1, duration: 0.8, ease: "power2.out" },
          "<0.15"
        )
        .addLabel("state1");

      // State 2 -> State 3 Transition (around 50% of scroll)
      tl.to(
          visualRefs.current[1],
          { opacity: 0, y: -36, scale: 0.94, autoAlpha: 0, duration: 0.8, ease: "power2.inOut" },
          "+=0.8"
        )
        .to(
          textRefs.current[1],
          { opacity: 0, y: -24, autoAlpha: 0, duration: 0.7, ease: "power2.inOut" },
          "<0.1"
        )
        .to(
          visualRefs.current[2],
          { opacity: 1, y: 0, scale: 1, autoAlpha: 1, duration: 0.8, ease: "power2.out" },
          "<0.2"
        )
        .to(
          textRefs.current[2],
          { opacity: 1, y: 0, autoAlpha: 1, duration: 0.8, ease: "power2.out" },
          "<0.15"
        )
        .addLabel("state2");

      // State 3 -> State 4 Transition (around 75% of scroll)
      tl.to(
          visualRefs.current[2],
          { opacity: 0, y: -36, scale: 0.94, autoAlpha: 0, duration: 0.8, ease: "power2.inOut" },
          "+=0.8"
        )
        .to(
          textRefs.current[2],
          { opacity: 0, y: -24, autoAlpha: 0, duration: 0.7, ease: "power2.inOut" },
          "<0.1"
        )
        .to(
          visualRefs.current[3],
          { opacity: 1, y: 0, scale: 1, autoAlpha: 1, duration: 0.8, ease: "power2.out" },
          "<0.2"
        )
        .to(
          textRefs.current[3],
          { opacity: 1, y: 0, autoAlpha: 1, duration: 0.8, ease: "power2.out" },
          "<0.15"
        )
        .addLabel("state3")
        .to({}, { duration: 0.6 }); // Hold final state before pin releases
    }, containerRef);

    return () => ctx.revert();
  }, []);

  // Smooth jump to specific state
  const handleScrollToState = (index: number) => {
    if (!containerRef.current) return;
    const containerTop = containerRef.current.offsetTop;
    const containerHeight = containerRef.current.offsetHeight - window.innerHeight;
    const targetScroll = containerTop + (containerHeight * (index / (STORY_STATES.length - 1)));
    window.scrollTo({ top: targetScroll, behavior: "smooth" });
  };

  // Bottom arrow scrolls to next state, or down to next section
  const handleArrowClick = () => {
    if (activeIndex < STORY_STATES.length - 1) {
      handleScrollToState(activeIndex + 1);
    } else if (containerRef.current) {
      const nextSectionTop = containerRef.current.offsetTop + containerRef.current.offsetHeight;
      window.scrollTo({ top: nextSectionTop, behavior: "smooth" });
    }
  };

  return (
    <section
      ref={containerRef}
      id="scroll-storytelling"
      className="relative w-full h-[400vh] bg-[#FAF8F3] text-[#0f0f0f] select-none"
      aria-label="StoryHour Interactive Storytelling Journey"
    >
      {/* 
        Sticky Viewport Stage (100vh pinned)
        Remains firmly anchored in viewport while the user scrolls through the 400vh container
      */}
      <div
        ref={stageRef}
        className="sticky top-0 h-screen w-full flex flex-col items-center justify-between pt-24 sm:pt-28 md:pt-32 pb-8 sm:pb-10 px-4 sm:px-6 overflow-hidden bg-[radial-gradient(ellipse_75%_65%_at_50%_45%,#FCFAF5_0%,#F7F2E8_60%,#EFE8DA_100%)]"
      >
        {/* Top Subtle Manuscript Folio Header (Human-Designed Editorial Style) */}
        <div className="w-full flex justify-center items-center z-20 pointer-events-none">
          <div className="flex items-center gap-2.5 sm:gap-4 transition-all duration-500">
            <span className="h-px w-6 sm:w-14 bg-gradient-to-r from-transparent via-[#C5A048]/60 to-[#8C6E4A]/80" />
            <span className="text-[10px] sm:text-xs font-serif font-semibold tracking-[0.22em] uppercase text-[#704E2D]">
              Folio {STORY_STATES[activeIndex].number} &nbsp;•&nbsp; {STORY_STATES[activeIndex].badge}
            </span>
            <span className="h-px w-6 sm:w-14 bg-gradient-to-l from-transparent via-[#C5A048]/60 to-[#8C6E4A]/80" />
          </div>
        </div>

        {/* Central Visual & Headline Stage Container */}
        <div className="relative w-full max-w-4xl flex-1 flex flex-col items-center justify-center my-auto z-10">
          {/* Manuscript Framing Ornaments in Outer Corners */}
          <div className="absolute -top-6 -left-6 sm:-top-10 sm:-left-10 opacity-35 pointer-events-none hidden sm:block">
            <ManuscriptCornerOrnament position="top-left" />
          </div>
          <div className="absolute -top-6 -right-6 sm:-top-10 sm:-right-10 opacity-35 pointer-events-none hidden sm:block">
            <ManuscriptCornerOrnament position="top-right" />
          </div>
          <div className="absolute -bottom-6 -left-6 sm:-bottom-10 sm:-left-10 opacity-35 pointer-events-none hidden sm:block">
            <ManuscriptCornerOrnament position="bottom-left" />
          </div>
          <div className="absolute -bottom-6 -right-6 sm:-bottom-10 sm:-right-10 opacity-35 pointer-events-none hidden sm:block">
            <ManuscriptCornerOrnament position="bottom-right" />
          </div>

          {/* 
            LAYER 1: CENTRAL VISUAL ELEMENTS
            All 4 visuals are layered in the same central spatial anchor
          */}
          <div className="relative w-full h-[240px] sm:h-[300px] md:h-[360px] flex items-center justify-center">
            {/* Visual 0: Krishna Doll & Handcrafted Storytelling Illustrations */}
            <div
              ref={(el) => { visualRefs.current[0] = el; }}
              className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
            >
              <div className="relative flex items-center justify-center">
                {/* Subtle warm manuscript golden illumination behind Krishna */}
                <div className="absolute -inset-10 bg-gradient-to-t from-[#C5A048]/15 via-[#C9281D]/5 to-transparent rounded-full blur-3xl pointer-events-none" />

                {/* Handcrafted Palm-Leaf Manuscript (Left) */}
                <div className="absolute -left-16 sm:-left-24 md:-left-32 top-8 sm:top-12 rotate-[-8deg] pointer-events-none drop-shadow-sm">
                  <HandcraftedPalmManuscript className="w-[110px] sm:w-[130px] md:w-[150px] h-auto" />
                </div>

                {/* Handcrafted Botanical Champak Vine (Lower-Left) */}
                <div className="absolute -left-12 sm:-left-20 md:-left-24 bottom-4 sm:bottom-8 rotate-[2deg] pointer-events-none opacity-85">
                  <HandcraftedBotanicalVine className="w-[70px] sm:w-[85px] md:w-[95px] h-auto" />
                </div>

                {/* Handcrafted Peacock Feather (Upper-Right) */}
                <div className="absolute -right-14 sm:-right-22 md:-right-28 top-2 sm:top-6 rotate-[14deg] pointer-events-none drop-shadow-sm">
                  <HandcraftedPeacockFeather className="w-[75px] sm:w-[90px] md:w-[105px] h-auto" />
                </div>

                {/* Handcrafted Terracotta Diya with Sacred Living Flame (Lower-Right) */}
                <div className="absolute -right-12 sm:-right-18 md:-right-22 bottom-6 sm:bottom-10 rotate-[4deg] pointer-events-none drop-shadow-sm">
                  <HandcraftedTerracottaDiya className="w-[65px] sm:w-[75px] md:w-[85px] h-auto" />
                </div>

                {/* Handcrafted Krishna Puppet Doll (Exact Approved Identity) */}
                <div className="relative w-[190px] sm:w-[240px] md:w-[280px] h-[230px] sm:h-[290px] md:h-[340px] drop-shadow-[0_18px_28px_rgba(43,29,18,0.18)]">
                  <Image
                    src={STORY_STATES[0].characterImg}
                    alt={STORY_STATES[0].characterAlt}
                    fill
                    sizes="(max-width: 640px) 190px, (max-width: 768px) 240px, 280px"
                    className="object-contain object-bottom"
                    priority
                  />
                </div>

                {/* Soft Ground Elliptical Shadow */}
                <div className="absolute -bottom-4 w-44 sm:w-56 md:w-64 h-5 bg-[radial-gradient(ellipse_at_center,rgba(43,29,18,0.22)_0%,rgba(43,29,18,0.06)_50%,transparent_75%)]" />
              </div>
            </div>

            {/* Visual 1: Royal Child Storyteller & Handcrafted Script Folios */}
            <div
              ref={(el) => { visualRefs.current[1] = el; }}
              className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none opacity-0"
            >
              <div className="relative flex items-center justify-center">
                {/* Subtle warm acoustic aura */}
                <div className="absolute -inset-10 bg-gradient-to-t from-[#C9281D]/10 via-[#C5A048]/10 to-transparent rounded-full blur-3xl pointer-events-none" />

                {/* Handcrafted Manuscript Inscription Leaf: Hindi (Left) */}
                <div className="absolute -left-14 sm:-left-26 top-10 rotate-[-6deg] bg-[#F4EBD9]/90 border border-[#8C6E4A]/30 rounded-xl px-3 py-1.5 shadow-sm text-center">
                  <span className="font-serif text-xs sm:text-sm font-bold text-[#8C2D19] tracking-wider">
                    देवनागरी • हिन्दी
                  </span>
                </div>

                {/* Handcrafted Manuscript Inscription Leaf: Telugu (Right) */}
                <div className="absolute -right-14 sm:-right-26 top-12 rotate-[7deg] bg-[#F4EBD9]/90 border border-[#8C6E4A]/30 rounded-xl px-3 py-1.5 shadow-sm text-center">
                  <span className="font-serif text-xs sm:text-sm font-bold text-[#2A6546] tracking-wider">
                    తెలుగు భారతి
                  </span>
                </div>

                {/* Handcrafted Palm Manuscript (Lower-Right) */}
                <div className="absolute -right-12 sm:-right-20 bottom-6 rotate-[-5deg] opacity-75">
                  <HandcraftedPalmManuscript className="w-[90px] sm:w-[110px] h-auto" />
                </div>

                {/* Handcrafted Royal Child Storyteller Doll */}
                <div className="relative w-[170px] sm:w-[220px] md:w-[260px] h-[230px] sm:h-[290px] md:h-[340px] drop-shadow-[0_18px_28px_rgba(43,29,18,0.16)]">
                  <Image
                    src={STORY_STATES[1].characterImg}
                    alt={STORY_STATES[1].characterAlt}
                    fill
                    sizes="(max-width: 640px) 170px, (max-width: 768px) 220px, 260px"
                    className="object-contain object-bottom"
                    priority
                  />
                </div>

                {/* Soft Ground Shadow */}
                <div className="absolute -bottom-4 w-40 sm:w-52 md:w-60 h-5 bg-[radial-gradient(ellipse_at_center,rgba(43,29,18,0.20)_0%,rgba(43,29,18,0.05)_50%,transparent_75%)]" />
              </div>
            </div>

            {/* Visual 2: Hanuman Doll with Golden Mace & Handcrafted Valorous Motifs */}
            <div
              ref={(el) => { visualRefs.current[2] = el; }}
              className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none opacity-0"
            >
              <div className="relative flex items-center justify-center">
                {/* Heroic Golden Red Glow */}
                <div className="absolute -inset-10 bg-gradient-to-t from-[#DE3124]/15 via-[#C5A048]/10 to-transparent rounded-full blur-3xl pointer-events-none" />

                {/* Handcrafted Mountain Sanjeevani Line Motif (Left) */}
                <div className="absolute -left-14 sm:-left-26 top-12 rotate-[-4deg] opacity-80">
                  <svg width="85" height="60" viewBox="0 0 85 60" fill="none" className="w-[70px] sm:w-[90px] h-auto">
                    <path d="M 5 55 L 35 15 L 55 35 L 75 22 L 82 55 Z" stroke="#8C6E4A" strokeWidth="1.4" fill="#E8D7B8" fillOpacity="0.4" strokeLinejoin="round" />
                    <circle cx="35" cy="12" r="3" fill="#C5A048" />
                  </svg>
                </div>

                {/* Handcrafted Botanical Vine (Right) */}
                <div className="absolute -right-12 sm:-right-22 bottom-6 rotate-[15deg] opacity-75 scale-x-[-1]">
                  <HandcraftedBotanicalVine className="w-[70px] sm:w-[85px] h-auto" />
                </div>

                {/* Handcrafted Hanuman Ceremonial Doll */}
                <div className="relative w-[180px] sm:w-[230px] md:w-[270px] h-[230px] sm:h-[290px] md:h-[340px] drop-shadow-[0_18px_28px_rgba(43,29,18,0.18)]">
                  <Image
                    src={STORY_STATES[2].characterImg}
                    alt={STORY_STATES[2].characterAlt}
                    fill
                    sizes="(max-width: 640px) 180px, (max-width: 768px) 230px, 270px"
                    className="object-contain object-bottom"
                    priority
                  />
                </div>

                {/* Soft Ground Shadow */}
                <div className="absolute -bottom-4 w-44 sm:w-56 md:w-64 h-5 bg-[radial-gradient(ellipse_at_center,rgba(43,29,18,0.22)_0%,rgba(43,29,18,0.06)_50%,transparent_75%)]" />
              </div>
            </div>

            {/* Visual 3: Ceremonial Queen / Mother & Handcrafted Bedtime Motifs */}
            <div
              ref={(el) => { visualRefs.current[3] = el; }}
              className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none opacity-0"
            >
              <div className="relative flex items-center justify-center">
                {/* Night Moonlit Glow */}
                <div className="absolute -inset-10 bg-gradient-to-t from-indigo-400/15 via-purple-300/10 to-transparent rounded-full blur-3xl pointer-events-none" />

                {/* Handcrafted Golden Crescent Moon & Star (Left) */}
                <div className="absolute -left-12 sm:-left-24 top-6 rotate-[-8deg] pointer-events-none">
                  <HandcraftedMoonStar className="w-[65px] sm:w-[80px] h-auto" />
                </div>

                {/* Handcrafted Temple Bell (Right) */}
                <div className="absolute -right-10 sm:-right-20 top-10 rotate-[8deg] pointer-events-none opacity-85">
                  <HandcraftedTempleBell className="w-[50px] sm:w-[65px] h-auto" />
                </div>

                {/* Handcrafted Ceremonial Queen & Mother Doll */}
                <div className="relative w-[170px] sm:w-[220px] md:w-[250px] h-[230px] sm:h-[290px] md:h-[340px] drop-shadow-[0_18px_28px_rgba(43,29,18,0.16)]">
                  <Image
                    src={STORY_STATES[3].characterImg}
                    alt={STORY_STATES[3].characterAlt}
                    fill
                    sizes="(max-width: 640px) 170px, (max-width: 768px) 220px, 250px"
                    className="object-contain object-bottom"
                    priority
                  />
                </div>

                {/* Soft Ground Shadow */}
                <div className="absolute -bottom-4 w-40 sm:w-52 md:w-60 h-5 bg-[radial-gradient(ellipse_at_center,rgba(43,29,18,0.20)_0%,rgba(43,29,18,0.05)_50%,transparent_75%)]" />
              </div>
            </div>
          </div>

          {/* 
            LAYER 2: LARGE DISPLAY HEADLINES
            Strictly centered below the visual stage, matching Papumba's bold, clean typographic hierarchy
          */}
          <div className="relative w-full min-h-[140px] sm:min-h-[160px] md:min-h-[180px] flex items-center justify-center mt-6 sm:mt-8 md:mt-10 px-2 sm:px-4">
            {STORY_STATES.map((state, idx) => (
              <div
                key={state.id}
                ref={(el) => { textRefs.current[idx] = el; }}
                className={clsx(
                  "absolute inset-0 flex flex-col items-center justify-center text-center",
                  idx !== 0 && "opacity-0"
                )}
              >
                <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-[54px] font-extrabold tracking-tight text-[#0f0f0f] max-w-2xl leading-[1.15] sm:leading-[1.12]">
                  {state.headline}
                </h2>
                <p className="mt-3 sm:mt-4 text-sm sm:text-base md:text-lg text-[#555555] font-medium max-w-lg leading-relaxed">
                  {state.subtext}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* 
          STAGE FOOTER CONTROLS
          - Bottom down-arrow circular button (matches Papumba & Hero)
          - Subtle state counter / pagination
        */}
        <div className="relative w-full flex items-center justify-center z-20">
          <button
            onClick={handleArrowClick}
            className="group w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-black text-white flex items-center justify-center shadow-lg hover:bg-neutral-800 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
            aria-label="Scroll to next storytelling moment"
          >
            <ArrowDown className="w-4 h-4 sm:w-5 sm:h-5 text-white transition-transform duration-200 group-hover:translate-y-0.5" />
          </button>

          {/* Right Floating Progress Dots (01, 02, 03, 04) */}
          <div className="absolute right-2 sm:right-6 md:right-10 flex flex-col items-center gap-2 sm:gap-2.5">
            {STORY_STATES.map((st, i) => (
              <button
                key={st.id}
                onClick={() => handleScrollToState(i)}
                className={clsx(
                  "rounded-full transition-all duration-300 flex items-center justify-center",
                  activeIndex === i
                    ? "w-3 h-7 sm:h-8 bg-gradient-to-b from-[#DE3124] to-[#C9281D] shadow-[0_2px_8px_rgba(201,40,29,0.4)]"
                    : "w-2.5 h-2.5 bg-[#0E1638]/20 hover:bg-[#0E1638]/50 hover:scale-110"
                )}
                aria-label={`Jump to narrative state ${st.number}: ${st.badge}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ─── Theatrical Ambient Threshold (Soft Warmth Transitioning into Theatre Curtain) ─── */}
      <div
        className="absolute bottom-0 left-0 right-0 h-32 sm:h-44 pointer-events-none z-10"
        style={{
          background:
            "linear-gradient(to bottom, transparent 0%, rgba(159,18,57,0.02) 40%, rgba(159,18,57,0.06) 75%, rgba(136,19,38,0.12) 100%)",
        }}
      />
    </section>
  );
}

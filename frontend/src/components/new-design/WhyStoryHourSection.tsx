"use client";

import React, { useEffect, useRef } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  ManuscriptCornerOrnament,
  HandcraftedPeacockFeather,
} from "./HandcraftedIllustrations";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/* ═══════════════════════════════════════════════════════════════════════════
   STORYTELLING CALLOUT DATA
   Authentic reasons that make StoryHour special (From live reference)
   ═══════════════════════════════════════════════════════════════════════════ */
interface StoryCallout {
  number: string;
  title: string;
  description: string;
  accentColor: string;
}

const LEFT_CALLOUTS: StoryCallout[] = [
  {
    number: "01",
    title: "Cultural Storytelling",
    description:
      "Authentic stories rooted in Indian mythology, history and traditions, passed down through generations.",
    accentColor: "#C9281D", // StoryHour Red
  },
  {
    number: "02",
    title: "For All Ages",
    description:
      "Thoughtfully narrated stories designed for children, parents, and educators alike.",
    accentColor: "#0E1638", // StoryHour Navy
  },
  {
    number: "03",
    title: "Audio-First Experience",
    description:
      "Immersive storytelling through carefully crafted audio, soothing music, and screen-free imagination.",
    accentColor: "#1A6FB5", // Soft cultural blue
  },
];

const RIGHT_CALLOUTS: StoryCallout[] = [
  {
    number: "04",
    title: "Experienced Storytellers",
    description:
      "Stories brought to life through live performance, skits, and traditional puppet theatre across India and the UK.",
    accentColor: "#991B1B", // Traditional crimson
  },
  {
    number: "05",
    title: "Engaging & Expressive",
    description:
      "Emotion, expressive voice modulation, and dynamic performance make every character feel vivid and alive.",
    accentColor: "#C9281D", // StoryHour Red
  },
  {
    number: "06",
    title: "Preserving Traditions",
    description:
      "A dedicated digital effort to preserve ancient heritage and help cultural stories reach new generations worldwide.",
    accentColor: "#2A6546", // Deep heritage green
  },
];

/* ═══════════════════════════════════════════════════════════════════════════
   CALLOUT ITEM COMPONENT (Editorial Storybook Annotation)
   No generic SaaS cards — pure typography and handcrafted editorial accents
   ═══════════════════════════════════════════════════════════════════════════ */
function CalloutItem({
  item,
  alignment = "left",
}: {
  item: StoryCallout;
  alignment?: "left" | "right";
}) {
  const isRightAligned = alignment === "right";

  return (
    <div
      className={`group relative flex flex-col ${
        isRightAligned ? "lg:items-end lg:text-right" : "items-start text-left"
      } transition-all duration-300`}
    >
      {/* Handcrafted Number Badge with Editorial Flourish Line */}
      <div
        className={`flex items-center gap-2 mb-1.5 ${
          isRightAligned ? "lg:flex-row-reverse" : "flex-row"
        }`}
      >
        <span
          className="font-serif text-xs sm:text-sm font-extrabold tracking-widest uppercase"
          style={{ color: item.accentColor }}
        >
          {item.number}
        </span>
        <span
          className={`h-px w-5 sm:w-8 bg-gradient-to-r ${
            isRightAligned
              ? "lg:bg-gradient-to-l from-current to-transparent"
              : "from-current to-transparent"
          } opacity-50`}
          style={{ color: item.accentColor }}
        />
      </div>

      {/* Feature Heading */}
      <h3 className="text-lg sm:text-xl md:text-[22px] font-bold text-[#1A1A1A] tracking-tight leading-snug group-hover:text-[#C9281D] transition-colors duration-200">
        {item.title}
      </h3>

      {/* Description */}
      <p className="mt-1.5 text-sm sm:text-[15px] text-[#555] font-normal leading-relaxed max-w-[320px]">
        {item.description}
      </p>

      {/* Handcrafted connecting dot & motif */}
      <div
        className={`mt-3 flex items-center gap-1.5 opacity-25 group-hover:opacity-75 transition-opacity duration-300 ${
          isRightAligned ? "lg:flex-row-reverse" : "flex-row"
        }`}
      >
        <div
          className="w-1.5 h-1.5 rounded-full"
          style={{ backgroundColor: item.accentColor }}
        />
        <div
          className="h-px w-8 sm:w-12"
          style={{ backgroundColor: item.accentColor }}
        />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT: WhyStoryHourSection
   ═══════════════════════════════════════════════════════════════════════════ */
export default function WhyStoryHourSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const artworkRef = useRef<HTMLDivElement>(null);
  const leftCalloutsRef = useRef<HTMLDivElement>(null);
  const rightCalloutsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      // 1. Header Reveal (Eyebrow + Title + Subtext)
      if (headerRef.current) {
        gsap.fromTo(
          headerRef.current,
          { opacity: 0, y: 28 },
          {
            opacity: 1,
            y: 0,
            duration: 0.85,
            ease: "power2.out",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top 80%",
              toggleActions: "play reverse play reverse",
            },
          }
        );
      }

      // 2. Central Artwork Entrance
      if (artworkRef.current) {
        gsap.fromTo(
          artworkRef.current,
          { opacity: 0, scale: 0.94, y: 35 },
          {
            opacity: 1,
            scale: 1,
            y: 0,
            duration: 0.95,
            ease: "power2.out",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top 72%",
              toggleActions: "play reverse play reverse",
            },
          }
        );

        // Subtle Parallax float on the artwork as user scrolls across section
        gsap.to(artworkRef.current, {
          y: -20,
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: 1.2,
          },
        });
      }

      // 3. Left Callouts Reveal (staggered from left)
      if (leftCalloutsRef.current) {
        const items = Array.from(leftCalloutsRef.current.children);
        gsap.fromTo(
          items,
          { opacity: 0, x: -25 },
          {
            opacity: 1,
            x: 0,
            duration: 0.75,
            stagger: 0.12,
            ease: "power2.out",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top 68%",
              toggleActions: "play reverse play reverse",
            },
          }
        );
      }

      // 4. Right Callouts Reveal (staggered from right)
      if (rightCalloutsRef.current) {
        const items = Array.from(rightCalloutsRef.current.children);
        gsap.fromTo(
          items,
          { opacity: 0, x: 25 },
          {
            opacity: 1,
            x: 0,
            duration: 0.75,
            stagger: 0.12,
            ease: "power2.out",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top 68%",
              toggleActions: "play reverse play reverse",
            },
          }
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="why-storyhour"
      ref={sectionRef}
      className="relative w-full py-20 sm:py-28 md:py-36 bg-[#FAF6EE] text-[#1A1A1A] overflow-hidden select-none"
      aria-label="Why StoryHourGlobal — Stories Told With Heart & Heritage"
    >
      {/* ─── WARM PARCHMENT AMBIENCE & ILLUMINATED MANUSCRIPT MOTIFS ─── */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_65%_at_50%_35%,#FFFDF9_0%,#FAF6EE_60%,#F1E9DA_100%)] pointer-events-none" />

      {/* Delicate Manuscript Corner Ornaments */}
      <div className="absolute top-6 left-6 sm:top-10 sm:left-10 opacity-20 pointer-events-none hidden md:block">
        <ManuscriptCornerOrnament position="top-left" />
      </div>
      <div className="absolute top-6 right-6 sm:top-10 sm:right-10 opacity-20 pointer-events-none hidden md:block">
        <ManuscriptCornerOrnament position="top-right" />
      </div>
      <div className="absolute bottom-6 left-6 sm:bottom-10 sm:left-10 opacity-20 pointer-events-none hidden md:block">
        <ManuscriptCornerOrnament position="bottom-left" />
      </div>
      <div className="absolute bottom-6 right-6 sm:bottom-10 sm:right-10 opacity-20 pointer-events-none hidden md:block">
        <ManuscriptCornerOrnament position="bottom-right" />
      </div>

      {/* Main Container */}
      <div className="relative z-10 max-w-[1360px] mx-auto px-5 sm:px-8">
        {/* ═══════════════════════════════════════════════════════════════
            1. SECTION HEADER
            ═══════════════════════════════════════════════════════════════ */}
        <div
          ref={headerRef}
          className="flex flex-col items-center text-center max-w-3xl mx-auto mb-14 sm:mb-20 md:mb-24"
        >
          {/* Eyebrow Label with Manuscript Rule Lines */}
          <div className="flex items-center gap-3 sm:gap-4 mb-3">
            <span className="h-px w-6 sm:w-12 bg-gradient-to-r from-transparent via-[#C9281D]/60 to-[#C9281D]" />
            <span className="text-[11px] sm:text-xs font-bold tracking-[0.24em] uppercase text-[#C9281D]">
              Why StoryHourGlobal?
            </span>
            <span className="h-px w-6 sm:w-12 bg-gradient-to-l from-transparent via-[#C9281D]/60 to-[#C9281D]" />
          </div>

          {/* Main Display Headline */}
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-[56px] font-extrabold tracking-[-0.03em] text-[#1A1A1A] leading-[1.12]">
            Stories Told With
            <br className="hidden sm:inline" /> Heart &amp; Heritage
          </h2>

          {/* Subtext */}
          <p className="mt-3.5 sm:mt-4 text-base sm:text-lg text-[#666] font-medium max-w-xl leading-relaxed">
            Here is what makes our cultural stories, expressive vocal
            performances, and traditional puppet theatre truly unforgettable.
          </p>
        </div>

        {/* ═══════════════════════════════════════════════════════════════
            2. EDITORIAL COMPOSITION (Left Callouts | Artwork | Right Callouts)
            ═══════════════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 sm:gap-12 lg:gap-8 xl:gap-12 items-center">
          {/* ─── LEFT COLUMN (Features 01–03) ─── */}
          <div
            ref={leftCalloutsRef}
            className="lg:col-span-4 flex flex-col gap-9 sm:gap-12 xl:gap-14 order-2 lg:order-1"
          >
            {LEFT_CALLOUTS.map((item) => (
              <CalloutItem key={item.number} item={item} alignment="right" />
            ))}
          </div>

          {/* ─── CENTRAL COLUMN (Storybook Artwork Framing) ─── */}
          <div
            ref={artworkRef}
            className="lg:col-span-4 flex justify-center order-1 lg:order-2 my-2 lg:my-0 will-change-transform"
          >
            <div className="relative w-full max-w-[320px] sm:max-w-[360px] md:max-w-[380px] lg:max-w-[390px] xl:max-w-[420px]">
              {/* Decorative Peacock Feather accent behind artwork */}
              <div className="absolute -top-10 -right-6 sm:-top-12 sm:-right-8 w-16 sm:w-20 h-28 sm:h-36 opacity-30 pointer-events-none transform rotate-12">
                <HandcraftedPeacockFeather className="w-full h-full" />
              </div>

              {/* Handcrafted Storybook Frame (Paper Double-Matte + Arch) */}
              <div className="relative rounded-t-[140px] sm:rounded-t-[170px] rounded-b-3xl p-3 sm:p-4 bg-[#FDFBF7] shadow-[0_24px_64px_rgba(40,25,10,0.14),0_6px_20px_rgba(40,25,10,0.06)] ring-1 ring-[#D4AF37]/35">
                {/* Fine Inner Filigree Border */}
                <div className="relative rounded-t-[130px] sm:rounded-t-[158px] rounded-b-2xl overflow-hidden ring-1 ring-[#C5A048]/30 bg-[#FAF6EE]">
                  {/* Aspect Ratio Container */}
                  <div className="relative aspect-[3/4] w-full">
                    <Image
                      src="/images/storyteller-theatre.jpg"
                      alt="StoryHour Founder & Storyteller performing with Indian puppet theatre characters"
                      fill
                      priority
                      sizes="(max-width: 640px) 320px, (max-width: 1024px) 380px, 420px"
                      className="object-cover object-top transition-transform duration-700 ease-out hover:scale-[1.02]"
                    />

                    {/* Warm paper vignette lighting overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent pointer-events-none" />
                  </div>
                </div>

                {/* Subtle Traditional Caption Plaque below the Artwork */}
                <div className="mt-3 flex items-center justify-center gap-2 text-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C9281D] opacity-75" />
                  <span className="text-[11px] sm:text-xs font-serif font-semibold text-[#8C6E4A] tracking-wider uppercase">
                    Live Puppet Theatre &bull; UK &amp; India
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C9281D] opacity-75" />
                </div>
              </div>
            </div>
          </div>

          {/* ─── RIGHT COLUMN (Features 04–06) ─── */}
          <div
            ref={rightCalloutsRef}
            className="lg:col-span-4 flex flex-col gap-9 sm:gap-12 xl:gap-14 order-3"
          >
            {RIGHT_CALLOUTS.map((item) => (
              <CalloutItem key={item.number} item={item} alignment="left" />
            ))}
          </div>
        </div>
      </div>

      {/* ─── Gentle Transition into Footer Storybook Sky ─── */}
      <div
        className="absolute bottom-0 left-0 right-0 h-24 sm:h-32 pointer-events-none z-0"
        style={{
          background:
            "linear-gradient(to bottom, transparent 0%, rgba(45,136,246,0.04) 40%, rgba(45,136,246,0.12) 80%, rgba(45,136,246,0.22) 100%)",
        }}
      />
    </section>
  );
}

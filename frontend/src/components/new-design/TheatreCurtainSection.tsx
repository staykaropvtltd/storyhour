"use client";

import React, { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  ManuscriptCornerOrnament,
} from "./HandcraftedIllustrations";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/* ═══════════════════════════════════════════════════════════════════════════
   STORYHOUR BOOK DATA
   Real audiobook covers from /public/images
   ═══════════════════════════════════════════════════════════════════════════ */
interface BookItem {
  id: string;
  title: string;
  subtitle: string;
  language: string;
  languageColor: string;
  imageSrc: string;
  imageAlt: string;
  accolade?: string;
}

const BOOKS: BookItem[] = [
  {
    id: "ramayana-english",
    title: "Ramayana",
    subtitle: "An Ancient Indian Epic",
    language: "English",
    languageColor: "#1a6fb5",
    imageSrc: "/images/ramayana_epic.jpg",
    imageAlt: "Ramayana – An Ancient Indian Epic, English audiobook cover by Shreyas & Ayur Pulle",
    accolade: '"Best Audiobooks of 2017" — The Times, UK',
  },
  {
    id: "ramayana-hindi",
    title: "रामायण",
    subtitle: "प्राचीन भारतीय महाकाव्य",
    language: "हिन्दी",
    languageColor: "#8C2D19",
    imageSrc: "/images/ramayan_hindi.jpg",
    imageAlt: "रामायण — Ramayana Hindi audiobook cover, Kendriya Vidyalaya narration",
  },
  {
    id: "ramayana-telugu",
    title: "రామాయణం",
    subtitle: "ఆది కావ్యం",
    language: "తెలుగు",
    languageColor: "#2A6546",
    imageSrc: "/images/ramayan_telugu.jpg",
    imageAlt: "రామాయణం — Ramayana Telugu audiobook cover, Devnar School narration",
  },
];

/* ═══════════════════════════════════════════════════════════════════════════
   SOFT STORYBOOK FOLD HIGHLIGHTS (Curved bezier overlay)
   Warm, friendly drape contours matching the children's storybook aesthetic
   ═══════════════════════════════════════════════════════════════════════════ */
function StorybookCurtainFolds({ side }: { side: "left" | "right" }) {
  const paths = [
    { startX: 7, midX: 7.2, endX: 8, stroke: "rgba(255,220,230,0.35)", width: 2.2 },
    { startX: 15, midX: 14.8, endX: 16.5, stroke: "rgba(100,10,25,0.32)", width: 3.2 },
    { startX: 23, midX: 23.3, endX: 24.8, stroke: "rgba(255,220,230,0.32)", width: 2 },
    { startX: 31, midX: 30.6, endX: 33, stroke: "rgba(100,10,25,0.35)", width: 3.5 },
    { startX: 39, midX: 39.4, endX: 41.5, stroke: "rgba(255,220,230,0.38)", width: 2.4 },
    { startX: 47, midX: 46.5, endX: 49.5, stroke: "rgba(100,10,25,0.38)", width: 3.8 },
    { startX: 55, midX: 55.5, endX: 58, stroke: "rgba(255,220,230,0.35)", width: 2.2 },
    { startX: 63, midX: 62.4, endX: 66, stroke: "rgba(100,10,25,0.4)", width: 4 },
    { startX: 71, midX: 71.6, endX: 74.5, stroke: "rgba(255,220,230,0.4)", width: 2.6 },
    { startX: 79, midX: 78.3, endX: 82.5, stroke: "rgba(100,10,25,0.42)", width: 4.2 },
    { startX: 87, midX: 87.7, endX: 90.8, stroke: "rgba(255,220,230,0.42)", width: 2.8 },
    { startX: 95, midX: 94.5, endX: 98, stroke: "rgba(100,10,25,0.45)", width: 4.5 },
  ];

  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      preserveAspectRatio="none"
      viewBox="0 0 100 100"
      aria-hidden="true"
    >
      {paths.map((p, i) => {
        const sX = side === "left" ? p.startX : 100 - p.startX;
        const mX = side === "left" ? p.midX : 100 - p.midX;
        const eX = side === "left" ? p.endX : 100 - p.endX;

        return (
          <path
            key={i}
            d={`M ${sX} 0 Q ${mX} 50 ${eX} 100`}
            stroke={p.stroke}
            strokeWidth={p.width * 0.16}
            fill="none"
            strokeLinecap="round"
          />
        );
      })}
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   WARM SUNNY GOLD BORDER & TASSELS
   Playful, cheerful storybook trim
   ═══════════════════════════════════════════════════════════════════════════ */
function PlayfulGoldBorder({ side }: { side: "left" | "right" }) {
  const isLeft = side === "left";

  return (
    <div
      className={`absolute top-0 ${isLeft ? "right-0" : "left-0"} w-4 sm:w-5 h-full z-[6] pointer-events-none select-none flex flex-col`}
    >
      {/* Warm Sunny Gold Braid Ribbon */}
      <div className="w-full h-full relative overflow-hidden bg-gradient-to-r from-[#F59E0B] via-[#FDE047] to-[#D97706] shadow-[0_0_10px_rgba(245,158,11,0.4)]">
        <div
          className="absolute inset-0 opacity-25"
          style={{
            backgroundImage: `repeating-linear-gradient(${isLeft ? "45deg" : "-45deg"}, #78350F 0px, #78350F 2px, transparent 2px, transparent 6px)`,
          }}
        />
        <div
          className={`absolute top-0 ${isLeft ? "right-0.5" : "left-0.5"} w-[1.5px] h-full bg-white/70`}
        />
      </div>

      {/* Cute hanging tassels */}
      <div className="absolute inset-0 flex flex-col justify-around items-center pointer-events-none py-14">
        {Array.from({ length: 7 }, (_, i) => (
          <div
            key={i}
            className="flex flex-col items-center origin-top"
            style={{
              animation: `tasselSway ${3 + (i % 3) * 0.4}s ease-in-out infinite alternate`,
              animationDelay: `${i * 0.2}s`,
            }}
          >
            {/* Small golden bead */}
            <div className="w-1.5 h-1.5 rounded-full bg-[#FEF08A] shadow-xs" />
            {/* String */}
            <div className="w-[1px] h-2.5 sm:h-3 bg-[#F59E0B]" />
            {/* Little bell tassel */}
            <div className="w-2 sm:w-2.5 h-3 sm:h-3.5 rounded-b-sm bg-gradient-to-b from-[#FDE047] via-[#F59E0B] to-[#B45309] shadow-xs" />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   SCALLOPED BOTTOM HEM WITH GOLD FRINGE
   Friendly, rounded storybook puppet theatre drape
   ═══════════════════════════════════════════════════════════════════════════ */
// Precomputed integer percentages to ensure exact SSR/Client hydration match
const FRINGE_HEIGHTS = Array.from({ length: 50 }, (_, i) => Math.round(70 + Math.sin(i * 0.5) * 30));

function StorybookBottomHem({ side }: { side: "left" | "right" }) {
  return (
    <div className="absolute -bottom-4 sm:-bottom-6 left-0 right-0 z-20 pointer-events-none select-none">
      {/* Curved scalloped drape border */}
      <svg
        viewBox="0 0 400 30"
        className="w-full h-4 sm:h-6"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient
            id={`bottomDrape-${side}`}
            x1="0%"
            y1="0%"
            x2="0%"
            y2="100%"
          >
            <stop offset="0%" stopColor="#7F1D1D" />
            <stop offset="60%" stopColor="#581C87" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#3B0764" stopOpacity="0.8" />
          </linearGradient>

          <linearGradient
            id={`goldTrim-${side}`}
            x1="0%"
            y1="0%"
            x2="100%"
            y2="0%"
          >
            <stop offset="0%" stopColor="#D97706" />
            <stop offset="25%" stopColor="#F59E0B" />
            <stop offset="50%" stopColor="#FDE047" />
            <stop offset="75%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#D97706" />
          </linearGradient>
        </defs>

        <path
          d="M0,0 
             Q25,20 50,2 Q75,20 100,2 
             Q125,20 150,2 Q175,20 200,2 
             Q225,20 250,2 Q275,20 300,2 
             Q325,20 350,2 Q375,20 400,2 
             L400,0 L0,0 Z"
          fill={`url(#bottomDrape-${side})`}
        />

        <path
          d="M0,0 
             Q25,20 50,2 Q75,20 100,2 
             Q125,20 150,2 Q175,20 200,2 
             Q225,20 250,2 Q275,20 300,2 
             Q325,20 350,2 Q375,20 400,2"
          fill="none"
          stroke={`url(#goldTrim-${side})`}
          strokeWidth="2.5"
        />
      </svg>

      {/* Gold fringe fringe underneath */}
      <div className="w-full h-3 sm:h-4 -mt-1.5 sm:-mt-2 overflow-hidden flex" suppressHydrationWarning>
        {FRINGE_HEIGHTS.map((heightPercent, i) => (
          <div
            key={i}
            className="flex-1 h-full mr-[1px] bg-gradient-to-b from-[#FDE047] via-[#F59E0B] to-[#B45309] opacity-90"
            style={{
              height: `${heightPercent}%`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   PUPPET THEATRE CANOPY / VALANCE (Slim, cheerful, non-intrusive)
   Sits neatly at the very top of the stage frame without obscuring content
   ═══════════════════════════════════════════════════════════════════════════ */
function PuppetTheatreCanopy() {
  return (
    <div className="absolute top-0 left-0 w-full z-[20] pointer-events-none select-none">
      {/* 1. Curved Storybook Proscenium Arch (Smoothly bridges Storytelling Cream #FAF8F3 into Red Velvet Theatre) */}
      <div className="w-full overflow-hidden -mb-[1px]">
        <svg
          viewBox="0 0 1440 38"
          fill="none"
          preserveAspectRatio="none"
          className="w-full h-4 sm:h-6 md:h-8 drop-shadow-[0_4px_10px_rgba(0,0,0,0.18)]"
          aria-hidden="true"
        >
          {/* Proscenium Cream Folio Arch connecting to preceding section */}
          <path
            d="M0,0 L1440,0 L1440,12 Q720,36 0,12 Z"
            fill="#FAF8F3"
          />
          {/* Delicate Gold Arch Piping */}
          <path
            d="M0,12 Q720,36 1440,12"
            stroke="url(#goldArchGrad)"
            strokeWidth="2"
            fill="none"
          />
          <defs>
            <linearGradient id="goldArchGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#D97706" />
              <stop offset="25%" stopColor="#FDE047" />
              <stop offset="50%" stopColor="#F59E0B" />
              <stop offset="75%" stopColor="#FDE047" />
              <stop offset="100%" stopColor="#D97706" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* 2. Slim, cheerful storybook pelmet bar */}
      <div className="relative w-full h-8 sm:h-10 bg-gradient-to-b from-[#9F1239] via-[#BE123C] to-[#881337] shadow-[0_6px_18px_rgba(0,0,0,0.3)] overflow-hidden flex items-center justify-center">
        {/* Top Gold Trim Accent */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#F59E0B] via-[#FDE047] to-[#D97706]" />

        {/* Playful scalloped bunting pattern */}
        <div className="w-full h-full flex opacity-75">
          {Array.from({ length: 12 }, (_, i) => (
            <div
              key={i}
              className="flex-1 h-full border-r border-[#FDA4AF]/20"
              style={{
                background:
                  i % 2 === 0
                    ? "radial-gradient(ellipse at 50% 0%, #E11D48 0%, #9F1239 100%)"
                    : "radial-gradient(ellipse at 50% 0%, #BE123C 0%, #881337 100%)",
              }}
            />
          ))}
        </div>

        {/* Bottom Gold Piping */}
        <div className="absolute bottom-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#F59E0B] via-[#FDE047] to-[#D97706]" />
      </div>

      {/* Scallop drop ribbon along the bottom edge */}
      <div className="w-full -mt-[1px]">
        <svg
          viewBox="0 0 500 12"
          preserveAspectRatio="none"
          className="w-full h-2.5 sm:h-3 drop-shadow-[0_2px_4px_rgba(0,0,0,0.2)]"
          aria-hidden="true"
        >
          <path
            d="M0,0 
               Q25,12 50,1 Q75,12 100,1 
               Q125,12 150,1 Q175,12 200,1 
               Q225,12 250,1 Q275,12 300,1 
               Q325,12 350,1 Q375,12 400,1 
               Q425,12 450,1 Q475,12 500,1 
               L500,0 L0,0 Z"
            fill="#F59E0B"
          />
        </svg>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT: TheatreCurtainSection
   ═══════════════════════════════════════════════════════════════════════════ */
export default function TheatreCurtainSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const leftCurtainRef = useRef<HTMLDivElement>(null);
  const rightCurtainRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (
      !containerRef.current ||
      !leftCurtainRef.current ||
      !rightCurtainRef.current
    )
      return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const ctx = gsap.context(() => {
      // Set initial positions: curtains closed
      gsap.set(leftCurtainRef.current, {
        xPercent: 0,
        scaleX: 1,
        transformOrigin: "left center",
      });
      gsap.set(rightCurtainRef.current, {
        xPercent: 0,
        scaleX: 1,
        transformOrigin: "right center",
      });

      if (contentRef.current) {
        gsap.set(contentRef.current, { opacity: 0.15, scale: 0.96 });
      }

      if (prefersReducedMotion) {
        ScrollTrigger.create({
          trigger: containerRef.current,
          start: "top top",
          end: "bottom bottom",
          onUpdate: (self) => {
            const p = self.progress;
            if (p > 0.15) {
              gsap.set(leftCurtainRef.current, { xPercent: -100 });
              gsap.set(rightCurtainRef.current, { xPercent: 100 });
              if (contentRef.current) {
                gsap.set(contentRef.current, { opacity: 1, scale: 1 });
              }
            } else {
              gsap.set(leftCurtainRef.current, { xPercent: 0 });
              gsap.set(rightCurtainRef.current, { xPercent: 0 });
              if (contentRef.current) {
                gsap.set(contentRef.current, { opacity: 0.15, scale: 0.96 });
              }
            }
          },
        });
        return;
      }

      // Master GSAP Timeline: smoothly parts curtains on scroll
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.6,
        },
      });

      // 0–12%: Closed state
      tl.addLabel("closed");
      tl.to({}, { duration: 0.12 });

      // 12–85%: Theatrical curtain opening
      tl.addLabel("opening")
        .to(
          leftCurtainRef.current,
          {
            xPercent: -100,
            scaleX: 0.42,
            duration: 0.73,
            ease: "power2.inOut",
          },
          "opening"
        )
        .to(
          rightCurtainRef.current,
          {
            xPercent: 100,
            scaleX: 0.42,
            duration: 0.73,
            ease: "power2.inOut",
          },
          "opening"
        )
        .to(
          contentRef.current,
          {
            opacity: 1,
            scale: 1,
            duration: 0.58,
            ease: "power2.out",
          },
          "opening+=0.1"
        )
        .addLabel("open");

      // 85–100%: Hold open so books can be explored
      tl.to({}, { duration: 0.15 });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      id="puppet-theatre"
      className="relative w-full h-[300vh] select-none"
      aria-label="StoryHour Book Showcase — Puppet Theatre"
    >
      {/* Fallback anchor for #theatre-curtain and #audiobooks */}
      <span id="theatre-curtain" className="sr-only" />
      <span id="audiobooks" className="sr-only" />

      {/* ───────────────────────────────────────────────────────────────────
          STICKY VIEWPORT (100vh pinned stage)
          Layer 1: Books Stage Behind (z-1)
          Layer 2: Left Curtain (z-10)
          Layer 3: Right Curtain (z-10)
          Layer 4: Puppet Theatre Canopy (z-20)
          ─────────────────────────────────────────────────────────────────── */}
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-[#FAF8F3]">
        {/* ═══════════════════════════════════════════════════════════════
            LAYER 1: STORYHOUR BOOK COLLECTION (Revealed behind curtains)
            Properly spaced with ample top padding below the header & canopy
            ═══════════════════════════════════════════════════════════════ */}
        <div
          ref={contentRef}
          className="absolute inset-0 z-[1] flex flex-col items-center justify-between pt-16 sm:pt-20 md:pt-24 pb-5 sm:pb-8 px-4 sm:px-8 overflow-hidden will-change-transform bg-[#FAF8F3]"
        >
          {/* Warm parchment radial glow matching the scroll storytelling section */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_65%_at_50%_40%,#FCFAF5_0%,#F7F2E8_55%,#EFE8DA_100%)] pointer-events-none" />

          {/* Manuscript corner ornaments */}
          <div className="absolute top-8 left-8 opacity-20 pointer-events-none hidden lg:block">
            <ManuscriptCornerOrnament position="top-left" />
          </div>
          <div className="absolute top-8 right-8 opacity-20 pointer-events-none hidden lg:block">
            <ManuscriptCornerOrnament position="top-right" />
          </div>
          <div className="absolute bottom-8 left-8 opacity-20 pointer-events-none hidden lg:block">
            <ManuscriptCornerOrnament position="bottom-left" />
          </div>
          <div className="absolute bottom-8 right-8 opacity-20 pointer-events-none hidden lg:block">
            <ManuscriptCornerOrnament position="bottom-right" />
          </div>

          {/* Top Section Header: Clearly visible, clean, no clipped text */}
          <div className="relative z-10 flex flex-col items-center text-center max-w-2xl mx-auto mt-1 sm:mt-2">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-[46px] font-extrabold tracking-tight text-[#1a1a1a] leading-[1.1] mb-1.5 sm:mb-2">
              StoryHour Books
            </h2>
            <p className="text-xs sm:text-sm md:text-base text-[#5a5a5a] font-medium max-w-lg leading-relaxed">
              Award-winning audiobooks that bring ancient Indian epics to life for young minds.
            </p>
          </div>

          {/* ─── BOOK CARDS GRID ─── */}
          <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-6 md:gap-8 lg:gap-10 w-full max-w-3xl my-auto py-1">
            {BOOKS.map((book, idx) => (
              <Link
                href="/stories"
                key={book.id}
                className="group flex flex-col items-center cursor-pointer"
              >
                {/* Book Cover Card */}
                <div
                  className="relative w-36 sm:w-44 md:w-48 lg:w-56 aspect-square rounded-2xl overflow-hidden shadow-[0_12px_36px_rgba(30,20,10,0.16),0_4px_12px_rgba(30,20,10,0.08)] transition-all duration-500 ease-out group-hover:shadow-[0_20px_48px_rgba(30,20,10,0.26),0_8px_18px_rgba(30,20,10,0.14)] group-hover:-translate-y-2 group-hover:scale-[1.03]"
                  style={{
                    transform: `perspective(800px) rotateY(${idx === 0 ? -3 : idx === 2 ? 3 : 0}deg)`,
                  }}
                >
                  {/* Spine edge shadow */}
                  <div className="absolute left-0 top-0 w-2.5 sm:w-3 h-full bg-gradient-to-r from-black/30 via-black/10 to-transparent z-10 pointer-events-none" />
                  {/* Top highlight */}
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-b from-white/35 to-transparent z-10 pointer-events-none" />

                  <Image
                    src={book.imageSrc}
                    alt={book.imageAlt}
                    fill
                    sizes="(max-width: 640px) 160px, (max-width: 1024px) 200px, 240px"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-[#C9281D]/0 to-transparent group-hover:from-[#C9281D]/8 group-hover:to-transparent transition-all duration-500 pointer-events-none z-[5]" />
                </div>

                {/* Book Info */}
                <div className="mt-2.5 sm:mt-3 flex flex-col items-center text-center">
                  <h3 className="text-sm sm:text-base md:text-lg font-bold text-[#1a1a1a] tracking-tight leading-snug group-hover:text-[#C9281D] transition-colors duration-200">
                    {book.title}
                  </h3>
                  <p className="text-xs text-[#777] font-medium mt-0.5">
                    {book.subtitle}
                  </p>

                  <span
                    className="mt-1.5 inline-block px-3 py-0.5 rounded-full text-[10px] sm:text-xs font-bold tracking-wide text-white shadow-xs"
                    style={{ backgroundColor: book.languageColor }}
                  >
                    {book.language}
                  </span>

                  {book.accolade && (
                    <p className="mt-1 text-[10px] sm:text-xs text-[#9a7d5a] font-semibold italic max-w-[180px] leading-snug">
                      {book.accolade}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>

          {/* CTA Button: Radiant, high-contrast, perfectly visible with clear vertical clearance */}
          <div className="relative z-20 flex justify-center mt-2 sm:mt-4 mb-2 sm:mb-4">
            <Link
              href="/stories"
              className="group inline-flex items-center gap-2.5 bg-gradient-to-r from-[#DE3124] via-[#C9281D] to-[#991B1B] hover:from-[#E6392D] hover:to-[#B52218] text-white font-extrabold text-sm sm:text-base px-8 sm:px-11 py-3 sm:py-3.5 rounded-full shadow-[0_10px_26px_rgba(201,40,29,0.42)] hover:shadow-[0_14px_32px_rgba(201,40,29,0.55)] border-2 border-white/40 hover:-translate-y-0.5 active:translate-y-0 hover:scale-105 transition-all duration-200 tracking-tight cursor-pointer focus:outline-none focus:ring-4 focus:ring-[#C9281D]/30"
            >
              <svg
                className="w-5 h-5 text-white group-hover:scale-110 transition-transform"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a2.5 2.5 0 0 1 0-5H20" />
              </svg>
              <span>Explore All Stories</span>
            </Link>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════
            LAYER 2: LEFT PUPPET THEATRE CURTAIN
            Warm, friendly crimson velvet matching the playful StoryHour aesthetic
            ═══════════════════════════════════════════════════════════════ */}
        <div
          ref={leftCurtainRef}
          className="absolute top-0 left-0 w-[53%] h-full z-[10] pointer-events-none will-change-transform shadow-[8px_0_28px_rgba(0,0,0,0.35)]"
        >
          {/* Storybook Theatrical Velvet Pleat Shader */}
          <div
            className="absolute inset-0"
            style={{
              background: `
                radial-gradient(ellipse 90% 60% at 50% 25%, rgba(255, 140, 160, 0.3) 0%, transparent 70%),
                linear-gradient(180deg, rgba(140, 15, 35, 0.45) 0%, rgba(190, 18, 60, 0.05) 25%, rgba(160, 15, 45, 0.1) 75%, rgba(110, 10, 25, 0.55) 100%),
                linear-gradient(118deg, transparent 35%, rgba(255, 210, 220, 0.18) 50%, transparent 65%),
                repeating-linear-gradient(
                  90deg,
                  #881326 0px,
                  #9F122C 12px,
                  #C01637 28px,
                  #DC264A 42px,
                  #F23D64 54px,
                  #FF758F 58px,
                  #F23D64 62px,
                  #DC264A 74px,
                  #C01637 88px,
                  #9F122C 104px,
                  #881326 116px
                )
              `,
            }}
          />

          {/* Gentle texture overlay */}
          <div
            className="absolute inset-0 opacity-[0.025] pointer-events-none"
            style={{
              backgroundImage:
                "radial-gradient(#FFF 1px, transparent 1px), radial-gradient(#000 1px, transparent 1px)",
              backgroundSize: "4px 4px",
              backgroundPosition: "0 0, 2px 2px",
            }}
          />

          {/* Curved Drape Folds Overlay */}
          <StorybookCurtainFolds side="left" />

          {/* Soft Center Overlap Shadow */}
          <div className="absolute top-0 right-0 w-6 h-full bg-gradient-to-l from-black/40 to-transparent pointer-events-none" />

          {/* Gold Trim & Tassels along leading right edge */}
          <PlayfulGoldBorder side="left" />

          {/* Scalloped Bottom Hem */}
          <StorybookBottomHem side="left" />
        </div>

        {/* ═══════════════════════════════════════════════════════════════
            LAYER 3: RIGHT PUPPET THEATRE CURTAIN (Mirrored)
            ═══════════════════════════════════════════════════════════════ */}
        <div
          ref={rightCurtainRef}
          className="absolute top-0 right-0 w-[53%] h-full z-[10] pointer-events-none will-change-transform shadow-[-8px_0_28px_rgba(0,0,0,0.35)]"
        >
          {/* Storybook Theatrical Velvet Pleat Shader (Mirrored) */}
          <div
            className="absolute inset-0"
            style={{
              background: `
                radial-gradient(ellipse 90% 60% at 50% 25%, rgba(255, 140, 160, 0.3) 0%, transparent 70%),
                linear-gradient(180deg, rgba(140, 15, 35, 0.45) 0%, rgba(190, 18, 60, 0.05) 25%, rgba(160, 15, 45, 0.1) 75%, rgba(110, 10, 25, 0.55) 100%),
                linear-gradient(62deg, transparent 35%, rgba(255, 210, 220, 0.18) 50%, transparent 65%),
                repeating-linear-gradient(
                  90deg,
                  #881326 0px,
                  #9F122C 12px,
                  #C01637 28px,
                  #DC264A 42px,
                  #F23D64 54px,
                  #FF758F 58px,
                  #F23D64 62px,
                  #DC264A 74px,
                  #C01637 88px,
                  #9F122C 104px,
                  #881326 116px
                )
              `,
            }}
          />

          {/* Gentle texture overlay */}
          <div
            className="absolute inset-0 opacity-[0.025] pointer-events-none"
            style={{
              backgroundImage:
                "radial-gradient(#FFF 1px, transparent 1px), radial-gradient(#000 1px, transparent 1px)",
              backgroundSize: "4px 4px",
              backgroundPosition: "0 0, 2px 2px",
            }}
          />

          {/* Curved Drape Folds Overlay */}
          <StorybookCurtainFolds side="right" />

          {/* Soft Center Overlap Shadow */}
          <div className="absolute top-0 left-0 w-6 h-full bg-gradient-to-r from-black/40 to-transparent pointer-events-none" />

          {/* Gold Trim & Tassels along leading left edge */}
          <PlayfulGoldBorder side="right" />

          {/* Scalloped Bottom Hem */}
          <StorybookBottomHem side="right" />
        </div>

        {/* ═══════════════════════════════════════════════════════════════
            LAYER 4: PUPPET THEATRE CANOPY (Top Frame)
            Slim, friendly, cheerful proscenium bunting
            ═══════════════════════════════════════════════════════════════ */}
        <PuppetTheatreCanopy />

        {/* Top Theatrical Ambient Curtain Depth Shadow */}
        <div className="absolute top-0 left-0 w-full h-16 pointer-events-none bg-gradient-to-b from-black/25 via-black/5 to-transparent z-[15]" />

        {/* Bottom Organic Stage Footlight Apron (Dissolves stage floor into #FAF6EE) */}
        <div className="absolute bottom-0 left-0 right-0 z-[25] pointer-events-none overflow-hidden leading-none select-none">
          <div
            className="w-full h-10 sm:h-14"
            style={{
              background:
                "linear-gradient(to bottom, transparent 0%, rgba(250,246,238,0.3) 40%, rgba(250,246,238,0.75) 80%, #FAF6EE 100%)",
            }}
          />
          <div className="w-full -mt-5 sm:-mt-7">
            <svg
              viewBox="0 0 1440 50"
              fill="none"
              preserveAspectRatio="none"
              className="w-full h-5 sm:h-8 text-[#FAF6EE] drop-shadow-[0_-2px_6px_rgba(0,0,0,0.03)]"
              aria-hidden="true"
            >
              <path
                d="M0,22 C360,42 720,8 1080,32 C1260,44 1380,18 1440,24 L1440,50 L0,50 Z"
                fill="#FAF6EE"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Stage Bottom Transition Apron on 300vh container into Heritage Section */}
      <div
        className="absolute bottom-0 left-0 right-0 h-28 pointer-events-none z-10"
        style={{
          background:
            "linear-gradient(to bottom, transparent 0%, rgba(250,246,238,0.5) 50%, #FAF6EE 100%)",
        }}
      />

      {/* Embedded CSS for smooth micro-animations */}
      <style jsx global>{`
        @keyframes tasselSway {
          0% {
            transform: rotate(-3deg);
          }
          100% {
            transform: rotate(3deg);
          }
        }
      `}</style>
    </section>
  );
}

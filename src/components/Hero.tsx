"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAudio } from "@/context/AudioContext";
import { useLibraryCart } from "@/context/LibraryCartContext";
import { STORIES } from "@/data/storyhour-data";
import { Search, User, Bookmark, ShoppingBag, ArrowRight, Menu, X } from "lucide-react";
import { MagneticText } from "@/components/ui/morphing-cursor";

export default function Hero() {
  const { playStory } = useAudio();
  const { savedStoryIds, cartCount, setIsCartDrawerOpen, setIsSearchOpen, showToast } = useLibraryCart();

  // Mouse interaction state for interactive 3D parallax / tilt on hero artwork
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0, moveX: 0, moveY: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Detect pure mobile touch device (without mouse pointer) to use CSS float animation fallback
    const isTouch = window.matchMedia("(hover: none) and (pointer: coarse)").matches;
    setIsTouchDevice(isTouch);
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (isTouchDevice || !heroRef.current) return;
    const rect = heroRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5; // -0.5 to 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5; // -0.5 to 0.5

    // Subtle, smooth 3D tilt & parallax translation
    const rotateX = -y * 12; // max ~6 deg tilt
    const rotateY = x * 14;  // max ~7 deg tilt
    const moveX = x * 18;    // max ~9px parallax
    const moveY = y * 18;    // max ~9px parallax

    setTilt({ rotateX, rotateY, moveX, moveY });
    setIsHovered(true);
  }, [isTouchDevice]);

  const handleMouseLeave = useCallback(() => {
    setTilt({ rotateX: 0, rotateY: 0, moveX: 0, moveY: 0 });
    setIsHovered(false);
  }, []);

  // Row 1: Signature Audiobooks & Epics (Continuous Horizontal + Subtle Vertical Undulation)
  const row1Books = [
    {
      title: "Ramayana — An Ancient Indian Epic",
      lang: "English",
      src: "https://storyhour.co.uk/wp-content/uploads/2026/01/WhatsApp-Image-2026-01-19-at-17.28.53.jpeg",
      story: STORIES[0],
    },
    {
      title: "Ramayan — सम्पूर्ण स्वरबद्ध कथावाचन",
      lang: "Hindi",
      src: "https://storyhour.co.uk/wp-content/uploads/2026/01/WhatsApp-Image-2026-01-19-at-17.30.26.jpeg",
      story: STORIES[1],
    },
    {
      title: "Ramayanam — రామాయణం ప్రాచీన కావ్యం",
      lang: "Telugu",
      src: "https://storyhour.co.uk/wp-content/uploads/2026/01/WhatsApp-Image-2026-01-19-at-17.28.56.jpeg",
      story: STORIES[2],
    },
    {
      title: "Hanuman's Mighty Leap Across the Ocean",
      lang: "English",
      src: "https://storyhour.co.uk/wp-content/uploads/2026/01/Hanuman-2-1024x683.jpg",
      story: STORIES[3],
    },
    {
      title: "Panchatantra: The Clever Hare & The Lion",
      lang: "English",
      src: "https://storyhour.co.uk/wp-content/uploads/2026/01/Grand-Finale-5-scaled.jpg",
      story: STORIES[4],
    },
    {
      title: "Stories of Truth: Young Mohandas",
      lang: "Multilingual",
      src: "https://storyhour.co.uk/wp-content/uploads/2026/01/Gandhi-Prayers-STudents-1024x683.jpg",
      story: STORIES[5],
    },
    {
      title: "Ramayana Deluxe English Narration",
      lang: "English",
      src: "https://storyhour.co.uk/wp-content/uploads/2026/01/WhatsApp-Image-2026-01-19-at-17.28.53.jpeg",
      story: STORIES[0],
    },
    {
      title: "Ramayan Valmiki Hindi Mahakavya",
      lang: "Hindi",
      src: "https://storyhour.co.uk/wp-content/uploads/2026/01/WhatsApp-Image-2026-01-19-at-17.30.26.jpeg",
      story: STORIES[1],
    },
  ];

  // Row 2: Cultural Residencies & Stage Performances (Counter-Scrolling with Depth Parallax)
  const row2Books = [
    {
      title: "Spanish School London Cultural Residency",
      lang: "London, UK",
      src: "https://storyhour.co.uk/wp-content/uploads/2026/01/SpanishSchool-London-1-1024x1024.jpeg",
      story: STORIES[0],
    },
    {
      title: "Kendriya Vidyalaya Uppal Residency",
      lang: "Hyderabad",
      src: "https://storyhour.co.uk/wp-content/uploads/2026/01/KV-Uppal-1024x768.jpeg",
      story: STORIES[1],
    },
    {
      title: "Lighting The Lamp: Traditional Prologue",
      lang: "Cultural",
      src: "https://storyhour.co.uk/wp-content/uploads/2026/01/Lighting-The-Lamp-3-1024x683.jpg",
      story: STORIES[2],
    },
    {
      title: "Ramayanam Telugu Sacred Audio",
      lang: "Telugu",
      src: "https://storyhour.co.uk/wp-content/uploads/2026/01/WhatsApp-Image-2026-01-19-at-17.28.56.jpeg",
      story: STORIES[2],
    },
    {
      title: "Hanuman Chalisa & Sundarkand Legends",
      lang: "Children",
      src: "https://storyhour.co.uk/wp-content/uploads/2026/01/Hanuman-2-1024x683.jpg",
      story: STORIES[3],
    },
    {
      title: "Panchatantra: Moral Tales of India",
      lang: "Folk Lore",
      src: "https://storyhour.co.uk/wp-content/uploads/2026/01/Grand-Finale-5-scaled.jpg",
      story: STORIES[4],
    },
    {
      title: "Mahatma Gandhi Heritage Project",
      lang: "History",
      src: "https://storyhour.co.uk/wp-content/uploads/2026/01/Gandhi-Prayers-STudents-1024x683.jpg",
      story: STORIES[5],
    },
    {
      title: "StoryHour Intergenerational Theatre",
      lang: "Family",
      src: "https://storyhour.co.uk/wp-content/uploads/2026/01/SpanishSchool-London-1-1024x1024.jpeg",
      story: STORIES[0],
    },
  ];

  const handleBookClick = (book: typeof row1Books[0]) => {
    playStory(book.story);
    showToast(`Now Playing: ${book.title} (${book.lang})`);
  };

  const scrollTo = (id: string) => {
    setIsMobileMenuOpen(false);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    } else {
      showToast(`Exploring ${id} on StoryHour`);
    }
  };

  return (
    <section
      ref={heroRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative min-h-screen overflow-hidden bg-[#120A45] text-[#F7F4EE] select-none flex flex-col justify-between"
    >
      {/* Background Organic Abstract Curved Shapes — StoryHour Brand Palette */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden -z-0">
        {/* Subtle Ambient Brand Glow */}
        <div className="absolute top-0 right-1/4 w-[850px] h-[850px] rounded-full bg-[#2410A4]/35 blur-[150px]" />

        {/* Organic Shape 1: Rich Hour Blue (#2410A4) canopy silhouette framing the mythological artwork */}
        <svg
          className="absolute -top-16 right-[-8%] w-[68%] h-[95%] text-[#2410A4] opacity-50"
          viewBox="0 0 900 800"
          fill="none"
          preserveAspectRatio="none"
        >
          <path
            d="M200,0 C420,0 720,90 850,320 C940,490 890,720 740,790 C560,820 400,640 240,510 C90,390 50,140 200,0 Z"
            fill="currentColor"
          />
        </svg>

        {/* Organic Shape 2: Deep Midnight Ink Hill rising gently across the bottom-left */}
        <svg
          className="absolute bottom-0 left-0 w-full h-[65%] text-[#090522] opacity-85"
          viewBox="0 0 1440 600"
          fill="none"
          preserveAspectRatio="none"
        >
          <path
            d="M0,600 L0,320 C240,220 480,260 740,400 C980,530 1220,440 1440,340 L1440,600 Z"
            fill="currentColor"
          />
        </svg>

        {/* Organic Shape 3: Deep Royal Contour on far right */}
        <svg
          className="absolute top-0 right-0 w-[45%] h-[80%] text-[#1B0C6E] opacity-65"
          viewBox="0 0 600 700"
          fill="none"
          preserveAspectRatio="none"
        >
          <path
            d="M260,0 C420,50 560,180 600,380 L600,0 Z"
            fill="currentColor"
          />
        </svg>

      </div>

      {/* Top Integrated Navigation Bar */}
      <nav className="relative z-30 max-w-[1340px] mx-auto px-6 sm:px-10 pt-5 sm:pt-6 flex items-center justify-between w-full">
        {/* Left: Brand Logo */}
        <div className="flex items-center gap-2.5">
          <Link
            href="/"
            className="flex items-center gap-2 group cursor-pointer"
            aria-label="StoryHour Home"
          >
            <div className="relative h-8 w-28 sm:h-9 sm:w-36 brightness-0 invert opacity-95 group-hover:opacity-100 transition-opacity">
              <Image
                src="https://storyhour.co.uk/wp-content/uploads/2026/01/tp-logo.png"
                alt="StoryHour — Digital Storytelling Platform"
                fill
                priority
                className="object-contain object-left"
                sizes="150px"
              />
            </div>
          </Link>
        </div>

        {/* Center: Authentic StoryHour Navigation Links */}
        <div className="hidden lg:flex items-center gap-7 xl:gap-9 text-[15px] font-inter font-medium text-[#F7F4EE]/90 tracking-[-0.015em]">
          <Link
            href="/"
            className="hover:text-white transition-colors cursor-pointer py-1"
          >
            Home
          </Link>
          <Link
            href="/stories"
            className="hover:text-white transition-colors cursor-pointer py-1"
          >
            Books / Stories
          </Link>
          <Link
            href="/storytellers"
            className="hover:text-white transition-colors cursor-pointer py-1"
          >
            Storyteller / About
          </Link>
          <Link
            href="/contact"
            className="hover:text-white transition-colors cursor-pointer py-1"
          >
            Contact
          </Link>
          <Link
            href="/trailers"
            className="hover:text-white transition-colors cursor-pointer py-1"
          >
            Trailer
          </Link>
        </div>

        {/* Right: Actions (Search, Saved Library, User, Cart, Mobile Menu) */}
        <div className="flex items-center gap-3 sm:gap-5 text-[#F7F4EE]">
          {/* Search Button */}
          <button
            onClick={() => setIsSearchOpen(true)}
            aria-label="Search stories"
            className="text-[#F7F4EE]/90 hover:text-white transition-colors p-1.5 cursor-pointer"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Saved / Library Button */}
          <button
            onClick={() => {
              scrollTo("hero-cards");
              showToast(`You have ${savedStoryIds.length} stories saved in your library`);
            }}
            aria-label={`Saved library: ${savedStoryIds.length} stories`}
            className="relative text-[#F7F4EE]/90 hover:text-white transition-colors p-1.5 cursor-pointer"
          >
            <Bookmark className="w-5 h-5" />
            {savedStoryIds.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-white text-[#2410A4] text-[10px] font-bold flex items-center justify-center font-mono shadow-sm">
                {savedStoryIds.length}
              </span>
            )}
          </button>

          {/* Account Button */}
          <button
            onClick={() => showToast("Sign in to your StoryHour library")}
            aria-label="User account"
            className="text-[#F7F4EE]/90 hover:text-white transition-colors p-1.5 cursor-pointer"
          >
            <User className="w-5 h-5" />
          </button>

          {/* Cart Button */}
          <button
            onClick={() => setIsCartDrawerOpen(true)}
            aria-label="View cart"
            className="relative text-[#F7F4EE]/90 hover:text-white transition-colors p-1.5 cursor-pointer"
          >
            <ShoppingBag className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#F6C445] text-[#161015] text-[10px] font-bold flex items-center justify-center font-mono shadow-sm">
                {cartCount}
              </span>
            )}
          </button>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle navigation menu"
            className="lg:hidden text-[#F7F4EE]/90 hover:text-white transition-colors p-1.5 cursor-pointer ml-1"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile Slide-Down Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden relative z-40 bg-[#0E0738]/98 backdrop-blur-md border-b border-white/10 px-6 py-6 space-y-4 shadow-xl">
          <div className="flex flex-col space-y-3 font-inter text-base font-medium text-[#F7F4EE]">
            <Link
              href="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-left py-2 hover:text-white transition-colors"
            >
              Home
            </Link>
            <Link
              href="/stories"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-left py-2 hover:text-white transition-colors"
            >
              Books / Stories
            </Link>
            <Link
              href="/storytellers"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-left py-2 hover:text-white transition-colors"
            >
              Storyteller / About
            </Link>
            <Link
              href="/contact"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-left py-2 hover:text-white transition-colors"
            >
              Contact
            </Link>
            <Link
              href="/trailers"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-left py-2 hover:text-white transition-colors"
            >
              Trailer
            </Link>
          </div>
        </div>
      )}

      {/* Hero Body: Two Columns */}
      <div className="relative z-10 max-w-[1340px] mx-auto px-6 sm:px-10 pt-6 sm:pt-8 pb-4 sm:pb-6 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          {/* Left Column: Sophisticated Editorial Serif Typography & Single Stadium-Pill CTA (6 cols) */}
          <div className="lg:col-span-6 space-y-5 sm:space-y-6 pr-0 lg:pr-4">
            {/* Display Headline: Fraunces Editorial Serif */}
            <h1 className="font-serif text-5xl sm:text-6xl lg:text-[74px] xl:text-[78px] font-normal tracking-[-0.035em] text-[#F7F4EE] leading-[0.92] text-balance">
              <MagneticText
                text={
                  <>
                    Stories that live <br />
                    beyond time
                  </>
                }
                hoverText={
                  <>
                    Stories worth <br />
                    remembering.
                  </>
                }
                className="font-serif text-5xl sm:text-6xl lg:text-[74px] xl:text-[78px] font-normal tracking-[-0.035em] text-[#F7F4EE] leading-[0.92] text-balance text-left"
                circleClassName="bg-[#FAF8F3] shadow-2xl shadow-black/50"
                hoverTextClassName="text-[#120A45]"
                circleSize={220}
              />
            </h1>

            {/* Supporting Copy */}
            <p className="font-inter text-base sm:text-lg lg:text-[18px] text-[#F7F4EE]/85 font-normal leading-[1.5] tracking-[-0.015em] max-w-[480px]">
              Discover authentic Indian mythology, ancient epics, and bedtime storytelling crafted across generations for children, families, and parents.
            </p>

            {/* Primary CTA Only: Stadium-Pill in pure white with Hour Blue brand text */}
            <div className="pt-1 sm:pt-2">
              <button
                onClick={() => scrollTo("hero-cards")}
                className="bg-white hover:bg-[#EEF0FF] active:scale-[0.98] text-[#2410A4] px-8 py-3.5 sm:py-4 rounded-full text-base font-inter font-medium tracking-[-0.015em] shadow-[0_4px_20px_rgba(0,0,0,0.3)] transition-all cursor-pointer inline-flex items-center gap-2 group"
              >
                <span>Explore stories</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 text-[#2410A4]" />
              </button>
            </div>

            {/* Editorial Category Divider (Culture • Imagination • Generations) */}
            <div className="pt-6 sm:pt-8 mt-3 border-t border-white/10 max-w-[360px]">
              <div className="flex items-center gap-3 text-[11px] font-mono tracking-[0.24em] text-[#8E8AAB] uppercase select-none">
                <span>CULTURE</span>
                <span className="text-white/20">•</span>
                <span>IMAGINATION</span>
                <span className="text-white/20">•</span>
                <span>GENERATIONS</span>
              </div>
            </div>
          </div>

          {/* Right Column: Large Interactive Mythological Hero Artwork (6 cols) */}
          <div className="lg:col-span-6 relative flex justify-center lg:justify-end items-center">
            {/* Interactive container with 3D tilt, parallax mouse-follow, and float fallback on mobile */}
            <div
              style={{
                transform: !isTouchDevice
                  ? `perspective(1000px) rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg) translate3d(${tilt.moveX}px, ${tilt.moveY}px, 0) scale(${isHovered ? 1.025 : 1})`
                  : undefined,
                transition: isHovered
                  ? "transform 0.15s cubic-bezier(0.2, 0, 0, 1)"
                  : "transform 0.6s cubic-bezier(0.25, 1, 0.5, 1)",
              }}
              className={`relative w-full max-w-[480px] sm:max-w-[540px] lg:max-w-[580px] xl:max-w-[620px] aspect-[723/1024] cursor-grab active:cursor-grabbing ${
                isTouchDevice ? "animate-hero-float" : ""
              }`}
            >
              {/* Isolated Mythological Character */}
              <Image
                src="/images/mythological-hero.png"
                alt="Lord Vishnu — Ancient Indian Mythological Hero Artwork"
                fill
                priority
                className="object-contain object-bottom drop-shadow-[0_22px_45px_rgba(0,0,0,0.55)] transition-transform duration-300 pointer-events-none select-none"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 620px"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Dual-Row Substantially Enlarged Scrolling Cards */}
      <div id="hero-cards" className="relative z-10 w-full overflow-hidden space-y-4 sm:space-y-6 pt-2 pb-10 sm:pb-16">
        {/* ROW 1: Large Cards with Smooth Horizontal Continuous Scroll & Subtle Vertical Floating Undulation */}
        <div className="animate-hero-cards-left flex gap-4 sm:gap-5 lg:gap-6 items-center">
          {/* First Set of 8 Large Story Cards */}
          {row1Books.map((book, idx) => (
            <div
              key={`r1-set1-${idx}`}
              onClick={() => handleBookClick(book)}
              className="group flex-shrink-0 w-[190px] sm:w-[220px] md:w-[238px] lg:w-[252px] cursor-pointer"
            >
              <div className="relative aspect-[2/3] w-full rounded-2xl overflow-hidden shadow-[0_10px_28px_rgba(0,0,0,0.45)] group-hover:scale-[1.04] group-hover:-translate-y-2 group-hover:shadow-[0_22px_44px_rgba(0,0,0,0.65)] transition-all duration-300 bg-[#140C44] border border-white/15">
                <Image
                  src={book.src}
                  alt={book.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 190px, 252px"
                />
                <span className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-full bg-black/75 backdrop-blur-sm text-[11px] font-inter text-white font-medium shadow-sm">
                  {book.lang}
                </span>
              </div>
            </div>
          ))}

          {/* Second Duplicate Set for 100% Seamless Infinite Loop */}
          {row1Books.map((book, idx) => (
            <div
              key={`r1-set2-${idx}`}
              onClick={() => handleBookClick(book)}
              className="group flex-shrink-0 w-[190px] sm:w-[220px] md:w-[238px] lg:w-[252px] cursor-pointer"
            >
              <div className="relative aspect-[2/3] w-full rounded-2xl overflow-hidden shadow-[0_10px_28px_rgba(0,0,0,0.45)] group-hover:scale-[1.04] group-hover:-translate-y-2 group-hover:shadow-[0_22px_44px_rgba(0,0,0,0.65)] transition-all duration-300 bg-[#140C44] border border-white/15">
                <Image
                  src={book.src}
                  alt={book.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 190px, 252px"
                />
                <span className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-full bg-black/75 backdrop-blur-sm text-[11px] font-inter text-white font-medium shadow-sm">
                  {book.lang}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* ROW 2: Counter-Scrolling with Alternate Vertical Undulation & Different Speed for Parallax Depth */}
        <div className="animate-hero-cards-right flex gap-4 sm:gap-5 lg:gap-6 items-center">
          {/* First Set of 8 Large Cultural Residencies & Stories Cards */}
          {row2Books.map((book, idx) => (
            <div
              key={`r2-set1-${idx}`}
              onClick={() => handleBookClick(book)}
              className="group flex-shrink-0 w-[190px] sm:w-[220px] md:w-[238px] lg:w-[252px] cursor-pointer"
            >
              <div className="relative aspect-[2/3] w-full rounded-2xl overflow-hidden shadow-[0_10px_28px_rgba(0,0,0,0.45)] group-hover:scale-[1.04] group-hover:-translate-y-2 group-hover:shadow-[0_22px_44px_rgba(0,0,0,0.65)] transition-all duration-300 bg-[#140C44] border border-white/15">
                <Image
                  src={book.src}
                  alt={book.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 190px, 252px"
                />
                <span className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-full bg-black/75 backdrop-blur-sm text-[11px] font-inter text-white font-medium shadow-sm">
                  {book.lang}
                </span>
              </div>
            </div>
          ))}

          {/* Second Duplicate Set for 100% Seamless Infinite Loop */}
          {row2Books.map((book, idx) => (
            <div
              key={`r2-set2-${idx}`}
              onClick={() => handleBookClick(book)}
              className="group flex-shrink-0 w-[190px] sm:w-[220px] md:w-[238px] lg:w-[252px] cursor-pointer"
            >
              <div className="relative aspect-[2/3] w-full rounded-2xl overflow-hidden shadow-[0_10px_28px_rgba(0,0,0,0.45)] group-hover:scale-[1.04] group-hover:-translate-y-2 group-hover:shadow-[0_22px_44px_rgba(0,0,0,0.65)] transition-all duration-300 bg-[#140C44] border border-white/15">
                <Image
                  src={book.src}
                  alt={book.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 190px, 252px"
                />
                <span className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-full bg-black/75 backdrop-blur-sm text-[11px] font-inter text-white font-medium shadow-sm">
                  {book.lang}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

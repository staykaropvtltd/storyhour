"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import Image from "next/image";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import BookReader from "@/components/BookReader";
import AudiobookModal from "@/components/AudiobookModal";
import { EDITIONS, Edition, AUDIOBOOKS, Audiobook } from "@/data/editions-data";
import { useCmsContent } from "@/lib/use-cms-content";
import { useAudio } from "@/context/AudioContext";
import { useLibraryCart } from "@/context/LibraryCartContext";
import {
  Search,
  Volume2,
  VolumeX,
  Play,
  Pause,
  X,
  ShoppingBag,
  Clock,
  BookOpen,
  Globe,
  Sparkles,
  ArrowUpRight,
  Headphones,
  Check,
  Disc,
} from "lucide-react";

export default function StoriesEditionsPage() {
  const [selectedEdition, setSelectedEdition] = useState<Edition | null>(null);
  const [selectedAudiobook, setSelectedAudiobook] = useState<Audiobook | null>(null);
  const [hoveredEditionId, setHoveredEditionId] = useState<string | null>(null);
  const [hoveredAudiobookId, setHoveredAudiobookId] = useState<string | null>(null);
  const [bookReaderEdition, setBookReaderEdition] = useState<Edition | null>(null);
  const [activeTouchId, setActiveTouchId] = useState<string | null>(null);
  const { isPlaying, togglePlay, playStory } = useAudio();
  const { addToCart, showToast, setIsSearchOpen, isBookUnlocked } = useLibraryCart();

  const { editions: cmsEditions, stories: cmsStories } = useCmsContent();

  const activeEditions = useMemo(() => {
    return cmsEditions && cmsEditions.length > 0
      ? (cmsEditions as unknown as Edition[])
      : EDITIONS;
  }, [cmsEditions]);

  // Dynamic shelves: Top shelf has 4, and each subsequent shelf has up to 5 books.
  // When a new book is added, it automatically spawns a brand new physical shelf!
  const bookShelves = useMemo(() => {
    if (!activeEditions || activeEditions.length === 0) return [];
    if (activeEditions.length <= 4) return [activeEditions];
    const shelves: Edition[][] = [];
    shelves.push(activeEditions.slice(0, 4));
    let remaining = activeEditions.slice(4);
    while (remaining.length > 0) {
      shelves.push(remaining.slice(0, 5));
      remaining = remaining.slice(5);
    }
    return shelves;
  }, [activeEditions]);

  // Audiobooks merged from CMS stories and default audiobooks
  const activeAudiobooks = useMemo(() => {
    const list = [...AUDIOBOOKS];
    if (cmsStories && cmsStories.length > 0) {
      cmsStories.forEach((s) => {
        const exists = list.some(
          (ab) => ab.id === s.id || ab.title.toLowerCase() === s.title.toLowerCase()
        );
        if (!exists && s.status === "published") {
          list.push({
            id: s.id,
            title: s.title,
            subtitle: s.subtitle || `${s.category} by ${s.storyteller}`,
            narrator: s.storyteller,
            storyteller: s.storyteller,
            language: s.language,
            duration: s.duration || "45m",
            chaptersCount: s.chaptersCount || 1,
            price: (s as any).price || 19.99,
            cdArtwork:
              s.coverImage ||
              "https://storyhour.co.uk/wp-content/uploads/2026/01/Grand-Finale-5-scaled.jpg",
            category: s.category || "Audiobook",
            year: "2026",
            season: "Latest",
            badge: s.featured ? "FEATURED" : "NEW RELEASE",
            description: s.description || s.title,
            culturalNote: s.culturalNote || "Recorded with live acoustic instrumentation.",
            audioPreviewUrl:
              s.audioPreviewUrl || "https://www.youtube.com/embed/1otr4iUMGbU?autoplay=1",
            accentColor: "#C9281D",
            tracks: [{ id: 1, title: s.title, duration: s.duration || "45:00" }],
          });
        }
      });
    }
    return list;
  }, [cmsStories]);

  // Dynamic audiobook shelves: Up to 5 per shelf, creating new shelves when new audiobooks are added!
  const audiobookShelves = useMemo(() => {
    if (!activeAudiobooks || activeAudiobooks.length === 0) return [];
    const shelves: Audiobook[][] = [];
    let remaining = [...activeAudiobooks];
    while (remaining.length > 0) {
      shelves.push(remaining.slice(0, 5));
      remaining = remaining.slice(5);
    }
    return shelves;
  }, [activeAudiobooks]);

  return (
    <div className="min-h-screen bg-[#FAF8F3] text-[#0F0F0F] font-sans selection:bg-[#C9281D] selection:text-white flex flex-col justify-between overflow-x-hidden">
      {/* ── Official StoryHour Integrated Navbar (from Home page) ── */}
      <SiteHeader activeLink="Shop" />

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
            StoryHour Editions
          </h1>
          <p className="mt-3 text-white/90 font-medium text-base sm:text-lg max-w-lg leading-relaxed">
            Collectible books &amp; archival volumes. Preserved across English, Hindi, and Telugu.
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


      {/* ═══════════════════════════════════════════════════════════
          CENTER STAGE: THE 3D DOUBLE FLOATING ARCHITECTURAL SHELVES
          ═══════════════════════════════════════════════════════════ */}
      <main className="w-full max-w-[1520px] mx-auto px-4 sm:px-8 lg:px-12 flex-1 flex flex-col justify-center py-2 sm:py-6">
        {/* ── DYNAMIC 3D FLOATING ARCHITECTURAL SHELVES (Top shelf has 4 books, subsequent shelves have up to 5 books) ── */}
        {bookShelves.map((shelf, shelfIdx) => {
          const isTopShelf = shelfIdx === 0;
          return (
            <section
              key={`shelf-${shelfIdx}`}
              className={`relative ${isTopShelf ? "mb-14 sm:mb-16 lg:mb-20" : "mb-10 sm:mb-14 lg:mb-16"}`}
            >
              {/* Ambient Spotlight Halos (Wall-mounted glowing wash lights) */}
              <div className="absolute inset-0 flex justify-around pointer-events-none -z-10 px-6 sm:px-12">
                {shelf.map((ed) => (
                  <div
                    key={`halo-${ed.id}`}
                    className="w-[180px] sm:w-[240px] md:w-[280px] h-[220px] sm:h-[280px] rounded-full blur-[45px] sm:blur-[60px] opacity-75 sm:opacity-90 transition-opacity duration-500"
                    style={{
                      background:
                        hoveredEditionId === ed.id
                          ? `radial-gradient(circle, rgba(255,255,255,1) 0%, rgba(255,255,255,0.6) 50%, transparent 80%)`
                          : `radial-gradient(circle, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.4) 60%, transparent 80%)`,
                      transform: "translateY(-25%)",
                    }}
                  />
                ))}
              </div>

              {/* Row of Square Covers */}
              <div
                className={`flex items-end justify-center ${
                  isTopShelf
                    ? "gap-4 sm:gap-8 md:gap-12 lg:gap-16 px-4 sm:px-8"
                    : "gap-3 sm:gap-6 md:gap-8 lg:gap-10 px-2 sm:px-6"
                } relative z-10 flex-wrap sm:flex-nowrap`}
                style={{ perspective: "1400px" }}
              >
                {shelf.map((ed, idx) => {
                  const isHovered = hoveredEditionId === ed.id;
                  return (
                    <div
                      key={ed.id}
                      onMouseEnter={() => setHoveredEditionId(ed.id)}
                      onMouseLeave={() => setHoveredEditionId(null)}
                      onClick={() => {
                        if (activeTouchId === ed.id) {
                          setBookReaderEdition(ed);
                        } else {
                          setActiveTouchId(ed.id);
                        }
                      }}
                      tabIndex={0}
                      role="region"
                      aria-label={`${ed.title} (${ed.language})`}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          setBookReaderEdition(ed);
                        }
                      }}
                      className="group cursor-pointer flex flex-col items-center select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C9281D] focus-visible:ring-offset-2 rounded-md"
                      style={{ perspective: "1200px" }}
                    >
                      {/* Square 3D Album/Book Sleeve */}
                      <div
                        className={`relative ${
                          isTopShelf
                            ? "w-[135px] sm:w-[175px] md:w-[210px] lg:w-[240px] xl:w-[255px]"
                            : "w-[115px] sm:w-[145px] md:w-[175px] lg:w-[200px] xl:w-[215px]"
                        } aspect-square rounded-sm sm:rounded-md overflow-hidden transition-all duration-500 ease-out`}
                        style={{
                          transform: isHovered
                            ? "translateY(-14px) scale(1.04) rotateX(-2deg)"
                            : isTopShelf
                            ? "rotateX(2.5deg)"
                            : "rotateX(2deg)",
                          transformStyle: "preserve-3d",
                          boxShadow: isHovered
                            ? "0 28px 45px -10px rgba(0,0,0,0.35), 0 10px 20px -5px rgba(0,0,0,0.2)"
                            : "0 14px 28px -6px rgba(0,0,0,0.22), 0 6px 12px -4px rgba(0,0,0,0.14)",
                        }}
                      >
                        {/* Artwork */}
                        <Image
                          src={ed.coverImage}
                          alt={ed.title}
                          fill
                          priority={isTopShelf && idx < 2}
                          className="object-cover transition-transform duration-700 group-hover:scale-105"
                          sizes={
                            isTopShelf
                              ? "(max-width: 640px) 140px, (max-width: 1024px) 210px, 260px"
                              : "(max-width: 640px) 115px, (max-width: 1024px) 175px, 220px"
                          }
                        />

                        {/* Left Spine Shadow & Hardcover Book Hinge Crease */}
                        <div
                          className={`absolute left-0 top-0 bottom-0 ${isTopShelf ? "w-[9px]" : "w-[7px]"} pointer-events-none z-10`}
                          style={{
                            background:
                              "linear-gradient(to right, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.2) 40%, rgba(255,255,255,0.12) 65%, rgba(0,0,0,0.02) 100%)",
                          }}
                        />
                        <div
                          className={`absolute ${isTopShelf ? "left-[8px]" : "left-[6px]"} top-0 bottom-0 w-[1px] bg-black/20 shadow-[1px_0_0_rgba(255,255,255,0.12)] pointer-events-none z-10`}
                        />

                        {/* Right Page Edge Sheen */}
                        <div
                          className={`absolute right-0 top-0 bottom-0 ${isTopShelf ? "w-[3px]" : "w-[2.5px]"} pointer-events-none z-10`}
                          style={{
                            background:
                              "linear-gradient(to left, rgba(0,0,0,0.2) 0%, rgba(255,255,255,0.08) 50%, transparent 100%)",
                          }}
                        />

                        {/* Subtle Surface Gloss / Texture */}
                        <div
                          className="absolute inset-0 pointer-events-none"
                          style={{
                            background:
                              "linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 40%, rgba(0,0,0,0.15) 100%)",
                          }}
                        />

                        {/* Special Edition Seal */}
                        {ed.isFeatured && (
                          <div className="absolute top-2.5 left-2.5 sm:top-3 sm:left-3 z-20 pointer-events-none">
                            <div className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-gradient-to-br from-[#FDF2F0] via-[#DE3124] to-[#C9281D] text-white flex flex-col items-center justify-center shadow-[0_4px_12px_rgba(0,0,0,0.25)] border border-white/60 -rotate-6 group-hover:rotate-0 transition-transform duration-300">
                              <span className="font-mono text-[6.5px] sm:text-[7px] font-black uppercase tracking-wider text-[#0F0F0F] leading-none">
                                SPECIAL
                              </span>
                              <span className="font-mono text-[6.5px] sm:text-[7px] font-black uppercase tracking-wider text-[#0F0F0F] leading-none mt-0.5">
                                EDITION
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Unlocked Badge */}
                        {isBookUnlocked(ed.id) && (
                          <div className="absolute top-2.5 right-2.5 sm:top-3 sm:right-3 z-20 pointer-events-none">
                            <div className="px-2 py-0.5 rounded-full bg-emerald-600 text-white font-mono text-[7.5px] sm:text-[8.5px] font-black uppercase tracking-wider shadow-md flex items-center gap-1">
                              <Check className="w-2.5 h-2.5 stroke-[3]" />
                              <span>UNLOCKED</span>
                            </div>
                          </div>
                        )}

                        {/* Centered Hover Book Action */}
                        <div
                          className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 bg-black/35 backdrop-blur-[1.5px] gap-2 px-2 ${
                            isHovered || activeTouchId === ed.id
                              ? "opacity-100"
                              : "opacity-0 group-hover:opacity-100 group-focus-within:opacity-100"
                          }`}
                        >
                          {isBookUnlocked(ed.id) ? (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setBookReaderEdition(ed);
                              }}
                              aria-label={`Read ${ed.title}`}
                              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white text-[#0F0F0F] font-sans text-[11px] sm:text-[12px] font-semibold shadow-xl transform scale-95 group-hover:scale-100 hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer"
                            >
                              <BookOpen className="w-3.5 h-3.5 text-[#C9281D]" />
                              <span>Read Book</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                addToCart({
                                  id: ed.id,
                                  title: ed.title,
                                  nativeTitle: ed.nativeTitle,
                                  subtitle: ed.subtitle,
                                  authorOrNarrator: ed.storyteller,
                                  coverImage: ed.coverImage,
                                  price: ed.price,
                                  format: ed.bookFormat || "Hardcover Edition",
                                  language: ed.language,
                                  type: "book",
                                });
                              }}
                              aria-label={`Add ${ed.title} to Cart`}
                              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-gradient-to-r from-[#DE3124] to-[#C9281D] hover:from-[#C9281D] hover:to-[#8F1712] text-white font-sans text-[11px] sm:text-[12px] font-semibold shadow-xl transform scale-95 group-hover:scale-100 transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
                            >
                              <ShoppingBag className="w-3.5 h-3.5" />
                              <span>Add to Cart · £{ed.price}</span>
                            </button>
                          )}
                        </div>

                        {/* Bottom Title Overlay Tag */}
                        <div className="absolute bottom-0 inset-x-0 p-2 sm:p-2.5 bg-gradient-to-t from-black/85 via-black/40 to-transparent flex items-end justify-between pointer-events-none">
                          <div className="min-w-0 pr-1">
                            <p className="font-inter font-semibold text-[11px] sm:text-[12px] text-white truncate drop-shadow-sm">
                              {ed.codeName}
                            </p>
                            <p className="font-inter text-[9px] sm:text-[10px] text-white/80 truncate">
                              {ed.language} · {ed.category}
                            </p>
                          </div>
                          <span className="px-2 py-0.5 rounded bg-white/20 backdrop-blur-sm text-[8.5px] sm:text-[9.5px] font-mono font-medium text-white flex-shrink-0">
                            {ed.bookFormat}
                          </span>
                        </div>
                      </div>

                      {/* Contact Shadow on the Shelf Surface */}
                      <div
                        className={`${
                          isTopShelf
                            ? "w-[110px] sm:w-[150px] md:w-[190px] h-[6px]"
                            : "w-[95px] sm:w-[130px] md:w-[160px] h-[5px]"
                        } rounded-full bg-black/25 blur-[3px] transition-all duration-500`}
                        style={{
                          transform: isHovered ? "scale(0.85) translateY(4px)" : "scale(1)",
                          opacity: isHovered ? 0.35 : 0.65,
                        }}
                      />
                    </div>
                  );
                })}
              </div>

              {/* ── SHELF SLAB (Floating Pure White Architectural Shelf) ── */}
              <div className="relative w-full mt-[-3px]">
                {/* Top Surface */}
                <div
                  className="w-full h-[10px] sm:h-[12px] rounded-t-sm"
                  style={{
                    background: "linear-gradient(to bottom, #FFFFFF 0%, #F5F4F0 70%, #E8E6E0 100%)",
                    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.9), inset 0 -1px 0 rgba(0,0,0,0.06)",
                  }}
                />
                {/* Front Edge */}
                <div
                  className="w-full h-[12px] sm:h-[15px] bg-white rounded-b-sm border-t border-[#EAE7E0]"
                  style={{
                    boxShadow: "0 2px 0 rgba(0,0,0,0.04)",
                  }}
                />
                {/* Soft Ambient Cast Shadow onto Studio Wall Below */}
                <div
                  className="w-full h-[30px] sm:h-[45px] pointer-events-none"
                  style={{
                    background:
                      "radial-gradient(ellipse at 50% 0%, rgba(0,0,0,0.18) 0%, rgba(0,0,0,0.06) 45%, transparent 75%)",
                  }}
                />
              </div>
            </section>
          );
        })}

        {/* ═══════════════════════════════════════════════════════════
            AUDIOBOOKS SECTION (3D CD SHELF COLLECTION)
            ═══════════════════════════════════════════════════════════ */}
        <section className="relative mt-8 sm:mt-12 mb-16 sm:mb-20">
          {/* Section Header */}
          <div className="mb-8 sm:mb-12 px-4 sm:px-8 border-b border-[#EAE7E0] pb-4">
            <h2 className="font-serif text-[24px] sm:text-[30px] font-normal text-[#0F0F0F] tracking-[-0.025em]">
              Audiobooks
            </h2>
            <p className="font-sans text-[13px] sm:text-[14px] text-[#5A5A5A] mt-1 max-w-[680px]">
              Full-cast audio dramatizations &amp; signature oral narrations recorded with live Indian sitar, flute, and traditional percussive accompaniment.
            </p>
          </div>

          {/* Ambient Spotlight Halos and Dynamic CD Shelves */}
          {audiobookShelves.map((shelf, shelfIdx) => (
            <div key={`ab-shelf-${shelfIdx}`} className="relative mb-14 sm:mb-16">
              {/* Ambient Spotlight Halos for Discs */}
              <div className="absolute inset-0 top-16 flex justify-around pointer-events-none -z-10 px-4 sm:px-8">
                {shelf.map((ab) => (
                  <div
                    key={`cd-halo-${ab.id}`}
                    className="w-[150px] sm:w-[200px] md:w-[240px] h-[180px] sm:h-[230px] rounded-full blur-[45px] opacity-75 sm:opacity-90 transition-opacity duration-500"
                    style={{
                      background:
                        hoveredAudiobookId === ab.id
                          ? `radial-gradient(circle, rgba(255,255,255,1) 0%, rgba(255,200,100,0.4) 40%, transparent 80%)`
                          : `radial-gradient(circle, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.3) 60%, transparent 80%)`,
                      transform: "translateY(-15%)",
                    }}
                  />
                ))}
              </div>

              {/* CDs Row (Horizontal Architectural Display) */}
              <div
                tabIndex={0}
                role="region"
                aria-label={`Audiobook editions shelf ${shelfIdx + 1}`}
                className="flex items-end justify-center gap-3 sm:gap-6 md:gap-8 lg:gap-10 px-2 sm:px-6 relative z-10 overflow-x-auto pb-4 pt-10 no-scrollbar focus:outline-none focus-visible:ring-1 focus-visible:ring-neutral-400"
                style={{ perspective: "1400px" }}
              >
                {shelf.map((ab) => {
                  const isHovered = hoveredAudiobookId === ab.id;
                  const isPlayingPreview = isPlaying && selectedAudiobook?.id === ab.id;
                  return (
                    <div
                      key={ab.id}
                      onMouseEnter={() => setHoveredAudiobookId(ab.id)}
                      onMouseLeave={() => setHoveredAudiobookId(null)}
                      onClick={() => setSelectedAudiobook(ab)}
                      role="button"
                      tabIndex={0}
                      aria-label={`Listen to ${ab.title} audiobook (${ab.language})`}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          setSelectedAudiobook(ab);
                        }
                      }}
                      className="group relative flex flex-col items-center flex-shrink-0 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C9281D] rounded-full"
                      style={{ width: "clamp(130px, 14vw, 190px)" }}
                    >
                      {/* 3D CD Disc Floating Container */}
                      <div
                        className="relative w-full aspect-square transition-all duration-500 ease-out"
                        style={{
                          transform: isHovered
                            ? "translateY(-18px) scale(1.06) rotateX(8deg)"
                            : "translateY(0px) scale(1) rotateX(16deg)",
                          transformStyle: "preserve-3d",
                        }}
                      >
                        {/* The Physical CD Disc Body */}
                        <div
                          className={`relative w-full h-full rounded-full overflow-hidden flex items-center justify-center transition-transform duration-700 ease-out ${
                            isHovered || isPlayingPreview ? "animate-[spin_12s_linear_infinite]" : ""
                          }`}
                          style={{
                            boxShadow: isHovered
                              ? "0 24px 45px -8px rgba(0,0,0,0.38), 0 0 0 1px rgba(255,255,255,0.7) inset"
                              : "0 14px 28px -6px rgba(0,0,0,0.28), 0 0 0 1px rgba(255,255,255,0.5) inset",
                            background:
                              "conic-gradient(from 45deg, #e4e2dd, #d8d4cb, #f0eee9, #cbc6ba, #e4e2dd, #f8f6f0, #d8d4cb, #e4e2dd)",
                          }}
                        >
                          {/* Holographic / Iridescent Refractive Sheen */}
                          <div
                            className="absolute inset-0 rounded-full pointer-events-none opacity-45 mix-blend-color-dodge transition-opacity duration-300"
                            style={{
                              background:
                                "conic-gradient(from 120deg, rgba(255,0,128,0.35) 0deg, rgba(0,255,255,0.45) 75deg, rgba(255,255,0,0.35) 150deg, rgba(0,255,128,0.45) 225deg, rgba(255,0,128,0.35) 360deg)",
                            }}
                          />

                          {/* Micro-groove Audio Tracks (Concentric circular grooves) */}
                          <div
                            className="absolute inset-[3px] rounded-full pointer-events-none opacity-30"
                            style={{
                              background:
                                "repeating-radial-gradient(circle at center, transparent 0, transparent 2px, rgba(0,0,0,0.15) 3px, transparent 4px)",
                            }}
                          />

                          {/* Outer Disc Rim Reflection */}
                          <div className="absolute inset-0 rounded-full border-[1.5px] border-white/70 pointer-events-none" />

                          {/* CD Printed Label Artwork (Inner 62% circular zone) */}
                          <div
                            className="relative w-[62%] h-[62%] rounded-full overflow-hidden shadow-[0_0_12px_rgba(0,0,0,0.4)] border border-black/20 z-10 flex items-center justify-center"
                          >
                            <Image
                              src={ab.cdArtwork}
                              alt={ab.title}
                              fill
                              className="object-cover scale-110"
                              sizes="160px"
                            />

                            {/* Subtle print overlay on artwork */}
                            <div
                              className="absolute inset-0 pointer-events-none"
                              style={{
                                background:
                                  "linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 50%, rgba(0,0,0,0.35) 100%)",
                              }}
                            />

                            {/* Disc Label Badge / Logo */}
                            <div className="absolute bottom-1.5 inset-x-0 flex justify-center pointer-events-none">
                              <span className="px-1.5 py-0.2 rounded-full bg-black/60 backdrop-blur-sm text-[7px] font-mono text-white/90 font-medium">
                                {ab.badge || "AUDIOBOOK"}
                              </span>
                            </div>
                          </div>

                          {/* Center Spindle Mechanism */}
                          <div className="absolute w-[24%] h-[24%] rounded-full bg-gradient-to-br from-white/90 via-white/50 to-white/70 backdrop-blur-md border border-white/80 shadow-[0_0_8px_rgba(0,0,0,0.25)_inset] z-20 flex items-center justify-center pointer-events-none">
                            <div className="w-[72%] h-[72%] rounded-full border border-black/25 bg-[#FAF8F3]/60 shadow-inner flex items-center justify-center">
                              <div className="w-[45%] h-[45%] rounded-full bg-[#E5DFD5] border border-black/30 shadow-[inset_0_2px_4px_rgba(0,0,0,0.35)]" />
                            </div>
                          </div>

                          {/* Dynamic Light Sheen / Glass Glare */}
                          <div
                            className="absolute inset-0 rounded-full pointer-events-none z-30"
                            style={{
                              background:
                                "linear-gradient(125deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.05) 38%, transparent 55%, rgba(255,255,255,0.2) 100%)",
                            }}
                          />
                        </div>

                        {/* Hover Play / Action Badge Overlay */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-40 pointer-events-none">
                          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/95 text-[#0F0F0F] font-sans text-[11px] font-semibold shadow-xl transform scale-90 group-hover:scale-100 transition-all duration-300 border border-black/5">
                            <Play className="w-3.5 h-3.5 fill-[#C9281D] text-[#C9281D]" />
                            <span>Play Audiobook</span>
                          </div>
                        </div>
                      </div>

                      {/* Disc Metadata Tag Underneath */}
                      <div className="mt-3 text-center w-full px-1">
                        <p className="font-sans font-semibold text-[11px] sm:text-[12.5px] text-[#0F0F0F] truncate group-hover:text-[#C9281D] transition-colors">
                          {ab.title}
                        </p>
                        <p className="font-sans text-[9px] sm:text-[10px] text-[#4F4A42] truncate mt-0.5">
                          {ab.language} · {ab.duration}
                        </p>
                        <div className="mt-1 flex items-center justify-center gap-1.5">
                          <span className="font-mono text-[9px] font-bold text-[#C9281D]">
                            ${ab.price}
                          </span>
                          <span className="text-[8px] font-mono text-[#4F4A42] px-1.5 py-0.5 rounded bg-black/5">
                            {ab.category}
                          </span>
                        </div>
                      </div>

                      {/* Contact Shadow on the Shelf Surface */}
                      <div
                        className="w-[85%] h-[6px] rounded-full bg-black/25 blur-[3px] transition-all duration-500 mt-1"
                        style={{
                          transform: isHovered ? "scale(0.85) translateY(4px)" : "scale(1)",
                          opacity: isHovered ? 0.35 : 0.65,
                        }}
                      />
                    </div>
                  );
                })}
              </div>

              {/* ── AUDIOBOOKS SHELF SLAB (Floating Pure White Architectural Shelf) ── */}
              <div className="relative w-full mt-[-3px]">
                <div
                  className="w-full h-[10px] sm:h-[12px] rounded-t-sm"
                  style={{
                    background: "linear-gradient(to bottom, #FFFFFF 0%, #F5F4F0 70%, #E8E6E0 100%)",
                    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.9), inset 0 -1px 0 rgba(0,0,0,0.06)",
                  }}
                />
                <div
                  className="w-full h-[12px] sm:h-[15px] bg-white rounded-b-sm border-t border-[#EAE7E0]"
                  style={{
                    boxShadow: "0 2px 0 rgba(0,0,0,0.04)",
                  }}
                />
                <div
                  className="w-full h-[35px] sm:h-[50px] pointer-events-none"
                  style={{
                    background:
                      "radial-gradient(ellipse at 50% 0%, rgba(0,0,0,0.18) 0%, rgba(0,0,0,0.06) 45%, transparent 75%)",
                  }}
                />
              </div>
            </div>
          ))}
        </section>
      </main>

      {/* ═══════════════════════════════════════════════════════════
          BOTTOM COLLECTION BAR: ALL BOOKS & AUDIOBOOKS WITH HOVER POPUP
          ═══════════════════════════════════════════════════════════ */}
      <div className="w-full border-t border-[#E8E4DC] bg-[#FAF8F3]/95 backdrop-blur-md z-30 relative">
        <div className="max-w-[1520px] mx-auto px-4 sm:px-8 lg:px-12 py-5 sm:py-6 space-y-6">
          
          {/* ── Row 1: Books (9 Editions) ── */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#C9281D]" />
                <span className="font-mono text-[10.5px] uppercase tracking-wider text-[#4F4A42] font-bold">
                  Books &amp; Editions ({activeEditions.length})
                </span>
              </div>
              <span className="font-mono text-[10px] text-[#4F4A42] hidden sm:inline">
                Hover on any book to pop up preview
              </span>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 xl:grid-cols-12 gap-2 sm:gap-3 items-start relative">
              {activeEditions.map((ed, idx) => {
                const isHovered = hoveredEditionId === ed.id;
                const isSelected = selectedEdition?.id === ed.id;
                const popupAlign =
                  idx === 0
                    ? "left-0 translate-x-0"
                    : idx === activeEditions.length - 1
                    ? "right-0 translate-x-0"
                    : "left-1/2 -translate-x-1/2";
                const arrowAlign =
                  idx === 0
                    ? "left-6 translate-x-0"
                    : idx === activeEditions.length - 1
                    ? "right-6 translate-x-0"
                    : "left-1/2 -translate-x-1/2";

                return (
                  <div key={`timeline-${ed.id}`} className="relative">
                    <button
                      onMouseEnter={() => setHoveredEditionId(ed.id)}
                      onMouseLeave={() => setHoveredEditionId(null)}
                      onClick={() => setSelectedEdition(ed)}
                      className={`w-full text-left group cursor-pointer transition-all duration-200 py-1 ${
                        isHovered || isSelected ? "opacity-100" : "opacity-75 hover:opacity-100"
                      }`}
                    >
                      {/* Top Line: Year & Season */}
                      <p className="font-mono text-[9.5px] sm:text-[10px] text-[#4F4A42] leading-none mb-1">
                        {ed.year} · {ed.season}
                      </p>
                      {/* Middle Line: Codename */}
                      <p
                        className={`font-sans text-[11.5px] sm:text-[12.5px] font-bold leading-[1.2] transition-colors truncate ${
                          isHovered || isSelected ? "text-[#C9281D]" : "text-[#0F0F0F]"
                        }`}
                      >
                        {ed.codeName}
                      </p>
                      {/* Third Line: Full Book Title */}
                      <p className="font-sans text-[10px] text-[#4F4A42] leading-tight truncate mt-0.5">
                        {ed.title}
                      </p>
                      {/* Active Indicator Line */}
                      <div
                        className={`h-[2px] mt-1.5 transition-all duration-300 rounded-full ${
                          isSelected
                            ? "bg-[#C9281D] w-full"
                            : isHovered
                            ? "bg-[#C9281D] w-full"
                            : "bg-transparent w-0"
                        }`}
                      />
                    </button>

                    {/* ── HOVER POPUP PREVIEW CARD ── */}
                    {isHovered && (
                      <div
                        className={`absolute bottom-[calc(100%+14px)] ${popupAlign} z-50 w-[260px] bg-[#FAF8F3] rounded-2xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.35),0_0_0_1px_rgba(0,0,0,0.08)] p-3.5 pointer-events-none animate-in fade-in zoom-in-95 duration-200`}
                      >
                        <div className="flex items-center gap-3">
                          {/* Book Cover Thumbnail */}
                          <div className="relative w-[75px] h-[75px] rounded-lg overflow-hidden flex-shrink-0 shadow-md border border-black/10">
                            <Image
                              src={ed.coverImage}
                              alt={ed.title}
                              fill
                              className="object-cover"
                              sizes="80px"
                            />
                            <div className="absolute inset-0 bg-gradient-to-tr from-black/20 via-transparent to-white/20" />
                          </div>

                          {/* Info */}
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1 mb-0.5">
                              <span className="px-1.5 py-0.2 rounded bg-[#C9281D] text-white font-mono text-[8px] font-bold uppercase tracking-wider">
                                {ed.codeName}
                              </span>
                              <span className="text-[9px] font-mono text-[#7A756D]">
                                {ed.year}
                              </span>
                            </div>
                            <p className="font-serif text-[12.5px] font-bold text-[#0F0F0F] leading-snug line-clamp-2">
                              {ed.title}
                            </p>
                            <p className="font-sans text-[10px] text-[#6A6A6A] mt-0.5 truncate">
                              {ed.bookFormat} · {ed.pagesCount}p
                            </p>
                            <p className="font-mono text-[11px] font-bold text-[#C9281D] mt-1">
                              ${ed.price}
                            </p>
                          </div>
                        </div>

                        <div className="mt-2.5 pt-2 border-t border-[#EAE7E0] flex items-center justify-between text-[10px]">
                          <span className="font-sans text-[#4F4A42]">
                            {ed.language}
                          </span>
                          <span className="font-sans font-semibold text-[#C9281D] flex items-center gap-0.5">
                            {isBookUnlocked(ed.id) ? "Read Full Book →" : "View Edition →"}
                          </span>
                        </div>

                        {/* Pointer Arrow */}
                        <div
                          className={`absolute -bottom-1.5 ${arrowAlign} w-3 h-3 bg-[#FAF8F3] border-r border-b border-black/10 rotate-45`}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Divider */}
          <div className="w-full h-px bg-[#EAE7E0]" />

          {/* ── Row 2: Audiobooks (6 Discs) ── */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-2">
                <Disc
                  className="w-3.5 h-3.5 text-[#C9281D] animate-spin"
                  style={{ animationDuration: "10s" }}
                />
                <span className="font-mono text-[10.5px] uppercase tracking-wider text-[#4F4A42] font-bold">
                  Audiobooks &amp; Discs ({activeAudiobooks.length})
                </span>
              </div>
              <span className="font-mono text-[10px] text-[#4F4A42] hidden sm:inline">
                Hover on any audiobook to pop up preview
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 xl:grid-cols-8 gap-2 sm:gap-4 items-start relative">
              {activeAudiobooks.map((ab, idx) => {
                const isHovered = hoveredAudiobookId === ab.id;
                const isSelected = selectedAudiobook?.id === ab.id;
                const popupAlign =
                  idx === 0
                    ? "left-0 translate-x-0"
                    : idx === activeAudiobooks.length - 1
                    ? "right-0 translate-x-0"
                    : "left-1/2 -translate-x-1/2";
                const arrowAlign =
                  idx === 0
                    ? "left-6 translate-x-0"
                    : idx === activeAudiobooks.length - 1
                    ? "right-6 translate-x-0"
                    : "left-1/2 -translate-x-1/2";

                return (
                  <div key={`timeline-audio-${ab.id}`} className="relative">
                    <button
                      onMouseEnter={() => setHoveredAudiobookId(ab.id)}
                      onMouseLeave={() => setHoveredAudiobookId(null)}
                      onClick={() => setSelectedAudiobook(ab)}
                      className={`w-full text-left group cursor-pointer transition-all duration-200 py-1 ${
                        isHovered || isSelected ? "opacity-100" : "opacity-75 hover:opacity-100"
                      }`}
                    >
                      {/* Top Line: Badge & Language (Gray like book one) */}
                      <p className="font-mono text-[9.5px] sm:text-[10px] text-[#4F4A42] font-semibold leading-none mb-1 flex items-center gap-1">
                        <Disc className="w-2.5 h-2.5 text-[#4F4A42]" />
                        {ab.badge || "AUDIO"} · {ab.language}
                      </p>
                      {/* Middle Line: Audiobook Title */}
                      <p
                        className={`font-sans text-[11.5px] sm:text-[12.5px] font-bold leading-[1.2] transition-colors truncate ${
                          isHovered || isSelected ? "text-[#C9281D]" : "text-[#0F0F0F]"
                        }`}
                      >
                        {ab.title}
                      </p>
                      {/* Third Line: Duration & Narrator */}
                      <p className="font-sans text-[10px] text-[#4F4A42] leading-tight truncate mt-0.5">
                        {ab.duration} · {ab.narrator}
                      </p>
                      {/* Active Indicator Line */}
                      <div
                        className={`h-[2px] mt-1.5 transition-all duration-300 rounded-full ${
                          isSelected
                            ? "bg-[#C9281D] w-full"
                            : isHovered
                            ? "bg-[#C9281D] w-full"
                            : "bg-transparent w-0"
                        }`}
                      />
                    </button>

                    {/* ── HOVER POPUP PREVIEW CARD ── */}
                    {isHovered && (
                      <div
                        className={`absolute bottom-[calc(100%+14px)] ${popupAlign} z-50 w-[270px] bg-[#FAF8F3] rounded-2xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.35),0_0_0_1px_rgba(0,0,0,0.08)] p-3.5 pointer-events-none animate-in fade-in zoom-in-95 duration-200`}
                      >
                        <div className="flex items-center gap-3">
                          {/* Spinning CD Thumbnail */}
                          <div className="relative w-[75px] h-[75px] rounded-full overflow-hidden flex-shrink-0 shadow-lg border border-black/15 bg-neutral-900 flex items-center justify-center animate-[spin_10s_linear_infinite]">
                            <Image
                              src={ab.cdArtwork}
                              alt={ab.title}
                              fill
                              className="object-cover rounded-full"
                              sizes="80px"
                            />
                            {/* Holographic Iridescent Sheen */}
                            <div
                              className="absolute inset-0 rounded-full opacity-40 mix-blend-screen pointer-events-none"
                              style={{
                                background:
                                  "conic-gradient(from 45deg, rgba(255,255,255,0.4) 0deg, rgba(255,100,100,0.3) 90deg, rgba(100,255,150,0.3) 180deg, rgba(100,200,255,0.4) 270deg, rgba(255,255,255,0.4) 360deg)",
                              }}
                            />
                            {/* Spindle hole */}
                            <div className="absolute w-4 h-4 rounded-full bg-[#FAF8F3] border border-black/30 flex items-center justify-center">
                              <div className="w-1.5 h-1.5 rounded-full bg-black/40" />
                            </div>
                          </div>

                          {/* Info */}
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1 mb-0.5">
                              <span className="px-1.5 py-0.2 rounded bg-[#C9281D]/20 text-[#C9281D] font-mono text-[8px] font-bold uppercase tracking-wider">
                                {ab.badge || "AUDIO"}
                              </span>
                              <span className="text-[9px] font-mono text-[#7A756D]">
                                {ab.language}
                              </span>
                            </div>
                            <p className="font-serif text-[12.5px] font-bold text-[#0F0F0F] leading-snug line-clamp-2">
                              {ab.title}
                            </p>
                            <p className="font-sans text-[10px] text-[#6A6A6A] mt-0.5 truncate">
                              {ab.duration} · {ab.chaptersCount} Chapters
                            </p>
                            <p className="font-mono text-[11px] font-bold text-[#C9281D] mt-1">
                              ${ab.price}
                            </p>
                          </div>
                        </div>

                        <div className="mt-2.5 pt-2 border-t border-[#EAE7E0] flex items-center justify-between text-[10px]">
                          <span className="font-sans text-[#7A756D] truncate max-w-[130px]">
                            {ab.narrator}
                          </span>
                          <span className="font-sans font-semibold text-[#C9281D] flex items-center gap-0.5 flex-shrink-0">
                            Play &amp; Unlock →
                          </span>
                        </div>

                        {/* Pointer Arrow */}
                        <div
                          className={`absolute -bottom-1.5 ${arrowAlign} w-3 h-3 bg-[#FAF8F3] border-r border-b border-black/10 rotate-45`}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          INTERACTIVE EDITION DETAIL MODAL / DRAWER
          ═══════════════════════════════════════════════════════════ */}
      {selectedEdition && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
          onClick={() => setSelectedEdition(null)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-[#0F0F0F]/70 backdrop-blur-md transition-opacity" />

          {/* Dialog Container */}
          <div
            className="relative z-10 w-full max-w-[920px] max-h-[92vh] bg-[#FAF8F3] rounded-2xl shadow-[0_40px_100px_-20px_rgba(0,0,0,0.6)] overflow-hidden flex flex-col lg:flex-row animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedEdition(null)}
              aria-label="Close edition preview"
              className="absolute top-4 right-4 z-30 w-10 h-10 rounded-full bg-black/10 hover:bg-black/20 flex items-center justify-center text-[#0F0F0F] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Left Column: 3D Edition Artwork Stage */}
            <div className="relative w-full lg:w-[380px] bg-gradient-to-br from-[#0F0F0F] via-[#1A1A1A] to-[#262626] p-8 flex flex-col items-center justify-center flex-shrink-0">
              {/* Diffuse glow */}
              <div className="absolute w-[240px] h-[240px] rounded-full bg-[#C9281D]/30 blur-[70px] pointer-events-none" />

              {/* 3D Box Artwork */}
              <div
                className="relative w-[210px] sm:w-[250px] aspect-square rounded-lg overflow-hidden shadow-[0_30px_70px_-15px_rgba(0,0,0,0.7)]"
                style={{
                  transform: "perspective(900px) rotateY(-4deg) rotateX(2deg)",
                  transformStyle: "preserve-3d",
                }}
              >
                <Image
                  src={selectedEdition.coverImage}
                  alt={selectedEdition.title}
                  fill
                  className="object-cover"
                  sizes="260px"
                />
                {/* Spine highlight */}
                <div className="absolute left-0 top-0 bottom-0 w-[6px] bg-gradient-to-r from-black/40 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-white/20 pointer-events-none" />
              </div>

              {/* Badge & Season */}
              <div className="mt-6 flex items-center gap-2 z-10">
                <span className="px-3 py-1 rounded-full bg-[#C9281D] text-white text-[10px] font-mono font-bold uppercase tracking-wider">
                  {selectedEdition.year} · {selectedEdition.season} Edition
                </span>
                <span className="px-2.5 py-1 rounded-full bg-white/15 backdrop-blur-sm text-white text-[10px] font-mono">
                  {selectedEdition.bookFormat}
                </span>
              </div>
            </div>

            {/* Right Column: Information, Audio Preview & Purchase */}
            <div className="p-7 sm:p-9 flex-1 overflow-y-auto space-y-5">
              <div>
                <span className="font-mono text-[11px] uppercase tracking-widest text-[#C9281D] font-semibold">
                  StoryHour Collector&apos;s Edition
                </span>
                <h2 className="mt-1 font-serif text-[26px] sm:text-[32px] font-normal text-[#0F0F0F] leading-[1.05] tracking-[-0.025em]">
                  {selectedEdition.title}
                </h2>
                {selectedEdition.nativeTitle && (
                  <p className="mt-1 font-serif text-[18px] text-[#5A5A5A] italic">
                    {selectedEdition.nativeTitle}
                  </p>
                )}
                <p className="mt-1.5 font-sans text-[14px] text-[#5A5A5A]">
                  {selectedEdition.subtitle}
                </p>
              </div>

              {/* Metadata Badges */}
              <div className="flex flex-wrap gap-3 font-mono text-[11px] text-[#5A5A5A] py-2 border-y border-[#E7E7E7]">
                <span className="flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-[#C9281D]" />
                  {selectedEdition.bookFormat}
                </span>
                <span className="flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-[#C9281D]" />
                  {selectedEdition.pagesCount} Pages ({selectedEdition.chaptersCount} Chapters)
                </span>
                <span className="flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-[#C9281D]" />
                  {selectedEdition.language}
                </span>
                {selectedEdition.duration && (
                  <span className="flex items-center gap-1.5">
                    <Headphones className="w-3.5 h-3.5 text-[#C9281D]" />
                    Audio Companion ({selectedEdition.duration})
                  </span>
                )}
              </div>

              {/* Synopsis */}
              <p className="font-sans text-[14px] text-[#2F2F2F] leading-[1.65]">
                {selectedEdition.description}
              </p>

              {selectedEdition.culturalNote && (
                <div className="p-3.5 rounded-lg bg-[#FAF8F3] border-l-2 border-[#C9281D] text-[12.5px] font-sans text-[#5A5A5A] italic">
                  {selectedEdition.culturalNote}
                </div>
              )}

              {/* Secondary Audio Companion Sample Player */}
              <div className="p-4 rounded-xl bg-[#FDF2F0] flex items-center gap-4 border border-[#C9281D]/20">
                <button
                  onClick={() => {
                    playStory({
                      id: selectedEdition.id,
                      slug: "edition-preview",
                      title: selectedEdition.title,
                      subtitle: selectedEdition.subtitle,
                      storyteller: selectedEdition.storyteller,
                      language: selectedEdition.language,
                      audience: "Families & All Ages",
                      category: "Mythology & Epics",
                      format: "Audiobook",
                      duration: selectedEdition.duration || "14h 20m",
                      durationMinutes: 860,
                      coverImage: selectedEdition.coverImage,
                      audioPreviewUrl: selectedEdition.audioPreviewUrl,
                      chaptersCount: selectedEdition.chaptersCount,
                      description: selectedEdition.description,
                    });
                    showToast(`Playing audio sample: ${selectedEdition.title}`);
                  }}
                  className="w-11 h-11 rounded-full bg-gradient-to-r from-[#DE3124] to-[#C9281D] hover:from-[#C9281D] hover:to-[#8F1712] text-white flex items-center justify-center flex-shrink-0 shadow-md cursor-pointer transition-colors"
                >
                  <Play className="w-4 h-4 fill-white ml-0.5" />
                </button>
                <div className="flex-1 min-w-0">
                  <p className="font-sans text-[13px] font-semibold text-[#0F0F0F]">
                    Audio Companion Preview
                  </p>
                  <p className="font-sans text-[11px] text-[#5A5A5A] truncate">
                    Studio narration · Performed by {selectedEdition.storyteller}
                  </p>
                </div>
                <span className="font-mono text-[11px] text-[#C9281D] font-medium flex-shrink-0">
                  Audio Included
                </span>
              </div>

              {/* Purchase / Action Row */}
              <div className="flex items-center justify-between pt-2">
                <div>
                  <span className="font-mono text-[11px] text-[#5A5A5A] block">
                    Collector&apos;s Book Edition
                  </span>
                  <span className="font-serif text-[24px] font-bold text-[#0F0F0F]">
                    £{selectedEdition.price}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      addToCart({
                        id: selectedEdition.id,
                        slug: selectedEdition.id,
                        title: selectedEdition.title,
                        language: selectedEdition.language,
                        price: selectedEdition.price,
                        currency: "£",
                        coverImage: selectedEdition.coverImage,
                        format: `${selectedEdition.bookFormat} (Collector's)`,
                        description: selectedEdition.description,
                        chaptersCount: selectedEdition.chaptersCount,
                        type: "book",
                      });
                    }}
                    className="px-6 py-3 rounded-full bg-gradient-to-r from-[#DE3124] via-[#C9281D] to-[#B01E14] hover:from-[#C9281D] hover:to-[#8F1712] text-white font-sans text-[13px] font-medium transition-all shadow-[0_6px_20px_rgba(201,40,29,0.35)] hover:shadow-[0_8px_25px_rgba(201,40,29,0.45)] flex items-center gap-2 cursor-pointer"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    Add edition to cart
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Interactive Audiobook Modal (Spinning 3D Disc, Chapters, Audio Preview, Buy & Unlock) ── */}
      {selectedAudiobook && (
        <AudiobookModal
          audiobook={selectedAudiobook}
          onClose={() => setSelectedAudiobook(null)}
        />
      )}

      {/* ── Book Reader Overlay ── */}
      {bookReaderEdition && (
        <BookReader
          edition={bookReaderEdition}
          onClose={() => setBookReaderEdition(null)}
        />
      )}

      {/* ── Standard Site Footer ── */}
      <SiteFooter />
    </div>
  );
}

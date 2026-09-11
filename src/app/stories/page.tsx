"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import SiteNav from "@/components/SiteNav";
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
} from "lucide-react";

/* ─── 9 Authentic Editions (4 Top Shelf, 5 Bottom Shelf) ─── */
interface Edition {
  id: string;
  year: string;
  season: string;
  codeName: string;
  title: string;
  nativeTitle?: string;
  subtitle: string;
  language: "English" | "Hindi" | "Telugu" | "Multilingual";
  bookFormat: string;
  category: string;
  pagesCount: number;
  chaptersCount: number;
  duration: string;
  coverImage: string;
  badge?: string;
  isFeatured?: boolean;
  isNowPlaying?: boolean;
  description: string;
  audioPreviewUrl: string;
  storyteller: string;
  price: number;
  productId?: string;
  culturalNote?: string;
  accentColor: string;
}

const EDITIONS: Edition[] = [
  // ── Top Shelf (4 Masterpieces) ──
  {
    id: "ed-spring-2026",
    year: "2026",
    season: "Spring",
    codeName: "Everywhere",
    title: "Ramayana — Valmiki's Epic",
    subtitle: "Complete Signature Narration in English",
    language: "English",
    bookFormat: "Hardcover Edition",
    category: "Ancient Epic",
    pagesCount: 384,
    chaptersCount: 40,
    duration: "14h 20m",
    coverImage: "https://storyhour.co.uk/wp-content/uploads/2026/01/WhatsApp-Image-2026-01-19-at-17.28.53.jpeg",
    badge: "SPECIAL EDITION",
    isFeatured: true,
    description: "Experience the timeless epic of Rama, Sita, and Lakshmana through expressive performance-driven narration, authentic classical poetry, and evocative Indian acoustic instruments.",
    audioPreviewUrl: "https://www.youtube.com/embed/4up2VdHiO5I?autoplay=1",
    storyteller: "StoryHour Lead Performer & Ensemble",
    price: 84.99,
    productId: "prod-english-ramayana",
    culturalNote: "Based on the classical Adikavya of Sage Valmiki, adapted for clear intergenerational listening.",
    accentColor: "#2410A4",
  },
  {
    id: "ed-winter-2026",
    year: "2026",
    season: "Winter",
    codeName: "Renaissance",
    title: "सम्पूर्ण रामायण",
    nativeTitle: "प्राचीन भारतीय महाकाव्य",
    subtitle: "सम्पूर्ण स्वरबद्ध कथावाचन — शास्त्रीय हिन्दी",
    language: "Hindi",
    bookFormat: "Hardcover Volume",
    category: "Classical Epic",
    pagesCount: 416,
    chaptersCount: 42,
    duration: "15h 10m",
    coverImage: "https://storyhour.co.uk/wp-content/uploads/2026/01/WhatsApp-Image-2026-01-19-at-17.30.26.jpeg",
    badge: "BESTSELLER",
    description: "मर्यादा पुरुषोत्तम भगवान श्री राम का अमर चरित्र, त्याग, धर्म और मानवीय मूल्यों की पावन गाथा — भावपूर्ण स्वर और पारंपरिक भारतीय संगीत के संगम के साथ।",
    audioPreviewUrl: "https://www.youtube.com/embed/arzOYkbxwX8?autoplay=1",
    storyteller: "StoryHour मुख्य कथावाचक",
    price: 74.99,
    productId: "prod-hindi-ramayan",
    culturalNote: "हृदयस्पर्शी संवाद और प्रामाणिक सांस्कृतिक संदर्भों के साथ सम्पूर्ण परिवार के लिए।",
    accentColor: "#C9281D",
  },
  {
    id: "ed-summer-2025",
    year: "2025",
    season: "Summer",
    codeName: "Horizons",
    title: "శ్రీరామాయణం ప్రాచీన కావ్యం",
    nativeTitle: "దివ్య కావ్యం — శ్రవ్య రూపకం",
    subtitle: "Classical Telugu Oral Tradition & Melody",
    language: "Telugu",
    bookFormat: "Heritage Folio",
    category: "Sacred Lore",
    pagesCount: 360,
    chaptersCount: 38,
    duration: "13h 45m",
    coverImage: "https://storyhour.co.uk/wp-content/uploads/2026/01/WhatsApp-Image-2026-01-19-at-17.28.56.jpeg",
    badge: "HERITAGE",
    description: "శ్రీరాముని ధర్మమార్గం, సత్యపాలన మరియు సీతారాముల పవిత్ర బంధం — తేటతెలుగు పలుకులలో, హృదయాన్ని హత్తుకునే సంగీత నేపథ్యంతో.",
    audioPreviewUrl: "https://www.youtube.com/embed/gR3TuESZXos?autoplay=1",
    storyteller: "StoryHour Telugu Ensemble",
    price: 64.99,
    productId: "prod-telugu-ramayanam",
    culturalNote: "సాంప్రదాయ విలువలను భావి తరాలకు అందించే విశిష్ట ఆడియో ప్రయాణం.",
    accentColor: "#064C37",
  },
  {
    id: "ed-winter-2025",
    year: "2025",
    season: "Winter",
    codeName: "Devotion",
    title: "Hanuman’s Mighty Leap",
    subtitle: "Sundarakanda & Pure Devotion Across The Ocean",
    language: "English",
    bookFormat: "Illustrated Folio",
    category: "Sundarakanda",
    pagesCount: 144,
    chaptersCount: 12,
    duration: "1h 45m",
    coverImage: "https://storyhour.co.uk/wp-content/uploads/2026/01/Hanuman-2-1024x683.jpg",
    badge: "PERFORMANCE",
    description: "Discover how Hanuman conquered doubt and giant sea demons to reach Lanka, teaching children that quiet devotion and purpose can cross any ocean.",
    audioPreviewUrl: "https://www.youtube.com/embed/vcZeX0jPYg4?autoplay=1",
    storyteller: "StoryHour Puppet Troupe & Lead Performer",
    price: 34.99,
    culturalNote: "Accompanied by traditional live puppet gestures and percussive rhythm.",
    accentColor: "#8F1712",
  },

  // ── Bottom Shelf (5 Cultural & Oral Lore Editions) ──
  {
    id: "ed-summer-2024",
    year: "2024",
    season: "Summer",
    codeName: "Unified",
    title: "The Clever Hare & The Lion",
    subtitle: "Panchatantra: Wisdom Over Force",
    language: "English",
    bookFormat: "Illustrated Fables",
    category: "Panchatantra",
    pagesCount: 96,
    chaptersCount: 6,
    duration: "48m",
    coverImage: "https://storyhour.co.uk/wp-content/uploads/2026/01/Grand-Finale-5-scaled.jpg",
    badge: "FOLK TALE",
    description: "When the proud king of the jungle demands daily sacrifice, a tiny rabbit uses intellect and the illusion of a well to save every forest creature.",
    audioPreviewUrl: "https://www.youtube.com/embed/1otr4iUMGbU?autoplay=1",
    storyteller: "StoryHour Folk Narrator",
    price: 24.99,
    culturalNote: "From ancient India's premier compendium of moral and political fables.",
    accentColor: "#F6C445",
  },
  {
    id: "ed-winter-2024",
    year: "2024",
    season: "Winter",
    codeName: "Foundations",
    title: "Stories of Truth: Mohandas",
    subtitle: "Lessons in Conscience & Heritage",
    language: "Multilingual",
    bookFormat: "Archival Folio",
    category: "Moral History",
    pagesCount: 128,
    chaptersCount: 8,
    duration: "1h 15m",
    coverImage: "https://storyhour.co.uk/wp-content/uploads/2026/01/Gandhi-Prayers-STudents-1024x683.jpg",
    badge: "HISTORY",
    description: "How a young student grappled with truth, confession, and moral courage before leading a nation through the power of peaceful conviction.",
    audioPreviewUrl: "https://www.youtube.com/embed/4up2VdHiO5I?autoplay=1",
    storyteller: "StoryHour History Ensemble",
    price: 29.99,
    culturalNote: "Performed with youth drama students across Kendriya Vidyalaya and UK schools.",
    accentColor: "#3F383D",
  },
  {
    id: "ed-summer-2023",
    year: "2023",
    season: "Summer",
    codeName: "Imagine",
    title: "Lighting the Sacred Lamp",
    subtitle: "Fireside Tales & Bedtime Lore",
    language: "English",
    bookFormat: "Bedtime Volume",
    category: "Fireside Lore",
    pagesCount: 112,
    chaptersCount: 10,
    duration: "1h 30m",
    coverImage: "https://storyhour.co.uk/wp-content/uploads/2026/01/Lighting-The-Lamp-3-1024x683.jpg",
    badge: "BEDTIME",
    description: "Gentle cultural myths and moral stories told around evening lamps, connecting children to quiet reflection and timeless virtues.",
    audioPreviewUrl: "https://www.youtube.com/embed/arzOYkbxwX8?autoplay=1",
    storyteller: "StoryHour Cultural Troupe",
    price: 29.99,
    culturalNote: "Created specifically for calming screen-free bedtime listening.",
    accentColor: "#C9281D",
  },
  {
    id: "ed-winter-2023",
    year: "2023",
    season: "Winter",
    codeName: "Built to Last",
    title: "Classroom Residencies UK",
    subtitle: "Spanish School London Performance Archive",
    language: "Multilingual",
    bookFormat: "Residency Archive",
    category: "London Outreach",
    pagesCount: 160,
    chaptersCount: 12,
    duration: "2h 10m",
    coverImage: "https://storyhour.co.uk/wp-content/uploads/2026/01/SpanishSchool-London-1-1024x1024.jpeg",
    badge: "RESIDENCY",
    description: "Immersive school workshops bridging multilingual oral storytelling and cross-cultural heritage across classrooms in London.",
    audioPreviewUrl: "https://www.youtube.com/embed/gR3TuESZXos?autoplay=1",
    storyteller: "StoryHour Education Faculty",
    price: 39.99,
    culturalNote: "Recorded live during StoryHour London school outreach.",
    accentColor: "#2410A4",
  },
  {
    id: "ed-summer-2022",
    year: "2022",
    season: "Summer",
    codeName: "Connect",
    title: "KV Youth Ensemble Festival",
    subtitle: "Live Puppetry & Skits from Uppal",
    language: "Hindi",
    bookFormat: "Festival Edition",
    category: "Puppet & Theatre",
    pagesCount: 120,
    chaptersCount: 10,
    duration: "1h 50m",
    coverImage: "https://storyhour.co.uk/wp-content/uploads/2026/01/KV-Uppal-1024x768.jpeg",
    badge: "ARCHIVE",
    description: "Energetic student performances, puppet theatre, and mythological skits celebrating ancient values with modern youthful enthusiasm.",
    audioPreviewUrl: "https://www.youtube.com/embed/1otr4iUMGbU?autoplay=1",
    storyteller: "Kendriya Vidyalaya & StoryHour Ensemble",
    price: 29.99,
    culturalNote: "Annual youth storytelling showcase.",
    accentColor: "#064C37",
  },
];

export default function StoriesEditionsPage() {
  const [selectedEdition, setSelectedEdition] = useState<Edition | null>(null);
  const [hoveredEditionId, setHoveredEditionId] = useState<string | null>(null);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const { isPlaying, togglePlay, playStory } = useAudio();
  const { addToCart, showToast, setIsSearchOpen } = useLibraryCart();

  const topShelf = EDITIONS.slice(0, 4);
  const bottomShelf = EDITIONS.slice(4, 9);

  // Sync ambient sound button with global audio
  const handleToggleSound = () => {
    if (isPlaying) {
      togglePlay();
      setIsAudioPlaying(false);
    } else {
      // Play featured story preview
      const featured = EDITIONS[0];
      playStory({
        id: featured.id,
        slug: "ramayana-english",
        title: featured.title,
        subtitle: featured.subtitle,
        storyteller: featured.storyteller,
        language: featured.language,
        audience: "Families & All Ages",
        category: "Mythology & Epics",
        format: "Audiobook",
        duration: featured.duration,
        durationMinutes: 860,
        coverImage: featured.coverImage,
        audioPreviewUrl: featured.audioPreviewUrl,
        chaptersCount: featured.chaptersCount,
        description: featured.description,
      });
      setIsAudioPlaying(true);
      showToast("Playing StoryHour Editions Signature Narration");
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F3] text-[#050505] font-sans selection:bg-[#2410A4] selection:text-white flex flex-col justify-between overflow-x-hidden">
      {/* ── Studio Architectural Lighting Background ── */}
      <div
        className="fixed inset-0 pointer-events-none -z-10"
        style={{
          background: "radial-gradient(ellipse at 50% 30%, #FFFFFF 0%, #FAF8F3 60%, #EFEAE0 100%)",
        }}
      />

      {/* ── Official StoryHour Integrated Navbar (from Home page) ── */}
      <SiteNav theme="dark" activeLink="Books / Stories" />

      {/* ── Subtitle Editorial Left Align with Narration Audio Control ── */}
      <div className="w-full max-w-[1520px] mx-auto px-6 sm:px-10 lg:px-14 pt-4 sm:pt-6 pb-2 flex items-center justify-between z-20">
        <div>
          <h1 className="font-serif text-[20px] sm:text-[24px] font-normal text-[#050505] leading-[1.15] tracking-[-0.025em]">
            StoryHour Editions
          </h1>
          <p className="font-inter text-[13px] sm:text-[14px] text-[#696572] leading-[1.4] mt-0.5">
            Collectible books &amp; archival volumes. Preserved across English, Hindi, and Telugu.
          </p>
        </div>

        {/* Ambient Audio Companion Toggle */}
        <button
          onClick={handleToggleSound}
          aria-label="Toggle audio companion preview"
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-white hover:bg-[#EEF0FF] border border-[#E8E4DC] hover:border-[#2410A4] text-[13px] font-inter font-medium text-[#050505] hover:text-[#2410A4] transition-all shadow-subtle cursor-pointer"
        >
          {isPlaying || isAudioPlaying ? (
            <>
              <Volume2 className="w-4 h-4 text-[#2410A4] animate-pulse" />
              <span className="text-[#2410A4]">Audio Sample Playing</span>
            </>
          ) : (
            <>
              <Headphones className="w-4 h-4 text-[#696572]" />
              <span>Audio Companion Sample</span>
            </>
          )}
        </button>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          CENTER STAGE: THE 3D DOUBLE FLOATING ARCHITECTURAL SHELVES
          ═══════════════════════════════════════════════════════════ */}
      <main className="w-full max-w-[1520px] mx-auto px-4 sm:px-8 lg:px-12 flex-1 flex flex-col justify-center py-2 sm:py-6">
        {/* ── TOP SHELF (4 Editions) ── */}
        <section className="relative mb-14 sm:mb-16 lg:mb-20">
          {/* Ambient Spotlight Halos (Wall-mounted glowing wash lights) */}
          <div className="absolute inset-0 flex justify-around pointer-events-none -z-10 px-6 sm:px-12">
            {topShelf.map((ed) => (
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

          {/* Top Row of Square Covers */}
          <div
            className="flex items-end justify-center gap-4 sm:gap-8 md:gap-12 lg:gap-16 px-4 sm:px-8 relative z-10"
            style={{ perspective: "1400px" }}
          >
            {topShelf.map((ed, idx) => {
              const isHovered = hoveredEditionId === ed.id;
              return (
                <div
                  key={ed.id}
                  onMouseEnter={() => setHoveredEditionId(ed.id)}
                  onMouseLeave={() => setHoveredEditionId(null)}
                  onClick={() => setSelectedEdition(ed)}
                  className="group cursor-pointer flex flex-col items-center select-none"
                  style={{ perspective: "1200px" }}
                >
                  {/* Square 3D Album/Book Sleeve */}
                  <div
                    className="relative w-[135px] sm:w-[175px] md:w-[210px] lg:w-[240px] xl:w-[255px] aspect-square rounded-sm sm:rounded-md overflow-hidden transition-all duration-500 ease-out"
                    style={{
                      transform: isHovered
                        ? "translateY(-14px) scale(1.04) rotateX(-2deg)"
                        : "rotateX(2.5deg)",
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
                      priority={idx < 2}
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                      sizes="(max-width: 640px) 140px, (max-width: 1024px) 210px, 260px"
                    />

                    {/* Left Spine Shadow & Hardcover Book Hinge Crease */}
                    <div
                      className="absolute left-0 top-0 bottom-0 w-[9px] pointer-events-none z-10"
                      style={{
                        background: "linear-gradient(to right, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.2) 40%, rgba(255,255,255,0.12) 65%, rgba(0,0,0,0.02) 100%)",
                      }}
                    />
                    <div className="absolute left-[8px] top-0 bottom-0 w-[1px] bg-black/20 shadow-[1px_0_0_rgba(255,255,255,0.12)] pointer-events-none z-10" />

                    {/* Right Page Edge Sheen */}
                    <div
                      className="absolute right-0 top-0 bottom-0 w-[3px] pointer-events-none z-10"
                      style={{
                        background: "linear-gradient(to left, rgba(0,0,0,0.2) 0%, rgba(255,255,255,0.08) 50%, transparent 100%)",
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

                    {/* Top Shelf 1: StoryHour Collector's Edition Seal */}
                    {ed.isFeatured && (
                      <div className="absolute top-2.5 left-2.5 sm:top-3 sm:left-3 z-20 pointer-events-none">
                        <div className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-gradient-to-br from-[#FFF9E6] via-[#F6C445] to-[#E5AC20] text-[#120A45] flex flex-col items-center justify-center shadow-[0_4px_12px_rgba(0,0,0,0.25)] border border-white/60 -rotate-6 group-hover:rotate-0 transition-transform duration-300">
                          <span className="font-mono text-[6.5px] sm:text-[7px] font-black uppercase tracking-wider text-[#2410A4] leading-none">
                            SPECIAL
                          </span>
                          <span className="font-mono text-[6.5px] sm:text-[7px] font-black uppercase tracking-wider text-[#120A45] leading-none mt-0.5">
                            EDITION
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Centered Hover Book Action (Replaces circular play button) */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/35 backdrop-blur-[1.5px]">
                      <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white text-[#050505] font-inter text-[11px] sm:text-[12px] font-semibold shadow-xl transform scale-95 group-hover:scale-100 transition-all duration-300">
                        <BookOpen className="w-3.5 h-3.5 text-[#2410A4]" />
                        <span>View Edition</span>
                      </div>
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
                    className="w-[110px] sm:w-[150px] md:w-[190px] h-[6px] rounded-full bg-black/25 blur-[3px] transition-all duration-500"
                    style={{
                      transform: isHovered ? "scale(0.85) translateY(4px)" : "scale(1)",
                      opacity: isHovered ? 0.35 : 0.65,
                    }}
                  />
                </div>
              );
            })}
          </div>

          {/* ── TOP SHELF SLAB (Floating Pure White Architectural Shelf) ── */}
          <div className="relative w-full mt-[-3px]">
            {/* Top Surface (Reflecting Light & Mirroring Base of Covers) */}
            <div
              className="w-full h-[10px] sm:h-[12px] rounded-t-sm"
              style={{
                background: "linear-gradient(to bottom, #FFFFFF 0%, #F5F4F0 70%, #E8E6E0 100%)",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.9), inset 0 -1px 0 rgba(0,0,0,0.06)",
              }}
            />
            {/* Front Edge (Crisp White Bevel) */}
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

        {/* ── BOTTOM SHELF (5 Editions) ── */}
        <section className="relative mb-6 sm:mb-8 lg:mb-10">
          {/* Bottom Row of 5 Square Covers */}
          <div
            className="flex items-end justify-center gap-3 sm:gap-6 md:gap-8 lg:gap-10 px-2 sm:px-6 relative z-10"
            style={{ perspective: "1400px" }}
          >
            {bottomShelf.map((ed) => {
              const isHovered = hoveredEditionId === ed.id;
              return (
                <div
                  key={ed.id}
                  onMouseEnter={() => setHoveredEditionId(ed.id)}
                  onMouseLeave={() => setHoveredEditionId(null)}
                  onClick={() => setSelectedEdition(ed)}
                  className="group cursor-pointer flex flex-col items-center select-none"
                  style={{ perspective: "1200px" }}
                >
                  {/* Square 3D Album/Book Sleeve */}
                  <div
                    className="relative w-[115px] sm:w-[145px] md:w-[175px] lg:w-[200px] xl:w-[215px] aspect-square rounded-sm sm:rounded-md overflow-hidden transition-all duration-500 ease-out"
                    style={{
                      transform: isHovered
                        ? "translateY(-14px) scale(1.04) rotateX(-2deg)"
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
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                      sizes="(max-width: 640px) 115px, (max-width: 1024px) 175px, 220px"
                    />

                    {/* Left Spine Shadow & Hardcover Book Hinge Crease */}
                    <div
                      className="absolute left-0 top-0 bottom-0 w-[7px] pointer-events-none z-10"
                      style={{
                        background: "linear-gradient(to right, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.18) 40%, rgba(255,255,255,0.12) 65%, rgba(0,0,0,0.02) 100%)",
                      }}
                    />
                    <div className="absolute left-[6px] top-0 bottom-0 w-[1px] bg-black/20 shadow-[1px_0_0_rgba(255,255,255,0.12)] pointer-events-none z-10" />

                    {/* Right Page Edge Sheen */}
                    <div
                      className="absolute right-0 top-0 bottom-0 w-[2.5px] pointer-events-none z-10"
                      style={{
                        background: "linear-gradient(to left, rgba(0,0,0,0.2) 0%, rgba(255,255,255,0.08) 50%, transparent 100%)",
                      }}
                    />

                    {/* Gloss Reflection */}
                    <div
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        background:
                          "linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 45%, rgba(0,0,0,0.15) 100%)",
                      }}
                    />

                    {/* Centered Hover Book Action (Replaces circular play button) */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/35 backdrop-blur-[1.5px]">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 sm:py-1.5 rounded-full bg-white text-[#050505] font-inter text-[10px] sm:text-[11px] font-semibold shadow-xl transform scale-95 group-hover:scale-100 transition-all duration-300">
                        <BookOpen className="w-3 h-3 text-[#2410A4]" />
                        <span>View Edition</span>
                      </div>
                    </div>

                    {/* Bottom Title Overlay Tag */}
                    <div className="absolute bottom-0 inset-x-0 p-2 sm:p-2.5 bg-gradient-to-t from-black/85 via-black/40 to-transparent flex items-end justify-between pointer-events-none">
                      <div className="min-w-0 pr-1">
                        <p className="font-inter font-semibold text-[10px] sm:text-[11.5px] text-white truncate drop-shadow-sm">
                          {ed.codeName}
                        </p>
                        <p className="font-inter text-[8.5px] sm:text-[9.5px] text-white/80 truncate">
                          {ed.language} · {ed.category}
                        </p>
                      </div>
                      <span className="px-1.5 py-0.5 rounded bg-white/20 backdrop-blur-sm text-[8px] sm:text-[8.5px] font-mono font-medium text-white flex-shrink-0">
                        {ed.bookFormat}
                      </span>
                    </div>
                  </div>

                  {/* Contact Shadow on the Shelf Surface */}
                  <div
                    className="w-[95px] sm:w-[130px] md:w-[160px] h-[5px] rounded-full bg-black/25 blur-[3px] transition-all duration-500"
                    style={{
                      transform: isHovered ? "scale(0.85) translateY(4px)" : "scale(1)",
                      opacity: isHovered ? 0.35 : 0.65,
                    }}
                  />
                </div>
              );
            })}
          </div>

          {/* ── BOTTOM SHELF SLAB (Floating Pure White Architectural Shelf) ── */}
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
        </section>
      </main>

      {/* ═══════════════════════════════════════════════════════════
          BOTTOM TIMELINE BAR (Shopify Editions Exact Layout)
          ═══════════════════════════════════════════════════════════ */}
      <footer className="w-full border-t border-[#E8E4DC] bg-[#FAF8F3]/90 backdrop-blur-sm z-20">
        <div className="max-w-[1520px] mx-auto px-4 sm:px-8 lg:px-12 py-5 sm:py-6">
          <div className="grid grid-cols-5 sm:grid-cols-9 gap-2 sm:gap-4 items-start">
            {EDITIONS.map((ed) => {
              const isHovered = hoveredEditionId === ed.id;
              const isSelected = selectedEdition?.id === ed.id;
              return (
                <button
                  key={`timeline-${ed.id}`}
                  onMouseEnter={() => setHoveredEditionId(ed.id)}
                  onMouseLeave={() => setHoveredEditionId(null)}
                  onClick={() => setSelectedEdition(ed)}
                  className={`text-left group cursor-pointer transition-all duration-200 py-1 ${
                    isHovered || isSelected ? "opacity-100" : "opacity-70 hover:opacity-100"
                  }`}
                >
                  {/* Top Line: Year */}
                  <p className="font-mono text-[10px] sm:text-[11px] text-[#696572] leading-none mb-1">
                    {ed.year}
                  </p>
                  {/* Middle Line: Season */}
                  <p className="font-inter text-[10px] sm:text-[11px] text-[#696572] leading-none mb-1.5">
                    {ed.season}
                  </p>
                  {/* Bottom Line: Title/Codename (Bold) */}
                  <p
                    className={`font-inter text-[12px] sm:text-[13px] font-semibold leading-[1.2] transition-colors truncate ${
                      isHovered || isSelected ? "text-[#2410A4]" : "text-[#050505]"
                    }`}
                  >
                    {ed.codeName}
                  </p>
                  {/* Subtle Active Indicator Line */}
                  <div
                    className={`h-[1.5px] mt-1.5 transition-all duration-300 rounded-full ${
                      isSelected
                        ? "bg-[#2410A4] w-full"
                        : isHovered
                        ? "bg-[#050505] w-2/3"
                        : "bg-transparent w-0"
                    }`}
                  />
                </button>
              );
            })}
          </div>
        </div>
      </footer>

      {/* ═══════════════════════════════════════════════════════════
          INTERACTIVE EDITION DETAIL MODAL / DRAWER
          ═══════════════════════════════════════════════════════════ */}
      {selectedEdition && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
          onClick={() => setSelectedEdition(null)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-[#050505]/70 backdrop-blur-md transition-opacity" />

          {/* Dialog Container */}
          <div
            className="relative z-10 w-full max-w-[920px] max-h-[92vh] bg-[#FAF8F3] rounded-2xl shadow-[0_40px_100px_-20px_rgba(0,0,0,0.6)] overflow-hidden flex flex-col lg:flex-row animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedEdition(null)}
              aria-label="Close edition preview"
              className="absolute top-4 right-4 z-30 w-10 h-10 rounded-full bg-black/10 hover:bg-black/20 flex items-center justify-center text-[#050505] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Left Column: 3D Edition Artwork Stage */}
            <div className="relative w-full lg:w-[380px] bg-gradient-to-br from-[#120A45] via-[#1B0C6E] to-[#2410A4] p-8 flex flex-col items-center justify-center flex-shrink-0">
              {/* Diffuse glow */}
              <div className="absolute w-[240px] h-[240px] rounded-full bg-[#2410A4] blur-[70px] opacity-60 pointer-events-none" />

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
                <span className="px-3 py-1 rounded-full bg-[#F6C445] text-[#120A45] text-[10px] font-mono font-bold uppercase tracking-wider">
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
                <span className="font-mono text-[11px] uppercase tracking-widest text-[#2410A4] font-semibold">
                  StoryHour Collector&apos;s Edition
                </span>
                <h2 className="mt-1 font-serif text-[26px] sm:text-[32px] font-normal text-[#050505] leading-[1.05] tracking-[-0.025em]">
                  {selectedEdition.title}
                </h2>
                {selectedEdition.nativeTitle && (
                  <p className="mt-1 font-serif text-[18px] text-[#696572] italic">
                    {selectedEdition.nativeTitle}
                  </p>
                )}
                <p className="mt-1.5 font-inter text-[14px] text-[#696572]">
                  {selectedEdition.subtitle}
                </p>
              </div>

              {/* Metadata Badges */}
              <div className="flex flex-wrap gap-3 font-mono text-[11px] text-[#696572] py-2 border-y border-[#E8E4DC]">
                <span className="flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-[#2410A4]" />
                  {selectedEdition.bookFormat}
                </span>
                <span className="flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-[#2410A4]" />
                  {selectedEdition.pagesCount} Pages ({selectedEdition.chaptersCount} Chapters)
                </span>
                <span className="flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-[#2410A4]" />
                  {selectedEdition.language}
                </span>
                {selectedEdition.duration && (
                  <span className="flex items-center gap-1.5">
                    <Headphones className="w-3.5 h-3.5 text-[#2410A4]" />
                    Audio Companion ({selectedEdition.duration})
                  </span>
                )}
              </div>

              {/* Synopsis */}
              <p className="font-inter text-[14px] text-[#3F383D] leading-[1.65]">
                {selectedEdition.description}
              </p>

              {selectedEdition.culturalNote && (
                <div className="p-3.5 rounded-lg bg-[#FAF8F3] border-l-2 border-[#2410A4] text-[12.5px] font-inter text-[#696572] italic">
                  {selectedEdition.culturalNote}
                </div>
              )}

              {/* Secondary Audio Companion Sample Player */}
              <div className="p-4 rounded-xl bg-[#EEF0FF] flex items-center gap-4">
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
                    showToast(`Playing audio companion sample: ${selectedEdition.title}`);
                  }}
                  className="w-11 h-11 rounded-full bg-[#2410A4] hover:bg-[#1B0C80] text-white flex items-center justify-center flex-shrink-0 shadow-md cursor-pointer transition-colors"
                >
                  <Play className="w-4 h-4 fill-white ml-0.5" />
                </button>
                <div className="flex-1 min-w-0">
                  <p className="font-inter text-[13px] font-semibold text-[#050505]">
                    Audio Companion Preview
                  </p>
                  <p className="font-inter text-[11px] text-[#696572] truncate">
                    Studio narration · Performed by {selectedEdition.storyteller}
                  </p>
                </div>
                <span className="font-mono text-[11px] text-[#2410A4] font-medium flex-shrink-0">
                  Audio Included
                </span>
              </div>

              {/* Purchase / Action Row */}
              <div className="flex items-center justify-between pt-2">
                <div>
                  <span className="font-mono text-[11px] text-[#696572] block">
                    Collector&apos;s Book Edition
                  </span>
                  <span className="font-serif text-[24px] font-bold text-[#050505]">
                    ${selectedEdition.price}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      addToCart({
                        id: selectedEdition.productId || selectedEdition.id,
                        slug: selectedEdition.id,
                        title: selectedEdition.title,
                        language: selectedEdition.language,
                        price: selectedEdition.price,
                        currency: "$",
                        coverImage: selectedEdition.coverImage,
                        format: `${selectedEdition.bookFormat} (Collector's)`,
                        description: selectedEdition.description,
                        chaptersCount: selectedEdition.chaptersCount,
                      });
                      showToast(`${selectedEdition.title} added to cart`);
                    }}
                    className="px-6 py-3 rounded-full bg-[#2410A4] hover:bg-[#1B0C80] text-white font-inter text-[13px] font-medium transition-all shadow-md hover:shadow-lg flex items-center gap-2 cursor-pointer"
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
    </div>
  );
}

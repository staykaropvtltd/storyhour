"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useLibraryCart } from "@/context/LibraryCartContext";
import {
  X,
  Lock,
  Unlock,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  ShoppingBag,
  Check,
  Loader2,
  Globe,
  Headphones,
  User,
  Volume2,
  VolumeX,
} from "lucide-react";

/* ═══════════════════════════════════════════════════════════════════════════
   TEMPORARY DEMO BOOK DATA
   Structured so real book data can replace this later.
   ═══════════════════════════════════════════════════════════════════════════ */
interface BookPage {
  pageNumber: number;
  chapterTitle?: string;
  content: string;
}

const DEMO_PAGES: BookPage[] = [
  {
    pageNumber: 1,
    chapterTitle: "The Kingdom of Ayodhya",
    content:
      "In the ancient land of Bharat, nestled along the banks of the sacred river Sarayu, stood the magnificent city of Ayodhya — the unconquerable. Its walls gleamed like burnished gold under the morning sun, and its streets were lined with flowering trees whose petals drifted like blessings upon every passerby.\n\nKing Dasharatha ruled this glorious kingdom with wisdom and compassion. His fame had spread across all the realms, and even the devas in the heavens spoke of his righteousness.",
  },
  {
    pageNumber: 2,
    chapterTitle: "The Promise of Light",
    content:
      "Yet despite all his splendour, the king carried a quiet sorrow in his heart — he had no heir to continue his noble lineage. The palace halls, magnificent as they were, echoed with an emptiness that no treasure could fill.\n\nOn the counsel of the great sage Vasishtha, the king performed the sacred Putrakameshti Yajna — a fire ritual of immense power — invoking the blessings of the gods for the gift of children.",
  },
  {
    pageNumber: 3,
    chapterTitle: "Birth of the Princes",
    content:
      "From the sacred flames emerged a divine being bearing a golden vessel filled with celestial payasam. The heavens thundered with joy as the offering was received.\n\nIn time, four princes were born — Rama, the eldest, radiant as the full moon; Bharata, noble and devoted; and the twins Lakshmana and Shatrughna, inseparable in their bond. The city of Ayodhya erupted in celebration that lasted for days without end.",
  },
  {
    pageNumber: 4,
    chapterTitle: "The Young Prince",
    content:
      "Young Rama grew like a banyan tree — strong, sheltering, and deeply rooted in dharma. Under the tutelage of Guru Vasishtha, he mastered the Vedas, the art of warfare, and the sacred duty of a kshatriya.\n\nHis gentle demeanour won the hearts of all who met him. The birds seemed to sing sweeter when he walked through the palace gardens, and the very earth felt honoured by his footsteps.",
  },
  {
    pageNumber: 5,
    chapterTitle: "Sage Vishwamitra's Call",
    content:
      "One fateful day, the great sage Vishwamitra arrived at the court of Ayodhya. His presence commanded reverence, for he was among the most powerful rishis the world had ever known.\n\n'O King Dasharatha,' he spoke, his voice resonating like distant thunder, 'I require the aid of your eldest son, Prince Rama. Dark forces threaten my sacred rituals in the forest. Only he possesses the divine strength to protect the holy ground.'",
  },
  {
    pageNumber: 6,
    chapterTitle: "Into the Forest",
    content:
      "With his father's reluctant blessing and Lakshmana by his side, young Rama ventured into the dense forests beyond the city walls. The canopy overhead filtered the sunlight into emerald beams, and the air was thick with the fragrance of ancient trees.\n\nThus began the journey that would shape the destiny of all creation — a journey of duty, love, sacrifice, and the eternal triumph of light over darkness.",
  },
];

/* ═══════════════════════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════════════════════ */
interface Edition {
  id: string;
  title: string;
  subtitle: string;
  language: string;
  coverImage: string;
  description: string;
  storyteller: string;
  price: number;
  chaptersCount: number;
  duration: string;
  bookFormat: string;
  category: string;
  pagesCount: number;
  nativeTitle?: string;
  culturalNote?: string;
  year?: string;
  season?: string;
  codeName?: string;
  badge?: string;
  isFeatured?: boolean;
  isNowPlaying?: boolean;
  audioPreviewUrl?: string;
  productId?: string;
  accentColor?: string;
}

type ReaderState = "preview" | "unlocking" | "reading";

interface BookReaderProps {
  edition: Edition;
  onClose: () => void;
}

/* ═══════════════════════════════════════════════════════════════════════════
   SUBTLE SYNTHESIZED PAPER FLIP AUDIO (Web Audio API)
   ═══════════════════════════════════════════════════════════════════════════ */
function playPaperFlipSound() {
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const bufferSize = ctx.sampleRate * 0.12;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = 950;
    filter.Q.value = 1.4;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.04, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.12);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    noise.start();
  } catch {
    // Audio context may be blocked by browser policy
  }
}

/* ═══════════════════════════════════════════════════════════════════════════
   REUSABLE PAGE FACE COMPONENT
   Renders an authentic antique cream book page with drop caps and paper texture
   ═══════════════════════════════════════════════════════════════════════════ */
function PageFace({
  page,
  isLeft,
  onClick,
  canTurn = false,
}: {
  page?: BookPage;
  isLeft: boolean;
  onClick?: () => void;
  canTurn?: boolean;
}) {
  if (!page) {
    return (
      <div
        className={`w-full h-full flex items-center justify-center p-8 sm:p-12 select-none bg-[#FCFAF6] ${
          isLeft ? "border-r border-[#EFECE6]" : "border-l border-[#EFECE6]"
        }`}
      >
        <div className="text-center text-[#B5AFA6] font-serif italic text-sm">
          — End of Chapter Preview —
        </div>
      </div>
    );
  }

  // Format content to highlight drop-cap on first letter
  const firstLetter = page.content.charAt(0);
  const remainingContent = page.content.slice(1);

  return (
    <div
      onClick={onClick}
      className={`group relative w-full h-full p-7 sm:p-10 md:p-12 flex flex-col justify-between select-none bg-[#FCFAF6] transition-colors duration-200 overflow-hidden ${
        canTurn ? "cursor-pointer" : ""
      } ${
        isLeft
          ? "border-r border-[#E8E4DC] shadow-[inset_-12px_0_24px_rgba(0,0,0,0.025)]"
          : "border-l border-[#E8E4DC] shadow-[inset_12px_0_24px_rgba(0,0,0,0.025)]"
      }`}
    >
      {/* Paper Grain Overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-40 mix-blend-multiply"
        style={{
          backgroundImage:
            "radial-gradient(circle at 50% 50%, rgba(240, 235, 224, 0.8) 0%, rgba(230, 222, 208, 0.4) 100%)",
        }}
      />

      {/* Crease shadow near spine */}
      <div
        className={`absolute top-0 bottom-0 pointer-events-none w-12 ${
          isLeft
            ? "right-0 bg-gradient-to-l from-black/[0.07] via-black/[0.02] to-transparent"
            : "left-0 bg-gradient-to-r from-black/[0.07] via-black/[0.02] to-transparent"
        }`}
      />

      {/* Top Header */}
      <div className="relative z-10 flex items-center justify-between border-b border-[#E8E4DC]/60 pb-3 mb-6">
        <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#9E9689] font-medium">
          {isLeft ? `StoryHour Anthology` : `Chapter ${Math.ceil(page.pageNumber / 2)}`}
        </span>
        <span className="font-serif text-[11px] text-[#9E9689] italic">
          — Page {page.pageNumber} —
        </span>
      </div>

      {/* Chapter Content Body */}
      <div className="relative z-10 flex-1">
        {page.chapterTitle && (
          <div className="mb-5 sm:mb-6">
            <h3 className="font-serif text-[20px] sm:text-[24px] md:text-[27px] font-bold text-[#1F1C18] leading-[1.15] tracking-[-0.02em]">
              {page.chapterTitle}
            </h3>
            <div className="mt-2 w-8 h-[2px] bg-[#C9281D]/70 rounded-full" />
          </div>
        )}

        <div className="font-serif text-[13.5px] sm:text-[14.5px] md:text-[15.5px] text-[#2C2824] leading-[1.8] tracking-[-0.005em] whitespace-pre-line text-justify">
          <span className="float-left text-4xl sm:text-5xl font-serif font-black text-[#C9281D] leading-none pr-3 pt-1 select-none">
            {firstLetter}
          </span>
          {remainingContent}
        </div>
      </div>

      {/* Bottom Footer & Page Curl Cue */}
      <div className="relative z-10 flex items-center justify-between pt-4 mt-6 border-t border-[#E8E4DC]/60 font-mono text-[10px] text-[#A69E90]">
        <span>{isLeft ? "◄ Click to turn back" : ""}</span>
        <span className="font-semibold tracking-widest">{page.pageNumber}</span>
        <span>{!isLeft ? "Click to turn next ►" : ""}</span>
      </div>

      {/* Interactive Page Curl Cue on Corner Hover */}
      {canTurn && (
        <div
          className={`absolute bottom-0 ${
            isLeft ? "left-0" : "right-0"
          } w-10 h-10 overflow-hidden pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
        >
          <div
            className={`w-14 h-14 bg-gradient-to-tr from-[#E3DDD1] to-white shadow-md transform ${
              isLeft
                ? "-translate-x-7 translate-y-7 rotate-45"
                : "translate-x-7 translate-y-7 -rotate-45"
            } transition-transform duration-200 group-hover:scale-110`}
          />
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN BOOK READER COMPONENT
   ═══════════════════════════════════════════════════════════════════════════ */
export default function BookReader({ edition, onClose }: BookReaderProps) {
  const { isBookUnlocked, addToCart, unlockBooks, showToast } = useLibraryCart();
  const router = useRouter();
  const isUnlocked = isBookUnlocked(edition.id);
  const [state, setState] = useState<ReaderState>(isUnlocked ? "reading" : "preview");
  const [currentSpread, setCurrentSpread] = useState(0); // Index into page pairs (0 = pages 1-2, 1 = pages 3-4, etc.)
  const [isBookOpen, setIsBookOpen] = useState(false);
  const [isFlipping, setIsFlipping] = useState(false);
  const [flipDirection, setFlipDirection] = useState<"next" | "prev" | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  const totalSpreads = Math.ceil(DEMO_PAGES.length / 2);

  // Sync state if unlocked status changes
  useEffect(() => {
    if (isUnlocked) {
      setState("reading");
    }
  }, [isUnlocked]);

  // Trigger book-opening animation after mount in preview mode
  useEffect(() => {
    const timer = setTimeout(() => setIsBookOpen(true), 150);
    return () => clearTimeout(timer);
  }, []);

  // Lock body scroll while reader is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // Page Turn Actions with 3D Rotation Animation
  const turnNext = useCallback(() => {
    if (isFlipping || currentSpread >= totalSpreads - 1) return;
    if (!isUnlocked && currentSpread >= 1) {
      showToast("Unlock full edition to read beyond the free preview pages!");
      return;
    }
    if (soundEnabled) playPaperFlipSound();
    setFlipDirection("next");
    setIsFlipping(true);
  }, [isFlipping, currentSpread, totalSpreads, soundEnabled, isUnlocked, showToast]);

  const turnPrev = useCallback(() => {
    if (isFlipping || currentSpread <= 0) return;
    if (soundEnabled) playPaperFlipSound();
    setFlipDirection("prev");
    setIsFlipping(true);
  }, [isFlipping, currentSpread, soundEnabled]);

  // Handler when 3D page flip animation finishes
  const handleFlipComplete = () => {
    if (flipDirection === "next") {
      setCurrentSpread((s) => Math.min(s + 1, totalSpreads - 1));
    } else if (flipDirection === "prev") {
      setCurrentSpread((s) => Math.max(s - 1, 0));
    }
    setIsFlipping(false);
    setFlipDirection(null);
  };

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
      if (state === "reading") {
        if (e.key === "ArrowRight" || e.key === "ArrowDown" || e.key === " ") {
          e.preventDefault();
          turnNext();
        }
        if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
          e.preventDefault();
          turnPrev();
        }
      }
    },
    [state, turnNext, turnPrev, onClose]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Mock purchase flow
  const handleUnlock = () => {
    setState("unlocking");
    setTimeout(() => {
      unlockBooks([edition.id]);
      setState("reading");
      setCurrentSpread(0);
    }, 2200);
  };

  // Helper pages for current spread and incoming spread
  const currentLeftPage = DEMO_PAGES[currentSpread * 2];
  const currentRightPage = DEMO_PAGES[currentSpread * 2 + 1];

  const nextLeftPage = DEMO_PAGES[(currentSpread + 1) * 2];
  const nextRightPage = DEMO_PAGES[(currentSpread + 1) * 2 + 1];

  const prevLeftPage = DEMO_PAGES[(currentSpread - 1) * 2];
  const prevRightPage = DEMO_PAGES[(currentSpread - 1) * 2 + 1];

  return (
    <AnimatePresence>
      <motion.div
        ref={containerRef}
        className="fixed inset-0 z-[200] flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Backdrop with dark blur */}
        <motion.div
          className="absolute inset-0 bg-[#070605]/85 backdrop-blur-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          onClick={onClose}
        />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 z-[215] w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 flex items-center justify-center text-white/80 hover:text-white transition-all cursor-pointer backdrop-blur-md shadow-lg"
          aria-label="Close book reader"
        >
          <X className="w-5 h-5" />
        </button>

        {/* ════════════════════════════════════════════════════════════════
            PREVIEW STATE: 3D Book Cover + Info Panel
            ════════════════════════════════════════════════════════════════ */}
        {state === "preview" && (
          <motion.div
            className="relative z-[205] w-full max-w-[960px] mx-4 sm:mx-6 flex flex-col lg:flex-row items-center lg:items-stretch gap-0 lg:gap-0 overflow-hidden rounded-2xl shadow-2xl border border-white/10"
            initial={{ scale: 0.85, opacity: 0, y: 40 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Left: Animated 3D Book Cover */}
            <div className="relative w-full lg:w-[420px] bg-gradient-to-br from-[#0F0E0C] via-[#1A1816] to-[#24211D] flex items-center justify-center p-8 sm:p-12 flex-shrink-0 overflow-hidden">
              {/* Warm Ambient glow */}
              <div className="absolute w-[320px] h-[320px] rounded-full bg-[#C9281D]/20 blur-[90px] pointer-events-none" />

              {/* 3D Book with opening animation */}
              <motion.div
                className="relative"
                style={{ perspective: 1200 }}
                initial={{ rotateY: 0 }}
                animate={{ rotateY: isBookOpen ? -24 : 0 }}
                transition={{ duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.3 }}
              >
                <div
                  className="relative w-[220px] sm:w-[260px] aspect-[3/4] rounded-lg overflow-hidden"
                  style={{
                    transformStyle: "preserve-3d",
                    boxShadow: isBookOpen
                      ? "14px 14px 45px rgba(0,0,0,0.7), -4px 0 20px rgba(0,0,0,0.4)"
                      : "0 30px 70px -15px rgba(0,0,0,0.7), 0 10px 30px -10px rgba(0,0,0,0.5)",
                  }}
                >
                  <Image
                    src={edition.coverImage}
                    alt={edition.title}
                    fill
                    className="object-cover"
                    sizes="280px"
                    priority
                  />
                  {/* Spine gradient */}
                  <div className="absolute left-0 top-0 bottom-0 w-[10px] bg-gradient-to-r from-black/60 via-black/25 to-transparent z-10" />
                  {/* Gloss & specular highlight */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-white/20 pointer-events-none" />
                </div>

                {/* Simulated back page thickness visible when book tilts */}
                <motion.div
                  className="absolute top-[3px] -right-[7px] w-[220px] sm:w-[260px] rounded-r-md overflow-hidden"
                  style={{
                    height: "calc(100% - 6px)",
                    background: "linear-gradient(to right, #ded8cc, #f4f0e6, #ded8cc)",
                    transformOrigin: "left center",
                    transformStyle: "preserve-3d",
                    zIndex: -1,
                    boxShadow: "5px 3px 15px rgba(0,0,0,0.25)",
                  }}
                />
              </motion.div>

              {/* Edition badges */}
              <div className="absolute bottom-6 left-6 right-6 flex items-center gap-2 z-10">
                <span className="px-3 py-1 rounded-full bg-gradient-to-r from-[#DE3124] to-[#C9281D] text-white text-[10px] font-mono font-bold uppercase tracking-wider shadow-[0_4px_12px_rgba(201,40,29,0.4)]">
                  {edition.bookFormat || "Collector's Edition"}
                </span>
                <span className="px-2.5 py-1 rounded-full bg-white/15 backdrop-blur-sm text-white text-[10px] font-mono">
                  {edition.language}
                </span>
              </div>
            </div>

            {/* Right: Book Information & Purchase */}
            <div className="w-full lg:flex-1 bg-[#FAF8F3] p-7 sm:p-9 flex flex-col justify-between overflow-y-auto max-h-[70vh] lg:max-h-none">
              <div className="space-y-5">
                <div>
                  <span className="font-mono text-[11px] uppercase tracking-widest text-[#C9281D] font-bold">
                    StoryHour Edition
                  </span>
                  <h2 className="mt-1.5 font-serif text-[28px] sm:text-[34px] font-normal text-[#0F0F0F] leading-[1.05] tracking-[-0.025em]">
                    {edition.title}
                  </h2>
                  {edition.nativeTitle && (
                    <p className="mt-1 font-serif text-[18px] text-[#5A5A5A] italic">
                      {edition.nativeTitle}
                    </p>
                  )}
                  <p className="mt-2 font-sans text-[14px] text-[#5A5A5A] leading-[1.6]">
                    {edition.description}
                  </p>
                </div>

                {/* Metadata */}
                <div className="flex flex-wrap gap-x-5 gap-y-2 py-3 border-y border-[#E7E7E7] font-mono text-[11px] text-[#5A5A5A]">
                  <span className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-[#C9281D]" />
                    {edition.storyteller}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-[#C9281D]" />
                    {edition.language}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-[#C9281D]" />
                    {edition.chaptersCount} Chapters · {edition.pagesCount} Pages
                  </span>
                  {edition.duration && (
                    <span className="flex items-center gap-1.5">
                      <Headphones className="w-3.5 h-3.5 text-[#C9281D]" />
                      Audio ({edition.duration})
                    </span>
                  )}
                </div>

                {/* Locked or Unlocked pages indicator */}
                {isUnlocked ? (
                  <div className="flex items-center gap-3 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0 text-emerald-600">
                      <Check className="w-5 h-5 stroke-[2.5]" />
                    </div>
                    <div>
                      <p className="font-sans text-[13px] font-bold text-emerald-700">
                        Edition Purchased &amp; Unlocked
                      </p>
                      <p className="font-sans text-[11px] text-emerald-600">
                        You have full access to all {DEMO_PAGES.length} pages with 3D turning animation.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 p-3.5 rounded-xl bg-[#0F0F0F]/5 border border-[#E7E7E7]">
                    <div className="w-10 h-10 rounded-full bg-[#0F0F0F]/10 flex items-center justify-center flex-shrink-0">
                      <Lock className="w-4.5 h-4.5 text-[#5A5A5A]" />
                    </div>
                    <div>
                      <p className="font-sans text-[13px] font-semibold text-[#0F0F0F]">
                        Pages locked until purchase
                      </p>
                      <p className="font-sans text-[11px] text-[#5A5A5A]">
                        Unlock the full book to read all {DEMO_PAGES.length} pages with 3D turning animation
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Purchase row */}
              <div className="flex items-center justify-between pt-5 mt-5 border-t border-[#E7E7E7]">
                <div>
                  <span className="font-mono text-[11px] text-[#5A5A5A] block">
                    Digital Edition
                  </span>
                  <span className="font-serif text-[26px] font-bold text-[#0F0F0F]">
                    ${edition.price}
                  </span>
                </div>
                {isUnlocked ? (
                  <button
                    onClick={() => setState("reading")}
                    className="px-7 py-3.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-sans text-[14px] font-bold transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2 cursor-pointer"
                  >
                    <BookOpen className="w-4 h-4" />
                    Read Book Now
                  </button>
                ) : (
                  <div className="flex items-center gap-2 sm:gap-2.5">
                    <button
                      onClick={() => {
                        addToCart({
                          id: edition.id,
                          title: edition.title,
                          nativeTitle: edition.nativeTitle,
                          subtitle: edition.subtitle,
                          authorOrNarrator: edition.storyteller,
                          coverImage: edition.coverImage,
                          price: edition.price,
                          format: edition.bookFormat || "Digital Edition",
                          language: edition.language,
                          type: "book",
                        });
                      }}
                      className="px-4 sm:px-5 py-3 rounded-full bg-white hover:bg-gray-50 text-[#0F0F0F] font-sans text-[13px] font-bold border border-black/15 transition-all shadow-sm hover:shadow hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2 cursor-pointer"
                    >
                      <ShoppingBag className="w-4 h-4 text-[#C9281D]" />
                      Add to Cart
                    </button>
                    <button
                      onClick={() => {
                        addToCart({
                          id: edition.id,
                          title: edition.title,
                          nativeTitle: edition.nativeTitle,
                          subtitle: edition.subtitle,
                          authorOrNarrator: edition.storyteller,
                          coverImage: edition.coverImage,
                          price: edition.price,
                          format: edition.bookFormat || "Digital Edition",
                          language: edition.language,
                          type: "book",
                        });
                        onClose();
                        router.push("/checkout");
                      }}
                      className="px-5 sm:px-6 py-3 rounded-full bg-gradient-to-r from-[#DE3124] via-[#C9281D] to-[#991B1B] hover:from-[#EA3A2D] hover:via-[#D12E23] hover:to-[#A81F19] text-white font-sans text-[13px] font-bold transition-all shadow-[0_4px_16px_rgba(201,40,29,0.35)] hover:shadow-[0_8px_24px_rgba(201,40,29,0.5)] hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-1.5 cursor-pointer"
                    >
                      Buy Now
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* ════════════════════════════════════════════════════════════════
            UNLOCKING STATE: Purchase Animation
            ════════════════════════════════════════════════════════════════ */}
        {state === "unlocking" && (
          <motion.div
            className="relative z-[205] flex flex-col items-center justify-center gap-6"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
          >
            <motion.div
              className="w-24 h-24 rounded-full bg-gradient-to-br from-[#DE3124] to-[#C9281D] flex items-center justify-center shadow-[0_0_60px_rgba(201,40,29,0.4)]"
              animate={{
                scale: [1, 1.15, 1, 1.1, 1],
                boxShadow: [
                  "0 0 60px rgba(201,40,29,0.4)",
                  "0 0 100px rgba(201,40,29,0.6)",
                  "0 0 60px rgba(201,40,29,0.4)",
                  "0 0 80px rgba(201,40,29,0.5)",
                  "0 0 60px rgba(201,40,29,0.4)",
                ],
              }}
              transition={{ duration: 2, ease: "easeInOut" }}
            >
              <motion.div
                initial={{ opacity: 1 }}
                animate={{ opacity: 0 }}
                transition={{ delay: 1.4, duration: 0.3 }}
              >
                <Loader2 className="w-10 h-10 text-white animate-spin" />
              </motion.div>
              <motion.div
                className="absolute"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.5, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              >
                <Check className="w-10 h-10 text-white" strokeWidth={3} />
              </motion.div>
            </motion.div>

            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <motion.p
                className="font-sans text-lg font-bold text-white"
                initial={{ opacity: 1 }}
                animate={{ opacity: 0 }}
                transition={{ delay: 1.4, duration: 0.2 }}
              >
                Processing purchase…
              </motion.p>
              <motion.p
                className="font-sans text-lg font-bold text-white drop-shadow-[0_2px_10px_rgba(201,40,29,0.8)] absolute left-1/2 -translate-x-1/2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.6, duration: 0.3 }}
              >
                ✓ Book Unlocked!
              </motion.p>
            </motion.div>

            {/* Decorative particles */}
            <div className="absolute pointer-events-none">
              {Array.from({ length: 12 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 rounded-full"
                  style={{
                    background: i % 3 === 0 ? "#DE3124" : i % 3 === 1 ? "#C9281D" : "#FFFFFF",
                  }}
                  initial={{ opacity: 0, x: 0, y: 0, scale: 0 }}
                  animate={{
                    opacity: [0, 1, 0],
                    x: Math.cos((i * Math.PI * 2) / 12) * (80 + Math.random() * 60),
                    y: Math.sin((i * Math.PI * 2) / 12) * (80 + Math.random() * 60),
                    scale: [0, 1.5, 0],
                  }}
                  transition={{
                    delay: 1.6 + i * 0.04,
                    duration: 0.8,
                    ease: "easeOut",
                  }}
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* ════════════════════════════════════════════════════════════════
            READING STATE: Open 3D Book Spread with Realistic Page Rotating Animation
            ════════════════════════════════════════════════════════════════ */}
        {state === "reading" && (
          <motion.div
            className="relative z-[205] w-full max-w-[1020px] mx-4 sm:mx-6"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Header bar above the book */}
            <div className="flex items-center justify-between gap-2 mb-3 sm:mb-4 px-2">
              <div className="flex items-center gap-2">
                <Unlock className="w-3.5 h-3.5 text-[#C9281D]" />
                <span className="font-mono text-[11px] uppercase tracking-widest text-white/80 font-semibold">
                  {edition.title} — Reading Mode
                </span>
              </div>

              {/* Controls (Sound toggle + spread count) */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSoundEnabled((s) => !s)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white text-[11px] font-mono transition-colors"
                  title={soundEnabled ? "Mute page turn sound" : "Enable page turn sound"}
                >
                  {soundEnabled ? (
                    <Volume2 className="w-3.5 h-3.5 text-[#C9281D]" />
                  ) : (
                    <VolumeX className="w-3.5 h-3.5 text-white/40" />
                  )}
                  <span>Flip Sound</span>
                </button>
                <span className="font-mono text-[11px] text-white/50">
                  Spread {currentSpread + 1} of {totalSpreads}
                </span>
              </div>
            </div>

            {/* 3D BOOK STAGE WITH PERSPECTIVE */}
            <div
              className="relative select-none"
              style={{
                perspective: "2200px",
                perspectiveOrigin: "center center",
              }}
            >
              {/* Outer Hardcover Binding Rim & Multi-layer Paper Edge Shadows */}
              <div
                className="relative bg-[#1E1B18] p-2 sm:p-2.5 rounded-xl transition-shadow duration-300"
                style={{
                  boxShadow:
                    "0 35px 80px -15px rgba(0,0,0,0.85), 0 0 0 1px rgba(255,255,255,0.08), inset 0 2px 4px rgba(255,255,255,0.15)",
                }}
              >
                {/* Decorative Bookmark Ribbon hanging from top */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-40 w-4 h-9 bg-gradient-to-b from-[#C9281D] to-[#991B1B] rounded-b-sm shadow-md pointer-events-none flex items-end justify-center pb-1">
                  <div className="w-2 h-2 border-b-2 border-r-2 border-amber-300/60 rotate-45" />
                </div>

                {/* 2-PAGE SPREAD BOOK CONTAINER (3D SCENE) */}
                <div
                  className="relative w-full rounded-lg overflow-hidden bg-[#EDE8DE] flex min-h-[460px] sm:min-h-[520px] md:min-h-[580px]"
                  style={{
                    transformStyle: "preserve-3d",
                    boxShadow:
                      "inset -3px 0 6px rgba(0,0,0,0.15), inset 3px 0 6px rgba(0,0,0,0.15)",
                  }}
                >
                  {/* ──────────────────────────────────────────────────────────
                      LEFT HALF: Underlying Left Page
                      ────────────────────────────────────────────────────────── */}
                  <div className="w-1/2 h-full flex flex-col relative z-10">
                    <PageFace
                      page={
                        isFlipping && flipDirection === "prev"
                          ? prevLeftPage
                          : currentLeftPage
                      }
                      isLeft={true}
                      onClick={turnPrev}
                      canTurn={currentSpread > 0 && !isFlipping}
                    />
                  </div>

                  {/* ──────────────────────────────────────────────────────────
                      CENTER SPINE GUTTER
                      Deep 3D ridge and shadow simulating sewn binding
                      ────────────────────────────────────────────────────────── */}
                  <div
                    className="w-[10px] sm:w-[14px] flex-shrink-0 relative z-30"
                    style={{
                      background:
                        "linear-gradient(to right, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.1) 25%, rgba(255,255,255,0.1) 50%, rgba(0,0,0,0.1) 75%, rgba(0,0,0,0.3) 100%)",
                      boxShadow: "0 0 10px rgba(0,0,0,0.4)",
                    }}
                  >
                    {/* Spine stitching texture dots */}
                    <div className="absolute inset-0 flex flex-col items-center justify-around py-4 opacity-40">
                      {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="w-1 h-1 rounded-full bg-black/50" />
                      ))}
                    </div>
                  </div>

                  {/* ──────────────────────────────────────────────────────────
                      RIGHT HALF: Underlying Right Page
                      ────────────────────────────────────────────────────────── */}
                  <div className="w-1/2 h-full flex flex-col relative z-10">
                    <PageFace
                      page={
                        isFlipping && flipDirection === "next"
                          ? nextRightPage
                          : currentRightPage
                      }
                      isLeft={false}
                      onClick={turnNext}
                      canTurn={currentSpread < totalSpreads - 1 && !isFlipping}
                    />
                  </div>

                  {/* ──────────────────────────────────────────────────────────
                      3D ROTATING PAGE LEAF (FORWARD TURN: Right -> Left)
                      Rotates from 0deg to -180deg around the spine (left origin)
                      ────────────────────────────────────────────────────────── */}
                  {isFlipping && flipDirection === "next" && (
                    <motion.div
                      className="absolute top-0 bottom-0 right-0 w-1/2 z-40"
                      style={{
                        transformOrigin: "left center",
                        transformStyle: "preserve-3d",
                      }}
                      initial={{ rotateY: 0 }}
                      animate={{ rotateY: -180 }}
                      transition={{
                        duration: 0.75,
                        ease: [0.22, 0.61, 0.36, 1],
                      }}
                      onAnimationComplete={handleFlipComplete}
                    >
                      {/* FRONT FACE (Current Right Page while rotating up) */}
                      <div
                        className="absolute inset-0 w-full h-full"
                        style={{
                          backfaceVisibility: "hidden",
                          WebkitBackfaceVisibility: "hidden",
                          transformStyle: "preserve-3d",
                        }}
                      >
                        <PageFace page={currentRightPage} isLeft={false} />
                        {/* Dynamic shadow on front face as it tilts away from light */}
                        <motion.div
                          className="absolute inset-0 pointer-events-none bg-black"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: [0, 0.35, 0.7] }}
                          transition={{ duration: 0.75, ease: "easeInOut" }}
                        />
                      </div>

                      {/* BACK FACE (Next Left Page when flipped over) */}
                      <div
                        className="absolute inset-0 w-full h-full"
                        style={{
                          transform: "rotateY(180deg)",
                          backfaceVisibility: "hidden",
                          WebkitBackfaceVisibility: "hidden",
                          transformStyle: "preserve-3d",
                        }}
                      >
                        <PageFace page={nextLeftPage} isLeft={true} />
                        {/* Dynamic shadow on back face lightening as it lands flat */}
                        <motion.div
                          className="absolute inset-0 pointer-events-none bg-black"
                          initial={{ opacity: 0.7 }}
                          animate={{ opacity: [0.7, 0.35, 0] }}
                          transition={{ duration: 0.75, ease: "easeInOut" }}
                        />
                      </div>
                    </motion.div>
                  )}

                  {/* ──────────────────────────────────────────────────────────
                      3D ROTATING PAGE LEAF (BACKWARD TURN: Left -> Right)
                      Rotates from 0deg to 180deg around the spine (right origin)
                      ────────────────────────────────────────────────────────── */}
                  {isFlipping && flipDirection === "prev" && (
                    <motion.div
                      className="absolute top-0 bottom-0 left-0 w-1/2 z-40"
                      style={{
                        transformOrigin: "right center",
                        transformStyle: "preserve-3d",
                      }}
                      initial={{ rotateY: 0 }}
                      animate={{ rotateY: 180 }}
                      transition={{
                        duration: 0.75,
                        ease: [0.22, 0.61, 0.36, 1],
                      }}
                      onAnimationComplete={handleFlipComplete}
                    >
                      {/* FRONT FACE (Current Left Page while rotating up) */}
                      <div
                        className="absolute inset-0 w-full h-full"
                        style={{
                          backfaceVisibility: "hidden",
                          WebkitBackfaceVisibility: "hidden",
                          transformStyle: "preserve-3d",
                        }}
                      >
                        <PageFace page={currentLeftPage} isLeft={true} />
                        {/* Dynamic shadow on front face as it tilts away from light */}
                        <motion.div
                          className="absolute inset-0 pointer-events-none bg-black"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: [0, 0.35, 0.7] }}
                          transition={{ duration: 0.75, ease: "easeInOut" }}
                        />
                      </div>

                      {/* BACK FACE (Previous Right Page when flipped over) */}
                      <div
                        className="absolute inset-0 w-full h-full"
                        style={{
                          transform: "rotateY(180deg)",
                          backfaceVisibility: "hidden",
                          WebkitBackfaceVisibility: "hidden",
                          transformStyle: "preserve-3d",
                        }}
                      >
                        <PageFace page={prevRightPage} isLeft={false} />
                        {/* Dynamic shadow on back face lightening as it lands flat */}
                        <motion.div
                          className="absolute inset-0 pointer-events-none bg-black"
                          initial={{ opacity: 0.7 }}
                          animate={{ opacity: [0.7, 0.35, 0] }}
                          transition={{ duration: 0.75, ease: "easeInOut" }}
                        />
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Bottom Controls Bar */}
              <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 mt-4 rounded-xl bg-white/10 backdrop-blur-md border border-white/10">
                {/* Previous Button */}
                <button
                  onClick={turnPrev}
                  disabled={currentSpread === 0 || isFlipping}
                  className="flex items-center gap-2 px-4 py-2 rounded-full text-[13px] font-sans font-semibold transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed text-white hover:bg-white/15 active:scale-95"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous Page</span>
                </button>

                {/* Spread Indicator Dots */}
                <div className="flex items-center gap-2">
                  {Array.from({ length: totalSpreads }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        if (isFlipping || i === currentSpread) return;
                        if (i > currentSpread) {
                          turnNext();
                        } else {
                          turnPrev();
                        }
                      }}
                      className={`h-2 rounded-full transition-all cursor-pointer ${
                        i === currentSpread
                          ? "w-6 bg-gradient-to-r from-[#DE3124] to-[#C9281D] shadow-[0_0_10px_rgba(201,40,29,0.55)]"
                          : "w-2 bg-white/30 hover:bg-white/60"
                      }`}
                      aria-label={`Go to spread ${i + 1}`}
                    />
                  ))}
                </div>

                {/* Next Button */}
                <button
                  onClick={turnNext}
                  disabled={currentSpread === totalSpreads - 1 || isFlipping}
                  className="flex items-center gap-2 px-4 py-2 rounded-full text-[13px] font-sans font-semibold transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed text-white hover:bg-white/15 active:scale-95"
                >
                  <span>Next Page</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Back to Shop hint */}
            <p className="text-center mt-3 font-sans text-[12px] text-white/50 flex items-center justify-center gap-2">
              <span>Use <kbd className="px-1.5 py-0.5 rounded bg-white/15 text-white font-mono text-[10px]">←</kbd> <kbd className="px-1.5 py-0.5 rounded bg-white/15 text-white font-mono text-[10px]">→</kbd> or <kbd className="px-1.5 py-0.5 rounded bg-white/15 text-white font-mono text-[10px]">Space</kbd> to flip pages</span>
              <span>·</span>
              <span>Press <kbd className="px-1.5 py-0.5 rounded bg-white/15 text-white font-mono text-[10px]">Esc</kbd> to close</span>
            </p>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}


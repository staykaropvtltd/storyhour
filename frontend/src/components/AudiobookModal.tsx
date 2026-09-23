"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useLibraryCart } from "@/context/LibraryCartContext";
import {
  X,
  Play,
  Pause,
  Volume2,
  VolumeX,
  ShoppingBag,
  Disc,
  Headphones,
  Globe,
  Clock,
  User,
  Check,
  Loader2,
  Lock,
  Unlock,
  SkipForward,
  SkipBack,
  Sparkles,
} from "lucide-react";

export interface AudiobookTrack {
  id: number;
  title: string;
  duration: string;
  narrator?: string;
}

export interface Audiobook {
  id: string;
  title: string;
  nativeTitle?: string;
  subtitle: string;
  narrator: string;
  storyteller: string;
  language: "English" | "Hindi" | "Telugu" | "Multilingual";
  duration: string;
  chaptersCount: number;
  price: number;
  cdArtwork: string;
  category: string;
  year: string;
  season: string;
  badge?: string;
  description: string;
  culturalNote?: string;
  audioPreviewUrl?: string;
  accentColor?: string;
  tracks: AudiobookTrack[];
}

interface AudiobookModalProps {
  audiobook: Audiobook;
  onClose: () => void;
  onAddToCart?: (audiobook: Audiobook) => void;
}

export default function AudiobookModal({
  audiobook,
  onClose,
  onAddToCart,
}: AudiobookModalProps) {
  const { isBookUnlocked, addToCart, unlockBooks } = useLibraryCart();
  const router = useRouter();
  const isInitiallyUnlocked = isBookUnlocked(audiobook.id);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isUnlocked, setIsUnlocked] = useState(isInitiallyUnlocked);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [playbackProgress, setPlaybackProgress] = useState(18); // Simulated % progress
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    if (isBookUnlocked(audiobook.id)) {
      setIsUnlocked(true);
    }
  }, [audiobook.id, isBookUnlocked]);

  // Keyboard navigation (Esc to close, Space to Play/Pause)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === " " && e.target === document.body) {
        e.preventDefault();
        setIsPlaying((p) => !p);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // Simulated audio playback progress increment
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setPlaybackProgress((prev) => (prev >= 100 ? 0 : prev + 0.5));
      }, 300);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  const handleUnlock = () => {
    setIsUnlocking(true);
    setTimeout(() => {
      unlockBooks([audiobook.id]);
      setIsUnlocking(false);
      setIsUnlocked(true);
      setIsPlaying(true);
    }, 2000);
  };

  const currentTrack = audiobook.tracks[currentTrackIndex] || {
    id: 1,
    title: "Chapter 1: The Divine Invocation",
    duration: "4:32",
  };

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6"
        onClick={onClose}
      >
        {/* Backdrop blur */}
        <motion.div
          className="absolute inset-0 bg-[#070605]/85 backdrop-blur-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />

        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="Close audiobook player"
          className="absolute top-5 right-5 z-[220] w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 flex items-center justify-center text-white/80 hover:text-white transition-all cursor-pointer backdrop-blur-md shadow-lg"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Container */}
        <motion.div
          className="relative z-10 w-full max-w-[1020px] max-h-[92vh] bg-[#FAF8F3] rounded-2xl shadow-[0_40px_100px_-20px_rgba(0,0,0,0.7)] overflow-hidden flex flex-col lg:flex-row border border-white/15"
          initial={{ scale: 0.9, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 30 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* ═══════════════════════════════════════════════════════════
              LEFT: 3D CD DISC & ACRYLIC JEWEL CASE STAGE
              ═══════════════════════════════════════════════════════════ */}
          <div className="relative w-full lg:w-[440px] bg-gradient-to-br from-[#0F0E0C] via-[#1A1816] to-[#24211D] p-8 sm:p-10 flex flex-col items-center justify-center flex-shrink-0 overflow-hidden select-none">
            {/* Ambient warm spotlight glow */}
            <div className="absolute w-[300px] h-[300px] rounded-full bg-[#C9281D]/20 blur-[90px] pointer-events-none" />

            {/* 3D CD Disc with Vinyl/Polycarbonate Material */}
            <div
              className="relative w-[230px] sm:w-[270px] aspect-square flex items-center justify-center"
              style={{ perspective: "1000px" }}
            >
              {/* Spinning CD Disc */}
              <div
                className={`relative w-full h-full rounded-full shadow-[0_25px_50px_rgba(0,0,0,0.6),0_0_0_1px_rgba(255,255,255,0.15)] overflow-hidden flex items-center justify-center transition-transform duration-700 ${
                  isPlaying ? "animate-spin-slow" : ""
                }`}
                style={{
                  animationDuration: isPlaying ? "8s" : "0s",
                  animationTimingFunction: "linear",
                  animationIterationCount: "infinite",
                }}
              >
                {/* Circular CD Printed Artwork */}
                <Image
                  src={audiobook.cdArtwork}
                  alt={audiobook.title}
                  fill
                  priority
                  className="object-cover rounded-full"
                  sizes="270px"
                />

                {/* Holographic Iridescent CD Sheen (Rainbow reflection) */}
                <div
                  className="absolute inset-0 rounded-full pointer-events-none opacity-45 mix-blend-screen"
                  style={{
                    background:
                      "conic-gradient(from 45deg, rgba(255,255,255,0.5) 0deg, rgba(255,100,100,0.3) 60deg, rgba(255,230,100,0.4) 120deg, rgba(100,255,150,0.3) 180deg, rgba(100,200,255,0.4) 240deg, rgba(220,100,255,0.3) 300deg, rgba(255,255,255,0.5) 360deg)",
                  }}
                />

                {/* Microgroove Rings Texture */}
                <div
                  className="absolute inset-0 rounded-full pointer-events-none opacity-30"
                  style={{
                    backgroundImage:
                      "repeating-radial-gradient(circle, transparent, transparent 3px, rgba(0,0,0,0.15) 4px, rgba(255,255,255,0.08) 5px)",
                  }}
                />

                {/* Aluminum Data Ring (Mirror Band) */}
                <div className="absolute w-[110px] sm:w-[130px] aspect-square rounded-full border border-white/30 bg-gradient-to-tr from-white/20 via-black/20 to-white/30 backdrop-blur-[1px] shadow-inner pointer-events-none" />

                {/* Clear Acrylic Center Hub */}
                <div className="absolute w-[65px] sm:w-[76px] aspect-square rounded-full border-2 border-white/60 bg-gradient-to-br from-white/40 via-white/10 to-transparent shadow-md flex items-center justify-center pointer-events-none">
                  {/* Spindle Hole */}
                  <div className="w-[28px] sm:w-[32px] aspect-square rounded-full bg-[#141210] border border-white/20 shadow-inner flex items-center justify-center">
                    <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
                  </div>
                </div>

                {/* Outer Acrylic Rim */}
                <div className="absolute inset-0 rounded-full border-2 border-white/30 pointer-events-none" />
              </div>
            </div>

            {/* Disc Status & Audio Format Badge */}
            <div className="mt-7 flex items-center gap-2 z-10">
              <span className="px-3 py-1 rounded-full bg-gradient-to-r from-[#DE3124] to-[#C9281D] text-white text-[10px] font-mono font-bold uppercase tracking-wider shadow-[0_4px_12px_rgba(201,40,29,0.35)] flex items-center gap-1.5">
                <Disc className="w-3 h-3 animate-spin-slow" />
                {audiobook.duration} · High-Fidelity Audio
              </span>
              <span className="px-2.5 py-1 rounded-full bg-white/15 backdrop-blur-sm text-white text-[10px] font-mono">
                {audiobook.language}
              </span>
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════════════
              RIGHT: AUDIOBOOK DETAILS, LIVE PLAYER & CHAPTERS
              ═══════════════════════════════════════════════════════════ */}
          <div className="p-6 sm:p-9 flex-1 overflow-y-auto space-y-5 flex flex-col justify-between">
            <div className="space-y-4">
              {/* Header Info */}
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] uppercase tracking-widest text-[#C9281D] font-bold">
                    StoryHour Studio Audiobook
                  </span>
                  {isUnlocked && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 border border-emerald-500/20 text-[10px] font-mono font-bold">
                      <Unlock className="w-3 h-3" /> Unlocked Edition
                    </span>
                  )}
                </div>
                <h2 className="mt-1 font-serif text-[26px] sm:text-[32px] font-normal text-[#0F0F0F] leading-[1.08] tracking-[-0.025em]">
                  {audiobook.title}
                </h2>
                {audiobook.nativeTitle && (
                  <p className="mt-0.5 font-serif text-[17px] text-[#5A5A5A] italic">
                    {audiobook.nativeTitle}
                  </p>
                )}
                <p className="mt-1 font-sans text-[13.5px] text-[#5A5A5A]">
                  {audiobook.subtitle}
                </p>
              </div>

              {/* Metadata Badges */}
              <div className="flex flex-wrap gap-x-4 gap-y-2 font-mono text-[11px] text-[#5A5A5A] py-2.5 border-y border-[#E7E7E7]">
                <span className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-[#C9281D]" />
                  {audiobook.narrator}
                </span>
                <span className="flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-[#C9281D]" />
                  {audiobook.language}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#C9281D]" />
                  {audiobook.duration} ({audiobook.chaptersCount} Chapters)
                </span>
              </div>

              {/* Synopsis */}
              <p className="font-sans text-[13.5px] text-[#2F2F2F] leading-[1.6]">
                {audiobook.description}
              </p>

              {/* ═══════════════════════════════════════════════════════════
                  INTERACTIVE AUDIO PLAYER CONSOLE
                  ═══════════════════════════════════════════════════════════ */}
              <div className="p-4 sm:p-5 rounded-2xl bg-[#0E1638]/[0.03] border border-[#0E1638]/10 shadow-sm space-y-3">
                {/* Now Playing Header */}
                <div className="flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="font-sans text-[11px] font-mono uppercase tracking-wider text-[#C9281D] font-bold">
                      {isUnlocked ? "Full Audiobook Playback" : "Audio Preview Sample"}
                    </p>
                    <p className="font-sans font-semibold text-[13.5px] text-[#0F0F0F] truncate">
                      {currentTrack.title}
                    </p>
                  </div>

                  <button
                    onClick={() => setIsMuted((m) => !m)}
                    className="p-1.5 rounded-full hover:bg-black/5 text-[#5A5A5A] transition-colors"
                    title={isMuted ? "Unmute" : "Mute"}
                  >
                    {isMuted ? (
                      <VolumeX className="w-4 h-4 text-rose-500" />
                    ) : (
                      <Volume2 className="w-4 h-4 text-[#C9281D]" />
                    )}
                  </button>
                </div>

                {/* Progress Scrub Bar */}
                <div className="space-y-1">
                  <div className="relative w-full h-2 rounded-full bg-black/10 overflow-hidden cursor-pointer">
                    <div
                      className="h-full bg-gradient-to-r from-[#DE3124] via-[#C9281D] to-[#991B1B] rounded-full transition-all duration-300"
                      style={{ width: `${playbackProgress}%` }}
                    />
                  </div>
                  <div className="flex justify-between font-mono text-[10px] text-[#7A7A7A]">
                    <span>
                      {Math.floor((playbackProgress * 2.7) / 60)}:
                      {String(Math.floor((playbackProgress * 2.7) % 60)).padStart(2, "0")}
                    </span>
                    <span>{currentTrack.duration}</span>
                  </div>
                </div>

                {/* Audio Controls */}
                <div className="flex items-center justify-center gap-4 pt-1">
                  <button
                    onClick={() =>
                      setCurrentTrackIndex((idx) =>
                        idx > 0 ? idx - 1 : audiobook.tracks.length - 1
                      )
                    }
                    className="p-2 rounded-full hover:bg-black/5 text-[#5A5A5A] hover:text-[#0F0F0F] transition-colors cursor-pointer"
                    aria-label="Previous track"
                  >
                    <SkipBack className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setIsPlaying((p) => !p)}
                    className="w-12 h-12 rounded-full bg-gradient-to-br from-[#DE3124] via-[#C9281D] to-[#991B1B] hover:from-[#EA3A2D] hover:via-[#D6281D] hover:to-[#A81F19] active:scale-95 text-white flex items-center justify-center shadow-[0_8px_20px_rgba(201,40,29,0.4)] hover:shadow-[0_10px_24px_rgba(201,40,29,0.55)] transition-all cursor-pointer"
                    aria-label={isPlaying ? "Pause" : "Play"}
                  >
                    {isPlaying ? (
                      <Pause className="w-5 h-5 fill-white" />
                    ) : (
                      <Play className="w-5 h-5 fill-white ml-0.5" />
                    )}
                  </button>

                  <button
                    onClick={() =>
                      setCurrentTrackIndex((idx) => (idx + 1) % audiobook.tracks.length)
                    }
                    className="p-2 rounded-full hover:bg-black/5 text-[#5A5A5A] hover:text-[#0F0F0F] transition-colors cursor-pointer"
                    aria-label="Next track"
                  >
                    <SkipForward className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* ═══════════════════════════════════════════════════════════
                  CHAPTERS / TRACKLIST
                  ═══════════════════════════════════════════════════════════ */}
              <div>
                <p className="font-mono text-[11px] uppercase tracking-wider text-[#5A5A5A] font-semibold mb-2">
                  Chapters &amp; Story Tracks ({audiobook.tracks.length})
                </p>
                <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
                  {audiobook.tracks.map((track, i) => {
                    const isSelectedTrack = i === currentTrackIndex;
                    return (
                      <button
                        key={track.id}
                        onClick={() => {
                          setCurrentTrackIndex(i);
                          setIsPlaying(true);
                        }}
                        className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left text-[12.5px] transition-all cursor-pointer ${
                          isSelectedTrack
                            ? "bg-[#C9281D]/10 text-[#0F0F0F] font-semibold border border-[#C9281D]/25"
                            : "hover:bg-black/5 text-[#5A5A5A] font-medium"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <span
                            className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono ${
                              isSelectedTrack
                                ? "bg-gradient-to-br from-[#DE3124] to-[#C9281D] text-white"
                                : "bg-black/10 text-[#5A5A5A]"
                            }`}
                          >
                            {isSelectedTrack && isPlaying ? "▶" : i + 1}
                          </span>
                          <span className="truncate">{track.title}</span>
                        </div>
                        <span className="font-mono text-[11px] text-[#8A8A8A] flex-shrink-0 ml-2">
                          {track.duration}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* ═══════════════════════════════════════════════════════════
                PURCHASE & UNLOCK ROW
                ═══════════════════════════════════════════════════════════ */}
            <div className="flex items-center justify-between pt-4 mt-2 border-t border-[#E7E7E7]">
              <div>
                <span className="font-mono text-[11px] text-[#5A5A5A] block">
                  Complete Digital Audiobook
                </span>
                <span className="font-serif text-[24px] font-bold text-[#0F0F0F]">
                  ${audiobook.price}
                </span>
              </div>

              <div className="flex items-center gap-2.5">
                {!isUnlocked ? (
                  <>
                    <button
                      onClick={() => {
                        addToCart({
                          id: audiobook.id,
                          title: audiobook.title,
                          nativeTitle: audiobook.nativeTitle,
                          subtitle: audiobook.subtitle,
                          authorOrNarrator: audiobook.narrator,
                          coverImage: audiobook.cdArtwork,
                          price: audiobook.price,
                          format: "Audiobook Edition",
                          language: audiobook.language,
                          type: "audiobook",
                        });
                        if (onAddToCart) onAddToCart(audiobook);
                      }}
                      className="px-4 py-2.5 rounded-full bg-white hover:bg-gray-50 text-[#0F0F0F] font-sans text-[13px] font-bold border border-black/15 transition-all shadow-sm hover:shadow flex items-center gap-2 cursor-pointer"
                    >
                      <ShoppingBag className="w-4 h-4 text-[#C9281D]" />
                      Add to Cart
                    </button>
                    <button
                      onClick={() => {
                        addToCart({
                          id: audiobook.id,
                          title: audiobook.title,
                          nativeTitle: audiobook.nativeTitle,
                          subtitle: audiobook.subtitle,
                          authorOrNarrator: audiobook.narrator,
                          coverImage: audiobook.cdArtwork,
                          price: audiobook.price,
                          format: "Audiobook Edition",
                          language: audiobook.language,
                          type: "audiobook",
                        });
                        onClose();
                        router.push("/checkout");
                      }}
                      className="px-5 py-2.5 rounded-full bg-gradient-to-r from-[#DE3124] via-[#C9281D] to-[#991B1B] hover:from-[#EA3A2D] hover:via-[#D12E23] hover:to-[#A81F19] text-white font-sans text-[13px] font-bold transition-all shadow-[0_4px_14px_rgba(201,40,29,0.35)] hover:shadow-[0_6px_20px_rgba(201,40,29,0.5)] flex items-center gap-1.5 cursor-pointer"
                    >
                      Buy Now
                    </button>
                  </>
                ) : (
                  <div className="px-5 py-2.5 rounded-full bg-emerald-600 text-white font-sans text-[13px] font-semibold flex items-center gap-2 shadow-md">
                    <Check className="w-4 h-4" strokeWidth={3} />
                    Audiobook Unlocked &amp; Ready
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

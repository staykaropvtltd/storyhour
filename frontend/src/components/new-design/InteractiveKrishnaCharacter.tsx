"use client";

import React, { useState } from "react";
import Image from "next/image";

interface InteractiveKrishnaProps {
  isPlayingAudio?: boolean;
  onPlaySample?: () => void;
  className?: string;
}

export default function InteractiveKrishnaCharacter({
  isPlayingAudio = false,
  onPlaySample,
  className = "",
}: InteractiveKrishnaProps) {
  const [showSpeechBubble, setShowSpeechBubble] = useState(false);
  const [notesActive, setNotesActive] = useState(false);

  const handleClick = () => {
    // Show speech bubble
    setShowSpeechBubble(true);
    setTimeout(() => setShowSpeechBubble(false), 4000);

    // Trigger floating musical notes
    setNotesActive(true);
    setTimeout(() => setNotesActive(false), 5000);

    // Play sample audio if handler provided
    if (onPlaySample) {
      onPlaySample();
    }
  };

  return (
    <div
      className={`relative select-none cursor-pointer group ${className}`}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      aria-label="Interactive Lord Krishna Storyteller Puppet Doll"
    >
      {/* ─── 1. INTERACTIVE SPEECH BUBBLE ─── */}
      {showSpeechBubble && (
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 z-40 bg-white/95 backdrop-blur-sm text-gray-900 px-4 py-2.5 rounded-2xl shadow-[0_12px_28px_rgba(0,0,0,0.18)] border border-[#C9281D]/20 whitespace-nowrap animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-extrabold text-[#1a1a1a]">
            <span className="text-base">🙏</span>
            <span>Namaste! Welcome to StoryHour!</span>
          </div>
          {/* Bubble Pointer Tail */}
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-white" />
        </div>
      )}

      {/* ─── 2. FLOATING MUSICAL NOTES (Active on click or while audio is playing) ─── */}
      {(notesActive || isPlayingAudio) && (
        <div className="absolute -top-12 left-1/4 pointer-events-none z-30 flex items-center gap-3">
          <span
            className="text-2xl text-[#C9281D] font-bold drop-shadow-md animate-bounce"
            style={{ animationDuration: "1.2s" }}
          >
            ♪
          </span>
          <span
            className="text-3xl text-rose-400 font-bold drop-shadow-md animate-pulse delay-150"
            style={{ animationDuration: "1.6s" }}
          >
            ♫
          </span>
          <span
            className="text-2xl text-sky-400 font-bold drop-shadow-md animate-bounce delay-300"
            style={{ animationDuration: "1.4s" }}
          >
            ♩
          </span>
          <span
            className="text-3xl text-[#DE3124] font-bold drop-shadow-md animate-pulse delay-200"
            style={{ animationDuration: "1.8s" }}
          >
            ♬
          </span>
        </div>
      )}

      {/* ─── 3. HANDCRAFTED CEREMONIAL PUPPET DOLL WITH SMOOTH IDLE MOTION ─── */}
      <div
        className="relative transition-transform duration-300 ease-out group-hover:scale-[1.04] group-active:scale-[0.98]"
        style={{
          animation: "puppetFloat 3.8s ease-in-out infinite",
        }}
      >
        {/* Gentle Celestial Aura Glow behind Puppet */}
        <div
          className="absolute inset-0 -inset-x-8 -top-8 rounded-full bg-gradient-to-t from-[#C9281D]/15 via-sky-400/15 to-transparent blur-2xl pointer-events-none -z-10"
          style={{
            animation: "auraPulse 4s ease-in-out infinite alternate",
          }}
        />

        {/* Puppet Character Image Matching Other Ceremonial Dolls */}
        <div className="relative aspect-[476/1112] w-full">
          <Image
            src="/images/characters/character-krishna.png"
            alt="Lord Krishna Ceremonial Storyteller Puppet Doll"
            fill
            sizes="(max-width: 640px) 120px, (max-width: 768px) 150px, (max-width: 1024px) 175px, (max-width: 1280px) 195px, 220px"
            className="object-contain object-bottom drop-shadow-[0_22px_36px_rgba(0,0,0,0.28)]"
            priority
          />
        </div>
      </div>

      {/* Embedded CSS for smooth micro-animations */}
      <style jsx>{`
        @keyframes puppetFloat {
          0% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-9px) rotate(0.8deg);
          }
          100% {
            transform: translateY(0px) rotate(0deg);
          }
        }
        @keyframes auraPulse {
          0% {
            opacity: 0.25;
            transform: scale(0.95);
          }
          100% {
            opacity: 0.55;
            transform: scale(1.05);
          }
        }
      `}</style>
    </div>
  );
}

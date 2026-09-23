"use client";

import React from "react";

/**
 * Handcrafted Traditional Indian Storybook Illustrations
 * Designed to evoke authentic children's publishing, illuminated manuscripts,
 * and human-drawn Indian folk and classical miniature traditions.
 */

// 1. Hand-Drawn Traditional Peacock Feather (Mayur Pankh)
export function HandcraftedPeacockFeather({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 180"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Quill Stem with natural hand-drawn slight curve */}
      <path
        d="M50 175 C 50 140, 49 90, 50 25"
        stroke="#7A5330"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      
      {/* Lower subtle barbs */}
      <g stroke="#5B6F43" strokeWidth="1.2" strokeLinecap="round" opacity="0.75">
        <path d="M50 135 C 38 128, 25 125, 18 128" />
        <path d="M50 130 C 62 122, 75 120, 82 124" />
        <path d="M50 120 C 35 110, 20 108, 12 114" />
        <path d="M50 115 C 65 106, 80 105, 88 110" />
        <path d="M50 105 C 32 94, 18 90, 8 98" />
        <path d="M50 100 C 68 90, 82 88, 92 94" />
        <path d="M50 90 C 30 78, 15 72, 6 80" />
        <path d="M50 85 C 70 74, 85 72, 94 78" />
      </g>

      {/* Mid-feather golden barbs */}
      <g stroke="#BFA054" strokeWidth="1.2" strokeLinecap="round" opacity="0.85">
        <path d="M50 78 C 32 66, 18 58, 10 66" />
        <path d="M50 73 C 68 62, 82 58, 90 64" />
        <path d="M50 68 C 30 54, 18 46, 14 52" />
        <path d="M50 63 C 70 50, 82 46, 86 52" />
        <path d="M50 58 C 32 44, 22 36, 18 42" />
        <path d="M50 53 C 68 40, 78 36, 82 42" />
      </g>

      {/* Outer Peacock Eye Aura (Muted Gold Wash & Delicate Outline) */}
      <ellipse
        cx="50"
        cy="40"
        rx="34"
        ry="28"
        fill="#E8C97A"
        fillOpacity="0.25"
        stroke="#B58D3D"
        strokeWidth="1.5"
        strokeDasharray="4 2"
      />

      {/* Second Tier: Turquoise / Verdigris Feather Ring */}
      <ellipse
        cx="50"
        cy="40"
        rx="26"
        ry="21"
        fill="#2A7B88"
        fillOpacity="0.3"
        stroke="#246A75"
        strokeWidth="1.6"
      />

      {/* Third Tier: Deep Midnight Royal Peacock Blue */}
      <ellipse
        cx="50"
        cy="41"
        rx="18"
        ry="14"
        fill="#1C3852"
        fillOpacity="0.85"
        stroke="#152B3E"
        strokeWidth="1.2"
      />

      {/* Inner Heart Eye: Luminous Deep Emerald & Gold Dot */}
      <ellipse
        cx="50"
        cy="41"
        rx="10"
        ry="8"
        fill="#1A6855"
      />
      <circle
        cx="50"
        cy="40"
        r="4.5"
        fill="#C9A048"
      />
      <circle
        cx="49"
        cy="39"
        r="2"
        fill="#F4E3A1"
      />

      {/* Topmost radiating delicate barbs */}
      <g stroke="#7A9A5B" strokeWidth="1" strokeLinecap="round" opacity="0.7">
        <path d="M50 25 C 44 14, 35 6, 26 2" />
        <path d="M50 25 C 48 12, 42 4, 38 0" />
        <path d="M50 25 C 50 10, 50 2, 50 0" />
        <path d="M50 25 C 52 12, 58 4, 62 0" />
        <path d="M50 25 C 56 14, 65 6, 74 2" />
      </g>
    </svg>
  );
}

// 2. Handcrafted Traditional Palm-Leaf Manuscript (Tala-Patra / Grantha Scroll)
export function HandcraftedPalmManuscript({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 140 70"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Bottom Leaf Shadow */}
      <path
        d="M 12 50 C 14 55, 126 55, 128 50 C 126 45, 14 45, 12 50 Z"
        fill="#2B1D12"
        fillOpacity="0.08"
      />

      {/* Layer 3: Under Palm Leaf */}
      <path
        d="M 14 36 Q 70 34 126 37 Q 128 47 124 49 Q 70 47 16 48 Q 12 42 14 36 Z"
        fill="#D8C39F"
        stroke="#8C6E4A"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />

      {/* Layer 2: Mid Palm Leaf */}
      <path
        d="M 10 26 Q 70 24 130 27 Q 132 38 128 40 Q 70 38 12 39 Q 8 32 10 26 Z"
        fill="#E8D5B5"
        stroke="#9E7D55"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />

      {/* Layer 1: Top Prime Palm Leaf */}
      <path
        d="M 6 15 Q 70 13 134 16 Q 136 28 132 30 Q 70 28 8 29 Q 4 21 6 15 Z"
        fill="#F4E6CC"
        stroke="#8C6E4A"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />

      {/* Inscribed Ancient Grantha Script Ruling Lines */}
      <g stroke="#7A5E44" strokeWidth="0.8" strokeLinecap="round" opacity="0.65">
        {/* Left column text lines */}
        <line x1="14" y1="19" x2="52" y2="19.5" strokeDasharray="3 2 4 1.5" />
        <line x1="14" y1="23" x2="50" y2="23.5" strokeDasharray="4 1.5 2 2" />
        <line x1="16" y1="27" x2="48" y2="27.5" strokeDasharray="2 2 4 2" />

        {/* Right column text lines */}
        <line x1="88" y1="19.5" x2="124" y2="20" strokeDasharray="4 2 2 1.5" />
        <line x1="90" y1="23.5" x2="126" y2="24" strokeDasharray="2 1.5 4 2" />
        <line x1="92" y1="27.5" x2="122" y2="28" strokeDasharray="3 2 3 2" />
      </g>

      {/* Binding Cord Holes (Traditional Cord Eyelets) */}
      <circle cx="60" cy="22" r="2.2" fill="#FAF5ED" stroke="#7A5E44" strokeWidth="1" />
      <circle cx="80" cy="22" r="2.2" fill="#FAF5ED" stroke="#7A5E44" strokeWidth="1" />

      {/* Sacred Crimson Silk Binding Cord & Brass Bead */}
      <path
        d="M 70 11 C 67 19, 73 25, 70 33 C 67 42, 62 48, 55 58"
        stroke="#9B2C1C"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M 70 33 C 74 38, 76 46, 78 54"
        stroke="#9B2C1C"
        strokeWidth="1.4"
        strokeLinecap="round"
      />

      {/* Traditional Brass Cord Bead */}
      <circle cx="70" cy="33" r="3.2" fill="#C5A048" stroke="#856422" strokeWidth="0.8" />
      <circle cx="69" cy="32" r="1" fill="#FDF4D4" />
    </svg>
  );
}

// 3. Handcrafted Terracotta Diya with Sacred Living Flame
export function HandcraftedTerracottaDiya({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Soft Ground Shadow of Diya */}
      <ellipse
        cx="40"
        cy="72"
        rx="28"
        ry="6"
        fill="#2B1D12"
        fillOpacity="0.12"
      />

      {/* Traditional Peepal / Lotus Leaf Base */}
      <path
        d="M 18 69 C 28 66, 52 66, 62 69 C 55 74, 25 74, 18 69 Z"
        fill="#4D633C"
        fillOpacity="0.45"
        stroke="#3F5230"
        strokeWidth="1"
      />

      {/* Earthen Terracotta Diya Bowl (Mitti ka Diya) */}
      <path
        d="M 16 54 C 18 67, 62 67, 64 54 C 64 50, 60 48, 54 49 C 45 51, 35 51, 26 49 C 20 48, 16 50, 16 54 Z"
        fill="#A64B2A"
        stroke="#7A3218"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />

      {/* Hand-crimped Diya rim highlights */}
      <path
        d="M 20 52 C 28 54, 52 54, 60 52"
        stroke="#C96843"
        strokeWidth="1.2"
        strokeLinecap="round"
      />

      {/* Golden Sesame Oil Well */}
      <ellipse
        cx="40"
        cy="51"
        rx="16"
        ry="4.5"
        fill="#DDA136"
        fillOpacity="0.75"
      />

      {/* Diya Spout Lip pointing slightly right */}
      <path
        d="M 52 50 C 58 47, 64 43, 62 39 C 57 41, 52 46, 50 49"
        fill="#8E391C"
        stroke="#7A3218"
        strokeWidth="1"
      />

      {/* Sacred Flame Aura Glow */}
      <circle
        cx="58"
        cy="32"
        r="16"
        fill="#F6D04D"
        fillOpacity="0.18"
      />

      {/* Flame Body Outer (Warm Saffron Gold) */}
      <path
        d="M 58 42 C 63 39, 67 33, 63 24 C 60 17, 57 14, 57 11 C 56 15, 54 20, 52 27 C 50 33, 53 40, 58 42 Z"
        fill="#E87C22"
      />

      {/* Flame Body Inner (Radiant Warm Yellow) */}
      <path
        d="M 58 41 C 61 38, 64 34, 61 27 C 59 22, 57 19, 57 16 C 56 19, 55 23, 54 28 C 53 33, 55 39, 58 41 Z"
        fill="#F7D358"
      />

      {/* White-Hot Flame Core */}
      <path
        d="M 58 39 C 59.5 37, 61 34, 59.5 30 C 58.5 27, 57.5 25, 57.5 23 C 57 25, 56.5 27, 56 30 C 55 34, 56.5 37, 58 39 Z"
        fill="#FFFDF4"
      />

      {/* Charred cotton wick tip */}
      <path
        d="M 55 45 C 56 42, 57 40, 57 37"
        stroke="#3A1C10"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

// 4. Handcrafted Indian Manuscript Foliate Vine & Champak Motif
export function HandcraftedBotanicalVine({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 90 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Sinuous hand-drawn botanical vine stem */}
      <path
        d="M 15 95 C 22 80, 24 65, 34 50 C 44 35, 54 25, 68 15 C 75 10, 82 8, 85 5"
        stroke="#7A5E3F"
        strokeWidth="1.5"
        strokeLinecap="round"
      />

      {/* Delicate Leaf 1 (Lower Left) */}
      <path
        d="M 26 70 C 18 67, 10 68, 5 74 C 9 80, 18 80, 24 73"
        fill="#556E42"
        fillOpacity="0.25"
        stroke="#475C37"
        strokeWidth="1.2"
      />

      {/* Delicate Leaf 2 (Mid Right) */}
      <path
        d="M 36 48 C 45 44, 52 46, 56 40 C 50 36, 42 38, 35 45"
        fill="#556E42"
        fillOpacity="0.25"
        stroke="#475C37"
        strokeWidth="1.2"
      />

      {/* Traditional Indian Champak / Lotus Bud at Stem Terminal */}
      <path
        d="M 68 15 C 70 8, 76 2, 82 2 C 82 8, 76 14, 68 15 Z"
        fill="#A6382A"
        fillOpacity="0.3"
        stroke="#87291E"
        strokeWidth="1.2"
      />
      <path
        d="M 72 17 C 76 12, 83 9, 87 11 C 86 16, 80 20, 72 17 Z"
        fill="#C9943B"
        fillOpacity="0.35"
        stroke="#9E6E24"
        strokeWidth="1.2"
      />

      {/* Traditional Ornamental Accent Dot */}
      <circle cx="82" cy="2" r="1.8" fill="#C5A048" />
    </svg>
  );
}

// 5. Traditional Manuscript Corner Bracket (Inspired by Ancient Indian Palm-leaf Folios)
export function ManuscriptCornerOrnament({
  className = "",
  position = "top-left",
}: {
  className?: string;
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
}) {
  const rotation =
    position === "top-right"
      ? "rotate-90"
      : position === "bottom-right"
      ? "rotate-180"
      : position === "bottom-left"
      ? "-rotate-90"
      : "";

  return (
    <div className={`${rotation} ${className}`} aria-hidden="true">
      <svg
        width="44"
        height="44"
        viewBox="0 0 44 44"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Outer Corner Rule */}
        <path
          d="M 4 36 L 4 8 C 4 5.8 5.8 4 8 4 L 36 4"
          stroke="#9E7D55"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeOpacity="0.45"
        />

        {/* Inner Corner Accent Curve */}
        <path
          d="M 9 26 L 9 12 C 9 10.3 10.3 9 12 9 L 26 9"
          stroke="#C5A048"
          strokeWidth="1"
          strokeLinecap="round"
          strokeOpacity="0.55"
        />

        {/* Small Traditional Floral Finial */}
        <circle cx="4" cy="38" r="1.5" fill="#8C6E4A" fillOpacity="0.6" />
        <circle cx="38" cy="4" r="1.5" fill="#8C6E4A" fillOpacity="0.6" />
        <circle cx="12" cy="12" r="1.8" fill="#C5A048" fillOpacity="0.75" />
      </svg>
    </div>
  );
}

// 6. Traditional Handcrafted Bell Illustration (For Bedtime / Audio Raga)
export function HandcraftedTempleBell({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 60 70"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Suspension loop */}
      <circle cx="30" cy="10" r="6" stroke="#9E7D55" strokeWidth="1.6" />
      
      {/* Bell Crown */}
      <path
        d="M 23 15 Q 30 14 37 15 L 36 22 L 24 22 Z"
        fill="#C9A048"
        fillOpacity="0.4"
        stroke="#8C6E4A"
        strokeWidth="1.2"
      />

      {/* Bell Dome */}
      <path
        d="M 24 22 C 24 35, 14 46, 10 52 C 20 54, 40 54, 50 52 C 46 46, 36 35, 36 22 Z"
        fill="#E8C97A"
        fillOpacity="0.25"
        stroke="#8C6E4A"
        strokeWidth="1.5"
      />

      {/* Scalloped Bell Rim */}
      <path
        d="M 10 52 Q 30 57 50 52"
        stroke="#7A5330"
        strokeWidth="1.8"
        strokeLinecap="round"
      />

      {/* Clapper */}
      <circle cx="30" cy="58" r="3.5" fill="#7A5330" />
    </svg>
  );
}

// 7. Handcrafted Crescent Moon & Star Sprig (For Bedtime Rituals)
export function HandcraftedMoonStar({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 70 70"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Golden Crescent Moon */}
      <path
        d="M 38 12 C 48 18, 52 32, 46 44 C 40 54, 28 58, 18 54 C 32 54, 42 42, 40 28 C 39 21, 35 15, 38 12 Z"
        fill="#E8C97A"
        fillOpacity="0.5"
        stroke="#B58D3D"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />

      {/* Small Lullaby Star 1 */}
      <g stroke="#9E7D55" strokeWidth="1" strokeLinecap="round" opacity="0.75">
        <line x1="20" y1="20" x2="20" y2="28" />
        <line x1="16" y1="24" x2="24" y2="24" />
        <circle cx="20" cy="24" r="1.5" fill="#C5A048" />
      </g>

      {/* Small Lullaby Star 2 */}
      <g stroke="#9E7D55" strokeWidth="0.9" strokeLinecap="round" opacity="0.6">
        <line x1="52" y1="46" x2="52" y2="52" />
        <line x1="49" y1="49" x2="55" y2="49" />
        <circle cx="52" cy="49" r="1.2" fill="#C5A048" />
      </g>
    </svg>
  );
}

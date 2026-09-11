"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Play } from "lucide-react";
import { cn } from "@/lib/utils";

export interface TrailerItem {
  id: number;
  title: string;
  category: string;
  language: string;
  src: string;
  alt: string;
  videoUrl?: string;
  color?: string;
  description?: string;
}

export interface RollingListProps {
  items: TrailerItem[];
  onSelectTrailer?: (item: TrailerItem) => void;
  className?: string;
}

export default function RollingList({
  items,
  onSelectTrailer,
  className,
}: RollingListProps) {
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  const handleKeyDown = (e: React.KeyboardEvent, item: TrailerItem) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (item.videoUrl && onSelectTrailer) {
        onSelectTrailer(item);
      }
    }
  };

  return (
    <div className={cn("w-full border-t border-[#E8E4DC]", className)}>
      {items.map((item) => {
        const isHovered = hoveredId === item.id;
        const hasVideo = Boolean(item.videoUrl);

        return (
          <div
            key={item.id}
            role={hasVideo ? "button" : "group"}
            tabIndex={0}
            aria-label={`${item.title} — ${item.category}, ${item.language}${hasVideo ? " (Watch trailer)" : ""}`}
            onMouseEnter={() => setHoveredId(item.id)}
            onMouseLeave={() => setHoveredId(null)}
            onFocus={() => setHoveredId(item.id)}
            onBlur={() => setHoveredId(null)}
            onClick={() => {
              setHoveredId(item.id);
              if (hasVideo && onSelectTrailer) {
                onSelectTrailer(item);
              }
            }}
            onKeyDown={(e) => handleKeyDown(e, item)}
            className={cn(
              "group relative w-full border-b border-[#E8E4DC] transition-colors duration-300 select-none",
              "py-3 sm:py-4 md:py-5 lg:py-6 px-2 sm:px-4",
              "outline-none focus-visible:bg-black/[0.02]",
              hasVideo ? "cursor-pointer" : "cursor-default"
            )}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6 relative">
              
              {/* ── 1. ROLLING TITLE ── */}
              <div className="flex-1 min-w-0 pr-4">
                <div className="relative h-[60px] sm:h-[76px] md:h-[88px] lg:h-[96px] xl:h-[108px] overflow-hidden">
                  <div
                    className={cn(
                      "transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] flex flex-col",
                      "group-hover:-translate-y-1/2 group-focus-visible:-translate-y-1/2",
                      isHovered ? "-translate-y-1/2" : "translate-y-0"
                    )}
                  >
                    {/* State 1: Normal Title */}
                    <div className="flex h-[60px] sm:h-[76px] md:h-[88px] lg:h-[96px] xl:h-[108px] items-center">
                      <h2 className="font-serif font-normal text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-[54px] text-[#050505] uppercase tracking-tight leading-[1] select-none whitespace-nowrap">
                        {item.title}
                      </h2>
                    </div>

                    {/* State 2: Hovered Rolling Title (Italic + StoryHour Royal Indigo Accent) */}
                    <div className="flex h-[60px] sm:h-[76px] md:h-[88px] lg:h-[96px] xl:h-[108px] items-center">
                      <h2 className="font-serif italic font-normal text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-[54px] text-[#2410A4] uppercase tracking-tight leading-[1] select-none whitespace-nowrap">
                        {item.title}
                      </h2>
                    </div>
                  </div>
                </div>

                {/* Mobile Image Reveal (Smooth expand underneath title on small screens) */}
                <div
                  className={cn(
                    "sm:hidden transition-all duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] overflow-hidden rounded-xl shadow-lg border border-black/10 mt-3",
                    isHovered
                      ? "max-h-36 opacity-100 scale-100"
                      : "max-h-0 opacity-0 scale-95 pointer-events-none"
                  )}
                >
                  <div className="relative w-full h-32">
                    <Image
                      src={item.src}
                      alt={item.alt}
                      fill
                      sizes="100vw"
                      className={cn(
                        "object-cover transition-all duration-500",
                        isHovered ? "grayscale-0" : "grayscale"
                      )}
                    />
                  </div>
                </div>
              </div>

              {/* ── 2. DESKTOP/TABLET IMAGE REVEAL (Beside hovered row, right-side placement) ── */}
              <div className="hidden sm:block absolute right-32 sm:right-40 md:right-52 lg:right-64 top-1/2 -translate-y-1/2 pointer-events-none z-20">
                <div
                  className={cn(
                    "w-44 h-28 md:w-56 md:h-36 lg:w-64 lg:h-40 overflow-hidden rounded-2xl shadow-2xl border border-black/10 bg-[#FAF8F3]",
                    "transition-all duration-500 ease-[cubic-bezier(0.76,0,0.24,1)]",
                    isHovered
                      ? "opacity-100 scale-100 rotate-0 translate-x-0"
                      : "opacity-0 scale-95 rotate-3 translate-x-4 group-hover:opacity-100 group-hover:scale-100 group-hover:rotate-0 group-hover:translate-x-0 group-focus-visible:opacity-100 group-focus-visible:scale-100 group-focus-visible:rotate-0 group-focus-visible:translate-x-0"
                  )}
                >
                  <div className="relative w-full h-full">
                    <Image
                      src={item.src}
                      alt={item.alt}
                      fill
                      sizes="(max-width: 1024px) 230px, 260px"
                      className={cn(
                        "object-cover transition-all duration-500 ease-[cubic-bezier(0.76,0,0.24,1)]",
                        isHovered
                          ? "grayscale-0 scale-105"
                          : "grayscale scale-100 group-hover:grayscale-0 group-hover:scale-105 group-focus-visible:grayscale-0"
                      )}
                    />
                    {hasVideo && (
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="w-11 h-11 rounded-full bg-[#C9281D] text-white flex items-center justify-center shadow-xl">
                          <Play className="w-5 h-5 fill-white translate-x-0.5" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* ── 3. RIGHT METADATA COLUMN ── */}
              <div
                className={cn(
                  "flex flex-col sm:items-end text-left sm:text-right transition-opacity duration-300 flex-shrink-0 min-w-[140px] sm:min-w-[170px]",
                  "group-hover:opacity-40 group-focus-visible:opacity-40",
                  isHovered ? "opacity-40" : "opacity-100"
                )}
              >
                <span className="font-mono text-[11px] sm:text-[12px] uppercase tracking-wider text-[#050505] font-semibold">
                  {item.category}
                </span>
                <span className="font-mono text-[10px] sm:text-[11px] uppercase tracking-widest text-[#696572] mt-0.5">
                  {item.language}
                </span>

                {hasVideo && (
                  <span className="inline-flex items-center gap-1 font-mono text-[10px] text-[#2410A4] uppercase tracking-wider font-semibold mt-1.5">
                    <Play className="w-2.5 h-2.5 fill-current" />
                    <span>Watch Preview</span>
                  </span>
                )}
              </div>

            </div>
          </div>
        );
      })}
    </div>
  );
}

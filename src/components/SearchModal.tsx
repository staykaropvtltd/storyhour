"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Search, X, Play } from "lucide-react";
import { useLibraryCart } from "@/context/LibraryCartContext";
import { useAudio } from "@/context/AudioContext";
import { STORIES } from "@/data/storyhour-data";

export default function SearchModal() {
  const { isSearchOpen, setIsSearchOpen } = useLibraryCart();
  const { playStory } = useAudio();
  const [query, setQuery] = useState("");

  if (!isSearchOpen) return null;

  const filtered = STORIES.filter(
    (s) =>
      s.title.toLowerCase().includes(query.toLowerCase()) ||
      s.language.toLowerCase().includes(query.toLowerCase()) ||
      s.category.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
      <div
        onClick={() => setIsSearchOpen(false)}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
      />
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-[#e7e7e7] overflow-hidden">
        <div className="p-4 border-b border-[#e7e7e7] flex items-center gap-3">
          <Search className="w-5 h-5 text-[#a4a4a4]" />
          <input
            type="text"
            placeholder="Search audiobooks, puppet skits, epics, languages..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="flex-1 bg-transparent border-none outline-none font-sans text-base text-[#0f0f0f] placeholder:text-[#a4a4a4]"
          />
          <button
            onClick={() => setIsSearchOpen(false)}
            className="w-8 h-8 rounded-full bg-[#f3f3f3] hover:bg-[#e7e7e7] flex items-center justify-center cursor-pointer"
          >
            <X className="w-4 h-4 text-[#0f0f0f]" />
          </button>
        </div>

        <div className="p-4 max-h-[60vh] overflow-y-auto divide-y divide-[#f3f3f3]">
          {filtered.length === 0 ? (
            <p className="text-center py-10 text-sm text-[#a4a4a4]">
              No stories found matching &ldquo;{query}&rdquo;
            </p>
          ) : (
            filtered.map((story) => (
              <div
                key={story.id}
                onClick={() => {
                  playStory(story);
                  setIsSearchOpen(false);
                }}
                className="py-3 px-2 flex items-center gap-4 hover:bg-[#FAF8F3] rounded-2xl cursor-pointer transition-colors"
              >
                <div className="relative w-12 h-14 rounded-xl overflow-hidden bg-[#f3f3f3] flex-shrink-0">
                  <Image src={story.coverImage} alt={story.title} fill className="object-cover" />
                </div>
                <div className="flex-1">
                  <h4 className="font-sans font-bold text-sm text-[#0f0f0f]">{story.title}</h4>
                  <p className="text-xs text-[#a4a4a4]">{story.language} • {story.duration} • {story.storyteller}</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#DE3124] to-[#C9281D] flex items-center justify-center text-white shadow-[0_2px_8px_rgba(201,40,29,0.35)]">
                  <Play className="w-3.5 h-3.5 ml-0.5 fill-white" />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

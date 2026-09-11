"use client";

import React, { useState, useMemo } from "react";
import { useLibraryCart } from "@/context/LibraryCartContext";
import { useAudio } from "@/context/AudioContext";
import { STORIES, Story } from "@/data/storyhour-data";
import { Search, X, Play, Clock, BookOpen } from "lucide-react";
import Image from "next/image";

export default function SearchModal() {
  const { isSearchOpen, setIsSearchOpen } = useLibraryCart();
  const { playStory } = useAudio();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredStories = useMemo(() => {
    if (!searchQuery.trim()) return STORIES;
    const q = searchQuery.toLowerCase();
    return STORIES.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.storyteller.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q) ||
        s.language.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  if (!isSearchOpen) return null;

  const handleSelectStory = (story: Story) => {
    playStory(story);
    setIsSearchOpen(false);
    // Smooth scroll to listening section
    const listeningEl = document.getElementById("listening-section");
    if (listeningEl) {
      listeningEl.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={() => setIsSearchOpen(false)}
        aria-hidden="true"
      />

      {/* Modal Card */}
      <div className="relative z-10 w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-story-border overflow-hidden flex flex-col max-h-[80vh]">
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-story-border bg-story-paper/50">
          <Search className="w-5 h-5 text-story-muted" />
          <input
            type="text"
            placeholder="Search stories, epics, storytellers, languages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
            className="flex-1 bg-transparent border-none outline-none text-base text-story-ink placeholder:text-story-muted/60 font-medium"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="text-xs text-story-muted hover:text-story-ink px-2 py-1 rounded-md bg-story-border/50"
            >
              Clear
            </button>
          )}
          <kbd className="hidden sm:inline-block px-2 py-1 text-[11px] font-mono text-story-muted bg-white rounded-md border border-story-border shadow-sm">
            ESC
          </kbd>
          <button
            onClick={() => setIsSearchOpen(false)}
            aria-label="Close search modal"
            className="p-1 rounded-full text-story-muted hover:text-story-ink"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Filter Tags */}
        <div className="flex items-center gap-2 px-6 py-2.5 bg-story-lavender/30 border-b border-story-border overflow-x-auto no-scrollbar text-xs">
          <span className="text-story-muted font-medium flex-shrink-0">Filter by:</span>
          {["Hindi", "English", "Telugu", "Mythology & Epics", "Children (5-8)"].map((tag) => (
            <button
              key={tag}
              onClick={() => setSearchQuery(tag)}
              className="px-2.5 py-1 rounded-full bg-white border border-story-border/70 hover:border-story-blue hover:text-story-blue text-story-ink font-medium whitespace-nowrap transition-colors"
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {filteredStories.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-sm text-story-muted">No stories found matching &ldquo;{searchQuery}&rdquo;</p>
              <p className="text-xs text-story-muted/70 mt-1">Try searching for &quot;Ramayana&quot;, &quot;Hindi&quot;, or &quot;Puppet&quot;</p>
            </div>
          ) : (
            filteredStories.map((story) => (
              <div
                key={story.id}
                onClick={() => handleSelectStory(story)}
                className="group flex items-center justify-between p-3.5 rounded-2xl hover:bg-story-lavender/40 border border-transparent hover:border-story-border cursor-pointer transition-all"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-story-paper flex-shrink-0 border border-story-border">
                    <Image
                      src={story.coverImage}
                      alt={story.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="56px"
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-story-lavender text-story-blue">
                        {story.language}
                      </span>
                      <span className="text-xs text-story-muted">{story.category}</span>
                    </div>
                    <h4 className="text-sm font-bold text-story-ink truncate group-hover:text-story-blue transition-colors">
                      {story.title}
                    </h4>
                    <p className="text-xs text-story-muted truncate">{story.storyteller}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0 pl-2">
                  <span className="hidden sm:flex items-center gap-1 text-xs font-mono text-story-muted">
                    <Clock className="w-3.5 h-3.5" />
                    {story.duration}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectStory(story);
                    }}
                    className="w-9 h-9 rounded-full bg-story-blue text-white flex items-center justify-center hover:bg-story-blue-hover shadow-sm transition-transform group-hover:scale-105"
                    title="Play preview"
                  >
                    <Play className="w-4 h-4 ml-0.5 fill-current" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Hint */}
        <div className="px-6 py-3 border-t border-story-border bg-story-paper/60 flex items-center justify-between text-xs text-story-muted">
          <span>{filteredStories.length} stories available</span>
          <span>Click to start audio preview</span>
        </div>
      </div>
    </div>
  );
}

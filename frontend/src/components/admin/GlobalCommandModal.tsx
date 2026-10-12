"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, X, BookOpen, Library, Mic, ArrowRight } from "lucide-react";
import { useAdminCms } from "@/context/AdminCmsContext";

interface GlobalCommandModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function GlobalCommandModal({ isOpen, onClose }: GlobalCommandModalProps) {
  const router = useRouter();
  const { stories, editions, storytellers } = useAdminCms();
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Lock body scroll when modal is open so the results list scrolls, not the page
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (isOpen) onClose();
        else setQuery("");
      }
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const cleanQuery = query.toLowerCase().trim();

  const matchingStories = stories.filter(
    (s) =>
      s.title.toLowerCase().includes(cleanQuery) ||
      s.storyteller.toLowerCase().includes(cleanQuery) ||
      s.language.toLowerCase().includes(cleanQuery)
  );

  const matchingEditions = editions.filter(
    (e) =>
      e.title.toLowerCase().includes(cleanQuery) ||
      e.codeName.toLowerCase().includes(cleanQuery) ||
      e.bookFormat.toLowerCase().includes(cleanQuery)
  );

  const matchingStorytellers = storytellers.filter(
    (st) =>
      st.name.toLowerCase().includes(cleanQuery) ||
      st.role.toLowerCase().includes(cleanQuery)
  );

  const handleSelect = (url: string) => {
    router.push(url);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 sm:px-6">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-2xl rounded-2xl bg-white border border-[#E8E4DC] shadow-2xl z-10 animate-zoom-in-95 text-[#0F0F0F] flex flex-col">
        <div className="flex items-center px-4 py-3.5 border-b border-[#E8E4DC] bg-[#FAF8F3]">
          <Search className="w-5 h-5 text-[#696572] mr-3" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type to search stories, books, narrators..."
            className="w-full bg-transparent text-sm text-[#0F0F0F] placeholder-[#696572] focus:outline-none"
          />
          {query && (
            <button onClick={() => setQuery("")} className="p-1 text-[#696572] hover:text-black mr-2">
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="px-2 py-0.5 text-[10px] font-mono text-[#696572] bg-white rounded border border-[#E8E4DC]">
            ESC
          </kbd>
        </div>

        <div className="max-h-[58vh] overflow-y-auto overscroll-contain p-3 space-y-4 divide-y divide-[#E8E4DC]" style={{ scrollbarWidth: 'thin' }}>
          {matchingStories.length > 0 && (
            <div className="pt-2">
              <div className="flex items-center gap-2 px-3 py-1 text-[11px] font-mono uppercase tracking-wider text-[#696572] font-bold">
                <BookOpen className="w-3.5 h-3.5 text-[#C9281D]" />
                <span>Stories ({matchingStories.length})</span>
              </div>
              <div className="mt-1 space-y-1">
                {matchingStories.slice(0, 4).map((story) => (
                  <button
                    key={story.id}
                    onClick={() => handleSelect("/admin/stories")}
                    className="w-full text-left flex items-center justify-between px-3 py-2 rounded-xl hover:bg-[#FDF2F0] hover:text-[#C9281D] transition group"
                  >
                    <div>
                      <div className="text-xs font-bold text-[#0F0F0F] group-hover:text-[#C9281D]">
                        {story.title}
                      </div>
                      <div className="text-[11px] text-[#696572]">
                        {story.storyteller} • {story.language} • {story.duration} •{" "}
                        <span className={story.status === "published" ? "text-emerald-700 font-semibold" : "text-amber-700 font-semibold"}>
                          {story.status}
                        </span>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-zinc-400 group-hover:text-[#C9281D] opacity-0 group-hover:opacity-100 transition" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {matchingEditions.length > 0 && (
            <div className="pt-2">
              <div className="flex items-center gap-2 px-3 py-1 text-[11px] font-mono uppercase tracking-wider text-[#696572] font-bold">
                <Library className="w-3.5 h-3.5 text-blue-600" />
                <span>Editions & Books ({matchingEditions.length})</span>
              </div>
              <div className="mt-1 space-y-1">
                {matchingEditions.slice(0, 4).map((edition) => (
                  <button
                    key={edition.id}
                    onClick={() => handleSelect("/admin/editions")}
                    className="w-full text-left flex items-center justify-between px-3 py-2 rounded-xl hover:bg-blue-50 transition group"
                  >
                    <div>
                      <div className="text-xs font-bold text-[#0F0F0F] group-hover:text-blue-700">
                        {edition.title}
                      </div>
                      <div className="text-[11px] text-[#696572]">
                        {edition.codeName} • {edition.bookFormat} • £{edition.price.toFixed(2)}
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-zinc-400 group-hover:text-blue-700 opacity-0 group-hover:opacity-100 transition" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {matchingStorytellers.length > 0 && (
            <div className="pt-2">
              <div className="flex items-center gap-2 px-3 py-1 text-[11px] font-mono uppercase tracking-wider text-[#696572] font-bold">
                <Mic className="w-3.5 h-3.5 text-emerald-600" />
                <span>Storytellers ({matchingStorytellers.length})</span>
              </div>
              <div className="mt-1 space-y-1">
                {matchingStorytellers.slice(0, 3).map((st) => (
                  <button
                    key={st.id}
                    onClick={() => handleSelect("/admin/storytellers")}
                    className="w-full text-left flex items-center justify-between px-3 py-2 rounded-xl hover:bg-emerald-50 transition group"
                  >
                    <div>
                      <div className="text-xs font-bold text-[#0F0F0F] group-hover:text-emerald-700">
                        {st.name}
                      </div>
                      <div className="text-[11px] text-[#696572]">{st.role}</div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-zinc-400 group-hover:text-emerald-700 opacity-0 group-hover:opacity-100 transition" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {cleanQuery &&
            matchingStories.length === 0 &&
            matchingEditions.length === 0 &&
            matchingStorytellers.length === 0 && (
              <div className="py-10 text-center text-[#696572] text-xs">
                No matching results found for &ldquo;<span className="text-[#0F0F0F] font-bold">{query}</span>&rdquo;.
              </div>
            )}
        </div>

        <div className="px-4 py-2.5 bg-[#FAF8F3] border-t border-[#E8E4DC] text-[11px] text-[#696572] flex items-center justify-between">
          <span>StoryHour CMS Global Search</span>
          <span className="font-mono text-[10px]">Press ESC to close</span>
        </div>
      </div>
    </div>
  );
}

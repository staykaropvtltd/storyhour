"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, X, BookOpen, Library, ShoppingBag, Mail, ArrowRight, CornerDownLeft } from "lucide-react";
import { useAdmin } from "@/context/AdminContext";

interface GlobalCommandModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function GlobalCommandModal({ isOpen, onClose }: GlobalCommandModalProps) {
  const router = useRouter();
  const { stories, editions, orders, enquiries } = useAdmin();
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

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

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

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

  const matchingOrders = orders.filter(
    (o) =>
      o.orderNumber.toLowerCase().includes(cleanQuery) ||
      o.customer.fullName.toLowerCase().includes(cleanQuery) ||
      o.customer.email.toLowerCase().includes(cleanQuery)
  );

  const matchingEnquiries = enquiries.filter(
    (e) =>
      e.name.toLowerCase().includes(cleanQuery) ||
      e.email.toLowerCase().includes(cleanQuery) ||
      e.enquiryType.toLowerCase().includes(cleanQuery) ||
      e.message.toLowerCase().includes(cleanQuery)
  );

  const handleSelect = (url: string) => {
    router.push(url);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 sm:px-6">
      <div className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity" onClick={onClose} />

      <div className="relative w-full max-w-2xl rounded-2xl bg-[#121215] border border-[#26262e] shadow-2xl overflow-hidden z-10 animate-zoom-in-95 text-zinc-200">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-zinc-800 bg-[#0e0e11]">
          <Search className="w-5 h-5 text-zinc-500 mr-3" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type to search stories, books, orders, inquiries..."
            className="w-full bg-transparent text-sm text-white placeholder-zinc-500 focus:outline-none"
          />
          {query && (
            <button onClick={() => setQuery("")} className="p-1 text-zinc-500 hover:text-white mr-2">
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="px-2 py-0.5 text-[10px] font-mono text-zinc-400 bg-zinc-800 rounded border border-zinc-700">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-[60vh] overflow-y-auto p-3 space-y-4 divide-y divide-zinc-800/60 scrollbar-thin">
          {/* Stories */}
          {matchingStories.length > 0 && (
            <div className="pt-2">
              <div className="flex items-center gap-2 px-3 py-1 text-[11px] font-mono uppercase tracking-wider text-zinc-500 font-semibold">
                <BookOpen className="w-3.5 h-3.5 text-[#C5A880]" />
                <span>Stories ({matchingStories.length})</span>
              </div>
              <div className="mt-1 space-y-1">
                {matchingStories.slice(0, 4).map((story) => (
                  <button
                    key={story.id}
                    onClick={() => handleSelect("/admin/stories")}
                    className="w-full text-left flex items-center justify-between px-3 py-2 rounded-xl hover:bg-zinc-800/80 transition group"
                  >
                    <div>
                      <div className="text-xs font-medium text-white group-hover:text-[#E8D3B4]">
                        {story.title}
                      </div>
                      <div className="text-[11px] text-zinc-500">
                        {story.storyteller} • {story.language} • {story.duration}
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-zinc-600 group-hover:text-white opacity-0 group-hover:opacity-100 transition" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Editions */}
          {matchingEditions.length > 0 && (
            <div className="pt-2">
              <div className="flex items-center gap-2 px-3 py-1 text-[11px] font-mono uppercase tracking-wider text-zinc-500 font-semibold">
                <Library className="w-3.5 h-3.5 text-blue-400" />
                <span>Editions & Books ({matchingEditions.length})</span>
              </div>
              <div className="mt-1 space-y-1">
                {matchingEditions.slice(0, 4).map((edition) => (
                  <button
                    key={edition.id}
                    onClick={() => handleSelect("/admin/editions")}
                    className="w-full text-left flex items-center justify-between px-3 py-2 rounded-xl hover:bg-zinc-800/80 transition group"
                  >
                    <div>
                      <div className="text-xs font-medium text-white group-hover:text-blue-300">
                        {edition.title}
                      </div>
                      <div className="text-[11px] text-zinc-500">
                        {edition.codeName} • {edition.bookFormat} • £{edition.price.toFixed(2)}
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-zinc-600 group-hover:text-white opacity-0 group-hover:opacity-100 transition" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Orders */}
          {matchingOrders.length > 0 && (
            <div className="pt-2">
              <div className="flex items-center gap-2 px-3 py-1 text-[11px] font-mono uppercase tracking-wider text-zinc-500 font-semibold">
                <ShoppingBag className="w-3.5 h-3.5 text-emerald-400" />
                <span>Orders ({matchingOrders.length})</span>
              </div>
              <div className="mt-1 space-y-1">
                {matchingOrders.slice(0, 3).map((order) => (
                  <button
                    key={order.orderId}
                    onClick={() => handleSelect("/admin/orders")}
                    className="w-full text-left flex items-center justify-between px-3 py-2 rounded-xl hover:bg-zinc-800/80 transition group"
                  >
                    <div>
                      <div className="text-xs font-medium text-white group-hover:text-emerald-300">
                        Order #{order.orderNumber} — {order.customer.fullName}
                      </div>
                      <div className="text-[11px] text-zinc-500">
                        £{order.total?.toFixed(2)} • {order.status}
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-zinc-600 group-hover:text-white opacity-0 group-hover:opacity-100 transition" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Enquiries */}
          {matchingEnquiries.length > 0 && (
            <div className="pt-2">
              <div className="flex items-center gap-2 px-3 py-1 text-[11px] font-mono uppercase tracking-wider text-zinc-500 font-semibold">
                <Mail className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>Inquiries ({matchingEnquiries.length})</span>
              </div>
              <div className="mt-1 space-y-1">
                {matchingEnquiries.slice(0, 3).map((enq) => (
                  <button
                    key={enq.id}
                    onClick={() => handleSelect("/admin/enquiries")}
                    className="w-full text-left flex items-center justify-between px-3 py-2 rounded-xl hover:bg-zinc-800/80 transition group"
                  >
                    <div>
                      <div className="text-xs font-medium text-white group-hover:text-[#D4AF37]">
                        {enq.name} ({enq.enquiryType})
                      </div>
                      <div className="text-[11px] text-zinc-500 line-clamp-1">{enq.message}</div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-zinc-600 group-hover:text-white opacity-0 group-hover:opacity-100 transition" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {cleanQuery &&
            matchingStories.length === 0 &&
            matchingEditions.length === 0 &&
            matchingOrders.length === 0 &&
            matchingEnquiries.length === 0 && (
              <div className="py-12 text-center text-zinc-500 text-xs">
                No matching results found for &ldquo;<span className="text-white">{query}</span>&rdquo;.
              </div>
            )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2.5 bg-[#0e0e11] border-t border-zinc-800 text-[11px] text-zinc-500 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700 text-[10px]">↵</kbd>
              <span>to select</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700 text-[10px]">esc</kbd>
              <span>to close</span>
            </span>
          </div>
          <span className="font-mono text-[10px] text-zinc-600">StoryHour Admin 2.0</span>
        </div>
      </div>
    </div>
  );
}

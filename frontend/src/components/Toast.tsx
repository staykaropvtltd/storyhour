"use client";

import React from "react";
import { useLibraryCart } from "@/context/LibraryCartContext";
import { X } from "lucide-react";

export default function Toast() {
  const { toastMessage, dismissToast } = useLibraryCart();

  if (!toastMessage) return null;

  return (
    <aside
      aria-live="polite"
      aria-atomic="true"
      className="fixed bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 z-[9999] pointer-events-none max-w-[92vw] sm:max-w-lg"
    >
      <div
        onClick={dismissToast}
        className="pointer-events-auto flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-[#141414]/95 text-white shadow-[0_12px_36px_rgba(0,0,0,0.3)] border border-white/10 backdrop-blur-md transition-all duration-200 hover:border-white/20 hover:bg-[#1a1a1a] cursor-pointer animate-in fade-in slide-in-from-bottom-2 select-none"
      >
        <span className="w-2 h-2 rounded-full bg-[#DE3124] shrink-0" aria-hidden="true" />
        <span className="text-[13px] font-medium text-white/95 truncate">
          {toastMessage}
        </span>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            dismissToast();
          }}
          className="ml-1 p-0.5 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-colors shrink-0"
          aria-label="Close notification"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </aside>
  );
}

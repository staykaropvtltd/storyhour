"use client";

import React from "react";
import { useLibraryCart } from "@/context/LibraryCartContext";
import { CheckCircle, Info } from "lucide-react";

export default function Toast() {
  const { toastMessage } = useLibraryCart();

  if (!toastMessage) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-24 right-6 z-50 flex items-center gap-3 bg-story-ink text-white px-5 py-3.5 rounded-full shadow-player border border-white/10 animate-fade-in transition-all"
    >
      <CheckCircle className="w-5 h-5 text-story-lavender flex-shrink-0" />
      <span className="text-sm font-medium tracking-wide">{toastMessage}</span>
    </div>
  );
}

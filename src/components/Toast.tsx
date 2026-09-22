"use client";

import React from "react";
import { useLibraryCart } from "@/context/LibraryCartContext";
import { Sparkles } from "lucide-react";

export default function Toast() {
  const { toastMessage } = useLibraryCart();

  if (!toastMessage) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-[#0f0f0f] text-white px-5 py-3 rounded-2xl shadow-2xl border border-white/10 animate-fade-in text-sm font-sans font-medium">
      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#DE3124] to-[#C9281D] flex items-center justify-center flex-shrink-0 shadow-[0_2px_8px_rgba(201,40,29,0.4)]">
        <Sparkles className="w-3.5 h-3.5 text-white" />
      </div>
      <span>{toastMessage}</span>
    </div>
  );
}

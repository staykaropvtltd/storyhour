"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("StoryHour application error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F3] text-[#0f0f0f] antialiased selection:bg-[#C9281D] selection:text-white">
      <SiteHeader />

      <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-24 sm:py-32 text-center">
        <div className="max-w-md mx-auto space-y-6">
          <div className="w-14 h-14 rounded-full bg-[#C9281D]/10 text-[#C9281D] flex items-center justify-center mx-auto">
            <AlertTriangle className="w-7 h-7" />
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0E1638]/10 text-[#0E1638] font-mono text-xs font-bold uppercase tracking-wider">
            <span>Something Went Wrong</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl font-normal text-[#0f0f0f] tracking-tight">
            We Ran into a Minor Interruption
          </h1>

          <p className="font-sans text-sm text-[#5A5A5A] leading-relaxed">
            An unexpected error occurred while rendering this page. Our ensemble has been notified. You can retry loading or head back to the home library.
          </p>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => reset()}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#C9281D] hover:bg-[#B01E14] text-white font-sans text-xs sm:text-sm font-bold transition shadow-[0_4px_14px_rgba(201,40,29,0.3)] cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Try Again</span>
            </button>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#0E1638] hover:bg-[#1E293B] text-white font-sans text-xs sm:text-sm font-bold transition shadow-sm"
            >
              <Home className="w-4 h-4" />
              <span>Return Home</span>
            </Link>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}

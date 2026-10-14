import React from "react";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { BookOpen, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F3] text-[#0f0f0f] antialiased selection:bg-[#C9281D] selection:text-white">
      <SiteHeader />

      <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-24 sm:py-32 text-center">
        <div className="max-w-md mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#C9281D]/10 text-[#C9281D] font-mono text-xs font-bold uppercase tracking-wider">
            <span>Error 404 · Page Not Found</span>
          </div>

          <h1 className="font-serif text-4xl sm:text-5xl font-normal text-[#0f0f0f] tracking-tight">
            The Story Has Moved
          </h1>

          <p className="font-sans text-sm sm:text-base text-[#5A5A5A] leading-relaxed">
            We couldn&apos;t find the chapter or page you were looking for. It may have been archived, renamed, or is currently being illustrated.
          </p>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#0E1638] hover:bg-[#1E293B] text-white font-sans text-xs sm:text-sm font-bold transition shadow-sm"
            >
              <Home className="w-4 h-4" />
              <span>Return Home</span>
            </Link>
            <Link
              href="/stories"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#C9281D] hover:bg-[#B01E14] text-white font-sans text-xs sm:text-sm font-bold transition shadow-[0_4px_14px_rgba(201,40,29,0.3)]"
            >
              <BookOpen className="w-4 h-4" />
              <span>Browse Editions</span>
            </Link>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}

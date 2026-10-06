"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ShieldCheck, X } from "lucide-react";

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    try {
      const consent = localStorage.getItem("storyhour_cookie_consent");
      if (!consent) {
        setIsVisible(true);
      }
    } catch {
      // In case localStorage is blocked
    }
  }, []);

  const handleAccept = () => {
    try {
      localStorage.setItem("storyhour_cookie_consent", "accepted");
    } catch {
      // ignore
    }
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div
      role="region"
      aria-label="Privacy and Cookie Notice"
      className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 bg-[#FAF8F3] border border-[#E0DBD0] rounded-2xl p-4 sm:p-5 shadow-[0_20px_45px_rgba(0,0,0,0.18)] animate-in fade-in slide-in-from-bottom-4 duration-300"
    >
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-[#DE3124]/10 text-[#C9281D] flex items-center justify-center flex-shrink-0 mt-0.5">
          <ShieldCheck className="w-4 h-4 stroke-[2.2]" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-serif text-[15px] font-bold text-[#0F0F0F]">
            Family Privacy &amp; Cookie Notice
          </p>
          <p className="font-sans text-[12px] text-[#4F4A42] leading-relaxed mt-1">
            StoryHour respects family privacy under the UK ICO Children&apos;s Code &amp; UK GDPR. We use essential cookies only to power audio playback, your library, and secure cart sessions. No commercial tracking or behavioural advertising cookies are loaded for young listeners.
          </p>
          <div className="mt-3 flex items-center gap-3">
            <button
              type="button"
              onClick={handleAccept}
              className="px-4 py-1.5 rounded-full bg-[#0F0F0F] hover:bg-[#2A2A2A] text-white font-sans text-[12px] font-medium transition-colors cursor-pointer shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C9281D]"
            >
              Accept Essential Cookies
            </button>
            <Link
              href="/privacy"
              className="font-sans text-[12px] font-medium text-[#4F4A42] hover:text-[#C9281D] underline transition-colors"
            >
              Privacy Policy
            </Link>
          </div>
        </div>
        <button
          type="button"
          onClick={handleAccept}
          aria-label="Close notice"
          className="text-[#4F4A42] hover:text-[#0F0F0F] p-1 rounded-md transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

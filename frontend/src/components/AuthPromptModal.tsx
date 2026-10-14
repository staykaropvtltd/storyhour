"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLibraryCart } from "@/context/LibraryCartContext";
import { User, X, BookOpen, Headphones, ShieldCheck, ArrowRight } from "lucide-react";

export default function AuthPromptModal() {
  const { isAuthModalOpen, closeAuthModal, authModalTitle, authModalDescription } = useLibraryCart();
  const pathname = usePathname();

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isAuthModalOpen) {
        closeAuthModal();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isAuthModalOpen, closeAuthModal]);

  if (!isAuthModalOpen) return null;

  const currentRedirect = pathname ? encodeURIComponent(pathname) : "";
  const loginHref = currentRedirect ? `/login?redirect=${currentRedirect}` : "/login";
  const signupHref = currentRedirect ? `/signup?redirect=${currentRedirect}` : "/signup";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
    >
      {/* Backdrop */}
      <div
        onClick={closeAuthModal}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
      />

      {/* Modal Dialog Card */}
      <div className="relative w-full max-w-md bg-[#FAF8F3] rounded-3xl shadow-[0_24px_50px_rgba(0,0,0,0.25)] border border-black/10 overflow-hidden text-[#0f0f0f] animate-in zoom-in-95 fade-in duration-200 z-10 p-6 sm:p-8">
        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-5 right-5 p-2 rounded-full text-black/50 hover:text-black hover:bg-black/5 transition-colors cursor-pointer"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Icon Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#DE3124] to-[#FC7819] flex items-center justify-center text-white shadow-[0_8px_20px_rgba(201,40,29,0.3)] shrink-0">
            <User className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <span className="text-[11px] font-mono uppercase tracking-wider font-bold text-[#C9281D]">
              StoryHour Account
            </span>
            <h3 id="auth-modal-title" className="text-xl font-serif font-bold text-[#0F0F0F] leading-tight">
              {authModalTitle || "Log in to Shop"}
            </h3>
          </div>
        </div>

        {/* Description */}
        <p className="text-[13.5px] text-black/70 leading-relaxed mb-6 font-sans">
          {authModalDescription ||
            "Please sign in or create a StoryHour account to add stories to your cart, unlock editions, and access your digital bookshelf."}
        </p>

        {/* Benefits list */}
        <div className="space-y-2.5 pb-6 mb-6 border-b border-black/10 text-xs font-medium text-black/80">
          <div className="flex items-center gap-2.5">
            <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <BookOpen className="w-3 h-3" />
            </div>
            <span>Keep your digital editions forever across all devices</span>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="w-5 h-5 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <Headphones className="w-3 h-3" />
            </div>
            <span>Listen to immersive bedtime narrations anytime</span>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-3 h-3" />
            </div>
            <span>Safe, secure, and hassle-free checkout</span>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <Link
            href={loginHref}
            onClick={closeAuthModal}
            className="w-full py-3.5 px-6 rounded-full bg-[#0F0F0F] hover:bg-gradient-to-r hover:from-[#DE3124] hover:to-[#C9281D] text-white font-bold text-sm tracking-wide transition-all shadow-sm hover:shadow-[0_8px_24px_rgba(201,40,29,0.35)] flex items-center justify-center gap-2"
          >
            <span>Log In to Continue</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href={signupHref}
            onClick={closeAuthModal}
            className="w-full py-3 px-6 rounded-full bg-white hover:bg-black/5 text-[#0F0F0F] font-bold text-sm border border-black/15 transition-colors flex items-center justify-center"
          >
            Create Free Account
          </Link>
        </div>

        {/* Dismiss text */}
        <div className="mt-4 text-center">
          <button
            onClick={closeAuthModal}
            className="text-xs text-black/50 hover:text-black font-medium transition-colors cursor-pointer"
          >
            Continue browsing for now
          </button>
        </div>
      </div>
    </div>
  );
}

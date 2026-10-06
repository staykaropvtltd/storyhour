"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { User, Lock, Mail, ArrowRight, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!fullName.trim() || fullName.trim().length < 2) {
      setErrorMessage("Please enter your full name.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    if (!password || password.length < 8) {
      setErrorMessage("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    if (!agreeTerms) {
      setErrorMessage("Please agree to the Terms of Service and Privacy Policy.");
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      try {
        const userSession = {
          email: email.trim(),
          name: fullName.trim(),
          token: "session_" + Math.random().toString(36).substring(2),
          loggedInAt: new Date().toISOString(),
        };
        localStorage.setItem("storyhour_user_session", JSON.stringify(userSession));
        setSuccessMessage("Account created successfully! Taking you to your library…");
        setTimeout(() => {
          router.push("/account");
        }, 900);
      } catch (err) {
        setIsSubmitting(false);
        setErrorMessage("An unexpected error occurred. Please try again.");
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F3] text-[#0f0f0f] antialiased selection:bg-[#C9281D] selection:text-white">
      <SiteHeader activeLink="Account" />

      {/* Sky Hero Banner */}
      <section className="relative w-full bg-[#3b9dfb] pt-28 sm:pt-36 pb-16 sm:pb-20 px-4 sm:px-6 overflow-hidden select-none">
        <div className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-hidden">
          <Image
            src="/images/user-hero-bg.webp"
            alt=""
            fill
            className="object-cover object-top"
            sizes="100vw"
            priority
            aria-hidden="true"
          />
        </div>

        <div className="relative z-10 max-w-xl mx-auto text-center flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white font-mono text-xs font-bold uppercase tracking-wider mb-4 shadow-sm">
            <span>Join StoryHour</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-[1.08] drop-shadow-sm">
            Create Your Account
          </h1>
          <p className="mt-3 text-white/90 font-medium text-sm sm:text-base max-w-md leading-relaxed">
            Begin your journey into classical Indian epics, bedtime audiobooks, and interactive story volumes.
          </p>
        </div>

        <div
          className="absolute -bottom-px left-0 right-0 z-10 pointer-events-none overflow-hidden leading-none select-none"
          style={{ marginBottom: "-1px" }}
        >
          <svg viewBox="0 0 1440 100" fill="none" preserveAspectRatio="none" className="w-full h-10 sm:h-14 block" aria-hidden="true">
            <path d="M0,32 C360,68 720,8 1080,44 C1260,62 1380,48 1440,38 L1440,100 L0,100 Z" fill="#FAF8F3" />
          </svg>
        </div>
      </section>

      {/* Signup Card */}
      <main className="flex-1 max-w-md w-full mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="bg-white rounded-3xl border border-black/5 shadow-[0_8px_30px_rgba(0,0,0,0.06)] p-6 sm:p-9 space-y-6">
          <div className="text-center">
            <h2 className="font-serif text-2xl font-bold text-[#0f0f0f]">Sign Up</h2>
            <p className="text-xs text-[#5A5A5A] mt-1">Fill in your information to get started</p>
          </div>

          {errorMessage && (
            <div role="alert" aria-live="assertive" className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div role="status" className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
              <span>{successMessage}</span>
            </div>
          )}

          <form onSubmit={handleSignup} noValidate className="space-y-4">
            <div>
              <label htmlFor="signupName" className="block text-xs font-bold text-[#0f0f0f] uppercase tracking-wider mb-1.5">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="signupName"
                  name="fullName"
                  type="text"
                  required
                  autoComplete="name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Aarav Sharma"
                  className="w-full px-4 py-3 rounded-xl bg-[#FAF8F3] border border-black/10 text-sm font-sans focus:outline-none focus:ring-2 focus:ring-[#C9281D] focus:bg-white transition-colors"
                />
                <User className="absolute right-3.5 top-3.5 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div>
              <label htmlFor="signupEmail" className="block text-xs font-bold text-[#0f0f0f] uppercase tracking-wider mb-1.5">
                Email Address <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="signupEmail"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 rounded-xl bg-[#FAF8F3] border border-black/10 text-sm font-sans focus:outline-none focus:ring-2 focus:ring-[#C9281D] focus:bg-white transition-colors"
                />
                <Mail className="absolute right-3.5 top-3.5 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div>
              <label htmlFor="signupPassword" className="block text-xs font-bold text-[#0f0f0f] uppercase tracking-wider mb-1.5">
                Password (min 8 chars) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="signupPassword"
                  name="password"
                  type="password"
                  required
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-xl bg-[#FAF8F3] border border-black/10 text-sm font-sans focus:outline-none focus:ring-2 focus:ring-[#C9281D] focus:bg-white transition-colors"
                />
                <Lock className="absolute right-3.5 top-3.5 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div>
              <label htmlFor="signupConfirm" className="block text-xs font-bold text-[#0f0f0f] uppercase tracking-wider mb-1.5">
                Confirm Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="signupConfirm"
                  name="confirmPassword"
                  type="password"
                  required
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-xl bg-[#FAF8F3] border border-black/10 text-sm font-sans focus:outline-none focus:ring-2 focus:ring-[#C9281D] focus:bg-white transition-colors"
                />
                <Lock className="absolute right-3.5 top-3.5 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <label htmlFor="signupTerms" className="flex items-start gap-2.5 pt-1 text-xs text-[#5A5A5A] cursor-pointer">
              <input
                id="signupTerms"
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded text-[#C9281D] focus:ring-[#C9281D] border-gray-300"
              />
              <span>
                I agree to the{" "}
                <Link href="/terms" target="_blank" className="text-[#C9281D] underline font-semibold">
                  Terms of Use
                </Link>{" "}
                and{" "}
                <Link href="/privacy" target="_blank" className="text-[#C9281D] underline font-semibold">
                  Privacy Policy
                </Link>
                .
              </span>
            </label>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-full bg-gradient-to-r from-[#DE3124] via-[#C9281D] to-[#991B1B] hover:from-[#EA3A2D] hover:via-[#D12E23] hover:to-[#A81F19] text-white font-sans text-sm font-bold shadow-[0_4px_16px_rgba(201,40,29,0.35)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Creating Account…</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="text-center pt-2 border-t border-black/5 text-xs text-[#5A5A5A]">
            <span>Already have an account? </span>
            <Link href="/login" className="text-[#C9281D] font-bold hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}

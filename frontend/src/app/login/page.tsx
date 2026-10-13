"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { GrainGradient } from "@paper-design/shaders-react";
import {
  ArrowLeft,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    if (!password || password.length < 6) {
      setErrorMessage("Please enter your password (minimum 6 characters).");
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      try {
        const rawName = email.split("@")[0];
        const formattedName = rawName === "demo" ? "Demo Reader" : rawName.charAt(0).toUpperCase() + rawName.slice(1);
        const userSession = {
          email: email.trim(),
          name: formattedName,
          fullName: formattedName,
          phone: "+44 (0) 7911 123456",
          token: "session_" + Math.random().toString(36).substring(2),
          loggedInAt: new Date().toISOString(),
        };
        localStorage.setItem("storyhour_user_session", JSON.stringify(userSession));
        setSuccessMessage("Welcome back! Redirecting to your account…");
        setTimeout(() => {
          let dest = "/account";
          if (typeof window !== "undefined") {
            const params = new URLSearchParams(window.location.search);
            const redirectParam = params.get("redirect");
            if (
              redirectParam &&
              redirectParam.startsWith("/") &&
              !redirectParam.startsWith("//") &&
              !redirectParam.includes("\\")
            ) {
              dest = redirectParam;
            }
          }
          router.push(dest);
        }, 800);
      } catch {
        setIsSubmitting(false);
        setErrorMessage("An unexpected error occurred. Please try again.");
      }
    }, 900);
  };

  const handleSocialAuth = (provider: "Google" | "Apple") => {
    setSuccessMessage(null);
    setErrorMessage(
      `${provider} Sign-In requires OAuth provider configuration. Please sign in with your email and password below.`
    );
  };

  const handleForgotPassword = (e: React.MouseEvent) => {
    e.preventDefault();
    setSuccessMessage(null);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email.trim())) {
      setErrorMessage("Please enter your registered email address in the field below to request password reset instructions.");
      return;
    }
    setErrorMessage(
      `Password reset service is pending email provider configuration. Please contact support at contact@storyhour.co.uk to reset access for ${email.trim()}.`
    );
  };

  return (
    <section className="min-h-screen lg:h-screen lg:max-h-screen w-full bg-white p-2.5 sm:p-3.5 lg:p-4 text-black antialiased [font-synthesis:none] selection:bg-[#C9281D] selection:text-white flex items-center justify-center overflow-x-hidden">
      <div className="w-full max-w-[1440px] h-full lg:h-[calc(100vh-2rem)] grid gap-4 lg:gap-5 lg:grid-cols-[0.94fr_1.06fr]">
        {/* Left Form Panel */}
        <div className="flex flex-col justify-between rounded-2xl sm:rounded-3xl border border-black/15 bg-white px-6 py-6 sm:px-8 sm:py-7 lg:px-10 lg:py-7 xl:px-14 xl:py-8 overflow-y-auto no-scrollbar shadow-sm">
          <div className="mx-auto w-full max-w-[460px] my-auto">
            {/* Top Brand Link */}
            <div className="flex items-center justify-between pb-3 sm:pb-4">
              <Link
                href="/"
                className="group inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-black/60 hover:text-black transition-colors"
              >
                <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                <span>Back to StoryHour</span>
              </Link>
            </div>

            {/* StoryHour Logo */}
            <div className="mb-4 sm:mb-5">
              <Link href="/" className="inline-block" aria-label="StoryHour Home">
                <div className="relative h-12 w-48 sm:h-14 sm:w-56 lg:h-16 lg:w-64">
                  <Image
                    src="https://storyhour.co.uk/wp-content/uploads/2026/01/tp-logo.png"
                    alt="StoryHour Logo"
                    fill
                    priority
                    className="object-contain object-left"
                    sizes="(max-width: 640px) 200px, 260px"
                  />
                </div>
              </Link>
            </div>

            {/* Header */}
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-[34px] font-semibold tracking-tight text-black leading-tight">
                Sign in to your account
              </h1>
              <p className="mt-1 text-sm sm:text-base text-black/60">
                Stories that live beyond time
              </p>
            </div>

            {/* Social Buttons */}
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => handleSocialAuth("Google")}
                className="flex h-10 sm:h-11 items-center justify-center gap-2.5 rounded-[10px] border border-black/25 bg-white px-3 text-xs sm:text-sm font-medium text-black transition-colors hover:bg-black/[0.04]"
              >
                <GoogleIcon />
                <span className="whitespace-nowrap">Sign in with Google</span>
              </button>
              <button
                type="button"
                onClick={() => handleSocialAuth("Apple")}
                className="flex h-10 sm:h-11 items-center justify-center gap-2.5 rounded-[10px] border border-black/25 bg-white px-3 text-xs sm:text-sm font-medium text-black transition-colors hover:bg-black/[0.04]"
              >
                <AppleIcon />
                <span className="whitespace-nowrap">Sign in with Apple</span>
              </button>
            </div>

            {/* Divider */}
            <div className="my-4 text-center text-xs sm:text-sm font-medium text-black/45">
              or
            </div>

            {/* Status alerts */}
            {errorMessage && (
              <div
                role="alert"
                className="mb-3.5 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-center gap-2"
              >
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div
                role="status"
                className="mb-3.5 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleLogin} noValidate className="space-y-3">
              {/* Email */}
              <div>
                <label
                  htmlFor="loginEmail"
                  className="block text-[11px] sm:text-xs font-semibold text-black/70 uppercase tracking-wider mb-1"
                >
                  Email Address
                </label>
                <div className="relative">
                  <input
                    id="loginEmail"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@storyhour.co.uk"
                    required
                    className="w-full h-10 sm:h-11 rounded-[10px] border border-black/25 bg-white px-3.5 pl-9 text-sm text-black placeholder:text-black/35 outline-none transition-colors focus:border-black focus:ring-1 focus:ring-black"
                  />
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black/40 pointer-events-none" />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label
                    htmlFor="loginPassword"
                    className="block text-[11px] sm:text-xs font-semibold text-black/70 uppercase tracking-wider"
                  >
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-[11px] sm:text-xs font-medium text-black/60 hover:text-black underline underline-offset-2 bg-transparent border-none p-0 cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <input
                    id="loginPassword"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    className="w-full h-10 sm:h-11 rounded-[10px] border border-black/25 bg-white px-3.5 pl-9 pr-9 text-sm text-black placeholder:text-black/35 outline-none transition-colors focus:border-black focus:ring-1 focus:ring-black"
                  />
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black/40 pointer-events-none" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-black/40 hover:text-black/70 p-1"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Options */}
              <div className="flex items-center justify-between pt-0.5">
                <label className="flex items-center gap-2 text-xs text-black/65 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="size-3.5 rounded border-black/25 text-[#C9281D] focus:ring-[#C9281D]"
                  />
                  <span>Remember me on this device</span>
                </label>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-4 flex h-10 sm:h-11 w-full items-center justify-center rounded-[10px] bg-[#C9281D] text-sm sm:text-base font-medium text-white transition-all hover:bg-[#B52218] active:scale-[0.99] disabled:opacity-60 cursor-pointer shadow-sm"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Signing in…</span>
                  </div>
                ) : (
                  <span>Sign In</span>
                )}
              </button>
            </form>
          </div>

          {/* Footer note */}
          <div className="mx-auto w-full max-w-[460px] pt-4 text-center text-xs text-black/60 border-t border-black/10 mt-4">
            <span>Don&apos;t have an account yet? </span>
            <Link href="/signup" className="font-semibold text-[#C9281D] hover:underline underline-offset-2">
              Create an account
            </Link>
          </div>
        </div>

        {/* Right Shader Showcase Panel */}
        <div className="relative flex flex-col justify-between overflow-hidden rounded-2xl sm:rounded-3xl bg-[#0E1638] p-6 sm:p-8 lg:p-10 xl:p-14 text-white">
          {/* GrainGradient WebGL Shader */}
          {mounted && (
            <GrainGradient
              speed={1}
              scale={1}
              rotation={0}
              offsetX={0}
              offsetY={0}
              softness={0.5}
              intensity={0.5}
              noise={0.25}
              shape="corners"
              frame={2854.5}
              colors={["#FFFFFF", "#FC7819", "#C9281D", "#FFFFFF"]}
              colorBack="#0E1638"
              className="absolute inset-0 bg-[#0E1638]"
            />
          )}

          <div className="relative z-10 flex h-full w-full flex-col justify-between">
            <h2 className="max-w-[580px] pt-2 sm:pt-4 lg:pt-8 text-4xl font-medium tracking-[-0.05em] text-white sm:text-5xl lg:text-[52px] xl:text-[62px] lg:leading-[1]">
              Stories That Live
              <br />
              Beyond Time
            </h2>

            <p className="max-w-md text-sm sm:text-base lg:text-lg text-white/85 font-light leading-relaxed pb-2 sm:pb-4">
              Classical Indian epics and bedtime audiobooks told with heart, heritage, and screen-free calm.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09Z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23Z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84Z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38Z"
        fill="#EB4335"
      />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M17.05 12.54c-.03-3.02 2.47-4.47 2.58-4.54-1.41-2.06-3.6-2.34-4.38-2.37-1.86-.19-3.64 1.1-4.58 1.1-.95 0-2.42-1.07-3.98-1.04-2.05.03-3.94 1.19-4.99 3.02-2.13 3.69-.54 9.16 1.53 12.15 1.01 1.46 2.22 3.1 3.81 3.04 1.53-.06 2.11-.99 3.96-.99s2.37.99 3.99.96c1.65-.03 2.69-1.49 3.69-2.96 1.16-1.69 1.64-3.33 1.66-3.41-.04-.02-3.2-1.23-3.24-4.87ZM14.03 3.66c.84-1.02 1.41-2.43 1.25-3.84-1.21.05-2.68.81-3.55 1.83-.78.9-1.46 2.34-1.28 3.72 1.35.1 2.73-.69 3.58-1.71Z" />
    </svg>
  );
}

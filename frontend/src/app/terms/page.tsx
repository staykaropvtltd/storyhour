import React from "react";
import Image from "next/image";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

export const metadata = {
  title: "Terms of Use | StoryHour",
  description:
    "Terms of Use and digital educational content licensing agreement for StoryHour audiobooks and interactive volumes.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F3] text-[#0f0f0f] antialiased selection:bg-[#C9281D] selection:text-white">
      <SiteHeader activeLink="Terms" />

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

        <div className="relative z-10 max-w-3xl mx-auto text-center flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white font-mono text-xs font-bold uppercase tracking-wider mb-4 shadow-sm">
            <span>Legal Documentation</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-[1.08] drop-shadow-sm">
            Terms of Use
          </h1>
          <p className="mt-3 text-white/90 font-medium text-sm sm:text-base max-w-lg leading-relaxed">
            Please read these terms carefully before accessing or purchasing StoryHour digital editions, audio recordings, or interactive reader services.
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

      {/* Terms Body */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="bg-white rounded-3xl border border-black/5 shadow-[0_8px_30px_rgba(0,0,0,0.04)] p-6 sm:p-12 space-y-8 font-sans text-sm sm:text-base text-[#2C2824] leading-relaxed">
          <div>
            <span className="font-mono text-xs uppercase tracking-wider text-[#C9281D] font-bold block mb-1">
              Effective Date: October 2026
            </span>
            <h2 className="font-serif text-2xl font-bold text-[#0f0f0f]">1. Agreement to Terms</h2>
            <p className="mt-2 text-[#5A5A5A]">
              By accessing the StoryHour platform (&quot;StoryHour&quot;, &quot;we&quot;, &quot;our&quot;), purchasing digital editions, or listening to streaming audiobooks, you agree to be bound by these Terms of Use and all applicable laws and regulations under the United Kingdom.
            </p>
          </div>

          <hr className="border-black/5" />

          <div>
            <h2 className="font-serif text-2xl font-bold text-[#0f0f0f]">2. Digital License &amp; Content Access</h2>
            <p className="mt-2 text-[#5A5A5A]">
              When you purchase a StoryHour edition or audiobook, StoryHour grants you a personal, non-transferable, non-exclusive license to view, read, and listen to the digital materials for non-commercial, personal, or educational use. You may not distribute, reproduce, broadcast, or modify any artwork, audio tracks, or texts without prior written authorization.
            </p>
          </div>

          <hr className="border-black/5" />

          <div>
            <h2 className="font-serif text-2xl font-bold text-[#0f0f0f]">3. Cancellation &amp; Statutory Digital Content Waiver</h2>
            <p className="mt-2 text-[#5A5A5A]">
              Under UK Consumer Rights legislation, statutory 14-day cancellation rights for digital content do not apply once digital supply or access has commenced with your express consent and acknowledgment. Because digital access to StoryHour books and audiobooks is granted immediately upon order authorization, you acknowledge that you waive the 14-day statutory withdrawal period upon completion of checkout.
            </p>
          </div>

          <hr className="border-black/5" />

          <div>
            <h2 className="font-serif text-2xl font-bold text-[#0f0f0f]">4. Children&apos;s Audience &amp; Guardian Responsibility</h2>
            <p className="mt-2 text-[#5A5A5A]">
              StoryHour creates family and intergenerational educational storytelling. Purchases of digital subscriptions or editions must be made by an adult aged 18 or older, or with the verified consent and participation of a parent or legal guardian.
            </p>
          </div>

          <hr className="border-black/5" />

          <div>
            <h2 className="font-serif text-2xl font-bold text-[#0f0f0f]">5. Intellectual Property Rights</h2>
            <p className="mt-2 text-[#5A5A5A]">
              All illustrations, puppet theatre scripts, audio recordings, musical compositions, and proprietary adaptations remain the intellectual property of StoryHour Ltd. and our collaborating cultural ensemble artists.
            </p>
          </div>

          <hr className="border-black/5" />

          <div>
            <h2 className="font-serif text-2xl font-bold text-[#0f0f0f]">6. Contact Information</h2>
            <p className="mt-2 text-[#5A5A5A]">
              For inquiries regarding these Terms of Use, permissions, or school workshop agreements, please contact us at{" "}
              <a href="mailto:contact@storyhour.co.uk" className="text-[#C9281D] underline font-semibold">
                contact@storyhour.co.uk
              </a>.
            </p>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}

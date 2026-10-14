import React from "react";
import Image from "next/image";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

export const metadata = {
  title: "Privacy Policy | StoryHour",
  description:
    "Privacy Policy, UK GDPR compliance, and ICO Children's Code protections for StoryHour visitors and readers.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F3] text-[#0f0f0f] antialiased selection:bg-[#C9281D] selection:text-white">
      <SiteHeader activeLink="Privacy" />

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
            <span>Privacy &amp; Data Protection</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-[1.08] drop-shadow-sm">
            Privacy Policy
          </h1>
          <p className="mt-3 text-white/90 font-medium text-sm sm:text-base max-w-lg leading-relaxed">
            Our commitment to preserving your privacy, complying with UK GDPR, and honoring the ICO Children&apos;s Code.
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

      {/* Privacy Body */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="bg-white rounded-3xl border border-black/5 shadow-[0_8px_30px_rgba(0,0,0,0.04)] p-6 sm:p-12 space-y-8 font-sans text-sm sm:text-base text-[#2C2824] leading-relaxed">
          <div>
            <span className="font-mono text-xs uppercase tracking-wider text-[#C9281D] font-bold block mb-1">
              Updated: October 2026 · StoryHour Ltd.
            </span>
            <h2 className="font-serif text-2xl font-bold text-[#0f0f0f]">1. Our Privacy Commitment</h2>
            <p className="mt-2 text-[#5A5A5A]">
              StoryHour Ltd. (&quot;StoryHour&quot;, &quot;we&quot;, &quot;our&quot;) is committed to protecting your personal data in strict compliance with the UK General Data Protection Regulation (UK GDPR), the Data Protection Act 2018, and the Information Commissioner&apos;s Office (ICO) Age Appropriate Design Code.
            </p>
          </div>

          <hr className="border-black/5" />

          <div>
            <h2 className="font-serif text-2xl font-bold text-[#0f0f0f]">2. Protection of Children&apos;s Privacy</h2>
            <p className="mt-2 text-[#5A5A5A]">
              We design our digital storytelling platform with the best interests of children as a primary consideration. We do not profile child users for commercial gain, sell personal information to third parties, or engage in behavioral advertising targeted at minors. Interactive reading and audiobook audio progress is stored locally in your browser (via local storage) without unnecessary external tracking.
            </p>
          </div>

          <hr className="border-black/5" />

          <div>
            <h2 className="font-serif text-2xl font-bold text-[#0f0f0f]">3. Data We Collect</h2>
            <ul className="mt-2 space-y-2 list-disc list-inside text-[#5A5A5A]">
              <li><strong>Contact Information:</strong> Full name, email address, and optional phone number when submitting inquiries or purchasing digital editions.</li>
              <li><strong>Order History:</strong> Record of purchased editions, order numbers, and timestamp of transaction for entitlement authorization.</li>
              <li><strong>Technical Data:</strong> Essential session cookies, browser type, and anonymous access logs used exclusively for site reliability and security.</li>
            </ul>
          </div>

          <hr className="border-black/5" />

          <div>
            <h2 className="font-serif text-2xl font-bold text-[#0f0f0f]">4. Third-Party Integrations &amp; Video Embeds</h2>
            <p className="mt-2 text-[#5A5A5A]">
              Video previews and trailer materials utilize privacy-enhanced mode (such as <code>youtube-nocookie.com</code>) to prevent third-party tracking cookies from executing until you deliberately interact with the media content.
            </p>
          </div>

          <hr className="border-black/5" />

          <div>
            <h2 className="font-serif text-2xl font-bold text-[#0f0f0f]">5. Your Rights Under UK GDPR</h2>
            <p className="mt-2 text-[#5A5A5A]">
              You have the right to request access to your personal data, rectify inaccuracies, request erasure of your details (&quot;right to be forgotten&quot;), and restrict processing. To exercise any of these rights, email our Data Privacy Officer at{" "}
              <a href="mailto:privacy@storyhour.co.uk" className="text-[#C9281D] underline font-semibold">
                privacy@storyhour.co.uk
              </a>.
            </p>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}

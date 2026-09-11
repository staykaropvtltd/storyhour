"use client";

import React, { useRef, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  STORIES,
  PRODUCTS,
  STORYTELLERS,
  TESTIMONIAL,
  TRUST_METRICS,
} from "@/data/storyhour-data";

function useReveal(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

export default function HomepageBody() {
  const showcaseRef = useRef<HTMLDivElement>(null);
  const row1Ref = useRef<HTMLDivElement>(null);
  const row2Ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => {
      if (!showcaseRef.current || !row1Ref.current || !row2Ref.current) return;
      const rect = showcaseRef.current.getBoundingClientRect();
      const vh = window.innerHeight;
      const progress = Math.max(0, Math.min(1, (vh - rect.top) / (rect.height + vh)));
      const drift = progress * 280;
      row1Ref.current.style.transform = `translateX(${-drift}px)`;
      row2Ref.current.style.transform = `translateX(${-(280 - drift)}px)`;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const featReveal  = useReveal();
  const showcaseHd  = useReveal();
  const splitReveal = useReveal();
  const fmtReveal   = useReveal();
  const teamReveal  = useReveal();
  const proofReveal = useReveal();
  const ctaReveal   = useReveal();

  const [primary, ...rest] = STORIES;
  const allCovers = [...STORIES, ...STORIES];

  return (
    <div>
      {/* §0 Transition */}
      <div style={{ height: "80px", background: "linear-gradient(to bottom, #120A45 0%, #FAF8F3 100%)" }} />

      {/* §1 Featured Stories */}
      <section className="bg-[#FAF8F3] pt-16 pb-24 lg:pt-20 lg:pb-32 overflow-hidden">
        <div className="max-w-[1320px] mx-auto px-6 sm:px-10">
          <div
            ref={featReveal.ref}
            className={`mb-14 transition-all duration-700 ${featReveal.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
          >
            <h2 className="font-serif text-5xl sm:text-6xl lg:text-[72px] font-normal text-[#050505] leading-[0.92] tracking-[-0.035em] text-balance max-w-[580px]">
              Epics that shaped a civilisation
            </h2>
            <p className="mt-5 font-inter text-[15px] text-[#696572] max-w-[440px] leading-[1.65]">
              Performance-driven narrations rooted in Valmiki, Tulsidas, and the living oral tradition — in English, Hindi, and Telugu.
            </p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-[480px_1fr] gap-14 lg:gap-20 items-start">
            <div
              className={`transition-all duration-1000 ${featReveal.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"}`}
              style={{ transitionDelay: "120ms" }}
            >
              <div className="relative w-full max-w-[400px] aspect-[3/4] rounded-2xl overflow-hidden shadow-[0_32px_80px_-12px_rgba(5,5,5,0.3)]">
                <Image src={primary.coverImage} alt={primary.title} fill priority className="object-cover" sizes="(max-width: 1024px) 100vw, 400px" />
                <span className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-[#2410A4] text-white text-[11px] font-inter font-medium">{primary.language}</span>
                <span className="absolute top-4 right-4 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-sm text-white text-[11px] font-mono">{primary.duration}</span>
              </div>
              <div className="mt-8 space-y-4">
                <h3 className="font-serif text-3xl sm:text-4xl font-normal text-[#050505] tracking-[-0.025em] leading-[1.1]">{primary.title}</h3>
                <p className="font-inter text-[15px] text-[#696572] leading-[1.65] max-w-[390px]">{primary.description}</p>
                <p className="font-inter text-[13px] text-[#696572]/75 italic">{primary.culturalNote}</p>
                <div className="flex flex-wrap gap-3 pt-2">
                  <button className="px-6 py-3 rounded-full bg-[#2410A4] hover:bg-[#1B0C80] text-white font-inter text-sm font-medium transition-colors cursor-pointer">Listen now</button>
                  <button className="px-6 py-3 rounded-full border border-[#E8E4DC] hover:border-[#2410A4] hover:text-[#2410A4] text-[#050505] font-inter text-sm font-medium transition-colors cursor-pointer">Explore story</button>
                </div>
              </div>
            </div>
            <div className="divide-y divide-[#E8E4DC]">
              {rest.map((story, i) => (
                <div
                  key={story.id}
                  className={`py-7 flex gap-5 items-start group cursor-pointer transition-all duration-700 ${featReveal.visible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"}`}
                  style={{ transitionDelay: `${200 + i * 90}ms` }}
                >
                  <div className="relative flex-shrink-0 w-[54px] h-[76px] rounded-lg overflow-hidden shadow-[0_4px_16px_rgba(5,5,5,0.18)] group-hover:scale-105 transition-transform duration-300">
                    <Image src={story.coverImage} alt={story.title} fill className="object-cover" sizes="54px" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <p className="font-serif text-[18px] text-[#050505] leading-[1.25] tracking-[-0.01em] group-hover:text-[#2410A4] transition-colors line-clamp-2">{story.title}</p>
                      <span className="flex-shrink-0 font-mono text-xs text-[#696572] mt-0.5">{story.duration}</span>
                    </div>
                    <p className="mt-1.5 font-inter text-[13px] text-[#696572] leading-[1.5] line-clamp-2">{story.description}</p>
                    <div className="mt-2.5 flex items-center gap-2">
                      <span className="text-[11px] font-inter font-medium text-[#2410A4] px-2 py-0.5 rounded-full bg-[#EEF0FF]">{story.language}</span>
                      <span className="text-[12px] font-inter text-[#696572]">{story.format}</span>
                    </div>
                  </div>
                </div>
              ))}
              <div className="pt-7">
                <button className="font-inter text-sm font-medium text-[#2410A4] hover:text-[#1B0C80] transition-colors cursor-pointer">View all stories</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* §2 Scroll-Linked Library Showcase */}
      <section id="journal" className="bg-[#120A45] py-24 overflow-hidden scroll-mt-14" ref={showcaseRef}>
        <div
          ref={showcaseHd.ref}
          className={`max-w-[1320px] mx-auto px-6 sm:px-10 mb-14 transition-all duration-700 ${showcaseHd.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
        >
          <h2 className="font-serif text-4xl sm:text-5xl font-normal text-[#F7F4EE] tracking-[-0.03em] leading-[1.05]">Our complete library</h2>
          <p className="mt-3 font-inter text-[15px] text-[#F7F4EE]/65 max-w-[440px] leading-[1.65]">
            Audiobooks, puppet stories, and live performance recordings — across three languages.
          </p>
        </div>
        <div className="overflow-visible mb-5">
          <div ref={row1Ref} className="flex gap-5 px-6" style={{ transform: "translateX(0px)", willChange: "transform" }}>
            {[...allCovers, ...allCovers].map((story, i) => (
              <div key={`r1-${i}`} className="flex-shrink-0 w-[168px] sm:w-[200px] group cursor-pointer">
                <div className="relative w-full aspect-[2/3] rounded-xl overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.5)] group-hover:scale-[1.05] group-hover:-translate-y-2 transition-all duration-300">
                  <Image src={story.coverImage} alt={story.title} fill className="object-cover" sizes="200px" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-2 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <span className="font-inter text-[11px] text-white/90 leading-tight block">{story.language}</span>
                    <span className="font-mono text-[10px] text-white/60">{story.duration}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="overflow-visible">
          <div ref={row2Ref} className="flex gap-5 px-6" style={{ transform: "translateX(-280px)", willChange: "transform" }}>
            {[...allCovers.slice().reverse(), ...allCovers.slice().reverse()].map((story, i) => (
              <div key={`r2-${i}`} className="flex-shrink-0 w-[168px] sm:w-[200px] group cursor-pointer">
                <div className="relative w-full aspect-[2/3] rounded-xl overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.5)] group-hover:scale-[1.05] group-hover:-translate-y-2 transition-all duration-300">
                  <Image src={story.coverImage} alt={story.title} fill className="object-cover" sizes="200px" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-2 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <span className="font-inter text-[11px] text-white/90 leading-tight block">{story.language}</span>
                    <span className="font-mono text-[10px] text-white/60">{story.duration}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="max-w-[1320px] mx-auto px-6 sm:px-10 mt-14">
          <button className="px-8 py-3.5 rounded-full border border-white/25 hover:border-white/60 text-white font-inter text-sm font-medium transition-colors cursor-pointer">Browse full library</button>
        </div>
      </section>

      {/* §3 Cinematic Feature */}
      <section id="trailer" className="bg-[#0D0830] overflow-hidden scroll-mt-14">
        <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[640px] lg:min-h-[720px]">
          <div
            ref={splitReveal.ref}
            className={`relative flex items-end justify-center bg-[#090522] overflow-hidden transition-all duration-1000 ${splitReveal.visible ? "opacity-100" : "opacity-0"}`}
          >
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-[480px] h-[480px] rounded-full bg-[#2410A4]/20 blur-[120px]" />
            </div>
            <div className="relative z-10 w-[260px] sm:w-[320px] lg:w-[360px] aspect-[3/4] mt-16">
              <Image src={STORIES[0].coverImage} alt={STORIES[0].title} fill className="object-cover rounded-t-2xl shadow-[0_-24px_80px_rgba(0,0,0,0.6)]" sizes="360px" />
            </div>
          </div>
          <div
            className={`flex items-center px-8 sm:px-14 lg:px-16 py-16 lg:py-0 bg-gradient-to-bl from-[#1B0C6E]/70 to-[#120A45] transition-all duration-1000 ${splitReveal.visible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-10"}`}
            style={{ transitionDelay: "200ms" }}
          >
            <div className="max-w-[460px]">
              <span className="font-inter text-[11px] font-medium text-[#F6C445] tracking-widest uppercase mb-5 block">Signature Release</span>
              <h2 className="font-serif text-[40px] sm:text-5xl lg:text-[56px] font-normal text-[#F7F4EE] leading-[0.94] tracking-[-0.03em] mb-6">
                Ramayana —<br />An Ancient Indian Epic
              </h2>
              <p className="font-inter text-[15px] text-[#F7F4EE]/75 leading-[1.7] mb-8 max-w-[400px]">{STORIES[0].description}</p>
              <div className="flex items-center gap-5 mb-10 font-mono text-[13px] text-[#F7F4EE]/50">
                <span>{STORIES[0].duration}</span>
                <span className="w-px h-3.5 bg-current opacity-30" />
                <span>{STORIES[0].chaptersCount} chapters</span>
                <span className="w-px h-3.5 bg-current opacity-30" />
                <span>{STORIES[0].audience}</span>
              </div>
              <div className="flex flex-wrap gap-3">
                <button className="px-7 py-3.5 rounded-full bg-white hover:bg-[#EEF0FF] text-[#2410A4] font-inter text-sm font-medium transition-colors cursor-pointer shadow-[0_4px_24px_rgba(0,0,0,0.3)]">Listen now</button>
                <button className="px-7 py-3.5 rounded-full border border-white/25 hover:border-white/60 text-white font-inter text-sm font-medium transition-colors cursor-pointer">Buy audiobook — $84.99</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* §4 Format Discovery */}
      <section id="experiences" className="bg-[#EEF0FF] py-20 lg:py-28 scroll-mt-14">
        <div className="max-w-[1320px] mx-auto px-6 sm:px-10">
          <div
            ref={fmtReveal.ref}
            className={`mb-14 transition-all duration-700 ${fmtReveal.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
          >
            <h2 className="font-serif text-5xl sm:text-6xl font-normal text-[#050505] tracking-[-0.03em] leading-[0.96]">How you want to experience it</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
            {[
              { label: "Audiobooks", description: "Studio-recorded narrations with atmospheric Indian instrumentation. English, Hindi, and Telugu.", image: PRODUCTS[1].coverImage, cta: "Browse audiobooks", badge: "40–42 chapters" },
              { label: "Puppet Stories", description: "Handcrafted marionette performances of ancient epics and Panchatantra fables — recorded live from stage.", image: "https://storyhour.co.uk/wp-content/uploads/2026/01/Grand-Finale-5-scaled.jpg", cta: "Watch stories", badge: "Children 5–12" },
              { label: "Live Residencies", description: "Interactive school programmes and cultural workshops across London and Hyderabad.", image: "https://storyhour.co.uk/wp-content/uploads/2026/01/SpanishSchool-London-1-1024x1024.jpeg", cta: "Find an event", badge: "UK and India" },
            ].map((item, i) => (
              <div
                key={item.label}
                id={item.label === "Live Residencies" ? "events" : undefined}
                className={`group relative overflow-hidden rounded-2xl cursor-pointer transition-all duration-700 scroll-mt-14 ${fmtReveal.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                <div className="relative aspect-[4/5]">
                  <Image src={item.image} alt={item.label} fill className="object-cover group-hover:scale-105 transition-transform duration-700" sizes="(max-width: 768px) 100vw, 33vw" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-7">
                    <span className="inline-block font-mono text-[10px] text-white/70 mb-3">{item.badge}</span>
                    <h3 className="font-serif text-2xl sm:text-3xl text-white font-normal tracking-[-0.02em] mb-2">{item.label}</h3>
                    <p className="font-inter text-[13px] text-white/80 leading-[1.55] mb-5 max-w-[260px]">{item.description}</p>
                    <span className="inline-flex items-center font-inter text-[13px] font-medium text-white border-b border-white/50 group-hover:border-white transition-colors pb-0.5">{item.cta}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* §5 Storytellers */}
      <section id="storytellers" className="bg-[#FAF8F3] py-20 lg:py-28 scroll-mt-14">
        <div className="max-w-[1320px] mx-auto px-6 sm:px-10">
          <div
            ref={teamReveal.ref}
            className={`mb-14 flex flex-col sm:flex-row sm:items-end justify-between gap-4 transition-all duration-700 ${teamReveal.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
          >
            <div>
              <h2 className="font-serif text-4xl sm:text-5xl font-normal text-[#050505] tracking-[-0.03em] leading-[1.02] max-w-[480px]">
                The people behind the stories
              </h2>
            </div>
            <Link
              href="/storytellers"
              className="inline-flex items-center gap-1 text-sm font-inter font-semibold text-[#2410A4] hover:underline"
            >
              Meet all storytellers →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            {STORYTELLERS.map((person, i) => (
              <div
                key={person.id}
                className={`group cursor-pointer transition-all duration-700 ${teamReveal.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
                style={{ transitionDelay: `${i * 120}ms` }}
              >
                <div className="relative w-full aspect-[4/5] rounded-2xl overflow-hidden mb-6 shadow-[0_12px_32px_-8px_rgba(5,5,5,0.14)] group-hover:shadow-[0_20px_48px_-8px_rgba(5,5,5,0.22)] transition-all duration-500 bg-[#E8E4DC]/40">
                  <Image
                    src={person.portraitImage}
                    alt={person.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  <div className="absolute top-3.5 left-3.5 flex flex-wrap gap-1.5">
                    {person.languages?.map((lang) => (
                      <span
                        key={lang}
                        className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[11px] font-inter font-medium tracking-wide"
                      >
                        {lang}
                      </span>
                    ))}
                  </div>
                </div>
                <h3 className="font-serif text-[20px] sm:text-[22px] text-[#050505] tracking-[-0.015em] mb-1.5 leading-[1.2] group-hover:text-[#2410A4] transition-colors duration-200">
                  {person.name}
                </h3>
                <p className="font-inter text-[13px] text-[#2410A4] font-medium mb-3">
                  {person.role}
                </p>
                <p className="font-inter text-[14px] text-[#696572] leading-[1.65]">
                  {person.bio}
                </p>
                <p className="mt-4 font-mono text-[11px] text-[#696572]/70 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2410A4]/50" />
                  {person.region}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* §8 Social Proof */}
      <section className="bg-[#FAF8F3] pb-20 lg:pb-28">
        <div className="max-w-[1320px] mx-auto px-6 sm:px-10">
          <div className="border-t border-[#E8E4DC] pt-16 lg:pt-20">
            <div
              ref={proofReveal.ref}
              className={`grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-16 lg:gap-20 items-start transition-all duration-1000 ${proofReveal.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
            >
              <div className="border-l-[3px] border-[#C9281D] pl-8">
                <blockquote className="font-serif text-[22px] sm:text-2xl lg:text-[28px] text-[#050505] font-normal leading-[1.4] tracking-[-0.02em] text-balance">&ldquo;{TESTIMONIAL.quote}&rdquo;</blockquote>
                <div className="mt-8 flex items-center gap-4">
                  <div className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0 shadow-[0_4px_16px_rgba(5,5,5,0.2)]">
                    <Image src={TESTIMONIAL.image} alt={TESTIMONIAL.author} fill className="object-cover" sizes="48px" />
                  </div>
                  <div>
                    <p className="font-inter font-medium text-[15px] text-[#050505]">{TESTIMONIAL.author}</p>
                    <p className="font-inter text-[13px] text-[#696572]">{TESTIMONIAL.credentials}</p>
                  </div>
                </div>
              </div>
              <div
                className={`space-y-0 divide-y divide-[#E8E4DC] transition-all duration-1000 ${proofReveal.visible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"}`}
                style={{ transitionDelay: "180ms" }}
              >
                {TRUST_METRICS.map((m) => (
                  <div key={m.label} className="py-5">
                    <p className="font-serif text-[18px] text-[#050505] tracking-[-0.01em]">{m.value}</p>
                    <p className="font-inter text-[13px] text-[#696572] mt-0.5 leading-[1.5]">{m.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* §9 Final CTA */}
      <section className="bg-[#2410A4] py-24 lg:py-32 overflow-hidden relative">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full bg-[#1B0C80]/60 blur-[120px]" />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full bg-[#3020C4]/40 blur-[100px]" />
        </div>
        <div
          ref={ctaReveal.ref}
          className={`relative z-10 max-w-[860px] mx-auto px-6 sm:px-10 text-center transition-all duration-1000 ${ctaReveal.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
        >
          <h2 className="font-serif text-5xl sm:text-6xl lg:text-[80px] font-normal text-[#F7F4EE] leading-[0.92] tracking-[-0.04em] mb-6 text-balance">Every story begins with one listen</h2>
          <p className="font-inter text-[16px] text-[#F7F4EE]/70 leading-[1.65] max-w-[480px] mx-auto mb-12">Bring Indian mythology, culture, and history into your home. Available in English, Hindi, and Telugu.</p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <button className="px-9 py-4 rounded-full bg-white hover:bg-[#F7F4EE] text-[#2410A4] font-inter font-medium text-[15px] transition-colors cursor-pointer shadow-[0_8px_40px_rgba(0,0,0,0.3)]">Browse all stories</button>
            <button className="px-9 py-4 rounded-full border border-white/35 hover:border-white/70 text-white font-inter font-medium text-[15px] transition-colors cursor-pointer">Buy an audiobook</button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-[#120A45] pt-16 pb-10 scroll-mt-14">
        <div className="max-w-[1320px] mx-auto px-6 sm:px-10">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-10 pb-14 border-b border-white/10">
            <div className="col-span-2 sm:col-span-1">
              <div className="relative h-7 w-28 mb-5 brightness-0 invert opacity-90">
                <Image src="https://storyhour.co.uk/wp-content/uploads/2026/01/tp-logo.png" alt="StoryHour" fill className="object-contain object-left" sizes="120px" />
              </div>
              <p className="font-inter text-[13px] text-[#F7F4EE]/50 leading-[1.65] max-w-[200px]">Indian mythology and culture brought to life through soulful storytelling.</p>
              <div className="mt-5"><span className="font-mono text-[11px] text-[#F7F4EE]/35">London and Hyderabad</span></div>
            </div>
            <div>
              <p className="font-inter text-[11px] font-medium text-[#F7F4EE]/35 mb-5">Explore</p>
              <ul className="space-y-3">
                {["Stories", "Storytellers", "Experiences", "Events", "Journal"].map((link) => (
                  <li key={link}>
                    <a
                      href={link === "Stories" ? "/stories" : link === "Storytellers" ? "/storytellers" : "#"}
                      className="font-inter text-[14px] text-[#F7F4EE]/65 hover:text-white transition-colors"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="font-inter text-[11px] font-medium text-[#F7F4EE]/35 mb-5">Shop</p>
              <ul className="space-y-3">
                {["All Audiobooks", "English Collection", "Hindi Collection", "Telugu Collection", "Shop"].map((link) => (
                  <li key={link}>
                    <a
                      href="/stories"
                      className="font-inter text-[14px] text-[#F7F4EE]/65 hover:text-white transition-colors"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="font-inter text-[11px] font-medium text-[#F7F4EE]/35 mb-5">Info</p>
              <ul className="space-y-3">
                {["About", "Contact", "Privacy", "Terms", "Refunds"].map((link) => (
                  <li key={link}>
                    <a
                      href={link === "Contact" ? "/contact" : link === "About" ? "/storytellers" : "#"}
                      className="font-inter text-[14px] text-[#F7F4EE]/65 hover:text-white transition-colors"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="pt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <p className="font-inter text-[13px] text-[#F7F4EE]/35">© 2026 StoryHour. All rights reserved.</p>
            <p className="font-inter text-[13px] text-[#F7F4EE]/35">Available worldwide</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

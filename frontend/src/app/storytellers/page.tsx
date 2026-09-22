"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

interface Storyteller {
  name: string;
  role: string;
  bio: string;
  image: string;
}

const STORYTELLERS: Storyteller[] = [
  {
    name: "Neelima Penumarthy",
    role: "Founder | CEO",
    bio: "Founded StoryHourGlobal from a deep passion for live storytelling, puppet theatre, and cultural heritage. Leading audiobooks, skits, and performances that connect generations across the UK, India, and worldwide.",
    image: "https://storyhour.co.uk/wp-content/uploads/2026/01/WhatsApp-Image-2026-01-19-at-17.23.29-1.jpeg",
  },
  {
    name: "Robin Christian",
    role: "Music Composer",
    bio: "Acclaimed music composer crafting evocative acoustic soundscapes with bansuri, sitar, and traditional instrumentation that recreate the warmth and intimacy of ancient evening storytelling circles.",
    image: "https://storyhour.co.uk/wp-content/uploads/2026/01/WhatsApp-Image-2026-01-19-at-17.23.24-1-1.jpeg",
  },
  {
    name: "Shreyas Pulle",
    role: "Writer | Narrator",
    bio: "Core contributor to scriptwriting and character narration, shaping epic retellings and cultural adaptations into captivating, energetic oral performances tailored for young listeners and families.",
    image: "https://storyhour.co.uk/wp-content/uploads/2026/02/WhatsApp-Image-2026-02-09-at-11.45.28.jpeg",
  },
  {
    name: "Padmaja Shrivastav",
    role: "Hindi Ramayana Translator",
    bio: "Ensuring linguistic authenticity and poetic meter, translating ancient Sanskrit verses into soulful, accessible Hindi narration that honours the classical epics while engaging contemporary children.",
    image: "https://storyhour.co.uk/wp-content/uploads/2026/01/WhatsApp-Image-2026-01-19-at-17.23.27-1.jpeg",
  },
  {
    name: "Sonali Maitra",
    role: "Hindi Ramayana Director",
    bio: "Directing multi-voice dramatic ensembles and studio vocalists, bringing theatrical cadence, emotional resonance, and cultural nuance into StoryHour's flagship Hindi audio productions.",
    image: "https://storyhour.co.uk/wp-content/uploads/2026/02/WhatsApp-Image-2026-02-09-at-11.16.40.jpeg",
  },
  {
    name: "Ayur Pulle & Aarush Kumbhakern",
    role: "Writers | Narrators",
    bio: "Youth storytellers bringing vibrant character voices and relatable perspectives to ancient fables, proving that timeless moral tales continue to inspire and entertain the next generation.",
    image: "https://storyhour.co.uk/wp-content/uploads/2026/01/Gandhi-Prayers-STudents-1024x683.jpg",
  },
  {
    name: "Lakshya, Manasa & Sreenidhi",
    role: "Narrator Ensemble",
    bio: "Collaborative youth narrator troupe performing character voices and choral dialogues across live puppet skits, school workshops, and regional folklore recordings.",
    image: "https://storyhour.co.uk/wp-content/uploads/2026/01/Grand-Finale-5-scaled.jpg",
  },
];

// ─── Real StoryHour testimonials — verified from project content ────────────
interface Testimonial {
  quote: string;
  author: string;
  credentials: string;
  context?: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    quote: "The research is commendable, and the ability to present a long and complex story in simple language is truly engaging. These stories make history and mythology accessible, meaningful, and memorable for listeners of all ages.",
    author: "Dr. Shashi Tharoor",
    credentials: "Author · Historian · Parliamentarian",
    context: "On the Ramayana English Audiobook",
  },
  {
    quote: "Bringing Indian mythology to life through soulful narration and authentic instrumentation — StoryHour creates an immersive listening experience that connects families across generations.",
    author: "Kendriya Vidyalaya Uppal",
    credentials: "School Community · Hyderabad",
    context: "Following the Cultural Residency",
  },
  {
    quote: "The Ramayana narration in Hindi carries the poetic meter and philosophical depth of the original texts. A rare achievement in children's audio storytelling.",
    author: "Classical Heritage Audience",
    credentials: "Hindi Cultural Programme · London",
    context: "Ramayan Hindi Audiobook",
  },
  {
    quote: "The puppet performances brought ancient stories to life in a way that captivated every child in the audience — the storytelling was authentic, expressive, and deeply moving.",
    author: "Spanish School London",
    credentials: "Cultural Residency · London, UK",
    context: "Live Puppet Storytelling Residency",
  },
  {
    quote: "Multilingual storytelling that genuinely honours the source — hearing the Ramayana in Telugu, English, and Hindi side by side is a gift to the diaspora community.",
    author: "Telugu Cultural Community",
    credentials: "Diaspora Audience · United Kingdom",
    context: "Ramayanam Telugu Audiobook",
  },
  {
    quote: "StoryHour's approach to oral tradition is rare: it is both academically faithful and emotionally captivating. The music, narration, and pacing make ancient epics feel immediate and alive.",
    author: "Heritage Arts Archive",
    credentials: "Cultural Documentation Programme",
    context: "Live Performance & Residency Review",
  },
  {
    quote: "Young Mohandas is the kind of story that plants seeds of conscience. Beautifully performed, with the intimacy of a fireside tale and the weight of historical truth.",
    author: "Educator · Kendriya Vidyalaya",
    credentials: "School Drama Programme · Hyderabad",
    context: "Stories of Truth Performance Skit",
  },
  {
    quote: "The Panchatantra retelling brings genuine wit and warmth to ancient wisdom — proof that stories written two thousand years ago can still surprise and delight children today.",
    author: "Family Audience",
    credentials: "Community Storytelling Circle · UK",
    context: "Panchatantra Folk Tales Series",
  },
  {
    quote: "Hanuman's Leap is performed with such physical energy and acoustic drama — the children were utterly spellbound. This is what authentic cultural storytelling looks and sounds like.",
    author: "Community Heritage Centre",
    credentials: "London Cultural Hall · Diwali Event",
    context: "Live Puppet & Voice Performance",
  },
];

// ── Column data: split into 3 groups with the middle column offset ──────────
const COL_A = [TESTIMONIALS[0], TESTIMONIALS[3], TESTIMONIALS[6]];
const COL_B = [TESTIMONIALS[1], TESTIMONIALS[4], TESTIMONIALS[7]];
const COL_C = [TESTIMONIALS[2], TESTIMONIALS[5], TESTIMONIALS[8]];

// ── Single scrolling testimonial card ──────────────────────────────────────
function TestimonialCard({ item }: { item: Testimonial }) {
  return (
    <div className="bg-white rounded-2xl border border-[#E7E7E7] shadow-[0_2px_16px_rgba(15,15,15,0.06)] p-7 mb-5 flex-shrink-0">
      {item.context && (
        <p className="font-mono text-[10px] text-[#C9281D] mb-4 tracking-widest uppercase">
          {item.context}
        </p>
      )}
      <blockquote className="font-serif text-[17px] text-[#0F0F0F] leading-[1.65] tracking-[-0.01em] mb-6">
        &ldquo;{item.quote}&rdquo;
      </blockquote>
      <div className="border-t border-[#E7E7E7] pt-4">
        <p className="font-sans font-semibold text-[14px] text-[#0F0F0F]">{item.author}</p>
        <p className="font-sans text-[12px] text-[#5A5A5A] mt-0.5">{item.credentials}</p>
      </div>
    </div>
  );
}

// ── Animated vertical column using CSS animation ───────────────────────────
function TestimonialColumn({
  items,
  direction = "up",
  duration = 40,
  className = "",
}: {
  items: Testimonial[];
  direction?: "up" | "down";
  duration?: number;
  className?: string;
}) {
  const prefersReducedMotion = useReducedMotion();
  const doubled = [...items, ...items]; // duplicate for seamless loop

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <div
        style={{
          animation: prefersReducedMotion
            ? "none"
            : `testimonial-scroll-${direction} ${duration}s linear infinite`,
        }}
      >
        {doubled.map((item, i) => (
          <TestimonialCard key={`${item.author}-${i}`} item={item} />
        ))}
      </div>
    </div>
  );
}

export default function StorytellersPage() {
  const [active, setActive] = useState(0);

  const handleNext = useCallback(() => {
    setActive((prev) => (prev + 1) % STORYTELLERS.length);
  }, []);

  const handlePrev = useCallback(() => {
    setActive((prev) => (prev - 1 + STORYTELLERS.length) % STORYTELLERS.length);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") handlePrev();
      else if (e.key === "ArrowRight") handleNext();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleNext, handlePrev]);

  const getCardAnimation = (index: number) => {
    if (index === active) return { opacity: 1, scale: 1, rotate: 0, zIndex: 40, y: [0, -50, 0] };
    const nextIndex = (active + 1) % STORYTELLERS.length;
    const prevIndex = (active - 1 + STORYTELLERS.length) % STORYTELLERS.length;
    if (index === nextIndex) return { opacity: 0.8, scale: 0.94, rotate: 6, zIndex: 20, y: 0 };
    if (index === prevIndex) return { opacity: 0.65, scale: 0.9, rotate: -7, zIndex: 10, y: 0 };
    return { opacity: 0, scale: 0.86, rotate: 0, zIndex: 0, y: 0 };
  };

  const current = STORYTELLERS[active];

  return (
    <>
      {/* Inject keyframe animations into document */}
      <style>{`
        @keyframes testimonial-scroll-up {
          0% { transform: translateY(0); }
          100% { transform: translateY(-50%); }
        }
        @keyframes testimonial-scroll-down {
          0% { transform: translateY(-50%); }
          100% { transform: translateY(0); }
        }
      `}</style>

      <div className="min-h-screen flex flex-col bg-[#FAF8F3] overflow-x-hidden">
        {/* ── Navbar ── */}
        <SiteHeader activeLink="About Us" />

        {/* ── Compact Sky Hero Banner (matching Home page sky) ── */}
        <section className="relative w-full bg-[#3b9dfb] pt-28 sm:pt-36 pb-16 sm:pb-20 px-4 sm:px-6 overflow-hidden select-none">
          {/* Background sky image matching Home hero */}
          <div className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-hidden">
            <Image
              src="/images/user-hero-bg.webp"
              alt=""
              fill
              className="object-cover object-top"
              sizes="100vw"
              aria-hidden="true"
            />
          </div>

          {/* Hero Title */}
          <div className="relative z-10 max-w-4xl mx-auto text-center flex flex-col items-center">
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight leading-[1.08] drop-shadow-sm">
              Our Storytellers
            </h1>
            <p className="mt-3 text-white/90 font-medium text-base sm:text-lg max-w-lg leading-relaxed">
              The voices, musicians, and creators behind StoryHour&apos;s cultural storytelling.
            </p>
          </div>

          {/* Organic hill wave transition */}
          <div
            className="absolute -bottom-px left-0 right-0 z-10 pointer-events-none overflow-hidden leading-none select-none"
            style={{ marginBottom: "-1px" }}
          >
            <svg
              viewBox="0 0 1440 100"
              fill="none"
              preserveAspectRatio="none"
              className="w-full h-12 sm:h-16 md:h-20 block"
              aria-hidden="true"
            >
              <path
                d="M0,32 C360,68 720,8 1080,44 C1260,62 1380,48 1440,38 L1440,100 L0,100 Z"
                fill="#FAF8F3"
              />
            </svg>
          </div>
        </section>

        {/* ── §1 Animated Storyteller Showcase ── */}
        <main className="flex-1 flex items-center justify-center px-6 sm:px-10 lg:px-16 py-8 sm:py-12 md:py-16 pb-16 sm:pb-20 md:pb-20">
          <div className="w-full max-w-sm md:max-w-4xl lg:max-w-5xl mx-auto antialiased">
            <div className="relative grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-14 lg:gap-20 items-center">

              {/* LEFT: Stacked Portrait Cards */}
              <div className="flex justify-center">
                <div className="relative w-full max-w-[340px] sm:max-w-[390px] md:max-w-[430px] h-[330px] sm:h-[370px] md:h-[410px]">
                  <AnimatePresence initial={false}>
                    {STORYTELLERS.map((storyteller, index) => {
                      const anim = getCardAnimation(index);
                      return (
                        <motion.div
                          key={storyteller.name}
                          animate={anim}
                          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                          className="absolute inset-0 origin-bottom"
                        >
                          <div className="relative w-full h-full rounded-3xl overflow-hidden shadow-2xl bg-[#EBE7DF] border border-black/5">
                            <Image
                              src={storyteller.image}
                              alt={storyteller.name}
                              fill
                              sizes="(max-width: 768px) 90vw, 430px"
                              draggable={false}
                              priority={index === 0}
                              className="object-cover object-center select-none"
                            />
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              </div>

              {/* RIGHT: Name, Role, Bio & Controls */}
              <div className="flex justify-between flex-col py-2 md:py-4 min-h-[260px] md:min-h-[360px]">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={active}
                    initial={{ y: 16, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -16, opacity: 0 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                  >
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-fraunces text-[#0F0F0F] tracking-tight">
                      {current.name}
                    </h2>
                    <p className="text-sm sm:text-base font-sans font-semibold text-[#C9281D] mt-1.5 tracking-wide">
                      {current.role}
                    </p>
                    <motion.p className="text-base sm:text-lg font-sans text-[#0F0F0F]/75 mt-6 sm:mt-8 leading-relaxed">
                      {current.bio.split(" ").map((word, i) => (
                        <motion.span
                          key={i}
                          initial={{ filter: "blur(8px)", opacity: 0, y: 4 }}
                          animate={{ filter: "blur(0px)", opacity: 1, y: 0 }}
                          transition={{ duration: 0.2, ease: "easeInOut", delay: 0.015 * i }}
                          className="inline-block"
                        >
                          {word}&nbsp;
                        </motion.span>
                      ))}
                    </motion.p>
                  </motion.div>
                </AnimatePresence>

                {/* Prev / Next Arrows */}
                <div className="flex gap-4 pt-6 sm:pt-8 md:pt-10">
                  <button
                    onClick={handlePrev}
                    aria-label="Previous storyteller"
                    className="h-10 w-10 sm:h-11 sm:w-11 rounded-full bg-[#EAE5D9] hover:bg-[#DED7C7] active:scale-95 flex items-center justify-center group/btn transition-all duration-200 cursor-pointer shadow-sm border border-black/5"
                  >
                    <ArrowLeft className="h-5 w-5 text-[#0F0F0F] group-hover/btn:-translate-x-0.5 transition-transform duration-200" />
                  </button>
                  <button
                    onClick={handleNext}
                    aria-label="Next storyteller"
                    className="h-10 w-10 sm:h-11 sm:w-11 rounded-full bg-[#EAE5D9] hover:bg-[#DED7C7] active:scale-95 flex items-center justify-center group/btn transition-all duration-200 cursor-pointer shadow-sm border border-black/5"
                  >
                    <ArrowRight className="h-5 w-5 text-[#0F0F0F] group-hover/btn:translate-x-0.5 transition-transform duration-200" />
                  </button>
                </div>
              </div>

            </div>
          </div>
        </main>

        {/* ── §2 Testimonials / Voices ── */}
        <section className="bg-[#FAF8F3] border-t border-[#E7E7E7] py-20 lg:py-28 overflow-hidden">
          <div className="max-w-[1340px] mx-auto px-6 sm:px-10">
            {/* Section Header */}
            <div className="mb-14 lg:mb-18 text-center">
              <span className="inline-block font-mono text-[11px] tracking-widest uppercase text-[#C9281D] mb-4 border border-[#C9281D]/30 rounded-full px-4 py-1.5">
                Voices
              </span>
              <h2 className="font-serif text-4xl sm:text-5xl lg:text-[60px] font-normal text-[#0F0F0F] tracking-[-0.03em] leading-[0.96] text-balance mb-5">
                Stories That Stay With You
              </h2>
              <p className="font-sans text-[16px] text-[#5A5A5A] max-w-[480px] mx-auto leading-[1.65]">
                Heard by educators, families, cultural voices, and communities from London to Hyderabad — this is how StoryHour's work has been experienced.
              </p>
            </div>

            {/* Three-Column Scrolling Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 h-[620px] sm:h-[680px] lg:h-[720px] relative">
              {/* Fade masks top and bottom */}
              <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-[#FAF8F3] to-transparent z-10 pointer-events-none" />
              <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#FAF8F3] to-transparent z-10 pointer-events-none" />

              {/* Column A — scrolls up, normal speed */}
              <TestimonialColumn
                items={COL_A}
                direction="up"
                duration={36}
                className="overflow-hidden h-full"
              />

              {/* Column B — scrolls down, slightly slower (offset start) */}
              <TestimonialColumn
                items={COL_B}
                direction="down"
                duration={44}
                className="overflow-hidden h-full hidden md:block"
              />

              {/* Column C — scrolls up, fastest (gives parallax depth) */}
              <TestimonialColumn
                items={COL_C}
                direction="up"
                duration={30}
                className="overflow-hidden h-full hidden lg:block"
              />
            </div>
          </div>
        </section>

        {/* ── §3 Featured Quote — Dr. Shashi Tharoor ── */}
        <section className="bg-[#0F0F0F] py-20 lg:py-28">
          <div className="max-w-[900px] mx-auto px-6 sm:px-10 text-center">
            <div className="border-l-[3px] border-[#C9281D] pl-8 text-left max-w-[760px] mx-auto">
              <blockquote className="font-serif text-[22px] sm:text-[26px] lg:text-[30px] text-white font-normal leading-[1.4] tracking-[-0.02em] text-balance">
                &ldquo;The research is commendable, and the ability to present a long and complex story in simple language is truly engaging. These stories make history and mythology accessible, meaningful, and memorable for listeners of all ages.&rdquo;
              </blockquote>
              <div className="mt-8 flex items-center gap-4">
                <div className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0 shadow-[0_4px_16px_rgba(0,0,0,0.4)] border border-white/20">
                  <Image
                    src="https://storyhour.co.uk/wp-content/uploads/2026/01/WhatsApp-Image-2026-01-19-at-17.30.26-1-1.jpeg"
                    alt="Dr. Shashi Tharoor"
                    fill
                    className="object-cover"
                    sizes="48px"
                  />
                </div>
                <div>
                  <p className="font-sans font-semibold text-[15px] text-white">Dr. Shashi Tharoor</p>
                  <p className="font-sans text-[13px] text-white/60">Author · Historian · Parliamentarian</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── StoryHour Standard Site Footer ── */}
        <SiteFooter />
      </div>
    </>
  );
}

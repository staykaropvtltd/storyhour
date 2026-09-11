"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Send,
  CheckCircle2,
  Plus,
  Minus,
  ArrowRight,
  Copy,
  Check,
  Theater,
  School,
  Users,
  MapPin,
  Sparkles,
} from "lucide-react";
import SiteNav from "@/components/SiteNav";

interface FaqItem {
  question: string;
  answer: string;
}

const FAQ_ITEMS: FaqItem[] = [
  {
    question: "How can I book a StoryHour performance?",
    answer:
      "You can send an enquiry using the form above or email info@storyhourglobal.com with your venue details, expected audience size, and preferred dates. We stage live classical retellings, puppet skits, and participatory storytelling circles across the United Kingdom and India.",
  },
  {
    question: "Do you work with schools?",
    answer:
      "Yes. StoryHour conducts hands-on school residencies, puppet drama masterclasses, and student skits at primary schools and academies, including past programmes with Spanish School London and Kendriya Vidyalaya. Our sessions are carefully adapted for children aged 5 to 12.",
  },
  {
    question: "Can I enquire about a storytelling event?",
    answer:
      "We regularly organise seasonal listening circles and festive performances (such as our Autumn Ramayana circles and Diwali specials). Select 'Performance / Booking' in the contact form or email our team directly for group admissions and schedules.",
  },
  {
    question: "Can we collaborate with StoryHour?",
    answer:
      "We warmly welcome collaborations with cultural educators, classical musicians, vocal artists, translators, and heritage institutions who share our commitment to preserving oral traditions and epics in Hindi, Telugu, and English.",
  },
  {
    question: "How can I contact the StoryHour team?",
    answer:
      "Our team reviews every submission thoughtfully and typically replies within 1 to 2 business days. You can use the contact form above, write to info@storyhourglobal.com, or reach out through our official channels in London and Hyderabad.",
  },
];

const ENQUIRY_TYPES = [
  "General Enquiry",
  "Performance / Booking",
  "School Enquiry",
  "Collaboration",
  "Press / Media",
  "Other",
];

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    enquiryType: "General Enquiry",
    message: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [copiedEmail, setCopiedEmail] = useState(false);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText("info@storyhourglobal.com");
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const validateForm = () => {
    const errs: Record<string, string> = {};
    if (!formData.name.trim() || formData.name.trim().length < 2) {
      errs.name = "Please enter your name.";
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim() || !emailRegex.test(formData.email.trim())) {
      errs.email = "Please enter a valid email address.";
    }
    if (!formData.message.trim() || formData.message.trim().length < 10) {
      errs.message = "Please enter a message with at least 10 characters.";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 500);
  };

  const handleReset = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      enquiryType: "General Enquiry",
      message: "",
    });
    setErrors({});
    setIsSubmitted(false);
  };

  const scrollToForm = () => {
    const el = document.getElementById("enquiry-form");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
      const nameInput = document.getElementById("name");
      nameInput?.focus();
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F3] text-[#050505] antialiased overflow-x-hidden">
      {/* ── 1. EXISTING STORYHOUR NAVBAR ── */}
      <SiteNav theme="light" activeLink="Contact" />

      <main className="flex-1">
        {/* ── 2. CONTACT HERO & CONTACT INFORMATION + FORM ── */}
        <section className="pt-10 sm:pt-14 lg:pt-16 pb-16 sm:pb-20">
          <div className="max-w-[1320px] mx-auto px-6 sm:px-10">
            {/* Editorial Contact Header Row (Matching Virto layout proportion) */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-10 sm:pb-12 border-b border-[#E8E4DC]">
              <div>
                <span className="font-mono text-[11px] uppercase tracking-widest text-[#2410A4] block mb-3 font-semibold">
                  CONTACT
                </span>
                <h1 className="font-serif text-4xl sm:text-5xl lg:text-[68px] font-normal text-[#050505] tracking-[-0.03em] leading-[0.98] text-balance">
                  Let&apos;s keep the stories going.
                </h1>
              </div>
              <p className="font-inter text-[15px] sm:text-[16px] text-[#696572] leading-[1.65] max-w-[480px]">
                Bring Indian mythology, live storytelling, and culture into your community or school. We are here to connect and collaborate.
              </p>
            </div>

            {/* TWO-COLUMN HORIZONTAL COMPOSITION (Left: Dark Card, Right: White Form Card) */}
            <div className="mt-10 sm:mt-12 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
              
              {/* LEFT: Dark StoryHour Contact Information Card (col-span-5) */}
              <div className="lg:col-span-5 bg-[#120A45] rounded-[24px] sm:rounded-[32px] p-8 sm:p-10 text-[#F7F4EE] shadow-xl border border-white/10 flex flex-col justify-between relative overflow-hidden">
                {/* Subtle ambient lighting */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#2410A4]/40 rounded-full blur-[80px] pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-56 h-56 bg-[#C9281D]/20 rounded-full blur-[70px] pointer-events-none" />

                <div className="relative z-10">
                  <span className="font-mono text-[11px] uppercase tracking-widest text-[#F7F4EE]/50 block mb-2 font-semibold">
                    DIRECT INQUIRIES
                  </span>
                  
                  <h2 className="font-serif text-3xl sm:text-[34px] font-normal text-[#F7F4EE] tracking-tight mb-3">
                    StoryHour Studio
                  </h2>

                  <p className="font-inter text-[14px] text-[#F7F4EE]/70 leading-relaxed mb-8">
                    Contact our creative team for audiobook enquiries, school residencies, theatre tours, and cultural partnerships.
                  </p>

                  {/* Official Email */}
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-8 backdrop-blur-sm">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="font-mono text-[10px] text-[#F7F4EE]/50 uppercase tracking-wider font-medium">
                        Official Email
                      </span>
                      <button
                        onClick={handleCopyEmail}
                        type="button"
                        aria-label="Copy official email"
                        className="inline-flex items-center gap-1 font-inter text-[11px] text-[#F7F4EE]/70 hover:text-white transition-colors cursor-pointer"
                      >
                        {copiedEmail ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-emerald-400 font-medium">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                    <a
                      href="mailto:info@storyhourglobal.com"
                      className="font-inter text-[17px] sm:text-[19px] font-semibold text-white hover:text-[#f3a8a3] transition-colors break-all"
                    >
                      info@storyhourglobal.com
                    </a>
                  </div>

                  {/* Relevant Enquiry Categories */}
                  <div className="space-y-4 mb-8">
                    <div className="flex items-start gap-3.5">
                      <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Theater className="w-4 h-4 text-[#F7F4EE]" />
                      </div>
                      <div>
                        <p className="font-inter text-[14px] font-medium text-white">
                          Performance &amp; Bookings
                        </p>
                        <p className="font-inter text-[12px] text-[#F7F4EE]/60 leading-relaxed">
                          Live stage, puppet theatre, and community listening circles.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3.5">
                      <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <School className="w-4 h-4 text-[#F7F4EE]" />
                      </div>
                      <div>
                        <p className="font-inter text-[14px] font-medium text-white">
                          Schools &amp; Education
                        </p>
                        <p className="font-inter text-[12px] text-[#F7F4EE]/60 leading-relaxed">
                          Interactive puppet masterclasses and school drama residencies.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3.5">
                      <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Users className="w-4 h-4 text-[#F7F4EE]" />
                      </div>
                      <div>
                        <p className="font-inter text-[14px] font-medium text-white">
                          Cultural Partnerships
                        </p>
                        <p className="font-inter text-[12px] text-[#F7F4EE]/60 leading-relaxed">
                          Classical arts documentation and diaspora storytelling programmes.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Locations (London, UK & Hyderabad, India) */}
                <div className="relative z-10 pt-6 border-t border-white/10">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="font-mono text-[10px] text-[#F7F4EE]/45 uppercase tracking-wider block mb-1">
                        Locations
                      </span>
                      <p className="font-inter text-[13px] text-white font-medium">
                        London, UK
                      </p>
                      <p className="font-inter text-[13px] text-white font-medium">
                        Hyderabad, India
                      </p>
                    </div>

                    <div>
                      <span className="font-mono text-[10px] text-[#F7F4EE]/45 uppercase tracking-wider block mb-1">
                        Verified Channels
                      </span>
                      <div className="space-y-0.5 font-inter text-[13px] text-[#F7F4EE]/75">
                        <p>IG: @storyhourglobal</p>
                        <p>YT: StoryHour UK</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT: Large Clean White Contact Form Card (col-span-7) */}
              <div
                id="enquiry-form"
                className="lg:col-span-7 bg-white rounded-[24px] sm:rounded-[32px] border border-[#E8E4DC] p-8 sm:p-10 lg:p-12 shadow-[0_4px_30px_rgba(5,5,5,0.04)] flex flex-col justify-between"
              >
                {isSubmitted ? (
                  /* Success Confirmation State */
                  <div className="my-auto py-12 text-center">
                    <div className="w-16 h-16 rounded-full bg-[#FAF8F3] border border-[#2410A4]/20 flex items-center justify-center mx-auto mb-6 text-[#2410A4]">
                      <CheckCircle2 className="w-8 h-8 text-[#2410A4]" />
                    </div>
                    
                    <h3 className="font-serif text-3xl sm:text-4xl font-normal text-[#050505] tracking-tight mb-3">
                      Thank you for reaching out
                    </h3>
                    
                    <p className="font-inter text-[15px] sm:text-[16px] text-[#696572] leading-relaxed max-w-[460px] mx-auto mb-8">
                      Your message has been received. Our team will review your enquiry and respond to <span className="font-semibold text-[#050505]">{formData.email}</span> within 1 to 2 business days.
                    </p>

                    <button
                      onClick={handleReset}
                      type="button"
                      className="px-8 py-3.5 rounded-full bg-[#2410A4] hover:bg-[#1B0C80] text-white font-inter font-medium text-[14px] transition-colors cursor-pointer shadow-md"
                    >
                      Send another message
                    </button>
                  </div>
                ) : (
                  /* Active Form */
                  <form onSubmit={handleSubmit} noValidate className="h-full flex flex-col justify-between">
                    <div>
                      <div className="mb-8">
                        <h2 className="font-serif text-2xl sm:text-3xl font-normal text-[#050505] tracking-tight mb-2">
                          Send an Enquiry
                        </h2>
                        <p className="font-inter text-[14px] text-[#696572] leading-relaxed">
                          Fill out the form below and we will get back to you with the appropriate details.
                        </p>
                      </div>

                      <div className="space-y-6">
                        {/* Name & Email Row */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                          <div>
                            <label
                              htmlFor="name"
                              className="block font-inter text-[13px] font-semibold text-[#050505] mb-2"
                            >
                              Your Name <span className="text-[#C9281D]">*</span>
                            </label>
                            <input
                              id="name"
                              type="text"
                              value={formData.name}
                              onChange={(e) => {
                                setFormData({ ...formData, name: e.target.value });
                                if (errors.name) setErrors({ ...errors, name: "" });
                              }}
                              placeholder="e.g. Neelima"
                              className={`w-full px-4 py-3.5 rounded-xl bg-[#FAF8F3] border ${
                                errors.name ? "border-[#C9281D]" : "border-[#E8E4DC]"
                              } text-[#050505] placeholder:text-[#696572]/50 font-inter text-[15px] focus:outline-none focus:border-[#2410A4] focus:ring-2 focus:ring-[#2410A4]/15 transition-all`}
                            />
                            {errors.name && (
                              <p className="font-inter text-[12px] text-[#C9281D] mt-1.5">
                                {errors.name}
                              </p>
                            )}
                          </div>

                          <div>
                            <label
                              htmlFor="email"
                              className="block font-inter text-[13px] font-semibold text-[#050505] mb-2"
                            >
                              Email Address <span className="text-[#C9281D]">*</span>
                            </label>
                            <input
                              id="email"
                              type="email"
                              value={formData.email}
                              onChange={(e) => {
                                setFormData({ ...formData, email: e.target.value });
                                if (errors.email) setErrors({ ...errors, email: "" });
                              }}
                              placeholder="e.g. neelima@example.com"
                              className={`w-full px-4 py-3.5 rounded-xl bg-[#FAF8F3] border ${
                                errors.email ? "border-[#C9281D]" : "border-[#E8E4DC]"
                              } text-[#050505] placeholder:text-[#696572]/50 font-inter text-[15px] focus:outline-none focus:border-[#2410A4] focus:ring-2 focus:ring-[#2410A4]/15 transition-all`}
                            />
                            {errors.email && (
                              <p className="font-inter text-[12px] text-[#C9281D] mt-1.5">
                                {errors.email}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Phone & Enquiry Type Row */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                          <div>
                            <label
                              htmlFor="phone"
                              className="block font-inter text-[13px] font-semibold text-[#050505] mb-2"
                            >
                              Phone Number <span className="text-[#696572] font-normal text-[12px]">(optional)</span>
                            </label>
                            <input
                              id="phone"
                              type="tel"
                              value={formData.phone}
                              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                              placeholder="+44 or +91..."
                              className="w-full px-4 py-3.5 rounded-xl bg-[#FAF8F3] border border-[#E8E4DC] text-[#050505] placeholder:text-[#696572]/50 font-inter text-[15px] focus:outline-none focus:border-[#2410A4] focus:ring-2 focus:ring-[#2410A4]/15 transition-all"
                            />
                          </div>

                          <div>
                            <label
                              htmlFor="enquiryType"
                              className="block font-inter text-[13px] font-semibold text-[#050505] mb-2"
                            >
                              Enquiry Type
                            </label>
                            <select
                              id="enquiryType"
                              value={formData.enquiryType}
                              onChange={(e) => setFormData({ ...formData, enquiryType: e.target.value })}
                              className="w-full px-4 py-3.5 rounded-xl bg-[#FAF8F3] border border-[#E8E4DC] text-[#050505] font-inter text-[15px] focus:outline-none focus:border-[#2410A4] focus:ring-2 focus:ring-[#2410A4]/15 transition-all cursor-pointer"
                            >
                              {ENQUIRY_TYPES.map((type) => (
                                <option key={type} value={type}>
                                  {type}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        {/* Message Textarea */}
                        <div>
                          <label
                            htmlFor="message"
                            className="block font-inter text-[13px] font-semibold text-[#050505] mb-2"
                          >
                            Message <span className="text-[#C9281D]">*</span>
                          </label>
                          <textarea
                            id="message"
                            rows={5}
                            value={formData.message}
                            onChange={(e) => {
                              setFormData({ ...formData, message: e.target.value });
                              if (errors.message) setErrors({ ...errors, message: "" });
                            }}
                            placeholder="Tell us about your school, upcoming performance date, audience size, or questions..."
                            className={`w-full px-4 py-3.5 rounded-xl bg-[#FAF8F3] border ${
                              errors.message ? "border-[#C9281D]" : "border-[#E8E4DC]"
                            } text-[#050505] placeholder:text-[#696572]/50 font-inter text-[15px] focus:outline-none focus:border-[#2410A4] focus:ring-2 focus:ring-[#2410A4]/15 transition-all resize-y`}
                          />
                          {errors.message && (
                            <p className="font-inter text-[12px] text-[#C9281D] mt-1.5">
                              {errors.message}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Primary Button */}
                    <div className="pt-8">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-4 px-8 rounded-full bg-[#2410A4] hover:bg-[#1B0C80] text-white font-inter font-medium text-[15px] transition-all flex items-center justify-center gap-2.5 shadow-md hover:shadow-lg disabled:opacity-75 cursor-pointer active:scale-[0.99]"
                      >
                        {isSubmitting ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            <span>Sending message...</span>
                          </>
                        ) : (
                          <>
                            <span>Send Message</span>
                            <Send className="w-4 h-4" />
                          </>
                        )}
                      </button>

                      <p className="font-inter text-[12px] text-[#696572] text-center mt-3">
                        By submitting this form, you agree to hear back from our team regarding your enquiry.
                      </p>
                    </div>
                  </form>
                )}
              </div>

            </div>
          </div>
        </section>

        {/* ── 3. FULL-WIDTH LOCATION SECTION ── */}
        <section className="py-16 sm:py-20 bg-[#F7F4EE] border-t border-[#E8E4DC]">
          <div className="max-w-[1320px] mx-auto px-6 sm:px-10">
            {/* Section Heading & Subtitle */}
            <div className="max-w-[720px] mb-10 sm:mb-12">
              <span className="font-mono text-[11px] uppercase tracking-widest text-[#2410A4] block mb-2 font-semibold">
                GLOBAL REACH
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-[42px] font-normal text-[#050505] tracking-tight leading-[1.1] mb-3">
                StoryHour across the UK &amp; India
              </h2>
              <p className="font-inter text-[15px] text-[#696572] leading-relaxed">
                StoryHour operates across two dedicated creative hubs, connecting traditional Indian folklore, Sanskrit epics, and participatory storytelling circles worldwide.
              </p>
            </div>

            {/* TWO LOCATION CARDS SIDE-BY-SIDE */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
              
              {/* United Kingdom Location Card */}
              <div className="bg-white rounded-3xl border border-[#E8E4DC] p-8 sm:p-10 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-4 mb-4">
                    <span className="font-mono text-[11px] uppercase tracking-widest text-[#C9281D] font-bold">
                      UNITED KINGDOM
                    </span>
                    <span className="font-inter text-[12px] text-[#696572] bg-[#FAF8F3] border border-[#E8E4DC] px-3 py-1 rounded-full font-medium">
                      London Hub
                    </span>
                  </div>

                  <h3 className="font-serif text-2xl sm:text-3xl font-normal text-[#050505] mb-3">
                    London &amp; Diaspora Performances
                  </h3>

                  <p className="font-inter text-[14px] text-[#696572] leading-relaxed mb-6">
                    Creative direction, English epic narrations, school residencies (including Spanish School London), and seasonal listening circles at community cultural halls.
                  </p>
                </div>

                <div className="pt-5 border-t border-[#E8E4DC] flex items-center justify-between text-[13px] font-inter text-[#050505]">
                  <span className="text-[#696572]">Focus Areas</span>
                  <span className="font-medium text-[#2410A4]">Audiobooks · Schools · Festivals</span>
                </div>
              </div>

              {/* India Location Card */}
              <div className="bg-white rounded-3xl border border-[#E8E4DC] p-8 sm:p-10 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-4 mb-4">
                    <span className="font-mono text-[11px] uppercase tracking-widest text-[#2410A4] font-bold">
                      INDIA
                    </span>
                    <span className="font-inter text-[12px] text-[#696572] bg-[#FAF8F3] border border-[#E8E4DC] px-3 py-1 rounded-full font-medium">
                      Hyderabad Hub
                    </span>
                  </div>

                  <h3 className="font-serif text-2xl sm:text-3xl font-normal text-[#050505] mb-3">
                    Hyderabad &amp; Heritage Productions
                  </h3>

                  <p className="font-inter text-[14px] text-[#696572] leading-relaxed mb-6">
                    Sanskrit textual research, Hindi &amp; Telugu ensemble recordings, traditional puppet troupe masterclasses, and Kendriya Vidyalaya educational workshops.
                  </p>
                </div>

                <div className="pt-5 border-t border-[#E8E4DC] flex items-center justify-between text-[13px] font-inter text-[#050505]">
                  <span className="text-[#696572]">Focus Areas</span>
                  <span className="font-medium text-[#2410A4]">Classical Research · Puppetry · Skits</span>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ── 4. FAQ SECTION (Inspired by Virto Reference: Left CTA Card, Right Clean Accordion) ── */}
        <section className="py-20 lg:py-24 bg-[#FAF8F3] border-t border-[#E8E4DC]">
          <div className="max-w-[1320px] mx-auto px-6 sm:px-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
              
              {/* LEFT COLUMN: FAQ Title & StoryHour Contact CTA Card */}
              <div className="lg:col-span-5">
                <span className="font-mono text-[11px] uppercase tracking-widest text-[#2410A4] block mb-2 font-semibold">
                  COMMON QUESTIONS
                </span>
                
                <h2 className="font-serif text-4xl sm:text-5xl lg:text-[56px] font-normal text-[#050505] tracking-tight leading-[1] mb-4">
                  FAQ
                </h2>
                
                <p className="font-inter text-[15px] text-[#696572] leading-relaxed mb-8 max-w-[400px]">
                  Everything you need to know about booking StoryHour performances, school workshops, and cultural collaborations.
                </p>

                {/* Small StoryHour Contact CTA Card (matching Virto reference "Have an idea? Let's talk") */}
                <div className="bg-[#120A45] rounded-3xl p-7 text-[#F7F4EE] shadow-lg border border-white/10 relative overflow-hidden">
                  <div className="absolute -right-8 -bottom-8 w-36 h-36 bg-[#2410A4]/40 rounded-full blur-[40px] pointer-events-none" />
                  
                  <div className="relative z-10">
                    <p className="font-serif text-2xl font-normal text-white mb-2">
                      Have a custom idea?
                    </p>
                    <p className="font-inter text-[13px] text-[#F7F4EE]/70 leading-relaxed mb-6">
                      Looking for a tailored festival skit, corporate cultural storytelling, or school assembly? Let&apos;s shape a bespoke session together.
                    </p>
                    <button
                      type="button"
                      onClick={scrollToForm}
                      className="px-6 py-3 rounded-full bg-white text-[#120A45] hover:bg-[#F7F4EE] font-inter font-medium text-[13px] transition-colors cursor-pointer inline-flex items-center gap-2 shadow-sm"
                    >
                      <span>Send an enquiry</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: Clean Accordion FAQ List with Plus/Minus Toggle */}
              <div className="lg:col-span-7 divide-y divide-[#E8E4DC] border-y border-[#E8E4DC]">
                {FAQ_ITEMS.map((item, index) => {
                  const isOpen = openFaq === index;
                  return (
                    <div key={item.question} className="py-6 transition-colors">
                      <button
                        type="button"
                        onClick={() => setOpenFaq(isOpen ? null : index)}
                        aria-expanded={isOpen}
                        className="w-full text-left flex items-center justify-between gap-4 cursor-pointer select-none group"
                      >
                        <span className="font-serif text-[19px] sm:text-[21px] font-normal text-[#050505] tracking-tight group-hover:text-[#2410A4] transition-colors">
                          {item.question}
                        </span>
                        
                        {/* Plus / Minus Indicator Button */}
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                            isOpen ? "bg-[#050505] text-white" : "bg-[#FAF8F3] border border-[#E8E4DC] text-[#050505] group-hover:border-[#050505]"
                          }`}
                        >
                          {isOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                        </div>
                      </button>

                      {isOpen && (
                        <div className="pt-4 pr-12">
                          <p className="font-inter text-[15px] text-[#696572] leading-[1.7]">
                            {item.answer}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

            </div>
          </div>
        </section>
      </main>

      {/* ── 5. EXISTING STORYHOUR FOOTER (Exact Match to Homepage) ── */}
      <footer id="contact" className="bg-[#120A45] pt-16 pb-10 scroll-mt-14 mt-auto">
        <div className="max-w-[1320px] mx-auto px-6 sm:px-10">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-10 pb-14 border-b border-white/10">
            <div className="col-span-2 sm:col-span-1">
              <div className="relative h-7 w-28 mb-5 brightness-0 invert opacity-90">
                <Image
                  src="https://storyhour.co.uk/wp-content/uploads/2026/01/tp-logo.png"
                  alt="StoryHour"
                  fill
                  className="object-contain object-left"
                  sizes="120px"
                />
              </div>
              <p className="font-inter text-[13px] text-[#F7F4EE]/50 leading-[1.65] max-w-[200px]">
                Indian mythology and culture brought to life through soulful storytelling.
              </p>
              <div className="mt-5">
                <span className="font-mono text-[11px] text-[#F7F4EE]/35">London and Hyderabad</span>
              </div>
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
            <p className="font-inter text-[13px] text-[#F7F4EE]/35">
              © 2026 StoryHour. All rights reserved.
            </p>
            <p className="font-inter text-[13px] text-[#F7F4EE]/35">Available worldwide</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

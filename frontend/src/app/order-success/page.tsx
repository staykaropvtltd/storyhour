"use client";

import React, { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import BookReader from "@/components/BookReader";
import AudiobookModal from "@/components/AudiobookModal";
import { useLibraryCart, Order } from "@/context/LibraryCartContext";
import { getEditionById, getAudiobookById, Edition, Audiobook } from "@/data/editions-data";
import {
  CheckCircle2,
  BookOpen,
  Headphones,
  ShoppingBag,
  ArrowRight,
  Mail,
  ShieldCheck,
  Calendar,
  CreditCard,
  ExternalLink,
} from "lucide-react";

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const { orders, getOrderById } = useLibraryCart();

  const [activeBookReader, setActiveBookReader] = useState<Edition | null>(null);
  const [activeAudiobook, setActiveAudiobook] = useState<Audiobook | null>(null);

  // Retrieve current order or fallback to most recent order
  const currentOrder: Order | undefined = orderId
    ? getOrderById(orderId)
    : orders && orders.length > 0
    ? orders[0]
    : undefined;

  const handleOpenBook = (itemId: string) => {
    const edition = getEditionById(itemId);
    if (edition) {
      setActiveBookReader(edition);
      return;
    }
    const audiobook = getAudiobookById(itemId);
    if (audiobook) {
      setActiveAudiobook(audiobook);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F3] text-[#0f0f0f] selection:bg-[#C9281D] selection:text-white">
      <SiteHeader activeLink="Shop" />

      {/* 1. Celebratory Hero Header (Cerulean Sky, Sunshine Glow, Home Hero Style) */}
      <section className="relative w-full bg-[#3b9dfb] pt-28 sm:pt-36 pb-20 sm:pb-24 px-4 sm:px-6 overflow-hidden select-none">
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

        <div className="relative z-10 max-w-3xl mx-auto text-center flex flex-col items-center">
          {/* Success Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/20 backdrop-blur-md border border-white/40 text-white font-sans text-xs font-bold uppercase tracking-wider mb-4 shadow-sm">
            <CheckCircle2 className="w-4 h-4 text-emerald-300" />
            <span>Order Confirmed · Digital Access Granted</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight leading-[1.08] drop-shadow-sm">
            Your Books Are Unlocked!
          </h1>
          <p className="mt-3 text-white/95 font-medium text-base sm:text-lg max-w-md leading-relaxed">
            Thank you for bringing StoryHour into your home. Your digital editions are now fully accessible with 3D turning animations.
          </p>

          {currentOrder && (
            <div className="mt-5 inline-flex items-center gap-3 px-5 py-2 rounded-full bg-black/20 backdrop-blur-sm border border-white/20 text-white font-mono text-xs sm:text-sm">
              <span className="text-white/70">Order Number:</span>
              <span className="font-black text-[#FFF9E6]">{currentOrder.orderNumber}</span>
            </div>
          )}
        </div>

        {/* Organic hill wave transition at bottom connecting seamlessly to #FAF8F3 cream backdrop */}
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

      {/* 2. Main Order Confirmation Details */}
      <main className="flex-1 max-w-[1080px] w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 mb-20 relative z-20 space-y-8">
        {currentOrder ? (
          <>
            {/* Unlocked Books Grid */}
            <div className="bg-white rounded-3xl border border-black/5 shadow-[0_16px_40px_rgba(0,0,0,0.06)] p-6 sm:p-9 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-black/5">
                <div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-[#0f0f0f]">
                    Your Unlocked Digital Library
                  </h2>
                  <p className="text-xs sm:text-sm text-[#5a5a5a] mt-0.5">
                    Click any book below to open the full 3D interactive reader with all pages accessible.
                  </p>
                </div>
                <span className="hidden sm:inline-block px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold font-mono">
                  {currentOrder.items.length} {currentOrder.items.length === 1 ? "Edition" : "Editions"} Ready
                </span>
              </div>

              {/* Product Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                {currentOrder.items.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 sm:p-5 rounded-2xl bg-[#FAF8F3] border border-black/5 hover:border-[#C9281D]/40 transition-all flex items-center justify-between gap-4 shadow-xs hover:shadow-md"
                  >
                    <div className="flex items-center gap-3.5 min-w-0 flex-1">
                      <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden flex-shrink-0 bg-white border border-black/10 shadow-sm">
                        <Image
                          src={item.coverImage}
                          alt={item.title}
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="inline-block px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[9.5px] font-mono font-bold uppercase tracking-wider mb-1">
                          ✓ UNLOCKED
                        </span>
                        <h3 className="font-serif text-sm sm:text-base font-bold text-[#0f0f0f] truncate">
                          {item.title}
                        </h3>
                        <p className="text-xs text-[#7A756D]">{item.format}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleOpenBook(item.id)}
                      className="px-4 py-2.5 rounded-full bg-gradient-to-r from-[#DE3124] via-[#C9281D] to-[#B01E14] hover:from-[#EA3A2D] hover:via-[#D6281D] hover:to-[#BC2218] text-white font-sans text-xs sm:text-sm font-bold shadow-[0_4px_14px_rgba(201,40,29,0.3)] hover:shadow-[0_6px_18px_rgba(201,40,29,0.45)] transition-all hover:scale-105 active:scale-95 flex items-center gap-1.5 flex-shrink-0 cursor-pointer"
                    >
                      <BookOpen className="w-4 h-4" />
                      <span>Read Book</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Receipt & Customer Summary Card */}
            <div className="bg-white rounded-3xl border border-black/5 shadow-[0_8px_30px_rgba(0,0,0,0.05)] p-6 sm:p-8">
              <h3 className="text-lg font-bold text-[#0f0f0f] mb-4 pb-3 border-b border-black/5 flex items-center justify-between">
                <span>Receipt &amp; Confirmation</span>
                <span className="text-xs font-mono text-[#7A756D]">
                  {new Date(currentOrder.createdAt).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 text-xs font-sans">
                <div>
                  <span className="text-[#7A756D] uppercase tracking-wider block font-bold mb-1">
                    Customer
                  </span>
                  <p className="font-bold text-[#0f0f0f] text-sm">{currentOrder.customer.fullName}</p>
                  <p className="text-[#5a5a5a] mt-0.5 flex items-center gap-1">
                    <Mail className="w-3 h-3 text-[#C9281D]" />
                    {currentOrder.customer.email}
                  </p>
                </div>

                <div>
                  <span className="text-[#7A756D] uppercase tracking-wider block font-bold mb-1">
                    Payment Method
                  </span>
                  <p className="font-bold text-[#0f0f0f] text-sm">
                    {currentOrder.paymentMethod}
                  </p>
                  <p className="text-emerald-600 mt-0.5 font-bold flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    Authorized in Safe Test Mode
                  </p>
                </div>

                <div>
                  <span className="text-[#7A756D] uppercase tracking-wider block font-bold mb-1">
                    Total Amount Paid
                  </span>
                  <p className="font-serif text-2xl font-black text-[#0f0f0f]">
                    ${currentOrder.total.toFixed(2)}
                  </p>
                  <p className="text-[#7A756D]">USD · One-Time Lifetime License</p>
                </div>
              </div>

              {/* Navigation CTAs */}
              <div className="mt-8 pt-6 border-t border-black/5 flex flex-wrap items-center justify-between gap-4">
                <Link
                  href="/stories"
                  className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-[#0E1638] hover:bg-gradient-to-r hover:from-[#DE3124] hover:to-[#C9281D] text-white font-bold text-sm transition-all shadow-[0_4px_14px_rgba(14,22,56,0.2)] hover:shadow-[0_6px_18px_rgba(201,40,29,0.35)] hover:-translate-y-0.5 active:translate-y-0"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Continue Exploring More Stories</span>
                </Link>

                <Link
                  href="/"
                  className="text-sm font-bold text-[#7A756D] hover:text-[#0f0f0f] transition-colors"
                >
                  Return to Home
                </Link>
              </div>
            </div>
          </>
        ) : (
          <div className="bg-white rounded-3xl border border-black/5 shadow-[0_16px_40px_rgba(0,0,0,0.06)] p-8 sm:p-12 text-center max-w-lg mx-auto">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
            <h2 className="text-2xl font-extrabold text-[#0f0f0f]">Purchase Confirmed!</h2>
            <p className="text-sm text-[#5a5a5a] mt-2">
              Your books have been unlocked. Head to the Shop page to view and read your editions.
            </p>
            <Link
              href="/stories"
              className="mt-6 inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-gradient-to-r from-[#DE3124] via-[#C9281D] to-[#991B1B] hover:from-[#EA3A2D] hover:to-[#B01E14] text-white font-bold text-sm shadow-[0_8px_22px_rgba(201,40,29,0.35)] transition-all hover:scale-105 active:scale-95"
            >
              <span>Go to StoryHour Editions</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </main>

      {/* 3. In-Page Book Reader Modal for instant reading upon purchase */}
      {activeBookReader && (
        <BookReader
          edition={activeBookReader}
          onClose={() => setActiveBookReader(null)}
        />
      )}

      {/* 4. In-Page Audiobook Modal */}
      {activeAudiobook && (
        <AudiobookModal
          audiobook={activeAudiobook}
          onClose={() => setActiveAudiobook(null)}
        />
      )}

      <SiteFooter />
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#FAF8F3]">
          <div className="text-center space-y-3">
            <div className="w-10 h-10 border-4 border-[#C9281D] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm font-bold text-[#0f0f0f]">Loading your confirmed order…</p>
          </div>
        </div>
      }
    >
      <OrderSuccessContent />
    </Suspense>
  );
}

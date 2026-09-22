"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { useLibraryCart, CartItem } from "@/context/LibraryCartContext";
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  BookOpen,
  Headphones,
  Sparkles,
} from "lucide-react";

export default function CartPage() {
  const { cartItems, updateQuantity, removeFromCart, cartTotal, cartCount } = useLibraryCart();
  const router = useRouter();

  const subtotal = cartTotal;
  const tax = 0.0; // Digital educational content tax exemption
  const finalTotal = subtotal + tax;

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F3] text-[#0f0f0f] selection:bg-[#C9281D] selection:text-white">
      <SiteHeader activeLink="Cart" />

      {/* 1. Playful StoryHour Hero Header (Cerulean Sky, Cloud Waves, Home Hero Aesthetic) */}
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

        {/* Hero Title & Stepper Container */}
        <div className="relative z-10 max-w-4xl mx-auto text-center flex flex-col items-center">
          {/* Step pill indicator */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white font-sans text-xs font-bold uppercase tracking-wider mb-4 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-[#C9281D] animate-pulse" />
            <span>Step 1 of 3: Cart Review</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight leading-[1.08] drop-shadow-sm">
            Your StoryHour Cart
          </h1>
          <p className="mt-3 text-white/90 font-medium text-base sm:text-lg max-w-lg leading-relaxed">
            Review your selected digital editions, ancient epics, and audiobooks before unlocking full reading access.
          </p>
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

      {/* 2. Main Cart Content Area */}
      <main className="flex-1 max-w-[1280px] w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 mb-20 relative z-20">
        {cartItems.length === 0 ? (
          /* ── EMPTY CART STATE ── */
          <div className="bg-white rounded-3xl border border-black/5 shadow-[0_16px_40px_rgba(0,0,0,0.06)] p-8 sm:p-14 text-center max-w-2xl mx-auto flex flex-col items-center">
            <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-tr from-[#C9281D]/15 to-[#3b9dfb]/20 flex items-center justify-center mb-6 shadow-inner">
              <ShoppingBag className="w-12 h-12 text-[#C9281D]" />
              <div className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-gradient-to-tr from-[#DE3124] to-[#C9281D] text-white flex items-center justify-center text-xs font-bold shadow-md">
                0
              </div>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0f0f0f] tracking-tight">
              Your Cart is Currently Empty
            </h2>
            <p className="mt-2 text-[#5a5a5a] text-sm sm:text-base max-w-md leading-relaxed">
              Explore our master editions of Valmiki’s Ramayana, inspiring fables, and spoken audiobooks crafted for calm, family listening.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/stories"
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-gradient-to-r from-[#DE3124] via-[#C9281D] to-[#991B1B] hover:from-[#E6392D] hover:to-[#B52218] text-white font-bold text-sm sm:text-base transition-all shadow-[0_8px_20px_rgba(201,40,29,0.32)] hover:shadow-[0_12px_28px_rgba(201,40,29,0.45)] hover:-translate-y-0.5 active:translate-y-0 focus:outline-none focus:ring-4 focus:ring-[#C9281D]/30"
              >
                <BookOpen className="w-4 h-4" />
                <span>Explore Books &amp; Editions</span>
              </Link>
              <Link
                href="/#hero"
                className="inline-flex items-center justify-center px-7 py-3.5 rounded-full bg-white hover:bg-gray-50 text-[#0f0f0f] font-bold text-sm sm:text-base border border-black/10 transition-all shadow-sm hover:shadow hover:-translate-y-0.5 active:translate-y-0"
              >
                <span>Back to Home</span>
              </Link>
            </div>
          </div>
        ) : (
          /* ── ACTIVE CART: 2-COLUMN LAYOUT ── */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Cart Items (8 cols on lg) */}
            <div className="lg:col-span-8 space-y-4">
              <div className="flex items-center justify-between px-2 pb-2 border-b border-black/5">
                <h2 className="text-xl sm:text-2xl font-extrabold text-[#0f0f0f] flex items-center gap-2.5">
                  <span>Selected Editions</span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#FDF2F0] text-[#C9281D] font-mono font-bold border border-[#C9281D]/20">
                    {cartCount} {cartCount === 1 ? "Item" : "Items"}
                  </span>
                </h2>
                <Link
                  href="/stories"
                  className="text-sm font-bold text-[#C9281D] hover:text-[#B52218] flex items-center gap-1 transition-colors"
                >
                  <span>Continue Shopping</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Items List */}
              <div className="space-y-3.5">
                {cartItems.map((item: CartItem) => {
                  const isAudio = item.type === "audiobook" || item.id.startsWith("ab-");
                  return (
                    <div
                      key={item.id}
                      className="bg-white rounded-2xl sm:rounded-3xl border border-black/5 shadow-[0_6px_24px_rgba(0,0,0,0.04)] p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6 hover:shadow-[0_10px_32px_rgba(0,0,0,0.08)] transition-all"
                    >
                      {/* Product Thumbnail & Core Details */}
                      <div className="flex items-center gap-4 min-w-0 flex-1">
                        {/* 3D Visual Box / CD */}
                        <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden flex-shrink-0 bg-[#FAF8F3] border border-black/10 shadow-md">
                          <Image
                            src={item.coverImage}
                            alt={item.title}
                            fill
                            className="object-cover"
                            sizes="96px"
                          />
                          {/* Spine/Edge Highlight */}
                          <div className="absolute inset-0 bg-gradient-to-tr from-black/20 via-transparent to-white/20 pointer-events-none" />
                          {isAudio && (
                            <div className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center">
                              <Headphones className="w-3 h-3 text-[#C9281D]" />
                            </div>
                          )}
                        </div>

                        {/* Title & Metadata */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="px-2 py-0.5 rounded-full bg-[#FDF2F0] text-[#C9281D] text-[10px] font-mono font-bold uppercase tracking-wider border border-[#C9281D]/20">
                              {item.format}
                            </span>
                            <span className="text-[11px] font-mono text-[#7A756D]">
                              {item.language}
                            </span>
                          </div>

                          <h3 className="font-serif text-base sm:text-lg font-bold text-[#0f0f0f] truncate leading-tight">
                            {item.title}
                          </h3>

                          {item.nativeTitle && (
                            <p className="font-serif text-xs text-[#7A756D] italic truncate mt-0.5">
                              {item.nativeTitle}
                            </p>
                          )}

                          <p className="text-xs text-[#5a5a5a] mt-1 font-sans">
                            {item.authorOrNarrator}
                          </p>

                          <div className="mt-2 sm:hidden flex items-center justify-between">
                            <span className="font-mono text-base font-extrabold text-[#0f0f0f]">
                              ${(item.price * item.quantity).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Quantity Stepper & Price Column */}
                      <div className="flex items-center justify-between w-full sm:w-auto sm:justify-end gap-5 pt-3 sm:pt-0 border-t sm:border-t-0 border-black/5">
                        {/* Quantity Stepper */}
                        <div className="flex items-center bg-[#FAF8F3] rounded-full p-1 border border-black/10 shadow-inner">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-8 h-8 rounded-full bg-white hover:bg-gray-100 text-[#0f0f0f] flex items-center justify-center shadow-xs transition-transform active:scale-90"
                            aria-label={`Decrease quantity of ${item.title}`}
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-9 text-center font-mono text-sm font-bold text-[#0f0f0f]">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-8 h-8 rounded-full bg-white hover:bg-gray-100 text-[#0f0f0f] flex items-center justify-center shadow-xs transition-transform active:scale-90"
                            aria-label={`Increase quantity of ${item.title}`}
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Item Total Price */}
                        <div className="hidden sm:block text-right min-w-[90px]">
                          <span className="font-mono text-lg font-extrabold text-[#0f0f0f] block">
                            ${(item.price * item.quantity).toFixed(2)}
                          </span>
                          {item.quantity > 1 && (
                            <span className="text-[11px] font-mono text-[#7A756D] block">
                              ${item.price.toFixed(2)} each
                            </span>
                          )}
                        </div>

                        {/* Remove Action */}
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="w-9 h-9 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-600 flex items-center justify-center transition-colors shadow-xs"
                          title="Remove item"
                          aria-label={`Remove ${item.title} from cart`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Column: Order Summary Card (4 cols on lg, sticky) */}
            <div className="lg:col-span-4 sticky top-24">
              <div className="bg-white rounded-3xl border border-black/5 shadow-[0_16px_40px_rgba(0,0,0,0.08)] p-6 sm:p-7 space-y-6">
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#0f0f0f] border-b border-black/5 pb-4">
                  Order Summary
                </h3>

                <div className="space-y-3 font-sans text-sm">
                  <div className="flex justify-between items-center text-[#5a5a5a]">
                    <span>Items Subtotal ({cartCount})</span>
                    <span className="font-mono font-bold text-[#0f0f0f]">
                      ${subtotal.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-[#5a5a5a]">
                    <span className="flex items-center gap-1.5">
                      <span>Digital Unlocking &amp; Delivery</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 font-bold">
                        FREE
                      </span>
                    </span>
                    <span className="font-mono font-bold text-emerald-600">$0.00</span>
                  </div>

                  <div className="flex justify-between items-center text-[#5a5a5a]">
                    <span>Estimated Tax</span>
                    <span className="font-mono font-bold text-[#0f0f0f]">
                      ${tax.toFixed(2)}
                    </span>
                  </div>

                  <div className="pt-4 border-t border-black/10 flex justify-between items-baseline">
                    <span className="text-base font-extrabold text-[#0f0f0f]">Total</span>
                    <div className="text-right">
                      <span className="font-serif text-3xl font-extrabold text-[#0f0f0f] block leading-none">
                        ${finalTotal.toFixed(2)}
                      </span>
                      <span className="text-[11px] font-mono text-[#7A756D]">USD · One-time payment</span>
                    </div>
                  </div>
                </div>

                {/* Primary CTA */}
                <button
                  onClick={() => router.push("/checkout")}
                  className="w-full py-4 rounded-full bg-gradient-to-r from-[#DE3124] via-[#C9281D] to-[#991B1B] hover:from-[#E6392D] hover:to-[#B52218] text-white font-extrabold text-base transition-all duration-200 shadow-[0_10px_26px_rgba(201,40,29,0.42)] hover:shadow-[0_14px_32px_rgba(201,40,29,0.55)] hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2.5 cursor-pointer focus:outline-none focus:ring-4 focus:ring-[#C9281D]/30"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </button>

                {/* Security Note */}
                <p className="text-[11.5px] text-[#7A756D] text-center leading-relaxed">
                  🔒 Safe &amp; verified checkout. Digital editions are unlocked in your account immediately after payment confirmation.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}

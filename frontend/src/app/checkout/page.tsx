"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { useLibraryCart, CartItem } from "@/context/LibraryCartContext";
import {
  ShieldCheck,
  Lock,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  BookOpen,
  Headphones,
  User,
  Mail,
  Phone,
  MapPin,
  Globe,
  Loader2,
  Info,
} from "lucide-react";

export default function CheckoutPage() {
  const { cartItems, cartTotal, cartCount, createOrder } = useLibraryCart();
  const router = useRouter();

  // Form states
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [stateProvince, setStateProvince] = useState("");
  const [country, setCountry] = useState("United Kingdom");
  const [postalCode, setPostalCode] = useState("");

  // Simulated card states
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvc, setCardCvc] = useState("");

  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const subtotal = cartTotal;
  const tax = 0.0;
  const finalTotal = subtotal + tax;

  const handleCompletePayment = (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim() || !email.trim()) {
      setErrorMessage("Please enter your name and email address to receive your digital book access.");
      return;
    }

    if (!email.includes("@") || !email.includes(".")) {
      setErrorMessage("Please provide a valid email address.");
      return;
    }

    setErrorMessage(null);
    setIsProcessing(true);

    // Prepare order items
    const orderItems = cartItems.map((ci) => ({
      id: ci.id,
      title: ci.title,
      format: ci.format,
      price: ci.price,
      quantity: ci.quantity,
      coverImage: ci.coverImage,
      type: ci.type,
    }));

    // Simulate safe transaction processing (1.4s)
    setTimeout(() => {
      try {
        const order = createOrder({
          customer: {
            fullName: fullName.trim(),
            email: email.trim(),
            phone: phone.trim() || "Not provided",
          },
          billing: {
            address: address.trim() || "Digital Delivery Address",
            city: city.trim() || "London",
            state: stateProvince.trim() || "Greater London",
            country,
            postalCode: postalCode.trim() || "W8 4PT",
          },
          items: orderItems,
          subtotal,
          tax,
          total: finalTotal,
          paymentMethod: "Safe Sandbox Simulation (Verified)",
        });

        router.push(`/order-success?orderId=${order.orderId}`);
      } catch (err) {
        console.error("Order creation failed", err);
        setIsProcessing(false);
        setErrorMessage("Something went wrong while completing your purchase. Please try again.");
      }
    }, 1400);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F3] text-[#0f0f0f] selection:bg-[#C9281D] selection:text-white">
      <SiteHeader activeLink="Cart" />

      {/* 1. Playful StoryHour Hero Header (Cerulean Sky, Cloud Waves, Home Hero Visual Style) */}
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
            <span>Step 2 of 3: Checkout &amp; Payment</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight leading-[1.08] drop-shadow-sm">
            Complete Your Purchase
          </h1>
          <p className="mt-3 text-white/90 font-medium text-base sm:text-lg max-w-lg leading-relaxed">
            Enter your details below to finalize your order and immediately unlock all pages in your digital book reader.
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

      {/* 2. Main Checkout Form & Summary Area */}
      <main className="flex-1 max-w-[1280px] w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 mb-20 relative z-20">
        {cartItems.length === 0 ? (
          /* Empty state if user navigates directly without items */
          <div className="bg-white rounded-3xl border border-black/5 shadow-[0_16px_40px_rgba(0,0,0,0.06)] p-8 sm:p-14 text-center max-w-xl mx-auto">
            <h2 className="text-2xl font-extrabold text-[#0f0f0f]">No Items in Cart</h2>
            <p className="mt-2 text-[#5a5a5a] text-sm">
              Please add a book or audiobook to your cart before proceeding to checkout.
            </p>
            <Link
              href="/stories"
              className="mt-6 inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-gradient-to-r from-[#DE3124] via-[#C9281D] to-[#991B1B] hover:from-[#E6392D] hover:to-[#B52218] text-white font-bold text-sm shadow-[0_6px_20px_rgba(201,40,29,0.32)] transition-all"
            >
              <BookOpen className="w-4 h-4" />
              <span>Browse Editions</span>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleCompletePayment} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Customer Details, Billing Details, Payment (8 cols on lg) */}
            <div className="lg:col-span-8 space-y-6">
              {/* Error banner if any */}
              {errorMessage && (
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* 1. Customer Details Card */}
              <div className="bg-white rounded-3xl border border-black/5 shadow-[0_8px_30px_rgba(0,0,0,0.05)] p-6 sm:p-8 space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-black/5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-[#FDF2F0] text-[#C9281D] border border-[#C9281D]/20 flex items-center justify-center font-bold text-sm shadow-xs">
                      1
                    </div>
                    <h2 className="text-lg sm:text-xl font-bold text-[#0f0f0f]">
                      Customer Information
                    </h2>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-[#0f0f0f] uppercase tracking-wider mb-1.5">
                      Full Name <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. Aarav & Priya Sharma"
                        className="w-full px-4 py-3 rounded-xl bg-[#FAF8F3] border border-black/10 text-sm font-sans text-[#0f0f0f] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C9281D] focus:bg-white transition-colors"
                      />
                      <User className="absolute right-3.5 top-3.5 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#0f0f0f] uppercase tracking-wider mb-1.5">
                      Email Address <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full px-4 py-3 rounded-xl bg-[#FAF8F3] border border-black/10 text-sm font-sans text-[#0f0f0f] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C9281D] focus:bg-white transition-colors"
                      />
                      <Mail className="absolute right-3.5 top-3.5 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                    <span className="text-[11px] text-[#7A756D] mt-1 block">
                      Digital book keys &amp; receipt will be sent here
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#0f0f0f] uppercase tracking-wider mb-1.5">
                      Phone Number (Optional)
                    </label>
                    <div className="relative">
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+44 7700 900077"
                        className="w-full px-4 py-3 rounded-xl bg-[#FAF8F3] border border-black/10 text-sm font-sans text-[#0f0f0f] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C9281D] focus:bg-white transition-colors"
                      />
                      <Phone className="absolute right-3.5 top-3.5 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                    <span className="text-[11px] text-[#7A756D] mt-1 block">
                      For optional order and release alerts
                    </span>
                  </div>
                </div>
              </div>

              {/* 2. Billing Address Card */}
              <div className="bg-white rounded-3xl border border-black/5 shadow-[0_8px_30px_rgba(0,0,0,0.05)] p-6 sm:p-8 space-y-5">
                <div className="flex items-center gap-2.5 pb-3 border-b border-black/5">
                  <div className="w-8 h-8 rounded-full bg-[#FDF2F0] text-[#C9281D] border border-[#C9281D]/20 flex items-center justify-center font-bold text-sm shadow-xs">
                    2
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold text-[#0f0f0f]">
                    Billing Address
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-[#0f0f0f] uppercase tracking-wider mb-1.5">
                      Street Address
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="House / Flat / Street address"
                        className="w-full px-4 py-3 rounded-xl bg-[#FAF8F3] border border-black/10 text-sm font-sans text-[#0f0f0f] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C9281D] focus:bg-white transition-colors"
                      />
                      <MapPin className="absolute right-3.5 top-3.5 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#0f0f0f] uppercase tracking-wider mb-1.5">
                      City
                    </label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g. London"
                      className="w-full px-4 py-3 rounded-xl bg-[#FAF8F3] border border-black/10 text-sm font-sans text-[#0f0f0f] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C9281D] focus:bg-white transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#0f0f0f] uppercase tracking-wider mb-1.5">
                      State / Province
                    </label>
                    <input
                      type="text"
                      value={stateProvince}
                      onChange={(e) => setStateProvince(e.target.value)}
                      placeholder="e.g. Greater London"
                      className="w-full px-4 py-3 rounded-xl bg-[#FAF8F3] border border-black/10 text-sm font-sans text-[#0f0f0f] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C9281D] focus:bg-white transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#0f0f0f] uppercase tracking-wider mb-1.5">
                      Country
                    </label>
                    <div className="relative">
                      <select
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-[#FAF8F3] border border-black/10 text-sm font-sans text-[#0f0f0f] focus:outline-none focus:ring-2 focus:ring-[#C9281D] focus:bg-white transition-colors cursor-pointer appearance-none"
                      >
                        <option value="United Kingdom">United Kingdom</option>
                        <option value="India">India</option>
                        <option value="United States">United States</option>
                        <option value="Canada">Canada</option>
                        <option value="Australia">Australia</option>
                        <option value="Singapore">Singapore</option>
                        <option value="United Arab Emirates">United Arab Emirates</option>
                        <option value="International">Other / International</option>
                      </select>
                      <Globe className="absolute right-3.5 top-3.5 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#0f0f0f] uppercase tracking-wider mb-1.5">
                      Postal / PIN Code
                    </label>
                    <input
                      type="text"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      placeholder="e.g. W8 4PT"
                      className="w-full px-4 py-3 rounded-xl bg-[#FAF8F3] border border-black/10 text-sm font-sans text-[#0f0f0f] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C9281D] focus:bg-white transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* 3. Payment Section (Safe Test / Mock Sandbox Mode) */}
              <div className="bg-white rounded-3xl border border-black/5 shadow-[0_8px_30px_rgba(0,0,0,0.05)] p-6 sm:p-8 space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-black/5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#DE3124] to-[#C9281D] text-white flex items-center justify-center font-bold text-sm shadow-[0_2px_8px_rgba(201,40,29,0.3)]">
                      3
                    </div>
                    <h2 className="text-lg sm:text-xl font-bold text-[#0f0f0f]">
                      Payment Method
                    </h2>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full font-bold">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>256-Bit Encrypted</span>
                  </div>
                </div>

                {/* Safe Test Sandbox Alert Callout */}
                <div className="p-4 rounded-2xl bg-[#0E1638]/[0.03] border border-[#0E1638]/10 text-[#0E1638] flex items-start gap-3.5">
                  <div className="w-7 h-7 rounded-full bg-[#0E1638]/10 flex items-center justify-center flex-shrink-0 text-[#0E1638] mt-0.5">
                    <Info className="w-4 h-4 stroke-[2.5]" />
                  </div>
                  <div className="text-xs leading-relaxed">
                    <p className="font-extrabold text-[#0E1638] uppercase tracking-wide">
                      Safe Test Payment Mode (Sandbox)
                    </p>
                    <p className="mt-0.5 text-[#0E1638]/80">
                      This prototype is in safe sandbox test mode. No real credit card is charged. Entering demo card info or clicking complete will simulate a successful transaction and instantly unlock your purchased books.
                    </p>
                  </div>
                </div>

                {/* Simulated Payment Card Form */}
                <div className="p-5 rounded-2xl bg-[#FAF8F3] border border-black/10 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#0f0f0f] flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-[#C9281D]" />
                      Credit / Debit Card (Simulation)
                    </span>
                    <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#7A756D]">
                      <span>VISA</span>
                      <span>·</span>
                      <span>MC</span>
                      <span>·</span>
                      <span>AMEX</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#5A5A5A] uppercase tracking-wider mb-1">
                      Name on Card
                    </label>
                    <input
                      type="text"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      placeholder="e.g. Aarav Sharma"
                      className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-black/10 text-sm font-sans focus:outline-none focus:ring-2 focus:ring-[#C9281D]/30 focus:border-[#C9281D]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#5A5A5A] uppercase tracking-wider mb-1">
                      Card Number
                    </label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      placeholder="4242 •••• •••• 4242"
                      className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-black/10 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#C9281D]/30 focus:border-[#C9281D]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-[#5A5A5A] uppercase tracking-wider mb-1">
                        Expires (MM/YY)
                      </label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        placeholder="12/28"
                        className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-black/10 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#C9281D]/30 focus:border-[#C9281D]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-[#5A5A5A] uppercase tracking-wider mb-1">
                        Security Code (CVC)
                      </label>
                      <input
                        type="text"
                        value={cardCvc}
                        onChange={(e) => setCardCvc(e.target.value)}
                        placeholder="789"
                        className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-black/10 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#C9281D]/30 focus:border-[#C9281D]"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Order Summary & Complete Button (4 cols on lg, sticky) */}
            <div className="lg:col-span-4 sticky top-24 space-y-4">
              <div className="bg-white rounded-3xl border border-black/5 shadow-[0_16px_40px_rgba(0,0,0,0.08)] p-6 sm:p-7 space-y-5">
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#0f0f0f] border-b border-black/5 pb-3">
                  Order Summary ({cartCount})
                </h3>

                {/* Mini Item List */}
                <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                  {cartItems.map((item: CartItem) => (
                    <div key={item.id} className="flex items-center gap-3 py-1">
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-[#FAF8F3] border border-black/10 shadow-xs">
                        <Image
                          src={item.coverImage}
                          alt={item.title}
                          fill
                          className="object-cover"
                          sizes="48px"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-[#0f0f0f] truncate">{item.title}</p>
                        <p className="text-[10px] text-[#7A756D]">
                          Qty: {item.quantity} · {item.format}
                        </p>
                      </div>
                      <span className="font-mono text-xs font-bold text-[#0f0f0f] flex-shrink-0">
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t border-black/5 space-y-2.5 font-sans text-xs">
                  <div className="flex justify-between text-[#5a5a5a]">
                    <span>Subtotal</span>
                    <span className="font-mono font-bold text-[#0f0f0f]">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-[#5a5a5a]">
                    <span>Digital Lifetime Delivery</span>
                    <span className="font-mono font-bold text-emerald-600">FREE</span>
                  </div>
                  <div className="flex justify-between text-[#5a5a5a]">
                    <span>Taxes</span>
                    <span className="font-mono font-bold text-[#0f0f0f]">${tax.toFixed(2)}</span>
                  </div>
                  <div className="pt-3 border-t border-black/10 flex justify-between items-baseline">
                    <span className="text-sm font-extrabold text-[#0f0f0f]">Total Due</span>
                    <div className="text-right">
                      <span className="font-serif text-2xl font-black text-[#0f0f0f] block leading-none">
                        ${finalTotal.toFixed(2)}
                      </span>
                      <span className="text-[10px] font-mono text-[#7A756D]">USD</span>
                    </div>
                  </div>
                </div>

                {/* Submit Payment Button */}
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full py-4 rounded-full bg-gradient-to-r from-[#DE3124] via-[#C9281D] to-[#991B1B] hover:from-[#E53E32] hover:via-[#D12E23] hover:to-[#A81F19] text-white font-extrabold text-sm sm:text-base transition-all duration-300 shadow-[0_10px_26px_rgba(201,40,29,0.38)] hover:shadow-[0_14px_32px_rgba(201,40,29,0.5)] hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 focus:outline-none focus:ring-4 focus:ring-[#C9281D]/30"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Authorizing &amp; Unlocking…</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4 stroke-[2.5]" />
                      <span>Complete Purchase (${finalTotal.toFixed(2)})</span>
                    </>
                  )}
                </button>

                <p className="text-[11px] text-[#7A756D] text-center leading-relaxed">
                  By clicking complete, you confirm this test transaction. All digital books will be permanently unlocked in your browser session.
                </p>
              </div>
            </div>
          </form>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}

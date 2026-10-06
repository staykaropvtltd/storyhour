"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import BookReader from "@/components/BookReader";
import AudiobookModal from "@/components/AudiobookModal";
import { useLibraryCart } from "@/context/LibraryCartContext";
import { EDITIONS, AUDIOBOOKS, getEditionById, getAudiobookById, Edition, Audiobook } from "@/data/editions-data";
import { User, BookOpen, Headphones, ShoppingBag, LogOut, CheckCircle2 } from "lucide-react";

export default function AccountPage() {
  const router = useRouter();
  const { unlockedBookIds, orders } = useLibraryCart();

  const [userSession, setUserSession] = useState<{ name: string; email: string } | null>(null);
  const [activeBookReader, setActiveBookReader] = useState<Edition | null>(null);
  const [activeAudiobook, setActiveAudiobook] = useState<Audiobook | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const stored = localStorage.getItem("storyhour_user_session");
      if (stored) {
        setUserSession(JSON.parse(stored));
      }
    } catch {
      // Ignore parsing errors
    }
  }, []);

  const handleLogout = () => {
    try {
      localStorage.removeItem("storyhour_user_session");
    } catch {
      // Ignore
    }
    setUserSession(null);
    router.push("/");
  };

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF8F3]">
        <div className="w-8 h-8 border-4 border-[#C9281D] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Find all unlocked editions & audiobooks
  const unlockedEditions = EDITIONS.filter(
    (ed) => unlockedBookIds.includes(ed.id) || (ed.productId && unlockedBookIds.includes(ed.productId))
  );

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

        <div className="relative z-10 max-w-3xl mx-auto text-center flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white font-mono text-xs font-bold uppercase tracking-wider mb-4 shadow-sm">
            <span>Personal Library</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-[1.08] drop-shadow-sm">
            {userSession ? `Welcome, ${userSession.name}` : "Your Reader Library"}
          </h1>
          <p className="mt-3 text-white/90 font-medium text-sm sm:text-base max-w-md leading-relaxed">
            Manage your unlocked books, access digital 3D reading spreads, and view order receipts.
          </p>

          {userSession && (
            <button
              onClick={handleLogout}
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-black/20 hover:bg-black/30 text-white font-mono text-xs transition cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          )}
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

      {/* Main Content */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-12 sm:py-16 space-y-10">
        {/* Unlocked Library */}
        <div className="bg-white rounded-3xl border border-black/5 shadow-[0_8px_30px_rgba(0,0,0,0.05)] p-6 sm:p-9 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-black/5">
            <div>
              <h2 className="font-serif text-2xl font-bold text-[#0f0f0f]">
                Unlocked Digital Editions
              </h2>
              <p className="text-xs sm:text-sm text-[#5A5A5A] mt-0.5">
                Full 3D book access granted to your device
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 font-mono text-xs font-bold">
              {unlockedEditions.length} Available
            </span>
          </div>

          {unlockedEditions.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
              {unlockedEditions.map((edition) => (
                <div
                  key={edition.id}
                  className="bg-[#FAF8F3] rounded-2xl p-4 border border-black/5 hover:border-[#C9281D]/30 transition flex flex-col justify-between space-y-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative w-16 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-white shadow-sm">
                      <Image
                        src={edition.coverImage}
                        alt={edition.title}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="inline-block px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[9px] font-mono font-bold mb-1">
                        ✓ UNLOCKED
                      </span>
                      <h3 className="font-serif text-sm font-bold text-[#0f0f0f] truncate">
                        {edition.title}
                      </h3>
                      <p className="text-[11px] text-[#7A756D]">{edition.language} · {edition.pagesCount} Pages</p>
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveBookReader(edition)}
                    className="w-full py-2.5 rounded-full bg-[#C9281D] hover:bg-[#B01E14] text-white font-sans text-xs font-bold transition shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Open Reader</span>
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 space-y-3">
              <BookOpen className="w-10 h-10 text-[#C9281D]/40 mx-auto" />
              <p className="text-sm font-medium text-[#5A5A5A]">No books unlocked yet.</p>
              <Link
                href="/stories"
                className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-full bg-[#C9281D] text-white text-xs font-bold shadow-sm"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Explore Story Editions</span>
              </Link>
            </div>
          )}
        </div>

        {/* Order History */}
        <div className="bg-white rounded-3xl border border-black/5 shadow-[0_8px_30px_rgba(0,0,0,0.05)] p-6 sm:p-9 space-y-6">
          <div className="pb-4 border-b border-black/5">
            <h2 className="font-serif text-2xl font-bold text-[#0f0f0f]">
              Past Orders &amp; Receipts
            </h2>
            <p className="text-xs sm:text-sm text-[#5A5A5A] mt-0.5">
              Verified digital purchase transaction history
            </p>
          </div>

          {orders && orders.length > 0 ? (
            <div className="space-y-3">
              {orders.map((order) => (
                <div
                  key={order.orderId}
                  className="p-4 rounded-2xl bg-[#FAF8F3] border border-black/5 flex flex-wrap items-center justify-between gap-4 text-xs font-sans"
                >
                  <div>
                    <span className="font-mono text-[#7A756D] block">
                      Order #{order.orderNumber}
                    </span>
                    <span className="text-[#5A5A5A]">
                      {new Date(order.createdAt).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>

                  <div>
                    <span className="text-[#5A5A5A] block">
                      {order.items.length} {order.items.length === 1 ? "Item" : "Items"}
                    </span>
                    <span className="font-bold text-emerald-700">Digital Access Granted</span>
                  </div>

                  <div className="text-right">
                    <span className="font-serif text-base font-bold text-[#0f0f0f] block">
                      ${(order.total ?? 0).toFixed(2)}
                    </span>
                    <Link
                      href={`/order-success?orderId=${order.orderId}`}
                      className="text-[#C9281D] font-bold underline hover:no-underline"
                    >
                      View Receipt
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-[#7A756D] text-center py-4">No recent orders recorded.</p>
          )}
        </div>
      </main>

      {/* Reader Modal */}
      {activeBookReader && (
        <BookReader
          edition={activeBookReader}
          onClose={() => setActiveBookReader(null)}
        />
      )}

      {/* Audiobook Modal */}
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

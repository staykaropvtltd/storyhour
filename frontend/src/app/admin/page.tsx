"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  TrendingUp,
  ShoppingBag,
  BookOpen,
  Mail,
  Clock,
  Sparkles,
  ArrowUpRight,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
  Plus,
  Play,
  Filter,
} from "lucide-react";
import { useAdmin } from "@/context/AdminContext";
import StoryEditModal from "@/components/admin/StoryEditModal";
import EditionEditModal from "@/components/admin/EditionEditModal";

export default function AdminDashboardPage() {
  const { stats, orders, enquiries, stories, editions, updateOrderStatus, updateEnquiryStatus, addMockOrder } = useAdmin();
  const [selectedStoryModal, setSelectedStoryModal] = useState(false);
  const [selectedEditionModal, setSelectedEditionModal] = useState(false);

  // Quick order simulation for interactive demo
  const handleSimulateOrder = () => {
    addMockOrder({
      customer: {
        fullName: "Vikram & Ananya Sen",
        email: "v.sen@london-arts.co.uk",
        phone: "+44 7820 441099",
      },
      items: [
        {
          id: "ed-new",
          title: "Ramayana — Signature Clothbound Hardcover",
          format: "Hardcover (Clothbound Foil)",
          price: 34.99,
          quantity: 1,
          coverImage: "https://storyhour.co.uk/wp-content/uploads/2026/01/WhatsApp-Image-2026-01-19-at-17.28.53.jpeg",
          type: "book",
        },
      ],
      total: 34.99,
      subtotal: 34.99,
      paymentMethod: "Apple Pay",
    });
  };

  return (
    <div className="space-y-8 select-none">
      {/* 1. Header Banner */}
      <div className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-[#171418] via-[#15151c] to-[#121114] border border-[#2b2733] overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-[#C9281D]/15 via-[#C5A880]/10 to-transparent blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-1 text-[11px] font-mono uppercase tracking-wider rounded-full bg-[#C5A880]/15 text-[#C5A880] border border-[#C5A880]/30 font-semibold">
                StoryHour Console 2.0
              </span>
              <span className="text-zinc-500 text-xs font-mono">
                {new Date().toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" })}
              </span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Publishing, Audio & Operations Overview
            </h1>
            <p className="text-zinc-400 text-xs sm:text-sm mt-1 max-w-xl">
              Curate mythological epics, monitor physical editions fulfillment, review workshop requests, and manage reader entitlements.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setSelectedStoryModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#C9281D] to-[#A81F16] text-white text-xs font-semibold shadow-lg shadow-[#C9281D]/30 hover:brightness-110 active:scale-95 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Publish Story</span>
            </button>
            <button
              onClick={handleSimulateOrder}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 text-xs font-medium border border-zinc-700/80 active:scale-95 transition"
            >
              <ShoppingBag className="w-4 h-4 text-emerald-400" />
              <span>Simulate Order</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Metric 1: Revenue */}
        <div className="p-5 rounded-2xl bg-[#121216] border border-[#23232b] shadow-xl hover:border-zinc-700 transition group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400">Total Store Revenue</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-serif text-2xl font-black text-white">
              £{stats.totalRevenue.toFixed(2)}
            </span>
            <span className="text-[11px] font-mono text-emerald-400 font-semibold flex items-center">
              +18.4%
              <ArrowUpRight className="w-3 h-3 inline" />
            </span>
          </div>
          <p className="text-[11px] text-zinc-500 mt-1 font-mono">
            {stats.totalOrders} lifetime customer orders
          </p>
        </div>

        {/* Metric 2: Catalog Stories */}
        <div className="p-5 rounded-2xl bg-[#121216] border border-[#23232b] shadow-xl hover:border-zinc-700 transition group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400">Published Epics & Audio</span>
            <div className="p-2 rounded-xl bg-[#C5A880]/15 text-[#C5A880]">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-serif text-2xl font-black text-white">
              {stats.publishedStoriesCount}
            </span>
            <span className="text-[11px] font-mono text-[#C5A880] font-semibold">
              In 3 Languages
            </span>
          </div>
          <p className="text-[11px] text-zinc-500 mt-1 font-mono">
            ~{stats.totalListensHours} hrs audio playback
          </p>
        </div>

        {/* Metric 3: Orders Pipeline */}
        <div className="p-5 rounded-2xl bg-[#121216] border border-[#23232b] shadow-xl hover:border-zinc-700 transition group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400">Active Orders Pipeline</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-serif text-2xl font-black text-white">
              {stats.totalOrders}
            </span>
            {stats.pendingOrdersCount > 0 ? (
              <span className="px-2 py-0.5 text-[10px] font-mono rounded-full bg-[#C9281D]/20 text-[#C9281D] font-bold">
                {stats.pendingOrdersCount} to fulfill
              </span>
            ) : (
              <span className="text-[11px] font-mono text-emerald-400">All Dispatched</span>
            )}
          </div>
          <p className="text-[11px] text-zinc-500 mt-1 font-mono">
            Clothbound hardcovers & box sets
          </p>
        </div>

        {/* Metric 4: Reader Enquiries */}
        <div className="p-5 rounded-2xl bg-[#121216] border border-[#23232b] shadow-xl hover:border-zinc-700 transition group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400">Reader & School Inquiries</span>
            <div className="p-2 rounded-xl bg-[#D4AF37]/15 text-[#D4AF37]">
              <Mail className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-serif text-2xl font-black text-white">
              {stats.totalEnquiries}
            </span>
            {stats.newEnquiriesCount > 0 && (
              <span className="px-2 py-0.5 text-[10px] font-mono rounded-full bg-[#D4AF37]/20 text-[#D4AF37] font-bold">
                {stats.newEnquiriesCount} new
              </span>
            )}
          </div>
          <p className="text-[11px] text-zinc-500 mt-1 font-mono">
            Workshops, publishing & licensing
          </p>
        </div>
      </div>

      {/* 3. Main Split Section: Orders & Stories (Left) + Inbox & Inventory (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2/3 width) */}
        <div className="lg:col-span-2 space-y-8">
          {/* 3.1 Recent Orders Table */}
          <div className="rounded-2xl bg-[#121216] border border-[#23232b] p-6 shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-serif font-bold text-base text-white">Recent Customer Orders</h3>
                <p className="text-xs text-zinc-500">Physical and digital edition purchases</p>
              </div>
              <Link
                href="/admin/orders"
                className="text-xs text-[#C5A880] hover:text-[#E8D3B4] flex items-center gap-1 font-medium group"
              >
                <span>View All ({orders.length})</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-zinc-800 text-[10px] font-mono uppercase text-zinc-500">
                    <th className="pb-3 font-semibold">Order</th>
                    <th className="pb-3 font-semibold">Customer</th>
                    <th className="pb-3 font-semibold">Items</th>
                    <th className="pb-3 font-semibold">Total</th>
                    <th className="pb-3 font-semibold">Status</th>
                    <th className="pb-3 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
                  {orders.slice(0, 5).map((order) => (
                    <tr key={order.orderId} className="hover:bg-zinc-800/40 transition">
                      <td className="py-3 font-mono font-medium text-white">
                        {order.orderNumber}
                      </td>
                      <td className="py-3">
                        <div className="font-medium text-zinc-200">{order.customer.fullName}</div>
                        <div className="text-[10px] text-zinc-500 font-mono truncate max-w-[120px]">
                          {order.customer.email}
                        </div>
                      </td>
                      <td className="py-3">
                        <div className="line-clamp-1 max-w-[160px] text-zinc-300">
                          {order.items.map((i) => i.title).join(", ")}
                        </div>
                        <div className="text-[10px] text-zinc-500">
                          {order.items.reduce((s, i) => s + i.quantity, 0)} item(s)
                        </div>
                      </td>
                      <td className="py-3 font-mono font-bold text-white">
                        £{order.total?.toFixed(2)}
                      </td>
                      <td className="py-3">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold ${
                            order.status === "Completed"
                              ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                              : "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                          }`}
                        >
                          {order.status === "Completed" ? "Dispatched" : "Pending"}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() =>
                            updateOrderStatus(
                              order.orderId,
                              order.status === "Completed" ? "Confirmed (Test Mode)" : "Completed"
                            )
                          }
                          className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[10px] font-mono transition"
                        >
                          {order.status === "Completed" ? "Mark Pending" : "Dispatch"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 3.2 Featured Catalog Stories Spotlight */}
          <div className="rounded-2xl bg-[#121216] border border-[#23232b] p-6 shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-serif font-bold text-base text-white">Catalog Epics & Narration</h3>
                <p className="text-xs text-zinc-500">Multilingual audiobooks and puppet performances</p>
              </div>
              <Link
                href="/admin/stories"
                className="text-xs text-[#C5A880] hover:text-[#E8D3B4] flex items-center gap-1 font-medium group"
              >
                <span>Manage Stories ({stories.length})</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {stories.slice(0, 4).map((story) => (
                <div
                  key={story.id}
                  className="flex gap-3.5 p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 transition group"
                >
                  <div className="relative w-16 h-20 rounded-lg overflow-hidden bg-zinc-800 flex-shrink-0">
                    <Image
                      src={story.coverImage}
                      alt={story.title}
                      fill
                      className="object-cover group-hover:scale-105 transition duration-300"
                      unoptimized
                    />
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                      <Play className="w-4 h-4 text-white fill-current" />
                    </div>
                  </div>

                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-[#C5A880]/20 text-[#C5A880]">
                          {story.language}
                        </span>
                        {story.featured && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-[#C9281D]/20 text-[#C9281D]">
                            Featured
                          </span>
                        )}
                      </div>
                      <h4 className="text-xs font-semibold text-white truncate mt-1 group-hover:text-[#E8D3B4] transition">
                        {story.title}
                      </h4>
                      <p className="text-[11px] text-zinc-400 truncate">{story.storyteller}</p>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-zinc-500 font-mono mt-2">
                      <span>{story.duration}</span>
                      <span>{story.chaptersCount} chapters</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (1/3 width) */}
        <div className="space-y-8">
          {/* 3.3 Live Inquiries & Messages CRM Widget */}
          <div className="rounded-2xl bg-[#121216] border border-[#23232b] p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-serif font-bold text-base text-white">Reader Inquiries</h3>
                <p className="text-xs text-zinc-500">Contact form submissions & leads</p>
              </div>
              <Link
                href="/admin/enquiries"
                className="text-xs text-[#C5A880] hover:text-[#E8D3B4] flex items-center gap-1 font-medium group"
              >
                <span>Inbox</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            <div className="space-y-3">
              {enquiries.slice(0, 3).map((enq) => (
                <div
                  key={enq.id}
                  className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-2 hover:border-zinc-700 transition"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-white">{enq.name}</span>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[9px] font-mono uppercase ${
                        enq.status === "new"
                          ? "bg-[#D4AF37]/20 text-[#D4AF37] font-bold"
                          : enq.status === "in_progress"
                          ? "bg-blue-500/20 text-blue-400"
                          : "bg-emerald-500/20 text-emerald-400"
                      }`}
                    >
                      {enq.status.replace("_", " ")}
                    </span>
                  </div>
                  <div className="text-[11px] font-mono text-[#C5A880]">{enq.enquiryType}</div>
                  <p className="text-xs text-zinc-400 line-clamp-2">{enq.message}</p>
                  <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-[10px]">
                    <span className="text-zinc-500 font-mono">
                      {new Date(enq.receivedAt).toLocaleDateString()}
                    </span>
                    <button
                      onClick={() =>
                        updateEnquiryStatus(
                          enq.id,
                          enq.status === "resolved" ? "new" : "resolved"
                        )
                      }
                      className="text-[#C5A880] hover:underline"
                    >
                      {enq.status === "resolved" ? "Re-open" : "Mark Resolved"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 3.4 Physical Editions Inventory Status */}
          <div className="rounded-2xl bg-[#121216] border border-[#23232b] p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif font-bold text-base text-white">Inventory Alerts</h3>
                <p className="text-xs text-zinc-500">Physical book print runs</p>
              </div>
              <Link
                href="/admin/editions"
                className="text-xs text-[#C5A880] hover:text-[#E8D3B4]"
              >
                Manage
              </Link>
            </div>

            <div className="space-y-2.5">
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3">
                <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                <div className="text-xs">
                  <div className="font-semibold text-amber-200">
                    Ramayana Signature Hardcover (Clothbound)
                  </div>
                  <div className="text-amber-300/80 text-[11px] mt-0.5">
                    Only 4 copies remaining in London warehouse!
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                <div className="text-xs">
                  <div className="font-semibold text-zinc-200">
                    Panchatantra Illustrated Hardcover
                  </div>
                  <div className="text-zinc-500 text-[11px] mt-0.5">
                    68 copies in stock • Healthy inventory
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                <div className="text-xs">
                  <div className="font-semibold text-zinc-200">
                    Mahabharata Deluxe Box Set
                  </div>
                  <div className="text-zinc-500 text-[11px] mt-0.5">
                    22 copies in stock
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 3.5 System & Security Health Badge */}
          <div className="rounded-2xl bg-gradient-to-br from-[#121217] to-[#181820] border border-[#272733] p-5 shadow-xl space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-white">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Platform Security Status</span>
            </div>
            <div className="text-[11px] text-zinc-400 space-y-1 font-mono">
              <div className="flex justify-between">
                <span>Next.js Engine:</span>
                <span className="text-white">v15.5.27 (Patched)</span>
              </div>
              <div className="flex justify-between">
                <span>Production Vulnerabilities:</span>
                <span className="text-emerald-400 font-bold">0 Vulnerabilities</span>
              </div>
              <div className="flex justify-between">
                <span>PostCSS & Sharp:</span>
                <span className="text-zinc-300">v8.5.28 & v0.35.5</span>
              </div>
              <div className="flex justify-between">
                <span>Build Verification:</span>
                <span className="text-emerald-400">21/21 Pages Static</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals for Quick Add */}
      <StoryEditModal
        isOpen={selectedStoryModal}
        onClose={() => setSelectedStoryModal(false)}
        storyToEdit={null}
      />
      <EditionEditModal
        isOpen={selectedEditionModal}
        onClose={() => setSelectedEditionModal(false)}
        editionToEdit={null}
      />
    </div>
  );
}

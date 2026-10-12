"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Search,
  Bell,
  Plus,
  RefreshCw,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Mail,
  ChevronDown,
} from "lucide-react";
import { useAdmin } from "@/context/AdminContext";

interface AdminHeaderProps {
  onOpenSearch?: () => void;
  onOpenAddModal?: (type: "story" | "edition" | "order") => void;
}

export default function AdminHeader({ onOpenSearch, onOpenAddModal }: AdminHeaderProps) {
  const pathname = usePathname();
  const { stats, enquiries, orders, resetToDefaults } = useAdmin();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Generate dynamic breadcrumb
  const pathParts = pathname.split("/").filter(Boolean);
  const sectionTitle =
    pathParts.length > 1
      ? pathParts[1].charAt(0).toUpperCase() + pathParts[1].slice(1)
      : "Overview";

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 600);
  };

  return (
    <header className="h-16 border-b border-[#1e1e24] bg-[#0c0c0e]/80 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between px-6 select-none">
      {/* 1. Breadcrumb & Section Name */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-xs font-mono text-zinc-500">
          <Link href="/admin" className="hover:text-zinc-300 transition-colors">
            admin
          </Link>
          <span>/</span>
          <span className="text-zinc-200 font-semibold">{sectionTitle.toLowerCase()}</span>
        </div>
      </div>

      {/* 2. Center: Global Search trigger */}
      <div className="hidden md:flex items-center max-w-md w-full mx-6">
        <button
          onClick={onOpenSearch}
          className="w-full flex items-center justify-between px-3.5 py-1.5 rounded-xl bg-zinc-900/60 border border-zinc-800 text-xs text-zinc-400 hover:border-zinc-700 hover:text-zinc-200 transition-all shadow-inner group"
        >
          <div className="flex items-center gap-2.5">
            <Search className="w-3.5 h-3.5 text-zinc-500 group-hover:text-[#C5A880] transition-colors" />
            <span className="truncate">Search stories, orders, customers, or editions...</span>
          </div>
          <kbd className="px-1.5 py-0.5 text-[10px] font-mono text-zinc-400 bg-zinc-800 rounded border border-zinc-700">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* 3. Right: Actions, Notifications & Quick Add */}
      <div className="flex items-center gap-3">
        {/* Refresh button */}
        <button
          onClick={handleRefresh}
          title="Refresh Catalog Data"
          className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800/60 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin text-[#C5A880]" : ""}`} />
        </button>

        {/* Quick Add Menu */}
        <div className="relative">
          <button
            onClick={() => setShowQuickAdd(!showQuickAdd)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#C9281D] hover:bg-[#B52218] text-white text-xs font-medium shadow-md shadow-[#C9281D]/25 transition-all active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Create</span>
            <ChevronDown className="w-3 h-3 opacity-80" />
          </button>

          {showQuickAdd && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowQuickAdd(false)}
              />
              <div className="absolute right-0 mt-2 w-48 rounded-xl bg-[#141417] border border-[#26262e] shadow-2xl p-1.5 z-50 text-xs text-zinc-300 animate-slide-in-from-top-4 font-sans">
                <button
                  onClick={() => {
                    setShowQuickAdd(false);
                    onOpenAddModal?.("story");
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-zinc-800 hover:text-white flex items-center gap-2 transition"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#C5A880]" />
                  <span>New Story / Audio</span>
                </button>
                <button
                  onClick={() => {
                    setShowQuickAdd(false);
                    onOpenAddModal?.("edition");
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-zinc-800 hover:text-white flex items-center gap-2 transition"
                >
                  <Plus className="w-3.5 h-3.5 text-blue-400" />
                  <span>Add Book / Edition</span>
                </button>
                <button
                  onClick={() => {
                    setShowQuickAdd(false);
                    onOpenAddModal?.("order");
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-zinc-800 hover:text-white flex items-center gap-2 transition"
                >
                  <Plus className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Simulate Test Order</span>
                </button>
              </div>
            </>
          )}
        </div>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800/60 transition-colors relative"
            aria-label="View notifications"
          >
            <Bell className="w-4 h-4" />
            {stats.newEnquiriesCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#C9281D] ring-2 ring-[#0c0c0e]" />
            )}
          </button>

          {showNotifications && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowNotifications(false)}
              />
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-[#141418] border border-[#26262e] shadow-2xl p-4 z-50 animate-slide-in-from-top-4">
                <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-white">Live Activity Alerts</span>
                    <span className="px-1.5 py-0.2 text-[10px] font-mono rounded bg-[#C9281D]/20 text-[#C9281D] font-bold">
                      {stats.newEnquiriesCount + stats.pendingOrdersCount}
                    </span>
                  </div>
                  <span className="text-[10px] text-zinc-500 font-mono">Real-time</span>
                </div>

                <div className="mt-3 space-y-2.5 max-h-72 overflow-y-auto pr-1 scrollbar-thin">
                  {enquiries.slice(0, 3).map((enq) => (
                    <Link
                      key={enq.id}
                      href="/admin/enquiries"
                      onClick={() => setShowNotifications(false)}
                      className="block p-2.5 rounded-xl bg-zinc-900/60 hover:bg-zinc-800/80 border border-zinc-800 transition"
                    >
                      <div className="flex items-start gap-2.5">
                        <div className="p-1.5 rounded-lg bg-[#C5A880]/15 text-[#C5A880] mt-0.5">
                          <Mail className="w-3.5 h-3.5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-xs font-medium text-zinc-200 truncate">{enq.name}</p>
                            <span className="text-[10px] text-zinc-500 font-mono">
                              {new Date(enq.receivedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </span>
                          </div>
                          <p className="text-[11px] text-zinc-400 truncate mt-0.5">{enq.enquiryType}</p>
                          <p className="text-[11px] text-zinc-500 line-clamp-1 mt-0.5">{enq.message}</p>
                        </div>
                      </div>
                    </Link>
                  ))}

                  {orders.slice(0, 2).map((ord) => (
                    <Link
                      key={ord.orderId}
                      href="/admin/orders"
                      onClick={() => setShowNotifications(false)}
                      className="block p-2.5 rounded-xl bg-zinc-900/60 hover:bg-zinc-800/80 border border-zinc-800 transition"
                    >
                      <div className="flex items-start gap-2.5">
                        <div className="p-1.5 rounded-lg bg-emerald-500/15 text-emerald-400 mt-0.5">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-xs font-medium text-zinc-200 truncate">Order #{ord.orderNumber}</p>
                            <span className="text-xs font-mono font-bold text-emerald-400">
                              £{ord.total?.toFixed(2)}
                            </span>
                          </div>
                          <p className="text-[11px] text-zinc-400 truncate mt-0.5">{ord.customer.fullName}</p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>

                <div className="mt-3 pt-3 border-t border-zinc-800 flex items-center justify-between text-[11px]">
                  <Link
                    href="/admin/enquiries"
                    onClick={() => setShowNotifications(false)}
                    className="text-[#C5A880] hover:underline"
                  >
                    View All Inquiries
                  </Link>
                  <Link
                    href="/admin/orders"
                    onClick={() => setShowNotifications(false)}
                    className="text-zinc-400 hover:text-white"
                  >
                    View All Orders
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

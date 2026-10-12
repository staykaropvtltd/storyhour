"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  Library,
  Mic,
  ShoppingBag,
  Mail,
  Settings,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Sparkles,
  Menu,
  X,
  Radio,
} from "lucide-react";
import { useAdmin } from "@/context/AdminContext";

interface NavItem {
  label: string;
  href: string;
  icon: any;
  badge?: string | number | null;
  badgeColor?: string;
}

interface NavSection {
  group: string;
  items: NavItem[];
}

export default function AdminSidebar() {
  const pathname = usePathname();
  const { stats, stories, editions, storytellers, enquiries, orders } = useAdmin();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navSections: NavSection[] = [
    {
      group: "Overview",
      items: [
        {
          label: "Dashboard",
          href: "/admin",
          icon: LayoutDashboard,
          badge: null,
        },
      ],
    },
    {
      group: "Content & Catalog",
      items: [
        {
          label: "Stories & Audio",
          href: "/admin/stories",
          icon: BookOpen,
          badge: stories.length,
        },
        {
          label: "Editions & Books",
          href: "/admin/editions",
          icon: Library,
          badge: editions.length,
        },
        {
          label: "Storytellers & Cast",
          href: "/admin/storytellers",
          icon: Mic,
          badge: storytellers.length,
        },
      ],
    },
    {
      group: "Commerce & Support",
      items: [
        {
          label: "Orders & Fulfillment",
          href: "/admin/orders",
          icon: ShoppingBag,
          badge: stats.pendingOrdersCount > 0 ? `${stats.pendingOrdersCount} new` : null,
          badgeColor: "bg-[#C9281D] text-white",
        },
        {
          label: "Inquiries & Messages",
          href: "/admin/enquiries",
          icon: Mail,
          badge: stats.newEnquiriesCount > 0 ? `${stats.newEnquiriesCount} new` : null,
          badgeColor: "bg-[#D4AF37] text-black font-semibold",
        },
      ],
    },
    {
      group: "System & Core",
      items: [
        {
          label: "Platform Settings",
          href: "/admin/settings",
          icon: Settings,
          badge: null,
        },
      ],
    },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#0c0c0e] text-[#f2f2f4] border-r border-[#1e1e24] w-72 select-none">
      {/* 1. Header / Logo */}
      <div className="p-6 border-b border-[#1e1e24] flex items-center justify-between">
        <Link href="/admin" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#C9281D] via-[#A81F16] to-[#680F0A] flex items-center justify-center shadow-lg shadow-[#C9281D]/20 group-hover:scale-105 transition-transform duration-300">
            <span className="font-serif font-black text-white text-xl tracking-wider">S</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif text-lg font-bold tracking-tight text-white group-hover:text-[#E8D3B4] transition-colors">
                StoryHour
              </span>
              <span className="px-1.5 py-0.5 text-[10px] font-mono uppercase tracking-wider rounded bg-[#C5A880]/15 text-[#C5A880] border border-[#C5A880]/30 font-semibold">
                Admin
              </span>
            </div>
            <p className="text-[11px] text-[#8e8d99] tracking-wide">Publishing & Operations</p>
          </div>
        </Link>
        {mobileOpen && (
          <button
            onClick={() => setMobileOpen(false)}
            className="md:hidden p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* 2. System Status Pill */}
      <div className="px-6 py-3 border-b border-[#18181d] bg-[#08080a]">
        <div className="flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-2 text-emerald-400">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-mono font-medium tracking-wide">Production Live</span>
          </div>
          <span className="text-zinc-500 font-mono text-[10px]">Next.js 15.5</span>
        </div>
      </div>

      {/* 3. Navigation Links */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6 scrollbar-thin scrollbar-thumb-zinc-800">
        {navSections.map((section) => (
          <div key={section.group} className="space-y-1">
            <h4 className="px-3 text-[10px] font-mono uppercase tracking-wider text-zinc-500 font-semibold mb-2">
              {section.group}
            </h4>
            {section.items.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 group ${
                    isActive
                      ? "bg-gradient-to-r from-[#C9281D]/20 to-transparent text-white border-l-2 border-[#C9281D] shadow-inner"
                      : "text-zinc-400 hover:text-white hover:bg-zinc-900/60"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-4 h-4 transition-colors ${
                        isActive ? "text-[#C9281D]" : "text-zinc-500 group-hover:text-zinc-300"
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
                        item.badgeColor || (isActive ? "bg-zinc-800 text-white" : "bg-zinc-900 text-zinc-400")
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </div>

      {/* 4. Footer: Public Store Link & Admin Profile */}
      <div className="p-4 border-t border-[#1e1e24] bg-[#09090b] space-y-3">
        <Link
          href="/"
          target="_blank"
          className="flex items-center justify-between px-3 py-2 rounded-xl text-xs text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors border border-zinc-800/60 group"
        >
          <span className="flex items-center gap-2">
            <Radio className="w-3.5 h-3.5 text-[#C5A880]" />
            <span>Public Storefront</span>
          </span>
          <ExternalLink className="w-3.5 h-3.5 text-zinc-500 group-hover:text-white transition-colors" />
        </Link>

        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-zinc-900/40 border border-zinc-800/40">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#C5A880] to-[#E8D3B4] flex items-center justify-center text-zinc-950 font-serif font-bold text-xs shadow">
            AD
          </div>
          <div className="flex-1 min-0">
            <div className="text-xs font-semibold text-white truncate">Editorial Admin</div>
            <div className="text-[10px] text-zinc-500 truncate font-mono">admin@storyhour.co.uk</div>
          </div>
          <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:block h-screen sticky top-0 z-40">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      <div className="md:hidden">
        {/* Mobile Toggle Button */}
        <div className="fixed bottom-6 right-6 z-50">
          <button
            onClick={() => setMobileOpen(true)}
            className="w-12 h-12 rounded-full bg-[#C9281D] text-white flex items-center justify-center shadow-xl shadow-[#C9281D]/40 border border-white/20 active:scale-95 transition"
            aria-label="Open Admin Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>

        {mobileOpen && (
          <div className="fixed inset-0 z-50 flex">
            <div
              className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
              onClick={() => setMobileOpen(false)}
            />
            <div className="relative flex-1 max-w-xs w-full shadow-2xl z-10 animate-slide-in-from-top-4">
              {sidebarContent}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

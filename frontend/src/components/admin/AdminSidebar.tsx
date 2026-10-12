"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  Library,
  Mic,
  Home,
  Settings,
  ExternalLink,
  Radio,
  Menu,
  X,
  Sparkles,
  LogOut,
} from "lucide-react";
import { useAdminCms } from "@/context/AdminCmsContext";

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
  const { stories, editions, storytellers, stats, logout, adminUser } = useAdminCms();
  const [mobileOpen, setMobileOpen] = useState(false);

  const publishedStoriesCount = stories.filter((s) => s.status === "published").length;
  const draftStoriesCount = stories.filter((s) => s.status === "draft").length;

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
          badge: `${publishedStoriesCount} pub${draftStoriesCount > 0 ? ` · ${draftStoriesCount} draft` : ""}`,
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
      group: "Website Presentation",
      items: [
        {
          label: "Homepage Content",
          href: "/admin/homepage",
          icon: Home,
          badge: "Live",
          badgeColor: "bg-[#FDF2F0] text-[#C9281D] font-bold",
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
    <div className="flex flex-col h-full bg-[#FFFFFF] text-[#0F0F0F] border-r border-[#E8E4DC] w-72 select-none shadow-sm">
      {/* 1. Brand Logo */}
      <div className="p-5 border-b border-[#E8E4DC] flex items-center justify-between bg-[#FDFCF9]">
        <Link href="/admin" className="flex items-center gap-3 group">
          <div className="relative w-10 h-10 rounded-xl bg-white border border-[#E8E4DC] flex items-center justify-center p-1 shadow-sm group-hover:scale-105 transition-transform overflow-hidden">
            <Image
              src="https://storyhour.co.uk/wp-content/uploads/2026/01/tp-logo.png"
              alt="StoryHour Logo"
              fill
              className="object-contain p-1"
            />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-serif text-lg font-bold tracking-tight text-[#0F0F0F] group-hover:text-[#C9281D] transition-colors">
                StoryHour
              </span>
              <span className="px-1.5 py-0.5 text-[10px] font-mono uppercase tracking-wider rounded bg-[#FDF2F0] text-[#C9281D] border border-[#C9281D]/20 font-bold">
                CMS
              </span>
            </div>
            <p className="text-[11px] text-[#696572] tracking-wide">Content Management System</p>
          </div>
        </Link>
        {mobileOpen && (
          <button
            onClick={() => setMobileOpen(false)}
            className="md:hidden p-1.5 text-zinc-500 hover:text-black rounded-lg hover:bg-zinc-100"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* 2. Live Synchronization Status Pill */}
      <div className="px-5 py-2.5 border-b border-[#E8E4DC] bg-[#FAF8F3] flex items-center justify-between text-[11px]">
        <div className="flex items-center gap-2 text-emerald-700 font-medium">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
          </span>
          <span className="font-mono tracking-tight">Connected to Live Site</span>
        </div>
        <span className="text-zinc-500 font-mono text-[10px]">Next.js 15.5</span>
      </div>

      {/* 3. Navigation Sections */}
      <div className="flex-1 overflow-y-auto px-3.5 py-5 space-y-6 scrollbar-thin">
        {navSections.map((section) => (
          <div key={section.group} className="space-y-1">
            <h4 className="px-3 text-[10px] font-mono uppercase tracking-wider text-[#696572] font-bold mb-1.5">
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
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 group ${
                    isActive
                      ? "bg-[#FDF2F0] text-[#C9281D] border-l-4 border-[#C9281D] shadow-sm"
                      : "text-[#3F383D] hover:text-[#0F0F0F] hover:bg-[#F4EFE6]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-4 h-4 transition-colors ${
                        isActive ? "text-[#C9281D]" : "text-[#696572] group-hover:text-[#0F0F0F]"
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== null && item.badge !== undefined && (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
                        item.badgeColor || (isActive ? "bg-[#C9281D]/15 text-[#C9281D]" : "bg-zinc-100 text-zinc-600")
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

      {/* 4. Footer */}
      <div className="p-4 border-t border-[#E8E4DC] bg-[#FDFCF9] space-y-3">
        <Link
          href="/"
          target="_blank"
          className="flex items-center justify-between px-3 py-2 rounded-xl text-xs text-[#3F383D] hover:text-[#0F0F0F] hover:bg-[#F4EFE6] transition-colors border border-[#E8E4DC] group"
        >
          <span className="flex items-center gap-2 font-medium">
            <Radio className="w-3.5 h-3.5 text-[#C9281D]" />
            <span>View Public Website</span>
          </span>
          <ExternalLink className="w-3.5 h-3.5 text-[#696572] group-hover:text-[#0F0F0F]" />
        </Link>

        <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-[#FAF8F3] border border-[#E8E4DC]">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-full bg-[#C9281D] text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
              A
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-[#0F0F0F] truncate">Administrator</div>
              <div className="text-[10px] text-[#696572] truncate font-mono">{adminUser?.email || "admin@storyhour.co.uk"}</div>
            </div>
          </div>
          <button
            onClick={logout}
            title="Log Out"
            className="p-1.5 text-zinc-400 hover:text-red-600 rounded-lg transition"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden md:block h-screen sticky top-0 z-40 flex-shrink-0">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      <div className="md:hidden">
        <div className="fixed bottom-5 right-5 z-50">
          <button
            onClick={() => setMobileOpen(true)}
            className="w-12 h-12 rounded-full bg-[#C9281D] text-white flex items-center justify-center shadow-xl active:scale-95 transition"
            aria-label="Open Admin Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>

        {mobileOpen && (
          <div className="fixed inset-0 z-50 flex">
            <div
              className="fixed inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
            />
            <div className="relative flex-1 max-w-xs w-full shadow-2xl z-10">
              {sidebarContent}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

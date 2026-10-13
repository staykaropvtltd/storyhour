"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Search,
  Plus,
  RefreshCw,
  Sparkles,
  BookOpen,
  Library,
  Mic,
  ChevronDown,
} from "lucide-react";
import { useAdminCms } from "@/context/AdminCmsContext";

interface AdminHeaderProps {
  onOpenSearch?: () => void;
  onOpenAddModal?: (type: "story" | "edition" | "storyteller") => void;
}

export default function AdminHeader({ onOpenSearch, onOpenAddModal }: AdminHeaderProps) {
  const pathname = usePathname();
  const { refreshData, loading } = useAdminCms();
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const pathParts = pathname.split("/").filter(Boolean);
  const sectionTitle =
    pathParts.length > 1
      ? pathParts[1].charAt(0).toUpperCase() + pathParts[1].slice(1)
      : "Overview";

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshData();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  return (
    <header className="h-16 border-b border-[#E8E4DC] bg-[#FFFFFF] sticky top-0 z-30 flex items-center justify-between px-6 select-none shadow-sm">
      {/* 1. Breadcrumbs */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-xs font-mono text-[#696572]">
          <Link href="/admin" className="hover:text-[#0F0F0F] transition-colors">
            admin
          </Link>
          <span>/</span>
          <span className="text-[#0F0F0F] font-bold">{sectionTitle.toLowerCase()}</span>
        </div>
      </div>

      {/* 2. Search Bar Trigger */}
      <div className="hidden md:flex items-center max-w-md w-full mx-6">
        <button
          onClick={onOpenSearch}
          className="w-full flex items-center justify-between px-3.5 py-1.5 rounded-xl bg-[#FAF8F3] border border-[#E8E4DC] text-xs text-[#696572] hover:border-[#C9281D]/40 hover:text-[#0F0F0F] transition-all shadow-inner group"
        >
          <div className="flex items-center gap-2.5">
            <Search className="w-3.5 h-3.5 text-[#696572] group-hover:text-[#C9281D] transition-colors" />
            <span className="truncate">Search published stories, books, narrators...</span>
          </div>
          <kbd className="px-1.5 py-0.5 text-[10px] font-mono text-[#696572] bg-white rounded border border-[#E8E4DC]">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* 3. Actions */}
      <div className="flex items-center gap-3">
        {/* Refresh button */}
        <button
          onClick={handleRefresh}
          title="Refresh Content from Server"
          className="p-2 rounded-xl text-[#696572] hover:text-[#0F0F0F] hover:bg-[#F4EFE6] transition-colors border border-transparent hover:border-[#E8E4DC]"
        >
          <RefreshCw
            className={`w-4 h-4 ${isRefreshing || loading ? "animate-spin text-[#C9281D]" : ""}`}
          />
        </button>

        {/* Quick Add Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowQuickAdd(!showQuickAdd)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#C9281D] hover:bg-[#B52218] text-white text-xs font-bold shadow-sm transition-all active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Add Content</span>
            <ChevronDown className="w-3 h-3 opacity-80" />
          </button>

          {showQuickAdd && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowQuickAdd(false)}
              />
              <div className="absolute right-0 mt-2 w-52 rounded-2xl bg-white border border-[#E8E4DC] shadow-xl p-1.5 z-50 text-xs text-[#0F0F0F] animate-slide-in-from-top-4 font-sans">
                <button
                  onClick={() => {
                    setShowQuickAdd(false);
                    onOpenAddModal?.("story");
                  }}
                  className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-[#FDF2F0] hover:text-[#C9281D] flex items-center gap-2.5 transition font-semibold"
                >
                  <BookOpen className="w-4 h-4 text-[#C9281D]" />
                  <span>Publish New Story</span>
                </button>
                <button
                  onClick={() => {
                    setShowQuickAdd(false);
                    onOpenAddModal?.("edition");
                  }}
                  className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-[#F4EFE6] flex items-center gap-2.5 transition font-semibold"
                >
                  <Library className="w-4 h-4 text-blue-600" />
                  <span>Add Book / Edition</span>
                </button>
                <button
                  onClick={() => {
                    setShowQuickAdd(false);
                    onOpenAddModal?.("storyteller");
                  }}
                  className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-[#F4EFE6] flex items-center gap-2.5 transition font-semibold"
                >
                  <Mic className="w-4 h-4 text-emerald-600" />
                  <span>Add Storyteller Profile</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

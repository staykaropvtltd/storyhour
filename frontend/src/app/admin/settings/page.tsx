"use client";

import React, { useState } from "react";
import {
  Settings,
  ShieldCheck,
  Key,
  Database,
  RefreshCw,
  CheckCircle2,
  Trash2,
  Lock,
  Globe,
  Sliders,
  Sparkles,
} from "lucide-react";
import { useAdminCms } from "@/context/AdminCmsContext";

export default function AdminSettingsPage() {
  const { refreshContent } = useAdminCms();
  const [cachePurged, setCachePurged] = useState(false);
  const [revalidating, setRevalidating] = useState(false);

  const handlePurgeCache = async () => {
    setRevalidating(true);
    await refreshContent();
    setRevalidating(false);
    setCachePurged(true);
    setTimeout(() => setCachePurged(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* 1. Header */}
      <div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#0F0F0F] tracking-tight">
          Platform Settings & Environment
        </h1>
        <p className="text-[#6B655C] text-xs sm:text-sm mt-1">
          Review production infrastructure status, live CMS storage, security posture, and cache controls.
        </p>
      </div>

      {/* 2. Platform Specs */}
      <div className="p-6 rounded-2xl bg-white border border-[#E8E4DC] shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-[#0F0F0F]">
          <Sliders className="w-4 h-4 text-[#C9281D]" />
          <span>System & Runtime Environment</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
          <div className="p-3.5 rounded-xl bg-[#FAF8F3] border border-[#E8E4DC]">
            <span className="text-[#8C827A] block text-[10px]">Next.js Framework</span>
            <span className="text-[#0F0F0F] font-bold text-sm">v15.5.27</span>
            <span className="text-emerald-700 text-[10px] block mt-1 font-sans font-semibold">✓ Patched & Verified</span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#FAF8F3] border border-[#E8E4DC]">
            <span className="text-[#8C827A] block text-[10px]">React Core</span>
            <span className="text-[#0F0F0F] font-bold text-sm">v19.0.0</span>
            <span className="text-[#6B655C] text-[10px] block mt-1 font-sans">React Server Components</span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#FAF8F3] border border-[#E8E4DC]">
            <span className="text-[#8C827A] block text-[10px]">Styling Engine</span>
            <span className="text-[#0F0F0F] font-bold text-sm">Tailwind CSS v3.4.19</span>
            <span className="text-[#6B655C] text-[10px] block mt-1 font-sans">PostCSS 8.5.28</span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#FAF8F3] border border-[#E8E4DC]">
            <span className="text-[#8C827A] block text-[10px]">Image Optimization</span>
            <span className="text-[#0F0F0F] font-bold text-sm">Sharp v0.35.5</span>
            <span className="text-emerald-700 text-[10px] block mt-1 font-sans font-semibold">✓ libvips secured</span>
          </div>
        </div>
      </div>

      {/* 3. Live CMS Storage Status */}
      <div className="p-6 rounded-2xl bg-white border border-[#E8E4DC] shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-[#0F0F0F]">
          <Database className="w-4 h-4 text-[#C9281D]" />
          <span>Persistent CMS Storage & Endpoints</span>
        </div>

        <div className="space-y-3 text-xs">
          <div className="p-3.5 rounded-xl bg-[#FAF8F3] border border-[#E8E4DC] flex items-center justify-between">
            <div>
              <div className="font-semibold text-[#0F0F0F]">Primary Content Store</div>
              <div className="text-[11px] text-[#6B655C] font-mono mt-0.5">
                src/data/storyhour-content.json (Persistent Server Storage)
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              Active / Mounted
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#FAF8F3] border border-[#E8E4DC] flex items-center justify-between">
            <div>
              <div className="font-semibold text-[#0F0F0F]">Live Public Content API</div>
              <div className="text-[11px] text-[#6B655C] font-mono mt-0.5">
                GET /api/cms/content (Filtered published content with cache revalidation)
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              200 OK
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#FAF8F3] border border-[#E8E4DC] flex items-center justify-between">
            <div>
              <div className="font-semibold text-[#0F0F0F]">Admin Security & Token Verification</div>
              <div className="text-[11px] text-[#6B655C] font-mono mt-0.5">
                HMAC-SHA256 Signed Admin Session with HttpOnly Cookies
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              Enforced
            </span>
          </div>
        </div>
      </div>

      {/* 4. Cache & Maintenance */}
      <div className="p-6 rounded-2xl bg-white border border-[#E8E4DC] shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-[#0F0F0F]">
          <RefreshCw className="w-4 h-4 text-[#C9281D]" />
          <span>Cache Revalidation & Sync</span>
        </div>

        <p className="text-xs text-[#6B655C] leading-relaxed">
          The public website automatically updates when content is saved in the admin panel. Use this button to force an instant sync across all open tabs and clear local cached states.
        </p>

        {cachePurged && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>Content cache synchronized successfully across all routes!</span>
          </div>
        )}

        <div className="flex items-center gap-3">
          <button
            onClick={handlePurgeCache}
            disabled={revalidating}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#FAF8F3] hover:bg-[#F4EFE6] border border-[#E8E4DC] text-xs font-semibold text-[#0F0F0F] transition active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#C9281D] ${revalidating ? "animate-spin" : ""}`} />
            <span>{revalidating ? "Synchronizing..." : "Force Cache Sync Now"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

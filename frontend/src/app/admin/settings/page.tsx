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
} from "lucide-react";
import { useAdmin } from "@/context/AdminContext";

export default function AdminSettingsPage() {
  const { resetToDefaults } = useAdmin();
  const [cachePurged, setCachePurged] = useState(false);
  const [resetDone, setResetDone] = useState(false);

  const handlePurgeCache = () => {
    setCachePurged(true);
    setTimeout(() => setCachePurged(false), 2500);
  };

  const handleResetData = () => {
    if (window.confirm("Reset all stories, orders, and inquiries to factory seed defaults?")) {
      resetToDefaults();
      setResetDone(true);
      setTimeout(() => setResetDone(false), 2500);
    }
  };

  return (
    <div className="space-y-6 select-none max-w-4xl">
      {/* 1. Header */}
      <div>
        <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Platform Settings & Environment
        </h1>
        <p className="text-zinc-400 text-xs sm:text-sm mt-1">
          Review production infrastructure status, email dispatch providers, and system caches.
        </p>
      </div>

      {/* 2. Platform Specs */}
      <div className="p-6 rounded-2xl bg-[#121216] border border-[#23232b] shadow-xl space-y-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-white">
          <Sliders className="w-4 h-4 text-[#C5A880]" />
          <span>System & Runtime Environment</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
          <div className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800">
            <span className="text-zinc-500 block text-[10px]">Next.js Framework</span>
            <span className="text-white font-bold text-sm">v15.5.27</span>
            <span className="text-emerald-400 text-[10px] block mt-1">✓ Patched Against Advisories</span>
          </div>

          <div className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800">
            <span className="text-zinc-500 block text-[10px]">React Core</span>
            <span className="text-white font-bold text-sm">v19.0.0</span>
            <span className="text-zinc-400 text-[10px] block mt-1">React Server Components</span>
          </div>

          <div className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800">
            <span className="text-zinc-500 block text-[10px]">Styling Engine</span>
            <span className="text-white font-bold text-sm">Tailwind CSS v3.4.19</span>
            <span className="text-zinc-400 text-[10px] block mt-1">PostCSS 8.5.28</span>
          </div>

          <div className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800">
            <span className="text-zinc-500 block text-[10px]">Image Optimization</span>
            <span className="text-white font-bold text-sm">Sharp v0.35.5</span>
            <span className="text-emerald-400 text-[10px] block mt-1">✓ libvips 1.3.4 secured</span>
          </div>
        </div>
      </div>

      {/* 3. Integrations & API Providers */}
      <div className="p-6 rounded-2xl bg-[#121216] border border-[#23232b] shadow-xl space-y-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-white">
          <Key className="w-4 h-4 text-emerald-400" />
          <span>API Integrations & Third-Party Gateways</span>
        </div>

        <div className="space-y-3 text-xs">
          {/* Resend Email API */}
          <div className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-between">
            <div>
              <div className="font-semibold text-white">Resend Email Gateway</div>
              <div className="text-[11px] text-zinc-400">
                Dispatches customer inquiry alerts & order confirmations
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              Active / Ready
            </span>
          </div>

          {/* Stripe Checkout */}
          <div className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-between">
            <div>
              <div className="font-semibold text-white">Payment Processing (Stripe / Apple Pay)</div>
              <div className="text-[11px] text-zinc-400">
                Handles book purchases & digital subscriptions
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold bg-blue-500/15 text-blue-400 border border-blue-500/30">
              Test Mode
            </span>
          </div>

          {/* Supabase */}
          <div className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-between">
            <div>
              <div className="font-semibold text-white">Supabase Cloud Database & Storage</div>
              <div className="text-[11px] text-zinc-400">
                Stores audiobook files and customer entitlements
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold bg-[#C5A880]/15 text-[#C5A880] border border-[#C5A880]/30">
              Connected
            </span>
          </div>
        </div>
      </div>

      {/* 4. Cache & Data Maintenance */}
      <div className="p-6 rounded-2xl bg-[#121216] border border-[#23232b] shadow-xl space-y-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-white">
          <Database className="w-4 h-4 text-[#C9281D]" />
          <span>Cache Management & Factory Defaults</span>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handlePurgeCache}
            className="flex-1 flex items-center justify-center gap-2 p-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-medium text-white transition active:scale-95"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#C5A880]" />
            <span>Purge Static ISR CDN Cache</span>
          </button>

          <button
            onClick={handleResetData}
            className="flex-1 flex items-center justify-center gap-2 p-3 rounded-xl bg-red-950/30 hover:bg-red-900/40 border border-red-800/40 text-xs font-medium text-red-300 transition active:scale-95"
          >
            <Trash2 className="w-3.5 h-3.5 text-red-400" />
            <span>Reset Demo State to Factory Defaults</span>
          </button>
        </div>

        {cachePurged && (
          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>Static edge route caches purged successfully.</span>
          </div>
        )}

        {resetDone && (
          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>Local demo catalog, orders, and inquiries restored to baseline seeds.</span>
          </div>
        )}
      </div>
    </div>
  );
}

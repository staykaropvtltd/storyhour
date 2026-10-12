"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Sparkles,
  Save,
  CheckCircle2,
  ExternalLink,
  Eye,
  Megaphone,
  LayoutTemplate,
  Star,
} from "lucide-react";
import { useAdminCms } from "@/context/AdminCmsContext";

export default function AdminHomepageConfigPage() {
  const { homepageConfig, saveHomepageConfig, stories } = useAdminCms();

  const [heroHeadline, setHeroHeadline] = useState("");
  const [heroSubheadline, setHeroSubheadline] = useState("");
  const [heroCtaText, setHeroCtaText] = useState("");
  const [heroCtaDestination, setHeroCtaDestination] = useState("");
  const [featuredStoryId, setFeaturedStoryId] = useState("");
  const [announcementText, setAnnouncementText] = useState("");
  const [announcementEnabled, setAnnouncementEnabled] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (homepageConfig) {
      setHeroHeadline(homepageConfig.heroHeadline || "");
      setHeroSubheadline(homepageConfig.heroSubheadline || "");
      setHeroCtaText(homepageConfig.heroCtaText || "Explore Stories");
      setHeroCtaDestination(homepageConfig.heroCtaDestination || "/stories");
      setFeaturedStoryId(homepageConfig.featuredStoryId || "");
      setAnnouncementText(homepageConfig.announcementText || "");
      setAnnouncementEnabled(homepageConfig.announcementEnabled || false);
    }
  }, [homepageConfig]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);
    setSaveError(null);

    try {
      const res = await saveHomepageConfig({
        heroHeadline,
        heroSubheadline,
        heroCtaText,
        heroCtaDestination,
        featuredStoryId,
        announcementText,
        announcementEnabled,
      });

      if (res.success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        setSaveError(res.error || "Failed to save changes. Please try again.");
      }
    } catch (err: any) {
      setSaveError(err.message || "An error occurred");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#0F0F0F] tracking-tight">
              Homepage Content & Hero Banner
            </h1>
            <span className="px-2.5 py-0.5 text-xs font-mono rounded-full bg-[#C9281D]/10 text-[#C9281D] border border-[#C9281D]/20 font-semibold">
              Live CMS
            </span>
          </div>
          <p className="text-[#6B655C] text-xs sm:text-sm mt-1">
            Control the primary hero message, CTA destinations, top announcement bar, and featured stories across the public homepage.
          </p>
        </div>

        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-[#FAF8F3] border border-[#E8E4DC] text-xs font-semibold text-[#0F0F0F] shadow-sm transition self-start sm:self-auto"
        >
          <ExternalLink className="w-3.5 h-3.5 text-[#6B655C]" />
          <span>View Public Homepage</span>
        </Link>
      </div>

      {saveSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>Homepage updated successfully! Changes are live on the public website.</span>
        </div>
      )}

      {saveError && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs">
          {saveError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Top Announcement Bar */}
        <div className="rounded-2xl bg-white border border-[#E8E4DC] p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-[#FAF8F3] border border-[#E8E4DC] text-[#C9281D]">
                <Megaphone className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-sm text-[#0F0F0F]">
                  Top Announcement Strip
                </h3>
                <p className="text-[11px] text-[#6B655C]">
                  Optional notice displayed at the top of every public page.
                </p>
              </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={announcementEnabled}
                onChange={(e) => setAnnouncementEnabled(e.target.checked)}
                className="w-4 h-4 rounded text-[#C9281D] focus:ring-[#C9281D] border-[#E8E4DC]"
              />
              <span className="text-xs font-medium text-[#0F0F0F]">
                {announcementEnabled ? "Active & Visible" : "Disabled"}
              </span>
            </label>
          </div>

          {announcementEnabled && (
            <div>
              <label className="block text-xs font-semibold text-[#0F0F0F] mb-1.5">
                Announcement Text
              </label>
              <input
                type="text"
                value={announcementText}
                onChange={(e) => setAnnouncementText(e.target.value)}
                placeholder="e.g. Free UK Shipping on Collector Hardcover Editions | Order before Dec 18 for Holiday Delivery"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F3] border border-[#E8E4DC] text-xs text-[#0F0F0F] placeholder-[#8C827A] focus:outline-none focus:border-[#C9281D] focus:ring-1 focus:ring-[#C9281D]"
              />
            </div>
          )}
        </div>

        {/* Primary Hero Section */}
        <div className="rounded-2xl bg-white border border-[#E8E4DC] p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#FAF8F3] border border-[#E8E4DC] text-[#C9281D]">
              <LayoutTemplate className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-sm text-[#0F0F0F]">
                Hero Banner Content
              </h3>
              <p className="text-[11px] text-[#6B655C]">
                Controls the main headline, introductory narrative, and call to action on the homepage.
              </p>
            </div>
          </div>

          <div className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-[#0F0F0F] mb-1.5">
                Hero Heading (H1)
              </label>
              <input
                type="text"
                value={heroHeadline}
                onChange={(e) => setHeroHeadline(e.target.value)}
                required
                placeholder="e.g. Traditional Indian Stories for the Modern Generation"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F3] border border-[#E8E4DC] text-xs font-serif font-bold text-[#0F0F0F] placeholder-[#8C827A] focus:outline-none focus:border-[#C9281D] focus:ring-1 focus:ring-[#C9281D]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#0F0F0F] mb-1.5">
                Hero Subtitle / Description
              </label>
              <textarea
                value={heroSubheadline}
                onChange={(e) => setHeroSubheadline(e.target.value)}
                rows={3}
                required
                placeholder="Enter compelling description for the hero section..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F3] border border-[#E8E4DC] text-xs text-[#0F0F0F] placeholder-[#8C827A] focus:outline-none focus:border-[#C9281D] focus:ring-1 focus:ring-[#C9281D] leading-relaxed"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#0F0F0F] mb-1.5">
                  Call-to-Action (CTA) Button Text
                </label>
                <input
                  type="text"
                  value={heroCtaText}
                  onChange={(e) => setHeroCtaText(e.target.value)}
                  placeholder="e.g. Explore Stories"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F3] border border-[#E8E4DC] text-xs text-[#0F0F0F] focus:outline-none focus:border-[#C9281D]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0F0F0F] mb-1.5">
                  CTA Destination URL
                </label>
                <input
                  type="text"
                  value={heroCtaDestination}
                  onChange={(e) => setHeroCtaDestination(e.target.value)}
                  placeholder="e.g. /stories"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F3] border border-[#E8E4DC] text-xs font-mono text-[#0F0F0F] focus:outline-none focus:border-[#C9281D]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Featured Story Picker */}
        <div className="rounded-2xl bg-white border border-[#E8E4DC] p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#FAF8F3] border border-[#E8E4DC] text-[#C9281D]">
              <Star className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-sm text-[#0F0F0F]">
                Featured Hero Story
              </h3>
              <p className="text-[11px] text-[#6B655C]">
                Spotlighted story highlighted in featured sections across the site.
              </p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#0F0F0F] mb-1.5">
              Select Story
            </label>
            <select
              value={featuredStoryId}
              onChange={(e) => setFeaturedStoryId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F3] border border-[#E8E4DC] text-xs text-[#0F0F0F] focus:outline-none focus:border-[#C9281D]"
            >
              <option value="">(Select a featured story)</option>
              {stories.map((story) => (
                <option key={story.id} value={story.id}>
                  {story.title} {story.status === "draft" ? "(Draft)" : ""}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Live Preview Card */}
        <div className="rounded-2xl bg-[#FAF8F3] border border-[#E8E4DC] p-6 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-[#6B655C] uppercase tracking-wider">
            <Eye className="w-3.5 h-3.5" />
            <span>Live Hero Preview</span>
          </div>

          <div className="max-w-2xl bg-white p-6 rounded-xl border border-[#E8E4DC] shadow-sm space-y-3">
            {announcementEnabled && announcementText && (
              <div className="inline-block px-3 py-1 rounded-full bg-[#C9281D]/10 text-[#C9281D] text-[11px] font-semibold border border-[#C9281D]/20">
                {announcementText}
              </div>
            )}
            <h2 className="font-serif text-2xl font-bold text-[#0F0F0F] leading-tight">
              {heroHeadline || "Headline will appear here"}
            </h2>
            <p className="text-xs text-[#6B655C] leading-relaxed">
              {heroSubheadline || "Subheadline description will appear here"}
            </p>
            <div className="pt-2">
              <span className="inline-block px-4 py-2 rounded-xl bg-[#C9281D] text-white text-xs font-semibold shadow-sm">
                {heroCtaText || "Explore Stories"} →
              </span>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#C9281D] hover:bg-[#A82017] text-white text-xs font-semibold shadow-sm hover:shadow active:scale-95 transition disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? "Saving Live Website..." : "Save Homepage Content"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}

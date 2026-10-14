"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  BookOpen,
  Library,
  Mic,
  Home,
  Plus,
  ChevronRight,
  Sparkles,
  Eye,
  CheckCircle2,
  Clock,
  Radio,
  ExternalLink,
  Edit2,
} from "lucide-react";
import { useAdminCms } from "@/context/AdminCmsContext";
import StoryModal from "@/components/admin/StoryModal";
import { CmsStory } from "@/lib/cms-types";

export default function AdminDashboardPage() {
  const { stats, stories, editions, storytellers, homepage, toggleStoryStatus } = useAdminCms();
  const [selectedStory, setSelectedStory] = useState<CmsStory | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const publishedStories = stories.filter((s) => s.status === "published");
  const draftStories = stories.filter((s) => s.status === "draft");

  return (
    <div className="space-y-8 select-none">
      {/* 1. Header Hero Banner */}
      <div className="relative rounded-3xl p-6 sm:p-8 bg-white border border-[#E8E4DC] shadow-sm overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 text-[11px] font-mono uppercase tracking-wider rounded-full bg-[#FDF2F0] text-[#C9281D] border border-[#C9281D]/20 font-bold">
                StoryHour Console 2.0
              </span>
              <span className="text-[#696572] text-xs font-mono">
                {new Date().toLocaleDateString("en-GB", {
                  weekday: "short",
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-[#0F0F0F] tracking-tight">
              Publishing & Catalog Dashboard
            </h1>
            <p className="text-[#696572] text-xs sm:text-sm mt-1 max-w-xl">
              Manage stories, audiobook narration, physical book editions, and live homepage presentations for the public website.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => {
                setSelectedStory(null);
                setIsModalOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#C9281D] hover:bg-[#B52218] text-white text-xs font-bold shadow-sm transition active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Publish Story</span>
            </button>
            <Link
              href="/"
              target="_blank"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#FAF8F3] hover:bg-[#F4EFE6] text-[#0F0F0F] text-xs font-bold border border-[#E8E4DC] transition"
            >
              <Radio className="w-4 h-4 text-[#C9281D]" />
              <span>Public Storefront</span>
              <ExternalLink className="w-3.5 h-3.5 text-[#696572]" />
            </Link>
          </div>
        </div>
      </div>

      {/* 2. REAL Dashboard Statistics (Calculated from actual persisted content) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Metric 1: Published Stories */}
        <div className="p-5 rounded-2xl bg-white border border-[#E8E4DC] shadow-sm hover:border-[#C9281D]/40 transition group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#696572]">Published Stories</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-serif text-3xl font-black text-[#0F0F0F]">
              {stats?.publishedStories ?? publishedStories.length}
            </span>
            <span className="text-[11px] font-mono text-emerald-700 font-bold">
              Live on website
            </span>
          </div>
          <p className="text-[11px] text-[#696572] mt-1">
            Audiobooks and puppet skits available to readers
          </p>
        </div>

        {/* Metric 2: Draft Stories */}
        <div className="p-5 rounded-2xl bg-white border border-[#E8E4DC] shadow-sm hover:border-[#C9281D]/40 transition group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#696572]">Unpublished Drafts</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-700">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-serif text-3xl font-black text-[#0F0F0F]">
              {stats?.draftStories ?? draftStories.length}
            </span>
            <span className="text-[11px] font-mono text-amber-700 font-bold">
              In review
            </span>
          </div>
          <p className="text-[11px] text-[#696572] mt-1">
            Hidden from public website until published
          </p>
        </div>

        {/* Metric 3: Total Editions */}
        <div className="p-5 rounded-2xl bg-white border border-[#E8E4DC] shadow-sm hover:border-[#C9281D]/40 transition group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#696572]">Print Editions & Books</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-700">
              <Library className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-serif text-3xl font-black text-[#0F0F0F]">
              {stats?.totalEditions ?? editions.length}
            </span>
            <span className="text-[11px] font-mono text-blue-700 font-bold">
              In inventory
            </span>
          </div>
          <p className="text-[11px] text-[#696572] mt-1">
            Clothbound hardcovers & box sets on shelf
          </p>
        </div>

        {/* Metric 4: Storytellers */}
        <div className="p-5 rounded-2xl bg-white border border-[#E8E4DC] shadow-sm hover:border-[#C9281D]/40 transition group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#696572]">Storytellers & Artists</span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-700">
              <Mic className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-serif text-3xl font-black text-[#0F0F0F]">
              {stats?.totalStorytellers ?? storytellers.length}
            </span>
            <span className="text-[11px] font-mono text-purple-700 font-bold">
              Team profiles
            </span>
          </div>
          <p className="text-[11px] text-[#696572] mt-1">
            Vocalists, translators, and directors listed
          </p>
        </div>
      </div>

      {/* 3. Main Operational Sections (Stories Table + Activity Log & Homepage Status) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2/3 width): Latest Catalog Content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl bg-white border border-[#E8E4DC] p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-serif font-bold text-base text-[#0F0F0F]">Stories & Audio Titles</h3>
                <p className="text-xs text-[#696572]">
                  Live state reflected on public /stories and player
                </p>
              </div>
              <Link
                href="/admin/stories"
                className="text-xs font-bold text-[#C9281D] hover:underline flex items-center gap-1 group"
              >
                <span>View All ({stories.length})</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[#E8E4DC] bg-[#FAF8F3] text-[10px] font-mono uppercase text-[#696572]">
                    <th className="py-3 px-3 font-bold">Cover & Title</th>
                    <th className="py-3 px-3 font-bold">Language</th>
                    <th className="py-3 px-3 font-bold">Duration</th>
                    <th className="py-3 px-3 font-bold">Publication</th>
                    <th className="py-3 px-3 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8E4DC] text-[#0F0F0F]">
                  {stories.slice(0, 5).map((story) => (
                    <tr key={story.id} className="hover:bg-[#FAF8F3] transition group">
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-3">
                          <div className="relative w-10 h-14 rounded-lg overflow-hidden bg-zinc-100 flex-shrink-0 shadow-sm">
                            <Image
                              src={story.coverImage}
                              alt={story.title}
                              fill
                              className="object-cover"
                              unoptimized
                            />
                          </div>
                          <div className="min-w-0 max-w-xs">
                            <div className="font-bold text-[#0F0F0F] text-xs line-clamp-1 group-hover:text-[#C9281D] transition">
                              {story.title}
                            </div>
                            <div className="text-[11px] text-[#696572] truncate">
                              {story.storyteller}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-3 font-mono text-[11px]">
                        <span className="px-2 py-0.5 rounded-full bg-[#F4EFE6] text-[#0F0F0F] font-medium border border-[#E8E4DC]">
                          {story.language}
                        </span>
                      </td>

                      <td className="py-3 px-3 font-mono text-[11px] text-[#696572]">
                        {story.duration}
                      </td>

                      <td className="py-3 px-3">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                            story.status === "published"
                              ? "bg-emerald-50 text-emerald-800 border border-emerald-300"
                              : "bg-amber-50 text-amber-800 border border-amber-300"
                          }`}
                        >
                          {story.status === "published" ? "Live" : "Draft"}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => toggleStoryStatus(story.id, story.status)}
                            className="px-2 py-1 rounded-lg text-[10px] font-bold border transition bg-white hover:bg-zinc-50 border-[#E8E4DC] text-[#0F0F0F]"
                          >
                            {story.status === "published" ? "Unpublish" : "Publish"}
                          </button>
                          <button
                            onClick={() => {
                              setSelectedStory(story);
                              setIsModalOpen(true);
                            }}
                            className="p-1 rounded-lg hover:bg-[#F4EFE6] text-[#696572] hover:text-[#0F0F0F] transition"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column (1/3 width): Activity Feed & Homepage Config */}
        <div className="space-y-6">
          {/* Homepage Presentation Card */}
          <div className="rounded-2xl bg-white border border-[#E8E4DC] p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Home className="w-4 h-4 text-[#C9281D]" />
                <h3 className="font-serif font-bold text-sm text-[#0F0F0F]">Homepage Hero</h3>
              </div>
              <Link href="/admin/homepage" className="text-xs font-bold text-[#C9281D] hover:underline">
                Edit
              </Link>
            </div>

            <div className="p-3.5 rounded-xl bg-[#FAF8F3] border border-[#E8E4DC] text-xs space-y-2.5">
              <div>
                <div className="font-mono text-[10px] text-[#696572] uppercase">Live Headline</div>
                <div className="font-serif font-bold text-sm text-[#0F0F0F] line-clamp-1 mt-0.5">
                  &ldquo;{homepage?.heroHeadline || "the greatest stories ever told"}&rdquo;
                </div>
                <p className="text-[11px] text-[#696572] line-clamp-2 leading-relaxed mt-0.5">
                  {homepage?.heroSubheadline || "Discover Indian mythology through audiobooks."}
                </p>
              </div>
              {/* Announcement Banner Row */}
              {homepage?.announcementText && (
                <div className="pt-2 border-t border-[#E8E4DC]">
                  <div className="flex items-center gap-1.5 mb-1">
                    <div className="font-mono text-[10px] text-[#696572] uppercase">Announcement Bar</div>
                    <span
                      className={`px-1.5 py-0.5 rounded-full text-[9px] font-mono font-bold border ${
                        homepage.announcementEnabled
                          ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                          : "bg-zinc-100 text-zinc-500 border-zinc-200"
                      }`}
                    >
                      {homepage.announcementEnabled ? "Live" : "Off"}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#0F0F0F] font-semibold leading-snug line-clamp-2">
                    {homepage.announcementText}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Real Administrative Activity Timeline */}
          <div className="rounded-2xl bg-white border border-[#E8E4DC] p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-serif font-bold text-sm text-[#0F0F0F]">Recent CMS Activity</h3>
              <span className="text-[10px] text-[#696572] font-mono">Real-time log</span>
            </div>

            <div className="space-y-3 text-xs">
              {(stats?.recentActivity || []).slice(0, 5).map((act) => (
                <div key={act.id} className="flex items-start gap-2.5 pb-2 border-b border-[#E8E4DC] last:border-b-0">
                  <div className="w-2 h-2 rounded-full bg-[#C9281D] mt-1.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-[#0F0F0F] truncate">{act.title}</div>
                    <div className="text-[11px] text-[#696572] flex items-center justify-between mt-0.5">
                      <span className="capitalize font-mono text-[10px]">{act.action} {act.type}</span>
                      <span className="text-[10px] font-mono">
                        {new Date(act.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  </div>
                </div>
              ))}

              {(!stats?.recentActivity || stats.recentActivity.length === 0) && (
                <div className="text-zinc-400 text-xs py-4 text-center">No recent activity logged.</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Story Modal */}
      <StoryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        storyToEdit={selectedStory}
      />
    </div>
  );
}

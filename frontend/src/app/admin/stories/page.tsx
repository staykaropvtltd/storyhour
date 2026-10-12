"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  BookOpen,
  Plus,
  Search,
  Edit2,
  Trash2,
  CheckCircle2,
  Clock,
  Play,
  Volume2,
  Star,
} from "lucide-react";
import { useAdminCms } from "@/context/AdminCmsContext";
import { CmsStory } from "@/lib/cms-types";
import StoryModal from "@/components/admin/StoryModal";

export default function AdminStoriesPage() {
  const { stories, toggleStoryStatus, removeStory, saveStory } = useAdminCms();
  const [search, setSearch] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState<string>("All");
  const [selectedStatus, setSelectedStatus] = useState<string>("All");
  const [editingStory, setEditingStory] = useState<CmsStory | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [previewAudioUrl, setPreviewAudioUrl] = useState<string | null>(null);

  const filteredStories = stories.filter((story) => {
    const matchesSearch =
      story.title.toLowerCase().includes(search.toLowerCase()) ||
      story.storyteller.toLowerCase().includes(search.toLowerCase()) ||
      story.description.toLowerCase().includes(search.toLowerCase());

    const matchesLanguage = selectedLanguage === "All" || story.language === selectedLanguage;
    const matchesStatus = selectedStatus === "All" || story.status === selectedStatus;

    return matchesSearch && matchesLanguage && matchesStatus;
  });

  const handleEdit = (story: CmsStory) => {
    setEditingStory(story);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setEditingStory(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string, title: string) => {
    if (window.confirm(`Permanently delete "${title}" from StoryHour?`)) {
      await removeStory(id);
    }
  };

  const handleToggleFeatured = async (story: CmsStory) => {
    await saveStory({ featured: !story.featured }, story.id);
  };

  return (
    <div className="space-y-6 select-none">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-[#0F0F0F] tracking-tight">
              Stories & Audio CMS
            </h1>
            <span className="px-2 py-0.5 text-xs font-mono rounded-full bg-[#FDF2F0] text-[#C9281D] border border-[#C9281D]/20 font-bold">
              {filteredStories.length} total
            </span>
          </div>
          <p className="text-[#696572] text-xs sm:text-sm mt-1">
            Manage audiobooks, puppet skits, and multilingual epics. Published stories appear live on the website.
          </p>
        </div>

        <button
          onClick={handleAddNew}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#C9281D] hover:bg-[#B52218] text-white text-xs font-bold shadow-sm transition active:scale-95 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Publish New Story</span>
        </button>
      </div>

      {/* 2. Search & Filters */}
      <div className="p-4 rounded-2xl bg-white border border-[#E8E4DC] flex flex-col md:flex-row items-center gap-3 shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-[#696572] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search stories by title, narrator, or keyword..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#FAF8F3] border border-[#E8E4DC] text-xs text-[#0F0F0F] placeholder-[#696572] focus:outline-none focus:border-[#C9281D]"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="w-full md:w-44 px-3 py-2 rounded-xl bg-[#FAF8F3] border border-[#E8E4DC] text-xs text-[#0F0F0F] focus:outline-none"
          >
            <option value="All">All Languages</option>
            <option value="English">English</option>
            <option value="Hindi">Hindi (हिंदी)</option>
            <option value="Telugu">Telugu (తెలుగు)</option>
            <option value="Multilingual">Multilingual</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full md:w-40 px-3 py-2 rounded-xl bg-[#FAF8F3] border border-[#E8E4DC] text-xs text-[#0F0F0F] focus:outline-none"
          >
            <option value="All">All Statuses</option>
            <option value="published">Published (Live)</option>
            <option value="draft">Drafts (Hidden)</option>
          </select>
        </div>
      </div>

      {/* 3. Audio Preview Bar if triggered */}
      {previewAudioUrl && (
        <div className="p-3.5 rounded-xl bg-white border border-[#C9281D]/30 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#FDF2F0] text-[#C9281D] flex items-center justify-center">
              <Volume2 className="w-4 h-4" />
            </div>
            <div className="text-xs">
              <div className="font-bold text-[#0F0F0F]">Previewing Story Audio Stream</div>
              <div className="text-[10px] text-[#696572] font-mono truncate max-w-sm sm:max-w-md">
                {previewAudioUrl}
              </div>
            </div>
          </div>
          <button
            onClick={() => setPreviewAudioUrl(null)}
            className="px-3 py-1 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-xs font-semibold text-[#0F0F0F]"
          >
            Close
          </button>
        </div>
      )}

      {/* 4. Stories Data Table */}
      <div className="rounded-2xl bg-white border border-[#E8E4DC] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#E8E4DC] bg-[#FAF8F3] text-[10px] font-mono uppercase text-[#696572]">
                <th className="py-3.5 px-4 font-bold">Story & Cover</th>
                <th className="py-3.5 px-4 font-bold">Narrator</th>
                <th className="py-3.5 px-4 font-bold">Language</th>
                <th className="py-3.5 px-4 font-bold">Duration</th>
                <th className="py-3.5 px-4 font-bold">Publication Status</th>
                <th className="py-3.5 px-4 font-bold text-center">Featured</th>
                <th className="py-3.5 px-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E4DC] text-[#0F0F0F]">
              {filteredStories.map((story) => (
                <tr key={story.id} className="hover:bg-[#FAF8F3] transition group">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="relative w-12 h-16 rounded-lg overflow-hidden bg-zinc-100 flex-shrink-0 shadow-sm">
                        <Image
                          src={story.coverImage}
                          alt={story.title}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                        {story.audioPreviewUrl && (
                          <button
                            onClick={() => setPreviewAudioUrl(story.audioPreviewUrl)}
                            title="Preview Audio"
                            className="absolute inset-0 bg-black/40 hover:bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                          >
                            <Play className="w-3.5 h-3.5 text-white fill-current" />
                          </button>
                        )}
                      </div>
                      <div className="min-w-0 max-w-xs">
                        <div className="font-bold text-[#0F0F0F] text-xs line-clamp-1 group-hover:text-[#C9281D] transition">
                          {story.title}
                        </div>
                        {story.subtitle && (
                          <div className="text-[11px] text-[#696572] line-clamp-1 mt-0.5">
                            {story.subtitle}
                          </div>
                        )}
                        <div className="text-[10px] text-[#696572] font-mono mt-0.5">
                          ID: {story.id}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="font-semibold text-[#0F0F0F]">{story.storyteller}</span>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-[#FAF8F3] text-[#0F0F0F] border border-[#E8E4DC] font-semibold">
                      {story.language}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 font-mono text-[11px]">
                    <div>{story.duration}</div>
                    <div className="text-[10px] text-[#696572]">{story.chaptersCount} chapters</div>
                  </td>

                  <td className="py-3.5 px-4">
                    <button
                      onClick={() => toggleStoryStatus(story.id, story.status)}
                      title="Click to toggle publish status"
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold border transition ${
                        story.status === "published"
                          ? "bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100"
                          : "bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100"
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${story.status === "published" ? "bg-emerald-600" : "bg-amber-600"}`} />
                      <span>{story.status === "published" ? "Published (Live)" : "Draft (Hidden)"}</span>
                    </button>
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    <button
                      onClick={() => handleToggleFeatured(story)}
                      title={story.featured ? "Unfeature" : "Feature on Homepage"}
                      className="p-1 rounded hover:bg-[#F4EFE6] transition"
                    >
                      <Star
                        className={`w-4 h-4 ${
                          story.featured
                            ? "text-[#C9281D] fill-[#C9281D]"
                            : "text-zinc-300 hover:text-zinc-500"
                        }`}
                      />
                    </button>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleEdit(story)}
                        className="p-1.5 rounded-lg bg-zinc-100 hover:bg-[#F4EFE6] text-[#0F0F0F] transition"
                        title="Edit Story"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(story.id, story.title)}
                        className="p-1.5 rounded-lg bg-zinc-100 hover:bg-red-50 text-zinc-400 hover:text-red-600 transition"
                        title="Delete Story"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredStories.length === 0 && (
          <div className="py-16 text-center text-[#696572] text-xs">
            No stories found matching your filter criteria.
          </div>
        )}
      </div>

      <StoryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        storyToEdit={editingStory}
      />
    </div>
  );
}

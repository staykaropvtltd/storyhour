"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  BookOpen,
  Plus,
  Search,
  Filter,
  Star,
  Edit2,
  Trash2,
  Play,
  Volume2,
  Clock,
  Layers,
  Sparkles,
} from "lucide-react";
import { useAdmin } from "@/context/AdminContext";
import { Story } from "@/data/storyhour-data";
import StoryEditModal from "@/components/admin/StoryEditModal";

export default function AdminStoriesPage() {
  const { stories, toggleStoryFeatured, deleteStory } = useAdmin();
  const [search, setSearch] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState<string>("All");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [editingStory, setEditingStory] = useState<Story | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [playingAudioUrl, setPlayingAudioUrl] = useState<string | null>(null);

  // Filter stories
  const filteredStories = stories.filter((story) => {
    const matchesSearch =
      story.title.toLowerCase().includes(search.toLowerCase()) ||
      story.storyteller.toLowerCase().includes(search.toLowerCase()) ||
      story.description.toLowerCase().includes(search.toLowerCase());

    const matchesLanguage = selectedLanguage === "All" || story.language === selectedLanguage;
    const matchesCategory = selectedCategory === "All" || story.category === selectedCategory;

    return matchesSearch && matchesLanguage && matchesCategory;
  });

  const handleEdit = (story: Story) => {
    setEditingStory(story);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setEditingStory(null);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string, title: string) => {
    if (window.confirm(`Delete story "${title}" from catalog?`)) {
      deleteStory(id);
    }
  };

  return (
    <div className="space-y-6 select-none">
      {/* 1. Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Stories & Audio CMS
            </h1>
            <span className="px-2 py-0.5 text-xs font-mono rounded-full bg-[#C5A880]/15 text-[#C5A880] border border-[#C5A880]/30 font-semibold">
              {filteredStories.length} titles
            </span>
          </div>
          <p className="text-zinc-400 text-xs sm:text-sm mt-1">
            Curate and publish audiobooks, performance skits, and multilingual folklore.
          </p>
        </div>

        <button
          onClick={handleAddNew}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#C9281D] to-[#A81F16] text-white text-xs font-semibold shadow-lg shadow-[#C9281D]/30 hover:brightness-110 active:scale-95 transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Story</span>
        </button>
      </div>

      {/* 2. Search & Filter Bar */}
      <div className="p-4 rounded-2xl bg-[#121216] border border-[#23232b] flex flex-col md:flex-row items-center gap-3 shadow-lg">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, narrator, or keyword..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#C5A880]"
          />
        </div>

        {/* Language Filter */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="w-full md:w-44 px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 focus:outline-none focus:border-[#C5A880]"
          >
            <option value="All">All Languages</option>
            <option value="English">English</option>
            <option value="Hindi">Hindi (हिंदी)</option>
            <option value="Telugu">Telugu (తెలుగు)</option>
            <option value="Multilingual">Multilingual</option>
          </select>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full md:w-48 px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 focus:outline-none focus:border-[#C5A880]"
          >
            <option value="All">All Categories</option>
            <option value="Mythology & Epics">Mythology & Epics</option>
            <option value="Folk Tales">Folk Tales</option>
            <option value="Wisdom & Bravery">Wisdom & Bravery</option>
            <option value="History & Culture">History & Culture</option>
          </select>
        </div>
      </div>

      {/* 3. Audio Player Bar if playing */}
      {playingAudioUrl && (
        <div className="p-3.5 rounded-xl bg-gradient-to-r from-zinc-900 to-[#1b171c] border border-[#C5A880]/30 flex items-center justify-between shadow-xl animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#C5A880]/20 text-[#C5A880] flex items-center justify-center animate-pulse">
              <Volume2 className="w-4 h-4" />
            </div>
            <div className="text-xs">
              <div className="font-semibold text-white">Previewing Story Audio Stream</div>
              <div className="text-[10px] text-zinc-400 font-mono truncate max-w-sm sm:max-w-md">
                {playingAudioUrl}
              </div>
            </div>
          </div>
          <button
            onClick={() => setPlayingAudioUrl(null)}
            className="px-3 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-300"
          >
            Stop
          </button>
        </div>
      )}

      {/* 4. Stories Data Table */}
      <div className="rounded-2xl bg-[#121216] border border-[#23232b] shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-zinc-800 bg-[#0e0e12] text-[10px] font-mono uppercase text-zinc-500">
                <th className="py-3.5 px-4 font-semibold">Story & Cover</th>
                <th className="py-3.5 px-4 font-semibold">Narrator / Ensemble</th>
                <th className="py-3.5 px-4 font-semibold">Language</th>
                <th className="py-3.5 px-4 font-semibold">Duration</th>
                <th className="py-3.5 px-4 font-semibold">Audience & Category</th>
                <th className="py-3.5 px-4 font-semibold text-center">Featured</th>
                <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
              {filteredStories.map((story) => (
                <tr key={story.id} className="hover:bg-zinc-800/30 transition group">
                  {/* Story & Cover */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="relative w-12 h-16 rounded-lg overflow-hidden bg-zinc-800 flex-shrink-0 shadow">
                        <Image
                          src={story.coverImage}
                          alt={story.title}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                        {story.audioPreviewUrl && (
                          <button
                            onClick={() => setPlayingAudioUrl(story.audioPreviewUrl)}
                            title="Preview Audio"
                            className="absolute inset-0 bg-black/40 hover:bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                          >
                            <Play className="w-3.5 h-3.5 text-white fill-current" />
                          </button>
                        )}
                      </div>
                      <div className="min-w-0 max-w-xs">
                        <div className="font-semibold text-white text-xs line-clamp-1 group-hover:text-[#E8D3B4] transition">
                          {story.title}
                        </div>
                        {story.subtitle && (
                          <div className="text-[11px] text-zinc-500 line-clamp-1 mt-0.5">
                            {story.subtitle}
                          </div>
                        )}
                        <div className="text-[10px] text-zinc-600 font-mono mt-0.5">
                          ID: {story.id}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Narrator */}
                  <td className="py-3.5 px-4">
                    <span className="font-medium text-zinc-200">{story.storyteller}</span>
                  </td>

                  {/* Language */}
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-[#C5A880]/15 text-[#C5A880] border border-[#C5A880]/20 font-semibold">
                      {story.language}
                    </span>
                  </td>

                  {/* Duration & Chapters */}
                  <td className="py-3.5 px-4 font-mono text-[11px]">
                    <div>{story.duration}</div>
                    <div className="text-[10px] text-zinc-500">{story.chaptersCount} chapters</div>
                  </td>

                  {/* Audience & Category */}
                  <td className="py-3.5 px-4">
                    <div className="text-zinc-200">{story.category}</div>
                    <div className="text-[10px] text-zinc-500">{story.audience}</div>
                  </td>

                  {/* Featured */}
                  <td className="py-3.5 px-4 text-center">
                    <button
                      onClick={() => toggleStoryFeatured(story.id)}
                      title={story.featured ? "Unfeature" : "Feature on Homepage"}
                      className="p-1 rounded hover:bg-zinc-800 transition"
                    >
                      <Star
                        className={`w-4 h-4 ${
                          story.featured
                            ? "text-[#D4AF37] fill-[#D4AF37]"
                            : "text-zinc-600 hover:text-zinc-400"
                        }`}
                      />
                    </button>
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleEdit(story)}
                        className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition"
                        title="Edit Story"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(story.id, story.title)}
                        className="p-1.5 rounded-lg bg-zinc-800 hover:bg-red-500/20 text-zinc-400 hover:text-red-400 transition"
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
          <div className="py-16 text-center text-zinc-500 text-xs">
            No stories match the selected filter criteria.
          </div>
        )}
      </div>

      {/* Edit / Create Modal */}
      <StoryEditModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        storyToEdit={editingStory}
      />
    </div>
  );
}

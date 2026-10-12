"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Mic, Plus, Search, MapPin, Globe, Sparkles, BookOpen, Trash2 } from "lucide-react";
import { useAdmin } from "@/context/AdminContext";
import { Storyteller } from "@/data/storyhour-data";

export default function AdminStorytellersPage() {
  const { storytellers, addStoryteller, deleteStoryteller } = useAdmin();
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);

  // New storyteller form state
  const [name, setName] = useState("");
  const [role, setRole] = useState("Classical Vocalist & Epic Narrator");
  const [region, setRegion] = useState("Varanasi & London");
  const [languages, setLanguages] = useState("English, Hindi");
  const [bio, setBio] = useState("");
  const [connectedStoryTitle, setConnectedStoryTitle] = useState("Ramayana Series");
  const [portraitImage, setPortraitImage] = useState("https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80");

  const filteredStorytellers = storytellers.filter(
    (st) =>
      st.name.toLowerCase().includes(search.toLowerCase()) ||
      st.role.toLowerCase().includes(search.toLowerCase()) ||
      st.region.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    addStoryteller({
      name: name.trim(),
      role: role.trim(),
      region: region.trim(),
      languages: languages.split(",").map((l) => l.trim()),
      bio: bio.trim(),
      connectedStoryTitle: connectedStoryTitle.trim(),
      portraitImage: portraitImage.trim(),
    });

    setName("");
    setBio("");
    setShowAddModal(false);
  };

  const handleDelete = (id: string, stName: string) => {
    if (window.confirm(`Remove storyteller "${stName}"?`)) {
      deleteStoryteller(id);
    }
  };

  return (
    <div className="space-y-6 select-none">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Storytellers & Voice Cast
            </h1>
            <span className="px-2 py-0.5 text-xs font-mono rounded-full bg-[#C5A880]/15 text-[#C5A880] border border-[#C5A880]/30 font-semibold">
              {filteredStorytellers.length} artists
            </span>
          </div>
          <p className="text-zinc-400 text-xs sm:text-sm mt-1">
            Voice artists, classical balladeers, puppeteers, and folklore translators.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#C5A880] to-[#A38257] text-zinc-950 text-xs font-bold shadow-lg shadow-[#C5A880]/20 hover:brightness-110 active:scale-95 transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Storyteller</span>
        </button>
      </div>

      {/* 2. Search */}
      <div className="p-4 rounded-2xl bg-[#121216] border border-[#23232b] flex items-center shadow-lg">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search artists by name, voice role, or region..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#C5A880]"
          />
        </div>
      </div>

      {/* 3. Storytellers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredStorytellers.map((st) => (
          <div
            key={st.id}
            className="rounded-2xl bg-[#121216] border border-[#23232b] p-5 shadow-xl hover:border-zinc-700 transition flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-start gap-4">
                <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-zinc-800 flex-shrink-0 shadow-md">
                  <Image
                    src={st.portraitImage}
                    alt={st.name}
                    fill
                    className="object-cover group-hover:scale-105 transition duration-300"
                    unoptimized
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-serif font-bold text-base text-white truncate group-hover:text-[#E8D3B4] transition">
                    {st.name}
                  </h3>
                  <p className="text-xs text-[#C5A880] truncate mt-0.5">{st.role}</p>
                  <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 mt-1">
                    <MapPin className="w-3 h-3 text-zinc-500" />
                    <span>{st.region}</span>
                  </div>
                </div>
              </div>

              {/* Languages */}
              <div className="mt-3 flex flex-wrap gap-1">
                {st.languages.map((lang) => (
                  <span
                    key={lang}
                    className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-zinc-800 text-zinc-300"
                  >
                    {lang}
                  </span>
                ))}
              </div>

              {/* Bio */}
              <p className="mt-3 text-xs text-zinc-400 line-clamp-3 leading-relaxed">
                {st.bio}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-zinc-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-zinc-500 text-[11px]">
                <BookOpen className="w-3.5 h-3.5 text-[#C5A880]" />
                <span className="truncate max-w-[160px]">{st.connectedStoryTitle}</span>
              </div>
              <button
                onClick={() => handleDelete(st.id, st.name)}
                className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-zinc-800 transition"
                title="Remove artist"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Storyteller Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowAddModal(false)} />
          <div className="relative w-full max-w-lg rounded-2xl bg-[#131317] border border-[#272730] shadow-2xl p-6 z-10 animate-zoom-in-95 text-zinc-200">
            <h3 className="font-serif font-bold text-lg text-white mb-4">Add Artist / Storyteller</h3>
            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div>
                <label className="block text-zinc-300 mb-1 font-semibold">Artist Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Pandit Radhakrishna Shastri"
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white focus:outline-none focus:border-[#C5A880]"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 mb-1 font-semibold">Role</label>
                  <input
                    type="text"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-zinc-300 mb-1 font-semibold">Region / Base</label>
                  <input
                    type="text"
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-zinc-300 mb-1 font-semibold">Languages (comma separated)</label>
                <input
                  type="text"
                  value={languages}
                  onChange={(e) => setLanguages(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-zinc-300 mb-1 font-semibold">Portrait Image URL</label>
                <input
                  type="url"
                  value={portraitImage}
                  onChange={(e) => setPortraitImage(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white font-mono focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-zinc-300 mb-1 font-semibold">Associated Epic / Story Title</label>
                <input
                  type="text"
                  value={connectedStoryTitle}
                  onChange={(e) => setConnectedStoryTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-zinc-300 mb-1 font-semibold">Biography</label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Master of Carnatic storytelling traditions and expressive Sanskrit recitations..."
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white focus:outline-none"
                />
              </div>
              <div className="pt-3 border-t border-zinc-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#C5A880] text-zinc-950 font-bold"
                >
                  Save Artist
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

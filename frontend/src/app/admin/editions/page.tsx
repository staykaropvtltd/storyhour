"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Library,
  Plus,
  Search,
  Edit2,
  Trash2,
  PoundSterling,
  Layers,
  Book,
  Clock,
  Sparkles,
} from "lucide-react";
import { useAdmin } from "@/context/AdminContext";
import { Edition } from "@/data/editions-data";
import EditionEditModal from "@/components/admin/EditionEditModal";

export default function AdminEditionsPage() {
  const { editions, deleteEdition } = useAdmin();
  const [search, setSearch] = useState("");
  const [selectedFormat, setSelectedFormat] = useState("All");
  const [editingEdition, setEditingEdition] = useState<Edition | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredEditions = editions.filter((edition) => {
    const matchesSearch =
      edition.title.toLowerCase().includes(search.toLowerCase()) ||
      edition.codeName.toLowerCase().includes(search.toLowerCase()) ||
      edition.storyteller.toLowerCase().includes(search.toLowerCase());

    const matchesFormat =
      selectedFormat === "All" ||
      (selectedFormat === "Hardcover" && edition.bookFormat.toLowerCase().includes("hardcover")) ||
      (selectedFormat === "BoxSet" && edition.bookFormat.toLowerCase().includes("box"));

    return matchesSearch && matchesFormat;
  });

  const handleEdit = (edition: Edition) => {
    setEditingEdition(edition);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setEditingEdition(null);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string, title: string) => {
    if (window.confirm(`Delete edition "${title}"?`)) {
      deleteEdition(id);
    }
  };

  return (
    <div className="space-y-6 select-none">
      {/* 1. Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Editions & Print Inventory
            </h1>
            <span className="px-2 py-0.5 text-xs font-mono rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/30 font-semibold">
              {filteredEditions.length} editions
            </span>
          </div>
          <p className="text-zinc-400 text-xs sm:text-sm mt-1">
            Manage physical clothbound editions, deluxe collector box sets, and retail pricing.
          </p>
        </div>

        <button
          onClick={handleAddNew}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-semibold shadow-lg shadow-blue-600/30 hover:brightness-110 active:scale-95 transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Edition</span>
        </button>
      </div>

      {/* 2. Filter Bar */}
      <div className="p-4 rounded-2xl bg-[#121216] border border-[#23232b] flex flex-col md:flex-row items-center gap-3 shadow-lg">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, edition code (e.g. SH-ED), or format..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <select
          value={selectedFormat}
          onChange={(e) => setSelectedFormat(e.target.value)}
          className="w-full md:w-56 px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 focus:outline-none focus:border-blue-500"
        >
          <option value="All">All Formats</option>
          <option value="Hardcover">Hardcover & Clothbound</option>
          <option value="BoxSet">Box Sets & Special Editions</option>
        </select>
      </div>

      {/* 3. Editions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredEditions.map((edition) => (
          <div
            key={edition.id}
            className="rounded-2xl bg-[#121216] border border-[#23232b] p-5 shadow-xl hover:border-zinc-700 transition flex flex-col justify-between group"
          >
            <div>
              {/* Cover & Code header */}
              <div className="flex items-start gap-4">
                <div className="relative w-20 h-28 rounded-xl overflow-hidden bg-zinc-800 flex-shrink-0 shadow-md">
                  <Image
                    src={edition.coverImage}
                    alt={edition.title}
                    fill
                    className="object-cover group-hover:scale-105 transition duration-300"
                    unoptimized
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-blue-500/15 text-blue-400 font-bold">
                      {edition.codeName}
                    </span>
                    <span className="text-[10px] text-zinc-500 font-mono">
                      {edition.year}
                    </span>
                  </div>
                  <h3 className="font-serif font-bold text-sm text-white line-clamp-2 mt-1.5 group-hover:text-blue-300 transition">
                    {edition.title}
                  </h3>
                  {edition.nativeTitle && (
                    <p className="text-xs text-[#C5A880] mt-0.5 font-medium">{edition.nativeTitle}</p>
                  )}
                  <p className="text-[11px] text-zinc-400 line-clamp-1 mt-1">
                    {edition.bookFormat}
                  </p>
                </div>
              </div>

              {/* Spec pills */}
              <div className="mt-4 pt-3 border-t border-zinc-800/80 grid grid-cols-3 gap-2 text-center text-[10px] font-mono">
                <div className="p-1.5 rounded-lg bg-zinc-900">
                  <div className="text-zinc-500">Pages</div>
                  <div className="text-zinc-200 font-bold mt-0.5">{edition.pagesCount}</div>
                </div>
                <div className="p-1.5 rounded-lg bg-zinc-900">
                  <div className="text-zinc-500">Chapters</div>
                  <div className="text-zinc-200 font-bold mt-0.5">{edition.chaptersCount}</div>
                </div>
                <div className="p-1.5 rounded-lg bg-zinc-900">
                  <div className="text-zinc-500">Language</div>
                  <div className="text-[#C5A880] font-bold mt-0.5">{edition.language}</div>
                </div>
              </div>
            </div>

            {/* Price & Action footer */}
            <div className="mt-5 pt-3 border-t border-zinc-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-zinc-500 font-mono block">Retail Price</span>
                <span className="font-serif font-black text-lg text-white">
                  £{edition.price.toFixed(2)}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleEdit(edition)}
                  className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-200 hover:text-white flex items-center gap-1.5 transition"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => handleDelete(edition.id, edition.title)}
                  className="p-1.5 rounded-xl bg-zinc-800 hover:bg-red-500/20 text-zinc-400 hover:text-red-400 transition"
                  title="Delete Edition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredEditions.length === 0 && (
        <div className="py-16 text-center text-zinc-500 text-xs">
          No editions found matching your search.
        </div>
      )}

      {/* Edit / Add Modal */}
      <EditionEditModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editionToEdit={editingEdition}
      />
    </div>
  );
}

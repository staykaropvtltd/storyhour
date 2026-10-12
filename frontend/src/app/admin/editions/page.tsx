"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  CheckCircle2,
  Clock,
  Sparkles,
  BookOpen,
} from "lucide-react";
import { useAdminCms } from "@/context/AdminCmsContext";
import { CmsEdition } from "@/lib/cms-types";
import EditionModal from "@/components/admin/EditionModal";

export default function AdminEditionsPage() {
  const { editions, removeEdition, toggleEditionStatus, isLoading } = useAdminCms();
  const [search, setSearch] = useState("");
  const [selectedFormat, setSelectedFormat] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [editingEdition, setEditingEdition] = useState<CmsEdition | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredEditions = editions.filter((edition) => {
    const matchesSearch =
      edition.title.toLowerCase().includes(search.toLowerCase()) ||
      (edition.codeName && edition.codeName.toLowerCase().includes(search.toLowerCase())) ||
      (edition.storyteller && edition.storyteller.toLowerCase().includes(search.toLowerCase()));

    const matchesFormat =
      selectedFormat === "All" ||
      (selectedFormat === "Hardcover" && edition.bookFormat?.toLowerCase().includes("hardcover")) ||
      (selectedFormat === "BoxSet" && edition.bookFormat?.toLowerCase().includes("box"));

    const matchesStatus =
      selectedStatus === "all" || edition.status === selectedStatus;

    return matchesSearch && matchesFormat && matchesStatus;
  });

  const handleEdit = (edition: CmsEdition) => {
    setEditingEdition(edition);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setEditingEdition(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete edition "${title}"? This cannot be undone.`)) {
      await removeEdition(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#0F0F0F] tracking-tight">
              Editions & Book Inventory
            </h1>
            <span className="px-2.5 py-0.5 text-xs font-mono rounded-full bg-[#C9281D]/10 text-[#C9281D] border border-[#C9281D]/20 font-semibold">
              {filteredEditions.length} editions
            </span>
          </div>
          <p className="text-[#6B655C] text-xs sm:text-sm mt-1">
            Manage physical clothbound editions, deluxe collector box sets, and live retail inventory.
          </p>
        </div>

        <button
          onClick={handleAddNew}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#C9281D] hover:bg-[#A82017] text-white text-xs font-semibold shadow-sm hover:shadow active:scale-95 transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Edition</span>
        </button>
      </div>

      {/* 2. Filter Bar */}
      <div className="p-4 rounded-2xl bg-white border border-[#E8E4DC] flex flex-col md:flex-row items-center gap-3 shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-[#8C827A] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, edition code (e.g. SH-ED-01), or narrator..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#FAF8F3] border border-[#E8E4DC] text-xs text-[#0F0F0F] placeholder-[#8C827A] focus:outline-none focus:border-[#C9281D] focus:ring-1 focus:ring-[#C9281D]"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={selectedFormat}
            onChange={(e) => setSelectedFormat(e.target.value)}
            className="w-full md:w-48 px-3 py-2 rounded-xl bg-[#FAF8F3] border border-[#E8E4DC] text-xs text-[#0F0F0F] focus:outline-none focus:border-[#C9281D]"
          >
            <option value="All">All Formats</option>
            <option value="Hardcover">Hardcover & Clothbound</option>
            <option value="BoxSet">Box Sets & Special Editions</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full md:w-36 px-3 py-2 rounded-xl bg-[#FAF8F3] border border-[#E8E4DC] text-xs text-[#0F0F0F] focus:outline-none focus:border-[#C9281D]"
          >
            <option value="all">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
        </div>
      </div>

      {/* 3. Editions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredEditions.map((edition) => (
          <div
            key={edition.id}
            className="rounded-2xl bg-white border border-[#E8E4DC] p-5 shadow-sm hover:shadow-md hover:border-[#C9281D]/30 transition flex flex-col justify-between group"
          >
            <div>
              {/* Cover & Code header */}
              <div className="flex items-start gap-4">
                <div className="relative w-20 h-28 rounded-xl overflow-hidden bg-[#FAF8F3] border border-[#E8E4DC] flex-shrink-0 shadow-sm">
                  {edition.coverImage ? (
                    <Image
                      src={edition.coverImage}
                      alt={edition.title}
                      fill
                      className="object-cover group-hover:scale-105 transition duration-300"
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#8C827A]">
                      <BookOpen className="w-6 h-6" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#FAF8F3] text-[#6B655C] border border-[#E8E4DC] font-semibold">
                      {edition.codeName || "EDITION"}
                    </span>
                    <button
                      onClick={() => toggleEditionStatus(edition.id)}
                      title="Click to toggle publish status"
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold flex items-center gap-1 transition ${
                        edition.status === "published"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                          : "bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100"
                      }`}
                    >
                      {edition.status === "published" ? (
                        <>
                          <CheckCircle2 className="w-2.5 h-2.5" />
                          <span>Published</span>
                        </>
                      ) : (
                        <>
                          <Clock className="w-2.5 h-2.5" />
                          <span>Draft</span>
                        </>
                      )}
                    </button>
                  </div>
                  <h3 className="font-serif font-bold text-sm text-[#0F0F0F] line-clamp-2 mt-1.5 group-hover:text-[#C9281D] transition">
                    {edition.title}
                  </h3>
                  {edition.nativeTitle && (
                    <p className="text-xs text-[#8C827A] mt-0.5 font-medium">{edition.nativeTitle}</p>
                  )}
                  <p className="text-[11px] text-[#6B655C] line-clamp-1 mt-1">
                    {edition.bookFormat}
                  </p>
                </div>
              </div>

              {/* Spec pills */}
              <div className="mt-4 pt-3 border-t border-[#E8E4DC] grid grid-cols-3 gap-2 text-center text-[10px] font-mono">
                <div className="p-2 rounded-lg bg-[#FAF8F3] border border-[#E8E4DC]">
                  <div className="text-[#8C827A]">Pages</div>
                  <div className="text-[#0F0F0F] font-bold mt-0.5">{edition.pagesCount || "—"}</div>
                </div>
                <div className="p-2 rounded-lg bg-[#FAF8F3] border border-[#E8E4DC]">
                  <div className="text-[#8C827A]">Chapters</div>
                  <div className="text-[#0F0F0F] font-bold mt-0.5">{edition.chaptersCount || "—"}</div>
                </div>
                <div className="p-2 rounded-lg bg-[#FAF8F3] border border-[#E8E4DC]">
                  <div className="text-[#8C827A]">Language</div>
                  <div className="text-[#C9281D] font-bold mt-0.5">{edition.language || "English"}</div>
                </div>
              </div>
            </div>

            {/* Price & Action footer */}
            <div className="mt-5 pt-3 border-t border-[#E8E4DC] flex items-center justify-between">
              <div>
                <span className="text-[10px] text-[#8C827A] font-mono block">Retail Price</span>
                <span className="font-serif font-bold text-lg text-[#0F0F0F]">
                  £{typeof edition.price === "number" ? edition.price.toFixed(2) : edition.price}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleEdit(edition)}
                  className="px-3 py-1.5 rounded-xl bg-[#FAF8F3] hover:bg-[#F4EFE6] border border-[#E8E4DC] text-xs font-medium text-[#0F0F0F] flex items-center gap-1.5 transition"
                >
                  <Edit2 className="w-3.5 h-3.5 text-[#6B655C]" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => handleDelete(edition.id, edition.title)}
                  className="p-1.5 rounded-xl bg-white hover:bg-red-50 text-[#8C827A] hover:text-[#C9281D] border border-transparent hover:border-red-200 transition"
                  title="Delete Edition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredEditions.length === 0 && !isLoading && (
        <div className="py-16 text-center text-[#8C827A] text-xs rounded-2xl bg-white border border-[#E8E4DC]">
          No editions found matching your search.
        </div>
      )}

      {/* Edit / Add Modal */}
      <EditionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editionToEdit={editingEdition}
      />
    </div>
  );
}

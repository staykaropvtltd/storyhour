"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Mic,
  Plus,
  Search,
  MapPin,
  Globe,
  BookOpen,
  Trash2,
  Edit2,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { useAdminCms } from "@/context/AdminCmsContext";
import { CmsStoryteller } from "@/lib/cms-types";
import StorytellerModal from "@/components/admin/StorytellerModal";

export default function AdminStorytellersPage() {
  const { storytellers, removeStoryteller, toggleStorytellerStatus, isLoading } = useAdminCms();
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [editingStoryteller, setEditingStoryteller] = useState<CmsStoryteller | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredStorytellers = storytellers.filter((st) => {
    const matchesSearch =
      st.name.toLowerCase().includes(search.toLowerCase()) ||
      (st.role && st.role.toLowerCase().includes(search.toLowerCase())) ||
      (st.region && st.region.toLowerCase().includes(search.toLowerCase())) ||
      (st.bio && st.bio.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus =
      selectedStatus === "all" || st.status === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  const handleEdit = (st: CmsStoryteller) => {
    setEditingStoryteller(st);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setEditingStoryteller(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string, stName: string) => {
    if (window.confirm(`Are you sure you want to remove storyteller "${stName}"?`)) {
      await removeStoryteller(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#0F0F0F] tracking-tight">
              Storytellers & Voice Cast
            </h1>
            <span className="px-2.5 py-0.5 text-xs font-mono rounded-full bg-[#C9281D]/10 text-[#C9281D] border border-[#C9281D]/20 font-semibold">
              {filteredStorytellers.length} artists
            </span>
          </div>
          <p className="text-[#6B655C] text-xs sm:text-sm mt-1">
            Manage classical balladeers, voice artists, translators, and featured story narrators.
          </p>
        </div>

        <button
          onClick={handleAddNew}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#C9281D] hover:bg-[#A82017] text-white text-xs font-semibold shadow-sm hover:shadow active:scale-95 transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Storyteller</span>
        </button>
      </div>

      {/* 2. Search & Filter */}
      <div className="p-4 rounded-2xl bg-white border border-[#E8E4DC] flex flex-col sm:flex-row items-center gap-3 shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-[#8C827A] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search artists by name, voice role, or region..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#FAF8F3] border border-[#E8E4DC] text-xs text-[#0F0F0F] placeholder-[#8C827A] focus:outline-none focus:border-[#C9281D] focus:ring-1 focus:ring-[#C9281D]"
          />
        </div>

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="w-full sm:w-40 px-3 py-2 rounded-xl bg-[#FAF8F3] border border-[#E8E4DC] text-xs text-[#0F0F0F] focus:outline-none focus:border-[#C9281D]"
        >
          <option value="all">All Status</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>
      </div>

      {/* 3. Storytellers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredStorytellers.map((st) => (
          <div
            key={st.id}
            className="rounded-2xl bg-white border border-[#E8E4DC] p-5 shadow-sm hover:shadow-md hover:border-[#C9281D]/30 transition flex flex-col justify-between group"
          >
            <div>
              {/* Portrait & Role Header */}
              <div className="flex items-start gap-4">
                <div className="relative w-16 h-16 rounded-full overflow-hidden bg-[#FAF8F3] border border-[#E8E4DC] flex-shrink-0 shadow-sm">
                  {st.image ? (
                    <Image
                      src={st.image}
                      alt={st.name}
                      fill
                      className="object-cover group-hover:scale-105 transition duration-300"
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#8C827A]">
                      <Mic className="w-6 h-6" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-serif font-bold text-base text-[#0F0F0F] truncate group-hover:text-[#C9281D] transition">
                      {st.name}
                    </h3>
                    <button
                      onClick={() => toggleStorytellerStatus(st.id)}
                      title="Click to toggle publish status"
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold flex items-center gap-1 transition ${
                        st.status === "published"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                          : "bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100"
                      }`}
                    >
                      {st.status === "published" ? (
                        <>
                          <CheckCircle2 className="w-2.5 h-2.5" />
                          <span>Active</span>
                        </>
                      ) : (
                        <>
                          <Clock className="w-2.5 h-2.5" />
                          <span>Draft</span>
                        </>
                      )}
                    </button>
                  </div>

                  <p className="text-xs text-[#C9281D] font-medium mt-0.5 line-clamp-1">
                    {st.role}
                  </p>

                  {st.region && (
                    <div className="flex items-center gap-1 text-[11px] text-[#8C827A] mt-1">
                      <MapPin className="w-3 h-3 text-[#8C827A]" />
                      <span className="truncate">{st.region}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Bio */}
              <p className="text-xs text-[#6B655C] leading-relaxed mt-4 line-clamp-3">
                {st.bio || "No biography entered."}
              </p>

              {/* Meta pills */}
              <div className="mt-4 pt-3 border-t border-[#E8E4DC] flex flex-wrap gap-1.5">
                {st.languages && (
                  <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#FAF8F3] border border-[#E8E4DC] text-[10px] font-mono text-[#6B655C]">
                    <Globe className="w-2.5 h-2.5 text-[#8C827A]" />
                    <span>{Array.isArray(st.languages) ? st.languages.join(", ") : st.languages}</span>
                  </div>
                )}
                {st.connectedStoryTitle && (
                  <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#FAF8F3] border border-[#E8E4DC] text-[10px] font-mono text-[#6B655C]">
                    <BookOpen className="w-2.5 h-2.5 text-[#8C827A]" />
                    <span className="truncate max-w-[140px]">{st.connectedStoryTitle}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Actions footer */}
            <div className="mt-5 pt-3 border-t border-[#E8E4DC] flex items-center justify-end gap-1.5">
              <button
                onClick={() => handleEdit(st)}
                className="px-3 py-1.5 rounded-xl bg-[#FAF8F3] hover:bg-[#F4EFE6] border border-[#E8E4DC] text-xs font-medium text-[#0F0F0F] flex items-center gap-1.5 transition"
              >
                <Edit2 className="w-3.5 h-3.5 text-[#6B655C]" />
                <span>Edit</span>
              </button>
              <button
                onClick={() => handleDelete(st.id, st.name)}
                className="p-1.5 rounded-xl bg-white hover:bg-red-50 text-[#8C827A] hover:text-[#C9281D] border border-transparent hover:border-red-200 transition"
                title="Delete Storyteller"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredStorytellers.length === 0 && !isLoading && (
        <div className="py-16 text-center text-[#8C827A] text-xs rounded-2xl bg-white border border-[#E8E4DC]">
          No storytellers found matching your search.
        </div>
      )}

      {/* Edit / Add Modal */}
      <StorytellerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        storytellerToEdit={editingStoryteller}
      />
    </div>
  );
}

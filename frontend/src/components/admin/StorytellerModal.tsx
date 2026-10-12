"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { X, Mic, Image as ImageIcon, Save, Trash2 } from "lucide-react";
import { CmsStoryteller } from "@/lib/cms-types";
import { useAdminCms } from "@/context/AdminCmsContext";

interface StorytellerModalProps {
  isOpen: boolean;
  onClose: () => void;
  storytellerToEdit: CmsStoryteller | null;
}

export default function StorytellerModal({
  isOpen,
  onClose,
  storytellerToEdit,
}: StorytellerModalProps) {
  const { saveStoryteller, removeStoryteller } = useAdminCms();

  const [name, setName] = useState("");
  const [role, setRole] = useState("Classical Vocalist & Epic Narrator");
  const [bio, setBio] = useState("");
  const [image, setImage] = useState("");
  const [region, setRegion] = useState("London & Hyderabad");
  const [languages, setLanguages] = useState("English, Telugu");
  const [connectedStoryTitle, setConnectedStoryTitle] = useState("Ramayana Series");
  const [status, setStatus] = useState<CmsStoryteller["status"]>("published");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (storytellerToEdit) {
      setName(storytellerToEdit.name || "");
      setRole(storytellerToEdit.role || "");
      setBio(storytellerToEdit.bio || "");
      setImage(storytellerToEdit.image || "");
      setRegion(storytellerToEdit.region || "London, UK");
      setLanguages(
        Array.isArray(storytellerToEdit.languages)
          ? storytellerToEdit.languages.join(", ")
          : "English"
      );
      setConnectedStoryTitle(storytellerToEdit.connectedStoryTitle || "");
      setStatus(storytellerToEdit.status || "published");
    } else {
      setName("");
      setRole("Classical Vocalist & Narrator");
      setBio("");
      setImage("https://storyhour.co.uk/wp-content/uploads/2026/01/WhatsApp-Image-2026-01-19-at-17.23.29-1.jpeg");
      setRegion("London, UK");
      setLanguages("English, Hindi");
      setConnectedStoryTitle("Classical Epics");
      setStatus("published");
    }
    setErrorMessage(null);
  }, [storytellerToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMessage("Please enter the artist name.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    const payload = {
      name: name.trim(),
      role: role.trim(),
      bio: bio.trim(),
      image: image.trim(),
      region: region.trim(),
      languages: languages.split(",").map((l) => l.trim()).filter(Boolean),
      connectedStoryTitle: connectedStoryTitle.trim(),
      status,
    };

    const res = await saveStoryteller(payload, storytellerToEdit?.id);
    setIsSubmitting(false);

    if (res.success) {
      onClose();
    } else {
      setErrorMessage(res.error || "Failed to save artist profile");
    }
  };

  const handleDelete = async () => {
    if (storytellerToEdit && window.confirm(`Permanently remove "${storytellerToEdit.name}"?`)) {
      setIsSubmitting(true);
      const res = await removeStoryteller(storytellerToEdit.id);
      setIsSubmitting(false);
      if (res.success) {
        onClose();
      } else {
        setErrorMessage(res.error || "Failed to remove");
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-2xl my-8 rounded-2xl bg-white border border-[#E8E4DC] shadow-2xl overflow-hidden z-10 animate-zoom-in-95 text-[#0F0F0F]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E8E4DC] bg-[#FAF8F3]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
              <Mic className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-[#0F0F0F]">
                {storytellerToEdit ? "Edit Storyteller Profile" : "Add Artist / Storyteller"}
              </h3>
              <p className="text-[11px] text-[#696572] font-mono">
                {storytellerToEdit ? `ID: ${storytellerToEdit.id}` : "StoryHour Voices Roster"}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-zinc-400 hover:text-black rounded-lg hover:bg-zinc-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMessage && (
          <div className="px-6 py-3 bg-red-50 border-b border-red-200 text-red-700 text-xs">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto scrollbar-thin">
          <div className="flex items-center justify-between p-4 rounded-xl bg-[#FAF8F3] border border-[#E8E4DC]">
            <div>
              <div className="font-bold text-xs text-[#0F0F0F]">Publication Status</div>
              <p className="text-[11px] text-[#696572]">
                Controls whether this profile appears on the public /storytellers page.
              </p>
            </div>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border focus:outline-none ${
                status === "published"
                  ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                  : "bg-amber-50 text-amber-800 border-amber-300"
              }`}
            >
              <option value="published">● Published (Live)</option>
              <option value="draft">○ Draft (Hidden)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#0F0F0F] mb-1">Artist Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Neelima Penumarthy"
              className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#E8E4DC] text-xs text-[#0F0F0F] focus:outline-none focus:border-[#C9281D]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#0F0F0F] mb-1">Role / Specialism</label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g. Lead Storyteller & Founder"
                className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#E8E4DC] text-xs text-[#0F0F0F] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#0F0F0F] mb-1">Region / Base</label>
              <input
                type="text"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                placeholder="e.g. London & Hyderabad"
                className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#E8E4DC] text-xs text-[#0F0F0F] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#0F0F0F] mb-1">Languages (comma-separated)</label>
            <input
              type="text"
              value={languages}
              onChange={(e) => setLanguages(e.target.value)}
              placeholder="English, Hindi, Telugu"
              className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#E8E4DC] text-xs text-[#0F0F0F] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#0F0F0F] mb-1">Connected Epic / Production</label>
            <input
              type="text"
              value={connectedStoryTitle}
              onChange={(e) => setConnectedStoryTitle(e.target.value)}
              placeholder="e.g. Ramayana Series"
              className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#E8E4DC] text-xs text-[#0F0F0F] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#0F0F0F] mb-1 flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-[#C9281D]" />
              <span>Portrait Photo URL</span>
            </label>
            <input
              type="url"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              placeholder="https://..."
              className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#E8E4DC] text-xs text-[#0F0F0F] font-mono focus:outline-none focus:border-[#C9281D]"
            />
            {image && (
              <div className="mt-2 flex items-center gap-3 p-2 rounded-xl bg-[#FAF8F3] border border-[#E8E4DC]">
                <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-zinc-200 flex-shrink-0">
                  <Image src={image} alt="Portrait" fill className="object-cover" unoptimized />
                </div>
                <span className="text-[11px] text-[#696572] truncate">Portrait Image Preview</span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-[#0F0F0F] mb-1">Biography</label>
            <textarea
              rows={4}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Share their storytelling philosophy, artistic background, and performances..."
              className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#E8E4DC] text-xs text-[#0F0F0F] focus:outline-none focus:border-[#C9281D]"
            />
          </div>

          <div className="sticky bottom-0 bg-[#FAF8F3] border-t border-[#E8E4DC] p-4 -mx-6 -mb-6 flex items-center justify-between z-10 shadow-[0_-4px_12px_rgba(0,0,0,0.03)]">
            {storytellerToEdit ? (
              <button
                type="button"
                onClick={handleDelete}
                disabled={isSubmitting}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs text-red-600 hover:text-red-700 hover:bg-red-50 transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Profile</span>
              </button>
            ) : <div />}

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-xl text-xs font-medium text-[#696572] hover:text-[#0F0F0F] hover:bg-[#F4EFE6] transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-[#C9281D] hover:bg-[#B52218] text-white text-xs font-bold shadow-sm hover:brightness-105 active:scale-95 transition"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isSubmitting ? "Saving..." : storytellerToEdit ? "Update Profile" : "Save Artist"}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

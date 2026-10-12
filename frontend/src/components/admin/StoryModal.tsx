"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { X, Sparkles, Image as ImageIcon, Volume2, Save, Trash2, CheckCircle2 } from "lucide-react";
import { CmsStory } from "@/lib/cms-types";
import { useAdminCms } from "@/context/AdminCmsContext";

interface StoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  storyToEdit: CmsStory | null;
}

export default function StoryModal({ isOpen, onClose, storyToEdit }: StoryModalProps) {
  const { saveStory, removeStory } = useAdminCms();

  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [storyteller, setStoryteller] = useState("");
  const [language, setLanguage] = useState<CmsStory["language"]>("English");
  const [audience, setAudience] = useState<CmsStory["audience"]>("Families & All Ages");
  const [category, setCategory] = useState<CmsStory["category"]>("Mythology & Epics");
  const [format, setFormat] = useState<CmsStory["format"]>("Audiobook");
  const [duration, setDuration] = useState("12h 30m");
  const [durationMinutes, setDurationMinutes] = useState(750);
  const [chaptersCount, setChaptersCount] = useState(30);
  const [coverImage, setCoverImage] = useState("");
  const [audioPreviewUrl, setAudioPreviewUrl] = useState("");
  const [description, setDescription] = useState("");
  const [culturalNote, setCulturalNote] = useState("");
  const [featured, setFeatured] = useState(false);
  const [status, setStatus] = useState<CmsStory["status"]>("published");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (storyToEdit) {
      setTitle(storyToEdit.title || "");
      setSubtitle(storyToEdit.subtitle || "");
      setStoryteller(storyToEdit.storyteller || "");
      setLanguage(storyToEdit.language || "English");
      setAudience(storyToEdit.audience || "Families & All Ages");
      setCategory(storyToEdit.category || "Mythology & Epics");
      setFormat(storyToEdit.format || "Audiobook");
      setDuration(storyToEdit.duration || "10h 00m");
      setDurationMinutes(storyToEdit.durationMinutes || 600);
      setChaptersCount(storyToEdit.chaptersCount || 20);
      setCoverImage(storyToEdit.coverImage || "");
      setAudioPreviewUrl(storyToEdit.audioPreviewUrl || "");
      setDescription(storyToEdit.description || "");
      setCulturalNote(storyToEdit.culturalNote || "");
      setFeatured(!!storyToEdit.featured);
      setStatus(storyToEdit.status || "published");
    } else {
      setTitle("");
      setSubtitle("");
      setStoryteller("StoryHour Ensemble");
      setLanguage("English");
      setAudience("Families & All Ages");
      setCategory("Mythology & Epics");
      setFormat("Audiobook");
      setDuration("8h 45m");
      setDurationMinutes(525);
      setChaptersCount(24);
      setCoverImage("https://storyhour.co.uk/wp-content/uploads/2026/01/WhatsApp-Image-2026-01-19-at-17.28.53.jpeg");
      setAudioPreviewUrl("https://www.youtube.com/embed/4up2VdHiO5I?autoplay=1");
      setDescription("");
      setCulturalNote("");
      setFeatured(false);
      setStatus("published");
    }
    setErrorMessage(null);
  }, [storyToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMessage("Please enter a story title.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    const payload = {
      slug: title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, ""),
      title: title.trim(),
      subtitle: subtitle.trim() || undefined,
      storyteller: storyteller.trim() || "StoryHour Narrator",
      language,
      audience,
      category,
      format,
      duration: duration.trim(),
      durationMinutes: Number(durationMinutes) || 60,
      chaptersCount: Number(chaptersCount) || 10,
      coverImage: coverImage.trim() || "https://storyhour.co.uk/wp-content/uploads/2026/01/WhatsApp-Image-2026-01-19-at-17.28.53.jpeg",
      audioPreviewUrl: audioPreviewUrl.trim() || "https://www.youtube.com/embed/4up2VdHiO5I?autoplay=1",
      description: description.trim(),
      culturalNote: culturalNote.trim() || undefined,
      featured,
      status,
    };

    const res = await saveStory(payload, storyToEdit?.id);
    setIsSubmitting(false);

    if (res.success) {
      onClose();
    } else {
      setErrorMessage(res.error || "Failed to save story");
    }
  };

  const handleDelete = async () => {
    if (storyToEdit && window.confirm(`Permanently delete "${storyToEdit.title}"?`)) {
      setIsSubmitting(true);
      const res = await removeStory(storyToEdit.id);
      setIsSubmitting(false);
      if (res.success) {
        onClose();
      } else {
        setErrorMessage(res.error || "Failed to delete");
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-3xl my-8 rounded-2xl bg-white border border-[#E8E4DC] shadow-2xl overflow-hidden z-10 animate-zoom-in-95 text-[#0F0F0F]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E8E4DC] bg-[#FAF8F3]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#FDF2F0] text-[#C9281D]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-[#0F0F0F]">
                {storyToEdit ? "Edit Story & Narration" : "Publish New Story / Audio"}
              </h3>
              <p className="text-[11px] text-[#696572] font-mono">
                {storyToEdit ? `ID: ${storyToEdit.id}` : "StoryHour Content Pipeline"}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-zinc-400 hover:text-black rounded-lg hover:bg-zinc-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error banner if any */}
        {errorMessage && (
          <div className="px-6 py-3 bg-red-50 border-b border-red-200 text-red-700 text-xs">
            {errorMessage}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto scrollbar-thin">
          {/* Status & Publication Selector */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-[#FAF8F3] border border-[#E8E4DC]">
            <div>
              <div className="font-bold text-xs text-[#0F0F0F]">Publication Status</div>
              <p className="text-[11px] text-[#696572]">
                Published stories appear immediately on the public website. Drafts remain hidden.
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

          {/* Title & Subtitle */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#0F0F0F] mb-1">Story Title *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Panchatantra — Tales of Wit"
                className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#E8E4DC] text-xs text-[#0F0F0F] focus:outline-none focus:border-[#C9281D]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#0F0F0F] mb-1">Subtitle / Tagline</label>
              <input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="e.g. Classic Narration for Families"
                className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#E8E4DC] text-xs text-[#0F0F0F] focus:outline-none focus:border-[#C9281D]"
              />
            </div>
          </div>

          {/* Storyteller & Language */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#0F0F0F] mb-1">Storyteller / Ensemble</label>
              <input
                type="text"
                value={storyteller}
                onChange={(e) => setStoryteller(e.target.value)}
                placeholder="StoryHour Lead Artist"
                className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#E8E4DC] text-xs text-[#0F0F0F] focus:outline-none focus:border-[#C9281D]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#0F0F0F] mb-1">Language</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as any)}
                className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#E8E4DC] text-xs text-[#0F0F0F] focus:outline-none focus:border-[#C9281D]"
              >
                <option value="English">English</option>
                <option value="Hindi">Hindi (हिंदी)</option>
                <option value="Telugu">Telugu (తెలుగు)</option>
                <option value="Multilingual">Multilingual</option>
              </select>
            </div>
          </div>

          {/* Audience, Category, Format */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#0F0F0F] mb-1">Audience</label>
              <select
                value={audience}
                onChange={(e) => setAudience(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-[#E8E4DC] text-xs text-[#0F0F0F] focus:outline-none focus:border-[#C9281D]"
              >
                <option value="Families & All Ages">Families & All Ages</option>
                <option value="Children (5-8)">Children (5-8)</option>
                <option value="Young Listeners (9-12)">Young Listeners (9-12)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0F0F0F] mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-[#E8E4DC] text-xs text-[#0F0F0F] focus:outline-none focus:border-[#C9281D]"
              >
                <option value="Mythology & Epics">Mythology & Epics</option>
                <option value="Folk Tales">Folk Tales</option>
                <option value="Wisdom & Bravery">Wisdom & Bravery</option>
                <option value="History & Culture">History & Culture</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0F0F0F] mb-1">Format</label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-[#E8E4DC] text-xs text-[#0F0F0F] focus:outline-none focus:border-[#C9281D]"
              >
                <option value="Audiobook">Audiobook</option>
                <option value="Puppet Stories & Skits">Puppet Stories & Skits</option>
                <option value="Performance Skit">Performance Skit</option>
              </select>
            </div>
          </div>

          {/* Duration, Minutes, Chapters */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#0F0F0F] mb-1">Display Duration</label>
              <input
                type="text"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="14h 20m"
                className="w-full px-3 py-2 rounded-xl bg-white border border-[#E8E4DC] text-xs text-[#0F0F0F] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#0F0F0F] mb-1">Duration (Minutes)</label>
              <input
                type="number"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-white border border-[#E8E4DC] text-xs text-[#0F0F0F] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#0F0F0F] mb-1">Chapters Count</label>
              <input
                type="number"
                value={chaptersCount}
                onChange={(e) => setChaptersCount(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-white border border-[#E8E4DC] text-xs text-[#0F0F0F] focus:outline-none"
              />
            </div>
          </div>

          {/* Cover & Audio Preview URLs */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-[#0F0F0F] mb-1 flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-[#C9281D]" />
                <span>Cover Image URL</span>
              </label>
              <input
                type="url"
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                placeholder="https://..."
                className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#E8E4DC] text-xs text-[#0F0F0F] font-mono focus:outline-none focus:border-[#C9281D]"
              />
              {coverImage && (
                <div className="mt-2 flex items-center gap-3 p-2 rounded-xl bg-[#FAF8F3] border border-[#E8E4DC]">
                  <div className="relative w-12 h-16 rounded overflow-hidden bg-zinc-200 flex-shrink-0">
                    <Image
                      src={coverImage}
                      alt="Preview"
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                  <span className="text-[11px] text-[#696572] truncate">Cover Preview</span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0F0F0F] mb-1 flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Audio Preview Stream URL</span>
              </label>
              <input
                type="text"
                value={audioPreviewUrl}
                onChange={(e) => setAudioPreviewUrl(e.target.value)}
                placeholder="https://www.youtube.com/embed/..."
                className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#E8E4DC] text-xs text-[#0F0F0F] font-mono focus:outline-none focus:border-[#C9281D]"
              />
            </div>
          </div>

          {/* Synopsis */}
          <div>
            <label className="block text-xs font-bold text-[#0F0F0F] mb-1">Story Synopsis</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the magical narrative, themes, and classical elements..."
              className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#E8E4DC] text-xs text-[#0F0F0F] focus:outline-none focus:border-[#C9281D]"
            />
          </div>

          {/* Cultural Note */}
          <div>
            <label className="block text-xs font-bold text-[#0F0F0F] mb-1">Cultural & Historical Note</label>
            <textarea
              rows={2}
              value={culturalNote}
              onChange={(e) => setCulturalNote(e.target.value)}
              placeholder="e.g. Based on Sage Valmiki's Adikavya; adapted with authentic acoustic instrumentation..."
              className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#E8E4DC] text-xs text-[#0F0F0F] focus:outline-none focus:border-[#C9281D]"
            />
          </div>

          {/* Featured Toggle */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-[#FAF8F3] border border-[#E8E4DC]">
            <input
              type="checkbox"
              id="featuredStory"
              checked={featured}
              onChange={(e) => setFeatured(e.target.checked)}
              className="w-4 h-4 rounded text-[#C9281D] focus:ring-[#C9281D] border-[#E8E4DC]"
            />
            <label htmlFor="featuredStory" className="text-xs text-[#0F0F0F] font-semibold cursor-pointer">
              Spotlight as Featured Story on Public Homepage
            </label>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-[#E8E4DC] flex items-center justify-between">
            {storyToEdit ? (
              <button
                type="button"
                onClick={handleDelete}
                disabled={isSubmitting}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs text-red-600 hover:text-red-700 hover:bg-red-50 transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Story</span>
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
                <span>{isSubmitting ? "Saving..." : storyToEdit ? "Update Story" : "Save & Publish"}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

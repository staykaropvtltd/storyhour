"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { X, Sparkles, Image as ImageIcon, Volume2, Save, Trash2 } from "lucide-react";
import { Story } from "@/data/storyhour-data";
import { useAdmin } from "@/context/AdminContext";

interface StoryEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  storyToEdit: Story | null;
}

export default function StoryEditModal({ isOpen, onClose, storyToEdit }: StoryEditModalProps) {
  const { addStory, updateStory, deleteStory } = useAdmin();

  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [storyteller, setStoryteller] = useState("");
  const [language, setLanguage] = useState<Story["language"]>("English");
  const [audience, setAudience] = useState<Story["audience"]>("Families & All Ages");
  const [category, setCategory] = useState<Story["category"]>("Mythology & Epics");
  const [format, setFormat] = useState<Story["format"]>("Audiobook");
  const [duration, setDuration] = useState("12h 30m");
  const [durationMinutes, setDurationMinutes] = useState(750);
  const [chaptersCount, setChaptersCount] = useState(30);
  const [coverImage, setCoverImage] = useState("");
  const [audioPreviewUrl, setAudioPreviewUrl] = useState("");
  const [description, setDescription] = useState("");
  const [culturalNote, setCulturalNote] = useState("");
  const [featured, setFeatured] = useState(false);

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
    } else {
      // Default blank for creation
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
    }
  }, [storyToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

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
    };

    if (storyToEdit) {
      updateStory(storyToEdit.id, payload);
    } else {
      addStory(payload);
    }
    onClose();
  };

  const handleDelete = () => {
    if (storyToEdit && window.confirm(`Are you sure you want to delete "${storyToEdit.title}"?`)) {
      deleteStory(storyToEdit.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity" onClick={onClose} />

      <div className="relative w-full max-w-3xl my-8 rounded-2xl bg-[#131317] border border-[#272730] shadow-2xl overflow-hidden z-10 animate-zoom-in-95 text-zinc-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-[#0e0e12]">
          <div>
            <h3 className="font-serif font-bold text-base text-white">
              {storyToEdit ? "Edit Story & Narration" : "Publish New Story / Audio"}
            </h3>
            <p className="text-[11px] text-zinc-500 font-mono">
              {storyToEdit ? `ID: ${storyToEdit.id}` : "StoryHour Content Pipeline"}
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto scrollbar-thin">
          {/* Title & Subtitle */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Story Title *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Panchatantra — Tales of Wit"
                className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-white focus:outline-none focus:border-[#C5A880]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Subtitle / Tagline</label>
              <input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="e.g. Classic Narration for Families"
                className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-white focus:outline-none focus:border-[#C5A880]"
              />
            </div>
          </div>

          {/* Storyteller & Language */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Storyteller / Ensemble</label>
              <input
                type="text"
                value={storyteller}
                onChange={(e) => setStoryteller(e.target.value)}
                placeholder="StoryHour Lead Artist"
                className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-white focus:outline-none focus:border-[#C5A880]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Language</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as any)}
                className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-white focus:outline-none focus:border-[#C5A880]"
              >
                <option value="English">English</option>
                <option value="Hindi">Hindi (हिंदी)</option>
                <option value="Telugu">Telugu (తెలుగు)</option>
                <option value="Multilingual">Multilingual</option>
              </select>
            </div>
          </div>

          {/* Audience & Category & Format */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Audience</label>
              <select
                value={audience}
                onChange={(e) => setAudience(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-[#C5A880]"
              >
                <option value="Families & All Ages">Families & All Ages</option>
                <option value="Children (5-8)">Children (5-8)</option>
                <option value="Young Listeners (9-12)">Young Listeners (9-12)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-[#C5A880]"
              >
                <option value="Mythology & Epics">Mythology & Epics</option>
                <option value="Folk Tales">Folk Tales</option>
                <option value="Wisdom & Bravery">Wisdom & Bravery</option>
                <option value="History & Culture">History & Culture</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Format</label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-[#C5A880]"
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
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Display Duration</label>
              <input
                type="text"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="14h 20m"
                className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Duration (Minutes)</label>
              <input
                type="number"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Chapters Count</label>
              <input
                type="number"
                value={chaptersCount}
                onChange={(e) => setChaptersCount(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none"
              />
            </div>
          </div>

          {/* Media Links: Cover Image & Audio Preview */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1 flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-[#C5A880]" />
                <span>Cover Image URL</span>
              </label>
              <input
                type="url"
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                placeholder="https://..."
                className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white font-mono focus:outline-none focus:border-[#C5A880]"
              />
              {coverImage && (
                <div className="mt-2 flex items-center gap-3 p-2 rounded-xl bg-zinc-900/60 border border-zinc-800">
                  <div className="relative w-12 h-16 rounded overflow-hidden bg-zinc-800 flex-shrink-0">
                    <Image
                      src={coverImage}
                      alt="Preview"
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                  <span className="text-[11px] text-zinc-400 truncate">Cover Image Preview</span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1 flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Audio Preview URL (YouTube Embed or Stream)</span>
              </label>
              <input
                type="text"
                value={audioPreviewUrl}
                onChange={(e) => setAudioPreviewUrl(e.target.value)}
                placeholder="https://www.youtube.com/embed/..."
                className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white font-mono focus:outline-none focus:border-[#C5A880]"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">Story Synopsis</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the magical narrative, themes, and classical elements..."
              className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-[#C5A880] scrollbar-thin"
            />
          </div>

          {/* Cultural Note */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">Cultural & Historical Note</label>
            <textarea
              rows={2}
              value={culturalNote}
              onChange={(e) => setCulturalNote(e.target.value)}
              placeholder="e.g. Based on Sage Valmiki's Adikavya; adapted with authentic acoustic instrumentation..."
              className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-[#C5A880]"
            />
          </div>

          {/* Featured Toggle */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-zinc-900/60 border border-zinc-800">
            <input
              type="checkbox"
              id="featuredStory"
              checked={featured}
              onChange={(e) => setFeatured(e.target.checked)}
              className="w-4 h-4 rounded text-[#C9281D] focus:ring-[#C9281D] bg-zinc-800 border-zinc-700"
            />
            <label htmlFor="featuredStory" className="text-xs text-zinc-300 font-medium cursor-pointer">
              Feature on Homepage Hero & Trailer Spotlight
            </label>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-zinc-800 flex items-center justify-between">
            {storyToEdit ? (
              <button
                type="button"
                onClick={handleDelete}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Story</span>
              </button>
            ) : <div />}

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-[#C9281D] to-[#A81F16] text-white text-xs font-semibold shadow-lg shadow-[#C9281D]/30 hover:brightness-110 active:scale-95 transition"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{storyToEdit ? "Update Story" : "Publish Story"}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

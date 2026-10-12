"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { X, Library, Image as ImageIcon, Save, Trash2 } from "lucide-react";
import { Edition } from "@/data/editions-data";
import { useAdmin } from "@/context/AdminContext";

interface EditionEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  editionToEdit: Edition | null;
}

export default function EditionEditModal({ isOpen, onClose, editionToEdit }: EditionEditModalProps) {
  const { addEdition, updateEdition, deleteEdition } = useAdmin();

  const [title, setTitle] = useState("");
  const [nativeTitle, setNativeTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [codeName, setCodeName] = useState("");
  const [year, setYear] = useState("2026");
  const [season, setSeason] = useState("Signature Collection");
  const [language, setLanguage] = useState<Edition["language"]>("English");
  const [bookFormat, setBookFormat] = useState("Hardcover (Clothbound Foil)");
  const [category, setCategory] = useState("Mythology & Classical Literature");
  const [price, setPrice] = useState(34.99);
  const [pagesCount, setPagesCount] = useState(380);
  const [chaptersCount, setChaptersCount] = useState(40);
  const [duration, setDuration] = useState("14h 20m");
  const [coverImage, setCoverImage] = useState("");
  const [audioPreviewUrl, setAudioPreviewUrl] = useState("");
  const [storyteller, setStoryteller] = useState("StoryHour Lead Artist");
  const [description, setDescription] = useState("");
  const [accentColor, setAccentColor] = useState("#C9281D");

  useEffect(() => {
    if (editionToEdit) {
      setTitle(editionToEdit.title || "");
      setNativeTitle(editionToEdit.nativeTitle || "");
      setSubtitle(editionToEdit.subtitle || "");
      setCodeName(editionToEdit.codeName || "");
      setYear(editionToEdit.year || "2026");
      setSeason(editionToEdit.season || "Signature Collection");
      setLanguage(editionToEdit.language || "English");
      setBookFormat(editionToEdit.bookFormat || "Hardcover");
      setCategory(editionToEdit.category || "Mythology");
      setPrice(editionToEdit.price || 29.99);
      setPagesCount(editionToEdit.pagesCount || 300);
      setChaptersCount(editionToEdit.chaptersCount || 30);
      setDuration(editionToEdit.duration || "12h");
      setCoverImage(editionToEdit.coverImage || "");
      setAudioPreviewUrl(editionToEdit.audioPreviewUrl || "");
      setStoryteller(editionToEdit.storyteller || "");
      setDescription(editionToEdit.description || "");
      setAccentColor(editionToEdit.accentColor || "#C9281D");
    } else {
      setTitle("");
      setNativeTitle("");
      setSubtitle("");
      setCodeName("SH-ED-2026-" + Math.floor(100 + Math.random() * 900));
      setYear("2026");
      setSeason("Signature Collection");
      setLanguage("English");
      setBookFormat("Hardcover (Clothbound Foil)");
      setCategory("Mythology & Epics");
      setPrice(34.99);
      setPagesCount(380);
      setChaptersCount(40);
      setDuration("14h 20m");
      setCoverImage("https://storyhour.co.uk/wp-content/uploads/2026/01/WhatsApp-Image-2026-01-19-at-17.28.53.jpeg");
      setAudioPreviewUrl("https://www.youtube.com/embed/4up2VdHiO5I?autoplay=1");
      setStoryteller("StoryHour Ensemble");
      setDescription("");
      setAccentColor("#C9281D");
    }
  }, [editionToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const payload = {
      title: title.trim(),
      nativeTitle: nativeTitle.trim() || undefined,
      subtitle: subtitle.trim(),
      codeName: codeName.trim(),
      year: year.trim(),
      season: season.trim(),
      language,
      bookFormat: bookFormat.trim(),
      category: category.trim(),
      price: Number(price) || 29.99,
      pagesCount: Number(pagesCount) || 200,
      chaptersCount: Number(chaptersCount) || 20,
      duration: duration.trim(),
      coverImage: coverImage.trim() || "https://storyhour.co.uk/wp-content/uploads/2026/01/WhatsApp-Image-2026-01-19-at-17.28.53.jpeg",
      audioPreviewUrl: audioPreviewUrl.trim() || "https://www.youtube.com/embed/4up2VdHiO5I?autoplay=1",
      storyteller: storyteller.trim(),
      description: description.trim(),
      accentColor: accentColor.trim(),
    };

    if (editionToEdit) {
      updateEdition(editionToEdit.id, payload);
    } else {
      addEdition(payload);
    }
    onClose();
  };

  const handleDelete = () => {
    if (editionToEdit && window.confirm(`Are you sure you want to delete edition "${editionToEdit.title}"?`)) {
      deleteEdition(editionToEdit.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity" onClick={onClose} />

      <div className="relative w-full max-w-3xl my-8 rounded-2xl bg-[#131317] border border-[#272730] shadow-2xl overflow-hidden z-10 animate-zoom-in-95 text-zinc-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-[#0e0e12]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400">
              <Library className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-white">
                {editionToEdit ? "Edit Book & Edition Details" : "Add Physical / Digital Edition"}
              </h3>
              <p className="text-[11px] text-zinc-500 font-mono">
                {editionToEdit ? `Code: ${editionToEdit.codeName}` : "Inventory Catalog"}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto scrollbar-thin">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Edition Title *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ramayana — Signature Edition"
                className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-white focus:outline-none focus:border-[#C5A880]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Native Script Title (Optional)</label>
              <input
                type="text"
                value={nativeTitle}
                onChange={(e) => setNativeTitle(e.target.value)}
                placeholder="e.g. రామాయణం or रामायण"
                className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-white focus:outline-none focus:border-[#C5A880]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Edition Code Name</label>
              <input
                type="text"
                value={codeName}
                onChange={(e) => setCodeName(e.target.value)}
                placeholder="SH-ED-2026-RAM"
                className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white font-mono focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Retail Price (£ GBP)</label>
              <input
                type="number"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white font-mono focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Language</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none"
              >
                <option value="English">English</option>
                <option value="Hindi">Hindi</option>
                <option value="Telugu">Telugu</option>
                <option value="Multilingual">Multilingual</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Book Format</label>
              <input
                type="text"
                value={bookFormat}
                onChange={(e) => setBookFormat(e.target.value)}
                placeholder="Hardcover (Clothbound Foil)"
                className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Storyteller / Narrator</label>
              <input
                type="text"
                value={storyteller}
                onChange={(e) => setStoryteller(e.target.value)}
                placeholder="StoryHour Ensemble"
                className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Pages Count</label>
              <input
                type="number"
                value={pagesCount}
                onChange={(e) => setPagesCount(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white font-mono focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Chapters Count</label>
              <input
                type="number"
                value={chaptersCount}
                onChange={(e) => setChaptersCount(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white font-mono focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Accent Theme Color</label>
              <input
                type="text"
                value={accentColor}
                onChange={(e) => setAccentColor(e.target.value)}
                placeholder="#C9281D"
                className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white font-mono focus:outline-none"
              />
            </div>
          </div>

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
                <span className="text-[11px] text-zinc-400 truncate">Book Cover Preview</span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">Description & Craftsmanship Details</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Details on paper weight, gold foil gilding, illustrations..."
              className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-[#C5A880]"
            />
          </div>

          <div className="pt-4 border-t border-zinc-800 flex items-center justify-between">
            {editionToEdit ? (
              <button
                type="button"
                onClick={handleDelete}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Edition</span>
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
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-semibold shadow-lg shadow-blue-600/30 hover:brightness-110 active:scale-95 transition"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{editionToEdit ? "Update Edition" : "Save Edition"}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

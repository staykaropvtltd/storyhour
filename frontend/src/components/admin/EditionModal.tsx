"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { X, Library, Image as ImageIcon, Save, Trash2 } from "lucide-react";
import { CmsEdition } from "@/lib/cms-types";
import { useAdminCms } from "@/context/AdminCmsContext";

interface EditionModalProps {
  isOpen: boolean;
  onClose: () => void;
  editionToEdit: CmsEdition | null;
}

export default function EditionModal({ isOpen, onClose, editionToEdit }: EditionModalProps) {
  const { saveEdition, removeEdition } = useAdminCms();

  const [title, setTitle] = useState("");
  const [nativeTitle, setNativeTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [codeName, setCodeName] = useState("");
  const [year, setYear] = useState("2026");
  const [season, setSeason] = useState("Signature Collection");
  const [language, setLanguage] = useState<CmsEdition["language"]>("English");
  const [bookFormat, setBookFormat] = useState("Hardcover (Clothbound Foil)");
  const [category, setCategory] = useState("Mythology & Classical Literature");
  const [price, setPrice] = useState(34.99);
  const [stockCount, setStockCount] = useState(35);
  const [pagesCount, setPagesCount] = useState(380);
  const [chaptersCount, setChaptersCount] = useState(40);
  const [duration, setDuration] = useState("14h 20m");
  const [coverImage, setCoverImage] = useState("");
  const [audioPreviewUrl, setAudioPreviewUrl] = useState("");
  const [storyteller, setStoryteller] = useState("StoryHour Ensemble");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<CmsEdition["status"]>("published");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
      setStockCount(editionToEdit.stockCount || 20);
      setPagesCount(editionToEdit.pagesCount || 300);
      setChaptersCount(editionToEdit.chaptersCount || 30);
      setDuration(editionToEdit.duration || "12h");
      setCoverImage(editionToEdit.coverImage || "");
      setAudioPreviewUrl(editionToEdit.audioPreviewUrl || "");
      setStoryteller(editionToEdit.storyteller || "");
      setDescription(editionToEdit.description || "");
      setStatus(editionToEdit.status || "published");
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
      setStockCount(40);
      setPagesCount(380);
      setChaptersCount(40);
      setDuration("14h 20m");
      setCoverImage("https://storyhour.co.uk/wp-content/uploads/2026/01/WhatsApp-Image-2026-01-19-at-17.28.53.jpeg");
      setAudioPreviewUrl("https://www.youtube.com/embed/4up2VdHiO5I?autoplay=1");
      setStoryteller("StoryHour Ensemble");
      setDescription("");
      setStatus("published");
    }
    setErrorMessage(null);
  }, [editionToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMessage("Please enter an edition title.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

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
      stockCount: Number(stockCount) || 10,
      pagesCount: Number(pagesCount) || 200,
      chaptersCount: Number(chaptersCount) || 20,
      duration: duration.trim(),
      coverImage: coverImage.trim() || "https://storyhour.co.uk/wp-content/uploads/2026/01/WhatsApp-Image-2026-01-19-at-17.28.53.jpeg",
      audioPreviewUrl: audioPreviewUrl.trim() || "https://www.youtube.com/embed/4up2VdHiO5I?autoplay=1",
      storyteller: storyteller.trim(),
      description: description.trim(),
      accentColor: "#C9281D",
      status,
    };

    const res = await saveEdition(payload, editionToEdit?.id);
    setIsSubmitting(false);

    if (res.success) {
      onClose();
    } else {
      setErrorMessage(res.error || "Failed to save edition");
    }
  };

  const handleDelete = async () => {
    if (editionToEdit && window.confirm(`Permanently delete "${editionToEdit.title}"?`)) {
      setIsSubmitting(true);
      const res = await removeEdition(editionToEdit.id);
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
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E8E4DC] bg-[#FAF8F3]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <Library className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-[#0F0F0F]">
                {editionToEdit ? "Edit Book & Edition Details" : "Add Physical / Digital Edition"}
              </h3>
              <p className="text-[11px] text-[#696572] font-mono">
                {editionToEdit ? `Code: ${editionToEdit.codeName}` : "Inventory Catalog"}
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

        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto scrollbar-thin">
          {/* Publication Status */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-[#FAF8F3] border border-[#E8E4DC]">
            <div>
              <div className="font-bold text-xs text-[#0F0F0F]">Publication Status</div>
              <p className="text-[11px] text-[#696572]">
                Published editions appear on the Books & Stories shelves. Drafts are unlisted.
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#0F0F0F] mb-1">Edition Title *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ramayana — Signature Edition"
                className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#E8E4DC] text-xs text-[#0F0F0F] focus:outline-none focus:border-[#C9281D]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#0F0F0F] mb-1">Native Script Title (Optional)</label>
              <input
                type="text"
                value={nativeTitle}
                onChange={(e) => setNativeTitle(e.target.value)}
                placeholder="e.g. రామాయణం or रामायण"
                className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#E8E4DC] text-xs text-[#0F0F0F] focus:outline-none focus:border-[#C9281D]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#0F0F0F] mb-1">Code Name</label>
              <input
                type="text"
                value={codeName}
                onChange={(e) => setCodeName(e.target.value)}
                placeholder="SH-ED-2026-RAM"
                className="w-full px-3 py-2 rounded-xl bg-white border border-[#E8E4DC] text-xs text-[#0F0F0F] font-mono focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#0F0F0F] mb-1">Retail Price (£ GBP)</label>
              <input
                type="number"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-white border border-[#E8E4DC] text-xs text-[#0F0F0F] font-mono focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#0F0F0F] mb-1">Stock Units</label>
              <input
                type="number"
                value={stockCount}
                onChange={(e) => setStockCount(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-white border border-[#E8E4DC] text-xs text-[#0F0F0F] font-mono focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#0F0F0F] mb-1">Language</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-[#E8E4DC] text-xs text-[#0F0F0F] focus:outline-none"
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
              <label className="block text-xs font-bold text-[#0F0F0F] mb-1">Book Format</label>
              <input
                type="text"
                value={bookFormat}
                onChange={(e) => setBookFormat(e.target.value)}
                placeholder="Hardcover (Clothbound Foil)"
                className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#E8E4DC] text-xs text-[#0F0F0F] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#0F0F0F] mb-1">Storyteller / Narrator</label>
              <input
                type="text"
                value={storyteller}
                onChange={(e) => setStoryteller(e.target.value)}
                placeholder="StoryHour Ensemble"
                className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#E8E4DC] text-xs text-[#0F0F0F] focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#0F0F0F] mb-1">Pages Count</label>
              <input
                type="number"
                value={pagesCount}
                onChange={(e) => setPagesCount(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-white border border-[#E8E4DC] text-xs text-[#0F0F0F] font-mono focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#0F0F0F] mb-1">Chapters Count</label>
              <input
                type="number"
                value={chaptersCount}
                onChange={(e) => setChaptersCount(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-white border border-[#E8E4DC] text-xs text-[#0F0F0F] font-mono focus:outline-none"
              />
            </div>
          </div>

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
            <label className="block text-xs font-bold text-[#0F0F0F] mb-1">Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Details on paper weight, gold foil gilding, illustrations..."
              className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#E8E4DC] text-xs text-[#0F0F0F] focus:outline-none focus:border-[#C9281D]"
            />
          </div>

          <div className="pt-4 border-t border-[#E8E4DC] flex items-center justify-between">
            {editionToEdit ? (
              <button
                type="button"
                onClick={handleDelete}
                disabled={isSubmitting}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs text-red-600 hover:text-red-700 hover:bg-red-50 transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Edition</span>
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
                <span>{isSubmitting ? "Saving..." : editionToEdit ? "Update Edition" : "Save Edition"}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

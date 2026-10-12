"use client";

import React, { useState } from "react";
import {
  Mail,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Phone,
  Trash2,
  FileText,
  Send,
  Sparkles,
} from "lucide-react";
import { useAdmin, Enquiry } from "@/context/AdminContext";

export default function AdminEnquiriesPage() {
  const { enquiries, updateEnquiryStatus, addEnquiryNote, deleteEnquiry } = useAdmin();
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState<string>("All");
  const [selectedStatus, setSelectedStatus] = useState<string>("All");
  const [activeEnquiry, setActiveEnquiry] = useState<Enquiry | null>(null);
  const [noteInput, setNoteInput] = useState("");
  const [replySuccess, setReplySuccess] = useState(false);

  const filteredEnquiries = enquiries.filter((enq) => {
    const matchesSearch =
      enq.name.toLowerCase().includes(search.toLowerCase()) ||
      enq.email.toLowerCase().includes(search.toLowerCase()) ||
      enq.message.toLowerCase().includes(search.toLowerCase());

    const matchesType = selectedType === "All" || enq.enquiryType === selectedType;
    const matchesStatus = selectedStatus === "All" || enq.status === selectedStatus;

    return matchesSearch && matchesType && matchesStatus;
  });

  const handleOpenDetail = (enq: Enquiry) => {
    setActiveEnquiry(enq);
    setNoteInput(enq.notes || "");
    setReplySuccess(false);
  };

  const handleSaveNote = () => {
    if (activeEnquiry) {
      addEnquiryNote(activeEnquiry.id, noteInput);
      setActiveEnquiry((prev) => (prev ? { ...prev, notes: noteInput } : null));
    }
  };

  const handleSimulateReply = () => {
    setReplySuccess(true);
    if (activeEnquiry && activeEnquiry.status === "new") {
      updateEnquiryStatus(activeEnquiry.id, "in_progress");
      setActiveEnquiry((prev) => (prev ? { ...prev, status: "in_progress" } : null));
    }
    setTimeout(() => setReplySuccess(false), 3000);
  };

  return (
    <div className="space-y-6 select-none">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Inquiries & Workshop CRM
            </h1>
            <span className="px-2 py-0.5 text-xs font-mono rounded-full bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30 font-semibold">
              {filteredEnquiries.length} submissions
            </span>
          </div>
          <p className="text-zinc-400 text-xs sm:text-sm mt-1">
            Manage inquiries submitted via the contact form, school workshop bookings, and author submissions.
          </p>
        </div>
      </div>

      {/* 2. Filters */}
      <div className="p-4 rounded-2xl bg-[#121216] border border-[#23232b] flex flex-col md:flex-row items-center gap-3 shadow-lg">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by sender name, email, or message contents..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#C5A880]"
          />
        </div>

        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="w-full md:w-56 px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 focus:outline-none"
        >
          <option value="All">All Inquiry Types</option>
          <option value="Puppet Show & School Workshop">School Workshops</option>
          <option value="Publishing & Story Submission">Publishing Submissions</option>
          <option value="Licensing & Institutional Audio">Licensing & Councils</option>
          <option value="Audiobook Feedback">Audiobook Feedback</option>
          <option value="General Enquiry">General Enquiries</option>
        </select>

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="w-full md:w-44 px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 focus:outline-none"
        >
          <option value="All">All Statuses</option>
          <option value="new">New (Unread)</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
        </select>
      </div>

      {/* 3. Inquiries List */}
      <div className="rounded-2xl bg-[#121216] border border-[#23232b] shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-zinc-800 bg-[#0e0e12] text-[10px] font-mono uppercase text-zinc-500">
                <th className="py-3.5 px-4 font-semibold">Date</th>
                <th className="py-3.5 px-4 font-semibold">Sender</th>
                <th className="py-3.5 px-4 font-semibold">Inquiry Classification</th>
                <th className="py-3.5 px-4 font-semibold">Message Excerpt</th>
                <th className="py-3.5 px-4 font-semibold">Status</th>
                <th className="py-3.5 px-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
              {filteredEnquiries.map((enq) => (
                <tr key={enq.id} className="hover:bg-zinc-800/30 transition group">
                  <td className="py-3.5 px-4 font-mono text-zinc-500 text-[11px] whitespace-nowrap">
                    {new Date(enq.receivedAt).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                    })}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-white">{enq.name}</div>
                    <div className="text-[10px] text-zinc-500 font-mono">{enq.email}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#C5A880]/15 text-[#C5A880] border border-[#C5A880]/20 font-semibold">
                      {enq.enquiryType}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 max-w-sm">
                    <p className="line-clamp-1 text-zinc-300">{enq.message}</p>
                    {enq.notes && (
                      <span className="text-[10px] text-zinc-500 flex items-center gap-1 mt-0.5">
                        <FileText className="w-3 h-3 text-[#C5A880]" />
                        <span className="italic line-clamp-1">Note: {enq.notes}</span>
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4">
                    <select
                      value={enq.status}
                      onChange={(e) => updateEnquiryStatus(enq.id, e.target.value as any)}
                      className={`px-2 py-1 rounded-full text-[10px] font-mono font-semibold border focus:outline-none ${
                        enq.status === "new"
                          ? "bg-[#D4AF37]/15 text-[#D4AF37] border-[#D4AF37]/30"
                          : enq.status === "in_progress"
                          ? "bg-blue-500/15 text-blue-400 border-blue-500/30"
                          : "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                      }`}
                    >
                      <option value="new" className="bg-zinc-900 text-[#D4AF37]">
                        New
                      </option>
                      <option value="in_progress" className="bg-zinc-900 text-blue-400">
                        In Progress
                      </option>
                      <option value="resolved" className="bg-zinc-900 text-emerald-400">
                        Resolved
                      </option>
                    </select>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => handleOpenDetail(enq)}
                      className="px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition"
                    >
                      Inspect
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredEnquiries.length === 0 && (
          <div className="py-16 text-center text-zinc-500 text-xs">
            No inquiries matching the selected filters.
          </div>
        )}
      </div>

      {/* Detail & Reply Modal */}
      {activeEnquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md" onClick={() => setActiveEnquiry(null)} />
          <div className="relative w-full max-w-2xl rounded-2xl bg-[#131317] border border-[#272730] shadow-2xl p-6 z-10 animate-zoom-in-95 text-zinc-200">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
              <div>
                <h3 className="font-serif font-bold text-lg text-white">{activeEnquiry.name}</h3>
                <div className="text-xs text-[#C5A880] font-mono mt-0.5">
                  {activeEnquiry.enquiryType} • Received {new Date(activeEnquiry.receivedAt).toLocaleString()}
                </div>
              </div>
              <button
                onClick={() => {
                  deleteEnquiry(activeEnquiry.id);
                  setActiveEnquiry(null);
                }}
                className="p-1.5 rounded text-zinc-500 hover:text-red-400 hover:bg-zinc-800 transition"
                title="Delete Inquiry"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              {/* Contact details */}
              <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 flex flex-wrap gap-4 text-zinc-300">
                <div className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-zinc-500" />
                  <span>{activeEnquiry.email}</span>
                </div>
                {activeEnquiry.phone && (
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-zinc-500" />
                    <span>{activeEnquiry.phone}</span>
                  </div>
                )}
              </div>

              {/* Message text */}
              <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
                <div className="text-[10px] font-mono text-zinc-500 uppercase mb-1">Message</div>
                <p className="text-zinc-200 whitespace-pre-wrap leading-relaxed">{activeEnquiry.message}</p>
              </div>

              {/* Editorial Notes */}
              <div>
                <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                  Internal Editorial & Curatorial Notes
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={noteInput}
                    onChange={(e) => setNoteInput(e.target.value)}
                    placeholder="Add operational notes or team instructions..."
                    className="flex-1 px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-[#C5A880]"
                  />
                  <button
                    onClick={handleSaveNote}
                    className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-medium text-xs transition"
                  >
                    Save Note
                  </button>
                </div>
              </div>

              {/* Simulate Quick Response */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-zinc-900 to-[#18151c] border border-zinc-800 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-white">Direct Email Dispatch</div>
                  <div className="text-[11px] text-zinc-400">
                    Dispatch official response from <code className="font-mono text-zinc-300">contact@storyhour.co.uk</code>
                  </div>
                </div>
                <button
                  onClick={handleSimulateReply}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#C9281D] to-[#A81F16] text-white text-xs font-semibold shadow hover:brightness-110 active:scale-95 transition"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Dispatch Reply</span>
                </button>
              </div>

              {replySuccess && (
                <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  <span>Response logged and sent via Resend API mock service.</span>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setActiveEnquiry(null)}
                className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs text-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

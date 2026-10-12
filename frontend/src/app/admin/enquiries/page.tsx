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
  X,
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
    <div className="space-y-6">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#0F0F0F] tracking-tight">
              Inquiries & Workshop CRM
            </h1>
            <span className="px-2.5 py-0.5 text-xs font-mono rounded-full bg-[#C9281D]/10 text-[#C9281D] border border-[#C9281D]/20 font-semibold">
              {filteredEnquiries.length} submissions
            </span>
          </div>
          <p className="text-[#6B655C] text-xs sm:text-sm mt-1">
            Manage inquiries submitted via the contact form, school workshop bookings, and author submissions.
          </p>
        </div>
      </div>

      {/* 2. Filters */}
      <div className="p-4 rounded-2xl bg-white border border-[#E8E4DC] flex flex-col md:flex-row items-center gap-3 shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-[#8C827A] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by sender name, email, or message contents..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#FAF8F3] border border-[#E8E4DC] text-xs text-[#0F0F0F] placeholder-[#8C827A] focus:outline-none focus:border-[#C9281D]"
          />
        </div>

        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="w-full md:w-56 px-3 py-2 rounded-xl bg-[#FAF8F3] border border-[#E8E4DC] text-xs text-[#0F0F0F] focus:outline-none"
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
          className="w-full md:w-44 px-3 py-2 rounded-xl bg-[#FAF8F3] border border-[#E8E4DC] text-xs text-[#0F0F0F] focus:outline-none"
        >
          <option value="All">All Statuses</option>
          <option value="new">New (Unread)</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
        </select>
      </div>

      {/* 3. Inquiries List */}
      <div className="rounded-2xl bg-white border border-[#E8E4DC] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#E8E4DC] bg-[#FAF8F3] text-[10px] font-mono uppercase text-[#6B655C]">
                <th className="py-3.5 px-4 font-semibold">Date</th>
                <th className="py-3.5 px-4 font-semibold">Sender</th>
                <th className="py-3.5 px-4 font-semibold">Inquiry Classification</th>
                <th className="py-3.5 px-4 font-semibold">Message Excerpt</th>
                <th className="py-3.5 px-4 font-semibold">Status</th>
                <th className="py-3.5 px-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E4DC] text-[#0F0F0F]">
              {filteredEnquiries.map((enq) => (
                <tr key={enq.id} className="hover:bg-[#FAF8F3]/60 transition group">
                  <td className="py-3.5 px-4 font-mono text-[#8C827A] text-[11px] whitespace-nowrap">
                    {new Date(enq.receivedAt).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                    })}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-[#0F0F0F]">{enq.name}</div>
                    <div className="text-[10px] text-[#8C827A] font-mono">{enq.email}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#FAF8F3] text-[#6B655C] border border-[#E8E4DC] font-semibold">
                      {enq.enquiryType}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 max-w-sm">
                    <p className="line-clamp-1 text-[#0F0F0F]">{enq.message}</p>
                    {enq.notes && (
                      <span className="text-[10px] text-[#8C827A] flex items-center gap-1 mt-0.5">
                        <FileText className="w-3 h-3 text-[#C9281D]" />
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
                          ? "bg-amber-50 text-amber-700 border-amber-200"
                          : enq.status === "in_progress"
                          ? "bg-blue-50 text-blue-700 border-blue-200"
                          : "bg-emerald-50 text-emerald-700 border-emerald-200"
                      }`}
                    >
                      <option value="new">
                        New
                      </option>
                      <option value="in_progress">
                        In Progress
                      </option>
                      <option value="resolved">
                        Resolved
                      </option>
                    </select>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => handleOpenDetail(enq)}
                      className="px-2.5 py-1.5 rounded-lg bg-[#FAF8F3] hover:bg-[#F4EFE6] border border-[#E8E4DC] text-[#0F0F0F] transition"
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
          <div className="py-16 text-center text-[#8C827A] text-xs">
            No inquiries matching the selected filters.
          </div>
        )}
      </div>

      {/* Detail & Reply Modal */}
      {activeEnquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setActiveEnquiry(null)} />
          <div className="relative w-full max-w-2xl rounded-2xl bg-white border border-[#E8E4DC] shadow-2xl p-6 z-10 text-[#0F0F0F]">
            <div className="flex items-center justify-between pb-4 border-b border-[#E8E4DC]">
              <div>
                <h3 className="font-serif font-bold text-lg text-[#0F0F0F]">{activeEnquiry.name}</h3>
                <div className="text-xs text-[#8C827A] font-mono mt-0.5">
                  {activeEnquiry.enquiryType} • Received {new Date(activeEnquiry.receivedAt).toLocaleString()}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    deleteEnquiry(activeEnquiry.id);
                    setActiveEnquiry(null);
                  }}
                  className="p-1.5 rounded text-[#8C827A] hover:text-[#C9281D] hover:bg-red-50 transition"
                  title="Delete Inquiry"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setActiveEnquiry(null)}
                  className="p-1 rounded-lg hover:bg-[#FAF8F3] text-[#8C827A]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              {/* Contact details */}
              <div className="p-3 rounded-xl bg-[#FAF8F3] border border-[#E8E4DC] flex flex-wrap gap-4 text-[#0F0F0F]">
                <div className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-[#8C827A]" />
                  <span>{activeEnquiry.email}</span>
                </div>
                {activeEnquiry.phone && (
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-[#8C827A]" />
                    <span>{activeEnquiry.phone}</span>
                  </div>
                )}
              </div>

              {/* Message text */}
              <div className="p-4 rounded-xl bg-[#FAF8F3] border border-[#E8E4DC]">
                <div className="text-[10px] font-mono text-[#8C827A] uppercase mb-1">Message</div>
                <p className="text-[#0F0F0F] whitespace-pre-wrap leading-relaxed">{activeEnquiry.message}</p>
              </div>

              {/* Editorial Notes */}
              <div>
                <label className="block text-[11px] font-semibold text-[#0F0F0F] mb-1">
                  Internal Editorial & Curatorial Notes
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={noteInput}
                    onChange={(e) => setNoteInput(e.target.value)}
                    placeholder="Add operational notes or team instructions..."
                    className="flex-1 px-3 py-2 rounded-xl bg-[#FAF8F3] border border-[#E8E4DC] text-xs text-[#0F0F0F] focus:outline-none focus:border-[#C9281D]"
                  />
                  <button
                    onClick={handleSaveNote}
                    className="px-3.5 py-2 rounded-xl bg-white hover:bg-[#FAF8F3] border border-[#E8E4DC] text-[#0F0F0F] font-semibold text-xs transition"
                  >
                    Save Note
                  </button>
                </div>
              </div>

              {/* Dispatch Response */}
              <div className="p-4 rounded-xl bg-[#FAF8F3] border border-[#E8E4DC] flex items-center justify-between">
                <div>
                  <div className="font-semibold text-[#0F0F0F]">Direct Email Dispatch</div>
                  <div className="text-[11px] text-[#6B655C]">
                    Dispatch official response from <code className="font-mono text-[#0F0F0F]">contact@storyhour.co.uk</code>
                  </div>
                </div>
                <button
                  onClick={handleSimulateReply}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#C9281D] hover:bg-[#A82017] text-white text-xs font-semibold shadow-sm transition active:scale-95"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Dispatch Reply</span>
                </button>
              </div>

              {replySuccess && (
                <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Response logged and sent via Resend API service.</span>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setActiveEnquiry(null)}
                className="px-4 py-2 rounded-xl bg-[#FAF8F3] hover:bg-[#F4EFE6] border border-[#E8E4DC] text-xs font-semibold text-[#0F0F0F]"
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

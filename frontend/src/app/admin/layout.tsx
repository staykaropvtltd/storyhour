"use client";

import React, { useState } from "react";
import { AdminProvider } from "@/context/AdminContext";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import GlobalCommandModal from "@/components/admin/GlobalCommandModal";
import StoryEditModal from "@/components/admin/StoryEditModal";
import EditionEditModal from "@/components/admin/EditionEditModal";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [quickAddType, setQuickAddType] = useState<"story" | "edition" | null>(null);

  return (
    <AdminProvider>
      <div className="min-h-screen bg-[#09090b] text-[#f4f4f6] flex flex-col md:flex-row font-sans selection:bg-[#C9281D] selection:text-white">
        {/* Left Sidebar */}
        <AdminSidebar />

        {/* Right Main Stream */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#09090b]">
          <AdminHeader
            onOpenSearch={() => setIsCommandOpen(true)}
            onOpenAddModal={(type) => {
              if (type === "story") setQuickAddType("story");
              else if (type === "edition") setQuickAddType("edition");
            }}
          />

          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto animate-fade-in">
            {children}
          </main>
        </div>

        {/* Global Cmd+K Search Modal */}
        <GlobalCommandModal isOpen={isCommandOpen} onClose={() => setIsCommandOpen(false)} />

        {/* Quick Add Story Modal */}
        <StoryEditModal
          isOpen={quickAddType === "story"}
          onClose={() => setQuickAddType(null)}
          storyToEdit={null}
        />

        {/* Quick Add Edition Modal */}
        <EditionEditModal
          isOpen={quickAddType === "edition"}
          onClose={() => setQuickAddType(null)}
          editionToEdit={null}
        />
      </div>
    </AdminProvider>
  );
}

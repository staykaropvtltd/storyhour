"use client";

import React, { useState } from "react";
import { AdminProvider } from "@/context/AdminContext";
import { AdminCmsProvider } from "@/context/AdminCmsContext";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import GlobalCommandModal from "@/components/admin/GlobalCommandModal";
import StoryModal from "@/components/admin/StoryModal";
import EditionModal from "@/components/admin/EditionModal";
import StorytellerModal from "@/components/admin/StorytellerModal";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [quickAddType, setQuickAddType] = useState<"story" | "edition" | "storyteller" | null>(null);

  return (
    <AdminProvider>
      <AdminCmsProvider>
      <div className="min-h-screen bg-[#FAF8F3] text-[#0F0F0F] flex flex-col md:flex-row font-sans selection:bg-[#C9281D] selection:text-white">
        {/* Left Sidebar */}
        <AdminSidebar />

        {/* Right Content Stream */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#FAF8F3]">
          <AdminHeader
            onOpenSearch={() => setIsCommandOpen(true)}
            onOpenAddModal={(type) => setQuickAddType(type)}
          />

          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto animate-fade-in">
            {children}
          </main>
        </div>

        {/* Global Cmd+K Search Modal */}
        <GlobalCommandModal isOpen={isCommandOpen} onClose={() => setIsCommandOpen(false)} />

        {/* Quick Add Modals */}
        <StoryModal
          isOpen={quickAddType === "story"}
          onClose={() => setQuickAddType(null)}
          storyToEdit={null}
        />
        <EditionModal
          isOpen={quickAddType === "edition"}
          onClose={() => setQuickAddType(null)}
          editionToEdit={null}
        />
        <StorytellerModal
          isOpen={quickAddType === "storyteller"}
          onClose={() => setQuickAddType(null)}
          storytellerToEdit={null}
        />
      </div>
    </AdminCmsProvider>
    </AdminProvider>
  );
}

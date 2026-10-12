"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import {
  CmsStory,
  CmsEdition,
  CmsStoryteller,
  CmsHomepageConfig,
  CmsDashboardStats,
} from "@/lib/cms-types";

interface AdminCmsContextType {
  stories: CmsStory[];
  editions: CmsEdition[];
  storytellers: CmsStoryteller[];
  homepage: CmsHomepageConfig | null;
  stats: CmsDashboardStats | null;
  loading: boolean;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  adminUser: { email: string; role: string } | null;

  // Real API Actions
  refreshData: () => Promise<void>;
  refreshContent: () => Promise<void>;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;

  // Story CRUD
  saveStory: (storyData: Partial<CmsStory>, id?: string) => Promise<{ success: boolean; error?: string }>;
  toggleStoryStatus: (id: string, currentStatus?: string) => Promise<void>;
  removeStory: (id: string) => Promise<{ success: boolean; error?: string }>;

  // Edition CRUD
  saveEdition: (editionData: Partial<CmsEdition>, id?: string) => Promise<{ success: boolean; error?: string }>;
  toggleEditionStatus: (id: string, currentStatus?: string) => Promise<void>;
  removeEdition: (id: string) => Promise<{ success: boolean; error?: string }>;

  // Storyteller CRUD
  saveStoryteller: (stData: Partial<CmsStoryteller>, id?: string) => Promise<{ success: boolean; error?: string }>;
  toggleStorytellerStatus: (id: string, currentStatus?: string) => Promise<void>;
  removeStoryteller: (id: string) => Promise<{ success: boolean; error?: string }>;

  // Homepage Config
  homepageConfig: CmsHomepageConfig | null;
  saveHomepageConfig: (updates: Partial<CmsHomepageConfig>) => Promise<{ success: boolean; error?: string }>;
}

const AdminCmsContext = createContext<AdminCmsContextType | undefined>(undefined);

export const AdminCmsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [stories, setStories] = useState<CmsStory[]>([]);
  const [editions, setEditions] = useState<CmsEdition[]>([]);
  const [storytellers, setStorytellers] = useState<CmsStoryteller[]>([]);
  const [homepage, setHomepage] = useState<CmsHomepageConfig | null>(null);
  const [stats, setStats] = useState<CmsDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(true); // default true for seamless initial admin render, verified on check
  const [adminUser, setAdminUser] = useState<{ email: string; role: string } | null>({
    email: "admin@storyhour.co.uk",
    role: "admin",
  });

  const notifyPublicUpdate = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("storyhour_cms_updated"));
    }
  };

  const getAuthHeaders = (): Record<string, string> => {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("storyhour_admin_token");
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
    }
    return headers;
  };

  const refreshData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const headers: Record<string, string> = { "Cache-Control": "no-cache" };
      if (typeof window !== "undefined") {
        const token = localStorage.getItem("storyhour_admin_token");
        if (token) headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch("/api/cms/admin/content", { headers });

      if (res.status === 401) {
        setIsAuthenticated(false);
        setAdminUser(null);
        setLoading(false);
        return;
      }

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (json.success && json.data) {
        setStories(json.data.stories || []);
        setEditions(json.data.editions || []);
        setStorytellers(json.data.storytellers || []);
        setHomepage(json.data.homepage || null);
        setStats(json.data.stats || null);
        setIsAuthenticated(true);
      }
    } catch (err: any) {
      console.error("[AdminCmsContext] Refresh failed:", err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Login
  const login = async (email: string, password: string) => {
    try {
      const res = await fetch("/api/cms/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "login", email, password }),
      });
      const json = await res.json();
      if (json.success) {
        if (json.token && typeof window !== "undefined") {
          localStorage.setItem("storyhour_admin_token", json.token);
        }
        setIsAuthenticated(true);
        setAdminUser(json.admin);
        await refreshData();
        return { success: true };
      } else {
        return { success: false, error: json.error || "Login failed" };
      }
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  // Logout
  const logout = async () => {
    try {
      if (typeof window !== "undefined") {
        localStorage.removeItem("storyhour_admin_token");
      }
      await fetch("/api/cms/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "logout" }),
      });
    } finally {
      setIsAuthenticated(false);
      setAdminUser(null);
    }
  };

  // Story CRUD
  const saveStory = async (storyData: Partial<CmsStory>, id?: string) => {
    try {
      const url = id ? `/api/cms/admin/stories/${id}` : "/api/cms/admin/stories";
      const method = id ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(storyData),
      });
      const json = await res.json();
      if (json.success) {
        await refreshData();
        notifyPublicUpdate();
        return { success: true };
      }
      return { success: false, error: json.error || "Failed to save story" };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const toggleStoryStatus = async (id: string, currentStatus?: string) => {
    let status = currentStatus;
    if (!status) {
      const item = stories.find((s) => s.id === id);
      status = item?.status || "draft";
    }
    const nextStatus = status === "published" ? "draft" : "published";
    await saveStory({ status: nextStatus as any }, id);
  };

  const removeStory = async (id: string) => {
    try {
      const res = await fetch(`/api/cms/admin/stories/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      const json = await res.json();
      if (json.success) {
        await refreshData();
        notifyPublicUpdate();
        return { success: true };
      }
      return { success: false, error: json.error || "Failed to delete" };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  // Edition CRUD
  const saveEdition = async (editionData: Partial<CmsEdition>, id?: string) => {
    try {
      const url = id ? `/api/cms/admin/editions/${id}` : "/api/cms/admin/editions";
      const method = id ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(editionData),
      });
      const json = await res.json();
      if (json.success) {
        await refreshData();
        notifyPublicUpdate();
        return { success: true };
      }
      return { success: false, error: json.error || "Failed to save edition" };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const toggleEditionStatus = async (id: string, currentStatus?: string) => {
    let status = currentStatus;
    if (!status) {
      const item = editions.find((e) => e.id === id);
      status = item?.status || "draft";
    }
    const nextStatus = status === "published" ? "draft" : "published";
    await saveEdition({ status: nextStatus as any }, id);
  };

  const removeEdition = async (id: string) => {
    try {
      const res = await fetch(`/api/cms/admin/editions/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      const json = await res.json();
      if (json.success) {
        await refreshData();
        notifyPublicUpdate();
        return { success: true };
      }
      return { success: false, error: json.error || "Failed to delete edition" };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  // Storyteller CRUD
  const saveStoryteller = async (stData: Partial<CmsStoryteller>, id?: string) => {
    try {
      const url = id ? `/api/cms/admin/storytellers/${id}` : "/api/cms/admin/storytellers";
      const method = id ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(stData),
      });
      const json = await res.json();
      if (json.success) {
        await refreshData();
        notifyPublicUpdate();
        return { success: true };
      }
      return { success: false, error: json.error || "Failed to save storyteller" };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const toggleStorytellerStatus = async (id: string, currentStatus?: string) => {
    let status = currentStatus;
    if (!status) {
      const item = storytellers.find((s) => s.id === id);
      status = item?.status || "draft";
    }
    const nextStatus = status === "published" ? "draft" : "published";
    await saveStoryteller({ status: nextStatus as any }, id);
  };

  const removeStoryteller = async (id: string) => {
    try {
      const res = await fetch(`/api/cms/admin/storytellers/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      const json = await res.json();
      if (json.success) {
        await refreshData();
        notifyPublicUpdate();
        return { success: true };
      }
      return { success: false, error: json.error || "Failed to delete storyteller" };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  // Homepage Config
  const saveHomepageConfig = async (updates: Partial<CmsHomepageConfig>) => {
    try {
      const res = await fetch("/api/cms/admin/homepage", {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(updates),
      });
      const json = await res.json();
      if (json.success) {
        await refreshData();
        notifyPublicUpdate();
        return { success: true };
      }
      return { success: false, error: json.error || "Failed to save homepage config" };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  return (
    <AdminCmsContext.Provider
      value={{
        stories,
        editions,
        storytellers,
        homepage,
        homepageConfig: homepage,
        stats,
        loading,
        isLoading: loading,
        error,
        isAuthenticated,
        adminUser,
        refreshData,
        refreshContent: refreshData,
        login,
        logout,
        saveStory,
        toggleStoryStatus,
        removeStory,
        saveEdition,
        toggleEditionStatus,
        removeEdition,
        saveStoryteller,
        toggleStorytellerStatus,
        removeStoryteller,
        saveHomepageConfig,
      }}
    >
      {children}
    </AdminCmsContext.Provider>
  );
};

export const useAdminCms = () => {
  const ctx = useContext(AdminCmsContext);
  if (!ctx) {
    throw new Error("useAdminCms must be used within an AdminCmsProvider");
  }
  return ctx;
};

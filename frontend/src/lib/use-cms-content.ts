"use client";

import { useState, useEffect } from "react";
import { CmsStory, CmsEdition, CmsStoryteller, CmsHomepageConfig } from "./cms-types";
import { STORIES, STORYTELLERS } from "@/data/storyhour-data";
import { EDITIONS } from "@/data/editions-data";

export interface PublicContentState {
  stories: CmsStory[];
  editions: CmsEdition[];
  storytellers: CmsStoryteller[];
  homepage: CmsHomepageConfig | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

// Fallback initial data for instantaneous zero-latency render
const FALLBACK_STORIES: CmsStory[] = STORIES.map((s) => ({
  ...s,
  status: "published",
  featured: !!s.featured,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
}));

const FALLBACK_EDITIONS: CmsEdition[] = EDITIONS.map((e) => ({
  ...e,
  status: "published",
  stockCount: 50,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
}));

const FALLBACK_STORYTELLERS: CmsStoryteller[] = STORYTELLERS.map((st, idx) => ({
  id: st.id || `st-${idx + 1}`,
  name: st.name,
  role: st.role,
  bio: st.bio,
  image: st.portraitImage || (st as any).image || "https://storyhour.co.uk/wp-content/uploads/2026/01/WhatsApp-Image-2026-01-19-at-17.23.29-1.jpeg",
  region: st.region || "UK / India",
  languages: st.languages || ["English"],
  connectedStoryTitle: st.connectedStoryTitle || "StoryHour Series",
  status: "published",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
}));

export function useCmsContent(): PublicContentState {
  const [stories, setStories] = useState<CmsStory[]>(FALLBACK_STORIES);
  const [editions, setEditions] = useState<CmsEdition[]>(FALLBACK_EDITIONS);
  const [storytellers, setStorytellers] = useState<CmsStoryteller[]>(FALLBACK_STORYTELLERS);
  const [homepage, setHomepage] = useState<CmsHomepageConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchContent = async () => {
    try {
      const res = await fetch("/api/cms/content", {
        headers: { "Cache-Control": "no-cache" },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (json.success && json.data) {
        setStories(json.data.stories || FALLBACK_STORIES);
        setEditions(json.data.editions || FALLBACK_EDITIONS);
        setStorytellers(json.data.storytellers && json.data.storytellers.length > 0 ? json.data.storytellers : FALLBACK_STORYTELLERS);
        setHomepage(json.data.homepage || null);
        setError(null);
      }
    } catch (err: any) {
      console.warn("[useCmsContent] Using fallback data:", err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContent();

    // Listen for storage or custom events when admin updates content
    const handleCmsUpdate = () => {
      fetchContent();
    };

    window.addEventListener("storyhour_cms_updated", handleCmsUpdate);
    window.addEventListener("focus", handleCmsUpdate);
    return () => {
      window.removeEventListener("storyhour_cms_updated", handleCmsUpdate);
      window.removeEventListener("focus", handleCmsUpdate);
    };
  }, []);

  return {
    stories,
    editions,
    storytellers,
    homepage,
    loading,
    error,
    refetch: fetchContent,
  };
}

export type ContentStatus = "published" | "draft" | "archived";

export interface CmsStory {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  storyteller: string;
  language: "English" | "Hindi" | "Telugu" | "Multilingual";
  audience: "Children (5-8)" | "Young Listeners (9-12)" | "Families & All Ages";
  category: "Mythology & Epics" | "Folk Tales" | "Wisdom & Bravery" | "History & Culture";
  format: "Audiobook" | "Puppet Stories & Skits" | "Performance Skit";
  duration: string;
  durationMinutes: number;
  coverImage: string;
  audioPreviewUrl: string;
  chaptersCount: number;
  description: string;
  culturalNote?: string;
  featured: boolean;
  status: ContentStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CmsEdition {
  id: string;
  year: string;
  season: string;
  codeName: string;
  title: string;
  nativeTitle?: string;
  subtitle: string;
  language: "English" | "Hindi" | "Telugu" | "Multilingual";
  bookFormat: string;
  category: string;
  pagesCount: number;
  chaptersCount: number;
  duration: string;
  coverImage: string;
  badge?: string;
  isFeatured?: boolean;
  description: string;
  audioPreviewUrl: string;
  storyteller: string;
  price: number;
  accentColor: string;
  status: ContentStatus;
  stockCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CmsStoryteller {
  id: string;
  name: string;
  role: string;
  bio: string;
  image: string;
  region?: string;
  languages?: string[];
  connectedStoryTitle?: string;
  status: ContentStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CmsHomepageConfig {
  heroHeadline: string;
  heroSubheadline: string;
  heroCtaText: string;
  heroCtaDestination: string;
  featuredStoryId: string;
  announcementText: string;
  announcementEnabled: boolean;
  updatedAt: string;
}

export interface CmsDataStore {
  version: number;
  lastUpdated: string;
  homepage: CmsHomepageConfig;
  stories: CmsStory[];
  editions: CmsEdition[];
  storytellers: CmsStoryteller[];
}

export interface CmsDashboardStats {
  totalStories: number;
  publishedStories: number;
  draftStories: number;
  totalEditions: number;
  publishedEditions: number;
  totalStorytellers: number;
  publishedStorytellers: number;
  totalAudioHours: number;
  recentActivity: Array<{
    id: string;
    type: "story" | "edition" | "storyteller" | "homepage";
    title: string;
    action: "created" | "updated" | "published" | "unpublished" | "deleted";
    timestamp: string;
  }>;
}

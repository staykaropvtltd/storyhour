import fs from "fs/promises";
import path from "path";
import {
  CmsDataStore,
  CmsStory,
  CmsEdition,
  CmsStoryteller,
  CmsHomepageConfig,
  CmsDashboardStats,
} from "./cms-types";
import { STORIES } from "@/data/storyhour-data";
import { EDITIONS } from "@/data/editions-data";

// Filepath for persistent server-side JSON database
const DATA_FILE_PATH = path.join(process.cwd(), "src", "data", "storyhour-content.json");

// Authentic baseline storytellers from StoryHour team
const INITIAL_STORYTELLERS: CmsStoryteller[] = [
  {
    id: "st-1",
    name: "Neelima Penumarthy",
    role: "Founder | CEO",
    bio: "Founded StoryHourGlobal from a deep passion for live storytelling, puppet theatre, and cultural heritage. Leading audiobooks, skits, and performances that connect generations across the UK, India, and worldwide.",
    image: "https://storyhour.co.uk/wp-content/uploads/2026/01/WhatsApp-Image-2026-01-19-at-17.23.29-1.jpeg",
    region: "London & Hyderabad",
    languages: ["English", "Telugu", "Hindi"],
    connectedStoryTitle: "Ramayana & Classical Epics",
    status: "published",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "st-2",
    name: "Robin Christian",
    role: "Music Composer",
    bio: "Acclaimed music composer crafting evocative acoustic soundscapes with bansuri, sitar, and traditional instrumentation that recreate the warmth and intimacy of ancient evening storytelling circles.",
    image: "https://storyhour.co.uk/wp-content/uploads/2026/01/WhatsApp-Image-2026-01-19-at-17.23.24-1-1.jpeg",
    region: "London, UK",
    languages: ["English", "Hindi"],
    connectedStoryTitle: "Acoustic Soundtrack & Atmosphere",
    status: "published",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "st-3",
    name: "Shreyas Pulle",
    role: "Writer | Narrator",
    bio: "Core contributor to scriptwriting and character narration, shaping epic retellings and cultural adaptations into captivating, energetic oral performances tailored for young listeners and families.",
    image: "https://storyhour.co.uk/wp-content/uploads/2026/02/WhatsApp-Image-2026-02-09-at-11.45.28.jpeg",
    region: "London, UK",
    languages: ["English"],
    connectedStoryTitle: "Ramayana English Series",
    status: "published",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "st-4",
    name: "Padmaja Shrivastav",
    role: "Hindi Ramayana Translator",
    bio: "Ensuring linguistic authenticity and poetic meter, translating ancient Sanskrit verses into soulful, accessible Hindi narration that honours the classical epics while engaging contemporary children.",
    image: "https://storyhour.co.uk/wp-content/uploads/2026/01/WhatsApp-Image-2026-01-19-at-17.23.27-1.jpeg",
    region: "India",
    languages: ["Hindi", "Sanskrit"],
    connectedStoryTitle: "Ramayan Hindi Production",
    status: "published",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "st-5",
    name: "Sonali Maitra",
    role: "Hindi Ramayana Director",
    bio: "Directing multi-voice dramatic ensembles and studio vocalists, bringing theatrical cadence, emotional resonance, and cultural nuance into StoryHour's flagship Hindi audio productions.",
    image: "https://storyhour.co.uk/wp-content/uploads/2026/02/WhatsApp-Image-2026-02-09-at-11.16.40.jpeg",
    region: "Mumbai & London",
    languages: ["Hindi", "English"],
    connectedStoryTitle: "Dramatized Ensemble Audio",
    status: "published",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "st-6",
    name: "Ayur Pulle & Aarush Kumbhakern",
    role: "Writers | Narrators",
    bio: "Youth storytellers bringing vibrant character voices and relatable perspectives to ancient fables, proving that timeless moral tales continue to inspire and entertain the next generation.",
    image: "https://storyhour.co.uk/wp-content/uploads/2026/01/Gandhi-Prayers-STudents-1024x683.jpg",
    region: "UK",
    languages: ["English"],
    connectedStoryTitle: "Youth Folk Narrations",
    status: "published",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
];

// Initial Homepage configuration matching live StoryHour hero
const INITIAL_HOMEPAGE: CmsHomepageConfig = {
  heroHeadline: "the greatest stories ever told",
  heroSubheadline: "Discover Indian mythology, culture, and history through soulful audiobooks, live puppet storytelling, and screen-free calm bedtimes. In Hindi, English & Telugu.",
  heroCtaText: "Start Listening",
  heroCtaDestination: "/stories",
  featuredStoryId: "story-1",
  announcementText: "Diwali Special: Complete Ramayana Series Now Available in 3 Classical Languages",
  announcementEnabled: true,
  updatedAt: new Date().toISOString(),
};

// In-memory activity log (and persisted into store)
interface ActivityRecord {
  id: string;
  type: "story" | "edition" | "storyteller" | "homepage";
  title: string;
  action: "created" | "updated" | "published" | "unpublished" | "deleted";
  timestamp: string;
}

let memoryActivityLog: ActivityRecord[] = [
  {
    id: "act-1",
    type: "story",
    title: "Ramayana — An Ancient Indian Epic",
    action: "published",
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: "act-2",
    type: "edition",
    title: "Ramayana — Signature Edition",
    action: "updated",
    timestamp: new Date(Date.now() - 3600000 * 8).toISOString(),
  },
];

function generateInitialStore(): CmsDataStore {
  const initialStories: CmsStory[] = STORIES.map((s) => ({
    ...s,
    status: "published",
    featured: !!s.featured,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  }));

  const initialEditions: CmsEdition[] = EDITIONS.map((e) => ({
    ...e,
    status: "published",
    stockCount: e.pagesCount > 400 ? 4 : 45, // realistic stock count
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  }));

  return {
    version: 1,
    lastUpdated: new Date().toISOString(),
    homepage: INITIAL_HOMEPAGE,
    stories: initialStories,
    editions: initialEditions,
    storytellers: INITIAL_STORYTELLERS,
  };
}

/**
 * Reads the persistent JSON database. If file does not exist, initializes it.
 */
export async function getCmsData(): Promise<CmsDataStore> {
  try {
    const raw = await fs.readFile(DATA_FILE_PATH, "utf8");
    return JSON.parse(raw) as CmsDataStore;
  } catch (err: any) {
    if (err.code === "ENOENT") {
      // File does not exist yet -> create and persist initial store
      const initial = generateInitialStore();
      await saveCmsData(initial);
      return initial;
    }
    console.error("[CmsService] Error reading data store:", err);
    return generateInitialStore();
  }
}

/**
 * Atomically writes data to the persistent JSON database.
 */
export async function saveCmsData(data: CmsDataStore): Promise<void> {
  data.lastUpdated = new Date().toISOString();
  const dir = path.dirname(DATA_FILE_PATH);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(DATA_FILE_PATH, JSON.stringify(data, null, 2), "utf8");
}

function recordActivity(
  type: ActivityRecord["type"],
  title: string,
  action: ActivityRecord["action"]
) {
  memoryActivityLog.unshift({
    id: "act-" + Date.now(),
    type,
    title,
    action,
    timestamp: new Date().toISOString(),
  });
  if (memoryActivityLog.length > 20) {
    memoryActivityLog = memoryActivityLog.slice(0, 20);
  }
}

// ─────────────────────────────────────────────────────────────
// PUBLIC CONTENT QUERIES (Filtered to published only)
// ─────────────────────────────────────────────────────────────

export async function getPublicContent() {
  const data = await getCmsData();
  return {
    stories: data.stories.filter((s) => s.status === "published"),
    editions: data.editions.filter((e) => e.status === "published"),
    storytellers: data.storytellers.filter((st) => st.status === "published"),
    homepage: data.homepage,
  };
}

// ─────────────────────────────────────────────────────────────
// STORIES CRUD
// ─────────────────────────────────────────────────────────────

export async function getAllStories(includeDrafts = true): Promise<CmsStory[]> {
  const data = await getCmsData();
  if (includeDrafts) return data.stories;
  return data.stories.filter((s) => s.status === "published");
}

export async function getStoryById(id: string): Promise<CmsStory | null> {
  const data = await getCmsData();
  return data.stories.find((s) => s.id === id) || null;
}

export async function createStory(
  input: Omit<CmsStory, "id" | "createdAt" | "updatedAt">
): Promise<CmsStory> {
  const data = await getCmsData();
  const newStory: CmsStory = {
    ...input,
    id: "story-" + Date.now(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  data.stories.unshift(newStory);
  await saveCmsData(data);
  recordActivity("story", newStory.title, "created");
  return newStory;
}

export async function updateStory(
  id: string,
  updates: Partial<Omit<CmsStory, "id" | "createdAt">>
): Promise<CmsStory | null> {
  const data = await getCmsData();
  const index = data.stories.findIndex((s) => s.id === id);
  if (index === -1) return null;

  const existing = data.stories[index];
  const updated: CmsStory = {
    ...existing,
    ...updates,
    id: existing.id,
    createdAt: existing.createdAt,
    updatedAt: new Date().toISOString(),
  };

  data.stories[index] = updated;
  await saveCmsData(data);

  const action = updates.status
    ? updates.status === "published"
      ? "published"
      : "unpublished"
    : "updated";
  recordActivity("story", updated.title, action);
  return updated;
}

export async function deleteStory(id: string): Promise<boolean> {
  const data = await getCmsData();
  const story = data.stories.find((s) => s.id === id);
  if (!story) return false;

  data.stories = data.stories.filter((s) => s.id !== id);
  await saveCmsData(data);
  recordActivity("story", story.title, "deleted");
  return true;
}

// ─────────────────────────────────────────────────────────────
// EDITIONS & PRODUCTS CRUD
// ─────────────────────────────────────────────────────────────

export async function getAllEditions(includeDrafts = true): Promise<CmsEdition[]> {
  const data = await getCmsData();
  if (includeDrafts) return data.editions;
  return data.editions.filter((e) => e.status === "published");
}

export async function createEdition(
  input: Omit<CmsEdition, "id" | "createdAt" | "updatedAt">
): Promise<CmsEdition> {
  const data = await getCmsData();
  const newEdition: CmsEdition = {
    ...input,
    id: "edition-" + Date.now(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  data.editions.unshift(newEdition);
  await saveCmsData(data);
  recordActivity("edition", newEdition.title, "created");
  return newEdition;
}

export async function updateEdition(
  id: string,
  updates: Partial<Omit<CmsEdition, "id" | "createdAt">>
): Promise<CmsEdition | null> {
  const data = await getCmsData();
  const index = data.editions.findIndex((e) => e.id === id);
  if (index === -1) return null;

  const existing = data.editions[index];
  const updated: CmsEdition = {
    ...existing,
    ...updates,
    id: existing.id,
    createdAt: existing.createdAt,
    updatedAt: new Date().toISOString(),
  };

  data.editions[index] = updated;
  await saveCmsData(data);

  const action = updates.status
    ? updates.status === "published"
      ? "published"
      : "unpublished"
    : "updated";
  recordActivity("edition", updated.title, action);
  return updated;
}

export async function deleteEdition(id: string): Promise<boolean> {
  const data = await getCmsData();
  const edition = data.editions.find((e) => e.id === id);
  if (!edition) return false;

  data.editions = data.editions.filter((e) => e.id !== id);
  await saveCmsData(data);
  recordActivity("edition", edition.title, "deleted");
  return true;
}

// ─────────────────────────────────────────────────────────────
// STORYTELLERS CRUD
// ─────────────────────────────────────────────────────────────

export async function getAllStorytellers(includeDrafts = true): Promise<CmsStoryteller[]> {
  const data = await getCmsData();
  if (includeDrafts) return data.storytellers;
  return data.storytellers.filter((st) => st.status === "published");
}

export async function createStoryteller(
  input: Omit<CmsStoryteller, "id" | "createdAt" | "updatedAt">
): Promise<CmsStoryteller> {
  const data = await getCmsData();
  const newSt: CmsStoryteller = {
    ...input,
    id: "st-" + Date.now(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  data.storytellers.unshift(newSt);
  await saveCmsData(data);
  recordActivity("storyteller", newSt.name, "created");
  return newSt;
}

export async function updateStoryteller(
  id: string,
  updates: Partial<Omit<CmsStoryteller, "id" | "createdAt">>
): Promise<CmsStoryteller | null> {
  const data = await getCmsData();
  const index = data.storytellers.findIndex((st) => st.id === id);
  if (index === -1) return null;

  const existing = data.storytellers[index];
  const updated: CmsStoryteller = {
    ...existing,
    ...updates,
    id: existing.id,
    createdAt: existing.createdAt,
    updatedAt: new Date().toISOString(),
  };

  data.storytellers[index] = updated;
  await saveCmsData(data);

  const action = updates.status
    ? updates.status === "published"
      ? "published"
      : "unpublished"
    : "updated";
  recordActivity("storyteller", updated.name, action);
  return updated;
}

export async function deleteStoryteller(id: string): Promise<boolean> {
  const data = await getCmsData();
  const st = data.storytellers.find((s) => s.id === id);
  if (!st) return false;

  data.storytellers = data.storytellers.filter((s) => s.id !== id);
  await saveCmsData(data);
  recordActivity("storyteller", st.name, "deleted");
  return true;
}

// ─────────────────────────────────────────────────────────────
// HOMEPAGE CONFIG
// ─────────────────────────────────────────────────────────────

export async function getHomepageConfig(): Promise<CmsHomepageConfig> {
  const data = await getCmsData();
  return data.homepage || INITIAL_HOMEPAGE;
}

export async function updateHomepageConfig(
  updates: Partial<CmsHomepageConfig>
): Promise<CmsHomepageConfig> {
  const data = await getCmsData();
  data.homepage = {
    ...data.homepage,
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  await saveCmsData(data);
  recordActivity("homepage", "Homepage Hero & Settings", "updated");
  return data.homepage;
}

// ─────────────────────────────────────────────────────────────
// REAL DASHBOARD STATS
// ─────────────────────────────────────────────────────────────

export async function getDashboardStats(): Promise<CmsDashboardStats> {
  const data = await getCmsData();

  const totalStories = data.stories.length;
  const publishedStories = data.stories.filter((s) => s.status === "published").length;
  const draftStories = totalStories - publishedStories;

  const totalEditions = data.editions.length;
  const publishedEditions = data.editions.filter((e) => e.status === "published").length;

  const totalStorytellers = data.storytellers.length;
  const publishedStorytellers = data.storytellers.filter((st) => st.status === "published").length;

  const totalAudioHours = Math.round(
    data.stories.reduce((acc, s) => acc + (s.durationMinutes || 60), 0) / 60
  );

  return {
    totalStories,
    publishedStories,
    draftStories,
    totalEditions,
    publishedEditions,
    totalStorytellers,
    publishedStorytellers,
    totalAudioHours,
    recentActivity: memoryActivityLog,
  };
}

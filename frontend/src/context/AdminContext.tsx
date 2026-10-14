"use client";

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";
import { Story, Storyteller, STORIES, STORYTELLERS } from "@/data/storyhour-data";
import { Edition, EDITIONS } from "@/data/editions-data";
import { Order } from "@/context/LibraryCartContext";

export interface Enquiry {
  id: string;
  name: string;
  email: string;
  phone?: string;
  enquiryType: "General Enquiry" | "Publishing & Story Submission" | "Puppet Show & School Workshop" | "Licensing & Institutional Audio" | "Audiobook Feedback";
  message: string;
  receivedAt: string;
  status: "new" | "in_progress" | "resolved";
  notes?: string;
}

export interface InventoryItem {
  id: string;
  title: string;
  editionCode: string;
  bookFormat: string;
  price: number;
  stockCount: number;
  lowStockThreshold: number;
  status: "In Stock" | "Low Stock" | "Out of Stock";
}

interface AdminContextType {
  // Stories
  stories: Story[];
  addStory: (story: Omit<Story, "id">) => Story;
  updateStory: (id: string, updates: Partial<Story>) => void;
  deleteStory: (id: string) => void;
  toggleStoryFeatured: (id: string) => void;

  // Editions
  editions: Edition[];
  addEdition: (edition: Omit<Edition, "id">) => Edition;
  updateEdition: (id: string, updates: Partial<Edition>) => void;
  deleteEdition: (id: string) => void;

  // Storytellers
  storytellers: Storyteller[];
  addStoryteller: (storyteller: Omit<Storyteller, "id">) => Storyteller;
  updateStoryteller: (id: string, updates: Partial<Storyteller>) => void;
  deleteStoryteller: (id: string) => void;

  // Orders
  orders: Order[];
  updateOrderStatus: (orderId: string, status: string) => void;
  addMockOrder: (order: Partial<Order>) => void;

  // Enquiries
  enquiries: Enquiry[];
  updateEnquiryStatus: (id: string, status: "new" | "in_progress" | "resolved") => void;
  addEnquiryNote: (id: string, note: string) => void;
  deleteEnquiry: (id: string) => void;

  // Metrics
  stats: {
    totalRevenue: number;
    totalOrders: number;
    pendingOrdersCount: number;
    publishedStoriesCount: number;
    totalEnquiries: number;
    newEnquiriesCount: number;
    totalListensHours: number;
    lowStockCount: number;
  };

  // Reset demo data
  resetToDefaults: () => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

// Initial Seed Orders for authentic StoryHour e-commerce demonstration
const SEED_ORDERS: Order[] = [
  {
    orderId: "ord_sh_9812",
    orderNumber: "SH-2026-9812",
    customer: {
      fullName: "Ananya Deshmukh",
      email: "ananya.d@gmail.com",
      phone: "+44 7700 900142",
    },
    billing: {
      address: "14 Kensington Church Street",
      city: "London",
      state: "Greater London",
      country: "United Kingdom",
      postalCode: "W8 4EP",
    },
    items: [
      {
        id: "edition-1",
        title: "Ramayana — Signature Hardcover Collector Edition",
        format: "Hardcover (Clothbound Foil)",
        price: 34.99,
        quantity: 1,
        coverImage: "https://storyhour.co.uk/wp-content/uploads/2026/01/WhatsApp-Image-2026-01-19-at-17.28.53.jpeg",
        type: "book",
      },
      {
        id: "ab-1",
        title: "Ramayana Signature Audiobook (40 Chapters)",
        format: "Digital Audiobook (Dolby Atmos)",
        price: 19.99,
        quantity: 1,
        coverImage: "https://storyhour.co.uk/wp-content/uploads/2026/01/WhatsApp-Image-2026-01-19-at-17.28.53.jpeg",
        type: "audiobook",
      },
    ],
    subtotal: 54.98,
    tax: 0.0,
    total: 54.98,
    status: "Completed",
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    paymentMethod: "Stripe Card (•• 4242)",
  },
  {
    orderId: "ord_sh_9811",
    orderNumber: "SH-2026-9811",
    customer: {
      fullName: "Rohan & Priya Mehra",
      email: "priya.mehra@outlook.com",
      phone: "+44 7911 123456",
    },
    billing: {
      address: "8 Richmond Green",
      city: "Richmond",
      state: "Surrey",
      country: "United Kingdom",
      postalCode: "TW9 1LX",
    },
    items: [
      {
        id: "edition-2",
        title: "Mahabharata — The Grand Kurukshetra Saga",
        format: "Deluxe Illustrated Box Set",
        price: 45.0,
        quantity: 1,
        coverImage: "https://storyhour.co.uk/wp-content/uploads/2026/01/WhatsApp-Image-2026-01-19-at-17.30.26.jpeg",
        type: "book",
      },
    ],
    subtotal: 45.0,
    tax: 0.0,
    total: 45.0,
    status: "Confirmed (Test Mode)",
    createdAt: new Date(Date.now() - 3600000 * 18).toISOString(),
    paymentMethod: "Apple Pay",
  },
  {
    orderId: "ord_sh_9810",
    orderNumber: "SH-2026-9810",
    customer: {
      fullName: "Dr. Vikram Patel",
      email: "v.patel@oxford-heritage.org",
      phone: "+44 7822 554109",
    },
    billing: {
      address: "22 North Parade",
      city: "Oxford",
      state: "Oxfordshire",
      country: "United Kingdom",
      postalCode: "OX2 6LX",
    },
    items: [
      {
        id: "edition-3",
        title: "Panchatantra — Animal Fables of Wit & Wisdom",
        format: "Hardcover Children Edition",
        price: 24.5,
        quantity: 2,
        coverImage: "https://storyhour.co.uk/wp-content/uploads/2026/01/WhatsApp-Image-2026-01-19-at-17.28.56.jpeg",
        type: "book",
      },
    ],
    subtotal: 49.0,
    tax: 0.0,
    total: 49.0,
    status: "Completed",
    createdAt: new Date(Date.now() - 3600000 * 42).toISOString(),
    paymentMethod: "Google Pay",
  },
];

// Initial Seed Inquiries from authentic reader / institutional submissions
const SEED_ENQUIRIES: Enquiry[] = [
  {
    id: "enq_1",
    name: "Meera Krishnamurthy",
    email: "meera.k@stmarys-primary.sch.uk",
    phone: "+44 20 7946 0912",
    enquiryType: "Puppet Show & School Workshop",
    message: "Hello StoryHour Team, We would love to host your live shadow puppet storytelling workshop on Indian epics for our Year 4 students during Diwali week. Could you share available dates and pricing for London primary schools?",
    receivedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    status: "new",
  },
  {
    id: "enq_2",
    name: "Aarav Sharma",
    email: "aarav.author@gmail.com",
    phone: "+44 7712 345678",
    enquiryType: "Publishing & Story Submission",
    message: "I have translated and curated 12 forgotten folk tales from the Western Ghats with original folklore songs. I'd love to explore whether StoryHour would consider an audio dramatization with classical instruments.",
    receivedAt: new Date(Date.now() - 3600000 * 14).toISOString(),
    status: "in_progress",
    notes: "Editorial team reviewed sample chapter 1. Requested sample audio recording.",
  },
  {
    id: "enq_3",
    name: "Sunita Rao",
    email: "s.rao@readinglibrary.gov.uk",
    enquiryType: "Licensing & Institutional Audio",
    message: "Inquiring about institutional audio licensing for Reading Borough Council libraries. We want to make your multilingual Telugu and Hindi storybooks accessible to community branches.",
    receivedAt: new Date(Date.now() - 3600000 * 36).toISOString(),
    status: "resolved",
    notes: "Sent digital institutional license pack tier 2.",
  },
  {
    id: "enq_4",
    name: "Devendra Joshi",
    email: "d.joshi@bedtimestories.co",
    enquiryType: "Audiobook Feedback",
    message: "The sound engineering on the Ramayana English audiobook is phenomenal! My 7-year-old listens every night before bed. Are you planning a release for the story of Abhimanyu soon?",
    receivedAt: new Date(Date.now() - 3600000 * 72).toISOString(),
    status: "resolved",
    notes: "Replied thanking him and noted Abhimanyu release slated for Q3.",
  },
];

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mounted, setMounted] = useState(false);
  const [stories, setStories] = useState<Story[]>(STORIES);
  const [editions, setEditions] = useState<Edition[]>(EDITIONS);
  const [storytellers, setStorytellers] = useState<Storyteller[]>(STORYTELLERS);
  const [orders, setOrders] = useState<Order[]>(SEED_ORDERS);
  const [enquiries, setEnquiries] = useState<Enquiry[]>(SEED_ENQUIRIES);

  // Initialize from LocalStorage
  useEffect(() => {
    try {
      const storedStories = localStorage.getItem("storyhour_admin_stories");
      if (storedStories) setStories(JSON.parse(storedStories));

      const storedEditions = localStorage.getItem("storyhour_admin_editions");
      if (storedEditions) setEditions(JSON.parse(storedEditions));

      const storedStorytellers = localStorage.getItem("storyhour_admin_storytellers");
      if (storedStorytellers) setStorytellers(JSON.parse(storedStorytellers));

      const storedOrders = localStorage.getItem("storyhour_orders");
      if (storedOrders) {
        const parsed: Order[] = JSON.parse(storedOrders);
        if (parsed.length > 0) {
          // Merge unique orders
          const existingIds = new Set(parsed.map((o) => o.orderId));
          const merged = [...parsed, ...SEED_ORDERS.filter((s) => !existingIds.has(s.orderId))];
          setOrders(merged);
        }
      }

      const storedEnquiries = localStorage.getItem("storyhour_admin_enquiries");
      if (storedEnquiries) setEnquiries(JSON.parse(storedEnquiries));
    } catch (e) {
      console.warn("[AdminContext] Error loading localStorage state:", e);
    } finally {
      setMounted(true);
    }
  }, []);

  // Sync to LocalStorage
  useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem("storyhour_admin_stories", JSON.stringify(stories));
    } catch {}
  }, [stories, mounted]);

  useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem("storyhour_admin_editions", JSON.stringify(editions));
    } catch {}
  }, [editions, mounted]);

  useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem("storyhour_admin_storytellers", JSON.stringify(storytellers));
    } catch {}
  }, [storytellers, mounted]);

  useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem("storyhour_admin_enquiries", JSON.stringify(enquiries));
    } catch {}
  }, [enquiries, mounted]);

  // Story CRUD
  const addStory = useCallback((storyData: Omit<Story, "id">): Story => {
    const newStory: Story = {
      ...storyData,
      id: "story-" + Date.now(),
    };
    setStories((prev) => [newStory, ...prev]);
    return newStory;
  }, []);

  const updateStory = useCallback((id: string, updates: Partial<Story>) => {
    setStories((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
  }, []);

  const deleteStory = useCallback((id: string) => {
    setStories((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const toggleStoryFeatured = useCallback((id: string) => {
    setStories((prev) => prev.map((s) => (s.id === id ? { ...s, featured: !s.featured } : s)));
  }, []);

  // Editions CRUD
  const addEdition = useCallback((editionData: Omit<Edition, "id">): Edition => {
    const newEdition: Edition = {
      ...editionData,
      id: "edition-" + Date.now(),
    };
    setEditions((prev) => [newEdition, ...prev]);
    return newEdition;
  }, []);

  const updateEdition = useCallback((id: string, updates: Partial<Edition>) => {
    setEditions((prev) => prev.map((e) => (e.id === id ? { ...e, ...updates } : e)));
  }, []);

  const deleteEdition = useCallback((id: string) => {
    setEditions((prev) => prev.filter((e) => e.id !== id));
  }, []);

  // Storytellers CRUD
  const addStoryteller = useCallback((stData: Omit<Storyteller, "id">): Storyteller => {
    const newSt: Storyteller = {
      ...stData,
      id: "storyteller-" + Date.now(),
    };
    setStorytellers((prev) => [newSt, ...prev]);
    return newSt;
  }, []);

  const updateStoryteller = useCallback((id: string, updates: Partial<Storyteller>) => {
    setStorytellers((prev) => prev.map((st) => (st.id === id ? { ...st, ...updates } : st)));
  }, []);

  const deleteStoryteller = useCallback((id: string) => {
    setStorytellers((prev) => prev.filter((st) => st.id !== id));
  }, []);

  // Orders
  const updateOrderStatus = useCallback((orderId: string, status: string) => {
    setOrders((prev) => {
      const updated = prev.map((o) => (o.orderId === orderId ? { ...o, status: status as any } : o));
      try {
        localStorage.setItem("storyhour_orders", JSON.stringify(updated));
      } catch {}
      return updated;
    });
  }, []);

  const addMockOrder = useCallback((orderPartial: Partial<Order>) => {
    const newOrder: Order = {
      orderId: "ord_sh_" + Math.floor(1000 + Math.random() * 9000),
      orderNumber: "SH-2026-" + Math.floor(1000 + Math.random() * 9000),
      customer: orderPartial.customer || {
        fullName: "Guest Reader",
        email: "reader@storyhour.co.uk",
        phone: "+44 7911 000000",
      },
      billing: orderPartial.billing || {
        address: "10 Downing Mews",
        city: "London",
        state: "London",
        country: "United Kingdom",
        postalCode: "SW1A 2AA",
      },
      items: orderPartial.items || [],
      subtotal: orderPartial.subtotal || 29.99,
      tax: 0,
      total: orderPartial.total || 29.99,
      status: "Confirmed (Test Mode)",
      createdAt: new Date().toISOString(),
      paymentMethod: orderPartial.paymentMethod || "Credit Card",
    };
    setOrders((prev) => [newOrder, ...prev]);
  }, []);

  // Enquiries
  const updateEnquiryStatus = useCallback((id: string, status: "new" | "in_progress" | "resolved") => {
    setEnquiries((prev) => prev.map((e) => (e.id === id ? { ...e, status } : e)));
  }, []);

  const addEnquiryNote = useCallback((id: string, note: string) => {
    setEnquiries((prev) => prev.map((e) => (e.id === id ? { ...e, notes: note } : e)));
  }, []);

  const deleteEnquiry = useCallback((id: string) => {
    setEnquiries((prev) => prev.filter((e) => e.id !== id));
  }, []);

  // Metrics
  const stats = useMemo(() => {
    const totalRevenue = orders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
    const totalOrders = orders.length;
    const pendingOrdersCount = orders.filter((o) => o.status !== "Completed").length;
    const publishedStoriesCount = stories.length;
    const totalEnquiries = enquiries.length;
    const newEnquiriesCount = enquiries.filter((e) => e.status === "new").length;
    const totalListensHours = stories.reduce((sum, s) => sum + (s.durationMinutes || 60), 0) * 3.8;
    const lowStockCount = editions.filter((e) => (e.pagesCount || 100) > 400).length;

    return {
      totalRevenue,
      totalOrders,
      pendingOrdersCount,
      publishedStoriesCount,
      totalEnquiries,
      newEnquiriesCount,
      totalListensHours: Math.round(totalListensHours),
      lowStockCount: 3, // Ramayana Hardcover, Mahabharata Box Set, Krishna Folio
    };
  }, [orders, stories, enquiries, editions]);

  const resetToDefaults = useCallback(() => {
    setStories(STORIES);
    setEditions(EDITIONS);
    setStorytellers(STORYTELLERS);
    setOrders(SEED_ORDERS);
    setEnquiries(SEED_ENQUIRIES);
    localStorage.removeItem("storyhour_admin_stories");
    localStorage.removeItem("storyhour_admin_editions");
    localStorage.removeItem("storyhour_admin_storytellers");
    localStorage.removeItem("storyhour_admin_enquiries");
  }, []);

  return (
    <AdminContext.Provider
      value={{
        stories,
        addStory,
        updateStory,
        deleteStory,
        toggleStoryFeatured,
        editions,
        addEdition,
        updateEdition,
        deleteEdition,
        storytellers,
        addStoryteller,
        updateStoryteller,
        deleteStoryteller,
        orders,
        updateOrderStatus,
        addMockOrder,
        enquiries,
        updateEnquiryStatus,
        addEnquiryNote,
        deleteEnquiry,
        stats,
        resetToDefaults,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const ctx = useContext(AdminContext);
  if (!ctx) {
    throw new Error("useAdmin must be used within an AdminProvider");
  }
  return ctx;
};

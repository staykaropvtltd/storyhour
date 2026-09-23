/**
 * StoryHour Centralized API Client
 * Seamlessly bridges the Next.js frontend with the FastAPI backend.
 */

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001";

class ApiError extends Error {
  statusCode: number;
  data?: any;

  constructor(message: string, statusCode: number, data?: any) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.data = data;
  }
}

/**
 * Standard fetch wrapper with error handling and optional auth token injection.
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...((options.headers as Record<string, string>) || {}),
  };

  // Inject Bearer token if stored in browser
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("storyhour_access_token");
    if (token && !headers["Authorization"]) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const contentType = response.headers.get("content-type");
  let data: any = null;

  if (contentType && contentType.includes("application/json")) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    const errorMessage =
      (typeof data === "object" && data?.detail) ||
      (typeof data === "object" && data?.message) ||
      `Request failed with status ${response.status}`;
    throw new ApiError(errorMessage, response.status, data);
  }

  return data as T;
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. Contact API
// ─────────────────────────────────────────────────────────────────────────────

export interface ContactSubmissionPayload {
  name: string;
  email: string;
  phone?: string;
  enquiryType: string;
  message: string;
}

export interface ContactSubmissionResponse {
  id: string;
  name: string;
  email: string;
  phone?: string;
  enquiry_type: string;
  message: string;
  status: string;
  created_at: string;
  confirmation: string;
}

export async function submitContactEnquiry(
  payload: ContactSubmissionPayload
): Promise<ContactSubmissionResponse> {
  return apiRequest<ContactSubmissionResponse>("/api/v1/contact", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. Stories & Content API
// ─────────────────────────────────────────────────────────────────────────────

export interface BackendStory {
  id: string;
  title: string;
  slug: string;
  short_description?: string;
  long_description?: string;
  cover_image?: string;
  hero_media?: string;
  status: string;
  themes?: string[];
  narrator?: string;
  duration?: number;
  age_group?: string;
  cultural_context?: string;
  featured?: boolean;
  categories?: { id: string; name: string; slug: string }[];
  languages?: { id: string; name: string; code: string }[];
  created_at: string;
}

export async function fetchStories(): Promise<BackendStory[]> {
  return apiRequest<BackendStory[]>("/api/v1/stories");
}

export async function fetchStoryByIdOrSlug(idOrSlug: string): Promise<BackendStory> {
  return apiRequest<BackendStory>(`/api/v1/stories/${idOrSlug}`);
}

export async function fetchCategories(): Promise<{ id: string; name: string; slug: string }[]> {
  return apiRequest<{ id: string; name: string; slug: string }[]>("/api/v1/categories");
}

export async function fetchLanguages(): Promise<{ id: string; name: string; code: string }[]> {
  return apiRequest<{ id: string; name: string; code: string }[]>("/api/v1/languages");
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. Events API
// ─────────────────────────────────────────────────────────────────────────────

export interface BackendEvent {
  id: string;
  title: string;
  slug: string;
  short_description?: string;
  description?: string;
  hero_media?: string;
  event_type: string;
  status: string;
  start_date: string;
  end_date?: string;
  time_display?: string;
  location?: string;
  venue_details?: string;
  is_online: boolean;
  featured: boolean;
  storyteller_name?: string;
  registration_url?: string;
  ticket_info?: string;
  capacity?: number;
}

export async function fetchEvents(): Promise<BackendEvent[]> {
  return apiRequest<BackendEvent[]>("/api/v1/events");
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. Journal API
// ─────────────────────────────────────────────────────────────────────────────

export interface BackendJournalArticle {
  id: string;
  title: string;
  slug: string;
  short_description?: string;
  content?: string;
  hero_image?: string;
  author_name: string;
  author_bio?: string;
  category?: string;
  tags?: string[];
  status: string;
  reading_time_minutes?: number;
  featured: boolean;
  publication_date?: string;
}

export async function fetchJournalArticles(): Promise<BackendJournalArticle[]> {
  return apiRequest<BackendJournalArticle[]>("/api/v1/journal");
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. Products, Cart & Orders API
// ─────────────────────────────────────────────────────────────────────────────

export interface BackendProduct {
  id: string;
  slug: string;
  title: string;
  description?: string;
  price: number;
  currency: string;
  is_active: boolean;
  inventory: number;
  metadata_fields?: Record<string, any>;
  images?: { id: string; image_url: string; is_primary: boolean }[];
}

export async function fetchProducts(): Promise<BackendProduct[]> {
  return apiRequest<BackendProduct[]>("/api/v1/products");
}

export interface CreateOrderPayload {
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  billing_address?: string;
  items: {
    product_id: string;
    quantity: number;
    unit_price: number;
  }[];
  notes?: string;
}

export async function createBackendOrder(payload: CreateOrderPayload): Promise<any> {
  return apiRequest<any>("/api/v1/orders", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. Authentication API
// ─────────────────────────────────────────────────────────────────────────────

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: {
    id: string;
    email: string;
    full_name?: string;
    avatar_url?: string;
  };
}

export async function signupUser(data: {
  email: string;
  password: string;
  full_name: string;
  phone?: string;
}): Promise<AuthResponse> {
  return apiRequest<AuthResponse>("/api/auth/signup", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function loginUser(data: {
  email: string;
  password: string;
}): Promise<AuthResponse> {
  return apiRequest<AuthResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function fetchCurrentUser(): Promise<any> {
  return apiRequest<any>("/api/me");
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. Health & Connectivity Check
// ─────────────────────────────────────────────────────────────────────────────

export async function checkBackendHealth(): Promise<{ status: string; service?: string }> {
  try {
    return await apiRequest<{ status: string; service?: string }>("/api/health");
  } catch {
    return { status: "offline" };
  }
}

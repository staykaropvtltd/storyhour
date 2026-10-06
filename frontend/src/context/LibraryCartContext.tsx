"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { Product } from "@/data/storyhour-data";
import { getEditionById } from "@/data/editions-data";

export interface CartItem {
  id: string;
  title: string;
  nativeTitle?: string;
  subtitle?: string;
  authorOrNarrator: string;
  coverImage: string;
  price: number;
  currency?: string;
  format: string;
  language: string;
  type: "book" | "audiobook";
  quantity: number;
  product: {
    id: string;
    title: string;
    coverImage: string;
    price: number;
    currency: string;
    format: string;
    language: string;
  };
}

export interface CustomerDetails {
  fullName: string;
  email: string;
  phone: string;
}

export interface BillingDetails {
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
}

export interface OrderItem {
  id: string;
  title: string;
  format: string;
  price: number;
  quantity: number;
  coverImage: string;
  type: "book" | "audiobook";
}

export interface Order {
  orderId: string;
  orderNumber: string;
  customer: CustomerDetails;
  billing: BillingDetails;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: "Confirmed (Test Mode)" | "Completed";
  createdAt: string;
  paymentMethod: string;
}

export interface AddToCartInput {
  id: string;
  title: string;
  nativeTitle?: string;
  subtitle?: string;
  authorOrNarrator?: string;
  coverImage: string;
  price: number;
  currency?: string;
  format?: string;
  language?: string;
  type?: "book" | "audiobook";
  slug?: string;
  description?: string;
  chaptersCount?: number;
}

interface LibraryCartContextType {
  savedStoryIds: string[];
  toggleSaveStory: (storyId: string) => boolean;
  isStorySaved: (storyId: string) => boolean;
  cartItems: CartItem[];
  addToCart: (item: AddToCartInput | Product, quantity?: number) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  removeFromCart: (itemId: string) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;
  unlockedBookIds: string[];
  unlockBooks: (bookIds: string[]) => void;
  isBookUnlocked: (bookId: string) => boolean;
  orders: Order[];
  createOrder: (orderData: {
    customer: CustomerDetails;
    billing: BillingDetails;
    items: OrderItem[];
    subtotal: number;
    tax: number;
    total: number;
    paymentMethod?: string;
  }) => Order;
  getOrderById: (orderIdOrNumber: string) => Order | undefined;
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  isCartDrawerOpen: boolean;
  setIsCartDrawerOpen: (open: boolean) => void;
  toastMessage: string | null;
  showToast: (msg: string) => void;
}

const LibraryCartContext = createContext<LibraryCartContextType | undefined>(undefined);

const CART_STORAGE_KEY = "storyhour_cart_items_v2";
const UNLOCKED_STORAGE_KEY = "storyhour_unlocked_books_v2";
const ORDERS_STORAGE_KEY = "storyhour_orders_v2";
const SAVED_STORIES_KEY = "storyhour_saved_stories_v2";

export function LibraryCartProvider({ children }: { children: React.ReactNode }) {
  // Saved story ids initializes cleanly as empty array (fixes C-08)
  const [savedStoryIds, setSavedStoryIds] = useState<string[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [unlockedBookIds, setUnlockedBookIds] = useState<string[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  const toastTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Hydrate state from localStorage safely after mount
  useEffect(() => {
    try {
      const storedCart = localStorage.getItem(CART_STORAGE_KEY);
      if (storedCart) {
        const parsed = JSON.parse(storedCart);
        if (Array.isArray(parsed)) {
          const normalized: CartItem[] = parsed
            .filter((item) => item && typeof item === "object")
            .map((item: any) => {
              const prod = item.product || {};
              const id = item.id || prod.id || "edition-1";
              const title = item.title || prod.title || "StoryHour Edition";
              const coverImage = item.coverImage || prod.coverImage || "/images/covers/cover-ramayana.png";
              const price = typeof item.price === "number" ? item.price : (typeof prod.price === "number" ? prod.price : 18.5);
              const format = item.format || prod.format || "Digital Collector Edition";
              const language = item.language || prod.language || "English";
              const isDigital = item.type === "book" || item.type === "audiobook" || !format.toLowerCase().includes("physical");
              // Cap digital items at quantity 1
              const quantity = isDigital ? 1 : Math.min(Math.max(1, Number(item.quantity) || 1), 5);
              const type = item.type || (id.startsWith("ab-") ? "audiobook" : "book");
              const authorOrNarrator = item.authorOrNarrator || "StoryHour Ensemble";
              return {
                id,
                title,
                nativeTitle: item.nativeTitle,
                subtitle: item.subtitle,
                authorOrNarrator,
                coverImage,
                price,
                currency: item.currency || prod.currency || "$",
                format,
                language,
                type,
                quantity,
                product: {
                  id,
                  title,
                  coverImage,
                  price,
                  currency: item.currency || prod.currency || "$",
                  format,
                  language,
                },
              };
            });
          setCartItems(normalized);
        }
      }

      const storedUnlocked = localStorage.getItem(UNLOCKED_STORAGE_KEY);
      if (storedUnlocked) {
        const parsed = JSON.parse(storedUnlocked);
        if (Array.isArray(parsed)) {
          setUnlockedBookIds(parsed.filter((id) => typeof id === "string"));
        }
      }

      const storedOrders = localStorage.getItem(ORDERS_STORAGE_KEY);
      if (storedOrders) {
        const parsedOrders = JSON.parse(storedOrders);
        if (Array.isArray(parsedOrders)) {
          const normalizedOrders: Order[] = parsedOrders.map((o: any) => ({
            ...o,
            total: typeof o.total === "number" ? o.total : (o.subtotal || 18.5),
            subtotal: typeof o.subtotal === "number" ? o.subtotal : (o.total || 18.5),
            tax: typeof o.tax === "number" ? o.tax : 0,
            items: Array.isArray(o.items)
              ? o.items.map((it: any) => ({
                  ...it,
                  coverImage: it.coverImage || "/images/covers/cover-ramayana.png",
                  title: it.title || "StoryHour Edition",
                }))
              : [],
          }));
          setOrders(normalizedOrders);
        }
      }

      const storedSaved = localStorage.getItem(SAVED_STORIES_KEY);
      if (storedSaved) {
        const parsedSaved = JSON.parse(storedSaved);
        if (Array.isArray(parsedSaved)) {
          setSavedStoryIds(parsedSaved.filter((id) => typeof id === "string"));
        }
      }
    } catch (e) {
      console.warn("Failed to load StoryHour cart state from localStorage", e);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  // Cross-tab storage synchronization (fixes C-08)
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (!e.key || !e.newValue) return;
      try {
        if (e.key === CART_STORAGE_KEY) {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) setCartItems(parsed);
        } else if (e.key === UNLOCKED_STORAGE_KEY) {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) setUnlockedBookIds(parsed);
        } else if (e.key === ORDERS_STORAGE_KEY) {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) setOrders(parsed);
        } else if (e.key === SAVED_STORIES_KEY) {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) setSavedStoryIds(parsed);
        }
      } catch (err) {
        console.warn("Cross-tab storage parse error", err);
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  // Sync state to localStorage on updates after hydration
  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
    } catch (e) {
      console.error("Failed to save cart to localStorage", e);
    }
  }, [cartItems, isHydrated]);

  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem(UNLOCKED_STORAGE_KEY, JSON.stringify(unlockedBookIds));
    } catch (e) {
      console.error("Failed to save unlocked books to localStorage", e);
    }
  }, [unlockedBookIds, isHydrated]);

  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
    } catch (e) {
      console.error("Failed to save orders to localStorage", e);
    }
  }, [orders, isHydrated]);

  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem(SAVED_STORIES_KEY, JSON.stringify(savedStoryIds));
    } catch (e) {
      console.error("Failed to save saved stories to localStorage", e);
    }
  }, [savedStoryIds, isHydrated]);

  // Robust toast manager that resets pending timer on new toast (fixes C-08)
  const showToast = useCallback((msg: string) => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }
    setToastMessage(msg);
    toastTimerRef.current = setTimeout(() => {
      setToastMessage(null);
      toastTimerRef.current = null;
    }, 3200);
  }, []);

  // Cleanup toast timer on unmount
  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  // Pure toggleSaveStory: side-effect outside updater, accurate return value (fixes C-08)
  const toggleSaveStory = (storyId: string): boolean => {
    const isCurrentlySaved = savedStoryIds.includes(storyId);
    const nextSaved = !isCurrentlySaved;

    if (nextSaved) {
      setSavedStoryIds((prev) => Array.from(new Set([...prev, storyId])));
      showToast("Story saved to your family library");
    } else {
      setSavedStoryIds((prev) => prev.filter((id) => id !== storyId));
      showToast("Story removed from your saved library");
    }
    return nextSaved;
  };

  const isStorySaved = (storyId: string) => savedStoryIds.includes(storyId);

  const addToCart = (item: AddToCartInput | Product, quantity: number = 1) => {
    const id = item.id;
    const title = item.title;
    const price = item.price;
    const coverImage = item.coverImage;
    const currency = item.currency || "$";
    const format = item.format || "Hardcover Edition";
    const language = item.language || "English";
    const type: "book" | "audiobook" = (item as AddToCartInput).type || (id.startsWith("ab-") ? "audiobook" : "book");
    const authorOrNarrator = (item as AddToCartInput).authorOrNarrator || "StoryHour Ensemble";
    const nativeTitle = item.nativeTitle;
    const subtitle = (item as AddToCartInput).subtitle;

    // Check if canonical edition maps to existing cart item (canonical ID resolution)
    const edition = getEditionById(id);
    const canonicalId = edition ? edition.id : id;

    // Digital item limit rule (fixes FT-14 / C-08): digital editions are capped at quantity 1
    const isDigital = type === "book" || type === "audiobook" || !format.toLowerCase().includes("physical");

    const existingItem = cartItems.find(
      (ci) => ci.id === canonicalId || ci.id === id || (edition && ci.id === edition.productId)
    );

    if (existingItem) {
      if (isDigital) {
        showToast(`"${title}" is already in your cart (digital edition limit: 1)`);
        return;
      }
      setCartItems((prev) =>
        prev.map((ci) => {
          if (ci.id === existingItem.id) {
            const nextQty = Math.min(ci.quantity + quantity, 5);
            return { ...ci, quantity: nextQty };
          }
          return ci;
        })
      );
      showToast(`Updated "${title}" quantity in your cart`);
      return;
    }

    const newItem: CartItem = {
      id: canonicalId,
      title,
      nativeTitle,
      subtitle,
      authorOrNarrator,
      coverImage,
      price,
      currency,
      format,
      language,
      type,
      quantity: isDigital ? 1 : Math.min(Math.max(1, quantity), 5),
      product: {
        id: canonicalId,
        title,
        coverImage,
        price,
        currency,
        format,
        language,
      },
    };

    setCartItems((prev) => [...prev, newItem]);
    showToast(`Added "${title}" to your cart`);
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }

    setCartItems((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          const isDigital = item.type === "book" || item.type === "audiobook" || !item.format.toLowerCase().includes("physical");
          const cappedQuantity = isDigital ? 1 : Math.min(quantity, 5);
          return { ...item, quantity: cappedQuantity };
        }
        return item;
      })
    );
  };

  const removeFromCart = (itemId: string) => {
    const target = cartItems.find((item) => item.id === itemId);
    if (target) {
      showToast(`Removed "${target.title}" from cart`);
    }
    setCartItems((prev) => prev.filter((item) => item.id !== itemId));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const cartTotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const unlockBooks = (bookIds: string[]) => {
    const resolvedIds: string[] = [];
    bookIds.forEach((id) => {
      resolvedIds.push(id);
      const edition = getEditionById(id);
      if (edition) {
        resolvedIds.push(edition.id);
        if (edition.productId) resolvedIds.push(edition.productId);
      }
    });

    setUnlockedBookIds((prev) => {
      return Array.from(new Set([...prev, ...resolvedIds]));
    });
  };

  const isBookUnlocked = useCallback(
    (bookId: string) => {
      if (!bookId) return false;
      if (unlockedBookIds.includes(bookId)) return true;
      const edition = getEditionById(bookId);
      if (edition) {
        if (unlockedBookIds.includes(edition.id)) return true;
        if (edition.productId && unlockedBookIds.includes(edition.productId)) return true;
      }
      return false;
    },
    [unlockedBookIds]
  );

  const createOrder = (orderData: {
    customer: CustomerDetails;
    billing: BillingDetails;
    items: OrderItem[];
    subtotal: number;
    tax: number;
    total: number;
    paymentMethod?: string;
  }): Order => {
    const timestamp = Date.now();
    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    const orderNumber = `SH-2026-${randomSuffix}`;
    const orderId = `order_${timestamp}_${Math.random().toString(36).substring(2, 8)}`;

    const newOrder: Order = {
      orderId,
      orderNumber,
      customer: orderData.customer,
      billing: orderData.billing,
      items: orderData.items,
      subtotal: orderData.subtotal,
      tax: orderData.tax,
      total: orderData.total,
      status: "Confirmed (Test Mode)",
      createdAt: new Date().toISOString(),
      paymentMethod: orderData.paymentMethod || "Safe Test Payment (Sandbox)",
    };

    setOrders((prev) => [newOrder, ...prev]);

    // Unlock purchased book IDs immediately, ensuring both canonical ID and product ID unlock
    const bookIdsToUnlock = orderData.items.map((it) => it.id);
    unlockBooks(bookIdsToUnlock);

    // Empty cart
    clearCart();

    return newOrder;
  };

  const getOrderById = (orderIdOrNumber: string): Order | undefined => {
    if (!orderIdOrNumber) return undefined;
    return orders.find(
      (o) => o.orderId === orderIdOrNumber || o.orderNumber === orderIdOrNumber
    );
  };

  // Keyboard shortcut for search - safely ignores editable elements (fixes C-08)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement as HTMLElement | null;
      const isEditable =
        activeEl &&
        (activeEl.tagName === "INPUT" ||
          activeEl.tagName === "TEXTAREA" ||
          activeEl.tagName === "SELECT" ||
          activeEl.isContentEditable);

      if ((e.key === "/" || ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k")) && !isEditable) {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }

      if (e.key === "Escape") {
        if (isSearchOpen) {
          setIsSearchOpen(false);
        } else if (isCartDrawerOpen) {
          setIsCartDrawerOpen(false);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isSearchOpen, isCartDrawerOpen]);

  return (
    <LibraryCartContext.Provider
      value={{
        savedStoryIds,
        toggleSaveStory,
        isStorySaved,
        cartItems,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        cartCount,
        cartTotal,
        unlockedBookIds,
        unlockBooks,
        isBookUnlocked,
        orders,
        createOrder,
        getOrderById,
        isSearchOpen,
        setIsSearchOpen,
        isCartDrawerOpen,
        setIsCartDrawerOpen,
        toastMessage,
        showToast,
      }}
    >
      {children}
    </LibraryCartContext.Provider>
  );
}

export function useLibraryCart() {
  const context = useContext(LibraryCartContext);
  if (!context) {
    throw new Error("useLibraryCart must be used within a LibraryCartProvider");
  }
  return context;
}

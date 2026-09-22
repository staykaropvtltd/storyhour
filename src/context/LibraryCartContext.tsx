"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { Product } from "@/data/storyhour-data";

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
  const [savedStoryIds, setSavedStoryIds] = useState<string[]>(["story-1"]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [unlockedBookIds, setUnlockedBookIds] = useState<string[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  // Hydrate state from localStorage safely after mount
  useEffect(() => {
    try {
      const storedCart = localStorage.getItem(CART_STORAGE_KEY);
      if (storedCart) {
        setCartItems(JSON.parse(storedCart));
      }

      const storedUnlocked = localStorage.getItem(UNLOCKED_STORAGE_KEY);
      if (storedUnlocked) {
        setUnlockedBookIds(JSON.parse(storedUnlocked));
      }

      const storedOrders = localStorage.getItem(ORDERS_STORAGE_KEY);
      if (storedOrders) {
        setOrders(JSON.parse(storedOrders));
      }

      const storedSaved = localStorage.getItem(SAVED_STORIES_KEY);
      if (storedSaved) {
        setSavedStoryIds(JSON.parse(storedSaved));
      }
    } catch (e) {
      console.error("Failed to load StoryHour cart state from localStorage", e);
    } finally {
      setIsHydrated(true);
    }
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

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  }, []);

  const toggleSaveStory = (storyId: string): boolean => {
    let nowSaved = false;
    setSavedStoryIds((prev) => {
      if (prev.includes(storyId)) {
        nowSaved = false;
        showToast("Story removed from your saved library");
        return prev.filter((id) => id !== storyId);
      } else {
        nowSaved = true;
        showToast("Story saved to your family library");
        return [...prev, storyId];
      }
    });
    return nowSaved;
  };

  const isStorySaved = (storyId: string) => savedStoryIds.includes(storyId);

  const addToCart = (item: AddToCartInput | Product, quantity: number = 1) => {
    const isProduct = "currency" in item && !("type" in item);
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

    setCartItems((prev) => {
      const existingIndex = prev.findIndex((ci) => ci.id === id);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + quantity,
        };
        return updated;
      }

      const newItem: CartItem = {
        id,
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
        quantity,
        product: {
          id,
          title,
          coverImage,
          price,
          currency,
          format,
          language,
        },
      };
      return [...prev, newItem];
    });

    showToast(`Added "${title}" to your cart`);
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, quantity } : item))
    );
  };

  const removeFromCart = (itemId: string) => {
    setCartItems((prev) => {
      const target = prev.find((item) => item.id === itemId);
      if (target) {
        showToast(`Removed "${target.title}" from cart`);
      }
      return prev.filter((item) => item.id !== itemId);
    });
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const cartTotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const unlockBooks = (bookIds: string[]) => {
    setUnlockedBookIds((prev) => {
      const updated = Array.from(new Set([...prev, ...bookIds]));
      return updated;
    });
  };

  const isBookUnlocked = useCallback(
    (bookId: string) => {
      return unlockedBookIds.includes(bookId);
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
    const orderNumber = `SH-2026-${Math.floor(10000 + Math.random() * 90000)}`;
    const orderId = `order_${timestamp}_${Math.random().toString(36).substring(2, 7)}`;

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

    // Unlock purchased book IDs immediately
    const bookIdsToUnlock = orderData.items.map((it) => it.id);
    unlockBooks(bookIdsToUnlock);

    // Empty cart
    clearCart();

    return newOrder;
  };

  const getOrderById = (orderIdOrNumber: string): Order | undefined => {
    return orders.find(
      (o) => o.orderId === orderIdOrNumber || o.orderNumber === orderIdOrNumber
    );
  };

  // Keyboard shortcut for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.key === "/" || ((e.metaKey || e.ctrlKey) && e.key === "k")) &&
        !["INPUT", "TEXTAREA"].includes((e.target as HTMLElement).tagName)
      ) {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setIsSearchOpen(false);
        setIsCartDrawerOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

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

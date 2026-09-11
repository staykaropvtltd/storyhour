"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Product, Story } from "@/data/storyhour-data";

export interface CartItem {
  product: Product;
  quantity: number;
}

interface LibraryCartContextType {
  savedStoryIds: string[];
  toggleSaveStory: (storyId: string) => boolean; // returns true if now saved
  isStorySaved: (storyId: string) => boolean;
  cartItems: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  cartCount: number;
  cartTotal: number;
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  isCartDrawerOpen: boolean;
  setIsCartDrawerOpen: (open: boolean) => void;
  toastMessage: string | null;
  showToast: (msg: string) => void;
}

const LibraryCartContext = createContext<LibraryCartContextType | undefined>(undefined);

export function LibraryCartProvider({ children }: { children: React.ReactNode }) {
  const [savedStoryIds, setSavedStoryIds] = useState<string[]>(["story-1"]); // Default 1 saved
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

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

  const addToCart = (product: Product, quantity: number = 1) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity }];
    });
    showToast(`Added ${product.title} to cart`);
    setIsCartDrawerOpen(true);
  };

  const removeFromCart = (productId: string) => {
    setCartItems((prev) => prev.filter((item) => item.product.id !== productId));
    showToast("Item removed from cart");
  };

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const cartTotal = cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

  // Global keyboard shortcut for search ('/' or 'Cmd+K' / 'Ctrl+K')
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === "/" || ((e.metaKey || e.ctrlKey) && e.key === "k")) && !["INPUT", "TEXTAREA"].includes((e.target as HTMLElement).tagName)) {
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
        removeFromCart,
        cartCount,
        cartTotal,
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

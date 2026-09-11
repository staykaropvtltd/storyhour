"use client";

import React from "react";
import { useLibraryCart } from "@/context/LibraryCartContext";
import { X, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import Image from "next/image";

export default function CartDrawer() {
  const { isCartDrawerOpen, setIsCartDrawerOpen, cartItems, removeFromCart, cartTotal, cartCount } = useLibraryCart();

  if (!isCartDrawerOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={() => setIsCartDrawerOpen(false)}
        aria-hidden="true"
      />

      {/* Slide-over panel */}
      <div className="relative z-10 w-full max-w-md bg-white h-full shadow-2xl flex flex-col border-l border-story-border">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-story-border">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-story-blue" />
            <h2 className="text-lg font-bold text-story-ink">Your Family Cart ({cartCount})</h2>
          </div>
          <button
            onClick={() => setIsCartDrawerOpen(false)}
            aria-label="Close cart drawer"
            className="p-2 rounded-full hover:bg-story-paper transition-colors text-story-muted hover:text-story-ink"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Shipping Reassurance */}
        <div className="bg-story-lavender/60 px-6 py-2.5 text-xs text-story-blue font-medium flex items-center justify-between">
          <span>Digital Audiobooks: Instant Lifetime Access</span>
          <span className="font-bold uppercase tracking-wider">Verified Purchase</span>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {cartItems.length === 0 ? (
            <div className="text-center py-16">
              <ShoppingBag className="w-12 h-12 text-story-muted/40 mx-auto mb-4" />
              <p className="text-story-ink font-semibold text-base mb-1">Your cart is currently empty</p>
              <p className="text-story-muted text-sm max-w-xs mx-auto mb-6">
                Explore our signature audiobook editions of the Ramayana in Hindi, English, and Telugu.
              </p>
              <button
                onClick={() => {
                  setIsCartDrawerOpen(false);
                  const el = document.getElementById("shop");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }}
                className="inline-flex items-center gap-2 bg-story-blue text-white px-5 py-2.5 rounded-pill text-sm font-medium hover:bg-story-blue-hover transition-colors"
              >
                Browse Audiobooks <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            cartItems.map((item) => (
              <div
                key={item.product.id}
                className="flex gap-4 p-4 rounded-2xl border border-story-border bg-story-paper/40 hover:bg-white transition-colors"
              >
                <div className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-story-paper border border-story-border">
                  <Image
                    src={item.product.coverImage}
                    alt={item.product.title}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="inline-block text-[11px] font-semibold text-story-red uppercase tracking-wider mb-0.5">
                    {item.product.language} Edition
                  </span>
                  <h3 className="text-sm font-bold text-story-ink truncate">{item.product.title}</h3>
                  <p className="text-xs text-story-muted">{item.product.format}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="font-mono text-sm font-bold text-story-ink">
                      {item.product.currency}{item.product.price.toFixed(2)}
                    </span>
                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="text-xs text-story-muted hover:text-story-red flex items-center gap-1 transition-colors"
                      title="Remove item"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Remove
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer with Checkout */}
        {cartItems.length > 0 && (
          <div className="p-6 border-t border-story-border bg-white space-y-4">
            <div className="flex justify-between items-baseline">
              <span className="text-sm text-story-muted">Subtotal</span>
              <span className="font-mono text-xl font-bold text-story-ink">${cartTotal.toFixed(2)}</span>
            </div>
            <p className="text-xs text-story-muted">
              Includes full digital access, lifetime updates, and multi-device listening stream.
            </p>
            <button
              onClick={() => {
                alert("This prototype simulates checkout. In production, this links to the secure StoryHour checkout.");
              }}
              className="w-full py-3.5 rounded-pill bg-story-blue hover:bg-story-blue-hover text-white font-medium text-sm flex items-center justify-center gap-2 shadow-card transition-all active:scale-[0.99]"
            >
              Proceed to Secure Checkout <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

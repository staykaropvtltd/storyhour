"use client";

import React, { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { X, Trash2, ArrowRight, Plus, Minus, ShoppingBag } from "lucide-react";
import { useLibraryCart } from "@/context/LibraryCartContext";

export default function CartDrawer() {
  const router = useRouter();
  const {
    isCartDrawerOpen,
    setIsCartDrawerOpen,
    cartItems,
    updateQuantity,
    removeFromCart,
    cartTotal,
  } = useLibraryCart();

  // Escape key handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isCartDrawerOpen) {
        setIsCartDrawerOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isCartDrawerOpen, setIsCartDrawerOpen]);

  if (!isCartDrawerOpen) return null;

  const currencySymbol = cartItems[0]?.currency || "$";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="cart-drawer-title"
      className="fixed inset-0 z-50 overflow-hidden"
    >
      <div
        onClick={() => setIsCartDrawerOpen(false)}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
      />
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between p-6 sm:p-8">
          <div>
            <div className="flex items-center justify-between pb-6 border-b border-[#e7e7e7]">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-[#C9281D]" />
                <h2 id="cart-drawer-title" className="font-serif text-2xl font-bold text-[#0f0f0f]">
                  Your Bag ({cartItems.length})
                </h2>
              </div>
              <button
                onClick={() => setIsCartDrawerOpen(false)}
                aria-label="Close cart drawer"
                className="w-9 h-9 rounded-full bg-[#f3f3f3] hover:bg-[#e7e7e7] flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-5 h-5 text-[#0f0f0f]" />
              </button>
            </div>

            <div className="divide-y divide-[#e7e7e7] overflow-y-auto max-h-[55vh] py-4">
              {cartItems.length === 0 ? (
                <div className="py-16 text-center">
                  <p className="text-[#a4a4a4] font-sans text-sm">Your bag is empty.</p>
                  <Link
                    href="/stories"
                    onClick={() => setIsCartDrawerOpen(false)}
                    className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-[#C9281D] hover:underline"
                  >
                    <span>Browse available stories</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ) : (
                cartItems.map((item) => {
                  const isDigital =
                    item.type === "book" ||
                    item.type === "audiobook" ||
                    !item.format?.toLowerCase().includes("physical");
                  return (
                    <div key={item.id} className="py-4 flex gap-4 items-center">
                      <div className="relative w-16 h-20 rounded-xl overflow-hidden bg-[#f3f3f3] flex-shrink-0 border border-black/5 shadow-xs">
                        <Image
                          src={item.coverImage}
                          alt={item.title}
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-sans font-bold text-sm text-[#0f0f0f] line-clamp-1">
                          {item.title}
                        </h3>
                        <p className="text-xs text-[#7A756D] mt-0.5 truncate">
                          {item.language} • {item.format}
                        </p>
                        <p className="text-sm font-bold text-[#C9281D] mt-1 font-mono">
                          {item.currency || currencySymbol}{item.price.toFixed(2)}
                        </p>

                        {/* Quantity controls */}
                        <div className="flex items-center gap-2 mt-2">
                          {!isDigital ? (
                            <div className="inline-flex items-center border border-black/10 rounded-full bg-[#FAF8F3]">
                              <button
                                type="button"
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                aria-label={`Decrease quantity of ${item.title}`}
                                className="w-6 h-6 flex items-center justify-center text-[#5A5A5A] hover:text-[#0F0F0F]"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="font-mono text-xs font-bold px-2 text-[#0F0F0F]">
                                {item.quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                aria-label={`Increase quantity of ${item.title}`}
                                className="w-6 h-6 flex items-center justify-center text-[#5A5A5A] hover:text-[#0F0F0F]"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          ) : (
                            <span className="text-[11px] font-mono text-[#7A756D] bg-black/5 px-2 py-0.5 rounded-full">
                              Digital (Qty: 1)
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        aria-label={`Remove ${item.title} from cart`}
                        className="text-[#a4a4a4] hover:text-[#C9281D] p-2 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="border-t border-[#e7e7e7] pt-6 space-y-4">
            <div className="flex justify-between items-center text-lg font-bold text-[#0f0f0f]">
              <span>Subtotal</span>
              <span className="font-mono">{currencySymbol}{cartTotal.toFixed(2)}</span>
            </div>
            <button
              onClick={() => {
                setIsCartDrawerOpen(false);
                router.push("/checkout");
              }}
              disabled={cartItems.length === 0}
              className="w-full py-4 rounded-full bg-[#0E1638] hover:bg-gradient-to-r hover:from-[#DE3124] hover:to-[#C9281D] active:scale-[0.98] text-white font-sans font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(14,22,56,0.25)] hover:shadow-[0_8px_24px_rgba(201,40,29,0.35)] cursor-pointer disabled:opacity-50"
            >
              <span>Checkout now</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <div className="text-center">
              <Link
                href="/cart"
                onClick={() => setIsCartDrawerOpen(false)}
                className="text-xs font-semibold text-[#5A5A5A] hover:text-[#C9281D] transition-colors"
              >
                View detailed shopping cart page →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

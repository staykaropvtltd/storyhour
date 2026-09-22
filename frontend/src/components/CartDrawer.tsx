"use client";

import React from "react";
import Image from "next/image";
import { X, Trash2, ArrowRight } from "lucide-react";
import { useLibraryCart } from "@/context/LibraryCartContext";

export default function CartDrawer() {
  const {
    isCartDrawerOpen,
    setIsCartDrawerOpen,
    cartItems,
    removeFromCart,
    cartTotal,
  } = useLibraryCart();

  if (!isCartDrawerOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div
        onClick={() => setIsCartDrawerOpen(false)}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
      />
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between p-6 sm:p-8">
          <div>
            <div className="flex items-center justify-between pb-6 border-b border-[#e7e7e7]">
              <h2 className="font-serif text-2xl font-bold text-[#0f0f0f]">
                Your Bag ({cartItems.length})
              </h2>
              <button
                onClick={() => setIsCartDrawerOpen(false)}
                className="w-9 h-9 rounded-full bg-[#f3f3f3] hover:bg-[#e7e7e7] flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-5 h-5 text-[#0f0f0f]" />
              </button>
            </div>

            <div className="divide-y divide-[#e7e7e7] overflow-y-auto max-h-[55vh] py-4">
              {cartItems.length === 0 ? (
                <div className="py-16 text-center">
                  <p className="text-[#a4a4a4] font-sans text-sm">Your bag is empty.</p>
                </div>
              ) : (
                cartItems.map(({ product, quantity }) => (
                  <div key={product.id} className="py-4 flex gap-4 items-center">
                    <div className="relative w-16 h-20 rounded-xl overflow-hidden bg-[#f3f3f3] flex-shrink-0">
                      <Image
                        src={product.coverImage}
                        alt={product.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-sans font-bold text-sm text-[#0f0f0f] line-clamp-1">
                        {product.title}
                      </h3>
                      <p className="text-xs text-[#a4a4a4] mt-0.5">{product.language} • {product.format}</p>
                      <p className="text-sm font-bold text-[#C9281D] mt-1">
                        {product.currency}{product.price} × {quantity}
                      </p>
                    </div>
                    <button
                      onClick={() => removeFromCart(product.id)}
                      className="text-[#a4a4a4] hover:text-[#C9281D] p-2 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="border-t border-[#e7e7e7] pt-6 space-y-4">
            <div className="flex justify-between items-center text-lg font-bold text-[#0f0f0f]">
              <span>Subtotal</span>
              <span>£{cartTotal.toFixed(2)}</span>
            </div>
            <button
              disabled={cartItems.length === 0}
              className="w-full py-4 rounded-full bg-[#0E1638] hover:bg-gradient-to-r hover:from-[#DE3124] hover:to-[#C9281D] active:scale-[0.98] text-white font-sans font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(14,22,56,0.25)] hover:shadow-[0_8px_24px_rgba(201,40,29,0.35)] cursor-pointer disabled:opacity-50"
            >
              <span>Checkout now</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

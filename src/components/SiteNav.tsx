"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, Bookmark, User, ShoppingBag, Menu, X } from "lucide-react";
import { useLibraryCart } from "@/context/LibraryCartContext";

interface SiteNavProps {
  theme?: "light" | "dark";
  activeLink?: string;
}

export default function SiteNav({ theme = "light", activeLink }: SiteNavProps) {
  const { savedStoryIds, cartCount, setIsSearchOpen, setIsCartDrawerOpen, showToast } = useLibraryCart();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isDark = theme === "dark";
  const textColor = isDark ? "text-[#F7F4EE]" : "text-[#050505]";
  const textMuted = isDark ? "text-[#F7F4EE]/70" : "text-[#696572]";
  const textHover = isDark ? "hover:text-white" : "hover:text-[#2410A4]";
  const bgNav = isDark ? "bg-[#120A45]/95 backdrop-blur-xl border-b border-white/8" : "bg-[#FAF8F3]/95 backdrop-blur-xl border-b border-[#E8E4DC]/60";
  const mobileBg = isDark ? "bg-[#0E0738]/98 backdrop-blur-md border-b border-white/10" : "bg-[#FAF8F3]/98 backdrop-blur-md border-b border-[#E8E4DC]";

  const links = [
    { label: "Home", href: "/" },
    { label: "Books / Stories", href: "/stories" },
    { label: "Storyteller / About", href: "/storytellers" },
    { label: "Contact", href: "/contact" },
    { label: "Trailer", href: "/trailers" },
  ];

  return (
    <>
      <nav className={`sticky top-0 z-50 ${bgNav}`}>
        <div className="max-w-[1340px] mx-auto px-6 sm:px-10 h-[60px] flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group" aria-label="StoryHour Home">
            <div className={`relative h-8 w-28 sm:h-9 sm:w-36 ${isDark ? "brightness-0 invert opacity-95 group-hover:opacity-100" : "brightness-0 opacity-90 group-hover:opacity-100"} transition-opacity`}>
              <Image
                src="https://storyhour.co.uk/wp-content/uploads/2026/01/tp-logo.png"
                alt="StoryHour"
                fill
                priority
                className="object-contain object-left"
                sizes="150px"
              />
            </div>
          </Link>

          {/* Center Links */}
          <div className={`hidden lg:flex items-center gap-7 xl:gap-9 text-[15px] font-inter font-medium ${textMuted} tracking-[-0.015em]`}>
            {links.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className={`${textHover} transition-colors py-1 ${activeLink === link.label ? `${textColor} font-semibold` : ""}`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right Actions */}
          <div className={`flex items-center gap-3 sm:gap-5 ${textColor}`}>
            <button
              onClick={() => setIsSearchOpen(true)}
              aria-label="Search stories"
              className={`${textMuted} ${textHover} transition-colors p-1.5 cursor-pointer`}
            >
              <Search className="w-5 h-5" />
            </button>
            <button
              onClick={() => showToast(`You have ${savedStoryIds.length} stories saved`)}
              aria-label={`Saved library: ${savedStoryIds.length}`}
              className={`relative ${textMuted} ${textHover} transition-colors p-1.5 cursor-pointer`}
            >
              <Bookmark className="w-5 h-5" />
              {savedStoryIds.length > 0 && (
                <span className={`absolute -top-1 -right-1 w-4 h-4 rounded-full ${isDark ? "bg-white text-[#2410A4]" : "bg-[#2410A4] text-white"} text-[10px] font-bold flex items-center justify-center font-mono shadow-sm`}>
                  {savedStoryIds.length}
                </span>
              )}
            </button>
            <button
              onClick={() => showToast("Sign in to your StoryHour library")}
              aria-label="User account"
              className={`${textMuted} ${textHover} transition-colors p-1.5 cursor-pointer`}
            >
              <User className="w-5 h-5" />
            </button>
            <button
              onClick={() => setIsCartDrawerOpen(true)}
              aria-label="View cart"
              className={`relative ${textMuted} ${textHover} transition-colors p-1.5 cursor-pointer`}
            >
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#F6C445] text-[#161015] text-[10px] font-bold flex items-center justify-center font-mono shadow-sm">
                  {cartCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
              className={`lg:hidden ${textMuted} ${textHover} transition-colors p-1.5 cursor-pointer ml-1`}
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className={`lg:hidden fixed top-[60px] inset-x-0 z-40 ${mobileBg} px-6 py-6 space-y-3 shadow-xl`}>
          {links.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className={`block font-inter text-base font-medium py-2 ${textColor} ${textHover} transition-colors ${activeLink === link.label ? "font-semibold" : ""}`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </>
  );
}

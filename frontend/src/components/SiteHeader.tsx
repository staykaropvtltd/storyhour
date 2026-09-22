"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ShoppingBag } from "lucide-react";
import { useLibraryCart } from "@/context/LibraryCartContext";

interface SiteHeaderProps {
  activeLink?: string;
  theme?: "light" | "dark";
}

export default function SiteHeader({ activeLink: activeLinkProp }: SiteHeaderProps) {
  const pathname = usePathname();
  const isHomePage = pathname === "/";
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { cartCount } = useLibraryCart();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Determine active item based on current pathname or explicit prop
  let activeLink = activeLinkProp;
  if (activeLink === "Audiobooks" || activeLink === "Books / Stories") {
    activeLink = "Shop";
  } else if (activeLink === "Storyteller / About" || activeLink === "Storytellers") {
    activeLink = "About Us";
  } else if (activeLink === "Puppet Theatre") {
    activeLink = "Trailer";
  }

  if (!activeLink) {
    if (pathname === "/") {
      activeLink = "Home";
    } else if (pathname.startsWith("/stories") || pathname.startsWith("/editions")) {
      activeLink = "Shop";
    } else if (pathname.startsWith("/storytellers")) {
      activeLink = "About Us";
    } else if (pathname.startsWith("/contact")) {
      activeLink = "Contact";
    } else if (pathname.startsWith("/trailers")) {
      activeLink = "Trailer";
    } else if (pathname.startsWith("/cart")) {
      activeLink = "Cart";
    } else {
      activeLink = "Home";
    }
  }

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Shop", href: "/stories" },
    { label: "About Us", href: "/storytellers" },
    { label: "Contact", href: "/contact" },
    { label: "Trailer", href: "/trailers" },
  ];

  const ctaHref = "/stories";

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300 ${
          isScrolled || !isHomePage
            ? "bg-white/95 backdrop-blur-md shadow-[0_4px_24px_rgba(0,0,0,0.06)] border-b border-[#e7e7e7] py-3 sm:py-3.5"
            : "bg-transparent py-5 lg:py-6"
        }`}
      >
        <div className="max-w-[1360px] mx-auto px-5 sm:px-8 flex items-center justify-between">
          {/* 1. Left: StoryHour Brand Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 group cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#C9281D] rounded-full"
            aria-label="StoryHour Home"
          >
            <div
              className="relative h-10 w-36 sm:h-11 sm:w-40 bg-white rounded-full px-3.5 py-1.5 flex items-center justify-center shadow-[0_4px_16px_rgba(0,0,0,0.08)] border border-black/5 transition-all duration-200 group-hover:scale-105 group-hover:shadow-[0_6px_20px_rgba(0,0,0,0.12)]"
              style={{ maxWidth: "160px", maxHeight: "48px" }}
            >
              <Image
                src="https://storyhour.co.uk/wp-content/uploads/2026/01/tp-logo.png"
                alt="StoryHour"
                fill
                priority
                className="object-contain p-1"
                sizes="180px"
              />
            </div>
          </Link>

          {/* 2. Center: Rounded Pill Navigation Capsule (Pure White, Rounded-Full, Papumba Proportions) */}
          <nav
            className="hidden md:flex items-center bg-white rounded-full px-6 py-2.5 shadow-[0_4px_16px_rgba(0,0,0,0.06)] gap-7 border border-black/5"
            aria-label="Main Navigation"
          >
            {navLinks.map((link) => {
              const isActive = activeLink === link.label;
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  className={`text-[15px] font-bold tracking-tight transition-colors duration-150 ${
                    isActive
                      ? "text-[#C9281D]"
                      : "text-[#0f0f0f] hover:text-[#C9281D]"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* 3. Right: Cart Button & High-Contrast Pill CTA Button */}
          <div className="hidden md:flex items-center gap-3">
            {/* Cart Button */}
            <Link
              href="/cart"
              className="relative inline-flex items-center justify-center w-11 h-11 rounded-full bg-white hover:bg-gray-50 border border-black/10 text-[#0f0f0f] hover:text-[#C9281D] transition-all duration-200 shadow-[0_4px_16px_rgba(0,0,0,0.06)] hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#C9281D]"
              aria-label={`View Cart (${cartCount} items)`}
            >
              <ShoppingBag className="w-5 h-5 transition-transform duration-200" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1.5 rounded-full bg-gradient-to-r from-[#DE3124] to-[#C9281D] text-white text-[11px] font-black flex items-center justify-center shadow-[0_2px_8px_rgba(201,40,29,0.38)] animate-in zoom-in-75">
                  {cartCount}
                </span>
              )}
            </Link>

            <Link
              href={ctaHref}
              className="inline-flex items-center justify-center bg-[#0f0f0f] hover:bg-gradient-to-r hover:from-[#DE3124] hover:to-[#C9281D] text-white font-bold text-[15px] px-6 sm:px-7 py-2.5 sm:py-3 rounded-full transition-all duration-200 shadow-sm hover:shadow-[0_6px_20px_rgba(201,40,29,0.35)] hover:-translate-y-0.5 active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-[#C9281D]"
            >
              <span>Try it for free!</span>
            </Link>
          </div>

          {/* 4. Mobile Menu Trigger & Mobile Cart */}
          <div className="flex md:hidden items-center gap-2">
            <Link
              href="/cart"
              className="relative w-10 h-10 rounded-full bg-white border border-black/10 shadow-sm flex items-center justify-center text-[#0f0f0f] focus:outline-none"
              aria-label={`View Cart (${cartCount} items)`}
            >
              <ShoppingBag className="w-4.5 h-4.5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-gradient-to-r from-[#DE3124] to-[#C9281D] text-white text-[10px] font-black flex items-center justify-center shadow-[0_2px_6px_rgba(201,40,29,0.35)]">
                  {cartCount}
                </span>
              )}
            </Link>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="w-10 h-10 rounded-full bg-white border border-black/10 shadow-sm flex items-center justify-center text-[#0f0f0f] focus:outline-none"
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* 5. Mobile Slide-Down Drawer Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-x-0 top-[64px] sm:top-[68px] bg-white border-b border-gray-200 shadow-xl px-6 py-6 transition-all duration-300 animate-in slide-in-from-top-4 z-50">
            <div className="flex flex-col gap-3">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`py-2 text-lg font-bold border-b border-gray-100 ${
                    activeLink === link.label ? "text-[#C9281D]" : "text-[#0f0f0f]"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/cart"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 text-lg font-bold border-b border-gray-100 flex items-center justify-between text-[#0f0f0f]"
              >
                <span className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-[#C9281D]" />
                  Cart
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-[#DE3124] to-[#C9281D] text-white text-xs font-black shadow-[0_2px_6px_rgba(201,40,29,0.35)]">
                  {cartCount}
                </span>
              </Link>
              <div className="pt-3">
                <Link
                  href={ctaHref}
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center bg-[#0f0f0f] hover:bg-gradient-to-r hover:from-[#DE3124] hover:to-[#C9281D] text-white font-bold text-base py-3.5 rounded-full transition-all duration-200 shadow-md"
                >
                  <span>Try it for free!</span>
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* 6. Layout Top Clearance Spacer on Inner Pages */}
      {!isHomePage && (
        <div className="h-[72px] sm:h-[80px] w-full shrink-0" aria-hidden="true" />
      )}
    </>
  );
}

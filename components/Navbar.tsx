"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (pathname?.startsWith("/admin ,/launch")) {
    return null;
  }

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "About", href: "/about" },
    { name: "Leaderboard", href: "/leaderboard" },
    { name: "Search", href: "/search" },
    { name: "Committee", href: "/committee" },
    { name: "Programs", href: "/programs" },
    { name: "Gallery", href: "/gallery" },
  ];

  return (
    <div
      className={`fixed left-0 right-0 z-50 transition-all duration-500 sm:px-8 lg:px-10 px-5 ${
        scrolled ? "top-4" : "top-6"
      }`}
    >
      <nav className="mx-auto flex h-[72px] max-w-7xl items-center justify-between rounded-[2.5rem] border border-white/15 bg-ocean-950/75 px-5 pl-3 backdrop-blur-2xl shadow-[0_16px_40px_rgba(5,46,22,0.25)] sm:px-6 sm:pl-4 transition-all duration-300">
        {/* Logo Section */}
        <Link
          href="/"
          className="flex items-center gap-3 group max-w-[75%] sm:max-w-none"
        >
          <div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-[1.25rem] bg-white shadow-sm transition-transform group-hover:scale-105">
            <Image
              src="/sajda-logo.png"
              alt="SAJDA Logo"
              fill
              priority
              // Reduced padding to p-0.5 to let the logo fill the space.
              // Added scale-110 to enlarge it further if the PNG has built-in margins
              className="object-contain object-center p-0.5 scale-110"
            />
          </div>

          <div className="flex flex-col justify-center overflow-hidden">
            <p className="text-[11px] sm:text-[15px] font-black leading-tight text-white tracking-wide truncate">
              SAJDA CENTRAL COMMITTEE
            </p>
            <p className="mt-0.5 sm:mt-1 text-[8px] sm:text-[9px] font-bold uppercase tracking-[0.2em] sm:tracking-[0.25em] text-white/60">
              2026 — 2027
            </p>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-8">
          <div className="flex items-center gap-7 text-[13px] font-bold text-white/70">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="transition-colors hover:text-white"
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-white focus:outline-none lg:hidden shrink-0 ml-2"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile Dropdown Panel */}
      <div
        className={`mx-auto mt-2 max-w-7xl overflow-hidden rounded-[1.5rem] border border-white/10 bg-ocean-950/85 backdrop-blur-3xl transition-all duration-300 lg:hidden ${
          isOpen
            ? "max-h-[400px] opacity-100 shadow-2xl"
            : "max-h-0 opacity-0 border-transparent"
        }`}
      >
        <div className="flex flex-col gap-4 p-6">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className="text-sm font-bold text-white/80 hover:text-white"
            >
              {link.name}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

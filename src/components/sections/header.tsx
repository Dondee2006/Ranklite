"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

function RankliteLogo() {
  return (
    <div className="relative flex items-center">
      <span className="text-[28px] font-bold tracking-tight text-[#10B981]" style={{ fontFamily: "var(--font-display)" }}>
        ranklite
      </span>
      <svg 
        width="32" 
        height="32" 
        viewBox="0 0 32 32" 
        fill="none" 
        className="shrink-0 absolute"
        style={{ 
          right: '-38px',
          top: '-6px',
        }}
      >
        <path d="M12 20L12 24L8 24" stroke="#10B981" strokeWidth="3" strokeLinecap="square" strokeLinejoin="miter"/>
        <path d="M4 16L4 20L0 20" stroke="#10B981" strokeWidth="3" strokeLinecap="square" strokeLinejoin="miter"/>
      </svg>
    </div>
  );
}

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      <header className="fixed left-0 right-0 top-0 z-50 px-4 pt-5 md:px-6">
        <div className="mx-auto w-full max-w-[1320px]">
          <div className="relative flex items-center justify-between rounded-2xl border border-white/60 bg-white/80 px-5 py-3 shadow-xl shadow-black/[0.03] backdrop-blur-xl md:px-8">
            <Link href="/" className="shrink-0">
              <RankliteLogo />
            </Link>

            <nav className="absolute left-1/2 hidden -translate-x-1/2 lg:block">
              <ul className="flex items-center gap-1">
                {["Features", "How it Works", "Pricing", "Blog"].map((item) => (
                  <li key={item}>
                    <Link
                      href={`/#${item.toLowerCase().replace(/\s+/g, "")}`}
                      className="rounded-full px-5 py-2.5 text-[15px] font-medium text-foreground/80 transition-all hover:bg-[#F0FDF4] hover:text-foreground"
                    >
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="hidden text-[15px] font-semibold text-foreground/70 transition-colors hover:text-foreground sm:block"
              >
                Sign in
              </Link>
              <Link
                href="/login"
                className="group relative flex items-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-[#22C55E] to-[#16A34A] px-5 py-2.5 text-[15px] font-semibold text-white shadow-lg shadow-green-500/25 transition-all hover:shadow-green-500/40"
              >
                <span className="relative z-10">Start Free Trial</span>
                <svg className="relative z-10 h-4 w-4 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
                <div className="absolute inset-0 bg-gradient-to-r from-[#16A34A] to-[#15803D] opacity-0 transition-opacity group-hover:opacity-100" />
              </Link>

              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-white text-foreground transition-colors hover:bg-muted lg:hidden"
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <div
            className={`mt-2 overflow-hidden rounded-2xl border border-white/60 bg-white/95 shadow-xl backdrop-blur-xl transition-all duration-300 lg:hidden ${
              isMobileMenuOpen ? "max-h-[400px] opacity-100" : "max-h-0 border-transparent opacity-0"
            }`}
          >
            <nav className="p-4">
              <ul className="space-y-1">
                {["Features", "How it Works", "Pricing", "Blog"].map((item) => (
                  <li key={item}>
                    <Link
                      href={`/#${item.toLowerCase().replace(/\s+/g, "")}`}
                      className="block rounded-xl px-4 py-3 text-center text-[15px] font-medium text-foreground transition-colors hover:bg-[#F0FDF4]"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="mt-4 border-t border-border pt-4">
                <Link
                  href="/login"
                  className="block rounded-xl px-4 py-3 text-center text-[15px] font-semibold text-foreground transition-colors hover:bg-muted"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Sign in
                </Link>
              </div>
            </nav>
          </div>
        </div>
      </header>
    </>
  );
}
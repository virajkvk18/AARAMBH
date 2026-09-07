"use client";

import React, { useState } from "react";
import Link from "next/link";
import { LogIn, UserPlus, Menu, X } from "lucide-react";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full bg-[#0B1728] text-white border-b border-slate-800 shadow-md">
      {/* Main Navigation Bar */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Left Brand Identity: Logo + AARAMBH + Single Window System */}
          <Link href="/" className="flex items-center space-x-3.5 group focus:outline-hidden">
            <img src="/aarambh-logo-new.png" alt="AARAMBH Logo" className="w-11 h-11 object-contain" />

            <div className="flex flex-col">
              <div className="flex items-center space-x-1.5">
                <span className="text-xl sm:text-2xl font-black tracking-tight text-white font-sans">
                  AARAMBH
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30 uppercase tracking-wider">
                  MH-SWS
                </span>
              </div>
              <span className="text-[11px] font-medium text-slate-300 tracking-wide">
                Single Window System • Govt. of Maharashtra
              </span>
            </div>
          </Link>

          {/* Desktop Right: Login & Signup */}
          <div className="hidden sm:flex items-center space-x-3">
            <Link
              href="/login"
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-md bg-[#0B1728] hover:bg-[#12233D] border-2 border-amber-400 text-amber-400 font-bold text-xs uppercase tracking-wider shadow-sm transition-all duration-150 hover:shadow-amber-400/20"
            >
              <LogIn className="w-4 h-4 text-amber-400" />
              <span>Login</span>
            </Link>

            <Link
              href="/signup"
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-md bg-amber-400 hover:bg-amber-500 text-[#0B1728] font-black text-xs uppercase tracking-wider shadow-sm transition-all duration-150"
            >
              <UserPlus className="w-4 h-4 text-[#0B1728]" />
              <span>Sign Up</span>
            </Link>
          </div>

          {/* Mobile menu trigger & login */}
          <div className="flex sm:hidden items-center space-x-2">
            <Link
              href="/login"
              className="px-3.5 py-1.5 rounded-md border border-amber-400 text-amber-400 text-xs font-bold"
            >
              Login
            </Link>
            <Link
              href="/signup"
              className="px-3 py-1.5 rounded-md bg-amber-400 text-[#0B1728] text-xs font-black"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}

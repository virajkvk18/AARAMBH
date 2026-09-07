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
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 uppercase tracking-wider">
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
              className="inline-flex items-center space-x-2 px-4.5 py-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-slate-200 hover:text-white font-bold text-xs uppercase tracking-wider shadow-sm transition-all duration-150 cursor-pointer"
            >
              <LogIn className="w-4 h-4 text-emerald-400" />
              <span>Login</span>
            </Link>

            <Link
              href="/signup"
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider shadow-md shadow-emerald-950/50 transition-all duration-150 cursor-pointer hover:scale-[1.02]"
            >
              <UserPlus className="w-4 h-4 text-white" />
              <span>Sign Up</span>
            </Link>
          </div>

          {/* Mobile menu trigger & login */}
          <div className="flex sm:hidden items-center space-x-2">
            <Link
              href="/login"
              className="px-3.5 py-1.5 rounded-lg border border-slate-700 bg-slate-900 text-slate-200 text-xs font-bold"
            >
              Login
            </Link>
            <Link
              href="/signup"
              className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-black"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}

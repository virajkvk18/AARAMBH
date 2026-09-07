"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Building2,
  Landmark,
  Award,
  LogIn,
  Pause,
  Play,
  ArrowRight,
  Menu,
  X,
  Paperclip,
  MapPin,
  ChevronRight,
} from "lucide-react";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [tickerPaused, setTickerPaused] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full bg-[#0B1728] text-white border-b border-slate-800 shadow-md">
      {/* 1. Main Navigation Bar */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Left Brand Identity: Logo + Govt. of Maharashtra */}
          <Link href="/" className="flex items-center space-x-3.5 group focus:outline-hidden">
            {/* NSWS-style Interlinked Dual Node Icon in Emerald Green & White */}
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

          {/* Desktop Center Navigation (Exact NSWS Layout & Icons) */}
          <nav className="hidden lg:flex items-center space-x-8">
            {/* 1. Central Approvals */}
            <Link
              href="/dashboard/kya"
              className="flex items-center space-x-3 group text-left hover:text-amber-300 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-300 group-hover:text-amber-400 group-hover:border-amber-400/40 transition-colors">
                <Landmark className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold uppercase tracking-wider text-white group-hover:text-amber-300">
                  Central Approvals
                </span>
                <span className="text-[10px] text-slate-400 leading-tight">
                  Issued by Ministries of Govt. of India
                </span>
              </div>
            </Link>

            {/* 2. State Approvals (Maharashtra) */}
            <Link
              href="/dashboard/workflows"
              className="flex items-center space-x-3 group text-left hover:text-amber-300 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-300 group-hover:text-amber-400 group-hover:border-amber-400/40 transition-colors">
                <Building2 className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold uppercase tracking-wider text-white group-hover:text-amber-300">
                  State Approvals
                </span>
                <span className="text-[10px] text-slate-400 leading-tight">
                  Issued by Govt. of Maharashtra
                </span>
              </div>
            </Link>

            {/* 3. Government Schemes */}
            <Link
              href="/schemes"
              className="flex items-center space-x-3 group text-left hover:text-amber-300 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-300 group-hover:text-amber-400 group-hover:border-amber-400/40 transition-colors">
                <Award className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold uppercase tracking-wider text-white group-hover:text-amber-300">
                  Government Schemes
                </span>
                <span className="text-[10px] text-slate-400 leading-tight">
                  Avail incentives under PSI 2019
                </span>
              </div>
            </Link>
          </nav>

          {/* Desktop Right: NSWS Styled Amber Bordered Login Button */}
          <div className="hidden lg:flex items-center">
            <Link
              href="/login"
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-md bg-[#0B1728] hover:bg-[#12233D] border-2 border-amber-400 text-amber-400 font-bold text-xs uppercase tracking-wider shadow-sm transition-all duration-150 hover:shadow-amber-400/20"
            >
              <LogIn className="w-4 h-4 text-amber-400" />
              <span>Login</span>
            </Link>
          </div>

          {/* Mobile menu trigger */}
          <div className="flex lg:hidden items-center space-x-2">
            <Link
              href="/login"
              className="px-3 py-1.5 rounded-md border border-amber-400 text-amber-400 text-xs font-bold"
            >
              Login
            </Link>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* 2. NSWS News Ticker Bar (Exact Layout from Reference Image 1) */}
      <div className="w-full bg-[#060D17] border-t border-slate-800/90 text-xs">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 h-10 flex items-center justify-between">
          {/* Ticker Content */}
          <div className="flex items-center space-x-3 overflow-hidden pr-4">
            <button
              type="button"
              onClick={() => setTickerPaused(!tickerPaused)}
              className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-amber-400 transition-colors shrink-0 cursor-pointer"
              title={tickerPaused ? "Resume Ticker" : "Pause Ticker"}
            >
              {tickerPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
            </button>

            <div className="flex items-center space-x-2 text-slate-200 truncate text-[11px]">
              <span className="text-amber-400 font-semibold shrink-0 hidden sm:inline">Notice:</span>
              <span className="truncate">
                Licenses, Standalone Clearances, Permissions, and NOCs shall be issued seamlessly under AARAMBH Single Window Portal 2.0 with Deemed Approval guarantee w.e.f. 2026.
              </span>
              <Paperclip className="w-3 h-3 text-amber-400 shrink-0 inline ml-1" />
            </div>
          </div>

          {/* Golden View All Button on Far Right (Exact Match) */}
          <Link
            href="/dashboard/kya"
            className="shrink-0 inline-flex items-center space-x-1.5 px-4 h-10 bg-[#FFB800] hover:bg-[#E5A600] text-[#0B1728] font-black text-xs transition-colors -mr-4 sm:-mr-6 lg:-mr-8 px-5"
          >
            <span>View all</span>
            <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
          </Link>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#0D1B2A] border-t border-slate-800 p-4 space-y-3">
          <Link
            href="/dashboard/kya"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center justify-between p-2.5 rounded-lg bg-slate-800/60 text-xs font-bold text-white hover:bg-slate-800"
          >
            <span>Central Approvals</span>
            <ChevronRight className="w-4 h-4 text-amber-400" />
          </Link>

          <Link
            href="/dashboard/workflows"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center justify-between p-2.5 rounded-lg bg-slate-800/60 text-xs font-bold text-white hover:bg-slate-800"
          >
            <span>State Approvals (Govt. of Maharashtra)</span>
            <ChevronRight className="w-4 h-4 text-amber-400" />
          </Link>

          <Link
            href="/schemes"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center justify-between p-2.5 rounded-lg bg-slate-800/60 text-xs font-bold text-white hover:bg-slate-800"
          >
            <span>Government Schemes (PSI 2019)</span>
            <ChevronRight className="w-4 h-4 text-amber-400" />
          </Link>
        </div>
      )}
    </header>
  );
}

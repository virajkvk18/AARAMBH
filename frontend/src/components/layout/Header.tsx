"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Search,
  Compass,
  LogIn,
  Menu,
  X,
} from "lucide-react";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo + Tagline */}
          <Link href="/" className="flex items-center space-x-3.5 group focus:outline-hidden">
            {/* Government Crest / Brand Emblem */}
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#0F172A] to-[#1E293B] border border-slate-700 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform duration-200">
              <span className="font-extrabold text-xl tracking-wider text-indigo-400">आ</span>
            </div>

            <div className="flex flex-col">
              <div className="flex items-center space-x-2">
                <span className="text-2xl font-black tracking-tight text-[#0F172A]">
                  AARAMBH
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 uppercase tracking-widest">
                  PORTAL
                </span>
              </div>
              <p className="text-[11px] font-medium text-slate-600 leading-tight line-clamp-1 max-w-md">
                Dept. of Skills, Employment, Entrepreneurship & Innovation, Govt. of Maharashtra
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            {/* Know Your Approvals */}
            <Link
              href="/dashboard/kya"
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:text-indigo-600 hover:bg-slate-50 transition-colors"
            >
              <Compass className="w-4 h-4 text-indigo-500" />
              <span>Know Your Approvals</span>
            </Link>

            {/* Track Status */}
            <Link
              href="/dashboard/sla"
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:text-indigo-600 hover:bg-slate-50 transition-colors"
            >
              <Search className="w-4 h-4 text-indigo-500" />
              <span>Track Status</span>
            </Link>

          </nav>

          {/* Desktop Right CTA: Login */}
          <div className="hidden lg:flex items-center space-x-3">
            <Link
              href="/login"
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-lg bg-[#4F46E5] hover:bg-[#4338CA] text-white text-sm font-semibold shadow-xs hover:shadow-md transition-all duration-150"
            >
              <LogIn className="w-4 h-4" />
              <span>Investor Login / Sign Up</span>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="flex lg:hidden items-center space-x-2">
            <Link
              href="/login"
              className="px-3 py-1.5 rounded-md bg-[#4F46E5] text-white text-xs font-semibold"
            >
              Login
            </Link>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 py-4 px-2 space-y-2 bg-white">
            <div className="pt-2 border-t border-slate-100 space-y-1">
              <Link
                href="/dashboard/kya"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-slate-800 hover:bg-slate-50"
              >
                <Compass className="w-4 h-4 text-indigo-500" />
                <span>Know Your Approvals</span>
              </Link>
              <Link
                href="/dashboard/sla"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-slate-800 hover:bg-slate-50"
              >
                <Search className="w-4 h-4 text-indigo-500" />
                <span>Track Status</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

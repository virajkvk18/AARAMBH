"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  UserPlus,
  Menu,
  X,
  Briefcase,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t } = useLanguage();
  const { user } = useAuth();

  const authHref = (target: string) =>
    user ? target : `/login?redirect=${encodeURIComponent(target)}`;

  return (
    <header className="sticky top-0 z-40 w-full bg-[#16060E] text-white border-b border-[#36101E] shadow-md shadow-black/20">
      {/* Main Navigation Bar */}
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Left Brand Identity: Logo + AARAMBH + Single Window System */}
          <Link href="/" className="flex items-center space-x-3.5 group focus:outline-hidden">
            <img src="/aarambh-logo-new.png" alt="AARAMBH Logo" className="w-11 h-11 object-contain" />

            <div className="flex flex-col">
              <div className="flex items-center space-x-2">
                <span className="text-xl sm:text-2xl font-black tracking-tight text-white font-sans">
                  AARAMBH
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#FE7251]/20 text-[#FFCA7C] border border-[#FE7251]/30 uppercase tracking-wider">
                  Single Window
                </span>
              </div>
              <span className="text-[11px] font-medium text-[#E0C7BC] tracking-wide">
                Industrial Facilitation • Govt. of Maharashtra
              </span>
            </div>
          </Link>

          {/* Desktop Right: MY BUSINESS Personal Control Center */}
          <div className="hidden sm:flex items-center space-x-3">
            {user ? (
              <Link
                href={user.role === "officer" ? "/dashboard/officer-workspace" : "/dashboard"}
                className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#9B2A48] via-[#FE7251] to-[#FE7251] hover:from-[#82213B] hover:to-[#E85E3E] text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-[#9B2A48]/30 transition-all cursor-pointer hover:scale-[1.02]"
                title="Go to your business control center"
              >
                <Briefcase className="w-4 h-4 text-white" />
                <span>MY BUSINESS</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse ml-1" />
              </Link>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  href="/login"
                  className="inline-flex items-center space-x-2 px-4.5 py-2.5 rounded-xl bg-[#250C19]/90 hover:bg-[#381326] border border-[#521C35] text-[#FFE8DE] hover:text-white font-bold text-xs uppercase tracking-wider shadow-xs transition-all duration-150 cursor-pointer"
                  title="Sign In to your business control center"
                >
                  <Briefcase className="w-4 h-4 text-[#FE7251]" />
                  <span>MY BUSINESS</span>
                </Link>

                <Link
                  href="/signup"
                  className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#9B2A48] to-[#FE7251] hover:from-[#82213B] hover:to-[#E85E3E] text-white font-extrabold text-xs uppercase tracking-wider shadow-md shadow-[#9B2A48]/20 transition-all cursor-pointer hover:scale-[1.02]"
                >
                  <UserPlus className="w-3.5 h-3.5 text-white" />
                  <span>Register</span>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Controls */}
          <div className="flex sm:hidden items-center space-x-2">
            <Link
              href={user ? "/dashboard" : "/login"}
              className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#9B2A48] to-[#FE7251] text-white text-xs font-bold flex items-center gap-1.5"
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>MY BUSINESS</span>
            </Link>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-[#E0C7BC] hover:text-white hover:bg-[#250C19]"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5 text-[#FFCA7C]" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="sm:hidden bg-[#190710] border-t border-[#36101E] px-4 py-4 space-y-3">
          <Link
            href={user ? (user.role === "officer" ? "/dashboard/officer-workspace" : "/dashboard") : "/login"}
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-xs font-bold text-white hover:text-[#FFCA7C]"
          >
            My Business Portal
          </Link>
          <Link
            href={authHref("/dashboard/caf")}
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-xs font-bold text-[#E0C7BC] hover:text-white"
          >
            Unified Common Application (CAF)
          </Link>
          <div className="pt-3 border-t border-[#36101E] flex items-center gap-2">
            {!user ? (
              <>
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 py-2 px-3 rounded-lg bg-[#250C19] border border-[#521C35] text-center text-xs font-bold text-[#FFCA7C]"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 py-2 px-3 rounded-lg bg-gradient-to-r from-[#9B2A48] to-[#FE7251] text-center text-xs font-bold text-white"
                >
                  Register
                </Link>
              </>
            ) : (
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-2 px-3 rounded-lg bg-gradient-to-r from-[#9B2A48] to-[#FE7251] text-center text-xs font-bold text-white"
              >
                Go to Dashboard
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

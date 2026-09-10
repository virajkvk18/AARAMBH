"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  UserPlus,
  Menu,
  X,
  Briefcase,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import NotificationBell from "./NotificationBell";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t } = useLanguage();
  const { user } = useAuth();

  const authHref = (target: string) =>
    user ? target : `/login?redirect=${encodeURIComponent(target)}`;

  return (
    <header className="sticky top-0 z-40 w-full shrink-0 bg-white text-slate-900 border-b border-slate-200 shadow-xs">
      {/* Main Navigation Bar */}
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          {/* Left Brand Identity: Logo + AARAMBH + Single Window System */}
          <Link href="/" className="flex items-center space-x-3 group focus:outline-hidden">
            <Image src="/aarambh-logo-new.png" alt="AARAMBH Logo" width={40} height={40} className="w-10 h-10 object-contain" />

            <div className="flex flex-col">
              <div className="flex items-center space-x-2">
                <span className="text-xl font-bold tracking-tight text-slate-900 font-sans">
                  AARAMBH
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-orange-50 text-[#FE7251] border border-orange-200 uppercase tracking-wider">
                  {t("header.sw_badge", "Single Window")}
                </span>
              </div>
              <span className="text-[11px] font-medium text-slate-500 tracking-normal">
                {t("header.sub_tagline", "Industrial Facilitation • Govt. of Maharashtra")}
              </span>
            </div>
          </Link>

          {/* Center Navigation Links (Desktop) */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            <Link
              href="/"
              className="px-3 py-2 text-xs font-semibold text-slate-700 hover:text-[#FE7251] rounded-lg hover:bg-slate-50 transition-colors"
            >
              {t("nav_home", "Home")}
            </Link>
            <Link
              href="/apply"
              className="px-3 py-2 text-xs font-semibold text-slate-700 hover:text-[#FE7251] rounded-lg hover:bg-slate-50 transition-colors"
            >
              {t("nav_approvals", "Approvals Directory")}
            </Link>
            <Link
              href={authHref("/dashboard/kya")}
              className="px-3 py-2 text-xs font-semibold text-slate-700 hover:text-[#FE7251] rounded-lg hover:bg-slate-50 transition-colors"
            >
              {t("nav_kya", "Know Your Approvals")}
            </Link>
            <Link
              href={authHref("/dashboard/dag")}
              className="px-3 py-2 text-xs font-semibold text-slate-700 hover:text-[#FE7251] rounded-lg hover:bg-slate-50 transition-colors"
            >
              {t("nav_track", "Track Approvals")}
            </Link>
            <Link
              href={authHref("/dashboard/grievances")}
              className="px-3 py-2 text-xs font-semibold text-slate-700 hover:text-[#FE7251] rounded-lg hover:bg-slate-50 transition-colors"
            >
              {t("nav_help", "Help & Support")}
            </Link>
          </nav>

          <div className="hidden sm:flex items-center space-x-3">
            <NotificationBell />
            {user ? (
              <Link
                href={user.role === "officer" ? "/dashboard/officer-workspace" : "/dashboard"}
                className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-[#FE7251] hover:bg-[#E85E3E] text-white font-medium text-xs uppercase tracking-wider shadow-xs transition-colors cursor-pointer"
                title="Go to your business control center"
              >
                <Briefcase className="w-4 h-4 text-white" />
                <span>{t("my_business", "MY BUSINESS")}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse ml-1" />
              </Link>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  href="/login"
                  className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs uppercase tracking-wider transition-colors cursor-pointer"
                  title="Sign In to your business control center"
                >
                  <Briefcase className="w-4 h-4 text-[#FE7251]" />
                  <span>{t("sign_in", "Sign In")}</span>
                </Link>

                <Link
                  href="/signup"
                  className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-[#FE7251] hover:bg-[#E85E3E] text-white font-medium text-xs uppercase tracking-wider shadow-xs transition-colors cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5 text-white" />
                  <span>{t("register", "Register")}</span>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Controls */}
          <div className="flex sm:hidden items-center space-x-2">
            <Link
              href={authHref("/dashboard")}
              className="px-3 py-1.5 rounded-lg bg-[#FE7251] text-white text-xs font-semibold flex items-center gap-1.5"
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>{t("my_business", "MY BUSINESS")}</span>
            </Link>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5 text-slate-700" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="sm:hidden bg-white border-t border-slate-200 px-4 py-4 space-y-3 shadow-md">
          <Link
            href={user ? (user.role === "officer" ? "/dashboard/officer-workspace" : "/dashboard") : "/login?redirect=%2Fdashboard"}
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-xs font-semibold text-slate-800 hover:text-[#FE7251]"
          >
            {t("header.my_business_portal", "My Business Portal")}
          </Link>
          <Link
            href={authHref("/dashboard/caf")}
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-xs font-medium text-slate-600 hover:text-slate-900"
          >
            {t("header.unified_caf", "Unified Common Application (CAF)")}
          </Link>
          <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
            {!user ? (
              <>
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 py-2 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-center text-xs font-medium text-slate-700"
                >
                  {t("sign_in", "Sign In")}
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 py-2 px-3 rounded-lg bg-[#FE7251] hover:bg-[#E85E3E] text-center text-xs font-semibold text-white"
                >
                  {t("register", "Register")}
                </Link>
              </>
            ) : (
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-2 px-3 rounded-lg bg-[#FE7251] hover:bg-[#E85E3E] text-center text-xs font-semibold text-white"
              >
                {t("header.go_dashboard", "Go to Dashboard")}
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

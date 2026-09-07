"use client";

import React, { useState } from "react";
import Link from "next/link";
import { LogIn, UserPlus, Menu, X } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t } = useLanguage();

  return (
    <header className="sticky top-0 z-40 w-full bg-[#16060E] text-white border-b border-[#36101E] shadow-md shadow-black/20">
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
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#FE7251]/15 text-[#FFCA7C] border border-[#FE7251]/30 uppercase tracking-wider">
                  {t("nav.portal_badge")}
                </span>
              </div>
              <span className="text-[11px] font-medium text-[#E0C7BC] tracking-wide">
                {t("nav.single_window")} • Govt. of Maharashtra
              </span>
            </div>
          </Link>

          {/* Desktop Right: Login & Signup */}
          <div className="hidden sm:flex items-center space-x-3">
            <Link
              href="/login"
              className="inline-flex items-center space-x-2 px-4.5 py-2.5 rounded-xl bg-[#250C19]/90 hover:bg-[#381326] border border-[#521C35] text-[#FFE8DE] hover:text-white font-bold text-xs uppercase tracking-wider shadow-sm transition-all duration-150 cursor-pointer"
            >
              <LogIn className="w-4 h-4 text-[#FE7251]" />
              <span>{t("nav.investor_login")}</span>
            </Link>

            <Link
              href="/signup"
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#9B2A48] via-[#FE7251] to-[#FE7251] hover:from-[#82213B] hover:to-[#E85E3E] text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-[#9B2A48]/30 transition-all duration-150 cursor-pointer hover:scale-[1.02]"
            >
              <UserPlus className="w-4 h-4 text-white" />
              <span>{t("nav.get_started")}</span>
            </Link>
          </div>

          {/* Mobile menu trigger & login */}
          <div className="flex sm:hidden items-center space-x-2">
            <Link
              href="/login"
              className="px-3.5 py-1.5 rounded-lg border border-[#521C35] bg-[#250C19] text-[#FFE8DE] text-xs font-bold"
            >
              {t("nav.investor_login")}
            </Link>
            <Link
              href="/signup"
              className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#9B2A48] to-[#FE7251] text-white text-xs font-black"
            >
              {t("nav.get_started")}
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}

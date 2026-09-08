"use client";

import React, { useState } from "react";
import Link from "next/link";
import { LogIn, UserPlus, Menu, X, LayoutDashboard, ShieldCheck, User } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t } = useLanguage();
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full bg-[#16060E] text-white border-b border-[#36101E] shadow-md shadow-black/20">
      {/* Main Navigation Bar */}
      <div className="w-full px-4 sm:px-6 lg:px-8">
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

          {/* Center Navigation Links (Desktop) */}
          <nav className="hidden md:flex items-center space-x-6 text-xs font-bold text-[#E0C7BC]">
            <Link href="/dashboard/kya" className="hover:text-[#FFCA7C] transition-colors">
              {t("dash.kya", "Know Your Approvals")}
            </Link>
            <Link href="/dashboard/dag" className="hover:text-[#FFCA7C] transition-colors">
              {t("dash.dag", "Parallel Clearance DAG")}
            </Link>
            <Link href="/dashboard/sla" className="hover:text-[#FFCA7C] transition-colors">
              {t("dash.sla", "SLA Tracker")}
            </Link>
            <Link href="/dashboard/grievances" className="hover:text-[#FFCA7C] transition-colors">
              {t("grievances.title", "Grievances")}
            </Link>
          </nav>

          {/* Desktop Right: Login & Signup OR Dashboard Link */}
          <div className="hidden sm:flex items-center space-x-3">
            {user ? (
              <div className="flex items-center space-x-3">
                <Link
                  href={user.role === "officer" ? "/dashboard/officer-workspace" : "/dashboard"}
                  className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#9B2A48] via-[#FE7251] to-[#FE7251] hover:from-[#82213B] hover:to-[#E85E3E] text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-[#9B2A48]/30 transition-all cursor-pointer hover:scale-[1.02]"
                >
                  <LayoutDashboard className="w-4 h-4 text-white" />
                  <span>
                    {user.role === "officer" ? "Officer Console" : t("nav.dashboard", "Control Center")}
                  </span>
                </Link>
              </div>
            ) : (
              <>
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
              </>
            )}
          </div>

          {/* Mobile Menu Hamburger */}
          <div className="flex md:hidden items-center space-x-2">
            {user ? (
              <Link
                href="/dashboard"
                className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#9B2A48] to-[#FE7251] text-white text-xs font-bold"
              >
                Dashboard
              </Link>
            ) : (
              <Link
                href="/login"
                className="px-3 py-1.5 rounded-lg bg-[#250C19] border border-[#521C35] text-[#FFE8DE] text-xs font-bold"
              >
                Login
              </Link>
            )}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-[#E0C7BC] hover:text-white hover:bg-[#250C19]"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5 text-[#FFCA7C]" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#190710] border-t border-[#36101E] px-4 py-4 space-y-3">
          <Link
            href="/dashboard/kya"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-xs font-bold text-[#E0C7BC] hover:text-white"
          >
            {t("dash.kya", "Know Your Approvals (KYA)")}
          </Link>
          <Link
            href="/dashboard/vault"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-xs font-bold text-[#E0C7BC] hover:text-white"
          >
            {t("dash.vault", "Document Vault & OCR")}
          </Link>
          <Link
            href="/dashboard/dag"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-xs font-bold text-[#E0C7BC] hover:text-white"
          >
            {t("dash.dag", "Parallel Clearance DAG")}
          </Link>
          <Link
            href="/dashboard/sla"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-xs font-bold text-[#E0C7BC] hover:text-white"
          >
            {t("dash.sla", "SLA Tracker & Deemed Approvals")}
          </Link>
          <Link
            href="/dashboard/grievances"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-xs font-bold text-[#E0C7BC] hover:text-white"
          >
            {t("grievances.title", "Grievance Desk")}
          </Link>
        </div>
      )}
    </header>
  );
}


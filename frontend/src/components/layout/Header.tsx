"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  Building2,
  Flame,
  Factory,
  ShieldCheck,
  Zap,
  FileCheck2,
  Search,
  Compass,
  Award,
  LogIn,
  Menu,
  X,
  ArrowRight,
  Landmark,
} from "lucide-react";

interface ApprovalCategory {
  title: string;
  department: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  link: string;
}

const approvalCategories: Record<string, ApprovalCategory[]> = {
  "Key Industrial Approvals": [
    {
      title: "MIDC Land & Plan Approval",
      department: "Maharashtra Industrial Development Corp.",
      icon: Building2,
      description: "Plot allotment, building plan approvals, possession certificates & NOCs.",
      link: "/approvals/midc",
    },
    {
      title: "MPCB Environmental Consent",
      department: "Maharashtra Pollution Control Board",
      icon: Factory,
      description: "Consent to Establish (CTE) & Consent to Operate (CTO) categorizations.",
      link: "/approvals/mpcb",
    },
    {
      title: "Fire Safety & Provisional NOC",
      department: "State Fire & Emergency Services",
      icon: Flame,
      description: "Industrial fire safety clearances, provisional & final occupancy NOC.",
      link: "/approvals/fire",
    },
    {
      title: "Factory Registration (DISH)",
      department: "Directorate of Industrial Safety & Health",
      icon: ShieldCheck,
      description: "Factory license, safety plans, boiler registrations and worker compliance.",
      link: "/approvals/dish",
    },
  ],
  "Utility & Infrastructure": [
    {
      title: "Power Feasibility & HT/LT Load",
      department: "MSEDCL / Energy Dept",
      icon: Zap,
      description: "Sanction load, transformer approvals and electrical inspectorate NOC.",
      link: "/approvals/energy",
    },
    {
      title: "Water Supply Connection",
      department: "MIDC / Local Municipal Corp",
      icon: Landmark,
      description: "Bulk industrial water allotment, pipeline connection and drainage sanction.",
      link: "/approvals/water",
    },
    {
      title: "Central Statutory Clearances",
      department: "DPIIT / MoEFCC / PESO",
      icon: FileCheck2,
      description: "Explosives NOC, central environmental clearances, and foreign investment clearances.",
      link: "/approvals/central",
    },
  ],
};

export default function Header() {
  const [approvalsOpen, setApprovalsOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setApprovalsOpen(true);
  };

  const handleMouseLeave = () => {
    timerRef.current = setTimeout(() => {
      setApprovalsOpen(false);
    }, 120);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

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
            {/* Mega-menu: Approvals */}
            <div
              className="relative"
              ref={dropdownRef}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <button
                type="button"
                className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  approvalsOpen
                    ? "text-indigo-600 bg-indigo-50/80"
                    : "text-slate-700 hover:text-indigo-600 hover:bg-slate-50"
                }`}
                onClick={() => setApprovalsOpen(!approvalsOpen)}
                aria-expanded={approvalsOpen}
              >
                <span>Approvals</span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-150 ${
                    approvalsOpen ? "rotate-180 text-indigo-600" : "text-slate-400"
                  }`}
                />
              </button>

              {/* Framer Motion Mega Dropdown (<= 200ms transition) */}
              <AnimatePresence>
                {approvalsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.99 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.99 }}
                    transition={{ duration: 0.18, ease: "easeOut" }}
                    className="absolute left-1/2 -translate-x-1/2 mt-1 w-[820px] bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 z-50"
                  >
                    <div className="grid grid-cols-2 gap-6">
                      {Object.entries(approvalCategories).map(([categoryName, items]) => (
                        <div key={categoryName} className="space-y-3">
                          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                              {categoryName}
                            </h4>
                          </div>
                          <div className="space-y-2">
                            {items.map((item) => {
                              const IconComponent = item.icon;
                              return (
                                <Link
                                  key={item.title}
                                  href={item.link}
                                  onClick={() => setApprovalsOpen(false)}
                                  className="group flex items-start p-2.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200/80 transition-all duration-150"
                                >
                                  <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white flex items-center justify-center shrink-0 mt-0.5 transition-colors">
                                    <IconComponent className="w-4 h-4" />
                                  </div>
                                  <div className="ml-3">
                                    <p className="text-sm font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors">
                                      {item.title}
                                    </p>
                                    <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                                      {item.description}
                                    </p>
                                    <span className="inline-block text-[10px] font-medium text-slate-400 mt-0.5">
                                      {item.department}
                                    </span>
                                  </div>
                                </Link>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Mega-menu footer banner */}
                    <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between bg-slate-50 -mx-6 -mb-6 p-4 rounded-b-2xl">
                      <div className="flex items-center space-x-2">
                        <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
                        <span className="text-xs text-slate-600 font-medium">
                          Single Common Application Form (CAF) for all 40+ departments
                        </span>
                      </div>
                      <Link
                        href="/know-your-approvals"
                        onClick={() => setApprovalsOpen(false)}
                        className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center space-x-1"
                      >
                        <span>Run Approval Wizard</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Know Your Approvals */}
            <Link
              href="/know-your-approvals"
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:text-indigo-600 hover:bg-slate-50 transition-colors"
            >
              <Compass className="w-4 h-4 text-indigo-500" />
              <span>Know Your Approvals</span>
            </Link>

            {/* Track Status */}
            <Link
              href="/track-status"
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:text-indigo-600 hover:bg-slate-50 transition-colors"
            >
              <Search className="w-4 h-4 text-indigo-500" />
              <span>Track Status</span>
            </Link>

            {/* Schemes */}
            <Link
              href="/schemes"
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:text-indigo-600 hover:bg-slate-50 transition-colors"
            >
              <Award className="w-4 h-4 text-indigo-500" />
              <span>Schemes</span>
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
            <div className="font-semibold text-xs text-slate-400 px-3 uppercase tracking-wider">
              Approvals & Departments
            </div>
            <div className="pl-3 pr-2 space-y-1">
              <Link
                href="/approvals/midc"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-1.5 text-sm text-slate-700 hover:text-indigo-600 font-medium"
              >
                • MIDC Land & Clearances
              </Link>
              <Link
                href="/approvals/mpcb"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-1.5 text-sm text-slate-700 hover:text-indigo-600 font-medium"
              >
                • MPCB Pollution Consents (CTE/CTO)
              </Link>
              <Link
                href="/approvals/fire"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-1.5 text-sm text-slate-700 hover:text-indigo-600 font-medium"
              >
                • Fire Safety Provisional NOC
              </Link>
              <Link
                href="/approvals/dish"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-1.5 text-sm text-slate-700 hover:text-indigo-600 font-medium"
              >
                • DISH Factory & Labor Licenses
              </Link>
            </div>

            <div className="pt-2 border-t border-slate-100 space-y-1">
              <Link
                href="/know-your-approvals"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-slate-800 hover:bg-slate-50"
              >
                <Compass className="w-4 h-4 text-indigo-500" />
                <span>Know Your Approvals</span>
              </Link>
              <Link
                href="/track-status"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-slate-800 hover:bg-slate-50"
              >
                <Search className="w-4 h-4 text-indigo-500" />
                <span>Track Status</span>
              </Link>
              <Link
                href="/schemes"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-slate-800 hover:bg-slate-50"
              >
                <Award className="w-4 h-4 text-indigo-500" />
                <span>Schemes & Subsidies</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

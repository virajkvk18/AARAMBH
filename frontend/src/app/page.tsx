"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Compass,
  Search,
  ArrowRight,
  Layers,
  Clock,
  ShieldCheck,
  RefreshCw,
  MessageSquareCheck,
  Sparkles,
  Building2,
  Factory,
  Flame,
  Droplets,
  Zap,
  FileCheck2,
  CheckCircle2,
  ChevronRight,
  Landmark,
  BadgeCheck,
} from "lucide-react";

// --- Mock Data Arrays ---

interface BenefitItem {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  tag: string;
}

const benefitsData: BenefitItem[] = [
  {
    id: "all-in-one",
    title: "All Approvals in One Place",
    description:
      "A single integrated Common Application Form (CAF) replacing dozens of disparate departmental portals across Maharashtra.",
    icon: Layers,
    tag: "Unified Single Window",
  },
  {
    id: "status-tracking",
    title: "Real-Time Status Tracking",
    description:
      "Stage-by-stage transparent milestone tracking with SLA timers and instant SMS/Email notifications on application progress.",
    icon: Clock,
    tag: "100% Transparent",
  },
  {
    id: "secure-vault",
    title: "Secure Document Repository (AI-Verified)",
    description:
      "DigiLocker-integrated digital locker with automated OCR pre-validation, eliminating duplicate uploads and document errors.",
    icon: ShieldCheck,
    tag: "DigiLocker & OCR",
  },
  {
    id: "easy-renewals",
    title: "Easy Renewals",
    description:
      "Automated advance alerts 90 days before clearance expiry with pre-populated one-click renewal applications.",
    icon: RefreshCw,
    tag: "Zero Downtime",
  },
  {
    id: "fast-resolution",
    title: "Fast Query & Grievance Resolution",
    description:
      "Direct interactive query response desk with time-bound statutory redressal under the Maharashtra Right to Public Services Act.",
    icon: MessageSquareCheck,
    tag: "Time-Bound SLA",
  },
  {
    id: "ai-kya",
    title: "AI-Powered Know Your Approvals",
    description:
      "Intelligent rule engine dynamically determines the exact pre-establishment, pre-operational clearances and incentives tailored to your enterprise.",
    icon: Sparkles,
    tag: "Smart Clearance Wizard",
  },
];

interface StatCounter {
  id: string;
  targetValue: number;
  prefix?: string;
  suffix?: string;
  label: string;
  sublabel: string;
}

const statsData: StatCounter[] = [
  {
    id: "avg-clearance",
    targetValue: 28,
    suffix: " Days",
    label: "28-Day Avg Clearance",
    sublabel: "Across all statutory industrial clearances",
  },
  {
    id: "depts-integrated",
    targetValue: 6,
    suffix: " Key Departments",
    label: "6 Departments Integrated",
    sublabel: "MIDC, MPCB, Fire, DISH, Energy & Water",
  },
  {
    id: "pre-validation",
    targetValue: 100,
    prefix: "",
    suffix: "%",
    label: "Zero-Rejection Pre-Validation",
    sublabel: "AI pre-checks eliminate form errors upfront",
  },
  {
    id: "investments",
    targetValue: 14000,
    prefix: "₹",
    suffix: " Cr+",
    label: "Investments Facilitated",
    sublabel: "Fast-tracked projects across industrial zones",
  },
];

interface KeyApproval {
  id: string;
  name: string;
  department: string;
  icon: React.ComponentType<{ className?: string }>;
  slaDays: number;
  category: "Pre-Establishment" | "Pre-Operation" | "Utility";
  description: string;
}

const keyApprovalsData: KeyApproval[] = [
  {
    id: "midc-land",
    name: "MIDC Land Allotment & Plan Approval",
    department: "Maharashtra Industrial Development Corporation (MIDC)",
    icon: Building2,
    slaDays: 15,
    category: "Pre-Establishment",
    description:
      "Direct plot allotment, building layout approval, and provisional possession across Maharashtra industrial estates.",
  },
  {
    id: "mpcb-cte",
    name: "MPCB Consent to Establish (CTE)",
    department: "Maharashtra Pollution Control Board (MPCB)",
    icon: Factory,
    slaDays: 21,
    category: "Pre-Establishment",
    description:
      "Statutory environmental consent categorization (Red/Orange/Green/White) before commencement of industrial construction.",
  },
  {
    id: "fire-noc",
    name: "Provisional Fire Safety NOC",
    department: "State Directorate of Fire & Emergency Services",
    icon: Flame,
    slaDays: 14,
    category: "Pre-Establishment",
    description:
      "Fire system compliance inspection, high-rise clearance, and provisional firefighting system installation certificate.",
  },
  {
    id: "water-supply",
    name: "Bulk Industrial Water Supply Allocation",
    department: "MIDC / Water Resources Department",
    icon: Droplets,
    slaDays: 7,
    category: "Utility",
    description:
      "Pipeline connectivity feasibility, raw & treated water volume quota reservation for industrial production.",
  },
  {
    id: "dish-license",
    name: "Factory Registration & Safety License (DISH)",
    department: "Directorate of Industrial Safety & Health (DISH)",
    icon: ShieldCheck,
    slaDays: 10,
    category: "Pre-Operation",
    description:
      "Industrial factory license approval, boiler registration, and occupational worker safety compliance sign-off.",
  },
  {
    id: "power-feasi",
    name: "HT/LT Power Sanction Feasibility",
    department: "MSEDCL / Maharashtra State Electricity Distribution",
    icon: Zap,
    slaDays: 7,
    category: "Utility",
    description:
      "High Tension / Low Tension electrical grid load feasibility, transformer installation NOC, and energized meter connection.",
  },
];

// --- Count-Up Animation Component ---
function AnimatedStat({ stat }: { stat: StatCounter }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const duration = 1600; // 1.6 seconds count-up duration

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // Ease out cubic
      const easeOutProgress = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(easeOutProgress * stat.targetValue));

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        setCount(stat.targetValue);
      }
    };

    requestAnimationFrame(step);
  }, [stat.targetValue]);

  return (
    <div className="p-6 bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between">
      <div>
        <div className="text-3xl sm:text-4xl font-black text-[#0F172A] tracking-tight">
          {stat.prefix}
          {count.toLocaleString()}
          {stat.suffix}
        </div>
        <div className="mt-2 text-sm font-bold text-slate-800">{stat.label}</div>
      </div>
      <p className="mt-2 text-xs text-slate-500 leading-normal">{stat.sublabel}</p>
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="w-full bg-[#F8FAFC]">
      {/* 1. HERO SECTION */}
      <section className="relative bg-gradient-to-b from-[#0F172A] via-[#1E293B] to-[#0F172A] text-white py-16 sm:py-24 overflow-hidden border-b border-slate-800">
        {/* Subtle grid pattern overlay */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#4F46E5_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl">
            {/* Gov Badge */}
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-indigo-950/80 border border-indigo-500/40 text-indigo-300 text-xs font-semibold mb-6 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Maharashtra Single Window Clearance System (AARAMBH)</span>
            </div>

            {/* Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Explore, Apply and Get all Industrial Approvals Required in Maharashtra
            </h1>

            {/* Subheadline */}
            <p className="mt-5 text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl font-normal">
              AARAMBH unifies and orchestrates end-to-end statutory clearances across Maharashtra state departments. Experience parallel departmental reviews, AI-verified document handling, and statutory SLA-backed deemed approvals in one transparent window.
            </p>

            {/* CTAs */}
            <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <Link
                href="/dashboard/kya"
                className="inline-flex items-center justify-center space-x-2 px-7 py-3.5 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 transition-all duration-150 hover:-translate-y-0.5"
              >
                <Compass className="w-4 h-4" />
                <span>Know Your Approvals</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>

              <Link
                href="/dashboard/sla"
                className="inline-flex items-center justify-center space-x-2 px-6 py-3.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-100 font-semibold text-sm border border-slate-700 hover:border-slate-600 transition-all duration-150"
              >
                <Search className="w-4 h-4 text-slate-400" />
                <span>Track Application Status</span>
              </Link>
            </div>

            {/* Trust highlights */}
            <div className="mt-8 pt-6 border-t border-slate-800/80 flex flex-wrap items-center gap-6 text-xs text-slate-400">
              <div className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Zero Form Re-filing</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Deemed Approval Guarantee</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>DigiLocker Integrated Vault</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. STATS COUNTER ROW */}
      <section className="relative -mt-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statsData.map((stat) => (
            <AnimatedStat key={stat.id} stat={stat} />
          ))}
        </div>
      </section>

      {/* 3. BENEFITS GRID (How AARAMBH Accelerates Your Enterprise) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold uppercase tracking-wider mb-3">
            <BadgeCheck className="w-3.5 h-3.5 text-indigo-600" />
            <span>Single Window Advantages</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-[#0F172A] tracking-tight">
            How does AARAMBH help you?
          </h2>
          <p className="text-sm text-slate-600 mt-3 leading-relaxed">
            Eliminating procedural hurdles with an intelligent digital infrastructure engineered specifically for Maharashtra&apos;s industrial ecosystem.
          </p>
        </div>

        {/* 6 Icon Cards in Responsive Grid (3 cols desktop, 1 col mobile) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefitsData.map((benefit) => {
            const IconComp = benefit.icon;
            return (
              <div
                key={benefit.id}
                className="bg-white rounded-2xl p-7 border border-slate-200/90 shadow-xs hover:shadow-lg hover:border-indigo-200 transition-all duration-200 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-12 h-12 rounded-xl bg-indigo-50 text-[#4F46E5] group-hover:bg-[#4F46E5] group-hover:text-white flex items-center justify-center transition-colors duration-200 shadow-xs">
                      <IconComp className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-semibold px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 group-hover:bg-indigo-50 group-hover:text-indigo-700 transition-colors">
                      {benefit.tag}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-[#0F172A] group-hover:text-indigo-600 transition-colors">
                    {benefit.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-600 mt-2.5 leading-relaxed">
                    {benefit.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center text-xs font-semibold text-indigo-600 group-hover:text-indigo-800">
                  <span>Learn more</span>
                  <ChevronRight className="w-3.5 h-3.5 ml-1 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. "KEY APPROVALS" PREVIEW GRID */}
      <section className="bg-white border-y border-slate-200 py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wider mb-2">
                <Landmark className="w-3.5 h-3.5 text-slate-600" />
                <span>Statutory Clearances Directory</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
                Key Industrial Approvals
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                Apply directly to major Maharashtra regulatory bodies through the common gateway.
              </p>
            </div>

            <span className="inline-flex items-center space-x-1.5 text-sm font-semibold text-slate-400 cursor-not-allowed" aria-disabled="true">
              <span>Approval directory unavailable in this demo</span>
            </span>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {keyApprovalsData.map((approval) => {
              const IconComp = approval.icon;
              return (
                <div
                  key={approval.id}
                  className="bg-[#F8FAFC] rounded-2xl p-6 border border-slate-200/90 hover:border-indigo-300 hover:shadow-md transition-all duration-200 flex flex-col justify-between"
                >
                  <div>
                    {/* Header: Icon + Category Badge + SLA */}
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 text-indigo-600 flex items-center justify-center shrink-0 shadow-xs">
                        <IconComp className="w-5 h-5" />
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                          {approval.category}
                        </span>
                        <span className="text-[11px] font-semibold text-[#059669]">
                          SLA: {approval.slaDays} Working Days
                        </span>
                      </div>
                    </div>

                    {/* Title & Dept */}
                    <h3 className="text-base font-bold text-[#0F172A] leading-snug">
                      {approval.name}
                    </h3>
                    <p className="text-[11px] font-medium text-slate-500 mt-1 line-clamp-1">
                      {approval.department}
                    </p>

                    {/* Description */}
                    <p className="text-xs text-slate-600 mt-3 leading-relaxed">
                      {approval.description}
                    </p>
                  </div>

                  {/* Footer Link */}
                  <div className="mt-6 pt-4 border-t border-slate-200 flex items-center justify-between">
                    <span className="text-[11px] font-medium text-slate-400">
                      Online Application
                    </span>
                    <span className="text-xs font-semibold text-slate-400" aria-disabled="true">
                      Details unavailable in this demo
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. CALL TO ACTION / WIZARD BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-gradient-to-r from-[#0F172A] via-[#1E293B] to-[#0F172A] rounded-3xl p-8 sm:p-12 text-white border border-slate-800 shadow-xl relative overflow-hidden">
          <div className="absolute right-0 bottom-0 opacity-10 translate-x-12 translate-y-12 pointer-events-none">
            <Compass className="w-96 h-96 text-indigo-400" />
          </div>

          <div className="max-w-2xl relative z-10">
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">
              Unsure which approvals you need?
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-2 text-white">
              Launch the Intelligent Know Your Approvals (KYA) Wizard
            </h2>
            <p className="mt-3 text-sm text-slate-300 leading-relaxed">
              Answer 7 simple questions about your project scope, investment, plot dimensions, and utilities to generate your customized compliance roadmap and eligible subsidies.
            </p>
            <div className="mt-8">
              <Link
                href="/dashboard/kya"
                className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white font-semibold text-sm shadow-md transition-all duration-150"
              >
                <Sparkles className="w-4 h-4 text-indigo-200" />
                <span>Start Free KYA Assessment</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

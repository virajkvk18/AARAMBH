"use client";

import React, { useState } from "react";
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
  CheckCircle2,
  ChevronRight,
  Landmark,
  BadgeCheck,
  Play,
  PhoneCall,
  HelpCircle,
  MessageCircle,
  Cpu,
  Car,
  Pill,
  Shirt,
  Wheat,
  Sun,
  FlaskConical,
  Truck,
  Dna,
  Hotel,
  X,
  ExternalLink,
  FileCheck,
  ChevronDown,
} from "lucide-react";

// --- Sector Data (12 Sectors from Image 5) ---
interface SectorItem {
  id: string;
  name: string;
  approvalsCount: number;
  icon: React.ComponentType<{ className?: string }>;
  tag: string;
  categoryKey: string;
}

const sectorsData: SectorItem[] = [
  {
    id: "manufacturing",
    name: "Manufacturing & Heavy Engineering",
    approvalsCount: 14,
    icon: Factory,
    tag: "MIDC / MPCB / DISH",
    categoryKey: "manufacturing",
  },
  {
    id: "automobile",
    name: "Automobile & Auto Components",
    approvalsCount: 12,
    icon: Car,
    tag: "Pune / Chakan / Aurangabad",
    categoryKey: "automotive",
  },
  {
    id: "pharma",
    name: "Pharmaceuticals & Healthcare",
    approvalsCount: 16,
    icon: Pill,
    tag: "FDA / MPCB / Toxic Clearance",
    categoryKey: "pharma",
  },
  {
    id: "food-agro",
    name: "Food Processing & Agro Industries",
    approvalsCount: 11,
    icon: Wheat,
    tag: "FSSAI / Pollution / Water",
    categoryKey: "food",
  },
  {
    id: "textile",
    name: "Textile, Apparel & Technical Garments",
    approvalsCount: 10,
    icon: Shirt,
    tag: "Solapur / Ichalkaranji / MIDC",
    categoryKey: "textile",
  },
  {
    id: "chemical",
    name: "Chemicals & Petrochemicals",
    approvalsCount: 18,
    icon: FlaskConical,
    tag: "Taloja / Roha / Hazardous",
    categoryKey: "chemical",
  },
  {
    id: "renewable-ev",
    name: "Renewable Energy & EV Ecosystem",
    approvalsCount: 9,
    icon: Sun,
    tag: "MEDA / MSEDCL / Battery",
    categoryKey: "energy",
  },
  {
    id: "it-ites",
    name: "IT, ITES & Data Centers",
    approvalsCount: 8,
    icon: Cpu,
    tag: "Navi Mumbai / Hinjewadi",
    categoryKey: "it",
  },
  {
    id: "logistics",
    name: "Logistics, Warehousing & Cold Chain",
    approvalsCount: 11,
    icon: Truck,
    tag: "JNPT / Bhiwandi / MIHAN",
    categoryKey: "logistics",
  },
  {
    id: "biotech",
    name: "Biotechnology & Life Sciences",
    approvalsCount: 15,
    icon: Dna,
    tag: "Bio-Safety / Environmental",
    categoryKey: "biotech",
  },
  {
    id: "electronics",
    name: "Electronics System Design (ESDM)",
    approvalsCount: 10,
    icon: Zap,
    tag: "EMC / Semiconductor Hub",
    categoryKey: "electronics",
  },
  {
    id: "tourism",
    name: "Tourism, Hospitality & Eco-Resorts",
    approvalsCount: 12,
    icon: Hotel,
    tag: "MTDC / CRZ / Local Body",
    categoryKey: "hospitality",
  },
];

// --- Benefits Data (6 items matching Image 2) ---
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
      "Stage-by-stage transparent milestone tracking with statutory SLA countdown timers and automated SMS/Email notifications.",
    icon: Clock,
    tag: "100% Transparent",
  },
  {
    id: "secure-vault",
    title: "Secure Document Repository",
    description:
      "DigiLocker-integrated digital locker with automated AI extraction and pre-validation, eliminating duplicate uploads.",
    icon: ShieldCheck,
    tag: "DigiLocker & AI OCR",
  },
  {
    id: "easy-renewals",
    title: "Easy Renewals",
    description:
      "Automated advance alerts 90 days prior to license expiry with one-click pre-populated renewal submissions.",
    icon: RefreshCw,
    tag: "Zero Downtime",
  },
  {
    id: "fast-resolution",
    title: "Fast Query & Grievance Resolution",
    description:
      "Direct interactive query desk with time-bound statutory redressal under the Maharashtra Right to Public Services Act.",
    icon: MessageSquareCheck,
    tag: "Time-Bound SLA",
  },
  {
    id: "ai-kya",
    title: "AI-Powered Know Your Approvals",
    description:
      "Intelligent rule engine dynamically determines the exact pre-establishment, operational clearances and incentives.",
    icon: Sparkles,
    tag: "Smart Clearance Wizard",
  },
];

// --- Key Approvals Data (Matching Image 3) ---
interface KeyApproval {
  id: string;
  name: string;
  department: string;
  icon: React.ComponentType<{ className?: string }>;
  slaDays: number;
  category: "Pre-Establishment" | "Pre-Operation" | "Utility";
  description: string;
  href: string;
}

const keyApprovalsData: KeyApproval[] = [
  {
    id: "midc-land",
    name: "MIDC Land Allotment & Building Plan Approval",
    department: "Maharashtra Industrial Development Corporation (MIDC)",
    icon: Building2,
    slaDays: 15,
    category: "Pre-Establishment",
    description:
      "Direct plot allotment, building blueprint approval, and provisional possession across Maharashtra industrial estates.",
    href: "/dashboard/prevalidation",
  },
  {
    id: "mpcb-cte",
    name: "MPCB Consent to Establish (CTE) & Operate (CTO)",
    department: "Maharashtra Pollution Control Board (MPCB)",
    icon: Factory,
    slaDays: 21,
    category: "Pre-Establishment",
    description:
      "Statutory environmental consent categorization (Red/Orange/Green/White) before commencement of industrial construction.",
    href: "/dashboard/prevalidation",
  },
  {
    id: "fire-noc",
    name: "Provisional Fire Safety & Prevention NOC",
    department: "Directorate of Maharashtra Fire Services",
    icon: Flame,
    slaDays: 14,
    category: "Pre-Establishment",
    description:
      "Fire safety system compliance inspection, high-hazard factory clearance, and provisional firefighting certificate.",
    href: "/dashboard/prevalidation",
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
    href: "/dashboard/prevalidation",
  },
];

// --- Industrial Zones Data (Matching Image 4) ---
const industrialZones = [
  {
    id: "pune",
    name: "Pune Industrial Belt",
    hubs: "Chakan, Ranjangaon, Talegaon, Hinjewadi",
    focus: "Auto, EV, Engineering & IT Hub",
    plotsAvailable: "1,240+ Acres",
  },
  {
    id: "mmr",
    name: "Mumbai Metropolitan Region",
    hubs: "TTC, Taloja, Thane-Belapur, JNPT SEZ",
    focus: "Chemicals, Pharma, Data Centers & Logistics",
    plotsAvailable: "850+ Acres",
  },
  {
    id: "aurangabad",
    name: "AURIC Smart City (Chh. Sambhajinagar)",
    hubs: "Shendra & Bidkin DMIC Nodes",
    focus: "Smart Manufacturing, Electronics & Defense",
    plotsAvailable: "2,100+ Acres",
  },
  {
    id: "nagpur",
    name: "Nagpur & Vidarbha Zone",
    hubs: "MIHAN SEZ, Butibori Industrial Area",
    focus: "Aviation, Defense, Logistics & Textiles",
    plotsAvailable: "1,600+ Acres",
  },
];

export default function HomePage() {
  // State for search filter dropdown
  const [searchCategory, setSearchCategory] = useState("All Approvals");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSector, setSelectedSector] = useState<SectorItem | null>(null);
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [helpDrawerOpen, setHelpDrawerOpen] = useState(false);

  return (
    <div className="w-full bg-[#F8FAFC] min-h-screen">
      {/* 1. HERO SECTION (Executive Deep Navy & Emerald Theme) */}
      <section className="relative bg-gradient-to-b from-[#0A1628] via-[#0E1F38] to-[#0A1628] bg-topo-pattern text-white pt-14 pb-20 overflow-hidden border-b border-slate-800">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {/* Maharashtra Gov Single Window Badge */}
            <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-6 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>AARAMBH • Government of Maharashtra Single Window Portal</span>
            </div>

            {/* Main Hero Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-5xl font-black tracking-tight text-white leading-tight">
              Explore, Apply and Get all Approvals Required to Start your Business in{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300">
                Maharashtra
              </span>
            </h1>

            {/* Sub-headline */}
            <p className="mt-5 text-base sm:text-lg text-slate-300 leading-relaxed max-w-3xl mx-auto font-normal">
              Unified digital gateway orchestrating statutory clearances across MIDC, MPCB, DISH, Fire Services, and MSEDCL with guaranteed SLA-backed deemed approvals.
            </p>

            {/* Unified Search Bar */}
            <div className="mt-9 max-w-3xl mx-auto bg-white rounded-2xl p-2 sm:p-2.5 shadow-2xl border border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 text-slate-800">
              {/* Category Dropdown */}
              <div className="relative shrink-0 sm:border-r sm:border-slate-200 sm:pr-3">
                <select
                  value={searchCategory}
                  onChange={(e) => setSearchCategory(e.target.value)}
                  className="w-full sm:w-auto bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-700 px-3 py-2.5 rounded-xl border-0 focus:ring-2 focus:ring-emerald-500 cursor-pointer appearance-none pr-8"
                >
                  <option value="All Approvals">All Approvals</option>
                  <option value="State Approvals">State Approvals (MH)</option>
                  <option value="Central Approvals">Central Approvals</option>
                  <option value="Government Schemes">Govt. Schemes & Subsidies</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* Search Text Input */}
              <div className="flex-1 flex items-center px-3">
                <Search className="w-4 h-4 text-slate-400 mr-2.5 shrink-0" />
                <input
                  type="text"
                  placeholder="Search for approvals, licences, registrations, services e.g. MIDC, MPCB CTE..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full text-xs sm:text-sm text-slate-900 placeholder-slate-400 bg-transparent border-0 focus:outline-none focus:ring-0"
                />
              </div>

              {/* Emerald Explore All Button */}
              <Link
                href="/dashboard/kya"
                className="inline-flex items-center justify-center space-x-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm tracking-wide shadow-md shadow-emerald-950/30 transition-all duration-150 shrink-0 hover:scale-[1.02]"
              >
                <span>EXPLORE ALL</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Secondary Callout Bar ("Click Here & Know Your Approvals") */}
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/dashboard/kya"
                className="inline-flex items-center space-x-2.5 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs sm:text-sm tracking-wider uppercase shadow-lg shadow-emerald-950/40 transition-all duration-150 hover:-translate-y-0.5 cursor-pointer"
              >
                <Compass className="w-4 h-4 text-white" />
                <span>Click Here & Know Your Approvals</span>
                <Sparkles className="w-4 h-4 text-amber-300" />
              </Link>
              <span className="text-xs text-slate-400 font-medium">
                Get a customized list of clearances in under 3 minutes
              </span>
            </div>

            {/* Popular Search Chips */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-300">
              <span className="text-slate-400 font-semibold">Popular Clearances:</span>
              {[
                { name: "MIDC Land Allotment", href: "/dashboard/prevalidation" },
                { name: "MPCB CTE", href: "/dashboard/prevalidation" },
                { name: "Fire NOC", href: "/dashboard/prevalidation" },
                { name: "DISH Factory License", href: "/dashboard/prevalidation" },
                { name: "HT Power Sanction", href: "/dashboard/dag" },
              ].map((chip) => (
                <Link
                  key={chip.name}
                  href={chip.href}
                  className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700/80 hover:border-emerald-500/40 hover:text-white transition-colors"
                >
                  {chip.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 2. BENEFITS SECTION */}
      <section className="py-16 sm:py-20 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-black uppercase tracking-widest mb-3">
              <BadgeCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>BENEFITS</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-[#0B1728] tracking-tight">
              How does AARAMBH help you?
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-2 max-w-2xl leading-relaxed">
              Eliminating procedural hurdles with an intelligent digital infrastructure engineered specifically for Maharashtra&apos;s industrial ecosystem.
            </p>
          </div>

          {/* Video CTA Button */}
          <button
            onClick={() => setVideoModalOpen(true)}
            className="inline-flex items-center space-x-2 px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white border border-slate-700 font-bold text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all duration-150 self-start md:self-auto cursor-pointer"
          >
            <Play className="w-4 h-4 fill-emerald-400 text-emerald-400" />
            <span>PLAY VIDEO TO KNOW MORE</span>
          </button>
        </div>

        {/* 6 Feature Cards with Emerald Circle Icons */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefitsData.map((benefit) => {
            const IconComp = benefit.icon;
            return (
              <div
                key={benefit.id}
                className="bg-white rounded-2xl p-7 border border-slate-200 shadow-xs hover:shadow-xl hover:border-emerald-400 transition-all duration-200 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    {/* Emerald Icon Circle */}
                    <div className="w-13 h-13 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white flex items-center justify-center transition-colors duration-200 shadow-xs">
                      <IconComp className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-semibold px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 group-hover:bg-emerald-50 group-hover:text-emerald-700 transition-colors">
                      {benefit.tag}
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-[#0B1728] group-hover:text-emerald-700 transition-colors">
                    {benefit.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-600 mt-2.5 leading-relaxed">
                    {benefit.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center text-xs font-bold text-emerald-600 group-hover:text-emerald-700">
                  <span>Explore Feature</span>
                  <ChevronRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Assistance Banner */}
        <div className="mt-10 bg-[#0A1628] rounded-2xl p-6 sm:p-8 text-white border border-slate-800 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
              <PhoneCall className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white">
                Need Dedicated Single-Window Assistance?
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                Call Toll-Free Investor Helpline <strong className="text-emerald-300 font-mono">1800-120-8040</strong> (9:00 AM to 6:00 PM, Mon-Sat) or connect with a District Industry Facilitator.
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3 shrink-0">
            <Link
              href="/dashboard/workflows"
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold text-xs border border-slate-700 transition-colors"
            >
              Raise a Query
            </Link>
            <Link
              href="/dashboard/kya"
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-colors"
            >
              KYA Wizard →
            </Link>
          </div>
        </div>
      </section>

      {/* 3. KEY APPROVALS SECTION */}
      <section className="bg-white border-y border-slate-200 py-16 sm:py-20">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* Left Container */}
            <div className="lg:col-span-4 bg-[#0A1628] bg-topo-pattern text-white rounded-3xl p-8 sm:p-10 flex flex-col justify-between shadow-xl border border-slate-800 relative overflow-hidden">
              <div className="relative z-10">
                <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[11px] font-bold uppercase tracking-wider mb-4">
                  <Landmark className="w-3.5 h-3.5" />
                  <span>Statutory Clearances</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white leading-snug">
                  Key Approvals
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 mt-3 leading-relaxed">
                  Fast-track your statutory compliance lifecycle across Maharashtra regulatory departments with standardized single-window processing.
                </p>
              </div>

              {/* View All Approvals CTA */}
              <div className="mt-8 relative z-10">
                <Link
                  href="/dashboard/workflows"
                  className="inline-flex items-center space-x-2 px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-950/50 transition-transform hover:-translate-y-0.5 cursor-pointer"
                >
                  <span>VIEW ALL APPROVALS</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Right Side: 4 Elevated White Approval Cards */}
            <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-5">
              {keyApprovalsData.map((approval) => {
                const IconComp = approval.icon;
                return (
                  <div
                    key={approval.id}
                    className="bg-white bg-cross-pattern rounded-2xl p-6 border border-slate-200 shadow-xs hover:shadow-lg hover:border-emerald-300 transition-all duration-200 flex flex-col justify-between group"
                  >
                    <div>
                      {/* Header: Icon + Category + SLA */}
                      <div className="flex items-start justify-between gap-3 mb-4">
                        <div className="w-11 h-11 rounded-xl bg-slate-50 border border-slate-200 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white flex items-center justify-center shrink-0 transition-colors shadow-xs">
                          <IconComp className="w-5 h-5" />
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                            {approval.category}
                          </span>
                          <span className="text-[11px] font-bold text-emerald-600">
                            SLA: {approval.slaDays} Working Days
                          </span>
                        </div>
                      </div>

                      {/* Title & Department */}
                      <h3 className="text-sm sm:text-base font-bold text-[#0B1728] leading-snug group-hover:text-emerald-700 transition-colors">
                        {approval.name}
                      </h3>
                      <p className="text-[11px] font-medium text-slate-500 mt-1 line-clamp-1">
                        {approval.department}
                      </p>

                      {/* Description */}
                      <p className="text-xs text-slate-600 mt-2.5 leading-relaxed">
                        {approval.description}
                      </p>
                    </div>

                    {/* Footer Action */}
                    <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[11px] font-medium text-slate-400">
                        Online Application
                      </span>
                      <Link
                        href={approval.href}
                        className="inline-flex items-center text-xs font-bold text-emerald-600 group-hover:text-emerald-700"
                      >
                        <span>Apply Online</span>
                        <ChevronRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* 4. 12-SECTOR APPROVAL EXPLORER */}
      <section className="py-16 sm:py-20 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>SECTOR SPECIFIC DIRECTORY</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-[#0B1728] tracking-tight">
            Which approvals are required to start my business in{" "}
            <span className="text-emerald-600">Maharashtra</span>?
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-2">
            Select your industry sector below to discover the exact statutory clearances, licenses, and applicable state incentives under Package Scheme of Incentives (PSI 2019).
          </p>
        </div>

        {/* 12 Sector Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {sectorsData.map((sector) => {
            const IconComp = sector.icon;
            const isSelected = selectedSector?.id === sector.id;
            return (
              <button
                key={sector.id}
                onClick={() => setSelectedSector(sector)}
                className={`p-4 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between cursor-pointer ${
                  isSelected
                    ? "bg-[#0A1628] text-white border-emerald-500 shadow-lg scale-[1.02]"
                    : "bg-white text-slate-800 border-slate-200 hover:border-emerald-300 hover:shadow-md"
                }`}
              >
                <div>
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-colors ${
                      isSelected
                        ? "bg-emerald-600 text-white"
                        : "bg-slate-50 text-emerald-600"
                    }`}
                  >
                    <IconComp className="w-5 h-5" />
                  </div>
                  <h3 className="text-xs font-bold leading-tight">
                    {sector.name}
                  </h3>
                </div>

                <div className="mt-4 pt-2 border-t border-slate-100/40 flex items-center justify-between text-[11px]">
                  <span className={isSelected ? "text-emerald-300 font-bold" : "text-emerald-600 font-bold"}>
                    {sector.approvalsCount} Approvals
                  </span>
                  <ChevronRight className={`w-3.5 h-3.5 ${isSelected ? "text-emerald-300" : "text-slate-400"}`} />
                </div>
              </button>
            );
          })}
        </div>

        {/* Sector Details Modal / Drawer when a sector is selected */}
        {selectedSector && (
          <div className="mt-8 bg-white rounded-2xl p-6 sm:p-8 border border-emerald-200 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 rounded-2xl bg-[#ECFDF5] border border-emerald-200 text-emerald-600 flex items-center justify-center shrink-0">
                <selectedSector.icon className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-lg font-black text-[#0B1728]">
                    {selectedSector.name}
                  </h3>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#ECFDF5] text-emerald-700">
                    {selectedSector.approvalsCount} Clearances Required
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  Key regulatory nodes: <strong className="text-slate-800">{selectedSector.tag}</strong>. Includes environmental categorization, factory safety, building approval, and utility connections.
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3 shrink-0">
              <button
                onClick={() => setSelectedSector(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
              >
                Close
              </button>
              <Link
                href="/dashboard/kya"
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md"
              >
                Launch KYA for {selectedSector.name.split(" ")[0]} →
              </Link>
            </div>
          </div>
        )}
      </section>

      {/* 5. MAHARASHTRA INDUSTRIAL ZONES & DISTRICTS */}
      <section className="bg-slate-50 border-t border-slate-200 py-16 sm:py-20">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div>
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-slate-200 text-slate-800 text-xs font-bold uppercase tracking-wider mb-2">
                <Building2 className="w-3.5 h-3.5 text-slate-700" />
                <span>STATE CLUSTERS</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0B1728] tracking-tight">
                Explore Maharashtra Industrial Zones
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                Plug-and-play industrial infrastructure across prime MIDC estates and DMIC corridors.
              </p>
            </div>
            <Link
              href="/dashboard/workflows"
              className="inline-flex items-center space-x-2 text-xs font-bold text-emerald-600 hover:text-emerald-700"
            >
              <span>View All 36 Districts</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {industrialZones.map((zone) => (
              <div
                key={zone.id}
                className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs hover:shadow-md hover:border-emerald-300 transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 uppercase">
                    MIDC Zone
                  </span>
                  <h3 className="text-base font-bold text-[#0B1728] mt-3">
                    {zone.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    {zone.hubs}
                  </p>

                  <div className="mt-4 pt-3 border-t border-slate-100 text-xs space-y-1.5">
                    <div className="flex items-center justify-between text-slate-600">
                      <span>Primary Sectors:</span>
                      <strong className="text-slate-800 text-right">{zone.focus}</strong>
                    </div>
                    <div className="flex items-center justify-between text-slate-600">
                      <span>Available Land:</span>
                      <strong className="text-emerald-600">{zone.plotsAvailable}</strong>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100">
                  <Link
                    href="/dashboard/kya"
                    className="text-xs font-bold text-emerald-600 hover:underline flex items-center justify-between"
                  >
                    <span>Check Approvals for this Zone</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>



      {/* Video Modal */}
      {videoModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setVideoModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center space-x-2 text-xs font-bold text-[#00A859] uppercase tracking-wider mb-2">
              <Play className="w-4 h-4 fill-emerald-600 text-emerald-600" />
              <span>AARAMBH Walkthrough Video</span>
            </div>
            <h3 className="text-lg font-black text-[#0B1728]">
              How Maharashtra Single Window Portal Works
            </h3>
            <p className="text-xs text-slate-600 mt-1 mb-4">
              Watch how end-to-end statutory clearances across MIDC, MPCB, DISH, and Fire Services are parallelized and guaranteed with statutory deemed approvals.
            </p>

            <div className="aspect-video bg-[#0B1728] rounded-2xl flex flex-col items-center justify-center text-center p-6 text-white border border-slate-800">
              <div className="w-16 h-16 rounded-full bg-[#00A859] flex items-center justify-center text-white mb-3 shadow-lg">
                <Play className="w-8 h-8 fill-white ml-1" />
              </div>
              <p className="text-sm font-bold">AARAMBH Clearance Lifecycle Overview</p>
              <p className="text-xs text-slate-400 mt-1 max-w-sm">
                Single Application • Zero Duplicate Uploads • Real-time SLA Countdown • 100% Deemed Approvals
              </p>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setVideoModalOpen(false)}
                className="px-5 py-2 rounded-xl bg-slate-800 text-white text-xs font-bold cursor-pointer"
              >
                Close Video
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Help / FAQ Modal */}
      {helpDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setHelpDrawerOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center space-x-2 text-xs font-bold text-amber-600 uppercase tracking-wider mb-2">
              <HelpCircle className="w-4 h-4" />
              <span>Helpdesk & FAQs</span>
            </div>
            <h3 className="text-lg font-black text-[#0B1728]">
              Single Window Investor Assistance
            </h3>
            <div className="mt-4 space-y-3 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <p className="font-bold text-slate-900">What is Deemed Approval?</p>
                <p className="text-slate-600 mt-1">Under the Maharashtra Right to Public Services Act, if a department fails to grant or query a clearance within statutory SLA days, approval is automatically deemed granted.</p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <p className="font-bold text-slate-900">How do I verify documents with AI Vault?</p>
                <p className="text-slate-600 mt-1">Upload your Land Registry, PAN, or Blueprint to Document Vault. Our OCR automatically extracts plot dimensions, electricity loads, and auto-fills all departmental applications.</p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <p className="font-bold text-slate-900">Helpline Numbers</p>
                <p className="text-slate-600 mt-1">Toll-Free: <strong>1800-120-8040</strong> • Email: <strong>support.aarambh@maharashtra.gov.in</strong></p>
              </div>
            </div>
            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setHelpDrawerOpen(false)}
                className="px-5 py-2 rounded-xl bg-[#0B1728] text-white text-xs font-bold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

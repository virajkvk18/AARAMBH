"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Building2,
  Factory,
  Flame,
  ShieldCheck,
  Zap,
  CheckCircle2,
  ArrowRight,
  Clock,
  Coins,
  FileCheck2,
  FileText,
  Search,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  X,
  AlertCircle,
  Sparkles,
  User,
  Briefcase,
  Layers,
  Check,
  HelpCircle,
  Award,
  Droplets,
  Calendar,
  AlertTriangle,
  FolderLock,
  Compass,
  ArrowUpRight,
  ShieldAlert,
  FileSpreadsheet,
} from "lucide-react";
import { allApprovalsList, ApprovalConfig } from "@/data/approvalsRegistry";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { useEnterpriseStore } from "@/store/enterpriseStore";

// Extended statutory clearances data with additional operational clearances
interface ApprovalCardData {
  id: string;
  name: string;
  department: string;
  departmentCode: string;
  category: "Pre-Establishment" | "Pre-Operation" | "Operations" | "Renewals";
  slaDays: number;
  act: string;
  description: string;
  mandatoryDocsCount: number;
  applyHref: string;
  icon: React.ComponentType<{ className?: string }>;
}

const keyApprovalsList: ApprovalCardData[] = [
  {
    id: "midc-land-allotment",
    name: "MIDC Land Allotment & Building Plan Approval",
    department: "Maharashtra Industrial Development Corporation (MIDC)",
    departmentCode: "MIDC",
    category: "Pre-Establishment",
    slaDays: 15,
    act: "MID Act 1961 & RTS Act 2015",
    description: "Industrial plot allotment, provisional possession letter issuance, and architectural building blueprint sanction across MIDC industrial estates.",
    mandatoryDocsCount: 5,
    applyHref: "/apply/midc-land-allotment",
    icon: Building2,
  },
  {
    id: "mpcb-consent",
    name: "MPCB Consent to Establish (CTE) & Operate (CTO)",
    department: "Maharashtra Pollution Control Board (MPCB)",
    departmentCode: "MPCB",
    category: "Pre-Establishment",
    slaDays: 21,
    act: "Water Act 1974 & Air Act 1981",
    description: "Statutory environmental consent categorization (Red/Orange/Green/White) and clearance for industrial air emissions, effluent discharge, and hazardous waste storage.",
    mandatoryDocsCount: 5,
    applyHref: "/apply/mpcb-consent",
    icon: Factory,
  },
  {
    id: "fire-safety-noc",
    name: "Provisional Fire Safety & Prevention NOC",
    department: "Directorate of Maharashtra Fire Services",
    departmentCode: "MFIS",
    category: "Pre-Establishment",
    slaDays: 14,
    act: "Maharashtra Fire Prevention Act 2006",
    description: "Statutory life safety audit, egress analysis, fire hydrant/sprinkler plan approval, and provisional construction clearance for industrial and commercial premises.",
    mandatoryDocsCount: 4,
    applyHref: "/apply/fire-safety-noc",
    icon: Flame,
  },
  {
    id: "dish-factory-license",
    name: "Factory Registration & Safety License (DISH)",
    department: "Directorate of Industrial Safety & Health (DISH)",
    departmentCode: "DISH",
    category: "Pre-Operation",
    slaDays: 10,
    act: "The Factories Act 1948 & State Rules",
    description: "Statutory industrial factory registration, occupier responsibility registration, machinery safety compliance inspection, and worker welfare verification.",
    mandatoryDocsCount: 4,
    applyHref: "/apply/dish-factory-license",
    icon: ShieldCheck,
  },
  {
    id: "msedcl-power-sanction",
    name: "High Tension (HT) Industrial Power Sanction & Grid Tie",
    department: "Maharashtra State Electricity Distribution Co. Ltd.",
    departmentCode: "MSEDCL",
    category: "Pre-Operation",
    slaDays: 15,
    act: "Electricity Act 2003 & MERC Regulations",
    description: "HT industrial load sanction (11kV / 22kV / 33kV), sub-station feeder allocation, transformer testing, and commissioning clearance.",
    mandatoryDocsCount: 4,
    applyHref: "/dashboard/caf",
    icon: Zap,
  },
  {
    id: "boiler-registration",
    name: "Boiler Registration, Inspection & Certificate of Use",
    department: "Directorate of Steam Boilers, Maharashtra",
    departmentCode: "DSB",
    category: "Operations",
    slaDays: 12,
    act: "Indian Boilers Act 1923",
    description: "Hydraulic pressure testing, steam pipeline drawing clearance, and statutory certificate of fitness under Form V/VI.",
    mandatoryDocsCount: 3,
    applyHref: "/dashboard/caf",
    icon: Droplets,
  },
];

export default function HomePage() {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const enterprise = useEnterpriseStore();

  const authHref = (target: string) =>
    user ? target : `/signin?redirect=${encodeURIComponent(target)}`;

  // Hero Search and Category State
  const [heroSearch, setHeroSearch] = useState("");
  const [heroCategory, setHeroCategory] = useState("All Approvals");

  // Approvals Search and Filter State
  const [approvalSearch, setApprovalSearch] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<string>("All");
  const [activeModalApproval, setActiveModalApproval] = useState<ApprovalCardData | null>(null);

  // Business Discovery Quick-Selector State
  const [discoverySector, setDiscoverySector] = useState("Automotive & Engineering");
  const [discoveryInvestment, setDiscoveryInvestment] = useState("₹10 Cr - ₹50 Cr");
  const [discoveryZone, setDiscoveryZone] = useState("MIDC Industrial Estate");

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setApprovalSearch(heroSearch);
    if (heroCategory === "All Approvals") {
      setSelectedFilter("All");
    } else {
      setSelectedFilter(heroCategory);
    }
    const el = document.getElementById("approvals");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Filtered approvals
  const filteredApprovals = keyApprovalsList.filter((app) => {
    const matchesQuery =
      app.name.toLowerCase().includes(approvalSearch.toLowerCase()) ||
      app.department.toLowerCase().includes(approvalSearch.toLowerCase()) ||
      app.departmentCode.toLowerCase().includes(approvalSearch.toLowerCase()) ||
      app.act.toLowerCase().includes(approvalSearch.toLowerCase()) ||
      app.description.toLowerCase().includes(approvalSearch.toLowerCase());

    const matchesFilter =
      selectedFilter === "All" || app.category === selectedFilter;

    return matchesQuery && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 selection:bg-[#9B2A48] selection:text-white">
      {/* ========================================================================= */}
      {/* 1. HERO SECTION (SINGLE CENTERED COMPOSITION WITH NEW INDUSTRIAL BACKDROP)*/}
      {/* ========================================================================= */}
      <section className="relative text-white overflow-hidden min-h-[78vh] lg:min-h-[85vh] flex items-center justify-center pt-16 sm:pt-20 lg:pt-24 pb-20 sm:pb-24 lg:pb-28 border-b border-slate-800/40">
        {/* New Attached Sunset Skyline Image Backdrop */}
        <div
          className="absolute inset-0 z-0 bg-cover bg-no-repeat bg-center sm:bg-[center_35%] lg:bg-center pointer-events-none transition-all duration-700"
          style={{ backgroundImage: "url('/images/aarambh-hero-bg.jpg')" }}
        />

        {/* Subtle Transparent Dark Gradient to guarantee crisp text legibility over the golden sunset while keeping the skyline, sunburst & water reflections clearly visible */}
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-black/45 via-black/25 to-black/55 pointer-events-none" />

        <div className="relative z-10 w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 text-center my-auto">
          <div className="max-w-4xl mx-auto flex flex-col items-center">
            {/* Government Badging */}
            <div className="inline-flex items-center space-x-2.5 px-4.5 py-1.5 rounded-full bg-[#16060E]/85 backdrop-blur-md border border-[#FED17A]/60 text-[#FFCA7C] text-xs font-black uppercase tracking-wider mb-6 shadow-xl shadow-black/50">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FE7251] animate-pulse" />
              <span>AARAMBH • महाराष्ट्र शासन • GOVERNMENT OF MAHARASHTRA</span>
            </div>

            {/* Main Hero Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-[3.4rem] font-black tracking-tight text-white leading-[1.15] drop-shadow-md">
              {t('hero.headline_start')} 
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFF5E6] via-[#FFCA7C] to-[#FE7251]">
                  {t('hero.headline_highlight')}
                </span>{" "}
                {t('hero.headline_end')}
              </h1>

            {/* Supporting Content */}
            <p className="mt-5 text-base sm:text-lg text-slate-100 leading-relaxed max-w-3xl mx-auto font-medium drop-shadow-sm">
                {t('hero.subheadline')}
            </p>

            {/* Prominent Central Search / Discovery Bar */}
            <form
              onSubmit={handleHeroSearch}
              className="mt-9 w-full max-w-3xl bg-white/95 backdrop-blur-md rounded-2xl p-2 sm:p-2.5 shadow-2xl shadow-black/50 border-2 border-[#FE7251]/40 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 text-slate-800"
            >
              {/* Category Dropdown */}
              <div className="relative shrink-0 sm:border-r sm:border-slate-200 sm:pr-2">
                <select
                  value={heroCategory}
                  onChange={(e) => setHeroCategory(e.target.value)}
                  className="w-full sm:w-auto bg-[#FFF5ED] hover:bg-[#FFEBE0] text-xs font-bold text-slate-900 px-3.5 py-2.5 rounded-xl border border-[#F0E5E0] focus:ring-2 focus:ring-[#FE7251] cursor-pointer appearance-none pr-8 transition-colors"
                >
                  <option value="All Approvals">All Approvals</option>
                  <option value="Pre-Establishment">Pre-Establishment</option>
                  <option value="Pre-Operation">Pre-Operation</option>
                  <option value="Operations">Operations</option>
                  <option value="Renewals">Renewals</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-600 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* Search Input */}
              <div className="flex-1 flex items-center px-3">
                <Search className="w-4 h-4 text-slate-500 mr-2.5 shrink-0" />
                <input
                  type="text"
                  placeholder="Search approvals, licences, registrations... e.g. MIDC, MPCB CTE"
                  value={heroSearch}
                  onChange={(e) => setHeroSearch(e.target.value)}
                  className="w-full text-xs sm:text-sm text-slate-900 font-medium placeholder-slate-400 bg-transparent border-0 focus:outline-hidden focus:ring-0"
                />
              </div>

              {/* Explore All Button */}
              <button
                type="submit"
                className="inline-flex items-center justify-center space-x-2 px-6 py-2.5 rounded-xl bg-[#FE7251] hover:bg-[#E85E3E] text-white font-bold text-xs sm:text-sm uppercase tracking-wider shadow-sm transition-colors shrink-0 cursor-pointer"
              >
                <span>{t('hero.explore_all')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Primary CTA (Personalized Approval Discovery) */}
            <div className="mt-8 flex flex-col items-center justify-center gap-2.5">
              <Link
                href={authHref("/dashboard/kya")}
                className="inline-flex items-center space-x-2.5 px-8 py-3.5 rounded-xl bg-[#FE7251] hover:bg-[#E85E3E] text-white font-bold text-xs sm:text-sm uppercase tracking-wider shadow-lg transition-colors cursor-pointer"
              >
                <Compass className="w-4 h-4 text-white" />
                <span>{t('hero.cta_find_requirements')}</span>
                <ArrowRight className="w-4 h-4 text-orange-100" />
              </Link>
              <span className="text-xs sm:text-sm text-slate-100 font-medium drop-shadow-xs">
                Get a customized list of clearances relevant to your business.
              </span>
            </div>

            {/* Popular Clearance Chips */}
            <div className="mt-7 flex flex-wrap items-center justify-center gap-2 text-xs text-white">
              <span className="text-[#FED17A] font-bold tracking-wide drop-shadow-xs">{t('hero.popular_clearances')}</span>
              {[
                { name: "MIDC Land Allotment", href: "/apply/midc-land-allotment" },
                { name: "MPCB CTE", href: "/apply/mpcb-consent" },
                { name: "Fire NOC", href: "/apply/fire-noc" },
                { name: "DISH Factory License", href: "/apply/dish-factory-license" },
                { name: "HT Power Sanction", href: "/apply/mseb-power" },
              ].map((chip) => (
                <Link
                  key={chip.name}
                  href={authHref(chip.href)}
                  className="px-3.5 py-1.5 rounded-lg bg-[#16060E]/80 backdrop-blur-md hover:bg-[#250C19] text-white font-medium border border-[#FED17A]/30 hover:border-[#FE7251] hover:text-[#FFCA7C] shadow-md shadow-black/30 transition-all duration-150"
                >
                  {chip.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. PRIMARY BUSINESS DISCOVERY FLOW ("Tell us about your business")        */}
      {/* ========================================================================= */}
      <section className="bg-white border-b border-[#F0E5E0] py-14 sm:py-16">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#FFF9F6] border border-[#FED17A]/40 rounded-3xl p-6 sm:p-10 shadow-xs">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Left explanation (5 cols) */}
              <div className="lg:col-span-5 space-y-4">
                <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#FFF2DF] text-[#9B2A48] text-xs font-bold uppercase tracking-wider border border-[#FED17A]">
                  <Compass className="w-3.5 h-3.5" />
                  <span>Know Your Approvals (KYA Engine)</span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
                  Tell us about your business.
                </h2>

                <p className="text-sm text-slate-600 leading-relaxed">
                  Answer a few basic parameters and AARAMBH will generate a comprehensive, personalized statutory roadmap of required approvals, environmental classifications, document checklists, and eligible government financial incentives.
                </p>

                <div className="pt-2">
                  <Link
                    href={authHref("/dashboard/kya")}
                    className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#9B2A48] hover:bg-[#82213B] text-white font-bold text-xs uppercase tracking-wider shadow-md transition-all cursor-pointer"
                  >
                    <span>Build My Personalized Roadmap</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              {/* Right interactive quick-selector preview (7 cols) */}
              <div className="lg:col-span-7 bg-white p-6 sm:p-7 rounded-2xl border border-[#F0E5E0] shadow-xs space-y-5">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                  Quick Requirement Estimator
                </span>

                {/* 1. Sector selector */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-2">
                    Select Your Industry Activity:
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      "Automotive & Engineering",
                      "Chemicals & Solvents",
                      "Food Processing & Agro",
                      "Textiles & Garments",
                      "Electronics & IT Parks",
                      "Pharma & Active Ingredients",
                    ].map((sec) => (
                      <button
                        key={sec}
                        type="button"
                        onClick={() => setDiscoverySector(sec)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                          discoverySector === sec
                            ? "bg-[#9B2A48] text-white shadow-xs"
                            : "bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        {sec}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Capital Investment */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-2">
                    Planned Fixed Capital Investment:
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {["Below ₹10 Cr (MSME)", "₹10 Cr - ₹50 Cr", "Above ₹50 Cr (Large / Mega)"].map((tier) => (
                      <button
                        key={tier}
                        type="button"
                        onClick={() => setDiscoveryInvestment(tier)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                          discoveryInvestment === tier
                            ? "bg-[#FE7251] text-white shadow-xs"
                            : "bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        {tier}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Live estimated requirements output */}
                <div className="p-4 rounded-xl bg-[#FFF9F6] border border-[#FED17A]/60 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div>
                    <span className="font-bold text-slate-900 block">
                      Estimated Profile for {discoverySector}:
                    </span>
                    <span className="text-slate-600 text-[11px] block mt-0.5">
                      ~14 Statutory Clearances • 21-Day Statutory Max SLA • Eligible for PSI 2019 Incentives
                    </span>
                  </div>

                  <Link
                    href={authHref("/dashboard/kya")}
                    className="inline-flex items-center gap-1 font-bold text-[#9B2A48] hover:underline"
                  >
                    <span>View Full Breakdown</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. WHAT AARAMBH DOES ("One platform for your entire industrial journey")   */}
      {/* ========================================================================= */}
      <section className="py-16 sm:py-20 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#FFF2DF] text-[#9B2A48] text-xs font-bold uppercase tracking-wider border border-[#FED17A] mb-3">
            <Layers className="w-3.5 h-3.5" />
            <span>Single-Window Core Architecture</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-900">
            One platform for your entire industrial journey.
          </h2>
          <p className="text-sm sm:text-base text-slate-600 mt-3 leading-relaxed">
            Integrated statutory workflows designed to eliminate bureaucratic silos and accelerate industrial commissioning across Maharashtra.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* 1. Approvals & Clearances */}
          <div className="bg-white p-7 rounded-3xl border border-[#F0E5E0] hover:border-[#9B2A48]/30 hover:shadow-lg transition-all duration-200 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#FFF2DF] border border-[#FED17A] flex items-center justify-center text-[#9B2A48]">
              <Building2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              1. Approvals & Clearances
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Find every approval your project requires across MIDC, MPCB, Fire Services, DISH, and state utility providers in one consolidated inventory.
            </p>
            <a href="#approvals" className="inline-flex items-center gap-1 text-xs font-bold text-[#9B2A48] hover:underline">
              <span>{t('common.browse_catalog')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* 2. Guided Applications */}
          <div className="bg-white p-7 rounded-3xl border border-[#F0E5E0] hover:border-[#9B2A48]/30 hover:shadow-lg transition-all duration-200 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#FFF2DF] border border-[#FED17A] flex items-center justify-center text-[#9B2A48]">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              2. Guided Applications
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Know exactly what to fill, upload, and submit. The integrated Common Application Form (CAF) maps once across multiple departmental portals.
            </p>
            <Link href={authHref("/dashboard/caf")} className="inline-flex items-center gap-1 text-xs font-bold text-[#9B2A48] hover:underline">
              <span>Open Common Form</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* 3. Document Management */}
          <div className="bg-white p-7 rounded-3xl border border-[#F0E5E0] hover:border-[#9B2A48]/30 hover:shadow-lg transition-all duration-200 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#FFF2DF] border border-[#FED17A] flex items-center justify-center text-[#9B2A48]">
              <FolderLock className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              3. Document Management
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Upload once, digitally verify with OCR, and securely reuse documents across all clearance requests without repeated manual submissions.
            </p>
            <Link href={authHref("/dashboard/vault")} className="inline-flex items-center gap-1 text-xs font-bold text-[#9B2A48] hover:underline">
              <span>Document Vault</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* 4. Application Tracking */}
          <div className="bg-white p-7 rounded-3xl border border-[#F0E5E0] hover:border-[#9B2A48]/30 hover:shadow-lg transition-all duration-200 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#FFF2DF] border border-[#FED17A] flex items-center justify-center text-[#9B2A48]">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              4. Application Tracking
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Track status, statutory SLA countdowns, and desk reviews with statutory deemed approval enforcement under the Maharashtra Right to Services Act.
            </p>
            <Link href={authHref("/dashboard/sla")} className="inline-flex items-center gap-1 text-xs font-bold text-[#9B2A48] hover:underline">
              <span>SLA Tracker</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* 5. Incentives & Schemes */}
          <div className="bg-white p-7 rounded-3xl border border-[#F0E5E0] hover:border-[#9B2A48]/30 hover:shadow-lg transition-all duration-200 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#FFF2DF] border border-[#FED17A] flex items-center justify-center text-[#9B2A48]">
              <Coins className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              5. Incentives & Schemes
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Discover eligible financial incentives, electricity duty waivers, stamp duty exemptions, and capital subsidies under Maharashtra Industrial Policy.
            </p>
            <a href="#incentives" className="inline-flex items-center gap-1 text-xs font-bold text-[#9B2A48] hover:underline">
              <span>View Schemes</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* 6. Compliance */}
          <div className="bg-white p-7 rounded-3xl border border-[#F0E5E0] hover:border-[#9B2A48]/30 hover:shadow-lg transition-all duration-200 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#FFF2DF] border border-[#FED17A] flex items-center justify-center text-[#9B2A48]">
              <FileCheck2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              6. Compliance
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Stay ahead of mandatory renewals, annual environmental returns, joint site inspections, and statutory factory audits without regulatory surprises.
            </p>
            <a href="#compliance" className="inline-flex items-center gap-1 text-xs font-bold text-[#9B2A48] hover:underline">
              <span>Readiness Check</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. BUSINESS JOURNEY SECTION ("From idea to expansion")                    */}
      {/* ========================================================================= */}
      <section className="bg-[#14050B] text-white py-16 sm:py-20 border-y border-[#2D0D19]">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#250C19] text-[#FFCA7C] border border-[#521C35] text-xs font-bold uppercase tracking-wider mb-3">
              <span>Regulatory Lifecycle</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
              From idea to expansion — AARAMBH stays with you.
            </h2>
            <p className="text-sm sm:text-base text-[#C4A89C] mt-3">
              A continuous regulatory companion guiding your enterprise through every milestone of establishment and operation.
            </p>
          </div>

          {/* 6 Sequential Stages Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
            {[
              {
                step: "01",
                title: "PLAN",
                desc: "Understand project requirements & KYA assessment",
                href: "/dashboard/kya",
              },
              {
                step: "02",
                title: "LAND & ESTABLISH",
                desc: "Identify MIDC plots & zone building bylaws",
                href: "/apply/midc-land-allotment",
              },
              {
                step: "03",
                title: "APPROVALS",
                desc: "Apply for statutory CTE, Fire NOC & licences",
                href: "/apply",
              },
              {
                step: "04",
                title: "OPERATE",
                desc: "Manage DISH safety licences & factory compliance",
                href: "/apply/dish-factory-license",
              },
              {
                step: "05",
                title: "INCENTIVES",
                desc: "Discover & claim eligible PSI 2019 financial support",
                href: "#incentives",
              },
              {
                step: "06",
                title: "EXPAND",
                desc: "Scale capacity & file amendment applications",
                href: "/dashboard/caf",
              },
            ].map((stage, idx) => (
              <Link
                key={stage.step}
                href={stage.href.startsWith("#") ? stage.href : authHref(stage.href)}
                className="p-5 rounded-2xl bg-[#250C19]/80 border border-[#521C35] hover:border-[#FE7251] hover:bg-[#361026] transition-all group flex flex-col justify-between"
              >
                <div>
                  <span className="text-2xl font-black text-[#FE7251] block font-mono">
                    {stage.step}
                  </span>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider mt-2 group-hover:text-[#FFCA7C]">
                    {stage.title}
                  </h3>
                  <p className="text-[11px] text-[#C4A89C] mt-1.5 leading-relaxed">
                    {stage.desc}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-[#36101E] flex items-center justify-between text-[10px] text-[#FFCA7C] font-semibold">
                  <span>Explore</span>
                  <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. APPROVALS SECTION ("Find the approvals your project needs")            */}
      {/* ========================================================================= */}
      <section id="approvals" className="py-16 sm:py-20 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#FFF2DF] text-[#9B2A48] text-xs font-bold uppercase tracking-wider border border-[#FED17A] mb-3">
              <Building2 className="w-3.5 h-3.5" />
              <span>Statutory Directory</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
              Find the approvals your project needs.
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-xl">
              Search Maharashtra's industrial approvals, licences and statutory clearances from one place.
            </p>
          </div>

          <Link
            href={authHref("/apply")}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#9B2A48] hover:underline shrink-0"
          >
            <span>View All Approvals Directory</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Search Bar & Category Filter Bar */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#F0E5E0] shadow-xs mb-8 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-8 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={approvalSearch}
                onChange={(e) => setApprovalSearch(e.target.value)}
                placeholder="Search approval, licence or department name..."
                className="w-full pl-11 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-[#9B2A48]/20 focus:border-[#9B2A48]"
              />
            </div>

            <div className="md:col-span-4 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              {["All", "Pre-Establishment", "Pre-Operation", "Operations"].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedFilter(cat)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    selectedFilter === cat
                      ? "bg-[#9B2A48] text-white shadow-xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Clearances Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredApprovals.map((app) => {
            const IconComp = app.icon;
            return (
              <div
                key={app.id}
                className="bg-white rounded-3xl border border-[#F0E5E0] p-6 hover:shadow-xl hover:border-[#9B2A48]/40 transition-all duration-200 flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-[#FFF2DF] border border-[#FED17A] flex items-center justify-center text-[#9B2A48] shrink-0">
                      <IconComp className="w-5 h-5" />
                    </div>

                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 uppercase tracking-wider shrink-0">
                      {app.category}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-[#9B2A48] transition-colors leading-snug">
                      {app.name}
                    </h3>
                    <span className="text-[11px] text-slate-500 font-medium block mt-0.5">
                      {app.department}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {app.description}
                  </p>

                  <div className="p-2.5 rounded-xl bg-[#F8FAFC] border border-slate-100 flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-500 flex items-center gap-1 text-[11px]">
                      <Clock className="w-3.5 h-3.5 text-[#FE7251]" /> {app.slaDays} Working Days
                    </span>
                    <span className="text-slate-500 flex items-center gap-1 text-[11px]">
                      <FileText className="w-3.5 h-3.5 text-slate-400" /> {app.mandatoryDocsCount} Mandatory Docs
                    </span>
                  </div>
                </div>

                {/* Card Actions: View Requirements + Apply Online */}
                <div className="mt-6 pt-4 border-t border-[#F0E5E0] flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveModalApproval(app)}
                    className="text-xs font-bold text-slate-600 hover:text-slate-900 py-2 px-3 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    View Requirements
                  </button>

                  <Link
                    href={authHref(app.applyHref)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#FE7251] hover:bg-[#E85E3E] text-white text-xs font-bold uppercase tracking-wider shadow-xs transition-colors"
                  >
                    <span>Apply Online</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. APPLICATION READINESS SECTION ("Before you apply")                     */}
      {/* ========================================================================= */}
      <section id="compliance" className="bg-[#FFF9F6] border-y border-[#FED17A]/40 py-16 sm:py-20">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5 space-y-4">
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#FFF2DF] text-[#9B2A48] text-xs font-bold uppercase tracking-wider border border-[#FED17A]">
                <FileCheck2 className="w-3.5 h-3.5" />
                <span>Pre-Submission Scrutiny</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
                Before you apply.
              </h2>

              <p className="text-sm text-slate-600 leading-relaxed">
                AARAMBH pre-checks your dossier completeness before statutory submission, ensuring zero delays or rejections due to missing paperwork or mismatching parameters.
              </p>

              <div className="pt-2">
                <Link
                  href={authHref("/dashboard/vault")}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#9B2A48] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#82213B] transition-colors shadow-xs"
                >
                  <span>Complete Requirements</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Interactive Readiness Meter Card (7 cols) */}
            <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-[#F0E5E0] shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                    Composite Readiness Score
                  </span>
                  <span className="text-2xl font-black text-slate-900 font-mono">
                    Application Readiness: 67%
                  </span>
                </div>

                <span className="px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold">
                  2 Items Pending
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                <div className="bg-[#FE7251] h-3 rounded-full w-[67%]" />
              </div>

              {/* Checklist items */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="flex items-center space-x-2.5 p-3 rounded-xl bg-emerald-50/50 border border-emerald-200 text-emerald-900">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-semibold">Business Details Verified</span>
                </div>

                <div className="flex items-center space-x-2.5 p-3 rounded-xl bg-emerald-50/50 border border-emerald-200 text-emerald-900">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-semibold">Applicant Identity Endorsed</span>
                </div>

                <div className="flex items-center space-x-2.5 p-3 rounded-xl bg-emerald-50/50 border border-emerald-200 text-emerald-900">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-semibold">Income Tax PAN Verified</span>
                </div>

                <div className="flex items-center space-x-2.5 p-3 rounded-xl bg-amber-50/50 border border-amber-200 text-amber-900">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span className="font-semibold">Project Feasibility Report Pending</span>
                </div>

                <div className="flex items-center space-x-2.5 p-3 rounded-xl bg-amber-50/50 border border-amber-200 text-amber-900 sm:col-span-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span className="font-semibold">Required Land Ownership / Allotment Deed Missing</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. INCENTIVES SECTION ("Don't leave government support on the table")     */}
      {/* ========================================================================= */}
      <section id="incentives" className="py-16 sm:py-20 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#14050B] rounded-3xl p-8 sm:p-12 text-white border border-[#36101E] relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">
            <div className="lg:col-span-6 space-y-4">
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#250C19] text-[#FFCA7C] border border-[#521C35] text-xs font-bold uppercase tracking-wider">
                <Coins className="w-3.5 h-3.5" />
                <span>Package Scheme of Incentives (PSI 2019)</span>
              </div>

              <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
                Don't leave government support on the table.
              </h2>

              <p className="text-sm text-[#C4A89C] leading-relaxed">
                Discover subsidies, fiscal benefits, and infrastructure exemptions based on your industry activity, taluka category, and fixed capital investment under the Maharashtra Industrial Policy.
              </p>

              <div className="pt-2">
                <Link
                  href={authHref("/dashboard/kya")}
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#FE7251] hover:bg-[#E85E3E] text-white font-extrabold text-xs uppercase tracking-wider shadow-xs transition-colors"
                >
                  <span>Check My Eligibility</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Verified Policy Pillars Grid (6 cols) */}
            <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-[#250C19] border border-[#521C35] space-y-1.5">
                <span className="text-lg font-black text-[#FE7251] block font-mono">100%</span>
                <h4 className="font-bold text-white">Stamp Duty Exemption</h4>
                <p className="text-[11px] text-[#C4A89C]">
                  Full waiver on land acquisition and industrial lease deeds in C, D, D+ talukas.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#250C19] border border-[#521C35] space-y-1.5">
                <span className="text-lg font-black text-[#FFCA7C] block font-mono">Up to 10 Yrs</span>
                <h4 className="font-bold text-white">Electricity Duty Waiver</h4>
                <p className="text-[11px] text-[#C4A89C]">
                  Exemption from statutory electricity duties for eligible industrial units.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#250C19] border border-[#521C35] space-y-1.5">
                <span className="text-lg font-black text-[#FE7251] block font-mono">₹1.00 - ₹2.00</span>
                <h4 className="font-bold text-white">Power Tariff Subsidy</h4>
                <p className="text-[11px] text-[#C4A89C]">
                  Direct per-unit electricity subsidy for MSMEs in Vidarbha and Marathwada.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#250C19] border border-[#521C35] space-y-1.5">
                <span className="text-lg font-black text-[#FFCA7C] block font-mono">Up to 5%</span>
                <h4 className="font-bold text-white">Interest Subvention</h4>
                <p className="text-[11px] text-[#C4A89C]">
                  Interest subsidy on term loans for plant, machinery, and clean technology.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 8. DOCUMENT INTELLIGENCE SECTION ("Your documents. One secure place.")    */}
      {/* ========================================================================= */}
      <section className="bg-white border-b border-[#F0E5E0] py-16 sm:py-20">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-5 space-y-4">
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#FFF2DF] text-[#9B2A48] text-xs font-bold uppercase tracking-wider border border-[#FED17A]">
                <FolderLock className="w-3.5 h-3.5" />
                <span>Single Digital Dossier</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
                Your documents. One secure place.
              </h2>

              <p className="text-sm text-slate-600 leading-relaxed">
                Upload once. Validate before submission. Reuse across all statutory departments. Always know what document is expired, verified, or missing.
              </p>

              <div className="pt-2">
                <Link
                  href={authHref("/dashboard/vault")}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#9B2A48] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#82213B] transition-colors shadow-xs"
                >
                  <span>Open Document Vault</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Document Management UI Mockup with Real UI components */}
            <div className="lg:col-span-7 bg-[#F8FAFC] p-6 sm:p-7 rounded-3xl border border-[#F0E5E0] shadow-sm space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 text-xs">
                <span className="font-bold text-slate-500 uppercase tracking-wider">
                  Enterprise Document Repository
                </span>
                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  OCR Engine Active
                </span>
              </div>

              {[
                { name: "Entity PAN Card", sub: "Permanent Account Number", status: "Verified", type: "success" },
                { name: "GSTIN Certificate", sub: "Form GST REG-06", status: "Verified", type: "success" },
                { name: "Certificate of Incorporation", sub: "MCA Registrar of Companies", status: "Verified", type: "success" },
                { name: "MIDC Land Allotment Deed", sub: "Dimension check mismatch with DPR", status: "Action Required", type: "warning" },
                { name: "Detailed Project Report (DPR)", sub: "Awaiting CA Certified Balance Sheet", status: "Pending", type: "pending" },
              ].map((doc) => (
                <div
                  key={doc.name}
                  className="bg-white p-3.5 rounded-xl border border-slate-200 flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3 overflow-hidden">
                    <FileText className="w-4 h-4 text-[#9B2A48] shrink-0" />
                    <div className="truncate">
                      <span className="text-xs font-bold text-slate-800 block truncate">
                        {doc.name}
                      </span>
                      <span className="text-[11px] text-slate-400 block truncate">
                        {doc.sub}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded uppercase tracking-wider shrink-0 ${
                      doc.type === "success"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : doc.type === "warning"
                        ? "bg-amber-50 text-amber-800 border border-amber-200"
                        : "bg-slate-100 text-slate-500 border border-slate-200"
                    }`}
                  >
                    {doc.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 9. APPLICATION TRACKING SECTION ("Know exactly where every app stands")   */}
      {/* ========================================================================= */}
      <section className="py-16 sm:py-20 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#FFF2DF] text-[#9B2A48] text-xs font-bold uppercase tracking-wider border border-[#FED17A] mb-3">
            <Clock className="w-3.5 h-3.5" />
            <span>Right to Services (RTS) Transparency</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-900">
            Know exactly where every application stands.
          </h2>
          <p className="text-sm sm:text-base text-slate-600 mt-3 leading-relaxed">
            Transparent desk-by-desk status monitoring with statutory time-limits guaranteed under the Maharashtra Right to Services Act, 2015.
          </p>
        </div>

        {/* Realistic Stage Timeline */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#F0E5E0] shadow-xs mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 relative">
            {[
              { num: "1", title: "Application Submitted", sub: "E-Challan Transmitted", state: "done" },
              { num: "2", title: "Documents Verified", sub: "Desk 1 Clearance", state: "done" },
              { num: "3", title: "Department Review", sub: "Scrutiny Officer Reviewing", state: "active" },
              { num: "4", title: "Joint Site Inspection", sub: "Single-window Field Visit", state: "pending" },
              { num: "5", title: "Statutory Decision", sub: "NOC Issuance / Deemed", state: "pending" },
            ].map((step, idx) => (
              <div key={step.num} className="flex flex-col items-center text-center p-3">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs mb-3 ${
                    step.state === "done"
                      ? "bg-emerald-600 text-white shadow-xs"
                      : step.state === "active"
                      ? "bg-[#9B2A48] text-white ring-4 ring-[#9B2A48]/20 animate-pulse"
                      : "bg-slate-100 text-slate-400 border border-slate-200"
                  }`}
                >
                  {step.state === "done" ? <Check className="w-4 h-4" /> : step.num}
                </div>
                <span className="text-xs font-bold text-slate-900">{step.title}</span>
                <span className="text-[10px] text-slate-500 mt-0.5">{step.sub}</span>
              </div>
            ))}
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
            <div className="flex items-center space-x-2 text-slate-600">
              <span className="font-bold text-slate-900">Live Case Tracking:</span>
              <span className="font-mono text-[#9B2A48] font-bold">MH-SWS-2026-MPCB-449120</span>
              <span className="text-slate-400">• SLA: 21 Working Days (Day 8 of 21)</span>
            </div>

            <Link
              href={authHref("/dashboard/sla")}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
            >
              <span>View Full SLA Audit</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 10. MY BUSINESS SECTION ("Your business, managed from one place.")        */}
      {/* ========================================================================= */}
      <section className="bg-slate-900 text-white py-16 sm:py-20 border-t border-slate-800">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-3xl space-y-6">
          <div className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full bg-slate-800 border border-slate-700 text-[#FE7251] text-xs font-bold uppercase tracking-wider">
            <Briefcase className="w-3.5 h-3.5" />
            <span>Industrialist Cockpit</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            Your business, managed from one place.
          </h2>

          <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
            After signing in, access your active applications, verified document vault, statutory compliance schedule, incentive disbursements, and official department correspondence.
          </p>

          <div className="pt-4 flex items-center justify-center gap-4">
            <Link
              href={authHref("/dashboard")}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-[#FE7251] hover:bg-[#E85E3E] text-white font-extrabold text-xs uppercase tracking-wider shadow-xs transition-colors"
            >
              <span>Open My Business</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 11. TRUST SECTION ("Built for Maharashtra's industrial ecosystem")         */}
      {/* ========================================================================= */}
      <section className="py-14 sm:py-16 bg-[#F8FAFC] border-t border-[#F0E5E0]">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-6">
            Institutional Clearance Authorities & Statutory Departments
          </span>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { code: "MIDC", name: "Maharashtra Industrial Development Corp." },
              { code: "MPCB", name: "Maharashtra Pollution Control Board" },
              { code: "MFIS", name: "Directorate of Maharashtra Fire Services" },
              { code: "DISH", name: "Directorate of Industrial Safety & Health" },
              { code: "MSEDCL", name: "State Electricity Distribution Co." },
              { code: "DIR-IND", name: "Directorate of Industries, Maharashtra" },
            ].map((auth) => (
              <div
                key={auth.code}
                className="bg-white p-4 rounded-2xl border border-slate-200 text-center shadow-2xs"
              >
                <span className="text-base font-black text-[#9B2A48] block font-mono">
                  {auth.code}
                </span>
                <span className="text-[11px] text-slate-500 font-medium block mt-1 line-clamp-2">
                  {auth.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 12. REQUIREMENTS MODAL DIALOG (View Requirements)                         */}
      {/* ========================================================================= */}
      {activeModalApproval && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600 uppercase tracking-wider">
                  {activeModalApproval.category} • {activeModalApproval.departmentCode}
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-1">
                  {activeModalApproval.name}
                </h3>
                <span className="text-xs text-slate-500">{activeModalApproval.department}</span>
              </div>

              <button
                type="button"
                onClick={() => setActiveModalApproval(null)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <span className="font-bold text-slate-700 block uppercase tracking-wider text-[10px]">
                  Statutory Governing Act
                </span>
                <p className="text-slate-800 font-medium mt-0.5">{activeModalApproval.act}</p>
              </div>

              <div>
                <span className="font-bold text-slate-700 block uppercase tracking-wider text-[10px]">
                  Statutory SLA Guarantee
                </span>
                <p className="text-slate-800 font-semibold mt-0.5">
                  {activeModalApproval.slaDays} Working Days under Maharashtra Right to Services Act, 2015
                </p>
              </div>

              <div>
                <span className="font-bold text-slate-700 block uppercase tracking-wider text-[10px]">
                  Purpose & Scope
                </span>
                <p className="text-slate-600 leading-relaxed mt-0.5">{activeModalApproval.description}</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="font-bold text-slate-800 block mb-2">
                  Checklist of Mandatory Dossier Attachments ({activeModalApproval.mandatoryDocsCount} Files)
                </span>
                <ul className="space-y-1.5 text-slate-600 text-[11px] list-disc list-inside">
                  <li>Detailed Project Report (DPR) / Machinery Layout Plan</li>
                  <li>Proof of Legal Land Ownership / Registered Lease Deed</li>
                  <li>Entity Constitutional Documents (Certificate of Incorporation / Partnership Deed)</li>
                  <li>CA Certified Fixed Capital Investment & Net Worth Certificate</li>
                  <li>Board Resolution appointing Authorized Signatory</li>
                </ul>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setActiveModalApproval(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50"
              >
                Close
              </button>

              <Link
                href={authHref(activeModalApproval.applyHref)}
                className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-[#FE7251] hover:bg-[#E85E3E] text-white text-xs font-bold uppercase tracking-wider transition-colors"
              >
                <span>Apply for this Clearance</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

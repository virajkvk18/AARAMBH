"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Building2,
  Factory,
  Flame,
  ShieldCheck,
  Search,
  ArrowRight,
  Clock,
  Coins,
  FileCheck2,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Filter,
  CheckCircle2,
} from "lucide-react";
import { allApprovalsList } from "@/data/approvalsRegistry";
import { useLanguage } from "@/context/LanguageContext";

export default function ApprovalsDirectoryPage() {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<"All" | "Pre-Establishment" | "Pre-Operation">("All");

  const filteredApprovals = allApprovalsList.filter((item) => {
    const matchesSearch =
      item.meta.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.meta.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.meta.act.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.meta.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === "All" || item.meta.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case "Building2":
        return <Building2 className="w-6 h-6 text-[#9B2A48]" />;
      case "Factory":
        return <Factory className="w-6 h-6 text-[#9B2A48]" />;
      case "Flame":
        return <Flame className="w-6 h-6 text-[#9B2A48]" />;
      case "ShieldCheck":
        return <ShieldCheck className="w-6 h-6 text-[#9B2A48]" />;
      default:
        return <Building2 className="w-6 h-6 text-[#9B2A48]" />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24">
      {/* Hero Header */}
      <section className="bg-gradient-to-r from-[#16060E] via-[#2A0B1A] to-[#16060E] text-white border-b border-[#36101E] py-14 sm:py-16 relative overflow-hidden">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#FE7251]/20 border border-[#FE7251]/40 text-[#FED17A] text-xs font-bold uppercase tracking-wider mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Maharashtra Single Window System (SWS)</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
              Statutory Industrial Approvals Directory
            </h1>
            <p className="text-sm sm:text-base text-[#E0C7BC] mt-3 leading-relaxed">
              Apply online for state departmental clearances, land allotments, pollution control consents, and industrial licenses with statutory SLA guarantees under the Maharashtra Right to Services Act, 2015.
            </p>
          </div>

          {/* Search and Filters */}
          <div className="mt-8 flex flex-col sm:flex-row items-center gap-4 max-w-2xl">
            <div className="relative w-full">
              <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search clearances by name, department, or legal act..."
                className="w-full pl-12 pr-4 py-3.5 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-slate-400 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#FE7251] focus:bg-white/15 backdrop-blur-md"
              >
              </input>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
              {(["All", "Pre-Establishment", "Pre-Operation"] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-3 rounded-2xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    selectedCategory === cat
                      ? "bg-[#FE7251] text-white shadow-md shadow-[#FE7251]/30"
                      : "bg-white/10 text-[#E0C7BC] hover:bg-white/15 hover:text-white"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Directory Grid */}
      <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-slate-900">
            Available Online Clearances ({filteredApprovals.length})
          </h2>
          <span className="text-xs text-slate-500">
            Integrated Common Application Engine
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredApprovals.map((approval) => (
            <div
              key={approval.meta.id}
              className="bg-white rounded-3xl border border-[#F0E5E0] hover:border-[#9B2A48]/40 hover:shadow-xl transition-all duration-300 p-6 sm:p-7 flex flex-col justify-between group"
            >
              <div>
                {/* Header: Icon + Department + Category Badge */}
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-[#FFF2DF] border border-[#FED17A] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      {renderIcon(approval.meta.iconName)}
                    </div>
                    <div>
                      <span className="text-[11px] font-bold text-[#9B2A48] uppercase tracking-wider block">
                        {approval.meta.departmentCode}
                      </span>
                      <span className="text-xs text-slate-500 font-medium line-clamp-1">
                        {approval.meta.department}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0 ${
                      approval.meta.category === "Pre-Establishment"
                        ? "bg-blue-50 text-blue-700 border border-blue-200"
                        : "bg-amber-50 text-amber-700 border border-amber-200"
                    }`}
                  >
                    {approval.meta.category}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-[#9B2A48] transition-colors">
                  {approval.meta.title}
                </h3>

                {/* Description */}
                <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                  {approval.meta.description}
                </p>

                {/* Meta Attributes Bar */}
                <div className="grid grid-cols-3 gap-2 mt-5 p-3 rounded-2xl bg-[#F8FAFC] border border-slate-100 text-center">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Statutory SLA</span>
                    <span className="text-xs font-extrabold text-slate-800 block mt-0.5">
                      {approval.meta.slaDays} Working Days
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Required Docs</span>
                    <span className="text-xs font-extrabold text-slate-800 block mt-0.5">
                      {approval.documents.filter((d) => d.mandatory).length} Mandatory
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Challan Fee</span>
                    <span className="text-xs font-extrabold text-emerald-700 block mt-0.5">
                      Online Treasury
                    </span>
                  </div>
                </div>

                {/* Legal Act Footnote */}
                <p className="text-[11px] text-slate-400 mt-3 truncate">
                  <span className="font-semibold text-slate-500">Statutory Act:</span> {approval.meta.act}
                </p>
              </div>

              {/* Action Footer */}
              <div className="mt-6 pt-5 border-t border-[#F0E5E0] flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-500">
                  Ready for Online Submission
                </span>

                <Link
                  href={`/apply/${approval.meta.slug}`}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#9B2A48] via-[#FE7251] to-[#FE7251] text-white text-xs font-bold uppercase tracking-wider shadow-sm hover:shadow-md transition-all group-hover:scale-[1.02]"
                >
                  <span>Apply Online</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

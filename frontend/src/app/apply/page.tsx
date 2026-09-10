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
  Utensils,
  Store,
} from "lucide-react";
import { allApprovalsList } from "@/data/approvalsRegistry";
import { useLanguage } from "@/context/LanguageContext";
import { usePageTitle } from "@/hooks/usePageTitle";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function ApprovalsDirectoryPage() {
  const { t } = useLanguage();
  usePageTitle("Approvals Directory | AARAMBH");
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
        return <Building2 className="w-5 h-5 text-slate-700" />;
      case "Factory":
        return <Factory className="w-5 h-5 text-slate-700" />;
      case "Flame":
        return <Flame className="w-5 h-5 text-slate-700" />;
      case "ShieldCheck":
        return <ShieldCheck className="w-5 h-5 text-slate-700" />;
      case "Utensils":
        return <Utensils className="w-5 h-5 text-slate-700" />;
      case "Store":
        return <Store className="w-5 h-5 text-slate-700" />;
      default:
        return <Building2 className="w-5 h-5 text-slate-700" />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Hero Header */}
      <section className="bg-slate-900 text-white border-b border-slate-800 py-12">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-xs font-medium uppercase tracking-wider mb-3">
              Maharashtra Single Window System (SWS)
            </span>

            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Statutory Industrial Approvals Directory
            </h1>
            <p className="text-sm text-slate-300 mt-2 leading-relaxed">
              Apply online for state departmental clearances, land allotments, pollution control consents, and industrial licenses with statutory SLA guarantees under the Maharashtra Right to Services Act, 2015.
            </p>
          </div>

          {/* Search and Filters */}
          <div className="mt-6 flex flex-col sm:flex-row items-center gap-3 max-w-2xl">
            <div className="relative w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search clearances by name, department, or legal act..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-800/90 border border-slate-700 rounded-lg text-white placeholder-slate-400 text-sm focus:outline-hidden focus:border-[#FE7251] focus:ring-1 focus:ring-[#FE7251]"
              />
            </div>

            <div className="flex items-center gap-1.5 w-full sm:w-auto shrink-0">
              {(["All", "Pre-Establishment", "Pre-Operation"] as const).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
                    selectedCategory === cat
                      ? "bg-[#FE7251] text-white"
                      : "bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white"
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
      <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-slate-900">
            Available Online Clearances ({filteredApprovals.length})
          </h2>
          <span className="text-xs text-slate-500">
            Integrated Common Application Engine
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredApprovals.map((approval) => (
            <Card
              key={approval.meta.id}
              className="p-5 flex flex-col justify-between hover:border-slate-300 transition-colors"
            >
              <div>
                {/* Header: Icon + Department + Category Badge */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                      {renderIcon(approval.meta.iconName)}
                    </div>
                    <div>
                      <span className="text-[11px] font-semibold text-[#FE7251] uppercase tracking-wider block">
                        {approval.meta.departmentCode}
                      </span>
                      <span className="text-xs text-slate-500 line-clamp-1">
                        {approval.meta.department}
                      </span>
                    </div>
                  </div>

                  <Badge
                    variant={approval.meta.category === "Pre-Establishment" ? "info" : "warning"}
                  >
                    {approval.meta.category}
                  </Badge>
                </div>

                {/* Title */}
                <h3 className="text-base font-semibold text-slate-900">
                  {approval.meta.title}
                </h3>

                {/* Description */}
                <p className="text-xs text-slate-600 mt-1.5 line-clamp-2 leading-relaxed">
                  {approval.meta.description}
                </p>

                {/* Meta Attributes Bar */}
                <div className="grid grid-cols-3 gap-2 mt-4 p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-center">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-medium block">Statutory SLA</span>
                    <span className="text-xs font-semibold text-slate-800 block mt-0.5">
                      {approval.meta.slaDays} Days
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-medium block">Documents</span>
                    <span className="text-xs font-semibold text-slate-800 block mt-0.5">
                      {approval.documents.filter((d) => d.mandatory).length} Mandatory
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-medium block">Fee Method</span>
                    <span className="text-xs font-semibold text-emerald-700 block mt-0.5">
                      Online Treasury
                    </span>
                  </div>
                </div>

                {/* Legal Act Footnote */}
                <p className="text-[11px] text-slate-400 mt-2.5 truncate">
                  <span className="font-medium text-slate-500">Statutory Act:</span> {approval.meta.act}
                </p>
              </div>

              {/* Action Footer */}
              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-500">
                  Ready for Online Submission
                </span>

                <Link
                  href={`/apply/${approval.meta.slug}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#FE7251] hover:bg-[#E85E3E] text-white text-xs font-medium transition-colors"
                >
                  <span>Apply Online</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}

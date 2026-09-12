"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Search,
  ArrowRight,
  FileSearch,
  CheckCircle2,
  Clock,
  Building2,
  AlertTriangle,
  FileText,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import { usePageTitle } from "@/hooks/usePageTitle";
import { Button } from "@/components/ui/button";
import { useEnterpriseStore } from "@/store/enterpriseStore";

export default function TrackApplicationPage() {
  usePageTitle("Track Your Application | AARAMBH");
  const { applicationRef, clearances, dagNodeStatuses, isAssessed, sector } = useEnterpriseStore();

  const [appId, setAppId] = useState(applicationRef || "MH-CAF-2026-00412");
  const [hasSearched, setHasSearched] = useState(false);

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    setHasSearched(true);
  };

  const activeClearances = clearances && clearances.length > 0 ? clearances : [
    {
      id: "clr-midc-land",
      name: "MIDC Plot Allotment & Building Plan Approval",
      department: "Maharashtra Industrial Development Corporation (MIDC)",
      slaDays: 15,
      category: "Pre-Establishment",
      status: "approved" as const,
      description: "Zonal land allotment, architectural floor area ratio (FAR), and building plan sanction.",
      feeEstimate: "₹25,000",
    },
    {
      id: "clr-mpcb-cte",
      name: "Consent to Establish (CTE) - Orange Category",
      department: "Maharashtra Pollution Control Board (MPCB)",
      slaDays: 21,
      category: "Pre-Establishment",
      status: "in_review" as const,
      description: "Air, Water, and Hazardous waste pollution control clearance under Water & Air Acts.",
      feeEstimate: "₹45,000",
    },
    {
      id: "clr-fire-noc",
      name: "Provisional Fire Safety NOC",
      department: "Directorate of Maharashtra Fire Services",
      slaDays: 14,
      category: "Pre-Establishment",
      status: "in_review" as const,
      description: "Fire prevention, static water tank capacity, and emergency egress plan verification.",
      feeEstimate: "₹15,000",
    },
    {
      id: "clr-dish-license",
      name: "Factory License & Safety Sign-off (DISH)",
      department: "Directorate of Industrial Safety & Health (DISH)",
      slaDays: 15,
      category: "Pre-Operation",
      status: "pending" as const,
      description: "Consolidated factory layout and worker occupational safety compliance certificate.",
      feeEstimate: "₹20,000",
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
      case "deemed_approved":
        return { label: "Approved ✓", bg: "bg-emerald-50 text-emerald-800 border-emerald-200" };
      case "in_review":
      case "submitted":
        return { label: "Under Department Review", bg: "bg-amber-50 text-amber-900 border-amber-300" };
      default:
        return { label: "Awaiting Upstream", bg: "bg-slate-100 text-slate-600 border-slate-200" };
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Hero Header */}
      <section className="bg-slate-900 text-white border-b border-slate-800 py-12">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-[#FE7251] text-xs font-bold uppercase tracking-wider mb-3">
              RTS Act 2015 Transparency
            </span>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Track Existing Application
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
              Check the live status of your statutory clearances, desk scrutiny, joint inspections, and deemed approval countdowns across Maharashtra departments.
            </p>
          </div>
        </div>
      </section>

      {/* Search Input Card */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
          <form onSubmit={handleTrack} className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="appId" className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Application / Master CAF Reference ID
                </label>
                {applicationRef && (
                  <button
                    type="button"
                    onClick={() => {
                      setAppId(applicationRef);
                      setHasSearched(true);
                    }}
                    className="text-[11px] font-bold text-[#FE7251] hover:underline"
                  >
                    Use my active application ({applicationRef})
                  </button>
                )}
              </div>
              <div className="flex gap-2">
                <input
                  id="appId"
                  type="text"
                  required
                  value={appId}
                  onChange={(e) => setAppId(e.target.value)}
                  placeholder="e.g. MH-CAF-2026-00412"
                  className="flex-1 px-4 py-3 text-sm rounded-xl border border-slate-300 font-mono font-bold focus:outline-hidden focus:ring-2 focus:ring-[#FE7251]/30 focus:border-[#FE7251]"
                />
                <Button type="submit" className="px-6">
                  <Search className="w-4 h-4" />
                  <span>Track Status</span>
                </Button>
              </div>
            </div>
          </form>

          {/* Demonstration Quick Selector */}
          <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
            <span>Quick sample refs:</span>
            {["MH-CAF-2026-00412", "MH-CAF-2026-00398", "MH-CAF-2026-00385"].map((ref) => (
              <button
                key={ref}
                type="button"
                onClick={() => {
                  setAppId(ref);
                  setHasSearched(true);
                }}
                className="font-mono font-bold text-[#9B2A48] bg-[#FFF2DF] px-2 py-0.5 rounded border border-[#FED17A] hover:bg-[#FFE6C4]"
              >
                {ref}
              </button>
            ))}
          </div>
        </div>

        {/* Live Tracking Journey Result */}
        {hasSearched && (
          <div className="mt-8 space-y-6 animate-in fade-in duration-300">
            {/* Overview Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-black text-[#9B2A48]">{appId}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-200">
                      Under Scrutiny
                    </span>
                  </div>
                  <h2 className="text-base font-bold text-slate-900 mt-1">
                    Integrated Common Application Form (CAF) Dossier
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Sector: {sector || "Industrial Manufacturing"} • Single Window Node: Mantralaya, Mumbai
                  </p>
                </div>

                <Link
                  href="/login?redirect=%2Fdashboard"
                  className="inline-flex items-center space-x-1 px-3.5 py-2 rounded-xl bg-[#FE7251] hover:bg-[#E85E3E] text-white text-xs font-bold shadow-xs transition-colors shrink-0"
                >
                  <span>Open Full Dashboard</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* 5-Stage Visual Journey Stepper */}
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-5 gap-3">
                {[
                  { step: "01", title: "CAF Submitted", sub: "Dispatched to 5 portals", done: true },
                  { step: "02", title: "Dossier Verified", sub: "Pre-validation passed", done: true },
                  { step: "03", title: "Desk Review", sub: "Scrutiny Officers assigned", active: true },
                  { step: "04", title: "Joint Inspection", sub: "Single field visit scheduled", pending: true },
                  { step: "05", title: "Final Grant / Deemed", sub: "Deemed order guarantee", pending: true },
                ].map((s, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-xl border flex flex-col justify-between ${
                      s.done
                        ? "bg-emerald-50/60 border-emerald-200"
                        : s.active
                        ? "bg-[#FFF9F5] border-[#FED17A] ring-1 ring-[#FE7251]"
                        : "bg-slate-50 border-slate-200 opacity-60"
                    }`}
                  >
                    <div>
                      <span className={`text-[10px] font-bold font-mono ${s.done ? "text-emerald-700" : s.active ? "text-[#FE7251]" : "text-slate-400"}`}>
                        STEP {s.step}
                      </span>
                      <p className="text-xs font-bold text-slate-900 mt-0.5">{s.title}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">{s.sub}</p>
                    </div>
                    <span className="mt-2 text-[10px] font-semibold flex items-center gap-1">
                      {s.done && <span className="text-emerald-700">✓ Completed</span>}
                      {s.active && <span className="text-[#FE7251] font-bold animate-pulse">● In Scrutiny</span>}
                      {s.pending && <span className="text-slate-400">Scheduled</span>}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Department-wise Clearance Status */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Department-Wise Clearance Scrutiny
                </h3>
                <span className="text-xs text-slate-500">
                  {activeClearances.length} Statutory Clearances
                </span>
              </div>

              <div className="divide-y divide-slate-100">
                {activeClearances.map((c) => {
                  const badge = getStatusBadge(c.status || "in_review");
                  return (
                    <div key={c.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 first:pt-0 last:pb-0">
                      <div className="space-y-1 max-w-lg">
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-bold text-slate-900">{c.name}</p>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badge.bg}`}>
                            {badge.label}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500">{c.department}</p>
                        <p className="text-[11px] text-slate-400">{c.description}</p>
                      </div>

                      <div className="flex items-center gap-4 text-xs shrink-0">
                        <div className="text-left sm:text-right">
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">Statutory SLA</span>
                          <span className="font-mono font-bold text-[#9B2A48] bg-[#FFF2DF] px-2 py-0.5 rounded border border-[#FED17A] inline-block mt-0.5">
                            {c.slaDays} Working Days
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right to Services Act Guarantee Notice */}
            <div className="p-4 rounded-xl bg-slate-900 text-white flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2.5">
                <ShieldCheck className="w-5 h-5 text-[#FE7251] shrink-0" />
                <div>
                  <p className="font-bold">Guaranteed Deemed Approval under Maharashtra RTS Act 2015</p>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    If department review exceeds statutory SLA without rejection, deemed clearance is issued automatically.
                  </p>
                </div>
              </div>
              <Link
                href="/login?redirect=%2Fdashboard%2Fsla"
                className="font-bold text-[#FE7251] hover:underline whitespace-nowrap ml-4"
              >
                Track Live Countdowns →
              </Link>
            </div>
          </div>
        )}

        {/* Guidance Footer */}
        <div className="mt-6 pt-5 border-t border-slate-200 flex items-center gap-2.5 text-xs text-slate-500">
          <FileSearch className="w-4 h-4 text-[#FE7251] shrink-0" />
          <p>
            Where is my application ID? It is displayed on your CAF submission confirmation screen and in the confirmation receipt downloaded from your dashboard.
          </p>
        </div>
      </section>
    </div>
  );
}

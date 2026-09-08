"use client";

import React from "react";
import Link from "next/link";
import {
  Compass,
  FolderLock,
  GitFork,
  Clock,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Building2,
  FileCheck2,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Layers,
  Award,
  Zap,
  FileSpreadsheet,
  CalendarCheck,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { useEnterpriseStore } from "@/store/enterpriseStore";

export default function DashboardHomePage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { clearances, applicationRef, applicationStatus, isAssessed, sector, locationZone } = useEnterpriseStore();

  const userName = user?.name || "Investor";
  const isOfficer = user?.role === "officer";

  // Dynamic KPI Calculations
  const activeClearancesCount = clearances.length > 0 ? clearances.length : 5;
  const parallelLeadTimeDays = clearances.length > 0
    ? Math.max(...clearances.map((c) => c.slaDays))
    : 21;
  const deemedApprovalsCount = clearances.filter((c) => c.status === "approved" || c.status === "deemed_approved").length;

  // KPI Data
  const kpiData = [
    {
      title: t("dash.kpi_active", "Active Clearances"),
      value: String(activeClearancesCount),
      suffix: " Approvals",
      change: isAssessed ? `${sector} Sector` : t("dash.kpi_active_sub", "Statutory MH Clearances"),
      changeType: "neutral",
      icon: Layers,
      color: "text-[#9B2A48] bg-[#FFF2DF] border border-[#FED17A]/60",
    },
    {
      title: t("dash.kpi_parallel", "Parallel Lead Time"),
      value: String(parallelLeadTimeDays),
      suffix: " Days",
      change: t("dash.kpi_parallel_sub", "vs 120+ sequential days"),
      changeType: "positive",
      icon: GitFork,
      color: "text-[#FE7251] bg-[#FFF2DF] border border-[#FED17A]/60",
    },
    {
      title: t("dash.kpi_sla", "SLA Compliance"),
      value: "100%",
      suffix: "",
      change: t("dash.kpi_sla_sub", "Under Maharashtra RTS Act"),
      changeType: "positive",
      icon: Clock,
      color: "text-[#9B2A48] bg-[#FFF2DF] border border-[#FED17A]/60",
    },
    {
      title: t("dash.kpi_deemed", "Deemed Approvals"),
      value: String(deemedApprovalsCount > 0 ? deemedApprovalsCount : "Guaranteed"),
      suffix: deemedApprovalsCount > 0 ? " Issued" : "",
      change: t("dash.kpi_deemed_sub", "Auto-issued on statutory timeout"),
      changeType: "positive",
      icon: Award,
      color: "text-[#FE7251] bg-[#FFF2DF] border border-[#FED17A]/60",
    },
  ];

  // Quick Action Feature Buttons
  const quickActions = [
    {
      title: t("dash.kya", "Know Your Approvals"),
      subtitle: "Evaluate required statutory approvals & incentives",
      href: "/dashboard/kya",
      icon: Compass,
      btnLabel: "Run Assessment",
      accent: "border-[#F0E5E0] hover:border-[#FE7251]/60 bg-white",
      iconColor: "text-[#9B2A48] bg-[#FFF2DF] border border-[#FED17A]/60",
    },
    {
      title: "Unified Common Application Form",
      subtitle: "Single Master Form dispatching to 5+ State & Central Departments",
      href: "/dashboard/caf",
      icon: FileSpreadsheet,
      btnLabel: "Fill Unified CAF",
      accent: "border-[#F0E5E0] hover:border-[#FE7251]/60 bg-white",
      iconColor: "text-[#FE7251] bg-[#FFF2DF] border border-[#FED17A]/60",
    },
    {
      title: t("dash.vault", "Document Vault"),
      subtitle: "OCR verification & DigiLocker document sync",
      href: "/dashboard/vault",
      icon: FolderLock,
      btnLabel: "Manage Vault",
      accent: "border-[#F0E5E0] hover:border-[#FE7251]/60 bg-white",
      iconColor: "text-[#9B2A48] bg-[#FFF2DF] border border-[#FED17A]/60",
    },
    {
      title: t("dash.dag", "Parallel Clearance DAG"),
      subtitle: "Inspect multi-department parallel dependency graphs",
      href: "/dashboard/dag",
      icon: GitFork,
      btnLabel: "View Pipelines",
      accent: "border-[#F0E5E0] hover:border-[#FE7251]/60 bg-white",
      iconColor: "text-[#FE7251] bg-[#FFF2DF] border border-[#FED17A]/60",
    },
    {
      title: t("dash.sla", "SLA Tracker & Deemed Approvals"),
      subtitle: "Real-time statutory countdowns & deemed approvals",
      href: "/dashboard/sla",
      icon: Clock,
      btnLabel: "Track Timelines",
      accent: "border-[#F0E5E0] hover:border-[#FE7251]/60 bg-white",
      iconColor: "text-[#9B2A48] bg-[#FFF2DF] border border-[#FED17A]/60",
    },
    {
      title: "Joint Department Inspections",
      subtitle: "Synchronized MPCB, Fire & DISH site inspection scheduler",
      href: "/dashboard/inspections",
      icon: CalendarCheck,
      btnLabel: "Inspect Calendar",
      accent: "border-[#F0E5E0] hover:border-[#FE7251]/60 bg-white",
      iconColor: "text-[#FE7251] bg-[#FFF2DF] border border-[#FED17A]/60",
    },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* 1. WELCOME GREETING HEADER */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#F0E5E0] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center space-x-2 text-xs font-bold text-[#9B2A48] bg-[#FFF2DF] border border-[#FED17A] px-3 py-1 rounded-full uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5 text-[#FE7251]" />
            <span>Single Window Control Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#18080E] tracking-tight">
            Welcome back, {userName}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {isOfficer
              ? `Department Console: ${user?.department || "Maharashtra State Clearances Wing"}`
              : `Enterprise: ${user?.enterpriseName || "Maharashtra Solvents Ltd"} (ID: ${
                  user?.enterpriseId || "ENT-MH-2026-8891"
                })`}
          </p>
        </div>

        {/* Action button */}
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/kya"
            className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#9B2A48] via-[#FE7251] to-[#FE7251] hover:from-[#7D1E36] hover:to-[#E55B3B] text-white text-xs sm:text-sm font-bold shadow-md shadow-[#9B2A48]/20 transition-all cursor-pointer hover:scale-[1.02]"
          >
            <Compass className="w-4 h-4" />
            <span>New Clearance Assessment</span>
          </Link>
        </div>
      </div>

      {/* 2. STATS OVERVIEW CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiData.map((kpi, idx) => {
          const IconComp = kpi.icon;
          return (
            <div
              key={idx}
              className="bg-white rounded-2xl p-5 border border-[#F0E5E0] shadow-xs flex flex-col justify-between"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    {kpi.title}
                  </p>
                  <div className="flex items-baseline mt-2">
                    <span className="text-3xl font-black text-[#18080E] tracking-tight">
                      {kpi.value}
                    </span>
                    <span className="text-sm font-semibold text-slate-600 ml-1">
                      {kpi.suffix}
                    </span>
                  </div>
                </div>
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${kpi.color}`}>
                  <IconComp className="w-5 h-5" />
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[#F0E5E0] flex items-center justify-between text-xs text-slate-500">
                <span>{kpi.change}</span>
                <span className="text-[#9B2A48] bg-[#FFF2DF] border border-[#FED17A] px-2 py-0.5 rounded-full font-bold text-[10px]">Active</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. QUICK-ACTION BUTTON ROW (6 CORE FEATURES) */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-[#18080E]">Core Orchestration Modules</h2>
            <p className="text-xs text-slate-500">Direct shortcuts to AARAMBH single window automation tools</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickActions.map((action, idx) => {
            const IconComp = action.icon;
            return (
              <div
                key={idx}
                className={`rounded-2xl p-6 border shadow-xs hover:shadow-lg transition-all duration-200 flex flex-col justify-between ${action.accent}`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center shadow-xs ${action.iconColor}`}>
                      <IconComp className="w-5 h-5" />
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-[#18080E]">{action.title}</h3>
                  <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">{action.subtitle}</p>
                </div>

                <div className="mt-5 pt-3 border-t border-[#F0E5E0]">
                  <Link
                    href={action.href}
                    className="inline-flex items-center space-x-1.5 text-xs font-bold text-[#9B2A48] hover:text-[#FE7251] transition-colors"
                  >
                    <span>{action.btnLabel}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. ACTIVE CLEARANCE PIPELINES OVERVIEW */}
      <div className="bg-white rounded-2xl border border-[#F0E5E0] overflow-hidden shadow-xs">
        <div className="p-6 border-b border-[#F0E5E0] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-[#18080E]">Active Parallel Approvals Tracker</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Current stage, SLA countdown, and departmental reviews for Application #{applicationRef || "MH-CAF-2026-00412"}
            </p>
          </div>
          <Link
            href="/dashboard/sla"
            className="text-xs font-bold text-[#9B2A48] hover:text-[#FE7251] hover:underline flex items-center space-x-1"
          >
            <span>Open Comprehensive SLA Tracker</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[#F0E5E0] text-xs">
            <thead className="bg-[#FFF9F5] text-[#9B2A48] font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-6 py-3 text-left">Department / Authority</th>
                <th className="px-6 py-3 text-left">Clearance Required</th>
                <th className="px-6 py-3 text-left">Category</th>
                <th className="px-6 py-3 text-left">Statutory SLA</th>
                <th className="px-6 py-3 text-left">Status</th>
                <th className="px-6 py-3 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0E5E0] font-medium text-slate-800">
              {clearances.map((clr) => {
                const isResolved = clr.status === "approved" || clr.status === "deemed_approved";
                const isQuery = clr.id === "clr-fire-noc";

                return (
                  <tr key={clr.id} className="hover:bg-[#FFF9F5]/70">
                    <td className="px-6 py-3.5 font-bold text-slate-900">{clr.department}</td>
                    <td className="px-6 py-3.5">{clr.name}</td>
                    <td className="px-6 py-3.5 text-slate-500">
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700">
                        {clr.category}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 font-semibold text-[#FE7251]">
                      {isResolved ? "Completed ✓" : `${clr.slaDays} Working Days`}
                    </td>
                    <td className="px-6 py-3.5">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          isResolved
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : isQuery
                            ? "bg-[#FFF2DF] text-[#FE7251] border-[#FED17A]"
                            : "bg-[#FFF2DF] text-[#9B2A48] border-[#FED17A]"
                        }`}
                      >
                        {isResolved
                          ? "Approved ✓"
                          : isQuery
                          ? "Query Pending"
                          : "Under Review"}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      {isQuery ? (
                        <Link
                          href="/dashboard/grievances"
                          className="text-[#FE7251] font-bold hover:underline"
                        >
                          Respond
                        </Link>
                      ) : (
                        <Link
                          href="/dashboard/dag"
                          className="text-[#9B2A48] font-bold hover:text-[#FE7251] hover:underline"
                        >
                          Graph Node
                        </Link>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

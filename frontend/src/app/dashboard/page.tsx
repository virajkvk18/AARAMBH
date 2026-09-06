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
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function DashboardHomePage() {
  const { user } = useAuth();

  const userName = user?.name || "Investor";
  const isOfficer = user?.role === "officer";

  // KPI Data
  const kpiData = [
    {
      title: "Clearances Identified",
      value: "12",
      suffix: " Approvals",
      change: "6 Pre-Est • 6 Pre-Op",
      changeType: "neutral",
      icon: Layers,
      color: "text-indigo-600 bg-indigo-50",
    },
    {
      title: "Active Parallel Pipelines",
      value: "4",
      suffix: " Departments",
      change: "MIDC, MPCB, Fire, DISH",
      changeType: "positive",
      icon: GitFork,
      color: "text-emerald-600 bg-emerald-50",
    },
    {
      title: "Projected Lead Time Saved",
      value: "42",
      suffix: " Days",
      change: "Parallel vs Sequential routing",
      changeType: "positive",
      icon: Clock,
      color: "text-purple-600 bg-purple-50",
    },
    {
      title: "Eligible Subsidies",
      value: "₹2.4",
      suffix: " Cr",
      change: "PSI 2019 Scheme Eligible",
      changeType: "positive",
      icon: Award,
      color: "text-amber-600 bg-amber-50",
    },
  ];

  // Quick Action Feature Buttons
  const quickActions = [
    {
      title: "KYA Wizard",
      subtitle: "Evaluate required statutory approvals & incentives",
      href: "/dashboard/kya",
      icon: Compass,
      btnLabel: "Run Assessment",
      accent: "border-indigo-200 hover:border-indigo-400 bg-gradient-to-br from-white to-indigo-50/40",
      iconColor: "text-indigo-600 bg-indigo-100/70",
    },
    {
      title: "Document Vault",
      subtitle: "AI OCR verification & DigiLocker document sync",
      href: "/dashboard/document-vault",
      icon: FolderLock,
      btnLabel: "Manage Vault",
      accent: "border-blue-200 hover:border-blue-400 bg-gradient-to-br from-white to-blue-50/40",
      iconColor: "text-blue-600 bg-blue-100/70",
    },
    {
      title: "DAG Workflow",
      subtitle: "Inspect multi-department parallel dependency graphs",
      href: "/dashboard/workflows",
      icon: GitFork,
      btnLabel: "View Pipelines",
      accent: "border-purple-200 hover:border-purple-400 bg-gradient-to-br from-white to-purple-50/40",
      iconColor: "text-purple-600 bg-purple-100/70",
    },
    {
      title: "SLA Tracker",
      subtitle: "Real-time statutory countdowns & deemed approvals",
      href: "/dashboard/sla-tracker",
      icon: Clock,
      btnLabel: "Track Timelines",
      accent: "border-emerald-200 hover:border-emerald-400 bg-gradient-to-br from-white to-emerald-50/40",
      iconColor: "text-emerald-600 bg-emerald-100/70",
    },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* 1. WELCOME GREETING HEADER */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-indigo-600 uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" />
            <span>Single Window Control Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#0F172A] tracking-tight">
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
            className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs sm:text-sm font-semibold shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
          >
            <Compass className="w-4 h-4" />
            <span>New Clearance Assessment</span>
          </Link>
        </div>
      </div>

      {/* 2. KPI CARDS ROW (4 CARDS) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {kpiData.map((kpi, idx) => {
          const IconComp = kpi.icon;
          return (
            <div
              key={idx}
              className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    {kpi.title}
                  </p>
                  <div className="mt-2 flex items-baseline">
                    <span className="text-3xl font-black text-[#0F172A] tracking-tight">
                      {kpi.value}
                    </span>
                    <span className="text-sm font-semibold text-slate-600 ml-1">
                      {kpi.suffix}
                    </span>
                  </div>
                </div>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${kpi.color}`}>
                  <IconComp className="w-5 h-5" />
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>{kpi.change}</span>
                <span className="text-emerald-600 font-bold text-[11px]">Active</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. QUICK-ACTION BUTTON ROW (4 CORE FEATURES) */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-[#0F172A]">Core Orchestration Modules</h2>
            <p className="text-xs text-slate-500">Direct shortcuts to AARAMBH single window automation tools</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, idx) => {
            const IconComp = action.icon;
            return (
              <div
                key={idx}
                className={`rounded-2xl p-5 border shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between ${action.accent}`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-xs ${action.iconColor}`}>
                      <IconComp className="w-5 h-5" />
                    </div>
                  </div>

                  <h3 className="text-sm font-bold text-[#0F172A]">{action.title}</h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{action.subtitle}</p>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-200/60">
                  <Link
                    href={action.href}
                    className="inline-flex items-center space-x-1.5 text-xs font-bold text-[#4F46E5] hover:text-[#4338CA] transition-colors"
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
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-[#0F172A]">Active Parallel Approvals Tracker</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Current stage, SLA countdown, and departmental reviews for Application #MH-CAF-2026-00412
            </p>
          </div>
          <Link
            href="/dashboard/sla-tracker"
            className="text-xs font-bold text-[#4F46E5] hover:underline flex items-center space-x-1"
          >
            <span>Open Comprehensive SLA Tracker</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100 text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-6 py-3 text-left">Department / Authority</th>
                <th className="px-6 py-3 text-left">Clearance Required</th>
                <th className="px-6 py-3 text-left">Stage</th>
                <th className="px-6 py-3 text-left">Statutory SLA</th>
                <th className="px-6 py-3 text-left">Status</th>
                <th className="px-6 py-3 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
              <tr className="hover:bg-slate-50/70">
                <td className="px-6 py-3.5 font-bold text-slate-900">MIDC Planning Wing</td>
                <td className="px-6 py-3.5">Plot Allotment & Building Plan</td>
                <td className="px-6 py-3.5 text-slate-500">Field Scrutiny Complete</td>
                <td className="px-6 py-3.5 font-semibold text-emerald-600">4 Days Remaining</td>
                <td className="px-6 py-3.5">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-[#059669] border border-emerald-200">
                    On Schedule
                  </span>
                </td>
                <td className="px-6 py-3.5 text-right">
                  <Link href="/dashboard/workflows" className="text-indigo-600 font-bold hover:underline">
                    Graph Node
                  </Link>
                </td>
              </tr>

              <tr className="hover:bg-slate-50/70">
                <td className="px-6 py-3.5 font-bold text-slate-900">MPCB (Environment)</td>
                <td className="px-6 py-3.5">Consent to Establish (CTE) - Red</td>
                <td className="px-6 py-3.5 text-slate-500">Technical Committee Review</td>
                <td className="px-6 py-3.5 font-semibold text-emerald-600">11 Days Remaining</td>
                <td className="px-6 py-3.5">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-[#059669] border border-emerald-200">
                    Under Review
                  </span>
                </td>
                <td className="px-6 py-3.5 text-right">
                  <Link href="/dashboard/workflows" className="text-indigo-600 font-bold hover:underline">
                    Graph Node
                  </Link>
                </td>
              </tr>

              <tr className="hover:bg-slate-50/70">
                <td className="px-6 py-3.5 font-bold text-slate-900">State Fire Directorate</td>
                <td className="px-6 py-3.5">Provisional Fire NOC</td>
                <td className="px-6 py-3.5 text-slate-500">Clarification On Water Reservoir</td>
                <td className="px-6 py-3.5 font-semibold text-amber-600">3 Days To Respond</td>
                <td className="px-6 py-3.5">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-[#D97706] border border-amber-200">
                    Query Pending
                  </span>
                </td>
                <td className="px-6 py-3.5 text-right">
                  <Link href="/dashboard/grievances" className="text-amber-600 font-bold hover:underline">
                    Respond
                  </Link>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

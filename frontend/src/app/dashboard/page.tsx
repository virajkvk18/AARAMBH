"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Compass,
  FolderLock,
  GitFork,
  Clock,
  ArrowRight,
  Layers,
  Award,
  FileSpreadsheet,
  CalendarCheck,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { useEnterpriseStore } from "@/store/enterpriseStore";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function DashboardHomePage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { clearances, renewals, applicableIncentives, isAssessed, sector } = useEnterpriseStore();

  const [activeTab, setActiveTab] = useState<"approvals" | "renewals" | "incentives">("approvals");

  const getBadgeInfo = (days: number) => {
    if (days <= 30) return { label: `${days} Days – Critical`, variant: "destructive" as const };
    if (days <= 60) return { label: `${days} Days – Attention`, variant: "warning" as const };
    if (days <= 90) return { label: `${days} Days – Upcoming`, variant: "warning" as const };
    return { label: `${days} Days – Safe`, variant: "success" as const };
  };

  const initiateRenewal = (id: string) => {
    const store = useEnterpriseStore.getState();
    store.initiateRenewal?.(id);
    alert("Fast-track renewal initiated for ID: " + id);
  };

  const userName = user?.name || "Investor";
  const isOfficer = user?.role === "officer";

  // Dynamic KPI Calculations
  const activeClearancesCount = clearances.length > 0 ? clearances.length : 5;
  const parallelLeadTimeDays = clearances.length > 0
    ? Math.max(...clearances.map((c) => c.slaDays))
    : 21;
  const deemedApprovalsCount = clearances.filter((c) => c.status === "approved" || c.status === "deemed_approved").length;

  const kpiData = [
    {
      title: t("dash.kpi_active", "Active Clearances"),
      value: String(activeClearancesCount),
      suffix: " Approvals",
      change: isAssessed ? `${sector} Sector` : t("dash.kpi_active_sub", "Statutory MH Clearances"),
      icon: Layers,
    },
    {
      title: t("dash.kpi_parallel", "Parallel Lead Time"),
      value: String(parallelLeadTimeDays),
      suffix: " Days",
      change: t("dash.kpi_parallel_sub", "vs 120+ sequential days"),
      icon: GitFork,
    },
    {
      title: t("dash.kpi_sla", "SLA Compliance"),
      value: "100%",
      suffix: "",
      change: t("dash.kpi_sla_sub", "Under Maharashtra RTS Act"),
      icon: Clock,
    },
    {
      title: t("dash.kpi_deemed", "Deemed Approvals"),
      value: String(deemedApprovalsCount > 0 ? deemedApprovalsCount : "Guaranteed"),
      suffix: deemedApprovalsCount > 0 ? " Issued" : "",
      change: t("dash.kpi_deemed_sub", "Auto-issued on statutory timeout"),
      icon: Award,
    },
  ];

  const quickActions = [
    {
      title: t("dash.kya", "Know Your Approvals"),
      subtitle: "Evaluate required statutory approvals & incentives",
      href: "/dashboard/kya",
      icon: Compass,
      btnLabel: "Run Assessment",
    },
    {
      title: "Unified Common Application Form",
      subtitle: "Single Master Form dispatching to 5+ State & Central Departments",
      href: "/dashboard/caf",
      icon: FileSpreadsheet,
      btnLabel: "Fill Unified CAF",
    },
    {
      title: t("dash.vault", "Document Vault"),
      subtitle: "OCR verification & DigiLocker document sync",
      href: "/dashboard/vault",
      icon: FolderLock,
      btnLabel: "Manage Vault",
    },
    {
      title: t("dash.dag", "Parallel Clearance DAG"),
      subtitle: "Inspect multi-department parallel dependency graphs",
      href: "/dashboard/dag",
      icon: GitFork,
      btnLabel: "View Pipelines",
    },
    {
      title: t("dash.sla", "SLA Tracker & Deemed Approvals"),
      subtitle: "Real-time statutory countdowns & deemed approvals",
      href: "/dashboard/sla",
      icon: Clock,
      btnLabel: "Track Timelines",
    },
    {
      title: "Joint Department Inspections",
      subtitle: "Synchronized MPCB, Fire & DISH site inspection scheduler",
      href: "/dashboard/inspections",
      icon: CalendarCheck,
      btnLabel: "Inspect Calendar",
    },
  ];

  const renderTabBar = (
    <div className="flex space-x-2">
      <button
        type="button"
        className={`px-3.5 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
          activeTab === "approvals"
            ? "bg-[#FE7251] text-white"
            : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
        }`}
        onClick={() => setActiveTab("approvals")}
      >
        Active Approvals
      </button>
      <button
        type="button"
        className={`px-3.5 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
          activeTab === "renewals"
            ? "bg-[#FE7251] text-white"
            : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
        }`}
        onClick={() => setActiveTab("renewals")}
      >
        Statutory Renewals
      </button>
      <button
        type="button"
        className={`px-3.5 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
          activeTab === "incentives"
            ? "bg-[#FE7251] text-white"
            : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
        }`}
        onClick={() => setActiveTab("incentives")}
      >
        Eligible Incentives
      </button>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case "approvals":
        return (
          <Card className="overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900">Active Statutory Clearances</h3>
              <span className="text-xs text-slate-500">{clearances.length} Tracked</span>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-100 text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold text-left">
                  <tr>
                    <th className="px-5 py-3">Clearance Name</th>
                    <th className="px-5 py-3">Department</th>
                    <th className="px-5 py-3">Statutory SLA</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800">
                  {clearances.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-5 py-3 font-medium text-slate-900">{c.name}</td>
                      <td className="px-5 py-3 text-slate-600">{c.department}</td>
                      <td className="px-5 py-3">{c.slaDays} Days</td>
                      <td className="px-5 py-3">
                        <Badge
                          variant={
                            (c.status as string) === "approved" || (c.status as string) === "deemed_approved"
                              ? "success"
                              : (c.status as string) === "in_progress" || (c.status as string) === "in_review" || (c.status as string) === "pending"
                              ? "warning"
                              : "secondary"
                          }
                        >
                          {(c.status || "pending").replace("_", " ")}
                        </Badge>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <Link
                          href="/dashboard/sla"
                          className="text-[#FE7251] font-medium hover:underline text-xs"
                        >
                          Track SLA
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        );

      case "renewals":
        return (
          <Card className="overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900">Statutory Renewals</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-100 text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold text-left">
                  <tr>
                    <th className="px-5 py-3">Clearance Title</th>
                    <th className="px-5 py-3">Issuing Authority</th>
                    <th className="px-5 py-3">Validity Period</th>
                    <th className="px-5 py-3">Expiry Date</th>
                    <th className="px-5 py-3">Urgency</th>
                    <th className="px-5 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800">
                  {renewals.map((r) => {
                    const expiry = new Date(Date.now() + r.daysRemaining * 24 * 60 * 60 * 1000).toLocaleDateString();
                    const badge = getBadgeInfo(r.daysRemaining);
                    return (
                      <tr key={r.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-5 py-3 font-medium text-slate-900">{r.clearanceTitle}</td>
                        <td className="px-5 py-3 text-slate-600">{r.issuingAuthority}</td>
                        <td className="px-5 py-3">{r.validityPeriod}</td>
                        <td className="px-5 py-3">{expiry}</td>
                        <td className="px-5 py-3">
                          <Badge variant={badge.variant}>{badge.label}</Badge>
                        </td>
                        <td className="px-5 py-3 text-right">
                          <button
                            type="button"
                            className="text-xs font-medium text-[#FE7251] hover:underline cursor-pointer"
                            onClick={() => initiateRenewal(r.id)}
                          >
                            Fast-Track
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        );

      case "incentives":
        return (
          <Card className="p-5">
            {applicableIncentives && applicableIncentives.length > 0 ? (
              <ul className="divide-y divide-slate-100">
                {applicableIncentives.map((inc, idx) => (
                  <li key={idx} className="py-2.5 text-xs text-slate-800 flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#FE7251] mt-1.5 shrink-0" />
                    <span>{inc}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-slate-500">No eligible incentives available.</p>
            )}
          </Card>
        );
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 1. WELCOME GREETING HEADER */}
      <Card className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-semibold text-[#FE7251] uppercase tracking-wider block mb-1">
            Single Window Control Center
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Welcome back, {userName}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {isOfficer
              ? `Department Console: ${user?.department || "Maharashtra State Clearances Wing"}`
              : `Enterprise: ${user?.enterpriseName || "Smart Electronics"} (ID: ${
                  user?.enterpriseId || "ENT-MH-2026-8891"
                })`}
          </p>
        </div>

        <div>
          <Link href="/dashboard/kya">
            <Button className="w-full sm:w-auto">
              <Compass className="w-4 h-4" />
              <span>New Clearance Assessment</span>
            </Button>
          </Link>
        </div>
      </Card>

      {/* 2. STATS OVERVIEW CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiData.map((kpi, idx) => {
          const IconComp = kpi.icon;
          return (
            <Card key={idx} className="p-4 flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
                    {kpi.title}
                  </p>
                  <div className="flex items-baseline mt-1.5">
                    <span className="text-2xl font-bold text-slate-900 tracking-tight">
                      {kpi.value}
                    </span>
                    <span className="text-xs text-slate-500 ml-1">
                      {kpi.suffix}
                    </span>
                  </div>
                </div>
                <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                  <IconComp className="w-4 h-4" />
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-100 text-xs text-slate-500">
                <span>{kpi.change}</span>
              </div>
            </Card>
          );
        })}
      </div>

      {/* 3. QUICK-ACTION MODULES */}
      <div>
        <div className="mb-3">
          <h2 className="text-sm font-semibold text-slate-900">Core Orchestration Modules</h2>
          <p className="text-xs text-slate-500">Direct shortcuts to AARAMBH single window automation tools</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {quickActions.map((action, idx) => {
            const IconComp = action.icon;
            return (
              <Card
                key={idx}
                className="p-4 flex flex-col justify-between hover:border-slate-300 transition-colors"
              >
                <div>
                  <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center mb-3">
                    <IconComp className="w-4.5 h-4.5 text-[#FE7251]" />
                  </div>

                  <h3 className="text-sm font-semibold text-slate-900">{action.title}</h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{action.subtitle}</p>
                </div>

                <div className="mt-4 pt-2.5 border-t border-slate-100">
                  <Link
                    href={action.href}
                    className="inline-flex items-center space-x-1.5 text-xs font-medium text-[#FE7251] hover:underline"
                  >
                    <span>{action.btnLabel}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* 4. TABS & DETAILED LISTS */}
      <div className="space-y-3">
        {renderTabBar}
        {renderContent()}
      </div>
    </div>
  );
}

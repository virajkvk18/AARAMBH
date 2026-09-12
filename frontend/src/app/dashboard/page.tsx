"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  TrendingDown,
  Building2,
  SlidersHorizontal,
  Sparkles,
  Zap,
  AlertTriangle,
  ShieldAlert,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { useEnterpriseStore } from "@/store/enterpriseStore";
import { SAMPLE_PROFILES, buildSampleAssessment } from "@/lib/sampleProjects";
import { useNotificationStore } from "@/store/notificationStore";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function DashboardHomePage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { clearances, renewals, applicableIncentives, isAssessed, sector, submittedAt } = useEnterpriseStore();

  const [activeTab, setActiveTab] = useState<"approvals" | "renewals" | "incentives">("approvals");
  const [renewalNotice, setRenewalNotice] = useState<string | null>(null);
  const name = user?.name || "Investor";
  const [toastDismissed, setToastDismissed] = useState(false);
  const [welcomeSeen] = useState(() => {
    if (typeof window === "undefined") return true;
    const seen = sessionStorage.getItem("aarambh_welcome_seen");
    sessionStorage.setItem("aarambh_welcome_seen", "1");
    return !!seen;
  });
  const welcomeToast = welcomeSeen || toastDismissed
    ? null
    : !isAssessed
      ? `Welcome to AARAMBH, ${name}. Let's set up your business profile to unlock your personalised approval roadmap.`
      : `Welcome back, ${name}.`;

  const getBadgeInfo = (days: number) => {
    if (days <= 30) return { label: `${days} Days – Critical`, variant: "destructive" as const };
    if (days <= 60) return { label: `${days} Days – Attention`, variant: "warning" as const };
    if (days <= 90) return { label: `${days} Days – Upcoming`, variant: "warning" as const };
    return { label: `${days} Days – Safe`, variant: "success" as const };
  };

  const initiateRenewal = (id: string) => {
    const store = useEnterpriseStore.getState();
    store.initiateRenewal?.(id);
    const title = renewals.find((r) => r.id === id)?.clearanceTitle || id;
    useNotificationStore.getState().addNotification({
      type: "renewal",
      title: "Renewal Fast-Tracked",
      message: `${title} fast-track renewal dispatched to issuing authority for expedited processing.`,
      severity: "warning",
      target: "/dashboard",
    });
    setRenewalNotice(title);
  };

  const userName = user?.name || "Investor";
  const isOfficer = user?.role === "OFFICER";

  // Dynamic KPI Calculations
  const activeClearancesCount = clearances.length;
  const elapsedSlaDays = submittedAt ? Math.max(0, (new Date().getTime() - new Date(submittedAt).getTime()) / 86400000) : 0;
  const parallelLeadTimeDays = clearances.length > 0
    ? Math.max(...clearances.map((c) => c.slaDays))
    : 21;
  const deemedApprovalsCount = clearances.filter((c) => c.status === "approved" || c.status === "deemed_approved").length;
  const slaCompliancePct = clearances.length > 0
    ? Math.round(
        (clearances.filter((c) => {
          if (c.status === "approved" || c.status === "deemed_approved") return true;
          if (c.status === "pending") return true;
          return (c.status === "in_review" || c.status === "submitted") && elapsedSlaDays < (c.slaDays || 14);
        }).length / clearances.length) * 100
      )
    : 100;

  const kpiData = [
    {
      title: t("dash.kpi_active", "Active Clearances"),
      value: String(activeClearancesCount),
      suffix: " Approvals",
      change: isAssessed ? `${sector} Sector` : t("dash.kpi_active_sub", "Statutory MH Clearances"),
      icon: Layers,
      href: "/dashboard/dag",
    },
    {
      title: t("dash.kpi_parallel", "Parallel Lead Time"),
      value: String(parallelLeadTimeDays),
      suffix: " Days",
      change: t("dash.kpi_parallel_sub", "vs 120+ sequential days"),
      icon: GitFork,
      href: "/dashboard/dag",
    },
    {
      title: t("dash.kpi_sla", "SLA Compliance"),
      value: `${slaCompliancePct}%`,
      suffix: "",
      change: t("dash.kpi_sla_sub", "Under Maharashtra RTS Act"),
      icon: Clock,
      href: "/dashboard/sla",
    },
    {
      title: t("dash.kpi_deemed", "Deemed Approvals"),
      value: String(deemedApprovalsCount),
      suffix: " Issued",
      change: t("dash.kpi_deemed_sub", "Auto-issued on statutory timeout"),
      icon: Award,
      href: "/dashboard/sla",
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
    {
      title: "Delay Analytics & Bottlenecks",
      subtitle: "SLA health, overdue detection & HoD escalation",
      href: "/dashboard/analytics",
      icon: TrendingDown,
      btnLabel: "Analyze Delays",
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
                          {r.status === "critical" ? (
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600">
                              ✓ Initiated
                            </span>
                          ) : (
                            <button
                              type="button"
                              className="text-xs font-medium text-[#FE7251] hover:underline cursor-pointer"
                              onClick={() => initiateRenewal(r.id)}
                            >
                              Fast-Track
                            </button>
                          )}
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

  const router = useRouter();

  const runSampleProject = (profileKey: string) => {
    const profile = SAMPLE_PROFILES.find((p) => p.sectorKey === profileKey);
    if (!profile) return;
    const result = buildSampleAssessment(profile);
    const store = useEnterpriseStore.getState();
    store.setFormData(result.formData);
    store.setAssessmentResult(result.riskTrack, result.clearances, result.incentives, result.policyDetails);
  };

  // Onboarding gate — show guided profile-completion flow before features unlock
  if (!isAssessed && !isOfficer) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <Card className="overflow-hidden">
          <div className="bg-gradient-to-r from-[#16060E] to-[#3A1020] px-6 sm:px-8 py-8 text-white">
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#FE7251] text-white text-xs font-bold uppercase tracking-wider">
              <Compass className="w-3.5 h-3.5" />
              <span>Single Window Onboarding</span>
            </span>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight mt-3">
              Complete your business profile<br />to unlock AARAMBH
            </h1>
            <p className="text-sm text-white/70 mt-2 leading-relaxed">
              AARAMBH generates a <strong className="text-white">customised approval checklist, incentives and SLA map</strong>{" "}
              that is unique to your sector, location and project size — not a generic list.
            </p>
          </div>

          <div className="p-6 sm:p-8">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                {
                  step: "Step 1",
                  title: "Enterprise & Identity",
                  desc: "Business name, PAN/GSTIN, sector — synced from DigiLocker.",
                  icon: <Building2 className="w-4.5 h-4.5 text-[#FE7251]" />,
                },
                {
                  step: "Step 2",
                  title: "Project Parameters",
                  desc: "Location (MIDC/Non-MIDC), capex, power load, workforce, water demand.",
                  icon: <SlidersHorizontal className="w-4.5 h-4.5 text-[#FE7251]" />,
                },
                {
                  step: "Step 3",
                  title: "Intelligent Assessment",
                  desc: "Rules engine returns only your applicable approvals, risk tier & incentives.",
                  icon: <Sparkles className="w-4.5 h-4.5 text-[#FE7251]" />,
                },
              ].map((s, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-[#F0E5E0] bg-[#FFFDFC]">
                  <div className="w-9 h-9 rounded-lg bg-[#FFF2DF] text-[#9B2A48] flex items-center justify-center mb-2.5">
                    {s.icon}
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#FE7251]">{s.step}</p>
                  <h3 className="text-sm font-bold text-slate-900 mt-0.5">{s.title}</h3>
                  <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>

            <div className="mt-7">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                Or preview with a live sector sample — approvals are pre-computed by the rules engine
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {SAMPLE_PROFILES.map((p) => (
                  <button
                    key={p.sectorKey}
                    type="button"
                    onClick={() => runSampleProject(p.sectorKey)}
                    className="text-left p-4 rounded-xl bg-[#FFFDFC] border border-[#F0E5E0] hover:border-[#FE7251] hover:bg-[#FFF7F0] transition-colors cursor-pointer group"
                  >
                    <div className="w-9 h-9 rounded-lg bg-[#FFF2DF] text-[#9B2A48] flex items-center justify-center mb-2.5 group-hover:text-[#FE7251]">
                      <Zap className="w-4 h-4" />
                    </div>
                    <h3 className="text-sm font-bold text-slate-900">{p.label}</h3>
                    <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">{p.hint}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-7 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <Button onClick={() => router.push("/dashboard/kya")} className="w-full sm:w-auto">
                <Compass className="w-4 h-4" />
                <span>Complete Your KYA Wizard</span>
              </Button>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[11px] text-slate-500">
              <span>
                Already assessed?{" "}
                <button
                  type="button"
                  onClick={() => router.push("/dashboard/kya")}
                  className="text-[#FE7251] font-semibold hover:underline cursor-pointer"
                >
                  Re-run assessment
                </button>
              </span>
              <span className="flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#FE7251]" />
                No manual entry of clearances — everything is computed.
              </span>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  const notifications = useNotificationStore((s) => s.notifications);
  const criticalNotifications = notifications.filter(
    (n) => !n.read && (n.severity === "critical" || n.type === "sla")
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* CRITICAL SLA & STATUTORY ALERT BANNER */}
      {criticalNotifications.length > 0 && (
        <div className="p-4 sm:p-5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in duration-300">
          <div className="flex items-start space-x-3">
            <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 mt-0.5">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-rose-900 flex items-center gap-1.5">
                <span>{criticalNotifications[0].title}</span>
                <span className="text-[10px] uppercase font-black px-1.5 py-0.5 rounded-full bg-rose-200 text-rose-800">
                  RTS SLA Alert
                </span>
              </p>
              <p className="text-[11px] text-rose-700 mt-0.5 leading-relaxed max-w-2xl">
                {criticalNotifications[0].message}
              </p>
            </div>
          </div>
          <Link
            href={criticalNotifications[0].target || "/dashboard/sla"}
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs transition-colors shrink-0 cursor-pointer"
          >
            <span>View SLA Tracker</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* 1. WELCOME GREETING HEADER */}
      <Card className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-semibold text-[#FE7251] uppercase tracking-wider">
              Single Window Control Center
            </span>
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-purple-50 border border-purple-200 text-purple-700 uppercase tracking-wider">
              Demo
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Overview
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Welcome back, {userName} —{" "}
            {isOfficer
              ? `Department Console: ${user?.department || "Maharashtra State Clearances Wing"}`
              : `Enterprise: ${user?.enterpriseName || "Your Enterprise"} (ID: ${
                  user?.enterpriseId || "Not Assigned"
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

      {/* 1.5 WELCOME TOAST (first-time per session) */}
      {welcomeToast && (
        <div className="flex items-start justify-between gap-3 p-3.5 rounded-xl bg-[#FFF2DF] border border-[#FED17A]/70 text-[#6B2A3B]">
          <p className="text-xs leading-relaxed">
            <strong>{welcomeToast}</strong>
          </p>
          <button
            type="button"
            onClick={() => setToastDismissed(true)}
            className="text-[#9B2A48] hover:text-[#82213B] font-bold text-xs cursor-pointer"
            aria-label="Dismiss"
          >
            ✕
          </button>
        </div>
      )}

      {/* 2. STATS OVERVIEW CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiData.map((kpi, idx) => {
          const IconComp = kpi.icon;
          return (
            <Link
              key={idx}
              href={kpi.href}
              className="block group"
              aria-label={kpi.title}
            >
              <Card className="p-4 flex flex-col justify-between h-full transition-colors group-hover:border-slate-300">
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
            </Link>
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
        {renewalNotice && (
          <div className="flex items-start justify-between gap-3 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900">
            <p className="text-xs leading-relaxed">
              <strong>Renewal fast-track initiated:</strong> {renewalNotice} has been dispatched to the issuing authority
              for expedited processing. Track status from the renewal list.
            </p>
            <button
              type="button"
              onClick={() => setRenewalNotice(null)}
              className="text-emerald-500 hover:text-emerald-700 font-bold text-xs cursor-pointer"
              aria-label="Dismiss"
            >
              ✕
            </button>
          </div>
        )}
        {renderTabBar}
        {renderContent()}
      </div>
    </div>
  );
}

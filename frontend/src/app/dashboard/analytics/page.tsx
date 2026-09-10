"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  GitFork,
  Layers,
  Lock,
  ShieldAlert,
  TimerReset,
  TrendingDown,
  Building2,
  FileText,
  Zap,
  ArrowRight,
} from "lucide-react";
import { useEnterpriseStore } from "@/store/enterpriseStore";
import { useNotificationStore } from "@/store/notificationStore";
import { Badge } from "@/components/ui/badge";

interface PipelineRow {
  id: string;
  name: string;
  department: string;
  slaDays: number;
  status: string;
  progressPct: number;
  daysLeft: number;
  overdue: boolean;
  done: boolean;
  notStarted: boolean;
}

const DAG_STAGES = [
  { id: "node-root", name: "MIDC Land & Plan Approval", sla: 15 },
  { id: "node-mpcb", name: "MPCB Consent to Establish", sla: 21 },
  { id: "node-fire", name: "Fire Safety NOC", sla: 14 },
  { id: "node-water", name: "Bulk Water Allocation", sla: 7 },
  { id: "node-dish", name: "DISH Factory License", sla: 15 },
];

export default function DelayAnalyticsPage() {
  const {
    clearances,
    submittedAt,
    dagNodeStatuses,
    riskTrack,
    uploadedDocuments,
    fieldConflicts,
    sector,
    isAssessed,
    applicationRef,
  } = useEnterpriseStore();
  const addNotification = useNotificationStore((s) => s.addNotification);
  const [escalatedRef, setEscalatedRef] = useState<string | null>(null);

  const now = new Date().getTime();
  const start = submittedAt ? new Date(submittedAt).getTime() : now;
  const elapsedDays = Math.max(0, (now - start) / 86400000);

  const rows: PipelineRow[] = useMemo(
    () =>
      clearances.map((c) => {
        const done = c.status === "approved" || c.status === "deemed_approved";
        const notStarted = c.status === "pending";
        const progressPct = done ? 100 : notStarted ? 0 : Math.min(100, (elapsedDays / c.slaDays) * 100);
        const daysLeft = c.slaDays - elapsedDays;
        const overdue = !done && !notStarted && daysLeft < 0;
        return {
          id: c.id,
          name: c.name,
          department: c.department,
          slaDays: c.slaDays,
          status: c.status || "pending",
          progressPct,
          daysLeft,
          overdue,
          done,
          notStarted,
        };
      }),
    [clearances, elapsedDays]
  );

  const activeRows = rows.filter((r) => !r.done && !r.notStarted);
  const overdueRows = rows.filter((r) => r.overdue);
  const withinRows = activeRows.filter((r) => !r.overdue);
  const notStartedCount = rows.filter((r) => r.notStarted).length;
  const avgProgress =
    activeRows.length > 0
      ? Math.round(activeRows.reduce((sum, r) => sum + r.progressPct, 0) / activeRows.length)
      : 0;

  const horizonTotal = DAG_STAGES.reduce((sum, s) => sum + s.sla, 0);
  const activeStageSla = DAG_STAGES.filter((s) => dagNodeStatuses[s.id] === "active").map((s) => s.sla);
  const parallelHorizon = activeStageSla.length > 0 ? Math.max(...activeStageSla) : 0;
  const timeSaved = horizonTotal - parallelHorizon;
  const savingsPct = horizonTotal > 0 ? Math.round((timeSaved / horizonTotal) * 100) : 0;

  const extractedCount = uploadedDocuments.filter(
    (d) => d.status === "extracted" || (d.extractedFields && Object.keys(d.extractedFields).length > 0)
  ).length;
  const docsServed = uploadedDocuments.length > 0;

  const deptLoad = useMemo(() => {
    const map = new Map<string, number>();
    rows.forEach((r) => {
      map.set(r.department, (map.get(r.department) || 0) + 1);
    });
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
  }, [rows]);

  const handleEscalate = () => {
    if (overdueRows.length === 0) return;
    const ref = applicationRef || "MH-CAF-2026-00412";
    const dept = overdueRows[0].department;
    addNotification({
      type: "sla",
      title: "SLA Breach Escalated",
      message: `${overdueRows[0].name} for ${ref} is overdue by ${Math.abs(overdueRows[0].daysLeft).toFixed(1)} days. Case auto-escalated to ${dept} HoD for priority disposal.`,
      severity: "critical",
      target: "/dashboard/analytics",
    });
    setEscalatedRef(ref);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#F0E5E0] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#FFF2DF] border border-[#FED17A] text-[#9B2A48] text-xs font-bold uppercase tracking-wider mb-2">
            <TrendingDown className="w-3.5 h-3.5 text-[#FE7251]" />
            <span>Bottleneck Intelligence &amp; Delay Analytics</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#16060E] tracking-tight">
            Why Is My Clearance Stuck?
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Live SLA health of every statutory approval, automated delay diagnosis, and HoD escalation triggers under RTS Act 2015.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleEscalate}
            disabled={overdueRows.length === 0}
            className={`inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
              overdueRows.length > 0 ? "bg-[#FE7251] hover:bg-[#E85E3E] text-white" : "bg-slate-100 text-slate-400"
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>{overdueRows.length > 0 ? `Escalate ${overdueRows.length} Overdue` : "No Overdue Cases"}</span>
          </button>
          {escalatedRef && (
            <Link
              href="/dashboard/grievances"
              className="inline-flex items-center space-x-1 px-3 py-2 rounded-lg bg-[#FFF2DF] border border-[#FED17A] text-[#9B2A48] text-xs font-bold hover:bg-[#FFF7F0] transition-colors"
            >
              <span>Ticket Raised</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white rounded-2xl p-4 border border-[#F0E5E0] shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500">Approvals Tracked</p>
            <Layers className="w-4 h-4 text-[#FE7251]" />
          </div>
          <p className="text-2xl font-black text-slate-900 mt-1">{rows.length}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">{notStartedCount} awaiting upstream unlock</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-[#F0E5E0] shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500">Within SLA</p>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-emerald-700 mt-1">{withinRows.length}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">of {activeRows.length} active reviews</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-rose-200 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500">Overdue / At Risk</p>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <p className="text-2xl font-black text-rose-600 mt-1">{overdueRows.length}</p>
          <p className="text-[11px] text-rose-500 mt-0.5">Auto-escalation triggered</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-[#F0E5E0] shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500">Avg SLA Progress</p>
            <TimerReset className="w-4 h-4 text-[#9B2A48]" />
          </div>
          <p className="text-2xl font-black text-[#9B2A48] mt-1">{avgProgress}%</p>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {isAssessed ? `${sector} sector` : "Across statutory clearances"}
          </p>
        </div>
      </div>

      {/* SLA Pipeline */}
      <div className="bg-white rounded-2xl border border-[#F0E5E0] shadow-xs overflow-hidden">
        <div className="p-5 border-b border-[#F0E5E0] flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <Clock className="w-4.5 h-4.5 text-[#FE7251]" />
            <div>
              <h2 className="text-sm font-bold text-[#16060E]">Approval Timeline &amp; SLA Health</h2>
              <p className="text-[11px] text-slate-500">
                Days elapsed vs statutory limit — {elapsedDays >= 0 ? `${elapsedDays.toFixed(1)} days` : ""} since CAF submission{applicationRef ? ` (${applicationRef})` : ""}
              </p>
            </div>
          </div>
          <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-[#FFF2DF] text-[#9B2A48] border border-[#FED17A]">
            RTS 2015
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {rows.map((r) => (
            <div
              key={r.id}
              className={`p-4 sm:p-5 ${r.overdue ? "bg-rose-50/60 border-l-4 border-l-rose-400" : ""}`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900 truncate">{r.name}</p>
                  <p className="text-[11px] text-slate-500">{r.department}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge
                    variant={
                      r.overdue
                        ? "destructive"
                        : r.done
                        ? "success"
                        : r.notStarted
                        ? "secondary"
                        : "warning"
                    }
                  >
                    {r.overdue ? `Overdue ${Math.abs(r.daysLeft).toFixed(1)}d` : r.status.replace("_", " ")}
                  </Badge>
                </div>
              </div>

              <div className="mt-2.5 flex items-center gap-2.5">
                <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      r.overdue ? "bg-rose-500" : r.progressPct >= 75 ? "bg-amber-400" : "bg-[#FE7251]"
                    }`}
                    style={{ width: `${r.progressPct}%` }}
                  />
                </div>
                <span className={`text-[11px] font-bold whitespace-nowrap ${r.overdue ? "text-rose-600" : "text-slate-500"}`}>
                  {r.done || r.notStarted
                    ? r.notStarted
                      ? "Awaiting upstream"
                      : "Completed"
                    : `${r.daysLeft.toFixed(1)}d left / ${r.slaDays}d SLA`}
                </span>
              </div>
            </div>
          ))}
          {rows.length === 0 && (
            <p className="p-6 text-xs text-slate-500">
              No clearances yet. Run a Know Your Approvals assessment first.
            </p>
          )}
        </div>
      </div>

      {/* Parallel Orchestration */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sequential vs Parallel Savings */}
        <div className="bg-white rounded-2xl border border-[#F0E5E0] shadow-xs p-5">
          <div className="flex items-center space-x-2.5 mb-4">
            <GitFork className="w-4.5 h-4.5 text-[#FE7251]" />
            <div>
              <h2 className="text-sm font-bold text-[#16060E]">Parallel Department Workflow</h2>
              <p className="text-[11px] text-slate-500">Sequential vs DAG-parallel clearance horizon</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5" /> Sequential (SAP-style queue)
                </span>
                <span className="font-black text-slate-700">{horizonTotal} days</span>
              </div>
              <div className="mt-1.5 h-2 rounded-full bg-slate-200">
                <div className="h-full w-full rounded-full bg-slate-400" />
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#FFF2DF] border border-[#FED17A]">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#9B2A48] flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5" /> AARAMBH parallel DAG
                </span>
                <span className="font-black text-[#9B2A48]">{parallelHorizon || 21} days</span>
              </div>
              <div className="mt-1.5 h-2 rounded-full bg-[#FED17A]">
                <div
                  className="h-full rounded-full bg-[#FE7251]"
                  style={{ width: `${parallelHorizon ? (parallelHorizon / horizonTotal) * 100 : 29}%` }}
                />
              </div>
            </div>

            <p className="text-xs text-slate-600">
              Time saved: <strong className="text-[#9B2A48]">{timeSaved} days ({savingsPct}%)</strong> via simultaneously running
              MPCB, Fire &amp; Water approvals.
            </p>
          </div>
        </div>

        {/* DAG Dependency Bottleneck */}
        <div className="bg-white rounded-2xl border border-[#F0E5E0] shadow-xs p-5">
          <div className="flex items-center space-x-2.5 mb-4">
            <GitFork className="w-4.5 h-4.5 text-[#FE7251]" />
            <div>
              <h2 className="text-sm font-bold text-[#16060E]">Dependency Map &amp; Bottlenecks</h2>
              <p className="text-[11px] text-slate-500">Where is the pipeline blocked?</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {DAG_STAGES.map((s, idx) => {
              const st = dagNodeStatuses[s.id] || "locked";
              const chipStyle =
                st === "approved"
                  ? "bg-emerald-50 border-emerald-300 text-emerald-800"
                  : st === "active"
                  ? "bg-[#FFF2DF] border-[#FED17A] text-[#9B2A48]"
                  : "bg-slate-100 border-slate-200 text-slate-500";
              const isLockedChild = st === "locked" && (s.id === "node-dish" || s.id.startsWith("node-"));
              return (
                <div key={s.id} className="flex items-center gap-1.5">
                  <div
                    className={`px-2.5 py-1.5 rounded-lg border text-[10px] font-bold ${chipStyle} ${
                      isLockedChild ? "cursor-pointer" : ""
                    }`}
                    title={st}
                  >
                    {st === "locked" && <Lock className="w-3 h-3 inline mr-1" />}
                    {s.name} <span className="opacity-60">· {s.sla}d</span>
                  </div>
                  {idx < DAG_STAGES.length - 1 && (
                    <span className={`text-slate-300 text-xs ${idx === 0 ? "hidden sm:inline" : ""}`}>→</span>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-900">
            <p className="text-xs font-bold flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-rose-600" /> Detected Bottleneck
            </p>
            <p className="text-[11px] text-rose-800 mt-0.5 leading-relaxed">
              {dagNodeStatuses["node-dish"] === "locked"
                ? "DISH Factory License is waiting on MPCB, Fire & Water sign-offs. Root MIDC is already approved — parallel branches are the critical path."
                : overdueRows.length > 0
                ? `${overdueRows[0].name} has breached its statutory limit and needs HoD escalation.`
                : "No dependency bottleneck detected. All parallel branches are progressing within SLA."}
            </p>
          </div>
        </div>
      </div>

      {/* Department Load + Document Readiness */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-[#F0E5E0] shadow-xs p-5">
          <div className="flex items-center space-x-2.5 mb-4">
            <Building2 className="w-4.5 h-4.5 text-[#FE7251]" />
            <div>
              <h2 className="text-sm font-bold text-[#16060E]">Department-wise Load</h2>
              <p className="text-[11px] text-slate-500">Pending scrutiny per issuing authority</p>
            </div>
          </div>
          <ul className="divide-y divide-slate-100">
            {deptLoad.map(([dept, count]) => (
              <li key={dept} className="py-2.5 flex items-center justify-between text-xs">
                <span className="text-slate-700 font-semibold">{dept}</span>
                <Badge variant={count > 1 ? "warning" : "secondary"}>{count} clearance{count > 1 ? "s" : ""}</Badge>
              </li>
            ))}
            {deptLoad.length === 0 && <li className="py-2.5 text-xs text-slate-500">No departments tracked.</li>}
          </ul>
        </div>

        <div className="bg-white rounded-2xl border border-[#F0E5E0] shadow-xs p-5">
          <div className="flex items-center space-x-2.5 mb-4">
            <FileText className="w-4.5 h-4.5 text-[#FE7251]" />
            <div>
              <h2 className="text-sm font-bold text-[#16060E]">Document Readiness &amp; Risk Track</h2>
              <p className="text-[11px] text-slate-500">Vault completeness and scrutiny tier</p>
            </div>
          </div>

          {docsServed ? (
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-slate-500">Vault documents processed</span>
                  <span className="font-bold text-slate-700">
                    {extractedCount} / {uploadedDocuments.length}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-[#FE7251]"
                    style={{ width: `${(extractedCount / uploadedDocuments.length) * 100}%` }}
                  />
                </div>
              </div>
              {fieldConflicts.length > 0 && (
                <p className="text-[11px] text-rose-600 font-semibold flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" /> {fieldConflicts.length} cross-document conflict(s) unresolved
                </p>
              )}
            </div>
          ) : (
            <p className="text-xs text-slate-500">
              No documents in vault yet. Upload in <Link href="/dashboard/vault" className="text-[#FE7251] font-semibold hover:underline">Document Vault</Link> to unlock auto-verification.
            </p>
          )}

          <div className="mt-4 p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-[#9B2A48]" /> Scrutiny Risk Track
              </span>
              <Badge
                variant={
                  riskTrack === "red" ? "destructive" : riskTrack === "orange" ? "warning" : "success"
                }
              >
                {riskTrack ? riskTrack.toUpperCase() : "NOT ASSESSED"}
              </Badge>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              {riskTrack === "red"
                ? "RED — joint MPCB/Fire/DISH inspection pre-scheduled before clearance."
                : riskTrack === "orange"
                ? "ORANGE — desk audit plus conditional verification documents."
                : riskTrack === "green"
                ? "GREEN — self-certified pathway with random audit sampling."
                : "Run Know Your Approvals to compute the risk tier from hazard & capex inputs."}
            </p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="p-5 rounded-2xl bg-[#FFF2DF] border border-[#FED17A] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-start space-x-3">
          <Activity className="w-5 h-5 text-[#FE7251] shrink-0 mt-0.5" />
          <p className="text-xs text-[#16060E]">
            <strong>Rebuild recommendation:</strong> de-clutter the CAF documentation and split the overdue consent review across
            parallel desk officers to restore SLA compliance by next monitoring window.
          </p>
        </div>
        <Link
          href="/dashboard/dag"
          className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-[#FE7251] hover:bg-[#E85E3E] text-white text-xs font-bold shadow-xs transition-colors whitespace-nowrap shrink-0"
        >
          <span>Open Track Approvals</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
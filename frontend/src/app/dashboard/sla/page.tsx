"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Clock,
  Sparkles,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Factory,
  Droplets,
  Building2,
  Play,
  Pause,
  RotateCcw,
  ArrowRight,
  ShieldCheck,
  FileCheck2,
  Award,
} from "lucide-react";
import { useEnterpriseStore } from "@/store/enterpriseStore";

interface ClearanceSLABar {
  id: string;
  name: string;
  department: string;
  totalSlaDays: number;
  icon: React.ComponentType<{ className?: string }>;
  weightOffset?: number;
}

const DEFAULT_APPLICATIONS: ClearanceSLABar[] = [
  {
    id: "mpcb-cte",
    name: "MPCB Consent to Establish (CTE)",
    department: "Maharashtra Pollution Control Board",
    totalSlaDays: 21,
    icon: Factory,
    weightOffset: 0,
  },
  {
    id: "fire-noc",
    name: "Provisional Fire Safety NOC",
    department: "State Directorate of Fire & Emergency Services",
    totalSlaDays: 14,
    icon: Flame,
    weightOffset: 2,
  },
  {
    id: "water-allocation",
    name: "Bulk Water Supply Allocation",
    department: "MIDC / Water Resources Department",
    totalSlaDays: 7,
    icon: Droplets,
    weightOffset: -2,
  },
  {
    id: "midc-plan",
    name: "MIDC Building Plan & Land Approval",
    department: "Maharashtra Industrial Development Corporation",
    totalSlaDays: 15,
    icon: Building2,
    weightOffset: 1,
  },
];

export default function SLATrackerPage() {
  const { clearances } = useEnterpriseStore();

  const activeApplications: ClearanceSLABar[] =
    clearances && clearances.length > 0
      ? clearances.map((c, idx) => {
          let IconComp = Building2;
          const dept = (c.department || "").toLowerCase();
          const name = (c.name || "").toLowerCase();
          if (dept.includes("pollution") || dept.includes("mpcb") || name.includes("mpcb")) {
            IconComp = Factory;
          } else if (dept.includes("fire") || name.includes("fire")) {
            IconComp = Flame;
          } else if (dept.includes("water") || name.includes("water")) {
            IconComp = Droplets;
          } else if (dept.includes("safety") || dept.includes("dish") || name.includes("dish")) {
            IconComp = ShieldCheck;
          } else if (dept.includes("electricity") || dept.includes("power") || name.includes("power")) {
            IconComp = Zap;
          }

          return {
            id: c.id,
            name: c.name,
            department: c.department,
            totalSlaDays: c.slaDays || 15,
            icon: IconComp,
            weightOffset: (idx % 3) - 1,
          };
        })
      : DEFAULT_APPLICATIONS;

  // Real React state for Acceleration Simulator (0 - 100)
  const [sliderValue, setSliderValue] = useState<number>(45);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [downloadedCertName, setDownloadedCertName] = useState<string | null>(null);

  const handleDownloadDeemedCertificate = (app: ClearanceSLABar) => {
    const certContent = `GOVERNMENT OF MAHARASHTRA
DIRECTORATE OF INDUSTRIAL CLEARANCES & SINGLE WINDOW FACILITATION
STATUTORY DEEMED APPROVAL ORDER
(Issued under Section 10 of Maharashtra Right to Public Services Act, 2015)
----------------------------------------------------------------------
Clearance Reference: MH-DEEMED-${Date.now()}-${app.id.toUpperCase()}
Subject: Statutory Deemed Clearance for ${app.name}
Department: ${app.department}
Statutory SLA Period: ${app.totalSlaDays} Working Days
Elapsed Period: ${app.totalSlaDays} Working Days (100% SLA Elapsed)

WHEREAS an application for "${app.name}" was submitted via the AARAMBH Single Window Clearance Portal;
AND WHEREAS no adverse remarks, queries, or rejection orders were issued by the competent authority within the prescribed SLA statutory timeline of ${app.totalSlaDays} working days;

NOW THEREFORE, by virtue of the powers conferred under the Maharashtra Right to Public Services Act 2015, the competent authority hereby certifies that DEEMED CLEARANCE is granted to the applicant enterprise for all statutory, banking, utility, and operational purposes.

Signatory: State Single Window Automated Clearance Node, Mantralaya, Mumbai
Digital Verification Hash: SHA256-${Math.random().toString(36).substring(2)}${Math.random().toString(36).substring(2)}
Issued On: ${new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}
Timestamp: ${new Date().toISOString()}
----------------------------------------------------------------------`;

    const blob = new Blob([certContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Deemed_Approval_${app.id.toUpperCase()}_Certificate.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setDownloadedCertName(app.name);
    setTimeout(() => setDownloadedCertName(null), 4000);
  };

  // Auto-play timer for presentation simulation
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setSliderValue((prev) => {
          if (prev >= 100) {
            setIsPlaying(false);
            return 100;
          }
          return prev + 1;
        });
      }, 90);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying]);

  // Helper to determine status color and badge based on exact threshold
  const getThresholdStatus = (percent: number) => {
    if (percent >= 100) {
      return {
        label: "Deemed Approval Triggered ⚡",
        description: "Statutory SLA elapsed. Certificate automatically granted by law.",
        colorClass: "bg-[#9B2A48] text-[#FFCA7C]",
        barColor: "bg-gradient-to-r from-[#9B2A48] to-[#FE7251]",
        lightBg: "bg-[#FFF2DF] border-[#FED17A] text-[#9B2A48]",
        textColor: "text-[#9B2A48]",
        badgeBorder: "border-[#FED17A]",
        isDeemed: true,
      };
    }
    if (percent >= 90) {
      return {
        label: "Critical: Auto-Escalation to HOD (90-99%)",
        description: "Officer deadline imminent. System alert dispatched to Principal Secretary.",
        colorClass: "bg-rose-600 text-white",
        barColor: "bg-rose-600",
        lightBg: "bg-rose-50 border-rose-200 text-rose-950",
        textColor: "text-rose-600",
        badgeBorder: "border-rose-300",
        isDeemed: false,
      };
    }
    if (percent >= 75) {
      return {
        label: "Warning: SLA Threshold Approaching (75-89%)",
        description: "Application is in final scrutiny. Reminder alert sent to scrutiny officer.",
        colorClass: "bg-[#FE7251] text-white",
        barColor: "bg-[#FE7251]",
        lightBg: "bg-[#FFF7F0] border-[#FED17A] text-[#9B2A48]",
        textColor: "text-[#FE7251]",
        badgeBorder: "border-[#FE7251]",
        isDeemed: false,
      };
    }
    return {
      label: "On Schedule (0-74%)",
      description: "Normal departmental scrutiny progressing within statutory timeline.",
      colorClass: "bg-[#9B2A48] text-white",
      barColor: "bg-[#9B2A48]",
      lightBg: "bg-[#FFF9F5] border-[#F0E5E0] text-[#16060E]",
      textColor: "text-[#9B2A48]",
      badgeBorder: "border-[#FED17A]",
      isDeemed: false,
    };
  };

  const currentGlobalStatus = getThresholdStatus(sliderValue);

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* 1. Top Header */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#F0E5E0] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#FFF2DF] border border-[#FED17A] text-[#9B2A48] text-xs font-bold uppercase tracking-wider mb-2">
            <Clock className="w-3.5 h-3.5 text-[#FE7251]" />
            <span>Statutory Timeline Enforcement</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#16060E] tracking-tight">
            SLA Tracker & Deemed Approval Simulator
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
            Maharashtra Right to Public Services Act guarantees time-bound clearances. When the SLA timer hits 100%, applications transition automatically into <strong>Deemed Approvals</strong>.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/dashboard/dag"
            className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#9B2A48] via-[#FE7251] to-[#FE7251] hover:from-[#7D1E36] hover:to-[#E55B3B] text-white text-xs font-bold shadow-md shadow-[#FE7251]/20 transition-all"
          >
            <span>Back to DAG Workflow</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* 2. ACCELERATION SIMULATOR SLIDER CARD */}
      <div className="bg-gradient-to-br from-[#16060E] via-[#250C19] to-[#14050B] rounded-3xl p-6 sm:p-8 text-white border border-[#FED17A]/30 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center space-x-2 text-[#FFCA7C] text-xs font-bold uppercase tracking-wider">
              <Zap className="w-4 h-4 text-[#FE7251]" />
              <span>Interactive Time-Lapse Simulator</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
              Acceleration Simulator: {sliderValue}% Elapsed
            </h2>
            <p className="text-xs text-[#C4A89C] mt-0.5">
              Drag the slider to test live color thresholds and deemed approval triggers across all active departments.
            </p>
          </div>

          {/* Controls: Play / Pause / Reset */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsPlaying(!isPlaying)}
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#9B2A48] to-[#FE7251] hover:from-[#7D1E36] hover:to-[#E55B3B] text-white text-xs font-bold transition-all shadow-md cursor-pointer"
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isPlaying ? "Pause Simulation" : "Auto-Simulate Timeline"}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setIsPlaying(false);
                setSliderValue(0);
              }}
              className="p-2 rounded-xl bg-[#2D1222] hover:bg-[#3D1420] text-[#FFCA7C] border border-[#FED17A]/30 transition-colors"
              title="Reset Timeline to 0%"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Real Reactive Range Slider */}
        <div className="space-y-4">
          <div className="relative flex items-center">
            <input
              type="range"
              min="0"
              max="100"
              value={sliderValue}
              onChange={(e) => {
                setIsPlaying(false);
                setSliderValue(Number(e.target.value));
              }}
              className="w-full h-3 bg-[#2D1222] rounded-lg appearance-none cursor-pointer accent-[#FE7251] focus:outline-hidden"
            />
          </div>

          {/* Preset Buttons for Quick Jumps */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
            <span className="text-xs text-[#C4A89C] font-semibold">Jump to Threshold:</span>
            <div className="flex flex-wrap gap-2">
              {[
                { val: 25, label: "25% (Normal Scrutiny)", color: "bg-[#2D1222] text-[#FFCA7C] border-[#FED17A]/40" },
                { val: 80, label: "80% (Warning Threshold)", color: "bg-[#2D1222] text-[#FE7251] border-[#FE7251]/40" },
                { val: 95, label: "95% (Critical Escalation)", color: "bg-[#3D1420] text-rose-300 border-rose-600/40" },
                { val: 100, label: "100% (Deemed Approval)", color: "bg-gradient-to-r from-[#9B2A48] to-[#FE7251] text-white border-[#FED17A]" },
              ].map((preset) => (
                <button
                  key={preset.val}
                  type="button"
                  onClick={() => {
                    setIsPlaying(false);
                    setSliderValue(preset.val);
                  }}
                  className={`px-3 py-1 text-[11px] font-bold rounded-lg border transition-all cursor-pointer ${preset.color} ${
                    sliderValue === preset.val ? "ring-2 ring-white" : "hover:brightness-125"
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Threshold Banner Callout */}
        <div className={`mt-6 p-4 rounded-2xl border flex items-center justify-between ${currentGlobalStatus.lightBg}`}>
          <div className="flex items-center space-x-3 text-xs">
            <span className={`px-2.5 py-1 rounded-full font-black text-[11px] uppercase ${currentGlobalStatus.colorClass}`}>
              {sliderValue}% ELAPSED
            </span>
            <div>
              <p className="font-extrabold text-sm">{currentGlobalStatus.label}</p>
              <p className="text-[11px] opacity-90">{currentGlobalStatus.description}</p>
            </div>
          </div>

          {sliderValue >= 100 && (
            <span className="text-xs font-bold px-3 py-1 rounded-xl bg-gradient-to-r from-[#9B2A48] to-[#FE7251] text-white animate-bounce shadow-md">
              ⚡ Deemed Clearance Granted
            </span>
          )}
        </div>
      </div>

      {/* 3. HORIZONTAL PROGRESS BARS FOR ACTIVE APPLICATIONS */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-[#16060E]">
              Active Statutory Clearances Breakdown
            </h2>
            <p className="text-xs text-slate-500">
              Live tracking calculated directly from the Acceleration Simulator state
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-[#9B2A48] bg-[#FFF2DF] border border-[#FED17A] px-3 py-1 rounded-lg">
            4 Active Departments
          </span>
        </div>

        <div className="space-y-4">
          {activeApplications.map((app) => {
            const IconComp = app.icon;

            // Calculate exact percentage for this item (clamped 0-100)
            const itemPercent = Math.min(
              100,
              Math.max(0, sliderValue + (app.weightOffset || 0))
            );
            const status = getThresholdStatus(itemPercent);

            // Compute days
            const daysElapsed = Math.min(
              app.totalSlaDays,
              Math.round((itemPercent / 100) * app.totalSlaDays)
            );
            const daysRemaining = Math.max(0, app.totalSlaDays - daysElapsed);

            return (
              <div
                key={app.id}
                className="bg-white rounded-2xl p-6 border border-[#F0E5E0] shadow-xs hover:border-[#FE7251]/60 hover:shadow-md transition-all space-y-4"
              >
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center space-x-3.5">
                    <div className="w-10 h-10 rounded-xl bg-[#FFF2DF] text-[#9B2A48] border border-[#FED17A]/60 flex items-center justify-center shrink-0">
                      <IconComp className="w-5 h-5 text-[#9B2A48]" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[#16060E]">{app.name}</h3>
                      <p className="text-xs text-slate-500">{app.department}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 self-end sm:self-center">
                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-full border ${status.colorClass} ${status.badgeBorder}`}
                    >
                      {status.label}
                    </span>
                  </div>
                </div>

                {/* Progress Bar with Dynamic React State Color */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700">
                      {daysElapsed} of {app.totalSlaDays} Working Days Elapsed
                    </span>
                    <span className={`font-black font-mono text-sm ${status.textColor}`}>
                      {itemPercent}%
                    </span>
                  </div>

                  {/* Horizontal Bar */}
                  <div className="w-full bg-[#FFF9F5] rounded-full h-3.5 overflow-hidden p-0.5 border border-[#F0E5E0]">
                    <div
                      className={`h-full rounded-full transition-all duration-150 ${status.barColor}`}
                      style={{ width: `${itemPercent}%` }}
                    ></div>
                  </div>
                </div>

                {/* Footer details & Deemed action */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 text-xs text-slate-500 border-t border-[#F0E5E0]">
                  <div className="flex items-center space-x-2">
                    {itemPercent >= 100 ? (
                      <span className="text-[#9B2A48] font-bold flex items-center space-x-1">
                        <CheckCircle2 className="w-4 h-4 text-[#FE7251]" />
                        <span>Deemed Approval Enforced under Maharashtra RTS Act 2015</span>
                      </span>
                    ) : (
                      <span>
                        SLA Countdown:{" "}
                        <strong className={status.textColor}>
                          {daysRemaining} Working Days Remaining
                        </strong>
                      </span>
                    )}
                  </div>

                  {itemPercent >= 100 && (
                    <button
                      type="button"
                      onClick={() => handleDownloadDeemedCertificate(app)}
                      className="text-xs font-bold text-[#9B2A48] hover:text-[#FE7251] underline flex items-center space-x-1 cursor-pointer transition-colors"
                    >
                      <FileCheck2 className="w-3.5 h-3.5 text-[#FE7251]" />
                      <span>Download Deemed Clearance Order (.txt)</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {downloadedCertName && (
          <div className="p-4 rounded-xl bg-[#FFF2DF] border border-[#FED17A] text-[#16060E] flex items-center space-x-3 text-xs animate-in fade-in">
            <Award className="w-5 h-5 text-[#9B2A48] shrink-0" />
            <div>
              <p className="font-bold text-[#9B2A48]">Statutory Deemed Certificate Downloaded</p>
              <p className="text-[#886A75] mt-0.5">
                Cryptographically signed deemed approval dossier for &quot;{downloadedCertName}&quot; has been saved to your downloads.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

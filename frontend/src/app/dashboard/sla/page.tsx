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
  Award,
  FileCheck2,
} from "lucide-react";

interface ClearanceSLABar {
  id: string;
  name: string;
  department: string;
  totalSlaDays: number;
  icon: React.ComponentType<{ className?: string }>;
  weightOffset?: number; // small offset to demonstrate relative timeline variance
}

const activeApplications: ClearanceSLABar[] = [
  {
    id: "mpcb-cte",
    name: "MPCB Consent to Establish (CTE) - Red Category",
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
  // Real React state for Acceleration Simulator (0 - 100)
  const [sliderValue, setSliderValue] = useState<number>(45);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

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
        colorClass: "bg-[#9333EA] text-white",
        barColor: "bg-[#9333EA]",
        lightBg: "bg-purple-50 border-purple-200 text-purple-950",
        textColor: "text-[#9333EA]",
        badgeBorder: "border-[#9333EA]",
        isDeemed: true,
      };
    }
    if (percent >= 90) {
      return {
        label: "Critical: Auto-Escalation to HOD (90-99%)",
        description: "Officer deadline imminent. System alert dispatched to Principal Secretary.",
        colorClass: "bg-[#E11D48] text-white",
        barColor: "bg-[#E11D48]",
        lightBg: "bg-rose-50 border-rose-200 text-rose-950",
        textColor: "text-[#E11D48]",
        badgeBorder: "border-[#E11D48]",
        isDeemed: false,
      };
    }
    if (percent >= 75) {
      return {
        label: "Warning: SLA Threshold Approaching (75-89%)",
        description: "Application is in final scrutiny. Reminder alert sent to scrutiny officer.",
        colorClass: "bg-[#D97706] text-white",
        barColor: "bg-[#D97706]",
        lightBg: "bg-amber-50 border-amber-200 text-amber-950",
        textColor: "text-[#D97706]",
        badgeBorder: "border-[#D97706]",
        isDeemed: false,
      };
    }
    return {
      label: "On Schedule (0-74%)",
      description: "Normal departmental scrutiny progressing within statutory timeline.",
      colorClass: "bg-[#059669] text-white",
      barColor: "bg-[#059669]",
      lightBg: "bg-emerald-50 border-emerald-200 text-emerald-950",
      textColor: "text-[#059669]",
      badgeBorder: "border-[#059669]",
      isDeemed: false,
    };
  };

  const currentGlobalStatus = getThresholdStatus(sliderValue);

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* 1. Top Header */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-100 text-[#D97706] text-xs font-bold uppercase tracking-wider mb-2">
            <Clock className="w-3.5 h-3.5 text-[#D97706]" />
            <span>Statutory Timeline Enforcement</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#0F172A] tracking-tight">
            SLA Tracker & Deemed Approval Simulator
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
            Maharashtra Right to Public Services Act guarantees time-bound clearances. When the SLA timer hits 100%, applications transition automatically into **Deemed Approvals**.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/dashboard/dag"
            className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-bold shadow-xs transition-all"
          >
            <span>Back to DAG Workflow</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* 2. ACCELERATION SIMULATOR SLIDER CARD */}
      <div className="bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0F172A] rounded-3xl p-6 sm:p-8 text-white border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center space-x-2 text-indigo-400 text-xs font-bold uppercase tracking-wider">
              <Zap className="w-4 h-4" />
              <span>Interactive Time-Lapse Simulator</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
              Acceleration Simulator: {sliderValue}% Elapsed
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">
              Drag the slider to test live color thresholds and deemed approval triggers across all active departments.
            </p>
          </div>

          {/* Controls: Play / Pause / Reset */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsPlaying(!isPlaying)}
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
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
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
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
              className="w-full h-3 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500 focus:outline-hidden"
            />
          </div>

          {/* Preset Buttons for Quick Jumps */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
            <span className="text-xs text-slate-400 font-semibold">Jump to Threshold:</span>
            <div className="flex flex-wrap gap-2">
              {[
                { val: 25, label: "25% (Green: Normal)", color: "bg-emerald-950 text-emerald-300 border-emerald-700" },
                { val: 80, label: "80% (Amber: Warning)", color: "bg-amber-950 text-amber-300 border-amber-700" },
                { val: 95, label: "95% (Rose: Critical)", color: "bg-rose-950 text-rose-300 border-rose-700" },
                { val: 100, label: "100% (Purple: Deemed Approval)", color: "bg-purple-950 text-purple-300 border-purple-700" },
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
            <span className="text-xs font-bold px-3 py-1 rounded-xl bg-purple-700 text-white animate-bounce shadow-md">
              ⚡ Deemed Clearance Granted
            </span>
          )}
        </div>
      </div>

      {/* 3. HORIZONTAL PROGRESS BARS FOR ACTIVE APPLICATIONS */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-[#0F172A]">
              Active Statutory Clearances Breakdown
            </h2>
            <p className="text-xs text-slate-500">
              Live tracking calculated directly from the Acceleration Simulator state
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-lg">
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
                className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs hover:shadow-md transition-shadow space-y-4"
              >
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center space-x-3.5">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                      <IconComp className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[#0F172A]">{app.name}</h3>
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
                  <div className="w-full bg-slate-100 rounded-full h-3.5 overflow-hidden p-0.5 border border-slate-200/80">
                    <div
                      className={`h-full rounded-full transition-all duration-150 ${status.barColor}`}
                      style={{ width: `${itemPercent}%` }}
                    ></div>
                  </div>
                </div>

                {/* Footer details & Deemed action */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 text-xs text-slate-500 border-t border-slate-100">
                  <div className="flex items-center space-x-2">
                    {itemPercent >= 100 ? (
                      <span className="text-purple-700 font-bold flex items-center space-x-1">
                        <CheckCircle2 className="w-4 h-4 text-purple-600" />
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
                      onClick={() => alert(`Statutory Deemed Certificate for ${app.name} generated!`)}
                      className="text-xs font-bold text-purple-700 hover:text-purple-900 underline flex items-center space-x-1 cursor-pointer"
                    >
                      <span>Download Deemed Clearance Order</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

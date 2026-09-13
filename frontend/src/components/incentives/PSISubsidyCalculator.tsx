"use client";

import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Calculator,
  IndianRupee,
  Zap,
  Users,
  MapPin,
  HeartHandshake,
  Sparkles,
  Info,
} from "lucide-react";

export interface PSICalculatorDefaults {
  investmentCr?: number;
  talukaGroup?: TalukaGroupKey;
  employment?: number;
  specialCategory?: boolean;
}

export type TalukaGroupKey = "A" | "B" | "C" | "D" | "D+";

const TALUKA_GROUPS: {
  key: TalukaGroupKey;
  label: string;
  examples: string;
  multiplier: number;
}[] = [
  { key: "A", label: "Group A", examples: "Pune, Mumbai — developed zones", multiplier: 0.25 },
  { key: "B", label: "Group B", examples: "Chakan (non-special), Aurangabad", multiplier: 0.35 },
  { key: "C", label: "Group C", examples: "Chakan / Waluj", multiplier: 0.45 },
  { key: "D", label: "Group D", examples: "Marathwada, Vidarbha", multiplier: 0.55 },
  { key: "D+", label: "Group D+", examples: "Nanded / Yavatmal", multiplier: 0.65 },
];

const ELECTRICITY_AVG_POWER_KW = 250;
const ELECTRICITY_DUTY_PER_KWH = 0.3;
const EQUIPMENT_CAPEX_SHARE = 0.55;
const INTEREST_SUBSIDY_PCT = 0.05;
const ELIGIBILITY_YEARS = 7;

const INDIAN_NUMBER_FORMAT = new Intl.NumberFormat("en-IN");

interface PSICalculatorProps {
  initial?: PSICalculatorDefaults;
  className?: string;
}

function formatInvestmentCr(cr: number): string {
  if (cr >= 100) return `₹${INDIAN_NUMBER_FORMAT.format(Math.round(cr))} Cr`;
  if (cr >= 1) return `₹${cr.toLocaleString("en-IN", { maximumFractionDigits: 2 })} Cr`;
  return `₹${(cr * 100).toLocaleString("en-IN", { maximumFractionDigits: 1 })} Lakh`;
}

function formatCr(cr: number): string {
  return `₹${cr.toLocaleString("en-IN", { maximumFractionDigits: 2 })} Cr`;
}

export default function PSISubsidyCalculator({
  initial,
  className = "",
}: PSICalculatorProps) {
  const [investmentCr, setInvestmentCr] = useState<number>(
    initial?.investmentCr ?? 25
  );
  const [talukaKey, setTalukaKey] = useState<TalukaGroupKey>(
    initial?.talukaGroup ?? "C"
  );
  const [employment, setEmployment] = useState<number>(
    initial?.employment ?? 200
  );
  const [specialCategory, setSpecialCategory] = useState<boolean>(
    initial?.specialCategory ?? false
  );

  const taluka = TALUKA_GROUPS.find((g) => g.key === talukaKey) ?? TALUKA_GROUPS[2];

  const results = useMemo(() => {
    const bonusMultiplier = specialCategory ? 1.1 : 1;

    const sgstRefundCr = investmentCr * taluka.multiplier;

    const equipmentCapexCr = investmentCr * EQUIPMENT_CAPEX_SHARE;
    const interestPerYearCr = equipmentCapexCr * INTEREST_SUBSIDY_PCT;

    const annualKwh =
      ELECTRICITY_AVG_POWER_KW *
      (365 * 24) *
      0.45 *
      ELECTRICITY_DUTY_PER_KWH;
    const electricityDutyCr = annualKwh / 1e7;
    const electricityWaiver7yrCr = electricityDutyCr * ELIGIBILITY_YEARS;

    const interest7yrCr = interestPerYearCr * ELIGIBILITY_YEARS;
    const totalCr =
      (sgstRefundCr + electricityWaiver7yrCr + interest7yrCr) * bonusMultiplier;

    return {
      sgstRefundCr: sgstRefundCr * bonusMultiplier,
      electricityWaiver7yrCr: electricityWaiver7yrCr * bonusMultiplier,
      interestPerYearCr: interestPerYearCr * bonusMultiplier,
      interest7yrCr: interest7yrCr * bonusMultiplier,
      totalCr,
      equipmentCapexCr,
      bonusMultiplier,
    };
  }, [investmentCr, taluka.multiplier, specialCategory]);

  const handleEmploymentDelta = (delta: number) => {
    setEmployment((curr) => Math.max(50, Math.min(5000, curr + delta)));
  };

  return (
    <div className={`grid grid-cols-1 lg:grid-cols-2 gap-6 ${className}`}>
      {/* LEFT — INPUT PANEL */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-xs p-5 sm:p-6 flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
            <Calculator className="w-4 h-4 text-[#FE7251]" />
            Project Parameters
          </h3>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#FFF2DF] text-[#9B2A48] text-[10px] font-bold border border-[#FED17A]">
            <Sparkles className="w-3 h-3" />
            PSI 2025
          </span>
        </div>

        {/* 1. Capital Investment Slider */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <IndianRupee className="w-3.5 h-3.5 text-[#FE7251]" />
              Capital Investment
            </label>
            <span className="text-sm font-black text-[#9B2A48] font-mono">
              {formatInvestmentCr(investmentCr)}
            </span>
          </div>
          <input
            type="range"
            min={0.5}
            max={500}
            step={0.5}
            value={investmentCr}
            onChange={(e) => setInvestmentCr(Number(e.target.value))}
            className="w-full accent-[#FE7251] cursor-pointer"
            aria-label="Capital Investment in Crores"
          />
          <div className="flex justify-between text-[10px] text-slate-400 font-medium">
            <span>₹50 Lakh</span>
            <span>₹500 Cr</span>
          </div>
        </div>

        {/* 2. Taluka Category Dropdown */}
        <div className="space-y-2.5">
          <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-[#FE7251]" />
            Taluka Category
          </label>
          <select
            value={talukaKey}
            onChange={(e) => setTalukaKey(e.target.value as TalukaGroupKey)}
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-[#FE7251] focus:outline-none cursor-pointer"
          >
            {TALUKA_GROUPS.map((g) => (
              <option key={g.key} value={g.key}>
                {g.label} — {g.examples}
              </option>
            ))}
          </select>
          <p className="text-[10px] text-slate-400">
            SGST refund multiplier for {taluka.label}:{" "}
            <strong className="text-[#9B2A48]">
              {Math.round(taluka.multiplier * 100)}%
            </strong>
          </p>
        </div>

        {/* 3. Direct Employment Counter */}
        <div className="space-y-2.5">
          <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-[#FE7251]" />
            Direct Employment
          </label>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => handleEmploymentDelta(-25)}
              className="w-9 h-9 rounded-xl border border-slate-200 bg-slate-50 text-slate-600 font-black hover:bg-slate-100 transition-colors cursor-pointer"
            >
              −
            </button>
            <span className="flex-1 text-center text-lg font-black font-mono text-slate-900">
              {employment.toLocaleString("en-IN")}
            </span>
            <button
              type="button"
              onClick={() => handleEmploymentDelta(25)}
              className="w-9 h-9 rounded-xl border border-slate-200 bg-slate-50 text-slate-600 font-black hover:bg-slate-100 transition-colors cursor-pointer"
            >
              +
            </button>
          </div>
          <p className="text-[10px] text-slate-400">
            {employment >= 200
              ? "Eligible for enhanced employment-linked subsidy tiers."
              : "Bump above 200 workers to unlock employment-linked enhancement."}
          </p>
        </div>

        {/* 4. Special Category Checkbox */}
        <label className="flex items-start gap-3 p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/60 cursor-pointer">
          <input
            type="checkbox"
            checked={specialCategory}
            onChange={(e) => setSpecialCategory(e.target.checked)}
            className="mt-0.5 w-4 h-4 accent-emerald-600 cursor-pointer"
          />
          <span>
            <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-900">
              <HeartHandshake className="w-3.5 h-3.5 text-emerald-600" />
              SC / ST / Women / Green Unit Promoter
            </span>
            <span className="block text-[10px] text-emerald-700 mt-0.5">
              +10% Bonus on computed incentive envelope
            </span>
          </span>
        </label>
      </div>

      {/* RIGHT — OUTPUT PANEL */}
      <div className="rounded-2xl border border-slate-800 bg-gradient-to-b from-slate-900 to-[#16060E] p-5 sm:p-6 flex flex-col gap-4 text-slate-100">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black uppercase tracking-wider flex items-center gap-2">
            <Zap className="w-4 h-4 text-[#FE7251]" />
            Calculated ROI Output
          </h3>
          {specialCategory && (
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 text-[10px] font-black uppercase ring-1 ring-emerald-400/40"
            >
              +10% Bonus Applied
            </motion.span>
          )}
        </div>

        {/* Card 1 — SGST Refund */}
        <div className="rounded-xl border border-slate-700/80 bg-slate-900/70 p-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Estimated Gross SGST Refund
          </p>
          <p className="text-2xl font-black text-white mt-1 font-mono">
            {formatCr(results.sgstRefundCr)}
          </p>
          <p className="text-[10px] text-slate-400 mt-1">
            {formatInvestmentCr(investmentCr)} × {Math.round(taluka.multiplier * 100)}% ({taluka.label})
          </p>
        </div>

        {/* Card 2 — Electricity Duty Exemption */}
        <div className="rounded-xl border border-slate-700/80 bg-slate-900/70 p-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Electricity Duty Exemption
          </p>
          <p className="text-2xl font-black text-white mt-1">
            100% Waiver · {ELIGIBILITY_YEARS} Years
          </p>
          <p className="text-[10px] text-slate-400 mt-1">
            Notional saving ≈ {formatCr(results.electricityWaiver7yrCr)} over {ELIGIBILITY_YEARS} yrs
          </p>
        </div>

        {/* Card 3 — Interest Subsidy */}
        <div className="rounded-xl border border-slate-700/80 bg-slate-900/70 p-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Interest Subsidy (5% Reimbursement)
          </p>
          <p className="text-2xl font-black text-white mt-1 font-mono">
            {formatCr(results.interestPerYearCr)}
            <span className="text-xs font-semibold text-slate-400"> / yr</span>
          </p>
          <p className="text-[10px] text-slate-400 mt-1">
            5% on equipment capex {formatCr(results.equipmentCapexCr)} (55% of FCI) · ≈{" "}
            {formatCr(results.interest7yrCr)} over {ELIGIBILITY_YEARS} yrs
          </p>
        </div>

        {/* Total Banner */}
        <motion.div
          key={Math.round(results.totalCr * 100)}
          initial={{ opacity: 0.6, scale: 0.99 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.25 }}
          className="mt-auto rounded-xl bg-gradient-to-r from-[#FE7251] to-[#E85E3E] p-4 text-white shadow-lg shadow-black/30"
        >
          <p className="text-[11px] font-black uppercase tracking-wider text-white/85">
            Total Estimated Incentive Benefit
          </p>
          <p className="text-3xl font-black font-mono tracking-tight">
            {formatCr(results.totalCr)}
          </p>
          <p className="text-[10px] text-white/80 mt-1 flex items-center gap-1">
            <Info className="w-3 h-3" />
            Indicative {ELIGIBILITY_YEARS}-year envelope · Composite SGST + duty + interest
          </p>
        </motion.div>
      </div>
    </div>
  );
}
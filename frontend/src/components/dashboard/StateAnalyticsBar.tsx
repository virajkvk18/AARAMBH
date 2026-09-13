"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  BadgeCheck,
  Gauge,
  IndianRupee,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";

interface StateMetric {
  label: string;
  value: string;
  subtext: string;
  icon: React.ComponentType<{ className?: string }>;
  trendPositive?: boolean;
}

const METRICS: StateMetric[] = [
  {
    label: "Statewide Active Clearances",
    value: "14,890",
    subtext: "+14% this quarter",
    icon: BadgeCheck,
    trendPositive: true,
  },
  {
    label: "RTS Statutory SLA Adherence",
    value: "97.4%",
    subtext: "Maharashtra RTS Act 2015",
    icon: Gauge,
    trendPositive: true,
  },
  {
    label: "Total Tracked Capex",
    value: "₹2,45,000 Cr",
    subtext: "Across 36 Districts",
    icon: IndianRupee,
    trendPositive: true,
  },
  {
    label: "Tamper-Evident Audit Stream",
    value: "Active",
    subtext: "Supabase RLS Enforced",
    icon: ShieldCheck,
  },
];

export default function StateAnalyticsBar() {
  return (
    <section aria-label="Executive State Analytics" className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {METRICS.map((metric, idx) => {
        const IconComp = metric.icon;
        return (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 * idx, duration: 0.35 }}
            className="rounded-2xl border border-slate-800 bg-gradient-to-b from-slate-900 to-[#16060E] p-4 text-slate-100 shadow-sm"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <IconComp className="w-3.5 h-3.5 text-[#FE7251]" />
                <span>{metric.label}</span>
              </span>
              {metric.trendPositive && (
                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[9px] font-black ring-1 ring-emerald-500/30">
                  <TrendingUp className="w-2.5 h-2.5" />
                  LIVE
                </span>
              )}
            </div>
            <p className="text-xl sm:text-2xl font-black tracking-tight text-white">
              {metric.value}
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">{metric.subtext}</p>
          </motion.div>
        );
      })}
    </section>
  );
}
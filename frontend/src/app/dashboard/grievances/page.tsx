"use client";

import React from "react";
import { MessageSquareWarning, PlusCircle, CheckCircle2, Clock, AlertCircle } from "lucide-react";

export default function GrievancesPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6 mb-6">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-rose-50 border border-rose-100 text-rose-700 text-xs font-bold uppercase tracking-wider mb-2">
              <MessageSquareWarning className="w-3.5 h-3.5 text-rose-600" />
              <span>Grievance & Support Desk</span>
            </div>
            <h1 className="text-2xl font-black text-[#0F172A] tracking-tight">
              Dispute Redressal & Officer Query Desk
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Time-bound statutory resolution for delays, inspection queries, or payment reconciliations.
            </p>
          </div>
          <button
            type="button"
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-semibold shadow-xs cursor-pointer shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Raise New Ticket</span>
          </button>
        </div>

        {/* Existing Query / Grievance Card */}
        <div className="p-5 rounded-2xl bg-amber-50/50 border border-amber-200/80">
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-xs font-bold text-slate-800">TICKET #GRV-2026-098</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-200 text-amber-900">Under Investigation</span>
          </div>
          <h4 className="text-sm font-bold text-slate-900">Provisional Fire NOC - Clarification on Underground Static Tank Capacity</h4>
          <p className="text-xs text-slate-600 mt-1">
            Raised by State Fire Directorate • Response deadline: 3 Working Days.
          </p>
        </div>
      </div>
    </div>
  );
}

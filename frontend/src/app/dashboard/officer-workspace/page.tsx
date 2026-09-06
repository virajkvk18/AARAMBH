"use client";

import React from "react";
import { ShieldCheck, FileCheck, CheckCircle2, XCircle, AlertCircle, ArrowRight } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function OfficerWorkspacePage() {
  const { user } = useAuth();

  if (user?.role !== "officer") {
    return (
      <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center max-w-lg mx-auto">
        <ShieldCheck className="w-12 h-12 text-slate-400 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-slate-800">Restricted Access</h3>
        <p className="text-xs text-slate-500 mt-1">
          This workspace is exclusively for verified Department Scrutiny Officers.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-3">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Department Officer Scrutiny Console</span>
        </div>
        <h1 className="text-2xl font-black text-[#0F172A] tracking-tight">
          Officer Review Queue • {user?.department || "MIDC Industrial Clearances"}
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
          Review incoming Common Application Forms (CAF), verify AI OCR field extractions, conduct inspection reports, raise formal queries, or issue digital approval certificates.
        </p>

        <div className="mt-8 overflow-hidden rounded-xl border border-slate-200">
          <table className="min-w-full divide-y divide-slate-200 text-xs">
            <thead className="bg-slate-50 font-bold text-slate-600 uppercase text-[10px]">
              <tr>
                <th className="px-6 py-3 text-left">Application Ref</th>
                <th className="px-6 py-3 text-left">Enterprise Name</th>
                <th className="px-6 py-3 text-left">Clearance Requested</th>
                <th className="px-6 py-3 text-left">SLA Due Date</th>
                <th className="px-6 py-3 text-right">Review Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              <tr className="hover:bg-slate-50">
                <td className="px-6 py-4 font-mono font-bold text-indigo-600">MH-CAF-2026-00412</td>
                <td className="px-6 py-4 font-bold">Maharashtra Solvents Ltd</td>
                <td className="px-6 py-4">Plot Allotment Scrutiny</td>
                <td className="px-6 py-4 text-emerald-600 font-bold">4 Days Left</td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button className="px-3 py-1 rounded bg-[#059669] text-white font-bold text-[11px] shadow-xs">
                    Approve
                  </button>
                  <button className="px-3 py-1 rounded bg-[#D97706] text-white font-bold text-[11px] shadow-xs">
                    Query
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

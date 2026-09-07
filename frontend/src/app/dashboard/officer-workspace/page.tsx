"use client";

import React, { useState } from "react";
import { ShieldCheck, FileCheck, CheckCircle2, XCircle, AlertCircle, ArrowRight, Sparkles } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function OfficerWorkspacePage() {
  const { user } = useAuth();
  const [approvedList, setApprovedList] = useState<string[]>([]);

  if (user?.role !== "officer") {
    return (
      <div className="bg-white rounded-2xl p-8 border border-[#FED17A] text-center max-w-lg mx-auto shadow-xs">
        <ShieldCheck className="w-12 h-12 text-[#9B2A48] mx-auto mb-3" />
        <h3 className="text-lg font-bold text-[#16060E]">Restricted Officer Access</h3>
        <p className="text-xs text-slate-500 mt-1">
          This workspace is exclusively for verified Department Scrutiny Officers. Toggle &quot;Officer View&quot; on the top bar for testing.
        </p>
      </div>
    );
  }

  const handleApprove = (ref: string) => {
    setApprovedList((prev) => [...prev, ref]);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#F0E5E0] shadow-xs">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#FFF2DF] border border-[#FED17A] text-[#9B2A48] text-xs font-bold uppercase tracking-wider mb-3">
          <ShieldCheck className="w-3.5 h-3.5 text-[#FE7251]" />
          <span>Department Officer Scrutiny Console</span>
        </div>
        <h1 className="text-2xl font-black text-[#16060E] tracking-tight">
          Officer Review Queue • {user?.department || "MIDC Industrial Clearances"}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-2 leading-relaxed">
          Review incoming Common Application Forms (CAF), verify AI OCR field extractions, conduct inspection reports, raise formal queries, or issue digital approval certificates.
        </p>

        <div className="mt-8 overflow-hidden rounded-xl border border-[#F0E5E0]">
          <table className="min-w-full divide-y divide-[#F0E5E0] text-xs">
            <thead className="bg-[#FFF9F5] font-bold text-[#9B2A48] uppercase text-[10px]">
              <tr>
                <th className="px-6 py-3 text-left">Application Ref</th>
                <th className="px-6 py-3 text-left">Enterprise Name</th>
                <th className="px-6 py-3 text-left">Clearance Requested</th>
                <th className="px-6 py-3 text-left">SLA Due Date</th>
                <th className="px-6 py-3 text-right">Review Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0E5E0] font-medium">
              <tr className="hover:bg-[#FFF7F0]/40 transition-colors">
                <td className="px-6 py-4 font-mono font-bold text-[#9B2A48]">MH-CAF-2026-00412</td>
                <td className="px-6 py-4 font-bold text-[#16060E]">Maharashtra Solvents Ltd</td>
                <td className="px-6 py-4 text-slate-600">Plot Allotment Scrutiny</td>
                <td className="px-6 py-4 text-[#9B2A48] font-bold">4 Days Left</td>
                <td className="px-6 py-4 text-right space-x-2">
                  {approvedList.includes("MH-CAF-2026-00412") ? (
                    <span className="inline-flex items-center space-x-1 text-xs font-bold text-[#9B2A48] bg-[#FFF2DF] px-3 py-1 rounded-lg border border-[#FED17A]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#FE7251]" />
                      <span>Approved</span>
                    </span>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => handleApprove("MH-CAF-2026-00412")}
                        className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#9B2A48] to-[#FE7251] hover:from-[#7D1E36] hover:to-[#E55B3B] text-white font-bold text-[11px] shadow-xs cursor-pointer transition-all"
                      >
                        Endorse & Approve
                      </button>
                      <button
                        type="button"
                        onClick={() => alert("Query dispatched to applicant")}
                        className="px-3 py-1.5 rounded-lg bg-[#FFF7F0] hover:bg-[#FFF2DF] text-[#9B2A48] border border-[#FED17A] font-bold text-[11px] shadow-xs cursor-pointer transition-colors"
                      >
                        Raise Query
                      </button>
                    </>
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

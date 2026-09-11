"use client";

import React from "react";
import Link from "next/link";
import { CheckCircle2, Clock, ChevronRight, Building2, ShieldCheck, Flame, Utensils, Store, Factory } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useEnterpriseStore } from "@/store/enterpriseStore";

export default function DepartmentApprovalsPage() {
  const { t } = useLanguage();
  const { clearances, sector, isAssessed } = useEnterpriseStore();

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16">
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-black text-slate-900">
              {t("department_approvals_title") || "Department View"}
            </h1>
            <p className="text-xs text-slate-600 mt-1">
              {isAssessed
                ? `Active statutory approvals dynamically generated for ${sector} under Maharashtra RTS Act.`
                : "Overview of approvals required from individual state & central departments."}
            </p>
          </div>
          <Link
            href="/dashboard/kya"
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
          >
            <span>Re-evaluate KYA Rules</span>
          </Link>
        </div>

        <div className="grid gap-3.5">
          {clearances.map((c) => (
            <div
              key={c.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-colors gap-3 shadow-2xs"
            >
              <div className="flex items-start space-x-3.5">
                <div className="w-9 h-9 rounded-lg bg-[#FFF2DF] border border-[#FED17A] flex items-center justify-center text-[#FE7251] shrink-0 mt-0.5">
                  <Clock className="w-4 h-4 text-[#FE7251]" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{c.name}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">{c.department}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 shrink-0 self-end sm:self-auto">
                <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-bold text-xs border border-slate-200">
                  {c.slaDays} Days SLA
                </span>
                <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 font-bold text-xs border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>RTS Guarantee</span>
                </span>
                <Link
                  href={`/apply/${c.approvalSlug || c.id}`}
                  className="inline-flex items-center space-x-1 px-3.5 py-1.5 rounded-lg bg-[#FE7251] hover:bg-[#E85E3E] text-white font-bold text-xs transition-colors shadow-xs"
                >
                  <span>Apply</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

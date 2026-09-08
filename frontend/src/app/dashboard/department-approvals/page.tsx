"use client";

import React from "react";
import { CheckCircle2, Clock } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function DepartmentApprovalsPage() {
  const { t } = useLanguage();

  const approvals = [
    { id: 1, department: "MIDC", status: "Approved", date: "2024-11-12" },
    { id: 2, department: "MPCB", status: "Pending", date: "2024-11-10" },
    { id: 3, department: "Fire Services", status: "In Review", date: "2024-11-08" },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16">
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#F0E5E0] shadow-xs">
        <h1 className="text-2xl font-black text-[#16060E] mb-4">
          {t("department_approvals_title") || "Department Approvals"}
        </h1>
        <p className="text-sm text-slate-600 mb-6">
          Overview of approvals required from individual departments for the current application.
        </p>
        <div className="grid gap-4">
          {approvals.map((a) => (
            <div
              key={a.id}
              className="flex items-center justify-between p-4 rounded-xl border border-[#F0E5E0] bg-[#FFF9F5]"
            >
              <div className="flex items-center space-x-3">
                <Clock className="w-4 h-4 text-[#FE7251]" />
                <span className="font-medium text-[#16060E]">{a.department}</span>
              </div>
              <div className="flex items-center space-x-2">
                {a.status === "Approved" ? (
                  <CheckCircle2 className="w-4 h-4 text-[#9B2A48]" />
                ) : null}
                <span className="text-xs text-[#886A75]">{a.status}</span>
                <span className="text-xs text-[#886A75]">{a.date}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

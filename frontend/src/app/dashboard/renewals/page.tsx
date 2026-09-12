"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  RotateCcw,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileCheck2,
  Building2,
  ArrowRight,
  ShieldCheck,
  Send,
  Download,
  AlertCircle,
  FileText,
  Layers,
} from "lucide-react";
import { useEnterpriseStore, RenewalItem } from "@/store/enterpriseStore";
import { useNotificationStore } from "@/store/notificationStore";
import { useLanguage } from "@/context/LanguageContext";

export default function RenewalsPage() {
  const { t } = useLanguage();
  const { renewals, initiateRenewal, applicationRef, extractedFields, sector } = useEnterpriseStore();
  const addNotification = useNotificationStore((s) => s.addNotification);

  const [activeRenewalModal, setActiveRenewalModal] = useState<RenewalItem | null>(null);
  const [renewalPeriod, setRenewalPeriod] = useState("5 Years");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successReceipt, setSuccessReceipt] = useState<{ id: string; ref: string; title: string; date: string } | null>(null);

  const getRenewalStatus = (days: number) => {
    if (days <= 0) return { label: "Expired", bg: "bg-rose-50 border-rose-200 text-rose-800" };
    if (days <= 30) return { label: "Critical (Action Required)", bg: "bg-rose-50 border-rose-300 text-rose-900" };
    if (days <= 60) return { label: "Due Soon (<60 Days)", bg: "bg-amber-50 border-amber-300 text-amber-900" };
    return { label: "Active", bg: "bg-emerald-50 border-emerald-200 text-emerald-900" };
  };

  const handleApplyRenewal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeRenewalModal) return;

    setIsSubmitting(true);
    setTimeout(() => {
      initiateRenewal(activeRenewalModal.id);
      const receiptRef = `REN-MH-2026-${Math.floor(100000 + Math.random() * 900000)}`;

      addNotification({
        type: "sla",
        title: "Renewal Application Submitted",
        message: `Statutory renewal for ${activeRenewalModal.clearanceTitle} filed under ref ${receiptRef}. 15-day statutory SLA triggered.`,
        severity: "success",
        target: "/dashboard/renewals",
      });

      setSuccessReceipt({
        id: activeRenewalModal.id,
        ref: receiptRef,
        title: activeRenewalModal.clearanceTitle,
        date: new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
      });

      setIsSubmitting(false);
      setActiveRenewalModal(null);
    }, 700);
  };

  const handleDownloadReceipt = (receipt: { id: string; ref: string; title: string; date: string }) => {
    const cert = `GOVERNMENT OF MAHARASHTRA
DIRECTORATE OF INDUSTRIAL CLEARANCES & STATUTORY RENEWALS
ACKNOWLEDGEMENT & DEEMED TIMELINE CERTIFICATE
----------------------------------------------------------------------
Acknowledgement Ref: ${receipt.ref}
Clearance: ${receipt.title}
Enterprise: ${extractedFields.entity_name?.value || "Maharashtra Solvents & Chemicals Pvt Ltd"}
Filing Date: ${receipt.date}
Statutory Disposal SLA: 15 Working Days (Maharashtra RTS Act 2015)
Deemed Renewal Clause: Section 10 RTS Act applicable upon SLA expiry
Digital Verification Token: MH-REN-${Math.random().toString(36).substring(2).toUpperCase()}
----------------------------------------------------------------------`;

    const blob = new Blob([cert], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${receipt.ref}_Renewal_Acknowledgement.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const criticalCount = renewals.filter((r) => r.daysRemaining <= 30).length;
  const dueSoonCount = renewals.filter((r) => r.daysRemaining > 30 && r.daysRemaining <= 60).length;
  const activeCount = renewals.filter((r) => r.daysRemaining > 60).length;

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#F0E5E0] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#FFF2DF] border border-[#FED17A] text-[#9B2A48] text-xs font-bold uppercase tracking-wider mb-2">
            <RotateCcw className="w-3.5 h-3.5 text-[#FE7251]" />
            <span>Statutory Compliance Lifecycle</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#16060E] tracking-tight">
            Statutory Renewals Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
            Track license expirations across MPCB, DISH, Fire and Electricity authorities. File seamless one-click renewals auto-populated from your central Document Vault.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/dashboard/dag"
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
          >
            <span>Approval Tracker</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Success Notification Banner */}
      {successReceipt && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center space-x-3 text-xs">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <p className="font-bold text-emerald-900">
                Renewal Application Registered: <span className="font-mono">{successReceipt.ref}</span>
              </p>
              <p className="text-emerald-700 text-[11px] mt-0.5">
                {successReceipt.title} has been routed to the departmental portal. 15-day statutory SLA countdown initialized.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleDownloadReceipt(successReceipt)}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Receipt</span>
            </button>
            <button
              type="button"
              onClick={() => setSuccessReceipt(null)}
              className="px-2.5 py-1 text-xs text-slate-500 hover:text-slate-700"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-rose-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-600">Action Required (&le;30 Days)</span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <p className="text-3xl font-black text-rose-700 mt-2">{criticalCount}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Risk of statutory penalty or stoppage</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-amber-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-700">Due Soon (31-60 Days)</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-3xl font-black text-amber-700 mt-2">{dueSoonCount}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Early renewal window now open</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-[#F0E5E0] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">Healthy / Active (&gt;60 Days)</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-3xl font-black text-emerald-700 mt-2">{activeCount}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Full compliance verified</p>
        </div>
      </div>

      {/* Renewals Table */}
      <div className="bg-white rounded-2xl border border-[#F0E5E0] shadow-xs overflow-hidden">
        <div className="p-6 border-b border-[#F0E5E0] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-[#16060E]">Mandatory Statutory Renewals</h2>
            <p className="text-xs text-slate-500">
              Clearances registered under {extractedFields.entity_name?.value || "Maharashtra Solvents"} • Enterprise Ref: {applicationRef || "MH-CAF-2026-00412"}
            </p>
          </div>
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#FFF2DF] text-[#9B2A48] border border-[#FED17A]">
            Auto-Renewal Protocol Active
          </span>
        </div>

        <div className="divide-y divide-[#F0E5E0]">
          {renewals.map((item) => {
            const st = getRenewalStatus(item.daysRemaining);
            return (
              <div key={item.id} className="p-5 sm:p-6 hover:bg-[#FFFDFC] transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="space-y-1.5 max-w-xl">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-bold text-[#16060E]">{item.clearanceTitle}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${st.bg}`}>
                      {st.label}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{item.issuingAuthority}</span>
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Validity tenure: <strong>{item.validityPeriod}</strong> • Pre-populated from Document Vault
                  </p>
                </div>

                <div className="flex items-center gap-6 shrink-0">
                  <div className="text-left lg:text-right">
                    <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Days Remaining</p>
                    <p className={`text-2xl font-black font-mono ${item.daysRemaining <= 30 ? "text-rose-600" : item.daysRemaining <= 60 ? "text-amber-600" : "text-slate-800"}`}>
                      {item.daysRemaining} Days
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveRenewalModal(item)}
                    className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-[#9B2A48] hover:bg-[#7D1E36] text-white text-xs font-bold shadow-xs transition-colors cursor-pointer whitespace-nowrap"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Renew Online</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Automated Renewal Guarantee Card */}
      <div className="p-5 rounded-2xl bg-[#FFF9F5] border border-[#FED17A] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
        <div className="flex items-start space-x-3">
          <ShieldCheck className="w-5 h-5 text-[#FE7251] shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-[#16060E]">Maharashtra Right to Services Act — Statutory Renewal Guarantee</p>
            <p className="text-slate-600 text-[11px] mt-0.5 leading-relaxed">
              If the department fails to process a renewal application within 15 working days, an automatic <strong>Deemed Renewal Order</strong> is issued under Section 10 of the RTS Act 2015 with digital hash verification.
            </p>
          </div>
        </div>
        <Link
          href="/dashboard/sla"
          className="inline-flex items-center gap-1 font-bold text-[#9B2A48] hover:underline shrink-0"
        >
          <span>View Deemed SLAs</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Renewal Modal */}
      {activeRenewalModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-[#FED17A] space-y-5">
            <div className="flex items-center justify-between border-b border-[#F0E5E0] pb-3">
              <div className="flex items-center space-x-2">
                <RotateCcw className="w-5 h-5 text-[#FE7251]" />
                <h3 className="font-bold text-sm text-[#16060E]">File Statutory Renewal</h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveRenewalModal(null)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <p className="font-bold text-[#16060E]">{activeRenewalModal.clearanceTitle}</p>
                <p className="text-slate-500 text-[11px] mt-0.5">{activeRenewalModal.issuingAuthority}</p>
                <p className="text-rose-600 font-bold mt-1 text-[11px]">
                  Current expiry window: {activeRenewalModal.daysRemaining} Days remaining
                </p>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Select Requested Extension Tenure</label>
                <select
                  value={renewalPeriod}
                  onChange={(e) => setRenewalPeriod(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-[#FE7251]"
                >
                  <option value="1 Year">1 Year Extension (Standard Audit)</option>
                  <option value="3 Years">3 Years Extension (Fast-Track Track Record)</option>
                  <option value="5 Years">5 Years Statutory Grant (Recommended)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Attached Central Vault Dossier</label>
                <div className="space-y-1.5 p-3 rounded-xl bg-[#FFF9F5] border border-[#FED17A]/60 text-[11px]">
                  <p className="flex items-center gap-1.5 text-slate-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Annual Environmental Compliance Report (Form-V)</span>
                  </p>
                  <p className="flex items-center gap-1.5 text-slate-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Fire Safety Audit Endorsement & Hydrant Test Report</span>
                  </p>
                  <p className="flex items-center gap-1.5 text-slate-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Valid Industrial Electricity & Water Bill Proofs</span>
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-3 flex items-center justify-end space-x-2 border-t border-[#F0E5E0]">
              <button
                type="button"
                onClick={() => setActiveRenewalModal(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApplyRenewal}
                disabled={isSubmitting}
                className="inline-flex items-center space-x-1.5 px-5 py-2.5 rounded-xl bg-[#FE7251] hover:bg-[#E85E3E] text-white text-xs font-bold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmitting ? "Submitting Application..." : "Submit Renewal Dossier"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

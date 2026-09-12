"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  FileCheck,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowRight,
  Sparkles,
  MessageSquare,
  FileText,
  Building2,
  Clock,
  Eye,
  Send,
  X,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useEnterpriseStore } from "@/store/enterpriseStore";
import { useLanguage } from "@/context/LanguageContext";
import type { NodeStatus } from "@/app/dashboard/dag/page";

// Risk configuration for badges and actions
const riskConfig = {
  RED: {
    label: "High Risk",
    description: "Physical Site Inspection & Multi‑Officer Board Review Required",
    badgeClass: "bg-red-600 text-white",
    actionLabel: "Assign Joint Inspection",
    actionLink: "/dashboard/inspections",
  },
  ORANGE: {
    label: "Moderate Risk",
    description: "Desk Audit & Document Scrutiny",
    badgeClass: "bg-orange-500 text-white",
  },
  GREEN: {
    label: "Low Risk / Self‑Certified",
    description: "Self‑Certification / Instant Deemed Grant",
    badgeClass: "bg-green-600 text-white",
  },
} as const;

export default function OfficerWorkspacePage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const {
    applicationRef,
    applicationStatus,
    clearances,
    extractedFields,
    uploadedDocuments,
    dagNodeStatuses,
    updateDAGNodeStatus,
    setDAGNodeStatuses,
    addGrievanceTicket,
  } = useEnterpriseStore();

  const [activeQueryModal, setActiveQueryModal] = useState<{ ref: string; dept: string } | null>(null);
  const [querySubject, setQuerySubject] = useState("");
  const [queryDescription, setQueryDescription] = useState("");
  const [querySuccessNotice, setQuerySuccessNotice] = useState<string | null>(null);
  const [approvedRefs, setApprovedRefs] = useState<string[]>([]);
  const [selectedRisk, setSelectedRisk] = useState<'ALL' | 'RED' | 'ORANGE' | 'GREEN'>('ALL');

  if (user?.role !== "OFFICER") {
    return (
      <div className="bg-white rounded-2xl p-8 border border-[#FED17A] text-center max-w-lg mx-auto shadow-xs">
        <ShieldCheck className="w-12 h-12 text-[#9B2A48] mx-auto mb-3" />
        <h3 className="text-lg font-bold text-[#16060E]">{t("officer_restricted") || "Restricted Officer Access"}</h3>
        <p className="text-xs text-slate-500 mt-1">
          {t("officer_restricted_desc") || "This workspace is exclusively for verified Department Scrutiny Officers. Toggle 'Officer View' in the top bar to test."}
        </p>
      </div>
    );
  }

  // Queue items combining submitted application and default queue
  const reviewQueue = [
    {
      ref: applicationRef || "MH-CAF-2026-00412",
      enterpriseName: extractedFields.entity_name?.value || "Maharashtra Solvents & Chemicals Pvt Ltd",
      clearanceName: "MIDC Industrial Land & Layout Approval",
      dept: "Maharashtra Industrial Development Corporation (MIDC)",
      slaDaysLeft: "4 Working Days",
      nodeId: "node-root",
      status: dagNodeStatuses["node-root"] === "approved" || approvedRefs.includes(applicationRef || "MH-CAF-2026-00412") ? "approved" : "pending",
      riskTrack: "RED",
    },
    {
      ref: "MH-CAF-2026-00398",
      enterpriseName: "Sahyadri Bio-Pharma Technologies",
      clearanceName: "MPCB Consent to Establish (CTE) - Orange Category",
      dept: "Maharashtra Pollution Control Board",
      slaDaysLeft: "6 Working Days",
      nodeId: "node-mpcb",
      status: approvedRefs.includes("MH-CAF-2026-00398") ? "approved" : "pending",
      riskTrack: "ORANGE",
    },    {
      ref: "MH-CAF-2026-00385",
      enterpriseName: "Western Mega Logistics Park LLP",
      clearanceName: "Provisional Fire Safety NOC",
      dept: "Directorate of Fire Services",
      slaDaysLeft: "2 Working Days",
      nodeId: "node-fire",
      status: approvedRefs.includes("MH-CAF-2026-00385") ? "approved" : "pending",
      riskTrack: "GREEN",
    },
  ];

  const BACKEND_API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

  const handleApprove = async (item: typeof reviewQueue[0]) => {
    setApprovedRefs((prev) => [...prev, item.ref]);
    if (item.nodeId) {
      // Optimistic local bump keeps UI instant...
      updateDAGNodeStatus(item.nodeId, "approved");
      // ...but backend is authoritative: persist with the authenticated enterprise,
      // then reconcile the store from the nodes returned in the PATCH response.
      try {
        const res = await fetch(`${BACKEND_API_URL}/dag/${item.nodeId}/approve`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ enterprise_id: user?.enterpriseId }),
        });
        const data = await res.json().catch(() => null);

        if (!res.ok) {
          throw new Error(data?.error || data?.message || `Approval failed (HTTP ${res.status})`);
        }

        // Backend returned nodes are the source of truth — reconcile the store.
        if (data?.nodes && Array.isArray(data.nodes)) {
          const authoritative: Record<string, NodeStatus> = {};
          data.nodes.forEach((n: any) => {
            if (n?.id && n?.status) authoritative[n.id] = n.status as NodeStatus;
          });
          if (Object.keys(authoritative).length > 0) {
            setDAGNodeStatuses(authoritative);
          }
        }
      } catch (err: any) {
        console.error("Failed to persist DAG approval:", err);
        alert(
          `⚠️ Approval could not be persisted to the backend.\n\n${err?.message || "Unknown error"}\n\nThe optimistic local state was set, but it may not survive a refresh.`
        );
      }
    }
  };


  const handleDispatchQuery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeQueryModal || !querySubject.trim()) return;

    addGrievanceTicket({
      subject: `[Officer Query - ${activeQueryModal.dept}] ${querySubject}`,
      category: "Clarification Needed",
      description: `Formal Query raised regarding application ${activeQueryModal.ref}:\n\n${queryDescription || "Please provide clarifying documentation for parameters under departmental review."}`,
      status: "in_progress",
    });

    setQuerySuccessNotice(`Query successfully dispatched to applicant for ${activeQueryModal.ref}. Tracking ticket created.`);
    setActiveQueryModal(null);
    setQuerySubject("");
    setQueryDescription("");
    setTimeout(() => setQuerySuccessNotice(null), 5000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16">
      {/* Top Header */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#F0E5E0] shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#FFF2DF] border border-[#FED17A] text-[#9B2A48] text-xs font-bold uppercase tracking-wider mb-2">
              <ShieldCheck className="w-3.5 h-3.5 text-[#FE7251]" />
              <span>{t("officer_console") || "Department Officer Scrutiny Console"}</span>
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-purple-50 border border-purple-200 text-purple-700 uppercase tracking-wider">Demo</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#16060E] tracking-tight">
              Officer Review
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
              {user?.department || "MIDC Industrial Clearances"} — Review incoming Common Application Forms (CAF), verify OCR field extractions, conduct inspection reports, raise formal queries, or issue digital approval certificates.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/dashboard/dag"
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-[#FFF7F0] hover:bg-[#FFF2DF] text-[#9B2A48] text-xs font-bold border border-[#FED17A] transition-colors"
            >
              <span>View Live DAG</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Notice feedback */}
        {querySuccessNotice && (
          <div className="mt-4 p-4 rounded-xl bg-[#FFF2DF] border border-[#FED17A] text-[#16060E] flex items-center space-x-3 text-xs animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 text-[#9B2A48] shrink-0" />
            <div>
              <p className="font-bold text-[#9B2A48]">Departmental Query Registered</p>
              <p className="text-[#886A75] mt-0.5">{querySuccessNotice}</p>
            </div>
          </div>
        )}

        {/* Risk Filter Selector */}
        <div className="flex items-center space-x-2 mb-4">
          <label htmlFor="riskSelect" className="text-sm font-medium text-[#16060E]">Risk Track:</label>
          <select
            id="riskSelect"
            value={selectedRisk}
            onChange={(e) => setSelectedRisk(e.target.value as 'ALL' | 'RED' | 'ORANGE' | 'GREEN')}
            className="px-2 py-1 border rounded"
          >
            <option value="ALL">All</option>
            <option value="RED">Red – High Risk</option>
            <option value="ORANGE">Orange – Moderate Risk</option>
            <option value="GREEN">Green – Low Risk</option>
          </select>
        </div>
        {/* Filter Summary */}
        <p className="text-sm text-slate-500 mb-2">
          {selectedRisk === 'ALL'
            ? `Showing ${reviewQueue.length} applications`
            : `Showing ${reviewQueue.filter((i) => i.riskTrack === selectedRisk).length} ${selectedRisk} risk applications`}
        </p>

        {/* Scrutiny Table */}
        <div className="mt-6 overflow-x-auto rounded-xl border border-[#F0E5E0]">
          <table className="min-w-full divide-y divide-[#F0E5E0] text-xs">
            <thead className="bg-[#FFF9F5] font-bold text-[#9B2A48] uppercase text-[10px]">
              <tr>
                <th className="px-5 py-3 text-left">Application Ref</th>
                <th className="px-5 py-3 text-left">Enterprise Legal Name</th>
                <th className="px-5 py-3 text-left">Clearance Requested</th>
                <th className="px-5 py-3 text-left">SLA Due Status</th>
                <th className="px-5 py-3 text-right">Review Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0E5E0] font-medium">
              {reviewQueue.map((item) => (
                <tr key={item.ref} className="hover:bg-[#FFF7F0]/40 transition-colors">
                  <td className="px-5 py-4 font-mono font-bold text-[#9B2A48]">{item.ref}</td>
                  <td className="px-5 py-4 font-bold text-[#16060E]">{item.enterpriseName}</td>
                  <td className="px-5 py-4 text-slate-600">
                    <p className="font-semibold text-slate-800">{item.clearanceName}</p>
                    <p className="text-[11px] text-slate-400">{item.dept}</p>
                  </td>
                  <td className="px-5 py-4">
                    <span className="inline-flex items-center space-x-1 font-bold text-[#9B2A48] bg-[#FFF2DF] px-2.5 py-1 rounded-md border border-[#FED17A]">
                      <Clock className="w-3 h-3 text-[#FE7251]" />
                      <span>{item.slaDaysLeft}</span>
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    {item.status === "approved" ? (
                      <span className="inline-flex items-center space-x-1 text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Endorsed & Approved</span>
                      </span>
                    ) : (
                      <div className="inline-flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={() => handleApprove(item)}
                          className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] shadow-xs cursor-pointer transition-colors"
                        >
                          Endorse & Approve
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveQueryModal({ ref: item.ref, dept: item.dept })}
                          className="px-3.5 py-1.5 rounded-lg bg-[#FFF7F0] hover:bg-[#FFF2DF] text-[#9B2A48] border border-[#FED17A] font-bold text-[11px] shadow-xs cursor-pointer transition-colors"
                        >
                          Raise Query
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Interactive Query Modal */}
      {activeQueryModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#FED17A] space-y-4">
            <div className="flex items-center justify-between border-b border-[#F0E5E0] pb-3">
              <div className="flex items-center space-x-2">
                <MessageSquare className="w-5 h-5 text-[#FE7251]" />
                <h3 className="font-bold text-sm text-[#16060E]">
                  Raise Departmental Query • {activeQueryModal.ref}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveQueryModal(null)}
                className="p-1 rounded-md hover:bg-slate-100 text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleDispatchQuery} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#16060E] mb-1">
                  Query Subject / Clarification Area
                </label>
                <input
                  type="text"
                  required
                  value={querySubject}
                  onChange={(e) => setQuerySubject(e.target.value)}
                  placeholder="e.g. Upload revised effluent discharge layout diagram"
                  className="w-full px-3 py-2 text-xs border border-[#F0E5E0] rounded-xl focus:ring-2 focus:ring-[#FE7251] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#16060E] mb-1">
                  Specific Officer Instructions / Remarks
                </label>
                <textarea
                  rows={4}
                  required
                  value={queryDescription}
                  onChange={(e) => setQueryDescription(e.target.value)}
                  placeholder="Detail the exact missing statutory parameter or clarification needed from the applicant..."
                  className="w-full px-3 py-2 text-xs border border-[#F0E5E0] rounded-xl focus:ring-2 focus:ring-[#FE7251] focus:outline-hidden"
                />
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2 border-t border-[#F0E5E0]">
                <button
                  type="button"
                  onClick={() => setActiveQueryModal(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-[#FE7251] hover:bg-[#E85E3E] text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Dispatch Query to Investor</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}


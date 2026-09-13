"use client";

import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  ShieldAlert,
  Shield,
  CheckCircle2,
  AlertTriangle,
  Flag,
  MessageSquareWarning,
  Eye,
  FileText,
} from "lucide-react";
import { useEnterpriseStore } from "@/store/enterpriseStore";

export type RiskLane = "RED" | "ORANGE" | "GREEN";

export interface FieldDiscrepancy {
  field: string;
  applicantValue: string;
  documentValue: string;
  documentName: string;
  reason: string;
}

export interface ReviewCase {
  ref: string;
  enterpriseName: string;
  clearanceName: string;
  dept: string;
  slaDaysLeft: string;
  riskTrack: RiskLane;
  applicationDate: string;
  discrepancies: FieldDiscrepancy[];
}

export const OFFICER_REVIEW_QUEUE: ReviewCase[] = [
  {
    ref: "MH-CAF-2026-00412",
    enterpriseName: "Maharashtra Solvents & Chemicals Pvt Ltd",
    clearanceName: "MIDC Industrial Land & Layout Approval",
    dept: "Maharashtra Industrial Development Corporation (MIDC)",
    slaDaysLeft: "4 Working Days",
    riskTrack: "RED",
    applicationDate: "01-Sep-2026",
    discrepancies: [
      {
        field: "Land Plot ID",
        applicantValue: "Plot 42-A",
        documentValue: "Plot 42-B",
        documentName: "MIDC Deed of Allotment",
        reason: "Deed plot reference does not match the CAF plot declaration.",
      },
      {
        field: "Plot Area (sqm)",
        applicantValue: "5,000",
        documentValue: "4,850",
        documentName: "MIDC Deed of Allotment",
        reason: "Survey area differs from land records.",
      },
    ],
  },
  {
    ref: "MH-CAF-2026-00422",
    enterpriseName: "Aurangabad Agro Industries LLP",
    clearanceName: "MPCB Consent to Establish (CTE) - Red Category",
    dept: "Maharashtra Pollution Control Board",
    slaDaysLeft: "2 Working Days",
    riskTrack: "RED",
    applicationDate: "05-Sep-2026",
    discrepancies: [
      {
        field: "GSTIN",
        applicantValue: "27AABCA9876L1Z4",
        documentValue: "27AABCA9876L1Z5",
        documentName: "GST Registration Certificate",
        reason: "GSTIN check digit mismatch against GSTN records.",
      },
    ],
  },
  {
    ref: "MH-CAF-2026-00418",
    enterpriseName: "Green Chem Biofuels Ltd",
    clearanceName: "Factory License & Safety Sign-off (DISH)",
    dept: "Directorate of Industrial Safety & Health",
    slaDaysLeft: "6 Working Days",
    riskTrack: "RED",
    applicationDate: "05-Sep-2026",
    discrepancies: [
      {
        field: "Boiler Capacity (TPH)",
        applicantValue: "6 TPH",
        documentValue: "8 TPH",
        documentName: "Boiler Inspection Cert",
        reason: "Installed boiler rating exceeds declared capacity.",
      },
    ],
  },
  {
    ref: "MH-CAF-2026-00430",
    enterpriseName: "Nanded Textile Park Pvt Ltd",
    clearanceName: "Provisional Fire Safety NOC",
    dept: "Directorate of Fire Services",
    slaDaysLeft: "1 Working Day",
    riskTrack: "RED",
    applicationDate: "08-Sep-2026",
    discrepancies: [
      {
        field: "Emergency Exits Count",
        applicantValue: "4",
        documentValue: "2",
        documentName: "Building Plan Sanction",
        reason: "Fire egress count on elevation plan is deficient.",
      },
    ],
  },
  {
    ref: "MH-CAF-2026-00398",
    enterpriseName: "Sahyadri Bio-Pharma Technologies",
    clearanceName: "MPCB Consent to Establish (CTE) - Orange Category",
    dept: "Maharashtra Pollution Control Board",
    slaDaysLeft: "6 Working Days",
    riskTrack: "ORANGE",
    applicationDate: "28-Aug-2026",
    discrepancies: [],
  },
  {
    ref: "MH-CAF-2026-00408",
    enterpriseName: "Konkan Fisheries Cold Chain LLP",
    clearanceName: "Bulk Industrial Water Supply Allocation",
    dept: "MIDC Water Wing",
    slaDaysLeft: "3 Working Days",
    riskTrack: "ORANGE",
    applicationDate: "03-Sep-2026",
    discrepancies: [
      {
        field: "Water Demand (KLD)",
        applicantValue: "40 KLD",
        documentValue: "55 KLD",
        documentName: "DPR - Process Flow",
        reason: "Project report water balance exceeds declared quota.",
      },
    ],
  },
  {
    ref: "MH-CAF-2026-00415",
    enterpriseName: "Marathwada Engineering Works",
    clearanceName: "MIDC Building Plan & Land Approval",
    dept: "Maharashtra Industrial Development Corporation",
    slaDaysLeft: "8 Working Days",
    riskTrack: "ORANGE",
    applicationDate: "04-Sep-2026",
    discrepancies: [
      {
        field: "Sanctioned FAR (%)",
        applicantValue: "1.2",
        documentValue: "1.5",
        documentName: "Zonal Development Plan",
        reason: "Plot FAR allowance computed at old zone ceiling.",
      },
    ],
  },
  {
    ref: "MH-CAF-2026-00425",
    enterpriseName: "Western Logistics Park LLP",
    clearanceName: "Power Allocation & High Tension Connection",
    dept: "Maharashtra State Electricity Distribution Co.",
    slaDaysLeft: "5 Working Days",
    riskTrack: "ORANGE",
    applicationDate: "06-Sep-2026",
    discrepancies: [],
  },
  {
    ref: "MH-CAF-2026-00385",
    enterpriseName: "Western Mega Logistics Park LLP",
    clearanceName: "Provisional Fire Safety NOC",
    dept: "Directorate of Fire Services",
    slaDaysLeft: "2 Working Days",
    riskTrack: "GREEN",
    applicationDate: "26-Aug-2026",
    discrepancies: [],
  },
  {
    ref: "MH-CAF-2026-00390",
    enterpriseName: "Pune EV Assembly & Battery Co",
    clearanceName: "EV Manufacturing Sector Clearance",
    dept: "Department of Industries (Thrust Sector Cell)",
    slaDaysLeft: "7 Working Days",
    riskTrack: "GREEN",
    applicationDate: "29-Aug-2026",
    discrepancies: [
      {
        field: "Employment Commitment",
        applicantValue: "1,200",
        documentValue: "1,050",
        documentName: "Sector Booster Application",
        reason: "Employment numbers differ across submissions.",
      },
    ],
  },
  {
    ref: "MH-CAF-2026-00402",
    enterpriseName: "Nashik Agri-processing Hub",
    clearanceName: "Food Safety & FSSAI Registration",
    dept: "Maharashtra Food & Drugs Administration",
    slaDaysLeft: "9 Working Days",
    riskTrack: "GREEN",
    applicationDate: "30-Aug-2026",
    discrepancies: [],
  },
  {
    ref: "MH-CAF-2026-00420",
    enterpriseName: "Chakan Precision Components Pvt Ltd",
    clearanceName: "Water Pollution NOC (Orange)",
    dept: "Maharashtra Pollution Control Board",
    slaDaysLeft: "4 Working Days",
    riskTrack: "GREEN",
    applicationDate: "05-Sep-2026",
    discrepancies: [],
  },
];

interface OfficerReviewConsoleProps {
  onApprove?: (reviewCase: ReviewCase) => void;
  className?: string;
}

const LANE_META: Record<
  RiskLane | "ALL",
  { label: string; icon: React.ComponentType<{ className?: string }>; chipClass: string; activeClass: string }
> = {
  RED: {
    label: "Red Lane · High Hazard / Chemical",
    icon: ShieldAlert,
    chipClass: "border-rose-300 text-rose-700 bg-rose-50",
    activeClass: "bg-rose-600 text-white border-rose-600",
  },
  ORANGE: {
    label: "Orange Lane · Standard",
    icon: Shield,
    chipClass: "border-amber-300 text-amber-700 bg-amber-50",
    activeClass: "bg-amber-500 text-white border-amber-500",
  },
  GREEN: {
    label: "Green Lane · Low Risk / Fast Track",
    icon: ShieldCheck,
    chipClass: "border-emerald-300 text-emerald-700 bg-emerald-50",
    activeClass: "bg-emerald-600 text-white border-emerald-600",
  },
  ALL: {
    label: "All",
    icon: FileText,
    chipClass: "border-slate-300 text-slate-700 bg-slate-50",
    activeClass: "bg-slate-800 text-white border-slate-800",
  },
};

export default function OfficerReviewConsole({
  onApprove,
  className = "",
}: OfficerReviewConsoleProps) {
  const addGrievanceTicket = useEnterpriseStore((s) => s.addGrievanceTicket);
  const [lane, setLane] = useState<RiskLane | "ALL">("ALL");
  const [selectedRef, setSelectedRef] = useState<string | null>("MH-CAF-2026-00412");
  const [flagged, setFlagged] = useState<Record<string, string[]>>({});
  const [flagNote, setFlagNote] = useState<string | null>(null);

  const counts = useMemo(() => {
    const c: Record<RiskLane | "ALL", number> = {
      ALL: OFFICER_REVIEW_QUEUE.length,
      RED: 0,
      ORANGE: 0,
      GREEN: 0,
    };
    for (const reviewCase of OFFICER_REVIEW_QUEUE) c[reviewCase.riskTrack] += 1;
    return c;
  }, []);

  const filtered = lane === "ALL" ? OFFICER_REVIEW_QUEUE : OFFICER_REVIEW_QUEUE.filter((c) => c.riskTrack === lane);
  const selected = selectedRef
    ? OFFICER_REVIEW_QUEUE.find((c) => c.ref === selectedRef)
    : filtered[0] ?? null;

  const flaggedSet = selected ? new Set(flagged[selected.ref] ?? []) : new Set<string>();

  const handleFlag = (reviewCase: ReviewCase, discrepancy: FieldDiscrepancy) => {
    const already = flagged[reviewCase.ref] ?? [];
    if (already.includes(discrepancy.field)) return;
    const next = { ...flagged, [reviewCase.ref]: [...already, discrepancy.field] };
    setFlagged(next);

    addGrievanceTicket({
      subject: `[Officer Query - ${reviewCase.dept}] ${discrepancy.field} discrepancy on ${reviewCase.ref}`,
      category: "Document Discrepancy",
      description: `Application ${reviewCase.ref} (${reviewCase.enterpriseName}): ${discrepancy.field} declared as "${discrepancy.applicantValue}" in the CAF but extracted as "${discrepancy.documentValue}" from ${discrepancy.documentName}. ${discrepancy.reason}`,
      status: "in_progress",
    });

    setFlagNote(
      `Discrepancy flagged & query dispatched for ${reviewCase.ref} — ${discrepancy.field}.`
    );
    window.setTimeout(() => setFlagNote(null), 5000);
  };

  return (
    <div className={`space-y-5 ${className}`}>
      {/* Lane Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {(["ALL", "RED", "ORANGE", "GREEN"] as const).map((key) => {
          const meta = LANE_META[key];
          const IconComp = meta.icon;
          return (
            <button
              key={key}
              type="button"
              onClick={() => setLane(key)}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-bold transition-colors cursor-pointer ${
                lane === key
                  ? meta.activeClass
                  : meta.chipClass + " hover:opacity-80"
              }`}
            >
              <IconComp className="w-3.5 h-3.5" />
              <span>{meta.label}</span>
              <span
                className={`px-1.5 py-0.5 rounded-full text-[9px] font-black ${
                  lane === key ? "bg-white/20" : "bg-white/70"
                }`}
              >
                {counts[key]}
              </span>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Queue List */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
              Risk-Stratified Queue
            </h3>
            <span className="text-[10px] text-slate-400">{filtered.length} pending</span>
          </div>
          <div className="divide-y divide-slate-100 max-h-[480px] overflow-y-auto">
            <AnimatePresence initial={false}>
              {filtered.map((reviewCase) => {
                const laneMeta = LANE_META[reviewCase.riskTrack];
                const LaneIcon = laneMeta.icon;
                const discrepancyCount = reviewCase.discrepancies.length;
                const isSelected = selected?.ref === reviewCase.ref;
                return (
                  <motion.button
                    key={reviewCase.ref}
                    type="button"
                    layout
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    onClick={() => setSelectedRef(reviewCase.ref)}
                    className={`w-full text-left px-4 py-3 transition-colors cursor-pointer ${
                      isSelected ? "bg-[#FFF7F0]" : "hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-[11px] font-black text-[#9B2A48]">
                        {reviewCase.ref}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-black uppercase border ${laneMeta.chipClass}`}
                      >
                        <LaneIcon className="w-2.5 h-2.5" />
                        {reviewCase.riskTrack}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-slate-900 mt-1 truncate">
                      {reviewCase.enterpriseName}
                    </p>
                    <p className="text-[10px] text-slate-500 truncate">
                      {reviewCase.clearanceName}
                    </p>
                    <div className="flex items-center justify-between mt-1.5">
                      <span className="text-[10px] text-slate-400">{reviewCase.slaDaysLeft}</span>
                      {discrepancyCount > 0 ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-600">
                          <AlertTriangle className="w-3 h-3" />
                          {discrepancyCount} discrepancy{discrepancyCount > 1 ? "ies" : ""}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600">
                          <CheckCircle2 className="w-3 h-3" />
                          Verified
                        </span>
                      )}
                    </div>
                  </motion.button>
                );
              })}
            </AnimatePresence>
          </div>
        </div>

        {/* Comparison Panel */}
        <div className="lg:col-span-3 rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
          {flagNote && (
            <div className="mx-4 mt-4 p-3 rounded-xl bg-[#FFF2DF] border border-[#FED17A] text-[11px] font-semibold text-[#9B2A48] flex items-center gap-2 animate-in fade-in">
              <MessageSquareWarning className="w-4 h-4 shrink-0" />
              {flagNote}
            </div>
          )}

          {selected ? (
            <div>
              <div className="px-5 py-4 border-b border-slate-100">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#FFF2DF] border border-[#FED17A] text-[#9B2A48] text-[10px] font-black uppercase tracking-wider">
                      {selected.dept}
                    </span>
                    <h4 className="text-base font-black text-slate-900 mt-1.5">
                      Inline Data Pre-Validation · {selected.ref}
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {selected.enterpriseName} — {selected.clearanceName} · Applied {selected.applicationDate}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-black border ${LANE_META[selected.riskTrack].chipClass}`}>
                      {(() => {
                        const LaneRowIcon = LANE_META[selected.riskTrack].icon;
                        return <LaneRowIcon className="w-3 h-3" />;
                      })()}
                      {LANE_META[selected.riskTrack].label}
                    </span>
                    {selected.discrepancies.length === 0 && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-black">
                        <CheckCircle2 className="w-3 h-3" />
                        All Fields Match
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* OCR vs Applicant comparison table */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-100 text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="px-5 py-3 text-left">Verified Field</th>
                      <th className="px-5 py-3 text-left">Applicant Form Input</th>
                      <th className="px-5 py-3 text-left">Extracted (Document)</th>
                      <th className="px-5 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selected.discrepancies.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-5 py-10 text-center">
                          <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                          <p className="text-sm font-bold text-slate-700">
                            No OCR → Form discrepancies detected
                          </p>
                          <p className="text-[11px] text-slate-400 mt-1">
                            All extracted statutory parameters match the common application form.
                          </p>
                        </td>
                      </tr>
                    ) : (
                      selected.discrepancies.map((d) => {
                        const isFlagged = flaggedSet.has(d.field);
                        return (
                          <tr key={d.field} className={isFlagged ? "bg-emerald-50/50" : "bg-rose-50/40"}>
                            <td className="px-5 py-4 align-top">
                              <p className="font-bold text-slate-900">{d.field}</p>
                              <p className="text-[10px] text-slate-400 mt-0.5">{d.reason}</p>
                            </td>
                            <td className="px-5 py-4 align-top">
                              <span className="inline-block px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 font-mono font-bold text-slate-800">
                                {d.applicantValue}
                              </span>
                            </td>
                            <td className="px-5 py-4 align-top">
                              <span className="inline-block px-2.5 py-1.5 rounded-lg bg-rose-100 border border-rose-300 font-mono font-bold text-rose-800">
                                {d.documentValue}
                              </span>
                              <p className="text-[9px] text-slate-400 mt-1">
                                {d.documentName}
                              </p>
                            </td>
                            <td className="px-5 py-4 text-right align-top">
                              {isFlagged ? (
                                <span className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-black">
                                  <CheckCircle2 className="w-3 h-3" />
                                  Queried
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleFlag(selected, d)}
                                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-black transition-colors cursor-pointer"
                                >
                                  <Flag className="w-3 h-3" />
                                  Flag Document Discrepancy &amp; Issue Query
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Footer actions */}
              <div className="px-5 py-4 border-t border-slate-100 flex items-center justify-between gap-3 bg-slate-50/60">
                <span className="text-[10px] text-slate-400 flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  OCR confidence stream tied to the tamper-evident audit log
                </span>
                {onApprove && (
                  <button
                    type="button"
                    onClick={() => onApprove(selected)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-xs transition-colors cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Endorse &amp; Approve
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="p-10 text-center text-xs text-slate-400">
              Select an application from the queue to begin scrutiny.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
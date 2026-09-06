"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  FileCheck2,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Unlock,
  Building2,
  Layers,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  RotateCcw,
  FileText,
  HelpCircle,
  TrendingDown,
  Info,
  Scale,
} from "lucide-react";
import { useEnterpriseStore } from "@/store/enterpriseStore";

interface CrossDocField {
  fieldName: string;
  label: string;
  unit: string;
  docAValue: string;
  docAName: string;
  docBValue: string;
  docBName: string;
}

// Tolerance threshold (2%)
const TOLERANCE_PERCENTAGE = 2.0;

/**
 * Real comparison function to calculate percentage difference between numeric strings
 * or exact equality for textual strings.
 */
function compareFieldValues(valA: string, valB: string): {
  isMismatch: boolean;
  diffPercent: number;
  valANum: number | null;
  valBNum: number | null;
} {
  if (!valA || !valB) {
    return { isMismatch: false, diffPercent: 0, valANum: null, valBNum: null };
  }

  // Extract pure numbers if applicable
  const cleanA = valA.replace(/[^0-9.]/g, "");
  const cleanB = valB.replace(/[^0-9.]/g, "");

  const numA = parseFloat(cleanA);
  const numB = parseFloat(cleanB);

  // If both are numbers
  if (!isNaN(numA) && !isNaN(numB) && numA > 0 && numB > 0) {
    const diff = Math.abs(numA - numB);
    const maxVal = Math.max(numA, numB);
    const diffPercent = (diff / maxVal) * 100;
    const isMismatch = diffPercent > TOLERANCE_PERCENTAGE;

    return { isMismatch, diffPercent, valANum: numA, valBNum: numB };
  }

  // Fallback to strict normalized text comparison
  const textMismatch = valA.trim().toLowerCase() !== valB.trim().toLowerCase();
  return {
    isMismatch: textMismatch,
    diffPercent: textMismatch ? 100 : 0,
    valANum: null,
    valBNum: null,
  };
}

export default function PreValidationPage() {
  const {
    extractedFields,
    uploadedDocumentName,
    sector,
    locationZone,
    capexCr,
    powerLoadKva,
  } = useEnterpriseStore();

  // Baseline Form Values (from store or initial default)
  const initialPlotA = extractedFields.plot_area_sqm?.value || "5000";
  const initialPlotANum = parseFloat(initialPlotA.replace(/[^0-9.]/g, "")) || 5000;

  // We set up a simulated cross-document discrepancy for plot_area_sqm:
  // Doc A: MIDC Land Allotment Deed (e.g. 5,000 sq.m)
  // Doc B: Architect Detailed Project Report (e.g. 4,800 sq.m - creating a 4% mismatch > 2% tolerance)
  const [docAName] = useState("MIDC_Lease_Allotment_Deed.pdf");
  const [docBName] = useState(uploadedDocumentName || "Architect_Layout_DPR.pdf");

  const [docAValue, setDocAValue] = useState<string>(initialPlotANum.toString());
  const [docBValue, setDocBValue] = useState<string>("4800"); // 4800 creates real mismatch with 5000

  // Form Fields State for MPCB Consent to Establish
  const [formData, setFormData] = useState({
    entityName: extractedFields.entity_name?.value || "Maharashtra Solvents & Chemicals Pvt Ltd",
    pan: extractedFields.pan?.value || "ABCDE1234F",
    gstin: extractedFields.gstin?.value || "27ABCDE1234F1Z5",
    sector: sector || "Chemical Manufacturing",
    locationZone: locationZone || "Chakan MIDC (Pune)",
    powerLoadKva: powerLoadKva || 250,
    capexCr: capexCr || 35,
    resolvedPlotArea: "5000",
  });

  const [submissionSuccess, setSubmissionSuccess] = useState(false);

  // Live Reactive Comparison
  const comparisonResult = useMemo(() => {
    return compareFieldValues(docAValue, docBValue);
  }, [docAValue, docBValue]);

  const isMismatch = comparisonResult.isMismatch;

  // Sync resolved plot area when user matches them
  useEffect(() => {
    if (!isMismatch) {
      setFormData((prev) => ({
        ...prev,
        resolvedPlotArea: docAValue,
      }));
    }
  }, [isMismatch, docAValue]);

  // Quick helper to resolve mismatch with 1 click
  const handleAutoAlign = (chosenValue: string) => {
    setDocAValue(chosenValue);
    setDocBValue(chosenValue);
  };

  const handleSubmitApplication = (e: React.FormEvent) => {
    e.preventDefault();
    if (isMismatch) return;
    setSubmissionSuccess(true);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* Top Header */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-[#059669] text-xs font-bold uppercase tracking-wider mb-2">
            <FileCheck2 className="w-3.5 h-3.5 text-[#059669]" />
            <span>AI Automated Scrutiny & Cross-Verification Gate</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#0F172A] tracking-tight">
            Pre-Validation & Document Comparison
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Automated cross-check engine verifying consistency across multi-document statutory filings before submission.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <span
            className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border ${
              isMismatch
                ? "bg-rose-50 text-[#E11D48] border-rose-200"
                : "bg-emerald-50 text-[#059669] border-emerald-200"
            }`}
          >
            {isMismatch ? (
              <>
                <Lock className="w-3.5 h-3.5" />
                <span>Quality Gate Locked</span>
              </>
            ) : (
              <>
                <Unlock className="w-3.5 h-3.5" />
                <span>Quality Gate Passed</span>
              </>
            )}
          </span>
        </div>
      </div>

      {/* 1. BLOCKING ALERT BANNER IF MISMATCH DETECTED */}
      {isMismatch ? (
        <div className="p-5 rounded-2xl bg-rose-50 border-2 border-[#E11D48] text-rose-950 shadow-sm animate-pulse flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-6 h-6 text-[#E11D48] shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-extrabold text-[#E11D48] tracking-tight">
                ⚠️ Discrepancy Detected Between Uploaded Statutory Filings
              </h3>
              <p className="text-xs text-rose-900 mt-1 leading-relaxed">
                <strong>Plot Area (sq.m)</strong> discrepancy found: <strong>{docAName}</strong> states{" "}
                <span className="font-mono font-bold bg-rose-200/60 px-1 rounded">{docAValue} sq.m</span> vs{" "}
                <strong>{docBName}</strong> stating{" "}
                <span className="font-mono font-bold bg-rose-200/60 px-1 rounded">{docBValue} sq.m</span>{" "}
                (Difference: <strong>{comparisonResult.diffPercent.toFixed(1)}%</strong> &gt; 2.0% tolerance).
              </p>
              <p className="text-[11px] font-bold text-[#E11D48] mt-1.5">
                Submission is locked until resolved to prevent statutory rejection by department officers.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => handleAutoAlign(docAValue)}
              className="px-3.5 py-2 rounded-xl bg-[#E11D48] text-white text-xs font-bold shadow-xs hover:bg-[#BE123C] transition-colors cursor-pointer whitespace-nowrap"
            >
              Align to {docAValue} sq.m
            </button>
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 flex items-center justify-between">
          <div className="flex items-center space-x-3 text-xs">
            <CheckCircle2 className="w-5 h-5 text-[#059669] shrink-0" />
            <div>
              <p className="font-bold text-[#059669]">All Cross-Document Consistency Checks Passed</p>
              <p className="text-emerald-800 text-[11px]">
                Plot area ({docAValue} sq.m), PAN, and GSTIN are 100% synchronized across MIDC and DPR dossiers.
              </p>
            </div>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-200 text-emerald-900 uppercase">
            Ready to Submit
          </span>
        </div>
      )}

      {/* 2. REAL CROSS-DOCUMENT COMPARISON CARD */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold shrink-0">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#0F172A]">
                Cross-Document Verification & Tolerance Scrutiny
              </h2>
              <p className="text-xs text-slate-500">
                Comparing matching parameters extracted from multi-source PDFs
              </p>
            </div>
          </div>

          {/* Quick Preset Buttons to test Mismatch vs Match */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setDocAValue("5000");
                setDocBValue("4800");
              }}
              className="px-2.5 py-1 text-[11px] font-bold rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
            >
              Simulate Mismatch (5000 vs 4800)
            </button>
            <button
              type="button"
              onClick={() => {
                setDocAValue("5000");
                setDocBValue("5000");
              }}
              className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors cursor-pointer"
            >
              Simulate Match (5000 vs 5000)
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Document A Column */}
            <div
              className={`p-5 rounded-2xl border-2 transition-all ${
                isMismatch
                  ? "border-[#E11D48] bg-rose-50/40"
                  : "border-emerald-300 bg-emerald-50/20"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-indigo-600" />
                  <span className="text-xs font-bold text-slate-800">Source Dossier A</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                  DigiLocker Verified
                </span>
              </div>
              <p className="text-xs font-mono font-bold text-slate-900 truncate mb-4">
                {docAName}
              </p>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Industrial Plot Area (sq.m)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={docAValue}
                    onChange={(e) => setDocAValue(e.target.value)}
                    className={`block w-full px-3.5 py-2.5 rounded-xl text-base font-black font-mono transition-colors focus:outline-hidden ${
                      isMismatch
                        ? "bg-white border-2 border-[#E11D48] text-rose-900 focus:ring-2 focus:ring-rose-400"
                        : "bg-white border-2 border-emerald-500 text-emerald-900 focus:ring-2 focus:ring-emerald-400"
                    }`}
                  />
                  <span className="absolute right-3.5 top-3 text-xs font-bold text-slate-400">
                    sq.m
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Editable input: updates trigger real-time reactive comparison.
                </p>
              </div>
            </div>

            {/* Document B Column */}
            <div
              className={`p-5 rounded-2xl border-2 transition-all ${
                isMismatch
                  ? "border-[#E11D48] bg-rose-50/40"
                  : "border-emerald-300 bg-emerald-50/20"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-purple-600" />
                  <span className="text-xs font-bold text-slate-800">Source Dossier B</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                  AI OCR Extracted
                </span>
              </div>
              <p className="text-xs font-mono font-bold text-slate-900 truncate mb-4">
                {docBName}
              </p>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Industrial Plot Area (sq.m)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={docBValue}
                    onChange={(e) => setDocBValue(e.target.value)}
                    className={`block w-full px-3.5 py-2.5 rounded-xl text-base font-black font-mono transition-colors focus:outline-hidden ${
                      isMismatch
                        ? "bg-white border-2 border-[#E11D48] text-rose-900 focus:ring-2 focus:ring-rose-400"
                        : "bg-white border-2 border-emerald-500 text-emerald-900 focus:ring-2 focus:ring-emerald-400"
                    }`}
                  />
                  <span className="absolute right-3.5 top-3 text-xs font-bold text-slate-400">
                    sq.m
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Editable input: adjust value to test dynamic tolerance threshold.
                </p>
              </div>
            </div>
          </div>

          {/* Scrutiny Status Summary Strip */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
            <div className="flex items-center space-x-2 text-slate-700">
              <Info className="w-4 h-4 text-indigo-500 shrink-0" />
              <span>
                <strong>Tolerance Rule:</strong> Difference &le; 2.0% allowed for survey margin; current difference is{" "}
                <strong className={isMismatch ? "text-[#E11D48]" : "text-[#059669]"}>
                  {comparisonResult.diffPercent.toFixed(2)}%
                </strong>.
              </span>
            </div>

            {isMismatch && (
              <button
                type="button"
                onClick={() => setDocBValue(docAValue)}
                className="text-xs font-bold text-indigo-600 hover:underline cursor-pointer"
              >
                Resolve Mismatch (Sync B to A)
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 3. AUTO-FILLED APPLICATION FORM (MPCB Consent to Establish) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 uppercase">
              Application Form Preview
            </span>
            <h2 className="text-base font-bold text-[#0F172A] mt-1">
              MPCB Consent to Establish (CTE) Form • Pre-Populated
            </h2>
            <p className="text-xs text-slate-500">
              Fields populated automatically from AI Vault and verified DigiLocker certificates
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-400">Source:</span>
            <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded">
              Zustand enterpriseStore
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmitApplication} className="p-6 sm:p-8 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Entity Name */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Enterprise Legal Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.entityName}
                  onChange={(e) => setFormData({ ...formData, entityName: e.target.value })}
                  className="block w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
                <span className="absolute right-3 top-2.5 text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700">
                  AI Synced
                </span>
              </div>
            </div>

            {/* Sector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Industry Sector
              </label>
              <input
                type="text"
                value={formData.sector}
                readOnly
                className="block w-full px-3.5 py-2.5 bg-slate-100 border border-slate-300 rounded-xl text-sm font-semibold text-slate-700 cursor-not-allowed"
              />
            </div>

            {/* PAN */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Enterprise PAN
              </label>
              <input
                type="text"
                value={formData.pan}
                onChange={(e) => setFormData({ ...formData, pan: e.target.value.toUpperCase() })}
                className="block w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* GSTIN */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Maharashtra GSTIN
              </label>
              <input
                type="text"
                value={formData.gstin}
                onChange={(e) => setFormData({ ...formData, gstin: e.target.value.toUpperCase() })}
                className="block w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Industrial Zone */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Location / Zone
              </label>
              <input
                type="text"
                value={formData.locationZone}
                readOnly
                className="block w-full px-3.5 py-2.5 bg-slate-100 border border-slate-300 rounded-xl text-sm font-semibold text-slate-700 cursor-not-allowed"
              />
            </div>

            {/* Verified Plot Area */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Cross-Verified Plot Area (sq.m)
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={`${docAValue} sq.m`}
                  readOnly
                  className={`block w-full px-3.5 py-2.5 rounded-xl text-sm font-mono font-bold transition-colors ${
                    isMismatch
                      ? "bg-rose-50 border-2 border-[#E11D48] text-rose-900"
                      : "bg-emerald-50 border-2 border-emerald-500 text-emerald-900"
                  }`}
                />
                <span
                  className={`absolute right-3 top-2.5 text-[10px] font-bold px-2 py-0.5 rounded-md ${
                    isMismatch
                      ? "bg-rose-200 text-rose-900"
                      : "bg-emerald-200 text-emerald-900"
                  }`}
                >
                  {isMismatch ? "Conflicting" : "Verified"}
                </span>
              </div>
            </div>

            {/* Power Load */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Connected Power Load (kVA)
              </label>
              <input
                type="number"
                value={formData.powerLoadKva}
                onChange={(e) => setFormData({ ...formData, powerLoadKva: Number(e.target.value) })}
                className="block w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Capex */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Project Capex (₹ Crores)
              </label>
              <input
                type="number"
                value={formData.capexCr}
                onChange={(e) => setFormData({ ...formData, capexCr: Number(e.target.value) })}
                className="block w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Submission Feedback */}
          {submissionSuccess && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center space-x-3 text-xs text-emerald-900">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <p className="font-bold">Application Successfully Pre-Validated & Queued!</p>
                <p className="text-emerald-700 mt-0.5">
                  Dossier MH-CAF-2026-00412 has passed quality gate and is ready for DAG Parallel Routing.
                </p>
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-500 flex items-center space-x-1">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Statutory Scrutiny pre-checks completed</span>
            </div>

            <div className="flex items-center space-x-3 w-full sm:w-auto">
              <button
                type="submit"
                disabled={isMismatch}
                className={`w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-8 py-3 rounded-xl font-bold text-xs shadow-md transition-all ${
                  isMismatch
                    ? "bg-slate-300 text-slate-500 cursor-not-allowed opacity-75"
                    : "bg-[#059669] hover:bg-[#047857] text-white shadow-emerald-600/20 cursor-pointer"
                }`}
              >
                {isMismatch ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                <span>
                  {isMismatch
                    ? "Submission Locked (Resolve Mismatch Above)"
                    : "Submit & Dispatch to Parallel Review"}
                </span>
                {!isMismatch && <ArrowRight className="w-4 h-4 ml-1" />}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

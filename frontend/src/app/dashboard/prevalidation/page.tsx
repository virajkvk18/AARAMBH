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
import { useNotificationStore } from "@/store/notificationStore";

interface CrossDocField {
  fieldName: string;
  label: string;
  unit: string;
  docAValue: string;
  docAName: string;
  docBValue: string;
  docBName: string;
}

import { compareFieldValues } from "@/lib/fieldComparison";

const BACKEND_API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";


export default function PreValidationPage() {
  const {
    extractedFields,
    uploadedDocuments,
    uploadedDocumentName,
    sector,
    locationZone,
    capexCr,
    powerLoadKva,
    applicationStatus,
    applicationRef,
    submitApplication,
  } = useEnterpriseStore();

  // Baseline Form Values (from store or initial default)
  const initialPlotA = extractedFields.plot_area_sqm?.value || "5000";
  const initialPlotANum = parseFloat(initialPlotA.replace(/[^0-9.]/g, "")) || 5000;

  // We set up a simulated cross-document discrepancy for plot_area_sqm:
  // Doc A: MIDC Land Allotment Deed (e.g. 5,000 sq.m)
  // Doc B: Architect Detailed Project Report (e.g. 4,800 sq.m - creating a 4% mismatch > 2% tolerance)
  const [docAName] = useState(uploadedDocuments[0]?.name || "MIDC_Lease_Allotment_Deed.pdf");
  const [docBName] = useState(uploadedDocuments[1]?.name || uploadedDocumentName || "Architect_Layout_DPR.pdf");

  const [docAValue, setDocAValue] = useState<string>(initialPlotANum.toString());
  const [docBValue, setDocBValue] = useState<string>("4800"); // 4800 creates real mismatch with 5000

  // Form Fields State for MPCB Consent to Establish
  const [formData, setFormData] = useState({
    entityName: extractedFields.entity_name?.value || "Maharashtra Solvents & Chemicals Pvt Ltd",
    pan: extractedFields.pan?.value || "",
    gstin: extractedFields.gstin?.value || "",
    aadhaar: extractedFields.aadhaar?.value || "",
    sector: sector || "Chemical Manufacturing",
    locationZone: locationZone || "Chakan MIDC (Pune)",
    powerLoadKva: powerLoadKva || 250,
    capexCr: capexCr || 35,
    resolvedPlotArea: "5000",
  });

  // Sync with store extracted fields if they change
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      pan: extractedFields.pan?.value !== undefined ? (extractedFields.pan?.value || "") : prev.pan,
      gstin: extractedFields.gstin?.value !== undefined ? (extractedFields.gstin?.value || "") : prev.gstin,
      aadhaar: extractedFields.aadhaar?.value !== undefined ? (extractedFields.aadhaar?.value || "") : prev.aadhaar,
    }));
  }, [extractedFields]);

  const [submissionSuccess, setSubmissionSuccess] = useState(applicationStatus === "submitted" || applicationStatus === "under_review");

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

  const handleSubmitApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isMismatch) return;
    const ref = applicationRef || `MH-CAF-2026-${Math.floor(10000 + Math.random() * 90000)}`;
    submitApplication(ref);
    setSubmissionSuccess(true);

    // Persist the pre-validation filing to backend (non-blocking)
    fetch(`${BACKEND_API_URL}/filings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        approval_id: ref,
        form: {
          entityName: formData.entityName,
          pan: formData.pan,
          gstin: formData.gstin,
          sector: formData.sector,
          locationZone: formData.locationZone,
          powerLoadKva: formData.powerLoadKva,
          capexCr: formData.capexCr,
          resolvedPlotArea: formData.resolvedPlotArea,
        },
        status: "submitted",
      }),
    }).catch(() => {/* non-blocking */});

    // Fire notification on successful pre-validation submission
    useNotificationStore.getState().addNotification({
      type: "prevalidation",
      title: "Pre-Validation Check Passed ✅",
      message: `Cross-document verification complete. MPCB Consent application (${ref}) submitted for regulatory review.`,
      severity: "success",
      target: "/dashboard/prevalidation",
    });
  };


  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-28">
      {/* Top Header */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#F0E5E0] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#FFF2DF] border border-[#FED17A] text-[#9B2A48] text-xs font-bold uppercase tracking-wider mb-2">
            <FileCheck2 className="w-3.5 h-3.5 text-[#FE7251]" />
            <span>Automated Scrutiny & Cross-Verification Gate</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#16060E] tracking-tight">
            Check My Application
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Automated cross-check engine verifying consistency across multi-document statutory filings before submission.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <span
            className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border ${
              isMismatch
                ? "bg-rose-50 text-[#9B2A48] border-rose-300"
                : "bg-[#FFF2DF] text-[#9B2A48] border-[#FED17A]"
            }`}
          >
            {isMismatch ? (
              <>
                <Lock className="w-3.5 h-3.5 text-[#FE7251]" />
                <span>Quality Gate Locked</span>
              </>
            ) : (
              <>
                <Unlock className="w-3.5 h-3.5 text-[#9B2A48]" />
                <span>Quality Gate Passed</span>
              </>
            )}
          </span>
        </div>
      </div>

      {/* 1. BLOCKING ALERT BANNER IF MISMATCH DETECTED */}
      {isMismatch ? (
        <div className="p-5 rounded-2xl bg-rose-50 border-2 border-rose-400 text-rose-950 shadow-sm animate-pulse flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-extrabold text-rose-900 tracking-tight">
                ⚠️ Discrepancy Detected Between Uploaded Statutory Filings
              </h3>
              <p className="text-xs text-rose-900 mt-1 leading-relaxed">
                <strong>Plot Area (sq.m)</strong> discrepancy found: <strong>{docAName}</strong> states{" "}
                <span className="font-mono font-bold bg-rose-200/60 px-1 rounded">{docAValue} sq.m</span> vs{" "}
                <strong>{docBName}</strong> stating{" "}
                <span className="font-mono font-bold bg-rose-200/60 px-1 rounded">{docBValue} sq.m</span>{" "}
                (Difference: <strong>{comparisonResult.diffPercent.toFixed(1)}%</strong> &gt; 2.0% tolerance).
              </p>
              <p className="text-[11px] font-bold text-rose-700 mt-1.5">
                Submission is locked until resolved to prevent statutory rejection by department officers.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => handleAutoAlign(docAValue)}
              className="px-3.5 py-2 rounded-xl bg-[#FE7251] hover:bg-[#E85E3E] text-white text-xs font-bold shadow-xs transition-colors cursor-pointer whitespace-nowrap"
            >
              Align to {docAValue} sq.m
            </button>
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-2xl bg-[#FFF2DF] border border-[#FED17A] text-[#16060E] flex items-center justify-between">
          <div className="flex items-center space-x-3 text-xs">
            <CheckCircle2 className="w-5 h-5 text-[#9B2A48] shrink-0" />
            <div>
              <p className="font-bold text-[#9B2A48]">All Cross-Document Consistency Checks Passed</p>
              <p className="text-[#886A75] text-[11px]">
                Plot area ({docAValue} sq.m) is synchronized across MIDC and DPR statutory dossiers.
              </p>
            </div>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#9B2A48] text-[#FFCA7C] uppercase">
            Ready to Submit
          </span>
        </div>
      )}

      {/* 2. REAL CROSS-DOCUMENT COMPARISON CARD */}
      <div className="bg-white rounded-2xl border border-[#F0E5E0] shadow-xs overflow-hidden">
        <div className="p-6 border-b border-[#F0E5E0] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-[#FFF2DF] text-[#9B2A48] border border-[#FED17A] flex items-center justify-center font-bold shrink-0">
              <Scale className="w-5 h-5 text-[#FE7251]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#16060E]">
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
              className="px-2.5 py-1 text-[11px] font-bold rounded-lg border border-[#FED17A] bg-[#FFF7F0] hover:bg-[#FFF2DF] text-[#9B2A48] transition-colors cursor-pointer"
            >
              Test Discrepancy (5000 vs 4800)
            </button>
            <button
              type="button"
              onClick={() => {
                setDocAValue("5000");
                setDocBValue("5000");
              }}
              className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-[#FE7251] hover:bg-[#E85E3E] text-white transition-colors cursor-pointer"
            >
              Test Match (5000 vs 5000)
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Document A Column */}
            <div
              className={`p-5 rounded-2xl border-2 transition-all ${
                isMismatch
                  ? "border-rose-400 bg-rose-50/40"
                  : "border-[#FED17A] bg-[#FFF9F5]"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-[#9B2A48]" />
                  <span className="text-xs font-bold text-[#16060E]">Source Dossier A</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FFF2DF] text-[#9B2A48] border border-[#FED17A]">
                  DigiLocker Verified
                </span>
              </div>
              <p className="text-xs font-mono font-bold text-[#16060E] truncate mb-4">
                {docAName}
              </p>

              <div>
                <label className="block text-xs font-bold text-[#16060E] uppercase tracking-wider mb-1.5">
                  Industrial Plot Area (sq.m)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={docAValue}
                    onChange={(e) => setDocAValue(e.target.value)}
                    className={`block w-full px-3.5 py-2.5 rounded-xl text-base font-black font-mono transition-colors focus:outline-hidden ${
                      isMismatch
                        ? "bg-white border-2 border-rose-400 text-rose-900 focus:ring-2 focus:ring-rose-400"
                        : "bg-white border-2 border-[#FED17A] text-[#9B2A48] focus:ring-2 focus:ring-[#FE7251]"
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
                  ? "border-rose-400 bg-rose-50/40"
                  : "border-[#FED17A] bg-[#FFF9F5]"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-[#FE7251]" />
                  <span className="text-xs font-bold text-[#16060E]">Source Dossier B</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FFF2DF] text-[#9B2A48] border border-[#FED17A]">
                  OCR Extracted
                </span>
              </div>
              <p className="text-xs font-mono font-bold text-[#16060E] truncate mb-4">
                {docBName}
              </p>

              <div>
                <label className="block text-xs font-bold text-[#16060E] uppercase tracking-wider mb-1.5">
                  Industrial Plot Area (sq.m)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={docBValue}
                    onChange={(e) => setDocBValue(e.target.value)}
                    className={`block w-full px-3.5 py-2.5 rounded-xl text-base font-black font-mono transition-colors focus:outline-hidden ${
                      isMismatch
                        ? "bg-white border-2 border-rose-400 text-rose-900 focus:ring-2 focus:ring-rose-400"
                        : "bg-white border-2 border-[#FED17A] text-[#9B2A48] focus:ring-2 focus:ring-[#FE7251]"
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
          <div className="p-4 bg-[#FFF9F5] border border-[#F0E5E0] rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
            <div className="flex items-center space-x-2 text-slate-700">
              <Info className="w-4 h-4 text-[#FE7251] shrink-0" />
              <span>
                <strong>Tolerance Rule:</strong> Difference &le; 2.0% allowed for survey margin; current difference is{" "}
                <strong className={isMismatch ? "text-rose-600" : "text-[#9B2A48]"}>
                  {comparisonResult.diffPercent.toFixed(2)}%
                </strong>.
              </span>
            </div>

            {isMismatch && (
              <button
                type="button"
                onClick={() => setDocBValue(docAValue)}
                className="text-xs font-bold text-[#9B2A48] hover:text-[#FE7251] underline cursor-pointer"
              >
                Resolve Mismatch (Sync B to A)
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 3. AUTO-FILLED APPLICATION FORM (MPCB Consent to Establish) */}
      <div className="bg-white rounded-2xl border border-[#F0E5E0] shadow-xs overflow-hidden">
        <div className="p-6 border-b border-[#F0E5E0] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FFF2DF] text-[#9B2A48] border border-[#FED17A] uppercase">
              Application Form Preview
            </span>
            <h2 className="text-base font-bold text-[#16060E] mt-1">
              MPCB Consent to Establish (CTE) Form • Pre-Populated
            </h2>
            <p className="text-xs text-slate-500">
              Fields populated automatically from Document Vault and verified DigiLocker certificates
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-400">Source:</span>
            <span className="text-xs font-mono font-bold text-[#9B2A48] bg-[#FFF2DF] border border-[#FED17A] px-2 py-1 rounded-md">
              Vault Synchronized
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmitApplication} className="p-6 sm:p-8 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Entity Name */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-[#16060E] uppercase tracking-wider mb-1">
                Enterprise Legal Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.entityName}
                  onChange={(e) => setFormData({ ...formData, entityName: e.target.value })}
                  className="block w-full px-3.5 py-2.5 bg-[#FFFDFC] border border-[#F0E5E0] rounded-xl text-sm font-semibold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#FE7251]"
                />
                <span className="absolute right-3 top-2.5 text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#FFF2DF] text-[#9B2A48] border border-[#FED17A]">
                  Vault Synced
                </span>
              </div>
            </div>

            {/* Sector */}
            <div>
              <label className="block text-xs font-bold text-[#16060E] uppercase tracking-wider mb-1">
                Industry Sector
              </label>
              <input
                type="text"
                value={formData.sector}
                readOnly
                className="block w-full px-3.5 py-2.5 bg-[#FFF9F5] border border-[#F0E5E0] rounded-xl text-sm font-semibold text-slate-700 cursor-not-allowed"
              />
            </div>

            {/* PAN */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-[#16060E] uppercase tracking-wider">
                  Enterprise PAN
                </label>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                    formData.pan ? "bg-[#FFF2DF] text-[#9B2A48] border border-[#FED17A]" : "bg-[#FFF9F5] text-slate-400 border border-[#F0E5E0]"
                  }`}
                >
                  {formData.pan ? "Vault Synced" : "Missing (null)"}
                </span>
              </div>
              <input
                type="text"
                value={formData.pan}
                placeholder="No PAN detected (null)"
                onChange={(e) => setFormData({ ...formData, pan: e.target.value.toUpperCase() })}
                className="block w-full px-3.5 py-2.5 bg-[#FFFDFC] border border-[#F0E5E0] rounded-xl text-sm font-mono font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#FE7251]"
              />
            </div>

            {/* GSTIN */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-[#16060E] uppercase tracking-wider">
                  Maharashtra GSTIN
                </label>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                    formData.gstin ? "bg-[#FFF2DF] text-[#9B2A48] border border-[#FED17A]" : "bg-[#FFF9F5] text-slate-400 border border-[#F0E5E0]"
                  }`}
                >
                  {formData.gstin ? "Vault Synced" : "Missing (null)"}
                </span>
              </div>
              <input
                type="text"
                value={formData.gstin}
                placeholder="No GSTIN detected (null)"
                onChange={(e) => setFormData({ ...formData, gstin: e.target.value.toUpperCase() })}
                className="block w-full px-3.5 py-2.5 bg-[#FFFDFC] border border-[#F0E5E0] rounded-xl text-sm font-mono font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#FE7251]"
              />
            </div>

            {/* Aadhaar (Signatory) */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-[#16060E] uppercase tracking-wider">
                  Signatory Aadhaar
                </label>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                    formData.aadhaar ? "bg-[#FFF2DF] text-[#9B2A48] border border-[#FED17A]" : "bg-[#FFF9F5] text-slate-400 border border-[#F0E5E0]"
                  }`}
                >
                  {formData.aadhaar ? "Vault Synced" : "Missing (null)"}
                </span>
              </div>
              <input
                type="text"
                value={formData.aadhaar}
                placeholder="No Aadhaar detected (null)"
                onChange={(e) => setFormData({ ...formData, aadhaar: e.target.value })}
                className="block w-full px-3.5 py-2.5 bg-[#FFFDFC] border border-[#F0E5E0] rounded-xl text-sm font-mono font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#FE7251]"
              />
            </div>

            {/* Industrial Zone */}
            <div>
              <label className="block text-xs font-bold text-[#16060E] uppercase tracking-wider mb-1">
                Location / Zone
              </label>
              <input
                type="text"
                value={formData.locationZone}
                readOnly
                className="block w-full px-3.5 py-2.5 bg-[#FFF9F5] border border-[#F0E5E0] rounded-xl text-sm font-semibold text-slate-700 cursor-not-allowed"
              />
            </div>

            {/* Verified Plot Area */}
            <div>
              <label className="block text-xs font-bold text-[#16060E] uppercase tracking-wider mb-1">
                Cross-Verified Plot Area (sq.m)
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={`${docAValue} sq.m`}
                  readOnly
                  className={`block w-full px-3.5 py-2.5 rounded-xl text-sm font-mono font-bold transition-colors ${
                    isMismatch
                      ? "bg-rose-50 border-2 border-rose-400 text-rose-900"
                      : "bg-[#FFF2DF] border-2 border-[#FED17A] text-[#9B2A48]"
                  }`}
                />
                <span
                  className={`absolute right-3 top-2.5 text-[10px] font-bold px-2 py-0.5 rounded-md ${
                    isMismatch
                      ? "bg-rose-200 text-rose-900"
                      : "bg-[#FFF2DF] text-[#9B2A48] border border-[#FED17A]"
                  }`}
                >
                  {isMismatch ? "Conflicting" : "Verified"}
                </span>
              </div>
            </div>

            {/* Power Load */}
            <div>
              <label className="block text-xs font-bold text-[#16060E] uppercase tracking-wider mb-1">
                Connected Power Load (kVA)
              </label>
              <input
                type="number"
                value={formData.powerLoadKva}
                onChange={(e) => setFormData({ ...formData, powerLoadKva: Number(e.target.value) })}
                className="block w-full px-3.5 py-2.5 bg-[#FFFDFC] border border-[#F0E5E0] rounded-xl text-sm font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#FE7251]"
              />
            </div>

            {/* Capex */}
            <div>
              <label className="block text-xs font-bold text-[#16060E] uppercase tracking-wider mb-1">
                Project Capex (₹ Crores)
              </label>
              <input
                type="number"
                value={formData.capexCr}
                onChange={(e) => setFormData({ ...formData, capexCr: Number(e.target.value) })}
                className="block w-full px-3.5 py-2.5 bg-[#FFFDFC] border border-[#F0E5E0] rounded-xl text-sm font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#FE7251]"
              />
            </div>
          </div>

          {/* Submission Feedback */}
          {submissionSuccess && (
            <div className="p-5 rounded-2xl bg-[#FFF2DF] border-2 border-[#FED17A] text-[#16060E] space-y-3">
              <div className="flex items-start space-x-3">
                <CheckCircle2 className="w-6 h-6 text-[#9B2A48] shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 justify-between">
                    <p className="font-extrabold text-sm text-[#9B2A48]">
                      Application Successfully Pre-Validated & Dispatched!
                    </p>
                    <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-md bg-[#9B2A48] text-[#FFCA7C]">
                      Ref: {applicationRef || "MH-CAF-2026-00412"}
                    </span>
                  </div>
                  <p className="text-xs text-[#886A75] mt-1">
                    Your Common Application Form has passed statutory gate scrutiny and is now actively flowing through the Maharashtra Parallel DAG Clearance Engine.
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-[#FED17A]/60 flex flex-wrap gap-3 items-center">
                <Link
                  href="/dashboard/dag"
                  className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-[#FE7251] hover:bg-[#E85E3E] text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                >
                  <span>Track Parallel DAG Workflow</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <Link
                  href="/dashboard/sla"
                  className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-white border border-[#FED17A] hover:bg-[#FFF7F0] text-[#9B2A48] text-xs font-bold shadow-2xs transition-colors cursor-pointer"
                >
                  <span>Monitor SLA Clocks & Deemed Approvals</span>
                </Link>
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="pt-4 border-t border-[#F0E5E0] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-[#886A75] flex items-center space-x-1">
              <ShieldCheck className="w-4 h-4 text-[#9B2A48]" />
              <span>Statutory Scrutiny pre-checks completed</span>
            </div>

            <div className="flex items-center space-x-3 w-full sm:w-auto">
              <button
                type="submit"
                disabled={isMismatch}
                className={`w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-8 py-3 rounded-xl font-bold text-xs shadow-xs transition-all ${
                  isMismatch
                    ? "bg-slate-300 text-slate-500 cursor-not-allowed opacity-75"
                    : "bg-[#FE7251] hover:bg-[#E85E3E] text-white cursor-pointer"
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

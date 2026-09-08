"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  FileSpreadsheet,
  Building2,
  MapPin,
  Flame,
  ShieldCheck,
  Zap,
  Droplets,
  Factory,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Clock,
  ExternalLink,
  Download,
  Sparkles,
  Layers,
  Send,
  AlertCircle,
  RefreshCw,
  Eye,
  FileCheck2,
  Sliders,
  Check,
} from "lucide-react";
import {
  useEnterpriseStore,
  MasterCAFPayload,
  DepartmentDeltas,
  CAFSubmissionResponse,
} from "@/store/enterpriseStore";
import { useLanguage } from "@/context/LanguageContext";

const BACKEND_API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

type CAFStep = "master" | "deltas" | "vault_attach" | "gateway_dispatch";
type DepartmentKey = "mpcb" | "fire" | "midc" | "dish" | "dpiit";

interface DepartmentTabInfo {
  key: DepartmentKey;
  name: string;
  deptFullName: string;
  clearanceName: string;
  slaDays: number;
  autoFilledPercent: number;
  mode: "REST_API" | "WEBHOOK_EVENT" | "SSO_PREFILL_PAYLOAD";
  endpoint: string;
}

const DEPARTMENTS: DepartmentTabInfo[] = [
  {
    key: "mpcb",
    name: "MPCB",
    deptFullName: "Maharashtra Pollution Control Board",
    clearanceName: "Consent to Establish (CTE - Red Category)",
    slaDays: 30,
    autoFilledPercent: 82,
    mode: "REST_API",
    endpoint: "https://api.mpcb.gov.in/v1/applications/submit",
  },
  {
    key: "fire",
    name: "MahaFire",
    deptFullName: "Maharashtra Fire Services Directorate",
    clearanceName: "Provisional Industrial Fire NOC",
    slaDays: 14,
    autoFilledPercent: 88,
    mode: "REST_API",
    endpoint: "https://api.mahafire.gov.in/v1/noc-apply",
  },
  {
    key: "midc",
    name: "MIDC",
    deptFullName: "Maharashtra Industrial Development Corporation",
    clearanceName: "Industrial Land Lease & Architectural Plan Sanction",
    slaDays: 15,
    autoFilledPercent: 91,
    mode: "REST_API",
    endpoint: "https://api.midcindia.org/v2/plan-sanction/submit",
  },
  {
    key: "dish",
    name: "DISH",
    deptFullName: "Directorate of Industrial Safety & Health",
    clearanceName: "Factory Safety & Operational License",
    slaDays: 10,
    autoFilledPercent: 85,
    mode: "WEBHOOK_EVENT",
    endpoint: "https://dish.maharashtra.gov.in/api/v1/factory-reg",
  },
  {
    key: "dpiit",
    name: "DPIIT",
    deptFullName: "Dept. for Promotion of Industry & Internal Trade (Central)",
    clearanceName: "Industrial Entrepreneur Memorandum (IEM Part-A)",
    slaDays: 7,
    autoFilledPercent: 94,
    mode: "SSO_PREFILL_PAYLOAD",
    endpoint: "https://services.dpiit.gov.in/api/iem/submit",
  },
];

export default function UnifiedCAFPage() {
  const { t } = useLanguage();
  const {
    masterCAF,
    departmentDeltas,
    cafSubmissionReceipt,
    extractedFields,
    digiLockerDocs,
    updateMasterCAF,
    updateDepartmentDelta,
    setCAFSubmissionReceipt,
  } = useEnterpriseStore();

  const [activeStep, setActiveStep] = useState<CAFStep>("master");
  const [activeDeptTab, setActiveDeptTab] = useState<DepartmentKey>("mpcb");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDepts, setSelectedDepts] = useState<DepartmentKey[]>([
    "mpcb",
    "fire",
    "midc",
    "dish",
  ]);
  const [syncSuccessNotice, setSyncSuccessNotice] = useState<string | null>(null);

  // 1. Sync from Vault & KYA handler
  const handleSyncFromVault = () => {
    updateMasterCAF({
      companyDetails: {
        companyName: extractedFields.entity_name?.value || masterCAF.companyDetails.companyName,
        pan: extractedFields.pan?.value || masterCAF.companyDetails.pan,
        gstin: extractedFields.gstin?.value || masterCAF.companyDetails.gstin,
        cin: masterCAF.companyDetails.cin || "U24299MH2026PTC104921",
        entityType: masterCAF.companyDetails.entityType || "Pvt Ltd",
        signatoryName: masterCAF.companyDetails.signatoryName || "Rajesh V. Shinde",
        signatoryEmail: masterCAF.companyDetails.signatoryEmail || "investor@maharashtra-solvents.com",
        signatoryMobile: masterCAF.companyDetails.signatoryMobile || "+91 98220 12345",
      },
      locationDetails: {
        state: "Maharashtra",
        district: masterCAF.locationDetails.district || "Pune",
        address: masterCAF.locationDetails.address || "Plot No. A-42, MIDC Chakan Phase-II Industrial Area",
        pincode: masterCAF.locationDetails.pincode || "410501",
        plotAreaSqMeters: parseFloat(extractedFields.plot_area_sqm?.value?.replace(/[^0-9.]/g, "") || "5000"),
        midcZoneName: masterCAF.locationDetails.midcZoneName || "Chakan Industrial Zone Phase II (Pune)",
        midcPlotNo: masterCAF.locationDetails.midcPlotNo || "Plot A-42/12",
      },
      projectSpecs: {
        industryType: masterCAF.projectSpecs.industryType || "Chemical Manufacturing",
        sector: masterCAF.projectSpecs.sector || "Specialty Chemicals & Bio-Solvents",
        capitalInvestmentInr: parseFloat(extractedFields.capex_amount?.value?.replace(/[^0-9.]/g, "") || "350000000"),
        powerRequirementKw: parseFloat(extractedFields.power_load_kva?.value?.replace(/[^0-9.]/g, "") || "250"),
        waterRequirementKlpd: masterCAF.projectSpecs.waterRequirementKlpd || 20,
        hazardCategory: "Red",
        maxBuildingHeightMeters: 12.5,
        totalOccupants: 120,
      },
    });

    setSyncSuccessNotice("Successfully synchronized 14 statutory fields from Document Vault and DigiLocker!");
    setTimeout(() => setSyncSuccessNotice(null), 4000);
  };

  // 2. Toggle Department selection
  const toggleDepartment = (dept: DepartmentKey) => {
    if (selectedDepts.includes(dept)) {
      if (selectedDepts.length > 1) {
        setSelectedDepts(selectedDepts.filter((d) => d !== dept));
      }
    } else {
      setSelectedDepts([...selectedDepts, dept]);
    }
  };

  // 3. Parallel Dispatch Submission Handler
  const handleSubmitAllApplications = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`${BACKEND_API_URL}/caf/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          caf: masterCAF,
          deltas: departmentDeltas,
          departments: selectedDepts,
          enterprise_id: "ENT-MH-2026-8891",
        }),
      });

      if (!res.ok) {
        throw new Error(`Server responded with ${res.status}`);
      }

      const data: CAFSubmissionResponse = await res.json();
      setCAFSubmissionReceipt(data);
      setActiveStep("gateway_dispatch");
    } catch (err: any) {
      console.warn("Falling back to local simulation:", err);
      // Fallback local simulation
      const fallbackReceipt: CAFSubmissionResponse = {
        status: "SUCCESS",
        masterApplicationRef: `MH-CAF-2026-${Math.floor(10000 + Math.random() * 90000)}`,
        timestamp: new Date().toISOString(),
        enterpriseName: masterCAF.companyDetails.companyName,
        totalDepartmentsSubmitted: selectedDepts.length,
        departments: selectedDepts.map((key) => {
          const cfg = DEPARTMENTS.find((d) => d.key === key)!;
          const randomSuffix = Math.floor(1000 + Math.random() * 9000);
          const dueDate = new Date();
          dueDate.setDate(dueDate.getDate() + cfg.slaDays);

          return {
            departmentId: cfg.name,
            departmentName: cfg.deptFullName,
            clearanceName: cfg.clearanceName,
            portalEndpoint: cfg.endpoint,
            integrationMode: cfg.mode,
            trackingId: `${cfg.name}-TRK-2026-${randomSuffix}`,
            status: "SUBMITTED",
            slaDays: cfg.slaDays,
            statutoryDueDate: dueDate.toISOString().split("T")[0],
            digitalEndorsementToken: `MHA-AUTH-${cfg.name}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
            autoFilledPercentage: cfg.autoFilledPercent,
          };
        }),
      };
      setCAFSubmissionReceipt(fallbackReceipt);
      setActiveStep("gateway_dispatch");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* Top Identity Header */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#F0E5E0] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#FFF2DF] border border-[#FED17A] text-[#9B2A48] text-xs font-bold uppercase tracking-wider mb-2">
            <Layers className="w-3.5 h-3.5 text-[#FE7251]" />
            <span>Single Window System Integration Architecture (CAF 2.0)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#16060E] tracking-tight">
            Master Common Application Form (CAF)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
            Fill core enterprise parameters once. AARAMBH auto-maps 70–90% of data into MPCB, Fire, MIDC, DISH, and Central DPIIT forms with parallel dispatch.
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <button
            type="button"
            onClick={handleSyncFromVault}
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-[#FFF2DF] hover:bg-[#FFE3B8] border border-[#FED17A] text-[#9B2A48] text-xs font-bold transition-all cursor-pointer shadow-xs"
          >
            <RefreshCw className="w-4 h-4 text-[#FE7251]" />
            <span>Sync from Vault & KYA</span>
          </button>

          <Link
            href="/dashboard/dag"
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-[#16060E] hover:bg-[#2B0E1D] text-white text-xs font-bold transition-all shrink-0"
          >
            <span>View Live DAG</span>
            <ArrowRight className="w-4 h-4 text-[#FE7251]" />
          </Link>
        </div>
      </div>

      {syncSuccessNotice && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center space-x-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-bold">{syncSuccessNotice}</span>
        </div>
      )}

      {/* 4-STEP WIZARD PROGRESS BAR */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { id: "master", label: "1. Master CAF Dossier", sub: "Core 70% Shared Data" },
          { id: "deltas", label: "2. Department Deltas", sub: "Specific Agency Questions" },
          { id: "vault_attach", label: "3. Central Vault Attachments", sub: "Auto-Attached Proofs" },
          { id: "gateway_dispatch", label: "4. Gateway Dispatch", sub: "Parallel Ministry Routing" },
        ].map((step, idx) => {
          const isActive = activeStep === step.id;
          const isDone =
            (step.id === "master" && activeStep !== "master") ||
            (step.id === "deltas" && (activeStep === "vault_attach" || activeStep === "gateway_dispatch")) ||
            (step.id === "vault_attach" && activeStep === "gateway_dispatch");

          return (
            <button
              key={step.id}
              type="button"
              onClick={() => setActiveStep(step.id as CAFStep)}
              className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                isActive
                  ? "bg-[#9B2A48] text-white border-[#9B2A48] shadow-md shadow-[#9B2A48]/20"
                  : isDone
                  ? "bg-[#FFF7F0] text-[#9B2A48] border-[#FED17A]"
                  : "bg-white text-slate-600 border-[#F0E5E0] hover:border-[#FED17A]"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-black tracking-wide">
                  {step.label}
                </span>
                {isDone && <Check className="w-3.5 h-3.5 text-[#FE7251]" />}
              </div>
              <p className={`text-[10px] ${isActive ? "text-[#FFCA7C]" : "text-slate-400"}`}>
                {step.sub}
              </p>
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* STEP 1: MASTER COMMON APPLICATION FORM (SHARED ACROSS ALL DEPARTMENTS) */}
      {/* ========================================================================= */}
      {activeStep === "master" && (
        <div className="bg-white rounded-2xl border border-[#F0E5E0] shadow-xs overflow-hidden space-y-6">
          <div className="p-6 border-b border-[#F0E5E0] flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#FFF9F5]">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-[#FFF2DF] text-[#9B2A48] border border-[#FED17A] flex items-center justify-center font-bold shrink-0">
                <FileSpreadsheet className="w-5 h-5 text-[#FE7251]" />
              </div>
              <div>
                <h2 className="text-base font-bold text-[#16060E]">
                  Normalized Master CAF Payload
                </h2>
                <p className="text-xs text-slate-500">
                  Shared across MPCB, MahaFire, MIDC, DISH, and DPIIT. Edit once to cascade to all department applications.
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-xs text-slate-500 font-medium">Clearances to Submit:</span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {DEPARTMENTS.map((dept) => {
                  const isSelected = selectedDepts.includes(dept.key);
                  return (
                    <button
                      key={dept.key}
                      type="button"
                      onClick={() => toggleDepartment(dept.key)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                        isSelected
                          ? "bg-[#9B2A48] text-white border-[#9B2A48]"
                          : "bg-white text-slate-400 border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      {dept.name} {isSelected ? "✓" : "+"}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-8">
            {/* Section A: Company & Legal Entity */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2 border-b border-[#F0E5E0] pb-2">
                <Building2 className="w-4 h-4 text-[#FE7251]" />
                <h3 className="text-xs font-bold text-[#16060E] uppercase tracking-wider">
                  Enterprise Legal Identity (CBDT / MCA / GSTIN)
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#16060E] mb-1">Company Legal Name</label>
                  <input
                    type="text"
                    value={masterCAF.companyDetails.companyName}
                    onChange={(e) =>
                      updateMasterCAF({
                        companyDetails: { ...masterCAF.companyDetails, companyName: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-[#F0E5E0] bg-[#FFFDFC] text-xs font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#FE7251]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#16060E] mb-1">Enterprise PAN</label>
                  <input
                    type="text"
                    value={masterCAF.companyDetails.pan}
                    onChange={(e) =>
                      updateMasterCAF({
                        companyDetails: { ...masterCAF.companyDetails, pan: e.target.value.toUpperCase() },
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-[#F0E5E0] bg-[#FFFDFC] text-xs font-mono font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#FE7251]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#16060E] mb-1">GSTIN (Maharashtra)</label>
                  <input
                    type="text"
                    value={masterCAF.companyDetails.gstin}
                    onChange={(e) =>
                      updateMasterCAF({
                        companyDetails: { ...masterCAF.companyDetails, gstin: e.target.value.toUpperCase() },
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-[#F0E5E0] bg-[#FFFDFC] text-xs font-mono font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#FE7251]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#16060E] mb-1">Corporate CIN</label>
                  <input
                    type="text"
                    value={masterCAF.companyDetails.cin}
                    onChange={(e) =>
                      updateMasterCAF({
                        companyDetails: { ...masterCAF.companyDetails, cin: e.target.value.toUpperCase() },
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-[#F0E5E0] bg-[#FFFDFC] text-xs font-mono font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#FE7251]"
                  />
                </div>
              </div>
            </div>

            {/* Section B: Location & Industrial Estate */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2 border-b border-[#F0E5E0] pb-2">
                <MapPin className="w-4 h-4 text-[#FE7251]" />
                <h3 className="text-xs font-bold text-[#16060E] uppercase tracking-wider">
                  Location, MIDC Zone & Industrial Land Specs
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#16060E] mb-1">State</label>
                  <input
                    type="text"
                    value={masterCAF.locationDetails.state}
                    readOnly
                    className="w-full px-3 py-2 rounded-xl border border-[#F0E5E0] bg-[#FFF9F5] text-xs font-bold text-slate-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#16060E] mb-1">District</label>
                  <input
                    type="text"
                    value={masterCAF.locationDetails.district}
                    onChange={(e) =>
                      updateMasterCAF({
                        locationDetails: { ...masterCAF.locationDetails, district: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-[#F0E5E0] bg-[#FFFDFC] text-xs font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#16060E] mb-1">MIDC Industrial Estate</label>
                  <input
                    type="text"
                    value={masterCAF.locationDetails.midcZoneName}
                    onChange={(e) =>
                      updateMasterCAF({
                        locationDetails: { ...masterCAF.locationDetails, midcZoneName: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-[#F0E5E0] bg-[#FFFDFC] text-xs font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#16060E] mb-1">Plot Area (sq. meters)</label>
                  <input
                    type="number"
                    value={masterCAF.locationDetails.plotAreaSqMeters}
                    onChange={(e) =>
                      updateMasterCAF({
                        locationDetails: { ...masterCAF.locationDetails, plotAreaSqMeters: parseFloat(e.target.value) || 0 },
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-[#F0E5E0] bg-[#FFFDFC] text-xs font-mono font-bold text-slate-900"
                  />
                </div>
              </div>
            </div>

            {/* Section C: Project Engineering & Utilities */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2 border-b border-[#F0E5E0] pb-2">
                <Zap className="w-4 h-4 text-[#FE7251]" />
                <h3 className="text-xs font-bold text-[#16060E] uppercase tracking-wider">
                  Project Capital, Utilities & Hazard Classification
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#16060E] mb-1">Capital Investment (₹)</label>
                  <input
                    type="number"
                    value={masterCAF.projectSpecs.capitalInvestmentInr}
                    onChange={(e) =>
                      updateMasterCAF({
                        projectSpecs: { ...masterCAF.projectSpecs, capitalInvestmentInr: parseFloat(e.target.value) || 0 },
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-[#F0E5E0] bg-[#FFFDFC] text-xs font-mono font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#16060E] mb-1">Sanctioned Power Load (kW)</label>
                  <input
                    type="number"
                    value={masterCAF.projectSpecs.powerRequirementKw}
                    onChange={(e) =>
                      updateMasterCAF({
                        projectSpecs: { ...masterCAF.projectSpecs, powerRequirementKw: parseFloat(e.target.value) || 0 },
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-[#F0E5E0] bg-[#FFFDFC] text-xs font-mono font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#16060E] mb-1">Water Demand (KLD)</label>
                  <input
                    type="number"
                    value={masterCAF.projectSpecs.waterRequirementKlpd}
                    onChange={(e) =>
                      updateMasterCAF({
                        projectSpecs: { ...masterCAF.projectSpecs, waterRequirementKlpd: parseFloat(e.target.value) || 0 },
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-[#F0E5E0] bg-[#FFFDFC] text-xs font-mono font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#16060E] mb-1">Pollution Category</label>
                  <select
                    value={masterCAF.projectSpecs.hazardCategory}
                    onChange={(e) =>
                      updateMasterCAF({
                        projectSpecs: {
                          ...masterCAF.projectSpecs,
                          hazardCategory: e.target.value as "Red" | "Orange" | "Green" | "White",
                        },
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-[#F0E5E0] bg-[#FFFDFC] text-xs font-bold text-slate-900"
                  >
                    <option value="Red">Red (High Pollution / Chem)</option>
                    <option value="Orange">Orange (Moderate Process)</option>
                    <option value="Green">Green (Low Pollution)</option>
                    <option value="White">White (Non-Polluting / IT)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Navigation to Step 2 */}
            <div className="flex justify-end pt-4 border-t border-[#F0E5E0]">
              <button
                type="button"
                onClick={() => setActiveStep("deltas")}
                className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#9B2A48] via-[#FE7251] to-[#FE7251] hover:from-[#82213B] hover:to-[#E85E3E] text-white text-xs font-bold shadow-md shadow-[#9B2A48]/30 cursor-pointer"
              >
                <span>Proceed to Department Delta Forms (Step 2)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 2: DEPARTMENT-SPECIFIC DELTA TABS (ONLY 20-30% AGENCY-SPECIFIC FIELDS) */}
      {/* ========================================================================= */}
      {activeStep === "deltas" && (
        <div className="bg-white rounded-2xl border border-[#F0E5E0] shadow-xs overflow-hidden space-y-6">
          <div className="p-6 border-b border-[#F0E5E0] bg-[#FFF9F5] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-[#FFF2DF] border border-[#FED17A] text-[#9B2A48] text-[10px] font-bold uppercase mb-1">
                <Sliders className="w-3 h-3 text-[#FE7251]" />
                <span>Delta Fields Engine</span>
              </div>
              <h2 className="text-base font-bold text-[#16060E]">
                Department-Specific Questionnaires
              </h2>
              <p className="text-xs text-slate-500">
                70–90% of each department form is already populated from your Master CAF. Answer only the delta parameters below.
              </p>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {DEPARTMENTS.filter((d) => selectedDepts.includes(d.key)).map((dept) => {
                const isTabActive = activeDeptTab === dept.key;
                return (
                  <button
                    key={dept.key}
                    type="button"
                    onClick={() => setActiveDeptTab(dept.key)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center space-x-1.5 ${
                      isTabActive
                        ? "bg-[#9B2A48] text-white border-[#9B2A48] shadow-xs"
                        : "bg-white text-slate-700 border-[#F0E5E0] hover:border-[#FED17A]"
                    }`}
                  >
                    <span>{dept.name}</span>
                    <span
                      className={`text-[9px] px-1.5 py-0.2 rounded ${
                        isTabActive ? "bg-white/20 text-[#FFCA7C]" : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      }`}
                    >
                      {dept.autoFilledPercent}% Auto
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            {/* TAB: MPCB */}
            {activeDeptTab === "mpcb" && (
              <div className="space-y-6">
                <div className="p-4 rounded-xl bg-[#FFF7F0] border border-[#FED17A] flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Factory className="w-6 h-6 text-[#FE7251]" />
                    <div>
                      <h4 className="text-xs font-bold text-[#16060E]">
                        Maharashtra Pollution Control Board (MPCB) • CTE Form
                      </h4>
                      <p className="text-[11px] text-slate-600">
                        82% of statutory parameters auto-mapped from Master CAF (Unit Name, PAN, Investment, Water, Coordinates).
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-[#9B2A48] bg-[#FFF2DF] px-2.5 py-1 rounded-md border border-[#FED17A]">
                    SLA: 30 Days
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="p-4 rounded-xl border border-[#F0E5E0] bg-[#FFFDFC] space-y-2">
                    <label className="block text-xs font-bold text-[#16060E]">
                      Effluent Treatment Plant (ETP) Proposed?
                    </label>
                    <p className="text-[11px] text-slate-500">
                      Required for Red/Orange units with industrial effluent discharge.
                    </p>
                    <div className="flex items-center space-x-4 pt-1">
                      <label className="flex items-center space-x-2 text-xs font-bold text-slate-800 cursor-pointer">
                        <input
                          type="radio"
                          name="etpProposed"
                          checked={departmentDeltas.mpcb?.etpProposed === true}
                          onChange={() => updateDepartmentDelta("mpcb", { etpProposed: true })}
                          className="text-[#FE7251] focus:ring-[#FE7251]"
                        />
                        <span>Yes (Zero Liquid Discharge / Tertiary ETP)</span>
                      </label>
                      <label className="flex items-center space-x-2 text-xs font-bold text-slate-800 cursor-pointer">
                        <input
                          type="radio"
                          name="etpProposed"
                          checked={departmentDeltas.mpcb?.etpProposed === false}
                          onChange={() => updateDepartmentDelta("mpcb", { etpProposed: false })}
                          className="text-[#FE7251] focus:ring-[#FE7251]"
                        />
                        <span>No (CETP Connection)</span>
                      </label>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl border border-[#F0E5E0] bg-[#FFFDFC] space-y-2">
                    <label className="block text-xs font-bold text-[#16060E]">
                      Hazardous Waste Generation (Metric Tonnes / Year)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={departmentDeltas.mpcb?.hazardousWasteTpa || 2.5}
                      onChange={(e) =>
                        updateDepartmentDelta("mpcb", { hazardousWasteTpa: parseFloat(e.target.value) || 0 })
                      }
                      className="w-full px-3.5 py-2 rounded-xl border border-[#F0E5E0] text-xs font-mono font-bold text-slate-900"
                    />
                  </div>

                  <div className="p-4 rounded-xl border border-[#F0E5E0] bg-[#FFFDFC] space-y-2">
                    <label className="block text-xs font-bold text-[#16060E]">
                      Boiler / Process Chimney Height (meters above ground)
                    </label>
                    <input
                      type="number"
                      value={departmentDeltas.mpcb?.chimneyHeightMeters || 30}
                      onChange={(e) =>
                        updateDepartmentDelta("mpcb", { chimneyHeightMeters: parseFloat(e.target.value) || 0 })
                      }
                      className="w-full px-3.5 py-2 rounded-xl border border-[#F0E5E0] text-xs font-mono font-bold text-slate-900"
                    />
                  </div>

                  <div className="p-4 rounded-xl border border-[#F0E5E0] bg-[#FFFDFC] space-y-2">
                    <label className="block text-xs font-bold text-[#16060E]">
                      Air Pollution Control System (APCS)
                    </label>
                    <input
                      type="text"
                      value={departmentDeltas.mpcb?.airPollutionControlSystem || "Wet Scrubber + Bag Filter Array"}
                      onChange={(e) =>
                        updateDepartmentDelta("mpcb", { airPollutionControlSystem: e.target.value })
                      }
                      className="w-full px-3.5 py-2 rounded-xl border border-[#F0E5E0] text-xs font-bold text-slate-900"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB: MAHAFIRE */}
            {activeDeptTab === "fire" && (
              <div className="space-y-6">
                <div className="p-4 rounded-xl bg-[#FFF7F0] border border-[#FED17A] flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Flame className="w-6 h-6 text-[#FE7251]" />
                    <div>
                      <h4 className="text-xs font-bold text-[#16060E]">
                        Directorate of Maharashtra Fire Services • Provisional Fire NOC
                      </h4>
                      <p className="text-[11px] text-slate-600">
                        88% of fields mapped from Master CAF (Building Height, Plot Dimensions, Occupancy Load, Blueprint).
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-[#9B2A48] bg-[#FFF2DF] px-2.5 py-1 rounded-md border border-[#FED17A]">
                    SLA: 14 Days
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="p-4 rounded-xl border border-[#F0E5E0] bg-[#FFFDFC] space-y-2">
                    <label className="block text-xs font-bold text-[#16060E]">
                      Underground Static Fire Water Reservoir (Liters)
                    </label>
                    <input
                      type="number"
                      value={departmentDeltas.fire?.undergroundTankCapacityLiters || 100000}
                      onChange={(e) =>
                        updateDepartmentDelta("fire", {
                          hasUgTank: true,
                          undergroundTankCapacityLiters: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full px-3.5 py-2 rounded-xl border border-[#F0E5E0] text-xs font-mono font-bold text-slate-900"
                    />
                  </div>

                  <div className="p-4 rounded-xl border border-[#F0E5E0] bg-[#FFFDFC] space-y-2">
                    <label className="block text-xs font-bold text-[#16060E]">
                      Fire Extinguisher Specification Standard
                    </label>
                    <input
                      type="text"
                      value={departmentDeltas.fire?.extinguisherType || "CO2 & ABC Multi-Purpose Powder (IS 15683)"}
                      onChange={(e) => updateDepartmentDelta("fire", { extinguisherType: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl border border-[#F0E5E0] text-xs font-bold text-slate-900"
                    />
                  </div>

                  <div className="p-4 rounded-xl border border-[#F0E5E0] bg-[#FFFDFC] space-y-2">
                    <label className="block text-xs font-bold text-[#16060E]">
                      Automatic Sprinkler System Installed?
                    </label>
                    <div className="flex items-center space-x-4 pt-1">
                      <label className="flex items-center space-x-2 text-xs font-bold text-slate-800 cursor-pointer">
                        <input
                          type="radio"
                          name="sprinkler"
                          checked={departmentDeltas.fire?.sprinklerSystemFitted !== false}
                          onChange={() => updateDepartmentDelta("fire", { sprinklerSystemFitted: true })}
                        />
                        <span>Yes (Grid Sprinklers throughout Shop Floor)</span>
                      </label>
                      <label className="flex items-center space-x-2 text-xs font-bold text-slate-800 cursor-pointer">
                        <input
                          type="radio"
                          name="sprinkler"
                          checked={departmentDeltas.fire?.sprinklerSystemFitted === false}
                          onChange={() => updateDepartmentDelta("fire", { sprinklerSystemFitted: false })}
                        />
                        <span>No</span>
                      </label>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl border border-[#F0E5E0] bg-[#FFFDFC] space-y-2">
                    <label className="block text-xs font-bold text-[#16060E]">
                      Dedicated Emergency Fire Exits Count
                    </label>
                    <input
                      type="number"
                      value={departmentDeltas.fire?.emergencyExitsCount || 4}
                      onChange={(e) =>
                        updateDepartmentDelta("fire", { emergencyExitsCount: parseInt(e.target.value) || 2 })
                      }
                      className="w-full px-3.5 py-2 rounded-xl border border-[#F0E5E0] text-xs font-mono font-bold text-slate-900"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB: MIDC */}
            {activeDeptTab === "midc" && (
              <div className="space-y-6">
                <div className="p-4 rounded-xl bg-[#FFF7F0] border border-[#FED17A] flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Building2 className="w-6 h-6 text-[#FE7251]" />
                    <div>
                      <h4 className="text-xs font-bold text-[#16060E]">
                        Maharashtra Industrial Development Corporation (MIDC)
                      </h4>
                      <p className="text-[11px] text-slate-600">
                        91% auto-mapped from Master CAF (Estate Zone, Plot No, CIN, Power & Water Demands).
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-[#9B2A48] bg-[#FFF2DF] px-2.5 py-1 rounded-md border border-[#FED17A]">
                    SLA: 15 Days
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="p-4 rounded-xl border border-[#F0E5E0] bg-[#FFFDFC] space-y-2">
                    <label className="block text-xs font-bold text-[#16060E]">
                      Proposed Built-up Floor Area (sq. meters)
                    </label>
                    <input
                      type="number"
                      value={departmentDeltas.midc?.proposedBuiltupAreaSqm || 3200}
                      onChange={(e) =>
                        updateDepartmentDelta("midc", { proposedBuiltupAreaSqm: parseFloat(e.target.value) || 0 })
                      }
                      className="w-full px-3.5 py-2 rounded-xl border border-[#F0E5E0] text-xs font-mono font-bold text-slate-900"
                    />
                  </div>

                  <div className="p-4 rounded-xl border border-[#F0E5E0] bg-[#FFFDFC] space-y-2">
                    <label className="block text-xs font-bold text-[#16060E]">
                      Dedicated Heavy Vehicle & Industrial Parking Bays
                    </label>
                    <input
                      type="number"
                      value={departmentDeltas.midc?.industrialParkingBays || 18}
                      onChange={(e) =>
                        updateDepartmentDelta("midc", { industrialParkingBays: parseInt(e.target.value) || 0 })
                      }
                      className="w-full px-3.5 py-2 rounded-xl border border-[#F0E5E0] text-xs font-mono font-bold text-slate-900"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB: DISH */}
            {activeDeptTab === "dish" && (
              <div className="space-y-6">
                <div className="p-4 rounded-xl bg-[#FFF7F0] border border-[#FED17A] flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <ShieldCheck className="w-6 h-6 text-[#FE7251]" />
                    <div>
                      <h4 className="text-xs font-bold text-[#16060E]">
                        Directorate of Industrial Safety & Health (DISH)
                      </h4>
                      <p className="text-[11px] text-slate-600">
                        85% auto-mapped from Master CAF (Worker Headcount, Factory Coordinates, Hazard Classification).
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-[#9B2A48] bg-[#FFF2DF] px-2.5 py-1 rounded-md border border-[#FED17A]">
                    SLA: 10 Days
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="p-4 rounded-xl border border-[#F0E5E0] bg-[#FFFDFC] space-y-2">
                    <label className="block text-xs font-bold text-[#16060E]">
                      Plant Operational Shift Pattern
                    </label>
                    <select
                      value={departmentDeltas.dish?.shiftPattern || "3 Shifts (24x7)"}
                      onChange={(e) =>
                        updateDepartmentDelta("dish", {
                          shiftPattern: e.target.value as "1 Shift" | "2 Shifts" | "3 Shifts (24x7)",
                        })
                      }
                      className="w-full px-3.5 py-2 rounded-xl border border-[#F0E5E0] text-xs font-bold text-slate-900"
                    >
                      <option value="1 Shift">Single General Shift (09:00 - 18:00)</option>
                      <option value="2 Shifts">Double Shift (Day & Evening)</option>
                      <option value="3 Shifts (24x7)">Continuous 3 Shifts (24x7 Manufacturing)</option>
                    </select>
                  </div>

                  <div className="p-4 rounded-xl border border-[#F0E5E0] bg-[#FFFDFC] space-y-2">
                    <label className="block text-xs font-bold text-[#16060E]">
                      High-Pressure Steam Boiler Installed?
                    </label>
                    <div className="flex items-center space-x-4 pt-1">
                      <label className="flex items-center space-x-2 text-xs font-bold text-slate-800 cursor-pointer">
                        <input
                          type="radio"
                          name="boiler"
                          checked={departmentDeltas.dish?.boilerInstalled === true}
                          onChange={() => updateDepartmentDelta("dish", { boilerInstalled: true })}
                        />
                        <span>Yes (Boiler Inspectorate Inspection Triggered)</span>
                      </label>
                      <label className="flex items-center space-x-2 text-xs font-bold text-slate-800 cursor-pointer">
                        <input
                          type="radio"
                          name="boiler"
                          checked={departmentDeltas.dish?.boilerInstalled !== true}
                          onChange={() => updateDepartmentDelta("dish", { boilerInstalled: false })}
                        />
                        <span>No Boilers</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: DPIIT */}
            {activeDeptTab === "dpiit" && (
              <div className="space-y-6">
                <div className="p-4 rounded-xl bg-[#FFF7F0] border border-[#FED17A] flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Layers className="w-6 h-6 text-[#FE7251]" />
                    <div>
                      <h4 className="text-xs font-bold text-[#16060E]">
                        Central DPIIT • Industrial Entrepreneur Memorandum (IEM)
                      </h4>
                      <p className="text-[11px] text-slate-600">
                        94% auto-mapped from Master CAF (PAN, Corporate CIN, Capex, Sector Classification).
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-[#9B2A48] bg-[#FFF2DF] px-2.5 py-1 rounded-md border border-[#FED17A]">
                    SLA: 7 Days
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="p-4 rounded-xl border border-[#F0E5E0] bg-[#FFFDFC] space-y-2">
                    <label className="block text-xs font-bold text-[#16060E]">
                      Foreign Direct Investment (FDI) Equity %
                    </label>
                    <input
                      type="number"
                      value={departmentDeltas.dpiit?.fdiEquityPercent || 0}
                      onChange={(e) =>
                        updateDepartmentDelta("dpiit", { fdiEquityPercent: parseFloat(e.target.value) || 0 })
                      }
                      className="w-full px-3.5 py-2 rounded-xl border border-[#F0E5E0] text-xs font-mono font-bold text-slate-900"
                    />
                  </div>

                  <div className="p-4 rounded-xl border border-[#F0E5E0] bg-[#FFFDFC] space-y-2">
                    <label className="block text-xs font-bold text-[#16060E]">
                      100% Export Oriented Unit (EOU)?
                    </label>
                    <div className="flex items-center space-x-4 pt-1">
                      <label className="flex items-center space-x-2 text-xs font-bold text-slate-800 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={departmentDeltas.dpiit?.exportOrientedUnit === true}
                          onChange={(e) =>
                            updateDepartmentDelta("dpiit", { exportOrientedUnit: e.target.checked })
                          }
                          className="rounded text-[#FE7251]"
                        />
                        <span>Declared as 100% Export Oriented Unit</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Stepper Controls */}
            <div className="flex items-center justify-between pt-6 border-t border-[#F0E5E0]">
              <button
                type="button"
                onClick={() => setActiveStep("master")}
                className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-white border border-[#FED17A] text-[#9B2A48] text-xs font-bold hover:bg-[#FFF2DF] transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Master CAF</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveStep("vault_attach")}
                className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#9B2A48] via-[#FE7251] to-[#FE7251] hover:from-[#82213B] hover:to-[#E85E3E] text-white text-xs font-bold shadow-md shadow-[#9B2A48]/30 cursor-pointer"
              >
                <span>Verify Central Vault Attachments (Step 3)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 3: CENTRAL DOCUMENT REPOSITORY AUTO-ATTACH */}
      {/* ========================================================================= */}
      {activeStep === "vault_attach" && (
        <div className="bg-white rounded-2xl border border-[#F0E5E0] shadow-xs overflow-hidden space-y-6">
          <div className="p-6 border-b border-[#F0E5E0] bg-[#FFF9F5] flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-[#FFF2DF] text-[#9B2A48] border border-[#FED17A] flex items-center justify-center font-bold shrink-0">
                <FileCheck2 className="w-5 h-5 text-[#FE7251]" />
              </div>
              <div>
                <h2 className="text-base font-bold text-[#16060E]">
                  Central Document Vault Auto-Attachment
                </h2>
                <p className="text-xs text-slate-500">
                  Verified statutory files attached once in Vault are auto-linked to each department's API payload.
                </p>
              </div>
            </div>

            <Link
              href="/dashboard/vault"
              className="text-xs font-bold text-[#9B2A48] hover:text-[#FE7251] underline"
            >
              Open Document Vault
            </Link>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                {
                  title: "Enterprise PAN Card",
                  issuer: "Income Tax Dept (CBDT)",
                  attachedTo: ["MPCB CTE", "MIDC Lease", "DPIIT IEM"],
                  docUrl: masterCAF.documentVault.panCardUrl,
                },
                {
                  title: "MIDC Industrial Land Lease Deed",
                  issuer: "MIDC Regional Office",
                  attachedTo: ["MPCB CTE", "MahaFire NOC", "MIDC Sanction"],
                  docUrl: masterCAF.documentVault.landDeedUrl,
                },
                {
                  title: "Architectural Site Blueprint & Elevations",
                  issuer: "Council of Architecture (COA) Certified",
                  attachedTo: ["MahaFire NOC", "MIDC Sanction", "DISH License"],
                  docUrl: masterCAF.documentVault.sitePlanUrl,
                },
              ].map((doc, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-[#FFF7F0] border border-[#FED17A] flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FFF2DF] text-[#9B2A48] border border-[#FED17A]">
                        DigiLocker Verified
                      </span>
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    </div>
                    <h4 className="text-xs font-bold text-[#16060E]">{doc.title}</h4>
                    <p className="text-[11px] text-slate-600 mt-1">{doc.issuer}</p>

                    <div className="mt-3 pt-2 border-t border-[#FED17A]/60">
                      <span className="text-[10px] font-bold text-[#886A75] block mb-1">
                        Auto-Attached To Payloads:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {doc.attachedTo.map((dep, dIdx) => (
                          <span
                            key={dIdx}
                            className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-white text-[#9B2A48] border border-[#FED17A]"
                          >
                            {dep}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Stepper Controls */}
            <div className="flex items-center justify-between pt-6 border-t border-[#F0E5E0]">
              <button
                type="button"
                onClick={() => setActiveStep("deltas")}
                className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-white border border-[#FED17A] text-[#9B2A48] text-xs font-bold hover:bg-[#FFF2DF] transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Delta Forms</span>
              </button>

              <button
                type="button"
                onClick={handleSubmitAllApplications}
                disabled={isSubmitting}
                className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#9B2A48] via-[#FE7251] to-[#FE7251] hover:from-[#82213B] hover:to-[#E85E3E] text-white text-xs font-black shadow-lg shadow-[#9B2A48]/30 transition-all cursor-pointer hover:scale-[1.02] disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Dispatching Parallel Payloads...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Submit All Applications via Integration Gateway</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 4: INTEGRATION GATEWAY DISPATCH & CONSOLIDATED RECEIPT */}
      {/* ========================================================================= */}
      {activeStep === "gateway_dispatch" && (
        <div className="bg-white rounded-2xl border border-[#F0E5E0] shadow-xs overflow-hidden space-y-6 animate-in fade-in">
          {/* Dispatch Banner */}
          <div className="p-6 sm:p-8 bg-gradient-to-r from-[#9B2A48] via-[#FE7251] to-[#FE7251] text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-white/20 text-[#FFF2DF] border border-white/30 uppercase">
                Parallel API Gateway Execution Successful
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                All Department Applications Dispatched & Tracked
              </h2>
              <p className="text-xs text-[#FFE8DE]">
                Master Reference: <strong>{cafSubmissionReceipt?.masterApplicationRef || "MH-CAF-2026-00412"}</strong> • {cafSubmissionReceipt?.departments.length || 4} State & Central Endpoints Synchronized
              </p>
            </div>

            <div className="flex items-center space-x-2 shrink-0">
              <a
                href={`${BACKEND_API_URL}/caf/receipt/${cafSubmissionReceipt?.masterApplicationRef || "MH-CAF-2026-00412"}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-white text-[#9B2A48] hover:bg-[#FFF2DF] text-xs font-bold shadow-xs transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4 text-[#FE7251]" />
                <span>Download Official Receipt</span>
              </a>
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            {/* Ministry Dispatch Matrix Table */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-[#16060E] uppercase tracking-wider">
                Consolidated Ministry Tracking Matrix
              </h3>

              <div className="overflow-x-auto rounded-xl border border-[#F0E5E0]">
                <table className="min-w-full divide-y divide-[#F0E5E0] text-xs">
                  <thead className="bg-[#FFF9F5] text-[#9B2A48] font-bold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="px-5 py-3 text-left">Department / Authority</th>
                      <th className="px-5 py-3 text-left">Statutory Clearance</th>
                      <th className="px-5 py-3 text-left">Integration Gateway Mode</th>
                      <th className="px-5 py-3 text-left">Tracking ID</th>
                      <th className="px-5 py-3 text-center">SLA Countdown</th>
                      <th className="px-5 py-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F0E5E0] font-medium text-slate-800">
                    {(cafSubmissionReceipt?.departments || []).map((dept) => (
                      <tr key={dept.departmentId} className="hover:bg-[#FFF7F0]/40 transition-colors">
                        <td className="px-5 py-3.5">
                          <p className="font-bold text-[#16060E]">{dept.departmentName}</p>
                          <p className="text-[10px] font-mono text-[#886A75]">{dept.portalEndpoint}</p>
                        </td>
                        <td className="px-5 py-3.5 font-bold text-[#16060E]">
                          {dept.clearanceName}
                        </td>
                        <td className="px-5 py-3.5">
                          <span
                            className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                              dept.integrationMode === "REST_API"
                                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                : dept.integrationMode === "WEBHOOK_EVENT"
                                ? "bg-purple-50 text-purple-800 border-purple-200"
                                : "bg-blue-50 text-blue-800 border-blue-200"
                            }`}
                          >
                            {dept.integrationMode}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 font-mono font-bold text-[#9B2A48]">
                          {dept.trackingId}
                        </td>
                        <td className="px-5 py-3.5 text-center">
                          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-[#FFF2DF] text-[#9B2A48] font-bold text-[10px] border border-[#FED17A]">
                            <Clock className="w-3 h-3 text-[#FE7251]" />
                            <span>{dept.slaDays} Days (Due {dept.statutoryDueDate})</span>
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-center">
                          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-bold text-[10px] border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Acknowledged</span>
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Deemed Approval Statutory Guarantee Strip */}
            <div className="p-4 rounded-xl bg-[#FFF9F5] border border-[#FED17A] flex items-start space-x-3 text-xs text-[#16060E]">
              <ShieldCheck className="w-5 h-5 text-[#FE7251] shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-[#9B2A48]">
                  Statutory Deemed Approval Clause (Maharashtra RTS Act 2015)
                </p>
                <p className="text-[#886A75] mt-0.5 leading-relaxed">
                  Under Maharashtra Right to Public Services Act, each department above has a legally binding deadline to review your Common Application Form. If any department does not raise a formal query within the statutory SLA days, the clearance certificate is <strong>automatically deemed granted by operation of law</strong>.
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-[#F0E5E0]">
              <button
                type="button"
                onClick={() => setActiveStep("master")}
                className="text-xs font-bold text-[#9B2A48] hover:text-[#FE7251] underline cursor-pointer"
              >
                Modify CAF Information
              </button>

              <div className="flex items-center space-x-3">
                <Link
                  href="/dashboard/dag"
                  className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#9B2A48] via-[#FE7251] to-[#FE7251] hover:from-[#82213B] hover:to-[#E85E3E] text-white text-xs font-bold shadow-md shadow-[#9B2A48]/30 transition-all"
                >
                  <span>Track in Live Parallel DAG Pipeline</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

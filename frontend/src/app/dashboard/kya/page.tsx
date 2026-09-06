"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Compass,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Building2,
  Factory,
  Flame,
  Droplets,
  ShieldCheck,
  Zap,
  Sparkles,
  AlertTriangle,
  RotateCcw,
  Layers,
  Award,
  Clock,
  Coins,
  ChevronRight,
  FileCheck2,
} from "lucide-react";
import {
  useEnterpriseStore,
  RiskTrack,
  SectorType,
  ClearanceItem,
} from "@/store/enterpriseStore";

// --- Sector Options ---
const sectorOptions: {
  value: SectorType;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  defaultRiskHint: string;
}[] = [
  {
    value: "Food Processing",
    label: "Food Processing & Agro-Tech",
    description: "Grain milling, cold chains, dairy, packaged foods, and bio-agriculture.",
    icon: Droplets,
    defaultRiskHint: "Typically Green / Orange category",
  },
  {
    value: "Chemical Manufacturing",
    label: "Chemicals, Solvents & Pharma",
    description: "Specialty chemicals, bulk active ingredients, paints, synthetic resins.",
    icon: Factory,
    defaultRiskHint: "High Environmental Impact (Red Category)",
  },
  {
    value: "Engineering",
    label: "Automotive, Fabrication & Engineering",
    description: "Machine tools, casting, auto components, stamping and electrical gear.",
    icon: Building2,
    defaultRiskHint: "Typically Orange / Green category",
  },
  {
    value: "Textile",
    label: "Textiles, Weaving & Apparels",
    description: "Spinning, garment manufacturing, processing units and technical textiles.",
    icon: Layers,
    defaultRiskHint: "Orange if wet-processing/dyeing involved",
  },
  {
    value: "IT/ITeS",
    label: "IT, Data Centers & Electronics",
    description: "Software export parks, data center infrastructure, PCB assembly.",
    icon: Zap,
    defaultRiskHint: "Fast-Track White / Green Category",
  },
];

// --- Industrial Zones ---
const zoneOptions = [
  "Chakan MIDC (Pune)",
  "Taloja Industrial Area (Navi Mumbai)",
  "Butibori MIDC (Nagpur)",
  "Waluj MIDC (Chhatrapati Sambhaji Nagar)",
  "Kagal MIDC (Kolhapur)",
  "Ranjangaon MIDC (Pune)",
  "Additional Ambernath MIDC (Thane)",
  "Non-MIDC / Private Industrial Zone",
];

// --- Client-side Rule Engine Function ---
export function evaluateRiskAndClearances(
  sector: SectorType,
  capexCr: number,
  powerLoadKva: number,
  waterDemandKld: number,
  workforceSize: number,
  locationZone: string
): {
  riskTrack: RiskTrack;
  clearances: ClearanceItem[];
  incentives: string[];
} {
  // 1. Core Rule Logic
  let riskTrack: RiskTrack = "green";

  if (capexCr > 50 || sector === "Chemical Manufacturing") {
    riskTrack = "red";
  } else if (capexCr > 10) {
    riskTrack = "orange";
  } else {
    riskTrack = "green";
  }

  // 2. Dynamic Statutory Clearances Checklist Generation
  const mpcbSla = riskTrack === "red" ? 30 : riskTrack === "orange" ? 21 : 15;
  const mpcbCategoryLabel =
    riskTrack === "red"
      ? "Red (High Pollution Index)"
      : riskTrack === "orange"
      ? "Orange (Moderate Pollution Index)"
      : "Green (Low Pollution Index)";

  const clearances: ClearanceItem[] = [
    {
      id: "midc-allotment",
      name: "MIDC Land Allotment & Building Plan Approval",
      department: "Maharashtra Industrial Development Corporation (MIDC)",
      slaDays: 15,
      category: "Pre-Establishment",
      mandatory: true,
      description: `Zonal allocation, FAR verification, and provisional boundary approval for ${locationZone}.`,
      feeEstimate: capexCr > 50 ? "₹1,50,000" : "₹50,000",
    },
    {
      id: "mpcb-cte",
      name: `MPCB Consent to Establish (CTE) - ${mpcbCategoryLabel}`,
      department: "Maharashtra Pollution Control Board (MPCB)",
      slaDays: mpcbSla,
      category: "Pre-Establishment",
      mandatory: true,
      description: `Statutory emission, effluent treatment standards, and environmental clearance compliance.`,
      feeEstimate: capexCr > 50 ? "₹2,00,000" : capexCr > 10 ? "₹75,000" : "₹25,000",
    },
    {
      id: "fire-noc",
      name: "Provisional Fire Safety & High-Hazard NOC",
      department: "Directorate of Maharashtra Fire Services",
      slaDays: 14,
      category: "Pre-Establishment",
      mandatory: true,
      description: "Hydrant network layout, static water storage tanks, and provisional fire NOC.",
      feeEstimate: "₹35,000",
    },
    {
      id: "water-quota",
      name: "Bulk Industrial Water Supply Allocation",
      department: "MIDC / Water Resources Department",
      slaDays: 7,
      category: "Utility",
      mandatory: waterDemandKld > 5,
      description: `Sanction for ${waterDemandKld} KLD daily intake connection and drainage network connectivity.`,
      feeEstimate: "₹15,000",
    },
    {
      id: "dish-license",
      name: "Factory Registration & Safety Sign-off (DISH)",
      department: "Directorate of Industrial Safety & Health (DISH)",
      slaDays: 15,
      category: "Pre-Operation",
      mandatory: workforceSize >= 10,
      description: `Workplace health, boiler stability, and worker safety approvals for ${workforceSize} staff.`,
      feeEstimate: "₹20,000",
    },
    {
      id: "power-sanction",
      name: "HT/LT Power Sanction Feasibility",
      department: "MSEDCL (State Electricity Distribution)",
      slaDays: 7,
      category: "Utility",
      mandatory: powerLoadKva > 0,
      description: `Sanctioned grid substation feeder load approval for ${powerLoadKva} kVA.`,
      feeEstimate: "₹40,000",
    },
  ];

  // 3. Eligible Incentives & Subsidies Determination (Maharashtra Package Scheme of Incentives - PSI 2019)
  const incentives: string[] = [];
  if (capexCr >= 50) {
    incentives.push("PSI 2019 Mega Project Status (Capital Subsidy up to 40% of Capex)");
    incentives.push("100% Electricity Duty Exemption for 10 Years");
  } else if (capexCr >= 10) {
    incentives.push("PSI 2019 Large Enterprise Incentive (Capital Subsidy up to 25%)");
    incentives.push("Power Tariff Concession of ₹1.50 per unit for 5 Years");
  } else {
    incentives.push("MSME Special Subsidy (Capital Subsidy up to 15%)");
    incentives.push("Interest Subvention of 5% on Term Loans for 5 Years");
  }
  incentives.push("100% Stamp Duty Waiver on MIDC Land Lease Deeds");

  return { riskTrack, clearances, incentives };
}

export default function KYAWizardPage() {
  const {
    sector: storedSector,
    locationZone: storedLocation,
    capexCr: storedCapex,
    powerLoadKva: storedPower,
    waterDemandKld: storedWater,
    workforceSize: storedWorkforce,
    riskTrack: storedRiskTrack,
    clearances: storedClearances,
    applicableIncentives: storedIncentives,
    isAssessed: storedIsAssessed,
    setFormData,
    setAssessmentResult,
    reset,
  } = useEnterpriseStore();

  const [currentStep, setCurrentStep] = useState(1);
  const [sector, setSector] = useState<SectorType>(storedSector || "Food Processing");
  const [locationZone, setLocationZone] = useState(storedLocation || "Chakan MIDC (Pune)");
  const [capexCr, setCapexCr] = useState<number>(storedCapex ?? 25);
  const [powerLoadKva, setPowerLoadKva] = useState<number>(storedPower ?? 150);
  const [waterDemandKld, setWaterDemandKld] = useState<number>(storedWater ?? 20);
  const [workforceSize, setWorkforceSize] = useState<number>(storedWorkforce ?? 75);

  const [showResult, setShowResult] = useState(storedIsAssessed);

  useEffect(() => {
    if (storedIsAssessed) {
      setShowResult(true);
    }
  }, [storedIsAssessed]);

  const handleNext = () => {
    setFormData({
      sector,
      locationZone,
      capexCr,
      powerLoadKva,
      waterDemandKld,
      workforceSize,
    });
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleRunAssessment = async () => {
    const { riskTrack, clearances, incentives } = evaluateRiskAndClearances(
      sector,
      capexCr,
      powerLoadKva,
      waterDemandKld,
      workforceSize,
      locationZone
    );

    setFormData({
      sector,
      locationZone,
      capexCr,
      powerLoadKva,
      waterDemandKld,
      workforceSize,
    });

    setAssessmentResult(riskTrack, clearances, incentives);
    setShowResult(true);

    // Call REST Backend to persist enterprise profile
    try {
      const BACKEND_API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
      await fetch(`${BACKEND_API_URL}/enterprise`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: "ENT-MH-2026-8891",
          name: "Maharashtra Solvents & Chemicals Pvt Ltd",
          sector,
          location_zone: locationZone,
          capex_cr: capexCr,
          power_load_kva: powerLoadKva,
          water_demand_kld: waterDemandKld,
          workforce_size: workforceSize,
          risk_track: riskTrack,
          is_assessed: true,
        }),
      });
    } catch (e) {
      console.warn("Backend persistence call warning:", e);
    }
  };

  const handleReassess = () => {
    setShowResult(false);
    setCurrentStep(1);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Top Title Banner */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>AI-Driven Clearance Determination</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#0F172A] tracking-tight">
            Know Your Approvals (KYA) Wizard
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Dynamic rule-based statutory clearance and subsidy evaluation for Maharashtra industries.
          </p>
        </div>

        {showResult && (
          <button
            type="button"
            onClick={handleReassess}
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Modify Parameters</span>
          </button>
        )}
      </div>

      {!showResult ? (
        /* --- 4-STEP MULTI-STEP WIZARD FORM --- */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          {/* Step Progress Header */}
          <div className="bg-slate-50 border-b border-slate-200 p-4 sm:p-6">
            <div className="grid grid-cols-4 gap-2 text-center text-xs">
              {[
                { num: 1, label: "Sector Selection" },
                { num: 2, label: "Location & Zone" },
                { num: 3, label: "Capital Expenditure" },
                { num: 4, label: "Resource Demand" },
              ].map((step) => {
                const isCurrent = currentStep === step.num;
                const isPassed = currentStep > step.num;
                return (
                  <div
                    key={step.num}
                    className={`flex flex-col items-center p-2 rounded-xl transition-all ${
                      isCurrent
                        ? "bg-white border border-indigo-200 shadow-xs text-indigo-600 font-bold"
                        : isPassed
                        ? "text-emerald-600 font-semibold"
                        : "text-slate-400"
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mb-1 ${
                        isCurrent
                          ? "bg-[#4F46E5] text-white"
                          : isPassed
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      {isPassed ? "✓" : step.num}
                    </div>
                    <span className="text-[11px] truncate hidden sm:inline">{step.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Form Step Body */}
          <div className="p-6 sm:p-8">
            {/* STEP 1: SECTOR */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-[#0F172A]">Step 1: Select Your Industry Sector</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Department clearance dependencies and pollution categories heavily depend on your manufacturing domain.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {sectorOptions.map((option) => {
                    const IconComp = option.icon;
                    const isSelected = sector === option.value;
                    return (
                      <div
                        key={option.value}
                        onClick={() => setSector(option.value)}
                        className={`p-5 rounded-2xl border-2 cursor-pointer transition-all duration-150 flex flex-col justify-between ${
                          isSelected
                            ? "border-[#4F46E5] bg-indigo-50/50 shadow-xs"
                            : "border-slate-200 hover:border-slate-300 bg-white"
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <div
                              className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                                isSelected ? "bg-[#4F46E5] text-white" : "bg-slate-100 text-slate-600"
                              }`}
                            >
                              <IconComp className="w-5 h-5" />
                            </div>
                            {isSelected && (
                              <CheckCircle2 className="w-5 h-5 text-indigo-600" />
                            )}
                          </div>
                          <h4 className="text-sm font-bold text-[#0F172A]">{option.label}</h4>
                          <p className="text-xs text-slate-500 mt-1">{option.description}</p>
                        </div>
                        <span className="mt-4 text-[10px] font-semibold text-indigo-600 bg-indigo-100/60 px-2 py-0.5 rounded-md inline-block self-start">
                          {option.defaultRiskHint}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* STEP 2: LOCATION / ZONE */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-[#0F172A]">Step 2: Proposed Location & Industrial Zone</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Select the designated MIDC industrial estate or municipal jurisdiction for your unit.
                  </p>
                </div>

                <div className="max-w-xl space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Maharashtra Industrial Development Zone
                    </label>
                    <select
                      value={locationZone}
                      onChange={(e) => setLocationZone(e.target.value)}
                      className="block w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      {zoneOptions.map((zone) => (
                        <option key={zone} value={zone}>
                          {zone}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="p-4 bg-indigo-50/70 border border-indigo-100 rounded-xl text-xs text-indigo-900 flex items-start space-x-2.5">
                    <Building2 className="w-4 h-4 text-indigo-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="font-bold">Fast-Track MIDC Zone Detected</p>
                      <p className="text-[11px] text-indigo-700 mt-0.5">
                        MIDC lands come with pre-vetted power sub-stations, industrial drainage canals, and deemed land use conversion.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: CAPITAL EXPENDITURE */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-[#0F172A]">Step 3: Proposed Capital Expenditure (Capex)</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Total project investment in plant, machinery, building, and civil infrastructure.
                  </p>
                </div>

                <div className="max-w-xl space-y-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Total Project Investment (in ₹ Crores)
                    </label>
                    <div className="relative rounded-xl shadow-xs">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 font-bold text-base">
                        ₹
                      </div>
                      <input
                        type="number"
                        min={1}
                        max={1000}
                        value={capexCr}
                        onChange={(e) => setCapexCr(Number(e.target.value))}
                        className="block w-full pl-9 pr-24 py-3 bg-slate-50 border border-slate-300 rounded-xl text-lg font-black text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                      <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-xs font-bold text-slate-500 uppercase">
                        Crores INR
                      </div>
                    </div>
                  </div>

                  {/* Preset Quick Pills */}
                  <div>
                    <p className="text-xs font-bold text-slate-500 mb-2">Quick Select Scale:</p>
                    <div className="flex flex-wrap gap-2">
                      {[5, 15, 30, 65, 120].map((val) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setCapexCr(val)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                            capexCr === val
                              ? "bg-indigo-600 text-white border-indigo-600"
                              : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                          }`}
                        >
                          ₹{val} Cr {val >= 50 ? "(Mega)" : val >= 10 ? "(Large)" : "(MSME)"}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Dynamic Risk Impact Preview */}
                  <div
                    className={`p-4 rounded-xl border text-xs flex items-start space-x-2.5 ${
                      capexCr > 50
                        ? "bg-rose-50 border-rose-200 text-rose-900"
                        : capexCr > 10
                        ? "bg-amber-50 border-amber-200 text-amber-900"
                        : "bg-emerald-50 border-emerald-200 text-emerald-900"
                    }`}
                  >
                    <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                    <div>
                      <p className="font-bold">
                        Calculated Tier: {capexCr > 50 ? "Red Track (Capex > 50 Cr)" : capexCr > 10 ? "Orange Track (Capex > 10 Cr)" : "Green Track (Capex ≤ 10 Cr)"}
                      </p>
                      <p className="text-[11px] opacity-90 mt-0.5">
                        {capexCr > 50
                          ? "Requires State Level Technical Committee Scrutiny (30-day SLA)."
                          : capexCr > 10
                          ? "Standard Regional Officer Level Clearances (21-day SLA)."
                          : "Fast-track district single window clearances (15-day SLA)."}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: RESOURCE DEMANDS */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-[#0F172A]">Step 4: Utility & Operational Requirements</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Determine electricity transformer capacities, industrial water intake quota, and DISH safety thresholds.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Power Load */}
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                    <div className="flex items-center space-x-2 text-indigo-600 mb-2">
                      <Zap className="w-4 h-4" />
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                        Power Load (kVA)
                      </label>
                    </div>
                    <input
                      type="number"
                      min={10}
                      value={powerLoadKva}
                      onChange={(e) => setPowerLoadKva(Number(e.target.value))}
                      className="block w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-base font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                    />
                    <p className="text-[10px] text-slate-500 mt-1">MSEDCL Feasibility trigger</p>
                  </div>

                  {/* Water Demand */}
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                    <div className="flex items-center space-x-2 text-blue-600 mb-2">
                      <Droplets className="w-4 h-4" />
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                        Water Demand (KLD)
                      </label>
                    </div>
                    <input
                      type="number"
                      min={1}
                      value={waterDemandKld}
                      onChange={(e) => setWaterDemandKld(Number(e.target.value))}
                      className="block w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-base font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                    />
                    <p className="text-[10px] text-slate-500 mt-1">Kilo Liters Per Day</p>
                  </div>

                  {/* Workforce Size */}
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                    <div className="flex items-center space-x-2 text-purple-600 mb-2">
                      <ShieldCheck className="w-4 h-4" />
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                        Workforce Size
                      </label>
                    </div>
                    <input
                      type="number"
                      min={1}
                      value={workforceSize}
                      onChange={(e) => setWorkforceSize(Number(e.target.value))}
                      className="block w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-base font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                    />
                    <p className="text-[10px] text-slate-500 mt-1">DISH Factory Act Threshold (&gt;10)</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Wizard Footer Navigation */}
          <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex items-center justify-between">
            <button
              type="button"
              onClick={handleBack}
              disabled={currentStep === 1}
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold text-slate-700 disabled:opacity-30 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Previous Step</span>
            </button>

            {currentStep < 4 ? (
              <button
                type="button"
                onClick={handleNext}
                className="inline-flex items-center space-x-1.5 px-6 py-2.5 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleRunAssessment}
                className="inline-flex items-center space-x-2 px-7 py-2.5 rounded-xl bg-[#059669] hover:bg-[#047857] text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Evaluate & Generate Clearances</span>
              </button>
            )}
          </div>
        </div>
      ) : (
        /* --- KYA EVALUATION RESULTS VIEW --- */
        <div className="space-y-6">
          {/* Top Risk Badge Banner */}
          <div
            className={`rounded-2xl p-6 border shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6 ${
              storedRiskTrack === "red"
                ? "bg-rose-50/80 border-rose-200 text-rose-950"
                : storedRiskTrack === "orange"
                ? "bg-amber-50/80 border-amber-200 text-amber-950"
                : "bg-emerald-50/80 border-emerald-200 text-emerald-950"
            }`}
          >
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <span
                  className={`inline-flex items-center space-x-1.5 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider ${
                    storedRiskTrack === "red"
                      ? "bg-[#E11D48] text-white"
                      : storedRiskTrack === "orange"
                      ? "bg-[#D97706] text-white"
                      : "bg-[#059669] text-white"
                  }`}
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>{storedRiskTrack?.toUpperCase()} CATEGORY CLEARANCE TRACK</span>
                </span>
                <span className="text-xs font-bold text-slate-700">
                  {storedSector} • ₹{storedCapex} Cr Capex
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight">
                {storedRiskTrack === "red"
                  ? "High Environmental & Statutory Impact Clearance Track"
                  : storedRiskTrack === "orange"
                  ? "Moderate Impact Multi-Department Clearance Track"
                  : "Fast-Track Low Environmental Impact Clearance Track"}
              </h2>
              <p className="text-xs mt-1 opacity-90 max-w-2xl leading-relaxed">
                {storedRiskTrack === "red"
                  ? "Requires Full Environmental Committee review, HazMat safety plans, and 30-day statutory SLA scrutiny."
                  : storedRiskTrack === "orange"
                  ? "Standard parallel departmental processing across MIDC, MPCB, and Fire Services within 21 days."
                  : "Fast-track district level approvals with 15-day deemed approval assurance."}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/dashboard/document-vault"
                className="inline-flex items-center space-x-2 px-5 py-3 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all shrink-0"
              >
                <span>Proceed to Document Vault</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Generated Clearances Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[#0F172A]">
                  Mandatory Statutory Clearances Checklist ({storedClearances.length} Clearances)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Pre-establishment and utility approvals assembled specifically for your parameters
                </p>
              </div>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                Parallel Execution Ready
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-xs">
                <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="px-6 py-3 text-left">Clearance Name</th>
                    <th className="px-6 py-3 text-left">Department</th>
                    <th className="px-6 py-3 text-left">Category</th>
                    <th className="px-6 py-3 text-center">Statutory SLA</th>
                    <th className="px-6 py-3 text-right">Est. Govt Fee</th>
                    <th className="px-6 py-3 text-center">Mandatory</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                  {storedClearances.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-bold text-slate-900 text-sm">{item.name}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">{item.description}</p>
                      </td>
                      <td className="px-6 py-4 text-slate-600 font-semibold">{item.department}</td>
                      <td className="px-6 py-4">
                        <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                          {item.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="font-black text-indigo-600 text-sm">
                          {item.slaDays} Days
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-mono font-bold text-slate-900">
                        {item.feeEstimate}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {item.mandatory ? (
                          <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                            Required
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                            Conditional
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Incentives & Subsidies Summary Card */}
          <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-[#0F172A] text-white rounded-2xl p-6 sm:p-8 border border-slate-800 shadow-lg">
            <div className="flex items-center space-x-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-2">
              <Award className="w-4 h-4" />
              <span>Maharashtra Package Scheme of Incentives (PSI 2019)</span>
            </div>
            <h3 className="text-lg sm:text-xl font-black">
              Eligible Industrial Subsidies & Benefits
            </h3>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              Based on your ₹{storedCapex} Cr investment in {storedLocation}, you qualify for the following state subsidies:
            </p>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {storedIncentives.map((incentive, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/80 flex items-start space-x-3"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                  <span className="text-xs font-semibold text-slate-200">{incentive}</span>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="text-xs text-slate-400">
                Data saved to your shared enterprise profile in <code>enterpriseStore</code>.
              </div>
              <Link
                href="/dashboard/document-vault"
                className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-bold shadow-md transition-all cursor-pointer"
              >
                <span>Upload Documents for these Clearances</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

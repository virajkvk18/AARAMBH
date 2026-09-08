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
  Plane,
  Truck,
  FileText,
  BadgePercent,
  Banknote,
  Cpu,
  Leaf,
  Landmark,
} from "lucide-react";
import {
  useEnterpriseStore,
  RiskTrack,
  SectorType,
  ClearanceItem,
} from "@/store/enterpriseStore";
import { useLanguage } from "@/context/LanguageContext";
import {
  evaluatePolicyIncentives,
  MAHARASHTRA_DISTRICT_TALUKAS,
  SECTOR_POLICY_REGISTRY,
  CalculatedIncentives,
} from "@/data/policyRulesEngine";
import {
  generateClearanceWorkflow,
  GeneratedWorkflowDAG,
} from "@/data/workflowRuleEngine";

// --- Official Sector Options based on Government Resolutions ---
const sectorOptions = [
  {
    value: "ev_manufacturing",
    label: "Electric Vehicle & Battery Ecosystem",
    description: "BEV assembly, ACC battery gigafactories, charging stations, components.",
    icon: Zap,
    policyTag: "Maharashtra EV Policy 2021",
    policyGr: "MSEVP-2021/CR 25/TC-4",
  },
  {
    value: "aerospace_defence",
    label: "Aerospace & Defence Manufacturing",
    description: "OEM weapons, avionics, ammunition, MRO facilities, UAVs & radar gear.",
    icon: Plane,
    policyTag: "Aerospace & Defence Policy 2018",
    policyGr: "IDL-2017/CR 188/IND-2",
  },
  {
    value: "fintech",
    label: "FinTech & Digital Financial Services",
    description: "Payment gateways, RegTech, blockchain DLT, cloud banking, sandbox pilots.",
    icon: Landmark,
    policyTag: "Maharashtra FinTech Policy 2018",
    policyGr: "DIT-2018/CR 17/D-1/39",
  },
  {
    value: "logistics_warehousing",
    label: "Logistics, Cold Chain & Warehousing",
    description: "Integrated logistics parks, silos, multi-storey hubs, smart warehouses.",
    icon: Truck,
    policyTag: "Maharashtra Logistics Policy 2024",
    policyGr: "Industries Dept Resolution 2024",
  },
  {
    value: "textiles_garmenting",
    label: "Textiles, Spinning & Technical Textiles",
    description: "Ginning, weaving, knitting, non-conventional yarn (bamboo/banana), apparel.",
    icon: Layers,
    policyTag: "State Textile Policy 2018-23",
    policyGr: "Policy 2017/CR 6/Text-5",
  },
  {
    value: "agro_food_processing",
    label: "Agro & Food Processing (Secondary/Tertiary)",
    description: "Mini food parks, cold storages, grain milling, fruit pulp, dairy packaging.",
    icon: Droplets,
    policyTag: "PSI 2019 (Thrust Sector)",
    policyGr: "PSI-2019/CR 46/IND-8",
  },
  {
    value: "industry_4_0_ai",
    label: "Industry 4.0, Robotics & AI Hub",
    description: "IoT hardware, 3D printing, advanced robotics, nanotechnology, sensors.",
    icon: Cpu,
    policyTag: "PSI 2019 (Thrust Sector)",
    policyGr: "PSI-2019/CR 46/IND-8",
  },
  {
    value: "green_energy_biofuel",
    label: "Green Energy, Solar & Bio-Fuel Production",
    description: "Solar farms, green hydrogen, ethanol distillation, biomass power.",
    icon: Leaf,
    policyTag: "PSI 2019 (Thrust Sector)",
    policyGr: "PSI-2019/CR 46/IND-8",
  },
  {
    value: "general_manufacturing",
    label: "General Industrial Engineering & Chemicals",
    description: "Specialty chemicals, steel fabrication, heavy machinery, plastics.",
    icon: Factory,
    policyTag: "PSI 2019 Standard Matrix",
    policyGr: "PSI-2019/CR 46/IND-8",
  },
];

export default function KYAWizardPage() {
  const {
    sector: storedSector,
    locationZone: storedLocation,
    district: storedDistrict,
    taluka: storedTaluka,
    capexCr: storedCapex,
    powerLoadKva: storedPower,
    waterDemandKld: storedWater,
    workforceSize: storedWorkforce,
    riskTrack: storedRiskTrack,
    clearances: storedClearances,
    applicableIncentives: storedIncentives,
    policyIncentiveDetails: storedPolicyDetails,
    isAssessed: storedIsAssessed,
    setFormData,
    setAssessmentResult,
    resetAssessment,
  } = useEnterpriseStore();
  const { t } = useLanguage();

  const [currentStep, setCurrentStep] = useState(1);
  const [selectedSectorKey, setSelectedSectorKey] = useState<string>("ev_manufacturing");
  const [selectedDistrict, setSelectedDistrict] = useState<string>(storedDistrict || "Pune");
  const [selectedTaluka, setSelectedTaluka] = useState<string>(storedTaluka || "Khed (Chakan PMR)");
  const [locationZone, setLocationZone] = useState<string>(storedLocation || "Chakan MIDC Phase II (Pune)");
  const [capexCr, setCapexCr] = useState<number>(storedCapex ?? 35);
  const [powerLoadKva, setPowerLoadKva] = useState<number>(storedPower ?? 250);
  const [waterDemandKld, setWaterDemandKld] = useState<number>(storedWater ?? 20);
  const [workforceSize, setWorkforceSize] = useState<number>(storedWorkforce ?? 120);
  const [isExpansion, setIsExpansion] = useState<boolean>(false);
  const [boilerInstalled, setBoilerInstalled] = useState<boolean>(false);
  const [buildingHeightMeters, setBuildingHeightMeters] = useState<number>(12);

  const [calculatedIncentives, setCalculatedIncentives] = useState<CalculatedIncentives | null>(
    storedPolicyDetails || null
  );
  const [workflowDAG, setWorkflowDAG] = useState<GeneratedWorkflowDAG | null>(null);
  const [showResult, setShowResult] = useState<boolean>(storedIsAssessed);

  // Get talukas for selected district
  const currentDistrictObj =
    MAHARASHTRA_DISTRICT_TALUKAS.find((d) => d.district.toLowerCase() === selectedDistrict.toLowerCase()) ||
    MAHARASHTRA_DISTRICT_TALUKAS[0];

  useEffect(() => {
    if (storedIsAssessed && storedPolicyDetails) {
      setCalculatedIncentives(storedPolicyDetails);
      setShowResult(true);
    }
  }, [storedIsAssessed, storedPolicyDetails]);

  // When district changes, update taluka to first taluka of that district
  const handleDistrictChange = (newDistrict: string) => {
    setSelectedDistrict(newDistrict);
    const distObj = MAHARASHTRA_DISTRICT_TALUKAS.find((d) => d.district.toLowerCase() === newDistrict.toLowerCase());
    if (distObj && distObj.talukas.length > 0) {
      setSelectedTaluka(distObj.talukas[0].name);
      setLocationZone(`${distObj.talukas[0].name} Industrial Area (${distObj.district})`);
    }
  };

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleRunAssessment = () => {
    // 1. Evaluate policy rules & financial incentives
    const incentivesResult = evaluatePolicyIncentives({
      sector: selectedSectorKey,
      district: selectedDistrict,
      taluka: selectedTaluka,
      capexCr,
      workforceSize,
      powerLoadKw: powerLoadKva,
      isExpansion,
    });

    // 2. Determine hazard category for workflow
    let hazardCategory: "Red" | "Orange" | "Green" | "White" = "Orange";
    if (selectedSectorKey === "general_manufacturing" || capexCr > 100) {
      hazardCategory = "Red";
    } else if (selectedSectorKey === "fintech" || selectedSectorKey === "industry_4_0_ai") {
      hazardCategory = "White";
    } else if (selectedSectorKey === "ev_manufacturing" || selectedSectorKey === "logistics_warehousing") {
      hazardCategory = "Green";
    }

    // 3. Generate dynamic DAG workflow
    const dagResult = generateClearanceWorkflow({
      sector: selectedSectorKey,
      hazardCategory,
      powerLoadKw: powerLoadKva,
      buildingHeightMeters,
      occupantsCount: workforceSize,
      boilerInstalled,
      isMidcLand: true,
    });

    // 4. Map clearances to enterprise store items
    const storeClearances: ClearanceItem[] = dagResult.clearances.map((c) => ({
      id: c.id,
      name: c.name,
      department: c.department,
      slaDays: c.slaDays,
      category: c.category === "pre_operation" ? "Pre-Operation" : c.category === "environmental" ? "Pre-Establishment" : "Pre-Establishment",
      mandatory: true,
      description: `${c.statutoryAct} compliance. Deemed approval in ${c.slaDays} days.`,
      feeEstimate: capexCr > 50 ? "₹1,50,000" : capexCr > 10 ? "₹75,000" : "₹25,000",
    }));

    const riskTrack: RiskTrack = hazardCategory === "Red" ? "red" : hazardCategory === "Orange" ? "orange" : "green";

    const incentiveSummaryList: string[] = [
      `${incentivesResult.governingPolicy} - Category ${incentivesResult.category} (${incentivesResult.scale})`,
      `Capital Subsidy Ceiling: ${incentivesResult.fciCeilingPct}% of FCI (Up to ₹${incentivesResult.maxIncentiveAmountCr} Crores)`,
      `Eligibility Period: ${incentivesResult.eligibilityYears} Years (Disbursement Cap: ₹${incentivesResult.annualDisbursementCapCr} Cr/yr)`,
      `Industrial Promotion Subsidy (IPS): ${incentivesResult.sgstIpsRefundPct}% Gross SGST Refund`,
      `Power Tariff Subsidy: ₹${incentivesResult.powerSubsidyRatePerUnit}/unit for 3 Years`,
      `Stamp Duty Exemption: ${incentivesResult.stampDutyWaiverPct}% on Land Lease & Term Loans`,
      `Electricity Duty: ${incentivesResult.electricityDutyExempt ? "100% Exempted" : "Standard Tariff"}`,
    ];

    setCalculatedIncentives(incentivesResult);
    setWorkflowDAG(dagResult);

    // Save to global store
    const selectedOption = sectorOptions.find((s) => s.value === selectedSectorKey);
    const sectorDisplay = (selectedOption ? selectedOption.label : "General Manufacturing") as SectorType;

    setFormData({
      sector: sectorDisplay,
      locationZone,
      district: selectedDistrict,
      taluka: selectedTaluka,
      capexCr,
      powerLoadKva,
      waterDemandKld,
      workforceSize,
    });

    setAssessmentResult(riskTrack, storeClearances, incentiveSummaryList, incentivesResult);
    setShowResult(true);
  };

  const handleReassess = () => {
    resetAssessment();
    setShowResult(false);
    setCurrentStep(1);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Top Title Banner */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#F0E5E0] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#FFF2DF] border border-[#FED17A] text-[#9B2A48] text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5 text-[#FE7251]" />
            <span>Official Maharashtra Policy Rule Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#16060E] tracking-tight">
            Know Your Approvals (KYA) & Policy Incentive Calculator
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Evaluates statutory clearances, RTS Act SLAs, and exact subsidies under PSI 2019, EV 2021, Logistics 2024, Aerospace 2018, FinTech 2018 & Textile 2018-23.
          </p>
        </div>

        {showResult && (
          <button
            type="button"
            onClick={handleReassess}
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-[#FFF7F0] hover:bg-[#FFF2DF] border border-[#FED17A] text-[#9B2A48] text-xs font-bold transition-colors cursor-pointer shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Modify Parameters</span>
          </button>
        )}
      </div>

      {!showResult ? (
        /* --- 4-STEP MULTI-STEP WIZARD FORM --- */
        <div className="bg-white rounded-2xl border border-[#F0E5E0] shadow-xs overflow-hidden">
          {/* Step Progress Header */}
          <div className="bg-[#FFF9F5] border-b border-[#F0E5E0] p-4 sm:p-6">
            <div className="grid grid-cols-4 gap-2 text-center text-xs">
              {[
                { num: 1, label: "1. Policy & Sector" },
                { num: 2, label: "2. District & Taluka" },
                { num: 3, label: "3. Capex & Scale" },
                { num: 4, label: "4. Utilities & DAG" },
              ].map((step) => {
                const isCurrent = currentStep === step.num;
                const isPassed = currentStep > step.num;
                return (
                  <div
                    key={step.num}
                    className={`flex flex-col items-center p-2 rounded-xl transition-all ${
                      isCurrent
                        ? "bg-white border border-[#FED17A] shadow-xs text-[#9B2A48] font-bold"
                        : isPassed
                        ? "text-[#9B2A48] font-semibold"
                        : "text-[#886A75]"
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mb-1 ${
                        isCurrent
                          ? "bg-gradient-to-r from-[#9B2A48] to-[#FE7251] text-white"
                          : isPassed
                          ? "bg-[#FFF2DF] text-[#9B2A48] border border-[#FED17A]"
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
            {/* STEP 1: SECTOR SELECTION */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-[#16060E]">Step 1: Select Your Industry Sector & Policy Track</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Maharashtra offers sector-specific Government Resolutions (GRs) with targeted capital subsidies, power tariffs, and fast-track approvals.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {sectorOptions.map((option) => {
                    const IconComp = option.icon;
                    const isSelected = selectedSectorKey === option.value;
                    return (
                      <div
                        key={option.value}
                        onClick={() => setSelectedSectorKey(option.value)}
                        className={`p-5 rounded-2xl border-2 cursor-pointer transition-all duration-150 flex flex-col justify-between ${
                          isSelected
                            ? "border-[#FE7251] bg-[#FFF7F0] shadow-xs"
                            : "border-[#F0E5E0] hover:border-[#FE7251]/60 bg-white"
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <div
                              className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                                isSelected ? "bg-gradient-to-br from-[#9B2A48] to-[#FE7251] text-white" : "bg-[#FFF2DF] text-[#9B2A48]"
                              }`}
                            >
                              <IconComp className="w-5 h-5" />
                            </div>
                            {isSelected && (
                              <CheckCircle2 className="w-5 h-5 text-[#FE7251]" />
                            )}
                          </div>
                          <h4 className="text-sm font-bold text-[#16060E]">{option.label}</h4>
                          <p className="text-xs text-slate-500 mt-1 leading-relaxed">{option.description}</p>
                        </div>
                        <div className="mt-4 pt-3 border-t border-[#F0E5E0]/60">
                          <span className="text-[10px] font-bold text-[#9B2A48] bg-[#FFF2DF] border border-[#FED17A] px-2 py-0.5 rounded-md inline-block">
                            {option.policyTag}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* STEP 2: DISTRICT & TALUKA CLASSIFICATION */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-[#16060E]">Step 2: Select Proposed Location (District & Taluka)</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Under Maharashtra PSI 2019, fiscal incentive ceilings (30% to 100%) and eligibility periods are graded by Taluka classification (Group A, B, C, D, D+, No Industry, Naxal, Aspirational).
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl">
                  {/* District Dropdown */}
                  <div>
                    <label className="block text-xs font-bold text-[#16060E] uppercase tracking-wider mb-2">
                      Maharashtra District
                    </label>
                    <select
                      value={selectedDistrict}
                      onChange={(e) => handleDistrictChange(e.target.value)}
                      className="block w-full px-4 py-3 bg-[#FFFDFC] border border-[#F0E5E0] rounded-xl text-sm font-semibold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#FE7251]"
                    >
                      {MAHARASHTRA_DISTRICT_TALUKAS.map((d) => (
                        <option key={d.district} value={d.district}>
                          {d.district} ({d.division} Division)
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Taluka Dropdown */}
                  <div>
                    <label className="block text-xs font-bold text-[#16060E] uppercase tracking-wider mb-2">
                      Taluka / Sub-District
                    </label>
                    <select
                      value={selectedTaluka}
                      onChange={(e) => {
                        setSelectedTaluka(e.target.value);
                        setLocationZone(`${e.target.value} Industrial Zone (${selectedDistrict})`);
                      }}
                      className="block w-full px-4 py-3 bg-[#FFFDFC] border border-[#F0E5E0] rounded-xl text-sm font-semibold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#FE7251]"
                    >
                      {currentDistrictObj.talukas.map((t) => (
                        <option key={t.name} value={t.name}>
                          {t.name} — Group {t.category}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Location Zone Details */}
                <div className="max-w-2xl">
                  <label className="block text-xs font-bold text-[#16060E] uppercase tracking-wider mb-2">
                    Industrial Estate / MIDC Park Name
                  </label>
                  <input
                    type="text"
                    value={locationZone}
                    onChange={(e) => setLocationZone(e.target.value)}
                    className="block w-full px-4 py-3 bg-[#FFFDFC] border border-[#F0E5E0] rounded-xl text-sm font-semibold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#FE7251]"
                    placeholder="e.g. Chakan MIDC Phase II, Waluj MIDC, Butibori MIDC"
                  />
                </div>
              </div>
            )}

            {/* STEP 3: CAPEX & SCALE */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-[#16060E]">Step 3: Proposed Fixed Capital Investment (FCI)</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Specify plant and machinery investments to calculate statutory scale (MSME, LSI, Mega, Ultra-Mega) and annual grant caps.
                  </p>
                </div>

                <div className="max-w-2xl space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-bold text-[#16060E] uppercase tracking-wider">
                        Capital Expenditure (Fixed Assets in ₹ Crores)
                      </label>
                      <span className="text-base font-black text-[#9B2A48]">₹{capexCr} Crores</span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={500}
                      step={1}
                      value={capexCr}
                      onChange={(e) => setCapexCr(Number(e.target.value))}
                      className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#FE7251]"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-semibold">
                      <span>₹1 Cr (Micro)</span>
                      <span>₹10 Cr (Small)</span>
                      <span>₹50 Cr (Medium/LSI)</span>
                      <span>₹100 Cr+ (Mega)</span>
                      <span>₹500 Cr</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#16060E] uppercase tracking-wider mb-2">
                        Direct Employment (Workforce Count)
                      </label>
                      <input
                        type="number"
                        min={5}
                        value={workforceSize}
                        onChange={(e) => setWorkforceSize(Number(e.target.value))}
                        className="block w-full px-4 py-3 bg-[#FFFDFC] border border-[#F0E5E0] rounded-xl text-sm font-semibold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#FE7251]"
                      />
                    </div>

                    <div className="flex items-center space-x-3 p-4 bg-[#FFF9F5] rounded-xl border border-[#F0E5E0] mt-6">
                      <input
                        type="checkbox"
                        id="expansionCheck"
                        checked={isExpansion}
                        onChange={(e) => setIsExpansion(e.target.checked)}
                        className="w-4 h-4 text-[#FE7251] rounded-sm focus:ring-[#FE7251]"
                      />
                      <label htmlFor="expansionCheck" className="text-xs font-bold text-[#16060E] cursor-pointer">
                        Expansion / Diversification Unit (+25% capacity)
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: UTILITIES & DAG */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-[#16060E]">Step 4: Utility Quotas & Structural Safety</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Determine electricity transformer feeder capacities, water intake quota, and DISH / Fire safety triggers.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 bg-[#FFF9F5] rounded-2xl border border-[#F0E5E0]">
                    <div className="flex items-center space-x-2 text-[#9B2A48] mb-2">
                      <Zap className="w-4 h-4 text-[#FE7251]" />
                      <label className="text-xs font-bold uppercase tracking-wider text-[#16060E]">
                        Power Load (kVA / kW)
                      </label>
                    </div>
                    <input
                      type="number"
                      min={10}
                      value={powerLoadKva}
                      onChange={(e) => setPowerLoadKva(Number(e.target.value))}
                      className="block w-full px-3 py-2 bg-white border border-[#F0E5E0] rounded-lg text-base font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#FE7251]"
                    />
                    <p className="text-[10px] text-slate-500 mt-1">MSEDCL Feasibility trigger</p>
                  </div>

                  <div className="p-4 bg-[#FFF9F5] rounded-2xl border border-[#F0E5E0]">
                    <div className="flex items-center space-x-2 text-[#9B2A48] mb-2">
                      <Droplets className="w-4 h-4 text-[#FE7251]" />
                      <label className="text-xs font-bold uppercase tracking-wider text-[#16060E]">
                        Water Demand (KLD)
                      </label>
                    </div>
                    <input
                      type="number"
                      min={1}
                      value={waterDemandKld}
                      onChange={(e) => setWaterDemandKld(Number(e.target.value))}
                      className="block w-full px-3 py-2 bg-white border border-[#F0E5E0] rounded-lg text-base font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#FE7251]"
                    />
                    <p className="text-[10px] text-slate-500 mt-1">Kilo Liters Per Day (MIDC)</p>
                  </div>

                  <div className="p-4 bg-[#FFF9F5] rounded-2xl border border-[#F0E5E0]">
                    <div className="flex items-center space-x-2 text-[#9B2A48] mb-2">
                      <Flame className="w-4 h-4 text-[#FE7251]" />
                      <label className="text-xs font-bold uppercase tracking-wider text-[#16060E]">
                        Building Height (m)
                      </label>
                    </div>
                    <input
                      type="number"
                      min={5}
                      value={buildingHeightMeters}
                      onChange={(e) => setBuildingHeightMeters(Number(e.target.value))}
                      className="block w-full px-3 py-2 bg-white border border-[#F0E5E0] rounded-lg text-base font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#FE7251]"
                    />
                    <p className="text-[10px] text-slate-500 mt-1">MahaFire Safety NOC (&gt;9m)</p>
                  </div>
                </div>

                <div className="p-4 bg-white rounded-xl border border-[#F0E5E0] flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="boilerCheck"
                    checked={boilerInstalled}
                    onChange={(e) => setBoilerInstalled(e.target.checked)}
                    className="w-4 h-4 text-[#FE7251] rounded-sm focus:ring-[#FE7251]"
                  />
                  <label htmlFor="boilerCheck" className="text-xs font-bold text-[#16060E] cursor-pointer">
                    Steam Boiler / Thermal Pressure Vessel Installed (Triggers Directorate of Steam Boilers Registration)
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Wizard Footer Navigation */}
          <div className="bg-[#FFF9F5] border-t border-[#F0E5E0] px-6 py-4 flex items-center justify-between">
            <button
              type="button"
              onClick={handleBack}
              disabled={currentStep === 1}
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold text-[#16060E] disabled:opacity-30 hover:bg-[#FFF2DF] transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            {currentStep < 4 ? (
              <button
                type="button"
                onClick={handleNext}
                className="inline-flex items-center space-x-1.5 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#9B2A48] via-[#FE7251] to-[#FE7251] hover:from-[#7D1E36] hover:to-[#E55B3B] text-white text-xs font-bold shadow-md shadow-[#FE7251]/20 transition-all cursor-pointer"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleRunAssessment}
                className="inline-flex items-center space-x-2 px-7 py-2.5 rounded-xl bg-gradient-to-r from-[#9B2A48] via-[#FE7251] to-[#FE7251] hover:from-[#7D1E36] hover:to-[#E55B3B] text-white text-xs font-bold shadow-md shadow-[#FE7251]/20 transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Evaluate & Generate Policy Incentives</span>
              </button>
            )}
          </div>
        </div>
      ) : (
        /* --- KYA EVALUATION RESULTS VIEW --- */
        <div className="space-y-8">
          {/* 1. TOP POLICY & INCENTIVE SUMMARY BANNER */}
          {calculatedIncentives && (
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#FED17A] shadow-md bg-gradient-to-br from-white via-[#FFF9F5] to-[#FFF2DF]/40 space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#FED17A]/60 pb-6">
                <div>
                  <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#9B2A48] text-white text-xs font-bold uppercase tracking-wider mb-2">
                    <Award className="w-3.5 h-3.5 text-[#FFCA7C]" />
                    <span>{calculatedIncentives.governingPolicy} • GR: {calculatedIncentives.grReference}</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-[#16060E] tracking-tight">
                    Eligible for Category '{calculatedIncentives.category}' Package ({calculatedIncentives.scale})
                  </h2>
                  <p className="text-xs text-slate-600 mt-1">
                    Location: {storedLocation || locationZone} • Fixed Capital Investment: ₹{capexCr} Crores
                  </p>
                </div>

                <div className="text-right shrink-0 bg-white p-4 rounded-xl border border-[#FED17A] shadow-xs">
                  <p className="text-[10px] uppercase font-bold text-slate-400">Total Capital Subsidy Cap</p>
                  <p className="text-2xl sm:text-3xl font-black text-[#9B2A48]">₹{calculatedIncentives.maxIncentiveAmountCr} Cr</p>
                  <p className="text-[11px] font-bold text-[#FE7251]">{calculatedIncentives.fciCeilingPct}% of Fixed Capital Investment</p>
                </div>
              </div>

              {/* 4 Financial Subsidies Breakdown */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-white border border-[#F0E5E0] shadow-xs">
                  <div className="flex items-center space-x-2 text-[#9B2A48] mb-1">
                    <Banknote className="w-4 h-4 text-[#FE7251]" />
                    <span className="text-xs font-bold uppercase">SGST IPS Refund</span>
                  </div>
                  <p className="text-xl font-black text-[#16060E]">{calculatedIncentives.sgstIpsRefundPct}%</p>
                  <p className="text-[10px] text-slate-500">Gross SGST refund on first sales</p>
                </div>

                <div className="p-4 rounded-xl bg-white border border-[#F0E5E0] shadow-xs">
                  <div className="flex items-center space-x-2 text-[#9B2A48] mb-1">
                    <Clock className="w-4 h-4 text-[#FE7251]" />
                    <span className="text-xs font-bold uppercase">Eligibility Tenure</span>
                  </div>
                  <p className="text-xl font-black text-[#16060E]">{calculatedIncentives.eligibilityYears} Years</p>
                  <p className="text-[10px] text-slate-500">Max ₹{calculatedIncentives.annualDisbursementCapCr} Cr / Year</p>
                </div>

                <div className="p-4 rounded-xl bg-white border border-[#F0E5E0] shadow-xs">
                  <div className="flex items-center space-x-2 text-[#9B2A48] mb-1">
                    <Zap className="w-4 h-4 text-[#FE7251]" />
                    <span className="text-xs font-bold uppercase">Power Tariff Subsidy</span>
                  </div>
                  <p className="text-xl font-black text-[#16060E]">₹{calculatedIncentives.powerSubsidyRatePerUnit} / unit</p>
                  <p className="text-[10px] text-slate-500">For 3 years from commercial prod.</p>
                </div>

                <div className="p-4 rounded-xl bg-white border border-[#F0E5E0] shadow-xs">
                  <div className="flex items-center space-x-2 text-[#9B2A48] mb-1">
                    <BadgePercent className="w-4 h-4 text-[#FE7251]" />
                    <span className="text-xs font-bold uppercase">Stamp & Electricity Duty</span>
                  </div>
                  <p className="text-xl font-black text-[#16060E]">{calculatedIncentives.stampDutyWaiverPct}% Waiver</p>
                  <p className="text-[10px] text-slate-500">
                    {calculatedIncentives.electricityDutyExempt ? "100% Electricity Duty Exemption" : "Standard duty"}
                  </p>
                </div>
              </div>

              {/* Special Policy Benefits List */}
              {calculatedIncentives.specialPerks && calculatedIncentives.specialPerks.length > 0 && (
                <div className="p-4 bg-[#FFF7F0] rounded-xl border border-[#FED17A]">
                  <h4 className="text-xs font-bold text-[#9B2A48] uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#FE7251]" />
                    <span>Special Sector Provisions ({calculatedIncentives.governingPolicy})</span>
                  </h4>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-slate-700">
                    {calculatedIncentives.specialPerks.map((perk, idx) => (
                      <li key={idx} className="flex items-start space-x-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#9B2A48] mt-0.5 shrink-0" />
                        <span>{perk}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* 2. STATUTORY CLEARANCES & DAG WORKFLOW */}
          <div className="bg-white rounded-2xl border border-[#F0E5E0] shadow-xs overflow-hidden">
            <div className="p-6 border-b border-[#F0E5E0] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-[#16060E]">
                  Mandatory Statutory Clearances Checklist ({storedClearances.length} Approvals)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Generated dynamically under Maharashtra Right to Public Services Act (RTS Act)
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Link
                  href="/dashboard/caf"
                  className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#9B2A48] via-[#FE7251] to-[#FE7251] hover:from-[#7D1E36] hover:to-[#E55B3B] text-white text-xs font-bold shadow-md shadow-[#FE7251]/20 transition-all"
                >
                  <FileText className="w-4 h-4" />
                  <span>Fill Unified CAF (One-Form)</span>
                </Link>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#FFF9F5] text-[#9B2A48] uppercase tracking-wider font-bold border-b border-[#F0E5E0]">
                    <th className="py-3 px-4">Approval Name & Stage</th>
                    <th className="py-3 px-4">Competent Department</th>
                    <th className="py-3 px-4 text-center">Statutory SLA</th>
                    <th className="py-3 px-4 text-center">Deemed Approval</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0E5E0]">
                  {storedClearances.map((c, i) => (
                    <tr key={c.id || i} className="hover:bg-[#FFFDFC] transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-[#16060E]">{c.name}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">{c.description}</div>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-700">{c.department}</td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-[#FFF2DF] text-[#9B2A48] font-bold text-[11px] border border-[#FED17A]">
                          <Clock className="w-3 h-3 text-[#FE7251]" />
                          <span>{c.slaDays} Days</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-bold text-[10px] border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Guaranteed</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Link
                          href={`/apply/${c.id}`}
                          className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-[#9B2A48] hover:bg-[#7D1E36] text-white font-bold text-[11px] transition-colors"
                        >
                          <span>Apply</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

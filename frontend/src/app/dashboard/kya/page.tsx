"use client";

import React, { useState, useEffect, useCallback } from "react";
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
  FolderLock,
  Utensils,
  Store,
} from "lucide-react";
import {
  useEnterpriseStore,
  RiskTrack,
  SectorType,
  ClearanceItem,
} from "@/store/enterpriseStore";
import { useNotificationStore } from "@/store/notificationStore";
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

const BACKEND_API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

// --- Official Sector Options based on Government Resolutions ---
const sectorOptions = [
  {
    value: "agro_food_processing",
    label: "Food Processing, Restaurants & QSR",
    description: "Fast food restaurants, cloud kitchens, bakeries, food processing, cold chain.",
    icon: Utensils,
    policyTag: "PSI 2019 (Thrust Sector)",
    policyGr: "PSI-2019/CR 46/IND-8",
    defaults: { capexCr: 2, power: 35, water: 10, workforce: 25, height: 8, boiler: false, hazard: "Green" as const },
  },
  {
    value: "services_retail",
    label: "Commercial & Retail Establishments",
    description: "Retail showrooms, commercial offices, hospitality, service centers.",
    icon: Store,
    policyTag: "Shops & Est Act 2017",
    policyGr: "Labour Dept Notification",
    defaults: { capexCr: 1.5, power: 25, water: 5, workforce: 15, height: 9, boiler: false, hazard: "Green" as const },
  },
  {
    value: "ev_manufacturing",
    label: "Electric Vehicle & Battery Ecosystem",
    description: "BEV assembly, ACC battery gigafactories, charging stations, components.",
    icon: Zap,
    policyTag: "Maharashtra EV Policy 2021",
    policyGr: "MSEVP-2021/CR 25/TC-4",
    defaults: { capexCr: 45, power: 300, water: 25, workforce: 140, height: 12, boiler: false, hazard: "Green" as const },
  },
  {
    value: "fintech",
    label: "FinTech & Digital Financial Services",
    description: "Payment gateways, RegTech, blockchain DLT, cloud banking, sandbox pilots.",
    icon: Landmark,
    policyTag: "Maharashtra FinTech Policy 2018",
    policyGr: "DIT-2018/CR 17/D-1/39",
    defaults: { capexCr: 8, power: 40, water: 5, workforce: 60, height: 12, boiler: false, hazard: "White" as const },
  },
  {
    value: "logistics_warehousing",
    label: "Logistics, Cold Chain & Warehousing",
    description: "Integrated logistics parks, silos, multi-storey hubs, smart warehouses.",
    icon: Truck,
    policyTag: "Maharashtra Logistics Policy 2024",
    policyGr: "Industries Dept Resolution 2024",
    defaults: { capexCr: 30, power: 120, water: 15, workforce: 80, height: 14, boiler: false, hazard: "Green" as const },
  },
  {
    value: "textiles_garmenting",
    label: "Textiles, Spinning & Technical Textiles",
    description: "Ginning, weaving, knitting, non-conventional yarn (bamboo/banana), apparel.",
    icon: Layers,
    policyTag: "State Textile Policy 2018-23",
    policyGr: "Policy 2017/CR 6/Text-5",
    defaults: { capexCr: 25, power: 200, water: 30, workforce: 150, height: 10, boiler: true, hazard: "Orange" as const },
  },
  {
    value: "green_energy_biofuel",
    label: "Green Energy, Solar & Bio-Fuel Production",
    description: "Solar farms, green hydrogen, ethanol distillation, biomass power.",
    icon: Leaf,
    policyTag: "PSI 2019 (Thrust Sector)",
    policyGr: "PSI-2019/CR 46/IND-8",
    defaults: { capexCr: 60, power: 100, water: 40, workforce: 50, height: 10, boiler: true, hazard: "Orange" as const },
  },
  {
    value: "aerospace_defence",
    label: "Aerospace & Defence Manufacturing",
    description: "OEM weapons, avionics, ammunition, MRO facilities, UAVs & radar gear.",
    icon: Plane,
    policyTag: "Aerospace & Defence Policy 2018",
    policyGr: "IDL-2017/CR 188/IND-2",
    defaults: { capexCr: 100, power: 500, water: 50, workforce: 250, height: 16, boiler: false, hazard: "Orange" as const },
  },
  {
    value: "industry_4_0_ai",
    label: "Industry 4.0, Robotics & AI Hub",
    description: "IoT hardware, 3D printing, advanced robotics, nanotechnology, sensors.",
    icon: Cpu,
    policyTag: "PSI 2019 (Thrust Sector)",
    policyGr: "PSI-2019/CR 46/IND-8",
    defaults: { capexCr: 15, power: 80, water: 10, workforce: 75, height: 10, boiler: false, hazard: "White" as const },
  },
  {
    value: "general_manufacturing",
    label: "General Industrial Engineering & Chemicals",
    description: "Specialty chemicals, steel fabrication, heavy machinery, plastics.",
    icon: Factory,
    policyTag: "PSI 2019 Standard Matrix",
    policyGr: "PSI-2019/CR 46/IND-8",
    defaults: { capexCr: 50, power: 350, water: 60, workforce: 180, height: 14, boiler: true, hazard: "Red" as const },
  },
];

function resolveInitialSectorKey(storedSector?: string, masterSectorKey?: string): string {
  if (masterSectorKey && sectorOptions.some((s) => s.value === masterSectorKey)) {
    return masterSectorKey;
  }
  if (storedSector) {
    const sLow = storedSector.toLowerCase();
    if (sLow.includes("food") || sLow.includes("restaurant") || sLow.includes("qsr") || sLow.includes("agro")) return "agro_food_processing";
    if (sLow.includes("retail") || sLow.includes("commercial") || sLow.includes("shop")) return "services_retail";
    if (sLow.includes("ev") || sLow.includes("electric") || sLow.includes("battery")) return "ev_manufacturing";
    if (sLow.includes("fintech") || sLow.includes("digital") || sLow.includes("software") || sLow.includes("it")) return "fintech";
    if (sLow.includes("logistics") || sLow.includes("warehouse") || sLow.includes("cold chain")) return "logistics_warehousing";
    if (sLow.includes("textile") || sLow.includes("garment") || sLow.includes("spinning")) return "textiles_garmenting";
    if (sLow.includes("green") || sLow.includes("solar") || sLow.includes("biofuel")) return "green_energy_biofuel";
    if (sLow.includes("aerospace") || sLow.includes("defence")) return "aerospace_defence";
    if (sLow.includes("robotics") || sLow.includes("ai")) return "industry_4_0_ai";
    if (sLow.includes("chemical") || sLow.includes("engineering") || sLow.includes("manufacturing")) return "general_manufacturing";
  }
  return "agro_food_processing";
}

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
    masterCAF,
    setFormData,
    updateMasterCAF,
    setAssessmentResult,
    resetAssessment,
  } = useEnterpriseStore();
  const { t } = useLanguage();

  const initialSectorKey = resolveInitialSectorKey(storedSector, masterCAF?.projectSpecs?.industryType);
  const matchedSectorOption = sectorOptions.find((s) => s.value === initialSectorKey) || sectorOptions[0];

  const [currentStep, setCurrentStep] = useState(1);
  const [selectedSectorKey, setSelectedSectorKey] = useState<string>(initialSectorKey);
  const [selectedDistrict, setSelectedDistrict] = useState<string>(storedDistrict || masterCAF?.locationDetails?.district || "Pune");
  const [selectedTaluka, setSelectedTaluka] = useState<string>(storedTaluka || masterCAF?.locationDetails?.taluka || "Khed (Chakan PMR)");
  const [locationZone, setLocationZone] = useState<string>(storedLocation || masterCAF?.locationDetails?.midcZoneName || "Pune Industrial & Commercial Zone");

  const [capexCr, setCapexCr] = useState<number>(storedCapex ?? matchedSectorOption.defaults.capexCr);
  const [powerLoadKva, setPowerLoadKva] = useState<number>(storedPower ?? matchedSectorOption.defaults.power);
  const [waterDemandKld, setWaterDemandKld] = useState<number>(storedWater ?? matchedSectorOption.defaults.water);
  const [workforceSize, setWorkforceSize] = useState<number>(storedWorkforce ?? matchedSectorOption.defaults.workforce);
  const [isExpansion, setIsExpansion] = useState<boolean>(false);
  const [boilerInstalled, setBoilerInstalled] = useState<boolean>(matchedSectorOption.defaults.boiler);
  const [buildingHeightMeters, setBuildingHeightMeters] = useState<number>(matchedSectorOption.defaults.height);

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

  // When sector changes, dynamically adjust parameters to realistic defaults for that sector
  const handleSelectSector = (sectorKey: string) => {
    setSelectedSectorKey(sectorKey);
    const sec = sectorOptions.find((s) => s.value === sectorKey);
    if (sec) {
      setCapexCr(sec.defaults.capexCr);
      setPowerLoadKva(sec.defaults.power);
      setWaterDemandKld(sec.defaults.water);
      setWorkforceSize(sec.defaults.workforce);
      setBuildingHeightMeters(sec.defaults.height);
      setBoilerInstalled(sec.defaults.boiler);
    }
  };

  // When district changes, fetch talukas from backend with local fallback
  const handleDistrictChange = useCallback(async (newDistrict: string) => {
    setSelectedDistrict(newDistrict);
    try {
      const res = await fetch(`${BACKEND_API_URL}/rules/talukas/${encodeURIComponent(newDistrict)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.talukas && data.talukas.length > 0) {
          setSelectedTaluka(data.talukas[0].name);
          setLocationZone(`${data.talukas[0].name} Zone (${newDistrict})`);
          return;
        }
      }
    } catch {
      // fallback to local data
    }
    const distObj = MAHARASHTRA_DISTRICT_TALUKAS.find((d) => d.district.toLowerCase() === newDistrict.toLowerCase());
    if (distObj && distObj.talukas.length > 0) {
      setSelectedTaluka(distObj.talukas[0].name);
      setLocationZone(`${distObj.talukas[0].name} Zone (${distObj.district})`);
    }
  }, []);

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

  const handleRunAssessment = async () => {
    let incentivesResult: CalculatedIncentives;
    let dagResult: GeneratedWorkflowDAG;

    // Determine hazard category for statutory workflow
    let hazardCategory: "Red" | "Orange" | "Green" | "White" = "Green";
    if (selectedSectorKey === "general_manufacturing") {
      hazardCategory = capexCr > 50 ? "Red" : "Orange";
    } else if (selectedSectorKey === "aerospace_defence") {
      hazardCategory = capexCr > 50 ? "Red" : "Orange";
    } else if (selectedSectorKey === "textiles_garmenting" || selectedSectorKey === "green_energy_biofuel") {
      hazardCategory = "Orange";
    } else if (selectedSectorKey === "fintech" || selectedSectorKey === "industry_4_0_ai") {
      hazardCategory = "White";
    }

    // 1. Try backend /api/rules/evaluate first, fall back to local engine
    try {
      const [evaluateRes, workflowRes] = await Promise.all([
        fetch(`${BACKEND_API_URL}/rules/evaluate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sector: selectedSectorKey,
            district: selectedDistrict,
            taluka: selectedTaluka,
            capexCr,
            workforceSize,
            powerLoadKw: powerLoadKva,
            isExpansion,
          }),
        }),
        fetch(`${BACKEND_API_URL}/rules/workflow`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sector: selectedSectorKey,
            hazardCategory,
            powerLoadKw: powerLoadKva,
            buildingHeightMeters,
            occupantsCount: workforceSize,
            boilerInstalled,
            isMidcLand: true,
          }),
        }),
      ]);

      if (evaluateRes.ok && workflowRes.ok) {
        const evalData = await evaluateRes.json();
        const wfData = await workflowRes.json();
        if (evalData.success && wfData.success) {
          incentivesResult = evalData.data as CalculatedIncentives;
          dagResult = wfData.data as GeneratedWorkflowDAG;
        } else {
          throw new Error("Backend returned non-success status");
        }
      } else {
        throw new Error("Backend rules endpoints returned error");
      }
    } catch {
      // Fallback to local rules engines
      incentivesResult = evaluatePolicyIncentives({
        sector: selectedSectorKey,
        district: selectedDistrict,
        taluka: selectedTaluka,
        capexCr,
        workforceSize,
        powerLoadKw: powerLoadKva,
        isExpansion,
      });
      dagResult = generateClearanceWorkflow({
        sector: selectedSectorKey,
        hazardCategory,
        powerLoadKw: powerLoadKva,
        buildingHeightMeters,
        occupantsCount: workforceSize,
        boilerInstalled,
        isMidcLand: true,
      });
    }


    const storeClearances: ClearanceItem[] = dagResult.clearances.map((c) => ({
      id: c.id,
      name: c.name,
      department: c.department,
      slaDays: c.slaDays,
      category:
        c.category === "pre_operation"
          ? "Pre-Operation"
          : c.category === "environmental"
          ? "Pre-Establishment"
          : "Pre-Establishment",
      mandatory: true,
      description: `${c.statutoryAct} compliance. Statutory SLA: ${c.slaDays} days under Maharashtra RTS Act.`,
      feeEstimate:
        c.approvalSlug === "fssai-food-license"
          ? "₹2,000 - ₹7,500"
          : c.approvalSlug === "gumasta-license"
          ? "₹0 - ₹1,500"
          : capexCr > 50
          ? "₹1,50,000"
          : capexCr > 10
          ? "₹75,000"
          : "₹25,000",
      approvalSlug: c.approvalSlug || c.id,
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

    // Save to global store & sync Master CAF
    const selectedOption = sectorOptions.find((s) => s.value === selectedSectorKey);
    const sectorDisplay = (selectedOption ? selectedOption.label : "Food Processing, Restaurants & QSR") as SectorType;

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

    updateMasterCAF({
      locationDetails: {
        ...masterCAF.locationDetails,
        district: selectedDistrict,
        taluka: selectedTaluka,
        midcZoneName: locationZone,
      },
      projectSpecs: {
        ...masterCAF.projectSpecs,
        industryType: selectedSectorKey,
        sector: sectorDisplay,
        capitalInvestmentInr: capexCr * 10000000,
        powerRequirementKw: powerLoadKva,
        waterRequirementKlpd: waterDemandKld,
        hazardCategory,
        maxBuildingHeightMeters: buildingHeightMeters,
        totalOccupants: workforceSize,
      },
    });

    setAssessmentResult(riskTrack, storeClearances, incentiveSummaryList, incentivesResult);
    setShowResult(true);

    // Persist assessed enterprise profile to backend (non-blocking)
    fetch(`${BACKEND_API_URL}/enterprise`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sector: selectedSectorKey,
        location_zone: locationZone,
        capex_cr: capexCr,
        power_load_kva: powerLoadKva,
        water_demand_kld: waterDemandKld,
        workforce_size: workforceSize,
        risk_track: riskTrack,
        is_assessed: true,
      }),
    }).catch(() => {/* non-blocking */});

    // Trigger KYA Assessment Generated Notification
    useNotificationStore.getState().addNotification({
      type: "kya",
      title: "KYA Assessment Completed 📋",
      message: `Identified ${storeClearances.length} statutory clearances for ${sectorDisplay} in ${selectedDistrict}. Eligible for Category '${incentivesResult.category}' subsidies.`,
      severity: "success",
      target: "/dashboard/caf",
    });
  };


  const handleReset = () => {
    resetAssessment();
    setShowResult(false);
    setCurrentStep(1);
    setCalculatedIncentives(null);
    setWorkflowDAG(null);
  };

  return (
    <div className="space-y-6 pb-28">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#9B2A48]/10 text-[#9B2A48] border border-[#9B2A48]/20">
              Statutory Rules Engine
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Know Your Approvals (KYA) & Policy Subsidies
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#16060E] tracking-tight mt-1">
            Know Your Approvals
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-3xl">
            Calculates mandatory statutory approvals, RTS Act deemed approval SLA countdowns, and financial subsidies tailored to your business.
          </p>
        </div>

        {showResult && (
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl border border-[#FED17A] bg-white text-[#9B2A48] hover:bg-[#FFF7F0] text-xs font-bold transition-all shadow-xs shrink-0 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#FE7251]" />
            <span>Re-evaluate Parameters</span>
          </button>
        )}
      </div>

      {/* --- WIZARD FORM VIEW --- */}
      {!showResult ? (
        <div className="bg-white rounded-2xl border border-[#F0E5E0] shadow-xs overflow-hidden">
          {/* Wizard Step Progress Bar */}
          <div className="border-b border-[#F0E5E0] bg-[#FFFDFC] px-4 sm:px-6 py-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
              {[
                { step: 1, label: "1. Line of Business", sub: "Industry Sector" },
                { step: 2, label: "2. Location & Zonal", sub: "Taluka Category" },
                { step: 3, label: "3. Investment & Scale", sub: "FCI & Workforce" },
                { step: 4, label: "4. Utilities & Safety", sub: "Power, Water, Fire" },
              ].map((s) => (
                <div
                  key={s.step}
                  onClick={() => setCurrentStep(s.step)}
                  className={`cursor-pointer pb-2 border-b-2 transition-all ${
                    currentStep === s.step
                      ? "border-[#9B2A48] text-[#9B2A48] font-bold"
                      : currentStep > s.step
                      ? "border-emerald-500 text-emerald-700 font-medium"
                      : "border-transparent text-slate-400 font-normal"
                  }`}
                >
                  <div className="flex items-center justify-center space-x-1">
                    {currentStep > s.step && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                    <span>{s.label}</span>
                  </div>
                  <div className="text-[10px] text-slate-400 hidden md:block">{s.sub}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 sm:p-8">
            {/* STEP 1: LINE OF BUSINESS */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-[#16060E]">Step 1: Select Your Business & Industry Category</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Select the business line you are starting in Maharashtra. Approvals, document checklists, and policy benefits will dynamically adapt.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {sectorOptions.map((opt) => {
                    const IconComp = opt.icon;
                    const isSelected = selectedSectorKey === opt.value;
                    return (
                      <div
                        key={opt.value}
                        onClick={() => handleSelectSector(opt.value)}
                        className={`p-4 rounded-xl border transition-all cursor-pointer text-left flex flex-col justify-between ${
                          isSelected
                            ? "bg-[#FFF7F0] border-[#FE7251] shadow-xs ring-1 ring-[#FE7251]"
                            : "bg-white border-[#F0E5E0] hover:border-[#FED17A] hover:bg-[#FFFDFC]"
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <div
                              className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                                isSelected ? "bg-[#9B2A48] text-white" : "bg-[#FFF9F5] text-[#9B2A48] border border-[#F0E5E0]"
                              }`}
                            >
                              <IconComp className="w-4 h-4" />
                            </div>
                            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-white border border-[#FED17A] text-[#9B2A48]">
                              {opt.policyTag}
                            </span>
                          </div>
                          <h4 className="text-xs font-bold text-[#16060E] line-clamp-1">{opt.label}</h4>
                          <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">{opt.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* STEP 2: LOCATION & ZONAL */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-[#16060E]">Step 2: Choose Establishment Location & District</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Select district and taluka. Package Scheme of Incentives (PSI 2019) categorizes Maharashtra into Groups A, B, C, D, D+, and Aspirational districts.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
                  <div>
                    <label htmlFor="kya-district" className="block text-xs font-bold text-[#16060E] uppercase tracking-wider mb-2">
                      Maharashtra District
                    </label>
                    <select
                      id="kya-district"
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

                  <div>
                    <label htmlFor="kya-taluka" className="block text-xs font-bold text-[#16060E] uppercase tracking-wider mb-2">
                      Taluka / Sub-District
                    </label>
                    <select
                      id="kya-taluka"
                      value={selectedTaluka}
                      onChange={(e) => {
                        setSelectedTaluka(e.target.value);
                        setLocationZone(`${e.target.value} Zone (${selectedDistrict})`);
                      }}
                      className="block w-full px-4 py-3 bg-[#FFFDFC] border border-[#F0E5E0] rounded-xl text-sm font-semibold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#FE7251]"
                    >
                      {currentDistrictObj.talukas.map((t) => (
                        <option key={t.name} value={t.name}>
                          {t.name} (Category {t.category}
                          {t.isNaxal ? " • Naxal" : ""}
                          {t.isAspirational ? " • Aspirational" : ""})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="max-w-2xl">
                  <label htmlFor="kya-zone" className="block text-xs font-bold text-[#16060E] uppercase tracking-wider mb-2">
                    Commercial Area / Industrial Zone Details
                  </label>
                  <input
                    id="kya-zone"
                    type="text"
                    value={locationZone}
                    onChange={(e) => setLocationZone(e.target.value)}
                    placeholder="e.g. FC Road / MIDC Chakan / Kharadi IT Park"
                    className="block w-full px-4 py-3 bg-[#FFFDFC] border border-[#F0E5E0] rounded-xl text-sm font-semibold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#FE7251]"
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
                    Specify proposed setup investment to calculate MSME scale and capital subsidy ceilings.
                  </p>
                </div>

                <div className="max-w-2xl space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label htmlFor="kya-capex" className="text-xs font-bold text-[#16060E] uppercase tracking-wider">
                        Capital Expenditure (Fixed Assets in ₹ Crores)
                      </label>
                      <span className="text-base font-black text-[#9B2A48]">₹{capexCr} Crores</span>
                    </div>
                    <input
                      id="kya-capex"
                      type="range"
                      min={0.5}
                      max={250}
                      step={0.5}
                      value={capexCr}
                      onChange={(e) => setCapexCr(Number(e.target.value))}
                      className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#FE7251]"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-semibold">
                      <span>₹0.5 Cr (Micro/QSR)</span>
                      <span>₹5 Cr (Small)</span>
                      <span>₹25 Cr (Medium)</span>
                      <span>₹100 Cr+ (Mega)</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="kya-workforce" className="block text-xs font-bold text-[#16060E] uppercase tracking-wider mb-2">
                        Direct Employment (Workforce Count)
                      </label>
                      <input
                        id="kya-workforce"
                        type="number"
                        min={1}
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
                    Determine electricity load, water demand, and fire safety triggers.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 bg-[#FFF9F5] rounded-2xl border border-[#F0E5E0]">
                    <div className="flex items-center space-x-2 text-[#9B2A48] mb-2">
                      <Zap className="w-4 h-4 text-[#FE7251]" />
                      <label htmlFor="kya-power" className="text-xs font-bold uppercase tracking-wider text-[#16060E]">
                        Power Load (kW)
                      </label>
                    </div>
                    <input
                      id="kya-power"
                      type="number"
                      min={5}
                      value={powerLoadKva}
                      onChange={(e) => setPowerLoadKva(Number(e.target.value))}
                      className="block w-full px-3 py-2 bg-white border border-[#F0E5E0] rounded-lg text-base font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#FE7251]"
                    />
                    <p className="text-[10px] text-slate-500 mt-1">Commercial / Industrial load</p>
                  </div>

                  <div className="p-4 bg-[#FFF9F5] rounded-2xl border border-[#F0E5E0]">
                    <div className="flex items-center space-x-2 text-[#9B2A48] mb-2">
                      <Droplets className="w-4 h-4 text-[#FE7251]" />
                      <label htmlFor="kya-water" className="text-xs font-bold uppercase tracking-wider text-[#16060E]">
                        Water Demand (KLD)
                      </label>
                    </div>
                    <input
                      id="kya-water"
                      type="number"
                      min={1}
                      value={waterDemandKld}
                      onChange={(e) => setWaterDemandKld(Number(e.target.value))}
                      className="block w-full px-3 py-2 bg-white border border-[#F0E5E0] rounded-lg text-base font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#FE7251]"
                    />
                    <p className="text-[10px] text-slate-500 mt-1">Kilo Liters Per Day</p>
                  </div>

                  <div className="p-4 bg-[#FFF9F5] rounded-2xl border border-[#F0E5E0]">
                    <div className="flex items-center space-x-2 text-[#9B2A48] mb-2">
                      <Flame className="w-4 h-4 text-[#FE7251]" />
                      <label htmlFor="kya-height" className="text-xs font-bold uppercase tracking-wider text-[#16060E]">
                        Building Height (m)
                      </label>
                    </div>
                    <input
                      id="kya-height"
                      type="number"
                      min={3}
                      value={buildingHeightMeters}
                      onChange={(e) => setBuildingHeightMeters(Number(e.target.value))}
                      className="block w-full px-3 py-2 bg-white border border-[#F0E5E0] rounded-lg text-base font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#FE7251]"
                    />
                    <p className="text-[10px] text-slate-500 mt-1">MahaFire Safety NOC</p>
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
                    Commercial Steam Boiler / High Pressure Vessel Installed (Triggers Directorate of Steam Boilers)
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Wizard Footer Navigation */}
          <div className="bg-[#FFF9F5] border-t border-[#F0E5E0] px-6 sm:px-8 py-4 flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={handleBack}
              disabled={currentStep === 1}
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-200 disabled:opacity-30 disabled:pointer-events-none hover:bg-slate-100 transition-all shadow-xs cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            {/* Shift right CTA container to the left with right padding on larger screens to guarantee zero overlap with floating assistant */}
            <div className="flex items-center space-x-3 pr-0 sm:pr-36">
              {currentStep < 4 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="inline-flex items-center space-x-2 px-8 py-3 rounded-xl bg-gradient-to-r from-[#FE7251] to-[#E85E3E] hover:from-[#E85E3E] hover:to-[#D94F2F] text-white text-sm font-black shadow-md hover:shadow-lg transition-all active:scale-[0.98] cursor-pointer"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleRunAssessment}
                  className="inline-flex items-center space-x-2 px-8 py-3 rounded-xl bg-gradient-to-r from-[#FE7251] to-[#E85E3E] hover:from-[#E85E3E] hover:to-[#D94F2F] text-white text-sm font-black shadow-md hover:shadow-lg transition-all active:scale-[0.98] cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Evaluate & Generate Clearances</span>
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* --- KYA EVALUATION RESULTS VIEW --- */
        <div className="space-y-8">
          {/* 1. TOP POLICY & INCENTIVE SUMMARY BANNER */}
          {calculatedIncentives && (
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
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
                    Sector: {storedSector || selectedSectorKey} • Location: {storedLocation || locationZone} • Fixed Capital Investment: ₹{capexCr} Crores
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

          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold">Onboarding complete — your AARAMBH workspace is live</p>
              <p className="text-xs text-emerald-800 mt-0.5">
                This checklist is generated only for <strong>{selectedSectorKey}</strong>. Your dashboard, SLA tracker, DAG pipeline
                and inspections now reflect only these sector-specific approvals and incentives.
              </p>
            </div>
          </div>

          {/* 2. STATUTORY CLEARANCES & DAG WORKFLOW */}
          <div className="bg-white rounded-2xl border border-[#F0E5E0] shadow-xs overflow-hidden">
            <div className="p-6 border-b border-[#F0E5E0] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-[#16060E]">
                  Mandatory Statutory Clearances Checklist ({storedClearances.length} Approvals)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Generated dynamically under Maharashtra Right to Public Services Act (RTS Act) for {storedSector || selectedSectorKey}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-[#FE7251] hover:bg-[#E85E3E] text-white text-xs font-bold shadow-xs transition-colors"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Go to Dashboard</span>
                </Link>

                <Link
                  href="/dashboard/vault"
                  className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-[#FFF2DF] hover:bg-[#FFE6C4] border border-[#FED17A] text-[#9B2A48] text-xs font-bold transition-all"
                >
                  <FolderLock className="w-3.5 h-3.5 text-[#FE7251]" />
                  <span>Upload Vault Dossier</span>
                </Link>

                <Link
                  href="/dashboard/dag"
                  className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all"
                >
                  <Layers className="w-3.5 h-3.5 text-[#9B2A48]" />
                  <span>DAG Pipeline</span>
                </Link>

                <Link
                  href="/dashboard/caf"
                  className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-[#FE7251] hover:bg-[#E85E3E] text-white text-xs font-bold shadow-xs transition-colors"
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
                          href={`/apply/${c.approvalSlug || c.id}`}
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

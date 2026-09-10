import { generateClearanceWorkflow } from "@/data/workflowRuleEngine";
import { evaluatePolicyIncentives } from "@/data/policyRulesEngine";
import type { ClearanceItem, RiskTrack } from "@/store/enterpriseStore";

export interface SampleProfileParams {
  sectorKey: string;
  displaySector: string;
  label: string;
  hint: string;
  capexCr: number;
  powerLoadKva: number;
  waterDemandKld: number;
  workforceSize: number;
  buildingHeightMeters: number;
  boilerInstalled: boolean;
  district: string;
  taluka: string;
  locationZone: string;
}

export interface SampleAssessment {
  riskTrack: RiskTrack;
  clearances: ClearanceItem[];
  incentives: string[];
  policyDetails: ReturnType<typeof evaluatePolicyIncentives>;
  formData: {
    sector: string;
    locationZone: string;
    district: string;
    taluka: string;
    capexCr: number;
    powerLoadKva: number;
    waterDemandKld: number;
    workforceSize: number;
  };
}

export const SAMPLE_PROFILES: SampleProfileParams[] = [
  {
    sectorKey: "ev_manufacturing",
    displaySector: "Electric Vehicle & Battery Ecosystem",
    label: "Electric Vehicles & Batteries",
    hint: "BEV assembly, ACC gigafactory",
    capexCr: 45,
    powerLoadKva: 300,
    waterDemandKld: 25,
    workforceSize: 140,
    buildingHeightMeters: 12,
    boilerInstalled: false,
    district: "Pune",
    taluka: "Khed (Chakan PMR)",
    locationZone: "Pune Industrial & Commercial Zone",
  },
  {
    sectorKey: "industry_4_0_ai",
    displaySector: "Industry 4.0, Robotics & AI Hub",
    label: "Industry 4.0 / AI-ITeS",
    hint: "IoT hardware, robotics, AI services",
    capexCr: 15,
    powerLoadKva: 80,
    waterDemandKld: 10,
    workforceSize: 75,
    buildingHeightMeters: 10,
    boilerInstalled: false,
    district: "Pune",
    taluka: "Hinjawadi",
    locationZone: "Pune Industrial & Commercial Zone",
  },
  {
    sectorKey: "agro_food_processing",
    displaySector: "Food Processing, Restaurants & QSR",
    label: "Food Processing & QSR",
    hint: "Cloud kitchen, ready-to-eat plant",
    capexCr: 2,
    powerLoadKva: 35,
    waterDemandKld: 10,
    workforceSize: 25,
    buildingHeightMeters: 8,
    boilerInstalled: false,
    district: "Pune",
    taluka: "Khed (Chakan PMR)",
    locationZone: "Pune Industrial & Commercial Zone",
  },
];

function resolveHazardCategory(sectorKey: string, capexCr: number): "Red" | "Orange" | "Green" | "White" {
  if (sectorKey === "general_manufacturing" || sectorKey === "aerospace_defence") {
    return capexCr > 50 ? "Red" : "Orange";
  }
  if (sectorKey === "textiles_garmenting" || sectorKey === "green_energy_biofuel") return "Orange";
  if (sectorKey === "fintech" || sectorKey === "industry_4_0_ai") return "White";
  if (
    sectorKey === "agro_food_processing" ||
    sectorKey === "services_retail" ||
    sectorKey === "ev_manufacturing" ||
    sectorKey === "logistics_warehousing"
  ) {
    return "Green";
  }
  return "Green";
}

export function buildSampleAssessment(profile: SampleProfileParams): SampleAssessment {
  const hazardCategory = resolveHazardCategory(profile.sectorKey, profile.capexCr);

  const incentivesResult = evaluatePolicyIncentives({
    sector: profile.sectorKey,
    district: profile.district,
    taluka: profile.taluka,
    capexCr: profile.capexCr,
    workforceSize: profile.workforceSize,
    powerLoadKw: profile.powerLoadKva,
    isExpansion: false,
  });

  const dagResult = generateClearanceWorkflow({
    sector: profile.sectorKey,
    hazardCategory,
    powerLoadKw: profile.powerLoadKva,
    buildingHeightMeters: profile.buildingHeightMeters,
    occupantsCount: profile.workforceSize,
    boilerInstalled: profile.boilerInstalled,
    isMidcLand: true,
  });

  const clearances: ClearanceItem[] = dagResult.clearances.map((c) => ({
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
        : profile.capexCr > 50
        ? "₹1,50,000"
        : profile.capexCr > 10
        ? "₹75,000"
        : "₹25,000",
    approvalSlug: c.approvalSlug || c.id,
  }));

  const riskTrack: RiskTrack = hazardCategory === "Red" ? "red" : hazardCategory === "Orange" ? "orange" : "green";

  const incentives = [
    `${incentivesResult.governingPolicy} - Category ${incentivesResult.category} (${incentivesResult.scale})`,
    `Capital Subsidy Ceiling: ${incentivesResult.fciCeilingPct}% of FCI (Up to ₹${incentivesResult.maxIncentiveAmountCr} Crores)`,
    `Eligibility Period: ${incentivesResult.eligibilityYears} Years (Disbursement Cap: ₹${incentivesResult.annualDisbursementCapCr} Cr/yr)`,
    `Industrial Promotion Subsidy (IPS): ${incentivesResult.sgstIpsRefundPct}% Gross SGST Refund`,
    `Power Tariff Subsidy: ₹${incentivesResult.powerSubsidyRatePerUnit}/unit for 3 Years`,
    `Stamp Duty Exemption: ${incentivesResult.stampDutyWaiverPct}% on Land Lease & Term Loans`,
    `Electricity Duty: ${incentivesResult.electricityDutyExempt ? "100% Exempted" : "Standard Tariff"}`,
  ];

  return {
    riskTrack,
    clearances,
    incentives,
    policyDetails: incentivesResult,
    formData: {
      sector: profile.displaySector,
      locationZone: profile.locationZone,
      district: profile.district,
      taluka: profile.taluka,
      capexCr: profile.capexCr,
      powerLoadKva: profile.powerLoadKva,
      waterDemandKld: profile.waterDemandKld,
      workforceSize: profile.workforceSize,
    },
  };
}
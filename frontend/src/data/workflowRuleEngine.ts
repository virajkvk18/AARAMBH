/**
 * FRONTEND MAHARASHTRA STATUTORY CLEARANCE WORKFLOW & COMPLIANCE ENGINE
 */

export interface ClearanceRuleItem {
  id: string;
  name: string;
  department: string;
  category: "pre_establishment" | "pre_operation" | "post_operation" | "environmental" | "safety";
  slaDays: number;
  deemedApprovalApplicable: boolean;
  requiredForHazard: ("Red" | "Orange" | "Green" | "White")[];
  minPowerKw?: number;
  minBoilerInstalled?: boolean;
  minBuildingHeightMeters?: number;
  minOccupants?: number;
  dependencies: string[];
  mandatoryDocuments: string[];
  statutoryAct: string;
  officialPortal: string;
}

export const MASTER_STATUTORY_CLEARANCE_RULES: ClearanceRuleItem[] = [
  {
    id: "midc_land_allotment",
    name: "MIDC Land Allotment & Plot Possession Order",
    department: "Maharashtra Industrial Development Corporation",
    category: "pre_establishment",
    slaDays: 15,
    deemedApprovalApplicable: true,
    requiredForHazard: ["Red", "Orange", "Green", "White"],
    dependencies: [],
    mandatoryDocuments: ["Project Report", "Board Resolution", "PAN / CIN"],
    statutoryAct: "MIDC Act 1961",
    officialPortal: "https://midcindia.org",
  },
  {
    id: "mpcb_cte",
    name: "MPCB Consent to Establish (CTE)",
    department: "Maharashtra Pollution Control Board",
    category: "environmental",
    slaDays: 30,
    deemedApprovalApplicable: true,
    requiredForHazard: ["Red", "Orange", "Green"],
    dependencies: ["midc_land_allotment"],
    mandatoryDocuments: ["Site Layout Plan", "ETP/STP Scheme", "Manufacturing Process Flow", "Water Balance Sheet"],
    statutoryAct: "Water Act 1974 & Air Act 1981",
    officialPortal: "https://ecmpcb.in",
  },
  {
    id: "fire_provisional_noc",
    name: "MahaFire Provisional Fire Safety NOC",
    department: "Directorate of Maharashtra Fire Services",
    category: "safety",
    slaDays: 21,
    deemedApprovalApplicable: true,
    requiredForHazard: ["Red", "Orange", "Green", "White"],
    minBuildingHeightMeters: 9,
    dependencies: ["midc_land_allotment"],
    mandatoryDocuments: ["Architectural Building Plan", "Fire Fighting Layout", "Water Storage Tank Blueprint"],
    statutoryAct: "Maharashtra Fire Prevention and Life Safety Measures Act, 2006",
    officialPortal: "https://mahafireservice.gov.in",
  },
  {
    id: "dish_factory_plan",
    name: "DISH Factory Building Plan Approval",
    department: "Directorate of Industrial Safety and Health",
    category: "safety",
    slaDays: 30,
    deemedApprovalApplicable: true,
    requiredForHazard: ["Red", "Orange", "Green", "White"],
    minOccupants: 10,
    dependencies: ["fire_provisional_noc", "mpcb_cte"],
    mandatoryDocuments: ["Machinery Layout Plan", "Material Safety Data Sheets (MSDS)", "Ventilation & Lighting Plan"],
    statutoryAct: "Factories Act, 1948 & Maharashtra Factories Rules, 1963",
    officialPortal: "https://dish.maharashtra.gov.in",
  },
  {
    id: "msedcl_power_sanction",
    name: "MSEDCL High Tension Power Load Sanction",
    department: "Maharashtra State Electricity Distribution Co. Ltd.",
    category: "pre_establishment",
    slaDays: 21,
    deemedApprovalApplicable: true,
    requiredForHazard: ["Red", "Orange", "Green", "White"],
    minPowerKw: 50,
    dependencies: ["midc_land_allotment"],
    mandatoryDocuments: ["Single Line Electrical Diagram", "Connected Load List", "Substation Space Layout"],
    statutoryAct: "Electricity Act, 2003",
    officialPortal: "https://mahadiscom.in",
  },
  {
    id: "midc_water_connection",
    name: "MIDC Industrial Water Supply Allotment",
    department: "Maharashtra Industrial Development Corporation",
    category: "pre_establishment",
    slaDays: 14,
    deemedApprovalApplicable: true,
    requiredForHazard: ["Red", "Orange", "Green", "White"],
    dependencies: ["midc_land_allotment"],
    mandatoryDocuments: ["Water Demand Calculation", "Internal Plumbing Layout", "Effluent Recirculation Plan"],
    statutoryAct: "MIDC Water Supply Regulations",
    officialPortal: "https://midcindia.org",
  },
  {
    id: "boiler_registration",
    name: "Steam Boiler & Pipeline Registration",
    department: "Directorate of Steam Boilers, Maharashtra",
    category: "safety",
    slaDays: 21,
    deemedApprovalApplicable: false,
    requiredForHazard: ["Red", "Orange"],
    minBoilerInstalled: true,
    dependencies: ["dish_factory_plan"],
    mandatoryDocuments: ["IBR Boiler Design Certificate", "Welder Test Certificates", "Steam Pipeline Isometric Drawings"],
    statutoryAct: "Indian Boilers Act, 1923",
    officialPortal: "https://mahaboiler.gov.in",
  },
  {
    id: "mpcb_cto",
    name: "MPCB Consent to Operate (CTO)",
    department: "Maharashtra Pollution Control Board",
    category: "pre_operation",
    slaDays: 30,
    deemedApprovalApplicable: true,
    requiredForHazard: ["Red", "Orange", "Green"],
    dependencies: ["mpcb_cte", "dish_factory_plan", "fire_provisional_noc"],
    mandatoryDocuments: ["ETP Commissioning Report", "Stack Monitoring Analysis", "Environmental Audit Clearance"],
    statutoryAct: "Water Act 1974 & Air Act 1981",
    officialPortal: "https://ecmpcb.in",
  },
  {
    id: "fire_final_noc",
    name: "MahaFire Final Fire Safety NOC & Occupancy Certificate",
    department: "Directorate of Maharashtra Fire Services",
    category: "pre_operation",
    slaDays: 15,
    deemedApprovalApplicable: true,
    requiredForHazard: ["Red", "Orange", "Green", "White"],
    dependencies: ["fire_provisional_noc"],
    mandatoryDocuments: ["Form A / B from Licensed Fire Agency", "Hydrant & Sprinkler Test Certificate", "Pump Flow Test"],
    statutoryAct: "Maharashtra Fire Prevention and Life Safety Measures Act, 2006",
    officialPortal: "https://mahafireservice.gov.in",
  },
  {
    id: "dish_factory_license",
    name: "DISH Factory Commercial Operating License (Form 4)",
    department: "Directorate of Industrial Safety and Health",
    category: "pre_operation",
    slaDays: 15,
    deemedApprovalApplicable: true,
    requiredForHazard: ["Red", "Orange", "Green", "White"],
    dependencies: ["dish_factory_plan", "mpcb_cto", "fire_final_noc"],
    mandatoryDocuments: ["Notice of Occupation (Form 2)", "Safety Officer Appointment Order", "Emergency Preparedness Plan"],
    statutoryAct: "Factories Act, 1948",
    officialPortal: "https://dish.maharashtra.gov.in",
  },
];

export interface WorkflowEvaluationInput {
  sector: string;
  hazardCategory: "Red" | "Orange" | "Green" | "White";
  powerLoadKw: number;
  buildingHeightMeters: number;
  occupantsCount: number;
  boilerInstalled: boolean;
  isMidcLand: boolean;
}

export interface GeneratedWorkflowDAG {
  clearances: ClearanceRuleItem[];
  parallelCriticalPathDays: number;
  sequentialLeadTimeDays: number;
  timeSavingsDays: number;
  deemedApprovalGuaranteedCount: number;
  dagStages: {
    stageNumber: number;
    stageName: string;
    clearanceIds: string[];
    isParallel: boolean;
  }[];
}

export function generateClearanceWorkflow(input: WorkflowEvaluationInput): GeneratedWorkflowDAG {
  const filtered = MASTER_STATUTORY_CLEARANCE_RULES.filter((rule) => {
    if (!rule.requiredForHazard.includes(input.hazardCategory)) return false;
    if (rule.minPowerKw && input.powerLoadKw < rule.minPowerKw) return false;
    if (rule.minBoilerInstalled && !input.boilerInstalled) return false;
    if (rule.minBuildingHeightMeters && input.buildingHeightMeters < rule.minBuildingHeightMeters) return false;
    if (rule.minOccupants && input.occupantsCount < rule.minOccupants) return false;
    return true;
  });

  const sequentialLeadTimeDays = filtered.reduce((sum, r) => sum + r.slaDays, 0);

  const stage1 = filtered.filter((r) => r.dependencies.length === 0);
  const stage2 = filtered.filter((r) => r.dependencies.length > 0 && r.category !== "pre_operation");
  const stage3 = filtered.filter((r) => r.category === "pre_operation");

  const parallelCriticalPathDays = Math.max(
    stage1.reduce((max, r) => Math.max(max, r.slaDays), 0) +
    stage2.reduce((max, r) => Math.max(max, r.slaDays), 0) +
    stage3.reduce((max, r) => Math.max(max, r.slaDays), 0),
    21
  );

  const deemedApprovalGuaranteedCount = filtered.filter((r) => r.deemedApprovalApplicable).length;

  return {
    clearances: filtered,
    parallelCriticalPathDays,
    sequentialLeadTimeDays,
    timeSavingsDays: Math.max(0, sequentialLeadTimeDays - parallelCriticalPathDays),
    deemedApprovalGuaranteedCount,
    dagStages: [
      {
        stageNumber: 1,
        stageName: "Stage 1: Land & Site Possession",
        clearanceIds: stage1.map((r) => r.id),
        isParallel: false,
      },
      {
        stageNumber: 2,
        stageName: "Stage 2: Parallel Pre-Establishment Clearances (MPCB + Fire + Utilities)",
        clearanceIds: stage2.map((r) => r.id),
        isParallel: true,
      },
      {
        stageNumber: 3,
        stageName: "Stage 3: Pre-Operation Inspection & Consent to Operate",
        clearanceIds: stage3.map((r) => r.id),
        isParallel: true,
      },
    ],
  };
}

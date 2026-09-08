/**
 * FRONTEND MAHARASHTRA STATUTORY CLEARANCE WORKFLOW & COMPLIANCE ENGINE
 * Dynamically evaluates clearances, dependencies, and SLAs based on:
 * - Enterprise Sector (Food, FinTech, Logistics, EV, Textiles, Aerospace, Green Energy, General Manufacturing, Retail Services)
 * - Hazard Categorization (Red / Orange / Green / White)
 * - Scale, Power, Boiler, Building Height, and Workforce parameters
 */

export interface ClearanceRuleItem {
  id: string;
  name: string;
  department: string;
  category: "pre_establishment" | "pre_operation" | "post_operation" | "environmental" | "safety" | "utility";
  slaDays: number;
  deemedApprovalApplicable: boolean;
  requiredForHazard: ("Red" | "Orange" | "Green" | "White")[];
  applicableSectors?: string[]; // "all" or specific sector keys
  excludedSectors?: string[];
  minPowerKw?: number;
  minBoilerInstalled?: boolean;
  minBuildingHeightMeters?: number;
  minOccupants?: number;
  requiresMidcLand?: boolean;
  dependencies: string[];
  mandatoryDocuments: string[];
  statutoryAct: string;
  officialPortal: string;
  approvalSlug?: string; // Direct /apply/[slug] link if integrated
}

export const MASTER_STATUTORY_CLEARANCE_RULES: ClearanceRuleItem[] = [
  // =========================================================================
  // 1. FOOD & RESTAURANT CLEARANCES
  // =========================================================================
  {
    id: "fssai_food_license",
    name: "FSSAI Food Business License & Registration",
    department: "Food Safety and Standards Authority of India (FDA Maharashtra)",
    category: "pre_operation",
    slaDays: 14,
    deemedApprovalApplicable: true,
    requiredForHazard: ["Green", "White", "Orange", "Red"],
    applicableSectors: ["agro_food_processing", "services_retail", "food", "restaurants"],
    dependencies: ["gumasta_registration", "fire_provisional_noc"],
    mandatoryDocuments: [
      "Kitchen & Dining Floor Blueprint Layout",
      "NABL Potable Water Testing Report (IS:10500)",
      "FoSTaC Food Safety Supervisor Certificate",
      "Premises Possession Proof / Rent Agreement",
      "Food Handler Form-IX Medical Fitness Certificates",
    ],
    statutoryAct: "Food Safety and Standards Act, 2006 & Rules 2011",
    officialPortal: "https://foscos.fssai.gov.in",
    approvalSlug: "fssai-food-license",
  },

  // =========================================================================
  // 2. COMMERCIAL & LABOUR REGISTRATION (GUMASTA)
  // =========================================================================
  {
    id: "gumasta_registration",
    name: "Maharashtra Shops & Establishments Registration (Gumasta)",
    department: "Labour Department, Government of Maharashtra",
    category: "pre_establishment",
    slaDays: 7,
    deemedApprovalApplicable: true,
    requiredForHazard: ["Red", "Orange", "Green", "White"],
    applicableSectors: [
      "agro_food_processing",
      "fintech",
      "logistics_warehousing",
      "services_retail",
      "industry_4_0_ai",
      "textiles_garmenting",
      "general_manufacturing",
      "all",
    ],
    dependencies: [],
    mandatoryDocuments: [
      "Front Photo with Marathi Devanagari Signboard",
      "Business Address Proof (Electricity Bill / Tax Receipt)",
      "Partnership Deed / Incorporation Certificate / Aadhaar",
    ],
    statutoryAct: "Maharashtra Shops & Establishments Act, 2017",
    officialPortal: "https://lms.mahaonline.gov.in",
    approvalSlug: "gumasta-license",
  },

  // =========================================================================
  // 3. MIDC LAND & SITE ALLOTMENT
  // =========================================================================
  {
    id: "midc_land_allotment",
    name: "MIDC Industrial Land Allotment & Building Plan Sanction",
    department: "Maharashtra Industrial Development Corporation (MIDC)",
    category: "pre_establishment",
    slaDays: 15,
    deemedApprovalApplicable: true,
    requiredForHazard: ["Red", "Orange", "Green", "White"],
    applicableSectors: [
      "ev_manufacturing",
      "aerospace_defence",
      "logistics_warehousing",
      "textiles_garmenting",
      "agro_food_processing",
      "green_energy_biofuel",
      "general_manufacturing",
      "industry_4_0_ai",
    ],
    dependencies: [],
    mandatoryDocuments: ["Detailed Project Techno-Economic Report", "Board Resolution", "PAN / CIN Certificate", "Land Use Blueprint"],
    statutoryAct: "Maharashtra Industrial Development Act, 1961",
    officialPortal: "https://midcindia.org",
    approvalSlug: "midc-land-allotment",
  },

  // =========================================================================
  // 4. POLLUTION CONTROL BOARD CLEARANCES (MPCB CTE / CTO)
  // =========================================================================
  {
    id: "mpcb_cte",
    name: "MPCB Consent to Establish (CTE) & Pollution Clearance",
    department: "Maharashtra Pollution Control Board (MPCB)",
    category: "environmental",
    slaDays: 21,
    deemedApprovalApplicable: true,
    requiredForHazard: ["Red", "Orange", "Green"],
    applicableSectors: [
      "ev_manufacturing",
      "general_manufacturing",
      "textiles_garmenting",
      "agro_food_processing",
      "green_energy_biofuel",
      "aerospace_defence",
      "industry_4_0_ai",
    ],
    dependencies: ["midc_land_allotment"],
    mandatoryDocuments: [
      "Site Layout Plan & Drainage Scheme",
      "Effluent Treatment Plant (ETP) / STP Technical Scheme",
      "Manufacturing Process Flow & Emission Details",
      "Water Balance Sheet & Capital Investment CA Certificate",
    ],
    statutoryAct: "Water (Prevention & Control of Pollution) Act 1974 & Air Act 1981",
    officialPortal: "https://ecmpcb.in",
    approvalSlug: "mpcb-consent",
  },
  {
    id: "mpcb_cto",
    name: "MPCB Consent to Operate (CTO)",
    department: "Maharashtra Pollution Control Board (MPCB)",
    category: "pre_operation",
    slaDays: 21,
    deemedApprovalApplicable: true,
    requiredForHazard: ["Red", "Orange", "Green"],
    applicableSectors: [
      "ev_manufacturing",
      "general_manufacturing",
      "textiles_garmenting",
      "agro_food_processing",
      "green_energy_biofuel",
      "aerospace_defence",
      "industry_4_0_ai",
    ],
    dependencies: ["mpcb_cte", "fire_provisional_noc"],
    mandatoryDocuments: [
      "ETP/STP Commissioning & Performance Report",
      "Stack & Ambient Air Quality Analysis Report",
      "Hazardous Waste Disposal Agreement with CHWTSDF",
    ],
    statutoryAct: "Water Act 1974 & Air Act 1981",
    officialPortal: "https://ecmpcb.in",
    approvalSlug: "mpcb-consent",
  },

  // =========================================================================
  // 5. FIRE SAFETY CLEARANCES
  // =========================================================================
  {
    id: "fire_provisional_noc",
    name: "MahaFire Provisional Fire Safety NOC",
    department: "Directorate of Maharashtra Fire Services",
    category: "safety",
    slaDays: 10,
    deemedApprovalApplicable: true,
    requiredForHazard: ["Red", "Orange", "Green", "White"],
    dependencies: [],
    mandatoryDocuments: [
      "Architectural Building & Floor Plan",
      "Hydrant, Hose Reel & Sprinkler Layout Plan",
      "Underground & Overhead Static Water Tank Blueprint",
    ],
    statutoryAct: "Maharashtra Fire Prevention and Life Safety Measures Act, 2006",
    officialPortal: "https://mahafireservice.gov.in",
    approvalSlug: "fire-safety-noc",
  },
  {
    id: "fire_final_noc",
    name: "MahaFire Final Fire Safety NOC & Occupancy Certificate",
    department: "Directorate of Maharashtra Fire Services",
    category: "pre_operation",
    slaDays: 10,
    deemedApprovalApplicable: true,
    requiredForHazard: ["Red", "Orange", "Green", "White"],
    dependencies: ["fire_provisional_noc"],
    mandatoryDocuments: [
      "Form A / Form B Certificate from Licensed Fire Agency",
      "Hydrant, Pump & Alarm System Pressure Test Report",
    ],
    statutoryAct: "Maharashtra Fire Prevention and Life Safety Measures Act, 2006",
    officialPortal: "https://mahafireservice.gov.in",
    approvalSlug: "fire-safety-noc",
  },

  // =========================================================================
  // 6. FACTORY SAFETY & DISH LICENSES
  // =========================================================================
  {
    id: "dish_factory_plan",
    name: "DISH Factory Building & Machinery Plan Approval",
    department: "Directorate of Industrial Safety and Health (DISH)",
    category: "safety",
    slaDays: 21,
    deemedApprovalApplicable: true,
    requiredForHazard: ["Red", "Orange", "Green"],
    applicableSectors: [
      "ev_manufacturing",
      "general_manufacturing",
      "textiles_garmenting",
      "agro_food_processing",
      "green_energy_biofuel",
      "aerospace_defence",
      "industry_4_0_ai",
    ],
    minOccupants: 10,
    dependencies: ["fire_provisional_noc", "mpcb_cte"],
    mandatoryDocuments: [
      "Machinery Layout & Gangway Blueprint",
      "Ventilation, Natural Lighting & Emergency Egress Plan",
      "Schedule of Rated Motive Power (HP)",
    ],
    statutoryAct: "The Factories Act, 1948 & Maharashtra Factories Rules, 1963",
    officialPortal: "https://dish.maharashtra.gov.in",
    approvalSlug: "dish-factory-license",
  },
  {
    id: "dish_factory_license",
    name: "DISH Factory Commercial Operating License (Form 4)",
    department: "Directorate of Industrial Safety and Health (DISH)",
    category: "pre_operation",
    slaDays: 15,
    deemedApprovalApplicable: true,
    requiredForHazard: ["Red", "Orange", "Green"],
    applicableSectors: [
      "ev_manufacturing",
      "general_manufacturing",
      "textiles_garmenting",
      "agro_food_processing",
      "green_energy_biofuel",
      "aerospace_defence",
      "industry_4_0_ai",
    ],
    dependencies: ["dish_factory_plan", "mpcb_cto", "fire_final_noc"],
    mandatoryDocuments: [
      "Notice of Occupation (Form 2)",
      "Safety Officer Appointment Order (if workforce > 250)",
      "On-Site Disaster Management & Fire Mock Drill Log",
    ],
    statutoryAct: "Section 6, The Factories Act, 1948",
    officialPortal: "https://dish.maharashtra.gov.in",
    approvalSlug: "dish-factory-license",
  },

  // =========================================================================
  // 7. UTILITIES (POWER & WATER)
  // =========================================================================
  {
    id: "msedcl_power_sanction",
    name: "MSEDCL High Tension / Commercial Power Load Sanction",
    department: "Maharashtra State Electricity Distribution Co. Ltd. (MSEDCL)",
    category: "pre_establishment",
    slaDays: 14,
    deemedApprovalApplicable: true,
    requiredForHazard: ["Red", "Orange", "Green", "White"],
    minPowerKw: 25,
    dependencies: [],
    mandatoryDocuments: ["Single Line Electrical Diagram", "Connected Machinery Load Schedule", "Transformer Space Allotment"],
    statutoryAct: "Electricity Act, 2003",
    officialPortal: "https://mahadiscom.in",
  },
  {
    id: "midc_water_connection",
    name: "MIDC Industrial Potable Water Supply Allotment",
    department: "Maharashtra Industrial Development Corporation (MIDC)",
    category: "pre_establishment",
    slaDays: 14,
    deemedApprovalApplicable: true,
    requiredForHazard: ["Red", "Orange", "Green"],
    applicableSectors: [
      "ev_manufacturing",
      "general_manufacturing",
      "textiles_garmenting",
      "agro_food_processing",
      "green_energy_biofuel",
      "aerospace_defence",
    ],
    dependencies: ["midc_land_allotment"],
    mandatoryDocuments: ["Water Demand & Consumption Calculation", "Internal Plumbing Blueprint", "Effluent Recirculation Scheme"],
    statutoryAct: "MIDC Water Supply Regulations",
    officialPortal: "https://midcindia.org",
  },

  // =========================================================================
  // 8. BOILER REGISTRATION (STEAM / BIOFUEL / CHEMICALS)
  // =========================================================================
  {
    id: "boiler_registration",
    name: "Steam Boiler & Pipeline Registration",
    department: "Directorate of Steam Boilers, Maharashtra",
    category: "safety",
    slaDays: 21,
    deemedApprovalApplicable: false,
    requiredForHazard: ["Red", "Orange"],
    minBoilerInstalled: true,
    applicableSectors: ["general_manufacturing", "green_energy_biofuel", "textiles_garmenting", "agro_food_processing"],
    dependencies: ["dish_factory_plan"],
    mandatoryDocuments: ["IBR Boiler Design Certificate", "Welder Test Qualifications", "Steam Pipeline Isometric Drawings"],
    statutoryAct: "Indian Boilers Act, 1923",
    officialPortal: "https://mahaboiler.gov.in",
  },

  // =========================================================================
  // 9. FINTECH & STARTUP RECOGNITION
  // =========================================================================
  {
    id: "fintech_startup_recognition",
    name: "Maharashtra State Innovation Society (MSInS) FinTech Hub Recognition",
    department: "Directorate of Information Technology (DIT), Maharashtra",
    category: "pre_establishment",
    slaDays: 10,
    deemedApprovalApplicable: true,
    requiredForHazard: ["White", "Green"],
    applicableSectors: ["fintech", "industry_4_0_ai"],
    dependencies: ["gumasta_registration"],
    mandatoryDocuments: ["DPIIT Startup Recognition Certificate", "Pitch Deck & FinTech Architecture", "CA Certified Net Worth / Turnover"],
    statutoryAct: "Maharashtra FinTech Policy 2018 (GR DIT-2018/CR 17/D-1/39)",
    officialPortal: "https://fintech.maharashtra.gov.in",
  },

  // =========================================================================
  // 10. LOGISTICS & WAREHOUSING ACCREDITATION (WDRA)
  // =========================================================================
  {
    id: "wdra_warehouse_accreditation",
    name: "WDRA Statutory Warehouse Accreditation & Silo Certification",
    department: "Warehousing Development and Regulatory Authority / Food Dept",
    category: "pre_operation",
    slaDays: 14,
    deemedApprovalApplicable: true,
    requiredForHazard: ["Green", "White", "Orange"],
    applicableSectors: ["logistics_warehousing"],
    dependencies: ["gumasta_registration", "fire_final_noc"],
    mandatoryDocuments: ["Warehouse Layout & Loading Dock Spec", "Pest Control & Temperature Monitoring System", "Insurance Policy"],
    statutoryAct: "Warehousing (Development and Regulation) Act, 2007 & MH Logistics Policy 2024",
    officialPortal: "https://wdra.gov.in",
  },

  // =========================================================================
  // 11. TEXTILE COMMISSIONER REGISTRATION
  // =========================================================================
  {
    id: "textile_commissioner_reg",
    name: "Textile Commissioner Registration & ATUFS Clearance",
    department: "Office of the Textile Commissioner, Government of Maharashtra",
    category: "pre_establishment",
    slaDays: 14,
    deemedApprovalApplicable: true,
    requiredForHazard: ["Orange", "Green"],
    applicableSectors: ["textiles_garmenting"],
    dependencies: ["midc_land_allotment"],
    mandatoryDocuments: ["Machinery Invoices & Powerloom Specs", "Bank Term Loan Sanction Letter", "Weaving / Processing Capacity Report"],
    statutoryAct: "Maharashtra State Textile Policy 2018-23",
    officialPortal: "https://textiles.gov.in",
  },

  // =========================================================================
  // 12. GREEN ENERGY & SOLAR GRID CONNECTIVITY
  // =========================================================================
  {
    id: "meda_grid_connectivity",
    name: "MEDA Renewable Energy Grid Evacuation Feasibility Approval",
    department: "Maharashtra Energy Development Agency (MEDA)",
    category: "pre_establishment",
    slaDays: 21,
    deemedApprovalApplicable: true,
    requiredForHazard: ["Green", "Orange"],
    applicableSectors: ["green_energy_biofuel"],
    dependencies: ["midc_land_allotment"],
    mandatoryDocuments: ["Solar / Biofuel Plant Feasibility Report", "MSETCL / MSEDCL Substation Interconnection Scheme", "Land Title Deeds"],
    statutoryAct: "Maharashtra Renewable Energy Policy & Electricity Act, 2003",
    officialPortal: "https://mahaurja.com",
  },

  // =========================================================================
  // 13. DEFENCE INDUSTRIAL LICENSE (DDP / MHA)
  // =========================================================================
  {
    id: "defence_production_license",
    name: "Department of Defence Production (DDP) Industrial Manufacturing License",
    department: "Ministry of Defence / Home Dept Maharashtra",
    category: "pre_establishment",
    slaDays: 30,
    deemedApprovalApplicable: false,
    requiredForHazard: ["Orange", "Red", "Green"],
    applicableSectors: ["aerospace_defence"],
    dependencies: ["midc_land_allotment"],
    mandatoryDocuments: ["Security Clearance from MHA", "Avionics / Ordnance Manufacturing Spec", "Foreign Collaboration Agreement (if FDI)"],
    statutoryAct: "Industries (Development & Regulation) Act, 1951 & Aerospace Policy 2018",
    officialPortal: "https://www.makeinindiadefence.gov.in",
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
  const normalizedSector = (input.sector || "general_manufacturing").toLowerCase().trim();

  const filtered = MASTER_STATUTORY_CLEARANCE_RULES.filter((rule) => {
    // 1. Sector applicability check
    if (rule.applicableSectors && !rule.applicableSectors.includes("all")) {
      const match = rule.applicableSectors.some((s) => {
        if (s === normalizedSector) return true;
        if (normalizedSector.includes("food") || normalizedSector.includes("restaurant") || normalizedSector.includes("qsr")) {
          return s === "agro_food_processing" || s === "services_retail" || s === "food" || s === "restaurants";
        }
        if (normalizedSector.includes("fintech") || normalizedSector.includes("software") || normalizedSector.includes("it")) {
          return s === "fintech" || s === "industry_4_0_ai";
        }
        if (normalizedSector.includes("logistics") || normalizedSector.includes("warehouse")) {
          return s === "logistics_warehousing";
        }
        if (normalizedSector.includes("textile") || normalizedSector.includes("garment")) {
          return s === "textiles_garmenting";
        }
        if (normalizedSector.includes("ev") || normalizedSector.includes("electric")) {
          return s === "ev_manufacturing";
        }
        if (normalizedSector.includes("aerospace") || normalizedSector.includes("defence")) {
          return s === "aerospace_defence";
        }
        if (normalizedSector.includes("solar") || normalizedSector.includes("biofuel") || normalizedSector.includes("green_energy")) {
          return s === "green_energy_biofuel";
        }
        if (normalizedSector.includes("chemical") || normalizedSector.includes("general") || normalizedSector.includes("engineering")) {
          return s === "general_manufacturing";
        }
        return false;
      });
      if (!match) return false;
    }

    if (rule.excludedSectors && rule.excludedSectors.includes(normalizedSector)) {
      return false;
    }

    // 2. Hazard category check
    if (rule.requiredForHazard && rule.requiredForHazard.length > 0) {
      if (!rule.requiredForHazard.includes(input.hazardCategory)) {
        return false;
      }
    }

    // 3. Technical parameters check
    if (rule.minPowerKw && input.powerLoadKw < rule.minPowerKw) return false;
    if (rule.minBoilerInstalled && !input.boilerInstalled) return false;
    if (rule.minBuildingHeightMeters && input.buildingHeightMeters < rule.minBuildingHeightMeters) return false;
    if (rule.minOccupants && input.occupantsCount < rule.minOccupants) return false;
    if (rule.requiresMidcLand && !input.isMidcLand) return false;

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
    14
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
        stageName: "Stage 1: Statutory Trade & Land Allotment (Gumasta / MIDC)",
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
        stageName: "Stage 3: Pre-Operation Inspection & Operating License (FSSAI / DISH / CTO)",
        clearanceIds: stage3.map((r) => r.id),
        isParallel: true,
      },
    ],
  };
}

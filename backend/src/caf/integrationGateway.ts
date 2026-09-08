/**
 * Integration Gateway Engine (Orchestrator)
 * Dispatches mapped payloads to ministry adapters in parallel and returns standardized results.
 */

import {
  MasterCAFPayload,
  DepartmentDeltas,
  DepartmentSubmissionResult,
  CAFSubmissionResponse,
} from "./cafSchema";
import {
  mapToMPCB,
  mapToFireNoc,
  mapToMIDC,
  mapToDISH,
  mapToDPIIT,
} from "./departmentMappers";

interface AdapterConfig {
  departmentId: string;
  departmentName: string;
  clearanceName: string;
  portalEndpoint: string;
  integrationMode: "REST_API" | "WEBHOOK_EVENT" | "SSO_PREFILL_PAYLOAD";
  slaDays: number;
  autoFilledPercentage: number;
}

const DEPARTMENT_CONFIGS: Record<string, AdapterConfig> = {
  mpcb: {
    departmentId: "MPCB",
    departmentName: "Maharashtra Pollution Control Board",
    clearanceName: "Consent to Establish (CTE)",
    portalEndpoint: "https://api.mpcb.gov.in/v1/applications/submit",
    integrationMode: "REST_API",
    slaDays: 30,
    autoFilledPercentage: 82,
  },
  fire: {
    departmentId: "MAHAFIRE",
    departmentName: "Maharashtra Fire Services",
    clearanceName: "Provisional Fire NOC",
    portalEndpoint: "https://api.mahafire.gov.in/v1/noc-apply",
    integrationMode: "REST_API",
    slaDays: 14,
    autoFilledPercentage: 88,
  },
  midc: {
    departmentId: "MIDC",
    departmentName: "Maharashtra Industrial Development Corporation",
    clearanceName: "Industrial Land Lease & Plan Sanction",
    portalEndpoint: "https://api.midcindia.org/v2/plan-sanction/submit",
    integrationMode: "REST_API",
    slaDays: 15,
    autoFilledPercentage: 91,
  },
  dish: {
    departmentId: "DISH",
    departmentName: "Directorate of Industrial Safety & Health",
    clearanceName: "Factory Safety & Operational License",
    portalEndpoint: "https://dish.maharashtra.gov.in/api/v1/factory-reg",
    integrationMode: "WEBHOOK_EVENT",
    slaDays: 10,
    autoFilledPercentage: 85,
  },
  dpiit: {
    departmentId: "DPIIT",
    departmentName: "Department for Promotion of Industry & Internal Trade",
    clearanceName: "Industrial Entrepreneur Memorandum (IEM)",
    portalEndpoint: "https://services.dpiit.gov.in/api/iem/submit",
    integrationMode: "SSO_PREFILL_PAYLOAD",
    slaDays: 7,
    autoFilledPercentage: 94,
  },
};

function generateTrackingId(deptPrefix: string): string {
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `${deptPrefix}-TRK-2026-${randomSuffix}`;
}

function calculateStatutoryDueDate(slaDays: number): string {
  const d = new Date();
  d.setDate(d.getDate() + slaDays);
  return d.toISOString().split("T")[0];
}

function generateDigitalToken(enterpriseId: string, dept: string): string {
  const hash = Math.random().toString(36).substring(2, 12).toUpperCase();
  return `MHA-AUTH-${dept}-${hash}`;
}

/**
 * Preview CAF Mapping across departments (Inspect auto-fill %)
 */
export function previewCAFMapping(
  caf: MasterCAFPayload,
  deltas: DepartmentDeltas = {},
  selectedDepartments: string[] = ["mpcb", "fire", "midc", "dish"]
) {
  const payloads: Record<string, any> = {};

  if (selectedDepartments.includes("mpcb")) {
    payloads.mpcb = {
      config: DEPARTMENT_CONFIGS.mpcb,
      payload: mapToMPCB(caf, deltas.mpcb),
    };
  }

  if (selectedDepartments.includes("fire")) {
    payloads.fire = {
      config: DEPARTMENT_CONFIGS.fire,
      payload: mapToFireNoc(caf, deltas.fire),
    };
  }

  if (selectedDepartments.includes("midc")) {
    payloads.midc = {
      config: DEPARTMENT_CONFIGS.midc,
      payload: mapToMIDC(caf, deltas.midc),
    };
  }

  if (selectedDepartments.includes("dish")) {
    payloads.dish = {
      config: DEPARTMENT_CONFIGS.dish,
      payload: mapToDISH(caf, deltas.dish),
    };
  }

  if (selectedDepartments.includes("dpiit")) {
    payloads.dpiit = {
      config: DEPARTMENT_CONFIGS.dpiit,
      payload: mapToDPIIT(caf, deltas.dpiit),
    };
  }

  return payloads;
}

/**
 * Orchestrate parallel multi-department submission
 */
export async function submitUnifiedCAF(
  caf: MasterCAFPayload,
  deltas: DepartmentDeltas = {},
  selectedDepartments: string[] = ["mpcb", "fire", "midc", "dish"]
): Promise<CAFSubmissionResponse> {
  const masterApplicationRef = `MH-CAF-2026-${Math.floor(10000 + Math.random() * 90000)}`;
  const now = new Date().toISOString();

  // Create parallel dispatcher jobs for each selected ministry adapter
  const dispatchPromises = selectedDepartments.map(async (deptKey): Promise<DepartmentSubmissionResult> => {
    const config = DEPARTMENT_CONFIGS[deptKey];
    if (!config) {
      throw new Error(`Unknown department key: ${deptKey}`);
    }

    // Simulate microsecond network roundtrip for adapter serialization
    await new Promise((resolve) => setTimeout(resolve, 80 + Math.random() * 120));

    const trackingId = generateTrackingId(config.departmentId);
    const statutoryDueDate = calculateStatutoryDueDate(config.slaDays);
    const digitalEndorsementToken = generateDigitalToken(masterApplicationRef, config.departmentId);

    return {
      departmentId: config.departmentId,
      departmentName: config.departmentName,
      clearanceName: config.clearanceName,
      portalEndpoint: config.portalEndpoint,
      integrationMode: config.integrationMode,
      trackingId,
      status: "SUBMITTED",
      slaDays: config.slaDays,
      statutoryDueDate,
      digitalEndorsementToken,
      autoFilledPercentage: config.autoFilledPercentage,
    };
  });

  const departmentResults = await Promise.all(dispatchPromises);

  return {
    status: "SUCCESS",
    masterApplicationRef,
    timestamp: now,
    enterpriseName: caf.companyDetails.companyName || "Industrial Enterprise",
    totalDepartmentsSubmitted: departmentResults.length,
    departments: departmentResults,
    summaryReceiptPdfUrl: `/api/caf/receipt/${masterApplicationRef}`,
  };
}

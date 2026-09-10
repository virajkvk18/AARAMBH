import type { User } from "@/context/AuthContext";
import { compareFieldValues } from "@/lib/fieldComparison";
import type { ExtractedFieldItem } from "@/store/enterpriseStore";

export type AutofillSource = "masterCaf" | "ocrVault" | "previousFiling" | "userProfile" | "projectProfile";

export const SOURCE_META: Record<AutofillSource, { label: string; short: string; confidence: number }> = {
  masterCaf: { label: "Master CAF (already filed)", short: "CAF", confidence: 0.85 },
  ocrVault: { label: "OCR — Vault document", short: "OCR", confidence: 0.9 },
  previousFiling: { label: "Your previous filing", short: "Prev", confidence: 0.95 },
  userProfile: { label: "Signup profile", short: "Profile", confidence: 0.7 },
  projectProfile: { label: "Project parameters", short: "Project", confidence: 0.85 },
};

export interface AutofillEntry {
  fieldKey: string;
  label: string;
  value: unknown;
  source: AutofillSource;
  confidence: number;
}

export interface AutofillConflict {
  fieldKey: string;
  label: string;
  values: { label: string; value: string }[];
  diffPercent: number;
}

interface SourceValue {
  label: string;
  value: unknown;
  source: AutofillSource;
}

interface StoreSnapshot {
  extractedFields?: Record<string, ExtractedFieldItem>;
  masterCAF?: {
    companyDetails?: {
      companyName?: string;
      pan?: string;
      gstin?: string;
      udyam?: string;
      signatoryName?: string;
      signatoryEmail?: string;
      signatoryMobile?: string;
    };
    locationDetails?: { address?: string; district?: string; pincode?: string; taluka?: string };
  };
  capexCr?: number;
  powerLoadKva?: number;
  waterDemandKld?: number;
  workforceSize?: number;
}

const FILING_STORAGE_KEY = "aarambh_app_submissions";

export interface FilingRecord {
  approvalId: string;
  submittedAt: string;
  formData: Record<string, unknown>;
}

export function getPreviousFilings(): Record<string, FilingRecord> {
  try {
    const raw = localStorage.getItem(FILING_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, FilingRecord>) : {};
  } catch {
    return {};
  }
}

export function getPreviousFiling(approvalId: string): FilingRecord | null {
  const filings = getPreviousFilings();
  return filings[approvalId] || null;
}

export function saveFilingRecord(approvalId: string, formData: Record<string, unknown>): void {
  try {
    const filings = getPreviousFilings();
    filings[approvalId] = {
      approvalId,
      submittedAt: new Date().toISOString(),
      formData,
    };
    localStorage.setItem(FILING_STORAGE_KEY, JSON.stringify(filings));
  } catch {
    // non-fatal: filing memory disabled
  }
}

export interface AutofillSuggestionResult {
  entries: AutofillEntry[];
  conflicts: AutofillConflict[];
}

export function buildAutofillSuggestions(params: {
  user?: User | null;
  store: StoreSnapshot;
  approvalId: string;
}): AutofillSuggestionResult {
  const { user, store, approvalId } = params;
  const masterCAF = store.masterCAF || {};
  const company = masterCAF.companyDetails || {};
  const location = masterCAF.locationDetails || {};
  const extract = (key: string): string => store.extractedFields?.[key]?.value || "";

  const previous = getPreviousFiling(approvalId);
  const previousForm = previous?.formData || {};

  const candidates: Record<string, { label: string; values: SourceValue[] }> = {
    applicantName: {
      label: "Authorized Signatory Name",
      values: [
        { label: "Your previous filing", value: previousForm.applicantName, source: "previousFiling" },
        { label: "Master CAF signatory", value: company.signatoryName, source: "masterCaf" },
        { label: "Signup profile", value: user?.name, source: "userProfile" },
      ],
    },
    applicantEmail: {
      label: "Official Email",
      values: [
        { label: "Your previous filing", value: previousForm.applicantEmail, source: "previousFiling" },
        { label: "Master CAF email", value: company.signatoryEmail, source: "masterCaf" },
        { label: "Signup profile", value: user?.email, source: "userProfile" },
      ],
    },
    applicantMobile: {
      label: "Mobile Number",
      values: [
        { label: "Your previous filing", value: previousForm.applicantMobile, source: "previousFiling" },
        { label: "Master CAF mobile", value: company.signatoryMobile, source: "masterCaf" },
        { label: "Signup profile", value: user?.phone, source: "userProfile" },
      ],
    },
    applicantAadhaar: {
      label: "Aadhaar Reference",
      values: [
        { label: "Your previous filing", value: previousForm.applicantAadhaar, source: "previousFiling" },
        { label: "OCR — uploaded document", value: extract("aadhaar"), source: "ocrVault" },
      ],
    },
    commAddress: {
      label: "Communication Address",
      values: [
        { label: "Your previous filing", value: previousForm.commAddress, source: "previousFiling" },
        { label: "Master CAF address", value: location.address, source: "masterCaf" },
        { label: "Signup profile", value: user?.addressLine1, source: "userProfile" },
      ],
    },
    commCity: {
      label: "District / City",
      values: [
        { label: "Your previous filing", value: previousForm.commCity, source: "previousFiling" },
        { label: "Master CAF district", value: location.district, source: "masterCaf" },
        { label: "Signup profile", value: user?.district, source: "userProfile" },
      ],
    },
    commPincode: {
      label: "Postal PIN Code",
      values: [
        { label: "Your previous filing", value: previousForm.commPincode, source: "previousFiling" },
        { label: "Master CAF pincode", value: location.pincode, source: "masterCaf" },
        { label: "Signup profile", value: user?.pinCode, source: "userProfile" },
      ],
    },
    businessName: {
      label: "Registered Company Name",
      values: [
        { label: "Your previous filing", value: previousForm.businessName, source: "previousFiling" },
        { label: "OCR — uploaded document", value: extract("entity_name"), source: "ocrVault" },
        { label: "Master CAF name", value: company.companyName, source: "masterCaf" },
        { label: "Signup profile", value: user?.enterpriseName, source: "userProfile" },
      ],
    },
    businessPan: {
      label: "Entity PAN",
      values: [
        { label: "Your previous filing", value: previousForm.businessPan, source: "previousFiling" },
        { label: "OCR — uploaded document", value: extract("pan"), source: "ocrVault" },
        { label: "Master CAF PAN", value: company.pan, source: "masterCaf" },
        { label: "Signup profile", value: user?.panNumber, source: "userProfile" },
      ],
    },
    businessGstin: {
      label: "GSTIN",
      values: [
        { label: "Your previous filing", value: previousForm.businessGstin, source: "previousFiling" },
        { label: "OCR — uploaded document", value: extract("gstin"), source: "ocrVault" },
        { label: "Master CAF GSTIN", value: company.gstin, source: "masterCaf" },
      ],
    },
    udyamNumber: {
      label: "Udyam / CIN Number",
      values: [
        { label: "Your previous filing", value: previousForm.udyamNumber, source: "previousFiling" },
        { label: "OCR — uploaded document", value: extract("udyam"), source: "ocrVault" },
      ],
    },
    regOfficeAddress: {
      label: "Registered Office Address",
      values: [
        { label: "Your previous filing", value: previousForm.regOfficeAddress, source: "previousFiling" },
        { label: "Master CAF address", value: location.address, source: "masterCaf" },
      ],
    },
    capexFixedAssets: {
      label: "Capital Investment (₹ Cr)",
      values: [
        { label: "Your previous filing", value: previousForm.capexFixedAssets, source: "previousFiling" },
        { label: "Project parameters", value: store.capexCr, source: "projectProfile" },
      ],
    },
    powerLoadRequired: {
      label: "Power Load (kVA)",
      values: [
        { label: "Your previous filing", value: previousForm.powerLoadRequired, source: "previousFiling" },
        { label: "Project parameters", value: store.powerLoadKva, source: "projectProfile" },
      ],
    },
    installedMotivePowerHp: {
      label: "Installed Motive Power (HP)",
      values: [
        { label: "Your previous filing", value: previousForm.installedMotivePowerHp, source: "previousFiling" },
        { label: "Project parameters", value: store.powerLoadKva, source: "projectProfile" },
      ],
    },
    waterRequirementCmd: {
      label: "Water Requirement (KLD)",
      values: [
        { label: "Your previous filing", value: previousForm.waterRequirementCmd, source: "previousFiling" },
        { label: "Project parameters", value: store.waterDemandKld, source: "projectProfile" },
      ],
    },
    freshWaterConsumption: {
      label: "Fresh Water Consumption (KLD)",
      values: [
        { label: "Your previous filing", value: previousForm.freshWaterConsumption, source: "previousFiling" },
        { label: "Project parameters", value: store.waterDemandKld, source: "projectProfile" },
      ],
    },
    proposedEmployment: {
      label: "Proposed Employment",
      values: [
        { label: "Your previous filing", value: previousForm.proposedEmployment, source: "previousFiling" },
        { label: "Project parameters", value: store.workforceSize, source: "projectProfile" },
      ],
    },
    maxDailyWorkers: {
      label: "Maximum Daily Workers",
      values: [
        { label: "Your previous filing", value: previousForm.maxDailyWorkers, source: "previousFiling" },
        { label: "Project parameters", value: store.workforceSize, source: "projectProfile" },
      ],
    },
  };

  const entries: AutofillEntry[] = [];
  const conflicts: AutofillConflict[] = [];

  Object.entries(candidates).forEach(([fieldKey, candidate]) => {
    const present = candidate.values.filter((v) => v.value !== undefined && v.value !== null && String(v.value).trim() !== "");
    if (present.length === 0) return;

    const unique = new Map<string, SourceValue>();
    present.forEach((p) => {
      const norm = String(p.value).trim().toLowerCase();
      if (!unique.has(norm)) unique.set(norm, p);
    });

    const chosen = Array.from(unique.values()).sort((a, b) => {
      return SOURCE_META[b.source].confidence - SOURCE_META[a.source].confidence;
    })[0];

    entries.push({
      fieldKey,
      label: candidate.label,
      value: chosen.value,
      source: chosen.source,
      confidence: SOURCE_META[chosen.source].confidence,
    });

    if (unique.size > 1) {
      const others = Array.from(unique.values()).filter((u) => u.source !== chosen.source);
      conflicts.push({
        fieldKey,
        label: candidate.label,
        values: others.map((u) => ({ label: u.label, value: String(u.value) })),
        diffPercent: compareFieldValues(String(chosen.value), String(others[0].value)).diffPercent,
      });
    }
  });

  return { entries, conflicts };
}

export interface AutofillReport {
  entries: AutofillEntry[];
  conflicts: AutofillConflict[];
  prefilledCount: number;
  totalCandidates: number;
  sourceCounts: Record<AutofillSource, number>;
}

export function summarizeAutofill(entries: AutofillEntry[], conflicts: AutofillConflict[]): AutofillReport {
  const sourceCounts: Record<AutofillSource, number> = {
    masterCaf: 0,
    ocrVault: 0,
    previousFiling: 0,
    userProfile: 0,
    projectProfile: 0,
  };
  entries.forEach((e) => {
    sourceCounts[e.source] += 1;
  });
  return {
    entries,
    conflicts,
    prefilledCount: entries.length,
    totalCandidates: entries.length,
    sourceCounts,
  };
}

export function applyAutofill(formData: Record<string, unknown>, entries: AutofillEntry[]): Record<string, unknown> {
  const next = { ...formData };
  entries.forEach((entry) => {
    const current = formData[entry.fieldKey];
    const isEmpty = current === undefined || current === null || String(current).trim() === "";
    if (isEmpty) next[entry.fieldKey] = entry.value;
  });
  return next;
}

export function estimateTimeSavedMinutes(entries: AutofillEntry[]): number {
  return Math.round(entries.length * 0.5 * 10) / 10;
}
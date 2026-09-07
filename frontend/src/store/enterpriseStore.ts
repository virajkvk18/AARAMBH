import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type RiskTrack = "green" | "orange" | "red";
export type SectorType =
  | "Food Processing"
  | "Chemical Manufacturing"
  | "IT/ITeS"
  | "Textile"
  | "Engineering";

export interface ClearanceItem {
  id: string;
  name: string;
  department: string;
  slaDays: number;
  category: "Pre-Establishment" | "Pre-Operation" | "Utility";
  mandatory: boolean;
  description: string;
  feeEstimate: string;
}

export interface ExtractedFieldItem {
  value: string | null;
  confidenceScore: number;
  hasConflict?: boolean;
}

export interface FieldConflict {
  fieldName: string;
  values: { documentId: string; documentName: string; value: string }[];
}

export interface UploadedDocument {
  id: string;
  name: string;
  size: number;
  type: string;
  fileUrl?: string; // Served file URL or blob URL
  uploadedAt: string;
  extractedFields?: Record<string, ExtractedFieldItem>;
  rawTextSnippet?: string | null;
  status: "ready" | "processing" | "extracted" | "error";
  errorMessage?: string | null;
}

export interface DigiLockerDocItem {
  id: string;
  name: string;
  docType: string;
  issueDate: string;
  issuer: string;
  verified: boolean;
}

export interface EnterpriseState {
  sector: SectorType;
  locationZone: string;
  capexCr: number;
  powerLoadKva: number;
  waterDemandKld: number;
  workforceSize: number;
  riskTrack: RiskTrack | null;
  clearances: ClearanceItem[];
  applicableIncentives: string[];
  isAssessed: boolean;

  // Document Vault State
  uploadedDocuments: UploadedDocument[];
  extractedFields: Record<string, ExtractedFieldItem>;
  fieldConflicts: FieldConflict[];
  digiLockerDocs: DigiLockerDocItem[];
  uploadedDocumentName: string | null;

  setFormData: (
    data: Partial<
      Pick<
        EnterpriseState,
        "sector" | "locationZone" | "capexCr" | "powerLoadKva" | "waterDemandKld" | "workforceSize"
      >
    >
  ) => void;
  setAssessmentResult: (
    riskTrack: RiskTrack,
    clearances: ClearanceItem[],
    incentives: string[]
  ) => void;
  addUploadedDocument: (doc: UploadedDocument) => void;
  addUploadedDocuments: (docs: UploadedDocument[]) => void;
  updateUploadedDocument: (id: string, updates: Partial<UploadedDocument>) => void;
  removeUploadedDocument: (id: string) => void;
  clearUploadedDocuments: () => void;
  setExtractedFields: (
    fields: Record<string, ExtractedFieldItem>,
    documentName: string
  ) => void;
  setDigiLockerDocs: (docs: DigiLockerDocItem[]) => void;
  reset: () => void;
}

/**
 * Recalculate merged extracted fields strictly from the remaining documents.
 * If two documents have conflicting non-null values, flag the conflict instead of silently overwriting.
 */
export function recalculateMergedFields(docs: UploadedDocument[]): {
  mergedFields: Record<string, ExtractedFieldItem>;
  conflicts: FieldConflict[];
} {
  const valuesByField: Record<
    string,
    { documentId: string; documentName: string; value: string; confidenceScore: number }[]
  > = {};

  for (const doc of docs) {
    if (!doc.extractedFields) continue;
    for (const [key, item] of Object.entries(doc.extractedFields)) {
      if (item && item.value !== null && item.value !== undefined && String(item.value).trim() !== "") {
        if (!valuesByField[key]) {
          valuesByField[key] = [];
        }
        valuesByField[key].push({
          documentId: doc.id,
          documentName: doc.name,
          value: String(item.value).trim(),
          confidenceScore: typeof item.confidenceScore === "number" ? item.confidenceScore : 0.85,
        });
      }
    }
  }

  const mergedFields: Record<string, ExtractedFieldItem> = {};
  const conflicts: FieldConflict[] = [];

  for (const [key, entries] of Object.entries(valuesByField)) {
    if (entries.length === 0) continue;

    // Check for distinct non-null values
    const uniqueNormalized = Array.from(
      new Set(entries.map((e) => e.value.toLowerCase().replace(/\s+/g, " ")))
    );

    if (uniqueNormalized.length > 1) {
      // Conflict detected across documents!
      conflicts.push({
        fieldName: key,
        values: entries.map((e) => ({
          documentId: e.documentId,
          documentName: e.documentName,
          value: e.value,
        })),
      });

      mergedFields[key] = {
        value: entries.map((e) => `${e.documentName}: ${e.value}`).join(" vs "),
        confidenceScore: 0,
        hasConflict: true,
      };
    } else {
      // Consistent value across document(s)
      const highestConfidence = entries.reduce((prev, curr) =>
        curr.confidenceScore > prev.confidenceScore ? curr : prev
      );
      mergedFields[key] = {
        value: highestConfidence.value,
        confidenceScore: highestConfidence.confidenceScore,
        hasConflict: false,
      };
    }
  }

  return { mergedFields, conflicts };
}

const initialState = {
  sector: "Food Processing" as SectorType,
  locationZone: "Chakan MIDC (Pune)",
  capexCr: 25,
  powerLoadKva: 150,
  waterDemandKld: 20,
  workforceSize: 75,
  riskTrack: null as RiskTrack | null,
  clearances: [] as ClearanceItem[],
  applicableIncentives: [] as string[],
  isAssessed: false,

  uploadedDocuments: [] as UploadedDocument[],
  extractedFields: {} as Record<string, ExtractedFieldItem>,
  fieldConflicts: [] as FieldConflict[],
  digiLockerDocs: [] as DigiLockerDocItem[],
  uploadedDocumentName: null as string | null,
};

export const useEnterpriseStore = create<EnterpriseState>()(
  persist(
    (set) => ({
      ...initialState,

      setFormData: (data) =>
        set((state) => ({
          ...state,
          ...data,
        })),

      setAssessmentResult: (riskTrack, clearances, incentives) =>
        set(() => ({
          riskTrack,
          clearances,
          applicableIncentives: incentives,
          isAssessed: true,
        })),

      addUploadedDocument: (doc) =>
        set((state) => {
          const newDocs = [...state.uploadedDocuments, doc];
          const { mergedFields, conflicts } = recalculateMergedFields(newDocs);
          return {
            ...state,
            uploadedDocuments: newDocs,
            uploadedDocumentName: doc.name,
            extractedFields: Object.keys(mergedFields).length > 0 ? mergedFields : state.extractedFields,
            fieldConflicts: conflicts,
          };
        }),

      addUploadedDocuments: (docs) =>
        set((state) => {
          const newDocs = [...state.uploadedDocuments, ...docs];
          const { mergedFields, conflicts } = recalculateMergedFields(newDocs);
          return {
            ...state,
            uploadedDocuments: newDocs,
            uploadedDocumentName: docs[docs.length - 1]?.name || state.uploadedDocumentName,
            extractedFields: Object.keys(mergedFields).length > 0 ? mergedFields : state.extractedFields,
            fieldConflicts: conflicts,
          };
        }),

      updateUploadedDocument: (id, updates) =>
        set((state) => {
          const newDocs = state.uploadedDocuments.map((d) =>
            d.id === id ? { ...d, ...updates } : d
          );
          const { mergedFields, conflicts } = recalculateMergedFields(newDocs);
          return {
            ...state,
            uploadedDocuments: newDocs,
            extractedFields: mergedFields,
            fieldConflicts: conflicts,
          };
        }),

      removeUploadedDocument: (id) =>
        set((state) => {
          const remainingDocs = state.uploadedDocuments.filter((d) => d.id !== id);
          const { mergedFields, conflicts } = recalculateMergedFields(remainingDocs);
          return {
            ...state,
            uploadedDocuments: remainingDocs,
            uploadedDocumentName: remainingDocs.length > 0 ? remainingDocs[remainingDocs.length - 1].name : null,
            extractedFields: mergedFields,
            fieldConflicts: conflicts,
          };
        }),

      clearUploadedDocuments: () =>
        set((state) => ({
          ...state,
          uploadedDocuments: [],
          uploadedDocumentName: null,
          extractedFields: {},
          fieldConflicts: [],
        })),

      setExtractedFields: (fields, documentName) =>
        set((state) => ({
          ...state,
          extractedFields: fields,
          uploadedDocumentName: documentName,
        })),

      setDigiLockerDocs: (docs) =>
        set((state) => ({
          ...state,
          digiLockerDocs: docs,
        })),

      reset: () => set(() => ({ ...initialState })),
    }),
    {
      name: "aarambh_enterprise_profile",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

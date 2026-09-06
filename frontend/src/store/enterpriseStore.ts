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
  extractedFields: Record<string, ExtractedFieldItem>;
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
  setExtractedFields: (
    fields: Record<string, ExtractedFieldItem>,
    documentName: string
  ) => void;
  setDigiLockerDocs: (docs: DigiLockerDocItem[]) => void;
  reset: () => void;
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

  extractedFields: {} as Record<string, ExtractedFieldItem>,
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

      setExtractedFields: (fields, documentName) =>
        set((state) => ({
          ...state,
          extractedFields: fields,
          uploadedDocumentName: documentName,
          // Sync extracted capex / power if extracted
          ...(fields.capex_amount?.value && {
            // keep existing or update if available
          }),
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

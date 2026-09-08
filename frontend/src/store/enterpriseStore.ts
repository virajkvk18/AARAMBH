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
  status?: "pending" | "submitted" | "in_review" | "approved" | "deemed_approved";
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

export interface GrievanceTicket {
  id: string;
  subject: string;
  department: string;
  category?: string;
  details: string;
  description?: string;
  status: "open" | "in_progress" | "resolved";
  createdAt: string;
  date?: string;
  slaDays: number;
  resolution?: string;
}

export interface InspectorOfficer {
  department: string;
  officerName: string;
  designation: string;
  contact: string;
  status: "confirmed" | "attended";
}

export interface JointInspection {
  id: string;
  applicationRef: string;
  scheduledDate: string;
  timeSlot: string;
  location: string;
  status: "scheduled" | "in_progress" | "completed" | "report_issued";
  inspectors: InspectorOfficer[];
  checklist: { id: string; label: string; completed: boolean }[];
  remarks?: string;
  reportSummary?: string;
  issuedAt?: string;
}

export type ApplicationStatus = "draft" | "submitted" | "under_review" | "approved";

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

  // Application Lifecycle State
  applicationStatus: ApplicationStatus;
  applicationRef: string;
  submittedAt: string | null;

  // Document Vault State
  uploadedDocuments: UploadedDocument[];
  extractedFields: Record<string, ExtractedFieldItem>;
  fieldConflicts: FieldConflict[];
  digiLockerDocs: DigiLockerDocItem[];
  uploadedDocumentName: string | null;

  // DAG Workflow State
  dagNodeStatuses: Record<string, "locked" | "active" | "approved">;

  // Grievances State
  grievanceTickets: GrievanceTicket[];

  // Joint Inspections State
  jointInspections: JointInspection[];

  // Actions
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
  submitApplication: (ref?: string) => void;
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
  updateDAGNodeStatus: (nodeId: string, status: "locked" | "active" | "approved") => void;
  setDAGNodeStatuses: (statuses: Record<string, "locked" | "active" | "approved">) => void;
  resetDAGStatuses: () => void;
  addGrievanceTicket: (ticket: {
    subject: string;
    department?: string;
    category?: string;
    details?: string;
    description?: string;
    status?: "open" | "in_progress" | "resolved";
  }) => void;
  resolveGrievanceTicket: (id: string, resolution?: string) => void;
  scheduleJointInspection: (inspection: Omit<JointInspection, "id">) => void;
  updateInspectionStatus: (
    id: string,
    status: JointInspection["status"],
    reportSummary?: string
  ) => void;
  toggleChecklistItem: (inspectionId: string, checklistId: string) => void;
  resetAssessment: () => void;
  reset: () => void;
}

/**
 * Recalculate merged extracted fields strictly from remaining documents.
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

    const uniqueNormalized = Array.from(
      new Set(entries.map((e) => e.value.toLowerCase().replace(/\s+/g, " ")))
    );

    const highestConfidence = entries.reduce((prev, curr) =>
      curr.confidenceScore > prev.confidenceScore ? curr : prev
    );

    if (uniqueNormalized.length > 1) {
      conflicts.push({
        fieldName: key,
        values: entries.map((e) => ({
          documentId: e.documentId,
          documentName: e.documentName,
          value: e.value,
        })),
      });

      mergedFields[key] = {
        value: highestConfidence.value,
        confidenceScore: highestConfidence.confidenceScore,
        hasConflict: true,
      };
    } else {
      mergedFields[key] = {
        value: highestConfidence.value,
        confidenceScore: highestConfidence.confidenceScore,
        hasConflict: false,
      };
    }
  }

  return { mergedFields, conflicts };
}

export const INITIAL_DEFAULT_CLEARANCES: ClearanceItem[] = [
  {
    id: "clr-midc-land",
    name: "MIDC Plot Allotment & Building Plan Approval",
    department: "MIDC Planning Wing",
    slaDays: 15,
    category: "Pre-Establishment",
    mandatory: true,
    description: "Zonal land allotment, architectural floor area ratio (FAR), and building plan sanction.",
    feeEstimate: "₹25,000",
    status: "in_review",
  },
  {
    id: "clr-mpcb-cte",
    name: "Consent to Establish (CTE) - Red/Orange Category",
    department: "Maharashtra Pollution Control Board (MPCB)",
    slaDays: 21,
    category: "Pre-Establishment",
    mandatory: true,
    description: "Air, Water, and Hazardous waste pollution control clearance under Water & Air Acts.",
    feeEstimate: "₹45,000",
    status: "in_review",
  },
  {
    id: "clr-fire-noc",
    name: "Provisional Fire Safety NOC",
    department: "Directorate of Maharashtra Fire Services",
    slaDays: 14,
    category: "Pre-Establishment",
    mandatory: true,
    description: "Fire prevention, static water tank capacity, and emergency egress plan verification.",
    feeEstimate: "₹15,000",
    status: "in_review",
  },
  {
    id: "clr-water-alloc",
    name: "Bulk Industrial Water Supply Allocation",
    department: "Water Resources Dept / MIDC Water Wing",
    slaDays: 7,
    category: "Utility",
    mandatory: true,
    description: "Sanction of daily water quota intake (KLD) and pipeline connection point.",
    feeEstimate: "₹10,000",
    status: "in_review",
  },
  {
    id: "clr-dish-license",
    name: "Factory License & Safety Sign-off (DISH)",
    department: "Directorate of Industrial Safety & Health",
    slaDays: 15,
    category: "Pre-Operation",
    mandatory: true,
    description: "Consolidated factory layout and worker occupational safety compliance certificate.",
    feeEstimate: "₹20,000",
    status: "pending",
  },
];

const initialTickets: GrievanceTicket[] = [
  {
    id: "GRV-2026-098",
    subject: "Provisional Fire NOC - Clarification on Underground Static Tank Capacity",
    department: "State Directorate of Fire & Emergency Services",
    details: "State Fire Directorate requested civil cross-sectional blueprint for 100kL underground storage tank. Scrutiny response due within statutory deadline.",
    status: "open",
    createdAt: "2026-09-02T10:30:00.000Z",
    slaDays: 3,
  },
  {
    id: "GRV-2026-042",
    subject: "MIDC Land Allotment Boundary Coordinates Confirmation",
    department: "MIDC Chakan Sub-Division",
    details: "Zonal sub-division verified with Chakan industrial estate GIS survey map. Deemed boundary approval endorsed.",
    status: "resolved",
    createdAt: "2026-08-20T14:15:00.000Z",
    slaDays: 5,
    resolution: "Coordinates re-verified on GIS platform. Clear boundary certificate issued.",
  },
];

const initialInspections: JointInspection[] = [
  {
    id: "JINSP-2026-0881",
    applicationRef: "MH-CAF-2026-00412",
    scheduledDate: "2026-09-15",
    timeSlot: "10:30 AM - 01:30 PM",
    location: "Plot No. A-42, MIDC Chakan Phase-II Industrial Area, Pune",
    status: "scheduled",
    inspectors: [
      {
        department: "Maharashtra Pollution Control Board (MPCB)",
        officerName: "Er. Sunil Deshmukh",
        designation: "Sub-Regional Officer (Pune-II)",
        contact: "+91 98220 54321",
        status: "confirmed",
      },
      {
        department: "Directorate of Fire Services, Maharashtra",
        officerName: "Chief Insp. Rajesh Shinde",
        designation: "Divisional Fire Safety Inspector",
        contact: "+91 98224 87654",
        status: "confirmed",
      },
      {
        department: "Directorate of Industrial Safety & Health (DISH)",
        officerName: "Dr. Anjali Patil",
        designation: "Joint Director of Industrial Safety",
        contact: "+91 98231 11223",
        status: "confirmed",
      },
    ],
    checklist: [
      { id: "chk-1", label: "Effluent treatment plant (ETP) civil layout and pipeline gradient verified", completed: true },
      { id: "chk-2", label: "100 kL static fire water reservoir & high-pressure hydrant manifold inspected", completed: true },
      { id: "chk-3", label: "Emergency fire exits, smoke ventilation shafts, and assembly points clear", completed: false },
      { id: "chk-4", label: "Industrial plot boundary demarcation stones matched with MIDC master map", completed: true },
    ],
    remarks: "Joint site inspection to assess CTE Red category pollution mitigation, Fire NOC compliance, and factory layout safety.",
  },
];

const initialState = {
  sector: "Food Processing" as SectorType,
  locationZone: "Chakan MIDC (Pune)",
  capexCr: 25,
  powerLoadKva: 150,
  waterDemandKld: 20,
  workforceSize: 75,
  riskTrack: "orange" as RiskTrack | null,
  clearances: INITIAL_DEFAULT_CLEARANCES,
  applicableIncentives: [
    "Package Scheme of Incentives (PSI 2019) - 60% Industrial Promotion Subsidy",
    "100% Electricity Duty Exemption for 7 Years",
    "5% Interest Subvention on Term Loans for Green Tech",
  ],
  isAssessed: true,

  applicationStatus: "under_review" as ApplicationStatus,
  applicationRef: "MH-CAF-2026-00412",
  submittedAt: "2026-09-01T09:00:00.000Z",

  uploadedDocuments: [] as UploadedDocument[],
  extractedFields: {
    entity_name: { value: "Maharashtra Solvents & Chemicals Pvt Ltd", confidenceScore: 0.98, hasConflict: false },
    pan: { value: "AAECS8891M", confidenceScore: 0.99, hasConflict: false },
    gstin: { value: "27AAECS8891M1Z2", confidenceScore: 0.95, hasConflict: false },
    plot_area_sqm: { value: "5000", confidenceScore: 0.94, hasConflict: false },
    power_load_kva: { value: "250", confidenceScore: 0.91, hasConflict: false },
    capex_amount: { value: "350000000", confidenceScore: 0.92, hasConflict: false },
  } as Record<string, ExtractedFieldItem>,
  fieldConflicts: [] as FieldConflict[],
  digiLockerDocs: [] as DigiLockerDocItem[],
  uploadedDocumentName: null as string | null,

  dagNodeStatuses: {
    "node-root": "approved" as const,
    "node-mpcb": "active" as const,
    "node-fire": "active" as const,
    "node-water": "active" as const,
    "node-dish": "locked" as const,
  },

  grievanceTickets: initialTickets,
  jointInspections: initialInspections,
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
        set((state) => ({
          ...state,
          riskTrack,
          clearances: clearances.length > 0 ? clearances : INITIAL_DEFAULT_CLEARANCES,
          applicableIncentives: incentives,
          isAssessed: true,
        })),

      submitApplication: (ref = "MH-CAF-2026-00412") =>
        set((state) => ({
          ...state,
          applicationStatus: "submitted",
          applicationRef: ref,
          submittedAt: new Date().toISOString(),
          dagNodeStatuses: {
            "node-root": "active",
            "node-mpcb": "locked",
            "node-fire": "locked",
            "node-water": "locked",
            "node-dish": "locked",
          },
        })),

      addUploadedDocument: (doc) =>
        set((state) => {
          const newDocs = [...state.uploadedDocuments, doc];
          const { mergedFields, conflicts } = recalculateMergedFields(newDocs);
          return {
            ...state,
            uploadedDocuments: newDocs,
            uploadedDocumentName: doc.name,
            extractedFields: Object.keys(mergedFields).length > 0 ? { ...state.extractedFields, ...mergedFields } : state.extractedFields,
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
            extractedFields: Object.keys(mergedFields).length > 0 ? { ...state.extractedFields, ...mergedFields } : state.extractedFields,
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
            extractedFields: Object.keys(mergedFields).length > 0 ? { ...state.extractedFields, ...mergedFields } : state.extractedFields,
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
            extractedFields: Object.keys(mergedFields).length > 0 ? mergedFields : state.extractedFields,
            fieldConflicts: conflicts,
          };
        }),

      clearUploadedDocuments: () =>
        set((state) => ({
          ...state,
          uploadedDocuments: [],
          uploadedDocumentName: null,
          fieldConflicts: [],
        })),

      setExtractedFields: (fields, documentName) =>
        set((state) => ({
          ...state,
          extractedFields: { ...state.extractedFields, ...fields },
          uploadedDocumentName: documentName,
        })),

      setDigiLockerDocs: (docs) =>
        set((state) => ({
          ...state,
          digiLockerDocs: docs,
        })),

      updateDAGNodeStatus: (nodeId, status) =>
        set((state) => {
          const updated = { ...state.dagNodeStatuses, [nodeId]: status };

          if (nodeId === "node-root" && status === "approved") {
            if (updated["node-mpcb"] === "locked") updated["node-mpcb"] = "active";
            if (updated["node-fire"] === "locked") updated["node-fire"] = "active";
            if (updated["node-water"] === "locked") updated["node-water"] = "active";
          }

          const childrenApproved =
            updated["node-mpcb"] === "approved" &&
            updated["node-fire"] === "approved" &&
            updated["node-water"] === "approved";

          if (childrenApproved && updated["node-dish"] === "locked") {
            updated["node-dish"] = "active";
          }

          const allApproved = updated["node-dish"] === "approved";

          return {
            ...state,
            dagNodeStatuses: updated,
            applicationStatus: allApproved ? "approved" : "under_review",
          };
        }),

      setDAGNodeStatuses: (statuses) =>
        set((state) => ({
          ...state,
          dagNodeStatuses: statuses,
        })),

      resetDAGStatuses: () =>
        set((state) => ({
          ...state,
          dagNodeStatuses: {
            "node-root": "active",
            "node-mpcb": "locked",
            "node-fire": "locked",
            "node-water": "locked",
            "node-dish": "locked",
          },
        })),

      addGrievanceTicket: (ticketInput) =>
        set((state) => {
          const now = new Date();
          const newTicket: GrievanceTicket = {
            id: `GRV-2026-${Math.floor(100 + Math.random() * 900)}`,
            subject: ticketInput.subject,
            department: ticketInput.department || ticketInput.category || "General Clearance",
            category: ticketInput.category || ticketInput.department || "General Clearance",
            details: ticketInput.details || ticketInput.description || "",
            description: ticketInput.description || ticketInput.details || "",
            status: ticketInput.status || "in_progress",
            createdAt: now.toISOString(),
            date: now.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
            slaDays: 3,
          };
          return {
            ...state,
            grievanceTickets: [newTicket, ...state.grievanceTickets],
          };
        }),

      resolveGrievanceTicket: (id, resolution) =>
        set((state) => ({
          ...state,
          grievanceTickets: state.grievanceTickets.map((t) =>
            t.id === id ? { ...t, status: "resolved", resolution: resolution || "Resolved by department" } : t
          ),
        })),

      scheduleJointInspection: (inspection) =>
        set((state) => {
          const newInspection: JointInspection = {
            ...inspection,
            id: `JINSP-2026-${Math.floor(1000 + Math.random() * 9000)}`,
          };
          return {
            ...state,
            jointInspections: [newInspection, ...state.jointInspections],
          };
        }),

      updateInspectionStatus: (id, status, reportSummary) =>
        set((state) => ({
          ...state,
          jointInspections: state.jointInspections.map((i) =>
            i.id === id
              ? {
                  ...i,
                  status,
                  reportSummary: reportSummary || i.reportSummary,
                  issuedAt: status === "report_issued" ? new Date().toISOString() : i.issuedAt,
                }
              : i
          ),
        })),

      toggleChecklistItem: (inspectionId, checklistId) =>
        set((state) => ({
          ...state,
          jointInspections: state.jointInspections.map((i) =>
            i.id === inspectionId
              ? {
                  ...i,
                  checklist: i.checklist.map((c) =>
                    c.id === checklistId ? { ...c, completed: !c.completed } : c
                  ),
                }
              : i
          ),
        })),

      resetAssessment: () =>
        set((state) => ({
          ...state,
          isAssessed: false,
        })),

      reset: () => set(() => ({ ...initialState })),
    }),
    {
      name: "aarambh_enterprise_profile",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

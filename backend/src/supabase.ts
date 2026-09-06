import { createClient, SupabaseClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: "../../.env" });

const SUPABASE_URL = process.env.SUPABASE_URL || "";
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || "";

export const isSupabaseConfigured = Boolean(
  SUPABASE_URL &&
    SUPABASE_KEY &&
    SUPABASE_URL.startsWith("http") &&
    !SUPABASE_URL.includes("your-supabase")
);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(SUPABASE_URL, SUPABASE_KEY)
  : null;

if (isSupabaseConfigured) {
  console.log("✅ Supabase Realtime Client Connected:", SUPABASE_URL);
} else {
  console.log("ℹ️ Running in Local In-Memory Persistence Mode (Supabase URL not set). REST & Realtime emulation active.");
}

// In-Memory Database Store for robust local execution & demo persistence
export interface DbEnterprise {
  id: string;
  name: string;
  sector: string;
  location_zone: string;
  capex_cr: number;
  power_load_kva: number;
  water_demand_kld: number;
  workforce_size: number;
  risk_track: "green" | "orange" | "red";
  is_assessed: boolean;
  created_at: string;
  updated_at: string;
}

export interface DbDocument {
  id: string;
  enterprise_id: string;
  file_name: string;
  file_type: string;
  source: "UPLOAD" | "DIGILOCKER";
  verification_status: string;
  raw_text_snippet: string;
  created_at: string;
}

export interface DbExtractedField {
  id: string;
  enterprise_id: string;
  document_id: string;
  field_name: string;
  field_value: string;
  confidence_score: number;
  created_at: string;
}

export interface DbDagNode {
  id: string;
  enterprise_id: string;
  name: string;
  department: string;
  sla_days: number;
  status: "locked" | "active" | "approved";
  stage: string;
  updated_at: string;
}

export const localDb = {
  enterprises: new Map<string, DbEnterprise>(),
  documents: new Map<string, DbDocument>(),
  extractedFields: new Map<string, DbExtractedField>(),
  dagNodes: new Map<string, DbDagNode>(),
};

// Seed default enterprise and DAG nodes
const DEFAULT_ENT_ID = "ENT-MH-2026-8891";

localDb.enterprises.set(DEFAULT_ENT_ID, {
  id: DEFAULT_ENT_ID,
  name: "Maharashtra Solvents & Chemicals Pvt Ltd",
  sector: "Chemical Manufacturing",
  location_zone: "Chakan MIDC (Pune)",
  capex_cr: 35.0,
  power_load_kva: 250.0,
  water_demand_kld: 30.0,
  workforce_size: 120,
  risk_track: "red",
  is_assessed: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
});

export function initializeDagNodesForEnterprise(enterpriseId: string) {
  const initialNodes: DbDagNode[] = [
    {
      id: "node-root",
      enterprise_id: enterpriseId,
      name: "MIDC Land Allotment & Plan Approval",
      department: "Maharashtra Industrial Development Corporation (MIDC)",
      sla_days: 15,
      status: "active",
      stage: "Root (Stage 1)",
      updated_at: new Date().toISOString(),
    },
    {
      id: "node-mpcb",
      enterprise_id: enterpriseId,
      name: "MPCB Consent to Establish (CTE)",
      department: "Maharashtra Pollution Control Board",
      sla_days: 21,
      status: "locked",
      stage: "Parallel Clearances (Stage 2)",
      updated_at: new Date().toISOString(),
    },
    {
      id: "node-fire",
      enterprise_id: enterpriseId,
      name: "Provisional Fire Safety NOC",
      department: "State Directorate of Fire & Emergency Services",
      sla_days: 14,
      status: "locked",
      stage: "Parallel Clearances (Stage 2)",
      updated_at: new Date().toISOString(),
    },
    {
      id: "node-water",
      enterprise_id: enterpriseId,
      name: "Bulk Water Supply Allocation",
      department: "MIDC / Water Resources Department",
      sla_days: 7,
      status: "locked",
      stage: "Parallel Clearances (Stage 2)",
      updated_at: new Date().toISOString(),
    },
    {
      id: "node-dish",
      enterprise_id: enterpriseId,
      name: "Final Factory License & Safety Sign-off",
      department: "Directorate of Industrial Safety & Health (DISH)",
      sla_days: 15,
      status: "locked",
      stage: "Grandchild (Stage 3)",
      updated_at: new Date().toISOString(),
    },
  ];

  initialNodes.forEach((node) => {
    localDb.dagNodes.set(`${enterpriseId}:${node.id}`, node);
  });

  return initialNodes;
}

// Seed initial DAG for default enterprise
initializeDagNodesForEnterprise(DEFAULT_ENT_ID);
